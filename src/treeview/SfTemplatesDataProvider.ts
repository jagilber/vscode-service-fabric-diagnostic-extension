/**
 * SfTemplatesDataProvider — TreeDataProvider for the "ARM Template Deployment" view.
 *
 * Displays ARM deployment templates from configured GitHub repositories.
 * Uses the same ITreeNode interface as SfTreeDataProvider so node patterns
 * (lazy loading, error handling, icon resolution) are consistent.
 *
 * Unlike the cluster view, this provider does NOT require a connected cluster.
 * It fetches template metadata from GitHub (or bundled fallback) independently.
 */

import * as vscode from 'vscode';
import { ITreeNode } from './ITreeNode';
import { IconService } from './IconService';
import { TemplateService } from '../services/TemplateService';
import { TemplateRepoNode } from './nodes/templates/TemplateNodes';
import { SfUtility, debugLevel } from '../sfUtility';

export class SfTemplatesDataProvider implements vscode.TreeDataProvider<ITreeNode>, vscode.Disposable {
    private readonly _onDidChangeTreeData = new vscode.EventEmitter<ITreeNode | undefined | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private readonly view: vscode.TreeView<ITreeNode>;
    private readonly iconService = new IconService();
    private roots: ITreeNode[] | undefined;

    constructor(extensionContext: vscode.ExtensionContext) {
        this.view = vscode.window.createTreeView('serviceFabricTemplatesView', {
            treeDataProvider: this,
            showCollapseAll: true,
        });

        extensionContext.subscriptions.push(this.view);
    }

    // ── TreeDataProvider interface ──────────────────────────────────────

    getTreeItem(element: ITreeNode): vscode.TreeItem {
        return element.getTreeItem();
    }

    async getChildren(element?: ITreeNode): Promise<ITreeNode[] | undefined> {
        if (!element) {
            return this._getRoots();
        }
        return element.getChildren();
    }

    // ── Public API ──────────────────────────────────────────────────────

    /** Clear template cache and refresh the entire tree. */
    refresh(): void {
        TemplateService.getInstance().clearCache();
        // Invalidate all root nodes so children re-fetch
        if (this.roots) {
            for (const root of this.roots) {
                root.invalidate();
            }
        }
        this.roots = undefined;
        this._onDidChangeTreeData.fire();
        SfUtility.outputLog('SfTemplatesDataProvider: refreshed', null, debugLevel.info);
    }

    dispose(): void {
        this._onDidChangeTreeData.dispose();
        if (this.roots) {
            for (const root of this.roots) {
                root.dispose();
            }
        }
        this.view.dispose();
    }

    // ── Private ────────────────────────────────────────────────────────

    private _getRoots(): ITreeNode[] {
        if (this.roots) { return this.roots; }

        const service = TemplateService.getInstance();
        const repos = service.getConfiguredRepos();

        if (!repos || repos.length === 0) {
            SfUtility.outputLog('SfTemplatesDataProvider: no template repositories configured', null, debugLevel.warn);
            this.roots = [];
            return this.roots;
        }

        this.roots = repos.map(repo => new TemplateRepoNode(this.iconService, repo));
        SfUtility.outputLog(
            `SfTemplatesDataProvider: created ${this.roots.length} repo root nodes`,
            null, debugLevel.info,
        );
        return this.roots;
    }
}
