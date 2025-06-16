import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { N8nApiClient } from './N8nApiClient.js';
import { Logger } from '../utils/Logger.js';
import {
  IBatchOperation,
  IBatchItem,
  IBatchOperationOptions,
  IBatchProgress,
  IBatchResult,
  IBatchTransaction,
  BatchOperationType,
  BatchOperationStatus,
  IRollbackState,
} from '../types/batch.types.js';

export class BatchOperationManager extends EventEmitter {
  private operations = new Map<string, IBatchOperation>();
  private transactions = new Map<string, IBatchTransaction>();
  private apiClient: N8nApiClient;
  private logger = new Logger('BatchOperationManager');
  private activeOperations = new Set<string>();

  constructor(apiClient: N8nApiClient) {
    super();
    this.apiClient = apiClient;
  }

  /**
   * Create a new batch operation
   */
  async createBatchOperation<T>(
    type: BatchOperationType,
    items: T[],
    options: IBatchOperationOptions = {}
  ): Promise<string> {
    const operationId = uuidv4();
    const batchItems: IBatchItem<T>[] = items.map((item, index) => ({
      id: `${operationId}-item-${index}`,
      data: item,
      status: 'pending' as const,
    }));

    const operation: IBatchOperation<T> = {
      id: operationId,
      type,
      status: 'pending',
      totalItems: items.length,
      processedItems: 0,
      successfulItems: 0,
      failedItems: 0,
      items: batchItems,
      startTime: new Date(),
    };

    this.operations.set(operationId, operation);
    this.logger.info('Batch operation created', {
      operationId,
      type,
      itemCount: items.length,
      options,
    });

    // Start processing asynchronously
    this.processBatchOperation(operationId, options).catch(error => {
      this.logger.error('Batch operation failed', { error, operationId });
    });

    return operationId;
  }

  /**
   * Get batch operation status
   */
  getOperationStatus(operationId: string): IBatchOperation | null {
    return this.operations.get(operationId) || null;
  }

  /**
   * Cancel a batch operation
   */
  async cancelOperation(operationId: string): Promise<boolean> {
    const operation = this.operations.get(operationId);
    if (!operation) {
      return false;
    }

    if (operation.status === 'completed' || operation.status === 'failed') {
      return false;
    }

    operation.status = 'failed';
    operation.error = 'Operation cancelled by user';
    operation.endTime = new Date();
    
    this.activeOperations.delete(operationId);
    this.emit('operation:cancelled', { operationId });
    
    return true;
  }

  /**
   * Process batch operation
   */
  private async processBatchOperation<T>(
    operationId: string,
    options: IBatchOperationOptions
  ): Promise<void> {
    const operation = this.operations.get(operationId);
    if (!operation) {
      throw new Error(`Operation ${operationId} not found`);
    }

    this.activeOperations.add(operationId);
    operation.status = 'in_progress';
    this.emit('operation:started', { operationId });

    const {
      stopOnError = false,
      atomic = false,
      concurrency = 5,
      maxRetries = 3,
      retryDelay = 1000,
      onProgress,
      validateItem,
    } = options;

    let transaction: IBatchTransaction | undefined;
    if (atomic) {
      transaction = this.createTransaction([operation]);
    }

    try {
      // Process items with concurrency control
      const results = await this.processItemsWithConcurrency(
        operation,
        concurrency,
        maxRetries,
        retryDelay,
        stopOnError,
        validateItem,
        onProgress
      );

      // Update final status
      operation.processedItems = operation.items.length;
      operation.endTime = new Date();

      if (operation.failedItems === 0) {
        operation.status = 'completed';
        if (transaction) {
          transaction.status = 'committed';
          transaction.completedAt = new Date();
        }
      } else if (operation.successfulItems === 0) {
        operation.status = 'failed';
        if (atomic && transaction) {
          await this.rollbackTransaction(transaction.id);
        }
      } else {
        operation.status = 'partially_completed';
        if (atomic && transaction) {
          await this.rollbackTransaction(transaction.id);
        }
      }

      // Emit final result
      const result = this.createBatchResult(operation);
      this.emit('operation:completed', { operationId, result });

    } catch (error) {
      operation.status = 'failed';
      operation.error = error instanceof Error ? error.message : 'Unknown error';
      operation.endTime = new Date();

      if (atomic && transaction) {
        await this.rollbackTransaction(transaction.id);
      }

      this.emit('operation:failed', { operationId, error });
      throw error;

    } finally {
      this.activeOperations.delete(operationId);
    }
  }

  /**
   * Process items with concurrency control
   */
  private async processItemsWithConcurrency<T>(
    operation: IBatchOperation<T>,
    concurrency: number,
    maxRetries: number,
    retryDelay: number,
    stopOnError: boolean,
    validateItem?: (item: any) => boolean | Promise<boolean>,
    onProgress?: (progress: IBatchProgress) => void
  ): Promise<void> {
    const queue = [...operation.items];
    const processing = new Set<Promise<void>>();

    while (queue.length > 0 || processing.size > 0) {
      // Check if operation was cancelled
      if (!this.activeOperations.has(operation.id)) {
        throw new Error('Operation cancelled');
      }

      // Start new items up to concurrency limit
      while (processing.size < concurrency && queue.length > 0) {
        const item = queue.shift()!;
        const processPromise = this.processItem(
          operation,
          item,
          maxRetries,
          retryDelay,
          validateItem
        ).then(() => {
          processing.delete(processPromise);
          this.updateProgress(operation, onProgress);
        }).catch(error => {
          processing.delete(processPromise);
          if (stopOnError) {
            throw error;
          }
        });

        processing.add(processPromise);
      }

      // Wait for at least one item to complete
      if (processing.size > 0) {
        await Promise.race(processing);
      }
    }

    // Wait for all remaining items
    await Promise.all(processing);
  }

  /**
   * Process a single item
   */
  private async processItem<T>(
    operation: IBatchOperation<T>,
    item: IBatchItem<T>,
    maxRetries: number,
    retryDelay: number,
    validateItem?: (item: any) => boolean | Promise<boolean>
  ): Promise<void> {
    item.status = 'processing';
    item.retryCount = 0;

    try {
      // Validate item if validator provided
      if (validateItem) {
        const isValid = await validateItem(item.data);
        if (!isValid) {
          throw new Error('Item validation failed');
        }
      }

      // Process based on operation type
      const result = await this.executeOperation(operation.type, item.data);
      
      item.status = 'success';
      item.result = result;
      item.processedAt = new Date();
      operation.successfulItems++;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Retry logic
      if (item.retryCount! < maxRetries) {
        item.retryCount!++;
        await new Promise(resolve => setTimeout(resolve, retryDelay * item.retryCount!));
        return this.processItem(operation, item, maxRetries, retryDelay, validateItem);
      }

      // Mark as failed after all retries
      item.status = 'failed';
      item.error = errorMessage;
      item.processedAt = new Date();
      operation.failedItems++;
      
      this.logger.error('Item processing failed', {
        operationId: operation.id,
        itemId: item.id,
        error: errorMessage,
        retryCount: item.retryCount,
      });
    }

    operation.processedItems++;
  }

  /**
   * Execute operation based on type
   */
  private async executeOperation(type: BatchOperationType, data: any): Promise<any> {
    switch (type) {
      case 'create':
        return await this.apiClient.createWorkflow(data);
      
      case 'update':
        return await this.apiClient.updateWorkflow(data.id, data);
      
      case 'delete':
        return await this.apiClient.deleteWorkflow(data.id);
      
      case 'activate':
        return await this.apiClient.activateWorkflow(data.id);
      
      case 'deactivate':
        return await this.apiClient.deactivateWorkflow(data.id);
      
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  }

  /**
   * Create transaction for atomic operations
   */
  private createTransaction(operations: IBatchOperation[]): IBatchTransaction {
    const transaction: IBatchTransaction = {
      id: uuidv4(),
      operations,
      status: 'active',
      createdAt: new Date(),
    };

    this.transactions.set(transaction.id, transaction);
    this.logger.info('Transaction created', { transactionId: transaction.id });
    
    return transaction;
  }

  /**
   * Rollback transaction
   */
  private async rollbackTransaction(transactionId: string): Promise<void> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    this.logger.info('Starting transaction rollback', { transactionId });
    transaction.status = 'rolled_back';
    
    const rollbackState: IRollbackState = {
      itemsToRollback: [],
      rollbackProgress: 0,
      rollbackErrors: [],
    };
    
    transaction.rollbackState = rollbackState;

    // Collect successful items to rollback
    for (const operation of transaction.operations) {
      for (const item of operation.items) {
        if (item.status === 'success') {
          rollbackState.itemsToRollback.push(item.id);
        }
      }
    }

    // Perform rollback
    for (const operation of transaction.operations) {
      for (const item of operation.items) {
        if (item.status === 'success') {
          try {
            await this.rollbackItem(operation.type, item);
            item.status = 'rolled_back';
            rollbackState.rollbackProgress++;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            rollbackState.rollbackErrors.push({
              itemId: item.id,
              error: errorMessage,
            });
            this.logger.error('Rollback failed for item', {
              itemId: item.id,
              error: errorMessage,
            });
          }
        }
      }
      operation.status = 'rolled_back';
    }

    transaction.completedAt = new Date();
    this.emit('transaction:rolled_back', { transactionId });
  }

  /**
   * Rollback a single item
   */
  private async rollbackItem(operationType: BatchOperationType, item: IBatchItem): Promise<void> {
    switch (operationType) {
      case 'create':
        // Delete the created workflow
        if (item.result?.id) {
          await this.apiClient.deleteWorkflow(item.result.id);
        }
        break;
      
      case 'update':
        // Would need to store original state for proper rollback
        this.logger.warn('Update rollback not fully implemented', { itemId: item.id });
        break;
      
      case 'delete':
        // Cannot rollback deletes without backup
        this.logger.warn('Delete rollback not possible without backup', { itemId: item.id });
        break;
      
      case 'activate':
        // Deactivate the workflow
        if (item.data?.id) {
          await this.apiClient.deactivateWorkflow(item.data.id);
        }
        break;
      
      case 'deactivate':
        // Activate the workflow
        if (item.data?.id) {
          await this.apiClient.activateWorkflow(item.data.id);
        }
        break;
    }
  }

  /**
   * Update progress and emit event
   */
  private updateProgress(
    operation: IBatchOperation,
    onProgress?: (progress: IBatchProgress) => void
  ): void {
    const progress: IBatchProgress = {
      operationId: operation.id,
      type: operation.type,
      totalItems: operation.totalItems,
      processedItems: operation.processedItems,
      successfulItems: operation.successfulItems,
      failedItems: operation.failedItems,
      percentage: (operation.processedItems / operation.totalItems) * 100,
    };

    // Estimate time remaining
    if (operation.processedItems > 0) {
      const elapsed = Date.now() - operation.startTime.getTime();
      const avgTimePerItem = elapsed / operation.processedItems;
      const remainingItems = operation.totalItems - operation.processedItems;
      progress.estimatedTimeRemaining = avgTimePerItem * remainingItems;
    }

    if (onProgress) {
      onProgress(progress);
    }

    this.emit('operation:progress', progress);
  }

  /**
   * Create batch result summary
   */
  private createBatchResult<T>(operation: IBatchOperation<T>): IBatchResult<T> {
    const duration = operation.endTime 
      ? operation.endTime.getTime() - operation.startTime.getTime()
      : Date.now() - operation.startTime.getTime();

    const result: IBatchResult<T> = {
      operationId: operation.id,
      status: operation.status,
      summary: {
        total: operation.totalItems,
        successful: operation.successfulItems,
        failed: operation.failedItems,
        duration,
      },
      results: operation.items.map(item => ({
        itemId: item.id,
        success: item.status === 'success',
        data: item.result,
        error: item.error,
      })),
    };

    // Add errors if any
    const errors = operation.items
      .filter(item => item.status === 'failed')
      .map(item => ({
        itemId: item.id,
        error: item.error || 'Unknown error',
        retryable: true,
      }));

    if (errors.length > 0) {
      result.errors = errors;
    }

    return result;
  }

  /**
   * Get all active operations
   */
  getActiveOperations(): IBatchOperation[] {
    return Array.from(this.operations.values())
      .filter(op => this.activeOperations.has(op.id));
  }

  /**
   * Clean up completed operations older than specified time
   */
  cleanupOldOperations(olderThanMs: number = 3600000): number {
    const cutoffTime = Date.now() - olderThanMs;
    let cleaned = 0;

    for (const [id, operation] of this.operations.entries()) {
      if (operation.endTime && operation.endTime.getTime() < cutoffTime) {
        this.operations.delete(id);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.info('Cleaned up old operations', { count: cleaned });
    }

    return cleaned;
  }
}