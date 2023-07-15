
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
import { ServiceFabricManagementClient } from './sdk/servicefabric/arm-servicefabric/src/serviceFabricManagementClient';
import { ServiceFabricClientAPIs } from './sdk/servicefabric/servicefabric/src/serviceFabricClientAPIs';

export class SFMgr {
    private clientSecret = "";
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


    constructor(context: any) {
        this.context = context;
        this.sfClusterView = new serviceFabricClusterView(context);
        //this.sfClusterViewDD = new serviceFabricClusterViewDragAndDrop(context);
        this.sfRest = new SFRest.SFRest(context);

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

        // set azure log level and output
        setLogLevel("verbose");

        // override logging to output to console.log (default location is stderr)
        AzureLogger.log = (...args) => {
            SFUtility.outputLog(args.join(" "));
        };




        this.sfConfig = new SFConfiguration.SFConfiguration(this.context);
        //todo: https://github.com/Azure/azure-sdk-for-js/blob/main/documentation/MIGRATION-guide-for-next-generation-management-libraries.md
        // const credentials = new ClientSecretCredential(tenantId, clientId, this.clientSecret);

    }

    public async getCluster() {
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
                this.sfClusterView.addTreeItem(new TreeItem(this.sfConfig.clusterName!, this.sfConfig.nodes, this.sfConfig));
            });
        });
    }

    private addSfConfig(sfConfig: SFConfiguration.SFConfiguration) {
        if (!this.sfConfigs.find((config: SFConfiguration.SFConfiguration) => config.clusterHttpEndpoint === sfConfig.clusterHttpEndpoint)) {
            this.sfConfigs.push(sfConfig);
        }
    }

    public removeSfConfig(sfConfig: SFConfiguration.SFConfiguration) {
        const index = this.sfConfigs.findIndex((config: SFConfiguration.SFConfiguration) => config.clusterHttpEndpoint === sfConfig.clusterHttpEndpoint);
        if (index > -1) {
            this.sfConfigs.splice(index, 1);
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
        if (!this.sfConfig.clusterHttpEndpoint) await this.getClusters();
        this.sfRest.invokeRestApi("GET", this.sfConfig.clusterHttpEndpoint!, adhocRestCall)
            .then((data: any) => {
                SFUtility.outputLog(data);
            });
    }

    public async promptForClusterEndpoint() {
        const clusterEndpoint: string | undefined = await vscode.window.showInputBox({
            prompt: "Enter cluster endpoint",
            placeHolder: "https://sftestcluster.eastus.cloudapp.azure.com:19080"
        });
        this.sfConfig.clusterHttpEndpoint = clusterEndpoint;
    }

}