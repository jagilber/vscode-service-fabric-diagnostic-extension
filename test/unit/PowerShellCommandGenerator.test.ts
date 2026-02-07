/**
 * Unit tests for PowerShellCommandGenerator
 * This file is 1080 lines of static markdown generation, so we test structure and interpolation.
 */
import { PowerShellCommandGenerator } from '../../src/services/PowerShellCommandGenerator';

describe('PowerShellCommandGenerator', () => {
    const clusterEndpoint = 'https://mycluster.eastus.cloudapp.azure.com:19080';
    const certThumbprint = 'ABC123';
    const serverCertThumbprint = 'DEF456';
    const nodeNames = ['Node0', 'Node1', 'Node2'];
    const applicationNames = ['fabric:/App1', 'fabric:/App2'];

    describe('generateConnectionCommands', () => {
        test('should return markdown with cluster endpoint', () => {
            const result = PowerShellCommandGenerator.generateConnectionCommands(clusterEndpoint);
            expect(result).toContain('mycluster.eastus.cloudapp.azure.com');
            expect(result).toContain('Connection');
        });

        test('should include certificate when provided', () => {
            const result = PowerShellCommandGenerator.generateConnectionCommands(clusterEndpoint, certThumbprint);
            expect(result).toContain(certThumbprint);
        });

        test('should include server certificate when provided', () => {
            const result = PowerShellCommandGenerator.generateConnectionCommands(clusterEndpoint, certThumbprint, serverCertThumbprint);
            expect(result).toContain(certThumbprint);
            expect(result).toContain(serverCertThumbprint);
        });

        test('should handle http endpoint', () => {
            const result = PowerShellCommandGenerator.generateConnectionCommands('http://localhost:19080');
            expect(result).toContain('localhost');
        });

        test('should handle endpoint without port', () => {
            const result = PowerShellCommandGenerator.generateConnectionCommands('https://mycluster.com');
            expect(result).toContain('mycluster.com');
        });

        test('should return non-empty markdown string', () => {
            const result = PowerShellCommandGenerator.generateConnectionCommands(clusterEndpoint);
            expect(result.length).toBeGreaterThan(100);
            expect(result).toContain('#'); // markdown headers
        });
    });

    describe('generateClusterDiagnostics', () => {
        test('should return markdown with diagnostics commands', () => {
            const result = PowerShellCommandGenerator.generateClusterDiagnostics(clusterEndpoint);
            expect(result).toContain('mycluster.eastus.cloudapp.azure.com');
            expect(result.length).toBeGreaterThan(100);
        });

        test('should include node names when provided', () => {
            const result = PowerShellCommandGenerator.generateClusterDiagnostics(clusterEndpoint, nodeNames);
            expect(result).toContain('Node0');
            expect(result).toContain('Node1');
        });

        test('should include application names when provided', () => {
            const result = PowerShellCommandGenerator.generateClusterDiagnostics(clusterEndpoint, nodeNames, applicationNames);
            expect(result).toContain('fabric:/App1');
        });

        test('should work with empty arrays', () => {
            const result = PowerShellCommandGenerator.generateClusterDiagnostics(clusterEndpoint, [], []);
            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
        });
    });

    describe('generateNodeCommands', () => {
        test('should return markdown with node commands', () => {
            const result = PowerShellCommandGenerator.generateNodeCommands(clusterEndpoint, nodeNames);
            expect(result).toContain('Node0');
            expect(result).toContain('Node1');
            expect(result).toContain('Node2');
        });

        test('should include cluster endpoint', () => {
            const result = PowerShellCommandGenerator.generateNodeCommands(clusterEndpoint, nodeNames);
            expect(result).toContain('mycluster.eastus.cloudapp.azure.com');
        });

        test('should handle single node', () => {
            const result = PowerShellCommandGenerator.generateNodeCommands(clusterEndpoint, ['SingleNode']);
            expect(result).toContain('SingleNode');
            expect(result.length).toBeGreaterThan(100);
        });
    });

    describe('generateApplicationCommands', () => {
        test('should return markdown with application commands', () => {
            const result = PowerShellCommandGenerator.generateApplicationCommands(clusterEndpoint);
            expect(result).toContain('mycluster.eastus.cloudapp.azure.com');
            expect(result.length).toBeGreaterThan(100);
        });

        test('should include application names when provided', () => {
            const result = PowerShellCommandGenerator.generateApplicationCommands(clusterEndpoint, applicationNames);
            expect(result).toContain('fabric:/App1');
            expect(result).toContain('fabric:/App2');
        });

        test('should work without application names', () => {
            const result = PowerShellCommandGenerator.generateApplicationCommands(clusterEndpoint);
            expect(result).toBeDefined();
            expect(result).toContain('#');
        });
    });
});
