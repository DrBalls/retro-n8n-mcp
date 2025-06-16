import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
import { RealtimeMonitoringService } from '../../services/RealtimeMonitoringService.js';

export class RealtimeExecutionMonitorTool extends BaseTool {
  name = 'monitor_execution_realtime';
  description = 'Monitor workflow execution in real-time with live updates via WebSocket/SSE or polling';

  inputSchema = z.object({
    executionId: z.string().describe('ID of the execution to monitor'),
    protocol: z.enum(['websocket', 'sse', 'polling'])
      .optional()
      .describe('Monitoring protocol to use (auto-detected if not specified)'),
    duration: z.number()
      .min(1000)
      .max(600000)
      .default(300000)
      .describe('Maximum monitoring duration in milliseconds'),
    includeProgress: z.boolean()
      .default(true)
      .describe('Include detailed node execution progress'),
    updateInterval: z.number()
      .min(500)
      .max(10000)
      .default(2000)
      .describe('Update interval for polling mode (milliseconds)')
  });

  async execute(params: unknown, context: IToolContext): Promise<IToolResponse> {
    const input = this.validateInput<z.infer<typeof this.inputSchema>>(params);
    
    if (!context.apiClient) {
      throw new Error('n8n API client not configured');
    }

    // Initialize monitoring service if not provided
    let monitoringService: RealtimeMonitoringService;
    let shouldCleanup = false;

    if (context.monitoringService) {
      monitoringService = context.monitoringService;
    } else {
      // Create temporary monitoring service
      shouldCleanup = true;
      monitoringService = new RealtimeMonitoringService({
        apiClient: context.apiClient,
        protocol: input.protocol || 'polling',
        pollingInterval: input.updateInterval
      });
      await monitoringService.start();
    }

    try {
      const updates: any[] = [];
      const startTime = Date.now();
      let lastUpdate: any = null;
      let isFinished = false;

      // Set up monitoring
      await new Promise<void>(async (resolve, reject) => {
        const timeout = setTimeout(() => {
          monitoringService.stopMonitoringExecution(input.executionId);
          resolve();
        }, input.duration);

        // Listen for updates
        const updateHandler = (update: any) => {
          updates.push({
            timestamp: update.timestamp,
            status: update.status,
            progress: update.progress,
            duration: Date.now() - startTime
          });
          lastUpdate = update;

          // Check if finished
          if (update.status === 'success' || update.status === 'error' || update.status === 'crashed') {
            isFinished = true;
            clearTimeout(timeout);
            monitoringService.stopMonitoringExecution(input.executionId);
            resolve();
          }
        };

        // Listen for errors
        const errorHandler = (error: any) => {
          updates.push({
            timestamp: new Date().toISOString(),
            type: 'error',
            error: error.message || 'Unknown error',
            duration: Date.now() - startTime
          });
        };

        monitoringService.on(`execution:${input.executionId}:update`, updateHandler);
        monitoringService.on(`execution:${input.executionId}:finished`, () => {
          clearTimeout(timeout);
          resolve();
        });
        monitoringService.on('error', errorHandler);

        try {
          // Start monitoring
          await monitoringService.monitorExecution(input.executionId, {
            includeProgress: input.includeProgress,
            pollingInterval: input.updateInterval
          });
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      });

      // Get final execution state
      let finalExecution;
      try {
        finalExecution = await context.apiClient.request(
          'GET',
          `/executions/${input.executionId}`,
          { params: { includeData: input.includeProgress } }
        );
      } catch (error) {
        // Execution might have been deleted
        finalExecution = null;
      }

      // Build comprehensive report
      const report = {
        executionId: input.executionId,
        monitoringProtocol: monitoringService.getStatus().protocol,
        duration: Date.now() - startTime,
        updateCount: updates.length,
        finished: isFinished,
        finalStatus: lastUpdate?.status || finalExecution?.status || 'unknown',
        updates,
        summary: this.generateSummary(updates, finalExecution),
        nodeProgress: this.extractNodeProgress(finalExecution),
        error: finalExecution?.data?.resultData?.error || lastUpdate?.error || null
      };

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(report, null, 2),
          mimeType: 'application/json'
        }]
      };

    } finally {
      if (shouldCleanup) {
        monitoringService.stop();
      }
    }
  }

  /**
   * Generate execution summary
   */
  private generateSummary(updates: any[], finalExecution: any): any {
    const statusChanges = updates.filter(u => u.status).map(u => ({
      status: u.status,
      timestamp: u.timestamp,
      duration: u.duration
    }));

    const progressUpdates = updates.filter(u => u.progress);
    const errorUpdates = updates.filter(u => u.type === 'error');

    const summary: any = {
      totalUpdates: updates.length,
      statusChangeCount: statusChanges.length,
      progressUpdateCount: progressUpdates.length,
      errorCount: errorUpdates.length,
      statusHistory: statusChanges
    };

    if (progressUpdates.length > 0) {
      const lastProgress = progressUpdates[progressUpdates.length - 1].progress;
      summary.finalProgress = {
        completedNodes: lastProgress.completedNodes,
        totalNodes: lastProgress.totalNodes,
        completionPercentage: lastProgress.totalNodes > 0 
          ? (lastProgress.completedNodes / lastProgress.totalNodes) * 100 
          : 0
      };
    }

    if (finalExecution) {
      summary.executionTime = finalExecution.stoppedAt 
        ? new Date(finalExecution.stoppedAt).getTime() - new Date(finalExecution.startedAt).getTime()
        : null;
      summary.mode = finalExecution.mode;
      summary.workflowId = finalExecution.workflowId;
      summary.workflowName = finalExecution.workflowData?.name;
    }

    return summary;
  }

  /**
   * Extract node progress information
   */
  private extractNodeProgress(execution: any): any[] | null {
    if (!execution?.data?.resultData?.runData) {
      return null;
    }

    const nodeProgress = [];
    const runData = execution.data.resultData.runData;

    for (const [nodeId, nodeExecutions] of Object.entries(runData)) {
      const executions = nodeExecutions as any[];
      nodeProgress.push({
        nodeId,
        nodeName: execution.workflowData?.nodes?.find((n: any) => n.id === nodeId)?.name || nodeId,
        executionCount: executions.length,
        totalExecutionTime: executions.reduce((sum, e) => sum + (e.executionTime || 0), 0),
        hasError: executions.some(e => e.error),
        startTime: executions[0]?.startTime,
        data: {
          inputItems: executions[0]?.data?.main?.[0]?.length || 0,
          outputItems: executions[executions.length - 1]?.data?.main?.[0]?.length || 0
        }
      });
    }

    return nodeProgress.sort((a, b) => (a.startTime || 0) - (b.startTime || 0));
  }

  getMetadata(): IToolMetadata {
    return {
      category: 'monitoring',
      isMutating: false,
      requirements: ['n8n API access'],
      tags: ['execution', 'monitoring', 'real-time', 'websocket', 'sse']
    };
  }
}