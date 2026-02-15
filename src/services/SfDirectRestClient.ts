/**
 * Direct REST client for Service Fabric APIs
 * 
 * This client bypasses the Azure SDK and makes direct HTTP/HTTPS calls to the Service Fabric REST API.
 * It handles several important quirks and inconsistencies in the Service Fabric API.
 * 
 * **Why Direct REST Instead of Azure SDK:**
 * - Lighter weight (no SDK dependencies)
 * - Better control over requests/responses
 * - Easier debugging with raw HTTP logs
 * - Avoids SDK version compatibility issues
 * 
 * **CRITICAL API QUIRKS** (full details in ARCHITECTURE.md):
 * 
 * 1. **PascalCase vs lowercase**: Direct REST API returns PascalCase properties (Id, Name, TypeName)
 *    while Azure SDK normalizes them to lowercase (id, name, typeName). This client normalizes
 *    all responses to lowercase for consistency.
 * 
 * 2. **API Version Requirements**:
 *    - Management APIs (nodes, apps, services): api-version=6.0
 *    - EventStore APIs: api-version=6.4 (verified 2026-02-03)
 *    Using wrong version causes HTTP 400 errors.
 * 
 * 3. **Response Structure Variations**: Some APIs return direct arrays `[...]`, others return
 *    wrapped objects `{items:[...]}` or `{Items:[...]}` (capitalized). This client handles all formats.
 * 
 * 4. **Endpoint Protocol**: Node.js url.parse() requires protocol (https:// or http://).
 *    Constructor auto-prepends https:// if missing.
 * 
 * @see ARCHITECTURE.md "Service Fabric REST API Quirks & Workarounds" for complete documentation
 * @verified 2026-02-03
 */
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as https from 'https';
import * as http from 'http';
import * as tls from 'tls';
import * as url from 'url';
import { SfUtility, debugLevel } from '../sfUtility';
import { HttpError, NetworkError } from '../models/Errors';
import { SfApiResponse } from '../models/SfApiResponse';
import { PiiObfuscation } from '../utils/PiiObfuscation';
import { SfConstants } from '../sfConstants';

export interface SfRestOptions {
    endpoint: string;
    apiVersion?: string;
    timeout?: number;
    certificate?: string | Buffer;
    key?: Buffer;
}

export interface SfNodeInfo {
    Name: string;
    IpAddressOrFQDN: string;
    Type: string;
    CodeVersion: string;
    ConfigVersion: string;
    NodeStatus: string;
    NodeUpTimeInSeconds: string;
    HealthState: string;
    IsSeedNode: boolean;
    UpgradeDomain: string;
    FaultDomain: string;
    Id?: { Id: string };
    InstanceId?: string;
    NodeDeactivationInfo?: {
        DeactivationIntent: string;
        Status: string;
        DeactivationTasks?: any[];
        PendingSafetyChecks?: any[];
    };
    // Aliases for backward compatibility and easier access
    name?: string;
    ipAddressOrFQDN?: string;
    type?: string;
    codeVersion?: string;
    configVersion?: string;
    nodeStatus?: string;
    nodeUpTimeInSeconds?: string;
    healthState?: string;
    isSeedNode?: boolean;
    upgradeDomain?: string;
    faultDomain?: string;
    id?: { id: string };
    instanceId?: string;
    nodeDeactivationInfo?: {
        intent: string;
        status: string;
        tasks?: any[];
        pendingSafetyChecks?: any[];
    };
}

export interface SfClusterHealth {
    aggregatedHealthState: string;
    nodeHealthStates?: any[];
    applicationHealthStates?: any[];
    healthEvents?: any[];
    unhealthyEvaluations?: any[];
    healthStatistics?: any;
}

/**
 * Direct REST client - no Azure SDK wrapper
 */
export class SfDirectRestClient {
    private endpoint: string;
    private apiVersion: string;
    private timeout: number;
    private certificate?: string | Buffer;
    private key?: Buffer;
    private httpsAgent?: https.Agent;

    constructor(options: SfRestOptions) {
        // Ensure endpoint has protocol
        let endpoint = options.endpoint;
        if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
            endpoint = 'https://' + endpoint;
        }
        this.endpoint = endpoint;
        this.apiVersion = options.apiVersion || '6.0';
        this.timeout = options.timeout || SfConstants.getTimeoutMs();
        this.certificate = options.certificate;
        this.key = options.key;

        // Create a dedicated HTTPS agent that bypasses VS Code's proxy-patched globalAgent.
        // keepAlive: true reuses TCP+TLS connections across requests, avoiding the ~400ms
        // per-request overhead of TCP connect + TLS handshake (critical for parallel uploads
        // of 100-700+ files). maxSockets caps concurrent connections to the gateway.
        const parsedEndpoint = url.parse(this.endpoint);
        if (parsedEndpoint.protocol === 'https:') {
            this.httpsAgent = new https.Agent({
                cert: this.certificate,
                key: this.key,
                rejectUnauthorized: false,
                keepAlive: true,
                maxSockets: 8,
                maxFreeSockets: 8,
            });
        }

        SfUtility.outputLog(`SfDirectRestClient initialized: ${PiiObfuscation.endpoint(this.endpoint)}`, null, debugLevel.info);
    }

    /**
     * Make HTTP/HTTPS request directly
     * @param method HTTP method
     * @param path API path
     * @param body Optional request body
     * @param apiVersionOverride Optional API version override (defaults to this.apiVersion)
     * @param customHeaders Optional custom headers
     * @param timeoutMs Optional per-request timeout in ms (defaults to this.timeout)
     */
    private async makeRequest<T>(method: string, path: string, body?: any, apiVersionOverride?: string, customHeaders?: Record<string, string>, timeoutMs?: number): Promise<T> {
        const parsedUrl = url.parse(this.endpoint);
        const isHttps = parsedUrl.protocol === 'https:';
        
        // Validate endpoint is set correctly
        if (!parsedUrl.hostname) {
            SfUtility.outputLog(`❌ Invalid endpoint format: ${PiiObfuscation.endpoint(this.endpoint)}`, null, debugLevel.error);
            SfUtility.outputLog(`Parsed URL: protocol=${parsedUrl.protocol}, hostname=${parsedUrl.hostname ? PiiObfuscation.generic(parsedUrl.hostname) : '[none]'}, port=${parsedUrl.port}`, null, debugLevel.error);
            throw new Error(`Invalid endpoint - hostname not found. Endpoint must include protocol (https:// or http://)`);
        }
        
        // Add api-version and timeout to path
        const separator = path.includes('?') ? '&' : '?';
        const requestApiVersion = apiVersionOverride || this.apiVersion;
        const effectiveTimeoutMs = timeoutMs || this.timeout;
        const timeoutSec = Math.round(effectiveTimeoutMs / 1000);
        const fullPath = `${path}${separator}api-version=${requestApiVersion}&timeout=${timeoutSec}`;

        const isBinaryBody = Buffer.isBuffer(body);
        const options: https.RequestOptions = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port ? parseInt(parsedUrl.port) : (isHttps ? 443 : 19080),
            path: fullPath,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...customHeaders,
            },
            rejectUnauthorized: false
        };

        // Use dedicated HTTPS agent to bypass VS Code's proxy-patched globalAgent
        if (isHttps && this.httpsAgent) {
            options.agent = this.httpsAgent;
        }

        // Add certificate auth if provided (also needed when agent doesn't carry certs)
        if (this.certificate && this.key) {
            options.cert = this.certificate;
            options.key = this.key;
        }

        // For binary uploads, set Content-Length and Expect: 100-continue.
        // The SF HTTP Gateway (HTTP.sys) uses lazy client-cert negotiation: the initial
        // TLS handshake completes WITHOUT requesting the client certificate. Only after
        // HTTP.sys sees the request headers does it trigger a TLS renegotiation to request
        // the cert. Without Expect: 100-continue, the client sends headers+body immediately
        // and the large body data blocks the TLS renegotiation, causing an infinite hang.
        // With Expect: 100-continue, headers are sent first, the server renegotiates TLS,
        // confirms the client cert, sends "100 Continue", and THEN the body is sent.
        if (isBinaryBody) {
            options.headers!['Content-Length'] = body.length;
            options.headers!['Expect'] = '100-continue';
        }

        const logUrl = `${parsedUrl.protocol}//${options.hostname}:${options.port}${fullPath}`;
        const obfuscatedUrl = `${parsedUrl.protocol}//${PiiObfuscation.generic(options.hostname || '')}:${options.port}${path.includes('?') ? path.substring(0, path.indexOf('?')) : path}?api-version=${requestApiVersion}`;
        SfUtility.outputLog(`🌐 ${method} ${obfuscatedUrl}`, null, debugLevel.info);
        const startTime = Date.now();

        return new Promise<T>((resolve, reject) => {
            const requestModule = isHttps ? https : http;
            const chunks: Buffer[] = [];
            let requestCompleted = false;
            let requestAborted = false;

            const req = requestModule.request(options, (res) => {
                SfUtility.outputLog(`📥 Response headers received: ${res.statusCode} ${res.statusMessage}`, null, debugLevel.info);

                res.on('data', (chunk: Buffer) => {
                    chunks.push(chunk);
                });

                res.on('end', () => {
                    if (requestAborted || requestCompleted) {
                        return; // Already handled
                    }
                    requestCompleted = true;
                    
                    const responseBody = chunks.length > 0 ? Buffer.concat(chunks as any).toString('utf-8') : '';
                    const durationMs = Date.now() - startTime;

                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        // Log success via base response class
                        SfApiResponse.fromDirectSuccess(method, path, res.statusCode, responseBody, durationMs, logUrl).log();

                        // Success - parse JSON if body exists
                        if (responseBody && res.statusCode !== 204) {
                            try {
                                const parsed = JSON.parse(responseBody);
                                resolve(parsed as T);
                            } catch (e) {
                                // Not JSON, return as string
                                resolve(responseBody as any);
                            }
                        } else {
                            // No content or 204 No Content
                            resolve(undefined as any);
                        }
                    } else {
                        // Log error via base response class
                        SfApiResponse.fromDirectError(method, path, res.statusCode || 0, res.statusMessage || '', responseBody, durationMs, logUrl).log();

                        // Error response
                        const error = new HttpError(
                            `HTTP ${res.statusCode}: ${res.statusMessage}`,
                            {
                                status: res.statusCode || 0,
                                url: logUrl,
                                body: responseBody
                            } as any
                        );
                        reject(error);
                    }
                });

                res.on('error', (err) => {
                    if (requestAborted || requestCompleted) {
                        return; // Already handled
                    }
                    requestCompleted = true;
                    SfUtility.outputLog(`❌ Response error: ${err.message}`, err, debugLevel.error);
                    reject(new NetworkError('Response error', { cause: err }));
                });
            });

            req.on('error', (err) => {
                if (requestAborted || requestCompleted) {
                    return; // Already handled
                }
                requestCompleted = true;
                SfUtility.outputLog(`❌ Request error: ${err.message}`, err, debugLevel.error);
                reject(new NetworkError('Request error', { cause: err }));
            });

            req.on('timeout', () => {
                if (requestAborted || requestCompleted) {
                    return; // Already handled
                }
                requestAborted = true;
                req.destroy();
                SfUtility.outputLog(`❌ Request timeout after ${effectiveTimeoutMs}ms`, null, debugLevel.error);
                reject(new NetworkError('Request timeout', { cause: new Error(`Timeout after ${effectiveTimeoutMs}ms`) }));
            });

            req.setTimeout(effectiveTimeoutMs);

            // Socket-level diagnostic logging
            req.on('socket', (socket) => {
                const tlsSock = socket as tls.TLSSocket;
                SfUtility.outputLog(`🔌 Socket assigned (connecting=${socket.connecting})`, null, debugLevel.info);

                socket.on('connect', () => {
                    SfUtility.outputLog(`🔌 TCP connected to ${PiiObfuscation.generic(options.hostname || '')}:${options.port}`, null, debugLevel.info);
                });

                if (typeof tlsSock.on === 'function') {
                    tlsSock.on('secureConnect', () => {
                        SfUtility.outputLog(`🔒 TLS handshake complete (authorized=${tlsSock.authorized}, protocol=${tlsSock.getProtocol?.()})`, null, debugLevel.info);
                    });
                }

                socket.on('error', (err) => {
                    if (requestAborted || requestCompleted) {
                        return; // Already handled
                    }
                    requestCompleted = true;
                    SfUtility.outputLog(`❌ Socket error: ${err.message}`, err, debugLevel.error);
                    reject(new NetworkError('Socket error', { cause: err }));
                });

                socket.on('close', (hadError) => {
                    SfUtility.outputLog(`🔌 Socket closed (hadError=${hadError}, bytesWritten=${socket.bytesWritten})`, null, debugLevel.info);
                    // Do NOT reject here. With keepAlive, sockets are reused across requests.
                    // A close event here may be for a pooled socket being recycled.
                    // The timeout handler provides safety for truly dead connections.
                });
            });

            // Send body if provided
            if (body) {
                if (isBinaryBody) {
                    SfUtility.outputLog(`📤 Sending <binary ${body.length} bytes> (waiting for 100-continue)`, null, debugLevel.info);
                    // With Expect: 100-continue, Node.js sends only the headers first.
                    // The server completes TLS renegotiation (client cert request), then
                    // sends "100 Continue". Node.js fires the 'continue' event, and we
                    // send the body. This prevents TLS renegotiation deadlock.
                    req.on('continue', () => {
                        SfUtility.outputLog(`📤 100-continue received, sending body (${body.length} bytes)`, null, debugLevel.info);
                        req.end(body);
                    });
                } else {
                    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
                    SfUtility.outputLog(`📤 Request body: ${bodyStr}`, null, debugLevel.info);
                    req.setHeader('Content-Length', Buffer.byteLength(bodyStr));
                    req.end(bodyStr);
                }
            } else {
                req.end();
            }
        }).catch((error) => {
            // Wrap any unhandled errors with context
            SfUtility.outputLog(`❌ makeRequest failed for ${method} ${logUrl}`, error, debugLevel.error);
            throw error;
        });
    }

    /**
     * Normalize SF REST paged responses: the API returns { Items: [...] } (PascalCase)
     * but callers expect { items: [...] } (camelCase). Also handles plain arrays.
     */
    private unwrapPagedResponse<T>(result: any): { items: T[] } {
        if (Array.isArray(result)) {
            return { items: result };
        }
        const items = result?.Items || result?.items || [];
        return { items };
    }

    // ==================== NODE APIs ====================

    async getNodeInfo(nodeName: string): Promise<SfNodeInfo> {
        return this.makeRequest<SfNodeInfo>('GET', `/Nodes/${nodeName}`);
    }

    async getNodeInfoList(): Promise<{ items: SfNodeInfo[] }> {
        const result = await this.makeRequest<any>('GET', '/Nodes');
        return this.unwrapPagedResponse<SfNodeInfo>(result);
    }

    async enableNode(nodeName: string): Promise<void> {
        return this.makeRequest<void>('POST', `/Nodes/${nodeName}/$/Activate`);
    }

    async disableNode(nodeName: string, deactivationIntent: string): Promise<void> {
        // Service Fabric REST API expects the intent as the body parameter
        return this.makeRequest<void>('POST', `/Nodes/${nodeName}/$/Deactivate`, {
            DeactivationIntent: deactivationIntent
        });
    }

    async restartNode(nodeName: string, nodeInstanceId: string): Promise<void> {
        const body = {
            NodeInstanceId: nodeInstanceId
        };
        return this.makeRequest<void>('POST', `/Nodes/${nodeName}/$/Restart`, body);
    }

    async removeNodeState(nodeName: string): Promise<void> {
        return this.makeRequest<void>('POST', `/Nodes/${nodeName}/$/RemoveNodeState`);
    }

    async getNodeHealth(nodeName: string): Promise<any> {
        return this.makeRequest<any>('GET', `/Nodes/${nodeName}/$/GetHealth`);
    }

    // ==================== CLUSTER APIs ====================

    async getClusterVersion(): Promise<{ version: string }> {
        return this.makeRequest<{ version: string }>('GET', '/$/GetClusterVersion');
    }

    async getClusterHealth(): Promise<SfClusterHealth> {
        return this.makeRequest<SfClusterHealth>('GET', '/$/GetClusterHealth');
    }

    async getClusterManifest(): Promise<{ manifest: string }> {
        return this.makeRequest<{ manifest: string }>('GET', '/$/GetClusterManifest');
    }

    // ==================== APPLICATION APIs ====================

    async getApplicationInfoList(): Promise<{ items: any[] }> {
        const result = await this.makeRequest<any>('GET', '/Applications');
        return this.unwrapPagedResponse(result);
    }

    async getApplicationInfo(applicationId: string): Promise<any> {
        return this.makeRequest<any>('GET', `/Applications/${applicationId}`);
    }

    async getApplicationHealth(applicationId: string): Promise<any> {
        return this.makeRequest<any>('GET', `/Applications/${applicationId}/$/GetHealth`);
    }

    async getApplicationTypeInfoList(): Promise<{ items: any[] }> {
        const result = await this.makeRequest<any>('GET', '/ApplicationTypes');
        return this.unwrapPagedResponse(result);
    }

    async getApplicationManifest(applicationTypeName: string, applicationTypeVersion: string): Promise<any> {
        return this.makeRequest<any>('GET', `/ApplicationTypes/${applicationTypeName}/$/GetApplicationManifest?ApplicationTypeVersion=${applicationTypeVersion}`);
    }

    // ==================== SERVICE APIs ====================

    async getServiceInfoList(applicationId: string): Promise<{ items: any[] }> {
        const result = await this.makeRequest<any>('GET', `/Applications/${applicationId}/$/GetServices`);
        return this.unwrapPagedResponse(result);
    }

    async getServiceInfo(applicationId: string, serviceId: string): Promise<any> {
        return this.makeRequest<any>('GET', `/Applications/${applicationId}/$/GetServices/${serviceId}`);
    }

    async getServiceHealth(serviceId: string): Promise<any> {
        return this.makeRequest<any>('GET', `/Services/${serviceId}/$/GetHealth`);
    }

    async getServiceTypeInfoList(applicationTypeName: string, applicationTypeVersion: string): Promise<any[]> {
        return this.makeRequest<any[]>('GET', `/ApplicationTypes/${applicationTypeName}/$/GetServiceTypes?ApplicationTypeVersion=${applicationTypeVersion}`);
    }

    async getServiceManifest(applicationTypeName: string, applicationTypeVersion: string, serviceManifestName: string): Promise<any> {
        return this.makeRequest<any>('GET', `/ApplicationTypes/${applicationTypeName}/$/GetServiceManifest?ApplicationTypeVersion=${applicationTypeVersion}&ServiceManifestName=${serviceManifestName}`);
    }

    // ==================== PARTITION & REPLICA APIs ====================

    async getPartitionInfoList(serviceId: string): Promise<{ items: any[] }> {
        const result = await this.makeRequest<any>('GET', `/Services/${serviceId}/$/GetPartitions`);
        return this.unwrapPagedResponse(result);
    }

    async getReplicaInfoList(partitionId: string): Promise<{ items: any[] }> {
        const result = await this.makeRequest<any>('GET', `/Partitions/${partitionId}/$/GetReplicas`);
        return this.unwrapPagedResponse(result);
    }

    async getPartitionHealth(partitionId: string): Promise<any> {
        return this.makeRequest<any>('GET', `/Partitions/${partitionId}/$/GetHealth`);
    }

    async getReplicaHealth(partitionId: string, replicaId: string): Promise<any> {
        return this.makeRequest<any>('GET', `/Partitions/${partitionId}/$/GetReplicas/${replicaId}/$/GetHealth`);
    }

    // ==================== DEPLOYED APPLICATION APIs ====================

    async getDeployedApplicationInfoList(nodeName: string): Promise<{ items: any[] }> {
        const response = await this.makeRequest<any>('GET', `/Nodes/${nodeName}/$/GetApplications`);
        SfUtility.outputLog(`📦 RAW RESPONSE: ${JSON.stringify(response).substring(0, 500)}`, null, debugLevel.info);
        SfUtility.outputLog(`📦 Response type: ${typeof response}, is array: ${Array.isArray(response)}`, null, debugLevel.info);
        
        let items: any[] = [];
        
        // Service Fabric returns a direct array, not { items: [] }
        if (Array.isArray(response)) {
            items = response;
        } else if (response.Items) {
            // Or it might return { Items: [] } (capitalized)
            items = response.Items;
        } else if (response.items) {
            items = response.items;
        }
        
        // Normalize PascalCase properties to lowercase for consistency
        // The direct REST API returns Id/Name (PascalCase) but Azure SDK returns id/name (lowercase)
        const normalizedItems = items.map((item: any) => ({
            ...item,
            id: item.id || item.Id,
            name: item.name || item.Name,
            typeName: item.typeName || item.TypeName,
            typeVersion: item.typeVersion || item.TypeVersion,
            status: item.status || item.Status,
            healthState: item.healthState || item.HealthState
        }));
        
        SfUtility.outputLog(`📦 Normalized ${normalizedItems.length} deployed apps`, null, debugLevel.info);
        return { items: normalizedItems };
    }

    async getDeployedApplicationInfo(nodeName: string, applicationId: string): Promise<any> {
        return this.makeRequest<any>('GET', `/Nodes/${nodeName}/$/GetApplications/${applicationId}`);
    }

    async getDeployedApplicationHealth(nodeName: string, applicationId: string): Promise<any> {
        return this.makeRequest<any>('GET', `/Nodes/${nodeName}/$/GetApplications/${applicationId}/$/GetHealth`);
    }

    async getDeployedServicePackageInfoList(nodeName: string, applicationId: string): Promise<any[]> {
        const response = await this.makeRequest<any[]>('GET', `/Nodes/${nodeName}/$/GetApplications/${applicationId}/$/GetServicePackages`);
        // Normalize PascalCase to lowercase
        return response.map((item: any) => ({
            ...item,
            name: item.name || item.Name,
            serviceManifestName: item.serviceManifestName || item.ServiceManifestName,
            servicePackageActivationId: item.servicePackageActivationId || item.ServicePackageActivationId,
            healthState: item.healthState || item.HealthState,
            status: item.status || item.Status
        }));
    }

    async getDeployedCodePackageInfoList(nodeName: string, applicationId: string, serviceManifestName: string): Promise<any[]> {
        const response = await this.makeRequest<any[]>('GET', `/Nodes/${nodeName}/$/GetApplications/${applicationId}/$/GetCodePackages?ServiceManifestName=${serviceManifestName}`);
        // Normalize PascalCase to lowercase
        return response.map((item: any) => ({
            ...item,
            name: item.name || item.Name,
            codePackageName: item.codePackageName || item.CodePackageName,
            serviceManifestName: item.serviceManifestName || item.ServiceManifestName,
            codePackageVersion: item.codePackageVersion || item.CodePackageVersion,
            status: item.status || item.Status
        }));
    }

    async getDeployedServiceReplicaInfoList(nodeName: string, applicationId: string, serviceManifestName: string): Promise<any[]> {
        const response = await this.makeRequest<any[]>('GET', `/Nodes/${nodeName}/$/GetApplications/${applicationId}/$/GetReplicas?ServiceManifestName=${serviceManifestName}`);
        // Normalize PascalCase to lowercase
        return response.map((item: any) => ({
            ...item,
            replicaId: item.replicaId || item.ReplicaId,
            instanceId: item.instanceId || item.InstanceId,
            serviceKind: item.serviceKind || item.ServiceKind,
            serviceName: item.serviceName || item.ServiceName,
            partitionId: item.partitionId || item.PartitionId,
            replicaStatus: item.replicaStatus || item.ReplicaStatus,
            replicaRole: item.replicaRole || item.ReplicaRole
        }));
    }

    // ==================== EVENT STORE APIs ====================
    // EventStore API requires api-version=6.4 per Microsoft Learn docs

    async getServiceEventList(serviceId: string, startTime: string, endTime: string): Promise<any[]> {
        return this.makeRequest<any[]>('GET', `/EventsStore/Services/${serviceId}/$/Events?StartTimeUtc=${startTime}&EndTimeUtc=${endTime}`, undefined, '6.4');
    }

    async getPartitionEventList(partitionId: string, startTime: string, endTime: string): Promise<any[]> {
        return this.makeRequest<any[]>('GET', `/EventsStore/Partitions/${partitionId}/$/Events?StartTimeUtc=${startTime}&EndTimeUtc=${endTime}`, undefined, '6.4');
    }

    async getPartitionReplicaEventList(partitionId: string, replicaId: string, startTime: string, endTime: string): Promise<any[]> {
        return this.makeRequest<any[]>('GET', `/EventsStore/Partitions/${partitionId}/$/Replicas/${replicaId}/$/Events?StartTimeUtc=${startTime}&EndTimeUtc=${endTime}`, undefined, '6.4');
    }

    async getClusterEventList(startTime: string, endTime: string): Promise<any[]> {
        return this.makeRequest<any[]>('GET', `/EventsStore/Cluster/Events?StartTimeUtc=${encodeURIComponent(startTime)}&EndTimeUtc=${encodeURIComponent(endTime)}`, undefined, '6.4');
    }

    // ==================== REPAIR TASK APIs ====================

    async getRepairTaskList(): Promise<any[]> {
        return this.makeRequest<any[]>('GET', '/$/GetRepairTaskList');
    }

    // ==================== DEPLOY / PROVISION APIs ====================

    /**
     * Threshold for switching to session-based chunked upload.
     * The SF HTTP Gateway has a DefaultHttpRequestTimeout of 120 seconds.
     * Large files that can't upload within 120s will fail when the gateway kills the connection.
     * Max entity body for upload chunk is 10MB on the server side; we use a smaller value
     * to leave headroom for TLS overhead and slower connections.
     */
    private static readonly CHUNK_UPLOAD_THRESHOLD = 2 * 1024 * 1024;

    /**
     * Size of each chunk for session-based chunked upload (4MB).
     * Server max is 10MB (MaxEntityBodyForUploadChunkSize). We use 4MB which is
     * comfortably within the gateway's 120-second request timeout even on slow links.
     */
    private static readonly UPLOAD_CHUNK_SIZE = 4 * 1024 * 1024;

    /**
     * Upload a file to the Image Store.
     * Small files use a single PUT to /ImageStore/{contentPath}.
     * Large files (> CHUNK_UPLOAD_THRESHOLD) use the session-based chunked upload API:
     *   PUT /ImageStore/{path}/$/UploadChunk?session-id={guid}  (repeat per chunk)
     *   POST /ImageStore/$/CommitUploadSession?session-id={guid}
     */
    async uploadToImageStore(contentPath: string, fileContent: Buffer): Promise<void> {
        SfUtility.outputLog(`SfDirectRestClient.uploadToImageStore: path=${contentPath} size=${fileContent.length} bytes`, null, debugLevel.info);
        const encodedPath = contentPath.split('/').map(s => encodeURIComponent(s)).join('/');

        if (fileContent.length > SfDirectRestClient.CHUNK_UPLOAD_THRESHOLD) {
            await this.uploadToImageStoreChunked(encodedPath, fileContent);
        } else {
            // Small file: single-shot upload
            const uploadTimeout = Math.max(this.timeout, 120000);
            SfUtility.outputLog(`SfDirectRestClient.uploadToImageStore: single-shot timeout=${uploadTimeout}ms`, null, debugLevel.info);
            await this.makeRequest<void>(
                'PUT',
                `/ImageStore/${encodedPath}`,
                fileContent,
                undefined,
                { 'Content-Type': 'application/octet-stream' },
                uploadTimeout,
            );
        }
        SfUtility.outputLog(`SfDirectRestClient.uploadToImageStore: complete ${contentPath}`, null, debugLevel.info);
    }

    /**
     * Upload a large file to Image Store using the session-based chunked upload API.
     * 1. Generate a session GUID
     * 2. PUT each chunk to /ImageStore/{path}/$/UploadChunk?session-id={guid} with Content-Range
     * 3. POST /ImageStore/$/CommitUploadSession?session-id={guid} to finalize
     * On failure, attempts to clean up the session via DELETE.
     */
    private async uploadToImageStoreChunked(encodedPath: string, fileContent: Buffer): Promise<void> {
        const chunkSize = SfDirectRestClient.UPLOAD_CHUNK_SIZE;
        const totalSize = fileContent.length;
        const totalChunks = Math.ceil(totalSize / chunkSize);
        const sessionId = crypto.randomUUID();
        const chunkTimeout = 120000; // 2 minutes per chunk — well within gateway timeout

        SfUtility.outputLog(`SfDirectRestClient.uploadToImageStoreChunked: sessionId=${sessionId} ${totalChunks} chunks of up to ${chunkSize} bytes, total=${totalSize}`, null, debugLevel.info);

        try {
            // Upload each chunk
            for (let i = 0; i < totalChunks; i++) {
                const start = i * chunkSize;
                const end = Math.min(start + chunkSize, totalSize);
                const chunk = fileContent.subarray(start, end);

                SfUtility.outputLog(`SfDirectRestClient.uploadToImageStoreChunked: chunk ${i + 1}/${totalChunks} bytes ${start}-${end - 1}/${totalSize}`, null, debugLevel.info);

                await this.makeRequest<void>(
                    'PUT',
                    `/ImageStore/${encodedPath}/$/UploadChunk?session-id=${sessionId}`,
                    chunk,
                    undefined,
                    {
                        'Content-Type': 'application/octet-stream',
                        'Content-Range': `bytes ${start}-${end - 1}/${totalSize}`,
                    },
                    chunkTimeout,
                );
            }

            // Commit the upload session
            SfUtility.outputLog(`SfDirectRestClient.uploadToImageStoreChunked: committing session ${sessionId}`, null, debugLevel.info);
            await this.makeRequest<void>(
                'POST',
                `/ImageStore/$/CommitUploadSession?session-id=${sessionId}`,
                undefined,
                undefined,
                undefined,
                chunkTimeout,
            );
        } catch (err) {
            // Attempt to clean up the failed session
            SfUtility.outputLog(`SfDirectRestClient.uploadToImageStoreChunked: error, deleting session ${sessionId}`, err, debugLevel.error);
            try {
                await this.makeRequest<void>(
                    'DELETE',
                    `/ImageStore/$/DeleteUploadSession?session-id=${sessionId}`,
                );
            } catch (cleanupErr) {
                SfUtility.outputLog(`SfDirectRestClient.uploadToImageStoreChunked: failed to delete session ${sessionId}`, cleanupErr, debugLevel.warn);
            }
            throw err;
        }
    }

    /**
     * Upload a file from disk to Image Store, reading chunks from disk to avoid loading entire file into memory.
     * Small files (<=CHUNK_UPLOAD_THRESHOLD) are read entirely and uploaded in a single PUT.
     * Large files use session-based chunked upload reading only one chunk at a time from disk.
     * 
     * @param contentPath Image Store relative path (e.g. "AppType/ServicePkg/Code.zip")
     * @param localFilePath Absolute path to the local file on disk
     * @param fileSize File size in bytes (from fs.statSync). If not provided, will be read from disk.
     */
    async uploadFileToImageStore(contentPath: string, localFilePath: string, fileSize?: number): Promise<void> {
        const stat = fileSize ?? fs.statSync(localFilePath).size;
        SfUtility.outputLog(`SfDirectRestClient.uploadFileToImageStore: path=${contentPath} file=${localFilePath} size=${stat} bytes`, null, debugLevel.info);
        const encodedPath = contentPath.split('/').map(s => encodeURIComponent(s)).join('/');

        if (stat <= SfDirectRestClient.CHUNK_UPLOAD_THRESHOLD) {
            // Small file: read entirely and single-shot upload
            const content = fs.readFileSync(localFilePath);
            const uploadTimeout = Math.max(this.timeout, 120000);
            await this.makeRequest<void>(
                'PUT',
                `/ImageStore/${encodedPath}`,
                content,
                undefined,
                { 'Content-Type': 'application/octet-stream' },
                uploadTimeout,
            );
        } else {
            // Large file: stream chunks from disk
            await this.uploadFileToImageStoreChunked(encodedPath, localFilePath, stat);
        }
        SfUtility.outputLog(`SfDirectRestClient.uploadFileToImageStore: complete ${contentPath}`, null, debugLevel.info);
    }

    /**
     * Upload a large file from disk using session-based chunked upload.
     * Reads only one 4MB chunk at a time from disk, keeping memory usage constant
     * regardless of file size (supports 1GB+ files).
     */
    private async uploadFileToImageStoreChunked(encodedPath: string, localFilePath: string, totalSize: number): Promise<void> {
        const chunkSize = SfDirectRestClient.UPLOAD_CHUNK_SIZE;
        const totalChunks = Math.ceil(totalSize / chunkSize);
        const sessionId = crypto.randomUUID();
        const chunkTimeout = 120000;

        SfUtility.outputLog(`SfDirectRestClient.uploadFileToImageStoreChunked: sessionId=${sessionId} file=${localFilePath} ${totalChunks} chunks of up to ${chunkSize} bytes, total=${totalSize}`, null, debugLevel.info);

        const fd = fs.openSync(localFilePath, 'r');
        try {
            const chunkBuffer = Buffer.alloc(chunkSize);

            for (let i = 0; i < totalChunks; i++) {
                const start = i * chunkSize;
                const expectedBytes = Math.min(chunkSize, totalSize - start);
                const bytesRead = fs.readSync(fd, chunkBuffer as unknown as Uint8Array, 0, expectedBytes, start);

                if (bytesRead !== expectedBytes) {
                    throw new Error(`Short read: expected ${expectedBytes} bytes at offset ${start}, got ${bytesRead}`);
                }

                // Slice to exact size for the last chunk (which may be smaller than chunkSize)
                const chunk = bytesRead < chunkSize ? chunkBuffer.subarray(0, bytesRead) : chunkBuffer;
                const end = start + bytesRead;

                SfUtility.outputLog(`SfDirectRestClient.uploadFileToImageStoreChunked: chunk ${i + 1}/${totalChunks} bytes ${start}-${end - 1}/${totalSize}`, null, debugLevel.info);

                await this.makeRequest<void>(
                    'PUT',
                    `/ImageStore/${encodedPath}/$/UploadChunk?session-id=${sessionId}`,
                    chunk,
                    undefined,
                    {
                        'Content-Type': 'application/octet-stream',
                        'Content-Range': `bytes ${start}-${end - 1}/${totalSize}`,
                    },
                    chunkTimeout,
                );
            }

            // Commit the upload session
            SfUtility.outputLog(`SfDirectRestClient.uploadFileToImageStoreChunked: committing session ${sessionId}`, null, debugLevel.info);
            await this.makeRequest<void>(
                'POST',
                `/ImageStore/$/CommitUploadSession?session-id=${sessionId}`,
                undefined,
                undefined,
                undefined,
                chunkTimeout,
            );
        } catch (err) {
            SfUtility.outputLog(`SfDirectRestClient.uploadFileToImageStoreChunked: error, deleting session ${sessionId}`, err, debugLevel.error);
            try {
                await this.makeRequest<void>(
                    'DELETE',
                    `/ImageStore/$/DeleteUploadSession?session-id=${sessionId}`,
                );
            } catch (cleanupErr) {
                SfUtility.outputLog(`SfDirectRestClient.uploadFileToImageStoreChunked: failed to delete session ${sessionId}`, cleanupErr, debugLevel.warn);
            }
            throw err;
        } finally {
            fs.closeSync(fd);
        }
    }

    /**
     * Provision an application type from the Image Store path.
     * POST /ApplicationTypes/$/Provision?api-version=6.2
     */
    async provisionApplicationType(imageStorePath: string, isAsync: boolean = true): Promise<void> {
        SfUtility.outputLog(`SfDirectRestClient.provisionApplicationType: path=${imageStorePath} async=${isAsync}`, null, debugLevel.info);
        await this.makeRequest<void>(
            'POST',
            '/ApplicationTypes/$/Provision',
            {
                Kind: 'ImageStorePath',
                Async: isAsync,
                ApplicationTypeBuildPath: imageStorePath,
            },
            '6.2',
        );
        SfUtility.outputLog('SfDirectRestClient.provisionApplicationType: complete', null, debugLevel.info);
    }

    /**
     * Create a new application instance.
     * POST /Applications/$/Create?api-version=6.0
     */
    async createApplication(
        appName: string,
        typeName: string,
        typeVersion: string,
        parameters?: Record<string, string>,
    ): Promise<void> {
        SfUtility.outputLog(`SfDirectRestClient.createApplication: name=${appName} type=${typeName} v=${typeVersion} params=${parameters ? Object.keys(parameters).length : 0}`, null, debugLevel.info);
        const body: any = {
            Name: appName,
            TypeName: typeName,
            TypeVersion: typeVersion,
        };
        if (parameters) {
            body.ParameterList = Object.entries(parameters).map(([Key, Value]) => ({ Key, Value }));
        }
        await this.makeRequest<void>('POST', '/Applications/$/Create', body);
        SfUtility.outputLog('SfDirectRestClient.createApplication: complete', null, debugLevel.info);
    }

    /**
     * Delete an application instance.
     * POST /Applications/{applicationId}/$/Delete?api-version=6.0
     */
    async deleteApplication(applicationId: string): Promise<void> {
        await this.makeRequest<void>('POST', `/Applications/${applicationId}/$/Delete`);
    }

    /**
     * Unprovision (unregister) an application type + version.
     * POST /ApplicationTypes/{typeName}/$/Unprovision?api-version=6.0
     */
    async unprovisionApplicationType(applicationTypeName: string, applicationTypeVersion: string): Promise<void> {
        await this.makeRequest<void>(
            'POST',
            `/ApplicationTypes/${applicationTypeName}/$/Unprovision`,
            { ApplicationTypeVersion: applicationTypeVersion },
        );
    }

    /**
     * Get Image Store content (files and folders) at the given path.
     * GET /ImageStore/{contentPath}?api-version=6.0
     * Returns { StoreFiles: [...], StoreFolders: [...] }
     */
    async getImageStoreContent(contentPath: string): Promise<any> {
        SfUtility.outputLog(`SfDirectRestClient.getImageStoreContent: path=${contentPath}`, null, debugLevel.info);
        const encodedPath = contentPath.split('/').map(s => encodeURIComponent(s)).join('/');
        const result = await this.makeRequest<any>('GET', `/ImageStore/${encodedPath}`);
        SfUtility.outputLog(`SfDirectRestClient.getImageStoreContent: files=${result?.StoreFiles?.length || 0} folders=${result?.StoreFolders?.length || 0}`, null, debugLevel.info);
        return result;
    }

    /**
     * Delete an application package from the Image Store.
     * DELETE /ImageStore/{contentPath}?api-version=6.0
     */
    async deleteImageStoreContent(contentPath: string): Promise<void> {
        SfUtility.outputLog(`SfDirectRestClient.deleteImageStoreContent: path=${contentPath}`, null, debugLevel.info);
        await this.makeRequest<void>('DELETE', `/ImageStore/${contentPath}`);
        SfUtility.outputLog('SfDirectRestClient.deleteImageStoreContent: complete', null, debugLevel.info);
    }

    /**
     * Get the provisioning status of an application type.
     * GET /ApplicationTypes/{typeName}?api-version=6.0
     * Returns the list of registered versions for this type name.
     */
    async getApplicationType(applicationTypeName: string): Promise<any[]> {
        SfUtility.outputLog(`SfDirectRestClient.getApplicationType: name=${applicationTypeName}`, null, debugLevel.info);
        const result = await this.makeRequest<any>('GET', `/ApplicationTypes/${applicationTypeName}`);
        // SF REST returns { Items: [...], ContinuationToken: "" } — unwrap
        const items = result?.Items || result?.items || (Array.isArray(result) ? result : []);
        SfUtility.outputLog(`SfDirectRestClient.getApplicationType: returned ${items.length} type(s)`, null, debugLevel.info);
        return items;
    }

    /**
     * Upgrade an existing application instance.
     * POST /Applications/{applicationId}/$/Upgrade?api-version=6.0
     */
    async upgradeApplication(
        applicationId: string,
        typeName: string,
        targetVersion: string,
        parameters?: Record<string, string>,
        upgradeKind: string = 'Rolling',
        rollingUpgradeMode: string = 'Monitored',
        failureAction: string = 'Rollback',
    ): Promise<void> {
        SfUtility.outputLog(`SfDirectRestClient.upgradeApplication: id=${applicationId} type=${typeName} targetVersion=${targetVersion} upgradeKind=${upgradeKind} mode=${rollingUpgradeMode} failureAction=${failureAction} params=${parameters ? Object.keys(parameters).length : 0}`, null, debugLevel.info);
        const body: any = {
            Name: applicationId,
            TargetApplicationTypeVersion: targetVersion,
            UpgradeKind: upgradeKind,
            RollingUpgradeMode: rollingUpgradeMode,
            MonitoringPolicy: {
                FailureAction: failureAction,
            },
        };
        if (parameters) {
            body.Parameters = Object.entries(parameters).map(([Key, Value]) => ({ Key, Value }));
        }
        SfUtility.outputLog(`SfDirectRestClient.upgradeApplication: request body=${JSON.stringify(body)}`, null, debugLevel.debug);
        await this.makeRequest<void>('POST', `/Applications/${applicationId}/$/Upgrade`, body);
    }
}
