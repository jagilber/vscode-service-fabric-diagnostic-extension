import * as vscode from 'vscode';
import { ITreeNode } from './ITreeNode';
import { IconService } from './IconService';
import { DataCache } from './DataCache';
import { RefreshManager } from './RefreshManager';
import { TreeNodeContext } from './TreeNodeContext';
import { ClusterNode } from './nodes/ClusterNode';
import { SfRest } from '../sfRest';
import { SfConfiguration } from '../sfConfiguration';
import { SfUtility, debugLevel } from '../sfUtility';

/**
 * Enterprise-grade, lazy-loading TreeDataProvider for Service Fabric clusters.
 * 
 * This is a thin coordinator — all data fetching, icon resolution,
 * and child generation are delegated to individual node classes.
 * 
 * Design principles:
 * - Each node type is a class implementing ITreeNode
 * - Lazy by default — children fetched only on expand
 * - DataCache with TTL prevents redundant REST calls
 * - RefreshManager enforces debouncing + VS Code icon bug safety
 * - Parent context flows via typed TreeNodeContext (no pipe-delimited strings)
 */
export class SfTreeDataProvider implements vscode.TreeDataProvider<ITreeNode> {
    private readonly _onDidChangeTreeData = new vscode.EventEmitter<ITreeNode | undefined | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private readonly view: vscode.TreeView<ITreeNode>;
    private readonly roots: ClusterNode[] = [];
    private readonly iconService = new IconService();
    private readonly cache = new DataCache();
    private readonly refreshManager: RefreshManager;

    constructor(private readonly extensionContext: vscode.ExtensionContext) {
        this.refreshManager = new RefreshManager(this._onDidChangeTreeData);

        this.view = vscode.window.createTreeView('serviceFabricClusterView', {
            treeDataProvider: this,
            showCollapseAll: true,
        });

        // NOTE: 'sfClusterExplorer.retryNode' is now registered centrally in ViewCommands.ts
        // via the CommandRegistry. No need to register here.

        this.updateViewVisibility();
    }

    // ── TreeDataProvider interface ──────────────────────────────────────

    getTreeItem(element: ITreeNode): vscode.TreeItem {
        return element.getTreeItem();
    }

    getChildren(element?: ITreeNode): Promise<ITreeNode[] | undefined> {
        if (!element) {
            return Promise.resolve(this.roots);
        }
        return element.getChildren();
    }

    // ── Public API (called from extension.ts) ──────────────────────────

    /**
     * Add a cluster to the tree view.
     */
    addCluster(sfConfig: SfConfiguration, sfRest: SfRest): void {
        const endpoint = sfConfig.getClusterEndpoint();

        // Prevent duplicates
        if (this.roots.some(r => r.clusterEndpoint === endpoint)) {
            SfUtility.outputLog(`SfTreeDataProvider: cluster already exists: ${endpoint}`, null, debugLevel.warn);
            vscode.window.showWarningMessage(`Cluster '${endpoint}' is already in the tree view.`);
            return;
        }

        const ctx: TreeNodeContext = {
            extensionContext: this.extensionContext,
            sfRest,
            sfConfig,
            clusterEndpoint: endpoint,
            resourceUri: vscode.Uri.parse(endpoint),
            requestRefresh: (node) => this.refresh(node),
        };

        const clusterNode = new ClusterNode(ctx, this.iconService, this.cache);
        this.roots.push(clusterNode);

        this.updateViewVisibility();
        this.refresh();

        // Start auto-refresh if we have clusters
        this.refreshManager.startAutoRefresh(() => this.invalidateAll());

        SfUtility.outputLog(`SfTreeDataProvider: cluster added: ${endpoint}`, null, debugLevel.info);
    }

    /**
     * Remove a cluster from the tree view.
     */
    removeCluster(endpoint: string): void {
        const idx = this.roots.findIndex(r => r.clusterEndpoint === endpoint);
        if (idx === -1) {
            SfUtility.outputLog(`SfTreeDataProvider: cluster not found: ${endpoint}`, null, debugLevel.warn);
            return;
        }

        this.roots[idx].dispose();
        this.roots.splice(idx, 1);
        this.cache.invalidateByPrefix(endpoint);

        this.updateViewVisibility();
        this.refresh();

        if (this.roots.length === 0) {
            this.refreshManager.stopAutoRefresh();
        }

        SfUtility.outputLog(`SfTreeDataProvider: cluster removed: ${endpoint}`, null, debugLevel.info);
    }

    /**
     * Set active cluster indicator.
     */
    setActiveCluster(endpoint: string): void {
        for (const root of this.roots) {
            root.setActive(root.clusterEndpoint === endpoint);
        }
        this.refresh();
    }

    /**
     * Check if a cluster endpoint is in the tree.
     */
    hasCluster(endpoint: string): boolean {
        return this.roots.some(r => r.clusterEndpoint === endpoint);
    }

    /**
     * Refresh the tree view (debounced).
     */
    refresh(node?: ITreeNode): void {
        this.refreshManager.refresh(node);
    }

    /**
     * Invalidate all cluster data (called by auto-refresh).
     */
    invalidateAll(): void {
        this.cache.clear();
        for (const root of this.roots) {
            root.invalidate();
        }
    }

    /**
     * Restart auto-refresh (e.g. when settings change).
     */
    restartAutoRefresh(): void {
        this.refreshManager.restartAutoRefresh(() => this.invalidateAll());
    }

    /**
     * Get the SfRest instance for a cluster endpoint.
     */
    getSfRest(endpoint: string): SfRest | undefined {
        const root = this.roots.find(r => r.clusterEndpoint === endpoint);
        return root?.ctx.sfRest;
    }

    /**
     * Get the SfConfiguration for a cluster endpoint.
     */
    getSfConfig(endpoint: string): SfConfiguration | undefined {
        const root = this.roots.find(r => r.clusterEndpoint === endpoint);
        return root?.ctx.sfConfig;
    }

    /**
     * Eagerly populate group node data in the background after cluster connection.
     * This mimics the legacy view's `populateRootGroupsInBackground()`:
     * fetches nodes/apps/system data so labels update from "(…)" to "(N)".
     */
    async populateClusterInBackground(endpoint: string): Promise<void> {
        const root = this.roots.find(r => r.clusterEndpoint === endpoint);
        if (!root) {
            SfUtility.outputLog(`populateClusterInBackground: cluster not found: ${endpoint}`, null, debugLevel.warn);
            return;
        }

        SfUtility.outputLog(`populateClusterInBackground: starting for ${endpoint}`, null, debugLevel.info);

        try {
            // Fetch cluster health first so the root icon gets its color
            await root.ctx.sfConfig.populateClusterHealth();

            // Refresh immediately so root icon updates with health color
            this.refresh();

            // Ensure cluster node's children are loaded (creates group nodes)
            const children = await root.getChildren();
            if (!children) { return; }

            // Find group nodes that support lazy loading
            const GROUP_TYPES = new Set(['nodes-group', 'applications-group', 'system-group']);
            const groupNodes = children.filter(c => GROUP_TYPES.has(c.itemType));

            // Pre-fetch all group node data in parallel
            const results = await Promise.allSettled(
                groupNodes.map(async (node) => {
                    try {
                        await node.getChildren();
                        SfUtility.outputLog(`populateClusterInBackground: ${node.itemType} loaded`, null, debugLevel.debug);
                    } catch (err) {
                        SfUtility.outputLog(`populateClusterInBackground: ${node.itemType} failed`, err, debugLevel.warn);
                    }
                })
            );

            const succeeded = results.filter(r => r.status === 'fulfilled').length;
            SfUtility.outputLog(
                `populateClusterInBackground: completed for ${endpoint} (${succeeded}/${groupNodes.length} groups loaded)`,
                null, debugLevel.info,
            );

            // Fire full refresh to update all labels + health icons
            this.refresh();
        } catch (err) {
            SfUtility.outputLog(`populateClusterInBackground: error for ${endpoint}`, err, debugLevel.error);
        }
    }

    dispose(): void {
        this.refreshManager.dispose();
        for (const root of this.roots) {
            root.dispose();
        }
        this.view.dispose();
    }

    // ── Private ────────────────────────────────────────────────────────

    private updateViewVisibility(): void {
        vscode.commands.executeCommand('setContext', 'serviceFabricClustersExist', this.roots.length > 0);
    }
}
