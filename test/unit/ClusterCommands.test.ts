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
            })
        };

        mockSfPrompts = {
            promptForAddClusterEndpoint: jest.fn().mockResolvedValue(undefined),
            promptForGetClusterEndpoint: jest.fn().mockResolvedValue(undefined),
            promptForRemoveClusterEndpoint: jest.fn().mockResolvedValue(undefined),
            promptForClusterRestCall: jest.fn().mockResolvedValue(undefined)
        };

        registerClusterCommands(mockContext, mockSfMgr, mockSfPrompts);
    });

    test('should register all 8 cluster commands', () => {
        expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(8);
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
        await handler({ label: 'http://cluster:19080' });
        expect(mockSfMgr.removeClusterFromTree).toHaveBeenCalledWith('http://cluster:19080');
    });

    test('removeClusterFromTree should not remove on cancel', async () => {
        (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue(undefined);
        const handler = registeredHandlers['sfClusterExplorer.removeClusterFromTree'];
        await handler({ label: 'http://cluster:19080' });
        expect(mockSfMgr.removeClusterFromTree).not.toHaveBeenCalled();
    });

    test('removeClusterFromTree should throw for invalid item', async () => {
        const handler = registeredHandlers['sfClusterExplorer.removeClusterFromTree'];
        await expect(handler(null)).rejects.toThrow('invalid tree item');
    });

    test('setActiveCluster should call sfMgr.setActiveCluster', async () => {
        const handler = registeredHandlers['sfClusterExplorer.setActiveCluster'];
        await handler({ label: 'http://cluster:19080' });
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
});
