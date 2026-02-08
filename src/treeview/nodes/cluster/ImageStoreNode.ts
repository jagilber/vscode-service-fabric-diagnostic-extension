import * as vscode from 'vscode';
import { BaseTreeNode } from '../../BaseTreeNode';
import { ITreeNode } from '../../ITreeNode';
import { TreeNodeContext } from '../../TreeNodeContext';
import { IconService } from '../../IconService';
import { DataCache } from '../../DataCache';
import { SfUtility, debugLevel } from '../../../sfUtility';

/**
 * Image Store node. Lazy-loads image store contents.
 * May function as both root "image store" node and as a subfolder node (polymorphic).
 */
export class ImageStoreNode extends BaseTreeNode {
    readonly id: string;
    readonly contextValue: string;
    readonly itemType = 'image-store';

    private readonly storePath: string;
    private readonly isRoot: boolean;

    constructor(
        ctx: TreeNodeContext,
        iconService: IconService,
        cache: DataCache,
        storePath?: string,
    ) {
        super(ctx, iconService, cache);
        this.storePath = storePath || '';
        this.isRoot = !storePath;
        this.id = `image-store:${ctx.clusterEndpoint}:${this.storePath || 'root'}`;
        this.contextValue = this.isRoot ? 'imageStore' : 'imageStoreFolder';
    }

    getTreeItem(): vscode.TreeItem {
        const label = this.isRoot
            ? 'image store'
            : this.storePath.split('/').pop() || this.storePath;

        const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.Collapsed);
        item.id = this.id;
        item.contextValue = this.contextValue;
        item.resourceUri = this.ctx.resourceUri;

        item.iconPath = this.isRoot
            ? this.iconService.getStaticIcon('database', 'charts.blue')
            : this.iconService.getPlainIcon('folder');

        item.tooltip = this.isRoot
            ? 'Service Fabric Image Store'
            : `Image Store Path: ${this.storePath}`;

        if (this.isRoot) {
            item.command = {
                command: 'sfClusterExplorer.showItemDetails',
                title: 'Show Details',
                arguments: [{
                    itemType: this.itemType,
                    id: this.id,
                    clusterEndpoint: this.ctx.clusterEndpoint,
                }],
            };
        }

        return item;
    }

    protected async fetchChildren(): Promise<ITreeNode[]> {
        // Log image store type for debugging — but don't block non-native stores.
        // The REST API works on Azure clusters (xstore) via the SF gateway proxy.
        if (this.isRoot) {
            const isNative = this.ctx.sfConfig.isNativeImageStoreAvailable();
            SfUtility.outputLog(
                `ImageStoreNode: native=${isNative}, endpoint=${this.ctx.clusterEndpoint}`,
                null, debugLevel.info,
            );
        }

        const cacheKey = `image-store-content:${this.ctx.clusterEndpoint}:${this.storePath || 'root'}`;
        let content = this.cache.get<any>(cacheKey);

        if (!content) {
            try {
                content = await this.ctx.sfRest.getImageStoreContent(this.storePath || undefined);
                this.cache.set(cacheKey, content);
            } catch (error: any) {
                SfUtility.outputLog(
                    `ImageStoreNode: failed to fetch content for path '${this.storePath || 'root'}'`,
                    error, debugLevel.warn,
                );
                return [new ImageStoreUnavailableNode(this.ctx, error?.message)];
            }
        }

        const children: ITreeNode[] = [];

        // Folders first
        if (content.storeFolders) {
            const folders = [...content.storeFolders].sort(
                (a: any, b: any) => (a.storeRelativePath || '').localeCompare(b.storeRelativePath || ''),
            );
            for (const folder of folders) {
                children.push(new ImageStoreNode(
                    this.ctx,
                    this.iconService,
                    this.cache,
                    folder.storeRelativePath,
                ));
            }
        }

        // Then files
        if (content.storeFiles) {
            const files = [...content.storeFiles].sort(
                (a: any, b: any) => (a.storeRelativePath || '').localeCompare(b.storeRelativePath || ''),
            );
            for (const file of files) {
                children.push(new ImageStoreFileNode(this.ctx, this.iconService, file));
            }
        }

        return children;
    }
}

/**
 * Image store file leaf node.
 */
class ImageStoreFileNode implements ITreeNode {
    readonly id: string;
    readonly contextValue = 'imageStoreFile';
    readonly itemType = 'image-store-file';
    readonly isLoaded = true;

    constructor(
        private readonly ctx: TreeNodeContext,
        private readonly iconService: IconService,
        private readonly fileInfo: any,
    ) {
        this.id = `image-store-file:${ctx.clusterEndpoint}:${fileInfo.storeRelativePath || 'unknown'}`;
    }

    getTreeItem(): vscode.TreeItem {
        const name = this.fileInfo.storeRelativePath?.split('/').pop() || this.fileInfo.storeRelativePath || 'Unknown';
        const item = new vscode.TreeItem(name, vscode.TreeItemCollapsibleState.None);
        item.id = this.id;
        item.contextValue = this.contextValue;
        item.iconPath = this.iconService.getPlainIcon('file');
        item.resourceUri = this.ctx.resourceUri;

        // File size in description
        if (this.fileInfo.fileSize) {
            item.description = formatFileSize(this.fileInfo.fileSize);
        }

        const lines: string[] = [
            `Path: ${this.fileInfo.storeRelativePath || 'Unknown'}`,
        ];
        if (this.fileInfo.fileSize) { lines.push(`Size: ${formatFileSize(this.fileInfo.fileSize)}`); }
        if (this.fileInfo.modifiedDate) { lines.push(`Modified: ${this.fileInfo.modifiedDate}`); }
        if (this.fileInfo.fileVersion) {
            if (this.fileInfo.fileVersion.versionNumber) {
                lines.push(`Version: ${this.fileInfo.fileVersion.versionNumber}`);
            }
        }
        item.tooltip = lines.join('\n');

        return item;
    }

    async getChildren(): Promise<undefined> { return undefined; }
    invalidate(): void {}
    dispose(): void {}
}

/**
 * Placeholder shown when native image store is not available.
 */
class ImageStoreUnavailableNode implements ITreeNode {
    readonly id: string;
    readonly contextValue = undefined;
    readonly itemType = 'image-store-unavailable';
    readonly isLoaded = true;

    constructor(ctx: TreeNodeContext, private readonly errorMessage?: string) {
        this.id = `image-store-unavailable:${ctx.clusterEndpoint}`;
    }

    getTreeItem(): vscode.TreeItem {
        const label = this.errorMessage
            ? `Image Store error: ${this.errorMessage}`
            : 'Image Store unavailable';
        const item = new vscode.TreeItem(
            label,
            vscode.TreeItemCollapsibleState.None,
        );
        item.id = this.id;
        item.iconPath = new vscode.ThemeIcon('warning');
        item.tooltip = this.errorMessage
            ? `Failed to load Image Store contents:\n${this.errorMessage}`
            : 'Could not access the Image Store for this cluster.';
        return item;
    }

    async getChildren(): Promise<undefined> { return undefined; }
    invalidate(): void {}
    dispose(): void {}
}

function formatFileSize(bytes: number | string): string {
    const b = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
    if (isNaN(b) || b === 0) { return '0 B'; }
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(Math.floor(Math.log(b) / Math.log(1024)), units.length - 1);
    return `${(b / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}
