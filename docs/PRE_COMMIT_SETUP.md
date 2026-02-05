# Pre-Commit Hook Setup

To ensure icon rendering protection tests run before every commit:

## Option 1: Manual Git Hook (Recommended)

Create `.git/hooks/pre-commit` with:

```bash
#!/bin/sh
# Icon rendering protection - prevents color bug regression
echo "Running icon protection tests..."
npm test -- icon-rendering-validation.test.ts --silent

if [ $? -ne 0 ]; then
    echo "❌ COMMIT BLOCKED: Icon protection tests failed!"
    echo "See docs/ICON_RENDERING_BUG.md for details"
    exit 1
fi

echo "✓ Icon protection tests passed"
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

## Option 2: PowerShell Pre-Commit Script

Run before committing:
```powershell
.\scripts\pre-commit-pii-check.ps1
```

This script now includes:
1. ✅ Icon rendering protection tests (CRITICAL)
2. ✅ PII/Secrets scanning
3. ✅ Pattern validation

## Visual Studio Code Integration

Add to `.vscode/tasks.json`:
```json
{
    "label": "Pre-Commit Checks",
    "type": "shell",
    "command": "pwsh",
    "args": [
        "-File",
        "${workspaceFolder}/scripts/pre-commit-pii-check.ps1"
    ],
    "problemMatcher": [],
    "group": {
        "kind": "test",
        "isDefault": false
    }
}
```

## CI/CD Integration

Add to your CI pipeline:
```yaml
- name: Icon Protection Tests
  run: npm test -- icon-rendering-validation.test.ts
  
- name: Fail if tests fail
  if: failure()
  run: |
    echo "Icon protection tests failed!"
    echo "See docs/ICON_RENDERING_BUG.md"
    exit 1
```

## What Gets Checked

**Icon Protection Tests (10 tests):**
- Background population doesn't refresh static items individually
- Only cluster-level refresh is used
- All static icons have ThemeIcon with ThemeColor
- No post-construction mutations of iconPath
- Proper TypeScript type handling
- Documentation presence

**PII/Secrets:**
- Certificates, private keys
- Passwords, connection strings
- Thumbprints, tokens
- Personal identifiable information

## Bypass (Emergency Only)

```bash
git commit --no-verify -m "Emergency fix"
```

⚠️ **WARNING:** Only use --no-verify for emergencies. The icon protection tests are CRITICAL to prevent regression of a subtle, hard-to-debug rendering bug.
