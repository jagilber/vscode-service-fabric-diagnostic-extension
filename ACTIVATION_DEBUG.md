## Extension Activation Debugging Guide

The commands are correctly compiled and registered. If you're still getting "command not found" errors, the extension likely isn't activating.

### Check Extension Status in VS Code:

1. **Open Command Palette** (`Ctrl+Shift+P`)
2. Type: **"Developer: Show Running Extensions"**
3. Look for: `jagilber.vscode-service-fabric-diagnostic-extension`
   - **If shown**: Extension is running ✅
   - **If missing**: Extension failed to activate ❌

### View Activation Errors:

1. **Open Output Panel** (`Ctrl+Shift+U` or View → Output)
2. **Select dropdown**: "Extension Host" or "Log (Extension Host)"
3. **Look for**:
   ```
   [SF Extension] Activating Service Fabric extension...
   [SF Extension] Creating SfMgr and SfPrompts...
   [SF Extension] Registering commands...
   ```

### Common Activation Issues:

#### Issue 1: Extension Never Activates
**Cause**: View isn't opening (activation trigger: `onView:serviceFabricClusterView`)

**Fix**: 
- Ensure Explorer sidebar is open (`Ctrl+Shift+E`)
- Look for "SERVICE FABRIC CLUSTERS" section
- If missing, the view registration failed

#### Issue 2: Silent Activation Failure
**Cause**: Runtime error during activation (TypeScript compilation issue, missing dependency)

**Check**:
1. Help → Toggle Developer Tools
2. Console tab
3. Look for red errors mentioning "service-fabric" or "sfCluster"

### Quick Tests:

#### Test 1: Check if ANY command works
```
Ctrl+Shift+P → Type: "service fabric"
```
Can you see these commands?
- ✅ service fabric: get clusters from subscription
- ✅ service fabric: get cluster
- ✅ service fabric: add cluster endpoint

#### Test 2: Force view to open
```
Ctrl+Shift+P → Type: "Service Fabric Clusters: Focus on Service Fabric Clusters View"
```

### If Extension Shows as Running but Commands Fail:

This means registration worked but the command implementation is broken.

**To debug**:
1. Help → Toggle Developer Tools → Console
2. Run the failing command
3. Look for the actual error (will show the JavaScript stack trace)

### Nuclear Option: Clean Reinstall

```powershell
# Complete clean reinstall
code --uninstall-extension jagilber.vscode-service-fabric-diagnostic-extension
Remove-Item -Recurse "$env:USERPROFILE\.vscode\extensions\jagilber.vscode-service-fabric-diagnostic-extension-*" -Force
code --install-extension path\to\vscode-service-fabric-diagnostic-extension-1.0.0.vsix
```

Then reload VS Code window (`Ctrl+R`).

---

## What I Found:

✅ **Commands are registered correctly** in compiled code:
- `sfClusterExplorer.sfGetClusters` 
- `sfClusterExplorer.sfGetCluster`
- `sfClusterExplorer.sfSetClusterEndpoint`

✅ **Package.json is correct**:
- Activation: `onView:serviceFabricClusterView`
- View: Always visible (no "when" clause)
- All commands declared

The problem is **activation not completing**. Please follow the debugging steps above and report what you see in:
1. "Developer: Show Running Extensions"
2. Output panel → "Extension Host" logs
3. Developer Tools → Console
