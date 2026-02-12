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
        showOpenDialog: jest.fn(),
        withProgress: jest.fn().mockImplementation(async (_opts: any, handler: any) => {
            return handler({ report: jest.fn() }, { isCancellationRequested: false });
        }),
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
        registerWebviewViewProvider: jest.fn(),
        showTextDocument: jest.fn().mockResolvedValue(undefined),
        onDidChangeActiveTextEditor: jest.fn(),
        activeTextEditor: undefined,
        createWebviewPanel: jest.fn(() => ({
            webview: { html: '', onDidReceiveMessage: jest.fn(), options: {} },
            dispose: jest.fn(),
            reveal: jest.fn(),
        })),
        createTerminal: jest.fn(() => ({
            show: jest.fn(),
            sendText: jest.fn(),
            dispose: jest.fn(),
        }))
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
        onDidChangeConfiguration: jest.fn(),
        onDidChangeTextDocument: jest.fn(),
        onDidOpenTextDocument: jest.fn(),
        onDidCloseTextDocument: jest.fn(),
        onDidSaveTextDocument: jest.fn(),
        findFiles: jest.fn().mockResolvedValue([]),
        createFileSystemWatcher: jest.fn(() => ({
            onDidCreate: jest.fn(),
            onDidChange: jest.fn(),
            onDidDelete: jest.fn(),
            dispose: jest.fn(),
        })),
        fs: {
            createDirectory: jest.fn().mockResolvedValue(undefined),
            writeFile: jest.fn().mockResolvedValue(undefined),
            readFile: jest.fn().mockResolvedValue(Buffer.from('')),
            stat: jest.fn().mockResolvedValue({ type: 1, ctime: 0, mtime: 0, size: 0 }),
            readDirectory: jest.fn().mockResolvedValue([]),
            delete: jest.fn().mockResolvedValue(undefined),
            copy: jest.fn().mockResolvedValue(undefined),
            rename: jest.fn().mockResolvedValue(undefined),
        },
        openTextDocument: jest.fn().mockResolvedValue({ getText: jest.fn().mockReturnValue('') })
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
        parse: jest.fn((str) => {
            // Parse scheme, authority, and path from URI string
            const match = str.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/\/(.*)$/);
            if (match) {
                const scheme = match[1];
                const rest = match[2];
                const slashIdx = rest.indexOf('/');
                const authority = slashIdx >= 0 ? rest.substring(0, slashIdx) : rest;
                const path = slashIdx >= 0 ? rest.substring(slashIdx) : '';
                return { scheme, authority, path, fsPath: str, toString: () => str };
            }
            return { scheme: undefined, authority: undefined, path: str, fsPath: str, toString: () => str };
        }),
        file: jest.fn((str) => ({ scheme: 'file', authority: '', path: str, fsPath: str, toString: () => str }))
    },
    Range: class Range {
        constructor(public start: any, public end: any) {}
    },
    Position: class Position {
        constructor(public line: number, public character: number) {}
    },
    ViewColumn: { One: 1, Two: 2, Three: 3 },
    DataTransfer: class DataTransfer {
        private items = new Map();
        get(mime: string) { return this.items.get(mime); }
        set(mime: string, item: any) { this.items.set(mime, item); }
    },
    DataTransferItem: class DataTransferItem {
        constructor(public value: any) {}
    },
    TreeItem: class TreeItem {
        constructor(public label: string, public collapsibleState?: any) {}
    },
    TreeItemCollapsibleState: {
        None: 0,
        Collapsed: 1,
        Expanded: 2
    },
    QuickPickItemKind: {
        Separator: -1,
        Default: 0
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
        dispose = jest.fn();
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
    },
    MarkdownString: class MarkdownString {
        constructor(public value?: string, public supportThemeIcons?: boolean) {}
    },
    languages: {
        createDiagnosticCollection: jest.fn(() => ({
            set: jest.fn(),
            clear: jest.fn(),
            dispose: jest.fn(),
            delete: jest.fn(),
            get: jest.fn(),
            has: jest.fn(),
            forEach: jest.fn(),
        })),
    },
    Diagnostic: class Diagnostic {
        constructor(public range: any, public message: string, public severity?: number) {}
    },
    DiagnosticSeverity: {
        Error: 0,
        Warning: 1,
        Information: 2,
        Hint: 3,
    },
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
