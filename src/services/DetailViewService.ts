/**
 * DetailViewService — registry-based dispatcher for tree item detail views.
 *
 * Replaces the monolithic switch statement in ViewCommands.ts with a
 * handler-per-entity-type pattern.  Each handler is a small function
 * that fetches REST data and returns a JSON-serialisable result.
 *
 * Usage:
 *   const service = new DetailViewService(context);
 *   await service.show(sfMgr, item);
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { SfMgr } from '../sfMgr';
import { SfUtility, debugLevel } from '../sfUtility';
import { ClusterMapView } from '../views/ClusterMapView';

// ── Types ──────────────────────────────────────────────────────────────

/** Context passed to every detail handler */
export interface DetailContext {
    sfRest: any;
    sfConfig: any;
    item: any;
    clusterEndpoint: string;
    context: vscode.ExtensionContext;
}

/** A handler returns JSON-serialisable detail data, or void to skip file creation */
type DetailHandler = (ctx: DetailContext) => Promise<any>;

// ── Normalisation map ──────────────────────────────────────────────────

const NORMALISE_MAP: Record<string, string> = {
    'svc-health': 'service-health',
    'svc-events': 'service-events',
    'svc-manifest': 'service-manifest',
    'part-health': 'partition-health',
    'part-events': 'partition-events',
    'rep-health': 'replica-health',
    'rep-events': 'replica-events',
    'app-health': 'application-health',
    'app-events': 'application-events',
    'app-manifest': 'application-manifest',
};

function normaliseItemType(raw: string): string {
    const colonIdx = raw.indexOf(':');
    return colonIdx >= 0
        ? (NORMALISE_MAP[raw.substring(0, colonIdx)] ?? raw)
        : (NORMALISE_MAP[raw] ?? raw);
}

// ── Detail handlers ────────────────────────────────────────────────────

// Cluster-level
const clusterHandlers: Record<string, DetailHandler> = {
    'details': async ({ sfRest }) => sfRest.getClusterUpgradeProgress(),

    'essentials': async ({ sfRest }) => {
        const [health, version, manifest] = await Promise.all([
            sfRest.getClusterHealth(),
            sfRest.getClusterVersion(),
            sfRest.getClusterManifest(),
        ]);
        return {
            version,
            health,
            manifestSummary: { name: (manifest as any).manifest ? 'Available' : 'N/A' },
        };
    },

    'metrics': async ({ sfRest }) => sfRest.getClusterLoadInformation(),

    'commands': async () => ({
        message: 'Service Fabric Cluster Commands',
        description: 'Expand the commands tree to see available cluster management operations organized by category.',
        categories: ['Cluster Operations', 'Application Lifecycle', 'Partition & Replica Operations', 'Testing & Chaos', 'Backup & Restore', 'Repair & Infrastructure'],
        note: 'Click on individual commands to execute them with guided wizards, or right-click to generate a full reference guide.',
    }),

    'cluster': async ({ sfRest }) => {
        const [health, version] = await Promise.all([
            sfRest.getClusterHealth(),
            sfRest.getClusterVersion(),
        ]);
        return { health, version };
    },

    'health': async ({ sfRest }) => sfRest.getClusterHealth(),

    'events': async ({ sfRest }) => {
        const clusterEvents = await sfRest.getClusterEvents();
        return (!clusterEvents || clusterEvents.length === 0)
            ? { message: 'No cluster events found in the last 24 hours', note: 'Events are provided by the EventStore service.' }
            : clusterEvents;
    },

    'repair-tasks': async ({ sfRest }) => {
        const repairTasks = await sfRest.getRepairTasks();
        return (!repairTasks || repairTasks.length === 0)
            ? { message: 'No repair tasks found', note: 'This is normal if no repairs are currently running or scheduled.' }
            : repairTasks;
    },
};

// Application type
const applicationTypeHandlers: Record<string, DetailHandler> = {
    'application-type': async ({ sfRest, item }) => {
        const typeName = item.typeName || item.itemId;
        const appTypes = await sfRest.getApplicationTypes();
        return appTypes.find((t: any) => t.name === typeName) || { name: typeName, version: item.typeVersion };
    },
};

// Group nodes
const groupHandlers: Record<string, DetailHandler> = {
    'nodes-group': async ({ sfRest }) => sfRest.getNodes(),

    'applications-group': async ({ sfRest }) => {
        const [appTypes, apps] = await Promise.all([
            sfRest.getApplicationTypes(),
            sfRest.getApplications(),
        ]);
        return { applicationTypes: appTypes, applications: apps };
    },

    'system-group': async ({ sfRest }) => sfRest.getSystemServices('System'),

    'partitions-group': async ({ sfRest, item }) => {
        if (!item.applicationId || !item.serviceId) { throw new Error('Partitions group requires applicationId and serviceId'); }
        return sfRest.getServicePartitions(item.serviceId, item.applicationId);
    },

    'replicas-group': async ({ sfRest, item }) => {
        if (!item.applicationId || !item.serviceId || !item.partitionId) { throw new Error('Replicas group requires applicationId, serviceId, and partitionId'); }
        return sfRest.getPartitionReplicas(item.serviceId, item.applicationId, item.partitionId);
    },
};

// Node
const nodeHandlers: Record<string, DetailHandler> = {
    'node': async ({ sfRest, item }) => {
        const nodeName = item.nodeName || item.itemId;
        return sfRest.getNodeInfo(nodeName);
    },

    'node-health': async ({ sfRest, item }) => {
        const nodeName = item.nodeName || item.itemId;
        if (!nodeName) { throw new Error('Node health requires nodeName'); }
        return sfRest.getNodeHealth(nodeName);
    },

    'node-events': async ({ item }) => {
        const nodeName = item.nodeName || item.itemId;
        if (!nodeName) { throw new Error('Node events requires nodeName'); }
        return {
            nodeName, message: 'Node events are available through the EventStore service.',
            note: 'Use the cluster-level events view to see all events, or query the EventStore REST API directly.',
        };
    },
};

// Application
const applicationHandlers: Record<string, DetailHandler> = {
    'application': async ({ sfRest, item }) =>
        sfRest.getApplicationInfo(item.applicationId || item.itemId),

    'application-health': async ({ sfRest, item }) => {
        const appId = item.applicationId || item.itemId;
        if (!appId) { throw new Error('Application health requires applicationId'); }
        return sfRest.getApplicationHealth(appId);
    },

    'application-events': async ({ item }) => {
        const appId = item.applicationId || item.itemId;
        if (!appId) { throw new Error('Application events requires applicationId'); }
        return {
            applicationId: appId, message: 'Application events are available through the EventStore service.',
            note: 'Use the cluster-level events view to see all events, or query the EventStore REST API directly.',
        };
    },
};

// Service
const serviceHandlers: Record<string, DetailHandler> = {
    'service': async ({ sfRest, item }) => {
        const serviceId = item.serviceId || item.itemId;
        if (!item.applicationId) { throw new Error(`Service ${serviceId} missing applicationId`); }
        try {
            return await sfRest.getServiceInfo(serviceId, item.applicationId);
        } catch (err: any) {
            if (err.statusCode === 404 || err.message?.includes('404')) {
                return { id: serviceId, name: item.label, note: 'System service — full details not available via standard API.', error: err.message };
            }
            throw err;
        }
    },

    'service-health': async ({ sfRest, item }) => {
        if (!item.applicationId || !item.serviceId) { throw new Error('Service health requires applicationId and serviceId'); }
        return sfRest.getServiceHealth(item.serviceId, item.applicationId);
    },

    'service-events': async ({ sfRest, item }) => {
        if (!item.serviceId) { throw new Error('Service events requires serviceId'); }
        return sfRest.getServiceEvents(item.serviceId);
    },
};

// Manifest variants
const manifestHandlers: Record<string, DetailHandler> = {
    'manifest': async ({ sfRest, sfConfig }) => {
        const manifestResp = await sfRest.getClusterManifest();
        if ((manifestResp as any).manifest) {
            sfConfig.setManifest(manifestResp);
            try {
                return JSON.parse(sfConfig.getJsonManifest());
            } catch (parseError) {
                return { rawManifest: sfConfig.getJsonManifest(), parseError: String(parseError) };
            }
        }
        return manifestResp;
    },

    'application-manifest': async ({ sfRest, item }) => {
        if (!item.applicationId) { throw new Error('Application manifest requires applicationId'); }
        const appManifest = await sfRest.getApplicationManifest(item.applicationId);
        if (appManifest?.manifest) {
            try {
                const xmlConverter = require('xml-js');
                return JSON.parse(xmlConverter.xml2json(appManifest.manifest, { compact: true, spaces: 2 }));
            } catch (parseError) {
                return { rawManifest: appManifest.manifest, parseError: String(parseError) };
            }
        }
        return appManifest;
    },

    'service-manifest': async ({ sfRest, item }) => {
        if (!item.applicationId || !item.serviceId) { throw new Error('Service manifest requires applicationId and serviceId'); }
        const svcManifest = await sfRest.getServiceManifest(item.serviceId, item.applicationId);
        if (svcManifest?.manifest) {
            try {
                const xmlConverter = require('xml-js');
                return JSON.parse(xmlConverter.xml2json(svcManifest.manifest, { compact: true, spaces: 2 }));
            } catch (parseError) {
                return { rawManifest: svcManifest.manifest, parseError: String(parseError) };
            }
        }
        return svcManifest;
    },
};

// Partition & Replica
const partitionReplicaHandlers: Record<string, DetailHandler> = {
    'partition': async ({ sfRest, item }) => {
        if (!item.applicationId || !item.serviceId) { throw new Error('Partition details require applicationId and serviceId'); }
        const partitions = await sfRest.getServicePartitions(item.serviceId, item.applicationId);
        return partitions.find((p: any) => p.partitionInformation?.id === item.itemId) || { id: item.itemId, serviceId: item.serviceId };
    },

    'partition-health': async ({ sfRest, item }) => {
        if (!item.applicationId || !item.serviceId || !item.partitionId) { throw new Error('Partition health requires applicationId, serviceId, and partitionId'); }
        return sfRest.getPartitionHealth(item.partitionId, item.serviceId, item.applicationId);
    },

    'partition-events': async ({ sfRest, item }) => {
        if (!item.partitionId) { throw new Error('Partition events requires partitionId'); }
        return sfRest.getPartitionEvents(item.partitionId);
    },

    'replica': async ({ sfRest, item }) => {
        if (item.applicationId && item.serviceId && item.partitionId) {
            const replicas = await sfRest.getPartitionReplicas(item.serviceId, item.applicationId, item.partitionId);
            return replicas.find((r: any) => r.replicaId?.toString() === item.itemId || r.instanceId?.toString() === item.itemId) || { id: item.itemId };
        }
        return { id: item.itemId, note: 'Use partition view for full information' };
    },

    'replica-health': async ({ sfRest, item }) => {
        if (!item.applicationId || !item.serviceId || !item.partitionId || !item.replicaId) { throw new Error('Replica health requires applicationId, serviceId, partitionId, and replicaId'); }
        return sfRest.getReplicaHealth(item.replicaId, item.partitionId, item.serviceId, item.applicationId);
    },

    'replica-events': async ({ sfRest, item }) => {
        if (!item.partitionId || !item.replicaId) { throw new Error('Replica events requires partitionId and replicaId'); }
        return sfRest.getReplicaEvents(item.replicaId, item.partitionId);
    },
};

// Image Store
const imageStoreHandlers: Record<string, DetailHandler> = {
    'image-store': async ({ sfRest, item }) => sfRest.getImageStoreContent(item.path || ''),
    'image-store-folder': async ({ sfRest, item }) => sfRest.getImageStoreContent(item.path || ''),
    'image-store-file': async ({ item }) => ({
        path: item.path, size: item.size, version: item.version,
        modifiedDate: item.modifiedDate, displayName: item.label, isReserved: item.isReserved,
    }),
};

// Deployed items
const deployedHandlers: Record<string, DetailHandler> = {
    'deployed-application': async ({ sfRest, item }) => {
        const nodeName = item.nodeName || item.contextValue;
        const appId = item.applicationId;
        if (!nodeName || !appId) { throw new Error('Deployed application requires node name and applicationId'); }
        return sfRest.getDeployedApplicationInfo(nodeName, appId);
    },

    'deployed-service-package': async ({ sfRest, item }) => {
        let nodeName: string, appId: string, manifestName: string;
        if (item.nodeName && item.applicationId && item.serviceManifestName) {
            nodeName = item.nodeName; appId = item.applicationId; manifestName = item.serviceManifestName;
        } else if (item.contextValue) {
            const parts = item.contextValue.split('|');
            nodeName = parts[0]; appId = parts[1]; manifestName = parts[2] || item.itemId;
        } else {
            throw new Error('Deployed service package requires nodeName, applicationId, and serviceManifestName');
        }
        const packages = await sfRest.getDeployedServicePackages(nodeName, appId);
        return packages.find((p: any) => p.serviceManifestName === manifestName || p.name === manifestName) || { serviceManifestName: manifestName };
    },

    'deployed-code-package': async ({ sfRest, item }) => {
        let nodeName: string, appId: string, manifestName: string, codePkgName: string;
        if (item.nodeName && item.applicationId && item.serviceManifestName) {
            nodeName = item.nodeName; appId = item.applicationId; manifestName = item.serviceManifestName; codePkgName = item.codePackageName || item.itemId;
        } else if (item.contextValue) {
            const parts = item.contextValue.split('|');
            nodeName = parts[0]; appId = parts[1]; manifestName = parts[2]; codePkgName = item.itemId;
        } else {
            throw new Error('Deployed code package requires nodeName, applicationId, and serviceManifestName');
        }
        const codePackages = await sfRest.getDeployedCodePackages(nodeName, appId, manifestName);
        return codePackages.find((p: any) => p.codePackageName === codePkgName || p.name === codePkgName) || { codePackageName: codePkgName };
    },

    'deployed-replica': async ({ sfRest, item }) => {
        let nodeName: string | undefined, appId: string | undefined, manifestName: string | undefined;
        if (item.nodeName && item.applicationId && item.serviceManifestName) {
            nodeName = item.nodeName; appId = item.applicationId; manifestName = item.serviceManifestName;
        } else if (item.contextValue) {
            const parts = item.contextValue.split('|');
            nodeName = parts[0]; appId = parts[1]; manifestName = parts[2];
        }
        if (nodeName && appId && manifestName && item.partitionId) {
            const replicas = await sfRest.getDeployedReplicas(nodeName, appId, manifestName);
            return replicas.find((r: any) => r.replicaId?.toString() === item.itemId || r.instanceId?.toString() === item.itemId) || { replicaId: item.itemId };
        }
        return { replicaId: item.replicaId || item.itemId, partitionId: item.partitionId, note: 'Deployed replica — full details require partition context' };
    },
};

// ── Merged handler registry ────────────────────────────────────────────

const HANDLER_REGISTRY: Record<string, DetailHandler> = {
    ...clusterHandlers,
    ...groupHandlers,
    ...applicationTypeHandlers,
    ...nodeHandlers,
    ...applicationHandlers,
    ...serviceHandlers,
    ...manifestHandlers,
    ...partitionReplicaHandlers,
    ...imageStoreHandlers,
    ...deployedHandlers,
};

// ── Service class ──────────────────────────────────────────────────────

export class DetailViewService {
    constructor(private readonly extensionContext: vscode.ExtensionContext) {}

    /**
     * Show details for a tree item by dispatching to the registered handler.
     * Special cases (command guides, cluster map) are handled inline.
     */
    async show(sfMgr: SfMgr, item: any): Promise<void> {
        const itemId = item?.itemId || item?.id;
        const itemType = item?.itemType;

        SfUtility.outputLog(
            `showItemDetails called for: ${item?.label ?? itemType}`,
            { itemType, itemId },
            debugLevel.info,
        );

        if (!itemType || !itemId) {
            SfUtility.showWarning('No details available for this item');
            return;
        }

        item.itemId = itemId;

        const clusterEndpoint = item.clusterEndpoint || sfMgr.getCurrentSfConfig().getClusterEndpoint();
        if (!clusterEndpoint) { SfUtility.showWarning('No cluster endpoint available'); return; }

        SfUtility.outputLog(`Fetching details for ${itemType}: ${itemId}`, null, debugLevel.info);

        const sfConfig = sfMgr.getSfConfig(clusterEndpoint);
        if (!sfConfig) { SfUtility.showError(`Cluster configuration not found for: ${clusterEndpoint}`); return; }

        const sfRest = sfConfig.getSfRest();
        const normalisedItemType = normaliseItemType(itemType);

        // ── Special cases (no JSON file) ──
        if (normalisedItemType === 'command') {
            await handleCommandGuide(sfRest, sfConfig, clusterEndpoint, item);
            return;
        }

        if (normalisedItemType === 'cluster-map') {
            SfUtility.outputLog('Opening cluster map webview', null, debugLevel.info);
            const clusterMapView = new ClusterMapView(this.extensionContext, sfRest, clusterEndpoint);
            await clusterMapView.show();
            return;
        }

        // ── Dispatch to handler ──
        const handler = HANDLER_REGISTRY[normalisedItemType];
        if (!handler) {
            SfUtility.showWarning(`Unknown item type: ${normalisedItemType} (raw: ${itemType})`);
            return;
        }

        const ctx: DetailContext = { sfRest, sfConfig, item, clusterEndpoint, context: this.extensionContext };
        const details = await handler(ctx);

        // Write result to JSON and open
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
        const clusterName = clusterEndpoint.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `${normalisedItemType}-${timestamp}.json`;
        const dirPath = path.join(this.extensionContext.globalStorageUri.fsPath, clusterName);

        await vscode.workspace.fs.createDirectory(vscode.Uri.file(dirPath));
        const filePath = path.join(dirPath, fileName);
        await vscode.workspace.fs.writeFile(
            vscode.Uri.file(filePath),
            new TextEncoder().encode(JSON.stringify(details, null, 2)),
        );

        const doc = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(doc, { preview: true });
    }
}

// ── Command-guide dispatch (unchanged logic, private to module) ────────

async function handleCommandGuide(sfRest: any, sfConfig: any, clusterEndpoint: string, item: any): Promise<void> {
    const id = item.itemId as string;

    const generators: Record<string, () => Promise<string>> = {
        'connect-cluster-guide': async () => {
            const { PowerShellCommandGenerator } = await import('../services/PowerShellCommandGenerator');
            return PowerShellCommandGenerator.generateConnectionCommands(clusterEndpoint, sfConfig?.getClientCertificateThumbprint(), sfConfig?.getServerCertificateThumbprint());
        },
        'cluster-diagnostics-guide': async () => {
            const { PowerShellCommandGenerator } = await import('../services/PowerShellCommandGenerator');
            const [nodes, apps] = await Promise.all([sfRest.getNodes().catch(() => []), sfRest.getApplications().catch(() => [])]);
            return PowerShellCommandGenerator.generateClusterDiagnostics(clusterEndpoint, nodes.map((n: any) => n.name || n.nodeName), apps.map((a: any) => a.name || a.id));
        },
        'node-management-guide': async () => {
            const { PowerShellCommandGenerator } = await import('../services/PowerShellCommandGenerator');
            const nodes = await sfRest.getNodes();
            return PowerShellCommandGenerator.generateNodeCommands(clusterEndpoint, nodes.map((n: any) => n.name || n.nodeName));
        },
        'application-management-guide': async () => {
            const { PowerShellCommandGenerator } = await import('../services/PowerShellCommandGenerator');
            const apps = await sfRest.getApplications().catch(() => []);
            return PowerShellCommandGenerator.generateApplicationCommands(clusterEndpoint, apps.map((a: any) => a.name || a.id));
        },
    };

    const operationalGenerators: Record<string, () => Promise<string>> = {
        'start-cluster-upgrade': async () => { const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator'); const nodes = await sfRest.getNodes().catch(() => []); return OperationalCommandsGenerator.generateStartClusterUpgrade(clusterEndpoint, nodes); },
        'rollback-cluster-upgrade': async () => { const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator'); return OperationalCommandsGenerator.generateRollbackClusterUpgrade(clusterEndpoint); },
        'update-cluster-config': async () => { const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator'); return OperationalCommandsGenerator.generateUpdateClusterConfig(clusterEndpoint); },
        'recover-system-partitions': async () => { const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator'); return OperationalCommandsGenerator.generateRecoverSystemPartitions(clusterEndpoint); },
        'reset-partition-loads': async () => { const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator'); return OperationalCommandsGenerator.generateResetPartitionLoads(clusterEndpoint); },
        'provision-app-type': async () => { const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator'); return OperationalCommandsGenerator.generateProvisionApplicationType(clusterEndpoint); },
        'create-application': async () => { const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator'); const appTypes = await sfRest.getApplicationTypes().catch(() => []); return OperationalCommandsGenerator.generateCreateApplication(clusterEndpoint, appTypes); },
        'start-app-upgrade': async () => { const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator'); const apps = await sfRest.getApplications().catch(() => []); return OperationalCommandsGenerator.generateStartApplicationUpgrade(clusterEndpoint, apps); },
        'rollback-app-upgrade': async () => { const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator'); return OperationalCommandsGenerator.generateRollbackApplicationUpgrade(clusterEndpoint); },
        'move-primary-replica': async () => { const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator'); return OperationalCommandsGenerator.generateMovePrimaryReplica(clusterEndpoint); },
        'move-secondary-replica': async () => { const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator'); return OperationalCommandsGenerator.generateMoveSecondaryReplica(clusterEndpoint); },
        'reset-partition-load': async () => { const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator'); return OperationalCommandsGenerator.generateResetPartitionLoad(clusterEndpoint); },
        'report-health': async () => { const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator'); return OperationalCommandsGenerator.generateReportHealth(clusterEndpoint); },
        'start-chaos': async () => { const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator'); return OperationalCommandsGenerator.generateStartChaos(clusterEndpoint); },
        'stop-chaos': async () => { const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator'); return OperationalCommandsGenerator.generateStopChaos(clusterEndpoint); },
        'query-chaos-events': async () => { const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator'); return OperationalCommandsGenerator.generateQueryChaosEvents(clusterEndpoint); },
        'restart-partition': async () => { const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator'); return OperationalCommandsGenerator.generateRestartPartition(clusterEndpoint); },
        'enable-backup': async () => { const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator'); return OperationalCommandsGenerator.generateEnableBackup(clusterEndpoint); },
        'disable-backup': async () => { const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator'); return OperationalCommandsGenerator.generateDisableBackup(clusterEndpoint); },
        'trigger-backup': async () => { const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator'); return OperationalCommandsGenerator.generateTriggerBackup(clusterEndpoint); },
        'get-backup-progress': async () => { const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator'); return OperationalCommandsGenerator.generateGetBackupProgress(clusterEndpoint); },
        'restore-backup': async () => { const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator'); return OperationalCommandsGenerator.generateRestoreBackup(clusterEndpoint); },
        'view-repair-tasks': async () => { const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator'); return OperationalCommandsGenerator.generateViewRepairTasks(clusterEndpoint); },
        'create-repair-task': async () => { const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator'); return OperationalCommandsGenerator.generateCreateRepairTask(clusterEndpoint); },
        'cancel-repair-task': async () => { const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator'); return OperationalCommandsGenerator.generateCancelRepairTask(clusterEndpoint); },
        'force-approve-repair': async () => { const { OperationalCommandsGenerator } = await import('../services/OperationalCommandsGenerator'); return OperationalCommandsGenerator.generateForceApproveRepair(clusterEndpoint); },
    };

    const azureCliGenerators: Record<string, () => Promise<string>> = {
        'az-sf-install-extension': async () => { const { AzureCliCommandGenerator } = await import('../services/AzureCliCommandGenerator'); return AzureCliCommandGenerator.generateSetupGuide(clusterEndpoint); },
        'az-sf-cluster-select': async () => { const { AzureCliCommandGenerator } = await import('../services/AzureCliCommandGenerator'); return AzureCliCommandGenerator.generateSetupGuide(clusterEndpoint); },
        'az-login': async () => { const { AzureCliCommandGenerator } = await import('../services/AzureCliCommandGenerator'); return AzureCliCommandGenerator.generateSetupGuide(clusterEndpoint); },
        'az-sf-cluster-health': async () => { const { AzureCliCommandGenerator } = await import('../services/AzureCliCommandGenerator'); return AzureCliCommandGenerator.generateClusterHealthCommand(clusterEndpoint); },
        'az-sf-cluster-manifest': async () => { const { AzureCliCommandGenerator } = await import('../services/AzureCliCommandGenerator'); return AzureCliCommandGenerator.generateClusterManifestCommand(clusterEndpoint); },
        'az-sf-node-list': async () => { const { AzureCliCommandGenerator } = await import('../services/AzureCliCommandGenerator'); return AzureCliCommandGenerator.generateNodeListCommand(clusterEndpoint); },
        'az-sf-application-list': async () => { const { AzureCliCommandGenerator } = await import('../services/AzureCliCommandGenerator'); return AzureCliCommandGenerator.generateApplicationListCommand(clusterEndpoint); },
        'az-sf-application-health': async () => { const { AzureCliCommandGenerator } = await import('../services/AzureCliCommandGenerator'); return AzureCliCommandGenerator.generateApplicationHealthCommand(clusterEndpoint); },
        'az-sf-application-delete': async () => { const { AzureCliCommandGenerator } = await import('../services/AzureCliCommandGenerator'); return AzureCliCommandGenerator.generateApplicationDeleteCommand(clusterEndpoint); },
        'az-sf-service-list': async () => { const { AzureCliCommandGenerator } = await import('../services/AzureCliCommandGenerator'); return AzureCliCommandGenerator.generateServiceListCommand(clusterEndpoint); },
        'az-sf-query-guide': async () => { const { AzureCliCommandGenerator } = await import('../services/AzureCliCommandGenerator'); return AzureCliCommandGenerator.generateQueryGuide(clusterEndpoint); },
    };

    const allGenerators = { ...generators, ...operationalGenerators, ...azureCliGenerators };
    const cmdId = item.commandId || id;
    const gen = allGenerators[cmdId];

    if (gen) {
        const markdown = await gen();
        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
        await vscode.window.showTextDocument(doc, { preview: false });
    } else {
        SfUtility.outputLog(`Unknown command guide id: ${id}`, null, debugLevel.warn);
        const doc = await vscode.workspace.openTextDocument({
            content: JSON.stringify({ message: 'Command', description: `Command: ${id}`, note: 'This command will open a wizard to execute the operation' }, null, 2),
            language: 'json',
        });
        await vscode.window.showTextDocument(doc, { preview: false });
    }
}
