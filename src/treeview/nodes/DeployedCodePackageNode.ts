import * as vscode from 'vscode';
import { ITreeNode } from '../ITreeNode';
import { TreeNodeContext } from '../TreeNodeContext';
import { IconService } from '../IconService';

/**
 * Deployed code package leaf node.
 * Shows information about a code package running on a node.
 * This is a leaf — no children.
 */
export class DeployedCodePackageNode implements ITreeNode {
    readonly id: string;
    readonly contextValue = 'deployedCodePackage';
    readonly itemType = 'deployed-code-package';
    readonly isLoaded = true;

    constructor(
        private readonly ctx: TreeNodeContext,
        private readonly iconService: IconService,
        private readonly codePackageInfo: any,
        private readonly nodeName: string,
        private readonly applicationId: string,
        private readonly serviceManifestName: string,
    ) {
        const name = codePackageInfo.name || codePackageInfo.codePackageName || 'unknown';
        this.id = `deployed-code-pkg:${ctx.clusterEndpoint}:${nodeName}:${applicationId}:${serviceManifestName}:${name}`;
    }

    getTreeItem(): vscode.TreeItem {
        const name = this.codePackageInfo.name || this.codePackageInfo.codePackageName || 'Unknown';
        const item = new vscode.TreeItem(name, vscode.TreeItemCollapsibleState.None);
        item.id = this.id;
        item.contextValue = this.contextValue;
        item.resourceUri = this.ctx.resourceUri;

        // Color by status: Active = ok, other = warning
        const status = this.codePackageInfo.deployedCodePackageStatus || this.codePackageInfo.status;
        item.iconPath = this.iconService.getHealthIcon(
            status === 'Active' ? 'Ok' : status,
            'symbol-file',
        );

        // Version in description
        if (this.codePackageInfo.version) {
            item.description = `v${this.codePackageInfo.version}`;
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
                codePackageName: this.codePackageInfo.name || this.codePackageInfo.codePackageName,
            }],
        };

        return item;
    }

    async getChildren(): Promise<undefined> { return undefined; }
    invalidate(): void {}
    dispose(): void {}

    private buildTooltip(): string {
        const c = this.codePackageInfo;
        const lines: string[] = [
            `Code Package: ${c.name || c.codePackageName || 'Unknown'}`,
        ];
        if (c.version) { lines.push(`Version: ${c.version}`); }
        if (c.deployedCodePackageStatus || c.status) {
            lines.push(`Status: ${c.deployedCodePackageStatus || c.status}`);
        }
        if (c.runFrequencyInterval) { lines.push(`Run Frequency: ${c.runFrequencyInterval}`); }
        if (c.mainEntryPoint?.codePackageEntryPointStatistics) {
            const stats = c.mainEntryPoint.codePackageEntryPointStatistics;
            if (stats.lastActivationTime) { lines.push(`Last Activated: ${stats.lastActivationTime}`); }
            if (stats.lastExitCode !== undefined) { lines.push(`Last Exit Code: ${stats.lastExitCode}`); }
        }
        return lines.join('\n');
    }
}
