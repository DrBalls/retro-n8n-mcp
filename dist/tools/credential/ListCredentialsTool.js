import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
export class ListCredentialsTool extends BaseTool {
    name = 'credential_list';
    description = 'List all credentials with filtering options';
    inputSchema = z.object({
        type: z.string().optional().describe('Filter by credential type'),
        search: z.string().optional().describe('Search in credential names'),
        tags: z.array(z.string()).optional().describe('Filter by tags'),
        includeData: z.boolean().optional().describe('Include credential data (sensitive)')
    });
    async execute(params, context) {
        const input = this.validateInput(params);
        if (!context.apiClient) {
            throw new Error('n8n API client not configured');
        }
        try {
            // Get all credentials
            const response = await context.apiClient.request('GET', '/credentials', {
                params: {
                    includeData: input.includeData || false
                }
            });
            let credentials = response.data || [];
            // Apply filters
            if (input.type) {
                credentials = credentials.filter((cred) => cred.type === input.type);
            }
            if (input.search) {
                const searchLower = input.search.toLowerCase();
                credentials = credentials.filter((cred) => cred.name.toLowerCase().includes(searchLower));
            }
            if (input.tags && input.tags.length > 0) {
                credentials = credentials.filter((cred) => {
                    const credTags = cred.tags || [];
                    return input.tags.some(tag => credTags.includes(tag));
                });
            }
            // Map credentials to safe format
            const mappedCredentials = credentials.map((cred) => ({
                id: cred.id,
                name: cred.name,
                type: cred.type,
                createdAt: cred.createdAt,
                updatedAt: cred.updatedAt,
                nodesAccess: cred.nodesAccess,
                tags: cred.tags || [],
                // Only include data if explicitly requested
                ...(input.includeData && cred.data ? { data: cred.data } : {})
            }));
            // Group by type for better overview
            const groupedByType = mappedCredentials.reduce((acc, cred) => {
                if (!acc[cred.type]) {
                    acc[cred.type] = [];
                }
                acc[cred.type].push(cred);
                return acc;
            }, {});
            const result = {
                total: mappedCredentials.length,
                credentials: mappedCredentials,
                byType: groupedByType,
                types: Object.keys(groupedByType)
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
            throw new Error(`Failed to list credentials: ${errorMessage}`);
        }
    }
    getMetadata() {
        return {
            category: 'credential',
            isMutating: false,
            requirements: ['n8n API access'],
            tags: ['credential', 'security', 'list']
        };
    }
}
//# sourceMappingURL=ListCredentialsTool.js.map