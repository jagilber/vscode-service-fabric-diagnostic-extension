// https://learn.microsoft.com/en-us/rest/api/servicefabric/
//https://code.visualstudio.com/api/get-started/your-first-extension
//https://learn.microsoft.com/en-us/rest/api/azure/
//https://github.com/microsoft/vscode-azure-account
//import { AzureAccountExtensionApi, AzureSession } from '@azure/azure-account';
//C:\Users\user\.vscode\extensions

import { request } from 'https';
import * as vscode from 'vscode';
//import { Uri } from "vscode";

export class SFRest {
    secret = "";
    apiVersion = "9.1";
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
        if (apiVersion) this.apiVersion = apiVersion;

        if (subscriptionId) this.subscriptionId = subscriptionId;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    
    }


    public getClusters(): any {
        const restQuery = `${this.resourceManagerEndpoint}/subscriptions/${this.subscriptionId}/providers/Microsoft.ServiceFabric/clusters?api-version=2018-02-01`;
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

}