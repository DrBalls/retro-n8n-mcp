import { IResourceProvider, IResource, IResourceMetadata } from '../types/resources.js';
import { RealtimeMonitoringService } from '../services/RealtimeMonitoringService.js';
import { N8nApiClient } from '../services/N8nApiClient.js';
import { Logger } from '../utils/Logger.js';

export interface IMonitoringResourceOptions {
  apiClient: N8nApiClient;
  monitoringService?: RealtimeMonitoringService;
  updateInterval?: number;
}

export class MonitoringResourceProvider implements IResourceProvider {
  name = 'monitoring';
  description = 'Real-time monitoring data for workflows and executions';
  
  private apiClient: N8nApiClient;
  private monitoringService?: RealtimeMonitoringService;
  private updateInterval: number;
  private updateTimers = new Map<string, NodeJS.Timeout>();
  private logger = new Logger('MonitoringResourceProvider');

  constructor(options: IMonitoringResourceOptions) {
    this.apiClient = options.apiClient;
    this.monitoringService = options.monitoringService!;
    this.updateInterval = options.updateInterval || 5000;
  }

  /**
   * List available monitoring resources
   */
  async listResources(): Promise<IResource[]> {
    const resources: IResource[] = [];

    // Add system monitoring resource
    resources.push({
      uri: 'monitoring://system/status',
      name: 'System Status',
      description: 'Real-time n8n system status and health metrics',
      mimeType: 'application/json'
    });

    // Add active executions monitoring
    resources.push({
      uri: 'monitoring://executions/active',
      name: 'Active Executions',
      description: 'Currently running workflow executions',
      mimeType: 'application/json'
    });

    // Add workflow metrics resource
    resources.push({
      uri: 'monitoring://metrics/workflows',
      name: 'Workflow Metrics',
      description: 'Aggregated metrics for all workflows',
      mimeType: 'application/json'
    });

    try {
      // List active workflows for individual monitoring
      const workflowResponse = await this.apiClient.getWorkflows({
        active: true,
        limit: 100
      });

      for (const workflow of workflowResponse.data) {
        resources.push({
          uri: `monitoring://workflow/${workflow.id}/status`,
          name: `${workflow.name} - Status`,
          description: `Real-time status for workflow: ${workflow.name}`,
          mimeType: 'application/json'
        });

        resources.push({
          uri: `monitoring://workflow/${workflow.id}/metrics`,
          name: `${workflow.name} - Metrics`,
          description: `Performance metrics for workflow: ${workflow.name}`,
          mimeType: 'application/json'
        });
      }

      // List recent executions for monitoring
      const executionResponse = await this.apiClient.getExecutions({
        status: 'running',
        limit: 20 
      });

      for (const execution of executionResponse.data) {
        resources.push({
          uri: `monitoring://execution/${execution.id}`,
          name: `Execution ${execution.id}`,
          description: `Monitor execution of workflow: ${execution.workflowData?.name || execution.workflowId}`,
          mimeType: 'application/json'
        });
      }

    } catch (error) {
      this.logger.error('Failed to list dynamic resources', { error });
    }

    return resources;
  }

  /**
   * Read a monitoring resource
   */
  async readResource(uri: string): Promise<string> {
    const parts = uri.replace('monitoring://', '').split('/');
    
    switch (parts[0]) {
      case 'system':
        return await this.getSystemStatus();
        
      case 'executions':
        if (parts[1] === 'active') {
          return await this.getActiveExecutions();
        }
        break;
        
      case 'metrics':
        if (parts[1] === 'workflows') {
          return await this.getWorkflowMetrics();
        }
        break;
        
      case 'workflow':
        if (parts[2] === 'status') {
          return await this.getWorkflowStatus(parts[1]);
        } else if (parts[2] === 'metrics') {
          return await this.getWorkflowMetricsById(parts[1]);
        }
        break;
        
      case 'execution':
        return await this.getExecutionStatus(parts[1]);
    }

    throw new Error(`Unknown monitoring resource: ${uri}`);
  }

  /**
   * Subscribe to resource updates
   */
  subscribeToResource(uri: string, callback: (data: string) => void): () => void {
    this.logger.info('Subscribing to resource', { uri });

    // Set up periodic updates
    const timer = setInterval(async () => {
      try {
        const data = await this.readResource(uri);
        callback(data);
      } catch (error) {
        this.logger.error('Failed to update resource', { error, uri });
      }
    }, this.updateInterval);

    this.updateTimers.set(uri, timer);

    // Initial callback
    this.readResource(uri).then(callback).catch(error => {
      this.logger.error('Failed to get initial resource data', { error, uri });
    });

    // Return unsubscribe function
    return () => {
      const timer = this.updateTimers.get(uri);
      if (timer) {
        clearInterval(timer);
        this.updateTimers.delete(uri);
      }
    };
  }

  /**
   * Get resource metadata
   */
  getMetadata(): IResourceMetadata {
    return {
      capabilities: ['read', 'subscribe'],
      updateFrequency: this.updateInterval,
      authentication: 'required'
    };
  }

  /**
   * Get system status
   */
  private async getSystemStatus(): Promise<string> {
    try {
      const [version, executions, workflows] = await Promise.all([
        this.apiClient.testConnection().then(r => r.version).catch(() => null),
        this.apiClient.getExecutions({ limit: 1 }),
        this.apiClient.getWorkflows({ limit: 1 })
      ]);

      const status = {
        timestamp: new Date().toISOString(),
        status: 'healthy',
        version: version || 'unknown',
        monitoring: this.monitoringService?.getStatus() || {
          protocol: 'polling',
          connected: true,
          monitoredExecutions: [],
          monitoredWorkflows: []
        },
        stats: {
          totalExecutions: executions.data?.length || 0,
          totalWorkflows: workflows.data?.length || 0
        }
      };

      return JSON.stringify(status, null, 2);
    } catch (error) {
      return JSON.stringify({
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, null, 2);
    }
  }

  /**
   * Get active executions
   */
  private async getActiveExecutions(): Promise<string> {
    try {
      const executionResponse = await this.apiClient.getExecutions({
        status: 'running',
        limit: 100
      });

      const activeExecutions = executionResponse.data.map((exec: any) => ({
        id: exec.id,
        workflowId: exec.workflowId,
        workflowName: exec.workflowData?.name,
        mode: exec.mode,
        startedAt: exec.startedAt,
        duration: Date.now() - new Date(exec.startedAt).getTime(),
        status: exec.status
      }));

      return JSON.stringify({
        timestamp: new Date().toISOString(),
        count: activeExecutions.length,
        executions: activeExecutions
      }, null, 2);
    } catch (error) {
      return JSON.stringify({
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Failed to fetch executions'
      }, null, 2);
    }
  }

  /**
   * Get aggregated workflow metrics
   */
  private async getWorkflowMetrics(): Promise<string> {
    try {
      const workflowResponse = await this.apiClient.getWorkflows({
        active: true,
        limit: 100
      });

      const metricsPromises = workflowResponse.data.map(async (workflow: any) => {
        const executionResponse = await this.apiClient.getExecutions({
          workflowId: workflow.id,
          limit: 50
        });

        const successCount = executionResponse.data.filter((e: any) => e.status === 'success').length;
        const totalDuration = executionResponse.data.reduce((sum: number, e: any) => {
          if (e.startedAt && e.stoppedAt) {
            return sum + (new Date(e.stoppedAt).getTime() - new Date(e.startedAt).getTime());
          }
          return sum;
        }, 0);

        return {
          workflowId: workflow.id,
          workflowName: workflow.name,
          executionCount: executionResponse.data.length,
          successRate: executionResponse.data.length > 0 ? (successCount / executionResponse.data.length) * 100 : 0,
          averageDuration: executionResponse.data.length > 0 ? totalDuration / executionResponse.data.length : 0,
          lastExecution: executionResponse.data[0]?.startedAt
        };
      });

      const metrics = await Promise.all(metricsPromises);

      return JSON.stringify({
        timestamp: new Date().toISOString(),
        totalWorkflows: metrics.length,
        metrics: metrics.sort((a, b) => b.executionCount - a.executionCount)
      }, null, 2);
    } catch (error) {
      return JSON.stringify({
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Failed to fetch metrics'
      }, null, 2);
    }
  }

  /**
   * Get workflow status
   */
  private async getWorkflowStatus(workflowId: string): Promise<string> {
    try {
      const [workflow, executionResponse] = await Promise.all([
        this.apiClient.getWorkflow(workflowId),
        this.apiClient.getExecutions({
          workflowId,
          limit: 10
        })
      ]);

      const runningExecutions = executionResponse.data.filter((e: any) => e.status === 'running');
      const lastExecution = executionResponse.data[0];

      return JSON.stringify({
        timestamp: new Date().toISOString(),
        workflow: {
          id: workflow.id,
          name: workflow.name,
          active: workflow.active,
          nodeCount: workflow.nodes?.length || 0
        },
        status: {
          isRunning: runningExecutions.length > 0,
          runningExecutions: runningExecutions.length,
          lastExecution: lastExecution ? {
            id: lastExecution.id,
            status: lastExecution.status,
            startedAt: lastExecution.startedAt,
            stoppedAt: lastExecution.stoppedAt
          } : null
        }
      }, null, 2);
    } catch (error) {
      return JSON.stringify({
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Failed to fetch workflow status'
      }, null, 2);
    }
  }

  /**
   * Get workflow metrics by ID
   */
  private async getWorkflowMetricsById(workflowId: string): Promise<string> {
    try {
      if (this.monitoringService) {
        const metrics = await this.monitoringService.getWorkflowMetrics(workflowId);
        if (metrics) {
          return JSON.stringify({
            timestamp: new Date().toISOString(),
            ...metrics
          }, null, 2);
        }
      }

      // Fallback to manual calculation
      const executionResponse = await this.apiClient.getExecutions({
        workflowId,
        limit: 100
      });

      const successCount = executionResponse.data.filter((e: any) => e.status === 'success').length;
      const failureCount = executionResponse.data.filter((e: any) => e.status === 'error').length;
      const totalDuration = executionResponse.data.reduce((sum: number, e: any) => {
        if (e.startedAt && e.stoppedAt) {
          return sum + (new Date(e.stoppedAt).getTime() - new Date(e.startedAt).getTime());
        }
        return sum;
      }, 0);

      return JSON.stringify({
        timestamp: new Date().toISOString(),
        workflowId,
        executionCount: executionResponse.data.length,
        successCount,
        failureCount,
        successRate: executionResponse.data.length > 0 ? (successCount / executionResponse.data.length) * 100 : 0,
        averageDuration: executionResponse.data.length > 0 ? totalDuration / executionResponse.data.length : 0,
        lastExecution: executionResponse.data[0]?.startedAt
      }, null, 2);
    } catch (error) {
      return JSON.stringify({
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Failed to fetch workflow metrics'
      }, null, 2);
    }
  }

  /**
   * Get execution status
   */
  private async getExecutionStatus(executionId: string): Promise<string> {
    try {
      const execution = await this.apiClient.getExecution(executionId);

      const runData = execution.data?.resultData?.runData as Record<string, any[]> | undefined;
      const nodeProgress = runData ? 
        Object.keys(runData).map((nodeId: string) => ({
          nodeId,
          executionTime: runData[nodeId]?.[0]?.executionTime || 0,
          startTime: runData[nodeId]?.[0]?.startTime
        })) : [];

      return JSON.stringify({
        timestamp: new Date().toISOString(),
        execution: {
          id: execution.id,
          workflowId: execution.workflowId,
          status: execution.status,
          mode: execution.mode,
          startedAt: execution.startedAt,
          stoppedAt: execution.stoppedAt,
          finished: execution.finished
        },
        progress: {
          completedNodes: nodeProgress.length,
          totalNodes: execution.workflowData?.nodes?.length || 0,
          nodeProgress
        },
        error: (execution.data?.resultData as any)?.error || null
      }, null, 2);
    } catch (error) {
      return JSON.stringify({
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Failed to fetch execution status'
      }, null, 2);
    }
  }
}