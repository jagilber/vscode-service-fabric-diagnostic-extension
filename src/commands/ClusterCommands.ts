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
            if (!item || !item.label) {
                throw new Error('Cannot remove cluster: invalid tree item');
            }
            
            const clusterEndpoint = item.label;
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
            if (!item || !item.label) {
                throw new Error('Cannot set active cluster: invalid tree item');
            }
            
            const clusterEndpoint = item.label;
            sfMgr.setActiveCluster(clusterEndpoint);
        },
        'set active cluster'
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
}
