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
        return item;
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
