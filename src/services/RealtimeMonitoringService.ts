import { EventEmitter } from 'events';
import { WebSocketService } from './WebSocketService.js';
import { SSEService } from './SSEService.js';
import { N8nApiClient } from './N8nApiClient.js';
import { Logger } from '../utils/Logger.js';
import { SimpleCache } from '../utils/SimpleCache.js';

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

export class RealtimeMonitoringService extends EventEmitter {
  private protocol: MonitoringProtocol;
  private apiClient: N8nApiClient;
  private wsService?: WebSocketService;
  private sseService?: SSEService;
  private pollingTimers = new Map<string, NodeJS.Timeout>();
  private monitoredExecutions = new Map<string, any>();
  private metricsCache = new SimpleCache<IWorkflowMetrics>({ defaultTtl: 300000 }); // 5 min cache
  private logger = new Logger('RealtimeMonitoring');

  constructor(options: IMonitoringOptions) {
    super();
    this.apiClient = options.apiClient;
    this.protocol = options.protocol || this.detectBestProtocol(options);
    
    this.initializeProtocol(options);
  }

  /**
   * Start monitoring
   */
  async start(): Promise<void> {
    this.logger.info('Starting realtime monitoring', { protocol: this.protocol });

    switch (this.protocol) {
      case 'websocket':
        if (this.wsService) {
          await this.wsService.connect();
          this.setupWebSocketHandlers();
        }
        break;

      case 'sse':
        if (this.sseService) {
          await this.sseService.connect();
          this.setupSSEHandlers();
        }
        break;

      case 'polling':
        this.logger.info('Using polling mode for monitoring');
        break;
    }

    this.emit('started', { protocol: this.protocol });
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    this.logger.info('Stopping realtime monitoring');

    // Clear all polling timers
    this.pollingTimers.forEach(timer => clearInterval(timer));
    this.pollingTimers.clear();
    this.monitoredExecutions.clear();

    // Disconnect services
    if (this.wsService) {
      this.wsService.disconnect();
    }
    if (this.sseService) {
      this.sseService.disconnect();
    }

    this.emit('stopped');
  }

  /**
   * Monitor a specific execution
   */
  async monitorExecution(executionId: string, options?: {
    includeProgress?: boolean;
    pollingInterval?: number;
  }): Promise<void> {
    if (this.monitoredExecutions.has(executionId)) {
      this.logger.debug('Already monitoring execution', { executionId });
      return;
    }

    this.logger.info('Starting execution monitoring', { executionId, protocol: this.protocol });

    switch (this.protocol) {
      case 'websocket':
        if (this.wsService?.isConnected) {
          this.wsService.subscribe(`execution:${executionId}`);
          this.monitoredExecutions.set(executionId, { startTime: Date.now() });
        } else {
          throw new Error('WebSocket not connected');
        }
        break;

      case 'sse':
        if (this.sseService?.isConnected) {
          this.sseService.subscribe(`execution:${executionId}`);
          this.monitoredExecutions.set(executionId, { startTime: Date.now() });
        } else {
          throw new Error('SSE not connected');
        }
        break;

      case 'polling':
        await this.startPollingExecution(executionId, options);
        break;
    }

    this.emit('execution:monitoring:started', { executionId });
  }

  /**
   * Stop monitoring an execution
   */
  stopMonitoringExecution(executionId: string): void {
    if (!this.monitoredExecutions.has(executionId)) {
      return;
    }

    this.logger.info('Stopping execution monitoring', { executionId });

    switch (this.protocol) {
      case 'websocket':
        this.wsService?.unsubscribe(`execution:${executionId}`);
        break;

      case 'sse':
        this.sseService?.unsubscribe(`execution:${executionId}`);
        break;

      case 'polling':
        const timer = this.pollingTimers.get(executionId);
        if (timer) {
          clearInterval(timer);
          this.pollingTimers.delete(executionId);
        }
        break;
    }

    this.monitoredExecutions.delete(executionId);
    this.emit('execution:monitoring:stopped', { executionId });
  }

  /**
   * Monitor workflow metrics
   */
  async monitorWorkflowMetrics(workflowId: string, options?: {
    interval?: number;
    includePastExecutions?: boolean;
  }): Promise<void> {
    const interval = options?.interval || 60000; // 1 minute default

    // Initial metrics fetch
    await this.updateWorkflowMetrics(workflowId, options?.includePastExecutions);

    // Set up periodic updates
    const timer = setInterval(async () => {
      try {
        await this.updateWorkflowMetrics(workflowId, false);
      } catch (error) {
        this.logger.error('Failed to update workflow metrics', { error, workflowId });
      }
    }, interval);

    this.pollingTimers.set(`metrics:${workflowId}`, timer);
    
    this.emit('workflow:metrics:started', { workflowId });
  }

  /**
   * Get current metrics for a workflow
   */
  async getWorkflowMetrics(workflowId: string): Promise<IWorkflowMetrics | null> {
    const cached = this.metricsCache.get(workflowId);
    if (cached) {
      return cached;
    }

    await this.updateWorkflowMetrics(workflowId, true);
    return this.metricsCache.get(workflowId) || null;
  }

  /**
   * Get monitoring status
   */
  getStatus(): {
    protocol: MonitoringProtocol;
    connected: boolean;
    monitoredExecutions: string[];
    monitoredWorkflows: string[];
  } {
    let connected = false;

    switch (this.protocol) {
      case 'websocket':
        connected = this.wsService?.isConnected || false;
        break;
      case 'sse':
        connected = this.sseService?.isConnected || false;
        break;
      case 'polling':
        connected = true;
        break;
    }

    const monitoredWorkflows = Array.from(this.pollingTimers.keys())
      .filter(key => key.startsWith('metrics:'))
      .map(key => key.replace('metrics:', ''));

    return {
      protocol: this.protocol,
      connected,
      monitoredExecutions: Array.from(this.monitoredExecutions.keys()),
      monitoredWorkflows
    };
  }

  /**
   * Detect best protocol based on available options
   */
  private detectBestProtocol(options: IMonitoringOptions): MonitoringProtocol {
    if (options.wsUrl) {
      return 'websocket';
    }
    if (options.sseUrl) {
      return 'sse';
    }
    return 'polling';
  }

  /**
   * Initialize protocol-specific service
   */
  private initializeProtocol(options: IMonitoringOptions): void {
    switch (this.protocol) {
      case 'websocket':
        if (!options.wsUrl) {
          throw new Error('WebSocket URL required for WebSocket protocol');
        }
        this.wsService = new WebSocketService({
          url: options.wsUrl,
          authToken: options.authToken
        });
        break;

      case 'sse':
        if (!options.sseUrl) {
          throw new Error('SSE URL required for SSE protocol');
        }
        this.sseService = new SSEService({
          url: options.sseUrl,
          authToken: options.authToken
        });
        break;

      case 'polling':
        // No initialization needed for polling
        break;
    }
  }

  /**
   * Set up WebSocket event handlers
   */
  private setupWebSocketHandlers(): void {
    if (!this.wsService) return;

    this.wsService.on('message', (message) => {
      if (message.topic?.startsWith('execution:')) {
        const executionId = message.topic.replace('execution:', '');
        this.handleExecutionUpdate(executionId, message.data);
      }
    });

    this.wsService.on('error', (error) => {
      this.logger.error('WebSocket error', { error });
      this.emit('error', error);
    });

    this.wsService.on('disconnected', () => {
      this.emit('disconnected');
    });

    this.wsService.on('reconnecting', (info) => {
      this.emit('reconnecting', info);
    });
  }

  /**
   * Set up SSE event handlers
   */
  private setupSSEHandlers(): void {
    if (!this.sseService) return;

    this.sseService.on('message', (message) => {
      if (message.event?.startsWith('execution:')) {
        const executionId = message.event.replace('execution:', '');
        this.handleExecutionUpdate(executionId, message.data);
      }
    });

    this.sseService.on('error', (error) => {
      this.logger.error('SSE error', { error });
      this.emit('error', error);
    });

    this.sseService.on('disconnected', () => {
      this.emit('disconnected');
    });

    this.sseService.on('reconnecting', (info) => {
      this.emit('reconnecting', info);
    });
  }

  /**
   * Start polling for execution updates
   */
  private async startPollingExecution(executionId: string, options?: {
    includeProgress?: boolean;
    pollingInterval?: number;
  }): Promise<void> {
    const interval = options?.pollingInterval || 2000;
    let lastStatus: string | null = null;

    // Initial fetch
    try {
      const execution = await this.apiClient.request('GET', `/executions/${executionId}`);
      lastStatus = execution.status;
      this.handleExecutionUpdate(executionId, execution);
      this.monitoredExecutions.set(executionId, { startTime: Date.now(), lastStatus });
    } catch (error) {
      this.logger.error('Failed to fetch initial execution', { error, executionId });
      throw error;
    }

    // Set up polling
    const timer = setInterval(async () => {
      try {
        const execution = await this.apiClient.request('GET', `/executions/${executionId}`);
        
        // Check for changes
        if (execution.status !== lastStatus) {
          lastStatus = execution.status;
          this.handleExecutionUpdate(executionId, execution);
        }

        // Stop polling if execution is finished
        if (execution.finished) {
          this.stopMonitoringExecution(executionId);
        }
      } catch (error) {
        this.logger.error('Failed to poll execution', { error, executionId });
        this.emit('execution:error', { executionId, error });
      }
    }, interval);

    this.pollingTimers.set(executionId, timer);
  }

  /**
   * Handle execution update
   */
  private handleExecutionUpdate(executionId: string, data: any): void {
    const update: IExecutionUpdate = {
      executionId,
      workflowId: data.workflowId,
      status: data.status,
      timestamp: new Date().toISOString()
    };

    // Add progress information if available
    if (data.data?.resultData?.runData) {
      const nodeData = data.data.resultData.runData;
      const completedNodes = Object.keys(nodeData).length;
      
      update.progress = {
        completedNodes,
        totalNodes: data.workflowData?.nodes?.length || 0,
        currentNode: data.data.resultData.lastNodeExecuted
      };
    }

    // Add error information if available
    if (data.data?.resultData?.error) {
      update.error = data.data.resultData.error;
    }

    this.emit('execution:update', update);
    this.emit(`execution:${executionId}:update`, update);

    // Emit status-specific events
    if (data.finished) {
      this.emit('execution:finished', update);
      this.emit(`execution:${executionId}:finished`, update);
    }
  }

  /**
   * Update workflow metrics
   */
  private async updateWorkflowMetrics(workflowId: string, includePast = false): Promise<void> {
    try {
      // Get recent executions
      const executions = await this.apiClient.request('GET', '/executions', {
        params: {
          workflowId,
          limit: includePast ? 100 : 10
        }
      });

      // Calculate metrics
      const metrics: IWorkflowMetrics = {
        workflowId,
        executionCount: executions.length,
        successRate: 0,
        averageDuration: 0,
        activeExecutions: 0
      };

      let totalDuration = 0;
      let successCount = 0;

      executions.forEach((execution: any) => {
        if (execution.status === 'success') {
          successCount++;
        }

        if (!execution.finished) {
          metrics.activeExecutions++;
        }

        if (execution.startedAt && execution.stoppedAt) {
          const duration = new Date(execution.stoppedAt).getTime() - 
                          new Date(execution.startedAt).getTime();
          totalDuration += duration;
        }

        if (!metrics.lastExecution || new Date(execution.startedAt) > metrics.lastExecution) {
          metrics.lastExecution = new Date(execution.startedAt);
        }
      });

      metrics.successRate = executions.length > 0 ? (successCount / executions.length) * 100 : 0;
      metrics.averageDuration = executions.length > 0 ? totalDuration / executions.length : 0;

      // Cache and emit
      this.metricsCache.set(workflowId, metrics);
      this.emit('workflow:metrics:update', metrics);

    } catch (error) {
      this.logger.error('Failed to update workflow metrics', { error, workflowId });
      throw error;
    }
  }
}