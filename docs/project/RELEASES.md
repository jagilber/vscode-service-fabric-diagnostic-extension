# Release Process Guide

This document outlines the complete process for creating and publishing releases of the Service Fabric Diagnostic Extension.

## Release Types

### Pre-Release (Alpha/Beta)
- **Purpose**: Testing, early feedback, CI/CD validation
- **Audience**: Contributors, testers, early adopters
- **Distribution**: GitHub Releases with VSIX artifacts
- **Versioning**: `0.x.x` (semantic versioning)
- **Frequency**: As needed for major features

### Production Release
- **Purpose**: Stable, production-ready features
- **Audience**: All users
- **Distribution**: VS Code Marketplace + GitHub Releases
- **Versioning**: `1.0.0+` (semantic versioning)
- **Frequency**: Planned milestones (see CHANGELOG.md)

## Current Status

**Version**: 1.0.0  
**Status**: Pre-release (not yet on Marketplace)  
**Distribution**: VSIX files via GitHub Releases and Actions artifacts
**Marketplace Target**: v0.2.0 (March 2026)

## Release Workflow

### 1. Pre-Release Checklist

Before creating any release:

- [ ] All tests passing (`npm test`)
- [ ] Security scan passing (GitHub Actions workflow)
- [ ] No known critical bugs
- [ ] CHANGELOG.md updated with version details
- [ ] README.md reflects accurate feature set
- [ ] Version number updated in `package.json`
- [ ] Git tag matches package version

### 2. Version Numbering

Follow [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH

MAJOR: Breaking changes (1.0.0 → 2.0.0)
MINOR: New features, backwards compatible (1.0.0 → 1.1.0)
PATCH: Bug fixes, backwards compatible (1.0.0 → 1.0.1)
```

**Pre-release identifiers** (optional):
```
1.0.0-alpha.1   # Early development
1.0.0-beta.2    # Feature complete, testing
1.0.0-rc.1      # Release candidate, final testing
```

### 3. Build VSIX Package

**Automated (GitHub Actions)**:
- VSIX artifact automatically built on every push
- Download from Actions → Security Scanning workflow → Artifacts
- File: `vscode-extension/vscode-service-fabric-diagnostic-extension-X.X.X.vsix`

**Manual Build**:
```bash
# Ensure clean state
git status  # Should be clean
npm ci      # Clean install dependencies

# Compile and package
npm run compile
npm run package

# Output: vscode-service-fabric-diagnostic-extension-1.0.0.vsix
```

**Verify Package**:
```bash
# List contents
unzip -l vscode-service-fabric-diagnostic-extension-1.0.0.vsix

# Test installation
code --install-extension vscode-service-fabric-diagnostic-extension-1.0.0.vsix

# Verify in VS Code
code --list-extensions | grep service-fabric
```

### 4. Create GitHub Release

**Using GitHub CLI**:
```bash
# Set version
VERSION="1.0.0"

# Create release with VSIX
gh release create "v${VERSION}" \
  --title "v${VERSION} - Release Title" \
  --notes "$(cat CHANGELOG.md | sed -n '/## \[${VERSION}\]/,/## \[/p' | sed '$d')" \
  ./vscode-service-fabric-diagnostic-extension-${VERSION}.vsix

# For pre-release
gh release create "v${VERSION}-beta.1" \
  --title "v${VERSION}-beta.1 - Beta Release" \
  --notes "Beta release for testing" \
  --prerelease \
  ./vscode-service-fabric-diagnostic-extension-${VERSION}.vsix
```

**Using GitHub Web UI**:
1. Go to repository → **Releases** → **Draft a new release**
2. **Tag version**: `v1.0.0` (create new tag)
3. **Release title**: `v1.0.0 - Feature Name`
4. **Description**: Copy from CHANGELOG.md for this version
5. **Attach files**: Upload `.vsix` file
6. **Pre-release**: Check if beta/alpha
7. Click **Publish release**

### 5. Release Notes Template

```markdown
## What's New in v1.0.0

### ✨ New Features
- Feature 1: Description
- Feature 2: Description

### 🐛 Bug Fixes
- Fixed issue where...
- Resolved problem with...

### 📚 Documentation
- Updated installation guide with VSIX instructions
- Added certificate setup troubleshooting

### 🔧 Improvements
- Performance optimization for...
- Better error messages for...

## Installation

### From VSIX (Recommended)
1. Download `vscode-service-fabric-diagnostic-extension-1.0.0.vsix` below
2. Open VS Code → Extensions → `...` → **Install from VSIX**
3. Select downloaded file
4. Reload VS Code

### From Source
See [README.md](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension#-installation) for developer installation.

## Upgrade Notes

**From 0.x.x → 1.0.0:**
- No breaking changes
- Certificate configuration migrated automatically
- Settings schema unchanged

## Known Issues
- Issue #1: Description and workaround
- Issue #2: Description and workaround

See [full documentation](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension/tree/main/docs) for detailed usage.

---

**Full Changelog**: https://github.com/jagilber/vscode-service-fabric-diagnostic-extension/blob/main/CHANGELOG.md
```

## Marketplace Publication (v0.2.0 Target)

**Target Release**: v0.2.0 (March 2026)  
**Rationale**: Accelerate adoption for Service Fabric admins/operators who need quick installation without development tools.

When ready to publish to VS Code Marketplace:

### Prerequisites
1. **Publisher account**: Create at [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage)
2. **Personal Access Token**: Generate from Azure DevOps with Marketplace scope
3. **Repository ready**: Public repository, license, README, icon

### Update package.json
```json
{
  "name": "vscode-service-fabric-diagnostic-extension",
  "displayName": "Service Fabric Diagnostic Extension",
  "version": "1.0.0",
  "publisher": "jagilber",  // Your publisher ID
  "private": false,          // Enable Marketplace publication
  "icon": "resources/icon.png",
  "galleryBanner": {
    "color": "#0078D4",
    "theme": "dark"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/jagilber/vscode-service-fabric-diagnostic-extension"
  },
  "bugs": {
    "url": "https://github.com/jagilber/vscode-service-fabric-diagnostic-extension/issues"
  }
}
```

### Publish Command
```bash
# Login (one-time)
vsce login jagilber

# Publish
vsce publish

# Or publish specific version
vsce publish 1.0.0

# Publish pre-release
vsce publish --pre-release
```

### Automated Publishing (GitHub Actions)

Add to `.github/workflows/publish.yml`:
```yaml
name: Publish Extension

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          
      - name: Install dependencies
        run: npm ci
        
      - name: Compile
        run: npm run compile
        
      - name: Publish to Marketplace
        run: npx vsce publish -p ${{ secrets.VSCE_TOKEN }}
```

**Setup Secret**:
1. GitHub repo → Settings → Secrets → Actions
2. Add `VSCE_TOKEN` with your Personal Access Token

## Distribution Channels

### Current (v1.0.0)
- ✅ **GitHub Releases**: VSIX files attached to releases
- ✅ **GitHub Actions**: Artifacts from CI/CD builds
- ❌ **VS Code Marketplace**: Not yet published

### v0.2.0 (March 2026 Target)
- ✅ **GitHub Releases**: Continue providing VSIX
- ✅ **GitHub Actions**: Continue CI/CD artifacts
- ✅ **VS Code Marketplace**: Primary distribution channel (NEW)
  - One-click installation from Marketplace
  - Automatic updates
  - Increased discoverability

### Post-Marketplace (v0.2.0+)
- ✅ **VS Code Marketplace**: Primary channel for all users
- ✅ **GitHub Releases**: Continue for advanced users/CI scenarios
- ✅ **GitHub Actions**: Development artifacts

## Version History

| Version | Date | Type | Distribution |
|---------|------|------|--------------|
| 1.0.0 | TBD | Release | GitHub VSIX |
| 0.9.0 | 2026-02-05 | Beta | GitHub VSIX |
| 0.8.0 | 2026-01-15 | Alpha | Actions Artifacts |
| 0.7.0 | 2026-01-01 | Alpha | Actions Artifacts |

## Support & Feedback

### For Pre-Release (Current)
- **Bug reports**: [GitHub Issues](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension/issues)
- **Feature requests**: [GitHub Discussions](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension/discussions)
- **Questions**: GitHub Discussions Q&A

### For Marketplace (Future)
- **Ratings**: VS Code Marketplace (5-star rating)
- **Reviews**: VS Code Marketplace comments
- **Q&A**: Marketplace Q&A tab
- **Issues**: Continue using GitHub Issues

## Rollback Procedure

If a release has critical issues:

### GitHub Release
1. **Mark as pre-release**: Edit release → Check "Pre-release"
2. **Add warning**: Edit description with known issues
3. **Create hotfix**: Increment PATCH version
4. **Publish fixed version**: New release with fix

### Marketplace (Future)
1. **Cannot unpublish**: Marketplace doesn't support unpublishing
2. **Publish hotfix immediately**: Increment PATCH, fix, publish
3. **Update description**: Add notice in Marketplace description
4. **Communicate**: Post in GitHub Discussions

## Checklist: First Marketplace Publication

Before publishing v0.2.0 to Marketplace:

- [ ] Security scan passing for 2+ weeks
- [ ] All documentation complete and accurate
- [ ] Extension tested on Windows, Linux, macOS
- [ ] Extension tested with VS Code 1.108.0+
- [ ] No known critical or high-severity bugs
- [ ] Certificate authentication verified with production clusters
- [ ] Performance benchmarks meet targets
- [ ] Icon and gallery banner designed (128x128 PNG)
- [ ] Screenshots prepared for Marketplace page
- [ ] CHANGELOG.md fully updated
- [ ] README.md review and polish
- [ ] Contributing guidelines clear
- [ ] License file present (MIT)
- [ ] Publisher account created and verified
- [ ] Personal Access Token generated
- [ ] `.vscodeignore` optimized for package size
- [ ] package.json `private: false`
- [ ] Version number updated to `1.0.0`
- [ ] Git tag `v1.0.0` created
- [ ] GitHub Release created with VSIX
- [ ] Community feedback gathered from pre-release
- [ ] Announcement prepared (blog, social media)

## References

- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Extension Manifest](https://code.visualstudio.com/api/references/extension-manifest)
- [Marketplace Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- [Semantic Versioning](https://semver.org/)
- [GitHub CLI Releases](https://cli.github.com/manual/gh_release)

---

**Last Updated**: 2026-02-05  
**Status**: Active - Pre-release distribution via GitHub only
