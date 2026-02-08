#Requires -Version 7.0

<#
.SYNOPSIS
    Quick PII validation for git pre-commit hook
    
.DESCRIPTION
    Validates staged files for PII patterns without running full test suite.
    Designed to be fast (<5 seconds) for pre-commit validation.
    
.EXAMPLE
    pwsh -File test/Pre-Commit-PII-Check.ps1
#>

[CmdletBinding()]
param(
    [Parameter()]
    [switch]$ShowDetails
)

$ErrorActionPreference = 'Stop'

Write-Host "🔍 Pre-Commit PII Validation" -ForegroundColor Cyan
Write-Host ""

# Get staged files
$stagedFiles = git diff --cached --name-only --diff-filter=ACM 2>$null
if (-not $stagedFiles) {
    Write-Host "ℹ️  No staged files to check" -ForegroundColor Gray
    exit 0
}

$filesToCheck = $stagedFiles | Where-Object { 
    $_ -match '\.(ts|js|md|json|ps1)$' -and 
    $_ -notmatch '(node_modules|out|coverage|\.vscode)/'
}

if (-not $filesToCheck) {
    Write-Host "ℹ️  No relevant files to check for PII" -ForegroundColor Gray
    exit 0
}

Write-Host "Checking $($filesToCheck.Count) staged file(s)..." -ForegroundColor Yellow

# PII patterns to detect
$piiPatterns = @{
    'Real Certificate Thumbprint' = @{
        Pattern = '(?<!1234567890ABCDEF1234567890ABCDEF12345678)(?<!ABCDEF1234567890ABCDEF1234567890ABCDEF12)(?<!example|test|dummy)[0-9A-F]{40}(?!.*example)'
        Severity = 'High'
        AllowedFiles = @('*.test.ts', 'test/**', '*.Tests.ps1', 'SECURITY.md', '.env.example')
    }
    
    'Real Storage Account Key' = @{
        Pattern = 'AccountKey=[A-Za-z0-9+/]{86}==(?!\.\.\.)'
        Severity = 'High'
        AllowedFiles = @('*.test.ts', 'test/**')
    }
    
    'Email Address' = @{
        Pattern = '\b[A-Za-z0-9._%+-]+@(?!microsoft\.com|contoso\.com|example\.com)[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        Severity = 'Medium'
        AllowedFiles = @('README.md', 'CONTRIBUTING.md', 'package.json')
    }
    
    'Real Subscription ID' = @{
        Pattern = '[0-9a-f]{8}-[0-9a-f]{4}-[45][0-9a-f]{3}-[89ab][0-9a-f]{3}-(?!456789012345|789012345678|726a6a23|53af455a)[0-9a-f]{12}'
        Severity = 'High'
        AllowedFiles = @('*.test.ts', 'test/**', '.env.example')
    }
    
    'Real Azure Endpoint' = @{
        Pattern = '(?<!my|example|test|demo)\w+\.(centralus|eastus|westus|northeurope)\.cloudapp\.azure\.com(?!//(mycluster|example))'
        Severity = 'Medium'
        AllowedFiles = @('README.md', 'SECURITY.md', 'test/**', '.env.example', '.instructions/**', 'scripts/**')
    }
    
    'Inconsistent Cluster Name' = @{
        Pattern = '(?<!my)cluster\.(?!eastus\.cloudapp\.azure\.com|example)'
        Severity = 'Low'
        AllowedFiles = @('test/**', '*.test.ts', 'README.md', 'CHANGELOG.md', '*.TEMPLATE.md')
    }
    
    'Inconsistent Node Name' = @{
        Pattern = 'Node_(?!0|1|2|3|4\b)[0-9]+'
        Severity = 'Low'
        AllowedFiles = @('test/**')
    }
}

$violations = @()

foreach ($file in $filesToCheck) {
    if (-not (Test-Path $file)) { continue }
    
    $content = git show ":$file" 2>$null
    if (-not $content) { continue }
    
    if ($ShowDetails) {
        Write-Host "  Checking: $file" -ForegroundColor Gray
    }
    
    foreach ($checkName in $piiPatterns.Keys) {
        $check = $piiPatterns[$checkName]
        
        # Check if file is in allowed list
        $isAllowed = $false
        foreach ($allowedPattern in $check.AllowedFiles) {
            if ($file -like $allowedPattern) {
                $isAllowed = $true
                break
            }
        }
        
        if ($isAllowed) { continue }
        
        # Check for pattern matches
        if ($content -match $check.Pattern) {
            $matches = [regex]::Matches($content, $check.Pattern)
            foreach ($match in $matches) {
                $matchText = $match.Value
                $displayMatch = if ($matchText.Length -gt 50) {
                    $matchText.Substring(0, 50)
                } else {
                    $matchText
                }
                
                # Calculate line number safely
                $lineNumber = 1
                try {
                    if ($match.Index -le $content.Length) {
                        $lineNumber = ($content.Substring(0, $match.Index) -split "`n").Count
                    }
                } catch {
                    # If calculation fails, use line 1
                    $lineNumber = 1
                }
                
                $violations += [PSCustomObject]@{
                    File = $file
                    Check = $checkName
                    Severity = $check.Severity
                    Match = $displayMatch
                    Line = $lineNumber
                }
            }
        }
    }
}

# Report results
Write-Host ""

if ($violations.Count -eq 0) {
    Write-Host "✅ No PII detected in staged files" -ForegroundColor Green
    Write-Host ""
    Write-Host "Files checked: $($filesToCheck.Count)"
    Write-Host "Patterns validated: $($piiPatterns.Count)"
    exit 0
}

# Group by severity
$high = $violations | Where-Object Severity -eq 'High'
$medium = $violations | Where-Object Severity -eq 'Medium'
$low = $violations | Where-Object Severity -eq 'Low'

Write-Host "❌ PII or inconsistent data detected!" -ForegroundColor Red
Write-Host ""

if ($high) {
    Write-Host "🔴 HIGH SEVERITY ISSUES ($($high.Count)):" -ForegroundColor Red
    $high | ForEach-Object {
        Write-Host "  [$($_.File):$($_.Line)] $($_.Check)" -ForegroundColor Red
        Write-Host "    Match: $($_.Match)..." -ForegroundColor Gray
    }
    Write-Host ""
}

if ($medium) {
    Write-Host "🟡 MEDIUM SEVERITY ISSUES ($($medium.Count)):" -ForegroundColor Yellow
    $medium | ForEach-Object {
        Write-Host "  [$($_.File):$($_.Line)] $($_.Check)" -ForegroundColor Yellow
        Write-Host "    Match: $($_.Match)..." -ForegroundColor Gray
    }
    Write-Host ""
}

if ($low) {
    Write-Host "🔵 LOW SEVERITY ISSUES ($($low.Count)):" -ForegroundColor Blue
    $low | ForEach-Object {
        Write-Host "  [$($_.File):$($_.Line)] $($_.Check)" -ForegroundColor Blue
        Write-Host "    Match: $($_.Match)..." -ForegroundColor Gray
    }
    Write-Host ""
}

Write-Host "💡 Remediation:" -ForegroundColor Cyan
Write-Host "  1. Replace real credentials with example values from COMMANDS_DOCUMENTATION.md"
Write-Host "  2. Use consistent example data: mycluster, _Node_0-4, fabric:/MyApp, etc."
Write-Host "  3. Move real credentials to .env file (not committed)"
Write-Host "  4. If false positive, add file to allowed list in test/Pre-Commit-PII-Check.ps1"
Write-Host ""
Write-Host "To bypass (not recommended): git commit --no-verify" -ForegroundColor Gray
Write-Host ""

# Exit with failure if high or medium severity issues found
if ($high.Count -gt 0 -or $medium.Count -gt 0) {
    exit 1
}

# Warn but allow commit for low severity issues
Write-Host "⚠️  Proceeding with commit (low severity issues only)" -ForegroundColor Yellow
exit 0
