/**
 * Repair tasks report generator.
 */

import * as vscode from 'vscode';
import { SfMgr } from '../../sfMgr';
import { SfUtility } from '../../sfUtility';
import {
    resolveClusterEndpoint,
    groupBy,
    sortedEntries,
    writeAndOpenReport,
} from './ReportUtils';

export async function generateRepairTasksReport(
    context: vscode.ExtensionContext,
    sfMgr: SfMgr,
    item: any,
): Promise<void> {
    if (!item || item.itemType !== 'repair-tasks') {
        SfUtility.showWarning('This command is only available for Repair Tasks');
        return;
    }
    const clusterEndpoint = resolveClusterEndpoint(item, sfMgr);
    if (!clusterEndpoint) { return; }

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Generating Repair Tasks Report',
        cancellable: false,
    }, async (progress) => {
        progress.report({ increment: 10, message: 'Fetching repair tasks...' });
        const sfRest = sfMgr.getCurrentSfConfig().getSfRest();
        const tasks = await sfRest.getRepairTasks();

        progress.report({ increment: 40, message: `Processing ${tasks.length} tasks...` });
        progress.report({ increment: 30, message: 'Generating markdown...' });

        let markdown = `# Service Fabric Repair Tasks Report\n\n`;
        markdown += `**Cluster:** \`${clusterEndpoint}\`  \n`;
        markdown += `**Generated:** ${new Date().toLocaleString()}  \n`;
        markdown += `**Total Tasks:** ${tasks.length}  \n\n---\n\n`;

        if (tasks.length === 0) {
            markdown += `## No Repair Tasks Found\n\nNo repair tasks are currently active or have been executed recently.\n`;
        } else {
            const byState = groupBy(tasks, (t: any) => t.state || 'Unknown');
            const byResult = groupBy(tasks, (t: any) => t.resultStatus || 'Pending');
            const byAction = groupBy(tasks, (t: any) => t.action || 'Unknown');
            const byNode = new Map<string, any[]>();
            tasks.forEach((t: any) => {
                (t.target?.nodeNames || []).forEach((n: string) => {
                    if (!byNode.has(n)) { byNode.set(n, []); }
                    byNode.get(n)!.push(t);
                });
            });

            const stateEmojis: Record<string, string> = { Completed: '✅', Approved: '👍', Executing: '⚙️', Restoring: '🔄', Preparing: '📋', Claimed: '🤝', Created: '🆕', Invalid: '❌' };
            const resultEmojis: Record<string, string> = { Succeeded: '✅', Pending: '⏳', Cancelled: '🚫', Interrupted: '⚠️', Failed: '❌' };

            markdown += `## Summary\n\n### By State\n\n| State | Count | Emoji |\n|-------|-------|-------|\n`;
            sortedEntries(byState).forEach(([s, ts]) => { markdown += `| ${s} | ${ts.length} | ${stateEmojis[s] || '⚪'} |\n`; });
            markdown += `\n### By Result Status\n\n| Status | Count | Emoji |\n|--------|-------|-------|\n`;
            sortedEntries(byResult).forEach(([r, ts]) => { markdown += `| ${r} | ${ts.length} | ${resultEmojis[r] || '⚪'} |\n`; });
            markdown += `\n### By Action Type\n\n| Action | Count |\n|--------|-------|\n`;
            sortedEntries(byAction).forEach(([a, ts]) => { markdown += `| ${a} | ${ts.length} |\n`; });
            markdown += `\n### Impact by Node\n\n| Node | Task Count |\n|------|------------|\n`;
            sortedEntries(byNode).forEach(([n, ts]) => { markdown += `| ${n} | ${ts.length} |\n`; });
            markdown += `\n---\n\n## Detailed Task List\n\n`;

            const sorted = [...tasks].sort((a: any, b: any) => {
                const tA = a.history?.createdUtcTimestamp ? new Date(a.history.createdUtcTimestamp).getTime() : 0;
                const tB = b.history?.createdUtcTimestamp ? new Date(b.history.createdUtcTimestamp).getTime() : 0;
                return tB - tA;
            });

            sorted.forEach((task: any, idx: number) => {
                const state = task.state || 'Unknown';
                const result = task.resultStatus || 'Pending';
                markdown += `### ${idx + 1}. ${stateEmojis[state] || '⚪'} Task: ${task.taskId}\n\n`;
                markdown += `<table>\n`;
                markdown += `<tr><td><strong>Property</strong></td><td><strong>Value</strong></td></tr>\n`;
                markdown += `<tr><td>State</td><td><strong>${stateEmojis[state] || '⚪'} ${state}</strong></td></tr>\n`;
                markdown += `<tr><td>Result Status</td><td><strong>${resultEmojis[result] || '⚪'} ${result}</strong></td></tr>\n`;
                if (task.action) { markdown += `<tr><td>Action</td><td><code>${task.action}</code></td></tr>\n`; }
                if (task.executor) { markdown += `<tr><td>Executor</td><td><code>${task.executor}</code></td></tr>\n`; }
                if (task.target?.nodeNames) {
                    markdown += `<tr><td>Target Nodes</td><td>${task.target.nodeNames.map((n: string) => `<code>${n}</code>`).join(', ')}</td></tr>\n`;
                }
                if (task.impact?.nodeImpactList) {
                    markdown += `<tr><td>Impact Level</td><td><strong>${task.impact.nodeImpactList.map((i: any) => i.impactLevel).join(', ')}</strong></td></tr>\n`;
                }
                if (task.resultDetails) { markdown += `<tr><td>Result Details</td><td>${task.resultDetails}</td></tr>\n`; }
                if (task.resultCode !== undefined) { markdown += `<tr><td>Result Code</td><td>${task.resultCode}</td></tr>\n`; }

                if (task.history) {
                    markdown += `<tr><td colspan="2"><hr></td></tr>\n<tr><td colspan="2"><strong>Timeline</strong></td></tr>\n`;
                    const h = task.history;
                    for (const [label, key] of [['Created', 'createdUtcTimestamp'], ['Claimed', 'claimedUtcTimestamp'], ['Preparing', 'preparingUtcTimestamp'], ['Approved', 'approvedUtcTimestamp'], ['Executing', 'executingUtcTimestamp'], ['Restoring', 'restoringUtcTimestamp'], ['Completed', 'completedUtcTimestamp']]) {
                        if (h[key]) { markdown += `<tr><td>${label}</td><td>${new Date(h[key]).toLocaleString()}</td></tr>\n`; }
                    }
                    if (h.completedUtcTimestamp && h.createdUtcTimestamp) {
                        const dur = new Date(h.completedUtcTimestamp).getTime() - new Date(h.createdUtcTimestamp).getTime();
                        markdown += `<tr><td><strong>Total Duration</strong></td><td><strong>${Math.floor(dur / 60000)}m ${Math.floor((dur % 60000) / 1000)}s</strong></td></tr>\n`;
                    }
                }
                markdown += `</table>\n\n`;
                markdown += `<details>\n<summary>📋 Full Task JSON</summary>\n\n\`\`\`json\n${JSON.stringify(task, null, 2)}\n\`\`\`\n</details>\n\n---\n\n`;
            });
        }
        markdown += `\n---\n\n*Report generated by Service Fabric Diagnostic Extension*\n`;

        await writeAndOpenReport(context, clusterEndpoint, 'repair-tasks-report', markdown, progress);
    });
}
