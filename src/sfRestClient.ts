import { ResourceManagementClient } from '@azure/arm-resources';
import { SubscriptionClient } from '@azure/arm-subscriptions';
import { apiUtils } from '@microsoft/vscode-azext-utils';
import * as armServiceFabric from '@azure/arm-servicefabric';
import * as azureIdentity from '@azure/identity';
import * as serviceFabric from '@azure/servicefabric';
import { PipelineRequest, PipelineResponse } from '@azure/core-rest-pipeline';
import { OperationArguments, OperationSpec } from '@azure/core-client';

import { ServiceFabricManagementClient } from './sdk/servicefabric/arm-servicefabric/src/serviceFabricManagementClient';
import { ServiceFabricClientAPIs } from './sdk/servicefabric/servicefabric/src/serviceFabricClientAPIs';

import * as url from 'url';
import * as https from 'https';
import * as tls from 'tls';
import * as vscode from 'vscode';
import * as os from 'os';
import { serviceFabricClusterView } from './serviceFabricClusterView.js';
import { SFUtility, debugLevel } from './sfUtility';
import { SFRest } from './sfRest';
import { ClientRequest, RequestOptions } from 'http';
import { ServiceClient } from '@azure/core-client';


export class SfRestClient {

    private endpoint = '';
    private requestContentType = '';
    private allowInsecureConnection = true;
    private httpClient: any;
    private pipeline: any;
    private sfRest: SFRest | undefined;

    /**
     * The ServiceClient constructor
     * @param credential - The credentials used for authentication with the service.
     * @param options - The service client options that govern the behavior of the client.
     */

    constructor(options?: SFRest) {
        SFUtility.outputLog('SfRestClient:constructor');
        this.sfRest = options;
    }

    public async sendRequest(request: PipelineRequest): Promise<PipelineResponse> {
        SFUtility.outputLog('SfRestClient:sendRequest');
        //return await this.pipeline.sendRequest(request);
        //const options = this.sfRest?.createHttpOptions(request.url.replace('http://', 'https://'));
        const options = this.sfRest?.createSfAutoRestHttpOptions(request.url.replace('http://', 'https://'));
        return new Promise((request, resolve) => {
            this.invokeRequest(options);
        });
    }

    /**
     * Send an HTTP request that is populated using the provided OperationSpec.
     * @typeParam T - The typed result of the request, based on the OperationSpec.
     * @param operationArguments - The arguments that the HTTP request's templated values will be populated from.
     * @param operationSpec - The OperationSpec to use to populate the httpRequest.
     */

    public async sendOperationRequest<T>(operationArguments: OperationArguments, operationSpec: OperationSpec): Promise<T> {
        SFUtility.outputLog('SfRestClient:sendOperationRequest');
        return await this.pipeline.sendOperationRequest(operationArguments, operationSpec);
    }

    public async invokeRequest(httpOptions: any | https.RequestOptions | tls.ConnectionOptions): Promise<ClientRequest | string | undefined> {
        SFUtility.outputLog(`invokeRequest:httpOptions:${httpOptions.method} https://${httpOptions.host}:${httpOptions.port}${httpOptions.path}`);
        try {
            const promise: Promise<ClientRequest | string> = new Promise<ClientRequest | string>((resolve, reject) => {
                const result: ClientRequest = https.request(httpOptions, (response) => {
                    let data = '';

                    response.on('error', (error: any) => {
                        SFUtility.outputLog(error, null, debugLevel.error);
                        reject(error);
                    });

                    response.on('data', (chunk: any) => {
                        SFUtility.outputLog(`invokeRequest:response data length:${chunk.length}`, null, debugLevel.info);
                        const jObject = JSON.parse(chunk);

                        if (jObject.CancellationToken) {
                            SFUtility.outputLog(`invokeRequest:response CancellationToken:${jObject.CancellationToken}`, null, debugLevel.info);
                            httpOptions.CancellationToken = jObject.CancellationToken;
                            data += this.invokeRequest(httpOptions);
                        }
                        else {
                            httpOptions.CancellationToken = null;
                        }

                        if (jObject.Items) {
                            SFUtility.outputLog(`invokeRequest:response Items:${jObject.Items.length}`, null, debugLevel.info);
                            for (const item of jObject.Items) {
                                SFUtility.outputLog(`invokeRequest:response Item:`, item, debugLevel.info);
                                data += item;
                            }
                        }
                        else {
                            SFUtility.outputLog(`invokeRequest:response Items:0`, null, debugLevel.info);
                            data += chunk;
                        }
                    });

                    response.on('end', () => {
                        SFUtility.outputLog('invokeRequest:request end', null, debugLevel.info);
                        SFUtility.outputLog(`invokeRequest:resolve(data):${JSON.stringify(data)}`, null, debugLevel.info);
                        resolve(data);
                    });
                }).on('error', (error: any) => {
                    SFUtility.outputLog('invokeRequest:request error:', error, debugLevel.error);
                    SFUtility.outputLog(error);
                }).on('timeout', () => {
                    SFUtility.outputLog("invokeRequest:request timed out", null, debugLevel.error);
                }).on('connect', () => {
                    SFUtility.outputLog("invokeRequest:request connected");
                }).on('continue', () => {
                    SFUtility.outputLog("invokeRequest:request continue");
                    //  }).on('response', (response: any) => {
                    //     this.debuglog('invokeRestApi:response');
                    //     this.debuglog(response);
                    //     switch (response.statusCode) {
                    //         case 200:
                    //             this.debuglog("Request succeeded");
                    //             break;
                    //         case 201:
                    //             this.debuglog("Request created");
                    //             break;
                    //         case 202:
                    //             this.debuglog("Request accepted");
                    //             break;
                    //         case 204:
                    //             this.debuglog("Request no content", debugLevel.warn);
                    //             break;
                    //         case 400:
                    //             this.debuglog("Request bad request", debugLevel.error);
                    //             break;
                    //         case 401:
                    //             this.debuglog("Request unauthorized", debugLevel.error);
                    //             break;
                    //         case 403:
                    //             this.debuglog("Request forbidden", debugLevel.error);
                    //             break;
                    //         case 404:
                    //             this.debuglog("Request not found", debugLevel.error);
                    //             break;
                    //         case 405:
                    //             this.debuglog("Request method not allowed", debugLevel.error);
                    //             break;
                    //         case 409:
                    //             this.debuglog("Request conflict", debugLevel.error);
                    //             break;
                    //         case 412:
                    //             this.debuglog("Request precondition failed");
                    //             break;
                    //     }
                    // // }).on('data', (data: any) => {
                    // //     this.debuglog('invokeRestApi:data');
                    // //     this.debuglog(data);
                    //  }).on('finish', () => {
                    //     this.debuglog("Request ended");
                    // }).on('close', () => {
                    //     this.debuglog("Request closed");
                });


                result.end();
            });
            return promise;
        }
        catch (error) {
            SFUtility.showError(`invokeRequest:error:${JSON.stringify(error)}`);
        }
    }

}