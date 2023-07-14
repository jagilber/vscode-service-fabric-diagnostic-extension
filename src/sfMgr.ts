
import * as vscode from 'vscode';
import * as SFConfiguration from './sfConfiguration.js';
import * as SFRest from './sfRest.js';
import { serviceFabricClusterViewDragAndDrop } from './serviceFabricClusterViewDragAndDrop.js';
import { serviceFabricClusterView } from './serviceFabricClusterView.js';
import { SFUtility } from './sfUtility.js';
import * as armServiceFabric from '@azure/arm-servicefabric';


import * as serviceFabric from '@azure/servicefabric';
import { ClientSecretCredential } from "@azure/identity";
//import * as SfApi from './sdk/servicefabric/servicefabric/src/serviceFabricClientAPIs.js';
import { ServiceFabricManagementClient } from './sdk/servicefabric/arm-servicefabric/src/serviceFabricManagementClient.js';
import { ServiceFabricClientAPIs } from './sdk/servicefabric/servicefabric/src/serviceFabricClientAPIs.js';

export class SFMgr {
    private clientSecret = "";
    private key = "";
    private certificate = "";
    private subscriptionId = "";
    private context: any;
    public sfClusterView: serviceFabricClusterView;
    public sfClusterViewDD: serviceFabricClusterViewDragAndDrop;
    private sfRest: SFRest.SFRest;
    private sfConfig: SFConfiguration.SFConfiguration;
    public sfClusters: any[] = [];
    private clientApiVersion = "6.3";
    private resourceApiVersion = "2018-02-01";
    private timeOut = 9000;
    private maxResults = 100;


    constructor(context: any) {
        this.context = context;
        this.sfClusterView = new serviceFabricClusterView(context);
        this.sfClusterViewDD = new serviceFabricClusterViewDragAndDrop(context);
        this.sfRest = new SFRest.SFRest(context);
        this.sfConfig = new SFConfiguration.SFConfiguration(context);

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

        //todo: https://github.com/Azure/azure-sdk-for-js/blob/main/documentation/MIGRATION-guide-for-next-generation-management-libraries.md
        // const credentials = new ClientSecretCredential(tenantId, clientId, this.clientSecret);

    }

    public async getCluster() {
        //test
        return await this.sfRest.connectToCluster();
        //end test

        this.sfRest.getClusterManifest()
            .then((data: any) => {
                this.sfConfig.setManifest(data);
                this.getNodes();
            });
    }

    public getClusters(): any {
        // uses azure account to enumerate clusters
        if (!this.sfConfig.clusterHttpEndpoint && !this.clientSecret || !this.subscriptionId) {
            SFUtility.showWarning("Cluster secret or subscription id not set");
            if (!this.sfRest.azureConnect()) {
                SFUtility.showError("Azure account not connected");
                return null;
            }
        }
        this.sfRest.getClusters()
            .then((data: any) => {
                for (const cluster of data) {
                    this.sfClusters.push(cluster);
                }
                //todo handle multiple clusters
                this.sfConfig.clusterHttpEndpoint = this.sfClusters[0].httpGatewayEndpoint;
                //this.sfClusterView.refresh();
            });
    }

    public getNodes(): void {
        this.sfRest.getNodes()
            .then((data: any) => {
                SFUtility.outputLog('sfMgr:getNodes:response:', data);
                //const jObject = JSON.parse(data);
                for (const node of data) {
                    SFUtility.outputLog('sfMgr:getNodes:node:', node);
                    this.sfConfig.addNode(node);
                }
            });
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