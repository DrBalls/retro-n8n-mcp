import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RateLimiter } from '../../src/security/RateLimiter.js';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter();
    vi.useFakeTimers();
  });

  afterEach(() => {
    rateLimiter.stop();
    vi.useRealTimers();
  });

  describe('Basic Rate Limiting', () => {
    beforeEach(() => {
      rateLimiter.registerLimit('test', {
        windowMs: 60000, // 1 minute
        maxRequests: 10
      });
    });

    it('should allow requests within limit', () => {
      for (let i = 0; i < 10; i++) {
        const result = rateLimiter.checkLimit('test', 'user1');
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(9 - i);
      }
    });

    it('should deny requests exceeding limit', () => {
      // Use up all requests
      for (let i = 0; i < 10; i++) {
        rateLimiter.checkLimit('test', 'user1');
      }

      // Next request should be denied
      const result = rateLimiter.checkLimit('test', 'user1');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should reset after window expires', () => {
      // Use up all requests
      for (let i = 0; i < 10; i++) {
        rateLimiter.checkLimit('test', 'user1');
      }

      // Should be denied
      let result = rateLimiter.checkLimit('test', 'user1');
      expect(result.allowed).toBe(false);

      // Advance time past window
      vi.advanceTimersByTime(61000);

      // Should be allowed again
      result = rateLimiter.checkLimit('test', 'user1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('should track different keys separately', () => {
      // Use up user1's limit
      for (let i = 0; i < 10; i++) {
        rateLimiter.checkLimit('test', 'user1');
      }

      // user2 should still be allowed
      const result = rateLimiter.checkLimit('test', 'user2');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });
  });

  describe('Cost-based Rate Limiting', () => {
    beforeEach(() => {
      rateLimiter.registerLimit('api', {
        windowMs: 60000,
        maxRequests: 100
      });
    });

    it('should account for request cost', () => {
      // Make a request with cost 50
      let result = rateLimiter.checkLimit('api', 'user1', { cost: 50 });
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(50);

      // Make another request with cost 30
      result = rateLimiter.checkLimit('api', 'user1', { cost: 30 });
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(20);

      // Request with cost 25 should be denied
      result = rateLimiter.checkLimit('api', 'user1', { cost: 25 });
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(20);
    });
  });

  describe('Skip Options', () => {
    it('should skip successful requests when configured', () => {
      rateLimiter.registerLimit('errors', {
        windowMs: 60000,
        maxRequests: 5,
        skipSuccessfulRequests: true
      });

      // Successful requests should not count
      for (let i = 0; i < 10; i++) {
        const result = rateLimiter.checkLimit('errors', 'user1', { isSuccess: true });
        expect(result.allowed).toBe(true);
      }

      // Failed requests should count
      for (let i = 0; i < 5; i++) {
        const result = rateLimiter.checkLimit('errors', 'user1', { isSuccess: false });
        expect(result.allowed).toBe(true);
      }

      // Next failed request should be denied
      const result = rateLimiter.checkLimit('errors', 'user1', { isSuccess: false });
      expect(result.allowed).toBe(false);
    });

    it('should skip failed requests when configured', () => {
      rateLimiter.registerLimit('success', {
        windowMs: 60000,
        maxRequests: 5,
        skipFailedRequests: true
      });

      // Failed requests should not count
      for (let i = 0; i < 10; i++) {
        const result = rateLimiter.checkLimit('success', 'user1', { isSuccess: false });
        expect(result.allowed).toBe(true);
      }

      // Successful requests should count
      for (let i = 0; i < 5; i++) {
        const result = rateLimiter.checkLimit('success', 'user1', { isSuccess: true });
        expect(result.allowed).toBe(true);
      }

      // Next successful request should be denied
      const result = rateLimiter.checkLimit('success', 'user1', { isSuccess: true });
      expect(result.allowed).toBe(false);
    });
  });

  describe('Key Prefixes', () => {
    it('should use key prefix when configured', () => {
      rateLimiter.registerLimit('prefixed', {
        windowMs: 60000,
        maxRequests: 5,
        keyPrefix: 'api'
      });

      // These should be tracked separately due to prefix
      for (let i = 0; i < 5; i++) {
        rateLimiter.checkLimit('prefixed', 'user1');
      }

      // This creates a different key: "api:user1" vs previous "user1"
      const result = rateLimiter.checkLimit('prefixed', 'user1');
      expect(result.allowed).toBe(false);
    });
  });

  describe('Rate Limit Management', () => {
    beforeEach(() => {
      rateLimiter.registerLimit('managed', {
        windowMs: 60000,
        maxRequests: 10
      });
    });

    it('should reset limit for a key', () => {
      // Use up some requests
      for (let i = 0; i < 5; i++) {
        rateLimiter.checkLimit('managed', 'user1');
      }

      // Reset the limit
      rateLimiter.resetLimit('managed', 'user1');

      // Should have full quota again
      const result = rateLimiter.checkLimit('managed', 'user1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('should get current usage', () => {
      // No usage yet
      let usage = rateLimiter.getUsage('managed', 'user1');
      expect(usage?.count).toBe(0);
      expect(usage?.remaining).toBe(10);

      // Use some requests
      for (let i = 0; i < 3; i++) {
        rateLimiter.checkLimit('managed', 'user1');
      }

      usage = rateLimiter.getUsage('managed', 'user1');
      expect(usage?.count).toBe(3);
      expect(usage?.remaining).toBe(7);
    });

    it('should handle non-existent limits gracefully', () => {
      expect(() => {
        rateLimiter.checkLimit('nonexistent', 'user1');
      }).toThrow('Rate limit configuration \'nonexistent\' not found');

      const usage = rateLimiter.getUsage('nonexistent', 'user1');
      expect(usage).toBeNull();

      // Reset should not throw
      rateLimiter.resetLimit('nonexistent', 'user1');
    });
  });

  describe('Combined Rate Limiters', () => {
    beforeEach(() => {
      rateLimiter.registerLimit('perMinute', {
        windowMs: 60000,
        maxRequests: 60
      });
      rateLimiter.registerLimit('perSecond', {
        windowMs: 1000,
        maxRequests: 2
      });
    });

    it('should check multiple limits', () => {
      const combined = rateLimiter.createCombinedLimiter(['perMinute', 'perSecond']);

      // First two requests should pass both limits
      expect(combined('user1').allowed).toBe(true);
      expect(combined('user1').allowed).toBe(true);

      // Third request within same second should fail perSecond limit
      const result = combined('user1');
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeLessThanOrEqual(1000);
    });

    it('should return most restrictive result when all pass', () => {
      const combined = rateLimiter.createCombinedLimiter(['perMinute', 'perSecond']);

      const result = combined('user1');
      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(2); // perSecond is more restrictive
      expect(result.remaining).toBe(1);
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      rateLimiter.registerLimit('stats', {
        windowMs: 60000,
        maxRequests: 10
      });
    });

    it('should track statistics', () => {
      // Create activity for multiple users
      for (let i = 0; i < 5; i++) {
        rateLimiter.checkLimit('stats', 'user1');
      }
      for (let i = 0; i < 3; i++) {
        rateLimiter.checkLimit('stats', 'user2');
      }
      for (let i = 0; i < 8; i++) {
        rateLimiter.checkLimit('stats', 'user3');
      }

      const stats = rateLimiter.getStatistics();
      
      expect(stats.limits).toHaveLength(1);
      expect(stats.limits[0].name).toBe('stats');
      expect(stats.limits[0].activeKeys).toBe(3);
      expect(stats.limits[0].topUsers).toHaveLength(3);
      expect(stats.limits[0].topUsers[0]).toEqual({ key: 'user3', count: 8 });
      expect(stats.limits[0].topUsers[1]).toEqual({ key: 'user1', count: 5 });
      expect(stats.limits[0].topUsers[2]).toEqual({ key: 'user2', count: 3 });
    });
  });

  describe('Cleanup', () => {
    it('should clean up expired entries', () => {
      rateLimiter.registerLimit('cleanup', {
        windowMs: 1000, // 1 second window
        maxRequests: 5
      });

      // Create some entries
      rateLimiter.checkLimit('cleanup', 'user1');
      rateLimiter.checkLimit('cleanup', 'user2');

      // Advance time beyond 2x window
      vi.advanceTimersByTime(3000);

      // Trigger cleanup
      vi.advanceTimersByTime(60000);

      // Stats should show no active keys
      const stats = rateLimiter.getStatistics();
      const cleanupStats = stats.limits.find(l => l.name === 'cleanup');
      expect(cleanupStats?.activeKeys).toBe(0);
    });
  });

  describe('Express Middleware', () => {
    it('should create middleware function', () => {
      rateLimiter.registerLimit('api', {
        windowMs: 60000,
        maxRequests: 100
      });

      const middleware = rateLimiter.middleware('api', (req) => req.ip);

      // Mock request/response
      const req = { ip: '127.0.0.1' };
      const res = {
        headers: {} as any,
        setHeader: vi.fn((name: string, value: any) => {
          res.headers[name] = value;
        }),
        status: vi.fn(() => res),
        json: vi.fn()
      };
      const next = vi.fn();

      // First request should pass
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 100);
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 99);

      // Use up remaining requests
      for (let i = 0; i < 99; i++) {
        rateLimiter.checkLimit('api', '127.0.0.1');
      }

      // Reset mocks
      next.mockClear();
      res.status.mockClear();
      res.json.mockClear();

      // Next request should be rate limited
      middleware(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
        retryAfter: expect.any(Number)
      });
    });
  });
});