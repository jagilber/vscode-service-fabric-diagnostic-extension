/**
 * Unit tests for sfRestClient
 */
import * as vscode from 'vscode';
import * as azRestPipeline from '@azure/core-rest-pipeline';

// We need to mock http/https before importing the module
jest.mock('http');
jest.mock('https');

import { SfRestClient } from '../../src/sfRestClient';

describe('SfRestClient', () => {
    let client: SfRestClient;
    let mockHttpOptionsProvider: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockHttpOptionsProvider = {
            createSfAutoRestHttpOptions: jest.fn().mockReturnValue({
                host: 'localhost',
                port: 19080,
                path: '/api/test',
                protocol: 'http:',
                method: 'GET',
            }),
        };
        client = new SfRestClient(mockHttpOptionsProvider);
    });

    test('should construct without httpOptionsProvider', () => {
        const noProviderClient = new SfRestClient();
        expect(noProviderClient).toBeDefined();
    });

    test('should construct with httpOptionsProvider', () => {
        expect(client).toBeDefined();
    });

    describe('logResponseStatus', () => {
        // logResponseStatus is private but exercised through invokeRequest
        // We test via the public API indirectly
        test('should handle various status codes via sendRequest', async () => {
            // This exercises the log path when we mock http.request
            const http = require('http');
            const mockResponse = {
                statusCode: 200,
                headers: { 'content-type': 'application/json' },
                on: jest.fn((event: string, handler: any) => {
                    if (event === 'data') {
                        handler(Buffer.from('{"result":"ok"}'));
                    }
                    if (event === 'end') {
                        handler();
                    }
                    return mockResponse;
                }),
            };

            const mockRequest = {
                on: jest.fn().mockReturnThis(),
                end: jest.fn(),
                destroy: jest.fn(),
            };

            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockRequest;
            });

            const result = await client.invokeRequest({
                host: 'localhost',
                port: 19080,
                path: '/api/test',
                protocol: 'http:',
            });

            expect(result).toBe('{"result":"ok"}');
        });
    });

    describe('sendRequest', () => {
        test('should call httpOptionsProvider and return pipeline response', async () => {
            const http = require('http');
            const mockResponse = {
                statusCode: 200,
                headers: { 'content-type': 'application/json' },
                on: jest.fn((event: string, handler: any) => {
                    if (event === 'data') {
                        handler(Buffer.from('{"data":"value"}'));
                    }
                    if (event === 'end') {
                        handler();
                    }
                    return mockResponse;
                }),
            };

            const mockRequest = {
                on: jest.fn().mockReturnThis(),
                end: jest.fn(),
                destroy: jest.fn(),
            };

            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockRequest;
            });

            const pipelineRequest: azRestPipeline.PipelineRequest = {
                url: 'http://localhost:19080/api/test',
                method: 'GET',
                headers: azRestPipeline.createHttpHeaders(),
                timeout: 30000,
                withCredentials: false,
                requestId: 'test-id',
                body: undefined,
            };

            const response = await client.sendRequest(pipelineRequest);
            expect(response.status).toBe(200);
            expect(response.bodyAsText).toBe('{"data":"value"}');
        });

        test('should handle error responses', async () => {
            const http = require('http');
            const mockResponse = {
                statusCode: 404,
                statusMessage: 'Not Found',
                headers: {},
                on: jest.fn((event: string, handler: any) => {
                    if (event === 'data') {
                        handler(Buffer.from('Not found'));
                    }
                    if (event === 'end') {
                        handler();
                    }
                    return mockResponse;
                }),
            };

            const mockRequest = {
                on: jest.fn().mockReturnThis(),
                end: jest.fn(),
                destroy: jest.fn(),
            };

            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockRequest;
            });

            const pipelineRequest: azRestPipeline.PipelineRequest = {
                url: 'http://localhost:19080/api/test',
                method: 'GET',
                headers: azRestPipeline.createHttpHeaders(),
                timeout: 30000,
                withCredentials: false,
                requestId: 'test-id',
                body: undefined,
            };

            await expect(client.sendRequest(pipelineRequest)).rejects.toMatchObject({
                statusCode: 404,
            });
        });
    });

    describe('invokeRequest', () => {
        test('should return response body on success', async () => {
            const http = require('http');
            const mockResponse = {
                statusCode: 200,
                headers: {},
                on: jest.fn((event: string, handler: any) => {
                    if (event === 'data') {
                        handler(Buffer.from('success'));
                    }
                    if (event === 'end') {
                        handler();
                    }
                    return mockResponse;
                }),
            };

            const mockRequest = {
                on: jest.fn().mockReturnThis(),
                end: jest.fn(),
            };

            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockRequest;
            });

            const result = await client.invokeRequest({
                host: 'localhost',
                port: 19080,
                path: '/test',
                protocol: 'http:',
            });

            expect(result).toBe('success');
        });

        test('should reject on request error', async () => {
            const http = require('http');
            const mockRequest = {
                on: jest.fn((event: string, handler: any) => {
                    if (event === 'error') {
                        // Trigger error asynchronously
                        process.nextTick(() => handler(new Error('connection refused')));
                    }
                    return mockRequest;
                }),
                end: jest.fn(),
            };

            http.request.mockImplementation(() => mockRequest);

            await expect(
                client.invokeRequest({
                    host: 'localhost',
                    port: 19080,
                    path: '/test',
                    protocol: 'http:',
                })
            ).rejects.toThrow();
        });
    });
});
