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

export class SfProjectService implements vscode.Disposable {
    private readonly _onDidChangeProjects = new vscode.EventEmitter<void>();
    readonly onDidChangeProjects = this._onDidChangeProjects.event;

    private readonly watchers: vscode.FileSystemWatcher[] = [];
    private cachedProjects: SfProjectInfo[] | undefined;

    constructor() {
        this.setupWatchers();
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

        SfUtility.outputLog(`SfProjectService: discovered ${projects.length} project(s)`, null, debugLevel.info);
        this.cachedProjects = projects;
        return projects;
    }

    /** Force re-scan on next call to discoverProjects() */
    invalidateCache(): void {
        this.cachedProjects = undefined;
    }

    // ── .sfproj Parsing ────────────────────────────────────────────────

    /**
     * Parse a single .sfproj file and its associated manifests.
     */
    async parseProject(sfprojPath: string): Promise<SfProjectInfo | undefined> {
        const projectDir = path.dirname(sfprojPath);

        // Find ApplicationManifest.xml (should be sibling to .sfproj)
        const manifestPath = path.join(projectDir, 'ApplicationManifest.xml');
        if (!fs.existsSync(manifestPath)) {
            SfUtility.outputLog(`SfProjectService: no ApplicationManifest.xml found for ${sfprojPath}`, null, debugLevel.warn);
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
     * - {projectDir}/../{ServiceManifestName}/PackageRoot/ServiceManifest.xml
     * - {projectDir}/{ServiceManifestName}/PackageRoot/ServiceManifest.xml  
     */
    private findServiceManifestPath(projectDir: string, serviceManifestName: string): string | null {
        const candidates = [
            path.join(projectDir, '..', serviceManifestName, 'PackageRoot', 'ServiceManifest.xml'),
            path.join(projectDir, serviceManifestName, 'PackageRoot', 'ServiceManifest.xml'),
            path.join(projectDir, '..', serviceManifestName, 'ServiceManifest.xml'),
        ];

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
