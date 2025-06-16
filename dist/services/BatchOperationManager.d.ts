import { EventEmitter } from 'events';
import { N8nApiClient } from './N8nApiClient.js';
import { IBatchOperation, IBatchOperationOptions, BatchOperationType } from '../types/batch.types.js';
export declare class BatchOperationManager extends EventEmitter {
    private operations;
    private transactions;
    private apiClient;
    private logger;
    private activeOperations;
    constructor(apiClient: N8nApiClient);
    /**
     * Create a new batch operation
     */
    createBatchOperation<T>(type: BatchOperationType, items: T[], options?: IBatchOperationOptions): Promise<string>;
    /**
     * Get batch operation status
     */
    getOperationStatus(operationId: string): IBatchOperation | null;
    /**
     * Cancel a batch operation
     */
    cancelOperation(operationId: string): Promise<boolean>;
    /**
     * Process batch operation
     */
    private processBatchOperation;
    /**
     * Process items with concurrency control
     */
    private processItemsWithConcurrency;
    /**
     * Process a single item
     */
    private processItem;
    /**
     * Execute operation based on type
     */
    private executeOperation;
    /**
     * Create transaction for atomic operations
     */
    private createTransaction;
    /**
     * Rollback transaction
     */
    private rollbackTransaction;
    /**
     * Rollback a single item
     */
    private rollbackItem;
    /**
     * Update progress and emit event
     */
    private updateProgress;
    /**
     * Create batch result summary
     */
    private createBatchResult;
    /**
     * Get all active operations
     */
    getActiveOperations(): IBatchOperation[];
    /**
     * Clean up completed operations older than specified time
     */
    cleanupOldOperations(olderThanMs?: number): number;
}
//# sourceMappingURL=BatchOperationManager.d.ts.map