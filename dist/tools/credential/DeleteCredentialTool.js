import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
export class DeleteCredentialTool extends BaseTool {
    name = 'credential_delete';
    description = 'Delete a credential permanently from n8n';
    inputSchema = z.object({
        id: z.string().min(1).describe('ID of the credential to delete'),
        force: z.boolean().optional().describe('Force deletion even if credential is in use')
    });
    async execute(params, context) {
        const input = this.validateInput(params);
        if (!context.apiClient) {
            throw new Error('n8n API client not configured');
        }
        try {
            // Get credential details first for confirmation
            const credential = await context.apiClient.request('GET', `/credentials/${input.id}`);
            // Check if credential is in use by any workflows
            if (!input.force) {
                const workflows = await context.apiClient.request('GET', '/workflows', {
                    params: {
                        active: true
                    }
                });
                const inUse = workflows.data.some((workflow) => {
                    const nodes = workflow.nodes || [];
                    return nodes.some((node) => node.credentials &&
                        Object.values(node.credentials).some((cred) => cred.id === input.id));
                });
                if (inUse) {
                    throw new Error(`Credential "${credential.data.name}" is in use by active workflows. ` +
                        `Set force=true to delete anyway.`);
                }
            }
            // Delete the credential
            await context.apiClient.request('DELETE', `/credentials/${input.id}`);
            const result = {
                id: input.id,
                name: credential.data.name,
                type: credential.data.type,
                deletedAt: new Date().toISOString(),
                message: `Credential "${credential.data.name}" deleted successfully`
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
            throw new Error(`Failed to delete credential: ${errorMessage}`);
        }
    }
    getMetadata() {
        return {
            category: 'credential',
            isMutating: true,
            requirements: ['n8n API access'],
            tags: ['credential', 'security', 'delete']
        };
    }
}
//# sourceMappingURL=DeleteCredentialTool.js.map