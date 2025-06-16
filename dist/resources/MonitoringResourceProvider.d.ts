import { IResourceProvider, IResource, IResourceMetadata } from '../types/resources.js';
import { RealtimeMonitoringService } from '../services/RealtimeMonitoringService.js';
import { N8nApiClient } from '../services/N8nApiClient.js';
export interface IMonitoringResourceOptions {
    apiClient: N8nApiClient;
    monitoringService?: RealtimeMonitoringService;
    updateInterval?: number;
}
export declare class MonitoringResourceProvider implements IResourceProvider {
    name: string;
    description: string;
    private apiClient;
    private monitoringService?;
    private updateInterval;
    private updateTimers;
    private logger;
    constructor(options: IMonitoringResourceOptions);
    /**
     * List available monitoring resources
     */
    listResources(): Promise<IResource[]>;
    /**
     * Read a monitoring resource
     */
    readResource(uri: string): Promise<string>;
    /**
     * Subscribe to resource updates
     */
    subscribeToResource(uri: string, callback: (data: string) => void): () => void;
    /**
     * Get resource metadata
     */
    getMetadata(): IResourceMetadata;
    /**
     * Get system status
     */
    private getSystemStatus;
    /**
     * Get active executions
     */
    private getActiveExecutions;
    /**
     * Get aggregated workflow metrics
     */
    private getWorkflowMetrics;
    /**
     * Get workflow status
     */
    private getWorkflowStatus;
    /**
     * Get workflow metrics by ID
     */
    private getWorkflowMetricsById;
    /**
     * Get execution status
     */
    private getExecutionStatus;
}
//# sourceMappingURL=MonitoringResourceProvider.d.ts.map