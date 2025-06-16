import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { 
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { N8nApiClient } from '../services/N8nApiClient.js';
import { RealtimeMonitoringService } from '../services/RealtimeMonitoringService.js';
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
  TriggerExecutionTool,
  GetExecutionTool,
  ListExecutionsTool,
  StopExecutionTool,
  MonitorExecutionTool,
  ReplayExecutionTool,
} from '../tools/index.js';
import {
  CreateCredentialTool,
  UpdateCredentialTool,
  DeleteCredentialTool,
  ListCredentialsTool,
  TestCredentialTool,
  GetCredentialTool,
} from '../tools/credential/index.js';
import { Logger, LogLevel } from '../utils/Logger.js';
import { SecurityManager, ISecurityConfig, ISecurityContext, IApiKey } from '../security/index.js';

export interface IN8nMcpServerConfig {
  apiConfig?: Partial<N8nApiConfig>;
  security?: ISecurityConfig;
}

export class N8nMcpServer {
  private server: Server;
  private apiClient: N8nApiClient | null = null;
  private toolRegistry: ToolRegistry;
  private isConnected = false;
  private startTime: Date;
  private requestCount = 0;
  private errorCount = 0;
  private baseUrl?: string;
  private security: SecurityManager;
  private monitoringService?: RealtimeMonitoringService;

  constructor(config?: IN8nMcpServerConfig | Partial<N8nApiConfig>) {
    this.startTime = new Date();
    
    // Handle both old and new config formats
    let apiConfig: Partial<N8nApiConfig> | undefined;
    let securityConfig: ISecurityConfig | undefined;
    
    if (config && 'apiConfig' in config) {
      // New format
      apiConfig = config.apiConfig;
      securityConfig = config.security;
    } else {
      // Old format (backward compatibility)
      apiConfig = config;
    }
    
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

    // Initialize security
    this.security = new SecurityManager(securityConfig);

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

    // Setup handlers first
    this.setupHandlers();
    this.setupErrorHandling();
    
    // Register tools (async)
    this.registerTools().catch(error => {
      this.log('error', 'Failed to register tools', error);
    });
  }

  private async registerTools(): Promise<void> {
    // Always register system tools
    this.toolRegistry.register(new ServerHealthTool());
    
    // Register n8n tools if API client is available
    if (this.apiClient) {
      // System tools
      this.toolRegistry.register(new TestConnectionTool());
      
      // Workflow tools
      this.toolRegistry.register(new ListWorkflowsTool());
      this.toolRegistry.register(new CreateWorkflowTool());
      this.toolRegistry.register(new GetWorkflowTool());
      this.toolRegistry.register(new UpdateWorkflowTool());
      this.toolRegistry.register(new DeleteWorkflowTool());
      this.toolRegistry.register(new ActivateWorkflowTool());
      this.toolRegistry.register(new DeactivateWorkflowTool());
      
      // Execution tools
      this.toolRegistry.register(new TriggerExecutionTool());
      this.toolRegistry.register(new GetExecutionTool());
      this.toolRegistry.register(new ListExecutionsTool());
      this.toolRegistry.register(new StopExecutionTool());
      this.toolRegistry.register(new MonitorExecutionTool());
      this.toolRegistry.register(new ReplayExecutionTool());
      
      // Credential tools
      this.toolRegistry.register(new CreateCredentialTool());
      this.toolRegistry.register(new UpdateCredentialTool());
      this.toolRegistry.register(new DeleteCredentialTool());
      this.toolRegistry.register(new ListCredentialsTool());
      this.toolRegistry.register(new TestCredentialTool());
      this.toolRegistry.register(new GetCredentialTool());
      
      // Monitoring tools - register after checking for monitoring service
      // These tools will work with polling fallback if no monitoring service is configured
      const { RealtimeExecutionMonitorTool, WorkflowMetricsMonitorTool } = await import('../tools/monitoring/index.js');
      this.toolRegistry.register(new RealtimeExecutionMonitorTool());
      this.toolRegistry.register(new WorkflowMetricsMonitorTool());
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
      monitoringService: this.monitoringService,
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
        // Extract security context from request
        const securityContext: ISecurityContext = {
          // In a real implementation, these would come from:
          // - API key from Authorization header
          // - User ID from authenticated session
          // - Metadata from request headers
          apiKey: (request as any).apiKey,
          userId: (request as any).userId,
          metadata: {
            ip: (request as any).ip,
            userAgent: (request as any).userAgent,
            sessionId: (request as any).sessionId
          }
        };

        // Get tool metadata to determine permission
        const tool = this.toolRegistry.getTool(name);
        const permission = tool?.getMetadata ? 
          `${tool.getMetadata().category}.${name}` : 
          `tool.${name}`;

        // Check security
        const securityCheck = await this.security.checkToolSecurity(
          name,
          permission,
          securityContext
        );

        if (!securityCheck.allowed) {
          this.log('warn', `Tool call denied: ${name}`, {
            reason: securityCheck.reason,
            retryAfter: securityCheck.retryAfter
          });

          if (securityCheck.retryAfter) {
            throw new N8nRateLimitError(
              securityCheck.reason || 'Rate limit exceeded',
              securityCheck.retryAfter
            );
          }

          throw new N8nAuthenticationError(
            securityCheck.reason || 'Access denied'
          );
        }

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

  getStats(): { totalRequests: number; totalErrors: number; errorRate: number; security?: any } {
    const stats = {
      totalRequests: this.requestCount,
      totalErrors: this.errorCount,
      errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0,
    };

    // Add security stats if available
    try {
      const securityStats = this.security.getSecurityStatistics(
        new Date(Date.now() - 60 * 60 * 1000), // Last hour
        new Date()
      );
      
      return {
        ...stats,
        security: {
          auditEvents: securityStats.audit.totalEvents,
          suspiciousActivity: securityStats.suspiciousActivity,
          rateLimits: securityStats.rateLimit.limits.map(l => ({
            name: l.name,
            activeKeys: l.activeKeys
          }))
        }
      };
    } catch {
      return stats;
    }
  }

  isHealthy(): boolean {
    // Server is healthy if connected and error rate is below 50%
    // When no requests have been made, consider it healthy if connected
    if (!this.isConnected) return false;
    if (this.requestCount === 0) return true;
    return this.errorCount < this.requestCount * 0.5;
  }

  // Security management methods
  getSecurity(): SecurityManager {
    return this.security;
  }

  createApiKey(name: string, permissions: string[], userId?: string): IApiKey {
    return this.security.createApiKey(name, permissions, userId);
  }

  revokeApiKey(id: string): boolean {
    return this.security.revokeApiKey(id);
  }
}