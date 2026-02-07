import * as vscode from 'vscode';
import { BaseTreeNode } from '../BaseTreeNode';
import { ITreeNode } from '../ITreeNode';
import { TreeNodeContext, deriveContext } from '../TreeNodeContext';
import { IconService } from '../IconService';
import { DataCache } from '../DataCache';
import { StaticItemNode } from './StaticItemNode';
import { ServiceNode } from './ServiceNode';
import * as sfModels from '../../sdk/servicefabric/servicefabric/src/models';

/**
 * Individual application instance node (e.g. "fabric:/MyApp").
 * Lazy-loads services belonging to this application on expand.
 */
export class ApplicationNode extends BaseTreeNode {
    readonly id: string;
    readonly contextValue = 'application';
    readonly itemType = 'application';

    constructor(
        ctx: TreeNodeContext,
        iconService: IconService,
        cache: DataCache,
        private readonly appInfo: sfModels.ApplicationInfo,
    ) {
        super(ctx, iconService, cache);
        const appId = appInfo.id || appInfo.name || '';
        this.id = `app:${ctx.clusterEndpoint}:${appId}`;
    }

    getTreeItem(): vscode.TreeItem {
        const name = this.appInfo.name || 'Unknown';
        const item = new vscode.TreeItem(name, vscode.TreeItemCollapsibleState.Collapsed);
        item.id = this.id;
        item.contextValue = this.contextValue;
        item.resourceUri = this.ctx.resourceUri;

        item.iconPath = this.iconService.getHealthIcon(this.appInfo.healthState, 'archive');

        // Status info
        const parts: string[] = [];
        if (this.appInfo.status) { parts.push(this.appInfo.status); }
        if (this.appInfo.typeVersion) { parts.push(`v${this.appInfo.typeVersion}`); }
        item.description = parts.join(' | ');

        item.tooltip = this.buildTooltip();

        item.command = {
            command: 'sfClusterExplorer.showItemDetails',
            title: 'Show Details',
            arguments: [{
                itemType: this.itemType,
                id: this.id,
                clusterEndpoint: this.ctx.clusterEndpoint,
                applicationId: this.getApplicationId(),
                applicationName: this.appInfo.name,
            }],
        };

        return item;
    }

    protected async fetchChildren(): Promise<ITreeNode[]> {
        const applicationId = this.getApplicationId();
        if (!applicationId) { return []; }

        const cacheKey = `services:${this.ctx.clusterEndpoint}:${applicationId}`;
        let services = this.cache.get<sfModels.ServiceInfoUnion[]>(cacheKey);

        if (!services) {
            services = await this.ctx.sfRest.getServices(applicationId);
            this.cache.set(cacheKey, services);
        }

        const children: ITreeNode[] = [
            new StaticItemNode(this.ctx, this.iconService, 'health', `app-health:${applicationId}`, 'heart', 'charts.green', 'app-health'),
            new StaticItemNode(this.ctx, this.iconService, 'events', `app-events:${applicationId}`, 'calendar', 'charts.purple', 'app-events'),
            new StaticItemNode(this.ctx, this.iconService, 'manifest', `app-manifest:${applicationId}`, 'file-code', 'charts.orange', 'app-manifest'),
        ];

        if (services && services.length > 0) {
            const sorted = [...services].sort(
                (a, b) => (a.name || '').localeCompare(b.name || ''),
            );

            for (const service of sorted) {
                const serviceId = service.id || service.name?.replace('fabric:/', '') || '';
                children.push(new ServiceNode(
                    deriveContext(this.ctx, {
                        parentApplicationId: applicationId,
                        parentServiceId: serviceId,
                    }),
                    this.iconService,
                    this.cache,
                    service,
                    applicationId,
                ));
            }
        }

        return children;
    }

    /** Get the application ID in REST-friendly format (no fabric:/ prefix) */
    private getApplicationId(): string {
        const raw = this.appInfo.id || this.appInfo.name || '';
        return raw.startsWith('fabric:/') ? raw.replace('fabric:/', '') : raw;
    }

    private buildTooltip(): string {
        const a = this.appInfo;
        const lines: string[] = [
            `Name: ${a.name || 'Unknown'}`,
            `Type: ${a.typeName || 'Unknown'}`,
        ];
        if (a.typeVersion) { lines.push(`Version: ${a.typeVersion}`); }
        if (a.status) { lines.push(`Status: ${a.status}`); }
        if (a.healthState) { lines.push(`Health: ${a.healthState}`); }
        return lines.join('\n');
    }
}
