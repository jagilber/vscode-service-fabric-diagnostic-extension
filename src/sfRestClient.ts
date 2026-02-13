import * as azRestPipeline from '@azure/core-rest-pipeline';
import { OperationArguments, OperationSpec } from '@azure/core-client';
import * as https from 'https';
import * as http from 'http';
import * as tls from 'tls';
import { SfUtility, debugLevel } from './sfUtility';
import { IHttpOptionsProvider } from './interfaces/IHttpOptionsProvider';
import { ClientRequest } from 'http';
import { NetworkError, HttpError } from './models/Errors';
import { SfApiResponse } from './models/SfApiResponse';



export class SfRestClient {

    private endpoint = '';
    private requestContentType = '';
    private allowInsecureConnection = true;
    private httpClient: any;
    private pipeline: any;
    private httpOptionsProvider: IHttpOptionsProvider | undefined;

    /**
     * The ServiceClient constructor
     * @param httpOptionsProvider - Provider for HTTP options configuration
     */

    constructor(httpOptionsProvider?: IHttpOptionsProvider) {
        SfUtility.outputLog('SfRestClient:constructor');
        this.httpOptionsProvider = httpOptionsProvider;
    }

    public async sendRequest(request: azRestPipeline.PipelineRequest): Promise<azRestPipeline.PipelineResponse> {
        SfUtility.outputLog('SfRestClient:sendRequest');
        const options = this.httpOptionsProvider?.createSfAutoRestHttpOptions(request.url);
        
        // Preserve the HTTP method from the Azure SDK request (POST, GET, etc.)
        if (options && request.method) {
            (options as any).method = request.method;
        }
        
        return new Promise<azRestPipeline.PipelineResponse>((resolve, reject) => {
            this.invokeRequestWithFullResponse(options)
                .then((httpResponse) => {
                    SfUtility.outputLog(`sendRequest:response:status=${httpResponse.statusCode}`);

                    // Create proper RawHttpHeaders from HTTP response headers
                    const responseHeaders = azRestPipeline.createHttpHeaders(httpResponse.headers as any || {});

                    const pipelineResponse: azRestPipeline.PipelineResponse = {
                        request: request,
                        status: httpResponse.statusCode || 200,
                        headers: responseHeaders,
                        bodyAsText: httpResponse.body
                    };
                    resolve(pipelineResponse);
                })
                .catch((error: any) => {
                    SfUtility.outputLog(`sendRequest:error:${error}`);
                    // For errors, still return a proper response structure with headers
                    const errorHeaders = azRestPipeline.createHttpHeaders(
                        error.response?.headers || {}
                    );
                    const errorResponse: azRestPipeline.PipelineResponse = {
                        request: request,
                        status: error.statusCode || error.status || 500,
                        headers: errorHeaders,
                        bodyAsText: error.body || error.message || ''
                    };
                    
                    // Azure SDK expects RestError with response attached
                    const restError = Object.assign(error, {
                        request: request,
                        response: errorResponse,
                        statusCode: errorResponse.status,
                        code: error.code || `HTTP_${errorResponse.status}`
                    });
                    reject(restError);
                });
        });
    }

    /**
     * Invoke HTTP request and return full response (status, headers, body)
     */
    private async invokeRequestWithFullResponse(httpOptions: https.RequestOptions | tls.ConnectionOptions | any): Promise<{ statusCode: number, headers: Record<string, string | string[]>, body: string }> {
        const method = httpOptions.method || 'GET';
        const protocol = httpOptions.protocol 
            ? httpOptions.protocol.replace(':', '') 
            : (httpOptions.port === 80 ? 'http' : 'https');
        SfUtility.outputLog(`invokeRequestWithFullResponse:${method} ${protocol}://${httpOptions.host}:${httpOptions.port}${httpOptions.path}`);
        const startTime = Date.now();
        
        try {
            return await new Promise<{ statusCode: number, headers: Record<string, string | string[]>, body: string }>((resolve, reject) => {
                const chunks: Buffer[] = [];
                
                const requestModule = protocol === 'http' ? http : https;
                const request = requestModule.request(httpOptions, (response) => {
                    this.logResponseStatus(response.statusCode);
                    
                    response.on('error', (error) => {
                        SfUtility.outputLog('Response error', error, debugLevel.error);
                        reject(new NetworkError('Response error', { cause: error }));
                    });

                    response.on('data', (chunk: Buffer) => {
                        chunks.push(chunk);
                        SfUtility.outputLog(
                            `Received chunk: ${chunk.length} bytes, total: ${chunks.length} chunks`,
                            null,
                            debugLevel.debug
                        );
                    });

                    response.on('end', () => {
                        const body = chunks.length > 0 ? Buffer.concat(chunks as any).toString('utf-8') : '';
                        const durationMs = Date.now() - startTime;
                        
                        // Return full response with status, headers, and body
                        const fullResponse: any = {
                            statusCode: response.statusCode || 200,
                            headers: response.headers || {},
                            body: body
                        };
                        
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode < 400) {
                            // Log success via base response class
                            SfApiResponse.fromSdkResponse(method, httpOptions.path || '', response.statusCode, response.statusMessage || '', body, durationMs, true).log();
                            resolve(fullResponse);
                        } else {
                            // Log error via base response class
                            SfApiResponse.fromSdkResponse(method, httpOptions.path || '', response.statusCode || 0, response.statusMessage || '', body, durationMs, false).log();
                            const error = new HttpError(
                                `HTTP ${response.statusCode}: ${response.statusMessage}`,
                                { 
                                    status: response.statusCode || 0, 
                                    url: `${protocol}://${httpOptions.host}:${httpOptions.port}${httpOptions.path}`,
                                    body: body
                                } as any
                            );
                            // Include headers in error for redirect policy
                            (error as any).response = fullResponse;
                            reject(error);
                        }
                    });
                });

                request.on('error', (error) => {
                    SfUtility.outputLog('Request error', error, debugLevel.error);
                    reject(new NetworkError('Request failed', { cause: error }));
                });

                request.on('timeout', () => {
                    request.destroy();
                    SfUtility.outputLog('Request timed out', null, debugLevel.error);
                    reject(new NetworkError('Request timed out'));
                });

                request.on('connect', () => {
                    SfUtility.outputLog('Request connected', null, debugLevel.debug);
                });

                request.end();
            });
        } catch (error) {
            const message = `invokeRequestWithFullResponse failed: ${error}`;
            SfUtility.outputLog(message, error, debugLevel.error);
            throw error;
        }
    }

    /**
     * Invoke HTTP request with proper async/await pattern (returning just body for backward compatibility)
     */
    public async invokeRequest(httpOptions: https.RequestOptions | tls.ConnectionOptions | any): Promise<string> {
        const fullResponse = await this.invokeRequestWithFullResponse(httpOptions);
        return fullResponse.body;
    }

    /**
     * Log HTTP response status with appropriate level
     */
    private logResponseStatus(statusCode?: number): void {
        if (!statusCode) {
            return;
        }

        const messages: Record<number, [string, debugLevel]> = {
            200: ['Request succeeded', debugLevel.info],
            201: ['Request created', debugLevel.info],
            202: ['Request accepted', debugLevel.info],
            204: ['Request no content', debugLevel.warn],
            400: ['Request bad request', debugLevel.error],
            401: ['Request unauthorized', debugLevel.error],
            403: ['Request forbidden', debugLevel.error],
            404: ['Request not found', debugLevel.error],
            405: ['Request method not allowed', debugLevel.error],
            409: ['Request conflict', debugLevel.error],
            412: ['Request precondition failed', debugLevel.warn]
        };

        const [message, level] = messages[statusCode] || [`HTTP ${statusCode}`, debugLevel.info];
        SfUtility.outputLog(message, null, level);
    }

    public async sendOperationRequest<T>(operationArguments: OperationArguments, operationSpec: OperationSpec): Promise<T> {
        SfUtility.outputLog('SfRestClient:sendOperationRequest');
        return await this.pipeline.sendOperationRequest(operationArguments, operationSpec);
    }

}