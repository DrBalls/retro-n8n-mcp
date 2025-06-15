import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
import { N8nApiClient } from '../../services/N8nApiClient.js';

/**
 * Input schema for listing workflows
 */
const ListWorkflowsSchema = z.object({
  active: z.boolean().optional().describe('Filter by active status'),
  limit: z.number().min(1).max(100).default(10).describe('Maximum number of workflows to return'),
  cursor: z.string().optional().describe('Pagination cursor'),
  tags: z.array(z.string()).optional().describe('Filter by workflow tags'),
});

type ListWorkflowsInput = z.infer<typeof ListWorkflowsSchema>;

/**
 * Tool for listing workflows from n8n
 */
export class ListWorkflowsTool extends BaseTool {
  readonly name = 'workflow_list';
  readonly description = 'List workflows from n8n with optional filters';
  readonly inputSchema = ListWorkflowsSchema;

  async execute(params: unknown, context: IToolContext): Promise<IToolResponse> {
    try {
      // Validate input
      const input = this.validateInput<ListWorkflowsInput>(params);

      // Check if API client is available
      if (!context.apiClient) {
        return this.createErrorResponse('n8n API client not configured');
      }

      const apiClient = context.apiClient as N8nApiClient;

      // Fetch workflows
      const response = await apiClient.getWorkflows({
        ...(input.active !== undefined && { active: input.active }),
        limit: input.limit,
        ...(input.cursor && { cursor: input.cursor }),
        ...(input.tags && { tags: input.tags }),
      });

      // Format response
      const workflows = response.data.map(workflow => ({
        id: workflow.id,
        name: workflow.name,
        active: workflow.active,
        tags: workflow.tags,
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt,
        nodeCount: workflow.nodes.length,
        ...(workflow.settings && {
          settings: {
            executionOrder: workflow.settings['executionOrder'],
            saveManualExecutions: workflow.settings['saveManualExecutions'],
            errorWorkflow: workflow.settings['errorWorkflow'],
          },
        }),
      }));

      // Create response
      return this.createTextResponse(
        JSON.stringify(
          {
            workflows,
            pagination: {
              cursor: response.nextCursor,
              hasMore: !!response.nextCursor,
              total: workflows.length,
            },
          },
          null,
          2
        ),
        {
          count: workflows.length,
          hasMore: !!response.nextCursor,
        }
      );
    } catch (error) {
      return this.createErrorResponse(error as Error);
    }
  }

  isAvailable(): boolean {
    // This tool requires an API client
    return true; // Will check in execute
  }

  getMetadata(): IToolMetadata {
    return {
      category: 'workflow',
      tags: ['list', 'read', 'workflows'],
      version: '1.0.0',
      isMutating: false,
      requirements: ['apiClient'],
    };
  }
}