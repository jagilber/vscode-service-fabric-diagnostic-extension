import * as vscode from 'vscode';
import { ITreeNode } from './ITreeNode';
import { TreeNodeContext } from './TreeNodeContext';
import { IconService } from './IconService';
import { DataCache } from './DataCache';

/**
 * Abstract base class for all tree nodes.
 * Handles loading state, error wrapping, disposal, and caching.
 * Subclasses only need to implement getTreeItem() and fetchChildren().
 */
export abstract class BaseTreeNode implements ITreeNode {
    abstract readonly id: string;
    abstract readonly contextValue?: string;
    abstract readonly itemType: string;

    protected children: ITreeNode[] | undefined;
    protected _isLoaded = false;
    private _fetchPromise: Promise<ITreeNode[] | undefined> | undefined;

    constructor(
        protected readonly ctx: TreeNodeContext,
        protected readonly iconService: IconService,
        protected readonly cache: DataCache,
    ) {}

    get isLoaded(): boolean { return this._isLoaded; }

    abstract getTreeItem(): vscode.TreeItem;

    /**
     * Override in subclasses to fetch children from REST APIs / cache.
     * Return undefined for leaf nodes, empty array for "no children".
     * Errors thrown here are caught by getChildren() and displayed as ErrorNodes.
     */
    protected abstract fetchChildren(): Promise<ITreeNode[] | undefined>;

    /**
     * Public getChildren — wraps fetchChildren with error handling and dedup.
     * If a fetch is already in-flight, returns the same promise (prevents races).
     */
    async getChildren(): Promise<ITreeNode[] | undefined> {
        if (this._isLoaded) {
            return this.children;
        }

        // Dedup: if a fetch is in-flight, return the same promise
        if (this._fetchPromise) {
            return this._fetchPromise;
        }

        this._fetchPromise = this._doFetch();
        try {
            return await this._fetchPromise;
        } finally {
            this._fetchPromise = undefined;
        }
    }

    private async _doFetch(): Promise<ITreeNode[] | undefined> {
        try {
            this.children = await this.fetchChildren();
            this._isLoaded = true;
            return this.children;
        } catch (err) {
            this.children = [new ErrorNode(err, this)];
            this._isLoaded = true;
            return this.children;
        }
    }

    /**
     * Invalidate cached children. Next getChildren() will re-fetch.
     */
    invalidate(): void {
        this.children?.forEach(c => c.dispose());
        this.children = undefined;
        this._isLoaded = false;
        this._fetchPromise = undefined;
    }

    dispose(): void {
        this.children?.forEach(c => c.dispose());
        this.children = undefined;
    }
}

/**
 * Error node displayed in tree when data loading fails.
 * Shows the error message with a retry command.
 */
export class ErrorNode implements ITreeNode {
    readonly id: string;
    readonly contextValue = undefined;
    readonly itemType = 'error';
    readonly isLoaded = true;

    private readonly message: string;

    constructor(error: unknown, private readonly parent: ITreeNode) {
        this.message = error instanceof Error ? error.message : String(error);
        this.id = `error:${parent.id}:${Date.now()}`;
    }

    getTreeItem(): vscode.TreeItem {
        const item = new vscode.TreeItem(
            `Error: ${this.message}`,
            vscode.TreeItemCollapsibleState.None,
        );
        item.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('testing.iconFailed'));
        item.tooltip = `Failed to load data. Click to retry.\n\n${this.message}`;
        item.command = {
            command: 'sfClusterExplorer.retryNode',
            title: 'Retry',
            arguments: [this.parent],
        };
        return item;
    }

    async getChildren(): Promise<undefined> { return undefined; }
    invalidate(): void {}
    dispose(): void {}
}
