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

// cert
//https://stackoverflow.com/questions/15413646/converting-pfx-to-pem-using-openssl


import { ResourceManagementClient } from '@azure/arm-resources';
import { SubscriptionClient } from '@azure/arm-subscriptions';

import { apiUtils } from '@microsoft/vscode-azext-utils';

//import { commands, ExtensionContext, extensions, QuickPickItem, window } from 'vscode';

//import { AzureAccountExtensionApi, AzureSession } from '../azure-account.api'; // Other extensions need to copy this .d.ts to their repository.
//const apiUtils = require('@microsoft/vscode-azext-utils');
//const accountApi = require('../azure-account.api');
//const vscode = require('vscode');
import * as url from 'url';
import * as https from 'https';
import * as tls from 'tls';
import * as vscode from 'vscode';
import * as os from 'os';

//import { parse } from 'path';
import { ClientRequest } from 'http';
//import { Uri } from "vscode";
const enum debugLevel {
    error = 0,
    warn = 1,
    info = 2,
    debug = 3,
    trace = 4
}

export class SFRest {
    //https://www.npmjs.com/package/keytar
    extensionContext: vscode.ExtensionContext | undefined;
    secret = "";
    clientApiVersion = "9.0";
    resourceApiVersion = "2018-02-01";
    timeOut = 10000;
    maxResults = 100;
    subscriptionId = "";
    clusterHttpEndpoint: string | undefined = "https://192.168.0.48:19080";
    resourceManagerEndpoint = "https://management.azure.com/";
    key: any | Uint8Array | Uint8ArrayConstructor | Buffer | undefined = undefined;
    certificate: any | string | Buffer | undefined = undefined;
    // @ts-ignore - telemetry is not yet exposed in the vscode api
    logger: vscode.env.TelemetryLogger | undefined;
    // @ts-ignore - telemetry is not yet exposed in the vscode api
    channel: vscode.LogOutputChannel;

    constructor(
        context: vscode.ExtensionContext,
        secret: string | null = null,
        apiVersion: string | null = null,
        subscriptionId: string | null = null,
        clusterHttpEndpoint: string | null = null
    ) {
        this.extensionContext = context;
        if (secret) this.secret = secret;
        if (subscriptionId) this.subscriptionId = subscriptionId;

        this.createDebugLogChannel();
        this.outputLog("SFRest:constructor:context.extensionPath:" + context.extensionPath);

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
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        //this.createTelemetryClient();
        context.secrets.get("sfRestSecret").then((value: string | undefined) => {
            if (value) {
                this.secret = value;
            }
        });
        context.secrets.get("sfRestKey").then((value: any) => {
            if (value) {
                this.key = value;
            }
        });
        context.secrets.get("sfRestCertificate").then((value: any) => {
            if (value) {
                this.certificate = value;
            }
        });

    }

    destroy(): void {
        // this.extensionContext?.secrets.store("sfRestSecret", this.secret);
        // this.extensionContext?.secrets.store("sfRestKey", this.key.toString());
        // this.extensionContext?.secrets.store("sfRestCertificate", this.certificate.toString());
    }

    public async azureConnect(): Promise<any> {
        let azureAccount: any | null = null;
        try {
            if (!this.secret) {
                this.showWarning("Cluster secret not set");

                //await apiUtils.getAzureExtensionApi(context, 'ms-vscode.azure-account','0.0.1').then((api) => {console.log(api);});
                azureAccount = await (<apiUtils.AzureExtensionApiProvider>vscode.extensions.getExtension('ms-vscode.azure-account')!.exports).getApi('1.0.0');
                //const subscriptions = context.subscriptions;
                // subscriptions.push(commands.registerCommand('azure-account-sample.showSubscriptions', showSubscriptions(azureAccount)));
                //subscriptions.push(commands.registerCommand('azure-account-sample.showAppServices', showAppServices(azureAccount)));
                //sfRest.getClusters();
                if (!azureAccount()) {
                    this.showError("Azure account not connected");
                    return false;
                }
            }

        }
        catch (error) {
            this.showError(JSON.stringify(error));
            return null;
        }
        return azureAccount;
    }

    public clusterConnect(): boolean {
        // uses cluster server certificate to connect to cluster
        // todo: get and verify cluster server certificate
        if (!this.clusterHttpEndpoint) {
            this.showError("Cluster endpoint not set");
            return false;
        }
        return true;
    }

    private createTelemetryClient(): any {
        // @ts-ignore - telemetry is not yet exposed in the vscode api
        const sender = {
            flush(): void {
                // no-op
            },
            sendErrorData(error: Error, data?: Record<string, any>): void {
                // no-op
            },
            sendEventData(eventName: string, data?: Record<string, any>): void {
                // no-op
            }
        };
        // @ts-ignore - telemetry is not yet exposed in the vscode api
        this.logger = vscode.env.createTelemetryLogger(sender);

        // GOOD - uses the logger
        this.logger.logUsage('myEvent', { myData: 'myValue' });
    }

    private createDebugLogChannel(): void {
        // @ts-ignore - telemetry is not yet exposed in the vscode api
        this.channel = vscode.window.createOutputChannel("SFRest", { log: true });
        this.channel.show();
        return;
    }

    public outputLog(message: string, messageObject: object | null = null, level: debugLevel = debugLevel.info): void {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        //console.log("SFRest:debuglog:" + message);
        if (messageObject) {
            message += JSON.stringify(messageObject, null, 2);
        }

        try {
            if (level === debugLevel.error) {
                this.channel.error(message);
                this.showError(message);
            }
            else if (level === debugLevel.warn) {
                this.channel.warn(message);
                this.showWarning(message);
            }
            else if (level === debugLevel.info) {
                this.channel.info(message);
                //this.channel.info(message);
            }
        }
        catch (error) {
            this.channel.error(JSON.stringify(error, null, 2));
            this.showError(message);
        }

        //this.logger.logUsage('sfRest:', { myData: message });
        //vscode.debug.activeDebugConsole!.appendLine(message);
    }

    public getClusters(): any {
        // uses azure account to enumerate clusters
        if (!this.secret || !this.subscriptionId) {
            this.showWarning("Cluster secret or subscription id not set");
            if (!this.azureConnect()) {
                this.showError("Azure account not connected");
                return null;
            }
        }

        const restQuery = `${this.resourceManagerEndpoint}/subscriptions/${this.subscriptionId}/providers/Microsoft.ServiceFabric/clusters?api-version=${this.resourceApiVersion}`;
        const result = https.request(restQuery, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });
        this.outputLog('cluster list:', result);
        return result;


        // const result = https.request(restQuery, {
        //     method: "GET",
        //     headers: {
        //         "Content-Type": "application/json",
        //         "Accept": "application/json",
        //         "Authorization": "Basic " + this.secret
        //     }
        // });
        // this.debuglog(result);
        // return result;


        // const result = request("https://localhost:19080/Services", {
        //    method: "GET",
        //    headers: {
        //       "Content-Type": "application/json",
        //       "Accept": "application/json",
        //       "Authorization": "Basic " + this.secret
        //    }
        // });
        // return result.toString();
    }

    public getCluster(): boolean {
        // uses cluster server certificate to connect to cluster
        if (!this.clusterConnect()) {
            return false;
        }

        // const restQuery = `${this.clusterHttpEndpoint}/$/GetClusterHealth?api-version=${this.clientApiVersion}&NodesHealthStateFilter=Default`;
        // this.invokeRestApi("GET", this.clusterHttpEndpoint!, "$/GetClusterHealth", null).then((data: any) => {
        //     this.showInformation(data);
        // });

        //const result = this.invokeRestApi("GET", this.clusterHttpEndpoint!, "$/GetClusterHealth", null,this.invokeRestApiCallback);
        const result = this.invokeRestApi("GET", this.clusterHttpEndpoint!, "$/GetClusterVersion", null);
        if (result) {
            result.then((data: any) => {
                this.outputLog(data);
            });

            // this.showInformation(result.toString());
            return true;
        }
        else {
            this.showError("Error invoking rest api");
            return false;
        }

    }

    // public invokeRestApiCallback(data: any): void {
    //     this.debuglog(data);
    // }

    public async invokeRestApi(
        method = "GET", uri: string,
        absolutePath: string | null,
        body: string | null): Promise<ClientRequest | undefined | string> {

        //https://nodejs.org/api/https.html#httpsrequestoptions-callback
        //https://nodejs.org/api/tls.html#tlsconnectoptions-callback
        //return new Promise<any>((resolve, reject) => {
        //const result = await new Promise<any>((resolve, reject) => {
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises

        //let data = '';
        try {
            const parsedUri = url.parse(uri);
            const restQuery = `/${absolutePath}?api-version=${this.clientApiVersion}`;
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

            this.outputLog('httpOptions:', httpOptions);
            const promise: Promise<ClientRequest | string> = new Promise<ClientRequest | string>((resolve, reject) => {
                const result: ClientRequest = https.request(httpOptions, (response) => {
                    let data = '';
                    response.on('error', (error: any) => {
                        this.outputLog(error, null, debugLevel.error);
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
                    this.outputLog('invokeRestApi:error:', error, debugLevel.error);
                    this.outputLog(error);
                }).on('timeout', () => {
                    this.outputLog("Request timed out", null, debugLevel.error);
                }).on('connect', () => {
                    this.outputLog("Request connected");
                }).on('continue', () => {
                    this.outputLog("Request continue");
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
            // return result.on('response', (response: any) => {
            //     this.debuglog('invokeRestApi:response');
            //     this.debuglog(response);
            //     return response;
            // });
            //return data;
            //return result;
            return promise;
        }
        catch (error) {
            this.showError(`invokeRestApi:error:${JSON.stringify(error)}`);
            //reject(error);
        }
        //});

        // promise.then((data: any) => {
        //     return data;
        // }
        // );
        //  promise.then((data: any) => {
        //     this.showWarning(data);
        //     return data;
        //  });
        //return promise;

    }

    public async promptForClusterRestCall() {
        const adhocRestCall: string | undefined = await vscode.window.showInputBox({
            prompt: "Enter cluster REST call",
            placeHolder: "/$/GetClusterHealth"
        });

        if (!adhocRestCall) return;
        this.invokeRestApi("GET", this.clusterHttpEndpoint!, adhocRestCall, null)
            .then((data: any) => {
                this.outputLog(data);
            });
    }

    public async promptForClusterEndpoint() {
        const clusterEndpoint: string | undefined = await vscode.window.showInputBox({
            prompt: "Enter cluster endpoint",
            placeHolder: "https://sftestcluster.eastus.cloudapp.azure.com:19080"
        });
        this.clusterHttpEndpoint = clusterEndpoint;
    }

    private showError(message: string): void {
        //this.debuglog(message);
        vscode.window.showErrorMessage(JSON.stringify(message, null, 4));
    }

    private showInformation(message: string): void {
        //this.debuglog(message);
        vscode.window.showInformationMessage(JSON.stringify(message, null, 4));
    }

    private showWarning(message: string): void {
        //this.debuglog(message);
        vscode.window.showWarningMessage(JSON.stringify(message, null, 4));
    }

}