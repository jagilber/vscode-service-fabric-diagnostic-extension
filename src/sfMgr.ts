
import * as vscode from 'vscode';
import * as SFConfiguration from './sfConfiguration.js';
import * as SFRest from './sfRest.js';
import { serviceFabricClusterViewDragAndDrop } from './serviceFabricClusterViewDragAndDrop.js';
import { serviceFabricClusterView } from './serviceFabricClusterView.js';
import { SFUtility} from './sfUtility.js';


export class SFMgr {
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
    }

    public async getCluster() {
        await this.sfRest.getCluster();
            // .then((data: any) => {
            //     SFUtility.outputLog(data);
            // });
    }

    public async getClusters() {
        await this.sfRest.getClusters()
            .then((data: any) => {
                for (const cluster of data) {
                    this.sfClusters.push(cluster);
                }
                this.sfConfig.clusterHttpEndpoint = this.sfClusters[0].httpGatewayEndpoint;
                //this.sfClusterView.refresh();
            });
    }

    public async promptForClusterRestCall() {
        const adhocRestCall: string | undefined = await vscode.window.showInputBox({
            prompt: "Enter cluster REST call",
            placeHolder: "/$/GetClusterHealth"
        });

        if (!adhocRestCall) return;
        this.sfRest.invokeRestApi("GET", this.sfConfig.clusterHttpEndpoint!, adhocRestCall, null)
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