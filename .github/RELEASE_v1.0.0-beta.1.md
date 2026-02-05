# Service Fabric Diagnostic Extension v1.0.0-beta.1

**First Public Beta Release** - Making Service Fabric management accessible to all operators!

> 📢 **Marketplace Coming Soon**: This extension will be published to VS Code Marketplace in v0.2.0 (March 2026). Until then, install via VSIX - takes just 60 seconds, no development tools required!

## 🎉 What's New in This Release

### ⚡ Quick Start for Non-Developers
- **60-second installation** - No Node.js, no build tools, no coding required
- **Clear first-time setup** - Add cluster endpoint and start managing immediately
- **Optimized for operators** - Service Fabric admins, DevOps engineers, cluster operators

### 🏪 Marketplace Preparation
- **Accelerated publication timeline** - v0.2.0 (March 2026) instead of v1.0.0
- **Enhanced discoverability** - Keywords added for marketplace search
- **One-click install coming** - Direct from VS Code Extensions marketplace

### 📦 Complete Feature Set
- **Visual cluster explorer** with tree view navigation
- **Real-time health monitoring** with color-coded status
- **Interactive management panel** for deployments and operations
- **Certificate authentication** for secure clusters (Windows/Linux/macOS)
- **Context menu actions** for quick operations
- **Export snapshots** to JSON for documentation

## 📦 Installation (60 Seconds)

### Step 1: Download VSIX
Download `vscode-service-fabric-diagnostic-extension-1.0.0.vsix` attached below (498 KB)

### Step 2: Install in VS Code

**Option A - UI (Easiest):**
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Click `...` menu → **Install from VSIX...**
4. Select downloaded `.vsix` file
5. Reload VS Code

**Option B - Command Line:**
```bash
code --install-extension vscode-service-fabric-diagnostic-extension-1.0.0.vsix
```

### Step 3: Connect Your Cluster
1. Open Explorer sidebar
2. Find "Service Fabric Clusters" section
3. Click `+` to add cluster endpoint:
   - **Local dev**: `http://localhost:19080`
   - **Secure cluster**: `https://your-cluster:19080` (certificate prompt will appear)

**That's it!** You're ready to manage your clusters.

## 📚 Documentation

- **[Quick Start Guide](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension#-quick-start)** - Get started in 60 seconds
- **[Installation Guide](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension#-installation)** - Detailed installation options
- **[Configuration Guide](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension#%EF%B8%8F-configuration)** - Certificate setup for secure clusters
- **[Complete Documentation](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension/tree/master/docs)** - Architecture, guides, best practices

## 🚀 Features Highlights

### Cluster Explorer
- Visual tree view: Clusters → Nodes → Applications → Services → Partitions → Replicas
- Health status indicators: 🟢 OK, 🟡 Warning, 🔴 Error
- Real-time updates with configurable refresh interval
- Multi-cluster support with persistent configuration

### Management Operations
- **Applications**: Deploy, upgrade, remove
- **Nodes**: Activate, deactivate, restart, remove state
- **Cluster**: Upgrade, backup/restore configurations
- Right-click context menus on all items

### Performance
- Intelligent caching with LRU and TTL
- Parallel health queries (5x faster loading)
- Debounced refresh to prevent UI thrashing
- Retry logic with exponential backoff

## 🔐 Security

This release passes all security checks:
- ✅ **CodeQL Analysis** (JavaScript/TypeScript)
- ✅ **TruffleHog Secret Scanning**
- ✅ **NPM Security Audit**
- ✅ **License Compliance**
- ✅ **Certificate Security Audit**

Certificates stored securely using VS Code SecretStorage API (Windows Credential Manager / macOS Keychain / Linux Secret Service).

## ⚠️ Known Limitations

- **Marketplace**: Not yet available on VS Code Marketplace (coming v0.2.0, March 2026)
- **Icon**: Default icon - custom icon planned for marketplace release
- **Screenshots**: Minimal screenshots in marketplace listing (will be enhanced)

No critical bugs known. See [Issues](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension/issues) for complete list.

## 🎯 Target Audience

This extension is designed for:
- **Service Fabric Administrators** - Manage clusters without coding
- **DevOps Engineers** - Quick operational tasks in familiar environment
- **Cluster Operators** - Monitor health and perform maintenance
- **Developers** - Debug services and inspect cluster state
- **Teams** - Fast evaluation without complex setup

## 🤝 Feedback Welcome!

This is a beta release - we value your feedback:
- **Bug reports**: [GitHub Issues](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension/issues)
- **Feature requests**: [GitHub Discussions](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension/discussions)
- **General questions**: [Discussions Q&A](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension/discussions/categories/q-a)

Help us prioritize features for the v0.2.0 marketplace release!

## 📋 Requirements

- **VS Code**: 1.108.0 or higher
- **OS**: Windows, Linux, macOS
- **Node.js**: Not required for VSIX installation (only for development)
- **Service Fabric cluster**: Local dev cluster or remote cluster (HTTP/HTTPS)

## 🔄 Next Steps

After installing:
1. Open Explorer → "Service Fabric Clusters"
2. Add your cluster endpoint
3. Explore the tree view
4. Try right-click context menus
5. Read [Configuration Guide](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension#%EF%B8%8F-configuration) for certificate setup

## 📅 Roadmap

- **v0.2.0 (March 2026)**: VS Code Marketplace publication, custom icon, enhanced screenshots
- **v0.3.0**: Search/filter clusters and nodes, virtual scrolling for large clusters
- **v0.4.0**: Azure integration (AAD auth, subscription discovery)
- **v1.0.0**: Production-ready with comprehensive testing and documentation

See [CHANGELOG.md](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension/blob/master/CHANGELOG.md) for detailed roadmap.

---

**Released**: February 5, 2026  
**Status**: Beta (Pre-release)  
**Package Size**: 498 KB  
**Marketplace**: Coming v0.2.0 (March 2026)

*Made with ❤️ for the Service Fabric community*
