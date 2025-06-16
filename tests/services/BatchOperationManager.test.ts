import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { BatchOperationManager } from '../../src/services/BatchOperationManager.js';
import { N8nApiClient } from '../../src/services/N8nApiClient.js';
import { 
  BatchOperationType,
  IBatchOperationOptions,
  IBatchWorkflowCreate,
  IBatchWorkflowUpdate,
  IBatchWorkflowDelete
} from '../../src/types/batch.types.js';

describe('BatchOperationManager', () => {
  let batchManager: BatchOperationManager;
  let mockApiClient: any;

  beforeEach(() => {
    mockApiClient = {
      createWorkflow: vi.fn(),
      updateWorkflow: vi.fn(),
      deleteWorkflow: vi.fn(),
      activateWorkflow: vi.fn(),
      deactivateWorkflow: vi.fn(),
      getWorkflow: vi.fn(),
    };

    batchManager = new BatchOperationManager(mockApiClient as N8nApiClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Batch Operations', () => {
    it('should create a batch operation', async () => {
      const items: IBatchWorkflowCreate[] = [
        {
          name: 'Test Workflow 1',
          nodes: [{ id: '1', name: 'Start', type: 'n8n-nodes-base.start', typeVersion: 1, position: [0, 0] }],
          connections: {},
        },
        {
          name: 'Test Workflow 2',
          nodes: [{ id: '1', name: 'Start', type: 'n8n-nodes-base.start', typeVersion: 1, position: [0, 0] }],
          connections: {},
        },
      ];

      mockApiClient.createWorkflow.mockResolvedValue({ id: 'wf-123', name: 'Test', active: false });

      const operationId = await batchManager.createBatchOperation('create', items);
      
      expect(operationId).toBeTruthy();
      expect(typeof operationId).toBe('string');
      
      // Wait a bit for async processing to start
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const status = batchManager.getOperationStatus(operationId);
      expect(status).toBeDefined();
      expect(status?.type).toBe('create');
      expect(status?.totalItems).toBe(2);
    });

    it('should process items with concurrency control', async () => {
      const items: IBatchWorkflowCreate[] = Array(10).fill(null).map((_, i) => ({
        name: `Workflow ${i}`,
        nodes: [],
        connections: {},
      }));

      let activeCount = 0;
      let maxActiveCount = 0;

      mockApiClient.createWorkflow.mockImplementation(async () => {
        activeCount++;
        maxActiveCount = Math.max(maxActiveCount, activeCount);
        
        // Simulate some processing time
        await new Promise(resolve => setTimeout(resolve, 50));
        
        activeCount--;
        return { id: `wf-${Date.now()}`, name: 'Test', active: false };
      });

      const options: IBatchOperationOptions = {
        concurrency: 3,
        stopOnError: false,
      };

      const operationId = await batchManager.createBatchOperation('create', items, options);
      
      // Wait for completion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const status = batchManager.getOperationStatus(operationId);
      expect(status?.status).toBe('completed');
      expect(status?.successfulItems).toBe(10);
      expect(maxActiveCount).toBeLessThanOrEqual(3); // Should respect concurrency limit
    });

    it('should handle errors with retry', async () => {
      const items: IBatchWorkflowCreate[] = [
        { name: 'Workflow 1', nodes: [], connections: {} },
      ];

      let attempts = 0;
      mockApiClient.createWorkflow.mockImplementation(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary error');
        }
        return { id: 'wf-123', name: 'Test', active: false };
      });

      const options: IBatchOperationOptions = {
        maxRetries: 3,
        retryDelay: 10,
      };

      const operationId = await batchManager.createBatchOperation('create', items, options);
      
      // Wait for completion
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const status = batchManager.getOperationStatus(operationId);
      expect(status?.status).toBe('completed');
      expect(status?.successfulItems).toBe(1);
      expect(attempts).toBe(3); // Should have retried
    });

    it('should stop on error when configured', async () => {
      const items: IBatchWorkflowCreate[] = [
        { name: 'Workflow 1', nodes: [], connections: {} },
        { name: 'Workflow 2', nodes: [], connections: {} },
        { name: 'Workflow 3', nodes: [], connections: {} },
      ];

      let callCount = 0;
      mockApiClient.createWorkflow.mockImplementation(async () => {
        callCount++;
        if (callCount === 2) {
          throw new Error('Fatal error');
        }
        return { id: `wf-${callCount}`, name: 'Test', active: false };
      });

      const options: IBatchOperationOptions = {
        stopOnError: true,
        maxRetries: 0,
      };

      const operationId = await batchManager.createBatchOperation('create', items, options);
      
      // Wait for completion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const status = batchManager.getOperationStatus(operationId);
      // Could be failed or partially_completed depending on timing
      expect(['failed', 'partially_completed']).toContain(status?.status);
      expect(status?.successfulItems).toBe(1);
      expect(status?.failedItems).toBeGreaterThanOrEqual(1);
      expect(status?.processedItems).toBeGreaterThanOrEqual(2); // Should have at least processed 2
    });

    it('should validate items before processing', async () => {
      const items: IBatchWorkflowCreate[] = [
        { name: '', nodes: [], connections: {} }, // Invalid
        { name: 'Valid Workflow', nodes: [], connections: {} },
      ];

      mockApiClient.createWorkflow.mockResolvedValue({ id: 'wf-123', name: 'Test', active: false });

      const options: IBatchOperationOptions = {
        validateItem: async (item: IBatchWorkflowCreate) => {
          return item.name.length > 0;
        },
      };

      const operationId = await batchManager.createBatchOperation('create', items, options);
      
      // Wait for completion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const status = batchManager.getOperationStatus(operationId);
      expect(['partially_completed', 'completed']).toContain(status?.status);
      expect(status?.successfulItems).toBe(1);
      expect(status?.failedItems).toBe(1);
    });
  });

  describe('Progress Tracking', () => {
    it('should emit progress events', async () => {
      const items: IBatchWorkflowCreate[] = Array(5).fill(null).map((_, i) => ({
        name: `Workflow ${i}`,
        nodes: [],
        connections: {},
      }));

      mockApiClient.createWorkflow.mockResolvedValue({ id: 'wf-123', name: 'Test', active: false });

      const progressUpdates: any[] = [];
      batchManager.on('operation:progress', (progress) => {
        progressUpdates.push(progress);
      });

      const operationId = await batchManager.createBatchOperation('create', items);
      
      // Wait for completion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      expect(progressUpdates.length).toBeGreaterThan(0);
      
      const lastUpdate = progressUpdates[progressUpdates.length - 1];
      expect(lastUpdate.totalItems).toBe(5);
      expect(lastUpdate.processedItems).toBe(5);
      expect(lastUpdate.percentage).toBe(100);
    });

    it('should calculate estimated time remaining', async () => {
      const items: IBatchWorkflowCreate[] = Array(10).fill(null).map((_, i) => ({
        name: `Workflow ${i}`,
        nodes: [],
        connections: {},
      }));

      mockApiClient.createWorkflow.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return { id: 'wf-123', name: 'Test', active: false };
      });

      let hasEstimatedTime = false;
      const options: IBatchOperationOptions = {
        concurrency: 1,
        onProgress: (progress) => {
          if (progress.estimatedTimeRemaining && progress.estimatedTimeRemaining > 0) {
            hasEstimatedTime = true;
          }
        },
      };

      const operationId = await batchManager.createBatchOperation('create', items, options);
      
      // Wait for some progress
      await new Promise(resolve => setTimeout(resolve, 500));
      
      expect(hasEstimatedTime).toBe(true);
      
      // Cancel to speed up test
      await batchManager.cancelOperation(operationId);
    });
  });

  describe('Atomic Operations and Rollback', () => {
    it('should rollback on failure when atomic is true', async () => {
      const items: IBatchWorkflowCreate[] = [
        { name: 'Workflow 1', nodes: [], connections: {} },
        { name: 'Workflow 2', nodes: [], connections: {} },
        { name: 'Workflow 3', nodes: [], connections: {} },
      ];

      let createCount = 0;
      const createdIds: string[] = [];
      
      mockApiClient.createWorkflow.mockImplementation(async () => {
        createCount++;
        if (createCount === 3) {
          throw new Error('Failed on third item');
        }
        const id = `wf-${createCount}`;
        createdIds.push(id);
        return { id, name: 'Test', active: false };
      });

      mockApiClient.deleteWorkflow.mockResolvedValue({});

      const options: IBatchOperationOptions = {
        atomic: true,
        maxRetries: 0,
      };

      const operationId = await batchManager.createBatchOperation('create', items, options);
      
      // Wait for completion and rollback
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const status = batchManager.getOperationStatus(operationId);
      expect(status?.status).toBe('rolled_back');
      
      // Should have called delete for successfully created items
      expect(mockApiClient.deleteWorkflow).toHaveBeenCalledTimes(2);
      expect(mockApiClient.deleteWorkflow).toHaveBeenCalledWith('wf-1');
      expect(mockApiClient.deleteWorkflow).toHaveBeenCalledWith('wf-2');
    });

    it('should handle rollback errors gracefully', async () => {
      const items: IBatchWorkflowCreate[] = [
        { name: 'Workflow 1', nodes: [], connections: {} },
        { name: 'Workflow 2', nodes: [], connections: {} },
      ];

      let createCount = 0;
      mockApiClient.createWorkflow.mockImplementation(async () => {
        createCount++;
        if (createCount === 2) {
          throw new Error('Create failed');
        }
        return { id: 'wf-1', name: 'Test', active: false };
      });

      mockApiClient.deleteWorkflow.mockRejectedValue(new Error('Delete failed'));

      const options: IBatchOperationOptions = {
        atomic: true,
        maxRetries: 0,
      };

      const operationId = await batchManager.createBatchOperation('create', items, options);
      
      // Wait for completion and rollback
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const status = batchManager.getOperationStatus(operationId);
      expect(status?.status).toBe('rolled_back');
      
      // Rollback should have been attempted despite error
      expect(mockApiClient.deleteWorkflow).toHaveBeenCalled();
    });
  });

  describe('Operation Management', () => {
    it('should cancel an active operation', async () => {
      const items: IBatchWorkflowCreate[] = Array(100).fill(null).map((_, i) => ({
        name: `Workflow ${i}`,
        nodes: [],
        connections: {},
      }));

      mockApiClient.createWorkflow.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return { id: 'wf-123', name: 'Test', active: false };
      });

      const operationId = await batchManager.createBatchOperation('create', items, {
        concurrency: 1,
      });
      
      // Let it process a few items
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const cancelled = await batchManager.cancelOperation(operationId);
      expect(cancelled).toBe(true);
      
      const status = batchManager.getOperationStatus(operationId);
      expect(status?.status).toBe('failed');
      expect(status?.error).toContain('cancelled');
      expect(status?.processedItems).toBeLessThan(100);
    });

    it('should list active operations', async () => {
      const items1: IBatchWorkflowCreate[] = [{ name: 'Workflow 1', nodes: [], connections: {} }];
      const items2: IBatchWorkflowUpdate[] = [{ id: 'wf-1', name: 'Updated' }];

      mockApiClient.createWorkflow.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return { id: 'wf-123', name: 'Test', active: false };
      });

      mockApiClient.updateWorkflow.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return { id: 'wf-1', name: 'Updated', active: false };
      });

      const op1 = await batchManager.createBatchOperation('create', items1);
      const op2 = await batchManager.createBatchOperation('update', items2);
      
      // Check active operations while processing
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const activeOps = batchManager.getActiveOperations();
      expect(activeOps.length).toBe(2);
      expect(activeOps.map(op => op.type).sort()).toEqual(['create', 'update']);
      
      // Wait for completion
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const activeOpsAfter = batchManager.getActiveOperations();
      expect(activeOpsAfter.length).toBe(0);
    });

    it('should cleanup old operations', async () => {
      const items: IBatchWorkflowCreate[] = [{ name: 'Workflow', nodes: [], connections: {} }];
      
      mockApiClient.createWorkflow.mockResolvedValue({ id: 'wf-123', name: 'Test', active: false });

      const operationId = await batchManager.createBatchOperation('create', items);
      
      // Wait for completion
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Should still exist
      expect(batchManager.getOperationStatus(operationId)).toBeDefined();
      
      // Cleanup operations older than 1ms (all of them)
      const cleaned = batchManager.cleanupOldOperations(1);
      expect(cleaned).toBe(1);
      
      // Should no longer exist
      expect(batchManager.getOperationStatus(operationId)).toBeNull();
    });
  });

  describe('Different Operation Types', () => {
    it('should handle update operations', async () => {
      const items: IBatchWorkflowUpdate[] = [
        { id: 'wf-1', name: 'Updated 1' },
        { id: 'wf-2', name: 'Updated 2' },
      ];

      mockApiClient.updateWorkflow.mockResolvedValue({ id: 'wf-1', name: 'Updated', active: false });

      const operationId = await batchManager.createBatchOperation('update', items);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const status = batchManager.getOperationStatus(operationId);
      expect(status?.status).toBe('completed');
      expect(status?.successfulItems).toBe(2);
      expect(mockApiClient.updateWorkflow).toHaveBeenCalledTimes(2);
    });

    it('should handle delete operations', async () => {
      const items: IBatchWorkflowDelete[] = [
        { id: 'wf-1' },
        { id: 'wf-2', force: true },
      ];

      mockApiClient.deleteWorkflow.mockResolvedValue({});

      const operationId = await batchManager.createBatchOperation('delete', items);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const status = batchManager.getOperationStatus(operationId);
      expect(status?.status).toBe('completed');
      expect(status?.successfulItems).toBe(2);
      expect(mockApiClient.deleteWorkflow).toHaveBeenCalledWith('wf-1');
      expect(mockApiClient.deleteWorkflow).toHaveBeenCalledWith('wf-2');
    });

    it('should handle activate/deactivate operations', async () => {
      const activateItems = [{ id: 'wf-1' }, { id: 'wf-2' }];
      const deactivateItems = [{ id: 'wf-3' }, { id: 'wf-4' }];

      mockApiClient.activateWorkflow.mockResolvedValue({ id: 'wf-1', active: true });
      mockApiClient.deactivateWorkflow.mockResolvedValue({ id: 'wf-3', active: false });

      const activateOp = await batchManager.createBatchOperation('activate', activateItems);
      const deactivateOp = await batchManager.createBatchOperation('deactivate', deactivateItems);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const activateStatus = batchManager.getOperationStatus(activateOp);
      expect(activateStatus?.status).toBe('completed');
      expect(activateStatus?.successfulItems).toBe(2);
      expect(mockApiClient.activateWorkflow).toHaveBeenCalledTimes(2);
      
      const deactivateStatus = batchManager.getOperationStatus(deactivateOp);
      expect(deactivateStatus?.status).toBe('completed');
      expect(deactivateStatus?.successfulItems).toBe(2);
      expect(mockApiClient.deactivateWorkflow).toHaveBeenCalledTimes(2);
    });
  });

  describe('Event Emissions', () => {
    it('should emit lifecycle events', async () => {
      const items: IBatchWorkflowCreate[] = [{ name: 'Workflow', nodes: [], connections: {} }];
      
      mockApiClient.createWorkflow.mockResolvedValue({ id: 'wf-123', name: 'Test', active: false });

      const events: string[] = [];
      
      batchManager.on('operation:started', ({ operationId }) => {
        events.push('started');
      });
      
      batchManager.on('operation:completed', ({ operationId, result }) => {
        events.push('completed');
        expect(result.summary.successful).toBe(1);
      });
      
      batchManager.on('operation:failed', ({ operationId, error }) => {
        events.push('failed');
      });

      const operationId = await batchManager.createBatchOperation('create', items);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      expect(events).toEqual(['started', 'completed']);
    });

    it('should emit transaction events for atomic operations', async () => {
      const items: IBatchWorkflowCreate[] = [
        { name: 'Workflow 1', nodes: [], connections: {} },
        { name: 'Workflow 2', nodes: [], connections: {} },
      ];

      let createCount = 0;
      mockApiClient.createWorkflow.mockImplementation(async () => {
        createCount++;
        if (createCount === 2) {
          throw new Error('Failed');
        }
        return { id: 'wf-1', name: 'Test', active: false };
      });

      mockApiClient.deleteWorkflow.mockResolvedValue({});

      let rolledBack = false;
      batchManager.on('transaction:rolled_back', ({ transactionId }) => {
        rolledBack = true;
      });

      const operationId = await batchManager.createBatchOperation('create', items, {
        atomic: true,
        maxRetries: 0,
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      expect(rolledBack).toBe(true);
    });
  });
});