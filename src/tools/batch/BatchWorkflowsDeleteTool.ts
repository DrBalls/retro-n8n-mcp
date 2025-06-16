import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
import { BatchOperationManager } from '../../services/BatchOperationManager.js';
import { IBatchWorkflowDelete, IBatchOperationOptions } from '../../types/batch.types.js';

export class BatchWorkflowsDeleteTool extends BaseTool {
  name = 'batch_workflows_delete';
  description = 'Delete multiple workflows in a single batch operation with safety checks';
  
  inputSchema = z.object({
    workflowIds: z.array(z.string())
      .min(1)
      .max(100)
      .describe('Array of workflow IDs to delete (max 100)'),
    
    options: z.object({
      stopOnError: z.boolean().default(false).describe('Stop processing on first error'),
      force: z.boolean().default(false).describe('Force delete without confirmation'),
      skipActiveCheck: z.boolean().default(false).describe('Skip check for active workflows'),
      concurrency: z.number().min(1).max(10).default(5).describe('Number of concurrent operations'),
      dryRun: z.boolean().default(false).describe('Simulate deletion without actually deleting'),
    }).optional().describe('Batch operation options'),
  });

  async execute(params: unknown, context: IToolContext): Promise<IToolResponse> {
    const input = this.validateInput<z.infer<typeof this.inputSchema>>(params);
    
    if (!context.apiClient) {
      throw new Error('n8n API client not configured');
    }

    // Check for duplicates
    const uniqueIds = new Set(input.workflowIds);
    if (uniqueIds.size !== input.workflowIds.length) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: 'Duplicate workflow IDs detected',
            duplicates: input.workflowIds.filter((id, index) => 
              input.workflowIds.indexOf(id) !== index
            ),
          }, null, 2),
          mimeType: 'application/json',
        }],
      };
    }

    // Initialize batch operation manager
    const batchManager = new BatchOperationManager(context.apiClient);
    
    // Prepare delete operations
    const workflowsToDelete: IBatchWorkflowDelete[] = input.workflowIds.map(id => ({
      id,
      force: input.options?.force ?? false,
    }));

    // If not forcing and not skipping active check, verify workflows
    const preCheckResults: any = {
      total: workflowsToDelete.length,
      found: 0,
      notFound: [],
      active: [],
      inactive: [],
    };

    if (!input.options?.force || !input.options?.skipActiveCheck) {
      // Pre-check workflows
      const checkPromises = workflowsToDelete.map(async (workflow) => {
        try {
          const workflowData = await context.apiClient!.getWorkflow(workflow.id);
          preCheckResults.found++;
          
          if (workflowData.active) {
            preCheckResults.active.push({
              id: workflow.id,
              name: workflowData.name,
            });
          } else {
            preCheckResults.inactive.push({
              id: workflow.id,
              name: workflowData.name,
            });
          }
        } catch (error) {
          preCheckResults.notFound.push(workflow.id);
        }
      });

      await Promise.all(checkPromises);

      // Check if we should proceed
      if (preCheckResults.notFound.length > 0 && !input.options?.force) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Some workflows not found',
              preCheckResults,
              suggestion: 'Use force: true to skip this check',
            }, null, 2),
            mimeType: 'application/json',
          }],
        };
      }

      if (preCheckResults.active.length > 0 && !input.options?.skipActiveCheck) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Cannot delete active workflows',
              activeWorkflows: preCheckResults.active,
              suggestion: 'Deactivate workflows first or use skipActiveCheck: true',
            }, null, 2),
            mimeType: 'application/json',
          }],
        };
      }
    }

    // If dry run, return what would be deleted
    if (input.options?.dryRun) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            dryRun: true,
            wouldDelete: {
              total: preCheckResults.found,
              workflows: [...preCheckResults.active, ...preCheckResults.inactive],
            },
            wouldSkip: {
              total: preCheckResults.notFound.length,
              workflowIds: preCheckResults.notFound,
            },
          }, null, 2),
          mimeType: 'application/json',
        }],
      };
    }

    // Prepare batch options
    const batchOptions: IBatchOperationOptions = {
      stopOnError: input.options?.stopOnError ?? false,
      atomic: false, // Deletes cannot be easily rolled back
      concurrency: input.options?.concurrency ?? 5,
      maxRetries: 1, // Fewer retries for deletes
      retryDelay: 1000,
    };

    // Add validation
    batchOptions.validateItem = async (item: IBatchWorkflowDelete) => {
      if (!item.id || item.id.trim().length === 0) {
        throw new Error('Workflow ID is required');
      }
      return true;
    };

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
        'delete',
        workflowsToDelete,
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
            status.status === 'partially_completed') {
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
          deleted: [],
          failed: [],
        },
        preCheckResults,
        progressHistory: progressUpdates,
      };

      // Collect results
      for (const item of finalStatus.items) {
        const workflowId = (item.data as IBatchWorkflowDelete).id;
        
        if (item.status === 'success') {
          // Find workflow info from pre-check
          const workflowInfo = [...preCheckResults.active, ...preCheckResults.inactive]
            .find(w => w.id === workflowId);
          
          response.results.deleted.push({
            workflowId,
            name: workflowInfo?.name || 'Unknown',
            deletedAt: item.processedAt || new Date().toISOString(),
          });
        } else if (item.status === 'failed') {
          response.results.failed.push({
            workflowId,
            error: item.error || 'Unknown error',
            retryCount: item.retryCount || 0,
          });
        }
      }

      // Add warnings if any
      const warnings: string[] = [];
      if (finalStatus.status === 'partially_completed') {
        warnings.push(`${finalStatus.failedItems} workflows failed to delete`);
      }
      if (preCheckResults.active.length > 0 && input.options?.skipActiveCheck) {
        warnings.push(`${preCheckResults.active.length} active workflows were deleted`);
      }
      if (response.results.failed.some((f: any) => f.retryCount > 0)) {
        warnings.push('Some operations required retries');
      }
      if (warnings.length > 0) {
        response.warnings = warnings;
      }

      // Add safety reminder
      response.notice = 'Deleted workflows cannot be recovered. Ensure you have backups if needed.';

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2),
          mimeType: 'application/json',
        }],
      };

    } catch (error) {
      this.logger.error('Batch workflow deletion failed', { error });
      
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
      tags: ['batch', 'delete', 'workflows', 'bulk'],
    };
  }
}