import * as vscode from 'vscode';
import { BaseTreeNode } from '../BaseTreeNode';
import { ITreeNode } from '../ITreeNode';
import { TreeNodeContext, deriveContext } from '../TreeNodeContext';
import { IconService } from '../IconService';
import { DataCache } from '../DataCache';
import { ReplicaNode } from './ReplicaNode';

/**
 * "replicas (N)" group node under a partition.
 * Lazy-loads replicas for the parent partition.
 */
export class ReplicasGroupNode extends BaseTreeNode {
    readonly id: string;
    readonly contextValue = undefined;
    readonly itemType = 'replicas-group';

    private replicaCount: number | undefined;
    private healthState: string | undefined;

    constructor(
        ctx: TreeNodeContext,
        iconService: IconService,
        cache: DataCache,
        private readonly partitionId: string,
        private readonly serviceId: string,
        private readonly applicationId: string,
    ) {
        super(ctx, iconService, cache);
        this.id = `replicas-group:${ctx.clusterEndpoint}:${applicationId}:${serviceId}:${partitionId}`;
    }

    getTreeItem(): vscode.TreeItem {
        const label = this.replicaCount !== undefined
            ? `replicas (${this.replicaCount})`
            : 'replicas (...)';
        const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.Collapsed);
        item.id = this.id;
        item.iconPath = this.iconService.getHealthIcon(this.healthState, 'copy');
        item.resourceUri = this.ctx.resourceUri;

        // Prefetch replica data in background so count/health populate
        // without waiting for the user to expand this node
        if (this.replicaCount === undefined && !this.isLoaded) {
            this.getChildren();
        }

        return item;
    }

    /**
     * Preserve replicaCount and healthState across invalidation so
     * getTreeItem() shows the last known values instead of "..." / grey.
     */
    invalidate(): void {
        super.invalidate();
        // replicaCount and healthState are NOT cleared — they survive refresh
    }

    protected async fetchChildren(): Promise<ITreeNode[]> {
        const cacheKey = `replicas:${this.ctx.clusterEndpoint}:${this.applicationId}:${this.serviceId}:${this.partitionId}`;
        let replicas = this.cache.get<any[]>(cacheKey);

        if (!replicas) {
            replicas = await this.ctx.sfRest.getPartitionReplicas(this.serviceId, this.applicationId, this.partitionId);
            this.cache.set(cacheKey, replicas);
        }

        this.replicaCount = replicas.length;
        this.healthState = IconService.worstHealthState(replicas.map(r => r.healthState));

        // Schedule a label/icon refresh after VS Code finishes processing getChildren()
        if (this.ctx.requestRefresh) {
            setTimeout(() => this.ctx.requestRefresh!(this), 0);
        }

        return replicas.map(replica => new ReplicaNode(
            deriveContext(this.ctx, {
                parentApplicationId: this.applicationId,
                parentServiceId: this.serviceId,
                parentPartitionId: this.partitionId,
            }),
            this.iconService,
            this.cache,
            replica,
            this.partitionId,
            this.serviceId,
            this.applicationId,
        ));
    }
}
