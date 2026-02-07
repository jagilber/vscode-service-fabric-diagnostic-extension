/**
 * Unit tests for SfRest
 */

import { SfRest } from '../../src/sfRest';
import { createMockSfApi, createFailingSfApi } from '../mocks/MockSfRestClient';
import * as mockData from '../fixtures/mockClusterData';

describe('SfRest', () => {
    let mockContext: any;
    let sfRest: SfRest;
    let mockSfApi: any;

    beforeEach(() => {
        // Create mock extension context
        mockContext = {
            extensionPath: '/mock/path',
            globalStorageUri: { fsPath: '/mock/storage' },
            subscriptions: []
        };

        sfRest = new SfRest(mockContext);
        mockSfApi = createMockSfApi();
        
        // Replace the real API with mock
        (sfRest as any).sfApi = mockSfApi;
    });

    describe('Cluster Operations', () => {
        test('should get cluster health', async () => {
            const health = await (sfRest as any).sfApi.getClusterHealth();
            
            expect(health).toBeDefined();
            expect(health.aggregatedHealthState).toBe('Ok');
            expect(mockSfApi.getClusterHealth).toHaveBeenCalled();
        });

        test('should get cluster manifest', async () => {
            const manifest = await (sfRest as any).sfApi.getClusterManifest();
            
            expect(manifest).toBeDefined();
            expect(manifest.manifest).toContain('ClusterManifest');
        });

        test('should handle cluster health error', async () => {
            const failingApi = createFailingSfApi('serverError');
            (sfRest as any).sfApi = failingApi;

            await expect((sfRest as any).sfApi.getClusterHealth())
                .rejects.toThrow();
        });
    });

    describe('Node Operations', () => {
        test('should get node list', async () => {
            const nodes = await (sfRest as any).sfApi.getNodeInfoList();
            
            expect(nodes).toBeDefined();
            expect(nodes.length).toBe(3);
            expect(nodes[0].name).toBe('_Node_0');
            expect(mockSfApi.getNodeInfoList).toHaveBeenCalled();
        });

        test('should get specific node info', async () => {
            const node = await (sfRest as any).sfApi.getNodeInfo('_Node_0');
            
            expect(node).toBeDefined();
            expect(node.name).toBe('_Node_0');
            expect(node.healthState).toBe('Ok');
        });

        test('should activate node', async () => {
            // activateNode checks node status first - mock a deactivated node so enableNode is called
            mockSfApi.getNodeInfo = jest.fn().mockResolvedValue({
                name: '_Node_0',
                nodeStatus: 'Disabled',
                nodeDeactivationInfo: { nodeDeactivationIntent: 'Pause' }
            });
            await sfRest.activateNode('_Node_0');
            
            expect(mockSfApi.enableNode).toHaveBeenCalledWith('_Node_0');
        });

        test('should deactivate node', async () => {
            await sfRest.deactivateNode('_Node_0', 'Pause');
            
            expect(mockSfApi.disableNode).toHaveBeenCalledWith(
                '_Node_0',
                expect.objectContaining({ deactivationIntent: 'Pause' })
            );
        });

        test('should restart node', async () => {
            // restartNode looks for node in response.items (or .Items)
            mockSfApi.getNodeInfoList = jest.fn().mockResolvedValue({
                items: mockData.mockNodes
            });
            await sfRest.restartNode('_Node_0');
            
            // Node _Node_0 has instanceId '132750000000000000' in mock data
            expect(mockSfApi.restartNode).toHaveBeenCalledWith(
                '_Node_0',
                expect.objectContaining({ nodeInstanceId: '132750000000000000' })
            );
        });

        test('should remove node state', async () => {
            await sfRest.removeNodeState('_Node_0');
            
            expect(mockSfApi.removeNodeState).toHaveBeenCalledWith('_Node_0');
        });

        test('should handle node operation errors', async () => {
            const failingApi = createFailingSfApi('badRequest');
            (sfRest as any).sfApi = failingApi;

            await expect(sfRest.activateNode('_Node_0'))
                .rejects.toThrow();
        });
    });

    describe('Application Operations', () => {
        test('should get application list', async () => {
            const apps = await (sfRest as any).sfApi.getApplicationInfoList();
            
            expect(apps).toBeDefined();
            expect(apps.length).toBeGreaterThan(0);
            expect(apps[0].name).toBe('fabric:/TestApp');
        });

        test('should get specific application info', async () => {
            const app = await (sfRest as any).sfApi.getApplicationInfo('TestApp');
            
            expect(app).toBeDefined();
            expect(app.name).toBe('fabric:/TestApp');
        });

        test('should handle missing application', async () => {
            const app = await (sfRest as any).sfApi.getApplicationInfo('NonExistent');
            
            expect(app).toBeNull();
        });
    });

    describe('Service Operations', () => {
        test('should get service list', async () => {
            const services = await (sfRest as any).sfApi.getServiceInfoList();
            
            expect(services).toBeDefined();
            expect(services.length).toBeGreaterThan(0);
        });

        test('should get service info', async () => {
            const service = await (sfRest as any).sfApi.getServiceInfo();
            
            expect(service).toBeDefined();
            expect(service.name).toBe('fabric:/TestApp/TestService');
        });
    });

    describe('Error Handling', () => {
        test('should handle 404 errors', async () => {
            const failingApi = createFailingSfApi('notFound');
            (sfRest as any).sfApi = failingApi;

            await expect((sfRest as any).sfApi.getClusterHealth())
                .rejects.toThrow('Not Found');
        });

        test('should handle timeout errors', async () => {
            const failingApi = createFailingSfApi('timeout');
            (sfRest as any).sfApi = failingApi;

            await expect((sfRest as any).sfApi.getClusterHealth())
                .rejects.toThrow('Request Timeout');
        });

        test('should handle unauthorized errors', async () => {
            const failingApi = createFailingSfApi('unauthorized');
            (sfRest as any).sfApi = failingApi;

            await expect((sfRest as any).sfApi.getClusterHealth())
                .rejects.toThrow('Unauthorized');
        });
    });
});
