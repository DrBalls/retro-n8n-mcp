import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateWorkflowTool } from '../../../src/tools/workflow/CreateWorkflowTool.js';
import { IToolContext } from '../../../src/tools/base/Tool.js';
import { N8nApiClient } from '../../../src/services/N8nApiClient.js';

describe('CreateWorkflowTool', () => {
  let tool: CreateWorkflowTool;
  let mockApiClient: Partial<N8nApiClient>;
  let context: IToolContext;

  beforeEach(() => {
    tool = new CreateWorkflowTool();
    
    // Mock API client
    mockApiClient = {
      createWorkflow: vi.fn().mockResolvedValue({
        id: 'wf123',
        name: 'Test Workflow',
        active: false,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        nodes: [],
        connections: {},
        settings: {},
      }),
    };

    context = {
      apiClient: mockApiClient as N8nApiClient,
      metadata: {
        baseUrl: 'https://n8n.example.com',
      },
    };
  });

  describe('Basic Properties', () => {
    it('should have correct name and description', () => {
      expect(tool.name).toBe('workflow_create');
      expect(tool.description).toBe('Create a new workflow in n8n');
    });

    it('should have correct metadata', () => {
      const metadata = tool.getMetadata();
      expect(metadata.category).toBe('workflow');
      expect(metadata.isMutating).toBe(true);
      expect(metadata.tags).toContain('create');
      expect(metadata.requirements).toContain('apiClient');
    });
  });

  describe('Input Validation', () => {
    it('should validate required fields', async () => {
      const invalidInput = {
        // Missing required name and nodes
      };

      const result = await tool.execute(invalidInput, context);
      expect(result.content[0].text).toContain('error');
    });

    it('should validate node structure', async () => {
      const invalidInput = {
        name: 'Test Workflow',
        nodes: [
          {
            // Missing required fields
            type: 'n8n-nodes-base.start',
          }
        ]
      };

      const result = await tool.execute(invalidInput, context);
      expect(result.content[0].text).toContain('error');
    });

    it('should accept valid input', async () => {
      const validInput = {
        name: 'Test Workflow',
        nodes: [
          {
            name: 'Start',
            type: 'n8n-nodes-base.start',
            position: [250, 300],
          }
        ]
      };

      const result = await tool.execute(validInput, context);
      const response = JSON.parse(result.content[0].text);
      expect(response.success).toBe(true);
    });
  });

  describe('Workflow Creation', () => {
    it('should create a basic workflow', async () => {
      const input = {
        name: 'Basic Workflow',
        nodes: [
          {
            name: 'Start',
            type: 'n8n-nodes-base.start',
            position: [250, 300],
          }
        ],
        active: false,
      };

      const result = await tool.execute(input, context);
      const response = JSON.parse(result.content[0].text);

      expect(mockApiClient.createWorkflow).toHaveBeenCalledWith({
        name: 'Basic Workflow',
        nodes: [
          {
            id: 'node_0',
            name: 'Start',
            type: 'n8n-nodes-base.start',
            typeVersion: 1,
            position: [250, 300],
            parameters: {},
          }
        ],
        connections: {},
        settings: {},
        active: false,
        tags: undefined,
      });

      expect(response.success).toBe(true);
      expect(response.workflow.id).toBe('wf123');
      expect(response.workflow.name).toBe('Test Workflow');
      expect(response.workflow.url).toBe('https://n8n.example.com/workflow/wf123');
    });

    it('should create workflow with multiple nodes and connections', async () => {
      const input = {
        name: 'Complex Workflow',
        nodes: [
          {
            name: 'Start',
            type: 'n8n-nodes-base.start',
            position: [250, 300],
          },
          {
            name: 'HTTP Request',
            type: 'n8n-nodes-base.httpRequest',
            position: [450, 300],
            parameters: {
              url: 'https://api.example.com',
              method: 'GET',
            },
          }
        ],
        connections: {
          'Start': {
            'main': [[{ node: 'HTTP Request', type: 'main', index: 0 }]]
          }
        },
        active: true,
        tags: ['api', 'http'],
      };

      const result = await tool.execute(input, context);
      const response = JSON.parse(result.content[0].text);

      expect(mockApiClient.createWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Complex Workflow',
          active: true,
          tags: ['api', 'http'],
        })
      );

      expect(response.success).toBe(true);
    });

    it('should include workflow settings', async () => {
      const input = {
        name: 'Workflow with Settings',
        nodes: [
          {
            name: 'Start',
            type: 'n8n-nodes-base.start',
            position: [250, 300],
          }
        ],
        settings: {
          executionOrder: 'v1' as const,
          saveManualExecutions: true,
          timezone: 'America/New_York',
        },
      };

      const result = await tool.execute(input, context);
      
      expect(mockApiClient.createWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          settings: {
            executionOrder: 'v1',
            saveManualExecutions: true,
            timezone: 'America/New_York',
          },
        })
      );

      const response = JSON.parse(result.content[0].text);
      expect(response.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing API client', async () => {
      const input = {
        name: 'Test Workflow',
        nodes: [
          {
            name: 'Start',
            type: 'n8n-nodes-base.start',
            position: [250, 300],
          }
        ],
      };

      const result = await tool.execute(input, { apiClient: undefined });
      expect(result.content[0].text).toContain('n8n API client not configured');
    });

    it('should handle API errors', async () => {
      mockApiClient.createWorkflow = vi.fn().mockRejectedValue(
        new Error('API Error: Workflow name already exists')
      );

      const input = {
        name: 'Duplicate Workflow',
        nodes: [
          {
            name: 'Start',
            type: 'n8n-nodes-base.start',
            position: [250, 300],
          }
        ],
      };

      const result = await tool.execute(input, context);
      expect(result.content[0].text).toContain('API Error: Workflow name already exists');
    });

    it('should handle network errors', async () => {
      mockApiClient.createWorkflow = vi.fn().mockRejectedValue(
        new Error('Network error: Unable to connect')
      );

      const input = {
        name: 'Test Workflow',
        nodes: [
          {
            name: 'Start',
            type: 'n8n-nodes-base.start',
            position: [250, 300],
          }
        ],
      };

      const result = await tool.execute(input, context);
      expect(result.content[0].text).toContain('Network error');
    });
  });

  describe('Response Format', () => {
    it('should include metadata in response', async () => {
      const input = {
        name: 'Test Workflow',
        nodes: [
          {
            name: 'Start',
            type: 'n8n-nodes-base.start',
            position: [250, 300],
          }
        ],
        active: true,
      };

      const result = await tool.execute(input, context);
      
      expect(result.metadata).toEqual({
        workflowId: 'wf123',
        active: false, // From mock response
      });
    });

    it('should format response as JSON', async () => {
      const input = {
        name: 'Test Workflow',
        nodes: [
          {
            name: 'Start',
            type: 'n8n-nodes-base.start',
            position: [250, 300],
          }
        ],
      };

      const result = await tool.execute(input, context);
      
      // Should be valid JSON
      expect(() => JSON.parse(result.content[0].text)).not.toThrow();
      
      const response = JSON.parse(result.content[0].text);
      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('workflow');
    });
  });
});