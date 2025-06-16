import { EventEmitter } from 'events';
import { N8nApiClient } from './N8nApiClient.js';
export type MonitoringProtocol = 'websocket' | 'sse' | 'polling';
export interface IMonitoringOptions {
    protocol?: MonitoringProtocol;
    apiClient: N8nApiClient;
    wsUrl?: string;
    sseUrl?: string;
    pollingInterval?: number;
    authToken?: string;
}
export interface IExecutionUpdate {
    executionId: string;
    workflowId: string;
    status: string;
    progress?: {
        completedNodes: number;
        totalNodes: number;
        currentNode?: string;
    };
    error?: any;
    timestamp: string;
}
export interface IWorkflowMetrics {
    workflowId: string;
    executionCount: number;
    successRate: number;
    averageDuration: number;
    lastExecution?: Date;
    activeExecutions: number;
}
export declare class RealtimeMonitoringService extends EventEmitter {
    private protocol;
    private apiClient;
    private wsService?;
    private sseService?;
    private pollingTimers;
    private monitoredExecutions;
    private metricsCache;
    private logger;
    constructor(options: IMonitoringOptions);
    /**
     * Start monitoring
     */
    start(): Promise<void>;
    /**
     * Stop monitoring
     */
    stop(): void;
    /**
     * Monitor a specific execution
     */
    monitorExecution(executionId: string, options?: {
        includeProgress?: boolean;
        pollingInterval?: number;
    }): Promise<void>;
    /**
     * Stop monitoring an execution
     */
    stopMonitoringExecution(executionId: string): void;
    /**
     * Monitor workflow metrics
     */
    monitorWorkflowMetrics(workflowId: string, options?: {
        interval?: number;
        includePastExecutions?: boolean;
    }): Promise<void>;
    /**
     * Get current metrics for a workflow
     */
    getWorkflowMetrics(workflowId: string): Promise<IWorkflowMetrics | null>;
    /**
     * Get monitoring status
     */
    getStatus(): {
        protocol: MonitoringProtocol;
        connected: boolean;
        monitoredExecutions: string[];
        monitoredWorkflows: string[];
    };
    /**
     * Detect best protocol based on available options
     */
    private detectBestProtocol;
    /**
     * Initialize protocol-specific service
     */
    private initializeProtocol;
    /**
     * Set up WebSocket event handlers
     */
    private setupWebSocketHandlers;
    /**
     * Set up SSE event handlers
     */
    private setupSSEHandlers;
    /**
     * Start polling for execution updates
     */
    private startPollingExecution;
    /**
     * Handle execution update
     */
    private handleExecutionUpdate;
    /**
     * Update workflow metrics
     */
    private updateWorkflowMetrics;
}
//# sourceMappingURL=RealtimeMonitoringService.d.ts.map