import * as vscode from 'vscode';
import { SfUtility, debugLevel } from './sfUtility';
import { SfClusterFolder } from './sfClusterFolder';
import * as sfModels from './sdk/servicefabric/servicefabric/src/models';
import { SfRest } from './sfRest';
import { SfPs } from './sfPs';
import { SfConstants } from './sfConstants';
import * as url from 'url';
import { ClusterConnectionError, NetworkError } from './models/Errors';
import { PiiObfuscation } from './utils/PiiObfuscation';
import { nodeType, clusterCertificate, clusterEndpointInfo } from './types/ClusterTypes';
import { ManifestService } from './services/ManifestService';
import { ClusterConnectionManager } from './services/ClusterConnectionManager';

// Re-export types for backward compatibility
export type { nodeType, clusterCertificate, clusterEndpointInfo } from './types/ClusterTypes';

export class SfConfiguration {
    private context: vscode.ExtensionContext;
    private clusterName?: string;
    private nodes: sfModels.NodeInfo[] = [];
    private nodeTypes: nodeType[] = [];
    private applicationTypes: sfModels.ApplicationTypeInfo[] = [];
    private applications: sfModels.ApplicationInfo[] = [];
    private services: sfModels.ServiceInfo[] = [];
    private systemServices: sfModels.ServiceInfo[] = [];
    private sfClusterFolder: SfClusterFolder;
    private sfRest: SfRest;
    private clusterHealth?: sfModels.ClusterHealth;
    private sfPs: SfPs = new SfPs();
    // Maps to store health states from cluster health query
    private applicationHealthMap: Map<string, string> = new Map();
    private serviceHealthMap: Map<string, string> = new Map();
    private nodeHealthMap: Map<string, string> = new Map();
    private partitionHealthMap: Map<string, string> = new Map();
    private repairTasks: any[] = [];
    // Delegates
    private manifestService: ManifestService;
    private connectionManager: ClusterConnectionManager;

    constructor(context: vscode.ExtensionContext, clusterEndpointInfo?: clusterEndpointInfo) {
        this.context = context;
        this.sfClusterFolder = new SfClusterFolder(context);
        this.sfRest = new SfRest(context);
        this.manifestService = new ManifestService();
        this.connectionManager = new ClusterConnectionManager(this.sfRest, this.sfPs, SfConstants.SF_HTTP_GATEWAY_ENDPOINT);

        if (clusterEndpointInfo) {
            this.connectionManager.setClusterEndpoint(clusterEndpointInfo.endpoint);
            this.clusterName = url.parse(clusterEndpointInfo.endpoint).hostname!;

            if (clusterEndpointInfo.clusterCertificate) {
                this.connectionManager.setClusterCertificateInfo(clusterEndpointInfo.clusterCertificate);
            }
            else {
                this.connectionManager.getClusterCertificateFromServer();
            }

            if (clusterEndpointInfo.manifest) {
                this.manifestService.setManifest(clusterEndpointInfo.manifest);
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
        return this.connectionManager.getClusterEndpoint();
    }

    public getClusterHealth(): any {
        return this.clusterHealth;
    }
    
    /**
     * Ensure REST client is configured with endpoint and certificate (PEM) before making API calls.
     * Delegates to ClusterConnectionManager.
     */
    public async ensureRestClientReady(): Promise<void> {
        return this.connectionManager.ensureRestClientReady();
    }
        
    public getSfRest(): SfRest {
        return this.sfRest;
    }
    
    public getClientCertificateThumbprint(): string | undefined {
        return this.connectionManager.getClientCertificateThumbprint();
    }
    
    public getServerCertificateThumbprint(): string | undefined {
        return this.connectionManager.getServerCertificateThumbprint();
    }
    
    public getClusterEndpointInfo(): clusterEndpointInfo | undefined {
        const endpoint = this.connectionManager.getClusterEndpoint();
        if (endpoint) {
            return {
                endpoint: endpoint,
                clusterCertificate: this.connectionManager.getClusterCertificate()
            };
        }
        return undefined;
    }

    public getClusterCertificate(): clusterCertificate | undefined {
        return this.connectionManager.getClusterCertificate();
    }


    public getJsonManifest(): string {
        return this.manifestService.getJsonManifest();
    }

    public async populate(): Promise<void> {
        const endpoint = this.connectionManager.getClusterEndpoint();
        try {
            SfUtility.outputLog(`Populating cluster data for: ${PiiObfuscation.endpoint(endpoint)}`, null, debugLevel.info);
            
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
            this.manifestService.clearCache(); // Clear image store cache on refresh
            
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
            const message = `Failed to populate cluster data for ${PiiObfuscation.endpoint(endpoint)}`;
            SfUtility.outputLog(message, error, debugLevel.error);
            throw new ClusterConnectionError(message, { endpoint: endpoint, cause: error });
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
            this.manifestService.setManifest(data);
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
     * Delegates to ManifestService
     */
    public isNativeImageStoreAvailable(): boolean {
        return this.manifestService.isNativeImageStoreAvailable();
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
        return this.connectionManager.setClusterCertificate(clusterCertificate);
    }

    public setClusterEndpoint(clusterHttpEndpoint: string): void {
        this.connectionManager.setClusterEndpoint(clusterHttpEndpoint);
    }

    public setManifest(xmlManifest: string | sfModels.ClusterManifest): void {
        this.manifestService.setManifest(xmlManifest);
    }

}
