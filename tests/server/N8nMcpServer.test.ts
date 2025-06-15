import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { N8nMcpServer } from '../../src/server/N8nMcpServer.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { N8nApiConfig } from '../../src/types/config.types.js';

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
      expect(response.tools.length).toBe(15); // 9 original + 6 execution tools
      
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
});