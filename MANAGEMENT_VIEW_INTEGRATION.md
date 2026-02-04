# Management View Integration Guide

## Overview
This document explains how to integrate the Management WebView into the Service Fabric extension following VS Code best practices.

## Files Created
1. **`src/views/ManagementWebviewProvider.ts`** - WebView provider implementation
2. This guide - Integration instructions

## Integration Steps

### Step 1: Update `package.json`

Add the webview to your extension's contributions:

```json
{
  "contributes": {
    "viewsContainers": {
      "activitybar": [
        {
          "id": "serviceFabricExplorer",
          "title": "Service Fabric",
          "icon": "media/sf-icon.svg"
        }
      ]
    },
    "views": {
      "serviceFabricExplorer": [
        {
          "id": "serviceFabricClusterView",
          "name": "Clusters",
          "when": "serviceFabricClustersExist"
        },
        {
          "id": "serviceFabricManagementPanel",
          "name": "Management",
          "type": "webview",
          "when": "serviceFabricClustersExist"
        }
      ]
    },
    "commands": [
      {
        "command": "sfClusterExplorer.openManagement",
        "title": "Service Fabric: Open Management Panel",
        "category": "Service Fabric"
      }
    ]
  }
}
```

### Step 2: Update `src/extension.ts`

Register the webview provider during activation:

```typescript
import { ManagementWebviewProvider } from './views/ManagementWebviewProvider';

export async function activate(context: vscode.ExtensionContext) {
    // ... existing code ...

    const sfMgr = new SfMgr(context);
    
    // Register Management WebView Provider
    const managementProvider = new ManagementWebviewProvider(
        context.extensionUri,
        sfMgr
    );
    
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            ManagementWebviewProvider.viewType,
            managementProvider,
            {
                webviewOptions: {
                    retainContextWhenHidden: true // Keep state when hidden
                }
            }
        )
    );

    // Optional: Add command to open management panel
    registerCommand(context, 'sfClusterExplorer.openManagement', () => {
        vscode.commands.executeCommand('serviceFabricManagementPanel.focus');
    });

    // ... rest of activation code ...
}
```

### Step 3: Add Required Methods to `SfRest.ts`

The ManagementWebviewProvider expects these methods in SfRest:

```typescript
export class SfRest {
    // ... existing code ...

    /**
     * Upload application package to image store
     */
    public async uploadApplicationPackage(
        packagePath: string,
        appTypeName: string,
        appTypeVersion: string
    ): Promise<void> {
        // Implementation: Use copyApplicationPackage API
        // https://learn.microsoft.com/rest/api/servicefabric/sfclient-api-copyapplicationpackage
        throw new Error('Not implemented yet');
    }

    /**
     * Provision application type
     */
    public async provisionApplicationType(
        appTypeName: string,
        appTypeVersion: string
    ): Promise<void> {
        // Implementation: Use provisionApplicationType API
        await this.sfApi.provisionApplicationType({
            applicationTypeBuildPath: `${appTypeName}_${appTypeVersion}`,
            applicationPackageCleanupPolicy: 'Automatic'
        });
    }

    /**
     * Create application instance
     */
    public async createApplication(
        appName: string,
        appTypeName: string,
        appTypeVersion: string
    ): Promise<void> {
        // Implementation: Use createApplication API
        await this.sfApi.createApplication({
            name: appName,
            typeName: appTypeName,
            typeVersion: appTypeVersion
        });
    }

    /**
     * Delete application
     */
    public async deleteApplication(appName: string): Promise<void> {
        // Implementation: Use deleteApplication API
        const appId = appName.replace('fabric:/', '');
        await this.sfApi.deleteApplication(appId);
    }

    /**
     * Deactivate node
     */
    public async deactivateNode(nodeName: string, intent: string): Promise<void> {
        // Implementation: Use deactivateNode API
        await this.sfApi.deactivateNode(nodeName, intent);
    }

    /**
     * Activate node
     */
    public async activateNode(nodeName: string): Promise<void> {
        // Implementation: Use activateNode API
        await this.sfApi.activateNode(nodeName);
    }
}
```

### Step 4: Test the Integration

1. **Reload the extension**:
   ```
   Press F5 to debug, or:
   npm run compile
   code-insiders --install-extension vscode-service-fabric-diagnostic-extension-0.0.1.vsix --force
   ```

2. **Verify the view appears**:
   - Connect to a cluster
   - Check the Service Fabric activity bar
   - The "Management" panel should appear below the "Clusters" tree view

3. **Test management operations**:
   - Click "Deploy Application" - should open file picker
   - Click "Remove Application" - should show application list
   - Click "Deactivate Node" - should show node list

## Adding Context Menu Actions (Optional)

For right-click actions on tree items:

### Update `package.json`:

```json
{
  "contributes": {
    "menus": {
      "view/item/context": [
        {
          "command": "sfClusterExplorer.node.deactivate",
          "when": "view == serviceFabricClusterView && viewItem =~ /node/",
          "group": "management@1"
        },
        {
          "command": "sfClusterExplorer.node.activate",
          "when": "view == serviceFabricClusterView && viewItem =~ /node/",
          "group": "management@2"
        },
        {
          "command": "sfClusterExplorer.app.remove",
          "when": "view == serviceFabricClusterView && viewItem =~ /application/",
          "group": "lifecycle@1"
        },
        {
          "command": "sfClusterExplorer.app.upgrade",
          "when": "view == serviceFabricClusterView && viewItem =~ /application/",
          "group": "lifecycle@2"
        }
      ]
    },
    "commands": [
      {
        "command": "sfClusterExplorer.node.deactivate",
        "title": "Deactivate Node",
        "category": "Service Fabric"
      },
      {
        "command": "sfClusterExplorer.node.activate",
        "title": "Activate Node",
        "category": "Service Fabric"
      },
      {
        "command": "sfClusterExplorer.app.remove",
        "title": "Remove Application",
        "category": "Service Fabric"
      },
      {
        "command": "sfClusterExplorer.app.upgrade",
        "title": "Upgrade Application",
        "category": "Service Fabric"
      }
    ]
  }
}
```

### Register commands in `extension.ts`:

```typescript
registerCommand(context, 'sfClusterExplorer.node.deactivate', async (item: TreeItem) => {
    const managementProvider = /* get provider reference */;
    await managementProvider._handleDeactivateNode({ nodeName: item.itemId });
});

registerCommand(context, 'sfClusterExplorer.app.remove', async (item: TreeItem) => {
    const managementProvider = /* get provider reference */;
    await managementProvider._handleRemoveApplication({ appName: item.itemId });
});
```

## Architecture Benefits

### 1. **Separation of Concerns**
- WebView handles UI
- SfRest handles API calls
- Extension.ts handles command routing

### 2. **Type Safety**
- TypeScript interfaces for all messages
- Compile-time checks for API calls

### 3. **User Experience**
- Native VS Code UI components (file picker, quick pick, progress)
- Theme-aware styling
- Keyboard navigation

### 4. **Maintainability**
- Self-contained webview provider
- Easy to add new operations
- Clear message passing protocol

### 5. **Security**
- Content Security Policy (CSP) enforced
- Nonce-based script execution
- No inline styles/scripts

## Next Steps

1. **Implement remaining methods in SfRest**:
   - uploadApplicationPackage
   - provisionApplicationType
   - createApplication
   - deleteApplication
   - deactivateNode
   - activateNode

2. **Add validation**:
   - Check cluster connection before operations
   - Validate input parameters
   - Handle API errors gracefully

3. **Enhance UI**:
   - Add icons to buttons
   - Show operation history
   - Add progress indicators in webview

4. **Testing**:
   - Unit tests for webview provider
   - Integration tests for full workflows
   - Manual testing on real clusters

## VS Code Extension Guidelines

This implementation follows:
- ✅ [Webview API Guidelines](https://code.visualstudio.com/api/extension-guides/webview)
- ✅ [Tree View API Guidelines](https://code.visualstudio.com/api/extension-guides/tree-view)
- ✅ [Command Patterns](https://code.visualstudio.com/api/references/commands)
- ✅ [Extension Anatomy](https://code.visualstudio.com/api/get-started/extension-anatomy)
- ✅ [UX Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Resources

- [VS Code Webview Sample](https://github.com/microsoft/vscode-extension-samples/tree/main/webview-sample)
- [Service Fabric REST API](https://learn.microsoft.com/rest/api/servicefabric/)
- [VS Code API Documentation](https://code.visualstudio.com/api)
