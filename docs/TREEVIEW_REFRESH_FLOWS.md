# Treeview Refresh Flows

> **Authoritative reference** for every code path that refreshes the Service Fabric tree view.  
> If a change breaks refresh behavior, verify it against these documented flows.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│ VS Code TreeView                                        │
│  ┌──────────────────── onDidChangeTreeData ─────────┐   │
│  │                                                   │   │
│  │  EventEmitter.fire(undefined)  → full re-walk     │   │
│  │  EventEmitter.fire(node)       → re-walk subtree  │   │
│  │                                                   │   │
│  │  VS Code calls:                                   │   │
│  │   getChildren(undefined) → roots[]                │   │
│  │   getTreeItem(root) → TreeItem                    │   │
│  │   getChildren(root) → group nodes[]               │   │
│  │   getTreeItem(group) → TreeItem                   │   │
│  │   getChildren(group) → REST fetch (if expanded)   │   │
│  └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ SfTreeDataProvider                         │
│  - roots: ClusterNode[]                    │
│  - cache: DataCache                        │
│  - refreshManager: RefreshManager          │
│  - emitter: EventEmitter<ITreeNode|void>   │
│                                            │
│  getTreeItem(element) → element.getTreeItem()
│  getChildren(element) → element?.getChildren() || roots
│                                            │
│  refresh(node?) → refreshManager.refresh() │
│  fullRefresh() → invalidateAll() + refresh()
│  invalidateAll() → health + cache.clear + invalidate roots
│  refreshHealthOnly() → health only, no invalidation
└────────────────────────────────────────────┘

┌──────────────────────────────┐
│ RefreshManager               │
│  - debounceTimer (100ms)     │
│  - autoRefreshTimer (30s)    │
│  - pendingFullRefresh flag   │
│                              │
│  refresh(node?) → debounced fire
│  startAutoRefresh(cb) → setInterval
│  stopAutoRefresh() → clearInterval
└──────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ Node Hierarchy                                       │
│                                                      │
│  ClusterNode (overrides invalidate — preserves children)
│   ├── StaticItemNode (essentials, details, health…)  │
│   ├── ApplicationsGroupNode (overrides invalidate)   │
│   │    └── ApplicationNode → ServiceNode → …         │
│   ├── NodesGroupNode (overrides invalidate)          │
│   │    └── NodeNode → DeployedAppNode → …            │
│   └── SystemGroupNode (overrides invalidate)         │
│        └── ServiceNode → PartitionNode → …           │
│                                                      │
│  All extend BaseTreeNode:                            │
│   _isLoaded: true → return cached children           │
│   _isLoaded: false → call fetchChildren() (REST)     │
└──────────────────────────────────────────────────────┘
```

---

## Flow 1: Auto-Refresh Timer (30-second cycle)

**Trigger:** `setInterval` in `RefreshManager.startAutoRefresh()`  
**Guard:** Only runs if `sfClusterExplorer.autorefresh` setting is `true` (default: `false`)  
**Interval:** `sfClusterExplorer.refreshInterval` setting (default: `30000` ms)

```
setInterval fires
  │
  ├─ RefreshManager calls: await invalidateCallback()
  │   │
  │   └─ SfTreeDataProvider.invalidateAll()
  │       │
  │       ├─ For each root: sfConfig.populateClusterHealth()   ← REST call
  │       │   (skips clusters with per-cluster refresh disabled)
  │       │
  │       ├─ cache.clear()   ← wipes ALL DataCache entries
  │       │
  │       └─ For each root: root.invalidate()
  │           │
  │           └─ ClusterNode.invalidate()   ← PRESERVES children array
  │               │                            (_isLoaded stays true)
  │               │
  │               └─ For each child: child.invalidate()
  │                   │
  │                   ├─ StaticItemNode.invalidate() → no-op (leaf)
  │                   │
  │                   ├─ ApplicationsGroupNode.invalidate()
  │                   │   ├─ Clear appCount, healthState → undefined
  │                   │   └─ super.invalidate()
  │                   │       ├─ Dispose old child nodes
  │                   │       ├─ children = undefined
  │                   │       └─ _isLoaded = false
  │                   │
  │                   ├─ NodesGroupNode.invalidate()
  │                   │   ├─ Clear nodeCount, healthState → undefined
  │                   │   └─ super.invalidate() → same as above
  │                   │
  │                   └─ SystemGroupNode.invalidate()
  │                       ├─ Clear serviceCount, healthState → undefined
  │                       └─ super.invalidate() → same as above
  │
  └─ RefreshManager calls: emitter.fire(undefined)   ← triggers VS Code re-walk
      │
      └─ VS Code tree walk:
          │
          ├─ getChildren(undefined) → returns roots[] (same ClusterNode instances)
          │
          ├─ getTreeItem(clusterNode) → reads sfConfig.getClusterHealth()
          │   (fresh health from populateClusterHealth above)
          │
          ├─ getChildren(clusterNode) → _isLoaded=true, returns same children[]
          │   (ClusterNode preserves children — no flicker)
          │
          ├─ getTreeItem(applicationsGroup) → reads appCount/healthState
          │   (undefined after invalidate, falls back to cluster health)
          │
          └─ getChildren(applicationsGroup) → IF EXPANDED:
              │   _isLoaded=false → calls fetchChildren()
              │   REST calls: getApplications, getApplicationHealth
              │   Sets appCount, healthState from fresh data
              │   Returns new ApplicationNode[] children
              │
              └─ IF COLLAPSED: VS Code does NOT call getChildren
                  (data stays stale until user expands)
```

**Key file locations:**
- Timer setup: `RefreshManager.startAutoRefresh()` — [RefreshManager.ts](../src/treeview/RefreshManager.ts#L56)  
- Callback: `SfTreeDataProvider.invalidateAll()` — [SfTreeDataProvider.ts](../src/treeview/SfTreeDataProvider.ts#L222)  
- ClusterNode override: `ClusterNode.invalidate()` — [ClusterNode.ts](../src/treeview/nodes/cluster/ClusterNode.ts#L57)  
- Group invalidate: `ApplicationsGroupNode.invalidate()` — [ApplicationsGroupNode.ts](../src/treeview/nodes/cluster/ApplicationsGroupNode.ts#L29)

---

## Flow 2: Manual Refresh ("Refresh Now" command or `sfClusterExplorer.refresh`)

**Trigger:** User clicks "Refresh Now" context menu or runs `sfClusterExplorer.refresh` command  
**Entry point:** `ViewCommands.ts` → `sfMgr.sfClusterView.refresh()`

```
User: "Refresh Now" context menu
  │
  ├─ ViewCommands: sfMgr.sfClusterView.refresh()
  │
  └─ SfTreeDataProviderAdapter.refresh()
      │
      └─ provider.fullRefresh()
          │
          ├─ await invalidateAll()   ← same as Flow 1 above
          │   ├─ populateClusterHealth() for each root
          │   ├─ cache.clear()
          │   └─ root.invalidate() for each root
          │
          └─ refresh()   ← queues debounced emitter.fire(undefined)
              │
              └─ RefreshManager.refresh(undefined)
                  └─ setTimeout → emitter.fire(undefined)
                      └─ VS Code tree walk (same as Flow 1)
```

**Key file locations:**
- Command handler: `ViewCommands.ts` — [ViewCommands.ts](../src/commands/ViewCommands.ts#L34)  
- Adapter bridge: `SfTreeDataProviderAdapter.refresh()` — [SfTreeDataProviderAdapter.ts](../src/treeview/SfTreeDataProviderAdapter.ts#L17)  
- Full refresh: `SfTreeDataProvider.fullRefresh()` — [SfTreeDataProvider.ts](../src/treeview/SfTreeDataProvider.ts#L171)

---

## Flow 3: Initial Cluster Population (after connecting)

**Trigger:** `SfMgr.sfGetCluster()` completes → calls `updateClusterInTree()`  
**Purpose:** Pre-fetch group data so labels show "(N)" instead of "(…)" without waiting for expand

```
sfMgr.sfGetCluster()
  │
  ├─ adapter.addClusterToTree(sfConfig, sfRest)
  │   └─ provider.addCluster()
  │       ├─ Creates ClusterNode with TreeNodeContext
  │       ├─ Pushes to roots[]
  │       └─ refreshManager.startAutoRefresh(invalidateAll)
  │           (only starts ONCE, has guard: if (this.autoRefreshTimer) return)
  │
  └─ adapter.updateClusterInTree(endpoint, sfConfig)
      │
      └─ provider.populateClusterInBackground(endpoint)
          │
          ├─ sfConfig.populateClusterHealth()   ← first REST call
          ├─ refresh()   ← fires so root icon gets health color
          │
          ├─ root.getChildren()   ← creates group nodes (fetchChildren)
          │
          ├─ For each group node (Applications, Nodes, System):
          │   await groupNode.getChildren()   ← triggers fetchChildren
          │   ├─ REST: getApplications / getNodes / getSystemHealth
          │   └─ Sets appCount / nodeCount / serviceCount
          │
          └─ refresh()   ← fires again to update all labels
```

**Key file locations:**
- Adapter entry: `SfTreeDataProviderAdapter.updateClusterInTree()` — [SfTreeDataProviderAdapter.ts](../src/treeview/SfTreeDataProviderAdapter.ts#L53)
- Background population: `SfTreeDataProvider.populateClusterInBackground()` — [SfTreeDataProvider.ts](../src/treeview/SfTreeDataProvider.ts#L291)

---

## Flow 4: Retry Node (error recovery)

**Trigger:** User clicks "Retry" on an error node  
**Entry point:** `sfClusterExplorer.retryNode` command

```
User clicks ErrorNode (has retry command)
  │
  └─ ViewCommands: sfClusterExplorer.retryNode(parentNode)
      │
      ├─ parentNode.invalidate()   ← resets _isLoaded=false on the failed node
      │
      └─ sfMgr.sfClusterView.refresh()
          └─ adapter.refresh() → fullRefresh()
              (same as Flow 2 — may be heavier than needed for single-node retry)
```

**Note:** `retryNode` currently triggers a full tree refresh via the adapter. This is heavier than necessary — a targeted `refresh(parentNode)` would be more efficient but was chosen for correctness during the initial implementation.

**Key file location:** [ViewCommands.ts](../src/commands/ViewCommands.ts#L92)

---

## Node Invalidation Rules

### ClusterNode (root)
- **PRESERVES** children array on `invalidate()`
- `_isLoaded` stays `true` — `getChildren()` returns same group node instances
- Recursively calls `child.invalidate()` on each child
- **Reason:** Prevents destruction/recreation of group nodes which causes label flicker

### Group Nodes (ApplicationsGroupNode, NodesGroupNode, SystemGroupNode)
- **CLEARS** local state: `appCount`/`nodeCount`/`serviceCount` → `undefined`, `healthState` → `undefined`
- Calls `super.invalidate()` (BaseTreeNode) which:
  - Disposes child nodes
  - Sets `children = undefined`
  - Sets `_isLoaded = false`
- **Result:** Next `getChildren()` call triggers `fetchChildren()` → fresh REST data

### BaseTreeNode (default)
- Disposes children, clears `children`, sets `_isLoaded = false`
- Next `getChildren()` will call `fetchChildren()`

### StaticItemNode (leaf)
- `invalidate()` is a no-op — these nodes have no children or cached data

---

## DataCache Behavior

- **TTL:** 15 seconds (default)
- **Cleared by:** `invalidateAll()` calls `cache.clear()` before node invalidation
- **Used by:** Group nodes in `fetchChildren()` to cache REST responses
- **NOT cleared by:** `refreshHealthOnly()` — intentional, only health data refreshes

---

## Settings That Affect Refresh

| Setting | Default | Effect |
|---------|---------|--------|
| `sfClusterExplorer.autorefresh` | `false` | Auto-refresh timer on/off |
| `sfClusterExplorer.refreshInterval` | `30000` | Timer interval in ms |
| Per-cluster disable (globalState) | `[]` | Stored in `sfClusterExplorer.refreshDisabledClusters` |

---

## Diagnostic Logging

All refresh-related logs use the `[TREE]` prefix for easy filtering in the output channel.

Key log messages to watch for:
- `[TREE] RefreshManager.fire: undefined (full tree)` — emitter fired, VS Code will re-walk
- `[TREE] invalidateAll: clearing cache (N entries) and invalidating N roots` — cache+node reset
- `[TREE] ClusterNode.invalidate(endpoint): invalidated N children, _isLoaded stays true` — cluster preserves children
- `[TREE] ApplicationsGroupNode.invalidate: clearing appCount=N, healthState=X` — group state reset
- `[TREE] getChildren(type:id): _isLoaded=false, calling fetchChildren()` — fresh REST fetch
- `[TREE] getChildren(type:id): _isLoaded=true, returning N cached children` — serving cached

---

## Common Issues

### Tree not updating after deploy/remove
1. Check `[TREE] RefreshManager.fire` appears in output → means emitter fired
2. Check `[TREE] invalidateAll: clearing cache` appears → means data was invalidated
3. Check `[TREE] getChildren: _isLoaded=false, calling fetchChildren()` appears → means fresh REST data requested
4. If group is **collapsed**, VS Code won't call `getChildren()` for it — data stays stale until expanded

### Auto-refresh not working
1. Check setting: `sfClusterExplorer.autorefresh` must be `true`
2. Check output: `RefreshManager: starting auto-refresh` should appear once
3. Check output: `RefreshManager: auto-refresh tick` should appear every 30s
4. Check output: `RefreshManager: emitter.fire(undefined) after async callback` confirms the fire

### Health icons not updating
- `ClusterNode.getTreeItem()` reads `sfConfig.getClusterHealth()` — check `populateClusterHealth()` succeeded
- Group nodes fall back to cluster health when `appCount`/`healthState` are `undefined`
- If `⚠️ ClusterNode.getTreeItem: NO HEALTH DATA` appears, the cluster health fetch failed

---

## Test Coverage

Tests in `test/unit/TreeRefreshFlows.test.ts` cover:
- DataCache TTL and clear behavior
- RefreshManager debounce, full-refresh priority, auto-refresh timer
- Node invalidation chains (BaseTreeNode, ClusterNode, group nodes)
- Full refresh flow (invalidateAll + fire sequence)
- Adapter → fullRefresh → invalidateAll → emitter.fire chain
- End-to-end scenarios: deploy/remove refresh, collapsed node behavior, error recovery
