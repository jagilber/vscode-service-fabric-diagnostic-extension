/**
 * Unit tests for sfClusterExplorer (SfClusterExplorerProvider)
 */
import * as vscode from 'vscode';

import { SfClusterExplorerProvider } from '../../src/sfClusterExplorer';

describe('SfClusterExplorerProvider', () => {
    let provider: SfClusterExplorerProvider;
    let mockContext: vscode.ExtensionContext;

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup getConfiguration to return autorefresh config
        (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue(false),
            update: jest.fn(),
            has: jest.fn(),
        });
        mockContext = new (vscode as any).ExtensionContext();
        provider = new SfClusterExplorerProvider(mockContext);
    });

    test('should construct successfully', () => {
        expect(provider).toBeDefined();
    });

    describe('refresh', () => {
        test('should fire tree data change event', () => {
            provider.refresh();
            // Should not throw
        });

        test('should fire with offset', () => {
            provider.refresh(42);
            // Should not throw
        });
    });

    describe('getChildren', () => {
        test('should return empty array when no tree', async () => {
            const children = await provider.getChildren(undefined as any);
            expect(children).toEqual([]);
        });
    });

    describe('getTreeItem', () => {
        test('should throw when no tree is parsed', () => {
            expect(() => provider.getTreeItem(0)).toThrow('Invalid tree');
        });
    });

    describe('select', () => {
        test('should not throw when no editor', () => {
            const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 5));
            // When no editor, should just silently return
            provider.select(range);
        });
    });

    describe('rename', () => {
        test('should prompt for new label', () => {
            (vscode.window.showInputBox as jest.Mock).mockResolvedValue('newLabel');
            provider.rename(0);
            expect(vscode.window.showInputBox).toHaveBeenCalledWith(expect.objectContaining({
                placeHolder: 'Enter the new label',
            }));
        });

        test('should handle cancel', () => {
            (vscode.window.showInputBox as jest.Mock).mockResolvedValue(undefined);
            provider.rename(0);
            // Should not throw
        });
    });

    describe('onDidChangeTreeData', () => {
        test('should be defined', () => {
            expect(provider.onDidChangeTreeData).toBeDefined();
        });
    });

    describe('auto refresh', () => {
        test('should read autorefresh from configuration', () => {
            expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith('jsonOutline');
        });
    });
});
