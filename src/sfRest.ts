/* eslint-disable @typescript-eslint/ban-ts-comment */
// https://learn.microsoft.com/en-us/rest/api/servicefabric/
//https://code.visualstudio.com/api/get-started/your-first-extension
//https://learn.microsoft.com/en-us/rest/api/azure/
//https://github.com/microsoft/vscode-azure-account
//import { AzureAccountExtensionApi, AzureSession } from '@azure/azure-account';
//https://github.com/Microsoft/vscode-azuretools
//C:\Users\user\.vscode\extensions
//https://code.visualstudio.com/api
//https://code.visualstudio.com/api/advanced-topics/extension-host
//https://code.visualstudio.com/api/references/vscode-api

import { ResourceManagementClient } from '@azure/arm-resources';
import { SubscriptionClient } from '@azure/arm-subscriptions';
import { apiUtils } from '@microsoft/vscode-azext-utils';

import * as url from 'url';
import * as https from 'https';
import * as tls from 'tls';
import * as vscode from 'vscode';
import * as os from 'os';
import { serviceFabricClusterView } from './serviceFabricClusterView.js';
import { SFUtility, debugLevel } from './sfUtility.js';
import { ClientRequest } from 'http';

export class SFRest {
    //https://www.npmjs.com/package/keytar
    private extensionContext: vscode.ExtensionContext | undefined;
    private clientApiVersion = "9.0";
    private resourceApiVersion = "2018-02-01";
    private timeOut = 90000;
    private maxResults = 100;
    private subscriptionId = "";
    private clusterHttpEndpoint = "https://localhost:19080";
    private key: any | Uint8Array | Uint8ArrayConstructor | Buffer | undefined = undefined;
    private certificate: any | string | Buffer | undefined = undefined;
    // @ts-ignore - telemetry is not yet exposed in the vscode api
    private logger: vscode.env.TelemetryLogger | undefined;
    // @ts-ignore - telemetry is not yet exposed in the vscode api
    private channel: vscode.LogOutputChannel;
    private clusterView: serviceFabricClusterView | null = null;
    private resourceManagerEndpoint = "https://management.azure.com";

    constructor(
        context: vscode.ExtensionContext,
        apiVersion: string | null = null,
    ) {
        this.extensionContext = context;
        SFUtility.outputLog("SFRest:constructor:context.extensionPath:" + context.extensionPath);

        vscode.workspace.fs.readFile(vscode.Uri.file(`${this.extensionContext?.extensionPath}\\test-certs\\${os.hostname().toUpperCase()}\\ServiceFabricDevClusterCert.key`)).then((value: any) => {
            if (value) {
                this.key = value;
            }
        });
        vscode.workspace.fs.readFile(vscode.Uri.file(`${this.extensionContext?.extensionPath}\\test-certs\\${os.hostname().toUpperCase()}\\ServiceFabricDevClusterCert.pem`)).then((value: any) => {
            if (value) {
                this.certificate = value;
            }
        });
    }

    public async azureConnect(secret: string | null = null): Promise<any> {
        let azureAccount: any | null = null;
        try {
            if (!secret) {
                SFUtility.showWarning("azure ad subscription secret not set");

                //await apiUtils.getAzureExtensionApi(context, 'ms-vscode.azure-account','0.0.1').then((api) => {console.log(api);});
                azureAccount = await (<apiUtils.AzureExtensionApiProvider>vscode.extensions.getExtension('ms-vscode.azure-account')!.exports).getApi('1.0.0');
                //const subscriptions = context.subscriptions;
                // subscriptions.push(commands.registerCommand('azure-account-sample.showSubscriptions', showSubscriptions(azureAccount)));
                //subscriptions.push(commands.registerCommand('azure-account-sample.showAppServices', showAppServices(azureAccount)));
                //sfRest.getClusters();
                if (!azureAccount()) {
                    SFUtility.showError("Azure account not connected");
                    return false;
                }
            }

        }
        catch (error) {
            SFUtility.showError(JSON.stringify(error));
            return null;
        }
        return azureAccount;
    }

    public async clusterConnect(): Promise<boolean> {
        // uses cluster server certificate to connect to cluster
        // todo: get and verify cluster server certificate
        let result = false;
        if (!this.clusterHttpEndpoint) {
            SFUtility.showError("Cluster endpoint not set");
            return false;
        }
        await this.invokeRestApi("GET", this.clusterHttpEndpoint!, "$/GetClusterVersion", null)
            .then((data: any) => {
                SFUtility.outputLog(data);
                result = true;
            })
            .catch((error: any) => {
                SFUtility.outputLog(error);
                SFUtility.showError("Error invoking rest api");
                result = false;
            });
        return result;
    }


    public async getClusters(secret: string | null = null, subscriptionId: string | null = null): Promise<any> {
        // uses azure account to enumerate clusters
        return new Promise<any>((resolve, reject) => {
            if (!secret || !subscriptionId) {
                //vscode.commands.executeCommand('azure-account.selectSubscriptions', { allowChanging: true, showCreatingTreeItem: true });
                SFUtility.showWarning("Cluster secret or subscription id not set");
                if (!this.azureConnect()) {
                    SFUtility.showError("Azure account not connected");
                    return null;
                }
            }

            const httpOptions: https.RequestOptions | tls.ConnectionOptions = {
                hostname: "management.azure.com",
                method: "GET",
                path: `/subscriptions/${subscriptionId}/providers/Microsoft.ServiceFabric/clusters?api-version=${this.resourceApiVersion}`,
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                port: 443,
                timeout: this.timeOut,
                // key: this.key,
                // cert: this.certificate,
                // enableTrace: true,
                rejectUnauthorized: false
            };

            this.invokeRequest(httpOptions)
                .then((data: any) => {
                    SFUtility.outputLog(data);
                    resolve(data);
                })
                .catch((error: any) => {
                    SFUtility.outputLog(error);
                    SFUtility.showError("Error invoking rest api");
                    reject(error);
                });
        });
    }

    public async getClusterManifest(): Promise<string | null> {
        // uses cluster server certificate to connect to cluster
        let clusterManifest = '';

        if (!this.clusterConnect()) {
            return null;
        }

        await this.invokeRestApi("GET", this.clusterHttpEndpoint!, "$/GetClusterManifest")
            .then((data: any) => {
                SFUtility.outputLog(data);
                clusterManifest = data;
            })
            .catch((error: any) => {
                SFUtility.outputLog(error);
                SFUtility.showError("Error invoking rest api");
                return null;
            });
        return clusterManifest;
    }

    public async invokeRequest(httpOptions: https.RequestOptions | tls.ConnectionOptions): Promise<ClientRequest | string | undefined> {
        try {
            const promise: Promise<ClientRequest | string> = new Promise<ClientRequest | string>((resolve, reject) => {
                const result: ClientRequest = https.request(httpOptions, (response) => {
                    let data = '';
                    response.on('error', (error: any) => {
                        SFUtility.outputLog(error, null, debugLevel.error);
                        reject(error);
                    });
                    response.on('data', (chunk: any) => {
                        //this.debuglog('invokeRestApi:data:' + chunk, debugLevel.info);
                        data += chunk;
                    });
                    response.on('end', () => {
                        resolve(data);
                    });
                }).on('error', (error: any) => {
                    SFUtility.outputLog('invokeRestApi:error:', error, debugLevel.error);
                    SFUtility.outputLog(error);
                }).on('timeout', () => {
                    SFUtility.outputLog("Request timed out", null, debugLevel.error);
                }).on('connect', () => {
                    SFUtility.outputLog("Request connected");
                }).on('continue', () => {
                    SFUtility.outputLog("Request continue");
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


    public async invokeRestApi(
        method = "GET",
        uri: string = this.clusterHttpEndpoint!,
        absolutePath: string | null = null,
        uriParameters: string | null = null,
        body: string | null = null): Promise<ClientRequest | string | undefined> {

        try {

            const parsedUri = url.parse(uri);
            //parsedUri.query = uriParameters ? JSON.stringify(uriParameters) : null;
            const restQuery = `/${absolutePath}?api-version=${this.clientApiVersion}&${uriParameters}timeout=${this.timeOut}`;
            SFUtility.outputLog('restQuery:' + uri + restQuery);
            const httpOptions: https.RequestOptions | tls.ConnectionOptions = {
                hostname: parsedUri.hostname,
                method: method,
                path: restQuery,
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                port: parsedUri.port ? parseInt(parsedUri.port) : 19080,
                timeout: this.timeOut,
                key: this.key,
                cert: this.certificate,
                enableTrace: true,
                rejectUnauthorized: false
            };

            return await this.invokeRequest(httpOptions);
        }
        catch (error) {
            SFUtility.showError(`invokeRestApi:error:${JSON.stringify(error)}`);
        }
    }
}