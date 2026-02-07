/**
 * View and UI command handlers.
 *
 * Consolidates all view-related commands that were previously scattered across:
 * - extension.ts  (refreshView, showManagementView, deployApp, showItemDetails)
 * - serviceFabricClusterView.ts constructor (reveal, changeTitle)
 * - SfTreeDataProvider.ts constructor (retryNode)
 *
 * Every command goes through `registerCommandWithErrorHandling` or
 * `safeRegisterCommand` for consistent error handling and double-registration
 * protection.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { SfMgr } from '../sfMgr';
import { SfUtility, debugLevel } from '../sfUtility';
import { registerCommandWithErrorHandling, safeRegisterCommand } from '../utils/CommandUtils';
import { ClusterMapView } from '../views/ClusterMapView';

export function registerViewCommands(
    context: vscode.ExtensionContext,
    sfMgr: SfMgr,
): void {

    // -----------------------------------------------------------------------
    // sfClusterExplorer.refresh  — activation-event command
    // Previously: declared in package.json but NEVER registered (bug!)
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.refresh',
        async () => {
            sfMgr.sfClusterView.refresh();
        },
        'refresh',
    );

    // -----------------------------------------------------------------------
    // serviceFabricClusterView.refreshView  — backward compat alias
    // Previously: registerSimpleCommand in extension.ts
    // -----------------------------------------------------------------------
    safeRegisterCommand(context, 'serviceFabricClusterView.refreshView', () => {
        sfMgr.sfClusterView.refresh();
    });

    // -----------------------------------------------------------------------
    // serviceFabricClusterView.reveal  — tree item reveal
    // Previously: raw registerCommand in legacy view constructor (no context.subscriptions)
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'serviceFabricClusterView.reveal',
        async () => {
            const key = await vscode.window.showInputBox({
                placeHolder: 'Type the label of the item to reveal',
            });
            if (key) {
                SfUtility.outputLog(`Reveal requested for: ${key}`, null, debugLevel.info);
            }
        },
        'reveal item',
    );

    // -----------------------------------------------------------------------
    // serviceFabricClusterView.changeTitle  — debug/test command
    // Previously: raw registerCommand in legacy view constructor (no context.subscriptions)
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'serviceFabricClusterView.changeTitle',
        async () => {
            const title = await vscode.window.showInputBox({
                prompt: 'Type the new title for the tree view',
                placeHolder: 'Service Fabric Clusters',
            });
            if (title) {
                SfUtility.outputLog(`Title change requested: ${title}`, null, debugLevel.info);
            }
        },
        'change title',
    );

    // -----------------------------------------------------------------------
    // sfClusterExplorer.retryNode  — retry failed tree node
    // Previously: raw registerCommand in SfTreeDataProvider constructor
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.retryNode',
        async (node: any) => {
            if (node && typeof node.invalidate === 'function') {
                node.invalidate();
                sfMgr.sfClusterView.refresh();
            }
        },
        'retry node',
    );

    // -----------------------------------------------------------------------
    // sfClusterExplorer.showManagementView
    // Previously: registerSimpleCommand in extension.ts
    // -----------------------------------------------------------------------
    safeRegisterCommand(context, 'sfClusterExplorer.showManagementView', () => {
        vscode.commands.executeCommand('serviceFabricManagementPanel.focus');
    });

    // -----------------------------------------------------------------------
    // sfClusterExplorer.deployApplicationFromContext
    // Previously: registerSimpleCommand in extension.ts
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.deployApplicationFromContext',
        async () => {
            await vscode.commands.executeCommand('serviceFabricManagementPanel.focus');
            SfUtility.showInformation('Use the Management panel to deploy applications');
        },
        'deploy application',
    );

    // -----------------------------------------------------------------------
    // sfClusterExplorer.showItemDetails  — tree-item click handler
    // Previously: inline in extension.ts (~700 lines)
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.showItemDetails',
        async (item: any) => {
            await handleShowItemDetails(context, sfMgr, item);
        },
        'show item details',
    );
}

// ===========================================================================
// showItemDetails implementation
// ===========================================================================

async function handleShowItemDetails(
    context: vscode.ExtensionContext,
    sfMgr: SfMgr,
    item: any,
): Promise<void> {
    SfUtility.outputLog(
        `showItemDetails called for: ${item?.label}`,
        { itemType: item?.itemType, itemId: item?.itemId },
        debugLevel.info,
    );

    if (!item?.itemType || !item?.itemId) {
        SfUtility.showWarning('No details available for this item');
        return;
    }

    const clusterEndpoint =
        item.clusterEndpoint || sfMgr.getCurrentSfConfig().getClusterEndpoint();
    if (!clusterEndpoint) {
        SfUtility.showWarning('No cluster endpoint available');
        return;
    }

    SfUtility.outputLog(
        `Fetching details for ${item.itemType}: ${item.itemId}`,
        null,
        debugLevel.info,
    );

    // Resolve the SfConfig for the specific cluster
    let sfConfig = sfMgr.getSfConfig(clusterEndpoint);
    if (!sfConfig) {
        SfUtility.showError(`Cluster configuration not found for: ${clusterEndpoint}`);
        return;
    }

    const sfRest = sfConfig.getSfRest();
    let details: any;

    switch (item.itemType) {
        // ---- Cluster-level items ----
        case 'details':
            details = await sfRest.getClusterUpgradeProgress();
            break;

        case 'essentials': {
            const [health, version, manifest] = await Promise.all([
                sfRest.getClusterHealth(),
                sfRest.getClusterVersion(),
                sfRest.getClusterManifest(),
            ]);
            details = {
                version,
                health,
                manifestSummary: {
                    name: (manifest as any).manifest ? 'Available' : 'N/A',
                },
            };
            break;
        }

        case 'metrics':
            details = await sfRest.getClusterLoadInformation();
            break;

        case 'commands':
            details = {
                message: 'Service Fabric Cluster Commands',
                description:
                    'Expand the commands tree to see available cluster management operations organized by category.',
                categories: [
                    'Cluster Operations',
                    'Application Lifecycle',
                    'Partition & Replica Operations',
                    'Testing & Chaos',
                    'Backup & Restore',
                    'Repair & Infrastructure',
                ],
                note: 'Click on individual commands to execute them with guided wizards, or right-click to generate a full reference guide.',
            };
            break;

        case 'command':
            await handleCommandGuide(sfRest, sfConfig, clusterEndpoint, item);
            return; // early exit — document shown inline

        case 'cluster-map': {
            SfUtility.outputLog('Opening cluster map webview', null, debugLevel.info);
            const clusterMapView = new ClusterMapView(context, sfRest, clusterEndpoint);
            await clusterMapView.show();
            return;
        }

        // ---- Image Store ----
        case 'image-store':
        case 'image-store-folder': {
            const imagePath = item.path || '';
            details = await sfRest.getImageStoreContent(imagePath);
            break;
        }
        case 'image-store-file':
            details = {
                path: item.path,
                size: item.size,
                version: item.version,
                modifiedDate: item.modifiedDate,
                displayName: item.label,
                isReserved: item.isReserved,
            };
            break;

        // ---- Node ----
        case 'node':
            details = await sfRest.getNodeInfo(item.itemId);
            break;

        // ---- Application ----
        case 'application':
            details = await sfRest.getApplicationInfo(item.itemId);
            break;

        // ---- Service ----
        case 'service':
            if (!item.applicationId) {
                throw new Error(`Service ${item.itemId} missing applicationId`);
            }
            try {
                details = await sfRest.getServiceInfo(item.itemId, item.applicationId);
            } catch (serviceError: any) {
                if (
                    serviceError.statusCode === 404 ||
                    serviceError.message?.includes('404')
                ) {
                    details = {
                        id: item.itemId,
                        name: item.label,
                        note: 'System service — full details not available via standard API.',
                        error: serviceError.message,
                    };
                } else {
                    throw serviceError;
                }
            }
            break;

        // ---- Manifest variants ----
        case 'manifest': {
            const manifestResp = await sfRest.getClusterManifest();
            if ((manifestResp as any).manifest) {
                sfConfig.setManifest(manifestResp);
                details = JSON.parse(sfConfig.getJsonManifest());
            } else {
                details = manifestResp;
            }
            break;
        }
        case 'application-manifest': {
            if (!item.applicationId) {
                throw new Error('Application manifest requires applicationId');
            }
            const appManifest = await sfRest.getApplicationManifest(item.applicationId);
            if (appManifest?.manifest) {
                const xmlConverter = require('xml-js');
                details = JSON.parse(
                    xmlConverter.xml2json(appManifest.manifest, { compact: true, spaces: 2 }),
                );
            } else {
                details = appManifest;
            }
            break;
        }
        case 'service-manifest': {
            if (!item.applicationId || !item.serviceId) {
                throw new Error('Service manifest requires applicationId and serviceId');
            }
            const svcManifest = await sfRest.getServiceManifest(item.serviceId, item.applicationId);
            if (svcManifest?.manifest) {
                const xmlConverter = require('xml-js');
                details = JSON.parse(
                    xmlConverter.xml2json(svcManifest.manifest, { compact: true, spaces: 2 }),
                );
            } else {
                details = svcManifest;
            }
            break;
        }

        // ---- Health / Events ----
        case 'health':
            details = await sfRest.getClusterHealth();
            break;
        case 'events': {
            const clusterEvents = await sfRest.getClusterEvents();
            details =
                !clusterEvents || clusterEvents.length === 0
                    ? {
                          message: 'No cluster events found in the last 24 hours',
                          note: 'Events are provided by the EventStore service.',
                      }
                    : clusterEvents;
            break;
        }
        case 'repair-tasks': {
            const repairTasks = await sfRest.getRepairTasks();
            details =
                !repairTasks || repairTasks.length === 0
                    ? {
                          message: 'No repair tasks found',
                          note: 'This is normal if no repairs are currently running or scheduled.',
                      }
                    : repairTasks;
            break;
        }

        // ---- Service health / events ----
        case 'service-health':
            if (!item.applicationId || !item.serviceId) {
                throw new Error('Service health requires applicationId and serviceId');
            }
            details = await sfRest.getServiceHealth(item.serviceId, item.applicationId);
            break;
        case 'service-events':
            if (!item.serviceId) {
                throw new Error('Service events requires serviceId');
            }
            details = await sfRest.getServiceEvents(item.serviceId);
            break;

        // ---- Partition ----
        case 'partition': {
            if (!item.applicationId || !item.serviceId) {
                throw new Error('Partition details require applicationId and serviceId');
            }
            const partitions = await sfRest.getServicePartitions(item.serviceId, item.applicationId);
            details =
                partitions.find((p: any) => p.partitionInformation?.id === item.itemId) || {
                    id: item.itemId,
                    serviceId: item.serviceId,
                };
            break;
        }
        case 'partition-health':
            if (!item.applicationId || !item.serviceId || !item.partitionId) {
                throw new Error('Partition health requires applicationId, serviceId, and partitionId');
            }
            details = await sfRest.getPartitionHealth(item.partitionId, item.serviceId, item.applicationId);
            break;
        case 'partition-events':
            if (!item.partitionId) {
                throw new Error('Partition events requires partitionId');
            }
            details = await sfRest.getPartitionEvents(item.partitionId);
            break;

        // ---- Replica ----
        case 'replica': {
            if (item.applicationId && item.serviceId && item.partitionId) {
                const replicas = await sfRest.getPartitionReplicas(
                    item.serviceId,
                    item.applicationId,
                    item.partitionId,
                );
                details =
                    replicas.find(
                        (r: any) =>
                            r.replicaId?.toString() === item.itemId ||
                            r.instanceId?.toString() === item.itemId,
                    ) || { id: item.itemId };
            } else {
                details = { id: item.itemId, note: 'Use partition view for full information' };
            }
            break;
        }
        case 'replica-health':
            if (!item.applicationId || !item.serviceId || !item.partitionId || !item.replicaId) {
                throw new Error('Replica health requires applicationId, serviceId, partitionId, and replicaId');
            }
            details = await sfRest.getReplicaHealth(item.replicaId, item.partitionId, item.serviceId, item.applicationId);
            break;
        case 'replica-events':
            if (!item.partitionId || !item.replicaId) {
                throw new Error('Replica events requires partitionId and replicaId');
            }
            details = await sfRest.getReplicaEvents(item.replicaId, item.partitionId);
            break;

        // ---- Deployed items ----
        case 'deployed-application': {
            if (!item.contextValue || !item.applicationId) {
                throw new Error('Deployed application requires node name and applicationId');
            }
            details = await sfRest.getDeployedApplicationInfo(item.contextValue, item.applicationId);
            break;
        }
        case 'deployed-service-package': {
            if (!item.contextValue || !item.applicationId) {
                throw new Error('Deployed service package requires contextValue and applicationId');
            }
            const pkgParts = item.contextValue.split('|');
            const packages = await sfRest.getDeployedServicePackages(pkgParts[0], pkgParts[1]);
            const manifestName = pkgParts[2] || item.itemId;
            details =
                packages.find(
                    (p: any) => p.serviceManifestName === manifestName || p.name === manifestName,
                ) || { serviceManifestName: manifestName };
            break;
        }
        case 'deployed-code-package': {
            if (!item.contextValue) {
                throw new Error('Deployed code package requires contextValue');
            }
            const codeParts = item.contextValue.split('|');
            const codePackages = await sfRest.getDeployedCodePackages(
                codeParts[0],
                codeParts[1],
                codeParts[2],
            );
            details =
                codePackages.find(
                    (p: any) => p.codePackageName === item.itemId || p.name === item.itemId,
                ) || { codePackageName: item.itemId };
            break;
        }
        case 'deployed-replica': {
            if (item.contextValue && item.partitionId) {
                const repParts = item.contextValue.split('|');
                const replicas = await sfRest.getDeployedReplicas(repParts[0], repParts[1], repParts[2]);
                details =
                    replicas.find(
                        (r: any) =>
                            r.replicaId?.toString() === item.itemId ||
                            r.instanceId?.toString() === item.itemId,
                    ) || { replicaId: item.itemId };
            } else {
                details = {
                    replicaId: item.replicaId || item.itemId,
                    partitionId: item.partitionId,
                    note: 'Deployed replica — full details require partition context',
                };
            }
            break;
        }

        default:
            SfUtility.showWarning(`Unknown item type: ${item.itemType}`);
            return;
    }

    // ----- Write JSON to file and open -----
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const clusterName = clusterEndpoint.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${item.itemType}-${timestamp}.json`;
    const dirPath = path.join(context.globalStorageUri.fsPath, clusterName);

    await vscode.workspace.fs.createDirectory(vscode.Uri.file(dirPath));
    const filePath = path.join(dirPath, fileName);
    await vscode.workspace.fs.writeFile(
        vscode.Uri.file(filePath),
        new TextEncoder().encode(JSON.stringify(details, null, 2)),
    );

    const doc = await vscode.workspace.openTextDocument(filePath);
    await vscode.window.showTextDocument(doc, { preview: true });
}

// ===========================================================================
// Command-guide dispatch (PowerShell / Azure CLI / Operational)
// ===========================================================================

async function handleCommandGuide(
    sfRest: any,
    sfConfig: any,
    clusterEndpoint: string,
    item: any,
): Promise<void> {
    const id = item.itemId as string;

    // Map of command IDs → async generator functions
    const generators: Record<string, () => Promise<string>> = {
        // PowerShell guides
        'connect-cluster-guide': async () => {
            const { PowerShellCommandGenerator } = await import('../services/PowerShellCommandGenerator');
            return PowerShellCommandGenerator.generateConnectionCommands(
                clusterEndpoint,
                sfConfig?.getClientCertificateThumbprint(),
                sfConfig?.getServerCertificateThumbprint(),
            );
        },
        'cluster-diagnostics-guide': async () => {
            const { PowerShellCommandGenerator } = await import('../services/PowerShellCommandGenerator');
            const [nodes, apps] = await Promise.all([
                sfRest.getNodes().catch(() => []),
                sfRest.getApplications().catch(() => []),
            ]);
            return PowerShellCommandGenerator.generateClusterDiagnostics(
                clusterEndpoint,
                nodes.map((n: any) => n.name || n.nodeName),
                apps.map((a: any) => a.name || a.id),
            );
        },
        'node-management-guide': async () => {
            const { PowerShellCommandGenerator } = await import('../services/PowerShellCommandGenerator');
            const nodes = await sfRest.getNodes();
            return PowerShellCommandGenerator.generateNodeCommands(
                clusterEndpoint,
                nodes.map((n: any) => n.name || n.nodeName),
            );
        },
        'application-management-guide': async () => {
            const { PowerShellCommandGenerator } = await import('../services/PowerShellCommandGenerator');
            const apps = await sfRest.getApplications().catch(() => []);
            return PowerShellCommandGenerator.generateApplicationCommands(
                clusterEndpoint,
                apps.map((a: any) => a.name || a.id),
            );
        },
    };

    // Operational commands (OperationalCommandsGenerator)
    const operationalGenerators: Record<string, () => Promise<string>> = {
        'start-cluster-upgrade': async () => {
            const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator');
            const nodes = await sfRest.getNodes().catch(() => []);
            return OperationalCommandsGenerator.generateStartClusterUpgrade(clusterEndpoint, nodes);
        },
        'rollback-cluster-upgrade': async () => {
            const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator');
            return OperationalCommandsGenerator.generateRollbackClusterUpgrade(clusterEndpoint);
        },
        'update-cluster-config': async () => {
            const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator');
            return OperationalCommandsGenerator.generateUpdateClusterConfig(clusterEndpoint);
        },
        'recover-system-partitions': async () => {
            const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator');
            return OperationalCommandsGenerator.generateRecoverSystemPartitions(clusterEndpoint);
        },
        'reset-partition-loads': async () => {
            const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator');
            return OperationalCommandsGenerator.generateResetPartitionLoads(clusterEndpoint);
        },
        'provision-app-type': async () => {
            const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator');
            return OperationalCommandsGenerator.generateProvisionApplicationType(clusterEndpoint);
        },
        'create-application': async () => {
            const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator');
            const appTypes = await sfRest.getApplicationTypes().catch(() => []);
            return OperationalCommandsGenerator.generateCreateApplication(clusterEndpoint, appTypes);
        },
        'start-app-upgrade': async () => {
            const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator');
            const apps = await sfRest.getApplications().catch(() => []);
            return OperationalCommandsGenerator.generateStartApplicationUpgrade(clusterEndpoint, apps);
        },
        'rollback-app-upgrade': async () => {
            const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator');
            return OperationalCommandsGenerator.generateRollbackApplicationUpgrade(clusterEndpoint);
        },
        'move-primary-replica': async () => {
            const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator');
            return OperationalCommandsGenerator.generateMovePrimaryReplica(clusterEndpoint);
        },
        'move-secondary-replica': async () => {
            const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator');
            return OperationalCommandsGenerator.generateMoveSecondaryReplica(clusterEndpoint);
        },
        'reset-partition-load': async () => {
            const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator');
            return OperationalCommandsGenerator.generateResetPartitionLoad(clusterEndpoint);
        },
        'report-health': async () => {
            const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator');
            return OperationalCommandsGenerator.generateReportHealth(clusterEndpoint);
        },
        'start-chaos': async () => {
            const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator');
            return OperationalCommandsGenerator.generateStartChaos(clusterEndpoint);
        },
        'stop-chaos': async () => {
            const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator');
            return OperationalCommandsGenerator.generateStopChaos(clusterEndpoint);
        },
        'query-chaos-events': async () => {
            const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator');
            return OperationalCommandsGenerator.generateQueryChaosEvents(clusterEndpoint);
        },
        'restart-partition': async () => {
            const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator');
            return OperationalCommandsGenerator.generateRestartPartition(clusterEndpoint);
        },
        'enable-backup': async () => {
            const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator');
            return OperationalCommandsGenerator.generateEnableBackup(clusterEndpoint);
        },
        'disable-backup': async () => {
            const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator');
            return OperationalCommandsGenerator.generateDisableBackup(clusterEndpoint);
        },
        'trigger-backup': async () => {
            const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator');
            return OperationalCommandsGenerator.generateTriggerBackup(clusterEndpoint);
        },
        'get-backup-progress': async () => {
            const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator');
            return OperationalCommandsGenerator.generateGetBackupProgress(clusterEndpoint);
        },
        'restore-backup': async () => {
            const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator');
            return OperationalCommandsGenerator.generateRestoreBackup(clusterEndpoint);
        },
        'view-repair-tasks': async () => {
            const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator');
            return OperationalCommandsGenerator.generateViewRepairTasks(clusterEndpoint);
        },
        'create-repair-task': async () => {
            const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator');
            return OperationalCommandsGenerator.generateCreateRepairTask(clusterEndpoint);
        },
        'cancel-repair-task': async () => {
            const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator');
            return OperationalCommandsGenerator.generateCancelRepairTask(clusterEndpoint);
        },
        'force-approve-repair': async () => {
            const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator');
            return OperationalCommandsGenerator.generateForceApproveRepair(clusterEndpoint);
        },
    };

    // Azure CLI commands
    const azureCliGenerators: Record<string, () => Promise<string>> = {
        'az-sf-install-extension': async () => {
            const { AzureCliCommandGenerator } = await import('../services/AzureCliCommandGenerator');
            return AzureCliCommandGenerator.generateSetupGuide(clusterEndpoint);
        },
        'az-sf-cluster-select': async () => {
            const { AzureCliCommandGenerator } = await import('../services/AzureCliCommandGenerator');
            return AzureCliCommandGenerator.generateSetupGuide(clusterEndpoint);
        },
        'az-login': async () => {
            const { AzureCliCommandGenerator } = await import('../services/AzureCliCommandGenerator');
            return AzureCliCommandGenerator.generateSetupGuide(clusterEndpoint);
        },
        'az-sf-cluster-health': async () => {
            const { AzureCliCommandGenerator } = await import('../services/AzureCliCommandGenerator');
            return AzureCliCommandGenerator.generateClusterHealthCommand(clusterEndpoint);
        },
        'az-sf-cluster-manifest': async () => {
            const { AzureCliCommandGenerator } = await import('../services/AzureCliCommandGenerator');
            return AzureCliCommandGenerator.generateClusterManifestCommand(clusterEndpoint);
        },
        'az-sf-node-list': async () => {
            const { AzureCliCommandGenerator } = await import('../services/AzureCliCommandGenerator');
            return AzureCliCommandGenerator.generateNodeListCommand(clusterEndpoint);
        },
        'az-sf-application-list': async () => {
            const { AzureCliCommandGenerator } = await import('../services/AzureCliCommandGenerator');
            return AzureCliCommandGenerator.generateApplicationListCommand(clusterEndpoint);
        },
        'az-sf-application-health': async () => {
            const { AzureCliCommandGenerator } = await import('../services/AzureCliCommandGenerator');
            return AzureCliCommandGenerator.generateApplicationHealthCommand(clusterEndpoint);
        },
        'az-sf-application-delete': async () => {
            const { AzureCliCommandGenerator } = await import('../services/AzureCliCommandGenerator');
            return AzureCliCommandGenerator.generateApplicationDeleteCommand(clusterEndpoint);
        },
        'az-sf-service-list': async () => {
            const { AzureCliCommandGenerator } = await import('../services/AzureCliCommandGenerator');
            return AzureCliCommandGenerator.generateServiceListCommand(clusterEndpoint);
        },
        'az-sf-query-guide': async () => {
            const { AzureCliCommandGenerator } = await import('../services/AzureCliCommandGenerator');
            return AzureCliCommandGenerator.generateQueryGuide(clusterEndpoint);
        },
    };

    // Merge all generator maps
    const allGenerators = { ...generators, ...operationalGenerators, ...azureCliGenerators };
    const gen = allGenerators[id];

    if (gen) {
        const markdown = await gen();
        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
        await vscode.window.showTextDocument(doc, { preview: false });
    } else {
        // Fallback — unknown command type
        SfUtility.outputLog(`Unknown command guide id: ${id}`, null, debugLevel.warn);
        const doc = await vscode.workspace.openTextDocument({
            content: JSON.stringify(
                { message: 'Command', description: `Command: ${id}`, note: 'This command will open a wizard to execute the operation' },
                null,
                2,
            ),
            language: 'json',
        });
        await vscode.window.showTextDocument(doc, { preview: false });
    }
}
