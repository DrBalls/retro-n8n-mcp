import { z } from 'zod';
// Cache configuration schemas
export const CacheConfigSchema = z.object({
    memory: z.object({
        maxSize: z.number().default(100), // Max number of items
        maxMemoryMB: z.number().default(50), // Max memory in MB
        ttlMs: z.number().default(5 * 60 * 1000), // 5 minutes default TTL
        cleanupIntervalMs: z.number().default(60 * 1000), // 1 minute cleanup
    }).optional(),
    redis: z.object({
        host: z.string().default('localhost'),
        port: z.number().default(6379),
        password: z.string().optional(),
        db: z.number().default(0),
        keyPrefix: z.string().default('n8n-mcp:'),
        ttlMs: z.number().default(15 * 60 * 1000), // 15 minutes default TTL
        connectionPool: z.object({
            min: z.number().default(1),
            max: z.number().default(10),
        }).optional(),
    }).optional(),
    database: z.object({
        enabled: z.boolean().default(false),
        tableName: z.string().default('cache_entries'),
        ttlMs: z.number().default(60 * 60 * 1000), // 1 hour default TTL
        cleanupIntervalMs: z.number().default(10 * 60 * 1000), // 10 minutes cleanup
    }).optional(),
    strategy: z.object({
        writeThrough: z.boolean().default(true), // Write to all layers
        readThrough: z.boolean().default(true), // Read from lower layers on miss
        writeBehind: z.boolean().default(false), // Async writes to lower layers
        compression: z.boolean().default(true), // Compress large values
        serialization: z.enum(['json', 'msgpack']).default('json'),
    }).optional(),
});
// Cache entry schemas
export const CacheEntrySchema = z.object({
    key: z.string(),
    value: z.unknown(),
    ttl: z.number().optional(), // TTL in milliseconds
    createdAt: z.number(), // Timestamp
    accessedAt: z.number(), // Last access timestamp
    accessCount: z.number().default(0),
    size: z.number().optional(), // Size in bytes
    tags: z.array(z.string()).default([]), // For invalidation
    metadata: z.record(z.unknown()).optional(),
});
// Cache operation result schemas
export const CacheOperationResultSchema = z.object({
    success: z.boolean(),
    key: z.string(),
    value: z.unknown().optional(),
    hit: z.boolean().optional(), // For get operations
    layer: z.enum(['memory', 'redis', 'database']).optional(), // Which layer served/stored
    latencyMs: z.number().optional(),
    error: z.string().optional(),
});
// Cache statistics schemas
export const CacheStatsSchema = z.object({
    layer: z.enum(['memory', 'redis', 'database', 'overall']),
    hits: z.number().default(0),
    misses: z.number().default(0),
    hitRate: z.number().default(0), // Percentage
    totalRequests: z.number().default(0),
    totalItems: z.number().default(0),
    totalSizeBytes: z.number().default(0),
    averageLatencyMs: z.number().default(0),
    evictions: z.number().default(0),
    errors: z.number().default(0),
    uptime: z.number().default(0), // Milliseconds
    lastAccess: z.number().optional(), // Timestamp
});
// Cache invalidation schemas
export const CacheInvalidationSchema = z.object({
    strategy: z.enum(['key', 'pattern', 'tag', 'all']),
    target: z.string().optional(), // Key, pattern, or tag name
    cascade: z.boolean().default(true), // Invalidate in all layers
    reason: z.string().optional(),
    timestamp: z.number(),
});
// Cache warming configuration
export const CacheWarmingConfigSchema = z.object({
    enabled: z.boolean().default(false),
    strategies: z.array(z.object({
        name: z.string(),
        pattern: z.string(), // Key pattern to warm
        source: z.enum(['database', 'api', 'precomputed']),
        schedule: z.string().optional(), // Cron expression
        priority: z.number().default(1), // 1-10, higher = more priority
        batchSize: z.number().default(100),
        enabled: z.boolean().default(true),
    })).default([]),
});
// Cache monitoring schemas
export const CacheMetricsSchema = z.object({
    timestamp: z.number(),
    memory: CacheStatsSchema,
    redis: CacheStatsSchema.optional(),
    database: CacheStatsSchema.optional(),
    overall: CacheStatsSchema,
    performance: z.object({
        throughputPerSecond: z.number(),
        averageResponseTimeMs: z.number(),
        p95ResponseTimeMs: z.number(),
        p99ResponseTimeMs: z.number(),
        errorRate: z.number(), // Percentage
    }),
    health: z.object({
        memoryLayer: z.boolean(),
        redisLayer: z.boolean().optional(),
        databaseLayer: z.boolean().optional(),
        overall: z.boolean(),
    }),
});
// Cache event schemas for monitoring and debugging
export const CacheEventSchema = z.object({
    id: z.string(),
    type: z.enum(['hit', 'miss', 'set', 'delete', 'eviction', 'error', 'invalidation']),
    layer: z.enum(['memory', 'redis', 'database']),
    key: z.string(),
    value: z.unknown().optional(),
    metadata: z.record(z.unknown()).optional(),
    timestamp: z.number(),
    latencyMs: z.number().optional(),
    error: z.string().optional(),
});
// Cache prefetching configuration
export const CachePrefetchConfigSchema = z.object({
    enabled: z.boolean().default(false),
    triggers: z.array(z.object({
        name: z.string(),
        condition: z.string(), // JavaScript condition
        prefetchKeys: z.array(z.string()), // Keys or patterns to prefetch
        priority: z.number().default(1),
        enabled: z.boolean().default(true),
    })).default([]),
    maxConcurrent: z.number().default(5),
    timeoutMs: z.number().default(30000),
});
//# sourceMappingURL=cache.types.js.map