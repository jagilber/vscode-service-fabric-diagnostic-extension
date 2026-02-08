/**
 * ManifestNode — tree node for an XML manifest file (Application or Service).
 * 
 * Clicking opens the file in the editor.
 */

import * as vscode from 'vscode';

export class ManifestNode extends vscode.TreeItem {
    readonly contextValue = 'manifest';

    constructor(
        public readonly manifestPath: string,
        label: string,
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.id = `manifest:${manifestPath}`;
        this.tooltip = manifestPath;
        this.iconPath = new vscode.ThemeIcon('file-code');
        this.resourceUri = vscode.Uri.file(manifestPath);

        // Click opens the manifest file in the editor
        this.command = {
            command: 'vscode.open',
            title: 'Open Manifest',
            arguments: [vscode.Uri.file(manifestPath)],
        };
    }
}
