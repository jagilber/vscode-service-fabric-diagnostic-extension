import * as vscode from 'vscode';
import * as xmlConverter from 'xml-js';
import { SfUtility } from './sfUtility';
import { SfClusterFolder } from './sfClusterFolder';
import * as SfApi from './sdk/servicefabric/servicefabric/src/serviceFabricClientAPIs';
import * as sfModels from './sdk/servicefabric/servicefabric/src/models';
import { TreeItem } from './serviceFabricClusterView';
import { url } from 'inspector';
import { SfRestClient } from './sfRestClient';
import { SfRest } from './sfRest';

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
};

export type clusterEndpointInfo = {
    endpoint: string;
    clusterCertificate?: clusterCertificate;
};

export class SfConfiguration {
    public xmlManifest = "";
    public jsonManifest = "";
    public jObjectManifest: any;
    private context: any;
    public clusterHttpEndpoint?: string = 'http://localhost:19080';
    public clusterName?: string;
    public nodes: sfModels.NodeInfo[] = [];
    public nodeTypes: nodeType[] = [];
    public applicationTypes: sfModels.ApplicationTypeInfo[] = [];
    public applications: sfModels.ApplicationInfo[] = [];
    public services: sfModels.ServiceInfo[] = [];
    public systemServices: sfModels.ServiceInfo[] = [];
    private sfClusterFolder: SfClusterFolder;
    private sfRest: SfRest;
    private clusterCertificate?: string;
    private clusterCertificateThumbprint?: string;
    private clusterCertificateCommonName?: string;

    constructor(context: any, manifest?: string, clusterHttpEndpoint?: string, clusterCertificate?: string) {
        this.context = context;
        this.clusterHttpEndpoint = clusterHttpEndpoint!;
        this.sfClusterFolder = new SfClusterFolder(context);
        this.sfRest = new SfRest(context);

        if (clusterCertificate) {
            this.setClusterCertificate(clusterCertificate);
        }

        if (manifest) {
            this.setManifest(manifest);
            this.getNodes();
        }
    }

    public async init() {
        await this.sfRest.connectToCluster();
    }

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

    private addNodeType(nodeTypeName: string, node: sfModels.NodeInfo) {
        const nodeType = this.nodeTypes.find((nodeType: nodeType) => nodeType.name === nodeTypeName);
        if (nodeType) {
            nodeType.nodes.push(node);
        }
        else {
            this.nodeTypes.push({ name: nodeTypeName, nodes: [node] });
        }
    }

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

    public getClusterEndpointInfo(): clusterEndpointInfo|undefined {
        if (this.clusterHttpEndpoint) {
            return {
                endpoint: this.clusterHttpEndpoint,
                clusterCertificate: this.getClusterCertificate()
            };
        }
        return undefined;
    }

    public getClusterCertificate(): clusterCertificate| undefined{
        return {
            certificate: this.clusterCertificate,
            thumbprint: this.clusterCertificateThumbprint,
            commonName: this.clusterCertificateCommonName
        };
    }

    public getManifest(): string {
        return this.xmlManifest;
    }

    public getNodes(): Array<sfModels.NodeInfo> {

        this.sfRest.getNodes().then((nodes: sfModels.NodeInfo[]) => {
            nodes.forEach((node: sfModels.NodeInfo) => {
                this.addNode(node);
            });
            // this.addSfConfig(this.sfConfig);
            // SFUtility.outputLog('sfMgr:getCluster:config:', this.sfConfig);
            //this.sfClusterView.addTreeItem(new TreeItem(this.sfConfig.clusterName!));//, this.sfConfig.nodes, this.sfConfig));
            //this.sfClusterView.addTreeItem(this.sfConfig.createClusterViewTreeItem());
        });
        return this.nodes;
    }

    public setClusterCertificate(clusterCertificate: string) {
        if (clusterCertificate.length === 32) {
            SfUtility.outputLog('sfConfiguration:setClusterCertificate:thumbprint:', clusterCertificate);
            this.clusterCertificateThumbprint = clusterCertificate;
        }
        else if (clusterCertificate.toUpperCase().includes('CERTIFICATE')) {
            SfUtility.outputLog(`sfConfiguration:setClusterCertificate:certificate length:${clusterCertificate.length}`);
            this.clusterCertificate = clusterCertificate;
        }
        else {
            SfUtility.outputLog(`sfConfiguration:setClusterCertificate:common name:${clusterCertificate}`);
            this.clusterCertificateCommonName = clusterCertificate;
        }
    }

    public setManifest(xmlManifest: any | string): void {
        this.xmlManifest = xmlManifest.manifest; //JSON.parse(xmlManifest).Manifest;
        SfUtility.outputLog(`xml manifest: \r\n${this.xmlManifest}`);

        this.jsonManifest = xmlConverter.xml2json(this.xmlManifest, { compact: true, spaces: 4 });
        SfUtility.outputLog(`json manifest: \r\n${this.jsonManifest}`);
        this.jObjectManifest = JSON.parse(this.jsonManifest);
        this.clusterName = this.jObjectManifest.ClusterManifest._attributes.Name;
    }
}