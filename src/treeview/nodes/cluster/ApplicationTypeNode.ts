import * as vscode from 'vscode';
import { BaseTreeNode } from '../../BaseTreeNode';
import { ITreeNode } from '../../ITreeNode';
import { TreeNodeContext, deriveContext } from '../../TreeNodeContext';
import { IconService } from '../../IconService';
import { DataCache } from '../../DataCache';
import { ApplicationNode } from './ApplicationNode';
import * as sfModels from '../../../sdk/servicefabric/servicefabric/src/models';

/**
 * Application type folder node (e.g. "MyAppType (v1.0.0)").
 * Contains one child per application instance of this type.
 * 
 * If there is only one application of this type, the type node 
 * is still created for consistency — the user can collapse it.
 */
export class ApplicationTypeNode extends BaseTreeNode {
    readonly id: string;
    readonly contextValue = 'applicationType';
    readonly itemType = 'application-type';

    constructor(
        ctx: TreeNodeContext,
        iconService: IconService,
        cache: DataCache,
        private readonly typeName: string,
        private readonly typeInfo: sfModels.ApplicationTypeInfo | undefined,
        private readonly applications: sfModels.ApplicationInfo[],
    ) {
        super(ctx, iconService, cache);
        this.id = `app-type:${ctx.clusterEndpoint}:${typeName}`;
    }

    getTreeItem(): vscode.TreeItem {
        const version = this.typeInfo?.version || '';
        const label = version ? `${this.typeName} (${version})` : this.typeName;
        const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.Collapsed);
        item.id = this.id;
        item.contextValue = this.contextValue;
        item.resourceUri = this.ctx.resourceUri;

        // Health based on worst status of contained applications
        const healthState = IconService.worstHealthState(this.applications.map(a => a.healthState));
        item.iconPath = this.iconService.getHealthIcon(healthState, 'symbol-class');

        item.description = `(${this.applications.length} app${this.applications.length !== 1 ? 's' : ''})`;

        item.tooltip = this.buildTooltip();

        item.command = {
            command: 'sfClusterExplorer.showItemDetails',
            title: 'Show Details',
            arguments: [{
                itemType: this.itemType,
                id: this.id,
                clusterEndpoint: this.ctx.clusterEndpoint,
                typeName: this.typeName,
                typeVersion: this.typeInfo?.version,
            }],
        };

        return item;
    }

    protected async fetchChildren(): Promise<ITreeNode[]> {
        const sorted = [...this.applications].sort(
            (a, b) => (a.name || '').localeCompare(b.name || ''),
        );

        return sorted.map(app => {
            // Application ID: strip "fabric:/" prefix for REST calls
            const applicationId = app.id || app.name?.replace('fabric:/', '') || '';

            return new ApplicationNode(
                deriveContext(this.ctx, { parentApplicationId: applicationId }),
                this.iconService,
                this.cache,
                app,
            );
        });
    }

    private buildTooltip(): string {
        const lines: string[] = [
            `Type: ${this.typeName}`,
        ];
        if (this.typeInfo?.version) { lines.push(`Version: ${this.typeInfo.version}`); }
        if (this.typeInfo?.status) { lines.push(`Status: ${this.typeInfo.status}`); }
        lines.push(`Applications: ${this.applications.length}`);
        return lines.join('\n');
    }
}
