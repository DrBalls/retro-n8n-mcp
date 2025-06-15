import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
/**
 * Tool for updating an existing workflow
 */
export class UpdateWorkflowTool extends BaseTool {
    name = 'workflow_update';
    description = 'Update an existing workflow configuration';
    inputSchema = z.object({
        id: z.string().describe('The workflow ID to update'),
        name: z.string()
            .optional()
            .describe('New workflow name'),
        active: z.boolean()
            .optional()
            .describe('Whether the workflow should be active'),
        nodes: z.array(z.any())
            .optional()
            .describe('Updated workflow nodes'),
        connections: z.any()
            .optional()
            .describe('Updated workflow connections'),
        settings: z.object({
            executionOrder: z.enum(['v0', 'v1']).optional(),
            saveDataSuccessExecution: z.enum(['all', 'none']).optional(),
            saveManualExecutions: z.boolean().optional(),
            saveExecutionProgress: z.boolean().optional(),
            executionTimeout: z.number().optional(),
            errorWorkflow: z.string().optional(),
            timezone: z.string().optional(),
            saveDataErrorExecution: z.enum(['all', 'none']).optional(),
            callerIds: z.string().optional(),
            callerPolicy: z.enum(['any', 'none', 'workflowsFromAList', 'workflowsFromSameOwner']).optional(),
        }).optional()
            .describe('Workflow execution settings'),
        staticData: z.any()
            .optional()
            .describe('Static data for the workflow'),
        tags: z.array(z.union([
            z.string(),
            z.object({
                id: z.string().optional(),
                name: z.string(),
            })
        ])).optional()
            .describe('Workflow tags'),
    });
    async execute(params, context) {
        const input = this.validateInput(params);
        const { id, ...updateData } = input;
        if (!context.apiClient) {
            throw new Error('n8n API client not configured');
        }
        try {
            // Transform tags if needed
            if (updateData.tags) {
                updateData.tags = updateData.tags.map(tag => typeof tag === 'string' ? { name: tag } : tag);
            }
            const workflow = await context.apiClient.updateWorkflow(id, updateData);
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            workflow: {
                                id: workflow.id,
                                name: workflow.name,
                                active: workflow.active,
                                createdAt: workflow.createdAt,
                                updatedAt: workflow.updatedAt,
                                nodes: workflow.nodes?.length || 0,
                                tags: workflow.tags,
                            },
                        }, null, 2),
                        mimeType: 'application/json'
                    }]
            };
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('404')) {
                throw new Error(`Workflow with ID '${id}' not found`);
            }
            throw error;
        }
    }
    getMetadata() {
        return {
            category: 'workflow',
            tags: ['update', 'workflow', 'configuration'],
            version: '1.0.0',
            isMutating: true,
        };
    }
}
//# sourceMappingURL=UpdateWorkflowTool.js.map