import * as vscode from 'vscode';
import { SfUtility, debugLevel } from '../sfUtility';

/**
 * Azure CLI command generator for Service Fabric operations
 * Generates executable Azure CLI scripts with real cluster values
 */
export class AzureCliCommandGenerator {
    
    /**
     * Generate Azure CLI setup and connection guide
     */
    static generateSetupGuide(clusterEndpoint: string): string {
        const endpoint = clusterEndpoint.replace('https://', '').replace('http://', '');
        const host = endpoint.split(':')[0];

        return `# 🔷 Azure CLI for Service Fabric - Setup Guide

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## 📋 Prerequisites

### Azure CLI with Service Fabric Extension

The **Azure CLI** with the **Service Fabric extension (sf)** is required for managing Service Fabric clusters.

#### 🔍 Check if Installed

\`\`\`bash
# Check Azure CLI version
az --version

# Check if Service Fabric extension is installed
az extension list --query "[?name=='sf'].{Name:name, Version:version}" -o table

# Expected output if installed:
# Name    Version
# ------  ---------
# sf      1.0.0
\`\`\`

#### 📥 Installation Options

**Option 1: Install Azure CLI (Windows)**

\`\`\`powershell
# Using Windows installer (MSI)
# Download from: https://aka.ms/installazurecliwindows

# Or using winget
winget install -e --id Microsoft.AzureCLI
\`\`\`

**Option 2: Install Azure CLI (Linux)**

\`\`\`bash
# Ubuntu/Debian
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# RHEL/CentOS
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
sudo dnf install azure-cli
\`\`\`

**Option 3: Install Azure CLI (macOS)**

\`\`\`bash
# Using Homebrew
brew update && brew install azure-cli
\`\`\`

#### 📥 Install Service Fabric Extension

After installing Azure CLI, add the Service Fabric extension:

\`\`\`bash
# Install the Service Fabric extension
az extension add --name sf

# Verify installation
az sf --help
\`\`\`

📚 **References:**
- [Install Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
- [Azure CLI Service Fabric Extension](https://learn.microsoft.com/cli/azure/sf)
- [Service Fabric CLI Documentation](https://learn.microsoft.com/azure/service-fabric/service-fabric-cli)

---

## 🔐 Authentication Methods

### Method 1: Azure Active Directory (AAD) Authentication

For Azure-hosted Service Fabric clusters:

\`\`\`bash
# Login to Azure
az login

# Set your subscription
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# Select cluster endpoint
az sf cluster select --endpoint ${endpoint}
\`\`\`

### Method 2: Certificate-Based Authentication

For certificate-secured clusters:

\`\`\`bash
# Connect with client certificate
az sf cluster select \\
    --endpoint ${endpoint} \\
    --cert /path/to/client-cert.pem \\
    --key /path/to/client-key.pem \\
    --ca /path/to/ca-cert.pem

# Windows (PowerShell): Export certificate from store first
# 1. Export certificate: Get-ChildItem Cert:\\CurrentUser\\My\\THUMBPRINT | Export-PfxCertificate
# 2. Convert PFX to PEM: openssl pkcs12 -in cert.pfx -out cert.pem -nodes
\`\`\`

### Method 3: Unsecured Cluster (Development Only)

⚠️ **Warning:** Only use for local development clusters

\`\`\`bash
# Connect to unsecured cluster
az sf cluster select --endpoint ${endpoint} --no-verify
\`\`\`

---

## ✅ Verify Connection

\`\`\`bash
# Check cluster health
az sf cluster health

# List nodes
az sf node list -o table

# Show cluster manifest
az sf cluster manifest
\`\`\`

---

## 💡 Quick Tips

**Cross-Platform**: Azure CLI works on Windows, Linux, and macOS  
**JSON Output**: Use \`--output json\` or \`-o json\` for scripting  
**Table View**: Use \`-o table\` for human-readable output  
**Query Results**: Use \`--query\` with JMESPath for filtering  

**Example:**
\`\`\`bash
# Get only unhealthy nodes
az sf node list --query "[?healthState=='Error'].{Node:name, Status:healthState}" -o table
\`\`\`

📚 **References:**
- [Service Fabric CLI Overview](https://learn.microsoft.com/azure/service-fabric/service-fabric-cli)
- [Azure CLI Output Formats](https://learn.microsoft.com/cli/azure/format-output-azure-cli)
`;
    }

    /**
     * Generate cluster management commands
     */
    static generateClusterHealthCommand(clusterEndpoint: string): string {
        return `# 🏥 Get Cluster Health

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## Basic Health Check

\`\`\`bash
# Get overall cluster health
az sf cluster health

# Get detailed health with events
az sf cluster health --include-health-state-filters Error,Warning

# Get health in table format
az sf cluster health -o table
\`\`\`

## Query Specific Health Details

\`\`\`bash
# Filter to show only unhealthy entities
az sf cluster health --query "aggregatedHealthState" -o tsv

# Show unhealthy nodes
az sf node list --query "[?healthState!='Ok'].{Node:name, Health:healthState, Status:nodeStatus}" -o table

# Show health statistics
az sf cluster health --query "{Nodes:nodeHealthStates | length(@), Apps:applicationHealthStates | length(@)}" -o json
\`\`\`

📚 **Reference:** [az sf cluster health](https://learn.microsoft.com/cli/azure/sf/cluster#az-sf-cluster-health)
`;
    }

    /**
     * Generate cluster manifest command
     */
    static generateClusterManifestCommand(clusterEndpoint: string): string {
        return `# 📄 Show Cluster Manifest

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## Get Cluster Manifest

\`\`\`bash
# Show cluster manifest (XML)
az sf cluster manifest

# Save to file
az sf cluster manifest > cluster-manifest.xml

# Parse specific configuration sections (requires jq or xmllint)
az sf cluster manifest | grep -A 10 "ClusterManager"
\`\`\`

## Windows (PowerShell)

\`\`\`powershell
# Get manifest and format as XML
az sf cluster manifest | Out-File cluster-manifest.xml

# View in default XML viewer
az sf cluster manifest | Out-File temp.xml; notepad temp.xml
\`\`\`

📚 **Reference:** [az sf cluster manifest](https://learn.microsoft.com/cli/azure/sf/cluster#az-sf-cluster-manifest)
`;
    }

    /**
     * Generate node list command
     */
    static generateNodeListCommand(clusterEndpoint: string): string {
        return `# 🖥️ List Cluster Nodes

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## List All Nodes

\`\`\`bash
# List nodes in table format
az sf node list -o table

# List with JSON output (full details)
az sf node list -o json

# List with custom columns
az sf node list --query "[].{Name:name, Type:type, Status:nodeStatus, Health:healthState}" -o table
\`\`\`

## Filter and Query Nodes

\`\`\`bash
# Show only unhealthy nodes
az sf node list --query "[?healthState!='Ok']" -o table

# Show only nodes of specific type
az sf node list --query "[?type=='NodeType0']" -o table

# Count nodes by status
az sf node list --query "group_by(@, &nodeStatus)" -o json
\`\`\`

## Get Specific Node Details

\`\`\`bash
# Get details for specific node
az sf node info --node-name "_Node_0"

# Get node health
az sf node health --node-name "_Node_0"
\`\`\`

📚 **Reference:** [az sf node](https://learn.microsoft.com/cli/azure/sf/node)
`;
    }

    /**
     * Generate application list command
     */
    static generateApplicationListCommand(clusterEndpoint: string): string {
        return `# 📦 List Applications

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## List All Applications

\`\`\`bash
# List applications in table format
az sf application list -o table

# List with full JSON details
az sf application list -o json

# List with custom columns
az sf application list --query "[].{Name:name, Type:typeName, Version:typeVersion, Status:status}" -o table
\`\`\`

## Filter Applications

\`\`\`bash
# Filter by application type
az sf application list --query "[?typeName=='MyApplicationType']" -o table

# Show only unhealthy applications
az sf application list --query "[?healthState!='Ok']" -o table

# Count applications by type
az sf application list --query "group_by(@, &typeName)" -o json
\`\`\`

## Get Application Details

\`\`\`bash
# Get specific application info
az sf application info --application-id "fabric:/MyApp"

# Get application health
az sf application health --application-id "fabric:/MyApp"

# List services in application
az sf service list --application-id "fabric:/MyApp" -o table
\`\`\`

📚 **Reference:** [az sf application](https://learn.microsoft.com/cli/azure/sf/application)
`;
    }

    /**
     * Generate application health command
     */
    static generateApplicationHealthCommand(clusterEndpoint: string): string {
        return `# 🏥 Get Application Health

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## Check Application Health

\`\`\`bash
# Get application health (replace with your app ID)
az sf application health --application-id "fabric:/MyApp"

# Filter to show only errors and warnings
az sf application health --application-id "fabric:/MyApp" \\
    --include-health-state-filters Error,Warning

# Get health in table format
az sf application health --application-id "fabric:/MyApp" -o table
\`\`\`

## Query Health Details

\`\`\`bash
# Get overall health state
az sf application health --application-id "fabric:/MyApp" \\
    --query "aggregatedHealthState" -o tsv

# Show unhealthy services
az sf application health --application-id "fabric:/MyApp" \\
    --query "serviceHealthStates[?aggregatedHealthState!='Ok']" -o table

# Health statistics
az sf application health --application-id "fabric:/MyApp" \\
    --query "{Services:serviceHealthStates | length(@), Events:healthEvents | length(@)}" -o json
\`\`\`

📚 **Reference:** [az sf application health](https://learn.microsoft.com/cli/azure/sf/application#az-sf-application-health)
`;
    }

    /**
     * Generate application delete command
     */
    static generateApplicationDeleteCommand(clusterEndpoint: string): string {
        return `# 🗑️ Delete Application

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## Delete Application

⚠️ **Warning:** This will delete the application and all its services

\`\`\`bash
# Delete application (replace with your app ID)
az sf application delete --application-id "fabric:/MyApp"

# Delete with force flag (skip health checks)
az sf application delete --application-id "fabric:/MyApp" --force

# Verify deletion
az sf application list --query "[?name=='fabric:/MyApp']" -o table
\`\`\`

## Complete Cleanup Workflow

\`\`\`bash
# 1. View application before deletion
az sf application info --application-id "fabric:/MyApp"

# 2. Delete application instance
az sf application delete --application-id "fabric:/MyApp"

# 3. Unprovision application type (optional)
az sf application type version delete \\
    --application-type-name "MyApplicationType" \\
    --application-type-version "1.0.0"

# 4. Verify cleanup
az sf application list -o table
az sf application type list -o table
\`\`\`

📚 **Reference:** [az sf application delete](https://learn.microsoft.com/cli/azure/sf/application#az-sf-application-delete)
`;
    }

    /**
     * Generate service list command
     */
    static generateServiceListCommand(clusterEndpoint: string): string {
        return `# 🔧 List Services

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## List Services

\`\`\`bash
# List services for an application
az sf service list --application-id "fabric:/MyApp" -o table

# List with full JSON details
az sf service list --application-id "fabric:/MyApp" -o json

# List with custom columns
az sf service list --application-id "fabric:/MyApp" \\
    --query "[].{Name:name, Type:serviceTypeName, Status:serviceStatus, Health:healthState}" -o table
\`\`\`

## Query Service Details

\`\`\`bash
# Get specific service info
az sf service info --service-id "fabric:/MyApp/MyService"

# Get service health
az sf service health --service-id "fabric:/MyApp/MyService"

# List partitions for service
az sf partition list --service-id "fabric:/MyApp/MyService" -o table
\`\`\`

## Filter Services

\`\`\`bash
# Show only unhealthy services
az sf service list --application-id "fabric:/MyApp" \\
    --query "[?healthState!='Ok']" -o table

# Filter by service type
az sf service list --application-id "fabric:/MyApp" \\
    --query "[?serviceTypeName=='MyServiceType']" -o table
\`\`\`

📚 **Reference:** [az sf service](https://learn.microsoft.com/cli/azure/sf/service)
`;
    }

    /**
     * Generate query and diagnostics guide
     */
    static generateQueryGuide(clusterEndpoint: string): string {
        return `# 🔍 Query & Diagnostics Guide

**Cluster:** \`${clusterEndpoint}\`  
**Generated:** ${new Date().toLocaleString()}

---

## Common Query Patterns

### Health Queries

\`\`\`bash
# Overall cluster health summary
az sf cluster health --query "aggregatedHealthState" -o tsv

# Count unhealthy nodes
az sf node list --query "[?healthState!='Ok'] | length(@)" -o tsv

# Unhealthy applications summary
az sf application list \\
    --query "[?healthState!='Ok'].{App:name, Health:healthState}" -o table
\`\`\`

### Resource Queries

\`\`\`bash
# Node types in cluster
az sf node list --query "[].type | sort(@) | unique(@)" -o json

# Application types and versions
az sf application type list \\
    --query "[].{Type:name, Versions:join(', ', versions[*].version)}" -o table

# Service types per application type
az sf application type list --query "[].name" -o tsv | while read appType; do
    echo "Application Type: $appType"
    az sf service type list --application-type-name "$appType" -o table
done
\`\`\`

### Status Queries

\`\`\`bash
# Node status distribution
az sf node list --query "group_by(@, &nodeStatus)" -o json

# Application status summary
az sf application list --query "[].{Name:name, Status:status, Health:healthState}" -o table

# Partition replica counts
az sf partition list --service-id "fabric:/MyApp/MyService" \\
    --query "[].{Partition:partitionId, Replicas:replicaCount}" -o table
\`\`\`

## Output Formatting Tips

\`\`\`bash
# JSON for scripting
az sf cluster health -o json | jq '.aggregatedHealthState'

# Table for humans
az sf node list -o table

# TSV for pipelines
az sf application list -o tsv | cut -f1,3

# YAML for readability
az sf cluster health -o yaml
\`\`\`

## Advanced JMESPath Queries

\`\`\`bash
# Complex filtering
az sf node list \\
    --query "[?healthState=='Ok' && nodeStatus=='Up'].{Node:name, Type:type, IP:ipAddressOrFQDN}" \\
    -o table

# Nested property access
az sf application health --application-id "fabric:/MyApp" \\
    --query "serviceHealthStates[*].{Service:serviceName, State:aggregatedHealthState}" \\
    -o table

# Array operations
az sf node list \\
    --query "{Total:length(@), Healthy:length([?healthState=='Ok']), Up:length([?nodeStatus=='Up'])}" \\
    -o json
\`\`\`

📚 **References:**
- [Azure CLI JMESPath Query](https://learn.microsoft.com/cli/azure/query-azure-cli)
- [Service Fabric Query Commands](https://learn.microsoft.com/cli/azure/sf)
`;
    }
}
