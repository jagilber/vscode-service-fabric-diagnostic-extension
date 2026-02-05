/**
 * Unit tests for CacheManager
 */

import { CacheManager } from '../../../src/infrastructure/CacheManager';

describe('CacheManager', () => {
    let cache: CacheManager;

    beforeEach(() => {
        cache = new CacheManager({ maxSize: 3, ttl: 1000 });
    });

    describe('Basic Operations', () => {
        test('should store and retrieve values', async () => {
            await cache.set('key1', { data: 'value1' });
            const result = await cache.get('key1');

            expect(result).toEqual({ data: 'value1' });
        });

        test('should return undefined for missing keys', async () => {
            const result = await cache.get('nonexistent');

            expect(result).toBeUndefined();
        });

        test('should overwrite existing keys', async () => {
            await cache.set('key1', { data: 'value1' });
            await cache.set('key1', { data: 'value2' });
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

        test('should use default TTL when not specified', async () => {
            await cache.set('key1', { data: 'value1' });

            // Should still be cached after 500ms (default is 1000ms)
            await new Promise(resolve => setTimeout(resolve, 500));
            const result = await cache.get('key1');
            expect(result).toEqual({ data: 'value1' });
        });
    });

    describe('LRU Eviction', () => {
        test('should evict least recently used item when full', async () => {
            // Fill cache to capacity (maxSize = 3)
            await cache.set('key1', { data: 'value1' });
            await cache.set('key2', { data: 'value2' });
            await cache.set('key3', { data: 'value3' });

            // Add one more item, should evict key1 (least recently used)
            await cache.set('key4', { data: 'value4' });

            expect(await cache.get('key1')).toBeUndefined();
            expect(await cache.get('key2')).toEqual({ data: 'value2' });
            expect(await cache.get('key3')).toEqual({ data: 'value3' });
            expect(await cache.get('key4')).toEqual({ data: 'value4' });
        });

        test('should update LRU order on access', async () => {
            await cache.set('key1', { data: 'value1' });
            await cache.set('key2', { data: 'value2' });
            await cache.set('key3', { data: 'value3' });

            // Access key1 to make it most recently used
            await cache.get('key1');

            // Add new item, should evict key2 (now least recently used)
            await cache.set('key4', { data: 'value4' });

            expect(await cache.get('key1')).toEqual({ data: 'value1' });
            expect(await cache.get('key2')).toBeUndefined();
        });
    });

    describe('Cache Management', () => {
        test('should clear all entries', async () => {
            await cache.set('key1', { data: 'value1' });
            await cache.set('key2', { data: 'value2' });

            cache.clear();

            expect(await cache.get('key1')).toBeUndefined();
            expect(await cache.get('key2')).toBeUndefined();
        });

        test('should delete specific entries', async () => {
            await cache.set('key1', { data: 'value1' });
            await cache.set('key2', { data: 'value2' });

            await cache.delete('key1');

            expect(await cache.get('key1')).toBeUndefined();
            expect(await cache.get('key2')).toEqual({ data: 'value2' });
        });

        test('should report cache size', async () => {
            expect(cache.size()).toBe(0);

            await cache.set('key1', { data: 'value1' });
            expect(cache.size()).toBe(1);

            await cache.set('key2', { data: 'value2' });
            expect(cache.size()).toBe(2);

            await cache.delete('key1');
            expect(cache.size()).toBe(1);
        });
    });

    describe('Has Method', () => {
        test('should check if key exists', async () => {
            await cache.set('key1', { data: 'value1' });

            expect(await cache.has('key1')).toBe(true);
            expect(await cache.has('nonexistent')).toBe(false);
        });

        test('should return false for expired entries', async () => {
            await cache.set('key1', { data: 'value1' }, 100);

            expect(await cache.has('key1')).toBe(true);

            await new Promise(resolve => setTimeout(resolve, 150));

            expect(await cache.has('key1')).toBe(false);
        });
    });
});
