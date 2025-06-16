import { ICacheLayer, CacheEntry, CacheStats } from '../../types/cache.types.js';
import { Logger } from '../../utils/Logger.js';

interface MemoryCacheConfig {
  maxSize: number;
  maxMemoryMB: number;
  ttlMs: number;
  cleanupIntervalMs: number;
}

interface MemoryCacheItem {
  entry: CacheEntry;
  accessOrder: number; // For LRU tracking
  sizeBytes: number;
}

/**
 * In-memory cache layer with LRU eviction and TTL support
 */
export class MemoryCacheLayer implements ICacheLayer {
  public readonly name = 'memory';
  private readonly config: MemoryCacheConfig;
  private readonly cache = new Map<string, MemoryCacheItem>();
  private readonly logger = new Logger('MemoryCacheLayer');
  
  // Statistics tracking
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    errors: 0,
  };
  
  private accessCounter = 0;
  private totalSizeBytes = 0;
  private cleanupTimer?: NodeJS.Timeout;
  private startTime: number;

  constructor(config: MemoryCacheConfig) {
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

  async get(key: string): Promise<CacheEntry | null> {
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
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Error getting cache entry', { key, error });
      return null;
    }
  }

  async set(key: string, value: unknown, options?: { ttl?: number; tags?: string[] }): Promise<boolean> {
    try {
      const now = Date.now();
      const ttl = options?.ttl || this.config.ttlMs;
      const tags = options?.tags || [];

      // Calculate size (rough estimate)
      const sizeBytes = this.estimateSize(value);
      
      // Check if we need to evict items
      await this.ensureCapacity(sizeBytes);

      const entry: CacheEntry = {
        key,
        value,
        ttl,
        createdAt: now,
        accessedAt: now,
        accessCount: 1,
        size: sizeBytes,
        tags,
      };

      const item: MemoryCacheItem = {
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
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Error setting cache entry', { key, error });
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const item = this.cache.get(key);
      if (item) {
        this.cache.delete(key);
        this.totalSizeBytes -= item.sizeBytes;
        this.stats.deletes++;
        return true;
      }
      return false;
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Error deleting cache entry', { key, error });
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      this.cache.clear();
      this.totalSizeBytes = 0;
      this.accessCounter = 0;
      this.logger.info('Memory cache cleared');
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Error clearing cache', { error });
    }
  }

  async getMany(keys: string[]): Promise<Map<string, CacheEntry>> {
    const result = new Map<string, CacheEntry>();
    
    for (const key of keys) {
      const entry = await this.get(key);
      if (entry) {
        result.set(key, entry);
      }
    }
    
    return result;
  }

  async setMany(entries: Map<string, { value: unknown; ttl?: number; tags?: string[] }>): Promise<boolean> {
    let allSucceeded = true;
    
    for (const [key, data] of entries) {
      const success = await this.set(key, data.value, { ttl: data.ttl, tags: data.tags });
      if (!success) {
        allSucceeded = false;
      }
    }
    
    return allSucceeded;
  }

  async deleteMany(keys: string[]): Promise<number> {
    let deletedCount = 0;
    
    for (const key of keys) {
      const success = await this.delete(key);
      if (success) {
        deletedCount++;
      }
    }
    
    return deletedCount;
  }

  async keys(pattern?: string): Promise<string[]> {
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
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Error getting cache keys', { pattern, error });
      return [];
    }
  }

  async invalidateByPattern(pattern: string): Promise<number> {
    try {
      const keysToDelete = await this.keys(pattern);
      return await this.deleteMany(keysToDelete);
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Error invalidating by pattern', { pattern, error });
      return 0;
    }
  }

  async invalidateByTag(tag: string): Promise<number> {
    try {
      const keysToDelete: string[] = [];
      
      for (const [key, item] of this.cache) {
        if (item.entry.tags.includes(tag)) {
          keysToDelete.push(key);
        }
      }
      
      return await this.deleteMany(keysToDelete);
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Error invalidating by tag', { tag, error });
      return 0;
    }
  }

  async getStats(): Promise<CacheStats> {
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

  async isHealthy(): Promise<boolean> {
    try {
      // Health checks
      const memoryUsageMB = this.totalSizeBytes / (1024 * 1024);
      const isWithinMemoryLimit = memoryUsageMB <= this.config.maxMemoryMB;
      const isWithinSizeLimit = this.cache.size <= this.config.maxSize;
      const errorRate = this.stats.errors / (this.stats.hits + this.stats.misses + this.stats.sets + this.stats.deletes || 1);
      const isErrorRateAcceptable = errorRate < 0.05; // Less than 5% error rate

      return isWithinMemoryLimit && isWithinSizeLimit && isErrorRateAcceptable;
    } catch {
      return false;
    }
  }

  async close(): Promise<void> {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    
    await this.clear();
    this.logger.info('Memory cache layer closed');
  }

  // Private helper methods

  private isExpired(entry: CacheEntry, now: number): boolean {
    if (!entry.ttl) {
      return false;
    }
    return (entry.createdAt + entry.ttl) < now;
  }

  private estimateSize(value: unknown): number {
    try {
      // Rough estimate based on JSON serialization
      const jsonString = JSON.stringify(value);
      return jsonString.length * 2; // Assume 2 bytes per character (Unicode)
    } catch {
      // Fallback for non-serializable values
      return 100; // Default estimate
    }
  }

  private async ensureCapacity(newItemSize: number): Promise<void> {
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

  private async evictByMemory(requiredSpace: number): Promise<void> {
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

  private async evictByCount(): Promise<void> {
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

  private getSortedItemsForEviction(): Array<[string, MemoryCacheItem]> {
    // Sort by LRU (least recently used first)
    return Array.from(this.cache.entries()).sort((a, b) => {
      return a[1].accessOrder - b[1].accessOrder;
    });
  }

  private cleanup(): void {
    try {
      const now = Date.now();
      const expiredKeys: string[] = [];

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
    } catch (error) {
      this.logger.error('Error during cleanup', { error });
    }
  }
}