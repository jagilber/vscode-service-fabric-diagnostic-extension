/**
 * Unit tests for SfClusterService
 */
import { SfClusterService } from '../../src/services/SfClusterService';
import { SfConfiguration } from '../../src/sfConfiguration';
import { SfRest } from '../../src/sfRest';
import { CertificateError, NetworkError, ClusterConnectionError } from '../../src/models/Errors';
import * as vscode from 'vscode';

describe('SfClusterService', () => {
    let service: SfClusterService;
    let mockContext: vscode.ExtensionContext;
    let mockConfig: jest.Mocked<SfConfiguration>;
    let mockSfRest: jest.Mocked<SfRest>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockContext = new (vscode as any).ExtensionContext();
        service = new SfClusterService(mockContext);

        mockSfRest = {
            getClusterVersion: jest.fn().mockResolvedValue('8.0'),
        } as any;

        mockConfig = {
            getClusterEndpoint: jest.fn().mockReturnValue('http://localhost:19080'),
            ensureRestClientReady: jest.fn().mockResolvedValue(undefined),
            getSfRest: jest.fn().mockReturnValue(mockSfRest),
            populate: jest.fn().mockResolvedValue(undefined),
        } as any;
    });

    describe('validateEndpoint', () => {
        test('should accept valid https endpoint', () => {
            expect(service.validateEndpoint('https://mycluster.eastus.cloudapp.azure.com:19080')).toBe(true);
        });

        test('should accept valid http endpoint', () => {
            expect(service.validateEndpoint('http://localhost:19080')).toBe(true);
        });

        test('should reject invalid URL', () => {
            expect(service.validateEndpoint('not-a-url')).toBe(false);
        });

        test('should reject empty string', () => {
            expect(service.validateEndpoint('')).toBe(false);
        });

        test('should reject ftp protocol', () => {
            expect(service.validateEndpoint('ftp://server:21')).toBe(false);
        });
    });

    describe('connectToCluster', () => {
        test('should connect successfully', async () => {
            await service.connectToCluster(mockConfig, mockSfRest);
            expect(mockConfig.ensureRestClientReady).toHaveBeenCalled();
            expect(mockSfRest.getClusterVersion).toHaveBeenCalled();
        });

        test('should throw ClusterConnectionError on CertificateError', async () => {
            mockConfig.ensureRestClientReady.mockRejectedValue(new CertificateError('bad cert'));
            await expect(service.connectToCluster(mockConfig, mockSfRest))
                .rejects.toThrow(ClusterConnectionError);
        });

        test('should throw ClusterConnectionError on NetworkError', async () => {
            mockSfRest.getClusterVersion.mockRejectedValue(new NetworkError('timeout'));
            await expect(service.connectToCluster(mockConfig, mockSfRest))
                .rejects.toThrow(ClusterConnectionError);
        });

        test('should throw ClusterConnectionError on generic error', async () => {
            mockConfig.ensureRestClientReady.mockRejectedValue(new Error('unknown'));
            await expect(service.connectToCluster(mockConfig, mockSfRest))
                .rejects.toThrow(ClusterConnectionError);
        });
    });

    describe('refreshCluster', () => {
        test('should populate cluster data', async () => {
            await service.refreshCluster(mockConfig);
            expect(mockConfig.populate).toHaveBeenCalled();
        });

        test('should throw on populate failure', async () => {
            mockConfig.populate.mockRejectedValue(new Error('network down'));
            await expect(service.refreshCluster(mockConfig))
                .rejects.toThrow('network down');
        });
    });
});
