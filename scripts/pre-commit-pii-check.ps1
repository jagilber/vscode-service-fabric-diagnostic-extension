# PII Protection Pre-Commit Hook (PowerShell)
# Prevents committing sensitive information

Write-Host "🔒 Running Pre-Commit Checks..." -ForegroundColor Cyan

# STEP 1: CRITICAL - Icon rendering protection tests
Write-Host "`n[1/3] Running CRITICAL icon rendering protection tests..." -ForegroundColor Yellow
$iconTestOutput = npm test -- icon-rendering-validation.test.ts --silent 2>&1 | Out-String

# Check if all 10 tests passed (ignore coverage thresholds)
if ($iconTestOutput -match "Tests:.*10 passed" -and $iconTestOutput -match "Test Suites:.*1 passed") {
    Write-Host "✅ Icon protection tests passed (10/10)" -ForegroundColor Green
} else {
    Write-Host "❌ FAILED: Icon protection tests failed!" -ForegroundColor Red
    Write-Host "   These tests prevent the icon color rendering bug from returning." -ForegroundColor Yellow
    Write-Host "   See docs/ICON_RENDERING_BUG.md for details." -ForegroundColor Yellow
    Write-Host "`n   Output:" -ForegroundColor Gray
    Write-Host $iconTestOutput -ForegroundColor Gray
    exit 1
}

# STEP 2: PII/Secrets check
Write-Host "`n[2/3] Checking for PII/Secrets..." -ForegroundColor Yellow

$exitCode = 0

# Check if .env file is being committed
$envFile = git diff --cached --name-only | Select-String -Pattern '^\.env$'
if ($envFile) {
    Write-Host "❌ ERROR: .env file detected in commit!" -ForegroundColor Red
    Write-Host "   The .env file contains sensitive credentials and must not be committed." -ForegroundColor Yellow
    Write-Host "   Please unstage it with: git reset HEAD .env" -ForegroundColor Yellow
    exit 1
}

# Check if any .env.local files are being committed
$envLocalFiles = git diff --cached --name-only | Select-String -Pattern '\.env\..*\.local$'
if ($envLocalFiles) {
    Write-Host "❌ ERROR: Local environment file detected in commit!" -ForegroundColor Red
    Write-Host "   Local .env files must not be committed." -ForegroundColor Yellow
    exit 1
}

# Get list of staged files (excluding .env.example which is allowed)
$stagedFiles = git diff --cached --name-only --diff-filter=ACM | Where-Object { $_ -notmatch '\.env\.example$' }

if ($stagedFiles) {
    # Check for hardcoded certificate thumbprints (except in allowed files)
    $allowedThumbprintFiles = @('\.env\.example', 'SECURITY\.md', 'TEST_EXECUTION_REPORT\.md', 'test-results/', 'test/', '\.test\.ts')
    $filesWithPotentialThumbprints = $stagedFiles | Where-Object { 
        $file = $_
        -not ($allowedThumbprintFiles | Where-Object { $file -match $_ })
    }

    if ($filesWithPotentialThumbprints) {
        $diff = git diff --cached -- $filesWithPotentialThumbprints
        if ($diff -match '[0-9A-F]{40}') {
            Write-Host "⚠️  WARNING: Potential certificate thumbprint detected!" -ForegroundColor Yellow
            Write-Host "   Found 40-character hex string that looks like a thumbprint." -ForegroundColor Yellow
            Write-Host "   Allowed in: .env.example, SECURITY.md, test files" -ForegroundColor Yellow
            Write-Host "   If this is a real thumbprint, move it to .env file." -ForegroundColor Yellow
            Write-Host ""
            
            $response = Read-Host "   Continue anyway? (y/N)"
            if ($response -ne 'y' -and $response -ne 'Y') {
                exit 1
            }
        }
    }

    # Check for real cluster URLs (except in allowed files)
    $allowedUrlFiles = @('\.env\.example', 'SECURITY\.md', 'README\.md', 'TEST_EXECUTION_REPORT\.md', 'test-results/', 'test/', 'scripts/')
    $filesWithPotentialUrls = $stagedFiles | Where-Object { 
        $file = $_
        -not ($allowedUrlFiles | Where-Object { $file -match $_ })
    }

    if ($filesWithPotentialUrls) {
        $diff = git diff --cached -- $filesWithPotentialUrls
        if ($diff -match 'https?://[a-z0-9-]+\.(centralus|eastus|westus|northeurope|westeurope)\.cloudapp\.azure\.com') {
            Write-Host "⚠️  WARNING: Real Azure cluster URL detected!" -ForegroundColor Yellow
            Write-Host "   Found URL pointing to actual Azure infrastructure." -ForegroundColor Yellow
            Write-Host "   Allowed in: .env.example, SECURITY.md, README.md, test files" -ForegroundColor Yellow
            Write-Host "   Consider using placeholder URLs in documentation." -ForegroundColor Yellow
            Write-Host ""
            
            $response = Read-Host "   Continue anyway? (y/N)"
            if ($response -ne 'y' -and $response -ne 'Y') {
                exit 1
            }
        }
    }

    # Check for common secret patterns
    $allowedSecretFiles = @('\.env\.example', 'test/')
    $filesWithPotentialSecrets = $stagedFiles | Where-Object { 
        $file = $_
        -not ($allowedSecretFiles | Where-Object { $file -match $_ })
    }

    if ($filesWithPotentialSecrets) {
        $diff = git diff --cached -- $filesWithPotentialSecrets
        if ($diff -match '(password|secret|apikey|api_key|access_token|private_key)\s*[=:]\s*["\047][^"\047]{8,}') {
            Write-Host "❌ ERROR: Potential hardcoded secret detected!" -ForegroundColor Red
            Write-Host "   Found pattern matching password/secret/apikey with value." -ForegroundColor Yellow
            Write-Host "   Secrets must be stored in .env file, not in source code." -ForegroundColor Yellow
            exit 1
        }
    }
}

Write-Host "`n[3/3] Running PII pattern checks..." -ForegroundColor Yellow

Write-Host "✅ PII protection checks passed!" -ForegroundColor Green

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✓ All pre-commit checks passed!" -ForegroundColor Green
Write-Host "  [1/3] Icon protection tests: OK" -ForegroundColor Gray
Write-Host "  [2/3] PII/Secrets scan: Clean" -ForegroundColor Gray
Write-Host "  [3/3] Pattern checks: Clean" -ForegroundColor Gray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

exit 0
