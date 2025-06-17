import { CacheWarmingConfig, CachePrefetchConfig } from '../../types/cache.types.js';
import { MultiTierCacheManager } from './MultiTierCacheManager.js';
import { N8nApiClient } from '../N8nApiClient.js';
/**
 * Service for warming cache with frequently accessed data and prefetching related data
 */
export declare class CacheWarmingService {
    private readonly logger;
    private readonly cacheManager;
    private readonly apiClient?;
    private readonly warmingConfig;
    private readonly prefetchConfig;
    private warmingTimers;
    private isRunning;
    private stats;
    constructor(cacheManager: MultiTierCacheManager, warmingConfig: CacheWarmingConfig, prefetchConfig: CachePrefetchConfig, apiClient?: N8nApiClient);
    /**
     * Start cache warming service
     */
    start(): Promise<void>;
    /**
     * Stop cache warming service
     */
    stop(): Promise<void>;
    /**
     * Manually trigger warming for a specific strategy
     */
    warmStrategy(strategyName: string): Promise<number>;
    /**
     * Trigger prefetching based on a condition
     */
    triggerPrefetch(conditionContext: Record<string, any>): Promise<number>;
    /**
     * Get warming and prefetching statistics
     */
    getStats(): {
        totalWarmed: number;
        totalPrefetched: number;
        warmingExecutions: number;
        prefetchExecutions: number;
        errors: number;
    };
    private scheduleWarmingStrategy;
    private performInitialWarming;
    private executeWarmingStrategy;
    private warmFromApi;
    private warmFromDatabase;
    private warmFromPrecomputed;
    private executePrefetch;
    private prefetchByKeyType;
    private evaluateCondition;
    private resolveKeyPattern;
    private parseCronToInterval;
}
//# sourceMappingURL=CacheWarmingService.d.ts.map