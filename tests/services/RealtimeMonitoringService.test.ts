import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RealtimeMonitoringService, IMonitoringOptions, IExecutionUpdate, IWorkflowMetrics } from '../../src/services/RealtimeMonitoringService.js';
import { N8nApiClient } from '../../src/services/N8nApiClient.js';
import { WebSocketService } from '../../src/services/WebSocketService.js';
import { SSEService } from '../../src/services/SSEService.js';
import { EventEmitter } from 'events';

// Mock dependencies
vi.mock('../../src/services/WebSocketService.js');
vi.mock('../../src/services/SSEService.js');

describe('RealtimeMonitoringService', () => {
  let service: RealtimeMonitoringService;
  let mockApiClient: any;
  let mockWsService: any;
  let mockSseService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockApiClient = {
      request: vi.fn()
    };

    // Create mock WebSocket service
    mockWsService = new EventEmitter();
    mockWsService.connect = vi.fn().mockResolvedValue(undefined);
    mockWsService.disconnect = vi.fn();
    mockWsService.subscribe = vi.fn();
    mockWsService.unsubscribe = vi.fn();
    mockWsService.isConnected = false;

    // Create mock SSE service
    mockSseService = new EventEmitter();
    mockSseService.connect = vi.fn().mockResolvedValue(undefined);
    mockSseService.disconnect = vi.fn();
    mockSseService.subscribe = vi.fn();
    mockSseService.unsubscribe = vi.fn();
    mockSseService.isConnected = false;

    // Mock constructors
    (WebSocketService as any).mockImplementation(() => mockWsService);
    (SSEService as any).mockImplementation(() => mockSseService);
  });

  afterEach(() => {
    if (service) {
      service.stop();
    }
    vi.useRealTimers();
  });

  describe('Constructor and Protocol Detection', () => {
    it('should initialize with WebSocket protocol when wsUrl provided', () => {
      const options: IMonitoringOptions = {
        apiClient: mockApiClient as N8nApiClient,
        wsUrl: 'ws://localhost:8080',
        authToken: 'test-token'
      };

      service = new RealtimeMonitoringService(options);

      expect(WebSocketService).toHaveBeenCalledWith({
        url: 'ws://localhost:8080',
        authToken: 'test-token'
      });
    });

    it('should initialize with SSE protocol when sseUrl provided', () => {
      const options: IMonitoringOptions = {
        apiClient: mockApiClient as N8nApiClient,
        sseUrl: 'http://localhost:8080/sse',
        authToken: 'test-token'
      };

      service = new RealtimeMonitoringService(options);

      expect(SSEService).toHaveBeenCalledWith({
        url: 'http://localhost:8080/sse',
        authToken: 'test-token'
      });
    });

    it('should default to polling protocol when no URLs provided', () => {
      const options: IMonitoringOptions = {
        apiClient: mockApiClient as N8nApiClient
      };

      service = new RealtimeMonitoringService(options);
      const status = service.getStatus();

      expect(status.protocol).toBe('polling');
      expect(WebSocketService).not.toHaveBeenCalled();
      expect(SSEService).not.toHaveBeenCalled();
    });

    it('should respect explicit protocol setting', () => {
      const options: IMonitoringOptions = {
        apiClient: mockApiClient as N8nApiClient,
        protocol: 'polling',
        wsUrl: 'ws://localhost:8080' // Should be ignored
      };

      service = new RealtimeMonitoringService(options);
      const status = service.getStatus();

      expect(status.protocol).toBe('polling');
      expect(WebSocketService).not.toHaveBeenCalled();
    });

    it('should throw error if protocol requires URL but none provided', () => {
      const options: IMonitoringOptions = {
        apiClient: mockApiClient as N8nApiClient,
        protocol: 'websocket'
      };

      expect(() => new RealtimeMonitoringService(options))
        .toThrow('WebSocket URL required for WebSocket protocol');
    });
  });

  describe('Start/Stop Operations', () => {
    it('should start WebSocket monitoring', async () => {
      service = new RealtimeMonitoringService({
        apiClient: mockApiClient,
        wsUrl: 'ws://localhost:8080'
      });

      const startedHandler = vi.fn();
      service.on('started', startedHandler);

      await service.start();

      expect(mockWsService.connect).toHaveBeenCalled();
      expect(startedHandler).toHaveBeenCalledWith({ protocol: 'websocket' });
    });

    it('should start SSE monitoring', async () => {
      service = new RealtimeMonitoringService({
        apiClient: mockApiClient,
        sseUrl: 'http://localhost:8080/sse'
      });

      const startedHandler = vi.fn();
      service.on('started', startedHandler);

      await service.start();

      expect(mockSseService.connect).toHaveBeenCalled();
      expect(startedHandler).toHaveBeenCalledWith({ protocol: 'sse' });
    });

    it('should start polling monitoring', async () => {
      service = new RealtimeMonitoringService({
        apiClient: mockApiClient,
        protocol: 'polling'
      });

      const startedHandler = vi.fn();
      service.on('started', startedHandler);

      await service.start();

      expect(startedHandler).toHaveBeenCalledWith({ protocol: 'polling' });
    });

    it('should stop monitoring and clean up resources', () => {
      service = new RealtimeMonitoringService({
        apiClient: mockApiClient,
        wsUrl: 'ws://localhost:8080'
      });

      const stoppedHandler = vi.fn();
      service.on('stopped', stoppedHandler);

      service.stop();

      expect(mockWsService.disconnect).toHaveBeenCalled();
      expect(stoppedHandler).toHaveBeenCalled();
    });
  });

  describe('Execution Monitoring - WebSocket', () => {
    beforeEach(async () => {
      service = new RealtimeMonitoringService({
        apiClient: mockApiClient,
        wsUrl: 'ws://localhost:8080'
      });
      mockWsService.isConnected = true;
      await service.start();
    });

    it('should monitor execution via WebSocket', async () => {
      const monitoringStartedHandler = vi.fn();
      service.on('execution:monitoring:started', monitoringStartedHandler);

      await service.monitorExecution('exec-123');

      expect(mockWsService.subscribe).toHaveBeenCalledWith('execution:exec-123');
      expect(monitoringStartedHandler).toHaveBeenCalledWith({ executionId: 'exec-123' });
    });

    it('should not duplicate execution monitoring', async () => {
      await service.monitorExecution('exec-123');
      mockWsService.subscribe.mockClear();

      await service.monitorExecution('exec-123');

      expect(mockWsService.subscribe).not.toHaveBeenCalled();
    });

    it('should throw error if WebSocket not connected', async () => {
      mockWsService.isConnected = false;

      await expect(service.monitorExecution('exec-123'))
        .rejects.toThrow('WebSocket not connected');
    });

    it('should stop monitoring execution', () => {
      const monitoringStoppedHandler = vi.fn();
      service.on('execution:monitoring:stopped', monitoringStoppedHandler);

      service.monitorExecution('exec-123');
      service.stopMonitoringExecution('exec-123');

      expect(mockWsService.unsubscribe).toHaveBeenCalledWith('execution:exec-123');
      expect(monitoringStoppedHandler).toHaveBeenCalledWith({ executionId: 'exec-123' });
    });

    it('should handle WebSocket execution updates', async () => {
      const updateHandler = vi.fn();
      const finishedHandler = vi.fn();
      service.on('execution:update', updateHandler);
      service.on('execution:finished', finishedHandler);

      await service.monitorExecution('exec-123');

      // Simulate WebSocket message
      const executionData = {
        workflowId: 'wf-1',
        status: 'success',
        finished: true,
        data: {
          resultData: {
            runData: {
              node1: {},
              node2: {}
            },
            lastNodeExecuted: 'node2'
          }
        },
        workflowData: {
          nodes: [{}, {}, {}]
        }
      };

      mockWsService.emit('message', {
        topic: 'execution:exec-123',
        data: executionData
      });

      expect(updateHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          executionId: 'exec-123',
          workflowId: 'wf-1',
          status: 'success',
          progress: {
            completedNodes: 2,
            totalNodes: 3,
            currentNode: 'node2'
          }
        })
      );
      expect(finishedHandler).toHaveBeenCalled();
    });

    it('should handle WebSocket errors', () => {
      const errorHandler = vi.fn();
      service.on('error', errorHandler);

      const error = new Error('WebSocket error');
      mockWsService.emit('error', error);

      expect(errorHandler).toHaveBeenCalledWith(error);
    });

    it('should emit disconnected event', () => {
      const disconnectedHandler = vi.fn();
      service.on('disconnected', disconnectedHandler);

      mockWsService.emit('disconnected');

      expect(disconnectedHandler).toHaveBeenCalled();
    });

    it('should emit reconnecting event', () => {
      const reconnectingHandler = vi.fn();
      service.on('reconnecting', reconnectingHandler);

      const info = { attempt: 1, nextAttemptIn: 1000 };
      mockWsService.emit('reconnecting', info);

      expect(reconnectingHandler).toHaveBeenCalledWith(info);
    });
  });

  describe('Execution Monitoring - SSE', () => {
    beforeEach(async () => {
      service = new RealtimeMonitoringService({
        apiClient: mockApiClient,
        sseUrl: 'http://localhost:8080/sse'
      });
      mockSseService.isConnected = true;
      await service.start();
    });

    it('should monitor execution via SSE', async () => {
      await service.monitorExecution('exec-456');

      expect(mockSseService.subscribe).toHaveBeenCalledWith('execution:exec-456');
    });

    it('should handle SSE execution updates', async () => {
      const updateHandler = vi.fn();
      service.on('execution:exec-456:update', updateHandler);

      await service.monitorExecution('exec-456');

      // Simulate SSE message
      mockSseService.emit('message', {
        event: 'execution:exec-456',
        data: {
          workflowId: 'wf-2',
          status: 'running',
          finished: false
        }
      });

      expect(updateHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          executionId: 'exec-456',
          workflowId: 'wf-2',
          status: 'running'
        })
      );
    });

    it('should handle execution with errors', async () => {
      const updateHandler = vi.fn();
      service.on('execution:update', updateHandler);

      await service.monitorExecution('exec-error');

      mockSseService.emit('message', {
        event: 'execution:exec-error',
        data: {
          workflowId: 'wf-3',
          status: 'error',
          finished: true,
          data: {
            resultData: {
              error: {
                message: 'Node failed',
                node: 'HTTP Request'
              }
            }
          }
        }
      });

      expect(updateHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          executionId: 'exec-error',
          status: 'error',
          error: {
            message: 'Node failed',
            node: 'HTTP Request'
          }
        })
      );
    });
  });

  describe('Execution Monitoring - Polling', () => {
    beforeEach(() => {
      service = new RealtimeMonitoringService({
        apiClient: mockApiClient,
        protocol: 'polling'
      });
    });

    it('should start polling for execution updates', async () => {
      const mockExecution = {
        id: 'exec-789',
        workflowId: 'wf-4',
        status: 'running',
        finished: false
      };

      mockApiClient.request.mockResolvedValue(mockExecution);

      await service.monitorExecution('exec-789', { pollingInterval: 100 });

      expect(mockApiClient.request).toHaveBeenCalledWith('GET', '/executions/exec-789');
    });

    it('should detect status changes during polling', async () => {
      const updateHandler = vi.fn();
      service.on('execution:update', updateHandler);

      // Initial state
      mockApiClient.request.mockResolvedValueOnce({
        id: 'exec-789',
        workflowId: 'wf-4',
        status: 'running',
        finished: false
      });

      await service.monitorExecution('exec-789', { pollingInterval: 100 });
      expect(updateHandler).toHaveBeenCalledTimes(1);

      // Status change
      mockApiClient.request.mockResolvedValueOnce({
        id: 'exec-789',
        workflowId: 'wf-4',
        status: 'success',
        finished: true
      });

      vi.advanceTimersByTime(100);
      await vi.runOnlyPendingTimersAsync();

      expect(updateHandler).toHaveBeenCalledTimes(2);
      expect(updateHandler).toHaveBeenLastCalledWith(
        expect.objectContaining({
          status: 'success'
        })
      );
    });

    it('should stop polling when execution finishes', async () => {
      mockApiClient.request
        .mockResolvedValueOnce({
          id: 'exec-stop',
          workflowId: 'wf-5',
          status: 'running',
          finished: false
        })
        .mockResolvedValueOnce({
          id: 'exec-stop',
          workflowId: 'wf-5',
          status: 'success',
          finished: true
        });

      await service.monitorExecution('exec-stop', { pollingInterval: 100 });
      const initialTimers = service.getStatus().monitoredExecutions.length;

      vi.advanceTimersByTime(100);
      await vi.runOnlyPendingTimersAsync();

      expect(service.getStatus().monitoredExecutions).not.toContain('exec-stop');
    });

    it('should handle polling errors', async () => {
      const errorHandler = vi.fn();
      service.on('execution:error', errorHandler);

      mockApiClient.request
        .mockResolvedValueOnce({
          id: 'exec-error',
          workflowId: 'wf-6',
          status: 'running',
          finished: false
        })
        .mockRejectedValueOnce(new Error('API error'));

      await service.monitorExecution('exec-error', { pollingInterval: 100 });

      vi.advanceTimersByTime(100);
      await vi.runOnlyPendingTimersAsync();

      expect(errorHandler).toHaveBeenCalledWith({
        executionId: 'exec-error',
        error: expect.any(Error)
      });
    });

    it('should handle initial fetch error', async () => {
      mockApiClient.request.mockRejectedValue(new Error('Execution not found'));

      await expect(service.monitorExecution('exec-notfound'))
        .rejects.toThrow('Execution not found');
    });
  });

  describe('Workflow Metrics Monitoring', () => {
    beforeEach(() => {
      service = new RealtimeMonitoringService({
        apiClient: mockApiClient,
        protocol: 'polling'
      });
    });

    it('should monitor workflow metrics', async () => {
      const mockExecutions = [
        {
          status: 'success',
          finished: true,
          startedAt: '2024-01-15T10:00:00Z',
          stoppedAt: '2024-01-15T10:01:00Z'
        },
        {
          status: 'error',
          finished: true,
          startedAt: '2024-01-15T10:02:00Z',
          stoppedAt: '2024-01-15T10:03:00Z'
        },
        {
          status: 'running',
          finished: false,
          startedAt: '2024-01-15T10:04:00Z'
        }
      ];

      mockApiClient.request.mockResolvedValue(mockExecutions);

      const metricsStartedHandler = vi.fn();
      const metricsUpdateHandler = vi.fn();
      service.on('workflow:metrics:started', metricsStartedHandler);
      service.on('workflow:metrics:update', metricsUpdateHandler);

      await service.monitorWorkflowMetrics('wf-metrics', { interval: 1000 });

      expect(metricsStartedHandler).toHaveBeenCalledWith({ workflowId: 'wf-metrics' });
      expect(metricsUpdateHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          workflowId: 'wf-metrics',
          executionCount: 3,
          successRate: expect.closeTo(33.33, 2),
          averageDuration: 40000,
          activeExecutions: 1,
          lastExecution: expect.any(Date)
        })
      );
    });

    it.skip('should update metrics periodically', async () => {
      // Clear any previous mock calls
      vi.clearAllMocks();
      mockApiClient.request.mockResolvedValue([]);
      
      await service.monitorWorkflowMetrics('wf-periodic', { interval: 100 });
      const initialCallCount = mockApiClient.request.mock.calls.length;
      expect(initialCallCount).toBeGreaterThanOrEqual(1);

      vi.advanceTimersByTime(100);
      await vi.runOnlyPendingTimersAsync();

      expect(mockApiClient.request).toHaveBeenCalledTimes(initialCallCount + 1);
    });

    it('should handle metrics update errors', async () => {
      mockApiClient.request
        .mockResolvedValueOnce([])
        .mockRejectedValueOnce(new Error('API error'));

      await service.monitorWorkflowMetrics('wf-error', { interval: 100 });

      // Should not throw on periodic update error
      vi.advanceTimersByTime(100);
      await vi.runOnlyPendingTimersAsync();
    });

    it('should cache workflow metrics', async () => {
      const mockMetrics = [
        {
          status: 'success',
          finished: true,
          startedAt: '2024-01-15T10:00:00Z',
          stoppedAt: '2024-01-15T10:01:00Z'
        }
      ];

      mockApiClient.request.mockResolvedValue(mockMetrics);

      // First call should fetch from API
      const metrics1 = await service.getWorkflowMetrics('wf-cache');
      expect(mockApiClient.request).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const metrics2 = await service.getWorkflowMetrics('wf-cache');
      expect(mockApiClient.request).toHaveBeenCalledTimes(1);
      expect(metrics2).toEqual(metrics1);
    });

    it('should include past executions when requested', async () => {
      mockApiClient.request.mockResolvedValue([]); // Ensure executions array is returned
      
      await service.monitorWorkflowMetrics('wf-past', {
        includePastExecutions: true
      });

      expect(mockApiClient.request).toHaveBeenCalledWith('GET', '/executions', {
        params: {
          workflowId: 'wf-past',
          limit: 100
        }
      });
    });

    it('should calculate metrics correctly with empty executions', async () => {
      mockApiClient.request.mockResolvedValue([]);

      const metricsUpdateHandler = vi.fn();
      service.on('workflow:metrics:update', metricsUpdateHandler);

      await service.monitorWorkflowMetrics('wf-empty');

      expect(metricsUpdateHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          executionCount: 0,
          successRate: 0,
          averageDuration: 0,
          activeExecutions: 0
        })
      );
    });
  });

  describe('Status Reporting', () => {
    it('should report WebSocket status', async () => {
      service = new RealtimeMonitoringService({
        apiClient: mockApiClient,
        wsUrl: 'ws://localhost:8080'
      });

      mockWsService.isConnected = true;
      await service.start();
      await service.monitorExecution('exec-1');

      const status = service.getStatus();

      expect(status).toEqual({
        protocol: 'websocket',
        connected: true,
        monitoredExecutions: ['exec-1'],
        monitoredWorkflows: []
      });
    });

    it('should report SSE status', async () => {
      service = new RealtimeMonitoringService({
        apiClient: mockApiClient,
        sseUrl: 'http://localhost:8080/sse'
      });

      mockSseService.isConnected = false;
      const status = service.getStatus();

      expect(status).toEqual({
        protocol: 'sse',
        connected: false,
        monitoredExecutions: [],
        monitoredWorkflows: []
      });
    });

    it('should report polling status with monitored items', async () => {
      service = new RealtimeMonitoringService({
        apiClient: mockApiClient,
        protocol: 'polling'
      });

      // Mock execution response for monitorExecution
      mockApiClient.request.mockResolvedValueOnce({
        id: 'exec-1',
        workflowId: 'wf-1',
        status: 'running',
        finished: false
      });

      // Mock executions array for monitorWorkflowMetrics
      mockApiClient.request.mockResolvedValueOnce([]);

      await service.monitorExecution('exec-1');
      await service.monitorWorkflowMetrics('wf-1');

      const status = service.getStatus();

      expect(status).toEqual({
        protocol: 'polling',
        connected: true,
        monitoredExecutions: ['exec-1'],
        monitoredWorkflows: ['wf-1']
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle WebSocket connection failure', async () => {
      service = new RealtimeMonitoringService({
        apiClient: mockApiClient,
        wsUrl: 'ws://localhost:8080'
      });

      mockWsService.connect.mockRejectedValue(new Error('Connection failed'));

      await expect(service.start()).rejects.toThrow('Connection failed');
    });

    it('should handle SSE connection failure', async () => {
      service = new RealtimeMonitoringService({
        apiClient: mockApiClient,
        sseUrl: 'http://localhost:8080/sse'
      });

      mockSseService.connect.mockRejectedValue(new Error('SSE connection failed'));

      await expect(service.start()).rejects.toThrow('SSE connection failed');
    });

    it('should ignore stop monitoring for non-monitored execution', () => {
      service = new RealtimeMonitoringService({
        apiClient: mockApiClient,
        protocol: 'polling'
      });

      // Should not throw
      expect(() => service.stopMonitoringExecution('unknown')).not.toThrow();
    });
  });

  describe('Multiple Protocol Switching', () => {
    it('should properly clean up when stopping with multiple monitored items', async () => {
      service = new RealtimeMonitoringService({
        apiClient: mockApiClient,
        protocol: 'polling'
      });

      // Mock responses for each operation
      mockApiClient.request
        .mockResolvedValueOnce({ // exec-1
          id: 'exec-1',
          workflowId: 'wf-1',
          status: 'running',
          finished: false
        })
        .mockResolvedValueOnce({ // exec-2
          id: 'exec-2',
          workflowId: 'wf-1',
          status: 'running',
          finished: false
        })
        .mockResolvedValueOnce([]) // wf-1 metrics
        .mockResolvedValueOnce([]); // wf-2 metrics

      // Monitor multiple items
      await service.monitorExecution('exec-1');
      await service.monitorExecution('exec-2');
      await service.monitorWorkflowMetrics('wf-1');
      await service.monitorWorkflowMetrics('wf-2');

      expect(service.getStatus().monitoredExecutions).toHaveLength(2);
      expect(service.getStatus().monitoredWorkflows).toHaveLength(2);

      service.stop();

      expect(service.getStatus().monitoredExecutions).toHaveLength(0);
      expect(service.getStatus().monitoredWorkflows).toHaveLength(0);
    });
  });
});