import * as vscode from 'vscode';
import { BaseTreeNode } from '../../BaseTreeNode';
import { ITreeNode } from '../../ITreeNode';
import { TreeNodeContext, deriveContext } from '../../TreeNodeContext';
import { IconService } from '../../IconService';
import { DataCache } from '../../DataCache';
import { StaticItemNode } from './StaticItemNode';

/**
 * Individual replica/instance node.
 * Leaf children: health and events static items.
 */
export class ReplicaNode extends BaseTreeNode {
    readonly id: string;
    readonly contextValue = 'replica';
    readonly itemType = 'replica';

    private readonly replicaId: string;

    constructor(
        ctx: TreeNodeContext,
        iconService: IconService,
        cache: DataCache,
        private readonly replicaInfo: any,
        private readonly partitionId: string,
        private readonly serviceId: string,
        private readonly applicationId: string,
    ) {
        super(ctx, iconService, cache);
        this.replicaId = replicaInfo.replicaId || replicaInfo.instanceId || 'unknown';
        this.id = `replica:${ctx.clusterEndpoint}:${applicationId}:${serviceId}:${partitionId}:${this.replicaId}`;
    }

    getTreeItem(): vscode.TreeItem {
        const label = this.getReplicaLabel();
        const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.Collapsed);
        item.id = this.id;
        item.contextValue = this.contextValue;
        item.resourceUri = this.ctx.resourceUri;

        item.iconPath = this.iconService.getHealthIcon(this.replicaInfo.healthState, 'copy');

        // Description: role + status
        const parts: string[] = [];
        if (this.replicaInfo.replicaRole) { parts.push(this.replicaInfo.replicaRole); }
        if (this.replicaInfo.replicaStatus) { parts.push(this.replicaInfo.replicaStatus); }
        item.description = parts.join(' | ');

        item.tooltip = this.buildTooltip();

        item.command = {
            command: 'sfClusterExplorer.showItemDetails',
            title: 'Show Details',
            arguments: [{
                itemType: this.itemType,
                id: this.id,
                itemId: this.replicaId,
                clusterEndpoint: this.ctx.clusterEndpoint,
                applicationId: this.applicationId,
                serviceId: this.serviceId,
                partitionId: this.partitionId,
                replicaId: this.replicaId,
                nodeName: this.replicaInfo.nodeName,
            }],
        };

        return item;
    }

    protected async fetchChildren(): Promise<ITreeNode[]> {
        const idSuffix = `${this.applicationId}:${this.serviceId}:${this.partitionId}:${this.replicaId}`;

        // Derive context with replicaId so StaticItemNode children can pass it in commands
        const childCtx = deriveContext(this.ctx, {
            parentPartitionId: this.partitionId,
            parentReplicaId: this.replicaId,
        });

        return [
            new StaticItemNode(childCtx, this.iconService, 'health', `rep-health:${idSuffix}`, 'heart', 'charts.green', 'replica-health'),
            new StaticItemNode(childCtx, this.iconService, 'events', `rep-events:${idSuffix}`, 'calendar', 'charts.purple', 'replica-events'),
        ];
    }

    private getReplicaLabel(): string {
        const role = this.replicaInfo.replicaRole;
        if (role) {
            return `${role} Replica (${this.replicaId})`;
        }
        return `Instance (${this.replicaId})`;
    }

    private buildTooltip(): string {
        const r = this.replicaInfo;
        const lines: string[] = [];

        const id = r.replicaId || r.instanceId;
        if (id) { lines.push(`ID: ${id}`); }
        if (r.replicaRole) { lines.push(`Role: ${r.replicaRole}`); }
        if (r.replicaStatus) { lines.push(`Status: ${r.replicaStatus}`); }
        if (r.healthState) { lines.push(`Health: ${r.healthState}`); }
        if (r.nodeName) { lines.push(`Node: ${r.nodeName}`); }
        if (r.address) { lines.push(`Address: ${r.address}`); }
        if (r.lastInBuildDurationInSeconds !== undefined) {
            lines.push(`Last Build Duration: ${r.lastInBuildDurationInSeconds}s`);
        }
        return lines.join('\n');
    }
}
