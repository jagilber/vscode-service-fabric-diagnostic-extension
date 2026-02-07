/**
 * Unit tests for CommandUtils
 * Tests command registration utilities, tree item validation,
 * and helper functions.
 */

import * as vscode from 'vscode';
import {
    safeRegisterCommand,
    registerCommandWithErrorHandling,
    registerSimpleCommand,
    validateTreeItem,
    confirmDestructiveOperation,
    confirmWithTypedText,
} from '../../../src/utils/CommandUtils';

// Reset the internal registry between tests
beforeEach(() => {
    jest.clearAllMocks();
    // Clear the internal registeredCommandIds set via module reload
    jest.resetModules();
});

describe('CommandUtils', () => {
    let mockContext: any;

    beforeEach(() => {
        mockContext = {
            subscriptions: [],
            extensionPath: '/mock/path',
            globalStorageUri: { fsPath: '/mock/storage' },
            extensionUri: { fsPath: '/mock/extension' }
        };
    });

    describe('safeRegisterCommand', () => {
        test('should register a command successfully', () => {
            const handler = jest.fn();
            const result = safeRegisterCommand(mockContext, 'test.command1', handler);

            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'test.command1',
                handler,
                undefined
            );
            expect(mockContext.subscriptions.length).toBe(1);
        });

        test('should skip duplicate registration', () => {
            const handler = jest.fn();
            
            // First registration
            safeRegisterCommand(mockContext, 'test.duplicate', handler);
            // Second registration of same command
            const result = safeRegisterCommand(mockContext, 'test.duplicate', handler);

            expect(result).toBeUndefined();
            // registerCommand should only be called once
            expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(1);
        });
    });

    describe('registerSimpleCommand', () => {
        test('should register command via safeRegisterCommand', () => {
            const handler = jest.fn();
            registerSimpleCommand(mockContext, 'test.simple', handler);

            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'test.simple',
                handler,
                undefined
            );
        });
    });

    describe('validateTreeItem', () => {
        test('should throw if item is null', () => {
            expect(() => validateTreeItem(null)).toThrow('No item provided');
        });

        test('should throw if item is undefined', () => {
            expect(() => validateTreeItem(undefined)).toThrow('No item provided');
        });

        test('should pass for valid item without type check', () => {
            expect(() => validateTreeItem({ itemType: 'node' })).not.toThrow();
        });

        test('should throw if item type does not match', () => {
            expect(() => validateTreeItem({ itemType: 'node' }, 'replica')).toThrow(
                'This command is only available for replica items'
            );
        });

        test('should pass if item type matches', () => {
            expect(() => validateTreeItem({ itemType: 'node' }, 'node')).not.toThrow();
        });

        test('should throw if required fields are missing', () => {
            expect(() => validateTreeItem({ itemType: 'node' }, undefined, ['clusterEndpoint'])).toThrow(
                'Missing required field: clusterEndpoint'
            );
        });

        test('should pass if required fields are present', () => {
            expect(() => validateTreeItem(
                { itemType: 'node', clusterEndpoint: 'http://localhost:19080' },
                undefined,
                ['clusterEndpoint']
            )).not.toThrow();
        });
    });

    describe('confirmDestructiveOperation', () => {
        test('should return true when user confirms', async () => {
            (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue('Confirm');

            const result = await confirmDestructiveOperation('Delete this?');

            expect(result).toBe(true);
            expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
                'Delete this?',
                { modal: true },
                'Confirm'
            );
        });

        test('should return false when user cancels', async () => {
            (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue(undefined);

            const result = await confirmDestructiveOperation('Delete this?');

            expect(result).toBe(false);
        });

        test('should use custom confirm button text', async () => {
            (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue('Delete');

            const result = await confirmDestructiveOperation('Delete this?', 'Delete');

            expect(result).toBe(true);
            expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
                'Delete this?',
                { modal: true },
                'Delete'
            );
        });
    });

    describe('confirmWithTypedText', () => {
        test('should return true when user types matching text', async () => {
            (vscode.window.showInputBox as jest.Mock).mockResolvedValue('DELETE');

            const result = await confirmWithTypedText('Type DELETE to confirm', 'DELETE');

            expect(result).toBe(true);
        });

        test('should return false when user cancels', async () => {
            (vscode.window.showInputBox as jest.Mock).mockResolvedValue(undefined);

            const result = await confirmWithTypedText('Type DELETE to confirm', 'DELETE');

            expect(result).toBe(false);
        });
    });
});
