export interface CacheEntry<T> {
    value: T;
    timestamp: number;
    ttl: number;
}
export declare class SimpleCache<T = unknown> {
    private cache;
    private readonly maxSize;
    private readonly defaultTtl;
    constructor(options?: {
        maxSize?: number;
        defaultTtl?: number;
    });
    set(key: string, value: T, ttl?: number): void;
    get(key: string): T | undefined;
    has(key: string): boolean;
    delete(key: string): boolean;
    clear(): void;
    get size(): number;
    cleanup(): void;
    private findOldestKey;
    getStats(): {
        size: number;
        maxSize: number;
        hitRate: number;
        entries: Array<{
            key: string;
            age: number;
            ttl: number;
        }>;
    };
}
//# sourceMappingURL=SimpleCache.d.ts.map