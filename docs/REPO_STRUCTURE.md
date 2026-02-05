# Repository Structure

This document describes the organization of the Service Fabric Diagnostic Extension repository.

## Directory Layout

```
vscode-service-fabric-diagnostic-extension/
├── .github/              # GitHub configuration (workflows, issue templates)
├── .vscode/              # VS Code workspace settings
├── docs/                 # Documentation (organized by category)
│   ├── architecture/     # System design and technical architecture
│   ├── guides/          # User and developer guides
│   ├── project/         # Project management and governance
│   └── test-reports/    # Test execution results
├── media/               # Images and visual assets
├── resources/           # Static resources (icons, templates)
├── scripts/             # Build and utility scripts
├── sdk/                 # Service Fabric SDK components
├── src/                 # TypeScript source code
│   ├── commands/        # Command implementations
│   ├── infrastructure/  # Cross-cutting concerns (cache, retry)
│   ├── interfaces/      # TypeScript interfaces and contracts
│   ├── models/          # Data models and types
│   ├── services/        # Business logic layer
│   ├── utils/           # Utility functions
│   └── views/           # UI components (tree view, webview)
└── test/                # Test suites
    ├── unit/            # Unit tests
    ├── integration/     # Integration tests
    └── fixtures/        # Test data and mocks
```

## Root Files

| File | Purpose |
|------|---------|
| **README.md** | Project overview, quick start, and feature highlights |
| **CHANGELOG.md** | Version history and release notes |
| **CONTRIBUTING.md** | Contribution guidelines and development workflow |
| **SECURITY.md** | Security policies and vulnerability reporting |
| **LICENSE** | MIT license terms |
| **package.json** | npm package manifest and scripts |
| **tsconfig.json** | TypeScript compiler configuration |
| **jest.config.js** | Jest testing framework configuration |
| **.eslintrc.js** | ESLint code quality rules |
| **.vscodeignore** | Files excluded from VSIX package  |
| **.gitignore** | Files excluded from version control |

## Documentation Organization

### docs/architecture/
System design and implementation details for developers and architects.

- **ARCHITECTURE.md** - Module structure, dependencies, and code organization
- **LOGICAL_ARCHITECTURE.md** - Data flows, sequence diagrams, and interaction patterns

### docs/guides/
Practical how-to guides for users and contributors.

- **USAGE.md** - Detailed usage examples and common scenarios
- **COMMANDS_DOCUMENTATION.md** - Complete command reference with examples
- **TEST_GUIDE.md** - Testing strategies, test execution, and coverage
- **BEST_PRACTICES.md** - Development, security, and operational best practices

### docs/project/
Project governance, planning, and process documentation.

- **PRD.md** - Product requirements, features, and user stories
- **CONSTITUTION.md** - Project mission, values, and governance model
- **RELEASE_READINESS_CHECKLIST.md** - Pre-release verification steps

### docs/test-reports/
Historical test execution reports and quality metrics. Reports should follow naming convention: `{feature}-TEST-REPORT-{date}.md`

## Source Code Organization

### src/
Main TypeScript source code following clean architecture principles.

**Entry Point:**
- `extension.ts` - Extension activation, command registration, and lifecycle

**Views (Presentation Layer):**
- `views/serviceFabricClusterView.ts` - Tree view data provider
- `views/ManagementWebviewProvider.ts` - Interactive management panel

**Services (Business Logic):**
- `services/SfClusterService.ts` - Cluster operations orchestration
- `services/SfSdkInstaller.ts` - SDK installation and management
- `services/SfHttpClient.ts` - HTTP request utilities

**Infrastructure (Cross-cutting):**
- `infrastructure/CacheManager.ts` - LRU cache with TTL
- `infrastructure/RetryPolicy.ts` - Exponential backoff retry logic

**Domain Models:**
- `models/` - Data structures and domain entities
- `interfaces/` - Contracts and abstractions
- `types.ts` - Shared TypeScript interfaces

**Utilities:**
- `utils/` - Helper functions and shared utilities

**Commands:**
- `commands/` - VS Code command implementations

## Build Artifacts

Build outputs and temporary files are excluded from version control:

| Path | Description |
|------|-------------|
| `out/` | Compiled JavaScript output |
| `node_modules/` | npm dependencies |
| `coverage/` | Test coverage reports |
| `*.vsix` | Extension packages |
| `temp/` | Temporary files |

## Configuration Files

### TypeScript Configuration
- **tsconfig.json** - Strict mode enabled, ES2020 target, composite builds

### Testing Configuration
- **jest.config.js** - Unit and integration test setup
- **test/setup.ts** - Test environment initialization

### Code Quality
- **.eslintrc.js** - Linting rules (TypeScript, strict)
- **.prettierrc** (if exists) - Code formatting rules

### VS Code
- **.vscode/launch.json** - Debug configurations
- **.vscode/tasks.json** - Build and run tasks
- **.vscode/settings.json** - Workspace preferences

## Convention Guidelines

### File Naming
- **PascalCase**: TypeScript classes (`SfClusterService.ts`)
- **camelCase**: Utilities and helpers (`sfUtility.ts`)
- **UPPERCASE**: Constants and documentation (`README.md`, `CONTRIBUTING.md`)
- **kebab-case**: Test files (`cluster-service.test.ts`)

### Documentation
- **Use diagrams** for complex concepts (Mermaid in Markdown)
- **Include examples** for API usage and commands
- **Keep focused** - one topic per document
- **Cross-reference** related documents with relative links

### Code Organization
- **Separation of concerns** - UI, business logic, infrastructure
- **Dependency injection** - constructor injection for testability
- **Interface abstractions** - depend on interfaces, not implementations
- **Single responsibility** - each class/module has one job

## Adding New Features

When adding a new feature, update relevant documentation:

1. **Code**: Implement in `src/` with appropriate layer
2. **Tests**: Add unit tests in `test/unit/`, integration in `test/integration/`
3. **Commands**: If adding command, document in `docs/guides/COMMANDS_DOCUMENTATION.md`
4. **Architecture**: Update `docs/architecture/ARCHITECTURE.md` if structure changes
5. **Changelog**: Add entry to `CHANGELOG.md` under "Unreleased"
6. **README**: Update feature list if user-facing

## Maintenance

### Periodic Tasks
- **Weekly**: Review and triage new issues
- **Before releases**: Update CHANGELOG.md, run full test suite
- **Monthly**: Update dependencies (`npm update`), audit security (`npm audit`)
- **Quarterly**: Review and archive old test reports

### Document Updates
- Keep documentation in sync with code changes
- Archive outdated test reports after 90 days
- Update architecture diagrams when making structural changes
- Review and update PRD roadmap quarterly

---

For questions about repository structure, see [CONTRIBUTING.md](../CONTRIBUTING.md) or open a GitHub Discussion.
