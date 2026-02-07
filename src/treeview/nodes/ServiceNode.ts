import * as vscode from 'vscode';
import { BaseTreeNode } from '../BaseTreeNode';
import { ITreeNode } from '../ITreeNode';
import { TreeNodeContext, deriveContext } from '../TreeNodeContext';
import { IconService } from '../IconService';
import { DataCache } from '../DataCache';
import { StaticItemNode } from './StaticItemNode';
import { PartitionsGroupNode } from './PartitionsGroupNode';
import * as sfModels from '../../sdk/servicefabric/servicefabric/src/models';

/**
 * Individual service node (e.g. "fabric:/MyApp/MyService").
 * Children: static items (health, events, manifest) + PartitionsGroupNode.
 */
export class ServiceNode extends BaseTreeNode {
    readonly id: string;
    readonly contextValue = 'service';
    readonly itemType = 'service';

    constructor(
        ctx: TreeNodeContext,
        iconService: IconService,
        cache: DataCache,
        private readonly serviceInfo: sfModels.ServiceInfoUnion,
        private readonly applicationId: string,
    ) {
        super(ctx, iconService, cache);
        const serviceId = serviceInfo.id || serviceInfo.name || '';
        this.id = `service:${ctx.clusterEndpoint}:${applicationId}:${serviceId}`;
    }

    getTreeItem(): vscode.TreeItem {
        const name = this.serviceInfo.name || 'Unknown';
        const item = new vscode.TreeItem(name, vscode.TreeItemCollapsibleState.Collapsed);
        item.id = this.id;
        item.contextValue = this.contextValue;
        item.resourceUri = this.ctx.resourceUri;

        item.iconPath = this.iconService.getHealthIcon(this.serviceInfo.healthState, 'symbol-method');

        // Description: service kind + status
        const parts: string[] = [];
        if (this.serviceInfo.serviceKind) { parts.push(this.serviceInfo.serviceKind); }
        if (this.serviceInfo.serviceStatus) { parts.push(this.serviceInfo.serviceStatus); }
        item.description = parts.join(' | ');

        item.tooltip = this.buildTooltip();

        item.command = {
            command: 'sfClusterExplorer.showItemDetails',
            title: 'Show Details',
            arguments: [{
                itemType: this.itemType,
                id: this.id,
                clusterEndpoint: this.ctx.clusterEndpoint,
                applicationId: this.applicationId,
                serviceId: this.getServiceId(),
                serviceName: this.serviceInfo.name,
            }],
        };

        return item;
    }

    protected async fetchChildren(): Promise<ITreeNode[]> {
        const serviceId = this.getServiceId();
        const idSuffix = `${this.applicationId}:${serviceId}`;

        return [
            new StaticItemNode(this.ctx, this.iconService, 'health', `svc-health:${idSuffix}`, 'heart', 'charts.green', 'service-health'),
            new StaticItemNode(this.ctx, this.iconService, 'events', `svc-events:${idSuffix}`, 'calendar', 'charts.purple', 'service-events'),
            new StaticItemNode(this.ctx, this.iconService, 'manifest', `svc-manifest:${idSuffix}`, 'file-code', 'charts.orange', 'service-manifest'),
            new PartitionsGroupNode(
                deriveContext(this.ctx, {
                    parentApplicationId: this.applicationId,
                    parentServiceId: serviceId,
                }),
                this.iconService,
                this.cache,
                serviceId,
                this.applicationId,
            ),
        ];
    }

    /** Get the service ID in REST-friendly format */
    private getServiceId(): string {
        const raw = this.serviceInfo.id || this.serviceInfo.name || '';
        return raw.startsWith('fabric:/') ? raw.replace('fabric:/', '').replace(/\//g, '~') : raw;
    }

    private buildTooltip(): string {
        const s = this.serviceInfo;
        const lines: string[] = [
            `Name: ${s.name || 'Unknown'}`,
            `Kind: ${s.serviceKind || 'Unknown'}`,
        ];
        if (s.typeName) { lines.push(`Type: ${s.typeName}`); }
        if (s.serviceStatus) { lines.push(`Status: ${s.serviceStatus}`); }
        if (s.healthState) { lines.push(`Health: ${s.healthState}`); }
        if (s.isServiceGroup !== undefined) { lines.push(`Service Group: ${s.isServiceGroup}`); }
        return lines.join('\n');
    }
}
