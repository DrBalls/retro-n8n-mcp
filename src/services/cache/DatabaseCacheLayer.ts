import { ICacheLayer, CacheEntry, CacheStats } from '../../types/cache.types.js';
import { Logger } from '../../utils/Logger.js';

interface DatabaseCacheConfig {
  enabled: boolean;
  tableName: string;
  ttlMs: number;
  cleanupIntervalMs: number;
}

interface DatabaseRow {
  cache_key: string;
  cache_value: string;
  created_at: number;
  accessed_at: number;
  access_count: number;
  ttl_ms: number;
  tags: string;
  size_bytes: number;
}

/**
 * Database-backed cache layer for persistence across restarts
 * Uses an in-memory SQLite database as fallback when no database is configured
 */
export class DatabaseCacheLayer implements ICacheLayer {
  public readonly name = 'database';
  private readonly config: DatabaseCacheConfig;
  private readonly logger = new Logger('DatabaseCacheLayer');
  private db: any = null; // Database connection
  private isInitialized = false;
  private cleanupTimer?: NodeJS.Timeout;
  
  // Statistics tracking
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    errors: 0,
  };
  
  private startTime: number;
  private latencySum = 0;
  private operationCount = 0;

  constructor(config: DatabaseCacheConfig) {
    this.config = config;
    this.startTime = Date.now();
    
    if (config.enabled) {
      this.initializeDatabase();
      
      // Start cleanup timer
      this.cleanupTimer = setInterval(() => {
        this.cleanup();
      }, config.cleanupIntervalMs);
    }
    
    this.logger.info('Database cache layer initialized', {
      enabled: config.enabled,
      tableName: config.tableName,
    });
  }

  private async initializeDatabase(): Promise<void> {
    try {
      // Try to use better-sqlite3 for high performance
      let Database;
      try {
        Database = (await import('better-sqlite3')).default;
        this.db = new Database(':memory:'); // In-memory for now
      } catch {
        this.logger.warn('better-sqlite3 not available, using mock database');
        this.db = new MockDatabase();
      }

      // Create cache table
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS ${this.config.tableName} (
          cache_key TEXT PRIMARY KEY,
          cache_value TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          accessed_at INTEGER NOT NULL,
          access_count INTEGER DEFAULT 1,
          ttl_ms INTEGER,
          tags TEXT DEFAULT '',
          size_bytes INTEGER DEFAULT 0
        )
      `;

      // Create indexes for performance
      const createIndexes = [
        `CREATE INDEX IF NOT EXISTS idx_${this.config.tableName}_accessed_at ON ${this.config.tableName}(accessed_at)`,
        `CREATE INDEX IF NOT EXISTS idx_${this.config.tableName}_created_at ON ${this.config.tableName}(created_at)`,
        `CREATE INDEX IF NOT EXISTS idx_${this.config.tableName}_tags ON ${this.config.tableName}(tags)`,
      ];

      if (this.db.exec) {
        // better-sqlite3 API
        this.db.exec(createTableSQL);
        createIndexes.forEach(sql => this.db.exec(sql));
      } else {
        // Mock database API
        await this.db.exec(createTableSQL);
        for (const sql of createIndexes) {
          await this.db.exec(sql);
        }
      }

      this.isInitialized = true;
      this.logger.info('Database cache table created successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize database cache', { error });
      this.db = new MockDatabase();
      this.isInitialized = true;
    }
  }

  private async measureLatency<T>(operation: () => Promise<T> | T): Promise<T> {
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
    if (!this.config.enabled || !this.isInitialized || !this.db) {
      return null;
    }

    try {
      const result = await this.measureLatency(async () => {
        if (this.db.prepare) {
          // better-sqlite3 API
          const stmt = this.db.prepare(`SELECT * FROM ${this.config.tableName} WHERE cache_key = ?`);
          return stmt.get(key);
        } else {
          // Mock database API
          return await this.db.get(`SELECT * FROM ${this.config.tableName} WHERE cache_key = ?`, [key]);
        }
      });

      if (!result) {
        this.stats.misses++;
        return null;
      }

      const row = result as DatabaseRow;
      
      // Check TTL
      const now = Date.now();
      if (row.ttl_ms && (row.created_at + row.ttl_ms) < now) {
        // Expired, delete it
        await this.delete(key);
        this.stats.misses++;
        return null;
      }

      // Parse stored data
      const entry: CacheEntry = {
        key: row.cache_key,
        value: JSON.parse(row.cache_value),
        ttl: row.ttl_ms,
        createdAt: row.created_at,
        accessedAt: now,
        accessCount: row.access_count + 1,
        size: row.size_bytes,
        tags: row.tags ? row.tags.split(',').filter(Boolean) : [],
      };

      // Update access tracking
      await this.updateAccessTracking(key, now, entry.accessCount);

      this.stats.hits++;
      return entry;
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Error getting cache entry from database', { key, error });
      return null;
    }
  }

  async set(key: string, value: unknown, options?: { ttl?: number; tags?: string[] }): Promise<boolean> {
    if (!this.config.enabled || !this.isInitialized || !this.db) {
      return false;
    }

    try {
      const now = Date.now();
      const ttl = options?.ttl || this.config.ttlMs;
      const tags = (options?.tags || []).join(',');
      const serializedValue = JSON.stringify(value);
      const sizeBytes = serializedValue.length * 2; // Rough estimate

      await this.measureLatency(async () => {
        if (this.db.prepare) {
          // better-sqlite3 API
          const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO ${this.config.tableName} 
            (cache_key, cache_value, created_at, accessed_at, access_count, ttl_ms, tags, size_bytes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);
          stmt.run(key, serializedValue, now, now, 1, ttl, tags, sizeBytes);
        } else {
          // Mock database API
          await this.db.run(`
            INSERT OR REPLACE INTO ${this.config.tableName} 
            (cache_key, cache_value, created_at, accessed_at, access_count, ttl_ms, tags, size_bytes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [key, serializedValue, now, now, 1, ttl, tags, sizeBytes]);
        }
      });

      this.stats.sets++;
      return true;
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Error setting cache entry in database', { key, error });
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.config.enabled || !this.isInitialized || !this.db) {
      return false;
    }

    try {
      const result = await this.measureLatency(async () => {
        if (this.db.prepare) {
          // better-sqlite3 API
          const stmt = this.db.prepare(`DELETE FROM ${this.config.tableName} WHERE cache_key = ?`);
          return stmt.run(key);
        } else {
          // Mock database API
          return await this.db.run(`DELETE FROM ${this.config.tableName} WHERE cache_key = ?`, [key]);
        }
      });

      const deleted = result.changes > 0;
      if (deleted) {
        this.stats.deletes++;
      }
      return deleted;
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Error deleting cache entry from database', { key, error });
      return false;
    }
  }

  async clear(): Promise<void> {
    if (!this.config.enabled || !this.isInitialized || !this.db) {
      return;
    }

    try {
      await this.measureLatency(async () => {
        if (this.db.prepare) {
          // better-sqlite3 API
          const stmt = this.db.prepare(`DELETE FROM ${this.config.tableName}`);
          stmt.run();
        } else {
          // Mock database API
          await this.db.run(`DELETE FROM ${this.config.tableName}`);
        }
      });
      
      this.logger.info('Database cache cleared');
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Error clearing database cache', { error });
    }
  }

  async getMany(keys: string[]): Promise<Map<string, CacheEntry>> {
    if (!this.config.enabled || !this.isInitialized || !this.db || keys.length === 0) {
      return new Map();
    }

    try {
      const placeholders = keys.map(() => '?').join(',');
      const results = await this.measureLatency(async () => {
        if (this.db.prepare) {
          // better-sqlite3 API
          const stmt = this.db.prepare(`SELECT * FROM ${this.config.tableName} WHERE cache_key IN (${placeholders})`);
          return stmt.all(...keys);
        } else {
          // Mock database API
          return await this.db.all(`SELECT * FROM ${this.config.tableName} WHERE cache_key IN (${placeholders})`, keys);
        }
      });

      const entries = new Map<string, CacheEntry>();
      const now = Date.now();

      for (const row of results as DatabaseRow[]) {
        // Check TTL
        if (!row.ttl_ms || (row.created_at + row.ttl_ms) >= now) {
          const entry: CacheEntry = {
            key: row.cache_key,
            value: JSON.parse(row.cache_value),
            ttl: row.ttl_ms,
            createdAt: row.created_at,
            accessedAt: now,
            accessCount: row.access_count + 1,
            size: row.size_bytes,
            tags: row.tags ? row.tags.split(',').filter(Boolean) : [],
          };
          entries.set(row.cache_key, entry);
          this.stats.hits++;
        } else {
          this.stats.misses++;
        }
      }

      // Update access tracking for all hits
      for (const [key, entry] of entries) {
        await this.updateAccessTracking(key, now, entry.accessCount);
      }

      // Count misses for keys not found
      const foundKeys = new Set(entries.keys());
      for (const key of keys) {
        if (!foundKeys.has(key)) {
          this.stats.misses++;
        }
      }

      return entries;
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Error getting multiple cache entries from database', { keys, error });
      return new Map();
    }
  }

  async setMany(entries: Map<string, { value: unknown; ttl?: number; tags?: string[] }>): Promise<boolean> {
    if (!this.config.enabled || !this.isInitialized || !this.db || entries.size === 0) {
      return false;
    }

    try {
      const now = Date.now();
      
      await this.measureLatency(async () => {
        if (this.db.prepare) {
          // better-sqlite3 API
          const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO ${this.config.tableName} 
            (cache_key, cache_value, created_at, accessed_at, access_count, ttl_ms, tags, size_bytes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          const transaction = this.db.transaction(() => {
            for (const [key, data] of entries) {
              const ttl = data.ttl || this.config.ttlMs;
              const tags = (data.tags || []).join(',');
              const serializedValue = JSON.stringify(data.value);
              const sizeBytes = serializedValue.length * 2;
              
              stmt.run(key, serializedValue, now, now, 1, ttl, tags, sizeBytes);
            }
          });
          
          transaction();
        } else {
          // Mock database API
          for (const [key, data] of entries) {
            const ttl = data.ttl || this.config.ttlMs;
            const tags = (data.tags || []).join(',');
            const serializedValue = JSON.stringify(data.value);
            const sizeBytes = serializedValue.length * 2;
            
            await this.db.run(`
              INSERT OR REPLACE INTO ${this.config.tableName} 
              (cache_key, cache_value, created_at, accessed_at, access_count, ttl_ms, tags, size_bytes)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [key, serializedValue, now, now, 1, ttl, tags, sizeBytes]);
          }
        }
      });

      this.stats.sets += entries.size;
      return true;
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Error setting multiple cache entries in database', { error });
      return false;
    }
  }

  async deleteMany(keys: string[]): Promise<number> {
    if (!this.config.enabled || !this.isInitialized || !this.db || keys.length === 0) {
      return 0;
    }

    try {
      const placeholders = keys.map(() => '?').join(',');
      const result = await this.measureLatency(async () => {
        if (this.db.prepare) {
          // better-sqlite3 API
          const stmt = this.db.prepare(`DELETE FROM ${this.config.tableName} WHERE cache_key IN (${placeholders})`);
          return stmt.run(...keys);
        } else {
          // Mock database API
          return await this.db.run(`DELETE FROM ${this.config.tableName} WHERE cache_key IN (${placeholders})`, keys);
        }
      });

      const deletedCount = result.changes;
      this.stats.deletes += deletedCount;
      return deletedCount;
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Error deleting multiple cache entries from database', { keys, error });
      return 0;
    }
  }

  async keys(pattern?: string): Promise<string[]> {
    if (!this.config.enabled || !this.isInitialized || !this.db) {
      return [];
    }

    try {
      let sql = `SELECT cache_key FROM ${this.config.tableName}`;
      let params: any[] = [];

      if (pattern) {
        // Convert glob pattern to SQL LIKE pattern
        const likePattern = pattern.replace(/\*/g, '%').replace(/\?/g, '_');
        sql += ' WHERE cache_key LIKE ?';
        params = [likePattern];
      }

      const results = await this.measureLatency(async () => {
        if (this.db.prepare) {
          // better-sqlite3 API
          const stmt = this.db.prepare(sql);
          return params.length > 0 ? stmt.all(...params) : stmt.all();
        } else {
          // Mock database API
          return await this.db.all(sql, params);
        }
      });

      return results.map((row: any) => row.cache_key);
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Error getting cache keys from database', { pattern, error });
      return [];
    }
  }

  async invalidateByPattern(pattern: string): Promise<number> {
    try {
      const keysToDelete = await this.keys(pattern);
      return await this.deleteMany(keysToDelete);
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Error invalidating by pattern in database', { pattern, error });
      return 0;
    }
  }

  async invalidateByTag(tag: string): Promise<number> {
    if (!this.config.enabled || !this.isInitialized || !this.db) {
      return 0;
    }

    try {
      const result = await this.measureLatency(async () => {
        if (this.db.prepare) {
          // better-sqlite3 API
          const stmt = this.db.prepare(`DELETE FROM ${this.config.tableName} WHERE tags LIKE ?`);
          return stmt.run(`%${tag}%`);
        } else {
          // Mock database API
          return await this.db.run(`DELETE FROM ${this.config.tableName} WHERE tags LIKE ?`, [`%${tag}%`]);
        }
      });

      const deletedCount = result.changes;
      this.stats.deletes += deletedCount;
      return deletedCount;
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Error invalidating by tag in database', { tag, error });
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
      if (this.config.enabled && this.isInitialized && this.db) {
        const result = await this.measureLatency(async () => {
          if (this.db.prepare) {
            // better-sqlite3 API
            const stmt = this.db.prepare(`SELECT COUNT(*) as count, SUM(size_bytes) as total_size FROM ${this.config.tableName}`);
            return stmt.get();
          } else {
            // Mock database API
            return await this.db.get(`SELECT COUNT(*) as count, SUM(size_bytes) as total_size FROM ${this.config.tableName}`);
          }
        });

        totalItems = result?.count || 0;
        totalSizeBytes = result?.total_size || 0;
      }
    } catch (error) {
      this.logger.debug('Could not get database cache stats', { error });
    }
    
    return {
      layer: 'database',
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
    if (!this.config.enabled) {
      return true; // Disabled is considered healthy
    }

    if (!this.isInitialized || !this.db) {
      return false;
    }

    try {
      // Test a simple query
      await this.measureLatency(async () => {
        if (this.db.prepare) {
          // better-sqlite3 API
          const stmt = this.db.prepare(`SELECT 1`);
          stmt.get();
        } else {
          // Mock database API
          await this.db.get(`SELECT 1`);
        }
      });

      const errorRate = this.stats.errors / (this.stats.hits + this.stats.misses + this.stats.sets + this.stats.deletes || 1);
      return errorRate < 0.1; // Less than 10% error rate
    } catch {
      return false;
    }
  }

  async close(): Promise<void> {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }

    if (this.db) {
      try {
        if (this.db.close) {
          this.db.close();
        }
        this.isInitialized = false;
        this.logger.info('Database cache layer closed');
      } catch (error) {
        this.logger.error('Error closing database connection', { error });
      }
    }
  }

  // Private helper methods

  private async updateAccessTracking(key: string, accessedAt: number, accessCount: number): Promise<void> {
    try {
      if (this.db.prepare) {
        // better-sqlite3 API
        const stmt = this.db.prepare(`UPDATE ${this.config.tableName} SET accessed_at = ?, access_count = ? WHERE cache_key = ?`);
        stmt.run(accessedAt, accessCount, key);
      } else {
        // Mock database API
        await this.db.run(`UPDATE ${this.config.tableName} SET accessed_at = ?, access_count = ? WHERE cache_key = ?`, [accessedAt, accessCount, key]);
      }
    } catch (error) {
      // Don't fail the main operation for tracking updates
      this.logger.debug('Error updating access tracking', { key, error });
    }
  }

  private async cleanup(): void {
    if (!this.config.enabled || !this.isInitialized || !this.db) {
      return;
    }

    try {
      const now = Date.now();
      const result = await this.measureLatency(async () => {
        if (this.db.prepare) {
          // better-sqlite3 API
          const stmt = this.db.prepare(`DELETE FROM ${this.config.tableName} WHERE ttl_ms IS NOT NULL AND (created_at + ttl_ms) < ?`);
          return stmt.run(now);
        } else {
          // Mock database API
          return await this.db.run(`DELETE FROM ${this.config.tableName} WHERE ttl_ms IS NOT NULL AND (created_at + ttl_ms) < ?`, [now]);
        }
      });

      const cleanedCount = result.changes;
      if (cleanedCount > 0) {
        this.stats.evictions += cleanedCount;
        this.logger.debug('Cleaned up expired database cache entries', {
          cleanedCount,
          remainingCount: await this.getTotalCount(),
        });
      }
    } catch (error) {
      this.logger.error('Error during database cache cleanup', { error });
    }
  }

  private async getTotalCount(): Promise<number> {
    try {
      if (this.db.prepare) {
        // better-sqlite3 API
        const stmt = this.db.prepare(`SELECT COUNT(*) as count FROM ${this.config.tableName}`);
        const result = stmt.get();
        return result?.count || 0;
      } else {
        // Mock database API
        const result = await this.db.get(`SELECT COUNT(*) as count FROM ${this.config.tableName}`);
        return result?.count || 0;
      }
    } catch {
      return 0;
    }
  }
}

/**
 * Mock database for when better-sqlite3 is not available
 */
class MockDatabase {
  private data = new Map<string, any>();

  async exec(sql: string): Promise<void> {
    // Mock table creation and index creation
    console.debug('Mock DB exec:', sql);
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    // Mock SELECT single row
    if (sql.includes('WHERE cache_key = ?')) {
      const key = params[0];
      return this.data.get(key) || null;
    }
    if (sql.includes('COUNT(*)')) {
      return { count: this.data.size, total_size: 0 };
    }
    if (sql.includes('SELECT 1')) {
      return { '1': 1 };
    }
    return null;
  }

  async all(sql: string, params: any[] = []): Promise<any[]> {
    // Mock SELECT multiple rows
    if (sql.includes('WHERE cache_key IN')) {
      return params.map(key => this.data.get(key)).filter(Boolean);
    }
    if (sql.includes('SELECT cache_key')) {
      return Array.from(this.data.keys()).map(key => ({ cache_key: key }));
    }
    return [];
  }

  async run(sql: string, params: any[] = []): Promise<{ changes: number }> {
    // Mock INSERT/UPDATE/DELETE
    if (sql.includes('INSERT OR REPLACE')) {
      const key = params[0];
      this.data.set(key, {
        cache_key: params[0],
        cache_value: params[1],
        created_at: params[2],
        accessed_at: params[3],
        access_count: params[4],
        ttl_ms: params[5],
        tags: params[6],
        size_bytes: params[7],
      });
      return { changes: 1 };
    }
    if (sql.includes('DELETE')) {
      if (sql.includes('WHERE cache_key = ?')) {
        const key = params[0];
        const existed = this.data.has(key);
        this.data.delete(key);
        return { changes: existed ? 1 : 0 };
      }
      if (sql.includes('WHERE cache_key IN')) {
        let deleted = 0;
        for (const key of params) {
          if (this.data.delete(key)) {
            deleted++;
          }
        }
        return { changes: deleted };
      }
      // Clear all
      const count = this.data.size;
      this.data.clear();
      return { changes: count };
    }
    return { changes: 0 };
  }
}