import * as vscode from 'vscode';
import { debugLevel, SfUtility } from './sfUtility';
import { SfConfiguration, clusterEndpointInfo, clusterCertificate } from './sfConfiguration';
import { SfExtSettings, sfExtSettingsList } from './sfExtSettings';
import { SfRest } from './sfRest';
import { SfMgr } from './sfMgr';
import { ClusterConnectionError } from './models/Errors';

export class SfPrompts {
    private exampleClusterEndpoint = "https://sftestcluster.eastus.cloudapp.azure.com:19080";
    private exampleClusterCertificate = "*.contoso.com or 1234567890ABCDEF1234567890ABCDEF12345678";
    private sfConfig: SfConfiguration;
    private sfRest: SfRest;

    public constructor(context: vscode.ExtensionContext) {
        this.sfConfig = new SfConfiguration(context);
        this.sfRest = new SfRest(context);
    }

    public async promptForAddClusterEndpoint() {
        const clusterEndpoint: string | undefined = await vscode.window.showInputBox({
            prompt: "Enter cluster endpoint to add to saved list",
            placeHolder: this.exampleClusterEndpoint
        });

        if (!clusterEndpoint) { return; }

        // Only prompt for certificate if HTTPS endpoint
        const isHttps = clusterEndpoint.toLowerCase().startsWith('https');
        let clusterCertificate: string | undefined;
        
        if (isHttps) {
            clusterCertificate = await vscode.window.showInputBox({
                prompt: "Enter cluster thumbprint, or common name, if any",
                placeHolder: this.exampleClusterCertificate
            });
        }

        this.sfConfig.setClusterEndpoint(clusterEndpoint);

        if (clusterCertificate) {
            this.sfConfig.setClusterCertificate(clusterCertificate);
        }
        
        const clusterInfo = this.sfConfig.getClusterEndpointInfo();
        SfExtSettings.updateSetting(sfExtSettingsList.clusters, clusterInfo);
        SfUtility.outputLog(`Cluster endpoint saved to settings: ${JSON.stringify(clusterInfo)}`, null, debugLevel.info);
        SfUtility.showInformation(`Cluster endpoint saved. Use 'Service Fabric: Get Cluster' to connect.`);
    }

    public async promptForClusterRestCall(sfMgr: SfMgr) {
        try {
            const adhocRestCall: string | undefined = await vscode.window.showInputBox({
                prompt: "Enter cluster REST call",
                placeHolder: "/$/GetClusterHealth"
            });

            SfUtility.activateOutputChannel();
            if (!adhocRestCall) { return; }

            if (!this.sfConfig.getClusterEndpoint()) {
                await this.promptForGetClusterEndpoint(sfMgr);
            }
            if (!this.sfConfig.getClusterEndpoint()) {
                await this.promptForAddClusterEndpoint();
            }

            if (!this.sfConfig.getClusterEndpoint()) { 
                SfUtility.showWarning('No cluster endpoint configured');
                return; 
            }
            
            this.sfRest.connectToCluster(
                sfMgr.getCurrentSfConfig().getClusterEndpoint()!, 
                sfMgr.getCurrentSfConfig().getClusterCertificate()!
            );
            
            try {
                const data = await this.sfRest.invokeRestApi(
                    "GET", 
                    this.sfConfig.getClusterEndpoint()!, 
                    adhocRestCall
                );
                SfUtility.outputLog('Ad-hoc REST call result:', JSON.parse(data as string));
                SfUtility.showInformation('REST call completed successfully');
            } catch (restError) {
                SfUtility.outputLog('Ad-hoc REST call failed', restError, debugLevel.error);
                SfUtility.showError(`REST call failed: ${restError instanceof Error ? restError.message : String(restError)}`);
            }
        } catch (error) {
            SfUtility.outputLog('Error in promptForClusterRestCall', error, debugLevel.error);
            SfUtility.showError(`Failed to execute REST call: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    public async promptForGetClusterEndpoint(sfMgr: SfMgr) {
        try {
            // IMPORTANT: Reload configs from settings to pick up any newly added clusters
            SfUtility.outputLog('Reloading cluster configs from settings...', null, debugLevel.info);
            await sfMgr.loadSfConfigs();
            
            const quickPickItems: Array<vscode.QuickPickItem> = [];
            sfMgr.getSfConfigs().forEach((cluster: SfConfiguration) => {
                quickPickItems.push({
                    label: cluster.getClusterEndpoint() as string,
                    description: cluster.getClusterCertificate()?.thumbprint,
                    detail: cluster.getClusterCertificate()?.commonName,
                    kind: vscode.QuickPickItemKind.Default
                });
            });

            let clusterEndpointValue: string | undefined;

            if (quickPickItems.length === 0) {
                // No clusters configured, allow manual entry
                clusterEndpointValue = await vscode.window.showInputBox({
                    prompt: "Enter cluster endpoint (no clusters configured yet)",
                    placeHolder: this.exampleClusterEndpoint
                });
                
                if (!clusterEndpointValue) {
                    SfUtility.showInformation('No cluster endpoint entered');
                    return;
                }
            } else {
                // Show existing clusters
                const clusterEndpoint: vscode.QuickPickItem | undefined = await vscode.window.showQuickPick(quickPickItems, {
                    title: "Select cluster endpoint to enumerate",
                    placeHolder: this.exampleClusterEndpoint,
                    canPickMany: false
                });

                if (!clusterEndpoint) {
                    SfUtility.showInformation('No cluster selected');
                    return;
                }
                
                clusterEndpointValue = clusterEndpoint.label;
            }

            this.sfConfig.setClusterEndpoint(clusterEndpointValue);
            
            try {
                await sfMgr?.getCluster(clusterEndpointValue);
                // Connection successful
            } catch (clusterError) {
                // Connection failed, but cluster was added to tree with error status
                SfUtility.outputLog('Failed to connect to cluster (added to tree with error status)', clusterError, debugLevel.warn);
                SfUtility.showWarning(`Failed to connect to cluster: ${clusterEndpointValue}. Cluster added to tree with error status.`);
                // Don't re-throw - cluster is in tree, user can try to reconnect or remove it
            }
        } catch (error) {
            SfUtility.outputLog('Error in promptForGetClusterEndpoint', error, debugLevel.error);
            SfUtility.showError(`Failed to select cluster: ${error instanceof Error ? error.message : String(error)}`);
        }
    }


    public async promptForRemoveClusterEndpoint() {
        try {
            // Get all configured clusters
            let clusters: clusterEndpointInfo[] | any = SfExtSettings.getSetting(sfExtSettingsList.clusters);
            
            if (!clusters || !Array.isArray(clusters) || clusters.length === 0) {
                SfUtility.showWarning('No clusters configured to remove');
                return;
            }

            // Clean up corrupted data (flatten nested arrays, remove duplicates)
            clusters = this.cleanupClustersArray(clusters);
            SfUtility.outputLog(`Cleaned clusters array: ${clusters.length} unique clusters`, null, debugLevel.info);

            // Create quick pick items from configured clusters
            const quickPickItems: Array<vscode.QuickPickItem> = clusters.map((cluster: clusterEndpointInfo) => ({
                label: cluster.endpoint,
                description: cluster.clusterCertificate?.thumbprint || cluster.clusterCertificate?.commonName || 'No certificate',
                detail: `Configured cluster`
            }));

            // Show selection list
            const selectedCluster = await vscode.window.showQuickPick(quickPickItems, {
                title: 'Select cluster endpoint to remove',
                placeHolder: 'Choose a cluster to remove from saved list',
                canPickMany: false
            });

            if (!selectedCluster) {
                SfUtility.showInformation('No cluster selected for removal');
                return;
            }

            const endpointToRemove = selectedCluster.label;

            // Confirm removal
            const confirmation = await vscode.window.showWarningMessage(
                `Remove cluster endpoint: ${endpointToRemove}?`,
                { modal: true },
                'Yes, Remove',
                'Cancel'
            );

            if (confirmation !== 'Yes, Remove') {
                SfUtility.showInformation('Cluster removal cancelled');
                return;
            }

            // Remove from settings - directly update, don't use updateSetting
            const updatedClusters = clusters.filter((cluster: clusterEndpointInfo) => 
                cluster.endpoint !== endpointToRemove
            );

            // Directly update settings (bypass updateSetting which is for adding items)
            const settings = vscode.workspace.getConfiguration('sfClusterExplorer');
            await settings.update(sfExtSettingsList.clusters, updatedClusters, vscode.ConfigurationTarget.Global);

            SfUtility.outputLog(`Updated clusters array. Old length: ${clusters.length}, New length: ${updatedClusters.length}`, null, debugLevel.info);

            // Verify removal
            const verifySettings = SfExtSettings.getSetting(sfExtSettingsList.clusters);
            const stillExists = Array.isArray(verifySettings) && 
                verifySettings.some((cluster: clusterEndpointInfo) => cluster.endpoint === endpointToRemove);

            if (stillExists) {
                SfUtility.outputLog(`Failed to remove cluster: ${endpointToRemove}`, null, debugLevel.error);
                SfUtility.showError(`Failed to remove cluster endpoint: ${endpointToRemove}`);
            } else {
                SfUtility.outputLog(`Successfully removed cluster: ${endpointToRemove}`, null, debugLevel.info);
                SfUtility.showInformation(`✓ Cluster endpoint removed: ${endpointToRemove}`);
            }
        } catch (error) {
            SfUtility.outputLog('Error in promptForRemoveClusterEndpoint', error, debugLevel.error);
            SfUtility.showError(`Failed to remove cluster: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Clean up corrupted clusters array (flatten nested arrays, remove duplicates)
     */
    private cleanupClustersArray(clusters: any[]): clusterEndpointInfo[] {
        const flattened: clusterEndpointInfo[] = [];
        const seen = new Set<string>();

        const flatten = (items: any[]) => {
            for (const item of items) {
                if (Array.isArray(item)) {
                    // Recursively flatten nested arrays
                    flatten(item);
                } else if (item && typeof item === 'object' && item.endpoint) {
                    // Valid cluster object with endpoint
                    if (!seen.has(item.endpoint)) {
                        seen.add(item.endpoint);
                        flattened.push(item as clusterEndpointInfo);
                    } else {
                        SfUtility.outputLog(`Removing duplicate cluster: ${item.endpoint}`, null, debugLevel.info);
                    }
                }
            }
        };

        flatten(clusters);
        
        // If we cleaned anything, save the cleaned array
        if (flattened.length !== clusters.length || clusters.some(c => Array.isArray(c))) {
            SfUtility.outputLog(`Cleaned up clusters: removed ${clusters.length - flattened.length} duplicates/nested arrays`, null, debugLevel.info);
            const settings = vscode.workspace.getConfiguration('sfClusterExplorer');
            settings.update(sfExtSettingsList.clusters, flattened, vscode.ConfigurationTarget.Global);
        }

        return flattened;
    }
}