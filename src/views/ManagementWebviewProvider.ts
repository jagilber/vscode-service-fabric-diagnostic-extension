import * as vscode from 'vscode';
import { SfUtility, debugLevel } from '../sfUtility';
import { SfMgr } from '../sfMgr';
import { ManagementMessage, ApplicationInfo, NodeInfo } from '../types';

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
                }
                
                body { 
                    padding: 10px; 
                    font-family: var(--vscode-font-family);
                    font-size: var(--vscode-font-size);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    margin: 0;
                }

                h2 {
                    font-size: 16px;
                    font-weight: 600;
                    margin: 0 0 15px 0;
                    color: var(--vscode-foreground);
                }

                h3 {
                    font-size: 13px;
                    font-weight: 600;
                    margin: 0 0 10px 0;
                    color: var(--vscode-descriptionForeground);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .cluster-info {
                    padding: 8px;
                    margin-bottom: 15px;
                    background-color: var(--vscode-editor-inactiveSelectionBackground);
                    border-radius: 3px;
                    font-size: 12px;
                }

                .cluster-info strong {
                    color: var(--vscode-textLink-foreground);
                }
                
                .action-group {
                    margin: 0 0 20px 0;
                    padding: 12px;
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 4px;
                    background-color: var(--vscode-editor-background);
                }
                
                .action-button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 8px 12px;
                    margin: 4px 0;
                    cursor: pointer;
                    width: 100%;
                    text-align: left;
                    font-size: 13px;
                    border-radius: 2px;
                    transition: background-color 0.1s;
                }
                
                .action-button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }

                .action-button:active {
                    background-color: var(--vscode-button-background);
                    opacity: 0.9;
                }

                .action-button.secondary {
                    background-color: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                }

                .action-button.secondary:hover {
                    background-color: var(--vscode-button-secondaryHoverBackground);
                }

                .action-button.destructive {
                    background-color: var(--vscode-errorForeground);
                    color: var(--vscode-button-foreground);
                }

                .action-button icon {
                    margin-right: 6px;
                }

                .no-cluster {
                    padding: 20px;
                    text-align: center;
                    color: var(--vscode-descriptionForeground);
                }
            </style>
        </head>
        <body>
            <div id="content">
                <div class="no-cluster">
                    <p>Connect to a cluster to access management operations.</p>
                </div>
            </div>

            <script nonce="${nonce}">
                const vscode = acquireVsCodeApi();
                let currentCluster = null;

                // Send ready message
                vscode.postMessage({ command: 'ready' });

                // Handle messages from extension
                window.addEventListener('message', event => {
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

                function renderContent() {
                    const content = document.getElementById('content');
                    
                    if (!currentCluster) {
                        content.innerHTML = '<div class="no-cluster"><p>Connect to a cluster to access management operations.</p></div>';
                        return;
                    }

                    content.innerHTML = \`
                        <h2>Cluster Management</h2>
                        
                        <div class="cluster-info">
                            <strong>Active Cluster:</strong> \${currentCluster}
                        </div>

                        <div class="action-group">
                            <h3>📦 Application Lifecycle</h3>
                            <button class="action-button" onclick="deployApp()">
                                Deploy Application
                            </button>
                            <button class="action-button secondary" onclick="upgradeApp()">
                                Upgrade Application
                            </button>
                            <button class="action-button destructive" onclick="removeApp()">
                                Remove Application
                            </button>
                        </div>

                        <div class="action-group">
                            <h3>🖥️ Node Management</h3>
                            <button class="action-button" onclick="deactivateNode()">
                                Deactivate Node
                            </button>
                            <button class="action-button" onclick="activateNode()">
                                Activate Node
                            </button>
                            <button class="action-button secondary" onclick="restartNode()">
                                Restart Node
                            </button>
                            <button class="action-button destructive" onclick="removeNodeState()">
                                Remove Node State
                            </button>
                        </div>

                        <div class="action-group">
                            <h3>⚙️ Cluster Operations</h3>
                            <button class="action-button" onclick="upgradeCluster()">
                                Upgrade Cluster
                            </button>
                            <button class="action-button" onclick="backupCluster()">
                                Backup & Restore
                            </button>
                        </div>
                    \`;
                }

                function deployApp() {
                    vscode.postMessage({ command: 'deployApplication' });
                }

                function upgradeApp() {
                    vscode.postMessage({ command: 'upgradeApplication' });
                }

                function removeApp() {
                    vscode.postMessage({ command: 'removeApplication' });
                }

                function deactivateNode() {
                    vscode.postMessage({ command: 'deactivateNode' });
                }

                function activateNode() {
                    vscode.postMessage({ command: 'activateNode' });
                }

                function restartNode() {
                    vscode.postMessage({ command: 'restartNode' });
                }

                function removeNodeState() {
                    vscode.postMessage({ command: 'removeNodeState' });
                }

                function upgradeCluster() {
                    vscode.postMessage({ command: 'upgradeCluster' });
                }

                function backupCluster() {
                    vscode.postMessage({ command: 'backupCluster' });
                }

                function showError(errorMessage) {
                    const content = document.getElementById('content');
                    const errorDiv = document.createElement('div');
                    errorDiv.style.padding = '10px';
                    errorDiv.style.marginTop = '10px';
                    errorDiv.style.backgroundColor = 'var(--vscode-inputValidation-errorBackground)';
                    errorDiv.style.border = '1px solid var(--vscode-inputValidation-errorBorder)';
                    errorDiv.style.color = 'var(--vscode-errorForeground)';
                    errorDiv.textContent = errorMessage;
                    content.appendChild(errorDiv);
                    
                    setTimeout(() => errorDiv.remove(), 5000);
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
