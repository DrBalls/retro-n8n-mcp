import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
/**
 * Tool for retrieving a single workflow by ID
 */
export class GetWorkflowTool extends BaseTool {
    name = 'workflow_get';
    description = 'Get a single workflow by ID with full details';
    inputSchema = z.object({
        id: z.string().describe('The workflow ID'),
        includeNodes: z.boolean()
            .optional()
            .default(true)
            .describe('Include workflow nodes and connections'),
    });
    async execute(params, context) {
        const { id, includeNodes } = this.validateInput(params);
        if (!context.apiClient) {
            throw new Error('n8n API client not configured');
        }
        try {
            const workflow = await context.apiClient.getWorkflow(id);
            // Optionally remove nodes if not requested
            const response = includeNodes ? workflow : {
                ...workflow,
                nodes: undefined,
                connections: undefined,
            };
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(response, null, 2),
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
            tags: ['read', 'workflow', 'details'],
            version: '1.0.0',
            isMutating: false,
        };
    }
}
//# sourceMappingURL=GetWorkflowTool.js.map