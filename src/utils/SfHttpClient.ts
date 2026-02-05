/**
 * Clean HTTP client implementation without Promise constructor anti-patterns
 * Replaces the problematic patterns in sfMgr and sfRest
 */

import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import { SfUtility, debugLevel } from '../sfUtility';
import { NetworkError, HttpError } from '../models/Errors';

export interface HttpClientOptions {
    timeout?: number;
    certificate?: string;
    key?: string;
    rejectUnauthorized?: boolean;
}

export interface RequestOptions {
    headers?: Record<string, string>;
    method?: string;
}

/**
 * Clean HTTP client with proper async/await patterns
 */
export class SfHttpClient {
    private readonly defaultTimeout: number = 9000;

    constructor(private readonly options: HttpClientOptions = {}) {}

    /**
     * Perform HTTP GET request with proper chunking and error handling
     * @param url URL to fetch
     * @param requestOptions Optional request configuration
     * @returns Response body as string
     */
    public async get(url: string, requestOptions?: RequestOptions): Promise<string> {
        try {
            return await this.request(url, { ...requestOptions, method: 'GET' });
        } catch (error) {
            SfUtility.outputLog(`GET request failed: ${url}`, error, debugLevel.error);
            throw error;
        }
    }

    /**
     * Core request method with proper Promise handling
     */
    private async request(url: string, requestOptions?: RequestOptions): Promise<string> {
        return new Promise((resolve, reject) => {
            const parsedUrl = new URL(url);
            const isHttps = parsedUrl.protocol === 'https:';
            
            const options: https.RequestOptions = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || (isHttps ? 443 : 80),
                path: parsedUrl.pathname + parsedUrl.search,
                method: requestOptions?.method || 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    ...requestOptions?.headers
                },
                timeout: this.options.timeout ?? this.defaultTimeout,
                cert: this.options.certificate,
                key: this.options.key,
                rejectUnauthorized: this.options.rejectUnauthorized ?? false
            };

            const client = isHttps ? https : http;
            const request = client.request(options, (response) => {
                const chunks: Buffer[] = [];
                
                // Properly buffer chunks - NO parsing until complete
                response.on('data', (chunk: Buffer) => {
                    chunks.push(chunk);
                    SfUtility.outputLog(
                        `Received chunk: ${chunk.length} bytes`,
                        null,
                        debugLevel.debug
                    );
                });
                
                response.on('end', () => {
                    const body = Buffer.concat(chunks as any).toString('utf-8');
                    
                    if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
                        SfUtility.outputLog(
                            `Request completed: ${response.statusCode} ${url}`,
                            null,
                            debugLevel.info
                        );
                        resolve(body);
                    } else {
                        const error = new HttpError(
                            `HTTP ${response.statusCode}: ${response.statusMessage}`,
                            { status: response.statusCode || 0, url }
                        );
                        reject(error);
                    }
                });

                response.on('error', (error) => {
                    SfUtility.outputLog(`Response error: ${url}`, error, debugLevel.error);
                    reject(new NetworkError(`Response error for ${url}`, { cause: error }));
                });
            });

            request.on('error', (error) => {
                SfUtility.outputLog(`Request error: ${url}`, error, debugLevel.error);
                reject(new NetworkError(`Request to ${url} failed`, { cause: error }));
            });

            request.on('timeout', () => {
                request.destroy();
                const error = new NetworkError(
                    `Request to ${url} timed out after ${this.options.timeout || this.defaultTimeout}ms`,
                    { timeout: this.options.timeout || this.defaultTimeout, url }
                );
                reject(error);
            });

            request.end();
        });
    }

    /**
     * Download file with progress reporting
     * @param url URL to download from
     * @param outputPath Local file path to save to
     * @param onProgress Optional progress callback
     */
    public async download(
        url: string,
        outputPath: string,
        onProgress?: (downloadedBytes: number, totalBytes?: number) => void
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const parsedUrl = new URL(url);
            const fileStream = fs.createWriteStream(outputPath);
            let downloadedBytes = 0;
            let totalBytes: number | undefined;

            const options: https.RequestOptions = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || 443,
                path: parsedUrl.pathname + parsedUrl.search,
                method: 'GET',
                timeout: this.options.timeout ?? 30000 // Longer timeout for downloads
            };

            const request = https.request(options, (response) => {
                // Get total size from Content-Length header
                const contentLength = response.headers['content-length'];
                if (contentLength) {
                    totalBytes = parseInt(contentLength, 10);
                }

                if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
                    response.on('data', (chunk: Buffer) => {
                        downloadedBytes += chunk.length;
                        onProgress?.(downloadedBytes, totalBytes);
                    });

                    response.pipe(fileStream);

                    fileStream.on('finish', () => {
                        fileStream.close();
                        SfUtility.outputLog(
                            `Downloaded ${downloadedBytes} bytes to ${outputPath}`,
                            null,
                            debugLevel.info
                        );
                        resolve();
                    });

                    fileStream.on('error', (error) => {
                        fileStream.close();
                        fs.unlink(outputPath, () => { /* Intentionally empty - fire and forget */ });
                        reject(new NetworkError(`File write error for ${outputPath}`, { cause: error }));
                    });
                } else {
                    fileStream.close();
                    fs.unlink(outputPath, () => { /* Intentionally empty - fire and forget */ });
                    reject(new HttpError(
                        `Download failed with status ${response.statusCode}`,
                        { status: response.statusCode || 0, url }
                    ));
                }
            });

            request.on('error', (error) => {
                fileStream.close();
                fs.unlink(outputPath, () => { /* Intentionally empty - fire and forget */ });
                reject(new NetworkError(`Download from ${url} failed`, { cause: error }));
            });

            request.on('timeout', () => {
                request.destroy();
                fileStream.close();
                fs.unlink(outputPath, () => { /* Intentionally empty - fire and forget */ });
                reject(new NetworkError(`Download from ${url} timed out`, { url }));
            });

            request.end();
        });
    }
}
