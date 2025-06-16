export interface IRateLimitConfig {
    windowMs: number;
    maxRequests: number;
    keyPrefix?: string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
}
export interface IRateLimitResult {
    allowed: boolean;
    limit: number;
    remaining: number;
    resetAt: Date;
    retryAfter?: number;
}
export declare class RateLimiter {
    private logger;
    private limits;
    private configs;
    private cleanupInterval;
    constructor();
    /**
     * Register a rate limit configuration
     */
    registerLimit(name: string, config: IRateLimitConfig): void;
    /**
     * Check if a request is allowed
     */
    checkLimit(name: string, key: string, options?: {
        cost?: number;
        isSuccess?: boolean;
    }): IRateLimitResult;
    /**
     * Reset rate limit for a key
     */
    resetLimit(name: string, key: string): void;
    /**
     * Get current usage for a key
     */
    getUsage(name: string, key: string): {
        count: number;
        limit: number;
        remaining: number;
        resetAt: Date;
    } | null;
    /**
     * Create a combined rate limiter that checks multiple limits
     */
    createCombinedLimiter(limitNames: string[]): (key: string, options?: Parameters<typeof this.checkLimit>[2]) => IRateLimitResult;
    /**
     * Create an allowed result
     */
    private createAllowedResult;
    /**
     * Clean up expired entries
     */
    private cleanup;
    /**
     * Get statistics for rate limiting
     */
    getStatistics(): {
        limits: Array<{
            name: string;
            config: IRateLimitConfig;
            activeKeys: number;
            topUsers: Array<{
                key: string;
                count: number;
            }>;
        }>;
    };
    /**
     * Stop the cleanup interval
     */
    stop(): void;
    /**
     * Express middleware factory
     */
    middleware(limitName: string, keyExtractor: (req: any) => string): (req: any, res: any, next: any) => void;
}
//# sourceMappingURL=RateLimiter.d.ts.map