import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
import { ExecutionSchema } from '../../types/n8n.types.js';

export class MonitorExecutionTool extends BaseTool {
  name = 'monitor_execution';
  description = 'Monitor a workflow execution in real-time, providing updates on its progress';

  inputSchema = z.object({
    executionId: z.string().describe('ID of the execution to monitor'),
    pollInterval: z.number()
      .min(500)
      .max(30000)
      .default(2000)
      .describe('Polling interval in milliseconds'),
    maxDuration: z.number()
      .min(1000)
      .max(600000)
      .default(300000)
      .describe('Maximum monitoring duration in milliseconds'),
    includeNodeProgress: z.boolean()
      .default(true)
      .describe('Whether to include node execution progress'),
  });

  async execute(params: unknown, context: IToolContext): Promise<IToolResponse> {
    const input = this.validateInput<z.infer<typeof this.inputSchema>>(params);
    
    if (!context.apiClient) {
      throw new Error('n8n API client not configured');
    }

    try {
      const startTime = Date.now();
      const updates: Array<any> = [];
      let lastStatus: string | null = null;
      let lastNodeCount = 0;

      // Initial check
      const initialResponse = await context.apiClient.request(
        'GET',
        `/executions/${input.executionId}`,
        { params: { includeData: input.includeNodeProgress } }
      );

      const initialExecution = ExecutionSchema.parse(initialResponse);
      
      updates.push({
        timestamp: new Date().toISOString(),
        type: 'start',
        status: initialExecution.status,
        message: `Started monitoring execution ${input.executionId}`,
      });

      // If already finished, return immediately
      if (initialExecution.finished) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              executionId: initialExecution.id,
              status: initialExecution.status,
              monitoring: {
                duration: '0ms',
                updates: updates,
              },
              finalState: this.getExecutionSummary(initialExecution),
            }, null, 2),
            mimeType: 'application/json'
          }]
        };
      }

      // Monitor loop
      while (true) {
        // Check timeout
        if (Date.now() - startTime > input.maxDuration) {
          updates.push({
            timestamp: new Date().toISOString(),
            type: 'timeout',
            message: `Monitoring timed out after ${input.maxDuration}ms`,
          });
          break;
        }

        // Wait before polling
        await new Promise(resolve => setTimeout(resolve, input.pollInterval));

        // Get current status
        const response = await context.apiClient.request(
          'GET',
          `/executions/${input.executionId}`,
          { params: { includeData: input.includeNodeProgress } }
        );

        const execution = ExecutionSchema.parse(response);

        // Check for status changes
        if (execution.status !== lastStatus) {
          updates.push({
            timestamp: new Date().toISOString(),
            type: 'status_change',
            previousStatus: lastStatus,
            newStatus: execution.status,
            message: `Status changed from ${lastStatus || 'initial'} to ${execution.status}`,
          });
          lastStatus = execution.status;
        }

        // Check for node progress
        if (input.includeNodeProgress && execution.data?.resultData?.runData) {
          const currentNodeCount = Object.keys(execution.data.resultData.runData).length;
          if (currentNodeCount > lastNodeCount) {
            const newNodes = Object.keys(execution.data.resultData.runData)
              .slice(lastNodeCount);
            
            updates.push({
              timestamp: new Date().toISOString(),
              type: 'node_progress',
              executedNodes: currentNodeCount,
              newNodes: newNodes,
              lastNodeExecuted: execution.data.resultData.lastNodeExecuted,
              message: `Executed ${currentNodeCount} nodes (${newNodes.length} new)`,
            });
            lastNodeCount = currentNodeCount;
          }
        }

        // Check if finished
        if (execution.finished) {
          updates.push({
            timestamp: new Date().toISOString(),
            type: 'completed',
            status: execution.status,
            message: `Execution completed with status: ${execution.status}`,
          });

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                executionId: execution.id,
                status: execution.status,
                monitoring: {
                  duration: `${Date.now() - startTime}ms`,
                  pollCount: updates.filter(u => u.type !== 'start').length,
                  updates: updates,
                },
                finalState: this.getExecutionSummary(execution),
              }, null, 2),
              mimeType: 'application/json'
            }]
          };
        }
      }

      // Timeout reached
      const finalResponse = await context.apiClient.request(
        'GET',
        `/executions/${input.executionId}`
      );

      const finalExecution = ExecutionSchema.parse(finalResponse);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            executionId: finalExecution.id,
            status: finalExecution.status,
            monitoring: {
              duration: `${input.maxDuration}ms`,
              pollCount: updates.filter(u => u.type !== 'start').length,
              updates: updates,
              timedOut: true,
            },
            finalState: this.getExecutionSummary(finalExecution),
          }, null, 2),
          mimeType: 'application/json'
        }]
      };

    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid response format: ${error.message}`);
      }
      throw error;
    }
  }

  private getExecutionSummary(execution: z.infer<typeof ExecutionSchema>) {
    const summary: any = {
      id: execution.id,
      workflowId: execution.workflowId,
      status: execution.status,
      mode: execution.mode,
      startedAt: execution.startedAt,
      stoppedAt: execution.stoppedAt,
      finished: execution.finished,
    };

    if (execution.stoppedAt) {
      summary.duration = this.calculateDuration(execution.startedAt, execution.stoppedAt);
    }

    if (execution.data?.resultData?.runData) {
      summary.nodesExecuted = Object.keys(execution.data.resultData.runData).length;
      summary.lastNodeExecuted = execution.data.resultData.lastNodeExecuted;
    }

    return summary;
  }

  private calculateDuration(startedAt: string, stoppedAt: string): string {
    const start = new Date(startedAt).getTime();
    const stop = new Date(stoppedAt).getTime();
    const durationMs = stop - start;

    if (durationMs < 1000) {
      return `${durationMs}ms`;
    } else if (durationMs < 60000) {
      return `${(durationMs / 1000).toFixed(1)}s`;
    } else {
      return `${Math.floor(durationMs / 60000)}m ${Math.floor((durationMs % 60000) / 1000)}s`;
    }
  }

  getMetadata(): IToolMetadata {
    return {
      category: 'execution',
      isMutating: false,
      requirements: ['n8n API access'],
      tags: ['execution', 'monitor', 'real-time']
    };
  }
}