import { N8nApiConfig } from '../types/config.types.js';
import { SecurityManager, ISecurityConfig, IApiKey } from '../security/index.js';
export interface IN8nMcpServerConfig {
    apiConfig?: Partial<N8nApiConfig>;
    security?: ISecurityConfig;
    monitoring?: {
        protocol?: 'websocket' | 'sse' | 'polling';
        wsUrl?: string;
        sseUrl?: string;
        pollingInterval?: number;
        updateInterval?: number;
    };
}
export declare class N8nMcpServer {
    private server;
    private apiClient;
    private toolRegistry;
    private isConnected;
    private startTime;
    private requestCount;
    private errorCount;
    private baseUrl?;
    private security;
    private monitoringService?;
    private monitoringResourceProvider?;
    constructor(config?: IN8nMcpServerConfig | Partial<N8nApiConfig>);
    private registerTools;
    private updateToolContext;
    private setupHandlers;
    private setupErrorHandling;
    private createMcpError;
    private log;
    connect(transport: any): Promise<void>;
    close(): Promise<void>;
    getUptime(): number;
    getStats(): {
        totalRequests: number;
        totalErrors: number;
        errorRate: number;
        security?: any;
    };
    isHealthy(): boolean;
    getSecurity(): SecurityManager;
    createApiKey(name: string, permissions: string[], userId?: string): IApiKey;
    revokeApiKey(id: string): boolean;
}
//# sourceMappingURL=N8nMcpServer.d.ts.map