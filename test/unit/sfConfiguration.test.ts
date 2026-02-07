/**
 * Unit tests for SfConfiguration
 */

import { SfConfiguration } from '../../src/sfConfiguration';
import * as mockData from '../fixtures/mockClusterData';

describe('SfConfiguration', () => {
    let mockContext: any;
    let sfConfig: SfConfiguration;

    beforeEach(() => {
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
    });
});
