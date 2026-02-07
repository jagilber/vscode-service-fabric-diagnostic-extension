import * as vscode from 'vscode';
import { BaseTreeNode } from '../BaseTreeNode';
import { ITreeNode } from '../ITreeNode';
import { TreeNodeContext, deriveContext } from '../TreeNodeContext';
import { IconService } from '../IconService';
import { DataCache } from '../DataCache';
import { NodeNode } from './NodeNode';
import * as sfModels from '../../sdk/servicefabric/servicefabric/src/models';

/**
 * "nodes (N)" group node. Lazy-loads the list of cluster nodes on expansion.
 */
export class NodesGroupNode extends BaseTreeNode {
    readonly id: string;
    readonly contextValue = undefined;
    readonly itemType = 'nodes-group';

    private nodeCount: number | undefined;
    private healthState: string | undefined;

    constructor(ctx: TreeNodeContext, iconService: IconService, cache: DataCache) {
        super(ctx, iconService, cache);
        this.id = `nodes-group:${ctx.clusterEndpoint}`;
    }

    getTreeItem(): vscode.TreeItem {
        const label = this.nodeCount !== undefined ? `nodes (${this.nodeCount})` : 'nodes (...)';
        const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.Collapsed);
        item.id = this.id;
        item.iconPath = this.iconService.getHealthIcon(this.healthState, 'server');
        item.resourceUri = this.ctx.resourceUri;
        return item;
    }

    protected async fetchChildren(): Promise<ITreeNode[]> {
        // Ensure REST client is configured (cert + endpoint) before making API calls
        await this.ctx.sfConfig.ensureRestClientReady();

        const cacheKey = `nodes:${this.ctx.clusterEndpoint}`;
        let nodes = this.cache.get<sfModels.NodeInfo[]>(cacheKey);

        if (!nodes) {
            nodes = await this.ctx.sfRest.getNodes();
            this.cache.set(cacheKey, nodes);
        }

        this.nodeCount = nodes.length;
        this.healthState = IconService.worstHealthState(nodes.map(n => n.healthState));

        // Sort: seed nodes first, then alphabetical
        const sorted = [...nodes].sort((a, b) => {
            if (a.isSeedNode && !b.isSeedNode) { return -1; }
            if (!a.isSeedNode && b.isSeedNode) { return 1; }
            return (a.name || '').localeCompare(b.name || '');
        });

        return sorted.map(node => new NodeNode(
            deriveContext(this.ctx, { parentNodeName: node.name }),
            this.iconService,
            this.cache,
            node,
        ));
    }
}
