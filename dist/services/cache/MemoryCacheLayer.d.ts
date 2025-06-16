import { ICacheLayer, CacheEntry, CacheStats } from '../../types/cache.types.js';
interface MemoryCacheConfig {
    maxSize: number;
    maxMemoryMB: number;
    ttlMs: number;
    cleanupIntervalMs: number;
}
/**
 * In-memory cache layer with LRU eviction and TTL support
 */
export declare class MemoryCacheLayer implements ICacheLayer {
    readonly name = "memory";
    private readonly config;
    private readonly cache;
    private readonly logger;
    private stats;
    private accessCounter;
    private totalSizeBytes;
    private cleanupTimer?;
    private startTime;
    constructor(config: MemoryCacheConfig);
    get(key: string): Promise<CacheEntry | null>;
    set(key: string, value: unknown, options?: {
        ttl?: number;
        tags?: string[];
    }): Promise<boolean>;
    delete(key: string): Promise<boolean>;
    clear(): Promise<void>;
    getMany(keys: string[]): Promise<Map<string, CacheEntry>>;
    setMany(entries: Map<string, {
        value: unknown;
        ttl?: number;
        tags?: string[];
    }>): Promise<boolean>;
    deleteMany(keys: string[]): Promise<number>;
    keys(pattern?: string): Promise<string[]>;
    invalidateByPattern(pattern: string): Promise<number>;
    invalidateByTag(tag: string): Promise<number>;
    getStats(): Promise<CacheStats>;
    isHealthy(): Promise<boolean>;
    close(): Promise<void>;
    private isExpired;
    private estimateSize;
    private ensureCapacity;
    private evictByMemory;
    private evictByCount;
    private getSortedItemsForEviction;
    private cleanup;
}
export {};
//# sourceMappingURL=MemoryCacheLayer.d.ts.map