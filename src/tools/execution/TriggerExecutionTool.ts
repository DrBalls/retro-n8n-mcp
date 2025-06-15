import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
import { ExecutionSchema } from '../../types/n8n.types.js';

export class TriggerExecutionTool extends BaseTool {
  name = 'trigger_execution';
  description = 'Trigger a workflow execution with optional input data';

  inputSchema = z.object({
    workflowId: z.string().describe('ID of the workflow to execute'),
    inputData: z.record(z.unknown()).optional().describe('Optional input data for the workflow'),
    runMode: z.enum(['manual', 'trigger', 'webhook', 'retry', 'integrated', 'cli'])
      .default('manual')
      .describe('Execution mode'),
    waitForCompletion: z.boolean()
      .default(false)
      .describe('Whether to wait for the execution to complete before returning'),
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
      // Prepare execution data
      const executionData = {
        workflowId: input.workflowId,
        mode: input.runMode,
        data: input.inputData ? {
          startData: input.inputData
        } : undefined,
      };

      // Trigger the execution
      const response = await context.apiClient.request(
        'POST',
        '/executions',
        { data: executionData }
      );

      const execution = ExecutionSchema.parse(response);

      // If not waiting for completion, return immediately
      if (!input.waitForCompletion) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              executionId: execution.id,
              status: execution.status,
              message: `Workflow execution ${execution.id} triggered successfully`,
              startedAt: execution.startedAt,
              mode: execution.mode,
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
                executionId: execution.id,
                status: 'timeout',
                message: `Execution ${execution.id} timed out after ${timeout}ms`,
                startedAt: execution.startedAt,
              }, null, 2),
              mimeType: 'application/json'
            }]
          };
        }

        // Get execution status
        const statusResponse = await context.apiClient.request(
          'GET',
          `/executions/${execution.id}`
        );

        const currentExecution = ExecutionSchema.parse(statusResponse);

        // Check if execution is complete
        if (currentExecution.finished) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                executionId: currentExecution.id,
                status: currentExecution.status,
                message: `Workflow execution ${currentExecution.id} completed with status: ${currentExecution.status}`,
                startedAt: currentExecution.startedAt,
                stoppedAt: currentExecution.stoppedAt,
                mode: currentExecution.mode,
                data: currentExecution.data,
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
      throw error;
    }
  }

  getMetadata(): IToolMetadata {
    return {
      category: 'execution',
      isMutating: true,
      requirements: ['n8n API access'],
      tags: ['execution', 'trigger', 'workflow']
    };
  }
}