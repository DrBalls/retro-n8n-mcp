import { describe, it, expect, vi } from 'vitest';
import { UpdateWorkflowTool } from '../../../src/tools/workflow/UpdateWorkflowTool.js';
import { IToolContext } from '../../../src/tools/base/Tool.js';

describe('UpdateWorkflowTool', () => {
  it('should update a workflow', async () => {
    const mockUpdatedWorkflow = {
      id: 'wf-123',
      name: 'Updated Workflow',
      active: false,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-03T00:00:00.000Z',
      nodes: [{ id: 'node1' }],
      tags: [{ id: 'tag1', name: 'production' }],
    };

    const mockApiClient = {
      updateWorkflow: vi.fn().mockResolvedValue(mockUpdatedWorkflow),
    };

    const context: IToolContext = {
      apiClient: mockApiClient as any,
    };

    const tool = new UpdateWorkflowTool();
    const result = await tool.execute({
      id: 'wf-123',
      name: 'Updated Workflow',
      active: false,
      tags: ['production'],
    }, context);

    expect(mockApiClient.updateWorkflow).toHaveBeenCalledWith('wf-123', {
      name: 'Updated Workflow',
      active: false,
      tags: [{ name: 'production' }],
    });

    const response = JSON.parse(result.content[0].text);
    expect(response.success).toBe(true);
    expect(response.workflow.name).toBe('Updated Workflow');
    expect(response.workflow.active).toBe(false);
  });

  it('should handle tag objects correctly', async () => {
    const mockApiClient = {
      updateWorkflow: vi.fn().mockResolvedValue({
        id: 'wf-123',
        name: 'Test',
        tags: [{ id: 'tag1', name: 'prod' }],
      }),
    };

    const context: IToolContext = {
      apiClient: mockApiClient as any,
    };

    const tool = new UpdateWorkflowTool();
    await tool.execute({
      id: 'wf-123',
      tags: [{ id: 'tag1', name: 'prod' }],
    }, context);

    expect(mockApiClient.updateWorkflow).toHaveBeenCalledWith('wf-123', {
      tags: [{ id: 'tag1', name: 'prod' }],
    });
  });

  it('should handle workflow not found', async () => {
    const mockApiClient = {
      updateWorkflow: vi.fn().mockRejectedValue(new Error('404 Not Found')),
    };

    const context: IToolContext = {
      apiClient: mockApiClient as any,
    };

    const tool = new UpdateWorkflowTool();

    await expect(tool.execute({ id: 'non-existent', name: 'New Name' }, context))
      .rejects.toThrow("Workflow with ID 'non-existent' not found");
  });

  it('should throw error when API client not configured', async () => {
    const tool = new UpdateWorkflowTool();
    
    await expect(tool.execute({ id: 'wf-123', name: 'New Name' }, {}))
      .rejects.toThrow('n8n API client not configured');
  });
});