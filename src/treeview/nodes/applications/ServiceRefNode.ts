/**
 * ServiceRefNode — tree node for a service reference in a SF project.
 * 
 * Shows service manifest name, type, and kind (Stateful/Stateless).
 */

import * as vscode from 'vscode';
import { ServiceReference } from '../../../types/ProjectTypes';
import { ManifestNode } from '../shared/ManifestNode';

export class ServiceRefNode extends vscode.TreeItem {
    readonly contextValue = 'serviceRef';

    constructor(
        public readonly service: ServiceReference,
        private readonly parentSfprojPath: string,
    ) {
        super(
            service.defaultServiceName || service.serviceManifestName,
            service.serviceManifestPath
                ? vscode.TreeItemCollapsibleState.Collapsed
                : vscode.TreeItemCollapsibleState.None,
        );

        this.id = `serviceRef:${parentSfprojPath}:${service.serviceManifestName}`;
        this.description = service.serviceTypeName
            ? `${service.serviceKind || ''} · ${service.serviceTypeName}`
            : `v${service.serviceManifestVersion}`;

        this.tooltip = new vscode.MarkdownString(
            `**${service.serviceManifestName}** v${service.serviceManifestVersion}\n\n` +
            (service.serviceTypeName ? `Type: ${service.serviceTypeName}\n\n` : '') +
            (service.serviceKind ? `Kind: ${service.serviceKind}\n\n` : '') +
            (service.serviceProjectPath ? `Project: ${service.serviceProjectPath}` : '')
        );

        // Stateful = database icon, Stateless = globe icon
        this.iconPath = service.serviceKind === 'Stateful'
            ? new vscode.ThemeIcon('database', new vscode.ThemeColor('charts.purple'))
            : new vscode.ThemeIcon('globe', new vscode.ThemeColor('charts.green'));

        if (service.serviceProjectPath) {
            this.resourceUri = vscode.Uri.file(service.serviceProjectPath);
        }
    }

    getChildren(): vscode.TreeItem[] {
        if (!this.service.serviceManifestPath) { return []; }
        return [new ManifestNode(this.service.serviceManifestPath, 'ServiceManifest.xml')];
    }
}
