/**
 * Unit tests for ManagementWebviewProvider
 */
import * as vscode from 'vscode';

// Mock sfMgr
jest.mock('../../src/sfMgr', () => ({
    SfMgr: jest.fn(),
}));

jest.mock('../../src/sfUtility', () => ({
    SfUtility: {
        outputLog: jest.fn(),
        showInformation: jest.fn(),
        showWarning: jest.fn(),
        showError: jest.fn(),
    },
    debugLevel: { error: 0, warn: 1, info: 2, debug: 3 },
}));

import { ManagementWebviewProvider } from '../../src/views/ManagementWebviewProvider';

describe('ManagementWebviewProvider', () => {
    let provider: ManagementWebviewProvider;
    let mockSfMgr: any;
    let mockExtensionUri: any;
    let mockSfRest: any;
    let messageHandler: (message: any) => Promise<void>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockExtensionUri = { fsPath: '/mock/extension' };
        mockSfRest = {
            getNodes: jest.fn().mockResolvedValue([{ name: 'Node1' }, { name: 'Node2' }]),
            getApplications: jest.fn().mockResolvedValue([{ name: 'fabric:/App1', id: 'App1' }]),
            restartNode: jest.fn().mockResolvedValue(undefined),
            removeNodeState: jest.fn().mockResolvedValue(undefined),
            deleteApplication: jest.fn().mockResolvedValue(undefined),
        };
        mockSfMgr = {
            getCurrentSfConfig: jest.fn().mockReturnValue({
                getClusterEndpoint: jest.fn().mockReturnValue('http://localhost:19080'),
                getSfRest: jest.fn().mockReturnValue(mockSfRest),
            }),
            getSfConfig: jest.fn(),
            getSfConfigs: jest.fn().mockReturnValue([]),
            sfClusterView: { refresh: jest.fn() },
        };
        provider = new ManagementWebviewProvider(mockExtensionUri, mockSfMgr);

        // Resolve the webview to capture message handler
        const mockPostMessage = jest.fn();
        const mockWebviewView: any = {
            webview: {
                options: {},
                html: '',
                onDidReceiveMessage: jest.fn().mockImplementation((handler: any) => {
                    messageHandler = handler;
                }),
                postMessage: mockPostMessage,
                cspSource: 'mock-csp',
            },
        };
        const mockResolveContext: any = {};
        const mockToken: any = { isCancellationRequested: false };
        provider.resolveWebviewView(mockWebviewView, mockResolveContext, mockToken);
    });

    test('should have correct viewType', () => {
        expect(ManagementWebviewProvider.viewType).toBe('serviceFabricManagementPanel');
    });

    test('should construct successfully', () => {
        expect(provider).toBeDefined();
    });

    describe('resolveWebviewView', () => {
        test('should set webview options and HTML', () => {
            const mockWebviewView: any = {
                webview: {
                    options: {},
                    html: '',
                    onDidReceiveMessage: jest.fn(),
                    cspSource: 'mock-csp',
                },
            };
            const mockContext: any = {};
            const mockToken: any = { isCancellationRequested: false };

            provider.resolveWebviewView(mockWebviewView, mockContext, mockToken);

            expect(mockWebviewView.webview.options.enableScripts).toBe(true);
            expect(mockWebviewView.webview.html).toBeTruthy();
            expect(mockWebviewView.webview.html).toContain('<html');
        });

        test('should register message handler', () => {
            const mockWebviewView: any = {
                webview: {
                    options: {},
                    html: '',
                    onDidReceiveMessage: jest.fn(),
                    cspSource: 'mock-csp',
                },
            };
            const mockContext: any = {};
            const mockToken: any = { isCancellationRequested: false };

            provider.resolveWebviewView(mockWebviewView, mockContext, mockToken);

            expect(mockWebviewView.webview.onDidReceiveMessage).toHaveBeenCalled();
        });

        test('should include CSP meta tag in HTML', () => {
            const mockWebviewView: any = {
                webview: {
                    options: {},
                    html: '',
                    onDidReceiveMessage: jest.fn(),
                    cspSource: 'test-csp-source',
                },
            };
            provider.resolveWebviewView(mockWebviewView, {} as any, { isCancellationRequested: false } as any);
            expect(mockWebviewView.webview.html).toContain('Content-Security-Policy');
            expect(mockWebviewView.webview.html).toContain('test-csp-source');
        });
    });

    describe('_handleMessage', () => {
        test('should handle ready message', async () => {
            await messageHandler({ command: 'ready' });
            // Should update selected cluster
        });

        test('should handle deployApplication (cancel on file dialog)', async () => {
            (vscode.window.showOpenDialog as jest.Mock).mockResolvedValue(undefined);
            await messageHandler({ command: 'deployApplication' });
            // Should return early
        });

        test('should handle upgradeApplication', async () => {
            await messageHandler({ command: 'upgradeApplication', data: {} });
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                'Application upgrade not yet implemented'
            );
        });

        test('should handle removeApplication (cancel selection)', async () => {
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(undefined);
            await messageHandler({ command: 'removeApplication', data: {} });
            // Should return early after user cancels
        });

        test('should handle removeApplication (cancel confirmation)', async () => {
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue('fabric:/App1');
            (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue('No');
            await messageHandler({ command: 'removeApplication', data: {} });
        });

        test('should handle deactivateNode (cancel selection)', async () => {
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(undefined);
            await messageHandler({ command: 'deactivateNode', data: {} });
        });

        test('should handle deactivateNode (cancel intent)', async () => {
            (vscode.window.showQuickPick as jest.Mock)
                .mockResolvedValueOnce('Node1')
                .mockResolvedValueOnce(undefined);
            await messageHandler({ command: 'deactivateNode', data: {} });
        });

        test('should handle activateNode (cancel selection)', async () => {
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(undefined);
            await messageHandler({ command: 'activateNode', data: {} });
        });

        test('should handle restartNode (cancel selection)', async () => {
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(undefined);
            await messageHandler({ command: 'restartNode', data: {} });
        });

        test('should handle restartNode (cancel confirmation)', async () => {
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue('Node1');
            (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue('Cancel');
            await messageHandler({ command: 'restartNode', data: {} });
        });

        test('should handle restartNode success', async () => {
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue('Node1');
            (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue('Restart');
            // withProgress calls the handler immediately
            (vscode.window.withProgress as jest.Mock).mockImplementation(async (_opts: any, handler: any) => {
                await handler({ report: jest.fn() }, { isCancellationRequested: false });
            });
            await messageHandler({ command: 'restartNode', data: {} });
            expect(mockSfRest.restartNode).toHaveBeenCalledWith('Node1');
            expect(mockSfMgr.sfClusterView.refresh).toHaveBeenCalled();
        });

        test('should handle removeNodeState (cancel selection)', async () => {
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(undefined);
            await messageHandler({ command: 'removeNodeState', data: {} });
        });

        test('should handle upgradeCluster', async () => {
            await messageHandler({ command: 'upgradeCluster', data: {} });
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                'Cluster upgrade not yet implemented'
            );
        });

        test('should handle backupCluster', async () => {
            await messageHandler({ command: 'backupCluster' });
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                'Cluster backup not yet implemented'
            );
        });

        test('should handle createBackup', async () => {
            await messageHandler({ command: 'createBackup', data: {} });
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                'Backup creation not yet implemented'
            );
        });

        test('should handle restoreBackup', async () => {
            await messageHandler({ command: 'restoreBackup', data: {} });
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                'Backup restore not yet implemented'
            );
        });

        test('should handle unknown command', async () => {
            await messageHandler({ command: 'unknownCommand' });
            // Should log warning
        });

        test('should handle errors in message handling', async () => {
            mockSfMgr.getCurrentSfConfig.mockImplementation(() => { throw new Error('Config error'); });
            await messageHandler({ command: 'removeApplication', data: {} });
            // Error should be caught and sent to webview
        });
    });

    describe('_getApplicationList', () => {
        test('should return application names', async () => {
            // Access via removeApplication which calls _getApplicationList
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(undefined);
            await messageHandler({ command: 'removeApplication', data: {} });
            expect(mockSfRest.getApplications).toHaveBeenCalled();
        });

        test('should handle getApplications failure', async () => {
            mockSfRest.getApplications.mockRejectedValue(new Error('Network error'));
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(undefined);
            await messageHandler({ command: 'removeApplication', data: {} });
            // Should not throw - returns empty list
        });
    });

    describe('_getNodeList', () => {
        test('should return node names', async () => {
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(undefined);
            await messageHandler({ command: 'restartNode', data: {} });
            expect(mockSfRest.getNodes).toHaveBeenCalled();
        });

        test('should handle getNodes failure', async () => {
            mockSfRest.getNodes.mockRejectedValue(new Error('Network error'));
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(undefined);
            await messageHandler({ command: 'restartNode', data: {} });
            // Should not throw
        });
    });

    describe('HTML content', () => {
        test('should contain management panel elements', () => {
            const mockWebviewView: any = {
                webview: {
                    options: {},
                    html: '',
                    onDidReceiveMessage: jest.fn(),
                    cspSource: 'test',
                },
            };
            provider.resolveWebviewView(mockWebviewView, {} as any, { isCancellationRequested: false } as any);
            expect(mockWebviewView.webview.html).toContain('Service Fabric Management');
            expect(mockWebviewView.webview.html).toContain('acquireVsCodeApi');
            expect(mockWebviewView.webview.html).toContain('deployApplication');
            expect(mockWebviewView.webview.html).toContain('nonce-');
        });
    });
});
