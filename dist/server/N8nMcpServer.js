import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema, CallToolRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, SubscribeRequestSchema, UnsubscribeRequestSchema, ErrorCode, McpError, } from '@modelcontextprotocol/sdk/types.js';
import { N8nApiClient } from '../services/N8nApiClient.js';
import { RealtimeMonitoringService } from '../services/RealtimeMonitoringService.js';
import { MonitoringResourceProvider } from '../resources/MonitoringResourceProvider.js';
import { N8nApiError, N8nAuthenticationError, N8nConnectionError, N8nRateLimitError, } from '../utils/errors.js';
import { ToolRegistry, ServerHealthTool, TestConnectionTool, ListWorkflowsTool, CreateWorkflowTool, GetWorkflowTool, UpdateWorkflowTool, DeleteWorkflowTool, ActivateWorkflowTool, DeactivateWorkflowTool, TriggerExecutionTool, GetExecutionTool, ListExecutionsTool, StopExecutionTool, MonitorExecutionTool, ReplayExecutionTool, } from '../tools/index.js';
import { CreateCredentialTool, UpdateCredentialTool, DeleteCredentialTool, ListCredentialsTool, TestCredentialTool, GetCredentialTool, } from '../tools/credential/index.js';
import { SecurityManager } from '../security/index.js';
export class N8nMcpServer {
    server;
    apiClient = null;
    toolRegistry;
    isConnected = false;
    startTime;
    requestCount = 0;
    errorCount = 0;
    baseUrl;
    security;
    monitoringService;
    monitoringResourceProvider;
    constructor(config) {
        this.startTime = new Date();
        // Handle both old and new config formats
        let apiConfig;
        let securityConfig;
        let monitoringConfig;
        if (config && 'apiConfig' in config) {
            // New format
            apiConfig = config.apiConfig;
            securityConfig = config.security;
            monitoringConfig = config.monitoring;
        }
        else {
            // Old format (backward compatibility)
            apiConfig = config;
        }
        this.server = new Server({
            name: 'n8n-mcp-server',
            version: '0.1.0',
        }, {
            capabilities: {
                tools: {},
                resources: {},
                prompts: {},
            },
        });
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
            }
            catch (error) {
                this.log('error', 'Failed to initialize n8n API client', error);
            }
        }
        else {
            this.log('warn', 'n8n API client not configured - some features will be unavailable');
        }
        // Initialize monitoring service if API client is available
        if (this.apiClient && monitoringConfig) {
            try {
                this.monitoringService = new RealtimeMonitoringService({
                    apiClient: this.apiClient,
                    protocol: monitoringConfig.protocol,
                    wsUrl: monitoringConfig.wsUrl,
                    sseUrl: monitoringConfig.sseUrl,
                    pollingInterval: monitoringConfig.pollingInterval,
                    authToken: apiConfig?.apiKey,
                });
                this.log('info', `Realtime monitoring service initialized with ${monitoringConfig.protocol || 'auto-detected'} protocol`);
                // Initialize monitoring resource provider
                this.monitoringResourceProvider = new MonitoringResourceProvider({
                    apiClient: this.apiClient,
                    monitoringService: this.monitoringService,
                    updateInterval: monitoringConfig.updateInterval || 5000,
                });
                this.log('info', 'Monitoring resource provider initialized');
            }
            catch (error) {
                this.log('error', 'Failed to initialize monitoring service', error);
            }
        }
        // Setup handlers first
        this.setupHandlers();
        this.setupErrorHandling();
        // Register tools (async)
        this.registerTools().catch(error => {
            this.log('error', 'Failed to register tools', error);
        });
    }
    async registerTools() {
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
            // Debug tools
            const { StartDebugSessionTool, StepDebugTool, InspectDebugTool, BreakpointDebugTool, WatchDebugTool, PauseDebugTool, ResumeDebugTool, StopDebugTool, StatusDebugTool, HistoryDebugTool, TimelineDebugTool } = await import('../tools/debug/index.js');
            this.toolRegistry.register(new StartDebugSessionTool());
            this.toolRegistry.register(new StepDebugTool());
            this.toolRegistry.register(new InspectDebugTool());
            this.toolRegistry.register(new BreakpointDebugTool());
            this.toolRegistry.register(new WatchDebugTool());
            this.toolRegistry.register(new PauseDebugTool());
            this.toolRegistry.register(new ResumeDebugTool());
            this.toolRegistry.register(new StopDebugTool());
            this.toolRegistry.register(new StatusDebugTool());
            this.toolRegistry.register(new HistoryDebugTool());
            this.toolRegistry.register(new TimelineDebugTool());
            // Batch tools
            const { BatchWorkflowsCreateTool, BatchWorkflowsUpdateTool, BatchWorkflowsDeleteTool, BatchWorkflowsActivateTool, BatchWorkflowsDeactivateTool, BatchOperationStatusTool } = await import('../tools/batch/index.js');
            this.toolRegistry.register(new BatchWorkflowsCreateTool());
            this.toolRegistry.register(new BatchWorkflowsUpdateTool());
            this.toolRegistry.register(new BatchWorkflowsDeleteTool());
            this.toolRegistry.register(new BatchWorkflowsActivateTool());
            this.toolRegistry.register(new BatchWorkflowsDeactivateTool());
            this.toolRegistry.register(new BatchOperationStatusTool());
            // Visualization tools
            const { MermaidDiagramTool, DependencyGraphTool, WorkflowMapTool } = await import('../tools/visualization/index.js');
            this.toolRegistry.register(new MermaidDiagramTool());
            this.toolRegistry.register(new DependencyGraphTool());
            this.toolRegistry.register(new WorkflowMapTool());
            // Version control tools
            const { CreateVersionTool, CreateBranchTool, ListVersionsTool, MergeBranchTool, RollbackVersionTool, CompareVersionsTool } = await import('../tools/version-control/index.js');
            this.toolRegistry.register(new CreateVersionTool());
            this.toolRegistry.register(new CreateBranchTool());
            this.toolRegistry.register(new ListVersionsTool());
            this.toolRegistry.register(new MergeBranchTool());
            this.toolRegistry.register(new RollbackVersionTool());
            this.toolRegistry.register(new CompareVersionsTool());
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
    updateToolContext() {
        const context = {
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
    setupHandlers() {
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
            }
            catch (error) {
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
                const securityContext = {
                    // In a real implementation, these would come from:
                    // - API key from Authorization header
                    // - User ID from authenticated session
                    // - Metadata from request headers
                    apiKey: request.apiKey,
                    userId: request.userId,
                    metadata: {
                        ip: request.ip,
                        userAgent: request.userAgent,
                        sessionId: request.sessionId
                    }
                };
                // Get tool metadata to determine permission
                const tool = this.toolRegistry.getTool(name);
                const permission = tool?.getMetadata ?
                    `${tool.getMetadata().category}.${name}` :
                    `tool.${name}`;
                // Check security
                const securityCheck = await this.security.checkToolSecurity(name, permission, securityContext);
                if (!securityCheck.allowed) {
                    this.log('warn', `Tool call denied: ${name}`, {
                        reason: securityCheck.reason,
                        retryAfter: securityCheck.retryAfter
                    });
                    if (securityCheck.retryAfter) {
                        throw new N8nRateLimitError(securityCheck.reason || 'Rate limit exceeded', securityCheck.retryAfter);
                    }
                    throw new N8nAuthenticationError(securityCheck.reason || 'Access denied');
                }
                // Update context before executing tool
                this.updateToolContext();
                // Execute tool through registry
                const result = await this.toolRegistry.execute(name, args || {});
                this.log('debug', `Tool call ${name} completed`);
                return result;
            }
            catch (error) {
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
        // Handle list resources request
        this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
            this.requestCount++;
            this.log('debug', 'Handling list resources request');
            try {
                if (!this.monitoringResourceProvider) {
                    return { resources: [] };
                }
                const resources = await this.monitoringResourceProvider.listResources();
                return { resources };
            }
            catch (error) {
                this.errorCount++;
                this.log('error', 'Failed to list resources', error);
                throw this.createMcpError(error);
            }
        });
        // Handle read resource request
        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            this.requestCount++;
            const { uri } = request.params;
            this.log('debug', `Handling read resource request: ${uri}`);
            try {
                if (!this.monitoringResourceProvider) {
                    throw new Error('Monitoring not configured');
                }
                const content = await this.monitoringResourceProvider.readResource(uri);
                return {
                    contents: [{
                            uri,
                            mimeType: 'application/json',
                            text: content,
                        }],
                };
            }
            catch (error) {
                this.errorCount++;
                this.log('error', `Failed to read resource: ${uri}`, error);
                throw this.createMcpError(error);
            }
        });
        // Handle subscribe to resource request
        this.server.setRequestHandler(SubscribeRequestSchema, async (request) => {
            this.requestCount++;
            const { uri } = request.params;
            this.log('debug', `Handling subscribe request: ${uri}`);
            try {
                if (!this.monitoringResourceProvider) {
                    throw new Error('Monitoring not configured');
                }
                // Subscribe to resource updates
                const unsubscribe = this.monitoringResourceProvider.subscribeToResource(uri, async (content) => {
                    // Send resource update notification
                    await this.server.notification({
                        method: 'notifications/resources/updated',
                        params: {
                            uri,
                        },
                    });
                });
                // Store unsubscribe function for later cleanup
                // In a real implementation, you'd want to track subscriptions
                return { success: true };
            }
            catch (error) {
                this.errorCount++;
                this.log('error', `Failed to subscribe to resource: ${uri}`, error);
                throw this.createMcpError(error);
            }
        });
        // Handle unsubscribe from resource request
        this.server.setRequestHandler(UnsubscribeRequestSchema, async (request) => {
            this.requestCount++;
            const { uri } = request.params;
            this.log('debug', `Handling unsubscribe request: ${uri}`);
            try {
                // In a real implementation, you'd clean up the subscription here
                return { success: true };
            }
            catch (error) {
                this.errorCount++;
                this.log('error', `Failed to unsubscribe from resource: ${uri}`, error);
                throw this.createMcpError(error);
            }
        });
    }
    setupErrorHandling() {
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
    createMcpError(error) {
        if (error instanceof McpError) {
            return error;
        }
        if (error instanceof N8nAuthenticationError) {
            return new McpError(ErrorCode.InvalidRequest, 'Authentication failed. Please check your n8n API key.');
        }
        if (error instanceof N8nRateLimitError) {
            return new McpError(ErrorCode.InternalError, `Rate limit exceeded. Retry after ${error.retryAfter}ms`);
        }
        if (error instanceof N8nConnectionError) {
            return new McpError(ErrorCode.InternalError, 'Failed to connect to n8n instance');
        }
        if (error instanceof N8nApiError) {
            return new McpError(ErrorCode.InternalError, `n8n API error: ${error.message}`);
        }
        return new McpError(ErrorCode.InternalError, error instanceof Error ? error.message : 'Unknown error occurred');
    }
    log(level, message, data) {
        const timestamp = new Date().toISOString();
        const logData = data ? ` ${JSON.stringify(data)}` : '';
        console.error(`[${timestamp}] [${level.toUpperCase()}] ${message}${logData}`);
    }
    async connect(transport) {
        try {
            this.log('info', 'Connecting to MCP transport');
            await this.server.connect(transport);
            this.isConnected = true;
            this.log('info', 'Successfully connected to MCP transport');
            // Start monitoring service if configured
            if (this.monitoringService) {
                try {
                    await this.monitoringService.start();
                    this.log('info', 'Monitoring service started');
                }
                catch (error) {
                    this.log('error', 'Failed to start monitoring service', error);
                    // Don't fail the connection if monitoring fails
                }
            }
        }
        catch (error) {
            this.isConnected = false;
            this.log('error', 'Failed to connect to MCP transport', error);
            throw error;
        }
    }
    async close() {
        try {
            this.log('info', 'Closing MCP server');
            // Stop monitoring service if running
            if (this.monitoringService) {
                try {
                    this.monitoringService.stop();
                    this.log('info', 'Monitoring service stopped');
                }
                catch (error) {
                    this.log('error', 'Failed to stop monitoring service', error);
                }
            }
            this.isConnected = false;
            await this.server.close();
            this.log('info', 'MCP server closed successfully');
        }
        catch (error) {
            this.log('error', 'Error closing MCP server', error);
            throw error;
        }
    }
    // Public methods for server management
    getUptime() {
        return Date.now() - this.startTime.getTime();
    }
    getStats() {
        const stats = {
            totalRequests: this.requestCount,
            totalErrors: this.errorCount,
            errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0,
        };
        // Add security stats if available
        try {
            const securityStats = this.security.getSecurityStatistics(new Date(Date.now() - 60 * 60 * 1000), // Last hour
            new Date());
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
        }
        catch {
            return stats;
        }
    }
    isHealthy() {
        // Server is healthy if connected and error rate is below 50%
        // When no requests have been made, consider it healthy if connected
        if (!this.isConnected)
            return false;
        if (this.requestCount === 0)
            return true;
        return this.errorCount < this.requestCount * 0.5;
    }
    // Security management methods
    getSecurity() {
        return this.security;
    }
    createApiKey(name, permissions, userId) {
        return this.security.createApiKey(name, permissions, userId);
    }
    revokeApiKey(id) {
        return this.security.revokeApiKey(id);
    }
}
//# sourceMappingURL=N8nMcpServer.js.map