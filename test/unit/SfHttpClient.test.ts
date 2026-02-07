/**
 * Unit tests for SfHttpClient
 */
jest.mock('http');
jest.mock('https');
jest.mock('fs');

import { SfHttpClient } from '../../src/utils/SfHttpClient';

describe('SfHttpClient', () => {
    let client: SfHttpClient;

    function createMockResponse(statusCode: number, body: string, headers: Record<string, string> = {}) {
        const mockResponse: any = {
            statusCode,
            statusMessage: statusCode === 200 ? 'OK' : 'Error',
            headers,
            on: jest.fn((event: string, handler: any) => {
                if (event === 'data') {
                    handler(Buffer.from(body));
                }
                if (event === 'end') {
                    process.nextTick(handler);
                }
                return mockResponse;
            }),
            pipe: jest.fn(),
        };
        return mockResponse;
    }

    function createMockRequest(mockResponse?: any) {
        const mockReq: any = {
            on: jest.fn().mockReturnThis(),
            end: jest.fn(),
            destroy: jest.fn(),
        };

        if (mockResponse) {
            const http = require('http');
            const https = require('https');
            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });
            https.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });
        }

        return mockReq;
    }

    beforeEach(() => {
        jest.clearAllMocks();
        client = new SfHttpClient({ timeout: 5000 });
    });

    test('should construct with default options', () => {
        const defaultClient = new SfHttpClient();
        expect(defaultClient).toBeDefined();
    });

    test('should construct with custom options', () => {
        const customClient = new SfHttpClient({
            timeout: 30000,
            certificate: 'cert',
            key: 'key',
            rejectUnauthorized: true,
        });
        expect(customClient).toBeDefined();
    });

    describe('get', () => {
        test('should make GET request via http', async () => {
            const mockResponse = createMockResponse(200, '{"result":"ok"}');
            createMockRequest(mockResponse);

            const result = await client.get('http://localhost:19080/api/test');
            expect(result).toBe('{"result":"ok"}');
        });

        test('should make GET request via https', async () => {
            const mockResponse = createMockResponse(200, '{"result":"ok"}');
            createMockRequest(mockResponse);

            const result = await client.get('https://localhost:19080/api/test');
            expect(result).toBe('{"result":"ok"}');
        });

        test('should reject on HTTP error', async () => {
            const mockResponse = createMockResponse(500, 'Internal Server Error');
            createMockRequest(mockResponse);

            await expect(client.get('http://localhost:19080/api/test')).rejects.toThrow();
        });

        test('should reject on request error', async () => {
            const http = require('http');
            const mockReq: any = {
                on: jest.fn((event: string, handler: any) => {
                    if (event === 'error') {
                        process.nextTick(() => handler(new Error('ECONNREFUSED')));
                    }
                    return mockReq;
                }),
                end: jest.fn(),
                destroy: jest.fn(),
            };

            http.request.mockImplementation(() => mockReq);

            await expect(client.get('http://localhost:19080/api/test')).rejects.toThrow();
        });

        test('should reject on timeout', async () => {
            const http = require('http');
            const mockReq: any = {
                on: jest.fn((event: string, handler: any) => {
                    if (event === 'timeout') {
                        process.nextTick(handler);
                    }
                    return mockReq;
                }),
                end: jest.fn(),
                destroy: jest.fn(),
            };

            http.request.mockImplementation(() => mockReq);

            await expect(client.get('http://localhost:19080/api/test')).rejects.toThrow();
        });
    });

    describe('download', () => {
        test('should download file on success', async () => {
            const fs = require('fs');
            const https = require('https');
            const mockResponse = createMockResponse(200, 'filedata', { 'content-length': '8' });

            // Mock pipe for fileStream
            mockResponse.pipe = jest.fn();
            mockResponse.on = jest.fn((event: string, handler: any) => {
                if (event === 'data') {
                    handler(Buffer.from('filedata'));
                }
                return mockResponse;
            });

            const fileStream: any = {
                on: jest.fn((event: string, handler: any) => {
                    if (event === 'finish') {
                        process.nextTick(handler);
                    }
                    return fileStream;
                }),
                close: jest.fn(),
            };

            fs.createWriteStream.mockReturnValue(fileStream);

            const mockReq: any = {
                on: jest.fn().mockReturnThis(),
                end: jest.fn(),
                destroy: jest.fn(),
            };

            https.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });

            const progressCallback = jest.fn();
            await client.download('https://example.com/file.exe', '/tmp/file.exe', progressCallback);
            expect(fs.createWriteStream).toHaveBeenCalledWith('/tmp/file.exe');
        });

        test('should reject on download error status', async () => {
            const fs = require('fs');
            const https = require('https');
            const mockResponse = createMockResponse(404, 'Not Found');

            const fileStream: any = {
                on: jest.fn().mockReturnThis(),
                close: jest.fn(),
            };

            fs.createWriteStream.mockReturnValue(fileStream);
            fs.unlink.mockImplementation((_path: string, cb: any) => cb());

            const mockReq: any = {
                on: jest.fn().mockReturnThis(),
                end: jest.fn(),
                destroy: jest.fn(),
            };

            https.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });

            await expect(client.download('https://example.com/file.exe', '/tmp/file.exe')).rejects.toThrow();
        });
    });
});
