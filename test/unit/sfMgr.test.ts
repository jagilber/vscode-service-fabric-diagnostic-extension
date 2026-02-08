/**
 * Unit tests for sfMgr
 */
import * as vscode from 'vscode';

// Mock heavy dependencies to avoid loading real modules
jest.mock('../../src/sfConfiguration', () => ({
    SfConfiguration: jest.fn().mockImplementation((_context: any, cluster?: any) => ({
        getClusterEndpoint: jest.fn().mockReturnValue(cluster?.endpoint || 'http://localhost:19080'),
        getSfRest: jest.fn().mockReturnValue({
            azureConnect: jest.fn().mockReturnValue(false),
            getClusters: jest.fn().mockResolvedValue([]),
        }),
        getClusterCertificate: jest.fn().mockReturnValue(null),
        getClusterHealth: jest.fn().mockResolvedValue({}),
    })),
}));

jest.mock('../../src/treeview/SfTreeDataProvider', () => ({
    SfTreeDataProvider: jest.fn().mockImplementation(() => ({
        getTreeItem: jest.fn(),
        getChildren: jest.fn().mockResolvedValue([]),
        refresh: jest.fn(),
    })),
}));

jest.mock('../../src/treeview/SfTreeDataProviderAdapter', () => ({
    SfTreeDataProviderAdapter: jest.fn().mockImplementation(() => ({
        addClusterToTree: jest.fn(),
        removeClusterFromTree: jest.fn(),
        updateClusterInTree: jest.fn(),
        setActiveCluster: jest.fn(),
        hasClusterInTree: jest.fn().mockReturnValue(false),
        refresh: jest.fn(),
        restartAutoRefresh: jest.fn(),
        dispose: jest.fn(),
    })),
}));

jest.mock('../../src/sfPs', () => ({
    SfPs: jest.fn().mockImplementation(() => ({
        send: jest.fn().mockResolvedValue('{}'),
    })),
}));

jest.mock('../../src/sfRest', () => ({
    SfRest: jest.fn().mockImplementation(() => ({
        azureConnect: jest.fn().mockReturnValue(false),
        getClusters: jest.fn().mockResolvedValue([]),
    })),
}));

jest.mock('../../src/services/SfSdkInstaller', () => ({
    SfSdkInstaller: jest.fn().mockImplementation(() => ({
        deployDevCluster: jest.fn().mockResolvedValue(undefined),
        downloadAndInstallSdk: jest.fn().mockResolvedValue(undefined),
    })),
}));

jest.mock('../../src/utils/SfHttpClient', () => ({
    SfHttpClient: jest.fn().mockImplementation(() => ({
        get: jest.fn().mockResolvedValue(''),
        download: jest.fn().mockResolvedValue(undefined),
    })),
}));

jest.mock('../../src/services/SfClusterService', () => ({
    SfClusterService: jest.fn().mockImplementation(() => ({
        connectToCluster: jest.fn().mockResolvedValue(undefined),
        refreshCluster: jest.fn().mockResolvedValue(undefined),
    })),
}));

jest.mock('../../src/sfUtility', () => ({
    SfUtility: {
        outputLog: jest.fn(),
        showInformation: jest.fn(),
        showWarning: jest.fn(),
        showError: jest.fn(),
        createFolder: jest.fn(),
        fileExists: jest.fn().mockReturnValue(false),
        readExtensionConfig: jest.fn().mockReturnValue(undefined),
        saveExtensionConfig: jest.fn(),
    },
    debugLevel: { error: 0, warn: 1, info: 2, debug: 3 },
}));

jest.mock('@azure/logger', () => ({
    setLogLevel: jest.fn(),
    AzureLogger: { log: jest.fn() },
}));

import { SfMgr } from '../../src/sfMgr';
import { SfExtSettings } from '../../src/sfExtSettings';

describe('SfMgr', () => {
    let sfMgr: SfMgr;
    let mockContext: vscode.ExtensionContext;

    beforeEach(() => {
        jest.clearAllMocks();
        mockContext = new (vscode as any).ExtensionContext();
        sfMgr = new SfMgr(mockContext);
    });

    test('should construct successfully', () => {
        expect(sfMgr).toBeDefined();
        expect(sfMgr.sfClusterView).toBeDefined();
    });

    describe('getCurrentSfConfig', () => {
        test('should return current sfConfig', () => {
            const config = sfMgr.getCurrentSfConfig();
            expect(config).toBeDefined();
            expect(config.getClusterEndpoint()).toBeDefined();
        });
    });

    describe('getSfConfig', () => {
        test('should return undefined for unknown endpoint', () => {
            const config = sfMgr.getSfConfig('http://unknown:19080');
            expect(config).toBeUndefined();
        });
    });

    describe('getSfConfigs', () => {
        test('should return configs array', () => {
            const configs = sfMgr.getSfConfigs();
            expect(Array.isArray(configs)).toBe(true);
        });
    });

    describe('getSfRest', () => {
        test('should return SfRest instance', () => {
            const rest = sfMgr.getSfRest();
            expect(rest).toBeDefined();
        });
    });

    describe('loadSfConfigs', () => {
        test('should handle no clusters in settings', async () => {
            (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
                get: jest.fn().mockReturnValue(null),
                update: jest.fn(),
                has: jest.fn(),
            });
            await sfMgr.loadSfConfigs();
            // Should not throw
        });

        test('should handle empty clusters array', async () => {
            (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
                get: jest.fn().mockReturnValue([]),
                update: jest.fn(),
                has: jest.fn(),
            });
            await sfMgr.loadSfConfigs();
            expect(sfMgr.getSfConfigs()).toEqual([]);
        });

        test('should load clusters from settings', async () => {
            (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
                get: jest.fn().mockReturnValue([
                    { endpoint: 'http://cluster1:19080' },
                    { endpoint: 'http://cluster2:19080' },
                ]),
                update: jest.fn(),
                has: jest.fn(),
            });
            await sfMgr.loadSfConfigs();
            const configs = sfMgr.getSfConfigs();
            expect(configs.length).toBe(2);
        });
    });

    describe('addSfConfig', () => {
        test('should add config when endpoint not present', () => {
            const mockConfig = {
                getClusterEndpoint: jest.fn().mockReturnValue('http://new:19080'),
            };
            sfMgr.addSfConfig(mockConfig as any);
            const found = sfMgr.getSfConfig('http://new:19080');
            expect(found).toBeDefined();
        });

        test('should not duplicate existing endpoint', () => {
            const mockConfig = {
                getClusterEndpoint: jest.fn().mockReturnValue('http://new:19080'),
            };
            sfMgr.addSfConfig(mockConfig as any);
            sfMgr.addSfConfig(mockConfig as any);
            // Should still have only one entry for this endpoint
            const configs = sfMgr.getSfConfigs().filter(
                (c: any) => c.getClusterEndpoint() === 'http://new:19080'
            );
            expect(configs.length).toBe(1);
        });
    });

    describe('getCluster', () => {
        test('should connect to cluster endpoint', async () => {
            await sfMgr.getCluster('http://newcluster:19080');
            // Should not throw - cluster service connects
        });
    });

    describe('refreshAllClusters', () => {
        test('should not throw when no clusters', async () => {
            await sfMgr.refreshAllClusters();
            // Should not throw
        });
    });

    describe('removeSfConfig', () => {
        test('should not throw for missing config', () => {
            sfMgr.removeSfConfig('http://nonexistent:19080');
        });
    });

    describe('removeClusterFromTree', () => {
        test('should call sfClusterView.removeClusterFromTree', () => {
            sfMgr.removeClusterFromTree('http://localhost:19080');
            expect(sfMgr.sfClusterView.removeClusterFromTree).toHaveBeenCalledWith('http://localhost:19080');
        });
    });

    describe('setActiveCluster', () => {
        test('should show error for unknown cluster', () => {
            const { SfUtility } = require('../../src/sfUtility');
            sfMgr.setActiveCluster('http://unknown:19080');
            expect(SfUtility.showError).toHaveBeenCalled();
        });
    });

    describe('deployDevCluster', () => {
        test('should delegate to sdkInstaller', async () => {
            await sfMgr.deployDevCluster();
        });
    });

    describe('dispose', () => {
        test('should not throw', () => {
            sfMgr.dispose();
        });
    });

    describe('runPsCommand', () => {
        test('should run and parse JSON', async () => {
            const result = await sfMgr.runPsCommand('whoami');
            expect(result).toEqual({});
        });
    });
});
