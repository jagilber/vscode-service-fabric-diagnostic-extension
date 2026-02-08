/**
 * Service for parsing and querying Service Fabric cluster manifests
 * Extracted from sfConfiguration.ts — handles XML→JSON conversion and manifest inspection
 */
import { SfUtility, debugLevel } from '../sfUtility';

/**
 * Manages cluster manifest parsing and inspection
 */
export class ManifestService {
    private xmlManifest = '';
    private jsonManifest = '';
    private jObjectManifest: Record<string, unknown> = {};
    private cachedIsNativeImageStore: boolean | null = null;

    /**
     * Get the JSON representation of the cluster manifest
     */
    public getJsonManifest(): string {
        return this.jsonManifest;
    }

    /**
     * Get the parsed manifest object for direct inspection
     */
    public getManifestObject(): Record<string, unknown> {
        return this.jObjectManifest;
    }

    /**
     * Set and parse the cluster manifest from XML or SDK response
     * Converts XML to JSON and caches the parsed object
     */
    public setManifest(xmlManifest: string | { manifest?: string }): void {
        if (typeof xmlManifest === 'string') {
            this.xmlManifest = xmlManifest;
        } else {
            this.xmlManifest = (xmlManifest as any).manifest; // ClusterManifest wrapper
        }
        SfUtility.outputLog(`xml manifest: \r\n${this.xmlManifest}`);

        const xmlConverter = require('xml-js');
        this.jsonManifest = xmlConverter.xml2json(this.xmlManifest, { compact: true, spaces: 2 });
        SfUtility.outputLog(`json manifest: \r\n${this.jsonManifest}`);
        this.jObjectManifest = JSON.parse(this.jsonManifest);

        // Clear cached image store check when manifest changes
        this.cachedIsNativeImageStore = null;
    }

    /**
     * Clear the image store cache (e.g., on refresh)
     */
    public clearCache(): void {
        this.cachedIsNativeImageStore = null;
    }

    /**
     * Check if the native image store service is available
     * The ImageStore REST API only works with fabric:ImageStore, not file-based stores
     * @returns true if using fabric:ImageStore, false for file-based stores
     */
    public isNativeImageStoreAvailable(): boolean {
        // Return cached result if available (no logging on cache hit)
        if (this.cachedIsNativeImageStore !== null) {
            return this.cachedIsNativeImageStore;
        }

        try {
            // Quick check: if manifest not populated yet, return false (will check again on refresh)
            if (!this.jObjectManifest || Object.keys(this.jObjectManifest).length === 0) {
                SfUtility.outputLog('Image store check: manifest not yet populated, returning false', null, debugLevel.debug);
                return false;
            }

            // Parse cluster manifest to get ImageStoreConnectionString
            const manifest = this.jObjectManifest as any;
            if (!manifest?.ClusterManifest?.FabricSettings?.Section) {
                this.cachedIsNativeImageStore = false;
                return false;
            }

            const sections = Array.isArray(manifest.ClusterManifest.FabricSettings.Section)
                ? manifest.ClusterManifest.FabricSettings.Section
                : [manifest.ClusterManifest.FabricSettings.Section];

            // Find Management section
            const managementSection = sections.find((s: any) =>
                s._attributes?.Name === 'Management'
            );

            if (!managementSection?.Parameter) {
                this.cachedIsNativeImageStore = false;
                return false;
            }

            const params = Array.isArray(managementSection.Parameter)
                ? managementSection.Parameter
                : [managementSection.Parameter];

            // Find ImageStoreConnectionString parameter
            const imageStoreParam = params.find((p: any) =>
                p._attributes?.Name === 'ImageStoreConnectionString'
            );

            const connectionString = imageStoreParam?._attributes?.Value || '';

            // Native image store uses "fabric:ImageStore"
            // File-based stores use "file:..." or "xstore:..."
            const isNative = connectionString.toLowerCase().startsWith('fabric:imagestore');

            // Only log on FIRST check (cache miss)
            SfUtility.outputLog(
                `Image store check (first time): ${connectionString} → ${isNative ? 'NATIVE' : 'FILE-BASED'}`,
                null,
                debugLevel.info
            );

            // Cache the result
            this.cachedIsNativeImageStore = isNative;
            return isNative;
        } catch (error) {
            SfUtility.outputLog('Failed to parse image store configuration', error, debugLevel.warn);
            this.cachedIsNativeImageStore = false;
            return false; // Default to hiding if we can't determine
        }
    }
}
