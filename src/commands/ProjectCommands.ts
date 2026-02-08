/**
 * Project command handlers for the Service Fabric Applications view.
 * 
 * Commands: build, package, deploy, refresh, open manifest.
 */

import * as vscode from 'vscode';
import { SfMgr } from '../sfMgr';
import { SfUtility, debugLevel } from '../sfUtility';
import { registerCommandWithErrorHandling } from '../utils/CommandUtils';
import { SfProjectService } from '../services/SfProjectService';
import { SfDeployService } from '../services/SfDeployService';
import { SfApplicationsDataProvider } from '../treeview/SfApplicationsDataProvider';
import { SfProjectNode } from '../treeview/nodes/SfProjectNode';
import { ProfileNode } from '../treeview/nodes/ProfileNode';
import { DeployOptions } from '../types/ProjectTypes';

export function registerProjectCommands(
    context: vscode.ExtensionContext,
    sfMgr: SfMgr,
    projectService: SfProjectService,
    deployService: SfDeployService,
    applicationsProvider: SfApplicationsDataProvider,
): void {

    // -----------------------------------------------------------------------
    // sfApplications.refresh — refresh the applications tree
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'sfApplications.refresh',
        async () => {
            applicationsProvider.refresh();
        },
        'refresh projects',
    );

    // -----------------------------------------------------------------------
    // sfApplications.buildProject — build/package a .sfproj project
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'sfApplications.buildProject',
        async (node?: SfProjectNode) => {
            const project = node?.project;
            if (!project) {
                // Try to pick from discovered projects
                const projects = await projectService.discoverProjects();
                if (projects.length === 0) {
                    vscode.window.showWarningMessage('No .sfproj projects found in workspace.');
                    return;
                }

                const picked = await vscode.window.showQuickPick(
                    projects.map(p => ({
                        label: p.appTypeName,
                        description: `v${p.appTypeVersion}`,
                        detail: p.sfprojPath,
                        project: p,
                    })),
                    { placeHolder: 'Select project to build' },
                );
                if (!picked) { return; }
                
                const result = await deployService.buildProject(picked.project);
                if (result.success) {
                    vscode.window.showInformationMessage(`Build launched for ${picked.label}. Check terminal for output.`);
                } else {
                    vscode.window.showErrorMessage(`Build failed: ${result.errors.join(', ')}`);
                }
                return;
            }

            const method = await vscode.window.showQuickPick(
                [
                    { label: 'MSBuild', description: 'msbuild /t:Package', value: 'msbuild' as const },
                    { label: 'dotnet', description: 'dotnet build', value: 'dotnet' as const },
                ],
                { placeHolder: 'Select build method' },
            );
            if (!method) { return; }

            const result = await deployService.buildProject(project, method.value);
            if (result.success) {
                vscode.window.showInformationMessage(`Build launched for ${project.appTypeName}. Check terminal for output.`);
            } else {
                vscode.window.showErrorMessage(`Build failed: ${result.errors.join(', ')}`);
            }
        },
        'build project',
    );

    // -----------------------------------------------------------------------
    // sfApplications.deployProject — deploy a project to a cluster
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'sfApplications.deployProject',
        async (node?: SfProjectNode) => {
            // Get the project
            let project = node?.project;
            if (!project) {
                const projects = await projectService.discoverProjects();
                if (projects.length === 0) {
                    vscode.window.showWarningMessage('No .sfproj projects found in workspace.');
                    return;
                }

                const picked = await vscode.window.showQuickPick(
                    projects.map(p => ({
                        label: p.appTypeName,
                        description: `v${p.appTypeVersion}`,
                        detail: p.sfprojPath,
                        project: p,
                    })),
                    { placeHolder: 'Select project to deploy' },
                );
                if (!picked) { return; }
                project = picked.project;
            }

            // Need an active cluster to deploy to
            const activeCluster = sfMgr.getActiveCluster();
            if (!activeCluster) {
                vscode.window.showWarningMessage('No active cluster. Connect to a cluster first.');
                return;
            }

            // Choose deploy method
            const deployMethodChoice = await vscode.window.showQuickPick(
                [
                    { label: 'REST API', description: 'Upload → Provision → Create (direct HTTP)', value: 'rest' as const },
                    { label: 'PowerShell', description: 'SF SDK cmdlets (requires SF SDK)', value: 'powershell' as const },
                ],
                { placeHolder: 'Select deploy method' },
            );
            if (!deployMethodChoice) { return; }

            // Find package path
            const packagePath = deployService.findPackagePath(project);
            if (!packagePath) {
                const buildFirst = await vscode.window.showWarningMessage(
                    `No packaged output found for ${project.appTypeName}. Build first?`,
                    'Build',
                    'Cancel',
                );
                if (buildFirst === 'Build') {
                    await vscode.commands.executeCommand('sfApplications.buildProject', node);
                }
                return;
            }

            // Choose parameter file if available
            let parameters: Record<string, string> = {};
            if (project.parameterFiles.length > 0) {
                const paramChoice = await vscode.window.showQuickPick(
                    [
                        { label: '(Default values)', description: 'Use manifest defaults', paramFile: undefined },
                        ...project.parameterFiles.map(pf => ({
                            label: pf.name,
                            description: `${pf.parameters.length} parameter(s)`,
                            paramFile: pf,
                        })),
                    ],
                    { placeHolder: 'Select parameter file' },
                );
                if (!paramChoice) { return; }
                if (paramChoice.paramFile) {
                    for (const p of paramChoice.paramFile.parameters) {
                        parameters[p.name] = p.value;
                    }
                }
            }

            const options: DeployOptions = {
                appName: `fabric:/${project.appTypeName}`,
                typeName: project.appTypeName,
                typeVersion: project.appTypeVersion,
                parameters,
                clusterEndpoint: activeCluster.endpoint,
                upgrade: false,
            };

            if (deployMethodChoice.value === 'rest') {
                await deployService.deployToCluster(activeCluster.sfRest, options, packagePath);
            } else {
                // PowerShell deploy — pick a profile
                let profile = project.profiles[0];
                if (project.profiles.length > 1) {
                    const profileChoice = await vscode.window.showQuickPick(
                        project.profiles.map(p => ({
                            label: p.name,
                            description: p.connectionEndpoint || 'no endpoint',
                            profile: p,
                        })),
                        { placeHolder: 'Select publish profile' },
                    );
                    if (!profileChoice) { return; }
                    profile = profileChoice.profile;
                }
                if (profile) {
                    await deployService.deployWithPowerShell(project, profile, packagePath);
                }
            }
        },
        'deploy project',
    );

    // -----------------------------------------------------------------------
    // sfApplications.openManifest — open a manifest file from context
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'sfApplications.openManifest',
        async (node?: SfProjectNode) => {
            if (node?.project?.manifestPath) {
                await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(node.project.manifestPath));
            }
        },
        'open manifest',
    );
}
