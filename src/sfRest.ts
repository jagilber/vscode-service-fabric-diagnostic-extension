import * as url from 'url';
import * as https from 'https';
import * as tls from 'tls';
import * as vscode from 'vscode';
import { serviceFabricClusterView } from './serviceFabricClusterView';
import * as SFConfiguration from './sfConfiguration';
import { SfUtility, debugLevel } from './sfUtility';
import { SfRestClient } from './sfRestClient';
import { ClientRequest, RequestOptions } from 'http';
import { SfConstants } from './sfConstants';
import { clusterCertificate } from './sfConfiguration';
import * as sfModels from './sdk/servicefabric/servicefabric/src/models';
import { ServiceFabricClientAPIs } from './sdk/servicefabric/servicefabric/src/serviceFabricClientAPIs';
import { NetworkError, HttpError, PaginationError } from './models/Errors';
import * as xmljs from 'xml-js';
import { AzureAccount, HttpHeaders, UriParameters } from './types';
import { IHttpOptionsProvider } from './interfaces/IHttpOptionsProvider';
import { SfDirectRestClient } from './services/SfDirectRestClient';

export class SfRest implements IHttpOptionsProvider {
    //https://www.npmjs.com/package/keytar
    private extensionContext: vscode.ExtensionContext | undefined;
    // API versions locked per Microsoft Learn (verified 2026-02-03):
    // - clientApiVersion=6.0 for node/cluster management
    // - EventStore endpoints hardcode api-version=6.4 in request paths
    private clientApiVersion = "6.0";
    private resourceApiVersion = "2018-02-01";
    private timeOut = 9000;
    private maxResults = 100;
    private subscriptionId = "";
    private clusterHttpEndpoint = SfConstants.SF_HTTP_GATEWAY_ENDPOINT;
    private key: Buffer | undefined = undefined;
    private certificate: string | string[] | undefined; // any | string | Buffer | undefined = undefined;
    // @ts-ignore - telemetry is not yet exposed in the vscode api
    private logger: vscode.env.TelemetryLogger | undefined;
    // @ts-ignore - telemetry is not yet exposed in the vscode api
    private channel: vscode.LogOutputChannel;
    private clusterView: serviceFabricClusterView | null = null;
    private resourceManagerEndpoint = "https://management.azure.com";
    
    // Azure SDK client (legacy/fallback)
    private sfApi: ServiceFabricClientAPIs;
    
    // Direct REST client (no Azure SDK dependencies)
    private directClient?: SfDirectRestClient;
    
    // Flag to use direct REST instead of Azure SDK
    private useDirectRest = true; // Set to true to bypass Azure SDK

    constructor(
        context: vscode.ExtensionContext,
        apiVersion?: string,
    ) {
        this.extensionContext = context;
        SfUtility.outputLog("SFRest:constructor:context.extensionPath:" + context.extensionPath);
        this.sfApi = this.initializeClusterConnection();
    }

    public async azureConnect(secret: string | null = null): Promise<AzureAccount | null> {
        let azureAccount: AzureAccount | null = null;
        try {
            if (!secret) {
                SfUtility.showWarning("azure ad subscription secret not set");

                // Azure Account extension integration (commented out - needs @microsoft/vscode-azext-utils types)
                // azureAccount = await (<apiUtils.AzureExtensionApiProvider>vscode.extensions.getExtension('ms-vscode.azure-account')!.exports).getApi('1.0.0');
                
                const azureAccountExtension = vscode.extensions.getExtension('ms-vscode.azure-account');
                if (azureAccountExtension) {
                    await azureAccountExtension.activate();
                    azureAccount = await azureAccountExtension.exports.getApi('1.0.0');
                }
                
                if (!azureAccount) {
                    SfUtility.showError("Azure account not connected");
                    return null;
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
            this.key = (clusterCertificate.key as unknown) as Buffer;
            
            // Log certificate info (thumbprint only, not the actual cert)
            const certInfo = {
                hasCertificate: !!this.certificate,
                hasKey: !!this.key,
                thumbprint: clusterCertificate.thumbprint,
                commonName: clusterCertificate.commonName,
                certLength: this.certificate ? `${this.certificate.length} bytes` : 'none'
            };
            SfUtility.outputLog(`🔐 Cluster certificate loaded: ${JSON.stringify(certInfo)}`, null, debugLevel.info);
        } else {
            SfUtility.outputLog('⚠️ No cluster certificate provided - connecting without client cert', null, debugLevel.warn);
        }

        // Update Azure SDK client (legacy/fallback)
        this.sfApi = this.initializeClusterConnection(endpoint);
        
        // Initialize direct REST client (no Azure SDK)
        this.directClient = new SfDirectRestClient({
            endpoint: endpoint,
            apiVersion: this.clientApiVersion,
            certificate: Array.isArray(this.certificate) ? this.certificate[0] : this.certificate,
            key: this.key
        });
        
        SfUtility.outputLog(`✅ Clients initialized - using ${this.useDirectRest ? 'DIRECT REST' : 'AZURE SDK'}`, null, debugLevel.info);
        
        await this.getClusterVersion();
    }

    public createSfAutoRestHttpHeaders(): HttpHeaders {
        return {
            "Content-Type": "application/json",
            "Accept": "application/json"
        };
    }
    public createSfAutoRestHttpOptions(uri: string): tls.ConnectionOptions | RequestOptions {
        //const parsedUri = url.parse(this.clusterHttpEndpoint!);
        const parsedUri = url.parse(uri);

        const httpOptions: tls.ConnectionOptions | RequestOptions | any = {
            host: parsedUri!.hostname ? parsedUri.hostname : "localhost",
            path: parsedUri!.path,
            method: "GET", // Default to GET, will be overridden by Azure SDK request if needed
            headers: this.createSfAutoRestHttpHeaders(),
            port: parsedUri.port ? parseInt(parsedUri.port) : SfConstants.SF_HTTP_GATEWAY_PORT,
            protocol: parsedUri.protocol, // Preserve protocol from URI (http: or https:)
            //timeout: this.timeOut,
            key: this.key,
            cert: this.certificate,
            enableTrace: true,
            rejectUnauthorized: false
        };
        return httpOptions;
    }

    public createHttpOptions(absolutePath = '', uriParameters: UriParameters = this.createUriParameters()): tls.ConnectionOptions | RequestOptions {
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

    public createUriParameters(): UriParameters {
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

    /**
     * Generic pagination helper - iteratively fetches all pages
     * Replaces broken recursive logic in continuation token handling
     */
    private async getAllPaginated<T>(
        fetchPage: (continuationToken?: string) => Promise<{ items?: T[], continuationToken?: string }>
    ): Promise<T[]> {
        const allItems: T[] = [];
        let continuationToken: string | undefined = undefined;
        let pageCount = 0;
        
        do {
            try {
                pageCount++;
                const response = await fetchPage(continuationToken);
                
                if (response.items && response.items.length > 0) {
                    allItems.push(...response.items);
                    SfUtility.outputLog(
                        `Fetched page ${pageCount}: ${response.items.length} items, total: ${allItems.length}`,
                        null,
                        debugLevel.info
                    );
                } else {
                    SfUtility.outputLog(`Page ${pageCount} contained no items`, null, debugLevel.debug);
                }
                
                continuationToken = response.continuationToken;
                
            } catch (error) {
                const message = `Pagination failed at page ${pageCount}`;
                SfUtility.outputLog(message, error, debugLevel.error);
                throw new PaginationError(message, { page: pageCount, cause: error });
            }
        } while (continuationToken);
        
        SfUtility.outputLog(`Pagination complete: ${pageCount} pages, ${allItems.length} total items`, null, debugLevel.info);
        return allItems;
    }

    public async getApplications(continuationToken?: string): Promise<sfModels.ApplicationInfo[]> {
        // Use new pagination helper instead of manual recursion
        return this.getAllPaginated(async (token) => {
            const response = await this.sfApi.getApplicationInfoList({ continuationToken: token });
            return {
                items: response.items || [],
                continuationToken: response.continuationToken
            };
        });
    }    
    // Convenience method for getting single node details
    public async getNodeInfo(nodeName: string): Promise<sfModels.NodeInfo> {
        return await this.getNode(nodeName);
    }
    
    // Get deployed applications on a node
    public async getDeployedApplications(nodeName: string): Promise<any[]> {
        try {
            SfUtility.outputLog(`Getting deployed applications for node: ${nodeName} (using ${this.useDirectRest ? 'DIRECT REST' : 'AZURE SDK'})`, null, debugLevel.info);
            
            if (this.useDirectRest && this.directClient) {
                // Use direct REST client
                const response = await this.directClient.getDeployedApplicationInfoList(nodeName);
                SfUtility.outputLog(`🔍 DIRECT REST response.items length: ${response.items?.length || 0}`, null, debugLevel.info);
                return response.items || [];
            } else {
                // Use Azure SDK with pagination
                return this.getAllPaginated(async (token) => {
                    const response = await this.sfApi.getDeployedApplicationInfoList(nodeName, { continuationToken: token });
                    SfUtility.outputLog(`🔍 AZURE SDK response.items length: ${response.items?.length || 0}`, null, debugLevel.info);
                    return {
                        items: response.items || [],
                        continuationToken: response.continuationToken
                    };
                });
            }
        } catch (error) {
            SfUtility.outputLog(`Failed to get deployed applications for node: ${nodeName}`, error, debugLevel.error);
            throw new NetworkError(`Failed to retrieve deployed applications for node ${nodeName}`, { cause: error });
        }
    }
    
    // Get deployed service packages on a node for an application
    public async getDeployedServicePackages(nodeName: string, applicationId: string): Promise<any[]> {
        try {
            SfUtility.outputLog(`Getting deployed service packages for app ${applicationId} on node ${nodeName}`, null, debugLevel.info);
            
            const response = await this.sfApi.getDeployedServicePackageInfoList(nodeName, applicationId);
            SfUtility.outputLog(`Retrieved ${response.length || 0} service packages`, null, debugLevel.info);
            
            // Try to enrich with health states from deployed application health API
            try {
                const deployedAppHealth = await this.sfApi.getDeployedApplicationHealth(nodeName, applicationId, {
                    deployedServicePackagesHealthStateFilter: 0 // All health states
                });
                
                if (deployedAppHealth.deployedServicePackageHealthStates) {
                    // Create health map by service manifest name
                    const healthMap = new Map<string, string>();
                    for (const pkgHealth of deployedAppHealth.deployedServicePackageHealthStates) {
                        if (pkgHealth.serviceManifestName && pkgHealth.aggregatedHealthState) {
                            healthMap.set(pkgHealth.serviceManifestName, pkgHealth.aggregatedHealthState);
                        }
                    }
                    
                    // Enrich service packages with health states
                    response.forEach((pkg: sfModels.DeployedServicePackageInfo) => {
                        const pkgInfo = pkg as any; // Add properties dynamically
                    const manifestName = pkgInfo.serviceManifestName || pkg.name;
                        if (manifestName && healthMap.has(manifestName)) {
                            pkgInfo.healthState = healthMap.get(manifestName);
                        }
                    });
                    SfUtility.outputLog(`Enriched ${response.length} service packages with health states`, null, debugLevel.info);
                }
            } catch (healthError) {
                SfUtility.outputLog('Could not get deployed app health - health states unavailable', healthError, debugLevel.warn);
            }
            
            return response || [];
        } catch (error) {
            SfUtility.outputLog(`Failed to get service packages`, error, debugLevel.error);
            throw new NetworkError(`Failed to retrieve service packages`, { cause: error });
        }
    }
    
    // Get deployed application info (single application on a node)
    public async getDeployedApplicationInfo(nodeName: string, applicationId: string): Promise<any> {
        try {
            SfUtility.outputLog(`Getting deployed application info for app ${applicationId} on node ${nodeName}`, null, debugLevel.info);
            
            const response = await this.sfApi.getDeployedApplicationInfo(nodeName, applicationId);
            SfUtility.outputLog(`Retrieved deployed application info`, response, debugLevel.debug);
            return response;
        } catch (error) {
            SfUtility.outputLog(`Failed to get deployed application info`, error, debugLevel.error);
            throw new NetworkError(`Failed to retrieve deployed application info`, { cause: error });
        }
    }
    
    // Get deployed code packages
    public async getDeployedCodePackages(nodeName: string, applicationId: string, serviceManifestName: string): Promise<any[]> {
        try {
            SfUtility.outputLog(`Getting code packages for ${serviceManifestName}`, null, debugLevel.info);
            
            const response = await this.sfApi.getDeployedCodePackageInfoList(nodeName, applicationId, { serviceManifestName });
            SfUtility.outputLog(`Retrieved ${response.length || 0} code packages`, null, debugLevel.info);
            return response || [];
        } catch (error) {
            SfUtility.outputLog(`Failed to get code packages`, error, debugLevel.error);
            throw new NetworkError(`Failed to retrieve code packages`, { cause: error });
        }
    }
    
    // Get deployed replicas
    public async getDeployedReplicas(nodeName: string, applicationId: string, serviceManifestName: string): Promise<any[]> {
        try {
            SfUtility.outputLog(`Getting replicas for ${serviceManifestName}`, null, debugLevel.info);
            
            const response = await this.sfApi.getDeployedServiceReplicaInfoList(nodeName, applicationId, { serviceManifestName });
            SfUtility.outputLog(`Retrieved ${response.length || 0} replicas`, null, debugLevel.info);
            
            // Try to enrich with health states from partition health API
            if (response && response.length > 0) {
                try {
                    // Group replicas by partitionId to minimize API calls
                    const partitionIds = new Set<string>();
                    for (const replica of response) {
                        if (replica.partitionId) {
                            partitionIds.add(replica.partitionId);
                        }
                    }
                    
                    // Build health map from partition health for each unique partition
                    const healthMap = new Map<string, string>();
                    for (const partitionId of partitionIds) {
                        try {
                            const partitionHealth = await this.sfApi.getPartitionHealth(partitionId, {
                                replicasHealthStateFilter: 0 // All health states
                            });
                            
                            if (partitionHealth.replicaHealthStates) {
                                for (const replicaHealth of partitionHealth.replicaHealthStates) {
                                    const replicaId = (replicaHealth as any).id || (replicaHealth as any).replicaId || (replicaHealth as any).instanceId;
                                    if (replicaId && replicaHealth.aggregatedHealthState) {
                                        healthMap.set(replicaId, replicaHealth.aggregatedHealthState);
                                    }
                                }
                            }
                        } catch (partitionError) {
                            SfUtility.outputLog(`Could not get health for partition ${partitionId}`, partitionError, debugLevel.warn);
                        }
                    }
                    
                    // Enrich replicas with health states
                    response.forEach((replica: sfModels.DeployedServiceReplicaInfo) => {
                        const replicaInfo = replica as any; // Add properties dynamically
                    const replicaId = replicaInfo.replicaId || replicaInfo.instanceId;
                        if (replicaId && healthMap.has(replicaId)) {
                            replicaInfo.healthState = healthMap.get(replicaId);
                        }
                    });
                    SfUtility.outputLog(`Enriched ${response.length} replicas with health states from ${partitionIds.size} partitions`, null, debugLevel.info);
                } catch (healthError) {
                    SfUtility.outputLog('Could not get partition health - replica health states unavailable', healthError, debugLevel.warn);
                }
            }
            
            return response || [];
        } catch (error) {
            SfUtility.outputLog(`Failed to get replicas`, error, debugLevel.error);
            throw new NetworkError(`Failed to retrieve replicas`, { cause: error });
        }
    }
    
    // Convenience method for getting single application details
    public async getApplicationInfo(applicationId: string): Promise<sfModels.ApplicationInfo> {
        const response = await this.sfApi.getApplicationInfo(applicationId);
        return response;
    }
    
    // Convenience method for getting single service details
    public async getServiceInfo(serviceId: string, applicationId: string): Promise<sfModels.ServiceInfoUnion> {
        // Convert fabric:/ URIs to API format (remove fabric:/ and use ~ for delimiter)
        // Check if already encoded (doesn't start with fabric:/)
        const formattedServiceId = serviceId.startsWith('fabric:/') 
            ? serviceId.replace('fabric:/', '').replace(/\//g, '~')
            : serviceId; // Already encoded
        const formattedAppId = applicationId.startsWith('fabric:/') 
            ? applicationId.replace('fabric:/', '').replace(/\//g, '~')
            : applicationId; // Already encoded
        
        SfUtility.outputLog(`Getting service info: ${serviceId} (formatted: ${formattedServiceId}) from app: ${applicationId} (formatted: ${formattedAppId})`, null, debugLevel.info);
        return await this.getService(formattedAppId, formattedServiceId);
    }
    
    // Get partitions for a service
    public async getServicePartitions(serviceId: string, applicationId: string): Promise<any[]> {
        try {
            // Check if already encoded (doesn't start with fabric:/)
            const formattedServiceId = serviceId.startsWith('fabric:/') 
                ? serviceId.replace('fabric:/', '').replace(/\//g, '~')
                : serviceId; // Already encoded
            
            SfUtility.outputLog(`Getting partitions for service: ${serviceId} (formatted: ${formattedServiceId})`, null, debugLevel.info);
            
            return this.getAllPaginated(async (token) => {
                const response = await this.sfApi.getPartitionInfoList(formattedServiceId, { continuationToken: token });
                return {
                    items: response.items || [],
                    continuationToken: response.continuationToken
                };
            });
        } catch (error) {
            SfUtility.outputLog(`Failed to get partitions for service: ${serviceId}`, error, debugLevel.error);
            throw new NetworkError(`Failed to retrieve partitions for service ${serviceId}`, { cause: error });
        }
    }
    
    // Get replicas for a partition
    public async getPartitionReplicas(serviceId: string, applicationId: string, partitionId: string): Promise<any[]> {
        try {
            SfUtility.outputLog(`Getting replicas for partition: ${partitionId}`, null, debugLevel.info);
            
            return this.getAllPaginated(async (token) => {
                const response = await this.sfApi.getReplicaInfoList(partitionId, { continuationToken: token });
                return {
                    items: response.items || [],
                    continuationToken: response.continuationToken
                };
            });
        } catch (error) {
            SfUtility.outputLog(`Failed to get replicas for partition: ${partitionId}`, error, debugLevel.error);
            throw new NetworkError(`Failed to retrieve replicas for partition ${partitionId}`, { cause: error });
        }
    }
    
    // Get service health
    public async getServiceHealth(serviceId: string, applicationId: string): Promise<sfModels.ServiceHealth> {
        try {
            SfUtility.outputLog(`Getting health for service: ${serviceId}`, null, debugLevel.info);
            const health = await this.sfApi.getServiceHealth(serviceId);
            return health;
        } catch (error) {
            SfUtility.outputLog(`Failed to get service health: ${serviceId}`, error, debugLevel.error);
            throw new NetworkError(`Failed to retrieve health for service ${serviceId}`, { cause: error });
        }
    }
    
    // Get partition health
    public async getPartitionHealth(partitionId: string, serviceId: string, applicationId: string): Promise<sfModels.PartitionHealth> {
        try {
            SfUtility.outputLog(`Getting health for partition: ${partitionId}`, null, debugLevel.info);
            const health = await this.sfApi.getPartitionHealth(partitionId);
            return health;
        } catch (error) {
            SfUtility.outputLog(`Failed to get partition health: ${partitionId}`, error, debugLevel.error);
            throw new NetworkError(`Failed to retrieve health for partition ${partitionId}`, { cause: error });
        }
    }
    
    // Get replica health
    public async getReplicaHealth(replicaId: string, partitionId: string, serviceId: string, applicationId: string): Promise<sfModels.ReplicaHealth> {
        try {
            SfUtility.outputLog(`Getting health for replica: ${replicaId}`, null, debugLevel.info);
            const health = await this.sfApi.getReplicaHealth(partitionId, replicaId);
            return health;
        } catch (error) {
            SfUtility.outputLog(`Failed to get replica health: ${replicaId}`, error, debugLevel.error);
            throw new NetworkError(`Failed to retrieve health for replica ${replicaId}`, { cause: error });
        }
    }
    
    // Get service events
    public async getServiceEvents(serviceId: string, startTimeUtc?: string, endTimeUtc?: string): Promise<any[]> {
        try {
            // Default to last 24 hours if not specified
            if (!endTimeUtc) {
                endTimeUtc = new Date().toISOString();
            }
            if (!startTimeUtc) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                startTimeUtc = yesterday.toISOString();
            }
            
            SfUtility.outputLog(`Getting events for service: ${serviceId}`, null, debugLevel.info);
            const response = await this.sfApi.getServiceEventList(serviceId, startTimeUtc, endTimeUtc);
            SfUtility.outputLog(`Retrieved ${response.length || 0} service events`, null, debugLevel.info);
            return response || [];
        } catch (error) {
            SfUtility.outputLog(`Failed to get service events: ${serviceId}`, error, debugLevel.error);
            throw new NetworkError(`Failed to retrieve events for service ${serviceId}`, { cause: error });
        }
    }
    
    // Get partition events
    public async getPartitionEvents(partitionId: string, startTimeUtc?: string, endTimeUtc?: string): Promise<any[]> {
        try {
            // Default to last 24 hours if not specified
            if (!endTimeUtc) {
                endTimeUtc = new Date().toISOString();
            }
            if (!startTimeUtc) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                startTimeUtc = yesterday.toISOString();
            }
            
            SfUtility.outputLog(`Getting events for partition: ${partitionId}`, null, debugLevel.info);
            const response = await this.sfApi.getPartitionEventList(partitionId, startTimeUtc, endTimeUtc);
            SfUtility.outputLog(`Retrieved ${response.length || 0} partition events`, null, debugLevel.info);
            return response || [];
        } catch (error) {
            SfUtility.outputLog(`Failed to get partition events: ${partitionId}`, error, debugLevel.error);
            throw new NetworkError(`Failed to retrieve events for partition ${partitionId}`, { cause: error });
        }
    }
    
    // Get replica events
    public async getReplicaEvents(replicaId: string, partitionId: string, startTimeUtc?: string, endTimeUtc?: string): Promise<any[]> {
        try {            // Default to last 24 hours if not specified
            if (!endTimeUtc) {
                endTimeUtc = new Date().toISOString();
            }
            if (!startTimeUtc) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                startTimeUtc = yesterday.toISOString();
            }
            
            SfUtility.outputLog(`Getting events for replica: ${replicaId}`, null, debugLevel.info);
            const response = await this.sfApi.getPartitionReplicaEventList(partitionId, replicaId, startTimeUtc, endTimeUtc);
            SfUtility.outputLog(`Retrieved ${response.length || 0} replica events`, null, debugLevel.info);
            return response || [];
        } catch (error) {
            SfUtility.outputLog(`Failed to get replica events: ${replicaId}`, error, debugLevel.error);
            throw new NetworkError(`Failed to retrieve events for replica ${replicaId}`, { cause: error });
        }
    }
    
    // Get cluster events from EventStore
    public async getClusterEvents(startTimeUtc?: string, endTimeUtc?: string): Promise<any[]> {
        try {
            // Default to last 24 hours if not specified
            if (!endTimeUtc) {
                endTimeUtc = new Date().toISOString();
            }
            if (!startTimeUtc) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                startTimeUtc = yesterday.toISOString();
            }
            
            // EventStore expects dates without milliseconds in format: yyyy-MM-ddTHH:mm:ssZ
            const formatDateForEventStore = (isoString: string): string => {
                return isoString.replace(/\.\d{3}Z$/, 'Z');
            };
            
            const formattedStart = formatDateForEventStore(startTimeUtc);
            const formattedEnd = formatDateForEventStore(endTimeUtc);
            
            SfUtility.outputLog(`Requesting cluster events from ${formattedStart} to ${formattedEnd}`, null, debugLevel.info);
            
            // Bypass the SDK - call EventStore REST API directly
            // EventStore requires api-version=6.4 per Microsoft Learn docs (locked 2026-02-03)
            const encodedStart = encodeURIComponent(formattedStart);
            const encodedEnd = encodeURIComponent(formattedEnd);
            const path = `/EventsStore/Cluster/Events?api-version=6.4&StartTimeUtc=${encodedStart}&EndTimeUtc=${encodedEnd}`;
            
            SfUtility.outputLog(`Direct EventStore request: ${path}`, null, debugLevel.info);
            
            try {
                const parsedUri = url.parse(this.clusterHttpEndpoint!);
                const httpOptions: https.RequestOptions = {
                    host: parsedUri.hostname || "localhost",
                    method: "GET",
                    path: path,
                    headers: this.createSfAutoRestHttpHeaders(),
                    port: parsedUri.port ? parseInt(parsedUri.port) : SfConstants.SF_HTTP_GATEWAY_PORT,
                    key: this.key,
                    cert: this.certificate,
                    rejectUnauthorized: false
                };
                
                const responseText = await this.invokeRequestOptions(httpOptions);
                const response = responseText ? JSON.parse(responseText) : [];
                SfUtility.outputLog(`Retrieved ${response.length || 0} cluster events`, null, debugLevel.info);
                return response || [];
            } catch (error: unknown) {
                // If 24-hour query fails, try last 1 hour as fallback
                const err = error as any;
                if (err.statusCode === 500 || err.context?.status === 500 || err.message?.includes('500') || err.message?.includes('ArgumentException')) {
                    SfUtility.outputLog('24-hour query failed, trying 1-hour range', null, debugLevel.warn);
                    const oneHourAgo = new Date();
                    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
                    const fallbackStart = encodeURIComponent(formatDateForEventStore(oneHourAgo.toISOString()));
                    const fallbackEnd = encodeURIComponent(formatDateForEventStore(new Date().toISOString()));
                    const fallbackPath = `/EventsStore/Cluster/Events?api-version=6.4&StartTimeUtc=${fallbackStart}&EndTimeUtc=${fallbackEnd}`;
                    
                    try {
                        const parsedUri = url.parse(this.clusterHttpEndpoint!);
                        const httpOptions: https.RequestOptions = {
                            host: parsedUri.hostname || "localhost",
                            method: "GET",
                            path: fallbackPath,
                            headers: this.createSfAutoRestHttpHeaders(),
                            port: parsedUri.port ? parseInt(parsedUri.port) : SfConstants.SF_HTTP_GATEWAY_PORT,
                            key: this.key,
                            cert: this.certificate,
                            rejectUnauthorized: false
                        };
                        
                        const responseText = await this.invokeRequestOptions(httpOptions);
                        const response = responseText ? JSON.parse(responseText) : [];
                        SfUtility.outputLog(`Retrieved ${response.length || 0} cluster events (1-hour fallback)`, null, debugLevel.info);
                        return response || [];
                    } catch (fallbackError) {
                        SfUtility.outputLog('1-hour fallback also failed', fallbackError, debugLevel.error);
                        throw error; // Throw original error
                    }
                }
                throw error;
            }
        } catch (error) {
            SfUtility.outputLog('Failed to get cluster events', error, debugLevel.error);
            throw new NetworkError('Failed to retrieve cluster events', { cause: error });
        }
    }
    
    // Get repair tasks (jobs)
    public async getRepairTasks(): Promise<any[]> {
        try {
            const response = await this.sfApi.getRepairTaskList();
            SfUtility.outputLog(`Retrieved ${response.length || 0} repair tasks`, null, debugLevel.info);
            return response || [];
        } catch (error) {
            SfUtility.outputLog('Failed to get repair tasks', error, debugLevel.error);
            throw new NetworkError('Failed to retrieve repair tasks', { cause: error });
        }
    }
    
    public async getApplicationTypes(continuationToken?: string): Promise<sfModels.ApplicationTypeInfo[]> {
        // Use pagination helper instead of manual recursion
        return this.getAllPaginated(async (token) => {
            const response = await this.sfApi.getApplicationTypeInfoList({ continuationToken: token });
            SfUtility.outputLog('sfRest:getApplicationTypes page fetched', response, debugLevel.debug);
            return {
                items: response.items || [],
                continuationToken: response.continuationToken
            };
        });
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
    
    public async getApplicationHealth(applicationId: string): Promise<sfModels.ApplicationHealth> {
        const appHealth = await this.sfApi.getApplicationHealth(applicationId);
        SfUtility.outputLog(`sfRest:getApplicationHealth:${applicationId}`, appHealth, debugLevel.debug);
        return appHealth;
    }

    public async getClusterVersion(): Promise<sfModels.ClusterVersion> {
        const custerVersion = this.useDirectRest && this.directClient
            ? await this.directClient.getClusterVersion()
            : await this.sfApi.getClusterVersion();
        SfUtility.outputLog('sfMgr:connectToCluster:custerVersion:', custerVersion);
        return custerVersion as sfModels.ClusterVersion;
    }

    public async getClusterUpgradeProgress(): Promise<sfModels.ClusterUpgradeProgressObject> {
        try {
            SfUtility.outputLog('sfRest:getClusterUpgradeProgress:start', null, debugLevel.info);
            const upgradeProgress = await this.sfApi.getClusterUpgradeProgress();
            SfUtility.outputLog('sfRest:getClusterUpgradeProgress:complete', upgradeProgress, debugLevel.info);
            return upgradeProgress;
        } catch (error) {
            SfUtility.outputLog('Failed to get cluster upgrade progress', error, debugLevel.error);
            throw new NetworkError('Failed to retrieve cluster upgrade progress', { cause: error });
        }
    }

    /**
     * Get cluster load information including metrics and node load data
     * @returns Cluster load information with load metrics and balancing data
     */
    public async getClusterLoadInformation(): Promise<sfModels.ClusterLoadInfo> {
        try {
            SfUtility.outputLog('sfRest:getClusterLoadInformation:start', null, debugLevel.info);
            const loadInfo = await this.sfApi.getClusterLoad();
            SfUtility.outputLog('sfRest:getClusterLoadInformation:complete', loadInfo, debugLevel.debug);
            return loadInfo;
        } catch (error) {
            SfUtility.outputLog('Failed to get cluster load information', error, debugLevel.error);
            throw new NetworkError('Failed to retrieve cluster load information', { cause: error });
        }
    }

    /**
     * Get Image Store content (files and folders) at the specified path
     * @param path - Relative path in image store (empty for root)
     * @returns Image store content with files and folders
     */
    public async getImageStoreContent(path?: string): Promise<sfModels.ImageStoreContent> {
        try {
            const endpoint = path ? `ImageStore/${encodeURIComponent(path)}` : 'ImageStore';
            SfUtility.outputLog(`sfRest:getImageStoreContent:path=${path || 'root'}`, null, debugLevel.info);
            
            const content = await this.sfApi.getImageStoreContent(path || '');
            SfUtility.outputLog(`sfRest:getImageStoreContent:files=${content.storeFiles?.length || 0}, folders=${content.storeFolders?.length || 0}`, null, debugLevel.debug);
            return content;
        } catch (error) {
            SfUtility.outputLog(`Failed to get image store content at path: ${path}`, error, debugLevel.error);
            throw new NetworkError('Failed to retrieve image store content', { 
                context: { path },
                cause: error 
            });
        }
    }

    /**
     * Get the size of a folder in the image store
     * @param path - Relative path of folder (empty for root)
     * @returns Folder size information
     */
    public async getImageStoreFolderSize(path?: string): Promise<sfModels.FolderSizeInfo> {
        try {
            SfUtility.outputLog(`sfRest:getImageStoreFolderSize:path=${path || 'root'}`, null, debugLevel.info);
            
            // Note: Folder size API is not available in standard Service Fabric SDK
            // Would need direct REST implementation or use alternative approach
            throw new Error('Image Store folder size API not yet implemented - requires api-version=6.5');
        } catch (error) {
            SfUtility.outputLog(`Failed to get image store folder size at path: ${path}`, error, debugLevel.error);
            throw new NetworkError('Failed to retrieve image store folder size', { 
                context: { path },
                cause: error 
            });
        }
    }

    /**
     * Delete content from the image store
     * @param path - Relative path to delete
     */
    public async deleteImageStoreContent(path: string): Promise<void> {
        try {
            SfUtility.outputLog(`sfRest:deleteImageStoreContent:path=${path}`, null, debugLevel.info);
            await this.sfApi.deleteImageStoreContent(path);
            SfUtility.outputLog(`sfRest:deleteImageStoreContent:success`, null, debugLevel.info);
        } catch (error) {
            SfUtility.outputLog(` Failed to delete image store content at path: ${path}`, error, debugLevel.error);
            throw new NetworkError('Failed to delete image store content', { 
                context: { path },
                cause: error 
            });
        }
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
        try {
            // Use pagination helper instead of manual recursion
            const nodes = await this.getAllPaginated(async (token) => {
                const response = await this.sfApi.getNodeInfoList({ 
                    continuationToken: token, 
                    nodeStatusFilter: nodeStatusFilter 
                });
                return {
                    items: response.items || [],
                    continuationToken: response.continuationToken
                };
            });
            
            if (nodes.length === 0) {
                SfUtility.showWarning("No nodes found");
            }
            
            SfUtility.outputLog(`sfRest:getNodes: returning ${nodes.length} items`, null, debugLevel.info);
            return nodes;
        } catch (error) {
            SfUtility.outputLog('Failed to get nodes', error, debugLevel.error);
            throw new NetworkError('Failed to retrieve cluster nodes', { cause: error });
        }
    }

    public async getService(applicationId: string, serviceId: string): Promise<sfModels.ServiceInfoUnion> {
        const service = await this.sfApi.getServiceInfo(applicationId, serviceId);
        SfUtility.outputLog('sfRest:getService:complete', service);
        return service;
    }

    public async getServices(applicationId: string, continuationToken?: string): Promise<sfModels.ServiceInfoUnion[]> {
        // Use pagination helper instead of manual recursion
        return this.getAllPaginated(async (token) => {
            const response = await this.sfApi.getServiceInfoList(applicationId, { continuationToken: token });
            return {
                items: response.items || [],
                continuationToken: response.continuationToken
            };
        });
    }

    public async getServiceTypes(applicationTypeName: string, applicationTypeVersion: string): Promise<sfModels.GetServiceTypeInfoListResponse> {
        const serviceInfos = await this.sfApi.getServiceTypeInfoList(applicationTypeName, applicationTypeVersion);
        SfUtility.outputLog('sfRest:getServiceTypes:', serviceInfos);
        return serviceInfos;
    }

    public async getSystemServices(applicationId: string, continuationToken?: string): Promise<sfModels.ServiceInfoUnion[]> {
        // Use pagination helper instead of manual recursion
        return this.getAllPaginated(async (token) => {
            const response = await this.sfApi.getServiceInfoList(applicationId, { continuationToken: token });
            return {
                items: response.items || [],
                continuationToken: response.continuationToken
            };
        });
    }

    /**
     * Invoke HTTP request with proper async/await pattern
     * FIXED: Removed recursive callback anti-pattern that caused incomplete data retrieval
     */
    public async invokeRequestOptions(httpOptions: https.RequestOptions | tls.ConnectionOptions): Promise<string> {
        const method = (httpOptions as https.RequestOptions).method || 'GET';
        SfUtility.outputLog(`invokeRequest:${method} https://${httpOptions.host}:${httpOptions.port}${httpOptions.path}`);
        
        try {
            return await new Promise<string>((resolve, reject) => {
                const chunks: Buffer[] = [];
                
                const request = https.request(httpOptions, (response) => {
                    response.on('error', (error) => {
                        SfUtility.outputLog('Response error', error, debugLevel.error);
                        reject(new NetworkError('Response error', { cause: error }));
                    });

                    // Properly buffer all chunks - NO recursive calls
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
                        SfUtility.outputLog('Request completed', null, debugLevel.info);
                        resolve(body);
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
            SfUtility.showError(`invokeRequest failed: ${error}`);
            throw error;
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
            const reqOptions = options as RequestOptions; // Type guard
            reqOptions.method = method;
            options.host = parsedUri.hostname;
            options.path = restQuery;
            options.port = parsedUri.port ? parseInt(parsedUri.port) : SfConstants.SF_HTTP_GATEWAY_PORT;

            return await this.invokeRequestOptions(options);
        }
        catch (error) {
            SfUtility.showError(`invokeRestApi:error:${JSON.stringify(error)}`);
        }
    }

    // Get application manifest
    public async getApplicationManifest(applicationId: string): Promise<any> {
        try {
            SfUtility.outputLog(`Getting manifest for application: ${applicationId}`, null, debugLevel.info);
            
            // First get application info to extract type name and version
            const appInfo = await this.getApplicationInfo(applicationId);
            if (!appInfo.typeName || !appInfo.typeVersion) {
                throw new Error(`Application ${applicationId} missing type information`);
            }
            
            SfUtility.outputLog(`Application type: ${appInfo.typeName}, version: ${appInfo.typeVersion}`, null, debugLevel.debug);
            const manifest = await this.sfApi.getApplicationManifest(appInfo.typeName, appInfo.typeVersion);
            return manifest;
        } catch (error) {
            SfUtility.outputLog(`Failed to get application manifest: ${applicationId}`, error, debugLevel.error);
            throw new NetworkError(`Failed to retrieve manifest for application ${applicationId}`, { cause: error });
        }
    }
    
    // Get service manifest
    public async getServiceManifest(serviceId: string, applicationId: string): Promise<any> {
        try {
            SfUtility.outputLog(`Getting manifest for service: ${serviceId}`, null, debugLevel.info);
            
            // First get application info to extract type information
            const appInfo = await this.getApplicationInfo(applicationId);
            if (!appInfo.typeName || !appInfo.typeVersion) {
                throw new Error(`Application ${applicationId} missing type information`);
            }
            
            // Get service info to extract service type name
            const serviceInfo = await this.getServiceInfo(serviceId, applicationId);
            if (!serviceInfo.typeName) {
                throw new Error(`Service ${serviceId} missing type name`);
            }
            
            SfUtility.outputLog(`Service type: ${serviceInfo.typeName} from app type: ${appInfo.typeName}, version: ${appInfo.typeVersion}`, null, debugLevel.info);
            
            // Get the application manifest which contains the actual service manifest names
            SfUtility.outputLog(`Getting application manifest to extract service manifest names...`, null, debugLevel.info);
            const appManifest = await this.sfApi.getApplicationManifest(appInfo.typeName, appInfo.typeVersion);
            
            if (!appManifest.manifest) {
                throw new Error(`Application manifest is empty for ${appInfo.typeName} v${appInfo.typeVersion}`);
            }
            
            // Parse the application manifest XML to find service manifest names
            const appXml = xmljs.xml2js(appManifest.manifest, { compact: true }) as any;
            const appRoot = appXml.ApplicationManifest;
            
            // Get all ServiceManifestImport elements
            const imports = Array.isArray(appRoot.ServiceManifestImport) 
                ? appRoot.ServiceManifestImport 
                : [appRoot.ServiceManifestImport];
            
            const manifestNames: string[] = [];
            for (const imp of imports) {
                if (imp?.ServiceManifestRef?._attributes?.ServiceManifestName) {
                    const manifestName = imp.ServiceManifestRef._attributes.ServiceManifestName;
                    manifestNames.push(manifestName);
                    SfUtility.outputLog(`Found service manifest: ${manifestName}`, null, debugLevel.debug);
                }
            }
            
            SfUtility.outputLog(`Application manifest contains ${manifestNames.length} service manifests: ${manifestNames.join(', ')}`, null, debugLevel.info);
            
            // Try each manifest name until we find one that works
            // We can't reliably map service type to manifest name, so try them all
            let lastError: Error | undefined;
            for (const manifestName of manifestNames) {
                try {
                    SfUtility.outputLog(`Trying service manifest: ${manifestName}`, null, debugLevel.debug);
                    const manifest = await this.sfApi.getServiceManifest(
                        appInfo.typeName,
                        appInfo.typeVersion,
                        manifestName
                    );
                    
                    if (!manifest.manifest) {
                        continue; // Skip if manifest is empty
                    }
                    
                    // Parse the service manifest to check if it contains our service type
                    const serviceXml = xmljs.xml2js(manifest.manifest, { compact: true }) as any;
                    const serviceRoot = serviceXml.ServiceManifest;
                    
                    if (serviceRoot?.ServiceTypes) {
                        const serviceTypes = serviceRoot.ServiceTypes;
                        const statefulTypes = serviceTypes.StatefulServiceType;
                        const statelessTypes = serviceTypes.StatelessServiceType;
                        
                        // Normalize to arrays
                        const allTypes = [
                            ...(Array.isArray(statefulTypes) ? statefulTypes : statefulTypes ? [statefulTypes] : []),
                            ...(Array.isArray(statelessTypes) ? statelessTypes : statelessTypes ? [statelessTypes] : [])
                        ];
                        
                        for (const typeElem of allTypes) {
                            const typeName = typeElem?._attributes?.ServiceTypeName;
                            if (typeName === serviceInfo.typeName) {
                                SfUtility.outputLog(`✓ Found correct service manifest '${manifestName}' for service type '${serviceInfo.typeName}'`, null, debugLevel.info);
                                return manifest;
                            }
                        }
                    }
                } catch (error) {
                    lastError = error as Error;
                    SfUtility.outputLog(`Failed to get/parse manifest ${manifestName}: ${error}`, null, debugLevel.debug);
                }
            }
            
            // If we get here, we couldn't find the right manifest
            throw new Error(`Could not find service manifest for service type '${serviceInfo.typeName}' in any of: ${manifestNames.join(', ')}`);
        } catch (error) {
            SfUtility.outputLog(`Failed to get service manifest: ${serviceId}`, error, debugLevel.error);
            throw new NetworkError(`Failed to retrieve manifest for service ${serviceId}`, { cause: error });
        }
    }

    public async restartNode(nodeName: string, nodeInstanceId: string | null = null, createFabricDump: boolean | null = null): Promise<any> {
        // If nodeInstanceId not provided, fetch from node list
        let actualInstanceId: string = nodeInstanceId || "0";
        if (!nodeInstanceId) {
            SfUtility.outputLog(`restartNode: Fetching node list to get instance ID for ${nodeName}`, null, debugLevel.info);
            
            // Get node list instead of individual node (more reliable)
            const nodesResponse = this.useDirectRest && this.directClient
                ? await this.directClient.getNodeInfoList()
                : await this.sfApi.getNodeInfoList();
            
            // Find the specific node in the list
            const nodes = (nodesResponse as any)?.items || (nodesResponse as any)?.Items || [];
            const targetNode = nodes.find((n: any) => n.name === nodeName || n.Name === nodeName);
            
            if (!targetNode) {
                throw new Error(`Node ${nodeName} not found in cluster`);
            }
            
            SfUtility.outputLog(`restartNode: Found node in list: ${JSON.stringify(targetNode)}`, null, debugLevel.info);
            
            // Try both casing variants (PascalCase and lowercase)
            actualInstanceId = targetNode.instanceId || targetNode.InstanceId || "0";
            SfUtility.outputLog(`restartNode: Using instance ID: ${actualInstanceId}`, null, debugLevel.info);
        }
        
        // Use direct REST client if available - it gives us full control over the JSON payload
        if (this.useDirectRest && this.directClient) {
            SfUtility.outputLog(`restartNode: Using direct REST client`, null, debugLevel.info);
            await this.directClient.restartNode(nodeName, actualInstanceId);
        } else {
            // Use Azure SDK - but it adds default values we don't want
            const restartNodeDescription: sfModels.RestartNodeDescription = {
                nodeInstanceId: actualInstanceId,
                createFabricDump: createFabricDump ? 'True' : undefined
            };
            
            SfUtility.outputLog(`restartNode: Calling Azure SDK with description: ${JSON.stringify(restartNodeDescription)}`, null, debugLevel.info);
            await this.sfApi.restartNode(nodeName, restartNodeDescription);
        }
        
        SfUtility.outputLog('sfRest:restartNode:complete');
        return;
    }

    public async restartReplica(nodeName: string, partitionId: string, replicaId: string): Promise<void> {
        try {
            SfUtility.outputLog(`sfRest:restartReplica: node=${nodeName}, partition=${partitionId}, replica=${replicaId}`, null, debugLevel.info);
            await this.sfApi.restartReplica(nodeName, partitionId, replicaId);
            SfUtility.outputLog('sfRest:restartReplica:complete', null, debugLevel.info);
        } catch (error) {
            SfUtility.outputLog(`Failed to restart replica ${replicaId}`, error, debugLevel.error);
            throw new NetworkError(`Failed to restart replica ${replicaId}`, { cause: error });
        }
    }

    public async deleteReplica(nodeName: string, partitionId: string, replicaId: string): Promise<void> {
        try {
            SfUtility.outputLog(`sfRest:deleteReplica: node=${nodeName}, partition=${partitionId}, replica=${replicaId}`, null, debugLevel.info);
            await this.sfApi.removeReplica(nodeName, partitionId, replicaId);
            SfUtility.outputLog('sfRest:deleteReplica:complete', null, debugLevel.info);
        } catch (error) {
            SfUtility.outputLog(`Failed to delete replica ${replicaId}`, error, debugLevel.error);
            throw new NetworkError(`Failed to delete replica ${replicaId}`, { cause: error });
        }
    }

    public async deleteService(serviceId: string): Promise<void> {
        try {
            SfUtility.outputLog(`sfRest:deleteService: ${serviceId}`, null, debugLevel.info);
            await this.sfApi.deleteService(serviceId);
            SfUtility.outputLog('sfRest:deleteService:complete', null, debugLevel.info);
        } catch (error) {
            SfUtility.outputLog(`Failed to delete service ${serviceId}`, error, debugLevel.error);
            throw new NetworkError(`Failed to delete service ${serviceId}`, { cause: error });
        }
    }

    public async deleteApplication(applicationId: string): Promise<void> {
        try {
            SfUtility.outputLog(`sfRest:deleteApplication: ${applicationId}`, null, debugLevel.info);
            await this.sfApi.deleteApplication(applicationId);
            SfUtility.outputLog('sfRest:deleteApplication:complete', null, debugLevel.info);
        } catch (error) {
            SfUtility.outputLog(`Failed to delete application ${applicationId}`, error, debugLevel.error);
            throw new NetworkError(`Failed to delete application ${applicationId}`, { cause: error });
        }
    }

    public async unprovisionApplicationType(applicationTypeName: string, applicationTypeVersion: string): Promise<void> {
        try {
            SfUtility.outputLog(`sfRest:unprovisionApplicationType: ${applicationTypeName}:${applicationTypeVersion}`, null, debugLevel.info);
            
            const unprovisionInfo: sfModels.UnprovisionApplicationTypeDescriptionInfo = {
                applicationTypeVersion: applicationTypeVersion
            };
            
            await this.sfApi.unprovisionApplicationType(applicationTypeName, unprovisionInfo);
            SfUtility.outputLog('sfRest:unprovisionApplicationType:complete', null, debugLevel.info);
        } catch (error) {
            SfUtility.outputLog(`Failed to unprovision application type ${applicationTypeName}:${applicationTypeVersion}`, error, debugLevel.error);
            throw new NetworkError(`Failed to unprovision application type ${applicationTypeName}:${applicationTypeVersion}`, { cause: error });
        }
    }

    public async activateNode(nodeName: string): Promise<void> {
        try {
            SfUtility.outputLog(`sfRest:activateNode: ${nodeName}`, null, debugLevel.info);
            
            // Check current node state before activation
            const nodeInfo = this.useDirectRest && this.directClient
                ? await this.directClient.getNodeInfo(nodeName)
                : await this.sfApi.getNodeInfo(nodeName);
                
            // Handle both PascalCase (Direct REST) and lowercase (SDK) property names
            const nodeStatus = nodeInfo?.nodeStatus || (nodeInfo as any)?.NodeStatus || 'Unknown';
            SfUtility.outputLog(`sfRest:activateNode: Current node status: ${nodeStatus}`, null, debugLevel.info);
            
            // Only activate if node is not already Up
            if (nodeInfo && nodeStatus === 'Up' && !nodeInfo.nodeDeactivationInfo && !(nodeInfo as any).NodeDeactivationInfo) {
                SfUtility.outputLog(`sfRest:activateNode: Node is already Up and not deactivated - skipping`, null, debugLevel.info);
                return;
            }
            
            // Call activate API
            if (this.useDirectRest && this.directClient) {
                await this.directClient.enableNode(nodeName);
            } else {
                await this.sfApi.enableNode(nodeName);
            }
            
            SfUtility.outputLog('sfRest:activateNode:complete', null, debugLevel.info);
        } catch (error: any) {
            SfUtility.outputLog(`sfRest:activateNode:error: ${error.message}`, error, debugLevel.error);
            if (error.statusCode) {
                SfUtility.outputLog(`sfRest:activateNode:error:statusCode: ${error.statusCode}`, null, debugLevel.error);
            }
            throw error;
        }
    }

    public async deactivateNode(nodeName: string, intent: string = 'Pause'): Promise<void> {
        try {
            SfUtility.outputLog(`sfRest:deactivateNode: ${nodeName} with intent ${intent}`, null, debugLevel.info);
            SfUtility.outputLog(`sfRest:deactivateNode: useDirectRest=${this.useDirectRest}, hasDirectClient=${!!this.directClient}`, null, debugLevel.info);
            
            // Check current node state before deactivation
            const nodeInfo = this.useDirectRest && this.directClient
                ? await this.directClient.getNodeInfo(nodeName)
                : await this.sfApi.getNodeInfo(nodeName);
                
            // Handle both PascalCase (Direct REST) and lowercase (SDK) property names
            const nodeStatus = nodeInfo?.nodeStatus || (nodeInfo as any)?.NodeStatus || 'Unknown';
            SfUtility.outputLog(`sfRest:deactivateNode: Current node status: ${nodeStatus}`, null, debugLevel.info);
            
            // Only deactivate if node is Up or Enabling
            if (nodeInfo && nodeStatus !== 'Up' && nodeStatus !== 'Enabling') {
                SfUtility.outputLog(`sfRest:deactivateNode: Node is in ${nodeStatus} state - cannot deactivate`, null, debugLevel.warn);
                throw new Error(`Cannot deactivate node in ${nodeStatus} state. Node must be Up or Enabling.`);
            }
            
            // Call deactivate API
            if (this.useDirectRest && this.directClient) {
                await this.directClient.disableNode(nodeName, intent);
            } else {
                const deactivationIntent: sfModels.DeactivationIntentDescription = {
                    deactivationIntent: intent as sfModels.DeactivationIntent
                };
                await this.sfApi.disableNode(nodeName, deactivationIntent);
            }
            
            SfUtility.outputLog('sfRest:deactivateNode:complete', null, debugLevel.info);
        } catch (error: any) {
            SfUtility.outputLog(`sfRest:deactivateNode:error: ${error.message}`, error, debugLevel.error);
            if (error.statusCode) {
                SfUtility.outputLog(`sfRest:deactivateNode:error:statusCode: ${error.statusCode}`, null, debugLevel.error);
            }
            throw error;
        }
    }

    public async removeNodeState(nodeName: string): Promise<void> {
        try {
            SfUtility.outputLog(`sfRest:removeNodeState: ${nodeName}`, null, debugLevel.info);
            
            if (this.useDirectRest && this.directClient) {
                await this.directClient.removeNodeState(nodeName);
            } else {
                await this.sfApi.removeNodeState(nodeName);
            }
            SfUtility.outputLog('sfRest:removeNodeState:complete', null, debugLevel.info);
        } catch (error) {
            SfUtility.outputLog('sfRest:removeNodeState:error', error, debugLevel.error);
            throw error;
        }
    }
}