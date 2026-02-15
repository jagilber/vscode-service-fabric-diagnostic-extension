/**
 * Project command handlers for the Service Fabric Applications view.
 * 
 * Commands: build, package, deploy, remove, upgrade, refresh, open manifest.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { SfMgr } from '../sfMgr';
import { SfUtility, debugLevel } from '../sfUtility';
import { registerCommandWithErrorHandling } from '../utils/CommandUtils';
import { SfProjectService } from '../services/SfProjectService';
import { SfDeployService } from '../services/SfDeployService';
import { SfManifestValidator } from '../services/SfManifestValidator';
import { SfApplicationsDataProvider } from '../treeview/SfApplicationsDataProvider';
import { SfProjectNode } from '../treeview/nodes/applications/SfProjectNode';
import { ProfileNode } from '../treeview/nodes/applications/ProfileNode';
import { ManifestNode } from '../treeview/nodes/shared/ManifestNode';
import { DeployOptions, DeployMethod } from '../types/ProjectTypes';
import { SfConfiguration } from '../sfConfiguration';
import { SfExtSettings, sfExtSettingsList } from '../sfExtSettings';

export function registerProjectCommands(
    context: vscode.ExtensionContext,
    sfMgr: SfMgr,
    projectService: SfProjectService,
    deployService: SfDeployService,
    applicationsProvider: SfApplicationsDataProvider,
    manifestValidator?: SfManifestValidator,
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

                const method = await resolveBuildMethod();
                if (!method) { return; }
                const result = await deployService.buildProject(picked.project, method);
                if (result.success) {
                    vscode.window.showInformationMessage(`Build launched for ${picked.label}. Check terminal for output.`);
                } else {
                    vscode.window.showErrorMessage(`Build failed: ${result.errors.join(', ')}`);
                }
                return;
            }

            const method = await resolveBuildMethod();
            if (!method) { return; }

            const result = await deployService.buildProject(project, method);
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
            SfUtility.outputLog('deployProject: command invoked', { hasNode: !!node, nodeProject: !!node?.project }, debugLevel.info);
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

            // Pick a cluster to deploy to (active cluster or choose from configured)
            const cluster = await pickCluster(sfMgr);
            if (!cluster) { SfUtility.outputLog('deployProject: no cluster selected, aborting', null, debugLevel.info); return; }
            SfUtility.outputLog(`deployProject: cluster selected: ${cluster.endpoint}`, null, debugLevel.info);

            // Choose deploy method — use setting default, prompt only when set to 'ask'
            const deployMethodSetting = SfExtSettings.getSetting(sfExtSettingsList.deployMethod) as string || 'rest';
            let deployMethod: 'rest' | 'powershell';
            if (deployMethodSetting === 'ask') {
                const deployMethodChoice = await vscode.window.showQuickPick(
                    [
                        { label: 'REST API', description: 'Upload → Provision → Create (direct HTTP)', value: 'rest' as const },
                        { label: 'PowerShell', description: 'SF SDK cmdlets (requires SF SDK)', value: 'powershell' as const },
                    ],
                    { placeHolder: 'Select deploy method' },
                );
                if (!deployMethodChoice) { return; }
                deployMethod = deployMethodChoice.value;
            } else {
                deployMethod = deployMethodSetting === 'powershell' ? 'powershell' : 'rest';
            }

            // Find package path
            SfUtility.outputLog(`deployProject: method=${deployMethod}, looking for package`, null, debugLevel.info);
            const packagePath = deployService.findPackagePath(project);
            if (!packagePath) {
                SfUtility.outputLog(`deployProject: no package found for ${project.appTypeName}`, null, debugLevel.warn);
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
            SfUtility.outputLog(`deployProject: packagePath=${packagePath}`, null, debugLevel.info);

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
                clusterEndpoint: cluster.endpoint,
                upgrade: false,
            };

            if (deployMethod === 'rest') {
                await deployService.deployToCluster(cluster.sfRest, options, packagePath);
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
    // sfApplications.removeFromCluster — remove deployed app from cluster
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'sfApplications.removeFromCluster',
        async (node?: SfProjectNode) => {
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
                    { placeHolder: 'Select project to remove from cluster' },
                );
                if (!picked) { return; }
                project = picked.project;
            }

            const cluster = await pickCluster(sfMgr);
            if (!cluster) { return; }

            const appName = `fabric:/${project.appTypeName}`;
            const confirm = await vscode.window.showWarningMessage(
                `Remove ${appName} (${project.appTypeName} v${project.appTypeVersion}) from ${cluster.endpoint}?`,
                { modal: true },
                'Remove',
            );
            if (confirm !== 'Remove') { return; }

            await deployService.removeFromCluster(
                cluster.sfRest,
                appName,
                project.appTypeName,
                project.appTypeVersion,
            );
        },
        'remove from cluster',
    );

    // -----------------------------------------------------------------------
    // sfApplications.upgradeApplication — rolling upgrade to cluster
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'sfApplications.upgradeApplication',
        async (node?: SfProjectNode) => {
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
                    { placeHolder: 'Select project to upgrade' },
                );
                if (!picked) { return; }
                project = picked.project;
            }

            const cluster = await pickCluster(sfMgr);
            if (!cluster) { return; }

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
                    { placeHolder: 'Select parameter file for upgrade' },
                );
                if (!paramChoice) { return; }
                if (paramChoice.paramFile) {
                    for (const p of paramChoice.paramFile.parameters) {
                        parameters[p.name] = p.value;
                    }
                }
            }

            // Choose upgrade settings from profile or defaults
            let upgradeSettings = project.profiles.find(p => p.upgradeSettings?.enabled)?.upgradeSettings;
            if (project.profiles.length > 0) {
                const profileChoice = await vscode.window.showQuickPick(
                    [
                        { label: '(Default settings)', description: 'Monitored, Rollback on failure', profile: undefined },
                        ...project.profiles
                            .filter(p => p.upgradeSettings)
                            .map(p => ({
                                label: p.name,
                                description: `Mode: ${p.upgradeSettings?.mode || 'Monitored'}`,
                                profile: p,
                            })),
                    ],
                    { placeHolder: 'Select upgrade settings' },
                );
                if (!profileChoice) { return; }
                if (profileChoice.profile) {
                    upgradeSettings = profileChoice.profile.upgradeSettings;
                }
            }

            const options: DeployOptions = {
                appName: `fabric:/${project.appTypeName}`,
                typeName: project.appTypeName,
                typeVersion: project.appTypeVersion,
                parameters,
                clusterEndpoint: cluster.endpoint,
                upgrade: true,
            };

            await deployService.upgradeApplication(cluster.sfRest, options, packagePath, upgradeSettings);
        },
        'upgrade application',
    );

    // -----------------------------------------------------------------------
    // sfApplications.deployWithProfile — deploy using a specific publish profile
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'sfApplications.deployWithProfile',
        async (node?: ProfileNode) => {
            if (!node?.profile) {
                vscode.window.showWarningMessage('No profile selected.');
                return;
            }

            // Find the project that owns this profile
            const projects = await projectService.discoverProjects();
            const project = projects.find(p =>
                p.profiles.some(pr => pr.path === node.profile.path)
            );
            if (!project) {
                vscode.window.showWarningMessage('Could not find project for this profile.');
                return;
            }

            // Find package path
            const packagePath = deployService.findPackagePath(project);
            if (!packagePath) {
                const buildFirst = await vscode.window.showWarningMessage(
                    `No packaged output found for ${project.appTypeName}. Build first?`,
                    'Build',
                    'Cancel',
                );
                if (buildFirst === 'Build') {
                    await vscode.commands.executeCommand('sfApplications.buildProject');
                }
                return;
            }

            // Use profile's connection endpoint if available, otherwise pick a cluster
            let cluster: { endpoint: string; sfRest: any } | undefined;
            if (node.profile.connectionEndpoint) {
                // Try to find a matching configured cluster
                const configs = sfMgr.getSfConfigs();
                const matchingConfig = configs.find((c: SfConfiguration) =>
                    c.getClusterEndpoint().includes(node.profile.connectionEndpoint || '')
                );
                if (matchingConfig) {
                    await matchingConfig.ensureRestClientReady();
                    cluster = { endpoint: matchingConfig.getClusterEndpoint(), sfRest: matchingConfig.getSfRest() };
                }
            }
            if (!cluster) {
                cluster = await pickCluster(sfMgr);
                if (!cluster) { return; }
            }

            // Load parameters from the profile's parameter file
            let parameters: Record<string, string> = {};
            if (node.profile.parameterFilePath) {
                const paramFile = project.parameterFiles.find(pf => pf.path === node.profile.parameterFilePath);
                if (paramFile) {
                    for (const p of paramFile.parameters) {
                        parameters[p.name] = p.value;
                    }
                }
            }

            const options: DeployOptions = {
                appName: `fabric:/${project.appTypeName}`,
                typeName: project.appTypeName,
                typeVersion: project.appTypeVersion,
                parameters,
                clusterEndpoint: cluster.endpoint,
                publishProfile: node.profile,
                upgrade: node.profile.upgradeSettings?.enabled || false,
            };

            if (options.upgrade && node.profile.upgradeSettings) {
                await deployService.upgradeApplication(cluster.sfRest, options, packagePath, node.profile.upgradeSettings);
            } else {
                await deployService.deployToCluster(cluster.sfRest, options, packagePath);
            }
        },
        'deploy with profile',
    );

    // -----------------------------------------------------------------------
    // sfApplications.openProjectInCode — open project folder in VS Code
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'sfApplications.openProjectInCode',
        async (node?: SfProjectNode) => {
            if (node?.project?.projectDir) {
                const folderUri = vscode.Uri.file(node.project.projectDir);
                await vscode.commands.executeCommand('vscode.openFolder', folderUri, { forceNewWindow: true });
            }
        },
        'open project in code',
    );

    // -----------------------------------------------------------------------
    // sfApplications.validateManifest — validate manifest XML against XSD
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'sfApplications.validateManifest',
        async (node?: SfProjectNode | ManifestNode) => {
            if (!manifestValidator) {
                vscode.window.showWarningMessage('Manifest validator is not available.');
                return;
            }

            // If invoked on a ManifestNode, validate that single file
            if (node instanceof ManifestNode) {
                const valid = await manifestValidator.validateFile(node.manifestPath);
                if (valid) {
                    vscode.window.showInformationMessage(`${node.label}: valid`);
                } else {
                    vscode.window.showWarningMessage(`${node.label}: validation errors found. See Problems panel.`);
                }
                return;
            }

            // If invoked on a SfProjectNode, validate all manifests in the project
            if (node instanceof SfProjectNode && node.project) {
                const svcPaths = node.project.services
                    .map(s => s.serviceManifestPath)
                    .filter((p): p is string => !!p);

                const errorCount = await manifestValidator.validateProject(
                    node.project.manifestPath,
                    svcPaths,
                );

                const totalFiles = 1 + svcPaths.length;
                if (errorCount === 0) {
                    vscode.window.showInformationMessage(
                        `${node.project.appTypeName}: all ${totalFiles} manifest(s) valid`,
                    );
                } else {
                    vscode.window.showWarningMessage(
                        `${node.project.appTypeName}: ${errorCount} of ${totalFiles} manifest(s) have errors. See Problems panel.`,
                    );
                }
                return;
            }

            // If no node, try to validate the active editor file
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
                const fileName = path.basename(activeEditor.document.fileName);
                if (fileName.toLowerCase().endsWith('manifest.xml')) {
                    const valid = await manifestValidator.validateFile(activeEditor.document.fileName);
                    if (valid) {
                        vscode.window.showInformationMessage(`${fileName}: valid`);
                    } else {
                        vscode.window.showWarningMessage(`${fileName}: validation errors found. See Problems panel.`);
                    }
                    return;
                }
            }

            // Fallback: pick a project to validate
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
                { placeHolder: 'Select project to validate' },
            );
            if (!picked) { return; }

            const svcPaths = picked.project.services
                .map(s => s.serviceManifestPath)
                .filter((p): p is string => !!p);

            const errorCount = await manifestValidator.validateProject(
                picked.project.manifestPath,
                svcPaths,
            );

            const totalFiles = 1 + svcPaths.length;
            if (errorCount === 0) {
                vscode.window.showInformationMessage(
                    `${picked.label}: all ${totalFiles} manifest(s) valid`,
                );
            } else {
                vscode.window.showWarningMessage(
                    `${picked.label}: ${errorCount} of ${totalFiles} manifest(s) have errors. See Problems panel.`,
                );
            }
        },
        'validate manifest',
    );

    // -----------------------------------------------------------------------
    // sfApplications.addExternalProject — browse for .sfproj or folder
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'sfApplications.addExternalProject',
        async () => {
            const choice = await vscode.window.showQuickPick(
                [
                    { label: '$(file) Browse for .sfproj file', value: 'file' as const },
                    { label: '$(folder) Browse for folder (scans for .sfproj files)', value: 'folder' as const },
                ],
                { placeHolder: 'Add external Service Fabric project' },
            );
            if (!choice) { return; }

            if (choice.value === 'file') {
                const uris = await vscode.window.showOpenDialog({
                    canSelectFiles: true,
                    canSelectFolders: false,
                    canSelectMany: true,
                    filters: { 'Service Fabric Project': ['sfproj'] },
                    title: 'Select .sfproj file(s)',
                });
                if (!uris || uris.length === 0) {
                    SfUtility.outputLog('addExternalProject: user cancelled file dialog', null, debugLevel.info);
                    return;
                }

                SfUtility.outputLog(`addExternalProject: user selected ${uris.length} file(s): ${uris.map(u => u.fsPath).join(', ')}`, null, debugLevel.info);
                const results: string[] = [];
                for (const uri of uris) {
                    await projectService.addExternalProjectPath(uri.fsPath);
                    results.push(uri.fsPath);
                }
                applicationsProvider.refresh();

                // Verify the projects actually parsed
                const projects = await projectService.discoverProjects();
                const addedCount = results.filter(r =>
                    projects.some(p => path.resolve(p.sfprojPath) === path.resolve(r))
                ).length;

                if (addedCount > 0) {
                    vscode.window.showInformationMessage(`Added ${addedCount} external project(s)`);
                } else {
                    const failedPaths = results.map(r => path.basename(r)).join(', ');
                    SfUtility.outputLog(`addExternalProject: paths registered but no projects parsed. Check that ApplicationManifest.xml exists next to the .sfproj file.`, null, debugLevel.warn);
                    vscode.window.showWarningMessage(
                        `Registered ${results.length} path(s) but could not parse project(s): ${failedPaths}. ` +
                        `Ensure ApplicationManifest.xml exists in the same directory as the .sfproj file. Check Output panel for details.`
                    );
                }
                return;
            } else {
                const uris = await vscode.window.showOpenDialog({
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: false,
                    title: 'Select folder to scan for .sfproj files',
                });
                if (!uris || uris.length === 0) { return; }

                SfUtility.outputLog(`addExternalProject: user selected folder: ${uris[0].fsPath}`, null, debugLevel.info);
                const added = await projectService.addExternalFolder(uris[0].fsPath);
                if (added > 0) {
                    applicationsProvider.refresh();
                    vscode.window.showInformationMessage(`Found and added ${added} external project(s) from folder`);
                } else {
                    vscode.window.showWarningMessage('No .sfproj files found in the selected folder');
                }
            }
        },
        'add external project',
    );

    // -----------------------------------------------------------------------
    // sfApplications.removeExternalProject — pick and remove an external path
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'sfApplications.removeExternalProject',
        async (node?: SfProjectNode) => {
            if (node?.project?.isExternal) {
                // If invoked from context menu on an external project node
                await projectService.removeExternalProjectPath(node.project.sfprojPath);
                applicationsProvider.refresh();
                vscode.window.showInformationMessage(`Removed external project: ${node.project.appTypeName}`);
                return;
            }

            // Otherwise show a picker of all registered external paths
            const externalPaths = projectService.getExternalProjectPaths();
            if (externalPaths.length === 0) {
                vscode.window.showInformationMessage('No external projects registered');
                return;
            }

            const picks = externalPaths.map(p => ({
                label: path.basename(p, '.sfproj'),
                description: p,
                sfprojPath: p,
            }));

            const selected = await vscode.window.showQuickPick(picks, {
                placeHolder: 'Select external project to remove',
                canPickMany: true,
            });
            if (!selected || selected.length === 0) { return; }

            for (const item of selected) {
                await projectService.removeExternalProjectPath(item.sfprojPath);
            }
            applicationsProvider.refresh();
            vscode.window.showInformationMessage(`Removed ${selected.length} external project(s)`);
        },
        'remove external project',
    );

    // -----------------------------------------------------------------------
    // sfApplications.removeAllProjects — remove all external projects at once
    // -----------------------------------------------------------------------
    registerCommandWithErrorHandling(
        context,
        'sfApplications.removeAllProjects',
        async () => {
            const externalPaths = projectService.getExternalProjectPaths();
            if (externalPaths.length === 0) {
                vscode.window.showInformationMessage('No external projects registered');
                return;
            }

            const confirm = await vscode.window.showWarningMessage(
                `Remove all ${externalPaths.length} external project(s) from the view?`,
                { modal: true },
                'Remove All',
            );
            if (confirm !== 'Remove All') { return; }

            for (const p of externalPaths) {
                await projectService.removeExternalProjectPath(p);
            }
            applicationsProvider.refresh();
            vscode.window.showInformationMessage(`Removed ${externalPaths.length} external project(s)`);
        },
        'remove all projects',
    );
}

/**
 * Resolve build method from the `buildMethod` setting.
 * Returns the method directly, or shows a picker when set to 'ask'.
 * Returns undefined if the user cancels the picker.
 */
async function resolveBuildMethod(): Promise<DeployMethod | undefined> {
    const buildMethodSetting = SfExtSettings.getSetting(sfExtSettingsList.buildMethod) as string || 'msbuild';
    SfUtility.outputLog(`resolveBuildMethod: setting=${buildMethodSetting}`, null, debugLevel.info);

    if (buildMethodSetting === 'ask') {
        const picked = await vscode.window.showQuickPick(
            [
                { label: 'MSBuild', description: 'msbuild /t:Package — produces valid SF package (recommended)', value: 'msbuild' as DeployMethod },
                { label: 'dotnet', description: 'dotnet build — compiles only, no SF package layout', value: 'dotnet' as DeployMethod },
            ],
            { placeHolder: 'Select build method' },
        );
        if (!picked) { return undefined; }
        SfUtility.outputLog(`resolveBuildMethod: user picked ${picked.value}`, null, debugLevel.info);
        return picked.value;
    }

    const method: DeployMethod = buildMethodSetting === 'dotnet' ? 'dotnet' : 'msbuild';
    SfUtility.outputLog(`resolveBuildMethod: using setting value=${method}`, null, debugLevel.info);
    return method;
}

/**
 * Pick a cluster to deploy to. Uses active cluster if available,
 * otherwise shows a picker of all configured clusters.
 */
async function pickCluster(sfMgr: SfMgr): Promise<{ endpoint: string; sfRest: any } | undefined> {
    const activeCluster = sfMgr.getActiveCluster();
    const configs = sfMgr.getSfConfigs();
    SfUtility.outputLog(`pickCluster: activeCluster=${activeCluster?.endpoint || 'none'}, configs=${configs.length}`, null, debugLevel.info);

    if (configs.length === 0 && !activeCluster) {
        SfUtility.outputLog('pickCluster: no clusters configured', null, debugLevel.warn);
        vscode.window.showWarningMessage('No clusters configured. Add a cluster endpoint first.');
        return undefined;
    }

    let selectedConfig: SfConfiguration | undefined;

    // If only one cluster, use it directly
    if (configs.length === 1) {
        selectedConfig = configs[0];
        SfUtility.outputLog(`pickCluster: single cluster, auto-selecting ${selectedConfig.getClusterEndpoint()}`, null, debugLevel.info);
    }
    // If there's an active cluster and it's the only one, use it
    else if (activeCluster && configs.length <= 1) {
        selectedConfig = configs.find(c => c.getClusterEndpoint() === activeCluster.endpoint);
        if (!selectedConfig) {
            // activeCluster exists but no matching config — return as-is (legacy path)
            return activeCluster;
        }
    } else {
        // Multiple clusters — let user pick
        const items = configs.map((c: SfConfiguration) => {
            const ep = c.getClusterEndpoint();
            const isActive = activeCluster && ep === activeCluster.endpoint;
            const isLocal = ep.includes('localhost') || ep.includes('127.0.0.1');
            return {
                label: isActive ? `$(check) ${ep}` : ep,
                description: isActive ? '(active)' : isLocal ? '(local)' : '',
                config: c,
            };
        });

        // Sort: active first, then local, then others
        items.sort((a, b) => {
            if (a.description === '(active)') { return -1; }
            if (b.description === '(active)') { return 1; }
            if (a.description === '(local)') { return -1; }
            if (b.description === '(local)') { return 1; }
            return 0;
        });

        const picked = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select target cluster (active cluster is pre-selected)',
        });
        if (!picked) { return undefined; }
        selectedConfig = picked.config;
    }

    // Ensure REST client is configured with correct endpoint + certificate before returning
    SfUtility.outputLog(`pickCluster: ensuring REST client ready for ${selectedConfig.getClusterEndpoint()}`, null, debugLevel.info);
    await selectedConfig.ensureRestClientReady();

    return { endpoint: selectedConfig.getClusterEndpoint(), sfRest: selectedConfig.getSfRest() };
}
