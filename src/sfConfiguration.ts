import * as vscode from 'vscode';
import * as xmlConverter from 'xml-js';
import { SFUtility } from './sfUtility';
import * as SfApi from './sdk/servicefabric/servicefabric/src/serviceFabricClientAPIs';
import * as sfModels from './sdk/servicefabric/servicefabric/src/models';
import { TreeItem } from './serviceFabricClusterView';
import { url } from 'inspector';


/*
        if (children && <sfModels.NodeInfo[]>children !== undefined) {
            if (label.toLocaleLowerCase() === 'nodes') {
                for (const child of children) {
                    this.children.push(new TreeItem((<sfModels.NodeInfo>child).name ?? 'undefined', undefined, sfConfig));
                }
            }
            else{
                this.children = [new TreeItem('nodes', children, sfConfig)];
            }
        }
        else if (children && <TreeItem[]>children !== undefined) {
            this.children = (children as TreeItem[]) ?? [];
        }

*/

export type nodeType = {
    name: string;
    nodes: sfModels.NodeInfo[];
};


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
export class SFConfiguration {
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



    constructor(context: any, clusterHttpEndpoint?: string) {
        this.context = context;
        this.clusterHttpEndpoint = clusterHttpEndpoint!;
    }

    public addNode(node: sfModels.NodeInfo) {
        this.nodes.push(node);
        //this.nodeTypes.push(node);
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

    public createClusterViewTreeItem(): TreeItem {
        const resourceUri: vscode.Uri = vscode.Uri.parse(this.clusterHttpEndpoint!);
        const clusterViewTreeItemChildren: TreeItem[] = [];

        const applicationItems: TreeItem[] = [];
        this.applicationTypes.forEach((applicationType: sfModels.ApplicationTypeInfo) => {
            const applicationTypeItems: TreeItem[] = [];
            this.applications.forEach((application: sfModels.ApplicationInfo) => {
                const applicationItems: TreeItem[] = [];
                this.services.forEach((service: sfModels.ServiceInfo) => {
                    applicationItems.push(new TreeItem(service.serviceKind ?? 'undefined', undefined, resourceUri));
                });
                applicationTypeItems.push(new TreeItem(application.name ?? 'undefined', applicationItems, resourceUri));
            });
            applicationItems.push(new TreeItem(applicationType.name ?? 'undefined', applicationTypeItems, resourceUri));
        });
        clusterViewTreeItemChildren.push(new TreeItem('applications', applicationItems, resourceUri));

        const nodeItems: TreeItem[] = [];
        this.nodes.forEach((node: sfModels.NodeInfo) => {
            nodeItems.push(new TreeItem(node.name ?? 'undefined', undefined, resourceUri, node.healthState));
        });
        clusterViewTreeItemChildren.push(new TreeItem('nodes', nodeItems, resourceUri));

        const systemItems: TreeItem[] = [];
        this.systemServices.forEach((service: sfModels.ServiceInfo) => {
            systemItems.push(new TreeItem(service.serviceKind ?? 'undefined', undefined, resourceUri));
        });
        clusterViewTreeItemChildren.push(new TreeItem('system', systemItems, resourceUri));
        const clusterViewTreeItem: TreeItem = new TreeItem(this.clusterName ?? 'undefined', clusterViewTreeItemChildren, resourceUri);
        SFUtility.outputLog('clusterViewTreeItem:', clusterViewTreeItem);
        return clusterViewTreeItem;
    }

    public getManifest(): string {
        return this.xmlManifest;
    }

    public setManifest(xmlManifest: any | string): void {
        this.xmlManifest = xmlManifest.manifest; //JSON.parse(xmlManifest).Manifest;
        SFUtility.outputLog(`xml manifest: \r\n${this.xmlManifest}`);

        this.jsonManifest = xmlConverter.xml2json(this.xmlManifest, { compact: true, spaces: 4 });
        SFUtility.outputLog(`json manifest: \r\n${this.jsonManifest}`);
        this.jObjectManifest = JSON.parse(this.jsonManifest);
        this.clusterName = this.jObjectManifest.ClusterManifest._attributes.Name;
    }
}