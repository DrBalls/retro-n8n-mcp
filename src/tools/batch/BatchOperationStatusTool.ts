import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
import { BatchOperationManager } from '../../services/BatchOperationManager.js';

export class BatchOperationStatusTool extends BaseTool {
  name = 'batch_operation_status';
  description = 'Get the status and progress of a batch operation or list all active operations';
  
  inputSchema = z.object({
    operationId: z.string().optional().describe('Operation ID to check status for'),
    listActive: z.boolean().default(false).describe('List all active operations'),
    includeDetails: z.boolean().default(true).describe('Include detailed item results'),
  });

  async execute(params: unknown, context: IToolContext): Promise<IToolResponse> {
    const input = this.validateInput<z.infer<typeof this.inputSchema>>(params);
    
    if (!context.apiClient) {
      throw new Error('n8n API client not configured');
    }

    // Initialize batch operation manager
    const batchManager = new BatchOperationManager(context.apiClient);

    try {
      // List active operations if requested
      if (input.listActive || !input.operationId) {
        const activeOperations = batchManager.getActiveOperations();
        
        const summary = {
          activeCount: activeOperations.length,
          operations: activeOperations.map(op => ({
            operationId: op.id,
            type: op.type,
            status: op.status,
            progress: {
              total: op.totalItems,
              processed: op.processedItems,
              successful: op.successfulItems,
              failed: op.failedItems,
              percentage: op.totalItems > 0 
                ? Math.round((op.processedItems / op.totalItems) * 100)
                : 0,
            },
            startTime: op.startTime,
            duration: Date.now() - op.startTime.getTime(),
          })),
        };

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(summary, null, 2),
            mimeType: 'application/json',
          }],
        };
      }

      // Get specific operation status
      const operation = batchManager.getOperationStatus(input.operationId);
      
      if (!operation) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Operation not found',
              operationId: input.operationId,
              suggestion: 'Use listActive: true to see all active operations',
            }, null, 2),
            mimeType: 'application/json',
          }],
        };
      }

      // Prepare response
      const response: any = {
        operationId: operation.id,
        type: operation.type,
        status: operation.status,
        metadata: operation.metadata,
        timeline: {
          startTime: operation.startTime,
          endTime: operation.endTime,
          duration: operation.endTime 
            ? operation.endTime.getTime() - operation.startTime.getTime()
            : Date.now() - operation.startTime.getTime(),
          estimatedTimeRemaining: null,
        },
        progress: {
          total: operation.totalItems,
          processed: operation.processedItems,
          successful: operation.successfulItems,
          failed: operation.failedItems,
          percentage: operation.totalItems > 0 
            ? Math.round((operation.processedItems / operation.totalItems) * 100)
            : 0,
        },
        performance: {
          averageTimePerItem: operation.processedItems > 0
            ? Math.round((Date.now() - operation.startTime.getTime()) / operation.processedItems)
            : 0,
          itemsPerSecond: operation.processedItems > 0
            ? (operation.processedItems / ((Date.now() - operation.startTime.getTime()) / 1000)).toFixed(2)
            : 0,
        },
      };

      // Calculate estimated time remaining for active operations
      if (operation.status === 'in_progress' && operation.processedItems > 0) {
        const avgTimePerItem = (Date.now() - operation.startTime.getTime()) / operation.processedItems;
        const remainingItems = operation.totalItems - operation.processedItems;
        response.timeline.estimatedTimeRemaining = Math.round(avgTimePerItem * remainingItems);
      }

      // Add error information if failed
      if (operation.error) {
        response.error = operation.error;
      }

      // Include detailed results if requested
      if (input.includeDetails) {
        response.items = {
          summary: {
            pending: operation.items.filter(i => i.status === 'pending').length,
            processing: operation.items.filter(i => i.status === 'processing').length,
            success: operation.items.filter(i => i.status === 'success').length,
            failed: operation.items.filter(i => i.status === 'failed').length,
            rolledBack: operation.items.filter(i => i.status === 'rolled_back').length,
          },
          details: {
            successful: operation.items
              .filter(i => i.status === 'success')
              .map(i => ({
                itemId: i.id,
                processedAt: i.processedAt,
                result: i.result ? {
                  id: i.result.id,
                  name: i.result.name,
                  active: i.result.active,
                } : undefined,
              })),
            failed: operation.items
              .filter(i => i.status === 'failed')
              .map(i => ({
                itemId: i.id,
                error: i.error,
                retryCount: i.retryCount,
                processedAt: i.processedAt,
              })),
            pending: operation.items
              .filter(i => i.status === 'pending')
              .map(i => ({
                itemId: i.id,
              })),
          },
        };

        // Limit details for large operations
        if (operation.totalItems > 100) {
          response.items.details.successful = response.items.details.successful.slice(0, 10);
          response.items.details.failed = response.items.details.failed.slice(0, 10);
          response.items.details.pending = response.items.details.pending.slice(0, 10);
          response.items.details.truncated = true;
          response.items.details.message = 'Results truncated for large operation. Showing first 10 of each category.';
        }
      }

      // Add recommendations based on status
      const recommendations: string[] = [];
      
      if (operation.status === 'in_progress' && operation.failedItems > 0) {
        recommendations.push('Some items have failed. Consider using stopOnError: true for future operations.');
      }
      
      if (operation.status === 'partially_completed') {
        recommendations.push('Operation completed with failures. Review failed items and consider retry.');
      }
      
      if (operation.status === 'failed' && operation.processedItems === 0) {
        recommendations.push('Operation failed immediately. Check API connection and permissions.');
      }
      
      if (operation.status === 'rolled_back') {
        recommendations.push('Atomic operation was rolled back. All successful changes were reverted.');
      }

      if (recommendations.length > 0) {
        response.recommendations = recommendations;
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2),
          mimeType: 'application/json',
        }],
      };

    } catch (error) {
      this.logger.error('Failed to get batch operation status', { error });
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: error instanceof Error ? error.message : 'Failed to get operation status',
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
      isMutating: false,
      requirements: ['n8n API access'],
      tags: ['batch', 'status', 'progress', 'monitoring'],
    };
  }
}