import * as vscode from 'vscode';
import { ITreeNode } from '../../ITreeNode';
import { IconService } from '../../IconService';
import { TemplateService, TemplateRepo, GitHubEntry } from '../../../services/TemplateService';
import { SfUtility, debugLevel } from '../../../sfUtility';

/**
 * Root-level repository node for the ARM Templates tree view.
 * Each configured template repo becomes one of these root nodes.
 * Children are the template directories fetched from GitHub.
 */
export class TemplateRepoNode implements ITreeNode {
    readonly id: string;
    readonly contextValue = 'template-repo';
    readonly itemType = 'template-repo';

    private _isLoaded = false;
    private _children: ITreeNode[] | undefined;

    get isLoaded(): boolean { return this._isLoaded; }

    constructor(
        private readonly iconService: IconService,
        public readonly repo: TemplateRepo,
    ) {
        this.id = `template-repo:${repo.name}`;
    }

    getTreeItem(): vscode.TreeItem {
        const item = new vscode.TreeItem(this.repo.name, vscode.TreeItemCollapsibleState.Collapsed);
        item.id = this.id;
        item.contextValue = this.contextValue;
        item.iconPath = this.iconService.getStaticIcon('repo', 'charts.blue');
        item.description = this.repo.branch || '';
        item.tooltip = [
            this.repo.description || this.repo.name,
            `URL: ${this.repo.url}`,
            `Branch: ${this.repo.branch || 'default'}`,
        ].join('\n');
        return item;
    }

    async getChildren(): Promise<ITreeNode[] | undefined> {
        if (this._isLoaded) { return this._children; }

        try {
            const service = TemplateService.getInstance();
            const entries = await service.listTemplates(this.repo);

            // Filter out hidden directories like .github
            const templates = entries.filter(e => !e.name.startsWith('.'));

            this._children = templates.map(entry =>
                new TemplateFolderNode(this.iconService, this.repo, entry),
            );
            this._isLoaded = true;

            SfUtility.outputLog(
                `TemplateRepoNode: loaded ${templates.length} templates from ${this.repo.name}`,
                null, debugLevel.info,
            );
            return this._children;
        } catch (err) {
            SfUtility.outputLog('TemplateRepoNode: failed to load templates', err, debugLevel.warn);
            this._isLoaded = true;
            this._children = [new TemplateErrorNode(err, this)];
            return this._children;
        }
    }

    invalidate(): void {
        this._children?.forEach(c => c.dispose());
        this._children = undefined;
        this._isLoaded = false;
    }

    dispose(): void {
        this._children?.forEach(c => c.dispose());
        this._children = undefined;
    }
}

/**
 * Template folder node — one per template directory in a repo.
 * Expanding fetches the files inside the template directory.
 */
export class TemplateFolderNode implements ITreeNode {
    readonly id: string;
    readonly contextValue = 'template-folder';
    readonly itemType = 'template-folder';

    private _isLoaded = false;
    private _children: ITreeNode[] | undefined;

    get isLoaded(): boolean { return this._isLoaded; }

    constructor(
        private readonly iconService: IconService,
        public readonly repo: TemplateRepo,
        public readonly entry: GitHubEntry,
    ) {
        this.id = `template-folder:${repo.name}:${entry.name}`;
    }

    getTreeItem(): vscode.TreeItem {
        const item = new vscode.TreeItem(this.entry.name, vscode.TreeItemCollapsibleState.Collapsed);
        item.id = this.id;
        item.contextValue = this.contextValue;
        item.iconPath = this.iconService.getStaticIcon('folder', 'charts.yellow');
        item.tooltip = `Template: ${this.entry.name}\nRepo: ${this.repo.name}`;
        return item;
    }

    async getChildren(): Promise<ITreeNode[] | undefined> {
        if (this._isLoaded) { return this._children; }

        try {
            const service = TemplateService.getInstance();
            const entries = await service.listTemplateFiles(this.repo, this.entry.path);

            // Separate files from subdirectories
            const files = entries.filter(e => e.type === 'file');
            const dirs = entries.filter(e => e.type === 'dir');

            this._children = [
                // Subdirectories first
                ...dirs.map(d => new TemplateFolderNode(this.iconService, this.repo, d)),
                // Then files
                ...files.map(f => new TemplateFileNode(this.iconService, this.repo, f)),
            ];
            this._isLoaded = true;

            SfUtility.outputLog(
                `TemplateFolderNode: loaded ${entries.length} items from ${this.entry.path}`,
                null, debugLevel.info,
            );
            return this._children;
        } catch (err) {
            SfUtility.outputLog(`TemplateFolderNode: failed to load files from ${this.entry.path}`, err, debugLevel.warn);
            this._isLoaded = true;
            this._children = [new TemplateErrorNode(err, this)];
            return this._children;
        }
    }

    invalidate(): void {
        this._children?.forEach(c => c.dispose());
        this._children = undefined;
        this._isLoaded = false;
    }

    dispose(): void {
        this._children?.forEach(c => c.dispose());
        this._children = undefined;
    }
}

/**
 * Template file leaf node — represents a single file in a template.
 * Clicking opens the file content in the VS Code editor.
 */
export class TemplateFileNode implements ITreeNode {
    readonly id: string;
    readonly contextValue: string;
    readonly itemType = 'template-file';
    readonly isLoaded = true;

    constructor(
        private readonly iconService: IconService,
        private readonly repo: TemplateRepo,
        private readonly entry: GitHubEntry,
    ) {
        this.id = `template-file:${repo.name}:${entry.path}`;
        this.contextValue = TemplateFileNode._getContextValue(entry.name);
    }

    getTreeItem(): vscode.TreeItem {
        const item = new vscode.TreeItem(this.entry.name, vscode.TreeItemCollapsibleState.None);
        item.id = this.id;
        item.contextValue = this.contextValue;
        item.iconPath = this._getFileIcon();
        item.tooltip = `${this.entry.path}\nClick to open in editor`;

        if (this.entry.size !== undefined) {
            const sizeKb = (this.entry.size / 1024).toFixed(1);
            item.description = `${sizeKb} KB`;
        }

        // Click opens the template file in the editor
        item.command = {
            command: 'sfClusterExplorer.openTemplateFile',
            title: 'Open Template File',
            arguments: [{
                repoName: this.repo.name,
                repoUrl: this.repo.url,
                repoBranch: this.repo.branch,
                filePath: this.entry.path,
                fileName: this.entry.name,
            }],
        };

        return item;
    }

    async getChildren(): Promise<undefined> { return undefined; }
    invalidate(): void {}
    dispose(): void {}

    /** Derive context value from file extension for menu targeting */
    private static _getContextValue(fileName: string): string {
        const lower = fileName.toLowerCase();
        if (lower.endsWith('.json')) { return 'template-file-json'; }
        if (lower.endsWith('.md')) { return 'template-file-md'; }
        if (lower.endsWith('.ps1') || lower.endsWith('.sh')) { return 'template-file-script'; }
        return 'template-file';
    }

    /** Choose an appropriate icon based on file extension */
    private _getFileIcon(): vscode.ThemeIcon {
        const lower = this.entry.name.toLowerCase();
        if (lower.endsWith('.json')) {
            return this.iconService.getStaticIcon('json', 'charts.green');
        }
        if (lower.endsWith('.md')) {
            return this.iconService.getStaticIcon('markdown', 'charts.blue');
        }
        if (lower.endsWith('.ps1') || lower.endsWith('.sh')) {
            return this.iconService.getStaticIcon('terminal', 'charts.purple');
        }
        if (lower.endsWith('.bicep')) {
            return this.iconService.getStaticIcon('file-code', 'charts.orange');
        }
        return this.iconService.getPlainIcon('file');
    }
}

/**
 * Error placeholder node for template loading failures.
 */
export class TemplateErrorNode implements ITreeNode {
    readonly id: string;
    readonly contextValue = undefined;
    readonly itemType = 'template-error';
    readonly isLoaded = true;

    private readonly message: string;

    constructor(error: unknown, private readonly parent: ITreeNode) {
        this.message = error instanceof Error ? error.message : String(error);
        this.id = `template-error:${parent.id}:${Date.now()}`;
    }

    getTreeItem(): vscode.TreeItem {
        const item = new vscode.TreeItem(
            `Error: ${this.message}`,
            vscode.TreeItemCollapsibleState.None,
        );
        item.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('testing.iconFailed'));
        item.tooltip = `Failed to load data.\n\n${this.message}`;
        return item;
    }

    async getChildren(): Promise<undefined> { return undefined; }
    invalidate(): void {}
    dispose(): void {}
}
