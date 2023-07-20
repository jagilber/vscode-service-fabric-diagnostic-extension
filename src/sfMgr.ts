
import * as vscode from 'vscode';
import * as SFConfiguration from './sfConfiguration';
import * as SFRest from './sfRest';
//import { serviceFabricClusterViewDragAndDrop } from './serviceFabricClusterViewDragAndDrop';
import { serviceFabricClusterView, TreeItem } from './serviceFabricClusterView';
import { SFUtility } from './sfUtility';
import * as armServiceFabric from '@azure/arm-servicefabric';


import * as serviceFabric from '@azure/servicefabric';
import { ClientSecretCredential } from "@azure/identity";
import { AzureLogger, setLogLevel } from "@azure/logger";


//import * as SfApi from './sdk/servicefabric/servicefabric/src/serviceFabricClientAPIs';
import * as sfModels from './sdk/servicefabric/servicefabric/src/models';
//import { ServiceFabricManagementClient } from './sdk/servicefabric/arm-servicefabric/src/serviceFabricManagementClient';
//import { ServiceFabricClientAPIs } from './sdk/servicefabric/servicefabric/src/serviceFabricClientAPIs';
//import { get } from 'http';
import { SFPs } from './sfPs';


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
    private sfConfigs: Array<SFConfiguration.SFConfiguration> = [];
    private sfConfig: SFConfiguration.SFConfiguration;
    public sfClusters: any[] = [];
    private clientApiVersion = "6.3";
    private resourceApiVersion = "2018-02-01";
    private timeOut = 9000;
    private maxResults = 100;
    private clusterEndpoints: string[] = [];


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

        //todo: https://github.com/Azure/azure-sdk-for-js/blob/main/documentation/MIGRATION-guide-for-next-generation-management-libraries.md
        // const credentials = new ClientSecretCredential(tenantId, clientId, this.clientSecret);
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

    public async deployDevCluster() {
        // check for binaries
        const result = await this.runPsCommand('whoami');
        SFUtility.outputLog('sfMgr:deployDevCluster:whoami:', result);
        // download binaries

        // install binaries
    }

    public async deployDevSecureCluster() {
        //todo implement
    }

    public async runPsCommand(command: string): Promise<string[]> {
        SFUtility.outputLog('runPsCommand: ' + command);
        const ps: SFPs = new SFPs();
        const results = await ps.send([command]);
        SFUtility.outputLog('runPsCommand output: ', results);
        return results;
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

    private addSfConfig(sfConfig: SFConfiguration.SFConfiguration) {
        if (!this.sfConfigs.find((config: SFConfiguration.SFConfiguration) => config.clusterHttpEndpoint === sfConfig.clusterHttpEndpoint)) {
            this.sfConfigs.push(sfConfig);
        }
    }

    public getSfConfig(clusterHttpEndpoint: string): SFConfiguration.SFConfiguration | undefined {
        return this.sfConfigs.find((config: SFConfiguration.SFConfiguration) => config.clusterHttpEndpoint === clusterHttpEndpoint);
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

    public async promptForClusterRestCall() {
        const adhocRestCall: string | undefined = await vscode.window.showInputBox({
            prompt: "Enter cluster REST call",
            placeHolder: "/$/GetClusterHealth"
        });

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

}