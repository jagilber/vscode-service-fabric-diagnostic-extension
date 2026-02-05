'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import { SfMgr } from './sfMgr';
import { SfPrompts } from './sfPrompts';
import { SfUtility, debugLevel } from './sfUtility';
import { ManagementWebviewProvider } from './views/ManagementWebviewProvider';
import { ClusterMapView } from './views/ClusterMapView';
import { registerClusterCommands } from './commands/ClusterCommands';
import { registerNodeCommands } from './commands/NodeCommands';
import { registerResourceCommands } from './commands/ResourceCommands';
import { registerCommandWithErrorHandling, registerSimpleCommand } from './utils/CommandUtils';
import { ItemTypes } from './constants/ItemTypes';

// Global references for cleanup
let sfMgrInstance: SfMgr | undefined;
let sfPromptsInstance: SfPrompts | undefined;


export async function activate(context: vscode.ExtensionContext) {
    try {
        console.log('[SF Extension] 1/10 - Starting activation...');
        
        // CRITICAL: Initialize SfUtility FIRST to create output channel
        SfUtility.init();
        console.log('[SF Extension] 1.5/10 - SfUtility initialized');
        
        SfUtility.outputLog('Service Fabric extension activating', null, debugLevel.info);
        
        // Global unhandled promise rejection handler
        // This catches promise rejections that slip through try-catch blocks or aren't awaited
        const unhandledRejectionHandler = (reason: any, promise: Promise<any>) => {
            console.error('[SF Extension] Unhandled Promise Rejection:', {
                reason: reason,
                reasonString: String(reason),
                stack: reason?.stack,
                promise: promise
            });
            SfUtility.outputLog('Unhandled Promise Rejection', reason, debugLevel.error);
            
            // Only show user-facing errors for critical failures
            if (reason && !String(reason).includes('NetworkError') && !String(reason).includes('Request error')) {
                vscode.window.showErrorMessage(`Service Fabric Extension Error: ${reason?.message || String(reason)}`);
            }
        };
        
        console.log('[SF Extension] 2/10 - Setting up error handlers...');
        process.on('unhandledRejection', unhandledRejectionHandler);
        
        // Clean up handler on deactivation
        context.subscriptions.push({
            dispose: () => {
                process.off('unhandledRejection', unhandledRejectionHandler);
            }
        });
        
        console.log('[SF Extension] 3/10 - Setting context...');
        // Set context key to make views visible - add timeout to prevent hanging
        await Promise.race([
            vscode.commands.executeCommand('setContext', 'serviceFabricActive', true),
            new Promise((_, reject) => setTimeout(() => reject(new Error('setContext timeout')), 5000))
        ]).catch(err => {
            console.warn('[SF Extension] setContext failed or timed out:', err);
            // Continue anyway - non-critical
        });
        
        const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
            ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

        console.log('[SF Extension] 4/10 - Creating SfMgr...');
        const sfMgr = new SfMgr(context);
        console.log('[SF Extension] 5/10 - Creating SfPrompts...');
        const sfPrompts = new SfPrompts(context);
    
    console.log('[SF Extension] 6/10 - Storing instances...');
    // Store for cleanup
    sfMgrInstance = sfMgr;
    sfPromptsInstance = sfPrompts;
    
    console.log('[SF Extension] 7/10 - Registering Management WebView...');
    // Register Management WebView provider
    const managementProvider = new ManagementWebviewProvider(context.extensionUri, sfMgr);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            ManagementWebviewProvider.viewType,
            managementProvider
        )
    );
    
    console.log('[SF Extension] 8/10 - Registering commands...');
    
    // Register node management commands
    registerNodeCommands(context, sfMgr);
    
    // Register resource management commands (delete service, application, replica, etc)
    registerResourceCommands(context, sfMgr);
    
    // Simple view commands (no error handling needed)
    registerSimpleCommand(context, 'serviceFabricClusterView.refreshView', () => {
        sfMgr.sfClusterView.refresh();
    });
    
    registerSimpleCommand(context, 'sfClusterExplorer.showManagementView', () => {
        vscode.commands.executeCommand('serviceFabricManagementPanel.focus');
    });
    
    registerSimpleCommand(context, 'sfClusterExplorer.deployApplicationFromContext', async () => {
        await vscode.commands.executeCommand('serviceFabricManagementPanel.focus');
        SfUtility.showInformation('Use the Management panel to deploy applications');
    });

    
    // Generate Events Report (Markdown)
    /**
     * Infer health state from event kind and content when HealthState is not provided
     * Treats "completed", "started", etc. as Ok/green unless error/failure keywords present
     */
    function inferEventHealthState(event: any): string {
        // If explicit HealthState exists and is not 'Unknown', use it
        const explicitHealth = event.HealthState || event.healthState;
        if (explicitHealth && explicitHealth !== 'Unknown') {
            return explicitHealth;
        }

        const kind = (event.Kind || event.kind || '').toLowerCase();
        const description = (event.Description || event.description || '').toLowerCase();
        const combined = `${kind} ${description}`;

        // Check for error/failure indicators first (highest priority)
        if (combined.match(/error|failed|failure|fault|unhealthy|down|critical|invalid/)) {
            return 'Error';
        }

        // Check for warning indicators
        if (combined.match(/warning|degrad|slow|timeout|retry/)) {
            return 'Warning';
        }

        // Check for success/informational indicators
        if (combined.match(/completed|started|created|healthy|ok|success|up|ready|deployed|upgraded|activated|opened|closed|new|cleared|resolved/)) {
            return 'Ok';
        }

        // Special cases by event kind
        if (kind.includes('health') && !kind.includes('unhealthy')) {
            return 'Ok'; // Health reports without issues
        }

        // Default to Unknown for truly unknown events
        return 'Unknown';
    }

    registerCommand(context, 'sfClusterExplorer.generateEventsReport', async (item: any) => {
        try {
            if (!item || item.itemType !== 'events') {
                SfUtility.showWarning('This command is only available for Events');
                return;
            }

            const clusterEndpoint = item.clusterEndpoint || sfMgr.getCurrentSfConfig().getClusterEndpoint();
            if (!clusterEndpoint) {
                SfUtility.showWarning('No cluster endpoint available');
                return;
            }

            SfUtility.outputLog('Generating events report...', null, debugLevel.info);

            // Show progress
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Generating Events Report',
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 10, message: 'Fetching cluster events...' });

                const sfRest = sfMgr.getCurrentSfConfig().getSfRest();
                
                // Get last 7 days of events (EventStore retention)
                const endTime = new Date();
                const startTime = new Date();
                startTime.setDate(startTime.getDate() - 7);
                
                const events = await sfRest.getClusterEvents(
                    startTime.toISOString(),
                    endTime.toISOString()
                );

                progress.report({ increment: 40, message: `Processing ${events.length} events...` });

                // Generate markdown report
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
                const fileName = `events-report-${timestamp}.md`;
                
                const clusterName = clusterEndpoint.replace(/[^a-zA-Z0-9]/g, '_');
                const dirPath = path.join(context.globalStorageUri.fsPath, clusterName, 'reports');
                
                // Ensure directory exists
                await vscode.workspace.fs.createDirectory(vscode.Uri.file(dirPath));
                
                progress.report({ increment: 30, message: 'Generating markdown...' });

                // Create markdown content
                let markdown = `# Service Fabric Cluster Events Report\n\n`;
                markdown += `**Cluster:** \`${clusterEndpoint}\`  \n`;
                markdown += `**Generated:** ${new Date().toLocaleString()}  \n`;
                markdown += `**Period:** ${startTime.toLocaleDateString()} - ${endTime.toLocaleDateString()}  \n`;
                markdown += `**Total Events:** ${events.length}  \n\n`;
                markdown += `---\n\n`;

                if (events.length === 0) {
                    markdown += `## No Events Found\n\n`;
                    markdown += `No cluster events were found in the EventStore for the specified time period.\n\n`;
                    markdown += `**Note:** EventStore typically retains events for 7 days. If you expect events, check that:\n`;
                    markdown += `- EventStore service is healthy and running\n`;
                    markdown += `- The cluster has completed initialization\n`;
                    markdown += `- Events have occurred during this time period\n`;
                } else {
                    // Group events by Kind (event type)
                    const eventsByKind = new Map<string, any[]>();
                    events.forEach((event: any) => {
                        // Service Fabric uses Kind for event type (e.g., ClusterNewHealthReport, NodeDown, etc.)
                        const kind = event.Kind || event.kind || 'Other';
                        if (!eventsByKind.has(kind)) {
                            eventsByKind.set(kind, []);
                        }
                        eventsByKind.get(kind)!.push(event);
                    });

                    // Summary section with color-coded health states
                    markdown += `## Event Summary\n\n`;
                    markdown += `| Event Type | Count | Health 🔴🟡🟢 |\n`;
                    markdown += `|------------|-------|-------------|\n`;
                    [...eventsByKind.entries()]
                        .sort((a, b) => b[1].length - a[1].length)
                        .forEach(([kind, kindEvents]) => {
                            // Count health states in this category (with intelligent inference)
                            const healthCounts = { Error: 0, Warning: 0, Ok: 0, Unknown: 0 };
                            kindEvents.forEach((evt: any) => {
                                const health = inferEventHealthState(evt);
                                if (health in healthCounts) {
                                    (healthCounts as any)[health]++;
                                }
                            });
                            const healthSummary = `🔴${healthCounts.Error} 🟡${healthCounts.Warning} 🟢${healthCounts.Ok}`;
                            markdown += `| ${kind} | ${kindEvents.length} | ${healthSummary} |\n`;
                        });
                    markdown += `\n`;
                    
                    // Overall health distribution (with intelligent inference)
                    const totalHealthCounts = { Error: 0, Warning: 0, Ok: 0, Unknown: 0 };
                    events.forEach((evt: any) => {
                        const health = inferEventHealthState(evt);
                        if (health in totalHealthCounts) {
                            (totalHealthCounts as any)[health]++;
                        }
                    });
                    markdown += `**Overall Health Distribution:**  \n`;
                    markdown += `🔴 Error: ${totalHealthCounts.Error} | `;
                    markdown += `🟡 Warning: ${totalHealthCounts.Warning} | `;
                    markdown += `🟢 Ok: ${totalHealthCounts.Ok} | `;
                    markdown += `⚪ Unknown: ${totalHealthCounts.Unknown}\n\n`;
                    markdown += `---\n\n`;

                    // Detailed events by kind
                    markdown += `## Detailed Events\n\n`;
                    [...eventsByKind.entries()]
                        .sort((a, b) => b[1].length - a[1].length)
                        .forEach(([kind, kindEvents]) => {
                            markdown += `### ${kind} (${kindEvents.length} events)\n\n`;
                            
                            // Sort events by timestamp (newest first)
                            const sortedEvents = kindEvents.sort((a: any, b: any) => {
                                // Service Fabric returns PascalCase: TimeStamp
                                const timeA = new Date(a.TimeStamp || a.timeStamp || a.eventInstanceId || 0).getTime();
                                const timeB = new Date(b.TimeStamp || b.timeStamp || b.eventInstanceId || 0).getTime();
                                return timeB - timeA;
                            });

                            sortedEvents.forEach((event: any) => {
                                // Service Fabric returns PascalCase fields: TimeStamp, SourceId, Kind, HealthState, etc.
                                const timestamp = event.TimeStamp || event.timeStamp || event.eventInstanceId;
                                const eventKind = event.Kind || event.kind || 'Event';
                                const healthState = inferEventHealthState(event); // Use intelligent inference
                                const category = event.Category || event.category;
                                
                                // Health state emoji
                                let healthEmoji = '⚪';
                                if (healthState === 'Error') healthEmoji = '🔴';
                                else if (healthState === 'Warning') healthEmoji = '🟡';
                                else if (healthState === 'Ok') healthEmoji = '🟢';
                                
                                markdown += `#### ${healthEmoji} ${eventKind}\n\n`;
                                markdown += `<table>\n`;
                                markdown += `<tr><td><strong>Property</strong></td><td><strong>Value</strong></td></tr>\n`;
                                
                                // Format timestamp properly
                                if (timestamp) {
                                    try {
                                        const date = new Date(timestamp);
                                        if (!isNaN(date.getTime())) {
                                            markdown += `<tr><td>Time</td><td>${date.toLocaleString()}</td></tr>\n`;
                                        } else {
                                            markdown += `<tr><td>Time</td><td>${timestamp}</td></tr>\n`;
                                        }
                                    } catch (e) {
                                        markdown += `<tr><td>Time</td><td>${timestamp}</td></tr>\n`;
                                    }
                                } else {
                                    markdown += `<tr><td>Time</td><td>Unknown</td></tr>\n`;
                                }
                                
                                // Add health state
                                if (healthState) {
                                    markdown += `<tr><td>Health State</td><td><strong>${healthEmoji} ${healthState}</strong></td></tr>\n`;
                                }
                                
                                // Add category if present
                                if (category) {
                                    markdown += `<tr><td>Category</td><td>${category}</td></tr>\n`;
                                }
                                
                                // Add key properties (check PascalCase first)
                                if (event.NodeName || event.nodeName) {
                                    markdown += `<tr><td>Node</td><td><code>${event.NodeName || event.nodeName}</code></td></tr>\n`;
                                }
                                if (event.ApplicationName || event.applicationName) {
                                    markdown += `<tr><td>Application</td><td><code>${event.ApplicationName || event.applicationName}</code></td></tr>\n`;
                                }
                                if (event.ServiceName || event.serviceName) {
                                    markdown += `<tr><td>Service</td><td><code>${event.ServiceName || event.serviceName}</code></td></tr>\n`;
                                }
                                if (event.PartitionId || event.partitionId) {
                                    markdown += `<tr><td>Partition ID</td><td><code>${event.PartitionId || event.partitionId}</code></td></tr>\n`;
                                }
                                if (event.ReplicaId || event.replicaId) {
                                    markdown += `<tr><td>Replica ID</td><td><code>${event.ReplicaId || event.replicaId}</code></td></tr>\n`;
                                }
                                if (event.SourceId || event.sourceId) {
                                    markdown += `<tr><td>Source ID</td><td><code>${event.SourceId || event.sourceId}</code></td></tr>\n`;
                                }
                                if (event.Property || event.property) {
                                    markdown += `<tr><td>Property</td><td>${event.Property || event.property}</td></tr>\n`;
                                }
                                if (event.Description) {
                                    markdown += `<tr><td>Description</td><td>${event.Description}</td></tr>\n`;
                                }
                                if (event.Reason || event.reason) {
                                    markdown += `<tr><td>Reason</td><td>${event.Reason || event.reason}</td></tr>\n`;
                                }
                                if (event.Error || event.error) {
                                    markdown += `<tr><td>Error</td><td><code>${event.Error || event.error}</code></td></tr>\n`;
                                }
                                if (event.SequenceNumber !== undefined) {
                                    markdown += `<tr><td>Sequence Number</td><td>${event.SequenceNumber}</td></tr>\n`;
                                }
                                
                                markdown += `</table>\n\n`;
                                
                                // Add full event details in collapsible section
                                markdown += `<details>\n<summary>📋 Full Event JSON</summary>\n\n\`\`\`json\n`;
                                markdown += JSON.stringify(event, null, 2);
                                markdown += `\n\`\`\`\n</details>\n\n`;
                                markdown += `---\n\n`;
                            });
                        });
                }

                markdown += `\n---\n\n`;
                markdown += `*Report generated by Service Fabric Diagnostic Extension*\n`;

                // Write file
                const filePath = path.join(dirPath, fileName);
                await vscode.workspace.fs.writeFile(
                    vscode.Uri.file(filePath),
                    new TextEncoder().encode(markdown)
                );

                progress.report({ increment: 20, message: 'Opening report...' });

                SfUtility.outputLog(`Events report saved to: ${filePath}`, null, debugLevel.info);

                // Open the markdown file
                const doc = await vscode.workspace.openTextDocument(filePath);
                await vscode.window.showTextDocument(doc, { preview: false });

                // Show preview
                await vscode.commands.executeCommand('markdown.showPreview', vscode.Uri.file(filePath));

                SfUtility.showInformation(`Events report generated: ${fileName}`);
            });
        } catch (error) {
            SfUtility.outputLog('Command generateEventsReport failed', error, debugLevel.error);
            SfUtility.showError(`Failed to generate events report: ${error}`);
        }
    });

    // Generate Health Report (Markdown)
    registerCommand(context, 'sfClusterExplorer.generateHealthReport', async (item: any) => {
        try {
            const clusterEndpoint = item?.clusterEndpoint || sfMgr.getCurrentSfConfig().getClusterEndpoint();
            if (!clusterEndpoint) {
                SfUtility.showWarning('No cluster endpoint available');
                return;
            }

            SfUtility.outputLog('Generating health report...', null, debugLevel.info);

            // Show progress
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Generating Health Report',
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 10, message: 'Fetching cluster health...' });

                const sfRest = sfMgr.getCurrentSfConfig().getSfRest();
                
                // Get cluster health
                const clusterHealth = await sfRest.getClusterHealth();
                
                progress.report({ increment: 20, message: 'Fetching nodes health...' });
                
                // Get nodes
                const nodes = await sfRest.getNodes();
                
                progress.report({ increment: 20, message: 'Fetching applications health...' });
                
                // Get applications
                const applications = await sfRest.getApplications();

                progress.report({ increment: 30, message: 'Generating markdown...' });

                // Generate markdown report
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
                const fileName = `health-report-${timestamp}.md`;
                
                const clusterName = clusterEndpoint.replace(/[^a-zA-Z0-9]/g, '_');
                const dirPath = path.join(context.globalStorageUri.fsPath, clusterName, 'reports');
                
                // Ensure directory exists
                await vscode.workspace.fs.createDirectory(vscode.Uri.file(dirPath));

                // Create markdown content
                let markdown = `# Service Fabric Cluster Health Report\n\n`;
                markdown += `**Cluster:** \`${clusterEndpoint}\`  \n`;
                markdown += `**Generated:** ${new Date().toLocaleString()}  \n\n`;
                markdown += `---\n\n`;

                // Cluster overall health
                const healthEmoji = (state: string) => {
                    if (state === 'Error') return '🔴';
                    if (state === 'Warning') return '🟡';
                    if (state === 'Ok') return '🟢';
                    return '⚪';
                };

                const clusterHealthState = clusterHealth.aggregatedHealthState || 'Unknown';
                markdown += `## Cluster Health: ${healthEmoji(clusterHealthState)} ${clusterHealthState}\n\n`;

                // Health statistics
                if (clusterHealth.healthStatistics) {
                    markdown += `### Health Statistics\n\n`;
                    markdown += `| Category | Ok | Warning | Error |\n`;
                    markdown += `|----------|----|---------| ------|\n`;
                    
                    const stats = clusterHealth.healthStatistics;
                    if (stats.healthStateCountList) {
                        stats.healthStateCountList.forEach((stat: any) => {
                            markdown += `| ${stat.entityKind} | `;
                            markdown += `${stat.okCount || 0} | `;
                            markdown += `${stat.warningCount || 0} | `;
                            markdown += `${stat.errorCount || 0} |\n`;
                        });
                    }
                    markdown += `\n`;
                }

                // Unhealthy evaluations
                if (clusterHealth.unhealthyEvaluations && clusterHealth.unhealthyEvaluations.length > 0) {
                    markdown += `### ⚠️ Unhealthy Evaluations\n\n`;
                    clusterHealth.unhealthyEvaluations.forEach((evaluation: any) => {
                        markdown += `- **${evaluation.kind || 'Unknown'}**: ${evaluation.description || 'No description'}\n`;
                    });
                    markdown += `\n`;
                }

                // Nodes Health
                markdown += `## Nodes Health (${nodes.length} nodes)\n\n`;
                markdown += `| Node | Health | Status | Type | Seed |\n`;
                markdown += `|------|--------|--------|------|------|\n`;
                
                nodes.forEach((node: any) => {
                    const health = node.healthState || 'Unknown';
                    const status = node.nodeStatus || 'Unknown';
                    const type = node.type || 'Unknown';
                    const isSeed = node.isSeedNode ? '✅' : '';
                    markdown += `| ${node.name} | ${healthEmoji(health)} ${health} | ${status} | ${type} | ${isSeed} |\n`;
                });
                markdown += `\n`;

                // Group nodes by health state
                const nodesByHealth: Record<string, any[]> = {};
                nodes.forEach((node: any) => {
                    const health = node.healthState || 'Unknown';
                    if (!nodesByHealth[health]) {
                        nodesByHealth[health] = [];
                    }
                    nodesByHealth[health].push(node);
                });

                // Show unhealthy nodes first
                if (nodesByHealth['Error'] && nodesByHealth['Error'].length > 0) {
                    markdown += `### 🔴 Nodes in Error State (${nodesByHealth['Error'].length})\n\n`;
                    nodesByHealth['Error'].forEach((node: any) => {
                        markdown += `#### ${node.name}\n\n`;
                        markdown += `- **Status:** ${node.nodeStatus}\n`;
                        markdown += `- **Type:** ${node.type}\n`;
                        markdown += `- **IP:** ${node.ipAddressOrFQDN}\n`;
                        markdown += `- **Upgrade Domain:** ${node.upgradeDomain}\n`;
                        markdown += `- **Fault Domain:** ${node.faultDomain}\n`;
                        if (node.nodeDeactivationInfo) {
                            markdown += `- **Deactivation:** ${node.nodeDeactivationInfo.intent} (${node.nodeDeactivationInfo.status})\n`;
                        }
                        markdown += `\n`;
                    });
                }

                if (nodesByHealth['Warning'] && nodesByHealth['Warning'].length > 0) {
                    markdown += `### 🟡 Nodes in Warning State (${nodesByHealth['Warning'].length})\n\n`;
                    nodesByHealth['Warning'].forEach((node: any) => {
                        markdown += `- **${node.name}**: ${node.nodeStatus}\n`;
                    });
                    markdown += `\n`;
                }

                // Applications Health
                markdown += `## Applications Health (${applications.length} applications)\n\n`;
                markdown += `| Application | Health | Status | Type | Version |\n`;
                markdown += `|-------------|--------|--------|------|----------|\n`;
                
                applications.forEach((app: any) => {
                    const health = app.healthState || 'Unknown';
                    const status = app.status || 'Unknown';
                    const type = app.typeName || 'Unknown';
                    const version = app.typeVersion || 'Unknown';
                    markdown += `| ${app.name} | ${healthEmoji(health)} ${health} | ${status} | ${type} | ${version} |\n`;
                });
                markdown += `\n`;

                // Group applications by health state
                const appsByHealth: Record<string, any[]> = {};
                applications.forEach((app: any) => {
                    const health = app.healthState || 'Unknown';
                    if (!appsByHealth[health]) {
                        appsByHealth[health] = [];
                    }
                    appsByHealth[health].push(app);
                });

                // Show unhealthy applications
                if (appsByHealth['Error'] && appsByHealth['Error'].length > 0) {
                    markdown += `### 🔴 Applications in Error State (${appsByHealth['Error'].length})\n\n`;
                    appsByHealth['Error'].forEach((app: any) => {
                        markdown += `#### ${app.name}\n\n`;
                        markdown += `- **Status:** ${app.status}\n`;
                        markdown += `- **Type:** ${app.typeName} v${app.typeVersion}\n`;
                        if (app.parameters) {
                            markdown += `- **Parameters:** ${Object.keys(app.parameters).length} configured\n`;
                        }
                        markdown += `\n`;
                    });
                }

                if (appsByHealth['Warning'] && appsByHealth['Warning'].length > 0) {
                    markdown += `### 🟡 Applications in Warning State (${appsByHealth['Warning'].length})\n\n`;
                    appsByHealth['Warning'].forEach((app: any) => {
                        markdown += `- **${app.name}**: ${app.status}\n`;
                    });
                    markdown += `\n`;
                }

                // Health summary
                markdown += `---\n\n`;
                markdown += `## Summary\n\n`;
                
                const healthCounts = { Ok: 0, Warning: 0, Error: 0, Unknown: 0 };
                [...nodes, ...applications].forEach((item: any) => {
                    const health = item.healthState || 'Unknown';
                    if (health in healthCounts) {
                        (healthCounts as any)[health]++;
                    }
                });
                
                markdown += `**Total Resources:** ${nodes.length + applications.length}  \n`;
                markdown += `🟢 Ok: ${healthCounts.Ok} | `;
                markdown += `🟡 Warning: ${healthCounts.Warning} | `;
                markdown += `🔴 Error: ${healthCounts.Error} | `;
                markdown += `⚪ Unknown: ${healthCounts.Unknown}\n\n`;

                if (healthCounts.Error > 0) {
                    markdown += `⚠️ **Action Required:** ${healthCounts.Error} resource(s) in Error state\n\n`;
                } else if (healthCounts.Warning > 0) {
                    markdown += `ℹ️ **Attention:** ${healthCounts.Warning} resource(s) in Warning state\n\n`;
                } else {
                    markdown += `✅ **All systems healthy**\n\n`;
                }

                markdown += `---\n\n`;
                markdown += `*Report generated by Service Fabric Diagnostic Extension*\n`;

                // Write file
                const filePath = path.join(dirPath, fileName);
                await vscode.workspace.fs.writeFile(
                    vscode.Uri.file(filePath),
                    new TextEncoder().encode(markdown)
                );

                progress.report({ increment: 20, message: 'Opening report...' });

                SfUtility.outputLog(`Health report saved to: ${filePath}`, null, debugLevel.info);

                // Open the markdown file
                const doc = await vscode.workspace.openTextDocument(filePath);
                await vscode.window.showTextDocument(doc, { preview: false });

                // Show preview
                await vscode.commands.executeCommand('markdown.showPreview', vscode.Uri.file(filePath));

                SfUtility.showInformation(`Health report generated: ${fileName}`);
            });
        } catch (error) {
            SfUtility.outputLog('Command generateHealthReport failed', error, debugLevel.error);
            SfUtility.showError(`Failed to generate health report: ${error}`);
        }
    });

    // Generate Metrics Report (Markdown)
    registerCommand(context, 'sfClusterExplorer.generateMetricsReport', async (item: any) => {
        try {
            if (!item || item.itemType !== 'metrics') {
                SfUtility.showWarning('This command is only available for Metrics');
                return;
            }

            const clusterEndpoint = item.clusterEndpoint || sfMgr.getCurrentSfConfig().getClusterEndpoint();
            if (!clusterEndpoint) {
                SfUtility.showWarning('No cluster endpoint available');
                return;
            }

            SfUtility.outputLog('Generating metrics report...', null, debugLevel.info);

            // Show progress
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Generating Metrics Report',
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 10, message: 'Fetching cluster metrics...' });

                const sfRest = sfMgr.getCurrentSfConfig().getSfRest();
                
                // Get cluster load information
                const loadInfo = await sfRest.getClusterLoadInformation();

                progress.report({ increment: 40, message: 'Processing metrics data...' });

                // Generate markdown report
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
                const fileName = `metrics-report-${timestamp}.md`;
                
                const clusterName = clusterEndpoint.replace(/[^a-zA-Z0-9]/g, '_');
                const dirPath = path.join(context.globalStorageUri.fsPath, clusterName, 'reports');
                
                // Ensure directory exists
                await vscode.workspace.fs.createDirectory(vscode.Uri.file(dirPath));
                
                progress.report({ increment: 30, message: 'Generating markdown...' });

                // Create markdown content
                let markdown = `# Service Fabric Cluster Metrics Report\n\n`;
                markdown += `**Cluster:** \`${clusterEndpoint}\`  \n`;
                markdown += `**Generated:** ${new Date().toLocaleString()}  \n\n`;
                markdown += `---\n\n`;

                // Last Balancing Information
                if (loadInfo.lastBalancingStartTimeUtc || loadInfo.lastBalancingEndTimeUtc) {
                    markdown += `## Last Resource Balancing\n\n`;
                    if (loadInfo.lastBalancingStartTimeUtc) {
                        const startTime = new Date(loadInfo.lastBalancingStartTimeUtc);
                        markdown += `**Start Time:** ${startTime.toLocaleString()}  \n`;
                    }
                    if (loadInfo.lastBalancingEndTimeUtc) {
                        const endTime = new Date(loadInfo.lastBalancingEndTimeUtc);
                        markdown += `**End Time:** ${endTime.toLocaleString()}  \n`;
                        if (loadInfo.lastBalancingStartTimeUtc) {
                            const duration = new Date(loadInfo.lastBalancingEndTimeUtc).getTime() - new Date(loadInfo.lastBalancingStartTimeUtc).getTime();
                            markdown += `**Duration:** ${duration}ms  \n`;
                        }
                    }
                    markdown += `\n---\n\n`;
                }

                // Load Metrics
                if (loadInfo.loadMetricInformation && loadInfo.loadMetricInformation.length > 0) {
                    markdown += `## Load Metrics (${loadInfo.loadMetricInformation.length} metrics)\n\n`;
                    
                    // Summary table
                    markdown += `| Metric | Cluster Load | Capacity | Usage % | Min Node | Max Node | Balanced |\n`;
                    markdown += `|--------|--------------|----------|---------|----------|----------|----------|\n`;
                    
                    loadInfo.loadMetricInformation.forEach((metric: any) => {
                        const name = metric.name || 'Unknown';
                        const load = metric.currentClusterLoad || metric.clusterLoad || '0';
                        const capacity = metric.clusterCapacity || 'N/A';
                        const remaining = metric.clusterCapacityRemaining || metric.clusterRemainingCapacity || '0';
                        const minNode = metric.minNodeLoadNodeId?.id || 'N/A';
                        const maxNode = metric.maxNodeLoadNodeId?.id || 'N/A';
                        const isBalanced = metric.isBalancedAfter !== undefined ? (metric.isBalancedAfter ? '✅' : '❌') : 'N/A';
                        
                        // Calculate usage percentage
                        let usagePercent = 'N/A';
                        if (capacity !== 'N/A' && capacity !== '0') {
                            const capacityNum = parseFloat(capacity);
                            const loadNum = parseFloat(load);
                            if (!isNaN(capacityNum) && !isNaN(loadNum) && capacityNum > 0) {
                                usagePercent = `${((loadNum / capacityNum) * 100).toFixed(1)}%`;
                            }
                        }
                        
                        markdown += `| ${name} | ${load} | ${capacity} | ${usagePercent} | ${minNode} | ${maxNode} | ${isBalanced} |\n`;
                    });
                    markdown += `\n`;

                    // Detailed metrics
                    markdown += `## Detailed Metrics\n\n`;
                    
                    loadInfo.loadMetricInformation.forEach((metric: any) => {
                        const name = metric.name || 'Unknown Metric';
                        markdown += `### ${name}\n\n`;
                        
                        // Capacity violation warning
                        if (metric.isClusterCapacityViolation) {
                            markdown += `> ⚠️ **WARNING:** This metric is currently over capacity!\n\n`;
                        }
                        
                        markdown += `<table>\n`;
                        markdown += `<tr><td><strong>Property</strong></td><td><strong>Value</strong></td></tr>\n`;
                        
                        // Resource Capacity
                        if (metric.clusterCapacity !== undefined) {
                            markdown += `<tr><td>Total Capacity</td><td><strong>${metric.clusterCapacity}</strong></td></tr>\n`;
                        }
                        if (metric.currentClusterLoad !== undefined || metric.clusterLoad !== undefined) {
                            const load = metric.currentClusterLoad || metric.clusterLoad;
                            markdown += `<tr><td>Current Load</td><td><strong>${load}</strong></td></tr>\n`;
                        }
                        if (metric.clusterCapacityRemaining !== undefined || metric.clusterRemainingCapacity !== undefined) {
                            const remaining = metric.clusterCapacityRemaining || metric.clusterRemainingCapacity;
                            markdown += `<tr><td>Remaining Capacity</td><td><strong>${remaining}</strong></td></tr>\n`;
                        }
                        if (metric.bufferedClusterCapacityRemaining !== undefined || metric.clusterBufferedCapacity !== undefined) {
                            const buffered = metric.bufferedClusterCapacityRemaining || metric.clusterBufferedCapacity;
                            markdown += `<tr><td>Buffered Capacity Remaining</td><td>${buffered}</td></tr>\n`;
                        }
                        if (metric.nodeBufferPercentage !== undefined) {
                            markdown += `<tr><td>Node Buffer Percentage</td><td>${metric.nodeBufferPercentage}%</td></tr>\n`;
                        }
                        
                        markdown += `<tr><td colspan="2"><hr></td></tr>\n`;
                        
                        // Node Load Range
                        if (metric.minimumNodeLoad !== undefined || metric.minNodeLoadValue !== undefined) {
                            const minLoad = metric.minimumNodeLoad || metric.minNodeLoadValue;
                            const minNodeId = metric.minNodeLoadNodeId?.id || 'Unknown';
                            markdown += `<tr><td>Minimum Node Load</td><td><strong>${minLoad}</strong> (Node: <code>${minNodeId}</code>)</td></tr>\n`;
                        }
                        if (metric.maximumNodeLoad !== undefined || metric.maxNodeLoadValue !== undefined) {
                            const maxLoad = metric.maximumNodeLoad || metric.maxNodeLoadValue;
                            const maxNodeId = metric.maxNodeLoadNodeId?.id || 'Unknown';
                            markdown += `<tr><td>Maximum Node Load</td><td><strong>${maxLoad}</strong> (Node: <code>${maxNodeId}</code>)</td></tr>\n`;
                        }
                        
                        markdown += `<tr><td colspan="2"><hr></td></tr>\n`;
                        
                        // Balancing Status
                        if (metric.isBalancedBefore !== undefined) {
                            const icon = metric.isBalancedBefore ? '✅' : '❌';
                            markdown += `<tr><td>Balanced Before</td><td>${icon} ${metric.isBalancedBefore ? 'Yes' : 'No'}</td></tr>\n`;
                        }
                        if (metric.isBalancedAfter !== undefined) {
                            const icon = metric.isBalancedAfter ? '✅' : '❌';
                            markdown += `<tr><td>Balanced After</td><td>${icon} ${metric.isBalancedAfter ? 'Yes' : 'No'}</td></tr>\n`;
                        }
                        if (metric.deviationBefore !== undefined) {
                            markdown += `<tr><td>Deviation Before</td><td>${metric.deviationBefore}</td></tr>\n`;
                        }
                        if (metric.deviationAfter !== undefined) {
                            markdown += `<tr><td>Deviation After</td><td>${metric.deviationAfter}</td></tr>\n`;
                        }
                        
                        markdown += `<tr><td colspan="2"><hr></td></tr>\n`;
                        
                        // Configuration & Details
                        if (metric.balancingThreshold !== undefined) {
                            markdown += `<tr><td>Balancing Threshold</td><td>${metric.balancingThreshold}</td></tr>\n`;
                        }
                        if (metric.activityThreshold !== undefined) {
                            markdown += `<tr><td>Activity Threshold</td><td>${metric.activityThreshold}</td></tr>\n`;
                        }
                        if (metric.action !== undefined) {
                            markdown += `<tr><td>Current Action</td><td><em>${metric.action}</em></td></tr>\n`;
                        }
                        if (metric.plannedLoadRemoval !== undefined) {
                            markdown += `<tr><td>Planned Load Removal</td><td>${metric.plannedLoadRemoval}</td></tr>\n`;
                        }
                        if (metric.isClusterCapacityViolation !== undefined) {
                            const icon = metric.isClusterCapacityViolation ? '⚠️' : '✅';
                            markdown += `<tr><td>Capacity Violation</td><td><strong>${icon} ${metric.isClusterCapacityViolation ? 'YES' : 'No'}</strong></td></tr>\n`;
                        }
                        
                        markdown += `</table>\n\n`;
                        
                        // Add full metric details in collapsible section
                        markdown += `<details>\n<summary>📋 Full Metric JSON</summary>\n\n\`\`\`json\n`;
                        markdown += JSON.stringify(metric, null, 2);
                        markdown += `\n\`\`\`\n</details>\n\n`;
                        markdown += `---\n\n`;
                    });
                } else {
                    markdown += `## No Metrics Data\n\n`;
                    markdown += `No load metric information is available for this cluster.\n`;
                }

                markdown += `\n---\n\n`;
                markdown += `*Report generated by Service Fabric Diagnostic Extension*\n`;

                // Write file
                const filePath = path.join(dirPath, fileName);
                await vscode.workspace.fs.writeFile(
                    vscode.Uri.file(filePath),
                    new TextEncoder().encode(markdown)
                );

                progress.report({ increment: 20, message: 'Opening report...' });

                SfUtility.outputLog(`Metrics report saved to: ${filePath}`, null, debugLevel.info);

                // Open the markdown file
                const doc = await vscode.workspace.openTextDocument(filePath);
                await vscode.window.showTextDocument(doc, { preview: false });

                // Show preview
                await vscode.commands.executeCommand('markdown.showPreview', vscode.Uri.file(filePath));

                SfUtility.showInformation(`Metrics report generated: ${fileName}`);
            });
        } catch (error) {
            SfUtility.outputLog('Command generateMetricsReport failed', error, debugLevel.error);
            SfUtility.showError(`Failed to generate metrics report: ${error}`);
        }
    });

    // Generate Commands Reference (Markdown)
    registerCommand(context, 'sfClusterExplorer.generateCommandsReference', async (item: any) => {
        try {
            if (!item || item.itemType !== 'commands') {
                SfUtility.showWarning('This command is only available for Commands');
                return;
            }

            const clusterEndpoint = item.clusterEndpoint || sfMgr.getCurrentSfConfig().getClusterEndpoint();
            if (!clusterEndpoint) {
                SfUtility.showWarning('No cluster endpoint available');
                return;
            }

            SfUtility.outputLog('Generating commands reference...', null, debugLevel.info);

            // Show progress
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Generating Commands Reference',
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 20, message: 'Building command reference...' });

                // Generate markdown reference
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
                const fileName = `commands-reference-${timestamp}.md`;
                
                const clusterName = clusterEndpoint.replace(/[^a-zA-Z0-9]/g, '_');
                const dirPath = path.join(context.globalStorageUri.fsPath, clusterName, 'reports');
                
                // Ensure directory exists
                await vscode.workspace.fs.createDirectory(vscode.Uri.file(dirPath));
                
                progress.report({ increment: 40, message: 'Generating markdown...' });

                // Create markdown content
                let markdown = `# Service Fabric Cluster Commands Reference\n\n`;
                markdown += `**Cluster:** \`${clusterEndpoint}\`  \n`;
                markdown += `**Generated:** ${new Date().toLocaleString()}  \n\n`;
                markdown += `---\n\n`;

                markdown += `## About\n\n`;
                markdown += `This reference guide contains cluster management commands organized by category. `;
                markdown += `Each command can be executed from the Commands tree view in VS Code for guided operation.\n\n`;
                markdown += `---\n\n`;

                // Cluster Operations
                markdown += `## Cluster Operations\n\n`;
                markdown += `Commands for managing cluster-level operations.\n\n`;
                markdown += `| Command | Description | Risk Level |\n`;
                markdown += `|---------|-------------|------------|\n`;
                markdown += `| **Start Cluster Upgrade** | Initiates a cluster upgrade to a new version | 🟡 Medium |\n`;
                markdown += `| **Rollback Cluster Upgrade** | Rolls back an in-progress cluster upgrade | 🟠 High |\n`;
                markdown += `| **Update Cluster Configuration** | Updates cluster configuration settings | 🟡 Medium |\n`;
                markdown += `| **Recover System Partitions** | Recovers system service partitions from seed nodes | 🔴 Critical |\n`;
                markdown += `| **Reset Partition Loads** | Resets resource balancer load information | 🟢 Low |\n`;
                markdown += `\n`;

                // Application Lifecycle
                markdown += `## Application Lifecycle\n\n`;
                markdown += `Commands for managing application deployment and upgrades.\n\n`;
                markdown += `| Command | Description | Risk Level |\n`;
                markdown += `|---------|-------------|------------|\n`;
                markdown += `| **Provision Application Type** | Uploads and provisions an application type to the cluster | 🟢 Low |\n`;
                markdown += `| **Create Application** | Creates an application instance from a provisioned type | 🟢 Low |\n`;
                markdown += `| **Start Application Upgrade** | Initiates an application upgrade | 🟡 Medium |\n`;
                markdown += `| **Rollback Application Upgrade** | Rolls back an in-progress application upgrade | 🟠 High |\n`;
                markdown += `\n`;

                // Partition & Replica Operations
                markdown += `## Partition & Replica Operations\n\n`;
                markdown += `Commands for managing service partitions and replicas.\n\n`;
                markdown += `| Command | Description | Risk Level |\n`;
                markdown += `|---------|-------------|------------|\n`;
                markdown += `| **Move Primary Replica** | Moves a primary replica to another node | 🟡 Medium |\n`;
                markdown += `| **Move Secondary Replica** | Moves a secondary replica to another node | 🟢 Low |\n`;
                markdown += `| **Reset Partition Load** | Resets load information for a specific partition | 🟢 Low |\n`;
                markdown += `| **Report Custom Health** | Reports custom health for a cluster entity | 🟢 Low |\n`;
                markdown += `\n`;

                // Testing & Chaos
                markdown += `## Testing & Chaos\n\n`;
                markdown += `Commands for chaos testing and fault injection scenarios.\n\n`;
                markdown += `| Command | Description | Risk Level |\n`;
                markdown += `|---------|-------------|------------|\n`;
                markdown += `| **Start Chaos Test** | Starts continuous fault injection testing | 🟠 High |\n`;
                markdown += `| **Stop Chaos Test** | Stops an active chaos test | 🟢 Low |\n`;
                markdown += `| **Query Chaos Events** | Retrieves events from chaos test runs | 🟢 Low |\n`;
                markdown += `| **Restart Partition (Data Loss)** | Forces a partition restart with potential data loss | 🔴 Critical |\n`;
                markdown += `\n`;

                // Backup & Restore
                markdown += `## Backup & Restore\n\n`;
                markdown += `Commands for backup policy management and restore operations.\n\n`;
                markdown += `| Command | Description | Risk Level |\n`;
                markdown += `|---------|-------------|------------|\n`;
                markdown += `| **Enable Backup** | Enables periodic backup for a partition | 🟢 Low |\n`;
                markdown += `| **Disable Backup** | Disables backup for a partition | 🟢 Low |\n`;
                markdown += `| **Trigger Ad-hoc Backup** | Triggers an immediate one-time backup | 🟢 Low |\n`;
                markdown += `| **Get Backup Progress** | Queries the status of a backup operation | 🟢 Low |\n`;
                markdown += `| **Restore from Backup** | Restores a partition from a backup | 🟠 High |\n`;
                markdown += `\n`;

                // Repair & Infrastructure
                markdown += `## Repair & Infrastructure\n\n`;
                markdown += `Commands for repair task management and infrastructure operations.\n\n`;
                markdown += `| Command | Description | Risk Level |\n`;
                markdown += `|---------|-------------|------------|\n`;
                markdown += `| **View Active Repair Tasks** | Lists all active repair tasks in the cluster | 🟢 Low |\n`;
                markdown += `| **Create Repair Task** | Creates a new repair task | 🟡 Medium |\n`;
                markdown += `| **Cancel Repair Task** | Cancels a pending repair task | 🟡 Medium |\n`;
                markdown += `| **Force Approve Repair Task** | Forces approval of a repair task (bypasses safety checks) | 🔴 Critical |\n`;
                markdown += `\n`;

                markdown += `---\n\n`;

                // Risk Level Legend
                markdown += `## Risk Level Legend\n\n`;
                markdown += `| Symbol | Level | Description |\n`;
                markdown += `|--------|-------|-------------|\n`;
                markdown += `| 🟢 | **Low** | Safe operations with minimal impact on cluster |\n`;
                markdown += `| 🟡 | **Medium** | Operations that may cause temporary disruption |\n`;
                markdown += `| 🟠 | **High** | Operations that can cause service interruption |\n`;
                markdown += `| 🔴 | **Critical** | Dangerous operations requiring extreme caution |\n`;
                markdown += `\n`;

                markdown += `---\n\n`;

                // Best Practices
                markdown += `## Best Practices\n\n`;
                markdown += `1. **Always validate cluster health** before executing high-risk commands\n`;
                markdown += `2. **Use Chaos testing** only in pre-production or test environments\n`;
                markdown += `3. **Test upgrades** in a development environment first\n`;
                markdown += `4. **Monitor progress** during and after executing commands\n`;
                markdown += `5. **Have a rollback plan** for critical operations\n`;
                markdown += `6. **Document changes** for audit and troubleshooting purposes\n\n`;

                markdown += `---\n\n`;
                markdown += `*Reference generated by Service Fabric Diagnostic Extension*\n`;

                // Write file
                const filePath = path.join(dirPath, fileName);
                await vscode.workspace.fs.writeFile(
                    vscode.Uri.file(filePath),
                    new TextEncoder().encode(markdown)
                );

                progress.report({ increment: 40, message: 'Opening reference...' });

                SfUtility.outputLog(`Commands reference saved to: ${filePath}`, null, debugLevel.info);

                // Open the markdown file
                const doc = await vscode.workspace.openTextDocument(filePath);
                await vscode.window.showTextDocument(doc, { preview: false });

                // Show preview
                await vscode.commands.executeCommand('markdown.showPreview', vscode.Uri.file(filePath));

                SfUtility.showInformation(`Commands reference generated: ${fileName}`);
            });
        } catch (error) {
            SfUtility.outputLog('Command generateCommandsReference failed', error, debugLevel.error);
            SfUtility.showError(`Failed to generate commands reference: ${error}`);
        }
    });

    // Generate Cluster Essentials Report (Markdown)
    registerCommand(context, 'sfClusterExplorer.generateEssentialsReport', async (item: any) => {
        try {
            if (!item || item.itemType !== 'essentials') {
                SfUtility.showWarning('This command is only available for Cluster Essentials');
                return;
            }

            const clusterEndpoint = item.clusterEndpoint || sfMgr.getCurrentSfConfig().getClusterEndpoint();
            if (!clusterEndpoint) {
                SfUtility.showWarning('No cluster endpoint available');
                return;
            }

            SfUtility.outputLog('Generating cluster essentials report...', null, debugLevel.info);

            // Show progress
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Generating Cluster Essentials Report',
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 10, message: 'Fetching cluster data...' });

                const sfRest = sfMgr.getCurrentSfConfig().getSfRest();
                
                // Fetch all essential cluster data
                const [health, version, manifest, nodes, applications] = await Promise.all([
                    sfRest.getClusterHealth(),
                    sfRest.getClusterVersion(),
                    sfRest.getClusterManifest(),
                    sfRest.getNodes(),
                    sfRest.getApplications()
                ]);

                // Debug log the version object
                SfUtility.outputLog('Version object received:', version, debugLevel.info);
                SfUtility.outputLog('Version string:', (version as any)?.version, debugLevel.info);

                progress.report({ increment: 40, message: 'Analyzing cluster health...' });

                // Parse manifest for FD/UD info
                let faultDomainCount = 'N/A';
                let upgradeDomainCount = 'N/A';
                try {
                    const manifestXml = (manifest as any).manifest;
                    if (manifestXml) {
                        const fdMatch = manifestXml.match(/FaultDomainCount="(\d+)"/i);
                        const udMatch = manifestXml.match(/UpgradeDomainCount="(\d+)"/i);
                        if (fdMatch) { faultDomainCount = fdMatch[1]; }
                        if (udMatch) { upgradeDomainCount = udMatch[1]; }
                    }
                } catch (e) {
                    // Ignore parse errors
                }

                // Calculate statistics
                const healthState = health.aggregatedHealthState || 'Unknown';
                const healthIcon = healthState === 'Ok' ? '✅' : healthState === 'Warning' ? '⚠️' : healthState === 'Error' ? '❌' : 'ℹ️';
                
                const nodeStats = health.nodeHealthStates || [];
                const nodeStatsByState = {
                    ok: nodeStats.filter((n: any) => n.aggregatedHealthState === 'Ok').length,
                    warning: nodeStats.filter((n: any) => n.aggregatedHealthState === 'Warning').length,
                    error: nodeStats.filter((n: any) => n.aggregatedHealthState === 'Error').length,
                    total: nodeStats.length
                };

                const appStats = health.applicationHealthStates || [];
                const appStatsByState = {
                    ok: appStats.filter((a: any) => a.aggregatedHealthState === 'Ok').length,
                    warning: appStats.filter((a: any) => a.aggregatedHealthState === 'Warning').length,
                    error: appStats.filter((a: any) => a.aggregatedHealthState === 'Error').length,
                    total: appStats.length
                };

                const healthEvents = health.healthEvents || [];
                const errorEvents = healthEvents.filter((e: any) => e.healthInformation?.healthState === 'Error').length;
                const warningEvents = healthEvents.filter((e: any) => e.healthInformation?.healthState === 'Warning').length;

                const unhealthyEvals = health.unhealthyEvaluations || [];

                // Node type distribution
                const nodeList = nodes || [];
                const nodeTypeMap = new Map<string, number>();
                nodeList.forEach((node: any) => {
                    const nodeType = node.type || 'Unknown';
                    nodeTypeMap.set(nodeType, (nodeTypeMap.get(nodeType) || 0) + 1);
                });

                progress.report({ increment: 30, message: 'Generating report...' });

                // Extract version string with better error handling
                let versionString = 'Unknown';
                if (version) {
                    // Try different possible formats
                    versionString = (version as any).version || 
                                   (version as any).Version || 
                                   (typeof version === 'string' ? version : 'Unknown');
                }
                SfUtility.outputLog('Final version string:', versionString, debugLevel.info);

                // Generate markdown report
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
                const reportContent = `# 🔍 Service Fabric Cluster Essentials Report

**Generated:** ${new Date().toLocaleString()}  
**Cluster:** \`${clusterEndpoint}\`

---

## 📊 Cluster Summary

| Property | Value |
|----------|-------|
| **Service Fabric Version** | ${versionString} |
| **Health State** | ${healthIcon} **${healthState}** |
| **Fault Domain Count** | ${faultDomainCount} |
| **Upgrade Domain Count** | ${upgradeDomainCount} |
| **Total Nodes** | ${nodeList.length} |
| **Total Applications** | ${applications?.length || 0} |

---

## 🖥️ Node Health Statistics

| State | Count | Percentage |
|-------|-------|------------|
| ✅ **Healthy (Ok)** | ${nodeStatsByState.ok} | ${nodeStatsByState.total > 0 ? ((nodeStatsByState.ok / nodeStatsByState.total) * 100).toFixed(1) : 0}% |
| ⚠️ **Warning** | ${nodeStatsByState.warning} | ${nodeStatsByState.total > 0 ? ((nodeStatsByState.warning / nodeStatsByState.total) * 100).toFixed(1) : 0}% |
| ❌ **Error** | ${nodeStatsByState.error} | ${nodeStatsByState.total > 0 ? ((nodeStatsByState.error / nodeStatsByState.total) * 100).toFixed(1) : 0}% |
| **Total** | **${nodeStatsByState.total}** | **100%** |

### Node Type Distribution

${Array.from(nodeTypeMap.entries()).map(([type, count]) => `- **${type}**: ${count} node(s)`).join('\n')}

---

## 📦 Application Health Statistics

| State | Count | Percentage |
|-------|-------|------------|
| ✅ **Healthy (Ok)** | ${appStatsByState.ok} | ${appStatsByState.total > 0 ? ((appStatsByState.ok / appStatsByState.total) * 100).toFixed(1) : 0}% |
| ⚠️ **Warning** | ${appStatsByState.warning} | ${appStatsByState.total > 0 ? ((appStatsByState.warning / appStatsByState.total) * 100).toFixed(1) : 0}% |
| ❌ **Error** | ${appStatsByState.error} | ${appStatsByState.total > 0 ? ((appStatsByState.error / appStatsByState.total) * 100).toFixed(1) : 0}% |
| **Total** | **${appStatsByState.total}** | **100%** |

---

## 🩺 Health Events Summary

| Type | Count |
|------|-------|
| ❌ **Error Events** | ${errorEvents} |
| ⚠️ **Warning Events** | ${warningEvents} |
| ℹ️ **Informational** | ${healthEvents.length - errorEvents - warningEvents} |
| **Total Events** | **${healthEvents.length}** |

${unhealthyEvals.length > 0 ? `
### ⚠️ Unhealthy Evaluations

> **Warning:** ${unhealthyEvals.length} unhealthy evaluation(s) detected

<details>
<summary>Click to view unhealthy evaluations</summary>

\`\`\`json
${JSON.stringify(unhealthyEvals, null, 2)}
\`\`\`

</details>
` : '### ✅ No Unhealthy Evaluations'}

${healthEvents.filter((e: any) => e.healthInformation?.healthState !== 'Ok').length > 0 ? `
---

## 🔔 Recent Health Events (Non-OK)

${healthEvents.filter((e: any) => e.healthInformation?.healthState !== 'Ok').slice(0, 10).map((event: any) => {
    const state = event.healthInformation?.healthState || 'Unknown';
    const icon = state === 'Error' ? '❌' : state === 'Warning' ? '⚠️' : 'ℹ️';
    return `### ${icon} ${state}: ${event.healthInformation?.property}

- **Source:** ${event.healthInformation?.sourceId}
- **Description:** ${event.healthInformation?.description || 'N/A'}
- **Sequence Number:** ${event.healthInformation?.sequenceNumber || 'N/A'}
- **Time to Live:** ${event.healthInformation?.timeToLiveInMilliSeconds ? (event.healthInformation.timeToLiveInMilliSeconds / 1000 / 60).toFixed(1) + ' minutes' : 'Infinite'}
`;
}).join('\n')}

${healthEvents.filter((e: any) => e.healthInformation?.healthState !== 'Ok').length > 10 ? `*Showing 10 of ${healthEvents.filter((e: any) => e.healthInformation?.healthState !== 'Ok').length} non-OK events*\n` : ''}
` : ''}

---

## 📋 Detailed Node List

<details>
<summary>Click to view all nodes (${nodeList.length} total)</summary>

| Node Name | Type | Status | Health State | IP Address |
|-----------|------|--------|--------------|------------|
${nodeList.map((node: any) => {
    const healthState = nodeStats.find((n: any) => n.name === node.name)?.aggregatedHealthState || 'Unknown';
    const healthIcon = healthState === 'Ok' ? '✅' : healthState === 'Warning' ? '⚠️' : healthState === 'Error' ? '❌' : 'ℹ️';
    return `| ${node.name} | ${node.type} | ${node.nodeStatus} | ${healthIcon} ${healthState} | ${node.ipAddressOrFQDN || 'N/A'} |`;
}).join('\n')}

</details>

---

## 📱 Application List

<details>
<summary>Click to view all applications (${appStatsByState.total} total)</summary>

${appStats.map((app: any) => {
    const healthState = app.aggregatedHealthState || 'Unknown';
    const healthIcon = healthState === 'Ok' ? '✅' : healthState === 'Warning' ? '⚠️' : healthState === 'Error' ? '❌' : 'ℹ️';
    return `### ${healthIcon} ${app.name}
- **Health State:** ${healthState}
`;
}).join('\n')}

</details>

---

*Report generated by Service Fabric Cluster Explorer extension*
`;

                // Create and show document
                const doc = await vscode.workspace.openTextDocument({
                    content: reportContent,
                    language: 'markdown'
                });
                await vscode.window.showTextDocument(doc, { preview: false });

                progress.report({ increment: 100, message: 'Report generated!' });
                SfUtility.outputLog('Cluster essentials report generated successfully', null, debugLevel.info);
                SfUtility.showInformation('✅ Cluster essentials report generated successfully!');
            });

        } catch (error) {
            SfUtility.outputLog('Command generateEssentialsReport failed', error, debugLevel.error);
            SfUtility.showError(`Failed to generate essentials report: ${error}`);
        }
    });

    // Generate Repair Tasks Report (Markdown)
    registerCommand(context, 'sfClusterExplorer.generateRepairTasksReport', async (item: any) => {
        try {
            if (!item || item.itemType !== 'repair-tasks') {
                SfUtility.showWarning('This command is only available for Repair Tasks');
                return;
            }

            const clusterEndpoint = item.clusterEndpoint || sfMgr.getCurrentSfConfig().getClusterEndpoint();
            if (!clusterEndpoint) {
                SfUtility.showWarning('No cluster endpoint available');
                return;
            }

            SfUtility.outputLog('Generating repair tasks report...', null, debugLevel.info);

            // Show progress
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Generating Repair Tasks Report',
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 10, message: 'Fetching repair tasks...' });

                const sfRest = sfMgr.getCurrentSfConfig().getSfRest();
                
                // Get repair tasks from REST API
                const tasks = await sfRest.getRepairTasks();

                progress.report({ increment: 40, message: `Processing ${tasks.length} tasks...` });

                // Generate markdown report
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
                const fileName = `repair-tasks-report-${timestamp}.md`;
                
                const clusterName = clusterEndpoint.replace(/[^a-zA-Z0-9]/g, '_');
                const dirPath = path.join(context.globalStorageUri.fsPath, clusterName, 'reports');
                
                // Ensure directory exists
                await vscode.workspace.fs.createDirectory(vscode.Uri.file(dirPath));
                
                progress.report({ increment: 30, message: 'Generating markdown...' });

                // Create markdown content
                let markdown = `# Service Fabric Repair Tasks Report\n\n`;
                markdown += `**Cluster:** \`${clusterEndpoint}\`  \n`;
                markdown += `**Generated:** ${new Date().toLocaleString()}  \n`;
                markdown += `**Total Tasks:** ${tasks.length}  \n\n`;
                markdown += `---\n\n`;

                if (tasks.length === 0) {
                    markdown += `## No Repair Tasks Found\n\n`;
                    markdown += `No repair tasks are currently active or have been executed recently.\n\n`;
                    markdown += `**Note:** This is normal if:\n`;
                    markdown += `- The cluster is not undergoing maintenance\n`;
                    markdown += `- No Azure platform updates are scheduled\n`;
                    markdown += `- The Repair Manager service is not enabled\n`;
                } else {
                    // Calculate statistics
                    const tasksByState = new Map<string, any[]>();
                    const tasksByResult = new Map<string, any[]>();
                    const tasksByAction = new Map<string, any[]>();
                    const tasksByNode = new Map<string, any[]>();
                    
                    tasks.forEach((task: any) => {
                        // Group by state
                        const state = task.state || 'Unknown';
                        if (!tasksByState.has(state)) {
                            tasksByState.set(state, []);
                        }
                        tasksByState.get(state)!.push(task);
                        
                        // Group by result status
                        const result = task.resultStatus || 'Pending';
                        if (!tasksByResult.has(result)) {
                            tasksByResult.set(result, []);
                        }
                        tasksByResult.get(result)!.push(task);
                        
                        // Group by action
                        const action = task.action || 'Unknown';
                        if (!tasksByAction.has(action)) {
                            tasksByAction.set(action, []);
                        }
                        tasksByAction.get(action)!.push(task);
                        
                        // Group by node
                        if (task.target && task.target.nodeNames) {
                            task.target.nodeNames.forEach((nodeName: string) => {
                                if (!tasksByNode.has(nodeName)) {
                                    tasksByNode.set(nodeName, []);
                                }
                                tasksByNode.get(nodeName)!.push(task);
                            });
                        }
                    });

                    // Summary section
                    markdown += `## Summary\n\n`;
                    
                    // State distribution
                    markdown += `### By State\n\n`;
                    markdown += `| State | Count | Emoji |\n`;
                    markdown += `|-------|-------|-------|\n`;
                    const stateEmojis: Record<string, string> = {
                        'Completed': '✅',
                        'Approved': '👍',
                        'Executing': '⚙️',
                        'Restoring': '🔄',
                        'Preparing': '📋',
                        'Claimed': '🤝',
                        'Created': '🆕',
                        'Invalid': '❌'
                    };
                    [...tasksByState.entries()].sort((a, b) => b[1].length - a[1].length).forEach(([state, stateTasks]) => {
                        const emoji = stateEmojis[state] || '⚪';
                        markdown += `| ${state} | ${stateTasks.length} | ${emoji} |\n`;
                    });
                    markdown += `\n`;
                    
                    // Result distribution
                    markdown += `### By Result Status\n\n`;
                    markdown += `| Status | Count | Emoji |\n`;
                    markdown += `|--------|-------|-------|\n`;
                    const resultEmojis: Record<string, string> = {
                        'Succeeded': '✅',
                        'Pending': '⏳',
                        'Cancelled': '🚫',
                        'Interrupted': '⚠️',
                        'Failed': '❌'
                    };
                    [...tasksByResult.entries()].sort((a, b) => b[1].length - a[1].length).forEach(([result, resultTasks]) => {
                        const emoji = resultEmojis[result] || '⚪';
                        markdown += `| ${result} | ${resultTasks.length} | ${emoji} |\n`;
                    });
                    markdown += `\n`;
                    
                    // Action types
                    markdown += `### By Action Type\n\n`;
                    markdown += `| Action | Count |\n`;
                    markdown += `|--------|-------|\n`;
                    [...tasksByAction.entries()].sort((a, b) => b[1].length - a[1].length).forEach(([action, actionTasks]) => {
                        markdown += `| ${action} | ${actionTasks.length} |\n`;
                    });
                    markdown += `\n`;
                    
                    // Node impact
                    markdown += `### Impact by Node\n\n`;
                    markdown += `| Node | Task Count |\n`;
                    markdown += `|------|------------|\n`;
                    [...tasksByNode.entries()].sort((a, b) => b[1].length - a[1].length).forEach(([node, nodeTasks]) => {
                        markdown += `| ${node} | ${nodeTasks.length} |\n`;
                    });
                    markdown += `\n`;
                    
                    markdown += `---\n\n`;

                    // Detailed task list
                    markdown += `## Detailed Task List\n\n`;
                    
                    // Sort by created timestamp (newest first)
                    const sortedTasks = [...tasks].sort((a: any, b: any) => {
                        const timeA = a.history?.createdUtcTimestamp ? new Date(a.history.createdUtcTimestamp).getTime() : 0;
                        const timeB = b.history?.createdUtcTimestamp ? new Date(b.history.createdUtcTimestamp).getTime() : 0;
                        return timeB - timeA;
                    });
                    
                    sortedTasks.forEach((task: any, index: number) => {
                        const state = task.state || 'Unknown';
                        const stateEmoji = stateEmojis[state] || '⚪';
                        const resultStatus = task.resultStatus || 'Pending';
                        const resultEmoji = resultEmojis[resultStatus] || '⚪';
                        
                        markdown += `### ${index + 1}. ${stateEmoji} Task: ${task.taskId}\n\n`;
                        
                        markdown += `<table>\n`;
                        markdown += `<tr><td><strong>Property</strong></td><td><strong>Value</strong></td></tr>\n`;
                        
                        // Basic info
                        markdown += `<tr><td>State</td><td><strong>${stateEmoji} ${state}</strong></td></tr>\n`;
                        markdown += `<tr><td>Result Status</td><td><strong>${resultEmoji} ${resultStatus}</strong></td></tr>\n`;
                        if (task.action) {
                            markdown += `<tr><td>Action</td><td><code>${task.action}</code></td></tr>\n`;
                        }
                        if (task.executor) {
                            markdown += `<tr><td>Executor</td><td><code>${task.executor}</code></td></tr>\n`;
                        }
                        
                        // Target nodes
                        if (task.target && task.target.nodeNames) {
                            markdown += `<tr><td>Target Nodes</td><td>`;
                            task.target.nodeNames.forEach((node: string, idx: number) => {
                                if (idx > 0) markdown += `, `;
                                markdown += `<code>${node}</code>`;
                            });
                            markdown += `</td></tr>\n`;
                        }
                        
                        // Impact level
                        if (task.impact && task.impact.nodeImpactList) {
                            const impactLevels = task.impact.nodeImpactList.map((impact: any) => impact.impactLevel).join(', ');
                            markdown += `<tr><td>Impact Level</td><td><strong>${impactLevels}</strong></td></tr>\n`;
                        }
                        
                        // Result details
                        if (task.resultDetails) {
                            markdown += `<tr><td>Result Details</td><td>${task.resultDetails}</td></tr>\n`;
                        }
                        if (task.resultCode !== undefined) {
                            markdown += `<tr><td>Result Code</td><td>${task.resultCode}</td></tr>\n`;
                        }
                        
                        markdown += `<tr><td colspan="2"><hr></td></tr>\n`;
                        
                        // Timeline
                        if (task.history) {
                            markdown += `<tr><td colspan="2"><strong>Timeline</strong></td></tr>\n`;
                            const history = task.history;
                            
                            if (history.createdUtcTimestamp) {
                                const created = new Date(history.createdUtcTimestamp);
                                markdown += `<tr><td>Created</td><td>${created.toLocaleString()}</td></tr>\n`;
                            }
                            if (history.claimedUtcTimestamp) {
                                const claimed = new Date(history.claimedUtcTimestamp);
                                markdown += `<tr><td>Claimed</td><td>${claimed.toLocaleString()}</td></tr>\n`;
                            }
                            if (history.preparingUtcTimestamp) {
                                const preparing = new Date(history.preparingUtcTimestamp);
                                markdown += `<tr><td>Preparing</td><td>${preparing.toLocaleString()}</td></tr>\n`;
                            }
                            if (history.approvedUtcTimestamp) {
                                const approved = new Date(history.approvedUtcTimestamp);
                                markdown += `<tr><td>Approved</td><td>${approved.toLocaleString()}</td></tr>\n`;
                            }
                            if (history.executingUtcTimestamp) {
                                const executing = new Date(history.executingUtcTimestamp);
                                markdown += `<tr><td>Executing</td><td>${executing.toLocaleString()}</td></tr>\n`;
                            }
                            if (history.restoringUtcTimestamp) {
                                const restoring = new Date(history.restoringUtcTimestamp);
                                markdown += `<tr><td>Restoring</td><td>${restoring.toLocaleString()}</td></tr>\n`;
                            }
                            if (history.completedUtcTimestamp) {
                                const completed = new Date(history.completedUtcTimestamp);
                                markdown += `<tr><td>Completed</td><td>${completed.toLocaleString()}</td></tr>\n`;
                                
                                // Calculate duration
                                if (history.createdUtcTimestamp) {
                                    const duration = new Date(history.completedUtcTimestamp).getTime() - new Date(history.createdUtcTimestamp).getTime();
                                    const minutes = Math.floor(duration / 60000);
                                    const seconds = Math.floor((duration % 60000) / 1000);
                                    markdown += `<tr><td><strong>Total Duration</strong></td><td><strong>${minutes}m ${seconds}s</strong></td></tr>\n`;
                                }
                            }
                        }
                        
                        markdown += `</table>\n\n`;
                        
                        // Add full task JSON in collapsible section
                        markdown += `<details>\n<summary>📋 Full Task JSON</summary>\n\n\`\`\`json\n`;
                        markdown += JSON.stringify(task, null, 2);
                        markdown += `\n\`\`\`\n</details>\n\n`;
                        markdown += `---\n\n`;
                    });
                }

                markdown += `\n---\n\n`;
                markdown += `*Report generated by Service Fabric Diagnostic Extension*\n`;

                // Write file
                const filePath = path.join(dirPath, fileName);
                await vscode.workspace.fs.writeFile(
                    vscode.Uri.file(filePath),
                    new TextEncoder().encode(markdown)
                );

                progress.report({ increment: 20, message: 'Opening report...' });

                SfUtility.outputLog(`Repair tasks report saved to: ${filePath}`, null, debugLevel.info);

                // Open the markdown file
                const doc = await vscode.workspace.openTextDocument(filePath);
                await vscode.window.showTextDocument(doc, { preview: false });

                // Show preview
                await vscode.commands.executeCommand('markdown.showPreview', vscode.Uri.file(filePath));

                SfUtility.showInformation(`Repair tasks report generated: ${fileName}`);
            });
        } catch (error) {
            SfUtility.outputLog('Command generateRepairTasksReport failed', error, debugLevel.error);
            SfUtility.showError(`Failed to generate repair tasks report: ${error}`);
        }
    });

    // Export tree item snapshot to JSON
    registerCommand(context, 'sfClusterExplorer.exportSnapshot', async (item: any) => {
        try {
            if (!item) {
                SfUtility.showWarning('No item selected for snapshot export');
                return;
            }

            const itemLabel = item.label || 'unknown';
            const itemType = item.itemType || 'item';
            const clusterEndpoint = item.clusterEndpoint || 'unknown-cluster';

            SfUtility.outputLog(`Exporting snapshot for ${itemType}: ${itemLabel}`, null, debugLevel.info);

            // Serialize tree item (including children recursively)
            const snapshot = serializeTreeItem(item);

            // Generate filename
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
            const safeName = itemLabel.replace(/[^a-zA-Z0-9-_]/g, '_');
            const fileName = `snapshot-${itemType}-${safeName}-${timestamp}.json`;
            
            // Save to extension global storage (same location as health snapshots)
            const clusterName = clusterEndpoint.replace(/[^a-zA-Z0-9]/g, '_');
            const dirPath = path.join(context.globalStorageUri.fsPath, clusterName, 'snapshots');
            
            // Ensure directory exists
            await vscode.workspace.fs.createDirectory(vscode.Uri.file(dirPath));
            
            // Write file
            const filePath = path.join(dirPath, fileName);
            const content = JSON.stringify(snapshot, null, 2);
            await vscode.workspace.fs.writeFile(
                vscode.Uri.file(filePath),
                new TextEncoder().encode(content)
            );
            
            SfUtility.outputLog(`Snapshot saved to: ${filePath}`, null, debugLevel.info);
            
            // Ask user if they want to open it
            const openChoice = await vscode.window.showInformationMessage(
                `Snapshot saved: ${fileName}`,
                'Open',
                'Show in Folder'
            );
            
            if (openChoice === 'Open') {
                const doc = await vscode.workspace.openTextDocument(filePath);
                await vscode.window.showTextDocument(doc, { preview: false });
            } else if (openChoice === 'Show in Folder') {
                // Reveal in file explorer
                await vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(filePath));
            }
        } catch (error) {
            SfUtility.outputLog('Failed to export snapshot', error, debugLevel.error);
            SfUtility.showError(`Failed to export snapshot: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
    
    // Handle tree item clicks to show details
    registerCommand(context, 'sfClusterExplorer.showItemDetails', async (item: any) => {
        // Note: item.label contains entity names (nodes, apps, services) - not PII like endpoints/thumbprints
        console.log('[SF Extension] showItemDetails triggered for:', item.label);
        try {
            if (!item.itemType || !item.itemId) {
                SfUtility.showWarning('No details available for this item');
                return;
            }
            
            const clusterEndpoint = item.clusterEndpoint || sfMgr.getCurrentSfConfig().getClusterEndpoint();
            if (!clusterEndpoint) {
                SfUtility.showWarning('No cluster endpoint available');
                return;
            }
            
            SfUtility.outputLog(`Fetching details for ${item.itemType}: ${item.itemId}`, null, debugLevel.info);
            
            // Get the SfConfig for the specific cluster (not just current active cluster)
            let sfConfig = sfMgr.getSfConfig(clusterEndpoint);
            if (!sfConfig) {
                SfUtility.showError(`Cluster configuration not found for: ${clusterEndpoint}`);
                return;
            }
            
            // Fetch details based on item type
            let details: any;
            const sfRest = sfConfig.getSfRest();
            
            switch (item.itemType) {
                case 'details':
                    // Fetch cluster upgrade progress details
                    details = await sfRest.getClusterUpgradeProgress();
                    break;
                case 'essentials':
                    // Fetch cluster health and version for essentials view
                    const [health, version, manifest] = await Promise.all([
                        sfRest.getClusterHealth(),
                        sfRest.getClusterVersion(),
                        sfRest.getClusterManifest()
                    ]);
                    details = {
                        version,
                        health,
                        manifestSummary: {
                            name: (manifest as any).manifest ? 'Available' : 'N/A',
                            // Could parse FD/UD counts from manifest XML if needed
                        }
                    };
                    break;
                case 'metrics':
                    // Fetch cluster load information and metrics
                    details = await sfRest.getClusterLoadInformation();
                    break;
                case 'commands':
                    // Return commands reference information
                    details = {
                        message: 'Service Fabric Cluster Commands',
                        description: 'Expand the commands tree to see available cluster management operations organized by category.',
                        categories: [
                            'Cluster Operations - Upgrade, configuration, and maintenance commands',
                            'Application Lifecycle - Provision, create, upgrade, and manage applications',
                            'Partition & Replica Operations - Move replicas, reset loads, report health',
                            'Testing & Chaos - Chaos testing and partition testing scenarios',
                            'Backup & Restore - Backup policy management and restore operations',
                            'Repair & Infrastructure - Repair task management and infrastructure commands'
                        ],
                        note: 'Click on individual commands to execute them with guided wizards, or right-click on the commands item to generate a full reference guide.'
                    };
                    break;
                case 'command':
                    // Handle PowerShell guide commands
                    if (item.itemId === 'connect-cluster-guide') {
                        // Import the PowerShell generator
                        const { PowerShellCommandGenerator } = await import('./services/PowerShellCommandGenerator');
                        const markdown = PowerShellCommandGenerator.generateConnectionCommands(
                            clusterEndpoint,
                            sfConfig?.getClientCertificateThumbprint(),
                            sfConfig?.getServerCertificateThumbprint()
                        );
                        const doc = await vscode.workspace.openTextDocument({
                            content: markdown,
                            language: 'markdown'
                        });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return; // Exit early - document shown
                    } else if (item.itemId === 'cluster-diagnostics-guide') {
                        const { PowerShellCommandGenerator } = await import('./services/PowerShellCommandGenerator');
                        // Fetch real cluster data for examples
                        const [nodes, applications] = await Promise.all([
                            sfRest.getNodes().catch(() => []),
                            sfRest.getApplications().catch(() => [])
                        ]);
                        const nodeNames = nodes.map((n: any) => n.name || n.nodeName);
                        const appNames = applications.map((a: any) => a.name || a.id);
                        const markdown = PowerShellCommandGenerator.generateClusterDiagnostics(clusterEndpoint, nodeNames, appNames);
                        const doc = await vscode.workspace.openTextDocument({
                            content: markdown,
                            language: 'markdown'
                        });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    } else if (item.itemId === 'node-management-guide') {
                        const { PowerShellCommandGenerator } = await import('./services/PowerShellCommandGenerator');
                        const nodes = await sfRest.getNodes();
                        const nodeNames = nodes.map((n: any) => n.name || n.nodeName);
                        const markdown = PowerShellCommandGenerator.generateNodeCommands(clusterEndpoint, nodeNames);
                        const doc = await vscode.workspace.openTextDocument({
                            content: markdown,
                            language: 'markdown'
                        });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    } else if (item.itemId === 'application-management-guide') {
                        const { PowerShellCommandGenerator } = await import('./services/PowerShellCommandGenerator');
                        // Fetch real applications for examples
                        const applications = await sfRest.getApplications().catch(() => []);
                        const appNames = applications.map((a: any) => a.name || a.id);
                        const markdown = PowerShellCommandGenerator.generateApplicationCommands(clusterEndpoint, appNames);
                        const doc = await vscode.workspace.openTextDocument({
                            content: markdown,
                            language: 'markdown'
                        });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    } 
                    // Cluster Operations commands
                    else if (item.itemId === 'start-cluster-upgrade') {
                        const { OperationalCommandsGenerator } = await import('./services/OperationalCommandsGenerator');
                        const nodes = await sfRest.getNodes().catch(() => []);
                        const markdown = OperationalCommandsGenerator.generateStartClusterUpgrade(clusterEndpoint, nodes);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    } else if (item.itemId === 'rollback-cluster-upgrade') {
                        const { OperationalCommandsGenerator } = await import('./services/OperationalCommandsGenerator');
                        const markdown = OperationalCommandsGenerator.generateRollbackClusterUpgrade(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    } else if (item.itemId === 'update-cluster-config') {
                        const { OperationalCommandsGenerator } = await import('./services/OperationalCommandsGenerator');
                        const markdown = OperationalCommandsGenerator.generateUpdateClusterConfig(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    } else if (item.itemId === 'recover-system-partitions') {
                        const { OperationalCommandsGenerator } = await import('./services/OperationalCommandsGenerator');
                        const markdown = OperationalCommandsGenerator.generateRecoverSystemPartitions(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    } else if (item.itemId === 'reset-partition-loads') {
                        const { OperationalCommandsGenerator } = await import('./services/OperationalCommandsGenerator');
                        const markdown = OperationalCommandsGenerator.generateResetPartitionLoads(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    }
                    // Application Lifecycle commands
                    else if (item.itemId === 'provision-app-type') {
                        const { OperationalCommandsGenerator } = await import('./services/OperationalCommandsGenerator');
                        const markdown = OperationalCommandsGenerator.generateProvisionApplicationType(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    } else if (item.itemId === 'create-application') {
                        const { OperationalCommandsGenerator } = await import('./services/OperationalCommandsGenerator');
                        const appTypes = await sfRest.getApplicationTypes().catch(() => []);
                        const markdown = OperationalCommandsGenerator.generateCreateApplication(clusterEndpoint, appTypes);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    } else if (item.itemId === 'start-app-upgrade') {
                        const { OperationalCommandsGenerator } = await import('./services/OperationalCommandsGenerator');
                        const apps = await sfRest.getApplications().catch(() => []);
                        const markdown = OperationalCommandsGenerator.generateStartApplicationUpgrade(clusterEndpoint, apps);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    } else if (item.itemId === 'rollback-app-upgrade') {
                        const { OperationalCommandsGenerator } = await import('./services/OperationalCommandsGenerator');
                        const markdown = OperationalCommandsGenerator.generateRollbackApplicationUpgrade(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    }
                    // Partition & Replica Operations commands
                    else if (item.itemId === 'move-primary-replica') {
                        const { OperationalCommandsGenerator } = await import('./services/OperationalCommandsGenerator');
                        const markdown = OperationalCommandsGenerator.generateMovePrimaryReplica(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    } else if (item.itemId === 'move-secondary-replica') {
                        const { OperationalCommandsGenerator } = await import('./services/OperationalCommandsGenerator');
                        const markdown = OperationalCommandsGenerator.generateMoveSecondaryReplica(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    } else if (item.itemId === 'reset-partition-load') {
                        const { OperationalCommandsGenerator } = await import('./services/OperationalCommandsGenerator');
                        const markdown = OperationalCommandsGenerator.generateResetPartitionLoad(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    } else if (item.itemId === 'report-health') {
                        const { OperationalCommandsGenerator } = await import('./services/OperationalCommandsGenerator');
                        const markdown = OperationalCommandsGenerator.generateReportHealth(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    }
                    // Testing & Chaos commands
                    else if (item.itemId === 'start-chaos') {
                        const { OperationalCommandsGenerator } = await import('./services/OperationalCommandsGenerator');
                        const markdown = OperationalCommandsGenerator.generateStartChaos(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    } else if (item.itemId === 'stop-chaos') {
                        const { OperationalCommandsGenerator } = await import('./services/OperationalCommandsGenerator');
                        const markdown = OperationalCommandsGenerator.generateStopChaos(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    } else if (item.itemId === 'query-chaos-events') {
                        const { OperationalCommandsGenerator } = await import('./services/OperationalCommandsGenerator');
                        const markdown = OperationalCommandsGenerator.generateQueryChaosEvents(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    } else if (item.itemId === 'restart-partition') {
                        const { OperationalCommandsGenerator } = await import('./services/OperationalCommandsGenerator');
                        const markdown = OperationalCommandsGenerator.generateRestartPartition(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    }
                    // Backup & Restore commands
                    else if (item.itemId === 'enable-backup') {
                        const { OperationalCommandsGenerator } = await import('./services/OperationalCommandsGenerator');
                        const markdown = OperationalCommandsGenerator.generateEnableBackup(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    } else if (item.itemId === 'disable-backup') {
                        const { OperationalCommandsGenerator } = await import('./services/OperationalCommandsGenerator');
                        const markdown = OperationalCommandsGenerator.generateDisableBackup(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    } else if (item.itemId === 'trigger-backup') {
                        const { OperationalCommandsGenerator } = await import('./services/OperationalCommandsGenerator');
                        const markdown = OperationalCommandsGenerator.generateTriggerBackup(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    } else if (item.itemId === 'get-backup-progress') {
                        const { OperationalCommandsGenerator } = await import('./services/OperationalCommandsGenerator');
                        const markdown = OperationalCommandsGenerator.generateGetBackupProgress(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    } else if (item.itemId === 'restore-backup') {
                        const { OperationalCommandsGenerator } = await import('./services/OperationalCommandsGenerator');
                        const markdown = OperationalCommandsGenerator.generateRestoreBackup(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    }
                    // Repair & Infrastructure commands
                    else if (item.itemId === 'view-repair-tasks') {
                        const { OperationalCommandsGenerator } = await import('./services/OperationalCommandsGenerator');
                        const markdown = OperationalCommandsGenerator.generateViewRepairTasks(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    } else if (item.itemId === 'create-repair-task') {
                        const { OperationalCommandsGenerator } = await import('./services/OperationalCommandsGenerator');
                        const markdown = OperationalCommandsGenerator.generateCreateRepairTask(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    } else if (item.itemId === 'cancel-repair-task') {
                        const { OperationalCommandsGenerator } = await import('./services/OperationalCommandsGenerator');
                        const markdown = OperationalCommandsGenerator.generateCancelRepairTask(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    } else if (item.itemId === 'force-approve-repair') {
                        const { OperationalCommandsGenerator } = await import('./services/OperationalCommandsGenerator');
                        const markdown = OperationalCommandsGenerator.generateForceApproveRepair(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    }
                    // ===== AZURE CLI COMMANDS =====
                    // Azure CLI Setup & Connection
                    else if (item.itemId === 'az-sf-install-extension') {
                        const { AzureCliCommandGenerator } = await import('./services/AzureCliCommandGenerator');
                        const markdown = AzureCliCommandGenerator.generateSetupGuide(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    } else if (item.itemId === 'az-sf-cluster-select') {
                        const { AzureCliCommandGenerator } = await import('./services/AzureCliCommandGenerator');
                        const markdown = AzureCliCommandGenerator.generateSetupGuide(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    } else if (item.itemId === 'az-login') {
                        const { AzureCliCommandGenerator } = await import('./services/AzureCliCommandGenerator');
                        const markdown = AzureCliCommandGenerator.generateSetupGuide(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    }
                    // Azure CLI Cluster Management
                    else if (item.itemId === 'az-sf-cluster-health') {
                        const { AzureCliCommandGenerator } = await import('./services/AzureCliCommandGenerator');
                        const markdown = AzureCliCommandGenerator.generateClusterHealthCommand(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    } else if (item.itemId === 'az-sf-cluster-manifest') {
                        const { AzureCliCommandGenerator } = await import('./services/AzureCliCommandGenerator');
                        const markdown = AzureCliCommandGenerator.generateClusterManifestCommand(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    } else if (item.itemId === 'az-sf-node-list') {
                        const { AzureCliCommandGenerator } = await import('./services/AzureCliCommandGenerator');
                        const markdown = AzureCliCommandGenerator.generateNodeListCommand(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    }
                    // Azure CLI Application Management
                    else if (item.itemId === 'az-sf-application-list') {
                        const { AzureCliCommandGenerator } = await import('./services/AzureCliCommandGenerator');
                        const markdown = AzureCliCommandGenerator.generateApplicationListCommand(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    } else if (item.itemId === 'az-sf-application-health') {
                        const { AzureCliCommandGenerator } = await import('./services/AzureCliCommandGenerator');
                        const markdown = AzureCliCommandGenerator.generateApplicationHealthCommand(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    } else if (item.itemId === 'az-sf-application-delete') {
                        const { AzureCliCommandGenerator } = await import('./services/AzureCliCommandGenerator');
                        const markdown = AzureCliCommandGenerator.generateApplicationDeleteCommand(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    }
                    // Azure CLI Service & Replica Management
                    else if (item.itemId === 'az-sf-service-list') {
                        const { AzureCliCommandGenerator } = await import('./services/AzureCliCommandGenerator');
                        const markdown = AzureCliCommandGenerator.generateServiceListCommand(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    }
                    // Azure CLI Query & Diagnostics
                    else if (item.itemId === 'az-sf-query-guide') {
                        const { AzureCliCommandGenerator } = await import('./services/AzureCliCommandGenerator');
                        const markdown = AzureCliCommandGenerator.generateQueryGuide(clusterEndpoint);
                        const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
                        await vscode.window.showTextDocument(doc, { preview: false });
                        return;
                    }
                    else {
                        // Other command types - show placeholder for now
                        details = {
                            message: 'Command',
                            description: `Command: ${item.itemId}`,
                            note: 'This command will open a wizard to execute the operation'
                        };
                    }
                    break;
                case 'cluster-map':
                    // Show cluster topology map webview
                    SfUtility.outputLog('Opening cluster map webview', null, debugLevel.info);
                    const clusterMapView = new ClusterMapView(context, sfRest, clusterEndpoint);
                    await clusterMapView.show();
                    return; // Exit early - webview shown
                case 'image-store':
                case 'image-store-folder':
                    // Fetch image store content (files and folders)
                    const imagePath = item.path || '';
                    SfUtility.outputLog(`Fetching image store content at path: ${imagePath}`, null, debugLevel.info);
                    details = await sfRest.getImageStoreContent(imagePath);
                    break;
                case 'image-store-file':
                    // Return file metadata (already have it from parent folder listing)
                    details = {
                        path: item.path,
                        size: item.size,
                        version: item.version,
                        modifiedDate: item.modifiedDate,
                        displayName: item.label,
                        isReserved: item.isReserved
                    };
                    break;
                case 'node':
                    details = await sfRest.getNodeInfo(item.itemId);
                    break;
                case 'application':
                    details = await sfRest.getApplicationInfo(item.itemId);
                    break;
                case 'service':
                    if (!item.applicationId) {
                        throw new Error(`Service ${item.itemId} missing applicationId - cannot fetch details`);
                    }
                    try {
                        details = await sfRest.getServiceInfo(item.itemId, item.applicationId);
                    } catch (serviceError: any) {
                        // If API fails, return basic service info we have
                        if (serviceError.statusCode === 404 || serviceError.message?.includes('404')) {
                            SfUtility.outputLog(`Service ${item.itemId} not queryable via API, returning basic info`, serviceError, debugLevel.warn);
                            details = {
                                id: item.itemId,
                                name: item.label,
                                serviceKind: 'Unknown',
                                typeName: 'Unknown',
                                manifestVersion: 'Unknown',
                                healthState: 'Unknown',
                                serviceStatus: 'Unknown',
                                note: 'This is a system service on a dev cluster. Full details not available via API. Service exists but cannot be queried through standard application endpoints.',
                                error: serviceError.message
                            };
                        } else {
                            throw serviceError;
                        }
                    }
                    break;
                case 'manifest':
                    const manifestResponse = await sfRest.getClusterManifest();
                    // Extract and parse XML if it's wrapped in JSON
                    if ((manifestResponse as any).manifest) {
                        sfConfig.setManifest(manifestResponse);
                        // Return the parsed JSON representation
                        details = JSON.parse(sfConfig.getJsonManifest());
                    } else {
                        details = manifestResponse;
                    }
                    break;
                case 'health':
                    details = await sfRest.getClusterHealth();
                    break;
                case 'events':
                    const clusterEvents = await sfRest.getClusterEvents();
                    if (!clusterEvents || clusterEvents.length === 0) {
                        details = {
                            message: 'No cluster events found in the last 24 hours',
                            note: 'Events are provided by the EventStore service. If you expect to see events, check that EventStore service is healthy and running on your cluster.'
                        };
                    } else {
                        details = clusterEvents;
                    }
                    break;
                case 'repair-tasks':
                    const repairTasks = await sfRest.getRepairTasks();
                    if (!repairTasks || repairTasks.length === 0) {
                        details = {
                            message: 'No repair tasks found',
                            note: 'This is normal if no repairs are currently running or scheduled. Repair tasks appear when the Repair Manager service is performing cluster maintenance operations.'
                        };
                    } else {
                        details = repairTasks;
                    }
                    break;
                case 'partition':
                    if (!item.applicationId || !item.serviceId) {
                        throw new Error(`Partition ${item.itemId} missing applicationId or serviceId`);
                    }
                    // Get partition details
                    const partitions = await sfRest.getServicePartitions(item.serviceId, item.applicationId);
                    details = partitions.find((p: any) => p.partitionInformation?.id === item.itemId) || {
                        id: item.itemId,
                        serviceId: item.serviceId,
                        note: 'Partition details from service query'
                    };
                    break;
                case 'replica':
                    if (!item.applicationId || !item.serviceId || !item.partitionId) {
                        // For replicas, partitionId is stored on the partition item
                        details = {
                            id: item.itemId,
                            note: 'Replica details - use partition view for full information'
                        };
                    } else {
                        const replicas = await sfRest.getPartitionReplicas(item.serviceId, item.applicationId, item.partitionId);
                        details = replicas.find((r: any) => 
                            (r.replicaId && r.replicaId.toString() === item.itemId) ||
                            (r.instanceId && r.instanceId.toString() === item.itemId)
                        ) || {
                            id: item.itemId,
                            note: 'Replica details from partition query'
                        };
                    }
                    break;
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
                case 'application-manifest':
                    if (!item.applicationId) {
                        throw new Error('Application manifest requires applicationId');
                    }
                    const appManifestResponse = await sfRest.getApplicationManifest(item.applicationId);
                    // Format like cluster manifest - use compact: true for less nesting, spaces: 2
                    if (appManifestResponse && appManifestResponse.manifest) {
                        const xmlConverter = require('xml-js');
                        const jsonManifest = xmlConverter.xml2json(appManifestResponse.manifest, { compact: true, spaces: 2 });
                        details = JSON.parse(jsonManifest);
                    } else {
                        SfUtility.outputLog('Application manifest response:', appManifestResponse, debugLevel.debug);
                        details = appManifestResponse;
                    }
                    break;
                case 'service-manifest':
                    if (!item.applicationId || !item.serviceId) {
                        throw new Error('Service manifest requires applicationId and serviceId');
                    }
                    SfUtility.outputLog(`Fetching service manifest for serviceId: ${item.serviceId}, applicationId: ${item.applicationId}`, null, debugLevel.info);
                    const svcManifestResponse = await sfRest.getServiceManifest(item.serviceId, item.applicationId);
                    SfUtility.outputLog('Service manifest response:', svcManifestResponse, debugLevel.debug);
                    // Format like cluster manifest - use compact: true for less nesting, spaces: 2
                    if (svcManifestResponse && svcManifestResponse.manifest) {
                        const xmlConverter = require('xml-js');
                        const jsonManifest = xmlConverter.xml2json(svcManifestResponse.manifest, { compact: true, spaces: 2 });
                        details = JSON.parse(jsonManifest);
                    } else {
                        SfUtility.outputLog('Service manifest missing .manifest property, returning raw response', null, debugLevel.warn);
                        details = svcManifestResponse;
                    }
                    break;
                case 'deployed-application':
                    // Get full deployed application details
                    if (!item.contextValue || !item.applicationId) {
                        throw new Error('Deployed application requires node name (contextValue) and applicationId');
                    }
                    const nodeName = item.contextValue;
                    details = await sfRest.getDeployedApplicationInfo(nodeName, item.applicationId);
                    break;
                case 'deployed-service-package':
                    // Get deployed service package details
                    if (!item.contextValue || !item.applicationId) {
                        throw new Error('Deployed service package requires contextValue and applicationId');
                    }
                    const pkgParts = item.contextValue.split('|');
                    const deployNode = pkgParts[0];
                    const deployAppId = pkgParts[1];
                    const manifestName = pkgParts[2] || item.itemId;
                    const packages = await sfRest.getDeployedServicePackages(deployNode, deployAppId);
                    details = packages.find((p: any) => p.serviceManifestName === manifestName || p.name === manifestName) || {
                        serviceManifestName: manifestName,
                        node: deployNode,
                        applicationId: deployAppId,
                        note: 'Service package details'
                    };
                    break;
                case 'deployed-code-package':
                    // Get deployed code package details
                    if (!item.contextValue) {
                        throw new Error('Deployed code package requires contextValue');
                    }
                    const codeParts = item.contextValue.split('|');
                    const codeNode = codeParts[0];
                    const codeAppId = codeParts[1];
                    const codeManifest = codeParts[2];
                    const codePackages = await sfRest.getDeployedCodePackages(codeNode, codeAppId, codeManifest);
                    details = codePackages.find((p: any) => p.codePackageName === item.itemId || p.name === item.itemId) || {
                        codePackageName: item.itemId,
                        node: codeNode,
                        note: 'Code package details'
                    };
                    break;
                case 'deployed-replica':
                    // Get deployed replica details
                    if (!item.contextValue || !item.partitionId) {
                        // Return basic replica info without full details
                        details = {
                            replicaId: item.replicaId || item.itemId,
                            partitionId: item.partitionId,
                            healthState: item.healthState,
                            note: 'Deployed replica - full details require partition context'
                        };
                    } else {
                        const repParts = item.contextValue.split('|');
                        const repNode = repParts[0];
                        const repAppId = repParts[1];
                        const repManifest = repParts[2];
                        const replicas = await sfRest.getDeployedReplicas(repNode, repAppId, repManifest);
                        details = replicas.find((r: any) => 
                            (r.replicaId && r.replicaId.toString() === item.itemId) ||
                            (r.instanceId && r.instanceId.toString() === item.itemId)
                        ) || {
                            replicaId: item.itemId,
                            partitionId: item.partitionId,
                            node: repNode,
                            note: 'Deployed replica details'
                        };
                    }
                    break;
                default:
                    SfUtility.showWarning(`Unknown item type: ${item.itemType}`);
                    return;
            }
            
            // Save JSON to timestamped file
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
            const clusterName = clusterEndpoint.replace(/[^a-zA-Z0-9]/g, '_');
            const fileName = `${item.itemType}-${timestamp}.json`;
            const dirPath = path.join(
                context.globalStorageUri.fsPath,
                clusterName
            );
            
            // Ensure directory exists
            await vscode.workspace.fs.createDirectory(vscode.Uri.file(dirPath));
            
            // Write file
            const filePath = path.join(dirPath, fileName);
            const content = JSON.stringify(details, null, 2);
            await vscode.workspace.fs.writeFile(
                vscode.Uri.file(filePath),
                new TextEncoder().encode(content)
            );
            
            // Open the saved file in preview mode (single-click shows preview, double-click or edit pins it)
            const doc = await vscode.workspace.openTextDocument(filePath);
            await vscode.window.showTextDocument(doc, { preview: true });
            
        } catch (error) {
            console.error('[SF Extension] showItemDetails error:', error);
            SfUtility.outputLog('Failed to show item details', error, debugLevel.error);
            
            // Provide context-aware error messages
            let errorMessage = error instanceof Error ? error.message : String(error);
            const errorString = JSON.stringify(error); // Check nested errors
            
            // Extract HTTP status code from nested errors
            let statusCode: number | undefined;
            if (error && typeof error === 'object') {
                const anyError = error as any;
                // Check direct statusCode property (HttpError)
                statusCode = anyError.statusCode;
                // Check context.status (wrapped errors)
                if (!statusCode && anyError.context && anyError.context.status) {
                    statusCode = anyError.context.status;
                }
                // Check nested cause (NetworkError wrapping HttpError)
                if (!statusCode && anyError.cause) {
                    statusCode = anyError.cause.statusCode || anyError.cause.context?.status;
                }
            }
            
            // EventStore-related errors (service-events, partition-events, replica-events)
            if (item.itemType && item.itemType.includes('-events')) {
                if (statusCode === 500 || statusCode === 404 || 
                    errorMessage.includes('500') || errorString.includes('500') || 
                    errorMessage.includes('404') || errorString.includes('404') ||
                    errorMessage.includes('Not Found') || errorString.includes('Not Found')) {
                    errorMessage = `EventStore service error (HTTP ${statusCode || 500}). Check cluster health and EventStore service status. The EventStore service may be down or experiencing issues.`;
                }
            } else if (item.itemType === 'events' && (statusCode === 500 || errorMessage.includes('500') || errorString.includes('500'))) {
                errorMessage = `EventStore service error (HTTP ${statusCode || 500}). Check cluster health and EventStore service status. The EventStore service may be down or experiencing issues.`;
            } else if (item.itemType === 'repair-tasks' && (statusCode === 504 || errorMessage.includes('504') || errorMessage.includes('TIMEOUT') || errorString.includes('504') || errorString.includes('TIMEOUT'))) {
                errorMessage = 'Repair Manager service timeout. This service may not be active on minimal dev clusters.';
            } else if ((statusCode === 404 || errorMessage.includes('404') || errorString.includes('404')) && errorString.includes('fabric:/System')) {
                errorMessage = 'System application services unavailable. This query may not be supported on this cluster version.';
            }
            
            SfUtility.showError(`Failed to show ${item.itemType} details: ${errorMessage}`);
        }
    });

    console.log('[SF Extension] 9/10 - All commands registered successfully');
    SfUtility.outputLog('Service Fabric extension activated', null, debugLevel.info);
    console.log('[SF Extension] 10/10 - Extension activation complete ✅');
    
    // Show success notification
    vscode.window.showInformationMessage('Service Fabric Extension activated successfully!');
    
    } catch (error) {
        console.error('[SF Extension] FATAL: Extension activation failed:', error);
        SfUtility.outputLog('FATAL: Extension activation failed', error, debugLevel.error);
        vscode.window.showErrorMessage(
            `Service Fabric extension activation failed: ${error instanceof Error ? error.message : String(error)}. ` +
            `Commands will not be available. Check the Output panel (Service Fabric) for details.`
        );
        throw error; // Re-throw to mark activation as failed
    }
}

function registerCommand(context: vscode.ExtensionContext, command: string, callback: (...args: any[]) => any, thisArg?: any): void {
    context.subscriptions.push(vscode.commands.registerCommand(command, callback, thisArg));
}

/**
 * Serialize tree item to JSON (including children recursively)
 */
function serializeTreeItem(item: any, depth: number = 0, maxDepth: number = 10): any {
    if (depth > maxDepth) {
        return { _truncated: true, message: 'Max depth reached' };
    }

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
        collapsibleState: item.collapsibleState
    };

    // Recursively serialize children
    if (item.children && Array.isArray(item.children) && item.children.length > 0) {
        serialized.children = item.children.map((child: any) => 
            serializeTreeItem(child, depth + 1, maxDepth)
        );
        serialized._childCount = item.children.length;
    }

    // Remove undefined/null values
    Object.keys(serialized).forEach(key => {
        if (serialized[key] === undefined || serialized[key] === null) {
            delete serialized[key];
        }
    });

    return serialized;
}

/**
 * Extension deactivation - cleanup resources
 */
export function deactivate(): void {
    try {
        SfUtility.outputLog('Service Fabric extension deactivating', null, debugLevel.info);
        
        // Hide views by clearing context key
        vscode.commands.executeCommand('setContext', 'serviceFabricActive', false);
        
        // Dispose SfMgr resources
        if (sfMgrInstance) {
            sfMgrInstance.dispose();
            sfMgrInstance = undefined;
        }
        
        // Clear prompts instance
        sfPromptsInstance = undefined;
        
        SfUtility.outputLog('Service Fabric extension deactivated', null, debugLevel.info);
    } catch (error) {
        SfUtility.outputLog('Error during extension deactivation', error, debugLevel.error);
    }
}
