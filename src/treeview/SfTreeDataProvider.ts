import * as vscode from 'vscode';
import { ITreeNode } from './ITreeNode';
import { IconService } from './IconService';
import { DataCache } from './DataCache';
import { RefreshManager } from './RefreshManager';
import { TreeNodeContext } from './TreeNodeContext';
import { ClusterNode } from './nodes/cluster/ClusterNode';
import { SfRest } from '../sfRest';
import { SfConfiguration } from '../sfConfiguration';
import { SfUtility, debugLevel } from '../sfUtility';
import { ClusterDecorationProvider } from './ClusterDecorationProvider';

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
    private readonly decorationProvider: ClusterDecorationProvider;

    constructor(private readonly extensionContext: vscode.ExtensionContext) {
        this.refreshManager = new RefreshManager(this._onDidChangeTreeData);
        this.decorationProvider = new ClusterDecorationProvider();

        // Register decoration provider so active cluster label is tinted yellow
        extensionContext.subscriptions.push(
            vscode.window.registerFileDecorationProvider(this.decorationProvider)
        );

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
        SfUtility.outputLog(`[TREE] SfTreeDataProvider.getTreeItem(${element.itemType}:${element.id})`, null, debugLevel.debug);
        return element.getTreeItem();
    }

    getChildren(element?: ITreeNode): Promise<ITreeNode[] | undefined> {
        if (!element) {
            SfUtility.outputLog(`[TREE] SfTreeDataProvider.getChildren(ROOT): returning ${this.roots.length} cluster roots`, null, debugLevel.info);
            return Promise.resolve(this.roots);
        }
        SfUtility.outputLog(`[TREE] SfTreeDataProvider.getChildren(${element.itemType}:${element.id}): isLoaded=${element.isLoaded}`, null, debugLevel.debug);
        return element.getChildren();
    }

    // ── Public API (called from extension.ts) ──────────────────────────

    /**
     * Add a cluster to the tree view.
     * Does NOT fire refresh — health data isn't available yet.
     * populateClusterInBackground() will fire the first refresh after health is fetched.
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
        const disabledClusters = this.extensionContext.globalState.get<string[]>('sfClusterExplorer.refreshDisabledClusters', []);
        clusterNode.setRefreshDisabled(disabledClusters.includes(endpoint));
        this.roots.push(clusterNode);

        this.updateViewVisibility();
        // NOTE: Do NOT call this.refresh() here.
        // The cluster has no health data yet, so getTreeItem() would render a plain icon.
        // Instead, let populateClusterInBackground() call refresh() AFTER health is fetched.

        // Start auto-refresh if we have clusters
        // Use health-only refresh to avoid destroying/recreating children every cycle
        // (which causes ThemeColor loss on group nodes that start with healthState=undefined)
        this.refreshManager.startAutoRefresh(async () => this.invalidateAll());

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
        // Fire decoration change so the active cluster label turns yellow
        this.decorationProvider.setActive(endpoint);
        // NOTE: Do NOT call this.refresh() here.
        // This is typically called during cluster connection setup,
        // and populateClusterInBackground() will fire refresh after health data arrives.
        // Firing here would re-render ALL clusters, including ones without health yet.
    }

    /**
     * Update auto-refresh disabled state on a cluster node and re-render it.
     */
    setClusterRefreshDisabled(endpoint: string, disabled: boolean): void {
        const root = this.roots.find(r => r.clusterEndpoint === endpoint);
        if (root) {
            root.setRefreshDisabled(disabled);
            this.refresh(root);
        }
    }

    /**
     * Check if a cluster endpoint is in the tree.
     */
    hasCluster(endpoint: string): boolean {
        return this.roots.some(r => r.clusterEndpoint === endpoint);
    }

    /**
     * Refresh the tree view (debounced re-render only, no data invalidation).
     * Used internally after data has already been updated.
     */
    refresh(node?: ITreeNode): void {
        this.refreshManager.refresh(node);
    }

    /**
     * Full refresh: invalidate all cached data, fetch fresh from cluster, re-render.
     * Used by manual "Refresh" command and after deploy/remove operations.
     */
    async fullRefresh(): Promise<void> {
        SfUtility.outputLog('[TREE] fullRefresh: START (invalidateAll + refresh)', null, debugLevel.info);
        await this.invalidateAll();
        this.refresh();
        SfUtility.outputLog('[TREE] fullRefresh: END (emitter.fire queued)', null, debugLevel.info);
    }

    /**
     * Lightweight health-only refresh (used by auto-refresh timer).
     * 
     * ONLY fetches fresh cluster health data — does NOT invalidate or recreate
     * child nodes. This prevents the VS Code ThemeColor bug where newly created
     * child nodes (with healthState=undefined) render gray icons before their
     * async fetchChildren() completes.
     * 
     * Children retain their existing healthState from the last fetchChildren() call.
     * Structural changes (new apps, removed nodes) appear on manual refresh.
     */
    async refreshHealthOnly(): Promise<void> {
        SfUtility.outputLog('refreshHealthOnly: fetching health data (no tree invalidation)', null, debugLevel.info);
        const disabledClusters = new Set(
            this.extensionContext.globalState.get<string[]>('sfClusterExplorer.refreshDisabledClusters', [])
        );
        const healthResults = await Promise.allSettled(
            this.roots.map(async root => {
                if (disabledClusters.has(root.clusterEndpoint)) {
                    SfUtility.outputLog(
                        `Health refresh: skipping ${root.clusterEndpoint} (refresh disabled)`,
                        null, debugLevel.info,
                    );
                    return;
                }
                await root.ctx.sfConfig.populateClusterHealth();
                SfUtility.outputLog(
                    `Health refresh: cluster health updated for ${root.clusterEndpoint}`,
                    null, debugLevel.debug,
                );
            })
        );

        for (let i = 0; i < healthResults.length; i++) {
            if (healthResults[i].status === 'rejected') {
                SfUtility.outputLog(
                    `Health refresh: cluster health fetch failed for ${this.roots[i]?.clusterEndpoint}`,
                    (healthResults[i] as PromiseRejectedResult).reason, debugLevel.debug,
                );
            }
        }
        // NOTE: No cache.clear(), no root.invalidate().
        // getTreeItem() on ClusterNode reads live health from sfConfig.
        // Children stay loaded — no gray-icon flash from recreating nodes.
    }

    /**
     * Full structural refresh — invalidates all cached data and forces tree rebuild.
     * Used by manual refresh commands, NOT by the auto-refresh timer.
     * 
     * This WILL cause a brief moment where child nodes have no health data
     * (gray icons) while their async fetchChildren() runs. That's acceptable
     * for an explicit user action but NOT for a background timer.
     */
    async invalidateAll(): Promise<void> {
        SfUtility.outputLog('invalidateAll: FULL tree rebuild (cache clear + invalidate)', null, debugLevel.info);
        // Step 1: Fetch fresh cluster health BEFORE clearing cache.
        // Skip clusters with per-cluster refresh disabled.
        const disabledClusters = new Set(
            this.extensionContext.globalState.get<string[]>('sfClusterExplorer.refreshDisabledClusters', [])
        );
        const healthResults = await Promise.allSettled(
            this.roots.map(async root => {
                if (disabledClusters.has(root.clusterEndpoint)) {
                    SfUtility.outputLog(
                        `Full refresh: skipping ${root.clusterEndpoint} (refresh disabled)`,
                        null, debugLevel.info,
                    );
                    return;
                }
                await root.ctx.sfConfig.populateClusterHealth();
                SfUtility.outputLog(
                    `Full refresh: cluster health updated for ${root.clusterEndpoint}`,
                    null, debugLevel.debug,
                );
            })
        );

        for (let i = 0; i < healthResults.length; i++) {
            if (healthResults[i].status === 'rejected') {
                SfUtility.outputLog(
                    `Full refresh: cluster health fetch failed for ${this.roots[i]?.clusterEndpoint}`,
                    (healthResults[i] as PromiseRejectedResult).reason, debugLevel.debug,
                );
            }
        }

        // Step 2: Clear cache and invalidate so getChildren() re-fetches with fresh data.
        SfUtility.outputLog(`[TREE] invalidateAll: clearing cache (${this.cache.size} entries) and invalidating ${this.roots.length} roots`, null, debugLevel.info);
        this.cache.clear();
        for (const root of this.roots) {
            root.invalidate();
        }
        SfUtility.outputLog('[TREE] invalidateAll: END — all caches cleared, all nodes invalidated', null, debugLevel.info);
    }

    /**
     * Restart auto-refresh (e.g. when settings change).
     */
    restartAutoRefresh(): void {
        this.refreshManager.restartAutoRefresh(async () => this.invalidateAll());
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
        this.decorationProvider.dispose();
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
