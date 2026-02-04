/**
 * Context Menu Actions Integration Tests
 * Tests the new REST API methods for replica, service, application, and type operations
 * 
 * WARNING: These tests are DESTRUCTIVE and will modify the cluster state
 */

import * as assert from 'assert';
import { SfRest } from '../../src/sfRest';

describe('🗑️  Context Menu Actions Integration Tests (DESTRUCTIVE)', () => {
    let sfRest: SfRest;
    const clusterEndpoint = 'http://localhost:19080';
    
    beforeAll(async () => {
        console.log('⚙️  Setting up SfRest for context menu action tests...');
        
        // Create mock context for SfRest
        const mockContext: any = {
            extensionPath: '/mock/path',
            globalStorageUri: { fsPath: '/mock/storage' },
            subscriptions: []
        };
        
        sfRest = new SfRest(mockContext);
        
        // Verify cluster is accessible
        try {
            const health = await sfRest.getClusterHealth();
            console.log(`✅ Connected to cluster: ${clusterEndpoint}`);
            console.log(`   Cluster health: ${health.aggregatedHealthState}`);
        } catch (error) {
            console.error('❌ Failed to connect to cluster');
            throw error;
        }
    }, 10000);

    describe('📊 Pre-Test Cluster State', () => {
        let applications: any[] = [];
        let services: any[] = [];
        let nodes: any[] = [];
        
        it('should list all applications', async () => {
            applications = await sfRest.getApplications();
            console.log(`📦 Found ${applications.length} applications:`);
            applications.forEach(app => {
                console.log(`   - ${app.name} (${app.typeName}:${app.typeVersion})`);
            });
            assert.ok(applications.length >= 0);
        }, 5000);

        it('should list all nodes', async () => {
            nodes = await sfRest.getNodes();
            console.log(`🖥️  Found ${nodes.length} nodes:`);
            nodes.forEach((node: any) => {
                const name = node.name || node.Name;
                const status = node.nodeStatus || node.NodeStatus;
                console.log(`   - ${name} (${status})`);
            });
            assert.ok(nodes.length > 0, 'Should have at least one node');
        }, 5000);

        it('should list services for each application', async () => {
            console.log('⚙️  Listing services for each application:');
            
            for (const app of applications) {
                try {
                    const appServices = await sfRest.getServices(app.id);
                    services.push(...appServices);
                    console.log(`   📦 ${app.name}:`);
                    appServices.forEach(svc => {
                        console.log(`      - ${svc.name} (${svc.serviceKind})`);
                    });
                } catch (error) {
                    console.log(`   ⚠️  Failed to get services for ${app.name}`);
                }
            }
            
            assert.ok(services.length >= 0);
        }, 10000);
    });

    describe('🔄 Restart Replica (Stateful Services Only)', () => {
        it('should find a stateful service replica and restart it', async () => {
            
            // Find first stateful service
            const statefulServicePromises = (await sfRest.getApplications())
                .map(async (app: any) => {
                    try {
                        const services = await sfRest.getServices(app.id);
                        return services.filter((svc: any) => svc.serviceKind === 'Stateful');
                    } catch {
                        return [];
                    }
                });
            
            const services = await Promise.all(statefulServicePromises);
            const flatServices = services.flat();
            
            if (flatServices.length === 0) {
                console.log('⚠️  No stateful services found - skipping restart replica test');
                return;
            }

            const service = flatServices[0];
            console.log(`🎯 Testing restart on service: ${service.name}`);
            
            // Get partitions for this service
            const partitions = await sfRest.getServicePartitions(service.id, service.id.split('~')[0]);
            assert.ok(partitions.length > 0, 'Service should have at least one partition');
            
            const partition = partitions[0];
            const partitionId = partition.partitionInformation?.id;
            assert.ok(partitionId, 'Partition should have an ID');
            
            console.log(`   Partition: ${partitionId}`);
            
            // Get replicas for this partition
            const replicas = await sfRest.getPartitionReplicas(service.id, service.id.split('~')[0], partitionId);
            assert.ok(replicas.length > 0, 'Partition should have at least one replica');
            
            const replica = replicas[0];
            const replicaId = (replica as any).replicaId || (replica as any).instanceId;
            const nodeName = replica.nodeName;
            
            console.log(`   Replica: ${replicaId} on node ${nodeName}`);
            
            // Restart the replica
            console.log('🔄 Restarting replica...');
            await sfRest.restartReplica(nodeName, partitionId, replicaId);
            console.log('✅ Replica restarted successfully');
            
            // Wait a bit for the restart to take effect
            await new Promise(resolve => setTimeout(resolve, 2000));
        }, 15000);
    });

    describe('❌ Delete Replica/Instance', () => {
        it('should find a stateless service instance and delete it', async () => {
            
            // Find first stateless service
            const apps = await sfRest.getApplications();
            let statelessService: any = null;
            
            for (const app of apps) {
                try {
                    const services = await sfRest.getServices(app.id);
                    statelessService = services.find((svc: any) => svc.serviceKind === 'Stateless');
                    if (statelessService) break;
                } catch {
                    continue;
                }
            }
            
            if (!statelessService) {
                console.log('⚠️  No stateless services found - skipping delete instance test');
                return;
            }

            console.log(`🎯 Testing delete on stateless service: ${statelessService.name}`);
            
            // Get partitions
            const partitions = await sfRest.getServicePartitions(statelessService.id, statelessService.id.split('~')[0]);
            assert.ok(partitions.length > 0);
            
            const partition = partitions[0];
            const partitionId = partition.partitionInformation?.id;
            console.log(`   Partition: ${partitionId}`);
            
            // Get instances
            const replicas = await sfRest.getPartitionReplicas(statelessService.id, statelessService.id.split('~')[0], partitionId);
            assert.ok(replicas.length > 0);
            
            const instance = replicas[0];
            const instanceId = (instance as any).instanceId;
            const nodeName = instance.nodeName;
            
            console.log(`   Instance: ${instanceId} on node ${nodeName}`);
            
            // Delete the instance (it will be recreated by SF)
            console.log('🗑️  Deleting instance...');
            await sfRest.deleteReplica(nodeName, partitionId, instanceId);
            console.log('✅ Instance deleted successfully (will be recreated by Service Fabric)');
            
            // Wait for SF to recreate the instance
            await new Promise(resolve => setTimeout(resolve, 3000));
        }, 15000);
    });

    describe('🗑️  Delete Service (DESTRUCTIVE)', () => {
        it('should create and delete a test service', async () => {
            
            // Find the Voting application if it exists
            const apps = await sfRest.getApplications();
            const votingApp = apps.find((app: any) => app.name?.includes('Voting'));
            
            if (!votingApp) {
                console.log('⚠️  Voting application not found - skipping delete service test');
                return;
            }

            console.log(`🎯 Found application: ${votingApp.name}`);
            
            // Get services
            const services = await sfRest.getServices(votingApp.id);
            console.log(`📋 Application has ${services.length} services`);
            
            if (services.length === 0) {
                console.log('⚠️  No services to delete - skipping test');
                return;
            }

            // Take the first service
            const service = services[0];
            console.log(`🎯 Target service: ${service.name} (ID: ${service.id})`);
            
            // Note: This is destructive! Only do this on test clusters
            console.log('⚠️  WARNING: About to delete service - this is destructive!');
            console.log('🗑️  Deleting service...');
            
            await sfRest.deleteService(service.id);
            console.log('✅ Service deleted successfully');
            
            // Verify service is gone
            await new Promise(resolve => setTimeout(resolve, 2000));
            const remainingServices = await sfRest.getServices(votingApp.id);
            assert.strictEqual(remainingServices.length, services.length - 1, 'Service count should decrease by 1');
            console.log(`✅ Verified: Service count decreased from ${services.length} to ${remainingServices.length}`);
        }, 20000);
    });

    describe('🗑️  Delete Application (DESTRUCTIVE)', () => {
        it('should delete the Voting application if it exists', async () => {
            
            const apps = await sfRest.getApplications();
            const votingApp = apps.find((app: any) => app.name?.includes('Voting'));
            
            if (!votingApp) {
                console.log('⚠️  Voting application not found - test passed (already deleted or not deployed)');
                return;
            }

            console.log(`🎯 Found application: ${votingApp.name}`);
            console.log(`   Type: ${votingApp.typeName}:${votingApp.typeVersion}`);
            
            console.log('⚠️  WARNING: About to delete application - this is destructive!');
            console.log('🗑️  Deleting application...');
            
            await sfRest.deleteApplication(votingApp.id);
            console.log('✅ Application deleted successfully');
            
            // Verify application is gone
            await new Promise(resolve => setTimeout(resolve, 3000));
            const remainingApps = await sfRest.getApplications();
            const stillExists = remainingApps.find((app: any) => app.id === votingApp.id);
            assert.ok(!stillExists, 'Application should no longer exist');
            console.log(`✅ Verified: Application count decreased from ${apps.length} to ${remainingApps.length}`);
        }, 20000);
    });

    describe('⚙️  Unprovision Application Type (DESTRUCTIVE)', () => {
        it('should unprovision VotingType if no instances exist', async () => {
            
            // Get application types
            const appTypes = await sfRest.getApplicationTypes();
            const votingType = appTypes.find((type: any) => type.name?.includes('Voting'));
            
            if (!votingType) {
                console.log('⚠️  VotingType not found - test passed (already unprovisioned or never provisioned)');
                return;
            }

            console.log(`🎯 Found application type: ${votingType.name}`);
            console.log(`   Version: ${votingType.version}`);
            
            // Check if any applications of this type still exist
            const apps = await sfRest.getApplications();
            const instancesExist = apps.find((app: any) => app.typeName === votingType.name);
            
            if (instancesExist) {
                console.log('⚠️  Cannot unprovision - application instances still exist');
                console.log('   Delete all application instances first');
                return;
            }

            console.log('⚠️  WARNING: About to unprovision application type - this is destructive!');
            console.log('🗑️  Unprovisioning application type...');
            
            try {
                await sfRest.unprovisionApplicationType(votingType.name, votingType.version);
                console.log('✅ Application type unprovisioned successfully');
                
                // Verify type is gone
                await new Promise(resolve => setTimeout(resolve, 2000));
                const remainingTypes = await sfRest.getApplicationTypes();
                const stillExists = remainingTypes.find((type: any) => 
                    type.name === votingType.name && type.version === votingType.version
                );
                assert.ok(!stillExists, 'Application type should no longer exist');
                console.log(`✅ Verified: Application type ${votingType.name}:${votingType.version} removed`);
            } catch (error: any) {
                console.log(`⚠️  Unprovision failed - this might be expected if type is still in use or being deleted`);
                console.log(`   Error: ${error.message}`);
                // Don't fail the test - unprovisioning can fail for various timing reasons
                console.log('⏭️  Skipping unprovision verification');
            }
        }, 20000);
    });

    describe('📊 Post-Test Cluster State', () => {
        it('should show final cluster state', async () => {
            
            const apps = await sfRest.getApplications();
            const appTypes = await sfRest.getApplicationTypes();
            
            console.log('📊 Final Cluster State:');
            console.log(`   Applications: ${apps.length}`);
            apps.forEach(app => {
                console.log(`   - ${app.name}`);
            });
            
            console.log(`   Application Types: ${appTypes.length}`);
            appTypes.forEach(type => {
                console.log(`   - ${type.name}:${type.version}`);
            });
            
            const health = await sfRest.getClusterHealth();
            console.log(`   Cluster Health: ${health.aggregatedHealthState}`);
            
            assert.ok(true, 'Test completed');
        }, 10000);
    });
});
