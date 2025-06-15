import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
import { ExecutionSchema } from '../../types/n8n.types.js';

export class ReplayExecutionTool extends BaseTool {
  name = 'replay_execution';
  description = 'Replay a previous workflow execution with the same or modified input data';

  inputSchema = z.object({
    executionId: z.string().describe('ID of the execution to replay'),
    modifyData: z.record(z.unknown())
      .optional()
      .describe('Optional modifications to the original input data'),
    waitForCompletion: z.boolean()
      .default(true)
      .describe('Whether to wait for the replay to complete'),
    timeout: z.number()
      .optional()
      .describe('Timeout in milliseconds when waiting for completion'),
  });

  async execute(params: unknown, context: IToolContext): Promise<IToolResponse> {
    const input = this.validateInput<z.infer<typeof this.inputSchema>>(params);
    
    if (!context.apiClient) {
      throw new Error('n8n API client not configured');
    }

    try {
      // First, get the original execution details
      const originalResponse = await context.apiClient.request(
        'GET',
        `/executions/${input.executionId}`,
        { params: { includeData: true } }
      );

      const originalExecution = ExecutionSchema.parse(originalResponse);

      // Prepare replay data
      const replayData: any = {
        workflowId: originalExecution.workflowId,
        mode: 'retry',
        retryOf: input.executionId,
      };

      // Merge original data with modifications
      if (originalExecution.data?.startData || input.modifyData) {
        const startData = {
          ...(originalExecution.data?.startData || {}),
          ...(input.modifyData || {}),
        };
        replayData.data = { startData };
      }

      // Trigger the replay
      const replayResponse = await context.apiClient.request(
        'POST',
        '/executions',
        { data: replayData }
      );

      const replayExecution = ExecutionSchema.parse(replayResponse);

      // If not waiting for completion, return immediately
      if (!input.waitForCompletion) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              originalExecutionId: input.executionId,
              replayExecutionId: replayExecution.id,
              status: replayExecution.status,
              message: `Execution replay ${replayExecution.id} triggered successfully`,
              startedAt: replayExecution.startedAt,
              mode: replayExecution.mode,
              dataModified: !!input.modifyData,
            }, null, 2),
            mimeType: 'application/json'
          }]
        };
      }

      // Wait for completion with polling
      const startTime = Date.now();
      const timeout = input.timeout || 300000; // Default 5 minutes
      const pollInterval = 1000; // Poll every second

      while (true) {
        // Check timeout
        if (Date.now() - startTime > timeout) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                originalExecutionId: input.executionId,
                replayExecutionId: replayExecution.id,
                status: 'timeout',
                message: `Replay execution ${replayExecution.id} timed out after ${timeout}ms`,
                startedAt: replayExecution.startedAt,
              }, null, 2),
              mimeType: 'application/json'
            }]
          };
        }

        // Get execution status
        const statusResponse = await context.apiClient.request(
          'GET',
          `/executions/${replayExecution.id}`,
          { params: { includeData: true } }
        );

        const currentExecution = ExecutionSchema.parse(statusResponse);

        // Check if execution is complete
        if (currentExecution.finished) {
          // Compare with original execution
          const comparison = {
            originalStatus: originalExecution.status,
            replayStatus: currentExecution.status,
            statusMatch: originalExecution.status === currentExecution.status,
            originalDuration: originalExecution.stoppedAt
              ? this.calculateDuration(originalExecution.startedAt, originalExecution.stoppedAt)
              : 'N/A',
            replayDuration: currentExecution.stoppedAt
              ? this.calculateDuration(currentExecution.startedAt, currentExecution.stoppedAt)
              : 'N/A',
          };

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                originalExecutionId: input.executionId,
                replayExecutionId: currentExecution.id,
                status: currentExecution.status,
                message: `Replay execution ${currentExecution.id} completed with status: ${currentExecution.status}`,
                startedAt: currentExecution.startedAt,
                stoppedAt: currentExecution.stoppedAt,
                dataModified: !!input.modifyData,
                comparison,
                retrySuccessId: currentExecution.retrySuccessId,
              }, null, 2),
              mimeType: 'application/json'
            }]
          };
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid response format: ${error.message}`);
      }
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error(`Execution ${input.executionId} not found`);
      }
      throw error;
    }
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
      isMutating: true,
      requirements: ['n8n API access'],
      tags: ['execution', 'replay', 'retry']
    };
  }
}