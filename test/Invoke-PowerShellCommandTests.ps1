#Requires -Version 7.0

<#
.SYNOPSIS
    Test runner for Service Fabric PowerShell command generation validation
    
.DESCRIPTION
    Orchestrates Pester test execution for validating generated PowerShell commands.
    Includes setup, execution, reporting, and cleanup.
    
.PARAMETER TestType
    Type of tests to run: All, Unit, Integration, Syntax, PII
    
.PARAMETER OutputFormat
    Output format: NUnitXml, JUnitXml, Console, HTML
    
.PARAMETER CodeCoverage
    Enable code coverage analysis
    
.EXAMPLE
    .\Invoke-PowerShellCommandTests.ps1 -TestType All
    
.EXAMPLE
    .\Invoke-PowerShellCommandTests.ps1 -TestType Syntax -OutputFormat JUnitXml
#>

[CmdletBinding()]
param(
    [Parameter()]
    [ValidateSet('All', 'Syntax', 'PII', 'Coverage', 'BestPractices')]
    [string]$TestType = 'All',
    
    [Parameter()]
    [ValidateSet('NUnitXml', 'JUnitXml', 'Console')]
    [string]$OutputFormat = 'Console',
    
    [Parameter()]
    [string]$OutputPath = "$PSScriptRoot\..\test-results",
    
    [Parameter()]
    [switch]$CodeCoverage,
    
    [Parameter()]
    [switch]$PassThru
)

$ErrorActionPreference = 'Stop'

# Ensure output directory exists
if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

Write-Host "🧪 Service Fabric PowerShell Command Test Suite" -ForegroundColor Cyan
Write-Host "=" * 60
Write-Host ""

# Check Pester installation
Write-Host "📦 Checking Pester installation..." -ForegroundColor Yellow
$pesterModule = Get-Module -ListAvailable -Name Pester | Where-Object Version -ge '5.3.0' | Select-Object -First 1

if (-not $pesterModule) {
    Write-Host "❌ Pester 5.3.0+ not found. Installing..." -ForegroundColor Red
    Install-Module -Name Pester -MinimumVersion 5.3.0 -Force -SkipPublisherCheck -Scope CurrentUser
    Write-Host "✅ Pester installed successfully" -ForegroundColor Green
}
else {
    Write-Host "✅ Pester $($pesterModule.Version) found" -ForegroundColor Green
}

Import-Module Pester -MinimumVersion 5.3.0

Write-Host ""
Write-Host "🎯 Test Configuration:" -ForegroundColor Yellow
Write-Host "  Test Type: $TestType"
Write-Host "  Output Format: $OutputFormat"
Write-Host "  Output Path: $OutputPath"
Write-Host ""

# Configure Pester
$pesterConfig = New-PesterConfiguration

# Set paths
$pesterConfig.Run.Path = "$PSScriptRoot"
$pesterConfig.Run.PassThru = $true

# Filter by test type
switch ($TestType) {
    'Syntax' {
        $pesterConfig.Filter.Tag = 'Syntax'
    }
    'PII' {
        $pesterConfig.Filter.Tag = 'PII'
    }
    'Coverage' {
        $pesterConfig.Filter.Tag = 'Coverage'
    }
    'BestPractices' {
        $pesterConfig.Filter.Tag = 'BestPractices'
    }
}

# Configure output
$timestamp = Get-Date -Format 'yyyy-MM-dd-HHmmss'
$pesterConfig.Output.Verbosity = 'Detailed'

switch ($OutputFormat) {
    'NUnitXml' {
        $pesterConfig.TestResult.Enabled = $true
        $pesterConfig.TestResult.OutputFormat = 'NUnitXml'
        $pesterConfig.TestResult.OutputPath = Join-Path $OutputPath "TestResults-$timestamp.xml"
    }
    'JUnitXml' {
        $pesterConfig.TestResult.Enabled = $true
        $pesterConfig.TestResult.OutputFormat = 'JUnitXml'
        $pesterConfig.TestResult.OutputPath = Join-Path $OutputPath "TestResults-$timestamp.xml"
    }
}

# Code coverage (if enabled)
if ($CodeCoverage) {
    Write-Host "📊 Code coverage enabled" -ForegroundColor Yellow
    $pesterConfig.CodeCoverage.Enabled = $true
    $pesterConfig.CodeCoverage.Path = "$PSScriptRoot\..\src\services\*.ts"
    $pesterConfig.CodeCoverage.OutputPath = Join-Path $OutputPath "Coverage-$timestamp.xml"
}

# Run tests
Write-Host "🚀 Starting test execution..." -ForegroundColor Cyan
Write-Host ""

$testStartTime = Get-Date
$results = Invoke-Pester -Configuration $pesterConfig

$testDuration = (Get-Date) - $testStartTime

Write-Host ""
Write-Host "=" * 60
Write-Host "📊 Test Results Summary" -ForegroundColor Cyan
Write-Host "=" * 60
Write-Host ""

# Display results
$color = if ($results.FailedCount -eq 0) { 'Green' } else { 'Red' }

Write-Host "Total Tests:   " -NoNewline
Write-Host $results.TotalCount -ForegroundColor Cyan

Write-Host "Passed:        " -NoNewline
Write-Host $results.PassedCount -ForegroundColor Green

if ($results.FailedCount -gt 0) {
    Write-Host "Failed:        " -NoNewline
    Write-Host $results.FailedCount -ForegroundColor Red
}

if ($results.SkippedCount -gt 0) {
    Write-Host "Skipped:       " -NoNewline
    Write-Host $results.SkippedCount -ForegroundColor Yellow
}

Write-Host "Duration:      " -NoNewline
Write-Host "$([int]$testDuration.TotalSeconds)s" -ForegroundColor Cyan

Write-Host ""

# Show failed tests details
if ($results.FailedCount -gt 0) {
    Write-Host "❌ Failed Tests:" -ForegroundColor Red
    Write-Host ""
    
    foreach ($test in $results.Failed) {
        Write-Host "  ❌ $($test.Name)" -ForegroundColor Red
        Write-Host "     $($test.ErrorRecord.Exception.Message)" -ForegroundColor Gray
        Write-Host ""
    }
}

# Code coverage summary
if ($CodeCoverage -and $results.CodeCoverage) {
    Write-Host "📊 Code Coverage:" -ForegroundColor Cyan
    $coverage = $results.CodeCoverage
    $coveragePercent = if ($coverage.NumberOfCommandsAnalyzed -gt 0) {
        [math]::Round(($coverage.NumberOfCommandsExecuted / $coverage.NumberOfCommandsAnalyzed) * 100, 2)
    } else { 0 }
    
    Write-Host "  Commands Analyzed: $($coverage.NumberOfCommandsAnalyzed)"
    Write-Host "  Commands Executed: $($coverage.NumberOfCommandsExecuted)"
    Write-Host "  Coverage:          $coveragePercent%"
    Write-Host ""
}

# Save summary to file
$summaryPath = Join-Path $OutputPath "TestSummary-$timestamp.txt"
$summaryContent = @"
Service Fabric PowerShell Command Tests
========================================

Executed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Test Type: $TestType
Duration: $([int]$testDuration.TotalSeconds)s

Results:
--------
Total:   $($results.TotalCount)
Passed:  $($results.PassedCount)
Failed:  $($results.FailedCount)
Skipped: $($results.SkippedCount)

Status: $(if ($results.FailedCount -eq 0) { 'PASSED ✅' } else { 'FAILED ❌' })
"@

$summaryContent | Out-File -FilePath $summaryPath -Encoding utf8

Write-Host "📄 Summary saved to: $summaryPath" -ForegroundColor Gray
if ($OutputFormat -ne 'Console') {
    Write-Host "📄 Test results saved to: $($pesterConfig.TestResult.OutputPath)" -ForegroundColor Gray
}

Write-Host ""

# Exit with appropriate code
if ($PassThru) {
    return $results
}

if ($results.FailedCount -gt 0) {
    Write-Host "❌ Tests FAILED" -ForegroundColor Red
    exit 1
}
else {
    Write-Host "✅ All tests PASSED" -ForegroundColor Green
    exit 0
}
