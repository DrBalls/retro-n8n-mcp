import { N8nApiConfig } from '../types/config.types.js';
export declare class N8nMcpServer {
    private server;
    private apiClient;
    constructor(apiConfig?: Partial<N8nApiConfig>);
    private setupHandlers;
    private getAvailableTools;
    private handleTestConnection;
    private handleWorkflowList;
    connect(transport: any): Promise<void>;
    close(): Promise<void>;
}
//# sourceMappingURL=N8nMcpServer.d.ts.map