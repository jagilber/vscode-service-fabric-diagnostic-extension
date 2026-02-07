/**
 * Command registration utilities
 * Provides wrapped command registration with consistent error handling
 * and safe double-registration protection
 */

import * as vscode from 'vscode';
import { SfUtility, debugLevel } from '../sfUtility';

/** Tracks all commands registered during this activation to prevent double-registration crashes */
const registeredCommandIds = new Set<string>();

/**
 * Safely register a VS Code command, guarding against double-registration.
 * If a command with the same ID was already registered in this session, logs a warning
 * and skips registration (preventing the "command already registered" crash that would
 * abort activation and leave ALL subsequent commands unregistered).
 *
 * @returns The disposable if registration succeeded, or undefined if skipped
 */
export function safeRegisterCommand(
    context: vscode.ExtensionContext,
    commandId: string,
    handler: (...args: any[]) => any,
    thisArg?: any
): vscode.Disposable | undefined {
    if (registeredCommandIds.has(commandId)) {
        SfUtility.outputLog(
            `Command '${commandId}' already registered in this session — skipping duplicate registration`,
            null,
            debugLevel.warn
        );
        return undefined;
    }

    const disposable = vscode.commands.registerCommand(commandId, handler, thisArg);
    registeredCommandIds.add(commandId);
    context.subscriptions.push(disposable);
    return disposable;
}

/**
 * Register a command with automatic error handling wrapper.
 * Uses safeRegisterCommand internally to prevent double-registration.
 * 
 * @param context - Extension context
 * @param commandId - Command identifier (e.g., 'sfClusterExplorer.refresh')
 * @param handler - Command handler function
 * @param friendlyName - User-friendly action name for error messages (e.g., 'refresh clusters')
 */
export function registerCommandWithErrorHandling(
    context: vscode.ExtensionContext,
    commandId: string,
    handler: (...args: any[]) => Promise<void> | void,
    friendlyName?: string
): void {
    safeRegisterCommand(context, commandId, async (...args: any[]) => {
        try {
            await handler(...args);
        } catch (error) {
            const actionName = friendlyName || extractActionFromCommandId(commandId);
            
            // Log the error
            SfUtility.outputLog(`Command ${commandId} failed`, error, debugLevel.error);
            
            // Show user-friendly error message
            const errorText = error instanceof Error ? error.message : String(error);
            SfUtility.showError(`Failed to ${actionName}: ${errorText}`);
        }
    });
}

/**
 * Extract a friendly action name from command ID
 * Converts 'sfClusterExplorer.deployApplication' to 'deploy application'
 */
function extractActionFromCommandId(commandId: string): string {
    // Remove prefix like 'sfClusterExplorer.'
    const parts = commandId.split('.');
    const action = parts[parts.length - 1];
    
    // Convert camelCase to space-separated words
    const friendlyAction = action
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .trim();
    
    return friendlyAction;
}

/**
 * Register a simple synchronous command (no error handling needed).
 * Uses safeRegisterCommand internally to prevent double-registration.
 */
export function registerSimpleCommand(
    context: vscode.ExtensionContext,
    commandId: string,
    handler: (...args: any[]) => void
): void {
    safeRegisterCommand(context, commandId, handler);
}

/**
 * Validate tree item before executing command
 * Ensures the item has required fields and is the correct type
 */
export function validateTreeItem(
    item: any,
    requiredType?: string,
    requiredFields?: string[]
): void {
    if (!item) {
        throw new Error('No item provided');
    }
    
    if (requiredType && item.itemType !== requiredType) {
        throw new Error(`This command is only available for ${requiredType} items`);
    }
    
    if (requiredFields) {
        for (const field of requiredFields) {
            if (!item[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
    }
}

/**
 * Show confirmation dialog before executing destructive operations
 * 
 * @param message - Confirmation message to display
 * @param confirmButtonText - Text for confirmation button (default: 'Confirm')
 * @returns true if user confirmed, false otherwise
 */
export async function confirmDestructiveOperation(
    message: string,
    confirmButtonText: string = 'Confirm'
): Promise<boolean> {
    const result = await vscode.window.showWarningMessage(
        message,
        { modal: true },
        confirmButtonText
    );
    
    return result === confirmButtonText;
}

/**
 * Show input box for typed confirmation (require user to type exact text)
 * Useful for destructive operations that require extra caution
 * 
 * @param promptMessage - Prompt message
 * @param confirmationText - Text user must type to confirm
 * @returns true if user typed correct confirmation text
 */
export async function confirmWithTypedText(
    promptMessage: string,
    confirmationText: string
): Promise<boolean> {
    const input = await vscode.window.showInputBox({
        prompt: promptMessage,
        placeHolder: confirmationText,
        validateInput: (value) => {
            return value === confirmationText ? null : `Must match exactly: ${confirmationText}`;
        }
    });
    
    return input === confirmationText;
}

/**
 * Execute operation with progress notification
 * 
 * @param title - Progress notification title
 * @param operation - Async operation to execute
 * @returns Result of operation
 */
export async function withProgress<T>(
    title: string,
    operation: (progress: vscode.Progress<{ message?: string; increment?: number }>) => Promise<T>
): Promise<T> {
    return vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title,
            cancellable: false
        },
        operation
    );
}
