/**
 * Unit tests for ClusterCommands
 * Tests command registration and handler behavior
 */
import * as vscode from 'vscode';

// Mock CommandUtils to bypass safeRegisterCommand dedup protection
jest.mock('../../src/utils/CommandUtils', () => ({
    registerCommandWithErrorHandling: jest.fn((context: any, commandId: string, handler: any) => {
        const disposable = require('vscode').commands.registerCommand(commandId, handler);
        context.subscriptions.push(disposable);
    }),
    safeRegisterCommand: jest.fn(),
    registerSimpleCommand: jest.fn(),
    withProgress: jest.fn((_title: string, operation: any) => operation({ report: jest.fn() })),
    confirmWithTypedText: jest.fn(),
    confirmDestructiveOperation: jest.fn(),
    validateTreeItem: jest.fn(),
}));

import { registerClusterCommands } from '../../src/commands/ClusterCommands';

describe('ClusterCommands', () => {
    let mockContext: vscode.ExtensionContext;
    let mockSfMgr: any;
    let mockSfPrompts: any;
    let registeredHandlers: Record<string, (...args: any[]) => any>;

    beforeEach(() => {
        jest.clearAllMocks();
        registeredHandlers = {};
        mockContext = new (vscode as any).ExtensionContext();
        
        // Capture registered command handlers
        (vscode.commands.registerCommand as jest.Mock).mockImplementation((id, handler) => {
            registeredHandlers[id] = handler;
            return { dispose: jest.fn() };
        });

        mockSfMgr = {
            getClusters: jest.fn().mockResolvedValue(undefined),
            deployDevCluster: jest.fn().mockResolvedValue(undefined),
            removeClusterFromTree: jest.fn(),
            setActiveCluster: jest.fn(),
            getCurrentSfConfig: jest.fn().mockReturnValue({
                getClusterEndpoint: jest.fn().mockReturnValue('http://localhost:19080'),
                getClusterCertificate: jest.fn()
            }),
            sfClusterView: {
                setClusterRefreshDisabled: jest.fn(),
            }
        };

        mockSfPrompts = {
            promptForAddClusterEndpoint: jest.fn().mockResolvedValue(undefined),
            promptForGetClusterEndpoint: jest.fn().mockResolvedValue(undefined),
            promptForRemoveClusterEndpoint: jest.fn().mockResolvedValue(undefined),
            promptForClusterRestCall: jest.fn().mockResolvedValue(undefined)
        };

        registerClusterCommands(mockContext, mockSfMgr, mockSfPrompts);
    });

    test('should register all 13 cluster commands', () => {
        expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(13);
    });

    test('sfGetClusters should call sfMgr.getClusters', async () => {
        const handler = registeredHandlers['sfClusterExplorer.sfGetClusters'];
        await handler();
        expect(mockSfMgr.getClusters).toHaveBeenCalled();
    });

    test('sfGetCluster should call sfPrompts.promptForGetClusterEndpoint', async () => {
        const handler = registeredHandlers['sfClusterExplorer.sfGetCluster'];
        await handler();
        expect(mockSfPrompts.promptForGetClusterEndpoint).toHaveBeenCalledWith(mockSfMgr);
    });

    test('sfDeployDevCluster should call sfMgr.deployDevCluster', async () => {
        const handler = registeredHandlers['sfClusterExplorer.sfDeployDevCluster'];
        await handler();
        expect(mockSfMgr.deployDevCluster).toHaveBeenCalled();
    });

    test('sfSetClusterEndpoint should call promptForAddClusterEndpoint', async () => {
        const handler = registeredHandlers['sfClusterExplorer.sfSetClusterEndpoint'];
        await handler();
        expect(mockSfPrompts.promptForAddClusterEndpoint).toHaveBeenCalled();
    });

    test('sfRemoveClusterEndpoint should call promptForRemoveClusterEndpoint', async () => {
        const handler = registeredHandlers['sfClusterExplorer.sfRemoveClusterEndpoint'];
        await handler();
        expect(mockSfPrompts.promptForRemoveClusterEndpoint).toHaveBeenCalled();
    });

    test('removeClusterFromTree should confirm then remove', async () => {
        (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue('Remove');
        const handler = registeredHandlers['sfClusterExplorer.removeClusterFromTree'];
        await handler({ clusterEndpoint: 'http://cluster:19080' });
        expect(mockSfMgr.removeClusterFromTree).toHaveBeenCalledWith('http://cluster:19080');
    });

    test('removeClusterFromTree should not remove on cancel', async () => {
        (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue(undefined);
        const handler = registeredHandlers['sfClusterExplorer.removeClusterFromTree'];
        await handler({ clusterEndpoint: 'http://cluster:19080' });
        expect(mockSfMgr.removeClusterFromTree).not.toHaveBeenCalled();
    });

    test('removeClusterFromTree should throw for invalid item', async () => {
        const handler = registeredHandlers['sfClusterExplorer.removeClusterFromTree'];
        await expect(handler(null)).rejects.toThrow('invalid tree item');
    });

    test('setActiveCluster should call sfMgr.setActiveCluster', async () => {
        const handler = registeredHandlers['sfClusterExplorer.setActiveCluster'];
        await handler({ clusterEndpoint: 'http://cluster:19080' });
        expect(mockSfMgr.setActiveCluster).toHaveBeenCalledWith('http://cluster:19080');
    });

    test('setActiveCluster should throw for invalid item', async () => {
        const handler = registeredHandlers['sfClusterExplorer.setActiveCluster'];
        await expect(handler(null)).rejects.toThrow('invalid tree item');
    });

    test('sfSetClusterRestCall should call promptForClusterRestCall', async () => {
        const handler = registeredHandlers['sfClusterExplorer.sfSetClusterRestCall'];
        await handler();
        expect(mockSfPrompts.promptForClusterRestCall).toHaveBeenCalledWith(mockSfMgr);
    });

    // ── Auto-refresh enable / disable / toggle ────────────────────────

    describe('auto-refresh enable/disable', () => {
        const endpoint = 'http://cluster:19080';
        const item = { clusterEndpoint: endpoint };

        test('enableClusterRefresh should remove endpoint from disabled list', async () => {
            // Start with endpoint disabled
            mockContext.globalState.get = jest.fn().mockReturnValue([endpoint]);
            mockContext.globalState.update = jest.fn().mockResolvedValue(undefined);

            const handler = registeredHandlers['sfClusterExplorer.enableClusterRefresh'];
            await handler(item);

            expect(mockContext.globalState.update).toHaveBeenCalledWith(
                'sfClusterExplorer.refreshDisabledClusters',
                [] // endpoint removed
            );
            expect(mockSfMgr.sfClusterView.setClusterRefreshDisabled).toHaveBeenCalledWith(endpoint, false);
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                expect.stringContaining('enabled')
            );
        });

        test('enableClusterRefresh should be a no-op if already enabled', async () => {
            // Endpoint is NOT in the disabled list
            mockContext.globalState.get = jest.fn().mockReturnValue([]);
            mockContext.globalState.update = jest.fn().mockResolvedValue(undefined);

            const handler = registeredHandlers['sfClusterExplorer.enableClusterRefresh'];
            await handler(item);

            // globalState.update should NOT be called since nothing changed
            expect(mockContext.globalState.update).not.toHaveBeenCalled();
            expect(mockSfMgr.sfClusterView.setClusterRefreshDisabled).toHaveBeenCalledWith(endpoint, false);
        });

        test('disableClusterRefresh should add endpoint to disabled list', async () => {
            // Start with nothing disabled
            mockContext.globalState.get = jest.fn().mockReturnValue([]);
            mockContext.globalState.update = jest.fn().mockResolvedValue(undefined);

            const handler = registeredHandlers['sfClusterExplorer.disableClusterRefresh'];
            await handler(item);

            expect(mockContext.globalState.update).toHaveBeenCalledWith(
                'sfClusterExplorer.refreshDisabledClusters',
                [endpoint]
            );
            expect(mockSfMgr.sfClusterView.setClusterRefreshDisabled).toHaveBeenCalledWith(endpoint, true);
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                expect.stringContaining('disabled')
            );
        });

        test('disableClusterRefresh should be a no-op if already disabled', async () => {
            // Already disabled
            mockContext.globalState.get = jest.fn().mockReturnValue([endpoint]);
            mockContext.globalState.update = jest.fn().mockResolvedValue(undefined);

            const handler = registeredHandlers['sfClusterExplorer.disableClusterRefresh'];
            await handler(item);

            // Should not add duplicate
            expect(mockContext.globalState.update).not.toHaveBeenCalled();
            expect(mockSfMgr.sfClusterView.setClusterRefreshDisabled).toHaveBeenCalledWith(endpoint, true);
        });

        test('disable then enable should restore original state', async () => {
            // Step 1: Start enabled (empty disabled list)
            let disabledList: string[] = [];
            mockContext.globalState.get = jest.fn().mockImplementation(() => [...disabledList]);
            mockContext.globalState.update = jest.fn().mockImplementation((_key, value) => {
                disabledList = value;
                return Promise.resolve();
            });

            // Disable
            const disableHandler = registeredHandlers['sfClusterExplorer.disableClusterRefresh'];
            await disableHandler(item);
            expect(disabledList).toContain(endpoint);
            expect(mockSfMgr.sfClusterView.setClusterRefreshDisabled).toHaveBeenCalledWith(endpoint, true);

            // Enable again
            mockSfMgr.sfClusterView.setClusterRefreshDisabled.mockClear();
            mockContext.globalState.get = jest.fn().mockImplementation(() => [...disabledList]);
            const enableHandler = registeredHandlers['sfClusterExplorer.enableClusterRefresh'];
            await enableHandler(item);
            expect(disabledList).not.toContain(endpoint);
            expect(mockSfMgr.sfClusterView.setClusterRefreshDisabled).toHaveBeenCalledWith(endpoint, false);
        });

        test('toggleClusterRefresh should enable when disabled', async () => {
            // Start with endpoint disabled
            mockContext.globalState.get = jest.fn().mockReturnValue([endpoint]);

            // Mock executeCommand to call the real handler
            (vscode.commands.executeCommand as jest.Mock).mockImplementation(async (cmdId, ...args) => {
                const handler = registeredHandlers[cmdId];
                if (handler) { await handler(...args); }
            });

            const handler = registeredHandlers['sfClusterExplorer.toggleClusterRefresh'];
            await handler(item);

            expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
                'sfClusterExplorer.enableClusterRefresh',
                item
            );
        });

        test('toggleClusterRefresh should disable when enabled', async () => {
            // Start with nothing disabled
            mockContext.globalState.get = jest.fn().mockReturnValue([]);

            (vscode.commands.executeCommand as jest.Mock).mockImplementation(async (cmdId, ...args) => {
                const handler = registeredHandlers[cmdId];
                if (handler) { await handler(...args); }
            });

            const handler = registeredHandlers['sfClusterExplorer.toggleClusterRefresh'];
            await handler(item);

            expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
                'sfClusterExplorer.disableClusterRefresh',
                item
            );
        });

        test('enableClusterRefresh should throw for invalid item', async () => {
            const handler = registeredHandlers['sfClusterExplorer.enableClusterRefresh'];
            await expect(handler(null)).rejects.toThrow('invalid tree item');
        });

        test('disableClusterRefresh should throw for invalid item', async () => {
            const handler = registeredHandlers['sfClusterExplorer.disableClusterRefresh'];
            await expect(handler(null)).rejects.toThrow('invalid tree item');
        });

        test('toggleClusterRefresh should throw for invalid item', async () => {
            const handler = registeredHandlers['sfClusterExplorer.toggleClusterRefresh'];
            await expect(handler(null)).rejects.toThrow('invalid tree item');
        });
    });
});
