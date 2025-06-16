import { Logger } from '../../utils/Logger.js';
/**
 * In-memory cache layer with LRU eviction and TTL support
 */
export class MemoryCacheLayer {
    name = 'memory';
    config;
    cache = new Map();
    logger = new Logger('MemoryCacheLayer');
    // Statistics tracking
    stats = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        evictions: 0,
        errors: 0,
    };
    accessCounter = 0;
    totalSizeBytes = 0;
    cleanupTimer;
    startTime;
    constructor(config) {
        this.config = config;
        this.startTime = Date.now();
        // Start cleanup timer
        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, config.cleanupIntervalMs);
        this.logger.info('Memory cache layer initialized', {
            maxSize: config.maxSize,
            maxMemoryMB: config.maxMemoryMB,
            ttlMs: config.ttlMs,
        });
    }
    async get(key) {
        try {
            const item = this.cache.get(key);
            if (!item) {
                this.stats.misses++;
                return null;
            }
            // Check TTL
            const now = Date.now();
            if (this.isExpired(item.entry, now)) {
                this.cache.delete(key);
                this.totalSizeBytes -= item.sizeBytes;
                this.stats.misses++;
                return null;
            }
            // Update access tracking
            item.entry.accessedAt = now;
            item.entry.accessCount++;
            item.accessOrder = ++this.accessCounter;
            this.stats.hits++;
            return { ...item.entry }; // Return copy to prevent mutations
        }
        catch (error) {
            this.stats.errors++;
            this.logger.error('Error getting cache entry', { key, error });
            return null;
        }
    }
    async set(key, value, options) {
        try {
            const now = Date.now();
            const ttl = options?.ttl || this.config.ttlMs;
            const tags = options?.tags || [];
            // Calculate size (rough estimate)
            const sizeBytes = this.estimateSize(value);
            // Check if we need to evict items
            await this.ensureCapacity(sizeBytes);
            const entry = {
                key,
                value,
                ttl,
                createdAt: now,
                accessedAt: now,
                accessCount: 1,
                size: sizeBytes,
                tags,
            };
            const item = {
                entry,
                accessOrder: ++this.accessCounter,
                sizeBytes,
            };
            // Remove existing item if present
            const existing = this.cache.get(key);
            if (existing) {
                this.totalSizeBytes -= existing.sizeBytes;
            }
            this.cache.set(key, item);
            this.totalSizeBytes += sizeBytes;
            this.stats.sets++;
            return true;
        }
        catch (error) {
            this.stats.errors++;
            this.logger.error('Error setting cache entry', { key, error });
            return false;
        }
    }
    async delete(key) {
        try {
            const item = this.cache.get(key);
            if (item) {
                this.cache.delete(key);
                this.totalSizeBytes -= item.sizeBytes;
                this.stats.deletes++;
                return true;
            }
            return false;
        }
        catch (error) {
            this.stats.errors++;
            this.logger.error('Error deleting cache entry', { key, error });
            return false;
        }
    }
    async clear() {
        try {
            this.cache.clear();
            this.totalSizeBytes = 0;
            this.accessCounter = 0;
            this.logger.info('Memory cache cleared');
        }
        catch (error) {
            this.stats.errors++;
            this.logger.error('Error clearing cache', { error });
        }
    }
    async getMany(keys) {
        const result = new Map();
        for (const key of keys) {
            const entry = await this.get(key);
            if (entry) {
                result.set(key, entry);
            }
        }
        return result;
    }
    async setMany(entries) {
        let allSucceeded = true;
        for (const [key, data] of entries) {
            const success = await this.set(key, data.value, { ttl: data.ttl, tags: data.tags });
            if (!success) {
                allSucceeded = false;
            }
        }
        return allSucceeded;
    }
    async deleteMany(keys) {
        let deletedCount = 0;
        for (const key of keys) {
            const success = await this.delete(key);
            if (success) {
                deletedCount++;
            }
        }
        return deletedCount;
    }
    async keys(pattern) {
        try {
            const allKeys = Array.from(this.cache.keys());
            if (!pattern) {
                return allKeys;
            }
            // Convert glob pattern to regex
            const regexPattern = pattern
                .replace(/\*/g, '.*')
                .replace(/\?/g, '.')
                .replace(/\[([^\]]+)\]/g, '[$1]');
            const regex = new RegExp(`^${regexPattern}$`);
            return allKeys.filter(key => regex.test(key));
        }
        catch (error) {
            this.stats.errors++;
            this.logger.error('Error getting cache keys', { pattern, error });
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
            this.logger.error('Error invalidating by pattern', { pattern, error });
            return 0;
        }
    }
    async invalidateByTag(tag) {
        try {
            const keysToDelete = [];
            for (const [key, item] of this.cache) {
                if (item.entry.tags.includes(tag)) {
                    keysToDelete.push(key);
                }
            }
            return await this.deleteMany(keysToDelete);
        }
        catch (error) {
            this.stats.errors++;
            this.logger.error('Error invalidating by tag', { tag, error });
            return 0;
        }
    }
    async getStats() {
        const totalRequests = this.stats.hits + this.stats.misses;
        const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
        return {
            layer: 'memory',
            hits: this.stats.hits,
            misses: this.stats.misses,
            hitRate,
            totalRequests,
            totalItems: this.cache.size,
            totalSizeBytes: this.totalSizeBytes,
            averageLatencyMs: 0.1, // Memory is very fast
            evictions: this.stats.evictions,
            errors: this.stats.errors,
            uptime: Date.now() - this.startTime,
        };
    }
    async isHealthy() {
        try {
            // Health checks
            const memoryUsageMB = this.totalSizeBytes / (1024 * 1024);
            const isWithinMemoryLimit = memoryUsageMB <= this.config.maxMemoryMB;
            const isWithinSizeLimit = this.cache.size <= this.config.maxSize;
            const errorRate = this.stats.errors / (this.stats.hits + this.stats.misses + this.stats.sets + this.stats.deletes || 1);
            const isErrorRateAcceptable = errorRate < 0.05; // Less than 5% error rate
            return isWithinMemoryLimit && isWithinSizeLimit && isErrorRateAcceptable;
        }
        catch {
            return false;
        }
    }
    async close() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = undefined;
        }
        await this.clear();
        this.logger.info('Memory cache layer closed');
    }
    // Private helper methods
    isExpired(entry, now) {
        if (!entry.ttl) {
            return false;
        }
        return (entry.createdAt + entry.ttl) < now;
    }
    estimateSize(value) {
        try {
            // Rough estimate based on JSON serialization
            const jsonString = JSON.stringify(value);
            return jsonString.length * 2; // Assume 2 bytes per character (Unicode)
        }
        catch {
            // Fallback for non-serializable values
            return 100; // Default estimate
        }
    }
    async ensureCapacity(newItemSize) {
        // Check memory limit
        const memoryUsageMB = (this.totalSizeBytes + newItemSize) / (1024 * 1024);
        if (memoryUsageMB > this.config.maxMemoryMB) {
            await this.evictByMemory(newItemSize);
        }
        // Check size limit
        if (this.cache.size >= this.config.maxSize) {
            await this.evictByCount();
        }
    }
    async evictByMemory(requiredSpace) {
        const targetSize = (this.config.maxMemoryMB * 0.8) * (1024 * 1024); // 80% of max
        const spaceToFree = this.totalSizeBytes + requiredSpace - targetSize;
        if (spaceToFree <= 0) {
            return;
        }
        const sortedItems = this.getSortedItemsForEviction();
        let freedSpace = 0;
        for (const [key, item] of sortedItems) {
            if (freedSpace >= spaceToFree) {
                break;
            }
            this.cache.delete(key);
            this.totalSizeBytes -= item.sizeBytes;
            freedSpace += item.sizeBytes;
            this.stats.evictions++;
        }
        this.logger.debug('Evicted items by memory', {
            itemsEvicted: this.stats.evictions,
            spaceFreed: freedSpace,
        });
    }
    async evictByCount() {
        const targetCount = Math.floor(this.config.maxSize * 0.8); // 80% of max
        const itemsToRemove = this.cache.size - targetCount;
        if (itemsToRemove <= 0) {
            return;
        }
        const sortedItems = this.getSortedItemsForEviction();
        for (let i = 0; i < itemsToRemove && i < sortedItems.length; i++) {
            const [key, item] = sortedItems[i];
            this.cache.delete(key);
            this.totalSizeBytes -= item.sizeBytes;
            this.stats.evictions++;
        }
        this.logger.debug('Evicted items by count', {
            itemsEvicted: itemsToRemove,
        });
    }
    getSortedItemsForEviction() {
        // Sort by LRU (least recently used first)
        return Array.from(this.cache.entries()).sort((a, b) => {
            return a[1].accessOrder - b[1].accessOrder;
        });
    }
    cleanup() {
        try {
            const now = Date.now();
            const expiredKeys = [];
            for (const [key, item] of this.cache) {
                if (this.isExpired(item.entry, now)) {
                    expiredKeys.push(key);
                }
            }
            for (const key of expiredKeys) {
                const item = this.cache.get(key);
                if (item) {
                    this.cache.delete(key);
                    this.totalSizeBytes -= item.sizeBytes;
                }
            }
            if (expiredKeys.length > 0) {
                this.logger.debug('Cleaned up expired items', {
                    expiredCount: expiredKeys.length,
                    remainingCount: this.cache.size,
                });
            }
        }
        catch (error) {
            this.logger.error('Error during cleanup', { error });
        }
    }
}
//# sourceMappingURL=MemoryCacheLayer.js.map