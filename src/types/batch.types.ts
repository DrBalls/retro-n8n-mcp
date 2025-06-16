/**
 * Batch operation types and interfaces
 */

export type BatchOperationType = 'create' | 'update' | 'delete' | 'activate' | 'deactivate';
export type BatchOperationStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'partially_completed' | 'rolled_back';

export interface IBatchOperation<T = any> {
  id: string;
  type: BatchOperationType;
  status: BatchOperationStatus;
  totalItems: number;
  processedItems: number;
  successfulItems: number;
  failedItems: number;
  items: IBatchItem<T>[];
  startTime: Date;
  endTime?: Date;
  error?: string;
  metadata?: Record<string, any>;
}

export interface IBatchItem<T = any> {
  id: string;
  data: T;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'rolled_back';
  error?: string;
  result?: any;
  retryCount?: number;
  processedAt?: Date;
}

export interface IBatchOperationOptions {
  /**
   * Whether to stop on first error or continue processing
   */
  stopOnError?: boolean;
  
  /**
   * Enable atomic transactions (all succeed or all fail)
   */
  atomic?: boolean;
  
  /**
   * Maximum number of concurrent operations
   */
  concurrency?: number;
  
  /**
   * Maximum retries per item
   */
  maxRetries?: number;
  
  /**
   * Delay between retries in ms
   */
  retryDelay?: number;
  
  /**
   * Progress callback
   */
  onProgress?: (progress: IBatchProgress) => void;
  
  /**
   * Custom validation function for items
   */
  validateItem?: (item: any) => boolean | Promise<boolean>;
}

export interface IBatchProgress {
  operationId: string;
  type: BatchOperationType;
  totalItems: number;
  processedItems: number;
  successfulItems: number;
  failedItems: number;
  percentage: number;
  currentItem?: string;
  estimatedTimeRemaining?: number;
}

export interface IBatchResult<T = any> {
  operationId: string;
  status: BatchOperationStatus;
  summary: {
    total: number;
    successful: number;
    failed: number;
    duration: number;
  };
  results: Array<{
    itemId: string;
    success: boolean;
    data?: T;
    error?: string;
  }>;
  errors?: Array<{
    itemId: string;
    error: string;
    retryable: boolean;
  }>;
}

export interface IBatchTransaction {
  id: string;
  operations: IBatchOperation[];
  status: 'active' | 'committed' | 'rolled_back';
  createdAt: Date;
  completedAt?: Date;
  rollbackState?: IRollbackState;
}

export interface IRollbackState {
  itemsToRollback: string[];
  rollbackProgress: number;
  rollbackErrors: Array<{
    itemId: string;
    error: string;
  }>;
}

export interface IBatchWorkflowCreate {
  name: string;
  nodes: any[];
  connections: any;
  settings?: any;
  staticData?: any;
  tags?: string[];
  active?: boolean;
}

export interface IBatchWorkflowUpdate {
  id: string;
  name?: string;
  nodes?: any[];
  connections?: any;
  settings?: any;
  staticData?: any;
  tags?: string[];
  active?: boolean;
}

export interface IBatchWorkflowDelete {
  id: string;
  force?: boolean;
}

export interface IBatchWorkflowActivate {
  id: string;
}

export interface IBatchWorkflowDeactivate {
  id: string;
}