/**
 * Unit tests for CacheManager
 * Tests aligned with actual CacheManager API: constructor(maxSizeMB, maxEntries),
 * set(key, value, ttlMs), get(key), has(key): boolean, delete(key): boolean
 */

import { CacheManager } from '../../../src/infrastructure/CacheManager';

describe('CacheManager', () => {
    let cache: CacheManager;

    beforeEach(() => {
        // Constructor takes (maxSizeMB, maxEntries) — use small maxEntries for eviction tests
        cache = new CacheManager(1, 3);
    });

    describe('Basic Operations', () => {
        test('should store and retrieve values', async () => {
            await cache.set('key1', { data: 'value1' }, 10000);
            const result = await cache.get('key1');

            expect(result).toEqual({ data: 'value1' });
        });

        test('should return undefined for missing keys', async () => {
            const result = await cache.get('nonexistent');

            expect(result).toBeUndefined();
        });

        test('should overwrite existing keys', async () => {
            await cache.set('key1', { data: 'value1' }, 10000);
            await cache.set('key1', { data: 'value2' }, 10000);
            const result = await cache.get('key1');

            expect(result).toEqual({ data: 'value2' });
        });
    });

    describe('TTL Expiration', () => {
        test('should expire entries after TTL', async () => {
            await cache.set('key1', { data: 'value1' }, 100);

            // Immediate retrieval should work
            let result = await cache.get('key1');
            expect(result).toEqual({ data: 'value1' });

            // Wait for expiration
            await new Promise(resolve => setTimeout(resolve, 150));

            result = await cache.get('key1');
            expect(result).toBeUndefined();
        });
    });

    describe('LRU Eviction', () => {
        test('should evict oldest item when maxEntries exceeded', async () => {
            // Fill cache to capacity (maxEntries = 3)
            await cache.set('key1', { data: 'value1' }, 10000);
            await cache.set('key2', { data: 'value2' }, 10000);
            await cache.set('key3', { data: 'value3' }, 10000);

            // Add one more item — should evict key1 (oldest by Map insertion order)
            await cache.set('key4', { data: 'value4' }, 10000);

            expect(await cache.get('key1')).toBeUndefined();
            expect(await cache.get('key2')).toEqual({ data: 'value2' });
            expect(await cache.get('key3')).toEqual({ data: 'value3' });
            expect(await cache.get('key4')).toEqual({ data: 'value4' });
        });
    });

    describe('Cache Management', () => {
        test('should clear all entries', async () => {
            await cache.set('key1', { data: 'value1' }, 10000);
            await cache.set('key2', { data: 'value2' }, 10000);

            cache.clear();

            expect(await cache.get('key1')).toBeUndefined();
            expect(await cache.get('key2')).toBeUndefined();
        });

        test('should delete specific entries', async () => {
            await cache.set('key1', { data: 'value1' }, 10000);
            await cache.set('key2', { data: 'value2' }, 10000);

            const deleted = cache.delete('key1');

            expect(deleted).toBe(true);
            expect(await cache.get('key1')).toBeUndefined();
            expect(await cache.get('key2')).toEqual({ data: 'value2' });
        });

        test('should return false when deleting non-existent key', () => {
            const deleted = cache.delete('nonexistent');
            expect(deleted).toBe(false);
        });

        test('should report cache stats', async () => {
            expect(cache.getStats().count).toBe(0);

            await cache.set('key1', { data: 'value1' }, 10000);
            expect(cache.getStats().count).toBe(1);

            await cache.set('key2', { data: 'value2' }, 10000);
            expect(cache.getStats().count).toBe(2);

            cache.delete('key1');
            expect(cache.getStats().count).toBe(1);
        });
    });

    describe('Has Method', () => {
        test('should check if key exists', async () => {
            await cache.set('key1', { data: 'value1' }, 10000);

            expect(cache.has('key1')).toBe(true);
            expect(cache.has('nonexistent')).toBe(false);
        });

        test('should return false for expired entries', async () => {
            await cache.set('key1', { data: 'value1' }, 100);

            expect(cache.has('key1')).toBe(true);

            await new Promise(resolve => setTimeout(resolve, 150));

            expect(cache.has('key1')).toBe(false);
        });
    });

    describe('Statistics', () => {
        test('should track hits and misses', async () => {
            await cache.set('key1', { data: 'value1' }, 10000);

            await cache.get('key1'); // hit
            await cache.get('key1'); // hit
            await cache.get('nonexistent'); // miss

            const stats = cache.getStats();
            expect(stats.hits).toBe(2);
            expect(stats.misses).toBe(1);
        });

        test('should calculate hit rate', async () => {
            expect(cache.getHitRate()).toBe(0); // no requests yet

            await cache.set('key1', 'value', 10000);
            await cache.get('key1'); // hit
            await cache.get('miss'); // miss

            expect(cache.getHitRate()).toBe(0.5);
        });

        test('should track evictions', async () => {
            // maxEntries = 3, add 4 items to trigger eviction
            await cache.set('key1', 'v1', 10000);
            await cache.set('key2', 'v2', 10000);
            await cache.set('key3', 'v3', 10000);
            await cache.set('key4', 'v4', 10000); // evicts key1

            expect(cache.getStats().evictions).toBeGreaterThan(0);
        });
    });

    describe('Invalidation', () => {
        test('should invalidate entries by prefix', async () => {
            await cache.set('nodes:cluster1:node1', 'v1', 10000);
            await cache.set('nodes:cluster1:node2', 'v2', 10000);
            await cache.set('apps:cluster1:app1', 'v3', 10000);

            const removed = cache.invalidate('nodes:cluster1');

            expect(removed).toBe(2);
            expect(await cache.get('nodes:cluster1:node1')).toBeUndefined();
            expect(await cache.get('nodes:cluster1:node2')).toBeUndefined();
            expect(await cache.get('apps:cluster1:app1')).toBe('v3');
        });
    });

    describe('Cleanup', () => {
        test('should clean up expired entries', async () => {
            await cache.set('key1', 'v1', 100);
            await cache.set('key2', 'v2', 10000);

            await new Promise(resolve => setTimeout(resolve, 150));

            const removed = cache.cleanupExpired();
            expect(removed).toBe(1);
            expect(cache.getStats().count).toBe(1);
        });
    });
});
