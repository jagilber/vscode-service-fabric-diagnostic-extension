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
