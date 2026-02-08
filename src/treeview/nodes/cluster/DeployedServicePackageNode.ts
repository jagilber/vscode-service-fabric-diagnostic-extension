import * as vscode from 'vscode';
import { BaseTreeNode } from '../../BaseTreeNode';
import { ITreeNode } from '../../ITreeNode';
import { TreeNodeContext, deriveContext } from '../../TreeNodeContext';
import { IconService } from '../../IconService';
import { DataCache } from '../../DataCache';
import { DeployedCodePackageNode } from './DeployedCodePackageNode';
import { DeployedReplicaNode } from './DeployedReplicaNode';

/**
 * Deployed service package on a node for a specific application.
 * Children: code packages + deployed replicas.
 */
export class DeployedServicePackageNode extends BaseTreeNode {
    readonly id: string;
    readonly contextValue = 'deployedServicePackage';
    readonly itemType = 'deployed-service-package';

    constructor(
        ctx: TreeNodeContext,
        iconService: IconService,
        cache: DataCache,
        private readonly packageInfo: any,
        private readonly nodeName: string,
        private readonly applicationId: string,
    ) {
        super(ctx, iconService, cache);
        const manifestName = packageInfo.serviceManifestName || packageInfo.name || 'unknown';
        this.id = `deployed-svc-pkg:${ctx.clusterEndpoint}:${nodeName}:${applicationId}:${manifestName}`;
    }

    getTreeItem(): vscode.TreeItem {
        const name = this.packageInfo.serviceManifestName || this.packageInfo.name || 'Unknown';
        const item = new vscode.TreeItem(name, vscode.TreeItemCollapsibleState.Collapsed);
        item.id = this.id;
        item.contextValue = this.contextValue;
        item.resourceUri = this.ctx.resourceUri;

        item.iconPath = this.iconService.getHealthIcon(this.packageInfo.healthState, 'symbol-namespace');

        // Version
        if (this.packageInfo.serviceManifestVersion || this.packageInfo.version) {
            item.description = `v${this.packageInfo.serviceManifestVersion || this.packageInfo.version}`;
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
                serviceManifestName: this.getManifestName(),
            }],
        };

        return item;
    }

    protected async fetchChildren(): Promise<ITreeNode[]> {
        const manifestName = this.getManifestName();
        const baseCacheKey = `${this.ctx.clusterEndpoint}:${this.nodeName}:${this.applicationId}:${manifestName}`;

        // Fetch code packages and deployed replicas in parallel
        const codePkgCacheKey = `deployed-code-pkg:${baseCacheKey}`;
        const replicaCacheKey = `deployed-replicas:${baseCacheKey}`;

        let codePackages = this.cache.get<any[]>(codePkgCacheKey);
        let replicas = this.cache.get<any[]>(replicaCacheKey);

        if (!codePackages || !replicas) {
            const [cpResult, repResult] = await Promise.all([
                codePackages
                    ? Promise.resolve(codePackages)
                    : this.ctx.sfRest.getDeployedCodePackages(this.nodeName, this.applicationId, manifestName),
                replicas
                    ? Promise.resolve(replicas)
                    : this.ctx.sfRest.getDeployedReplicas(this.nodeName, this.applicationId, manifestName),
            ]);
            codePackages = cpResult;
            replicas = repResult;
            this.cache.set(codePkgCacheKey, codePackages);
            this.cache.set(replicaCacheKey, replicas);
        }

        const children: ITreeNode[] = [];

        // Code packages
        if (codePackages && codePackages.length > 0) {
            for (const cp of codePackages) {
                children.push(new DeployedCodePackageNode(
                    deriveContext(this.ctx, {
                        parentNodeName: this.nodeName,
                        parentApplicationId: this.applicationId,
                        parentServiceManifestName: manifestName,
                    }),
                    this.iconService,
                    cp,
                    this.nodeName,
                    this.applicationId,
                    manifestName,
                ));
            }
        }

        // Deployed replicas
        if (replicas && replicas.length > 0) {
            for (const rep of replicas) {
                children.push(new DeployedReplicaNode(
                    deriveContext(this.ctx, {
                        parentNodeName: this.nodeName,
                        parentApplicationId: this.applicationId,
                        parentServiceManifestName: manifestName,
                    }),
                    this.iconService,
                    rep,
                    this.nodeName,
                    this.applicationId,
                    manifestName,
                ));
            }
        }

        return children;
    }

    private getManifestName(): string {
        return this.packageInfo.serviceManifestName || this.packageInfo.name || '';
    }

    private buildTooltip(): string {
        const p = this.packageInfo;
        const lines: string[] = [
            `Service Manifest: ${this.getManifestName()}`,
            `Node: ${this.nodeName}`,
            `Application: ${this.applicationId}`,
        ];
        if (p.serviceManifestVersion || p.version) {
            lines.push(`Version: ${p.serviceManifestVersion || p.version}`);
        }
        if (p.deployedServicePackageStatus || p.status) {
            lines.push(`Status: ${p.deployedServicePackageStatus || p.status}`);
        }
        if (p.healthState) { lines.push(`Health: ${p.healthState}`); }
        return lines.join('\n');
    }
}
