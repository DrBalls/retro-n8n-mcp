import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MonitorExecutionTool } from '../../../src/tools/execution/MonitorExecutionTool.js';
import { N8nApiClient } from '../../../src/services/N8nApiClient.js';
import { z } from 'zod';

describe('MonitorExecutionTool', () => {
  let tool: MonitorExecutionTool;
  let mockApiClient: any;

  beforeEach(() => {
    tool = new MonitorExecutionTool();
    mockApiClient = {
      request: vi.fn()
    };
  });

  describe('Basic Properties', () => {
    it('should have correct name', () => {
      expect(tool.name).toBe('monitor_execution');
    });

    it('should have a description', () => {
      expect(tool.description).toBeTruthy();
      expect(tool.description).toContain('Monitor');
      expect(tool.description).toContain('real-time');
    });

    it('should have correct metadata', () => {
      const metadata = tool.getMetadata();
      expect(metadata.category).toBe('execution');
      expect(metadata.isMutating).toBe(false);
      expect(metadata.requirements).toContain('n8n API access');
      expect(metadata.tags).toContain('execution');
      expect(metadata.tags).toContain('monitor');
      expect(metadata.tags).toContain('real-time');
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

    it('should accept optional pollInterval parameter', () => {
      const schema = tool.inputSchema as z.ZodObject<any>;
      
      const withInterval = { executionId: '123', pollInterval: 5000 };
      const noInterval = { executionId: '123' };
      
      expect(() => schema.parse(withInterval)).not.toThrow();
      expect(() => schema.parse(noInterval)).not.toThrow();
    });

    it('should accept optional maxDuration parameter', () => {
      const schema = tool.inputSchema as z.ZodObject<any>;
      
      const withMaxDuration = { executionId: '123', maxDuration: 60000 };
      const noMaxDuration = { executionId: '123' };
      
      expect(() => schema.parse(withMaxDuration)).not.toThrow();
      expect(() => schema.parse(noMaxDuration)).not.toThrow();
    });
  });

  describe('Execution Monitoring', () => {
    it('should monitor execution until completion', async () => {
      const runningExecution = {
        id: '123',
        workflowId: 'wf-456',
        finished: false,
        mode: 'manual',
        startedAt: '2024-01-15T10:00:00.000Z',
        status: 'running',
        data: {
          resultData: {
            runData: {
              'Start': [{ executionTime: 10 }]
            }
          }
        }
      };

      const completedExecution = {
        ...runningExecution,
        finished: true,
        status: 'success',
        stoppedAt: '2024-01-15T10:00:05.000Z',
        data: {
          resultData: {
            runData: {
              'Start': [{ executionTime: 10 }],
              'HTTP Request': [{ executionTime: 100 }]
            }
          }
        }
      };

      mockApiClient.request
        .mockResolvedValueOnce(runningExecution)
        .mockResolvedValueOnce(runningExecution)
        .mockResolvedValueOnce(completedExecution);

      const result = await tool.execute(
        { executionId: '123', pollInterval: 100 },
        { apiClient: mockApiClient }
      );

      expect(mockApiClient.request).toHaveBeenCalledTimes(3);
      expect(mockApiClient.request).toHaveBeenCalledWith(
        'GET',
        '/executions/123',
        { params: { includeData: true } }
      );

      const response = JSON.parse(result.content[0].text);
      expect(response.status).toBe('success');
      expect(response.monitoring.updates).toBeTruthy();
      expect(response.monitoring.duration).toBeTruthy();
      expect(response.finalState).toBeTruthy();
    });

    it('should handle execution failure', async () => {
      const failedExecution = {
        id: '123',
        workflowId: 'wf-456',
        finished: true,
        mode: 'manual',
        startedAt: '2024-01-15T10:00:00.000Z',
        stoppedAt: '2024-01-15T10:00:01.000Z',
        status: 'error',
        data: {
          resultData: {
            error: {
              message: 'Node execution failed',
              node: 'HTTP Request'
            }
          }
        }
      };

      mockApiClient.request.mockResolvedValueOnce(failedExecution);

      const result = await tool.execute(
        { executionId: '123' },
        { apiClient: mockApiClient }
      );

      const response = JSON.parse(result.content[0].text);
      expect(response.status).toBe('error');
      expect(response.finalState.status).toBe('error');
    });

    it('should respect maxDuration limit', async () => {
      const runningExecution = {
        id: '123',
        workflowId: 'wf-456',
        finished: false,
        status: 'running'
      };

      mockApiClient.request.mockResolvedValue(runningExecution);

      const result = await tool.execute(
        { executionId: '123', pollInterval: 100, maxDuration: 1000 },
        { apiClient: mockApiClient }
      );

      // Should poll multiple times until timeout
      expect(mockApiClient.request.mock.calls.length).toBeGreaterThan(1);
      
      const response = JSON.parse(result.content[0].text);
      expect(response.status).toBe('running');
      expect(response.monitoring.timedOut).toBe(true);
    });

    it('should throw error when API client is not configured', async () => {
      await expect(
        tool.execute({ executionId: '123' }, {})
      ).rejects.toThrow('n8n API client not configured');
    });

    it('should handle API errors during monitoring', async () => {
      mockApiClient.request
        .mockResolvedValueOnce({ id: '123', finished: false, status: 'running' })
        .mockRejectedValueOnce(new Error('API Error'));

      await expect(
        tool.execute(
          { executionId: '123', pollInterval: 100 },
          { apiClient: mockApiClient }
        )
      ).rejects.toThrow('API Error');
    });

    it('should track node execution progress', async () => {
      const executionWithProgress = {
        id: '123',
        workflowId: 'wf-456',
        finished: false,
        status: 'running',
        data: {
          executionData: {
            nodeExecutionStack: [
              { node: 'HTTP Request', data: {} },
              { node: 'Set', data: {} }
            ]
          },
          resultData: {
            runData: {
              'Start': [{ executionTime: 5 }],
              'HTTP Request': [{ executionTime: 100 }]
            }
          }
        }
      };

      const completedExecution = {
        ...executionWithProgress,
        finished: true,
        status: 'success',
        data: {
          resultData: {
            runData: {
              'Start': [{ executionTime: 5 }],
              'HTTP Request': [{ executionTime: 100 }],
              'Set': [{ executionTime: 20 }]
            }
          }
        }
      };

      mockApiClient.request
        .mockResolvedValueOnce(executionWithProgress)
        .mockResolvedValueOnce(completedExecution);

      const result = await tool.execute(
        { executionId: '123', pollInterval: 100 },
        { apiClient: mockApiClient }
      );

      const response = JSON.parse(result.content[0].text);
      expect(response.finalState.nodesExecuted).toBe(3);
      expect(response.finalState.lastNodeExecuted).toBeTruthy();
    });

    it('should use default poll interval and max polls', async () => {
      const execution = {
        id: '123',
        workflowId: 'wf-456',
        finished: true,
        mode: 'manual',
        startedAt: '2024-01-15T10:00:00.000Z',
        stoppedAt: '2024-01-15T10:00:05.000Z',
        status: 'success',
        data: {}
      };

      mockApiClient.request.mockResolvedValueOnce(execution);

      await tool.execute(
        { executionId: '123' },
        { apiClient: mockApiClient }
      );

      // Should only poll once since execution is already finished
      expect(mockApiClient.request).toHaveBeenCalledTimes(1);
    });
  });

  describe('Response Format', () => {
    it('should return comprehensive monitoring report', async () => {
      const execution = {
        id: '123',
        workflowId: 'wf-456',
        workflowName: 'Test Workflow',
        finished: true,
        mode: 'manual',
        startedAt: '2024-01-15T10:00:00.000Z',
        stoppedAt: '2024-01-15T10:00:05.000Z',
        status: 'success',
        data: {
          resultData: {
            runData: {
              'Start': [{ executionTime: 10, source: [] }],
              'End': [{ executionTime: 5, source: ['Start'] }]
            }
          }
        }
      };

      mockApiClient.request.mockResolvedValueOnce(execution);

      const result = await tool.execute(
        { executionId: '123' },
        { apiClient: mockApiClient }
      );

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].mimeType).toBe('application/json');

      const response = JSON.parse(result.content[0].text);
      expect(response).toHaveProperty('executionId', '123');
      expect(response).toHaveProperty('status', 'success');
      expect(response).toHaveProperty('monitoring');
      expect(response.monitoring).toHaveProperty('duration');
      expect(response.monitoring).toHaveProperty('updates');
      expect(response).toHaveProperty('finalState');
      expect(response.finalState).toHaveProperty('id', '123');
      expect(response.finalState).toHaveProperty('workflowId', 'wf-456');
    });
  });
});