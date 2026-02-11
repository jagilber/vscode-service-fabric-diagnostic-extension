import * as vscode from 'vscode';
import { SfConfiguration } from './sfConfiguration';
import { clusterEndpointInfo, clusterCertificate } from './types/ClusterTypes';
import { SfConstants } from './sfConstants';
import { SfPs } from './sfPs';
import { SfRest } from './sfRest';
import { sfExtSecretList, SfExtSecrets } from './sfExtSecrets';
import { SfExtSettings, sfExtSettingsList } from './sfExtSettings';
import { SfRestClient } from './sfRestClient';
import { debugLevel, SfUtility } from './sfUtility';
import { 
    ClusterConnectionError, 
    CertificateError, 
    NetworkError,
    SdkInstallationError 
} from './models/Errors';
import { ApplicationInfo } from './types';
import { SfHttpClient } from './utils/SfHttpClient';
import { SfSdkInstaller } from './services/SfSdkInstaller';
import { SfClusterService } from './services/SfClusterService';
import { ClusterConnectionManager } from './services/ClusterConnectionManager';

import * as xmlConverter from 'xml-js';
import { IClusterTreeView } from './treeview/IClusterTreeView';
import { SfTreeDataProvider } from './treeview/SfTreeDataProvider';
import { SfTreeDataProviderAdapter } from './treeview/SfTreeDataProviderAdapter';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';

import * as armServiceFabric from '@azure/arm-servicefabric';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import * as sfModels from './sdk/servicefabric/servicefabric/src/models';
import * as serviceFabric from '@azure/servicefabric';
import { ClientSecretCredential } from "@azure/identity";
import { AzureLogger, setLogLevel } from "@azure/logger";



export class SfMgr {
    private sfExtSecrets: SfExtSecrets;

    // private key = "";
    // private certificate = "";
    private subscriptionId = "";
    private context: vscode.ExtensionContext;
    public sfClusterView: IClusterTreeView;
    //public sfClusterViewDD: serviceFabricClusterViewDragAndDrop;
    private sfRest: SfRest;
    // private sfRestClient: SfRestClient;
    private sfConfigs: Array<SfConfiguration> = [];
    private sfConfig: SfConfiguration;

    public sfClusters: ApplicationInfo[] = [];
    // private clientApiVersion = "6.3";
    // private resourceApiVersion = "2018-02-01";
    // private timeOut = 9000;
    // private maxResults = 100;
    // private clusterEndpoints: string[] = [];
    private ps: SfPs = new SfPs();
    private httpClient: SfHttpClient;
    private sdkInstaller: SfSdkInstaller;
    private clusterService: SfClusterService;
    private globalStorage = "";
    private clusterFileStorage = "";

    constructor(context: vscode.ExtensionContext) {
        try {
            SfUtility.outputLog('SfMgr: Starting constructor...', null, debugLevel.info);
            
            this.context = context;
            
            SfUtility.outputLog('SfMgr: Creating SfTreeDataProvider (enterprise tree view)', null, debugLevel.info);
            const provider = new SfTreeDataProvider(context);
            this.sfClusterView = new SfTreeDataProviderAdapter(provider);

            // set azure log level and output
            setLogLevel("verbose");

            // get secrets
            this.sfExtSecrets = new SfExtSecrets(context);

            // override logging to output to console.log (default location is stderr)
            AzureLogger.log = (...args) => {
                SfUtility.outputLog(args.join(" "));
            };

            SfUtility.outputLog('SfMgr: Creating SfConfiguration...', null, debugLevel.debug);
            this.sfConfig = new SfConfiguration(this.context);
            
            SfUtility.outputLog('SfMgr: Creating SfRest...', null, debugLevel.debug);
            this.sfRest = new SfRest(context);
            
            SfUtility.outputLog('SfMgr: Creating services...', null, debugLevel.debug);
            this.sdkInstaller = new SfSdkInstaller(context);
            this.httpClient = new SfHttpClient({ timeout: 30000 });
            this.clusterService = new SfClusterService(context);
            // this.sfRestClient = new SfRestClient(this.sfRest);

            this.globalStorage = context.globalStorageUri.fsPath;
            this.clusterFileStorage = `${this.globalStorage}\\clusters`;

            SfUtility.outputLog(`SfMgr: Creating storage folders at ${this.globalStorage}`, null, debugLevel.debug);
            SfUtility.createFolder(this.globalStorage);
            SfUtility.createFolder(this.clusterFileStorage);

            //todo: https://github.com/Azure/azure-sdk-for-js/blob/main/documentation/MIGRATION-guide-for-next-generation-management-libraries.md
            // const credentials = new ClientSecretCredential(tenantId, clientId, this.clientSecret);
            
            SfUtility.outputLog('SfMgr: Loading cluster configurations (async)...', null, debugLevel.info);
            // Fire-and-forget: Load configs asynchronously, won't block activation
            this.loadSfConfigs().catch(err => {
                SfUtility.outputLog('SfMgr: Failed to load cluster configs', err, debugLevel.warn);
                // Non-fatal: Extension can still work without pre-configured clusters
            });
            
            // Listen for configuration changes to restart auto-refresh with new settings
            context.subscriptions.push(
                vscode.workspace.onDidChangeConfiguration(e => {
                    if (e.affectsConfiguration('sfClusterExplorer.autorefresh') || 
                        e.affectsConfiguration('sfClusterExplorer.refreshInterval')) {
                        SfUtility.outputLog('Auto-refresh settings changed, restarting timer', null, debugLevel.info);
                        this.sfClusterView.restartAutoRefresh();
                    }
                })
            );
            
            // Ensure cleanup on disposal
            context.subscriptions.push({
                dispose: () => this.sfClusterView.dispose()
            });
            
            SfUtility.outputLog('SfMgr: Constructor completed successfully', null, debugLevel.info);
        } catch (error) {
            SfUtility.outputLog('SfMgr: Constructor failed', error, debugLevel.error);
            throw error; // Re-throw so activation knows it failed
        }
    }

    private addSfConfig(sfConfig: SfConfiguration) {
        if (!this.sfConfigs.find((config: SfConfiguration) => config.getClusterEndpoint() === sfConfig.getClusterEndpoint())) {
            this.sfConfigs.push(sfConfig);
        }
    }
    
    /**
     * Refresh all connected clusters - called by auto-refresh timer
     * Only refreshes clusters that are actually displayed in the tree view
     */
    private async refreshAllClusters(): Promise<void> {
        // Get clusters that are actually in the tree view (has tree items)
        const visibleClusters = this.sfConfigs.filter(config => {
            const endpoint = config.getClusterEndpoint();
            // Check if this config has a corresponding tree item
            return this.sfClusterView.hasClusterInTree(endpoint);
        });
        
        SfUtility.outputLog(`Refreshing ${visibleClusters.length} visible cluster(s) (${this.sfConfigs.length} total configs loaded)`, null, debugLevel.info);
        
        for (const config of visibleClusters) {
            try {
                const endpoint = config.getClusterEndpoint();
                SfUtility.outputLog(`Refreshing cluster: ${endpoint}`, null, debugLevel.info);
                await this.clusterService.refreshCluster(config);
            } catch (error) {
                const endpoint = config.getClusterEndpoint();
                SfUtility.outputLog(`Failed to refresh cluster ${endpoint}`, error, debugLevel.warn);
                // Continue with other clusters even if one fails
            }
        }
        
        SfUtility.outputLog(`Completed refresh cycle`, null, debugLevel.info);
    }

    public async deployDevCluster() {
        return await this.sdkInstaller.deployDevCluster();
    }

    public async deployDevSecureCluster() {
        //todo implement
    }

    public async downloadSFSDK(): Promise<void> {
        return await this.sdkInstaller.downloadAndInstallSdk();
    }

    public async getCluster(clusterEndpoint: string, autoConnect: boolean = false): Promise<void> {
        if (!this.getSfConfig(clusterEndpoint)) {
            this.sfConfig = new SfConfiguration(this.context, { endpoint: clusterEndpoint });
            this.addSfConfig(this.sfConfig);
        } else {
            this.sfConfig = this.getSfConfig(clusterEndpoint)!;
        }

        // Create and add tree item BEFORE connecting (so it shows even if connection fails)
        try {
            this.sfClusterView.addClusterToTree(this.sfConfig, this.sfConfig.getSfRest());
        } catch (treeError) {
            SfUtility.outputLog('Failed to create tree view', treeError, debugLevel.error);
            if (!autoConnect) {
                SfUtility.showWarning(`Failed to create tree view. Check Output panel for details.`);
            }
            throw treeError; // Can't proceed without tree item
        }

        // Connect to cluster using service
        try {
            await this.clusterService.connectToCluster(this.sfConfig, this.sfRest, autoConnect);
            
            // Update tree with success and set as active
            this.sfClusterView.updateClusterInTree(clusterEndpoint, this.sfConfig);
            
            // Automatically set as active cluster
            this.setActiveCluster(clusterEndpoint, autoConnect);

            // Persist connected cluster in globalState
            this.persistConnectedCluster(clusterEndpoint);
        } catch (connectionError) {
            // Connection failed but keep tree item with error status
            SfUtility.outputLog('Failed to connect to cluster', connectionError, debugLevel.error);
            
            // Update tree with error status
            this.sfClusterView.updateClusterInTree(clusterEndpoint, this.sfConfig);
            
            throw connectionError; // Re-throw so caller knows it failed
        }
    }

    public async getClusters(): Promise<any> {
        //todo test
        // uses azure account to enumerate clusters
        if (!this.sfConfig.getClusterEndpoint() && !this.sfExtSecrets.getSecret(sfExtSecretList.sfRestCertificate) || !this.subscriptionId) {
            SfUtility.showWarning("Cluster secret or subscription id not set");
            if (!this.sfRest.azureConnect()) {
                SfUtility.showError("Azure account not connected");
                return null;
            }
        }
        await this.sfRest.getClusters()
            .then((data: unknown) => {
                const clusters = data as ApplicationInfo[];
                for (const cluster of clusters) {
                    this.sfClusters.push(cluster);
                    //todo test
                    this.addSfConfig(new SfConfiguration(this.context));
                }
            });
    }

    public getCurrentSfConfig(): SfConfiguration {
        return this.sfConfig;
    }
    
    public getSfConfig(clusterHttpEndpoint: string): SfConfiguration | undefined {
        return this.sfConfigs.find((config: SfConfiguration) => config.getClusterEndpoint() === clusterHttpEndpoint);
    }

    public getSfConfigs(): Array<SfConfiguration> {
        return this.sfConfigs;
    }

    public removeClusterFromTree(clusterEndpoint: string): void {
        SfUtility.outputLog(`Removing cluster from tree: ${clusterEndpoint}`, null, debugLevel.info);
        
        // Remove from tree view
        this.sfClusterView.removeClusterFromTree(clusterEndpoint);
        
        // Remove from persisted connected clusters
        this.removePersistedCluster(clusterEndpoint);
    }

    public setActiveCluster(clusterEndpoint: string, autoConnect: boolean = false): void {
        SfUtility.outputLog(`Setting active cluster: ${clusterEndpoint}`, null, debugLevel.info);
        
        const config = this.getSfConfig(clusterEndpoint);
        if (!config) {
            SfUtility.showError(`Cluster not found: ${clusterEndpoint}`);
            return;
        }
        
        this.sfConfig = config;
        this.sfRest = config.getSfRest();
        
        // Update tree to show active indicator
        this.sfClusterView.setActiveCluster(clusterEndpoint);
        
        // Persist active cluster
        SfUtility.saveExtensionConfig('activeCluster', clusterEndpoint);
        
        if (!autoConnect) {
            SfUtility.showInformation(`Active cluster set to: ${clusterEndpoint}`);
        }
        SfUtility.outputLog(`Active cluster is now: ${clusterEndpoint}`, null, debugLevel.info);
    }

    public getSfRest(): SfRest {
        // Return the current cluster's SfRest instance, not the global one
        // The global sfRest (this.sfRest) is just a template/default instance
        if (this.sfConfig) {
            return this.sfConfig.getSfRest();
        }
        return this.sfRest; // Fallback if no cluster is selected
    }

    /**
     * Get the active cluster's endpoint and REST client.
     * Returns undefined if no cluster is currently active/connected.
     */
    public getActiveCluster(): { endpoint: string; sfRest: SfRest } | undefined {
        const endpoint = SfUtility.readExtensionConfig('activeCluster') as string | undefined;
        if (!endpoint) { return undefined; }
        
        const config = this.getSfConfig(endpoint);
        if (!config) { return undefined; }
        
        return { endpoint, sfRest: config.getSfRest() };
    }

    public async loadSfConfigs(): Promise<void> {
        SfUtility.outputLog('Loading cluster configs from settings...', null, debugLevel.info);
        let clusters: clusterEndpointInfo[] | any = SfExtSettings.getSetting(sfExtSettingsList.clusters);
        
        if (!clusters || !Array.isArray(clusters)) {
            SfUtility.outputLog('No clusters found in settings or invalid format', null, debugLevel.warn);
            return;
        }

        // Normalize endpoints (add default port 19080) and deduplicate
        const seen = new Set<string>();
        const deduped: clusterEndpointInfo[] = [];
        for (const cluster of clusters) {
            if (cluster && cluster.endpoint) {
                cluster.endpoint = ClusterConnectionManager.normalizeEndpoint(cluster.endpoint);
                if (!seen.has(cluster.endpoint)) {
                    seen.add(cluster.endpoint);
                    deduped.push(cluster);
                } else {
                    SfUtility.outputLog(`loadSfConfigs: removing duplicate cluster: ${cluster.endpoint}`, null, debugLevel.info);
                }
            }
        }

        // Persist cleaned list if duplicates were removed
        if (deduped.length !== clusters.length) {
            SfUtility.outputLog(`loadSfConfigs: cleaned ${clusters.length - deduped.length} duplicate(s), saving`, null, debugLevel.info);
            const settings = vscode.workspace.getConfiguration('sfClusterExplorer');
            await settings.update(sfExtSettingsList.clusters, deduped, vscode.ConfigurationTarget.Global);
        }
        clusters = deduped;
        
        SfUtility.outputLog(`Found ${clusters.length} cluster(s) in settings`, null, debugLevel.info);
        
        // Clear existing configs to avoid duplicates on reload
        this.sfConfigs = [];
        
        for (const cluster of clusters) {
            SfUtility.outputLog(`  Loading cluster: ${cluster.endpoint}`, null, debugLevel.debug);
            this.addSfConfig(new SfConfiguration(this.context, cluster));
        }
        
        SfUtility.outputLog(`Loaded ${this.sfConfigs.length} cluster config(s)`, null, debugLevel.info);
    }

    public removeSfConfig(clusterHttpEndpoint: string) {
        const normalized = ClusterConnectionManager.normalizeEndpoint(clusterHttpEndpoint);
        const index = this.sfConfigs.findIndex((config: SfConfiguration) => config.getClusterEndpoint() === normalized);
        if (index > -1) {
            this.sfConfigs.splice(index, 1);
            SfUtility.outputLog('sfMgr:removeSfConfig:clusterHttpEndpoint removed:' + normalized);
        }
        else {
            SfUtility.outputLog('sfMgr:removeSfConfig:clusterHttpEndpoint not found:' + normalized);
        }
    }

    public async runPsCommand(command: string): Promise<string> {
        SfUtility.outputLog('runPsCommand: ' + command);
        const results = await this.ps.send(command);
        try {
            const response = JSON.parse(results);
            SfUtility.outputLog(`runPsCommand output:`, response);
            return response;
        } catch (parseError) {
            SfUtility.outputLog(`runPsCommand: Failed to parse JSON response. Raw output: ${results}`, parseError, debugLevel.warn);
            return results;
        }
    }

    /**
     * Auto-reconnect to previously connected clusters on activation.
     * Reads the persisted connected cluster list from globalState and
     * reconnects silently (no toast notifications). Called once during activation.
     */
    public async autoReconnectClusters(): Promise<void> {
        const autoReconnect = SfExtSettings.getSetting(sfExtSettingsList.autoReconnect);
        if (autoReconnect === false) {
            SfUtility.outputLog('Auto-reconnect disabled by setting', null, debugLevel.info);
            return;
        }

        let connectedClusters: string[] | undefined;
        try {
            connectedClusters = SfUtility.readExtensionConfig('connectedClusters') as string[] | undefined;
        } catch (error) {
            SfUtility.outputLog('Failed to read connected clusters from state (may be corrupted)', error, debugLevel.warn);
            // Clear corrupted state
            SfUtility.saveExtensionConfig('connectedClusters', undefined);
            return;
        }
        
        if (!connectedClusters || connectedClusters.length === 0) {
            SfUtility.outputLog('No previously connected clusters to restore', null, debugLevel.info);
            return;
        }

        SfUtility.outputLog(`Auto-reconnecting to ${connectedClusters.length} cluster(s): ${connectedClusters.join(', ')}`, null, debugLevel.info);

        const results = await Promise.allSettled(
            connectedClusters.map(endpoint => this.getCluster(endpoint, true))
        );

        let succeeded = 0;
        let failed = 0;
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            if (result.status === 'fulfilled') {
                succeeded++;
            } else {
                failed++;
                SfUtility.outputLog(`Auto-reconnect failed for ${connectedClusters[i]}: ${result.reason}`, null, debugLevel.warn);
            }
        }

        SfUtility.outputLog(`Auto-reconnect complete: ${succeeded} succeeded, ${failed} failed`, null, debugLevel.info);

        // Restore the last active cluster
        const lastActive = SfUtility.readExtensionConfig('activeCluster') as string | undefined;
        if (lastActive && connectedClusters.includes(lastActive)) {
            const activeResult = results[connectedClusters.indexOf(lastActive)];
            if (activeResult.status === 'fulfilled') {
                this.setActiveCluster(lastActive, true);
            }
        }
    }

    /**
     * Add a cluster endpoint to the persisted connected clusters list in globalState
     */
    private persistConnectedCluster(endpoint: string): void {
        const connected = (SfUtility.readExtensionConfig('connectedClusters') as string[] | undefined) || [];
        if (!connected.includes(endpoint)) {
            connected.push(endpoint);
            SfUtility.saveExtensionConfig('connectedClusters', connected);
            SfUtility.outputLog(`Persisted connected cluster: ${endpoint} (total: ${connected.length})`, null, debugLevel.debug);
        }
    }

    /**
     * Remove a cluster endpoint from the persisted connected clusters list in globalState
     */
    private removePersistedCluster(endpoint: string): void {
        const connected = (SfUtility.readExtensionConfig('connectedClusters') as string[] | undefined) || [];
        const index = connected.indexOf(endpoint);
        if (index !== -1) {
            connected.splice(index, 1);
            SfUtility.saveExtensionConfig('connectedClusters', connected);
            SfUtility.outputLog(`Removed persisted cluster: ${endpoint} (remaining: ${connected.length})`, null, debugLevel.debug);
        }

        // Clear active cluster if it was the removed one
        const activeCluster = SfUtility.readExtensionConfig('activeCluster') as string | undefined;
        if (activeCluster === endpoint) {
            SfUtility.saveExtensionConfig('activeCluster', undefined);
        }
    }

    /**
     * Cleanup resources when extension deactivates
     */
    public dispose(): void {
        try {
            SfUtility.outputLog('SfMgr disposing resources', null, debugLevel.info);
            // Cleanup will be expanded when we add more resources
            // For now, just log
        } catch (error) {
            SfUtility.outputLog('Error during SfMgr disposal', error, debugLevel.error);
        }
    }
}

