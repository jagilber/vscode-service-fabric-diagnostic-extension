
import * as xmlConverter from 'xml-js';
import { SFUtility } from './sfUtility';
import * as SfApi from './sdk/servicefabric/servicefabric/src/serviceFabricClientAPIs';
import * as sfModels from './sdk/servicefabric/servicefabric/src/models';
//import { TreeItem } from './serviceFabricClusterView';

type nodeTypes = [
    nodeType: {
        name: string;
        nodes: sfModels.NodeInfo[];
    }
];

export class SFConfiguration {
    public xmlManifest = "";
    public jsonManifest = "";
    public jObjectManifest: any;
    private context: any;
    public clusterHttpEndpoint?:string;
    public clusterName?:string;
    public nodes: sfModels.NodeInfo[] = [];
    public nodeTypes: nodeTypes[] = [];
    public applicationTypes: sfModels.ApplicationTypeInfo[] = [];


    constructor(context: any) {
        this.context = context;
    }

    public addNode(node: sfModels.NodeInfo) {
        this.nodes.push(node);
        //this.nodeTypes.push(node);
    }

    public getManifest(): string {
        return this.xmlManifest;
    }

    public setManifest(xmlManifest: any|string): void {
        this.xmlManifest = xmlManifest.manifest; //JSON.parse(xmlManifest).Manifest;
        SFUtility.outputLog(`xml manifest: \r\n${this.xmlManifest}`);

        this.jsonManifest = xmlConverter.xml2json(this.xmlManifest, { compact: true, spaces: 4 });
        SFUtility.outputLog(`json manifest: \r\n${this.jsonManifest}`);
        this.jObjectManifest = JSON.parse(this.jsonManifest);
        this.clusterName = this.jObjectManifest.ClusterManifest._attributes.Name;
    }
}