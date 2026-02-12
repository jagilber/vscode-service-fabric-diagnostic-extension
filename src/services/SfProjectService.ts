/**
 * SfProjectService — discovers and parses .sfproj projects in the workspace.
 * 
 * Responsibilities:
 * - Scan workspace for .sfproj files
 * - Parse ApplicationManifest.xml (app type, services, parameters)
 * - Parse ServiceManifest.xml (service types, code packages)
 * - Parse ApplicationParameters/*.xml and PublishProfiles/*.xml
 * - Watch for .sfproj / manifest file changes and emit refresh events
 * 
 * XML parsing uses the existing xml-js dependency (already in package.json).
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as xmljs from 'xml-js';
import { SfUtility, debugLevel } from '../sfUtility';
import {
    SfProjectInfo,
    ServiceReference,
    ParameterDefinition,
    ParameterFileInfo,
    ParameterOverride,
    PublishProfileInfo,
    UpgradeSettings,
} from '../types/ProjectTypes';

/** globalState key for persisted external project paths */
const EXTERNAL_PROJECTS_KEY = 'sfApplications.externalProjectPaths';

export class SfProjectService implements vscode.Disposable {
    private readonly _onDidChangeProjects = new vscode.EventEmitter<void>();
    readonly onDidChangeProjects = this._onDidChangeProjects.event;

    private readonly watchers: vscode.FileSystemWatcher[] = [];
    private cachedProjects: SfProjectInfo[] | undefined;
    private context: vscode.ExtensionContext | undefined;

    constructor() {
        this.setupWatchers();
    }

    /** Set the extension context (must be called before external path operations) */
    setContext(context: vscode.ExtensionContext): void {
        this.context = context;
    }

    // ── Discovery ──────────────────────────────────────────────────────

    /**
     * Discover all .sfproj projects in the workspace.
     * Results are cached until a file watcher triggers invalidation.
     */
    async discoverProjects(): Promise<SfProjectInfo[]> {
        if (this.cachedProjects) {
            return this.cachedProjects;
        }

        SfUtility.outputLog('SfProjectService: scanning workspace for .sfproj files...', null, debugLevel.info);

        const sfprojFiles = await vscode.workspace.findFiles('**/*.sfproj', '**/node_modules/**');

        const projects: SfProjectInfo[] = [];
        for (const uri of sfprojFiles) {
            try {
                const project = await this.parseProject(uri.fsPath);
                if (project) {
                    projects.push(project);
                }
            } catch (err) {
                SfUtility.outputLog(`SfProjectService: failed to parse ${uri.fsPath}`, err, debugLevel.warn);
            }
        }

        // Also scan external project paths
        const externalPaths = this.getExternalProjectPaths();
        SfUtility.outputLog(`SfProjectService: checking ${externalPaths.length} external project path(s)`, null, debugLevel.info);
        for (const extPath of externalPaths) {
            try {
                if (!fs.existsSync(extPath)) {
                    SfUtility.outputLog(`SfProjectService: external path no longer exists: ${extPath}`, null, debugLevel.warn);
                    continue;
                }
                // Check if this path was already found via workspace scan
                if (projects.some(p => path.resolve(p.sfprojPath) === path.resolve(extPath))) {
                    SfUtility.outputLog(`SfProjectService: external path already in workspace scan: ${extPath}`, null, debugLevel.info);
                    continue;
                }
                SfUtility.outputLog(`SfProjectService: parsing external project: ${extPath}`, null, debugLevel.info);
                const project = await this.parseProject(extPath);
                if (project) {
                    project.isExternal = true;
                    projects.push(project);
                    SfUtility.outputLog(`SfProjectService: successfully parsed external project: ${extPath} (appType=${project.appTypeName})`, null, debugLevel.info);
                } else {
                    SfUtility.outputLog(`SfProjectService: parseProject returned undefined for external path: ${extPath}. Check that ApplicationManifest.xml exists in ${path.dirname(extPath)}`, null, debugLevel.warn);
                }
            } catch (err) {
                SfUtility.outputLog(`SfProjectService: failed to parse external project ${extPath}`, err, debugLevel.warn);
            }
        }

        SfUtility.outputLog(`SfProjectService: discovered ${projects.length} project(s)`, null, debugLevel.info);
        this.cachedProjects = projects;
        return projects;
    }

    /** Force re-scan on next call to discoverProjects() */
    invalidateCache(): void {
        this.cachedProjects = undefined;
    }

    // ── External Project Paths ─────────────────────────────────────────

    /** Get all persisted external .sfproj paths */
    getExternalProjectPaths(): string[] {
        if (!this.context) { return []; }
        return this.context.globalState.get<string[]>(EXTERNAL_PROJECTS_KEY, []);
    }

    /** Add an external .sfproj path and persist it */
    async addExternalProjectPath(sfprojPath: string): Promise<void> {
        if (!this.context) {
            SfUtility.outputLog('SfProjectService: cannot add external path — no context', null, debugLevel.warn);
            return;
        }
        const resolved = path.resolve(sfprojPath);
        const current = this.getExternalProjectPaths();
        if (current.includes(resolved)) {
            SfUtility.outputLog(`SfProjectService: external path already registered: ${resolved}`, null, debugLevel.info);
            return;
        }
        current.push(resolved);
        await this.context.globalState.update(EXTERNAL_PROJECTS_KEY, current);
        SfUtility.outputLog(`SfProjectService: added external project path: ${resolved}`, null, debugLevel.info);
        this.onProjectChanged();
    }

    /** Remove an external .sfproj path */
    async removeExternalProjectPath(sfprojPath: string): Promise<void> {
        if (!this.context) { return; }
        const resolved = path.resolve(sfprojPath);
        const current = this.getExternalProjectPaths();
        const idx = current.indexOf(resolved);
        if (idx < 0) { return; }
        current.splice(idx, 1);
        await this.context.globalState.update(EXTERNAL_PROJECTS_KEY, current);
        SfUtility.outputLog(`SfProjectService: removed external project path: ${resolved}`, null, debugLevel.info);
        this.onProjectChanged();
    }

    /** Add an external folder — scan it for .sfproj files and add all found */
    async addExternalFolder(folderPath: string): Promise<number> {
        const resolvedFolder = path.resolve(folderPath);
        const foundPaths = this.scanFolderForSfprojs(resolvedFolder);
        let added = 0;
        for (const sfprojPath of foundPaths) {
            const current = this.getExternalProjectPaths();
            const resolved = path.resolve(sfprojPath);
            if (!current.includes(resolved)) {
                current.push(resolved);
                if (this.context) {
                    await this.context.globalState.update(EXTERNAL_PROJECTS_KEY, current);
                }
                added++;
            }
        }
        if (added > 0) {
            SfUtility.outputLog(`SfProjectService: added ${added} external project(s) from ${resolvedFolder}`, null, debugLevel.info);
            this.onProjectChanged();
        }
        return added;
    }

    /** Recursively search a folder for .sfproj files (max depth 5) */
    private scanFolderForSfprojs(dir: string, depth = 0, maxDepth = 5): string[] {
        if (depth > maxDepth) { return []; }
        const results: string[] = [];
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isFile() && entry.name.endsWith('.sfproj')) {
                    results.push(fullPath);
                } else if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'bin' && entry.name !== 'obj') {
                    results.push(...this.scanFolderForSfprojs(fullPath, depth + 1, maxDepth));
                }
            }
        } catch {
            // Permission denied or similar — skip
        }
        return results;
    }

    // ── .sfproj Parsing ────────────────────────────────────────────────

    /**
     * Parse a single .sfproj file and its associated manifests.
     */
    async parseProject(sfprojPath: string): Promise<SfProjectInfo | undefined> {
        const projectDir = path.dirname(sfprojPath);
        SfUtility.outputLog(`SfProjectService.parseProject: parsing ${sfprojPath}`, null, debugLevel.info);
        SfUtility.outputLog(`SfProjectService.parseProject: project directory: ${projectDir}`, null, debugLevel.info);

        // Find ApplicationManifest.xml — search multiple common locations
        const candidatePaths = [
            path.join(projectDir, 'ApplicationManifest.xml'),
            path.join(projectDir, 'ApplicationPackageRoot', 'ApplicationManifest.xml'),
            path.join(projectDir, 'PackageRoot', 'ApplicationManifest.xml'),
        ];

        let manifestPath: string | undefined;
        for (const candidate of candidatePaths) {
            SfUtility.outputLog(`SfProjectService.parseProject: checking for manifest at: ${candidate}`, null, debugLevel.info);
            if (fs.existsSync(candidate)) {
                manifestPath = candidate;
                SfUtility.outputLog(`SfProjectService.parseProject: found ApplicationManifest.xml at: ${candidate}`, null, debugLevel.info);
                break;
            }
        }

        if (!manifestPath) {
            // List what IS in the directory to help diagnose
            try {
                const dirContents = fs.readdirSync(projectDir);
                SfUtility.outputLog(
                    `SfProjectService.parseProject: ApplicationManifest.xml not found. ` +
                    `Searched: ${candidatePaths.join(', ')}. ` +
                    `Directory contents of ${projectDir}: [${dirContents.join(', ')}]`,
                    null, debugLevel.warn
                );
            } catch {
                SfUtility.outputLog(
                    `SfProjectService.parseProject: ApplicationManifest.xml not found and could not read directory ${projectDir}`,
                    null, debugLevel.warn
                );
            }
            return undefined;
        }

        // Parse ApplicationManifest.xml
        const manifest = await this.parseApplicationManifest(manifestPath, projectDir);
        if (!manifest) {
            return undefined;
        }

        // Discover parameter files
        const parameterFiles = await this.discoverParameterFiles(projectDir);

        // Discover publish profiles
        const profiles = await this.discoverPublishProfiles(projectDir);

        return {
            sfprojPath,
            projectDir,
            appTypeName: manifest.appTypeName,
            appTypeVersion: manifest.appTypeVersion,
            manifestPath,
            services: manifest.services,
            parameters: manifest.parameters,
            profiles,
            parameterFiles,
        };
    }

    // ── ApplicationManifest.xml ────────────────────────────────────────

    /**
     * Parse ApplicationManifest.xml to extract:
     * - ApplicationTypeName / ApplicationTypeVersion
     * - ServiceManifestImport elements → ServiceReference[]
     * - Parameters → ParameterDefinition[]
     * - DefaultServices → service names / types  
     */
    async parseApplicationManifest(manifestPath: string, projectDir: string): Promise<{
        appTypeName: string;
        appTypeVersion: string;
        services: ServiceReference[];
        parameters: ParameterDefinition[];
    } | undefined> {
        try {
            const xml = fs.readFileSync(manifestPath, 'utf-8');
            const doc = xmljs.xml2js(xml, { compact: true }) as any;

            const appManifest = doc.ApplicationManifest;
            if (!appManifest) {
                SfUtility.outputLog(`SfProjectService: no <ApplicationManifest> root element in ${manifestPath}`, null, debugLevel.warn);
                return undefined;
            }

            const attrs = appManifest._attributes || {};
            const appTypeName = attrs.ApplicationTypeName || '';
            const appTypeVersion = attrs.ApplicationTypeVersion || '';

            // Parse ServiceManifestImport elements
            const services = this.parseServiceManifestImports(appManifest, projectDir);

            // Parse DefaultServices to enrich service references
            this.enrichWithDefaultServices(appManifest, services);

            // Parse Parameters
            const parameters = this.parseParameters(appManifest);

            return { appTypeName, appTypeVersion, services, parameters };
        } catch (err) {
            SfUtility.outputLog(`SfProjectService: failed to parse ApplicationManifest.xml at ${manifestPath}`, err, debugLevel.error);
            return undefined;
        }
    }

    private parseServiceManifestImports(appManifest: any, projectDir: string): ServiceReference[] {
        const imports = this.toArray(appManifest.ServiceManifestImport);
        const services: ServiceReference[] = [];

        for (const imp of imports) {
            const ref = imp.ServiceManifestRef?._attributes;
            if (!ref) { continue; }

            const serviceManifestName = ref.ServiceManifestName || '';
            const serviceManifestVersion = ref.ServiceManifestVersion || '';

            // Try to locate ServiceManifest.xml
            // Typical structure: ../ServiceName/PackageRoot/ServiceManifest.xml
            const serviceManifestPath = this.findServiceManifestPath(projectDir, serviceManifestName);

            const svcRef: ServiceReference = {
                serviceManifestName,
                serviceManifestVersion,
                serviceManifestPath: serviceManifestPath || undefined,
            };

            // Parse ServiceManifest.xml if found
            if (serviceManifestPath) {
                try {
                    const smInfo = this.parseServiceManifest(serviceManifestPath);
                    if (smInfo) {
                        svcRef.serviceTypeName = smInfo.serviceTypeName;
                        svcRef.serviceKind = smInfo.serviceKind;
                        svcRef.serviceProjectPath = path.dirname(path.dirname(serviceManifestPath));
                    }
                } catch (err) {
                    SfUtility.outputLog(`SfProjectService: failed to parse ServiceManifest at ${serviceManifestPath}`, err, debugLevel.warn);
                }
            }

            services.push(svcRef);
        }
        return services;
    }

    private enrichWithDefaultServices(appManifest: any, services: ServiceReference[]): void {
        const defaultServices = appManifest.DefaultServices;
        if (!defaultServices) { return; }

        const svcElements = this.toArray(defaultServices.Service);
        for (const svc of svcElements) {
            const svcName = svc._attributes?.Name;
            if (!svcName) { continue; }

            // Find the matching service reference by determining service type
            const statelessSvc = svc.StatelessService;
            const statefulSvc = svc.StatefulService;
            const svcDef = statelessSvc || statefulSvc;
            if (!svcDef) { continue; }

            const serviceTypeName = svcDef._attributes?.ServiceTypeName;
            if (!serviceTypeName) { continue; }

            // Match to existing service reference
            const match = services.find(s => s.serviceTypeName === serviceTypeName);
            if (match) {
                match.defaultServiceName = svcName;
                match.serviceKind = statefulSvc ? 'Stateful' : 'Stateless';
            }
        }
    }

    private parseParameters(appManifest: any): ParameterDefinition[] {
        const params = appManifest.Parameters;
        if (!params) { return []; }

        const paramElements = this.toArray(params.Parameter);
        return paramElements
            .map((p: any) => ({
                name: p._attributes?.Name || '',
                defaultValue: p._attributes?.DefaultValue || '',
            }))
            .filter((p: ParameterDefinition) => p.name);
    }

    // ── ServiceManifest.xml ────────────────────────────────────────────

    /**
     * Parse a ServiceManifest.xml to extract service type info.
     */
    parseServiceManifest(manifestPath: string): {
        serviceTypeName: string;
        serviceKind: 'Stateful' | 'Stateless';
    } | undefined {
        try {
            const xml = fs.readFileSync(manifestPath, 'utf-8');
            const doc = xmljs.xml2js(xml, { compact: true }) as any;

            const svcManifest = doc.ServiceManifest;
            if (!svcManifest) { return undefined; }

            const serviceTypes = svcManifest.ServiceTypes;
            if (!serviceTypes) { return undefined; }

            // Check for StatelessServiceType or StatefulServiceType
            const stateless = this.toArray(serviceTypes.StatelessServiceType);
            if (stateless.length > 0) {
                return {
                    serviceTypeName: stateless[0]._attributes?.ServiceTypeName || '',
                    serviceKind: 'Stateless',
                };
            }

            const stateful = this.toArray(serviceTypes.StatefulServiceType);
            if (stateful.length > 0) {
                return {
                    serviceTypeName: stateful[0]._attributes?.ServiceTypeName || '',
                    serviceKind: 'Stateful',
                };
            }

            return undefined;
        } catch (err) {
            SfUtility.outputLog(`SfProjectService: failed to parse ServiceManifest at ${manifestPath}`, err, debugLevel.warn);
            return undefined;
        }
    }

    // ── ApplicationParameters ──────────────────────────────────────────

    private async discoverParameterFiles(projectDir: string): Promise<ParameterFileInfo[]> {
        const paramDir = path.join(projectDir, 'ApplicationParameters');
        if (!fs.existsSync(paramDir)) { return []; }

        const files = fs.readdirSync(paramDir).filter(f => f.endsWith('.xml'));
        const result: ParameterFileInfo[] = [];

        for (const file of files) {
            const filePath = path.join(paramDir, file);
            try {
                const info = this.parseParameterFile(filePath);
                if (info) {
                    result.push(info);
                }
            } catch (err) {
                SfUtility.outputLog(`SfProjectService: failed to parse parameter file ${filePath}`, err, debugLevel.warn);
            }
        }
        return result;
    }

    parseParameterFile(filePath: string): ParameterFileInfo | undefined {
        try {
            const xml = fs.readFileSync(filePath, 'utf-8');
            const doc = xmljs.xml2js(xml, { compact: true }) as any;

            const app = doc.Application;
            if (!app) { return undefined; }

            const appName = app._attributes?.Name || '';
            const paramElements = this.toArray(app.Parameters?.Parameter);
            const parameters: ParameterOverride[] = paramElements
                .map((p: any) => ({
                    name: p._attributes?.Name || '',
                    value: p._attributes?.Value || '',
                }))
                .filter((p: ParameterOverride) => p.name);

            const name = path.basename(filePath, '.xml');
            return { name, path: filePath, applicationName: appName || undefined, parameters };
        } catch {
            return undefined;
        }
    }

    // ── Publish Profiles ───────────────────────────────────────────────

    private async discoverPublishProfiles(projectDir: string): Promise<PublishProfileInfo[]> {
        const profileDir = path.join(projectDir, 'PublishProfiles');
        if (!fs.existsSync(profileDir)) { return []; }

        const files = fs.readdirSync(profileDir).filter(f => f.endsWith('.xml'));
        const result: PublishProfileInfo[] = [];

        for (const file of files) {
            const filePath = path.join(profileDir, file);
            try {
                const info = this.parsePublishProfile(filePath);
                if (info) {
                    result.push(info);
                }
            } catch (err) {
                SfUtility.outputLog(`SfProjectService: failed to parse publish profile ${filePath}`, err, debugLevel.warn);
            }
        }
        return result;
    }

    parsePublishProfile(filePath: string): PublishProfileInfo | undefined {
        try {
            const xml = fs.readFileSync(filePath, 'utf-8');
            const doc = xmljs.xml2js(xml, { compact: true }) as any;

            const profile = doc.PublishProfile;
            if (!profile) { return undefined; }

            const connParams = profile.ClusterConnectionParameters?._attributes || {};
            const paramFileAttrs = profile.ApplicationParameterFile?._attributes || {};
            const upgradeDeploy = profile.UpgradeDeployment;

            let upgradeSettings: UpgradeSettings | undefined;
            if (upgradeDeploy) {
                const upgradeAttrs = upgradeDeploy._attributes || {};
                const upgradeParams = upgradeDeploy.Parameters?._attributes || {};
                upgradeSettings = {
                    mode: upgradeAttrs.Mode,
                    enabled: upgradeAttrs.Enabled === 'true',
                    failureAction: upgradeParams.FailureAction,
                    healthCheckWaitDuration: upgradeParams.HealthCheckWaitDurationSec,
                    healthCheckStableDuration: upgradeParams.HealthCheckStableDurationSec,
                    healthCheckRetryTimeout: upgradeParams.HealthCheckRetryTimeoutSec,
                    upgradeDomainTimeout: upgradeParams.UpgradeDomainTimeoutSec,
                    upgradeTimeout: upgradeParams.UpgradeTimeoutSec,
                };
            }

            const name = path.basename(filePath, '.xml');
            return {
                name,
                path: filePath,
                connectionEndpoint: connParams.ConnectionEndpoint || undefined,
                serverCertThumbprint: connParams.ServerCertThumbprint || undefined,
                parameterFilePath: paramFileAttrs.Path || undefined,
                upgradeSettings,
            };
        } catch {
            return undefined;
        }
    }

    // ── File Watchers ──────────────────────────────────────────────────

    private setupWatchers(): void {
        // Watch for .sfproj changes
        const sfprojWatcher = vscode.workspace.createFileSystemWatcher('**/*.sfproj');
        sfprojWatcher.onDidCreate(() => this.onProjectChanged());
        sfprojWatcher.onDidDelete(() => this.onProjectChanged());
        sfprojWatcher.onDidChange(() => this.onProjectChanged());
        this.watchers.push(sfprojWatcher);

        // Watch for ApplicationManifest.xml changes
        const manifestWatcher = vscode.workspace.createFileSystemWatcher('**/ApplicationManifest.xml');
        manifestWatcher.onDidChange(() => this.onProjectChanged());
        this.watchers.push(manifestWatcher);

        // Watch for ServiceManifest.xml changes
        const svcManifestWatcher = vscode.workspace.createFileSystemWatcher('**/ServiceManifest.xml');
        svcManifestWatcher.onDidChange(() => this.onProjectChanged());
        this.watchers.push(svcManifestWatcher);

        // Watch for parameter file changes
        const paramWatcher = vscode.workspace.createFileSystemWatcher('**/ApplicationParameters/*.xml');
        paramWatcher.onDidCreate(() => this.onProjectChanged());
        paramWatcher.onDidDelete(() => this.onProjectChanged());
        paramWatcher.onDidChange(() => this.onProjectChanged());
        this.watchers.push(paramWatcher);

        // Watch for publish profile changes
        const profileWatcher = vscode.workspace.createFileSystemWatcher('**/PublishProfiles/*.xml');
        profileWatcher.onDidCreate(() => this.onProjectChanged());
        profileWatcher.onDidDelete(() => this.onProjectChanged());
        profileWatcher.onDidChange(() => this.onProjectChanged());
        this.watchers.push(profileWatcher);
    }

    private onProjectChanged(): void {
        SfUtility.outputLog('SfProjectService: file change detected — invalidating cache', null, debugLevel.info);
        this.invalidateCache();
        this._onDidChangeProjects.fire();
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    /**
     * Try to find ServiceManifest.xml for a given service manifest name.
     * Searches common project layouts:
     * - {projectDir}/../{ServiceManifestName}/PackageRoot/ServiceManifest.xml  (sibling project)
     * - {projectDir}/{ServiceManifestName}/PackageRoot/ServiceManifest.xml     (sub-project)
     * - {projectDir}/../{ServiceManifestName}/ServiceManifest.xml             (flat layout)
     * - ApplicationPackageRoot/{ServiceManifestName}/ServiceManifest.xml      (built package)
     * Plus variants with "Pkg" suffix stripped (VS templates use "VotingDataPkg"
     * as ServiceManifestName but the source project directory is "VotingData").
     */
    private findServiceManifestPath(projectDir: string, serviceManifestName: string): string | null {
        const names = [serviceManifestName];
        // SF templates append "Pkg" suffix to ServiceManifestName but the project
        // directory omits it (e.g. ServiceManifestName="VotingDataPkg" → dir "VotingData")
        const stripped = serviceManifestName.replace(/Pkg$/i, '');
        if (stripped !== serviceManifestName) {
            names.push(stripped);
        }

        const candidates: string[] = [];
        for (const name of names) {
            candidates.push(
                path.join(projectDir, '..', name, 'PackageRoot', 'ServiceManifest.xml'),
                path.join(projectDir, name, 'PackageRoot', 'ServiceManifest.xml'),
                path.join(projectDir, '..', name, 'ServiceManifest.xml'),
            );
        }
        // Also check inside ApplicationPackageRoot (present after msbuild /t:Package)
        candidates.push(
            path.join(projectDir, 'ApplicationPackageRoot', serviceManifestName, 'ServiceManifest.xml'),
        );

        for (const candidate of candidates) {
            if (fs.existsSync(candidate)) {
                return path.resolve(candidate);
            }
        }
        return null;
    }

    /** Ensure a value is an array (xml-js wraps single elements differently) */
    private toArray(val: any): any[] {
        if (!val) { return []; }
        return Array.isArray(val) ? val : [val];
    }

    dispose(): void {
        this.watchers.forEach(w => w.dispose());
        this.watchers.length = 0;
        this._onDidChangeProjects.dispose();
    }
}
