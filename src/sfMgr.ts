
import * as vscode from 'vscode';
import * as SFConfiguration from './sfConfiguration.js';
import * as SFRest from './sfRest.js';
import { serviceFabricClusterViewDragAndDrop } from './serviceFabricClusterViewDragAndDrop.js';
import { serviceFabricClusterView } from './serviceFabricClusterView.js';
import { SFUtility} from './sfUtility.js';
import * as xmlConverter from 'xml-js';


export class SFMgr {
    private secret = "";
    private key = "";
    private certificate = "";
    private subscriptionId = "";
    private context: any;
    public sfClusterView: serviceFabricClusterView;
    public sfClusterViewDD: serviceFabricClusterViewDragAndDrop;
    private sfRest: SFRest.SFRest;
    private sfConfig: SFConfiguration.SFConfiguration;
    public sfClusters: any[] = [];

    constructor(context: any) {
        this.context = context;
        this.sfClusterView  = new serviceFabricClusterView(context);
        this.sfClusterViewDD  = new serviceFabricClusterViewDragAndDrop(context);
        this.sfRest = new SFRest.SFRest(context);
        this.sfConfig = new SFConfiguration.SFConfiguration(context);

        context.secrets.get("sfRestSecret").then((value: string | undefined) => {
            if (value) {
                this.secret = value;
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

    public getCluster() {
        this.sfRest.getClusterManifest()
            .then((data: any) => {
                this.sfConfig.setManifest(data);
                this.getNodes();
            });
    }

    public getClusters(): any {
        // uses azure account to enumerate clusters
        if (!this.sfConfig.clusterHttpEndpoint && !this.secret || !this.subscriptionId) {
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
                SFUtility.outputLog(data);
            });
    }

    public async promptForClusterRestCall() {
        const adhocRestCall: string | undefined = await vscode.window.showInputBox({
            prompt: "Enter cluster REST call",
            placeHolder: "/$/GetClusterHealth"
        });

        if (!adhocRestCall) return;
        if(!this.sfConfig.clusterHttpEndpoint) await this.getClusters();
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