import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ServerHealthTool } from '../../../src/tools/system/ServerHealthTool.js';
import { IToolContext } from '../../../src/tools/base/Tool.js';

describe('ServerHealthTool', () => {
  let tool: ServerHealthTool;

  beforeEach(() => {
    tool = new ServerHealthTool();
  });

  describe('Basic Properties', () => {
    it('should have correct name', () => {
      expect(tool.name).toBe('server_health');
    });

    it('should have a description', () => {
      expect(tool.description).toBe('Get the health status and statistics of the MCP server');
    });

    it('should have correct metadata', () => {
      const metadata = tool.getMetadata();
      expect(metadata.category).toBe('system');
      expect(metadata.isMutating).toBe(false);
      expect(metadata.tags).toContain('health');
      expect(metadata.tags).toContain('status');
      expect(metadata.tags).toContain('monitoring');
    });

    it('should have valid input schema', () => {
      const schema = tool.inputSchema;
      expect(schema).toBeDefined();
      expect(schema._def).toBeDefined();
      // Should accept includeStats parameter
      expect(schema.safeParse({}).success).toBe(true);
      expect(schema.safeParse({ includeStats: true }).success).toBe(true);
      expect(schema.safeParse({ includeStats: false }).success).toBe(true);
    });
  });

  describe('Health Check Execution', () => {
    it('should return server health status without API client', async () => {
      const context: IToolContext = {
        metadata: {
          version: '1.0.0',
          uptime: 3600000, // 1 hour in ms
          serverStats: {
            totalRequests: 100,
            totalErrors: 5,
            errorRate: 5
          }
        }
      };

      const result = await tool.execute({}, context);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');

      const health = JSON.parse(result.content[0].text!);
      expect(health).toHaveProperty('status', 'healthy');
      expect(health).toHaveProperty('version', '1.0.0');
      expect(health).toHaveProperty('uptime', 3600); // Converted to seconds
      expect(health).toHaveProperty('timestamp');
      expect(health).toHaveProperty('stats');
      expect(health.stats).toMatchObject({
        totalRequests: 100,
        totalErrors: 5,
        errorRate: 5
      });
      expect(health).toHaveProperty('n8nConnection');
      expect(health.n8nConnection).toMatchObject({
        connected: false,
        error: 'API client not configured'
      });
      expect(health).toHaveProperty('system');
      expect(health.system).toHaveProperty('nodeVersion');
      expect(health.system).toHaveProperty('platform');
      expect(health.system).toHaveProperty('memory');
    });

    it('should check n8n connection when API client is available', async () => {
      const mockApiClient = {
        testConnection: vi.fn().mockResolvedValue({
          connected: true,
          version: '0.233.0'
        }),
        getCacheStats: vi.fn().mockReturnValue({
          hits: 50,
          misses: 10,
          size: 25
        }),
        getQueueStats: vi.fn().mockReturnValue({
          pending: 5,
          processed: 100
        })
      };

      const context: IToolContext = {
        apiClient: mockApiClient,
        metadata: {
          version: '1.0.0',
          uptime: 7200000, // 2 hours
          serverStats: {
            totalRequests: 200,
            totalErrors: 10,
            errorRate: 5
          }
        }
      };

      const result = await tool.execute({ includeStats: true }, context);

      expect(mockApiClient.testConnection).toHaveBeenCalled();

      const health = JSON.parse(result.content[0].text!);
      expect(health.n8nConnection).toMatchObject({
        connected: true,
        version: '0.233.0'
      });
      expect(health.apiClient).toMatchObject({
        cache: { hits: 50, misses: 10, size: 25 },
        queue: { pending: 5, processed: 100 }
      });
    });

    it('should handle n8n connection errors', async () => {
      const mockApiClient = {
        testConnection: vi.fn().mockRejectedValue(new Error('Connection refused'))
      };

      const context: IToolContext = {
        apiClient: mockApiClient,
        metadata: {
          version: '1.0.0',
          uptime: 3600000
        }
      };

      const result = await tool.execute({}, context);

      const health = JSON.parse(result.content[0].text!);
      expect(health.n8nConnection).toMatchObject({
        connected: false,
        error: 'Connection refused'
      });
    });

    it('should exclude stats when includeStats is false', async () => {
      const context: IToolContext = {
        metadata: {
          version: '1.0.0',
          uptime: 3600000,
          serverStats: {
            totalRequests: 100,
            totalErrors: 5,
            errorRate: 5
          }
        }
      };

      const result = await tool.execute({ includeStats: false }, context);

      const health = JSON.parse(result.content[0].text!);
      expect(health).not.toHaveProperty('stats');
    });

    it('should handle missing metadata gracefully', async () => {
      const context: IToolContext = {};

      const result = await tool.execute({}, context);
      const health = JSON.parse(result.content[0].text!);
      
      expect(health).toHaveProperty('status', 'healthy');
      expect(health).toHaveProperty('version', '0.1.0');
      expect(health).toHaveProperty('uptime', 0);
      expect(health).not.toHaveProperty('stats'); // No serverStats in metadata
    });

    it('should include system information', async () => {
      const context: IToolContext = {
        metadata: {
          version: '1.0.0',
          uptime: 3600000
        }
      };

      const result = await tool.execute({}, context);

      const health = JSON.parse(result.content[0].text!);
      expect(health.system).toBeDefined();
      expect(health.system.nodeVersion).toBe(process.version);
      expect(health.system.platform).toBe(process.platform);
      expect(health.system.memory).toHaveProperty('used');
      expect(health.system.memory).toHaveProperty('total');
      expect(health.system.memory).toHaveProperty('unit', 'MB');
    });
  });

  describe('Response Format', () => {
    it('should return valid JSON response', async () => {
      const context: IToolContext = {
        metadata: {
          version: '1.0.0',
          uptime: 3600000
        }
      };

      const result = await tool.execute({}, context);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      
      // Should parse as valid JSON
      expect(() => JSON.parse(result.content[0].text!)).not.toThrow();
    });

    it('should have consistent timestamp format', async () => {
      const context: IToolContext = {
        metadata: {
          version: '1.0.0',
          uptime: 3600000
        }
      };

      const result = await tool.execute({}, context);
      const health = JSON.parse(result.content[0].text!);
      
      expect(health.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('Error Handling', () => {
    it('should handle API client errors gracefully', async () => {
      const mockApiClient = {
        testConnection: vi.fn().mockRejectedValue(new Error('Network timeout')),
        getCacheStats: vi.fn().mockImplementation(() => {
          throw new Error('Cache error');
        }),
        getQueueStats: vi.fn().mockImplementation(() => {
          throw new Error('Queue error');
        })
      };

      const context: IToolContext = {
        apiClient: mockApiClient,
        metadata: {
          version: '1.0.0',
          uptime: 3600000
        }
      };

      const result = await tool.execute({ includeStats: true }, context);
      
      // Should not throw, but include error in response
      const health = JSON.parse(result.content[0].text!);
      expect(health.n8nConnection.connected).toBe(false);
      expect(health.n8nConnection.error).toBe('Network timeout');
      expect(health.status).toBe('healthy'); // Server itself is still healthy
    });

    it('should handle non-Error objects in catch', async () => {
      const mockApiClient = {
        testConnection: vi.fn().mockRejectedValue('String error')
      };

      const context: IToolContext = {
        apiClient: mockApiClient,
        metadata: {
          version: '1.0.0',
          uptime: 3600000
        }
      };

      const result = await tool.execute({}, context);
      
      const health = JSON.parse(result.content[0].text!);
      expect(health.n8nConnection.error).toBe('Unknown error');
    });
  });
});