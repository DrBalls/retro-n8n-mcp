import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListWorkflowsTool } from '../../../src/tools/workflow/ListWorkflowsTool.js';
import { IToolContext } from '../../../src/tools/base/Tool.js';
import { N8nApiClient } from '../../../src/services/N8nApiClient.js';

describe('ListWorkflowsTool', () => {
  let tool: ListWorkflowsTool;
  let mockApiClient: Partial<N8nApiClient>;
  let context: IToolContext;

  const mockWorkflows = [
    {
      id: 'wf1',
      name: 'Workflow 1',
      active: true,
      tags: ['production', 'api'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      nodes: [
        { id: 'node1', type: 'n8n-nodes-base.start' },
        { id: 'node2', type: 'n8n-nodes-base.httpRequest' },
      ],
      settings: {
        executionOrder: 'v1',
        saveManualExecutions: true,
        errorWorkflow: 'wf_error',
      },
    },
    {
      id: 'wf2',
      name: 'Workflow 2',
      active: false,
      tags: ['test'],
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-14T00:00:00Z',
      nodes: [
        { id: 'node1', type: 'n8n-nodes-base.start' },
      ],
      settings: {
        executionOrder: 'v0',
        saveManualExecutions: false,
      },
    },
  ];

  const mockApiResponse = {
    data: mockWorkflows,
    nextCursor: 'cursor123',
  };

  beforeEach(() => {
    tool = new ListWorkflowsTool();
    
    // Mock API client
    mockApiClient = {
      getWorkflows: vi.fn().mockResolvedValue(mockApiResponse),
    };

    context = {
      apiClient: mockApiClient as N8nApiClient,
      metadata: {},
    };
  });

  describe('Basic Properties', () => {
    it('should have correct name and description', () => {
      expect(tool.name).toBe('workflow_list');
      expect(tool.description).toBe('List workflows from n8n with optional filters');
    });

    it('should have correct metadata', () => {
      const metadata = tool.getMetadata();
      expect(metadata.category).toBe('workflow');
      expect(metadata.isMutating).toBe(false);
      expect(metadata.tags).toContain('list');
      expect(metadata.tags).toContain('workflows');
      expect(metadata.requirements).toContain('apiClient');
    });

    it('should report as available', () => {
      expect(tool.isAvailable()).toBe(true);
    });
  });

  describe('Input Validation', () => {
    it('should accept empty input with defaults', async () => {
      const result = await tool.execute({}, context);
      const response = JSON.parse(result.content[0].text);
      
      expect(mockApiClient.getWorkflows).toHaveBeenCalledWith({
        limit: 10, // Default limit
      });
      expect(response.workflows).toHaveLength(2);
    });

    it('should validate limit range', async () => {
      const invalidInput = {
        limit: 150, // Exceeds max of 100
      };

      const result = await tool.execute(invalidInput, context);
      expect(result.content[0].text).toContain('error');
    });

    it('should accept all valid parameters', async () => {
      const validInput = {
        active: true,
        limit: 50,
        cursor: 'prev_cursor',
        tags: ['production', 'api'],
      };

      const result = await tool.execute(validInput, context);
      
      expect(mockApiClient.getWorkflows).toHaveBeenCalledWith({
        active: true,
        limit: 50,
        cursor: 'prev_cursor',
        tags: ['production', 'api'],
      });
      
      const response = JSON.parse(result.content[0].text);
      expect(response.workflows).toBeDefined();
    });
  });

  describe('Workflow Listing', () => {
    it('should list all workflows with basic info', async () => {
      const input = {
        limit: 20,
      };

      const result = await tool.execute(input, context);
      const response = JSON.parse(result.content[0].text);

      expect(response.workflows).toHaveLength(2);
      
      const workflow1 = response.workflows[0];
      expect(workflow1.id).toBe('wf1');
      expect(workflow1.name).toBe('Workflow 1');
      expect(workflow1.active).toBe(true);
      expect(workflow1.tags).toEqual(['production', 'api']);
      expect(workflow1.nodeCount).toBe(2);
      expect(workflow1.settings).toEqual({
        executionOrder: 'v1',
        saveManualExecutions: true,
        errorWorkflow: 'wf_error',
      });
    });

    it('should filter by active status', async () => {
      const input = {
        active: true,
      };

      await tool.execute(input, context);
      
      expect(mockApiClient.getWorkflows).toHaveBeenCalledWith({
        active: true,
        limit: 10,
      });
    });

    it('should filter by tags', async () => {
      const input = {
        tags: ['production'],
      };

      await tool.execute(input, context);
      
      expect(mockApiClient.getWorkflows).toHaveBeenCalledWith({
        tags: ['production'],
        limit: 10,
      });
    });

    it('should handle pagination', async () => {
      const input = {
        cursor: 'previous_page',
        limit: 25,
      };

      const result = await tool.execute(input, context);
      const response = JSON.parse(result.content[0].text);

      expect(mockApiClient.getWorkflows).toHaveBeenCalledWith({
        cursor: 'previous_page',
        limit: 25,
      });

      expect(response.pagination).toEqual({
        cursor: 'cursor123',
        hasMore: true,
        total: 2,
      });
    });

    it('should handle no next cursor', async () => {
      mockApiClient.getWorkflows = vi.fn().mockResolvedValue({
        data: mockWorkflows,
        nextCursor: null,
      });

      const result = await tool.execute({}, context);
      const response = JSON.parse(result.content[0].text);

      expect(response.pagination.hasMore).toBe(false);
      expect(response.pagination.cursor).toBeNull();
    });

    it('should handle empty workflow list', async () => {
      mockApiClient.getWorkflows = vi.fn().mockResolvedValue({
        data: [],
        nextCursor: null,
      });

      const result = await tool.execute({}, context);
      const response = JSON.parse(result.content[0].text);

      expect(response.workflows).toEqual([]);
      expect(response.pagination.total).toBe(0);
      expect(response.pagination.hasMore).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing API client', async () => {
      const result = await tool.execute({}, { apiClient: undefined });
      expect(result.content[0].text).toContain('n8n API client not configured');
    });

    it('should handle API errors', async () => {
      mockApiClient.getWorkflows = vi.fn().mockRejectedValue(
        new Error('API Error: Unauthorized')
      );

      const result = await tool.execute({}, context);
      expect(result.content[0].text).toContain('API Error: Unauthorized');
    });

    it('should handle network errors', async () => {
      mockApiClient.getWorkflows = vi.fn().mockRejectedValue(
        new Error('Network error: Connection timeout')
      );

      const result = await tool.execute({}, context);
      expect(result.content[0].text).toContain('Network error');
    });
  });

  describe('Response Format', () => {
    it('should include metadata in response', async () => {
      const result = await tool.execute({}, context);
      
      expect(result.metadata).toEqual({
        count: 2,
        hasMore: true,
      });
    });

    it('should format response as valid JSON', async () => {
      const result = await tool.execute({}, context);
      
      // Should be valid JSON
      expect(() => JSON.parse(result.content[0].text)).not.toThrow();
      
      // Should be properly formatted
      expect(result.content[0].text).toContain('\n  ');
    });

    it('should handle workflows without settings', async () => {
      mockApiClient.getWorkflows = vi.fn().mockResolvedValue({
        data: [{
          id: 'wf3',
          name: 'Simple Workflow',
          active: true,
          tags: [],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          nodes: [],
          // No settings property
        }],
        nextCursor: null,
      });

      const result = await tool.execute({}, context);
      const response = JSON.parse(result.content[0].text);
      
      expect(response.workflows[0]).not.toHaveProperty('settings');
      expect(response.workflows[0].nodeCount).toBe(0);
    });
  });
});