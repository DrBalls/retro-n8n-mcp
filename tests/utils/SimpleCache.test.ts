import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SimpleCache } from '../../src/utils/SimpleCache.js';

describe('SimpleCache', () => {
  let cache: SimpleCache<string>;

  beforeEach(() => {
    cache = new SimpleCache({
      maxSize: 3,
      defaultTtl: 1000,
    });
  });

  it('should store and retrieve values', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    
    expect(cache.get('key1')).toBe('value1');
    expect(cache.get('key2')).toBe('value2');
    expect(cache.get('key3')).toBeUndefined();
  });

  it('should respect TTL', async () => {
    cache.set('key1', 'value1', 100); // 100ms TTL
    
    expect(cache.get('key1')).toBe('value1');
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 150));
    
    expect(cache.get('key1')).toBeUndefined();
  });

  it('should evict oldest entry when full', () => {
    // Fill cache
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');
    
    expect(cache.size).toBe(3);
    
    // Add one more
    cache.set('key4', 'value4');
    
    // Oldest should be evicted
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBe('value2');
    expect(cache.get('key3')).toBe('value3');
    expect(cache.get('key4')).toBe('value4');
    expect(cache.size).toBe(3);
  });

  it('should update existing entries without eviction', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');
    
    // Update existing
    cache.set('key2', 'updated');
    
    expect(cache.get('key1')).toBe('value1');
    expect(cache.get('key2')).toBe('updated');
    expect(cache.get('key3')).toBe('value3');
    expect(cache.size).toBe(3);
  });

  it('should handle has() method correctly', () => {
    cache.set('key1', 'value1', 100);
    
    expect(cache.has('key1')).toBe(true);
    expect(cache.has('key2')).toBe(false);
  });

  it('should delete entries', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    
    expect(cache.delete('key1')).toBe(true);
    expect(cache.delete('key1')).toBe(false); // Already deleted
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBe('value2');
  });

  it('should clear all entries', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');
    
    cache.clear();
    
    expect(cache.size).toBe(0);
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBeUndefined();
    expect(cache.get('key3')).toBeUndefined();
  });

  it('should cleanup expired entries', async () => {
    cache.set('key1', 'value1', 50);
    cache.set('key2', 'value2', 100);
    cache.set('key3', 'value3', 200);
    
    await new Promise(resolve => setTimeout(resolve, 75));
    
    cache.cleanup();
    
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBe('value2');
    expect(cache.get('key3')).toBe('value3');
  });

  it('should provide cache statistics', () => {
    cache.set('key1', 'value1', 1000);
    cache.set('key2', 'value2', 2000);
    
    const stats = cache.getStats();
    
    expect(stats.size).toBe(2);
    expect(stats.maxSize).toBe(3);
    expect(stats.entries).toHaveLength(2);
    expect(stats.entries[0]).toHaveProperty('key');
    expect(stats.entries[0]).toHaveProperty('age');
    expect(stats.entries[0]).toHaveProperty('ttl');
  });

  it('should handle different data types', () => {
    const objectCache = new SimpleCache<{ data: number }>();
    const arrayCache = new SimpleCache<number[]>();
    
    objectCache.set('obj', { data: 42 });
    arrayCache.set('arr', [1, 2, 3]);
    
    expect(objectCache.get('obj')).toEqual({ data: 42 });
    expect(arrayCache.get('arr')).toEqual([1, 2, 3]);
  });
});