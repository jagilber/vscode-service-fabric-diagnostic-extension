/**
 * Utility for obfuscating Personally Identifiable Information (PII) in logs
 * while preserving enough information for diagnostics
 */
export class PiiObfuscation {
    /**
     * Obfuscate a certificate thumbprint showing first 4 and last 4 characters
     * Example: "1234567890ABCDEF" -> "1234...CDEF"
     */
    static thumbprint(thumbprint: string | undefined): string {
        if (!thumbprint) {
            return '[none]';
        }
        if (thumbprint.length <= 12) {
            // Too short to obfuscate meaningfully, show first 4 only
            return `${thumbprint.substring(0, 4)}...`;
        }
        return `${thumbprint.substring(0, 4)}...${thumbprint.substring(thumbprint.length - 4)}`;
    }

    /**
     * Obfuscate an endpoint/URL showing protocol and last part of domain
     * Example: "https://cluster.region.cloudapp.azure.com:19080" -> "https://***.***.cloudapp.azure.com:19080"
     */
    static endpoint(endpoint: string | undefined): string {
        if (!endpoint) {
            return '[none]';
        }
        try {
            const url = new URL(endpoint);
            const hostParts = url.hostname.split('.');
            if (hostParts.length > 2) {
                // Mask middle parts, keep last two domains
                const masked = hostParts.map((part, i) => 
                    i < hostParts.length - 2 ? '***' : part
                ).join('.');
                return `${url.protocol}//${masked}${url.port ? ':' + url.port : ''}`;
            }
            // Short domain, just mask first part
            return `${url.protocol}//***${url.port ? ':' + url.port : ''}`;
        } catch {
            // If parsing fails, mask middle portion
            if (endpoint.includes('://')) {
                const parts = endpoint.split('://');
                const afterProtocol = parts[1];
                if (afterProtocol && afterProtocol.length > 16) {
                    return `${parts[0]}://${afterProtocol.substring(0, 4)}...${afterProtocol.substring(afterProtocol.length - 8)}`;
                }
            }
            return endpoint.length > 16 ? `${endpoint.substring(0, 8)}...${endpoint.substring(endpoint.length - 8)}` : '***';
        }
    }

    /**
     * Obfuscate a certificate showing only the type and length
     * Example: Full PEM cert -> "[PEM Certificate: 1234 chars]"
     */
    static certificate(cert: string | Buffer | undefined): string {
        if (!cert) {
            return '[none]';
        }
        const length = typeof cert === 'string' ? cert.length : cert.length;
        const type = typeof cert === 'string' 
            ? (cert.includes('BEGIN CERTIFICATE') ? 'PEM' : cert.includes('MII') ? 'Base64' : 'String')
            : 'Buffer';
        return `[${type} Certificate: ${length} chars]`;
    }

    /**
     * Obfuscate a common name showing first word and length
     * Example: "cluster.region.cloudapp.azure.com" -> "cluster.***[28 chars]"
     */
    static commonName(name: string | undefined): string {
        if (!name) {
            return '[none]';
        }
        if (name.length <= 12) {
            return name; // Too short to obfuscate
        }
        const firstPart = name.split('.')[0] || name.substring(0, 6);
        return `${firstPart}.***[${name.length} chars]`;
    }

    /**
     * Obfuscate a connection string showing only non-sensitive parts
     * Example: "AccountName=xxx;AccountKey=yyyy" -> "AccountName=***;AccountKey=***"
     */
    static connectionString(connStr: string | undefined): string {
        if (!connStr) {
            return '[none]';
        }
        // Replace values after = signs
        return connStr.replace(/=([^;]+)/g, '=***');
    }

    /**
     * Obfuscate an API key showing first 8 characters only
     * Example: "sk-1234567890abcdef" -> "sk-12345...***"
     */
    static apiKey(key: string | undefined): string {
        if (!key) {
            return '[none]';
        }
        if (key.length <= 12) {
            return `${key.substring(0, 4)}...***`;
        }
        return `${key.substring(0, 8)}...***`;
    }

    /**
     * Obfuscate a node name keeping type info
     * Example: "_Node_0" -> "_Node_X" or "_nt0vm_5" -> "_nt0vm_X"
     */
    static nodeName(name: string | undefined): string {
        if (!name) {
            return '[none]';
        }
        // Keep node type prefix, mask instance number
        return name.replace(/\d+$/, 'X');
    }

    /**
     * Obfuscate an application name showing type only
     * Example: "fabric:/MyApp_Production_v2" -> "fabric:/MyApp_***"
     */
    static applicationName(name: string | undefined): string {
        if (!name) {
            return '[none]';
        }
        if (name.startsWith('fabric:/')) {
            const appName = name.substring(8);
            const parts = appName.split('_');
            if (parts.length > 1) {
                return `fabric:/${parts[0]}_***`;
            }
            return name; // Single word app name, keep as is
        }
        return name;
    }

    /**
     * Generic PII obfuscation - shows first and last few characters
     */
    static generic(value: string | undefined, showLength: number = 4): string {
        if (!value) {
            return '[none]';
        }
        if (value.length <= showLength * 2 + 3) {
            return '***';
        }
        return `${value.substring(0, showLength)}...${value.substring(value.length - showLength)}`;
    }
}
