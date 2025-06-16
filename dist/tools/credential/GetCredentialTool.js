import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
export class GetCredentialTool extends BaseTool {
    name = 'credential_get';
    description = 'Get detailed information about a specific credential';
    inputSchema = z.object({
        id: z.string().min(1).describe('ID of the credential to retrieve'),
        includeData: z.boolean().optional().describe('Include sensitive credential data')
    });
    async execute(params, context) {
        const input = this.validateInput(params);
        if (!context.apiClient) {
            throw new Error('n8n API client not configured');
        }
        try {
            // Get credential details
            const response = await context.apiClient.request('GET', `/credentials/${input.id}`, {
                params: {
                    includeData: input.includeData || false
                }
            });
            const credential = response.data;
            // Get usage information
            const workflows = await context.apiClient.request('GET', '/workflows');
            const usage = workflows.data.reduce((acc, workflow) => {
                const nodes = workflow.nodes || [];
                const usingNodes = nodes.filter((node) => node.credentials &&
                    Object.values(node.credentials).some((cred) => cred.id === input.id));
                if (usingNodes.length > 0) {
                    acc.push({
                        workflowId: workflow.id,
                        workflowName: workflow.name,
                        active: workflow.active,
                        nodes: usingNodes.map((node) => ({
                            name: node.name,
                            type: node.type
                        }))
                    });
                }
                return acc;
            }, []);
            const result = {
                id: credential.id,
                name: credential.name,
                type: credential.type,
                createdAt: credential.createdAt,
                updatedAt: credential.updatedAt,
                nodesAccess: credential.nodesAccess,
                tags: credential.tags || [],
                usage: {
                    totalWorkflows: usage.length,
                    activeWorkflows: usage.filter((u) => u.active).length,
                    workflows: usage
                },
                // Only include data if explicitly requested
                ...(input.includeData && credential.data ? { data: credential.data } : {})
            };
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(result, null, 2),
                        mimeType: 'application/json'
                    }]
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to get credential: ${errorMessage}`);
        }
    }
    getMetadata() {
        return {
            category: 'credential',
            isMutating: false,
            requirements: ['n8n API access'],
            tags: ['credential', 'security', 'get']
        };
    }
}
//# sourceMappingURL=GetCredentialTool.js.map