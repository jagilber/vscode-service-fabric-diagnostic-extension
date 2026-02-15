/**
 * Health report generator.
 */

import * as vscode from 'vscode';
import { SfMgr } from '../../sfMgr';
import { SfUtility } from '../../sfUtility';
import {
    resolveClusterEndpoint,
    healthEmoji,
    writeAndOpenReport,
} from './ReportUtils';

export async function generateHealthReport(
    context: vscode.ExtensionContext,
    sfMgr: SfMgr,
    item: any,
): Promise<void> {
    const clusterEndpoint = resolveClusterEndpoint(item, sfMgr);
    if (!clusterEndpoint) { return; }

    // Use contextValue (clean type like 'app-health') instead of itemType
    // which may be compound (e.g. 'app-health:MyAppId')
    const itemType = item?.contextValue || (item?.itemType || '').split(':')[0] || 'health';

    // For entity-specific health, delegate to a focused generator
    if (itemType !== 'health' && itemType !== 'cluster') {
        await generateEntityHealthReport(context, sfMgr, item, clusterEndpoint, itemType);
        return;
    }

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Generating Health Report',
        cancellable: false,
    }, async (progress) => {
        progress.report({ increment: 10, message: 'Fetching cluster health...' });
        const sfRest = sfMgr.getCurrentSfConfig().getSfRest();
        const clusterHealth = await sfRest.getClusterHealth();

        progress.report({ increment: 20, message: 'Fetching nodes health...' });
        const nodes = await sfRest.getNodes();

        progress.report({ increment: 20, message: 'Fetching applications health...' });
        const applications = await sfRest.getApplications();

        progress.report({ increment: 30, message: 'Generating markdown...' });

        const clusterHealthState = clusterHealth.aggregatedHealthState || 'Unknown';
        let markdown = `# Service Fabric Cluster Health Report\n\n`;
        markdown += `**Cluster:** \`${clusterEndpoint}\`  \n`;
        markdown += `**Generated:** ${new Date().toLocaleString()}  \n\n---\n\n`;
        markdown += `## Cluster Health: ${healthEmoji(clusterHealthState)} ${clusterHealthState}\n\n`;

        if (clusterHealth.healthStatistics?.healthStateCountList) {
            markdown += `### Health Statistics\n\n| Category | Ok | Warning | Error |\n|----------|----|---------| ------|\n`;
            clusterHealth.healthStatistics.healthStateCountList.forEach((stat: any) => {
                markdown += `| ${stat.entityKind} | ${stat.okCount || 0} | ${stat.warningCount || 0} | ${stat.errorCount || 0} |\n`;
            });
            markdown += `\n`;
        }

        const unhealthyEvals = clusterHealth.unhealthyEvaluations;
        if (unhealthyEvals && unhealthyEvals.length > 0) {
            markdown += `### ⚠️ Unhealthy Evaluations\n\n`;
            unhealthyEvals.forEach((evaluation: any) => {
                markdown += `- **${evaluation.kind || 'Unknown'}**: ${evaluation.description || 'No description'}\n`;
            });
            markdown += `\n`;
        }

        markdown += `## Nodes Health (${nodes.length} nodes)\n\n`;
        markdown += `| Node | Health | Status | Type | Seed |\n|------|--------|--------|------|------|\n`;
        nodes.forEach((node: any) => {
            markdown += `| ${node.name} | ${healthEmoji(node.healthState || 'Unknown')} ${node.healthState || 'Unknown'} | ${node.nodeStatus || 'Unknown'} | ${node.type || 'Unknown'} | ${node.isSeedNode ? '✅' : ''} |\n`;
        });
        markdown += `\n`;

        const errorNodes = nodes.filter((n: any) => n.healthState === 'Error');
        if (errorNodes.length > 0) {
            markdown += `### 🔴 Nodes in Error State (${errorNodes.length})\n\n`;
            errorNodes.forEach((node: any) => {
                markdown += `#### ${node.name}\n\n- **Status:** ${node.nodeStatus}\n- **Type:** ${node.type}\n- **IP:** ${node.ipAddressOrFqdn}\n- **Upgrade Domain:** ${node.upgradeDomain}\n- **Fault Domain:** ${node.faultDomain}\n\n`;
            });
        }

        const warningNodes = nodes.filter((n: any) => n.healthState === 'Warning');
        if (warningNodes.length > 0) {
            markdown += `### 🟡 Nodes in Warning State (${warningNodes.length})\n\n`;
            warningNodes.forEach((node: any) => { markdown += `- **${node.name}**: ${node.nodeStatus}\n`; });
            markdown += `\n`;
        }

        markdown += `## Applications Health (${applications.length} applications)\n\n`;
        markdown += `| Application | Health | Status | Type | Version |\n|-------------|--------|--------|------|----------|\n`;
        applications.forEach((app: any) => {
            markdown += `| ${app.name} | ${healthEmoji(app.healthState || 'Unknown')} ${app.healthState || 'Unknown'} | ${app.status || 'Unknown'} | ${app.typeName || 'Unknown'} | ${app.typeVersion || 'Unknown'} |\n`;
        });
        markdown += `\n`;

        const allResources = [...nodes, ...applications];
        const counts = { Ok: 0, Warning: 0, Error: 0, Unknown: 0 };
        allResources.forEach((r: any) => {
            const hs = r.healthState || 'Unknown';
            if (hs in counts) { (counts as any)[hs]++; }
        });
        markdown += `---\n\n## Summary\n\n**Total Resources:** ${allResources.length}  \n`;
        markdown += `🟢 Ok: ${counts.Ok} | 🟡 Warning: ${counts.Warning} | 🔴 Error: ${counts.Error} | ⚪ Unknown: ${counts.Unknown}\n\n`;
        if (counts.Error > 0) { markdown += `⚠️ **Action Required:** ${counts.Error} resource(s) in Error state\n\n`; }
        else if (counts.Warning > 0) { markdown += `ℹ️ **Attention:** ${counts.Warning} resource(s) in Warning state\n\n`; }
        else { markdown += `✅ **All systems healthy**\n\n`; }
        markdown += `---\n\n*Report generated by Service Fabric Diagnostic Extension*\n`;

        await writeAndOpenReport(context, clusterEndpoint, 'health-report', markdown, progress);
    });
}

/** Generate a health report for a specific entity (node, app, service, partition, replica) */
async function generateEntityHealthReport(
    context: vscode.ExtensionContext,
    sfMgr: SfMgr,
    item: any,
    clusterEndpoint: string,
    itemType: string,
): Promise<void> {
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Generating Health Report',
        cancellable: false,
    }, async (progress) => {
        progress.report({ increment: 10, message: 'Fetching health data...' });
        const sfRest = sfMgr.getCurrentSfConfig().getSfRest();

        let healthData: any;
        let entityLabel: string;
        let reportPrefix: string;

        switch (itemType) {
            case 'node-health': {
                const nodeName = item.nodeName;
                if (!nodeName) { SfUtility.showWarning('Node name not available'); return; }
                entityLabel = `Node: ${nodeName}`;
                reportPrefix = 'node-health-report';
                healthData = await sfRest.getNodeHealth(nodeName);
                break;
            }
            case 'app-health':
            case 'application-health': {
                const appId = item.applicationId;
                if (!appId) { SfUtility.showWarning('Application ID not available'); return; }
                entityLabel = `Application: ${appId}`;
                reportPrefix = 'application-health-report';
                healthData = await sfRest.getApplicationHealth(appId);
                break;
            }
            case 'service-health': {
                const svcId = item.serviceId;
                const appId = item.applicationId;
                if (!svcId || !appId) { SfUtility.showWarning('Service ID and Application ID required'); return; }
                entityLabel = `Service: ${svcId}`;
                reportPrefix = 'service-health-report';
                healthData = await sfRest.getServiceHealth(svcId, appId);
                break;
            }
            case 'partition-health': {
                const partId = item.partitionId;
                const svcId = item.serviceId;
                const appId = item.applicationId;
                if (!partId || !svcId || !appId) { SfUtility.showWarning('Partition, Service, and Application IDs required'); return; }
                entityLabel = `Partition: ${partId}`;
                reportPrefix = 'partition-health-report';
                healthData = await sfRest.getPartitionHealth(partId, svcId, appId);
                break;
            }
            case 'replica-health': {
                const repId = item.replicaId;
                const partId = item.partitionId;
                const svcId = item.serviceId;
                const appId = item.applicationId;
                if (!repId || !partId || !svcId || !appId) { SfUtility.showWarning('Replica, Partition, Service, and Application IDs required'); return; }
                entityLabel = `Replica: ${repId}`;
                reportPrefix = 'replica-health-report';
                healthData = await sfRest.getReplicaHealth(repId, partId, svcId, appId);
                break;
            }
            default:
                SfUtility.showWarning(`Unknown health item type: ${itemType}`);
                return;
        }

        progress.report({ increment: 60, message: 'Generating markdown...' });

        const healthState = healthData?.aggregatedHealthState || healthData?.healthState || 'Unknown';
        let markdown = `# Service Fabric Health Report\n\n`;
        markdown += `**Cluster:** \`${clusterEndpoint}\`  \n`;
        markdown += `**${entityLabel}**  \n`;
        markdown += `**Generated:** ${new Date().toLocaleString()}  \n\n---\n\n`;
        markdown += `## Health State: ${healthEmoji(healthState)} ${healthState}\n\n`;

        // Health events
        const healthEvents = healthData?.healthEvents || [];
        if (healthEvents.length > 0) {
            markdown += `### Health Events (${healthEvents.length})\n\n`;
            markdown += `| Source | Property | Health State | Description |\n|--------|----------|--------------|-------------|\n`;
            healthEvents.forEach((evt: any) => {
                const hs = evt.healthInformation?.healthState || 'Unknown';
                markdown += `| ${evt.healthInformation?.sourceId || 'Unknown'} | ${evt.healthInformation?.property || 'Unknown'} | ${healthEmoji(hs)} ${hs} | ${evt.healthInformation?.description || ''} |\n`;
            });
            markdown += `\n`;
        }

        // Unhealthy evaluations
        const unhealthyEvals = healthData?.unhealthyEvaluations || [];
        if (unhealthyEvals.length > 0) {
            markdown += `### Unhealthy Evaluations\n\n`;
            unhealthyEvals.forEach((evaluation: any) => {
                markdown += `- **${evaluation.kind || 'Unknown'}**: ${evaluation.description || 'No description'}\n`;
            });
            markdown += `\n`;
        }

        // Full JSON details
        markdown += `---\n\n### Full Health Data\n\n`;
        markdown += `\`\`\`json\n${JSON.stringify(healthData, null, 2)}\n\`\`\`\n\n`;
        markdown += `---\n\n*Report generated by Service Fabric Diagnostic Extension*\n`;

        await writeAndOpenReport(context, clusterEndpoint, reportPrefix, markdown, progress);
    });
}
