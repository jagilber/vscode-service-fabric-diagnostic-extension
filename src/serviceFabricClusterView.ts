import * as vscode from 'vscode';
import { SfConfiguration } from './sfConfiguration';
import { SfUtility, debugLevel } from './sfUtility';
import { sfExtSettingsList, SfExtSettings } from './sfExtSettings';
import * as sfModels from './sdk/servicefabric/servicefabric/src/models';
import { Url } from 'url';
import { SfRest } from './sfRest';
import { ClusterConfigMap, DeployedApplicationInfo, HealthEnrichmentResult } from './types';
import { AzureCliCommandGenerator } from './services/AzureCliCommandGenerator';


export class serviceFabricClusterView implements vscode.TreeDataProvider<TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined> = new vscode.EventEmitter<TreeItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined> = this._onDidChangeTreeData.event;

    private view: vscode.TreeView<TreeItem>;
    private tree: Array<TreeItem> = [];
    private sfRestInstance: SfRest | undefined;  // Store SfRest instance for lazy loading
    private autoRefreshTimer: NodeJS.Timeout | undefined;
    private refreshCallback: (() => Promise<void>) | undefined;
    private clusterConfigMap: ClusterConfigMap = new Map();  // Map cluster endpoint to SfConfiguration
    private refreshDebouncer: NodeJS.Timeout | undefined;  // Debounce timer for batching rapid refresh calls

    constructor(context: vscode.ExtensionContext) {
        // Initialize view visibility context (hide until clusters are added)
        this.updateViewVisibility();
        
        this.view = vscode.window.createTreeView('serviceFabricClusterView', { treeDataProvider: this, showCollapseAll: true });
        //context.subscriptions.push(this.view);
        vscode.commands.registerCommand('serviceFabricClusterView.reveal', async () => {
            const key = await vscode.window.showInputBox({ placeHolder: 'Type the label of the item to reveal' });
            if (key) {
                await this.view.reveal(this.getTreeItem(new TreeItem(key)), { focus: true, select: false, expand: true });
                //await this.view.reveal({ key }, { focus: true, select: false, expand: true });
            }
        });
        vscode.commands.registerCommand('serviceFabricClusterView.changeTitle', async () => {
            const title = await vscode.window.showInputBox({ prompt: 'Type the new title for the Test View', placeHolder: this.view.title });
            if (title) {
                this.view.title = title;
            }
        });
    }

    public addTreeItem(treeItem: TreeItem, sfConfig?: SfConfiguration): void {
        const existingItem = this.findTreeItem(treeItem);
        if (existingItem) {
            SfUtility.outputLog(`serviceFabricClusterView:addTreeItem:treeItem:${treeItem.label} already exists. Skipping duplicate.`, null, debugLevel.warn);
            vscode.window.showWarningMessage(`Cluster '${treeItem.label}' is already in the tree view.`);
            return; // Don't add duplicate
        }

        SfUtility.outputLog(`serviceFabricClusterView:addTreeItem:treeItem:${treeItem.label}`);
        this.tree.push(treeItem);
        
        // Store the SfConfiguration for this cluster using endpoint as key
        if (sfConfig) {
            const endpoint = sfConfig.getClusterEndpoint();
            this.clusterConfigMap.set(endpoint, sfConfig);
            SfUtility.outputLog(`Stored cluster config with key: ${endpoint}`, null, debugLevel.debug);
        }
        
        this.updateViewVisibility();
        this.refresh();
        
        // Start auto-refresh if enabled and we have clusters
        if (this.tree.length > 0 && this.refreshCallback) {
            this.startAutoRefresh();
        }
        
        SfUtility.outputLog(`serviceFabricClusterView:addTreeItem:treeItem:${treeItem.label} added`);
    }

    /**
     * Remove a cluster from the tree view by endpoint/label
     */
    public removeClusterFromTree(clusterEndpoint: string): void {
        const treeItem = this.tree.find((item: TreeItem) => item.label === clusterEndpoint);
        if (treeItem) {
            this.removeTreeItem(treeItem);
        } else {
            SfUtility.outputLog(`Cannot remove cluster: not found in tree: ${clusterEndpoint}`, null, debugLevel.warn);
        }
    }

    /**
     * Set a cluster as active (updates visual indicator)
     */
    public setActiveCluster(clusterEndpoint: string): void {
        // Clear active indicator from all clusters
        for (const item of this.tree) {
            if (item.description === '⭐ Active') {
                item.description = undefined;
            }
        }
        
        // Set active indicator on the selected cluster
        const activeItem = this.tree.find((item: TreeItem) => item.label === clusterEndpoint);
        if (activeItem) {
            activeItem.description = '⭐ Active';
            SfUtility.outputLog(`Set active cluster indicator: ${clusterEndpoint}`, null, debugLevel.info);
        }
        
        this.refresh();
    }

    /**
     * Update an existing tree item with fresh data after refresh
     */
    public updateTreeItem(clusterName: string, newTreeItem: TreeItem): void {
        const index = this.tree.findIndex((item: TreeItem) => item.label === clusterName);
        if (index !== -1) {
            SfUtility.outputLog(`Updating tree item for cluster: ${clusterName}`, null, debugLevel.info);
            this.tree[index] = newTreeItem;
            this.refresh();
        } else {
            SfUtility.outputLog(`Cannot update tree item: cluster '${clusterName}' not found`, null, debugLevel.warn);
        }
    }

    private removeTreeItem(treeItem: TreeItem) {
        if (this.findTreeItem(treeItem)) {
            SfUtility.outputLog(`serviceFabricClusterView:removeTreeItem:treeItem:${treeItem.label} exists. removing`);
            this.tree.splice(this.tree.findIndex((item: TreeItem) => item.label === treeItem.label), 1);
            
            // Remove from config map - find by endpoint
            for (const [key, config] of this.clusterConfigMap.entries()) {
                if (config.getClusterEndpoint?.() && this.tree.some(item => item.label === treeItem.label)) {
                    continue; // Skip if still in tree
                }
                // Remove any configs whose endpoint matches the removed cluster
                const endpoint = config.getClusterEndpoint?.();
                if (endpoint) {
                    this.clusterConfigMap.delete(endpoint);
                }
            }
            
            this.updateViewVisibility();
            this.refresh();
            
            // Stop auto-refresh if no clusters remain
            if (this.tree.length === 0) {
                this.stopAutoRefresh();
            }
        }
        else {
            SfUtility.outputLog(`serviceFabricClusterView:removeTreeItem:treeItem:${treeItem.label} does not exist`, null, debugLevel.warn);
        }
    }

    private updateViewVisibility() {
        // Update context to control view visibility
        vscode.commands.executeCommand('setContext', 'serviceFabricClustersExist', this.tree.length > 0);
    }

    private findTreeItem(treeItem: TreeItem): TreeItem | undefined | null {
        const results = this.tree.find((item: TreeItem) => item.label === treeItem.label);
        SfUtility.outputLog(`serviceFabricClusterView:findTreeItem:treeItem:${treeItem.label} results:${results}`);
        return results;
    }

    public getChildren(element?: TreeItem): vscode.ProviderResult<TreeItem[]> {
        if (element === undefined) {
            SfUtility.outputLog('🌲 getChildren: returning root tree', null, debugLevel.info);
            return this.tree;
        }
        
        SfUtility.outputLog(`🌲 getChildren called: label="${element.label}", itemType="${element.itemType}", children=${element.children === undefined ? 'undefined' : Array.isArray(element.children) ? `array[${element.children.length}]` : 'other'}`, null, debugLevel.info);
        
        // Handle lazy loading for nodes (deployed applications)
        if (element.itemType === 'node' && element.children === undefined) {
            SfUtility.outputLog(`🌲 -> Triggering loadNodeChildren for: ${element.label}`, null, debugLevel.info);
            return this.loadNodeChildren(element);
        }
        
        // Handle lazy loading for deployed applications (service packages)
        if (element.itemType === 'deployed-application' && element.children === undefined) {
            return this.loadDeployedApplicationChildren(element);
        }
        
        // Handle lazy loading for service packages (code packages + replicas groups)
        if (element.itemType === 'deployed-service-package' && element.children === undefined) {
            return this.loadDeployedServicePackageChildren(element);
        }
        
        // Handle lazy loading for code packages group
        if (element.itemType === 'deployed-code-packages-group' && element.children === undefined) {
            return this.loadDeployedCodePackagesGroup(element);
        }
        
        // Handle lazy loading for replicas group
        if (element.itemType === 'deployed-replicas-group' && element.children === undefined) {
            return this.loadDeployedReplicasGroup(element);
        }
        
        // Handle lazy loading for services
        if (element.itemType === 'service' && element.children === undefined) {
            return this.loadServiceChildren(element);
        }
        
        // Handle lazy loading for partitions-group
        if (element.itemType === 'partitions-group' && element.children === undefined) {
            return this.loadPartitionsForGroup(element);
        }
        
        // Handle lazy loading for partitions
        if (element.itemType === 'partition' && element.children === undefined) {
            return this.loadPartitionChildren(element);
        }
        
        // Handle lazy loading for replicas-group
        if (element.itemType === 'replicas-group' && element.children === undefined) {
            return this.loadReplicasForGroup(element);
        }
        
        // Handle lazy loading for replicas
        if (element.itemType === 'replica' && element.children === undefined) {
            return this.loadReplicaChildren(element);
        }
        
        // Handle lazy loading for image store root
        if (element.itemType === 'image-store' && element.children === undefined) {
            return this.loadImageStoreChildren(element);
        }
        
        // Handle lazy loading for image store folders
        if (element.itemType === 'image-store-folder' && element.children === undefined) {
            return this.loadImageStoreChildren(element);
        }
        
        // Handle lazy loading for metrics
        if (element.itemType === 'metrics' && element.children === undefined) {
            return this.loadMetricsChildren(element);
        }
        
        // Handle lazy loading for commands - ALWAYS reload to get latest structure
        if (element.itemType === 'commands') {
            SfUtility.outputLog(`🔄 Loading commands children (children=${element.children ? 'SET' : 'UNDEFINED'})`, null, debugLevel.info);
            return this.loadCommandsChildren(element);
        }
        
        return element.children;
    }
    
    private async loadNodeChildren(nodeItem: TreeItem): Promise<TreeItem[]> {
        SfUtility.outputLog(`🔵 loadNodeChildren CALLED for: ${nodeItem.label}`, null, debugLevel.info);
        SfUtility.outputLog(`  itemType: ${nodeItem.itemType}`, null, debugLevel.info);
        SfUtility.outputLog(`  itemId: ${nodeItem.itemId}`, null, debugLevel.info);
        SfUtility.outputLog(`  sfRestInstance: ${this.sfRestInstance ? 'SET' : 'NULL'}`, null, debugLevel.info);
        
        if (!this.sfRestInstance || !nodeItem.itemId) {
            SfUtility.outputLog('❌ Cannot load node children: missing sfRest or node name. Reconnect to cluster.', null, debugLevel.warn);
            return [];  // Return empty array - tree will remain collapsed/empty
        }
        
        try {
            const nodeName = nodeItem.itemId;
            SfUtility.outputLog(`Loading deployed applications for node: ${nodeName}`, null, debugLevel.info);
            
            // Get deployed applications for this node from the REST API
            const deployedApps = await this.sfRestInstance.getDeployedApplications(nodeName);
            
            if (!deployedApps || deployedApps.length === 0) {
                SfUtility.outputLog(`No deployed applications found on node ${nodeName}`, null, debugLevel.info);
                return [];  // Return empty array - tree will show as expanded but empty
            }
            
            const children: TreeItem[] = [];
            
            // Get configuration for icon lookup
            const config = nodeItem.clusterEndpoint ? this.clusterConfigMap.get(nodeItem.clusterEndpoint) : undefined;
            
            // Build health map from application health API - PARALLELIZED for 5x speed boost
            const healthMap = new Map<string, string>();
            
            // Create array of health query promises
            const healthPromises = deployedApps.map(async (deployedApp: DeployedApplicationInfo): Promise<HealthEnrichmentResult | null> => {
                const appName = deployedApp.name || deployedApp.id;
                if (!appName) {
                    return null;
                }
                try {
                    if (!this.sfRestInstance) {
                        return null;
                    }
                    const appHealth = await this.sfRestInstance.getApplicationHealth(appName);
                    if (appHealth.deployedApplicationHealthStates) {
                        for (const deployedHealthState of appHealth.deployedApplicationHealthStates) {
                            if (deployedHealthState.nodeName === nodeName && deployedHealthState.aggregatedHealthState) {
                                return { appName, healthState: deployedHealthState.aggregatedHealthState as string };
                            }
                        }
                    }
                } catch (error) {
                    SfUtility.outputLog(`Could not get health for app ${appName}`, error, debugLevel.warn);
                }
                return null;
            });
            
            // Execute all health queries in parallel
            const healthResults = await Promise.allSettled(healthPromises);
            
            // Build health map from results
            for (const result of healthResults) {
                if (result.status === 'fulfilled' && result.value) {
                    healthMap.set(result.value.appName, result.value.healthState);
                }
            }
            
            // Now create tree items with health-colored icons
            for (const deployedApp of deployedApps) {
                const appName = deployedApp.name || deployedApp.id || 'Unknown';
                const appId = deployedApp.id || deployedApp.name;
                const healthState = healthMap.get(appId) || undefined;
                const icon = healthState ? (config?.getIcon(healthState, 'symbol-package') || new vscode.ThemeIcon('symbol-package')) : new vscode.ThemeIcon('symbol-package');
                
                // CRITICAL: Always set contextValue (node name) - required for expanding children
                const deployedAppItem = new TreeItem(appName, {
                    children: undefined,  // Lazy-load service packages
                    resourceUri: nodeItem.resourceUri,
                    status: deployedApp.status,
                    iconPath: icon,
                    itemType: 'deployed-application',
                    itemId: appId,
                    clusterEndpoint: nodeItem.clusterEndpoint,
                    applicationId: appId,
                    healthState: healthState
                });
                // Store node name for API calls (used in loadDeployedApplicationChildren)
                deployedAppItem.contextValue = nodeName;
                deployedAppItem.tooltip = `${appName}\nHealth: ${healthState || 'Query for details'}\nStatus: ${deployedApp.status || 'Active'}\nType: ${deployedApp.typeName || 'N/A'}`;
                children.push(deployedAppItem);
            }
            
            SfUtility.outputLog(`Loaded ${children.length} deployed applications for node ${nodeName}`, null, debugLevel.info);
            return children;
        } catch (error) {
            SfUtility.outputLog(`Failed to load children for node ${nodeItem.label}`, error, debugLevel.error);
            return [];
        }
    }
    
    private async loadDeployedApplicationChildren(deployedAppItem: TreeItem): Promise<TreeItem[]> {
        SfUtility.outputLog(`loadDeployedApplicationChildren called for: ${deployedAppItem.label}`, null, debugLevel.info);
        SfUtility.outputLog(`  itemType: ${deployedAppItem.itemType}`, null, debugLevel.info);
        SfUtility.outputLog(`  itemId: ${deployedAppItem.itemId}`, null, debugLevel.info);
        SfUtility.outputLog(`  contextValue: ${deployedAppItem.contextValue}`, null, debugLevel.info);
        SfUtility.outputLog(`  sfRestInstance: ${this.sfRestInstance ? 'SET' : 'NULL'}`, null, debugLevel.info);
        
        if (!this.sfRestInstance || !deployedAppItem.itemId || !deployedAppItem.contextValue) {
            SfUtility.outputLog('❌ Cannot load deployed app children: missing required info', null, debugLevel.error);
            return [];
        }
        
        try {
            const nodeName = deployedAppItem.contextValue; // Stored node name
            const appId = deployedAppItem.itemId;
            SfUtility.outputLog(`Loading service packages for app ${appId} on node ${nodeName}`, null, debugLevel.info);
            
            const servicePackages = await this.sfRestInstance.getDeployedServicePackages(nodeName, appId);
            
            if (!servicePackages || servicePackages.length === 0) {
                SfUtility.outputLog(`No service packages found`, null, debugLevel.info);
                return [];
            }
            
            const children: TreeItem[] = [];
            const config = deployedAppItem.clusterEndpoint ? this.clusterConfigMap.get(deployedAppItem.clusterEndpoint) : undefined;
            
            for (const pkg of servicePackages) {
                const manifestName = pkg.serviceManifestName || pkg.name || 'Unknown';
                const healthState = pkg.healthState || undefined;
                const icon = healthState ? (config?.getIcon(healthState, 'package') || new vscode.ThemeIcon('package')) : new vscode.ThemeIcon('package');
                
                const servicePackageItem = new TreeItem(manifestName, {
                    children: undefined,  // Lazy-load groups
                    resourceUri: deployedAppItem.resourceUri,
                    status: pkg.servicePackageStatus || 'Active',
                    iconPath: icon,
                    itemType: 'deployed-service-package',
                    itemId: manifestName,
                    clusterEndpoint: deployedAppItem.clusterEndpoint,
                    applicationId: appId,
                    healthState: healthState
                });
                // Store full context: node|appId|serviceManifestName
                servicePackageItem.contextValue = `${nodeName}|${appId}|${manifestName}`;
                servicePackageItem.tooltip = `${manifestName}\nStatus: ${pkg.servicePackageStatus || 'Active'}\nHealth: ${healthState || 'Query for details'}`;
                children.push(servicePackageItem);
            }
            
            SfUtility.outputLog(`Loaded ${children.length} service packages`, null, debugLevel.info);
            return children;
        } catch (error) {
            SfUtility.outputLog(`Failed to load service packages`, error, debugLevel.error);
            return [];
        }
    }
    
    private async loadDeployedServicePackageChildren(servicePackageItem: TreeItem): Promise<TreeItem[]> {
        if (!servicePackageItem.contextValue || !servicePackageItem.itemId) {
            return [];
        }
        
        try {
            const parts = servicePackageItem.contextValue.split('|');
            const nodeName = parts[0];
            const appId = parts[1];
            const serviceManifestName = parts[2] || servicePackageItem.itemId;
            
            SfUtility.outputLog(`Loading groups for service package ${serviceManifestName}`, null, debugLevel.info);
            
            const children: TreeItem[] = [];
            
            // Code Packages group
            const codePackagesGroup = new TreeItem('Code Packages', {
                children: undefined,  // Lazy-load
                resourceUri: servicePackageItem.resourceUri,
                iconPath: new vscode.ThemeIcon('folder'),
                itemType: 'deployed-code-packages-group',
                itemId: 'code-packages',
                clusterEndpoint: servicePackageItem.clusterEndpoint
            });
            codePackagesGroup.contextValue = `${nodeName}|${appId}|${serviceManifestName}`;
            children.push(codePackagesGroup);
            
            // Replicas group
            const replicasGroup = new TreeItem('Replicas', {
                children: undefined,  // Lazy-load
                resourceUri: servicePackageItem.resourceUri,
                iconPath: new vscode.ThemeIcon('folder'),
                itemType: 'deployed-replicas-group',
                itemId: 'replicas',
                clusterEndpoint: servicePackageItem.clusterEndpoint
            });
            replicasGroup.contextValue = `${nodeName}|${appId}|${serviceManifestName}`;
            children.push(replicasGroup);
            
            return children;
        } catch (error) {
            SfUtility.outputLog(`Failed to load service package children`, error, debugLevel.error);
            return [];
        }
    }
    
    private async loadDeployedCodePackagesGroup(groupItem: TreeItem): Promise<TreeItem[]> {
        if (!this.sfRestInstance || !groupItem.contextValue) {
            return [];
        }
        
        try {
            const [nodeName, appId, serviceManifestName] = groupItem.contextValue.split('|');
            SfUtility.outputLog(`Loading code packages for ${serviceManifestName}`, null, debugLevel.info);
            
            const codePackages = await this.sfRestInstance.getDeployedCodePackages(nodeName, appId, serviceManifestName);
            
            if (!codePackages || codePackages.length === 0) {
                return [];
            }
            
            const children: TreeItem[] = [];
            
            for (const pkg of codePackages) {
                const packageName = pkg.codePackageName || pkg.name || 'Code';
                const status = pkg.status || 'Unknown';
                // Use different icons based on status
                let icon: vscode.ThemeIcon;
                if (status.toLowerCase() === 'active' || status.toLowerCase() === 'running') {
                    icon = new vscode.ThemeIcon('debug-start', new vscode.ThemeColor('testing.iconPassed'));
                } else if (status.toLowerCase().includes('down') || status.toLowerCase().includes('stopped')) {
                    icon = new vscode.ThemeIcon('debug-stop', new vscode.ThemeColor('testing.iconFailed'));
                } else {
                    icon = new vscode.ThemeIcon('code');
                }
                
                const codePackageItem = new TreeItem(packageName, {
                    children: [],
                    resourceUri: groupItem.resourceUri,
                    iconPath: icon,
                    itemType: 'deployed-code-package',
                    itemId: packageName,
                    clusterEndpoint: groupItem.clusterEndpoint
                });
                codePackageItem.contextValue = `${nodeName}|${appId}|${serviceManifestName}|${packageName}`;
                codePackageItem.tooltip = `${packageName}\nStatus: ${status}\nVersion: ${pkg.codePackageVersion || 'N/A'}`;
                children.push(codePackageItem);
            }
            
            SfUtility.outputLog(`Loaded ${children.length} code packages`, null, debugLevel.info);
            return children;
        } catch (error) {
            SfUtility.outputLog(`Failed to load code packages`, error, debugLevel.error);
            return [];
        }
    }
    
    private async loadDeployedReplicasGroup(groupItem: TreeItem): Promise<TreeItem[]> {
        if (!this.sfRestInstance || !groupItem.contextValue) {
            return [];
        }
        
        try {
            const [nodeName, appId, serviceManifestName] = groupItem.contextValue.split('|');
            SfUtility.outputLog(`Loading replicas for ${serviceManifestName}`, null, debugLevel.info);
            
            const replicas = await this.sfRestInstance.getDeployedReplicas(nodeName, appId, serviceManifestName);
            
            if (!replicas || replicas.length === 0) {
                return [];
            }
            
            const children: TreeItem[] = [];
            const config = groupItem.clusterEndpoint ? this.clusterConfigMap.get(groupItem.clusterEndpoint) : undefined;
            
            for (const replica of replicas) {
                const replicaId = replica.replicaId || replica.instanceId || 'Unknown';
                const healthState = replica.healthState || 'Unknown';
                const replicaStatus = replica.replicaStatus || 'Unknown';
                const serviceKind = replica.serviceKind || 'Unknown';
                const role = replica.replicaRole || replica.instanceRole || 'Unknown';
                
                // Build display name with role for stateful services
                let displayName: string;
                if (serviceKind === 'Stateless') {
                    displayName = `${replicaId}`;
                } else if (role === 'Primary') {
                    displayName = `${replicaId} (Primary)`;
                } else if (role === 'ActiveSecondary') {
                    displayName = `${replicaId} (Secondary)`;
                } else {
                    displayName = `${replicaId} (${role})`;
                }
                
                // Determine health state considering both healthState and replicaStatus
                let effectiveHealthState = healthState;
                if (healthState === 'Unknown' && (replicaStatus === 'Down' || replicaStatus === 'Dropped')) {
                    effectiveHealthState = 'Error';
                }
                
                const icon = config?.getIcon(effectiveHealthState, 'circle-filled') || new vscode.ThemeIcon('circle-filled');
                
                const replicaItem = new TreeItem(displayName, {
                    children: [],
                    resourceUri: groupItem.resourceUri,
                    status: effectiveHealthState,
                    iconPath: icon,
                    itemType: 'deployed-replica',
                    itemId: replicaId,
                    clusterEndpoint: groupItem.clusterEndpoint,
                    partitionId: replica.partitionId,
                    replicaId: replicaId,
                    healthState: effectiveHealthState
                });
                replicaItem.contextValue = `${nodeName}|${appId}|${serviceManifestName}|${replicaId}`;
                replicaItem.tooltip = `${displayName}\nHealth: ${effectiveHealthState}\nStatus: ${replicaStatus}\nPartition: ${replica.partitionId || 'N/A'}`;
                children.push(replicaItem);
            }
            
            SfUtility.outputLog(`Loaded ${children.length} replicas`, null, debugLevel.info);
            return children;
        } catch (error) {
            SfUtility.outputLog(`Failed to load replicas`, error, debugLevel.error);
            return [];
        }
    }
    
    private async loadServiceChildren(serviceItem: TreeItem): Promise<TreeItem[]> {
        if (!this.sfRestInstance || !serviceItem.itemId || !serviceItem.applicationId) {
            SfUtility.outputLog('Cannot load service children: missing sfRest or service info', null, debugLevel.warn);
            return [];
        }
        
        try {
            SfUtility.outputLog(`Loading children for service: ${serviceItem.label}`, null, debugLevel.info);
            const children: TreeItem[] = [];
            
            // Add Partitions group node
            const partitionsGroupItem = new TreeItem('Partitions', {
                children: undefined,  // Will be lazy loaded
                resourceUri: serviceItem.resourceUri,
                status: undefined,
                iconPath: new vscode.ThemeIcon('folder'),
                itemType: 'partitions-group',
                itemId: 'partitions-group',
                clusterEndpoint: serviceItem.clusterEndpoint,
                applicationId: serviceItem.applicationId
            });
            partitionsGroupItem.serviceId = serviceItem.itemId;
            children.push(partitionsGroupItem);
            
            // Add Health node
            const healthItem = new TreeItem('Health', {
                children: [],  // Leaf node
                resourceUri: serviceItem.resourceUri,
                status: serviceItem.healthState,
                iconPath: new vscode.ThemeIcon('pulse', new vscode.ThemeColor('charts.blue')),
                itemType: 'service-health',
                itemId: `health-${serviceItem.itemId}`,
                clusterEndpoint: serviceItem.clusterEndpoint,
                applicationId: serviceItem.applicationId
            });
            healthItem.serviceId = serviceItem.itemId;
            children.push(healthItem);
            
            // Add Events node
            const eventsItem = new TreeItem('Events', {
                children: [],  // Leaf node
                resourceUri: serviceItem.resourceUri,
                status: undefined,
                iconPath: new vscode.ThemeIcon('calendar', new vscode.ThemeColor('charts.purple')),
                itemType: 'service-events',
                itemId: `events-${serviceItem.itemId}`,
                clusterEndpoint: serviceItem.clusterEndpoint,
                applicationId: serviceItem.applicationId
            });
            eventsItem.serviceId = serviceItem.itemId;
            children.push(eventsItem);
            
            // Add Manifest node (match SFX)
            const manifestItem = new TreeItem('Manifest', {
                children: [],  // Leaf node
                resourceUri: serviceItem.resourceUri,
                status: undefined,
                iconPath: new vscode.ThemeIcon('file-code', new vscode.ThemeColor('charts.orange')),
                itemType: 'service-manifest',
                itemId: `manifest-${serviceItem.itemId}`,
                clusterEndpoint: serviceItem.clusterEndpoint,
                applicationId: serviceItem.applicationId
            });
            manifestItem.serviceId = serviceItem.itemId;
            children.push(manifestItem);
            
            SfUtility.outputLog(`Loaded ${children.length} groups for ${serviceItem.label}`, null, debugLevel.info);
            return children;
        } catch (error) {
            SfUtility.outputLog(`Failed to load children for ${serviceItem.label}`, error, debugLevel.error);
            return [];
        }
    }
    
    private async loadPartitionChildren(partitionItem: TreeItem): Promise<TreeItem[]> {
        if (!this.sfRestInstance || !partitionItem.itemId || !partitionItem.applicationId || !partitionItem.serviceId) {
            SfUtility.outputLog('Cannot load partition children: missing required info', null, debugLevel.warn);
            return [];
        }
        
        try {
            SfUtility.outputLog(`Loading children for partition: ${partitionItem.itemId}`, null, debugLevel.info);
            const children: TreeItem[] = [];
            
            // Add Replicas group node
            const replicasGroupItem = new TreeItem('Replicas', {
                children: undefined,  // Will be lazy loaded
                resourceUri: partitionItem.resourceUri,
                status: undefined,
                iconPath: new vscode.ThemeIcon('folder'),
                itemType: 'replicas-group',
                itemId: 'replicas-group',
                clusterEndpoint: partitionItem.clusterEndpoint,
                applicationId: partitionItem.applicationId
            });
            replicasGroupItem.serviceId = partitionItem.serviceId;
            replicasGroupItem.partitionId = partitionItem.partitionId;
            children.push(replicasGroupItem);
            
            // Add Health node
            const healthItem = new TreeItem('Health', {
                children: [],  // Leaf node
                resourceUri: partitionItem.resourceUri,
                status: partitionItem.healthState,
                iconPath: new vscode.ThemeIcon('pulse', new vscode.ThemeColor('charts.blue')),
                itemType: 'partition-health',
                itemId: `health-${partitionItem.itemId}`,
                clusterEndpoint: partitionItem.clusterEndpoint,
                applicationId: partitionItem.applicationId
            });
            healthItem.serviceId = partitionItem.serviceId;
            healthItem.partitionId = partitionItem.partitionId;
            children.push(healthItem);
            
            // Add Events node
            const eventsItem = new TreeItem('Events', {
                children: [],  // Leaf node
                resourceUri: partitionItem.resourceUri,
                status: undefined,
                iconPath: new vscode.ThemeIcon('calendar', new vscode.ThemeColor('charts.purple')),
                itemType: 'partition-events',
                itemId: `events-${partitionItem.itemId}`,
                clusterEndpoint: partitionItem.clusterEndpoint,
                applicationId: partitionItem.applicationId
            });
            eventsItem.serviceId = partitionItem.serviceId;
            eventsItem.partitionId = partitionItem.partitionId;

            children.push(eventsItem);
            
            SfUtility.outputLog(`Loaded ${children.length} groups for partition`, null, debugLevel.info);
            return children;
        } catch (error) {
            SfUtility.outputLog(`Failed to load children for partition`, error, debugLevel.error);
            return [];
        }
    }
    
    private async loadPartitionsForGroup(groupItem: TreeItem): Promise<TreeItem[]> {
        if (!this.sfRestInstance || !groupItem.serviceId || !groupItem.applicationId) {
            SfUtility.outputLog('Cannot load partitions for group: missing required info', null, debugLevel.warn);
            return [];
        }
        
        try {
            SfUtility.outputLog(`Loading partitions for service: ${groupItem.serviceId}`, null, debugLevel.info);
            const partitions = await this.sfRestInstance.getServicePartitions(groupItem.serviceId, groupItem.applicationId);
            
            // Get cluster config for health lookup
            const clusterEndpoint = groupItem.clusterEndpoint || 'localhost';
            const clusterConfig = this.clusterConfigMap.get(clusterEndpoint);
            SfUtility.outputLog(`🔍 Partition config lookup: endpoint='${clusterEndpoint}', found=${!!clusterConfig}, map size=${this.clusterConfigMap.size}`, null, debugLevel.debug);
            
            const children: TreeItem[] = [];
            
            // Add partitions
            partitions.forEach((partition: sfModels.ServicePartitionInfoUnion) => {
                const partitionId = partition.partitionInformation?.id || 'unknown';
                // Match SFX: For Named partitions show "Name (ID)", otherwise just ID
                let displayName = partitionId;
                const partInfo = partition.partitionInformation as any; // Complex union type
                if (partInfo?.servicePartitionKind === 'Named' && partInfo?.name) {
                    displayName = `${partInfo.name} (${partitionId})`;
                }
                
                // Try to get health from cache, fall back to API response
                let healthState = partition.healthState;
                if (clusterConfig && partitionId !== 'unknown') {
                    const cachedHealth = clusterConfig.getPartitionHealth(partitionId);
                    if (cachedHealth) {
                        healthState = cachedHealth;
                        SfUtility.outputLog(`  🔄 Using cached health for partition ${partitionId}: ${cachedHealth}`, null, debugLevel.debug);
                    }
                }
                
                // Get icon based on health state
                const partitionIcon = clusterConfig ? clusterConfig.getIcon(healthState, 'database') : new vscode.ThemeIcon('database');
                SfUtility.outputLog(`🎨 Partition ${partitionId} icon: healthState='${healthState}', hasConfig=${!!clusterConfig}, icon=${partitionIcon?.id || 'none'}`, null, debugLevel.debug);
                
                const partitionItem = new TreeItem(displayName, {
                    children: undefined,  // Will be lazy loaded
                    resourceUri: groupItem.resourceUri,
                    status: healthState,
                    iconPath: partitionIcon,
                    contextValue: 'partition', // Enable context menu for partition items
                    itemType: 'partition',
                    itemId: partitionId,
                    clusterEndpoint: groupItem.clusterEndpoint,
                    applicationId: groupItem.applicationId
                });
                partitionItem.serviceId = groupItem.serviceId;  // Store service ID for replica queries
                partitionItem.partitionId = partitionId;  // Store partition ID for replica queries
                children.push(partitionItem);
            });
            
            SfUtility.outputLog(`Loaded ${children.length} partitions`, null, debugLevel.info);
            return children;
        } catch (error) {
            SfUtility.outputLog(`Failed to load partitions`, error, debugLevel.error);
            return [];
        }
    }
    
    private async loadReplicasForGroup(groupItem: TreeItem): Promise<TreeItem[]> {
        if (!this.sfRestInstance || !groupItem.partitionId || !groupItem.applicationId || !groupItem.serviceId) {
            SfUtility.outputLog('Cannot load replicas for group: missing required info', null, debugLevel.warn);
            return [];
        }
        
        try {
            SfUtility.outputLog(`Loading replicas for partition: ${groupItem.partitionId}`, null, debugLevel.info);
            
            // Get cluster config and track this partition expansion
            const clusterEndpoint = groupItem.clusterEndpoint || 'localhost';
            const clusterConfig = this.clusterConfigMap.get(clusterEndpoint);
            SfUtility.outputLog(`🔍 Replica config lookup: endpoint='${clusterEndpoint}', found=${!!clusterConfig}, map size=${this.clusterConfigMap.size}`, null, debugLevel.debug);
            if (clusterConfig && groupItem.partitionId && groupItem.serviceId && groupItem.applicationId) {
                await clusterConfig.trackExpandedPartition(groupItem.partitionId, groupItem.serviceId, groupItem.applicationId);
            }
            
            const replicas = await this.sfRestInstance.getPartitionReplicas(
                groupItem.serviceId,
                groupItem.applicationId,
                groupItem.partitionId
            );
            
            const children: TreeItem[] = [];
            
            // Add replicas
            replicas.forEach((replica: sfModels.ReplicaInfoUnion) => {
                const replicaInfo = replica as any; // Complex union type
                const replicaId = replicaInfo.replicaId || replicaInfo.instanceId || 'unknown';
                const replicaRole = replicaInfo.replicaRole;
                const nodeName = replica.nodeName || 'UnknownNode';
                const replicaStatus = replica.replicaStatus;
                
                // Match SFX: For stateless show just NodeName, for stateful show "Role (NodeName)"
                let displayName = nodeName;
                if (replicaRole && replicaRole !== 'None') {
                    displayName = `${replicaRole} (${nodeName})`;
                }
                
                // Try to get health from cache, fall back to API response
                let healthState = replica.healthState;
                SfUtility.outputLog(`  📊 Replica ${replicaId} (${displayName}) healthState='${healthState}', replicaStatus='${replicaStatus}'`, null, debugLevel.info);
                if (clusterConfig && replicaId !== 'unknown') {
                    const cachedHealth = clusterConfig.getReplicaHealth(replicaId.toString());
                    if (cachedHealth) {
                        healthState = cachedHealth;
                        SfUtility.outputLog(`  🔄 Using cached health for replica ${replicaId}: ${cachedHealth}`, null, debugLevel.info);
                    }
                }
                
                // If health is Unknown but replica status is Down, treat as Error for icon display
                if (healthState === 'Unknown' && replicaStatus === 'Down') {
                    SfUtility.outputLog(`  ⚠️ Replica ${replicaId} is Down (status) but Unknown (health), using Error for icon`, null, debugLevel.info);
                    healthState = 'Error';
                }
                
                SfUtility.outputLog(`  ✨ Final replica ${replicaId} healthState: '${healthState}'`, null, debugLevel.info);
                
                // Get icon based on health state
                const replicaIcon = clusterConfig ? clusterConfig.getIcon(healthState, 'symbol-variable') : new vscode.ThemeIcon('symbol-variable');
                SfUtility.outputLog(`🎨 Replica ${replicaId} icon: healthState='${healthState}', hasConfig=${!!clusterConfig}, icon=${replicaIcon?.id || 'none'}`, null, debugLevel.info);
                
                // Determine contextValue based on service kind
                // Stateful replicas can be restarted, stateless instances can only be removed
                const serviceKind = (replica as any).serviceKind || 'Unknown';
                const contextValue = serviceKind === 'Stateful' ? 'replica-stateful' : 'replica-stateless';
                
                const replicaItem = new TreeItem(displayName, {
                    children: undefined,  // Will be lazy loaded
                    resourceUri: groupItem.resourceUri,
                    status: healthState,
                    iconPath: replicaIcon,
                    contextValue: contextValue, // Enable context menu for replica items
                    itemType: 'replica',
                    itemId: replicaId.toString(),
                    clusterEndpoint: groupItem.clusterEndpoint,
                    applicationId: groupItem.applicationId
                });
                replicaItem.serviceId = groupItem.serviceId;
                replicaItem.partitionId = groupItem.partitionId;
                // Store nodeName and serviceKind for replica restart/delete operations
                replicaItem.nodeName = replica.nodeName;
                replicaItem.serviceKind = serviceKind;
                children.push(replicaItem);
            });
            
            SfUtility.outputLog(`Loaded ${children.length} replicas`, null, debugLevel.info);
            return children;
        } catch (error) {
            SfUtility.outputLog(`Failed to load replicas`, error, debugLevel.error);
            return [];
        }
    }
    
    private async loadReplicaChildren(replicaItem: TreeItem): Promise<TreeItem[]> {
        try {
            const children: TreeItem[] = [];
            
            // Add Health node
            const healthItem = new TreeItem('Health', {
                children: [],  // Leaf node
                resourceUri: replicaItem.resourceUri,
                status: replicaItem.healthState,
                iconPath: new vscode.ThemeIcon('pulse', new vscode.ThemeColor('charts.blue')),
                itemType: 'replica-health',
                itemId: `health-${replicaItem.itemId}`,
                clusterEndpoint: replicaItem.clusterEndpoint,
                applicationId: replicaItem.applicationId
            });
            healthItem.serviceId = replicaItem.serviceId;
            healthItem.partitionId = replicaItem.partitionId;
            healthItem.replicaId = replicaItem.itemId;
            children.push(healthItem);
            
            // Add Events node
            const eventsItem = new TreeItem('Events', {
                children: [],  // Leaf node
                resourceUri: replicaItem.resourceUri,
                status: undefined,
                iconPath: new vscode.ThemeIcon('calendar', new vscode.ThemeColor('charts.purple')),
                itemType: 'replica-events',
                itemId: `events-${replicaItem.itemId}`,
                clusterEndpoint: replicaItem.clusterEndpoint,
                applicationId: replicaItem.applicationId
            });
            eventsItem.serviceId = replicaItem.serviceId;
            eventsItem.partitionId = replicaItem.partitionId;
            eventsItem.replicaId = replicaItem.itemId;
            eventsItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
            children.push(eventsItem);
            
            return children;
        } catch (error) {
            SfUtility.outputLog(`Failed to load replica children`, error, debugLevel.error);
            return [];
        }
    }
    
    /**
     * Load metrics data for the cluster
     */
    private async loadMetricsChildren(metricsItem: TreeItem): Promise<TreeItem[]> {
        SfUtility.outputLog(`📊 loadMetricsChildren CALLED`, null, debugLevel.info);
        
        if (!this.sfRestInstance) {
            SfUtility.outputLog('❌ Cannot load metrics: missing sfRest. Reconnect to cluster.', null, debugLevel.warn);
            return [];
        }
        
        try {
            const loadInfo = await this.sfRestInstance.getClusterLoadInformation();
            const children: TreeItem[] = [];
            
            // Add last balancing time info
            if (loadInfo.lastBalancingStartTimeUtc || loadInfo.lastBalancingEndTimeUtc) {
                const startTime = loadInfo.lastBalancingStartTimeUtc 
                    ? new Date(loadInfo.lastBalancingStartTimeUtc).toLocaleString()
                    : 'N/A';
                const endTime = loadInfo.lastBalancingEndTimeUtc 
                    ? new Date(loadInfo.lastBalancingEndTimeUtc).toLocaleString()
                    : 'N/A';
                
                children.push(new TreeItem('Last Balancing', {
                    children: [
                        new TreeItem(`Start: ${startTime}`, {
                            children: [],
                            itemType: 'metric-info',
                            iconPath: new vscode.ThemeIcon('clock', new vscode.ThemeColor('charts.blue'))
                        }),
                        new TreeItem(`End: ${endTime}`, {
                            children: [],
                            itemType: 'metric-info',
                            iconPath: new vscode.ThemeIcon('clock', new vscode.ThemeColor('charts.blue'))
                        })
                    ],
                    resourceUri: metricsItem.resourceUri,
                    iconPath: new vscode.ThemeIcon('history', new vscode.ThemeColor('charts.purple')),
                    itemType: 'metric-group',
                    clusterEndpoint: metricsItem.clusterEndpoint
                }));
            }
            
            // Display load metrics
            if (loadInfo.loadMetricInformation && loadInfo.loadMetricInformation.length > 0) {
                for (const metric of loadInfo.loadMetricInformation) {
                    const metricName = metric.name || 'Unknown Metric';
                    const metricChildren: TreeItem[] = [];
                    
                    // Resource Capacity section
                    const capacityChildren: TreeItem[] = [];
                    if (metric.clusterCapacity !== undefined) {
                        capacityChildren.push(new TreeItem(`Total Capacity: ${metric.clusterCapacity}`, {
                            children: [],
                            itemType: 'metric-info',
                            iconPath: new vscode.ThemeIcon('database', new vscode.ThemeColor('charts.gray'))
                        }));
                    }
                    if (metric.currentClusterLoad !== undefined || metric.clusterLoad !== undefined) {
                        const load = metric.currentClusterLoad || metric.clusterLoad;
                        capacityChildren.push(new TreeItem(`Current Load: ${load}`, {
                            children: [],
                            itemType: 'metric-info',
                            iconPath: new vscode.ThemeIcon('symbol-misc', new vscode.ThemeColor('charts.blue'))
                        }));
                    }
                    if (metric.clusterCapacityRemaining !== undefined || metric.clusterRemainingCapacity !== undefined) {
                        const remaining = metric.clusterCapacityRemaining || metric.clusterRemainingCapacity;
                        capacityChildren.push(new TreeItem(`Remaining: ${remaining}`, {
                            children: [],
                            itemType: 'metric-info',
                            iconPath: new vscode.ThemeIcon('circle-outline', new vscode.ThemeColor('charts.green'))
                        }));
                    }
                    
                    if (capacityChildren.length > 0) {
                        metricChildren.push(new TreeItem('Resource Capacity', {
                            children: capacityChildren,
                            itemType: 'metric-subgroup',
                            iconPath: new vscode.ThemeIcon('dashboard', new vscode.ThemeColor('charts.orange'))
                        }));
                    }
                    
                    // Load details section
                    const loadChildren: TreeItem[] = [];
                    if (metric.minimumNodeLoad !== undefined || metric.minNodeLoadValue !== undefined) {
                        const minLoad = metric.minimumNodeLoad || metric.minNodeLoadValue;
                        const minNodeId = metric.minNodeLoadNodeId?.id || 'N/A';
                        loadChildren.push(new TreeItem(`Min Load: ${minLoad} (${minNodeId})`, {
                            children: [],
                            itemType: 'metric-info',
                            iconPath: new vscode.ThemeIcon('arrow-down', new vscode.ThemeColor('charts.green'))
                        }));
                    }
                    if (metric.maximumNodeLoad !== undefined || metric.maxNodeLoadValue !== undefined) {
                        const maxLoad = metric.maximumNodeLoad || metric.maxNodeLoadValue;
                        const maxNodeId = metric.maxNodeLoadNodeId?.id || 'N/A';
                        loadChildren.push(new TreeItem(`Max Load: ${maxLoad} (${maxNodeId})`, {
                            children: [],
                            itemType: 'metric-info',
                            iconPath: new vscode.ThemeIcon('arrow-up', new vscode.ThemeColor('charts.red'))
                        }));
                    }
                    
                    if (loadChildren.length > 0) {
                        metricChildren.push(new TreeItem('Node Load Range', {
                            children: loadChildren,
                            itemType: 'metric-subgroup',
                            iconPath: new vscode.ThemeIcon('graph-line', new vscode.ThemeColor('charts.blue'))
                        }));
                    }
                    
                    // Balancing status
                    const balancingChildren: TreeItem[] = [];
                    if (metric.isBalancedBefore !== undefined) {
                        const status = metric.isBalancedBefore ? '✓ Balanced' : '✗ Not Balanced';
                        balancingChildren.push(new TreeItem(`Before: ${status}`, {
                            children: [],
                            itemType: 'metric-info',
                            iconPath: new vscode.ThemeIcon(
                                metric.isBalancedBefore ? 'check' : 'x',
                                metric.isBalancedBefore 
                                    ? new vscode.ThemeColor('testing.iconPassed')
                                    : new vscode.ThemeColor('testing.iconFailed')
                            )
                        }));
                    }
                    if (metric.isBalancedAfter !== undefined) {
                        const status = metric.isBalancedAfter ? '✓ Balanced' : '✗ Not Balanced';
                        balancingChildren.push(new TreeItem(`After: ${status}`, {
                            children: [],
                            itemType: 'metric-info',
                            iconPath: new vscode.ThemeIcon(
                                metric.isBalancedAfter ? 'check' : 'x',
                                metric.isBalancedAfter 
                                    ? new vscode.ThemeColor('testing.iconPassed')
                                    : new vscode.ThemeColor('testing.iconFailed')
                            )
                        }));
                    }
                    if (metric.deviationBefore !== undefined) {
                        balancingChildren.push(new TreeItem(`Deviation Before: ${metric.deviationBefore}`, {
                            children: [],
                            itemType: 'metric-info',
                            iconPath: new vscode.ThemeIcon('graph', new vscode.ThemeColor('charts.gray'))
                        }));
                    }
                    if (metric.deviationAfter !== undefined) {
                        balancingChildren.push(new TreeItem(`Deviation After: ${metric.deviationAfter}`, {
                            children: [],
                            itemType: 'metric-info',
                            iconPath: new vscode.ThemeIcon('graph', new vscode.ThemeColor('charts.gray'))
                        }));
                    }
                    
                    if (balancingChildren.length > 0) {
                        metricChildren.push(new TreeItem('Balancing Status', {
                            children: balancingChildren,
                            itemType: 'metric-subgroup',
                            iconPath: new vscode.ThemeIcon('symbol-misc', new vscode.ThemeColor('charts.purple'))
                        }));
                    }
                    
                    // Additional details
                    const detailsChildren: TreeItem[] = [];
                    if (metric.balancingThreshold !== undefined) {
                        detailsChildren.push(new TreeItem(`Balancing Threshold: ${metric.balancingThreshold}`, {
                            children: [],
                            itemType: 'metric-info',
                            iconPath: new vscode.ThemeIcon('settings-gear')
                        }));
                    }
                    if (metric.activityThreshold !== undefined) {
                        detailsChildren.push(new TreeItem(`Activity Threshold: ${metric.activityThreshold}`, {
                            children: [],
                            itemType: 'metric-info',
                            iconPath: new vscode.ThemeIcon('settings-gear')
                        }));
                    }
                    if (metric.action !== undefined) {
                        detailsChildren.push(new TreeItem(`Action: ${metric.action}`, {
                            children: [],
                            itemType: 'metric-info',
                            iconPath: new vscode.ThemeIcon('play')
                        }));
                    }
                    if (metric.isClusterCapacityViolation !== undefined) {
                        const violationStatus = metric.isClusterCapacityViolation ? '⚠ Yes' : '✓ No';
                        detailsChildren.push(new TreeItem(`Capacity Violation: ${violationStatus}`, {
                            children: [],
                            itemType: 'metric-info',
                            iconPath: new vscode.ThemeIcon(
                                metric.isClusterCapacityViolation ? 'warning' : 'check',
                                metric.isClusterCapacityViolation 
                                    ? new vscode.ThemeColor('testing.iconFailed')
                                    : new vscode.ThemeColor('testing.iconPassed')
                            )
                        }));
                    }
                    
                    if (detailsChildren.length > 0) {
                        metricChildren.push(new TreeItem('Details', {
                            children: detailsChildren,
                            itemType: 'metric-subgroup',
                            iconPath: new vscode.ThemeIcon('info', new vscode.ThemeColor('charts.blue'))
                        }));
                    }
                    
                    // Create the metric tree item
                    children.push(new TreeItem(metricName, {
                        children: metricChildren,
                        resourceUri: metricsItem.resourceUri,
                        iconPath: new vscode.ThemeIcon('pulse', new vscode.ThemeColor('charts.red')),
                        itemType: 'metric',
                        itemId: metricName,
                        clusterEndpoint: metricsItem.clusterEndpoint
                    }));
                }
            }
            
            if (children.length === 0) {
                SfUtility.outputLog('No metrics data available', null, debugLevel.info);
                children.push(new TreeItem('No metrics available', {
                    children: [],
                    itemType: 'metric-info',
                    iconPath: new vscode.ThemeIcon('info')
                }));
            }
            
            SfUtility.outputLog(`Loaded ${children.length} metric items`, null, debugLevel.info);
            return children;
        } catch (error) {
            SfUtility.outputLog('Failed to load metrics', error, debugLevel.error);
            vscode.window.showErrorMessage(`Failed to load cluster metrics: ${error instanceof Error ? error.message : String(error)}`);
            return [];
        }
    }
    
    /**
     * Load commands tree structure with categories
     */
    private loadCommandsChildren(commandsItem: TreeItem): TreeItem[] {
        SfUtility.outputLog(`⚙️ loadCommandsChildren CALLED`, null, debugLevel.info);
        
        const children: TreeItem[] = [];
        
        // ===== POWERSHELL SECTION =====
        const powershellCategories: TreeItem[] = [];
        
        // Connection & Setup Category (PowerShell Guides)
        const connectionOps: TreeItem[] = [
            new TreeItem('Connect to Cluster (All Methods)', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('plug', new vscode.ThemeColor('charts.green')),
                itemType: 'command',
                itemId: 'connect-cluster-guide',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'powershell-command'
            }),
            new TreeItem('Cluster Diagnostics & Health', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('pulse', new vscode.ThemeColor('charts.red')),
                itemType: 'command',
                itemId: 'cluster-diagnostics-guide',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'powershell-command'
            }),
            new TreeItem('Node Management Operations', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('server-process', new vscode.ThemeColor('charts.blue')),
                itemType: 'command',
                itemId: 'node-management-guide',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'powershell-command'
            }),
            new TreeItem('Application Management', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('package', new vscode.ThemeColor('charts.purple')),
                itemType: 'command',
                itemId: 'application-management-guide',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'powershell-command'
            })
        ];
        
        powershellCategories.push(new TreeItem('📘 Getting Started Guides', {
            children: connectionOps,
            resourceUri: commandsItem.resourceUri,
            iconPath: new vscode.ThemeIcon('book', new vscode.ThemeColor('charts.green')),
            itemType: 'command-category',
            clusterEndpoint: commandsItem.clusterEndpoint
        }));
        
        // Cluster Operations Category
        const clusterOps: TreeItem[] = [
            new TreeItem('Start Cluster Upgrade', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('cloud-upload', new vscode.ThemeColor('charts.blue')),
                itemType: 'command',
                itemId: 'start-cluster-upgrade',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'cluster-command'
            }),
            new TreeItem('Rollback Cluster Upgrade', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('debug-reverse-continue', new vscode.ThemeColor('charts.orange')),
                itemType: 'command',
                itemId: 'rollback-cluster-upgrade',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'cluster-command'
            }),
            new TreeItem('Update Cluster Configuration', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('settings-gear', new vscode.ThemeColor('charts.green')),
                itemType: 'command',
                itemId: 'update-cluster-config',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'cluster-command'
            }),
            new TreeItem('Recover System Partitions', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('debug-restart', new vscode.ThemeColor('charts.red')),
                itemType: 'command',
                itemId: 'recover-system-partitions',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'cluster-command'
            }),
            new TreeItem('Reset Partition Loads', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('refresh', new vscode.ThemeColor('charts.purple')),
                itemType: 'command',
                itemId: 'reset-partition-loads',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'cluster-command'
            })
        ];
        
        powershellCategories.push(new TreeItem('Cluster Operations', {
            children: clusterOps,
            resourceUri: commandsItem.resourceUri,
            iconPath: new vscode.ThemeIcon('server', new vscode.ThemeColor('charts.blue')),
            itemType: 'command-category',
            clusterEndpoint: commandsItem.clusterEndpoint
        }));
        
        // Application Lifecycle Category
        const appOps: TreeItem[] = [
            new TreeItem('Provision Application Type', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('cloud-download', new vscode.ThemeColor('charts.green')),
                itemType: 'command',
                itemId: 'provision-app-type',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'app-command'
            }),
            new TreeItem('Create Application', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('add', new vscode.ThemeColor('charts.green')),
                itemType: 'command',
                itemId: 'create-application',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'app-command'
            }),
            new TreeItem('Start Application Upgrade', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('rocket', new vscode.ThemeColor('charts.blue')),
                itemType: 'command',
                itemId: 'start-app-upgrade',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'app-command'
            }),
            new TreeItem('Rollback Application Upgrade', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('debug-reverse-continue', new vscode.ThemeColor('charts.orange')),
                itemType: 'command',
                itemId: 'rollback-app-upgrade',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'app-command'
            })
        ];
        
        powershellCategories.push(new TreeItem('Application Lifecycle', {
            children: appOps,
            resourceUri: commandsItem.resourceUri,
            iconPath: new vscode.ThemeIcon('package', new vscode.ThemeColor('charts.green')),
            itemType: 'command-category',
            clusterEndpoint: commandsItem.clusterEndpoint
        }));
        
        // Partition & Replica Operations Category
        const partitionOps: TreeItem[] = [
            new TreeItem('Move Primary Replica', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('arrow-right', new vscode.ThemeColor('charts.blue')),
                itemType: 'command',
                itemId: 'move-primary-replica',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'partition-command'
            }),
            new TreeItem('Move Secondary Replica', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('arrow-both', new vscode.ThemeColor('charts.blue')),
                itemType: 'command',
                itemId: 'move-secondary-replica',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'partition-command'
            }),
            new TreeItem('Reset Partition Load', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('refresh', new vscode.ThemeColor('charts.purple')),
                itemType: 'command',
                itemId: 'reset-partition-load',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'partition-command'
            }),
            new TreeItem('Report Custom Health', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('pulse', new vscode.ThemeColor('charts.red')),
                itemType: 'command',
                itemId: 'report-health',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'partition-command'
            })
        ];
        
        powershellCategories.push(new TreeItem('Partition & Replica Operations', {
            children: partitionOps,
            resourceUri: commandsItem.resourceUri,
            iconPath: new vscode.ThemeIcon('database', new vscode.ThemeColor('charts.purple')),
            itemType: 'command-category',
            clusterEndpoint: commandsItem.clusterEndpoint
        }));
        
        // Testing & Chaos Category
        const testingOps: TreeItem[] = [
            new TreeItem('Start Chaos Test', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('beaker', new vscode.ThemeColor('charts.yellow')),
                itemType: 'command',
                itemId: 'start-chaos',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'chaos-command'
            }),
            new TreeItem('Stop Chaos Test', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('debug-stop', new vscode.ThemeColor('charts.red')),
                itemType: 'command',
                itemId: 'stop-chaos',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'chaos-command'
            }),
            new TreeItem('Query Chaos Events', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('search', new vscode.ThemeColor('charts.blue')),
                itemType: 'command',
                itemId: 'query-chaos-events',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'chaos-command'
            }),
            new TreeItem('Restart Partition (Data Loss)', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('warning', new vscode.ThemeColor('charts.orange')),
                itemType: 'command',
                itemId: 'restart-partition',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'chaos-command'
            })
        ];
        
        powershellCategories.push(new TreeItem('Testing & Chaos', {
            children: testingOps,
            resourceUri: commandsItem.resourceUri,
            iconPath: new vscode.ThemeIcon('beaker', new vscode.ThemeColor('charts.yellow')),
            itemType: 'command-category',
            clusterEndpoint: commandsItem.clusterEndpoint
        }));
        
        // Backup & Restore Category
        const backupOps: TreeItem[] = [
            new TreeItem('Enable Backup', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('archive', new vscode.ThemeColor('charts.green')),
                itemType: 'command',
                itemId: 'enable-backup',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'backup-command'
            }),
            new TreeItem('Disable Backup', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('circle-slash', new vscode.ThemeColor('charts.orange')),
                itemType: 'command',
                itemId: 'disable-backup',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'backup-command'
            }),
            new TreeItem('Trigger Ad-hoc Backup', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('cloud-upload', new vscode.ThemeColor('charts.blue')),
                itemType: 'command',
                itemId: 'trigger-backup',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'backup-command'
            }),
            new TreeItem('Get Backup Progress', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('sync', new vscode.ThemeColor('charts.blue')),
                itemType: 'command',
                itemId: 'get-backup-progress',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'backup-command'
            }),
            new TreeItem('Restore from Backup', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('cloud-download', new vscode.ThemeColor('charts.purple')),
                itemType: 'command',
                itemId: 'restore-backup',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'backup-command'
            })
        ];
        
        powershellCategories.push(new TreeItem('Backup & Restore', {
            children: backupOps,
            resourceUri: commandsItem.resourceUri,
            iconPath: new vscode.ThemeIcon('archive', new vscode.ThemeColor('charts.purple')),
            itemType: 'command-category',
            clusterEndpoint: commandsItem.clusterEndpoint
        }));
        
        // Repair & Infrastructure Category
        const repairOps: TreeItem[] = [
            new TreeItem('View Active Repair Tasks', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('list-tree', new vscode.ThemeColor('charts.blue')),
                itemType: 'command',
                itemId: 'view-repair-tasks',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'repair-command'
            }),
            new TreeItem('Create Repair Task', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('tools', new vscode.ThemeColor('charts.green')),
                itemType: 'command',
                itemId: 'create-repair-task',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'repair-command'
            }),
            new TreeItem('Cancel Repair Task', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('close', new vscode.ThemeColor('charts.red')),
                itemType: 'command',
                itemId: 'cancel-repair-task',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'repair-command'
            }),
            new TreeItem('Force Approve Repair Task', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('check-all', new vscode.ThemeColor('charts.orange')),
                itemType: 'command',
                itemId: 'force-approve-repair',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'repair-command'
            })
        ];
        
        powershellCategories.push(new TreeItem('Repair & Infrastructure', {
            children: repairOps,
            resourceUri: commandsItem.resourceUri,
            iconPath: new vscode.ThemeIcon('tools', new vscode.ThemeColor('charts.orange')),
            itemType: 'command-category',
            clusterEndpoint: commandsItem.clusterEndpoint
        }));
        
        // Add PowerShell section to main children
        children.push(new TreeItem('🟦 PowerShell Commands', {
            children: powershellCategories,
            resourceUri: commandsItem.resourceUri,
            iconPath: new vscode.ThemeIcon('terminal-powershell', new vscode.ThemeColor('charts.blue')),
            itemType: 'tool-section',
            clusterEndpoint: commandsItem.clusterEndpoint
        }));
        
        // ===== AZURE CLI SECTION =====
        const azureCliCategories: TreeItem[] = [];
        
        // Azure CLI Setup & Connection
        const azSetupGuides: TreeItem[] = [
            new TreeItem('Install Azure CLI sf Extension', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('cloud-download', new vscode.ThemeColor('charts.green')),
                itemType: 'command',
                itemId: 'az-sf-install-extension',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'azure-cli-command'
            }),
            new TreeItem('Configure Cluster Connection', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('plug', new vscode.ThemeColor('charts.green')),
                itemType: 'command',
                itemId: 'az-sf-cluster-select',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'azure-cli-command'
            }),
            new TreeItem('Authenticate with Azure', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('key', new vscode.ThemeColor('charts.blue')),
                itemType: 'command',
                itemId: 'az-login',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'azure-cli-command'
            })
        ];
        
        azureCliCategories.push(new TreeItem('📘 Setup & Connection', {
            children: azSetupGuides,
            resourceUri: commandsItem.resourceUri,
            iconPath: new vscode.ThemeIcon('book', new vscode.ThemeColor('charts.green')),
            itemType: 'command-category',
            clusterEndpoint: commandsItem.clusterEndpoint
        }));
        
        // Azure CLI Cluster Management
        const azClusterOps: TreeItem[] = [
            new TreeItem('Get Cluster Health', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('heart', new vscode.ThemeColor('charts.green')),
                itemType: 'command',
                itemId: 'az-sf-cluster-health',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'azure-cli-command'
            }),
            new TreeItem('Show Cluster Manifest', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('file-code', new vscode.ThemeColor('charts.blue')),
                itemType: 'command',
                itemId: 'az-sf-cluster-manifest',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'azure-cli-command'
            }),
            new TreeItem('List Nodes', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('server', new vscode.ThemeColor('charts.blue')),
                itemType: 'command',
                itemId: 'az-sf-node-list',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'azure-cli-command'
            })
        ];
        
        azureCliCategories.push(new TreeItem('Cluster Management', {
            children: azClusterOps,
            resourceUri: commandsItem.resourceUri,
            iconPath: new vscode.ThemeIcon('server', new vscode.ThemeColor('charts.blue')),
            itemType: 'command-category',
            clusterEndpoint: commandsItem.clusterEndpoint
        }));
        
        // Azure CLI Application Management
        const azAppOps: TreeItem[] = [
            new TreeItem('List Applications', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('list-tree', new vscode.ThemeColor('charts.purple')),
                itemType: 'command',
                itemId: 'az-sf-application-list',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'azure-cli-command'
            }),
            new TreeItem('Get Application Health', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('heart', new vscode.ThemeColor('charts.green')),
                itemType: 'command',
                itemId: 'az-sf-application-health',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'azure-cli-command'
            }),
            new TreeItem('Delete Application', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('trash', new vscode.ThemeColor('charts.red')),
                itemType: 'command',
                itemId: 'az-sf-application-delete',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'azure-cli-command'
            })
        ];
        
        azureCliCategories.push(new TreeItem('Application Management', {
            children: azAppOps,
            resourceUri: commandsItem.resourceUri,
            iconPath: new vscode.ThemeIcon('package', new vscode.ThemeColor('charts.purple')),
            itemType: 'command-category',
            clusterEndpoint: commandsItem.clusterEndpoint
        }));
        
        // Azure CLI Service & Replica Management
        const azServiceOps: TreeItem[] = [
            new TreeItem('List Services', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('list-tree', new vscode.ThemeColor('charts.blue')),
                itemType: 'command',
                itemId: 'az-sf-service-list',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'azure-cli-command'
            })
        ];
        
        azureCliCategories.push(new TreeItem('Service & Replica Management', {
            children: azServiceOps,
            resourceUri: commandsItem.resourceUri,
            iconPath: new vscode.ThemeIcon('gear', new vscode.ThemeColor('charts.blue')),
            itemType: 'command-category',
            clusterEndpoint: commandsItem.clusterEndpoint
        }));
        
        // Azure CLI Query & Diagnostics
        const azQueryOps: TreeItem[] = [
            new TreeItem('Query & Diagnostics Guide', {
                children: [],
                resourceUri: commandsItem.resourceUri,
                iconPath: new vscode.ThemeIcon('search', new vscode.ThemeColor('charts.purple')),
                itemType: 'command',
                itemId: 'az-sf-query-guide',
                clusterEndpoint: commandsItem.clusterEndpoint,
                contextValue: 'azure-cli-command'
            })
        ];
        
        azureCliCategories.push(new TreeItem('Query & Diagnostics', {
            children: azQueryOps,
            resourceUri: commandsItem.resourceUri,
            iconPath: new vscode.ThemeIcon('search', new vscode.ThemeColor('charts.purple')),
            itemType: 'command-category',
            clusterEndpoint: commandsItem.clusterEndpoint
        }));
        
        // Add Azure CLI section to main children
        children.push(new TreeItem('🔷 Azure CLI Commands', {
            children: azureCliCategories,
            resourceUri: commandsItem.resourceUri,
            iconPath: new vscode.ThemeIcon('azure', new vscode.ThemeColor('charts.blue')),
            itemType: 'tool-section',
            clusterEndpoint: commandsItem.clusterEndpoint
        }));
        
        SfUtility.outputLog(`Loaded ${children.length} tool sections (PowerShell and Azure CLI)`, null, debugLevel.info);
        return children;
    }
    
    /**
     * Load image store contents (folders and files) for the root or a specific folder
     */
    private async loadImageStoreChildren(imageStoreItem: TreeItem): Promise<TreeItem[]> {
        SfUtility.outputLog(`📦 loadImageStoreChildren CALLED for: ${imageStoreItem.label}`, null, debugLevel.info);
        
        if (!this.sfRestInstance) {
            SfUtility.outputLog('❌ Cannot load image store: missing sfRest. Reconnect to cluster.', null, debugLevel.warn);
            return [];
        }
        
        // Check if native image store is available (only on first expand)
        if (imageStoreItem.clusterEndpoint) {
            const config = this.clusterConfigMap.get(imageStoreItem.clusterEndpoint);
            if (config && !config.isNativeImageStoreAvailable()) {
                SfUtility.outputLog('❌ Image store not available: cluster uses file-based store', null, debugLevel.warn);
                vscode.window.showWarningMessage(
                    'Image Store is not available for this cluster. Only native fabric:ImageStore clusters support the Image Store REST API. ' +
                    'This cluster uses a file-based image store.'
                );
                return []; // Return empty - user will see expanded but empty folder
            }
        }
        
        try {
            const path = imageStoreItem.path || '';
            SfUtility.outputLog(`Fetching image store content at path: '${path}'`, null, debugLevel.info);
            
            // Get image store content from REST API
            const content = await this.sfRestInstance.getImageStoreContent(path);
            
            if (!content) {
                SfUtility.outputLog(`No content returned for path: ${path}`, null, debugLevel.warn);
                return [];
            }
            
            const children: TreeItem[] = [];
            
            // Add subdirectories first
            if (content.storeFolders && content.storeFolders.length > 0) {
                SfUtility.outputLog(`  Found ${content.storeFolders.length} folders`, null, debugLevel.info);
                
                for (const folder of content.storeFolders) {
                    const folderPath = folder.storeRelativePath || '';
                    // Extract just the folder name (handle both / and \ path separators)
                    const folderName = folderPath.split(/[/\\]/).pop() || folderPath;
                    const fileCountNum = folder.fileCount ? parseInt(folder.fileCount, 10) : undefined;
                    const fileCount = fileCountNum !== undefined ? ` (${fileCountNum})` : '';
                    
                    const folderItem = new TreeItem(`${folderName}${fileCount}`, {
                        children: undefined, // Lazy load on expansion
                        resourceUri: imageStoreItem.resourceUri,
                        status: undefined,
                        iconPath: new vscode.ThemeIcon('folder', new vscode.ThemeColor('charts.yellow')),
                        itemType: 'image-store-folder',
                        itemId: `folder-${folderPath}`,
                        clusterEndpoint: imageStoreItem.clusterEndpoint,
                        path: folderPath,
                        fileCount: fileCountNum
                    });
                    folderItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
                    folderItem.tooltip = `Folder: ${folderPath}${fileCount}`;
                    children.push(folderItem);
                }
            }
            
            // Add files
            if (content.storeFiles && content.storeFiles.length > 0) {
                SfUtility.outputLog(`  Found ${content.storeFiles.length} files`, null, debugLevel.info);
                
                for (const file of content.storeFiles) {
                    const filePath = file.storeRelativePath || '';
                    // Extract just the file name (handle both / and \ path separators)
                    const fileName = filePath.split(/[/\\]/).pop() || filePath;
                    
                    // Parse file size from string to number
                    const fileSizeBytes = file.fileSize ? parseInt(file.fileSize, 10) : undefined;
                    
                    // Format file size
                    let sizeStr = '';
                    if (fileSizeBytes !== undefined && !isNaN(fileSizeBytes)) {
                        const sizeKB = Math.round(fileSizeBytes / 1024);
                        sizeStr = sizeKB > 1024 
                            ? ` • ${(sizeKB / 1024).toFixed(1)} MB`
                            : ` • ${sizeKB} KB`;
                    }
                    
                    // Get version number
                    const versionNum = file.fileVersion?.versionNumber;
                    
                    // Format modified date
                    const modifiedDateStr = file.modifiedDate instanceof Date 
                        ? file.modifiedDate.toISOString() 
                        : file.modifiedDate as string | undefined;
                    
                    const fileItem = new TreeItem(fileName, {
                        children: [], // Leaf node - files are not expandable
                        resourceUri: imageStoreItem.resourceUri,
                        status: undefined,
                        iconPath: new vscode.ThemeIcon('file', new vscode.ThemeColor('charts.blue')),
                        itemType: 'image-store-file',
                        itemId: `file-${filePath}`,
                        clusterEndpoint: imageStoreItem.clusterEndpoint,
                        path: filePath,
                        size: fileSizeBytes,
                        version: versionNum,
                        modifiedDate: modifiedDateStr
                    });
                    fileItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
                    fileItem.description = sizeStr;
                    fileItem.tooltip = `File: ${filePath}${sizeStr}`;
                    children.push(fileItem);
                }
            }
            
            if (children.length === 0) {
                SfUtility.outputLog(`  No folders or files found at path: ${path}`, null, debugLevel.info);
            } else {
                SfUtility.outputLog(`  Total items: ${children.length} (${content.storeFolders?.length || 0} folders, ${content.storeFiles?.length || 0} files)`, null, debugLevel.info);
            }
            
            return children;
        } catch (error) {
            SfUtility.outputLog(`Failed to load image store children for path: ${imageStoreItem.path}`, error, debugLevel.error);
            return [];
        }
    }
    
    public setSfRest(sfRest: SfRest): void {
        this.sfRestInstance = sfRest;
        SfUtility.outputLog(`🔧 setSfRest called - sfRest instance ${sfRest ? 'SET' : 'NULL'}`, null, debugLevel.info);
    }

    public getTreeItem(element: TreeItem): TreeItem { //| Thenable<TreeItem> {
        return element;
    }

    /**
     * Refresh tree view with debouncing to batch rapid updates
     * Batches multiple refresh calls within 100ms into a single update
     */
    public refresh(treeItem?: TreeItem): void {
        // Clear existing debounce timer
        if (this.refreshDebouncer) {
            clearTimeout(this.refreshDebouncer);
        }
        
        // Set new debounce timer to batch updates
        this.refreshDebouncer = setTimeout(() => {
            if (treeItem) {
                this._onDidChangeTreeData.fire(treeItem);
            } else {
                this._onDidChangeTreeData.fire(undefined);
            }
            this.refreshDebouncer = undefined;
        }, 100); // 100ms debounce window
    }
    
    /**
     * Check if a cluster endpoint is currently displayed in the tree view
     * @param endpoint Cluster endpoint to check
     * @returns True if cluster has a tree item, false otherwise
     */
    public hasClusterInTree(endpoint: string): boolean {
        return this.clusterConfigMap.has(endpoint);
    }
    
    /**
     * Set the callback function that will be called during auto-refresh
     * This should re-populate cluster data and refresh the tree
     */
    public setRefreshCallback(callback: () => Promise<void>): void {
        this.refreshCallback = callback;
    }
    
    /**
     * Start automatic refresh timer based on configuration
     */
    public startAutoRefresh(): void {
        // Don't start if already running
        if (this.autoRefreshTimer) {
            return;
        }
        
        // Check if auto-refresh is enabled
        const autoRefreshEnabled = SfExtSettings.getSetting(sfExtSettingsList.autorefresh) as boolean;
        if (!autoRefreshEnabled) {
            SfUtility.outputLog('Auto-refresh is disabled in settings', null, debugLevel.info);
            return;
        }
        
        // Get refresh interval (default 30 seconds)
        const refreshInterval = (SfExtSettings.getSetting(sfExtSettingsList.refreshInterval) as number) || 30000;
        
        SfUtility.outputLog(`Starting auto-refresh with interval: ${refreshInterval}ms`, null, debugLevel.info);
        
        this.autoRefreshTimer = setInterval(async () => {
            try {
                SfUtility.outputLog('🔄 ========== AUTO-REFRESH CYCLE STARTING ==========', null, debugLevel.info);
                if (this.refreshCallback) {
                    await this.refreshCallback();
                    
                    // Recreate tree items with fresh data
                    for (const [endpoint, sfConfig] of this.clusterConfigMap.entries()) {
                        try {
                            const newTreeItem = sfConfig.createClusterViewTreeItem();
                            // Use the tree item's label (cluster name) for lookup, not the endpoint
                            this.updateTreeItem(newTreeItem.label as string, newTreeItem);
                        } catch (error) {
                            SfUtility.outputLog(`Failed to recreate tree item for ${endpoint}`, error, debugLevel.error);
                        }
                    }
                    
                    this.refresh();
                }
            } catch (error) {
                SfUtility.outputLog('Auto-refresh failed', error, debugLevel.error);
                // Don't stop the timer on errors - cluster might recover
            }
        }, refreshInterval);
    }
    
    /**
     * Stop automatic refresh timer
     */
    public stopAutoRefresh(): void {
        if (this.autoRefreshTimer) {
            SfUtility.outputLog('Stopping auto-refresh', null, debugLevel.info);
            clearInterval(this.autoRefreshTimer);
            this.autoRefreshTimer = undefined;
        }
    }
    
    /**
     * Restart auto-refresh (useful when settings change)
     */
    public restartAutoRefresh(): void {
        this.stopAutoRefresh();
        if (this.tree.length > 0 && this.refreshCallback) {
            this.startAutoRefresh();
        }
    }
    
    /**
     * Dispose resources when extension deactivates
     */
    public dispose(): void {
        this.stopAutoRefresh();
    }
}

/** Options for creating a TreeItem */
export interface TreeItemOptions {
    children?: TreeItem[];
    resourceUri?: vscode.Uri;
    status?: string;
    iconPath?: string | vscode.Uri | { light: string | vscode.Uri; dark: string | vscode.Uri; } | vscode.ThemeIcon;
    contextValue?: string; // For VS Code context menu matching
    itemType?: string;
    itemId?: string;
    clusterEndpoint?: string;
    applicationId?: string;
    serviceId?: string;
    partitionId?: string;
    replicaId?: string;
    healthState?: string;
    // Image store properties
    path?: string; // Path in image store
    size?: number; // File size in bytes
    version?: string; // File version
    modifiedDate?: string; // Last modified date
    fileCount?: number; // Number of files in folder
}

export class TreeItem extends vscode.TreeItem {
    children?: TreeItem[] = [];
    // Note: iconPath is inherited from vscode.TreeItem - don't re-declare it here
    // Note: contextValue is inherited from vscode.TreeItem for context menu matching
    
    // Metadata for API calls
    public itemType?: string; // 'node', 'application', 'service', 'partition', 'replica', 'manifest', etc.
    public itemId?: string; // Node name, application ID, service ID, partition ID, replica ID
    public clusterEndpoint?: string;
    public applicationId?: string; // For services: parent application ID
    public serviceId?: string; // For partitions/replicas: parent service ID
    public partitionId?: string; // For replicas: parent partition ID
    public replicaId?: string; // For replica sub-items: parent replica ID
    public healthState?: string; // Health state for items
    public nodeName?: string; // For replicas: node where replica is running
    public typeName?: string; // For applications and application types: application type name
    public typeVersion?: string; // For applications and application types: application type version
    public serviceKind?: string; // For replicas: 'Stateful' or 'Stateless'
    // Image store properties
    public path?: string; // Path in image store
    public size?: number; // File size in bytes
    public version?: string; // File version
    public modifiedDate?: string; // Last modified date
    public fileCount?: number; // Number of files in folder

    constructor(label: string, options: TreeItemOptions = {}) {
        // Determine collapsible state based on item type and children
        let collapsibleState = vscode.TreeItemCollapsibleState.None;
        if (options.children !== undefined && options.children.length > 0) {
            // Has children: collapsed by default (match SFX behavior)
            collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        } else if (options.children === undefined && 
                   (options.itemType === 'node' || options.itemType === 'deployed-application' || 
                    options.itemType === 'deployed-service-package' || options.itemType === 'service' || 
                    options.itemType === 'partition' || options.itemType === 'replica' ||
                    options.itemType === 'image-store' || options.itemType === 'image-store-folder' ||
                    options.itemType === 'metrics' || options.itemType === 'commands' ||
                    options.itemType?.endsWith('-group'))) {
            // Lazy-loaded items and group nodes: collapsed for expansion
            collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        } else if (options.children !== undefined && options.children.length === 0) {
            // Empty children array: none (leaf node)
            collapsibleState = vscode.TreeItemCollapsibleState.None;
        }
        
        super(label, collapsibleState);
        this.resourceUri = options.resourceUri;
        this.tooltip = options.status ?? label;
        this.iconPath = options.iconPath as any;
        this.contextValue = options.contextValue; // For context menu matching
        this.itemType = options.itemType;
        this.itemId = options.itemId;
        this.clusterEndpoint = options.clusterEndpoint;
        this.applicationId = options.applicationId;
        this.serviceId = options.serviceId;
        this.partitionId = options.partitionId;
        this.replicaId = options.replicaId;
        this.healthState = options.healthState;
        
        // Image store properties
        this.path = options.path;
        this.size = options.size;
        this.version = options.version;
        this.modifiedDate = options.modifiedDate;
        this.fileCount = options.fileCount;
        
        // Add click command for all items with data, EXCEPT group nodes (which are only expandable)
        // Group nodes end with '-group' and should not be clickable
        if (options.itemType && options.itemId && !options.itemType.endsWith('-group')) {
            this.command = {
                command: 'sfClusterExplorer.showItemDetails',
                title: 'Show Details',
                arguments: [this]
            };
        }
        
        this.children = options.children;
    }
}
