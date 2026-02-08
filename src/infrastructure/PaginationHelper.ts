/**
 * Generic pagination helper for Service Fabric REST APIs
 * Extracts the iterative page-fetching pattern used across multiple REST endpoints
 */
import { SfUtility, debugLevel } from '../sfUtility';
import { PaginationError } from '../models/Errors';

/**
 * Response shape for a single page of results
 */
export interface PaginatedResponse<T> {
    items?: T[];
    continuationToken?: string;
}

/**
 * Iteratively fetch all pages from a paginated API
 * @param fetchPage Function that fetches a single page given an optional continuation token
 * @returns All items collected across all pages
 */
export async function getAllPaginated<T>(
    fetchPage: (continuationToken?: string) => Promise<PaginatedResponse<T>>
): Promise<T[]> {
    const allItems: T[] = [];
    let continuationToken: string | undefined = undefined;
    let pageCount = 0;

    do {
        try {
            pageCount++;
            const response = await fetchPage(continuationToken);

            if (response.items && response.items.length > 0) {
                allItems.push(...response.items);
                SfUtility.outputLog(
                    `Fetched page ${pageCount}: ${response.items.length} items, total: ${allItems.length}`,
                    null,
                    debugLevel.info
                );
            } else {
                SfUtility.outputLog(`Page ${pageCount} contained no items`, null, debugLevel.debug);
            }

            continuationToken = response.continuationToken;

        } catch (error) {
            const message = `Pagination failed at page ${pageCount}`;
            SfUtility.outputLog(message, error, debugLevel.error);
            throw new PaginationError(message, { page: pageCount, cause: error });
        }
    } while (continuationToken);

    SfUtility.outputLog(`Pagination complete: ${pageCount} pages, ${allItems.length} total items`, null, debugLevel.info);
    return allItems;
}
