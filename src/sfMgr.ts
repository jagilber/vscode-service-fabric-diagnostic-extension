
import * as vscode from 'vscode';
import * as SFConfiguration from './sfConfiguration';
import * as SFRest from './sfRest';
import * as SFRestClient from './sfRestClient';
import * as xmlConverter from 'xml-js';
//import { serviceFabricClusterViewDragAndDrop } from './serviceFabricClusterViewDragAndDrop';
import { serviceFabricClusterView, TreeItem } from './serviceFabricClusterView';
import { debugLevel, SFUtility } from './sfUtility';
import { SFConstants } from './sfConstants';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';

import * as armServiceFabric from '@azure/arm-servicefabric';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

import * as serviceFabric from '@azure/servicefabric';
import { ClientSecretCredential } from "@azure/identity";
import { AzureLogger, setLogLevel } from "@azure/logger";


//import * as SfApi from './sdk/servicefabric/servicefabric/src/serviceFabricClientAPIs';
import * as sfModels from './sdk/servicefabric/servicefabric/src/models';
//import { ServiceFabricManagementClient } from './sdk/servicefabric/arm-servicefabric/src/serviceFabricManagementClient';
//import { ServiceFabricClientAPIs } from './sdk/servicefabric/servicefabric/src/serviceFabricClientAPIs';
//import { get } from 'http';
import { SFPs } from './sfPs';
import { resolve } from 'path';


export class SFMgr {
    private configurationSection = "sfClusterExplorer"; //servicefabric
    private configurationSettings: vscode.WorkspaceConfiguration;
    private clientSecret = "";
    private exampleClusterEndpoint = "https://sftestcluster.eastus.cloudapp.azure.com:19080";
    private key = "";
    private certificate = "";
    private subscriptionId = "";
    private context: any;
    public sfClusterView: serviceFabricClusterView;
    //public sfClusterViewDD: serviceFabricClusterViewDragAndDrop;
    private sfRest: SFRest.SFRest;
    private sfRestClient: SFRestClient.SfRestClient;
    private sfConfigs: Array<SFConfiguration.SFConfiguration> = [];
    private sfConfig: SFConfiguration.SFConfiguration;
    public sfClusters: any[] = [];
    private clientApiVersion = "6.3";
    private resourceApiVersion = "2018-02-01";
    private timeOut = 9000;
    private maxResults = 100;
    private clusterEndpoints: string[] = [];
    private ps: SFPs = new SFPs();
    private globalStorage = "";

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.sfClusterView = new serviceFabricClusterView(context);

        // set azure log level and output
        setLogLevel("verbose");

        // get settings
        this.configurationSettings = this.getSettings();

        // get secrets
        this.getSecrets(context);

        // override logging to output to console.log (default location is stderr)
        AzureLogger.log = (...args) => {
            SFUtility.outputLog(args.join(" "));
        };

        this.sfConfig = new SFConfiguration.SFConfiguration(this.context);
        this.sfRest = new SFRest.SFRest(context);
        this.sfRestClient = new SFRestClient.SfRestClient(this.sfRest);
        this.globalStorage = context.globalStoragePath;

        //todo: https://github.com/Azure/azure-sdk-for-js/blob/main/documentation/MIGRATION-guide-for-next-generation-management-libraries.md
        // const credentials = new ClientSecretCredential(tenantId, clientId, this.clientSecret);
    }

    private addSfConfig(sfConfig: SFConfiguration.SFConfiguration) {
        if (!this.sfConfigs.find((config: SFConfiguration.SFConfiguration) => config.clusterHttpEndpoint === sfConfig.clusterHttpEndpoint)) {
            this.sfConfigs.push(sfConfig);
        }
    }

    public async deployDevCluster() {
        // check for binaries
        const result = await this.runPsCommand('whoami');
        SFUtility.outputLog(`sfMgr:deployDevCluster:whoami:${result}`);
        await this.runPsCommand('$psversiontable');
        if (SFUtility.fileExists(SFConstants.SF_SDK_DIR)) {
            SFUtility.outputLog(`sfMgr:deployDevCluster:SF_SDK_DIR exists:${SFConstants.SF_SDK_DIR}`);
        }
        else {
            SFUtility.outputLog(`sfMgr:deployDevCluster:SF_SDK_DIR does not exist:${SFConstants.SF_SDK_DIR}`);

            await this.downloadSFSDK();
            // dev cluster
            if (!SFUtility.fileExists(SFConstants.SF_DEV_CLUSTER_SETUP)) {
                await this.runPsCommand(`start-process -verb runas -wait -filePath '${SFConstants.SF_DEV_CLUSTER_SETUP}'`);
            }
            else {
                SFUtility.outputLog(`sfMgr:deployDevCluster:file does not exist:${SFConstants.SF_DEV_CLUSTER_SETUP}`, null, debugLevel.error);
            }
        }
    }

    public async deployDevSecureCluster() {
        //todo implement
    }

    public async downloadAndExecute(downloadUrl: string, outputFile: string | null = null, command: string | null = null, args: string[] | null = []): Promise<string | undefined> {
        SFUtility.outputLog(`sfMgr:downloadAndExecute:downloadUrl:${downloadUrl}`);
        if (!fs.existsSync(this.globalStorage)) {
            fs.mkdirSync(this.globalStorage, { recursive: true });
        }

        if (!outputFile) {
            outputFile = `${this.globalStorage}\\${downloadUrl.split('/').pop()!}`;
        }

        if (!command) {
            command = outputFile;
        }

        const psCommand = `start-process -wait -filePath '${command}' -argumentList '${args?.join(' ')}'`;

        if (!SFUtility.fileExists(outputFile)) {
            if (await this.httpDownload(downloadUrl, outputFile)) {
                SFUtility.outputLog(`sfMgr:downloadAndExecute:outputFile:${outputFile}`);

                // install binaries
                if (SFUtility.fileExists(outputFile)) {
                    SFUtility.outputLog(`sfMgr:deployDevCluster:file exists:${outputFile}`);
                    return await this.runPsCommand(psCommand);
                }
                else {
                    SFUtility.outputLog(`sfMgr:downloadAndExecute:file does not exist:${outputFile}`, null, debugLevel.error);
                }
            }
            else {
                SFUtility.outputLog(`sfMgr:downloadAndExecute:error:outputFile:${outputFile}`, null, debugLevel.error);
            }
        }
        else {
            SFUtility.outputLog(`sfMgr:downloadAndExecute:outputFile already exists:${outputFile}`);
            return await this.runPsCommand(psCommand);
        }
    }

    public async downloadSFSDK(): Promise<void> {
        // download binaries
        //const result = await this.sfRestClient.invokeRequest(SFConstants.SF_SDK_DOWNLOAD_URL) as string;
        const result = await this.httpGet(SFConstants.SF_SDK_DOWNLOAD_URL);

        if (!result) {
            SFUtility.showError('sfMgr:deployDevCluster:SF_SDK_DOWNLOAD_URL:failed');
            return;
        }


        // parse result for real download urls
        // runtime
        let downloadUrl: string = result.toString().match(SFConstants.SF_RUNTIME_URI_REGEX)![0];
        let outputFile = `${this.globalStorage}\\${downloadUrl.split('/').pop()!}`;
        await this.downloadAndExecute(downloadUrl, outputFile, outputFile, ['/accepteula', '/quiet', '/force']);

        // sdk
        downloadUrl = result.toString().match(SFConstants.SF_SDK_URI_REGEX)![0];
        outputFile = `${this.globalStorage}\\${downloadUrl.split('/').pop()!}`;
        const args = ['/package', outputFile, '/norestart', '/quiet', '/log', `${this.globalStorage}\\sf-sdk.log`];
        await this.downloadAndExecute(downloadUrl, outputFile, 'msiexec.exe', args);
    }

    public async getCluster() {

        //test
        //const test = await vscode.commands.executeCommand('workbench.action.terminal.sendSequence', { text: "write-output $psversiontable\u000D" });
        //SFUtility.outputLog('test: ' + test);
        //end test

        await this.sfRest.connectToCluster();

        await this.sfRest.getClusterManifest().then((data: any) => {
            SFUtility.outputLog('sfMgr:getCluster:response:', data);
            this.sfConfig = new SFConfiguration.SFConfiguration(this.context);
            this.sfConfig.setManifest(data);
            this.getNodes().then((nodes: sfModels.NodeInfo[]) => {
                nodes.forEach((node: sfModels.NodeInfo) => {
                    this.sfConfig.addNode(node);
                });
                this.addSfConfig(this.sfConfig);
                SFUtility.outputLog('sfMgr:getCluster:config:', this.sfConfig);
                //this.sfClusterView.addTreeItem(new TreeItem(this.sfConfig.clusterName!));//, this.sfConfig.nodes, this.sfConfig));
                this.sfClusterView.addTreeItem(this.sfConfig.createClusterViewTreeItem());
            });
        });
    }

    public async getClusters(): Promise<any> {
        // uses azure account to enumerate clusters
        if (!this.sfConfig.clusterHttpEndpoint && !this.clientSecret || !this.subscriptionId) {
            SFUtility.showWarning("Cluster secret or subscription id not set");
            if (!this.sfRest.azureConnect()) {
                SFUtility.showError("Azure account not connected");
                return null;
            }
        }
        await this.sfRest.getClusters()
            .then((data: any) => {
                for (const cluster of data) {
                    this.sfClusters.push(cluster);
                    //todo test
                    this.addSfConfig(new SFConfiguration.SFConfiguration(this.context));
                }
            });
    }

    public async getNodes(): Promise<sfModels.NodeInfo[]> {
        const nodeList = await this.sfRest.getNodes();
        return nodeList;
        // await this.sfRest.getNodes().then((data: any) => {
        //         SFUtility.outputLog('sfMgr:getNodes:response:', data);
        //         //const jObject = JSON.parse(data);
        //         for (const node of data) {
        //             SFUtility.outputLog('sfMgr:getNodes:node:', node);
        //             this.sfConfig.addNode(node);
        //         }
        //     });
    }

    public getSecrets(context: vscode.ExtensionContext) {

        context.secrets.get("sfRestSecret").then((value: string | undefined) => {
            if (value) {
                this.clientSecret = value;
            }
        });
        context.secrets.get("sfRestKey").then((value: any) => {
            if (value) {
                this.key = value;
            }
        });
        context.secrets.get("sfRestCertificate").then((value: any) => {
            if (value) {
                this.certificate = value;
            }
        });
    }


    public getSetting(setting: string) {
        const settings = vscode.workspace.getConfiguration(this.configurationSection);
        const value = settings.get(setting);
        SFUtility.outputLog('sfMgr:getSetting returning:setting:' + setting + ' value:' + value, settings);
        return value;
    }

    public getSettings(): vscode.WorkspaceConfiguration {
        const settings = vscode.workspace.getConfiguration(this.configurationSection);
        SFUtility.outputLog('sfMgr:getSettings:settings:', settings);
        return settings;
    }

    public getSfConfig(clusterHttpEndpoint: string): SFConfiguration.SFConfiguration | undefined {
        return this.sfConfigs.find((config: SFConfiguration.SFConfiguration) => config.clusterHttpEndpoint === clusterHttpEndpoint);
    }

    private async httpDownload(url: string, outputFile: string): Promise<boolean> {
        const file = fs.createWriteStream(outputFile);

        const result = await new Promise<boolean>((resolve, reject) => {
            //https.get(url, (response: http.IncomingMessage) => {
            https.get(url, (response: any) => {
                //  SFUtility.outputLog(`sfMgr:httpDownload:statusCode:${response.statusCode}`);
                // SFUtility.outputLog(`sfMgr:httpDownload:headers:${response.headers}`);
                response.pipe(file);
                response.on('error', (err: any) => {
                    SFUtility.outputLog(`sfMgr:httpDownload:error:${err}`);
                    reject(err);
                });

                // response.on('data', (chunk: any) => {
                //     SFUtility.outputLog(`sfMgr:httpGet:chunk:${chunk}`);
                // });
                response.on('end', () => {
                    SFUtility.outputLog(`sfMgr:httpGet:end`);
                });

                file.on('finish', () => {
                    file.close();
                    SFUtility.outputLog(`sfMgr:httpGet:file:close`);
                    resolve(true);
                });
            }).on('error', (err: any) => {
                SFUtility.outputLog(`sfMgr:httpDownload:error:${err}`);
                fs.unlink(outputFile, () => {
                    SFUtility.outputLog(`sfMgr:httpDownload:file:unlink`);
                    reject(err);
                }
                );
            });

        });

        SFUtility.outputLog(`sfMgr:httpGet:result:${result}`);
        return result;
    }

    private async httpGet(url: string): Promise<string> {
        const result = await new Promise<string>((resolve, reject) => {
            https.get(url, (response: http.IncomingMessage) => {
                const output: string[] = [];
                SFUtility.outputLog(`sfMgr:httpGet:statusCode:${response.statusCode}`);
                SFUtility.outputLog(`sfMgr:httpGet:headers:${response.headers}`);
                response.on('error', (err: any) => {
                    SFUtility.outputLog(`sfMgr:httpGet:error:${err}`);
                    reject(err);
                });
                response.on('data', (chunk: any) => {
                    output.push(chunk);
                    SFUtility.outputLog(`sfMgr:httpGet:chunk:${chunk}`);
                });
                response.on('close', () => {
                    SFUtility.outputLog(`sfMgr:httpGet:end`);
                    resolve(output.join(''));
                });
            });
        });
        SFUtility.outputLog(`sfMgr:httpGet:result:${result}`);
        return result;
    }

    public async promptForClusterRestCall() {
        const adhocRestCall: string | undefined = await vscode.window.showInputBox({
            prompt: "Enter cluster REST call",
            placeHolder: "/$/GetClusterHealth"
        });

        SFUtility.activateOutputChannel();
        if (!adhocRestCall) { return; }
        if (!this.sfConfig.clusterHttpEndpoint) await this.getCluster();
        if (!this.sfConfig.clusterHttpEndpoint) await this.promptForClusterEndpoint();
        if (!this.sfConfig.clusterHttpEndpoint) return;


        this.sfRest.invokeRestApi("GET", this.sfConfig.clusterHttpEndpoint!, adhocRestCall)
            .then((data: any) => {
                SFUtility.outputLog(data);
            });
    }

    public async promptForClusterEndpoint() {
        const clusterEndpoint: string | undefined = await vscode.window.showInputBox({
            prompt: "Enter cluster endpoint to add",
            placeHolder: this.exampleClusterEndpoint
        });
        this.sfConfig.clusterHttpEndpoint = clusterEndpoint;
        this.updateSetting('clusters', clusterEndpoint);
    }

    public async promptForRemoveClusterEndpoint() {
        const clusterEndpoint: string | undefined = await vscode.window.showInputBox({
            prompt: "Enter cluster endpoint to remove",
            placeHolder: this.exampleClusterEndpoint
        });
        this.sfConfig.clusterHttpEndpoint = clusterEndpoint;
        this.removeSetting('clusters', clusterEndpoint);
    }

    public removeSfConfig(clusterHttpEndpoint: string) {
        const index = this.sfConfigs.findIndex((config: SFConfiguration.SFConfiguration) => config.clusterHttpEndpoint === clusterHttpEndpoint);
        if (index > -1) {
            this.sfConfigs.splice(index, 1);
            SFUtility.outputLog('sfMgr:removeSfConfig:clusterHttpEndpoint removed:' + clusterHttpEndpoint);
        }
        else {
            SFUtility.outputLog('sfMgr:removeSfConfig:clusterHttpEndpoint not found:' + clusterHttpEndpoint);
        }
    }

    public removeSetting(setting: string, value?: any) {
        const settings = vscode.workspace.getConfiguration(this.configurationSection);
        SFUtility.outputLog('sfMgr:removeSetting:setting:' + setting + ' value:' + value);
        const currentSetting = this.getSetting(setting);
        if (Array.isArray(currentSetting)) {
            if (currentSetting.includes(value)) {
                SFUtility.outputLog('sfMgr:removeSetting:setting is array:' + setting);
                currentSetting.splice(currentSetting.indexOf(value), 1);
            }
            else {
                SFUtility.outputLog('sfMgr:removeSetting:setting not array:' + setting);
                const settingValue = (this.getSetting(setting) as string[])?.filter((item: any) => item === value);
            }
            value = currentSetting;
        }

        SFUtility.outputLog('sfMgr:removeSetting:setting:' + setting, settings);
        return settings.update(setting, value, vscode.ConfigurationTarget.Global);
    }

    public async runPsCommand(command: string): Promise<string> {
        SFUtility.outputLog('runPsCommand: ' + command);
        const results = await this.ps.send(command);
        const response = JSON.parse(results);

        SFUtility.outputLog(`runPsCommand output:`, response);
        return response;
    }

    public updateSetting(setting: string, value: any) {
        const settings = vscode.workspace.getConfiguration(this.configurationSection);
        SFUtility.outputLog('sfMgr:updateSetting:setting:' + setting + ' value:' + value);
        const currentSetting = this.getSetting(setting);
        if (Array.isArray(currentSetting)) {
            if (value) {
                // child setting/array
                if (!currentSetting.includes(value)) {
                    SFUtility.outputLog('sfMgr:updateSetting:adding array:' + setting + ' value:' + value);
                    currentSetting.push(value);
                }
                else {
                    SFUtility.outputLog('sfMgr:updateSetting:array already exists:' + setting + ' value:' + value);
                    return;
                }
            }
            value = currentSetting;
        }

        SFUtility.outputLog('sfMgr:updateSetting:setting:' + setting + ' value:' + value, settings);
        return settings.update(setting, value, vscode.ConfigurationTarget.Global);


    }
}

