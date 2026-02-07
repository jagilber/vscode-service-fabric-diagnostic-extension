import * as vscode from 'vscode';
import * as xmlConverter from 'xml-js';
import { SfUtility, debugLevel } from './sfUtility';
import { SfClusterFolder } from './sfClusterFolder';
import * as sfModels from './sdk/servicefabric/servicefabric/src/models';
import { SfRest } from './sfRest';
import { SfPs } from './sfPs';
import { SfConstants } from './sfConstants';
import { PeerCertificate } from 'tls';
import * as url from 'url';
import { ClusterConnectionError, NetworkError } from './models/Errors';
import { PiiObfuscation } from './utils/PiiObfuscation';

export type nodeType = {
    name: string;
    nodes: sfModels.NodeInfo[];
};

// schema
export type clusterCertificate = {
    certificate?: string;
    thumbprint?: string;
    commonName?: string;
    key?: string;
};

export type clusterEndpointInfo = {
    endpoint: string;
    clusterCertificate?: clusterCertificate;
    manifest?: string;
};

export class SfConfiguration {
    private xmlManifest = "";
    private jsonManifest = "";
    private jObjectManifest: Record<string, unknown> = {};
    private context: vscode.ExtensionContext;
    private clusterHttpEndpoint: string = SfConstants.SF_HTTP_GATEWAY_ENDPOINT;
    private clusterName?: string;
    private nodes: sfModels.NodeInfo[] = [];
    private nodeTypes: nodeType[] = [];
    private applicationTypes: sfModels.ApplicationTypeInfo[] = [];
    private applications: sfModels.ApplicationInfo[] = [];
    private services: sfModels.ServiceInfo[] = [];
    private systemServices: sfModels.ServiceInfo[] = [];
    private sfClusterFolder: SfClusterFolder;
    private sfRest: SfRest;
    private clusterCertificate: clusterCertificate = {};
    private clusterHealth?: sfModels.ClusterHealth;
    private sfPs: SfPs = new SfPs();
    // Maps to store health states from cluster health query
    private applicationHealthMap: Map<string, string> = new Map();
    private serviceHealthMap: Map<string, string> = new Map();
    private nodeHealthMap: Map<string, string> = new Map();
    private partitionHealthMap: Map<string, string> = new Map();
    private repairTasks: any[] = [];
    // Cache for image store availability check (avoid re-parsing manifest)
    private cachedIsNativeImageStore: boolean | null = null;
    // Concurrency guard for ensureRestClientReady
    private _restClientReadyPromise: Promise<void> | null = null;

    constructor(context: vscode.ExtensionContext, clusterEndpointInfo?: clusterEndpointInfo) {
        this.context = context;
        this.sfClusterFolder = new SfClusterFolder(context);
        this.sfRest = new SfRest(context);

        if (clusterEndpointInfo) {
            this.setClusterEndpoint(clusterEndpointInfo.endpoint);
            this.clusterName = url.parse(clusterEndpointInfo.endpoint).hostname!;

            if (clusterEndpointInfo.clusterCertificate) {
                this.setClusterCertificateInfo(clusterEndpointInfo.clusterCertificate);
            }
            else {
                this.getClusterCertificateFromServer();
            }

            if (clusterEndpointInfo.manifest) {
                this.setManifest(clusterEndpointInfo.manifest);
            }
        }
    }

    private addApplication(application: sfModels.ApplicationInfo) {
        this.applications.push(application);
    }

    private addApplicationType(applicationType: sfModels.ApplicationTypeInfo) {
        this.applicationTypes.push(applicationType);
    }

    private addNode(node: sfModels.NodeInfo) {
        this.nodes.push(node);
    }

    private addService(service: sfModels.ServiceInfo) {
        this.services.push(service);
    }



    public getClusterEndpoint(): string {
        return this.clusterHttpEndpoint!;
    }

    public getClusterHealth(): any {
        return this.clusterHealth;
    }
    
    /**
     * Ensure REST client is configured with endpoint and certificate (PEM) before making API calls.
     * For HTTPS clusters without cert info, discovers server cert via TLS handshake.
     * Retrieves PEM cert+key from local cert store if needed. Idempotent and concurrency-safe.
     */
    public async ensureRestClientReady(): Promise<void> {
        // Concurrency guard — if another call is already in progress, share that promise
        if (this._restClientReadyPromise) {
            return this._restClientReadyPromise;
        }
        this._restClientReadyPromise = this._doEnsureRestClientReady();
        try {
            await this._restClientReadyPromise;
        } finally {
            this._restClientReadyPromise = null;
        }
    }

    private async _doEnsureRestClientReady(): Promise<void> {
        const endpoint = this.clusterHttpEndpoint;
        if (!endpoint) {
            SfUtility.outputLog('ensureRestClientReady: no endpoint set', null, debugLevel.warn);
            return;
        }

        const isHttps = endpoint.toLowerCase().startsWith('https');

        if (isHttps && this.clusterCertificate) {
            // Step 1: If no thumbprint/CN yet, discover from server certificate via TLS handshake
            if (!this.clusterCertificate.thumbprint && !this.clusterCertificate.commonName) {
                try {
                    SfUtility.outputLog('ensureRestClientReady: No cert identity — discovering from server TLS handshake...', null, debugLevel.info);
                    await this.getClusterCertificateFromServer(endpoint);
                    SfUtility.outputLog(`ensureRestClientReady: Discovered thumbprint=${PiiObfuscation.thumbprint(this.clusterCertificate.thumbprint)}, CN=${this.clusterCertificate.commonName}`, null, debugLevel.info);
                } catch (tlsError) {
                    SfUtility.outputLog('ensureRestClientReady: Failed to discover server cert via TLS', tlsError, debugLevel.error);
                    // Continue anyway — configureClients without cert will be attempted
                }
            }

            // Step 2: If we now have thumbprint/CN but no PEM, retrieve from local cert store
            if ((this.clusterCertificate.thumbprint || this.clusterCertificate.commonName)
                && (!this.clusterCertificate.certificate || !this.clusterCertificate.key)) {
                try {
                    const identifier = this.clusterCertificate.thumbprint ?? this.clusterCertificate.commonName!;
                    SfUtility.outputLog(`ensureRestClientReady: Retrieving PEM cert for ${PiiObfuscation.thumbprint(identifier)}`, null, debugLevel.info);
                    this.clusterCertificate.certificate = await this.sfPs.getPemCertFromLocalCertStore(identifier);
                    this.clusterCertificate.key = await this.sfPs.getPemKeyFromLocalCertStore(identifier);
                    SfUtility.outputLog('ensureRestClientReady: PEM cert+key retrieved', null, debugLevel.info);
                } catch (certError) {
                    SfUtility.outputLog('ensureRestClientReady: Failed to retrieve PEM cert', certError, debugLevel.error);
                    throw certError;
                }
            }
        }

        // Configure REST client with endpoint and cert (no network call)
        this.sfRest.configureClients(endpoint, this.clusterCertificate);
    }
        
    public getSfRest(): SfRest {
        return this.sfRest;
    }
    
    public getClientCertificateThumbprint(): string | undefined {
        return this.clusterCertificate?.thumbprint;
    }
    
    public getServerCertificateThumbprint(): string | undefined {
        return this.clusterCertificate?.thumbprint;
    }
    
    public getClusterEndpointInfo(): clusterEndpointInfo | undefined {
        if (this.clusterHttpEndpoint) {
            return {
                endpoint: this.clusterHttpEndpoint,
                clusterCertificate: this.getClusterCertificate()
            };
        }
        return undefined;
    }

    public getClusterCertificate(): clusterCertificate | undefined {
        return this.clusterCertificate;
    }

    private async getClusterCertificateFromServer(clusterHttpEndpoint = this.clusterHttpEndpoint!): Promise<void> {
        const serverCertificate: PeerCertificate | undefined = await this.sfRest.getClusterServerCertificate(clusterHttpEndpoint);
        if (serverCertificate) {
            SfUtility.outputLog(`sfConfiguration:getClusterCertificateFromServer - thumbprint: ${PiiObfuscation.thumbprint(serverCertificate.fingerprint)}, CN: ${PiiObfuscation.commonName(serverCertificate.subject.CN)}`, null, debugLevel.info);
            //this.clusterCertificate = serverCertificate.raw.toString('base64');
            // Node.js fingerprint uses colons (F8:39:ED:...) but Windows cert store needs plain hex (F839ED...)
            this.clusterCertificate.thumbprint = serverCertificate.fingerprint.replace(/:/g, '');
            this.clusterCertificate.commonName = serverCertificate.subject.CN;
        }
        else {
            SfUtility.outputLog('sfConfiguration:getClusterCertificateFromServer:clusterCertificate:undefined', null, debugLevel.warn);
        }
        return Promise.resolve();
    }


    public getJsonManifest(): string {
        return this.jsonManifest;
    }

    public async populate(): Promise<void> {
        try {
            SfUtility.outputLog(`Populating cluster data for: ${PiiObfuscation.endpoint(this.clusterHttpEndpoint)}`, null, debugLevel.info);
            
            // Clear existing data before repopulating (important for refresh)
            this.applications = [];
            this.applicationTypes = [];
            this.services = [];
            this.nodes = [];
            this.systemServices = [];
            this.applicationHealthMap.clear();
            this.serviceHealthMap.clear();
            this.nodeHealthMap.clear();
            this.partitionHealthMap.clear();
            this.repairTasks = [];
            this.cachedIsNativeImageStore = null; // Clear image store cache on refresh
            
            // Ensure REST client is configured (retrieves PEM cert if needed)
            await this.ensureRestClientReady();
            
            // Fetch data in parallel for better performance
            try {
                SfUtility.outputLog('⏳ Starting parallel data fetch...', null, debugLevel.info);
                const [health, manifest, nodes, applicationTypes, repairTasks] = await Promise.all([
                    this.populateClusterHealth(),
                    this.populateManifest(),
                    this.populateNodes(),
                    this.populateApplicationTypes(),
                    this.populateRepairTasks()
                ]);
                SfUtility.outputLog(`✅ Parallel data fetch complete - nodes=${this.nodes.length}, apps=${this.applications.length}, appTypes=${this.applicationTypes.length}`, null, debugLevel.info);
            } catch (parallelError) {
                SfUtility.outputLog('❌ ERROR during parallel data fetch - DATA NOT POPULATED', parallelError, debugLevel.error);
                vscode.window.showErrorMessage(`Failed to fetch cluster data: ${parallelError instanceof Error ? parallelError.message : String(parallelError)}`);
                throw parallelError; // Re-throw instead of continuing
            }
            
            // Merge health states into nodes from cluster health
            SfUtility.outputLog(`🔀 Merging health states for ${this.nodes.length} nodes...`, null, debugLevel.info);
            this.nodes.forEach((node: sfModels.NodeInfo) => {
                SfUtility.outputLog(`  🖥️ Processing node: name='${node.name}', id='${node.id?.id}', current healthState='${node.healthState}'`, null, debugLevel.info);
                // ALWAYS update from health map (don't check if already exists)
                const healthState = this.nodeHealthMap.get(node.name || '') || (node.id?.id ? this.nodeHealthMap.get(node.id.id) : undefined);
                if (healthState) {
                    const oldHealth = node.healthState;
                    node.healthState = healthState as any;
                    if (oldHealth !== healthState) {
                        SfUtility.outputLog(`  🔄 UPDATED health state for node ${node.name}: '${oldHealth}' → '${healthState}'`, null, debugLevel.info);
                    } else {
                        SfUtility.outputLog(`  ✅ Confirmed health state '${healthState}' for node ${node.name}`, null, debugLevel.debug);
                    }
                } else {
                    SfUtility.outputLog(`  ⚠️ NO health state found in map for node ${node.name} (name='${node.name}', id='${node.id?.id}')`, null, debugLevel.warn);
                    SfUtility.outputLog(`  📋 Available keys in map: ${Array.from(this.nodeHealthMap.keys()).join(', ')}`, null, debugLevel.debug);
                }
            });
            
            // Fetch applications (depends on applicationTypes)
            const applications = await this.populateApplications();
            
            // Merge health states into applications from our health map
            SfUtility.outputLog(`🔀 Merging health states for ${applications.length} applications...`, null, debugLevel.info);
            applications.forEach((app: sfModels.ApplicationInfo) => {
                SfUtility.outputLog(`  📦 Processing app: name='${app.name}', id='${app.id}', current healthState='${app.healthState}'`, null, debugLevel.info);
                // ALWAYS update from health map (don't check if already exists)
                const healthState = this.applicationHealthMap.get(app.name || '') || this.applicationHealthMap.get(app.id || '');
                if (healthState) {
                    const oldHealth = app.healthState;
                    app.healthState = healthState;
                    if (oldHealth !== healthState) {
                        SfUtility.outputLog(`  🔄 UPDATED health state for app ${app.name}: '${oldHealth}' → '${healthState}'`, null, debugLevel.info);
                    } else {
                        SfUtility.outputLog(`  ✅ Confirmed health state '${healthState}' for app ${app.name}`, null, debugLevel.debug);
                    }
                } else {
                    SfUtility.outputLog(`  ⚠️ NO health state found in map for app ${app.name} (name='${app.name}', id='${app.id}')`, null, debugLevel.warn);
                    SfUtility.outputLog(`  📋 Available keys in map: ${Array.from(this.applicationHealthMap.keys()).join(', ')}`, null, debugLevel.debug);
                }
            });
            
            // Fetch services for each application
            for (const application of applications) {
                try {
                    await this.populateServices(application.id!);
                } catch (serviceError) {
                    SfUtility.outputLog(
                        `Failed to populate services for application: ${application.id}`,
                        serviceError,
                        debugLevel.warn
                    );
                    // Continue with other applications
                }
            }
            
            // Fetch system application services
            // Note: fabric:/System app doesn't appear in standard Applications list
            // Try direct service query with proper URL encoding
            try {
                // SDK expects application ID without fabric:/ prefix (e.g., "System" not "fabric:/System")
                const systemAppId = 'System';
                const services = await this.sfRest.getSystemServices(systemAppId);
                services.forEach((service: sfModels.ServiceInfo) => {
                    this.systemServices.push(service);
                });
                SfUtility.outputLog(`Populated ${this.systemServices.length} system services`, null, debugLevel.debug);
            } catch (systemError: unknown) {
                // System services unavailable on minimal dev clusters or require special handling
                SfUtility.outputLog('Failed to populate system services', systemError, debugLevel.warn);
                
                // Fallback: Use known system services for dev clusters
                // Note: Services based on standard dev cluster manifest
                // - RepairManager requires add-on feature, not in minimal clusters
                // - UpgradeOrchestration for SFRP/Azure clusters only
                // - ImageStoreService uses dedicated /ImageStore/ API (not queryable as service)
                // TODO: Make services expandable to show partitions → replicas → events (requires TreeDataProvider refactor)
                const knownSystemServices: Partial<sfModels.ServiceInfo>[] = [
                    { id: 'fabric:/System/ClusterManagerService', name: 'ClusterManagerService', healthState: 'Unknown' as any },
                    { id: 'fabric:/System/FaultAnalysisService', name: 'FaultAnalysisService', healthState: 'Unknown' as any },
                    { id: 'fabric:/System/NamingService', name: 'NamingService', healthState: 'Unknown' as any },
                    { id: 'fabric:/System/DnsService', name: 'DnsService', healthState: 'Unknown' as any },
                    { id: 'fabric:/System/EventStoreService', name: 'EventStoreService', healthState: 'Unknown' as any }
                ];
                
                SfUtility.outputLog('Using known system services list as fallback', null, debugLevel.info);
                knownSystemServices.forEach(service => {
                    this.systemServices.push(service as any);
                });
            }
            
            SfUtility.outputLog(`Cluster data population complete`, null, debugLevel.info);
        } catch (error) {
            const message = `Failed to populate cluster data for ${PiiObfuscation.endpoint(this.clusterHttpEndpoint)}`;
            SfUtility.outputLog(message, error, debugLevel.error);
            throw new ClusterConnectionError(message, { endpoint: this.clusterHttpEndpoint, cause: error });
        }
    }

    public async populateApplications(): Promise<sfModels.ApplicationInfo[]> {
        try {
            const applications = await this.sfRest.getApplications();
            applications.forEach((application: sfModels.ApplicationInfo) => {
                this.addApplication(application);
            });
            SfUtility.outputLog(`Populated ${applications.length} applications`, null, debugLevel.debug);
            return applications;
        } catch (error) {
            SfUtility.outputLog('Failed to populate applications', error, debugLevel.error);
            throw new NetworkError('Failed to retrieve applications', { cause: error });
        }
    }

    public async populateApplicationTypes(): Promise<void> {
        try {
            const applicationTypes = await this.sfRest.getApplicationTypes();
            applicationTypes.forEach((applicationType: sfModels.ApplicationTypeInfo) => {
                this.addApplicationType(applicationType);
            });
            SfUtility.outputLog(`Populated ${applicationTypes.length} application types`, null, debugLevel.debug);
        } catch (error) {
            SfUtility.outputLog('Failed to populate application types', error, debugLevel.error);
            throw new NetworkError('Failed to retrieve application types', { cause: error });
        }
    }

    public async populateClusterHealth(): Promise<void> {
        try {
            SfUtility.outputLog('🏥 QUERYING CLUSTER HEALTH API...', null, debugLevel.info);
            const clusterHealth = await this.sfRest.getClusterHealth();
            SfUtility.outputLog('✅ Cluster health API completed', clusterHealth, debugLevel.debug);
            this.clusterHealth = clusterHealth;
            
            // Build health state maps for efficient lookup
            if (clusterHealth.applicationHealthStates) {
                SfUtility.outputLog(`📊 Cluster health has ${clusterHealth.applicationHealthStates.length} application health states`, null, debugLevel.info);
                for (const appHealth of clusterHealth.applicationHealthStates) {
                    if (appHealth.name && appHealth.aggregatedHealthState) {
                        SfUtility.outputLog(`  📦 App '${appHealth.name}' → health='${appHealth.aggregatedHealthState}'`, null, debugLevel.info);
                        // Store by both name and ID (name is fabric:/AppName, ID is AppName)
                        this.applicationHealthMap.set(appHealth.name, appHealth.aggregatedHealthState);
                        // Also store by ID (without fabric: prefix)
                        const appId = appHealth.name.replace('fabric:/', '');
                        this.applicationHealthMap.set(appId, appHealth.aggregatedHealthState);
                    }
                }
                SfUtility.outputLog(`✅ Built health map for ${this.applicationHealthMap.size / 2} applications`, null, debugLevel.info);
            } else {
                SfUtility.outputLog(`⚠️ Cluster health has NO applicationHealthStates`, null, debugLevel.warn);
            }
            
            // Build node health state map
            if (clusterHealth.nodeHealthStates) {
                SfUtility.outputLog(`📊 Cluster health has ${clusterHealth.nodeHealthStates.length} node health states`, null, debugLevel.info);
                for (const nodeHealth of clusterHealth.nodeHealthStates) {
                    if (nodeHealth.name && nodeHealth.aggregatedHealthState) {
                        SfUtility.outputLog(`  🖥️ Node '${nodeHealth.name}' → health='${nodeHealth.aggregatedHealthState}'`, null, debugLevel.info);
                        this.nodeHealthMap.set(nodeHealth.name, nodeHealth.aggregatedHealthState);
                        // Also store by node ID if available
                        if (nodeHealth.id?.id) {
                            this.nodeHealthMap.set(nodeHealth.id.id, nodeHealth.aggregatedHealthState);
                        }
                    }
                }
                SfUtility.outputLog(`✅ Built health map for ${clusterHealth.nodeHealthStates.length} nodes`, null, debugLevel.info);
            } else {
                SfUtility.outputLog(`⚠️ Cluster health has NO nodeHealthStates`, null, debugLevel.warn);
            }
        } catch (error) {
            SfUtility.outputLog('Failed to populate cluster health', error, debugLevel.error);
            throw new NetworkError('Failed to retrieve cluster health', { cause: error });
        }
    }

    public async populateManifest(): Promise<void> {
        try {
            const data = await this.sfRest.getClusterManifest();
            this.setManifest(data);
            SfUtility.outputLog('Cluster manifest retrieved', null, debugLevel.debug);
        } catch (error) {
            SfUtility.outputLog('Failed to populate cluster manifest', error, debugLevel.error);
            throw new NetworkError('Failed to retrieve cluster manifest', { cause: error });
        }
    }

    public async populateNodes(): Promise<void> {
        try {
            const nodes = await this.sfRest.getNodes();
            nodes.forEach((node: sfModels.NodeInfo) => {
                this.addNode(node);
            });
            SfUtility.outputLog(`Populated ${nodes.length} nodes`, null, debugLevel.debug);
        } catch (error) {
            SfUtility.outputLog('Failed to populate nodes', error, debugLevel.error);
            throw new NetworkError('Failed to retrieve nodes', { cause: error });
        }
    }

    public async populateRepairTasks(): Promise<void> {
        try {
            SfUtility.outputLog('Populating repair tasks...', null, debugLevel.info);
            
            // Create a timeout promise (5 seconds)
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('Repair tasks request timed out after 5 seconds')), 5000);
            });
            
            // Race between the actual request and the timeout
            this.repairTasks = await Promise.race([
                this.sfRest.getRepairTasks(),
                timeoutPromise
            ]);
            
            SfUtility.outputLog(`Populated ${this.repairTasks.length} repair task(s)`, null, debugLevel.info);
        } catch (error) {
            // Repair Manager may not be available on all clusters (e.g., dev clusters)
            SfUtility.outputLog('Failed to populate repair tasks (service may not be available)', error, debugLevel.warn);
            this.repairTasks = [];
        }
    }

    /**
     * Check if the native image store service is available
     * The ImageStore REST API only works with fabric:ImageStore, not file-based stores
     * @returns true if using fabric:ImageStore, false for file-based stores
     */
    public isNativeImageStoreAvailable(): boolean {
        // Return cached result if available (no logging on cache hit)
        if (this.cachedIsNativeImageStore !== null) {
            return this.cachedIsNativeImageStore;
        }

        try {
            // Quick check: if manifest not populated yet, return false (will check again on refresh)
            if (!this.jObjectManifest || Object.keys(this.jObjectManifest).length === 0) {
                SfUtility.outputLog('Image store check: manifest not yet populated, returning false', null, debugLevel.debug);
                return false;
            }

            // Parse cluster manifest to get ImageStoreConnectionString
            const manifest = this.jObjectManifest as any;
            if (!manifest?.ClusterManifest?.FabricSettings?.Section) {
                this.cachedIsNativeImageStore = false;
                return false;
            }

            const sections = Array.isArray(manifest.ClusterManifest.FabricSettings.Section)
                ? manifest.ClusterManifest.FabricSettings.Section
                : [manifest.ClusterManifest.FabricSettings.Section];

            // Find Management section
            const managementSection = sections.find((s: any) => 
                s._attributes?.Name === 'Management'
            );

            if (!managementSection?.Parameter) {
                this.cachedIsNativeImageStore = false;
                return false;
            }

            const params = Array.isArray(managementSection.Parameter)
                ? managementSection.Parameter
                : [managementSection.Parameter];

            // Find ImageStoreConnectionString parameter
            const imageStoreParam = params.find((p: any) =>
                p._attributes?.Name === 'ImageStoreConnectionString'
            );

            const connectionString = imageStoreParam?._attributes?.Value || '';
            
            // Native image store uses "fabric:ImageStore"
            // File-based stores use "file:..." or "xstore:..."
            const isNative = connectionString.toLowerCase().startsWith('fabric:imagestore');
            
            // Only log on FIRST check (cache miss)
            SfUtility.outputLog(
                `Image store check (first time): ${connectionString} → ${isNative ? 'NATIVE' : 'FILE-BASED'}`,
                null,
                debugLevel.info
            );
            
            // Cache the result
            this.cachedIsNativeImageStore = isNative;
            return isNative;
        } catch (error) {
            SfUtility.outputLog('Failed to parse image store configuration', error, debugLevel.warn);
            this.cachedIsNativeImageStore = false;
            return false; // Default to hiding if we can't determine
        }
    }

    public async populateServices(applicationId: string): Promise<void> {
        try {
            const services = await this.sfRest.getServices(applicationId);
            
            // Try to get health states for all services in this application
            try {
                SfUtility.outputLog(`🏥 QUERYING APPLICATION HEALTH API for '${applicationId}'...`, null, debugLevel.info);
                const appHealth = await this.sfRest.getApplicationHealth(applicationId);
                SfUtility.outputLog(`✅ Application health API completed for '${applicationId}'`, null, debugLevel.debug);
                if (appHealth.serviceHealthStates) {
                    SfUtility.outputLog(`📊 App health has ${appHealth.serviceHealthStates.length} service health states`, null, debugLevel.info);
                    for (const svcHealth of appHealth.serviceHealthStates) {
                        if (svcHealth.serviceName && svcHealth.aggregatedHealthState) {
                            SfUtility.outputLog(`  🔧 Service '${svcHealth.serviceName}' → health='${svcHealth.aggregatedHealthState}'`, null, debugLevel.info);
                            // Store by both name and ID
                            this.serviceHealthMap.set(svcHealth.serviceName, svcHealth.aggregatedHealthState);
                            // Also store by ID (encode the service name)
                            const svcId = svcHealth.serviceName.replace('fabric:/', '').replace(/\//g, '~');
                            this.serviceHealthMap.set(svcId, svcHealth.aggregatedHealthState);
                        }
                    }
                    SfUtility.outputLog(`✅ Got health for ${appHealth.serviceHealthStates.length} services in ${applicationId}`, null, debugLevel.info);
                } else {
                    SfUtility.outputLog(`⚠️ App health has NO serviceHealthStates for ${applicationId}`, null, debugLevel.warn);
                }
                
                // Now query detailed health for each service to get partition health states
                for (const service of services) {
                    try {
                        const svcHealth = await this.sfRest.getServiceHealth(service.id!, applicationId);
                        if (svcHealth.partitionHealthStates) {
                            SfUtility.outputLog(`  📊 Service '${service.name}' has ${svcHealth.partitionHealthStates.length} partition health states`, null, debugLevel.debug);
                            for (const partHealth of svcHealth.partitionHealthStates) {
                                if (partHealth.partitionId && partHealth.aggregatedHealthState) {
                                    this.partitionHealthMap.set(partHealth.partitionId, partHealth.aggregatedHealthState);
                                    SfUtility.outputLog(`    📦 Partition '${partHealth.partitionId}' → health='${partHealth.aggregatedHealthState}'`, null, debugLevel.debug);
                                }
                            }
                        }
                    } catch (svcHealthError) {
                        SfUtility.outputLog(`  ⚠️ Could not fetch partition health for service ${service.id}`, svcHealthError, debugLevel.warn);
                    }
                }
            } catch (healthError) {
                SfUtility.outputLog(`❌ Could not fetch service health states for ${applicationId}`, healthError, debugLevel.error);
                // Continue anyway - services will show with default icons
            }
            
            // ✅ MERGE HEALTH STATES - This MUST be outside the health try-catch!
            SfUtility.outputLog(`🔀 Merging health states for ${services.length} services...`, null, debugLevel.info);
            SfUtility.outputLog(`📋 ServiceHealthMap has ${this.serviceHealthMap.size} entries:`, null, debugLevel.info);
            SfUtility.outputLog(`   Keys: ${Array.from(this.serviceHealthMap.keys()).join(', ')}`, null, debugLevel.info);
            
            services.forEach((service: sfModels.ServiceInfo) => {
                SfUtility.outputLog(`  🔧 Processing service: name='${service.name}', id='${service.id}', current healthState='${service.healthState}'`, null, debugLevel.info);
                // ALWAYS update from health map (don't check if already exists)
                const healthState = this.serviceHealthMap.get(service.name || '') || this.serviceHealthMap.get(service.id || '');
                SfUtility.outputLog(`    🔍 Lookup: get('${service.name}')='${this.serviceHealthMap.get(service.name || '')}', get('${service.id}')='${this.serviceHealthMap.get(service.id || '')}'`, null, debugLevel.debug);
                if (healthState) {
                    const oldHealth = service.healthState;
                    service.healthState = healthState;
                    if (oldHealth !== healthState) {
                        SfUtility.outputLog(`  🔄 UPDATED health state for service ${service.name}: '${oldHealth}' → '${healthState}'`, null, debugLevel.info);
                    } else {
                        SfUtility.outputLog(`  ✅ Confirmed health state '${healthState}' for service ${service.name}`, null, debugLevel.debug);
                    }
                } else {
                    SfUtility.outputLog(`  ⚠️ NO health state found in map for service ${service.name}`, null, debugLevel.warn);
                }
                this.addService(service);
            });
            SfUtility.outputLog(`✅ Populated ${services.length} services for ${applicationId}`, null, debugLevel.info);
        } catch (error) {
            SfUtility.outputLog(`Failed to populate services for ${applicationId}`, error, debugLevel.warn);
            // Don't throw - allow other applications to continue
        }
    }


    public async setClusterCertificate(clusterCertificate: string): Promise<void> {
        if (clusterCertificate.length >= 32 && clusterCertificate.length <= 40 && clusterCertificate.match(/^[0-9a-fA-F]+$/)) {
            SfUtility.outputLog(`sfConfiguration:setClusterCertificate:thumbprint: ${PiiObfuscation.thumbprint(clusterCertificate)}`, null, debugLevel.info);            //this.clusterCertificateThumbprint = clusterCertificate;
            this.clusterCertificate.thumbprint = clusterCertificate;
            this.clusterCertificate.certificate = await this.sfPs.getPemCertFromLocalCertStore(clusterCertificate);
        }
        else if (clusterCertificate.toUpperCase().includes('CERTIFICATE')) {
            SfUtility.outputLog(`sfConfiguration:setClusterCertificate:certificate: ${PiiObfuscation.certificate(clusterCertificate)}`, null, debugLevel.info);
            this.clusterCertificate.certificate = clusterCertificate;
        }
        else {
            SfUtility.outputLog(`sfConfiguration:setClusterCertificate:common name: ${PiiObfuscation.commonName(clusterCertificate)}`, null, debugLevel.info);
            this.clusterCertificate.commonName = clusterCertificate;
            this.clusterCertificate.certificate = await this.sfPs.getPemCertFromLocalCertStore(clusterCertificate, undefined, true);
        }

        return Promise.resolve();
    }

    private setClusterCertificateInfo(clusterCertificate: clusterCertificate): void {
        this.clusterCertificate = clusterCertificate;
    }

    public setClusterEndpoint(clusterHttpEndpoint: string): void {
        SfUtility.outputLog(`sfConfiguration:setClusterEndpoint: ${PiiObfuscation.endpoint(clusterHttpEndpoint)}`, null, debugLevel.info);
        this.clusterHttpEndpoint = clusterHttpEndpoint;
    }

    public setManifest(xmlManifest: string | sfModels.ClusterManifest): void {
        if (typeof xmlManifest === 'string') {
            this.xmlManifest = xmlManifest;
        } else {
            this.xmlManifest = (xmlManifest as any).manifest; // ClusterManifest wrapper
        }
        SfUtility.outputLog(`xml manifest: \r\n${this.xmlManifest}`);

        const xmlConverter = require('xml-js');
        this.jsonManifest = xmlConverter.xml2json(this.xmlManifest, { compact: true, spaces: 2 });
        SfUtility.outputLog(`json manifest: \r\n${this.jsonManifest}`);
        this.jObjectManifest = JSON.parse(this.jsonManifest);
        
        // Clear cached image store check when manifest changes
        this.cachedIsNativeImageStore = null;
        //this.clusterName = this.jObjectManifest.ClusterManifest._attributes.Name;
    }

}
