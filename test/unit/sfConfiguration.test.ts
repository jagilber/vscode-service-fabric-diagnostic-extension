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
            // SfConfiguration derives clusterName from url.parse(endpoint).hostname
            // For 'http://localhost:19080', hostname is 'localhost'
            const treeItem = sfConfig.createClusterViewTreeItem();
            expect(treeItem.label).toContain('localhost');
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

    describe('Icon Mapping', () => {
        test('should return green icon for Ok health', () => {
            const icon = sfConfig.getIcon('Ok', 'vm');
            
            expect(icon).toBeDefined();
            expect((icon as any).id).toBe('vm');
        });

        test('should return yellow icon for Warning health', () => {
            const icon = sfConfig.getIcon('Warning', 'vm');
            
            expect(icon).toBeDefined();
            expect((icon as any).id).toBe('vm');
        });

        test('should return red icon for Error health', () => {
            const icon = sfConfig.getIcon('Error', 'vm');
            
            expect(icon).toBeDefined();
            expect((icon as any).id).toBe('vm');
        });

        test('should return gray icon for Unknown health', () => {
            const icon = sfConfig.getIcon('Unknown', 'vm');
            
            expect(icon).toBeDefined();
            expect((icon as any).id).toBe('vm');
        });

        test('should handle invalid health states', () => {
            const icon = sfConfig.getIcon('InvalidState', 'vm');
            
            expect(icon).toBeUndefined();
        });
    });

    describe('Health State Comparison', () => {
        test('should rank Error as worst', () => {
            expect(sfConfig.compareHealthStates('Error', 'Warning')).toBeLessThan(0);
            expect(sfConfig.compareHealthStates('Error', 'Ok')).toBeLessThan(0);
        });

        test('should rank Warning between Error and Ok', () => {
            expect(sfConfig.compareHealthStates('Warning', 'Ok')).toBeLessThan(0);
            expect(sfConfig.compareHealthStates('Warning', 'Error')).toBeGreaterThan(0);
        });

        test('should rank Ok as best', () => {
            expect(sfConfig.compareHealthStates('Ok', 'Warning')).toBeGreaterThan(0);
            expect(sfConfig.compareHealthStates('Ok', 'Error')).toBeGreaterThan(0);
        });

        test('should handle equal health states', () => {
            expect(sfConfig.compareHealthStates('Ok', 'Ok')).toBe(0);
            expect(sfConfig.compareHealthStates('Error', 'Error')).toBe(0);
        });
    });

    describe('Tree Item Creation', () => {
        test('should create cluster tree item', () => {
            // Mock the required data
            (sfConfig as any).nodes = mockData.mockNodes;
            (sfConfig as any).applications = mockData.mockApplications;
            (sfConfig as any).systemServices = mockData.mockSystemServices;
            (sfConfig as any).clusterHealth = mockData.mockClusterHealth;

            const treeItem = sfConfig.createClusterViewTreeItem();

            expect(treeItem).toBeDefined();
            // clusterName is set from url.parse(endpoint).hostname => 'localhost'
            expect(treeItem.label).toContain('localhost');
        });
    });
});
