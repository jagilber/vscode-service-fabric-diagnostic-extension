/**
 * Integration tests for cluster operations
 * Requires a real Service Fabric cluster
 */

import { SfRest } from '../../src/sfRest';

// Skip if no cluster endpoint is configured
const TEST_CLUSTER = process.env.SF_TEST_CLUSTER || 'http://localhost:19080';
const SKIP_INTEGRATION = !process.env.SF_TEST_CLUSTER && !process.env.RUN_INTEGRATION_TESTS;

describe.skip('Cluster Integration Tests', () => {
    let sfRest: SfRest;
    let mockContext: any;

    beforeAll(() => {
        if (SKIP_INTEGRATION) {
            console.log('⏭️  Skipping integration tests - set SF_TEST_CLUSTER to run');
            return;
        }

        mockContext = {
            extensionPath: '/mock/path',
            globalStorageUri: { fsPath: '/mock/storage' },
            subscriptions: []
        };

        sfRest = new SfRest(mockContext);
    });

    describe('Cluster Health', () => {
        test('should connect to cluster and get health', async () => {
            // This test requires a real cluster
            const health = await (sfRest as any).sfApi.getClusterHealth();
            
            expect(health).toBeDefined();
            expect(health.aggregatedHealthState).toMatch(/Ok|Warning|Error/);
            expect(health.nodeHealthStates).toBeDefined();
            expect(Array.isArray(health.nodeHealthStates)).toBe(true);
        }, 30000);

        test('should get cluster manifest', async () => {
            const manifest = await (sfRest as any).sfApi.getClusterManifest();
            
            expect(manifest).toBeDefined();
            expect(manifest.manifest).toBeDefined();
            expect(manifest.manifest).toContain('ClusterManifest');
        }, 30000);
    });

    describe('Node Operations', () => {
        test('should list all nodes', async () => {
            const nodes = await (sfRest as any).sfApi.getNodeInfoList();
            
            expect(nodes).toBeDefined();
            expect(Array.isArray(nodes)).toBe(true);
            expect(nodes.length).toBeGreaterThan(0);
            expect(nodes[0]).toHaveProperty('name');
            expect(nodes[0]).toHaveProperty('healthState');
        }, 30000);

        test('should get specific node info', async () => {
            const nodes = await (sfRest as any).sfApi.getNodeInfoList();
            const firstNode = nodes[0];
            
            const nodeInfo = await (sfRest as any).sfApi.getNodeInfo(firstNode.name);
            
            expect(nodeInfo).toBeDefined();
            expect(nodeInfo.name).toBe(firstNode.name);
        }, 30000);
    });

    describe('Application Operations', () => {
        test('should list applications', async () => {
            const apps = await (sfRest as any).sfApi.getApplicationInfoList();
            
            expect(apps).toBeDefined();
            expect(Array.isArray(apps)).toBe(true);
            // Should at least have fabric:/System
            expect(apps.length).toBeGreaterThan(0);
        }, 30000);

        test('should get fabric:/System application', async () => {
            const apps = await (sfRest as any).sfApi.getApplicationInfoList();
            const systemApp = apps.find((app: any) => app.name === 'fabric:/System');
            
            expect(systemApp).toBeDefined();
            expect(systemApp.healthState).toMatch(/Ok|Warning|Error/);
        }, 30000);
    });
});
