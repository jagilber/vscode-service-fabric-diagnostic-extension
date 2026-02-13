/**
 * Metrics report generator — Mermaid-graph-rich markdown report.
 */

import * as vscode from 'vscode';
import { SfMgr } from '../../sfMgr';
import { SfUtility } from '../../sfUtility';
import { resolveClusterEndpoint, openMarkdownPreview } from './ReportUtils';

export async function generateMetricsReport(
    context: vscode.ExtensionContext,
    sfMgr: SfMgr,
    item: any,
): Promise<void> {
    const clusterEndpoint = resolveClusterEndpoint(item, sfMgr);
    if (!clusterEndpoint) { return; }

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Generating Metrics Report',
        cancellable: false,
    }, async (progress) => {
        progress.report({ increment: 10, message: 'Fetching cluster metrics...' });
        const sfConfig = sfMgr.getSfConfig(clusterEndpoint) || sfMgr.getCurrentSfConfig();
        const sfRest = sfConfig.getSfRest();
        const loadInfo = await sfRest.getClusterLoadInformation();

        progress.report({ increment: 40, message: 'Building report...' });

        const metrics: any[] = loadInfo.loadMetricInformation || [];
        let md = `# 📊 Service Fabric Cluster Metrics Report\n\n`;
        md += `**Generated:** ${new Date().toLocaleString()}  \n`;
        md += `**Cluster:** \`${clusterEndpoint}\`\n\n---\n\n`;

        // ── Balancing info ──
        if (loadInfo.lastBalancingStartTimeUtc || loadInfo.lastBalancingEndTimeUtc) {
            md += `## ⚖️ Last Resource Balancing\n\n`;
            md += `| Property | Value |\n|----------|-------|\n`;
            if (loadInfo.lastBalancingStartTimeUtc) {
                md += `| **Start** | ${new Date(loadInfo.lastBalancingStartTimeUtc).toLocaleString()} |\n`;
            }
            if (loadInfo.lastBalancingEndTimeUtc) {
                md += `| **End** | ${new Date(loadInfo.lastBalancingEndTimeUtc).toLocaleString()} |\n`;
                if (loadInfo.lastBalancingStartTimeUtc) {
                    const dur = new Date(loadInfo.lastBalancingEndTimeUtc).getTime() -
                        new Date(loadInfo.lastBalancingStartTimeUtc).getTime();
                    md += `| **Duration** | ${dur}ms |\n`;
                }
            }
            md += `\n---\n\n`;
        }

        if (metrics.length === 0) {
            md += `## No Metrics Data\n\nNo load metric information is available for this cluster.\n`;
            await openMarkdownPreview(md);
            return;
        }

        // ── Summary table ──
        md += `## 📋 Metrics Summary (${metrics.length} metrics)\n\n`;
        md += `| Metric | Load | Capacity | Usage | Min Node | Max Node | Balanced |\n`;
        md += `|--------|------|----------|-------|----------|----------|----------|\n`;

        for (const m of metrics) {
            const load = m.currentClusterLoad ?? m.clusterLoad ?? 0;
            const cap = m.clusterCapacity ?? 0;
            const min = m.minimumNodeLoad ?? m.minNodeLoadValue ?? 'N/A';
            const max = m.maximumNodeLoad ?? m.maxNodeLoadValue ?? 'N/A';
            const bal = m.isBalancedAfter !== undefined ? (m.isBalancedAfter ? '✅' : '❌') : '—';
            const pct = cap > 0 ? `${((load / cap) * 100).toFixed(1)}%` : 'unlimited';
            md += `| **${m.name || 'Unknown'}** | ${load} | ${cap || 'unlimited'} | ${pct} | ${min} | ${max} | ${bal} |\n`;
        }
        md += `\n---\n\n`;

        // ── Mermaid: Capacity usage bar chart ──
        const metricsWithCapacity = metrics.filter(m => (m.clusterCapacity ?? 0) > 0);
        if (metricsWithCapacity.length > 0) {
            md += `## 📈 Capacity Utilization\n\n`;
            md += '```mermaid\n';
            md += `xychart-beta\n`;
            md += `    title "Cluster Metric Usage %"\n`;
            md += `    x-axis [${metricsWithCapacity.map(m => `"${sanitizeMermaid(m.name || 'Unknown')}"`).join(', ')}]\n`;
            md += `    y-axis "Usage %" 0 --> 100\n`;
            const usages = metricsWithCapacity.map(m => {
                const load = m.currentClusterLoad ?? m.clusterLoad ?? 0;
                const cap = m.clusterCapacity ?? 1;
                return Math.min(100, parseFloat(((load / cap) * 100).toFixed(1)));
            });
            md += `    bar [${usages.join(', ')}]\n`;
            md += '```\n\n';
        }

        // ── Mermaid: Balance status pie chart ──
        const balancedCount = metrics.filter(m => m.isBalancedAfter === true).length;
        const unbalancedCount = metrics.filter(m => m.isBalancedAfter === false).length;
        const unknownCount = metrics.length - balancedCount - unbalancedCount;

        if (balancedCount + unbalancedCount > 0) {
            md += `## ⚖️ Balance Status\n\n`;
            md += '```mermaid\n';
            md += `pie title Metric Balance Status\n`;
            if (balancedCount > 0) { md += `    "Balanced" : ${balancedCount}\n`; }
            if (unbalancedCount > 0) { md += `    "Unbalanced" : ${unbalancedCount}\n`; }
            if (unknownCount > 0) { md += `    "Unknown" : ${unknownCount}\n`; }
            md += '```\n\n';
        }

        // ── Mermaid: Node load spread (min vs max) ──
        const spreadMetrics = metrics.filter(m =>
            (m.minimumNodeLoad ?? m.minNodeLoadValue) !== undefined &&
            (m.maximumNodeLoad ?? m.maxNodeLoadValue) !== undefined);
        if (spreadMetrics.length > 0) {
            md += `## 🔀 Node Load Spread (Min vs Max)\n\n`;
            md += '```mermaid\n';
            md += `xychart-beta\n`;
            md += `    title "Per-Metric Node Load Range"\n`;
            md += `    x-axis [${spreadMetrics.map(m => `"${sanitizeMermaid(m.name || '?')}"`).join(', ')}]\n`;
            const maxVal = Math.max(
                ...spreadMetrics.map(m => m.maximumNodeLoad ?? m.maxNodeLoadValue ?? 0),
            );
            md += `    y-axis "Load" 0 --> ${maxVal > 0 ? maxVal : 100}\n`;
            md += `    bar [${spreadMetrics.map(m => m.minimumNodeLoad ?? m.minNodeLoadValue ?? 0).join(', ')}]\n`;
            md += `    bar [${spreadMetrics.map(m => m.maximumNodeLoad ?? m.maxNodeLoadValue ?? 0).join(', ')}]\n`;
            md += '```\n\n';
            md += `> **First bar** = minimum node load, **Second bar** = maximum node load\n\n`;
        }

        // ── Mermaid: Capacity violation flowchart ──
        const violations = metrics.filter(m => m.isClusterCapacityViolation === true);
        const okay = metrics.filter(m => m.isClusterCapacityViolation === false);
        if (violations.length > 0 || okay.length > 0) {
            md += `## 🚨 Capacity Status\n\n`;
            md += '```mermaid\n';
            md += `flowchart LR\n`;
            md += `    CL[Cluster Capacity Check]\n`;
            if (okay.length > 0) {
                md += `    CL -->|OK| OK_GROUP[✅ Within Capacity]\n`;
                for (const m of okay) {
                    const id = sanitizeMermaidId(m.name || 'unk');
                    md += `    OK_GROUP --> OK_${id}["${sanitizeMermaid(m.name)}"]\n`;
                    md += `    style OK_${id} fill:#2d6,color:#fff\n`;
                }
            }
            if (violations.length > 0) {
                md += `    CL -->|VIOLATION| WARN_GROUP[⚠️ Over Capacity]\n`;
                for (const m of violations) {
                    const id = sanitizeMermaidId(m.name || 'unk');
                    md += `    WARN_GROUP --> WARN_${id}["${sanitizeMermaid(m.name)}"]\n`;
                    md += `    style WARN_${id} fill:#d33,color:#fff\n`;
                }
            }
            md += '```\n\n';
        }

        md += `---\n\n`;

        // ── Per-metric detail sections ──
        md += `## 🔍 Detailed Metrics\n\n`;
        for (const m of metrics) {
            const load = m.currentClusterLoad ?? m.clusterLoad ?? 0;
            const cap = m.clusterCapacity ?? 0;
            const remaining = m.clusterCapacityRemaining ?? m.clusterRemainingCapacity ?? 0;
            const violation = m.isClusterCapacityViolation === true;

            md += `### ${violation ? '⚠️' : '📏'} ${m.name || 'Unknown Metric'}\n\n`;

            if (cap > 0) {
                const usedPct = ((load / cap) * 100).toFixed(1);
                const remainPct = ((remaining / cap) * 100).toFixed(1);
                md += '```mermaid\n';
                md += `pie title "${sanitizeMermaid(m.name || 'Metric')} Capacity"\n`;
                md += `    "Used (${usedPct}%)" : ${load}\n`;
                md += `    "Remaining (${remainPct}%)" : ${remaining}\n`;
                md += '```\n\n';
            }

            md += `| Property | Value |\n|----------|-------|\n`;
            md += `| **Load** | ${load} |\n`;
            md += `| **Capacity** | ${cap || 'unlimited'} |\n`;
            md += `| **Remaining** | ${remaining} |\n`;
            if (m.nodeBufferPercentage !== undefined) { md += `| **Node Buffer** | ${m.nodeBufferPercentage}% |\n`; }
            if (m.clusterBufferedCapacity !== undefined) { md += `| **Buffered Capacity** | ${m.clusterBufferedCapacity} |\n`; }
            const minLoad = m.minimumNodeLoad ?? m.minNodeLoadValue;
            const maxLoad = m.maximumNodeLoad ?? m.maxNodeLoadValue;
            if (minLoad !== undefined) { md += `| **Min Node Load** | ${minLoad} (${m.minNodeLoadNodeId?.id || 'N/A'}) |\n`; }
            if (maxLoad !== undefined) { md += `| **Max Node Load** | ${maxLoad} (${m.maxNodeLoadNodeId?.id || 'N/A'}) |\n`; }
            if (m.isBalancedBefore !== undefined) { md += `| **Balanced Before** | ${m.isBalancedBefore ? '✅' : '❌'} |\n`; }
            if (m.isBalancedAfter !== undefined) { md += `| **Balanced After** | ${m.isBalancedAfter ? '✅' : '❌'} |\n`; }
            if (m.deviationBefore !== undefined) { md += `| **Deviation Before** | ${m.deviationBefore} |\n`; }
            if (m.deviationAfter !== undefined) { md += `| **Deviation After** | ${m.deviationAfter} |\n`; }
            if (m.balancingThreshold !== undefined) { md += `| **Balancing Threshold** | ${m.balancingThreshold} |\n`; }
            if (m.activityThreshold !== undefined) { md += `| **Activity Threshold** | ${m.activityThreshold} |\n`; }
            if (m.action !== undefined) { md += `| **Action** | ${m.action} |\n`; }
            md += `| **Capacity Violation** | ${violation ? '⚠️ **YES**' : '✅ No'} |\n`;
            md += `\n`;

            md += `<details>\n<summary>📋 Raw Metric JSON</summary>\n\n\`\`\`json\n${JSON.stringify(m, null, 2)}\n\`\`\`\n</details>\n\n---\n\n`;
        }

        // ── Collapsed raw JSON ──
        md += `<details>\n<summary>Raw JSON Data</summary>\n\n\`\`\`json\n${JSON.stringify(loadInfo, null, 2)}\n\`\`\`\n\n</details>\n\n`;
        md += `*Report generated by Service Fabric Diagnostic Extension*\n`;

        progress.report({ increment: 30, message: 'Opening report...' });
        await openMarkdownPreview(md);
        progress.report({ increment: 100, message: 'Done!' });
        SfUtility.showInformation('✅ Cluster metrics report generated!');
    });
}

/** Sanitize text for use inside Mermaid labels (no quotes/brackets) */
function sanitizeMermaid(text: string): string {
    return (text || '').replace(/["[\](){}|#&;]/g, '_');
}

/** Sanitize text for use as a Mermaid node ID (alphanumeric + underscore only) */
function sanitizeMermaidId(text: string): string {
    return (text || '').replace(/[^a-zA-Z0-9_]/g, '_');
}
