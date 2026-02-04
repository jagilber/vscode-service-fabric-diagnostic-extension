/**
 * Type definitions for Service Fabric extension
 * Eliminates 'any' types with proper TypeScript interfaces
 */

import * as vscode from 'vscode';
import { SfConfiguration } from './sfConfiguration';
import { SfRest } from './sfRest';

/**
 * WebView message types for management panel
 */
export interface WebViewMessage {
    command: string;
    data?: unknown;
    error?: string;
}

export interface DeployApplicationMessage extends WebViewMessage {
    command: 'deployApplication';
    data?: never;
}

export interface UpgradeApplicationMessage extends WebViewMessage {
    command: 'upgradeApplication';
    data?: {
        appName: string;
        targetVersion: string;
    };
}

export interface RemoveApplicationMessage extends WebViewMessage {
    command: 'removeApplication';
    data?: {
        appName: string;
    };
}

export interface NodeActionMessage extends WebViewMessage {
    command: 'deactivateNode' | 'activateNode' | 'restartNode' | 'removeNodeState';
    data?: {
        nodeName: string;
        intent?: string;
    };
}

export interface ClusterActionMessage extends WebViewMessage {
    command: 'upgradeCluster' | 'backupCluster' | 'createBackup' | 'restoreBackup';
    data?: {
        version?: string;
        backupLocation?: string;
    };
}

export type ManagementMessage = 
    | DeployApplicationMessage 
    | UpgradeApplicationMessage 
    | RemoveApplicationMessage 
    | NodeActionMessage 
    | ClusterActionMessage 
    | WebViewMessage;

/**
 * Service Fabric REST API response types
 */
export interface DeployedApplicationInfo {
    id?: string;
    name?: string;
    typeName?: string;
    status?: string;
    healthState?: string;
}

export interface DeployedServicePackageInfo {
    name?: string;
    serviceManifestName?: string;
    servicePackageActivationId?: string;
    healthState?: string;
}

export interface DeployedCodePackageInfo {
    name?: string;
    codePackageName?: string;
    serviceManifestName?: string;
    codePackageVersion?: string;
    status?: string;
}

export interface DeployedReplicaInfo {
    replicaId?: string;
    instanceId?: string;
    serviceKind?: string;
    serviceName?: string;
    partitionId?: string;
    replicaStatus?: string;
    replicaRole?: string;
    instanceRole?: string;
    healthState?: string;
}

export interface NodeInfo {
    name?: string;
    ipAddressOrFQDN?: string;
    type?: string;
    codeVersion?: string;
    configVersion?: string;
    nodeStatus?: string;
    nodeUpTime?: string;
    healthState?: string;
    isSeedNode?: boolean;
    upgradeDomain?: string;
    faultDomain?: string;
}

export interface ApplicationInfo {
    id?: string;
    name?: string;
    typeName?: string;
    typeVersion?: string;
    status?: string;
    healthState?: string;
    applicationDefinitionKind?: string;
}

export interface ServiceInfo {
    id?: string;
    name?: string;
    typeName?: string;
    manifestVersion?: string;
    serviceKind?: string;
    serviceStatus?: string;
    healthState?: string;
}

export interface PartitionInfo {
    partitionInformation?: {
        id?: string;
        servicePartitionKind?: string;
        lowKey?: string;
        highKey?: string;
        name?: string;
    };
    healthState?: string;
    partitionStatus?: string;
}

export interface ReplicaInfo {
    replicaId?: string;
    instanceId?: string;
    replicaRole?: string;
    replicaStatus?: string;
    healthState?: string;
    serviceKind?: string;
    nodeName?: string;
}

/**
 * HTTP options and headers
 */
export interface HttpHeaders {
    [key: string]: string | string[] | undefined;
}

export interface UriParameters {
    apiVersion?: string;
    timeout?: number;
    [key: string]: string | number | boolean | undefined;
}

/**
 * Cluster configuration map
 * Maps cluster endpoint to SfConfiguration instance
 */
export type ClusterConfigMap = Map<string, SfConfiguration>;

/**
 * Azure account types
 */
export interface AzureAccount {
    waitForLogin(): Promise<boolean>;
    sessions: AzureSession[];
    waitForFilters(): Promise<void>;
}

export interface AzureSession {
    credentials2: unknown;
    tenantId: string;
    userId: string;
}

/**
 * Extension context type-safe wrapper
 */
export interface ExtensionContextWrapper {
    globalStorageUri: vscode.Uri;
    extensionPath: string;
    extensionUri: vscode.Uri;
    subscriptions: vscode.Disposable[];
}

/**
 * Health enrichment result
 */
export interface HealthEnrichmentResult {
    appName: string;
    healthState: string;
}

/**
 * Telemetry logger type (until VS Code exposes it officially)
 */
export interface ITelemetryLogger {
    logUsage(eventName: string, data?: Record<string, unknown>): void;
    logError(eventName: string, data?: Record<string, unknown>): void;
}
