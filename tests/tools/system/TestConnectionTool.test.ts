import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestConnectionTool } from '../../../src/tools/system/TestConnectionTool.js';
import { IToolContext } from '../../../src/tools/base/Tool.js';

describe('TestConnectionTool', () => {
  let tool: TestConnectionTool;
  let mockApiClient: any;

  beforeEach(() => {
    tool = new TestConnectionTool();
    
    mockApiClient = {
      testConnection: vi.fn(),
      getWorkflows: vi.fn()
    };
  });

  describe('Basic Properties', () => {
    it('should have correct name', () => {
      expect(tool.name).toBe('test_connection');
    });

    it('should have a description', () => {
      expect(tool.description).toBe('Test connection to the configured n8n instance');
    });

    it('should have correct metadata', () => {
      const metadata = tool.getMetadata();
      expect(metadata.category).toBe('system');
      expect(metadata.isMutating).toBe(false);
      expect(metadata.tags).toContain('connection');
      expect(metadata.tags).toContain('test');
      expect(metadata.tags).toContain('diagnostic');
    });

    it('should have valid input schema', () => {
      const schema = tool.inputSchema;
      expect(schema).toBeDefined();
      expect(schema._def).toBeDefined();
      // Should accept empty object
      expect(schema.safeParse({}).success).toBe(true);
    });
  });

  describe('Connection Testing', () => {
    it('should test connection successfully', async () => {
      mockApiClient.testConnection.mockResolvedValue({
        connected: true,
        version: '0.233.0'
      });
      mockApiClient.getWorkflows.mockResolvedValue([]);

      const context: IToolContext = {
        apiClient: mockApiClient
      };

      const startTime = Date.now();
      const result = await tool.execute({}, context);
      const endTime = Date.now();

      expect(mockApiClient.testConnection).toHaveBeenCalled();
      expect(mockApiClient.getWorkflows).toHaveBeenCalledWith({ limit: 1 });
      
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');

      const connectionResult = JSON.parse(result.content[0].text!);
      expect(connectionResult).toHaveProperty('connected', true);
      expect(connectionResult).toHaveProperty('version', '0.233.0');
      expect(connectionResult).toHaveProperty('timestamp');
      expect(connectionResult).toHaveProperty('responseTime');
      expect(connectionResult).toHaveProperty('message', 'Successfully connected to n8n instance');
      expect(connectionResult).toHaveProperty('sampleRequest');
      expect(connectionResult.sampleRequest).toMatchObject({
        success: true,
        responseTime: expect.stringMatching(/\d+ms/)
      });

      // Check metadata
      expect(result.metadata).toMatchObject({
        connected: true,
        responseTime: expect.any(Number)
      });
    });

    it('should handle connection failure', async () => {
      mockApiClient.testConnection.mockResolvedValue({
        connected: false
      });

      const context: IToolContext = {
        apiClient: mockApiClient
      };

      const result = await tool.execute({}, context);

      const connectionResult = JSON.parse(result.content[0].text!);
      expect(connectionResult).toHaveProperty('connected', false);
      expect(connectionResult).toHaveProperty('message', 'Failed to connect to n8n instance. Please check your configuration.');
      expect(connectionResult).toHaveProperty('timestamp');
      expect(connectionResult).toHaveProperty('responseTime');
      expect(connectionResult).not.toHaveProperty('sampleRequest');
    });

    it('should handle API client not configured', async () => {
      const context: IToolContext = {};

      const result = await tool.execute({}, context);

      const connectionResult = JSON.parse(result.content[0].text!);
      expect(connectionResult).toHaveProperty('connected', false);
      expect(connectionResult).toHaveProperty('error', 'n8n API client not configured. Please set N8N_API_URL and N8N_API_KEY environment variables.');
      expect(connectionResult).toHaveProperty('timestamp');
      
      expect(result.metadata).toMatchObject({
        connected: false
      });
    });

    it('should handle sample request failure', async () => {
      mockApiClient.testConnection.mockResolvedValue({
        connected: true,
        version: '0.233.0'
      });
      mockApiClient.getWorkflows.mockRejectedValue(new Error('Permission denied'));

      const context: IToolContext = {
        apiClient: mockApiClient
      };

      const result = await tool.execute({}, context);

      const connectionResult = JSON.parse(result.content[0].text!);
      expect(connectionResult).toHaveProperty('connected', true);
      expect(connectionResult).toHaveProperty('sampleRequest');
      expect(connectionResult.sampleRequest).toMatchObject({
        success: false,
        error: 'Permission denied'
      });
    });

    it('should handle connection test exceptions', async () => {
      mockApiClient.testConnection.mockRejectedValue(new Error('Network timeout'));

      const context: IToolContext = {
        apiClient: mockApiClient
      };

      const result = await tool.execute({}, context);
      
      const connectionResult = JSON.parse(result.content[0].text!);
      expect(connectionResult).toHaveProperty('connected', false);
      expect(connectionResult).toHaveProperty('error', 'Network timeout');
      expect(connectionResult).toHaveProperty('timestamp');
    });

    it('should handle non-Error exceptions', async () => {
      mockApiClient.testConnection.mockRejectedValue('String error');

      const context: IToolContext = {
        apiClient: mockApiClient
      };

      const result = await tool.execute({}, context);
      
      const connectionResult = JSON.parse(result.content[0].text!);
      expect(connectionResult).toHaveProperty('connected', false);
      expect(connectionResult).toHaveProperty('error', 'Unknown error');
    });
  });

  describe('Response Formatting', () => {
    it('should format successful response correctly', async () => {
      mockApiClient.testConnection.mockResolvedValue({
        connected: true,
        version: '0.233.0'
      });
      mockApiClient.getWorkflows.mockResolvedValue([{ id: 'wf-1' }]);

      const context: IToolContext = {
        apiClient: mockApiClient
      };

      const result = await tool.execute({}, context);
      const connectionResult = JSON.parse(result.content[0].text!);

      // Check all expected fields
      expect(connectionResult).toMatchObject({
        connected: true,
        version: '0.233.0',
        message: 'Successfully connected to n8n instance',
        sampleRequest: {
          success: true
        }
      });
      expect(connectionResult.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(connectionResult.responseTime).toMatch(/^\d+ms$/);
    });

    it('should handle connection without version info', async () => {
      mockApiClient.testConnection.mockResolvedValue({
        connected: true
        // No version field
      });
      mockApiClient.getWorkflows.mockResolvedValue([]);

      const context: IToolContext = {
        apiClient: mockApiClient
      };

      const result = await tool.execute({}, context);
      const connectionResult = JSON.parse(result.content[0].text!);

      expect(connectionResult).toHaveProperty('connected', true);
      expect(connectionResult).not.toHaveProperty('version');
      expect(connectionResult).toHaveProperty('message');
    });

    it('should return properly formatted JSON', async () => {
      mockApiClient.testConnection.mockResolvedValue({
        connected: true
      });
      mockApiClient.getWorkflows.mockResolvedValue([]);

      const context: IToolContext = {
        apiClient: mockApiClient
      };

      const result = await tool.execute({}, context);
      
      // Should be valid, formatted JSON
      expect(() => JSON.parse(result.content[0].text!)).not.toThrow();
      // Should be pretty-printed (contains newlines and spaces)
      expect(result.content[0].text).toContain('\n');
      expect(result.content[0].text).toMatch(/^\{[\s\S]*\}$/);
    });
  });

  describe('Error Recovery', () => {
    it('should handle sample request with non-Error object', async () => {
      mockApiClient.testConnection.mockResolvedValue({
        connected: true
      });
      mockApiClient.getWorkflows.mockRejectedValue('String rejection');

      const context: IToolContext = {
        apiClient: mockApiClient
      };

      const result = await tool.execute({}, context);

      const connectionResult = JSON.parse(result.content[0].text!);
      expect(connectionResult.sampleRequest).toMatchObject({
        success: false,
        error: 'Unknown error'
      });
    });

    it('should track response time accurately', async () => {
      let resolveConnection: any;
      const connectionPromise = new Promise((resolve) => {
        resolveConnection = resolve;
      });

      mockApiClient.testConnection.mockReturnValue(connectionPromise);

      const context: IToolContext = {
        apiClient: mockApiClient
      };

      const executionPromise = tool.execute({}, context);

      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 50));
      resolveConnection({ connected: true });

      const result = await executionPromise;
      const connectionResult = JSON.parse(result.content[0].text!);
      
      // Response time should be at least 50ms
      const responseTime = parseInt(connectionResult.responseTime);
      expect(responseTime).toBeGreaterThanOrEqual(50);
    });
  });
});