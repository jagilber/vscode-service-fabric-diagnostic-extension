/**
 * Node management command handlers
 * Commands for managing Service Fabric nodes (activate, deactivate, restart, etc.)
 */

import * as vscode from 'vscode';
import { SfMgr } from '../sfMgr';
import { SfUtility, debugLevel } from '../sfUtility';
import { registerCommandWithErrorHandling, withProgress } from '../utils/CommandUtils';
import { ItemTypes } from '../constants/ItemTypes';

export function registerNodeCommands(
    context: vscode.ExtensionContext,
    sfMgr: SfMgr
): void {
    // Manage node from context menu
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.manageNodeFromContext',
        async (item: any) => {
            // Debug logging
            SfUtility.outputLog(`manageNodeFromContext called with item:`, null, debugLevel.info);
            SfUtility.outputLog(`  label: ${item.label}`, null, debugLevel.info);
            SfUtility.outputLog(`  itemId: ${item.itemId}`, null, debugLevel.info);
            SfUtility.outputLog(`  itemType: ${item.itemType}`, null, debugLevel.info);
            SfUtility.outputLog(`  contextValue: ${item.contextValue}`, null, debugLevel.info);
            
            const nodeName = item.itemId || item.label;
            
            // Extract just the node name if label has parentheses
            const cleanNodeName = nodeName.includes('(') ? nodeName.split('(')[0].trim() : nodeName;
            
            SfUtility.outputLog(`  Using node name: ${cleanNodeName}`, null, debugLevel.info);
            
            const actions = [
                { label: 'Activate Node', value: 'activate' },
                { label: 'Deactivate Node (Pause)', value: 'deactivate-pause' },
                { label: 'Deactivate Node (Restart)', value: 'deactivate-restart' },
                { label: 'Deactivate Node (Remove Data)', value: 'deactivate-removedata' },
                { label: 'Restart Node', value: 'restart' },
                { label: 'Remove Node State', value: 'remove-state' }
            ];
            
            const choice = await vscode.window.showQuickPick(actions, {
                placeHolder: `Select action for node: ${cleanNodeName}`
            });
            
            if (!choice) {
                return;
            }

            // Execute the operation
            const sfRest = sfMgr.getSfRest();
            if (!sfRest) {
                throw new Error('Not connected to cluster');
            }

            await withProgress(`${choice.label}...`, async () => {
                switch (choice.value) {
                    case 'activate':
                        await sfRest.activateNode(cleanNodeName);
                        vscode.window.showInformationMessage(`Node ${cleanNodeName} activated successfully`);
                        break;
                    case 'deactivate-pause':
                        await sfRest.deactivateNode(cleanNodeName, 'Pause');
                        vscode.window.showInformationMessage(`Node ${cleanNodeName} deactivated (Pause) successfully`);
                        break;
                    case 'deactivate-restart':
                        await sfRest.deactivateNode(cleanNodeName, 'Restart');
                        vscode.window.showInformationMessage(`Node ${cleanNodeName} deactivated (Restart) successfully`);
                        break;
                    case 'deactivate-removedata':
                        await sfRest.deactivateNode(cleanNodeName, 'RemoveData');
                        vscode.window.showInformationMessage(`Node ${cleanNodeName} deactivated (RemoveData) successfully`);
                        break;
                    case 'restart':
                        await sfRest.restartNode(cleanNodeName);
                        vscode.window.showInformationMessage(`Node ${cleanNodeName} restarted successfully`);
                        break;
                    case 'remove-state':
                        const confirm = await vscode.window.showWarningMessage(
                            `Remove state for node ${cleanNodeName}? This is a destructive operation.`,
                            { modal: true },
                            'Remove State'
                        );
                        if (confirm === 'Remove State') {
                            await sfRest.removeNodeState(cleanNodeName);
                            vscode.window.showInformationMessage(`Node state removed for ${cleanNodeName}`);
                        }
                        break;
                }
                
                // Refresh tree view after operation
                setTimeout(() => sfMgr.sfClusterView.refresh(), 1000);
            });
        },
        'manage node'
    );
}
