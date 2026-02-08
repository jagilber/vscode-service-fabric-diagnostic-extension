'use strict';

import * as vscode from 'vscode';
import { SfMgr } from './sfMgr';
import { SfPrompts } from './sfPrompts';
import { SfUtility, debugLevel } from './sfUtility';
import { ManagementWebviewProvider } from './views/ManagementWebviewProvider';
import { CommandRegistry } from './commands/CommandRegistry';
import { SfProjectService } from './services/SfProjectService';
import { SfDeployService } from './services/SfDeployService';
import { SfApplicationsDataProvider } from './treeview/SfApplicationsDataProvider';

// Global references for cleanup
let sfMgrInstance: SfMgr | undefined;
let sfPromptsInstance: SfPrompts | undefined;
let projectServiceInstance: SfProjectService | undefined;
let deployServiceInstance: SfDeployService | undefined;
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
        sfMgr = new SfMgr(context);
        
        // Auto-reconnect to previously connected clusters (fire-and-forget)
        sfMgr.autoReconnectClusters().catch(err => {
            SfUtility.outputLog('Auto-reconnect failed', err, debugLevel.warn);
        });
        
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
    const applicationsProvider = new SfApplicationsDataProvider(projectService, context);
    
    projectServiceInstance = projectService;
    deployServiceInstance = deployService;
    applicationsProviderInstance = applicationsProvider;
    
    context.subscriptions.push(projectService);
    context.subscriptions.push(deployService);
    context.subscriptions.push(applicationsProvider);
    
    console.log('[SF Extension] 8/10 - Registering commands...');

    // Register ALL commands via centralized CommandRegistry
    CommandRegistry.registerAll(context, sfMgr, sfPrompts, projectService, deployService, applicationsProvider);

    console.log('[SF Extension] 9/10 - All commands registered successfully');

    // Post-registration validation — logs warnings for any manifest/registration mismatches
    CommandRegistry.validateRegistrations();
    
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
        
        // Clear prompts instance
        sfPromptsInstance = undefined;
        
        SfUtility.outputLog('Service Fabric extension deactivated', null, debugLevel.info);
    } catch (error) {
        SfUtility.outputLog('Error during extension deactivation', error, debugLevel.error);
    }
}
