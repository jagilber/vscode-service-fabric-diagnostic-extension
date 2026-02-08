/**
 * Manages cluster connection state: endpoint, certificate discovery, PEM retrieval
 * Extracted from sfConfiguration.ts — handles TLS handshake cert discovery and cert store lookups
 */
import { PeerCertificate } from 'tls';
import { SfUtility, debugLevel } from '../sfUtility';
import { SfRest } from '../sfRest';
import { SfPs } from '../sfPs';
import { PiiObfuscation } from '../utils/PiiObfuscation';
import { clusterCertificate } from '../types/ClusterTypes';

/**
 * Manages cluster endpoint and certificate state
 * Handles TLS handshake certificate discovery and local cert store PEM retrieval
 */
export class ClusterConnectionManager {
    private clusterHttpEndpoint: string;
    private clusterCertificate: clusterCertificate = {};
    private _restClientReadyPromise: Promise<void> | null = null;

    constructor(
        private sfRest: SfRest,
        private sfPs: SfPs,
        defaultEndpoint: string
    ) {
        this.clusterHttpEndpoint = defaultEndpoint;
    }

    public getClusterEndpoint(): string {
        return this.clusterHttpEndpoint;
    }

    public setClusterEndpoint(clusterHttpEndpoint: string): void {
        SfUtility.outputLog(`ClusterConnectionManager:setClusterEndpoint: ${PiiObfuscation.endpoint(clusterHttpEndpoint)}`, null, debugLevel.info);
        this.clusterHttpEndpoint = clusterHttpEndpoint;
    }

    public getClusterCertificate(): clusterCertificate | undefined {
        return this.clusterCertificate;
    }

    public getClientCertificateThumbprint(): string | undefined {
        return this.clusterCertificate?.thumbprint;
    }

    public getServerCertificateThumbprint(): string | undefined {
        return this.clusterCertificate?.thumbprint;
    }

    public setClusterCertificateInfo(clusterCert: clusterCertificate): void {
        this.clusterCertificate = clusterCert;
    }

    /**
     * Set cluster certificate from a thumbprint, PEM string, or common name
     * Automatically detects the format and retrieves PEM from local cert store if needed
     */
    public async setClusterCertificate(clusterCertificateValue: string): Promise<void> {
        if (clusterCertificateValue.length >= 32 && clusterCertificateValue.length <= 40 && clusterCertificateValue.match(/^[0-9a-fA-F]+$/)) {
            SfUtility.outputLog(`ClusterConnectionManager:setClusterCertificate:thumbprint: ${PiiObfuscation.thumbprint(clusterCertificateValue)}`, null, debugLevel.info);
            this.clusterCertificate.thumbprint = clusterCertificateValue;
            this.clusterCertificate.certificate = await this.sfPs.getPemCertFromLocalCertStore(clusterCertificateValue);
        }
        else if (clusterCertificateValue.toUpperCase().includes('CERTIFICATE')) {
            SfUtility.outputLog(`ClusterConnectionManager:setClusterCertificate:certificate: ${PiiObfuscation.certificate(clusterCertificateValue)}`, null, debugLevel.info);
            this.clusterCertificate.certificate = clusterCertificateValue;
        }
        else {
            SfUtility.outputLog(`ClusterConnectionManager:setClusterCertificate:common name: ${PiiObfuscation.commonName(clusterCertificateValue)}`, null, debugLevel.info);
            this.clusterCertificate.commonName = clusterCertificateValue;
            this.clusterCertificate.certificate = await this.sfPs.getPemCertFromLocalCertStore(clusterCertificateValue, undefined, true);
        }
    }

    /**
     * Discover server certificate from TLS handshake
     */
    public async getClusterCertificateFromServer(clusterHttpEndpoint = this.clusterHttpEndpoint): Promise<void> {
        const serverCertificate: PeerCertificate | undefined = await this.sfRest.getClusterServerCertificate(clusterHttpEndpoint);
        if (serverCertificate) {
            SfUtility.outputLog(`ClusterConnectionManager:getClusterCertificateFromServer - thumbprint: ${PiiObfuscation.thumbprint(serverCertificate.fingerprint)}, CN: ${PiiObfuscation.commonName(serverCertificate.subject.CN)}`, null, debugLevel.info);
            // Node.js fingerprint uses colons (F8:39:ED:...) but Windows cert store needs plain hex (F839ED...)
            this.clusterCertificate.thumbprint = serverCertificate.fingerprint.replace(/:/g, '');
            this.clusterCertificate.commonName = serverCertificate.subject.CN;
        }
        else {
            SfUtility.outputLog('ClusterConnectionManager:getClusterCertificateFromServer:clusterCertificate:undefined', null, debugLevel.warn);
        }
    }

    /**
     * Ensure REST client is configured with endpoint and certificate (PEM) before making API calls.
     * For HTTPS clusters without cert info, discovers server cert via TLS handshake.
     * Retrieves PEM cert+key from local cert store if needed. Idempotent and concurrency-safe.
     */
    public async ensureRestClientReady(): Promise<void> {
        // Concurrency guard — if another call is already in progress, share that promise
        if (this._restClientReadyPromise) {
            return this._restClientReadyPromise;
        }
        this._restClientReadyPromise = this._doEnsureRestClientReady();
        try {
            await this._restClientReadyPromise;
        } finally {
            this._restClientReadyPromise = null;
        }
    }

    private async _doEnsureRestClientReady(): Promise<void> {
        const endpoint = this.clusterHttpEndpoint;
        if (!endpoint) {
            SfUtility.outputLog('ensureRestClientReady: no endpoint set', null, debugLevel.warn);
            return;
        }

        const isHttps = endpoint.toLowerCase().startsWith('https');

        if (isHttps && this.clusterCertificate) {
            // Step 1: If no thumbprint/CN yet, discover from server certificate via TLS handshake
            if (!this.clusterCertificate.thumbprint && !this.clusterCertificate.commonName) {
                try {
                    SfUtility.outputLog('ensureRestClientReady: No cert identity — discovering from server TLS handshake...', null, debugLevel.info);
                    await this.getClusterCertificateFromServer(endpoint);
                    SfUtility.outputLog(`ensureRestClientReady: Discovered thumbprint=${PiiObfuscation.thumbprint(this.clusterCertificate.thumbprint)}, CN=${this.clusterCertificate.commonName}`, null, debugLevel.info);
                } catch (tlsError) {
                    SfUtility.outputLog('ensureRestClientReady: Failed to discover server cert via TLS', tlsError, debugLevel.error);
                }
            }

            // Step 2: If we now have thumbprint/CN but no PEM, retrieve from local cert store
            if ((this.clusterCertificate.thumbprint || this.clusterCertificate.commonName)
                && (!this.clusterCertificate.certificate || !this.clusterCertificate.key)) {
                try {
                    const identifier = this.clusterCertificate.thumbprint ?? this.clusterCertificate.commonName!;
                    SfUtility.outputLog(`ensureRestClientReady: Retrieving PEM cert for ${PiiObfuscation.thumbprint(identifier)}`, null, debugLevel.info);
                    this.clusterCertificate.certificate = await this.sfPs.getPemCertFromLocalCertStore(identifier);
                    this.clusterCertificate.key = await this.sfPs.getPemKeyFromLocalCertStore(identifier);
                    SfUtility.outputLog('ensureRestClientReady: PEM cert+key retrieved', null, debugLevel.info);
                } catch (certError) {
                    SfUtility.outputLog('ensureRestClientReady: Failed to retrieve PEM cert', certError, debugLevel.error);
                    throw certError;
                }
            }
        }

        // Configure REST client with endpoint and cert (no network call)
        this.sfRest.configureClients(endpoint, this.clusterCertificate);
    }
}
