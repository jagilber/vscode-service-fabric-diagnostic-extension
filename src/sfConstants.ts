export class SFConstants { 
    public static readonly SF_SDK_DIR = 'T:\\Program Files\\Microsoft SDKs\\Service Fabric\\ClusterSetup';
    public static readonly SF_DEV_CLUSTER_SETUP = `${SFConstants.SF_SDK_DIR}\\DevClusterSetup.ps1`;
    public static readonly SF_SDK_DOWNLOAD_URL = `https://learn.microsoft.com/en-us/azure/service-fabric/service-fabric-get-started`;
    public static readonly SF_SDK_URI_REGEX = '(https://.+?/MicrosoftServiceFabricSDK.+?.msi)';

}