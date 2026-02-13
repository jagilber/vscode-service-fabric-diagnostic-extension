/**
 * Shared helpers for report generators.
 *
 * Extracted from ReportCommands.ts to avoid duplication across
 * individual report generator modules.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { SfMgr } from '../../sfMgr';
import { SfUtility, debugLevel } from '../../sfUtility';

// ── Cluster endpoint resolution ────────────────────────────────────────

export function resolveClusterEndpoint(item: any, sfMgr: SfMgr): string | undefined {
    const endpoint = item?.clusterEndpoint || sfMgr.getCurrentSfConfig().getClusterEndpoint();
    if (!endpoint) {
        SfUtility.showWarning('No cluster endpoint available');
    }
    return endpoint;
}

/**
 * Open markdown content in VS Code's preview mode.
 * Writes to a temp file for clean single-tab preview.
 */
export async function openMarkdownPreview(content: string): Promise<void> {
    const tmpFile = path.join(os.tmpdir(), `sf-report-${Date.now()}.md`);
    fs.writeFileSync(tmpFile, content, 'utf8');
    await openMarkdownFilePreview(tmpFile);
}

/**
 * Open a file-backed markdown document in VS Code's preview mode.
 */
export async function openMarkdownFilePreview(filePath: string): Promise<void> {
    const uri = vscode.Uri.file(filePath);
    await vscode.commands.executeCommand('markdown.showPreview', uri);
}

// ── Health helpers ─────────────────────────────────────────────────────

export function healthEmoji(state: string): string {
    if (state === 'Error') { return '🔴'; }
    if (state === 'Warning') { return '🟡'; }
    if (state === 'Ok') { return '🟢'; }
    return '⚪';
}

/**
 * Infer health state from event kind/content when HealthState is absent.
 */
export function inferEventHealthState(event: any): string {
    const explicit = event.HealthState || event.healthState;
    if (explicit && explicit !== 'Unknown') { return explicit; }

    const combined = `${(event.Kind || event.kind || '')} ${(event.Description || event.description || '')}`.toLowerCase();
    if (combined.match(/error|failed|failure|fault|unhealthy|down|critical|invalid/)) { return 'Error'; }
    if (combined.match(/warning|degrad|slow|timeout|retry/)) { return 'Warning'; }
    if (combined.match(/completed|started|created|healthy|ok|success|up|ready|deployed|upgraded|activated|opened|closed|new|cleared|resolved/)) { return 'Ok'; }
    if ((event.Kind || event.kind || '').toLowerCase().includes('health')) { return 'Ok'; }
    return 'Unknown';
}

export function healthCounts(events: any[]): Record<string, number> {
    const counts: Record<string, number> = { Error: 0, Warning: 0, Ok: 0, Unknown: 0 };
    events.forEach((e: any) => {
        const h = inferEventHealthState(e);
        if (h in counts) { counts[h]++; }
    });
    return counts;
}

// ── Collection helpers ─────────────────────────────────────────────────

export function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
    const map = new Map<string, T[]>();
    items.forEach(item => {
        const key = keyFn(item);
        if (!map.has(key)) { map.set(key, []); }
        map.get(key)!.push(item);
    });
    return map;
}

export function sortedEntries<T>(map: Map<string, T[]>): [string, T[]][] {
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
}

// ── Formatting helpers ─────────────────────────────────────────────────

export function formatEventDetail(event: any): string {
    const ts = event.TimeStamp || event.timeStamp || event.eventInstanceId;
    const kind = event.Kind || event.kind || 'Event';
    const hs = inferEventHealthState(event);
    const emoji = hs === 'Error' ? '🔴' : hs === 'Warning' ? '🟡' : hs === 'Ok' ? '🟢' : '⚪';

    let md = `#### ${emoji} ${kind}\n\n<table>\n`;
    md += `<tr><td><strong>Property</strong></td><td><strong>Value</strong></td></tr>\n`;
    if (ts) {
        try {
            const d = new Date(ts);
            md += `<tr><td>Time</td><td>${!isNaN(d.getTime()) ? d.toLocaleString() : ts}</td></tr>\n`;
        } catch (_) { md += `<tr><td>Time</td><td>${ts}</td></tr>\n`; }
    }
    md += `<tr><td>Health State</td><td><strong>${emoji} ${hs}</strong></td></tr>\n`;
    const fields: [string, string][] = [
        ['Category', 'Category'], ['Category', 'category'],
        ['Node', 'NodeName'], ['Node', 'nodeName'],
        ['Application', 'ApplicationName'], ['Application', 'applicationName'],
        ['Service', 'ServiceName'], ['Service', 'serviceName'],
        ['Partition ID', 'PartitionId'], ['Partition ID', 'partitionId'],
        ['Replica ID', 'ReplicaId'], ['Replica ID', 'replicaId'],
        ['Source ID', 'SourceId'], ['Source ID', 'sourceId'],
        ['Property', 'Property'], ['Property', 'property'],
        ['Description', 'Description'],
        ['Reason', 'Reason'], ['Reason', 'reason'],
        ['Error', 'Error'], ['Error', 'error'],
    ];
    const seen = new Set<string>();
    fields.forEach(([label, key]) => {
        if (event[key] && !seen.has(label)) {
            seen.add(label);
            md += `<tr><td>${label}</td><td>${label === 'Node' || label === 'Source ID' || label === 'Partition ID' || label === 'Replica ID' || label === 'Error' ? `<code>${event[key]}</code>` : event[key]}</td></tr>\n`;
        }
    });
    if (event.SequenceNumber !== undefined) { md += `<tr><td>Sequence Number</td><td>${event.SequenceNumber}</td></tr>\n`; }
    md += `</table>\n\n`;
    md += `<details>\n<summary>📋 Full Event JSON</summary>\n\n\`\`\`json\n${JSON.stringify(event, null, 2)}\n\`\`\`\n</details>\n\n---\n\n`;
    return md;
}

export function formatMetricTable(m: any): string {
    let md = `<table>\n<tr><td><strong>Property</strong></td><td><strong>Value</strong></td></tr>\n`;
    if (m.clusterCapacity !== undefined) { md += `<tr><td>Total Capacity</td><td><strong>${m.clusterCapacity}</strong></td></tr>\n`; }
    const load = m.currentClusterLoad ?? m.clusterLoad;
    if (load !== undefined) { md += `<tr><td>Current Load</td><td><strong>${load}</strong></td></tr>\n`; }
    const remaining = m.clusterCapacityRemaining ?? m.clusterRemainingCapacity;
    if (remaining !== undefined) { md += `<tr><td>Remaining Capacity</td><td><strong>${remaining}</strong></td></tr>\n`; }
    const buffered = m.bufferedClusterCapacityRemaining ?? m.clusterBufferedCapacity;
    if (buffered !== undefined) { md += `<tr><td>Buffered Capacity Remaining</td><td>${buffered}</td></tr>\n`; }
    if (m.nodeBufferPercentage !== undefined) { md += `<tr><td>Node Buffer %</td><td>${m.nodeBufferPercentage}%</td></tr>\n`; }
    md += `<tr><td colspan="2"><hr></td></tr>\n`;
    if (m.minimumNodeLoad !== undefined || m.minNodeLoadValue !== undefined) { md += `<tr><td>Min Node Load</td><td><strong>${m.minimumNodeLoad || m.minNodeLoadValue}</strong> (${m.minNodeLoadNodeId?.id || 'Unknown'})</td></tr>\n`; }
    if (m.maximumNodeLoad !== undefined || m.maxNodeLoadValue !== undefined) { md += `<tr><td>Max Node Load</td><td><strong>${m.maximumNodeLoad || m.maxNodeLoadValue}</strong> (${m.maxNodeLoadNodeId?.id || 'Unknown'})</td></tr>\n`; }
    md += `<tr><td colspan="2"><hr></td></tr>\n`;
    if (m.isBalancedBefore !== undefined) { md += `<tr><td>Balanced Before</td><td>${m.isBalancedBefore ? '✅ Yes' : '❌ No'}</td></tr>\n`; }
    if (m.isBalancedAfter !== undefined) { md += `<tr><td>Balanced After</td><td>${m.isBalancedAfter ? '✅ Yes' : '❌ No'}</td></tr>\n`; }
    if (m.deviationBefore !== undefined) { md += `<tr><td>Deviation Before</td><td>${m.deviationBefore}</td></tr>\n`; }
    if (m.deviationAfter !== undefined) { md += `<tr><td>Deviation After</td><td>${m.deviationAfter}</td></tr>\n`; }
    md += `<tr><td colspan="2"><hr></td></tr>\n`;
    if (m.balancingThreshold !== undefined) { md += `<tr><td>Balancing Threshold</td><td>${m.balancingThreshold}</td></tr>\n`; }
    if (m.activityThreshold !== undefined) { md += `<tr><td>Activity Threshold</td><td>${m.activityThreshold}</td></tr>\n`; }
    if (m.action !== undefined) { md += `<tr><td>Current Action</td><td><em>${m.action}</em></td></tr>\n`; }
    if (m.isClusterCapacityViolation !== undefined) { md += `<tr><td>Capacity Violation</td><td><strong>${m.isClusterCapacityViolation ? '⚠️ YES' : '✅ No'}</strong></td></tr>\n`; }
    md += `</table>\n\n`;
    return md;
}

// ── File I/O ───────────────────────────────────────────────────────────

export async function writeAndOpenReport(
    context: vscode.ExtensionContext,
    clusterEndpoint: string,
    prefix: string,
    markdown: string,
    progress: vscode.Progress<{ message?: string; increment?: number }>,
): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const fileName = `${prefix}-${timestamp}.md`;
    const clusterName = clusterEndpoint.replace(/[^a-zA-Z0-9]/g, '_');
    const dirPath = path.join(context.globalStorageUri.fsPath, clusterName, 'reports');
    await vscode.workspace.fs.createDirectory(vscode.Uri.file(dirPath));

    const filePath = path.join(dirPath, fileName);
    await vscode.workspace.fs.writeFile(vscode.Uri.file(filePath), new TextEncoder().encode(markdown));

    progress.report({ increment: 20, message: 'Opening report...' });
    SfUtility.outputLog(`Report saved to: ${filePath}`, null, debugLevel.info);

    await openMarkdownFilePreview(filePath);
    SfUtility.showInformation(`Report generated: ${fileName}`);
}

/**
 * Serialize tree item to JSON (including children recursively).
 */
export function serializeTreeItem(item: any, depth: number = 0, maxDepth: number = 10): any {
    if (depth > maxDepth) { return { _truncated: true, message: 'Max depth reached' }; }

    const serialized: any = {
        label: item.label,
        itemType: item.itemType,
        itemId: item.itemId,
        tooltip: item.tooltip,
        description: item.description,
        healthState: item.healthState,
        clusterEndpoint: item.clusterEndpoint,
        applicationId: item.applicationId,
        serviceId: item.serviceId,
        partitionId: item.partitionId,
        replicaId: item.replicaId,
        contextValue: item.contextValue,
        collapsibleState: item.collapsibleState,
    };

    if (item.children && Array.isArray(item.children) && item.children.length > 0) {
        serialized.children = item.children.map((child: any) => serializeTreeItem(child, depth + 1, maxDepth));
        serialized._childCount = item.children.length;
    }

    Object.keys(serialized).forEach(key => {
        if (serialized[key] === undefined || serialized[key] === null) { delete serialized[key]; }
    });
    return serialized;
}
