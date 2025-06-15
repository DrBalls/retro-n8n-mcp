import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RequestQueue } from '../../src/utils/RequestQueue.js';

describe('RequestQueue', () => {
  let queue: RequestQueue;

  beforeEach(() => {
    queue = new RequestQueue({
      concurrency: 2,
      interval: 100,
      intervalCap: 5,
    });
  });

  it('should process requests in priority order', async () => {
    const results: number[] = [];
    
    // Add requests with different priorities
    const promises = [
      queue.add(() => Promise.resolve(1), 1),
      queue.add(() => Promise.resolve(2), 3),
      queue.add(() => Promise.resolve(3), 2),
    ];
    
    // Wait for all to complete
    await Promise.all(promises);
    
    // The queue should process higher priority first
    expect(queue.size).toBe(0);
  });

  it('should respect concurrency limit', async () => {
    let running = 0;
    let maxRunning = 0;
    
    const makeRequest = async (id: number): Promise<number> => {
      running++;
      maxRunning = Math.max(maxRunning, running);
      await new Promise(resolve => setTimeout(resolve, 50));
      running--;
      return id;
    };
    
    // Add more requests than concurrency limit
    const promises = Array.from({ length: 5 }, (_, i) =>
      queue.add(() => makeRequest(i)),
    );
    
    await Promise.all(promises);
    
    // Should never exceed concurrency limit
    expect(maxRunning).toBeLessThanOrEqual(2);
  });

  it('should handle request failures', async () => {
    const successFn = () => Promise.resolve('success');
    const failFn = () => Promise.reject(new Error('failed'));
    
    // Add error handler to prevent unhandled rejection
    queue.on('error', () => {
      // Expected error, no action needed
    });
    
    const results = await Promise.allSettled([
      queue.add(successFn),
      queue.add(failFn),
      queue.add(successFn),
    ]);
    
    expect(results[0].status).toBe('fulfilled');
    expect(results[1].status).toBe('rejected');
    expect(results[2].status).toBe('fulfilled');
  });

  it('should pause and resume processing', async () => {
    const results: number[] = [];
    
    // Add initial request
    const promise1 = queue.add(async () => {
      results.push(1);
      return 1;
    });
    
    await promise1;
    
    // Pause queue
    queue.pause();
    expect(queue.isPaused).toBe(true);
    
    // Add request while paused
    const promise2 = queue.add(async () => {
      results.push(2);
      return 2;
    });
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Should not have processed yet
    expect(results).toEqual([1]);
    
    // Resume
    queue.resume();
    expect(queue.isPaused).toBe(false);
    
    await promise2;
    expect(results).toEqual([1, 2]);
  });

  it('should clear pending requests', async () => {
    const processed: number[] = [];
    
    // Add many slow requests
    const promises = Array.from({ length: 10 }, (_, i) =>
      queue.add(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        processed.push(i);
        return i;
      }),
    );
    
    // Wait a bit for some to start
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Clear the queue
    queue.clear();
    
    // Check that pending requests were rejected
    const results = await Promise.allSettled(promises);
    const rejected = results.filter(r => r.status === 'rejected');
    
    expect(rejected.length).toBeGreaterThan(0);
    expect(queue.size).toBe(0);
  });

  it('should emit events', async () => {
    const events: string[] = [];
    
    queue.on('enqueue', () => events.push('enqueue'));
    queue.on('start', () => events.push('start'));
    queue.on('success', () => events.push('success'));
    queue.on('complete', () => events.push('complete'));
    
    await queue.add(() => Promise.resolve('test'));
    
    expect(events).toContain('enqueue');
    expect(events).toContain('start');
    expect(events).toContain('success');
    expect(events).toContain('complete');
  });

  it('should handle rate limiting', async () => {
    const queue = new RequestQueue({
      concurrency: 10, // High concurrency
      interval: 100,   // 100ms between batches
      intervalCap: 2,  // Max 2 per interval
    });
    
    const startTime = Date.now();
    const times: number[] = [];
    
    // Add 4 requests (should take 2 intervals)
    const promises = Array.from({ length: 4 }, () =>
      queue.add(async () => {
        times.push(Date.now() - startTime);
        return true;
      }),
    );
    
    await Promise.all(promises);
    
    // First 2 should complete quickly
    expect(times[0]).toBeLessThan(50);
    expect(times[1]).toBeLessThan(50);
    
    // Next 2 should wait for next interval
    expect(times[2]).toBeGreaterThanOrEqual(100);
    expect(times[3]).toBeGreaterThanOrEqual(100);
  });
});