import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
/**
 * Tool for deleting a workflow
 */
export class DeleteWorkflowTool extends BaseTool {
    name = 'workflow_delete';
    description = 'Delete a workflow permanently';
    inputSchema = z.object({
        id: z.string().describe('The workflow ID to delete'),
        force: z.boolean()
            .optional()
            .default(false)
            .describe('Force delete even if workflow is active'),
    });
    async execute(params, context) {
        const { id, force } = this.validateInput(params);
        if (!context.apiClient) {
            throw new Error('n8n API client not configured');
        }
        try {
            // Check if workflow is active before deleting
            if (!force) {
                const workflow = await context.apiClient.getWorkflow(id);
                if (workflow.active) {
                    throw new Error(`Workflow '${workflow.name}' (ID: ${id}) is currently active. ` +
                        'Deactivate it first or use force=true to delete anyway.');
                }
            }
            await context.apiClient.deleteWorkflow(id);
            return this.createTextResponse(`Workflow with ID '${id}' has been successfully deleted.`);
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
            tags: ['delete', 'workflow', 'destructive'],
            version: '1.0.0',
            isMutating: true,
        };
    }
}
//# sourceMappingURL=DeleteWorkflowTool.js.map