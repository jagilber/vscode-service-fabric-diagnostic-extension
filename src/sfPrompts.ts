import * as vscode from 'vscode';
import { debugLevel, SfUtility } from './sfUtility';
import { SfConfiguration } from './sfConfiguration';
import { SfExtSettings, sfExtSettingsList } from './sfExtSettings';
import { SfRest } from './sfRest';
import { SfMgr } from './sfMgr';

export class SfPrompts {
    private exampleClusterEndpoint = "https://sftestcluster.eastus.cloudapp.azure.com:19080";
    private exampleClusterCertificate = "*.contoso.com or 1234567890ABCDEF1234567890ABCDEF12345678";
    private sfConfig: SfConfiguration;
    private sfRest: SfRest;

    public constructor(context: vscode.ExtensionContext) {
        this.sfConfig = new SfConfiguration(context);
        this.sfRest = new SfRest(context);
    }

    public async promptForAddClusterEndpoint() {
        const clusterEndpoint: string | undefined = await vscode.window.showInputBox({
            prompt: "Enter cluster endpoint to add",
            placeHolder: this.exampleClusterEndpoint
        });
        const clusterCertificate: string | undefined = await vscode.window.showInputBox({
            prompt: "Enter cluster thumbprint, or common name, if any",
            placeHolder: this.exampleClusterCertificate
        });

        this.sfConfig.clusterHttpEndpoint = clusterEndpoint;
        this.sfConfig.setClusterCertificate(clusterCertificate!);
        SfExtSettings.updateSetting(sfExtSettingsList.clusters, this.sfConfig.getClusterEndpointInfo());
    }

    public async promptForClusterRestCall(sfMgr?: SfMgr) {
        const adhocRestCall: string | undefined = await vscode.window.showInputBox({
            prompt: "Enter cluster REST call",
            placeHolder: "/$/GetClusterHealth"
        });

        SfUtility.activateOutputChannel();
        if (!adhocRestCall) { return; }
        if (!this.sfConfig.clusterHttpEndpoint) await sfMgr?.getCluster();
        if (!this.sfConfig.clusterHttpEndpoint) await this.promptForAddClusterEndpoint();
        if (!this.sfConfig.clusterHttpEndpoint) return;

        this.sfRest.invokeRestApi("GET", this.sfConfig.clusterHttpEndpoint!, adhocRestCall)
            .then((data: any) => {
                SfUtility.outputLog(data);
            });
    }

    public async promptForRemoveClusterEndpoint() {
        const clusterEndpoint: string | undefined = await vscode.window.showInputBox({
            prompt: "Enter cluster endpoint to remove",
            placeHolder: this.exampleClusterEndpoint
        });

        this.sfConfig.clusterHttpEndpoint = clusterEndpoint;
        SfExtSettings.removeSetting(sfExtSettingsList.clusters, clusterEndpoint);
    }
}