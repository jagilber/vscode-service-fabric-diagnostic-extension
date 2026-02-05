import * as https from 'https';
import * as tls from 'tls';

/**
 * Interface for providing HTTP options configuration
 * Used to break circular dependency between SfRest and SfRestClient
 */
export interface IHttpOptionsProvider {
    /**
     * Create HTTP request options for Service Fabric auto REST calls
     * @param url Request URL
     * @returns HTTP/TLS request options
     */
    createSfAutoRestHttpOptions(url: string): https.RequestOptions | tls.ConnectionOptions;
}
