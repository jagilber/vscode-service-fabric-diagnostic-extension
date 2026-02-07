import * as vscode from 'vscode';
import { ITreeNode } from '../ITreeNode';
import { TreeNodeContext } from '../TreeNodeContext';
import { IconService } from '../IconService';

/**
 * Leaf node for static cluster-level items (essentials, details, metrics, etc.).
 * 
 * CRITICAL: These items must NEVER be individually refreshed via
 * _onDidChangeTreeData.fire(item). They use ThemeIcon+ThemeColor
 * which loses color on premature refresh. Refresh their parent
 * (ClusterNode) instead. See docs/ICON_RENDERING_BUG.md.
 */
export class StaticItemNode implements ITreeNode {
    readonly id: string;
    readonly contextValue?: string;
    readonly itemType: string;
    readonly isLoaded = true;

    private readonly icon: vscode.ThemeIcon;

    constructor(
        private readonly ctx: TreeNodeContext,
        iconService: IconService,
        private readonly label: string,
        itemType: string,
        iconId: string,
        colorId: string,
        contextValue?: string,
    ) {
        this.itemType = itemType;
        this.contextValue = contextValue;
        this.id = `${itemType}:${ctx.clusterEndpoint}`;
        // Icon created once at construction — never mutated
        this.icon = iconService.getStaticIcon(iconId, colorId);
    }

    getTreeItem(): vscode.TreeItem {
        const item = new vscode.TreeItem(this.label, vscode.TreeItemCollapsibleState.None);
        item.id = this.id;
        item.contextValue = this.contextValue;
        item.iconPath = this.icon;
        item.resourceUri = this.ctx.resourceUri;
        item.command = {
            command: 'sfClusterExplorer.showItemDetails',
            title: 'Show Details',
            arguments: [{ itemType: this.itemType, id: this.id, clusterEndpoint: this.ctx.clusterEndpoint }],
        };
        return item;
    }

    async getChildren(): Promise<undefined> { return undefined; }
    invalidate(): void {}
    dispose(): void {}
}
