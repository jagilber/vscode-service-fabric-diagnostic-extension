/**
 * Essentials report generator.
 */

import * as vscode from 'vscode';
import { SfMgr } from '../../sfMgr';
import { SfUtility } from '../../sfUtility';
import { resolveClusterEndpoint, openMarkdownPreview } from './ReportUtils';

export async function generateEssentialsReport(
    context: vscode.ExtensionContext,
    sfMgr: SfMgr,
    item: any,
): Promise<void> {
    if (!item || item.itemType !== 'essentials') {
        SfUtility.showWarning('This command is only available for Cluster Essentials');
        return;
    }
    const clusterEndpoint = resolveClusterEndpoint(item, sfMgr);
    if (!clusterEndpoint) { return; }

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Generating Cluster Essentials Report',
        cancellable: false,
    }, async (progress) => {
        progress.report({ increment: 10, message: 'Fetching cluster data...' });
        const sfConfig = sfMgr.getSfConfig(clusterEndpoint) || sfMgr.getCurrentSfConfig();
        const sfRest = sfConfig.getSfRest();

        const [health, version, manifest, nodes, applications] = await Promise.all([
            sfRest.getClusterHealth(),
            sfRest.getClusterVersion(),
            sfRest.getClusterManifest(),
            sfRest.getNodes(),
            sfRest.getApplications(),
        ]);

        progress.report({ increment: 40, message: 'Analyzing cluster health...' });

        let faultDomainCount = 'N/A', upgradeDomainCount = 'N/A';
        try {
            const manifestXml = (manifest as any).manifest;
            if (manifestXml) {
                const fdMatch = manifestXml.match(/FaultDomainCount="(\d+)"/i);
                const udMatch = manifestXml.match(/UpgradeDomainCount="(\d+)"/i);
                if (fdMatch) { faultDomainCount = fdMatch[1]; }
                if (udMatch) { upgradeDomainCount = udMatch[1]; }
            }
        } catch (_) { /* ignore */ }

        const healthState = health.aggregatedHealthState || 'Unknown';
        const healthIcon = healthState === 'Ok' ? '✅' : healthState === 'Warning' ? '⚠️' : healthState === 'Error' ? '❌' : 'ℹ️';

        const nodeStates = health.nodeHealthStates || [];
        const appStates = health.applicationHealthStates || [];
        const healthEvents = health.healthEvents || [];
        const unhealthyEvals = health.unhealthyEvaluations || [];

        const nodeTypeMap = new Map<string, number>();
        (nodes || []).forEach((n: any) => {
            const t = n.type || 'Unknown';
            nodeTypeMap.set(t, (nodeTypeMap.get(t) || 0) + 1);
        });

        let versionString = 'Unknown';
        if (version) { versionString = (version as any).version || (version as any).Version || (typeof version === 'string' ? version : 'Unknown'); }

        progress.report({ increment: 30, message: 'Generating report...' });

        const countByState = (items: any[]) => ({
            ok: items.filter((x: any) => x.aggregatedHealthState === 'Ok').length,
            warning: items.filter((x: any) => x.aggregatedHealthState === 'Warning').length,
            error: items.filter((x: any) => x.aggregatedHealthState === 'Error').length,
            total: items.length,
        });
        const nodeStats = countByState(nodeStates);
        const appStats = countByState(appStates);
        const pct = (n: number, t: number) => t > 0 ? ((n / t) * 100).toFixed(1) : '0';

        const errorEvents = healthEvents.filter((e: any) => e.healthInformation?.healthState === 'Error').length;
        const warningEvents = healthEvents.filter((e: any) => e.healthInformation?.healthState === 'Warning').length;

        let reportContent = `# 🔍 Service Fabric Cluster Essentials Report\n\n**Generated:** ${new Date().toLocaleString()}  \n**Cluster:** \`${clusterEndpoint}\`\n\n---\n\n`;
        reportContent += `## 📊 Cluster Summary\n\n| Property | Value |\n|----------|-------|\n`;
        reportContent += `| **Service Fabric Version** | ${versionString} |\n`;
        reportContent += `| **Health State** | ${healthIcon} **${healthState}** |\n`;
        reportContent += `| **Fault Domain Count** | ${faultDomainCount} |\n`;
        reportContent += `| **Upgrade Domain Count** | ${upgradeDomainCount} |\n`;
        reportContent += `| **Total Nodes** | ${(nodes || []).length} |\n`;
        reportContent += `| **Total Applications** | ${(applications || []).length} |\n\n---\n\n`;

        reportContent += `## 🖥️ Node Health Statistics\n\n| State | Count | Percentage |\n|-------|-------|------------|\n`;
        reportContent += `| ✅ **Healthy** | ${nodeStats.ok} | ${pct(nodeStats.ok, nodeStats.total)}% |\n`;
        reportContent += `| ⚠️ **Warning** | ${nodeStats.warning} | ${pct(nodeStats.warning, nodeStats.total)}% |\n`;
        reportContent += `| ❌ **Error** | ${nodeStats.error} | ${pct(nodeStats.error, nodeStats.total)}% |\n`;
        reportContent += `| **Total** | **${nodeStats.total}** | **100%** |\n\n`;
        reportContent += `### Node Type Distribution\n\n${Array.from(nodeTypeMap.entries()).map(([t, c]) => `- **${t}**: ${c} node(s)`).join('\n')}\n\n---\n\n`;

        reportContent += `## 📦 Application Health Statistics\n\n| State | Count | Percentage |\n|-------|-------|------------|\n`;
        reportContent += `| ✅ **Healthy** | ${appStats.ok} | ${pct(appStats.ok, appStats.total)}% |\n`;
        reportContent += `| ⚠️ **Warning** | ${appStats.warning} | ${pct(appStats.warning, appStats.total)}% |\n`;
        reportContent += `| ❌ **Error** | ${appStats.error} | ${pct(appStats.error, appStats.total)}% |\n`;
        reportContent += `| **Total** | **${appStats.total}** | **100%** |\n\n---\n\n`;

        reportContent += `## 🩺 Health Events Summary\n\n| Type | Count |\n|------|-------|\n`;
        reportContent += `| ❌ **Error Events** | ${errorEvents} |\n`;
        reportContent += `| ⚠️ **Warning Events** | ${warningEvents} |\n`;
        reportContent += `| ℹ️ **Informational** | ${healthEvents.length - errorEvents - warningEvents} |\n`;
        reportContent += `| **Total Events** | **${healthEvents.length}** |\n\n`;

        if (unhealthyEvals.length > 0) {
            reportContent += `### ⚠️ Unhealthy Evaluations\n\n> **Warning:** ${unhealthyEvals.length} unhealthy evaluation(s) detected\n\n`;
            reportContent += `<details>\n<summary>Click to view</summary>\n\n\`\`\`json\n${JSON.stringify(unhealthyEvals, null, 2)}\n\`\`\`\n\n</details>\n\n`;
        } else {
            reportContent += `### ✅ No Unhealthy Evaluations\n\n`;
        }

        reportContent += `---\n\n`;
        reportContent += `<details>\n<summary>Raw JSON Data</summary>\n\n\`\`\`json\n${JSON.stringify({ version, health, nodes, applications }, null, 2)}\n\`\`\`\n\n</details>\n\n`;
        reportContent += `*Report generated by Service Fabric Cluster Explorer extension*\n`;

        await openMarkdownPreview(reportContent);
        progress.report({ increment: 100, message: 'Report generated!' });
        SfUtility.showInformation('✅ Cluster essentials report generated successfully!');
    });
}
