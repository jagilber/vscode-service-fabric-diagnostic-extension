import * as vscode from 'vscode';
import { BaseTreeNode } from '../BaseTreeNode';
import { ITreeNode } from '../ITreeNode';
import { TreeNodeContext, deriveContext } from '../TreeNodeContext';
import { IconService } from '../IconService';
import { DataCache } from '../DataCache';
import { StaticItemNode } from './StaticItemNode';
import { ReplicasGroupNode } from './ReplicasGroupNode';

/**
 * Individual partition node (e.g. "Partition <guid>").
 * Children: static items (health, events) + ReplicasGroupNode.
 */
export class PartitionNode extends BaseTreeNode {
    readonly id: string;
    readonly contextValue = 'partition';
    readonly itemType = 'partition';

    private readonly partitionId: string;

    constructor(
        ctx: TreeNodeContext,
        iconService: IconService,
        cache: DataCache,
        private readonly partitionInfo: any,
        private readonly serviceId: string,
        private readonly applicationId: string,
    ) {
        super(ctx, iconService, cache);
        this.partitionId = partitionInfo.partitionInformation?.id || partitionInfo.partitionId || 'unknown';
        this.id = `partition:${ctx.clusterEndpoint}:${applicationId}:${serviceId}:${this.partitionId}`;
    }

    getTreeItem(): vscode.TreeItem {
        const label = `Partition ${this.partitionId}`;
        const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.Collapsed);
        item.id = this.id;
        item.contextValue = this.contextValue;
        item.resourceUri = this.ctx.resourceUri;

        item.iconPath = this.iconService.getHealthIcon(this.partitionInfo.healthState, 'layers');

        // Description: status + service kind
        const parts: string[] = [];
        if (this.partitionInfo.partitionStatus) { parts.push(this.partitionInfo.partitionStatus); }
        const partInfo = this.partitionInfo.partitionInformation;
        if (partInfo?.servicePartitionKind) { parts.push(partInfo.servicePartitionKind); }
        item.description = parts.join(' | ');

        item.tooltip = this.buildTooltip();

        item.command = {
            command: 'sfClusterExplorer.showItemDetails',
            title: 'Show Details',
            arguments: [{
                itemType: this.itemType,
                id: this.id,
                itemId: this.partitionId,
                clusterEndpoint: this.ctx.clusterEndpoint,
                applicationId: this.applicationId,
                serviceId: this.serviceId,
                partitionId: this.partitionId,
            }],
        };

        return item;
    }

    protected async fetchChildren(): Promise<ITreeNode[]> {
        const idSuffix = `${this.applicationId}:${this.serviceId}:${this.partitionId}`;

        return [
            new StaticItemNode(this.ctx, this.iconService, 'health', `part-health:${idSuffix}`, 'heart', 'charts.green', 'partition-health'),
            new StaticItemNode(this.ctx, this.iconService, 'events', `part-events:${idSuffix}`, 'calendar', 'charts.purple', 'partition-events'),
            new ReplicasGroupNode(
                deriveContext(this.ctx, {
                    parentApplicationId: this.applicationId,
                    parentServiceId: this.serviceId,
                    parentPartitionId: this.partitionId,
                }),
                this.iconService,
                this.cache,
                this.partitionId,
                this.serviceId,
                this.applicationId,
            ),
        ];
    }

    private buildTooltip(): string {
        const p = this.partitionInfo;
        const lines: string[] = [
            `Partition ID: ${this.partitionId}`,
        ];
        if (p.partitionStatus) { lines.push(`Status: ${p.partitionStatus}`); }
        if (p.healthState) { lines.push(`Health: ${p.healthState}`); }
        const info = p.partitionInformation;
        if (info?.servicePartitionKind) { lines.push(`Kind: ${info.servicePartitionKind}`); }
        if (info?.lowKey !== undefined) { lines.push(`Low Key: ${info.lowKey}`); }
        if (info?.highKey !== undefined) { lines.push(`High Key: ${info.highKey}`); }
        if (info?.name) { lines.push(`Name: ${info.name}`); }
        return lines.join('\n');
    }
}
