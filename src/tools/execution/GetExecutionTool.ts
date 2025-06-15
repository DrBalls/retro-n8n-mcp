import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
import { ExecutionSchema } from '../../types/n8n.types.js';

export class GetExecutionTool extends BaseTool {
  name = 'get_execution';
  description = 'Get detailed information about a specific workflow execution';

  inputSchema = z.object({
    executionId: z.string().describe('ID of the execution to retrieve'),
    includeData: z.boolean()
      .default(true)
      .describe('Whether to include execution data in the response'),
  });

  async execute(params: unknown, context: IToolContext): Promise<IToolResponse> {
    const input = this.validateInput<z.infer<typeof this.inputSchema>>(params);
    
    if (!context.apiClient) {
      throw new Error('n8n API client not configured');
    }

    try {
      const response = await context.apiClient.request(
        'GET',
        `/executions/${input.executionId}`,
        {
          params: {
            includeData: input.includeData,
          },
        }
      );

      const execution = ExecutionSchema.parse(response);

      // Format the execution data for better readability
      const formattedExecution = {
        id: execution.id,
        workflowId: execution.workflowId,
        status: execution.status,
        mode: execution.mode,
        startedAt: execution.startedAt,
        stoppedAt: execution.stoppedAt,
        finished: execution.finished,
        retryOf: execution.retryOf,
        retrySuccessId: execution.retrySuccessId,
      };

      // Add execution data if requested and available
      if (input.includeData && execution.data) {
        const executionData = {
          startData: execution.data.startData,
          lastNodeExecuted: execution.data.resultData?.lastNodeExecuted,
          nodeExecutionCount: execution.data.resultData?.runData
            ? Object.keys(execution.data.resultData.runData).length
            : 0,
          nodeExecutions: execution.data.resultData?.runData
            ? Object.entries(execution.data.resultData.runData).map(([nodeId, data]) => ({
                nodeId,
                executionCount: Array.isArray(data) ? data.length : 1,
              }))
            : [],
        };

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              ...formattedExecution,
              executionData,
              // Include raw data if needed for debugging
              rawData: execution.data,
            }, null, 2),
            mimeType: 'application/json'
          }]
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(formattedExecution, null, 2),
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

  getMetadata(): IToolMetadata {
    return {
      category: 'execution',
      isMutating: false,
      requirements: ['n8n API access'],
      tags: ['execution', 'get', 'details']
    };
  }
}