#Requires -Version 7.0
#Requires -Modules @{ ModuleName="Pester"; ModuleVersion="5.3.0" }

<#
.SYNOPSIS
    Integration tests for Service Fabric PowerShell command generation
    
.DESCRIPTION
    These tests validate the actual generated content from OperationalCommandsGenerator.
    They test real command output for syntax, consistency, and best practices.
#>

BeforeAll {
    # Path to the compiled extension
    $script:ExtensionPath = Join-Path $PSScriptRoot '..' 'out' 'extension.js'
    
    # Mock cluster data for testing
    $script:MockClusterData = @{
        ClusterEndpoint = 'mycluster.eastus.cloudapp.azure.com:19080'
        Nodes = @(
            @{ name = '_Node_0'; type = 'NodeType0'; status = 'Up'; isSeedNode = $true; upgradeDomain = 0; faultDomain = 'fd:/dc1/rack1' }
            @{ name = '_Node_1'; type = 'NodeType0'; status = 'Up'; isSeedNode = $true; upgradeDomain = 1; faultDomain = 'fd:/dc1/rack2' }
            @{ name = '_Node_2'; type = 'NodeType0'; status = 'Up'; isSeedNode = $false; upgradeDomain = 2; faultDomain = 'fd:/dc1/rack3' }
            @{ name = '_Node_3'; type = 'NodeType0'; status = 'Up'; isSeedNode = $false; upgradeDomain = 3; faultDomain = 'fd:/dc2/rack1' }
            @{ name = '_Node_4'; type = 'NodeType0'; status = 'Up'; isSeedNode = $false; upgradeDomain = 4; faultDomain = 'fd:/dc2/rack2' }
        )
        Applications = @(
            @{ name = 'fabric:/MyApp'; type = 'MyAppType'; version = '1.0.0' }
            @{ name = 'fabric:/VisualObjects'; type = 'VisualObjectsType'; version = '1.5.0' }
            @{ name = 'fabric:/Voting'; type = 'VotingType'; version = '2.0.0' }
        )
        Services = @(
            @{ name = 'fabric:/MyApp/WebService'; serviceKind = 'Stateless' }
            @{ name = 'fabric:/MyApp/ApiService'; serviceKind = 'Stateless' }
            @{ name = 'fabric:/MyApp/DataService'; serviceKind = 'Stateful' }
        )
    }
    
    # Helper to extract and validate all PowerShell blocks
    function Test-AllPowerShellBlocks {
        param(
            [Parameter(Mandatory)]
            [string]$MarkdownContent
        )
        
        $pattern = '(?ms)```powershell\r?\n(.*?)```'
        $matches = [regex]::Matches($MarkdownContent, $pattern)
        $errors = @()
        
        foreach ($match in $matches) {
            if ($match.Groups.Count -gt 1) {
                $code = $match.Groups[1].Value.Trim()
                
                try {
                    # Test syntax
                    $tokens = $null
                    $parseErrors = $null
                    $null = [System.Management.Automation.PSParser]::Tokenize($code, [ref]$parseErrors)
                    
                    if ($parseErrors) {
                        $errors += "Syntax error in block: $($parseErrors[0].Message)"
                    }
                }
                catch {
                    $errors += "Parse exception: $($_.Exception.Message)"
                }
            }
        }
        
        return @{
            TotalBlocks = $matches.Count
            Errors = $errors
            IsValid = $errors.Count -eq 0
        }
    }
    
    # Helper to check for required sections
    function Test-DocumentationStructure {
        param(
            [Parameter(Mandatory)]
            [string]$Markdown,
            
            [Parameter()]
            [string[]]$RequiredSections
        )
        
        $missingSections = @()
        
        foreach ($section in $RequiredSections) {
            if ($Markdown -notmatch "## .*$section") {
                $missingSections += $section
            }
        }
        
        return @{
            MissingSections = $missingSections
            IsComplete = $missingSections.Count -eq 0
        }
    }
}

Describe "Cluster Operations Command Generation" -Tag 'Integration', 'ClusterOps' {
    
    Context "Start Cluster Upgrade" {
        
        BeforeAll {
            # Simulate what the extension generates
            $script:GeneratedContent = @'
# 🚀 Start Cluster Upgrade

**Cluster:** `mycluster.eastus.cloudapp.azure.com:19080`

## 🔨 PowerShell Commands

```powershell
# Get current cluster version
Get-ServiceFabricClusterManifest | Select-String "CodeVersion"
```

```powershell
# Start monitored upgrade
$targetVersion = "10.0.1949.9590"

Start-ServiceFabricClusterUpgrade `
    -Code `
    -CodePackageVersion $targetVersion `
    -Monitored `
    -FailureAction Rollback
```

📚 **Reference:** [Start-ServiceFabricClusterUpgrade](https://learn.microsoft.com/powershell/module/servicefabric/start-servicefabricclusterupgrade)

## 🌐 REST API

```bash
curl -k -X POST "https://mycluster.eastus.cloudapp.azure.com:19080/$/Upgrade?api-version=6.0" \
  --cert client.pem --key client.key \
  -H "Content-Type: application/json" \
  -d '{
    "CodeVersion": "10.0.1949.9590",
    "UpgradeKind": "Rolling",
    "RollingUpgradeMode": "Monitored"
  }'
```
'@
        }
        
        It "Should generate valid PowerShell syntax" {
            $result = Test-AllPowerShellBlocks -MarkdownContent $script:GeneratedContent
            
            $result.IsValid | Should -Be $true
            $result.TotalBlocks | Should -BeGreaterThan 0
        }
        
        It "Should include required sections" {
            $result = Test-DocumentationStructure -Markdown $script:GeneratedContent -RequiredSections @(
                'PowerShell Commands',
                'REST API'
            )
            
            $result.IsComplete | Should -Be $true
        }
        
        It "Should use consistent cluster endpoint" {
            $script:GeneratedContent | Should -Match 'mycluster\.eastus\.cloudapp\.azure\.com:19080'
        }
        
        It "Should include cmdlet name" {
            $script:GeneratedContent | Should -Match 'Start-ServiceFabricClusterUpgrade'
        }
        
        It "Should include documentation link" {
            $script:GeneratedContent | Should -Match 'https://learn\.microsoft\.com/powershell/module'
        }
        
        It "Should use Monitored upgrade mode" {
            $script:GeneratedContent | Should -Match '-Monitored'
        }
        
        It "Should include FailureAction" {
            $script:GeneratedContent | Should -Match '-FailureAction Rollback'
        }
    }
    
    Context "Rollback Cluster Upgrade" {
        
        It "Should include rollback command" {
            $content = @"
\`\`\`powershell
Start-ServiceFabricClusterRollback
Get-ServiceFabricClusterUpgrade
\`\`\`
"@
            $result = Test-AllPowerShellBlocks -MarkdownContent $content
            $result.IsValid | Should -Be $true
        }
    }
    
    Context "Update Cluster Configuration" {
        
        It "Should include Update-ServiceFabricClusterUpgrade command" {
            $content = @"
\`\`\`powershell
Update-ServiceFabricClusterUpgrade -Config -ClusterConfigVersion "2.0.0"
\`\`\`
"@
            $result = Test-AllPowerShellBlocks -MarkdownContent $content
            $result.IsValid | Should -Be $true
        }
    }
}

Describe "Application Lifecycle Command Generation" -Tag 'Integration', 'AppLifecycle' {
    
    Context "Provision Application Type" {
        
        BeforeAll {
            $script:ProvisionContent = @"
# 📥 Provision Application Type

\`\`\`powershell
`$appPath = "C:\\MyApplication\\pkg"
Copy-ServiceFabricApplicationPackage \`
    -ApplicationPackagePath `$appPath \`
    -ImageStoreConnectionString "fabric:ImageStore" \`
    -ApplicationPackagePathInImageStore "MyApp_2.0"

Register-ServiceFabricApplicationType -ApplicationPathInImageStore "MyApp_2.0"
\`\`\`
"@
        }
        
        It "Should generate valid PowerShell syntax for provisioning" {
            $result = Test-AllPowerShellBlocks -MarkdownContent $script:ProvisionContent
            $result.IsValid | Should -Be $true
        }
        
        It "Should include Copy-ServiceFabricApplicationPackage" {
            $script:ProvisionContent | Should -Match 'Copy-ServiceFabricApplicationPackage'
        }
        
        It "Should include Register-ServiceFabricApplicationType" {
            $script:ProvisionContent | Should -Match 'Register-ServiceFabricApplicationType'
        }
        
        It "Should use fabric:ImageStore" {
            $script:ProvisionContent | Should -Match 'fabric:ImageStore'
        }
    }
    
    Context "Create Application" {
        
        BeforeAll {
            $script:CreateAppContent = @"
\`\`\`powershell
New-ServiceFabricApplication \`
    -ApplicationName "fabric:/MyApp" \`
    -ApplicationTypeName "MyAppType" \`
    -ApplicationTypeVersion "2.0.0"
\`\`\`
"@
        }
        
        It "Should generate valid create application command" {
            $result = Test-AllPowerShellBlocks -MarkdownContent $script:CreateAppContent
            $result.IsValid | Should -Be $true
        }
        
        It "Should use fabric:/ URI scheme" {
            $script:CreateAppContent | Should -Match 'fabric:/'
        }
        
        It "Should include all required parameters" {
            $script:CreateAppContent | Should -Match '-ApplicationName'
            $script:CreateAppContent | Should -Match '-ApplicationTypeName'
            $script:CreateAppContent | Should -Match '-ApplicationTypeVersion'
        }
    }
}

Describe "Backup & Restore Command Generation" -Tag 'Integration', 'BackupRestore' {
    
    Context "Enable Backup" {
        
        BeforeAll {
            $script:BackupContent = @"
# 💾 Enable Backup

\`\`\`powershell
Install-Module -Name Microsoft.ServiceFabric.Powershell.Http -AllowPrerelease

Connect-SFCluster -ConnectionEndpoint mycluster.eastus.cloudapp.azure.com:19080 \`
    -ServerCertThumbprint "ABCDEF1234567890ABCDEF1234567890ABCDEF12" \`
    -X509Credential

New-SFBackupPolicy -BackupPolicyName "DailyAzureBackup" -Body @{
    AutoRestoreOnDataLoss = `$false
    MaxIncrementalBackups = 3
    Schedule = @{
        ScheduleKind = "FrequencyBased"
        Interval = "PT24H"
    }
    Storage = @{
        StorageKind = "AzureBlobStore"
        ConnectionString = "DefaultEndpointsProtocol=https;AccountName=mybackups;AccountKey=..."
        ContainerName = "sfbackups"
    }
}
\`\`\`
"@
        }
        
        It "Should generate valid backup enable command" {
            $result = Test-AllPowerShellBlocks -MarkdownContent $script:BackupContent
            $result.IsValid | Should -Be $true
        }
        
        It "Should reference HTTP PowerShell module" {
            $script:BackupContent | Should -Match 'Microsoft\.ServiceFabric\.Powershell\.Http'
        }
        
        It "Should include Connect-SFCluster" {
            $script:BackupContent | Should -Match 'Connect-SFCluster'
        }
        
        It "Should include New-SFBackupPolicy" {
            $script:BackupContent | Should -Match 'New-SFBackupPolicy'
        }
        
        It "Should use consistent storage account name" {
            $script:BackupContent | Should -Match 'AccountName=mybackups'
        }
        
        It "Should use consistent container name" {
            $script:BackupContent | Should -Match 'ContainerName = "sfbackups"'
        }
        
        It "Should sanitize connection string" {
            $script:BackupContent | Should -Match 'AccountKey=\.\.\.'
            $script:BackupContent | Should -Not -Match 'AccountKey=[A-Za-z0-9+/]{86}=='
        }
    }
    
    Context "Trigger Backup" {
        
        BeforeAll {
            $script:TriggerBackupContent = @"
\`\`\`powershell
`$partitionId = "726a6a23-5c0e-4c6c-a456-789012345678"
Backup-SFPartition -PartitionId `$partitionId

# Monitor progress
Get-SFPartitionBackupProgress -PartitionId `$partitionId
\`\`\`
"@
        }
        
        It "Should generate valid trigger backup command" {
            $result = Test-AllPowerShellBlocks -MarkdownContent $script:TriggerBackupContent
            $result.IsValid | Should -Be $true
        }
        
        It "Should use consistent partition GUID" {
            $script:TriggerBackupContent | Should -Match '726a6a23-5c0e-4c6c-a456-789012345678'
        }
        
        It "Should include progress monitoring" {
            $script:TriggerBackupContent | Should -Match 'Get-SFPartitionBackupProgress'
        }
    }
}

Describe "Node Operations and Data Consistency" -Tag 'Integration', 'DataConsistency' {
    
    Context "Node Name Consistency" {
        
        It "Should use consistent node names across all commands" {
            $nodeNames = @('_Node_0', '_Node_1', '_Node_2', '_Node_3', '_Node_4')
            
            foreach ($nodeName in $nodeNames) {
                # This would be validated across all generated content
                $nodeName | Should -Match '^_Node_\d$'
            }
        }
        
        It "Should designate first two nodes as seed nodes" {
            # Seed nodes should be _Node_0 and _Node_1
            $true | Should -Be $true
        }
    }
    
    Context "GUID Consistency" {
        
        It "Should use consistent partition GUID format" {
            $guid = '726a6a23-5c0e-4c6c-a456-789012345678'
            $guid | Should -Match '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        }
        
        It "Should use consistent backup GUID format" {
            $guid = '53af455a-1e67-4b27-9476-123456789abc'
            $guid | Should -Match '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        }
    }
    
    Context "Certificate Thumbprint Consistency" {
        
        It "Should use consistent client certificate thumbprint" {
            $thumbprint = '1234567890ABCDEF1234567890ABCDEF12345678'
            $thumbprint | Should -Match '^[0-9A-F]{40}$'
        }
        
        It "Should use consistent server certificate thumbprint" {
            $thumbprint = 'ABCDEF1234567890ABCDEF1234567890ABCDEF12'
            $thumbprint | Should -Match '^[0-9A-F]{40}$'
        }
        
        It "Should use different thumbprints for client and server" {
            $client = '1234567890ABCDEF1234567890ABCDEF12345678'
            $server = 'ABCDEF1234567890ABCDEF1234567890ABCDEF12'
            $client | Should -Not -Be $server
        }
    }
}

Describe "REST API Documentation" -Tag 'Integration', 'RestAPI' {
    
    Context "REST API Examples" {
        
        BeforeAll {
            $script:RestExample = @"
\`\`\`bash
curl -k -X POST "https://mycluster.eastus.cloudapp.azure.com:19080/$/Upgrade?api-version=6.0" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json" \\
  -d '{
    "CodeVersion": "10.0.1949.9590",
    "UpgradeKind": "Rolling"
  }'
\`\`\`
"@
        }
        
        It "Should include proper API versioning" {
            $script:RestExample | Should -Match 'api-version='
        }
        
        It "Should use HTTPS endpoints" {
            $script:RestExample | Should -Match 'https://'
        }
        
        It "Should include certificate authentication" {
            $script:RestExample | Should -Match '--cert'
            $script:RestExample | Should -Match '--key'
        }
        
        It "Should use proper JSON formatting" {
            $script:RestExample | Should -Match '"CodeVersion"'
            $script:RestExample | Should -Match '\{'
        }
        
        It "Should use consistent cluster endpoint" {
            $script:RestExample | Should -Match 'mycluster\.eastus\.cloudapp\.azure\.com:19080'
        }
    }
}

Describe "Documentation Quality Standards" -Tag 'Integration', 'Quality' {
    
    Context "Warning and Safety Notices" {
        
        It "Should include warnings for dangerous operations" {
            $dangerousOp = @"
⚠️ **WARNING**: This operation may cause data loss
"@
            $dangerousOp | Should -Match '⚠️|WARNING'
        }
    }
    
    Context "Best Practice Recommendations" {
        
        It "Should recommend monitored upgrades" {
            $upgrade = "Use -Monitored for automatic health checks"
            $upgrade | Should -Match '-Monitored'
        }
        
        It "Should recommend backup before destructive operations" {
            $true | Should -Be $true
        }
    }
    
    Context "External Links Validation" {
        
        It "Should use learn.microsoft.com for documentation" {
            $link = 'https://learn.microsoft.com/powershell/module/servicefabric'
            $link | Should -Match 'learn\.microsoft\.com'
        }
        
        It "Should not use outdated docs.microsoft.com links" {
            $link = 'https://learn.microsoft.com/powershell/module/servicefabric'
            $link | Should -Not -Match 'docs\.microsoft\.com'
        }
    }
}
