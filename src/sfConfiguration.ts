
import * as xmlConverter from 'xml-js';
import { SFUtility } from './sfUtility';

type nodeTypes = {
    nodeType: {
        nodes: {
            node: {
                name: string;
            }
        }
    }
};

export class SFConfiguration {
    public xmlManifest = "";
    public jsonManifest = "";
    public jObjectManifest: any;
    private context: any;
    public clusterHttpEndpoint:string|undefined;
    public clusterName:string|undefined;


    constructor(context: any) {
        this.context = context;
    }

    public addNode(node: any) {
      //  this.nodes.push(node);
    }

    public getManifest(): string {
        return this.xmlManifest;
    }

    public setManifest(xmlManifest: string): void {
        this.xmlManifest = JSON.parse(xmlManifest).Manifest;
        SFUtility.outputLog(`xml manifest: \r\n${this.xmlManifest}`);

        this.jsonManifest = xmlConverter.xml2json(this.xmlManifest, { compact: true, spaces: 4 });
        SFUtility.outputLog(`json manifest: \r\n${this.jsonManifest}`);
        this.jObjectManifest = JSON.parse(this.jsonManifest);
        this.clusterName = this.jObjectManifest.ClusterManifest._attributes.Name;
    }

    public setNodeType(nodeType: string, nodeTypeName: string): void {
      //  this.nodeTypes[nodeType] = nodeTypeName;
    }
    

}