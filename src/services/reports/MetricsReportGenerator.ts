/**
 * Metrics report generator — Mermaid-graph-rich markdown report.
 */

import * as vscode from 'vscode';
import { SfMgr } from '../../sfMgr';
import { SfUtility } from '../../sfUtility';
import { resolveClusterEndpoint, openMarkdownPreview } from './ReportUtils';

/** Parse a value that may be a string or number into a number */
function num(v: any): number {
    if (v === undefined || v === null) { return 0; }
    const n = typeof v === 'string' ? parseFloat(v) : v;
    return isNaN(n) ? 0 : n;
}

/** Resolve node ID from multiple possible property shapes */
function nodeId(m: any, which: 'min' | 'max'): string {
    // SDK camelCase: minNodeLoadNodeId.id / maxNodeLoadNodeId.id
    // Raw PascalCase: MinNodeLoadId.Id / MaxNodeLoadId.Id
    if (which === 'min') {
        return m.minNodeLoadNodeId?.id || m.MinNodeLoadId?.Id || m.MinNodeLoadId?.id || 'N/A';
    }
    return m.maxNodeLoadNodeId?.id || m.MaxNodeLoadId?.Id || m.MaxNodeLoadId?.id || 'N/A';
}

/** Shorten node IDs (hex hashes) for display */
function shortNodeId(id: string): string {
    if (id === 'N/A' || id.length <= 12) { return id; }
    return id.substring(0, 8) + '…';
}

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
        md += `**Cluster:** \`${clusterEndpoint}\`  \n`;
        md += `**Metrics:** ${metrics.length}\n\n---\n\n`;

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
        md += `## 📋 Metrics Summary\n\n`;
        md += `| Metric | Load | Capacity | Usage | Min Node | Max Node | Balanced |\n`;
        md += `|--------|------|----------|-------|----------|----------|----------|\n`;

        for (const m of metrics) {
            const load = num(m.currentClusterLoad ?? m.clusterLoad);
            const cap = num(m.clusterCapacity);
            const minL = num(m.minimumNodeLoad ?? m.minNodeLoadValue);
            const maxL = num(m.maximumNodeLoad ?? m.maxNodeLoadValue);
            const bal = m.isBalancedAfter !== undefined ? (m.isBalancedAfter ? '✅' : '❌') : '—';
            const pct = cap > 0 ? `${((load / cap) * 100).toFixed(1)}%` : '—';
            const minNid = shortNodeId(nodeId(m, 'min'));
            const maxNid = shortNodeId(nodeId(m, 'max'));
            md += `| **${m.name || 'Unknown'}** | ${load} | ${cap > 0 ? cap : '∞'} | ${pct} | ${minL} (${minNid}) | ${maxL} (${maxNid}) | ${bal} |\n`;
        }
        md += `\n---\n\n`;

        // ── Mermaid: Capacity usage bar chart (only metrics with finite capacity) ──
        const metricsWithCapacity = metrics.filter(m => num(m.clusterCapacity) > 0);
        if (metricsWithCapacity.length > 0) {
            md += `## 📈 Capacity Utilization\n\n`;
            md += '```mermaid\n';
            md += `xychart-beta\n`;
            md += `    title "Cluster Metric Usage %"\n`;
            md += `    x-axis [${metricsWithCapacity.map(m => `"${sanitizeMermaid(m.name || 'Unknown')}"`).join(', ')}]\n`;
            md += `    y-axis "Usage %" 0 --> 100\n`;
            const usages = metricsWithCapacity.map(m => {
                const load = num(m.currentClusterLoad ?? m.clusterLoad);
                const cap = num(m.clusterCapacity) || 1;
                return Math.min(100, parseFloat(((load / cap) * 100).toFixed(1)));
            });
            md += `    bar [${usages.join(', ')}]\n`;
            md += '```\n\n';
        }

        // ── Mermaid: Load distribution bar chart (all metrics) ──
        md += `## 📊 Cluster Load Distribution\n\n`;
        md += '```mermaid\n';
        md += `xychart-beta\n`;
        md += `    title "Current Cluster Load per Metric"\n`;
        md += `    x-axis [${metrics.map(m => `"${sanitizeMermaid(m.name || '?')}"`).join(', ')}]\n`;
        const maxLoad = Math.max(...metrics.map(m => num(m.currentClusterLoad ?? m.clusterLoad)));
        md += `    y-axis "Load" 0 --> ${maxLoad > 0 ? maxLoad : 10}\n`;
        md += `    bar [${metrics.map(m => num(m.currentClusterLoad ?? m.clusterLoad)).join(', ')}]\n`;
        md += '```\n\n';

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
            num(m.maximumNodeLoad ?? m.maxNodeLoadValue) > 0);
        if (spreadMetrics.length > 0) {
            md += `## 🔀 Node Load Spread (Min vs Max)\n\n`;
            md += '```mermaid\n';
            md += `xychart-beta\n`;
            md += `    title "Per-Metric Node Load Range"\n`;
            md += `    x-axis [${spreadMetrics.map(m => `"${sanitizeMermaid(m.name || '?')}"`).join(', ')}]\n`;
            const maxVal = Math.max(
                ...spreadMetrics.map(m => num(m.maximumNodeLoad ?? m.maxNodeLoadValue)),
            );
            md += `    y-axis "Load" 0 --> ${maxVal > 0 ? maxVal : 10}\n`;
            md += `    bar [${spreadMetrics.map(m => num(m.minimumNodeLoad ?? m.minNodeLoadValue)).join(', ')}]\n`;
            md += `    bar [${spreadMetrics.map(m => num(m.maximumNodeLoad ?? m.maxNodeLoadValue)).join(', ')}]\n`;
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
                md += `    CL -->|OK| OK_GROUP["✅ Within Capacity (${okay.length})"]\n`;
                for (const m of okay) {
                    const id = sanitizeMermaidId(m.name || 'unk');
                    md += `    OK_GROUP --> OK_${id}["${sanitizeMermaid(m.name)}"]\n`;
                    md += `    style OK_${id} fill:#2d6,color:#fff\n`;
                }
            }
            if (violations.length > 0) {
                md += `    CL -->|VIOLATION| WARN_GROUP["⚠️ Over Capacity (${violations.length})"]\n`;
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
            const load = num(m.currentClusterLoad ?? m.clusterLoad);
            const cap = num(m.clusterCapacity);
            const remaining = num(m.clusterCapacityRemaining ?? m.clusterRemainingCapacity);
            const violation = m.isClusterCapacityViolation === true;

            md += `### ${violation ? '⚠️' : '📏'} ${m.name || 'Unknown Metric'}\n\n`;

            if (cap > 0) {
                const usedPct = ((load / cap) * 100).toFixed(1);
                const remainPct = ((remaining / cap) * 100).toFixed(1);
                md += '```mermaid\n';
                md += `pie title "${sanitizeMermaid(m.name || 'Metric')} Capacity"\n`;
                md += `    "Used ${usedPct}%" : ${load}\n`;
                md += `    "Remaining ${remainPct}%" : ${remaining}\n`;
                md += '```\n\n';
            }

            md += `| Property | Value |\n|----------|-------|\n`;
            md += `| **Load** | ${load} |\n`;
            md += `| **Capacity** | ${cap > 0 ? cap : '∞ (unlimited)'} |\n`;
            md += `| **Remaining** | ${remaining} |\n`;
            if (m.nodeBufferPercentage !== undefined) { md += `| **Node Buffer** | ${m.nodeBufferPercentage}% |\n`; }
            const buffered = num(m.clusterBufferedCapacity ?? m.BufferedCapacity);
            if (buffered > 0) { md += `| **Buffered Capacity** | ${buffered} |\n`; }
            const remBuf = num(m.bufferedClusterCapacityRemaining ?? m.clusterRemainingBufferedCapacity ?? m.RemainingBufferedCapacity);
            if (remBuf > 0) { md += `| **Remaining Buffered** | ${remBuf} |\n`; }
            const minLoad = num(m.minimumNodeLoad ?? m.minNodeLoadValue);
            const maxLoadVal = num(m.maximumNodeLoad ?? m.maxNodeLoadValue);
            md += `| **Min Node Load** | ${minLoad} (\`${shortNodeId(nodeId(m, 'min'))}\`) |\n`;
            md += `| **Max Node Load** | ${maxLoadVal} (\`${shortNodeId(nodeId(m, 'max'))}\`) |\n`;
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

/** Sanitize text for use inside Mermaid labels — strip chars that break parsing */
function sanitizeMermaid(text: string): string {
    return (text || '').replace(/["[\](){}|#&;]/g, '_').replace(/:/g, ' ').replace(/\//g, '_');
}

/** Sanitize text for use as a Mermaid node ID (alphanumeric + underscore only) */
function sanitizeMermaidId(text: string): string {
    return (text || '').replace(/[^a-zA-Z0-9_]/g, '_');
}
