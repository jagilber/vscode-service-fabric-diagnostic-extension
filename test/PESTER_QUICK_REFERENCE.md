# 🎯 Pester Test Quick Reference

## Quick Commands

```powershell
# Run all tests
.\Invoke-PowerShellCommandTests.ps1

# Run specific test type
.\Invoke-PowerShellCommandTests.ps1 -TestType Syntax
.\Invoke-PowerShellCommandTests.ps1 -TestType PII
.\Invoke-PowerShellCommandTests.ps1 -TestType Coverage
.\Invoke-PowerShellCommandTests.ps1 -TestType BestPractices

# Generate XML report
.\Invoke-PowerShellCommandTests.ps1 -OutputFormat NUnitXml
.\Invoke-PowerShellCommandTests.ps1 -OutputFormat JUnitXml

# Run with code coverage
.\Invoke-PowerShellCommandTests.ps1 -CodeCoverage

# Run specific test file
Invoke-Pester .\PowerShellCommands.Tests.ps1
Invoke-Pester .\PowerShellCommands.Integration.Tests.ps1
```

## Direct Pester Commands

```powershell
# Run all .Tests.ps1 files
Invoke-Pester

# Run with detailed output
Invoke-Pester -Output Detailed

# Run specific describe block
Invoke-Pester -TagFilter 'Syntax'
Invoke-Pester -TagFilter 'PII'
Invoke-Pester -TagFilter 'Integration'

# Run and show only failed tests
Invoke-Pester -Output Minimal

# Run with passthru (get results object)
$results = Invoke-Pester -PassThru
$results.FailedCount
$results.PassedCount
```

## Test Discovery

```powershell
# List all tests
$config = New-PesterConfiguration
$config.Run.Path = '.'
$config.Discovery.Show = $true
Invoke-Pester -Configuration $config

# Show test structure
Get-ChildItem -Recurse -Filter *.Tests.ps1 | ForEach-Object {
    Write-Host $_.Name -ForegroundColor Cyan
    $content = Get-Content $_.FullName -Raw
    [regex]::Matches($content, "Describe\s+['""]([^'""]+)['""]") | 
        ForEach-Object { Write-Host "  - $($_.Groups[1].Value)" }
}
```

## Common Scenarios

### 1. Before Committing Code

```powershell
# Quick validation
.\Invoke-PowerShellCommandTests.ps1 -TestType Syntax
.\Invoke-PowerShellCommandTests.ps1 -TestType PII
```

### 2. Full Test Suite (CI Simulation)

```powershell
# Run all tests with XML output
.\Invoke-PowerShellCommandTests.ps1 -OutputFormat JUnitXml
```

### 3. Debugging Failed Tests

```powershell
# Run specific test with detailed output
Invoke-Pester .\PowerShellCommands.Tests.ps1 -Output Detailed

# Run single test by name
Invoke-Pester -FullNameFilter "*Should generate valid PowerShell syntax*"
```

### 4. Check Command Coverage

```powershell
# Run coverage tests
.\Invoke-PowerShellCommandTests.ps1 -TestType Coverage
```

## Test Results Location

```
test-results/
├── TestResults-{timestamp}.xml       # Machine-readable results
└── TestSummary-{timestamp}.txt       # Human-readable summary
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All tests passed |
| 1 | One or more tests failed |

## Continuous Testing (Watch Mode)

```powershell
# Watch for file changes and re-run tests
while ($true) {
    Clear-Host
    .\Invoke-PowerShellCommandTests.ps1 -TestType Syntax
    Start-Sleep -Seconds 5
}
```

## Integration with VS Code

Add to `.vscode/tasks.json`:

```json
{
    "label": "Run Pester Tests",
    "type": "shell",
    "command": "pwsh",
    "args": [
        "-File",
        "${workspaceFolder}/test/Invoke-PowerShellCommandTests.ps1"
    ],
    "problemMatcher": [],
    "group": {
        "kind": "test",
        "isDefault": true
    }
}
```

Then: **Terminal → Run Task → Run Pester Tests**

## Keyboard Shortcuts

Add to `.vscode/keybindings.json`:

```json
{
    "key": "ctrl+shift+t",
    "command": "workbench.action.tasks.runTask",
    "args": "Run Pester Tests"
}
```

## Test Statistics

```powershell
# Get test count
$tests = Invoke-Pester -PassThru
Write-Host "Total Tests: $($tests.TotalCount)"
Write-Host "Contexts: $($tests.Containers.Count)"
Write-Host "Duration: $($tests.Duration.TotalSeconds)s"
```

## Pre-commit Hook

Save as `.git/hooks/pre-commit`:

```bash
#!/bin/sh
pwsh -File test/Invoke-PowerShellCommandTests.ps1 -TestType Syntax -TestType PII
if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Commit aborted."
    exit 1
fi
```

Make executable:
```powershell
chmod +x .git/hooks/pre-commit
```
