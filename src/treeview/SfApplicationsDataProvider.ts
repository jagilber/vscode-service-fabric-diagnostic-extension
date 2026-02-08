/**
 * SfApplicationsDataProvider — TreeDataProvider for the "Service Fabric Applications" view.
 * 
 * Shows .sfproj projects discovered in the workspace, with their services,
 * parameters, and publish profiles as child nodes.
 * 
 * Unlike SfTreeDataProvider (which uses ITreeNode/BaseTreeNode for cluster data),
 * this provider uses standard vscode.TreeItem subclasses since the data is local
 * (no REST calls, no lazy loading, no caching needed).
 */

import * as vscode from 'vscode';
import { SfProjectService } from '../services/SfProjectService';
import { SfProjectNode, ServicesGroupNode, ParametersGroupNode, ProfilesGroupNode } from './nodes/SfProjectNode';
import { ServiceRefNode } from './nodes/ServiceRefNode';
import { SfUtility, debugLevel } from '../sfUtility';

// Union type for all node types in this tree
type SfAppTreeItem = SfProjectNode | ServicesGroupNode | ParametersGroupNode | ProfilesGroupNode | ServiceRefNode | vscode.TreeItem;

export class SfApplicationsDataProvider implements vscode.TreeDataProvider<SfAppTreeItem>, vscode.Disposable {
    private readonly _onDidChangeTreeData = new vscode.EventEmitter<SfAppTreeItem | undefined | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private readonly view: vscode.TreeView<SfAppTreeItem>;
    private readonly projectChangeListener: vscode.Disposable;

    constructor(
        private readonly projectService: SfProjectService,
        extensionContext: vscode.ExtensionContext,
    ) {
        this.view = vscode.window.createTreeView('serviceFabricApplicationsView', {
            treeDataProvider: this,
            showCollapseAll: true,
        });

        // Auto-refresh when projects change (file watcher triggers)
        this.projectChangeListener = this.projectService.onDidChangeProjects(() => {
            SfUtility.outputLog('SfApplicationsDataProvider: projects changed — refreshing tree', null, debugLevel.info);
            this._onDidChangeTreeData.fire();
        });

        extensionContext.subscriptions.push(this.view);
    }

    // ── TreeDataProvider interface ──────────────────────────────────────

    getTreeItem(element: SfAppTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: SfAppTreeItem): Promise<SfAppTreeItem[]> {
        if (!element) {
            // Root: return all discovered projects
            return this.getRootChildren();
        }

        // Delegate to the node's getChildren if available
        if ('getChildren' in element && typeof element.getChildren === 'function') {
            return (element as any).getChildren();
        }

        return [];
    }

    private async getRootChildren(): Promise<SfAppTreeItem[]> {
        try {
            const projects = await this.projectService.discoverProjects();

            if (projects.length === 0) {
                // Return a single "no projects" item
                const noProjects = new vscode.TreeItem(
                    'No .sfproj projects found in workspace',
                    vscode.TreeItemCollapsibleState.None,
                );
                noProjects.iconPath = new vscode.ThemeIcon('info');
                noProjects.tooltip = 'Open a workspace folder containing Service Fabric application projects (.sfproj)';
                return [noProjects];
            }

            return projects.map(p => new SfProjectNode(p));
        } catch (err) {
            SfUtility.outputLog('SfApplicationsDataProvider: failed to discover projects', err, debugLevel.error);
            const errorItem = new vscode.TreeItem(
                `Error: ${err instanceof Error ? err.message : String(err)}`,
                vscode.TreeItemCollapsibleState.None,
            );
            errorItem.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('testing.iconFailed'));
            return [errorItem];
        }
    }

    // ── Public API ──────────────────────────────────────────────────────

    /** Force a full refresh of the tree */
    refresh(): void {
        this.projectService.invalidateCache();
        this._onDidChangeTreeData.fire();
    }

    dispose(): void {
        this.projectChangeListener.dispose();
        this._onDidChangeTreeData.dispose();
        this.view.dispose();
    }
}
