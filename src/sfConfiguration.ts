import * as vscode from 'vscode';
import * as xmlConverter from 'xml-js';
import { SfUtility, debugLevel } from './sfUtility';
import { SfClusterFolder } from './sfClusterFolder';
import * as SfApi from './sdk/servicefabric/servicefabric/src/serviceFabricClientAPIs';
import * as sfModels from './sdk/servicefabric/servicefabric/src/models';
import { TreeItem } from './serviceFabricClusterView';
import { SfRestClient } from './sfRestClient';
import { SfRest } from './sfRest';
import { SfPs } from './sfPs';
import { SfConstants } from './sfConstants';
import { PeerCertificate } from 'tls';
import * as url from 'url';

export type nodeType = {
    name: string;
    nodes: sfModels.NodeInfo[];
};

// schema
export type clusterViewTreeItemType = [
    cluster: {
        label: string,
        children: [
            applications: {
                label: string,
                children: [
                    applicationType: {
                        label: string,
                        children: [
                            application: {
                                label: string,
                                children: [
                                    services: {
                                        label: string,
                                        children: []
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            nodes: {
                label: string,
                children: [
                    node: {
                        label: string,
                        children: []
                    }
                ]
            },
            system: {
                label: string,
                children: [
                    services: {
                        label: string,
                        children: []
                    }
                ]
            }
        ]
    }
];

export type clusterCertificate = {
    certificate?: string;
    thumbprint?: string;
    commonName?: string;
    key?: string;
};

export type clusterEndpointInfo = {
    endpoint: string;
    clusterCertificate?: clusterCertificate;
    manifest?: string;
};

export class SfConfiguration {
    public xmlManifest = "";
    public jsonManifest = "";
    public jObjectManifest: any;
    private context: any;
    public clusterHttpEndpoint: string = SfConstants.SF_HTTP_GATEWAY_ENDPOINT;
    public clusterName?: string;
    public nodes: sfModels.NodeInfo[] = [];
    public nodeTypes: nodeType[] = [];
    public applicationTypes: sfModels.ApplicationTypeInfo[] = [];
    public applications: sfModels.ApplicationInfo[] = [];
    public services: sfModels.ServiceInfo[] = [];
    public systemServices: sfModels.ServiceInfo[] = [];
    private sfClusterFolder: SfClusterFolder;
    private sfRest: SfRest;
    private clusterCertificate: clusterCertificate = {};
    private clusterCertificateThumbprint?: string;
    private clusterCertificateCommonName?: string;
    private sfPs: SfPs = new SfPs();

    constructor(context: any, clusterEndpointInfo?: clusterEndpointInfo) {
        this.context = context;
        this.sfClusterFolder = new SfClusterFolder(context);
        this.sfRest = new SfRest(context);

        if (clusterEndpointInfo) {
            this.setClusterEndpoint(clusterEndpointInfo.endpoint);
            this.clusterName = url.parse(clusterEndpointInfo.endpoint).hostname!;

            if (clusterEndpointInfo.clusterCertificate) {
                this.setClusterCertificateInfo(clusterEndpointInfo.clusterCertificate);
            }
            else {
                this.getClusterCertificateFromServer();
            }

            if (clusterEndpointInfo.manifest) {
                this.setManifest(clusterEndpointInfo.manifest);
            }
        }
    }

    // public async init() {
    //     await this.sfRest.connectToCluster();
    // }

    public addApplication(application: sfModels.ApplicationInfo) {
        this.applications.push(application);
    }

    public addApplicationType(applicationType: sfModels.ApplicationTypeInfo) {
        this.applicationTypes.push(applicationType);
    }

    private addApplicationTreeItems(resourceUri: vscode.Uri, clusterViewTreeItemChildren: TreeItem[]) {
        const applicationItems: TreeItem[] = [];
        this.applicationTypes.forEach((applicationType: sfModels.ApplicationTypeInfo) => {
            const applicationTypeItems: TreeItem[] = [];
            this.applications.forEach((application: sfModels.ApplicationInfo) => {
                this.addServiceTreeItems(resourceUri, applicationTypeItems, application);
            });
            applicationItems.push(new TreeItem(applicationType.name ?? 'undefined', applicationTypeItems, resourceUri));
        });
        clusterViewTreeItemChildren.push(new TreeItem('applications', applicationItems, resourceUri));
    }

    public addNode(node: sfModels.NodeInfo) {
        this.nodes.push(node);
    }

    private addNodeTreeItems(resourceUri: vscode.Uri, clusterViewTreeItemChildren: TreeItem[]) {
        const nodeItems: TreeItem[] = [];
        this.nodes.forEach((node: sfModels.NodeInfo) => {
            nodeItems.push(new TreeItem(node.name ?? 'undefined', undefined, resourceUri, node.healthState));
        });
        clusterViewTreeItemChildren.push(new TreeItem('nodes', nodeItems, resourceUri));
    }

    // private addNodeType(nodeTypeName: string, node: sfModels.NodeInfo) {
    //     const nodeType = this.nodeTypes.find((nodeType: nodeType) => nodeType.name === nodeTypeName);
    //     if (nodeType) {
    //         nodeType.nodes.push(node);
    //     }
    //     else {
    //         this.nodeTypes.push({ name: nodeTypeName, nodes: [node] });
    //     }
    // }

    public addService(service: sfModels.ServiceInfo) {
        this.services.push(service);
    }

    private addServiceTreeItems(resourceUri: vscode.Uri, applicationTypeItems: TreeItem[], application: sfModels.ApplicationInfo) {
        const applicationItems: TreeItem[] = [];
        this.services.forEach((service: sfModels.ServiceInfo) => {
            applicationItems.push(new TreeItem(service.serviceKind ?? 'undefined', undefined, resourceUri));
        });
        applicationTypeItems.push(new TreeItem(application.name ?? 'undefined', applicationItems, resourceUri));
    }

    private addSystemTreeItems(resourceUri: vscode.Uri, clusterViewTreeItemChildren: TreeItem[]) {
        const systemItems: TreeItem[] = [];
        this.systemServices.forEach((service: sfModels.ServiceInfo) => {
            systemItems.push(new TreeItem(service.serviceKind ?? 'undefined', undefined, resourceUri));
        });
        clusterViewTreeItemChildren.push(new TreeItem('system', systemItems, resourceUri));
    }

    public createClusterViewTreeItem(): TreeItem {
        const resourceUri: vscode.Uri = vscode.Uri.parse(this.clusterHttpEndpoint!);
        this.sfClusterFolder.createClusterFolder(this.clusterName!);
        const clusterViewTreeItemChildren: TreeItem[] = [];

        this.addApplicationTreeItems(resourceUri, clusterViewTreeItemChildren);
        this.addNodeTreeItems(resourceUri, clusterViewTreeItemChildren);
        this.addSystemTreeItems(resourceUri, clusterViewTreeItemChildren);

        const clusterViewTreeItem: TreeItem = new TreeItem(this.clusterName ?? 'undefined', clusterViewTreeItemChildren, resourceUri);
        SfUtility.outputLog('clusterViewTreeItem:', clusterViewTreeItem);
        return clusterViewTreeItem;
    }

    public async getApplications(): Promise<sfModels.ApplicationInfo[]> {
        const applications: sfModels.ApplicationInfo[] = await this.sfRest.getApplications();
        applications.forEach((application: sfModels.ApplicationInfo) => {
            this.addApplication(application);
        });
        return Promise.resolve(this.applications);
    }

    public async getApplicationTypes(): Promise<void> {
        const applicationTypes: sfModels.ApplicationTypeInfo[] = await this.sfRest.getApplicationTypes();
        applicationTypes.forEach((applicationType: sfModels.ApplicationTypeInfo) => {
            this.addApplicationType(applicationType);
        });
        return Promise.resolve();
    }

    public getClusterEndpointInfo(): clusterEndpointInfo | undefined {
        if (this.clusterHttpEndpoint) {
            return {
                endpoint: this.clusterHttpEndpoint,
                clusterCertificate: this.getClusterCertificate()
            };
        }
        return undefined;
    }

    public getClusterCertificate(): clusterCertificate | undefined {
        return this.clusterCertificate;
    }

    public async getClusterCertificateFromServer(clusterHttpEndpoint = this.clusterHttpEndpoint!): Promise<void> {
        const serverCertificate: PeerCertificate | undefined = await this.sfRest.getClusterServerCertificate(clusterHttpEndpoint);
        if (serverCertificate) {
            SfUtility.outputLog('sfConfiguration:getClusterCertificateFromServer:clusterCertificate:', serverCertificate);
            //this.clusterCertificate = serverCertificate.raw.toString('base64');
            this.clusterCertificate.thumbprint = serverCertificate.fingerprint;
            this.clusterCertificate.commonName = serverCertificate.subject.CN;
        }
        else {
            SfUtility.outputLog('sfConfiguration:getClusterCertificateFromServer:clusterCertificate:undefined', null, debugLevel.warn);
        }
        return Promise.resolve();
    }

    public getManifest(): string {
        return this.xmlManifest;
    }

    public async populate(): Promise<void> {
        this.sfRest.connectToCluster(this.clusterHttpEndpoint, this.clusterCertificate!);

        await this.populateManifest();
        await this.populateNodes();
        await this.getApplicationTypes();
        await this.getApplications().then((applications: sfModels.ApplicationInfo[]) => {
            applications.forEach((application: sfModels.ApplicationInfo) => {
                this.populateServices(application.id!);
            });
        });
        // await this.getServices();
        //await this.getSystemServices();
        return Promise.resolve();
    }

    public populateManifest(): string {
        this.sfRest.getClusterManifest().then((data: any) => {
            this.setManifest(data);
        });

        return this.getManifest();
    }

    public populateNodes(): Array<sfModels.NodeInfo> {

        this.sfRest.getNodes().then((nodes: sfModels.NodeInfo[]) => {
            nodes.forEach((node: sfModels.NodeInfo) => {
                this.addNode(node);
            });
        });
        return this.nodes;
    }

    public populateServices(applicationId: string): Array<sfModels.ServiceInfo> {
        this.sfRest.getServices(applicationId).then((services: sfModels.ServiceInfoUnion[]) => {
            services.forEach((service: sfModels.ServiceInfo) => {
                this.addService(service);
            });
        });
        return this.services;
    }

    public populateSystemServices(applicationId: string): Array<sfModels.ServiceInfo> {
        this.sfRest.getSystemServices(applicationId).then((services: sfModels.ServiceInfoUnion[]) => {
            services.forEach((service: sfModels.ServiceInfo) => {
                this.systemServices.push(service);
            });
        });
        return this.systemServices;
    }

    public async setClusterCertificate(clusterCertificate: string): Promise<void> {
        if (clusterCertificate.length >= 32 && clusterCertificate.length <= 40 && clusterCertificate.match(/^[0-9a-fA-F]+$/)) {
            SfUtility.outputLog('sfConfiguration:setClusterCertificate:thumbprint:', clusterCertificate);            //this.clusterCertificateThumbprint = clusterCertificate;
            this.clusterCertificate.thumbprint = clusterCertificate;
            this.clusterCertificate.certificate = await this.sfPs.getPemCertFromLocalCertStore(clusterCertificate);
        }
        else if (clusterCertificate.toUpperCase().includes('CERTIFICATE')) {
            SfUtility.outputLog(`sfConfiguration:setClusterCertificate:certificate length:${clusterCertificate.length}`);
            this.clusterCertificate.certificate = clusterCertificate;
        }
        else {
            SfUtility.outputLog(`sfConfiguration:setClusterCertificate:common name:${clusterCertificate}`);
            this.clusterCertificate.commonName = clusterCertificate;
            this.clusterCertificate.certificate = await this.sfPs.getPemCertFromLocalCertStore(clusterCertificate, undefined, true);
        }

        return Promise.resolve();
    }

    public setClusterCertificateInfo(clusterCertificate: clusterCertificate): void {
        this.clusterCertificate = clusterCertificate;
    }

    public setClusterEndpoint(clusterHttpEndpoint: string): void {
        SfUtility.outputLog('sfConfiguration:setClusterEndpoint:', clusterHttpEndpoint);
        this.clusterHttpEndpoint = clusterHttpEndpoint;
    }

    public setManifest(xmlManifest: any | string): void {
        this.xmlManifest = xmlManifest.manifest; //JSON.parse(xmlManifest).Manifest;
        SfUtility.outputLog(`xml manifest: \r\n${this.xmlManifest}`);

        this.jsonManifest = xmlConverter.xml2json(this.xmlManifest, { compact: true, spaces: 4 });
        SfUtility.outputLog(`json manifest: \r\n${this.jsonManifest}`);
        this.jObjectManifest = JSON.parse(this.jsonManifest);
        //this.clusterName = this.jObjectManifest.ClusterManifest._attributes.Name;
    }
}