/**
 * Extended unit tests for CommandUtils — targeting uncovered lines
 */
import * as vscode from 'vscode';
import {
    safeRegisterCommand,
    registerCommandWithErrorHandling,
    registerSimpleCommand,
    validateTreeItem,
    confirmDestructiveOperation,
    confirmWithTypedText,
    withProgress
} from '../../src/utils/CommandUtils';

describe('CommandUtils (extended coverage)', () => {
    let mockContext: vscode.ExtensionContext;

    beforeEach(() => {
        jest.clearAllMocks();
        mockContext = new (vscode as any).ExtensionContext();
        (vscode.commands.registerCommand as jest.Mock).mockReturnValue({
            dispose: jest.fn()
        });
    });

    describe('registerCommandWithErrorHandling', () => {
        test('should register command with error handler wrapping', () => {
            const handler = jest.fn();
            registerCommandWithErrorHandling(mockContext, 'test.cmdErrHandle', handler, 'test action');
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'test.cmdErrHandle',
                expect.any(Function),
                undefined
            );
        });

        test('error handler should catch and display error', async () => {
            const handler = jest.fn().mockRejectedValue(new Error('boom'));
            registerCommandWithErrorHandling(mockContext, 'test.cmdWithErrCatch', handler, 'do something');

            // Extract the wrapped handler that was registered
            const wrappedHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls
                .find((call: any[]) => call[0] === 'test.cmdWithErrCatch')?.[1];
            expect(wrappedHandler).toBeDefined();

            // Call the wrapped handler — should not throw
            await wrappedHandler();
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                expect.stringContaining('Failed to do something: boom')
            );
        });

        test('error handler should use extracted action name when no friendlyName', async () => {
            const handler = jest.fn().mockRejectedValue(new Error('fail'));
            registerCommandWithErrorHandling(mockContext, 'sfClusterExplorer.deployApplication', handler);

            const wrappedHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls
                .find((call: any[]) => call[0] === 'sfClusterExplorer.deployApplication')?.[1];

            await wrappedHandler();
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                expect.stringContaining('deploy application')
            );
        });

        test('error handler should handle non-Error thrown values', async () => {
            const handler = jest.fn().mockRejectedValue('string-error');
            registerCommandWithErrorHandling(mockContext, 'test.nonErrorThrow', handler, 'test');

            const wrappedHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls
                .find((call: any[]) => call[0] === 'test.nonErrorThrow')?.[1];

            await wrappedHandler();
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                expect.stringContaining('string-error')
            );
        });
    });

    describe('registerSimpleCommand', () => {
        test('should register command via safeRegisterCommand', () => {
            const handler = jest.fn();
            registerSimpleCommand(mockContext, 'test.simpleCmd', handler);
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'test.simpleCmd',
                handler,
                undefined
            );
        });
    });

    describe('validateTreeItem', () => {
        test('should throw when item is null', () => {
            expect(() => validateTreeItem(null)).toThrow('No item provided');
        });

        test('should throw when item is undefined', () => {
            expect(() => validateTreeItem(undefined)).toThrow('No item provided');
        });

        test('should pass when item is valid without constraints', () => {
            expect(() => validateTreeItem({ label: 'test' })).not.toThrow();
        });

        test('should throw when item type does not match', () => {
            expect(() => validateTreeItem({ itemType: 'node' }, 'application'))
                .toThrow('This command is only available for application items');
        });

        test('should pass when item type matches', () => {
            expect(() => validateTreeItem({ itemType: 'node' }, 'node')).not.toThrow();
        });

        test('should throw when required field is missing', () => {
            expect(() => validateTreeItem({ name: 'test' }, undefined, ['id']))
                .toThrow('Missing required field: id');
        });

        test('should pass when all required fields present', () => {
            expect(() => validateTreeItem({ id: '1', name: 'test' }, undefined, ['id', 'name']))
                .not.toThrow();
        });

        test('should check both type and fields', () => {
            expect(() => validateTreeItem({ itemType: 'node', id: '1' }, 'node', ['id']))
                .not.toThrow();
        });
    });

    describe('confirmDestructiveOperation', () => {
        test('should return true when user confirms', async () => {
            (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue('Confirm');
            const result = await confirmDestructiveOperation('Are you sure?');
            expect(result).toBe(true);
            expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
                'Are you sure?',
                { modal: true },
                'Confirm'
            );
        });

        test('should return false when user cancels', async () => {
            (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue(undefined);
            const result = await confirmDestructiveOperation('Are you sure?');
            expect(result).toBe(false);
        });

        test('should use custom button text', async () => {
            (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue('Delete');
            const result = await confirmDestructiveOperation('Delete this?', 'Delete');
            expect(result).toBe(true);
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

        test('should pass validateInput function', async () => {
            (vscode.window.showInputBox as jest.Mock).mockImplementation(async (options: any) => {
                // Simulate the validation
                const validResult = options.validateInput('DELETE');
                expect(validResult).toBeNull();
                const invalidResult = options.validateInput('wrong');
                expect(invalidResult).toContain('Must match exactly');
                return 'DELETE';
            });
            await confirmWithTypedText('Type DELETE', 'DELETE');
        });
    });

    describe('withProgress', () => {
        test('should call vscode.window.withProgress', async () => {
            const operation = jest.fn().mockResolvedValue('result');
            const result = await withProgress('Loading...', operation);
            expect(vscode.window.withProgress).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Loading...',
                    location: vscode.ProgressLocation.Notification,
                    cancellable: false
                }),
                operation
            );
        });
    });
});
