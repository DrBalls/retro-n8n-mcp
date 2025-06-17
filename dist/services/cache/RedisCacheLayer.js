import { Logger } from '../../utils/Logger.js';
/**
 * Redis cache layer with connection pooling and error handling
 */
export class RedisCacheLayer {
    name = 'redis';
    config;
    logger = new Logger('RedisCacheLayer');
    client = null;
    isConnected = false;
    // Statistics tracking
    stats = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        evictions: 0,
        errors: 0,
        connectionErrors: 0,
    };
    startTime;
    latencySum = 0;
    operationCount = 0;
    constructor(config) {
        this.config = config;
        this.startTime = Date.now();
        // Initialize Redis client
        this.initializeRedisClient();
        this.logger.info('Redis cache layer initialized', {
            host: config.host,
            port: config.port,
            db: config.db,
            keyPrefix: config.keyPrefix,
        });
    }
    async initializeRedisClient() {
        try {
            // Try to import Redis - it's optional
            let Redis;
            try {
                Redis = (await import('redis')).default;
            }
            catch {
                this.logger.warn('Redis package not available, using mock implementation');
                this.client = new MockRedisClient();
                this.isConnected = true;
                return;
            }
            // Create Redis client
            this.client = Redis.createClient({
                url: `redis://${this.config.host}:${this.config.port}`,
                password: this.config.password,
                database: this.config.db,
            });
            // Handle connection events
            this.client.on?.('connect', () => {
                this.isConnected = true;
                this.logger.info('Connected to Redis');
            });
            this.client.on?.('error', (error) => {
                this.isConnected = false;
                this.stats.connectionErrors++;
                this.logger.error('Redis connection error', { error });
            });
            this.client.on?.('end', () => {
                this.isConnected = false;
                this.logger.warn('Redis connection ended');
            });
            // Connect to Redis
            await this.client.connect?.();
            this.isConnected = true;
        }
        catch (error) {
            this.logger.error('Failed to initialize Redis client', { error });
            this.client = new MockRedisClient();
            this.isConnected = true; // Use mock client
        }
    }
    buildKey(key) {
        return `${this.config.keyPrefix}${key}`;
    }
    async measureLatency(operation) {
        const start = Date.now();
        try {
            const result = await operation();
            const latency = Date.now() - start;
            this.latencySum += latency;
            this.operationCount++;
            return result;
        }
        catch (error) {
            this.stats.errors++;
            throw error;
        }
    }
    async get(key) {
        if (!this.isConnected || !this.client) {
            return null;
        }
        try {
            const result = await this.measureLatency(async () => {
                return await this.client.get(this.buildKey(key));
            });
            if (!result) {
                this.stats.misses++;
                return null;
            }
            const entry = JSON.parse(result);
            // Check TTL
            const now = Date.now();
            if (entry.ttl && (entry.createdAt + entry.ttl) < now) {
                // Expired, delete it
                await this.delete(key);
                this.stats.misses++;
                return null;
            }
            // Update access tracking
            entry.accessedAt = now;
            entry.accessCount = (entry.accessCount || 0) + 1;
            // Store updated entry back (for access tracking)
            await this.client.set(this.buildKey(key), JSON.stringify(entry), 'EX', Math.ceil((entry.ttl || this.config.ttlMs) / 1000));
            this.stats.hits++;
            return entry;
        }
        catch (error) {
            this.stats.errors++;
            this.logger.error('Error getting cache entry from Redis', { key, error });
            return null;
        }
    }
    async set(key, value, options) {
        if (!this.isConnected || !this.client) {
            return false;
        }
        try {
            const now = Date.now();
            const ttl = options?.ttl || this.config.ttlMs;
            const tags = options?.tags || [];
            const entry = {
                key,
                value,
                ttl,
                createdAt: now,
                accessedAt: now,
                accessCount: 1,
                tags,
            };
            await this.measureLatency(async () => {
                const serialized = JSON.stringify(entry);
                return await this.client.setex(this.buildKey(key), Math.ceil(ttl / 1000), serialized);
            });
            this.stats.sets++;
            return true;
        }
        catch (error) {
            this.stats.errors++;
            this.logger.error('Error setting cache entry in Redis', { key, error });
            return false;
        }
    }
    async delete(key) {
        if (!this.isConnected || !this.client) {
            return false;
        }
        try {
            const result = await this.measureLatency(async () => {
                return await this.client.del(this.buildKey(key));
            });
            const deleted = result > 0;
            if (deleted) {
                this.stats.deletes++;
            }
            return deleted;
        }
        catch (error) {
            this.stats.errors++;
            this.logger.error('Error deleting cache entry from Redis', { key, error });
            return false;
        }
    }
    async clear() {
        if (!this.isConnected || !this.client) {
            return;
        }
        try {
            await this.measureLatency(async () => {
                // Delete all keys with our prefix
                const keys = await this.client.keys(`${this.config.keyPrefix}*`);
                if (keys.length > 0) {
                    await this.client.del(...keys);
                }
                return keys.length;
            });
            this.logger.info('Redis cache cleared');
        }
        catch (error) {
            this.stats.errors++;
            this.logger.error('Error clearing Redis cache', { error });
        }
    }
    async getMany(keys) {
        if (!this.isConnected || !this.client || keys.length === 0) {
            return new Map();
        }
        try {
            const redisKeys = keys.map(key => this.buildKey(key));
            const results = await this.measureLatency(async () => {
                return await this.client.mget(...redisKeys);
            });
            const entries = new Map();
            const now = Date.now();
            for (let i = 0; i < keys.length; i++) {
                const result = results[i];
                if (result) {
                    try {
                        const entry = JSON.parse(result);
                        // Check TTL
                        if (!entry.ttl || (entry.createdAt + entry.ttl) >= now) {
                            // Update access tracking
                            entry.accessedAt = now;
                            entry.accessCount = (entry.accessCount || 0) + 1;
                            entries.set(keys[i], entry);
                            this.stats.hits++;
                        }
                        else {
                            this.stats.misses++;
                        }
                    }
                    catch {
                        this.stats.misses++;
                    }
                }
                else {
                    this.stats.misses++;
                }
            }
            return entries;
        }
        catch (error) {
            this.stats.errors++;
            this.logger.error('Error getting multiple cache entries from Redis', { keys, error });
            return new Map();
        }
    }
    async setMany(entries) {
        if (!this.isConnected || !this.client || entries.size === 0) {
            return false;
        }
        try {
            const now = Date.now();
            const keyValues = [];
            for (const [key, data] of entries) {
                const ttl = data.ttl || this.config.ttlMs;
                const tags = data.tags || [];
                const entry = {
                    key,
                    value: data.value,
                    ttl,
                    createdAt: now,
                    accessedAt: now,
                    accessCount: 1,
                    tags,
                };
                keyValues.push(this.buildKey(key), JSON.stringify(entry));
            }
            await this.measureLatency(async () => {
                return await this.client.mset(...keyValues);
            });
            // Set TTL for each key (Redis MSET doesn't support TTL)
            const ttlPromises = [];
            for (const [key, data] of entries) {
                const ttl = data.ttl || this.config.ttlMs;
                ttlPromises.push(this.client.setex(this.buildKey(key), Math.ceil(ttl / 1000), JSON.stringify({
                    key,
                    value: data.value,
                    ttl,
                    createdAt: now,
                    accessedAt: now,
                    accessCount: 1,
                    tags: data.tags || [],
                })));
            }
            await Promise.all(ttlPromises);
            this.stats.sets += entries.size;
            return true;
        }
        catch (error) {
            this.stats.errors++;
            this.logger.error('Error setting multiple cache entries in Redis', { error });
            return false;
        }
    }
    async deleteMany(keys) {
        if (!this.isConnected || !this.client || keys.length === 0) {
            return 0;
        }
        try {
            const redisKeys = keys.map(key => this.buildKey(key));
            const deletedCount = await this.measureLatency(async () => {
                return await this.client.del(...redisKeys);
            });
            this.stats.deletes += deletedCount;
            return deletedCount;
        }
        catch (error) {
            this.stats.errors++;
            this.logger.error('Error deleting multiple cache entries from Redis', { keys, error });
            return 0;
        }
    }
    async keys(pattern) {
        if (!this.isConnected || !this.client) {
            return [];
        }
        try {
            const searchPattern = pattern
                ? `${this.config.keyPrefix}${pattern}`
                : `${this.config.keyPrefix}*`;
            const redisKeys = await this.measureLatency(async () => {
                return await this.client.keys(searchPattern);
            });
            // Remove prefix from keys
            return redisKeys.map(key => key.substring(this.config.keyPrefix.length));
        }
        catch (error) {
            this.stats.errors++;
            this.logger.error('Error getting cache keys from Redis', { pattern, error });
            return [];
        }
    }
    async invalidateByPattern(pattern) {
        try {
            const keysToDelete = await this.keys(pattern);
            return await this.deleteMany(keysToDelete);
        }
        catch (error) {
            this.stats.errors++;
            this.logger.error('Error invalidating by pattern in Redis', { pattern, error });
            return 0;
        }
    }
    async invalidateByTag(tag) {
        if (!this.isConnected || !this.client) {
            return 0;
        }
        try {
            // Get all keys and check their tags
            const allKeys = await this.keys();
            const keysToDelete = [];
            // We need to check each entry for tags
            for (const key of allKeys) {
                const entry = await this.get(key);
                if (entry && entry.tags.includes(tag)) {
                    keysToDelete.push(key);
                }
            }
            return await this.deleteMany(keysToDelete);
        }
        catch (error) {
            this.stats.errors++;
            this.logger.error('Error invalidating by tag in Redis', { tag, error });
            return 0;
        }
    }
    async getStats() {
        const totalRequests = this.stats.hits + this.stats.misses;
        const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
        const averageLatency = this.operationCount > 0 ? this.latencySum / this.operationCount : 0;
        let totalItems = 0;
        let totalSizeBytes = 0;
        try {
            if (this.isConnected && this.client) {
                totalItems = await this.client.dbsize();
                // Get memory info if available
                const info = await this.client.info('memory');
                const memoryMatch = info.match(/used_memory:(\d+)/);
                if (memoryMatch) {
                    totalSizeBytes = parseInt(memoryMatch[1], 10);
                }
            }
        }
        catch (error) {
            this.logger.debug('Could not get Redis stats', { error });
        }
        return {
            layer: 'redis',
            hits: this.stats.hits,
            misses: this.stats.misses,
            hitRate,
            totalRequests,
            totalItems,
            totalSizeBytes,
            averageLatencyMs: averageLatency,
            evictions: this.stats.evictions,
            errors: this.stats.errors,
            uptime: Date.now() - this.startTime,
        };
    }
    async isHealthy() {
        if (!this.client) {
            return false;
        }
        try {
            await this.client.ping();
            const errorRate = this.stats.errors / (this.stats.hits + this.stats.misses + this.stats.sets + this.stats.deletes || 1);
            return this.isConnected && errorRate < 0.1; // Less than 10% error rate
        }
        catch {
            return false;
        }
    }
    async close() {
        if (this.client) {
            try {
                await this.client.quit();
                this.isConnected = false;
                this.logger.info('Redis cache layer closed');
            }
            catch (error) {
                this.logger.error('Error closing Redis connection', { error });
            }
        }
    }
}
/**
 * Mock Redis client for when Redis is not available
 */
class MockRedisClient {
    data = new Map();
    expirations = new Map();
    async get(key) {
        const expiration = this.expirations.get(key);
        if (expiration && Date.now() > expiration) {
            this.data.delete(key);
            this.expirations.delete(key);
            return null;
        }
        return this.data.get(key) || null;
    }
    async set(key, value, mode, duration) {
        this.data.set(key, value);
        if (mode === 'EX' && duration) {
            this.expirations.set(key, Date.now() + duration * 1000);
        }
        return 'OK';
    }
    async setex(key, seconds, value) {
        this.data.set(key, value);
        this.expirations.set(key, Date.now() + seconds * 1000);
        return 'OK';
    }
    async del(...keys) {
        let deleted = 0;
        for (const key of keys) {
            if (this.data.delete(key)) {
                deleted++;
            }
            this.expirations.delete(key);
        }
        return deleted;
    }
    async keys(pattern) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));
        return Array.from(this.data.keys()).filter(key => regex.test(key));
    }
    async flushdb() {
        this.data.clear();
        this.expirations.clear();
        return 'OK';
    }
    async mget(...keys) {
        return Promise.all(keys.map(key => this.get(key)));
    }
    async mset(...keyValues) {
        for (let i = 0; i < keyValues.length; i += 2) {
            const key = keyValues[i];
            const value = keyValues[i + 1];
            if (key && value !== undefined) {
                this.data.set(key, value);
            }
        }
        return 'OK';
    }
    async ping() {
        return 'PONG';
    }
    async quit() {
        return 'OK';
    }
    async info(section) {
        return 'used_memory:1024\nconnected_clients:1';
    }
    async dbsize() {
        return this.data.size;
    }
}
//# sourceMappingURL=RedisCacheLayer.js.map