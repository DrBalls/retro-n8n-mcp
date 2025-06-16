import { 
  ICacheLayer, 
  CacheEntry, 
  CacheStats, 
  CacheConfig, 
  CacheOperationResult,
  CacheInvalidation,
  CacheMetrics,
  CacheEvent
} from '../../types/cache.types.js';
import { CacheKeyBuilder } from './CacheKeyBuilder.js';
import { MemoryCacheLayer } from './MemoryCacheLayer.js';
import { RedisCacheLayer } from './RedisCacheLayer.js';
import { DatabaseCacheLayer } from './DatabaseCacheLayer.js';
import { Logger } from '../../utils/Logger.js';
import { EventEmitter } from 'events';

/**
 * Multi-tier cache manager that orchestrates memory, Redis, and database cache layers
 */
export class MultiTierCacheManager extends EventEmitter {
  private readonly logger = new Logger('MultiTierCacheManager');
  private readonly config: CacheConfig;
  private readonly keyBuilder: CacheKeyBuilder;
  
  private memoryLayer?: MemoryCacheLayer;
  private redisLayer?: RedisCacheLayer;
  private databaseLayer?: DatabaseCacheLayer;
  
  private readonly layers: ICacheLayer[] = [];
  private isInitialized = false;
  
  // Performance tracking
  private globalStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    invalidations: 0,
    errors: 0,
  };

  constructor(config: CacheConfig) {
    super();
    this.config = config;
    this.keyBuilder = new CacheKeyBuilder();
    
    this.initializeLayers();
    this.logger.info('Multi-tier cache manager initialized', {
      layers: this.layers.map(l => l.name),
    });
  }

  private initializeLayers(): void {
    try {
      // Initialize memory layer (always enabled)
      if (this.config.memory) {
        this.memoryLayer = new MemoryCacheLayer(this.config.memory);
        this.layers.push(this.memoryLayer);
      }

      // Initialize Redis layer (optional)
      if (this.config.redis) {
        this.redisLayer = new RedisCacheLayer(this.config.redis);
        this.layers.push(this.redisLayer);
      }

      // Initialize database layer (optional)
      if (this.config.database && this.config.database.enabled) {
        this.databaseLayer = new DatabaseCacheLayer(this.config.database);
        this.layers.push(this.databaseLayer);
      }

      this.isInitialized = true;
    } catch (error) {
      this.logger.error('Failed to initialize cache layers', { error });
      throw error;
    }
  }

  /**
   * Get value from cache, checking layers in order (memory -> Redis -> database)
   */
  async get(key: string): Promise<CacheOperationResult> {
    const startTime = Date.now();
    
    try {
      for (const layer of this.layers) {
        const entry = await layer.get(key);
        if (entry) {
          const latency = Date.now() - startTime;
          
          // Promote to higher layers if using read-through strategy
          if (this.config.strategy?.readThrough) {
            await this.promoteToHigherLayers(key, entry, layer);
          }

          this.globalStats.hits++;
          this.emitCacheEvent('hit', layer.name, key, entry.value, latency);
          
          return {
            success: true,
            key,
            value: entry.value,
            hit: true,
            layer: layer.name as any,
            latencyMs: latency,
          };
        }
      }

      // Cache miss
      const latency = Date.now() - startTime;
      this.globalStats.misses++;
      this.emitCacheEvent('miss', 'memory', key, undefined, latency);
      
      return {
        success: true,
        key,
        hit: false,
        latencyMs: latency,
      };
    } catch (error) {
      this.globalStats.errors++;
      this.logger.error('Error getting cache entry', { key, error });
      
      return {
        success: false,
        key,
        hit: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Set value in cache, using write strategy (write-through, write-behind, etc.)
   */
  async set(key: string, value: unknown, options?: { ttl?: number; tags?: string[] }): Promise<CacheOperationResult> {
    const startTime = Date.now();
    
    try {
      const tags = options?.tags || this.keyBuilder.generateTags(key);
      const setOptions = { ...options, tags };

      if (this.config.strategy?.writeThrough) {
        // Write to all layers simultaneously
        const promises = this.layers.map(layer => 
          layer.set(key, value, setOptions).catch(error => {
            this.logger.warn(`Failed to write to ${layer.name} layer`, { key, error });
            return false;
          })
        );
        
        const results = await Promise.all(promises);
        const successCount = results.filter(Boolean).length;
        
        if (successCount === 0) {
          throw new Error('Failed to write to any cache layer');
        }
        
        this.globalStats.sets++;
        this.emitCacheEvent('set', 'multi', key, value, Date.now() - startTime);
        
        return {
          success: true,
          key,
          value,
          latencyMs: Date.now() - startTime,
        };
      } else {
        // Write to first available layer only
        for (const layer of this.layers) {
          const success = await layer.set(key, value, setOptions);
          if (success) {
            this.globalStats.sets++;
            this.emitCacheEvent('set', layer.name, key, value, Date.now() - startTime);
            
            // Optionally write to other layers asynchronously (write-behind)
            if (this.config.strategy?.writeBehind) {
              this.writeBehindToOtherLayers(key, value, setOptions, layer);
            }
            
            return {
              success: true,
              key,
              value,
              layer: layer.name as any,
              latencyMs: Date.now() - startTime,
            };
          }
        }
        
        throw new Error('Failed to write to any cache layer');
      }
    } catch (error) {
      this.globalStats.errors++;
      this.logger.error('Error setting cache entry', { key, error });
      
      return {
        success: false,
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete value from cache across all layers
   */
  async delete(key: string): Promise<CacheOperationResult> {
    const startTime = Date.now();
    
    try {
      const promises = this.layers.map(layer => 
        layer.delete(key).catch(error => {
          this.logger.warn(`Failed to delete from ${layer.name} layer`, { key, error });
          return false;
        })
      );
      
      const results = await Promise.all(promises);
      const deletedCount = results.filter(Boolean).length;
      
      this.globalStats.deletes++;
      this.emitCacheEvent('delete', 'multi', key, undefined, Date.now() - startTime);
      
      return {
        success: true,
        key,
        latencyMs: Date.now() - startTime,
      };
    } catch (error) {
      this.globalStats.errors++;
      this.logger.error('Error deleting cache entry', { key, error });
      
      return {
        success: false,
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Clear all cache layers
   */
  async clear(): Promise<void> {
    const promises = this.layers.map(layer => 
      layer.clear().catch(error => {
        this.logger.warn(`Failed to clear ${layer.name} layer`, { error });
      })
    );
    
    await Promise.all(promises);
    this.logger.info('All cache layers cleared');
  }

  /**
   * Invalidate cache entries by pattern
   */
  async invalidateByPattern(pattern: string, reason?: string): Promise<number> {
    try {
      const promises = this.layers.map(layer => 
        layer.invalidateByPattern(pattern).catch(error => {
          this.logger.warn(`Failed to invalidate by pattern in ${layer.name} layer`, { pattern, error });
          return 0;
        })
      );
      
      const results = await Promise.all(promises);
      const totalInvalidated = results.reduce((sum, count) => sum + count, 0);
      
      this.globalStats.invalidations++;
      this.emitInvalidationEvent('pattern', pattern, reason);
      
      this.logger.info('Cache invalidated by pattern', {
        pattern,
        totalInvalidated,
        reason,
      });
      
      return totalInvalidated;
    } catch (error) {
      this.globalStats.errors++;
      this.logger.error('Error invalidating cache by pattern', { pattern, error });
      return 0;
    }
  }

  /**
   * Invalidate cache entries by tag
   */
  async invalidateByTag(tag: string, reason?: string): Promise<number> {
    try {
      const promises = this.layers.map(layer => 
        layer.invalidateByTag(tag).catch(error => {
          this.logger.warn(`Failed to invalidate by tag in ${layer.name} layer`, { tag, error });
          return 0;
        })
      );
      
      const results = await Promise.all(promises);
      const totalInvalidated = results.reduce((sum, count) => sum + count, 0);
      
      this.globalStats.invalidations++;
      this.emitInvalidationEvent('tag', tag, reason);
      
      this.logger.info('Cache invalidated by tag', {
        tag,
        totalInvalidated,
        reason,
      });
      
      return totalInvalidated;
    } catch (error) {
      this.globalStats.errors++;
      this.logger.error('Error invalidating cache by tag', { tag, error });
      return 0;
    }
  }

  /**
   * Invalidate cache entries for a specific workflow
   */
  async invalidateWorkflow(workflowId: string, reason?: string): Promise<number> {
    const patterns = this.keyBuilder.getWorkflowInvalidationPatterns(workflowId);
    let totalInvalidated = 0;
    
    for (const pattern of patterns) {
      totalInvalidated += await this.invalidateByPattern(pattern, reason);
    }
    
    this.logger.info('Workflow cache invalidated', {
      workflowId,
      totalInvalidated,
      reason,
    });
    
    return totalInvalidated;
  }

  /**
   * Invalidate cache entries for a specific execution
   */
  async invalidateExecution(executionId: string, workflowId?: string, reason?: string): Promise<number> {
    const patterns = this.keyBuilder.getExecutionInvalidationPatterns(executionId, workflowId);
    let totalInvalidated = 0;
    
    for (const pattern of patterns) {
      totalInvalidated += await this.invalidateByPattern(pattern, reason);
    }
    
    this.logger.info('Execution cache invalidated', {
      executionId,
      workflowId,
      totalInvalidated,
      reason,
    });
    
    return totalInvalidated;
  }

  /**
   * Get comprehensive cache statistics across all layers
   */
  async getStats(): Promise<CacheMetrics> {
    const layerStats = await Promise.all(
      this.layers.map(async layer => {
        try {
          return await layer.getStats();
        } catch (error) {
          this.logger.warn(`Failed to get stats from ${layer.name} layer`, { error });
          return {
            layer: layer.name as any,
            hits: 0,
            misses: 0,
            hitRate: 0,
            totalRequests: 0,
            totalItems: 0,
            totalSizeBytes: 0,
            averageLatencyMs: 0,
            evictions: 0,
            errors: 0,
            uptime: 0,
          };
        }
      })
    );

    // Calculate overall statistics
    const overall = layerStats.reduce((acc, stats) => ({
      layer: 'overall' as const,
      hits: acc.hits + stats.hits,
      misses: acc.misses + stats.misses,
      hitRate: 0, // Will be calculated below
      totalRequests: acc.totalRequests + stats.totalRequests,
      totalItems: acc.totalItems + stats.totalItems,
      totalSizeBytes: acc.totalSizeBytes + stats.totalSizeBytes,
      averageLatencyMs: acc.averageLatencyMs + stats.averageLatencyMs,
      evictions: acc.evictions + stats.evictions,
      errors: acc.errors + stats.errors,
      uptime: Math.max(acc.uptime, stats.uptime),
    }), {
      layer: 'overall' as const,
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalRequests: 0,
      totalItems: 0,
      totalSizeBytes: 0,
      averageLatencyMs: 0,
      evictions: 0,
      errors: 0,
      uptime: 0,
    });

    // Calculate overall hit rate and average latency
    overall.hitRate = overall.totalRequests > 0 ? (overall.hits / overall.totalRequests) * 100 : 0;
    overall.averageLatencyMs = layerStats.length > 0 ? overall.averageLatencyMs / layerStats.length : 0;

    // Calculate performance metrics
    const performance = {
      throughputPerSecond: overall.uptime > 0 ? (overall.totalRequests / (overall.uptime / 1000)) : 0,
      averageResponseTimeMs: overall.averageLatencyMs,
      p95ResponseTimeMs: overall.averageLatencyMs * 1.5, // Rough estimate
      p99ResponseTimeMs: overall.averageLatencyMs * 2.0, // Rough estimate
      errorRate: overall.totalRequests > 0 ? (overall.errors / overall.totalRequests) * 100 : 0,
    };

    // Check health of each layer
    const health = {
      memoryLayer: this.memoryLayer ? await this.memoryLayer.isHealthy() : false,
      redisLayer: this.redisLayer ? await this.redisLayer.isHealthy() : undefined,
      databaseLayer: this.databaseLayer ? await this.databaseLayer.isHealthy() : undefined,
      overall: false,
    };

    // Overall health is true if at least one layer is healthy
    health.overall = health.memoryLayer || health.redisLayer === true || health.databaseLayer === true;

    return {
      timestamp: Date.now(),
      memory: layerStats.find(s => s.layer === 'memory')!,
      redis: layerStats.find(s => s.layer === 'redis'),
      database: layerStats.find(s => s.layer === 'database'),
      overall,
      performance,
      health,
    };
  }

  /**
   * Check if cache system is healthy
   */
  async isHealthy(): Promise<boolean> {
    try {
      const metrics = await this.getStats();
      return metrics.health.overall;
    } catch {
      return false;
    }
  }

  /**
   * Get cache key builder for consistent key generation
   */
  getKeyBuilder(): CacheKeyBuilder {
    return this.keyBuilder;
  }

  /**
   * Close all cache layers
   */
  async close(): Promise<void> {
    const promises = this.layers.map(layer => 
      layer.close().catch(error => {
        this.logger.warn(`Failed to close ${layer.name} layer`, { error });
      })
    );
    
    await Promise.all(promises);
    this.logger.info('Multi-tier cache manager closed');
  }

  // Private helper methods

  private async promoteToHigherLayers(key: string, entry: CacheEntry, sourceLayer: ICacheLayer): Promise<void> {
    // Promote to layers that come before the source layer
    const sourceIndex = this.layers.indexOf(sourceLayer);
    const higherLayers = this.layers.slice(0, sourceIndex);
    
    const promises = higherLayers.map(layer =>
      layer.set(key, entry.value, { ttl: entry.ttl, tags: entry.tags }).catch(error => {
        this.logger.debug(`Failed to promote to ${layer.name} layer`, { key, error });
      })
    );
    
    await Promise.all(promises);
  }

  private writeBehindToOtherLayers(
    key: string, 
    value: unknown, 
    options: { ttl?: number; tags?: string[] },
    excludeLayer: ICacheLayer
  ): void {
    // Write to other layers asynchronously
    setImmediate(async () => {
      const otherLayers = this.layers.filter(layer => layer !== excludeLayer);
      const promises = otherLayers.map(layer =>
        layer.set(key, value, options).catch(error => {
          this.logger.debug(`Write-behind failed for ${layer.name} layer`, { key, error });
        })
      );
      
      await Promise.all(promises);
    });
  }

  private emitCacheEvent(
    type: 'hit' | 'miss' | 'set' | 'delete' | 'eviction' | 'error',
    layer: string,
    key: string,
    value?: unknown,
    latencyMs?: number,
    error?: string
  ): void {
    const event: CacheEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      layer: layer as any,
      key,
      value,
      timestamp: Date.now(),
      latencyMs,
      error,
    };

    this.emit('cache:event', event);
  }

  private emitInvalidationEvent(strategy: 'key' | 'pattern' | 'tag' | 'all', target?: string, reason?: string): void {
    const invalidation: CacheInvalidation = {
      strategy,
      target,
      cascade: true,
      reason,
      timestamp: Date.now(),
    };

    this.emit('cache:invalidation', invalidation);
  }
}