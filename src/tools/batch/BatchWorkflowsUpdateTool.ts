import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
import { BatchOperationManager } from '../../services/BatchOperationManager.js';
import { IBatchWorkflowUpdate, IBatchOperationOptions } from '../../types/batch.types.js';

export class BatchWorkflowsUpdateTool extends BaseTool {
  name = 'batch_workflows_update';
  description = 'Update multiple workflows in a single batch operation with atomic transaction support';
  
  inputSchema = z.object({
    updates: z.array(z.object({
      id: z.string().describe('ID of the workflow to update'),
      name: z.string().optional().describe('New name for the workflow'),
      nodes: z.array(z.any()).optional().describe('Updated node definitions'),
      connections: z.record(z.any()).optional().describe('Updated connection definitions'),
      settings: z.record(z.any()).optional().describe('Updated workflow settings'),
      staticData: z.record(z.any()).optional().describe('Updated static data'),
      tags: z.array(z.string()).optional().describe('Updated tags'),
      active: z.boolean().optional().describe('Update activation status'),
    })).min(1).max(100).describe('Array of workflow updates (max 100)'),
    
    options: z.object({
      stopOnError: z.boolean().default(false).describe('Stop processing on first error'),
      atomic: z.boolean().default(false).describe('Use atomic transaction (all succeed or all fail)'),
      concurrency: z.number().min(1).max(10).default(5).describe('Number of concurrent operations'),
      validateUpdates: z.boolean().default(true).describe('Validate updates before applying'),
      createBackup: z.boolean().default(false).describe('Create backup before updating (for rollback)'),
    }).optional().describe('Batch operation options'),
  });

  async execute(params: unknown, context: IToolContext): Promise<IToolResponse> {
    const input = this.validateInput<z.infer<typeof this.inputSchema>>(params);
    
    if (!context.apiClient) {
      throw new Error('n8n API client not configured');
    }

    // Initialize batch operation manager
    const batchManager = new BatchOperationManager(context.apiClient);
    
    // Prepare update data
    const workflowUpdates: IBatchWorkflowUpdate[] = input.updates.map(update => ({
      id: update.id,
      name: update.name,
      nodes: update.nodes,
      connections: update.connections,
      settings: update.settings,
      staticData: update.staticData,
      tags: update.tags,
      active: update.active,
    }));

    // Prepare options
    const batchOptions: IBatchOperationOptions = {
      stopOnError: input.options?.stopOnError ?? false,
      atomic: input.options?.atomic ?? false,
      concurrency: input.options?.concurrency ?? 5,
      maxRetries: 2,
      retryDelay: 1000,
    };

    // Store backups if requested and atomic
    const backups = new Map<string, any>();
    if (input.options?.createBackup && input.options?.atomic) {
      try {
        // Fetch current state of all workflows to update
        const backupPromises = workflowUpdates.map(async (update) => {
          try {
            const current = await context.apiClient!.getWorkflow(update.id);
            backups.set(update.id, current);
          } catch (error) {
            throw new Error(`Failed to backup workflow ${update.id}: ${error}`);
          }
        });
        
        await Promise.all(backupPromises);
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to create backups',
              details: error instanceof Error ? error.message : 'Unknown error',
            }, null, 2),
            mimeType: 'application/json',
          }],
        };
      }
    }

    // Add validation if requested
    if (input.options?.validateUpdates) {
      batchOptions.validateItem = async (item: IBatchWorkflowUpdate) => {
        // Validate ID exists
        if (!item.id || item.id.trim().length === 0) {
          throw new Error('Workflow ID is required');
        }
        
        // Validate at least one field to update
        const hasUpdate = item.name !== undefined ||
                         item.nodes !== undefined ||
                         item.connections !== undefined ||
                         item.settings !== undefined ||
                         item.staticData !== undefined ||
                         item.tags !== undefined ||
                         item.active !== undefined;
        
        if (!hasUpdate) {
          throw new Error('At least one field must be specified for update');
        }
        
        // Validate node structure if provided
        if (item.nodes) {
          for (const node of item.nodes) {
            if (!node.name || !node.type || !node.typeVersion || !node.position) {
              throw new Error(`Invalid node structure: ${JSON.stringify(node)}`);
            }
          }
        }
        
        return true;
      };
    }

    // Track progress
    const progressUpdates: any[] = [];
    batchOptions.onProgress = (progress) => {
      progressUpdates.push({
        timestamp: new Date().toISOString(),
        ...progress,
      });
    };

    try {
      // Start batch operation
      const operationId = await batchManager.createBatchOperation(
        'update',
        workflowUpdates,
        batchOptions
      );

      // Wait for completion with timeout
      const timeout = 300000; // 5 minutes
      const startTime = Date.now();
      
      let finalStatus;
      while (Date.now() - startTime < timeout) {
        const status = batchManager.getOperationStatus(operationId);
        
        if (!status) {
          throw new Error('Operation status not found');
        }

        if (status.status === 'completed' || 
            status.status === 'failed' || 
            status.status === 'partially_completed' ||
            status.status === 'rolled_back') {
          finalStatus = status;
          break;
        }

        // Wait before checking again
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (!finalStatus) {
        throw new Error('Operation timed out');
      }

      // Prepare response
      const response: any = {
        operationId,
        status: finalStatus.status,
        summary: {
          total: finalStatus.totalItems,
          successful: finalStatus.successfulItems,
          failed: finalStatus.failedItems,
          duration: finalStatus.endTime 
            ? finalStatus.endTime.getTime() - finalStatus.startTime.getTime()
            : Date.now() - finalStatus.startTime.getTime(),
        },
        results: {
          updated: [],
          failed: [],
        },
        progressHistory: progressUpdates,
      };

      // Collect results
      for (const item of finalStatus.items) {
        if (item.status === 'success' && item.result) {
          const updateSummary: any = {
            workflowId: item.result.id,
            name: item.result.name,
            active: item.result.active,
            updatedAt: item.result.updatedAt,
            fieldsUpdated: [],
          };
          
          // Track which fields were updated
          const update = item.data as IBatchWorkflowUpdate;
          if (update.name !== undefined) updateSummary.fieldsUpdated.push('name');
          if (update.nodes !== undefined) updateSummary.fieldsUpdated.push('nodes');
          if (update.connections !== undefined) updateSummary.fieldsUpdated.push('connections');
          if (update.settings !== undefined) updateSummary.fieldsUpdated.push('settings');
          if (update.staticData !== undefined) updateSummary.fieldsUpdated.push('staticData');
          if (update.tags !== undefined) updateSummary.fieldsUpdated.push('tags');
          if (update.active !== undefined) updateSummary.fieldsUpdated.push('active');
          
          response.results.updated.push(updateSummary);
        } else if (item.status === 'failed') {
          response.results.failed.push({
            workflowId: (item.data as IBatchWorkflowUpdate).id,
            error: item.error || 'Unknown error',
            retryCount: item.retryCount || 0,
          });
        }
      }

      // Handle rollback if atomic operation failed
      if (input.options?.atomic && finalStatus.status === 'rolled_back' && backups.size > 0) {
        response.rollback = {
          reason: 'Atomic operation failed, attempting to restore from backups',
          restoredCount: 0,
          restoreErrors: [],
        };

        // Attempt to restore from backups
        for (const [workflowId, backup] of backups.entries()) {
          try {
            await context.apiClient.updateWorkflow(workflowId, backup);
            response.rollback.restoredCount++;
          } catch (error) {
            response.rollback.restoreErrors.push({
              workflowId,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }
      }

      // Add warnings if any
      const warnings: string[] = [];
      if (finalStatus.status === 'partially_completed') {
        warnings.push(`${finalStatus.failedItems} workflows failed to update`);
      }
      if (response.results.failed.some((f: any) => f.retryCount > 0)) {
        warnings.push('Some operations required retries');
      }
      if (response.rollback?.restoreErrors?.length > 0) {
        warnings.push('Some workflows could not be restored from backup');
      }
      if (warnings.length > 0) {
        response.warnings = warnings;
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2),
          mimeType: 'application/json',
        }],
      };

    } catch (error) {
      this.logger.error('Batch workflow update failed', { error });
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: error instanceof Error ? error.message : 'Batch operation failed',
            status: 'failed',
            details: error instanceof Error ? error.stack : undefined,
          }, null, 2),
          mimeType: 'application/json',
        }],
      };
    }
  }

  getMetadata(): IToolMetadata {
    return {
      category: 'workflow',
      isMutating: true,
      requirements: ['n8n API access'],
      tags: ['batch', 'update', 'workflows', 'atomic', 'transaction'],
    };
  }
}