/**
 * Unit tests for PaginationHelper
 */
import { getAllPaginated } from '../../src/infrastructure/PaginationHelper';

// Mock sfUtility
jest.mock('../../src/sfUtility', () => ({
    SfUtility: {
        outputLog: jest.fn(),
        showWarning: jest.fn(),
        showError: jest.fn(),
        showInformation: jest.fn(),
    },
    debugLevel: { error: 0, warn: 1, info: 2, debug: 3 }
}));

describe('PaginationHelper', () => {
    describe('getAllPaginated', () => {
        test('should return empty array when first page has no items', async () => {
            const fetchPage = jest.fn().mockResolvedValue({ items: [], continuationToken: undefined });
            const result = await getAllPaginated(fetchPage);
            expect(result).toEqual([]);
            expect(fetchPage).toHaveBeenCalledTimes(1);
        });

        test('should return single page of items', async () => {
            const items = [{ id: '1' }, { id: '2' }];
            const fetchPage = jest.fn().mockResolvedValue({ items, continuationToken: undefined });
            const result = await getAllPaginated(fetchPage);
            expect(result).toEqual(items);
            expect(fetchPage).toHaveBeenCalledTimes(1);
        });

        test('should handle multiple pages with continuation tokens', async () => {
            const fetchPage = jest.fn()
                .mockResolvedValueOnce({ items: [{ id: '1' }], continuationToken: 'token1' })
                .mockResolvedValueOnce({ items: [{ id: '2' }], continuationToken: 'token2' })
                .mockResolvedValueOnce({ items: [{ id: '3' }], continuationToken: undefined });

            const result = await getAllPaginated(fetchPage);
            expect(result).toEqual([{ id: '1' }, { id: '2' }, { id: '3' }]);
            expect(fetchPage).toHaveBeenCalledTimes(3);
            expect(fetchPage).toHaveBeenNthCalledWith(1, undefined);
            expect(fetchPage).toHaveBeenNthCalledWith(2, 'token1');
            expect(fetchPage).toHaveBeenNthCalledWith(3, 'token2');
        });

        test('should handle page with undefined items', async () => {
            const fetchPage = jest.fn().mockResolvedValue({ items: undefined, continuationToken: undefined });
            const result = await getAllPaginated(fetchPage);
            expect(result).toEqual([]);
        });

        test('should throw PaginationError when fetchPage fails', async () => {
            const fetchPage = jest.fn().mockRejectedValue(new Error('Network error'));
            await expect(getAllPaginated(fetchPage)).rejects.toThrow('Pagination failed at page 1');
        });

        test('should throw on second page failure', async () => {
            const fetchPage = jest.fn()
                .mockResolvedValueOnce({ items: [{ id: '1' }], continuationToken: 'token1' })
                .mockRejectedValueOnce(new Error('Timeout'));

            await expect(getAllPaginated(fetchPage)).rejects.toThrow('Pagination failed at page 2');
        });
    });
});
