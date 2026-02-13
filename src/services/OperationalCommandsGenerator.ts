import * as vscode from 'vscode';
import { SfUtility, debugLevel } from '../sfUtility';

/**
 * Operational commands generator for Service Fabric
 * Generates comprehensive guides for cluster operations, app lifecycle, chaos testing, backups, etc.
 */
export class OperationalCommandsGenerator {
    
    /**
     * Strip protocol from endpoint to avoid double http/https in curl commands
     * @param endpoint - Cluster endpoint (may include protocol)
     * @returns Endpoint without protocol
     */
    private static stripProtocol(endpoint: string): string {
        return endpoint.replace(/^https?:\/\//, '');
    }
    
    // ==================== CLUSTER OPERATIONS ====================
    
    static generateStartClusterUpgrade(clusterEndpoint: string, nodes: any[]): string {
        const cleanEndpoint = this.stripProtocol(clusterEndpoint);
        const nodeList = nodes.map(n => `- ${n.name} (${n.type})`).join('\n');
        
        return `# 🚀 Start Cluster Upgrade

**Cluster:** \`${clusterEndpoint}\`  
**Nodes:** ${nodes.length}  
**Generated:** ${new Date().toLocaleString()}

---

## 📋 Overview

Cluster upgrades update the Service Fabric runtime version on all nodes. This is a rolling upgrade process that maintains cluster availability.

**🎯 Key Concepts:**
- **Rolling Upgrade**: Upgrades one upgrade domain at a time
- **Health Monitoring**: Automatic rollback on health policy violations
- **Safety Checks**: Ensures quorum and data safety before proceeding
- **Upgrade Modes**: Monitored (automatic), UnmonitoredAuto, UnmonitoredManual

---

## 🏗️ Your Cluster Nodes

\`\`\`
${nodeList}
\`\`\`

---

## 🔨 PowerShell Commands

### Check Current Version

\`\`\`powershell
# Get current cluster version
Get-ServiceFabricClusterManifest | Select-String "CodeVersion"
(Get-ServiceFabricClusterHealth).NodeHealthStates | 
    Select Name, @{N='Version';E={Get-ServiceFabricNode -NodeName $_.NodeName | Select-Object -ExpandProperty CodeVersion}}

# Check available versions
Get-ServiceFabricRegisteredClusterCodeVersion
\`\`\`

📚 **Reference:** [Get-ServiceFabricClusterManifest](https://learn.microsoft.com/powershell/module/servicefabric/get-servicefabricclustermanifest)

### Start Monitored Upgrade (Recommended)

\`\`\`powershell
# Start cluster upgrade with automatic health monitoring
$targetVersion = "9.1.1583.9590"  # Update to your target version

Start-ServiceFabricClusterUpgrade \`
    -Code \`
    -CodePackageVersion $targetVersion \`
    -Monitored \`
    -FailureAction Rollback \`
    -UpgradeReplicaSetCheckTimeoutSec 30

# Monitor upgrade progress
Get-ServiceFabricClusterUpgrade
Watch-ServiceFabricClusterUpgrade
\`\`\`

📚 **Reference:** [Start-ServiceFabricClusterUpgrade](https://learn.microsoft.com/powershell/module/servicefabric/start-servicefabricclusterupgrade)

### Start Unmonitored Auto Upgrade

\`\`\`powershell
# Upgrade without automatic health checks (use with caution)
Start-ServiceFabricClusterUpgrade \`
    -Code \`
    -CodePackageVersion $targetVersion \`
    -UnmonitoredAuto

# Must manually monitor progress
Get-ServiceFabricClusterUpgrade | fl *
\`\`\`

### Advanced: Update Both Code and Config

\`\`\`powershell
# Upgrade both runtime version and configuration
$configVersion = "2.0.0"

Start-ServiceFabricClusterUpgrade \`
    -Code \`
    -Config \`
    -CodePackageVersion $targetVersion \`
    -ConfigVersion $configVersion \`
    -Monitored \`
    -FailureAction Rollback \`
    -HealthCheckRetryTimeoutSec 600 \`
    -HealthCheckStableDurationSec 120 \`
    -UpgradeDomainTimeoutSec 2400 \`
    -UpgradeTimeoutSec 7200

# Watch upgrade domain by domain
Watch-ServiceFabricClusterUpgrade -TimeoutSec 7200
\`\`\`

---

## 🌐 REST API Examples

### Check Current Version

\`\`\`bash
# Get cluster manifest (contains version info)
curl -k -X GET "https://${cleanEndpoint}/$/GetClusterManifest?api-version=6.0" \\
  --cert client.pem --key client.key

# Get cluster health
curl -k -X GET "https://${cleanEndpoint}/$/GetClusterHealth?api-version=6.0" \\
  --cert client.pem --key client.key
\`\`\`

### Start Cluster Upgrade

\`\`\`bash
# POST upgrade configuration
curl -k -X POST "https://${cleanEndpoint}/$/Upgrade?api-version=6.0" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json" \\
  -d '{
    "CodeVersion": "9.1.1583.9590",
    "UpgradeKind": "Rolling",
    "RollingUpgradeMode": "Monitored",
    "FailureAction": "Rollback",
    "ForceRestart": false,
    "UpgradeReplicaSetCheckTimeoutInSeconds": 30,
    "HealthCheckRetryTimeoutInMilliseconds": 600000,
    "HealthCheckStableDurationInMilliseconds": 120000,
    "UpgradeDomainTimeoutInMilliseconds": 2400000,
    "UpgradeTimeoutInMilliseconds": 7200000,
    "MonitoringPolicy": {
      "FailureAction": "Rollback",
      "HealthCheckWaitDurationInMilliseconds": 1000,
      "HealthCheckStableDurationInMilliseconds": 120000,
      "HealthCheckRetryTimeoutInMilliseconds": 600000,
      "UpgradeTimeoutInMilliseconds": 7200000,
      "UpgradeDomainTimeoutInMilliseconds": 2400000
    }
  }'

# Get upgrade progress
curl -k -X GET "https://${cleanEndpoint}/$/GetUpgradeProgress?api-version=6.0" \\
  --cert client.pem --key client.key
\`\`\`

---

## ⚠️ Safety & Best Practices

### Pre-Upgrade Checklist

1. **Backup**: Ensure recent backups of stateful services
2. **Health Check**: Verify cluster is healthy (\`Get-ServiceFabricClusterHealth\`)
3. **Capacity**: Ensure sufficient capacity for upgrades (N+1 nodes per UD)
4. **Testing**: Test upgrade in dev/staging environment first
5. **Downtime Window**: Plan for maintenance window (upgrades can take hours)
6. **Documentation**: Review release notes for target version

### During Upgrade

\`\`\`powershell
# Monitor upgrade progress continuously
while ((Get-ServiceFabricClusterUpgrade).UpgradeState -ne "RollingForwardCompleted") {
    $upgrade = Get-ServiceFabricClusterUpgrade
    Write-Host "⏳ Upgrade State: $($upgrade.UpgradeState)"
    Write-Host "📍 Current UD: $($upgrade.CurrentUpgradeDomainProgress.UpgradeDomainName)"
    Write-Host "✅ Completed UDs: $($upgrade.UpgradeDomainsProgress.Count)"
    Get-ServiceFabricClusterHealth | Select AggregatedHealthState
    Start-Sleep -Seconds 30
}
Write-Host "🎉 Upgrade completed successfully!"
\`\`\`

### Post-Upgrade Validation

\`\`\`powershell
# Verify all nodes upgraded
Get-ServiceFabricNode | Select NodeName, CodeVersion, HealthState | ft -AutoSize

# Check cluster health
Get-ServiceFabricClusterHealth | fl *

# Verify applications healthy
Get-ServiceFabricApplication | Select ApplicationName, ApplicationStatus, HealthState | ft -AutoSize

# Check for any warnings/errors
Get-ServiceFabricClusterHealth -EventsFilter Error,Warning
\`\`\`

---

## 🔄 Troubleshooting

### Upgrade Stuck

\`\`\`powershell
# Check what's blocking
$upgrade = Get-ServiceFabricClusterUpgrade
$upgrade.CurrentUpgradeDomainProgress
$upgrade.UpgradeDomainsProgress

# Check safety checks
Get-ServiceFabricClusterHealth -NodesFilter Error,Warning
Get-ServiceFabricNode | Where {$_.NodeStatus -ne "Up"} | ft -AutoSize

# Resume if manually paused
Resume-ServiceFabricClusterUpgrade -UpgradeDomainName "ud1"
\`\`\`

### Force Progress (Dangerous)

\`\`\`powershell
# Skip health checks (use only as last resort)
Update-ServiceFabricClusterUpgrade -UpgradeReplicaSetCheckTimeoutSec 1

# Or switch to unmonitored mode
Update-ServiceFabricClusterUpgrade -UpgradeMode UnmonitoredAuto
\`\`\`

---

## 📚 Additional Resources

- [Service Fabric Cluster Upgrade](https://learn.microsoft.com/azure/service-fabric/service-fabric-cluster-upgrade)
- [Upgrade Configuration Options](https://learn.microsoft.com/azure/service-fabric/service-fabric-cluster-fabric-settings)
- [Understanding Health Evaluation](https://learn.microsoft.com/azure/service-fabric/service-fabric-health-introduction)
- [Troubleshooting Upgrade Failures](https://learn.microsoft.com/azure/service-fabric/service-fabric-cluster-upgrade#troubleshooting)

---

**⚡ Quick Reference:**
\`\`\`powershell
# Start upgrade
Start-ServiceFabricClusterUpgrade -Code -CodePackageVersion "9.1.1583.9590" -Monitored -FailureAction Rollback

# Monitor
Get-ServiceFabricClusterUpgrade
Watch-ServiceFabricClusterUpgrade

# Pause
Suspend-ServiceFabricClusterUpgrade

# Resume
Resume-ServiceFabricClusterUpgrade

# Rollback (if needed)
Start-ServiceFabricClusterRollback
\`\`\`
`;
    }
    
    static generateRollbackClusterUpgrade(clusterEndpoint: string): string {
        const cleanEndpoint = this.stripProtocol(clusterEndpoint);
        return `# ⏮️ Rollback Cluster Upgrade

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## 📋 Overview

Rollback returns the cluster to the previous version when an upgrade fails or encounters health policy violations.

**⚠️ Important:** Rollback is only available for monitored upgrades. Unmonitored upgrades must complete or be manually reverted.

---

## 🔨 PowerShell Commands

### Check if Rollback is Possible

\`\`\`powershell
# Get current upgrade state
$upgrade = Get-ServiceFabricClusterUpgrade
$upgrade | Select UpgradeState, RollingUpgradeMode, FailureAction

# Rollback only works in these states:
# - RollingForwardPending
# - RollingForwardInProgress
# And must be "Monitored" mode
\`\`\`

📚 **Reference:** [Get-ServiceFabricClusterUpgrade](https://learn.microsoft.com/powershell/module/servicefabric/get-servicefabricclusterupgrade)

### Initiate Rollback

\`\`\`powershell
# Start the rollback process
Start-ServiceFabricClusterRollback

# Monitor rollback progress
Watch-ServiceFabricClusterUpgrade -TimeoutSec 3600

# Verify rollback completion
Get-ServiceFabricClusterUpgrade | fl *
\`\`\`

📚 **Reference:** [Start-ServiceFabricClusterRollback](https://learn.microsoft.com/powershell/module/servicefabric/start-servicefabricclusterrollback)

### Verify After Rollback

\`\`\`powershell
# Check all nodes back to previous version
Get-ServiceFabricNode | Select NodeName, CodeVersion, HealthState | ft -AutoSize

# Verify cluster health
Get-ServiceFabricClusterHealth

# Check for lingering issues
Get-ServiceFabricClusterHealth -EventsFilter Error,Warning
\`\`\`

---

## 🌐 REST API Examples

### Check Upgrade Status

\`\`\`bash
curl -k -X GET "https://${cleanEndpoint}/$/GetUpgradeProgress?api-version=6.0" \\
  --cert client.pem --key client.key
\`\`\`

### Initiate Rollback

\`\`\`bash
curl -k -X POST "https://${cleanEndpoint}/$/Rollback?api-version=6.0" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json"
\`\`\`

---

## 📚 Additional Resources

- [Cluster Upgrade Rollback](https://learn.microsoft.com/azure/service-fabric/service-fabric-cluster-upgrade#upgrade-rollback)
- [Troubleshooting Cluster Upgrades](https://learn.microsoft.com/azure/service-fabric/service-fabric-cluster-upgrade-troubleshooting)
`;
    }
    
    static generateUpdateClusterConfig(clusterEndpoint: string): string {
        const cleanEndpoint = this.stripProtocol(clusterEndpoint);
        return `# ⚙️ Update Cluster Configuration

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## 📋 Overview

Configuration-only upgrades update cluster settings without changing the Service Fabric runtime version.

**Common Configuration Changes:**
- 📊 Performance settings (timeouts, thresholds)
- 🔐 Security policies
- 🌐 Network settings  
- 📈 Diagnostics and monitoring
- 🎯 Placement constraints

---

## 🔨 PowerShell Commands

### Get Current Configuration

\`\`\`powershell
# Download current manifest
$manifest = Get-ServiceFabricClusterManifest
$manifest | Out-File -FilePath "ClusterManifest_Current.xml"

# View specific section
$manifest | Select-String -Pattern "FabricSettings" -Context 10,10
\`\`\`

📚 **Reference:** [Get-ServiceFabricClusterManifest](https://learn.microsoft.com/powershell/module/servicefabric/get-servicefabricclustermanifest)

### Update Configuration (Standalone Clusters)

\`\`\`powershell
# 1. Modify your ClusterConfig.json
$configPath = "C:\\ClusterConfig.json"

# 2. Test configuration (optional but recommended)
Test-ServiceFabricClusterManifest -ClusterManifestPath $configPath

# 3. Start configuration upgrade
Start-ServiceFabricClusterConfigurationUpgrade -ClusterConfigPath $configPath

# 4. Monitor progress
Get-ServiceFabricClusterConfigurationUpgradeStatus
\`\`\`

📚 **Reference:** [Start-ServiceFabricClusterConfigurationUpgrade](https://learn.microsoft.com/powershell/module/servicefabric/start-servicefabricclusterconfigurationupgrade)

### Common Configuration Updates

#### Update Diagnostics Settings

\`\`\`json
{
  "name": "Diagnostics",
  "parameters": [
    {
      "name": "MaxDiskQuotaInMB",
      "value": "10240"
    },
    {
      "name": "EnableCircularTraceSession",
      "value": "true"
    }
  ]
}
\`\`\`

#### Update Performance Settings

\`\`\`json
{
  "name": "FailoverManager",
  "parameters": [
    {
      "name": "ExpectedClusterSize",
      "value": "10"
    },
    {
      "name": "PlacementTimeLimit",
      "value": "600"
    }
  ]
}
\`\`\`

---

## 🌐 REST API (Azure/SFRP Only)

\`\`\`bash
# Update configuration via ARM template
az resource update \\
  --resource-type "Microsoft.ServiceFabric/clusters" \\
  --name "mycluster" \\
  --resource-group "myResourceGroup" \\
  --set properties.fabricSettings[0].name="Diagnostics" \\
  --set properties.fabricSettings[0].parameters[0].name="MaxDiskQuotaInMB" \\
  --set properties.fabricSettings[0].parameters[0].value="10240"
\`\`\`

---

## ⚠️ Important Notes

1. **Azure Clusters**: Use Azure Portal or ARM templates
2. **Standalone Clusters**: Use PowerShell configuration upgrade
3. **Version Increment**: ConfigVersion must be incremented
4. **Validation**: Always test configuration before applying
5. **Rollback**: Keep previous working configuration for rollback

---

## 📚 Additional Resources

- [Customize Cluster Settings](https://learn.microsoft.com/azure/service-fabric/service-fabric-cluster-fabric-settings)
- [Configuration Upgrade](https://learn.microsoft.com/azure/service-fabric/service-fabric-cluster-config-upgrade-windows-server)
- [Fabric Settings Reference](https://learn.microsoft.com/azure/service-fabric/service-fabric-cluster-fabric-settings)
`;
    }
    
    static generateRecoverSystemPartitions(clusterEndpoint: string): string {
        const cleanEndpoint = this.stripProtocol(clusterEndpoint);
        return `# 🔧 Recover System Partitions

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## 📋 Overview

System partition recovery forces the cluster to rebuild system service partitions that are stuck in quorum loss.

**⚠️ DANGER:** This is a **last resort** operation that can cause **data loss**. Only use when:
- System services are in quorum loss
- Cluster is non-operational
- Normal recovery procedures have failed
- Data loss is acceptable

---

## 🔨 PowerShell Commands

### Check System Service Health

\`\`\`powershell
# Check system services status
Get-ServiceFabricApplication -ApplicationName "fabric:/System" | Get-ServiceFabricService
Get-ServiceFabricPartition -ServiceName "fabric:/System/ClusterManagerService"
Get-ServiceFabricPartition -ServiceName "fabric:/System/FailoverManagerService"

# Check for quorum loss
Get-ServiceFabricPartition | Where-Object {$_.PartitionStatus -eq "InQuorumLoss"} | ft -AutoSize
\`\`\`

📚 **Reference:** [Get-ServiceFabricPartition](https://learn.microsoft.com/powershell/module/servicefabric/get-servicefabricpartition)

### Recover Specific Partition

\`\`\`powershell
# Get partition ID
$partitionId = (Get-ServiceFabricPartition -ServiceName "fabric:/System/ClusterManagerService").PartitionId

# Force quorum loss recovery (DATA LOSS POSSIBLE)
Repair-ServiceFabricPartition -PartitionId $partitionId -Force

# Monitor recovery
while ((Get-ServiceFabricPartition -PartitionId $partitionId).PartitionStatus -ne "Ready") {
    Write-Host "⏳ Partition recovering..."
    Start-Sleep -Seconds 5
}
Write-Host "✅ Partition recovered"
\`\`\`

📚 **Reference:** [Repair-ServiceFabricPartition](https://learn.microsoft.com/powershell/module/servicefabric/repair-servicefabricpartition)

### Recover All System Partitions

\`\`\`powershell
# WARNING: This recovers ALL partitions in quorum loss
Repair-ServiceFabricCluster -System -Force

# Check cluster health after recovery
Get-ServiceFabricClusterHealth
\`\`\`

---

## 🌐 REST API Examples

### Recover Specific Partition

\`\`\`bash
# POST recovery request
curl -k -X POST "https://${cleanEndpoint}/$/RecoverPartition?api-version=6.0" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json" \\
  -d '{
    "PartitionId": "00000000-0000-0000-0000-000000000000"
  }'
\`\`\`

### Get Partition Status

\`\`\`bash
curl -k -X GET "https://${cleanEndpoint}/Partitions/{partitionId}?api-version=6.0" \\
  --cert client.pem --key client.key
\`\`\`

---

## ⚠️ Critical Safety Information

### When NOT to Use Recovery

❌ **DO NOT** use recovery if:
- Cluster is operational (even with warnings)
- Majority of replicas are available
- Only waiting for slow replicas
- Normal rebuild is in progress

### Pre-Recovery Checklist

1. **Verify Necessity**: Confirm partition is truly stuck (> 1 hour in quorum loss)
2. **Contact Support**: Consider Microsoft Support consultation
3. **Document State**: Capture current state for post-mortem
4. **Alert Stakeholders**: Notify that data loss may occur
5. **Last Resort**: Confirm no other recovery options

### Post-Recovery Actions

\`\`\`powershell
# 1. Verify cluster health
Get-ServiceFabricClusterHealth | fl *

# 2. Check all system services
Get-ServiceFabricApplication -ApplicationName "fabric:/System" | 
    Get-ServiceFabricService | 
    Select ServiceName, ServiceStatus, HealthState | ft -AutoSize

# 3. Verify applications
Get-ServiceFabricApplication | 
    Where-Object {$_.ApplicationName -ne "fabric:/System"} |
    Select ApplicationName, ApplicationStatus, HealthState | ft -AutoSize

# 4. Monitor for stability (30+ minutes)
$endTime = (Get-Date).AddMinutes(30)
while ((Get-Date) -lt $endTime) {
    $health = Get-ServiceFabricClusterHealth
    Write-Host "$((Get-Date).ToString('HH:mm:ss')) - Health: $($health.AggregatedHealthState)"
    Start-Sleep -Seconds 60
}
\`\`\`

---

## 📚 Additional Resources

- [Disaster Recovery in Service Fabric](https://learn.microsoft.com/azure/service-fabric/service-fabric-disaster-recovery)
- [Quorum Loss Recovery](https://learn.microsoft.com/azure/service-fabric/service-fabric-disaster-recovery#recovery-from-a-quorum-loss-scenario)
- [System Services Overview](https://learn.microsoft.com/azure/service-fabric/service-fabric-technical-overview#system-services)
`;
    }
    
    static generateResetPartitionLoads(clusterEndpoint: string): string {
        const cleanEndpoint = this.stripProtocol(clusterEndpoint);
        return `# 🔄 Reset Partition Loads

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## 📋 Overview

Reset partition load resets the reported load metrics for partitions, forcing the cluster resource manager to recalculate placement and balancing.

**Use Cases:**
- 📊 Incorrect load reports causing imbalance
- 🔄 After service configuration changes affecting metrics
- ⚖️ Cluster rebalancing not working as expected
- 🐛 Debugging placement issues

---

## 🔨 PowerShell Commands

### View Current Load

\`\`\`powershell
# Get load information for a service
$serviceName = "fabric:/MyApp/MyService"
Get-ServiceFabricPartition -ServiceName $serviceName | ForEach-Object {
    $partitionId = $_.PartitionId
    Write-Host "Partition: $partitionId"
    Get-ServiceFabricPartitionLoadInformation -PartitionId $partitionId
}
\`\`\`

📚 **Reference:** [Get-ServiceFabricPartitionLoadInformation](https://learn.microsoft.com/powershell/module/servicefabric/get-servicefabricpartitionloadinformation)

### Reset Load for Specific Partition

\`\`\`powershell
# Get partition ID
$partitionId = (Get-ServiceFabricPartition -ServiceName $serviceName)[0].PartitionId

# Reset the partition's load
Reset-ServiceFabricPartitionLoad -PartitionId $partitionId

# Verify reset
Get-ServiceFabricPartitionLoadInformation -PartitionId $partitionId
\`\`\`

📚 **Reference:** [Reset-ServiceFabricPartitionLoad](https://learn.microsoft.com/powershell/module/servicefabric/reset-servicefabricpartitionload)

### Reset Load for All Partitions of a Service

\`\`\`powershell
# Reset all partitions
Get-ServiceFabricPartition -ServiceName $serviceName | ForEach-Object {
    Write-Host "Resetting partition $($_.PartitionId)..."
    Reset-ServiceFabricPartitionLoad -PartitionId $_.PartitionId
}

# Trigger rebalancing
Write-Host "Triggering cluster rebalance..."
# Wait for CRM to process
Start-Sleep -Seconds 30

# Check new load distribution
Get-ServiceFabricPartition -ServiceName $serviceName | ForEach-Object {
    Get-ServiceFabricPartitionLoadInformation -PartitionId $_.PartitionId | 
        Select PartitionId, PrimaryLoadMetricReports, SecondaryLoadMetricReports
}
\`\`\`

---

## 🌐 REST API Examples

### Get Partition Load

\`\`\`bash
curl -k -X GET "https://${cleanEndpoint}/Partitions/{partitionId}/$/GetLoadInformation?api-version=6.0" \\
  --cert client.pem --key client.key
\`\`\`

### Reset Partition Load

\`\`\`bash
curl -k -X POST "https://${cleanEndpoint}/Partitions/{partitionId}/$/ResetLoad?api-version=6.0" \\
  --cert client.pem --key client.key
\`\`\`

---

## 📈 Understanding Load Metrics

### Common Default Metrics

| Metric | Description |
|--------|-------------|
| **PrimaryCount** | Number of primary replicas on a node |
| **ReplicaCount** | Total replicas on a node |
| **Count** | Instance count for stateless services |
| **Custom Metrics** | Application-defined metrics (CPU, Memory, etc.) |

### View Cluster-Wide Load

\`\`\`powershell
# Node load distribution
Get-ServiceFabricNode | ForEach-Object {
    $node = $_.NodeName
    $load = Get-ServiceFabricNodeLoadInformation -NodeName $node
    [PSCustomObject]@{
        Node = $node
        PrimaryCount = ($load.NodeLoadMetricInformation | Where-Object {$_.Name -eq "PrimaryCount"}).NodeLoad
        ReplicaCount = ($load.NodeLoadMetricInformation | Where-Object {$_.Name -eq "ReplicaCount"}).NodeLoad
    }
} | ft -AutoSize
\`\`\`

---

## 🔍 Troubleshooting Scenarios

### Scenario 1: Unbalanced Cluster

\`\`\`powershell
# Check balance
$nodes = Get-ServiceFabricNode
$loads = $nodes | ForEach-Object {
    $load = Get-ServiceFabricNodeLoadInformation -NodeName $_.NodeName
    [PSCustomObject]@{
        Node = $_.NodeName
        PrimaryCount = ($load.NodeLoadMetricInformation | Where-Object {$_.Name -eq "PrimaryCount"}).NodeLoad
    }
}
$loads | Sort-Object PrimaryCount | ft -AutoSize

# If imbalanced, reset high-load services
$highLoadServices = @("fabric:/MyApp/Service1", "fabric:/MyApp/Service2")
foreach ($svc in $highLoadServices) {
    Get-ServiceFabricPartition -ServiceName $svc | ForEach-Object {
        Reset-ServiceFabricPartitionLoad -PartitionId $_.PartitionId
    }
}
\`\`\`

### Scenario 2: After Service Update

\`\`\`powershell
# After changing service manifest metrics
$serviceName = "fabric:/MyApp/UpdatedService"

# Reset loads
Get-ServiceFabricPartition -ServiceName $serviceName | ForEach-Object {
    Reset-ServiceFabricPartitionLoad -PartitionId $_.PartitionId
}

# Verify new metrics active
Start-Sleep -Seconds 10
Get-ServiceFabricPartition -ServiceName $serviceName | ForEach-Object {
    Get-ServiceFabricPartitionLoadInformation -PartitionId $_.PartitionId | 
        Select -ExpandProperty PrimaryLoadMetricReports
}
\`\`\`

---

## 📚 Additional Resources

- [Resource Balancing in Service Fabric](https://learn.microsoft.com/azure/service-fabric/service-fabric-cluster-resource-manager-balancing)
- [Metrics and Load in Service Fabric](https://learn.microsoft.com/azure/service-fabric/service-fabric-cluster-resource-manager-metrics)
- [Cluster Resource Manager Overview](https://learn.microsoft.com/azure/service-fabric/service-fabric-cluster-resource-manager-introduction)
`;
    }
    
    // ==================== APPLICATION LIFECYCLE ====================
    
    static generateProvisionApplicationType(clusterEndpoint: string): string {
        const cleanEndpoint = this.stripProtocol(clusterEndpoint);
        return `# 📦 Provision Application Type

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## 📋 Overview

Provisioning registers an application package with the cluster, making it available for creating application instances.

**Process:**
1. Upload package to image store
2. Provision application type
3. Create application instances
4. Unprovision when no longer needed

---

## 🔨 PowerShell Commands

### Upload Application Package

\`\`\`powershell
# Copy package to image store
$appPath = "C:\\MyApplication\\pkg"
$imageStoreConnectionString = "fabric:ImageStore"

Copy-ServiceFabricApplicationPackage \`
    -ApplicationPackagePath $appPath \`
    -ImageStoreConnectionString $imageStoreConnectionString \`
    -ApplicationPackagePathInImageStore "MyApp_1.0"

# Verify upload
Get-ServiceFabricImageStoreContent -RemoteLocation "MyApp_1.0"
\`\`\`

📚 **Reference:** [Copy-ServiceFabricApplicationPackage](https://learn.microsoft.com/powershell/module/servicefabric/copy-servicefabricapplicationpackage)

### Provision Application Type

\`\`\`powershell
# Register the application type
Register-ServiceFabricApplicationType \`
    -ApplicationPathInImageStore "MyApp_1.0"

# Monitor registration progress
$timeout = (Get-Date).AddMinutes(5)
while ((Get-Date) -lt $timeout) {
    $appType = Get-ServiceFabricApplicationType -ApplicationTypeName "MyAppType"
    if ($appType) {
        Write-Host "✅ Provisioned successfully"
        break
    }
    Start-Sleep -Seconds 5
}

# Verify provisioned
Get-ServiceFabricApplicationType | ft -AutoSize
\`\`\`

📚 **Reference:** [Register-ServiceFabricApplicationType](https://learn.microsoft.com/powershell/module/servicefabric/register-servicefabricapplicationtype)

### Provision from External Store (Azure Blob)

\`\`\`powershell
# For large packages, download from external store
$params = @{
    ApplicationTypeName = "MyAppType"
    ApplicationTypeVersion = "1.0"
    ApplicationPackageDownloadUri = "https://mystorageaccount.blob.core.windows.net/packages/MyApp.sfpkg"
}
Register-ServiceFabricApplicationType @params -Async
\`\`\`

---

## 🌐 REST API Examples

### Upload Package (File-based Image Store)

\`\`\`bash
# For file-based image store, upload via SMB/file system
# For native image store (fabric:ImageStore), use REST API:

curl -k -X PUT "https://${cleanEndpoint}/ImageStore/MyApp_1.0/ApplicationManifest.xml?api-version=6.0" \\
  --cert client.pem --key client.key \\
  --data-binary @ApplicationManifest.xml
\`\`\`

### Provision Application Type

\`\`\`bash
curl -k -X POST "https://${clusterEndpoint}/ApplicationTypes/$/Provision?api-version=6.0" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json" \\
  -d '{
    "ApplicationTypeBuildPath": "MyApp_1.0"
  }'

# Or provision from external package
curl -k -X POST "https://${cleanEndpoint}/ApplicationTypes/$/Provision?api-version=6.5" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json" \\
  -d '{
    "Kind": "ExternalStore",
    "ApplicationTypeName": "MyAppType",
    "ApplicationTypeVersion": "1.0",
    "ApplicationPackageDownloadUri": "https://mystorageaccount.blob.core.windows.net/packages/MyApp.sfpkg"
  }'
\`\`\`

---

## 📦 Package Optimization

### Test Package Before Upload

\`\`\`powershell
# Validate package structure
Test-ServiceFabricApplicationPackage -ApplicationPackagePath $appPath

# Compress for faster upload (optional)
$compressed = $appPath + "_compressed"
Copy-ServiceFabricApplicationPackage \`
    -ApplicationPackagePath $appPath \`
    -ImageStoreConnectionString $imageStoreConnectionString \`
    -ApplicationPackagePathInImageStore "MyApp_1.0" \`
    -CompressPackage
\`\`\`

### Clean Up Image Store After Provision

\`\`\`powershell
# Remove from image store (saves space)
Remove-ServiceFabricApplicationPackage \`
    -ImageStoreConnectionString $imageStoreConnectionString \`
    -ApplicationPackagePathInImageStore "MyApp_1.0"
\`\`\`

📚 **Reference:** [Remove-ServiceFabricApplicationPackage](https://learn.microsoft.com/powershell/module/servicefabric/remove-servicefabricapplicationpackage)

---

## ⚠️ Best Practices

1. **Version Naming**: Use semantic versioning (1.0.0, 1.1.0, 2.0.0)
2. **Cleanup**: Remove packages from image store after provisioning
3. **Validation**: Always run Test-ServiceFabricApplicationPackage first
4. **Large Packages**: Use external store provisioning for packages > 1GB
5. **Parallel Uploads**: Compress and use parallel upload for faster deployment

---

## 📚 Additional Resources

- [Package an Application](https://learn.microsoft.com/azure/service-fabric/service-fabric-package-apps)
- [Deploy and Remove Applications](https://learn.microsoft.com/azure/service-fabric/service-fabric-deploy-remove-applications)
- [Image Store Connection String](https://learn.microsoft.com/azure/service-fabric/service-fabric-image-store-connection-string)
`;
    }
    
    static generateCreateApplication(clusterEndpoint: string, appTypes: any[]): string {
        const cleanEndpoint = this.stripProtocol(clusterEndpoint);
        const appTypeList = appTypes.length > 0 
            ? appTypes.map(t => `- ${t.name} (${t.version || 'version unknown'})`).join('\n')
            : '- No application types provisioned yet';
            
        return `# ➕ Create Application Instance

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## 📋 Overview

Creating an application instance deploys a specific version of a provisioned application type to the cluster.

**Provisioned Application Types:**
\`\`\`
${appTypeList}
\`\`\`

---

## 🔨 PowerShell Commands

### Create Application

\`\`\`powershell
# Create application instance
New-ServiceFabricApplication \`
    -ApplicationName "fabric:/MyApp" \`
    -ApplicationTypeName "MyAppType" \`
    -ApplicationTypeVersion "1.0"

# Verify creation
Get-ServiceFabricApplication -ApplicationName "fabric:/MyApp"
Get-ServiceFabricApplication -ApplicationName "fabric:/MyApp" | Get-ServiceFabricService
\`\`\`

📚 **Reference:** [New-ServiceFabricApplication](https://learn.microsoft.com/powershell/module/servicefabric/new-servicefabricapplication)

### Create with Parameters

\`\`\`powershell
# Override default parameters from ApplicationManifest.xml
$params = @{
    "InstanceCount" = "5"
    "MinReplicaSetSize" = "2"
    "TargetReplicaSetSize" = "3"
}

New-ServiceFabricApplication \`
    -ApplicationName "fabric:/MyApp" \`
    -ApplicationTypeName "MyAppType" \`
    -ApplicationTypeVersion "1.0" \`
    -ApplicationParameter $params

# Verify parameters applied
Get-ServiceFabricApplication -ApplicationName "fabric:/MyApp" | Select ApplicationParameters
\`\`\`

### Create Multiple Instances

\`\`\`powershell
# Deploy multiple environments
$environments = @("Dev", "Test", "Stage")
foreach ($env in $environments) {
    $appName = "fabric:/MyApp_$env"
    $params = @{
        "Environment" = $env
        "InstanceCount" = if ($env -eq "Dev") { "1" } else { "3" }
    }
    
    New-ServiceFabricApplication \`
        -ApplicationName $appName \`
        -ApplicationTypeName "MyAppType" \`
        -ApplicationTypeVersion "1.0" \`
        -ApplicationParameter $params
    
    Write-Host "✅ Created $appName"
}
\`\`\`

---

## 🌐 REST API Examples

### Create Application

\`\`\`bash
curl -k -X POST "https://${cleanEndpoint}/Applications/$/Create?api-version=6.0" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json" \\
  -d '{
    "Name": "fabric:/MyApp",
    "TypeName": "MyAppType",
    "TypeVersion": "1.0",
    "Parameters": [
      {
        "Key": "InstanceCount",
        "Value": "5"
      },
      {
        "Key": "MinReplicaSetSize",
        "Value": "2"
      }
    ]
  }'
\`\`\`

### Get Application Details

\`\`\`bash
curl -k -X GET "https://${cleanEndpoint}/Applications/MyApp?api-version=6.0" \\
  --cert client.pem --key client.key
\`\`\`

---

## 🎯 Advanced Scenarios

### Create with Metrics

\`\`\`powershell
# Define application capacity (resource governance)
$metrics = @(
    @{Name="Memory"; MaximumCapacity=4096; ReservationCapacity=2048}
    @{Name="Cpu"; MaximumCapacity=100; ReservationCapacity=50}
)

New-ServiceFabricApplication \`
    -ApplicationName "fabric:/MyApp" \`
    -ApplicationTypeName "MyAppType" \`
    -ApplicationTypeVersion "1.0" \`
    -Metrics $metrics
\`\`\`

### Blue-Green Deployment Pattern

\`\`\`powershell
# Deploy new version alongside existing
New-ServiceFabricApplication \`
    -ApplicationName "fabric:/MyApp_Green" \`
    -ApplicationTypeName "MyAppType" \`
    -ApplicationTypeVersion "2.0"

# Test green deployment
# ... validation ...

# Switch traffic (via reverse proxy or service routing)
# Remove blue deployment when confirmed
Remove-ServiceFabricApplication -ApplicationName "fabric:/MyApp_Blue" -Force
\`\`\`

---

## ⚠️ Common Issues

### Issue: Application Already Exists

\`\`\`powershell
# Check if exists
$existing = Get-ServiceFabricApplication -ApplicationName "fabric:/MyApp"
if ($existing) {
    Write-Host "⚠️ Application already exists"
    # Option 1: Upgrade instead
    Start-ServiceFabricApplicationUpgrade ...
    # Option 2: Delete and recreate
    Remove-ServiceFabricApplication -ApplicationName "fabric:/MyApp" -Force
    # Wait for deletion
    Start-Sleep -Seconds 10
}
New-ServiceFabricApplication ...
\`\`\`

### Issue: Application Type Not Provisioned

\`\`\`powershell
# Check provisioned types
$appType = Get-ServiceFabricApplicationType -ApplicationTypeName "MyAppType"
if (!$appType) {
    Write-Host "❌ Application type not provisioned. Register first:"
    Write-Host "Register-ServiceFabricApplicationType -ApplicationPathInImageStore 'MyApp_1.0'"
}
\`\`\`

---

## 📚 Additional Resources

- [Create and Deploy an Application](https://learn.microsoft.com/azure/service-fabric/service-fabric-deploy-remove-applications)
- [Application Parameters](https://learn.microsoft.com/azure/service-fabric/service-fabric-manage-multiple-environment-app-configuration)
- [Application Capacity](https://learn.microsoft.com/azure/service-fabric/service-fabric-cluster-resource-manager-application-groups)
`;
    }
    
    static generateStartApplicationUpgrade(clusterEndpoint: string, apps: any[]): string {
        const cleanEndpoint = this.stripProtocol(clusterEndpoint);
        const appList = apps.length > 0
            ? apps.map(a => `- ${a.name} (Type: ${a.typeName}, Version: ${a.typeVersion})`).join('\n')
            : '- No applications deployed yet';
            
        return `# 🚀 Start Application Upgrade

**Cluster:** \`${clusterEndpoint}\`  
**Applications:** ${apps.length}  
**Generated:** ${new Date().toLocaleString()}

---

## 📋 Overview

Application upgrades allow updating applications with zero downtime through rolling upgrades across upgrade domains.

**Your Applications:**
\`\`\`
${appList}
\`\`\`

---

## 🔨 PowerShell Commands

### Monitored Upgrade (Recommended)

\`\`\`powershell
# Provision new version first
Register-ServiceFabricApplicationType -ApplicationPathInImageStore "MyApp_2.0"

# Start monitored upgrade with health checks
Start-ServiceFabricApplicationUpgrade \`
    -ApplicationName "fabric:/MyApp" \`
    -ApplicationTypeVersion "2.0" \`
    -Monitored \`
    -FailureAction Rollback \`
    -HealthCheckRetryTimeoutSec 600 \`
    -HealthCheckStableDurationSec 120 \`
    -UpgradeDomainTimeoutSec 1200 \`
    -UpgradeTimeoutSec 3600

# Monitor progress
Get-ServiceFabricApplicationUpgrade -ApplicationName "fabric:/MyApp"
Watch-ServiceFabricApplicationUpgrade -ApplicationName "fabric:/MyApp"
\`\`\`

📚 **Reference:** [Start-ServiceFabricApplicationUpgrade](https://learn.microsoft.com/powershell/module/servicefabric/start-servicefabricapplicationupgrade)

### Unmonitored Auto Upgrade

\`\`\`powershell
# Upgrade without automatic health monitoring
Start-ServiceFabricApplicationUpgrade \`
    -ApplicationName "fabric:/MyApp" \`
    -ApplicationTypeVersion "2.0" \`
    -UnmonitoredAuto

# Must manually monitor
while ((Get-ServiceFabricApplicationUpgrade -ApplicationName "fabric:/MyApp").UpgradeState -ne "RollingForwardCompleted") {
    Start-Sleep -Seconds 10
    Get-ServiceFabricApplicationUpgrade -ApplicationName "fabric:/MyApp" | fl UpgradeState, CurrentUpgradeDomainProgress
}
\`\`\`

### Advanced: Per-Service Health Policies

\`\`\`powershell
# Define custom health policies
$healthPoli<br/> = New-Object -TypeName System.Fabric.Health.ApplicationHealthPolicy
$healthPolicy.ConsiderWarningAsError = $false
$healthPolicy.MaxPercentUnhealthyDeployedApplications = 20

$servicePolicy = New-Object -TypeName System.Fabric.Health.ServiceTypeHealthPolicy
$servicePolicy.MaxPercentUnhealthyServices = 10
$servicePolicy.MaxPercentUnhealthyPartitionsPerService = 20
$servicePolicy.MaxPercentUnhealthyReplicasPerPartition = 20

$healthPolicy.ServiceTypeHealthPolicyMap.Add("MyServiceType", $servicePolicy)

Start-ServiceFabricApplicationUpgrade \`
    -ApplicationName "fabric:/MyApp" \`
    -ApplicationTypeVersion "2.0" \`
    -Monitored \`
    -FailureAction Rollback \`
    -HealthPolicy $healthPolicy
\`\`\`

---

## 🌐 REST API Examples

### Start Upgrade

\`\`\`bash
curl -k -X POST "https://${cleanEndpoint}/Applications/MyApp/$/Upgrade?api-version=6.0" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json" \\
  -d '{
    "Name": "fabric:/MyApp",
    "TargetApplicationTypeVersion": "2.0",
    "UpgradeKind": "Rolling",
    "RollingUpgradeMode": "Monitored",
    "FailureAction": "Rollback",
    "ForceRestart": false,
    "UpgradeReplicaSetCheckTimeoutInSeconds": 43200,
    "MonitoringPolicy": {
      "FailureAction": "Rollback",
      "HealthCheckWaitDurationInMilliseconds": 60000,
      "HealthCheckStableDurationInMilliseconds": 120000,
      "HealthCheckRetryTimeoutInMilliseconds": 600000,
      "UpgradeTimeoutInMilliseconds": 3600000,
      "UpgradeDomainTimeoutInMilliseconds": 1200000
    },
    "ApplicationHealthPolicy": {
      "ConsiderWarningAsError": false,
      "MaxPercentUnhealthyDeployedApplications": 20,
      "DefaultServiceTypeHealthPolicy": {
        "MaxPercentUnhealthyServices": 10,
        "MaxPercentUnhealthyPartitionsPerService": 20,
        "MaxPercentUnhealthyReplicasPerPartition": 20
      }
    }
  }'
\`\`\`

### Get Upgrade Progress

\`\`\`bash
curl -k -X GET "https://${cleanEndpoint}/Applications/MyApp/$/GetUpgradeProgress?api-version=6.0" \\
  --cert client.pem --key client.key
\`\`\`

---

## 📊 Monitoring Upgrade Progress

\`\`\`powershell
# Detailed monitoring script
$appName = "fabric:/MyApp"
$startTime = Get-Date

while ($true) {
    $upgrade = Get-ServiceFabricApplicationUpgrade -ApplicationName $appName
    $elapsed = ((Get-Date) - $startTime).TotalMinutes
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "⏱️  Elapsed: $([math]::Round($elapsed, 1)) minutes"
    Write-Host "📍 State: $($upgrade.UpgradeState)"
    
    if ($upgrade.UpgradeState -eq "RollingForwardCompleted") {
        Write-Host "🎉 Upgrade completed successfully!" -ForegroundColor Green
        break
    }
    elseif ($upgrade.UpgradeState -like "*Failed*" -or $upgrade.UpgradeState -like "*Rollback*") {
        Write-Host "❌ Upgrade failed or rolling back!" -ForegroundColor Red
        $upgrade | fl *
        break
    }
    
    if ($upgrade.CurrentUpgradeDomainProgress) {
        Write-Host "🔄 Current UD: $($upgrade.CurrentUpgradeDomainProgress.UpgradeDomainName)"
    }
    
    $completed = ($upgrade.UpgradeDomainsProgress | Where-Object {$_.DomainName}).Count
    $total = $upgrade.UpgradeDomains.Count
    Write-Host "✅ Progress: $completed/$total UDs"
    
    # Health check
    $health = Get-ServiceFabricApplicationHealth -ApplicationName $appName
    Write-Host "💚 Health: $($health.AggregatedHealthState)"
    
    Start-Sleep -Seconds 30
}

# Final validation
Get-ServiceFabricApplication -ApplicationName $appName | Select ApplicationName, ApplicationStatus, HealthState, ApplicationTypeVersion
Get-ServiceFabricApplication -ApplicationName $appName | Get-ServiceFabricService | Select ServiceName, ServiceStatus, HealthState
\`\`\`

---

## ⚠️ Best Practices

1. **Test in Lower Environments**: Always test upgrades in dev/test first
2. **Backup Stateful Services**: Take backups before production upgrades
3. **Health Policies**: Configure appropriate health check timeouts
4. **Monitor Progress**: Use Watch-ServiceFabricApplicationUpgrade
5. **Rollback Plan**: Know your rollback procedure (covered in separate guide)
6. **Off-Peak Hours**: Schedule for low-traffic periods
7. **Version Control**: Tag application packages with version numbers

---

## 📚 Additional Resources

- [Application Upgrades](https://learn.microsoft.com/azure/service-fabric/service-fabric-application-upgrade)
- [Upgrade Parameters](https://learn.microsoft.com/azure/service-fabric/service-fabric-application-upgrade-parameters)
- [Health Evaluation During Upgrade](https://learn.microsoft.com/azure/service-fabric/service-fabric-application-upgrade-advanced)
- [Troubleshooting Upgrades](https://learn.microsoft.com/azure/service-fabric/service-fabric-application-upgrade-troubleshooting)
`;
    }
    
    static generateRollbackApplicationUpgrade(clusterEndpoint: string): string {
        const cleanEndpoint = this.stripProtocol(clusterEndpoint);
        return `# ⏮️ Rollback Application Upgrade

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## 📋 Overview

Rollback an application upgrade that has failed or needs to be reverted to the previous version.

---

## 🔨 PowerShell Commands

\`\`\`powershell
# Initiate rollback
Start-ServiceFabricApplicationRollback -ApplicationName "fabric:/MyApp"

# Monitor rollback progress
Watch-ServiceFabricApplicationUpgrade -ApplicationName "fabric:/MyApp"

# Verify after rollback
Get-ServiceFabricApplication -ApplicationName "fabric:/MyApp" | Select ApplicationName, ApplicationTypeVersion, HealthState
\`\`\`

📚 **Reference:** [Start-ServiceFabricApplicationRollback](https://learn.microsoft.com/powershell/module/servicefabric/start-servicefabricapplicationrollback)

---

## 🌐 REST API

\`\`\`bash
curl -k -X POST "https://${cleanEndpoint}/Applications/MyApp/$/Rollback?api-version=6.0" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json"
\`\`\`

---

## 📚 Additional Resources

- [Application Upgrade Rollback](https://learn.microsoft.com/azure/service-fabric/service-fabric-application-upgrade-troubleshooting#how-to-roll-back-an-application-upgrade)
`;
    }
    
    // ==================== PARTITION & REPLICA OPERATIONS ====================
    
    static generateMovePrimaryReplica(clusterEndpoint: string): string {
        const cleanEndpoint = this.stripProtocol(clusterEndpoint);
        return `# ↗️ Move Primary Replica

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## 📋 Overview

Move a primary replica to a specific node or let the cluster resource manager choose a new location.

**Use Cases:**
- Load balancing
- Testing failover scenarios
- Moving replicas off nodes for maintenance
- Disaster recovery drills

---

## 🔨 PowerShell Commands

### Move to Specific Node

\`\`\`powershell
# Get partition information
$serviceName = "fabric:/MyApp/MyService"
$partition = Get-ServiceFabricPartition -ServiceName $serviceName
$partitionId = $partition.PartitionId

# Get current primary replica
$primaryReplica = Get-ServiceFabricReplica -PartitionId $partitionId | Where-Object {$_.ReplicaRole -eq "Primary"}
Write-Host "Current primary on: $($primaryReplica.NodeName)"

# Move to different node
$targetNode = "_Node_2"  # Change to your target node
Move-ServiceFabricPrimaryReplica -PartitionId $partitionId -NodeName $targetNode

# Verify move
Start-Sleep -Seconds 5
$newPrimary = Get-ServiceFabricReplica -PartitionId $partitionId | Where-Object {$_.ReplicaRole -eq "Primary"}
Write-Host "New primary on: $($newPrimary.NodeName)"
\`\`\`

📚 **Reference:** [Move-ServiceFabricPrimaryReplica](https://learn.microsoft.com/powershell/module/servicefabric/move-servicefabricprimaryreplica)

### Let Platform Choose Location

\`\`\`powershell
# Move without specifying target (cluster chooses best location)
Move-ServiceFabricPrimaryReplica -PartitionId $partitionId

# Monitor placement
Get-ServiceFabricReplica -PartitionId $partitionId | Select NodeName, ReplicaRole, ReplicaStatus | ft -AutoSize
\`\`\`

### Multi-Service Rebalancing

\`\`\`powershell
# Move primaries across multiple services
$services = @("fabric:/MyApp/Service1", "fabric:/MyApp/Service2", "fabric:/MyApp/Service3")
foreach ($svc in $services) {
    Get-ServiceFabricPartition -ServiceName $svc | ForEach-Object {
        Write-Host "Moving primary for partition $($_.PartitionId)..."
        Move-ServiceFabricPrimaryReplica -PartitionId $_.PartitionId
        Start-Sleep -Seconds 2
    }
}
\`\`\`

---

## 🌐 REST API

\`\`\`bash
# Move to specific node
curl -k -X POST "https://${clusterEndpoint}/Partitions/{partitionId}/$/MovePrimaryReplica?api-version=6.0" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json" \\
  -d '{
    "NodeName": "_Node_2",
    "IgnoreConstraints": false
  }'

# Let platform choose
curl -k -X POST "https://${cleanEndpoint}/Partitions/{partitionId}/$/MovePrimaryReplica?api-version=6.0" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json" \\
  -d '{
    "IgnoreConstraints": false
  }'
\`\`\`

---

## 📚 Additional Resources

- [Move Replicas for Balancing](https://learn.microsoft.com/azure/service-fabric/service-fabric-cluster-resource-manager-balancing)
- [Replica Lifecycle](https://learn.microsoft.com/azure/service-fabric/service-fabric-concepts-replica-lifecycle)
`;
    }
    
    static generateMoveSecondaryReplica(clusterEndpoint: string): string {
        const cleanEndpoint = this.stripProtocol(clusterEndpoint);
        return `# ↔️ Move Secondary Replica

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## 📋 Overview

Move a secondary replica to a different node. Useful for load balancing and node maintenance.

---

## 🔨 PowerShell Commands

\`\`\`powershell
# Get partition and replicas
$serviceName = "fabric:/MyApp/MyService"
$partitionId = (Get-ServiceFabricPartition -ServiceName $serviceName).PartitionId

# View current replica placement
Get-ServiceFabricReplica -PartitionId $partitionId | Select NodeName, ReplicaRole, ReplicaStatus | ft -AutoSize

# Move secondary from specific current node to target node
$currentNode = "_Node_1"
$targetNode = "_Node_3"
Move-ServiceFabricSecondaryReplica \`
    -PartitionId $partitionId \`
    -CurrentNodeName $currentNode \`
    -NewNodeName $targetNode

# Verify after move
Start-Sleep -Seconds 5
Get-ServiceFabricReplica -PartitionId $partitionId | Select NodeName, ReplicaRole, ReplicaStatus | ft -AutoSize
\`\`\`

📚 **Reference:** [Move-ServiceFabricSecondaryReplica](https://learn.microsoft.com/powershell/module/servicefabric/move-servicefabricsecondaryreplica)

---

## 🌐 REST API

\`\`\`bash
curl -k -X POST "https://${cleanEndpoint}/Partitions/{partitionId}/$/MoveSecondaryReplica?api-version=6.0" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json" \\
  -d '{
    "CurrentNodeName": "_Node_1",
    "NewNodeName": "_Node_3",
    "IgnoreConstraints": false
  }'
\`\`\`

---

## 📚 Additional Resources

- [Move Secondary Replicas](https://learn.microsoft.com/azure/service-fabric/service-fabric-cluster-resource-manager-balancing)
`;
    }
    
    static generateResetPartitionLoad(clusterEndpoint: string): string {
        const cleanEndpoint = this.stripProtocol(clusterEndpoint);
        return `# 🔄 Reset Partition Load

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## 📋 Overview

Reset reported load metrics for a partition, forcing recalculation by the cluster resource manager.

---

## 🔨 PowerShell Commands

\`\`\`powershell
# Get partition
$partitionId = (Get-ServiceFabricPartition -ServiceName "fabric:/MyApp/MyService").PartitionId

# View current load
Get-ServiceFabricPartitionLoadInformation -PartitionId $partitionId

# Reset load
Reset-ServiceFabricPartitionLoad -PartitionId $partitionId

# Verify reset
Start-Sleep -Seconds 5
Get-ServiceFabricPartitionLoadInformation -PartitionId $partitionId
\`\`\`

📚 **Reference:** [Reset-ServiceFabricPartitionLoad](https://learn.microsoft.com/powershell/module/servicefabric/reset-servicefabricpartitionload)

---

## 🌐 REST API

\`\`\`bash
curl -k -X POST "https://${cleanEndpoint}/Partitions/{partitionId}/$/ResetLoad?api-version=6.0" \\
  --cert client.pem --key client.key
\`\`\`

---

## 📚 Additional Resources

- [Metrics and Load](https://learn.microsoft.com/azure/service-fabric/service-fabric-cluster-resource-manager-metrics)
`;
    }
    
    static generateReportHealth(clusterEndpoint: string): string {
        const cleanEndpoint = this.stripProtocol(clusterEndpoint);
        return `# 💚 Report Custom Health

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## 📋 Overview

Report custom health information for entities (applications, services, partitions, replicas, nodes).

---

## 🔨 PowerShell Commands

### Report Application Health

\`\`\`powershell
$healthInfo = @{
    SourceId = "MyMonitor"
    Property = "CustomCheck"
    HealthState = "Warning"  # Ok, Warning, Error
    Description = "Custom health check detected issue"
    TimeToLiveSec = 3600
}

Send-ServiceFabricApplicationHealthReport \`
    -ApplicationName "fabric:/MyApp" \`
    -SourceId $healthInfo.SourceId \`
    -Property $healthInfo.Property \`
    -HealthState $healthInfo.HealthState \`
    -Description $healthInfo.Description \`
    -TimeToLiveSec $healthInfo.TimeToLiveSec

# View health report
Get-ServiceFabricApplicationHealth -ApplicationName "fabric:/MyApp"
\`\`\`

📚 **Reference:** [Send-ServiceFabricApplicationHealthReport](https://learn.microsoft.com/powershell/module/servicefabric/send-servicefabricapplicationhealthreport)

### Report Partition Health

\`\`\`powershell
$partitionId = (Get-ServiceFabricPartition -ServiceName "fabric:/MyApp/MyService").PartitionId

Send-ServiceFabricPartitionHealthReport \`
    -PartitionId $partitionId \`
    -SourceId "MyMonitor" \`
    -Property "DataQuality" \`
    -HealthState "Error" \`
    -Description "Data corruption detected"
\`\`\`

📚 **Reference:** [Send-ServiceFabricPartitionHealthReport](https://learn.microsoft.com/powershell/module/servicefabric/send-servicefabricpartitionhealthreport)

### Clear Health Report

\`\`\`powershell
# Send OK to clear warning/error
Send-ServiceFabricApplicationHealthReport \`
    -ApplicationName "fabric:/MyApp" \`
    -SourceId "MyMonitor" \`
    -Property "CustomCheck" \`
    -HealthState "Ok" \`
    -Description "Issue resolved"
\`\`\`

---

## 🌐 REST API

\`\`\`bash
curl -k -X POST "https://${cleanEndpoint}/Applications/MyApp/$/ReportHealth?api-version=6.0" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json" \\
  -d '{
    "SourceId": "MyMonitor",
    "Property": "CustomCheck",
    "HealthState": "Warning",
    "Description": "Custom health check detected issue",
    "TimeToLiveInMilliSeconds": "PT1H"
  }'
\`\`\`

---

## 📚 Additional Resources

- [Health Monitoring in Service Fabric](https://learn.microsoft.com/azure/service-fabric/service-fabric-health-introduction)
- [Add Custom Health Reports](https://learn.microsoft.com/azure/service-fabric/service-fabric-report-health)
`;
    }
    
    // ==================== TESTING & CHAOS ====================
    
    static generateStartChaos(clusterEndpoint: string): string {
        const cleanEndpoint = this.stripProtocol(clusterEndpoint);
        return `# 🧪 Start Chaos Test

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## 📋 Overview

Chaos is an automated fault injection engine that induces faults across the cluster to test resilience and availability.

**⚠️ WARNING:** Chaos induces actual faults (node restarts, process kills, replica moves). Only run in non-production clusters or during maintenance windows.

---

## 🔨 PowerShell Commands

### Start Basic Chaos Test

\`\`\`powershell
# Simple chaos test (30 minutes)
$timeToRun = New-TimeSpan -Minutes 30

Start-ServiceFabricChaos \`
    -TimeToRunMinute 30 \`
    -MaxClusterStabilizationTimeoutSec 180 \`
    -MaxConcurrentFaults 1 \`
    -EnableMoveReplicaFaults

# Monitor chaos status
Get-ServiceFabricChaosReport
\`\`\`

📚 **Reference:** [Start-ServiceFabricChaos](https://learn.microsoft.com/powershell/module/servicefabric/start-servicefabricchaos)

### Advanced Chaos Configuration

\`\`\`powershell
# Create chaos parameters
$chaos = @{
    TimeToRun = New-TimeSpan -Hours 2
    MaxClusterStabilizationTimeout = New-TimeSpan -Seconds 180
    MaxConcurrentFaults = 2
    EnableMoveReplicaFaults = $true
    WaitTimeBetweenFaults = New-TimeSpan -Seconds 20
    WaitTimeBetweenIterations = New-TimeSpan -Seconds 30
}

# Target specific application (optional)
$context = @{
    Map = @{
        "fabric:/MyApp" = @{
            "MaxPercentUnhealthyServices" = 0
            "MaxPercentUnhealthyPartitionsPerService" = 0
        }
    }
}

Start-ServiceFabricChaos \`
    -TimeToRunMinute 120 \`
    -MaxClusterStabilizationTimeoutSec 180 \`
    -MaxConcurrentFaults 2 \`
    -EnableMoveReplicaFaults \`
    -WaitTimeBetweenFaultsSec 20 \`
    -WaitTimeBetweenIterationsSec 30

# Watch chaos in real-time
while ((Get-ServiceFabricChaos).Status -eq "Running") {
    $report = Get-ServiceFabricChaosReport
    Write-Host "$(Get-Date) - Events: $($report.ChaosEvents.Count), Status: $($report.Status)"
    Get-ServiceFabricClusterHealth | Select AggregatedHealthState
    Start-Sleep -Seconds 10
}
\`\`\`

---

## 🌐 REST API

\`\`\`bash
# Start Chaos
curl -k -X POST "https://${clusterEndpoint}/Tools/Chaos/$/Start?api-version=6.2" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json" \\
  -d '{
    "TimeToRunInSeconds": 1800,
    "MaxClusterStabilizationTimeoutInSeconds": 180,
    "MaxConcurrentFaults": 1,
    "EnableMoveReplicaFaults": true,
    "WaitTimeBetweenFaultsInSeconds": 20,
    "WaitTimeBetweenIterationsInSeconds": 30
  }'

# Get chaos status
curl -k -X GET "https://${cleanEndpoint}/Tools/Chaos?api-version=6.2" \\
  --cert client.pem --key client.key
\`\`\`

---

## 📊 Monitoring & Analysis

\`\`\`powershell
# Get chaos report with events
$report = Get-ServiceFabricChaosReport -StartTimeUtc (Get-Date).AddHours(-1) -EndTimeUtc (Get-Date)

# Analyze chaos events
$report.ChaosEvents | Group-Object -Property EventKind | Select Name, Count | ft -AutoSize

# Get specific fault types
$report.ChaosEvents | Where-Object {$_.EventKind -like "*Fault*"} | 
    Select TimeStampUtc, EventKind, Reason | ft -AutoSize
\`\`\`

📚 **Reference:** [Get-ServiceFabricChaosReport](https://learn.microsoft.com/powershell/module/servicefabric/get-servicefabricchaosreport)

---

## ⚠️ Best Practices

1. **Test Environment First**: Always run in dev/test before production
2. **Maintenance Window**: Schedule during planned maintenance
3. **Monitor Carefully**: Watch cluster health during chaos
4. **Gradual Increase**: Start with low concurrent faults, increase gradually
5. **Application Readiness**: Ensure applications handle faults gracefully
6. **Backup First**: Take backups of stateful services

---

## 📚 Additional Resources

- [Chaos Testing in Service Fabric](https://learn.microsoft.com/azure/service-fabric/service-fabric-controlled-chaos)
- [Testability Scenarios](https://learn.microsoft.com/azure/service-fabric/service-fabric-testability-scenarios)
- [ Inducing Chaos in Production](https://learn.microsoft.com/azure/service-fabric/service-fabric-controlled-chaos#inducing-chaos-in-production-clusters)
`;
    }
    
    static generateStopChaos(clusterEndpoint: string): string {
        const cleanEndpoint = this.stripProtocol(clusterEndpoint);
        return `# 🛑 Stop Chaos Test

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## 📋 Overview

Stop an active Chaos test immediately.

---

## 🔨 PowerShell Commands

\`\`\`powershell
# Stop chaos
Stop-ServiceFabricChaos

# Verify stopped
Get-ServiceFabricChaos | Select Status

# Generate final report
Get-ServiceFabricChaosReport | Select Status, ContinuationToken, @{N='EventCount';E={$_.ChaosEvents.Count}}
\`\`\`

📚 **Reference:** [Stop-ServiceFabricChaos](https://learn.microsoft.com/powershell/module/servicefabric/stop-servicefabricchaos)

---

## 🌐 REST API

\`\`\`bash
curl -k -X POST "https://${cleanEndpoint}/Tools/Chaos/$/Stop?api-version=6.2" \\
  --cert client.pem --key client.key
\`\`\`

---

## 📚 Additional Resources

- [Chaos Testing](https://learn.microsoft.com/azure/service-fabric/service-fabric-controlled-chaos)
`;
    }
    
    // ==================== CHAOS QUERY & PARTITION RESTART ====================

    static generateQueryChaosEvents(clusterEndpoint: string): string {
        const cleanEndpoint = this.stripProtocol(clusterEndpoint);
        return `# 🔍 Query Chaos Events

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## 📋 Overview

Query and analyze events generated by Chaos test runs. Chaos events include fault injections, validation results, and status changes.

**Event Types:**
- **ExecutingFaults** — Active faults being injected
- **ValidationFailed** — Health check violations during chaos
- **Started** — Chaos session started
- **Stopped** — Chaos session stopped
- **Waiting** — Waiting between iterations

---

## 🔨 PowerShell Commands

### Get All Chaos Events

\`\`\`powershell
# Get chaos report with all events
$report = Get-ServiceFabricChaosReport
$report.ChaosEvents | Format-Table TimeStampUtc, Kind, Reason -AutoSize
\`\`\`

📚 **Reference:** [Get-ServiceFabricChaosReport](https://learn.microsoft.com/powershell/module/servicefabric/get-servicefabricchaosreport)

### Filter by Time Range

\`\`\`powershell
# Get events from last 24 hours
$startTime = (Get-Date).AddHours(-24).ToUniversalTime()
$endTime = (Get-Date).ToUniversalTime()

$report = Get-ServiceFabricChaosReport \`
    -StartTimeUtc $startTime \`
    -EndTimeUtc $endTime

$report.ChaosEvents | Sort-Object TimeStampUtc | Format-Table -AutoSize
\`\`\`

### Analyze Fault Distribution

\`\`\`powershell
# Group events by type
$report = Get-ServiceFabricChaosReport
$report.ChaosEvents | Group-Object Kind |
    Select-Object Name, Count |
    Sort-Object Count -Descending |
    Format-Table -AutoSize

# Get fault-specific events
$faults = $report.ChaosEvents | Where-Object Kind -eq "ExecutingFaults"
$faults | ForEach-Object {
    [PSCustomObject]@{
        Time = $_.TimeStampUtc
        FaultType = $_.Reason
    }
} | Format-Table -AutoSize
\`\`\`

### Export Chaos Report

\`\`\`powershell
# Export full chaos report to JSON
$report = Get-ServiceFabricChaosReport
$report | ConvertTo-Json -Depth 10 | Out-File "C:\\Temp\\ChaosReport_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"

# Export events to CSV
$report.ChaosEvents | Select-Object TimeStampUtc, Kind, Reason |
    Export-Csv -Path "C:\\Temp\\ChaosEvents.csv" -NoTypeInformation
\`\`\`

### Monitor Chaos in Real-Time

\`\`\`powershell
# Continuous monitoring during chaos run
$lastEventCount = 0
while ((Get-ServiceFabricChaos).Status -eq "Running") {
    $report = Get-ServiceFabricChaosReport
    $newEvents = $report.ChaosEvents | Select-Object -Skip $lastEventCount

    foreach ($event in $newEvents) {
        $color = switch ($event.Kind) {
            "ExecutingFaults" { "Yellow" }
            "ValidationFailed" { "Red" }
            "Started" { "Green" }
            "Stopped" { "Cyan" }
            default { "White" }
        }
        Write-Host "[$($event.TimeStampUtc)] $($event.Kind): $($event.Reason)" -ForegroundColor $color
    }

    $lastEventCount = $report.ChaosEvents.Count
    Start-Sleep -Seconds 5
}
Write-Host "Chaos stopped. Total events: $lastEventCount" -ForegroundColor Cyan
\`\`\`

---

## 🌐 REST API Examples

### Get Chaos Events

\`\`\`bash
# Get all chaos events
curl -k -X GET "https://${cleanEndpoint}/Tools/Chaos/Events?api-version=6.2" \\
  --cert client.pem --key client.key

# Get events with time filter
START="2026-02-01T00:00:00Z"
END="2026-02-14T00:00:00Z"
curl -k -X GET "https://${cleanEndpoint}/Tools/Chaos/Events?api-version=6.2&StartTimeUtc=\${START}&EndTimeUtc=\${END}" \\
  --cert client.pem --key client.key
\`\`\`

### Get Chaos Status

\`\`\`bash
curl -k -X GET "https://${cleanEndpoint}/Tools/Chaos?api-version=6.2" \\
  --cert client.pem --key client.key
\`\`\`

### Get Chaos Schedule

\`\`\`bash
curl -k -X GET "https://${cleanEndpoint}/Tools/Chaos/Schedule?api-version=6.2" \\
  --cert client.pem --key client.key
\`\`\`

---

## 📊 Event Analysis

### Generate Summary Report

\`\`\`powershell
$report = Get-ServiceFabricChaosReport
$events = $report.ChaosEvents

$summary = [PSCustomObject]@{
    TotalEvents = $events.Count
    FaultEvents = ($events | Where-Object Kind -eq "ExecutingFaults").Count
    ValidationFailures = ($events | Where-Object Kind -eq "ValidationFailed").Count
    StartEvents = ($events | Where-Object Kind -eq "Started").Count
    StopEvents = ($events | Where-Object Kind -eq "Stopped").Count
    FirstEvent = ($events | Sort-Object TimeStampUtc | Select-Object -First 1).TimeStampUtc
    LastEvent = ($events | Sort-Object TimeStampUtc | Select-Object -Last 1).TimeStampUtc
}

$summary | Format-List *
\`\`\`

---

## 📚 Additional Resources

- [Chaos Events API](https://learn.microsoft.com/rest/api/servicefabric/sfclient-api-getchaosevents)
- [Chaos Testing Overview](https://learn.microsoft.com/azure/service-fabric/service-fabric-controlled-chaos)
- [Testability Scenarios](https://learn.microsoft.com/azure/service-fabric/service-fabric-testability-scenarios)
`;
    }
    
    static generateRestartPartition(clusterEndpoint: string): string {
        const cleanEndpoint = this.stripProtocol(clusterEndpoint);
        return `# ⚠️ Restart Partition (Data Loss Test)

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## 📋 Overview

Restart partition induces data loss on a stateful service partition for testing purposes. It simulates quorum loss scenarios to validate your service's data loss handling and recovery.

**⚠️ DANGER:** This operation causes **ACTUAL DATA LOSS** on the target partition. Only use for:
- Testing \`OnDataLossAsync\` handler implementation
- Validating backup/restore workflows
- Disaster recovery drills in non-production environments

---

## 🔨 PowerShell Commands

### Invoke Data Loss on Partition

\`\`\`powershell
# Get partition to test
$serviceName = "fabric:/MyApp/MyStatefulService"
$partition = Get-ServiceFabricPartition -ServiceName $serviceName
$partitionId = $partition.PartitionId

# Start data loss test
$operationId = [Guid]::NewGuid()

# DataLossMode options:
#   PartialDataLoss - Only minority of replicas removed (quorum maintained)
#   FullDataLoss    - All replicas removed (complete data loss)

Start-ServiceFabricPartitionDataLoss \`
    -OperationId $operationId \`
    -PartitionId $partitionId \`
    -DataLossMode FullDataLoss

# Monitor operation progress
Get-ServiceFabricPartitionDataLossProgress -OperationId $operationId
\`\`\`

📚 **Reference:** [Start-ServiceFabricPartitionDataLoss](https://learn.microsoft.com/powershell/module/servicefabric/start-servicefabricpartitiondataloss)

### Invoke Quorum Loss

\`\`\`powershell
# Simulate quorum loss (partition becomes unavailable)
$operationId = [Guid]::NewGuid()

Start-ServiceFabricPartitionQuorumLoss \`
    -OperationId $operationId \`
    -PartitionId $partitionId \`
    -QuorumLossMode QuorumReplicas \`
    -QuorumLossDurationInSeconds 30

# QuorumLossMode options:
#   QuorumReplicas - Remove enough replicas to lose quorum
#   AllReplicas    - Remove all replicas

# Monitor progress
Get-ServiceFabricPartitionQuorumLossProgress -OperationId $operationId
\`\`\`

📚 **Reference:** [Start-ServiceFabricPartitionQuorumLoss](https://learn.microsoft.com/powershell/module/servicefabric/start-servicefabricpartitionquorumloss)

### Restart Partition (All Replicas)

\`\`\`powershell
# Restart all replicas in a partition simultaneously
$operationId = [Guid]::NewGuid()

Start-ServiceFabricPartitionRestart \`
    -OperationId $operationId \`
    -PartitionId $partitionId \`
    -RestartPartitionMode AllReplicasOrInstances

# RestartPartitionMode options:
#   OnlyActiveSecondaries     - Only restart secondary replicas
#   AllReplicasOrInstances    - Restart all replicas/instances

# Monitor progress
Get-ServiceFabricPartitionRestartProgress -OperationId $operationId

# Wait for completion
$timeout = (Get-Date).AddMinutes(5)
while ((Get-Date) -lt $timeout) {
    $progress = Get-ServiceFabricPartitionRestartProgress -OperationId $operationId
    if ($progress.State -eq "Completed") {
        Write-Host "Partition restart completed" -ForegroundColor Green
        break
    }
    elseif ($progress.State -eq "Faulted") {
        Write-Host "Partition restart failed" -ForegroundColor Red
        $progress | Format-List *
        break
    }
    Write-Host "State: $($progress.State)" -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}
\`\`\`

📚 **Reference:** [Start-ServiceFabricPartitionRestart](https://learn.microsoft.com/powershell/module/servicefabric/start-servicefabricpartitionrestart)

---

## 🌐 REST API Examples

### Start Data Loss

\`\`\`bash
OPERATION_ID=$(uuidgen)

curl -k -X POST "https://${cleanEndpoint}/Faults/Services/MyApp~MyService/$/GetPartitions/{partitionId}/$/StartDataLoss?api-version=6.0&OperationId=\${OPERATION_ID}&DataLossMode=FullDataLoss" \\
  --cert client.pem --key client.key
\`\`\`

### Get Data Loss Progress

\`\`\`bash
curl -k -X GET "https://${cleanEndpoint}/Faults/Services/MyApp~MyService/$/GetPartitions/{partitionId}/$/GetDataLossProgress?api-version=6.0&OperationId=\${OPERATION_ID}" \\
  --cert client.pem --key client.key
\`\`\`

### Start Quorum Loss

\`\`\`bash
curl -k -X POST "https://${cleanEndpoint}/Faults/Services/MyApp~MyService/$/GetPartitions/{partitionId}/$/StartQuorumLoss?api-version=6.0&OperationId=\${OPERATION_ID}&QuorumLossMode=QuorumReplicas&QuorumLossDuration=30" \\
  --cert client.pem --key client.key
\`\`\`

### Start Partition Restart

\`\`\`bash
curl -k -X POST "https://${cleanEndpoint}/Faults/Services/MyApp~MyService/$/GetPartitions/{partitionId}/$/StartRestart?api-version=6.0&OperationId=\${OPERATION_ID}&RestartPartitionMode=AllReplicasOrInstances" \\
  --cert client.pem --key client.key
\`\`\`

---

## 📊 Validate After Data Loss

\`\`\`powershell
# Check partition health after data loss
$partition = Get-ServiceFabricPartition -PartitionId $partitionId
Write-Host "Partition Status: $($partition.PartitionStatus)"
Write-Host "Health State: $($partition.HealthState)"

# Check replicas rebuilt
Get-ServiceFabricReplica -PartitionId $partitionId |
    Select-Object NodeName, ReplicaRole, ReplicaStatus, HealthState | Format-Table -AutoSize

# Verify data loss handler was invoked
Get-ServiceFabricApplicationHealth -ApplicationName "fabric:/MyApp" |
    Select-Object -ExpandProperty HealthEvents |
    Where-Object { $_.HealthInformation.Description -like "*DataLoss*" }
\`\`\`

---

## ⚠️ Safety Guidelines

### Pre-Test Checklist

1. **Non-production only**: Never run on production clusters
2. **Backup first**: Take backup of target partition before test
3. **Verify handler**: Ensure \`OnDataLossAsync\` is properly implemented
4. **Monitor closely**: Watch cluster health during test
5. **Document results**: Record test outcomes for compliance

### Understanding Data Loss Modes

| Mode | Effect | Recovery |
|------|--------|----------|
| **PartialDataLoss** | Remove minority of replicas | Automatic rebuild from surviving replicas |
| **FullDataLoss** | Remove all replicas | Triggers \`OnDataLossAsync\`, restore from backup |
| **QuorumReplicas** | Remove enough for quorum loss | Partition unavailable until quorum restored |
| **AllReplicas** | Remove every replica | Full rebuild required |

---

## 📚 Additional Resources

- [Testability Actions](https://learn.microsoft.com/azure/service-fabric/service-fabric-testability-actions)
- [Data Loss Testing](https://learn.microsoft.com/azure/service-fabric/service-fabric-testability-scenarios#invoke-data-loss)
- [OnDataLossAsync](https://learn.microsoft.com/azure/service-fabric/service-fabric-reliable-services-backup-restore)
- [Fault Analysis Service](https://learn.microsoft.com/azure/service-fabric/service-fabric-testability-scenarios)
`;
    }
    
    // ==================== BACKUP & RESTORE OPERATIONS ====================
    
    static generateEnableBackup(clusterEndpoint: string): string {
        const cleanEndpoint = this.stripProtocol(clusterEndpoint);
        return `# 💾 Enable Backup

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## 📋 Overview

Enable periodic backups for Service Fabric partitions by configuring a backup policy. Backups can be stored in Azure Storage or file shares.

**⚠️ Important:** Backup/Restore operations require the **Backup Restore Service** to be enabled in your cluster.

---

## 🔨 PowerShell Commands

### Using Microsoft.ServiceFabric.Powershell.Http Module

\`\`\`powershell
# Install the HTTP module (supports Windows and Linux)
Install-Module -Name Microsoft.ServiceFabric.Powershell.Http -AllowPrerelease -AllowClobber -Force
Import-Module Microsoft.ServiceFabric.Powershell.Http

# Connect to cluster (see Connection Guide for certificate setup)
Connect-SFCluster -ConnectionEndpoint ${clusterEndpoint} \`
    -ServerCertThumbprint "YOUR_SERVER_CERT_THUMBPRINT" \`
    -X509Credential \`
    -ClientCertificate $x509Certificate

# Create backup policy for Azure Blob Storage
$backupPolicy = @{
    Name = "DailyAzureBackup"
    AutoRestoreOnDataLoss = $false
    MaxIncrementalBackups = 3
    Schedule = @{
        ScheduleKind = "FrequencyBased"
        Interval = "PT24H"  # Every 24 hours
    }
    Storage = @{
        StorageKind = "AzureBlobStore"
        ConnectionString = "DefaultEndpointsProtocol=https;AccountName=myaccount;AccountKey=..."
        ContainerName = "sfbackups"
    }
}

# Enable backup for application
Enable-SFApplicationBackup \`
    -ApplicationId "MyApp" \`
    -BackupPolicyName "DailyAzureBackup"

# Enable backup for specific service
Enable-SFServiceBackup \`
    -ServiceId "MyApp~MyService" \`
    -BackupPolicyName "DailyAzureBackup"

# Enable backup for specific partition
Enable-SFPartitionBackup \`
    -PartitionId "726a6a23-5c0e-4c6c-a456-789012345678" \`
    -BackupPolicyName "DailyAzureBackup"
\`\`\`

📚 **Reference:** [Microsoft.ServiceFabric.Powershell.Http](https://www.powershellgallery.com/packages/Microsoft.ServiceFabric.Powershell.Http)

### Create Backup Policy

\`\`\`powershell
# Time-based backup (every 24 hours)
New-SFBackupPolicy -BackupPolicyName "DailyAzureBackup" -Body @{
    AutoRestoreOnDataLoss = $false
    MaxIncrementalBackups = 3
    Schedule = @{
        ScheduleKind = "FrequencyBased"
        Interval = "PT24H"
    }
    Storage = @{
        StorageKind = "AzureBlobStore"
        FriendlyName = "Azure_storageaccount"
        ConnectionString = "DefaultEndpointsProtocol=https;AccountName=storageaccount;AccountKey=..."
        ContainerName = "sfbackups"
    }
}

# Frequency-based backup (every 2 hours)
New-SFBackupPolicy -BackupPolicyName "FrequentBackup" -Body @{
    AutoRestoreOnDataLoss = $false
    MaxIncrementalBackups = 5
    Schedule = @{
        ScheduleKind = "FrequencyBased"
        Interval = "PT2H"
    }
    Storage = @{
        StorageKind = "AzureBlobStore"
        ConnectionString = "..."
        ContainerName = "sfbackups"
    }
}

# File share backup
New-SFBackupPolicy -BackupPolicyName "FileShareBackup" -Body @{
    AutoRestoreOnDataLoss = $false
    MaxIncrementalBackups = 3
    Schedule = @{
        ScheduleKind = "FrequencyBased"
        Interval = "PT24H"
    }
    Storage = @{
        StorageKind = "FileShare"
        Path = "\\\\myserver\\sfbackups"
        PrimaryUserName = "domain\\user"
        PrimaryPassword = "password"
    }
}

# Verify policy created
Get-SFBackupPolicyList | Select-Object Name, AutoRestoreOnDataLoss
\`\`\`

---

## 🌐 REST API Examples

### Create Backup Policy

\`\`\`bash
curl -k -X POST "https://${cleanEndpoint}/BackupRestore/BackupPolicies/$/Create?api-version=6.4" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json" \\
  -d '{
    "Name": "DailyAzureBackup",
    "AutoRestoreOnDataLoss": false,
    "MaxIncrementalBackups": 3,
    "Schedule": {
      "ScheduleKind": "FrequencyBased",
      "Interval": "PT24H"
    },
    "Storage": {
      "StorageKind": "AzureBlobStore",
      "FriendlyName": "Azure_storageaccount",
      "ConnectionString": "DefaultEndpointsProtocol=https;AccountName=storageaccount;AccountKey=...",
      "ContainerName": "sfbackups"
    }
  }'
\`\`\`

### Enable Backup for Application

\`\`\`bash
curl -k -X POST "https://${cleanEndpoint}/Applications/MyApp/$/EnableBackup?api-version=6.4" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json" \\
  -d '{
    "BackupPolicyName": "DailyAzureBackup"
  }'
\`\`\`

### Enable Backup for Service

\`\`\`bash
curl -k -X POST "https://${cleanEndpoint}/Services/MyApp~MyService/$/EnableBackup?api-version=6.4" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json" \\
  -d '{
    "BackupPolicyName": "DailyAzureBackup"
  }'
\`\`\`

### Enable Backup for Partition

\`\`\`bash
curl -k -X POST "https://${cleanEndpoint}/Partitions/726a6a23-5c0e-4c6c-a456-789012345678/$/EnableBackup?api-version=6.4" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json" \\
  -d '{
    "BackupPolicyName": "DailyAzureBackup"
  }'
\`\`\`

---

## 📦 Storage Configuration

### Azure Blob Storage

\`\`\`powershell
# Using connection string
$storage = @{
    StorageKind = "AzureBlobStore"
    FriendlyName = "Azure_Production"
    ConnectionString = "DefaultEndpointsProtocol=https;AccountName=sfbackups;AccountKey=YOUR_KEY;EndpointSuffix=core.windows.net"
    ContainerName = "servicefabric-backups"
}

# Using SAS token
$storage = @{
    StorageKind = "AzureBlobStore"
    FriendlyName = "Azure_Production"
    ConnectionString = "BlobEndpoint=https://sfbackups.blob.core.windows.net;SharedAccessSignature=sv=2020-08-04&ss=b&srt=sco&sp=rwdlac..."
    ContainerName = "servicefabric-backups"
}
\`\`\`

### File Share

\`\`\`powershell
$storage = @{
    StorageKind = "FileShare"
    Path = "\\\\fileserver.domain.com\\sfbackups"
    PrimaryUserName = "DOMAIN\\backupuser"
    PrimaryPassword = "SecurePassword123!"
    # Optional secondary credentials for failover
    SecondaryUserName = "DOMAIN\\backupuser2"
    SecondaryPassword = "SecurePassword456!"
}
\`\`\`

### Azure Data Lake (DsmsAzureBlobStore)

\`\`\`powershell
$storage = @{
    StorageKind = "DsmsAzureBlobStore"
    StorageCredentialsSourceLocation = "https://mykeyvault.vault.azure.net/secrets/backupcreds"
    ContainerName = "sfbackups"
}
\`\`\`

---

## 🔍 Verify Backup Configuration

\`\`\`powershell
# List all backup policies
Get-SFBackupPolicyList

# Get specific policy details
Get-SFBackupPolicy -BackupPolicyName "DailyAzureBackup"

# Check which partitions have backup enabled
Get-SFApplicationBackupConfigurationInfo -ApplicationId "MyApp"
Get-SFServiceBackupConfigurationInfo -ServiceId "MyApp~MyService"
Get-SFPartitionBackupInfo -PartitionId "726a6a23-5c0e-4c6c-a456-789012345678"

# List all entities with backup enabled
Get-SFBackupEntityList
\`\`\`

---

## 📅 Schedule Options

### Frequency-Based Schedule

\`\`\`powershell
# Every 2 hours
@{ ScheduleKind = "FrequencyBased"; Interval = "PT2H" }

# Every 12 hours
@{ ScheduleKind = "FrequencyBased"; Interval = "PT12H" }

# Every 24 hours (daily)
@{ ScheduleKind = "FrequencyBased"; Interval = "PT24H" }

# Every week (168 hours)
@{ ScheduleKind = "FrequencyBased"; Interval = "PT168H" }
\`\`\`

### Time-Based Schedule

\`\`\`powershell
# Daily at 2 AM UTC
@{
    ScheduleKind = "TimeBased"
    ScheduleFrequencyType = "Daily"
    RunTimes = @("0002-01-01T02:00:00Z")
}

# Weekly on Sundays at 1 AM UTC
@{
    ScheduleKind = "TimeBased"
    ScheduleFrequencyType = "Weekly"
    RunDays = @("Sunday")
    RunTimes = @("0002-01-01T01:00:00Z")
}
\`\`\`

---

## ⚠️ Prerequisites & Best Practices

### Prerequisites

1. **Backup Restore Service Enabled**: Cluster must have Backup Restore Service enabled
2. **Stateful Services Only**: Only stateful Reliable Services and Reliable Actors support backup
3. **Storage Access**: Cluster nodes need network access to storage location
4. **Permissions**: Certificate/credentials must have write access to storage

### Verify Backup Service

\`\`\`powershell
# Check if Backup Restore service is running
Get-SFService -ApplicationId "System" | Where-Object ServiceName -like "*Backup*"

# Expected output:
# ServiceName        : fabric:/System/BackupRestoreService
# ServiceManifestName: BackupRestoreServicePkg
# ServiceStatus      : Active
\`\`\`

### Best Practices

1. **Test Policies**: Test backup policy in development first
2. **Monitor Storage**: Ensure adequate storage space
3. **Retention**: Configure \`MaxIncrementalBackups\` based on RPO requirements
4. **Security**: Use SAS tokens or managed identities instead of storage keys
5. **Verify Backups**: Regularly check backup completion
6. **Multiple Policies**: Create different policies for different RTO/RPO needs
7. **Auto-Restore**: Only enable \`AutoRestoreOnDataLoss\` after thorough testing

---

## 🔧 Troubleshooting

### Service Not Available

\`\`\`powershell
# Check if Backup Restore service exists
Get-SFApplication -ApplicationName "fabric:/System" | Get-SFService | 
    Where-Object ServiceName -eq "fabric:/System/BackupRestoreService"

# If not available, enable in cluster configuration
# Requires cluster upgrade to enable BackupRestoreService
\`\`\`

### Storage Connection Issues

\`\`\`powershell
# Test Azure Storage connection from PowerShell
$storageAccount = New-AzStorageContext -ConnectionString "YOUR_CONNECTION_STRING"
Get-AzStorageContainer -Context $storageAccount

# Test file share access
Test-Path "\\\\fileserver\\sfbackups"
\`\`\`

### Check Backup Events

\`\`\`powershell
# Query backup-related events
Get-SFApplicationEvent -ApplicationId "MyApp" -StartTimeUtc (Get-Date).AddDays(-1) |
    Where-Object Kind -like "*Backup*"
\`\`\`

---

## 📚 Additional Resources

- [Periodic Backup Configuration](https://learn.microsoft.com/azure/service-fabric/service-fabric-backuprestoreservice-quickstart-azurecluster)
- [Backup and Restore in Service Fabric](https://learn.microsoft.com/azure/service-fabric/service-fabric-reliable-services-backup-restore)
- [On-Demand Backup](https://learn.microsoft.com/azure/service-fabric/service-fabric-backuprestoreservice-ondemand-backup)
- [Backup Policy REST API](https://learn.microsoft.com/rest/api/servicefabric/sfclient-api-createbackuppolicy)
- [Microsoft.ServiceFabric.Powershell.Http Module](https://www.powershellgallery.com/packages/Microsoft.ServiceFabric.Powershell.Http)

---

**⚡ Quick Reference:**
\`\`\`powershell
# Install HTTP module
Install-Module Microsoft.ServiceFabric.Powershell.Http -AllowPrerelease

# Create policy
New-SFBackupPolicy -BackupPolicyName "DailyBackup" -Body @{...}

# Enable for application
Enable-SFApplicationBackup -ApplicationId "MyApp" -BackupPolicyName "DailyBackup"

# Verify
Get-SFBackupPolicyList
Get-SFApplicationBackupConfigurationInfo -ApplicationId "MyApp"
\`\`\`
`;
    }
    
    static generateDisableBackup(clusterEndpoint: string): string {
        const cleanEndpoint = this.stripProtocol(clusterEndpoint);
        return `# 🚫 Disable Backup

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## 📋 Overview

Disable periodic backups for applications, services, or partitions that were previously configured with a backup policy.

---

## 🔨 PowerShell Commands

### Using Microsoft.ServiceFabric.Powershell.Http Module

\`\`\`powershell
# Disable backup for application
Disable-SFApplicationBackup -ApplicationId "MyApp"

# Disable backup for service
Disable-SFServiceBackup -ServiceId "MyApp~MyService"

# Disable backup for partition
Disable-SFPartitionBackup -PartitionId "726a6a23-5c0e-4c6c-a456-789012345678"

# Verify backup disabled
Get-SFApplicationBackupConfigurationInfo -ApplicationId "MyApp"
\`\`\`

📚 **Reference:** [Microsoft.ServiceFabric.Powershell.Http](https://www.powershellgallery.com/packages/Microsoft.ServiceFabric.Powershell.Http)

### Clean Up Complete Configuration

\`\`\`powershell
# Get all applications with backup enabled
$appsWithBackup = Get-SFBackupEntityList | Where-Object EntityKind -eq "Application"

# Disable backup for all
foreach ($app in $appsWithBackup) {
    Write-Host "Disabling backup for $($app.EntityId)"
    Disable-SFApplicationBackup -ApplicationId $app.EntityId
}

# Delete backup policy
Remove-SFBackupPolicy -BackupPolicyName "DailyAzureBackup"

# Verify all disabled
Get-SFBackupEntityList
\`\`\`

---

## 🌐 REST API Examples

### Disable Application Backup

\`\`\`bash
curl -k -X POST "https://${cleanEndpoint}/Applications/MyApp/$/DisableBackup?api-version=6.4" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json"
\`\`\`

### Disable Service Backup

\`\`\`bash
curl -k -X POST "https://${cleanEndpoint}/Services/MyApp~MyService/$/DisableBackup?api-version=6.4" \\
  --cert client.pem --key client.key
\`\`\`

### Delete Backup Policy

\`\`\`bash
# Must disable all entities using policy first
curl -k -X DELETE "https://${cleanEndpoint}/BackupRestore/BackupPolicies/DailyAzureBackup/$/Delete?api-version=6.4" \\
  --cert client.pem --key client.key
\`\`\`

---

## ⚠️ Important Notes

1. **Existing Backups Preserved**: Disabling backup doesn't delete existing backups from storage
2. **Policy Dependencies**: Can't delete policy until all entities are disabled
3. **Graceful Operation**: Current backup operation completes before disabling
4. **Partition-Level**: Service-level or App-level disable applies to all child partitions

---

## 📚 Additional Resources

- [Disable Backup REST API](https://learn.microsoft.com/rest/api/servicefabric/sfclient-api-disableapplicationbackup)
- [Delete Backup Policy](https://learn.microsoft.com/rest/api/servicefabric/sfclient-api-deletebackuppolicy)
`;
    }
    
    static generateTriggerBackup(clusterEndpoint: string): string {
        const cleanEndpoint = this.stripProtocol(clusterEndpoint);
        return `# 📤 Trigger Ad-hoc Backup

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## 📋 Overview

Trigger an immediate backup of a partition outside of the scheduled backup policy. Useful for:
- Backup before planned upgrade or maintenance
- Capture state before risky operation
- Manual backup for testing

---

## 🔨 PowerShell Commands

### Using Microsoft.ServiceFabric.Powershell.Http Module

\`\`\`powershell
# Trigger backup using configured policy storage
Backup-SFPartition -PartitionId "726a6a23-5c0e-4c6c-a456-789012345678"

# Trigger backup to specific Azure Blob storage (override policy)
$backupStorage = @{
    StorageKind = "AzureBlobStore"
    ConnectionString = "DefaultEndpointsProtocol=https;AccountName=myaccount;AccountKey=..."
    ContainerName = "adhoc-backups"
}

Backup-SFPartition \`
    -PartitionId "726a6a23-5c0e-4c6c-a456-789012345678" \`
    -AzureBlobStore $backupStorage

# Trigger backup to file share (override policy)
$backupStorage = @{
    StorageKind = "FileShare"
    Path = "\\\\fileserver\\adhoc-backups"
    PrimaryUserName = "DOMAIN\\user"
    PrimaryPassword = "password"
}

Backup-SFPartition \`
    -PartitionId "726a6a23-5c0e-4c6c-a456-789012345678" \`
    -FileShare $backupStorage

# Monitor backup progress
$backupProgress = Get-SFPartitionBackupProgress -PartitionId "726a6a23-5c0e-4c6c-a456-789012345678"
$backupProgress | Select-Object BackupState, TimeStampUtc, FailureError
\`\`\`

📚 **Reference:** [Backup-SFPartition](https://learn.microsoft.com/powershell/module/servicefabric/backup-sfpartition)

### Batch Backup Multiple Partitions

\`\`\`powershell
# Get all partitions for a service
$serviceName = "fabric:/MyApp/MyService"
$partitions = Get-SFPartition -ServiceName $serviceName

# Trigger backup for each partition
foreach ($partition in $partitions) {
    Write-Host "Triggering backup for partition $($partition.PartitionId)"
    Backup-SFPartition -PartitionId $partition.PartitionId
    
    # Wait 5 seconds between requests to avoid throttling
    Start-Sleep -Seconds 5
}

# Monitor all backups
foreach ($partition in $partitions) {
    $progress = Get-SFPartitionBackupProgress -PartitionId $partition.PartitionId
    Write-Host "$($partition.PartitionId): $($progress.BackupState)"
}
\`\`\`

---

## 🌐 REST API Examples

### Trigger Backup Using Policy Storage

\`\`\`bash
curl -k -X POST "https://${cleanEndpoint}/Partitions/726a6a23-5c0e-4c6c-a456-789012345678/$/Backup?api-version=6.4" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json"
\`\`\`

### Trigger Backup to Azure Blob

\`\`\`bash
curl -k -X POST "https://${cleanEndpoint}/Partitions/726a6a23-5c0e-4c6c-a456-789012345678/$/Backup?api-version=6.4" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json" \\
  -d '{
    "BackupStorage": {
      "StorageKind": "AzureBlobStore",
      "FriendlyName": "AdHoc_Backup",
      "ConnectionString": "DefaultEndpointsProtocol=https;AccountName=storageaccount;AccountKey=...",
      "ContainerName": "adhoc-backups"
    }
  }'
\`\`\`

### Trigger Backup to File Share

\`\`\`bash
curl -k -X POST "https://${cleanEndpoint}/Partitions/726a6a23-5c0e-4c6c-a456-789012345678/$/Backup?api-version=6.4" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json" \\
  -d '{
    "BackupStorage": {
      "StorageKind": "FileShare",
      "Path": "\\\\\\\\fileserver\\\\adhoc-backups",
      "PrimaryUserName": "DOMAIN\\\\user",
      "PrimaryPassword": "password"
    }
  }'
\`\`\`

---

## 📊 Monitor Backup Completion

\`\`\`powershell
# Monitor specific partition backup
$partitionId = "726a6a23-5c0e-4c6c-a456-789012345678"
$timeout = (Get-Date).AddMinutes(30)

while ((Get-Date) -lt $timeout) {
    $progress = Get-SFPartitionBackupProgress -PartitionId $partitionId
    
    Write-Host "$(Get-Date -Format 'HH:mm:ss') - Backup State: $($progress.BackupState)"
    
    if ($progress.BackupState -eq "Success") {
        Write-Host "✅ Backup completed successfully!" -ForegroundColor Green
        Write-Host "Backup Location: $($progress.BackupLocation)"
        Write-Host "Backup Size: $([math]::Round($progress.BackupSize / 1MB, 2)) MB"
        break
    }
    elseif ($progress.BackupState -eq "Failure") {
        Write-Host "❌ Backup failed!" -ForegroundColor Red
        Write-Host "Error: $($progress.FailureError)"
        break
    }
    
    Start-Sleep -Seconds 10
}
\`\`\`

---

## 🎯 Common Scenarios

### Pre-Upgrade Backup

\`\`\`powershell
# Backup all services before application upgrade
$appName = "fabric:/MyApp"
$services = Get-SFApplication -ApplicationName $appName | Get-SFService

foreach ($service in $services) {
    $partitions = Get-SFPartition -ServiceName $service.ServiceName
    
    foreach ($partition in $partitions) {
        Write-Host "Backing up $($service.ServiceName) - $($partition.PartitionId)"
        Backup-SFPartition -PartitionId $partition.PartitionId
    }
}
\`\`\`

### Test Backup to Separate Location

\`\`\`powershell
# Test backup without affecting production backup policy
$testStorage = @{
    StorageKind = "AzureBlobStore"
    ConnectionString = "DefaultEndpointsProtocol=https;AccountName=teststorage;AccountKey=..."
    ContainerName = "test-backups"
}

$partitionId = "726a6a23-5c0e-4c6c-a456-789012345678"
Backup-SFPartition -PartitionId $partitionId -AzureBlobStore $testStorage

# Verify backup completed
$progress = Get-SFPartitionBackupProgress -PartitionId $partitionId
if ($progress.BackupState -eq "Success") {
    Write-Host "Test backup successful: $($progress.BackupLocation)"
}
\`\`\`

---

## ⚠️ Important Notes

1. **Partition Must Have Backup Enabled**: Either through policy or ad-hoc storage configuration
2. **One Backup at a Time**: Can't trigger backup if one is already in progress
3. **Full Backup**: Ad-hoc backups are always full backups, not incremental
4. **Timeout**: Default timeout is 10 minutes, configurable via api-version query parameter
5. **Storage Override**: Specifying storage in ad-hoc backup overrides policy storage for that backup only

---

## 📚 Additional Resources

- [On-Demand Backup](https://learn.microsoft.com/azure/service-fabric/service-fabric-backuprestoreservice-ondemand-backup)
- [Backup Partition REST API](https://learn.microsoft.com/rest/api/servicefabric/sfclient-api-backuppartition)
- [Get Backup Progress](https://learn.microsoft.com/rest/api/servicefabric/sfclient-api-getpartitionbackupprogress)
`;
    }
    
    static generateGetBackupProgress(clusterEndpoint: string): string {
        const cleanEndpoint = this.stripProtocol(clusterEndpoint);
        return `# ⏳ Get Backup Progress

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## 📋 Overview

Monitor the progress and status of backup operations for Service Fabric partitions.

---

## 🔨 PowerShell Commands

### Using Microsoft.ServiceFabric.Powershell.Http Module

\`\`\`powershell
# Get backup progress for specific partition
$partitionId = "726a6a23-5c0e-4c6c-a456-789012345678"
$progress = Get-SFPartitionBackupProgress -PartitionId $partitionId

# Display status
$progress | Select-Object BackupState, TimeStampUtc, BackupLocation, BackupId

# Check detailed information
$progress | Format-List *
\`\`\`

📚 **Reference:** [Get-SFPartitionBackupProgress](https://learn.microsoft.com/rest/api/servicefabric/sfclient-api-getpartitionbackupprogress)

### Monitor All Service Partitions

\`\`\`powershell
# Get all partitions for a service
$serviceName = "fabric:/MyApp/MyService"
$partitions = Get-SFPartition -ServiceName $serviceName

# Check backup status for each
$backupStatus = foreach ($partition in $partitions) {
    $progress = Get-SFPartitionBackupProgress -PartitionId $partition.PartitionId
    [PSCustomObject]@{
        PartitionId = $partition.PartitionId
        BackupState = $progress.BackupState
        TimeStamp = $progress.TimeStampUtc
        BackupLocation = $progress.BackupLocation
        FailureError = $progress.FailureError.Message
    }
}

$backupStatus | Format-Table -AutoSize
\`\`\`

### Get Latest Backup Information

\`\`\`powershell
# Get latest backup info for partition
$partitionId = "726a6a23-5c0e-4c6c-a456-789012345678"
$latestBackup = Get-SFPartitionBackupInfo -PartitionId $partitionId -Latest

# Display backup details
$latestBackup | Select-Object BackupId, BackupLocation, CreationTimeUtc, BackupType, EpochOfLastBackupRecord

# Get all backups (with date range)
$startDate = (Get-Date).AddDays(-7).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$endDate = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

$allBackups = Get-SFPartitionBackupInfo \`
    -PartitionId $partitionId \`
    -StartDateTimeFilter $startDate \`
    -EndDateTimeFilter $endDate

$allBackups | Select-Object BackupId, CreationTimeUtc, BackupType, BackupSize | Format-Table
\`\`\`

---

## 🌐 REST API Examples

### Get Backup Progress

\`\`\`bash
curl -k -X GET "https://${cleanEndpoint}/Partitions/726a6a23-5c0e-4c6c-a456-789012345678/$/GetBackupProgress?api-version=6.4" \\
  --cert client.pem --key client.key
\`\`\`

### Get Latest Backup Info

\`\`\`bash
curl -k -X GET "https://${cleanEndpoint}/Partitions/726a6a23-5c0e-4c6c-a456-789012345678/$/GetBackups?api-version=6.4&Latest=true" \\
  --cert client.pem --key client.key
\`\`\`

### Get Backups with Date Filter

\`\`\`bash
START_TIME="2026-01-28T00:00:00Z"
END_TIME="2026-02-04T23:59:59Z"

curl -k -X GET "https://${cleanEndpoint}/Partitions/726a6a23-5c0e-4c6c-a456-789012345678/$/GetBackups?api-version=6.4&StartDateTimeFilter=\${START_TIME}&EndDateTimeFilter=\${END_TIME}" \\
  --cert client.pem --key client.key
\`\`\`

---

## 📊 Backup States

| State | Description |
|-------|-------------|
| **Accepted** | Backup request accepted, not started yet |
| **InProgress** | Backup is currently running |
| **Success** | Backup completed successfully |
| **Failure** | Backup failed |
| **Timeout** | Backup timed out |

### State Monitoring Script

\`\`\`powershell
function Watch-BackupProgress {
    param(
        [string]$PartitionId,
        [int]$TimeoutMinutes = 30,
        [int]$PollIntervalSeconds = 10
    )
    
    $timeout = (Get-Date).AddMinutes($TimeoutMinutes)
    
    while ((Get-Date) -lt $timeout) {
        $progress = Get-SFPartitionBackupProgress -PartitionId $PartitionId
        
        $timestamp = Get-Date -Format 'HH:mm:ss'
        $state = $progress.BackupState
        
        Write-Host "[$timestamp] State: $state" -ForegroundColor $(
            switch ($state) {
                "Success" { "Green" }
                "Failure" { "Red" }
                "Timeout" { "Yellow" }
                default { "Cyan" }
            }
        )
        
        if ($state -eq "Success") {
            Write-Host "✅ Backup completed successfully!" -ForegroundColor Green
            Write-Host "  Backup ID: $($progress.BackupId)"
            Write-Host "  Location: $($progress.BackupLocation)"
            Write-Host "  Time: $($progress.TimeStampUtc)"
            return $progress
        }
        elseif ($state -in @("Failure", "Timeout")) {
            Write-Host "❌ Backup $($state.ToLower())!" -ForegroundColor Red
            if ($progress.FailureError) {
                Write-Host "  Error: $($progress.FailureError.Message)" -ForegroundColor Red
                Write-Host "  Code: $($progress.FailureError.Code)" -ForegroundColor Red
            }
            return $progress
        }
        
        Start-Sleep -Seconds $PollIntervalSeconds
    }
    
    Write-Warning "Monitoring timed out after $TimeoutMinutes minutes"
}

# Usage
Watch-BackupProgress -PartitionId "726a6a23-5c0e-4c6c-a456-789012345678"
\`\`\`

---

## 📁 Backup Information Details

### Backup Metadata

\`\`\`powershell
# Get comprehensive backup info
$backupInfo = Get-SFPartitionBackupInfo -PartitionId $partitionId -Latest

# Key properties:
# - BackupId: Unique identifier for the backup
# - BackupType: Full or Incremental  
# - BackupLocation: Storage path where backup is saved
# - CreationTimeUtc: When backup was created
# - BackupSize: Size in bytes
# - EpochOfLastBackupRecord: Epoch data for consistency
# - LSN: Log Sequence Number for point-in-time recovery
# - BackupChainId: Links incremental backups to full backup
\`\`\`

### Generate Backup Report

\`\`\`powershell
# Generate report for all partitions in application
$appName = "fabric:/MyApp"
$services = Get-SFApplication -ApplicationName $appName | Get-SFService

$backupReport = foreach ($service in $services) {
    $partitions = Get-SFPartition -ServiceName $service.ServiceName
    
    foreach ($partition in $partitions) {
        $latestBackup = Get-SFPartitionBackupInfo -PartitionId $partition.PartitionId -Latest
        
        if ($latestBackup) {
            [PSCustomObject]@{
                ServiceName = $service.ServiceName
                PartitionId = $partition.PartitionId
                LastBackupTime = $latestBackup.CreationTimeUtc
                BackupType = $latestBackup.BackupType
                BackupSize_MB = [math]::Round($latestBackup.BackupSize / 1MB, 2)
                BackupLocation = $latestBackup.BackupLocation
                DaysSinceBackup = ((Get-Date) - [DateTime]$latestBackup.CreationTimeUtc).Days
            }
        }
    }
}

# Display report
$backupReport | Sort-Object DaysSinceBackup -Descending | Format-Table -AutoSize

# Find partitions with old backups
$backupReport | Where-Object DaysSinceBackup -gt 7 | 
    Select-Object ServiceName, PartitionId, LastBackupTime, DaysSinceBackup
\`\`\`

---

## 🔍 Troubleshooting

### No Backup Progress Available

\`\`\`powershell
# Check if partition has backup enabled
$backupConfig = Get-SFPartitionBackupConfigurationInfo -PartitionId $partitionId

if (!$backupConfig.PolicyName) {
    Write-Host "⚠️ No backup policy configured for this partition"
    Write-Host "Enable backup first: Enable-SFPartitionBackup -PartitionId $partitionId -BackupPolicyName 'PolicyName'"
}
\`\`\`

### Check Backup History

\`\`\`powershell
# List all backups for partition (last 30 days)
$startDate = (Get-Date).AddDays(-30).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$endDate = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

$backups = Get-SFPartitionBackupInfo \`
    -PartitionId $partitionId \`
    -StartDateTimeFilter $startDate \`
    -EndDateTimeFilter $endDate

if ($backups.Count -eq 0) {
    Write-Host "No backups found in the last 30 days"
}
else {
    Write-Host "Found $($backups.Count) backups:"
    $backups | Select-Object CreationTimeUtc, BackupType, BackupSize | Format-Table
}
\`\`\`

---

## 📚 Additional Resources

- [Get Backup Progress API](https://learn.microsoft.com/rest/api/servicefabric/sfclient-api-getpartitionbackupprogress)
- [Get Partition Backup List](https://learn.microsoft.com/rest/api/servicefabric/sfclient-api-getpartitionbackuplist)
- [Backup Metadata](https://learn.microsoft.com/azure/service-fabric/service-fabric-backuprestoreservice-quickstart-azurecluster#understanding-backup-metadata)
`;
    }
    
    static generateRestoreBackup(clusterEndpoint: string): string {
        const cleanEndpoint = this.stripProtocol(clusterEndpoint);
        return `# 📥 Restore from Backup

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## 📋 Overview

Restore a Service Fabric partition from a backup. This replaces the partition's current data with the backup data.

**⚠️ CRITICAL WARNING:** Restore operations **PERMANENTLY DELETE** current partition data. Use with extreme caution!

---

## 🔨 PowerShell Commands

### Using Microsoft.ServiceFabric.Powershell.Http Module

\`\`\`powershell
# Restore from latest backup
$partitionId = "726a6a23-5c0e-4c6c-a456-789012345678"

# Get latest backup info
$latestBackup = Get-SFPartitionBackupInfo -PartitionId $partitionId -Latest

# Restore from the backup
Restore-SFPartition \`
    -PartitionId $partitionId \`
    -BackupId $latestBackup.BackupId \`
    -BackupLocation $latestBackup.BackupLocation

# Monitor restore progress
$restoreProgress = Get-SFPartitionRestoreProgress -PartitionId $partitionId
$restoreProgress | Select-Object RestoreState, TimeStampUtc, FailureError
\`\`\`

📚 **Reference:** [Restore-SFPartition](https://learn.microsoft.com/rest/api/servicefabric/sfclient-api-restorepartition)

### Restore from Specific Backup

\`\`\`powershell
# List available backups
$backups = Get-SFPartitionBackupInfo -PartitionId $partitionId
$backups | Select-Object BackupId, CreationTimeUtc, BackupType | Format-Table

# Choose specific backup by date/time
$targetBackup = $backups | Where-Object {
    $_.CreationTimeUtc -gt "2026-02-01" -and 
    $_.CreationTimeUtc -lt "2026-02-02"
} | Select-Object -First 1

# Restore from chosen backup
if ($targetBackup) {
    Write-Host "Restoring from backup: $($targetBackup.BackupId)"
    Write-Host "Backup date: $($targetBackup.CreationTimeUtc)"
    
    Restore-SFPartition \`
        -PartitionId $partitionId \`
        -BackupId $targetBackup.BackupId \`
        -BackupLocation $targetBackup.BackupLocation
}
\`\`\`

### Restore from External Storage

\`\`\`powershell
# Restore from backup in different storage account
$backupStorage = @{
    StorageKind = "AzureBlobStore"
    ConnectionString = "DefaultEndpointsProtocol=https;AccountName=backupstorage;AccountKey=..."
    ContainerName = "archived-backups"
}

$backupId = "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
$backupLocation = "https://backupstorage.blob.core.windows.net/archived-backups/MyApp/MyService/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"

Restore-SFPartition \`
    -PartitionId $partitionId \`
    -BackupId $backupId \`
    -BackupLocation $backupLocation \`
    -AzureBlobStore $backupStorage
\`\`\`

---

## 🌐 REST API Examples

### Restore from Latest Backup

\`\`\`bash
# Get latest backup info first
curl -k -X GET "https://${clusterEndpoint}/Partitions/726a6a23-5c0e-4c6c-a456-789012345678/$/GetBackups?api-version=6.4&Latest=true" \\
  --cert client.pem --key client.key > latest_backup.json

# Extract BackupId and BackupLocation from response
BACKUP_ID=\$(cat latest_backup.json | jq -r '.[0].BackupId')
BACKUP_LOCATION=\$(cat latest_backup.json | jq -r '.[0].BackupLocation')

# Trigger restore
curl -k -X POST "https://${cleanEndpoint}/Partitions/726a6a23-5c0e-4c6c-a456-789012345678/$/Restore?api-version=6.4" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json" \\
  -d "{
    \"BackupId\": \"\$BACKUP_ID\",
    \"BackupLocation\": \"\$BACKUP_LOCATION\"
  }"
\`\`\`

### Restore with External Storage Credentials

\`\`\`bash
curl -k -X POST "https://${cleanEndpoint}/Partitions/726a6a23-5c0e-4c6c-a456-789012345678/$/Restore?api-version=6.4" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json" \\
  -d '{
    "BackupId": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
    "BackupLocation": "https://backupstorage.blob.core.windows.net/archived-backups/...",
    "BackupStorage": {
      "StorageKind": "AzureBlobStore",
      "ConnectionString": "DefaultEndpointsProtocol=https;AccountName=backupstorage;...",
      "ContainerName": "archived-backups"
    }
  }'
\`\`\`

### Get Restore Progress

\`\`\`bash
curl -k -X GET "https://${cleanEndpoint}/Partitions/726a6a23-5c0e-4c6c-a456-789012345678/$/GetRestoreProgress?api-version=6.4" \\
  --cert client.pem --key client.key
\`\`\`

---

## 📊 Monitor Restore Progress

\`\`\`powershell
function Watch-RestoreProgress {
    param(
        [string]$PartitionId,
        [int]$TimeoutMinutes = 60,
        [int]$PollIntervalSeconds = 10
    )
    
    $timeout = (Get-Date).AddMinutes($TimeoutMinutes)
    
    Write-Host "⏳ Monitoring restore progress for partition $PartitionId..." -ForegroundColor Cyan
    
    while ((Get-Date) -lt $timeout) {
        $progress = Get-SFPartitionRestoreProgress -PartitionId $PartitionId
        
        $timestamp = Get-Date -Format 'HH:mm:ss'
        $state = $progress.RestoreState
        
        Write-Host "[$timestamp] State: $state" -ForegroundColor $(
            switch ($state) {
                "Success" { "Green" }
                "Failure" { "Red" }
                "Timeout" { "Yellow" }
                default { "Cyan" }
            }
        )
        
        if ($state -eq "Success") {
            Write-Host "✅ Restore completed successfully!" -ForegroundColor Green
            Write-Host "  Restored from backup: $($progress.RestoredBackupId)"
            Write-Host "  Restore time: $($progress.TimeStampUtc)"
            Write-Host "  LSN: $($progress.RestoredLsn)"
            
            # Verify partition health after restore
            Start-Sleep -Seconds 5
            $partitionHealth = Get-SFPartition -PartitionId $PartitionId
            Write-Host "  Partition Status: $($partitionHealth.PartitionStatus)"
            Write-Host "  Health State: $($partitionHealth.HealthState)"
            
            return $progress
        }
        elseif ($state -in @("Failure", "Timeout")) {
            Write-Host "❌ Restore $($state.ToLower())!" -ForegroundColor Red
            if ($progress.FailureError) {
                Write-Host "  Error: $($progress.FailureError.Message)" -ForegroundColor Red
                Write-Host "  Code: $($progress.FailureError.Code)" -ForegroundColor Red
            }
            return $progress
        }
        
        Start-Sleep -Seconds $PollIntervalSeconds
    }
    
    Write-Warning "Monitoring timed out after $TimeoutMinutes minutes"
}

# Usage
$partitionId = "726a6a23-5c0e-4c6c-a456-789012345678"
Watch-RestoreProgress -PartitionId $partitionId
\`\`\`

---

## 🎯 Complete Restore Workflow

\`\`\`powershell
function Restore-ServiceFabricPartitionSafely {
    param(
        [Parameter(Mandatory=$true)]
        [string]$PartitionId,
        
        [Parameter(Mandatory=$false)]
        [string]$BackupId,
        
        [Parameter(Mandatory=$false)]
        [switch]$UseLatestBackup,
        
        [Parameter(Mandatory=$false)]
        [switch]$Force
    )
    
    # 1. Verify partition exists
    Write-Host "🔍 Step 1: Verifying partition..." -ForegroundColor Cyan
    $partition = Get-SFPartition -PartitionId $PartitionId
    if (!$partition) {
        throw "Partition $PartitionId not found"
    }
    Write-Host "  ✓ Partition found: $($partition.ServiceName)" -ForegroundColor Green
    
    # 2. Get backup to restore
    Write-Host "🔍 Step 2: Identifying backup..." -ForegroundColor Cyan
    if ($UseLatestBackup) {
        $backup = Get-SFPartitionBackupInfo -PartitionId $PartitionId -Latest
        if (!$backup) {
            throw "No backups found for partition $PartitionId"
        }
        Write-Host "  ✓ Using latest backup from $($backup.CreationTimeUtc)" -ForegroundColor Green
    }
    elseif ($BackupId) {
        $backups = Get-SFPartitionBackupInfo -PartitionId $PartitionId
        $backup = $backups | Where-Object BackupId -eq $BackupId
        if (!$backup) {
            throw "Backup $BackupId not found"
        }
        Write-Host "  ✓ Using specified backup from $($backup.CreationTimeUtc)" -ForegroundColor Green
    }
    else {
        throw "Must specify either -BackupId or -UseLatestBackup"
    }
    
    # 3. Confirm with user (unless -Force)
    if (!$Force) {
        Write-Host "\\n⚠️  WARNING: This will DELETE all current data in the partition!" -ForegroundColor Yellow
        Write-Host "  Partition: $PartitionId" -ForegroundColor Yellow
        Write-Host "  Service: $($partition.ServiceName)" -ForegroundColor Yellow
        Write-Host "  Backup Date: $($backup.CreationTimeUtc)" -ForegroundColor Yellow
        Write-Host "  Backup Type: $($backup.BackupType)" -ForegroundColor Yellow
        
        $confirm = Read-Host "\\nType 'RESTORE' to confirm"
        if ($confirm -ne 'RESTORE') {
            Write-Host "Restore cancelled" -ForegroundColor Yellow
            return
        }
    }
    
    # 4. Trigger restore
    Write-Host "\\n🔄 Step 3: Triggering restore..." -ForegroundColor Cyan
    Restore-SFPartition \\
        -PartitionId $PartitionId \\
        -BackupId $backup.BackupId \\
        -BackupLocation $backup.BackupLocation
    
    Write-Host "  ✓ Restore request submitted" -ForegroundColor Green
    
    # 5. Monitor progress
    Write-Host "\\n⏳ Step 4: Monitoring restore progress..." -ForegroundColor Cyan
    $result = Watch-RestoreProgress -PartitionId $PartitionId -TimeoutMinutes 60
    
    return $result
}

# Usage examples:
# Restore from latest backup with confirmation
Restore-ServiceFabricPartitionSafely -PartitionId "726a6a23-5c0e-4c6c-a456-789012345678" -UseLatestBackup

# Restore from specific backup without confirmation (automated)
Restore-ServiceFabricPartitionSafely \\
    -PartitionId "726a6a23-5c0e-4c6c-a456-789012345678" \\
    -BackupId "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX" \\
    -Force
\`\`\`
    $result = Watch-RestoreProgress -PartitionId $PartitionId -TimeoutMinutes 60
    
    return $result
}

# Usage examples:
# Restore from latest backup with confirmation
Restore-ServiceFabricPartitionSafely -PartitionId "726a6a23-5c0e-4c6c-a456-789012345678" -UseLatestBackup

# Restore from specific backup without confirmation (automated)
Restore-ServiceFabricPartitionSafely \`
    -PartitionId "726a6a23-5c0e-4c6c-a456-789012345678" \`
    -BackupId "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX" \`
    -Force
\`\`\`

---

## ⚠️ Critical Safety Guidelines

### Pre-Restore Checklist

- [ ] **Verify backup integrity** - Confirm backup completed successfully
- [ ] **Check backup age** - Ensure backup is from expected timeframe  
- [ ] **Document current state** - Capture current partition metadata
- [ ] **Notify stakeholders** - Alert team of planned data replacement
- [ ] **Maintenance window** - Schedule during low-traffic period
- [ ] **Test in non-prod** - Practice restore in dev/test environment first
- [ ] **Backup current state** - Create current backup before restore (if possible)

### During Restore

1. **Service Disruption**: Partition becomes unavailable during restore
2. **Timeout**: Default 60 minutes, may need longer for large partitions
3. **No Rollback**: Cannot cancel or undo once restore begins
4. **Single Operation**: Only one restore per partition at a time

### Post-Restore Validation

\`\`\`powershell
# Validate partition after restore
$partitionId = "726a6a23-5c0e-4c6c-a456-789012345678"

# 1. Check partition status
$partition = Get-SFPartition -PartitionId $partitionId
Write-Host "Partition Status: $($partition.PartitionStatus)"
Write-Host "Health State: $($partition.HealthState)"

# 2. Check partition health
$health = Get-SFPartitionHealth -PartitionId $partitionId
Write-Host "Aggregated Health: $($health.AggregatedHealthState)"

# 3. Verify replicas
$replicas = Get-SFReplica -PartitionId $partitionId
Write-Host "Replicas: $($replicas.Count)"
$replicas | Select-Object NodeName, ReplicaRole, ReplicaStatus, HealthState | Format-Table

# 4. Check for errors
if ($health.AggregatedHealthState -ne "Ok") {
    Write-Warning "Partition health is not OK, investigating..."
    $health.HealthEvents | Where-Object HealthState -ne "Ok" | 
        Select-Object SourceId, Property, HealthState, Description | Format-Table
}
\`\`\`

---

## 🔧 Troubleshooting

### Restore Failure

\`\`\`powershell
# Check restore progress for error details
$restoreProgress = Get-SFPartitionRestoreProgress -PartitionId $partitionId

if ($restoreProgress.RestoreState -eq "Failure") {
    Write-Host "Error Message: $($restoreProgress.FailureError.Message)"
    Write-Host "Error Code: $($restoreProgress.FailureError.Code)"
    
    # Common errors:
    # - BackupNotFound: Backup location inaccessible
    # - InvalidBackup: Backup is corrupt or incompatible
    # - StorageError: Storage connection/permission issues
    # - PartitionNotFound: Partition was deleted
}
\`\`\`

### Stuck Restore

\`\`\`powershell
# If restore appears stuck, check partition status
$partition = Get-SFPartition -PartitionId $partitionId
Write-Host "Partition Status: $($partition.PartitionStatus)"

# Check if partition is in data loss
if ($partition.PartitionStatus -eq "InDataLoss") {
    Write-Host "Partition is in data loss state, restore should proceed"
}

# Check restore progress timestamp
$restoreProgress = Get-SFPartitionRestoreProgress -PartitionId $partitionId
$age = ((Get-Date) - [DateTime]$restoreProgress.TimeStampUtc).TotalMinutes
Write-Host "Restore operation age: $([math]::Round($age, 1)) minutes"
\`\`\`

---

## 📚 Additional Resources

- [Restore Partition API](https://learn.microsoft.com/rest/api/servicefabric/sfclient-api-restorepartition)
- [Periodic Backup and Restore](https://learn.microsoft.com/azure/service-fabric/service-fabric-backuprestoreservice-quickstart-azurecluster)
- [Disaster Recovery](https://learn.microsoft.com/azure/service-fabric/service-fabric-disaster-recovery)
- [Data Loss Scenarios](https://learn.microsoft.com/azure/service-fabric/service-fabric-disaster-recovery#data-loss-scenarios)

---

**⚡ Quick Reference:**
\`\`\`powershell
# Get latest backup
$backup = Get-SFPartitionBackupInfo -PartitionId $partitionId -Latest

# Restore from backup
Restore-SFPartition -PartitionId $partitionId -BackupId $backup.BackupId -BackupLocation $backup.BackupLocation

# Monitor restore
Get-SFPartitionRestoreProgress -PartitionId $partitionId

# Validate after restore
Get-SFPartition -PartitionId $partitionId | Select PartitionStatus, HealthState
\`\`\`
`;
    }
    
    static generateViewRepairTasks(clusterEndpoint: string): string {
        const cleanEndpoint = this.stripProtocol(clusterEndpoint);
        return `# 📋 View Active Repair Tasks

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## 📋 Overview

Repair tasks are Service Fabric's mechanism for coordinating infrastructure repairs (node reboots, OS updates, host maintenance) between the Repair Manager and repair executors like Azure's Infrastructure Service.

**Repair Task Lifecycle:**
\`Created → Claimed → Preparing → Approved → Executing → Restoring → Completed\`

---

## 🔨 PowerShell Commands

### List All Repair Tasks

\`\`\`powershell
# Get all repair tasks (active and completed)
Get-ServiceFabricRepairTask | Format-Table TaskId, State, Action, ResultStatus -AutoSize

# Get detailed view
Get-ServiceFabricRepairTask | Format-List *
\`\`\`

📚 **Reference:** [Get-ServiceFabricRepairTask](https://learn.microsoft.com/powershell/module/servicefabric/get-servicefabricrepairtask)

### Filter by State

\`\`\`powershell
# Get only active (non-completed) tasks
Get-ServiceFabricRepairTask |
    Where-Object { $_.State -ne "Completed" } |
    Format-Table TaskId, State, Action, Executor -AutoSize

# Get only completed tasks
Get-ServiceFabricRepairTask -StateFilter Completed |
    Sort-Object -Property @{Expression={$_.History.CompletedUtcTimestamp}} -Descending |
    Select-Object -First 20 |
    Format-Table TaskId, State, ResultStatus, Action -AutoSize

# Get tasks in specific state
$stateFilter = "Preparing"
Get-ServiceFabricRepairTask |
    Where-Object { $_.State -eq $stateFilter } |
    Format-Table TaskId, State, Action, Target -AutoSize
\`\`\`

### Detailed Task Inspection

\`\`\`powershell
# Get specific task by ID
$taskId = "Azure/PlatformUpdate/12345"
$task = Get-ServiceFabricRepairTask | Where-Object { $_.TaskId -eq $taskId }

# View all properties
$task | Format-List *

# View timeline
Write-Host "=== Task Timeline ==="
Write-Host "Created:   $($task.History.CreatedUtcTimestamp)"
Write-Host "Claimed:   $($task.History.ClaimedUtcTimestamp)"
Write-Host "Preparing: $($task.History.PreparingUtcTimestamp)"
Write-Host "Approved:  $($task.History.ApprovedUtcTimestamp)"
Write-Host "Executing: $($task.History.ExecutingUtcTimestamp)"
Write-Host "Restoring: $($task.History.RestoringUtcTimestamp)"
Write-Host "Completed: $($task.History.CompletedUtcTimestamp)"

# View target nodes
Write-Host "=== Target Nodes ==="
$task.Target.NodeNames | ForEach-Object { Write-Host "  - $_" }

# View impact
Write-Host "=== Impact ==="
$task.Impact.NodeImpactList | ForEach-Object {
    Write-Host "  Node: $($_.NodeName) - Impact: $($_.ImpactLevel)"
}
\`\`\`

### Summary Report

\`\`\`powershell
# Generate a summary of all repair tasks
$tasks = Get-ServiceFabricRepairTask

Write-Host "=== Repair Task Summary ===" -ForegroundColor Cyan
Write-Host "Total Tasks: $($tasks.Count)"

# By state
Write-Host "By State:"
$tasks | Group-Object State | Sort-Object Count -Descending |
    Format-Table Name, Count -AutoSize

# By result status
Write-Host "By Result:"
$tasks | Group-Object ResultStatus | Sort-Object Count -Descending |
    Format-Table Name, Count -AutoSize

# By action type
Write-Host "By Action:"
$tasks | Group-Object Action | Sort-Object Count -Descending |
    Format-Table Name, Count -AutoSize

# By executor
Write-Host "By Executor:"
$tasks | Group-Object Executor | Sort-Object Count -Descending |
    Format-Table Name, Count -AutoSize
\`\`\`

### Monitor Active Tasks

\`\`\`powershell
# Watch active repair tasks in real-time
while ($true) {
    $active = Get-ServiceFabricRepairTask | Where-Object { $_.State -ne "Completed" }
    Clear-Host
    Write-Host "=== Active Repair Tasks ($(Get-Date)) ===" -ForegroundColor Cyan

    if ($active.Count -eq 0) {
        Write-Host "No active repair tasks" -ForegroundColor Green
    } else {
        $active | Format-Table TaskId, State, Action,
            @{N='Nodes';E={($_.Target.NodeNames -join ', ')}},
            @{N='Duration';E={
                if ($_.History.CreatedUtcTimestamp) {
                    $dur = (Get-Date) - [DateTime]$_.History.CreatedUtcTimestamp
                    "{0:hh\\:mm\\:ss}" -f $dur
                }
            }} -AutoSize
    }

    Start-Sleep -Seconds 15
}
\`\`\`

---

## 🌐 REST API Examples

### Get All Repair Tasks

\`\`\`bash
curl -k -X GET "https://${cleanEndpoint}/$/GetRepairTaskList?api-version=6.0" \\
  --cert client.pem --key client.key
\`\`\`

### Filter by State

\`\`\`bash
# State filter values: Created=1, Claimed=2, Preparing=4, Approved=8,
# Executing=16, Restoring=32, Completed=64
# Combine with bitwise OR, e.g., Active (non-completed) = 63

curl -k -X GET "https://${cleanEndpoint}/$/GetRepairTaskList?api-version=6.0" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json" \\
  -d '{"StateFilter": 63}'
\`\`\`

### Filter by Executor

\`\`\`bash
curl -k -X GET "https://${cleanEndpoint}/$/GetRepairTaskList?api-version=6.0" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json" \\
  -d '{"ExecutorFilter": "fabric:/System/InfrastructureService"}'
\`\`\`

---

## 📊 Repair Task States

| State | Description |
|-------|-------------|
| **Created** | Task submitted, not yet assigned to executor |
| **Claimed** | Executor has accepted the task |
| **Preparing** | SF moving replicas off target nodes (safety checks) |
| **Approved** | Preparation complete, safe to proceed |
| **Executing** | Repair action in progress (node reboot, OS update, etc.) |
| **Restoring** | Repair complete, SF restoring replicas to nodes |
| **Completed** | Task fully finished |

## Result Statuses

| Status | Meaning |
|--------|---------|
| **Succeeded** | Repair completed successfully |
| **Cancelled** | Task was cancelled |
| **Interrupted** | Task was interrupted before completion |
| **Failed** | Repair action failed |
| **Pending** | Task still in progress |
| **Invalid** | Task in invalid state |

---

## 📚 Additional Resources

- [Repair Manager Overview](https://learn.microsoft.com/azure/service-fabric/service-fabric-patch-orchestration-application)
- [Repair Task REST API](https://learn.microsoft.com/rest/api/servicefabric/sfclient-api-getrepairtasklist)
- [Infrastructure Service](https://learn.microsoft.com/azure/service-fabric/service-fabric-infrastructure-as-code-overview)
- [Automatic OS Patching](https://learn.microsoft.com/azure/service-fabric/service-fabric-patch-orchestration-application)
`;
    }
    
    static generateCreateRepairTask(clusterEndpoint: string): string {
        const cleanEndpoint = this.stripProtocol(clusterEndpoint);
        return `# 🔧 Create Repair Task

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## 📋 Overview

Create custom repair tasks to coordinate infrastructure maintenance operations through the Service Fabric Repair Manager.

**⚠️ Important:** Creating repair tasks is an advanced operation. The Repair Manager must be enabled on the cluster. Typically, repair tasks are created automatically by the Infrastructure Service (Azure) or Patch Orchestration Application.

---

## 🔨 PowerShell Commands

### Create a Basic Repair Task

\`\`\`powershell
# Create a custom repair task targeting a specific node
$taskId = "Custom/MyRepair/$(Get-Date -Format 'yyyyMMddHHmmss')"
$nodeName = "_Node_0"

# Step 1: Create the repair task
Start-ServiceFabricRepairTask \`
    -TaskId $taskId \`
    -Action "System.Manual" \`
    -NodeNames @($nodeName) \`
    -NodeImpact @(@{NodeName=$nodeName; ImpactLevel="Restart"})

Write-Host "Created repair task: $taskId"
\`\`\`

📚 **Reference:** [Start-ServiceFabricRepairTask](https://learn.microsoft.com/powershell/module/servicefabric/start-servicefabricrepairtask)

### Create with Specific Impact Level

\`\`\`powershell
# Impact levels:
#   None           - No impact expected
#   Restart        - Node will restart
#   RemoveData     - Data on node will be lost
#   RemoveNode     - Node permanently removed

$taskId = "Custom/NodeRestart/$(Get-Date -Format 'yyyyMMddHHmmss')"

Start-ServiceFabricRepairTask \`
    -TaskId $taskId \`
    -Action "System.Azure.TenantUpdate" \`
    -NodeNames @("_Node_0", "_Node_1") \`
    -NodeImpact @(
        @{NodeName="_Node_0"; ImpactLevel="Restart"},
        @{NodeName="_Node_1"; ImpactLevel="Restart"}
    ) \`
    -Description "Planned maintenance: OS patching"

# Monitor task preparation
Get-ServiceFabricRepairTask | Where-Object { $_.TaskId -eq $taskId } | Format-List State, Action, Target
\`\`\`

### Create Node Deactivation Repair Task

\`\`\`powershell
# Create task that deactivates node for manual maintenance
$taskId = "Custom/Maintenance/$(Get-Date -Format 'yyyyMMddHHmmss')"
$nodeName = "_Node_2"

Start-ServiceFabricRepairTask \`
    -TaskId $taskId \`
    -Action "System.Manual" \`
    -NodeNames @($nodeName) \`
    -NodeImpact @(@{NodeName=$nodeName; ImpactLevel="RemoveData"}) \`
    -Description "Manual hardware maintenance on $nodeName"

# Wait for SF to move replicas off the node (Preparing -> Approved)
Write-Host "Waiting for preparation (replica migration)..." -ForegroundColor Yellow
$timeout = (Get-Date).AddMinutes(30)
while ((Get-Date) -lt $timeout) {
    $task = Get-ServiceFabricRepairTask | Where-Object { $_.TaskId -eq $taskId }

    if ($task.State -eq "Approved") {
        Write-Host "Node is safe for maintenance" -ForegroundColor Green
        break
    }
    Write-Host "State: $($task.State)" -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

# After maintenance: complete the repair task
# (see Force Approve guide for completing tasks)
\`\`\`

---

## 🌐 REST API Examples

### Create Repair Task

\`\`\`bash
curl -k -X POST "https://${cleanEndpoint}/$/CreateRepairTask?api-version=6.0" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json" \\
  -d '{
    "TaskId": "Custom/MyRepair/20260213",
    "Action": "System.Manual",
    "Description": "Manual maintenance task",
    "State": "Created",
    "Target": {
      "Kind": "Node",
      "NodeNames": ["_Node_0"]
    },
    "Impact": {
      "Kind": "Node",
      "NodeImpactList": [
        {
          "NodeName": "_Node_0",
          "ImpactLevel": "Restart"
        }
      ]
    }
  }'
\`\`\`

### Create Multi-Node Repair Task

\`\`\`bash
curl -k -X POST "https://${cleanEndpoint}/$/CreateRepairTask?api-version=6.0" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json" \\
  -d '{
    "TaskId": "Custom/OsUpdate/20260213",
    "Action": "System.Azure.TenantUpdate",
    "Description": "OS security patches for UD0 nodes",
    "State": "Created",
    "Target": {
      "Kind": "Node",
      "NodeNames": ["_Node_0", "_Node_1"]
    },
    "Impact": {
      "Kind": "Node",
      "NodeImpactList": [
        {"NodeName": "_Node_0", "ImpactLevel": "Restart"},
        {"NodeName": "_Node_1", "ImpactLevel": "Restart"}
      ]
    }
  }'
\`\`\`

---

## 🎯 Common Repair Actions

| Action | Description | Typical Use |
|--------|-------------|-------------|
| **System.Manual** | Manual repair, human-completed | Hardware maintenance |
| **System.Azure.TenantUpdate** | Azure platform update | OS patching |
| **System.Azure.Heal** | Azure node healing | VM reimage/redeploy |
| **System.Azure.Reboot** | Azure node reboot | Forced reboot |
| **System.Azure.ReimageOS** | Azure OS reimage | Full OS restore |
| **System.Azure.FullReimage** | Azure full reimage | Complete VM rebuild |

---

## ⚠️ Important Notes

1. **Repair Manager Required**: Cluster must have RepairManager enabled in the cluster manifest
2. **Executor Assignment**: Tasks require an executor to claim and complete them
3. **Automatic Preparation**: SF automatically deactivates target nodes during the Preparing phase
4. **One UD at a time**: SF ensures only one upgrade domain is impacted at a time
5. **Health Checks**: SF validates cluster health before approving repair tasks

---

## 📚 Additional Resources

- [Create Repair Task API](https://learn.microsoft.com/rest/api/servicefabric/sfclient-api-createrepairtask)
- [Repair Manager Architecture](https://learn.microsoft.com/azure/service-fabric/service-fabric-patch-orchestration-application)
`;
    }
    
    static generateCancelRepairTask(clusterEndpoint: string): string {
        const cleanEndpoint = this.stripProtocol(clusterEndpoint);
        return `# ❌ Cancel Repair Task

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## 📋 Overview

Cancel an active repair task that has not yet reached the Executing state. Once a repair task is executing, it cannot be cancelled — only the executor can complete it.

**Cancellable States:**
- Created
- Claimed
- Preparing
- Approved (requires force)

**Not Cancellable:**
- Executing (must wait for completion)
- Restoring (must wait for completion)
- Completed (already done)

---

## 🔨 PowerShell Commands

### Cancel a Specific Repair Task

\`\`\`powershell
# Find the task to cancel
Get-ServiceFabricRepairTask |
    Where-Object { $_.State -ne "Completed" } |
    Format-Table TaskId, State, Action -AutoSize

# Cancel by task ID
$taskId = "Custom/MyRepair/20260213"
Stop-ServiceFabricRepairTask \`
    -TaskId $taskId \`
    -Version 0 \`
    -RequestAbort

# Verify cancellation
Get-ServiceFabricRepairTask | Where-Object { $_.TaskId -eq $taskId } |
    Format-List TaskId, State, ResultStatus
\`\`\`

📚 **Reference:** [Stop-ServiceFabricRepairTask](https://learn.microsoft.com/powershell/module/servicefabric/stop-servicefabricrepairtask)

### Cancel with Version Check

\`\`\`powershell
# Get current task version for optimistic concurrency
$task = Get-ServiceFabricRepairTask | Where-Object { $_.TaskId -eq $taskId }
$version = $task.Version

Write-Host "Cancelling task: $($task.TaskId) (State: $($task.State), Version: $version)"

Stop-ServiceFabricRepairTask \`
    -TaskId $task.TaskId \`
    -Version $version \`
    -RequestAbort

Write-Host "Cancel request submitted"
\`\`\`

### Cancel All Non-Executing Tasks

\`\`\`powershell
# Cancel all tasks that can be cancelled
$cancellableStates = @("Created", "Claimed", "Preparing")
$tasks = Get-ServiceFabricRepairTask |
    Where-Object { $_.State -in $cancellableStates }

foreach ($task in $tasks) {
    Write-Host "Cancelling: $($task.TaskId) (State: $($task.State))" -ForegroundColor Yellow
    try {
        Stop-ServiceFabricRepairTask \`
            -TaskId $task.TaskId \`
            -Version $task.Version \`
            -RequestAbort
        Write-Host "  Cancelled" -ForegroundColor Green
    } catch {
        Write-Host "  Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "Cancelled $($tasks.Count) tasks"
\`\`\`

### Delete a Completed Repair Task

\`\`\`powershell
# Delete completed repair task records
$taskId = "Custom/MyRepair/20260213"

Remove-ServiceFabricRepairTask \`
    -TaskId $taskId \`
    -Version 0

# Clean up old completed tasks
Get-ServiceFabricRepairTask -StateFilter Completed |
    Where-Object {
        $_.History.CompletedUtcTimestamp -and
        ([DateTime]$_.History.CompletedUtcTimestamp) -lt (Get-Date).AddDays(-30)
    } | ForEach-Object {
        Write-Host "Deleting old task: $($_.TaskId)"
        Remove-ServiceFabricRepairTask -TaskId $_.TaskId -Version $_.Version
    }
\`\`\`

📚 **Reference:** [Remove-ServiceFabricRepairTask](https://learn.microsoft.com/powershell/module/servicefabric/remove-servicefabricrepairtask)

---

## 🌐 REST API Examples

### Cancel Repair Task

\`\`\`bash
curl -k -X POST "https://${cleanEndpoint}/$/CancelRepairTask?api-version=6.0" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json" \\
  -d '{
    "TaskId": "Custom/MyRepair/20260213",
    "Version": "0",
    "RequestAbort": true
  }'
\`\`\`

### Delete Repair Task

\`\`\`bash
curl -k -X POST "https://${cleanEndpoint}/$/DeleteRepairTask?api-version=6.0" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json" \\
  -d '{
    "TaskId": "Custom/MyRepair/20260213",
    "Version": "0"
  }'
\`\`\`

---

## 🔍 Troubleshooting

### Cannot Cancel Task

\`\`\`powershell
# Check current state
$task = Get-ServiceFabricRepairTask | Where-Object { $_.TaskId -eq $taskId }

if ($task.State -in @("Executing", "Restoring")) {
    Write-Host "Task is in '$($task.State)' state - cannot cancel" -ForegroundColor Yellow
    Write-Host "Must wait for executor to complete the task"
    Write-Host "Executor: $($task.Executor)"
} elseif ($task.State -eq "Completed") {
    Write-Host "Task already completed with result: $($task.ResultStatus)"
} else {
    Write-Host "Task should be cancellable (State: $($task.State))"
}
\`\`\`

### Version Conflict

\`\`\`powershell
# Version mismatch error - refresh and retry
$task = Get-ServiceFabricRepairTask | Where-Object { $_.TaskId -eq $taskId }
Write-Host "Current version: $($task.Version)"

# Retry with current version
Stop-ServiceFabricRepairTask -TaskId $task.TaskId -Version $task.Version -RequestAbort
\`\`\`

---

## 📚 Additional Resources

- [Cancel Repair Task API](https://learn.microsoft.com/rest/api/servicefabric/sfclient-api-cancelrepairtask)
- [Delete Repair Task API](https://learn.microsoft.com/rest/api/servicefabric/sfclient-api-deleterepairtask)
- [Repair Task Lifecycle](https://learn.microsoft.com/azure/service-fabric/service-fabric-patch-orchestration-application)
`;
    }
    
    static generateForceApproveRepair(clusterEndpoint: string): string {
        const cleanEndpoint = this.stripProtocol(clusterEndpoint);
        return `# ✅ Force Approve Repair Task

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## 📋 Overview

Force approve a repair task that is stuck in the Preparing state. This bypasses the normal safety checks and allows the repair to proceed immediately.

**⚠️ DANGER:** Force approval skips Service Fabric's safety checks (replica migration, quorum preservation). Use only when:
- A repair task is stuck in Preparing for an extended period
- You have manually verified it is safe to proceed
- Normal approval is blocked by health policy violations
- Infrastructure maintenance requires immediate action

---

## 🔨 PowerShell Commands

### Check Tasks Needing Approval

\`\`\`powershell
# Find tasks stuck in Preparing state
Get-ServiceFabricRepairTask |
    Where-Object { $_.State -eq "Preparing" } |
    Select-Object TaskId, State, Action,
        @{N='Nodes';E={$_.Target.NodeNames -join ', '}},
        @{N='Since';E={
            if ($_.History.PreparingUtcTimestamp) {
                $dur = (Get-Date) - [DateTime]$_.History.PreparingUtcTimestamp
                "{0:hh\\:mm\\:ss}" -f $dur
            }
        }} |
    Format-Table -AutoSize
\`\`\`

### Force Approve a Repair Task

\`\`\`powershell
# Force approve specific task
$taskId = "Azure/PlatformUpdate/12345"
$task = Get-ServiceFabricRepairTask | Where-Object { $_.TaskId -eq $taskId }

if ($task.State -ne "Preparing") {
    Write-Host "Task is in '$($task.State)' state, not Preparing" -ForegroundColor Yellow
    Write-Host "Force approve only applies to tasks in Preparing state"
} else {
    Write-Host "Force approving: $taskId" -ForegroundColor Yellow
    Write-Host "  Action: $($task.Action)"
    Write-Host "  Target: $($task.Target.NodeNames -join ', ')"
    Write-Host "  Preparing since: $($task.History.PreparingUtcTimestamp)"

    Approve-ServiceFabricRepairTask \`
        -TaskId $task.TaskId \`
        -Version $task.Version \`
        -Force

    Write-Host "Task force approved" -ForegroundColor Green
}

# Verify task moved to Approved/Executing
Start-Sleep -Seconds 5
Get-ServiceFabricRepairTask | Where-Object { $_.TaskId -eq $taskId } |
    Format-List TaskId, State, Action
\`\`\`

📚 **Reference:** [Approve-ServiceFabricRepairTask](https://learn.microsoft.com/powershell/module/servicefabric/approve-servicefabricrepairtask)

### Force Approve All Stuck Tasks

\`\`\`powershell
# Force approve all tasks stuck in Preparing for more than 2 hours
$stuckThreshold = (Get-Date).AddHours(-2)

$stuckTasks = Get-ServiceFabricRepairTask |
    Where-Object {
        $_.State -eq "Preparing" -and
        $_.History.PreparingUtcTimestamp -and
        ([DateTime]$_.History.PreparingUtcTimestamp) -lt $stuckThreshold
    }

if ($stuckTasks.Count -eq 0) {
    Write-Host "No stuck repair tasks found" -ForegroundColor Green
} else {
    Write-Host "Found $($stuckTasks.Count) stuck tasks" -ForegroundColor Yellow

    foreach ($task in $stuckTasks) {
        $stuckDuration = (Get-Date) - [DateTime]$task.History.PreparingUtcTimestamp
        Write-Host "Force approving: $($task.TaskId)" -ForegroundColor Yellow
        Write-Host "  Stuck for: $([math]::Round($stuckDuration.TotalHours, 1)) hours"
        Write-Host "  Nodes: $($task.Target.NodeNames -join ', ')"

        try {
            Approve-ServiceFabricRepairTask \`
                -TaskId $task.TaskId \`
                -Version $task.Version \`
                -Force
            Write-Host "  Approved" -ForegroundColor Green
        } catch {
            Write-Host "  Failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}
\`\`\`

### Update Health Policy for Repair Task

\`\`\`powershell
# Instead of force approving, relax the health policy
# so SF can approve naturally
$taskId = "Azure/PlatformUpdate/12345"
$task = Get-ServiceFabricRepairTask | Where-Object { $_.TaskId -eq $taskId }

# Update with relaxed health policy
Update-ServiceFabricRepairTaskHealthPolicy \`
    -TaskId $task.TaskId \`
    -Version $task.Version \`
    -PerformPreparingHealthCheck $false

# Monitor - should now proceed through preparation
Get-ServiceFabricRepairTask | Where-Object { $_.TaskId -eq $taskId } | Format-List State
\`\`\`

📚 **Reference:** [Update-ServiceFabricRepairTaskHealthPolicy](https://learn.microsoft.com/powershell/module/servicefabric/update-servicefabricrepairtaskhealthpolicy)

---

## 🌐 REST API Examples

### Force Approve Repair Task

\`\`\`bash
curl -k -X POST "https://${cleanEndpoint}/$/ForceApproveRepairTask?api-version=6.0" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json" \\
  -d '{
    "TaskId": "Azure/PlatformUpdate/12345",
    "Version": "0"
  }'
\`\`\`

### Update Repair Task Health Policy

\`\`\`bash
curl -k -X POST "https://${cleanEndpoint}/$/UpdateRepairTaskHealthPolicy?api-version=6.0" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json" \\
  -d '{
    "TaskId": "Azure/PlatformUpdate/12345",
    "Version": "0",
    "PerformPreparingHealthCheck": false,
    "PerformRestoringHealthCheck": true
  }'
\`\`\`

---

## 🔍 Diagnosing Why Task is Stuck

\`\`\`powershell
# Check what's preventing preparation
$taskId = "Azure/PlatformUpdate/12345"
$task = Get-ServiceFabricRepairTask | Where-Object { $_.TaskId -eq $taskId }

# 1. Check target nodes
foreach ($nodeName in $task.Target.NodeNames) {
    $node = Get-ServiceFabricNode -NodeName $nodeName
    Write-Host "Node: $nodeName"
    Write-Host "  Status: $($node.NodeStatus)"
    Write-Host "  Health: $($node.HealthState)"
    Write-Host "  Deactivation: $($node.NodeDeactivationInfo.Status)"

    # Check replicas still on node
    $replicas = Get-ServiceFabricDeployedReplica -NodeName $nodeName
    Write-Host "  Replicas: $($replicas.Count)"

    # Check for stuck replicas
    $stuckReplicas = $replicas | Where-Object { $_.ReplicaStatus -ne "Ready" }
    if ($stuckReplicas) {
        Write-Host "  Stuck replicas: $($stuckReplicas.Count)" -ForegroundColor Yellow
        $stuckReplicas | Format-Table ServiceName, PartitionId, ReplicaStatus -AutoSize
    }
}

# 2. Check cluster health
$health = Get-ServiceFabricClusterHealth
Write-Host "Cluster Health: $($health.AggregatedHealthState)"

if ($health.AggregatedHealthState -ne "Ok") {
    Write-Host "Health Events:" -ForegroundColor Yellow
    $health.HealthEvents | Where-Object { $_.HealthInformation.HealthState -ne "Ok" } |
        Format-Table SourceId, Property, HealthState, Description -AutoSize
}

# 3. Check if deactivation is pending
Get-ServiceFabricNode | Where-Object {
    $_.NodeDeactivationInfo -and
    $_.NodeDeactivationInfo.Status -ne "None"
} | Format-Table NodeName, @{N='DeactivationStatus';E={$_.NodeDeactivationInfo.Status}} -AutoSize
\`\`\`

---

## ⚠️ Safety Considerations

### Before Force Approving

1. **Check quorum**: Ensure services will maintain quorum after node goes down
2. **Verify replicas moved**: Check if critical replicas have been moved off target nodes
3. **Check seed nodes**: Never force approve if it would bring seed node count below majority
4. **Review cluster health**: Understand why SF is blocking the approval
5. **Time of day**: Prefer force approval during off-peak hours

### Safer Alternatives

| Instead of Force Approve | Try This First |
|--------------------------|----------------|
| Stuck due to unhealthy app | Fix the unhealthy application |
| Stuck due to insufficient capacity | Add nodes or reduce replica count |
| Stuck due to seed node quorum | Wait for other seed nodes to recover |
| Stuck due to slow replica build | Increase \`ReplicaRestartWaitDuration\` |
| Stuck for unknown reason | Restart Repair Manager service |

### Quick Safety Check

\`\`\`powershell
# Check if force approve is safe
$nodesToImpact = (Get-ServiceFabricRepairTask | Where-Object { $_.TaskId -eq $taskId }).Target.NodeNames
$totalNodes = (Get-ServiceFabricNode | Where-Object { $_.NodeStatus -eq "Up" }).Count
$downAfterApprove = $totalNodes - $nodesToImpact.Count
$seedNodes = (Get-ServiceFabricNode | Where-Object { $_.IsSeedNode }).Count
$seedNodesImpacted = ($nodesToImpact | Where-Object { (Get-ServiceFabricNode -NodeName $_).IsSeedNode }).Count

Write-Host "Nodes up after approval: $downAfterApprove / $totalNodes"
Write-Host "Seed nodes impacted: $seedNodesImpacted / $seedNodes"

if ($downAfterApprove -lt [math]::Ceiling($totalNodes / 2)) {
    Write-Host "UNSAFE: Would lose node majority" -ForegroundColor Red
} elseif (($seedNodes - $seedNodesImpacted) -lt [math]::Ceiling($seedNodes / 2)) {
    Write-Host "UNSAFE: Would lose seed node quorum" -ForegroundColor Red
} else {
    Write-Host "APPEARS SAFE (verify replicas manually)" -ForegroundColor Green
}
\`\`\`

---

## 📚 Additional Resources

- [Force Approve Repair Task API](https://learn.microsoft.com/rest/api/servicefabric/sfclient-api-forceapproverepairtask)
- [Update Repair Task Health Policy API](https://learn.microsoft.com/rest/api/servicefabric/sfclient-api-updaterepairtaskhealthpolicy)
- [Repair Manager Troubleshooting](https://learn.microsoft.com/azure/service-fabric/service-fabric-patch-orchestration-application#troubleshooting)
- [Seed Node Quorum](https://learn.microsoft.com/azure/service-fabric/service-fabric-disaster-recovery#seed-node-quorum)
`;
    }
}
