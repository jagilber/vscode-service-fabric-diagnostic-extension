import * as vscode from 'vscode';
import { BaseTreeNode } from '../BaseTreeNode';
import { ITreeNode } from '../ITreeNode';
import { TreeNodeContext } from '../TreeNodeContext';
import { IconService } from '../IconService';
import { DataCache } from '../DataCache';
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
    readonly contextValue = 'cluster';
    readonly itemType = 'cluster';
    readonly clusterEndpoint: string;
    readonly ctx: TreeNodeContext;

    private description: string | undefined;

    constructor(ctx: TreeNodeContext, iconService: IconService, cache: DataCache) {
        super(ctx, iconService, cache);
        this.ctx = ctx;
        this.clusterEndpoint = ctx.clusterEndpoint;
        this.id = `cluster:${ctx.clusterEndpoint}`;
    }

    setActive(active: boolean): void {
        this.description = active ? '⭐ Active' : undefined;
    }

    getTreeItem(): vscode.TreeItem {
        const hostname = new URL(this.ctx.clusterEndpoint).hostname || this.ctx.clusterEndpoint;
        const item = new vscode.TreeItem(hostname, vscode.TreeItemCollapsibleState.Expanded);
        item.id = this.id;
        item.contextValue = this.contextValue;
        item.description = this.description;
        item.resourceUri = this.ctx.resourceUri;

        // Derive icon from cached cluster health
        const health = this.ctx.sfConfig.getClusterHealth();
        item.iconPath = health?.aggregatedHealthState
            ? this.iconService.getHealthIcon(health.aggregatedHealthState, 'cloud')
            : this.iconService.getPlainIcon('cloud');

        item.command = {
            command: 'sfClusterExplorer.showItemDetails',
            title: 'Show Details',
            arguments: [{ itemType: this.itemType, id: this.id, clusterEndpoint: this.clusterEndpoint }],
        };

        return item;
    }

    protected async fetchChildren(): Promise<ITreeNode[]> {
        const ctx = this.ctx;
        const icon = this.iconService;
        const cache = this.cache;

        return [
            // Static items (NEVER individually refreshed — see IconService / RefreshManager)
            new StaticItemNode(ctx, icon, 'essentials', 'essentials', 'info', 'charts.blue', 'essentials'),
            new StaticItemNode(ctx, icon, 'details', 'details', 'list-tree', 'charts.green'),
            new StaticItemNode(ctx, icon, 'metrics', 'metrics', 'graph', 'charts.red', 'metrics'),
            new StaticItemNode(ctx, icon, 'cluster map', 'cluster-map', 'map', 'charts.blue'),
            new ImageStoreNode(ctx, icon, cache),
            new StaticItemNode(ctx, icon, 'health', 'health', 'heart', 'charts.green', 'health'),
            new StaticItemNode(ctx, icon, 'manifest', 'manifest', 'file-code', 'charts.orange'),
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
