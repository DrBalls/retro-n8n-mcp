import { Logger } from '../utils/Logger.js';
export class RateLimiter {
    logger = new Logger('RateLimiter');
    limits = new Map();
    configs = new Map();
    cleanupInterval;
    constructor() {
        // Cleanup old entries every minute
        this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
    }
    /**
     * Register a rate limit configuration
     */
    registerLimit(name, config) {
        this.configs.set(name, config);
        this.limits.set(name, new Map());
        this.logger.info(`Rate limit registered`, {
            name,
            windowMs: config.windowMs,
            maxRequests: config.maxRequests
        });
    }
    /**
     * Check if a request is allowed
     */
    checkLimit(name, key, options) {
        const config = this.configs.get(name);
        if (!config) {
            throw new Error(`Rate limit configuration '${name}' not found`);
        }
        // Skip based on success/failure if configured
        if (options?.isSuccess !== undefined) {
            if (config.skipSuccessfulRequests && options.isSuccess) {
                return this.createAllowedResult(config);
            }
            if (config.skipFailedRequests && !options.isSuccess) {
                return this.createAllowedResult(config);
            }
        }
        const limitKey = config.keyPrefix ? `${config.keyPrefix}:${key}` : key;
        const limits = this.limits.get(name);
        const now = Date.now();
        const cost = options?.cost || 1;
        let entry = limits.get(limitKey);
        // Initialize or reset if window expired
        if (!entry || now - entry.windowStart >= config.windowMs) {
            entry = {
                count: 0,
                windowStart: now,
                firstRequest: now
            };
            limits.set(limitKey, entry);
        }
        // Check if limit would be exceeded
        if (entry.count + cost > config.maxRequests) {
            const resetAt = new Date(entry.windowStart + config.windowMs);
            const retryAfter = resetAt.getTime() - now;
            this.logger.warn(`Rate limit exceeded`, {
                name,
                key: limitKey,
                count: entry.count,
                limit: config.maxRequests,
                resetAt
            });
            return {
                allowed: false,
                limit: config.maxRequests,
                remaining: Math.max(0, config.maxRequests - entry.count),
                resetAt,
                retryAfter: Math.max(0, retryAfter)
            };
        }
        // Increment counter
        entry.count += cost;
        return {
            allowed: true,
            limit: config.maxRequests,
            remaining: Math.max(0, config.maxRequests - entry.count),
            resetAt: new Date(entry.windowStart + config.windowMs)
        };
    }
    /**
     * Reset rate limit for a key
     */
    resetLimit(name, key) {
        const config = this.configs.get(name);
        if (!config) {
            return;
        }
        const limitKey = config.keyPrefix ? `${config.keyPrefix}:${key}` : key;
        const limits = this.limits.get(name);
        if (limits) {
            limits.delete(limitKey);
            this.logger.info(`Rate limit reset`, { name, key: limitKey });
        }
    }
    /**
     * Get current usage for a key
     */
    getUsage(name, key) {
        const config = this.configs.get(name);
        if (!config) {
            return null;
        }
        const limitKey = config.keyPrefix ? `${config.keyPrefix}:${key}` : key;
        const limits = this.limits.get(name);
        const entry = limits?.get(limitKey);
        if (!entry) {
            return {
                count: 0,
                limit: config.maxRequests,
                remaining: config.maxRequests,
                resetAt: new Date(Date.now() + config.windowMs)
            };
        }
        const now = Date.now();
        if (now - entry.windowStart >= config.windowMs) {
            // Window expired
            return {
                count: 0,
                limit: config.maxRequests,
                remaining: config.maxRequests,
                resetAt: new Date(now + config.windowMs)
            };
        }
        return {
            count: entry.count,
            limit: config.maxRequests,
            remaining: Math.max(0, config.maxRequests - entry.count),
            resetAt: new Date(entry.windowStart + config.windowMs)
        };
    }
    /**
     * Create a combined rate limiter that checks multiple limits
     */
    createCombinedLimiter(limitNames) {
        return (key, options) => {
            let mostRestrictive = null;
            for (const name of limitNames) {
                const result = this.checkLimit(name, key, options);
                if (!result.allowed) {
                    return result; // Return first limit that denies
                }
                if (!mostRestrictive || result.remaining < mostRestrictive.remaining) {
                    mostRestrictive = result;
                }
            }
            return mostRestrictive || this.createAllowedResult(this.configs.values().next().value);
        };
    }
    /**
     * Create an allowed result
     */
    createAllowedResult(config) {
        return {
            allowed: true,
            limit: config.maxRequests,
            remaining: config.maxRequests,
            resetAt: new Date(Date.now() + config.windowMs)
        };
    }
    /**
     * Clean up expired entries
     */
    cleanup() {
        const now = Date.now();
        let totalCleaned = 0;
        for (const [name, limits] of this.limits) {
            const config = this.configs.get(name);
            if (!config)
                continue;
            const expiredKeys = [];
            for (const [key, entry] of limits) {
                if (now - entry.windowStart >= config.windowMs * 2) {
                    // Keep entries for 2x window time for monitoring
                    expiredKeys.push(key);
                }
            }
            expiredKeys.forEach(key => limits.delete(key));
            totalCleaned += expiredKeys.length;
        }
        if (totalCleaned > 0) {
            this.logger.debug(`Cleaned up ${totalCleaned} expired rate limit entries`);
        }
    }
    /**
     * Get statistics for rate limiting
     */
    getStatistics() {
        const stats = {
            limits: []
        };
        for (const [name, limits] of this.limits) {
            const config = this.configs.get(name);
            const now = Date.now();
            // Get active entries
            const activeEntries = Array.from(limits.entries())
                .filter(([_, entry]) => now - entry.windowStart < config.windowMs)
                .map(([key, entry]) => ({ key, count: entry.count }));
            // Sort by count to get top users
            activeEntries.sort((a, b) => b.count - a.count);
            stats.limits.push({
                name,
                config,
                activeKeys: activeEntries.length,
                topUsers: activeEntries.slice(0, 10)
            });
        }
        return stats;
    }
    /**
     * Stop the cleanup interval
     */
    stop() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
    }
    /**
     * Express middleware factory
     */
    middleware(limitName, keyExtractor) {
        return (req, res, next) => {
            const key = keyExtractor(req);
            const result = this.checkLimit(limitName, key);
            // Set rate limit headers
            res.setHeader('X-RateLimit-Limit', result.limit);
            res.setHeader('X-RateLimit-Remaining', result.remaining);
            res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());
            if (!result.allowed) {
                res.setHeader('Retry-After', Math.ceil((result.retryAfter || 0) / 1000));
                res.status(429).json({
                    error: 'Too Many Requests',
                    message: 'Rate limit exceeded',
                    retryAfter: result.retryAfter
                });
                return;
            }
            next();
        };
    }
}
//# sourceMappingURL=RateLimiter.js.map