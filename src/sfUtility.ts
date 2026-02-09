/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as vscode from 'vscode';
import { ITelemetryLogger } from './types';
import * as fs from 'fs';

export const enum debugLevel {
    error = 0,
    warn = 1,
    info = 2,
    debug = 3,
    trace = 4
}

export class SfUtility {
    private static channel: vscode.LogOutputChannel;
    private static context: vscode.ExtensionContext;
    private static logger: ITelemetryLogger | undefined;

    static init(context?: vscode.ExtensionContext) {
        console.log('[SF Extension] SfUtility.init() starting...');
        if (context) {
            SfUtility.context = context;
        }
        SfUtility.createDebugLogChannel();
        console.log('[SF Extension] Output channel created, type:', typeof (this.channel as any).debug === 'function' ? 'LogOutputChannel' : 'OutputChannel');
        SfUtility.createTelemetryClient();
        console.log('[SF Extension] SfUtility.init() complete');
    }

    public static activateOutputChannel(): void {
        if (!this.channel) {
            this.createDebugLogChannel();
        }
        this.channel.show();
    }
    
    public static createFile(path:string, data?:string):void{
        this.outputLog(`sfUtility:createFile:checking path:${path}`);
        if(!fs.existsSync(path)){
            this.outputLog(`sfUtility:createFile:creating path:${path}`);
            fs.writeFileSync(path, data!);
        }
    }

    public static createFolder(path:string):string {
        this.outputLog(`sfUtility:createFolder:checking path:${path}`);
        if (!fs.existsSync(path)) {
            this.outputLog(`sfUtility:createFolder:creating path:${path}`);
            fs.mkdirSync(path, { recursive: true });
        }
        return path;
    }
    
    private static createTelemetryClient(): ITelemetryLogger | undefined {
        try {
            // @ts-ignore - telemetry is not yet exposed in the vscode api
            const sender = {
                flush(): void {
                    // no-op
                },
                sendErrorData(error: Error, data?: Record<string, any>): void {
                    // no-op
                },
                sendEventData(eventName: string, data?: Record<string, any>): void {
                    // no-op
                }
            };
            // @ts-ignore - telemetry is not yet exposed in the vscode api
            this.logger = vscode.env.createTelemetryLogger(sender);

            // GOOD - uses the logger (only if it was successfully created)
            if (this.logger) {
                this.logger.logUsage('myEvent', { myData: 'myValue' });
            }
            return this.logger;
        } catch (error) {
            // Telemetry API not available - this is OK, extension can work without it
            console.warn('[SF Extension] Telemetry API not available:', error);
            return undefined;
        }
    }

    private static createDebugLogChannel(): void {
        try {
            // @ts-ignore - telemetry is not yet exposed in the vscode api
            if(!this.channel){
                this.channel = vscode.window.createOutputChannel("SFRest", { log: true });
            }
        } catch (error) {
            // Fallback: create regular output channel if LogOutputChannel not available
            console.warn('[SF Extension] LogOutputChannel not available, using regular OutputChannel:', error);
            // @ts-ignore
            if (!this.channel) {
                // @ts-ignore
                this.channel = vscode.window.createOutputChannel("SFRest");
            }
        }
        //this.channel.show();
        return;
    }

    public static fileExists(path: string): boolean {
        return fs.existsSync(path);
    }

    public static outputLog(message: string, messageObject: string | object | string[] | unknown | null = null, level: debugLevel = debugLevel.info): void {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        //console.log("SFRest:debuglog:" + message);
        try{
            if (messageObject !== null && messageObject !== undefined) {
                message += JSON.stringify(messageObject, null, 2);
            }    
        }
        catch(error){
            //this.channel.error(JSON.stringify(error, null, 2));
        }

        try {
            // Check if this is a LogOutputChannel (with specialized logging methods) or regular OutputChannel
            const isLogChannel = typeof (this.channel as any).debug === 'function';
            
            if (isLogChannel) {
                // Use specialized LogOutputChannel methods
                if (level === debugLevel.debug) {
                    (this.channel as any).debug(message);
                }
                else if (level === debugLevel.trace) {
                    (this.channel as any).trace(message);
                }
                else if (level === debugLevel.error) {
                    (this.channel as any).error(message);
                    this.showError(message);
                }
                else if (level === debugLevel.warn) {
                    (this.channel as any).warn(message);
                    this.showWarning(message);
                }
                else if (level === debugLevel.info) {
                    (this.channel as any).info(message);
                }
            } else {
                // Fallback for regular OutputChannel - use appendLine
                const levelStr = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'][level] || 'INFO';
                const timestamp = new Date().toISOString();
                this.channel.appendLine(`[${timestamp}] [${levelStr}] ${message}`);
                
                if (level === debugLevel.error) {
                    this.showError(message);
                } else if (level === debugLevel.warn) {
                    this.showWarning(message);
                }
            }
        }
        catch (error) {
            console.error('[SF Extension] outputLog failed:', error);
            // Last resort - try to show error to user
            try {
                vscode.window.showErrorMessage(`SF Extension logging error: ${message}`);
            } catch (e) {
                // Complete failure - at least log to console
                console.error('[SF Extension]', message);
            }
        }
    }

    public static readExtensionConfig(key: string): unknown {
        try {
            return this.context.globalState.get(key);
        } catch (error) {
            // Handle corrupted globalState JSON
            const errorMsg = error instanceof Error ? error.message : String(error);
            if (errorMsg.includes('JSON') || errorMsg.includes('parse')) {
                this.outputLog(`Corrupted state detected for key '${key}'. State will be reset.`, error, debugLevel.warn);
                // Try to reset this specific key
                try {
                    this.context.globalState.update(key, undefined);
                } catch (resetError) {
                    this.outputLog(`Failed to reset corrupted state for '${key}'`, resetError, debugLevel.error);
                }
                return undefined;
            }
            // Re-throw other errors
            throw error;
        }
    }

    public static readFile(path:string):string{
        let data = '';
        vscode.workspace.fs.readFile(vscode.Uri.file(`${path}`)).then((value: Uint8Array) => {
            if (value) {
                data = Buffer.from(value).toString('utf8');
            }
        });
        return data;
    }

    public  static removeFile(path:string):void{
        this.outputLog(`sfUtility:removeFile:checking path:${path}`);
        if(fs.existsSync(path)){
            this.outputLog(`sfUtility:removeFile:removing path:${path}`);
            fs.rmSync(path);
        }
    }

    public static removeFolder(path:string):void{
        if (fs.existsSync(path)) {
            fs.rmdirSync(path, { recursive: true });
        }
    }

    public static saveExtensionConfig(key: string, value: unknown): void {
        try {
            this.context.globalState.update(key, value);
        } catch (error) {
            this.outputLog(`Failed to save extension config for key '${key}'`, error, debugLevel.error);
            // Don't throw - allow extension to continue even if state can't be saved
        }
    }

    public static showError(message: string): void {
        //this.debuglog(message);
        vscode.window.showErrorMessage(JSON.stringify(message, null, 4));
    }

    public static showInformation(message: string): void {
        //this.debuglog(message);
        vscode.window.showInformationMessage(JSON.stringify(message, null, 4));
    }

    public static showWarning(message: string): void {
        //this.debuglog(message);
        vscode.window.showWarningMessage(JSON.stringify(message, null, 4));
    }
}

SfUtility.init();