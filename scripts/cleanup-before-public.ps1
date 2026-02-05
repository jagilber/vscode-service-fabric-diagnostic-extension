#Requires -Version 7.0

<#
.SYNOPSIS
    Clean up repository before making it public
    
.DESCRIPTION
    Removes chat history, internal planning docs, and sanitizes any remaining sensitive references
    
.NOTES
    Run this script before pushing to public GitHub
#>

[CmdletBinding(SupportsShouldProcess)]
param()

$ErrorActionPreference = 'Stop'

Write-Host "🧹 Cleaning repository before public release..." -ForegroundColor Cyan

$repoRoot = Split-Path $PSScriptRoot -Parent
Push-Location $repoRoot

try {
    # Files to remove (chat history and internal planning docs)
    $filesToRemove = @(
        # Chat session analysis/history
        'COMPLETE-ANALYSIS-BOTH-ISSUES.md'
        'CRITICAL_ISSUES_SUMMARY.md'
        'CRITICAL-API-TEST-ANALYSIS.md'
        'EXTENSION-AUTOSTART-ROOT-CAUSE.md'
        
        # Internal planning documents
        'MCP_TOOL_ACTIVATION_IMPROVEMENT_PLAN.md'
        'CLUSTER-TABS-IMPLEMENTATION-PLAN.md'
        'REFACTORING_PLAN.md'
        'SERVICE_FABRIC_EXTENSION_IMPROVEMENT_PLAN.md'
        
        # Phase completion docs (internal tracking)
        'PHASE_1_COMPLETE.md'
        'DOCUMENTATION_SUMMARY.md'
        'COMMANDS_100_PERCENT_COMPLETE.md'
        'MANAGEMENT_VIEW_INTEGRATION.md'
        'TREE_EXPANSION_DESIGN.md'
        
        # PII implementation docs (implementation details, not user docs)
        'PII_VALIDATION_SYSTEM.md'
        'PII_OBFUSCATION_IMPLEMENTATION.md'
    )
    
    Write-Host "`n📄 Removing internal documentation files..." -ForegroundColor Yellow
    
    $removedCount = 0
    foreach ($file in $filesToRemove) {
        $filePath = Join-Path $repoRoot $file
        if (Test-Path $filePath) {
            if ($PSCmdlet.ShouldProcess($file, "Remove file")) {
                Remove-Item $filePath -Force
                Write-Host "  ✓ Removed: $file" -ForegroundColor Green
                $removedCount++
            }
        } else {
            Write-Host "  - Not found: $file" -ForegroundColor DarkGray
        }
    }
    
    Write-Host "`n  Removed $removedCount files" -ForegroundColor Cyan
    
    # Update .gitignore to exclude backup directories
    Write-Host "`n📝 Updating .gitignore..." -ForegroundColor Yellow
    
    $gitignorePath = Join-Path $repoRoot '.gitignore'
    $gitignoreContent = Get-Content $gitignorePath -Raw
    
    $backupEntries = @(
        ''
        '# Git backup directory (created during sanitization)'
        '.git.backup/'
        ''
        '# Internal planning and analysis docs'
        '*ANALYSIS*.md'
        '*PLAN*.md'
        'PHASE_*.md'
        'DOCUMENTATION_SUMMARY.md'
        'COMMANDS_100_PERCENT_COMPLETE.md'
    )
    
    if ($gitignoreContent -notmatch '\.git\.backup/') {
        if ($PSCmdlet.ShouldProcess('.gitignore', 'Add backup and internal doc exclusions')) {
            $newContent = $gitignoreContent.TrimEnd() + "`n" + ($backupEntries -join "`n") + "`n"
            Set-Content -Path $gitignorePath -Value $newContent -NoNewline
            Write-Host "  ✓ Added backup directory exclusions to .gitignore" -ForegroundColor Green
        }
    } else {
        Write-Host "  - .gitignore already contains backup exclusions" -ForegroundColor DarkGray
    }
    
    # Sanitize ARCHITECTURE.md - replace internal cluster endpoint
    Write-Host "`n🔧 Sanitizing ARCHITECTURE.md..." -ForegroundColor Yellow
    
    $archPath = Join-Path $repoRoot 'ARCHITECTURE.md'
    if (Test-Path $archPath) {
        $archContent = Get-Content $archPath -Raw
        
        if ($archContent -match 'sfmjagilber1m1\.centralus\.cloudapp\.azure\.com') {
            if ($PSCmdlet.ShouldProcess('ARCHITECTURE.md', 'Replace internal endpoint')) {
                $sanitized = $archContent -replace 'sfmjagilber1m1\.centralus\.cloudapp\.azure\.com', 'mycluster.centralus.cloudapp.azure.com'
                Set-Content -Path $archPath -Value $sanitized -NoNewline
                Write-Host "  ✓ Replaced internal endpoint with example" -ForegroundColor Green
            }
        } else {
            Write-Host "  - No internal endpoints found" -ForegroundColor DarkGray
        }
    }
    
    # Check for other potential issues
    Write-Host "`n🔍 Scanning for potential issues..." -ForegroundColor Yellow
    
    # Check if .git.backup exists and warn
    $gitBackupPath = Join-Path $repoRoot '.git.backup'
    if (Test-Path $gitBackupPath) {
        Write-Host "  ⚠️  WARNING: .git.backup directory exists" -ForegroundColor Yellow
        Write-Host "      This contains old commit history with sensitive data" -ForegroundColor Yellow
        Write-Host "      It's now in .gitignore and will not be pushed" -ForegroundColor Yellow
        Write-Host "      You can safely delete it: Remove-Item .git.backup -Recurse -Force" -ForegroundColor Yellow
    }
    
    # Check for any remaining user-specific paths
    $filesWithUserPaths = Get-ChildItem -Path $repoRoot -Filter '*.md' -Recurse -File |
        Where-Object { $_.FullName -notmatch '[\\/]node_modules[\\/]' -and $_.FullName -notmatch '[\\/]\.git' } |
        ForEach-Object {
            $content = Get-Content $_.FullName -Raw
            if ($content -match 'C:\\Users\\jagilber\\AppData') {
                $_.FullName
            }
        }
    
    if ($filesWithUserPaths) {
        Write-Host "`n  ⚠️  WARNING: Found user-specific paths in:" -ForegroundColor Yellow
        foreach ($file in $filesWithUserPaths) {
            Write-Host "      - $($file -replace [regex]::Escape($repoRoot), '.')" -ForegroundColor Yellow
        }
    }
    
    # Final summary
    Write-Host "`n✅ Cleanup complete!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "  1. Review changes: git status" -ForegroundColor White
    Write-Host "  2. Commit cleanup: git add . && git commit -m 'chore: remove internal docs before public release'" -ForegroundColor White
    Write-Host "  3. Optionally delete .git.backup: Remove-Item .git.backup -Recurse -Force" -ForegroundColor White
    Write-Host "  4. Push to GitHub: git push origin master" -ForegroundColor White
    
} finally {
    Pop-Location
}
