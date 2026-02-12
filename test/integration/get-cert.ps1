param(
    [string]$Thumbprint = $env:SF_TEST_THUMBPRINT,
    [ValidateSet('cert','key')]
    [string]$Type = 'cert'
)
if (-not $Thumbprint) { throw "Thumbprint required" }

$cert = Get-Item "Cert:\CurrentUser\My\$Thumbprint" -ErrorAction SilentlyContinue
if (-not $cert) { $cert = Get-Item "Cert:\LocalMachine\My\$Thumbprint" -ErrorAction SilentlyContinue }
if (-not $cert) { throw "Certificate not found: $Thumbprint" }

if ($Type -eq 'cert') {
    # pwsh 7+ / .NET 5+ method
    Write-Output $cert.ExportCertificatePem()
} else {
    if (-not $cert.HasPrivateKey) { throw "No private key for: $Thumbprint" }
    Write-Output $cert.PrivateKey.ExportRSAPrivateKeyPem()
}
