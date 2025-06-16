import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { N8nMcpServer, IN8nMcpServerConfig } from '../../src/server/N8nMcpServer.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { N8nApiConfig } from '../../src/types/config.types.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { N8nApiClient } from '../../src/services/N8nApiClient.js';
import { ToolRegistry } from '../../src/tools/index.js';
import { SecurityManager } from '../../src/security/index.js';
import { RealtimeMonitoringService } from '../../src/services/RealtimeMonitoringService.js';
import { MonitoringResourceProvider } from '../../src/resources/MonitoringResourceProvider.js';

// Mock modules we want to control
vi.mock('../../src/services/N8nApiClient.js');
vi.mock('../../src/security/index.js');
vi.mock('../../src/services/RealtimeMonitoringService.js');
vi.mock('../../src/resources/MonitoringResourceProvider.js');

describe('N8nMcpServer', () => {
  describe('without API client', () => {
    let server: N8nMcpServer;
    let client: Client;
    let clientTransport: InMemoryTransport;
    let serverTransport: InMemoryTransport;

    beforeEach(async () => {
      // Create server without API config
      server = new N8nMcpServer();

      // Create in-memory transport pair
      [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

      // Connect server
      await server.connect(serverTransport);

      // Create and connect client
      client = new Client(
        {
          name: 'test-client',
          version: '1.0.0',
        },
        {
          capabilities: {},
        },
      );
      await client.connect(clientTransport);
      
      // Wait for initialization to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    afterEach(async () => {
      // Clean up connections
      await client.close();
      await server.close();
    });

    it('should list only server health tool when API client not configured', async () => {
      const response = await client.listTools();
      
      expect(response.tools).toBeDefined();
      expect(response.tools.length).toBe(1);
      expect(response.tools[0].name).toBe('server_health');
    });

    it.skip('should handle server_health tool', async () => {
      try {
        const result = await client.callTool('server_health', {});
        
        expect(result.content).toBeDefined();
        expect(result.content.length).toBe(1);
        expect(result.content[0]).toHaveProperty('type', 'text');
        
        const health = JSON.parse(result.content[0].text);
        expect(health.status).toBe('healthy');
        expect(health.version).toBe('0.1.0');
        expect(health.isConnected).toBe(true);
        expect(health.apiClientConfigured).toBe(false);
        expect(health.stats).toBeDefined();
        expect(health.apiClient).toBeNull();
      } catch (error) {
        console.error('callTool error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }
    });

    it.skip('should return error for n8n tools when API client not configured', async () => {
      await expect(
        client.callTool('test_connection', {})
      ).rejects.toThrow('MethodNotFound');
    });
  });

  describe('with API client', () => {
    let server: N8nMcpServer;
    let client: Client;
    let clientTransport: InMemoryTransport;
    let serverTransport: InMemoryTransport;

    beforeEach(async () => {
      // Mock API config
      const apiConfig: Partial<N8nApiConfig> = {
        baseUrl: 'https://test.n8n.io',
        apiKey: 'test-api-key',
      };

      // Create server with API config
      server = new N8nMcpServer(apiConfig);

      // Create in-memory transport pair
      [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

      // Connect server
      await server.connect(serverTransport);

      // Create and connect client
      client = new Client(
        {
          name: 'test-client',
          version: '1.0.0',
        },
        {
          capabilities: {},
        },
      );
      await client.connect(clientTransport);
      
      // Wait for initialization to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    afterEach(async () => {
      // Clean up connections
      await client.close();
      await server.close();
    });

    it('should list all available tools with API client', async () => {
      const response = await client.listTools();
      
      expect(response.tools).toBeDefined();
      expect(response.tools.length).toBe(23); // 9 original + 6 execution + 6 credential + 2 monitoring tools
      
      const toolNames = response.tools.map(tool => tool.name);
      
      // System tools
      expect(toolNames).toContain('server_health');
      expect(toolNames).toContain('test_connection');
      
      // Workflow tools
      expect(toolNames).toContain('workflow_list');
      expect(toolNames).toContain('workflow_create');
      expect(toolNames).toContain('workflow_get');
      expect(toolNames).toContain('workflow_update');
      expect(toolNames).toContain('workflow_delete');
      expect(toolNames).toContain('workflow_activate');
      expect(toolNames).toContain('workflow_deactivate');
      
      // Execution tools
      expect(toolNames).toContain('trigger_execution');
      expect(toolNames).toContain('get_execution');
      expect(toolNames).toContain('list_executions');
      expect(toolNames).toContain('stop_execution');
      expect(toolNames).toContain('monitor_execution');
      expect(toolNames).toContain('replay_execution');
    });

    it.skip('should track request counts', async () => {
      // Make some requests
      await client.listTools();
      await client.callTool('server_health', {});
      await client.listTools();
      
      // Check stats
      const result = await client.callTool('server_health', {});
      const health = JSON.parse(result.content[0].text);
      
      expect(health.stats.totalRequests).toBe(4); // Including the final server_health call
      expect(health.stats.totalErrors).toBe(0);
      expect(health.stats.errorRate).toBe(0);
    });

    it.skip('should handle unknown tool error', async () => {
      await expect(
        client.callTool('unknown_tool', {})
      ).rejects.toThrow('MethodNotFound');
    });

    it.skip('should increment error count on failures', async () => {
      // Trigger an error
      try {
        await client.callTool('unknown_tool', {});
      } catch (error) {
        // Expected error
      }
      
      // Check error stats
      const result = await client.callTool('server_health', {});
      const health = JSON.parse(result.content[0].text);
      
      expect(health.stats.totalErrors).toBe(1);
      expect(health.stats.errorRate).toBeGreaterThan(0);
    });

    it.skip('should provide server uptime', async () => {
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = await client.callTool('server_health', {});
      const health = JSON.parse(result.content[0].text);
      
      expect(health.uptime).toBeGreaterThan(0);
    });
  });

  describe('server lifecycle', () => {
    it('should handle connection lifecycle correctly', async () => {
      const server = new N8nMcpServer();
      const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
      
      // Server should not be connected initially
      expect(server.isHealthy()).toBe(false);
      
      // Connect
      await server.connect(serverTransport);
      expect(server.isHealthy()).toBe(true);
      
      // Close
      await server.close();
      expect(server.isHealthy()).toBe(false);
    });

    it('should provide accurate stats', () => {
      const server = new N8nMcpServer();
      
      const stats = server.getStats();
      expect(stats.totalRequests).toBe(0);
      expect(stats.totalErrors).toBe(0);
      expect(stats.errorRate).toBe(0);
      
      expect(server.getUptime()).toBeGreaterThanOrEqual(0);
    });
  });

  describe('constructor variations', () => {
    let mockApiClient: any;
    let mockSecurityManager: any;
    let mockMonitoringService: any;
    let mockMonitoringResourceProvider: any;

    beforeEach(() => {
      vi.clearAllMocks();
      
      // Setup mocks
      mockApiClient = {
        testConnection: vi.fn().mockResolvedValue({ success: true }),
        request: vi.fn(),
      };
      (N8nApiClient as unknown as Mock).mockReturnValue(mockApiClient);

      mockSecurityManager = {
        checkToolSecurity: vi.fn().mockResolvedValue({ allowed: true }),
      };
      (SecurityManager as unknown as Mock).mockReturnValue(mockSecurityManager);

      mockMonitoringService = {
        start: vi.fn().mockResolvedValue(undefined),
        stop: vi.fn().mockResolvedValue(undefined),
        on: vi.fn(),
      };
      (RealtimeMonitoringService as unknown as Mock).mockReturnValue(mockMonitoringService);

      mockMonitoringResourceProvider = {
        getResources: vi.fn().mockResolvedValue([]),
      };
      (MonitoringResourceProvider as unknown as Mock).mockReturnValue(mockMonitoringResourceProvider);
    });

    it('should initialize with new config format', () => {
      const config: IN8nMcpServerConfig = {
        apiConfig: {
          baseUrl: 'http://localhost:5678',
          apiKey: 'test-key',
        },
        security: {
          apiKeys: {
            enabled: true,
            keys: [],
          },
        },
        monitoring: {
          protocol: 'websocket',
          wsUrl: 'ws://localhost:5678',
          updateInterval: 5000,
        },
      };

      const server = new N8nMcpServer(config);
      
      expect(N8nApiClient).toHaveBeenCalledWith(config.apiConfig);
      expect(SecurityManager).toHaveBeenCalledWith(config.security);
      expect(RealtimeMonitoringService).toHaveBeenCalledWith(
        expect.objectContaining({
          apiClient: mockApiClient,
          protocol: 'websocket',
          wsUrl: 'ws://localhost:5678',
          authToken: 'test-key',
        }),
      );
      expect(MonitoringResourceProvider).toHaveBeenCalledWith(
        expect.objectContaining({
          apiClient: mockApiClient,
          monitoringService: mockMonitoringService,
          updateInterval: 5000,
        }),
      );
    });

    it('should handle API client initialization errors gracefully', () => {
      (N8nApiClient as unknown as Mock).mockImplementation(() => {
        throw new Error('Invalid API config');
      });

      const config: IN8nMcpServerConfig = {
        apiConfig: {
          baseUrl: 'http://localhost:5678',
          apiKey: 'test-key',
        },
      };

      // Should not throw
      expect(() => new N8nMcpServer(config)).not.toThrow();
    });

    it('should handle monitoring service initialization errors gracefully', () => {
      (RealtimeMonitoringService as unknown as Mock).mockImplementation(() => {
        throw new Error('Monitoring init failed');
      });

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

      // Should not throw
      expect(() => new N8nMcpServer(config)).not.toThrow();
    });

    it('should work without monitoring config', () => {
      const config: IN8nMcpServerConfig = {
        apiConfig: {
          baseUrl: 'http://localhost:5678',
          apiKey: 'test-key',
        },
      };

      const server = new N8nMcpServer(config);
      
      expect(N8nApiClient).toHaveBeenCalled();
      expect(RealtimeMonitoringService).not.toHaveBeenCalled();
      expect(MonitoringResourceProvider).not.toHaveBeenCalled();
    });
  });

  describe('monitoring integration', () => {
    let server: N8nMcpServer;
    let mockMonitoringService: any;
    let serverTransport: InMemoryTransport;
    let clientTransport: InMemoryTransport;

    beforeEach(async () => {
      vi.clearAllMocks();
      
      mockMonitoringService = {
        start: vi.fn().mockResolvedValue(undefined),
        stop: vi.fn().mockResolvedValue(undefined),
        on: vi.fn(),
      };
      (RealtimeMonitoringService as unknown as Mock).mockReturnValue(mockMonitoringService);

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
      [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    });

    afterEach(async () => {
      await server.close();
    });

    it('should start monitoring service on connect', async () => {
      await server.connect(serverTransport);
      
      expect(mockMonitoringService.start).toHaveBeenCalled();
    });

    it('should stop monitoring service on close', async () => {
      await server.connect(serverTransport);
      await server.close();
      
      expect(mockMonitoringService.stop).toHaveBeenCalled();
    });

    it('should handle monitoring start errors gracefully', async () => {
      mockMonitoringService.start.mockRejectedValue(new Error('Start failed'));
      
      // Should not throw
      await expect(server.connect(serverTransport)).resolves.not.toThrow();
    });
  });

  describe('resource handling', () => {
    let server: N8nMcpServer;
    let client: Client;
    let clientTransport: InMemoryTransport;
    let serverTransport: InMemoryTransport;
    let mockMonitoringResourceProvider: any;

    beforeEach(async () => {
      vi.clearAllMocks();
      
      mockMonitoringResourceProvider = {
        getResources: vi.fn().mockResolvedValue([
          { uri: 'monitoring://executions', name: 'Executions' },
          { uri: 'monitoring://workflows', name: 'Workflows' },
        ]),
        readResource: vi.fn().mockResolvedValue({
          contents: [{ type: 'text', text: 'Resource data' }],
        }),
        subscribe: vi.fn().mockResolvedValue(undefined),
        unsubscribe: vi.fn().mockResolvedValue(undefined),
      };
      (MonitoringResourceProvider as unknown as Mock).mockReturnValue(mockMonitoringResourceProvider);

      const config: IN8nMcpServerConfig = {
        apiConfig: {
          baseUrl: 'http://localhost:5678',
          apiKey: 'test-key',
        },
        monitoring: {
          protocol: 'websocket',
        },
      };

      server = new N8nMcpServer(config);
      [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
      await server.connect(serverTransport);

      client = new Client(
        { name: 'test-client', version: '1.0.0' },
        { capabilities: {} },
      );
      await client.connect(clientTransport);
    });

    afterEach(async () => {
      await client.close();
      await server.close();
    });

    it('should list monitoring resources when available', async () => {
      const response = await client.listResources();
      
      expect(response.resources).toBeDefined();
      expect(response.resources.length).toBe(2);
      expect(response.resources[0].uri).toBe('monitoring://executions');
      expect(response.resources[1].uri).toBe('monitoring://workflows');
    });

    it('should read monitoring resources', async () => {
      const result = await client.readResource('monitoring://executions');
      
      expect(mockMonitoringResourceProvider.readResource).toHaveBeenCalledWith('monitoring://executions');
      expect(result.contents).toBeDefined();
      expect(result.contents[0].text).toBe('Resource data');
    });
  });

  describe('error handling', () => {
    it('should handle various error types', async () => {
      const server = new N8nMcpServer();
      const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
      
      await server.connect(serverTransport);
      
      const client = new Client(
        { name: 'test-client', version: '1.0.0' },
        { capabilities: {} },
      );
      await client.connect(clientTransport);
      
      // Test various error scenarios
      await expect(client.callTool('non_existent_tool', {})).rejects.toThrow();
      
      await client.close();
      await server.close();
    });
  });

  describe('static methods', () => {
    it('should run server with transport', async () => {
      const transport = new InMemoryTransport();
      const runPromise = N8nMcpServer.run(transport);
      
      // Should create and connect server
      expect(runPromise).toBeDefined();
      
      // Clean up
      transport.close();
    });
  });
});