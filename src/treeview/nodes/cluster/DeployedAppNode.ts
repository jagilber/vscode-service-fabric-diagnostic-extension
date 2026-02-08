import * as vscode from 'vscode';
import { BaseTreeNode } from '../../BaseTreeNode';
import { ITreeNode } from '../../ITreeNode';
import { TreeNodeContext, deriveContext } from '../../TreeNodeContext';
import { IconService } from '../../IconService';
import { DataCache } from '../../DataCache';
import { DeployedServicePackageNode } from './DeployedServicePackageNode';

/**
 * Deployed application on a specific node.
 * Children: deployed service packages.
 */
export class DeployedAppNode extends BaseTreeNode {
    readonly id: string;
    readonly contextValue = 'deployedApplication';
    readonly itemType = 'deployed-application';

    constructor(
        ctx: TreeNodeContext,
        iconService: IconService,
        cache: DataCache,
        private readonly deployedAppInfo: any,
        private readonly nodeName: string,
    ) {
        super(ctx, iconService, cache);
        const appName = deployedAppInfo.name || deployedAppInfo.id || 'unknown';
        this.id = `deployed-app:${ctx.clusterEndpoint}:${nodeName}:${appName}`;
    }

    getTreeItem(): vscode.TreeItem {
        const name = this.deployedAppInfo.name || 'Unknown';
        const item = new vscode.TreeItem(name, vscode.TreeItemCollapsibleState.Collapsed);
        item.id = this.id;
        item.contextValue = this.contextValue;
        item.resourceUri = this.ctx.resourceUri;

        item.iconPath = this.iconService.getHealthIcon(this.deployedAppInfo.healthState, 'archive');

        // Status
        if (this.deployedAppInfo.deployedApplicationStatus) {
            item.description = this.deployedAppInfo.deployedApplicationStatus;
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
                applicationId: this.getAppId(),
            }],
        };

        return item;
    }

    protected async fetchChildren(): Promise<ITreeNode[]> {
        const appId = this.getAppId();
        const cacheKey = `deployed-svc-pkg:${this.ctx.clusterEndpoint}:${this.nodeName}:${appId}`;
        let packages = this.cache.get<any[]>(cacheKey);

        if (!packages) {
            packages = await this.ctx.sfRest.getDeployedServicePackages(this.nodeName, appId);
            this.cache.set(cacheKey, packages);
        }

        if (!packages || packages.length === 0) { return []; }

        return packages.map(pkg => new DeployedServicePackageNode(
            deriveContext(this.ctx, {
                parentNodeName: this.nodeName,
                parentApplicationId: appId,
                parentServiceManifestName: pkg.serviceManifestName || pkg.name,
            }),
            this.iconService,
            this.cache,
            pkg,
            this.nodeName,
            appId,
        ));
    }

    private getAppId(): string {
        const raw = this.deployedAppInfo.id || this.deployedAppInfo.name || '';
        return raw.startsWith('fabric:/') ? raw.replace('fabric:/', '') : raw;
    }

    private buildTooltip(): string {
        const d = this.deployedAppInfo;
        const lines: string[] = [
            `Name: ${d.name || 'Unknown'}`,
            `Node: ${this.nodeName}`,
        ];
        if (d.deployedApplicationStatus) { lines.push(`Status: ${d.deployedApplicationStatus}`); }
        if (d.healthState) { lines.push(`Health: ${d.healthState}`); }
        if (d.typeVersion) { lines.push(`Version: ${d.typeVersion}`); }
        return lines.join('\n');
    }
}
