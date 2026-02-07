import * as vscode from 'vscode';
import { SfConfiguration } from '../sfConfiguration';
import { SfRest } from '../sfRest';
import { SfUtility, debugLevel } from '../sfUtility';
import { 
    ClusterConnectionError, 
    CertificateError, 
    NetworkError
} from '../models/Errors';

/**
 * Service for managing cluster connections and operations
 * Handles authentication, connection establishment, and data population
 */
export class SfClusterService {
    private readonly context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * Connect to a Service Fabric cluster
     * @param config Cluster configuration
     * @param sfRest REST client instance
     * @returns Updated configuration with cluster data
     */
    public async connectToCluster(
        config: SfConfiguration,
        sfRest: SfRest
    ): Promise<void> {
        try {
            const endpoint = config.getClusterEndpoint();
            SfUtility.outputLog(`Connecting to cluster: ${endpoint}`, null, debugLevel.info);
            
            // Ensure REST client is fully configured (discovers cert, retrieves PEM, configures clients)
            await config.ensureRestClientReady();
            
            // Verify connection works - don't populate data (lazy loading)
            await config.getSfRest().getClusterVersion();
            
            SfUtility.showInformation(`Successfully connected to cluster: ${endpoint}`);
            SfUtility.outputLog(`Successfully connected to cluster: ${endpoint}`, null, debugLevel.info);
        } catch (error) {
            const endpoint = config.getClusterEndpoint();
            const message = `Failed to connect to cluster: ${endpoint}`;
            SfUtility.outputLog(message, error, debugLevel.error);
            
            if (error instanceof CertificateError) {
                SfUtility.showError(`${message}. Certificate authentication failed. Check certificate configuration.`);
            } else if (error instanceof NetworkError) {
                SfUtility.showError(`${message}. Network error. Check endpoint and firewall settings.`);
            } else {
                SfUtility.showError(`${message}. ${error instanceof Error ? error.message : String(error)}`);
            }
            
            throw new ClusterConnectionError(message, { endpoint, cause: error });
        }
    }

    /**
     * Refresh cluster data by re-populating configuration
     * @param config Cluster configuration to refresh
     */
    public async refreshCluster(config: SfConfiguration): Promise<void> {
        try {
            const endpoint = config.getClusterEndpoint();
            SfUtility.outputLog(`Refreshing cluster: ${endpoint}`, null, debugLevel.info);
            
            await config.populate();
            
            SfUtility.outputLog(`Refreshed cluster: ${endpoint}`, null, debugLevel.info);
        } catch (error) {
            const endpoint = config.getClusterEndpoint();
            SfUtility.outputLog(`Failed to refresh cluster: ${endpoint}`, error, debugLevel.error);
            throw error;
        }
    }

    /**
     * Validate cluster endpoint format
     * @param endpoint Cluster endpoint URL
     * @returns True if valid
     */
    public validateEndpoint(endpoint: string): boolean {
        try {
            const url = new URL(endpoint);
            return (url.protocol === 'http:' || url.protocol === 'https:') && !!url.hostname;
        } catch {
            return false;
        }
    }
}
