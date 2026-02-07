/**
 * Unit tests for SfRest - tests actual SfRest public methods (not raw mock API)
 */

import * as vscode from 'vscode';
import { SfRest } from '../../src/sfRest';
import { createMockSfApi, createFailingSfApi } from '../mocks/MockSfRestClient';
import * as mockData from '../fixtures/mockClusterData';

// Mock the SDK to prevent real connections 
jest.mock('../../src/sdk/servicefabric/servicefabric/src/serviceFabricClientAPIs', () => ({
    ServiceFabricClientAPIs: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('../../src/services/SfDirectRestClient', () => ({
    SfDirectRestClient: jest.fn().mockImplementation(() => ({
        getClusterVersion: jest.fn().mockResolvedValue({ version: '8.0.0' }),
        getNodeInfoList: jest.fn().mockResolvedValue({ items: [{ name: '_Node_0', instanceId: '12345' }] }),
        getNodeInfo: jest.fn().mockResolvedValue({ name: '_Node_0', nodeStatus: 'Up' }),
        restartNode: jest.fn().mockResolvedValue(undefined),
        enableNode: jest.fn().mockResolvedValue(undefined),
        disableNode: jest.fn().mockResolvedValue(undefined),
        removeNodeState: jest.fn().mockResolvedValue(undefined),
        getDeployedApplicationInfoList: jest.fn().mockResolvedValue({ items: [{ id: 'app1' }] }),
    })),
}));

describe('SfRest', () => {
    let mockContext: any;
    let sfRest: SfRest;
    let mockSfApi: ReturnType<typeof createMockSfApi>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockContext = new (vscode as any).ExtensionContext();
        sfRest = new SfRest(mockContext);
        mockSfApi = createMockSfApi();
        // Replace the real API with mock
        (sfRest as any).sfApi = mockSfApi;
        // Disable direct REST to test SDK path by default
        (sfRest as any).useDirectRest = false;
    });

    // ---- HTTP utility methods ----

    describe('createSfAutoRestHttpHeaders', () => {
        test('should return JSON content type headers', () => {
            const headers = sfRest.createSfAutoRestHttpHeaders();
            expect(headers['Content-Type']).toBe('application/json');
            expect(headers['Accept']).toBe('application/json');
        });
    });

    describe('createSfAutoRestHttpOptions', () => {
        test('should create HTTP options from URI', () => {
            const opts = sfRest.createSfAutoRestHttpOptions('http://localhost:19080/test') as any;
            expect(opts.host).toBe('localhost');
            expect(opts.path).toBe('/test');
            expect(opts.rejectUnauthorized).toBe(false);
        });

        test('should parse port from URI', () => {
            const opts = sfRest.createSfAutoRestHttpOptions('https://cluster.com:443/api') as any;
            expect(opts.port).toBe(443);
        });
    });

    describe('createHttpOptions', () => {
        test('should create options with path and parameters', () => {
            const opts = sfRest.createHttpOptions('/Nodes') as any;
            expect(opts.path).toContain('/Nodes');
            expect(opts.path).toContain('api-version=6.0');
        });

        test('should strip trailing & or ? from path', () => {
            const opts = sfRest.createHttpOptions('') as any;
            expect(opts.path).not.toMatch(/[&?]$/);
        });
    });

    describe('createUriParameters', () => {
        test('should return default parameters', () => {
            const params = sfRest.createUriParameters();
            expect(params['api-version']).toBe('6.0');
        });
    });

    describe('configureClients', () => {
        test('should configure with endpoint and certificate', () => {
            sfRest.configureClients('http://localhost:19080', {
                certificate: 'test-cert',
                key: 'test-key',
                thumbprint: 'ABCD1234',
                commonName: 'test.com',
            });
            expect((sfRest as any).certificate).toBe('test-cert');
        });

        test('should configure without certificate', () => {
            sfRest.configureClients('http://localhost:19080');
            // Should not throw
        });
    });

    // ---- Cluster methods (through SfRest public API) ----

    describe('getClusterHealth', () => {
        test('should return cluster health', async () => {
            const health = await sfRest.getClusterHealth();
            expect(health).toBeDefined();
            expect(health.aggregatedHealthState).toBe('Ok');
            expect(mockSfApi.getClusterHealth).toHaveBeenCalled();
        });
    });

    describe('getClusterManifest', () => {
        test('should return cluster manifest', async () => {
            const manifest = await sfRest.getClusterManifest();
            expect(manifest).toBeDefined();
            expect(mockSfApi.getClusterManifest).toHaveBeenCalled();
        });
    });

    describe('getClusterVersion', () => {
        test('should return cluster version via SDK', async () => {
            const version = await sfRest.getClusterVersion();
            expect(version).toBeDefined();
        });

        test('should return cluster version via direct REST', async () => {
            (sfRest as any).useDirectRest = true;
            sfRest.configureClients('http://localhost:19080');
            const version = await sfRest.getClusterVersion();
            expect(version).toBeDefined();
        });
    });

    describe('getClusterUpgradeProgress', () => {
        test('should return upgrade progress', async () => {
            const progress = await sfRest.getClusterUpgradeProgress();
            expect(progress).toBeDefined();
            expect(mockSfApi.getClusterUpgradeProgress).toHaveBeenCalled();
        });

        test('should throw NetworkError on failure', async () => {
            mockSfApi.getClusterUpgradeProgress = jest.fn().mockRejectedValue(new Error('fail'));
            await expect(sfRest.getClusterUpgradeProgress()).rejects.toThrow();
        });
    });

    describe('getClusterLoadInformation', () => {
        test('should return load info', async () => {
            const load = await sfRest.getClusterLoadInformation();
            expect(load).toBeDefined();
            expect(mockSfApi.getClusterLoad).toHaveBeenCalled();
        });

        test('should throw on failure', async () => {
            mockSfApi.getClusterLoad = jest.fn().mockRejectedValue(new Error('fail'));
            await expect(sfRest.getClusterLoadInformation()).rejects.toThrow();
        });
    });

    describe('getImageStoreContent', () => {
        test('should return image store content for root', async () => {
            const content = await sfRest.getImageStoreContent();
            expect(mockSfApi.getImageStoreContent).toHaveBeenCalledWith('');
        });

        test('should accept path parameter', async () => {
            await sfRest.getImageStoreContent('WindowsFabricStore');
            expect(mockSfApi.getImageStoreContent).toHaveBeenCalledWith('WindowsFabricStore');
        });

        test('should throw on failure', async () => {
            mockSfApi.getImageStoreContent = jest.fn().mockRejectedValue(new Error('fail'));
            await expect(sfRest.getImageStoreContent()).rejects.toThrow();
        });
    });

    // ---- Node methods ----

    describe('getNodes', () => {
        test('should return nodes via pagination', async () => {
            // Mock returns paginated format
            mockSfApi.getNodeInfoList = jest.fn().mockResolvedValue({
                items: mockData.mockNodes,
                continuationToken: undefined
            });
            const nodes = await sfRest.getNodes();
            expect(nodes.length).toBe(mockData.mockNodes.length);
        });

        test('should throw on failure', async () => {
            mockSfApi.getNodeInfoList = jest.fn().mockRejectedValue(new Error('fail'));
            await expect(sfRest.getNodes()).rejects.toThrow();
        });
    });

    describe('getNode / getNodeInfo', () => {
        test('should return single node', async () => {
            const node = await sfRest.getNode('_Node_0');
            expect(node).toBeDefined();
            expect(mockSfApi.getNodeInfo).toHaveBeenCalledWith('_Node_0');
        });

        test('getNodeInfo should delegate to getNode', async () => {
            const node = await sfRest.getNodeInfo('_Node_0');
            expect(node).toBeDefined();
        });
    });

    describe('getNodeHealth', () => {
        test('should return node health', async () => {
            const health = await sfRest.getNodeHealth('_Node_0');
            expect(health).toBeDefined();
            expect(mockSfApi.getNodeHealth).toHaveBeenCalledWith('_Node_0');
        });
    });

    // ---- Application methods ----

    describe('getApplications', () => {
        test('should return applications via pagination', async () => {
            mockSfApi.getApplicationInfoList = jest.fn().mockResolvedValue({
                items: [{ id: 'App1', name: 'fabric:/App1' }],
                continuationToken: undefined
            });
            const apps = await sfRest.getApplications();
            expect(apps).toHaveLength(1);
        });
    });

    describe('getApplicationInfo', () => {
        test('should return single application', async () => {
            const app = await sfRest.getApplicationInfo('App1');
            expect(app).toBeDefined();
        });
    });

    describe('getApplicationHealth', () => {
        test('should return application health', async () => {
            const health = await sfRest.getApplicationHealth('App1');
            expect(health).toBeDefined();
        });
    });

    describe('getApplicationTypes', () => {
        test('should return application types via pagination', async () => {
            mockSfApi.getApplicationTypeInfoList = jest.fn().mockResolvedValue({
                items: [{ name: 'MyAppType', version: '1.0' }],
                continuationToken: undefined
            });
            const types = await sfRest.getApplicationTypes();
            expect(types).toHaveLength(1);
        });
    });

    // ---- Service methods ----

    describe('getServices', () => {
        test('should return services via pagination', async () => {
            mockSfApi.getServiceInfoList = jest.fn().mockResolvedValue({
                items: [{ id: 'svc1', name: 'MySvc' }],
                continuationToken: undefined
            });
            const services = await sfRest.getServices('App1');
            expect(services).toHaveLength(1);
        });
    });

    describe('getService', () => {
        test('should return single service', async () => {
            const svc = await sfRest.getService('App1', 'svc1');
            expect(svc).toBeDefined();
        });
    });

    describe('getServiceInfo', () => {
        test('should convert fabric:/ URI to API format', async () => {
            await sfRest.getServiceInfo('fabric:/App1/MySvc', 'fabric:/App1');
            expect(mockSfApi.getServiceInfo).toHaveBeenCalledWith('App1', 'App1~MySvc');
        });

        test('should pass through already-encoded IDs', async () => {
            await sfRest.getServiceInfo('App1~MySvc', 'App1');
            expect(mockSfApi.getServiceInfo).toHaveBeenCalledWith('App1', 'App1~MySvc');
        });
    });

    describe('getServiceHealth', () => {
        test('should return service health', async () => {
            const health = await sfRest.getServiceHealth('svc1', 'App1');
            expect(health).toBeDefined();
            expect(mockSfApi.getServiceHealth).toHaveBeenCalledWith('svc1');
        });

        test('should throw on failure', async () => {
            mockSfApi.getServiceHealth = jest.fn().mockRejectedValue(new Error('fail'));
            await expect(sfRest.getServiceHealth('svc1', 'App1')).rejects.toThrow();
        });
    });

    describe('getSystemServices', () => {
        test('should return system services', async () => {
            mockSfApi.getServiceInfoList = jest.fn().mockResolvedValue({
                items: [{ id: 'NamingService', name: 'NamingService' }],
                continuationToken: undefined
            });
            const services = await sfRest.getSystemServices('System');
            expect(services).toHaveLength(1);
        });
    });

    // ---- Partition & Replica ----

    describe('getServicePartitions', () => {
        test('should return partitions', async () => {
            mockSfApi.getPartitionInfoList = jest.fn().mockResolvedValue({
                items: [{ partitionInformation: { id: 'p1' } }],
                continuationToken: undefined
            });
            const partitions = await sfRest.getServicePartitions('svc1', 'App1');
            expect(partitions).toHaveLength(1);
        });

        test('should convert fabric:/ URIs', async () => {
            mockSfApi.getPartitionInfoList = jest.fn().mockResolvedValue({ items: [], continuationToken: undefined });
            await sfRest.getServicePartitions('fabric:/App1/MySvc', 'App1');
            expect(mockSfApi.getPartitionInfoList).toHaveBeenCalledWith('App1~MySvc', expect.anything());
        });

        test('should throw on failure', async () => {
            mockSfApi.getPartitionInfoList = jest.fn().mockRejectedValue(new Error('fail'));
            await expect(sfRest.getServicePartitions('svc1', 'App1')).rejects.toThrow();
        });
    });

    describe('getPartitionReplicas', () => {
        test('should return replicas', async () => {
            mockSfApi.getReplicaInfoList = jest.fn().mockResolvedValue({
                items: [{ replicaId: 'r1' }],
                continuationToken: undefined
            });
            const replicas = await sfRest.getPartitionReplicas('svc1', 'App1', 'p1');
            expect(replicas).toHaveLength(1);
        });

        test('should throw on failure', async () => {
            mockSfApi.getReplicaInfoList = jest.fn().mockRejectedValue(new Error('fail'));
            await expect(sfRest.getPartitionReplicas('svc1', 'App1', 'p1')).rejects.toThrow();
        });
    });

    describe('getPartitionHealth', () => {
        test('should return partition health', async () => {
            const health = await sfRest.getPartitionHealth('p1', 'svc1', 'App1');
            expect(health).toBeDefined();
        });

        test('should throw on failure', async () => {
            mockSfApi.getPartitionHealth = jest.fn().mockRejectedValue(new Error('fail'));
            await expect(sfRest.getPartitionHealth('p1', 'svc1', 'App1')).rejects.toThrow();
        });
    });

    describe('getReplicaHealth', () => {
        test('should return replica health', async () => {
            const health = await sfRest.getReplicaHealth('r1', 'p1', 'svc1', 'App1');
            expect(health).toBeDefined();
            expect(mockSfApi.getReplicaHealth).toHaveBeenCalledWith('p1', 'r1');
        });

        test('should throw on failure', async () => {
            mockSfApi.getReplicaHealth = jest.fn().mockRejectedValue(new Error('fail'));
            await expect(sfRest.getReplicaHealth('r1', 'p1', 'svc1', 'App1')).rejects.toThrow();
        });
    });

    // ---- Events ----

    describe('getServiceEvents', () => {
        test('should use default time range', async () => {
            const events = await sfRest.getServiceEvents('svc1');
            expect(mockSfApi.getServiceEventList).toHaveBeenCalled();
        });

        test('should use provided time range', async () => {
            await sfRest.getServiceEvents('svc1', '2024-01-01T00:00:00Z', '2024-01-02T00:00:00Z');
            expect(mockSfApi.getServiceEventList).toHaveBeenCalledWith('svc1', '2024-01-01T00:00:00Z', '2024-01-02T00:00:00Z');
        });

        test('should throw on failure', async () => {
            mockSfApi.getServiceEventList = jest.fn().mockRejectedValue(new Error('fail'));
            await expect(sfRest.getServiceEvents('svc1')).rejects.toThrow();
        });
    });

    describe('getPartitionEvents', () => {
        test('should return partition events', async () => {
            await sfRest.getPartitionEvents('p1');
            expect(mockSfApi.getPartitionEventList).toHaveBeenCalled();
        });

        test('should throw on failure', async () => {
            mockSfApi.getPartitionEventList = jest.fn().mockRejectedValue(new Error('fail'));
            await expect(sfRest.getPartitionEvents('p1')).rejects.toThrow();
        });
    });

    describe('getReplicaEvents', () => {
        test('should return replica events', async () => {
            await sfRest.getReplicaEvents('r1', 'p1');
            expect(mockSfApi.getPartitionReplicaEventList).toHaveBeenCalled();
        });

        test('should throw on failure', async () => {
            mockSfApi.getPartitionReplicaEventList = jest.fn().mockRejectedValue(new Error('fail'));
            await expect(sfRest.getReplicaEvents('r1', 'p1')).rejects.toThrow();
        });
    });

    describe('getRepairTasks', () => {
        test('should return repair tasks', async () => {
            const tasks = await sfRest.getRepairTasks();
            expect(mockSfApi.getRepairTaskList).toHaveBeenCalled();
        });

        test('should throw on failure', async () => {
            mockSfApi.getRepairTaskList = jest.fn().mockRejectedValue(new Error('fail'));
            await expect(sfRest.getRepairTasks()).rejects.toThrow();
        });
    });

    // ---- Deployed entities ----

    describe('getDeployedApplications', () => {
        test('should use SDK with pagination', async () => {
            mockSfApi.getDeployedApplicationInfoList = jest.fn().mockResolvedValue({
                items: [{ id: 'app1' }],
                continuationToken: undefined
            });
            const apps = await sfRest.getDeployedApplications('_Node_0');
            expect(apps).toHaveLength(1);
        });

        test('should use direct REST when enabled', async () => {
            (sfRest as any).useDirectRest = true;
            sfRest.configureClients('http://localhost:19080');
            const apps = await sfRest.getDeployedApplications('_Node_0');
            expect(apps).toBeDefined();
        });

        test('should throw on failure', async () => {
            mockSfApi.getDeployedApplicationInfoList = jest.fn().mockRejectedValue(new Error('fail'));
            await expect(sfRest.getDeployedApplications('_Node_0')).rejects.toThrow();
        });
    });

    describe('getDeployedServicePackages', () => {
        test('should return service packages', async () => {
            mockSfApi.getDeployedServicePackageInfoList = jest.fn().mockResolvedValue([{ serviceManifestName: 'SvcPkg1' }]);
            mockSfApi.getDeployedApplicationHealth = jest.fn().mockResolvedValue({ deployedServicePackageHealthStates: [] });
            const pkgs = await sfRest.getDeployedServicePackages('_Node_0', 'App1');
            expect(pkgs).toBeDefined();
        });

        test('should enrich with health states', async () => {
            mockSfApi.getDeployedServicePackageInfoList = jest.fn().mockResolvedValue([
                { serviceManifestName: 'SvcPkg1', name: 'SvcPkg1' }
            ]);
            mockSfApi.getDeployedApplicationHealth = jest.fn().mockResolvedValue({
                deployedServicePackageHealthStates: [
                    { serviceManifestName: 'SvcPkg1', aggregatedHealthState: 'Ok' }
                ]
            });
            const pkgs = await sfRest.getDeployedServicePackages('_Node_0', 'App1');
            expect(pkgs[0]).toBeDefined();
        });

        test('should throw on failure', async () => {
            mockSfApi.getDeployedServicePackageInfoList = jest.fn().mockRejectedValue(new Error('fail'));
            await expect(sfRest.getDeployedServicePackages('_Node_0', 'App1')).rejects.toThrow();
        });
    });

    describe('getDeployedApplicationInfo', () => {
        test('should return deployed app info', async () => {
            const info = await sfRest.getDeployedApplicationInfo('_Node_0', 'App1');
            expect(info).toBeDefined();
        });

        test('should throw on failure', async () => {
            mockSfApi.getDeployedApplicationInfo = jest.fn().mockRejectedValue(new Error('fail'));
            await expect(sfRest.getDeployedApplicationInfo('_Node_0', 'App1')).rejects.toThrow();
        });
    });

    describe('getDeployedCodePackages', () => {
        test('should return code packages', async () => {
            mockSfApi.getDeployedCodePackageInfoList = jest.fn().mockResolvedValue([{ codePackageName: 'Code' }]);
            const pkgs = await sfRest.getDeployedCodePackages('_Node_0', 'App1', 'SvcPkg1');
            expect(pkgs).toHaveLength(1);
        });

        test('should throw on failure', async () => {
            mockSfApi.getDeployedCodePackageInfoList = jest.fn().mockRejectedValue(new Error('fail'));
            await expect(sfRest.getDeployedCodePackages('_Node_0', 'App1', 'SvcPkg1')).rejects.toThrow();
        });
    });

    describe('getDeployedReplicas', () => {
        test('should return deployed replicas', async () => {
            mockSfApi.getDeployedServiceReplicaInfoList = jest.fn().mockResolvedValue([
                { replicaId: 'r1', partitionId: 'p1' }
            ]);
            mockSfApi.getPartitionHealth = jest.fn().mockResolvedValue({ replicaHealthStates: [] });
            const replicas = await sfRest.getDeployedReplicas('_Node_0', 'App1', 'SvcPkg1');
            expect(replicas).toHaveLength(1);
        });

        test('should enrich replicas with health from partition health', async () => {
            mockSfApi.getDeployedServiceReplicaInfoList = jest.fn().mockResolvedValue([
                { replicaId: 'r1', partitionId: 'p1' }
            ]);
            mockSfApi.getPartitionHealth = jest.fn().mockResolvedValue({
                replicaHealthStates: [
                    { id: 'r1', aggregatedHealthState: 'Ok' }
                ]
            });
            const replicas = await sfRest.getDeployedReplicas('_Node_0', 'App1', 'SvcPkg1');
            expect(replicas[0].replicaId).toBe('r1');
        });

        test('should throw on failure', async () => {
            mockSfApi.getDeployedServiceReplicaInfoList = jest.fn().mockRejectedValue(new Error('fail'));
            await expect(sfRest.getDeployedReplicas('_Node_0', 'App1', 'SvcPkg1')).rejects.toThrow();
        });
    });

    // ---- Node management ----

    describe('activateNode', () => {
        test('should activate deactivated node', async () => {
            mockSfApi.getNodeInfo = jest.fn().mockResolvedValue({
                name: '_Node_0',
                nodeStatus: 'Disabled',
                nodeDeactivationInfo: { nodeDeactivationIntent: 'Pause' }
            });
            await sfRest.activateNode('_Node_0');
            expect(mockSfApi.enableNode).toHaveBeenCalledWith('_Node_0');
        });

        test('should skip activation for already-up node', async () => {
            mockSfApi.getNodeInfo = jest.fn().mockResolvedValue({
                name: '_Node_0',
                nodeStatus: 'Up',
            });
            await sfRest.activateNode('_Node_0');
            expect(mockSfApi.enableNode).not.toHaveBeenCalled();
        });

        test('should throw on failure', async () => {
            mockSfApi.getNodeInfo = jest.fn().mockRejectedValue(new Error('fail'));
            await expect(sfRest.activateNode('_Node_0')).rejects.toThrow();
        });
    });

    describe('deactivateNode', () => {
        test('should deactivate node', async () => {
            mockSfApi.getNodeInfo = jest.fn().mockResolvedValue({
                name: '_Node_0',
                nodeStatus: 'Up',
            });
            await sfRest.deactivateNode('_Node_0', 'Pause');
            expect(mockSfApi.disableNode).toHaveBeenCalledWith(
                '_Node_0',
                expect.objectContaining({ deactivationIntent: 'Pause' })
            );
        });

        test('should throw when node not in valid state', async () => {
            mockSfApi.getNodeInfo = jest.fn().mockResolvedValue({
                name: '_Node_0',
                nodeStatus: 'Disabled',
            });
            await expect(sfRest.deactivateNode('_Node_0')).rejects.toThrow('Cannot deactivate');
        });

        test('should accept Enabling state', async () => {
            mockSfApi.getNodeInfo = jest.fn().mockResolvedValue({
                name: '_Node_0',
                nodeStatus: 'Enabling',
            });
            await sfRest.deactivateNode('_Node_0', 'Pause');
            expect(mockSfApi.disableNode).toHaveBeenCalled();
        });
    });

    describe('restartNode', () => {
        test('should restart node with provided instance ID', async () => {
            await sfRest.restartNode('_Node_0', '12345');
            expect(mockSfApi.restartNode).toHaveBeenCalledWith(
                '_Node_0',
                expect.objectContaining({ nodeInstanceId: '12345' })
            );
        });

        test('should auto-discover instance ID', async () => {
            mockSfApi.getNodeInfoList = jest.fn().mockResolvedValue({
                items: [{ name: '_Node_0', instanceId: '67890' }]
            });
            await sfRest.restartNode('_Node_0');
            expect(mockSfApi.restartNode).toHaveBeenCalledWith(
                '_Node_0',
                expect.objectContaining({ nodeInstanceId: '67890' })
            );
        });

        test('should throw when node not found', async () => {
            mockSfApi.getNodeInfoList = jest.fn().mockResolvedValue({ items: [] });
            await expect(sfRest.restartNode('NonExistent')).rejects.toThrow('not found');
        });

        test('should use direct REST when enabled', async () => {
            (sfRest as any).useDirectRest = true;
            sfRest.configureClients('http://localhost:19080');
            await sfRest.restartNode('_Node_0', '12345');
            // Should not throw
        });
    });

    describe('removeNodeState', () => {
        test('should remove node state via SDK', async () => {
            await sfRest.removeNodeState('_Node_0');
            expect(mockSfApi.removeNodeState).toHaveBeenCalledWith('_Node_0');
        });

        test('should remove via direct REST when enabled', async () => {
            (sfRest as any).useDirectRest = true;
            sfRest.configureClients('http://localhost:19080');
            await sfRest.removeNodeState('_Node_0');
        });
    });

    // ---- Mutation operations ----

    describe('restartReplica', () => {
        test('should restart replica', async () => {
            await sfRest.restartReplica('_Node_0', 'p1', 'r1');
            expect(mockSfApi.restartReplica).toHaveBeenCalledWith('_Node_0', 'p1', 'r1');
        });

        test('should throw on failure', async () => {
            mockSfApi.restartReplica = jest.fn().mockRejectedValue(new Error('fail'));
            await expect(sfRest.restartReplica('_Node_0', 'p1', 'r1')).rejects.toThrow();
        });
    });

    describe('deleteReplica', () => {
        test('should delete replica', async () => {
            await sfRest.deleteReplica('_Node_0', 'p1', 'r1');
            expect(mockSfApi.removeReplica).toHaveBeenCalledWith('_Node_0', 'p1', 'r1');
        });

        test('should throw on failure', async () => {
            mockSfApi.removeReplica = jest.fn().mockRejectedValue(new Error('fail'));
            await expect(sfRest.deleteReplica('_Node_0', 'p1', 'r1')).rejects.toThrow();
        });
    });

    describe('deleteService', () => {
        test('should delete service', async () => {
            await sfRest.deleteService('svc1');
            expect(mockSfApi.deleteService).toHaveBeenCalledWith('svc1');
        });

        test('should throw on failure', async () => {
            mockSfApi.deleteService = jest.fn().mockRejectedValue(new Error('fail'));
            await expect(sfRest.deleteService('svc1')).rejects.toThrow();
        });
    });

    describe('deleteApplication', () => {
        test('should delete application', async () => {
            await sfRest.deleteApplication('App1');
            expect(mockSfApi.deleteApplication).toHaveBeenCalledWith('App1');
        });

        test('should throw on failure', async () => {
            mockSfApi.deleteApplication = jest.fn().mockRejectedValue(new Error('fail'));
            await expect(sfRest.deleteApplication('App1')).rejects.toThrow();
        });
    });

    describe('unprovisionApplicationType', () => {
        test('should unprovision app type', async () => {
            await sfRest.unprovisionApplicationType('MyAppType', '1.0');
            expect(mockSfApi.unprovisionApplicationType).toHaveBeenCalledWith('MyAppType', { applicationTypeVersion: '1.0' });
        });

        test('should throw on failure', async () => {
            mockSfApi.unprovisionApplicationType = jest.fn().mockRejectedValue(new Error('fail'));
            await expect(sfRest.unprovisionApplicationType('MyAppType', '1.0')).rejects.toThrow();
        });
    });

    // ---- Manifest methods ----

    describe('getApplicationManifest', () => {
        test('should return application manifest', async () => {
            mockSfApi.getApplicationInfo = jest.fn().mockResolvedValue({ id: 'App1', typeName: 'MyAppType', typeVersion: '1.0' });
            mockSfApi.getApplicationManifest = jest.fn().mockResolvedValue({ manifest: '<xml/>' });
            const manifest = await sfRest.getApplicationManifest('App1');
            expect(manifest).toBeDefined();
        });

        test('should throw when app missing type info', async () => {
            mockSfApi.getApplicationInfo = jest.fn().mockResolvedValue({ id: 'App1' });
            await expect(sfRest.getApplicationManifest('App1')).rejects.toThrow();
        });
    });

    describe('connectToCluster', () => {
        test('should configure and verify connection', async () => {
            (sfRest as any).useDirectRest = false;
            // After connectToCluster, sfApi gets replaced by initializeClusterConnection
            // but we need getClusterVersion on the new one too
            const { ServiceFabricClientAPIs } = require('../../src/sdk/servicefabric/servicefabric/src/serviceFabricClientAPIs');
            ServiceFabricClientAPIs.mockImplementation(() => ({
                ...createMockSfApi(),
            }));
            await sfRest.connectToCluster('http://localhost:19080');
            // Should not throw
        });
    });

    describe('azureConnect', () => {
        test('should return null when no secret and no extension', async () => {
            const result = await sfRest.azureConnect();
            expect(result).toBeNull();
        });
    });
});
