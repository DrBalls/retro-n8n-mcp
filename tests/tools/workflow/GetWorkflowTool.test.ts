import { describe, it, expect, vi } from 'vitest';
import { GetWorkflowTool } from '../../../src/tools/workflow/GetWorkflowTool.js';
import { IToolContext } from '../../../src/tools/base/Tool.js';

describe('GetWorkflowTool', () => {
  it('should retrieve a workflow by ID', async () => {
    const mockWorkflow = {
      id: 'wf-123',
      name: 'Test Workflow',
      active: true,
      nodes: [{ id: 'node1', type: 'n8n-nodes-base.webhook' }],
      connections: {},
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z',
    };

    const mockApiClient = {
      getWorkflow: vi.fn().mockResolvedValue(mockWorkflow),
    };

    const context: IToolContext = {
      apiClient: mockApiClient as any,
    };

    const tool = new GetWorkflowTool();
    const result = await tool.execute({ id: 'wf-123' }, context);

    expect(mockApiClient.getWorkflow).toHaveBeenCalledWith('wf-123');
    expect(result.content[0].mimeType).toBe('application/json');
    expect(JSON.parse(result.content[0].text)).toEqual(mockWorkflow);
  });

  it('should exclude nodes when requested', async () => {
    const mockWorkflow = {
      id: 'wf-123',
      name: 'Test Workflow',
      active: true,
      nodes: [{ id: 'node1', type: 'n8n-nodes-base.webhook' }],
      connections: { node1: { main: [[]] } },
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z',
    };

    const mockApiClient = {
      getWorkflow: vi.fn().mockResolvedValue(mockWorkflow),
    };

    const context: IToolContext = {
      apiClient: mockApiClient as any,
    };

    const tool = new GetWorkflowTool();
    const result = await tool.execute({ id: 'wf-123', includeNodes: false }, context);

    const response = JSON.parse(result.content[0].text);
    expect(response.nodes).toBeUndefined();
    expect(response.connections).toBeUndefined();
    expect(response.id).toBe('wf-123');
    expect(response.name).toBe('Test Workflow');
  });

  it('should handle workflow not found', async () => {
    const mockApiClient = {
      getWorkflow: vi.fn().mockRejectedValue(new Error('404 Not Found')),
    };

    const context: IToolContext = {
      apiClient: mockApiClient as any,
    };

    const tool = new GetWorkflowTool();

    await expect(tool.execute({ id: 'non-existent' }, context))
      .rejects.toThrow("Workflow with ID 'non-existent' not found");
  });

  it('should throw error when API client not configured', async () => {
    const tool = new GetWorkflowTool();
    
    await expect(tool.execute({ id: 'wf-123' }, {}))
      .rejects.toThrow('n8n API client not configured');
  });
});