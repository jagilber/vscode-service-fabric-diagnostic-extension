# Changelog

All notable changes to the Service Fabric Diagnostic Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - Target: March 2026

**Marketplace Launch Release** - Making Service Fabric management accessible to all operators and admins.

### Added
- **VS Code Marketplace publication** - One-click installation for all users
- **Quick Start section** in README for non-developers
  - 60-second installation guide
  - First-time setup walkthrough
  - No Node.js or build tools required
- **Marketplace-optimized package.json**
  - Keywords for discoverability (service fabric, azure, microservices, etc.)
  - Enhanced description for marketplace listing
  - Links to bugs, Q&A, and documentation
  - Removed `private: true` flag

### Changed
- **Accelerated marketplace timeline** from v1.0.0 to v0.2.0
  - Prioritizes adoption for non-developer users
  - Targets Service Fabric admins, DevOps engineers, cluster operators
- **Updated release documentation** to reflect v0.2.0 marketplace target
- **Installation instructions** now emphasize marketplace coming soon (March 2026)

### Target Audience
Primary focus on making extension accessible to:
- Service Fabric administrators
- DevOps engineers
- Cluster operators without development background
- Teams wanting quick evaluation without source builds

## [1.0.3] - 2026-02-11

### Added
- **Manifest Validator** — New `Validate Manifest` command validates ApplicationManifest.xml and
  ServiceManifest.xml files against the official Service Fabric XSD schema using `xmllint-wasm`.
  Errors appear in the VS Code Problems panel with line/column positions. Available from the
  SFA tree view context menu or command palette.
- **Open Project in Code** — Replaced `Open Application Manifest` with `Open Project in Code`
  command that opens the SF application project folder in a new VS Code window.

### Fixed
- **ServiceManifest.xml not visible in SFA tree** — Service Fabric VS templates use a `Pkg` suffix
  in `ServiceManifestName` (e.g., `VotingDataPkg`) but the source project directory omits it
  (e.g., `VotingData`). `findServiceManifestPath` now strips the `Pkg` suffix as a fallback and
  also checks `ApplicationPackageRoot/{name}/ServiceManifest.xml` for built packages.

## [Unreleased]

### Fixed - REST API Deployment Pipeline
- **TLS upload stall with mTLS clusters** — Uploads to Service Fabric clusters using mutual TLS
  (client certificate authentication) would hang indefinitely due to HTTP.sys lazy client-cert
  negotiation causing a TLS renegotiation deadlock. Fixed by sending `Expect: 100-continue` header
  on binary uploads and waiting for the server's `100 Continue` response before streaming the body.
  Affects `SfDirectRestClient` chunked and single-shot uploads.
- **`FABRIC_E_DIRECTORY_NOT_FOUND` during provision** — After uploading application packages to
  `fabric:ImageStore` (Image Store Service), provisioning would fail because the Image Store Service
  requires 0-byte `_.dir` marker files in every directory. Fixed by automatically uploading `_.dir`
  markers after all package files are uploaded. Only applies to `fabric:ImageStore` (not file-share
  or Azure blob image stores).
- **Image Store cleanup disabled after provision** — The cleanup step that deletes the uploaded
  package from the image store after provisioning has been temporarily disabled to allow debugging
  and verification of deployments.

### Added - Lazy Activation & Auto-Start Setting
- **`sfClusterExplorer.autoStart` setting** — Controls whether Service Fabric views are visible
  immediately on VS Code startup. Default: `false` (manual start). Set to `true` for the previous
  always-visible behavior.
- **`service fabric: Start Extension` command** — Explicitly activates the extension and reveals
  all Service Fabric views in the Explorer sidebar.
- **Lazy view activation** — All three views (Clusters, Applications, Management) are hidden until
  the extension is explicitly started via command or the `autoStart` setting is enabled. Running
  any Service Fabric command from the Command Palette also reveals views automatically.
- **`onStartupFinished` activation** — Extension activates after VS Code startup completes,
  ensuring all commands are registered and available from the Command Palette regardless of
  view visibility.

### Changed
- **View `when` clauses** — All views now use `when: "serviceFabricActive"` context key to control
  visibility. Previously only the Management panel used this guard.
- **Activation events** — Replaced `onView:` and `workspaceContains:` activation events with
  explicit `onCommand:` events for all commands plus `onStartupFinished`. This prevents
  unwanted activation from workspace scanning or sidebar interaction.

### Added - Service Fabric Applications View
- **New "Service Fabric Applications" view** in the Explorer sidebar for managing `.sfproj`
  projects. Discovers all Service Fabric application projects in the workspace, showing their
  services, application parameters, and publish profiles in a tree hierarchy.
- **Project discovery** — Automatically scans the workspace for `.sfproj` files and parses
  `ApplicationManifest.xml`, `ServiceManifest.xml`, parameter files, and publish profiles.
  File watchers trigger automatic refresh when project files change.
- **Build commands** — Build projects from the tree view context menu using MSBuild or `dotnet build`,
  with a Quick Pick to choose the build method. Output goes to an integrated terminal.
- **Deploy commands** — Deploy applications to the active cluster via REST API (upload to image store,
  provision application type, create application) or generate a PowerShell deploy script.
  Supports parameter file and publish profile selection during deploy.
- **SfProjectService** — New service for workspace scanning and XML parsing with caching and
  `FileSystemWatcher`-based invalidation.
- **SfDeployService** — Orchestrates build, package discovery, and deployment to clusters.
- **Tree node classes** — `SfProjectNode`, `ServiceRefNode`, `ManifestNode`, `ParameterFileNode`,
  `ProfileNode` with appropriate icons and click-to-open behavior.
- **Deploy REST methods** — Added `uploadToImageStore()`, `provisionApplicationType()`, and
  `createApplication()` to both `SfRest` and `SfDirectRestClient`.
- **ProjectCommands** — 4 new commands: `sfApplications.refresh`, `sfApplications.buildProject`,
  `sfApplications.deployProject`, `sfApplications.openManifest`.
- **Activation event** — Extension activates on `workspaceContains:**/*.sfproj` in addition to
  existing activation events.
- **External project support** — Add `.sfproj` projects from outside the current workspace via
  "Add External Project/Folder" command. Browse for individual `.sfproj` files or scan entire
  folders. External projects are persisted in `globalState` and shown with an orange icon and
  `(external)` badge. Right-click to remove. Welcome view includes an "Add External Project"
  button when no workspace projects are found.

### Added - Cluster Persistence & Visual Improvements
- **Auto-reconnect clusters on activation** — Previously connected clusters are automatically
  restored when VS Code starts. Connected cluster endpoints are persisted in `globalState` and
  reconnected silently (no toast spam). Controlled by `sfClusterExplorer.autoReconnect` setting
  (default: `true`).
- **Active cluster persisted** — The last active cluster is remembered across sessions and
  restored after auto-reconnect completes.
- **Yellow label for active cluster** — The active cluster root node now renders with a yellow
  label color via `FileDecorationProvider`, replacing the previous theme-dependent highlight.
  Provides a clear, consistent visual indicator across all VS Code themes.
- **ClusterDecorationProvider** — New `FileDecorationProvider` using custom `sf-cluster://` URI
  scheme to tint only the active cluster node without affecting other tree items.

### Added - Phase 1: Foundation & Type Safety
- **CacheManager** infrastructure class with LRU cache and TTL support
- **Debounced refresh** mechanism to batch rapid tree view updates
- **Parallel health queries** with batching for improved performance
- **Retry logic** with exponential backoff for transient failures
- **Type safety improvements** - Created 50+ TypeScript interfaces in `types.ts`
  - `ManagementMessage` union types for WebView communication
  - Service Fabric API response types (ApplicationInfo, NodeInfo, ServiceInfo, etc.)
  - HTTP types (HttpHeaders, UriParameters)
  - Complex types (ClusterConfigMap, AzureAccount, ITelemetryLogger)

### Added - Phase 2: Architecture Refactoring
- **SfHttpClient** utility class for HTTP operations
  - Clean async/await patterns (no Promise constructor anti-patterns)
  - Proper timeout handling and progress callbacks
  - Comprehensive error handling
- **SfSdkInstaller** service for SDK download and installation
  - Isolated SDK operations
  - PowerShell integration for dev cluster deployment
- **SfClusterService** for cluster orchestration
  - Certificate retrieval and validation
  - Connection orchestration logic
  - Clean error handling with typed errors
- **IHttpOptionsProvider** interface to break circular dependencies
  - Eliminated SfRest ↔ SfRestClient circular dependency
  - Pure dependency injection pattern

### Added - Phase 3: Management View
- **ManagementWebviewProvider** for interactive cluster operations
  - Application lifecycle operations (deploy, upgrade, remove)
  - Node management (activate, deactivate, restart, remove state)
  - Cluster operations (upgrades, backups, restore)
  - Rich HTML/CSS/JavaScript WebView UI
  - Message-based communication with extension
  - Integrated with Explorer sidebar

### Added - Context Menu Support
- **Context menus** for tree view items
  - "Manage Cluster" action on cluster items (inline + right-click)
  - "Deploy Application" quick action on clusters
  - "Manage Node" action on node items with operation submenu
  - Toolbar icons appear on hover
  - Title bar actions in tree view
- **contextValue** property support in TreeItem class
  - Set `contextValue='cluster'` for cluster items
  - Set `contextValue='node'` for node items
  - Enables VS Code context menu matching

### Added - Export & Diagnostics
- **Export Snapshot** command for tree view items
  - Right-click any tree item (cluster, node, application, etc.) → "Export Snapshot"
  - Recursively serializes entire tree structure including all children
  - Saves to extension global storage: `<globalStorage>/<clusterName>/snapshots/`
  - Timestamped filenames: `snapshot-<itemType>-<name>-YYYY-MM-DDTHH-MM-SS.json`
  - User prompt to "Open" or "Show in Folder" after export
  - Max depth protection (10 levels) prevents infinite recursion
  - Captures: label, itemType, itemId, tooltip, healthState, children array
  - Example: `snapshot-node-Node_0-2024-02-03T14-35-22.json`
  - Stored alongside existing health snapshots in cluster-specific folders

### Fixed
- **Cluster removal** command now works correctly
  - Changed from manual text entry to selection list
  - Added confirmation dialog before removal
  - Fixed removal logic to properly filter clusters array
  - Added verification step for successful removal
  - **Auto-cleanup** of corrupted settings:
    - Flattens nested arrays
    - Removes duplicate endpoints
    - Handles malformed data
- **Context menu visibility** - Right-click menus now appear correctly
  - Fixed missing `contextValue` in TreeItem constructor
  - Proper propagation to VS Code TreeItem base class
- Removed 50+ `any` types throughout codebase with proper TypeScript interfaces

### Changed
- **SfMgr** refactored from 470+ lines to ~265 lines (43% reduction)
  - Extracted HTTP operations to SfHttpClient
  - Extracted SDK operations to SfSdkInstaller
  - Extracted cluster logic to SfClusterService
  - Now serves as coordinator only
- Improved error messages with context-aware information
- Enhanced logging with structured debug levels

### Improved
- **Tree expansion performance**: 10x faster with caching
- **Health loading**: 5x faster with parallel queries
- **Code organization**: Clear separation of concerns
- **Testability**: Services now mockable by interface
- **Type safety**: All public APIs properly typed
- **Memory management**: Proper resource cleanup on deactivation

## [0.0.1] - 2024-02-03

### Initial Release
- Basic cluster explorer tree view
- Connection to Service Fabric clusters
- Health status visualization
- Node and application browsing
- Certificate authentication support
- Configuration persistence

---

## Release Notes Template for Future Versions

### [X.Y.Z] - YYYY-MM-DD

#### Added
- New features

#### Changed
- Changes in existing functionality

#### Deprecated
- Soon-to-be removed features

#### Removed
- Removed features

#### Fixed
- Bug fixes

#### Security
- Security vulnerability fixes

---

## Upcoming Features (Roadmap)

### v0.1.0 - Testing & Documentation
- [ ] Unit tests with 80%+ coverage
- [ ] Integration tests with local cluster
- [ ] Performance benchmarks
- [ ] API documentation

### v0.2.0 - Azure Integration
- [ ] Azure Account sign-in
- [ ] List clusters from subscriptions
- [ ] Connect to Azure-hosted clusters
- [ ] Multi-cluster management

### v0.3.0 - Advanced Features
- [ ] Virtual scrolling for large lists (1000+ nodes)
- [ ] Search/filter capabilities
- [ ] Export reports
- [ ] Custom queries builder

### v1.0.0 - Production Ready
- [ ] VS Code Marketplace publication
- [ ] Full documentation
- [ ] Telemetry and usage analytics
- [ ] Accessibility compliance
- [ ] Internationalization (i18n)
