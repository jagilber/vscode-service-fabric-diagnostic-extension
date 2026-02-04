/**
 * LRU Cache Manager with TTL support
 * Provides in-memory caching for API responses to improve performance
 */

export interface CacheEntry<T> {
    value: T;
    expiresAt: number;
    size: number; // Approximate size in bytes
}

export interface CacheStats {
    hits: number;
    misses: number;
    evictions: number;
    size: number;
    count: number;
}

export class CacheManager {
    private cache = new Map<string, CacheEntry<any>>();
    private readonly maxSize: number; // Maximum cache size in bytes
    private readonly maxEntries: number; // Maximum number of entries
    private currentSize: number = 0;
    
    // Statistics
    private stats: CacheStats = {
        hits: 0,
        misses: 0,
        evictions: 0,
        size: 0,
        count: 0
    };

    constructor(maxSizeMB: number = 50, maxEntries: number = 1000) {
        this.maxSize = maxSizeMB * 1024 * 1024;
        this.maxEntries = maxEntries;
    }

    /**
     * Get value from cache
     * Returns undefined if not found or expired
     */
    async get<T>(key: string): Promise<T | undefined> {
        const entry = this.cache.get(key);
        
        if (!entry) {
            this.stats.misses++;
            return undefined;
        }

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            this.currentSize -= entry.size;
            this.stats.misses++;
            return undefined;
        }

        this.stats.hits++;
        return entry.value as T;
    }

    /**
     * Set value in cache with TTL
     * @param key Cache key
     * @param value Value to cache
     * @param ttlMs Time to live in milliseconds
     */
    async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
        // Estimate size (rough approximation)
        const size = this.estimateSize(value);
        
        // Remove old entry if exists
        const oldEntry = this.cache.get(key);
        if (oldEntry) {
            this.currentSize -= oldEntry.size;
        }

        // Evict entries if necessary
        await this.evictIfNeeded(size);

        // Add new entry
        this.cache.set(key, {
            value,
            expiresAt: Date.now() + ttlMs,
            size
        });
        
        this.currentSize += size;
        this.updateStats();
    }

    /**
     * Check if key exists and is not expired
     */
    has(key: string): boolean {
        const entry = this.cache.get(key);
        if (!entry) {
            return false;
        }
        
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            this.currentSize -= entry.size;
            return false;
        }
        
        return true;
    }

    /**
     * Delete specific key from cache
     */
    delete(key: string): boolean {
        const entry = this.cache.get(key);
        if (entry) {
            this.currentSize -= entry.size;
            this.cache.delete(key);
            this.updateStats();
            return true;
        }
        return false;
    }

    /**
     * Invalidate cache entries matching a pattern
     * @param pattern Prefix to match (e.g., "nodes:cluster1")
     */
    invalidate(pattern: string): number {
        let count = 0;
        
        for (const [key, entry] of this.cache) {
            if (key.startsWith(pattern)) {
                this.currentSize -= entry.size;
                this.cache.delete(key);
                count++;
            }
        }
        
        this.updateStats();
        return count;
    }

    /**
     * Clear entire cache
     */
    clear(): void {
        this.cache.clear();
        this.currentSize = 0;
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            size: 0,
            count: 0
        };
    }

    /**
     * Get cache statistics
     */
    getStats(): CacheStats {
        return { ...this.stats };
    }

    /**
     * Get cache hit rate (0-1)
     */
    getHitRate(): number {
        const total = this.stats.hits + this.stats.misses;
        return total === 0 ? 0 : this.stats.hits / total;
    }

    /**
     * Evict entries if cache is full
     * Uses LRU strategy (oldest entries first)
     */
    private async evictIfNeeded(newEntrySize: number): Promise<void> {
        // Check if we need to evict based on size
        while (this.currentSize + newEntrySize > this.maxSize && this.cache.size > 0) {
            // Get first (oldest) entry
            const firstKey = this.cache.keys().next().value;
            if (!firstKey) break;
            const firstEntry = this.cache.get(firstKey)!;
            
            this.cache.delete(firstKey);
            this.currentSize -= firstEntry.size;
            this.stats.evictions++;
        }

        // Check if we need to evict based on count
        while (this.cache.size >= this.maxEntries) {
            const firstKey = this.cache.keys().next().value;
            if (!firstKey) break;
            const firstEntry = this.cache.get(firstKey)!;
            
            this.cache.delete(firstKey);
            this.currentSize -= firstEntry.size;
            this.stats.evictions++;
        }
    }

    /**
     * Estimate size of value in bytes (rough approximation)
     */
    private estimateSize(value: any): number {
        const json = JSON.stringify(value);
        return json.length * 2; // UTF-16 characters = 2 bytes each
    }

    /**
     * Update statistics
     */
    private updateStats(): void {
        this.stats.size = this.currentSize;
        this.stats.count = this.cache.size;
    }

    /**
     * Clean up expired entries
     * Should be called periodically
     */
    cleanupExpired(): number {
        const now = Date.now();
        let removed = 0;

        for (const [key, entry] of this.cache) {
            if (now > entry.expiresAt) {
                this.currentSize -= entry.size;
                this.cache.delete(key);
                removed++;
            }
        }

        if (removed > 0) {
            this.updateStats();
        }

        return removed;
    }
}

/**
 * Singleton cache instance
 */
export const globalCache = new CacheManager(50, 1000);
