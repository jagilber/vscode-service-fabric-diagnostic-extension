/**
 * Cluster Fixture Generator
 * 
 * Generates synthetic SF REST API response data for different cluster profiles.
 * Each profile produces a directory of JSON files matching the Service Fabric
 * REST API response format (PascalCase properties, api-version=6.0/6.4).
 * 
 * Usage:
 *   import { generateClusterFixtures, ClusterProfileConfig } from './clusterGenerator';
 *   generateClusterFixtures({ nodeCount: 5, ... }, 'test/fixtures/clusters/5-node-azure');
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// ── Types ───────────────────────────────────────────────────────────

export interface ClusterProfileConfig {
    /** Profile name (used for directory) */
    name: string;
    /** Number of cluster nodes */
    nodeCount: number;
    /** Node type definitions [{name, count}] — distributes nodes across types */
    nodeTypes?: { name: string; count: number }[];
    /** Application definitions (not counting System) */
    applications: AppConfig[];
    /** Health distribution: fraction of items with each state */
    healthMix?: { ok: number; warning: number; error: number };
    /** Cluster code version */
    codeVersion?: string;
    /** Whether to include repair tasks */
    includeRepairTasks?: boolean;
    /** Custom cluster load metrics */
    loadMetrics?: LoadMetricConfig[];
    /** Image store content */
    imageStore?: { folders: string[]; files: { path: string; size: number }[] };
}

export interface AppConfig {
    typeName: string;
    typeVersion?: string;
    /** Number of app instances of this type */
    instanceCount?: number;
    services: ServiceConfig[];
}

export interface ServiceConfig {
    typeName: string;
    serviceKind: 'Stateful' | 'Stateless';
    partitionScheme: 'Singleton' | 'Int64Range' | 'Named';
    partitionCount?: number;
    replicaCount?: number;
    /** Per-service health override */
    healthState?: string;
}

export interface LoadMetricConfig {
    name: string;
    clusterLoad: number;
    clusterCapacity: number;
    isClusterCapacityViolation?: boolean;
}

// ── GUID / ID helpers ───────────────────────────────────────────────

function guid(): string {
    return crypto.randomUUID();
}

function nodeId(index: number): string {
    return crypto.createHash('md5').update(`node-${index}`).digest('hex').substring(0, 16);
}

function pickHealth(mix: { ok: number; warning: number; error: number }, index: number): string {
    const total = mix.ok + mix.warning + mix.error;
    const normalized = index % total;
    if (normalized < mix.ok) { return 'Ok'; }
    if (normalized < mix.ok + mix.warning) { return 'Warning'; }
    return 'Error';
}

// ── Generator ───────────────────────────────────────────────────────

export function generateClusterProfile(config: ClusterProfileConfig): ClusterFixtureData {
    const mix = config.healthMix ?? { ok: 10, warning: 0, error: 0 };
    const codeVersion = config.codeVersion ?? '9.1.1583.9590';

    // Distribute nodes across types
    const nodeTypes = config.nodeTypes ?? [{ name: 'NodeType0', count: config.nodeCount }];
    let nodeIndex = 0;

    // ── Nodes ─────────────────────────────────────────────────────
    const nodes: any[] = [];
    for (const nt of nodeTypes) {
        for (let i = 0; i < nt.count; i++) {
            const health = pickHealth(mix, nodeIndex);
            const isDown = health === 'Error';
            nodes.push({
                Name: `_${nt.name}_${i}`,
                IpAddressOrFQDN: `10.0.0.${4 + nodeIndex}`,
                Type: nt.name,
                CodeVersion: codeVersion,
                ConfigVersion: '1.0',
                NodeStatus: isDown ? 'Down' : 'Up',
                NodeUpTimeInSeconds: isDown ? '0' : String(86400 + nodeIndex * 3600),
                HealthState: health,
                IsSeedNode: i < Math.min(3, nt.count),
                UpgradeDomain: `UD${i % 5}`,
                FaultDomain: `fd:/${i % 3}`,
                Id: { Id: nodeId(nodeIndex) },
                InstanceId: String(132750000000000000n + BigInt(nodeIndex)),
                NodeDeactivationInfo: undefined,
                IsStopped: isDown,
            });
            nodeIndex++;
        }
    }

    // ── Cluster Health ────────────────────────────────────────────
    const nodeHealthStates = nodes.map(n => ({
        Name: n.Name,
        AggregatedHealthState: n.HealthState,
    }));

    // ── Applications & Services ──────────────────────────────────
    const applications: any[] = [];
    const applicationTypes: any[] = [];
    const servicesByApp = new Map<string, any[]>();
    const partitionsByService = new Map<string, any[]>();
    const replicasByPartition = new Map<string, any[]>();
    const appManifests = new Map<string, string>();
    const serviceManifests = new Map<string, string>();

    let appIndex = 0;
    for (const appCfg of config.applications) {
        const typeVersion = appCfg.typeVersion ?? '1.0.0';
        applicationTypes.push({
            Name: appCfg.typeName,
            Version: typeVersion,
            Status: 'Available',
            DefaultParameterList: [],
        });

        const instanceCount = appCfg.instanceCount ?? 1;
        for (let inst = 0; inst < instanceCount; inst++) {
            const appName = instanceCount > 1
                ? `${appCfg.typeName}Instance${inst}`
                : appCfg.typeName.replace('Type', '');
            const appId = appName;
            const health = pickHealth(mix, appIndex);

            applications.push({
                Id: appId,
                Name: `fabric:/${appName}`,
                TypeName: appCfg.typeName,
                TypeVersion: typeVersion,
                Status: 'Ready',
                Parameters: [],
                HealthState: health,
            });

            // Services for this app
            const services: any[] = [];
            for (const svcCfg of appCfg.services) {
                const svcName = svcCfg.typeName.replace('Type', '');
                const svcId = `${appId}/${svcName}`;
                const svcHealth = svcCfg.healthState ?? pickHealth(mix, appIndex + services.length);

                services.push({
                    Id: svcId,
                    Name: `fabric:/${appName}/${svcName}`,
                    TypeName: svcCfg.typeName,
                    ManifestVersion: typeVersion,
                    HealthState: svcHealth,
                    ServiceStatus: 'Active',
                    ServiceKind: svcCfg.serviceKind,
                    IsServiceGroup: false,
                });

                // Partitions
                const partCount = svcCfg.partitionCount ?? 1;
                const partitions: any[] = [];
                for (let p = 0; p < partCount; p++) {
                    const partId = guid();
                    const partHealth = pickHealth(mix, appIndex + p);
                    const partInfo: any = {
                        Id: partId,
                        ServicePartitionKind: svcCfg.partitionScheme,
                    };
                    if (svcCfg.partitionScheme === 'Int64Range') {
                        partInfo.LowKey = String(-9223372036854775808n + BigInt(p) * 1000n);
                        partInfo.HighKey = String(-9223372036854775808n + BigInt(p + 1) * 1000n - 1n);
                    }

                    partitions.push({
                        ServicePartitionKind: svcCfg.partitionScheme,
                        HealthState: partHealth,
                        PartitionStatus: 'Ready',
                        PartitionInformation: partInfo,
                    });

                    // Replicas
                    const repCount = svcCfg.replicaCount ?? (svcCfg.serviceKind === 'Stateful' ? 3 : 1);
                    const replicas: any[] = [];
                    for (let r = 0; r < repCount; r++) {
                        const repHealth = pickHealth(mix, appIndex + p + r);
                        const targetNode = nodes[r % nodes.length];
                        const rep: any = {
                            ReplicaId: String(132750000000000000n + BigInt(appIndex * 100 + p * 10 + r)),
                            ReplicaStatus: 'Ready',
                            HealthState: repHealth,
                            NodeName: targetNode.Name,
                            Address: `{"Endpoints":{"":"http://${targetNode.IpAddressOrFQDN}:${20000 + appIndex * 100 + p * 10 + r}"}}`,
                            ServiceKind: svcCfg.serviceKind,
                        };
                        if (svcCfg.serviceKind === 'Stateful') {
                            rep.ReplicaRole = r === 0 ? 'Primary' : 'ActiveSecondary';
                        }
                        replicas.push(rep);
                    }
                    replicasByPartition.set(partId, replicas);
                }
                partitionsByService.set(svcId, partitions);
            }
            servicesByApp.set(appId, services);

            // Generate app manifest
            const svcManifestRefs = appCfg.services.map(s =>
                `    <ServiceManifestRef ServiceManifestName="${s.typeName.replace('Type', '')}Pkg" ServiceManifestVersion="${typeVersion}" />`
            ).join('\n');
            appManifests.set(appCfg.typeName, [
                '<?xml version="1.0" encoding="utf-8"?>',
                `<ApplicationManifest ApplicationTypeName="${appCfg.typeName}" ApplicationTypeVersion="${typeVersion}" xmlns="http://schemas.microsoft.com/2011/01/fabric">`,
                '  <ServiceManifestImport>',
                svcManifestRefs,
                '  </ServiceManifestImport>',
                '</ApplicationManifest>',
            ].join('\n'));

            for (const svcCfg of appCfg.services) {
                const pkgName = svcCfg.typeName.replace('Type', '') + 'Pkg';
                serviceManifests.set(pkgName, [
                    '<?xml version="1.0" encoding="utf-8"?>',
                    `<ServiceManifest Name="${pkgName}" Version="${typeVersion}" xmlns="http://schemas.microsoft.com/2011/01/fabric">`,
                    '  <ServiceTypes>',
                    svcCfg.serviceKind === 'Stateful'
                        ? `    <StatefulServiceType ServiceTypeName="${svcCfg.typeName}" HasPersistedState="true" />`
                        : `    <StatelessServiceType ServiceTypeName="${svcCfg.typeName}" />`,
                    '  </ServiceTypes>',
                    '</ServiceManifest>',
                ].join('\n'));
            }

            appIndex++;
        }
    }

    // System services (always present)
    const systemServices = [
        { name: 'ClusterManagerService', type: 'ClusterManagerServiceType' },
        { name: 'NamingService', type: 'NamingServiceType' },
        { name: 'FaultAnalysisService', type: 'FaultAnalysisServiceType' },
        { name: 'FailoverManagerService', type: 'FailoverManagerServiceType' },
        { name: 'UpgradeService', type: 'UpgradeServiceType' },
    ].map((s, i) => ({
        Id: `System/${s.name}`,
        Name: `fabric:/System/${s.name}`,
        TypeName: s.type,
        ManifestVersion: codeVersion,
        HealthState: pickHealth(mix, i),
        ServiceStatus: 'Active',
        ServiceKind: 'Stateful',
        IsServiceGroup: false,
    }));

    // System app health states
    const systemHealth = IconServiceWorstHealth(systemServices.map(s => s.HealthState));
    const applicationHealthStates = [
        { Name: 'fabric:/System', AggregatedHealthState: systemHealth },
        ...applications.map(a => ({ Name: a.Name, AggregatedHealthState: a.HealthState })),
    ];

    const clusterHealth = {
        AggregatedHealthState: overallWorst([
            ...nodeHealthStates.map(n => n.AggregatedHealthState),
            ...applicationHealthStates.map(a => a.AggregatedHealthState),
        ]),
        HealthEvents: [],
        UnhealthyEvaluations: [],
        NodeHealthStates: nodeHealthStates,
        ApplicationHealthStates: applicationHealthStates,
    };

    // ── Cluster Load ─────────────────────────────────────────────
    const now = new Date();
    const balanceStart = new Date(now.getTime() - 5000);
    const clusterLoad = {
        LastBalancingStartTimeUtc: balanceStart.toISOString(),
        LastBalancingEndTimeUtc: now.toISOString(),
        LoadMetricInformation: (config.loadMetrics ?? [
            { name: 'Count', clusterLoad: nodes.length * 3, clusterCapacity: 0 },
            { name: 'MemoryInMB', clusterLoad: nodes.length * 2048, clusterCapacity: nodes.length * 8192 },
            { name: 'DiskSpaceInMB', clusterLoad: nodes.length * 10240, clusterCapacity: nodes.length * 51200 },
        ]).map(m => ({
            Name: m.name,
            ClusterLoad: m.clusterLoad,
            ClusterCapacity: m.clusterCapacity,
            ClusterRemainingCapacity: m.clusterCapacity - m.clusterLoad,
            IsClusterCapacityViolation: m.isClusterCapacityViolation ?? false,
            NodeBufferPercentage: 0,
            ClusterBufferedCapacity: 0,
            ClusterRemainingBufferedCapacity: 0,
            MinimumNodeLoad: Math.floor(m.clusterLoad / Math.max(nodes.length, 1)),
            MaximumNodeLoad: Math.ceil(m.clusterLoad / Math.max(nodes.length, 1)) + 1,
            DeviationBefore: 0.05,
            DeviationAfter: 0.01,
        })),
    };

    // ── Cluster Manifest ─────────────────────────────────────────
    const nodeTypeXml = nodeTypes.map(nt => `    <NodeType Name="${nt.name}">
      <Endpoints>
        <ClientConnectionEndpoint Port="19000" />
        <HttpGatewayEndpoint Port="19080" Protocol="http" />
      </Endpoints>
    </NodeType>`).join('\n');

    const clusterManifest = {
        Manifest: [
            '<?xml version="1.0" encoding="utf-8"?>',
            `<ClusterManifest xmlns="http://schemas.microsoft.com/2011/01/fabric" Name="TestCluster" Version="1.0">`,
            '  <NodeTypes>',
            nodeTypeXml,
            '  </NodeTypes>',
            '</ClusterManifest>',
        ].join('\n'),
    };

    // ── Image Store ──────────────────────────────────────────────
    const imgCfg = config.imageStore ?? {
        folders: ['Store', 'WindowsFabricStore'],
        files: [],
    };
    const imageStore = {
        StoreFolders: imgCfg.folders.map(f => ({ StoreRelativePath: f })),
        StoreFiles: imgCfg.files.map(f => ({
            StoreRelativePath: f.path,
            FileSize: String(f.size),
            ModifiedDate: now.toISOString(),
            FileVersion: { VersionNumber: '1.0' },
        })),
    };

    // ── Repair Tasks ─────────────────────────────────────────────
    const repairTasks = config.includeRepairTasks ? [{
        TaskId: `Azure/PlatformUpdate/${guid().substring(0, 8)}`,
        State: 'Completed',
        Action: 'System.Azure.Job.PlatformUpdate',
        Target: { NodeNames: [nodes[0]?.Name ?? '_Node_0'] },
        ResultStatus: 'Succeeded',
        CreatedTimestamp: new Date(now.getTime() - 86400000).toISOString(),
        CompletedTimestamp: now.toISOString(),
    }] : [];

    return {
        config,
        clusterHealth,
        clusterVersion: { Version: codeVersion },
        clusterManifest,
        clusterLoad,
        nodes,
        applicationTypes,
        applications,
        systemServices,
        servicesByApp,
        partitionsByService,
        replicasByPartition,
        imageStore,
        repairTasks,
        appManifests,
        serviceManifests,
    };
}

function IconServiceWorstHealth(states: string[]): string {
    if (states.includes('Error')) { return 'Error'; }
    if (states.includes('Warning')) { return 'Warning'; }
    return 'Ok';
}

function overallWorst(states: string[]): string {
    return IconServiceWorstHealth(states);
}

// ── Write to disk ───────────────────────────────────────────────────

export interface ClusterFixtureData {
    config: ClusterProfileConfig;
    clusterHealth: any;
    clusterVersion: any;
    clusterManifest: any;
    clusterLoad: any;
    nodes: any[];
    applicationTypes: any[];
    applications: any[];
    systemServices: any[];
    servicesByApp: Map<string, any[]>;
    partitionsByService: Map<string, any[]>;
    replicasByPartition: Map<string, any[]>;
    imageStore: any;
    repairTasks: any[];
    appManifests: Map<string, string>;
    serviceManifests: Map<string, string>;
}

export function writeClusterFixtures(data: ClusterFixtureData, outputDir: string): void {
    // Create directory structure
    fs.mkdirSync(outputDir, { recursive: true });
    const servicesDir = path.join(outputDir, 'services');
    const partitionsDir = path.join(outputDir, 'partitions');
    const replicasDir = path.join(outputDir, 'replicas');
    fs.mkdirSync(servicesDir, { recursive: true });
    fs.mkdirSync(partitionsDir, { recursive: true });
    fs.mkdirSync(replicasDir, { recursive: true });

    const write = (file: string, obj: any) =>
        fs.writeFileSync(path.join(outputDir, file), JSON.stringify(obj, null, 2) + '\n');

    // Top-level responses
    write('cluster-health.json', data.clusterHealth);
    write('cluster-version.json', data.clusterVersion);
    write('cluster-manifest.json', data.clusterManifest);
    write('cluster-load.json', data.clusterLoad);
    write('nodes.json', data.nodes);
    write('application-types.json', data.applicationTypes);
    write('applications.json', data.applications);
    write('system-services.json', data.systemServices);
    write('image-store.json', data.imageStore);
    write('repair-tasks.json', data.repairTasks);

    // Per-app services
    for (const [appId, services] of data.servicesByApp) {
        const safeAppId = appId.replace(/\//g, '_');
        fs.writeFileSync(
            path.join(servicesDir, `${safeAppId}.json`),
            JSON.stringify(services, null, 2) + '\n',
        );
    }

    // Per-service partitions
    for (const [svcId, partitions] of data.partitionsByService) {
        const safeSvcId = svcId.replace(/\//g, '_');
        fs.writeFileSync(
            path.join(partitionsDir, `${safeSvcId}.json`),
            JSON.stringify(partitions, null, 2) + '\n',
        );
    }

    // Per-partition replicas
    for (const [partId, replicas] of data.replicasByPartition) {
        fs.writeFileSync(
            path.join(replicasDir, `${partId}.json`),
            JSON.stringify(replicas, null, 2) + '\n',
        );
    }

    // Manifests
    const manifestDir = path.join(outputDir, 'manifests');
    fs.mkdirSync(manifestDir, { recursive: true });
    for (const [typeName, xml] of data.appManifests) {
        fs.writeFileSync(path.join(manifestDir, `app-${typeName}.xml`), xml + '\n');
    }
    for (const [pkgName, xml] of data.serviceManifests) {
        fs.writeFileSync(path.join(manifestDir, `svc-${pkgName}.xml`), xml + '\n');
    }

    // Profile metadata
    write('manifest.json', {
        profileName: data.config.name,
        generatedAt: new Date().toISOString(),
        nodeCount: data.nodes.length,
        applicationCount: data.applications.length,
        serviceCount: Array.from(data.servicesByApp.values()).reduce((acc, s) => acc + s.length, 0),
        partitionCount: Array.from(data.partitionsByService.values()).reduce((acc, p) => acc + p.length, 0),
        replicaCount: Array.from(data.replicasByPartition.values()).reduce((acc, r) => acc + r.length, 0),
    });
}

// ── Predefined profile configs ──────────────────────────────────────

export const PROFILES: Record<string, ClusterProfileConfig> = {
    '1-node-dev': {
        name: '1-node-dev',
        nodeCount: 1,
        nodeTypes: [{ name: 'NodeType0', count: 1 }],
        applications: [{
            typeName: 'SampleAppType',
            services: [{
                typeName: 'SampleServiceType',
                serviceKind: 'Stateless',
                partitionScheme: 'Singleton',
                replicaCount: 1,
            }],
        }],
        healthMix: { ok: 10, warning: 0, error: 0 },
    },

    '3-node-mixed': {
        name: '3-node-mixed',
        nodeCount: 3,
        nodeTypes: [{ name: 'NodeType0', count: 3 }],
        applications: [
            {
                typeName: 'HealthyAppType',
                services: [{
                    typeName: 'HealthyServiceType',
                    serviceKind: 'Stateful',
                    partitionScheme: 'Singleton',
                    partitionCount: 1,
                    replicaCount: 3,
                    healthState: 'Ok',
                }],
            },
            {
                typeName: 'UnhealthyAppType',
                services: [{
                    typeName: 'FailingServiceType',
                    serviceKind: 'Stateful',
                    partitionScheme: 'Singleton',
                    partitionCount: 1,
                    replicaCount: 3,
                    healthState: 'Error',
                }],
            },
        ],
        healthMix: { ok: 2, warning: 1, error: 1 },
    },

    '5-node-azure': {
        name: '5-node-azure',
        nodeCount: 5,
        nodeTypes: [{ name: 'nt1vm', count: 5 }],
        applications: [
            {
                typeName: 'WebFrontEndType',
                services: [
                    {
                        typeName: 'WebFrontEndServiceType',
                        serviceKind: 'Stateless',
                        partitionScheme: 'Singleton',
                        replicaCount: 5,
                    },
                ],
            },
            {
                typeName: 'BackendApiType',
                services: [
                    {
                        typeName: 'ApiServiceType',
                        serviceKind: 'Stateful',
                        partitionScheme: 'Int64Range',
                        partitionCount: 3,
                        replicaCount: 3,
                    },
                    {
                        typeName: 'CacheServiceType',
                        serviceKind: 'Stateful',
                        partitionScheme: 'Singleton',
                        replicaCount: 3,
                    },
                ],
            },
        ],
        healthMix: { ok: 10, warning: 0, error: 0 },
        includeRepairTasks: true,
        loadMetrics: [
            { name: 'Count', clusterLoad: 15, clusterCapacity: 0 },
            { name: 'MemoryInMB', clusterLoad: 10240, clusterCapacity: 40960 },
            { name: 'DiskSpaceInMB', clusterLoad: 51200, clusterCapacity: 256000 },
            { name: 'CpuCores', clusterLoad: 12, clusterCapacity: 20 },
        ],
    },

    'large-cluster': {
        name: 'large-cluster',
        nodeCount: 20,
        nodeTypes: [
            { name: 'FrontEnd', count: 5 },
            { name: 'Backend', count: 10 },
            { name: 'Management', count: 5 },
        ],
        applications: [
            {
                typeName: 'WebAppType',
                instanceCount: 3,
                services: [
                    {
                        typeName: 'WebServiceType',
                        serviceKind: 'Stateless',
                        partitionScheme: 'Singleton',
                        replicaCount: 5,
                    },
                ],
            },
            {
                typeName: 'DataServiceType',
                instanceCount: 2,
                services: [
                    {
                        typeName: 'DataProcessorType',
                        serviceKind: 'Stateful',
                        partitionScheme: 'Int64Range',
                        partitionCount: 5,
                        replicaCount: 3,
                    },
                    {
                        typeName: 'DataStoreType',
                        serviceKind: 'Stateful',
                        partitionScheme: 'Int64Range',
                        partitionCount: 3,
                        replicaCount: 5,
                    },
                ],
            },
            {
                typeName: 'MonitoringType',
                services: [
                    {
                        typeName: 'MetricsCollectorType',
                        serviceKind: 'Stateless',
                        partitionScheme: 'Singleton',
                        replicaCount: 3,
                    },
                    {
                        typeName: 'AlertServiceType',
                        serviceKind: 'Stateful',
                        partitionScheme: 'Singleton',
                        replicaCount: 3,
                    },
                ],
            },
        ],
        healthMix: { ok: 15, warning: 3, error: 2 },
        includeRepairTasks: true,
        loadMetrics: [
            { name: 'Count', clusterLoad: 60, clusterCapacity: 0 },
            { name: 'MemoryInMB', clusterLoad: 40960, clusterCapacity: 163840 },
            { name: 'DiskSpaceInMB', clusterLoad: 204800, clusterCapacity: 1024000 },
            { name: 'CpuCores', clusterLoad: 45, clusterCapacity: 80 },
            { name: 'CustomMetric1', clusterLoad: 900, clusterCapacity: 800, isClusterCapacityViolation: true },
        ],
        imageStore: {
            folders: ['Store', 'WindowsFabricStore', 'WebAppType', 'DataServiceType', 'MonitoringType'],
            files: [
                { path: 'Store/WebAppType/1.0.0/ServiceManifest.xml', size: 2048 },
                { path: 'Store/DataServiceType/1.0.0/Code/DataProcessor.dll', size: 1048576 },
            ],
        },
    },

    'empty-cluster': {
        name: 'empty-cluster',
        nodeCount: 3,
        nodeTypes: [{ name: 'NodeType0', count: 3 }],
        applications: [],
        healthMix: { ok: 10, warning: 0, error: 0 },
    },
};

// ── CLI entry point ─────────────────────────────────────────────────

if (require.main === module) {
    const profileName = process.argv[2];
    // Use cwd-relative path so it works when compiled to temp/gen/
    const outputBase = path.resolve(process.cwd(), 'test', 'fixtures', 'clusters');

    if (profileName && PROFILES[profileName]) {
        const data = generateClusterProfile(PROFILES[profileName]);
        const outDir = path.join(outputBase, profileName);
        writeClusterFixtures(data, outDir);
        console.log(`Generated: ${outDir}`);
    } else {
        // Generate all profiles
        for (const [name, cfg] of Object.entries(PROFILES)) {
            const data = generateClusterProfile(cfg);
            const outDir = path.join(outputBase, name);
            writeClusterFixtures(data, outDir);
            console.log(`Generated: ${outDir}`);
        }
    }
}
