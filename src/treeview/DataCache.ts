/**
 * TTL-based cache for REST API responses.
 * Keyed by convention: `entityType:clusterEndpoint:parentId`.
 * Prevents redundant HTTP calls during rapid tree expansion.
 */
export class DataCache {
    private cache = new Map<string, { data: unknown; timestamp: number }>();

    constructor(private defaultTtlMs: number = 15000) {}

    /**
     * Get cached data if still within TTL. Returns undefined on cache miss or expiry.
     */
    get<T>(key: string): T | undefined {
        const entry = this.cache.get(key);
        if (!entry) { return undefined; }
        if (Date.now() - entry.timestamp > this.defaultTtlMs) {
            this.cache.delete(key);
            return undefined;
        }
        return entry.data as T;
    }

    /**
     * Store data with current timestamp.
     */
    set<T>(key: string, data: T): void {
        this.cache.set(key, { data, timestamp: Date.now() });
    }

    /**
     * Check if a key exists and is not expired.
     */
    has(key: string): boolean {
        return this.get(key) !== undefined;
    }

    /**
     * Invalidate all keys starting with prefix.
     * Useful for cluster-scoped invalidation: invalidateByPrefix('nodes:https://localhost:19080')
     */
    invalidateByPrefix(prefix: string): void {
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Invalidate a single key.
     */
    invalidate(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Clear the entire cache.
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get the number of cached entries (for diagnostics).
     */
    get size(): number {
        return this.cache.size;
    }
}
