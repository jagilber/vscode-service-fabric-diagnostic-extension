import * as vscode from 'vscode';
import { SfRest } from '../sfRest';
import { SfUtility, debugLevel } from '../sfUtility';
import * as sfModels from '../sdk/servicefabric/servicefabric/src/models';

/**
 * WebView panel for displaying cluster upgrade progress
 * Visualizes upgrade domains with color-coded states and detailed upgrade information
 */
export class ClusterUpgradeView {
    private panel: vscode.WebviewPanel | undefined;
    private sfRest: SfRest;

    constructor(private context: vscode.ExtensionContext, sfRest: SfRest) {
        this.sfRest = sfRest;
    }

    /**
     * Show or refresh the cluster upgrade details webview
     */
    public async show(): Promise<void> {
        try {
            SfUtility.outputLog('ClusterUpgradeView:show:start', null, debugLevel.info);

            // Create webview panel if it doesn't exist
            if (!this.panel) {
                SfUtility.outputLog('ClusterUpgradeView: Creating new webview panel', null, debugLevel.info);
                this.panel = vscode.window.createWebviewPanel(
                    'clusterUpgradeDetails',
                    'Cluster Upgrade Details',
                    vscode.ViewColumn.One,
                    {
                        enableScripts: true,
                        retainContextWhenHidden: true
                    }
                );

                // Reset panel reference when it's closed
                this.panel.onDidDispose(() => {
                    SfUtility.outputLog('ClusterUpgradeView: Panel disposed', null, debugLevel.info);
                    this.panel = undefined;
                });
            } else {
                SfUtility.outputLog('ClusterUpgradeView: Reusing existing webview panel', null, debugLevel.info);
            }

            // Fetch upgrade progress data
            const upgradeProgress = await this.sfRest.getClusterUpgradeProgress();
            
            // Get actual cluster version (upgrade API returns 0.0.0.0 for never-upgraded clusters)
            let actualClusterVersion = upgradeProgress.codeVersion;
            if (!actualClusterVersion || actualClusterVersion === '0.0.0.0') {
                try {
                    const clusterVersion = await this.sfRest.getClusterVersion();
                    // API returns "Version" (capital V), not "version" (lowercase)
                    actualClusterVersion = (clusterVersion as any).Version || clusterVersion.version || '0.0.0.0';
                    SfUtility.outputLog(`ClusterUpgradeView: Retrieved actual cluster version: ${actualClusterVersion}`, null, debugLevel.info);
                } catch (error) {
                    SfUtility.outputLog('ClusterUpgradeView: Failed to get cluster version', error, debugLevel.warn);
                }
            }
            
            // Log detection results for debugging
            const hasNoUpgrade = (!upgradeProgress.codeVersion || upgradeProgress.codeVersion === '0.0.0.0') &&
                                (!upgradeProgress.startTimestampUtc || 
                                 upgradeProgress.startTimestampUtc === '0001-01-01T00:00:00.000Z' ||
                                 upgradeProgress.startTimestampUtc.startsWith('0001-01-01'));
            SfUtility.outputLog(`ClusterUpgradeView: hasNoUpgradeData=${hasNoUpgrade}, codeVersion=${upgradeProgress.codeVersion}, actualVersion=${actualClusterVersion}, timestamp=${upgradeProgress.startTimestampUtc}`, null, debugLevel.info);
            
            // Generate and set HTML content (pass actual version)
            const html = this.getHtmlContent(upgradeProgress, actualClusterVersion);
            SfUtility.outputLog(`ClusterUpgradeView: Generated HTML length=${html.length}, contains "No cluster upgrade"=${html.includes('No cluster upgrade')}`, null, debugLevel.info);
            this.panel.webview.html = html;
            
            // Reveal the panel
            this.panel.reveal(vscode.ViewColumn.One);
            
            SfUtility.outputLog('ClusterUpgradeView:show:complete', null, debugLevel.info);
        } catch (error) {
            SfUtility.outputLog('ClusterUpgradeView:show:error', error, debugLevel.error);
            vscode.window.showErrorMessage(`Failed to load cluster upgrade details: ${error}`);
        }
    }

    /**
     * Generate HTML content for the webview
     * Public for testing purposes
     */
    public getHtmlContent(progress: sfModels.ClusterUpgradeProgressObject, actualClusterVersion?: string): string {
        // Use actual cluster version if provided (for never-upgraded clusters showing 0.0.0.0)
        const displayVersion = actualClusterVersion || progress.codeVersion || 'N/A';
        
        // Determine if upgrade is actively in progress (only InProgress states, not Completed)
        const isUpgrading = progress.upgradeState === 'RollingForwardInProgress' || 
                           progress.upgradeState === 'RollingBackInProgress' ||
                           progress.upgradeState === 'RollingForwardPending';
        
        // REMOVED: hasNoUpgradeData detection - SFX shows all data regardless
        // Show data even if it's defaults - let users see what the API returns
        
        // Check if upgrade was completed (has real version AND valid timestamp)
        const isCompleted = (progress.upgradeState === 'RollingForwardCompleted' || 
                            progress.upgradeState === 'RollingBackCompleted') &&
                           progress.codeVersion && 
                           progress.codeVersion !== '0.0.0.0' &&
                           progress.startTimestampUtc &&
                           progress.startTimestampUtc !== '0001-01-01T00:00:00.000Z' &&
                           !progress.startTimestampUtc.startsWith('0001-01-01');
        
        // Calculate completed upgrade domains
        const completedUDs = progress.upgradeDomains?.filter(ud => 
            ud.state === 'Completed'
        ).length || 0;
        
        const totalUDs = progress.upgradeDomains?.length || 0;

        // Format timestamps for display (show even if epoch - user can see it's default)
        const startTime = progress.startTimestampUtc 
            ? new Date(progress.startTimestampUtc).toLocaleString() 
            : 'N/A';
        const failureTime = progress.failureTimestampUtc 
            ? new Date(progress.failureTimestampUtc).toLocaleString() 
            : 'N/A';

        // Calculate duration if upgrade is in progress
        let durationMs = 0;
        if (progress.upgradeDurationInMilliseconds) {
            // Handle ISO 8601 duration format (e.g., "PT0H0M0S") or numeric string
            const durationStr = progress.upgradeDurationInMilliseconds;
            if (durationStr.startsWith('PT')) {
                // Parse ISO 8601 duration: PT1H30M45S
                const hours = durationStr.match(/(\d+)H/);
                const minutes = durationStr.match(/(\d+)M/);
                const seconds = durationStr.match(/(\d+)S/);
                durationMs = (hours ? parseInt(hours[1]) * 3600000 : 0) +
                            (minutes ? parseInt(minutes[1]) * 60000 : 0) +
                            (seconds ? parseInt(seconds[1]) * 1000 : 0);
            } else {
                durationMs = parseInt(durationStr);
            }
        }
        const formattedDuration = this.formatDuration(durationMs);
        
        // Extract upgrade description details
        const upgradeDesc = progress.upgradeDescription;

        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            line-height: 1.6;
        }
        
        h2 {
            color: var(--vscode-editor-foreground);
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 10px;
        }
        
        h3 {
            color: var(--vscode-editor-foreground);
            margin-top: 30px;
        }
        
        .upgrade-bar {
            display: flex;
            gap: 4px;
            margin: 20px 0;
            flex-wrap: wrap;
        }
        
        .ud-tile {
            flex: 1;
            min-width: 80px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            color: white;
            font-weight: bold;
            font-size: 12px;
        }
        
        .completed { background: #088105; }
        .inprogress { background: #0075c9; }
        .pending { background: #939393; }
        .failed { background: #E81123; }
        
        .info-grid {
            display: grid;
            grid-template-columns: 200px auto;
            gap: 10px;
            margin: 20px 0;
            font-size: 14px;
        }
        
        .label { 
            font-weight: bold;
            color: var(--vscode-editor-foreground);
        }
        
        .value {
            color: var(--vscode-descriptionForeground);
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 10px;
        }
        
        .status-upgrading {
            background: #0075c9;
            color: white;
        }
        
        .status-completed {
            background: #088105;
            color: white;
        }
        
        .status-failed {
            background: #E81123;
            color: white;
        }
        
        .failure-box {
            border: 2px solid #E81123;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            background: var(--vscode-inputValidation-errorBackground);
        }
        
        .failure-title {
            color: #E81123;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .no-upgrade {
            padding: 20px;
            text-align: center;
            color: var(--vscode-descriptionForeground);
            background: var(--vscode-editor-inactiveSelectionBackground);
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <h2>
        Cluster Upgrade Details
        ${isUpgrading ? '<span class="status-badge status-upgrading">IN PROGRESS</span>' : 
          progress.upgradeState === 'Failed' ? '<span class="status-badge status-failed">FAILED</span>' :
          isCompleted ? '<span class="status-badge status-completed">COMPLETED</span>' : ''}
    </h2>
    
    <h3>Overview</h3>
    <div class="info-grid">
        <div class="label">Code Version:</div>
        <div class="value">${displayVersion}</div>
        
        <div class="label">Config Version:</div>
        <div class="value">${progress.configVersion || 'N/A'}</div>
        
        <div class="label">Upgrade State:</div>
        <div class="value">${progress.upgradeState || 'Unknown'}</div>
        
        <div class="label">Upgrade Mode:</div>
        <div class="value">${progress.rollingUpgradeMode || 'N/A'}</div>
        
        <div class="label">Start Timestamp UTC:</div>
        <div class="value">${startTime}</div>
        
        ${durationMs > 0 || progress.upgradeDurationInMilliseconds ? `
        <div class="label">Duration:</div>
        <div class="value">${durationMs > 0 ? formattedDuration : '0 milliseconds'}</div>
        ` : ''}
        
        ${progress.nextUpgradeDomain ? `
        <div class="label">Next Upgrade Domain:</div>
        <div class="value">${progress.nextUpgradeDomain}</div>
        ` : ''}
        
        ${progress.isNodeByNode !== undefined ? `
        <div class="label">Node-by-Node Upgrade:</div>
        <div class="value">${progress.isNodeByNode ? 'Yes' : 'No'}</div>
        ` : ''}
    </div>
    
    ${upgradeDesc ? `
    <h3>Upgrade Description</h3>
    <div class="info-grid">
        ${upgradeDesc.upgradeKind ? `
        <div class="label">Upgrade Kind:</div>
        <div class="value">${upgradeDesc.upgradeKind}</div>
        ` : ''}
        
        ${upgradeDesc.forceRestart !== undefined ? `
        <div class="label">Force Restart:</div>
        <div class="value">${upgradeDesc.forceRestart ? 'Yes' : 'No'}</div>
        ` : ''}
        
        ${upgradeDesc.upgradeReplicaSetCheckTimeoutInSeconds ? `
        <div class="label">Replica Set Check Timeout:</div>
        <div class="value">${upgradeDesc.upgradeReplicaSetCheckTimeoutInSeconds} seconds</div>
        ` : ''}
        
        ${upgradeDesc.sortOrder ? `
        <div class="label">Sort Order:</div>
        <div class="value">${upgradeDesc.sortOrder}</div>
        ` : ''}
        
        ${upgradeDesc.enableDeltaHealthEvaluation !== undefined ? `
        <div class="label">Delta Health Evaluation:</div>
        <div class="value">${upgradeDesc.enableDeltaHealthEvaluation ? 'Enabled' : 'Disabled'}</div>
        ` : ''}
        
        ${upgradeDesc.monitoringPolicy ? `
        <div class="label">Health Check Wait Duration:</div>
        <div class="value">${upgradeDesc.monitoringPolicy.healthCheckWaitDurationInMilliseconds || 'N/A'}</div>
        
        <div class="label">Health Check Stable Duration:</div>
        <div class="value">${upgradeDesc.monitoringPolicy.healthCheckStableDurationInMilliseconds || 'N/A'}</div>
        
        <div class="label">Health Check Retry Timeout:</div>
        <div class="value">${upgradeDesc.monitoringPolicy.healthCheckRetryTimeoutInMilliseconds || 'N/A'}</div>
        
        <div class="label">Upgrade Timeout:</div>
        <div class="value">${upgradeDesc.monitoringPolicy.upgradeTimeoutInMilliseconds || 'N/A'}</div>
        
        <div class="label">Upgrade Domain Timeout:</div>
        <div class="value">${upgradeDesc.monitoringPolicy.upgradeDomainTimeoutInMilliseconds || 'N/A'}</div>
        ` : ''}
        
        ${upgradeDesc.clusterHealthPolicy ? `
        <div class="label">Max % Unhealthy Nodes:</div>
        <div class="value">${upgradeDesc.clusterHealthPolicy.maxPercentUnhealthyNodes || 0}%</div>
        
        <div class="label">Max % Unhealthy Applications:</div>
        <div class="value">${upgradeDesc.clusterHealthPolicy.maxPercentUnhealthyApplications || 0}%</div>
        ` : ''}
    </div>
    ` : ''}
    
    ${progress.upgradeDomains && progress.upgradeDomains.length > 0 ? `
    <h3>Upgrade Domain Progress</h3>
    <div class="upgrade-bar">
        ${progress.upgradeDomains.map(ud => {
            const stateClass = (ud.state || 'pending').toLowerCase();
            return `
            <div class="ud-tile ${stateClass}" title="${ud.name}: ${ud.state}">
                ${ud.name}
            </div>
            `;
        }).join('')}
    </div>
    ` : ''}
    
    ${progress.failureReason && progress.failureReason !== 'None' ? `
    <div class="failure-box">
        <div class="failure-title">❌ Upgrade Failed</div>
        <div class="info-grid">
            <div class="label">Failure Reason:</div>
            <div class="value">${progress.failureReason}</div>
            
            ${progress.failureTimestampUtc ? `
            <div class="label">Failure Time:</div>
            <div class="value">${failureTime}</div>
            ` : ''}
        </div>
        
        ${progress.unhealthyEvaluations && progress.unhealthyEvaluations.length > 0 ? `
        <div style="margin-top: 15px;">
            <div class="label">Health Evaluations:</div>
            <ul style="margin: 10px 0;">
                ${progress.unhealthyEvaluations.slice(0, 5).map(evaluation => `
                    <li style="color: var(--vscode-descriptionForeground); margin: 5px 0;">
                        ${JSON.stringify(evaluation).substring(0, 200)}...
                    </li>
                `).join('')}
            </ul>
        </div>
        ` : ''}
    </div>
    ` : ''}
</body>
</html>`;
    }

    /**
     * Format duration in milliseconds to human-readable string
     */
    private formatDuration(ms: number): string {
        if (ms === 0) return '0s';
        
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
            return `${days}d ${hours % 24}h ${minutes % 60}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    /**
     * Dispose resources
     */
    public dispose(): void {
        if (this.panel) {
            this.panel.dispose();
            this.panel = undefined;
        }
    }
}
