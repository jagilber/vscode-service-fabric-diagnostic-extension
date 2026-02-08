import * as vscode from 'vscode';
import { BaseTreeNode } from '../../BaseTreeNode';
import { ITreeNode } from '../../ITreeNode';
import { TreeNodeContext, deriveContext } from '../../TreeNodeContext';
import { IconService } from '../../IconService';
import { DataCache } from '../../DataCache';
import { ServiceNode } from './ServiceNode';
import * as sfModels from '../../../sdk/servicefabric/servicefabric/src/models';

/**
 * "system (N)" group node. Contains system services (fabric:/System).
 * Lazy-loads system services on expand.
 */
export class SystemGroupNode extends BaseTreeNode {
    readonly id: string;
    readonly contextValue = undefined;
    readonly itemType = 'system-group';

    private serviceCount: number | undefined;
    private healthState: string | undefined;

    constructor(ctx: TreeNodeContext, iconService: IconService, cache: DataCache) {
        super(ctx, iconService, cache);
        this.id = `system-group:${ctx.clusterEndpoint}`;
    }

    getTreeItem(): vscode.TreeItem {
        // Prefer locally-computed health (from fetchChildren), fall back to
        // sfConfig's pre-populated cluster health for the fabric:/System app
        // so the icon is coloured even before children are fetched.
        let healthState = this.healthState;

        if (healthState === undefined) {
            const clusterHealth = this.ctx.sfConfig.getClusterHealth();
            const appStates: any[] | undefined = clusterHealth?.applicationHealthStates;
            if (appStates) {
                const systemApp = appStates.find(
                    (a: any) => a.name && a.name.toLowerCase() === 'fabric:/system',
                );
                if (systemApp) {
                    healthState = systemApp.aggregatedHealthState;
                }
            }
        }

        const label = this.serviceCount !== undefined
            ? `system (${this.serviceCount})`
            : 'system (...)';
        const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.Collapsed);
        item.id = this.id;
        item.iconPath = this.iconService.getHealthIcon(healthState, 'gear');
        item.resourceUri = this.ctx.resourceUri;
        return item;
    }

    protected async fetchChildren(): Promise<ITreeNode[]> {
        // Ensure REST client is configured (cert + endpoint) before making API calls
        await this.ctx.sfConfig.ensureRestClientReady();

        const cacheKey = `system-services:${this.ctx.clusterEndpoint}`;
        let services = this.cache.get<sfModels.ServiceInfoUnion[]>(cacheKey);

        if (!services) {
            services = await this.ctx.sfRest.getSystemServices('System');
            this.cache.set(cacheKey, services);
        }

        this.serviceCount = services.length;
        this.healthState = IconService.worstHealthState(services.map(s => s.healthState));

        const sorted = [...services].sort(
            (a, b) => (a.name || '').localeCompare(b.name || ''),
        );

        return sorted.map(service => {
            const serviceId = service.id || service.name?.replace('fabric:/', '').replace(/\//g, '~') || '';
            return new ServiceNode(
                deriveContext(this.ctx, {
                    parentApplicationId: 'System',
                    parentServiceId: serviceId,
                }),
                this.iconService,
                this.cache,
                service,
                'System',
            );
        });
    }
}
