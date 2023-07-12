/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as vscode from 'vscode';

export const enum debugLevel {
    error = 0,
    warn = 1,
    info = 2,
    debug = 3,
    trace = 4
}

export class SFUtility {
    private static channel: vscode.LogOutputChannel;
    private static context: vscode.ExtensionContext;
    private static logger: any;

    static init() { // (context: vscode.ExtensionContext) {
        //SFUtility.context = context;
        SFUtility.createDebugLogChannel();
        SFUtility.createTelemetryClient();
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

    private static createTelemetryClient(): any {
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
    }

    private static createDebugLogChannel(): void {
        // @ts-ignore - telemetry is not yet exposed in the vscode api
        this.channel = vscode.window.createOutputChannel("SFRest", { log: true });
        this.channel.show();
        return;
    }

    public static outputLog(message: string, messageObject: object | null = null, level: debugLevel = debugLevel.info): void {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        //console.log("SFRest:debuglog:" + message);
        if (messageObject) {
            message += JSON.stringify(messageObject, null, 2);
        }

        try {
            if (level === debugLevel.error) {
                this.channel.error(message);
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

}

SFUtility.init();