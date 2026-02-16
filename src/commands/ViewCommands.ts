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
import { TemplateService } from '../services/TemplateService';
import { TemplateDeployService } from '../services/TemplateDeployService';
import { TemplateSummaryService } from '../services/TemplateSummaryService';
import { TemplateFolderNode } from '../treeview/nodes/templates/TemplateNodes';

import { SfTemplatesDataProvider } from '../treeview/SfTemplatesDataProvider';

export function registerViewCommands(
    context: vscode.ExtensionContext,
    sfMgr: SfMgr,
    templatesProvider?: SfTemplatesDataProvider,
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

    // -----------------------------------------------------------------------
    // sfClusterExplorer.viewJson  — always show item data as JSON
    // Bypasses default format overrides (manifest→XML, health→markdown, etc.)
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.viewJson',
        async (item: any) => {
            await detailViewService.showAsJson(sfMgr, item);
        },
        'view JSON',
    );

    // -----------------------------------------------------------------------
    // sfClusterExplorer.openTemplateFile  — fetch & open a template file
    // Downloads file content from GitHub and opens in an untitled editor.
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.openTemplateFile',
        async (args: { repoName: string; repoUrl: string; repoBranch?: string; filePath: string; fileName: string }) => {
            if (!args?.repoUrl || !args?.filePath) {
                SfUtility.showInformation('No template file specified');
                return;
            }

            const service = TemplateService.getInstance();
            const repo = { name: args.repoName, url: args.repoUrl, branch: args.repoBranch };

            await vscode.window.withProgress(
                { location: vscode.ProgressLocation.Notification, title: `Loading ${args.fileName}...` },
                async () => {
                    const content = await service.getFileContent(repo, args.filePath);
                    const lang = TemplateService.getLanguageId(args.fileName);
                    const doc = await vscode.workspace.openTextDocument({ content, language: lang });
                    await vscode.window.showTextDocument(doc, { preview: true });
                },
            );
        },
        'open template file',
    );

    // -----------------------------------------------------------------------
    // sfClusterExplorer.openTemplateInBrowser  — open GitHub URL
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.openTemplateInBrowser',
        async (item: any) => {
            if (!item) { return; }
            // Build GitHub URL from the tree item data
            const repoUrl = item.repoUrl || item.url;
            const branch = item.repoBranch || item.branch || 'master';
            const path = item.filePath || item.path || '';
            if (repoUrl) {
                const url = path
                    ? `${repoUrl}/tree/${branch}/${path}`
                    : `${repoUrl}/tree/${branch}`;
                await vscode.env.openExternal(vscode.Uri.parse(url));
            }
        },
        'open template in browser',
    );

    // -----------------------------------------------------------------------
    // sfClusterExplorer.refreshTemplates  — clear cache & refresh templates tree
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.refreshTemplates',
        async () => {
            // The SfTemplatesDataProvider.refresh() clears cache internally
            if (templatesProvider) {
                templatesProvider.refresh();
            } else {
                TemplateService.getInstance().clearCache();
            }
            SfUtility.showInformation('Template cache cleared');
        },
        'refresh templates',
    );

    // -----------------------------------------------------------------------
    // sfClusterExplorer.deployCluster  — deploy ARM template from a folder node
    // Downloads template + parameter files, opens for review, deploys via PS
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.deployCluster',
        async (item: TemplateFolderNode) => {
            if (!item || !item.repo || !item.entry) {
                SfUtility.showInformation('Select a template folder to deploy');
                return;
            }
            const deployService = TemplateDeployService.getInstance();
            await deployService.deployFromFolder(item.repo, item.entry);
        },
        'deploy cluster from template',
    );

    // -----------------------------------------------------------------------
    // sfClusterExplorer.deployFromAzure  — open Azure portal deploy blade
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.deployFromAzure',
        async (item: TemplateFolderNode) => {
            if (!item || !item.repo || !item.entry) {
                SfUtility.showInformation('Select a template folder to deploy');
                return;
            }
            const deployService = TemplateDeployService.getInstance();
            await deployService.deployFromAzurePortal(item.repo, item.entry);
        },
        'deploy from Azure portal',
    );

    // -----------------------------------------------------------------------
    // sfClusterExplorer.viewTemplateSummary  — generate markdown summary + diagram
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.viewTemplateSummary',
        async (item: TemplateFolderNode) => {
            if (!item || !item.repo || !item.entry) {
                SfUtility.showInformation('Select a template folder to view summary');
                return;
            }
            const summaryService = TemplateSummaryService.getInstance();
            await summaryService.showSummary(item.repo, item.entry);
        },
        'view template summary',
    );
}
