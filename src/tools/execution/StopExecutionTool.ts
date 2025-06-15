import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
import { ExecutionSchema } from '../../types/n8n.types.js';

export class StopExecutionTool extends BaseTool {
  name = 'stop_execution';
  description = 'Stop a running workflow execution';

  inputSchema = z.object({
    executionId: z.string().describe('ID of the execution to stop'),
    force: z.boolean()
      .default(false)
      .describe('Whether to force stop the execution (may leave workflow in inconsistent state)'),
  });

  async execute(params: unknown, context: IToolContext): Promise<IToolResponse> {
    const input = this.validateInput<z.infer<typeof this.inputSchema>>(params);
    
    if (!context.apiClient) {
      throw new Error('n8n API client not configured');
    }

    try {
      // First, check if the execution is actually running
      const executionResponse = await context.apiClient.request(
        'GET',
        `/executions/${input.executionId}`
      );

      const execution = ExecutionSchema.parse(executionResponse);

      // Check if execution is already finished
      if (execution.finished) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              executionId: execution.id,
              status: execution.status,
              message: `Execution ${execution.id} is already finished with status: ${execution.status}`,
              startedAt: execution.startedAt,
              stoppedAt: execution.stoppedAt,
            }, null, 2),
            mimeType: 'application/json'
          }]
        };
      }

      // Stop the execution
      const stopResponse = await context.apiClient.request(
        'POST',
        `/executions/${input.executionId}/stop`,
        {
          data: {
            force: input.force,
          },
        }
      );

      const stoppedExecution = ExecutionSchema.parse(stopResponse);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            executionId: stoppedExecution.id,
            status: stoppedExecution.status,
            message: `Execution ${stoppedExecution.id} stopped successfully`,
            startedAt: stoppedExecution.startedAt,
            stoppedAt: stoppedExecution.stoppedAt,
            forceStopped: input.force,
            duration: stoppedExecution.stoppedAt
              ? this.calculateDuration(stoppedExecution.startedAt, stoppedExecution.stoppedAt)
              : undefined,
          }, null, 2),
          mimeType: 'application/json'
        }]
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid response format: ${error.message}`);
      }
      // Handle specific API errors
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error(`Execution ${input.executionId} not found`);
      }
      if (error instanceof Error && error.message.includes('400')) {
        throw new Error(`Cannot stop execution ${input.executionId}: It may have already completed or failed`);
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
      tags: ['execution', 'stop', 'cancel']
    };
  }
}