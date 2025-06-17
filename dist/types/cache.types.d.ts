import { z } from 'zod';
export declare const CacheConfigSchema: z.ZodObject<{
    memory: z.ZodOptional<z.ZodObject<{
        maxSize: z.ZodDefault<z.ZodNumber>;
        maxMemoryMB: z.ZodDefault<z.ZodNumber>;
        ttlMs: z.ZodDefault<z.ZodNumber>;
        cleanupIntervalMs: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        maxSize: number;
        maxMemoryMB: number;
        ttlMs: number;
        cleanupIntervalMs: number;
    }, {
        maxSize?: number | undefined;
        maxMemoryMB?: number | undefined;
        ttlMs?: number | undefined;
        cleanupIntervalMs?: number | undefined;
    }>>;
    redis: z.ZodOptional<z.ZodObject<{
        host: z.ZodDefault<z.ZodString>;
        port: z.ZodDefault<z.ZodNumber>;
        password: z.ZodOptional<z.ZodString>;
        db: z.ZodDefault<z.ZodNumber>;
        keyPrefix: z.ZodDefault<z.ZodString>;
        ttlMs: z.ZodDefault<z.ZodNumber>;
        connectionPool: z.ZodOptional<z.ZodObject<{
            min: z.ZodDefault<z.ZodNumber>;
            max: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            min: number;
            max: number;
        }, {
            min?: number | undefined;
            max?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        ttlMs: number;
        host: string;
        port: number;
        db: number;
        keyPrefix: string;
        password?: string | undefined;
        connectionPool?: {
            min: number;
            max: number;
        } | undefined;
    }, {
        ttlMs?: number | undefined;
        host?: string | undefined;
        port?: number | undefined;
        password?: string | undefined;
        db?: number | undefined;
        keyPrefix?: string | undefined;
        connectionPool?: {
            min?: number | undefined;
            max?: number | undefined;
        } | undefined;
    }>>;
    database: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        tableName: z.ZodDefault<z.ZodString>;
        ttlMs: z.ZodDefault<z.ZodNumber>;
        cleanupIntervalMs: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        ttlMs: number;
        cleanupIntervalMs: number;
        enabled: boolean;
        tableName: string;
    }, {
        ttlMs?: number | undefined;
        cleanupIntervalMs?: number | undefined;
        enabled?: boolean | undefined;
        tableName?: string | undefined;
    }>>;
    strategy: z.ZodOptional<z.ZodObject<{
        writeThrough: z.ZodDefault<z.ZodBoolean>;
        readThrough: z.ZodDefault<z.ZodBoolean>;
        writeBehind: z.ZodDefault<z.ZodBoolean>;
        compression: z.ZodDefault<z.ZodBoolean>;
        serialization: z.ZodDefault<z.ZodEnum<["json", "msgpack"]>>;
    }, "strip", z.ZodTypeAny, {
        writeThrough: boolean;
        readThrough: boolean;
        writeBehind: boolean;
        compression: boolean;
        serialization: "json" | "msgpack";
    }, {
        writeThrough?: boolean | undefined;
        readThrough?: boolean | undefined;
        writeBehind?: boolean | undefined;
        compression?: boolean | undefined;
        serialization?: "json" | "msgpack" | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    memory?: {
        maxSize: number;
        maxMemoryMB: number;
        ttlMs: number;
        cleanupIntervalMs: number;
    } | undefined;
    redis?: {
        ttlMs: number;
        host: string;
        port: number;
        db: number;
        keyPrefix: string;
        password?: string | undefined;
        connectionPool?: {
            min: number;
            max: number;
        } | undefined;
    } | undefined;
    database?: {
        ttlMs: number;
        cleanupIntervalMs: number;
        enabled: boolean;
        tableName: string;
    } | undefined;
    strategy?: {
        writeThrough: boolean;
        readThrough: boolean;
        writeBehind: boolean;
        compression: boolean;
        serialization: "json" | "msgpack";
    } | undefined;
}, {
    memory?: {
        maxSize?: number | undefined;
        maxMemoryMB?: number | undefined;
        ttlMs?: number | undefined;
        cleanupIntervalMs?: number | undefined;
    } | undefined;
    redis?: {
        ttlMs?: number | undefined;
        host?: string | undefined;
        port?: number | undefined;
        password?: string | undefined;
        db?: number | undefined;
        keyPrefix?: string | undefined;
        connectionPool?: {
            min?: number | undefined;
            max?: number | undefined;
        } | undefined;
    } | undefined;
    database?: {
        ttlMs?: number | undefined;
        cleanupIntervalMs?: number | undefined;
        enabled?: boolean | undefined;
        tableName?: string | undefined;
    } | undefined;
    strategy?: {
        writeThrough?: boolean | undefined;
        readThrough?: boolean | undefined;
        writeBehind?: boolean | undefined;
        compression?: boolean | undefined;
        serialization?: "json" | "msgpack" | undefined;
    } | undefined;
}>;
export type CacheConfig = z.infer<typeof CacheConfigSchema>;
export declare const CacheEntrySchema: z.ZodObject<{
    key: z.ZodString;
    value: z.ZodUnknown;
    ttl: z.ZodOptional<z.ZodNumber>;
    createdAt: z.ZodNumber;
    accessedAt: z.ZodNumber;
    accessCount: z.ZodDefault<z.ZodNumber>;
    size: z.ZodOptional<z.ZodNumber>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    key: string;
    createdAt: number;
    accessedAt: number;
    accessCount: number;
    tags: string[];
    value?: unknown;
    ttl?: number | undefined;
    size?: number | undefined;
    metadata?: Record<string, unknown> | undefined;
}, {
    key: string;
    createdAt: number;
    accessedAt: number;
    value?: unknown;
    ttl?: number | undefined;
    accessCount?: number | undefined;
    size?: number | undefined;
    tags?: string[] | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
export type CacheEntry = z.infer<typeof CacheEntrySchema>;
export declare const CacheOperationResultSchema: z.ZodObject<{
    success: z.ZodBoolean;
    key: z.ZodString;
    value: z.ZodOptional<z.ZodUnknown>;
    hit: z.ZodOptional<z.ZodBoolean>;
    layer: z.ZodOptional<z.ZodEnum<["memory", "redis", "database"]>>;
    latencyMs: z.ZodOptional<z.ZodNumber>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    key: string;
    error?: string | undefined;
    value?: unknown;
    hit?: boolean | undefined;
    layer?: "memory" | "redis" | "database" | undefined;
    latencyMs?: number | undefined;
}, {
    success: boolean;
    key: string;
    error?: string | undefined;
    value?: unknown;
    hit?: boolean | undefined;
    layer?: "memory" | "redis" | "database" | undefined;
    latencyMs?: number | undefined;
}>;
export type CacheOperationResult = z.infer<typeof CacheOperationResultSchema>;
export declare const CacheStatsSchema: z.ZodObject<{
    layer: z.ZodEnum<["memory", "redis", "database", "overall"]>;
    hits: z.ZodDefault<z.ZodNumber>;
    misses: z.ZodDefault<z.ZodNumber>;
    hitRate: z.ZodDefault<z.ZodNumber>;
    totalRequests: z.ZodDefault<z.ZodNumber>;
    totalItems: z.ZodDefault<z.ZodNumber>;
    totalSizeBytes: z.ZodDefault<z.ZodNumber>;
    averageLatencyMs: z.ZodDefault<z.ZodNumber>;
    evictions: z.ZodDefault<z.ZodNumber>;
    errors: z.ZodDefault<z.ZodNumber>;
    uptime: z.ZodDefault<z.ZodNumber>;
    lastAccess: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    layer: "memory" | "redis" | "database" | "overall";
    hits: number;
    misses: number;
    hitRate: number;
    totalRequests: number;
    totalItems: number;
    totalSizeBytes: number;
    averageLatencyMs: number;
    evictions: number;
    errors: number;
    uptime: number;
    lastAccess?: number | undefined;
}, {
    layer: "memory" | "redis" | "database" | "overall";
    hits?: number | undefined;
    misses?: number | undefined;
    hitRate?: number | undefined;
    totalRequests?: number | undefined;
    totalItems?: number | undefined;
    totalSizeBytes?: number | undefined;
    averageLatencyMs?: number | undefined;
    evictions?: number | undefined;
    errors?: number | undefined;
    uptime?: number | undefined;
    lastAccess?: number | undefined;
}>;
export type CacheStats = z.infer<typeof CacheStatsSchema>;
export declare const CacheInvalidationSchema: z.ZodObject<{
    strategy: z.ZodEnum<["key", "pattern", "tag", "all"]>;
    target: z.ZodOptional<z.ZodString>;
    cascade: z.ZodDefault<z.ZodBoolean>;
    reason: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    strategy: "key" | "pattern" | "tag" | "all";
    cascade: boolean;
    timestamp: number;
    target?: string | undefined;
    reason?: string | undefined;
}, {
    strategy: "key" | "pattern" | "tag" | "all";
    timestamp: number;
    target?: string | undefined;
    cascade?: boolean | undefined;
    reason?: string | undefined;
}>;
export type CacheInvalidation = z.infer<typeof CacheInvalidationSchema>;
export interface ICacheLayer {
    name: string;
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
export declare const CacheWarmingConfigSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    strategies: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        pattern: z.ZodString;
        source: z.ZodEnum<["database", "api", "precomputed"]>;
        schedule: z.ZodOptional<z.ZodString>;
        priority: z.ZodDefault<z.ZodNumber>;
        batchSize: z.ZodDefault<z.ZodNumber>;
        enabled: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        pattern: string;
        name: string;
        source: "database" | "api" | "precomputed";
        priority: number;
        batchSize: number;
        schedule?: string | undefined;
    }, {
        pattern: string;
        name: string;
        source: "database" | "api" | "precomputed";
        enabled?: boolean | undefined;
        schedule?: string | undefined;
        priority?: number | undefined;
        batchSize?: number | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    strategies: {
        enabled: boolean;
        pattern: string;
        name: string;
        source: "database" | "api" | "precomputed";
        priority: number;
        batchSize: number;
        schedule?: string | undefined;
    }[];
}, {
    enabled?: boolean | undefined;
    strategies?: {
        pattern: string;
        name: string;
        source: "database" | "api" | "precomputed";
        enabled?: boolean | undefined;
        schedule?: string | undefined;
        priority?: number | undefined;
        batchSize?: number | undefined;
    }[] | undefined;
}>;
export type CacheWarmingConfig = z.infer<typeof CacheWarmingConfigSchema>;
export declare const CacheMetricsSchema: z.ZodObject<{
    timestamp: z.ZodNumber;
    memory: z.ZodObject<{
        layer: z.ZodEnum<["memory", "redis", "database", "overall"]>;
        hits: z.ZodDefault<z.ZodNumber>;
        misses: z.ZodDefault<z.ZodNumber>;
        hitRate: z.ZodDefault<z.ZodNumber>;
        totalRequests: z.ZodDefault<z.ZodNumber>;
        totalItems: z.ZodDefault<z.ZodNumber>;
        totalSizeBytes: z.ZodDefault<z.ZodNumber>;
        averageLatencyMs: z.ZodDefault<z.ZodNumber>;
        evictions: z.ZodDefault<z.ZodNumber>;
        errors: z.ZodDefault<z.ZodNumber>;
        uptime: z.ZodDefault<z.ZodNumber>;
        lastAccess: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        layer: "memory" | "redis" | "database" | "overall";
        hits: number;
        misses: number;
        hitRate: number;
        totalRequests: number;
        totalItems: number;
        totalSizeBytes: number;
        averageLatencyMs: number;
        evictions: number;
        errors: number;
        uptime: number;
        lastAccess?: number | undefined;
    }, {
        layer: "memory" | "redis" | "database" | "overall";
        hits?: number | undefined;
        misses?: number | undefined;
        hitRate?: number | undefined;
        totalRequests?: number | undefined;
        totalItems?: number | undefined;
        totalSizeBytes?: number | undefined;
        averageLatencyMs?: number | undefined;
        evictions?: number | undefined;
        errors?: number | undefined;
        uptime?: number | undefined;
        lastAccess?: number | undefined;
    }>;
    redis: z.ZodOptional<z.ZodObject<{
        layer: z.ZodEnum<["memory", "redis", "database", "overall"]>;
        hits: z.ZodDefault<z.ZodNumber>;
        misses: z.ZodDefault<z.ZodNumber>;
        hitRate: z.ZodDefault<z.ZodNumber>;
        totalRequests: z.ZodDefault<z.ZodNumber>;
        totalItems: z.ZodDefault<z.ZodNumber>;
        totalSizeBytes: z.ZodDefault<z.ZodNumber>;
        averageLatencyMs: z.ZodDefault<z.ZodNumber>;
        evictions: z.ZodDefault<z.ZodNumber>;
        errors: z.ZodDefault<z.ZodNumber>;
        uptime: z.ZodDefault<z.ZodNumber>;
        lastAccess: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        layer: "memory" | "redis" | "database" | "overall";
        hits: number;
        misses: number;
        hitRate: number;
        totalRequests: number;
        totalItems: number;
        totalSizeBytes: number;
        averageLatencyMs: number;
        evictions: number;
        errors: number;
        uptime: number;
        lastAccess?: number | undefined;
    }, {
        layer: "memory" | "redis" | "database" | "overall";
        hits?: number | undefined;
        misses?: number | undefined;
        hitRate?: number | undefined;
        totalRequests?: number | undefined;
        totalItems?: number | undefined;
        totalSizeBytes?: number | undefined;
        averageLatencyMs?: number | undefined;
        evictions?: number | undefined;
        errors?: number | undefined;
        uptime?: number | undefined;
        lastAccess?: number | undefined;
    }>>;
    database: z.ZodOptional<z.ZodObject<{
        layer: z.ZodEnum<["memory", "redis", "database", "overall"]>;
        hits: z.ZodDefault<z.ZodNumber>;
        misses: z.ZodDefault<z.ZodNumber>;
        hitRate: z.ZodDefault<z.ZodNumber>;
        totalRequests: z.ZodDefault<z.ZodNumber>;
        totalItems: z.ZodDefault<z.ZodNumber>;
        totalSizeBytes: z.ZodDefault<z.ZodNumber>;
        averageLatencyMs: z.ZodDefault<z.ZodNumber>;
        evictions: z.ZodDefault<z.ZodNumber>;
        errors: z.ZodDefault<z.ZodNumber>;
        uptime: z.ZodDefault<z.ZodNumber>;
        lastAccess: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        layer: "memory" | "redis" | "database" | "overall";
        hits: number;
        misses: number;
        hitRate: number;
        totalRequests: number;
        totalItems: number;
        totalSizeBytes: number;
        averageLatencyMs: number;
        evictions: number;
        errors: number;
        uptime: number;
        lastAccess?: number | undefined;
    }, {
        layer: "memory" | "redis" | "database" | "overall";
        hits?: number | undefined;
        misses?: number | undefined;
        hitRate?: number | undefined;
        totalRequests?: number | undefined;
        totalItems?: number | undefined;
        totalSizeBytes?: number | undefined;
        averageLatencyMs?: number | undefined;
        evictions?: number | undefined;
        errors?: number | undefined;
        uptime?: number | undefined;
        lastAccess?: number | undefined;
    }>>;
    overall: z.ZodObject<{
        layer: z.ZodEnum<["memory", "redis", "database", "overall"]>;
        hits: z.ZodDefault<z.ZodNumber>;
        misses: z.ZodDefault<z.ZodNumber>;
        hitRate: z.ZodDefault<z.ZodNumber>;
        totalRequests: z.ZodDefault<z.ZodNumber>;
        totalItems: z.ZodDefault<z.ZodNumber>;
        totalSizeBytes: z.ZodDefault<z.ZodNumber>;
        averageLatencyMs: z.ZodDefault<z.ZodNumber>;
        evictions: z.ZodDefault<z.ZodNumber>;
        errors: z.ZodDefault<z.ZodNumber>;
        uptime: z.ZodDefault<z.ZodNumber>;
        lastAccess: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        layer: "memory" | "redis" | "database" | "overall";
        hits: number;
        misses: number;
        hitRate: number;
        totalRequests: number;
        totalItems: number;
        totalSizeBytes: number;
        averageLatencyMs: number;
        evictions: number;
        errors: number;
        uptime: number;
        lastAccess?: number | undefined;
    }, {
        layer: "memory" | "redis" | "database" | "overall";
        hits?: number | undefined;
        misses?: number | undefined;
        hitRate?: number | undefined;
        totalRequests?: number | undefined;
        totalItems?: number | undefined;
        totalSizeBytes?: number | undefined;
        averageLatencyMs?: number | undefined;
        evictions?: number | undefined;
        errors?: number | undefined;
        uptime?: number | undefined;
        lastAccess?: number | undefined;
    }>;
    performance: z.ZodObject<{
        throughputPerSecond: z.ZodNumber;
        averageResponseTimeMs: z.ZodNumber;
        p95ResponseTimeMs: z.ZodNumber;
        p99ResponseTimeMs: z.ZodNumber;
        errorRate: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        throughputPerSecond: number;
        averageResponseTimeMs: number;
        p95ResponseTimeMs: number;
        p99ResponseTimeMs: number;
        errorRate: number;
    }, {
        throughputPerSecond: number;
        averageResponseTimeMs: number;
        p95ResponseTimeMs: number;
        p99ResponseTimeMs: number;
        errorRate: number;
    }>;
    health: z.ZodObject<{
        memoryLayer: z.ZodBoolean;
        redisLayer: z.ZodOptional<z.ZodBoolean>;
        databaseLayer: z.ZodOptional<z.ZodBoolean>;
        overall: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        overall: boolean;
        memoryLayer: boolean;
        redisLayer?: boolean | undefined;
        databaseLayer?: boolean | undefined;
    }, {
        overall: boolean;
        memoryLayer: boolean;
        redisLayer?: boolean | undefined;
        databaseLayer?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    memory: {
        layer: "memory" | "redis" | "database" | "overall";
        hits: number;
        misses: number;
        hitRate: number;
        totalRequests: number;
        totalItems: number;
        totalSizeBytes: number;
        averageLatencyMs: number;
        evictions: number;
        errors: number;
        uptime: number;
        lastAccess?: number | undefined;
    };
    overall: {
        layer: "memory" | "redis" | "database" | "overall";
        hits: number;
        misses: number;
        hitRate: number;
        totalRequests: number;
        totalItems: number;
        totalSizeBytes: number;
        averageLatencyMs: number;
        evictions: number;
        errors: number;
        uptime: number;
        lastAccess?: number | undefined;
    };
    timestamp: number;
    performance: {
        throughputPerSecond: number;
        averageResponseTimeMs: number;
        p95ResponseTimeMs: number;
        p99ResponseTimeMs: number;
        errorRate: number;
    };
    health: {
        overall: boolean;
        memoryLayer: boolean;
        redisLayer?: boolean | undefined;
        databaseLayer?: boolean | undefined;
    };
    redis?: {
        layer: "memory" | "redis" | "database" | "overall";
        hits: number;
        misses: number;
        hitRate: number;
        totalRequests: number;
        totalItems: number;
        totalSizeBytes: number;
        averageLatencyMs: number;
        evictions: number;
        errors: number;
        uptime: number;
        lastAccess?: number | undefined;
    } | undefined;
    database?: {
        layer: "memory" | "redis" | "database" | "overall";
        hits: number;
        misses: number;
        hitRate: number;
        totalRequests: number;
        totalItems: number;
        totalSizeBytes: number;
        averageLatencyMs: number;
        evictions: number;
        errors: number;
        uptime: number;
        lastAccess?: number | undefined;
    } | undefined;
}, {
    memory: {
        layer: "memory" | "redis" | "database" | "overall";
        hits?: number | undefined;
        misses?: number | undefined;
        hitRate?: number | undefined;
        totalRequests?: number | undefined;
        totalItems?: number | undefined;
        totalSizeBytes?: number | undefined;
        averageLatencyMs?: number | undefined;
        evictions?: number | undefined;
        errors?: number | undefined;
        uptime?: number | undefined;
        lastAccess?: number | undefined;
    };
    overall: {
        layer: "memory" | "redis" | "database" | "overall";
        hits?: number | undefined;
        misses?: number | undefined;
        hitRate?: number | undefined;
        totalRequests?: number | undefined;
        totalItems?: number | undefined;
        totalSizeBytes?: number | undefined;
        averageLatencyMs?: number | undefined;
        evictions?: number | undefined;
        errors?: number | undefined;
        uptime?: number | undefined;
        lastAccess?: number | undefined;
    };
    timestamp: number;
    performance: {
        throughputPerSecond: number;
        averageResponseTimeMs: number;
        p95ResponseTimeMs: number;
        p99ResponseTimeMs: number;
        errorRate: number;
    };
    health: {
        overall: boolean;
        memoryLayer: boolean;
        redisLayer?: boolean | undefined;
        databaseLayer?: boolean | undefined;
    };
    redis?: {
        layer: "memory" | "redis" | "database" | "overall";
        hits?: number | undefined;
        misses?: number | undefined;
        hitRate?: number | undefined;
        totalRequests?: number | undefined;
        totalItems?: number | undefined;
        totalSizeBytes?: number | undefined;
        averageLatencyMs?: number | undefined;
        evictions?: number | undefined;
        errors?: number | undefined;
        uptime?: number | undefined;
        lastAccess?: number | undefined;
    } | undefined;
    database?: {
        layer: "memory" | "redis" | "database" | "overall";
        hits?: number | undefined;
        misses?: number | undefined;
        hitRate?: number | undefined;
        totalRequests?: number | undefined;
        totalItems?: number | undefined;
        totalSizeBytes?: number | undefined;
        averageLatencyMs?: number | undefined;
        evictions?: number | undefined;
        errors?: number | undefined;
        uptime?: number | undefined;
        lastAccess?: number | undefined;
    } | undefined;
}>;
export type CacheMetrics = z.infer<typeof CacheMetricsSchema>;
export declare const CacheEventSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["hit", "miss", "set", "delete", "eviction", "error", "invalidation"]>;
    layer: z.ZodEnum<["memory", "redis", "database"]>;
    key: z.ZodString;
    value: z.ZodOptional<z.ZodUnknown>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    timestamp: z.ZodNumber;
    latencyMs: z.ZodOptional<z.ZodNumber>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    key: string;
    type: "error" | "hit" | "set" | "miss" | "delete" | "eviction" | "invalidation";
    layer: "memory" | "redis" | "database";
    timestamp: number;
    id: string;
    error?: string | undefined;
    value?: unknown;
    metadata?: Record<string, unknown> | undefined;
    latencyMs?: number | undefined;
}, {
    key: string;
    type: "error" | "hit" | "set" | "miss" | "delete" | "eviction" | "invalidation";
    layer: "memory" | "redis" | "database";
    timestamp: number;
    id: string;
    error?: string | undefined;
    value?: unknown;
    metadata?: Record<string, unknown> | undefined;
    latencyMs?: number | undefined;
}>;
export type CacheEvent = z.infer<typeof CacheEventSchema>;
export interface ICacheKeyBuilder {
    workflow(id: string): string;
    execution(id: string): string;
    credential(id: string): string;
    node(type: string, version: number): string;
    user(id: string): string;
    metrics(type: string, timeframe: string): string;
    custom(namespace: string, key: string): string;
}
export declare const CachePrefetchConfigSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    triggers: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        condition: z.ZodString;
        prefetchKeys: z.ZodArray<z.ZodString, "many">;
        priority: z.ZodDefault<z.ZodNumber>;
        enabled: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        name: string;
        priority: number;
        condition: string;
        prefetchKeys: string[];
    }, {
        name: string;
        condition: string;
        prefetchKeys: string[];
        enabled?: boolean | undefined;
        priority?: number | undefined;
    }>, "many">>;
    maxConcurrent: z.ZodDefault<z.ZodNumber>;
    timeoutMs: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    triggers: {
        enabled: boolean;
        name: string;
        priority: number;
        condition: string;
        prefetchKeys: string[];
    }[];
    maxConcurrent: number;
    timeoutMs: number;
}, {
    enabled?: boolean | undefined;
    triggers?: {
        name: string;
        condition: string;
        prefetchKeys: string[];
        enabled?: boolean | undefined;
        priority?: number | undefined;
    }[] | undefined;
    maxConcurrent?: number | undefined;
    timeoutMs?: number | undefined;
}>;
export type CachePrefetchConfig = z.infer<typeof CachePrefetchConfigSchema>;
//# sourceMappingURL=cache.types.d.ts.map