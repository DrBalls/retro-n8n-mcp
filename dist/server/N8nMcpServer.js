import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { z } from 'zod';
import { ListToolsRequestSchema, CallToolRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { N8nApiClient } from '../services/N8nApiClient.js';
export class N8nMcpServer {
    server;
    apiClient = null;
    constructor(apiConfig) {
        this.server = new Server({
            name: 'n8n-mcp-server',
            version: '0.1.0',
        }, {
            capabilities: {
                tools: {},
                resources: {},
            },
        });
        // Initialize API client if config provided
        if (apiConfig?.baseUrl && apiConfig?.apiKey) {
            this.apiClient = new N8nApiClient(apiConfig);
        }
        this.setupHandlers();
    }
    setupHandlers() {
        // Handle list tools request
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: this.getAvailableTools(),
            };
        });
        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            switch (name) {
                case 'workflow_list':
                    return await this.handleWorkflowList(args);
                case 'test_connection':
                    return await this.handleTestConnection();
                default:
                    throw new Error(`Unknown tool: ${name}`);
            }
        });
    }
    getAvailableTools() {
        return [
            {
                name: 'test_connection',
                description: 'Test connection to n8n instance',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    required: [],
                },
            },
            {
                name: 'workflow_list',
                description: 'List all workflows in the n8n instance',
                inputSchema: {
                    type: 'object',
                    properties: {
                        active: {
                            type: 'boolean',
                            description: 'Filter by active status',
                        },
                        limit: {
                            type: 'number',
                            description: 'Maximum number of workflows to return',
                            default: 10,
                        },
                    },
                    required: [],
                },
            },
        ];
    }
    async handleTestConnection() {
        try {
            if (!this.apiClient) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: 'n8n API client not configured. Please set N8N_API_URL and N8N_API_KEY environment variables.',
                        },
                    ],
                };
            }
            const result = await this.apiClient.testConnection();
            return {
                content: [
                    {
                        type: 'text',
                        text: result.connected
                            ? 'Connection test successful! Connected to n8n instance.'
                            : 'Connection test failed. Please check your configuration.',
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    },
                ],
            };
        }
    }
    async handleWorkflowList(args) {
        try {
            if (!this.apiClient) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: 'n8n API client not configured. Please set N8N_API_URL and N8N_API_KEY environment variables.',
                        },
                    ],
                };
            }
            // Validate arguments
            const schema = z.object({
                active: z.boolean().optional(),
                limit: z.number().min(1).max(100).default(10),
                tags: z.array(z.string()).optional(),
            });
            const { active, limit, tags } = schema.parse(args || {});
            // Call n8n API
            const response = await this.apiClient.getWorkflows({
                ...(active !== undefined && { active }),
                limit,
                ...(tags && { tags }),
            });
            // Format response
            const workflows = response.data.map(workflow => ({
                id: workflow.id,
                name: workflow.name,
                active: workflow.active,
                tags: workflow.tags,
                createdAt: workflow.createdAt,
                updatedAt: workflow.updatedAt,
                nodeCount: workflow.nodes.length,
            }));
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(workflows, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error listing workflows: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    },
                ],
            };
        }
    }
    async connect(transport) {
        await this.server.connect(transport);
    }
    async close() {
        await this.server.close();
    }
}
//# sourceMappingURL=N8nMcpServer.js.map