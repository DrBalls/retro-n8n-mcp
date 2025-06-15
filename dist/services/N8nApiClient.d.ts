import { SimpleCache } from '../utils/SimpleCache.js';
import { N8nApiConfig } from '../types/config.types.js';
import { Workflow, WorkflowListResponse, Execution, ExecutionListResponse, Credential, CredentialListResponse } from '../types/n8n.types.js';
export declare class N8nApiClient {
    private axios;
    private config;
    private queue;
    private cache;
    private baseUrl;
    constructor(config?: Partial<N8nApiConfig>);
    private setupInterceptors;
    private executeWithRetry;
    private getCacheKey;
    private request;
    testConnection(): Promise<{
        connected: boolean;
        version?: string;
    }>;
    getWorkflows(options?: {
        active?: boolean;
        limit?: number;
        cursor?: string;
        tags?: string[];
    }): Promise<WorkflowListResponse>;
    getWorkflow(id: string): Promise<Workflow>;
    createWorkflow(workflow: Partial<Workflow>): Promise<Workflow>;
    updateWorkflow(id: string, workflow: Partial<Workflow>): Promise<Workflow>;
    deleteWorkflow(id: string): Promise<void>;
    activateWorkflow(id: string): Promise<Workflow>;
    deactivateWorkflow(id: string): Promise<Workflow>;
    getExecutions(options?: {
        workflowId?: string;
        status?: string;
        limit?: number;
        cursor?: string;
    }): Promise<ExecutionListResponse>;
    getExecution(id: string): Promise<Execution>;
    triggerWorkflow(workflowId: string, data?: Record<string, unknown>): Promise<Execution>;
    stopExecution(id: string): Promise<Execution>;
    deleteExecution(id: string): Promise<void>;
    getCredentials(options?: {
        limit?: number;
        cursor?: string;
    }): Promise<CredentialListResponse>;
    getCredential(id: string): Promise<Credential>;
    createCredential(credential: Partial<Credential>): Promise<Credential>;
    updateCredential(id: string, credential: Partial<Credential>): Promise<Credential>;
    deleteCredential(id: string): Promise<void>;
    testCredential(id: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    clearCache(): void;
    getCacheStats(): ReturnType<SimpleCache['getStats']>;
    getQueueStats(): {
        pending: number;
        active: number;
        paused: boolean;
    };
    pauseQueue(): void;
    resumeQueue(): void;
}
//# sourceMappingURL=N8nApiClient.d.ts.map