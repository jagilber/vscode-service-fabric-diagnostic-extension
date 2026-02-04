import * as vscode from 'vscode';
import { SfUtility, debugLevel } from '../sfUtility';

/**
 * PowerShell command generator for Service Fabric operations
 * Generates executable PowerShell scripts with real cluster values
 */
export class PowerShellCommandGenerator {
    
    /**
     * Generate PowerShell connection commands based on cluster configuration
     */
    static generateConnectionCommands(clusterEndpoint: string, certThumbprint?: string, serverCertThumbprint?: string): string {
        const endpoint = clusterEndpoint.replace('https://', '').replace('http://', '');
        const port = endpoint.includes(':') ? endpoint.split(':')[1] : '19000';
        const host = endpoint.split(':')[0];

        let markdown = `# 🔌 Service Fabric Cluster Connection Guide

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## 📋 Prerequisites

\`\`\`powershell
# Check if Service Fabric PowerShell module is installed
Get-Module -ListAvailable -Name ServiceFabric

# If not installed, install from Service Fabric SDK or runtime
# Download from: https://aka.ms/servicefabric
\`\`\`

---

## 🔐 Connection Methods

### Method 1: Unsecured Cluster (Development Only)

⚠️ **Warning:** Only use for local development clusters

\`\`\`powershell
# Connect to unsecured cluster
Connect-ServiceFabricCluster -ConnectionEndpoint ${host}:${port}

# Verify connection
Get-ServiceFabricClusterConnection
Get-ServiceFabricClusterHealth
\`\`\`

📚 **Reference:** [Connect-ServiceFabricCluster](https://learn.microsoft.com/powershell/module/servicefabric/connect-servicefabriccluster)

---

### Method 2: Certificate-Based Authentication (Recommended for Production)

#### Option A: Client Certificate from Certificate Store

\`\`\`powershell
# Find certificates in your store
Get-ChildItem -Path Cert:\\CurrentUser\\My
Get-ChildItem -Path Cert:\\LocalMachine\\My

# Connect with client certificate thumbprint
$clientCertThumbprint = "${certThumbprint || 'YOUR_CLIENT_CERT_THUMBPRINT'}"
$serverCertThumbprint = "${serverCertThumbprint || 'YOUR_SERVER_CERT_THUMBPRINT'}"

Connect-ServiceFabricCluster \`
    -ConnectionEndpoint ${host}:${port} \`
    -X509Credential \`
    -FindType FindByThumbprint \`
    -FindValue $clientCertThumbprint \`
    -StoreLocation CurrentUser \`
    -StoreName My \`
    -ServerCertThumbprint $serverCertThumbprint

# Verify
Test-ServiceFabricClusterConnection
\`\`\`

📚 **Reference:** [Connect-ServiceFabricCluster](https://learn.microsoft.com/powershell/module/servicefabric/connect-servicefabriccluster)

#### Option B: Certificate from PFX File

\`\`\`powershell
# Load certificate from PFX file
$certPath = "C:\\path\\to\\your\\certificate.pfx"
$certPassword = ConvertTo-SecureString -String "YourPassword" -AsPlainText -Force

# Import certificate to current user store (optional)
Import-PfxCertificate -FilePath $certPath \`
    -CertStoreLocation Cert:\\CurrentUser\\My \`
    -Password $certPassword

# Connect using the imported certificate thumbprint
$cert = Get-PfxCertificate -FilePath $certPath
Connect-ServiceFabricCluster \`
    -ConnectionEndpoint ${host}:${port} \`
    -X509Credential \`
    -FindType FindByThumbprint \`
    -FindValue $cert.Thumbprint \`
    -StoreLocation CurrentUser \`
    -StoreName My \`
    -ServerCertThumbprint $serverCertThumbprint
📚 **Reference:** [Get-PfxCertificate](https://learn.microsoft.com/powershell/module/microsoft.powershell.security/get-pfxcertificate)

\`\`\`

#### Option C: Common Name Authentication

\`\`\`powershell
# Connect using certificate common name
$clientCommonName = "client.cluster.domain.com"
$serverCommonName = "server.cluster.domain.com"

Connect-ServiceFabricCluster \`
    -ConnectionEndpoint ${host}:${port} \`
    -X509Credential \`
    -FindType FindBySubjectName \`
    -FindValue $clientCommonName \`
    -StoreLocation CurrentUser \`
📚 **Reference:** [Connect-ServiceFabricCluster](https://learn.microsoft.com/powershell/module/servicefabric/connect-servicefabriccluster)

    -StoreName My \`
    -ServerCommonName $serverCommonName
\`\`\`

---

### Method 3: Azure Active Directory (AAD) Authentication

\`\`\`powershell
# Connect using Azure AD interactive authentication
Connect-ServiceFabricCluster \`
    -ConnectionEndpoint ${host}:${port} \`
    -AzureActiveDirectory \`
    -ServerCertThumbprint $serverCertThumbprint

# Or use AAD token
$token = "YOUR_AAD_TOKEN"
Connect-ServiceFabricCluster \`
    -ConnectionEndpoint ${host}:${port} \`
    -AzureActiveDirectory \`
    -SecurityToken $token \`
    -ServerCertThumbprint $serverCertThumbprint
\`\`\`

---

### Method 4: Windows Authentication (Domain-Joined)

\`\`\`powershell
# Connect using Windows credentials (Kerberos/NTLM)
Connect-ServiceFabricCluster \`
    -ConnectionEndpoint ${host}:${port} \`
    -WindowsCredential

# Or with specific credentials
$credential = Get-Credential
Connect-ServiceFabricCluster \`
    -ConnectionEndpoint ${host}:${port} \`
    -WindowsCredential \`
    -Credential $credential
\`\`\`

---

## 🔍 Connection Troubleshooting

### Check Cluster Connectivity

\`\`\`powershell
# Test TCP connectivity
Test-NetConnection -ComputerName ${host} -Port ${port}

# Check if port is listening
(Test-NetConnection -ComputerName ${host} -Port ${port}).TcpTestSucceeded

# Verify DNS resolution
Resolve-DnsName ${host}
\`\`\`

### Certificate Issues

\`\`\`powershell
# List all certificates in store
Get-ChildItem -Path Cert:\\CurrentUser\\My | Format-Table Subject, Thumbprint, NotAfter

# Check certificate details
$cert = Get-Item Cert:\\CurrentUser\\My\\YOUR_THUMBPRINT
$cert | Format-List *

# Verify certificate has private key
$cert.HasPrivateKey

# Check certificate validity
$cert.NotBefore
$cert.NotAfter

# Verify certificate chain
$chain = New-Object System.Security.Cryptography.X509Certificates.X509Chain
$chain.Build($cert)
$chain.ChainStatus
\`\`\`

### Common Connection Errors

#### Error: "Certificate does not have private key"

\`\`\`powershell
# Solution: Import certificate with private key
Import-PfxCertificate -FilePath "cert.pfx" \`
    -CertStoreLocation Cert:\\CurrentUser\\My \`
    -Password (ConvertTo-SecureString "password" -AsPlainText -Force)
\`\`\`

#### Error: "Thumbprint mismatch"

\`\`\`powershell
# Verify server certificate thumbprint
$endpoint = "${host}:${port}"
$request = [Net.HttpWebRequest]::Create("https://$endpoint")
try {
    $request.GetResponse()
} catch {
    $cert = $request.ServicePoint.Certificate
    $thumbprint = $cert.GetCertHashString()
    Write-Host "Server Certificate Thumbprint: $thumbprint"
}
\`\`\`

#### Error: "Cannot connect to cluster"

\`\`\`powershell
# Check if Service Fabric service is running (on remote node)
Invoke-Command -ComputerName ${host} -ScriptBlock {
    Get-Service FabricHostSvc, FabricGateway* | Format-Table
}

# Check firewall rules
Test-NetConnection -ComputerName ${host} -Port ${port} -InformationLevel Detailed

# Verify cluster manifest has correct endpoint
Get-ServiceFabricCluster | Select-Object -ExpandProperty ClientConnectionEndpoint
\`\`\`

---

## ✅ Verify Connection

\`\`\`powershell
# Check connection status
Get-ServiceFabricClusterConnection

# Get cluster health
Get-ServiceFabricClusterHealth

# List all nodes
Get-ServiceFabricNode

# Get cluster version
Get-ServiceFabricClusterManifest | Select-String "FabricVersion"
\`\`\`

---

## 📚 Additional Resources

- [Service Fabric PowerShell Reference](https://docs.microsoft.com/en-us/azure/service-fabric/service-fabric-deploy-remove-applications)
- [Cluster Security Best Practices](https://docs.microsoft.com/en-us/azure/service-fabric/service-fabric-cluster-security)
- [Certificate Management](https://docs.microsoft.com/en-us/azure/service-fabric/service-fabric-cluster-security-update-certs-azure)

---

*Generated by Service Fabric Cluster Explorer extension*
`;

        return markdown;
    }

    /**
     * Generate cluster diagnostics commands
     */
    static generateClusterDiagnostics(clusterEndpoint: string, nodeNames?: string[], applicationNames?: string[]): string {
        const exampleNode = nodeNames && nodeNames.length > 0 ? nodeNames[0] : '_Node_0';
        const exampleApp = applicationNames && applicationNames.length > 0 ? applicationNames[0] : 'fabric:/MyApp';
        
        return `# 🔍 Service Fabric Cluster Diagnostics

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## 📊 Cluster Health & Status

\`\`\`powershell
# Get overall cluster health
Get-ServiceFabricClusterHealth

# Get detailed cluster health with events
Get-ServiceFabricClusterHealth -EventsFilter Error,Warning

# Check if cluster is upgrading
Get-ServiceFabricClusterUpgrade

# Get cluster configuration
Get-ServiceFabricClusterConfiguration

# Get cluster manifest (XML)
Get-ServiceFabricClusterManifest

# Get cluster load information
Get-ServiceFabricClusterLoadInformation
\`\`\`

---

## 🖥️ Node Diagnostics

\`\`\`powershell
# List all nodes
Get-ServiceFabricNode | Format-Table NodeName, NodeType, NodeStatus, HealthState

# Get specific node details
Get-ServiceFabricNode -NodeName "${exampleNode}"

# Check node health
Get-ServiceFabricNodeHealth -NodeName "${exampleNode}"

# Get node load information
Get-ServiceFabricNodeLoadInformation -NodeName "${exampleNode}"

# List deactivated nodes
Get-ServiceFabricNode | Where-Object { $_.NodeDeactivationInfo -ne $null }

# Check node up/down history
Get-ServiceFabricNode | Select-Object NodeName, NodeUpTime, NodeDownTime
\`\`\`

---

## 📦 Application Diagnostics

\`\`\`powershell
# List all applications
Get-ServiceFabricApplication

# Get application health${applicationNames && applicationNames.length > 0 ? ` (example with real application)` : ''}
Get-ServiceFabricApplicationHealth -ApplicationName "${exampleApp}"

# List application types
Get-ServiceFabricApplicationType

# Check application upgrade status
Get-ServiceFabricApplicationUpgrade -ApplicationName "${exampleApp}"

# Get deployed applications on a node
Get-ServiceFabricDeployedApplication -NodeName "${exampleNode}"

# Get application manifest
Get-ServiceFabricApplicationManifest -ApplicationTypeName "MyAppType" -ApplicationTypeVersion "1.0.0"
\`\`\`

---

## 🔧 Service Diagnostics

\`\`\`powershell
# List all services in an application
Get-ServiceFabricService -ApplicationName "${exampleApp}"

# Get service health
Get-ServiceFabricServiceHealth -ServiceName "${exampleApp}/MyService"

# Get service description
Get-ServiceFabricServiceDescription -ServiceName "${exampleApp}/MyService"

# Get service partitions
Get-ServiceFabricPartition -ServiceName "${exampleApp}/MyService"

# Get partition health
Get-ServiceFabricPartitionHealth -PartitionId "partition-guid"

# Get replicas
Get-ServiceFabricReplica -PartitionId "partition-guid"
\`\`\`

---

## 🩺 Health Events

\`\`\`powershell
# Get cluster health events
(Get-ServiceFabricClusterHealth).HealthEvents | 
    Where-Object { $_.HealthInformation.HealthState -ne 'Ok' } |
    Format-Table SourceId, Property, HealthState, Description -AutoSize

# Get node health events${nodeNames && nodeNames.length > 0 ? ` (checking real nodes)` : ''}
Get-ServiceFabricNode | ForEach-Object {
    $node = $_.NodeName
    $health = Get-ServiceFabricNodeHealth -NodeName $node
    $health.HealthEvents | Where-Object { $_.HealthInformation.HealthState -ne 'Ok' } |
        Select-Object @{N='Node';E={$node}}, SourceId, Property, HealthState, Description
}

# Get application health events (warning/error only)
Get-ServiceFabricApplication | ForEach-Object {
    $appName = $_.ApplicationName
    $health = Get-ServiceFabricApplicationHealth -ApplicationName $appName
    $health.HealthEvents | Where-Object { $_.HealthInformation.HealthState -ne 'Ok' } |
        Select-Object @{N='Application';E={$appName}}, SourceId, Property, HealthState
}
\`\`\`

---

## 🔄 Performance & Load

\`\`\`powershell
# Get cluster resource usage
Get-ServiceFabricClusterLoadInformation | Format-List

# Get metrics for all nodes
Get-ServiceFabricNode | ForEach-Object {
    $nodeName = $_.NodeName
    Write-Host "\\n=== $nodeName ===" -ForegroundColor Cyan
    Get-ServiceFabricNodeLoadInformation -NodeName $nodeName |
        Select-Object -ExpandProperty NodeLoadMetricInformation
}

# Check partition load
Get-ServiceFabricService -ApplicationName "${exampleApp}" | ForEach-Object {
    $serviceName = $_.ServiceName
    Get-ServiceFabricPartition -ServiceName $serviceName | ForEach-Object {
        Get-ServiceFabricPartitionLoadInformation -PartitionId $_.PartitionId
    }
}
\`\`\`

---

## 🚨 Troubleshooting Commands

### Check for Stuck Upgrades

\`\`\`powershell
# Check cluster upgrade status
$upgrade = Get-ServiceFabricClusterUpgrade
if ($upgrade.UpgradeState -eq 'RollingBackInProgress' -or 
    $upgrade.UpgradeState -eq 'Failed') {
    Write-Host "⚠️ Cluster upgrade is stuck!" -ForegroundColor Red
    $upgrade | Format-List
}
\`\`\`

### Find Unhealthy Entities

\`\`\`powershell
# Find all unhealthy nodes
Get-ServiceFabricNode | Where-Object { $_.HealthState -ne 'Ok' } |
    Format-Table NodeName, NodeStatus, HealthState, NodeDeactivationInfo

# Find unhealthy applications
Get-ServiceFabricApplication | Where-Object { $_.HealthState -ne 'Ok' } |
    Format-Table ApplicationName, ApplicationStatus, HealthState

# Find partitions with replica issues
Get-ServiceFabricApplication | ForEach-Object {
    Get-ServiceFabricService -ApplicationName $_.ApplicationName | ForEach-Object {
        Get-ServiceFabricPartition -ServiceName $_.ServiceName |
            Where-Object { $_.PartitionStatus -ne 'Ready' -or $_.HealthState -ne 'Ok' }
    }
} | Format-Table ServiceName, PartitionId, PartitionStatus, HealthState
\`\`\`

### Check System Services

\`\`\`powershell
# Get all system services health
Get-ServiceFabricService -ApplicationName "fabric:/System" |
    ForEach-Object {
        $health = Get-ServiceFabricServiceHealth -ServiceName $_.ServiceName
        [PSCustomObject]@{
            ServiceName = $_.ServiceName
            HealthState = $health.AggregatedHealthState
            Status = $_.ServiceStatus
        }
    } | Format-Table -AutoSize
\`\`\`

### Network Connectivity Test${nodeNames && nodeNames.length > 0 ? ` (with your cluster nodes)` : ''}

\`\`\`powershell
# Test connectivity between nodes (run on each node)
${nodeNames && nodeNames.length > 0 ? `$nodes = @(${nodeNames.slice(0, 5).map(n => `"${n}"`).join(', ')})` : `$nodes = Get-ServiceFabricNode | Select-Object -ExpandProperty NodeName`}

foreach ($node in $nodes) {
    Write-Host "Testing connection to $node..." -ForegroundColor Yellow
    Test-Connection -ComputerName $node -Count 1 -Quiet
}
\`\`\`

---

## 📈 Export Diagnostics

\`\`\`powershell
# Export full cluster state to file
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$outputPath = "C:\\Temp\\SF_Diagnostics_$timestamp"
New-Item -ItemType Directory -Path $outputPath -Force

# Export cluster health
Get-ServiceFabricClusterHealth | 
    ConvertTo-Json -Depth 10 | 
    Out-File "$outputPath\\ClusterHealth.json"

# Export node information
Get-ServiceFabricNode | 
    Select-Object * | 
    ConvertTo-Json -Depth 5 | 
    Out-File "$outputPath\\Nodes.json"

# Export application information
Get-ServiceFabricApplication | 
    ConvertTo-Json -Depth 5 | 
    Out-File "$outputPath\\Applications.json"

# Export cluster manifest
Get-ServiceFabricClusterManifest | 
    Out-File "$outputPath\\ClusterManifest.xml"

Write-Host "✅ Diagnostics exported to: $outputPath" -ForegroundColor Green
\`\`\`

---

*Generated by Service Fabric Cluster Explorer extension*
`;
    }

    /**
     * Generate node management commands with real node names
     */
    static generateNodeCommands(clusterEndpoint: string, nodeNames: string[]): string {
        const exampleNode = nodeNames[0] || '_Node_0';
        
        return `# 🖥️ Service Fabric Node Management Commands

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## 📋 Available Nodes

${nodeNames.map((name, i) => `${i + 1}. \`${name}\``).join('\n')}

---

## 🔄 Node Lifecycle Operations

### Restart Node

\`\`\`powershell
# Restart a specific node (graceful restart)
$nodeName = "${exampleNode}"
$nodeInstanceId = (Get-ServiceFabricNode -NodeName $nodeName).NodeInstanceId

Restart-ServiceFabricNode \`
    -NodeName $nodeName \`
    -NodeInstanceId $nodeInstanceId \`
    -CommandCompletionMode Verify

# Verify node is back up
Get-ServiceFabricNode -NodeName $nodeName
\`\`\`

### Disable Node (Deactivate)

\`\`\`powershell
# Deactivate node for maintenance (moves replicas off node)
Disable-ServiceFabricNode \`
    -NodeName "${exampleNode}" \`
    -Intent RemoveData \`
    -Force

# Intent options:
# - Pause: Short maintenance, keeps data
# - Restart: Node will restart, keeps data
#-RemoveData: Long maintenance, moves all data off
# - RemoveNode: Permanently removing node

# Check deactivation status
Get-ServiceFabricNode -NodeName "${exampleNode}" | 
    Select-Object NodeName, NodeStatus, NodeDeactivationInfo
\`\`\`

### Enable Node (Reactivate)

\`\`\`powershell
# Re-activate a deactivated node
Enable-ServiceFabricNode -NodeName "${exampleNode}"

# Verify node is active
Get-ServiceFabricNode -NodeName "${exampleNode}"
\`\`\`

### Remove Node State

\`\`\`powershell
# Remove node from cluster (permanent)
# ⚠️ WARNING: Only use if node is down and not coming back

$nodeName = "${exampleNode}"

# First disable the node
Disable-ServiceFabricNode -NodeName $nodeName -Intent RemoveNode -Force

# Wait for deactivation to complete
do {
    $node = Get-ServiceFabricNode -NodeName $nodeName
    Start-Sleep -Seconds 5
} while ($node.NodeDeactivationInfo.Status -ne 'Completed')

# Remove the node state
Remove-ServiceFabricNodeState -NodeName $nodeName -Force
\`\`\`

---

## 📊 Node Monitoring

### Get Node Status

\`\`\`powershell
# Get detailed node information
Get-ServiceFabricNode -NodeName "${exampleNode}" | Format-List *

# Get node health
Get-ServiceFabricNodeHealth -NodeName "${exampleNode}"

# Get node load information
Get-ServiceFabricNodeLoadInformation -NodeName "${exampleNode}"
\`\`\`

### Monitor All Nodes

\`\`\`powershell
# Get status of all nodes
Get-ServiceFabricNode | 
    Format-Table NodeName, NodeType, NodeStatus, HealthState, IpAddressOrFQDN -AutoSize

# Find nodes that are down
Get-ServiceFabricNode | 
    Where-Object { $_.NodeStatus -ne 'Up' } |
    Format-Table NodeName, NodeStatus, HealthState

# Find nodes with health issues
Get-ServiceFabricNode | 
    Where-Object { $_.HealthState -ne 'Ok' } |
    Format-Table NodeName, NodeStatus, HealthState
\`\`\`

### Check Deployed Applications on Node

\`\`\`powershell
# List all applications deployed on a node
Get-ServiceFabricDeployedApplication -NodeName "${exampleNode}" |
    Format-Table ApplicationName, ApplicationTypeName, Status

# Get deployed service packages
Get-ServiceFabricDeployedApplication -NodeName "${exampleNode}" | ForEach-Object {
    Get-ServiceFabricDeployedServicePackage \`
        -NodeName "${exampleNode}" \`
        -ApplicationName $_.ApplicationName
}
\`\`\`

---

## 🔧 Troubleshooting Node Issues

### Node Won't Start

\`\`\`powershell
# Check Service Fabric services on the node (run locally on node)
Get-Service FabricHostSvc, Fabric* | Format-Table Name, Status, StartType

# Check event logs
Get-EventLog -LogName Application -Source "ServiceFabric*" -Newest 50 |
    Format-Table TimeGenerated, EntryType, Message -AutoSize

# Check SF traces (on the node)
Get-ChildItem "C:\\ProgramData\\SF\\Log\\Traces" -Recurse -Filter "*.etl" |
    Sort-Object LastWriteTime -Descending | Select-Object -First 5
\`\`\`

### Node Stuck in Deactivation

\`\`\`powershell
# Check what's preventing deactivation
$node = Get-ServiceFabricNode -NodeName "${exampleNode}"
$node.NodeDeactivationInfo

# Get replicas still on the node
Get-ServiceFabricDeployedReplica -NodeName "${exampleNode}" |
    Format-Table ServiceName, PartitionId, ReplicaRole, ReplicaStatus

# Force remove stuck replicas (⚠️ use with caution)
Get-ServiceFabricDeployedReplica -NodeName "${exampleNode}" | ForEach-Object {
    Remove-ServiceFabricReplica \`
        -NodeName "${exampleNode}" \`
        -PartitionId $_.PartitionId \`
        -ReplicaOrInstanceId $_.ReplicaId \`
        -Force
}
\`\`\`

### Node Performance Issues

\`\`\`powershell
# Get node resource usage
Get-ServiceFabricNodeLoadInformation -NodeName "${exampleNode}" |
    Select-Object -ExpandProperty NodeLoadMetricInformation |
    Format-Table Name, NodeCapacity, NodeLoad, NodeRemainingCapacity

# Get busiest replicas on node
Get-ServiceFabricDeployedReplica -NodeName "${exampleNode}" |
    Sort-Object -Property @{Expression={$_.ReconfigurationInformation.PreviousConfigurationRole}} -Descending |
    Select-Object -First 10 |
    Format-Table ServiceName, PartitionId, ReplicaRole
\`\`\`

---

## 🧹 Batch Operations

### Restart All Nodes (Rolling)

\`\`\`powershell
# Restart all nodes one at a time with safety checks
$nodes = Get-ServiceFabricNode | Where-Object { $_.NodeStatus -eq 'Up' }

foreach ($node in $nodes) {
    Write-Host "Restarting node: $($node.NodeName)" -ForegroundColor Yellow
    
    # Restart node
    Restart-ServiceFabricNode \`
        -NodeName $node.NodeName \`
        -NodeInstanceId $node.NodeInstanceId \`
        -CommandCompletionMode Verify
    
    # Wait for node to be healthy
    do {
        Start-Sleep -Seconds 10
        $nodeStatus = Get-ServiceFabricNode -NodeName $node.NodeName
    } while ($nodeStatus.NodeStatus -ne 'Up')
    
    Write-Host "✅ Node $($node.NodeName) is back up" -ForegroundColor Green
    
    # Wait for cluster to stabilize
    Start-Sleep -Seconds 30
}
\`\`\`

### Disable All Nodes by Type

\`\`\`powershell
# Disable all nodes of a specific type (e.g., for maintenance)
$nodeType = "NodeType0"

Get-ServiceFabricNode | 
    Where-Object { $_.NodeType -eq $nodeType } |
    ForEach-Object {
        Write-Host "Disabling $($_.NodeName)..." -ForegroundColor Yellow
        Disable-ServiceFabricNode -NodeName $_.NodeName -Intent Pause
    }
\`\`\`

---

*Generated by Service Fabric Cluster Explorer extension*
`;
    }

    /**
     * Generate application management commands
     */
    static generateApplicationCommands(clusterEndpoint: string, applicationNames?: string[]): string {
        const exampleApp = applicationNames && applicationNames.length > 0 ? applicationNames[0] : 'fabric:/MyApp';
        const hasRealApps = applicationNames && applicationNames.length > 0;
        
        return `# 📦 Service Fabric Application Management Commands

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}${hasRealApps ? `\n\n**Your Applications:** ${applicationNames?.slice(0, 5).map(a => `\`${a}\``).join(', ')}${applicationNames && applicationNames.length > 5 ? ` ... and ${applicationNames.length - 5} more` : ''}` : ''}

---

## 📥 Application Deployment

### Upload Application Package

\`\`\`powershell
# Copy application package to image store
$appPackagePath = "C:\\MyApp\\pkg"
$imageStoreConnectionString = "fabric:ImageStore"
$appPackageName = "MyAppType"

Copy-ServiceFabricApplicationPackage \`
    -ApplicationPackagePath $appPackagePath \`
    -ImageStoreConnectionString $imageStoreConnectionString \`
    -ApplicationPackagePathInImageStore $appPackageName

# Verify package was uploaded
Get-ServiceFabricImageStoreContent -RemoteLocation $appPackageName
\`\`\`

### Register Application Type

\`\`\`powershell
# Register application type from image store
Register-ServiceFabricApplicationType \`
    -ApplicationPathInImageStore "MyAppType" \`
    -Async

# Wait for registration to complete
do {
    Start-Sleep -Seconds 5
    $appType = Get-ServiceFabricApplicationType -ApplicationTypeName "MyAppType"
} while ($appType.Status -ne 'Available')

# Verify registration
Get-ServiceFabricApplicationType -ApplicationTypeName "MyAppType"

# Clean up image store after registration
Remove-ServiceFabricApplicationPackage \`
    -ImageStoreConnectionString "fabric:ImageStore" \`
    -ApplicationPackagePathInImageStore "MyAppType"
\`\`\`

### Create Application Instance

\`\`\`powershell
# Create new application instance
New-ServiceFabricApplication \`
    -ApplicationName "fabric:/MyApp" \`
    -ApplicationTypeName "MyAppType" \`
    -ApplicationTypeVersion "1.0.0"

# Create with application parameters
$appParams = @{
    "InstanceCount" = "3"
    "MinReplicaSetSize" = "2"
    "TargetReplicaSetSize" = "3"
}

New-ServiceFabricApplication \`
    -ApplicationName "fabric:/MyApp" \`
    -ApplicationTypeName "MyAppType" \`
    -ApplicationTypeVersion "1.0.0" \`
    -ApplicationParameter $appParams

# Verify application created
Get-ServiceFabricApplication -ApplicationName "fabric:/MyApp"
\`\`\`

---

## 🚀 Application Upgrades

### Start Application Upgrade${hasRealApps ? ` (example with your application)` : ''}

\`\`\`powershell
# Upload and register new version first
Copy-ServiceFabricApplicationPackage \`
    -ApplicationPackagePath "C:\\MyApp\\pkg_v2" \`
    -ImageStoreConnectionString "fabric:ImageStore" \`
    -ApplicationPackagePathInImageStore "MyAppType_v2"

Register-ServiceFabricApplicationType \`
    -ApplicationPathInImageStore "MyAppType_v2"

# Start monitored upgrade
$upgradeParams = @{
    "ParameterName" = "NewValue"
}

Start-ServiceFabricApplicationUpgrade \`
    -ApplicationName "${exampleApp}" \`
    -ApplicationTypeVersion "2.0.0" \`
    -ApplicationParameter $upgradeParams \`
    -Monitored \`
    -FailureAction Rollback \`
    -UpgradeReplicaSetCheckTimeoutSec 600 \`
    -HealthCheckStableDurationSec 60

# Monitor upgrade progress
Get-ServiceFabricApplicationUpgrade -ApplicationName "${exampleApp}"
\`\`\`

### Monitor Upgrade Progress

\`\`\`powershell
# Watch upgrade status
do {
    $upgrade = Get-ServiceFabricApplicationUpgrade -ApplicationName "${exampleApp}"
    Write-Host "\\rUpgrade Status: $($upgrade.UpgradeState) - UD: $($upgrade.CurrentUpgradeDomainProgress.UpgradeDomainName)" -NoNewline
    Start-Sleep -Seconds 2
} while ($upgrade.UpgradeState -eq 'RollingForwardInProgress')

Write-Host "\\n✅ Upgrade completed: $($upgrade.UpgradeState)"
\`\`\`

### Rollback Upgrade

\`\`\`powershell
# Rollback application upgrade
Start-ServiceFabricApplicationRollback -ApplicationName "${exampleApp}"

# Force rollback (skip health checks)
Start-ServiceFabricApplicationRollback \`
    -ApplicationName "${exampleApp}" \`
    -Force
\`\`\`

### Resume Failed Upgrade

\`\`\`powershell
# Resume a paused or failed upgrade
Resume-ServiceFabricApplicationUpgrade \`
    -ApplicationName "${exampleApp}" \`
    -UpgradeDomainName "UD1"
\`\`\`

---

## 🗑️ Application Removal

### Delete Application Instance

\`\`\`powershell
# Remove application instance
Remove-ServiceFabricApplication \`
    -ApplicationName "${exampleApp}" \`
    -Force

# Wait for deletion
do {
    Start-Sleep -Seconds 2
    $app = Get-ServiceFabricApplication -ApplicationName "${exampleApp}" -ErrorAction SilentlyContinue
} while ($null -ne $app)
\`\`\`

### Unregister Application Type

\`\`\`powershell
# Unregister application type version
Unregister-ServiceFabricApplicationType \`
    -ApplicationTypeName "MyAppType" \`
    -ApplicationTypeVersion "1.0.0" \`
    -Force

# Unregister all versions
Get-ServiceFabricApplicationType -ApplicationTypeName "MyAppType" | 
    ForEach-Object {
        Unregister-ServiceFabricApplicationType \`
            -ApplicationTypeName $_.ApplicationTypeName \`
            -ApplicationTypeVersion $_.ApplicationTypeVersion \`
            -Force
    }
\`\`\`

---

## 📊 Application Monitoring${hasRealApps ? ` (using your applications)` : ''}

### Get Application Health

\`\`\`powershell
# Get application health summary
Get-ServiceFabricApplicationHealth -ApplicationName "${exampleApp}"

# Get detailed health with events
Get-ServiceFabricApplicationHealth \`
    -ApplicationName "${exampleApp}" \`
    -EventsFilter Error,Warning \`
    -ServicesFilter Error,Warning

# Export health report
Get-ServiceFabricApplicationHealth -ApplicationName "${exampleApp}" |
    ConvertTo-Json -Depth 10 |
    Out-File "C:\\Temp\\AppHealth.json"
\`\`\`

### Monitor Application Metrics

\`\`\`powershell
# Get application load information
Get-ServiceFabricApplication -ApplicationName "${exampleApp}" |
    Format-List ApplicationName, HealthState, Status

# Get service load for all services in app
Get-ServiceFabricService -ApplicationName "${exampleApp}" | ForEach-Object {
    $serviceName = $_.ServiceName
    Write-Host "\\n=== $serviceName ===" -ForegroundColor Cyan
    
    Get-ServiceFabricPartition -ServiceName $serviceName | ForEach-Object {
        Get-ServiceFabricPartitionLoadInformation -PartitionId $_.PartitionId
    }
}
\`\`\`${hasRealApps ? `

### Check All Your Applications

\`\`\`powershell
# List all your applications with health status
${applicationNames?.slice(0, 10).map(app => `Get-ServiceFabricApplicationHealth -ApplicationName "${app}"`).join('\n')}
\`\`\`` : ''}

---

## 🔧 Troubleshooting

### Find Applications with Issues

\`\`\`powershell
# Find unhealthy applications
Get-ServiceFabricApplication | 
    Where-Object { $_.HealthState -ne 'Ok' } |
    Format-Table ApplicationName, ApplicationStatus, HealthState

# Get detailed health evaluation
Get-ServiceFabricApplication | 
    Where-Object { $_.HealthState -ne 'Ok' } |
    ForEach-Object {
        $health = Get-ServiceFabricApplicationHealth -ApplicationName $_.ApplicationName
        [PSCustomObject]@{
            ApplicationName = $_.ApplicationName
            HealthState = $health.AggregatedHealthState
            UnhealthyEvaluations = $health.UnhealthyEvaluations
        }
    }
\`\`\`

### Check Deployment Status

\`\`\`powershell
# Check where application is deployed
$appName = "${exampleApp}"
Get-ServiceFabricNode | ForEach-Object {
    $nodeName = $_.NodeName
    $deployed = Get-ServiceFabricDeployedApplication -NodeName $nodeName |
        Where-Object { $_.ApplicationName -eq $appName }
    
    if ($deployed) {
        [PSCustomObject]@{
            NodeName = $nodeName
            ApplicationName = $deployed.ApplicationName
            Status = $deployed.Status
            WorkDirectory = $deployed.WorkDirectory
        }
    }
} | Format-Table -AutoSize
\`\`\`

### Fix Stuck Upgrade

\`\`\`powershell
# Check upgrade status
$upgrade = Get-ServiceFabricApplicationUpgrade -ApplicationName "${exampleApp}"
$upgrade

# Update upgrade to use unmonitored manual mode
Update-ServiceFabricApplicationUpgrade \`
    -ApplicationName "${exampleApp}" \`
    -UpgradeMode UnmonitoredManual

# Manually proceed to next upgrade domain
Resume-ServiceFabricApplicationUpgrade \`
    -ApplicationName "${exampleApp}" \`
    -UpgradeDomainName "UD2"
\`\`\`

---

*Generated by Service Fabric Cluster Explorer extension*
`;
    }

}
