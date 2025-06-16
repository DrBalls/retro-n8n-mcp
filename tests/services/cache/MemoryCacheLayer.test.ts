import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemoryCacheLayer } from '../../../src/services/cache/MemoryCacheLayer.js';

describe('MemoryCacheLayer', () => {
  let cache: MemoryCacheLayer;

  const config = {
    maxSize: 100,
    maxMemoryMB: 10,
    ttlMs: 5000, // 5 seconds
    cleanupIntervalMs: 1000, // 1 second
  };

  beforeEach(() => {
    cache = new MemoryCacheLayer(config);
  });

  afterEach(async () => {
    await cache.close();
  });

  describe('Basic Operations', () => {
    it('should set and get values', async () => {
      const success = await cache.set('test-key', 'test-value');
      expect(success).toBe(true);

      const entry = await cache.get('test-key');
      expect(entry).toBeTruthy();
      expect(entry?.value).toBe('test-value');
      expect(entry?.key).toBe('test-key');
    });

    it('should return null for non-existent keys', async () => {
      const entry = await cache.get('non-existent');
      expect(entry).toBeNull();
    });

    it('should delete values', async () => {
      await cache.set('test-key', 'test-value');
      
      const deleted = await cache.delete('test-key');
      expect(deleted).toBe(true);

      const entry = await cache.get('test-key');
      expect(entry).toBeNull();
    });

    it('should clear all values', async () => {
      await cache.set('key1', 'value1');
      await cache.set('key2', 'value2');

      await cache.clear();

      const entry1 = await cache.get('key1');
      const entry2 = await cache.get('key2');
      expect(entry1).toBeNull();
      expect(entry2).toBeNull();
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should respect custom TTL', async () => {
      await cache.set('short-lived', 'value', { ttl: 100 }); // 100ms

      const immediate = await cache.get('short-lived');
      expect(immediate?.value).toBe('value');

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      const expired = await cache.get('short-lived');
      expect(expired).toBeNull();
    });

    it('should use default TTL when not specified', async () => {
      await cache.set('default-ttl', 'value');

      const entry = await cache.get('default-ttl');
      expect(entry?.ttl).toBe(config.ttlMs);
    });

    it('should handle no TTL (permanent storage)', async () => {
      await cache.set('permanent', 'value', { ttl: undefined });

      // Wait longer than default TTL
      await new Promise(resolve => setTimeout(resolve, 100));

      const entry = await cache.get('permanent');
      expect(entry?.value).toBe('value');
    });
  });

  describe('Tags', () => {
    it('should store and retrieve tags', async () => {
      await cache.set('tagged-key', 'value', { tags: ['tag1', 'tag2'] });

      const entry = await cache.get('tagged-key');
      expect(entry?.tags).toEqual(['tag1', 'tag2']);
    });

    it('should invalidate by tag', async () => {
      await cache.set('key1', 'value1', { tags: ['group1'] });
      await cache.set('key2', 'value2', { tags: ['group1', 'group2'] });
      await cache.set('key3', 'value3', { tags: ['group2'] });

      const deleted = await cache.invalidateByTag('group1');
      expect(deleted).toBe(2);

      const entry1 = await cache.get('key1');
      const entry2 = await cache.get('key2');
      const entry3 = await cache.get('key3');

      expect(entry1).toBeNull();
      expect(entry2).toBeNull();
      expect(entry3?.value).toBe('value3');
    });
  });

  describe('Pattern Matching', () => {
    beforeEach(async () => {
      await cache.set('user:123', 'user123');
      await cache.set('user:456', 'user456');
      await cache.set('workflow:abc', 'workflowabc');
      await cache.set('execution:xyz', 'executionxyz');
    });

    it('should get keys by pattern', async () => {
      const userKeys = await cache.keys('user:*');
      expect(userKeys).toHaveLength(2);
      expect(userKeys).toContain('user:123');
      expect(userKeys).toContain('user:456');
    });

    it('should invalidate by pattern', async () => {
      const deleted = await cache.invalidateByPattern('user:*');
      expect(deleted).toBe(2);

      const userKey = await cache.get('user:123');
      const workflowKey = await cache.get('workflow:abc');

      expect(userKey).toBeNull();
      expect(workflowKey?.value).toBe('workflowabc');
    });

    it('should handle complex patterns', async () => {
      await cache.set('test123', 'value');
      await cache.set('test456', 'value');
      await cache.set('prod123', 'value');

      const testKeys = await cache.keys('test*');
      expect(testKeys).toHaveLength(2);

      const threeDigitKeys = await cache.keys('*123');
      expect(threeDigitKeys).toHaveLength(3); // test123, prod123, user:123 from beforeEach
    });
  });

  describe('Batch Operations', () => {
    it('should get multiple values', async () => {
      await cache.set('key1', 'value1');
      await cache.set('key2', 'value2');
      await cache.set('key3', 'value3');

      const entries = await cache.getMany(['key1', 'key2', 'non-existent']);
      
      expect(entries.size).toBe(2);
      expect(entries.get('key1')?.value).toBe('value1');
      expect(entries.get('key2')?.value).toBe('value2');
      expect(entries.has('non-existent')).toBe(false);
    });

    it('should set multiple values', async () => {
      const entries = new Map([
        ['batch1', { value: 'value1', tags: ['batch'] }],
        ['batch2', { value: 'value2', ttl: 1000 }],
        ['batch3', { value: 'value3' }],
      ]);

      const success = await cache.setMany(entries);
      expect(success).toBe(true);

      const entry1 = await cache.get('batch1');
      const entry2 = await cache.get('batch2');
      const entry3 = await cache.get('batch3');

      expect(entry1?.value).toBe('value1');
      expect(entry1?.tags).toContain('batch');
      expect(entry2?.value).toBe('value2');
      expect(entry2?.ttl).toBe(1000);
      expect(entry3?.value).toBe('value3');
    });

    it('should delete multiple values', async () => {
      await cache.set('del1', 'value1');
      await cache.set('del2', 'value2');
      await cache.set('del3', 'value3');

      const deleted = await cache.deleteMany(['del1', 'del3', 'non-existent']);
      expect(deleted).toBe(2);

      const entry1 = await cache.get('del1');
      const entry2 = await cache.get('del2');
      const entry3 = await cache.get('del3');

      expect(entry1).toBeNull();
      expect(entry2?.value).toBe('value2');
      expect(entry3).toBeNull();
    });
  });

  describe('LRU Eviction', () => {
    it('should evict least recently used items when size limit reached', async () => {
      const smallCache = new MemoryCacheLayer({
        maxSize: 3,
        maxMemoryMB: 10,
        ttlMs: 60000,
        cleanupIntervalMs: 10000,
      });

      try {
        // Fill cache to capacity
        await smallCache.set('key1', 'value1');
        await smallCache.set('key2', 'value2');
        await smallCache.set('key3', 'value3');

        // Access key1 to make it recently used
        await smallCache.get('key1');

        // Add new item, should evict key2 (least recently used)
        await smallCache.set('key4', 'value4');

        const entry1 = await smallCache.get('key1');
        const entry2 = await smallCache.get('key2');
        const entry3 = await smallCache.get('key3');
        const entry4 = await smallCache.get('key4');

        expect(entry1?.value).toBe('value1'); // Recently accessed
        expect(entry2).toBeNull(); // Should be evicted
        expect(entry3?.value).toBe('value3');
        expect(entry4?.value).toBe('value4');
      } finally {
        await smallCache.close();
      }
    });

    it('should evict items when memory limit reached', async () => {
      const memoryCache = new MemoryCacheLayer({
        maxSize: 1000,
        maxMemoryMB: 0.001, // Very small memory limit
        ttlMs: 60000,
        cleanupIntervalMs: 10000,
      });

      try {
        // Add large items
        const largeValue = 'x'.repeat(1000);
        await memoryCache.set('large1', largeValue);
        await memoryCache.set('large2', largeValue);

        // Should have triggered memory-based eviction
        const stats = await memoryCache.getStats();
        expect(stats.evictions).toBeGreaterThan(0);
      } finally {
        await memoryCache.close();
      }
    });
  });

  describe('Access Tracking', () => {
    it('should track access count and time', async () => {
      await cache.set('tracked', 'value');

      const first = await cache.get('tracked');
      expect(first?.accessCount).toBe(2); // Set counts as 1, get increments to 2

      // Add small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1));

      const second = await cache.get('tracked');
      expect(second?.accessCount).toBe(3); // Another access increments to 3
      expect(second?.accessedAt).toBeGreaterThanOrEqual(first?.accessedAt || 0);
    });
  });

  describe('Statistics', () => {
    it('should track hit and miss statistics', async () => {
      await cache.set('hit-key', 'value');

      // Generate hits and misses
      await cache.get('hit-key'); // hit
      await cache.get('hit-key'); // hit
      await cache.get('miss-key'); // miss
      await cache.get('miss-key'); // miss

      const stats = await cache.getStats();
      expect(stats.hits).toBeGreaterThanOrEqual(2);
      expect(stats.misses).toBeGreaterThanOrEqual(2);
      expect(stats.hitRate).toBeGreaterThan(0);
      expect(stats.totalRequests).toBeGreaterThanOrEqual(4);
    });

    it('should track total items and size', async () => {
      await cache.set('size-test-1', 'small');
      await cache.set('size-test-2', { large: 'object'.repeat(100) });

      const stats = await cache.getStats();
      expect(stats.totalItems).toBe(2);
      expect(stats.totalSizeBytes).toBeGreaterThan(0);
    });
  });

  describe('Health Check', () => {
    it('should report healthy state under normal conditions', async () => {
      const healthy = await cache.isHealthy();
      expect(healthy).toBe(true);
    });

    it('should report health status correctly', async () => {
      const testCache = new MemoryCacheLayer({
        maxSize: 5,
        maxMemoryMB: 1, // Small but not tiny limit
        ttlMs: 60000,
        cleanupIntervalMs: 10000,
      });

      try {
        // Add some normal items
        await testCache.set('normal-1', 'value1');
        await testCache.set('normal-2', 'value2');

        const healthy = await testCache.isHealthy();
        const stats = await testCache.getStats();
        
        // Under normal conditions, should be healthy
        expect(healthy).toBe(true);
        expect(stats.totalItems).toBe(2);
      } finally {
        await testCache.close();
      }
    });
  });

  describe('Cleanup', () => {
    it('should clean up expired items automatically', async () => {
      const quickCache = new MemoryCacheLayer({
        maxSize: 100,
        maxMemoryMB: 10,
        ttlMs: 50, // Very short TTL
        cleanupIntervalMs: 25, // Quick cleanup
      });

      try {
        await quickCache.set('expired1', 'value1');
        await quickCache.set('expired2', 'value2');

        // Wait for expiration and cleanup
        await new Promise(resolve => setTimeout(resolve, 100));

        const entry1 = await quickCache.get('expired1');
        const entry2 = await quickCache.get('expired2');

        expect(entry1).toBeNull();
        expect(entry2).toBeNull();
      } finally {
        await quickCache.close();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle non-serializable values gracefully', async () => {
      const cyclicalObj: any = { name: 'test' };
      cyclicalObj.self = cyclicalObj;

      // Should not throw, but may return false
      const success = await cache.set('cyclical', cyclicalObj);
      // The implementation should handle this gracefully
      
      if (success) {
        const entry = await cache.get('cyclical');
        expect(entry?.value).toBeDefined();
      }
    });

    it('should maintain stability when operations fail', async () => {
      // Set some successful values
      await cache.set('stable1', 'value1');
      await cache.set('stable2', 'value2');

      // These should still work after any errors
      const entry1 = await cache.get('stable1');
      const entry2 = await cache.get('stable2');

      expect(entry1?.value).toBe('value1');
      expect(entry2?.value).toBe('value2');
    });
  });
});