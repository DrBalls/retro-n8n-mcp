import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { z } from 'zod';
import { 
  ListToolsRequestSchema,
  CallToolRequestSchema,
  Tool,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { N8nApiClient } from '../services/N8nApiClient.js';
import { N8nApiConfig } from '../types/config.types.js';
import { 
  N8nApiError, 
  N8nAuthenticationError, 
  N8nConnectionError,
  N8nRateLimitError,
} from '../utils/errors.js';

export class N8nMcpServer {
  private server: Server;
  private apiClient: N8nApiClient | null = null;
  private isConnected = false;
  private startTime: Date;
  private requestCount = 0;
  private errorCount = 0;

  constructor(apiConfig?: Partial<N8nApiConfig>) {
    this.startTime = new Date();
    
    this.server = new Server(
      {
        name: 'n8n-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      },
    );

    // Log server initialization
    this.log('info', 'Initializing n8n MCP server');

    // Initialize API client if config provided
    if (apiConfig?.baseUrl && apiConfig?.apiKey) {
      try {
        this.apiClient = new N8nApiClient(apiConfig);
        this.log('info', 'n8n API client initialized successfully');
      } catch (error) {
        this.log('error', 'Failed to initialize n8n API client', error);
      }
    } else {
      this.log('warn', 'n8n API client not configured - some features will be unavailable');
    }

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupHandlers(): void {
    // Handle list tools request
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      this.requestCount++;
      this.log('debug', 'Handling list tools request');
      
      try {
        return {
          tools: this.getAvailableTools(),
        };
      } catch (error) {
        this.errorCount++;
        this.log('error', 'Failed to list tools', error);
        throw this.createMcpError(error);
      }
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      this.requestCount++;
      const { name, arguments: args } = request.params;
      this.log('debug', `Handling tool call: ${name}`, args);

      try {
        let result;
        switch (name) {
          case 'workflow_list':
            result = await this.handleWorkflowList(args);
            break;
          case 'test_connection':
            result = await this.handleTestConnection();
            break;
          case 'server_health':
            result = await this.handleServerHealth();
            break;
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
        this.log('debug', `Tool call ${name} completed`, result);
        return result;
      } catch (error) {
        this.errorCount++;
        this.log('error', `Tool call failed: ${name}`, {
          error: error instanceof Error ? {
            message: error.message,
            stack: error.stack,
            name: error.name
          } : error
        });
        throw this.createMcpError(error);
      }
    });
  }

  private setupErrorHandling(): void {
    // Handle server errors
    this.server.onerror = (error) => {
      this.errorCount++;
      this.log('error', 'MCP server error', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : error
      });
    };
    
    // Handle uncaught errors in async operations
    process.on('unhandledRejection', (reason, promise) => {
      this.log('error', 'Unhandled promise rejection', { reason, promise });
    });
  }

  private createMcpError(error: unknown): McpError {
    if (error instanceof McpError) {
      return error;
    }

    if (error instanceof N8nAuthenticationError) {
      return new McpError(
        ErrorCode.InvalidRequest,
        'Authentication failed. Please check your n8n API key.'
      );
    }

    if (error instanceof N8nRateLimitError) {
      return new McpError(
        ErrorCode.InternalError,
        `Rate limit exceeded. Retry after ${error.retryAfter}ms`
      );
    }

    if (error instanceof N8nConnectionError) {
      return new McpError(
        ErrorCode.InternalError,
        'Failed to connect to n8n instance'
      );
    }

    if (error instanceof N8nApiError) {
      return new McpError(
        ErrorCode.InternalError,
        `n8n API error: ${error.message}`
      );
    }

    return new McpError(
      ErrorCode.InternalError,
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }

  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: unknown): void {
    const timestamp = new Date().toISOString();
    const logData = data ? ` ${JSON.stringify(data)}` : '';
    console.error(`[${timestamp}] [${level.toUpperCase()}] ${message}${logData}`);
  }

  private getAvailableTools(): Tool[] {
    const tools: Tool[] = [
      {
        name: 'server_health',
        description: 'Get the health status of the MCP server',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
    ];

    // Only include n8n tools if API client is configured
    if (this.apiClient) {
      tools.push(
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
              tags: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'Filter by workflow tags',
              },
            },
            required: [],
          },
        }
      );
    }

    return tools;
  }

  private async handleTestConnection() {
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
    } catch (error) {
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

  private async handleWorkflowList(args: unknown) {
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
    } catch (error) {
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

  private async handleServerHealth() {
    const uptime = Date.now() - this.startTime.getTime();
    const health = {
      status: 'healthy',
      version: '0.1.0',
      uptime: Math.floor(uptime / 1000),
      isConnected: this.isConnected,
      apiClientConfigured: this.apiClient !== null,
      stats: {
        totalRequests: this.requestCount,
        totalErrors: this.errorCount,
        errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0,
      },
      apiClient: this.apiClient ? {
        cacheStats: this.apiClient.getCacheStats(),
        queueStats: this.apiClient.getQueueStats(),
      } : null,
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(health, null, 2),
        },
      ],
    };
  }

  async connect(transport: any): Promise<void> {
    try {
      this.log('info', 'Connecting to MCP transport');
      await this.server.connect(transport);
      this.isConnected = true;
      this.log('info', 'Successfully connected to MCP transport');
    } catch (error) {
      this.isConnected = false;
      this.log('error', 'Failed to connect to MCP transport', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      this.log('info', 'Closing MCP server');
      this.isConnected = false;
      await this.server.close();
      this.log('info', 'MCP server closed successfully');
    } catch (error) {
      this.log('error', 'Error closing MCP server', error);
      throw error;
    }
  }

  // Public methods for server management
  getUptime(): number {
    return Date.now() - this.startTime.getTime();
  }

  getStats(): { totalRequests: number; totalErrors: number; errorRate: number } {
    return {
      totalRequests: this.requestCount,
      totalErrors: this.errorCount,
      errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0,
    };
  }

  isHealthy(): boolean {
    return this.isConnected && this.errorCount < this.requestCount * 0.5;
  }
}