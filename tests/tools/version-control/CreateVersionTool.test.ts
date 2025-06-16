import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateVersionTool } from '../../../src/tools/version-control/CreateVersionTool.js';
import { IToolContext } from '../../../src/tools/base/Tool.js';
import { createMockWorkflow } from '../../helpers/mockWorkflowData.js';

describe('CreateVersionTool', () => {
  let tool: CreateVersionTool;
  let mockContext: IToolContext;
  let mockApiClient: any;

  beforeEach(() => {
    tool = new CreateVersionTool();
    
    mockApiClient = {
      getWorkflow: vi.fn(),
    };

    mockContext = {
      apiClient: mockApiClient,
    };
  });

  describe('Basic Properties', () => {
    it('should have correct name and description', () => {
      expect(tool.name).toBe('version_control_create_version');
      expect(tool.description).toContain('Create a new version of a workflow');
      expect(tool.description).toContain('semantic versioning');
    });

    it('should have correct metadata', () => {
      const metadata = tool.getMetadata();
      expect(metadata.category).toBe('version-control');
      expect(metadata.isMutating).toBe(true);
      expect(metadata.tags).toContain('version-control');
      expect(metadata.tags).toContain('versioning');
    });
  });

  describe('Input Validation', () => {
    it('should require workflowId', async () => {
      await expect(tool.execute({}, mockContext))
        .rejects.toThrow('Input validation failed');
    });

    it('should use default values for optional parameters', async () => {
      const mockWorkflow = createMockWorkflow({ id: 'wf-123', name: 'Test Workflow' });
      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);

      const result = await tool.execute({ workflowId: 'wf-123' }, mockContext);
      const response = JSON.parse(result.content[0].text);

      expect(response.version.branchName).toBe('main');
      expect(response.version.isSnapshot).toBe(false);
    });

    it('should validate version increment type', async () => {
      await expect(tool.execute({ 
        workflowId: 'wf-123', 
        versionIncrement: 'invalid' 
      }, mockContext))
        .rejects.toThrow('Input validation failed');
    });
  });

  describe('Version Creation', () => {
    const mockWorkflow = createMockWorkflow({
      id: 'wf-123',
      name: 'Test Workflow',
      nodes: [
        {
          id: 'node1',
          name: 'Start',
          type: 'n8n-nodes-base.start',
          typeVersion: 1,
          position: [100, 100],
          parameters: {},
        },
      ],
      connections: {},
    });

    it('should create version with patch increment by default', async () => {
      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);

      const result = await tool.execute({ 
        workflowId: 'wf-123',
        commitMessage: 'Initial version',
        author: 'test-user',
      }, mockContext);
      
      const response = JSON.parse(result.content[0].text);

      expect(response.success).toBe(true);
      expect(response.version.workflowId).toBe('wf-123');
      expect(response.version.versionString).toMatch(/^\d+\.\d+\.\d+$/);
      expect(response.version.commitMessage).toBe('Initial version');
      expect(response.version.author).toBe('test-user');
      expect(response.version.branchName).toBe('main');
    });

    it('should create version with custom branch', async () => {
      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);

      const result = await tool.execute({ 
        workflowId: 'wf-123',
        branchName: 'feature/new-nodes',
        versionIncrement: 'minor',
      }, mockContext);
      
      const response = JSON.parse(result.content[0].text);

      expect(response.version.branchName).toBe('feature/new-nodes');
      expect(response.message).toContain('feature/new-nodes');
    });

    it('should create snapshot version', async () => {
      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);

      const result = await tool.execute({ 
        workflowId: 'wf-123',
        isSnapshot: true,
      }, mockContext);
      
      const response = JSON.parse(result.content[0].text);

      expect(response.version.isSnapshot).toBe(true);
    });

    it('should include tags when provided', async () => {
      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);

      const result = await tool.execute({ 
        workflowId: 'wf-123',
        tags: ['stable', 'production'],
      }, mockContext);
      
      const response = JSON.parse(result.content[0].text);

      expect(response.version.tags).toHaveLength(2);
      expect(response.version.tags.map((t: any) => t.name)).toEqual(['stable', 'production']);
    });

    it('should track changes from previous version', async () => {
      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);

      const result = await tool.execute({ 
        workflowId: 'wf-123',
      }, mockContext);
      
      const response = JSON.parse(result.content[0].text);

      expect(response.changes).toBeDefined();
      expect(Array.isArray(response.changes)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle API client not configured', async () => {
      await expect(tool.execute({ workflowId: 'wf-123' }, {}))
        .rejects.toThrow('n8n API client not configured');
    });

    it('should handle workflow fetch error', async () => {
      mockApiClient.getWorkflow.mockRejectedValue(new Error('Workflow not found'));

      await expect(tool.execute({ workflowId: 'wf-123' }, mockContext))
        .rejects.toThrow('Failed to create version: Workflow not found');
    });

    it('should handle version service errors', async () => {
      const invalidWorkflow = { invalid: 'data' };
      mockApiClient.getWorkflow.mockResolvedValue(invalidWorkflow);

      await expect(tool.execute({ workflowId: 'wf-123' }, mockContext))
        .rejects.toThrow('Failed to create version');
    });
  });

  describe('Response Format', () => {
    const mockWorkflow = createMockWorkflow({ id: 'wf-123' });

    it('should return properly formatted response', async () => {
      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);

      const result = await tool.execute({ workflowId: 'wf-123' }, mockContext);
      const response = JSON.parse(result.content[0].text);

      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('version');
      expect(response).toHaveProperty('changes');
      expect(response).toHaveProperty('message');

      expect(response.version).toHaveProperty('id');
      expect(response.version).toHaveProperty('versionString');
      expect(response.version).toHaveProperty('workflowId');
      expect(response.version).toHaveProperty('branchName');
      expect(response.version).toHaveProperty('changeCount');
      expect(response.version).toHaveProperty('createdAt');
    });

    it('should include change details in response', async () => {
      mockApiClient.getWorkflow.mockResolvedValue(mockWorkflow);

      const result = await tool.execute({ workflowId: 'wf-123' }, mockContext);
      const response = JSON.parse(result.content[0].text);

      expect(Array.isArray(response.changes)).toBe(true);
      
      if (response.changes.length > 0) {
        const change = response.changes[0];
        expect(change).toHaveProperty('type');
        expect(change).toHaveProperty('path');
        expect(change).toHaveProperty('description');
      }
    });
  });
});