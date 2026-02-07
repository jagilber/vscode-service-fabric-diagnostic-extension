import * as vscode from 'vscode';
import { BaseTreeNode } from '../BaseTreeNode';
import { ITreeNode } from '../ITreeNode';
import { TreeNodeContext } from '../TreeNodeContext';
import { IconService } from '../IconService';
import { DataCache } from '../DataCache';
import * as commandsData from '../data/commands.json';

/**
 * Top-level "commands" node in the tree.
 * Children are generated from the JSON data file (Decision 1b).
 * No REST calls — purely static data.
 */
export class CommandsNode extends BaseTreeNode {
    readonly id: string;
    readonly contextValue = undefined;
    readonly itemType = 'commands';

    constructor(ctx: TreeNodeContext, iconService: IconService, cache: DataCache) {
        super(ctx, iconService, cache);
        this.id = `commands:${ctx.clusterEndpoint}`;
    }

    getTreeItem(): vscode.TreeItem {
        const item = new vscode.TreeItem('commands', vscode.TreeItemCollapsibleState.Collapsed);
        item.id = this.id;
        item.iconPath = this.iconService.getStaticIcon('terminal', 'charts.blue');
        item.resourceUri = this.ctx.resourceUri;
        return item;
    }

    protected async fetchChildren(): Promise<ITreeNode[]> {
        const data = commandsData as CommandsDataRoot;
        return data.sections.map(section =>
            new CommandSectionNode(this.ctx, this.iconService, section),
        );
    }
}

/**
 * Tool section (e.g. "PowerShell Commands", "Azure CLI Commands").
 */
class CommandSectionNode implements ITreeNode {
    readonly id: string;
    readonly contextValue = undefined;
    readonly itemType = 'tool-section';
    readonly isLoaded = true;

    private readonly children: ITreeNode[];

    constructor(
        private readonly ctx: TreeNodeContext,
        private readonly iconService: IconService,
        private readonly section: CommandSection,
    ) {
        this.id = `cmd-section:${ctx.clusterEndpoint}:${section.label}`;
        this.children = section.categories.map(cat =>
            new CommandCategoryNode(ctx, iconService, cat),
        );
    }

    getTreeItem(): vscode.TreeItem {
        const item = new vscode.TreeItem(
            this.section.label,
            vscode.TreeItemCollapsibleState.Collapsed,
        );
        item.id = this.id;
        item.iconPath = this.iconService.getStaticIcon(this.section.icon, this.section.color);
        item.resourceUri = this.ctx.resourceUri;
        return item;
    }

    async getChildren(): Promise<ITreeNode[]> { return this.children; }
    invalidate(): void {}
    dispose(): void {}
}

/**
 * Command category (e.g. "Cluster Operations", "Application Lifecycle").
 */
class CommandCategoryNode implements ITreeNode {
    readonly id: string;
    readonly contextValue = undefined;
    readonly itemType = 'command-category';
    readonly isLoaded = true;

    private readonly children: ITreeNode[];

    constructor(
        private readonly ctx: TreeNodeContext,
        private readonly iconService: IconService,
        private readonly category: CommandCategory,
    ) {
        this.id = `cmd-cat:${ctx.clusterEndpoint}:${category.label}`;
        this.children = category.commands.map(cmd =>
            new CommandLeafNode(ctx, iconService, cmd),
        );
    }

    getTreeItem(): vscode.TreeItem {
        const item = new vscode.TreeItem(
            this.category.label,
            vscode.TreeItemCollapsibleState.Collapsed,
        );
        item.id = this.id;
        item.iconPath = this.iconService.getStaticIcon(this.category.icon, this.category.color);
        item.resourceUri = this.ctx.resourceUri;
        return item;
    }

    async getChildren(): Promise<ITreeNode[]> { return this.children; }
    invalidate(): void {}
    dispose(): void {}
}

/**
 * Leaf command node (e.g. "Start Cluster Upgrade").
 */
class CommandLeafNode implements ITreeNode {
    readonly id: string;
    readonly contextValue: string;
    readonly itemType = 'command';
    readonly isLoaded = true;

    constructor(
        private readonly ctx: TreeNodeContext,
        private readonly iconService: IconService,
        private readonly cmd: CommandEntry,
    ) {
        this.id = `cmd:${ctx.clusterEndpoint}:${cmd.commandId}`;
        this.contextValue = cmd.contextValue;
    }

    getTreeItem(): vscode.TreeItem {
        const item = new vscode.TreeItem(this.cmd.label, vscode.TreeItemCollapsibleState.None);
        item.id = this.id;
        item.contextValue = this.contextValue;
        item.iconPath = this.iconService.getStaticIcon(this.cmd.icon, this.cmd.color);
        item.resourceUri = this.ctx.resourceUri;
        item.command = {
            command: 'sfClusterExplorer.showItemDetails',
            title: 'Show Details',
            arguments: [{
                itemType: this.itemType,
                id: this.id,
                clusterEndpoint: this.ctx.clusterEndpoint,
                commandId: this.cmd.commandId,
            }],
        };
        return item;
    }

    async getChildren(): Promise<undefined> { return undefined; }
    invalidate(): void {}
    dispose(): void {}
}

// ── JSON data types ──────────────────────────────────────────────────

interface CommandsDataRoot {
    sections: CommandSection[];
}

interface CommandSection {
    label: string;
    icon: string;
    color: string;
    emoji?: string;
    categories: CommandCategory[];
}

interface CommandCategory {
    label: string;
    icon: string;
    color: string;
    emoji?: string;
    commands: CommandEntry[];
}

interface CommandEntry {
    label: string;
    icon: string;
    color: string;
    commandId: string;
    contextValue: string;
}
