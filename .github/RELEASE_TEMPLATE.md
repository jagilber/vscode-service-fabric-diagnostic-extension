<!-- 
This template is for creating GitHub Releases.
Replace {VERSION} placeholders with actual version number.
Copy relevant sections from CHANGELOG.md for the version being released.
-->

# Service Fabric Diagnostic Extension v{VERSION}

<!-- Brief overview of this release -->
This release includes [major features/bug fixes/improvements].

## 🎉 What's New

### ✨ New Features
<!-- List new features from CHANGELOG.md -->
- **Feature Name**: Description of what it does and why it's useful
- **Another Feature**: Brief description

### 🐛 Bug Fixes
<!-- List bug fixes -->
- Fixed issue where [describe problem] ([#123](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension/issues/123))
- Resolved problem with [description]

### 🚀 Improvements
<!-- List enhancements to existing features -->
- **Performance**: Improved [operation] by [amount/description]
- **UX**: Better error messages for [scenario]
- **Documentation**: Updated [document] with [additions]

### 🔧 Technical Changes
<!-- List internal improvements, refactoring, dependency updates -->
- Upgraded dependencies (Node 18→20, CodeQL v3→v4)
- Refactored [component] for better maintainability
- Added [infrastructure improvement]

## 📦 Installation

### Method 1: Install from VSIX (Recommended)

1. **Download** the VSIX file below:
   - `vscode-service-fabric-diagnostic-extension-{VERSION}.vsix` (attached to this release)

2. **Install in VS Code**:
   ```bash
   code --install-extension vscode-service-fabric-diagnostic-extension-{VERSION}.vsix
   ```
   
   Or via VS Code UI:
   - Open Extensions view (`Ctrl+Shift+X`)
   - Click `...` menu → **Install from VSIX...**
   - Select the downloaded file

3. **Verify installation**:
   - Reload VS Code
   - Open Explorer sidebar
   - Look for **Service Fabric Clusters** view

### Method 2: Build from Source

```bash
git clone https://github.com/jagilber/vscode-service-fabric-diagnostic-extension.git
cd vscode-service-fabric-diagnostic-extension
git checkout v{VERSION}
npm install
npm run compile
```

Press `F5` in VS Code to launch Extension Development Host.

## 📚 Documentation

- **[README.md](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension#readme)** - Complete user guide
- **[Installation Guide](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension#-installation)** - All installation methods
- **[Configuration Guide](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension#%EF%B8%8F-configuration)** - Cluster setup and certificates
- **[Architecture](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension/tree/main/docs/architecture)** - Technical design
- **[Contributing](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension/blob/main/CONTRIBUTING.md)** - Development guidelines

## ⬆️ Upgrade Notes

### From v{PREVIOUS_VERSION}

<!-- Include any breaking changes, migration steps, or considerations -->

**Breaking Changes:**
- None / List any breaking changes

**Automatic Migrations:**
- Settings schema unchanged - no action required
- Certificate storage migrated automatically

**Manual Steps:**
- If you encounter [issue], [do this]

**Compatibility:**
- **VS Code**: 1.108.0 or higher required
- **Node.js**: Not required for VSIX installation (20+ for development)
- **Service Fabric**: Compatible with all SF versions

## ⚠️ Known Issues

<!-- List any known limitations or bugs -->

| Issue | Workaround | Tracking |
|-------|------------|----------|
| Description of issue | How to work around it | [#123](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension/issues/123) |

See [all open issues](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension/issues) for complete list.

## 🔐 Security

This release includes the following security improvements:
- Security scan workflow now passing all checks
- Certificate handling follows best practices (VS Code SecretStorage API)
- No secrets stored in plaintext

**Verified by**:
- ✅ CodeQL Analysis (JavaScript/TypeScript)
- ✅ TruffleHog Secret Scanning
- ✅ NPM Security Audit
- ✅ License Compliance Check
- ✅ Certificate Security Audit

See [SECURITY.md](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension/blob/master/SECURITY.md) for security policies.

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension/blob/main/CONTRIBUTING.md) for:
- Development setup
- Code style guidelines
- Testing requirements
- Pull request process

**Quick start for contributors:**
```bash
git clone https://github.com/jagilber/vscode-service-fabric-diagnostic-extension.git
cd vscode-service-fabric-diagnostic-extension
npm install
npm run compile
# Press F5 in VS Code to debug
```

## 📝 Full Changelog

See [CHANGELOG.md](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension/blob/main/CHANGELOG.md) for complete version history.

**Commits in this release**: https://github.com/jagilber/vscode-service-fabric-diagnostic-extension/compare/v{PREVIOUS_VERSION}...v{VERSION}

## 🙏 Acknowledgments

<!-- Thank contributors, testers, or mention inspiration -->
Thanks to all contributors and testers who made this release possible:
- @username for [contribution]
- Community feedback on [feature]

Special thanks to early adopters who tested pre-release versions!

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension/discussions)
See [CHANGELOG.md](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension/blob/main/CHANGELOG.md) for detailed roadmap.

---

**Released**: {DATE}  
**VS Code Engine**: 1.108.0+  
**Status**: <!-- Pre-release / Stable / Beta -->  
**Distribution**: GitHub VSIX (Marketplace publication planned for v1.0.0)

*Made with ❤️ for the Service Fabric community*
