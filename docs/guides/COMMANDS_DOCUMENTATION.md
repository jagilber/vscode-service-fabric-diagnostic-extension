# 📚 Service Fabric Diagnostic Extension - Complete Command Documentation

**Generated:** February 4, 2026  
**Version:** 1.0

---

## 📖 Table of Contents

1. [Tree View Structure](#tree-view-structure)
2. [PowerShell Guides Category](#powershell-guides-category)
3. [Cluster Operations Category](#cluster-operations-category)
4. [Application Lifecycle Category](#application-lifecycle-category)
5. [Partition & Replica Operations Category](#partition--replica-operations-category)
6. [Testing & Chaos Category](#testing--chaos-category)
7. [Backup & Restore Category](#backup--restore-category)
8. [Repair & Infrastructure Category](#repair--infrastructure-category)
9. [Consistent Example Data Reference](#consistent-example-data-reference)

---

## 🌳 Tree View Structure

When you connect to a Service Fabric cluster in the extension, you'll see a hierarchical tree view structured as follows:

```
🔌 mycluster.eastus.cloudapp.azure.com:19080 (⭐ Active)
├─ ℹ️ Essentials
├─ 📊 Metrics
├─ 📘 Commands
│  ├─ 📘 PowerShell Guides (4 commands)
│  │  ├─ 🔌 Connect to Cluster (All Methods)
│  │  ├─ 💚 Cluster Diagnostics & Health
│  │  ├─ 🖥️ Node Management Operations
│  │  └─ 📦 Application Management
│  │
│  ├─ ⚙️ Cluster Operations (5 commands)
│  │  ├─ 🚀 Start Cluster Upgrade
│  │  ├─ ⏮️ Rollback Cluster Upgrade
│  │  ├─ ⚙️ Update Cluster Configuration
│  │  ├─ 🔧 Recover System Partitions
│  │  └─ 🔄 Reset Partition Loads
│  │
│  ├─ 📦 Application Lifecycle (4 commands)
│  │  ├─ 📥 Provision Application Type
│  │  ├─ ➕ Create Application
│  │  ├─ 🚀 Start Application Upgrade
│  │  └─ ⏮️ Rollback Application Upgrade
│  │
│  ├─ 💾 Partition & Replica Operations (4 commands)
│  │  ├─ ↗️ Move Primary Replica
│  │  ├─ ↔️ Move Secondary Replica
│  │  ├─ 🔄 Reset Partition Load
│  │  └─ 💚 Report Custom Health
│  │
│  ├─ 🧪 Testing & Chaos (4 commands)
│  │  ├─ 🧪 Start Chaos Test
│  │  ├─ 🛑 Stop Chaos Test
│  │  ├─ 🔍 Query Chaos Events
│  │  └─ ⚠️ Restart Partition (Data Loss)
│  │
│  ├─ 💾 Backup & Restore (5 commands)
│  │  ├─ 💾 Enable Backup
│  │  ├─ 🚫 Disable Backup
│  │  ├─ 📤 Trigger Ad-hoc Backup
│  │  ├─ ⏳ Get Backup Progress
│  │  └─ 📥 Restore from Backup
│  │
│  └─ 🔧 Repair & Infrastructure (4 commands)
│     ├─ 📋 View Active Repair Tasks
│     ├─ 🔧 Create Repair Task
│     ├─ ❌ Cancel Repair Task
│     └─ ✅ Force Approve Repair Task
│
├─ 🗂️ Image Store
├─ 🗺️ Cluster Map
├─ 📦 applications (3)
│  ├─ MyAppType
│  │  └─ fabric:/MyApp
│  │     ├─ Manifest
│  │     ├─ fabric:/MyApp/WebService
│  │     ├─ fabric:/MyApp/ApiService
│  │     └─ fabric:/MyApp/DataService
│  ├─ VisualObjectsType
│  │  └─ fabric:/VisualObjects
│  └─ VotingType
│     └─ fabric:/Voting
│
├─ 🖥️ nodes (5)
│  ├─ _Node_0 (Seed Node, UD: 0, FD: fd:/dc1/rack1)
│  ├─ _Node_1 (Seed Node, UD: 1, FD: fd:/dc1/rack2)
│  ├─ _Node_2 (UD: 2, FD: fd:/dc1/rack3)
│  ├─ _Node_3 (UD: 3, FD: fd:/dc2/rack1)
│  └─ _Node_4 (UD: 4, FD: fd:/dc2/rack2)
│
└─ ⚙️ system (7)
   ├─ fabric:/System/ClusterManagerService
   ├─ fabric:/System/FailoverManagerService
   ├─ fabric:/System/NamingService
   ├─ fabric:/System/ImageStoreService
   ├─ fabric:/System/FaultAnalysisService
   ├─ fabric:/System/DnsService
   └─ fabric:/System/EventStoreService
```

---

## 📘 PowerShell Guides Category

### Overview

The PowerShell Guides provide comprehensive, executable PowerShell command references for common Service Fabric operations. Each guide includes:
- Multiple authentication methods
- Real cluster data examples (using your cluster's actual node names and application names)
- Troubleshooting guidance
- MS Learn documentation links

### 1. Connect to Cluster (All Methods)

**Command ID:** `connect-cluster-guide`  
**Icon:** 🔌 Green plug  
**Purpose:** Comprehensive guide for connecting to Service Fabric clusters using all supported authentication methods

**Documentation Generated:**

```markdown
# 🔌 Service Fabric Cluster Connection Guide

**Cluster:** `https://mycluster.eastus.cloudapp.azure.com:19080`  
**Generated:** February 4, 2026 10:30:00 AM

## 📋 Prerequisites

```powershell
# Check if Service Fabric PowerShell module is installed
Get-Module -ListAvailable -Name ServiceFabric

# If not installed, download from: https://aka.ms/servicefabric
```

## 🔐 Connection Methods

### Method 1: Unsecured Cluster (Development Only)

⚠️ **Warning:** Only use for local development clusters

```powershell
# Connect to unsecured cluster
Connect-ServiceFabricCluster -ConnectionEndpoint mycluster.eastus.cloudapp.azure.com:19000

# Verify connection
Get-ServiceFabricClusterConnection
Get-ServiceFabricClusterHealth
```

📚 **Reference:** [Connect-ServiceFabricCluster](https://learn.microsoft.com/powershell/module/servicefabric/connect-servicefabriccluster)

### Method 2: Certificate-Based Authentication (Recommended for Production)

#### Option A: Client Certificate from Certificate Store

```powershell
# Find certificates in your store
Get-ChildItem -Path Cert:\\CurrentUser\\My
Get-ChildItem -Path Cert:\\LocalMachine\\My

# Connect with client certificate thumbprint
$clientCertThumbprint = "1234567890ABCDEF1234567890ABCDEF12345678"
$serverCertThumbprint = "ABCDEF1234567890ABCDEF1234567890ABCDEF12"

Connect-ServiceFabricCluster `
    -ConnectionEndpoint mycluster.eastus.cloudapp.azure.com:19000 `
    -X509Credential `
    -FindType FindByThumbprint `
    -FindValue $clientCertThumbprint `
    -StoreLocation CurrentUser `
    -StoreName My `
    -ServerCertThumbprint $serverCertThumbprint

# Verify
Test-ServiceFabricClusterConnection
```

📚 **Reference:** [Connect-ServiceFabricCluster](https://learn.microsoft.com/powershell/module/servicefabric/connect-servicefabriccluster)

### Method 3: Azure Active Directory (AAD) Authentication

```powershell
# Connect using Azure AD interactive authentication
Connect-ServiceFabricCluster `
    -ConnectionEndpoint mycluster.eastus.cloudapp.azure.com:19000 `
    -AzureActiveDirectory `
    -ServerCertThumbprint $serverCertThumbprint
```

### Method 4: Windows Authentication (Domain-Joined)

```powershell
# Connect using Windows credentials (Kerberos/NTLM)
Connect-ServiceFabricCluster `
    -ConnectionEndpoint mycluster.eastus.cloudapp.azure.com:19000 `
    -WindowsCredential
```
```

---

### 2. Cluster Diagnostics & Health

**Command ID:** `cluster-diagnostics-guide`  
**Icon:** 💚 Red pulse  
**Purpose:** Commands for querying cluster health, diagnostics, and monitoring

**Example Data Used:**
- Nodes: `_Node_0`, `_Node_1`, `_Node_2`, `_Node_3`, `_Node_4`
- Applications: `fabric:/MyApp`, `fabric:/VisualObjects`, `fabric:/Voting`

**Sample Commands Generated:**

```powershell
# Get overall cluster health
Get-ServiceFabricClusterHealth

# Get detailed cluster health with events
Get-ServiceFabricClusterHealth -EventsFilter Error,Warning

# Check specific node health
Get-ServiceFabricNodeHealth -NodeName "_Node_0"

# Get all nodes and their status
Get-ServiceFabricNode | Format-Table NodeName, NodeStatus, HealthState, CodeVersion

# Get application health
Get-ServiceFabricApplicationHealth -ApplicationName "fabric:/MyApp"

# Get cluster events (last 24 hours)
$startTime = (Get-Date).AddDays(-1).ToUniversalTime()
$endTime = (Get-Date).ToUniversalTime()
Get-ServiceFabricClusterEventList -StartTimeUtc $startTime -EndTimeUtc $endTime
```

---

### 3. Node Management Operations

**Command ID:** `node-management-guide`  
**Icon:** 🖥️ Blue server-process  
**Purpose:** Commands for managing cluster nodes (restart, disable, enable, deactivate)

**Sample Documentation:**

```markdown
## 🖥️ Node Operations Examples

**Cluster Nodes:** _Node_0, _Node_1, _Node_2, _Node_3, _Node_4

### Restart Node

```powershell
# Get node instance ID
$node = Get-ServiceFabricNode -NodeName "_Node_2"
$instanceId = $node.NodeInstanceId

# Restart the node
Restart-ServiceFabricNode -NodeName "_Node_2" -NodeInstanceId $instanceId

# Monitor node status
Get-ServiceFabricNode -NodeName "_Node_2" | Select-Object NodeName, NodeStatus, HealthState
```

### Disable Node (for Maintenance)

```powershell
# Disable node for restart intent
Disable-ServiceFabricNode -NodeName "_Node_3" -Intent Restart

# Check deactivation status
Get-ServiceFabricNode -NodeName "_Node_3" | Select-Object NodeDeactivationInfo
```

### Enable Node

```powershell
# Re-enable previously disabled node
Enable-ServiceFabricNode -NodeName "_Node_3"

# Verify node is back online
Get-ServiceFabricNode -NodeName "_Node_3" | Select-Object NodeName, NodeStatus
```
```

---

### 4. Application Management

**Command ID:** `application-management-guide`  
**Icon:** 📦 Purple package  
**Purpose:** Commands for deploying, upgrading, and managing applications

**Example Applications Used:**
- `fabric:/MyApp` (Type: MyAppType, Version: 1.0.0)
- `fabric:/VisualObjects` (Type: VisualObjectsType, Version: 1.5.0)
- `fabric:/Voting` (Type: VotingType, Version: 2.0.0)

**Sample Commands:**

```powershell
# List all applications
Get-ServiceFabricApplication | Format-Table ApplicationName, ApplicationStatus, HealthState, TypeVersion

# Get services in an application
Get-ServiceFabricService -ApplicationName "fabric:/MyApp"

# Get specific service details
Get-ServiceFabricService -ServiceName "fabric:/MyApp/WebService"

# Get replicas for a service
$partitions = Get-ServiceFabricPartition -ServiceName "fabric:/MyApp/DataService"
foreach ($partition in $partitions) {
    Get-ServiceFabricReplica -PartitionId $partition.PartitionId
}
```

---

## ⚙️ Cluster Operations Category

### Overview

Cluster Operations provide commands for managing cluster-level configurations, upgrades, and critical recovery operations.

### 1. Start Cluster Upgrade

**Command ID:** `start-cluster-upgrade`  
**Icon:** 🚀 Blue cloud-upload  
**Purpose:** Upgrade Service Fabric runtime version across the cluster

**Key Features:**
- Monitored and unmonitored upgrade modes
- Health policy configuration
- Rolling upgrade across upgrade domains
- Automatic rollback on failures

**Example Documentation:**

```markdown
# 🚀 Start Cluster Upgrade

**Cluster:** `https://mycluster.eastus.cloudapp.azure.com:19080`  
**Nodes:** 5  
**Current Version:** 9.1.1583.9590

## Your Cluster Nodes

```
- _Node_0 (Seed Node, UD: 0)
- _Node_1 (Seed Node, UD: 1)
- _Node_2 (UD: 2)
- _Node_3 (UD: 3)
- _Node_4 (UD: 4)
```

## PowerShell Commands

### Start Monitored Upgrade (Recommended)

```powershell
# Target version
$targetVersion = "10.0.1949.9590"

Start-ServiceFabricClusterUpgrade `
    -Code `
    -CodePackageVersion $targetVersion `
    -Monitored `
    -FailureAction Rollback `
    -UpgradeReplicaSetCheckTimeoutSec 30

# Monitor upgrade progress
Get-ServiceFabricClusterUpgrade
Watch-ServiceFabricClusterUpgrade
```

📚 **Reference:** [Start-ServiceFabricClusterUpgrade](https://learn.microsoft.com/powershell/module/servicefabric/start-servicefabricclusterupgrade)

## REST API Examples

```bash
curl -k -X POST "https://mycluster.eastus.cloudapp.azure.com:19080/$/Upgrade?api-version=6.0" \\
  --cert client.pem --key client.key \\
  -H "Content-Type: application/json" \\
  -d '{
    "CodeVersion": "10.0.1949.9590",
    "UpgradeKind": "Rolling",
    "RollingUpgradeMode": "Monitored",
    "FailureAction": "Rollback"
  }'
```
```

---

### 2. Rollback Cluster Upgrade

**Command ID:** `rollback-cluster-upgrade`  
**Example GUID:** N/A (uses current upgrade)  
**Purpose:** Rollback failed or problematic cluster upgrade

---

### 3. Update Cluster Configuration

**Command ID:** `update-cluster-config`  
**Purpose:** Update cluster settings without changing Service Fabric version

---

### 4. Recover System Partitions

**Command ID:** `recover-system-partitions`  
**Purpose:** Force recovery of system service partitions in quorum loss
**⚠️ WARNING:** Last resort operation - may cause data loss

---

### 5. Reset Partition Loads

**Command ID:** `reset-partition-loads`  
**Purpose:** Reset reported load metrics for rebalancing

---

## 📦 Application Lifecycle Category

### 1. Provision Application Type

**Command ID:** `provision-app-type`  
**Example Package:** `MyApp_2.0`  
**Storage:** `fabric:ImageStore`

**Sample Commands:**

```powershell
# Upload package to image store
$appPath = "C:\\MyApplication\\pkg"
Copy-ServiceFabricApplicationPackage `
    -ApplicationPackagePath $appPath `
    -ImageStoreConnectionString "fabric:ImageStore" `
    -ApplicationPackagePathInImageStore "MyApp_2.0"

# Register application type
Register-ServiceFabricApplicationType -ApplicationPathInImageStore "MyApp_2.0"
```

---

### 2. Create Application

**Command ID:** `create-application`  
**Example App:** `fabric:/MyApp_Production`  
**Type:** `MyAppType`  
**Version:** `2.0.0`

**Sample Commands:**

```powershell
# Create application instance
New-ServiceFabricApplication `
    -ApplicationName "fabric:/MyApp_Production" `
    -ApplicationTypeName "MyAppType" `
    -ApplicationTypeVersion "2.0.0"
```

---

### 3. Start Application Upgrade

**Command ID:** `start-app-upgrade`  
**Example:** Upgrade `fabric:/MyApp` from v1.0.0 to v2.0.0

---

### 4. Rollback Application Upgrade

**Command ID:** `rollback-app-upgrade`  
**Example:** Rollback `fabric:/MyApp` upgrade

---

## 💾 Partition & Replica Operations Category

### 1. Move Primary Replica

**Command ID:** `move-primary-replica`  
**Example Partition:** `726a6a23-5c0e-4c6c-a456-789012345678`  
**Target Node:** `_Node_2`

**Sample Commands:**

```powershell
# Get partition
$serviceName = "fabric:/MyApp/DataService"
$partition = Get-ServiceFabricPartition -ServiceName $serviceName
$partitionId = "726a6a23-5c0e-4c6c-a456-789012345678"

# Move primary to specific node
Move-ServiceFabricPrimaryReplica -PartitionId $partitionId -NodeName "_Node_2"
```

---

### 2. Move Secondary Replica

**Command ID:** `move-secondary-replica`  
**Example:** Move from `_Node_1` to `_Node_3`

---

### 3. Reset Partition Load

**Command ID:** `reset-partition-load`  
**Example Partition:** `726a6a23-5c0e-4c6c-a456-789012345678`

---

### 4. Report Custom Health

**Command ID:** `report-health`  
**Example:** Report custom health for `fabric:/MyApp`

---

## 🧪 Testing & Chaos Category

### 1. Start Chaos Test

**Command ID:** `start-chaos`  
**Purpose:** Automated fault injection for resilience testing

**Sample Commands:**

```powershell
# Start 30-minute chaos test
Start-ServiceFabricChaos `
    -TimeToRunMinute 30 `
    -MaxClusterStabilizationTimeoutSec 180 `
    -MaxConcurrentFaults 1 `
    -EnableMoveReplicaFaults

# Monitor chaos status
Get-ServiceFabricChaosReport
```

---

### 2. Stop Chaos Test

**Command ID:** `stop-chaos`  

```powershell
Stop-ServiceFabricChaos
```

---

## 💾 Backup & Restore Category

### 1. Enable Backup

**Command ID:** `enable-backup`  
**Storage:** Azure Blob Storage  
**Container:** `sfbackups`

**Sample Commands:**

```powershell
# Install HTTP module (cross-platform)
Install-Module -Name Microsoft.ServiceFabric.Powershell.Http -AllowPrerelease

# Connect to cluster
Connect-SFCluster -ConnectionEndpoint mycluster.eastus.cloudapp.azure.com:19080 `
    -ServerCertThumbprint "ABCDEF1234567890ABCDEF1234567890ABCDEF12" `
    -X509Credential `
    -ClientCertificate $x509Certificate

# Create backup policy
New-SFBackupPolicy -BackupPolicyName "DailyAzureBackup" -Body @{
    AutoRestoreOnDataLoss = $false
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

# Enable backup for application
Enable-SFApplicationBackup `
    -ApplicationId "MyApp" `
    -BackupPolicyName "DailyAzureBackup"
```

---

### 2. Trigger Ad-hoc Backup

**Command ID:** `trigger-backup`  
**Partition:** `726a6a23-5c0e-4c6c-a456-789012345678`

```powershell
# Trigger immediate backup
Backup-SFPartition -PartitionId "726a6a23-5c0e-4c6c-a456-789012345678"

# Monitor progress
Get-SFPartitionBackupProgress -PartitionId "726a6a23-5c0e-4c6c-a456-789012345678"
```

---

### 3. Get Backup Progress

**Command ID:** `get-backup-progress`

```powershell
# Check backup status
$progress = Get-SFPartitionBackupProgress -PartitionId "726a6a23-5c0e-4c6c-a456-789012345678"
$progress | Select-Object BackupState, TimeStampUtc, BackupLocation
```

---

### 4. Restore from Backup

**Command ID:** `restore-backup`  
**Backup ID:** `53af455a-1e67-4b27-9476-123456789abc`

```powershell
# Get latest backup
$latestBackup = Get-SFPartitionBackupInfo `
    -PartitionId "726a6a23-5c0e-4c6c-a456-789012345678" `
    -Latest

# Restore from backup
Restore-SFPartition `
    -PartitionId "726a6a23-5c0e-4c6c-a456-789012345678" `
    -BackupId $latestBackup.BackupId `
    -BackupLocation $latestBackup.BackupLocation
```

---

## 🔧 Repair & Infrastructure Category

All repair commands currently have placeholder documentation (coming soon).

---

## 📝 Consistent Example Data Reference

### Standard Test/Example Values Used Throughout Documentation

| Data Type | Example Value | Notes |
|-----------|---------------|-------|
| **Cluster Endpoint** | `mycluster.eastus.cloudapp.azure.com:19080` | Consistent cluster FQDN |
| **Cluster Name** | `mycluster` | Short name |
| **Client Cert Thumbprint** | `1234567890ABCDEF1234567890ABCDEF12345678` | 40-character hex |
| **Server Cert Thumbprint** | `ABCDEF1234567890ABCDEF1234567890ABCDEF12` | 40-character hex (different) |
| **Partition GUID** | `726a6a23-5c0e-4c6c-a456-789012345678` | Standard GUID format |
| **Backup ID** | `53af455a-1e67-4b27-9476-123456789abc` | Standard GUID format |
| **Node Names** | `_Node_0`, `_Node_1`, `_Node_2`, `_Node_3`, `_Node_4` | Standard 5-node cluster |
| **Seed Nodes** | `_Node_0`, `_Node_1` | First two nodes |
| **Upgrade Domains** | `0`, `1`, `2`, `3`, `4` | One per node |
| **Fault Domains** | `fd:/dc1/rack1`, `fd:/dc1/rack2`, `fd:/dc1/rack3`, `fd:/dc2/rack1`, `fd:/dc2/rack2` | 2 DCs, multiple racks |
| **Application Names** | `fabric:/MyApp`, `fabric:/VisualObjects`, `fabric:/Voting` | Standard app examples |
| **App Types** | `MyAppType`, `VisualObjectsType`, `VotingType` | Corresponding types |
| **App Versions** | `1.0.0`, `1.5.0`, `2.0.0` | SemVer format |
| **Service Names** | `fabric:/MyApp/WebService`, `fabric:/MyApp/ApiService`, `fabric:/MyApp/DataService` | Hierarchical naming |
| **System Services** | `fabric:/System/ClusterManagerService`, etc. | Standard system services |
| **Service Fabric Version** | `9.1.1583.9590` | Current version |
| **Upgrade Version** | `10.0.1949.9590` | Target version |
| **Storage Account** | `mybackups` | Azure storage |
| **Container Name** | `sfbackups` | Blob container |
| **Image Store Path** | `fabric:ImageStore` or `MyApp_2.0` | Standard paths |
| **File Share** | `\\\\fileserver\\sfbackups` | UNC path |
| **Connection String** | `DefaultEndpointsProtocol=https;AccountName=mybackups;AccountKey=...` | Sanitized |

### Node Configuration Examples

```
Node: _Node_0
- Type: NodeType0
- Status: Up
- Health: Ok
- IsSeedNode: true
- UpgradeDomain: 0
- FaultDomain: fd:/dc1/rack1
- IP: 10.0.0.4
- Instance ID: 132945678901234567

Node: _Node_1
- Type: NodeType0
- Status: Up
- Health: Ok
- IsSeedNode: true
- UpgradeDomain: 1
- FaultDomain: fd:/dc1/rack2
- IP: 10.0.0.5
- Instance ID: 132945678901234568
```

### Application Configuration Examples

```
Application: fabric:/MyApp
- Type: MyAppType
- Version: 1.0.0
- Status: Ready
- Health: Ok
- Parameters:
  - InstanceCount: 5
  - MinReplicaSetSize: 2
  - TargetReplicaSetSize: 3

Services:
- fabric:/MyApp/WebService (Stateless, 5 instances)
- fabric:/MyApp/ApiService (Stateless, 3 instances)
- fabric:/MyApp/DataService (Stateful, 3 replicas)
```

### Backup Configuration Examples

```
Backup Policy: DailyAzureBackup
- Schedule: Every 24 hours
- Storage: Azure Blob
- Max Incremental: 3
- Auto Restore: false
- Container: sfbackups

Backup ID: 53af455a-1e67-4b27-9476-123456789abc
- Creation Time: 2026-02-03T02:00:00Z
- Type: Full
- Size: 256 MB
- Location: https://mybackups.blob.core.windows.net/sfbackups/...
```

---

## 🎯 How to Use This Documentation

### 1. **Browsing the Tree**

Click on any cluster in the tree view to expand and see:
- Health metrics
- Applications and services
- Cluster nodes
- Commands hierarchy

### 2. **Executing Commands**

Click on any command under the **Commands** node to open a comprehensive markdown guide with:
- ✅ Copy-paste ready PowerShell examples
- ✅ REST API curl commands
- ✅ Real cluster data (your actual node/app names)
- ✅ MS Learn documentation links
- ✅ Troubleshooting guidance
- ✅ Best practices and safety warnings

### 3. **Real Data Integration**

The extension automatically fetches your cluster's real data:
- **Node Names**: Uses your actual node names in examples
- **Applications**: Shows your provisioned application types
- **Certificates**: Uses your configured certificate thumbprints
- **Versions**: Displays your current Service Fabric version

### 4. **Consistent Examples**

All generated documentation uses the **Consistent Example Data** listed above when showing generic examples, ensuring:
- Easy to follow examples
- No accidental PII exposure
- Recognizable patterns across all guides
- Professional documentation quality

---

## 📚 Additional Resources

- [Service Fabric Documentation](https://learn.microsoft.com/azure/service-fabric/)
- [PowerShell Module Reference](https://learn.microsoft.com/powershell/module/servicefabric/)
- [REST API Reference](https://learn.microsoft.com/rest/api/servicefabric/)
- [Microsoft.ServiceFabric.Powershell.Http](https://www.powershellgallery.com/packages/Microsoft.ServiceFabric.Powershell.Http)

---

**Generated by:** Service Fabric Diagnostic Extension  
**Repository:** github.com/jagilber/vscode-service-fabric-diagnostic-extension  
**Last Updated:** February 4, 2026
