# Extension Autostart Root Cause Analysis
**Date:** February 3, 2026  
**Issue:** Extension activates automatically on VS Code startup

---

## ROOT CAUSE FOUND

### Why Extension Auto-Starts

**Location:** `package.json` lines 18-27

```json
"activationEvents": [
  "onView:serviceFabricClusterView",      ⬅️ THIS CAUSES AUTOSTART
  "onView:serviceFabricManagementPanel",  ⬅️ THIS TOO
  "onCommand:sfClusterExplorer.sfGetClusters",
  "onCommand:sfClusterExplorer.sfGetCluster",
  ...
]
```

**The Chain Reaction:**
1. VS Code starts
2. Explorer sidebar opens (default behavior)
3. View `serviceFabricClusterView` is registered in Explorer (package.json line 50)
4. `onView:serviceFabricClusterView` activation event triggers
5. Extension `activate()` function runs
6. `SfMgr` and `SfPrompts` objects created
7. WebView provider registered
8. All commands registered

**Location of View Registration:** `package.json` lines 46-56
```json
"views": {
  "explorer": [                          ⬅️ REGISTERED IN EXPLORER
    {
      "id": "serviceFabricClusterView",  ⬅️ THIS VIEW
      "name": "Service Fabric Clusters"
    },
    {
      "id": "serviceFabricManagementPanel",
      "name": "Management",
      "type": "webview"
    }
  ]
}
```

### What Happens on Activation

**File:** `src/extension.ts` line 15+

```typescript
export async function activate(context: vscode.ExtensionContext) {
    // Creates SfMgr instance
    const sfMgr = new SfMgr(context);
    
    // Creates SfPrompts instance  
    const sfPrompts = new SfPrompts(context);
    
    // Registers WebView
    const managementProvider = new ManagementWebviewProvider(...);
    
    // Registers ALL commands
    registerCommand(context, 'sfClusterExplorer.sfGetClusters', ...);
    registerCommand(context, 'sfClusterExplorer.sfGetCluster', ...);
    // ... 50+ more command registrations
}
```

**Impact:**
- Extension loads immediately on VS Code startup
- All resources allocated
- All commands registered
- TreeView initialized
- WebView provider ready
- Memory consumed even if never used

---

## SOLUTIONS

### Option 1: Remove from Explorer (RECOMMENDED)
**Change:** Move views to custom Activity Bar container

**Benefits:**
- No autostart
- User controls visibility
- Clean separation
- Standard VS Code pattern

**Implementation:**
```json
// package.json - BEFORE
"views": {
  "explorer": [  ⬅️ REMOVE FROM HERE
    { "id": "serviceFabricClusterView", ... }
  ]
}

// package.json - AFTER  
"views": {
  "package-explorer": [  ⬅️ USE CUSTOM CONTAINER
    { "id": "serviceFabricClusterView", ... }
  ]
}
```

**Activation Events:**
```json
"activationEvents": [
  "onView:serviceFabricClusterView",  ⬅️ KEEP THIS (now only fires when user clicks icon)
  "onCommand:..."                      ⬅️ KEEP COMMANDS
]
```

**Result:** Extension only activates when user clicks Service Fabric icon in Activity Bar

---

### Option 2: Command-Only Activation
**Change:** Remove view-based activation entirely

**Benefits:**
- No autostart whatsoever
- Minimal resource usage
- User explicitly invokes

**Implementation:**
```json
// package.json
"activationEvents": [
  // REMOVE: "onView:serviceFabricClusterView",
  // REMOVE: "onView:serviceFabricManagementPanel",
  "onCommand:sfClusterExplorer.sfGetClusters",  ⬅️ KEEP ONLY COMMANDS
  "onCommand:sfClusterExplorer.sfGetCluster",
  ...
]
```

**Trade-off:** User must run a command to see the view

---

### Option 3: Lazy TreeView
**Change:** Register view but delay TreeView creation

**Benefits:**
- View appears in Explorer
- No heavy lifting on activation
- Loads on first expansion

**Implementation:**
```typescript
// src/extension.ts
export async function activate(context: vscode.ExtensionContext) {
    // DON'T create SfMgr/SfPrompts here
    
    // Register view with lazy provider
    vscode.window.registerTreeDataProvider('serviceFabricClusterView', {
        getChildren: () => {
            // Create SfMgr on first access
            if (!sfMgrInstance) {
                sfMgrInstance = new SfMgr(context);
            }
            return sfMgrInstance.getChildren();
        }
    });
}
```

**Result:** Extension activates but does minimal work until view expanded

---

## RECOMMENDED FIX

**Use Option 1: Custom Activity Bar Container**

### Changes Required

#### 1. package.json
```json
{
  "activationEvents": [
    "onView:serviceFabricClusterView",
    "onCommand:..."
  ],
  "contributes": {
    "viewsContainers": {
      "activitybar": [
        {
          "id": "serviceFabric",           // ⬅️ NEW
          "title": "Service Fabric",        // ⬅️ NEW
          "icon": "media/service-fabric.svg" // ⬅️ NEW (need icon)
        }
      ]
    },
    "views": {
      "serviceFabric": [                   // ⬅️ CHANGED FROM "explorer"
        {
          "id": "serviceFabricClusterView",
          "name": "Clusters"
        },
        {
          "id": "serviceFabricManagementPanel",
          "name": "Management",
          "type": "webview"
        }
      ]
    }
  }
}
```

#### 2. Add icon
**File:** `media/service-fabric.svg` (need to create)

### Testing
1. Make changes
2. Reload VS Code
3. Verify:
   - Extension does NOT activate on startup
   - New SF icon appears in Activity Bar
   - Clicking icon shows views
   - Commands still work

---

## ADDITIONAL OPTIMIZATIONS

### Reduce Activation Work
Even with lazy loading, current activation does too much:

```typescript
// CURRENT (BAD)
export async function activate(context: vscode.ExtensionContext) {
    const sfMgr = new SfMgr(context);  // ⬅️ HEAVY: Creates connections, loads state
    const sfPrompts = new SfPrompts(context); // ⬅️ Creates prompts
    // Register 50+ commands
}

// BETTER
export async function activate(context: vscode.ExtensionContext) {
    // Register commands only
    // Create SfMgr/SfPrompts lazily when first command runs
}
```

### Command Registration Pattern
```typescript
// Lazy initialization
let sfMgr: SfMgr | undefined;
let sfPrompts: SfPrompts | undefined;

function getSfMgr(context: vscode.ExtensionContext): SfMgr {
    if (!sfMgr) {
        sfMgr = new SfMgr(context);
    }
    return sfMgr;
}

registerCommand(context, 'sfClusterExplorer.sfGetCluster', async () => {
    const mgr = getSfMgr(context);  // ⬅️ Create only when needed
    await mgr.getCluster();
});
```

---

## IMPACT ANALYSIS

### Current Behavior
- ❌ Activates on every VS Code startup
- ❌ Loads even if never used
- ❌ Consumes memory immediately
- ❌ Slows down startup
- ❌ User has no control

### After Fix (Option 1)
- ✅ No automatic activation
- ✅ User controls when to load
- ✅ No memory use until needed
- ✅ Faster VS Code startup
- ✅ Standard VS Code pattern
- ✅ Professional UX

### User Experience
**Before:** "Why does this extension keep starting?"
**After:** "I click the SF icon when I need it"

---

## IMPLEMENTATION ESTIMATE

**Time:** 15-30 minutes

**Steps:**
1. Update `package.json` (5 min)
2. Create/find Service Fabric icon SVG (10 min)
3. Test activation behavior (5 min)
4. Verify all features still work (10 min)

**Risk:** LOW - Only changes activation, not functionality

---

## CONCLUSION

**Problem:** Extension in Explorer sidebar = auto-activation
**Solution:** Move to custom Activity Bar container  
**Result:** User controls activation by clicking icon

**This is a 5-line change in package.json that solves the entire autostart issue.**
