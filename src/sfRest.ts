import * as url from 'url';
import * as https from 'https';
import * as tls from 'tls';
import * as vscode from 'vscode';
import { SfUtility, debugLevel } from './sfUtility';
import { SfRestClient } from './sfRestClient';
import { ClientRequest, RequestOptions } from 'http';
import { SfConstants } from './sfConstants';
import { clusterCertificate } from './types/ClusterTypes';
import * as sfModels from './sdk/servicefabric/servicefabric/src/models';
import { ServiceFabricClientAPIs } from './sdk/servicefabric/servicefabric/src/serviceFabricClientAPIs';
import { NetworkError } from './models/Errors';
import * as xmljs from 'xml-js';
import { AzureAccount, HttpHeaders, UriParameters } from './types';
import { IHttpOptionsProvider } from './interfaces/IHttpOptionsProvider';
import { SfDirectRestClient } from './services/SfDirectRestClient';
import { getAllPaginated } from './infrastructure/PaginationHelper';

/** Result from provisionApplicationType indicating whether a fresh provision occurred or type already existed */
export interface ProvisionResult {
    /** True if the type+version was already provisioned (409 handled) */
    alreadyExists: boolean;
}

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
    private resourceManagerEndpoint = "https://management.azure.com";
    
    // Azure SDK client (legacy/fallback)
    private sfApi: ServiceFabricClientAPIs;
    
    // Direct REST client (no Azure SDK dependencies)
    private directClient?: SfDirectRestClient;
    
    // Flag to use direct REST instead of Azure SDK
    private useDirectRest = true; // Set to true to bypass Azure SDK

    // Cached image store connection string (e.g. 'file:C:\path' or 'fabric:ImageStore')
    private imageStoreConnectionString?: string;

    constructor(
        context: vscode.ExtensionContext,
        apiVersion?: string,
    ) {
        this.extensionContext = context;
        SfUtility.outputLog("SFRest:constructor:context.extensionPath:" + context.extensionPath);
        this.sfApi = this.initializeClusterConnection();
        
        // Initialize direct REST client with default endpoint
        this.directClient = new SfDirectRestClient({
            endpoint: this.clusterHttpEndpoint,
            apiVersion: this.clientApiVersion,
            certificate: Array.isArray(this.certificate) ? this.certificate[0] : this.certificate,
            key: this.key
        });
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

    /**
     * Configure REST clients with endpoint and certificate (no network calls).
     * Safe to call multiple times — will reconfigure each time.
     */
    public configureClients(endpoint: string, clusterCertificate?: clusterCertificate | undefined): void {
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
    }

    /**
     * Configure REST clients and verify connectivity by fetching cluster version.
     */
    public async connectToCluster(endpoint: string, clusterCertificate?: clusterCertificate | undefined): Promise<any> {
        this.configureClients(endpoint, clusterCertificate);
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

    public async getApplications(continuationToken?: string): Promise<sfModels.ApplicationInfo[]> {
        // Use pagination helper instead of manual recursion
        return getAllPaginated(async (token) => {
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
                return getAllPaginated(async (token) => {
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
            
            return getAllPaginated(async (token) => {
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
            
            return getAllPaginated(async (token) => {
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
            
            // Use direct REST client for EventStore (bypasses Azure SDK which doesn't support EventStore well)
            // EventStore requires api-version=6.4 per Microsoft Learn docs (locked 2026-02-03)
            if (!this.directClient) {
                throw new Error('Direct REST client not initialized — call configureClients() first');
            }
            
            try {
                const response = await this.directClient.getClusterEventList(formattedStart, formattedEnd);
                SfUtility.outputLog(`Retrieved ${response?.length || 0} cluster events`, null, debugLevel.info);
                return response || [];
            } catch (error: unknown) {
                // If 24-hour query fails, try last 1 hour as fallback
                const err = error as any;
                if (err.statusCode === 500 || err.context?.status === 500 || err.message?.includes('500') || err.message?.includes('ArgumentException')) {
                    SfUtility.outputLog('24-hour query failed, trying 1-hour range', null, debugLevel.warn);
                    const oneHourAgo = new Date();
                    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
                    const fallbackStart = formatDateForEventStore(oneHourAgo.toISOString());
                    const fallbackEnd = formatDateForEventStore(new Date().toISOString());
                    
                    try {
                        const response = await this.directClient.getClusterEventList(fallbackStart, fallbackEnd);
                        SfUtility.outputLog(`Retrieved ${response?.length || 0} cluster events (1-hour fallback)`, null, debugLevel.info);
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
        return getAllPaginated(async (token) => {
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

    /**
     * Get the ImageStoreConnectionString from the cluster manifest.
     * Returns 'fabric:ImageStore' (service-based) or 'file:C:\path' (file-based).
     * Result is cached after first retrieval.
     */
    public async getImageStoreConnectionString(): Promise<string> {
        if (this.imageStoreConnectionString) {
            return this.imageStoreConnectionString;
        }
        try {
            const manifest = await this.getClusterManifest();
            const xml = manifest.manifest || '';
            const match = xml.match(/ImageStoreConnectionString["'][^>]*Value\s*=\s*["']([^"']+)["']/);
            this.imageStoreConnectionString = match?.[1] || 'fabric:ImageStore';
        } catch (error) {
            SfUtility.outputLog('sfRest:getImageStoreConnectionString: failed to parse manifest, assuming fabric:ImageStore', error, debugLevel.warn);
            this.imageStoreConnectionString = 'fabric:ImageStore';
        }
        SfUtility.outputLog(`sfRest:getImageStoreConnectionString: ${this.imageStoreConnectionString}`, null, debugLevel.info);
        return this.imageStoreConnectionString;
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
    public async getImageStoreContent(path?: string): Promise<any> {
        try {
            SfUtility.outputLog(`sfRest:getImageStoreContent:path=${path || 'root'}`, null, debugLevel.info);
            
            if (this.useDirectRest && this.directClient) {
                const result = await this.directClient.getImageStoreContent(path || '');
                SfUtility.outputLog(`sfRest:getImageStoreContent:files=${result?.StoreFiles?.length || 0}, folders=${result?.StoreFolders?.length || 0}`, null, debugLevel.info);
                return result;
            }

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


    public async getClusters(): Promise<sfModels.GetClusterManifestResponse[]> {
        return new Promise<sfModels.GetClusterManifestResponse[]>((resolve, reject) => {
            this.getClusterManifest();
        });
    }

    public async getClusterServerCertificate(clusterHttpEndpoint: string, port = SfConstants.SF_HTTP_GATEWAY_PORT): Promise<tls.PeerCertificate | undefined> {
        // Parse hostname and port from the URL
        const parsedUri = url.parse(clusterHttpEndpoint);
        const host = parsedUri.hostname || 'localhost';
        const resolvedPort = parsedUri.port ? parseInt(parsedUri.port) : port;

        const tlsoptions: tls.ConnectionOptions = {
            host: host,
            port: resolvedPort,
            rejectUnauthorized: false,
        };

        return new Promise<tls.PeerCertificate | undefined>((resolve) => {
            const tlsClient = tls.connect(tlsoptions, () => {
                const cert = tlsClient.getPeerCertificate();
                SfUtility.outputLog(`tls response: fingerprint=${cert?.fingerprint}, CN=${cert?.subject?.CN}`, null, debugLevel.info);
                tlsClient.end();
                resolve(cert && cert.fingerprint ? cert : undefined);
            });

            tlsClient.on('error', (error) => {
                SfUtility.outputLog('getClusterServerCertificate: TLS connection error', error, debugLevel.error);
                resolve(undefined);
            });

            // Timeout after 5 seconds
            tlsClient.setTimeout(5000, () => {
                SfUtility.outputLog('getClusterServerCertificate: TLS connection timed out', null, debugLevel.warn);
                tlsClient.destroy();
                resolve(undefined);
            });
        });
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
            const nodes = await getAllPaginated(async (token) => {
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
        return getAllPaginated(async (token) => {
            const response = await this.sfApi.getServiceInfoList(applicationId, { continuationToken: token });
            return {
                items: response.items || [],
                continuationToken: response.continuationToken
            };
        });
    }

    public async getSystemServices(applicationId: string, continuationToken?: string): Promise<sfModels.ServiceInfoUnion[]> {
        // Use pagination helper instead of manual recursion
        return getAllPaginated(async (token) => {
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
            SfUtility.outputLog(`sfRest:deleteApplication: ${applicationId} via ${this.useDirectRest && this.directClient ? 'direct' : 'sdk'}`, null, debugLevel.info);
            
            if (this.useDirectRest && this.directClient) {
                await this.directClient.deleteApplication(applicationId);
            } else {
                await this.sfApi.deleteApplication(applicationId);
            }
        } catch (error: any) {
            throw new NetworkError(`Failed to delete application ${applicationId}`, { cause: error });
        }
    }

    public async unprovisionApplicationType(applicationTypeName: string, applicationTypeVersion: string): Promise<void> {
        try {
            SfUtility.outputLog(`sfRest:unprovisionApplicationType: ${applicationTypeName}:${applicationTypeVersion} via ${this.useDirectRest && this.directClient ? 'direct' : 'sdk'}`, null, debugLevel.info);
            
            if (this.useDirectRest && this.directClient) {
                await this.directClient.unprovisionApplicationType(applicationTypeName, applicationTypeVersion);
            } else {
                const unprovisionInfo: sfModels.UnprovisionApplicationTypeDescriptionInfo = {
                    applicationTypeVersion: applicationTypeVersion
                };
                await this.sfApi.unprovisionApplicationType(applicationTypeName, unprovisionInfo);
            }
            
            // Verify unprovision succeeded by checking type still exists
            try {
                const remainingTypes = await this.getApplicationTypeInfo(applicationTypeName);
                const stillExists = remainingTypes.some((t: any) => {
                    const ver = t.version || t.Version || t.applicationTypeVersion || t.ApplicationTypeVersion;
                    return ver === applicationTypeVersion;
                });
                if (stillExists) {
                    SfUtility.outputLog(`sfRest:unprovisionApplicationType: WARNING - type ${applicationTypeName}:${applicationTypeVersion} still appears in type list after unprovision`, null, debugLevel.warn);
                }
            } catch (verifyError) {
                // Non-fatal: verification query failed but unprovision may have succeeded
            }
        } catch (error: any) {
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

    // ── Deploy / Provision Methods ─────────────────────────────────────

    /**
     * Upload a single file to the Service Fabric Image Store.
     * PUT /ImageStore/{contentPath}?api-version=6.0
     */
    public async uploadToImageStore(contentPath: string, fileContent: Buffer): Promise<void> {
        try {
            const imageStoreConn = await this.getImageStoreConnectionString();
            SfUtility.outputLog(`sfRest:uploadToImageStore: ${contentPath} (${fileContent.length} bytes) endpoint=${this.clusterHttpEndpoint} imageStore=${imageStoreConn}`, null, debugLevel.info);

            if (imageStoreConn.startsWith('file:')) {
                // File-based image store (dev clusters) — copy directly to disk
                const fs = await import('fs');
                const path = await import('path');
                const basePath = imageStoreConn.substring('file:'.length);
                const destPath = path.join(basePath, ...contentPath.split('/'));
                await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
                await fs.promises.writeFile(destPath, new Uint8Array(fileContent));
            } else if (this.useDirectRest && this.directClient) {
                // Retry on transient SSL/network errors (e.g. ERR_SSL_BAD_DECRYPT with large files)
                const maxRetries = 2;
                for (let attempt = 0; attempt <= maxRetries; attempt++) {
                    try {
                        await this.directClient.uploadToImageStore(contentPath, fileContent);
                        break;
                    } catch (uploadErr: any) {
                        // Walk the error chain to find the underlying error code.
                        // NetworkError stores the original error in context.cause (not native Error.cause).
                        let code = '';
                        let msg = '';
                        let err = uploadErr;
                        while (err) {
                            if (!code && err.code) { code = err.code; }
                            if (!msg && err.message) { msg = err.message; }
                            // Walk both native Error.cause and our custom context.cause
                            err = err.cause || err.context?.cause;
                        }
                        const isTransient = code === 'ERR_SSL_BAD_DECRYPT' || code === 'ECONNRESET' || code === 'EPIPE' || code === 'EPROTO'
                            || msg.includes('BAD_DECRYPT');
                        if (isTransient && attempt < maxRetries) {
                            SfUtility.outputLog(`⚠️ Transient SSL/network error uploading ${contentPath} (attempt ${attempt + 1}/${maxRetries + 1}): ${code || msg}`, uploadErr, debugLevel.warn);
                            await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
                            continue;
                        }
                        throw uploadErr;
                    }
                }
            } else {
                // Use direct HTTP PUT since Azure SDK doesn't expose upload
                await this.directImageStoreUpload(contentPath, fileContent);
            }
            
            SfUtility.outputLog('sfRest:uploadToImageStore:complete', null, debugLevel.info);
        } catch (error) {
            const errMsg = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
            SfUtility.outputLog(`Failed to upload to image store: ${contentPath} - ${errMsg}`, error, debugLevel.error);
            throw new NetworkError(`Failed to upload to image store: ${contentPath}`, { cause: error });
        }
    }

    /**
     * Upload a file from disk to Image Store, streaming chunks to avoid loading entire file into memory.
     * Supports files of any size (1GB+) by reading only 4MB at a time from disk.
     */
    public async uploadFileToImageStore(contentPath: string, localFilePath: string, fileSize: number): Promise<void> {
        try {
            const imageStoreConn = await this.getImageStoreConnectionString();
            SfUtility.outputLog(`sfRest:uploadFileToImageStore: ${contentPath} (${fileSize} bytes) file=${localFilePath} imageStore=${imageStoreConn}`, null, debugLevel.info);

            if (imageStoreConn.startsWith('file:')) {
                // File-based image store (dev clusters) — copy directly to disk
                const fs = await import('fs');
                const path = await import('path');
                const basePath = imageStoreConn.substring('file:'.length);
                const destPath = path.join(basePath, ...contentPath.split('/'));
                await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
                await fs.promises.copyFile(localFilePath, destPath);
            } else if (this.useDirectRest && this.directClient) {
                const maxRetries = 2;
                for (let attempt = 0; attempt <= maxRetries; attempt++) {
                    try {
                        await this.directClient.uploadFileToImageStore(contentPath, localFilePath, fileSize);
                        break;
                    } catch (uploadErr: any) {
                        let code = '';
                        let msg = '';
                        let err = uploadErr;
                        while (err) {
                            if (!code && err.code) { code = err.code; }
                            if (!msg && err.message) { msg = err.message; }
                            err = err.cause || err.context?.cause;
                        }
                        const isTransient = code === 'ERR_SSL_BAD_DECRYPT' || code === 'ECONNRESET' || code === 'EPIPE' || code === 'EPROTO'
                            || msg.includes('BAD_DECRYPT');
                        if (isTransient && attempt < maxRetries) {
                            SfUtility.outputLog(`⚠️ Transient SSL/network error uploading ${contentPath} (attempt ${attempt + 1}/${maxRetries + 1}): ${code || msg}`, uploadErr, debugLevel.warn);
                            await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
                            continue;
                        }
                        throw uploadErr;
                    }
                }
            } else {
                // Fallback: read entire file for legacy path (non-direct REST)
                const fs = await import('fs');
                const content = fs.readFileSync(localFilePath);
                await this.directImageStoreUpload(contentPath, content);
            }

            SfUtility.outputLog('sfRest:uploadFileToImageStore:complete', null, debugLevel.info);
        } catch (error) {
            const errMsg = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
            SfUtility.outputLog(`Failed to upload file to image store: ${contentPath} - ${errMsg}`, error, debugLevel.error);
            throw new NetworkError(`Failed to upload file to image store: ${contentPath}`, { cause: error });
        }
    }

    /**
     * Upload an entire application package directory to the Image Store.
     * Recursively uploads all files under the given local directory.
     * Uses streaming file reads to avoid loading entire files into memory (supports 1GB+ packages).
     */
    public async uploadApplicationPackage(
        localPackagePath: string,
        imageStoreRelativePath: string,
        progress?: (fileName: string, current: number, total: number) => void,
    ): Promise<void> {
        try {
            SfUtility.outputLog(`sfRest:uploadApplicationPackage: ${localPackagePath} → ${imageStoreRelativePath}`, null, debugLevel.info);
            
            const fs = await import('fs');
            const path = await import('path');
            
            // Collect all files recursively with sizes
            const allFiles: { path: string; size: number }[] = [];
            const collectFiles = (dir: string): void => {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const full = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        collectFiles(full);
                    } else {
                        const stat = fs.statSync(full);
                        allFiles.push({ path: full, size: stat.size });
                    }
                }
            };
            collectFiles(localPackagePath);
            
            const totalBytes = allFiles.reduce((sum, f) => sum + f.size, 0);
            SfUtility.outputLog(`sfRest:uploadApplicationPackage: uploading ${allFiles.length} file(s), total ${totalBytes} bytes`, null, debugLevel.info);
            
            for (let i = 0; i < allFiles.length; i++) {
                const file = allFiles[i];
                const relativePath = path.relative(localPackagePath, file.path).replace(/\\/g, '/');
                const imageStorePath = `${imageStoreRelativePath}/${relativePath}`;
                
                progress?.(relativePath, i + 1, allFiles.length);
                await this.uploadFileToImageStore(imageStorePath, file.path, file.size);
            }
            
            // Upload _.dir marker files for fabric:ImageStore (service-based Image Store).
            // The Image Store Service requires these 0-byte marker files to recognize
            // uploaded paths as directories for the provision process.
            // File-based image stores (file:C:\path) use real OS directories and don't need markers.
            const imageStoreConn = await this.getImageStoreConnectionString();
            if (!imageStoreConn.startsWith('file:')) {
                const dirs = new Set<string>();
                dirs.add(imageStoreRelativePath);
                for (const file of allFiles) {
                    const relativePath = path.relative(localPackagePath, file.path).replace(/\\/g, '/');
                    const dirParts = relativePath.split('/');
                    // Add each intermediate directory
                    for (let d = 1; d < dirParts.length; d++) {
                        dirs.add(`${imageStoreRelativePath}/${dirParts.slice(0, d).join('/')}`);
                    }
                }
                SfUtility.outputLog(`sfRest:uploadApplicationPackage: uploading ${dirs.size} _.dir marker(s)`, null, debugLevel.info);
                const emptyBuffer = Buffer.alloc(0);
                for (const dir of dirs) {
                    const markerPath = `${dir}/_.dir`;
                    SfUtility.outputLog(`sfRest:uploadApplicationPackage: uploading marker ${markerPath}`, null, debugLevel.info);
                    await this.uploadToImageStore(markerPath, emptyBuffer);
                }
            }
            
            SfUtility.outputLog('sfRest:uploadApplicationPackage:complete', null, debugLevel.info);
        } catch (error) {
            SfUtility.outputLog(`Failed to upload application package from ${localPackagePath}`, error, debugLevel.error);
            throw new NetworkError(`Failed to upload application package`, { cause: error });
        }
    }

    /**
     * Verify that uploaded content exists in the Image Store before provisioning.
     * Logs the content listing for diagnostics.
     */
    public async verifyImageStoreContent(imageStorePath: string): Promise<boolean> {
        try {
            const content = await this.getImageStoreContent(imageStorePath);
            if (!content) {
                SfUtility.outputLog(`sfRest:verifyImageStoreContent: no content at ${imageStorePath}`, null, debugLevel.warn);
                return false;
            }
            const files = content?.StoreFiles || content?.storeFiles || [];
            const folders = content?.StoreFolders || content?.storeFolders || [];
            SfUtility.outputLog(`sfRest:verifyImageStoreContent: ${imageStorePath} → ${files.length} files, ${folders.length} folders`, null, debugLevel.info);
            for (const f of files) {
                SfUtility.outputLog(`  file: ${f?.StoreRelativePath || f?.storeRelativePath || JSON.stringify(f)}`, null, debugLevel.info);
            }
            for (const d of folders) {
                SfUtility.outputLog(`  folder: ${d?.StoreRelativePath || d?.storeRelativePath || JSON.stringify(d)}`, null, debugLevel.info);
            }
            return files.length > 0 || folders.length > 0;
        } catch (error) {
            SfUtility.outputLog(`sfRest:verifyImageStoreContent: error verifying ${imageStorePath}`, error, debugLevel.warn);
            return false;
        }
    }

    /**
     * Provision an application type from the Image Store.
     * POST /ApplicationTypes/$/Provision?api-version=6.2
     * 
     * Returns a ProvisionResult indicating whether the type was freshly provisioned
     * or already existed (409). The caller (SfDeployService) uses this to decide
     * whether unprovision+reprovision is needed.
     */
    public async provisionApplicationType(imageStorePath: string, isAsync: boolean = true, expectedTypeName?: string, expectedTypeVersion?: string): Promise<ProvisionResult> {
        try {
            SfUtility.outputLog(`sfRest:provisionApplicationType: ${imageStorePath} (async=${isAsync})`, null, debugLevel.info);
            
            if (this.useDirectRest && this.directClient) {
                await this.directClient.provisionApplicationType(imageStorePath, isAsync);
            } else {
                const provisionInfo: sfModels.ProvisionApplicationTypeDescriptionBaseUnion = {
                    kind: 'ImageStorePath',
                    applicationTypeBuildPath: imageStorePath,
                    async: isAsync,
                } as any;
                await this.sfApi.provisionApplicationType(provisionInfo);
            }
            
            SfUtility.outputLog('sfRest:provisionApplicationType:complete', null, debugLevel.info);
            return { alreadyExists: false };
        } catch (error: any) {
            if ((error?.statusCode === 409 || error?.cause?.statusCode === 409) && expectedTypeName && expectedTypeVersion) {
                // 409 = type already exists — verify the correct version is provisioned and Available
                SfUtility.outputLog(`sfRest:provisionApplicationType: 409 received, verifying ${expectedTypeName} v${expectedTypeVersion} is Available`, null, debugLevel.info);
                const types = await this.getApplicationTypeInfo(expectedTypeName);
                const match = types.find((t: any) => {
                    const ver = t.version || t.Version || t.applicationTypeVersion || t.ApplicationTypeVersion;
                    const status = t.status || t.Status || '';
                    return ver === expectedTypeVersion && (status === 'Available' || status === '' || !status);
                });
                if (match) {
                    SfUtility.outputLog(`sfRest:provisionApplicationType: verified ${expectedTypeName} v${expectedTypeVersion} is Available (already existed)`, null, debugLevel.info);
                    return { alreadyExists: true };
                }
                // Wrong version or not Available — fail
                SfUtility.outputLog(`sfRest:provisionApplicationType: existing type does not match expected ${expectedTypeName} v${expectedTypeVersion}`, types, debugLevel.error);
                throw new Error(`Application type ${expectedTypeName} exists but v${expectedTypeVersion} is not Available. Registered versions: ${JSON.stringify(types.map((t: any) => ({ version: t.Version || t.version, status: t.Status || t.status })))}`);
            }
            SfUtility.outputLog(`Failed to provision application type from ${imageStorePath}`, error, debugLevel.error);
            throw new NetworkError(`Failed to provision application type`, { cause: error });
        }
    }

    /**
     * Create a new application instance.
     * POST /Applications/$/Create?api-version=6.0
     */
    public async createApplication(
        appName: string,
        typeName: string,
        typeVersion: string,
        parameters?: Record<string, string>,
    ): Promise<void> {
        try {
            SfUtility.outputLog(`sfRest:createApplication: ${appName} (${typeName} v${typeVersion})`, null, debugLevel.info);
            
            if (this.useDirectRest && this.directClient) {
                await this.directClient.createApplication(appName, typeName, typeVersion, parameters);
            } else {
                const appDescription: sfModels.ApplicationDescription = {
                    name: appName,
                    typeName: typeName,
                    typeVersion: typeVersion,
                    parameterList: parameters
                        ? Object.entries(parameters).map(([key, value]) => ({ key, value }))
                        : undefined,
                } as any;
                await this.sfApi.createApplication(appDescription);
            }
            
            SfUtility.outputLog('sfRest:createApplication:complete', null, debugLevel.info);
        } catch (error: any) {
            if (error?.statusCode === 409 || error?.cause?.statusCode === 409) {
                // 409 = application already exists — verify it matches what we're deploying
                SfUtility.outputLog(`sfRest:createApplication: 409 received, verifying existing ${appName} matches ${typeName} v${typeVersion}`, null, debugLevel.info);
                try {
                    const appId = appName.replace('fabric:/', '');
                    let existingApp: any;
                    if (this.useDirectRest && this.directClient) {
                        existingApp = await this.directClient.getApplicationInfo(appId);
                    } else {
                        existingApp = await this.sfApi.getApplicationInfo(appId);
                    }
                    const existingType = existingApp?.TypeName || existingApp?.typeName;
                    const existingVersion = existingApp?.TypeVersion || existingApp?.typeVersion;
                    if (existingType === typeName && existingVersion === typeVersion) {
                        SfUtility.outputLog(`sfRest:createApplication: verified ${appName} already exists with ${typeName} v${typeVersion}`, null, debugLevel.info);
                        return;
                    }
                    // Mismatch — this is dangerous, do NOT proceed
                    SfUtility.outputLog(`sfRest:createApplication: MISMATCH! ${appName} exists with ${existingType} v${existingVersion} but deploying ${typeName} v${typeVersion}`, null, debugLevel.error);
                    throw new Error(`Application ${appName} already exists with ${existingType} v${existingVersion}. Cannot overwrite with ${typeName} v${typeVersion}. Remove the existing application first or use upgrade.`);
                } catch (verifyError: any) {
                    if (verifyError.message?.includes('already exists with')) {
                        throw verifyError; // Re-throw our mismatch error
                    }
                    // Could not verify — do NOT proceed blindly
                    SfUtility.outputLog(`sfRest:createApplication: cannot verify existing ${appName}, failing safe`, verifyError, debugLevel.error);
                    throw new Error(`Application ${appName} already exists (409) but could not verify its state. Remove it manually or use upgrade.`);
                }
            }
            SfUtility.outputLog(`Failed to create application ${appName}`, error, debugLevel.error);
            throw new NetworkError(`Failed to create application ${appName}`, { cause: error });
        }
    }

    /**
     * Delete an application package from the Image Store.
     */
    public async deleteImageStoreContent(contentPath: string): Promise<void> {
        try {
            SfUtility.outputLog(`sfRest:deleteImageStoreContent: ${contentPath}`, null, debugLevel.info);
            const imageStoreConn = await this.getImageStoreConnectionString();

            if (imageStoreConn.startsWith('file:')) {
                // File-based image store — delete from disk
                const fs = await import('fs');
                const path = await import('path');
                const basePath = imageStoreConn.substring('file:'.length);
                const targetPath = path.join(basePath, ...contentPath.split('/'));
                await fs.promises.rm(targetPath, { recursive: true, force: true });
            } else if (this.useDirectRest && this.directClient) {
                await this.directClient.deleteImageStoreContent(contentPath);
            } else {
                // Fallback: use direct HTTP DELETE
                await this.directImageStoreDelete(contentPath);
            }
            SfUtility.outputLog('sfRest:deleteImageStoreContent:complete', null, debugLevel.info);
        } catch (error) {
            SfUtility.outputLog(`Failed to delete image store content ${contentPath}`, error, debugLevel.error);
            throw new NetworkError(`Failed to delete image store content`, { cause: error });
        }
    }

    /**
     * Get application type info to check provision status.
     * Returns the list of registered versions for a given type name.
     */
    public async getApplicationTypeInfo(applicationTypeName: string): Promise<any[]> {
        try {
            SfUtility.outputLog(`sfRest:getApplicationTypeInfo: ${applicationTypeName}`, null, debugLevel.info);
            if (this.useDirectRest && this.directClient) {
                return await this.directClient.getApplicationType(applicationTypeName);
            } else {
                const result = await this.sfApi.getApplicationTypeInfoList();
                const items = (result as any)?.items || result || [];
                return Array.isArray(items) ? items.filter((t: any) => t.name === applicationTypeName || t.Name === applicationTypeName) : [];
            }
        } catch (error) {
            SfUtility.outputLog(`Failed to get application type info for ${applicationTypeName}`, error, debugLevel.error);
            return [];
        }
    }

    /**
     * Get the provisioned application manifest XML from the cluster for a given type+version.
     * GET /ApplicationTypes/{typeName}/$/GetApplicationManifest?ApplicationTypeVersion={version}
     * Returns the raw manifest XML string, or null if not found.
     */
    public async getProvisionedManifestXml(typeName: string, typeVersion: string): Promise<string | null> {
        try {
            SfUtility.outputLog(`sfRest:getProvisionedManifestXml: ${typeName} v${typeVersion}`, null, debugLevel.info);
            let result: any;
            if (this.useDirectRest && this.directClient) {
                result = await this.directClient.getApplicationManifest(typeName, typeVersion);
            } else {
                result = await this.sfApi.getApplicationManifest(typeName, typeVersion);
            }
            const manifestXml = result?.Manifest || result?.manifest || null;
            SfUtility.outputLog(`sfRest:getProvisionedManifestXml: got ${manifestXml ? manifestXml.length : 0} chars`, null, debugLevel.info);
            return manifestXml;
        } catch (error) {
            SfUtility.outputLog(`sfRest:getProvisionedManifestXml: failed for ${typeName} v${typeVersion}`, error, debugLevel.warn);
            return null;
        }
    }

    /**
     * Get all application instances of a given type+version.
     * Filters the full application list by TypeName and TypeVersion.
     */
    public async getApplicationsByType(typeName: string, typeVersion: string): Promise<any[]> {
        try {
            SfUtility.outputLog(`sfRest:getApplicationsByType: ${typeName} v${typeVersion}`, null, debugLevel.info);
            let apps: any[];
            if (this.useDirectRest && this.directClient) {
                const result = await this.directClient.getApplicationInfoList();
                apps = result?.items || (Array.isArray(result) ? result : []);
            } else {
                apps = await this.getApplications();
            }
            const filtered = apps.filter((a: any) => {
                const aType = a.TypeName || a.typeName;
                const aVersion = a.TypeVersion || a.typeVersion;
                return aType === typeName && aVersion === typeVersion;
            });
            SfUtility.outputLog(`sfRest:getApplicationsByType: found ${filtered.length} instance(s)`, null, debugLevel.info);
            return filtered;
        } catch (error) {
            SfUtility.outputLog(`sfRest:getApplicationsByType: failed for ${typeName} v${typeVersion}`, error, debugLevel.warn);
            return [];
        }
    }

    /**
     * Wait for application type to be provisioned (polling).
     * Returns true if the type+version is found as 'Available', false on timeout.
     */
    public async waitForProvision(
        applicationTypeName: string,
        applicationTypeVersion: string,
        timeoutMs: number = SfConstants.getTimeoutMs(),
        pollIntervalMs: number = 3000,
    ): Promise<boolean> {
        const deadline = Date.now() + timeoutMs;
        SfUtility.outputLog(`sfRest:waitForProvision: waiting for ${applicationTypeName} v${applicationTypeVersion}`, null, debugLevel.info);

        while (Date.now() < deadline) {
            try {
                const types = await this.getApplicationTypeInfo(applicationTypeName);
                const match = types.find((t: any) => {
                    const ver = t.version || t.Version || t.applicationTypeVersion || t.ApplicationTypeVersion;
                    const status = t.status || t.Status || '';
                    return ver === applicationTypeVersion && (status === 'Available' || status === '' || !status);
                });
                if (match) {
                    SfUtility.outputLog(`sfRest:waitForProvision: ${applicationTypeName} v${applicationTypeVersion} is available`, null, debugLevel.info);
                    return true;
                }
            } catch {
                // Ignore errors during polling — type may not exist yet
            }
            await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
        }

        SfUtility.outputLog(`sfRest:waitForProvision: timed out waiting for ${applicationTypeName} v${applicationTypeVersion}`, null, debugLevel.warn);
        return false;
    }

    /**
     * Upgrade an existing application instance (rolling upgrade).
     */
    public async upgradeApplication(
        applicationId: string,
        typeName: string,
        targetVersion: string,
        parameters?: Record<string, string>,
        upgradeKind: string = 'Rolling',
        rollingUpgradeMode: string = 'Monitored',
        failureAction: string = 'Rollback',
    ): Promise<void> {
        try {
            SfUtility.outputLog(`sfRest:upgradeApplication: ${applicationId} → v${targetVersion}`, null, debugLevel.info);
            if (this.useDirectRest && this.directClient) {
                await this.directClient.upgradeApplication(applicationId, typeName, targetVersion, parameters, upgradeKind, rollingUpgradeMode, failureAction);
            } else {
                // Azure SDK upgrade path
                const upgradeDescription: any = {
                    name: applicationId,
                    targetApplicationTypeVersion: targetVersion,
                    upgradeKind: upgradeKind === 'Rolling' ? 'Rolling' : 'Rolling',
                    rollingUpgradeMode: rollingUpgradeMode,
                    monitoringPolicy: { failureAction },
                    parameterList: parameters
                        ? Object.entries(parameters).map(([key, value]) => ({ key, value }))
                        : undefined,
                };
                await this.sfApi.startApplicationUpgrade(applicationId, upgradeDescription);
            }
            SfUtility.outputLog('sfRest:upgradeApplication:complete', null, debugLevel.info);
        } catch (error) {
            SfUtility.outputLog(`Failed to upgrade application ${applicationId}`, error, debugLevel.error);
            throw new NetworkError(`Failed to upgrade application ${applicationId}`, { cause: error });
        }
    }

    /**
     * Direct HTTP DELETE to image store.
     */
    private async directImageStoreDelete(contentPath: string): Promise<void> {
        const encodedPath = contentPath.split('/').map(s => encodeURIComponent(s)).join('/');
        const requestPath = `/ImageStore/${encodedPath}?api-version=${this.clientApiVersion}`;
        const options = this.createHttpOptions(requestPath);
        (options as any).method = 'DELETE';
        (options as any).headers = this.createSfAutoRestHttpHeaders();

        return new Promise((resolve, reject) => {
            const protocol = this.clusterHttpEndpoint.startsWith('https') ? https : require('http');
            const req = protocol.request(options, (res: any) => {
                let body = '';
                res.on('data', (chunk: string) => { body += chunk; });
                res.on('end', () => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        resolve();
                    } else {
                        reject(new Error(`Image store delete failed: HTTP ${res.statusCode} - ${body}`));
                    }
                });
            });
            req.on('error', reject);
            req.end();
        });
    }

    /**
     * Direct HTTP PUT to image store (fallback when not using directClient).
     */
    private async directImageStoreUpload(contentPath: string, fileContent: Buffer): Promise<void> {
        const encodedPath = contentPath.split('/').map(s => encodeURIComponent(s)).join('/');
        const requestPath = `/ImageStore/${encodedPath}?api-version=${this.clientApiVersion}`;
        const options = this.createHttpOptions(requestPath);
        (options as any).method = 'PUT';
        (options as any).headers = {
            ...this.createSfAutoRestHttpHeaders(),
            'Content-Type': 'application/octet-stream',
            'Content-Length': fileContent.length,
        };

        return new Promise((resolve, reject) => {
            const protocol = this.clusterHttpEndpoint.startsWith('https') ? https : require('http');
            const req = protocol.request(options, (res: any) => {
                let body = '';
                res.on('data', (chunk: string) => { body += chunk; });
                res.on('end', () => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        resolve();
                    } else {
                        reject(new Error(`Image store upload failed: HTTP ${res.statusCode} - ${body}`));
                    }
                });
            });
            req.on('error', reject);
            req.write(fileContent);
            req.end();
        });
    }
}
