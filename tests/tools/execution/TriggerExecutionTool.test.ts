import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TriggerExecutionTool } from '../../../src/tools/execution/TriggerExecutionTool.js';
import { IToolContext } from '../../../src/tools/base/Tool.js';

describe('TriggerExecutionTool', () => {
  let tool: TriggerExecutionTool;
  let mockContext: IToolContext;

  beforeEach(() => {
    tool = new TriggerExecutionTool();
    mockContext = {
      apiClient: {
        request: vi.fn(),
      },
    };
  });

  it('should have correct metadata', () => {
    expect(tool.name).toBe('trigger_execution');
    expect(tool.description).toBe('Trigger a workflow execution with optional input data');
    
    const metadata = tool.getMetadata();
    expect(metadata?.category).toBe('execution');
    expect(metadata?.isMutating).toBe(true);
    expect(metadata?.tags).toContain('trigger');
  });

  it('should trigger execution without waiting', async () => {
    const mockExecution = {
      id: 'exec123',
      status: 'running',
      mode: 'manual',
      startedAt: '2024-01-01T00:00:00Z',
      finished: false,
      workflowId: 'wf123',
    };

    vi.mocked(mockContext.apiClient.request).mockResolvedValue(mockExecution);

    const result = await tool.execute({
      workflowId: 'wf123',
      waitForCompletion: false,
    }, mockContext);

    expect(mockContext.apiClient.request).toHaveBeenCalledWith(
      'POST',
      '/executions',
      {
        data: {
          workflowId: 'wf123',
          mode: 'manual',
          data: undefined,
        },
      }
    );

    expect(result.content[0].type).toBe('text');
    const parsedResult = JSON.parse(result.content[0].text!);
    expect(parsedResult.executionId).toBe('exec123');
    expect(parsedResult.status).toBe('running');
    expect(parsedResult.message).toContain('triggered successfully');
  });

  it('should trigger execution with input data', async () => {
    const mockExecution = {
      id: 'exec456',
      status: 'running',
      mode: 'manual',
      startedAt: '2024-01-01T00:00:00Z',
      finished: false,
      workflowId: 'wf456',
    };

    vi.mocked(mockContext.apiClient.request).mockResolvedValue(mockExecution);

    const inputData = { key: 'value', number: 42 };

    const result = await tool.execute({
      workflowId: 'wf456',
      inputData,
      waitForCompletion: false,
    }, mockContext);

    expect(mockContext.apiClient.request).toHaveBeenCalledWith(
      'POST',
      '/executions',
      {
        data: {
          workflowId: 'wf456',
          mode: 'manual',
          data: {
            startData: inputData,
          },
        },
      }
    );

    const parsedResult = JSON.parse(result.content[0].text!);
    expect(parsedResult.executionId).toBe('exec456');
  });

  it('should handle API errors', async () => {
    const error = new Error('API Error');
    vi.mocked(mockContext.apiClient.request).mockRejectedValue(error);

    await expect(
      tool.execute({ workflowId: 'wf789' }, mockContext)
    ).rejects.toThrow('API Error');
  });

  it('should throw error when API client is not configured', async () => {
    await expect(
      tool.execute({ workflowId: 'wf999' }, { apiClient: undefined })
    ).rejects.toThrow('n8n API client not configured');
  });
});