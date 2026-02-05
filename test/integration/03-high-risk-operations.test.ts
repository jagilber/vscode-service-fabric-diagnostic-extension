/**
 * High-Risk Service Fabric API Integration Tests
 * 
 * Tests operations that create/delete resources:
 * - Application lifecycle (create/delete)
 * - Service lifecycle (create/delete)
 * - Naming service (create/delete)
 * - Image store operations
 * 
 * These tests WILL modify cluster state but clean up after themselves.
 * 
 * EXCLUDED FROM AUTO-RUN:
 * - removeNodeState() - DANGEROUS, manual only
 * - startClusterUpgrade() - DANGEROUS, manual only
 * - Fault injection (startDataLoss, startQuorumLoss, etc.)
 * - Chaos testing
 * 
 * Requires:
 * - .env file with SF_TEST_CLUSTER and SF_TEST_THUMBPRINT
 * - Certificate installed in Cert:\CurrentUser\My\ (Windows)
 * - Application type package for testing
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
const RUN_HIGH_RISK = process.env.RUN_HIGH_RISK_TESTS === 'true';

// Skip all tests if not configured or high-risk not explicitly enabled
const describeIfConfigured = (RUN_TESTS && RUN_HIGH_RISK) ? describe : describe.skip;

// Mock vscode module
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

describeIfConfigured('High-Risk Service Fabric API Tests', () => {
    let mockContext: any;
    let sfRest: SfRest;
    let sfPs: SfPs;
    const TEST_APP_NAME = 'fabric:/IntegrationTestApp';
    const TEST_SERVICE_NAME = 'fabric:/IntegrationTestApp/TestService';
    const TEST_NAMING_URI = 'IntegrationTest/TestName';
    
    beforeAll(async () => {
        if (!TEST_CLUSTER) {
            console.log('⏭️  Skipping integration tests - SF_TEST_CLUSTER not set in .env');
            return;
        }
        
        if (!RUN_HIGH_RISK) {
            console.log('⏭️  Skipping high-risk tests - RUN_HIGH_RISK_TESTS not set to true');
            console.log('   Set RUN_HIGH_RISK_TESTS=true in .env to enable');
            return;
        }
        
        console.log(`🔗 Testing against cluster: ${TEST_CLUSTER}`);
        console.log(`🔒 Using certificate thumbprint: ${TEST_THUMBPRINT?.substring(0, 8)}...`);
        console.log(`⚠️  HIGH-RISK TESTS - Will create/delete resources`);
        
        mockContext = {
            extensionPath: __dirname,
            globalStorageUri: { fsPath: path.join(__dirname, 'temp-storage') },
            subscriptions: []
        };
        
        sfRest = new SfRest(mockContext);
        sfPs = new SfPs();
        
        // Load certificate and connect
        try {
            await sfPs.init();
            const certPem = await sfPs.getPemCertFromLocalCertStore(TEST_THUMBPRINT!);
            const keyPem = await sfPs.getPemKeyFromLocalCertStore(TEST_THUMBPRINT!);
            
            await sfRest.connectToCluster(TEST_CLUSTER!, {
                thumbprint: TEST_THUMBPRINT,
                certificate: certPem,
                key: keyPem
            });
            
            console.log(`  ✅ Connected to cluster`);
        } catch (error) {
            console.error('  ❌ Failed to connect:', error);
            throw error;
        }
    }, 60000);
    
    afterAll(async () => {
        // Cleanup: Remove test resources if they exist
        if (sfRest && RUN_HIGH_RISK) {
            try {
                console.log('🧹 Cleaning up test resources...');
                
                // Try to delete test application
                try {
                    await (sfRest as any).sfApi.deleteApplication(TEST_APP_NAME.replace('fabric:/', ''));
                    console.log(`  ✅ Cleaned up ${TEST_APP_NAME}`);
                } catch (e) {
                    // Application might not exist, that's fine
                }
                
                // Try to delete test name
                try {
                    await (sfRest as any).sfApi.deleteName(TEST_NAMING_URI);
                    console.log(`  ✅ Cleaned up naming service entry`);
                } catch (e) {
                    // Name might not exist, that's fine
                }
            } catch (error) {
                console.log('  ⚠️  Cleanup errors (non-critical):', error);
            }
        }
        
        if (sfPs) {
            sfPs.destroy();
        }
    });
    
    describe('🏷️ Naming Service Operations (HIGH RISK)', () => {
        test('should create a name', async () => {
            await (sfRest as any).sfApi.createName(TEST_NAMING_URI);
            
            // Verify name exists
            const exists = await (sfRest as any).sfApi.getNameExistsInfo(TEST_NAMING_URI);
            console.log(`  ✅ Created naming service entry: ${TEST_NAMING_URI}`);
            console.log(`  📊 Name exists: ${exists}`);
            
            expect(exists).toBeTruthy();
        }, 30000);
        
        test('should put a property on name', async () => {
            await (sfRest as any).sfApi.putProperty(TEST_NAMING_URI, {
                propertyName: 'TestProperty',
                value: {
                    kind: 'String',
                    data: 'TestValue'
                }
            });
            
            // Verify property
            const property = await (sfRest as any).sfApi.getPropertyInfo(TEST_NAMING_URI, 'TestProperty');
            console.log(`  ✅ Created property: TestProperty = ${property.value?.data}`);
            
            expect(property).toBeDefined();
            expect(property.value?.data).toBe('TestValue');
        }, 30000);
        
        test('should list properties', async () => {
            const response = await (sfRest as any).sfApi.getPropertyInfoList(TEST_NAMING_URI);
            const properties = response.properties || [];
            
            console.log(`  ✅ Found ${properties.length} properties`);
            properties.forEach((prop: any) => {
                console.log(`    - ${prop.name}: ${prop.value?.data}`);
            });
            
            expect(properties.length).toBeGreaterThan(0);
        }, 30000);
        
        test('should delete property', async () => {
            await (sfRest as any).sfApi.deleteProperty(TEST_NAMING_URI, 'TestProperty');
            
            console.log(`  ✅ Deleted property: TestProperty`);
            
            // Verify property is gone
            try {
                await (sfRest as any).sfApi.getPropertyInfo(TEST_NAMING_URI, 'TestProperty');
                fail('Property should have been deleted');
            } catch (error) {
                // Expected - property doesn't exist
                expect(error).toBeDefined();
            }
        }, 30000);
        
        test('should list sub-names', async () => {
            const response = await (sfRest as any).sfApi.getSubNameInfoList(TEST_NAMING_URI);
            const subNames = response.subNames || [];
            
            console.log(`  ✅ Found ${subNames.length} sub-names`);
            
            expect(Array.isArray(subNames)).toBe(true);
        }, 30000);
        
        test('should delete name', async () => {
            await (sfRest as any).sfApi.deleteName(TEST_NAMING_URI);
            
            // Verify name is gone
            const exists = await (sfRest as any).sfApi.getNameExistsInfo(TEST_NAMING_URI);
            console.log(`  ✅ Deleted naming service entry: ${TEST_NAMING_URI}`);
            console.log(`  📊 Name exists: ${exists}`);
            
            expect(exists).toBeFalsy();
        }, 30000);
    });
    
    describe('📦 Application Lifecycle Operations (HIGH RISK)', () => {
        test.skip('should create application (requires app type provisioned)', async () => {
            // This test requires an app type to be provisioned first
            // Skipping for now as it needs app package upload
            
            console.log(`  ⏭️  Skipped - requires provisioned app type`);
            console.log(`  💡 To enable: Upload an app package and provision app type first`);
            
            /*
            // Example code (not run):
            await (sfRest as any).sfApi.createApplication({
                name: TEST_APP_NAME,
                typeName: 'TestAppType',
                typeVersion: '1.0.0',
                applicationParameters: []
            });
            
            // Verify application exists
            const appInfo = await (sfRest as any).sfApi.getApplicationInfo(TEST_APP_NAME.replace('fabric:/', ''));
            console.log(`  ✅ Created application: ${TEST_APP_NAME}`);
            expect(appInfo).toBeDefined();
            */
        });
        
        test.skip('should delete application', async () => {
            // Matches create application test
            console.log(`  ⏭️  Skipped - requires create application test`);
            
            /*
            await (sfRest as any).sfApi.deleteApplication(TEST_APP_NAME.replace('fabric:/', ''));
            console.log(`  ✅ Deleted application: ${TEST_APP_NAME}`);
            
            // Verify application is gone
            try {
                await (sfRest as any).sfApi.getApplicationInfo(TEST_APP_NAME.replace('fabric:/', ''));
                fail('Application should have been deleted');
            } catch (error) {
                expect(error).toBeDefined();
            }
            */
        });
    });
    
    describe('📊 Image Store Operations (MEDIUM-HIGH RISK)', () => {
        test('should get image store content', async () => {
            const content = await (sfRest as any).sfApi.getImageStoreRootContent();
            
            console.log(`  ✅ Retrieved image store root content`);
            console.log(`  📊 Store files: ${content.storeFiles?.length || 0}`);
            console.log(`  📂 Store folders: ${content.storeFolders?.length || 0}`);
            
            expect(content).toBeDefined();
        }, 30000);
        
        test('should get image store info', async () => {
            const info = await (sfRest as any).sfApi.getImageStoreInfo();
            
            console.log(`  ✅ Retrieved image store info`);
            console.log(`  💾 Used capacity: ${info.usedCapacityInBytes || 0} bytes`);
            console.log(`  💽 Total capacity: ${info.totalCapacityInBytes || 0} bytes`);
            
            expect(info).toBeDefined();
        }, 30000);
        
        test('should get image store root folder size', async () => {
            const size = await (sfRest as any).sfApi.getImageStoreRootFolderSize();
            
            console.log(`  ✅ Retrieved root folder size`);
            console.log(`  📏 Size: ${size.folderSize || 0} bytes`);
            
            expect(size).toBeDefined();
        }, 30000);
    });
    
    describe('📁 Batch Property Operations (HIGH RISK)', () => {
        const BATCH_TEST_NAME = 'IntegrationTest/BatchTest';
        
        beforeAll(async () => {
            // Create name for batch operations
            await (sfRest as any).sfApi.createName(BATCH_TEST_NAME);
        });
        
        afterAll(async () => {
            // Cleanup
            try {
                await (sfRest as any).sfApi.deleteName(BATCH_TEST_NAME);
            } catch (e) {
                // Ignore cleanup errors
            }
        });
        
        test('should execute property batch operations', async () => {
            const batchOperations = [
                {
                    kind: 'Put',
                    propertyName: 'BatchProp1',
                    value: {
                        kind: 'String',
                        data: 'Value1'
                    }
                },
                {
                    kind: 'Put',
                    propertyName: 'BatchProp2',
                    value: {
                        kind: 'Int64',
                        data: '42'
                    }
                }
            ];
            
            await (sfRest as any).sfApi.submitPropertyBatch(BATCH_TEST_NAME, {
                operations: batchOperations
            });
            
            // Verify properties were created
            const response = await (sfRest as any).sfApi.getPropertyInfoList(BATCH_TEST_NAME);
            const properties = response.properties || [];
            
            console.log(`  ✅ Executed batch operations`);
            console.log(`  📊 Properties created: ${properties.length}`);
            
            expect(properties.length).toBe(2);
        }, 30000);
    });
});
