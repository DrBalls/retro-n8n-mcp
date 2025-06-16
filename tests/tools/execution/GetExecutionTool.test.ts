import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetExecutionTool } from '../../../src/tools/execution/GetExecutionTool.js';
import { N8nApiClient } from '../../../src/services/N8nApiClient.js';
import { z } from 'zod';

describe('GetExecutionTool', () => {
  let tool: GetExecutionTool;
  let mockApiClient: any;

  beforeEach(() => {
    tool = new GetExecutionTool();
    mockApiClient = {
      request: vi.fn()
    };
  });

  describe('Basic Properties', () => {
    it('should have correct name', () => {
      expect(tool.name).toBe('get_execution');
    });

    it('should have a description', () => {
      expect(tool.description).toBeTruthy();
      expect(tool.description).toContain('specific workflow execution');
    });

    it('should have correct metadata', () => {
      const metadata = tool.getMetadata();
      expect(metadata.category).toBe('execution');
      expect(metadata.isMutating).toBe(false);
      expect(metadata.requirements).toContain('n8n API access');
      expect(metadata.tags).toContain('execution');
      expect(metadata.tags).toContain('get');
      expect(metadata.tags).toContain('details');
    });

    it('should have valid input schema', () => {
      expect(tool.inputSchema).toBeDefined();
      const schema = tool.inputSchema as z.ZodObject<any>;
      
      const validInput = {
        executionId: '123'
      };
      
      expect(() => schema.parse(validInput)).not.toThrow();
    });
  });

  describe('Input Validation', () => {
    it('should require executionId', () => {
      const schema = tool.inputSchema as z.ZodObject<any>;
      
      expect(() => schema.parse({})).toThrow();
      expect(() => schema.parse({ executionId: null })).toThrow();
    });

    it('should accept optional includeData parameter', () => {
      const schema = tool.inputSchema as z.ZodObject<any>;
      
      const withData = { executionId: '123', includeData: true };
      const withoutData = { executionId: '123', includeData: false };
      const noDataParam = { executionId: '123' };
      
      expect(() => schema.parse(withData)).not.toThrow();
      expect(() => schema.parse(withoutData)).not.toThrow();
      expect(() => schema.parse(noDataParam)).not.toThrow();
    });
  });

  describe('Execution', () => {
    it('should fetch execution without data by default', async () => {
      const mockExecution = {
        id: '123',
        workflowId: 'wf-456',
        finished: true,
        mode: 'manual',
        startedAt: '2024-01-15T10:00:00.000Z',
        stoppedAt: '2024-01-15T10:00:05.000Z',
        status: 'success',
        data: {}
      };

      mockApiClient.request.mockResolvedValue(mockExecution);

      const result = await tool.execute(
        { executionId: '123' },
        { apiClient: mockApiClient }
      );

      expect(mockApiClient.request).toHaveBeenCalledWith(
        'GET',
        '/executions/123',
        { params: { includeData: true } }
      );

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.id).toBe('123');
      expect(parsed.workflowId).toBe('wf-456');
      expect(result.content[0].mimeType).toBe('application/json');
    });

    it('should fetch execution with data when requested', async () => {
      const mockExecution = {
        id: '123',
        workflowId: 'wf-456',
        finished: true,
        mode: 'manual',
        startedAt: '2024-01-15T10:00:00.000Z',
        stoppedAt: '2024-01-15T10:00:05.000Z',
        status: 'success',
        data: {
          resultData: {
            runData: {
              'Start': [{
                startTime: 1705315200000,
                executionTime: 10,
                data: { main: [[{ json: { test: 'data' } }]] }
              }]
            }
          }
        }
      };

      mockApiClient.request.mockResolvedValue(mockExecution);

      const result = await tool.execute(
        { executionId: '123', includeData: true },
        { apiClient: mockApiClient }
      );

      expect(mockApiClient.request).toHaveBeenCalledWith(
        'GET',
        '/executions/123',
        { params: { includeData: true } }
      );

      expect(result.content[0].text).toContain('"data"');
      expect(result.content[0].text).toContain('"resultData"');
    });

    it('should throw error when API client is not configured', async () => {
      await expect(
        tool.execute({ executionId: '123' }, {})
      ).rejects.toThrow('n8n API client not configured');
    });

    it('should handle execution not found error', async () => {
      mockApiClient.request.mockRejectedValue(new Error('Execution not found'));

      await expect(
        tool.execute(
          { executionId: 'non-existent' },
          { apiClient: mockApiClient }
        )
      ).rejects.toThrow('Execution not found');
    });

    it('should handle network errors', async () => {
      mockApiClient.request.mockRejectedValue(new Error('Network error'));

      await expect(
        tool.execute(
          { executionId: '123' },
          { apiClient: mockApiClient }
        )
      ).rejects.toThrow('Network error');
    });

    it('should handle invalid response format', async () => {
      mockApiClient.request.mockResolvedValue(null);

      await expect(
        tool.execute(
          { executionId: '123' },
          { apiClient: mockApiClient }
        )
      ).rejects.toThrow('Invalid response format');
    });

    it('should handle partial execution data', async () => {
      const mockExecution = {
        id: '123',
        workflowId: 'wf-456',
        finished: false,
        mode: 'manual',
        startedAt: '2024-01-15T10:00:00.000Z',
        // No stoppedAt for running execution
        status: 'running',
        data: {}
      };

      mockApiClient.request.mockResolvedValue(mockExecution);

      const result = await tool.execute(
        { executionId: '123' },
        { apiClient: mockApiClient }
      );

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.status).toBe('running');
      expect(parsed.finished).toBe(false);
      expect(parsed.stoppedAt).toBeUndefined();
    });
  });

  describe('Response Format', () => {
    it('should return properly formatted JSON response', async () => {
      const mockExecution = {
        id: '123',
        workflowId: 'wf-456',
        status: 'success',
        mode: 'manual',
        startedAt: '2024-01-15T10:00:00.000Z',
        stoppedAt: '2024-01-15T10:00:05.000Z',
        finished: true,
        data: {}
      };

      mockApiClient.request.mockResolvedValue(mockExecution);

      const result = await tool.execute(
        { executionId: '123' },
        { apiClient: mockApiClient }
      );

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].mimeType).toBe('application/json');
      
      // Verify JSON is valid and formatted
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.id).toBe('123');
      expect(parsed.workflowId).toBe('wf-456');
      expect(parsed.status).toBe('success');
    });
  });
});