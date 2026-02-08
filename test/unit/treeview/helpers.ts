/**
 * Shared test helpers for treeview node unit tests.
 * Provides mock TreeNodeContext, DataCache, IconService, and factory functions.
 */
import { TreeNodeContext } from '../../../src/treeview/TreeNodeContext';
import { IconService } from '../../../src/treeview/IconService';
import { DataCache } from '../../../src/treeview/DataCache';
import * as vscode from 'vscode';

/** Create a mock SfConfiguration with cluster health data */
export function createMockSfConfig(overrides: Partial<{
    clusterHealth: any;
    clusterEndpoint: string;
    isNativeImageStoreAvailable: boolean;
}> = {}) {
    const clusterHealth = overrides.clusterHealth ?? {
        aggregatedHealthState: 'Ok',
        applicationHealthStates: [
            { name: 'fabric:/MyApp', aggregatedHealthState: 'Ok' },
            { name: 'fabric:/System', aggregatedHealthState: 'Ok' },
        ],
        nodeHealthStates: [
            { name: '_Node_0', aggregatedHealthState: 'Ok' },
            { name: '_Node_1', aggregatedHealthState: 'Ok' },
        ],
    };

    return {
        getClusterEndpoint: jest.fn().mockReturnValue(overrides.clusterEndpoint ?? 'https://test-cluster:19080'),
        getClusterHealth: jest.fn().mockReturnValue(clusterHealth),
        populateClusterHealth: jest.fn().mockResolvedValue(undefined),
        isNativeImageStoreAvailable: jest.fn().mockReturnValue(overrides.isNativeImageStoreAvailable ?? true),
        ensureRestClientReady: jest.fn().mockResolvedValue(undefined),
    };
}

/** Create a mock SfRest with configurable return values */
export function createMockSfRest(overrides: Partial<{
    nodes: any[];
    applications: any[];
    applicationTypes: any[];
    systemServices: any[];
    partitions: any[];
    replicas: any[];
    clusterLoad: any;
    imageStoreContent: any;
}> = {}) {
    return {
        getNodes: jest.fn().mockResolvedValue(overrides.nodes ?? []),
        getApplications: jest.fn().mockResolvedValue(overrides.applications ?? []),
        getApplicationTypes: jest.fn().mockResolvedValue(overrides.applicationTypes ?? []),
        getSystemServices: jest.fn().mockResolvedValue(overrides.systemServices ?? []),
        getServicePartitions: jest.fn().mockResolvedValue(overrides.partitions ?? []),
        getPartitionReplicas: jest.fn().mockResolvedValue(overrides.replicas ?? []),
        getClusterLoadInformation: jest.fn().mockResolvedValue(overrides.clusterLoad ?? {}),
        getImageStoreContent: jest.fn().mockResolvedValue(overrides.imageStoreContent ?? { storeFolders: [], storeFiles: [] }),
        getPartitionHealth: jest.fn().mockResolvedValue({}),
        getReplicaHealth: jest.fn().mockResolvedValue({}),
        getPartitionEvents: jest.fn().mockResolvedValue([]),
        getReplicaEvents: jest.fn().mockResolvedValue([]),
        getServiceHealth: jest.fn().mockResolvedValue({}),
        getServiceEvents: jest.fn().mockResolvedValue([]),
    };
}

/** Create a TreeNodeContext for testing */
export function createTestContext(overrides: Partial<TreeNodeContext> = {}): TreeNodeContext {
    const sfConfig = createMockSfConfig();
    const sfRest = createMockSfRest();

    return {
        extensionContext: new (vscode as any).ExtensionContext(),
        sfRest: sfRest as any,
        sfConfig: sfConfig as any,
        clusterEndpoint: 'https://test-cluster:19080',
        resourceUri: (vscode.Uri as any).parse('sf://test-cluster'),
        requestRefresh: jest.fn(),
        ...overrides,
    };
}

/** Create a TreeNodeContext with specific REST mock data */
export function createTestContextWithData(
    sfRestOverrides: Parameters<typeof createMockSfRest>[0] = {},
    sfConfigOverrides: Parameters<typeof createMockSfConfig>[0] = {},
    ctxOverrides: Partial<TreeNodeContext> = {},
): TreeNodeContext {
    const sfConfig = createMockSfConfig(sfConfigOverrides);
    const sfRest = createMockSfRest(sfRestOverrides);

    return {
        extensionContext: new (vscode as any).ExtensionContext(),
        sfRest: sfRest as any,
        sfConfig: sfConfig as any,
        clusterEndpoint: sfConfigOverrides.clusterEndpoint ?? 'https://test-cluster:19080',
        resourceUri: (vscode.Uri as any).parse('sf://test-cluster'),
        requestRefresh: jest.fn(),
        ...ctxOverrides,
    };
}

// ── Sample data factories ────────────────────────────────────────────

export function samplePartition(overrides: Partial<{
    id: string;
    healthState: string;
    partitionStatus: string;
    servicePartitionKind: string;
}> = {}) {
    return {
        partitionInformation: {
            id: overrides.id ?? 'aaaa-bbbb-cccc-dddd',
            servicePartitionKind: overrides.servicePartitionKind ?? 'Int64Range',
            lowKey: '-9223372036854775808',
            highKey: '9223372036854775807',
        },
        healthState: overrides.healthState ?? 'Ok',
        partitionStatus: overrides.partitionStatus ?? 'Ready',
    };
}

export function sampleReplica(overrides: Partial<{
    replicaId: string;
    healthState: string;
    replicaRole: string;
    replicaStatus: string;
    nodeName: string;
}> = {}) {
    return {
        replicaId: overrides.replicaId ?? '134150376632578978',
        healthState: overrides.healthState ?? 'Ok',
        replicaRole: overrides.replicaRole ?? 'Primary',
        replicaStatus: overrides.replicaStatus ?? 'Ready',
        nodeName: overrides.nodeName ?? '_Node_0',
        address: '{"Endpoints":{"":"http://10.0.0.4:8080"}}',
    };
}

export function sampleNode(overrides: Partial<{
    name: string;
    healthState: string;
    isSeedNode: boolean;
}> = {}) {
    return {
        name: overrides.name ?? '_Node_0',
        healthState: overrides.healthState ?? 'Ok',
        isSeedNode: overrides.isSeedNode ?? true,
        nodeStatus: 'Up',
        ipAddressOrFQDN: '10.0.0.4',
    };
}

export function sampleApplication(overrides: Partial<{
    id: string;
    name: string;
    typeName: string;
    healthState: string;
}> = {}) {
    return {
        id: overrides.id ?? 'MyApp',
        name: overrides.name ?? 'fabric:/MyApp',
        typeName: overrides.typeName ?? 'MyAppType',
        healthState: overrides.healthState ?? 'Ok',
        status: 'Ready',
    };
}

export function sampleService(overrides: Partial<{
    id: string;
    name: string;
    healthState: string;
    serviceKind: string;
}> = {}) {
    return {
        id: overrides.id ?? 'MyApp~MyService',
        name: overrides.name ?? 'fabric:/MyApp/MyService',
        healthState: overrides.healthState ?? 'Ok',
        serviceKind: overrides.serviceKind ?? 'Stateful',
        typeVersion: '1.0.0',
    };
}

// ── Assertion helpers ────────────────────────────────────────────────

/**
 * Assert that a TreeItem has a ThemeIcon with a non-null ThemeColor.
 * This catches the icon color loss regression.
 */
export function expectColoredIcon(item: vscode.TreeItem, expectedIconId?: string): void {
    expect(item.iconPath).toBeDefined();
    expect(item.iconPath).toBeInstanceOf(vscode.ThemeIcon);
    const icon = item.iconPath as vscode.ThemeIcon;
    expect(icon.color).toBeDefined();
    expect(icon.color).not.toBeNull();
    if (expectedIconId) {
        expect(icon.id).toBe(expectedIconId);
    }
}

/**
 * Assert that a TreeItem's click command passes the correct itemId.
 * This catches the itemId mismatch regression.
 */
export function expectCommandItemId(item: vscode.TreeItem, expectedItemId: string): void {
    expect(item.command).toBeDefined();
    const args = item.command!.arguments?.[0];
    expect(args).toBeDefined();
    expect(args.itemId).toBe(expectedItemId);
}

/**
 * Assert that a label contains a count (not "...").
 */
export function expectLabelWithCount(item: vscode.TreeItem, expectedCount: number): void {
    const label = typeof item.label === 'string' ? item.label : (item.label as any)?.label;
    expect(label).toContain(`(${expectedCount})`);
    expect(label).not.toContain('(...)');
}
