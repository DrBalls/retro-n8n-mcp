import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { 
  ListToolsRequestSchema,
  CallToolRequestSchema,
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
import { 
  ToolRegistry,
  IToolContext,
  ServerHealthTool,
  TestConnectionTool,
  ListWorkflowsTool,
  CreateWorkflowTool,
  GetWorkflowTool,
  UpdateWorkflowTool,
  DeleteWorkflowTool,
  ActivateWorkflowTool,
  DeactivateWorkflowTool,
} from '../tools/index.js';

export class N8nMcpServer {
  private server: Server;
  private apiClient: N8nApiClient | null = null;
  private toolRegistry: ToolRegistry;
  private isConnected = false;
  private startTime: Date;
  private requestCount = 0;
  private errorCount = 0;
  private baseUrl?: string;

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

    // Initialize tool registry
    this.toolRegistry = new ToolRegistry();

    // Initialize API client if config provided
    if (apiConfig?.baseUrl && apiConfig?.apiKey) {
      try {
        this.apiClient = new N8nApiClient(apiConfig);
        this.baseUrl = apiConfig.baseUrl;
        this.log('info', 'n8n API client initialized successfully');
      } catch (error) {
        this.log('error', 'Failed to initialize n8n API client', error);
      }
    } else {
      this.log('warn', 'n8n API client not configured - some features will be unavailable');
    }

    // Register tools
    this.registerTools();
    
    // Setup handlers
    this.setupHandlers();
    this.setupErrorHandling();
  }

  private registerTools(): void {
    // Always register system tools
    this.toolRegistry.register(new ServerHealthTool());
    
    // Register n8n tools if API client is available
    if (this.apiClient) {
      this.toolRegistry.register(new TestConnectionTool());
      this.toolRegistry.register(new ListWorkflowsTool());
      this.toolRegistry.register(new CreateWorkflowTool());
      this.toolRegistry.register(new GetWorkflowTool());
      this.toolRegistry.register(new UpdateWorkflowTool());
      this.toolRegistry.register(new DeleteWorkflowTool());
      this.toolRegistry.register(new ActivateWorkflowTool());
      this.toolRegistry.register(new DeactivateWorkflowTool());
    }

    // Update tool registry context
    this.updateToolContext();

    // Listen to tool events
    this.toolRegistry.on('tool:executed', (toolName, duration) => {
      this.log('debug', `Tool ${toolName} executed in ${duration}ms`);
    });

    this.toolRegistry.on('tool:error', (toolName, error) => {
      this.log('error', `Tool ${toolName} error`, error);
    });
  }

  private updateToolContext(): void {
    const context: IToolContext = {
      apiClient: this.apiClient || undefined,
      metadata: {
        version: '0.1.0',
        uptime: this.getUptime(),
        serverStats: this.getStats(),
        baseUrl: this.apiClient ? this.baseUrl : undefined,
      },
    };
    this.toolRegistry.updateContext(context);
  }

  private setupHandlers(): void {
    // Handle list tools request
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      this.requestCount++;
      this.log('debug', 'Handling list tools request');
      
      try {
        // Update context before listing tools
        this.updateToolContext();
        
        return {
          tools: this.toolRegistry.toMcpTools(),
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
      this.log('debug', `Raw tool call request:`, request);
      
      const { name, arguments: args } = request.params;
      this.log('debug', `Handling tool call: ${name}`, args);

      try {
        // Update context before executing tool
        this.updateToolContext();
        
        // Execute tool through registry
        const result = await this.toolRegistry.execute(name, args || {});
        
        this.log('debug', `Tool call ${name} completed`);
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
    // Server is healthy if connected and error rate is below 50%
    // When no requests have been made, consider it healthy if connected
    if (!this.isConnected) return false;
    if (this.requestCount === 0) return true;
    return this.errorCount < this.requestCount * 0.5;
  }
}