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
import * as https from 'https';
import * as http from 'http';
import * as url from 'url';
import { SfUtility, debugLevel } from '../sfUtility';
import { HttpError, NetworkError } from '../models/Errors';
import { PiiObfuscation } from '../utils/PiiObfuscation';

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

    constructor(options: SfRestOptions) {
        // Ensure endpoint has protocol
        let endpoint = options.endpoint;
        if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
            endpoint = 'https://' + endpoint;
        }
        this.endpoint = endpoint;
        this.apiVersion = options.apiVersion || '6.0';
        this.timeout = options.timeout || 60000;
        this.certificate = options.certificate;
        this.key = options.key;

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
        const fullPath = `${path}${separator}api-version=${requestApiVersion}&timeout=60`;

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

        // Add certificate auth if provided
        if (this.certificate && this.key) {
            options.cert = this.certificate;
            options.key = this.key;
        }

        const logUrl = `${parsedUrl.protocol}//${options.hostname}:${options.port}${fullPath}`;
        const obfuscatedUrl = `${parsedUrl.protocol}//${PiiObfuscation.generic(options.hostname || '')}:${options.port}${path.includes('?') ? path.substring(0, path.indexOf('?')) : path}?api-version=${requestApiVersion}`;
        SfUtility.outputLog(`🌐 ${method} ${obfuscatedUrl}`, null, debugLevel.info);

        return new Promise<T>((resolve, reject) => {
            const requestModule = isHttps ? https : http;
            const chunks: Buffer[] = [];
            let requestCompleted = false;
            let requestAborted = false;

            const req = requestModule.request(options, (res) => {
                res.on('data', (chunk: Buffer) => {
                    chunks.push(chunk);
                });

                res.on('end', () => {
                    if (requestAborted || requestCompleted) {
                        return; // Already handled
                    }
                    requestCompleted = true;
                    
                    const responseBody = chunks.length > 0 ? Buffer.concat(chunks as any).toString('utf-8') : '';
                    
                    SfUtility.outputLog(`📥 Response: ${res.statusCode}`, null, debugLevel.info);

                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
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

            const effectiveTimeout = timeoutMs || this.timeout;
            req.on('timeout', () => {
                if (requestAborted || requestCompleted) {
                    return; // Already handled
                }
                requestAborted = true;
                req.destroy();
                SfUtility.outputLog(`❌ Request timeout after ${effectiveTimeout}ms`, null, debugLevel.error);
                reject(new NetworkError('Request timeout', { cause: new Error(`Timeout after ${effectiveTimeout}ms`) }));
            });

            req.setTimeout(effectiveTimeout);

            // Handle socket errors
            req.on('socket', (socket) => {
                socket.on('error', (err) => {
                    if (requestAborted || requestCompleted) {
                        return; // Already handled
                    }
                    requestCompleted = true;
                    SfUtility.outputLog(`❌ Socket error: ${err.message}`, err, debugLevel.error);
                    reject(new NetworkError('Socket error', { cause: err }));
                });
            });

            // Send body if provided
            if (body) {
                if (Buffer.isBuffer(body)) {
                    SfUtility.outputLog(`📤 Request body: <binary ${body.length} bytes>`, null, debugLevel.info);
                    req.setHeader('Content-Length', body.length);
                    req.write(body);
                } else {
                    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
                    SfUtility.outputLog(`📤 Request body: ${bodyStr}`, null, debugLevel.info);
                    req.setHeader('Content-Length', Buffer.byteLength(bodyStr));
                    req.write(bodyStr);
                }
            }

            req.end();
        }).catch((error) => {
            // Wrap any unhandled errors with context
            SfUtility.outputLog(`❌ makeRequest failed for ${method} ${logUrl}`, error, debugLevel.error);
            throw error;
        });
    }

    // ==================== NODE APIs ====================

    async getNodeInfo(nodeName: string): Promise<SfNodeInfo> {
        return this.makeRequest<SfNodeInfo>('GET', `/Nodes/${nodeName}`);
    }

    async getNodeInfoList(): Promise<{ items: SfNodeInfo[] }> {
        return this.makeRequest<{ items: SfNodeInfo[] }>('GET', '/Nodes');
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
        return this.makeRequest<{ items: any[] }>('GET', '/Applications');
    }

    async getApplicationInfo(applicationId: string): Promise<any> {
        return this.makeRequest<any>('GET', `/Applications/${applicationId}`);
    }

    async getApplicationHealth(applicationId: string): Promise<any> {
        return this.makeRequest<any>('GET', `/Applications/${applicationId}/$/GetHealth`);
    }

    async getApplicationTypeInfoList(): Promise<{ items: any[] }> {
        return this.makeRequest<{ items: any[] }>('GET', '/ApplicationTypes');
    }

    async getApplicationManifest(applicationTypeName: string, applicationTypeVersion: string): Promise<any> {
        return this.makeRequest<any>('GET', `/ApplicationTypes/${applicationTypeName}/$/GetApplicationManifest?ApplicationTypeVersion=${applicationTypeVersion}`);
    }

    // ==================== SERVICE APIs ====================

    async getServiceInfoList(applicationId: string): Promise<{ items: any[] }> {
        return this.makeRequest<{ items: any[] }>('GET', `/Applications/${applicationId}/$/GetServices`);
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
        return this.makeRequest<{ items: any[] }>('GET', `/Services/${serviceId}/$/GetPartitions`);
    }

    async getReplicaInfoList(partitionId: string): Promise<{ items: any[] }> {
        return this.makeRequest<{ items: any[] }>('GET', `/Partitions/${partitionId}/$/GetReplicas`);
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
     * Upload a file to the Image Store.
     * PUT /ImageStore/{contentPath}?api-version=6.0
     */
    async uploadToImageStore(contentPath: string, fileContent: Buffer): Promise<void> {
        const encodedPath = contentPath.split('/').map(s => encodeURIComponent(s)).join('/');
        // Scale timeout based on file size: minimum 60s, add 60s per 5MB
        const uploadTimeout = Math.max(this.timeout, 60000 + Math.ceil(fileContent.length / (5 * 1024 * 1024)) * 60000);
        await this.makeRequest<void>(
            'PUT',
            `/ImageStore/${encodedPath}`,
            fileContent,
            undefined,
            { 'Content-Type': 'application/octet-stream' },
            uploadTimeout,
        );
    }

    /**
     * Provision an application type from the Image Store path.
     * POST /ApplicationTypes/$/Provision?api-version=6.2
     */
    async provisionApplicationType(imageStorePath: string, isAsync: boolean = true): Promise<void> {
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
        const body: any = {
            Name: appName,
            TypeName: typeName,
            TypeVersion: typeVersion,
        };
        if (parameters) {
            body.ParameterList = Object.entries(parameters).map(([Key, Value]) => ({ Key, Value }));
        }
        await this.makeRequest<void>('POST', '/Applications/$/Create', body);
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
     * Delete an application package from the Image Store.
     * DELETE /ImageStore/{contentPath}?api-version=6.0
     */
    async deleteImageStoreContent(contentPath: string): Promise<void> {
        await this.makeRequest<void>('DELETE', `/ImageStore/${contentPath}`);
    }

    /**
     * Get the provisioning status of an application type.
     * GET /ApplicationTypes/{typeName}?api-version=6.0
     * Returns the list of registered versions for this type name.
     */
    async getApplicationType(applicationTypeName: string): Promise<any[]> {
        const result = await this.makeRequest<any>('GET', `/ApplicationTypes/${applicationTypeName}`);
        // SF REST returns { Items: [...], ContinuationToken: "" } — unwrap
        return result?.Items || result?.items || (Array.isArray(result) ? result : []);
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
        await this.makeRequest<void>('POST', `/Applications/${applicationId}/$/Upgrade`, body);
    }
}
