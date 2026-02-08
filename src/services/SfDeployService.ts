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
     * Steps: Upload → Provision → Create
     */
    async deployToCluster(
        sfRest: SfRest,
        options: DeployOptions,
        packagePath: string,
    ): Promise<void> {
        if (!fs.existsSync(packagePath)) {
            throw new Error(`Application package not found: ${packagePath}`);
        }

        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: `Deploying ${options.typeName}`,
                cancellable: false,
            },
            async (progress) => {
                // Step 1: Upload to Image Store
                progress.report({ message: 'Uploading to Image Store...', increment: 0 });
                const imageStorePath = options.typeName;

                await sfRest.uploadApplicationPackage(
                    packagePath,
                    imageStorePath,
                    (fileName, current, total) => {
                        const pct = Math.round((current / total) * 50);
                        progress.report({
                            message: `Uploading ${fileName} (${current}/${total})`,
                            increment: pct > 0 ? 1 : 0,
                        });
                    },
                );

                // Step 2: Provision application type
                progress.report({ message: 'Provisioning application type...', increment: 50 });
                await sfRest.provisionApplicationType(imageStorePath, true);

                // Wait briefly for async provisioning
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Step 3: Create application instance
                progress.report({ message: 'Creating application instance...', increment: 25 });
                await sfRest.createApplication(
                    options.appName,
                    options.typeName,
                    options.typeVersion,
                    options.parameters,
                );

                progress.report({ message: 'Deploy complete!', increment: 25 });
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
        const candidates = [
            path.join(project.projectDir, 'pkg', configuration),
            path.join(project.projectDir, 'pkg', 'Release'),
            path.join(project.projectDir, 'pkg', 'Debug'),
            path.join(project.projectDir, 'bin', configuration, 'netcoreapp3.1', 'publish'),
            path.join(project.projectDir, 'bin', configuration, 'net6.0', 'publish'),
            path.join(project.projectDir, 'bin', configuration, 'net8.0', 'publish'),
        ];

        for (const candidate of candidates) {
            if (fs.existsSync(candidate)) {
                // Verify it has an ApplicationManifest.xml
                if (fs.existsSync(path.join(candidate, 'ApplicationManifest.xml'))) {
                    return candidate;
                }
            }
        }
        return undefined;
    }

    dispose(): void {
        // Nothing to dispose currently
    }
}
