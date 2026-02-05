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

    static init() { // (context: vscode.ExtensionContext) {
        //SFUtility.context = context;
        SfUtility.createDebugLogChannel();
        SfUtility.createTelemetryClient();
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

        // GOOD - uses the logger
        this.logger.logUsage('myEvent', { myData: 'myValue' });
        return this.logger;
    }

    private static createDebugLogChannel(): void {
        // @ts-ignore - telemetry is not yet exposed in the vscode api
        if(!this.channel){
            this.channel = vscode.window.createOutputChannel("SFRest", { log: true });
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
            if (level === debugLevel.debug) {
                this.channel.debug(message);
            }
            else if (level === debugLevel.trace) {
                this.channel.trace(message);
            }
            else if (level === debugLevel.error) {
                this.channel.error(message);
                this.channel.error(JSON.stringify(console.trace(), null, 2));
                this.showError(message);
            }
            else if (level === debugLevel.warn) {
                this.channel.warn(message);
                this.showWarning(message);
            }
            else if (level === debugLevel.info) {
                this.channel.info(message);
                //this.channel.info(message);
            }
        }
        catch (error) {
            this.channel.error(JSON.stringify(error, null, 2));
            this.showError(message);
        }
    }

    public static readExtensionConfig(key: string): unknown {
        return this.context.globalState.get(key);
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
        this.context.globalState.update(key, value);
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