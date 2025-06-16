import { ICacheLayer, CacheEntry, CacheStats } from '../../types/cache.types.js';
interface DatabaseCacheConfig {
    enabled: boolean;
    tableName: string;
    ttlMs: number;
    cleanupIntervalMs: number;
}
/**
 * Database-backed cache layer for persistence across restarts
 * Uses an in-memory SQLite database as fallback when no database is configured
 */
export declare class DatabaseCacheLayer implements ICacheLayer {
    readonly name = "database";
    private readonly config;
    private readonly logger;
    private db;
    private isInitialized;
    private cleanupTimer?;
    private stats;
    private startTime;
    private latencySum;
    private operationCount;
    constructor(config: DatabaseCacheConfig);
    private initializeDatabase;
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
    private updateAccessTracking;
    private cleanup;
    private getTotalCount;
}
export {};
//# sourceMappingURL=DatabaseCacheLayer.d.ts.map