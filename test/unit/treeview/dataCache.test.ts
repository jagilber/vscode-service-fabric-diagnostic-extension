/**
 * DataCache Unit Tests
 * 
 * Tests TTL-based caching behavior that tree nodes depend on.
 */

import { DataCache } from '../../../src/treeview/DataCache';

describe('DataCache', () => {
    describe('get/set', () => {
        it('should return undefined for missing key', () => {
            const cache = new DataCache();
            expect(cache.get('nonexistent')).toBeUndefined();
        });

        it('should store and retrieve data', () => {
            const cache = new DataCache();
            cache.set('key1', { name: 'test' });
            expect(cache.get('key1')).toEqual({ name: 'test' });
        });

        it('should return undefined after TTL expires', () => {
            const cache = new DataCache(100); // 100ms TTL
            cache.set('key1', 'value');
            
            // Advance time past TTL
            jest.useFakeTimers();
            jest.advanceTimersByTime(200);
            
            expect(cache.get('key1')).toBeUndefined();
            jest.useRealTimers();
        });
    });

    describe('has()', () => {
        it('should return false for missing key', () => {
            const cache = new DataCache();
            expect(cache.has('missing')).toBe(false);
        });

        it('should return true for existing key', () => {
            const cache = new DataCache();
            cache.set('key', 'value');
            expect(cache.has('key')).toBe(true);
        });
    });

    describe('invalidate()', () => {
        it('should remove a single key', () => {
            const cache = new DataCache();
            cache.set('key1', 'v1');
            cache.set('key2', 'v2');
            cache.invalidate('key1');
            expect(cache.get('key1')).toBeUndefined();
            expect(cache.get('key2')).toBe('v2');
        });
    });

    describe('invalidateByPrefix()', () => {
        it('should remove all keys matching prefix', () => {
            const cache = new DataCache();
            cache.set('nodes:cluster1:a', 'v1');
            cache.set('nodes:cluster1:b', 'v2');
            cache.set('apps:cluster1:c', 'v3');
            
            cache.invalidateByPrefix('nodes:cluster1');
            
            expect(cache.get('nodes:cluster1:a')).toBeUndefined();
            expect(cache.get('nodes:cluster1:b')).toBeUndefined();
            expect(cache.get('apps:cluster1:c')).toBe('v3');
        });
    });

    describe('clear()', () => {
        it('should remove all entries', () => {
            const cache = new DataCache();
            cache.set('k1', 'v1');
            cache.set('k2', 'v2');
            cache.clear();
            expect(cache.size).toBe(0);
        });
    });

    describe('size', () => {
        it('should return entry count', () => {
            const cache = new DataCache();
            expect(cache.size).toBe(0);
            cache.set('k1', 'v1');
            expect(cache.size).toBe(1);
            cache.set('k2', 'v2');
            expect(cache.size).toBe(2);
        });
    });
});
