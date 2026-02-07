import * as vscode from 'vscode';
import * as path from 'path';
import * as json from 'jsonc-parser';
import * as xmlConverter from 'xml-js';
import { SfUtility, debugLevel } from './sfUtility';
import { SfClusterFolder } from './sfClusterFolder';
import * as SfApi from './sdk/servicefabric/servicefabric/src/serviceFabricClientAPIs';
import * as sfModels from './sdk/servicefabric/servicefabric/src/models';
import { TreeItem } from './serviceFabricClusterView';
import { SfRestClient } from './sfRestClient';
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
export type clusterViewTreeItemType = [
    cluster: {
        label: string,
        children: [
            manifest: {
                label: string,
            },
            jobs: {
                label: string,
            },
            events: {
                label: string,
            },
            applications: {
                label: string,
                children: [
                    applicationType: {
                        label: string,
                        children: [
                            application: {
                                label: string,
                                children: [
                                    services: {
                                        label: string,
                                        children: []
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            nodes: {
                label: string,
                children: [
                    node: {
                        label: string,
                        children: []
                    }
                ]
            },
            system: {
                label: string,
                children: [
                    services: {
                        label: string,
                        children: []
                    }
                ]
            }
        ]
    }
];

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
    private clusterCertificateThumbprint?: string;
    private clusterCertificateCommonName?: string;
    private sfPs: SfPs = new SfPs();
    // Maps to store health states from cluster health query
    private applicationHealthMap: Map<string, string> = new Map();
    private serviceHealthMap: Map<string, string> = new Map();
    private nodeHealthMap: Map<string, string> = new Map();
    private partitionHealthMap: Map<string, string> = new Map();
    private replicaHealthMap: Map<string, string> = new Map();
    private repairTasks: any[] = [];
    private expandedPartitions: Set<string> = new Set();
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

    // public async init() {
    //     await this.sfRest.connectToCluster();
    // }

    public addApplication(application: sfModels.ApplicationInfo) {
        this.applications.push(application);
    }

    public addApplicationType(applicationType: sfModels.ApplicationTypeInfo) {
        this.applicationTypes.push(applicationType);
    }

    private addApplicationTreeItems(resourceUri: vscode.Uri, clusterViewTreeItemChildren: TreeItem[]) {
        SfUtility.outputLog(`addApplicationTreeItems: ${this.applications.length} apps, ${this.applicationTypes.length} app types`, null, debugLevel.info);
        const applicationItems: TreeItem[] = [];
        
        // Calculate aggregated health state for all applications
        const worstAppHealth = this.getWorstHealthState(this.applications);
        
        this.applicationTypes.forEach((applicationType: sfModels.ApplicationTypeInfo) => {
            const applicationTypeItems: TreeItem[] = [];
            // Only include applications that match this application type
            this.applications.forEach((application: sfModels.ApplicationInfo) => {
                if (application.typeName === applicationType.name) {
                    SfUtility.outputLog(`  Adding app ${application.name} to type ${applicationType.name}`, null, debugLevel.debug);
                    this.addServiceTreeItems(resourceUri, applicationTypeItems, application);
                }
            });
            // Only add the application type node if it has applications
            if (applicationTypeItems.length > 0) {
                SfUtility.outputLog(`  App type ${applicationType.name} has ${applicationTypeItems.length} applications`, null, debugLevel.info);
                const appTypeNode = new TreeItem(applicationType.name ?? 'undefined', {
                    children: applicationTypeItems,
                    resourceUri: resourceUri,
                    status: applicationType.status,
                    iconPath: this.getIcon(applicationType.status, 'folder-library') || new vscode.ThemeIcon('folder-library'),
                    contextValue: 'applicationType', // Enable unprovision menu on application type
                    itemType: 'application-type',
                    itemId: applicationType.name,
                    clusterEndpoint: this.clusterHttpEndpoint
                });
                // Store version info for unprovision operation (get latest version from applications)
                const versions = this.applications
                    .filter(app => app.typeName === applicationType.name)
                    .map(app => app.typeVersion)
                    .filter((v): v is string => !!v);
                if (versions.length > 0) {
                    appTypeNode.typeVersion = versions[0]; // Use first application's version
                }
                appTypeNode.typeName = applicationType.name;
                applicationItems.push(appTypeNode);
            } else {
                SfUtility.outputLog(`  Skipping app type ${applicationType.name} (no matching applications)`, null, debugLevel.debug);
            }
        });
        SfUtility.outputLog(`Total application type folders: ${applicationItems.length}, worst health: ${worstAppHealth}`, null, debugLevel.info);
        clusterViewTreeItemChildren.push(new TreeItem(`applications (${this.applications.length})`, {
            children: applicationItems,
            resourceUri: resourceUri,
            status: worstAppHealth,
            iconPath: this.getIcon(worstAppHealth, 'package') || new vscode.ThemeIcon('package')
        }));
    }

    private addClusterTreeItems(resourceUri: vscode.Uri, clusterViewTreeItemChildren: TreeItem[]) {
        // Add essentials node (cluster overview info)
        clusterViewTreeItemChildren.push(new TreeItem('essentials', {
            children: undefined,
            resourceUri: resourceUri,
            status: undefined,
            iconPath: new vscode.ThemeIcon('info', new vscode.ThemeColor('charts.blue')),
            itemType: 'essentials',
            itemId: 'cluster-essentials',
            contextValue: 'essentials', // Enable context menu for essentials
            clusterEndpoint: this.clusterHttpEndpoint
        }));
        
        // Add details node (cluster configuration details)
        clusterViewTreeItemChildren.push(new TreeItem('details', {
            children: undefined,
            resourceUri: resourceUri,
            status: undefined,
            iconPath: new vscode.ThemeIcon('list-tree', new vscode.ThemeColor('charts.green')),
            itemType: 'details',
            itemId: 'cluster-details',
            clusterEndpoint: this.clusterHttpEndpoint
        }));
        
        // Add metrics node (cluster performance metrics)
        clusterViewTreeItemChildren.push(new TreeItem('metrics', {
            children: undefined,
            resourceUri: resourceUri,
            status: undefined,
            iconPath: new vscode.ThemeIcon('graph', new vscode.ThemeColor('charts.red')),
            contextValue: 'metrics', // Enable context menu for metrics
            itemType: 'metrics',
            itemId: 'cluster-metrics',
            clusterEndpoint: this.clusterHttpEndpoint
        }));
        
        // Add cluster map node (visual topology view)
        clusterViewTreeItemChildren.push(new TreeItem('cluster map', {
            children: undefined,
            resourceUri: resourceUri,
            status: undefined,
            iconPath: {
                light: vscode.Uri.file(path.join(__filename, '..', '..', 'resources', 'light', 'cluster-map.svg')),
                dark: vscode.Uri.file(path.join(__filename, '..', '..', 'resources', 'dark', 'cluster-map.svg'))
            },
            itemType: 'cluster-map',
            itemId: 'cluster-map',
            clusterEndpoint: this.clusterHttpEndpoint
        }));
        
        // Add image store node (application packages) - always add, check availability on expand
        // Lazy loading: availability check deferred until user tries to expand
        const imageStoreItem = new TreeItem('image store', {
            children: undefined, // Lazy load on expansion
            resourceUri: resourceUri,
            status: undefined,
            iconPath: new vscode.ThemeIcon('package', new vscode.ThemeColor('charts.orange')),
            itemType: 'image-store',
            itemId: 'cluster-image-store',
            clusterEndpoint: this.clusterHttpEndpoint,
            path: '' // Root path
        });
        imageStoreItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        clusterViewTreeItemChildren.push(imageStoreItem);
        
        // Add health node with click handler
        clusterViewTreeItemChildren.push(new TreeItem('health', {
            children: undefined,
            resourceUri: resourceUri,
            status: this.clusterHealth?.aggregatedHealthState,
            iconPath: this.getIcon(this.clusterHealth?.aggregatedHealthState, 'heart') || new vscode.ThemeIcon('heart'),
            itemType: 'health',
            itemId: 'cluster-health',
            clusterEndpoint: this.clusterHttpEndpoint,
            contextValue: 'health'
        }));
        
        // Add manifest node with click handler
        clusterViewTreeItemChildren.push(new TreeItem('manifest', {
            children: undefined,
            resourceUri: resourceUri,
            status: undefined,
            iconPath: new vscode.ThemeIcon('file-code', new vscode.ThemeColor('charts.orange')),
            itemType: 'manifest',
            itemId: 'cluster-manifest',
            clusterEndpoint: this.clusterHttpEndpoint
        }));
        
        // Add events node with click handler and context menu
        clusterViewTreeItemChildren.push(new TreeItem('events', {
            children: undefined,
            resourceUri: resourceUri,
            status: undefined,
            iconPath: new vscode.ThemeIcon('calendar', new vscode.ThemeColor('charts.purple')),
            itemType: 'events',
            itemId: 'cluster-events',
            clusterEndpoint: this.clusterHttpEndpoint,
            contextValue: 'events'
        }));
        
        // Add commands node (PowerShell/CLI commands)
        clusterViewTreeItemChildren.push(new TreeItem('commands', {
            children: undefined,
            resourceUri: resourceUri,
            status: undefined,
            iconPath: new vscode.ThemeIcon('terminal', new vscode.ThemeColor('charts.yellow')),
            contextValue: 'commands',
            itemType: 'commands',
            itemId: 'cluster-commands',
            clusterEndpoint: this.clusterHttpEndpoint
        }));
        
        // Add repair tasks/jobs node with click handler
        // Determine status based on task states
        const repairTaskStatus = this.getRepairTasksStatus();
        const repairTaskCount = this.repairTasks.length;
        const repairLabel = repairTaskCount > 0 ? `repair tasks (${repairTaskCount})` : 'repair tasks';
        
        clusterViewTreeItemChildren.push(new TreeItem(repairLabel, {
            children: undefined,
            resourceUri: resourceUri,
            status: repairTaskStatus,
            iconPath: this.getIcon(repairTaskStatus, 'tools'),
            contextValue: 'repair-tasks',
            itemType: 'repair-tasks',
            itemId: 'cluster-repair-tasks',
            clusterEndpoint: this.clusterHttpEndpoint
        }));
    }

    public addNode(node: sfModels.NodeInfo) {
        this.nodes.push(node);
    }

    private addNodesGroupPlaceholder(resourceUri: vscode.Uri, clusterViewTreeItemChildren: TreeItem[]) {
        // Add nodes group with loading indicator - will lazy load when expanded
        clusterViewTreeItemChildren.push(new TreeItem(`nodes (...)`, {
            children: undefined, // Lazy load when expanded
            resourceUri: resourceUri,
            status: undefined,
            iconPath: new vscode.ThemeIcon('server'),
            itemType: 'nodes-group',
            clusterEndpoint: this.clusterHttpEndpoint
        }));
    }
    
    private addApplicationsGroupPlaceholder(resourceUri: vscode.Uri, clusterViewTreeItemChildren: TreeItem[]) {
        // Add applications group with loading indicator
        clusterViewTreeItemChildren.push(new TreeItem(`applications (...)`, {
            children: undefined,
            resourceUri: resourceUri,
            status: undefined,
            iconPath: new vscode.ThemeIcon('package'),
            itemType: 'applications-group',
            clusterEndpoint: this.clusterHttpEndpoint
        }));
    }
    
    private addSystemGroupPlaceholder(resourceUri: vscode.Uri, clusterViewTreeItemChildren: TreeItem[]) {
        // Add system services group with loading indicator
        clusterViewTreeItemChildren.push(new TreeItem(`system (...)`, {
            children: undefined,
            resourceUri: resourceUri,
            status: undefined,
            iconPath: new vscode.ThemeIcon('gear'),
            itemType: 'system-services-group',
            clusterEndpoint: this.clusterHttpEndpoint
        }));
    }

    // private addNodeType(nodeTypeName: string, node: sfModels.NodeInfo) {
    //     const nodeType = this.nodeTypes.find((nodeType: nodeType) => nodeType.name === nodeTypeName);
    //     if (nodeType) {
    //         nodeType.nodes.push(node);
    //     }
    //     else {
    //         this.nodeTypes.push({ name: nodeTypeName, nodes: [node] });
    //     }
    // }

    public addService(service: sfModels.ServiceInfo) {
        this.services.push(service);
    }

    private addServiceTreeItems(resourceUri: vscode.Uri, applicationTypeItems: TreeItem[], application: sfModels.ApplicationInfo) {
        const applicationItems: TreeItem[] = [];
        
        // Add Manifest node FIRST (match SFX ordering - manifest before services)
        const manifestItem = new TreeItem('Manifest', {
            children: [],  // Leaf node
            resourceUri: resourceUri,
            status: undefined,
            iconPath: new vscode.ThemeIcon('file-code', new vscode.ThemeColor('charts.orange')),
            itemType: 'application-manifest',
            itemId: `manifest-${application.id}`,
            clusterEndpoint: this.clusterHttpEndpoint,
            applicationId: application.id
        });
        manifestItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
        applicationItems.push(manifestItem);
        
        // Then add services
        // Only include services that belong to this application
        SfUtility.outputLog(`    Filtering ${this.services.length} services for app ${application.name} (${application.id})`, null, debugLevel.info);
        this.services.forEach((service: sfModels.ServiceInfo) => {
            // Services have encoded IDs like "MyApp~MyService", applications have IDs like "MyApp"
            // Service Fabric API uses ~ as delimiter for hierarchical names (not /)
            // Check if service ID starts with the application ID + ~
            if (service.id && application.id && service.id.startsWith(application.id + '~')) {
                SfUtility.outputLog(`      🔧 Adding service ${service.name} (${service.id}) with healthState='${service.healthState}'`, null, debugLevel.info);
                const icon = service.healthState ? 
                    this.getIcon(service.healthState, 'symbol-method') : 
                    new vscode.ThemeIcon('symbol-method');
                SfUtility.outputLog(`      🎨 Icon for service ${service.name}: ${service.healthState ? `getIcon('${service.healthState}', 'symbol-method')` : 'default symbol-method'}`, null, debugLevel.info);
                // Match SFX: Display full service name URI (fabric:/App/Service) not encoded ID
                const serviceItem = new TreeItem(service.name ?? 'undefined', {
                    children: undefined,
                    resourceUri: resourceUri,
                    status: service.healthState,
                    iconPath: icon,
                    contextValue: 'service', // Enable context menu for service items
                    itemType: 'service',
                    itemId: service.id, // Keep encoded ID for API calls
                    clusterEndpoint: this.clusterHttpEndpoint,
                    applicationId: application.id,  // Add applicationId for service queries
                    healthState: service.healthState // healthState parameter
                });
                applicationItems.push(serviceItem);
            }
        });
        
        SfUtility.outputLog(`    App ${application.name} has ${applicationItems.length} items (manifest + services)`, null, debugLevel.info);
        const applicationItem = new TreeItem(application.name ?? 'undefined', {
            children: applicationItems,
            resourceUri: resourceUri,
            status: application.healthState,
            iconPath: this.getIcon(application.healthState, 'archive') || new vscode.ThemeIcon('archive'),
            contextValue: 'application', // Enable context menu for application items
            itemType: 'application',
            itemId: application.id,
            clusterEndpoint: this.clusterHttpEndpoint,
            applicationId: undefined, // applicationId (not applicable for apps themselves)
            healthState: application.healthState // healthState parameter
        });
        // Store typeName and typeVersion for unprovision operation
        applicationItem.typeName = application.typeName;
        applicationItem.typeVersion = application.typeVersion;
        applicationTypeItems.push(applicationItem);
    }

    private addSystemTreeItems(resourceUri: vscode.Uri, clusterViewTreeItemChildren: TreeItem[]) {
        const systemItems: TreeItem[] = [];
        let worstHealthState: sfModels.HealthState | undefined;
        
        this.systemServices.forEach((service: sfModels.ServiceInfo) => {
            const icon = service.healthState ? 
                this.getIcon(service.healthState, 'gear') : 
                new vscode.ThemeIcon('gear');
            
            // Track worst health state for parent
            if (service.healthState) {
                if (!worstHealthState || this.compareHealthStates(service.healthState, worstHealthState) < 0) {
                    worstHealthState = service.healthState;
                }
            }
            
            // Match SFX: Display full service name URI (fabric:/System/...) not encoded ID
            const serviceItem = new TreeItem(service.name ?? 'undefined', {
                children: undefined,
                resourceUri: resourceUri,
                status: service.healthState,
                iconPath: icon,
                contextValue: 'service', // Enable context menu for service items
                itemType: 'service',
                itemId: service.id, // Keep encoded ID for API calls
                clusterEndpoint: this.clusterHttpEndpoint,
                applicationId: 'fabric:/System',  // System services belong to fabric:/System application
                healthState: service.healthState // healthState parameter
            });
            systemItems.push(serviceItem);
        });
        
        // Create system root with aggregated health
        const systemIcon = worstHealthState ? 
            this.getIcon(worstHealthState, 'settings-gear') : 
            new vscode.ThemeIcon('settings-gear');
        
        const systemLabel = worstHealthState ? 
            `system (${systemItems.length}) - ${worstHealthState}` : 
            `system (${systemItems.length})`;
        
        clusterViewTreeItemChildren.push(new TreeItem(systemLabel, {
            children: systemItems,
            resourceUri: resourceUri,
            status: worstHealthState,
            iconPath: systemIcon,
            itemType: 'system-group',
            healthState: worstHealthState
        }));
    }

    public createClusterViewTreeItem(): TreeItem {
        try {
            SfUtility.outputLog('Starting createClusterViewTreeItem...', null, debugLevel.info);
            const resourceUri: vscode.Uri = vscode.Uri.parse(this.clusterHttpEndpoint!);
            this.sfClusterFolder.createClusterFolder(this.clusterName!);
            const clusterViewTreeItemChildren: TreeItem[] = [];

            SfUtility.outputLog(`Creating cluster tree items (health, events, etc.)...`, null, debugLevel.info);
            this.addClusterTreeItems(resourceUri, clusterViewTreeItemChildren);
            
            // Add root groups with placeholders - they'll lazy load when expanded
            SfUtility.outputLog(`Adding root groups with lazy loading...`, null, debugLevel.info);
            this.addApplicationsGroupPlaceholder(resourceUri, clusterViewTreeItemChildren);
            this.addNodesGroupPlaceholder(resourceUri, clusterViewTreeItemChildren);
            this.addSystemGroupPlaceholder(resourceUri, clusterViewTreeItemChildren);

            // add cluster view tree item to root view
            SfUtility.outputLog(`Creating root cluster tree item with ${clusterViewTreeItemChildren.length} children...`, null, debugLevel.info);
            const clusterViewTreeItem: TreeItem = new TreeItem(this.clusterName ?? 'undefined', {
                children: clusterViewTreeItemChildren,
                resourceUri: resourceUri,
                status: this.clusterHealth?.aggregatedHealthState,
                iconPath: this.getIcon(this.clusterHealth?.aggregatedHealthState) || new vscode.ThemeIcon('cloud'),
                contextValue: 'cluster', // Enable context menu for cluster items
                itemType: 'cluster',
                itemId: this.clusterHttpEndpoint,
                clusterEndpoint: this.clusterHttpEndpoint
            });

            SfUtility.outputLog('clusterViewTreeItem created successfully', null, debugLevel.info);
            return clusterViewTreeItem;
        } catch (error) {
            SfUtility.outputLog('ERROR in createClusterViewTreeItem', error, debugLevel.error);
            throw error;
        }
    }


    public getClusterEndpoint(): string {
        return this.clusterHttpEndpoint!;
    }
    
    public getNodes(): any[] {
        return this.nodes;
    }
    
    public getApplications(): any[] {
        return this.applications;
    }
    
    public getSystemServices(): any[] {
        return this.systemServices;
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
        return this.clusterCertificateThumbprint || this.clusterCertificate?.thumbprint;
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

    public async getClusterCertificateFromServer(clusterHttpEndpoint = this.clusterHttpEndpoint!): Promise<void> {
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

    // Get icon based on health/status state with optional custom icon name
    public getIcon(status?: string, iconName?: string): vscode.ThemeIcon | undefined {
        if (!status) {
            return undefined;
        }
        SfUtility.outputLog(`🎨 getIcon: status='${status}', icon='${iconName || 'default'}' (type: ${typeof status})`, null, debugLevel.debug);
        const statusLower = status.toLowerCase();
        SfUtility.outputLog(`🎨 getIcon: statusLower='${statusLower}'`, null, debugLevel.debug);
        
        // Determine color based on health state
        let color: vscode.ThemeColor | undefined;
        let fallbackIcon = 'circle-filled';
        
        switch (statusLower) {
            case 'ok':
            case 'ready':
            case 'active':
            case 'available':
                color = new vscode.ThemeColor('testing.iconPassed');
                fallbackIcon = 'pass';
                SfUtility.outputLog('✅ getIcon: returning GREEN icon', null, debugLevel.info);
                break;
            case 'warning':
            case 'upgrading':
            case 'provisioning':
            case 'unprovisioning':
                color = new vscode.ThemeColor('testing.iconQueued');
                fallbackIcon = 'warning';
                SfUtility.outputLog('⚠️ getIcon: returning YELLOW icon', null, debugLevel.info);
                break;
            case 'error':
            case 'failed':
            case 'down':
                color = new vscode.ThemeColor('testing.iconFailed');
                fallbackIcon = 'error';
                SfUtility.outputLog('❌ getIcon: returning RED icon', null, debugLevel.info);
                break;
            case 'unknown':
            case 'invalid':
                // Unknown = gray, no color
                SfUtility.outputLog('❔ getIcon: returning GRAY icon', null, debugLevel.info);
                return new vscode.ThemeIcon(iconName || 'circle-outline');
            default:
                SfUtility.outputLog(`❓ getIcon: unknown status '${status}', returning undefined`, null, debugLevel.warn);
                return undefined;
        }
        
        // Use custom icon name if provided, otherwise use fallback
        const icon = iconName || fallbackIcon;
        return new vscode.ThemeIcon(icon, color);
    }

    /**
     * Compare health states to determine which is worse
     * @returns < 0 if state1 is worse than state2, > 0 if state2 is worse, 0 if equal
     */
    public compareHealthStates(state1: sfModels.HealthState, state2: sfModels.HealthState): number {
        const healthOrder: { [key: string]: number } = {
            'Error': 0,
            'Warning': 1,
            'Ok': 2,
            'Unknown': 3,
            'Invalid': 4
        };
        
        const order1 = healthOrder[state1] ?? 4;
        const order2 = healthOrder[state2] ?? 4;
        
        return order1 - order2; // Lower number = worse health
    }

    /**
     * Calculate the worst (most severe) health state from a collection of items
     * @param items Array of items with healthState property
     * @returns The worst health state found, or undefined if no health states present
     */
    private getWorstHealthState<T extends { healthState?: sfModels.HealthState }>(items: T[]): sfModels.HealthState | undefined {
        let worstHealth: sfModels.HealthState | undefined = undefined;
        items.forEach(item => {
            if (item.healthState) {
                if (!worstHealth || this.compareHealthStates(item.healthState, worstHealth) < 0) {
                    worstHealth = item.healthState;
                }
            }
        });
        return worstHealth;
    }

    public getManifest(): string {
        return this.xmlManifest;
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
            this.replicaHealthMap.clear();
            this.repairTasks = [];
            this.cachedIsNativeImageStore = null; // Clear image store cache on refresh
            // Don't clear expandedPartitions - keep tracking which ones user has opened
            
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
     * Get the worst status from repair tasks to determine icon color
     * @returns Health state representing repair task status
     */
    private getRepairTasksStatus(): string {
        if (this.repairTasks.length === 0) {
            return 'Ok'; // No tasks = healthy
        }

        // Check for failed/error states
        const hasFailed = this.repairTasks.some((task: any) => 
            task.state?.toLowerCase() === 'failed' ||
            task.state?.toLowerCase() === 'cancelled' ||
            task.resultStatus?.toLowerCase() === 'failed'
        );
        
        if (hasFailed) {
            return 'Error';
        }

        // Check for active/in-progress tasks
        const hasActive = this.repairTasks.some((task: any) =>
            task.state?.toLowerCase() === 'executing' ||
            task.state?.toLowerCase() === 'preparing' ||
            task.state?.toLowerCase() === 'approved' ||
            task.state?.toLowerCase() === 'claimed'
        );
        
        if (hasActive) {
            return 'Warning'; // Active repairs = needs attention
        }

        // All completed successfully
        return 'Ok';
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

    public async populateSystemServices(applicationId: string): Promise<void> {
        return await this.sfRest.getSystemServices(applicationId).then(async (services: sfModels.ServiceInfoUnion[]) => {
            // Try to get health states for system services
            try {
                SfUtility.outputLog(`🏥 Querying system health for '${applicationId}'...`, null, debugLevel.info);
                const appHealth = await this.sfRest.getApplicationHealth(applicationId);
                if (appHealth.serviceHealthStates) {
                    SfUtility.outputLog(`📊 System health has ${appHealth.serviceHealthStates.length} service health states`, null, debugLevel.info);
                    for (const svcHealth of appHealth.serviceHealthStates) {
                        if (svcHealth.serviceName && svcHealth.aggregatedHealthState) {
                            SfUtility.outputLog(`  ⚙️ System service '${svcHealth.serviceName}' → health='${svcHealth.aggregatedHealthState}'`, null, debugLevel.info);
                            // Store by both name and ID
                            this.serviceHealthMap.set(svcHealth.serviceName, svcHealth.aggregatedHealthState);
                            const svcId = svcHealth.serviceName.replace('fabric:/', '').replace(/\//g, '~');
                            this.serviceHealthMap.set(svcId, svcHealth.aggregatedHealthState);
                        }
                    }
                    SfUtility.outputLog(`✅ Got health for ${appHealth.serviceHealthStates.length} system services`, null, debugLevel.info);
                } else {
                    SfUtility.outputLog(`⚠️ System health has NO serviceHealthStates`, null, debugLevel.warn);
                }
            } catch (healthError) {
                SfUtility.outputLog(`❌ Could not fetch system service health states`, healthError, debugLevel.error);
                // Continue anyway
            }
            
            // ✅ MERGE HEALTH STATES - This MUST be outside the health try-catch!
            SfUtility.outputLog(`🔀 Merging health states for ${services.length} system services...`, null, debugLevel.info);
            services.forEach((service: sfModels.ServiceInfo) => {
                SfUtility.outputLog(`  ⚙️ Processing system service: name='${service.name}', id='${service.id}', current healthState='${service.healthState}'`, null, debugLevel.info);
                // Merge health state if available
                if (!service.healthState && service.name) {
                    const healthState = this.serviceHealthMap.get(service.name) || this.serviceHealthMap.get(service.id || '');
                    if (healthState) {
                        service.healthState = healthState;
                        SfUtility.outputLog(`  ✅ Merged health state '${healthState}' for system service ${service.name}`, null, debugLevel.info);
                    } else {
                        SfUtility.outputLog(`  ⚠️ NO health state found in map for system service ${service.name}`, null, debugLevel.warn);
                    }
                } else if (service.healthState) {
                    SfUtility.outputLog(`  ℹ️ System service ${service.name} already has healthState='${service.healthState}'`, null, debugLevel.info);
                } else {
                    SfUtility.outputLog(`  ⚠️ System service ${service.name} has NO name to lookup health`, null, debugLevel.warn);
                }
                this.systemServices.push(service);
            });
            SfUtility.outputLog(`✅ Populated ${services.length} system services`, null, debugLevel.info);
        });
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

    public setClusterCertificateInfo(clusterCertificate: clusterCertificate): void {
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

    // Health map accessors for partition and replica health
    public getPartitionHealth(partitionId: string): string | undefined {
        return this.partitionHealthMap.get(partitionId);
    }

    public getReplicaHealth(replicaId: string): string | undefined {
        return this.replicaHealthMap.get(replicaId);
    }

    public async trackExpandedPartition(partitionId: string, serviceId: string, applicationId: string): Promise<void> {
        if (this.expandedPartitions.has(partitionId)) {
            SfUtility.outputLog(`Partition ${partitionId} already tracked`, null, debugLevel.debug);
            return;
        }
        
        this.expandedPartitions.add(partitionId);
        SfUtility.outputLog(`📍 Tracking expanded partition: ${partitionId}`, null, debugLevel.info);
        
        // Query partition health to get replica health states
        try {
            const partHealth = await this.sfRest.getPartitionHealth(partitionId, serviceId, applicationId);
            if (partHealth.replicaHealthStates) {
                SfUtility.outputLog(`  📊 Partition health has ${partHealth.replicaHealthStates.length} replica health states`, null, debugLevel.info);
                for (const repHealth of partHealth.replicaHealthStates) {
                    const replicaId = (repHealth as any).replicaId || (repHealth as any).instanceId;
                    if (replicaId && repHealth.aggregatedHealthState) {
                        this.replicaHealthMap.set(replicaId, repHealth.aggregatedHealthState);
                        SfUtility.outputLog(`    🔄 Replica '${replicaId}' → health='${repHealth.aggregatedHealthState}'`, null, debugLevel.debug);
                    }
                }
            }
        } catch (healthError) {
            SfUtility.outputLog(`⚠️ Could not fetch replica health for partition ${partitionId}`, healthError, debugLevel.warn);
        }
    }
}