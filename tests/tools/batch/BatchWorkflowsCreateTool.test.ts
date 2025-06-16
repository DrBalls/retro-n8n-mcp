import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BatchWorkflowsCreateTool } from '../../../src/tools/batch/BatchWorkflowsCreateTool.js';
import { BatchOperationManager } from '../../../src/services/BatchOperationManager.js';
import { IToolContext } from '../../../src/tools/base/Tool.js';

// Mock BatchOperationManager
vi.mock('../../../src/services/BatchOperationManager.js');

describe('BatchWorkflowsCreateTool', () => {
  let tool: BatchWorkflowsCreateTool;
  let mockApiClient: any;
  let mockBatchManager: any;
  let context: IToolContext;

  beforeEach(() => {
    tool = new BatchWorkflowsCreateTool();
    
    mockApiClient = {
      createWorkflow: vi.fn(),
      getWorkflow: vi.fn(),
      deleteWorkflow: vi.fn(),
    };

    mockBatchManager = {
      createBatchOperation: vi.fn(),
      getOperationStatus: vi.fn(),
      on: vi.fn(),
    };

    vi.mocked(BatchOperationManager).mockImplementation(() => mockBatchManager);

    context = {
      apiClient: mockApiClient,
    };
  });

  describe('Basic Properties', () => {
    it('should have correct name and description', () => {
      expect(tool.name).toBe('batch_workflows_create');
      expect(tool.description).toContain('batch operation');
      expect(tool.description).toContain('atomic');
    });

    it('should have correct metadata', () => {
      const metadata = tool.getMetadata();
      expect(metadata.category).toBe('workflow');
      expect(metadata.isMutating).toBe(true);
      expect(metadata.tags).toContain('batch');
      expect(metadata.tags).toContain('create');
      expect(metadata.tags).toContain('atomic');
    });
  });

  describe('Input Validation', () => {
    it('should require at least one workflow', async () => {
      await expect(tool.execute({
        workflows: [],
      }, context)).rejects.toThrow();
    });

    it('should limit to 100 workflows', async () => {
      const workflows = Array(101).fill(null).map((_, i) => ({
        name: `Workflow ${i}`,
        nodes: [],
        connections: {},
      }));

      await expect(tool.execute({
        workflows,
      }, context)).rejects.toThrow();
    });

    it('should validate workflow structure', async () => {
      await expect(tool.execute({
        workflows: [{
          // Missing required fields
          connections: {},
        }],
      }, context)).rejects.toThrow();
    });
  });

  describe('Batch Creation', () => {
    it('should create workflows successfully', async () => {
      const workflows = [
        {
          name: 'Workflow 1',
          nodes: [
            {
              id: '1',
              name: 'Start',
              type: 'n8n-nodes-base.start',
              typeVersion: 1,
              position: [100, 100],
            },
          ],
          connections: {},
          tags: ['test'],
          active: false,
        },
        {
          name: 'Workflow 2',
          nodes: [
            {
              id: '1',
              name: 'Start',
              type: 'n8n-nodes-base.start',
              typeVersion: 1,
              position: [100, 100],
            },
          ],
          connections: {},
        },
      ];

      const operationId = 'op-123';
      mockBatchManager.createBatchOperation.mockResolvedValue(operationId);
      
      mockBatchManager.getOperationStatus
        .mockReturnValueOnce({
          id: operationId,
          status: 'in_progress',
          totalItems: 2,
          processedItems: 0,
          successfulItems: 0,
          failedItems: 0,
          startTime: new Date(),
          items: [],
        })
        .mockReturnValueOnce({
          id: operationId,
          status: 'completed',
          totalItems: 2,
          processedItems: 2,
          successfulItems: 2,
          failedItems: 0,
          startTime: new Date(),
          endTime: new Date(),
          items: [
            {
              id: 'item-1',
              status: 'success',
              result: { id: 'wf-1', name: 'Workflow 1', active: false, createdAt: new Date().toISOString() },
              data: workflows[0],
            },
            {
              id: 'item-2',
              status: 'success',
              result: { id: 'wf-2', name: 'Workflow 2', active: false, createdAt: new Date().toISOString() },
              data: workflows[1],
            },
          ],
        });

      const result = await tool.execute({
        workflows,
        options: {
          atomic: true,
          concurrency: 5,
        },
      }, context);

      expect(mockBatchManager.createBatchOperation).toHaveBeenCalledWith(
        'create',
        expect.arrayContaining([
          expect.objectContaining({ name: 'Workflow 1' }),
          expect.objectContaining({ name: 'Workflow 2' }),
        ]),
        expect.objectContaining({
          atomic: true,
          concurrency: 5,
          validateItem: expect.any(Function),
          onProgress: expect.any(Function),
        })
      );

      const response = JSON.parse(result.content[0].text);
      expect(response.status).toBe('completed');
      expect(response.summary.total).toBe(2);
      expect(response.summary.successful).toBe(2);
      expect(response.results.created).toHaveLength(2);
      expect(response.results.created[0].workflowId).toBe('wf-1');
    });

    it('should handle partial failures', async () => {
      const workflows = [
        { name: 'Success Workflow', nodes: [], connections: {} },
        { name: 'Fail Workflow', nodes: [], connections: {} },
      ];

      const operationId = 'op-456';
      mockBatchManager.createBatchOperation.mockResolvedValue(operationId);
      
      mockBatchManager.getOperationStatus.mockReturnValue({
        id: operationId,
        status: 'partially_completed',
        totalItems: 2,
        processedItems: 2,
        successfulItems: 1,
        failedItems: 1,
        startTime: new Date(),
        endTime: new Date(),
        items: [
          {
            id: 'item-1',
            status: 'success',
            result: { id: 'wf-1', name: 'Success Workflow', active: false },
            data: workflows[0],
          },
          {
            id: 'item-2',
            status: 'failed',
            error: 'API error: Invalid workflow',
            retryCount: 2,
            data: workflows[1],
          },
        ],
      });

      const result = await tool.execute({ workflows }, context);

      const response = JSON.parse(result.content[0].text);
      expect(response.status).toBe('partially_completed');
      expect(response.summary.successful).toBe(1);
      expect(response.summary.failed).toBe(1);
      expect(response.results.created).toHaveLength(1);
      expect(response.results.failed).toHaveLength(1);
      expect(response.results.failed[0].error).toContain('Invalid workflow');
      expect(response.warnings).toContain('1 workflows failed to create');
    });

    it('should handle atomic rollback', async () => {
      const workflows = [
        { name: 'Workflow 1', nodes: [], connections: {} },
        { name: 'Workflow 2', nodes: [], connections: {} },
      ];

      const operationId = 'op-789';
      mockBatchManager.createBatchOperation.mockResolvedValue(operationId);
      
      mockBatchManager.getOperationStatus.mockReturnValue({
        id: operationId,
        status: 'rolled_back',
        totalItems: 2,
        processedItems: 2,
        successfulItems: 1,
        failedItems: 1,
        startTime: new Date(),
        endTime: new Date(),
        items: [
          {
            id: 'item-1',
            status: 'rolled_back',
            result: { id: 'wf-1', name: 'Workflow 1', active: false },
            data: workflows[0],
          },
          {
            id: 'item-2',
            status: 'failed',
            error: 'Creation failed',
            data: workflows[1],
          },
        ],
      });

      const result = await tool.execute({
        workflows,
        options: { atomic: true },
      }, context);

      const response = JSON.parse(result.content[0].text);
      expect(response.status).toBe('rolled_back');
      expect(response.rollback).toBeDefined();
      expect(response.rollback.reason).toContain('rolled back');
    });
  });

  describe('Workflow Validation', () => {
    it('should validate workflow structure when enabled', async () => {
      const invalidWorkflows = [
        {
          name: '',  // Empty name
          nodes: [],
          connections: {},
        },
        {
          name: 'Valid',
          nodes: [
            {
              // Missing required node fields
              name: 'Invalid Node',
            },
          ],
          connections: {},
        },
      ];

      const operationId = 'op-val';
      mockBatchManager.createBatchOperation.mockImplementation(async (type, items, options) => {
        // Test the validation function
        const validateItem = options.validateItem;
        
        // Should reject empty name
        await expect(validateItem(items[0])).rejects.toThrow('name is required');
        
        // Should reject invalid node
        await expect(validateItem(items[1])).rejects.toThrow('Invalid node structure');
        
        return operationId;
      });

      mockBatchManager.getOperationStatus.mockReturnValue({
        id: operationId,
        status: 'failed',
        totalItems: 2,
        processedItems: 0,
        successfulItems: 0,
        failedItems: 2,
        startTime: new Date(),
        endTime: new Date(),
        items: [],
      });

      const result = await tool.execute({
        workflows: invalidWorkflows,
        options: { validateWorkflows: true },
      }, context);

      expect(mockBatchManager.createBatchOperation).toHaveBeenCalled();
    });
  });

  describe('Progress Tracking', () => {
    it('should track progress updates', async () => {
      const workflows = Array(5).fill(null).map((_, i) => ({
        name: `Workflow ${i}`,
        nodes: [],
        connections: {},
      }));

      const operationId = 'op-progress';
      const progressUpdates: any[] = [];

      mockBatchManager.createBatchOperation.mockImplementation(async (type, items, options) => {
        // Simulate progress updates
        const onProgress = options.onProgress;
        onProgress({
          operationId,
          type: 'create',
          totalItems: 5,
          processedItems: 1,
          successfulItems: 1,
          failedItems: 0,
          percentage: 20,
        });
        onProgress({
          operationId,
          type: 'create',
          totalItems: 5,
          processedItems: 3,
          successfulItems: 3,
          failedItems: 0,
          percentage: 60,
        });
        
        return operationId;
      });

      mockBatchManager.getOperationStatus.mockReturnValue({
        id: operationId,
        status: 'completed',
        totalItems: 5,
        processedItems: 5,
        successfulItems: 5,
        failedItems: 0,
        startTime: new Date(),
        endTime: new Date(),
        items: workflows.map((w, i) => ({
          id: `item-${i}`,
          status: 'success',
          result: { id: `wf-${i}`, name: w.name, active: false },
          data: w,
        })),
      });

      const result = await tool.execute({ workflows }, context);

      const response = JSON.parse(result.content[0].text);
      expect(response.progressHistory).toBeDefined();
      expect(response.progressHistory.length).toBeGreaterThanOrEqual(2);
      expect(response.progressHistory[0].percentage).toBe(20);
    });
  });

  describe('Error Handling', () => {
    it('should handle API client not configured', async () => {
      await expect(tool.execute({
        workflows: [{ name: 'Test', nodes: [], connections: {} }],
      }, {})).rejects.toThrow('n8n API client not configured');
    });

    it('should handle operation timeout', async () => {
      const workflows = [{ name: 'Test', nodes: [], connections: {} }];

      mockBatchManager.createBatchOperation.mockResolvedValue('op-timeout');
      mockBatchManager.getOperationStatus.mockReturnValue({
        id: 'op-timeout',
        status: 'in_progress',
        totalItems: 1,
        processedItems: 0,
        successfulItems: 0,
        failedItems: 0,
        startTime: new Date(Date.now() - 400000), // Started 400 seconds ago
        items: [],
      });

      // Mock setTimeout to speed up test
      vi.useFakeTimers();
      
      const promise = tool.execute({ workflows }, context);
      
      // Fast-forward time
      vi.advanceTimersByTime(310000); // Past the 5-minute timeout
      
      await expect(promise).rejects.toThrow('Operation timed out');
      
      vi.useRealTimers();
    });

    it('should handle batch manager exceptions', async () => {
      const workflows = [{ name: 'Test', nodes: [], connections: {} }];

      mockBatchManager.createBatchOperation.mockRejectedValue(new Error('Batch manager error'));

      const result = await tool.execute({ workflows }, context);

      const response = JSON.parse(result.content[0].text);
      expect(response.error).toBe('Batch manager error');
      expect(response.status).toBe('failed');
    });
  });
});