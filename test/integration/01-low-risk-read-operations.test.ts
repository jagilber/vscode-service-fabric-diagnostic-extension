/**
 * Comprehensive integration tests for Service Fabric cluster
 * Tests all passive read operations and node management operations
 * 
 * Requires:
 * - .env file with SF_TEST_CLUSTER and SF_TEST_THUMBPRINT
 * - Certificate installed in Cert:\CurrentUser\My\ (Windows)
 */

import { SfRest } from '../../src/sfRest';
import { SfConfiguration } from '../../src/sfConfiguration';
import { SfPs } from '../../src/sfPs';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const TEST_CLUSTER = process.env.SF_TEST_CLUSTER;
const TEST_THUMBPRINT = process.env.SF_TEST_THUMBPRINT;
const RUN_TESTS = process.env.RUN_INTEGRATION_TESTS === 'true';

// Skip all tests if not configured
const describeIfConfigured = RUN_TESTS ? describe : describe.skip;

// Mock vscode module for integration tests
jest.mock('vscode', () => ({
    window: {
        createOutputChannel: jest.fn(() => ({
            appendLine: jest.fn(),
            append: jest.fn(),
            error: jest.fn(),
            clear: jest.fn(),
            show: jest.fn(),
            dispose: jest.fn()
        })),
        showInformationMessage: jest.fn(),
        showWarningMessage: jest.fn(),
        showErrorMessage: jest.fn()
    },
    env: {
        createTelemetryLogger: jest.fn(() => ({
            logUsage: jest.fn(),
            logError: jest.fn(),
            dispose: jest.fn()
        }))
    },
    Uri: {
        parse: jest.fn((str) => ({ fsPath: str, toString: () => str })),
        file: jest.fn((str) => ({ fsPath: str, toString: () => str }))
    },
    TreeItem: class TreeItem {
        constructor(public label: string, public collapsibleState?: any) {}
    },
    TreeItemCollapsibleState: {
        None: 0,
        Collapsed: 1,
        Expanded: 2
    },
    ThemeIcon: class ThemeIcon {
        constructor(public id: string, public color?: any) {}
    },
    ThemeColor: class ThemeColor {
        constructor(public id: string) {}
    }
}), { virtual: true });

describeIfConfigured('Service Fabric Full Integration Tests', () => {
    let mockContext: any;
    let sfRest: SfRest;
    let sfConfig: SfConfiguration;
    let sfPs: SfPs;
    
    beforeAll(async () => {
        if (!TEST_CLUSTER) {
            console.log('⏭️  Skipping integration tests - SF_TEST_CLUSTER not set in .env');
            return;
        }
        
        console.log(`🔗 Testing against cluster: ${TEST_CLUSTER}`);
        console.log(`🔒 Using certificate thumbprint: ${TEST_THUMBPRINT?.substring(0, 8)}...`);
        
        mockContext = {
            extensionPath: __dirname,
            globalStorageUri: { fsPath: path.join(__dirname, 'temp-storage') },
            subscriptions: []
        };
        
        const clusterConfig = {
            endpoint: TEST_CLUSTER,
            name: 'Integration Test Cluster',
            thumbprint: TEST_THUMBPRINT
        };
        
        sfRest = new SfRest(mockContext);
        sfConfig = new SfConfiguration(mockContext, clusterConfig);
        sfPs = new SfPs();
        
        // Load certificate from Windows certificate store
        try {
            await sfPs.init();
            console.log('  ⏳ Loading certificate from Windows certificate store...');
            
            const certPem = await sfPs.getPemCertFromLocalCertStore(TEST_THUMBPRINT!);
            const keyPem = await sfPs.getPemKeyFromLocalCertStore(TEST_THUMBPRINT!);
            
            if (!certPem || !keyPem) {
                throw new Error(`Certificate with thumbprint ${TEST_THUMBPRINT} not found in Cert:\\CurrentUser\\My\\`);
            }
            
            console.log('  ✅ Certificate loaded successfully');
            
            // Connect to cluster with certificate
            await sfRest.connectToCluster(TEST_CLUSTER!, {
                thumbprint: TEST_THUMBPRINT,
                certificate: certPem,
                key: keyPem
            });
            console.log('  ✅ Successfully connected to cluster');
        } catch (error) {
            console.error('  ❌ Failed to connect to cluster:', error);
            console.error('  💡 Make sure the certificate is installed in Cert:\\CurrentUser\\My\\');
            console.error(`  💡 Run: Get-ChildItem Cert:\\CurrentUser\\My\\ | Where-Object { $_.Thumbprint -eq '${TEST_THUMBPRINT}' }`);
            throw error;
        }
    }, 30000);
    
    afterAll(() => {
        // Cleanup PowerShell session
        if (sfPs) {
            sfPs.destroy();
        }
    });
    
    describe('🏥 Cluster Health Operations (Passive)', () => {
        test('should get cluster health', async () => {
            const health = await (sfRest as any).sfApi.getClusterHealth();
            
            expect(health).toBeDefined();
            expect(health.aggregatedHealthState).toMatch(/Ok|Warning|Error|Unknown/);
            expect(health.nodeHealthStates).toBeDefined();
            expect(Array.isArray(health.nodeHealthStates)).toBe(true);
            
            console.log(`  ✅ Cluster health: ${health.aggregatedHealthState}`);
            console.log(`  📊 Nodes: ${health.nodeHealthStates?.length || 0}`);
            console.log(`  📦 Applications: ${health.applicationHealthStates?.length || 0}`);
        }, 30000);
        
        test('should get cluster manifest', async () => {
            const manifest = await (sfRest as any).sfApi.getClusterManifest();
            
            expect(manifest).toBeDefined();
            expect(manifest.manifest).toBeDefined();
            expect(manifest.manifest).toContain('ClusterManifest');
            expect(manifest.manifest).toContain('NodeTypes');
            
            console.log(`  ✅ Manifest retrieved (${manifest.manifest.length} bytes)`);
        }, 30000);
    });
    
    describe('🖥️ Node Operations (Passive)', () => {
        let testNodes: any[];
        
        beforeAll(async () => {
            const response = await (sfRest as any).sfApi.getNodeInfoList();
            testNodes = response.items || [];
        });
        
        test('should list all nodes', async () => {
            expect(testNodes).toBeDefined();
            expect(Array.isArray(testNodes)).toBe(true);
            expect(testNodes.length).toBeGreaterThan(0);
            
            console.log(`  ✅ Found ${testNodes.length} nodes`);
            testNodes.forEach(node => {
                console.log(`    - ${node.name}: ${node.healthState} (${node.nodeStatus})`);
            });
        }, 30000);
        
        test('should get specific node info', async () => {
            const firstNode = testNodes[0];
            const nodeInfo = await (sfRest as any).sfApi.getNodeInfo(firstNode.name);
            
            expect(nodeInfo).toBeDefined();
            expect(nodeInfo.name).toBe(firstNode.name);
            expect(nodeInfo.healthState).toBeDefined();
            expect(nodeInfo.nodeStatus).toBeDefined();
            expect(nodeInfo.ipAddressOrFQDN).toBeDefined();
            
            console.log(`  ✅ Node details for ${nodeInfo.name}:`);
            console.log(`    IP: ${nodeInfo.ipAddressOrFQDN}`);
            console.log(`    Type: ${nodeInfo.type}`);
            console.log(`    Status: ${nodeInfo.nodeStatus}`);
            console.log(`    Health: ${nodeInfo.healthState}`);
        }, 30000);
        
        test('should get node health for each node', async () => {
            for (const node of testNodes.slice(0, 3)) { // Test first 3 nodes
                const health = await (sfRest as any).sfApi.getNodeHealth(node.name);
                
                expect(health).toBeDefined();
                expect(health.aggregatedHealthState).toBeDefined();
                
                console.log(`  ✅ ${node.name} health: ${health.aggregatedHealthState}`);
            }
        }, 60000);
    });
    
    describe('📦 Application Operations (Passive)', () => {
        let testApps: any[];
        
        beforeAll(async () => {
            const response = await (sfRest as any).sfApi.getApplicationInfoList();
            testApps = response.items || [];
        });
        
        test('should list all applications', async () => {
            expect(testApps).toBeDefined();
            expect(Array.isArray(testApps)).toBe(true);
            expect(testApps.length).toBeGreaterThan(0);
            
            // Should always have fabric:/System
            const systemApp = testApps.find(app => app.name === 'fabric:/System');
            expect(systemApp).toBeDefined();
            
            console.log(`  ✅ Found ${testApps.length} applications`);
            testApps.forEach(app => {
                console.log(`    - ${app.name}: ${app.healthState} (${app.status})`);
            });
        }, 30000);
        
        test('should get application health', async () => {
            for (const app of testApps.slice(0, 3)) {
                const appId = app.id || app.name?.replace('fabric:/', '');
                const health = await (sfRest as any).sfApi.getApplicationHealth(appId);
                
                expect(health).toBeDefined();
                expect(health.aggregatedHealthState).toBeDefined();
                
                console.log(`  ✅ ${app.name} health: ${health.aggregatedHealthState}`);
            }
        }, 60000);
        
        test('should get application type list', async () => {
            const response = await (sfRest as any).sfApi.getApplicationTypeInfoList();
            const appTypes = response.items || [];
            
            expect(appTypes).toBeDefined();
            expect(Array.isArray(appTypes)).toBe(true);
            
            console.log(`  ✅ Found ${appTypes.length} application types`);
            appTypes.forEach((type: any) => {
                console.log(`    - ${type.name} v${type.version}`);
            });
        }, 30000);
    });
    
    describe('⚙️ Service Operations (Passive)', () => {
        test('should list System services', async () => {
            const systemAppId = 'System';
            const response = await (sfRest as any).sfApi.getServiceInfoList(systemAppId);
            const services = response.items || [];
            
            expect(services).toBeDefined();
            expect(Array.isArray(services)).toBe(true);
            expect(services.length).toBeGreaterThan(0);
            
            console.log(`  ✅ Found ${services.length} System services`);
            services.forEach((svc: any) => {
                console.log(`    - ${svc.name}: ${svc.healthState}`);
            });
        }, 30000);
        
        test('should get service health', async () => {
            const systemAppId = 'System';
            const response = await (sfRest as any).sfApi.getServiceInfoList(systemAppId);
            const services = response.items || [];
            const firstService = services[0];
            
            if (firstService) {
                const serviceId = firstService.id || firstService.name?.replace('fabric:/', '');
                const health = await (sfRest as any).sfApi.getServiceHealth(serviceId);
                
                expect(health).toBeDefined();
                expect(health.aggregatedHealthState).toBeDefined();
                
                console.log(`  ✅ Service health for ${firstService.name}: ${health.aggregatedHealthState}`);
            }
        }, 30000);
    });
    
    describe('🔧 Node Management Operations (Active - Safe)', () => {
        let testNode: any;
        let originalNodeStatus: string;
        
        beforeAll(async () => {
            const response = await (sfRest as any).sfApi.getNodeInfoList();
            const nodes = response.items || [];
            // Find a non-seed node for testing (safer)
            testNode = nodes.find((n: any) => !n.isSeedNode && n.nodeStatus === 'Up');
            
            if (!testNode) {
                console.log('  ⚠️  No suitable non-seed node found for testing');
                return;
            }
            
            originalNodeStatus = testNode.nodeStatus;
            console.log(`  🎯 Selected test node: ${testNode.name} (${originalNodeStatus})`);
        });
        
        test('should deactivate node with Pause intent', async () => {
            if (!testNode) {
                console.log('  ⏭️  Skipping - no test node available');
                return;
            }
            
            console.log(`  ⏸️  Deactivating ${testNode.name} with Pause intent...`);
            await sfRest.deactivateNode(testNode.name, 'Pause');
            
            // Wait for deactivation to take effect
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Verify deactivation
            const nodeInfo = await (sfRest as any).sfApi.getNodeInfo(testNode.name);
            console.log(`  ✅ Node status after deactivation: ${nodeInfo.nodeStatus}`);
            console.log(`  📊 Deactivation info: ${JSON.stringify(nodeInfo.nodeDeactivationInfo)}`);
            
            // Should have deactivation info
            expect(nodeInfo.nodeDeactivationInfo).toBeDefined();
        }, 60000);
        
        test('should reactivate node', async () => {
            if (!testNode) {
                console.log('  ⏭️  Skipping - no test node available');
                return;
            }
            
            console.log(`  ▶️  Reactivating ${testNode.name}...`);
            await sfRest.activateNode(testNode.name);
            
            // Wait for activation
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Verify activation
            const nodeInfo = await (sfRest as any).sfApi.getNodeInfo(testNode.name);
            console.log(`  ✅ Node status after activation: ${nodeInfo.nodeStatus}`);
            
            // Should be back to Up or going Up
            expect(nodeInfo.nodeStatus).toMatch(/Up|Enabling/);
        }, 60000);
    });
    
    describe('📊 Performance & Reliability', () => {
        test('should handle multiple parallel requests', async () => {
            const startTime = Date.now();
            
            // Fire multiple requests in parallel
            const results = await Promise.all([
                (sfRest as any).sfApi.getClusterHealth(),
                (sfRest as any).sfApi.getNodeInfoList(),
                (sfRest as any).sfApi.getApplicationInfoList()
            ]);
            
            const duration = Date.now() - startTime;
            
            expect(results[0]).toBeDefined(); // health
            expect(results[1]).toBeDefined(); // nodes
            expect(results[2]).toBeDefined(); // apps
            
            console.log(`  ✅ Parallel requests completed in ${duration}ms`);
        }, 30000);
        
        test('should handle invalid node name gracefully', async () => {
            await expect(
                (sfRest as any).sfApi.getNodeInfo('InvalidNodeName_123')
            ).rejects.toThrow();
            
            console.log('  ✅ Invalid node name handled correctly');
        }, 30000);
    });
});
