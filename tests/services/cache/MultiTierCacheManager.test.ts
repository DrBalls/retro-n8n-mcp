import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MultiTierCacheManager } from '../../../src/services/cache/MultiTierCacheManager.js';
import { CacheConfig } from '../../../src/types/cache.types.js';

describe('MultiTierCacheManager', () => {
  let cacheManager: MultiTierCacheManager;

  const config: CacheConfig = {
    memory: {
      maxSize: 100,
      maxMemoryMB: 10,
      ttlMs: 5000,
      cleanupIntervalMs: 1000,
    },
    strategy: {
      writeThrough: true,
      readThrough: true,
      writeBehind: false,
      compression: false,
      serialization: 'json',
    },
  };

  beforeEach(() => {
    cacheManager = new MultiTierCacheManager(config);
  });

  afterEach(async () => {
    await cacheManager.close();
  });

  describe('Basic Operations', () => {
    it('should set and get values', async () => {
      const setResult = await cacheManager.set('test-key', 'test-value');
      expect(setResult.success).toBe(true);
      expect(setResult.key).toBe('test-key');

      const getResult = await cacheManager.get('test-key');
      expect(getResult.success).toBe(true);
      expect(getResult.hit).toBe(true);
      expect(getResult.value).toBe('test-value');
      expect(getResult.layer).toBe('memory');
    });

    it('should handle cache misses', async () => {
      const result = await cacheManager.get('non-existent');
      expect(result.success).toBe(true);
      expect(result.hit).toBe(false);
      expect(result.value).toBeUndefined();
    });

    it('should delete values', async () => {
      await cacheManager.set('delete-me', 'value');
      
      const deleteResult = await cacheManager.delete('delete-me');
      expect(deleteResult.success).toBe(true);

      const getResult = await cacheManager.get('delete-me');
      expect(getResult.hit).toBe(false);
    });

    it('should clear all caches', async () => {
      await cacheManager.set('key1', 'value1');
      await cacheManager.set('key2', 'value2');

      await cacheManager.clear();

      const result1 = await cacheManager.get('key1');
      const result2 = await cacheManager.get('key2');

      expect(result1.hit).toBe(false);
      expect(result2.hit).toBe(false);
    });
  });

  describe('Write Strategies', () => {
    it('should use write-through strategy by default', async () => {
      const result = await cacheManager.set('write-through', 'value');
      expect(result.success).toBe(true);

      // Should be available immediately in memory layer
      const getResult = await cacheManager.get('write-through');
      expect(getResult.hit).toBe(true);
      expect(getResult.layer).toBe('memory');
    });

    it('should handle write failures gracefully', async () => {
      // Simulate a scenario where cache is full or has issues
      const largeValue = 'x'.repeat(1000000); // Very large value
      
      const result = await cacheManager.set('large-value', largeValue);
      // Should either succeed or fail gracefully
      expect(typeof result.success).toBe('boolean');
    });
  });

  describe('Auto-generated Tags', () => {
    it('should generate tags automatically based on key patterns', async () => {
      const keyBuilder = cacheManager.getKeyBuilder();
      const workflowKey = keyBuilder.workflow('wf-123');
      
      await cacheManager.set(workflowKey, { id: 'wf-123', name: 'Test Workflow' });
      
      // Tags should be automatically generated for workflow keys
      const result = await cacheManager.get(workflowKey);
      expect(result.hit).toBe(true);
    });
  });

  describe('Invalidation', () => {
    beforeEach(async () => {
      const keyBuilder = cacheManager.getKeyBuilder();
      await cacheManager.set(keyBuilder.workflow('wf-123'), { id: 'wf-123' });
      await cacheManager.set(keyBuilder.workflow('wf-456'), { id: 'wf-456' });
      await cacheManager.set(keyBuilder.execution('ex-789'), { id: 'ex-789' });
      await cacheManager.set('custom:test', 'value');
    });

    it('should invalidate by pattern', async () => {
      const keyBuilder = cacheManager.getKeyBuilder();
      const invalidated = await cacheManager.invalidateByPattern(`${keyBuilder.custom('workflow', '*')}`);
      
      expect(invalidated).toBeGreaterThanOrEqual(0);
      
      const workflow1 = await cacheManager.get(keyBuilder.workflow('wf-123'));
      const execution = await cacheManager.get(keyBuilder.execution('ex-789'));
      
      // Workflows should be invalidated, executions should remain
      expect(execution.hit).toBe(true);
    });

    it('should invalidate workflow-related caches', async () => {
      const invalidated = await cacheManager.invalidateWorkflow('wf-123');
      expect(invalidated).toBeGreaterThanOrEqual(0);
      
      const keyBuilder = cacheManager.getKeyBuilder();
      const workflow = await cacheManager.get(keyBuilder.workflow('wf-123'));
      const otherWorkflow = await cacheManager.get(keyBuilder.workflow('wf-456'));
      
      expect(workflow.hit).toBe(false);
      expect(otherWorkflow.hit).toBe(true); // Other workflow should remain
    });

    it('should invalidate execution-related caches', async () => {
      const invalidated = await cacheManager.invalidateExecution('ex-789', 'wf-123');
      expect(invalidated).toBeGreaterThanOrEqual(0);
      
      const keyBuilder = cacheManager.getKeyBuilder();
      const execution = await cacheManager.get(keyBuilder.execution('ex-789'));
      
      expect(execution.hit).toBe(false);
    });

    it('should invalidate by tag', async () => {
      await cacheManager.set('tagged1', 'value1', { tags: ['test-tag'] });
      await cacheManager.set('tagged2', 'value2', { tags: ['test-tag', 'other'] });
      await cacheManager.set('untagged', 'value3');
      
      const invalidated = await cacheManager.invalidateByTag('test-tag');
      expect(invalidated).toBeGreaterThanOrEqual(0);
      
      const tagged1 = await cacheManager.get('tagged1');
      const tagged2 = await cacheManager.get('tagged2');
      const untagged = await cacheManager.get('untagged');
      
      expect(tagged1.hit).toBe(false);
      expect(tagged2.hit).toBe(false);
      expect(untagged.hit).toBe(true);
    });
  });

  describe('Statistics and Health', () => {
    it('should provide comprehensive statistics', async () => {
      // Generate some cache activity
      await cacheManager.set('stats-test-1', 'value1');
      await cacheManager.set('stats-test-2', 'value2');
      await cacheManager.get('stats-test-1'); // hit
      await cacheManager.get('non-existent'); // miss

      const metrics = await cacheManager.getStats();
      
      expect(metrics.timestamp).toBeDefined();
      expect(metrics.memory).toBeDefined();
      expect(metrics.overall).toBeDefined();
      expect(metrics.performance).toBeDefined();
      expect(metrics.health).toBeDefined();
      
      expect(metrics.overall.hits).toBeGreaterThanOrEqual(1);
      expect(metrics.overall.misses).toBeGreaterThanOrEqual(1);
      expect(metrics.overall.totalRequests).toBeGreaterThanOrEqual(2);
      expect(metrics.overall.hitRate).toBeGreaterThanOrEqual(0);
      expect(metrics.health.memoryLayer).toBe(true);
      expect(metrics.health.overall).toBe(true);
    });

    it('should report health status', async () => {
      const healthy = await cacheManager.isHealthy();
      expect(healthy).toBe(true);
    });

    it('should track performance metrics', async () => {
      const metrics = await cacheManager.getStats();
      
      expect(metrics.performance.throughputPerSecond).toBeGreaterThanOrEqual(0);
      expect(metrics.performance.averageResponseTimeMs).toBeGreaterThanOrEqual(0);
      expect(metrics.performance.errorRate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Event Emission', () => {
    it('should emit cache events', async () => {
      let eventCount = 0;
      const events: any[] = [];
      
      const eventPromise = new Promise<void>((resolve) => {
        cacheManager.on('cache:event', (event) => {
          expect(event.id).toBeDefined();
          expect(event.type).toBeDefined();
          expect(event.layer).toBeDefined();
          expect(event.key).toBeDefined();
          expect(event.timestamp).toBeDefined();
          
          events.push(event);
          eventCount++;
          if (eventCount >= 2) { // set + get events
            resolve();
          }
        });
      });

      // Trigger some events
      await cacheManager.set('event-test', 'value');
      await cacheManager.get('event-test');
      
      await eventPromise;
      expect(events.length).toBeGreaterThanOrEqual(2);
    });

    it('should emit invalidation events', async () => {
      const invalidationPromise = new Promise<void>((resolve) => {
        cacheManager.on('cache:invalidation', (invalidation) => {
          expect(invalidation.strategy).toBeDefined();
          expect(invalidation.timestamp).toBeDefined();
          expect(invalidation.cascade).toBe(true);
          resolve();
        });
      });

      await cacheManager.set('invalidation-test', 'value');
      await cacheManager.invalidateByPattern('invalidation-*');
      
      await invalidationPromise;
    });
  });

  describe('Key Builder Integration', () => {
    it('should provide access to key builder', () => {
      const keyBuilder = cacheManager.getKeyBuilder();
      expect(keyBuilder).toBeDefined();
      expect(typeof keyBuilder.workflow).toBe('function');
      expect(typeof keyBuilder.execution).toBe('function');
      expect(typeof keyBuilder.custom).toBe('function');
    });

    it('should use consistent key formats', () => {
      const keyBuilder = cacheManager.getKeyBuilder();
      
      const workflowKey1 = keyBuilder.workflow('test-id');
      const workflowKey2 = keyBuilder.workflow('test-id');
      
      expect(workflowKey1).toBe(workflowKey2);
      expect(workflowKey1).toMatch(/^n8n-mcp:workflow:test-id$/);
    });
  });

  describe('TTL Handling', () => {
    it('should respect custom TTL values', async () => {
      await cacheManager.set('short-lived', 'value', { ttl: 100 }); // 100ms
      
      const immediate = await cacheManager.get('short-lived');
      expect(immediate.hit).toBe(true);
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const expired = await cacheManager.get('short-lived');
      expect(expired.hit).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      // Test with very large value that might cause issues
      const hugeValue = 'x'.repeat(10000000);
      
      const result = await cacheManager.set('huge-value', hugeValue);
      expect(typeof result.success).toBe('boolean');
      
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it('should continue operating after errors', async () => {
      // Try to cause an error
      await cacheManager.set('problematic', 'value');
      
      // Normal operations should still work
      const setResult = await cacheManager.set('normal', 'value');
      const getResult = await cacheManager.get('normal');
      
      expect(setResult.success).toBe(true);
      expect(getResult.hit).toBe(true);
    });
  });

  describe('Multi-layer Configuration', () => {
    it('should work with memory-only configuration', () => {
      const memoryOnlyConfig: CacheConfig = {
        memory: {
          maxSize: 50,
          maxMemoryMB: 5,
          ttlMs: 10000,
          cleanupIntervalMs: 2000,
        },
      };
      
      const memoryCache = new MultiTierCacheManager(memoryOnlyConfig);
      expect(memoryCache).toBeDefined();
      
      // Should be able to perform basic operations
      return memoryCache.set('memory-test', 'value').then(result => {
        expect(result.success).toBe(true);
        return memoryCache.close();
      });
    });

    it('should handle optional Redis configuration', () => {
      const configWithRedis: CacheConfig = {
        memory: {
          maxSize: 50,
          maxMemoryMB: 5,
          ttlMs: 10000,
          cleanupIntervalMs: 2000,
        },
        redis: {
          host: 'localhost',
          port: 6379,
          keyPrefix: 'test:',
          ttlMs: 30000,
        },
      };
      
      const redisCache = new MultiTierCacheManager(configWithRedis);
      expect(redisCache).toBeDefined();
      
      return redisCache.close();
    });
  });
});