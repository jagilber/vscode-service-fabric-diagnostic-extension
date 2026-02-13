/**
 * SfProjectNode — root tree node for a discovered .sfproj project.
 * 
 * Children: services group, parameters group, profiles group, manifest file.
 */

import * as vscode from 'vscode';
import { SfProjectInfo } from '../../../types/ProjectTypes';
import { ServiceRefNode } from './ServiceRefNode';
import { ManifestNode } from '../shared/ManifestNode';
import { ParameterFileNode } from './ParameterFileNode';
import { ProfileNode } from './ProfileNode';

export class SfProjectNode extends vscode.TreeItem {
    readonly contextValue: string;

    constructor(public readonly project: SfProjectInfo) {
        super(project.appTypeName || 'Unknown App', vscode.TreeItemCollapsibleState.Collapsed);
        this.id = `sfProject:${project.sfprojPath}`;
        this.contextValue = project.isExternal ? 'sfProjectExternal' : 'sfProject';

        const versionLabel = `v${project.appTypeVersion}`;
        this.description = project.isExternal ? `${versionLabel} (external)` : versionLabel;

        const relativePath = vscode.workspace.asRelativePath(project.sfprojPath, false);
        this.tooltip = new vscode.MarkdownString(
            `**${project.appTypeName}** v${project.appTypeVersion}\n\n` +
            `Services: ${project.services.length}\n\n` +
            `Path: ${relativePath}` +
            (project.isExternal ? '\n\n_(external project)_' : '')
        );
        this.iconPath = project.isExternal
            ? new vscode.ThemeIcon('package', new vscode.ThemeColor('charts.orange'))
            : new vscode.ThemeIcon('package', new vscode.ThemeColor('charts.blue'));
        this.resourceUri = vscode.Uri.file(project.sfprojPath);
    }

    getChildren(): vscode.TreeItem[] {
        const children: vscode.TreeItem[] = [];

        // Manifest file
        children.push(new ManifestNode(this.project.manifestPath, 'ApplicationManifest.xml'));

        // Services group
        if (this.project.services.length > 0) {
            children.push(new ServicesGroupNode(this.project));
        }

        // Parameters group
        if (this.project.parameterFiles.length > 0) {
            children.push(new ParametersGroupNode(this.project));
        }

        // Profiles group  
        if (this.project.profiles.length > 0) {
            children.push(new ProfilesGroupNode(this.project));
        }

        return children;
    }
}

/**
 * Group node for services under a project.
 */
export class ServicesGroupNode extends vscode.TreeItem {
    readonly contextValue = 'servicesGroup';

    constructor(private readonly project: SfProjectInfo) {
        super(`Services (${project.services.length})`, vscode.TreeItemCollapsibleState.Collapsed);
        this.id = `servicesGroup:${project.sfprojPath}`;
        this.iconPath = new vscode.ThemeIcon('symbol-class');
    }

    getChildren(): vscode.TreeItem[] {
        return this.project.services.map(svc => new ServiceRefNode(svc, this.project.sfprojPath));
    }
}

/**
 * Group node for parameter files under a project.
 */
export class ParametersGroupNode extends vscode.TreeItem {
    readonly contextValue = 'parametersGroup';

    constructor(private readonly project: SfProjectInfo) {
        super(`Parameters (${project.parameterFiles.length})`, vscode.TreeItemCollapsibleState.Collapsed);
        this.id = `parametersGroup:${project.sfprojPath}`;
        this.iconPath = new vscode.ThemeIcon('symbol-parameter');
    }

    getChildren(): vscode.TreeItem[] {
        return this.project.parameterFiles.map(pf => new ParameterFileNode(pf));
    }
}

/**
 * Group node for publish profiles under a project.
 */
export class ProfilesGroupNode extends vscode.TreeItem {
    readonly contextValue = 'profilesGroup';

    constructor(private readonly project: SfProjectInfo) {
        super(`Publish Profiles (${project.profiles.length})`, vscode.TreeItemCollapsibleState.Collapsed);
        this.id = `profilesGroup:${project.sfprojPath}`;
        this.iconPath = new vscode.ThemeIcon('cloud-upload');
    }

    getChildren(): vscode.TreeItem[] {
        return this.project.profiles.map(p => new ProfileNode(p));
    }
}
