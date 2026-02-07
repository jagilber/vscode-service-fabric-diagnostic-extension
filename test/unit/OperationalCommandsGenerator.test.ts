import { OperationalCommandsGenerator } from '../../src/services/OperationalCommandsGenerator';

describe('OperationalCommandsGenerator - URL Validation', () => {
    
    describe('Protocol Handling', () => {
        test('should not have double http/https in curl commands with http endpoint', () => {
            const endpoint = 'http://localhost:19080';
            const nodes = [
                { name: '_Node_0', type: 'SeedNode' },
                { name: '_Node_1', type: 'SeedNode' }
            ];
            
            const result = OperationalCommandsGenerator.generateStartClusterUpgrade(endpoint, nodes);
            
            // Should NOT contain double protocol
            expect(result).not.toMatch(/https?:\/\/https?:\/\//);
            
            // Should have correct single protocol in curl commands
            expect(result).toMatch(/curl.*https:\/\/localhost:19080/);
            expect(result).not.toMatch(/https:\/\/http:\/\//);
        });
        
        test('should not have double http/https in curl commands with https endpoint', () => {
            const endpoint = 'https://mycluster.eastus.cloudapp.azure.com:19080';
            const nodes = [
                { name: '_Node_0', type: 'SeedNode' }
            ];
            
            const result = OperationalCommandsGenerator.generateStartClusterUpgrade(endpoint, nodes);
            
            // Should NOT contain double protocol
            expect(result).not.toMatch(/https?:\/\/https?:\/\//);
            
            // Should have correct single protocol
            expect(result).toMatch(/curl.*https:\/\/mycluster\.eastus\.cloudapp\.azure\.com:19080/);
        });
        
        test('should handle endpoint without protocol', () => {
            const endpoint = 'localhost:19080';
            const nodes = [{ name: '_Node_0', type: 'SeedNode' }];
            
            const result = OperationalCommandsGenerator.generateStartClusterUpgrade(endpoint, nodes);
            
            // Should add single https protocol
            expect(result).toMatch(/curl.*https:\/\/localhost:19080/);
            expect(result).not.toMatch(/https?:\/\/https?:\/\//);
        });
        
        test('should handle all operation types without double protocol', () => {
            const endpointWithHttp = 'http://localhost:19080';
            const endpointWithHttps = 'https://localhost:19080';
            const endpointNoProtocol = 'localhost:19080';
            
            const generators = [
                () => OperationalCommandsGenerator.generateRollbackClusterUpgrade(endpointWithHttp),
                () => OperationalCommandsGenerator.generateUpdateClusterConfig(endpointWithHttps),
                () => OperationalCommandsGenerator.generateRecoverSystemPartitions(endpointNoProtocol),
                () => OperationalCommandsGenerator.generateResetPartitionLoads(endpointWithHttp)
            ];
            
            generators.forEach(generator => {
                const result = generator();
                expect(result).not.toMatch(/https?:\/\/https?:\/\//);
            });
        });
    });
    
    describe('URL Pattern Validation', () => {
        test('should have valid Service Fabric API endpoints', () => {
            const endpoint = 'https://localhost:19080';
            const nodes = [{ name: '_Node_0', type: 'SeedNode' }];
            
            const result = OperationalCommandsGenerator.generateStartClusterUpgrade(endpoint, nodes);
            
            // Check for correct SF API endpoints
            expect(result).toMatch(/\/\$\/GetClusterManifest\?api-version=\d+\.\d+/);
            expect(result).toMatch(/\/\$\/GetClusterHealth\?api-version=\d+\.\d+/);
            expect(result).toMatch(/\/\$\/Upgrade\?api-version=\d+\.\d+/);
        });
        
        test('should not have malformed URLs', () => {
            const endpoint = 'http://localhost:19080';
            const nodes = [{ name: '_Node_0', type: 'SeedNode' }];
            
            const result = OperationalCommandsGenerator.generateStartClusterUpgrade(endpoint, nodes);
            
            // Should not have these malformations
            expect(result).not.toMatch(/\/\/\//); // Triple slashes
            expect(result).not.toMatch(/https?:\/\/\/[^\/]/); // Missing host
            expect(result).not.toMatch(/https?:\/\/https?:\/\//); // Double protocol
        });
    });
});

describe('OperationalCommandsGenerator - Full Coverage', () => {
    const endpoint = 'https://mycluster.eastus.cloudapp.azure.com:19080';
    const nodes = [
        { name: 'Node0', ipAddressOrFQDN: '10.0.0.4', nodeStatus: 'Up' },
        { name: 'Node1', ipAddressOrFQDN: '10.0.0.5', nodeStatus: 'Up' },
    ];
    const appTypes = [{ name: 'MyAppType', version: '1.0.0' }];
    const apps = [
        { id: 'MyApp', name: 'fabric:/MyApp', typeName: 'MyAppType', typeVersion: '1.0.0', status: 'Ready' },
    ];

    function expectValidMarkdown(result: string) {
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(50);
        expect(result).toContain('#');
    }

    describe('Cluster Operations', () => {
        test('generateStartClusterUpgrade with nodes', () => {
            const result = OperationalCommandsGenerator.generateStartClusterUpgrade(endpoint, nodes);
            expectValidMarkdown(result);
            expect(result).toContain('Node0');
        });

        test('generateStartClusterUpgrade with empty nodes', () => {
            const result = OperationalCommandsGenerator.generateStartClusterUpgrade(endpoint, []);
            expectValidMarkdown(result);
        });

        test('generateRollbackClusterUpgrade', () => {
            expectValidMarkdown(OperationalCommandsGenerator.generateRollbackClusterUpgrade(endpoint));
        });

        test('generateUpdateClusterConfig', () => {
            expectValidMarkdown(OperationalCommandsGenerator.generateUpdateClusterConfig(endpoint));
        });

        test('generateRecoverSystemPartitions', () => {
            expectValidMarkdown(OperationalCommandsGenerator.generateRecoverSystemPartitions(endpoint));
        });

        test('generateResetPartitionLoads', () => {
            expectValidMarkdown(OperationalCommandsGenerator.generateResetPartitionLoads(endpoint));
        });
    });

    describe('Application Operations', () => {
        test('generateProvisionApplicationType', () => {
            expectValidMarkdown(OperationalCommandsGenerator.generateProvisionApplicationType(endpoint));
        });

        test('generateCreateApplication with types', () => {
            const result = OperationalCommandsGenerator.generateCreateApplication(endpoint, appTypes);
            expectValidMarkdown(result);
            expect(result).toContain('MyAppType');
        });

        test('generateCreateApplication with empty types', () => {
            expectValidMarkdown(OperationalCommandsGenerator.generateCreateApplication(endpoint, []));
        });

        test('generateStartApplicationUpgrade with apps', () => {
            const result = OperationalCommandsGenerator.generateStartApplicationUpgrade(endpoint, apps);
            expectValidMarkdown(result);
        });

        test('generateStartApplicationUpgrade with empty apps', () => {
            expectValidMarkdown(OperationalCommandsGenerator.generateStartApplicationUpgrade(endpoint, []));
        });

        test('generateRollbackApplicationUpgrade', () => {
            expectValidMarkdown(OperationalCommandsGenerator.generateRollbackApplicationUpgrade(endpoint));
        });
    });

    describe('Replica Operations', () => {
        test('generateMovePrimaryReplica', () => {
            expectValidMarkdown(OperationalCommandsGenerator.generateMovePrimaryReplica(endpoint));
        });

        test('generateMoveSecondaryReplica', () => {
            expectValidMarkdown(OperationalCommandsGenerator.generateMoveSecondaryReplica(endpoint));
        });

        test('generateResetPartitionLoad', () => {
            expectValidMarkdown(OperationalCommandsGenerator.generateResetPartitionLoad(endpoint));
        });
    });

    describe('Health', () => {
        test('generateReportHealth', () => {
            expectValidMarkdown(OperationalCommandsGenerator.generateReportHealth(endpoint));
        });
    });

    describe('Chaos', () => {
        test('generateStartChaos', () => {
            expectValidMarkdown(OperationalCommandsGenerator.generateStartChaos(endpoint));
        });

        test('generateStopChaos', () => {
            expectValidMarkdown(OperationalCommandsGenerator.generateStopChaos(endpoint));
        });

        test('generateQueryChaosEvents', () => {
            expectValidMarkdown(OperationalCommandsGenerator.generateQueryChaosEvents(endpoint));
        });

        test('generateRestartPartition', () => {
            expectValidMarkdown(OperationalCommandsGenerator.generateRestartPartition(endpoint));
        });
    });

    describe('Backup/Restore', () => {
        test('generateEnableBackup', () => {
            expectValidMarkdown(OperationalCommandsGenerator.generateEnableBackup(endpoint));
        });

        test('generateDisableBackup', () => {
            expectValidMarkdown(OperationalCommandsGenerator.generateDisableBackup(endpoint));
        });

        test('generateTriggerBackup', () => {
            expectValidMarkdown(OperationalCommandsGenerator.generateTriggerBackup(endpoint));
        });

        test('generateGetBackupProgress', () => {
            expectValidMarkdown(OperationalCommandsGenerator.generateGetBackupProgress(endpoint));
        });

        test('generateRestoreBackup', () => {
            expectValidMarkdown(OperationalCommandsGenerator.generateRestoreBackup(endpoint));
        });
    });

    describe('Repair Tasks', () => {
        test('generateViewRepairTasks', () => {
            expectValidMarkdown(OperationalCommandsGenerator.generateViewRepairTasks(endpoint));
        });

        test('generateCreateRepairTask', () => {
            expectValidMarkdown(OperationalCommandsGenerator.generateCreateRepairTask(endpoint));
        });

        test('generateCancelRepairTask', () => {
            expectValidMarkdown(OperationalCommandsGenerator.generateCancelRepairTask(endpoint));
        });

        test('generateForceApproveRepair', () => {
            expectValidMarkdown(OperationalCommandsGenerator.generateForceApproveRepair(endpoint));
        });
    });
});
