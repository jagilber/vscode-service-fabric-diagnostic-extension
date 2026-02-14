import * as vscode from 'vscode';

export class SfConstants {
    public static readonly SF_SDK_DIR = 'C:\\Program Files\\Microsoft SDKs\\Service Fabric\\ClusterSetup';
    public static readonly SF_DEV_CLUSTER_SETUP = `${SfConstants.SF_SDK_DIR}\\DevClusterSetup.ps1`;
    public static readonly SF_SDK_DOWNLOAD_URL = `https://learn.microsoft.com/en-us/azure/service-fabric/service-fabric-get-started`;
    // https://download.microsoft.com/download/b/8/a/b8a2fb98-0ec1-41e5-be98-9d8b5abf7856/MicrosoftServiceFabricSDK.6.1.1833.msi
    public static readonly SF_SDK_URI_REGEX = '(https://.+?/MicrosoftServiceFabricSDK.+?.msi)';
    // https://download.microsoft.com/download/b/8/a/b8a2fb98-0ec1-41e5-be98-9d8b5abf7856/MicrosoftServiceFabric.9.1.1833.9590.exe
    public static readonly SF_RUNTIME_URI_REGEX = '(https://.+?/MicrosoftServiceFabric.+?.exe)';
    public static readonly SF_HTTP_GATEWAY_PORT = 19080;
    public static readonly SF_HTTP_GATEWAY_ENDPOINT = `http://localhost:${SfConstants.SF_HTTP_GATEWAY_PORT}`;

    /** Default template repository URLs for ARM/Bicep template search */
    public static readonly SF_TEMPLATE_REPOS_DEFAULT = [
        {
            name: 'Azure-Samples (Official)',
            url: 'https://github.com/Azure-Samples/service-fabric-cluster-templates',
            branch: 'master',
            description: 'Official Azure-Samples SF cluster templates'
        },
        {
            name: 'jagilber/service-fabric-cluster-templates',
            url: 'https://github.com/jagilber/service-fabric-cluster-templates',
            branch: 'standard-load-balancer',
            description: 'Current working examples with standard load balancer'
        }
    ];

    /** GitHub API base URL for raw content */
    public static readonly GITHUB_RAW_BASE = 'https://raw.githubusercontent.com';
    /** GitHub API base URL */
    public static readonly GITHUB_API_BASE = 'https://api.github.com';

    /** Default SF operation timeout in seconds (matches SF cluster default) */
    public static readonly SF_DEFAULT_TIMEOUT_SEC = 1200;

    /**
     * Get the configured timeout in milliseconds.
     * Priority: SF_TIMEOUT_SEC env var → sfClusterExplorer.timeoutSeconds setting → 1200s default
     */
    public static getTimeoutMs(): number {
        const envVal = process.env.SF_TIMEOUT_SEC;
        if (envVal) {
            const parsed = parseInt(envVal, 10);
            if (!isNaN(parsed) && parsed > 0) {
                return parsed * 1000;
            }
        }
        const settingVal = vscode.workspace.getConfiguration('sfClusterExplorer').get<number>('timeoutSeconds');
        if (settingVal && settingVal > 0) {
            return settingVal * 1000;
        }
        return SfConstants.SF_DEFAULT_TIMEOUT_SEC * 1000;
    }
}