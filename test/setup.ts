/**
 * Jest setup file - runs before all tests
 */

// Load environment variables from .env file
import * as dotenv from 'dotenv';
dotenv.config();

// Increase timeout for integration tests
jest.setTimeout(30000);

// Mock VS Code API globally
jest.mock('vscode', () => ({
    window: {
        showInformationMessage: jest.fn(),
        showWarningMessage: jest.fn(),
        showErrorMessage: jest.fn(),
        showQuickPick: jest.fn(),
        showInputBox: jest.fn(),
        createOutputChannel: jest.fn(() => ({
            appendLine: jest.fn(),
            append: jest.fn(),
            clear: jest.fn(),
            show: jest.fn(),
            dispose: jest.fn(),
            debug: jest.fn(),
            trace: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        })),
        withProgress: jest.fn((options, task) => task({ report: jest.fn() })),
        registerTreeDataProvider: jest.fn(),
        createTreeView: jest.fn(() => ({
            dispose: jest.fn(),
            reveal: jest.fn()
        })),
        registerWebviewViewProvider: jest.fn()
    },
    env: {
        createTelemetryLogger: jest.fn(() => ({
            logUsage: jest.fn(),
            logError: jest.fn(),
            dispose: jest.fn()
        })),
        telemetryConfiguration: {
            isTelemetryEnabled: jest.fn(() => false)
        }
    },
    workspace: {
        getConfiguration: jest.fn(() => ({
            get: jest.fn(),
            update: jest.fn(),
            has: jest.fn()
        })),
        workspaceFolders: [],
        onDidChangeConfiguration: jest.fn()
    },
    commands: {
        registerCommand: jest.fn(),
        executeCommand: jest.fn(),
        getCommands: jest.fn().mockResolvedValue([])
    },
    extensions: {
        getExtension: jest.fn().mockReturnValue(undefined)
    },
    Uri: {
        parse: jest.fn((str) => ({ fsPath: str, toString: () => str })),
        file: jest.fn((str) => ({ fsPath: str, toString: () => str }))
    },
    TreeItem: class TreeItem {
        constructor(public label: string, public collapsibleState?: any) {}
    },
    TreeItemCollapsibleState: {
        None: 0,
        Collapsed: 1,
        Expanded: 2
    },
    ThemeIcon: class ThemeIcon {
        constructor(public id: string, public color?: any) {}
    },
    ThemeColor: class ThemeColor {
        constructor(public id: string) {}
    },
    EventEmitter: class EventEmitter {
        event = jest.fn();
        fire = jest.fn();
    },
    ProgressLocation: {
        Notification: 15
    },
    ConfigurationTarget: {
        Global: 1,
        Workspace: 2,
        WorkspaceFolder: 3
    },
    ExtensionContext: class ExtensionContext {
        subscriptions: any[] = [];
        globalStorageUri = { fsPath: '/mock/storage' };
        extensionUri = { fsPath: '/mock/extension' };
        extensionPath = '/mock/extension';
        globalState = { get: jest.fn(), update: jest.fn(), keys: jest.fn().mockReturnValue([]) };
        workspaceState = { get: jest.fn(), update: jest.fn(), keys: jest.fn().mockReturnValue([]) };
        secrets = { get: jest.fn(), store: jest.fn(), delete: jest.fn() };
    },
    Disposable: class Disposable {
        constructor(private callOnDispose: () => void) {}
        dispose() { this.callOnDispose(); }
    }
}), { virtual: true });

// Suppress console output during tests unless VERBOSE=true
if (!process.env.VERBOSE) {
    global.console = {
        ...console,
        log: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    };
}
