import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListExecutionsTool } from '../../../src/tools/execution/ListExecutionsTool.js';
import { IToolContext } from '../../../src/tools/base/Tool.js';
import { N8nApiClient } from '../../../src/services/N8nApiClient.js';
import { z } from 'zod';

describe('ListExecutionsTool', () => {
  let tool: ListExecutionsTool;
  let mockApiClient: Partial<N8nApiClient>;
  let context: IToolContext;

  const mockExecutions = {
    data: [
      {
        id: 'exec1',
        workflowId: 'wf1',
        status: 'success',
        mode: 'manual',
        startedAt: '2024-01-15T10:00:00.000Z',
        stoppedAt: '2024-01-15T10:00:05.500Z',
        finished: true,
        retryOf: null,
      },
      {
        id: 'exec2',
        workflowId: 'wf1',
        status: 'error',
        mode: 'trigger',
        startedAt: '2024-01-15T11:00:00.000Z',
        stoppedAt: '2024-01-15T11:02:30.000Z',
        finished: true,
        retryOf: null,
      },
      {
        id: 'exec3',
        workflowId: 'wf2',
        status: 'running',
        mode: 'webhook',
        startedAt: '2024-01-15T12:00:00.000Z',
        stoppedAt: null,
        finished: false,
        retryOf: null,
      },
    ],
    nextCursor: 'next_page_cursor',
  };

  beforeEach(() => {
    tool = new ListExecutionsTool();
    
    // Mock API client
    mockApiClient = {
      request: vi.fn().mockResolvedValue(mockExecutions),
    };

    context = {
      apiClient: mockApiClient as N8nApiClient,
      metadata: {},
    };
  });

  describe('Basic Properties', () => {
    it('should have correct name and description', () => {
      expect(tool.name).toBe('list_executions');
      expect(tool.description).toBe('List workflow executions with filtering and pagination options');
    });

    it('should have correct metadata', () => {
      const metadata = tool.getMetadata();
      expect(metadata.category).toBe('execution');
      expect(metadata.isMutating).toBe(false);
      expect(metadata.tags).toContain('execution');
      expect(metadata.tags).toContain('list');
      expect(metadata.requirements).toContain('n8n API access');
    });
  });

  describe('Input Validation', () => {
    it('should accept empty input with defaults', async () => {
      const result = await tool.execute({}, context);
      
      expect(mockApiClient.request).toHaveBeenCalledWith(
        'GET',
        '/executions',
        {
          params: {
            limit: 50,
            includeData: false,
          }
        }
      );
      
      const response = JSON.parse(result.content[0].text);
      expect(response.executions).toHaveLength(3);
    });

    it('should validate limit range', async () => {
      const invalidInput = {
        limit: 200, // Exceeds max of 100
      };

      await expect(tool.execute(invalidInput, context)).rejects.toThrow();
    });

    it('should accept all valid filters', async () => {
      const input = {
        workflowId: 'wf1',
        status: 'success',
        limit: 25,
        cursor: 'prev_cursor',
        startDate: '2024-01-15T00:00:00.000Z',
        endDate: '2024-01-16T00:00:00.000Z',
        includeData: true,
      };

      await tool.execute(input, context);
      
      expect(mockApiClient.request).toHaveBeenCalledWith(
        'GET',
        '/executions',
        {
          params: {
            workflowId: 'wf1',
            status: 'success',
            limit: 25,
            cursor: 'prev_cursor',
            startDate: '2024-01-15T00:00:00.000Z',
            endDate: '2024-01-16T00:00:00.000Z',
            includeData: true,
          }
        }
      );
    });

    it('should validate status values', async () => {
      const invalidInput = {
        status: 'invalid_status',
      };

      await expect(tool.execute(invalidInput, context)).rejects.toThrow();
    });
  });

  describe('Execution Listing', () => {
    it('should list executions with calculated duration', async () => {
      const result = await tool.execute({}, context);
      const response = JSON.parse(result.content[0].text);

      expect(response.executions).toHaveLength(3);
      
      // Check first execution (5.5 seconds)
      expect(response.executions[0]).toEqual({
        id: 'exec1',
        workflowId: 'wf1',
        status: 'success',
        mode: 'manual',
        startedAt: '2024-01-15T10:00:00.000Z',
        stoppedAt: '2024-01-15T10:00:05.500Z',
        finished: true,
        duration: '5.5s',
        retryOf: null,
      });

      // Check second execution (2m 30s)
      expect(response.executions[1].duration).toBe('2m 30s');
      
      // Check running execution
      expect(response.executions[2].duration).toBe('Running');
    });

    it('should calculate different duration formats', async () => {
      // Test milliseconds duration
      mockApiClient.request = vi.fn().mockResolvedValue({
        data: [{
          id: 'exec_ms',
          workflowId: 'wf1',
          status: 'success',
          mode: 'manual',
          startedAt: '2024-01-15T10:00:00.000Z',
          stoppedAt: '2024-01-15T10:00:00.750Z',
          finished: true,
          retryOf: null,
        }],
        nextCursor: null,
      });

      const result1 = await tool.execute({}, context);
      const response1 = JSON.parse(result1.content[0].text);
      expect(response1.executions[0].duration).toBe('750ms');

      // Test hours duration
      mockApiClient.request = vi.fn().mockResolvedValue({
        data: [{
          id: 'exec_hours',
          workflowId: 'wf1',
          status: 'success',
          mode: 'manual',
          startedAt: '2024-01-15T10:00:00.000Z',
          stoppedAt: '2024-01-15T13:45:30.000Z',
          finished: true,
          retryOf: null,
        }],
        nextCursor: null,
      });

      const result2 = await tool.execute({}, context);
      const response2 = JSON.parse(result2.content[0].text);
      expect(response2.executions[0].duration).toBe('3h 45m');
    });

    it('should provide status summary', async () => {
      const result = await tool.execute({}, context);
      const response = JSON.parse(result.content[0].text);

      expect(response.summary).toEqual({
        total: 3,
        byStatus: {
          success: 1,
          error: 1,
          running: 1,
        },
      });
    });

    it('should handle pagination', async () => {
      const result = await tool.execute({}, context);
      const response = JSON.parse(result.content[0].text);

      expect(response.pagination).toEqual({
        hasMore: true,
        nextCursor: 'next_page_cursor',
      });
    });

    it('should handle no more pages', async () => {
      mockApiClient.request = vi.fn().mockResolvedValue({
        data: mockExecutions.data,
        nextCursor: null,
      });

      const result = await tool.execute({}, context);
      const response = JSON.parse(result.content[0].text);

      expect(response.pagination.hasMore).toBe(false);
      expect(response.pagination.nextCursor).toBeNull();
    });

    it('should handle empty execution list', async () => {
      mockApiClient.request = vi.fn().mockResolvedValue({
        data: [],
        nextCursor: null,
      });

      const result = await tool.execute({}, context);
      const response = JSON.parse(result.content[0].text);

      expect(response.executions).toEqual([]);
      expect(response.summary.total).toBe(0);
      expect(response.summary.byStatus).toEqual({});
    });
  });

  describe('Error Handling', () => {
    it('should handle missing API client', async () => {
      await expect(
        tool.execute({}, { apiClient: undefined })
      ).rejects.toThrow('n8n API client not configured');
    });

    it('should handle API errors', async () => {
      mockApiClient.request = vi.fn().mockRejectedValue(
        new Error('API Error: Unauthorized')
      );

      await expect(
        tool.execute({}, context)
      ).rejects.toThrow('API Error: Unauthorized');
    });

    it('should handle invalid response format', async () => {
      mockApiClient.request = vi.fn().mockResolvedValue({
        // Invalid response structure
        invalidField: 'value',
      });

      await expect(
        tool.execute({}, context)
      ).rejects.toThrow('Invalid response format');
    });

    it('should provide helpful error for Zod validation', async () => {
      mockApiClient.request = vi.fn().mockResolvedValue({
        data: [
          {
            // Missing required fields
            id: 'exec1',
          }
        ],
      });

      await expect(
        tool.execute({}, context)
      ).rejects.toThrow('Invalid response format');
    });
  });

  describe('Response Format', () => {
    it('should return valid JSON with proper formatting', async () => {
      const result = await tool.execute({}, context);
      
      // Should be valid JSON
      expect(() => JSON.parse(result.content[0].text)).not.toThrow();
      expect(result.content[0].mimeType).toBe('application/json');
      
      // Should be properly formatted
      expect(result.content[0].text).toContain('\n  ');
    });

    it('should handle executions with retry information', async () => {
      mockApiClient.request = vi.fn().mockResolvedValue({
        data: [{
          id: 'exec_retry',
          workflowId: 'wf1',
          status: 'success',
          mode: 'manual',
          startedAt: '2024-01-15T10:00:00.000Z',
          stoppedAt: '2024-01-15T10:00:01.000Z',
          finished: true,
          retryOf: 'exec_original',
        }],
        nextCursor: null,
      });

      const result = await tool.execute({}, context);
      const response = JSON.parse(result.content[0].text);
      
      expect(response.executions[0].retryOf).toBe('exec_original');
    });
  });
});