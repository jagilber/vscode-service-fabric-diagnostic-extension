import * as vscode from 'vscode';
import { SfUtility, debugLevel } from '../sfUtility';
import { SfMgr } from '../sfMgr';
import { ManagementMessage, ApplicationInfo, NodeInfo } from '../types';
import { SfExtSettings, sfExtSettingsList } from '../sfExtSettings';

/**
 * WebView provider for Service Fabric management operations
 * Implements VS Code webview best practices for rich UI interactions
 */
export class ManagementWebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'serviceFabricManagementPanel';
    private _view?: vscode.WebviewView;
    private _selectedCluster?: string;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _sfMgr: SfMgr
    ) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void | Thenable<void> {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlContent(webviewView.webview);

        // Handle messages from webview
        webviewView.webview.onDidReceiveMessage(async (message: ManagementMessage) => {
            try {
                await this._handleMessage(message);
            } catch (error) {
                SfUtility.outputLog('Error handling webview message', error, debugLevel.error);
                this._sendMessageToWebview({
                    command: 'error',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        });

        // Listen for active cluster changes
        vscode.window.onDidChangeActiveTextEditor(() => {
            this._updateSelectedCluster();
        });
    }

    private async _handleMessage(message: ManagementMessage): Promise<void> {
        SfUtility.outputLog(`Management panel received message: ${message.command}`, null, debugLevel.debug);

        switch (message.command) {
            case 'ready':
                await this._onWebviewReady();
                break;

            case 'deployApplication':
                await this._handleDeployApplication();
                break;

            case 'upgradeApplication':
                await this._handleUpgradeApplication(message.data);
                break;

            case 'removeApplication':
                await this._handleRemoveApplication(message.data);
                break;

            case 'deactivateNode':
                await this._handleDeactivateNode(message.data);
                break;

            case 'activateNode':
                await this._handleActivateNode(message.data);
                break;

            case 'restartNode':
                await this._handleRestartNode(message.data);
                break;

            case 'removeNodeState':
                await this._handleRemoveNodeState(message.data);
                break;

            case 'upgradeCluster':
                await this._handleUpgradeCluster(message.data);
                break;

            case 'backupCluster':
                await this._handleBackupCluster();
                break;

            case 'createBackup':
                await this._handleCreateBackup(message.data);
                break;

            case 'restoreBackup':
                await this._handleRestoreBackup(message.data);
                break;

            case 'browseTemplates':
                await this._handleBrowseTemplates();
                break;

            case 'deployTemplate':
                await this._handleDeployTemplate(message.data);
                break;

            case 'openTemplateSettings':
                await this._handleOpenTemplateSettings();
                break;

            default:
                SfUtility.outputLog(`Unknown command: ${message.command}`, null, debugLevel.warn);
        }
    }

    private async _onWebviewReady(): Promise<void> {
        // Send initial state to webview
        await this._updateSelectedCluster();
    }

    private async _updateSelectedCluster(): Promise<void> {
        const config = this._sfMgr.getCurrentSfConfig();
        if (config) {
            this._selectedCluster = config.getClusterEndpoint();
            this._sendMessageToWebview({
                command: 'updateCluster',
                cluster: this._selectedCluster
            });
        }
    }

    private _sendMessageToWebview(message: Record<string, unknown>): void {
        this._view?.webview.postMessage(message);
    }

    // ==================== APPLICATION LIFECYCLE ====================

    private async _handleDeployApplication(): Promise<void> {
        // Step 1: Select application package
        const files = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            filters: {
                'Application Package': ['sfpkg', 'zip']
            },
            title: 'Select Service Fabric Application Package'
        });

        if (!files || files.length === 0) {
            return;
        }

        const packagePath = files[0].fsPath;

        // Step 2: Get application name
        const appName = await vscode.window.showInputBox({
            prompt: 'Application Name (must start with fabric:/)',
            placeHolder: 'fabric:/MyApplication',
            validateInput: (value: string) => {
                if (!value.startsWith('fabric:/')) {
                    return 'Application name must start with fabric:/';
                }
                return null;
            }
        });

        if (!appName) {
            return;
        }

        // Step 3: Get application type name
        const appTypeName = await vscode.window.showInputBox({
            prompt: 'Application Type Name',
            placeHolder: 'MyApplicationType'
        });

        if (!appTypeName) {
            return;
        }

        // Step 4: Get application type version
        const appTypeVersion = await vscode.window.showInputBox({
            prompt: 'Application Type Version',
            placeHolder: '1.0.0'
        });

        if (!appTypeVersion) {
            return;
        }

        // Step 5: Confirm deployment
        const confirm = await vscode.window.showQuickPick(['Yes', 'No'], {
            placeHolder: `Deploy ${appName} (${appTypeName}:${appTypeVersion}) to cluster?`
        });

        if (confirm !== 'Yes') {
            return;
        }

        // Step 6: Deploy with progress
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Deploying Application',
            cancellable: true
        }, async (progress: vscode.Progress<{ message?: string; increment?: number }>, token: vscode.CancellationToken) => {
            try {
                progress.report({ increment: 0, message: 'Uploading package...' });
                
                const sfRest = this._sfMgr.getCurrentSfConfig().getSfRest();
                
                // Check if methods are implemented
                if (typeof (sfRest as any).uploadApplicationPackage !== 'function') {
                    throw new Error('Application deployment not yet implemented. See MANAGEMENT_VIEW_INTEGRATION.md for required SfRest methods.');
                }
                
                // Upload package
                await (sfRest as any).uploadApplicationPackage(packagePath, appTypeName, appTypeVersion);
                
                if (token.isCancellationRequested) {
                    return;
                }

                progress.report({ increment: 33, message: 'Provisioning application type...' });
                
                // Provision application type
                await (sfRest as any).provisionApplicationType(appTypeName, appTypeVersion);
                
                if (token.isCancellationRequested) {
                    return;
                }

                progress.report({ increment: 66, message: 'Creating application instance...' });
                
                // Create application
                await (sfRest as any).createApplication(appName, appTypeName, appTypeVersion);
                
                progress.report({ increment: 100, message: 'Deployment complete!' });
                
                vscode.window.showInformationMessage(`Application ${appName} deployed successfully!`);
                
                // Refresh tree view
                this._sfMgr.sfClusterView.refresh();
                
            } catch (error) {
                SfUtility.outputLog('Application deployment failed', error, debugLevel.error);
                vscode.window.showErrorMessage(`Deployment failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
    }

    private async _handleUpgradeApplication(_data: unknown): Promise<void> {
        vscode.window.showInformationMessage('Application upgrade not yet implemented');
        // TODO: Implement application upgrade workflow
    }

    private async _handleRemoveApplication(_data: unknown): Promise<void> {
        const apps = await this._getApplicationList();
        
        const selectedApp = await vscode.window.showQuickPick(apps, {
            placeHolder: 'Select application to remove'
        });

        if (!selectedApp) {
            return;
        }

        const confirm = await vscode.window.showWarningMessage(
            `Are you sure you want to remove application ${selectedApp}? This action cannot be undone.`,
            { modal: true },
            'Yes',
            'No'
        );

        if (confirm !== 'Yes') {
            return;
        }

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Removing Application ${selectedApp}`,
            cancellable: false
        }, async (progress: vscode.Progress<{ message?: string; increment?: number }>) => {
            try {
                progress.report({ message: 'Deleting application...' });
                
                const sfRest = this._sfMgr.getCurrentSfConfig().getSfRest();
                
                if (typeof (sfRest as any).deleteApplication !== 'function') {
                    throw new Error('Application deletion not yet implemented. See MANAGEMENT_VIEW_INTEGRATION.md');
                }
                
                await (sfRest as any).deleteApplication(selectedApp);
                
                vscode.window.showInformationMessage(`Application ${selectedApp} removed successfully!`);
                this._sfMgr.sfClusterView.refresh();
                
            } catch (error) {
                SfUtility.outputLog('Application removal failed', error, debugLevel.error);
                vscode.window.showErrorMessage(`Removal failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
    }

    // ==================== NODE MANAGEMENT ====================

    private async _handleDeactivateNode(_data: unknown): Promise<void> {
        const nodes = await this._getNodeList();
        
        const selectedNode = await vscode.window.showQuickPick(nodes, {
            placeHolder: 'Select node to deactivate'
        });

        if (!selectedNode) {
            return;
        }

        const intent = await vscode.window.showQuickPick([
            { label: 'Pause', description: 'Pauses the node. Data remains accessible.' },
            { label: 'Restart', description: 'Restarts the node.' },
            { label: 'RemoveData', description: 'Removes all data from the node.' },
            { label: 'RemoveNode', description: 'Permanently removes the node from the cluster.' }
        ], {
            placeHolder: 'Select deactivation intent'
        });

        if (!intent) {
            return;
        }

        const confirm = await vscode.window.showWarningMessage(
            `Deactivate node ${selectedNode} with intent ${intent.label}?`,
            'Yes',
            'No'
        );

        if (confirm !== 'Yes') {
            return;
        }

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Deactivating Node ${selectedNode}`,
            cancellable: false
        }, async (progress: vscode.Progress<{ message?: string; increment?: number }>) => {
            try {
                const sfRest = this._sfMgr.getCurrentSfConfig().getSfRest();
                
                if (typeof (sfRest as any).deactivateNode !== 'function') {
                    throw new Error('Node deactivation not yet implemented. See MANAGEMENT_VIEW_INTEGRATION.md');
                }
                
                await (sfRest as any).deactivateNode(selectedNode, intent.label);
                
                vscode.window.showInformationMessage(`Node ${selectedNode} deactivated successfully!`);
                this._sfMgr.sfClusterView.refresh();
                
            } catch (error) {
                SfUtility.outputLog('Node deactivation failed', error, debugLevel.error);
                vscode.window.showErrorMessage(`Deactivation failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
    }

    private async _handleActivateNode(_data: unknown): Promise<void> {
        const nodes = await this._getNodeList();
        
        const selectedNode = await vscode.window.showQuickPick(nodes, {
            placeHolder: 'Select node to activate'
        });

        if (!selectedNode) {
            return;
        }

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Activating Node ${selectedNode}`,
            cancellable: false
        }, async (progress: vscode.Progress<{ message?: string; increment?: number }>) => {
            try {
                const sfRest = this._sfMgr.getCurrentSfConfig().getSfRest();
                
                if (typeof (sfRest as any).activateNode !== 'function') {
                    throw new Error('Node activation not yet implemented. See MANAGEMENT_VIEW_INTEGRATION.md');
                }
                
                await (sfRest as any).activateNode(selectedNode);
                
                vscode.window.showInformationMessage(`Node ${selectedNode} activated successfully!`);
                this._sfMgr.sfClusterView.refresh();
                
            } catch (error) {
                SfUtility.outputLog('Node activation failed', error, debugLevel.error);
                vscode.window.showErrorMessage(`Activation failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
    }

    private async _handleRestartNode(_data: unknown): Promise<void> {
        const nodes = await this._getNodeList();
        
        const selectedNode = await vscode.window.showQuickPick(nodes, {
            placeHolder: 'Select node to restart'
        });

        if (!selectedNode) {
            return;
        }

        const confirm = await vscode.window.showWarningMessage(
            `Restart node ${selectedNode}? This will cause the node to go down temporarily.`,
            { modal: true },
            'Restart',
            'Cancel'
        );

        if (confirm !== 'Restart') {
            return;
        }

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Restarting Node ${selectedNode}`,
            cancellable: false
        }, async (progress: vscode.Progress<{ message?: string; increment?: number }>) => {
            try {
                const sfRest = this._sfMgr.getCurrentSfConfig().getSfRest();
                await sfRest.restartNode(selectedNode);
                
                vscode.window.showInformationMessage(`Node ${selectedNode} restart initiated!`);
                this._sfMgr.sfClusterView.refresh();
                
            } catch (error) {
                SfUtility.outputLog('Node restart failed', error, debugLevel.error);
                vscode.window.showErrorMessage(`Restart failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
    }

    private async _handleRemoveNodeState(_data: unknown): Promise<void> {
        const nodes = await this._getNodeList();
        
        const selectedNode = await vscode.window.showQuickPick(nodes, {
            placeHolder: 'Select node to remove state (DESTRUCTIVE)'
        });

        if (!selectedNode) {
            return;
        }

        const confirm = await vscode.window.showWarningMessage(
            `⚠️ DANGER: Remove state for node ${selectedNode}?\n\nThis is a DESTRUCTIVE operation that:\n- Deletes all persisted state on the node\n- Cannot be undone\n- Should only be done if node cannot recover\n\nType the node name to confirm:`,
            { modal: true },
            'Cancel'
        );

        if (confirm !== 'Cancel') {
            // Ask user to type node name to confirm
            const typedName = await vscode.window.showInputBox({
                prompt: `Type '${selectedNode}' to confirm removal`,
                validateInput: (value: string) => {
                    return value === selectedNode ? null : 'Node name must match';
                }
            });

            if (typedName !== selectedNode) {
                return;
            }

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Removing Node State ${selectedNode}`,
                cancellable: false
            }, async (progress: vscode.Progress<{ message?: string; increment?: number }>) => {
                try {
                    const sfRest = this._sfMgr.getCurrentSfConfig().getSfRest();
                    await sfRest.removeNodeState(selectedNode);
                    
                    vscode.window.showWarningMessage(`Node state removed for ${selectedNode}`);
                    this._sfMgr.sfClusterView.refresh();
                    
                } catch (error) {
                    SfUtility.outputLog('Remove node state failed', error, debugLevel.error);
                    vscode.window.showErrorMessage(`Remove state failed: ${error instanceof Error ? error.message : String(error)}`);
                }
            });
        }
    }

    // ==================== CLUSTER OPERATIONS ====================

    private async _handleUpgradeCluster(_data: unknown): Promise<void> {
        vscode.window.showInformationMessage('Cluster upgrade not yet implemented');
    }

    private async _handleBackupCluster(): Promise<void> {
        vscode.window.showInformationMessage('Cluster backup not yet implemented');
    }

    private async _handleCreateBackup(_data: unknown): Promise<void> {
        vscode.window.showInformationMessage('Backup creation not yet implemented');
    }

    private async _handleRestoreBackup(_data: unknown): Promise<void> {
        vscode.window.showInformationMessage('Backup restore not yet implemented');
    }

    // ==================== ARM TEMPLATE DEPLOYMENT ====================

    private async _handleBrowseTemplates(): Promise<void> {
        const repos: Array<{ name: string; url: string; branch?: string; description?: string }> =
            SfExtSettings.getSetting(sfExtSettingsList.templateRepositories) || [];

        if (repos.length === 0) {
            const openSettings = await vscode.window.showWarningMessage(
                'No template repositories configured. Add repositories in settings.',
                'Open Settings'
            );
            if (openSettings) {
                await this._handleOpenTemplateSettings();
            }
            return;
        }

        const repoItems = repos.map(r => ({
            label: r.name,
            description: r.branch ? `branch: ${r.branch}` : '',
            detail: r.description || r.url,
            url: r.url,
            branch: r.branch
        }));

        const selected = await vscode.window.showQuickPick(repoItems, {
            placeHolder: 'Select a template repository to browse',
            title: 'Service Fabric Template Repositories'
        });

        if (!selected) {
            return;
        }

        // Open the repo in VS Code's Simple Browser
        const branchPath = selected.branch ? `/tree/${selected.branch}` : '';
        const repoUrl = `${selected.url}${branchPath}`;
        await vscode.commands.executeCommand('simpleBrowser.api.open', repoUrl);
    }

    private async _handleDeployTemplate(_data: unknown): Promise<void> {
        vscode.window.showInformationMessage('ARM template deployment will be available in a future release');
    }

    private async _handleOpenTemplateSettings(): Promise<void> {
        await vscode.commands.executeCommand(
            'workbench.action.openSettings',
            'sfClusterExplorer.templateRepositories'
        );
    }

    // ==================== HELPER METHODS ====================

    private async _getApplicationList(): Promise<string[]> {
        try {
            const sfRest = this._sfMgr.getCurrentSfConfig().getSfRest();
            const apps = await sfRest.getApplications();
            return apps.map((app: ApplicationInfo) => app.name || app.id || 'Unknown');
        } catch (error) {
            SfUtility.outputLog('Failed to get application list', error, debugLevel.error);
            return [];
        }
    }

    private async _getNodeList(): Promise<string[]> {
        try {
            const sfRest = this._sfMgr.getCurrentSfConfig().getSfRest();
            const nodes = await sfRest.getNodes();
            return nodes.map((node: NodeInfo) => node.name || 'Unknown');
        } catch (error) {
            SfUtility.outputLog('Failed to get node list', error, debugLevel.error);
            return [];
        }
    }

    // ==================== HTML CONTENT ====================

    private _getHtmlContent(webview: vscode.Webview): string {
        // Use VS Code's nonce for security
        const nonce = this._getNonce();

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
            <title>Service Fabric Management</title>
            <style>
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                
                body { 
                    padding: 0; 
                    font-family: var(--vscode-font-family);
                    font-size: var(--vscode-font-size);
                    color: var(--vscode-foreground);
                    background-color: transparent;
                }

                .panel-header {
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                    background: var(--vscode-sideBar-background);
                }

                .panel-header h2 {
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: var(--vscode-sideBarSectionHeader-foreground);
                    margin: 0;
                }

                .cluster-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    margin-top: 8px;
                    padding: 4px 10px;
                    background: var(--vscode-badge-background);
                    color: var(--vscode-badge-foreground);
                    border-radius: 10px;
                    font-size: 11px;
                    font-weight: 500;
                    max-width: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .cluster-badge .dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #3fb950;
                    flex-shrink: 0;
                }

                .sections {
                    padding: 4px 0;
                }

                .section {
                    border-bottom: 1px solid var(--vscode-panel-border);
                }

                .section:last-child {
                    border-bottom: none;
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    cursor: pointer;
                    user-select: none;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: var(--vscode-sideBarSectionHeader-foreground);
                    background: var(--vscode-sideBarSectionHeader-background);
                }

                .section-header:hover {
                    background: var(--vscode-list-hoverBackground);
                }

                .section-header .chevron {
                    font-size: 10px;
                    transition: transform 0.15s ease;
                    flex-shrink: 0;
                }

                .section-header .chevron.collapsed {
                    transform: rotate(-90deg);
                }

                .section-header .icon {
                    font-size: 14px;
                    flex-shrink: 0;
                }

                .section-body {
                    padding: 4px 8px 8px;
                    overflow: hidden;
                }

                .section-body.collapsed {
                    display: none;
                }

                .btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                    border: none;
                    padding: 6px 12px;
                    margin: 1px 0;
                    cursor: pointer;
                    font-size: 12px;
                    font-family: var(--vscode-font-family);
                    border-radius: 4px;
                    text-align: left;
                    transition: background-color 0.1s;
                    background: transparent;
                    color: var(--vscode-foreground);
                }

                .btn:hover {
                    background: var(--vscode-list-hoverBackground);
                }

                .btn:active {
                    background: var(--vscode-list-activeSelectionBackground);
                    color: var(--vscode-list-activeSelectionForeground);
                }

                .btn .btn-icon {
                    font-size: 14px;
                    width: 18px;
                    text-align: center;
                    flex-shrink: 0;
                    opacity: 0.8;
                }

                .btn .btn-label {
                    flex: 1;
                }

                .btn .btn-badge {
                    font-size: 10px;
                    padding: 1px 6px;
                    border-radius: 8px;
                    background: var(--vscode-badge-background);
                    color: var(--vscode-badge-foreground);
                    font-weight: 600;
                }

                .btn.destructive {
                    color: var(--vscode-errorForeground);
                }

                .btn.destructive:hover {
                    background: rgba(255, 85, 85, 0.1);
                }

                .btn.primary {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    margin: 4px 0;
                    padding: 8px 12px;
                    font-weight: 500;
                }

                .btn.primary:hover {
                    background: var(--vscode-button-hoverBackground);
                }

                .separator {
                    height: 1px;
                    background: var(--vscode-panel-border);
                    margin: 4px 12px;
                    opacity: 0.5;
                }

                .no-cluster {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 32px 20px;
                    text-align: center;
                    color: var(--vscode-descriptionForeground);
                    gap: 12px;
                }

                .no-cluster .icon-large {
                    font-size: 32px;
                    opacity: 0.4;
                }

                .no-cluster p {
                    font-size: 12px;
                    line-height: 1.5;
                    margin: 0;
                }

                .template-repo-list {
                    padding: 0 4px;
                }

                .template-repo-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 5px 8px;
                    margin: 2px 0;
                    border-radius: 4px;
                    font-size: 11px;
                    color: var(--vscode-descriptionForeground);
                    cursor: pointer;
                }

                .template-repo-item:hover {
                    background: var(--vscode-list-hoverBackground);
                    color: var(--vscode-foreground);
                }

                .template-repo-item .repo-icon {
                    font-size: 13px;
                    flex-shrink: 0;
                    opacity: 0.7;
                }

                .template-repo-item .repo-info {
                    flex: 1;
                    min-width: 0;
                }

                .template-repo-item .repo-name {
                    font-weight: 500;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    color: var(--vscode-foreground);
                    font-size: 12px;
                }

                .template-repo-item .repo-branch {
                    font-size: 10px;
                    color: var(--vscode-descriptionForeground);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            </style>
        </head>
        <body>
            <div id="content">
                <div class="no-cluster">
                    <div class="icon-large">&#9881;</div>
                    <p>Connect to a cluster to access management operations.</p>
                </div>
            </div>

            <script nonce="${nonce}">
                const vscode = acquireVsCodeApi();
                let currentCluster = null;
                const collapsedSections = {};

                vscode.postMessage({ command: 'ready' });

                // Event delegation - handle all clicks from a single listener
                document.addEventListener('click', function(e) {
                    const target = e.target.closest('[data-action]');
                    if (target) {
                        const action = target.getAttribute('data-action');
                        if (action === 'toggle') {
                            toggleSection(target.getAttribute('data-section'));
                        } else {
                            vscode.postMessage({ command: action });
                        }
                        return;
                    }
                });

                window.addEventListener('message', function(event) {
                    const message = event.data;
                    switch (message.command) {
                        case 'updateCluster':
                            currentCluster = message.cluster;
                            renderContent();
                            break;
                        case 'error':
                            showError(message.error);
                            break;
                    }
                });

                function toggleSection(id) {
                    collapsedSections[id] = !collapsedSections[id];
                    const body = document.getElementById('body-' + id);
                    const chevron = document.getElementById('chevron-' + id);
                    if (body && chevron) {
                        body.classList.toggle('collapsed', collapsedSections[id]);
                        chevron.classList.toggle('collapsed', collapsedSections[id]);
                    }
                }

                function renderContent() {
                    const content = document.getElementById('content');
                    
                    if (!currentCluster) {
                        content.innerHTML =
                            '<div class="no-cluster">' +
                                '<div class="icon-large">&#9881;</div>' +
                                '<p>Connect to a cluster to access<br>management operations.</p>' +
                            '</div>' +
                            renderTemplateSection();
                        return;
                    }

                    content.innerHTML =
                        '<div class="panel-header">' +
                            '<h2>Cluster Management</h2>' +
                            '<div class="cluster-badge">' +
                                '<span class="dot"></span>' +
                                escapeHtml(currentCluster) +
                            '</div>' +
                        '</div>' +
                        '<div class="sections">' +
                            renderSection('apps', '&#128230;', 'Application Lifecycle',
                                btn('primary', 'deployApplication', '&#128640;', 'Deploy Application') +
                                btn('', 'upgradeApplication', '&#8593;', 'Upgrade Application') +
                                '<div class="separator"></div>' +
                                btn('destructive', 'removeApplication', '&#128465;', 'Remove Application')
                            ) +
                            renderSection('nodes', '&#128421;', 'Node Management',
                                btn('', 'deactivateNode', '&#9724;', 'Deactivate Node') +
                                btn('', 'activateNode', '&#9654;', 'Activate Node') +
                                btn('', 'restartNode', '&#128260;', 'Restart Node') +
                                '<div class="separator"></div>' +
                                btn('destructive', 'removeNodeState', '&#9888;', 'Remove Node State', 'DANGER')
                            ) +
                            renderSection('cluster', '&#9881;', 'Cluster Operations',
                                btn('', 'upgradeCluster', '&#8593;', 'Upgrade Cluster') +
                                btn('', 'backupCluster', '&#128190;', 'Backup &amp; Restore')
                            ) +
                            renderTemplateSection() +
                        '</div>';
                }

                function renderSection(id, icon, title, bodyHtml) {
                    var isCollapsed = collapsedSections[id] || false;
                    return '<div class="section">' +
                        '<div class="section-header" data-action="toggle" data-section="' + id + '">' +
                            '<span id="chevron-' + id + '" class="chevron' + (isCollapsed ? ' collapsed' : '') + '">&#9660;</span>' +
                            '<span class="icon">' + icon + '</span>' +
                            title +
                        '</div>' +
                        '<div id="body-' + id + '" class="section-body' + (isCollapsed ? ' collapsed' : '') + '">' +
                            bodyHtml +
                        '</div>' +
                    '</div>';
                }

                function btn(cls, action, icon, label, badge) {
                    return '<button class="btn' + (cls ? ' ' + cls : '') + '" data-action="' + action + '">' +
                        '<span class="btn-icon">' + icon + '</span>' +
                        '<span class="btn-label">' + label + '</span>' +
                        (badge ? '<span class="btn-badge">' + badge + '</span>' : '') +
                    '</button>';
                }

                function renderTemplateSection() {
                    return renderSection('templates', '&#128196;', 'ARM Template Deployment',
                        btn('primary', 'browseTemplates', '&#128269;', 'Browse Templates') +
                        btn('', 'deployTemplate', '&#9729;', 'Deploy Template to Azure') +
                        '<div class="separator"></div>' +
                        btn('', 'openTemplateSettings', '&#9881;', 'Configure Repositories')
                    );
                }

                function escapeHtml(str) {
                    var div = document.createElement('div');
                    div.appendChild(document.createTextNode(str));
                    return div.innerHTML;
                }

                function showError(errorMessage) {
                    var content = document.getElementById('content');
                    var errorDiv = document.createElement('div');
                    errorDiv.style.cssText = 'padding:8px 12px;margin:8px;background:var(--vscode-inputValidation-errorBackground);border:1px solid var(--vscode-inputValidation-errorBorder);color:var(--vscode-errorForeground);border-radius:4px;font-size:12px;';
                    errorDiv.textContent = errorMessage;
                    content.appendChild(errorDiv);
                    setTimeout(function() { errorDiv.remove(); }, 5000);
                }
            </script>
        </body>
        </html>`;
    }

    private _getNonce(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}
