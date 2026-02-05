# Security & Release Readiness Issues

## PRIORITY 1: Fix Version Mismatch

**Issue:** Git tag is v1.0.0 but package.json shows 0.0.1

**Fix:**
```json
// package.json line 5
"version": "1.0.0",
"repository": {
  "type": "git",
  "url": "https://github.com/jagilber/vscode-service-fabric-diagnostic-extension"
},
```

## PRIORITY 2: Add Extension Packaging

### Install vsce
```bash
npm install -D @vscode/vsce
```

### Add package script (package.json)
```json
"scripts": {
  "vscode:prepublish": "npm run compile",
  "compile": "tsc -p ./",
  "package": "vsce package",
  "publish": "vsce publish"
}
```

### Create .vscodeignore
```ignore
.vscode/**
.vscode-test/**
out/test/**
src/**
test/**
.git*
.instructions/**
.mcp/**
tsconfig.json
*.md
!README.md
!CHANGELOG.md
scripts/**
coverage/**
test-results/**
node_modules/**/@types
*.vsix
```

### Add extension icon
Download or create 128x128 PNG icon, add to package.json:
```json
"icon": "resources/icon.png"
```

## PRIORITY 3: Enhance Certificate Documentation

### Add to README.md after line 110:

````markdown
#### 🔐 Certificate Setup - Detailed Guide

**Windows:**
1. Install certificate to Personal store:
   ```powershell
   # Import PFX
   $pwd = Read-Host -AsSecureString "Enter PFX password"
   Import-PfxCertificate -FilePath ".\client-cert.pfx" -CertStoreLocation "Cert:\CurrentUser\My" -Password $pwd
   
   # Get thumbprint
   Get-ChildItem Cert:\CurrentUser\My | Where-Object {$_.Subject -like "*YourClusterName*"} | Select-Object Thumbprint, Subject
   ```

2. Copy the thumbprint (40-character hex string)
3. Extension will prompt for thumbprint when adding HTTPS cluster

**Linux/macOS:**
1. Convert PFX to PEM format:
   ```bash
   openssl pkcs12 -in client-cert.pfx -out client-cert.pem -nodes
   ```

2. Store PEM file in secure location (e.g., `~/.ssh/sf-certs/`)
3. Extension will prompt for PEM file path

**Troubleshooting:**
- **"Certificate not found"**: Verify thumbprint with `Get-ChildItem Cert:\CurrentUser\My` (Windows)
- **"Connection refused"**: Check firewall rules for port 19080/19000
- **"Unauthorized"**: Ensure certificate has cluster access permissions
- **"Expired certificate"**: Check expiration with `(Get-Item Cert:\CurrentUser\My\<thumbprint>).NotAfter`
````

## PRIORITY 4: Add Security GitHub Actions

### Create .github/workflows/security-scan.yml
```yaml
name: Security Scanning

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    # Run weekly on Mondays at 00:00 UTC
    - cron: '0 0 * * 1'

jobs:
  codeql-analyze:
    name: CodeQL Analysis
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: typescript, javascript
      
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
  
  dependency-scan:
    name: Dependency Vulnerability Scan
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run npm audit
        run: npm audit --audit-level=moderate
      
      - name: Check for outdated packages
        run: npm outdated || true
  
  secret-scan:
    name: Secret Scanning Validation
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run PII detection tests
        shell: pwsh
        run: |
          Install-Module -Name Pester -MinimumVersion 5.3.0 -Force -SkipPublisherCheck
          cd test
          .\Invoke-PowerShellCommandTests.ps1 -TestType PII
      
      - name: Scan for hardcoded secrets
        run: |
          # Check for common secret patterns
          ! grep -r --include="*.ts" --include="*.js" "password\\s*=" . || exit 1
          ! grep -r --include="*.ts" --include="*.js" "api[_-]?key\\s*=" . || exit 1
          ! grep -r --include="*.ts" --include="*.json" "[0-9a-f]{40}" . | grep -v "1234567890ABCDEF" || true
  
  certificate-security-audit:
    name: Certificate Handling Audit
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Verify SecretStorage usage
        run: |
          # Ensure sensitive cert data uses SecretStorage
          if grep -r "context.globalState" src/ | grep -i "cert\|thumbprint\|pfx"; then
            echo "❌ ERROR: Found certificate data in globalState (should use SecretStorage)"
            exit 1
          fi
          echo "✅ Certificate storage validated"
      
      - name: Check for cert logging
        run: |
          # Ensure no full certificates in logs
          if grep -r "console.log.*cert" src/ | grep -v "obfuscate\|length\|type"; then
            echo "⚠️  WARNING: Potential certificate logging found"
          fi
          echo "✅ Certificate logging reviewed"
```

## PRIORITY 5: Fix Certificate Security Issues

### 1. Remove secret length logging (sfExtSecrets.ts)
```typescript
public async getSecret(secretName: sfExtSecretList): Promise<string | undefined> {
    SfUtility.outputLog('sfExtSecrets:getSecret:', secretName, debugLevel.verbose);
    const secret = await this.secrets.get(secretName);
    if(secret === undefined){
        SfUtility.outputLog('sfExtSecrets:getSecret:secretName not found:', secretName, debugLevel.warn);
    }
    // ❌ REMOVE: SfUtility.outputLog(`sfExtSecrets:getSecret:secret length:${secret?.length}`);
    // ✅ ADD: SfUtility.outputLog('sfExtSecrets:getSecret:success', debugLevel.verbose);
    return secret;
}
```

### 2. Add certificate validation (new file: src/utils/CertificateValidator.ts)
```typescript
import * as crypto from 'crypto';

export class CertificateValidator {
    /**
     * Validate certificate before storing
     * @param certContent PEM or PFX certificate content
     * @returns Validation result with expiration date
     */
    static validate(certContent: string | Buffer): { valid: boolean; expiresAt?: Date; cn?: string; error?: string } {
        try {
            // Parse X509 certificate
            const cert = new crypto.X509Certificate(certContent);
            
            // Check expiration
            const now = new Date();
            const expiry = new Date(cert.validTo);
            
            if (expiry < now) {
                return { valid: false, error: 'Certificate expired' };
            }
            
            // Warn if expiring soon (30 days)
            const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
            if (expiry < thirtyDaysFromNow) {
                return { 
                    valid: true, 
                    expiresAt: expiry, 
                    cn: cert.subject,
                    error: `Certificate expires soon: ${expiry.toLocaleDateString()}`
                };
            }
            
            return { valid: true, expiresAt: expiry, cn: cert.subject };
            
        } catch (error) {
            return { valid: false, error: `Invalid certificate: ${error}` };
        }
    }
    
    /**
     * Validate thumbprint format
     */
    static validateThumbprint(thumbprint: string): boolean {
        return /^[0-9A-Fa-f]{40}$/.test(thumbprint);
    }
}
```

### 3. Add "Forget Cluster" command (extension.ts)
```typescript
// Register command to remove cluster including secrets
context.subscriptions.push(
    vscode.commands.registerCommand('sfClusterExplorer.forgetCluster', async (item: TreeItem) => {
        const confirm = await vscode.window.showWarningMessage(
            `Remove cluster "${item.label}" and delete stored credentials?`,
            { modal: true },
            'Remove'
        );
        
        if (confirm === 'Remove') {
            // Remove from settings
            await sfExtSettings.removeCluster(item.clusterEndpoint);
            
            // Delete stored certificate/credentials
            await sfExtSecrets.deleteSecret(`cert-${item.clusterEndpoint}`);
            
            // Refresh tree
            serviceFabricTreeView.refresh();
            
            vscode.window.showInformationMessage(`Cluster "${item.label}" removed`);
        }
    })
);
```

## PRIORITY 6: Add Extension Marketplace Metadata

### Update package.json (lines 1-20):
```json
{
  "name": "vscode-service-fabric-diagnostic-extension",
  "displayName": "Service Fabric Cluster Manager",
  "description": "Manage Azure Service Fabric clusters: monitor health, deploy apps, and perform diagnostics directly from VS Code",
  "version": "1.0.0",
  "publisher": "jagilber",
  "author": {
    "name": "Jason Gilbertson",
    "email": "jagilber@users.noreply.github.com"
  },
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/jagilber/vscode-service-fabric-diagnostic-extension"
  },
  "bugs": {
    "url": "https://github.com/jagilber/vscode-service-fabric-diagnostic-extension/issues"
  },
  "homepage": "https://github.com/jagilber/vscode-service-fabric-diagnostic-extension#readme",
  "keywords": [
    "service-fabric",
    "azure",
    "cluster",
    "diagnostics",
    "monitoring",
    "microservices"
  ],
  "categories": [
    "Azure",
    "Other"
  ],
  "icon": "resources/icon.png",
  "galleryBanner": {
    "color": "#0078D4",
    "theme": "light"
  },
  "engines": {
    "vscode": "^1.74.0"
  }
}
```

## Testing Checklist

- [ ] Update package.json version to 1.0.0
- [ ] Install vsce: `npm install -D @vscode/vsce`
- [ ] Create .vscodeignore
- [ ] Test package: `npm run package` (creates .vsix)
- [ ] Test install: `code --install-extension vscode-service-fabric-diagnostic-extension-1.0.0.vsix`
- [ ] Add GitHub Actions security workflows
- [ ] Fix certificate logging in sfExtSecrets.ts
- [ ] Add certificate validation utility
- [ ] Add "Forget Cluster" command
- [ ] Test certificate expiration warnings
- [ ] Run full test suite: `npm test`
- [ ] Run security scans locally before committing

## VSCode Best Practices Compliance

### ✅ Currently Following:
- SecretStorage API for sensitive data
- Proper extension activation events
- Tree view with context menus
- Command palette integration
- Output channel for logging

### ❌ Need to Implement:
- Certificate expiration warnings
- InputBox validation for thumbprints
- Error messages with actionable guidance
- Configuration contribution point for settings
- Telemetry opt-out (if adding telemetry)
