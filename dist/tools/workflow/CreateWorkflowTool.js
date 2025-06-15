import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
/**
 * Input schema for creating a workflow
 */
const CreateWorkflowSchema = z.object({
    name: z.string().min(1).describe('Workflow name'),
    nodes: z.array(z.object({
        name: z.string().describe('Node name'),
        type: z.string().describe('Node type (e.g., "n8n-nodes-base.start")'),
        position: z.array(z.number()).length(2).describe('Node position [x, y]'),
        parameters: z.record(z.unknown()).optional().describe('Node parameters'),
        typeVersion: z.number().optional().describe('Node type version'),
    })).min(1).describe('Workflow nodes'),
    connections: z.record(z.record(z.array(z.array(z.object({
        node: z.string().describe('Target node name'),
        type: z.string().describe('Connection type'),
        index: z.number().describe('Connection index'),
    }))))).optional().describe('Node connections'),
    settings: z.object({
        executionOrder: z.enum(['v0', 'v1']).optional(),
        saveManualExecutions: z.boolean().optional(),
        errorWorkflow: z.string().optional(),
        timezone: z.string().optional(),
    }).optional().describe('Workflow settings'),
    active: z.boolean().default(false).describe('Whether to activate the workflow'),
    tags: z.array(z.string()).optional().describe('Workflow tags'),
});
/**
 * Tool for creating new workflows in n8n
 */
export class CreateWorkflowTool extends BaseTool {
    name = 'workflow_create';
    description = 'Create a new workflow in n8n';
    inputSchema = CreateWorkflowSchema;
    async execute(params, context) {
        try {
            // Validate input
            const input = this.validateInput(params);
            // Check if API client is available
            if (!context.apiClient) {
                return this.createErrorResponse('n8n API client not configured');
            }
            const apiClient = context.apiClient;
            // Transform nodes to n8n format
            const nodes = input.nodes.map((node, index) => ({
                id: `node_${index}`,
                name: node.name,
                type: node.type,
                typeVersion: node.typeVersion || 1,
                position: node.position,
                parameters: node.parameters || {},
            }));
            // Transform connections to n8n format (simplified)
            const connections = {};
            if (input.connections) {
                // For now, pass through connections as-is
                // TODO: Implement proper connection transformation
                Object.assign(connections, input.connections);
            }
            // Create workflow
            const workflow = await apiClient.createWorkflow({
                name: input.name,
                nodes: nodes, // Type assertion for now
                connections: connections, // Type assertion for now
                settings: input.settings || {},
                active: input.active,
                tags: input.tags,
            });
            // Create response
            return this.createTextResponse(JSON.stringify({
                success: true,
                workflow: {
                    id: workflow.id,
                    name: workflow.name,
                    active: workflow.active,
                    createdAt: workflow.createdAt,
                    updatedAt: workflow.updatedAt,
                    url: workflow.id ? `${context.metadata?.['baseUrl'] || ''}/workflow/${workflow.id}` : undefined,
                },
            }, null, 2), {
                workflowId: workflow.id,
                active: workflow.active,
            });
        }
        catch (error) {
            return this.createErrorResponse(error);
        }
    }
    getMetadata() {
        return {
            category: 'workflow',
            tags: ['create', 'write', 'workflows'],
            version: '1.0.0',
            isMutating: true,
            requirements: ['apiClient'],
        };
    }
}
//# sourceMappingURL=CreateWorkflowTool.js.map