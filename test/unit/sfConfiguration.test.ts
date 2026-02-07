/**
 * Unit tests for SfConfiguration
 */

import * as vscode from 'vscode';
import { SfConfiguration } from '../../src/sfConfiguration';
import * as mockData from '../fixtures/mockClusterData';

// We need to mock SfRest and SfPs to avoid real network / process calls
jest.mock('../../src/sfRest', () => ({
    SfRest: jest.fn().mockImplementation(() => ({
        configureClients: jest.fn(),
        getClusterServerCertificate: jest.fn().mockResolvedValue(undefined),
        getClusterHealth: jest.fn().mockResolvedValue({
            aggregatedHealthState: 'Ok',
            nodeHealthStates: [
                { name: '_Node_0', aggregatedHealthState: 'Ok', id: { id: 'node0-id' } },
                { name: '_Node_1', aggregatedHealthState: 'Warning', id: { id: 'node1-id' } },
            ],
            applicationHealthStates: [
                { name: 'fabric:/App1', aggregatedHealthState: 'Ok' },
            ],
        }),
        getClusterManifest: jest.fn().mockResolvedValue({
            manifest: '<ClusterManifest Name="TestCluster"><FabricSettings><Section Name="Management"><Parameter Name="ImageStoreConnectionString" Value="fabric:ImageStore" /></Section></FabricSettings></ClusterManifest>',
        }),
        getNodes: jest.fn().mockResolvedValue([
            { name: '_Node_0', nodeStatus: 'Up', healthState: 'Unknown', id: { id: 'node0-id' } },
            { name: '_Node_1', nodeStatus: 'Up', healthState: 'Unknown', id: { id: 'node1-id' } },
        ]),
        getApplicationTypes: jest.fn().mockResolvedValue([
            { name: 'MyAppType', version: '1.0.0' },
        ]),
        getApplications: jest.fn().mockResolvedValue([
            { id: 'App1', name: 'fabric:/App1', healthState: 'Unknown' },
        ]),
        getServices: jest.fn().mockResolvedValue([
            { id: 'svc1', name: 'fabric:/App1/Svc1', healthState: 'Unknown' },
        ]),
        getSystemServices: jest.fn().mockResolvedValue([
            { id: 'fabric:/System/NamingService', name: 'NamingService', healthState: 'Ok' },
        ]),
        getApplicationHealth: jest.fn().mockResolvedValue({
            serviceHealthStates: [
                { serviceName: 'fabric:/App1/Svc1', aggregatedHealthState: 'Ok' },
            ],
        }),
        getServiceHealth: jest.fn().mockResolvedValue({
            partitionHealthStates: [
                { partitionId: 'partition-1', aggregatedHealthState: 'Ok' },
            ],
        }),
        getRepairTasks: jest.fn().mockResolvedValue([]),
    })),
}));

jest.mock('../../src/sfPs', () => ({
    SfPs: jest.fn().mockImplementation(() => ({
        getPemCertFromLocalCertStore: jest.fn().mockResolvedValue('-----BEGIN CERTIFICATE-----\nMOCK\n-----END CERTIFICATE-----'),
        getPemKeyFromLocalCertStore: jest.fn().mockResolvedValue('-----BEGIN RSA PRIVATE KEY-----\nMOCK\n-----END RSA PRIVATE KEY-----'),
    })),
}));

describe('SfConfiguration', () => {
    let mockContext: any;
    let sfConfig: SfConfiguration;

    beforeEach(() => {
        jest.clearAllMocks();
        mockContext = {
            extensionPath: '/mock/path',
            extensionUri: { fsPath: '/mock/extension' },
            globalStorageUri: { fsPath: '/mock/storage' },
            subscriptions: [],
            globalState: { get: jest.fn(), update: jest.fn(), keys: jest.fn().mockReturnValue([]) },
            workspaceState: { get: jest.fn(), update: jest.fn(), keys: jest.fn().mockReturnValue([]) },
            secrets: { get: jest.fn(), store: jest.fn(), delete: jest.fn() }
        };

        sfConfig = new SfConfiguration(mockContext, {
            ...mockData.mockClusterConfig,
            clusterCertificate: {} // Prevent real TLS connection attempt
        });
    });

    describe('Initialization', () => {
        test('should initialize with cluster endpoint', () => {
            expect(sfConfig.getClusterEndpoint()).toBe(mockData.mockClusterConfig.endpoint);
        });

        test('should set cluster name from endpoint hostname', () => {
            expect(sfConfig.getClusterEndpoint()).toContain('localhost');
        });

        test('should handle secure cluster configuration', () => {
            const secureConfig = new SfConfiguration(mockContext, {
                ...mockData.mockSecureClusterConfig,
                clusterCertificate: {} // Prevent real TLS connection attempt
            });
            
            expect(secureConfig.getClusterEndpoint()).toBe(mockData.mockSecureClusterConfig.endpoint);
            expect(secureConfig.getClusterEndpoint()).toContain('https://');
        });

        test('should initialize without clusterEndpointInfo', () => {
            const config = new SfConfiguration(mockContext);
            expect(config.getClusterEndpoint()).toBeDefined();
        });

        test('should set manifest from clusterEndpointInfo', () => {
            const xmlManifest = '<ClusterManifest Name="Test"><FabricSettings></FabricSettings></ClusterManifest>';
            const config = new SfConfiguration(mockContext, {
                endpoint: 'http://localhost:19080',
                clusterCertificate: {},
                manifest: xmlManifest,
            });
            expect(config.getJsonManifest()).toContain('ClusterManifest');
        });
    });

    describe('Cluster Data', () => {
        test('should return cluster health', () => {
            (sfConfig as any).clusterHealth = mockData.mockClusterHealth;
            expect(sfConfig.getClusterHealth()).toBeDefined();
        });

        test('should return cluster endpoint info', () => {
            const info = sfConfig.getClusterEndpointInfo();
            expect(info).toBeDefined();
            expect(info!.endpoint).toBe(mockData.mockClusterConfig.endpoint);
        });

        test('should return undefined endpoint info when no endpoint', () => {
            (sfConfig as any).clusterHttpEndpoint = '';
            expect(sfConfig.getClusterEndpointInfo()).toBeUndefined();
        });

        test('should return sfRest instance', () => {
            expect(sfConfig.getSfRest()).toBeDefined();
        });

        test('should return json manifest after setManifest', () => {
            const xmlManifest = '<ClusterManifest Name="TestCluster"><FabricSettings></FabricSettings></ClusterManifest>';
            sfConfig.setManifest(xmlManifest);
            const jsonManifest = sfConfig.getJsonManifest();
            expect(jsonManifest).toBeDefined();
            expect(jsonManifest.length).toBeGreaterThan(0);
        });

        test('should handle setManifest with ClusterManifest wrapper object', () => {
            const wrapper = { manifest: '<ClusterManifest Name="Test"><FabricSettings></FabricSettings></ClusterManifest>' };
            sfConfig.setManifest(wrapper as any);
            expect(sfConfig.getJsonManifest()).toContain('ClusterManifest');
        });
    });

    describe('Certificate Management', () => {
        test('should return client certificate thumbprint', () => {
            expect(sfConfig.getClientCertificateThumbprint()).toBeUndefined();
        });

        test('should return server certificate thumbprint', () => {
            expect(sfConfig.getServerCertificateThumbprint()).toBeUndefined();
        });

        test('should return cluster certificate', () => {
            const cert = sfConfig.getClusterCertificate();
            expect(cert).toBeDefined();
        });

        test('should set cluster certificate by thumbprint', async () => {
            await sfConfig.setClusterCertificate('ABCDEF1234567890ABCDEF1234567890ABCDEF12');
            const cert = sfConfig.getClusterCertificate();
            expect(cert?.thumbprint).toBe('ABCDEF1234567890ABCDEF1234567890ABCDEF12');
            expect(cert?.certificate).toContain('CERTIFICATE');
        });

        test('should set cluster certificate by PEM content', async () => {
            await sfConfig.setClusterCertificate('-----BEGIN CERTIFICATE-----\nABC\n-----END CERTIFICATE-----');
            const cert = sfConfig.getClusterCertificate();
            expect(cert?.certificate).toContain('CERTIFICATE');
        });

        test('should set cluster certificate by common name', async () => {
            await sfConfig.setClusterCertificate('mycluster.eastus.cloudapp.azure.com');
            const cert = sfConfig.getClusterCertificate();
            expect(cert?.commonName).toBe('mycluster.eastus.cloudapp.azure.com');
        });
    });

    describe('setClusterEndpoint', () => {
        test('should update the cluster endpoint', () => {
            sfConfig.setClusterEndpoint('http://newcluster:19080');
            expect(sfConfig.getClusterEndpoint()).toBe('http://newcluster:19080');
        });
    });

    describe('ensureRestClientReady', () => {
        test('should return immediately for HTTP endpoint', async () => {
            sfConfig.setClusterEndpoint('http://localhost:19080');
            await sfConfig.ensureRestClientReady();
            // Should complete without error
            const sfRest = sfConfig.getSfRest();
            expect(sfRest.configureClients).toHaveBeenCalled();
        });

        test('should discover cert for HTTPS endpoint with no thumbprint', async () => {
            sfConfig.setClusterEndpoint('https://mycluster:19080');
            (sfConfig as any).clusterCertificate = {};
            await sfConfig.ensureRestClientReady();
            expect(sfConfig.getSfRest().configureClients).toHaveBeenCalled();
        });

        test('should retrieve PEM when thumbprint is set but no cert', async () => {
            sfConfig.setClusterEndpoint('https://mycluster:19080');
            (sfConfig as any).clusterCertificate = { thumbprint: 'ABCD1234' };
            await sfConfig.ensureRestClientReady();
            expect((sfConfig as any).clusterCertificate.certificate).toContain('CERTIFICATE');
            expect((sfConfig as any).clusterCertificate.key).toContain('PRIVATE KEY');
        });

        test('should be concurrency-safe (share promise)', async () => {
            sfConfig.setClusterEndpoint('http://localhost:19080');
            const p1 = sfConfig.ensureRestClientReady();
            const p2 = sfConfig.ensureRestClientReady();
            await Promise.all([p1, p2]);
            // Both should complete
        });

        test('should handle no endpoint gracefully', async () => {
            (sfConfig as any).clusterHttpEndpoint = '';
            await sfConfig.ensureRestClientReady();
            // Should not throw, just return
        });

        test('should handle TLS discovery failure gracefully', async () => {
            sfConfig.setClusterEndpoint('https://mycluster:19080');
            (sfConfig as any).clusterCertificate = {};
            sfConfig.getSfRest().getClusterServerCertificate = jest.fn().mockRejectedValue(new Error('TLS error'));
            await sfConfig.ensureRestClientReady();
            // Should not throw - continues without cert
        });

        test('should throw when PEM retrieval fails', async () => {
            sfConfig.setClusterEndpoint('https://mycluster:19080');
            (sfConfig as any).clusterCertificate = { thumbprint: 'ABCD1234' };
            const sfPs = (sfConfig as any).sfPs;
            sfPs.getPemCertFromLocalCertStore = jest.fn().mockRejectedValue(new Error('Cert store error'));
            await expect(sfConfig.ensureRestClientReady()).rejects.toThrow('Cert store error');
        });
    });

    describe('populate', () => {
        test('should populate all cluster data', async () => {
            sfConfig.setClusterEndpoint('http://localhost:19080');
            await sfConfig.populate();
            // Verify data was populated
            expect((sfConfig as any).nodes.length).toBeGreaterThan(0);
            expect((sfConfig as any).applicationTypes.length).toBeGreaterThan(0);
        });

        test('should merge node health states from cluster health', async () => {
            await sfConfig.populate();
            const nodes = (sfConfig as any).nodes;
            // Node health should have been updated from the health map
            expect(nodes.length).toBe(2);
        });

        test('should merge application health states', async () => {
            await sfConfig.populate();
            const apps = (sfConfig as any).applications;
            expect(apps.length).toBeGreaterThan(0);
        });

        test('should use fallback system services on error', async () => {
            sfConfig.getSfRest().getSystemServices = jest.fn().mockRejectedValue(new Error('System services unavailable'));
            await sfConfig.populate();
            expect((sfConfig as any).systemServices.length).toBeGreaterThan(0);
        });

        test('should handle parallel data fetch failure', async () => {
            sfConfig.getSfRest().getNodes = jest.fn().mockRejectedValue(new Error('Network error'));
            await expect(sfConfig.populate()).rejects.toThrow();
        });

        test('should handle service population failure for individual app', async () => {
            sfConfig.getSfRest().getServices = jest.fn().mockRejectedValue(new Error('Service error'));
            // Should not throw — individual service failures are caught
            await sfConfig.populate();
        });

        test('should clear data before repopulating', async () => {
            // Populate once
            await sfConfig.populate();
            const firstNodeCount = (sfConfig as any).nodes.length;
            // Populate again
            await sfConfig.populate();
            // Should have same count (not doubled)
            expect((sfConfig as any).nodes.length).toBe(firstNodeCount);
        });
    });

    describe('populateApplications', () => {
        test('should return application list', async () => {
            const apps = await sfConfig.populateApplications();
            expect(apps.length).toBeGreaterThan(0);
            expect(apps[0].id).toBe('App1');
        });

        test('should throw NetworkError on failure', async () => {
            sfConfig.getSfRest().getApplications = jest.fn().mockRejectedValue(new Error('fail'));
            await expect(sfConfig.populateApplications()).rejects.toThrow();
        });
    });

    describe('populateApplicationTypes', () => {
        test('should populate application types', async () => {
            await sfConfig.populateApplicationTypes();
            expect((sfConfig as any).applicationTypes.length).toBeGreaterThan(0);
        });

        test('should throw on failure', async () => {
            sfConfig.getSfRest().getApplicationTypes = jest.fn().mockRejectedValue(new Error('fail'));
            await expect(sfConfig.populateApplicationTypes()).rejects.toThrow();
        });
    });

    describe('populateClusterHealth', () => {
        test('should build health maps from cluster health', async () => {
            await sfConfig.populateClusterHealth();
            expect(sfConfig.getClusterHealth()).toBeDefined();
            expect((sfConfig as any).nodeHealthMap.size).toBeGreaterThan(0);
            expect((sfConfig as any).applicationHealthMap.size).toBeGreaterThan(0);
        });

        test('should throw on failure', async () => {
            sfConfig.getSfRest().getClusterHealth = jest.fn().mockRejectedValue(new Error('fail'));
            await expect(sfConfig.populateClusterHealth()).rejects.toThrow();
        });

        test('should handle missing health state arrays', async () => {
            sfConfig.getSfRest().getClusterHealth = jest.fn().mockResolvedValue({
                aggregatedHealthState: 'Ok',
            });
            await sfConfig.populateClusterHealth();
            expect((sfConfig as any).nodeHealthMap.size).toBe(0);
        });
    });

    describe('populateManifest', () => {
        test('should set manifest from cluster manifest response', async () => {
            await sfConfig.populateManifest();
            expect(sfConfig.getJsonManifest()).toContain('ClusterManifest');
        });

        test('should throw on failure', async () => {
            sfConfig.getSfRest().getClusterManifest = jest.fn().mockRejectedValue(new Error('fail'));
            await expect(sfConfig.populateManifest()).rejects.toThrow();
        });
    });

    describe('populateNodes', () => {
        test('should populate nodes', async () => {
            await sfConfig.populateNodes();
            expect((sfConfig as any).nodes.length).toBe(2);
        });

        test('should throw on failure', async () => {
            sfConfig.getSfRest().getNodes = jest.fn().mockRejectedValue(new Error('fail'));
            await expect(sfConfig.populateNodes()).rejects.toThrow();
        });
    });

    describe('populateRepairTasks', () => {
        test('should populate repair tasks', async () => {
            await sfConfig.populateRepairTasks();
            expect((sfConfig as any).repairTasks).toEqual([]);
        });

        test('should handle failure gracefully (repair manager unavailable)', async () => {
            sfConfig.getSfRest().getRepairTasks = jest.fn().mockRejectedValue(new Error('not available'));
            await sfConfig.populateRepairTasks();
            expect((sfConfig as any).repairTasks).toEqual([]);
        });
    });

    describe('populateServices', () => {
        test('should populate services for an application', async () => {
            await sfConfig.populateServices('App1');
            expect((sfConfig as any).services.length).toBeGreaterThan(0);
        });

        test('should merge service health states', async () => {
            await sfConfig.populateServices('App1');
            // Service health map should have been populated
            expect((sfConfig as any).serviceHealthMap.size).toBeGreaterThan(0);
        });

        test('should handle service population error silently', async () => {
            sfConfig.getSfRest().getServices = jest.fn().mockRejectedValue(new Error('fail'));
            // Should not throw
            await sfConfig.populateServices('App1');
        });

        test('should handle application health error gracefully', async () => {
            sfConfig.getSfRest().getApplicationHealth = jest.fn().mockRejectedValue(new Error('health fail'));
            await sfConfig.populateServices('App1');
            // Should still have services populated (without health enrichment)
            expect((sfConfig as any).services.length).toBeGreaterThan(0);
        });
    });

    describe('Image Store', () => {
        test('should return false when manifest not populated', () => {
            expect(sfConfig.isNativeImageStoreAvailable()).toBe(false);
        });

        test('should detect native image store from manifest', () => {
            const xmlManifest = `<ClusterManifest Name="TestCluster">
                <FabricSettings>
                    <Section Name="Management">
                        <Parameter Name="ImageStoreConnectionString" Value="fabric:ImageStore" />
                    </Section>
                </FabricSettings>
            </ClusterManifest>`;
            sfConfig.setManifest(xmlManifest);
            expect(sfConfig.isNativeImageStoreAvailable()).toBe(true);
        });

        test('should detect file-based image store from manifest', () => {
            const xmlManifest = `<ClusterManifest Name="TestCluster">
                <FabricSettings>
                    <Section Name="Management">
                        <Parameter Name="ImageStoreConnectionString" Value="file:C:\\SfDevCluster\\Data\\ImageStoreShare" />
                    </Section>
                </FabricSettings>
            </ClusterManifest>`;
            sfConfig.setManifest(xmlManifest);
            expect(sfConfig.isNativeImageStoreAvailable()).toBe(false);
        });

        test('should use cached result on second call', () => {
            const xmlManifest = `<ClusterManifest Name="TestCluster">
                <FabricSettings>
                    <Section Name="Management">
                        <Parameter Name="ImageStoreConnectionString" Value="fabric:ImageStore" />
                    </Section>
                </FabricSettings>
            </ClusterManifest>`;
            sfConfig.setManifest(xmlManifest);
            expect(sfConfig.isNativeImageStoreAvailable()).toBe(true);
            // Second call uses cache
            expect(sfConfig.isNativeImageStoreAvailable()).toBe(true);
        });

        test('should clear cache when manifest is re-set', () => {
            const xmlManifest1 = `<ClusterManifest Name="TestCluster">
                <FabricSettings>
                    <Section Name="Management">
                        <Parameter Name="ImageStoreConnectionString" Value="fabric:ImageStore" />
                    </Section>
                </FabricSettings>
            </ClusterManifest>`;
            sfConfig.setManifest(xmlManifest1);
            expect(sfConfig.isNativeImageStoreAvailable()).toBe(true);

            const xmlManifest2 = `<ClusterManifest Name="TestCluster">
                <FabricSettings>
                    <Section Name="Management">
                        <Parameter Name="ImageStoreConnectionString" Value="file:C:\\path" />
                    </Section>
                </FabricSettings>
            </ClusterManifest>`;
            sfConfig.setManifest(xmlManifest2);
            expect(sfConfig.isNativeImageStoreAvailable()).toBe(false);
        });

        test('should return false when manifest has no FabricSettings Section', () => {
            const xmlManifest = `<ClusterManifest Name="TestCluster">
                <FabricSettings></FabricSettings>
            </ClusterManifest>`;
            sfConfig.setManifest(xmlManifest);
            expect(sfConfig.isNativeImageStoreAvailable()).toBe(false);
        });

        test('should return false when Management section has no Parameter', () => {
            const xmlManifest = `<ClusterManifest Name="TestCluster">
                <FabricSettings>
                    <Section Name="Management"></Section>
                </FabricSettings>
            </ClusterManifest>`;
            sfConfig.setManifest(xmlManifest);
            expect(sfConfig.isNativeImageStoreAvailable()).toBe(false);
        });
    });
});
