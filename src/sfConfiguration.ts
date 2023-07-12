
import * as xmlConverter from 'xml-js';

export class SFConfiguration {
    public xmlManifest = "";
    private context: any;
    public clusterHttpEndpoint:string|undefined;

    constructor(context: any) {
        this.context = context;
    }

    public getManifest(): string {
        return this.xmlManifest;
    }

    public setManifest(xmlManifest: string): void {
        const xml = xmlConverter.xml2json(xmlManifest, { compact: true, spaces: 4 });
        // print the name of the root element or error message
        this.xmlManifest = xml;
    }

}