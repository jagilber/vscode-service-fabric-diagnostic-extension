/**
 * Cluster-related command handlers
 * Commands for connecting to clusters, managing endpoints, and cluster operations
 */

import * as vscode from 'vscode';
import { SfMgr } from '../sfMgr';
import { SfPrompts } from '../sfPrompts';
import { registerCommandWithErrorHandling } from '../utils/CommandUtils';

export function registerClusterCommands(
    context: vscode.ExtensionContext,
    sfMgr: SfMgr,
    sfPrompts: SfPrompts
): void {
    // Get clusters from Azure subscription
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.sfGetClusters',
        async () => {
            await sfMgr.getClusters();
        },
        'get clusters'
    );
    
    // Connect to a cluster
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.sfGetCluster',
        async () => {
            await sfPrompts.promptForGetClusterEndpoint(sfMgr);
        },
        'connect to cluster'
    );
    
    // Deploy local dev cluster
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.sfDeployDevCluster',
        async () => {
            await sfMgr.deployDevCluster();
        },
        'deploy dev cluster'
    );
    
    // Add cluster endpoint to settings
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.sfSetClusterEndpoint',
        async () => {
            await sfPrompts.promptForAddClusterEndpoint();
        },
        'add cluster endpoint'
    );
    
    // Remove cluster endpoint from settings
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.sfRemoveClusterEndpoint',
        async () => {
            await sfPrompts.promptForRemoveClusterEndpoint();
        },
        'remove cluster endpoint'
    );
    
    // Remove cluster from tree view (context menu)
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.removeClusterFromTree',
        async (item: any) => {
            if (!item || !item.clusterEndpoint) {
                throw new Error('Cannot remove cluster: invalid tree item');
            }
            
            const clusterEndpoint = item.clusterEndpoint;
            const confirmed = await vscode.window.showWarningMessage(
                `Remove cluster "${clusterEndpoint}" from tree view?`,
                { modal: true },
                'Remove'
            );
            
            if (confirmed === 'Remove') {
                sfMgr.removeClusterFromTree(clusterEndpoint);
                vscode.window.showInformationMessage(`Cluster removed from tree: ${clusterEndpoint}`);
            }
        },
        'remove cluster from tree'
    );
    
    // Set active cluster (context menu)
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.setActiveCluster',
        async (item: any) => {
            if (!item || !item.clusterEndpoint) {
                throw new Error('Cannot set active cluster: invalid tree item');
            }
            
            const clusterEndpoint = item.clusterEndpoint;
            sfMgr.setActiveCluster(clusterEndpoint);
        },
        'set active cluster'
    );
    
    // Open Service Fabric Explorer (SFX) in browser
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.openSfx',
        async (item: any) => {
            if (!item || !item.clusterEndpoint) {
                throw new Error('Cannot open SFX: invalid tree item');
            }
            const sfxUrl = `${item.clusterEndpoint}/Explorer/index.html`;
            const browser = vscode.workspace.getConfiguration('sfClusterExplorer').get<string>('sfxBrowser', 'simple');
            if (browser === 'external') {
                await vscode.env.openExternal(vscode.Uri.parse(sfxUrl));
            } else {
                await vscode.commands.executeCommand('simpleBrowser.show', sfxUrl);
            }
        },
        'open SFX'
    );

    // Execute custom REST call
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.sfSetClusterRestCall',
        async () => {
            await sfPrompts.promptForClusterRestCall(sfMgr);
        },
        'execute REST call'
    );
    
    // Reset extension state (recovery from corrupted state)
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.resetExtensionState',
        async () => {
            const confirmed = await vscode.window.showWarningMessage(
                'This will reset all extension state including connected clusters and active cluster selection. Continue?',
                { modal: true },
                'Reset State'
            );
            
            if (confirmed === 'Reset State') {
                // Clear all state keys
                await context.globalState.update('connectedClusters', undefined);
                await context.globalState.update('activeCluster', undefined);
                await context.globalState.update('clusterConfigs', undefined);
                
                vscode.window.showInformationMessage(
                    'Extension state has been reset. Please reload VS Code and reconnect to your clusters.'
                );
            }
        },
        'reset extension state'
    );

    // Enable/disable per-cluster auto-refresh (context menu on cluster node)
    const REFRESH_DISABLED_KEY = 'sfClusterExplorer.refreshDisabledClusters';
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.enableClusterRefresh',
        async (item: any) => {
            if (!item || !item.clusterEndpoint) {
                throw new Error('Cannot enable refresh: invalid tree item');
            }
            const endpoint = item.clusterEndpoint;
            const disabled = context.globalState.get<string[]>(REFRESH_DISABLED_KEY, []);
            const idx = disabled.indexOf(endpoint);
            if (idx >= 0) {
                disabled.splice(idx, 1);
                await context.globalState.update(REFRESH_DISABLED_KEY, disabled);
            }
            sfMgr.sfClusterView.setClusterRefreshDisabled(endpoint, false);
            vscode.window.showInformationMessage(`Auto-refresh enabled for ${endpoint}`);
        },
        'enable cluster refresh'
    );

    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.disableClusterRefresh',
        async (item: any) => {
            if (!item || !item.clusterEndpoint) {
                throw new Error('Cannot disable refresh: invalid tree item');
            }
            const endpoint = item.clusterEndpoint;
            const disabled = context.globalState.get<string[]>(REFRESH_DISABLED_KEY, []);
            if (!disabled.includes(endpoint)) {
                disabled.push(endpoint);
                await context.globalState.update(REFRESH_DISABLED_KEY, disabled);
            }
            sfMgr.sfClusterView.setClusterRefreshDisabled(endpoint, true);
            vscode.window.showInformationMessage(`Auto-refresh disabled for ${endpoint}`);
        },
        'disable cluster refresh'
    );

    // Keep toggle command for backward compat / command palette
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.toggleClusterRefresh',
        async (item: any) => {
            if (!item || !item.clusterEndpoint) {
                throw new Error('Cannot toggle refresh: invalid tree item');
            }
            const endpoint = item.clusterEndpoint;
            const disabled = context.globalState.get<string[]>(REFRESH_DISABLED_KEY, []);
            const isDisabled = disabled.includes(endpoint);
            if (isDisabled) {
                await vscode.commands.executeCommand('sfClusterExplorer.enableClusterRefresh', item);
            } else {
                await vscode.commands.executeCommand('sfClusterExplorer.disableClusterRefresh', item);
            }
        },
        'toggle cluster refresh'
    );
}
