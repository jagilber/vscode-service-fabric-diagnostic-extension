import * as vscode from 'vscode';
import { BaseTreeNode } from '../../BaseTreeNode';
import { ITreeNode } from '../../ITreeNode';
import { TreeNodeContext } from '../../TreeNodeContext';
import { IconService } from '../../IconService';
import { ClusterDecorationProvider } from '../../ClusterDecorationProvider';
import { DataCache } from '../../DataCache';
import { SfUtility, debugLevel } from '../../../sfUtility';
import { StaticItemNode } from './StaticItemNode';
import { NodesGroupNode } from './NodesGroupNode';
import { ApplicationsGroupNode } from './ApplicationsGroupNode';
import { SystemGroupNode } from './SystemGroupNode';
import { ImageStoreNode } from './ImageStoreNode';
import { MetricsNode } from './MetricsNode';
import { CommandsNode } from './CommandsNode';

/**
 * Root cluster node in the tree view.
 * Children are the top-level groups: nodes, applications, system, essentials, etc.
 */
export class ClusterNode extends BaseTreeNode {
    readonly id: string;
    readonly itemType = 'cluster';
    readonly clusterEndpoint: string;
    readonly ctx: TreeNodeContext;

    private isActive = false;
    private _refreshDisabled = false;

    get contextValue(): string {
        return this._refreshDisabled ? 'cluster-norefresh' : 'cluster';
    }

    constructor(ctx: TreeNodeContext, iconService: IconService, cache: DataCache) {
        super(ctx, iconService, cache);
        this.ctx = ctx;
        this.clusterEndpoint = ctx.clusterEndpoint;
        this.id = `cluster:${ctx.clusterEndpoint}`;
    }

    setActive(active: boolean): void {
        this.isActive = active;
    }

    setRefreshDisabled(disabled: boolean): void {
        this._refreshDisabled = disabled;
    }

    /**
     * Override: DON'T destroy and recreate group nodes on invalidation.
     * Instead, recursively invalidate children so they re-fetch fresh data
     * while preserving their local state (serviceCount, appCount, healthState).
     * This prevents "system (...)" / "applications (...)" flicker.
     *
     * IMPORTANT: _isLoaded stays true and children array is preserved so
     * getChildren() returns the same group node instances. Each group node's
     * own _isLoaded is set to false by its invalidate(), so VS Code's
     * getChildren(groupNode) call will trigger a fresh fetchChildren().
     */
    invalidate(): void {
        const childCount = this.children?.length ?? 0;
        if (this.children) {
            for (const child of this.children) {
                child.invalidate();
            }
        }
        SfUtility.outputLog(`[TREE] ClusterNode.invalidate(${this.clusterEndpoint}): invalidated ${childCount} children, _isLoaded stays true (children preserved)`, null, debugLevel.info);
    }

    getTreeItem(): vscode.TreeItem {
        const hostname = new URL(this.ctx.clusterEndpoint).hostname || this.ctx.clusterEndpoint;

        const item = new vscode.TreeItem(hostname, vscode.TreeItemCollapsibleState.Expanded);
        item.id = this.id;
        item.contextValue = this.contextValue;
        item.description = this.isActive ? 'Active' : undefined;
        // Use custom sf-cluster:// scheme so ClusterDecorationProvider can
        // tint the active cluster label yellow without affecting other tree items
        item.resourceUri = ClusterDecorationProvider.buildUri(this.ctx.clusterEndpoint);

        // Derive icon from cached cluster health
        const health = this.ctx.sfConfig.getClusterHealth();
        const hasHealth = !!health?.aggregatedHealthState;
        SfUtility.outputLog(
            `ClusterNode.getTreeItem: health=${hasHealth ? health.aggregatedHealthState : 'NONE'}, endpoint=${this.clusterEndpoint}`,
            null, debugLevel.info,
        );
        item.iconPath = hasHealth
            ? this.iconService.getHealthIcon(health.aggregatedHealthState, 'cloud')
            : this.iconService.getPlainIcon('cloud');
        if (!hasHealth) {
            SfUtility.outputLog(
                `⚠️ ClusterNode.getTreeItem: NO HEALTH DATA - using plain icon. Stack: ${new Error().stack?.split('\n').slice(1, 4).join(' | ')}`,
                null, debugLevel.warn,
            );
        }

        item.tooltip = this.buildTooltip(health);

        item.command = {
            command: 'sfClusterExplorer.showItemDetails',
            title: 'Show Details',
            arguments: [{ itemType: this.itemType, id: this.id, clusterEndpoint: this.clusterEndpoint }],
        };

        return item;
    }

    private buildTooltip(health: any): string {
        const lines: string[] = [
            `Cluster: ${this.clusterEndpoint}`,
            `Health: ${health?.aggregatedHealthState || 'Unknown'}`,
        ];
        if (this.isActive) { lines.push('Status: Active'); }
        const nodeStates: any[] | undefined = health?.nodeHealthStates;
        if (nodeStates) { lines.push(`Nodes: ${nodeStates.length}`); }
        const appStates: any[] | undefined = health?.applicationHealthStates;
        if (appStates) { lines.push(`Applications: ${appStates.length}`); }
        return lines.join('\n');
    }

    protected async fetchChildren(): Promise<ITreeNode[]> {
        const ctx = this.ctx;
        const icon = this.iconService;
        const cache = this.cache;

        return [
            // Static items (NEVER individually refreshed — see IconService / RefreshManager)
            new StaticItemNode(ctx, icon, 'essentials', 'essentials', 'info', 'charts.blue', 'essentials'),
            new StaticItemNode(ctx, icon, 'details', 'details', 'list-tree', 'charts.green'),
            new MetricsNode(ctx, icon, cache),
            new StaticItemNode(ctx, icon, 'cluster map', 'cluster-map', 'map', 'charts.blue'),
            new ImageStoreNode(ctx, icon, cache),
            new StaticItemNode(ctx, icon, 'health', 'health', 'heart', 'charts.green', 'health'),
            new StaticItemNode(ctx, icon, 'manifest', 'manifest', 'file-code', 'charts.orange', 'manifest'),
            new StaticItemNode(ctx, icon, 'events', 'events', 'calendar', 'charts.purple', 'events'),
            new CommandsNode(ctx, icon, cache),
            new StaticItemNode(ctx, icon, 'repair tasks', 'repair-tasks', 'tools', 'charts.orange', 'repair-tasks'),
            // Dynamic groups (lazy loaded, individually refreshable)
            new ApplicationsGroupNode(ctx, icon, cache),
            new NodesGroupNode(ctx, icon, cache),
            new SystemGroupNode(ctx, icon, cache),
        ];
    }
}
