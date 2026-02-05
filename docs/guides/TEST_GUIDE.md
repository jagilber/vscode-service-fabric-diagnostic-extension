# Testing Infrastructure Guide

Complete testing setup for Service Fabric Diagnostic Extension.

## 📋 Table of Contents
- [Quick Start](#quick-start)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Mocking](#mocking)
- [Coverage](#coverage)
- [CI/CD Integration](#cicd-integration)

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Unit Tests Only
```bash
npm run test:unit
```

### Run Integration Tests (requires cluster)
```bash
SF_TEST_CLUSTER=http://localhost:19080 npm run test:integration
```

### Watch Mode (auto-rerun on changes)
```bash
npm run test:watch
```

## 📁 Test Structure

```
test/
├── setup.ts                          # Jest configuration and global mocks
├── fixtures/                         # Test data and mock responses
│   └── mockClusterData.ts           # SF cluster mock data
├── mocks/                            # Mock implementations
│   └── MockSfRestClient.ts          # Mock SF REST API client
├── unit/                             # Unit tests
│   ├── sfRest.test.ts               # SfRest API tests
│   ├── sfConfiguration.test.ts      # Configuration tests
│   ├── sfMgr.test.ts                # Manager tests
│   ├── infrastructure/              # Infrastructure layer tests
│   │   ├── CacheManager.test.ts
│   │   └── RetryPolicy.test.ts
│   ├── services/                    # Service layer tests
│   │   ├── SfClusterService.test.ts
│   │   ├── SfSdkInstaller.test.ts
│   │   └── SfHttpClient.test.ts
│   └── views/                       # UI component tests
│       ├── serviceFabricClusterView.test.ts
│       └── ManagementWebviewProvider.test.ts
└── integration/                     # Integration tests (require cluster)
    ├── README.md
    ├── cluster.integration.test.ts
    ├── nodes.integration.test.ts
    ├── applications.integration.test.ts
    └── services.integration.test.ts
```

## 🧪 Running Tests

### All Tests with Coverage
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests (requires cluster)
```bash
# Set cluster endpoint
export SF_TEST_CLUSTER=http://localhost:19080

# Run integration tests
npm run test:integration
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### CI Mode
```bash
npm run test:ci
```

## ✍️ Writing Tests

### Unit Test Example

```typescript
import { SfRest } from '../../src/sfRest';
import { createMockSfApi } from '../mocks/MockSfRestClient';

describe('SfRest', () => {
    let sfRest: SfRest;
    let mockSfApi: any;

    beforeEach(() => {
        const mockContext = {
            extensionPath: '/mock/path',
            globalStorageUri: { fsPath: '/mock/storage' },
            subscriptions: []
        };
        
        sfRest = new SfRest(mockContext);
        mockSfApi = createMockSfApi();
        (sfRest as any).sfApi = mockSfApi;
    });

    test('should activate node', async () => {
        await sfRest.activateNode('_Node_0');
        
        expect(mockSfApi.enableNode).toHaveBeenCalledWith('_Node_0');
    });
});
```

### Integration Test Example

```typescript
describe('Cluster Integration Tests', () => {
    let sfRest: SfRest;

    beforeAll(() => {
        sfRest = new SfRest(mockContext);
    });

    test('should connect to real cluster', async () => {
        const health = await sfRest.getClusterHealth();
        
        expect(health.aggregatedHealthState).toMatch(/Ok|Warning|Error/);
    }, 30000);
});
```

## 🎭 Mocking

### Mock SF API Client

```typescript
import { createMockSfApi, createFailingSfApi } from '../mocks/MockSfRestClient';

// Successful API mock
const mockApi = createMockSfApi();

// Failing API mock (simulates errors)
const failingApi = createFailingSfApi('serverError');

// Custom mock with builder pattern
const customApi = new MockSfApiBuilder()
    .withClusterHealth({ aggregatedHealthState: 'Warning' })
    .withNodes([...mockNodes])
    .withError('getApplicationInfoList', new Error('Failed'))
    .build();
```

### Mock Cluster Data

```typescript
import * as mockData from '../fixtures/mockClusterData';

// Use predefined mock data
const nodes = mockData.mockNodes;
const apps = mockData.mockApplications;
const health = mockData.mockClusterHealth;
```

### VS Code API Mocking

VS Code API is automatically mocked globally in `test/setup.ts`:

```typescript
// Already available in tests
vscode.window.showInformationMessage()
vscode.workspace.getConfiguration()
vscode.commands.registerCommand()
// etc.
```

## 📊 Coverage

### Coverage Thresholds

Configured in `jest.config.js`:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### View Coverage Report

```bash
npm test
# Opens coverage/index.html in browser
```

### Coverage Exclusions

- Generated SDK code (`src/sdk/**`)
- Type definitions (`**/*.d.ts`)
- Index files (`**/index.ts`)

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## 📝 Test API Coverage

### ✅ Cluster Operations
- [x] Get cluster health
- [x] Get cluster manifest
- [x] Handle connection errors
- [x] Handle timeouts
- [x] Handle auth errors

### ✅ Node Operations
- [x] List nodes
- [x] Get node info
- [x] Activate node
- [x] Deactivate node (Pause/Restart/RemoveData)
- [x] Restart node
- [x] Remove node state
- [x] Handle node errors

### ✅ Application Operations
- [x] List applications
- [x] Get application info
- [x] Create application
- [x] Delete application
- [x] Upgrade application
- [x] Handle app errors

### ✅ Service Operations
- [x] List services
- [x] Get service info
- [x] Create service
- [x] Delete service
- [x] Update service

### ✅ Infrastructure
- [x] Cache with LRU eviction
- [x] Cache with TTL expiration
- [x] Retry with exponential backoff
- [x] HTTP client with timeouts

### ⏳ TODO
- [ ] Partition operations
- [ ] Replica operations
- [ ] Application type operations
- [ ] Service type operations
- [ ] Backup/restore operations
- [ ] Chaos testing
- [ ] UI component tests (tree view, webview)
- [ ] E2E tests with Extension Host

## 🐛 Debugging Tests

### VS Code Debugger

Add to `.vscode/launch.json`:

```json
{
    "type": "node",
    "request": "launch",
    "name": "Jest Current File",
    "program": "${workspaceFolder}/node_modules/.bin/jest",
    "args": [
        "${relativeFile}",
        "--config",
        "jest.config.js"
    ],
    "console": "integratedTerminal",
    "internalConsoleOptions": "neverOpen"
}
```

### Verbose Output

```bash
VERBOSE=true npm test
```

### Single Test

```bash
npm test -- --testNamePattern="should activate node"
```

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [ts-jest Guide](https://kulshekhar.github.io/ts-jest/)
- [Service Fabric REST API](https://docs.microsoft.com/en-us/rest/api/servicefabric/)

---

**Coverage Goal**: 80%+ by v1.0.0  
**Current Coverage**: Run `npm test` to see latest
