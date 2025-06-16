import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
export class CreateCredentialTool extends BaseTool {
    name = 'credential_create';
    description = 'Create a new credential in n8n with encryption and validation';
    inputSchema = z.object({
        name: z.string().min(1).describe('Name for the credential'),
        type: z.string().min(1).describe('Type of credential (e.g., "httpBasicAuth", "apiKey", "oauth2")'),
        data: z.record(z.unknown()).describe('Credential data specific to the type'),
        nodesAccess: z.array(z.object({
            nodeType: z.string(),
            date: z.string().optional()
        })).optional().describe('Array of node types that can access this credential'),
        tags: z.array(z.string()).optional().describe('Tags to organize credentials')
    });
    async execute(params, context) {
        const input = this.validateInput(params);
        if (!context.apiClient) {
            throw new Error('n8n API client not configured');
        }
        try {
            // Validate credential type exists
            const credentialTypes = await context.apiClient.request('GET', '/credential-types');
            const validTypes = credentialTypes.data.map((ct) => ct.name);
            if (!validTypes.includes(input.type)) {
                throw new Error(`Invalid credential type "${input.type}". Valid types: ${validTypes.join(', ')}`);
            }
            // Create the credential
            const response = await context.apiClient.request('POST', '/credentials', {
                data: {
                    name: input.name,
                    type: input.type,
                    data: input.data,
                    nodesAccess: input.nodesAccess || [
                        {
                            nodeType: '*', // Allow all nodes by default
                            date: new Date().toISOString()
                        }
                    ]
                }
            });
            const result = {
                id: response.data.id,
                name: response.data.name,
                type: response.data.type,
                createdAt: response.data.createdAt,
                updatedAt: response.data.updatedAt,
                nodesAccess: response.data.nodesAccess,
                message: `Credential "${input.name}" created successfully`
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
            throw new Error(`Failed to create credential: ${errorMessage}`);
        }
    }
    getMetadata() {
        return {
            category: 'credential',
            isMutating: true,
            requirements: ['n8n API access'],
            tags: ['credential', 'security', 'create']
        };
    }
}
//# sourceMappingURL=CreateCredentialTool.js.map