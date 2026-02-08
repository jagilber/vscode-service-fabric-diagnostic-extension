/**
 * Commands reference report generator.
 */

import * as vscode from 'vscode';
import { SfMgr } from '../../sfMgr';
import { SfUtility } from '../../sfUtility';
import { resolveClusterEndpoint, writeAndOpenReport } from './ReportUtils';

export async function generateCommandsReference(
    context: vscode.ExtensionContext,
    sfMgr: SfMgr,
    item: any,
): Promise<void> {
    if (!item || item.itemType !== 'commands') {
        SfUtility.showWarning('This command is only available for Commands');
        return;
    }
    const clusterEndpoint = resolveClusterEndpoint(item, sfMgr);
    if (!clusterEndpoint) { return; }

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Generating Commands Reference',
        cancellable: false,
    }, async (progress) => {
        progress.report({ increment: 20, message: 'Building command reference...' });
        progress.report({ increment: 40, message: 'Generating markdown...' });

        let markdown = `# Service Fabric Cluster Commands Reference\n\n`;
        markdown += `**Cluster:** \`${clusterEndpoint}\`  \n`;
        markdown += `**Generated:** ${new Date().toLocaleString()}  \n\n---\n\n`;
        markdown += `## About\n\nThis reference guide contains cluster management commands organized by category.\n\n---\n\n`;

        const categories: [string, string, [string, string, string][]][] = [
            ['Cluster Operations', 'Commands for managing cluster-level operations.', [
                ['Start Cluster Upgrade', 'Initiates a cluster upgrade to a new version', '🟡 Medium'],
                ['Rollback Cluster Upgrade', 'Rolls back an in-progress cluster upgrade', '🟠 High'],
                ['Update Cluster Configuration', 'Updates cluster configuration settings', '🟡 Medium'],
                ['Recover System Partitions', 'Recovers system service partitions from seed nodes', '🔴 Critical'],
                ['Reset Partition Loads', 'Resets resource balancer load information', '🟢 Low'],
            ]],
            ['Application Lifecycle', 'Commands for managing application deployment and upgrades.', [
                ['Provision Application Type', 'Uploads and provisions an application type to the cluster', '🟢 Low'],
                ['Create Application', 'Creates an application instance from a provisioned type', '🟢 Low'],
                ['Start Application Upgrade', 'Initiates an application upgrade', '🟡 Medium'],
                ['Rollback Application Upgrade', 'Rolls back an in-progress application upgrade', '🟠 High'],
            ]],
            ['Partition & Replica Operations', 'Commands for managing service partitions and replicas.', [
                ['Move Primary Replica', 'Moves a primary replica to another node', '🟡 Medium'],
                ['Move Secondary Replica', 'Moves a secondary replica to another node', '🟢 Low'],
                ['Reset Partition Load', 'Resets load information for a specific partition', '🟢 Low'],
                ['Report Custom Health', 'Reports custom health for a cluster entity', '🟢 Low'],
            ]],
            ['Testing & Chaos', 'Commands for chaos testing and fault injection scenarios.', [
                ['Start Chaos Test', 'Starts continuous fault injection testing', '🟠 High'],
                ['Stop Chaos Test', 'Stops an active chaos test', '🟢 Low'],
                ['Query Chaos Events', 'Retrieves events from chaos test runs', '🟢 Low'],
                ['Restart Partition (Data Loss)', 'Forces a partition restart with potential data loss', '🔴 Critical'],
            ]],
            ['Backup & Restore', 'Commands for backup policy management and restore operations.', [
                ['Enable Backup', 'Enables periodic backup for a partition', '🟢 Low'],
                ['Disable Backup', 'Disables backup for a partition', '🟢 Low'],
                ['Trigger Ad-hoc Backup', 'Triggers an immediate one-time backup', '🟢 Low'],
                ['Get Backup Progress', 'Queries the status of a backup operation', '🟢 Low'],
                ['Restore from Backup', 'Restores a partition from a backup', '🟠 High'],
            ]],
            ['Repair & Infrastructure', 'Commands for repair task management and infrastructure operations.', [
                ['View Active Repair Tasks', 'Lists all active repair tasks in the cluster', '🟢 Low'],
                ['Create Repair Task', 'Creates a new repair task', '🟡 Medium'],
                ['Cancel Repair Task', 'Cancels a pending repair task', '🟡 Medium'],
                ['Force Approve Repair Task', 'Forces approval (bypasses safety checks)', '🔴 Critical'],
            ]],
        ];

        categories.forEach(([title, desc, cmds]) => {
            markdown += `## ${title}\n\n${desc}\n\n`;
            markdown += `| Command | Description | Risk Level |\n|---------|-------------|------------|\n`;
            cmds.forEach(([name, description, risk]) => {
                markdown += `| **${name}** | ${description} | ${risk} |\n`;
            });
            markdown += `\n`;
        });

        markdown += `---\n\n## Risk Level Legend\n\n| Symbol | Level | Description |\n|--------|-------|-------------|\n`;
        markdown += `| 🟢 | **Low** | Safe operations with minimal impact |\n`;
        markdown += `| 🟡 | **Medium** | May cause temporary disruption |\n`;
        markdown += `| 🟠 | **High** | Can cause service interruption |\n`;
        markdown += `| 🔴 | **Critical** | Dangerous — requires extreme caution |\n\n`;
        markdown += `---\n\n## Best Practices\n\n`;
        markdown += `1. **Always validate cluster health** before executing high-risk commands\n`;
        markdown += `2. **Use Chaos testing** only in pre-production/test environments\n`;
        markdown += `3. **Test upgrades** in a development environment first\n`;
        markdown += `4. **Monitor progress** during and after executing commands\n`;
        markdown += `5. **Have a rollback plan** for critical operations\n`;
        markdown += `6. **Document changes** for audit and troubleshooting\n\n`;
        markdown += `---\n\n*Reference generated by Service Fabric Diagnostic Extension*\n`;

        await writeAndOpenReport(context, clusterEndpoint, 'commands-reference', markdown, progress);
    });
}
