/**
 * Mock Service Fabric REST client for testing
 */

import { ServiceFabricClientAPIs } from '../../src/sdk/servicefabric/servicefabric/src/serviceFabricClientAPIs';
import * as mockData from '../fixtures/mockClusterData';

/**
 * Creates a mock ServiceFabricClientAPIs with jest spies
 */
export function createMockSfApi(): jest.Mocked<Partial<ServiceFabricClientAPIs>> {
    return {
        getClusterHealth: jest.fn().mockResolvedValue(mockData.mockClusterHealth),
        getClusterManifest: jest.fn().mockResolvedValue({ manifest: mockData.mockClusterManifest }),
        getClusterVersion: jest.fn().mockResolvedValue({ version: '8.0.0' }),
        getClusterUpgradeProgress: jest.fn().mockResolvedValue({ upgradeState: 'Completed' }),
        getClusterLoad: jest.fn().mockResolvedValue({ loadMetricInformation: [] }),
        getNodeInfoList: jest.fn().mockResolvedValue(mockData.mockNodes),
        getNodeInfo: jest.fn((nodeName: string) => {
            const node = mockData.mockNodes.find(n => n.name === nodeName);
            return Promise.resolve(node || null);
        }),
        getNodeHealth: jest.fn().mockResolvedValue({ aggregatedHealthState: 'Ok' }),
        getApplicationInfoList: jest.fn().mockResolvedValue(mockData.mockApplications),
        getApplicationInfo: jest.fn((appId: string) => {
            const app = mockData.mockApplications.find(a => a.id === appId);
            return Promise.resolve(app || null);
        }),
        getApplicationTypeInfoList: jest.fn().mockResolvedValue({ items: [{ name: 'TestAppType', version: '1.0' }], continuationToken: undefined }),
        getApplicationHealth: jest.fn().mockResolvedValue({ aggregatedHealthState: 'Ok', serviceHealthStates: [] }),
        getApplicationManifest: jest.fn().mockResolvedValue({ manifest: '<ApplicationManifest/>' }),
        getServiceInfoList: jest.fn().mockResolvedValue(mockData.mockServices),
        getServiceInfo: jest.fn().mockResolvedValue(mockData.mockServices[0]),
        getServiceHealth: jest.fn().mockResolvedValue({ aggregatedHealthState: 'Ok', partitionHealthStates: [] }),
        getServiceManifest: jest.fn().mockResolvedValue({ manifest: '<ServiceManifest/>' }),
        getPartitionInfoList: jest.fn().mockResolvedValue(mockData.mockPartitions),
        getPartitionHealth: jest.fn().mockResolvedValue({ aggregatedHealthState: 'Ok', replicaHealthStates: [] }),
        getReplicaInfoList: jest.fn().mockResolvedValue(mockData.mockReplicas),
        getReplicaHealth: jest.fn().mockResolvedValue({ aggregatedHealthState: 'Ok' }),
        getImageStoreContent: jest.fn().mockResolvedValue({ storeFiles: [], storeFolders: [] }),
        getRepairTaskList: jest.fn().mockResolvedValue([]),
        getServiceEventList: jest.fn().mockResolvedValue([]),
        getPartitionEventList: jest.fn().mockResolvedValue([]),
        getPartitionReplicaEventList: jest.fn().mockResolvedValue([]),
        getDeployedApplicationInfoList: jest.fn().mockResolvedValue({ items: [{ id: 'app1' }], continuationToken: undefined }),
        getDeployedApplicationInfo: jest.fn().mockResolvedValue({ id: 'app1' }),
        getDeployedApplicationHealth: jest.fn().mockResolvedValue({ deployedServicePackageHealthStates: [] }),
        getDeployedServicePackageInfoList: jest.fn().mockResolvedValue([{ serviceManifestName: 'SvcPkg1' }]),
        getDeployedCodePackageInfoList: jest.fn().mockResolvedValue([{ codePackageName: 'Code' }]),
        getDeployedServiceReplicaInfoList: jest.fn().mockResolvedValue([{ replicaId: 'r1', partitionId: 'p1' }]),
        
        // Node operations
        enableNode: jest.fn().mockResolvedValue(undefined),
        disableNode: jest.fn().mockResolvedValue(undefined),
        restartNode: jest.fn().mockResolvedValue(undefined),
        removeNodeState: jest.fn().mockResolvedValue(undefined),
        restartReplica: jest.fn().mockResolvedValue(undefined),
        removeReplica: jest.fn().mockResolvedValue(undefined),
        
        // Application operations
        createApplication: jest.fn().mockResolvedValue(undefined),
        deleteApplication: jest.fn().mockResolvedValue(undefined),
        upgradeApplication: jest.fn().mockResolvedValue(undefined),
        unprovisionApplicationType: jest.fn().mockResolvedValue(undefined),
        
        // Service operations
        createService: jest.fn().mockResolvedValue(undefined),
        deleteService: jest.fn().mockResolvedValue(undefined),
        updateService: jest.fn().mockResolvedValue(undefined)
    } as any;
}

/**
 * Creates a mock that simulates network errors
 */
export function createFailingSfApi(errorType: keyof typeof mockData.mockHttpErrors = 'serverError'): jest.Mocked<Partial<ServiceFabricClientAPIs>> {
    const error = mockData.mockHttpErrors[errorType];
    const httpError = new Error(error.message);
    (httpError as any).statusCode = error.status;
    
    return {
        getClusterHealth: jest.fn().mockRejectedValue(httpError),
        getNodeInfoList: jest.fn().mockRejectedValue(httpError),
        getApplicationInfoList: jest.fn().mockRejectedValue(httpError),
        enableNode: jest.fn().mockRejectedValue(httpError),
        disableNode: jest.fn().mockRejectedValue(httpError)
    } as any;
}

/**
 * Creates a mock with customizable responses
 */
export class MockSfApiBuilder {
    private mock: any = {};
    
    withClusterHealth(health: any) {
        this.mock.getClusterHealth = jest.fn().mockResolvedValue(health);
        return this;
    }
    
    withNodes(nodes: any[]) {
        this.mock.getNodeInfoList = jest.fn().mockResolvedValue(nodes);
        return this;
    }
    
    withApplications(apps: any[]) {
        this.mock.getApplicationInfoList = jest.fn().mockResolvedValue(apps);
        return this;
    }
    
    withError(method: string, error: Error) {
        this.mock[method] = jest.fn().mockRejectedValue(error);
        return this;
    }
    
    build(): jest.Mocked<Partial<ServiceFabricClientAPIs>> {
        return this.mock;
    }
}
