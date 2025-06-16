import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MonitoringResourceProvider, IMonitoringResourceOptions } from '../../src/resources/MonitoringResourceProvider.js';
import { RealtimeMonitoringService } from '../../src/services/RealtimeMonitoringService.js';
import { N8nApiClient } from '../../src/services/N8nApiClient.js';

describe('MonitoringResourceProvider', () => {
  let provider: MonitoringResourceProvider;
  let mockApiClient: any;
  let mockMonitoringService: any;

  beforeEach(() => {
    mockApiClient = {
      request: vi.fn()
    };

    mockMonitoringService = {
      getStatus: vi.fn(),
      getWorkflowMetrics: vi.fn()
    };

    const options: IMonitoringResourceOptions = {
      apiClient: mockApiClient as N8nApiClient,
      monitoringService: mockMonitoringService as RealtimeMonitoringService,
      updateInterval: 5000
    };

    provider = new MonitoringResourceProvider(options);
  });

  describe('Constructor and Properties', () => {
    it('should initialize with required options', () => {
      expect(provider).toBeDefined();
      expect(provider.name).toBe('monitoring');
      expect(provider.description).toBe('Real-time monitoring data for workflows and executions');
    });

    it('should use default update interval if not provided', () => {
      const options: IMonitoringResourceOptions = {
        apiClient: mockApiClient as N8nApiClient
      };
      const providerWithDefaults = new MonitoringResourceProvider(options);
      expect((providerWithDefaults as any).updateInterval).toBe(5000);
    });
  });

  describe('listResources', () => {
    it('should list static and dynamic resources', async () => {
      // Mock API responses
      mockApiClient.request
        .mockImplementationOnce((method: string, path: string) => {
          if (path === '/workflows') {
            return Promise.resolve([
              { id: 'wf-1', name: 'Workflow 1', active: true },
              { id: 'wf-2', name: 'Workflow 2', active: true }
            ]);
          }
        })
        .mockImplementationOnce((method: string, path: string) => {
          if (path === '/executions') {
            return Promise.resolve([
              { id: 'exec-1', workflowId: 'wf-1', status: 'running', workflowData: { name: 'Workflow 1' } },
              { id: 'exec-2', workflowId: 'wf-2', status: 'running', workflowData: { name: 'Workflow 2' } }
            ]);
          }
        });

      const resources = await provider.listResources();

      // Check static resources
      expect(resources).toContainEqual({
        uri: 'monitoring://system/status',
        name: 'System Status',
        description: 'Real-time n8n system status and health metrics',
        mimeType: 'application/json'
      });

      expect(resources).toContainEqual({
        uri: 'monitoring://executions/active',
        name: 'Active Executions',
        description: 'Currently running workflow executions',
        mimeType: 'application/json'
      });

      expect(resources).toContainEqual({
        uri: 'monitoring://metrics/workflows',
        name: 'Workflow Metrics',
        description: 'Aggregated metrics for all workflows',
        mimeType: 'application/json'
      });

      // Check dynamic workflow resources
      expect(resources).toContainEqual({
        uri: 'monitoring://workflow/wf-1/status',
        name: 'Workflow 1 - Status',
        description: 'Real-time status for workflow: Workflow 1',
        mimeType: 'application/json'
      });

      expect(resources).toContainEqual({
        uri: 'monitoring://workflow/wf-1/metrics',
        name: 'Workflow 1 - Metrics',
        description: 'Performance metrics for workflow: Workflow 1',
        mimeType: 'application/json'
      });

      // Check dynamic execution resources
      expect(resources).toContainEqual({
        uri: 'monitoring://execution/exec-1',
        name: 'Execution exec-1',
        description: 'Monitor execution of workflow: Workflow 1',
        mimeType: 'application/json'
      });

      // Total: 3 static + 4 workflow resources (2 workflows * 2 types) + 2 execution resources
      expect(resources).toHaveLength(9);
    });

    it('should handle API errors gracefully', async () => {
      mockApiClient.request.mockRejectedValue(new Error('API error'));

      const resources = await provider.listResources();

      // Should still return static resources
      expect(resources).toHaveLength(3);
      expect(resources.every(r => 
        r.uri.startsWith('monitoring://system/') || 
        r.uri.startsWith('monitoring://executions/') || 
        r.uri.startsWith('monitoring://metrics/')
      )).toBe(true);
    });

    it('should handle empty workflow and execution lists', async () => {
      mockApiClient.request
        .mockResolvedValueOnce([]) // Empty workflows
        .mockResolvedValueOnce([]); // Empty executions

      const resources = await provider.listResources();

      // Only static resources
      expect(resources).toHaveLength(3);
    });
  });

  describe('readResource', () => {
    describe('system status', () => {
      it('should return system status', async () => {
        mockApiClient.request.mockImplementation((method: string, path: string) => {
          if (path === '/version') return Promise.resolve({ version: '0.233.0' });
          if (path === '/executions') return Promise.resolve({ count: 100 });
          if (path === '/workflows') return Promise.resolve({ count: 20 });
          return Promise.reject(new Error('Unknown path'));
        });

        mockMonitoringService.getStatus.mockReturnValue({
          protocol: 'websocket',
          connected: true,
          monitoredExecutions: ['exec-1'],
          monitoredWorkflows: ['wf-1']
        });

        const result = await provider.readResource('monitoring://system/status');
        const status = JSON.parse(result);

        expect(status).toHaveProperty('timestamp');
        expect(status.status).toBe('healthy');
        expect(status.version).toEqual({ version: '0.233.0' });
        expect(status.monitoring).toEqual({
          protocol: 'websocket',
          connected: true,
          monitoredExecutions: ['exec-1'],
          monitoredWorkflows: ['wf-1']
        });
        expect(status.stats).toEqual({
          totalExecutions: 100,
          totalWorkflows: 20
        });
      });

      it('should handle errors in system status', async () => {
        mockApiClient.request.mockRejectedValue(new Error('Connection failed'));

        const result = await provider.readResource('monitoring://system/status');
        const status = JSON.parse(result);

        expect(status.status).toBe('error');
        expect(status.error).toBe('Connection failed');
        expect(status).toHaveProperty('timestamp');
      });
    });

    describe('active executions', () => {
      it('should return active executions', async () => {
        const mockExecutions = [
          {
            id: 'exec-1',
            workflowId: 'wf-1',
            workflowData: { name: 'Workflow 1' },
            mode: 'manual',
            startedAt: '2024-01-15T10:00:00.000Z',
            status: 'running'
          },
          {
            id: 'exec-2',
            workflowId: 'wf-2',
            mode: 'trigger',
            startedAt: '2024-01-15T10:01:00.000Z',
            status: 'running'
          }
        ];

        mockApiClient.request.mockResolvedValue(mockExecutions);

        const result = await provider.readResource('monitoring://executions/active');
        const data = JSON.parse(result);

        expect(data).toHaveProperty('timestamp');
        expect(data.count).toBe(2);
        expect(data.executions).toHaveLength(2);
        expect(data.executions[0]).toMatchObject({
          id: 'exec-1',
          workflowId: 'wf-1',
          workflowName: 'Workflow 1',
          mode: 'manual',
          status: 'running'
        });
        expect(data.executions[0]).toHaveProperty('duration');
      });

      it('should handle empty active executions', async () => {
        mockApiClient.request.mockResolvedValue([]);

        const result = await provider.readResource('monitoring://executions/active');
        const data = JSON.parse(result);

        expect(data.count).toBe(0);
        expect(data.executions).toEqual([]);
      });
    });

    describe('workflow metrics', () => {
      it('should return aggregated workflow metrics', async () => {
        const mockWorkflows = [
          { id: 'wf-1', name: 'Workflow 1' },
          { id: 'wf-2', name: 'Workflow 2' }
        ];

        const mockExecutions = [
          { status: 'success', startedAt: '2024-01-15T10:00:00Z', stoppedAt: '2024-01-15T10:01:00Z' },
          { status: 'error', startedAt: '2024-01-15T10:02:00Z', stoppedAt: '2024-01-15T10:03:00Z' },
          { status: 'success', startedAt: '2024-01-15T10:04:00Z', stoppedAt: '2024-01-15T10:05:00Z' }
        ];

        mockApiClient.request.mockImplementation((method: string, path: string, options?: any) => {
          if (path === '/workflows') return Promise.resolve(mockWorkflows);
          if (path === '/executions' && options?.params?.workflowId) {
            return Promise.resolve(mockExecutions);
          }
          return Promise.reject(new Error('Unknown path'));
        });

        const result = await provider.readResource('monitoring://metrics/workflows');
        const data = JSON.parse(result);

        expect(data).toHaveProperty('timestamp');
        expect(data.totalWorkflows).toBe(2);
        expect(data.metrics).toHaveLength(2);
        expect(data.metrics[0]).toHaveProperty('workflowId');
        expect(data.metrics[0]).toHaveProperty('workflowName');
        expect(data.metrics[0]).toHaveProperty('executionCount', 3);
        expect(data.metrics[0]).toHaveProperty('successRate');
        expect(data.metrics[0]).toHaveProperty('averageDuration');
      });
    });

    describe('workflow status', () => {
      it('should return workflow status with running executions', async () => {
        const mockWorkflow = {
          id: 'wf-1',
          name: 'Workflow 1',
          active: true,
          nodes: [{ id: 'node1' }, { id: 'node2' }]
        };

        const mockExecutions = [
          { id: 'exec-1', status: 'running', startedAt: '2024-01-15T10:00:00Z' },
          { id: 'exec-2', status: 'success', startedAt: '2024-01-15T09:00:00Z', stoppedAt: '2024-01-15T09:01:00Z' }
        ];

        mockApiClient.request.mockImplementation((method: string, path: string) => {
          if (path === '/workflows/wf-1') return Promise.resolve(mockWorkflow);
          if (path === '/executions') return Promise.resolve(mockExecutions);
          return Promise.reject(new Error('Unknown path'));
        });

        const result = await provider.readResource('monitoring://workflow/wf-1/status');
        const data = JSON.parse(result);

        expect(data).toHaveProperty('timestamp');
        expect(data.workflow).toEqual({
          id: 'wf-1',
          name: 'Workflow 1',
          active: true,
          nodeCount: 2
        });
        expect(data.status).toEqual({
          isRunning: true,
          runningExecutions: 1,
          lastExecution: {
            id: 'exec-1',
            status: 'running',
            startedAt: '2024-01-15T10:00:00Z',
            stoppedAt: undefined
          }
        });
      });
    });

    describe('workflow metrics by ID', () => {
      it('should use monitoring service metrics if available', async () => {
        const mockMetrics = {
          workflowId: 'wf-1',
          executionCount: 50,
          successCount: 45,
          failureCount: 5,
          successRate: 90,
          averageDuration: 2000
        };

        mockMonitoringService.getWorkflowMetrics.mockResolvedValue(mockMetrics);

        const result = await provider.readResource('monitoring://workflow/wf-1/metrics');
        const data = JSON.parse(result);

        expect(data).toHaveProperty('timestamp');
        expect(data).toMatchObject(mockMetrics);
      });

      it('should fallback to manual calculation if monitoring service returns null', async () => {
        mockMonitoringService.getWorkflowMetrics.mockResolvedValue(null);

        const mockExecutions = [
          { status: 'success', startedAt: '2024-01-15T10:00:00Z', stoppedAt: '2024-01-15T10:01:00Z' },
          { status: 'error', startedAt: '2024-01-15T10:02:00Z', stoppedAt: '2024-01-15T10:03:00Z' }
        ];

        mockApiClient.request.mockResolvedValue(mockExecutions);

        const result = await provider.readResource('monitoring://workflow/wf-1/metrics');
        const data = JSON.parse(result);

        expect(data.workflowId).toBe('wf-1');
        expect(data.executionCount).toBe(2);
        expect(data.successCount).toBe(1);
        expect(data.failureCount).toBe(1);
        expect(data.successRate).toBe(50);
      });
    });

    describe('execution status', () => {
      it('should return execution status with node progress', async () => {
        const mockExecution = {
          id: 'exec-1',
          workflowId: 'wf-1',
          status: 'running',
          mode: 'manual',
          startedAt: '2024-01-15T10:00:00Z',
          finished: false,
          workflowData: {
            nodes: [{ id: 'node1' }, { id: 'node2' }, { id: 'node3' }]
          },
          data: {
            resultData: {
              runData: {
                node1: [{ executionTime: 100, startTime: 1000 }],
                node2: [{ executionTime: 200, startTime: 1100 }]
              }
            }
          }
        };

        mockApiClient.request.mockResolvedValue(mockExecution);

        const result = await provider.readResource('monitoring://execution/exec-1');
        const data = JSON.parse(result);

        expect(data).toHaveProperty('timestamp');
        expect(data.execution).toMatchObject({
          id: 'exec-1',
          workflowId: 'wf-1',
          status: 'running',
          mode: 'manual',
          finished: false
        });
        expect(data.progress).toEqual({
          completedNodes: 2,
          totalNodes: 3,
          nodeProgress: [
            { nodeId: 'node1', executionTime: 100, startTime: 1000 },
            { nodeId: 'node2', executionTime: 200, startTime: 1100 }
          ]
        });
      });

      it('should handle execution with errors', async () => {
        const mockExecution = {
          id: 'exec-1',
          workflowId: 'wf-1',
          status: 'error',
          mode: 'manual',
          startedAt: '2024-01-15T10:00:00Z',
          stoppedAt: '2024-01-15T10:01:00Z',
          finished: true,
          data: {
            resultData: {
              error: {
                message: 'Node execution failed',
                node: 'HTTP Request'
              }
            }
          }
        };

        mockApiClient.request.mockResolvedValue(mockExecution);

        const result = await provider.readResource('monitoring://execution/exec-1');
        const data = JSON.parse(result);

        expect(data.error).toEqual({
          message: 'Node execution failed',
          node: 'HTTP Request'
        });
      });
    });

    describe('unknown resources', () => {
      it('should throw error for unknown resource', async () => {
        await expect(
          provider.readResource('monitoring://unknown/resource')
        ).rejects.toThrow('Unknown monitoring resource: monitoring://unknown/resource');
      });
    });
  });

  describe('subscribeToResource', () => {
    it('should subscribe to resource updates with periodic polling', async () => {
      const mockCallback = vi.fn();
      
      // Mock system status response
      mockApiClient.request.mockImplementation((method: string, path: string) => {
        if (path === '/version') return Promise.resolve({ version: '0.233.0' });
        if (path === '/executions') return Promise.resolve({ count: 100 });
        if (path === '/workflows') return Promise.resolve({ count: 20 });
        return Promise.reject(new Error('Unknown path'));
      });

      mockMonitoringService.getStatus.mockReturnValue({
        protocol: 'polling',
        connected: true,
        monitoredExecutions: [],
        monitoredWorkflows: []
      });

      // Create a custom provider with shorter interval for testing
      const testProvider = new MonitoringResourceProvider({
        apiClient: mockApiClient,
        monitoringService: mockMonitoringService,
        updateInterval: 50 // 50ms for testing
      });

      const unsubscribe = testProvider.subscribeToResource(
        'monitoring://system/status',
        mockCallback
      );

      // Wait for initial callback
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(mockCallback).toHaveBeenCalledTimes(1);

      // Wait for at least one update
      await new Promise(resolve => setTimeout(resolve, 60));
      expect(mockCallback).toHaveBeenCalledTimes(2);

      // Test unsubscribe
      unsubscribe();

      // Wait and verify no more callbacks
      const callCount = mockCallback.mock.calls.length;
      await new Promise(resolve => setTimeout(resolve, 60));
      expect(mockCallback).toHaveBeenCalledTimes(callCount);
    });

    it('should handle errors during subscription updates', async () => {
      const mockCallback = vi.fn();
      
      // First call succeeds, second fails
      mockApiClient.request
        .mockResolvedValueOnce({ count: 100 })
        .mockRejectedValueOnce(new Error('Connection lost'));

      const testProvider = new MonitoringResourceProvider({
        apiClient: mockApiClient,
        monitoringService: mockMonitoringService,
        updateInterval: 50
      });

      testProvider.subscribeToResource(
        'monitoring://executions/active',
        mockCallback
      );

      // Initial callback should work
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(mockCallback).toHaveBeenCalledTimes(1);

      // Error should be logged but not crash
      await new Promise(resolve => setTimeout(resolve, 60));
      // Callback may or may not be called again depending on timing
    });
  });

  describe('getMetadata', () => {
    it('should return correct metadata', () => {
      const metadata = provider.getMetadata();
      
      expect(metadata).toEqual({
        capabilities: ['read', 'subscribe'],
        updateFrequency: 5000,
        authentication: 'required'
      });
    });

    it('should reflect custom update interval', () => {
      const customProvider = new MonitoringResourceProvider({
        apiClient: mockApiClient,
        updateInterval: 10000
      });

      const metadata = customProvider.getMetadata();
      expect(metadata.updateFrequency).toBe(10000);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully in all resource reads', async () => {
      mockApiClient.request.mockRejectedValue(new Error('API unavailable'));

      // System status should return error state
      const systemResult = await provider.readResource('monitoring://system/status');
      const systemData = JSON.parse(systemResult);
      expect(systemData.status).toBe('error');
      expect(systemData.error).toBe('API unavailable');

      // Active executions should return error
      const execResult = await provider.readResource('monitoring://executions/active');
      const execData = JSON.parse(execResult);
      expect(execData.error).toBe('API unavailable');

      // Workflow metrics should return error
      const metricsResult = await provider.readResource('monitoring://metrics/workflows');
      const metricsData = JSON.parse(metricsResult);
      expect(metricsData.error).toBe('API unavailable');
    });

    it('should handle missing monitoring service gracefully', () => {
      const providerWithoutMonitoring = new MonitoringResourceProvider({
        apiClient: mockApiClient
      });

      expect((providerWithoutMonitoring as any).monitoringService).toBeUndefined();
      // Should still work without monitoring service
    });
  });
});