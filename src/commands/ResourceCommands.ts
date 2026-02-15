/**
 * Resource management command handlers
 * Commands for managing Service Fabric resources (applications, services, replicas)
 */

import * as vscode from 'vscode';
import { SfMgr } from '../sfMgr';
import { SfUtility, debugLevel } from '../sfUtility';
import { ItemTypes, ServiceKinds } from '../constants/ItemTypes';
import { registerCommandWithErrorHandling, withProgress, confirmWithTypedText } from '../utils/CommandUtils';
import { DeployTracker } from '../services/DeployTracker';
import { SfDeployService } from '../services/SfDeployService';

export function registerResourceCommands(
    context: vscode.ExtensionContext,
    sfMgr: SfMgr
): void {
    // Restart Replica (Stateful only)
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.restartReplica',
        async (item: any) => {
            if (!item || item.itemType !== ItemTypes.REPLICA) {
                throw new Error('This command is only available for replicas');
            }

            // Check if this is a stateful service
            if (item.serviceKind !== ServiceKinds.STATEFUL) {
                throw new Error(`Restart is only available for stateful services. For ${item.serviceKind || 'stateless'} services, use "Delete Replica/Instance" instead.`);
            }

            if (!item.nodeName || !item.partitionId || !item.itemId) {
                throw new Error('Missing required replica information (nodeName, partitionId, replicaId)');
            }

            const replicaId = item.itemId;
            const replicaLabel = item.label || replicaId;

            // Show confirmation dialog
            const choice = await vscode.window.showWarningMessage(
                `Restart replica ${replicaLabel}?\n\nThis will restart the replica process on node ${item.nodeName}.`,
                { modal: true },
                'Restart',
                'Cancel'
            );

            if (choice !== 'Restart') {
                return;
            }

            await withProgress('Restarting Replica', async () => {
                const sfRest = sfMgr.getCurrentSfConfig().getSfRest();
                await sfRest.restartReplica(item.nodeName, item.partitionId, replicaId);

                vscode.window.showInformationMessage(`Replica ${replicaLabel} restarted successfully`);
                
                // Refresh tree view
                await vscode.commands.executeCommand('serviceFabricClusterView.refreshView');
            });
        },
        'restart replica'
    );

    // Delete Replica/Instance (works for both stateful and stateless)
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.deleteReplica',
        async (item: any) => {
            if (!item || item.itemType !== ItemTypes.REPLICA) {
                throw new Error('This command is only available for replicas');
            }

            if (!item.nodeName || !item.partitionId || !item.itemId) {
                throw new Error('Missing required replica information (nodeName, partitionId, replicaId)');
            }

            const replicaId = item.itemId;
            const replicaLabel = item.label || replicaId;
            const itemName = item.serviceKind === ServiceKinds.STATELESS ? 'instance' : 'replica';

            // Require typed confirmation
            const confirmed = await confirmWithTypedText(
                `Delete ${itemName} ${replicaLabel}? Type the ${itemName} ID to confirm deletion:`,
                replicaId
            );

            if (!confirmed) {
                return;
            }

            await withProgress(`Deleting ${itemName.charAt(0).toUpperCase() + itemName.slice(1)}`, async () => {
                const sfRest = sfMgr.getCurrentSfConfig().getSfRest();
                await sfRest.deleteReplica(item.nodeName, item.partitionId, replicaId);

                vscode.window.showInformationMessage(`${itemName.charAt(0).toUpperCase() + itemName.slice(1)} ${replicaLabel} deleted successfully`);
                
                // Refresh tree view
                await vscode.commands.executeCommand('serviceFabricClusterView.refreshView');
            });
        },
        'delete replica'
    );

    // Delete Service
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.deleteService',
        async (item: any) => {
            if (!item || item.itemType !== ItemTypes.SERVICE) {
                throw new Error('This command is only available for services');
            }

            if (!item.itemId) {
                throw new Error('Missing required service information (serviceId)');
            }

            const serviceId = item.itemId;
            const serviceName = item.label || serviceId;

            // Require typed confirmation
            const confirmed = await confirmWithTypedText(
                `Delete service ${serviceName}? Type the service name to confirm deletion:`,
                serviceName
            );

            if (!confirmed) {
                return;
            }

            await withProgress('Deleting Service', async () => {
                const sfRest = sfMgr.getCurrentSfConfig().getSfRest();
                await sfRest.deleteService(serviceId);

                vscode.window.showInformationMessage(`Service ${serviceName} deleted successfully`);
                
                // Refresh tree view
                await vscode.commands.executeCommand('serviceFabricClusterView.refreshView');
            });
        },
        'delete service'
    );

    // Delete Application
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.deleteApplication',
        async (item: any) => {
            SfUtility.outputLog(`ResourceCommands.deleteApplication: invoked with item=${JSON.stringify({ itemType: item?.itemType, itemId: item?.itemId, label: item?.label })}`, null, debugLevel.info);
            if (!item || item.itemType !== ItemTypes.APPLICATION) {
                throw new Error('This command is only available for applications');
            }

            if (!item.itemId) {
                throw new Error('Missing required application information (applicationId)');
            }

            const applicationId = item.itemId;
            const applicationName = item.label || applicationId;
            SfUtility.outputLog(`ResourceCommands.deleteApplication: applicationId=${applicationId} applicationName=${applicationName}`, null, debugLevel.info);

            // Require typed confirmation
            const confirmed = await confirmWithTypedText(
                `Delete application ${applicationName}? This will delete all services. Type the application name to confirm:`,
                applicationName
            );

            if (!confirmed) {
                SfUtility.outputLog('ResourceCommands.deleteApplication: user cancelled confirmation', null, debugLevel.info);
                return;
            }

            SfUtility.outputLog('ResourceCommands.deleteApplication: user confirmed, proceeding with delete', null, debugLevel.info);

            const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
            const tracker = new DeployTracker(workspaceRoot, 'remove', applicationName, '', applicationName);
            tracker.startPhase('Delete Application');

            await withProgress('Deleting Application', async () => {
                const sfConfig = sfMgr.getCurrentSfConfig();
                SfUtility.outputLog(`ResourceCommands.deleteApplication: cluster=${sfConfig.getClusterEndpoint()}`, null, debugLevel.info);
                const sfRest = sfConfig.getSfRest();
                
                SfUtility.outputLog(`ResourceCommands.deleteApplication: calling sfRest.deleteApplication(${applicationId})`, null, debugLevel.info);
                try {
                    await sfRest.deleteApplication(applicationId);
                    tracker.completePhase('Delete Application');
                } catch (err) {
                    tracker.failPhase('Delete Application', err instanceof Error ? err.message : String(err));
                    tracker.finishOperation(false, err instanceof Error ? err.message : String(err));
                    throw err;
                }
                SfUtility.outputLog(`ResourceCommands.deleteApplication: delete completed successfully for ${applicationId}`, null, debugLevel.info);
                tracker.skipPhase('Unprovision Type', 'Delete only');
                tracker.finishOperation(true, `Deleted ${applicationName}`);

                vscode.window.showInformationMessage(`Application ${applicationName} deleted successfully`);
                
                // Refresh tree view
                await vscode.commands.executeCommand('serviceFabricClusterView.refreshView');
            });
        },
        'delete application'
    );

    // Unprovision Application Type
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.unprovisionApplicationType',
        async (item: any) => {
            SfUtility.outputLog(`ResourceCommands.unprovisionApplicationType: invoked with item=${JSON.stringify({ itemType: item?.itemType, typeName: item?.typeName, typeVersion: item?.typeVersion, typeInfoVersion: item?.typeInfo?.version, label: item?.label })}`, null, debugLevel.info);
            if (!item || item.itemType !== ItemTypes.APPLICATION_TYPE) {
                SfUtility.outputLog(`ResourceCommands.unprovisionApplicationType: invalid itemType=${item?.itemType}, expected=${ItemTypes.APPLICATION_TYPE}`, null, debugLevel.error);
                throw new Error('This command is only available for application types');
            }

            // Resolve from direct property, typeInfo (tree node), or command arguments
            const typeName = item.typeName || item.command?.arguments?.[0]?.typeName;
            const typeVersion = item.typeVersion || item.typeInfo?.version || item.command?.arguments?.[0]?.typeVersion;

            if (!typeName || !typeVersion) {
                SfUtility.outputLog(`ResourceCommands.unprovisionApplicationType: missing typeName=${typeName} or typeVersion=${typeVersion}`, null, debugLevel.error);
                throw new Error('Missing required application type information (typeName, typeVersion)');
            }
            SfUtility.outputLog(`ResourceCommands.unprovisionApplicationType: typeName=${typeName} typeVersion=${typeVersion}`, null, debugLevel.info);

            // Require typed confirmation
            const confirmed = await confirmWithTypedText(
                `Unprovision application type ${typeName}:${typeVersion}? Type the version to confirm:`,
                typeVersion
            );

            if (!confirmed) {
                SfUtility.outputLog('ResourceCommands.unprovisionApplicationType: user cancelled confirmation', null, debugLevel.info);
                return;
            }

            SfUtility.outputLog('ResourceCommands.unprovisionApplicationType: user confirmed, proceeding with unprovision', null, debugLevel.info);

            const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
            const tracker = new DeployTracker(workspaceRoot, 'remove', typeName, typeVersion, `fabric:/${typeName}`);
            await withProgress('Unprovisioning Application Type', async () => {
                const sfConfig = sfMgr.getCurrentSfConfig();
                SfUtility.outputLog(`ResourceCommands.unprovisionApplicationType: cluster=${sfConfig.getClusterEndpoint()}`, null, debugLevel.info);
                const sfRest = sfConfig.getSfRest();

                // Check for running instances before unprovision
                SfUtility.outputLog(`ResourceCommands.unprovisionApplicationType: checking for running instances of ${typeName} v${typeVersion}`, null, debugLevel.info);
                let runningApps: any[] = [];
                try {
                    runningApps = await sfRest.getApplicationsByType(typeName, typeVersion);
                    SfUtility.outputLog(`ResourceCommands.unprovisionApplicationType: found ${runningApps.length} running instance(s)`, null, debugLevel.info);
                } catch (checkError) {
                    SfUtility.outputLog('ResourceCommands.unprovisionApplicationType: failed to check running instances (proceeding anyway)', checkError, debugLevel.warn);
                }

                // If running instances exist, ask user to delete them first
                if (runningApps.length > 0) {
                    const appNames = runningApps.map((a: any) => a.Name || a.name || a.Id || a.id).join(', ');
                    SfUtility.outputLog(`ResourceCommands.unprovisionApplicationType: running instances exist: ${appNames}`, null, debugLevel.warn);
                    const choice = await vscode.window.showWarningMessage(
                        `Cannot unprovision ${typeName}:${typeVersion} — ${runningApps.length} running instance(s) found: ${appNames}. Delete them first?`,
                        { modal: true },
                        'Delete & Unprovision',
                        'Cancel'
                    );
                    if (choice !== 'Delete & Unprovision') {
                        SfUtility.outputLog('ResourceCommands.unprovisionApplicationType: user cancelled (running instances)', null, debugLevel.info);
                        tracker.skipPhase('Delete Application', 'User cancelled');
                        tracker.skipPhase('Unprovision Type', 'User cancelled');
                        tracker.finishOperation(false, 'Cancelled — running instances exist');
                        return;
                    }

                    // Delete running instances
                    tracker.startPhase('Delete Application');
                    for (const app of runningApps) {
                        const appId = app.Id || app.id || app.Name?.replace('fabric:/', '') || app.name?.replace('fabric:/', '');
                        SfUtility.outputLog(`ResourceCommands.unprovisionApplicationType: deleting application ${appId}`, null, debugLevel.info);
                        await sfRest.deleteApplication(appId);
                        SfUtility.outputLog(`ResourceCommands.unprovisionApplicationType: deleted application ${appId}`, null, debugLevel.info);
                    }
                    tracker.completePhase('Delete Application');
                } else {
                    tracker.skipPhase('Delete Application', 'No running instances');
                }

                tracker.startPhase('Unprovision Type');
                SfUtility.outputLog(`ResourceCommands.unprovisionApplicationType: calling sfRest.unprovisionApplicationType(${typeName}, ${typeVersion})`, null, debugLevel.info);
                try {
                    await sfRest.unprovisionApplicationType(typeName, typeVersion);
                    tracker.completePhase('Unprovision Type');
                    tracker.finishOperation(true, `Unprovisioned ${typeName}:${typeVersion}`);
                } catch (err) {
                    tracker.failPhase('Unprovision Type', err instanceof Error ? err.message : String(err));
                    tracker.finishOperation(false, err instanceof Error ? err.message : String(err));
                    throw err;
                }
                SfUtility.outputLog(`ResourceCommands.unprovisionApplicationType: unprovision completed successfully for ${typeName}:${typeVersion}`, null, debugLevel.info);

                vscode.window.showInformationMessage(`Application type ${typeName}:${typeVersion} unprovisioned successfully`);
                
                // Refresh tree view
                await vscode.commands.executeCommand('serviceFabricClusterView.refreshView');
            });
        },
        'unprovision application type'
    );
}
