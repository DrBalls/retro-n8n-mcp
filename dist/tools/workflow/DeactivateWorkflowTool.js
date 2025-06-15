import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
/**
 * Tool for deactivating a workflow
 */
export class DeactivateWorkflowTool extends BaseTool {
    name = 'workflow_deactivate';
    description = 'Deactivate a workflow to stop automatic execution';
    inputSchema = z.object({
        id: z.string().describe('The workflow ID to deactivate'),
    });
    async execute(params, context) {
        const { id } = this.validateInput(params);
        if (!context.apiClient) {
            throw new Error('n8n API client not configured');
        }
        try {
            const workflow = await context.apiClient.deactivateWorkflow(id);
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            workflow: {
                                id: workflow.id,
                                name: workflow.name,
                                active: workflow.active,
                                deactivatedAt: new Date().toISOString(),
                            },
                            message: `Workflow '${workflow.name}' has been deactivated successfully.`,
                        }, null, 2),
                        mimeType: 'application/json'
                    }]
            };
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('404')) {
                    throw new Error(`Workflow with ID '${id}' not found`);
                }
                if (error.message.includes('already inactive')) {
                    throw new Error(`Workflow with ID '${id}' is already inactive`);
                }
            }
            throw error;
        }
    }
    getMetadata() {
        return {
            category: 'workflow',
            tags: ['deactivate', 'workflow', 'control'],
            version: '1.0.0',
            isMutating: true,
        };
    }
}
//# sourceMappingURL=DeactivateWorkflowTool.js.map