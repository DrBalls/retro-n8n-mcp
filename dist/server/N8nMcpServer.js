import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { z } from 'zod';
import { ListToolsRequestSchema, CallToolRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
export class N8nMcpServer {
    server;
    constructor() {
        this.server = new Server({
            name: 'n8n-mcp-server',
            version: '0.1.0',
        }, {
            capabilities: {
                tools: {},
                resources: {},
            },
        });
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
            // For now, just return a success message
            // In the future, this will actually test the n8n API connection
            return {
                content: [
                    {
                        type: 'text',
                        text: 'Connection test successful! n8n MCP server is running.',
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
            // Validate arguments
            const schema = z.object({
                active: z.boolean().optional(),
                limit: z.number().min(1).max(100).default(10),
            });
            const { active, limit } = schema.parse(args || {});
            // For now, return a mock response
            // In the future, this will call the n8n API
            const mockWorkflows = [
                { id: '1', name: 'Sample Workflow 1', active: true },
                { id: '2', name: 'Sample Workflow 2', active: false },
            ];
            const filtered = active !== undefined
                ? mockWorkflows.filter(w => w.active === active)
                : mockWorkflows;
            const limited = filtered.slice(0, limit);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(limited, null, 2),
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