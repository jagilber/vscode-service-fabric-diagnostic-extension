import * as vscode from 'vscode';
import * as fs from 'fs';
import { SfUtility } from './sfUtility';

export class SfClusterFolder {
    public applicationFolder = '';
    public nodeFolder = '';
    public systemFolder = '';
    public globalStorage = '';
    public clusterFolder = '';

    constructor(context: vscode.ExtensionContext) {
        SfUtility.outputLog(`sfClusterFile constructor:`);
        this.globalStorage = SfUtility.createFolder(context.globalStorageUri.fsPath);

    }

    public addApplicationFile(applicationTypeName: string, data?:string): void {
        const path = this.applicationFolder + '\\' + applicationTypeName;
        SfUtility.createFile(path,data);
    }

    public addClusterFile(clusterFileName: string, data?:string): void {
        const path = this.clusterFolder + '\\' + clusterFileName;
        SfUtility.createFile(path,data);
    }

    public addNodeFile(nodeName: string, data?:string): void {
        const path = this.nodeFolder + '\\' + nodeName;
        SfUtility.createFile(path,data);
    }

    public addSystemServiceFile(serviceName: string, data?:string): void {
        const path = this.systemFolder + '\\' + serviceName;
        SfUtility.createFile(path,data);
    }

    public createClusterFolder(clusterName: string, data = 'PLACEHOLDER'): void {
        clusterName = this.globalStorage + '\\' + clusterName;
        this.clusterFolder = SfUtility.createFolder(clusterName);
        this.addClusterFile('manifest.json',data);
        this.addClusterFile('jobs.json',data);
        this.addClusterFile('events.json',data);

        this.applicationFolder = SfUtility.createFolder(clusterName + '\\applications');
        this.nodeFolder = SfUtility.createFolder(clusterName + '\\nodes');
        this.systemFolder = SfUtility.createFolder(clusterName + '\\system');
    }


}
