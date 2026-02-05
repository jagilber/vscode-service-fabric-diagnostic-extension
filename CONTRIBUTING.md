# Contributing to Service Fabric Diagnostic Extension

First off, thank you for considering contributing to this project! 🎉

The following is a set of guidelines for contributing to the Service Fabric Diagnostic Extension. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
- [Coding Guidelines](#coding-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Testing Guidelines](#testing-guidelines)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior.

**Be respectful, be considerate, be collaborative.**

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues as you might find that you don't need to create one. When you are creating a bug report, please include as many details as possible.

#### How to Submit a Good Bug Report

**Use the GitHub issue tracker** and include:

- **Clear title** - Use a clear and descriptive title
- **Reproduction steps** - Provide step-by-step reproduction
- **Expected behavior** - What you expected to happen
- **Actual behavior** - What actually happened
- **Environment details**:
  - OS: [e.g., Windows 11, macOS 13]
  - VS Code version: [e.g., 1.85.0]
  - Extension version: [e.g., 0.0.1]
  - Service Fabric cluster type: [e.g., local dev cluster, Azure]
- **Logs** - Include relevant logs from Output panel (View → Output → Service Fabric)
- **Screenshots** - If applicable

**Example:**
```markdown
**Title:** Context menu not appearing on node items

**Description:**
Right-clicking node items in the cluster tree does not show the context menu.

**Steps to Reproduce:**
1. Connect to cluster 'http://localhost:19080'
2. Expand cluster tree
3. Right-click on '_Node_0'
4. No context menu appears

**Expected:** Context menu with "Manage Node" option
**Actual:** No menu shown

**Environment:**
- OS: Windows 11
- VS Code: 1.85.0
- Extension: 0.0.1
- Cluster: Local dev cluster
```

### Suggesting Features

Feature requests are welcome! Before suggesting a feature:

1. **Check existing issues** - Someone may have already suggested it
2. **Search the documentation** - The feature may already exist
3. **Be specific** - Explain the use case and why it's valuable

#### How to Submit a Good Feature Request

```markdown
**Title:** Add search functionality to tree view

**Problem:**
Finding a specific service in a cluster with 100+ applications is time-consuming.

**Proposed Solution:**
Add a search box above the tree view that filters items as you type.

**Alternatives Considered:**
- Quick Pick dialog (less discoverable)
- Command Palette only (requires multiple steps)

**Use Case:**
As a cluster operator, I want to quickly find and inspect a specific service 
without manually expanding the tree.

**Additional Context:**
Similar to VS Code's file explorer search.
```

### Pull Requests

The process described here has several goals:

- Maintain code quality
- Fix problems that are important to users
- Enable a sustainable system for maintainers

#### Pull Request Process

1. **Fork** the repository
2. **Create a branch** with a descriptive name:
   ```bash
   git checkout -b feature/add-search-functionality
   git checkout -b fix/context-menu-nodes
   git checkout -b refactor/extract-service-layer
   ```

3. **Make your changes**
   - Follow coding guidelines
   - Add tests if applicable
   - Update documentation

4. **Commit** with good commit messages (see [Commit Guidelines](#commit-message-guidelines))

5. **Push** to your fork
   ```bash
   git push origin feature/add-search-functionality
   ```

6. **Open a Pull Request** on GitHub
   - Use a clear title
   - Reference related issues
   - Describe your changes
   - Include screenshots for UI changes

#### Pull Request Template

```markdown
## Description
Briefly describe what this PR does.

## Related Issue
Fixes #123

## Changes Made
- Added search functionality to tree view
- Updated keyboard shortcuts documentation
- Added unit tests for search service

## Testing Done
- [ ] Tested with local cluster
- [ ] Tested with secure cluster
- [ ] Tested with 100+ applications
- [ ] All existing tests pass

## Screenshots
(If applicable)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-reviewed the code
- [ ] Commented complex code sections
- [ ] Updated documentation
- [ ] Added tests (if applicable)
- [ ] All tests pass
```

## Development Setup

### Prerequisites

- **Node.js 16+**
- **VS Code 1.74.0+**
- **Git**
- **Service Fabric SDK** (optional, for dev cluster features)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/jagilber/vscode-service-fabric-diagnostic-extension.git
   cd vscode-service-fabric-diagnostic-extension
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Compile TypeScript**
   ```bash
   npm run compile
   ```

4. **Start development mode**
   ```bash
   npm run watch
   ```

5. **Debug in VS Code**
   - Press `F5` to launch Extension Development Host
   - Set breakpoints in source files
   - Make changes and reload with `Ctrl+R`

### Project Structure

```
src/
├── extension.ts               # Entry point
├── services/                  # Business logic layer
│   ├── SfClusterService.ts
│   ├── SfSdkInstaller.ts
│   └── SfHttpClient.ts
├── views/                     # UI components
│   ├── serviceFabricClusterView.ts
│   └── ManagementWebviewProvider.ts
├── infrastructure/            # Cross-cutting concerns
│   ├── CacheManager.ts
│   └── RetryPolicy.ts
├── interfaces/                # Dependency abstractions
├── models/                    # Data models and errors
├── utils/                     # Utilities
└── types.ts                   # TypeScript interfaces
```

## Coding Guidelines

### TypeScript Style

- **Use TypeScript strict mode** - No `any` types except for external APIs
- **Explicit types** - Always declare return types and parameters
- **Interfaces over classes** - For data structures
- **Async/await** - No Promise constructors or callback hell

#### Good Example
```typescript
public async getClusterHealth(clusterId: string): Promise<ClusterHealth> {
    try {
        const health = await this.api.getClusterHealth(clusterId);
        return health;
    } catch (error) {
        this.logger.error('Failed to get cluster health', error);
        throw new ClusterConnectionError('Failed to retrieve cluster health', { 
            clusterId, 
            cause: error 
        });
    }
}
```

#### Bad Example
```typescript
public getClusterHealth(clusterId: any): Promise<any> {  // ❌ any types
    return new Promise((resolve, reject) => {  // ❌ Promise constructor
        this.api.getClusterHealth(clusterId, (err, data) => {  // ❌ callbacks
            if (err) reject(err);
            else resolve(data);
        });
    });
}
```

### Code Organization

- **Single Responsibility** - One class/function, one purpose
- **Dependency Injection** - Pass dependencies via constructor
- **Interface-based** - Abstract implementations behind interfaces
- **Error Handling** - Use custom error classes, always catch and log

### Naming Conventions

- **Classes**: PascalCase - `SfClusterService`
- **Interfaces**: PascalCase with `I` prefix - `IHttpOptionsProvider`
- **Methods**: camelCase - `getClusterHealth()`
- **Constants**: UPPER_SNAKE_CASE - `DEFAULT_TIMEOUT`
- **Private members**: prefix with `_` - `private _cache`

### File Organization

- **One class per file** - `SfClusterService.ts`
- **Group by feature** - `/services`, `/views`, `/models`
- **Barrel exports** - `index.ts` for clean imports

### Comments

- **JSDoc** for public APIs
- **Inline comments** only for complex logic
- **TODO comments** with issue numbers

```typescript
/**
 * Retrieves cluster health with caching
 * @param clusterId Unique cluster identifier
 * @returns Cluster health state
 * @throws ClusterConnectionError if cluster is unreachable
 */
public async getClusterHealth(clusterId: string): Promise<ClusterHealth> {
    // Try cache first (30s TTL)
    const cached = await this.cache.get<ClusterHealth>(`health:${clusterId}`);
    if (cached) {
        return cached;
    }

    // TODO(#123): Add retry logic for transient failures
    const health = await this.api.getClusterHealth(clusterId);
    await this.cache.set(`health:${clusterId}`, health, 30000);
    return health;
}
```

## Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring (no behavior change)
- `perf`: Performance improvement
- `docs`: Documentation changes
- `test`: Adding tests
- `chore`: Build process, tooling
- `style`: Code style (formatting, whitespace)

### Examples

**Feature:**
```
feat(tree-view): Add search functionality to cluster explorer

- Added search input above tree view
- Filters items in real-time as user types
- Highlights matching items
- Persists search state during refresh

Closes #45
```

**Fix:**
```
fix(context-menu): Add contextValue for menu visibility

Context menus were not appearing because TreeItem.contextValue
was not set. VS Code requires this property to match 'when'
clauses in package.json.

Fixes #78
```

**Refactor:**
```
refactor: Extract HTTP client from SfMgr

- Created SfHttpClient utility class
- Moved httpGet and httpDownload methods
- Reduced SfMgr from 470 to 395 lines
- Improved testability with dependency injection
```

### Commit Message Rules

1. **Type and scope** are required
2. **Subject** in imperative mood ("Add" not "Added")
3. **Subject** max 72 characters
4. **Body** explains what and why (not how)
5. **Footer** references issues (`Fixes #123`, `Closes #45`)

## Testing Guidelines

### Manual Testing

Before submitting a PR:

1. **Test with local cluster**
   ```bash
   # Start local dev cluster
   & "$ENV:ProgramFiles\Microsoft SDKs\Service Fabric\ClusterSetup\DevClusterSetup.ps1" -CreateOneNodeCluster
   ```

2. **Test with secure cluster** (if authentication changes)

3. **Test all modified commands**

4. **Test edge cases**:
   - Empty clusters
   - Large clusters (100+ apps)
   - Network failures
   - Invalid inputs

### Test Checklist

- [ ] Extension activates without errors
- [ ] Tree view renders correctly
- [ ] All commands work
- [ ] Context menus appear
- [ ] Management panel loads
- [ ] Error messages are user-friendly
- [ ] No console errors
- [ ] Settings persist correctly
- [ ] Resource cleanup on reload

### Future: Automated Tests

(To be added in v0.1.0)

```typescript
// Example unit test structure
describe('SfClusterService', () => {
    it('should cache cluster health', async () => {
        // Arrange
        const mockApi = createMockApi();
        const service = new SfClusterService(mockApi, cache);

        // Act
        await service.getClusterHealth('cluster1');
        await service.getClusterHealth('cluster1');

        // Assert
        expect(mockApi.getClusterHealth).toHaveBeenCalledTimes(1);
    });
});
```

## Questions?

- **GitHub Discussions** for questions
- **GitHub Issues** for bugs and features
- **Email maintainer** for private concerns

## Recognition

Contributors will be recognized in:
- README.md Contributors section
- Release notes
- GitHub contributors graph

Thank you for contributing! 🙌
