import { ResourceManagementClient } from '@azure/arm-resources';
import { SubscriptionClient } from '@azure/arm-subscriptions';
import { apiUtils } from '@microsoft/vscode-azext-utils';
import * as armServiceFabric from '@azure/arm-servicefabric';
import * as azureIdentity from '@azure/identity';
import * as serviceFabric from '@azure/servicefabric';
import * as azRestPipeline from '@azure/core-rest-pipeline';
import { OperationArguments, OperationSpec } from '@azure/core-client';

import { ServiceFabricManagementClient } from './sdk/servicefabric/arm-servicefabric/src/serviceFabricManagementClient';
import { ServiceFabricClientAPIs } from './sdk/servicefabric/servicefabric/src/serviceFabricClientAPIs';
import * as sfModels from './sdk/servicefabric/servicefabric/src/models';

import * as url from 'url';
import * as https from 'https';
import * as tls from 'tls';
import * as vscode from 'vscode';
import * as os from 'os';
import { serviceFabricClusterView } from './serviceFabricClusterView.js';
import { SfUtility, debugLevel } from './sfUtility';
import { SfRest } from './sfRest';
import { ClientRequest, RequestOptions } from 'http';
import { ServiceClient } from '@azure/core-client';
import { inherits } from 'util';
import { Http2ServerRequest } from 'http2';


export class SfRestClient {

    private endpoint = '';
    private requestContentType = '';
    private allowInsecureConnection = true;
    private httpClient: any;
    private pipeline: any;
    private sfRest: SfRest | undefined;

    /**
     * The ServiceClient constructor
     * @param credential - The credentials used for authentication with the service.
     * @param options - The service client options that govern the behavior of the client.
     */

    constructor(options?: SfRest) {
        SfUtility.outputLog('SfRestClient:constructor');
        this.sfRest = options;
    }

    public async getServerCertificate(clusterHttpEndpoint:string): Promise<azRestPipeline.PipelineResponse> {
        const pipelineRequest:azRestPipeline.PipelineRequest = azRestPipeline.createPipelineRequest({
            url: clusterHttpEndpoint,
            headers: this.sfRest?.createSfAutoRestHttpHeaders()
        });
        
        const options = this.sfRest?.createSfAutoRestHttpOptions(clusterHttpEndpoint);
        options.requestCert = true;

        return new Promise<azRestPipeline.PipelineResponse>((resolve, reject) => {
            this.invokeRequest(options)
                .then((response: any) => {
                    SfUtility.outputLog(`sendRequest:response:${response}`);

                    const pipelineResponse: azRestPipeline.PipelineResponse = {
                        request: pipelineRequest,
                        status: 200,
                        headers: pipelineRequest.headers,
                        bodyAsText: response,
                        //bodyAsJson: JSON.parse(response),
                        //bodyAsByteArray: Buffer.from(response),
                        //body: response
                    };
                    resolve(pipelineResponse);
                }
                ).catch((error: any) => {
                    SfUtility.outputLog(`sendRequest:error:${error}`);
                    resolve(error);
                });
        });
    }


    public async sendRequest(request: azRestPipeline.PipelineRequest): Promise<azRestPipeline.PipelineResponse> {
        SfUtility.outputLog('SfRestClient:sendRequest');
        //return await this.pipeline.sendRequest(request);
        //const options = this.sfRest?.createHttpOptions(request.url.replace('http://', 'https://'));
        const options = this.sfRest?.createSfAutoRestHttpOptions(request.url.replace('http://', 'https://'));
        return new Promise<azRestPipeline.PipelineResponse>((resolve, reject) => {
            this.invokeRequest(options)
                .then((response: any) => {
                    SfUtility.outputLog(`sendRequest:response:${response}`);

                    const pipelineResponse: azRestPipeline.PipelineResponse = {
                        request: request,
                        status: 200,
                        headers: request.headers,
                        bodyAsText: response,
                        //bodyAsJson: JSON.parse(response),
                        //bodyAsByteArray: Buffer.from(response),
                        //body: response
                    };
                    resolve(pipelineResponse);
                }
                ).catch((error: any) => {
                    SfUtility.outputLog(`sendRequest:error:${error}`);
                    resolve(error);
                });
        });
    }

    public async invokeRequest(httpOptions: any | https.RequestOptions | tls.ConnectionOptions): Promise<ClientRequest | string | undefined> {
        SfUtility.outputLog(`invokeRequest:httpOptions:${httpOptions.method} https://${httpOptions.host}:${httpOptions.port}${httpOptions.path}`);
        try {
            const promise: Promise<ClientRequest | string> = new Promise<ClientRequest | string>((resolve, reject) => {
                const result: ClientRequest = https.request(httpOptions, (response) => {
                    let data = '';

                    response.on('error', (error: any) => {
                        SfUtility.outputLog(error, null, debugLevel.error);
                        reject(error);
                    });

                    response.on('data', (chunk: any) => {
                        SfUtility.outputLog(`invokeRequest:response data length:${chunk.length}`, null, debugLevel.info);
                        // const jObject = JSON.parse(chunk);

                        // if (jObject.CancellationToken) {
                        //     SFUtility.outputLog(`invokeRequest:response CancellationToken:${jObject.CancellationToken}`, null, debugLevel.info);
                        //     httpOptions.CancellationToken = jObject.CancellationToken;
                        //     data += this.invokeRequest(httpOptions);
                        // }
                        // else {
                        //     httpOptions.CancellationToken = null;
                        // }

                        // if (jObject.Items) {
                        //     SFUtility.outputLog(`invokeRequest:response Items:${jObject.Items.length}`, null, debugLevel.info);
                        //     for (const item of jObject.Items) {
                        //         SFUtility.outputLog(`invokeRequest:response Item:`, item, debugLevel.info);
                        //         data += item;
                        //     }
                        // }
                        // else {
                        //     SFUtility.outputLog(`invokeRequest:response Items:0`, null, debugLevel.info);
                        data += chunk;
                        // }
                    });

                    response.on('end', () => {
                        SfUtility.outputLog('invokeRequest:request end', null, debugLevel.info);
                        SfUtility.outputLog(`invokeRequest:resolve(data):${JSON.stringify(data)}`, null, debugLevel.info);
                        resolve(data);
                    });
                }).on('error', (error: any) => {
                    SfUtility.outputLog('invokeRequest:request error:', error, debugLevel.error);
                    SfUtility.outputLog(error);
                }).on('timeout', () => {
                    SfUtility.outputLog("invokeRequest:request timed out", null, debugLevel.error);
                }).on('connect', (connect: any) => {
                    SfUtility.outputLog("invokeRequest:request connected", connect);
                // }).on('socket', (socket: any) => {
                //     SFUtility.outputLog("invokeRequest:request socket", socket);
                }).on('response', (response: any, socket: any, head: Buffer) => {
                    SfUtility.outputLog(`invokeRequest:response status code:${response.statusCode}`, response);
                    switch (response.statusCode) {
                        case 200:
                            SfUtility.outputLog("Request succeeded");
                            break;
                        case 201:
                            SfUtility.outputLog("Request created");
                            break;
                        case 202:
                            SfUtility.outputLog("Request accepted");
                            break;
                        case 204:
                            SfUtility.outputLog("Request no content", null, debugLevel.warn);
                            break;
                        case 400:
                            SfUtility.outputLog("Request bad request", null, debugLevel.error);
                            break;
                        case 401:
                            SfUtility.outputLog("Request unauthorized", null, debugLevel.error);
                            break;
                        case 403:
                            SfUtility.outputLog("Request forbidden", null, debugLevel.error);
                            break;
                        case 404:
                            SfUtility.outputLog("Request not found", null, debugLevel.error);
                            break;
                        case 405:
                            SfUtility.outputLog("Request method not allowed", null, debugLevel.error);
                            break;
                        case 409:
                            SfUtility.outputLog("Request conflict", null, debugLevel.error);
                            break;
                        case 412:
                            SfUtility.outputLog("Request precondition failed");
                            break;
                    }
                    // }).on('data', (data: any) => {
                    //     SFUtility.outputLog('invokeRestApi:data');
                    //     SFUtility.outputLog(data);
                }).on('finish', () => {
                    SfUtility.outputLog("Request ended");
                }).on('close', () => {
                    SfUtility.outputLog("Request closed");
                }).on('continue', () => {
                    SfUtility.outputLog("invokeRequest:request continue");
                });


                result.end();
            });
            return promise;
        }
        catch (error) {
            SfUtility.showError(`invokeRequest:error:${JSON.stringify(error)}`);
        }
    }
    
    public async sendOperationRequest<T>(operationArguments: OperationArguments, operationSpec: OperationSpec): Promise<T> {
        SfUtility.outputLog('SfRestClient:sendOperationRequest');
        return await this.pipeline.sendOperationRequest(operationArguments, operationSpec);
    }

}