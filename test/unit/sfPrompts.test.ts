/**
 * Unit tests for SfPrompts
 */
import * as vscode from 'vscode';

// Mock SfConfiguration and SfRest to prevent real network calls
jest.mock('../../src/sfConfiguration', () => {
    const mockConfig: any = {
        setClusterEndpoint: jest.fn(),
        setClusterCertificate: jest.fn(),
        getClusterEndpoint: jest.fn().mockReturnValue('http://localhost:19080'),
        getClusterEndpointInfo: jest.fn().mockReturnValue({ endpoint: 'http://localhost:19080' }),
        getClusterCertificate: jest.fn().mockReturnValue(null),
    };
    return {
        SfConfiguration: jest.fn().mockImplementation(() => mockConfig),
        __mockConfig: mockConfig,
    };
});

jest.mock('../../src/sfRest', () => {
    const mockRest: any = {
        connectToCluster: jest.fn(),
        invokeRestApi: jest.fn().mockResolvedValue('{"result":"ok"}'),
    };
    return {
        SfRest: jest.fn().mockImplementation(() => mockRest),
        __mockRest: mockRest,
    };
});

jest.mock('../../src/sfExtSettings', () => ({
    SfExtSettings: {
        updateSetting: jest.fn(),
        getSetting: jest.fn().mockReturnValue(undefined),
    },
    sfExtSettingsList: {
        clusters: 'clusters',
    },
}));

import { SfPrompts } from '../../src/sfPrompts';
import { SfExtSettings } from '../../src/sfExtSettings';

describe('SfPrompts', () => {
    let prompts: SfPrompts;
    let mockContext: vscode.ExtensionContext;
    let mockConfig: any;
    let mockRest: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockContext = new (vscode as any).ExtensionContext();
        prompts = new SfPrompts(mockContext);
        mockConfig = require('../../src/sfConfiguration').__mockConfig;
        mockRest = require('../../src/sfRest').__mockRest;
    });

    describe('constructor', () => {
        test('should initialize without errors', () => {
            expect(prompts).toBeDefined();
        });
    });

    // ==================== promptForAddClusterEndpoint ====================
    describe('promptForAddClusterEndpoint', () => {
        test('should return early when user cancels input', async () => {
            (vscode.window.showInputBox as jest.Mock).mockResolvedValue(undefined);
            await prompts.promptForAddClusterEndpoint();
            expect(mockConfig.setClusterEndpoint).not.toHaveBeenCalled();
        });

        test('should add HTTP cluster without certificate prompt', async () => {
            (vscode.window.showInputBox as jest.Mock).mockResolvedValueOnce('http://localhost:19080');
            await prompts.promptForAddClusterEndpoint();
            expect(vscode.window.showInputBox).toHaveBeenCalledTimes(1);
            expect(mockConfig.setClusterEndpoint).toHaveBeenCalledWith('http://localhost:19080');
            expect(mockConfig.setClusterCertificate).not.toHaveBeenCalled();
        });

        test('should prompt for certificate on HTTPS cluster', async () => {
            (vscode.window.showInputBox as jest.Mock)
                .mockResolvedValueOnce('https://mycluster:19080')
                .mockResolvedValueOnce('ABCD1234');
            await prompts.promptForAddClusterEndpoint();
            expect(vscode.window.showInputBox).toHaveBeenCalledTimes(2);
            expect(mockConfig.setClusterEndpoint).toHaveBeenCalledWith('https://mycluster:19080');
            expect(mockConfig.setClusterCertificate).toHaveBeenCalledWith('ABCD1234');
        });

        test('should skip certificate when user cancels cert prompt', async () => {
            (vscode.window.showInputBox as jest.Mock)
                .mockResolvedValueOnce('https://mycluster:19080')
                .mockResolvedValueOnce(undefined);
            await prompts.promptForAddClusterEndpoint();
            expect(mockConfig.setClusterEndpoint).toHaveBeenCalledWith('https://mycluster:19080');
            expect(mockConfig.setClusterCertificate).not.toHaveBeenCalled();
        });

        test('should save cluster info to settings', async () => {
            mockConfig.getClusterEndpointInfo.mockReturnValue({ endpoint: 'http://test:19080' });
            (vscode.window.showInputBox as jest.Mock).mockResolvedValueOnce('http://test:19080');
            await prompts.promptForAddClusterEndpoint();
            expect(SfExtSettings.updateSetting).toHaveBeenCalledWith('clusters', { endpoint: 'http://test:19080' });
        });
    });

    // ==================== promptForClusterRestCall ====================
    describe('promptForClusterRestCall', () => {
        let mockSfMgr: any;

        beforeEach(() => {
            mockSfMgr = {
                getCurrentSfConfig: jest.fn().mockReturnValue({
                    getClusterEndpoint: jest.fn().mockReturnValue('http://localhost:19080'),
                    getClusterCertificate: jest.fn().mockReturnValue(null),
                }),
                loadSfConfigs: jest.fn().mockResolvedValue(undefined),
                getSfConfigs: jest.fn().mockReturnValue([]),
            };
        });

        test('should return early when user cancels input', async () => {
            (vscode.window.showInputBox as jest.Mock).mockResolvedValue(undefined);
            await prompts.promptForClusterRestCall(mockSfMgr);
            expect(mockRest.invokeRestApi).not.toHaveBeenCalled();
        });

        test('should invoke rest API on valid input', async () => {
            mockConfig.getClusterEndpoint.mockReturnValue('http://localhost:19080');
            (vscode.window.showInputBox as jest.Mock).mockResolvedValue('/$/GetClusterHealth');
            await prompts.promptForClusterRestCall(mockSfMgr);
            expect(mockRest.connectToCluster).toHaveBeenCalled();
            expect(mockRest.invokeRestApi).toHaveBeenCalledWith('GET', 'http://localhost:19080', '/$/GetClusterHealth');
        });

        test('should handle rest API failure', async () => {
            mockConfig.getClusterEndpoint.mockReturnValue('http://localhost:19080');
            (vscode.window.showInputBox as jest.Mock).mockResolvedValue('/$/GetClusterHealth');
            mockRest.invokeRestApi.mockRejectedValue(new Error('Connection refused'));
            await prompts.promptForClusterRestCall(mockSfMgr);
            // Should not throw - error is caught and shown
        });

        test('should warn when no endpoint after prompts', async () => {
            mockConfig.getClusterEndpoint.mockReturnValue(null);
            (vscode.window.showInputBox as jest.Mock)
                .mockResolvedValueOnce('/$/GetClusterHealth') // rest call
                .mockResolvedValueOnce(undefined); // cluster selection cancelled
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(undefined);
            await prompts.promptForClusterRestCall(mockSfMgr);
            expect(mockRest.invokeRestApi).not.toHaveBeenCalled();
        });
    });

    // ==================== promptForGetClusterEndpoint ====================
    describe('promptForGetClusterEndpoint', () => {
        let mockSfMgr: any;

        beforeEach(() => {
            mockSfMgr = {
                loadSfConfigs: jest.fn().mockResolvedValue(undefined),
                getSfConfigs: jest.fn().mockReturnValue([]),
                getCluster: jest.fn().mockResolvedValue(undefined),
            };
        });

        test('should prompt input when no clusters configured', async () => {
            (vscode.window.showInputBox as jest.Mock).mockResolvedValue(undefined);
            await prompts.promptForGetClusterEndpoint(mockSfMgr);
            expect(vscode.window.showInputBox).toHaveBeenCalled();
        });

        test('should call getCluster on manual entry', async () => {
            (vscode.window.showInputBox as jest.Mock).mockResolvedValue('http://newcluster:19080');
            await prompts.promptForGetClusterEndpoint(mockSfMgr);
            expect(mockSfMgr.getCluster).toHaveBeenCalledWith('http://newcluster:19080');
        });

        test('should show quick pick when clusters exist', async () => {
            const mockClusterConfig = {
                getClusterEndpoint: jest.fn().mockReturnValue('http://cluster1:19080'),
                getClusterCertificate: jest.fn().mockReturnValue({ thumbprint: 'ABC' }),
            };
            mockSfMgr.getSfConfigs.mockReturnValue([mockClusterConfig]);
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue({ label: 'http://cluster1:19080' });
            await prompts.promptForGetClusterEndpoint(mockSfMgr);
            expect(vscode.window.showQuickPick).toHaveBeenCalled();
            expect(mockSfMgr.getCluster).toHaveBeenCalledWith('http://cluster1:19080');
        });

        test('should handle cluster connection failure gracefully', async () => {
            (vscode.window.showInputBox as jest.Mock).mockResolvedValue('http://badcluster:19080');
            mockSfMgr.getCluster.mockRejectedValue(new Error('Connection refused'));
            await prompts.promptForGetClusterEndpoint(mockSfMgr);
            // Should not throw - error is caught and shown as warning
        });

        test('should return early when user cancels quick pick', async () => {
            const mockClusterConfig = {
                getClusterEndpoint: jest.fn().mockReturnValue('http://cluster1:19080'),
                getClusterCertificate: jest.fn().mockReturnValue(null),
            };
            mockSfMgr.getSfConfigs.mockReturnValue([mockClusterConfig]);
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(undefined);
            await prompts.promptForGetClusterEndpoint(mockSfMgr);
            expect(mockSfMgr.getCluster).not.toHaveBeenCalled();
        });
    });

    // ==================== promptForRemoveClusterEndpoint ====================
    describe('promptForRemoveClusterEndpoint', () => {
        test('should show warning when no clusters configured', async () => {
            (SfExtSettings.getSetting as jest.Mock).mockReturnValue(undefined);
            await prompts.promptForRemoveClusterEndpoint();
        });

        test('should show warning for empty clusters array', async () => {
            (SfExtSettings.getSetting as jest.Mock).mockReturnValue([]);
            await prompts.promptForRemoveClusterEndpoint();
        });

        test('should return when user cancels selection', async () => {
            (SfExtSettings.getSetting as jest.Mock).mockReturnValue([
                { endpoint: 'http://cluster1:19080' },
            ]);
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(undefined);
            await prompts.promptForRemoveClusterEndpoint();
        });

        test('should return when user cancels confirmation', async () => {
            (SfExtSettings.getSetting as jest.Mock).mockReturnValue([
                { endpoint: 'http://cluster1:19080' },
            ]);
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue({ label: 'http://cluster1:19080' });
            (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue('Cancel');
            await prompts.promptForRemoveClusterEndpoint();
        });

        test('should remove cluster on confirmation', async () => {
            const mockUpdate = jest.fn().mockResolvedValue(undefined);
            (SfExtSettings.getSetting as jest.Mock)
                .mockReturnValueOnce([{ endpoint: 'http://cluster1:19080' }, { endpoint: 'http://cluster2:19080' }])
                .mockReturnValueOnce([{ endpoint: 'http://cluster2:19080' }]); // after removal
            (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
                get: jest.fn(),
                update: mockUpdate,
                has: jest.fn(),
            });
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue({ label: 'http://cluster1:19080' });
            (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue('Yes, Remove');
            await prompts.promptForRemoveClusterEndpoint();
            expect(mockUpdate).toHaveBeenCalled();
        });
    });

    // ==================== cleanupClustersArray ====================
    describe('cleanupClustersArray (via promptForRemoveClusterEndpoint)', () => {
        test('should handle nested arrays in cluster config', async () => {
            const nestedClusters = [
                [{ endpoint: 'http://cluster1:19080' }],
                { endpoint: 'http://cluster2:19080' }
            ];
            (SfExtSettings.getSetting as jest.Mock).mockReturnValue(nestedClusters);
            (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
                get: jest.fn(),
                update: jest.fn().mockResolvedValue(undefined),
                has: jest.fn(),
            });
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(undefined);
            await prompts.promptForRemoveClusterEndpoint();
            // Should flatten and show 2 clusters in quick pick
            expect(vscode.window.showQuickPick).toHaveBeenCalled();
        });

        test('should deduplicate clusters', async () => {
            const dupes = [
                { endpoint: 'http://cluster1:19080' },
                { endpoint: 'http://cluster1:19080' },
                { endpoint: 'http://cluster2:19080' }
            ];
            (SfExtSettings.getSetting as jest.Mock).mockReturnValue(dupes);
            (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
                get: jest.fn(),
                update: jest.fn().mockResolvedValue(undefined),
                has: jest.fn(),
            });
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(undefined);
            await prompts.promptForRemoveClusterEndpoint();
            // Should deduplicate and show 2 unique clusters
            const quickPickCall = (vscode.window.showQuickPick as jest.Mock).mock.calls[0];
            expect(quickPickCall[0].length).toBe(2);
        });
    });
});
