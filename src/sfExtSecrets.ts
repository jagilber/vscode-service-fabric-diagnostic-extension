import * as vscode from 'vscode';
import { debugLevel, SfUtility } from './sfUtility';

export const enum sfExtSecretList {
    sfRestSecret = 'sfRestSecret',
    sfRestKey = 'sfRestKey',
    sfRestCertificate = 'sfRestCertificate'
}


export class SfExtSecrets {

    private secrets: vscode.SecretStorage;

    public constructor(context: vscode.ExtensionContext) {
        this.secrets = context.secrets;
    }

    public async getSecret(secretName: sfExtSecretList): Promise<string | undefined> {
        SfUtility.outputLog('sfExtSecrets:getSecret:', secretName);
        const secret = await this.secrets.get(secretName);
        if(secret === undefined){
            SfUtility.outputLog('sfExtSecrets:getSecret:secretName not in list:', secretName, debugLevel.warn);
        }

        SfUtility.outputLog(`sfExtSecrets:getSecret:secret length:${secret?.length}`);
        return secret;
    }

    public async setSecret(secretName: sfExtSecretList, secretValue: string): Promise<void> {
        SfUtility.outputLog(`sfExtSecrets:setSecret:${secretName} length:${secretValue.length}`);
        await this.secrets.store(secretName, secretValue);
    }
}