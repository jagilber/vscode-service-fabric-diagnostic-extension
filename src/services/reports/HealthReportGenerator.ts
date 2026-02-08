/**
 * Health report generator.
 */

import * as vscode from 'vscode';
import { SfMgr } from '../../sfMgr';
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
                markdown += `#### ${node.name}\n\n- **Status:** ${node.nodeStatus}\n- **Type:** ${node.type}\n- **IP:** ${node.ipAddressOrFQDN}\n- **Upgrade Domain:** ${node.upgradeDomain}\n- **Fault Domain:** ${node.faultDomain}\n\n`;
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
