import * as vscode from 'vscode';
import * as path from 'path';
import * as json from 'jsonc-parser';
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
            manifest: {
                label: string,
            },
            jobs: {
                label: string,
            },
            events: {
                label: string,
            },
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
    private xmlManifest = "";
    private jsonManifest = "";
    private jObjectManifest: any;
    private context: any;
    private clusterHttpEndpoint: string = SfConstants.SF_HTTP_GATEWAY_ENDPOINT;
    private clusterName?: string;
    private nodes: sfModels.NodeInfo[] = [];
    private nodeTypes: nodeType[] = [];
    private applicationTypes: sfModels.ApplicationTypeInfo[] = [];
    private applications: sfModels.ApplicationInfo[] = [];
    private services: sfModels.ServiceInfo[] = [];
    private systemServices: sfModels.ServiceInfo[] = [];
    private sfClusterFolder: SfClusterFolder;
    private sfRest: SfRest;
    private clusterCertificate: clusterCertificate = {};
    private clusterHealth?: sfModels.ClusterHealth;
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

    private addClusterTreeItems(resourceUri: vscode.Uri, clusterViewTreeItemChildren: TreeItem[]) {
        const clusterTreeItems: TreeItem[] = [];

        clusterViewTreeItemChildren.push(new TreeItem('manifest', undefined, resourceUri));
        clusterViewTreeItemChildren.push(new TreeItem('jobs', undefined, resourceUri));
        clusterViewTreeItemChildren.push(new TreeItem('events', undefined, resourceUri));
    }

    public addNode(node: sfModels.NodeInfo) {
        this.nodes.push(node);
    }

    private addNodeTreeItems(resourceUri: vscode.Uri, clusterViewTreeItemChildren: TreeItem[]) {
        const nodeItems: TreeItem[] = [];
        this.nodes.forEach((node: sfModels.NodeInfo) => {
            nodeItems.push(new TreeItem(node.name ?? 'undefined',
                undefined,
                resourceUri,
                node.healthState,
                this.getIcon(node.healthState)
            ));
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

        this.addClusterTreeItems(resourceUri, clusterViewTreeItemChildren);
        this.addApplicationTreeItems(resourceUri, clusterViewTreeItemChildren);
        this.addNodeTreeItems(resourceUri, clusterViewTreeItemChildren);
        this.addSystemTreeItems(resourceUri, clusterViewTreeItemChildren);

        // add cluster view tree item to root view
        const clusterViewTreeItem: TreeItem = new TreeItem(this.clusterName ?? 'undefined',
            clusterViewTreeItemChildren,
            resourceUri,
            this.clusterHealth?.aggregatedHealthState,
            this.getIcon(this.clusterHealth?.aggregatedHealthState)
        );

        SfUtility.outputLog('clusterViewTreeItem:', clusterViewTreeItem);
        return clusterViewTreeItem;
    }


    public getClusterEndpoint(): string {
        return this.clusterHttpEndpoint!;
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

    private getIcon(status: any): any {

        switch (status.toLowerCase()) {
            case 'ok':
                return {
                    light: this.context.asAbsolutePath(path.join('resources', 'light', 'pass.svg')),
                    dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'pass.svg'))
                };
            case 'warning':
                return {
                    light: this.context.asAbsolutePath(path.join('resources', 'light', 'warning.svg')),
                    dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'warning.svg'))
                };
            case 'error':
                return {
                    light: this.context.asAbsolutePath(path.join('resources', 'light', 'error.svg')),
                    dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'error.svg'))
                };
            case 'unknown':
                return {
                    light: this.context.asAbsolutePath(path.join('resources', 'light', 'unknown.svg')),
                    dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'unknown.svg'))
                };
        }

        return null;
    }

    public getManifest(): string {
        return this.xmlManifest;
    }

    private getVmIcon(status: any): any {

        switch (status.toLowerCase()) {
            case 'ok':
                return {
                    light: this.context.asAbsolutePath(path.join('resources', 'light', 'vm-running.svg')),
                    dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'vm-running.svg'))
                };
            case 'warning':
                return {
                    light: this.context.asAbsolutePath(path.join('resources', 'light', 'warning.svg')),
                    dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'warning.svg'))
                };
            case 'error':
                return {
                    light: this.context.asAbsolutePath(path.join('resources', 'light', 'error.svg')),
                    dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'error.svg'))
                };
            case 'unknown':
                return {
                    light: this.context.asAbsolutePath(path.join('resources', 'light', 'vm.svg')),
                    dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'vm.svg'))
                };
        }

        return null;
    }

    public async populate(): Promise<void> {
        this.sfRest.connectToCluster(this.clusterHttpEndpoint, this.clusterCertificate!);
        await this.populateClusterHealth();
        await this.populateManifest();
        await this.populateNodes();
        await this.populateApplicationTypes();
        await this.populateApplications().then((applications: sfModels.ApplicationInfo[]) => {
            applications.forEach((application: sfModels.ApplicationInfo) => {
                this.populateServices(application.id!);
            });
        });
        // await this.getServices();
        //await this.getSystemServices();
        return Promise.resolve();
    }

    public async populateApplications(): Promise<sfModels.ApplicationInfo[]> {
        return await this.sfRest.getApplications().then((applications: sfModels.ApplicationInfo[]) => {
            applications.forEach((application: sfModels.ApplicationInfo) => {
                this.addApplication(application);
            });
            return applications;
        });
    }

    public async populateApplicationTypes(): Promise<void> {
        return await this.sfRest.getApplicationTypes().then((applicationTypes: sfModels.ApplicationTypeInfo[]) => {
            applicationTypes.forEach((applicationType: sfModels.ApplicationTypeInfo) => {
                this.addApplicationType(applicationType);
            });
        });
    }

    public async populateClusterHealth(): Promise<void> {
        return await this.sfRest.getClusterHealth().then((clusterHealth: sfModels.ClusterHealth) => {
            SfUtility.outputLog('sfConfiguration:populateClusterHealth:clusterHealth:', clusterHealth);
            this.clusterHealth = clusterHealth;
        });
    }

    public async populateManifest(): Promise<void> {
        return await this.sfRest.getClusterManifest().then((data: any) => {
            this.setManifest(data);
        });
    }

    public async populateNodes(): Promise<void> {
        return await this.sfRest.getNodes().then((nodes: sfModels.NodeInfo[]) => {
            nodes.forEach((node: sfModels.NodeInfo) => {
                this.addNode(node);
            });
        });
    }

    public async populateServices(applicationId: string): Promise<void> {
        return await this.sfRest.getServices(applicationId).then((services: sfModels.ServiceInfoUnion[]) => {
            services.forEach((service: sfModels.ServiceInfo) => {
                this.addService(service);
            });
        });
    }

    public async populateSystemServices(applicationId: string): Promise<void> {
        return await this.sfRest.getSystemServices(applicationId).then((services: sfModels.ServiceInfoUnion[]) => {
            services.forEach((service: sfModels.ServiceInfo) => {
                this.systemServices.push(service);
            });
        });
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