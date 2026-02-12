/**
 * Unit tests for SfDirectRestClient — Image Store upload (small/large/chunked)
 *
 * Validates:
 * - Small file upload uses single PUT to /ImageStore/{path}
 * - Large file upload uses session-based chunked API:
 *     PUT /ImageStore/{path}/$/UploadChunk?session-id={guid}  (per chunk)
 *     POST /ImageStore/$/CommitUploadSession?session-id={guid}
 * - Content-Range header format matches SF gateway expectations ("bytes start-end/total")
 * - Failed chunk upload cleans up session via DELETE
 * - Chunk boundaries are correct for various file sizes
 * - URL-encodes path segments
 */
jest.mock('http');
jest.mock('https');
jest.mock('crypto', () => ({
    ...jest.requireActual('crypto'),
    randomUUID: jest.fn(() => 'test-session-00000000-0000-0000-0000-000000000001'),
}));

import { SfDirectRestClient } from '../../src/services/SfDirectRestClient';
import * as crypto from 'crypto';

describe('SfDirectRestClient — Image Store Upload', () => {
    let client: SfDirectRestClient;
    let httpMod: any;

    /** Track all requests made during a test */
    let capturedRequests: Array<{
        opts: any;
        bodyChunks: Buffer[];
        ended: boolean;
    }>;

    function createMockResponse(statusCode: number, body?: any, statusMessage = 'OK') {
        const mockResponse: any = {
            statusCode,
            statusMessage,
            headers: {},
            on: jest.fn((event: string, handler: any) => {
                if (event === 'data' && body !== undefined) {
                    const data = typeof body === 'string' ? body : JSON.stringify(body);
                    process.nextTick(() => handler(Buffer.from(data)));
                }
                if (event === 'end') {
                    process.nextTick(handler);
                }
                return mockResponse;
            }),
        };
        return mockResponse;
    }

    function setupMockHttp(responseFactory?: (opts: any, reqIndex: number) => any) {
        capturedRequests = [];
        let reqIndex = 0;

        httpMod.request.mockImplementation((opts: any, callback: any) => {
            const entry: any = { opts: { ...opts }, bodyChunks: [], ended: false };
            capturedRequests.push(entry);

            const handlers: Record<string, Function[]> = {};
            const mockReq: any = {
                on: jest.fn((event: string, handler: Function) => {
                    if (!handlers[event]) { handlers[event] = []; }
                    handlers[event].push(handler);
                    return mockReq;
                }),
                end: jest.fn((chunk?: Buffer) => {
                    if (chunk) { entry.bodyChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)); }
                    entry.ended = true;
                }),
                destroy: jest.fn(),
                setTimeout: jest.fn(),
                setHeader: jest.fn((name: string, value: string) => {
                    entry.opts.headers = entry.opts.headers || {};
                    entry.opts.headers[name] = value;
                }),
                write: jest.fn((chunk: any) => {
                    entry.bodyChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
                    return true;
                }),
            };

            const response = responseFactory
                ? responseFactory(opts, reqIndex++)
                : createMockResponse(200, undefined);

            // If request has Expect: 100-continue, fire 'continue' before the response
            // so the body gets sent (mirrors real Node.js behavior)
            process.nextTick(() => {
                if (opts.headers && opts.headers['Expect'] === '100-continue') {
                    (handlers['continue'] || []).forEach(h => h());
                }
                callback(response);
            });
            return mockReq;
        });
    }

    beforeEach(() => {
        jest.clearAllMocks();
        (crypto.randomUUID as jest.Mock).mockReturnValue('test-session-00000000-0000-0000-0000-000000000001');
        httpMod = require('http');
        client = new SfDirectRestClient({
            endpoint: 'http://localhost:19080',
            apiVersion: '6.0',
            timeout: 5000,
        });
    });

    // ===========================
    // Small file uploads
    // ===========================
    describe('small file upload (single PUT)', () => {
        test('should upload small file with single PUT to /ImageStore/{path}', async () => {
            setupMockHttp();
            const content = Buffer.from('hello world');
            await client.uploadToImageStore('MyApp/manifest.xml', content);

            expect(capturedRequests).toHaveLength(1);
            const req = capturedRequests[0];
            expect(req.opts.method).toBe('PUT');
            expect(req.opts.path).toContain('/ImageStore/MyApp/manifest.xml');
            expect(req.opts.path).not.toContain('UploadChunk');
            expect(req.opts.path).not.toContain('session-id');
        });

        test('should set Content-Type to application/octet-stream', async () => {
            setupMockHttp();
            const content = Buffer.from('data');
            await client.uploadToImageStore('path/file.txt', content);

            expect(capturedRequests[0].opts.headers['Content-Type']).toBe('application/octet-stream');
        });

        test('should send the full file content in a single write for small files', async () => {
            setupMockHttp();
            const content = Buffer.alloc(1024, 0xAB);
            await client.uploadToImageStore('path/file.bin', content);

            const totalBody = Buffer.concat(capturedRequests[0].bodyChunks);
            expect(totalBody.length).toBe(1024);
            expect(totalBody.equals(content)).toBe(true);
        });

        test('should URL-encode path segments', async () => {
            setupMockHttp();
            await client.uploadToImageStore('My App/Code Package/file.zip', Buffer.from('x'));

            const path = capturedRequests[0].opts.path;
            expect(path).toContain('My%20App');
            expect(path).toContain('Code%20Package');
        });

        test('should handle 1-byte file', async () => {
            setupMockHttp();
            await client.uploadToImageStore('tiny', Buffer.from([0x42]));

            expect(capturedRequests).toHaveLength(1);
            const totalBody = Buffer.concat(capturedRequests[0].bodyChunks);
            expect(totalBody.length).toBe(1);
        });

        test('should handle file at exactly the chunk threshold', async () => {
            // 2MB exactly should still be single-shot (threshold is >2MB, not >=)
            setupMockHttp();
            const content = Buffer.alloc(2 * 1024 * 1024, 0xFF);
            await client.uploadToImageStore('exact/threshold.bin', content);

            expect(capturedRequests).toHaveLength(1);
            expect(capturedRequests[0].opts.path).not.toContain('UploadChunk');
        });

        test('should reject on HTTP error for small upload', async () => {
            setupMockHttp(() => createMockResponse(500, 'Internal Server Error', 'Internal Server Error'));
            const content = Buffer.from('data');

            await expect(client.uploadToImageStore('path/file.txt', content)).rejects.toThrow();
        });
    });

    // ===========================
    // Large file uploads (chunked)
    // ===========================
    describe('large file upload (session-based chunked)', () => {
        const CHUNK_SIZE = 4 * 1024 * 1024; // must match SfDirectRestClient.UPLOAD_CHUNK_SIZE

        test('should use chunked upload for files larger than 2MB', async () => {
            setupMockHttp();
            const content = Buffer.alloc(2 * 1024 * 1024 + 1, 0xCC); // 2MB + 1 byte

            await client.uploadToImageStore('AppType/Code.zip', content);

            // Should have 1 chunk PUT + 1 commit POST = 2 requests
            expect(capturedRequests.length).toBe(2);
        });

        test('should generate a session-id and use UploadChunk endpoint', async () => {
            setupMockHttp();
            const content = Buffer.alloc(2 * 1024 * 1024 + 1, 0xCC);

            await client.uploadToImageStore('AppType/Code.zip', content);

            const chunkReq = capturedRequests[0];
            expect(chunkReq.opts.method).toBe('PUT');
            expect(chunkReq.opts.path).toContain('/ImageStore/AppType/Code.zip/$/UploadChunk');
            expect(chunkReq.opts.path).toContain('session-id=test-session-00000000-0000-0000-0000-000000000001');
        });

        test('should commit the session after all chunks', async () => {
            setupMockHttp();
            const content = Buffer.alloc(2 * 1024 * 1024 + 1, 0xCC);

            await client.uploadToImageStore('AppType/Code.zip', content);

            const commitReq = capturedRequests[capturedRequests.length - 1];
            expect(commitReq.opts.method).toBe('POST');
            expect(commitReq.opts.path).toContain('/ImageStore/$/CommitUploadSession');
            expect(commitReq.opts.path).toContain('session-id=test-session-00000000-0000-0000-0000-000000000001');
        });

        test('should send correct Content-Range header on each chunk', async () => {
            setupMockHttp();
            const totalSize = CHUNK_SIZE + 100; // 4MB + 100 bytes = 2 chunks
            const content = Buffer.alloc(totalSize, 0xDD);

            await client.uploadToImageStore('App/Pkg/Code.zip', content);

            // chunk requests = 2, commit = 1 → total 3
            expect(capturedRequests.length).toBe(3);

            // First chunk: bytes 0 to CHUNK_SIZE-1
            const chunk1Headers = capturedRequests[0].opts.headers;
            expect(chunk1Headers['Content-Range']).toBe(`bytes 0-${CHUNK_SIZE - 1}/${totalSize}`);

            // Second chunk: bytes CHUNK_SIZE to totalSize-1
            const chunk2Headers = capturedRequests[1].opts.headers;
            expect(chunk2Headers['Content-Range']).toBe(`bytes ${CHUNK_SIZE}-${totalSize - 1}/${totalSize}`);
        });

        test('should split a 10MB file into correct number of chunks', async () => {
            setupMockHttp();
            const tenMB = 10 * 1024 * 1024;
            const content = Buffer.alloc(tenMB, 0xAA);

            await client.uploadToImageStore('VotingType/Code.zip', content);

            // 10MB / 4MB = 2.5 → 3 chunks + 1 commit = 4 requests
            const expectedChunks = Math.ceil(tenMB / CHUNK_SIZE);
            expect(expectedChunks).toBe(3);
            expect(capturedRequests.length).toBe(expectedChunks + 1);

            // Verify all chunk data adds up to original size
            let totalBytesUploaded = 0;
            for (let i = 0; i < expectedChunks; i++) {
                const bodyLen = Buffer.concat(capturedRequests[i].bodyChunks).length;
                totalBytesUploaded += bodyLen;
            }
            expect(totalBytesUploaded).toBe(tenMB);
        });

        test('should split exactly on chunk boundary', async () => {
            setupMockHttp();
            const exactlyTwoChunks = CHUNK_SIZE * 2;
            const content = Buffer.alloc(exactlyTwoChunks, 0xBB);

            await client.uploadToImageStore('App/Pkg.zip', content);

            // 2 chunks + 1 commit = 3 requests
            expect(capturedRequests.length).toBe(3);

            // Chunk 1: 0 to CHUNK_SIZE-1
            expect(capturedRequests[0].opts.headers['Content-Range']).toBe(`bytes 0-${CHUNK_SIZE - 1}/${exactlyTwoChunks}`);
            // Chunk 2: CHUNK_SIZE to 2*CHUNK_SIZE-1
            expect(capturedRequests[1].opts.headers['Content-Range']).toBe(`bytes ${CHUNK_SIZE}-${exactlyTwoChunks - 1}/${exactlyTwoChunks}`);
        });

        test('should preserve binary data integrity across chunks', async () => {
            setupMockHttp();
            // Create buffer with unique pattern per byte
            const totalSize = CHUNK_SIZE + 500;
            const content = Buffer.alloc(totalSize);
            for (let i = 0; i < totalSize; i++) {
                content[i] = i % 256;
            }

            await client.uploadToImageStore('App/Data.zip', content);

            // Reassemble from captured chunks
            const chunkCount = Math.ceil(totalSize / CHUNK_SIZE);
            const reassembled = Buffer.alloc(totalSize);
            for (let i = 0; i < chunkCount; i++) {
                const chunkBody = Buffer.concat(capturedRequests[i].bodyChunks);
                const start = i * CHUNK_SIZE;
                chunkBody.copy(reassembled, start);
            }
            expect(reassembled.equals(content)).toBe(true);
        });

        test('should URL-encode path segments in chunked upload', async () => {
            setupMockHttp();
            const content = Buffer.alloc(2 * 1024 * 1024 + 1, 0x11);

            await client.uploadToImageStore('My App/Code Package/data.zip', content);

            const path = capturedRequests[0].opts.path;
            expect(path).toContain('My%20App');
            expect(path).toContain('Code%20Package');
            expect(path).toContain('/$/UploadChunk');
        });

        test('should use unique session ID per upload', async () => {
            const uuids = ['session-aaa', 'session-bbb'];
            let callIdx = 0;
            (crypto.randomUUID as jest.Mock).mockImplementation(() => uuids[callIdx++]);

            setupMockHttp();
            const content = Buffer.alloc(2 * 1024 * 1024 + 1, 0x22);

            await client.uploadToImageStore('App1/Code.zip', content);
            expect(capturedRequests[0].opts.path).toContain('session-id=session-aaa');

            capturedRequests = [];
            setupMockHttp();
            await client.uploadToImageStore('App2/Code.zip', content);
            expect(capturedRequests[0].opts.path).toContain('session-id=session-bbb');
        });
    });

    // ===========================
    // Error handling & cleanup
    // ===========================
    describe('chunked upload error handling', () => {
        test('should delete session on chunk upload failure', async () => {
            let reqIdx = 0;
            setupMockHttp((opts, idx) => {
                if (idx === 0) {
                    // First chunk succeeds
                    return createMockResponse(200, undefined);
                }
                if (idx === 1) {
                    // Second chunk fails
                    return createMockResponse(500, 'Server Error', 'Internal Server Error');
                }
                // DELETE cleanup should succeed
                return createMockResponse(200, undefined);
            });

            const content = Buffer.alloc(4 * 1024 * 1024 + 1, 0xFF); // forces 2 chunks

            await expect(client.uploadToImageStore('App/Code.zip', content)).rejects.toThrow();

            // Should have: chunk1 (ok) + chunk2 (fail) + DELETE session (cleanup) = 3 requests
            const deleteReq = capturedRequests.find(r => r.opts.method === 'DELETE');
            expect(deleteReq).toBeDefined();
            expect(deleteReq!.opts.path).toContain('/ImageStore/$/DeleteUploadSession');
            expect(deleteReq!.opts.path).toContain('session-id=test-session-00000000-0000-0000-0000-000000000001');
        });

        test('should still throw original error even if session cleanup fails', async () => {
            setupMockHttp((opts, idx) => {
                if (idx === 0) {
                    // Chunk fails
                    return createMockResponse(503, 'Service Unavailable', 'Service Unavailable');
                }
                // DELETE also fails
                return createMockResponse(500, 'Cleanup failed', 'Internal Server Error');
            });

            const content = Buffer.alloc(2 * 1024 * 1024 + 1, 0xEE);

            await expect(client.uploadToImageStore('App/Pkg.zip', content)).rejects.toThrow('503');
        });

        test('should delete session on commit failure', async () => {
            const chunkCount = 1; // 2MB+1 → 1 chunk
            setupMockHttp((opts, idx) => {
                if (idx < chunkCount) {
                    // Chunk succeeds
                    return createMockResponse(200, undefined);
                }
                if (idx === chunkCount) {
                    // Commit fails
                    return createMockResponse(500, 'Commit failed', 'Internal Server Error');
                }
                // DELETE cleanup
                return createMockResponse(200, undefined);
            });

            const content = Buffer.alloc(2 * 1024 * 1024 + 1, 0xDD);

            await expect(client.uploadToImageStore('App/Code.zip', content)).rejects.toThrow();

            const deleteReq = capturedRequests.find(r => r.opts.method === 'DELETE');
            expect(deleteReq).toBeDefined();
        });

        test('should handle network error on small file upload', async () => {
            httpMod.request.mockImplementation((_opts: any, _callback: any) => {
                const mockReq: any = {
                    on: jest.fn((event: string, handler: any) => {
                        if (event === 'error') {
                            process.nextTick(() => handler(new Error('ECONNREFUSED')));
                        }
                        return mockReq;
                    }),
                    end: jest.fn(),
                    destroy: jest.fn(),
                    setTimeout: jest.fn(),
                    setHeader: jest.fn(),
                    write: jest.fn(() => true),
                };
                return mockReq;
            });

            const content = Buffer.from('small file');
            await expect(client.uploadToImageStore('path/file.txt', content)).rejects.toThrow();
        });
    });

    // ===========================
    // HTTPS endpoint
    // ===========================
    describe('upload with HTTPS endpoint', () => {
        test('should use https module for secure endpoint', async () => {
            const httpsMod = require('https');
            const httpsClient = new SfDirectRestClient({
                endpoint: 'https://mycluster.azure.com:19080',
                apiVersion: '6.0',
                timeout: 5000,
            });

            const capturedHttps: any[] = [];
            httpsMod.request.mockImplementation((opts: any, callback: any) => {
                capturedHttps.push(opts);
                const mockReq: any = {
                    on: jest.fn().mockReturnThis(),
                    end: jest.fn(),
                    destroy: jest.fn(),
                    setTimeout: jest.fn(),
                    setHeader: jest.fn(),
                    write: jest.fn(() => true),
                };
                const response = createMockResponse(200, undefined);
                process.nextTick(() => callback(response));
                return mockReq;
            });

            await httpsClient.uploadToImageStore('App/manifest.xml', Buffer.from('xml'));
            expect(httpsMod.request).toHaveBeenCalled();
            expect(capturedHttps[0].hostname).toBe('mycluster.azure.com');
        });
    });
});
