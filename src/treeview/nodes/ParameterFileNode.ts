/**
 * ParameterFileNode — tree node for an ApplicationParameters/*.xml file.
 * 
 * Shows the parameter file name and count of parameter overrides.
 * Clicking opens the file in the editor.
 */

import * as vscode from 'vscode';
import { ParameterFileInfo } from '../../types/ProjectTypes';

export class ParameterFileNode extends vscode.TreeItem {
    readonly contextValue = 'parameterFile';

    constructor(public readonly paramFile: ParameterFileInfo) {
        super(paramFile.name, vscode.TreeItemCollapsibleState.None);
        this.id = `paramFile:${paramFile.path}`;
        this.description = `${paramFile.parameters.length} param(s)`;

        const paramList = paramFile.parameters
            .map(p => `- **${p.name}** = \`${p.value}\``)
            .join('\n');

        this.tooltip = new vscode.MarkdownString(
            `**${paramFile.name}**\n\n` +
            (paramFile.applicationName ? `Application: ${paramFile.applicationName}\n\n` : '') +
            (paramList || 'No parameters')
        );

        this.iconPath = new vscode.ThemeIcon('symbol-variable');
        this.resourceUri = vscode.Uri.file(paramFile.path);

        // Click opens the parameter file
        this.command = {
            command: 'vscode.open',
            title: 'Open Parameter File',
            arguments: [vscode.Uri.file(paramFile.path)],
        };
    }
}
