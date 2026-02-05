# Logical Architecture

## Overview

This document describes the logical architecture of the Service Fabric Diagnostic Extension using various architectural views and interaction patterns. It complements the physical [ARCHITECTURE.md](ARCHITECTURE.md) with behavioral and logical perspectives.

## C4 Model: System Context

```mermaid
C4Context
    title System Context - Service Fabric Extension

    Person(devops, "DevOps Engineer", "Manages Service Fabric clusters, deploys applications")
    Person(developer, "Developer", "Tests applications on Service Fabric")
    Person(sre, "SRE", "Monitors and troubleshoots production clusters")
    
    System(extension, "Service Fabric Extension", "VS Code extension for managing Service Fabric clusters")
    
    System_Ext(vscode, "Visual Studio Code", "Code editor and extension host")
    System_Ext(sfcluster, "Service Fabric Cluster", "Distributed application platform")
    System_Ext(azuread, "Azure Active Directory", "Identity and access management")
    System_Ext(keyvault, "Azure Key Vault", "Secrets and certificate management")
    
    Rel(devops, extension, "Uses to manage clusters")
    Rel(developer, extension, "Uses to test applications")
    Rel(sre, extension, "Uses for diagnostics")
    
    Rel(extension, vscode, "Runs within", "Extension API")
    Rel(extension, sfcluster, "Manages via", "REST API / HTTPS")
    Rel(extension, azuread, "Authenticates with", "OAuth 2.0")
    Rel(extension, keyvault, "Retrieves secrets from", "Key Vault API")
    
    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="2")
```

## C4 Model: Container Diagram

```mermaid
C4Container
    title Container Diagram - Service Fabric Extension

    Container_Boundary(extension, "Service Fabric Extension") {
        Container(treeview, "Tree View Provider", "TypeScript", "Displays cluster hierarchy")
        Container(webview, "Management WebView", "HTML/CSS/JS", "Interactive management UI")
        Container(commands, "Command Handlers", "TypeScript", "Orchestrates user actions")
        Container(services, "Service Layer", "TypeScript", "Business logic and workflows")
        Container(clients, "API Clients", "TypeScript", "REST and SDK clients")
        Container(cache, "Cache Manager", "TypeScript", "LRU cache for API responses")
        Container(secrets, "Secret Storage", "TypeScript", "Secure credential management")
    }
    
    System_Ext(vscode, "VS Code API", "Host environment")
    System_Ext(sfapi, "Service Fabric REST API", "Cluster management")
    System_Ext(oscred, "OS Credential Store", "Encrypted storage")
    
    Rel(treeview, services, "Uses", "Async")
    Rel(webview, commands, "Sends messages to", "postMessage")
    Rel(commands, services, "Invokes", "Async")
    Rel(services, clients, "Uses", "Async")
    Rel(services, cache, "Reads/writes", "Sync")
    Rel(clients, sfapi, "Calls", "HTTPS/JSON")
    Rel(secrets, oscred, "Stores secrets in", "Encrypted")
    
    Rel(vscode, treeview, "Renders")
    Rel(vscode, webview, "Hosts")
    Rel(vscode, commands, "Executes")
    
    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

## C4 Model: Component Diagram (Service Layer)

```mermaid
C4Component
    title Component Diagram - Service Layer

    Container_Boundary(services, "Service Layer") {
        Component(clusterSvc, "Cluster Service", "TypeScript", "Cluster operations orchestrator")
        Component(appSvc, "Application Service", "TypeScript", "App lifecycle management")
        Component(nodeSvc, "Node Service", "TypeScript", "Node operations")
        Component(healthSvc, "Health Service", "TypeScript", "Health aggregation")
        Component(deploySvc, "Deployment Service", "TypeScript", "Deployment orchestration")
        Component(cmdGen, "Command Generator", "TypeScript", "PowerShell/CLI generator")
    }
    
    Container_Ext(restClient, "REST Client", "HTTP client")
    Container_Ext(cache, "Cache Manager", "LRU cache")
    Container_Ext(validator, "Validators", "Input validation")
    
    Rel(clusterSvc, restClient, "Uses for API calls")
    Rel(clusterSvc, cache, "Caches responses")
    Rel(clusterSvc, healthSvc, "Delegates to")
    Rel(clusterSvc, nodeSvc, "Delegates to")
    
    Rel(appSvc, restClient, "Uses for API calls")
    Rel(appSvc, deploySvc, "Uses for deployments")
    Rel(appSvc, validator, "Validates input")
    
    Rel(deploySvc, restClient, "Creates applications")
    Rel(healthSvc, cache, "Caches health data")
    Rel(cmdGen, clusterSvc, "Gets cluster info")
    
    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

## Data Flow Architecture

```mermaid
flowchart TB
    subgraph UI["Presentation Layer"]
        TreeView[Tree View]
        WebView[Management WebView]
        Commands[Command Palette]
    end
    
    subgraph Application["Application Layer"]
        CommandHandler[Command Handlers]
        EventBus[Event Bus]
        StateManager[State Manager]
    end
    
    subgraph Domain["Domain Layer"]
        ClusterService[Cluster Service]
        AppService[Application Service]
        HealthService[Health Service]
        DeployService[Deployment Service]
    end
    
    subgraph Infrastructure["Infrastructure Layer"]
        RestClient[REST Client]
        CacheManager[Cache Manager]
        SecretStorage[Secret Storage]
        FileSystem[File System]
    end
    
    subgraph External["External Systems"]
        SFAPI[Service Fabric API]
        OSStore[OS Credential Store]
    end
    
    TreeView -->|User Action| CommandHandler
    WebView -->|postMessage| CommandHandler
    Commands -->|Execute| CommandHandler
    
    CommandHandler -->|Invoke| ClusterService
    CommandHandler -->|Invoke| AppService
    CommandHandler -->|Update State| StateManager
    
    ClusterService -->|Emit Events| EventBus
    ClusterService -->|API Call| RestClient
    ClusterService -->|Get/Set| CacheManager
    
    AppService -->|Delegate| DeployService
    HealthService -->|Get Cached| CacheManager
    
    RestClient -->|HTTPS| SFAPI
    SecretStorage -->|Encrypt/Decrypt| OSStore
    
    EventBus -.->|Notify| TreeView
    StateManager -.->|Update| TreeView
    StateManager -.->|Update| WebView
    
    style UI fill:#4169E1,color:#fff
    style Application fill:#32CD32,color:#fff
    style Domain fill:#FFD700
    style Infrastructure fill:#FF6B6B
    style External fill:#9370DB,color:#fff
```

## Interaction: Cluster Connection Flow

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant TreeView
    participant Commands
    participant ClusterService
    participant SecretStorage
    participant RestClient
    participant SFAPI as Service Fabric API
    
    User->>TreeView: Click "Add Cluster"
    TreeView->>Commands: Execute addClusterEndpoint
    Commands->>User: Prompt for endpoint URL
    User->>Commands: Enter https://mycluster:19080
    
    Commands->>ClusterService: validateEndpoint(url)
    ClusterService->>RestClient: HEAD /$/GetClusterManifest
    RestClient->>SFAPI: HTTP Request
    
    alt HTTPS Cluster
        SFAPI-->>RestClient: HTTP 401 Unauthorized
        RestClient-->>ClusterService: Auth Required
        ClusterService-->>Commands: Requires Certificate
        Commands->>User: Prompt for thumbprint/PEM
        User->>Commands: Provide certificate details
        Commands->>SecretStorage: storeSecret(thumbprint)
        SecretStorage->>SecretStorage: Encrypt
        SecretStorage-->>Commands: Success
    else HTTP Cluster
        SFAPI-->>RestClient: HTTP 200 OK
        RestClient-->>ClusterService: Connection OK
    end
    
    Commands->>User: Prompt for cluster name
    User->>Commands: Enter "Production Cluster"
    
    Commands->>ClusterService: saveClusterConfig(config)
    ClusterService->>ClusterService: Update configuration
    ClusterService-->>Commands: Config Saved
    
    Commands->>TreeView: refresh()
    TreeView->>ClusterService: getClusters()
    ClusterService-->>TreeView: Return cluster list
    TreeView->>TreeView: Render new cluster node
    TreeView-->>User: Display cluster in tree
```

## Interaction: Application Deployment Flow

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant TreeView
    participant DeployService
    participant FileSystem
    participant Validator
    participant RestClient
    participant SFAPI as Service Fabric API
    participant CacheManager
    
    User->>TreeView: Right-click Cluster → Deploy App
    TreeView->>User: Show folder picker
    User->>FileSystem: Select app package folder
    FileSystem-->>User: Folder selected
    
    User->>DeployService: deployApplication(folderPath)
    DeployService->>FileSystem: Read ApplicationManifest.xml
    FileSystem-->>DeployService: Manifest content
    
    DeployService->>Validator: validateManifest(manifest)
    Validator->>Validator: Check required fields
    Validator->>Validator: Validate versions
    Validator-->>DeployService: Validation result
    
    alt Invalid Manifest
        DeployService-->>User: Show validation errors
    else Valid Manifest
        DeployService->>User: Show deployment params form
        User->>DeployService: Confirm parameters
        
        DeployService->>RestClient: POST /ImageStore/.../$/upload
        RestClient->>SFAPI: Upload application package
        SFAPI-->>RestClient: Upload complete
        
        DeployService->>RestClient: POST /ApplicationTypes/$/Provision
        RestClient->>SFAPI: Provision app type
        SFAPI-->>RestClient: Provisioned
        
        DeployService->>RestClient: POST /Applications/$/Create
        RestClient->>SFAPI: Create app instance
        SFAPI-->>RestClient: Application created
        
        RestClient-->>DeployService: Deployment success
        DeployService->>CacheManager: invalidate(applicationsCache)
        DeployService->>TreeView: refresh()
        DeployService-->>User: Show success notification
    end
```

## Interaction: Tree View Loading with Caching

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant TreeView
    participant ClusterService
    participant CacheManager
    participant RestClient
    participant SFAPI as Service Fabric API
    
    User->>TreeView: Expand cluster node
    TreeView->>ClusterService: getClusterHealth(clusterId)
    ClusterService->>CacheManager: get(healthCacheKey)
    
    alt Cache Hit (Fresh)
        CacheManager-->>ClusterService: Return cached data
        ClusterService-->>TreeView: Health data
        TreeView->>TreeView: Render nodes (green/yellow/red)
        TreeView-->>User: Display health status
    else Cache Miss/Expired
        CacheManager-->>ClusterService: null
        ClusterService->>RestClient: GET /$/GetClusterHealth
        RestClient->>SFAPI: HTTPS request
        SFAPI-->>RestClient: Health JSON
        RestClient-->>ClusterService: Parsed health data
        
        ClusterService->>CacheManager: set(key, data, ttl=30s)
        CacheManager-->>ClusterService: Cached
        
        ClusterService-->>TreeView: Health data
        TreeView->>TreeView: Render nodes
        TreeView-->>User: Display health status
    end
    
    User->>TreeView: Expand applications node
    TreeView->>ClusterService: getApplications(clusterId)
    ClusterService->>CacheManager: get(appsCacheKey)
    CacheManager-->>ClusterService: null (not cached)
    
    ClusterService->>RestClient: GET /Applications
    RestClient->>SFAPI: HTTPS request
    SFAPI-->>RestClient: Applications JSON
    RestClient-->>ClusterService: Application list
    
    ClusterService->>CacheManager: set(key, data, ttl=5m)
    ClusterService-->>TreeView: Application list
    TreeView->>TreeView: Render app nodes
    TreeView-->>User: Display applications
```

## State Management Architecture

```mermaid
stateDiagram-v2
    [*] --> Uninitialized: Extension Activates
    
    Uninitialized --> Loading: Load Configuration
    Loading --> Ready: Config Loaded
    Loading --> Error: Load Failed
    
    Ready --> Connecting: User Adds Cluster
    Connecting --> Connected: Connection Success
    Connecting --> Error: Connection Failed
    
    Connected --> Fetching: Expand Tree Node
    Fetching --> Displaying: Data Retrieved
    Fetching --> Error: Fetch Failed
    
    Displaying --> Refreshing: Auto/Manual Refresh
    Refreshing --> Displaying: Refresh Complete
    Refreshing --> Error: Refresh Failed
    
    Connected --> Deploying: Deploy Application
    Deploying --> Validating: Validate Package
    Validating --> Uploading: Validation Success
    Validating --> Error: Validation Failed
    Uploading --> Provisioning: Upload Complete
    Provisioning --> Creating: Provision Success
    Creating --> Connected: Create Success
    Creating --> Error: Deploy Failed
    
    Connected --> Operating: Execute Node Operation
    Operating --> Connected: Operation Success
    Operating --> Error: Operation Failed
    
    Error --> Ready: Reset/Retry
    Error --> Connected: Retry Connection
    
    Connected --> Disconnecting: Remove Cluster
    Disconnecting --> Ready: Cleanup Complete
    
    Ready --> [*]: Extension Deactivates
```

## Error Handling Flow

```mermaid
flowchart TD
    Error[Error Occurs] --> Type{Error Type}
    
    Type -->|Network| Network[Network Error]
    Type -->|Authentication| Auth[Auth Error]
    Type -->|Validation| Validation[Validation Error]
    Type -->|API Error| API[API Error]
    Type -->|Unknown| Unknown[Unknown Error]
    
    Network --> Retryable{Retryable?}
    Retryable -->|Yes| Retry[Retry with Backoff]
    Retryable -->|No| LogNetwork[Log Error]
    Retry --> Attempt{Attempt < Max?}
    Attempt -->|Yes| Network
    Attempt -->|No| LogNetwork
    
    Auth --> CheckCert{Cert Valid?}
    CheckCert -->|No| PromptCert[Prompt for Certificate]
    CheckCert -->|Yes| LogAuth[Log Auth Error]
    PromptCert --> Reconfigure[Update Configuration]
    
    Validation --> ShowValidation[Show Validation Errors]
    ShowValidation --> UserFix[User Fixes Input]
    
    API --> StatusCode{Status Code}
    StatusCode -->|400-499| ClientError[Client Error]
    StatusCode -->|500-599| ServerError[Server Error]
    ClientError --> LogClient[Log Client Error]
    ServerError --> RetryAPI[Retry API Call]
    
    Unknown --> LogUnknown[Log with Stack Trace]
    
    LogNetwork --> Notify[Notify User]
    LogAuth --> Notify
    LogClient --> Notify
    LogUnknown --> Notify
    RetryAPI --> StatusCheck{Success?}
    StatusCheck -->|Yes| Success[Operation Success]
    StatusCheck -->|No| Notify
    
    Notify --> Telemetry[Send Telemetry]
    UserFix --> Success
    Reconfigure --> Success
    
    style Error fill:#DC143C,color:#fff
    style Success fill:#32CD32,color:#fff
    style Notify fill:#FFD700
    style Telemetry fill:#4169E1,color:#fff
```

## Cache Strategy

```mermaid
flowchart LR
    subgraph CachePolicy["Cache Policy"]
        direction TB
        P1[Cluster Health: 30s TTL]
        P2[Cluster Manifest: 5m TTL]
        P3[Application List: 5m TTL]
        P4[Node List: 1m TTL]
        P5[Service List: 2m TTL]
        P6[Partition/Replica: 1m TTL]
    end
    
    subgraph Invalidation["Cache Invalidation"]
        direction TB
        I1[Write Operations → Invalidate]
        I2[Manual Refresh → Clear]
        I3[TTL Expiry → Remove]
        I4[Memory Limit → LRU Evict]
    end
    
    subgraph Storage["Cache Storage"]
        direction TB
        S1[In-Memory Map]
        S2[Max Size: 100 MB]
        S3[LRU Eviction]
        S4[Entry: key, value, ttl, timestamp]
    end
    
    CachePolicy --> API[API Request]
    API --> Check{Cache Hit?}
    
    Check -->|Yes + Fresh| Return[Return Cached]
    Check -->|Yes + Stale| Remove[Remove Entry]
    Check -->|No| Fetch[Fetch from API]
    
    Remove --> Fetch
    Fetch --> Store[Store in Cache]
    Store --> Storage
    
    Invalidation -.->|Triggers| Remove
    Storage -.->|Enforces| Invalidation
    
    style CachePolicy fill:#4169E1,color:#fff
    style Invalidation fill:#FFD700
    style Storage fill:#32CD32,color:#fff
```

## Security Architecture

```mermaid
flowchart TD
    subgraph Input["Input Security"]
        I1[User Input] --> I2[Validation]
        I2 --> I3[Sanitization]
        I3 --> I4[Length Limits]
    end
    
    subgraph Secrets["Secret Management"]
        S1[User Credentials] --> S2[SecretStorage API]
        S2 --> S3[OS Credential Store]
        S3 --> S4[Windows: Credential Manager]
        S3 --> S5[macOS: Keychain]
        S3 --> S6[Linux: Secret Service]
    end
    
    subgraph Transport["Transport Security"]
        T1[API Requests] --> T2{Protocol}
        T2 -->|HTTP| T3[Dev Only - Warning]
        T2 -->|HTTPS| T4[Certificate Validation]
        T4 --> T5[TLS 1.2+]
        T5 --> T6[Secure Connection]
    end
    
    subgraph Logging["Secure Logging"]
        L1[Log Events] --> L2[PII Detection]
        L2 --> L3[Secret Redaction]
        L3 --> L4[Sanitized Logs]
        L4 --> L5[Output Channel]
    end
    
    Input --> Application[Application Logic]
    Secrets --> Application
    Application --> Transport
    Transport --> Logging
    
    style Input fill:#4169E1,color:#fff
    style Secrets fill:#DC143C,color:#fff
    style Transport fill:#32CD32,color:#fff
    style Logging fill:#FFD700
```

## Extension Lifecycle

## Performance Optimization Strategies

## Dependency Graph

See [ARCHITECTURE.md](ARCHITECTURE.md) for the complete module structure and dependencies.

## Testing Strategy Architecture

```mermaid
graph TB
    subgraph Unit["Unit Tests"]
        U1[Pure Functions]
        U2[Validators]
        U3[Utilities]
        U4[Transformers]
        U5[Cache Logic]
    end
    
    subgraph Integration["Integration Tests"]
        I1[API Clients]
        I2[Service Layer]
        I3[Cache Integration]
        I4[Config Management]
    end
    
    subgraph E2E["E2E Tests"]
        E1[Tree View Operations]
        E2[Command Execution]
        E3[Deployment Workflow]
        E4[Error Scenarios]
    end
    
    subgraph Mocks["Test Doubles"]
        M1[Mock REST API]
        M2[Mock VS Code API]
        M3[Mock File System]
        M4[Stub Timers]
    end
    
    Unit --> Mocks
    Integration --> Mocks
    E2E --> Mocks
    
    Unit --> CI[CI Pipeline]
    Integration --> CI
    E2E --> CI
    
    CI --> Coverage{80%+ Coverage?}
    Coverage -->|Yes| Deploy[Deploy/Release]
    Coverage -->|No| Block[Block Merge]
    
    style Unit fill:#90EE90
    style Integration fill:#FFD700
    style E2E fill:#FF6B6B
    style CI fill:#4169E1,color:#fff
```

## Event-Driven Architecture

## Telemetry and Observability

## Module Interaction Matrix

| Module | TreeView | WebView | Commands | Services | RestClient | Cache | Secrets |
|--------|----------|---------|----------|----------|------------|-------|---------|
| **TreeView** | - | None | Event | Read | None | None | None |
| **WebView** | None | - | Message | Read | None | None | None |
| **Commands** | Update | Update | - | Read/Write | None | None | Read |
| **Services** | Notify | Notify | Return | - | Call | Read/Write | Read |
| **RestClient** | None | None | None | Return | - | None | Read |
| **Cache** | None | None | None | Return | None | - | None |
| **Secrets** | None | None | Return | Return | Config | None | - |

**Legend:**
- **Read**: Reads data without modification
- **Write**: Modifies state
- **Call**: Invokes methods
- **Return**: Returns data
- **Update**: Triggers UI update
- **Notify**: Sends event notification
- **Message**: Posts message
- **Event**: Fires event
- **Config**: Provides configuration
- **None**: No direct interaction

---

*This document provides behavioral and logical views of the architecture. For physical structure and code organization, see [ARCHITECTURE.md](ARCHITECTURE.md).*
