import { N8nApiConfig } from '../types/config.types.js';
export declare class N8nMcpServer {
    private server;
    private apiClient;
    private toolRegistry;
    private isConnected;
    private startTime;
    private requestCount;
    private errorCount;
    private baseUrl?;
    constructor(apiConfig?: Partial<N8nApiConfig>);
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
    };
    isHealthy(): boolean;
}
//# sourceMappingURL=N8nMcpServer.d.ts.map