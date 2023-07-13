
import * as xmlConverter from 'xml-js';
import { SFUtility } from './sfUtility';

export class SFConfiguration {
    public xmlManifest = "";
    public xmlJson = "";
    private context: any;
    public clusterHttpEndpoint:string|undefined;
    public clusterName:string|undefined;

    constructor(context: any) {
        this.context = context;
    }

    public getManifest(): string {
        return this.xmlManifest;
    }

    public setManifest(xmlManifest: string): void {
        this.xmlManifest = JSON.parse(xmlManifest).Manifest;
        SFUtility.outputLog(`xml manifest: \r\n${this.xmlManifest}`);
        this.xmlJson = xmlConverter.xml2json(this.xmlManifest, { compact: true, spaces: 4 });
        SFUtility.outputLog(`json manifest: \r\n${this.xmlJson}`);
    }

}