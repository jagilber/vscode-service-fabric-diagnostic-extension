/**
 * ProfileNode — tree node for a PublishProfiles/*.xml publish profile.
 * 
 * Shows the profile name, connection endpoint, and upgrade settings.
 * Clicking opens the profile file in the editor.
 */

import * as vscode from 'vscode';
import { PublishProfileInfo } from '../../../types/ProjectTypes';

export class ProfileNode extends vscode.TreeItem {
    readonly contextValue = 'publishProfile';

    constructor(public readonly profile: PublishProfileInfo) {
        super(profile.name, vscode.TreeItemCollapsibleState.None);
        this.id = `profile:${profile.path}`;
        this.description = profile.connectionEndpoint || 'no endpoint';

        const lines: string[] = [`**${profile.name}**`];
        if (profile.connectionEndpoint) {
            lines.push(`\nEndpoint: \`${profile.connectionEndpoint}\``);
        }
        if (profile.parameterFilePath) {
            lines.push(`\nParameters: ${profile.parameterFilePath}`);
        }
        if (profile.upgradeSettings) {
            lines.push(`\nUpgrade: ${profile.upgradeSettings.enabled ? 'Enabled' : 'Disabled'}`);
            if (profile.upgradeSettings.mode) {
                lines.push(` (${profile.upgradeSettings.mode})`);
            }
        }

        this.tooltip = new vscode.MarkdownString(lines.join('\n'));
        this.iconPath = new vscode.ThemeIcon('rocket', new vscode.ThemeColor('charts.orange'));
        this.resourceUri = vscode.Uri.file(profile.path);

        // Click opens the profile file
        this.command = {
            command: 'vscode.open',
            title: 'Open Publish Profile',
            arguments: [vscode.Uri.file(profile.path)],
        };
    }
}
