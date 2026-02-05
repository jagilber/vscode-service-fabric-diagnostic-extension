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

}