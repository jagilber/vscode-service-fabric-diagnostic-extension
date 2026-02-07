import * as vscode from 'vscode';
import { BaseTreeNode } from '../BaseTreeNode';
import { ITreeNode } from '../ITreeNode';
import { TreeNodeContext, deriveContext } from '../TreeNodeContext';
import { IconService } from '../IconService';
import { DataCache } from '../DataCache';
import { StaticItemNode } from './StaticItemNode';
import { DeployedAppNode } from './DeployedAppNode';
import * as sfModels from '../../sdk/servicefabric/servicefabric/src/models';

/**
 * Individual cluster node (e.g. _Node_0).
 * Lazy-loads deployed applications on expand.
 */
export class NodeNode extends BaseTreeNode {
    readonly id: string;
    readonly contextValue = 'node';
    readonly itemType = 'node';

    constructor(
        ctx: TreeNodeContext,
        iconService: IconService,
        cache: DataCache,
        private readonly nodeInfo: sfModels.NodeInfo,
    ) {
        super(ctx, iconService, cache);
        this.id = `node:${ctx.clusterEndpoint}:${nodeInfo.name}`;
    }

    getTreeItem(): vscode.TreeItem {
        const name = this.nodeInfo.name || 'Unknown';
        const item = new vscode.TreeItem(name, vscode.TreeItemCollapsibleState.Collapsed);
        item.id = this.id;
        item.contextValue = this.contextValue;
        item.resourceUri = this.ctx.resourceUri;

        // Derive icon from node health & status
        const healthState = this.nodeInfo.healthState;
        const nodeStatus = this.nodeInfo.nodeStatus;

        // Use node status to determine icon color if node is not Up
        if (nodeStatus && nodeStatus !== 'Up') {
            item.iconPath = this.iconService.getHealthIcon(nodeStatus, 'server');
        } else {
            item.iconPath = this.iconService.getHealthIcon(healthState, 'server');
        }

        // Description: type + status
        const parts: string[] = [];
        if (this.nodeInfo.isSeedNode) { parts.push('seed'); }
        if (this.nodeInfo.type) { parts.push(this.nodeInfo.type); }
        if (nodeStatus && nodeStatus !== 'Up') { parts.push(nodeStatus); }
        item.description = parts.join(' | ');

        item.tooltip = this.buildTooltip();

        item.command = {
            command: 'sfClusterExplorer.showItemDetails',
            title: 'Show Details',
            arguments: [{
                itemType: this.itemType,
                id: this.id,
                clusterEndpoint: this.ctx.clusterEndpoint,
                nodeName: this.nodeInfo.name,
            }],
        };

        return item;
    }

    protected async fetchChildren(): Promise<ITreeNode[]> {
        const nodeName = this.nodeInfo.name;
        if (!nodeName) { return []; }

        const cacheKey = `deployed-apps:${this.ctx.clusterEndpoint}:${nodeName}`;
        let deployedApps = this.cache.get<any[]>(cacheKey);

        if (!deployedApps) {
            deployedApps = await this.ctx.sfRest.getDeployedApplications(nodeName);
            this.cache.set(cacheKey, deployedApps);
        }

        const children: ITreeNode[] = [
            // Static items for node details
            new StaticItemNode(this.ctx, this.iconService, 'health', 'node-health', 'heart', 'charts.green', 'node-health'),
            new StaticItemNode(this.ctx, this.iconService, 'events', 'node-events', 'calendar', 'charts.purple', 'node-events'),
        ];

        // Deployed applications
        if (deployedApps && deployedApps.length > 0) {
            const sorted = [...deployedApps].sort(
                (a, b) => (a.name || '').localeCompare(b.name || ''),
            );

            for (const app of sorted) {
                children.push(new DeployedAppNode(
                    deriveContext(this.ctx, {
                        parentNodeName: nodeName,
                        parentApplicationId: app.id || app.name,
                    }),
                    this.iconService,
                    this.cache,
                    app,
                    nodeName,
                ));
            }
        }

        return children;
    }

    private buildTooltip(): string {
        const n = this.nodeInfo;
        const lines: string[] = [
            `Name: ${n.name || 'Unknown'}`,
            `Status: ${n.nodeStatus || 'Unknown'}`,
            `Health: ${n.healthState || 'Unknown'}`,
        ];
        if (n.type) { lines.push(`Type: ${n.type}`); }
        if (n.isSeedNode !== undefined) { lines.push(`Seed Node: ${n.isSeedNode}`); }
        if (n.ipAddressOrFqdn) { lines.push(`Address: ${n.ipAddressOrFqdn}`); }
        if (n.upgradeDomain) { lines.push(`Upgrade Domain: ${n.upgradeDomain}`); }
        if (n.faultDomain) { lines.push(`Fault Domain: ${n.faultDomain}`); }
        if (n.codeVersion) { lines.push(`Code Version: ${n.codeVersion}`); }
        return lines.join('\n');
    }
}
