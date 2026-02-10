import * as vscode from 'vscode';
import { SfConstants } from '../sfConstants';
import { SfPs } from '../sfPs';
import { SfUtility, debugLevel } from '../sfUtility';
import { SfHttpClient } from '../utils/SfHttpClient';
import { SdkInstallationError } from '../models/Errors';

/**
 * Service for downloading and installing Service Fabric SDK
 * Handles SDK downloads, dev cluster deployment, and binary execution
 */
export class SfSdkInstaller {
    private readonly ps: SfPs;
    private readonly httpClient: SfHttpClient;
    private readonly globalStorage: string;

    constructor(context: vscode.ExtensionContext) {
        this.ps = new SfPs();
        this.httpClient = new SfHttpClient({ timeout: 30000 });
        this.globalStorage = context.globalStorageUri.fsPath;
        
        // Ensure storage directory exists
        SfUtility.createFolder(this.globalStorage);
    }

    /**
     * Deploy local Service Fabric development cluster
     */
    public async deployDevCluster(): Promise<void> {
        try {
            // Check for binaries
            const result = await this.runPsCommand('whoami');
            SfUtility.outputLog(`SfSdkInstaller:deployDevCluster:whoami:${result}`);
            await this.runPsCommand('$psversiontable');
            
            if (SfUtility.fileExists(SfConstants.SF_SDK_DIR)) {
                SfUtility.outputLog(`SDK directory exists:${SfConstants.SF_SDK_DIR}`, null, debugLevel.info);
            } else {
                SfUtility.outputLog(`SDK directory does not exist:${SfConstants.SF_SDK_DIR}`, null, debugLevel.warn);

                await this.downloadAndInstallSdk();
                
                // Deploy dev cluster
                if (SfUtility.fileExists(SfConstants.SF_DEV_CLUSTER_SETUP)) {
                    await this.runPsCommand(`start-process -verb runas -wait -filePath '${SfConstants.SF_DEV_CLUSTER_SETUP}'`);
                } else {
                    throw new SdkInstallationError(
                        `Dev cluster setup script not found: ${SfConstants.SF_DEV_CLUSTER_SETUP}`
                    );
                }
            }
            
            SfUtility.showInformation('Dev cluster deployment initiated');
        } catch (error) {
            const message = 'Failed to deploy dev cluster';
            SfUtility.outputLog(message, error, debugLevel.error);
            SfUtility.showError(`${message}. ${error instanceof Error ? error.message : String(error)}`);
            throw new SdkInstallationError(message, { cause: error });
        }
    }

    /**
     * Download and install Service Fabric SDK
     */
    public async downloadAndInstallSdk(): Promise<void> {
        try {
            SfUtility.outputLog('Starting SF SDK download', null, debugLevel.info);
            
            // Download binaries listing page
            const result = await this.httpClient.get(SfConstants.SF_SDK_DOWNLOAD_URL);

            if (!result) {
                throw new SdkInstallationError('Failed to fetch SDK download page');
            }

            // Parse result for real download URLs
            // Runtime
            const runtimeMatch = result.toString().match(SfConstants.SF_RUNTIME_URI_REGEX);
            if (!runtimeMatch) {
                throw new SdkInstallationError('Could not find runtime download URL in response');
            }
            
            let downloadUrl: string = runtimeMatch[0];
            let outputFile = `${this.globalStorage}\\${downloadUrl.split('/').pop()!}`;
            
            SfUtility.outputLog(`Downloading SF Runtime from: ${downloadUrl}`, null, debugLevel.info);
            await this.downloadAndExecute(downloadUrl, outputFile, outputFile, ['/accepteula', '/quiet', '/force']);

            // SDK
            const sdkMatch = result.toString().match(SfConstants.SF_SDK_URI_REGEX);
            if (!sdkMatch) {
                throw new SdkInstallationError('Could not find SDK download URL in response');
            }
            
            downloadUrl = sdkMatch[0];
            outputFile = `${this.globalStorage}\\${downloadUrl.split('/').pop()!}`;
            const args = ['/package', outputFile, '/norestart', '/quiet', '/log', `${this.globalStorage}\\sf-sdk.log`];
            
            SfUtility.outputLog(`Downloading SF SDK from: ${downloadUrl}`, null, debugLevel.info);
            await this.downloadAndExecute(downloadUrl, outputFile, 'msiexec.exe', args);
            
            SfUtility.showInformation('Service Fabric SDK installation complete');
            SfUtility.outputLog('SF SDK download and installation complete', null, debugLevel.info);
        } catch (error) {
            const message = 'Failed to download and install Service Fabric SDK';
            SfUtility.outputLog(message, error, debugLevel.error);
            SfUtility.showError(`${message}. ${error instanceof Error ? error.message : String(error)}`);
            throw new SdkInstallationError(message, { cause: error });
        }
    }

    /**
     * Download a file and execute it with specified arguments
     * @param downloadUrl URL to download from
     * @param outputFile Local path to save file
     * @param command Command to execute (defaults to outputFile)
     * @param args Command arguments
     * @returns Command output
     */
    public async downloadAndExecute(
        downloadUrl: string,
        outputFile: string,
        command?: string,
        args: string[] = []
    ): Promise<string | undefined> {
        try {
            SfUtility.outputLog(`Downloading and executing: ${downloadUrl}`, null, debugLevel.info);

            if (!outputFile) {
                outputFile = `${this.globalStorage}\\${downloadUrl.split('/').pop()!}`;
            }

            if (!command) {
                command = outputFile;
            }

            const psCommand = `start-process -wait -filePath '${command}' -argumentList '${args?.join(' ')}'`;

            if (!SfUtility.fileExists(outputFile)) {
                await this.httpClient.download(downloadUrl, outputFile);
                SfUtility.outputLog(`Downloaded file: ${outputFile}`, null, debugLevel.info);

                // Install binaries
                if (SfUtility.fileExists(outputFile)) {
                    SfUtility.outputLog(`Executing: ${command}`, null, debugLevel.info);
                    return await this.runPsCommand(psCommand);
                } else {
                    throw new SdkInstallationError(`File not found after download: ${outputFile}`);
                }
            } else {
                SfUtility.outputLog(`File already exists: ${outputFile}`, null, debugLevel.info);
                return await this.runPsCommand(psCommand);
            }
        } catch (error) {
            SfUtility.outputLog(`downloadAndExecute failed: ${downloadUrl}`, error, debugLevel.error);
            throw error;
        }
    }

    /**
     * Run PowerShell command
     * @param command PowerShell command to execute
     * @returns Command output
     */
    private async runPsCommand(command: string): Promise<string> {
        SfUtility.outputLog('runPsCommand: ' + command);
        const results = await this.ps.send(command);
        try {
            const response = JSON.parse(results);
            SfUtility.outputLog(`runPsCommand output:`, response);
            return response;
        } catch (parseError) {
            SfUtility.outputLog(`runPsCommand: Failed to parse JSON response. Raw output: ${results}`, parseError, debugLevel.warn);
            return results;
        }
    }
}
