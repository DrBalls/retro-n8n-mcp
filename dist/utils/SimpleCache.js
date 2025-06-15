export class SimpleCache {
    cache = new Map();
    maxSize;
    defaultTtl;
    constructor(options = {}) {
        this.maxSize = options.maxSize ?? 100;
        this.defaultTtl = options.defaultTtl ?? 60000; // 1 minute
    }
    set(key, value, ttl) {
        // Evict oldest entry if cache is full
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            const oldestKey = this.findOldestKey();
            if (oldestKey) {
                this.cache.delete(oldestKey);
            }
        }
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            ttl: ttl ?? this.defaultTtl,
        });
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return undefined;
        }
        // Check if entry has expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return undefined;
        }
        return entry.value;
    }
    has(key) {
        return this.get(key) !== undefined;
    }
    delete(key) {
        return this.cache.delete(key);
    }
    clear() {
        this.cache.clear();
    }
    get size() {
        return this.cache.size;
    }
    // Clean up expired entries
    cleanup() {
        const now = Date.now();
        const keysToDelete = [];
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.cache.delete(key));
    }
    findOldestKey() {
        let oldestKey;
        let oldestTimestamp = Infinity;
        for (const [key, entry] of this.cache.entries()) {
            if (entry.timestamp < oldestTimestamp) {
                oldestTimestamp = entry.timestamp;
                oldestKey = key;
            }
        }
        return oldestKey;
    }
    // Get cache statistics
    getStats() {
        const now = Date.now();
        const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
            key,
            age: now - entry.timestamp,
            ttl: entry.ttl,
        }));
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hitRate: 0, // Would need to track hits/misses for this
            entries,
        };
    }
}
//# sourceMappingURL=SimpleCache.js.map