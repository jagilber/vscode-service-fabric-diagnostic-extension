import * as vscode from 'vscode';
import { ITreeNode } from '../../ITreeNode';
import { TreeNodeContext } from '../../TreeNodeContext';
import { IconService } from '../../IconService';

/**
 * Deployed replica/instance leaf node.
 * Shows information about a replica running on a node within a service package.
 * This is a leaf — no children.
 */
export class DeployedReplicaNode implements ITreeNode {
    readonly id: string;
    readonly contextValue = 'deployedReplica';
    readonly itemType = 'deployed-replica';
    readonly isLoaded = true;

    constructor(
        private readonly ctx: TreeNodeContext,
        private readonly iconService: IconService,
        private readonly replicaInfo: any,
        private readonly nodeName: string,
        private readonly applicationId: string,
        private readonly serviceManifestName: string,
    ) {
        const replicaId = replicaInfo.replicaId || replicaInfo.instanceId || 'unknown';
        this.id = `deployed-replica:${ctx.clusterEndpoint}:${nodeName}:${applicationId}:${serviceManifestName}:${replicaId}`;
    }

    getTreeItem(): vscode.TreeItem {
        const replicaId = this.replicaInfo.replicaId || this.replicaInfo.instanceId || 'Unknown';
        const role = this.replicaInfo.replicaRole;

        const label = role ? `${role} (${replicaId})` : `Instance (${replicaId})`;
        const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.None);
        item.id = this.id;
        item.contextValue = this.contextValue;
        item.resourceUri = this.ctx.resourceUri;

        item.iconPath = this.iconService.getHealthIcon(this.replicaInfo.healthState, 'copy');

        // Service name in description
        if (this.replicaInfo.serviceName) {
            item.description = this.replicaInfo.serviceName;
        }

        item.tooltip = this.buildTooltip();

        item.command = {
            command: 'sfClusterExplorer.showItemDetails',
            title: 'Show Details',
            arguments: [{
                itemType: this.itemType,
                id: this.id,
                clusterEndpoint: this.ctx.clusterEndpoint,
                nodeName: this.nodeName,
                applicationId: this.applicationId,
                serviceManifestName: this.serviceManifestName,
                replicaId: this.replicaInfo.replicaId || this.replicaInfo.instanceId,
                partitionId: this.replicaInfo.partitionId,
            }],
        };

        return item;
    }

    async getChildren(): Promise<undefined> { return undefined; }
    invalidate(): void {}
    dispose(): void {}

    private buildTooltip(): string {
        const r = this.replicaInfo;
        const lines: string[] = [];

        const id = r.replicaId || r.instanceId;
        if (id) { lines.push(`ID: ${id}`); }
        if (r.replicaRole) { lines.push(`Role: ${r.replicaRole}`); }
        if (r.replicaStatus) { lines.push(`Status: ${r.replicaStatus}`); }
        if (r.healthState) { lines.push(`Health: ${r.healthState}`); }
        if (r.serviceName) { lines.push(`Service: ${r.serviceName}`); }
        if (r.serviceTypeName) { lines.push(`Service Type: ${r.serviceTypeName}`); }
        if (r.partitionId) { lines.push(`Partition: ${r.partitionId}`); }
        if (r.codePackageName) { lines.push(`Code Package: ${r.codePackageName}`); }
        if (r.address) { lines.push(`Address: ${r.address}`); }
        return lines.join('\n');
    }
}
