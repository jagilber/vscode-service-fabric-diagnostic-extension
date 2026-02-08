/**
 * Live Cluster Fixture Capture Script
 * 
 * Connects to a live Service Fabric cluster, fetches all REST API endpoints,
 * applies PII scrubbing, and saves the data as fixture files compatible with
 * the fixture loader and mock server.
 * 
 * Usage:
 *   npx tsc scripts/capture-cluster-fixtures.ts --outDir temp/capture --esModuleInterop --resolveJsonModule --target ES2020 --module commonjs --moduleResolution node --skipLibCheck
 *   node temp/capture/capture-cluster-fixtures.js https://mycluster:19080 my-profile-name
 * 
 * Or via npm script:
 *   npm run capture-fixtures -- https://mycluster:19080 my-profile-name
 * 
 * The captured data will be saved under test/fixtures/clusters/{profile-name}/
 * with all PII scrubbed for safe storage in version control.
 */

import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import * as crypto from 'crypto';

// ── Types ───────────────────────────────────────────────────────────

interface CaptureOptions {
    endpoint: string;
    profileName: string;
    outputDir: string;
    certFile?: string;
    keyFile?: string;
    timeout?: number;
    verbose?: boolean;
}

// ── PII Scrubbing ───────────────────────────────────────────────────

/**
 * In-place PII scrubber for captured SF REST responses.
 * Modifies data to remove personal/identifiable information while
 * preserving structural integrity for testing.
 */
class PiiScrubber {
    private ipCounter = 1;
    private ipMap = new Map<string, string>();
    private thumbprintMap = new Map<string, string>();
    private domainMap = new Map<string, string>();

    /**
     * Scrub PII from any value (recursive for objects/arrays)
     */
    scrub(data: any): any {
        if (data === null || data === undefined) {
            return data;
        }
        if (typeof data === 'string') {
            return this.scrubString(data);
        }
        if (Array.isArray(data)) {
            return data.map(item => this.scrub(item));
        }
        if (typeof data === 'object') {
            return this.scrubObject(data);
        }
        return data;
    }

    private scrubObject(obj: any): any {
        const result: any = {};
        for (const [key, value] of Object.entries(obj)) {
            const lowerKey = key.toLowerCase();

            // Keys that contain sensitive data
            if (lowerKey.includes('thumbprint') || lowerKey.includes('certificate')) {
                result[key] = typeof value === 'string' ? this.scrubThumbprint(value) : value;
            } else if (lowerKey === 'ipaddressorfqdn' || lowerKey === 'address') {
                result[key] = typeof value === 'string' ? this.scrubIpOrAddress(value) : this.scrub(value);
            } else if (lowerKey.includes('endpoint') && typeof value === 'string' && value.includes('://')) {
                result[key] = this.scrubEndpoint(value);
            } else if (lowerKey === 'clientconnectionendpoint' || lowerKey === 'httpgatewayendpoint') {
                result[key] = typeof value === 'string' ? this.scrubEndpoint(value) : this.scrub(value);
            } else {
                result[key] = this.scrub(value);
            }
        }
        return result;
    }

    private scrubString(str: string): string {
        // Scrub embedded JSON in address fields (replica addresses)
        if (str.startsWith('{') && str.includes('Endpoints')) {
            try {
                const parsed = JSON.parse(str);
                const scrubbed = this.scrub(parsed);
                return JSON.stringify(scrubbed);
            } catch {
                // Not parseable JSON — fall through
            }
        }

        // Scrub IP addresses in strings
        str = str.replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, (ip) => this.scrubIp(ip));

        // Scrub domain names that look like Azure FQDNs
        str = str.replace(/[a-z0-9-]+\.(?:[a-z0-9-]+\.)*(?:cloudapp\.azure\.com|azureedge\.net|windows\.net)/gi, (domain) => {
            return this.scrubDomain(domain);
        });

        return str;
    }

    private scrubIp(ip: string): string {
        if (!this.ipMap.has(ip)) {
            const idx = this.ipCounter++;
            this.ipMap.set(ip, `10.0.0.${idx}`);
        }
        return this.ipMap.get(ip)!;
    }

    private scrubIpOrAddress(value: string): string {
        // Could be IP, FQDN, or hostname
        if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value)) {
            return this.scrubIp(value);
        }
        return this.scrubDomain(value);
    }

    private scrubEndpoint(endpoint: string): string {
        try {
            const parsed = new URL(endpoint);
            const scrubbedHost = this.scrubIpOrAddress(parsed.hostname);
            return `${parsed.protocol}//${scrubbedHost}${parsed.port ? ':' + parsed.port : ''}${parsed.pathname}`;
        } catch {
            return this.scrubString(endpoint);
        }
    }

    private scrubThumbprint(thumbprint: string): string {
        if (!this.thumbprintMap.has(thumbprint)) {
            const hash = crypto.createHash('sha256').update(thumbprint).digest('hex').substring(0, thumbprint.length);
            this.thumbprintMap.set(thumbprint, hash.toUpperCase());
        }
        return this.thumbprintMap.get(thumbprint)!;
    }

    private scrubDomain(domain: string): string {
        if (!this.domainMap.has(domain)) {
            const parts = domain.split('.');
            // Keep the TLD structure, replace the specific identifiers
            if (parts.length > 2) {
                parts[0] = `host${this.domainMap.size + 1}`;
                this.domainMap.set(domain, parts.join('.'));
            } else {
                this.domainMap.set(domain, `host${this.domainMap.size + 1}.local`);
            }
        }
        return this.domainMap.get(domain)!;
    }
}

// ── HTTP Client ─────────────────────────────────────────────────────

async function fetchSfApi(endpoint: string, apiPath: string, options: CaptureOptions, apiVersion: string = '6.0'): Promise<any> {
    const parsedUrl = url.parse(endpoint);
    const isHttps = parsedUrl.protocol === 'https:';
    const separator = apiPath.includes('?') ? '&' : '?';
    const fullPath = `${apiPath}${separator}api-version=${apiVersion}&timeout=60`;

    const reqOptions: https.RequestOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port ? parseInt(parsedUrl.port) : (isHttps ? 443 : 19080),
        path: fullPath,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        rejectUnauthorized: false,
        timeout: options.timeout || 30000,
    };

    // Certificate auth
    if (options.certFile && options.keyFile) {
        reqOptions.cert = fs.readFileSync(options.certFile);
        reqOptions.key = fs.readFileSync(options.keyFile);
    }

    return new Promise<any>((resolve, reject) => {
        const requestModule = isHttps ? https : http;
        const chunks: Buffer[] = [];

        const req = requestModule.request(reqOptions, (res) => {
            res.on('data', (chunk: Buffer) => chunks.push(chunk));
            res.on('end', () => {
                const body = Buffer.concat(chunks as any).toString('utf-8');
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(body));
                    } catch {
                        resolve(body);
                    }
                } else {
                    if (options.verbose) {
                        console.warn(`  ⚠ ${res.statusCode} for ${apiPath}`);
                    }
                    resolve(undefined);
                }
            });
        });

        req.on('error', (err) => {
            if (options.verbose) {
                console.warn(`  ✗ Error fetching ${apiPath}: ${err.message}`);
            }
            resolve(undefined);
        });

        req.on('timeout', () => {
            req.destroy();
            resolve(undefined);
        });

        req.end();
    });
}

// ── Unwrap response ─────────────────────────────────────────────────

function unwrapItems(response: any): any[] {
    if (!response) { return []; }
    if (Array.isArray(response)) { return response; }
    if (response.Items) { return response.Items; }
    if (response.items) { return response.items; }
    return [];
}

// ── Capture Logic ───────────────────────────────────────────────────

async function captureCluster(options: CaptureOptions): Promise<void> {
    const scrubber = new PiiScrubber();
    const outputDir = options.outputDir;

    fs.mkdirSync(outputDir, { recursive: true });
    fs.mkdirSync(path.join(outputDir, 'services'), { recursive: true });
    fs.mkdirSync(path.join(outputDir, 'partitions'), { recursive: true });
    fs.mkdirSync(path.join(outputDir, 'replicas'), { recursive: true });
    fs.mkdirSync(path.join(outputDir, 'manifests'), { recursive: true });

    const write = (filename: string, data: any) => {
        const scrubbed = scrubber.scrub(data);
        fs.writeFileSync(path.join(outputDir, filename), JSON.stringify(scrubbed, null, 2) + '\n');
        if (options.verbose) {
            console.log(`  ✓ ${filename}`);
        }
    };

    console.log(`Capturing cluster data from ${options.endpoint}...`);

    // ── Cluster-level endpoints ──
    const clusterHealth = await fetchSfApi(options.endpoint, '/$/GetClusterHealth', options);
    if (clusterHealth) { write('cluster-health.json', clusterHealth); }

    const clusterVersion = await fetchSfApi(options.endpoint, '/$/GetClusterVersion', options);
    if (clusterVersion) { write('cluster-version.json', clusterVersion); }

    const clusterManifest = await fetchSfApi(options.endpoint, '/$/GetClusterManifest', options);
    if (clusterManifest) { write('cluster-manifest.json', clusterManifest); }

    const clusterLoad = await fetchSfApi(options.endpoint, '/$/GetClusterLoad', options);
    if (clusterLoad) { write('cluster-load.json', clusterLoad); }

    // ── Nodes ──
    const nodesRaw = await fetchSfApi(options.endpoint, '/Nodes', options);
    const nodes = unwrapItems(nodesRaw);
    write('nodes.json', nodes);

    // ── Repair tasks ──
    const repairTasks = await fetchSfApi(options.endpoint, '/$/GetRepairTaskList', options);
    write('repair-tasks.json', repairTasks || []);

    // ── Application types ──
    const appTypesRaw = await fetchSfApi(options.endpoint, '/ApplicationTypes', options);
    const appTypes = unwrapItems(appTypesRaw);
    write('application-types.json', appTypes);

    // ── Application manifests ──
    for (const appType of appTypes) {
        const typeName = appType.Name || appType.name;
        const typeVer = appType.Version || appType.version;
        if (typeName && typeVer) {
            const manifest = await fetchSfApi(
                options.endpoint,
                `/ApplicationTypes/${typeName}/$/GetApplicationManifest?ApplicationTypeVersion=${typeVer}`,
                options
            );
            if (manifest) {
                const manifestXml = typeof manifest === 'string' ? manifest : manifest.Manifest || manifest.manifest || '';
                const scrubbedXml = scrubber.scrub(manifestXml);
                fs.writeFileSync(
                    path.join(outputDir, 'manifests', `app-${typeName}.xml`),
                    typeof scrubbedXml === 'string' ? scrubbedXml : JSON.stringify(scrubbedXml, null, 2)
                );
            }
        }
    }

    // ── Applications (non-system) ──
    const appsRaw = await fetchSfApi(options.endpoint, '/Applications', options);
    const apps = unwrapItems(appsRaw);
    write('applications.json', apps);

    // ── System services ──
    const systemServicesRaw = await fetchSfApi(options.endpoint, '/Applications/System/$/GetServices', options);
    const systemServices = unwrapItems(systemServicesRaw);
    write('system-services.json', systemServices);

    // ── Per-application services, partitions, replicas ──
    for (const app of apps) {
        const appId = app.Id || app.id;
        if (!appId) { continue; }

        console.log(`  Capturing services for ${appId}...`);

        const servicesRaw = await fetchSfApi(
            options.endpoint,
            `/Applications/${appId}/$/GetServices`,
            options
        );
        const services = unwrapItems(servicesRaw);
        write(`services/${appId}.json`, services);

        for (const svc of services) {
            const svcId = svc.Id || svc.id;
            if (!svcId) { continue; }

            const partitionsRaw = await fetchSfApi(
                options.endpoint,
                `/Services/${svcId}/$/GetPartitions`,
                options
            );
            const partitions = unwrapItems(partitionsRaw);
            const safeServiceId = svcId.replace(/\//g, '_');
            write(`partitions/${safeServiceId}.json`, partitions);

            for (const partition of partitions) {
                const partId = partition.PartitionInformation?.Id || partition.partitionInformation?.id;
                if (!partId) { continue; }

                const replicasRaw = await fetchSfApi(
                    options.endpoint,
                    `/Partitions/${partId}/$/GetReplicas`,
                    options
                );
                const replicas = unwrapItems(replicasRaw);
                write(`replicas/${partId}.json`, replicas);
            }
        }
    }

    // ── Image store (optional, may fail on Azure clusters) ──
    const imageStore = await fetchSfApi(options.endpoint, '/ImageStore', options);
    write('image-store.json', imageStore || { StoreFiles: [], StoreFolders: [] });

    console.log(`\n✓ Capture complete → ${outputDir}`);
}

// ── CLI entry point ─────────────────────────────────────────────────

if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.log(`Usage: node capture-cluster-fixtures.js <endpoint> <profile-name> [--cert <path>] [--key <path>] [--verbose]`);
        console.log(`\nExamples:`);
        console.log(`  node capture-cluster-fixtures.js http://localhost:19080 local-dev`);
        console.log(`  node capture-cluster-fixtures.js https://mycluster.eastus.cloudapp.azure.com:19080 azure-prod --cert cert.pem --key key.pem`);
        process.exit(1);
    }

    const endpoint = args[0];
    const profileName = args[1];
    const verbose = args.includes('--verbose');

    let certFile: string | undefined;
    let keyFile: string | undefined;
    const certIdx = args.indexOf('--cert');
    if (certIdx >= 0 && args[certIdx + 1]) {
        certFile = args[certIdx + 1];
    }
    const keyIdx = args.indexOf('--key');
    if (keyIdx >= 0 && args[keyIdx + 1]) {
        keyFile = args[keyIdx + 1];
    }

    const outputDir = path.resolve(__dirname, '..', 'test', 'fixtures', 'clusters', profileName);

    captureCluster({
        endpoint,
        profileName,
        outputDir,
        certFile,
        keyFile,
        verbose,
    }).catch((err) => {
        console.error('Capture failed:', err);
        process.exit(1);
    });
}
