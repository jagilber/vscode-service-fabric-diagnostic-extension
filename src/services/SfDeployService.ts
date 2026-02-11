/**
 * SfDeployService — orchestrates build, package, and deploy of SF applications.
 * 
 * Supports multiple deployment methods:
 * - MSBuild: `msbuild /t:Package` for classic .sfproj builds
 * - dotnet: `dotnet publish` for .NET Core service projects
 * - PowerShell: SF SDK cmdlets (Connect-ServiceFabricCluster, Copy-ServiceFabricApplicationPackage, etc.)
 * - REST API: Direct upload → provision → create via SF REST endpoints
 * 
 * The REST API path is always available; MSBuild/dotnet/PowerShell require
 * those tools to be installed on the machine.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { SfRest } from '../sfRest';
import { SfUtility, debugLevel } from '../sfUtility';
import {
    SfProjectInfo,
    DeployOptions,
    DeployMethod,
    BuildResult,
    PublishProfileInfo,
    UpgradeSettings,
} from '../types/ProjectTypes';

export class SfDeployService implements vscode.Disposable {

    constructor() {}

    // ── Build / Package ────────────────────────────────────────────────

    /**
     * Build and package a Service Fabric application project.
     * Uses `msbuild /t:Package` or `dotnet build` depending on method.
     * Returns the path to the packaged output directory.
     */
    async buildProject(project: SfProjectInfo, method: DeployMethod = 'msbuild'): Promise<BuildResult> {
        const startTime = Date.now();

        try {
            switch (method) {
                case 'msbuild':
                    return await this.buildWithMsBuild(project);
                case 'dotnet':
                    return await this.buildWithDotnet(project);
                default:
                    return {
                        success: false,
                        errors: [`Build method '${method}' is not supported for building. Use 'msbuild' or 'dotnet'.`],
                        warnings: [],
                        duration: Date.now() - startTime,
                    };
            }
        } catch (err) {
            return {
                success: false,
                errors: [err instanceof Error ? err.message : String(err)],
                warnings: [],
                duration: Date.now() - startTime,
            };
        }
    }

    private async buildWithMsBuild(project: SfProjectInfo): Promise<BuildResult> {
        const startTime = Date.now();
        const terminal = vscode.window.createTerminal({
            name: `SF Build: ${project.appTypeName}`,
            cwd: project.projectDir,
        });

        terminal.show();
        terminal.sendText(`msbuild "${project.sfprojPath}" /t:Package /p:Configuration=Debug`);

        // Build is async via terminal — return optimistic result
        // User watches terminal for actual build output
        const pkgPath = path.join(project.projectDir, 'pkg', 'Debug');

        return {
            success: true, // Optimistic — terminal command was launched
            outputPath: pkgPath,
            errors: [],
            warnings: ['Build launched in terminal. Check terminal for output.'],
            duration: Date.now() - startTime,
        };
    }

    private async buildWithDotnet(project: SfProjectInfo): Promise<BuildResult> {
        const startTime = Date.now();
        const terminal = vscode.window.createTerminal({
            name: `SF Build: ${project.appTypeName}`,
            cwd: project.projectDir,
        });

        terminal.show();
        terminal.sendText(`dotnet build "${project.sfprojPath}" --configuration Debug`);

        return {
            success: true,
            outputPath: project.projectDir,
            errors: [],
            warnings: ['Build launched in terminal. Check terminal for output.'],
            duration: Date.now() - startTime,
        };
    }

    // ── Deploy via REST API ────────────────────────────────────────────

    /**
     * Deploy an application package to a cluster using the REST API.
     * Steps: Upload → Provision (poll) → Create → Cleanup Image Store
     */
    async deployToCluster(
        sfRest: SfRest,
        options: DeployOptions,
        packagePath: string,
    ): Promise<void> {
        SfUtility.outputLog(`SfDeployService.deployToCluster: ENTERED - type=${options.typeName} v${options.typeVersion} app=${options.appName} cluster=${options.clusterEndpoint} pkg=${packagePath}`, null, debugLevel.info);
        if (!fs.existsSync(packagePath)) {
            SfUtility.outputLog(`SfDeployService.deployToCluster: package path does not exist: ${packagePath}`, null, debugLevel.error);
            throw new Error(`Application package not found: ${packagePath}`);
        }
        SfUtility.outputLog(`SfDeployService.deployToCluster: package exists, starting withProgress`, null, debugLevel.info);

        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: `Deploying ${options.typeName}`,
                cancellable: false,
            },
            async (progress) => {
                // Step 1: Upload to Image Store
                SfUtility.outputLog('SfDeployService.deployToCluster: Step 1 - Upload to Image Store', null, debugLevel.info);
                progress.report({ message: 'Uploading to Image Store...', increment: 0 });
                const imageStorePath = options.typeName;

                await sfRest.uploadApplicationPackage(
                    packagePath,
                    imageStorePath,
                    (fileName, current, total) => {
                        const pct = Math.round((current / total) * 40);
                        progress.report({
                            message: `Uploading ${fileName} (${current}/${total})`,
                            increment: pct > 0 ? 1 : 0,
                        });
                    },
                );

                // Step 2: Provision application type
                SfUtility.outputLog('SfDeployService.deployToCluster: Step 2 - Provision application type', null, debugLevel.info);
                progress.report({ message: 'Provisioning application type...', increment: 40 });
                await sfRest.provisionApplicationType(imageStorePath, true, options.typeName, options.typeVersion);

                // Step 2b: Poll for provision completion
                SfUtility.outputLog('SfDeployService.deployToCluster: Step 2b - Waiting for provision', null, debugLevel.info);
                progress.report({ message: 'Waiting for provisioning to complete...', increment: 10 });
                const provisioned = await sfRest.waitForProvision(
                    options.typeName,
                    options.typeVersion,
                    60000,
                    3000,
                );
                if (!provisioned) {
                    throw new Error(`Provisioning timed out for ${options.typeName} v${options.typeVersion}`);
                }

                // Step 3: Create application instance
                SfUtility.outputLog('SfDeployService.deployToCluster: Step 3 - Create application instance', null, debugLevel.info);
                progress.report({ message: 'Creating application instance...', increment: 20 });
                await sfRest.createApplication(
                    options.appName,
                    options.typeName,
                    options.typeVersion,
                    options.parameters,
                );

                // Step 4: Clean up image store
                SfUtility.outputLog('SfDeployService.deployToCluster: Step 4 - Cleanup image store', null, debugLevel.info);
                progress.report({ message: 'Cleaning up Image Store...', increment: 20 });
                try {
                    await sfRest.deleteImageStoreContent(imageStorePath);
                } catch (cleanupErr) {
                    SfUtility.outputLog('SfDeployService: image store cleanup failed (non-fatal)', cleanupErr, debugLevel.warn);
                }

                progress.report({ message: 'Deploy complete!', increment: 10 });
                SfUtility.outputLog(
                    `SfDeployService: successfully deployed ${options.appName} (${options.typeName} v${options.typeVersion})`,
                    null,
                    debugLevel.info,
                );
            },
        );

        vscode.window.showInformationMessage(
            `Successfully deployed ${options.appName} (${options.typeName} v${options.typeVersion})`,
        );
    }

    // ── Remove from Cluster ────────────────────────────────────────────

    /**
     * Remove an application from cluster: delete app → unprovision type.
     */
    async removeFromCluster(
        sfRest: SfRest,
        appName: string,
        typeName: string,
        typeVersion: string,
    ): Promise<void> {
        SfUtility.outputLog(`SfDeployService.removeFromCluster: ENTERED - app=${appName} type=${typeName} v=${typeVersion}`, null, debugLevel.info);
        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: `Removing ${appName}`,
                cancellable: false,
            },
            async (progress) => {
                // Step 1: Delete application instance
                SfUtility.outputLog('SfDeployService.removeFromCluster: Step 1 - Delete application instance', null, debugLevel.info);
                progress.report({ message: 'Deleting application...', increment: 0 });
                const applicationId = appName.replace('fabric:/', '');
                await sfRest.deleteApplication(applicationId);

                // Step 2: Unprovision application type
                SfUtility.outputLog('SfDeployService.removeFromCluster: Step 2 - Unprovision application type', null, debugLevel.info);
                progress.report({ message: 'Unprovisioning application type...', increment: 50 });
                await sfRest.unprovisionApplicationType(typeName, typeVersion);

                progress.report({ message: 'Remove complete!', increment: 50 });
                SfUtility.outputLog(
                    `SfDeployService: removed ${appName} (${typeName} v${typeVersion})`,
                    null,
                    debugLevel.info,
                );
            },
        );

        vscode.window.showInformationMessage(
            `Removed ${appName} (${typeName} v${typeVersion})`,
        );
    }

    // ── Upgrade via REST API ───────────────────────────────────────────

    /**
     * Upgrade an application: upload new package → provision new version → start rolling upgrade → cleanup.
     */
    async upgradeApplication(
        sfRest: SfRest,
        options: DeployOptions,
        packagePath: string,
        upgradeSettings?: UpgradeSettings,
    ): Promise<void> {
        SfUtility.outputLog(`SfDeployService.upgradeApplication: ENTERED - type=${options.typeName} v=${options.typeVersion} app=${options.appName} pkg=${packagePath}`, null, debugLevel.info);
        if (!fs.existsSync(packagePath)) {
            SfUtility.outputLog(`SfDeployService.upgradeApplication: package not found: ${packagePath}`, null, debugLevel.error);
            throw new Error(`Application package not found: ${packagePath}`);
        }

        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: `Upgrading ${options.typeName}`,
                cancellable: false,
            },
            async (progress) => {
                // Step 1: Upload new package
                SfUtility.outputLog('SfDeployService.upgradeApplication: Step 1 - Upload new package', null, debugLevel.info);
                progress.report({ message: 'Uploading new package to Image Store...', increment: 0 });
                const imageStorePath = options.typeName;

                await sfRest.uploadApplicationPackage(
                    packagePath,
                    imageStorePath,
                    (fileName, current, total) => {
                        const pct = Math.round((current / total) * 30);
                        progress.report({
                            message: `Uploading ${fileName} (${current}/${total})`,
                            increment: pct > 0 ? 1 : 0,
                        });
                    },
                );

                // Step 2: Provision new version
                SfUtility.outputLog('SfDeployService.upgradeApplication: Step 2 - Provision new version', null, debugLevel.info);
                progress.report({ message: 'Provisioning new version...', increment: 30 });
                await sfRest.provisionApplicationType(imageStorePath, true, options.typeName, options.typeVersion);

                // Step 2b: Poll for provision completion
                SfUtility.outputLog('SfDeployService.upgradeApplication: Step 2b - Waiting for provision', null, debugLevel.info);
                progress.report({ message: 'Waiting for provisioning...', increment: 10 });
                const provisioned = await sfRest.waitForProvision(
                    options.typeName,
                    options.typeVersion,
                    60000,
                    3000,
                );
                if (!provisioned) {
                    throw new Error(`Provisioning timed out for ${options.typeName} v${options.typeVersion}`);
                }

                // Step 3: Start rolling upgrade
                SfUtility.outputLog('SfDeployService.upgradeApplication: Step 3 - Start rolling upgrade', null, debugLevel.info);
                progress.report({ message: 'Starting rolling upgrade...', increment: 20 });
                const applicationId = options.appName.replace('fabric:/', '');
                const failureAction = upgradeSettings?.failureAction || 'Rollback';
                const mode = upgradeSettings?.mode || 'Monitored';
                await sfRest.upgradeApplication(
                    applicationId,
                    options.typeName,
                    options.typeVersion,
                    options.parameters,
                    'Rolling',
                    mode,
                    failureAction,
                );

                // Step 4: Clean up image store (upgrade)
                SfUtility.outputLog('SfDeployService.upgradeApplication: Step 4 - Cleanup image store', null, debugLevel.info);
                progress.report({ message: 'Cleaning up Image Store...', increment: 20 });
                try {
                    await sfRest.deleteImageStoreContent(imageStorePath);
                } catch (cleanupErr) {
                    SfUtility.outputLog('SfDeployService: image store cleanup failed (non-fatal)', cleanupErr, debugLevel.warn);
                }

                progress.report({ message: 'Upgrade started!', increment: 20 });
                SfUtility.outputLog(
                    `SfDeployService: started upgrade for ${options.appName} → v${options.typeVersion}`,
                    null,
                    debugLevel.info,
                );
            },
        );

        vscode.window.showInformationMessage(
            `Upgrade started for ${options.appName} → v${options.typeVersion}. Monitor progress in Cluster Explorer.`,
        );
    }

    // ── Deploy via PowerShell ──────────────────────────────────────────

    /**
     * Deploy using Service Fabric PowerShell cmdlets.
     * Generates and runs the deploy script in a terminal.
     */
    async deployWithPowerShell(
        project: SfProjectInfo,
        profile: PublishProfileInfo,
        packagePath: string,
    ): Promise<void> {
        SfUtility.outputLog(`SfDeployService.deployWithPowerShell: ENTERED - type=${project.appTypeName} v=${project.appTypeVersion} endpoint=${profile.connectionEndpoint} pkg=${packagePath}`, null, debugLevel.info);
        const endpoint = profile.connectionEndpoint || 'localhost:19000';
        const paramFile = profile.parameterFilePath || '';

        const script = [
            `# Service Fabric Deploy: ${project.appTypeName}`,
            `$ErrorActionPreference = 'Stop'`,
            ``,
            `# Connect to cluster`,
            `Connect-ServiceFabricCluster -ConnectionEndpoint "${endpoint}"`,
            ``,
            `# Copy application package to Image Store`,
            `Copy-ServiceFabricApplicationPackage -ApplicationPackagePath "${packagePath}" -ApplicationPackagePathInImageStore "${project.appTypeName}" -ShowProgress`,
            ``,
            `# Register/provision the application type`,
            `Register-ServiceFabricApplicationType -ApplicationPathInImageStore "${project.appTypeName}"`,
            ``,
            `# Create application instance`,
            paramFile
                ? `New-ServiceFabricApplication -ApplicationName "fabric:/${project.appTypeName}" -ApplicationTypeName "${project.appTypeName}" -ApplicationTypeVersion "${project.appTypeVersion}" -ApplicationParameter (Get-Content "${paramFile}" | ConvertFrom-Xml)`
                : `New-ServiceFabricApplication -ApplicationName "fabric:/${project.appTypeName}" -ApplicationTypeName "${project.appTypeName}" -ApplicationTypeVersion "${project.appTypeVersion}"`,
            ``,
            `# Clean up image store`,
            `Remove-ServiceFabricApplicationPackage -ApplicationPackagePathInImageStore "${project.appTypeName}" -ImageStoreConnectionString fabric:ImageStore`,
            ``,
            `Write-Host "Deploy complete!" -ForegroundColor Green`,
        ].join('\n');

        const terminal = vscode.window.createTerminal({
            name: `SF Deploy: ${project.appTypeName}`,
            cwd: project.projectDir,
        });
        terminal.show();
        terminal.sendText(script);
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    /**
     * Find the packaged application output directory.
     * Looks for standard MSBuild package output locations.
     */
    findPackagePath(project: SfProjectInfo, configuration: string = 'Debug'): string | undefined {
        SfUtility.outputLog(`SfDeployService.findPackagePath: projectDir=${project.projectDir} config=${configuration}`, null, debugLevel.info);
        const candidates = [
            path.join(project.projectDir, 'pkg', configuration),
            path.join(project.projectDir, 'pkg', 'Release'),
            path.join(project.projectDir, 'pkg', 'Debug'),
            path.join(project.projectDir, 'bin', configuration, 'netcoreapp3.1', 'publish'),
            path.join(project.projectDir, 'bin', configuration, 'net6.0', 'publish'),
            path.join(project.projectDir, 'bin', configuration, 'net8.0', 'publish'),
        ];

        for (const candidate of candidates) {
            const dirExists = fs.existsSync(candidate);
            const hasManifest = dirExists && fs.existsSync(path.join(candidate, 'ApplicationManifest.xml'));
            SfUtility.outputLog(`SfDeployService.findPackagePath: ${candidate} dir=${dirExists} manifest=${hasManifest}`, null, debugLevel.info);
            if (dirExists && hasManifest) {
                SfUtility.outputLog(`SfDeployService.findPackagePath: FOUND ${candidate}`, null, debugLevel.info);
                return candidate;
            }
        }
        SfUtility.outputLog('SfDeployService.findPackagePath: no package found in any candidate path', null, debugLevel.warn);
        return undefined;
    }

    dispose(): void {
        // Nothing to dispose currently
    }
}
