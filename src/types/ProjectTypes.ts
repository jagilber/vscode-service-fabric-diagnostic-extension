/**
 * Type definitions for Service Fabric .sfproj project management.
 * 
 * Covers:
 * - .sfproj MSBuild project structure
 * - ApplicationManifest.xml elements
 * - ServiceManifest.xml elements  
 * - ApplicationParameters/*.xml
 * - PublishProfiles/*.xml
 * - Deploy/provision workflow options
 */

// ── Project Discovery ──────────────────────────────────────────────────

/** Represents a discovered .sfproj project in the workspace */
export interface SfProjectInfo {
    /** Absolute path to the .sfproj file */
    sfprojPath: string;

    /** Project directory (parent of .sfproj) */
    projectDir: string;

    /** Application type name from ApplicationManifest.xml */
    appTypeName: string;

    /** Application type version from ApplicationManifest.xml */
    appTypeVersion: string;

    /** Absolute path to ApplicationManifest.xml */
    manifestPath: string;

    /** Service references defined in ApplicationManifest.xml */
    services: ServiceReference[];

    /** Application parameters from ApplicationManifest.xml */
    parameters: ParameterDefinition[];

    /** Discovered publish profiles (PublishProfiles/*.xml) */
    profiles: PublishProfileInfo[];

    /** Discovered parameter files (ApplicationParameters/*.xml) */
    parameterFiles: ParameterFileInfo[];

    /** True when the project was added from outside the workspace */
    isExternal?: boolean;
}

// ── Service References ─────────────────────────────────────────────────

/** A service imported via ServiceManifestImport in ApplicationManifest.xml */
export interface ServiceReference {
    /** ServiceManifestName attribute */
    serviceManifestName: string;

    /** ServiceManifestVersion attribute */
    serviceManifestVersion: string;

    /** Service type name from ServiceManifest.xml (e.g. "MyServiceType") */
    serviceTypeName?: string;

    /** Default service name from DefaultServices (e.g. "MyService") */
    defaultServiceName?: string;

    /** Whether the service is stateful or stateless */
    serviceKind?: 'Stateful' | 'Stateless';

    /** Absolute path to the service project directory */
    serviceProjectPath?: string;

    /** Absolute path to ServiceManifest.xml */
    serviceManifestPath?: string;
}

// ── Manifest Parameters ────────────────────────────────────────────────

/** A parameter declared in ApplicationManifest.xml */
export interface ParameterDefinition {
    /** Parameter name */
    name: string;

    /** Default value from the manifest */
    defaultValue: string;
}

// ── Parameter Files ────────────────────────────────────────────────────

/** An ApplicationParameters/*.xml file */
export interface ParameterFileInfo {
    /** Display name (e.g. "Cloud", "Local.1Node") */
    name: string;

    /** Absolute path to the parameter file */
    path: string;

    /** Application name from the file (e.g. "fabric:/MyApp") */
    applicationName?: string;

    /** Parameter overrides in this file */
    parameters: ParameterOverride[];
}

/** A parameter override from an ApplicationParameters file */
export interface ParameterOverride {
    name: string;
    value: string;
}

// ── Publish Profiles ───────────────────────────────────────────────────

/** A PublishProfiles/*.xml publish profile */
export interface PublishProfileInfo {
    /** Display name (e.g. "Cloud", "Local.1Node") */
    name: string;

    /** Absolute path to the publish profile file */
    path: string;

    /** Cluster connection endpoint from the profile */
    connectionEndpoint?: string;

    /** Server certificate thumbprint */
    serverCertThumbprint?: string;

    /** Path to the ApplicationParameters file referenced by this profile */
    parameterFilePath?: string;

    /** Upgrade settings */
    upgradeSettings?: UpgradeSettings;
}

/** Upgrade deployment settings from a publish profile */
export interface UpgradeSettings {
    /** Upgrade mode: Monitored, UnmonitoredAuto, UnmonitoredManual */
    mode?: string;

    /** Whether upgrade is enabled */
    enabled: boolean;

    /** Failure action: Rollback, Manual */
    failureAction?: string;

    /** Health check parameters */
    healthCheckWaitDuration?: string;
    healthCheckStableDuration?: string;
    healthCheckRetryTimeout?: string;
    upgradeDomainTimeout?: string;
    upgradeTimeout?: string;
}

// ── Deploy Options ─────────────────────────────────────────────────────

/** Options for deploying an application to a cluster */
export interface DeployOptions {
    /** Application name (e.g. "fabric:/MyApp") */
    appName: string;

    /** Application type name */
    typeName: string;

    /** Application type version */
    typeVersion: string;

    /** Parameter overrides (name → value) */
    parameters: Record<string, string>;

    /** Target cluster endpoint */
    clusterEndpoint: string;

    /** Publish profile to use (optional) */
    publishProfile?: PublishProfileInfo;

    /** Whether to perform an upgrade deploy */
    upgrade: boolean;
}

/** Deploy method — how to build/package/deploy */
export type DeployMethod = 'msbuild' | 'dotnet' | 'powershell' | 'rest';

// ── Build/Package Status ───────────────────────────────────────────────

/** Status of a build or package operation */
export interface BuildResult {
    success: boolean;
    outputPath?: string;
    errors: string[];
    warnings: string[];
    duration: number;
}

// ── Tree Node Types ────────────────────────────────────────────────────

/** Types of nodes in the SF Applications tree view */
export type SfAppTreeNodeType =
    | 'sfProject'
    | 'serviceRef'
    | 'manifest'
    | 'parameterFile'
    | 'publishProfile'
    | 'servicesGroup'
    | 'parametersGroup'
    | 'profilesGroup';
