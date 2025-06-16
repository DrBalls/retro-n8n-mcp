import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { RealtimeExecutionMonitorTool } from '../../../src/tools/monitoring/RealtimeExecutionMonitorTool.js';
import { IToolContext } from '../../../src/tools/base/Tool.js';

describe('RealtimeExecutionMonitorTool', () => {
  let tool: RealtimeExecutionMonitorTool;
  let mockApiClient: any;
  let mockMonitoringService: any;

  beforeEach(() => {
    tool = new RealtimeExecutionMonitorTool();
    
    mockApiClient = {
      request: vi.fn()
    };

    mockMonitoringService = {
      monitorExecution: vi.fn(),
      getWorkflowMetrics: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      once: vi.fn()
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Properties', () => {
    it('should have correct name', () => {
      expect(tool.name).toBe('monitor_execution_realtime');
    });

    it('should have a description', () => {
      expect(tool.description).toBe('Monitor execution progress in real-time using WebSocket, SSE, or polling');
    });

    it('should have correct metadata', () => {
      const metadata = tool.getMetadata();
      expect(metadata.category).toBe('monitoring');
      expect(metadata.isMutating).toBe(false);
      expect(metadata.requirements).toContain('n8n API access');
      expect(metadata.requirements).toContain('Real-time service (optional)');
      expect(metadata.tags).toContain('realtime');
      expect(metadata.tags).toContain('websocket');
      expect(metadata.tags).toContain('sse');
    });

    it('should have valid input schema', () => {
      const schema = tool.inputSchema;
      expect(schema).toBeDefined();
      expect(schema._def).toBeDefined();
    });
  });

  describe('Input Validation', () => {
    it('should require executionId', async () => {
      await expect(
        tool.execute({}, { apiClient: mockApiClient })
      ).rejects.toThrow('Input validation failed');
    });

    it('should accept optional protocol parameter', async () => {
      mockApiClient.request.mockResolvedValue({
        id: '123',
        status: 'success',
        finished: true
      });

      await tool.execute(
        { executionId: '123', protocol: 'websocket' },
        { apiClient: mockApiClient, monitoringService: mockMonitoringService }
      );

      expect(mockMonitoringService.monitorExecution).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({
          protocol: 'websocket'
        })
      );
    });

    it('should accept optional duration parameter', async () => {
      mockApiClient.request.mockResolvedValue({
        id: '123',
        status: 'success',
        finished: true
      });

      await tool.execute(
        { executionId: '123', duration: 60000 },
        { apiClient: mockApiClient, monitoringService: mockMonitoringService }
      );

      expect(mockMonitoringService.monitorExecution).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({
          duration: 60000
        })
      );
    });
  });

  describe('Real-time Monitoring with Service', () => {
    it('should use monitoring service when available', async () => {
      const mockExecution = {
        id: '123',
        workflowId: 'wf-456',
        status: 'success',
        finished: true,
        mode: 'manual',
        startedAt: '2024-01-15T10:00:00.000Z',
        stoppedAt: '2024-01-15T10:00:05.000Z'
      };

      mockApiClient.request.mockResolvedValue(mockExecution);

      // Simulate monitoring events
      mockMonitoringService.monitorExecution.mockImplementation((id, options) => {
        // Simulate immediate completion
        setTimeout(() => {
          const handler = mockMonitoringService.on.mock.calls.find(
            call => call[0] === `execution:${id}:update`
          )?.[1];
          
          if (handler) {
            handler({
              status: 'running',
              progress: { completed: 50, total: 100 }
            });
            handler({
              status: 'success',
              progress: { completed: 100, total: 100 }
            });
          }
        }, 10);

        return Promise.resolve();
      });

      const result = await tool.execute(
        { executionId: '123', protocol: 'websocket' },
        { apiClient: mockApiClient, monitoringService: mockMonitoringService }
      );

      expect(mockMonitoringService.monitorExecution).toHaveBeenCalledWith('123', {
        protocol: 'websocket',
        includeProgress: true,
        duration: 300000
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      
      const response = JSON.parse(result.content[0].text!);
      expect(response.executionId).toBe('123');
      expect(response.protocol).toBe('websocket');
      expect(response.monitoring).toBeDefined();
    });

    it('should handle SSE protocol', async () => {
      mockApiClient.request.mockResolvedValue({
        id: '123',
        status: 'success',
        finished: true
      });

      await tool.execute(
        { executionId: '123', protocol: 'sse' },
        { apiClient: mockApiClient, monitoringService: mockMonitoringService }
      );

      expect(mockMonitoringService.monitorExecution).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({
          protocol: 'sse'
        })
      );
    });

    it('should collect execution updates', async () => {
      const updates: any[] = [];
      
      mockApiClient.request.mockResolvedValue({
        id: '123',
        status: 'success',
        finished: true
      });

      mockMonitoringService.on.mockImplementation((event, handler) => {
        if (event === 'execution:123:update') {
          // Simulate multiple updates
          setTimeout(() => {
            handler({ status: 'running', timestamp: '2024-01-15T10:00:01.000Z' });
            handler({ status: 'running', progress: 50, timestamp: '2024-01-15T10:00:02.000Z' });
            handler({ status: 'success', timestamp: '2024-01-15T10:00:03.000Z' });
          }, 10);
        }
      });

      const result = await tool.execute(
        { executionId: '123', includeProgress: true },
        { apiClient: mockApiClient, monitoringService: mockMonitoringService }
      );

      const response = JSON.parse(result.content[0].text!);
      expect(response.monitoring.updates).toBeDefined();
      expect(response.monitoring.updates.length).toBeGreaterThan(0);
    });

    it('should handle monitoring timeout', async () => {
      mockApiClient.request.mockResolvedValue({
        id: '123',
        status: 'running',
        finished: false
      });

      mockMonitoringService.monitorExecution.mockImplementation(() => {
        // Don't send any updates to simulate timeout
        return new Promise(resolve => setTimeout(resolve, 100));
      });

      const result = await tool.execute(
        { executionId: '123', duration: 100 },
        { apiClient: mockApiClient, monitoringService: mockMonitoringService }
      );

      const response = JSON.parse(result.content[0].text!);
      expect(response.monitoring.timedOut).toBe(true);
      expect(response.finalState.status).toBe('running');
    });
  });

  describe('Polling Fallback', () => {
    it('should fall back to polling when monitoring service is not available', async () => {
      const runningExecution = {
        id: '123',
        workflowId: 'wf-456',
        status: 'running',
        finished: false,
        mode: 'manual',
        startedAt: '2024-01-15T10:00:00.000Z'
      };

      const completedExecution = {
        ...runningExecution,
        status: 'success',
        finished: true,
        stoppedAt: '2024-01-15T10:00:05.000Z'
      };

      mockApiClient.request
        .mockResolvedValueOnce(runningExecution)
        .mockResolvedValueOnce(runningExecution)
        .mockResolvedValueOnce(completedExecution);

      const result = await tool.execute(
        { executionId: '123', pollingInterval: 50 },
        { apiClient: mockApiClient } // No monitoring service
      );

      expect(mockApiClient.request).toHaveBeenCalledTimes(3);
      expect(mockApiClient.request).toHaveBeenCalledWith(
        'GET',
        '/executions/123',
        { params: { includeData: true } }
      );

      const response = JSON.parse(result.content[0].text!);
      expect(response.protocol).toBe('polling');
      expect(response.monitoring.updates).toBeDefined();
      expect(response.finalState.status).toBe('success');
    });

    it('should respect polling interval', async () => {
      const startTime = Date.now();
      
      mockApiClient.request.mockResolvedValue({
        id: '123',
        status: 'running',
        finished: false
      });

      const result = await tool.execute(
        { executionId: '123', pollingInterval: 100, duration: 250 },
        { apiClient: mockApiClient }
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should have made ~3 requests (initial + 2 polls in 250ms with 100ms interval)
      expect(mockApiClient.request).toHaveBeenCalledTimes(3);
      expect(duration).toBeGreaterThan(200);
      expect(duration).toBeLessThan(400);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when API client is not configured', async () => {
      await expect(
        tool.execute({ executionId: '123' }, {})
      ).rejects.toThrow('n8n API client not configured');
    });

    it('should handle API errors during monitoring', async () => {
      mockApiClient.request.mockRejectedValue(new Error('API Error'));

      await expect(
        tool.execute(
          { executionId: '123' },
          { apiClient: mockApiClient, monitoringService: mockMonitoringService }
        )
      ).rejects.toThrow('API Error');
    });

    it('should handle monitoring service errors', async () => {
      mockApiClient.request.mockResolvedValue({
        id: '123',
        status: 'running',
        finished: false
      });

      mockMonitoringService.monitorExecution.mockRejectedValue(
        new Error('WebSocket connection failed')
      );

      // Should fall back to polling
      const result = await tool.execute(
        { executionId: '123', protocol: 'websocket', pollingInterval: 50, duration: 100 },
        { apiClient: mockApiClient, monitoringService: mockMonitoringService }
      );

      const response = JSON.parse(result.content[0].text!);
      expect(response.protocol).toBe('polling');
      expect(response.warning).toContain('Falling back to polling');
    });
  });

  describe('Response Format', () => {
    it('should return comprehensive monitoring report', async () => {
      const execution = {
        id: '123',
        workflowId: 'wf-456',
        status: 'success',
        finished: true,
        mode: 'manual',
        startedAt: '2024-01-15T10:00:00.000Z',
        stoppedAt: '2024-01-15T10:00:05.000Z',
        data: {
          resultData: {
            runData: {
              'Start': [{ executionTime: 10 }],
              'HTTP Request': [{ executionTime: 100 }]
            },
            lastNodeExecuted: 'HTTP Request'
          }
        }
      };

      mockApiClient.request.mockResolvedValue(execution);

      const result = await tool.execute(
        { executionId: '123' },
        { apiClient: mockApiClient, monitoringService: mockMonitoringService }
      );

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].mimeType).toBe('application/json');

      const response = JSON.parse(result.content[0].text!);
      expect(response).toHaveProperty('executionId', '123');
      expect(response).toHaveProperty('protocol');
      expect(response).toHaveProperty('monitoring');
      expect(response.monitoring).toHaveProperty('startTime');
      expect(response.monitoring).toHaveProperty('endTime');
      expect(response.monitoring).toHaveProperty('duration');
      expect(response.monitoring).toHaveProperty('updates');
      expect(response).toHaveProperty('finalState');
      expect(response.finalState).toHaveProperty('id', '123');
      expect(response.finalState).toHaveProperty('workflowId', 'wf-456');
      expect(response.finalState).toHaveProperty('status', 'success');
      expect(response.finalState).toHaveProperty('duration');
      expect(response.finalState).toHaveProperty('nodesExecuted', 2);
      expect(response.finalState).toHaveProperty('lastNodeExecuted', 'HTTP Request');
    });
  });
});