import { ICacheLayer, CacheEntry, CacheStats } from '../../types/cache.types.js';
import { Logger } from '../../utils/Logger.js';

// Mock Redis interface for when Redis is not available
interface RedisInterface {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { EX?: number }): Promise<string | null>;
  setEx(key: string, seconds: number, value: string): Promise<string>;
  del(...keys: string[]): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  flushDb(): Promise<string>;
  mGet(keys: string[]): Promise<(string | null)[]>;
  mSet(keyValues: [string, string][]): Promise<string>;
  ping(): Promise<string>;
  quit(): Promise<string>;
  info(section?: string): Promise<string>;
  dbSize(): Promise<number>;
  on?(event: string, callback: (error?: any) => void): void;
  connect?(): Promise<void>;
  disconnect?(): Promise<void>;
}

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
export class RedisCacheLayer implements ICacheLayer {
  public readonly name = 'redis';
  private readonly config: RedisCacheConfig;
  private readonly logger = new Logger('RedisCacheLayer');
  private client: RedisInterface | null = null;
  private isConnected = false;
  
  // Statistics tracking
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    errors: 0,
    connectionErrors: 0,
  };
  
  private startTime: number;
  private latencySum = 0;
  private operationCount = 0;

  constructor(config: RedisCacheConfig) {
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

  private async initializeRedisClient(): Promise<void> {
    try {
      // Try to import Redis - it's optional
      let Redis;
      try {
        Redis = (await import('redis')).default;
      } catch {
        this.logger.warn('Redis package not available, using mock implementation');
        this.client = new MockRedisClient();
        this.isConnected = true;
        return;
      }

      // Create Redis client and wrap it to match our interface
      const redisClient = Redis.createClient({
        url: `redis://${this.config.host}:${this.config.port}`,
        password: this.config.password,
        database: this.config.db,
      });
      
      // Wrap the Redis client to match our interface
      this.client = {
        get: (key: string) => redisClient.get(key),
        set: (key: string, value: string, options?: { EX?: number }) => 
          options?.EX ? redisClient.setEx(key, options.EX, value) : redisClient.set(key, value),
        setEx: (key: string, seconds: number, value: string) => redisClient.setEx(key, seconds, value),
        del: (...keys: string[]) => redisClient.del(keys),
        keys: (pattern: string) => redisClient.keys(pattern),
        flushDb: () => redisClient.flushDb(),
        mGet: (keys: string[]) => redisClient.mGet(keys),
        mSet: (keyValues: [string, string][]) => {
          const args: string[] = [];
          keyValues.forEach(([k, v]) => args.push(k, v));
          return redisClient.mSet(args as any);
        },
        ping: () => redisClient.ping(),
        quit: () => redisClient.quit(),
        info: (section?: string) => redisClient.info(section),
        dbSize: () => redisClient.dbSize(),
        on: redisClient.on ? redisClient.on.bind(redisClient) : undefined,
        connect: redisClient.connect ? async () => { await redisClient.connect(); } : undefined,
        disconnect: redisClient.disconnect ? redisClient.disconnect.bind(redisClient) : undefined,
      };

      // Handle connection events
      if (this.client && this.client.on) {
        this.client.on('connect', () => {
          this.isConnected = true;
          this.logger.info('Connected to Redis');
        });

        this.client.on('error', (error: any) => {
          this.isConnected = false;
          this.stats.connectionErrors++;
          this.logger.error('Redis connection error', { error });
        });

        this.client.on('end', () => {
          this.isConnected = false;
          this.logger.warn('Redis connection ended');
        });
      }

      // Connect to Redis
      if (this.client && this.client.connect) {
        await this.client.connect();
        this.isConnected = true;
      }
      
    } catch (error) {
      this.logger.error('Failed to initialize Redis client', { error });
      this.client = new MockRedisClient();
      this.isConnected = true; // Use mock client
    }
  }

  private buildKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }

  private async measureLatency<T>(operation: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      const result = await operation();
      const latency = Date.now() - start;
      this.latencySum += latency;
      this.operationCount++;
      return result;
    } catch (error) {
      this.stats.errors++;
      throw error;
    }
  }

  async get(key: string): Promise<CacheEntry | null> {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const result = await this.measureLatency(async () => {
        return await this.client!.get(this.buildKey(key));
      });

      if (!result) {
        this.stats.misses++;
        return null;
      }

      const entry: CacheEntry = JSON.parse(result);
      
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
      await this.client.set(
        this.buildKey(key),
        JSON.stringify(entry),
        { EX: Math.ceil((entry.ttl || this.config.ttlMs) / 1000) }
      );

      this.stats.hits++;
      return entry;
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Error getting cache entry from Redis', { key, error });
      return null;
    }
  }

  async set(key: string, value: unknown, options?: { ttl?: number; tags?: string[] }): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const now = Date.now();
      const ttl = options?.ttl || this.config.ttlMs;
      const tags = options?.tags || [];

      const entry: CacheEntry = {
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
        return await this.client!.setEx(
          this.buildKey(key),
          Math.ceil(ttl / 1000),
          serialized
        );
      });

      this.stats.sets++;
      return true;
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Error setting cache entry in Redis', { key, error });
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const result = await this.measureLatency(async () => {
        return await this.client!.del(this.buildKey(key));
      });

      const deleted = result > 0;
      if (deleted) {
        this.stats.deletes++;
      }
      return deleted;
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Error deleting cache entry from Redis', { key, error });
      return false;
    }
  }

  async clear(): Promise<void> {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      await this.measureLatency(async () => {
        // Delete all keys with our prefix
        const keys = await this.client!.keys(`${this.config.keyPrefix}*`);
        if (keys.length > 0) {
          await this.client!.del(...keys);
        }
        return keys.length;
      });
      
      this.logger.info('Redis cache cleared');
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Error clearing Redis cache', { error });
    }
  }

  async getMany(keys: string[]): Promise<Map<string, CacheEntry>> {
    if (!this.isConnected || !this.client || keys.length === 0) {
      return new Map();
    }

    try {
      const redisKeys = keys.map(key => this.buildKey(key));
      const results = await this.measureLatency(async () => {
        return await this.client!.mGet(redisKeys);
      });

      const entries = new Map<string, CacheEntry>();
      const now = Date.now();

      for (let i = 0; i < keys.length; i++) {
        const result = results[i];
        if (result) {
          try {
            const entry: CacheEntry = JSON.parse(result);
            
            // Check TTL
            if (!entry.ttl || (entry.createdAt + entry.ttl) >= now) {
              // Update access tracking
              entry.accessedAt = now;
              entry.accessCount = (entry.accessCount || 0) + 1;
              entries.set(keys[i], entry);
              this.stats.hits++;
            } else {
              this.stats.misses++;
            }
          } catch {
            this.stats.misses++;
          }
        } else {
          this.stats.misses++;
        }
      }

      return entries;
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Error getting multiple cache entries from Redis', { keys, error });
      return new Map();
    }
  }

  async setMany(entries: Map<string, { value: unknown; ttl?: number; tags?: string[] }>): Promise<boolean> {
    if (!this.isConnected || !this.client || entries.size === 0) {
      return false;
    }

    try {
      const now = Date.now();
      const keyValues: string[] = [];

      for (const [key, data] of entries) {
        const ttl = data.ttl || this.config.ttlMs;
        const tags = data.tags || [];

        const entry: CacheEntry = {
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
        // Convert array to key-value pairs for mSet
        const pairs: [string, string][] = [];
        for (let i = 0; i < keyValues.length; i += 2) {
          pairs.push([keyValues[i], keyValues[i + 1]]);
        }
        return await this.client!.mSet(pairs);
      });

      // Set TTL for each key (Redis MSET doesn't support TTL)
      const ttlPromises: Promise<any>[] = [];
      for (const [key, data] of entries) {
        const ttl = data.ttl || this.config.ttlMs;
        ttlPromises.push(
          this.client!.setEx(
            this.buildKey(key),
            Math.ceil(ttl / 1000),
            JSON.stringify({
              key,
              value: data.value,
              ttl,
              createdAt: now,
              accessedAt: now,
              accessCount: 1,
              tags: data.tags || [],
            })
          )
        );
      }

      await Promise.all(ttlPromises);
      this.stats.sets += entries.size;
      return true;
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Error setting multiple cache entries in Redis', { error });
      return false;
    }
  }

  async deleteMany(keys: string[]): Promise<number> {
    if (!this.isConnected || !this.client || keys.length === 0) {
      return 0;
    }

    try {
      const redisKeys = keys.map(key => this.buildKey(key));
      const deletedCount = await this.measureLatency(async () => {
        return await this.client!.del(...redisKeys);
      });

      this.stats.deletes += deletedCount;
      return deletedCount;
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Error deleting multiple cache entries from Redis', { keys, error });
      return 0;
    }
  }

  async keys(pattern?: string): Promise<string[]> {
    if (!this.isConnected || !this.client) {
      return [];
    }

    try {
      const searchPattern = pattern 
        ? `${this.config.keyPrefix}${pattern}`
        : `${this.config.keyPrefix}*`;
      
      const redisKeys = await this.measureLatency(async () => {
        return await this.client!.keys(searchPattern);
      });

      // Remove prefix from keys
      return redisKeys.map(key => key.substring(this.config.keyPrefix.length));
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Error getting cache keys from Redis', { pattern, error });
      return [];
    }
  }

  async invalidateByPattern(pattern: string): Promise<number> {
    try {
      const keysToDelete = await this.keys(pattern);
      return await this.deleteMany(keysToDelete);
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Error invalidating by pattern in Redis', { pattern, error });
      return 0;
    }
  }

  async invalidateByTag(tag: string): Promise<number> {
    if (!this.isConnected || !this.client) {
      return 0;
    }

    try {
      // Get all keys and check their tags
      const allKeys = await this.keys();
      const keysToDelete: string[] = [];

      // We need to check each entry for tags
      for (const key of allKeys) {
        const entry = await this.get(key);
        if (entry && entry.tags.includes(tag)) {
          keysToDelete.push(key);
        }
      }

      return await this.deleteMany(keysToDelete);
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Error invalidating by tag in Redis', { tag, error });
      return 0;
    }
  }

  async getStats(): Promise<CacheStats> {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    const averageLatency = this.operationCount > 0 ? this.latencySum / this.operationCount : 0;

    let totalItems = 0;
    let totalSizeBytes = 0;

    try {
      if (this.isConnected && this.client) {
        totalItems = await this.client.dbSize();
        
        // Get memory info if available
        const info = await this.client.info('memory');
        const memoryMatch = info.match(/used_memory:(\d+)/);
        if (memoryMatch) {
          totalSizeBytes = parseInt(memoryMatch[1], 10);
        }
      }
    } catch (error) {
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

  async isHealthy(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      await this.client.ping();
      const errorRate = this.stats.errors / (this.stats.hits + this.stats.misses + this.stats.sets + this.stats.deletes || 1);
      return this.isConnected && errorRate < 0.1; // Less than 10% error rate
    } catch {
      return false;
    }
  }

  async close(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
        this.isConnected = false;
        this.logger.info('Redis cache layer closed');
      } catch (error) {
        this.logger.error('Error closing Redis connection', { error });
      }
    }
  }
}

/**
 * Mock Redis client for when Redis is not available
 */
class MockRedisClient implements RedisInterface {
  private data = new Map<string, string>();
  private expirations = new Map<string, number>();

  async get(key: string): Promise<string | null> {
    const expiration = this.expirations.get(key);
    if (expiration && Date.now() > expiration) {
      this.data.delete(key);
      this.expirations.delete(key);
      return null;
    }
    return this.data.get(key) || null;
  }

  async set(key: string, value: string, options?: { EX?: number }): Promise<string | null> {
    this.data.set(key, value);
    if (options?.EX) {
      this.expirations.set(key, Date.now() + options.EX * 1000);
    }
    return 'OK';
  }

  async setEx(key: string, seconds: number, value: string): Promise<string> {
    this.data.set(key, value);
    this.expirations.set(key, Date.now() + seconds * 1000);
    return 'OK';
  }

  async del(...keys: string[]): Promise<number> {
    let deleted = 0;
    for (const key of keys) {
      if (this.data.delete(key)) {
        deleted++;
      }
      this.expirations.delete(key);
    }
    return deleted;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));
    return Array.from(this.data.keys()).filter(key => regex.test(key));
  }

  async flushDb(): Promise<string> {
    this.data.clear();
    this.expirations.clear();
    return 'OK';
  }

  async mGet(keys: string[]): Promise<(string | null)[]> {
    return Promise.all(keys.map(key => this.get(key)));
  }

  async mSet(keyValues: [string, string][]): Promise<string> {
    for (const [key, value] of keyValues) {
      this.data.set(key, value);
    }
    return 'OK';
  }

  async ping(): Promise<string> {
    return 'PONG';
  }

  async quit(): Promise<string> {
    return 'OK';
  }

  async info(section?: string): Promise<string> {
    return 'used_memory:1024\nconnected_clients:1';
  }

  async dbSize(): Promise<number> {
    return this.data.size;
  }
}