'use strict';

import * as vscode from 'vscode';
import { SfMgr } from './sfMgr';
import { SfPrompts } from './sfPrompts';
import { SfUtility, debugLevel } from './sfUtility';
import { ManagementWebviewProvider } from './views/ManagementWebviewProvider';
import { CommandRegistry, COMMAND_MANIFEST } from './commands/CommandRegistry';
import { SfProjectService } from './services/SfProjectService';
import { SfDeployService } from './services/SfDeployService';
import { SfManifestValidator } from './services/SfManifestValidator';
import { SfApplicationsDataProvider } from './treeview/SfApplicationsDataProvider';

// Global references for cleanup
let sfMgrInstance: SfMgr | undefined;
let sfPromptsInstance: SfPrompts | undefined;
let projectServiceInstance: SfProjectService | undefined;
let deployServiceInstance: SfDeployService | undefined;
let manifestValidatorInstance: SfManifestValidator | undefined;
let applicationsProviderInstance: SfApplicationsDataProvider | undefined;


export async function activate(context: vscode.ExtensionContext) {
    try {
        console.log('[SF Extension] 1/10 - Starting activation...');
        
        // CRITICAL: Declare sfMgr/sfPrompts here so they're available in command closures
        let sfMgr: SfMgr;
        let sfPrompts: SfPrompts;
        
        // CRITICAL: Initialize SfUtility FIRST to create output channel
        SfUtility.init(context);
        console.log('[SF Extension] 1.5/10 - SfUtility initialized');
        
        SfUtility.outputLog('Service Fabric extension activating', null, debugLevel.info);
        
        // Global unhandled promise rejection handler
        // SCOPED: Only handles rejections originating from THIS extension (stack trace filtering)
        const extensionId = 'vscode-service-fabric-diagnostic-extension';
        const unhandledRejectionHandler = (reason: any, promise: Promise<any>) => {
            // Only handle rejections that originate from this extension
            const stack = reason?.stack || '';
            const reasonStr = String(reason);
            if (!stack.includes(extensionId) && !reasonStr.includes(extensionId)) {
                // Not from this extension — ignore silently
                return;
            }

            console.error('[SF Extension] Unhandled Promise Rejection:', {
                reason: reason,
                reasonString: reasonStr,
                stack: stack,
            });

            const errorMsg = reason?.message || reasonStr;

            // Check for corrupted globalState error — scope to this extension only
            if (errorMsg.includes('globalState') && errorMsg.includes('JSON')) {
                SfUtility.outputLog('Corrupted extension state detected — resetting', null, debugLevel.warn);
                vscode.window.showWarningMessage(
                    'Service Fabric Extension: Corrupted extension state detected. ' +
                    'The state has been reset. Please reconnect to your clusters.'
                );
                return;
            }

            // Log but don't show popup for network errors
            if (reasonStr.includes('NetworkError') || reasonStr.includes('Request error') || reasonStr.includes('ECONNREFUSED')) {
                SfUtility.outputLog(`Network error (suppressed popup): ${errorMsg}`, null, debugLevel.warn);
                return;
            }

            // For other SF-originated errors, log to output channel (no popup)
            SfUtility.outputLog(`Unhandled rejection: ${errorMsg}`, null, debugLevel.warn);
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
        // Check autoStart setting to determine if views should be visible immediately
        const autoStart = vscode.workspace.getConfiguration('sfClusterExplorer').get<boolean>('autoStart', false);

        // Helper: performs full initialization (SfMgr, tree views, commands, auto-reconnect)
        const performFullInit = async () => {
            const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
                ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

            console.log('[SF Extension] 4/10 - Creating SfMgr...');
            sfMgr = new SfMgr(context);

            console.log('[SF Extension] 5/10 - Creating SfPrompts...');
            sfPrompts = new SfPrompts(context);

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

            console.log('[SF Extension] 7.5/10 - Setting up SF Applications view...');
            // Create project services and applications tree view
            const projectService = new SfProjectService();
            projectService.setContext(context);
            const deployService = new SfDeployService();
            const manifestValidator = new SfManifestValidator();
            const applicationsProvider = new SfApplicationsDataProvider(projectService, context);

            projectServiceInstance = projectService;
            deployServiceInstance = deployService;
            manifestValidatorInstance = manifestValidator;
            applicationsProviderInstance = applicationsProvider;

            context.subscriptions.push(projectService);
            context.subscriptions.push(deployService);
            context.subscriptions.push(manifestValidator);
            context.subscriptions.push(applicationsProvider);

            console.log('[SF Extension] 8/10 - Registering commands...');
            // Register ALL commands via centralized CommandRegistry
            CommandRegistry.registerAll(context, sfMgr, sfPrompts, projectService, deployService, applicationsProvider, manifestValidator);

            console.log('[SF Extension] 9/10 - All commands registered successfully');

            // Post-registration validation — logs warnings for any manifest/registration mismatches
            CommandRegistry.validateRegistrations();

            // Auto-reconnect to previously connected clusters (fire-and-forget)
            // Only runs when autoStart=true (explicit start also triggers this)
            sfMgr.autoReconnectClusters().catch(err => {
                SfUtility.outputLog('Auto-reconnect failed', err, debugLevel.warn);
            });
        };

        if (autoStart) {
            // Auto-start: show views and perform full initialization immediately
            await Promise.race([
                vscode.commands.executeCommand('setContext', 'serviceFabricActive', true),
                new Promise((_, reject) => setTimeout(() => reject(new Error('setContext timeout')), 5000))
            ]).catch(err => {
                console.warn('[SF Extension] setContext failed or timed out:', err);
            });

            await performFullInit();

            // Register the Start Extension command (no-op when already started)
            context.subscriptions.push(
                vscode.commands.registerCommand('sfClusterExplorer.startExtension', async () => {
                    SfUtility.outputLog('Extension already active (autoStart=true)', null, debugLevel.info);
                    vscode.window.showInformationMessage('Service Fabric Extension is already active.');
                })
            );
        } else {
            // Manual start: register lazy-init wrappers for ALL commands so any
            // SF command can trigger full initialization (not just startExtension).
            console.log('[SF Extension] autoStart=false — registering lazy-init command wrappers');
            SfUtility.outputLog('autoStart=false — extension loaded but inactive. Any Service Fabric command will activate it.', null, debugLevel.info);

            let initialized = false;
            let initPromise: Promise<void> | undefined;
            const lazyDisposables: vscode.Disposable[] = [];

            const ensureInitialized = async (): Promise<void> => {
                if (initialized) { return; }
                if (initPromise) { return initPromise; }
                initPromise = (async () => {
                    initialized = true;
                    // Dispose all lazy wrappers BEFORE registering real handlers
                    // so VS Code doesn't throw "command already registered"
                    for (const d of lazyDisposables) { d.dispose(); }
                    lazyDisposables.length = 0;

                    await vscode.commands.executeCommand('setContext', 'serviceFabricActive', true);
                    await performFullInit();
                    SfUtility.outputLog('Service Fabric extension started via command', null, debugLevel.info);
                    vscode.window.showInformationMessage('Service Fabric Extension is now active.');
                })();
                return initPromise;
            };

            // Register startExtension explicitly
            const startDisp = vscode.commands.registerCommand('sfClusterExplorer.startExtension', async () => {
                if (initialized) {
                    vscode.window.showInformationMessage('Service Fabric Extension is already active.');
                    return;
                }
                await ensureInitialized();
            });
            lazyDisposables.push(startDisp);
            context.subscriptions.push(startDisp);

            // Register lazy-init wrappers for all other manifest commands.
            // On first invocation: init the extension, then re-execute the command with args.
            for (const commandId of Object.keys(COMMAND_MANIFEST)) {
                if (commandId === 'sfClusterExplorer.startExtension') { continue; }
                const disp = vscode.commands.registerCommand(commandId, async (...args: any[]) => {
                    await ensureInitialized();
                    // Re-execute — performFullInit() re-registered the real handler
                    await vscode.commands.executeCommand(commandId, ...args);
                });
                lazyDisposables.push(disp);
                context.subscriptions.push(disp);
            }
        }

        SfUtility.outputLog('Service Fabric extension activated', null, debugLevel.info);
        console.log('[SF Extension] 10/10 - Extension activation complete');
    
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
        
        // Dispose project services
        if (applicationsProviderInstance) {
            applicationsProviderInstance.dispose();
            applicationsProviderInstance = undefined;
        }
        if (projectServiceInstance) {
            projectServiceInstance.dispose();
            projectServiceInstance = undefined;
        }
        if (deployServiceInstance) {
            deployServiceInstance.dispose();
            deployServiceInstance = undefined;
        }
        if (manifestValidatorInstance) {
            manifestValidatorInstance.dispose();
            manifestValidatorInstance = undefined;
        }
        
        // Clear prompts instance
        sfPromptsInstance = undefined;
        
        SfUtility.outputLog('Service Fabric extension deactivated', null, debugLevel.info);
    } catch (error) {
        SfUtility.outputLog('Error during extension deactivation', error, debugLevel.error);
    }
}
