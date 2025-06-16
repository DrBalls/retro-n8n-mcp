import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
import { BatchOperationManager } from '../../services/BatchOperationManager.js';
import { IBatchWorkflowDeactivate, IBatchOperationOptions } from '../../types/batch.types.js';

export class BatchWorkflowsDeactivateTool extends BaseTool {
  name = 'batch_workflows_deactivate';
  description = 'Deactivate multiple workflows in a single batch operation';
  
  inputSchema = z.object({
    workflowIds: z.array(z.string())
      .min(1)
      .max(100)
      .describe('Array of workflow IDs to deactivate (max 100)'),
    
    options: z.object({
      stopOnError: z.boolean().default(false).describe('Stop processing on first error'),
      concurrency: z.number().min(1).max(10).default(5).describe('Number of concurrent operations'),
      stopRunningExecutions: z.boolean().default(false).describe('Stop any running executions before deactivating'),
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
    
    // Prepare deactivation operations
    const workflowsToDeactivate: IBatchWorkflowDeactivate[] = input.workflowIds.map(id => ({ id }));

    // Pre-check workflows
    const preCheckResults: any = {
      total: workflowsToDeactivate.length,
      found: 0,
      notFound: [],
      alreadyInactive: [],
      readyToDeactivate: [],
      runningExecutions: [],
    };

    const checkPromises = workflowsToDeactivate.map(async (workflow) => {
      try {
        const workflowData = await context.apiClient!.getWorkflow(workflow.id);
        preCheckResults.found++;
        
        if (!workflowData.active) {
          preCheckResults.alreadyInactive.push({
            id: workflow.id,
            name: workflowData.name,
          });
        } else {
          // Check for running executions
          try {
            const executions = await context.apiClient!.request(
              'GET',
              '/executions',
              {
                params: {
                  workflowId: workflow.id,
                  status: 'running',
                  limit: 1,
                },
              }
            );
            
            if (executions.data && executions.data.length > 0) {
              preCheckResults.runningExecutions.push({
                id: workflow.id,
                name: workflowData.name,
                executionCount: executions.count || executions.data.length,
              });
            }
          } catch {
            // Ignore execution check errors
          }
          
          preCheckResults.readyToDeactivate.push({
            id: workflow.id,
            name: workflowData.name,
            nodeCount: workflowData.nodes?.length || 0,
          });
        }
      } catch (error) {
        preCheckResults.notFound.push(workflow.id);
      }
    });

    await Promise.all(checkPromises);

    // Return early if workflows not found
    if (preCheckResults.notFound.length > 0) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: 'Some workflows not found',
            preCheckResults,
          }, null, 2),
          mimeType: 'application/json',
        }],
      };
    }

    // Handle running executions
    if (preCheckResults.runningExecutions.length > 0) {
      if (input.options?.stopRunningExecutions) {
        // Stop running executions
        const stopResults = {
          stopped: 0,
          failed: 0,
          errors: [],
        };

        for (const workflow of preCheckResults.runningExecutions) {
          try {
            const executions = await context.apiClient.request(
              'GET',
              '/executions',
              {
                params: {
                  workflowId: workflow.id,
                  status: 'running',
                },
              }
            );

            for (const execution of executions.data) {
              try {
                await context.apiClient.request(
                  'POST',
                  `/executions/${execution.id}/stop`
                );
                stopResults.stopped++;
              } catch (error) {
                stopResults.failed++;
                stopResults.errors.push({
                  workflowId: workflow.id,
                  executionId: execution.id,
                  error: error instanceof Error ? error.message : 'Failed to stop',
                });
              }
            }
          } catch (error) {
            stopResults.failed++;
            stopResults.errors.push({
              workflowId: workflow.id,
              error: error instanceof Error ? error.message : 'Failed to fetch executions',
            });
          }
        }

        preCheckResults.executionStopResults = stopResults;
      } else {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Some workflows have running executions',
              workflowsWithRunningExecutions: preCheckResults.runningExecutions,
              suggestion: 'Use stopRunningExecutions: true to stop them automatically',
            }, null, 2),
            mimeType: 'application/json',
          }],
        };
      }
    }

    // Filter out already inactive workflows
    const workflowsToProcess = workflowsToDeactivate.filter(w => 
      !preCheckResults.alreadyInactive.find((inactive: any) => inactive.id === w.id)
    );

    if (workflowsToProcess.length === 0) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            message: 'All workflows are already inactive',
            alreadyInactive: preCheckResults.alreadyInactive,
          }, null, 2),
          mimeType: 'application/json',
        }],
      };
    }

    // Prepare batch options
    const batchOptions: IBatchOperationOptions = {
      stopOnError: input.options?.stopOnError ?? false,
      atomic: false,
      concurrency: input.options?.concurrency ?? 5,
      maxRetries: 2,
      retryDelay: 1000,
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
        'deactivate',
        workflowsToProcess,
        batchOptions
      );

      // Wait for completion
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
          total: input.workflowIds.length,
          processed: workflowsToProcess.length,
          alreadyInactive: preCheckResults.alreadyInactive.length,
          successful: finalStatus.successfulItems,
          failed: finalStatus.failedItems,
          duration: finalStatus.endTime 
            ? finalStatus.endTime.getTime() - finalStatus.startTime.getTime()
            : Date.now() - finalStatus.startTime.getTime(),
        },
        results: {
          deactivated: [],
          failed: [],
          alreadyInactive: preCheckResults.alreadyInactive,
        },
        progressHistory: progressUpdates,
      };

      // Add execution stop results if applicable
      if (preCheckResults.executionStopResults) {
        response.executionStopResults = preCheckResults.executionStopResults;
      }

      // Collect results
      for (const item of finalStatus.items) {
        const workflowId = (item.data as IBatchWorkflowDeactivate).id;
        
        if (item.status === 'success') {
          const workflowInfo = preCheckResults.readyToDeactivate.find((w: any) => w.id === workflowId);
          response.results.deactivated.push({
            workflowId,
            name: workflowInfo?.name || 'Unknown',
            nodeCount: workflowInfo?.nodeCount || 0,
            deactivatedAt: item.processedAt || new Date().toISOString(),
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
        warnings.push(`${finalStatus.failedItems} workflows failed to deactivate`);
      }
      if (preCheckResults.executionStopResults?.failed > 0) {
        warnings.push(`${preCheckResults.executionStopResults.failed} executions failed to stop`);
      }
      if (response.results.failed.some((f: any) => f.retryCount > 0)) {
        warnings.push('Some operations required retries');
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
      this.logger.error('Batch workflow deactivation failed', { error });
      
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
      tags: ['batch', 'deactivate', 'workflows', 'bulk'],
    };
  }
}