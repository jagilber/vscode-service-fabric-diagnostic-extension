# Changelog

All notable changes to the Service Fabric Diagnostic Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-02-16

### Added
- **ARM Templates Browser** — New dedicated "Service Fabric ARM Templates" treeview in the
  Explorer sidebar (`serviceFabricTemplatesView`). Displays ARM deployment templates from
  configured GitHub repositories with lazy-loading, in-memory caching (5 min TTL), and
  bundled JSON fallback for offline use. Browsable repo → folder → file hierarchy with
  click-to-open file content in the editor.
  - `SfTemplatesDataProvider` — TreeDataProvider for the templates view
  - `TemplateRepoNode`, `TemplateFolderNode`, `TemplateFileNode`, `TemplateErrorNode` — tree nodes
  - `TemplateService` — GitHub Contents API client with cache and bundled fallback
  - `TemplateDeployService` — Downloads and deploys templates
  - Bundled template manifest for Azure-Samples and jagilber repos
- **Create Cluster command** — "Create Cluster" inline button on template folder nodes downloads
  ARM template + parameter files to a temp directory, opens them for review/editing, and when all
  tabs are closed prompts the user to deploy via PowerShell (`New-AzResourceGroupDeployment`).
  Includes resource group creation, template validation, What-If mode, and Az module auto-install.
- **Deploy from Azure command** — "Deploy from Azure" inline button on template folder nodes
  opens the Azure portal custom deployment blade (`#create/Microsoft.Template/uri/...`) with
  the template's raw GitHub URL. Also offers "Copy URL" to clipboard as a fallback.
- **New SF Project scaffolding** — "New SF Project" button (`$(file-directory-create)`) in the
  Service Fabric Applications view title bar. Wizard prompts for template type (Stateless/Stateful),
  application name, service name, and target directory. Generates a Visual Studio 2019/2022-compatible
  project structure: `.sfproj`, `ApplicationManifest.xml`, `ApplicationParameters/`, `PublishProfiles/`,
  `ServiceManifest.xml`, `.csproj`, `Program.cs`, and service class files.
  - Always prompts for target directory with QuickPick (workspace folders + Browse)
  - When created outside workspace, offers "Open" / "Open in New Window" / "Dismiss"
- **View JSON context menu** — New "View JSON" context menu item on essentials, details, health,
  manifest, and events tree nodes. Bypasses default format overrides (manifest→XML, health→markdown)
  to show raw JSON data.
- **Default format for health/events/manifest clicks** — Clicking health nodes opens the markdown
  health report, events nodes open the events report, and manifest nodes open as XML — all without
  requiring context menu navigation.
- **Open in GitHub** — Context menu on template repo, folder, and file nodes to open the
  corresponding GitHub URL in the browser.
- **Refresh Templates** — View title button to clear the template cache and refresh all repos.
- **Welcome view for templates** — Empty-state welcome view with link to configure template
  repositories in settings.
- **Welcome view for applications** — Updated empty-state to include "Create New Project" button.

### Fixed
- **Portal URL encoding for Deploy from Azure** — `vscode.Uri.parse(fullUrl)` percent-decodes
  the fragment, breaking Azure portal's fragment parser. Fixed by using
  `vscode.Uri.parse('https://portal.azure.com/').with({ fragment: ... })` which preserves
  the percent-encoded template URL in the fragment.
- **Consolidated context menu entries** — Replaced per-viewItem health/events report entries with
  regex-based `when` clauses (e.g., `viewItem =~ /^(health|node-health|...)$/`), reducing
  `package.json` menu bloat by ~40 lines.
- **Details node context value** — Added `contextValue: 'details'` to the details `StaticItemNode`
  so context menus can target it properly.

### Changed
- **Health/events report entries removed from context menu** — Default click now opens the report
  directly; "View JSON" menu item provides access to raw data when needed.

## [1.0.8] - 2026-02-15

### Added
- **Package compression before upload** — `uploadApplicationPackage()` now automatically
  compresses the package before uploading, mirroring `Copy-ServiceFabricApplicationPackage
  -CompressPackage`. Code/, Config/, and Data/ subdirectories are zipped into `.zip` archives
  using Node.js built-in `zlib` (no external dependencies). This reduces hundreds of files
  to a handful, cutting upload time by 60–80%. Already-compressed packages are detected
  and skipped. Compressed temp directory is cleaned up after upload.

### Fixed
- **TLS client certificate renegotiation** — SF HTTP Gateway uses lazy TLS client cert
  negotiation (renegotiation after the initial handshake). Fixed `SfDirectRestClient` to set
  `cert`/`key` on per-request options in addition to the HTTPS Agent, so Node.js presents
  the certificate during TLS renegotiation. Eliminates 403 Forbidden errors on cert-secured
  clusters.
- **Retry logic for transient upload errors** — Expanded transient error detection to also
  catch `OperationsPending` (HTTP 500), `timeout`, and HTTP 5xx responses in addition to
  SSL/network errors. Retries with exponential backoff (2s, 4s).
- **Parallel Image Store upload** — `uploadApplicationPackage()` uploads files in parallel
  using a worker-pool pattern (concurrency capped at 8), matching the native SF client's
  `ParallelUploadObjectsAsyncOperation` pattern.

### Changed
- **Chunk upload threshold raised from 2MB to 25MB** — SF HTTP Gateway accepts single PUT
  bodies up to ~25MB. With package compression, most files are zip archives well under this
  limit, eliminating session-based chunked upload overhead for the vast majority of files.
- **Removed `onStartupFinished` activation event** — Extension now activates only on explicit
  commands, reducing startup overhead.

## [1.0.7] - 2026-02-14

### Fixed
- **Unprovision Application Type fails with `FABRIC_E_APPLICATION_TYPE_IN_USE`** — The
  unprovision command always failed when application instances existed because the running-instance
  check returned 0 results. Root cause: `SfDirectRestClient` returned raw SF REST JSON with
  PascalCase `Items` key, but callers accessed `result.items` (camelCase) — always `undefined`.
  Fixed by normalizing all paged REST responses (`Items` → `items`) in `SfDirectRestClient`
  via a new `unwrapPagedResponse()` helper. Affects `getNodeInfoList`, `getApplicationInfoList`,
  `getApplicationTypeInfoList`, `getServiceInfoList`, `getPartitionInfoList`, and
  `getReplicaInfoList`.
- **Unprovision now offers to delete running instances** — When running application instances
  are detected, the unprovision command now shows a modal dialog asking the user to delete them
  first ("Delete & Unprovision") instead of silently proceeding and failing with a 409 error.
- **Treeview stale state after auto-refresh** — Group nodes (Applications, Nodes, System)
  retained stale `appCount`, `nodeCount`, and `healthState` across refresh cycles, causing
  the treeview to show outdated counts and health icons. Fixed by overriding `invalidate()` in
  each group node to clear cached counts before re-fetching.
- **`ClusterNode.invalidate()` preserves group node instances** — `ClusterNode` now recursively
  invalidates child group nodes without destroying them, preventing tree flicker and ensuring
  VS Code's `getChildren()` triggers fresh `fetchChildren()` on the same group node objects.

### Added
- **Enable/Disable Auto-Refresh context menu** — Replaced the single "Toggle Auto-Refresh"
  cluster context menu item with separate "Enable Auto-Refresh" and "Disable Auto-Refresh"
  items. The correct item appears based on the cluster's current refresh state
  (`cluster` vs `cluster-norefresh` context value).
- **Manual Refresh context menu on cluster node** — Added "Refresh" to the cluster node
  context menu so users can manually trigger a full tree refresh from the right-click menu.
- **Comprehensive `[TREE]` diagnostic logging** — Added structured diagnostic logging to all
  treeview operations: `getChildren`, `invalidate`, `fetchChildren`, `RefreshManager.fire`,
  `SfTreeDataProvider`, and `SfTreeDataProviderAdapter`. Logged at `debug`/`info` levels for
  tracing refresh flows without noise.
- **Management panel redesign** — Refreshed the Management webview panel layout and styling.
- **Treeview refresh documentation** — New `docs/TREEVIEW_REFRESH_FLOWS.md` documenting the
  full refresh architecture: auto-refresh, manual refresh, deploy-triggered refresh, invalidation
  cascade, and data flow diagrams.
- **TreeRefreshFlows test suite** — 31 new unit tests covering refresh manager debounce, group
  node invalidation, ClusterNode invalidation cascade, and full refresh flows.
- **Template repositories setting** — New `sfClusterExplorer.templateRepositories` setting for
  configuring custom SF application template sources.

### Changed
- **Health report moved to health node** — "Generate Health Report" context menu now appears on
  the health tree item (not the cluster node), matching the essentials report pattern.

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

## [1.0.6] - 2026-02-14

### Added
- **Metrics report with Mermaid charts** — Clicking the "metrics" node in the cluster
  treeview opens a formatted markdown report with interactive Mermaid charts: capacity
  utilization bar chart, cluster load distribution, balance pie chart, node load spread
  (min vs max), capacity violation flowchart, and per-metric pie charts.
- **View Manifest XML/Report for application and service manifests** — The "View Manifest
  XML" and "View Manifest Report" context menu options are now available on application
  manifest and service manifest treeview items, not just the cluster manifest.
- **Remove All Projects** command in Service Fabric Applications view to clear all
  tracked projects at once.
- **Essentials markdown report on click** — Clicking "Essentials" in the cluster tree
  now opens a formatted markdown preview instead of requiring a context menu command.
  Report includes a collapsed raw JSON section with the full cluster data.
- **File-based markdown preview** — All markdown reports (essentials, deploy tracker,
  upgrade tracker) now write to temp files and open via `markdown.showPreview` for
  reliable single-tab rendering.

### Changed
- **SFA view sorted alphabetically** — Projects in Service Fabric Applications view
  are now sorted by project name.
- **SFA nodes collapsed by default** — Project nodes in the SFA view start collapsed
  instead of expanded.
- **SfProjectNode tooltip** — Shows workspace-relative path instead of absolute path.

### Removed
- **`Generate Cluster Essentials Report` command** — Replaced by automatic markdown
  preview when clicking the Essentials tree item.

### Fixed
- **Essentials report wrong cluster** — `generateEssentialsReport` now uses
  `sfMgr.getSfConfig(clusterEndpoint)` to target the correct cluster instead of
  `getCurrentSfConfig()` which could return a stale endpoint.
- **DeployTracker markdown opening in source view** — Now uses `openMarkdownFilePreview`
  to open files in rendered markdown preview instead of raw text.
- **DeployTracker trailing blank lines** — `flush()` accumulated extra newlines on
  each write cycle; fixed with `trimEnd()` before rewriting content.
- **UpgradeTracker markdown opening in source view** — Same fix as DeployTracker,
  using shared `openMarkdownFilePreview` function.

## [1.0.5] - 2026-02-13

### Added
- **UpgradeTracker** — New `UpgradeTracker` class polls cluster upgrade progress and writes
  a live UD walk dashboard to `docs/architecture/upgrade-ud-progress.md` with Mermaid diagrams:
  - Color-coded UD progress flowchart (green=Completed, amber=InProgress, gray=Pending, red=Failed)
  - Health check pipeline diagram showing Wait → Stable → Pass phases
  - Per-node upgrade progress diagram with phase and duration
  - Overview table with upgrade/UD durations, time-left-until-timeout, and last-polled timestamp
  - Auto-stops polling when upgrade reaches Completed/Failed
- **DeployTracker** — New `DeployTracker` class dynamically updates
  `docs/architecture/deploy-upgrade-phases.md` with a live status table during deploy,
  upgrade, and remove operations. Each phase shows ⬜ pending, 🔄 in-progress, ✅ done,
  or ❌ failed with timestamps and durations.
- **SfDeployService integration** — `deployToCluster()`, `upgradeApplication()`, and
  `removeFromCluster()` now write live progress to the deploy phases markdown file via
  `DeployTracker`, providing a persistent phase-by-phase audit trail.

### Fixed
- **Unprovision application type typeVersion undefined** — Context menu right-click passes the
  tree node object directly, but `typeVersion` was only available in command arguments. Now
  resolves from `item.typeVersion`, `item.typeInfo?.version`, or `item.command?.arguments`.

## [1.0.4] - 2026-02-13

### Added
- **SfApiResponse base class** — Centralized response parsing and logging for all REST API calls.
  Both `SfDirectRestClient` and `SfRestClient` now route responses through `SfApiResponse` for
  consistent error detection, timing, and structured logging.
- **Deploy/Upgrade phase diagram** — New `docs/architecture/deploy-upgrade-phases.md` with Mermaid
  flowcharts documenting the full deploy lifecycle: pre-flight check, upload, provision, create,
  rolling upgrade, and remove flows.
- **Mock server 5c-silver profile** — Complete mock profile captured from a real 5-node Silver
  durability cluster with VotingType and sf_ps1Type applications. 47 fixture files covering
  all treeview drill-down levels (nodes, applications, services, partitions, replicas, manifests).

### Fixed
- **DirectClient not initialized** — `SfRest` constructor now initializes `directClient` with
  the default endpoint, preventing null reference errors on first use.
- **Null output channel guard** — `SfUtility.outputLog()` now safely handles null channel,
  preventing crashes when logging before channel initialization.
- **Mock server pagination format** — Mock server now wraps array responses in
  `{ContinuationToken, Items}` pagination envelope matching the real SF REST API.
- **Mock server route ordering** — System services route moved before parameterized services
  route to prevent `/Applications/System` being matched by the wildcard pattern.
- **Mock server query parameter handling** — Resolvers now receive path-only (no query params)
  for regex matching, fixing 404s when API calls include `?api-version=` parameters.
- **Mock server service ID separator** — Partition/replica resolvers now handle both `~` and `/`
  service ID separators, matching the SF REST API convention.

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
