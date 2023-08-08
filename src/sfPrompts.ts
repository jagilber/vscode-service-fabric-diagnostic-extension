import * as vscode from 'vscode';
import { debugLevel, SfUtility } from './sfUtility';
import { SfConfiguration, clusterEndpointInfo, clusterCertificate } from './sfConfiguration';
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

        if (!clusterEndpoint) { return; }

        this.sfConfig.setClusterEndpoint(clusterEndpoint);

        if (clusterCertificate) {
            this.sfConfig.setClusterCertificate(clusterCertificate);
        }
        SfExtSettings.updateSetting(sfExtSettingsList.clusters, this.sfConfig.getClusterEndpointInfo());
    }

    public async promptForClusterRestCall(sfMgr: SfMgr) {
        const adhocRestCall: string | undefined = await vscode.window.showInputBox({
            prompt: "Enter cluster REST call",
            placeHolder: "/$/GetClusterHealth"
        });

        SfUtility.activateOutputChannel();
        if (!adhocRestCall) { return; }

        if (!this.sfConfig.getClusterEndpoint()) {
            await this.promptForGetClusterEndpoint(sfMgr);
        }
        if (!this.sfConfig.getClusterEndpoint()) {
            await this.promptForAddClusterEndpoint();
        }

        if (!this.sfConfig.getClusterEndpoint()) { return; }
        
        this.sfRest.connectToCluster(sfMgr.getCurrentSfConfig().getClusterEndpoint()!, sfMgr.getCurrentSfConfig().getClusterCertificate()!);
        this.sfRest.invokeRestApi("GET", this.sfConfig.getClusterEndpoint()!, adhocRestCall)
            .then((data: any) => {
                SfUtility.outputLog('adhoc result:', JSON.parse(data));
            });
    }

    public async promptForGetClusterEndpoint(sfMgr: SfMgr) {
        const quickPickItems: Array<vscode.QuickPickItem> = [];
        sfMgr.getSfConfigs().forEach((cluster: SfConfiguration) => {
            quickPickItems.push({
                label: cluster.getClusterEndpoint() as string,
                description: cluster.getClusterCertificate()?.thumbprint,
                detail: cluster.getClusterCertificate()?.commonName,
                kind: vscode.QuickPickItemKind.Default
            });
        });

        const clusterEndpoint: vscode.QuickPickItem | undefined = await vscode.window.showQuickPick(quickPickItems, {
            title: "Enter cluster endpoint to enumerate",
            placeHolder: this.exampleClusterEndpoint,
            canPickMany: false
        });

        this.sfConfig.setClusterEndpoint(clusterEndpoint!.label);
        sfMgr?.getCluster(clusterEndpoint!.label);
    }


    public async promptForRemoveClusterEndpoint() {
        const clusterEndpoint: string | undefined = await vscode.window.showInputBox({
            prompt: "Enter cluster endpoint to remove",
            placeHolder: this.exampleClusterEndpoint
        });

        this.sfConfig.setClusterEndpoint(clusterEndpoint!);
        SfExtSettings.removeSetting(sfExtSettingsList.clusters, clusterEndpoint);
    }
}