
import { ResourceManagementClient } from '@azure/arm-resources';
import { SubscriptionClient } from '@azure/arm-subscriptions';
import { apiUtils } from '@microsoft/vscode-azext-utils';
import * as armServiceFabric from '@azure/arm-servicefabric';
import * as azureIdentity from '@azure/identity';
import * as serviceFabric from '@azure/servicefabric';
import { SfConfiguration, clusterCertificate } from './sfConfiguration';

import { ServiceFabricManagementClient } from './sdk/servicefabric/arm-servicefabric/src/serviceFabricManagementClient';
import { ServiceFabricClientAPIs } from './sdk/servicefabric/servicefabric/src/serviceFabricClientAPIs';

import * as sfModels from './sdk/servicefabric/servicefabric/src/models';

import * as url from 'url';
import * as https from 'https';
import * as tls from 'tls';
import * as vscode from 'vscode';
import * as os from 'os';
import { serviceFabricClusterView } from './serviceFabricClusterView';
import * as SFConfiguration from './sfConfiguration';
import { SfUtility, debugLevel } from './sfUtility';
import { SfRestClient } from './sfRestClient';
import { ClientRequest, RequestOptions } from 'http';
import { SfConstants } from './sfConstants';

export class SfRest {
    //https://www.npmjs.com/package/keytar
    private extensionContext: vscode.ExtensionContext | undefined;
    private clientApiVersion = "6.3";
    private resourceApiVersion = "2018-02-01";
    private timeOut = 9000;
    private maxResults = 100;
    private subscriptionId = "";
    private clusterHttpEndpoint = SfConstants.SF_HTTP_GATEWAY_ENDPOINT;
    private key: any | Uint8Array | Uint8ArrayConstructor | Buffer | undefined = undefined;
    private certificate: string | string[] | undefined; // any | string | Buffer | undefined = undefined;
    // @ts-ignore - telemetry is not yet exposed in the vscode api
    private logger: vscode.env.TelemetryLogger | undefined;
    // @ts-ignore - telemetry is not yet exposed in the vscode api
    private channel: vscode.LogOutputChannel;
    private clusterView: serviceFabricClusterView | null = null;
    private resourceManagerEndpoint = "https://management.azure.com";
    private sfApi: ServiceFabricClientAPIs;

    constructor(
        context: vscode.ExtensionContext,
        apiVersion?: string,
    ) {
        this.extensionContext = context;
        SfUtility.outputLog("SFRest:constructor:context.extensionPath:" + context.extensionPath);
        this.sfApi = this.initializeClusterConnection();
    }

    public async azureConnect(secret: string | null = null): Promise<any> {
        let azureAccount: any | null = null;
        try {
            if (!secret) {
                SfUtility.showWarning("azure ad subscription secret not set");

                //await apiUtils.getAzureExtensionApi(context, 'ms-vscode.azure-account','0.0.1').then((api) => {console.log(api);});
                azureAccount = await (<apiUtils.AzureExtensionApiProvider>vscode.extensions.getExtension('ms-vscode.azure-account')!.exports).getApi('1.0.0');
                //const subscriptions = context.subscriptions;
                // subscriptions.push(commands.registerCommand('azure-account-sample.showSubscriptions', showSubscriptions(azureAccount)));
                //subscriptions.push(commands.registerCommand('azure-account-sample.showAppServices', showAppServices(azureAccount)));
                //sfRest.getClusters();
                if (!azureAccount()) {
                    SfUtility.showError("Azure account not connected");
                    return false;
                }
            }

        }
        catch (error) {
            SfUtility.showError(JSON.stringify(error));
            return null;
        }
        return azureAccount;
    }

    // public async clusterConnect(): Promise<boolean> {
    //     // uses cluster server certificate to connect to cluster
    //     // todo: get and verify cluster server certificate
    //     let result = false;
    //     if (!this.clusterHttpEndpoint) {
    //         SFUtility.showError("Cluster endpoint not set");
    //         return false;
    //     }
    //     await this.invokeRestApi("GET", this.clusterHttpEndpoint!, "/$/GetClusterVersion")
    //         .then((data: any) => {
    //             SFUtility.outputLog(data);
    //             result = true;
    //         })
    //         .catch((error: any) => {
    //             SFUtility.outputLog(error);
    //             SFUtility.showError("Error invoking rest api");
    //             result = false;
    //         });
    //     return result;
    // }

    private initializeClusterConnection(endpoint?: string): ServiceFabricClientAPIs {
        if (endpoint) {
            this.clusterHttpEndpoint = endpoint;
        }
        SfUtility.outputLog('sfMgr:initializeClusterConnection:clusterHttpEndpoint:' + this.clusterHttpEndpoint);
        if (!this.clusterHttpEndpoint) {
            SfUtility.showWarning("Cluster endpoint not set");
            //return null;
        }
        const optionalParams: sfModels.ServiceFabricClientAPIsOptionalParams = {
            //$host: this.clusterHttpEndpoint!,
            endpoint: this.clusterHttpEndpoint!,
            apiVersion: this.clientApiVersion,
            allowInsecureConnection: true,
            httpClient: new SfRestClient(this)
            //credentials: credentials
        };

        this.sfApi = new ServiceFabricClientAPIs(optionalParams);
        return this.sfApi;
    }

    public async connectToCluster(endpoint: string, clusterCertificate?: clusterCertificate | undefined): Promise<any> {
        if (clusterCertificate) {
            this.certificate = clusterCertificate.certificate;
            this.key = clusterCertificate.key;
        }

        this.initializeClusterConnection(endpoint);
        await this.getClusterVersion();
    }

    public createSfAutoRestHttpHeaders(): any {
        return {
            "Content-Type": "application/json",
            "Accept": "application/json"
        };
    }
    public createSfAutoRestHttpOptions(uri: string): any | tls.ConnectionOptions | RequestOptions {
        //const parsedUri = url.parse(this.clusterHttpEndpoint!);
        const parsedUri = url.parse(uri);

        const httpOptions: tls.ConnectionOptions | RequestOptions = {
            host: parsedUri!.hostname ? parsedUri.hostname : "localhost",
            path: parsedUri!.path,
            method: "GET",
            headers: this.createSfAutoRestHttpHeaders(),
            port: parsedUri.port ? parseInt(parsedUri.port) : SfConstants.SF_HTTP_GATEWAY_PORT,
            //timeout: this.timeOut,
            key: this.key,
            cert: this.certificate,
            enableTrace: true,
            rejectUnauthorized: false
        };
        return httpOptions;
    }

    public createHttpOptions(absolutePath = '', uriParameters: any = this.createUriParameters()): any | tls.ConnectionOptions | RequestOptions {
        let path = absolutePath + "?";
        for (const key in uriParameters) {
            const keyValue = uriParameters[key];
            if (keyValue && keyValue !== null && keyValue !== undefined && keyValue !== '' && keyValue !== 0) {
                path += `${key}=${keyValue}&`;
            }
        }
        const parsedUri = url.parse(this.clusterHttpEndpoint!);
        const httpOptions: tls.ConnectionOptions | RequestOptions = {
            host: parsedUri!.hostname ? parsedUri.hostname : "localhost",
            method: "GET",
            path: path.replace(/(&|\?)$/, ""),
            headers: this.createSfAutoRestHttpHeaders(),
            port: parsedUri.port ? parseInt(parsedUri.port) : SfConstants.SF_HTTP_GATEWAY_PORT,
            //timeout: this.timeOut,
            key: this.key,
            cert: this.certificate,
            enableTrace: true,
            rejectUnauthorized: false
        };
        return httpOptions;
    }

    public createUriParameters(): any {
        return {
            //method: "GET",
            //absolutePath: "",
            'api-version': this.clientApiVersion,
            continuationToken: "",
            nodeStatusFilter: "", // "default",
            maxResults: 0, //100,
            timeout: this.timeOut
        };
    }

    public async disableNode(nodeName: string, description: sfModels.DeactivationIntentDescription): Promise<any> {
        await this.sfApi.disableNode(nodeName, description);

        const nodeState = await this.getNode(nodeName);
        if (nodeState.nodeDeactivationInfo?.nodeDeactivationStatus?.toLowerCase() !== "none") {
            SfUtility.showInformation(`Node: ${nodeName} is disabled`);
        }
        else {
            SfUtility.showError(`Node: ${nodeName} is not disabled`);
        }
        return;
    }

    public async enableNode(nodeName: string): Promise<any> {
        await this.sfApi.enableNode(nodeName);

        const nodeState = await this.getNode(nodeName);
        if (nodeState.nodeDeactivationInfo?.nodeDeactivationStatus?.toLowerCase() === "none") {
            SfUtility.showInformation(`Node: ${nodeName} is enabled`);
        }
        else {
            SfUtility.showError(`Node: ${nodeName} is not enabled`);
        }
        return;
    }

    public async getApplication(applicationId: string): Promise<sfModels.ApplicationInfo> {
        const application = await this.sfApi.getApplicationInfo(applicationId);
        SfUtility.outputLog('sfRest:getApplication:complete', application);
        return application;
    }

    public async getApplications(continuationToken?: string): Promise<sfModels.ApplicationInfo[]> {
        const applicationInfos: Array<sfModels.ApplicationInfo> = [];
        // applicationInfos.push(await this.sfApi.getApplicationInfo("fabric:/System"));
        const applications = await this.sfApi.getApplicationInfoList({ continuationToken: continuationToken });
        applicationInfos.push(...applications.items!);

        if (applications.continuationToken) {
            await this.getApplications(applications.continuationToken);
        }

        SfUtility.outputLog(`sfRest:getService: returning:${applicationInfos.length} items`, applications);

        return applicationInfos;

        return applications.items!;
    }

    public async getApplicationTypes(continuationToken?: string): Promise<sfModels.ApplicationTypeInfo[]> {
        const applicationTypes: Array<sfModels.ApplicationTypeInfo> = [];
        const applicationInfos = await this.sfApi.getApplicationTypeInfoList({ continuationToken: continuationToken });
        SfUtility.outputLog('sfRest:getApplicationTypes:', applicationInfos);
        applicationTypes.push(...applicationInfos.items!);

        if (applicationInfos.continuationToken) {
            await this.getApplicationTypes(applicationInfos.continuationToken);
        }

        return applicationTypes;
    }


    public async getClusterManifest(): Promise<sfModels.GetClusterManifestResponse> {
        const clusterManifest = await this.sfApi.getClusterManifest();
        SfUtility.outputLog('sfMgr:connectToCluster:clusterManifest:', clusterManifest);
        return clusterManifest;
    }

    public async getClusterHealth(): Promise<sfModels.ClusterHealth> {
        const clusterHealth = await this.sfApi.getClusterHealth();
        SfUtility.outputLog('sfMgr:connectToCluster:clusterHealth:', clusterHealth);
        return clusterHealth;
    }

    public async getClusterVersion(): Promise<sfModels.ClusterVersion> {
        const custerVersion = await this.sfApi.getClusterVersion();
        SfUtility.outputLog('sfMgr:connectToCluster:custerVersion:', custerVersion);
        return custerVersion;
    }

    public async getClusters(): Promise<sfModels.GetClusterManifestResponse[]> {
        return new Promise<sfModels.GetClusterManifestResponse[]>((resolve, reject) => {
            this.getClusterManifest();
        });
        //const clusters = await this.sfApi.getClusterInfoList();
        // public async getClusters(secret: string | null = null, subscriptionId: string | null = null): Promise<any> {
        //     // uses azure account to enumerate clusters
        //     return new Promise<any>((resolve, reject) => {
        //         if (!secret || !subscriptionId) {
        //             //vscode.commands.executeCommand('azure-account.selectSubscriptions', { allowChanging: true, showCreatingTreeItem: true });
        //             SFUtility.showWarning("Cluster secret or subscription id not set");
        //             if (!this.azureConnect()) {
        //                 SFUtility.showError("Azure account not connected");
        //                 return null;
        //             }
        //         }

        //         const httpOptions: https.RequestOptions | tls.ConnectionOptions = {
        //             hostname: "management.azure.com",
        //             method: "GET",
        //             path: `/subscriptions/${subscriptionId}/providers/Microsoft.ServiceFabric/clusters?api-version=${this.resourceApiVersion}`,
        //             headers: {
        //                 "Content-Type": "application/json",
        //                 "Accept": "application/json"
        //             },
        //             port: 443,
        //             timeout: this.timeOut,
        //             // key: this.key,
        //             // cert: this.certificate,
        //             // enableTrace: true,
        //             rejectUnauthorized: false
        //         };

        //         this.invokeRequest(httpOptions)
        //             .then((data: any) => {
        //                 SFUtility.outputLog(data);
        //                 resolve(data);
        //             })
        //             .catch((error: any) => {
        //                 SFUtility.outputLog(error);
        //                 SFUtility.showError("Error invoking rest api");
        //                 reject(error);
        //             });
        //     });
    }

    public async getClusterServerCertificate(clusterHttpEndpoint: string, port = SfConstants.SF_HTTP_GATEWAY_PORT): Promise<tls.PeerCertificate | undefined> {
        const tlsoptions: tls.ConnectionOptions = {
            host: clusterHttpEndpoint,
            port: port,
            rejectUnauthorized: false,
        };

        let cert: tls.PeerCertificate | undefined;

        const tlsClient = await tls.connect(tlsoptions, () => {
            SfUtility.outputLog('tls response:' + tlsClient.getPeerCertificate());
            cert = tlsClient.getPeerCertificate();
            tlsClient.end();
        });


        SfUtility.outputLog('SfRestClient:getServerCertificate');
        return cert;
    }



    public async getNode(nodeName: string): Promise<sfModels.NodeInfo> {
        const node = await this.sfApi.getNodeInfo(nodeName);
        SfUtility.outputLog('sfRest:getNode:complete', node);
        return node;
    }

    public async getNodeHealth(nodeName: string): Promise<sfModels.NodeHealthState> {
        const nodeState = await this.sfApi.getNodeHealth(nodeName);
        SfUtility.outputLog('sfRest:getNodeState:complete', nodeState);
        return nodeState;
    }

    public async getNodes(nodeStatusFilter: sfModels.KnownNodeStatusFilter = sfModels.KnownNodeStatusFilter.Default, continuationToken?: string): Promise<sfModels.NodeInfo[]> {
        const nodeInfos: Array<sfModels.NodeInfo> = [];
        const nodes = await this.sfApi.getNodeInfoList({ continuationToken: continuationToken, nodeStatusFilter: nodeStatusFilter });

        if (!nodes.items! || nodes.items?.length === 0) {
            SfUtility.showWarning("No nodes found");
            return nodeInfos;
        }
        nodeInfos.push(...nodes.items!);
        if (nodes.continuationToken) {
            await this.getNodes(nodeStatusFilter, nodes.continuationToken);
        }

        SfUtility.outputLog(`sfRest:getService: returning:${nodeInfos.length} items`, nodes);
        return nodeInfos;
    }

    public async getService(applicationId: string, serviceId: string): Promise<sfModels.ServiceInfoUnion> {
        const service = await this.sfApi.getServiceInfo(applicationId, serviceId);
        SfUtility.outputLog('sfRest:getService:complete', service);
        return service;
    }

    public async getServices(applicationId: string, continuationToken?: string): Promise<sfModels.ServiceInfoUnion[]> {
        const serviceInfos: Array<sfModels.ServiceInfoUnion> = [];
        const services = await this.sfApi.getServiceInfoList(applicationId, { continuationToken: continuationToken });
        serviceInfos.push(...services.items!);

        if (services.continuationToken) {
            await this.getServices(applicationId, services.continuationToken);
        }

        SfUtility.outputLog(`sfRest:getService: returning:${serviceInfos.length} items`, services);

        return serviceInfos;
    }

    public async getServiceTypes(applicationTypeName: string, applicationTypeVersion: string): Promise<sfModels.GetServiceTypeInfoListResponse> {
        const serviceInfos = await this.sfApi.getServiceTypeInfoList(applicationTypeName, applicationTypeVersion);
        SfUtility.outputLog('sfRest:getServiceTypes:', serviceInfos);
        return serviceInfos;
    }

    public async getSystemServices(applicationId: string, continuationToken?: string): Promise<sfModels.ServiceInfoUnion[]> {
        const serviceInfos: Array<sfModels.ServiceInfoUnion> = [];
        const services = await this.sfApi.getServiceInfoList(applicationId, { continuationToken: continuationToken });
        serviceInfos.push(...services.items!);

        if (services.continuationToken) {
            await this.getSystemServices(applicationId, services.continuationToken);
        }

        SfUtility.outputLog(`sfRest:getSystemsServices: returning:${serviceInfos.length} items`, services);
        return serviceInfos;
    }

    public async invokeRequestOptions(httpOptions: any | https.RequestOptions | tls.ConnectionOptions): Promise<ClientRequest | string | undefined> {
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
                        const jObject = JSON.parse(chunk);

                        if (jObject.CancellationToken) {
                            SfUtility.outputLog(`invokeRequest:response CancellationToken:${jObject.CancellationToken}`, null, debugLevel.info);
                            httpOptions.CancellationToken = jObject.CancellationToken;
                            data += this.invokeRequestOptions(httpOptions);
                        }
                        else {
                            httpOptions.CancellationToken = null;
                        }

                        if (jObject.Items) {
                            SfUtility.outputLog(`invokeRequest:response Items:${jObject.Items.length}`, null, debugLevel.info);
                            for (const item of jObject.Items) {
                                SfUtility.outputLog(`invokeRequest:response Item:`, item, debugLevel.info);
                                data += item;
                            }
                        }
                        else {
                            SfUtility.outputLog(`invokeRequest:response Items:0`, null, debugLevel.info);
                            data += chunk;
                        }
                    });

                    response.on('end', () => {
                        SfUtility.outputLog('invokeRequest:request end', null, debugLevel.info);
                        resolve(data);
                    });
                }).on('error', (error: any) => {
                    SfUtility.outputLog('invokeRequest:request error:', error, debugLevel.error);
                    SfUtility.outputLog(error);
                }).on('timeout', () => {
                    SfUtility.outputLog("invokeRequest:request timed out", null, debugLevel.error);
                }).on('connect', () => {
                    SfUtility.outputLog("invokeRequest:request connected");
                }).on('continue', () => {
                    SfUtility.outputLog("invokeRequest:request continue");
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
            SfUtility.showError(`invokeRequest:error:${JSON.stringify(error)}`);
        }
    }

    public async invokeRequest(stringUri: string): Promise<ClientRequest | string | undefined> {
        const parsedUri = url.parse(stringUri);

        const httpOptions: tls.ConnectionOptions | RequestOptions = {
            host: parsedUri!.hostname ? parsedUri.hostname : "localhost",
            method: "GET",
            path: parsedUri.path?.replace(/(&|\?)$/, ""),
            headers: this.createSfAutoRestHttpHeaders(),
            port: parsedUri.port ? parseInt(parsedUri.port) : 19080,
            //timeout: this.timeOut,
            key: this.key,
            cert: this.certificate,
            enableTrace: true,
            rejectUnauthorized: false
        };

        return await this.invokeRequestOptions(httpOptions);

    }

    public async invokeRestApi(
        //deprecated
        method = "GET",
        uri: string = this.clusterHttpEndpoint!,
        absolutePath = "",
        body: string | null = null): Promise<ClientRequest | string | undefined> {

        try {

            const parsedUri = url.parse(uri);
            //parsedUri.query = uriParameters ? JSON.stringify(uriParameters) : null;
            const restQuery = `${absolutePath}?api-version=${this.clientApiVersion}&timeout=${this.timeOut}`;
            SfUtility.outputLog('restQuery:' + uri + restQuery);

            const options = this.createHttpOptions(absolutePath);
            options.method = method;
            options.host = parsedUri.hostname;
            options.path = restQuery;
            options.port = parsedUri.port ? parseInt(parsedUri.port) : SfConstants.SF_HTTP_GATEWAY_PORT;

            return await this.invokeRequestOptions(options);
        }
        catch (error) {
            SfUtility.showError(`invokeRestApi:error:${JSON.stringify(error)}`);
        }
    }

    public async restartNode(nodeName: string, nodeInstanceId: string | null = null, createFabricDump: boolean | null = null): Promise<any> {
        const restartNodeDescription: sfModels.RestartNodeDescription = {
            nodeInstanceId: nodeInstanceId ? nodeInstanceId : "0",
            createFabricDump: createFabricDump ? 'true' : 'false'
        };
        await this.sfApi.restartNode(nodeName, restartNodeDescription);
        SfUtility.outputLog('sfRest:restartNode:complete');
        return;
    }
}