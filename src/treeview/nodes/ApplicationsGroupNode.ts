import * as vscode from 'vscode';
import { BaseTreeNode } from '../BaseTreeNode';
import { ITreeNode } from '../ITreeNode';
import { TreeNodeContext, deriveContext } from '../TreeNodeContext';
import { IconService } from '../IconService';
import { DataCache } from '../DataCache';
import { ApplicationTypeNode } from './ApplicationTypeNode';
import * as sfModels from '../../sdk/servicefabric/servicefabric/src/models';

/**
 * "applications (N)" group node. 
 * Groups applications by their application type, then by individual app instance.
 */
export class ApplicationsGroupNode extends BaseTreeNode {
    readonly id: string;
    readonly contextValue = undefined;
    readonly itemType = 'applications-group';

    private appCount: number | undefined;
    private healthState: string | undefined;

    constructor(ctx: TreeNodeContext, iconService: IconService, cache: DataCache) {
        super(ctx, iconService, cache);
        this.id = `applications-group:${ctx.clusterEndpoint}`;
    }

    getTreeItem(): vscode.TreeItem {
        const label = this.appCount !== undefined ? `applications (${this.appCount})` : 'applications (...)';
        const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.Collapsed);
        item.id = this.id;
        item.iconPath = this.iconService.getHealthIcon(this.healthState, 'package');
        item.resourceUri = this.ctx.resourceUri;
        return item;
    }

    protected async fetchChildren(): Promise<ITreeNode[]> {
        // Ensure REST client is configured (cert + endpoint) before making API calls
        await this.ctx.sfConfig.ensureRestClientReady();

        const endpoint = this.ctx.clusterEndpoint;

        // Fetch application types and applications in parallel
        const typesCacheKey = `app-types:${endpoint}`;
        const appsCacheKey = `apps:${endpoint}`;

        let appTypes = this.cache.get<sfModels.ApplicationTypeInfo[]>(typesCacheKey);
        let apps = this.cache.get<sfModels.ApplicationInfo[]>(appsCacheKey);

        if (!appTypes || !apps) {
            const [typesResult, appsResult] = await Promise.all([
                appTypes ? Promise.resolve(appTypes) : this.ctx.sfRest.getApplicationTypes(),
                apps ? Promise.resolve(apps) : this.ctx.sfRest.getApplications(),
            ]);
            appTypes = typesResult;
            apps = appsResult;
            this.cache.set(typesCacheKey, appTypes);
            this.cache.set(appsCacheKey, apps);
        }

        this.appCount = apps.length;
        this.healthState = IconService.worstHealthState(apps.map(a => a.healthState));

        // Group applications by type
        const appsByType = new Map<string, sfModels.ApplicationInfo[]>();
        for (const app of apps) {
            const typeName = app.typeName || 'Unknown';
            if (!appsByType.has(typeName)) {
                appsByType.set(typeName, []);
            }
            appsByType.get(typeName)!.push(app);
        }

        // Create type nodes, sorted alphabetically
        const sortedTypeNames = [...appsByType.keys()].sort();
        return sortedTypeNames.map(typeName => {
            const typeInfo = appTypes!.find(t => t.name === typeName);
            const typeApps = appsByType.get(typeName)!;

            return new ApplicationTypeNode(
                deriveContext(this.ctx, {}),
                this.iconService,
                this.cache,
                typeName,
                typeInfo,
                typeApps,
            );
        });
    }
}
