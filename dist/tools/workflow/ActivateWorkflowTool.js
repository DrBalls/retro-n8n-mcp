import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
/**
 * Tool for activating a workflow
 */
export class ActivateWorkflowTool extends BaseTool {
    name = 'workflow_activate';
    description = 'Activate a workflow to enable automatic execution';
    inputSchema = z.object({
        id: z.string().describe('The workflow ID to activate'),
    });
    async execute(params, context) {
        const { id } = this.validateInput(params);
        if (!context.apiClient) {
            throw new Error('n8n API client not configured');
        }
        try {
            const workflow = await context.apiClient.activateWorkflow(id);
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            workflow: {
                                id: workflow.id,
                                name: workflow.name,
                                active: workflow.active,
                                activatedAt: new Date().toISOString(),
                            },
                            message: `Workflow '${workflow.name}' has been activated successfully.`,
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
                if (error.message.includes('already active')) {
                    throw new Error(`Workflow with ID '${id}' is already active`);
                }
            }
            throw error;
        }
    }
    getMetadata() {
        return {
            category: 'workflow',
            tags: ['activate', 'workflow', 'control'],
            version: '1.0.0',
            isMutating: true,
        };
    }
}
//# sourceMappingURL=ActivateWorkflowTool.js.map