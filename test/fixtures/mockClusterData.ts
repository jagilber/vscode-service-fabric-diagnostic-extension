/**
 * Mock Service Fabric cluster data for testing
 */

import * as sfModels from '../../src/sdk/servicefabric/servicefabric/src/models';

export const mockClusterHealth: sfModels.ClusterHealth = {
    aggregatedHealthState: 'Ok',
    healthEvents: [],
    unhealthyEvaluations: [],
    nodeHealthStates: [
        { name: '_Node_0', aggregatedHealthState: 'Ok' },
        { name: '_Node_1', aggregatedHealthState: 'Ok' },
        { name: '_Node_2', aggregatedHealthState: 'Warning' }
    ],
    applicationHealthStates: [
        { name: 'fabric:/System', aggregatedHealthState: 'Ok' },
        { name: 'fabric:/TestApp', aggregatedHealthState: 'Ok' }
    ]
};

export const mockNodes: sfModels.NodeInfo[] = [
    {
        name: '_Node_0',
        ipAddressOrFQDN: '127.0.0.1',
        type: 'NodeType0',
        codeVersion: '9.1.1436.9590',
        configVersion: '1.0',
        nodeStatus: 'Up',
        nodeUpTimeInSeconds: '86400',
        healthState: 'Ok',
        isSeedNode: true,
        upgradeDomain: 'UD0',
        faultDomain: 'fd:/0',
        id: { id: '1234567890abcdef' },
        instanceId: '132750000000000000',
        nodeDeactivationInfo: undefined,
        isStopped: false
    },
    {
        name: '_Node_1',
        ipAddressOrFQDN: '127.0.0.2',
        type: 'NodeType0',
        codeVersion: '9.1.1436.9590',
        configVersion: '1.0',
        nodeStatus: 'Up',
        nodeUpTimeInSeconds: '86400',
        healthState: 'Ok',
        isSeedNode: true,
        upgradeDomain: 'UD1',
        faultDomain: 'fd:/1',
        id: { id: '234567890abcdef0' },
        instanceId: '132750000000000001',
        nodeDeactivationInfo: undefined,
        isStopped: false
    },
    {
        name: '_Node_2',
        ipAddressOrFQDN: '127.0.0.3',
        type: 'NodeType0',
        codeVersion: '9.1.1436.9590',
        configVersion: '1.0',
        nodeStatus: 'Down',
        nodeUpTimeInSeconds: '0',
        healthState: 'Warning',
        isSeedNode: false,
        upgradeDomain: 'UD2',
        faultDomain: 'fd:/2',
        id: { id: '34567890abcdef01' },
        instanceId: '132750000000000002',
        nodeDeactivationInfo: undefined,
        isStopped: true
    }
];

export const mockApplications: sfModels.ApplicationInfo[] = [
    {
        id: 'TestApp',
        name: 'fabric:/TestApp',
        typeName: 'TestAppType',
        typeVersion: '1.0.0',
        status: 'Ready',
        parameters: [],
        healthState: 'Ok'
    },
    {
        id: 'System',
        name: 'fabric:/System',
        typeName: 'System',
        typeVersion: '1.0.0',
        status: 'Ready',
        parameters: [],
        healthState: 'Ok'
    }
];

export const mockServices: sfModels.ServiceInfo[] = [
    {
        id: 'TestApp/TestService',
        name: 'fabric:/TestApp/TestService',
        typeName: 'TestServiceType',
        manifestVersion: '1.0.0',
        healthState: 'Ok',
        serviceStatus: 'Active'
    }
];

export const mockSystemServices: sfModels.ServiceInfo[] = [
    {
        id: 'System/ClusterManagerService',
        name: 'fabric:/System/ClusterManagerService',
        typeName: 'ClusterManagerServiceType',
        manifestVersion: '1.0.0',
        healthState: 'Ok',
        serviceStatus: 'Active'
    },
    {
        id: 'System/NamingService',
        name: 'fabric:/System/NamingService',
        typeName: 'NamingServiceType',
        manifestVersion: '1.0.0',
        healthState: 'Ok',
        serviceStatus: 'Active'
    },
    {
        id: 'System/FaultAnalysisService',
        name: 'fabric:/System/FaultAnalysisService',
        typeName: 'FaultAnalysisServiceType',
        manifestVersion: '1.0.0',
        healthState: 'Ok',
        serviceStatus: 'Active'
    }
];

export const mockPartitions: sfModels.ServicePartitionInfo[] = [
    {
        healthState: 'Ok',
        partitionStatus: 'Ready',
        partitionInformation: {
            id: '12345678-1234-1234-1234-123456789abc',
            servicePartitionKind: 'Singleton'
        }
    }
];

export const mockReplicas: sfModels.ServiceReplicaInfo[] = [
    {
        replicaId: '132750000000000000',
        replicaStatus: 'Ready',
        healthState: 'Ok',
        address: '{"Endpoints":{"":"http://localhost:8080"}}'
    }
];

export const mockClusterManifest = `<?xml version="1.0" encoding="utf-8"?>
<ClusterManifest xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" Name="DevCluster" Version="1.0" xmlns="http://schemas.microsoft.com/2011/01/fabric">
  <NodeTypes>
    <NodeType Name="NodeType0">
      <Endpoints>
        <ClientConnectionEndpoint Port="19000" />
        <LeaseDriverEndpoint Port="19001" />
        <ClusterConnectionEndpoint Port="19002" />
        <HttpGatewayEndpoint Port="19080" Protocol="http" />
        <ServiceConnectionEndpoint Port="19006" />
        <HttpApplicationGatewayEndpoint Port="19081" Protocol="http" />
      </Endpoints>
    </NodeType>
  </NodeTypes>
</ClusterManifest>`;

export const mockApplicationManifest = `<?xml version="1.0" encoding="utf-8"?>
<ApplicationManifest ApplicationTypeName="TestAppType" ApplicationTypeVersion="1.0.0" xmlns="http://schemas.microsoft.com/2011/01/fabric" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <ServiceManifestImport>
    <ServiceManifestRef ServiceManifestName="TestServicePkg" ServiceManifestVersion="1.0.0" />
  </ServiceManifestImport>
</ApplicationManifest>`;

export const mockServiceManifest = `<?xml version="1.0" encoding="utf-8"?>
<ServiceManifest Name="TestServicePkg" Version="1.0.0" xmlns="http://schemas.microsoft.com/2011/01/fabric" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <ServiceTypes>
    <StatelessServiceType ServiceTypeName="TestServiceType" />
  </ServiceTypes>
</ServiceManifest>`;

// HTTP error responses
export const mockHttpErrors = {
    notFound: { status: 404, message: 'Not Found' },
    unauthorized: { status: 401, message: 'Unauthorized' },
    badRequest: { status: 400, message: 'Bad Request' },
    serverError: { status: 500, message: 'Internal Server Error' },
    timeout: { status: 408, message: 'Request Timeout' }
};

// Cluster configuration
export const mockClusterConfig = {
    endpoint: 'http://localhost:19080',
    name: 'TestCluster',
    thumbprint: undefined
};

export const mockSecureClusterConfig = {
    endpoint: 'https://secure-cluster.westus.cloudapp.azure.com:19080',
    name: 'SecureCluster',
    thumbprint: 'ABC123DEF456789'
};
