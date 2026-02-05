# Service Fabric Diagnostic Extension

A powerful Visual Studio Code extension for managing and diagnosing Azure Service Fabric clusters. Monitor cluster health, manage applications and nodes, and perform operational tasks directly from VS Code.

[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🚀 Features

### Cluster Explorer
- **Visual tree view** of Service Fabric clusters
- **Real-time health monitoring** with color-coded status indicators
- **Hierarchical navigation**: Clusters → Nodes → Applications → Services → Partitions → Replicas
- **Certificate authentication** support for secure clusters
- **Multiple cluster management** with persistent configuration

### Interactive Management Panel
- **Application lifecycle**: Deploy, upgrade, and remove applications
- **Node operations**: Activate, deactivate, restart, and remove node state
- **Cluster operations**: Upgrade clusters, backup/restore configurations
- **Web-based UI** with rich HTML interface
- **Integrated in Explorer** sidebar for quick access

### Context Menu Actions
- **Right-click operations** on any tree item
- **Cluster actions**: Deploy application, manage cluster, refresh
- **Node actions**: Activate/deactivate, restart, remove state, manage
- **Export snapshots**: Save tree view state as JSON

### Performance Optimizations
- **Intelligent caching** with LRU eviction and TTL
- **Parallel health queries** for 5x faster loading
- **Debounced refresh** to avoid UI thrashing
- **Retry logic** with exponential backoff for resilience

### Developer Experience
- **TypeScript type safety** - 50+ interfaces, zero `any` types in public APIs
- **Clean architecture** - Service layer, dependency injection, testable design
- **Comprehensive error handling** with context-aware messages
- **Detailed logging** for troubleshooting

## 📸 Screenshots

### Cluster Explorer Tree View
```
📦 Service Fabric Clusters
├── 🟢 localhost:19080 (5 nodes)
│   ├── 🟢 _Node_0
│   │   ├── fabric:/System
│   │   └── fabric:/MyApp
│   ├── 🟢 _Node_1
│   └── ...
└── 🟡 prod-cluster:19080 (12 nodes)
```

### Management Panel
Interactive WebView for cluster operations with application deployment, node management, and cluster upgrades.

### Context Menus
Right-click any cluster or node for quick actions:
- **Clusters**: Deploy Application, Manage Cluster, Refresh, Export Snapshot
- **Nodes**: Activate/Deactivate, Restart, Remove State, Manage Node, Export Snapshot

## 📦 Installation

### From Source
1. Clone the repository:
   ```bash
   git clone https://github.com/jagilber/vscode-service-fabric-diagnostic-extension.git
   cd vscode-service-fabric-diagnostic-extension
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Compile TypeScript:
   ```bash
   npm run compile
   ```

4. Debug in VS Code:
   - Press `F5` to launch Extension Development Host
   - The extension will activate when you open the Service Fabric Explorer view

### Prerequisites
- **VS Code 1.74.0+**
- **Node.js 16+** for development
- **Service Fabric cluster** (local dev cluster or remote)

## ⚙️ Configuration

### Add a Cluster

1. **Open Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Run `Service Fabric: Add Cluster Endpoint`
3. Enter cluster details:
   - **Endpoint**: `http://localhost:19080` or `https://mycluster.westus.cloudapp.azure.com:19080`
   - **Cluster name**: Display name (e.g., "Local Dev Cluster")

### Secure Cluster Authentication

For HTTPS clusters with certificate authentication:

1. **Add cluster endpoint** as above
2. Extension will prompt for certificate thumbprint
3. Certificate must be installed in:
   - **Windows**: `Cert:\CurrentUser\My\` store
   - **Linux/Mac**: PEM file path

#### Certificate Setup - Detailed Guide

##### Windows (PowerShell)

**Import PFX certificate:**
```powershell
# Import to CurrentUser\My store
$certPath = "C:\path\to\certificate.pfx"
$certPassword = ConvertTo-SecureString -String "yourPassword" -Force -AsPlainText
Import-PfxCertificate -FilePath $certPath -CertStoreLocation Cert:\CurrentUser\My -Password $certPassword

# Get thumbprint for configuration
Get-ChildItem Cert:\CurrentUser\My | Where-Object {$_.Subject -like "*YourClusterName*"} | Select-Object Thumbprint, Subject
```

**Verify certificate installation:**
```powershell
# List all certificates in My store
Get-ChildItem Cert:\CurrentUser\My | Format-Table Subject, Thumbprint, NotAfter

# Test certificate with Service Fabric cluster
Test-ServiceFabricClusterConnection -ConnectionEndpoint "mycluster.region.cloudapp.azure.com:19080" -X509Credential -FindType FindByThumbprint -FindValue "YOUR_THUMBPRINT" -StoreLocation CurrentUser -StoreName My
```

##### Linux/macOS (OpenSSL)

**Convert PFX to PEM format:**
```bash
# Extract certificate and private key
openssl pkcs12 -in certificate.pfx -out certificate.pem -nodes

# Split into separate files (optional)
openssl pkcs12 -in certificate.pfx -nokeys -out cert.pem
openssl pkcs12 -in certificate.pfx -nocerts -nodes -out key.pem

# Verify certificate
openssl x509 -in cert.pem -text -noout
```

**Set appropriate permissions:**
```bash
chmod 600 certificate.pem
chmod 600 key.pem
```

**Get certificate thumbprint:**
```bash
# SHA1 thumbprint (Service Fabric format)
openssl x509 -in cert.pem -noout -fingerprint -sha1 | sed 's/://g' | cut -d'=' -f2
```

##### Azure Key Vault Integration

For production scenarios, retrieve certificates from Azure Key Vault:

```powershell
# Install Azure PowerShell module if needed
Install-Module -Name Az.KeyVault

# Connect to Azure
Connect-AzAccount

# Download certificate from Key Vault
$cert = Get-AzKeyVaultCertificate -VaultName "yourKeyVault" -Name "yourCertName"
$secret = Get-AzKeyVaultSecret -VaultName "yourKeyVault" -Name $cert.Name
$secretValueText = $secret.SecretValue | ConvertFrom-SecureString -AsPlainText
$pfxBytes = [Convert]::FromBase64String($secretValueText)
[IO.File]::WriteAllBytes("$env:TEMP\cert.pfx", $pfxBytes)

# Import to certificate store
Import-PfxCertificate -FilePath "$env:TEMP\cert.pfx" -CertStoreLocation Cert:\CurrentUser\My
```

#### Common Certificate Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Certificate not found" | Certificate not in CurrentUser\My store | Verify installation: `Get-ChildItem Cert:\CurrentUser\My` |
| "Access denied" | Private key permissions | Grant user read permissions on private key |
| "Thumbprint mismatch" | Wrong thumbprint or case sensitivity | Use uppercase, no colons or spaces |
| "Certificate expired" | Certificate past NotAfter date | Renew certificate, update cluster |
| "Untrusted certificate" | CA not in trusted roots | Install CA cert: `Import-Certificate -FilePath ca.cer -CertStoreLocation Cert:\CurrentUser\Root` |
| "PEM file not found" (Linux) | Incorrect file path | Use absolute paths: `$HOME/.ssh/cert.pem` |

#### Security Best Practices

- **Never commit certificates** to source control (excluded by `.gitignore`)
- **Rotate certificates** before expiration (Service Fabric supports dual certificates during rollover)
- **Use Azure Key Vault** for production certificate management
- **Limit certificate access** with appropriate file/store permissions
- **Monitor expiration dates** - certificates stored in VSCode SecretStorage, thumbprints in workspace settings
- **Use separate certificates** for dev/test/prod environments

The extension stores certificate thumbprints securely using VS Code's [SecretStorage API](https://code.visualstudio.com/api/references/vscode-api#SecretStorage), which:
- Encrypts secrets at rest using OS credential stores (Windows Credential Manager, macOS Keychain, Linux Secret Service)
- Scopes secrets to the extension and workspace
- Never logs secret values (only redacted references)

### Settings

Configure extension behavior in VS Code settings (`settings.json`):

```json
{
    "serviceFabric.clusters": [
        {
            "endpoint": "http://localhost:19080",
            "name": "Local Dev Cluster"
        },
        {
            "endpoint": "https://prod-cluster.westus.cloudapp.azure.com:19080",
            "name": "Production Cluster",
            "thumbprint": "ABC123..."
        }
    ],
    "serviceFabric.refreshInterval": 30000,
    "serviceFabric.enableCaching": true,
    "serviceFabric.logLevel": "info"
}
```

## 📖 Usage

### Basic Operations

#### View Cluster Health
1. Open **Explorer** sidebar
2. Find **Service Fabric Clusters** view
3. Expand cluster to see nodes and applications
4. Health status shown with color indicators:
   - 🟢 **Green**: OK
   - 🟡 **Yellow**: Warning
   - 🔴 **Red**: Error

#### Refresh Cluster
- Click **↻ Refresh** in view title bar
- Right-click cluster → **Refresh**
- Auto-refresh every 30 seconds (configurable)

#### Deploy Application
1. Right-click cluster → **Deploy Application**
2. Select application package folder
3. Enter application name and version
4. Review deployment in Management Panel

#### Manage Node
1. Right-click node → **Manage Node**
2. Select operation:
   - **Activate**: Bring node online
   - **Deactivate**: Gracefully shut down node
   - **Restart**: Restart node process
   - **Remove State**: Clean node state (destructive)

#### Export Snapshot
1. Right-click any tree item (cluster, node, application, etc.)
2. Select **Export Snapshot**
3. JSON file saved to:
   ```
   %APPDATA%\Code\User\globalStorage\jagilber.vscode-sf\
       <cluster-name>\snapshots\
           snapshot-<type>-<name>-<timestamp>.json
   ```
4. Choose **Open** or **Show in Folder**

**Snapshot Format:**
```json
{
    "label": "_Node_0",
    "itemType": "node",
    "itemId": "_Node_0",
    "healthState": "Ok",
    "tooltip": "Node: _Node_0 (Ok)",
    "children": [
        {
            "label": "fabric:/System",
            "itemType": "application",
            "children": [...],
            "_childCount": 5
        }
    ],
    "_childCount": 10
}
```

### Commands

Access via Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

| Command | Description |
|---------|-------------|
| `Service Fabric: Add Cluster Endpoint` | Add new cluster to explorer |
| `Service Fabric: Remove Cluster Endpoint` | Remove cluster from list |
| `Service Fabric: Connect to Cluster` | Open cluster management panel |
| `Service Fabric: Refresh` | Refresh cluster tree view |
| `Service Fabric: Export Snapshot` | Save tree item state to JSON |
| `Service Fabric: Setup Powershell` | Install Service Fabric PowerShell module |
| `Service Fabric: Deploy Application` | Deploy application package |
| `Service Fabric: Manage Cluster` | Open interactive management panel |
| `Service Fabric: Manage Node` | Node operations menu |

## 🏗️ Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                        VS Code UI                           │
├─────────────────────────────────────────────────────────────┤
│  Tree View          │  WebView Panel    │  Commands         │
│  (Explorer)         │  (Management)     │  (Palette)        │
└────────┬────────────┴──────────┬────────┴──────────┬────────┘
         │                       │                   │
         └───────────────────────┴───────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Extension Host        │
                    │   (extension.ts)        │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌────────▼────────┐   ┌─────────▼────────┐   ┌─────────▼─────────┐
│  Tree Provider  │   │  WebView Provider│   │  Service Layer    │
│  (View Logic)   │   │  (UI Logic)      │   │  (Business Logic) │
└────────┬────────┘   └─────────┬────────┘   └─────────┬─────────┘
         │                       │                       │
         └───────────────────────┴───────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Infrastructure        │
                    │  Cache / Retry / HTTP   │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Service Fabric API    │
                    │   (REST / PowerShell)   │
                    └─────────────────────────┘
```

### Key Components

- **`extension.ts`**: Entry point, command registration, activation
- **`serviceFabricClusterView.ts`**: Tree view data provider and tree item logic
- **`ManagementWebviewProvider.ts`**: Interactive management panel WebView
- **`SfClusterService.ts`**: Cluster operations orchestration
- **`SfHttpClient.ts`**: HTTP utilities for REST API calls
- **`SfRestClient.ts`**: Service Fabric REST API client
- **`CacheManager.ts`**: LRU cache with TTL for performance
- **`RetryPolicy.ts`**: Exponential backoff retry logic

### Data Flow

1. **User action** → Command or tree click
2. **Extension** → Delegates to service layer
3. **Service** → Calls Service Fabric API (REST/PowerShell)
4. **Cache** → Stores results for 30s (health data)
5. **Tree Provider** → Updates view with new data
6. **UI** → Renders updated tree

### Technology Stack

- **Language**: TypeScript (strict mode)
- **Framework**: VS Code Extension API
- **HTTP Client**: Native Node.js `https` module
- **Authentication**: X509 certificates, JWT tokens
- **Caching**: In-memory LRU cache
- **UI**: VS Code TreeView + WebView (HTML/CSS/JS)

## 🧪 Development

### Setup

```bash
# Clone repository
git clone https://github.com/jagilber/vscode-service-fabric-diagnostic-extension.git
cd vscode-service-fabric-diagnostic-extension

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode (auto-recompile)
npm run watch
```

### Debug

1. Open project in VS Code
2. Press `F5` to launch Extension Development Host
3. Set breakpoints in TypeScript files
4. Make changes → Press `Ctrl+R` in Extension Host to reload

### Build

```bash
# One-time compile
npm run compile

# Production build
npm run vscode:prepublish
```

### Project Structure

```
src/
├── extension.ts                          # Entry point
├── services/                             # Business logic
│   ├── SfClusterService.ts              # Cluster orchestration
│   ├── SfSdkInstaller.ts                # SDK management
│   └── SfHttpClient.ts                  # HTTP utilities
├── views/                                # UI components
│   ├── serviceFabricClusterView.ts      # Tree view
│   └── ManagementWebviewProvider.ts     # Management panel
├── infrastructure/                       # Cross-cutting
│   ├── CacheManager.ts                  # LRU cache
│   └── RetryPolicy.ts                   # Retry logic
├── interfaces/                           # Contracts
│   └── IHttpOptionsProvider.ts          # Dependency abstraction
├── models/                               # Data models
│   └── Errors.ts                        # Custom error types
├── utils/                                # Helpers
└── types.ts                             # TypeScript interfaces
```

## 🐛 Troubleshooting

### Extension Not Activating
**Symptom**: Service Fabric view not appearing in Explorer

**Solution**:
1. Check Output panel: View → Output → Select "Service Fabric"
2. Verify extension installed: Extensions view → Search "Service Fabric"
3. Reload window: `Ctrl+Shift+P` → "Reload Window"

### Connection Failed
**Symptom**: "Cannot connect to cluster" error

**Solution**:
1. Verify cluster endpoint is reachable:
   ```bash
   curl http://localhost:19080/$/GetClusterHealth
   ```
2. For HTTPS clusters, check certificate:
   - Windows: `certlm.msc` → Check `Cert:\CurrentUser\My\`
   - Verify thumbprint matches cluster certificate
3. Check firewall rules allow port 19080

### Context Menus Not Appearing
**Symptom**: Right-click on tree item shows no menu

**Solution**:
1. Update to latest version (fixed in commit 8f7c588)
2. Check `contextValue` is set in tree items
3. Reload window

### Cluster Removal Not Working
**Symptom**: Cluster still appears after removal

**Solution**:
1. Update to latest version (fixed in commit 2e85ec2)
2. Check settings manually: `Ctrl+,` → Search "serviceFabric.clusters"
3. Remove duplicate entries manually if needed

### Health Data Stale
**Symptom**: Tree shows outdated health status

**Solution**:
1. Click ↻ Refresh in view title
2. Wait for cache expiration (30s default)
3. Disable caching: Settings → `"serviceFabric.enableCaching": false`

### Snapshot Export Fails
**Symptom**: "Failed to save snapshot" error

**Solution**:
1. Check disk space available
2. Verify permissions on globalStorage folder:
   ```
   %APPDATA%\Code\User\globalStorage\jagilber.vscode-sf\
   ```
3. Check Output panel for detailed error

## 📚 Documentation

- **[Documentation Index](docs/)** - Complete documentation hub
- **[Architecture](docs/architecture/)** - System design and technical architecture
- **[User Guides](docs/guides/)** - Usage examples, commands, and best practices
- **[Project Documents](docs/project/)** - PRD, governance, and release processes
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and release notes
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Development guidelines
- **[SECURITY.md](SECURITY.md)** - Security policies and reporting

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code of conduct
- Development setup
- Coding guidelines
- Pull request process
- Testing guidelines

**Quick Start for Contributors**:
1. Fork repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Make changes with tests
4. Commit: `git commit -m "feat: add my feature"`
5. Push: `git push origin feature/my-feature`
6. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on [VS Code Extension API](https://code.visualstudio.com/api)
- Inspired by [Azure Service Fabric Explorer](https://github.com/microsoft/service-fabric-explorer)
- Based on Microsoft's [vscode-extension-samples](https://github.com/microsoft/vscode-extension-samples)

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension/discussions)
- **Email**: Contact project maintainer

## 🗺️ Roadmap

See [CHANGELOG.md](CHANGELOG.md) for upcoming features:
- v0.1.0: Testing & Documentation
- v0.2.0: Azure Integration
- v0.3.0: Advanced Features (search, virtual scrolling)
- v1.0.0: Production Ready

---

**Made with ❤️ for the Service Fabric community**
