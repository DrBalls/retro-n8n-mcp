import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
import { BatchOperationManager } from '../../services/BatchOperationManager.js';
import { IBatchWorkflowActivate, IBatchOperationOptions } from '../../types/batch.types.js';

export class BatchWorkflowsActivateTool extends BaseTool {
  name = 'batch_workflows_activate';
  description = 'Activate multiple workflows in a single batch operation';
  
  inputSchema = z.object({
    workflowIds: z.array(z.string())
      .min(1)
      .max(100)
      .describe('Array of workflow IDs to activate (max 100)'),
    
    options: z.object({
      stopOnError: z.boolean().default(false).describe('Stop processing on first error'),
      skipValidation: z.boolean().default(false).describe('Skip workflow validation before activation'),
      concurrency: z.number().min(1).max(10).default(5).describe('Number of concurrent operations'),
      testRun: z.boolean().default(false).describe('Test each workflow after activation'),
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
    
    // Prepare activation operations
    const workflowsToActivate: IBatchWorkflowActivate[] = input.workflowIds.map(id => ({ id }));

    // Pre-check workflows
    const preCheckResults: any = {
      total: workflowsToActivate.length,
      found: 0,
      notFound: [],
      alreadyActive: [],
      readyToActivate: [],
      missingCredentials: [],
    };

    if (!input.options?.skipValidation) {
      const checkPromises = workflowsToActivate.map(async (workflow) => {
        try {
          const workflowData = await context.apiClient!.getWorkflow(workflow.id);
          preCheckResults.found++;
          
          if (workflowData.active) {
            preCheckResults.alreadyActive.push({
              id: workflow.id,
              name: workflowData.name,
            });
          } else {
            // Check for required credentials
            const hasCredentialIssues = workflowData.nodes?.some((node: any) => {
              return node.credentials && Object.keys(node.credentials).length > 0 && 
                     node.issues?.credentials;
            });
            
            if (hasCredentialIssues) {
              preCheckResults.missingCredentials.push({
                id: workflow.id,
                name: workflowData.name,
              });
            } else {
              preCheckResults.readyToActivate.push({
                id: workflow.id,
                name: workflowData.name,
                nodeCount: workflowData.nodes?.length || 0,
              });
            }
          }
        } catch (error) {
          preCheckResults.notFound.push(workflow.id);
        }
      });

      await Promise.all(checkPromises);

      // Return early if there are issues
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

      if (preCheckResults.missingCredentials.length > 0 && !input.options?.skipValidation) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Some workflows have credential issues',
              workflowsWithIssues: preCheckResults.missingCredentials,
              suggestion: 'Fix credential issues or use skipValidation: true',
            }, null, 2),
            mimeType: 'application/json',
          }],
        };
      }
    }

    // Filter out already active workflows
    const workflowsToProcess = workflowsToActivate.filter(w => 
      !preCheckResults.alreadyActive.find((active: any) => active.id === w.id)
    );

    if (workflowsToProcess.length === 0) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            message: 'All workflows are already active',
            alreadyActive: preCheckResults.alreadyActive,
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
        'activate',
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
          alreadyActive: preCheckResults.alreadyActive.length,
          successful: finalStatus.successfulItems,
          failed: finalStatus.failedItems,
          duration: finalStatus.endTime 
            ? finalStatus.endTime.getTime() - finalStatus.startTime.getTime()
            : Date.now() - finalStatus.startTime.getTime(),
        },
        results: {
          activated: [],
          failed: [],
          alreadyActive: preCheckResults.alreadyActive,
        },
        progressHistory: progressUpdates,
      };

      // Collect results
      for (const item of finalStatus.items) {
        const workflowId = (item.data as IBatchWorkflowActivate).id;
        
        if (item.status === 'success') {
          const workflowInfo = preCheckResults.readyToActivate.find((w: any) => w.id === workflowId);
          response.results.activated.push({
            workflowId,
            name: workflowInfo?.name || 'Unknown',
            nodeCount: workflowInfo?.nodeCount || 0,
            activatedAt: item.processedAt || new Date().toISOString(),
          });
        } else if (item.status === 'failed') {
          response.results.failed.push({
            workflowId,
            error: item.error || 'Unknown error',
            retryCount: item.retryCount || 0,
          });
        }
      }

      // Test workflows if requested
      if (input.options?.testRun && response.results.activated.length > 0) {
        response.testResults = {
          tested: 0,
          successful: 0,
          failed: 0,
          results: [],
        };

        for (const activated of response.results.activated) {
          try {
            const execution = await context.apiClient.request(
              'POST',
              `/workflows/${activated.workflowId}/execute`,
              { data: { mode: 'manual' } }
            );
            
            response.testResults.tested++;
            response.testResults.successful++;
            response.testResults.results.push({
              workflowId: activated.workflowId,
              executionId: execution.id,
              status: 'success',
            });
          } catch (error) {
            response.testResults.tested++;
            response.testResults.failed++;
            response.testResults.results.push({
              workflowId: activated.workflowId,
              status: 'failed',
              error: error instanceof Error ? error.message : 'Test execution failed',
            });
          }
        }
      }

      // Add warnings if any
      const warnings: string[] = [];
      if (finalStatus.status === 'partially_completed') {
        warnings.push(`${finalStatus.failedItems} workflows failed to activate`);
      }
      if (preCheckResults.missingCredentials.length > 0 && input.options?.skipValidation) {
        warnings.push('Some workflows with credential issues were activated');
      }
      if (response.testResults?.failed > 0) {
        warnings.push(`${response.testResults.failed} workflows failed test execution`);
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
      this.logger.error('Batch workflow activation failed', { error });
      
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
      tags: ['batch', 'activate', 'workflows', 'bulk'],
    };
  }
}