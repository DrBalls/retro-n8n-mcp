import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
import { ExecutionListResponseSchema, ExecutionStatusSchema } from '../../types/n8n.types.js';

export class ListExecutionsTool extends BaseTool {
  name = 'list_executions';
  description = 'List workflow executions with filtering and pagination options';

  inputSchema = z.object({
    workflowId: z.string().optional().describe('Filter by workflow ID'),
    status: ExecutionStatusSchema.optional().describe('Filter by execution status'),
    limit: z.number().min(1).max(100).default(50).describe('Number of executions to return'),
    cursor: z.string().optional().describe('Pagination cursor for next page'),
    startDate: z.string().datetime().optional().describe('Filter executions started after this date'),
    endDate: z.string().datetime().optional().describe('Filter executions started before this date'),
    includeData: z.boolean().default(false).describe('Whether to include execution data'),
  });

  async execute(params: unknown, context: IToolContext): Promise<IToolResponse> {
    const input = this.validateInput<z.infer<typeof this.inputSchema>>(params);
    
    if (!context.apiClient) {
      throw new Error('n8n API client not configured');
    }

    try {
      // Build query parameters
      const params: Record<string, any> = {
        limit: input.limit,
        includeData: input.includeData,
      };

      if (input.workflowId) params['workflowId'] = input.workflowId;
      if (input.status) params['status'] = input.status;
      if (input.cursor) params['cursor'] = input.cursor;
      if (input.startDate) params['startDate'] = input.startDate;
      if (input.endDate) params['endDate'] = input.endDate;

      const response = await context.apiClient.request(
        'GET',
        '/executions',
        { params }
      );

      const executionList = ExecutionListResponseSchema.parse(response);

      // Format executions for better readability
      const formattedExecutions = executionList.data.map(execution => ({
        id: execution.id,
        workflowId: execution.workflowId,
        status: execution.status,
        mode: execution.mode,
        startedAt: execution.startedAt,
        stoppedAt: execution.stoppedAt,
        finished: execution.finished,
        duration: execution.stoppedAt
          ? this.calculateDuration(execution.startedAt, execution.stoppedAt)
          : 'Running',
        retryOf: execution.retryOf,
      }));

      // Group executions by status for summary
      const statusSummary = formattedExecutions.reduce((acc, exec) => {
        acc[exec.status] = (acc[exec.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const result = {
        executions: formattedExecutions,
        summary: {
          total: formattedExecutions.length,
          byStatus: statusSummary,
        },
        pagination: {
          hasMore: !!executionList.nextCursor,
          nextCursor: executionList.nextCursor,
        },
      };

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2),
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

  private calculateDuration(startedAt: string, stoppedAt: string): string {
    const start = new Date(startedAt).getTime();
    const stop = new Date(stoppedAt).getTime();
    const durationMs = stop - start;

    if (durationMs < 1000) {
      return `${durationMs}ms`;
    } else if (durationMs < 60000) {
      return `${(durationMs / 1000).toFixed(1)}s`;
    } else if (durationMs < 3600000) {
      return `${Math.floor(durationMs / 60000)}m ${Math.floor((durationMs % 60000) / 1000)}s`;
    } else {
      return `${Math.floor(durationMs / 3600000)}h ${Math.floor((durationMs % 3600000) / 60000)}m`;
    }
  }

  getMetadata(): IToolMetadata {
    return {
      category: 'execution',
      isMutating: false,
      requirements: ['n8n API access'],
      tags: ['execution', 'list', 'history']
    };
  }
}