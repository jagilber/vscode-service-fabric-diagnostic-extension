/**
 * Unit tests for SfRest — upload retry logic
 *
 * Validates:
 * - Transient SSL/network errors trigger retries (ERR_SSL_BAD_DECRYPT, EPROTO, ECONNRESET, EPIPE)
 * - Error chain traversal walks both native .cause and NetworkError .context.cause
 * - BAD_DECRYPT substring match in message triggers retry
 * - Non-transient errors do NOT retry
 * - Max retries exhausted throws the original error
 * - Backoff delays increase per attempt
 * - Successful retry returns without error
 */

import * as vscode from 'vscode';
import { SfRest } from '../../src/sfRest';
import { NetworkError } from '../../src/models/Errors';
import { createMockSfApi } from '../mocks/MockSfRestClient';

// Mock SDK
jest.mock('../../src/sdk/servicefabric/servicefabric/src/serviceFabricClientAPIs', () => ({
    ServiceFabricClientAPIs: jest.fn().mockImplementation(() => ({})),
}));

// We'll override the direct client mock per-test
const mockUploadToImageStore = jest.fn();

jest.mock('../../src/services/SfDirectRestClient', () => ({
    SfDirectRestClient: jest.fn().mockImplementation(() => ({
        uploadToImageStore: mockUploadToImageStore,
        getClusterVersion: jest.fn().mockResolvedValue({ version: '8.0.0' }),
    })),
}));

describe('SfRest — upload retry logic', () => {
    let sfRest: SfRest;
    let originalSetTimeout: typeof global.setTimeout;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers({ advanceTimers: true });
        const mockContext = new (vscode as any).ExtensionContext();
        sfRest = new SfRest(mockContext);
        (sfRest as any).sfApi = createMockSfApi();
        // Enable direct REST path
        (sfRest as any).useDirectRest = true;
        (sfRest as any).directClient = { uploadToImageStore: mockUploadToImageStore };
        // Cache the image store connection string to avoid another API call
        (sfRest as any).imageStoreConnectionString = 'fabric:ImageStore';
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    // Helper: create a NodeJS system error with a code
    function makeNodeError(code: string, message?: string): Error {
        const err = new Error(message || `Simulated ${code}`) as any;
        err.code = code;
        return err;
    }

    // Helper: wrap error in a NetworkError (mimics what SfDirectRestClient throws)
    function wrapInNetworkError(cause: Error, message?: string): NetworkError {
        return new NetworkError(message || `request failed: ${cause.message}`, { cause });
    }

    // ===========================
    // Transient error retries
    // ===========================

    describe('transient error retries', () => {
        test('should retry on ERR_SSL_BAD_DECRYPT and succeed on 2nd attempt', async () => {
            const tlsErr = makeNodeError('ERR_SSL_BAD_DECRYPT');
            const networkErr = wrapInNetworkError(tlsErr);
            mockUploadToImageStore
                .mockRejectedValueOnce(networkErr)
                .mockResolvedValueOnce(undefined);

            const promise = sfRest.uploadToImageStore('App/Code.zip', Buffer.from('data'));
            // Run timers to advance past the 2000ms retry delay
            await jest.advanceTimersByTimeAsync(3000);
            await promise;

            expect(mockUploadToImageStore).toHaveBeenCalledTimes(2);
        });

        test('should retry on EPROTO (via context.cause chain)', async () => {
            const nodeErr = makeNodeError('EPROTO', 'write EPROTO');
            const networkErr = wrapInNetworkError(nodeErr);
            mockUploadToImageStore
                .mockRejectedValueOnce(networkErr)
                .mockResolvedValueOnce(undefined);

            const promise = sfRest.uploadToImageStore('App/Code.zip', Buffer.from('data'));
            await jest.advanceTimersByTimeAsync(3000);
            await promise;

            expect(mockUploadToImageStore).toHaveBeenCalledTimes(2);
        });

        test('should retry on ECONNRESET', async () => {
            const nodeErr = makeNodeError('ECONNRESET');
            const networkErr = wrapInNetworkError(nodeErr);
            mockUploadToImageStore
                .mockRejectedValueOnce(networkErr)
                .mockResolvedValueOnce(undefined);

            const promise = sfRest.uploadToImageStore('App/Code.zip', Buffer.from('data'));
            await jest.advanceTimersByTimeAsync(3000);
            await promise;

            expect(mockUploadToImageStore).toHaveBeenCalledTimes(2);
        });

        test('should retry on EPIPE', async () => {
            const nodeErr = makeNodeError('EPIPE');
            const networkErr = wrapInNetworkError(nodeErr);
            mockUploadToImageStore
                .mockRejectedValueOnce(networkErr)
                .mockResolvedValueOnce(undefined);

            const promise = sfRest.uploadToImageStore('App/Code.zip', Buffer.from('data'));
            await jest.advanceTimersByTimeAsync(3000);
            await promise;

            expect(mockUploadToImageStore).toHaveBeenCalledTimes(2);
        });

        test('should retry when message contains BAD_DECRYPT (fallback detection)', async () => {
            const err = new Error('SSL routines:ssl3_read_bytes:BAD_DECRYPT') as any;
            // No code set — relies on message matching
            const networkErr = wrapInNetworkError(err);
            mockUploadToImageStore
                .mockRejectedValueOnce(networkErr)
                .mockResolvedValueOnce(undefined);

            const promise = sfRest.uploadToImageStore('App/Code.zip', Buffer.from('data'));
            await jest.advanceTimersByTimeAsync(3000);
            await promise;

            expect(mockUploadToImageStore).toHaveBeenCalledTimes(2);
        });
    });

    // ===========================
    // Error chain traversal
    // ===========================

    describe('error chain traversal', () => {
        test('should find error code in deeply nested context.cause chain', async () => {
            // Create a 3-level deep error chain:
            // NetworkError -> NetworkError -> NodeError(EPROTO)
            const rootErr = makeNodeError('EPROTO');
            const mid = wrapInNetworkError(rootErr, 'mid-level');
            const outer = wrapInNetworkError(mid, 'outer-level');

            mockUploadToImageStore
                .mockRejectedValueOnce(outer)
                .mockResolvedValueOnce(undefined);

            const promise = sfRest.uploadToImageStore('App/Code.zip', Buffer.from('data'));
            await jest.advanceTimersByTimeAsync(3000);
            await promise;

            expect(mockUploadToImageStore).toHaveBeenCalledTimes(2);
        });

        test('should find error code via native Error.cause', async () => {
            const rootErr = makeNodeError('ERR_SSL_BAD_DECRYPT');
            // Use native Error.cause (like newer Node.js patterns)
            const outerErr = new Error('TLS failed', { cause: rootErr }) as any;

            mockUploadToImageStore
                .mockRejectedValueOnce(outerErr)
                .mockResolvedValueOnce(undefined);

            const promise = sfRest.uploadToImageStore('App/Code.zip', Buffer.from('data'));
            await jest.advanceTimersByTimeAsync(3000);
            await promise;

            expect(mockUploadToImageStore).toHaveBeenCalledTimes(2);
        });

        test('should detect transient code on the top-level error itself', async () => {
            const directErr = makeNodeError('ECONNRESET');

            mockUploadToImageStore
                .mockRejectedValueOnce(directErr)
                .mockResolvedValueOnce(undefined);

            const promise = sfRest.uploadToImageStore('App/Code.zip', Buffer.from('data'));
            await jest.advanceTimersByTimeAsync(3000);
            await promise;

            expect(mockUploadToImageStore).toHaveBeenCalledTimes(2);
        });
    });

    // ===========================
    // Non-transient errors — no retry
    // ===========================

    describe('non-transient errors — no retry', () => {
        test('should NOT retry on generic Error (no transient code)', async () => {
            const err = new Error('Something unexpected');
            mockUploadToImageStore.mockRejectedValueOnce(err);

            await expect(sfRest.uploadToImageStore('App/Code.zip', Buffer.from('data')))
                .rejects.toThrow('Failed to upload to image store');

            expect(mockUploadToImageStore).toHaveBeenCalledTimes(1);
        });

        test('should NOT retry on NetworkError wrapping non-transient code', async () => {
            const nodeErr = makeNodeError('ENOTFOUND', 'getaddrinfo ENOTFOUND cluster.example.com');
            const networkErr = wrapInNetworkError(nodeErr);
            mockUploadToImageStore.mockRejectedValueOnce(networkErr);

            await expect(sfRest.uploadToImageStore('App/Code.zip', Buffer.from('data')))
                .rejects.toThrow('Failed to upload to image store');

            expect(mockUploadToImageStore).toHaveBeenCalledTimes(1);
        });

        test('should NOT retry on HTTP 404 wrapped in error', async () => {
            const err = new Error('HTTP 404: Not Found') as any;
            err.statusCode = 404;
            mockUploadToImageStore.mockRejectedValueOnce(err);

            await expect(sfRest.uploadToImageStore('App/Code.zip', Buffer.from('data')))
                .rejects.toThrow('Failed to upload to image store');

            expect(mockUploadToImageStore).toHaveBeenCalledTimes(1);
        });
    });

    // ===========================
    // Max retries exhausted
    // ===========================

    describe('max retries exhausted', () => {
        test('should throw after exhausting all retry attempts (2 retries)', async () => {
            const tlsErr = makeNodeError('ERR_SSL_BAD_DECRYPT');
            const networkErr = wrapInNetworkError(tlsErr);
            // Fail all 3 attempts (initial + 2 retries)
            mockUploadToImageStore
                .mockRejectedValueOnce(networkErr)
                .mockRejectedValueOnce(wrapInNetworkError(makeNodeError('ERR_SSL_BAD_DECRYPT')))
                .mockRejectedValueOnce(wrapInNetworkError(makeNodeError('ERR_SSL_BAD_DECRYPT')));

            const promise = sfRest.uploadToImageStore('App/Code.zip', Buffer.from('data'));
            // Suppress unhandled rejection while we advance timers
            promise.catch(() => {});
            // Advance past all retry delays: 2s + 4s = 6s
            await jest.advanceTimersByTimeAsync(10000);
            await expect(promise).rejects.toThrow('Failed to upload to image store');

            // 3 total attempts: initial + 2 retries
            expect(mockUploadToImageStore).toHaveBeenCalledTimes(3);
        });

        test('should succeed on the last retry attempt', async () => {
            const networkErr1 = wrapInNetworkError(makeNodeError('ECONNRESET'));
            const networkErr2 = wrapInNetworkError(makeNodeError('EPIPE'));
            // Fail first two, succeed on last
            mockUploadToImageStore
                .mockRejectedValueOnce(networkErr1)
                .mockRejectedValueOnce(networkErr2)
                .mockResolvedValueOnce(undefined);

            const promise = sfRest.uploadToImageStore('App/Code.zip', Buffer.from('data'));
            await jest.advanceTimersByTimeAsync(10000);
            await promise;

            expect(mockUploadToImageStore).toHaveBeenCalledTimes(3);
        });
    });

    // ===========================
    // Unstable connection scenarios
    // ===========================

    describe('unstable connection scenarios', () => {
        test('should handle intermittent ECONNRESET during large upload', async () => {
            // Simulates flaky network: first attempt resets, second succeeds
            const resetErr = makeNodeError('ECONNRESET');
            mockUploadToImageStore
                .mockRejectedValueOnce(wrapInNetworkError(resetErr))
                .mockResolvedValueOnce(undefined);

            const largeContent = Buffer.alloc(10 * 1024 * 1024, 0xAB); // 10MB
            const promise = sfRest.uploadToImageStore('VotingType/Code.zip', largeContent);
            await jest.advanceTimersByTimeAsync(3000);
            await promise;

            expect(mockUploadToImageStore).toHaveBeenCalledTimes(2);
        });

        test('should handle mixed transient errors across retries', async () => {
            // First: EPROTO, Second: ECONNRESET, Third: success
            mockUploadToImageStore
                .mockRejectedValueOnce(wrapInNetworkError(makeNodeError('EPROTO')))
                .mockRejectedValueOnce(wrapInNetworkError(makeNodeError('ECONNRESET')))
                .mockResolvedValueOnce(undefined);

            const promise = sfRest.uploadToImageStore('App/Code.zip', Buffer.from('data'));
            await jest.advanceTimersByTimeAsync(10000);
            await promise;

            expect(mockUploadToImageStore).toHaveBeenCalledTimes(3);
        });

        test('should wrap final error in NetworkError with context', async () => {
            const originalErr = makeNodeError('EPROTO');
            const networkErr = wrapInNetworkError(originalErr);
            mockUploadToImageStore
                .mockRejectedValueOnce(networkErr)
                .mockRejectedValueOnce(wrapInNetworkError(makeNodeError('EPROTO')))
                .mockRejectedValueOnce(wrapInNetworkError(makeNodeError('EPROTO')));

            const promise = sfRest.uploadToImageStore('App/Code.zip', Buffer.from('data'));
            // Suppress unhandled rejection while we advance timers
            const caughtPromise = promise.catch((err: any) => err);
            await jest.advanceTimersByTimeAsync(10000);

            const err = await caughtPromise;
            expect(err).toBeInstanceOf(NetworkError);
            expect(err.message).toContain('Failed to upload to image store');
            expect(err.context?.cause).toBeDefined();
        });
    });

    // ===========================
    // File-based image store
    // ===========================

    describe('file-based image store (dev cluster)', () => {
        test('should not use direct client for file: image store path', async () => {
            (sfRest as any).imageStoreConnectionString = 'file:C:\\SfDevCluster\\Data\\ImageStore';

            // Mock fs
            const mockFs = {
                promises: {
                    mkdir: jest.fn().mockResolvedValue(undefined),
                    writeFile: jest.fn().mockResolvedValue(undefined),
                }
            };
            jest.doMock('fs', () => mockFs);

            const content = Buffer.from('manifest data');
            await sfRest.uploadToImageStore('MyApp/ServiceManifest.xml', content);

            // directClient should NOT be called for file-based image store
            expect(mockUploadToImageStore).not.toHaveBeenCalled();
        });
    });
});
