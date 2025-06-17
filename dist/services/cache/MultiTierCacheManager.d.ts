import { CacheConfig, CacheOperationResult, CacheMetrics } from '../../types/cache.types.js';
import { CacheKeyBuilder } from './CacheKeyBuilder.js';
import { EventEmitter } from 'events';
/**
 * Multi-tier cache manager that orchestrates memory, Redis, and database cache layers
 */
export declare class MultiTierCacheManager extends EventEmitter {
    private readonly logger;
    private readonly config;
    private readonly keyBuilder;
    private memoryLayer?;
    private redisLayer?;
    private databaseLayer?;
    private readonly layers;
    private isInitialized;
    private globalStats;
    constructor(config: CacheConfig);
    private initializeLayers;
    /**
     * Get value from cache, checking layers in order (memory -> Redis -> database)
     */
    get(key: string): Promise<CacheOperationResult>;
    /**
     * Set value in cache, using write strategy (write-through, write-behind, etc.)
     */
    set(key: string, value: unknown, options?: {
        ttl?: number;
        tags?: string[];
    }): Promise<CacheOperationResult>;
    /**
     * Delete value from cache across all layers
     */
    delete(key: string): Promise<CacheOperationResult>;
    /**
     * Clear all cache layers
     */
    clear(): Promise<void>;
    /**
     * Invalidate cache entries by pattern
     */
    invalidateByPattern(pattern: string, reason?: string): Promise<number>;
    /**
     * Invalidate cache entries by tag
     */
    invalidateByTag(tag: string, reason?: string): Promise<number>;
    /**
     * Invalidate cache entries for a specific workflow
     */
    invalidateWorkflow(workflowId: string, reason?: string): Promise<number>;
    /**
     * Invalidate cache entries for a specific execution
     */
    invalidateExecution(executionId: string, workflowId?: string, reason?: string): Promise<number>;
    /**
     * Get comprehensive cache statistics across all layers
     */
    getStats(): Promise<CacheMetrics>;
    /**
     * Check if cache system is healthy
     */
    isHealthy(): Promise<boolean>;
    /**
     * Get cache key builder for consistent key generation
     */
    getKeyBuilder(): CacheKeyBuilder;
    /**
     * Close all cache layers
     */
    close(): Promise<void>;
    private promoteToHigherLayers;
    private writeBehindToOtherLayers;
    private emitCacheEvent;
    private emitInvalidationEvent;
}
//# sourceMappingURL=MultiTierCacheManager.d.ts.map