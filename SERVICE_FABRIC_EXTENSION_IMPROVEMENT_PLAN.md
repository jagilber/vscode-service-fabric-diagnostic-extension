# Service Fabric VSCode Extension - Comprehensive Improvement Plan

## Executive Summary

This document outlines a systematic plan to transform the Service Fabric diagnostic extension from a partially-refactored Microsoft sample into a production-ready, maintainable, and robust VSCode extension. The plan addresses critical async/callback issues, architectural concerns, incomplete features, and code quality problems.

**Estimated Total Effort:** 3-4 weeks
**Priority:** High (blocking production use due to callback issues)

---

## Critical Issues Identified

### 1. Callback/Promise Anti-Patterns (P0 - Blocking)

#### Issue: Promise Constructor Anti-Pattern
**Location:** [sfRest.ts](sfRest.ts#L239-L253), [sfRestClient.ts](sfRestClient.ts#L70-L176)

**Problem:**
```typescript
// ANTI-PATTERN: Complex Promise constructor with nested callbacks
const promise: Promise<ClientRequest | string> = new Promise<ClientRequest | string>((resolve, reject) => {
    const result: ClientRequest = https.request(httpOptions, (response) => {
        let data = '';
        response.on('data', (chunk: any) => {
            const jObject = JSON.parse(chunk);
            if (jObject.CancellationToken) {
                // RECURSIVE CALL INSIDE CALLBACK - DANGEROUS
                data += this.invokeRequestOptions(httpOptions);
            }
            data += chunk;
        });
        response.on('end', () => resolve(data));
    }).on('error', (error: any) => reject(error));
    result.end();
});
```

**Issues:**
- Recursive async call inside data event handler
- No proper chunking/buffering strategy
- JSON.parse on incomplete chunk data (will throw)
- Missing error handling for recursive call
- Continuation token logic broken

**Impact:** High - Causes runtime errors, incomplete data retrieval, potential infinite recursion

#### Issue: Unhandled Promise Rejections
**Location:** Multiple files - [sfMgr.ts](sfMgr.ts), [sfConfiguration.ts](sfConfiguration.ts), [sfPrompts.ts](sfPrompts.ts)

**Problem:**
```typescript
// Missing error handling
public async getCluster(clusterEndpoint: string): Promise<any> {
    // ... setup code ...
    await this.sfConfig.populate();  // No try/catch - unhandled rejection
    this.sfClusterView.addTreeItem(this.sfConfig.createClusterViewTreeItem());
}
```

**Impact:** High - Unhandled rejections crash the extension or leave it in inconsistent state

#### Issue: Callback Hell in Event Handlers
**Location:** [sfMgr.ts](sfMgr.ts#L172-L198)

**Problem:**
```typescript
const result = await new Promise<boolean>((resolve, reject) => {
    https.get(url, (response: any) => {
        response.pipe(file);
        response.on('error', (err: any) => reject(err));
        response.on('end', () => {});  // Empty handler
        file.on('finish', () => {
            file.close();
            resolve(true);
        });
    }).on('error', (err: any) => {
        fs.unlink(outputFile, () => reject(err));  // Nested callback
    });
});
```

**Impact:** Medium - Difficult to maintain, error-prone, hard to test

---

### 2. Architectural Issues (P1 - Technical Debt)

#### Issue: God Class Anti-Pattern
**Location:** [sfMgr.ts](sfMgr.ts) - 330 lines, 20+ methods

**Responsibilities:**
- PowerShell execution
- HTTP/HTTPS downloads
- REST API orchestration
- SDK downloads and installation
- Cluster configuration management
- Tree view integration
- File system operations
- Azure authentication calls

**Impact:** High - Single Responsibility Principle violated, hard to test, tight coupling

#### Issue: Circular Dependencies
**Problem:**
```
SfMgr ──► SfRest ──► SfRestClient ──► SfRest (circular)
     ├──► SfConfiguration ──► SfRest
     └──► SfClusterView
```

**Impact:** Medium - Hard to refactor, difficult dependency injection, testing challenges

#### Issue: Mixed Concerns
**Location:** [sfConfiguration.ts](sfConfiguration.ts)

**Problem:**
- Data model (cluster state)
- Business logic (populate methods)
- Presentation logic (createClusterViewTreeItem, getIcon)
- REST client orchestration
- File system operations (SfClusterFolder)

**Impact:** Medium - Violates separation of concerns, hard to test individual layers

---

### 3. Incomplete Refactoring (P2 - Quality)

#### Issue: Commented-Out Code (~200 lines)
**Locations:**
- [extension.ts](extension.ts#L10-L145) - Azure authentication (135 lines)
- [extension.ts](extension.ts#L147-L180) - Sample tree providers (33 lines)
- [sfRest.ts](sfRest.ts#L304-L350) - Azure cluster enumeration (46 lines)

**Impact:** Low-Medium - Code smell, confusing for maintenance, unclear intent

#### Issue: Generic Microsoft Sample Metadata
**Location:** [package.json](package.json)

**Problems:**
```json
{
  "name": "custom-view-samples",          // Not SF-specific
  "displayName": "Custom view Samples",   // Generic
  "publisher": "vscode-samples",          // Microsoft
  "repository": "https://github.com/microsoft/vscode-extension-samples"
}
```

**Impact:** Low - Unprofessional, confusing for users, poor discoverability

#### Issue: Generic Sample Documentation
**Location:** [README.md](README.md)

**Problem:**
- References "Node dependencies" and "FTP explorer" (sample content)
- No Service Fabric-specific documentation
- Missing setup instructions
- No usage examples

**Impact:** Low-Medium - Poor user experience, onboarding friction

---

### 4. Type Safety Issues (P2 - Quality)

#### Issue: Excessive `any` Types
**Count:** 100+ occurrences across codebase

**Examples:**
```typescript
private context: any;                    // Should be vscode.ExtensionContext
public sfClusters: any[] = [];          // Should be typed interface
response: any                            // Should be IncomingMessage
jObject = JSON.parse(chunk);            // Should have interface
```

**Impact:** Medium - Loss of type safety benefits, runtime errors, poor IntelliSense

#### Issue: Unsafe Non-Null Assertions
**Examples:**
```typescript
outputFile = `${this.globalStorage}\\${downloadUrl.split('/').pop()!}`;  // Could be undefined
const property = node.parent?.children[0].value.toString();              // Chained unsafe access
```

**Impact:** Medium - Potential runtime null reference errors

#### Issue: TypeScript Ignored Errors
**Count:** 6 `@ts-ignore` comments

**Location:** [sfUtility.ts](sfUtility.ts), [sfRest.ts](sfRest.ts)

**Problem:**
```typescript
// @ts-ignore - telemetry is not yet exposed in the vscode api
this.logger = vscode.env.createTelemetryLogger(sender);
```

**Impact:** Low-Medium - Suppresses real errors, unclear API usage

---

### 5. Resource Management Issues (P1 - Stability)

#### Issue: Missing Cleanup in deactivate()
**Location:** [extension.ts](extension.ts) - No deactivate() function

**Missing:**
- Tree view disposal
- Event emitter disposal
- PowerShell process cleanup
- Output channel disposal
- Telemetry logger shutdown

**Impact:** High - Memory leaks, orphaned processes, resource exhaustion

#### Issue: Event Emitter Memory Leaks
**Location:** [serviceFabricClusterView.ts](serviceFabricClusterView.ts)

**Problem:**
```typescript
private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined> = 
    new vscode.EventEmitter<TreeItem | undefined>();
// Never disposed
```

**Impact:** Medium - Memory leak with frequent refreshes

---

## Improvement Plan

### Phase 1: Critical Fixes (Week 1) - MUST DO

**Goal:** Fix blocking callback/async issues and unhandled errors

#### Task 1.1: Refactor HTTP Request Handling
**Effort:** 2 days  
**Files:** [sfRest.ts](sfRest.ts), [sfRestClient.ts](sfRestClient.ts), [sfMgr.ts](sfMgr.ts)

**Actions:**
1. Replace Promise constructor anti-patterns with async/await
2. Implement proper chunking for HTTP responses
3. Add continuation token handling as separate method
4. Create dedicated HttpClient utility class
5. Add proper error handling to all async functions

**Example Refactor:**
```typescript
// BEFORE (anti-pattern)
private async httpGet(url: string): Promise<string> {
    const result = await new Promise<string>((resolve, reject) => {
        https.get(url, (response: http.IncomingMessage) => {
            const output: string[] = [];
            response.on('data', (chunk: any) => output.push(chunk));
            response.on('close', () => resolve(output.join('')));
        });
    });
    return result;
}

// AFTER (clean async)
private async httpGet(url: string): Promise<string> {
    try {
        const response = await this.httpClient.get(url);
        return await response.text();
    } catch (error) {
        SfUtility.outputLog(`httpGet failed: ${error}`, null, debugLevel.error);
        throw new HttpError(`Failed to GET ${url}`, { cause: error });
    }
}
```

#### Task 1.2: Add Comprehensive Error Handling
**Effort:** 1 day  
**Files:** All async methods in [sfMgr.ts](sfMgr.ts), [sfConfiguration.ts](sfConfiguration.ts), [sfPrompts.ts](sfPrompts.ts)

**Actions:**
1. Wrap all async operations in try/catch blocks
2. Create custom error classes (ClusterConnectionError, AuthenticationError, etc.)
3. Add error telemetry logging
4. Show user-friendly error messages
5. Implement retry logic for transient failures

**Example:**
```typescript
public async getCluster(clusterEndpoint: string): Promise<void> {
    try {
        if (!this.getSfConfig(clusterEndpoint)) {
            this.sfConfig = new SfConfiguration(this.context, { endpoint: clusterEndpoint });
            this.addSfConfig(this.sfConfig);
        } else {
            this.sfConfig = this.getSfConfig(clusterEndpoint)!;
        }

        const clusterCertificateInfo = this.sfConfig.getClusterCertificate();
        if (clusterCertificateInfo && (!clusterCertificateInfo.certificate || !clusterCertificateInfo.key)) {
            clusterCertificateInfo.certificate = await this.ps.getPemCertFromLocalCertStore(
                clusterCertificateInfo.thumbprint ?? clusterCertificateInfo.commonName!
            );
            clusterCertificateInfo.key = await this.ps.getPemKeyFromLocalCertStore(
                clusterCertificateInfo.thumbprint ?? clusterCertificateInfo.commonName!
            );
        }

        await this.sfConfig.populate();
        this.sfClusterView.addTreeItem(this.sfConfig.createClusterViewTreeItem());
        
        SfUtility.showInformation(`Connected to cluster: ${clusterEndpoint}`);
    } catch (error) {
        const message = `Failed to connect to cluster ${clusterEndpoint}`;
        SfUtility.outputLog(message, error, debugLevel.error);
        
        if (error instanceof CertificateError) {
            SfUtility.showError(`${message}: Certificate authentication failed. Check certificate configuration.`);
        } else if (error instanceof NetworkError) {
            SfUtility.showError(`${message}: Network error. Check endpoint and firewall.`);
        } else {
            SfUtility.showError(`${message}: ${error.message}`);
        }
        
        throw new ClusterConnectionError(message, { cause: error });
    }
}
```

#### Task 1.3: Implement Resource Cleanup
**Effort:** 1 day  
**Files:** [extension.ts](extension.ts), [serviceFabricClusterView.ts](serviceFabricClusterView.ts), [sfMgr.ts](sfMgr.ts)

**Actions:**
1. Add deactivate() function to extension.ts
2. Track all disposables in context.subscriptions
3. Dispose event emitters
4. Clean up PowerShell processes
5. Close output channels
6. Flush telemetry

**Example:**
```typescript
export function activate(context: vscode.ExtensionContext) {
    // Track all disposables
    const sfMgr = new SfMgr(context);
    const sfPrompts = new SfPrompts(context);
    
    // Register all commands and track subscriptions
    context.subscriptions.push(
        vscode.commands.registerCommand('serviceFabric.refreshView', () => sfMgr.sfClusterView.refresh()),
        vscode.commands.registerCommand('serviceFabric.getClusters', async () => {
            try {
                await sfMgr.getClusters();
            } catch (error) {
                SfUtility.showError(`Failed to get clusters: ${error.message}`);
            }
        }),
        // ... more commands
    );
    
    // Track long-lived objects for cleanup
    context.subscriptions.push({
        dispose: () => sfMgr.dispose()
    });
}

export function deactivate(): Thenable<void> | undefined {
    // VSCode will automatically dispose context.subscriptions
    // Any additional cleanup here
    return SfUtility.shutdown();
}
```

#### Task 1.4: Fix Continuation Token Handling
**Effort:** 1 day  
**Files:** [sfRest.ts](sfRest.ts)

**Actions:**
1. Remove recursive logic from data event handler
2. Implement iterative pagination pattern
3. Create dedicated method for paginated requests
4. Add proper response buffering

**Example:**
```typescript
private async getAllPaginated<T>(
    fetchPage: (continuationToken?: string) => Promise<{ items: T[], continuationToken?: string }>
): Promise<T[]> {
    const allItems: T[] = [];
    let continuationToken: string | undefined = undefined;
    
    do {
        try {
            const response = await fetchPage(continuationToken);
            allItems.push(...response.items);
            continuationToken = response.continuationToken;
            
            SfUtility.outputLog(`Fetched ${response.items.length} items, total: ${allItems.length}`);
        } catch (error) {
            SfUtility.outputLog(`Pagination failed at token ${continuationToken}`, error, debugLevel.error);
            throw new PaginationError('Failed to fetch all pages', { cause: error });
        }
    } while (continuationToken);
    
    return allItems;
}

public async getNodes(
    nodeStatusFilter: sfModels.KnownNodeStatusFilter = sfModels.KnownNodeStatusFilter.Default
): Promise<sfModels.NodeInfo[]> {
    return this.getAllPaginated(async (continuationToken) => {
        const response = await this.sfApi.getNodeInfoList({ 
            continuationToken, 
            nodeStatusFilter 
        });
        
        if (!response.items || response.items.length === 0) {
            SfUtility.showWarning("No nodes found");
        }
        
        return {
            items: response.items || [],
            continuationToken: response.continuationToken
        };
    });
}
```

**Deliverables:**
- [ ] All Promise constructor anti-patterns replaced with clean async/await
- [ ] try/catch blocks added to all async methods
- [ ] Custom error classes created and used throughout
- [ ] deactivate() function implemented with full cleanup
- [ ] Continuation token handling fixed and tested
- [ ] Unit tests for all refactored methods
- [ ] Manual testing with real Service Fabric cluster

**Success Criteria:**
- No unhandled promise rejections in logs
- Extension cleans up resources on deactivation
- Paginated requests complete successfully for large datasets
- Error messages are user-friendly and actionable

---

### Phase 2: Architecture Refactoring (Week 2) - SHOULD DO

**Goal:** Break down god classes, establish clear separation of concerns, reduce coupling

#### Task 2.1: Decompose SfMgr God Class
**Effort:** 3 days  
**Files:** [sfMgr.ts](sfMgr.ts) → Multiple new files

**Actions:**
1. Extract HTTP client functionality → `SfHttpClient.ts`
2. Extract SDK download logic → `SfSdkInstaller.ts`
3. Extract PowerShell operations → `SfPs.ts` (already exists, use it properly)
4. Extract cluster orchestration → `SfClusterService.ts`
5. Keep only high-level coordination in SfMgr

**New Architecture:**
```
src/
  services/
    SfClusterService.ts       - Cluster operations orchestration
    SfHttpClient.ts            - HTTP/HTTPS request handling
    SfSdkInstaller.ts          - SDK download and installation
    SfCertificateService.ts    - Certificate management
  core/
    SfMgr.ts                   - High-level coordination only
    SfRest.ts                  - Service Fabric REST API wrapper
  ui/
    serviceFabricClusterView.ts  - Tree data provider
    SfPrompts.ts                 - User interaction
  models/
    SfConfiguration.ts         - Data model only (no logic)
    ClusterEndpoint.ts         - Strong typing
    Errors.ts                  - Custom error classes
  utils/
    SfUtility.ts               - Shared utilities
    SfPs.ts                    - PowerShell adapter
```

**Example Extraction:**
```typescript
// NEW FILE: src/services/SfHttpClient.ts
export class SfHttpClient {
    constructor(
        private readonly logger: typeof SfUtility,
        private readonly timeout: number = 9000
    ) {}

    public async get(url: string, options?: RequestOptions): Promise<Response> {
        try {
            const response = await asyncHttps.get(url, {
                ...options,
                timeout: this.timeout
            });
            
            if (!response.ok) {
                throw new HttpError(
                    `HTTP ${response.status}: ${response.statusText}`,
                    { status: response.status, url }
                );
            }
            
            return response;
        } catch (error) {
            this.logger.outputLog(`GET ${url} failed`, error, debugLevel.error);
            throw new NetworkError(`Failed to GET ${url}`, { cause: error });
        }
    }

    public async download(url: string, outputPath: string, onProgress?: (bytes: number) => void): Promise<void> {
        const response = await this.get(url);
        const fileStream = fs.createWriteStream(outputPath);
        
        let downloadedBytes = 0;
        response.body.on('data', (chunk: Buffer) => {
            downloadedBytes += chunk.length;
            onProgress?.(downloadedBytes);
        });
        
        await pipeline(response.body, fileStream);
        this.logger.outputLog(`Downloaded ${downloadedBytes} bytes to ${outputPath}`);
    }
}

// NEW FILE: src/services/SfClusterService.ts
export class SfClusterService {
    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly restClient: SfRest,
        private readonly certificateService: SfCertificateService
    ) {}

    public async connectToCluster(endpoint: string): Promise<ClusterConnection> {
        // Validate endpoint
        const validatedEndpoint = this.validateEndpoint(endpoint);
        
        // Get or create configuration
        const config = await this.getOrCreateConfiguration(validatedEndpoint);
        
        // Handle certificate authentication
        const certificate = await this.certificateService.getCertificateForCluster(config);
        
        // Connect via REST API
        await this.restClient.connectToCluster(config.endpoint, certificate);
        
        // Populate cluster data
        const clusterData = await this.populateClusterData(config);
        
        return new ClusterConnection(config, clusterData);
    }

    private async populateClusterData(config: SfConfiguration): Promise<ClusterData> {
        // Parallel data fetching for better performance
        const [health, manifest, nodes, applications] = await Promise.all([
            this.restClient.getClusterHealth(),
            this.restClient.getClusterManifest(),
            this.restClient.getNodes(),
            this.restClient.getApplications()
        ]);
        
        return { health, manifest, nodes, applications };
    }
}
```

#### Task 2.2: Break Circular Dependencies
**Effort:** 2 days  
**Files:** [sfRest.ts](sfRest.ts), [sfRestClient.ts](sfRestClient.ts), [sfMgr.ts](sfMgr.ts)

**Actions:**
1. Extract interfaces for dependencies
2. Use dependency injection
3. Implement factory pattern for complex object creation
4. Remove direct instantiation in constructors

**Example:**
```typescript
// src/core/interfaces/IRestClient.ts
export interface IRestClient {
    sendRequest(request: PipelineRequest): Promise<PipelineResponse>;
}

export interface IClusterClient {
    connectToCluster(endpoint: string, cert?: clusterCertificate): Promise<void>;
    getClusterHealth(): Promise<sfModels.ClusterHealth>;
    getNodes(): Promise<sfModels.NodeInfo[]>;
}

// src/services/SfRest.ts
export class SfRest implements IClusterClient {
    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly httpClient: IRestClient  // Injected, not circular
    ) {
        this.sfApi = this.initializeClusterConnection();
    }
    
    // Implementation...
}

// src/services/SfRestClient.ts
export class SfRestClient implements IRestClient {
    constructor(
        private readonly endpoint: string,
        private readonly certOptions: CertificateOptions
    ) {}
    
    // No dependency on SfRest - circular broken
}

// src/core/factories/ServiceFactory.ts
export class ServiceFactory {
    static createClusterService(context: vscode.ExtensionContext): SfClusterService {
        const httpClient = new SfHttpClient(SfUtility, 9000);
        const restClient = new SfRestClient(endpoint, certOptions);
        const sfRest = new SfRest(context, restClient);
        const certService = new SfCertificateService(new SfPs());
        
        return new SfClusterService(context, sfRest, certService);
    }
}
```

#### Task 2.3: Separate Data Model from Business Logic
**Effort:** 2 days  
**Files:** [sfConfiguration.ts](sfConfiguration.ts)

**Actions:**
1. Split SfConfiguration into pure data class + service layer
2. Move populate methods to SfClusterService
3. Move tree item creation to separate presenter class
4. Extract icon logic to UI layer

**Example:**
```typescript
// src/models/ClusterConfiguration.ts (Pure data model)
export class ClusterConfiguration {
    public readonly endpoint: string;
    public readonly name: string;
    public certificate?: ClusterCertificate;
    public manifest?: string;
    public health?: sfModels.ClusterHealth;
    public nodes: sfModels.NodeInfo[] = [];
    public applications: sfModels.ApplicationInfo[] = [];
    
    constructor(endpoint: string, options?: ClusterConfigOptions) {
        this.endpoint = endpoint;
        this.name = this.parseClusterName(endpoint);
        this.certificate = options?.certificate;
        this.manifest = options?.manifest;
    }
    
    private parseClusterName(endpoint: string): string {
        return url.parse(endpoint).hostname || 'unknown';
    }
    
    // Getters, setters, serialization only - NO business logic
}

// src/ui/ClusterTreeItemPresenter.ts (Presentation logic)
export class ClusterTreeItemPresenter {
    constructor(private readonly context: vscode.ExtensionContext) {}
    
    public createTreeItem(config: ClusterConfiguration): TreeItem {
        const children = [
            this.createManifestItem(),
            this.createJobsItem(),
            this.createEventsItem(),
            this.createApplicationsItem(config.applications),
            this.createNodesItem(config.nodes),
            this.createSystemItem()
        ];
        
        return new TreeItem(
            config.name,
            children,
            vscode.Uri.parse(config.endpoint),
            config.health?.aggregatedHealthState,
            this.getHealthIcon(config.health?.aggregatedHealthState)
        );
    }
    
    private getHealthIcon(healthState?: string): vscode.ThemeIcon | { light: string; dark: string } {
        // Icon logic extracted from model
        const iconName = this.mapHealthStateToIcon(healthState);
        return {
            light: this.context.asAbsolutePath(path.join('resources', 'light', `${iconName}.svg`)),
            dark: this.context.asAbsolutePath(path.join('resources', 'dark', `${iconName}.svg`))
        };
    }
}

// src/services/ClusterDataService.ts (Business logic)
export class ClusterDataService {
    constructor(private readonly restClient: SfRest) {}
    
    public async populateClusterData(config: ClusterConfiguration): Promise<void> {
        const [health, manifest, nodes, applications] = await Promise.all([
            this.restClient.getClusterHealth(),
            this.restClient.getClusterManifest(),
            this.restClient.getNodes(),
            this.restClient.getApplications()
        ]);
        
        config.health = health;
        config.manifest = manifest.manifest;
        config.nodes = nodes;
        config.applications = applications;
        
        // Populate services for each application
        await Promise.all(
            applications.map(app => this.populateServices(config, app.id!))
        );
    }
    
    private async populateServices(config: ClusterConfiguration, appId: string): Promise<void> {
        const services = await this.restClient.getServices(appId);
        // Store services in appropriate structure
    }
}
```

**Deliverables:**
- [ ] SfMgr reduced from 330 to <150 lines
- [ ] New service classes created with single responsibilities
- [ ] Circular dependencies eliminated
- [ ] Clean dependency injection throughout
- [ ] SfConfiguration split into data model + services
- [ ] Tree item creation in dedicated presenter class
- [ ] All classes have less than 300 lines
- [ ] Dependency diagram showing clean architecture

**Success Criteria:**
- Each class has single, clear responsibility
- No circular dependencies (verified by build)
- Easy to mock dependencies for testing
- 80%+ test coverage for business logic

---

### Phase 3: Complete Features & Polish (Week 3) - NICE TO HAVE

**Goal:** Finish incomplete features, improve type safety, update branding/documentation

#### Task 3.1: Complete or Remove Commented Code
**Effort:** 2 days  
**Files:** [extension.ts](extension.ts), [sfRest.ts](sfRest.ts)

**Decision Matrix:**

| Code Section | File | Lines | Decision | Rationale |
|--------------|------|-------|----------|-----------|
| Azure Account Integration | extension.ts | 10-145 | **Complete** | Useful for production multi-cluster scenarios |
| FTP Explorer | extension.ts | 147-160 | **Remove** | Out of scope for SF diagnostic extension |
| File Explorer | extension.ts | 161-170 | **Remove** | Generic sample, not SF-specific |
| Node Dependencies | extension.ts | 171-180 | **Evaluate** | Could be useful for visualizing SF dependencies |
| Azure Cluster Enumeration | sfRest.ts | 304-350 | **Complete** | Requires Azure Account integration working |

**Actions for Azure Account Integration:**
1. Uncomment and refactor Azure authentication code
2. Add proper error handling
3. Implement credential caching
4. Add user flow for Azure sign-in
5. Test with multiple Azure subscriptions

**Example:**
```typescript
// src/services/AzureAuthenticationService.ts
export class AzureAuthenticationService {
    private azureAccount: AzureAccount | null = null;
    
    constructor(private readonly context: vscode.ExtensionContext) {}
    
    public async signIn(): Promise<boolean> {
        try {
            const azureAccountExtension = vscode.extensions.getExtension<AzureExtensionApiProvider>(
                'ms-vscode.azure-account'
            );
            
            if (!azureAccountExtension) {
                throw new Error('Azure Account extension not installed');
            }
            
            await azureAccountExtension.activate();
            this.azureAccount = await azureAccountExtension.exports.getApi('1.0.0');
            
            if (!(await this.azureAccount.waitForLogin())) {
                const loginResult = await vscode.commands.executeCommand('azure-account.login');
                if (!loginResult) {
                    throw new Error('Azure login cancelled or failed');
                }
            }
            
            SfUtility.showInformation('Successfully signed in to Azure');
            return true;
        } catch (error) {
            SfUtility.showError(`Azure sign-in failed: ${error.message}`);
            return false;
        }
    }
    
    public async getSubscriptions(): Promise<AzureSubscription[]> {
        if (!this.azureAccount) {
            throw new Error('Not signed in to Azure');
        }
        
        return this.azureAccount.subscriptions;
    }
    
    public async getServiceFabricClusters(subscriptionId: string): Promise<ClusterResource[]> {
        const credentials = await this.getCredentials(subscriptionId);
        const sfClient = new ServiceFabricManagementClient(credentials, subscriptionId);
        
        try {
            const clusters = await sfClient.clusters.list();
            return Array.from(clusters);
        } catch (error) {
            throw new AzureApiError('Failed to list Service Fabric clusters', { cause: error });
        }
    }
}
```

#### Task 3.2: Improve Type Safety
**Effort:** 2 days  
**Files:** All TypeScript files

**Actions:**
1. Replace `any` types with proper interfaces/types
2. Create strong types for all API responses
3. Remove unnecessary non-null assertions
4. Add type guards for runtime type checking
5. Enable stricter TypeScript compiler options
6. Fix all @ts-ignore comments

**Example:**
```typescript
// src/models/ServiceFabricApiTypes.ts
export interface ClusterHealthResponse {
    aggregatedHealthState: HealthState;
    nodeHealthStates?: NodeHealthState[];
    applicationHealthStates?: ApplicationHealthState[];
    healthEvents?: HealthEvent[];
    unhealthyEvaluations?: HealthEvaluation[];
}

export type HealthState = 'Invalid' | 'Ok' | 'Warning' | 'Error' | 'Unknown';

export interface NodeHealthState {
    name: string;
    healthState: HealthState;
    id: string;
}

// Type guard
export function isHealthState(value: string): value is HealthState {
    return ['Invalid', 'Ok', 'Warning', 'Error', 'Unknown'].includes(value);
}

// Usage in sfConfiguration.ts
private getIcon(status: HealthState | undefined): IconPath {
    if (!status || !isHealthState(status)) {
        return this.getDefaultIcon();
    }
    
    const iconName = status.toLowerCase();
    return {
        light: this.context.asAbsolutePath(path.join('resources', 'light', `${iconName}.svg`)),
        dark: this.context.asAbsolutePath(path.join('resources', 'dark', `${iconName}.svg`))
    };
}

// tsconfig.json improvements
{
    "compilerOptions": {
        "strict": true,
        "noImplicitAny": true,
        "strictNullChecks": true,
        "strictFunctionTypes": true,
        "strictBindCallApply": true,
        "strictPropertyInitialization": true,
        "noImplicitThis": true,
        "alwaysStrict": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noImplicitReturns": true,
        "noFallthroughCasesInSwitch": true,
        "noUncheckedIndexedAccess": true
    }
}
```

#### Task 3.3: Update Branding and Documentation
**Effort:** 1 day  
**Files:** [package.json](package.json), [README.md](README.md), CHANGELOG.md (new)

**Actions:**
1. Update package.json metadata
2. Create comprehensive README
3. Add CHANGELOG.md
4. Create CONTRIBUTING.md
5. Add LICENSE file
6. Create example configuration snippets
7. Add screenshots/GIFs of extension in action

**Example package.json updates:**
```json
{
    "name": "vscode-service-fabric-explorer",
    "displayName": "Service Fabric Explorer",
    "description": "Diagnostic and management tool for Azure Service Fabric clusters",
    "version": "1.0.0",
    "publisher": "jagilber",
    "author": {
        "name": "Your Name",
        "email": "your.email@example.com"
    },
    "license": "MIT",
    "repository": {
        "type": "git",
        "url": "https://github.com/jagilber/vscode-service-fabric-diagnostic-extension"
    },
    "homepage": "https://github.com/jagilber/vscode-service-fabric-diagnostic-extension#readme",
    "bugs": {
        "url": "https://github.com/jagilber/vscode-service-fabric-diagnostic-extension/issues"
    },
    "keywords": [
        "service fabric",
        "azure",
        "diagnostics",
        "cluster",
        "microservices",
        "debugging"
    ],
    "categories": [
        "Azure",
        "Debuggers",
        "Other"
    ],
    "icon": "resources/icon.png",
    "galleryBanner": {
        "color": "#0072C6",
        "theme": "dark"
    }
}
```

**Example README.md:**
```markdown
# Service Fabric Explorer for Visual Studio Code

Diagnostic and management extension for Azure Service Fabric clusters.

## Features

### Cluster Explorer
- Browse cluster topology (nodes, applications, services)
- View health status with visual indicators
- Real-time cluster monitoring
- Support for secure clusters (certificate authentication)

### Operations
- Connect to local or remote clusters
- Execute ad-hoc REST API calls
- View cluster manifests
- Download and install Service Fabric SDK
- Deploy local dev clusters

### Azure Integration
- Sign in with Azure Account
- Enumerate clusters across subscriptions
- Connect to Azure-hosted clusters

## Getting Started

### Prerequisites
- Visual Studio Code 1.60.0 or higher
- Service Fabric runtime (optional, for local dev clusters)
- Azure Account extension (optional, for Azure integration)

### Installation
1. Install from VSCode Marketplace
2. Open Command Palette (`Ctrl+Shift+P`)
3. Run `Service Fabric: Connect to Cluster`

### Connect to a Cluster
1. Open Command Palette
2. Select `Service Fabric: Set Cluster Endpoint`
3. Enter cluster endpoint (e.g., `https://mycluster.eastus.cloudapp.azure.com:19080`)
4. (Optional) Provide certificate thumbprint or common name
5. View cluster in Service Fabric Explorer panel

## Configuration

### Cluster Settings
Add clusters to your `settings.json`:
```json
{
    "serviceFabric.clusters": [
        {
            "endpoint": "https://localhost:19080",
            "clusterCertificate": {
                "thumbprint": "1234567890ABCDEF..."
            }
        }
    ]
}
```

## Commands
- `Service Fabric: Refresh View` - Refresh cluster data
- `Service Fabric: Connect to Cluster` - Connect to cluster by endpoint
- `Service Fabric: Get Clusters` - List Azure clusters
- `Service Fabric: Set Endpoint` - Configure cluster endpoint
- `Service Fabric: Deploy Dev Cluster` - Create local dev cluster
- `Service Fabric: Ad-hoc REST Call` - Execute custom REST API request

## Screenshots
[Add screenshots here]

## Known Issues
- Certificate selection from certificate store not yet implemented on Linux
- Dev cluster deployment requires admin privileges on Windows

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md)

## License
MIT - See [LICENSE](LICENSE)

## Support
File issues at: https://github.com/jagilber/vscode-service-fabric-diagnostic-extension/issues
```

**Deliverables:**
- [ ] Azure authentication feature completed and tested
- [ ] Unused sample code removed
- [ ] All `any` types replaced with proper types
- [ ] Strict TypeScript compiler options enabled
- [ ] package.json fully updated with SF branding
- [ ] Comprehensive README with screenshots
- [ ] CHANGELOG.md created
- [ ] Documentation for all commands and features

---

### Phase 4: Testing & Quality Assurance (Week 4) - MUST DO

**Goal:** Ensure reliability, create test suite, validate with real clusters

#### Task 4.1: Unit Testing
**Effort:** 3 days  
**Framework:** Mocha + Chai (already in VSCode extension template)

**Test Coverage Targets:**
- Business logic (services): 90%+
- Data models: 80%+
- Utility functions: 95%+
- UI controllers: 60%+

**Files to Test (Priority Order):**
1. **SfRestClient** - HTTP communication (critical path)
2. **SfRest** - API interactions with SF cluster
3. **SfClusterService** - Orchestration logic
4. **ClusterConfiguration** - Data model
5. **SfCertificateService** - Certificate handling
6. **Error classes** - Error handling
7. **SfHttpClient** - HTTP utilities

**Example Test Suite:**
```typescript
// test/services/SfRestClient.test.ts
import { expect } from 'chai';
import * as sinon from 'sinon';
import { SfRestClient } from '../../src/services/SfRestClient';
import { SfRest } from '../../src/sfRest';

describe('SfRestClient', () => {
    let restClient: SfRestClient;
    let mockSfRest: sinon.SinonStubbedInstance<SfRest>;
    
    beforeEach(() => {
        mockSfRest = sinon.createStubInstance(SfRest);
        restClient = new SfRestClient(mockSfRest as any);
    });
    
    afterEach(() => {
        sinon.restore();
    });
    
    describe('sendRequest', () => {
        it('should send HTTP request and return response', async () => {
            // Arrange
            const mockResponse = { status: 200, body: '{"aggregatedHealthState": "Ok"}' };
            mockSfRest.createSfAutoRestHttpOptions.returns({ host: 'localhost', port: 19080 });
            
            const invokeRequestStub = sinon.stub(restClient, 'invokeRequest').resolves(mockResponse.body);
            
            const request: PipelineRequest = {
                url: 'https://localhost:19080/$/GetClusterHealth',
                method: 'GET',
                headers: new HttpHeaders()
            };
            
            // Act
            const response = await restClient.sendRequest(request);
            
            // Assert
            expect(response.status).to.equal(200);
            expect(response.bodyAsText).to.equal(mockResponse.body);
            expect(invokeRequestStub.calledOnce).to.be.true;
        });
        
        it('should handle network errors gracefully', async () => {
            // Arrange
            const mockError = new Error('ECONNREFUSED');
            sinon.stub(restClient, 'invokeRequest').rejects(mockError);
            
            const request: PipelineRequest = {
                url: 'https://localhost:19080/$/GetClusterHealth',
                method: 'GET',
                headers: new HttpHeaders()
            };
            
            // Act & Assert
            try {
                await restClient.sendRequest(request);
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.include('ECONNREFUSED');
            }
        });
        
        it('should handle JSON parsing errors', async () => {
            // Arrange
            const invalidJson = '{"incomplete": ';
            sinon.stub(restClient, 'invokeRequest').resolves(invalidJson);
            
            const request: PipelineRequest = {
                url: 'https://localhost:19080/$/GetClusterHealth',
                method: 'GET',
                headers: new HttpHeaders()
            };
            
            // Act
            const response = await restClient.sendRequest(request);
            
            // Assert - should not throw, returns raw text
            expect(response.bodyAsText).to.equal(invalidJson);
        });
    });
    
    describe('invokeRequest with continuation tokens', () => {
        it('should not recurse when handling paginated responses', async () => {
            // This test verifies the fix for the callback anti-pattern
            // Arrange
            const mockOptions = {
                host: 'localhost',
                port: 19080,
                path: '/Nodes?api-version=6.3'
            };
            
            // Simulate first page with continuation token
            const firstPageResponse = JSON.stringify({
                ContinuationToken: 'next-page-token',
                Items: [{ name: 'Node1' }]
            });
            
            // Act
            const response = await restClient.invokeRequest(mockOptions);
            
            // Assert - should NOT make recursive call, just return first page
            expect(response).to.equal(firstPageResponse);
            // Continuation should be handled by caller (getAllPaginated)
        });
    });
});

// test/services/SfClusterService.test.ts
describe('SfClusterService', () => {
    let clusterService: SfClusterService;
    let mockRestClient: sinon.SinonStubbedInstance<SfRest>;
    let mockCertService: sinon.SinonStubbedInstance<SfCertificateService>;
    
    beforeEach(() => {
        mockRestClient = sinon.createStubInstance(SfRest);
        mockCertService = sinon.createStubInstance(SfCertificateService);
        clusterService = new SfClusterService(mockContext, mockRestClient, mockCertService);
    });
    
    describe('connectToCluster', () => {
        it('should successfully connect to cluster with valid endpoint', async () => {
            // Arrange
            const endpoint = 'https://test-cluster.eastus.cloudapp.azure.com:19080';
            const mockHealth = { aggregatedHealthState: 'Ok' };
            
            mockRestClient.connectToCluster.resolves();
            mockRestClient.getClusterHealth.resolves(mockHealth);
            mockRestClient.getClusterManifest.resolves({ manifest: '<xml>...</xml>' });
            mockRestClient.getNodes.resolves([]);
            mockRestClient.getApplications.resolves([]);
            
            // Act
            const connection = await clusterService.connectToCluster(endpoint);
            
            // Assert
            expect(connection.config.endpoint).to.equal(endpoint);
            expect(connection.data.health).to.deep.equal(mockHealth);
            expect(mockRestClient.connectToCluster.calledOnce).to.be.true;
        });
        
        it('should throw ClusterConnectionError on failure', async () => {
            // Arrange
            const endpoint = 'https://invalid-cluster.com:19080';
            mockRestClient.connectToCluster.rejects(new Error('Connection refused'));
            
            // Act & Assert
            try {
                await clusterService.connectToCluster(endpoint);
                expect.fail('Should have thrown ClusterConnectionError');
            } catch (error) {
                expect(error).to.be.instanceOf(ClusterConnectionError);
                expect(error.message).to.include('invalid-cluster.com');
            }
        });
    });
});
```

#### Task 4.2: Integration Testing
**Effort:** 2 days  
**Approach:** Test against real SF cluster (local dev cluster)

**Test Scenarios:**
1. Connect to insecure local cluster
2. Connect to secure cluster with certificate
3. Enumerate cluster nodes
4. Get application health
5. Execute ad-hoc REST API call
6. Handle cluster disconnection gracefully
7. Refresh tree view after cluster changes

**Test Environment Setup:**
```powershell
# scripts/setup-test-cluster.ps1
$ErrorActionPreference = "Stop"

Write-Host "Setting up Service Fabric test cluster..."

# Check if SDK installed
if (!(Test-Path "C:\Program Files\Microsoft SDKs\Service Fabric\Tools\PSModule\ServiceFabricSDK\ServiceFabricSDK.psm1")) {
    throw "Service Fabric SDK not installed. Run sfMgr.downloadSFSDK() first."
}

# Remove existing cluster
& "$ENV:ProgramFiles\Microsoft SDKs\Service Fabric\ClusterSetup\DevClusterSetup.ps1" -PathToClusterDataRoot "C:\SFDevCluster" -CleanCluster

# Create 5-node insecure cluster for testing
& "$ENV:ProgramFiles\Microsoft SDKs\Service Fabric\ClusterSetup\DevClusterSetup.ps1" -CreateOneNodeCluster

Write-Host "✓ Test cluster ready at http://localhost:19080"
```

**Integration Test Example:**
```typescript
// test/integration/ClusterConnection.integration.test.ts
describe('Cluster Connection Integration Tests', function() {
    this.timeout(30000); // 30 seconds for real cluster operations
    
    let sfMgr: SfMgr;
    const localClusterEndpoint = 'http://localhost:19080';
    
    before(async () => {
        // Ensure test cluster is running
        const isRunning = await checkClusterRunning(localClusterEndpoint);
        if (!isRunning) {
            console.log('Starting local test cluster...');
            await startDevCluster();
        }
        
        sfMgr = new SfMgr(mockContext);
    });
    
    after(async () => {
        // Cleanup
        await sfMgr.dispose();
    });
    
    it('should connect to local cluster and retrieve nodes', async () => {
        // Act
        await sfMgr.getCluster(localClusterEndpoint);
        const config = sfMgr.getCurrentSfConfig();
        
        // Assert
        expect(config).to.not.be.undefined;
        expect(config.nodes.length).to.be.greaterThan(0);
        expect(config.nodes[0].name).to.match(/_Node_\d+/);
    });
    
    it('should retrieve cluster health', async () => {
        // Act
        await sfMgr.getCluster(localClusterEndpoint);
        const config = sfMgr.getCurrentSfConfig();
        
        // Assert
        expect(config.health?.aggregatedHealthState).to.be.oneOf(['Ok', 'Warning', 'Error']);
    });
    
    it('should handle connection to invalid endpoint gracefully', async () => {
        // Act & Assert
        try {
            await sfMgr.getCluster('https://invalid-cluster.com:19080');
            expect.fail('Should have thrown error');
        } catch (error) {
            expect(error).to.be.instanceOf(ClusterConnectionError);
            expect(SfUtility.showError).to.have.been.calledWith(sinon.match(/invalid-cluster/));
        }
    });
});
```

#### Task 4.3: Manual Testing & Documentation
**Effort:** 1 day  

**Manual Test Plan:**
```markdown
## Manual Test Checklist

### Setup
- [ ] Install extension from VSIX
- [ ] Verify Service Fabric Explorer view appears in Activity Bar
- [ ] Check that all commands are registered in Command Palette

### Local Cluster Tests
- [ ] Deploy local dev cluster using command
- [ ] Connect to http://localhost:19080
- [ ] Verify tree view shows cluster, nodes, applications
- [ ] Refresh view manually
- [ ] Execute ad-hoc REST call: `/$/GetClusterHealth`
- [ ] Verify output in SFRest log channel

### Secure Cluster Tests
- [ ] Connect to secure cluster with certificate thumbprint
- [ ] Verify certificate is retrieved from local store
- [ ] Check that connection succeeds with valid cert
- [ ] Verify error message for invalid cert

### Azure Integration Tests (if feature completed)
- [ ] Sign in to Azure via command
- [ ] Enumerate clusters from Azure subscription
- [ ] Connect to Azure-hosted cluster
- [ ] Verify cluster data populates correctly

### Error Handling Tests
- [ ] Try connecting to non-existent endpoint
- [ ] Verify user-friendly error message displayed
- [ ] Check that extension doesn't crash
- [ ] Verify error logged to output channel

### Resource Cleanup Tests
- [ ] Connect to multiple clusters
- [ ] Reload VSCode window
- [ ] Verify no memory leaks (use Process Explorer)
- [ ] Check that child processes are terminated

### Performance Tests
- [ ] Connect to cluster with 100+ nodes
- [ ] Measure tree view population time (should be <10s)
- [ ] Verify continuation token pagination works
- [ ] Check that UI remains responsive during data fetch
```

**Deliverables:**
- [ ] 80%+ code coverage for business logic
- [ ] All unit tests passing
- [ ] Integration test suite for core scenarios
- [ ] Manual test plan completed
- [ ] Test cluster setup scripts
- [ ] Performance benchmarks documented
- [ ] Test report with metrics

---

## Risk Assessment

| Risk | Severity | Probability | Mitigation |
|------|----------|-------------|------------|
| Breaking existing functionality during refactor | High | Medium | Comprehensive tests before refactor, feature flags |
| Azure Account extension API changes | Medium | Low | Abstract integration behind interface, version pinning |
| Certificate authentication issues on Linux | Medium | Medium | Cross-platform testing, fallback to manual cert input |
| SDK download URL changes | Low | Low | Add URL validation, update check mechanism |
| Performance degradation with large clusters | Medium | Medium | Load testing, pagination, virtual scrolling in tree view |
| Extended timeline due to scope creep | Medium | High | Strict phase boundaries, MVP definition |

---

## Success Metrics

### Code Quality
- [ ] 0 unhandled promise rejections in logs
- [ ] Code coverage >80% for business logic
- [ ] <5 `any` types remaining (unavoidable external APIs only)
- [ ] All files <300 lines
- [ ] Cyclomatic complexity <20 for all methods

### Performance
- [ ] Tree view population: <10s for 100 nodes
- [ ] Memory usage: <100MB baseline, <200MB with 5 clusters connected
- [ ] Extension activation: <2s
- [ ] Command execution: <1s for local operations

### User Experience
- [ ] 0 crashes reported in testing
- [ ] All errors have actionable messages
- [ ] Documentation covers 100% of features
- [ ] All commands discoverable via Command Palette
- [ ] Tree view has visual health indicators

### Maintainability
- [ ] Clear separation of concerns (data/business/UI)
- [ ] Dependency injection used throughout
- [ ] No circular dependencies
- [ ] READMEs for all modules
- [ ] Architecture diagram up to date

---

## Timeline Summary

| Phase | Duration | Dependencies | Deliverables |
|-------|----------|--------------|--------------|
| Phase 1: Critical Fixes | 1 week | None | Callback fixes, error handling, cleanup |
| Phase 2: Architecture | 1 week | Phase 1 complete | Service decomposition, clean architecture |
| Phase 3: Features & Polish | 1 week | Phase 2 complete | Azure integration, types, branding |
| Phase 4: Testing & QA | 1 week | Phase 3 complete | Test suite, integration tests, validation |

**Total:** 4 weeks  
**Build-in buffer:** +20% (5 days) = 25 working days (~5 weeks)

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Prioritize phases** - Can Phase 3 be deferred?
3. **Setup test environment** - Local SF cluster, CI/CD
4. **Create tracking board** - GitHub Projects or Azure DevOps
5. **Begin Phase 1** - Start with Task 1.1 (HTTP refactoring)

---

## Appendix: Code Examples

### A. Custom Error Classes
```typescript
// src/models/Errors.ts
export class ServiceFabricError extends Error {
    constructor(message: string, public readonly context?: Record<string, any>) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ClusterConnectionError extends ServiceFabricError {}
export class CertificateError extends ServiceFabricError {}
export class NetworkError extends ServiceFabricError {}
export class HttpError extends NetworkError {
    constructor(message: string, context: { status: number; url: string }) {
        super(message, context);
    }
}
export class PaginationError extends ServiceFabricError {}
export class AzureApiError extends ServiceFabricError {}
```

### B. Clean Async HTTP Client
```typescript
// src/services/SfHttpClient.ts (complete implementation)
import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import { pipeline } from 'stream/promises';
import { SfUtility, debugLevel } from '../utils/sfUtility';
import { NetworkError, HttpError } from '../models/Errors';

export interface HttpClientOptions {
    timeout?: number;
    certificate?: string;
    key?: string;
    rejectUnauthorized?: boolean;
}

export class SfHttpClient {
    constructor(
        private readonly options: HttpClientOptions = {}
    ) {}

    public async get(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const parsedUrl = new URL(url);
            const requestOptions: https.RequestOptions = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || 443,
                path: parsedUrl.pathname + parsedUrl.search,
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                timeout: this.options.timeout || 9000,
                cert: this.options.certificate,
                key: this.options.key,
                rejectUnauthorized: this.options.rejectUnauthorized ?? false
            };

            const request = https.request(requestOptions, (response) => {
                const chunks: Buffer[] = [];
                
                response.on('data', (chunk: Buffer) => {
                    chunks.push(chunk);
                });
                
                response.on('end', () => {
                    const body = Buffer.concat(chunks).toString('utf-8');
                    
                    if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
                        resolve(body);
                    } else {
                        reject(new HttpError(
                            `HTTP ${response.statusCode}: ${response.statusMessage}`,
                            { status: response.statusCode || 0, url }
                        ));
                    }
                });
            });

            request.on('error', (error) => {
                SfUtility.outputLog(`HTTP GET failed: ${url}`, error, debugLevel.error);
                reject(new NetworkError(`Request to ${url} failed`, { cause: error }));
            });

            request.on('timeout', () => {
                request.destroy();
                reject(new NetworkError(`Request to ${url} timed out`, { timeout: this.options.timeout }));
            });

            request.end();
        });
    }

    public async download(url: string, outputPath: string, onProgress?: (bytes: number) => void): Promise<void> {
        return new Promise((resolve, reject) => {
            const parsedUrl = new URL(url);
            const fileStream = fs.createWriteStream(outputPath);
            let downloadedBytes = 0;

            const requestOptions: https.RequestOptions = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || 443,
                path: parsedUrl.pathname + parsedUrl.search,
                method: 'GET',
                timeout: this.options.timeout || 30000
            };

            const request = https.request(requestOptions, (response) => {
                if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
                    response.on('data', (chunk: Buffer) => {
                        downloadedBytes += chunk.length;
                        onProgress?.(downloadedBytes);
                    });

                    response.pipe(fileStream);

                    fileStream.on('finish', () => {
                        fileStream.close();
                        SfUtility.outputLog(`Downloaded ${downloadedBytes} bytes to ${outputPath}`);
                        resolve();
                    });
                } else {
                    fileStream.close();
                    fs.unlink(outputPath, () => {});
                    reject(new HttpError(
                        `Download failed with status ${response.statusCode}`,
                        { status: response.statusCode || 0, url }
                    ));
                }
            });

            request.on('error', (error) => {
                fileStream.close();
                fs.unlink(outputPath, () => {});
                reject(new NetworkError(`Download from ${url} failed`, { cause: error }));
            });

            request.on('timeout', () => {
                request.destroy();
                fileStream.close();
                fs.unlink(outputPath, () => {});
                reject(new NetworkError(`Download from ${url} timed out`));
            });

            request.end();
        });
    }
}
```

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Author:** GitHub Copilot (Claude Sonnet 4.5)
