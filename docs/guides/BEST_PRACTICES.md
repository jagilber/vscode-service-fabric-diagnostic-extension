# Best Practices Guide

## Overview

This guide outlines development, security, testing, and operational best practices for the Service Fabric Diagnostic Extension.

## Development Workflow

```mermaid
flowchart TD
    Start([Start Development]) --> Branch[Create Feature Branch]
    Branch --> Code[Write Code]
    Code --> Tests[Write/Update Tests]
    Tests --> Lint[Run Linter]
    Lint --> LintFail{Lint Pass?}
    LintFail -->|No| FixLint[Fix Lint Issues]
    FixLint --> Lint
    LintFail -->|Yes| Compile[Compile TypeScript]
    Compile --> CompileFail{Build Pass?}
    CompileFail -->|No| FixBuild[Fix Build Errors]
    FixBuild --> Compile
    CompileFail -->|Yes| UnitTests[Run Unit Tests]
    UnitTests --> TestFail{Tests Pass?}
    TestFail -->|No| FixTests[Fix Test Failures]
    FixTests --> Tests
    TestFail -->|Yes| Integration[Run Integration Tests]
    Integration --> IntFail{Integration Pass?}
    IntFail -->|No| Debug[Debug Issues]
    Debug --> Code
    IntFail -->|Yes| Review[Self Code Review]
    Review --> Commit[Commit Changes]
    Commit --> Push[Push to Remote]
    Push --> PR[Create Pull Request]
    PR --> CIChecks{CI Checks Pass?}
    CIChecks -->|No| FixCI[Fix CI Issues]
    FixCI --> Code
    CIChecks -->|Yes| PeerReview[Peer Review]
    PeerReview --> Approved{Approved?}
    Approved -->|No| Address[Address Feedback]
    Address --> Code
    Approved -->|Yes| Merge[Merge to Main]
    Merge --> End([Complete])
    
    style Start fill:#90EE90
    style End fill:#90EE90
    style Merge fill:#4169E1,color:#fff
    style PR fill:#FFD700
    style Tests fill:#FF6B6B
    style UnitTests fill:#FF6B6B
    style Integration fill:#FF6B6B
```

## Code Quality Standards

## Security Best Practices

## Testing Strategy

```mermaid
graph TB
    subgraph Unit["Unit Tests (Fast)"]
        direction LR
        U1[Pure Functions] --> U2[Business Logic]
        U2 --> U3[Utilities]
        U3 --> U4[Validators]
        U4 --> U5[Transformers]
    end
    
    subgraph Integration["Integration Tests (Medium)"]
        direction LR
        I1[API Clients] --> I2[Service Layer]
        I2 --> I3[Cache Manager]
        I3 --> I4[State Management]
    end
    
    subgraph E2E["End-to-End Tests (Slow)"]
        direction LR
        E1[User Workflows] --> E2[TreeView Operations]
        E2 --> E3[Command Execution]
        E3 --> E4[WebView Interactions]
    end
    
    Unit --> Integration
    Integration --> E2E
    
    Unit -.->|80%+ Coverage| CoverageGate{Coverage Gate}
    CoverageGate -->|Pass| CI[CI Pipeline]
    CoverageGate -->|Fail| Block[Block Merge]
    
    E2E -.->|All Pass| CI
    E2E -.->|Fail| Block
    
    CI --> Deploy[Deploy/Release]
    Block --> Fix[Fix & Retry]
    Fix --> Unit
    
    style Unit fill:#90EE90
    style Integration fill:#FFD700
    style E2E fill:#FF6B6B
    style CI fill:#4169E1,color:#fff
    style Block fill:#DC143C,color:#fff
```

## Performance Optimization

## Error Handling Patterns

```mermaid
sequenceDiagram
    participant User
    participant Extension
    participant API as Service Fabric API
    participant Logger
    participant UI
    
    User->>Extension: Execute Command
    Extension->>Extension: Validate Input
    
    alt Invalid Input
        Extension->>UI: Show Error Message
        Extension->>Logger: Log Validation Error
        UI-->>User: Display User-Friendly Error
    else Valid Input
        Extension->>API: Make API Call
        
        alt API Success
            API-->>Extension: Return Data
            Extension->>Logger: Log Success (Info)
            Extension->>UI: Update UI
            UI-->>User: Show Success
        else API Error (Retryable)
            API-->>Extension: 5xx Error
            Extension->>Extension: Retry with Backoff
            Extension->>Logger: Log Retry Attempt
            Extension->>API: Retry Request
            
            alt Retry Success
                API-->>Extension: Return Data
                Extension->>Logger: Log Success
                Extension->>UI: Update UI
            else Retry Failed
                Extension->>Logger: Log Error (Error Level)
                Extension->>UI: Show Error + Retry Button
                UI-->>User: Error + Action
            end
        else API Error (Not Retryable)
            API-->>Extension: 4xx Error
            Extension->>Logger: Log Error (Warn Level)
            Extension->>UI: Show Error Message
            UI-->>User: Display Error + Guidance
        else Network Error
            API--XExtension: Connection Failed
            Extension->>Logger: Log Network Error
            Extension->>UI: Show Connectivity Error
            UI-->>User: Check Connection
        end
    end
```

## Branching Strategy

We follow a Git Flow branching model:
- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/***: New features and enhancements
- **hotfix/***: Emergency fixes for production

## Release Checklist

## Key Principles

### 1. **Security First**
- Never log sensitive data (secrets, PII, credentials)
- Use VS Code SecretStorage for credentials
- Validate and sanitize all user input
- Run security scans in CI/CD pipeline
- Keep dependencies up to date

### 2. **Performance Conscious**
- Cache API responses with appropriate TTL
- Use lazy loading for tree nodes
- Batch multiple API calls when possible
- Debounce/throttle high-frequency events
- Profile and optimize hot paths

### 3. **User Experience**
- Provide clear error messages with actionable guidance
- Show loading indicators for long operations
- Enable async operations with cancellation
- Preserve user context (tree expansion, selection)
- Support both mouse and keyboard navigation

### 4. **Maintainability**
- Write self-documenting code with clear names
- Add JSDoc comments for public APIs
- Keep functions small and focused (< 50 lines)
- Follow SOLID principles
- Refactor when adding third feature to similar code

### 5. **Testability**
- Write tests before or alongside implementation
- Mock external dependencies (API, file system, VS Code API)
- Test edge cases and error scenarios
- Maintain 80%+ code coverage
- Run tests locally before pushing

### 6. **Observability**
- Use structured logging with consistent levels
- Include correlation IDs for request tracing
- Log errors with full context (stack traces, request data)
- Sanitize logs to prevent PII leakage
- Use telemetry for usage analytics (anonymized)

## Code Review Checklist

- [ ] **Functionality**: Code works as intended and handles edge cases
- [ ] **Tests**: Adequate test coverage with passing tests
- [ ] **Security**: No secrets logged, input validated, dependencies updated
- [ ] **Performance**: No unnecessary loops, API calls, or blocking operations
- [ ] **Error Handling**: Proper try-catch blocks with meaningful error messages
- [ ] **Documentation**: JSDoc comments for public APIs, complex logic explained
- [ ] **Code Style**: Follows ESLint rules, consistent naming conventions
- [ ] **Dependencies**: New dependencies justified, licenses compatible
- [ ] **Breaking Changes**: Documented and versioned appropriately
- [ ] **Accessibility**: Keyboard navigation, screen reader support where applicable

## Common Anti-Patterns to Avoid

### ❌ Don't Do This

```typescript
// Logging secrets
console.log(`Certificate thumbprint: ${thumbprint}`);
SfUtility.outputLog(`Secret length: ${secret.length}`);

// Synchronous file operations
const data = fs.readFileSync(path);

// Unhandled promise rejections
api.getClusterHealth(endpoint); // No .catch() or try-catch

// Hardcoded values
const endpoint = 'https://mycluster.westus.cloudapp.azure.com:19080';

// Tight coupling
class TreeView {
    private api = new ServiceFabricRestClient(); // Direct instantiation
}
```

### ✅ Do This Instead

```typescript
// Sanitized logging
SfUtility.outputLog(`Certificate configured for cluster: ${clusterName}`);
SfUtility.outputLog(`Secret retrieved successfully`, debugLevel.debug);

// Async file operations
const data = await fs.promises.readFile(path);

// Proper error handling
try {
    await api.getClusterHealth(endpoint);
} catch (error) {
    SfUtility.outputLog(`Failed to get cluster health: ${error.message}`, debugLevel.error);
    vscode.window.showErrorMessage('Unable to retrieve cluster health. Please check connectivity.');
}

// Configuration-driven
const endpoint = vscode.workspace.getConfiguration('serviceFabric').get<string>('endpoint');

// Dependency injection
class TreeView {
    constructor(private api: IServiceFabricClient) {}
}
```

## CI/CD Pipeline Configuration

## Resource Limits

| Resource | Limit | Rationale |
|----------|-------|-----------|
| API Cache TTL | 30s - 5m | Balance freshness and performance |
| API Timeout | 30s | Prevent hanging requests |
| Max Retry Attempts | 3 | Avoid infinite loops |
| Concurrent API Calls | 5 | Rate limiting |
| Tree Node Children | 1000 | UI performance |
| Log File Size | 10 MB | Disk space management |
| WebView Memory | 100 MB | Browser performance |

## Support and Maintenance

- **Security Vulnerabilities**: Fix within 7 days, release patch version
- **Critical Bugs**: Fix within 14 days, release patch version
- **Feature Requests**: Triage weekly, implement in feature releases
- **Dependencies**: Update monthly, test thoroughly
- **VS Code API**: Upgrade engine within 30 days of new stable release
