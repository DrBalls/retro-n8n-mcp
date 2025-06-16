import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { N8nMcpServer, IN8nMcpServerConfig } from '../../src/server/N8nMcpServer.js';
import { RealtimeMonitoringService } from '../../src/services/RealtimeMonitoringService.js';
import { WebSocketService } from '../../src/services/WebSocketService.js';
import { SSEService } from '../../src/services/SSEService.js';
import { MonitoringResourceProvider } from '../../src/resources/MonitoringResourceProvider.js';
import { EventEmitter } from 'events';

// Mock dependencies
vi.mock('../../src/services/WebSocketService.js');
vi.mock('../../src/services/SSEService.js');
vi.mock('../../src/services/N8nApiClient.js');

describe('Real-time Monitoring Integration', () => {
  let server: N8nMcpServer;
  let mockApiClient: any;
  let mockTransport: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock API client
    mockApiClient = {
      request: vi.fn(),
      getHeaders: vi.fn().mockReturnValue({}),
    };

    // Create mock transport
    mockTransport = {
      readable: {
        getReader: vi.fn().mockReturnValue({
          read: vi.fn().mockResolvedValue({ done: true }),
        }),
      },
      writable: {
        getWriter: vi.fn().mockReturnValue({
          write: vi.fn(),
          close: vi.fn(),
        }),
      },
      start: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
    };
  });

  afterEach(async () => {
    if (server) {
      try {
        await server.close();
      } catch (error) {
        // Ignore errors during cleanup
      }
    }
  });

  describe('WebSocket Protocol', () => {
    it('should initialize monitoring with WebSocket protocol', async () => {
      const config: IN8nMcpServerConfig = {
        apiConfig: {
          baseUrl: 'http://localhost:5678',
          apiKey: 'test-key',
        },
        monitoring: {
          protocol: 'websocket',
          wsUrl: 'ws://localhost:5678/ws',
          updateInterval: 3000,
        },
      };

      server = new N8nMcpServer(config);
      
      // Verify server is created
      expect(server).toBeDefined();
    });

    it('should connect to WebSocket and handle execution monitoring', async () => {
      const mockWsService = new EventEmitter() as any;
      mockWsService.connect = vi.fn().mockResolvedValue(undefined);
      mockWsService.disconnect = vi.fn();
      mockWsService.subscribe = vi.fn();
      mockWsService.unsubscribe = vi.fn();
      mockWsService.isConnected = true;

      vi.mocked(WebSocketService).mockImplementation(() => mockWsService);

      const config: IN8nMcpServerConfig = {
        apiConfig: {
          baseUrl: 'http://localhost:5678',
          apiKey: 'test-key',
        },
        monitoring: {
          protocol: 'websocket',
          wsUrl: 'ws://localhost:5678/ws',
        },
      };

      server = new N8nMcpServer(config);
      await server.connect(mockTransport);

      // Simulate execution update via WebSocket
      const executionUpdate = {
        executionId: 'exec-123',
        workflowId: 'wf-456',
        status: 'running',
        progress: {
          completedNodes: 3,
          totalNodes: 10,
          currentNode: 'HTTP Request',
        },
        timestamp: new Date().toISOString(),
      };

      mockWsService.emit('message', {
        type: 'update',
        topic: 'execution:exec-123',
        data: executionUpdate,
      });

      // Verify WebSocket methods were called
      expect(mockWsService.connect).toHaveBeenCalled();
    });

    it('should handle WebSocket reconnection', async () => {
      const mockWsService = new EventEmitter() as any;
      mockWsService.connect = vi.fn().mockResolvedValue(undefined);
      mockWsService.disconnect = vi.fn();
      mockWsService.isConnected = false;

      vi.mocked(WebSocketService).mockImplementation(() => mockWsService);

      const config: IN8nMcpServerConfig = {
        apiConfig: {
          baseUrl: 'http://localhost:5678',
          apiKey: 'test-key',
        },
        monitoring: {
          protocol: 'websocket',
          wsUrl: 'ws://localhost:5678/ws',
        },
      };

      server = new N8nMcpServer(config);
      await server.connect(mockTransport);

      // Simulate disconnection
      mockWsService.emit('disconnected');

      // Simulate reconnection
      mockWsService.emit('reconnecting', {
        attempt: 1,
        nextAttemptIn: 5000,
      });

      mockWsService.isConnected = true;
      mockWsService.emit('connected');

      expect(mockWsService.connect).toHaveBeenCalled();
    });
  });

  describe('SSE Protocol', () => {
    it('should initialize monitoring with SSE protocol', async () => {
      const config: IN8nMcpServerConfig = {
        apiConfig: {
          baseUrl: 'http://localhost:5678',
          apiKey: 'test-key',
        },
        monitoring: {
          protocol: 'sse',
          sseUrl: 'http://localhost:5678/sse',
          updateInterval: 3000,
        },
      };

      server = new N8nMcpServer(config);
      
      // Verify server is created
      expect(server).toBeDefined();
    });

    it('should connect to SSE and handle workflow metrics', async () => {
      const mockSseService = new EventEmitter() as any;
      mockSseService.connect = vi.fn().mockResolvedValue(undefined);
      mockSseService.disconnect = vi.fn();
      mockSseService.subscribe = vi.fn();
      mockSseService.unsubscribe = vi.fn();
      mockSseService.isConnected = true;

      vi.mocked(SSEService).mockImplementation(() => mockSseService);

      const config: IN8nMcpServerConfig = {
        apiConfig: {
          baseUrl: 'http://localhost:5678',
          apiKey: 'test-key',
        },
        monitoring: {
          protocol: 'sse',
          sseUrl: 'http://localhost:5678/sse',
        },
      };

      server = new N8nMcpServer(config);
      await server.connect(mockTransport);

      // Simulate workflow metrics update via SSE
      const metricsUpdate = {
        workflowId: 'wf-789',
        executionCount: 150,
        successRate: 95.5,
        averageDuration: 3200,
        activeExecutions: 2,
      };

      mockSseService.emit('message', {
        event: 'workflow:metrics',
        data: metricsUpdate,
      });

      // Verify SSE methods were called
      expect(mockSseService.connect).toHaveBeenCalled();
    });
  });

  describe('Polling Protocol', () => {
    it('should initialize monitoring with polling protocol', async () => {
      const config: IN8nMcpServerConfig = {
        apiConfig: {
          baseUrl: 'http://localhost:5678',
          apiKey: 'test-key',
        },
        monitoring: {
          protocol: 'polling',
          pollingInterval: 2000,
        },
      };

      server = new N8nMcpServer(config);
      
      // Verify server is created
      expect(server).toBeDefined();
    });

    it('should poll for execution updates', async () => {
      // Mock API responses
      mockApiClient.request = vi.fn()
        .mockResolvedValueOnce({
          id: 'exec-123',
          status: 'running',
          workflowId: 'wf-456',
          finished: false,
        })
        .mockResolvedValueOnce({
          id: 'exec-123',
          status: 'success',
          workflowId: 'wf-456',
          finished: true,
        });

      const config: IN8nMcpServerConfig = {
        apiConfig: {
          baseUrl: 'http://localhost:5678',
          apiKey: 'test-key',
        },
        monitoring: {
          protocol: 'polling',
          pollingInterval: 100, // Fast polling for tests
        },
      };

      server = new N8nMcpServer(config);
      
      // Create monitoring service
      const monitoringService = new RealtimeMonitoringService({
        apiClient: mockApiClient,
        protocol: 'polling',
        pollingInterval: 100,
      });

      await monitoringService.start();

      // Monitor execution
      const updatePromise = new Promise<void>((resolve) => {
        monitoringService.on('execution:exec-123:finished', () => {
          resolve();
        });
      });

      await monitoringService.monitorExecution('exec-123');

      // Wait for polling to detect finished status
      await updatePromise;

      // Verify API was called multiple times
      expect(mockApiClient.request).toHaveBeenCalledWith('GET', '/executions/exec-123');
      expect(mockApiClient.request.mock.calls.length).toBeGreaterThanOrEqual(2);

      monitoringService.stop();
    });
  });

  describe('Monitoring Resources', () => {
    it('should list available monitoring resources', async () => {
      // Mock API responses
      mockApiClient.request = vi.fn()
        .mockResolvedValueOnce([
          { id: 'wf-1', name: 'Workflow 1', active: true },
          { id: 'wf-2', name: 'Workflow 2', active: true },
        ])
        .mockResolvedValueOnce([
          { id: 'exec-1', workflowId: 'wf-1', status: 'running' },
          { id: 'exec-2', workflowId: 'wf-2', status: 'running' },
        ]);

      const provider = new MonitoringResourceProvider({
        apiClient: mockApiClient,
        updateInterval: 5000,
      });

      const resources = await provider.listResources();

      // Verify static resources
      expect(resources).toContainEqual({
        uri: 'monitoring://system/status',
        name: 'System Status',
        description: 'Real-time n8n system status and health metrics',
        mimeType: 'application/json',
      });

      expect(resources).toContainEqual({
        uri: 'monitoring://executions/active',
        name: 'Active Executions',
        description: 'Currently running workflow executions',
        mimeType: 'application/json',
      });

      // Verify dynamic resources
      expect(resources).toContainEqual({
        uri: 'monitoring://workflow/wf-1/status',
        name: 'Workflow 1 - Status',
        description: 'Real-time status for workflow: Workflow 1',
        mimeType: 'application/json',
      });

      expect(resources).toContainEqual({
        uri: 'monitoring://execution/exec-1',
        name: 'Execution exec-1',
        description: 'Monitor execution of workflow: wf-1',
        mimeType: 'application/json',
      });
    });

    it('should read monitoring resource data', async () => {
      // Mock API responses
      mockApiClient.request = vi.fn()
        .mockResolvedValueOnce({ version: '1.0.0' })
        .mockResolvedValueOnce({ count: 50 })
        .mockResolvedValueOnce({ count: 10 });

      const provider = new MonitoringResourceProvider({
        apiClient: mockApiClient,
      });

      const systemStatus = await provider.readResource('monitoring://system/status');
      const statusData = JSON.parse(systemStatus);

      expect(statusData).toMatchObject({
        status: 'healthy',
        version: { version: '1.0.0' },
        stats: {
          totalExecutions: 50,
          totalWorkflows: 10,
        },
      });

      expect(statusData.timestamp).toBeDefined();
    });

    it('should subscribe to resource updates', async () => {
      let updateCount = 0;
      const updates: string[] = [];

      // Mock changing execution data
      mockApiClient.request = vi.fn()
        .mockResolvedValueOnce({
          id: 'exec-123',
          status: 'running',
          workflowId: 'wf-456',
          finished: false,
        })
        .mockResolvedValueOnce({
          id: 'exec-123',
          status: 'success',
          workflowId: 'wf-456',
          finished: true,
          stoppedAt: new Date().toISOString(),
        });

      const provider = new MonitoringResourceProvider({
        apiClient: mockApiClient,
        updateInterval: 100, // Fast updates for tests
      });

      const unsubscribe = provider.subscribeToResource(
        'monitoring://execution/exec-123',
        (data) => {
          updateCount++;
          updates.push(data);
          if (updateCount >= 2) {
            unsubscribe();
          }
        }
      );

      // Wait for updates
      await new Promise((resolve) => setTimeout(resolve, 250));

      expect(updateCount).toBeGreaterThanOrEqual(2);
      
      // Check first update (running)
      const firstUpdate = JSON.parse(updates[0]);
      expect(firstUpdate.execution.status).toBe('running');
      expect(firstUpdate.execution.finished).toBe(false);

      // Check second update (success)
      const secondUpdate = JSON.parse(updates[1]);
      expect(secondUpdate.execution.status).toBe('success');
      expect(secondUpdate.execution.finished).toBe(true);
    });
  });

  describe('Monitoring Tools Integration', () => {
    it('should execute real-time execution monitor tool', async () => {
      const mockMonitoringService = new EventEmitter() as any;
      mockMonitoringService.start = vi.fn().mockResolvedValue(undefined);
      mockMonitoringService.stop = vi.fn();
      mockMonitoringService.monitorExecution = vi.fn().mockResolvedValue(undefined);
      mockMonitoringService.stopMonitoringExecution = vi.fn();
      mockMonitoringService.getStatus = vi.fn().mockReturnValue({
        protocol: 'websocket',
        connected: true,
        monitoredExecutions: ['exec-123'],
        monitoredWorkflows: [],
      });

      // Mock execution data
      mockApiClient.request = vi.fn().mockResolvedValue({
        id: 'exec-123',
        status: 'success',
        workflowId: 'wf-456',
        finished: true,
        data: {
          resultData: {
            runData: {
              'node1': [{ executionTime: 100 }],
              'node2': [{ executionTime: 200 }],
            },
          },
        },
      });

      const config: IN8nMcpServerConfig = {
        apiConfig: {
          baseUrl: 'http://localhost:5678',
          apiKey: 'test-key',
        },
        monitoring: {
          protocol: 'websocket',
          wsUrl: 'ws://localhost:5678/ws',
        },
      };

      server = new N8nMcpServer(config);
      
      // Simulate tool execution through monitoring context
      const context = {
        apiClient: mockApiClient,
        monitoringService: mockMonitoringService,
      };

      // Simulate execution updates
      setTimeout(() => {
        mockMonitoringService.emit('execution:exec-123:update', {
          executionId: 'exec-123',
          status: 'running',
          progress: { completedNodes: 1, totalNodes: 2 },
        });
      }, 50);

      setTimeout(() => {
        mockMonitoringService.emit('execution:exec-123:finished', {
          executionId: 'exec-123',
          status: 'success',
        });
      }, 100);

      // Wait for monitoring to complete
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(mockMonitoringService.monitorExecution).toHaveBeenCalledWith(
        'exec-123',
        expect.any(Object)
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle WebSocket connection errors', async () => {
      const mockWsService = new EventEmitter() as any;
      mockWsService.connect = vi.fn().mockRejectedValue(new Error('Connection refused'));
      mockWsService.disconnect = vi.fn();

      vi.mocked(WebSocketService).mockImplementation(() => mockWsService);

      const config: IN8nMcpServerConfig = {
        apiConfig: {
          baseUrl: 'http://localhost:5678',
          apiKey: 'test-key',
        },
        monitoring: {
          protocol: 'websocket',
          wsUrl: 'ws://localhost:5678/ws',
        },
      };

      server = new N8nMcpServer(config);
      
      // Connection should succeed even if monitoring fails
      await expect(server.connect(mockTransport)).resolves.not.toThrow();
    });

    it('should handle monitoring service errors gracefully', async () => {
      const mockSseService = new EventEmitter() as any;
      mockSseService.connect = vi.fn().mockResolvedValue(undefined);
      mockSseService.disconnect = vi.fn();
      mockSseService.isConnected = true;

      vi.mocked(SSEService).mockImplementation(() => mockSseService);

      const config: IN8nMcpServerConfig = {
        apiConfig: {
          baseUrl: 'http://localhost:5678',
          apiKey: 'test-key',
        },
        monitoring: {
          protocol: 'sse',
          sseUrl: 'http://localhost:5678/sse',
        },
      };

      server = new N8nMcpServer(config);
      await server.connect(mockTransport);

      // Simulate SSE error
      mockSseService.emit('error', new Error('Stream closed unexpectedly'));

      // Server should continue running
      expect(server).toBeDefined();
    });
  });
});