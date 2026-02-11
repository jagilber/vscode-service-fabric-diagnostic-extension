import * as vscode from 'vscode';
import { BaseTreeNode } from '../../BaseTreeNode';
import { ITreeNode } from '../../ITreeNode';
import { TreeNodeContext, deriveContext } from '../../TreeNodeContext';
import { IconService } from '../../IconService';
import { DataCache } from '../../DataCache';
import { PartitionNode } from './PartitionNode';

/**
 * "partitions (N)" group node under a service.
 * Lazy-loads partitions for the parent service.
 */
export class PartitionsGroupNode extends BaseTreeNode {
    readonly id: string;
    readonly contextValue = undefined;
    readonly itemType = 'partitions-group';

    private partitionCount: number | undefined;
    private healthState: string | undefined;

    constructor(
        ctx: TreeNodeContext,
        iconService: IconService,
        cache: DataCache,
        private readonly serviceId: string,
        private readonly applicationId: string,
    ) {
        super(ctx, iconService, cache);
        this.id = `partitions-group:${ctx.clusterEndpoint}:${applicationId}:${serviceId}`;
    }

    getTreeItem(): vscode.TreeItem {
        const label = this.partitionCount !== undefined
            ? `partitions (${this.partitionCount})`
            : 'partitions (...)';
        const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.Collapsed);
        item.id = this.id;
        item.iconPath = this.iconService.getHealthIcon(this.healthState, 'layers');
        item.resourceUri = this.ctx.resourceUri;
        item.command = {
            command: 'sfClusterExplorer.showItemDetails',
            title: 'Show Details',
            arguments: [{
                itemType: this.itemType,
                id: this.id,
                clusterEndpoint: this.ctx.clusterEndpoint,
                applicationId: this.applicationId,
                serviceId: this.serviceId,
            }],
        };

        // Prefetch partition data in background so count/health populate
        // without waiting for the user to expand this node
        if (this.partitionCount === undefined && !this.isLoaded) {
            this.getChildren();
        }

        return item;
    }

    /**
     * Preserve partitionCount and healthState across invalidation so
     * getTreeItem() shows the last known values instead of "..." / grey.
     */
    invalidate(): void {
        super.invalidate();
        // partitionCount and healthState are NOT cleared — they survive refresh
    }

    protected async fetchChildren(): Promise<ITreeNode[]> {
        const cacheKey = `partitions:${this.ctx.clusterEndpoint}:${this.applicationId}:${this.serviceId}`;
        let partitions = this.cache.get<any[]>(cacheKey);

        if (!partitions) {
            partitions = await this.ctx.sfRest.getServicePartitions(this.serviceId, this.applicationId);
            this.cache.set(cacheKey, partitions);
        }

        this.partitionCount = partitions.length;
        this.healthState = IconService.worstHealthState(partitions.map(p => p.healthState));

        // Schedule a label/icon refresh after VS Code finishes processing getChildren()
        if (this.ctx.requestRefresh) {
            setTimeout(() => this.ctx.requestRefresh!(this), 0);
        }

        return partitions.map(partition => new PartitionNode(
            deriveContext(this.ctx, {
                parentApplicationId: this.applicationId,
                parentServiceId: this.serviceId,
                parentPartitionId: partition.partitionInformation?.id || partition.partitionId,
            }),
            this.iconService,
            this.cache,
            partition,
            this.serviceId,
            this.applicationId,
        ));
    }
}
