/**
 * View and UI command handlers.
 *
 * Consolidates all view-related commands that were previously scattered across:
 * - extension.ts  (refreshView, showManagementView, deployApp, showItemDetails)
 * - serviceFabricClusterView.ts constructor (reveal, changeTitle)
 * - SfTreeDataProvider.ts constructor (retryNode)
 *
 * The heavy-lifting detail view logic has been extracted to
 * `../services/DetailViewService` — this file is now a thin dispatcher.
 *
 * Every command goes through `registerCommandWithErrorHandling` or
 * `safeRegisterCommand` for consistent error handling and double-registration
 * protection.
 */

import * as vscode from 'vscode';
import { SfMgr } from '../sfMgr';
import { SfUtility, debugLevel } from '../sfUtility';
import { registerCommandWithErrorHandling, safeRegisterCommand } from '../utils/CommandUtils';
import { DetailViewService } from '../services/DetailViewService';

export function registerViewCommands(
    context: vscode.ExtensionContext,
    sfMgr: SfMgr,
): void {

    // -----------------------------------------------------------------------
    // sfClusterExplorer.refresh  — activation-event command
    // Previously: declared in package.json but NEVER registered (bug!)
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.refresh',
        async () => {
            sfMgr.sfClusterView.refresh();
        },
        'refresh',
    );

    // -----------------------------------------------------------------------
    // serviceFabricClusterView.refreshView  — backward compat alias
    // Previously: registerSimpleCommand in extension.ts
    // -----------------------------------------------------------------------
    safeRegisterCommand(context, 'serviceFabricClusterView.refreshView', () => {
        sfMgr.sfClusterView.refresh();
    });

    // -----------------------------------------------------------------------
    // serviceFabricClusterView.reveal  — tree item reveal
    // Previously: raw registerCommand in legacy view constructor (no context.subscriptions)
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'serviceFabricClusterView.reveal',
        async () => {
            const key = await vscode.window.showInputBox({
                placeHolder: 'Type the label of the item to reveal',
            });
            if (key) {
                SfUtility.outputLog(`Reveal requested for: ${key}`, null, debugLevel.info);
            }
        },
        'reveal item',
    );

    // -----------------------------------------------------------------------
    // serviceFabricClusterView.changeTitle  — debug/test command
    // Previously: raw registerCommand in legacy view constructor (no context.subscriptions)
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'serviceFabricClusterView.changeTitle',
        async () => {
            const title = await vscode.window.showInputBox({
                prompt: 'Type the new title for the tree view',
                placeHolder: 'Service Fabric Clusters',
            });
            if (title) {
                SfUtility.outputLog(`Title change requested: ${title}`, null, debugLevel.info);
            }
        },
        'change title',
    );

    // -----------------------------------------------------------------------
    // sfClusterExplorer.retryNode  — retry failed tree node
    // Previously: raw registerCommand in SfTreeDataProvider constructor
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.retryNode',
        async (node: any) => {
            if (node && typeof node.invalidate === 'function') {
                node.invalidate();
                sfMgr.sfClusterView.refresh();
            }
        },
        'retry node',
    );

    // -----------------------------------------------------------------------
    // sfClusterExplorer.showManagementView
    // Previously: registerSimpleCommand in extension.ts
    // -----------------------------------------------------------------------
    safeRegisterCommand(context, 'sfClusterExplorer.showManagementView', () => {
        vscode.commands.executeCommand('serviceFabricManagementPanel.focus');
    });

    // -----------------------------------------------------------------------
    // sfClusterExplorer.deployApplicationFromContext
    // Previously: registerSimpleCommand in extension.ts
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.deployApplicationFromContext',
        async () => {
            await vscode.commands.executeCommand('serviceFabricManagementPanel.focus');
            SfUtility.showInformation('Use the Management panel to deploy applications');
        },
        'deploy application',
    );

    // -----------------------------------------------------------------------
    // sfClusterExplorer.showItemDetails  — tree-item click handler
    // Delegates to DetailViewService (extracted from ~500-line switch)
    // -----------------------------------------------------------------------
    const detailViewService = new DetailViewService(context);
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.showItemDetails',
        async (item: any) => {
            await detailViewService.show(sfMgr, item);
        },
        'show item details',
    );
}
