import { ICacheLayer, CacheEntry, CacheStats } from '../../types/cache.types.js';
interface RedisCacheConfig {
    host: string;
    port: number;
    password?: string;
    db: number;
    keyPrefix: string;
    ttlMs: number;
    connectionPool?: {
        min: number;
        max: number;
    };
}
/**
 * Redis cache layer with connection pooling and error handling
 */
export declare class RedisCacheLayer implements ICacheLayer {
    readonly name = "redis";
    private readonly config;
    private readonly logger;
    private client;
    private isConnected;
    private stats;
    private startTime;
    private latencySum;
    private operationCount;
    constructor(config: RedisCacheConfig);
    private initializeRedisClient;
    private buildKey;
    private measureLatency;
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
}
export {};
//# sourceMappingURL=RedisCacheLayer.d.ts.map