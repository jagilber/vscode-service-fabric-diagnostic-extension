
import * as vscode from 'vscode';
import { SfConfiguration, clusterEndpointInfo, clusterCertificate } from './sfConfiguration';
import { SfConstants } from './sfConstants';
import { SfPs } from './sfPs';
import { SfRest } from './sfRest';
import { sfExtSecretList, SfExtSecrets } from './sfExtSecrets';
import { SfExtSettings, sfExtSettingsList } from './sfExtSettings';
import { SfRestClient } from './sfRestClient';
import { debugLevel, SfUtility } from './sfUtility';

import * as xmlConverter from 'xml-js';
//import { serviceFabricClusterViewDragAndDrop } from './serviceFabricClusterViewDragAndDrop';
import { serviceFabricClusterView, TreeItem } from './serviceFabricClusterView';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';

import * as armServiceFabric from '@azure/arm-servicefabric';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import * as sfModels from './sdk/servicefabric/servicefabric/src/models';
import * as serviceFabric from '@azure/servicefabric';
import { ClientSecretCredential } from "@azure/identity";
import { AzureLogger, setLogLevel } from "@azure/logger";



export class SfMgr {
    private sfExtSecrets: SfExtSecrets;

    // private key = "";
    // private certificate = "";
    private subscriptionId = "";
    private context: any;
    public sfClusterView: serviceFabricClusterView;
    //public sfClusterViewDD: serviceFabricClusterViewDragAndDrop;
    private sfRest: SfRest;
    // private sfRestClient: SfRestClient;
    private sfConfigs: Array<SfConfiguration> = [];
    private sfConfig: SfConfiguration;

    public sfClusters: any[] = [];
    // private clientApiVersion = "6.3";
    // private resourceApiVersion = "2018-02-01";
    // private timeOut = 9000;
    // private maxResults = 100;
    // private clusterEndpoints: string[] = [];
    private ps: SfPs = new SfPs();
    private globalStorage = "";
    private clusterFileStorage = "";

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.sfClusterView = new serviceFabricClusterView(context);

        // set azure log level and output
        setLogLevel("verbose");

        // get secrets
        this.sfExtSecrets = new SfExtSecrets(context);

        // override logging to output to console.log (default location is stderr)
        AzureLogger.log = (...args) => {
            SfUtility.outputLog(args.join(" "));
        };

        this.sfConfig = new SfConfiguration(this.context);
        this.sfRest = new SfRest(context);
        // this.sfRestClient = new SfRestClient(this.sfRest);

        this.globalStorage = context.globalStorageUri.fsPath;
        this.clusterFileStorage = `${this.globalStorage}\\clusters`;

        SfUtility.createFolder(this.globalStorage);
        SfUtility.createFolder(this.clusterFileStorage);

        //todo: https://github.com/Azure/azure-sdk-for-js/blob/main/documentation/MIGRATION-guide-for-next-generation-management-libraries.md
        // const credentials = new ClientSecretCredential(tenantId, clientId, this.clientSecret);
        this.loadSfConfigs();
    }

    private addSfConfig(sfConfig: SfConfiguration) {
        if (!this.sfConfigs.find((config: SfConfiguration) => config.clusterHttpEndpoint === sfConfig.clusterHttpEndpoint)) {
            this.sfConfigs.push(sfConfig);
        }
    }

    public async deployDevCluster() {
        // check for binaries
        const result = await this.runPsCommand('whoami');
        SfUtility.outputLog(`sfMgr:deployDevCluster:whoami:${result}`);
        await this.runPsCommand('$psversiontable');
        if (SfUtility.fileExists(SfConstants.SF_SDK_DIR)) {
            SfUtility.outputLog(`sfMgr:deployDevCluster:SF_SDK_DIR exists:${SfConstants.SF_SDK_DIR}`);
        }
        else {
            SfUtility.outputLog(`sfMgr:deployDevCluster:SF_SDK_DIR does not exist:${SfConstants.SF_SDK_DIR}`);

            await this.downloadSFSDK();
            // dev cluster
            if (!SfUtility.fileExists(SfConstants.SF_DEV_CLUSTER_SETUP)) {
                await this.runPsCommand(`start-process -verb runas -wait -filePath '${SfConstants.SF_DEV_CLUSTER_SETUP}'`);
            }
            else {
                SfUtility.outputLog(`sfMgr:deployDevCluster:file does not exist:${SfConstants.SF_DEV_CLUSTER_SETUP}`, null, debugLevel.error);
            }
        }
    }

    public async deployDevSecureCluster() {
        //todo implement
    }

    public async downloadAndExecute(downloadUrl: string, outputFile: string, command: string, args: string[] = []): Promise<string | undefined> {
        SfUtility.outputLog(`sfMgr:downloadAndExecute:downloadUrl:${downloadUrl}`);

        if (!outputFile) {
            outputFile = `${this.globalStorage}\\${downloadUrl.split('/').pop()!}`;
        }

        if (!command) {
            command = outputFile;
        }

        const psCommand = `start-process -wait -filePath '${command}' -argumentList '${args?.join(' ')}'`;

        if (!SfUtility.fileExists(outputFile)) {
            if (await this.httpDownload(downloadUrl, outputFile)) {
                SfUtility.outputLog(`sfMgr:downloadAndExecute:outputFile:${outputFile}`);

                // install binaries
                if (SfUtility.fileExists(outputFile)) {
                    SfUtility.outputLog(`sfMgr:deployDevCluster:file exists:${outputFile}`);
                    return await this.runPsCommand(psCommand);
                }
                else {
                    SfUtility.outputLog(`sfMgr:downloadAndExecute:file does not exist:${outputFile}`, null, debugLevel.error);
                }
            }
            else {
                SfUtility.outputLog(`sfMgr:downloadAndExecute:error:outputFile:${outputFile}`, null, debugLevel.error);
            }
        }
        else {
            SfUtility.outputLog(`sfMgr:downloadAndExecute:outputFile already exists:${outputFile}`);
            return await this.runPsCommand(psCommand);
        }
    }

    public async downloadSFSDK(): Promise<void> {
        // download binaries
        //const result = await this.sfRestClient.invokeRequest(SFConstants.SF_SDK_DOWNLOAD_URL) as string;
        const result = await this.httpGet(SfConstants.SF_SDK_DOWNLOAD_URL);

        if (!result) {
            SfUtility.showError('sfMgr:deployDevCluster:SF_SDK_DOWNLOAD_URL:failed');
            return;
        }


        // parse result for real download urls
        // runtime
        let downloadUrl: string = result.toString().match(SfConstants.SF_RUNTIME_URI_REGEX)![0];
        let outputFile = `${this.globalStorage}\\${downloadUrl.split('/').pop()!}`;
        await this.downloadAndExecute(downloadUrl, outputFile, outputFile, ['/accepteula', '/quiet', '/force']);

        // sdk
        downloadUrl = result.toString().match(SfConstants.SF_SDK_URI_REGEX)![0];
        outputFile = `${this.globalStorage}\\${downloadUrl.split('/').pop()!}`;
        const args = ['/package', outputFile, '/norestart', '/quiet', '/log', `${this.globalStorage}\\sf-sdk.log`];
        await this.downloadAndExecute(downloadUrl, outputFile, 'msiexec.exe', args);
    }

    public async getCluster(clusterEndpoint: string): Promise<any> {
        if (!this.getSfConfig(clusterEndpoint)) {
            this.sfConfig = new SfConfiguration(this.context);
            this.sfConfig.clusterHttpEndpoint = clusterEndpoint;
            this.addSfConfig(this.sfConfig);
        }
        else {
            this.sfConfig = this.getSfConfig(clusterEndpoint)!;
        }

        const clusterCertificate: clusterCertificate | undefined = this.sfConfig.getClusterCertificate();
        if (clusterCertificate && !clusterCertificate.certificate && (clusterCertificate.thumbprint || clusterCertificate.commonName)) {
            clusterCertificate.certificate = [await this.ps.getPemFromLocalCertStore(clusterCertificate.thumbprint ?? clusterCertificate.commonName!)];
        }

        SfUtility.outputLog(`sfMgr:getCluster:certificate length:${clusterCertificate?.certificate?.length}`);
        //end test

        await this.sfRest.connectToCluster(clusterEndpoint, clusterCertificate!.certificate!);

        await this.sfRest.getClusterManifest().then((data: any) => {
            SfUtility.outputLog('sfMgr:getCluster:response:', data);
            this.sfConfig.setManifest(data);
            SfUtility.outputLog('sfMgr:getCluster:config:', this.sfConfig);
        });
    }

    public async getClusters(): Promise<any> {
        //todo test
        // uses azure account to enumerate clusters
        if (!this.sfConfig.clusterHttpEndpoint && !this.sfExtSecrets.getSecret(sfExtSecretList.sfRestCertificate) || !this.subscriptionId) {
            SfUtility.showWarning("Cluster secret or subscription id not set");
            if (!this.sfRest.azureConnect()) {
                SfUtility.showError("Azure account not connected");
                return null;
            }
        }
        await this.sfRest.getClusters()
            .then((data: any) => {
                for (const cluster of data) {
                    this.sfClusters.push(cluster);
                    //todo test
                    this.addSfConfig(new SfConfiguration(this.context));
                }
            });
    }

    public getSfConfig(clusterHttpEndpoint: string): SfConfiguration | undefined {
        return this.sfConfigs.find((config: SfConfiguration) => config.clusterHttpEndpoint === clusterHttpEndpoint);
    }

    public getSfConfigs(): Array<SfConfiguration> {
        return this.sfConfigs;
    }

    public async loadSfConfigs(): Promise<void> {
        //todo test
        const clusters: clusterEndpointInfo[] | any = SfExtSettings.getSetting(sfExtSettingsList.clusters);
        for (const cluster of clusters) {
            this.addSfConfig(new SfConfiguration(this.context, undefined, cluster));
        }
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
                    SfUtility.outputLog(`sfMgr:httpDownload:error:${err}`);
                    reject(err);
                });

                // response.on('data', (chunk: any) => {
                //     SFUtility.outputLog(`sfMgr:httpGet:chunk:${chunk}`);
                // });
                response.on('end', () => {
                    SfUtility.outputLog(`sfMgr:httpGet:end`);
                });

                file.on('finish', () => {
                    file.close();
                    SfUtility.outputLog(`sfMgr:httpGet:file:close`);
                    resolve(true);
                });
            }).on('error', (err: any) => {
                SfUtility.outputLog(`sfMgr:httpDownload:error:${err}`);
                fs.unlink(outputFile, () => {
                    SfUtility.outputLog(`sfMgr:httpDownload:file:unlink`);
                    reject(err);
                }
                );
            });

        });

        SfUtility.outputLog(`sfMgr:httpGet:result:${result}`);
        return result;
    }

    private async httpGet(url: string): Promise<string> {
        const result = await new Promise<string>((resolve, reject) => {
            https.get(url, (response: http.IncomingMessage) => {
                const output: string[] = [];
                SfUtility.outputLog(`sfMgr:httpGet:statusCode:${response.statusCode}`);
                SfUtility.outputLog(`sfMgr:httpGet:headers:${response.headers}`);
                response.on('error', (err: any) => {
                    SfUtility.outputLog(`sfMgr:httpGet:error:${err}`);
                    reject(err);
                });
                response.on('data', (chunk: any) => {
                    output.push(chunk);
                    SfUtility.outputLog(`sfMgr:httpGet:chunk:${chunk}`);
                });
                response.on('close', () => {
                    SfUtility.outputLog(`sfMgr:httpGet:end`);
                    resolve(output.join(''));
                });
            });
        });
        SfUtility.outputLog(`sfMgr:httpGet:result:${result}`);
        return result;
    }

    public removeSfConfig(clusterHttpEndpoint: string) {
        const index = this.sfConfigs.findIndex((config: SfConfiguration) => config.clusterHttpEndpoint === clusterHttpEndpoint);
        if (index > -1) {
            this.sfConfigs.splice(index, 1);
            SfUtility.outputLog('sfMgr:removeSfConfig:clusterHttpEndpoint removed:' + clusterHttpEndpoint);
        }
        else {
            SfUtility.outputLog('sfMgr:removeSfConfig:clusterHttpEndpoint not found:' + clusterHttpEndpoint);
        }
    }

    public async runPsCommand(command: string): Promise<string> {
        SfUtility.outputLog('runPsCommand: ' + command);
        const results = await this.ps.send(command);
        const response = JSON.parse(results);

        SfUtility.outputLog(`runPsCommand output:`, response);
        return response;
    }
}

