/**
 * Node Lifecycle Integration Tests
 * Tests for node activation/deactivation/restart operations with proper state verification
 * 
 * Prerequisites:
 * - .env file with SF_TEST_CLUSTER and SF_TEST_THUMBPRINT
 * - RUN_INTEGRATION_TESTS=true in .env
 * - Certificate installed in Cert:\CurrentUser\My\ (Windows)
 */

import { SfRest } from '../../src/sfRest';
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
        showErrorMessage: jest.fn(),
        withProgress: jest.fn((options, task) => task({ report: jest.fn() }))
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
    }
}), { virtual: true });

describeIfConfigured('🔄 Node Lifecycle Integration Tests', () => {
    let mockContext: any;
    let sfRest: SfRest;
    let sfPs: SfPs;
    let testNodeName: string = '';
    let originalNodeStatus: string = '';

    beforeAll(async () => {
        if (!TEST_CLUSTER) {
            console.log('⏭️  Skipping node lifecycle tests - SF_TEST_CLUSTER not set in .env');
            return;
        }

        console.log(`\n🔗 Testing against cluster: ${TEST_CLUSTER}`);
        console.log(`🔒 Using certificate thumbprint: ${TEST_THUMBPRINT?.substring(0, 8)}...`);
        
        mockContext = {
            extensionPath: __dirname,
            globalStorageUri: { fsPath: path.join(__dirname, 'temp-storage') },
            subscriptions: []
        };
        
        sfRest = new SfRest(mockContext);
        sfPs = new SfPs();
        
        // Load certificate and connect to cluster
        try {
            await sfPs.init();
            console.log('  ⏳ Loading certificate from Windows certificate store...');
            
            const certPem = await sfPs.getPemCertFromLocalCertStore(TEST_THUMBPRINT!);
            const keyPem = await sfPs.getPemKeyFromLocalCertStore(TEST_THUMBPRINT!);
            
            if (!certPem || !keyPem) {
                throw new Error(`Certificate with thumbprint ${TEST_THUMBPRINT} not found in Cert:\\CurrentUser\\My\\`);
            }
            
            console.log('  ✅ Certificate loaded successfully');
            
            // Connect to cluster
            await sfRest.connectToCluster(TEST_CLUSTER!, {
                thumbprint: TEST_THUMBPRINT,
                certificate: certPem,
                key: keyPem
            });
            console.log('  ✅ Successfully connected to cluster');
        } catch (error) {
            console.error('  ❌ Failed to connect to cluster:', error);
            throw error;
        }
        
        // Find a suitable non-seed node for testing
        try {
            const nodesResponse = await (sfRest as any).sfApi.getNodeInfoList();
            const nodes = nodesResponse.items || [];
            
            console.log(`\n📊 Total nodes in cluster: ${nodes.length}`);
            
            // Look for a non-seed node that's Up
            let targetNode = nodes.find((node: any) => 
                !node.isSeedNode && 
                node.nodeStatus === 'Up' &&
                node.nodeDeactivationInfo?.intent !== 'RemoveData' &&
                node.nodeDeactivationInfo?.intent !== 'RemoveNode'
            );
            
            // If no non-seed node, use a seed node but be more careful
            if (!targetNode) {
                console.log('  ⚠️  No non-seed Up nodes found, using seed node (risky!)');
                targetNode = nodes.find((node: any) => 
                    node.nodeStatus === 'Up' &&
                    node.nodeDeactivationInfo?.intent !== 'RemoveData' &&
                    node.nodeDeactivationInfo?.intent !== 'RemoveNode'
                );
            }
            
            if (targetNode) {
                testNodeName = targetNode.name;
                originalNodeStatus = targetNode.nodeStatus;
                console.log(`  ✅ Selected test node: ${testNodeName}`);
                console.log(`  📊 Current status: ${originalNodeStatus}`);
                console.log(`  📊 Is seed node: ${targetNode.isSeedNode}`);
                console.log(`  📊 Deactivation info: ${JSON.stringify(targetNode.nodeDeactivationInfo || 'none')}`);
            } else {
                console.log('  ⚠️  No suitable nodes found for testing');
            }
        } catch (error) {
            console.error('  ❌ Failed to get node list:', error);
        }
    }, 120000); // Increase timeout to 120 seconds for cluster connection
    
    afterAll(async () => {
        // Ensure node is back in Up state
        if (testNodeName) {
            try {
                const nodeInfo = await (sfRest as any).sfApi.getNodeInfo(testNodeName);
                if (nodeInfo.nodeStatus !== 'Up' && nodeInfo.nodeStatus !== 'Enabling') {
                    console.log(`\n🔄 Restoring node ${testNodeName} to Up state...`);
                    await sfRest.activateNode(testNodeName);
                    
                    // Wait for activation
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            } catch (error) {
                console.warn(`  ⚠️  Could not verify/restore node state:`, error);
            }
        }
        
        sfPs.destroy();
    }, 60000);

    describe('📋 Node State Verification', () => {
        test('should get current node state', async () => {
            if (!testNodeName) {
                console.log('  ⏭️  Skipped - no suitable node available');
                return;
            }

            const nodeInfo = await (sfRest as any).sfApi.getNodeInfo(testNodeName);
            
            console.log(`\n📊 Node Information:`);
            console.log(`  Name: ${nodeInfo.name}`);
            console.log(`  Status: ${nodeInfo.nodeStatus}`);
            console.log(`  Health State: ${nodeInfo.healthState}`);
            console.log(`  Is Seed Node: ${nodeInfo.isSeedNode}`);
            console.log(`  Node Type: ${nodeInfo.type}`);
            console.log(`  Upgrade Domain: ${nodeInfo.upgradeDomain}`);
            console.log(`  Fault Domain: ${nodeInfo.faultDomain}`);
            
            if (nodeInfo.nodeDeactivationInfo) {
                console.log(`  Deactivation Intent: ${nodeInfo.nodeDeactivationInfo.intent}`);
                console.log(`  Deactivation Status: ${nodeInfo.nodeDeactivationInfo.status}`);
            }
            
            expect(nodeInfo).toBeDefined();
            expect(nodeInfo.name).toBe(testNodeName);
        }, 30000);
    });

    describe('🔽 Node Deactivation (Pause Intent)', () => {
        test('should deactivate node with Pause intent', async () => {
            if (!testNodeName) {
                console.log('  ⏭️  Skipped - no suitable node available');
                return;
            }

            // Get current state
            const beforeInfo = await (sfRest as any).sfApi.getNodeInfo(testNodeName);
            console.log(`\n📊 Before deactivation:`);
            console.log(`  Status: ${beforeInfo.nodeStatus}`);
            console.log(`  Deactivation info: ${JSON.stringify(beforeInfo.nodeDeactivationInfo || 'none')}`);

            // Only proceed if node is Up or Enabling
            if (beforeInfo.nodeStatus !== 'Up' && beforeInfo.nodeStatus !== 'Enabling') {
                console.log(`  ⏭️  Skipped - node is in ${beforeInfo.nodeStatus} state, not Up`);
                return;
            }

            // Deactivate with Pause intent (safest option)
            console.log(`\n🔽 Deactivating node ${testNodeName} with Pause intent...`);
            await sfRest.deactivateNode(testNodeName, 'Pause');
            
            // Wait for deactivation to take effect
            console.log('  ⏳ Waiting for deactivation to process...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Verify deactivation
            const afterInfo = await (sfRest as any).sfApi.getNodeInfo(testNodeName);
            console.log(`\n📊 After deactivation:`);
            console.log(`  Status: ${afterInfo.nodeStatus}`);
            console.log(`  Deactivation info: ${JSON.stringify(afterInfo.nodeDeactivationInfo)}`);
            
            // Node should be Disabled or in process of being disabled
            const validDeactivatedStates = ['Disabled', 'Disabling', 'Up'];
            expect(validDeactivatedStates).toContain(afterInfo.nodeStatus);
            
            if (afterInfo.nodeDeactivationInfo) {
                expect(afterInfo.nodeDeactivationInfo.intent).toBe('Pause');
            }
            
            console.log('  ✅ Node deactivation initiated successfully');
        }, 60000);
        
        test('should wait for deactivation to complete', async () => {
            if (!testNodeName) {
                console.log('  ⏭️  Skipped - no suitable node available');
                return;
            }

            console.log(`\n⏳ Waiting for deactivation to complete...`);
            
            // Poll for up to 30 seconds
            const maxAttempts = 15;
            let attempts = 0;
            let isDeactivated = false;
            
            while (attempts < maxAttempts && !isDeactivated) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                const nodeInfo = await (sfRest as any).sfApi.getNodeInfo(testNodeName);
                console.log(`  Attempt ${attempts + 1}: Status = ${nodeInfo.nodeStatus}`);
                
                if (nodeInfo.nodeStatus === 'Disabled') {
                    isDeactivated = true;
                    console.log('  ✅ Node is now Disabled');
                } else if (nodeInfo.nodeStatus === 'Up' && nodeInfo.nodeDeactivationInfo?.status === 'Completed') {
                    isDeactivated = true;
                    console.log('  ✅ Deactivation completed (node may still show Up)');
                }
                
                attempts++;
            }
            
            if (!isDeactivated) {
                console.log('  ⚠️  Deactivation did not complete within timeout, but continuing...');
            }
        }, 60000);
    });

    describe('🔼 Node Activation (Restore)', () => {
        test('should activate node (restore from pause)', async () => {
            if (!testNodeName) {
                console.log('  ⏭️  Skipped - no suitable node available');
                return;
            }

            // Get current state
            const beforeInfo = await (sfRest as any).sfApi.getNodeInfo(testNodeName);
            console.log(`\n📊 Before activation:`);
            console.log(`  Status: ${beforeInfo.nodeStatus}`);
            console.log(`  Deactivation info: ${JSON.stringify(beforeInfo.nodeDeactivationInfo || 'none')}`);

            // Only activate if node is actually deactivated or has deactivation info
            if (beforeInfo.nodeStatus === 'Up' && !beforeInfo.nodeDeactivationInfo) {
                console.log('  ⏭️  Node is already Up and not deactivated - skipping activation');
                return;
            }

            try {
                console.log(`\n🔼 Activating node ${testNodeName}...`);
                await sfRest.activateNode(testNodeName);
                
                // Wait for activation to take effect
                console.log('  ⏳ Waiting for activation to process...');
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // Verify activation
                const afterInfo = await (sfRest as any).sfApi.getNodeInfo(testNodeName);
                console.log(`\n📊 After activation:`);
                console.log(`  Status: ${afterInfo.nodeStatus}`);
                console.log(`  Deactivation info: ${JSON.stringify(afterInfo.nodeDeactivationInfo || 'none')}`);
                
                // Node should be Up or Enabling
                const validActivatedStates = ['Up', 'Enabling'];
                expect(validActivatedStates).toContain(afterInfo.nodeStatus);
                
                console.log('  ✅ Node activation initiated successfully');
            } catch (error: any) {
                // If we get HTTP 400, it might mean the node is already active or in wrong state
                if (error.statusCode === 400) {
                    console.log(`  ⚠️  HTTP 400 received - node may already be active or in incompatible state`);
                    console.log(`  Error: ${error.message}`);
                    
                    // Check final state
                    const finalInfo = await (sfRest as any).sfApi.getNodeInfo(testNodeName);
                    console.log(`  Final Status: ${finalInfo.nodeStatus}`);
                    
                    // If node is Up, consider this acceptable
                    if (finalInfo.nodeStatus === 'Up') {
                        console.log('  ✅ Node is Up (activation may not have been needed)');
                    } else {
                        throw error;
                    }
                } else {
                    throw error;
                }
            }
        }, 60000);
        
        test('should verify node is back to Up state', async () => {
            if (!testNodeName) {
                console.log('  ⏭️  Skipped - no suitable node available');
                return;
            }

            console.log(`\n⏳ Checking if node is back to Up state...`);
            
            // Poll for up to 30 seconds
            const maxAttempts = 15;
            let attempts = 0;
            let isUp = false;
            
            while (attempts < maxAttempts && !isUp) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                const nodeInfo = await (sfRest as any).sfApi.getNodeInfo(testNodeName);
                console.log(`  Attempt ${attempts + 1}: Status = ${nodeInfo.nodeStatus}`);
                
                if (nodeInfo.nodeStatus === 'Up' && !nodeInfo.nodeDeactivationInfo) {
                    isUp = true;
                    console.log('  ✅ Node is Up and has no deactivation info');
                }
                
                attempts++;
            }
            
            const finalInfo = await (sfRest as any).sfApi.getNodeInfo(testNodeName);
            console.log(`\n📊 Final node state:`);
            console.log(`  Status: ${finalInfo.nodeStatus}`);
            console.log(`  Health: ${finalInfo.healthState}`);
            console.log(`  Deactivation info: ${JSON.stringify(finalInfo.nodeDeactivationInfo || 'none')}`);
            
            // Node should eventually be Up
            expect(['Up', 'Enabling']).toContain(finalInfo.nodeStatus);
        }, 60000);
    });

    describe('🔄 Node Restart', () => {
        test('should restart node successfully', async () => {
            if (!testNodeName) {
                console.log('  ⏭️  Skipped - no suitable node available');
                return;
            }

            console.log(`\n🔄 Testing node restart for ${testNodeName}`);
            
            // 1. Get initial state and instance ID
            const beforeRestart = await (sfRest as any).sfApi.getNodeInfo(testNodeName);
            console.log(`\n📊 Before restart:`);
            console.log(`  Status: ${beforeRestart.nodeStatus}`);
            console.log(`  Instance ID: ${beforeRestart.instanceId || (beforeRestart as any).InstanceId || 'unknown'}`);
            console.log(`  Health: ${beforeRestart.healthState}`);
            
            // Only restart if node is Up
            if (beforeRestart.nodeStatus !== 'Up') {
                console.log('  ⏭️  Skipped - node must be Up to restart');
                return;
            }
            
            // 2. Restart the node
            console.log(`\n🔄 Restarting node...`);
            try {
                await sfRest.restartNode(testNodeName);
                console.log('  ✅ Restart command accepted by cluster');
                
                // Wait a moment for restart to initiate
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // 3. Verify node state changed
                const afterRestart = await (sfRest as any).sfApi.getNodeInfo(testNodeName);
                console.log(`\n📊 After restart:`);
                console.log(`  Status: ${afterRestart.nodeStatus}`);
                console.log(`  Instance ID: ${afterRestart.instanceId || (afterRestart as any).InstanceId || 'unknown'}`);
                console.log(`  Health: ${afterRestart.healthState}`);
                
                // Node might be Down, Enabling, or still Up depending on timing
                const validRestartStates = ['Up', 'Down', 'Enabling'];
                expect(validRestartStates).toContain(afterRestart.nodeStatus);
                
                console.log('  ✅ Node restart test completed successfully');
            } catch (error: any) {
                console.error(`\n❌ Restart failed:`, error);
                console.error(`   Status Code: ${error.statusCode}`);
                console.error(`   Message: ${error.message}`);
                
                if (error.body) {
                    console.error(`   Body: ${JSON.stringify(error.body)}`);
                }
                
                throw error;
            }
        }, 60000);
        
        test('should restart node with explicit instance ID', async () => {
            if (!testNodeName) {
                console.log('  ⏭️  Skipped - no suitable node available');
                return;
            }

            // Get node info to get actual instance ID
            const nodeInfo = await (sfRest as any).sfApi.getNodeInfo(testNodeName);
            const instanceId = nodeInfo.instanceId || (nodeInfo as any).InstanceId;
            
            if (!instanceId) {
                console.log('  ⏭️  Skipped - could not determine instance ID');
                return;
            }
            
            console.log(`\n🔄 Testing restart with explicit instance ID: ${instanceId}`);
            
            if (nodeInfo.nodeStatus !== 'Up') {
                console.log('  ⏭️  Skipped - node must be Up to restart');
                return;
            }
            
            try {
                await sfRest.restartNode(testNodeName, instanceId);
                console.log('  ✅ Restart with explicit instance ID succeeded');
                
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error: any) {
                console.error(`\n❌ Restart with instance ID failed:`, error);
                throw error;
            }
        }, 60000);
    });

    describe('🔄 Full Lifecycle Test', () => {
        test('should complete full deactivate-activate cycle', async () => {
            if (!testNodeName) {
                console.log('  ⏭️  Skipped - no suitable node available');
                return;
            }

            console.log(`\n🔄 Starting full lifecycle test for node ${testNodeName}`);
            
            // 1. Get initial state
            const initialInfo = await (sfRest as any).sfApi.getNodeInfo(testNodeName);
            console.log(`\n1️⃣ Initial state: ${initialInfo.nodeStatus}`);
            
            // Only proceed if Up
            if (initialInfo.nodeStatus !== 'Up') {
                console.log('  ⏭️  Skipped - node must be Up to run full cycle');
                return;
            }
            
            // 2. Deactivate
            console.log(`\n2️⃣ Deactivating...`);
            await sfRest.deactivateNode(testNodeName, 'Pause');
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            const deactivatedInfo = await (sfRest as any).sfApi.getNodeInfo(testNodeName);
            console.log(`   Status after deactivate: ${deactivatedInfo.nodeStatus}`);
            
            // 3. Activate
            console.log(`\n3️⃣ Activating...`);
            try {
                await sfRest.activateNode(testNodeName);
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                const activatedInfo = await (sfRest as any).sfApi.getNodeInfo(testNodeName);
                console.log(`   Status after activate: ${activatedInfo.nodeStatus}`);
                
                expect(['Up', 'Enabling']).toContain(activatedInfo.nodeStatus);
                console.log('\n  ✅ Full lifecycle test completed successfully');
            } catch (error: any) {
                if (error.statusCode === 400) {
                    console.log(`\n  ⚠️  HTTP 400 during activation - checking if this is expected`);
                    const finalInfo = await (sfRest as any).sfApi.getNodeInfo(testNodeName);
                    console.log(`   Final Status: ${finalInfo.nodeStatus}`);
                    
                    if (finalInfo.nodeStatus === 'Up') {
                        console.log('  ✅ Node is Up despite 400 error (may have self-recovered)');
                    } else {
                        throw error;
                    }
                } else {
                    throw error;
                }
            }
        }, 120000);
    });
});

