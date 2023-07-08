// https://learn.microsoft.com/en-us/rest/api/servicefabric/
//https://code.visualstudio.com/api/get-started/your-first-extension
//https://learn.microsoft.com/en-us/rest/api/azure/
//https://github.com/microsoft/vscode-azure-account
//import { AzureAccountExtensionApi, AzureSession } from '@azure/azure-account';
//https://github.com/Microsoft/vscode-azuretools
//C:\Users\user\.vscode\extensions
import { ResourceManagementClient } from '@azure/arm-resources';
import { SubscriptionClient } from '@azure/arm-subscriptions';

import { apiUtils } from '@microsoft/vscode-azext-utils';

//import { commands, ExtensionContext, extensions, QuickPickItem, window } from 'vscode';

//import { AzureAccountExtensionApi, AzureSession } from '../azure-account.api'; // Other extensions need to copy this .d.ts to their repository.
//const apiUtils = require('@microsoft/vscode-azext-utils');
//const accountApi = require('../azure-account.api');
//const vscode = require('vscode');

import { request } from 'https';
import * as vscode from 'vscode';
//import { Uri } from "vscode";

export class SFRest {
    secret = "";
    clientApiVersion = "9.1";
    resourceApiVersion = "2018-02-01";
    timeOut = 100;
    maxResults = 100;
    subscriptionId = "";
    clusterHttpEndpoint = "";
    resourceManagerEndpoint = "https://management.azure.com/";
    clientEndpoint = "https://sftestcluster.eastus.cloudapp.azure.com:19080";


    constructor(
        context: vscode.ExtensionContext,
        secret: string | null = null,
        apiVersion: string | null = null,
        subscriptionId: string | null = null,
        clusterHttpEndpoint: string | null = null
    ) {
        if (secret) this.secret = secret;
        if (subscriptionId) this.subscriptionId = subscriptionId;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion

    }

    public async azureConnect(): Promise<any> {
        let azureAccount: any | null = null;
        try {
            //await apiUtils.getAzureExtensionApi(context, 'ms-vscode.azure-account','0.0.1').then((api) => {console.log(api);});
            azureAccount = await (<apiUtils.AzureExtensionApiProvider>vscode.extensions.getExtension('ms-vscode.azure-account')!.exports).getApi('1.0.0');
            //const subscriptions = context.subscriptions;
            // subscriptions.push(commands.registerCommand('azure-account-sample.showSubscriptions', showSubscriptions(azureAccount)));
            //subscriptions.push(commands.registerCommand('azure-account-sample.showAppServices', showAppServices(azureAccount)));
            //sfRest.getClusters();

        }
        catch (error) {
            this.showError(JSON.stringify(error));
            return null;
        }
        return azureAccount;
    }

    public clusterConnect(): boolean {
        // uses cluster server certificate to connect to cluster
        // todo: get and verify cluster server certificate
        if (!this.clusterHttpEndpoint) {
            this.showError("Cluster endpoint not set");
            return false;
        }
        if (!this.secret) {
            this.showWarning("Cluster secret not set");
            if (!this.azureConnect()) {
                this.showError("Azure account not connected");
                return false;
            }
        }
        return true;
    }

    public getClusters(): any {
        // uses azure account to enumerate clusters
        if (!this.secret || !this.subscriptionId) {
            this.showWarning("Cluster secret or subscription id not set");
            if (!this.azureConnect()) {
                this.showError("Azure account not connected");
                return null;
            }
        }

        const restQuery = `${this.resourceManagerEndpoint}/subscriptions/${this.subscriptionId}/providers/Microsoft.ServiceFabric/clusters?api-version=${this.resourceApiVersion}`;
        const result = request(restQuery, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": "Basic " + this.secret
            }
        });
        return result;


        // const result = request("https://localhost:19080/Services", {
        //    method: "GET",
        //    headers: {
        //       "Content-Type": "application/json",
        //       "Accept": "application/json",
        //       "Authorization": "Basic " + this.secret
        //    }
        // });
        // return result.toString();
    }

    public getCluster(): any {
        // uses cluster server certificate to connect to cluster
        if (!this.clusterConnect()) {
            return null;
        }

        const restQuery = `${this.clientEndpoint}/$/GetClusterHealth?api-version=${this.clientApiVersion}&NodesHealthStateFilter=Default`;
        this.showInformation(restQuery);
    }

    private showError(message: string): void {
        vscode.window.showErrorMessage(message);
    }

    private showInformation(message: string): void {
        vscode.window.showInformationMessage(message);
    }

    private showWarning(message: string): void {
        vscode.window.showWarningMessage(message);
    }

}