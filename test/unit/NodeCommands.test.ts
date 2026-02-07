/**
 * Unit tests for NodeCommands
 */
import * as vscode from 'vscode';

// Mock CommandUtils to bypass safeRegisterCommand dedup protection
jest.mock('../../src/utils/CommandUtils', () => ({
    registerCommandWithErrorHandling: jest.fn((context: any, commandId: string, handler: any) => {
        const disposable = require('vscode').commands.registerCommand(commandId, handler);
        context.subscriptions.push(disposable);
    }),
    withProgress: jest.fn((_title: string, operation: any) => operation({ report: jest.fn() })),
}));

import { registerNodeCommands } from '../../src/commands/NodeCommands';

describe('NodeCommands', () => {
    let mockContext: vscode.ExtensionContext;
    let mockSfMgr: any;
    let registeredHandlers: Record<string, (...args: any[]) => any>;

    beforeEach(() => {
        jest.clearAllMocks();
        registeredHandlers = {};
        mockContext = new (vscode as any).ExtensionContext();

        (vscode.commands.registerCommand as jest.Mock).mockImplementation((id, handler) => {
            registeredHandlers[id] = handler;
            return { dispose: jest.fn() };
        });

        mockSfMgr = {
            getSfRest: jest.fn().mockReturnValue({
                activateNode: jest.fn().mockResolvedValue(undefined),
                deactivateNode: jest.fn().mockResolvedValue(undefined),
                restartNode: jest.fn().mockResolvedValue(undefined),
                removeNodeState: jest.fn().mockResolvedValue(undefined),
            }),
            sfClusterView: { refresh: jest.fn() }
        };

        registerNodeCommands(mockContext, mockSfMgr);
    });

    test('should register manageNodeFromContext command', () => {
        expect(registeredHandlers['sfClusterExplorer.manageNodeFromContext']).toBeDefined();
    });

    test('should return when user cancels quick pick', async () => {
        (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(undefined);
        const handler = registeredHandlers['sfClusterExplorer.manageNodeFromContext'];
        await handler({ label: 'Node0', itemId: 'Node0', itemType: 'node', contextValue: 'node' });
        expect(mockSfMgr.getSfRest().activateNode).not.toHaveBeenCalled();
    });

    test('should activate node when selected', async () => {
        (vscode.window.showQuickPick as jest.Mock).mockResolvedValue({ label: 'Activate Node', value: 'activate' });
        const handler = registeredHandlers['sfClusterExplorer.manageNodeFromContext'];
        await handler({ label: 'Node0', itemId: 'Node0', itemType: 'node', contextValue: 'node' });
        expect(mockSfMgr.getSfRest().activateNode).toHaveBeenCalledWith('Node0');
    });

    test('should deactivate node with Pause', async () => {
        (vscode.window.showQuickPick as jest.Mock).mockResolvedValue({ label: 'Deactivate Node (Pause)', value: 'deactivate-pause' });
        const handler = registeredHandlers['sfClusterExplorer.manageNodeFromContext'];
        await handler({ label: 'Node0', itemId: 'Node0', itemType: 'node', contextValue: 'node' });
        expect(mockSfMgr.getSfRest().deactivateNode).toHaveBeenCalledWith('Node0', 'Pause');
    });

    test('should deactivate node with Restart', async () => {
        (vscode.window.showQuickPick as jest.Mock).mockResolvedValue({ label: 'Deactivate Node (Restart)', value: 'deactivate-restart' });
        const handler = registeredHandlers['sfClusterExplorer.manageNodeFromContext'];
        await handler({ label: 'Node0', itemId: 'Node0', itemType: 'node', contextValue: 'node' });
        expect(mockSfMgr.getSfRest().deactivateNode).toHaveBeenCalledWith('Node0', 'Restart');
    });

    test('should deactivate node with RemoveData', async () => {
        (vscode.window.showQuickPick as jest.Mock).mockResolvedValue({ label: 'Deactivate Node (Remove Data)', value: 'deactivate-removedata' });
        const handler = registeredHandlers['sfClusterExplorer.manageNodeFromContext'];
        await handler({ label: 'Node0', itemId: 'Node0', itemType: 'node', contextValue: 'node' });
        expect(mockSfMgr.getSfRest().deactivateNode).toHaveBeenCalledWith('Node0', 'RemoveData');
    });

    test('should restart node', async () => {
        (vscode.window.showQuickPick as jest.Mock).mockResolvedValue({ label: 'Restart Node', value: 'restart' });
        const handler = registeredHandlers['sfClusterExplorer.manageNodeFromContext'];
        await handler({ label: 'Node0', itemId: 'Node0', itemType: 'node', contextValue: 'node' });
        expect(mockSfMgr.getSfRest().restartNode).toHaveBeenCalledWith('Node0');
    });

    test('should remove node state after confirmation', async () => {
        (vscode.window.showQuickPick as jest.Mock).mockResolvedValue({ label: 'Remove Node State', value: 'remove-state' });
        (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue('Remove State');
        const handler = registeredHandlers['sfClusterExplorer.manageNodeFromContext'];
        await handler({ label: 'Node0', itemId: 'Node0', itemType: 'node', contextValue: 'node' });
        expect(mockSfMgr.getSfRest().removeNodeState).toHaveBeenCalledWith('Node0');
    });

    test('should not remove node state when cancelled', async () => {
        (vscode.window.showQuickPick as jest.Mock).mockResolvedValue({ label: 'Remove Node State', value: 'remove-state' });
        (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue(undefined);
        const handler = registeredHandlers['sfClusterExplorer.manageNodeFromContext'];
        await handler({ label: 'Node0', itemId: 'Node0', itemType: 'node', contextValue: 'node' });
        expect(mockSfMgr.getSfRest().removeNodeState).not.toHaveBeenCalled();
    });

    test('should throw when sfRest is not available', async () => {
        mockSfMgr.getSfRest.mockReturnValue(null);
        (vscode.window.showQuickPick as jest.Mock).mockResolvedValue({ label: 'Activate Node', value: 'activate' });
        const handler = registeredHandlers['sfClusterExplorer.manageNodeFromContext'];
        await expect(handler({ label: 'Node0', itemId: 'Node0', itemType: 'node', contextValue: 'node' }))
            .rejects.toThrow('Not connected to cluster');
    });

    test('should extract node name from label with parentheses', async () => {
        (vscode.window.showQuickPick as jest.Mock).mockResolvedValue({ label: 'Activate Node', value: 'activate' });
        const handler = registeredHandlers['sfClusterExplorer.manageNodeFromContext'];
        await handler({ label: 'Node0 (Up)', itemId: 'Node0', itemType: 'node', contextValue: 'node' });
        expect(mockSfMgr.getSfRest().activateNode).toHaveBeenCalledWith('Node0');
    });
});
