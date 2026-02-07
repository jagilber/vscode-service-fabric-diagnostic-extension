import * as vscode from 'vscode';

/**
 * Interface for all tree nodes in the Service Fabric cluster explorer.
 * Each node type implements this to encapsulate its own data-fetching,
 * icon resolution, and child generation.
 */
export interface ITreeNode {
    /** Unique identifier for dedup and refresh targeting */
    readonly id: string;

    /** VS Code contextValue for menu matching (ONLY for menus — never data storage) */
    readonly contextValue?: string;

    /** The item type string for detail view routing */
    readonly itemType: string;

    /** Whether this node's children have been fetched */
    readonly isLoaded: boolean;

    /** The VS Code TreeItem to render (must be synchronous and cheap) */
    getTreeItem(): vscode.TreeItem;

    /** Lazy-load children. Return undefined to indicate leaf node. */
    getChildren(): Promise<ITreeNode[] | undefined>;

    /** Invalidate cached children — next getChildren() will re-fetch */
    invalidate(): void;

    /** Dispose any resources (timers, listeners) */
    dispose(): void;
}
