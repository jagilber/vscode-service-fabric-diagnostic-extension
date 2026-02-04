# Service Fabric Cluster Tabs Implementation Plan

## Overview
Implement SFX-inspired functionality for cluster root tabs: Details (upgrades), Cluster Map, and Commands.

**Based on:** Microsoft SFX source code (microsoft/service-fabric-explorer)  
**Focus:** Cluster upgrades, visual topology, and PowerShell command generation  
**Target:** VS Code tree view with webview panels for complex visualizations

---

## 1. Details Tab - Cluster Upgrade Focus

### Goal
Display cluster upgrade status, progress tracking, and failure diagnostics similar to SFX's details view.

### SFX Reference
- **File:** `src/SfxWeb/src/app/views/cluster/details/details.component.ts`
- **Model:** `ClusterUpgradeProgress` in `src/SfxWeb/src/app/Models/DataModels/Cluster.ts`

### Key Features Observed in SFX

#### 1.1 Upgrade State Tracking
```typescript
// From SFX ClusterUpgradeProgress model
{
  CodeVersion: "7.2.477.9590",
  ConfigVersion: "1.0",
  UpgradeState: "RollingForwardInProgress" | "RollingForwardCompleted" | "Failed",
  StartTimestampUtc: "2026-02-03T12:00:00Z",
  UpgradeDomains: [
    { Name: "0", State: "Completed" },
    { Name: "1", State: "InProgress" },
    { Name: "2", State: "Pending" }
  ],
  CurrentUpgradeDomainProgress: {
    DomainName: "1",
    NodeUpgradeProgressList: [...]
  },
  FailureReason: "None" | "UpgradeDomainTimeout",
  FailureTimestampUtc: "...",
  UpgradeDomainProgressAtFailure: {...}
}
```

#### 1.2 Visual Progress Representation
SFX shows upgrade domains as colored bars:
- **Green:** Completed
- **Blue:** InProgress  
- **Gray:** Pending
- **Red:** Failed

### Implementation for VS Code Extension

#### Phase 1: REST API Wrapper (src/sfRest.ts)
```typescript
// Add to SfRest class
public async getClusterUpgradeProgress(): Promise<sfModels.ClusterUpgradeProgress> {
    try {
        SfUtility.outputLog('sfRest:getClusterUpgradeProgress', null, debugLevel.info);
        return await this.sfApi.getClusterUpgradeProgress();
    } catch (error) {
        SfUtility.outputLog('Failed to get cluster upgrade progress', error, debugLevel.error);
        throw new NetworkError('Failed to retrieve cluster upgrade progress', { cause: error });
    }
}
```

#### Phase 2: Tree View Item (src/sfConfiguration.ts)
```typescript
// Add to cluster tabs section (around line 207-295)
{
    label: 'Details',
    contextValue: 'cluster-details',
    iconPath: new vscode.ThemeIcon('info'),
    collapsibleState: vscode.TreeItemCollapsibleState.None,
    command: {
        command: 'serviceFabric.showClusterUpgradeDetails',
        title: 'Cluster Upgrade Details',
        arguments: [cluster]
    }
}
```

#### Phase 3: Webview Panel (NEW FILE: src/views/ClusterUpgradeView.ts)
```typescript
export class ClusterUpgradeView {
    private panel?: vscode.WebviewPanel;
    
    constructor(private sfRest: SfRest) {}
    
    public async show() {
        if (!this.panel) {
            this.panel = vscode.window.createWebviewPanel(
                'sfClusterUpgrade',
                'Cluster Upgrade Progress',
                vscode.ViewColumn.One,
                { enableScripts: true }
            );
        }
        
        const upgradeProgress = await this.sfRest.getClusterUpgradeProgress();
        this.panel.webview.html = this.getHtmlContent(upgradeProgress);
    }
    
    private getHtmlContent(progress: any): string {
        // Generate HTML with upgrade visualization
        const isUpgrading = progress.UpgradeState.includes('InProgress');
        const completedUDs = progress.UpgradeDomains.filter(ud => 
            ud.State === 'Completed'
        ).length;
        
        return `<!DOCTYPE html>
<html>
<head>
    <style>
        .upgrade-bar {
            display: flex;
            gap: 4px;
            margin: 20px 0;
        }
        .ud-tile {
            flex: 1;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            color: white;
            font-weight: bold;
        }
        .completed { background: #088105; }
        .inprogress { background: #0075c9; }
        .pending { background: #939393; }
        .failed { background: #E81123; }
        
        .info-grid {
            display: grid;
            grid-template-columns: 200px auto;
            gap: 10px;
            margin: 20px 0;
        }
        .label { font-weight: bold; }
    </style>
</head>
<body>
    <h2>${isUpgrading ? 'Cluster Upgrade In Progress' : 'Latest Cluster Upgrade'}</h2>
    
    <div class="info-grid">
        <div class="label">Code Version:</div>
        <div>${progress.CodeVersion}</div>
        
        <div class="label">Config Version:</div>
        <div>${progress.ConfigVersion}</div>
        
        <div class="label">Upgrade State:</div>
        <div>${progress.UpgradeState}</div>
        
        <div class="label">Start Time:</div>
        <div>${progress.StartTimestampUtc}</div>
        
        ${isUpgrading ? `
        <div class="label">Progress:</div>
        <div>${completedUDs} / ${progress.UpgradeDomains.length} UDs completed</div>
        ` : ''}
    </div>
    
    <h3>Upgrade Domain Progress</h3>
    <div class="upgrade-bar">
        ${progress.UpgradeDomains.map(ud => `
            <div class="ud-tile ${ud.State.toLowerCase()}" title="${ud.Name}: ${ud.State}">
                ${ud.Name}
            </div>
        `).join('')}
    </div>
    
    ${progress.FailureReason && progress.FailureReason !== 'None' ? `
    <div style="border: 2px solid #E81123; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <h3 style="color: #E81123;">Upgrade Failed</h3>
        <div class="info-grid">
            <div class="label">Failure Reason:</div>
            <div>${progress.FailureReason}</div>
            
            <div class="label">Failure Time:</div>
            <div>${progress.FailureTimestampUtc}</div>
        </div>
    </div>
    ` : ''}
</body>
</html>`;
    }
}
```

#### Phase 4: Command Registration (src/extension.ts)
```typescript
// Around line 100-150
context.subscriptions.push(
    vscode.commands.registerCommand(
        'serviceFabric.showClusterUpgradeDetails',
        async (cluster: any) => {
            const sfRest = cluster?.sfRest || rootSfRest;
            const view = new ClusterUpgradeView(sfRest);
            await view.show();
        }
    )
);
```

### Testing Approach
1. Deploy Voting app to trigger upgrade
2. Start cluster upgrade: `Start-ServiceFabricClusterUpgrade`
3. Click "Details" tab item
4. Verify webview shows upgrade progress
5. Refresh to see UD state changes

---

## 2. Cluster Map Tab - Visual Topology

### Goal
Create visual grid showing fault domains × upgrade domains with node placement and health status.

### SFX Reference
- **File:** `src/SfxWeb/src/app/modules/clustermap/map/map.component.ts`
- **Template:** Grid layout with FD headers (columns) and UD headers (rows)

### Key Features from SFX

#### 2.1 Matrix Layout
```typescript
// SFX builds a matrix object
matrix = {
  "fd:/0": [all nodes in FD 0],
  "fd:/1": [all nodes in FD 1],
  "0": [all nodes in UD 0],
  "1": [all nodes in UD 1],
  "fd:/0-0": [nodes in FD 0 AND UD 0],
  "fd:/0-1": [nodes in FD 0 AND UD 1],
  // ... all FD/UD intersections
};
```

#### 2.2 Node Health Aggregation
```typescript
// For each cell, count health states
{
  okCount: 1,
  warningCount: 0,
  errorCount: 0,
  total: 1
}
```

#### 2.3 Visual Representation
- **Table with sticky headers**
- **Fault domains across top** (horizontal)
- **Upgrade domains down left** (vertical)
- **Each cell:** node count with health status color
- **Click cell:** show node list

### Implementation for VS Code Extension

#### Phase 1: Data Model (NEW FILE: src/models/ClusterTopology.ts)
```typescript
export interface INodeLocation {
    nodeName: string;
    faultDomain: string;
    upgradeDomain: string;
    healthStatus: string;
    nodeStatus: string;
}

export interface ITopologyCell {
    faultDomain: string;
    upgradeDomain: string;
    nodes: INodeLocation[];
    healthCounts: {
        ok: number;
        warning: number;
        error: number;
        unknown: number;
    };
}

export class ClusterTopology {
    public faultDomains: string[] = [];
    public upgradeDomains: string[] = [];
    public cells: Map<string, ITopologyCell> = new Map();
    
    constructor(nodes: any[]) {
        this.buildTopology(nodes);
    }
    
    private buildTopology(nodes: any[]) {
        // Extract unique FDs and UDs
        Set<string> fds = new Set();
        const uds = new Set<string>();
        
        nodes.forEach(node => {
            fds.add(node.FaultDomain || node.raw?.FaultDomain);
            uds.add(node.UpgradeDomain || node.raw?.UpgradeDomain);
        });
        
        this.faultDomains = Array.from(fds).sort();
        this.upgradeDomains = Array.from(uds).sort();
        
        // Build matrix cells
        this.faultDomains.forEach(fd => {
            this.upgradeDomains.forEach(ud => {
                const key = `${fd}-${ud}`;
                const cellNodes = nodes.filter(n => 
                    (n.FaultDomain === fd || n.raw?.FaultDomain === fd) &&
                    (n.UpgradeDomain === ud || n.raw?.UpgradeDomain === ud)
                );
                
                const cell: ITopologyCell = {
                    faultDomain: fd,
                    upgradeDomain: ud,
                    nodes: cellNodes.map(n => ({
                        nodeName: n.name || n.Name,
                        faultDomain: fd,
                        upgradeDomain: ud,
                        healthStatus: n.healthState?.text || n.HealthState,
                        nodeStatus: n.nodeStatus || n.NodeStatus
                    })),
                    healthCounts: this.calculateHealthCounts(cellNodes)
                };
                
                this.cells.set(key, cell);
            });
        });
    }
    
    private calculateHealthCounts(nodes: any[]) {
        const counts = { ok: 0, warning: 0, error: 0, unknown: 0 };
        nodes.forEach(n => {
            const health = (n.healthState?.text || n.HealthState || '').toLowerCase();
            if (health === 'ok') counts.ok++;
            else if (health === 'warning') counts.warning++;
            else if (health === 'error') counts.error++;
            else counts.unknown++;
        });
        return counts;
    }
}
```

#### Phase 2: Webview Panel (NEW FILE: src/views/ClusterMapView.ts)
```typescript
export class ClusterMapView {
    private panel?: vscode.WebviewPanel;
    
    constructor(private sfRest: SfRest) {}
    
    public async show() {
        if (!this.panel) {
            this.panel = vscode.window.createWebviewPanel(
                'sfClusterMap',
                'Cluster Map',
                vscode.ViewColumn.One,
                { enableScripts: true }
            );
        }
        
        // Get nodes
        const nodes = await this.sfRest.getNodes();
        const topology = new ClusterTopology(nodes);
        
        this.panel.webview.html = this.getHtmlContent(topology);
    }
    
    private getHtmlContent(topology: ClusterTopology): string {
        return `<!DOCTYPE html>
<html>
<head>
    <style>
        body { 
            font-family: var(--vscode-font-family); 
            padding: 10px;
        }
        
        .cluster-map {
            display: inline-block;
            border-collapse: collapse;
            margin: 20px;
        }
        
        .cluster-map th, .cluster-map td {
            border: 1px solid var(--vscode-panel-border);
            padding: 8px;
            text-align: center;
            min-width: 80px;
        }
        
        .cluster-map th {
            background: var(--vscode-editor-background);
            font-weight: bold;
            position: sticky;
            top: 0;
            z-index: 10;
        }
        
        .cluster-map th.corner {
            background: var(--vscode-sideBar-background);
        }
        
        .cluster-map th.ud-header {
            writing-mode: vertical-rl;
            transform: rotate(180deg);
            padding: 20px 8px;
            left: 0;
            position: sticky;
            z-index: 11;
            background: var(--vscode-editor-background);
        }
        
        .cell-content {
            padding: 5px;
            border-radius: 3px;
            cursor: pointer;
            min-height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .cell-empty { background: #666; color: #999; }
        .cell-ok { background: #088105; color: white; }
        .cell-warning { background: #0075c9; color: white; }
        .cell-error { background: #E81123; color: white; }
        .cell-mixed { background: #ff9800; color: white; }
        
        .summary {
            margin: 10px 20px;
            padding: 10px;
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
        }
        
        .legend {
            display: flex;
            gap: 15px;
            margin: 10px 20px;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .legend-box {
            width: 20px;
            height: 20px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <h2>Cluster Topology Map</h2>
    
    <div class="summary">
        <strong>Fault Domains:</strong> ${topology.faultDomains.length} | 
        <strong>Upgrade Domains:</strong> ${topology.upgradeDomains.length} |
        <strong>Total Nodes:</strong> ${this.getTotalNodeCount(topology)}
    </div>
    
    <div class="legend">
        <div class="legend-item">
            <div class="legend-box cell-ok"></div>
            <span>Healthy</span>
        </div>
        <div class="legend-item">
            <div class="legend-box cell-warning"></div>
            <span>Warning</span>
        </div>
        <div class="legend-item">
            <div class="legend-box cell-error"></div>
            <span>Error</span>
        </div>
        <div class="legend-item">
            <div class="legend-box cell-mixed"></div>
            <span>Mixed</span>
        </div>
        <div class="legend-item">
            <div class="legend-box cell-empty"></div>
            <span>No Nodes</span>
        </div>
    </div>
    
    <table class="cluster-map">
        <thead>
            <tr>
                <th class="corner" colspan="2"></th>
                ${topology.faultDomains.map(fd => `
                    <th title="${fd}">${this.getFdLabel(fd)}</th>
                `).join('')}
            </tr>
        </thead>
        <tbody>
            ${topology.upgradeDomains.map(ud => `
                <tr>
                    ${ud === topology.upgradeDomains[0] ? `
                        <th rowspan="${topology.upgradeDomains.length}" class="ud-header">
                            Upgrade Domain
                        </th>
                    ` : ''}
                    <th title="${ud}">UD ${ud}</th>
                    ${topology.faultDomains.map(fd => {
                        const cell = topology.cells.get(`${fd}-${ud}`);
                        return this.renderCell(cell);
                    }).join('')}
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>`;
    }
    
    private renderCell(cell: ITopologyCell | undefined): string {
        if (!cell || cell.nodes.length === 0) {
            return '<td><div class="cell-content cell-empty">-</div></td>';
        }
        
        const { healthCounts } = cell;
        const total = cell.nodes.length;
        
        // Determine cell color
        let colorClass = 'cell-ok';
        if (healthCounts.error > 0) colorClass = 'cell-error';
        else if (healthCounts.warning > 0) colorClass = 'cell-warning';
        else if (healthCounts.error > 0 && healthCounts.ok > 0) colorClass = 'cell-mixed';
        
        const tooltip = cell.nodes.map(n => 
            `${n.nodeName} (${n.healthStatus})`
        ).join('\\n');
        
        return `<td>
            <div class="cell-content ${colorClass}" 
                 title="${tooltip}"
                 onclick="alert('Nodes:\\n${tooltip}')">
                ${total}
                ${healthCounts.error > 0 ? ` ⚠️` : ''}
            </div>
        </td>`;
    }
    
    private getFdLabel(fd: string): string {
        // Extract FD number: "fd:/0" → "FD 0"
        const match = fd.match(/\d+$/);
        return match ? `FD ${match[0]}` : fd;
    }
    
    private getTotalNodeCount(topology: ClusterTopology): number {
        let count = 0;
        topology.cells.forEach(cell => count += cell.nodes.length);
        return count;
    }
}
```

#### Phase 3: Command Registration
```typescript
context.subscriptions.push(
    vscode.commands.registerCommand(
        'serviceFabric.showClusterMap',
        async (cluster: any) => {
            const sfRest = cluster?.sfRest || rootSfRest;
            const view = new ClusterMapView(sfRest);
            await view.show();
        }
    )
);
```

### Azure Cluster Support
Azure clusters can have **up to 5 UDs and 5 FDs**:
- Standard: 5 FDs × 5 UDs = 25 cells
- Single node type: Often 3 FDs × 5 UDs = 15 cells
- Matrix scales automatically based on topology

---

## 3. Commands Tab - PowerShell Command Generator

### Goal
Generate PowerShell commands with pre-filled parameters for cluster management tasks.

### SFX Reference
- **File:** `src/SfxWeb/src/app/views/cluster/commands/commands.component.ts`
- **Model:** `PowershellCommand` in `src/SfxWeb/src/app/Models/PowershellCommand.ts`

### Key Features from SFX

#### 3.1 Command Categories
```typescript
// Safe commands (no cluster changes)
- Get-ServiceFabricClusterUpgrade
- Get-ServiceFabricClusterHealth  
- Get-ServiceFabricRepairTask (if repair manager enabled)

// Unsafe commands (modify cluster)
- Start-ServiceFabricClusterUpgrade
- Resume-ServiceFabricClusterUpgrade
- Remove-ServiceFabricCluster
```

#### 3.2 Parameter Generation
```typescript
enum CommandParamTypes {
  string,
  number,
  bool,
  switch,  // Boolean flag
  enum     // Dropdown options
}

// Example from SFX
const statusFilter = new PowershellCommandParameter(
  "StatusFilter",
  CommandParamTypes.enum,
  { options: ['Default', 'Up', 'Down', 'Enabling', 'Disabling', 'Disabled', 'Unknown', 'Removed', 'All'] }
);
```

### Implementation for VS Code Extension

#### Phase 1: Command Model (NEW FILE: src/models/PowershellCommand.ts)
```typescript
export enum CommandSafetyLevel {
    Safe = 'safe',
    Unsafe = 'unsafe'
}

export interface IPowerShellCommand {
    name: string;
    docUrl: string;
    safetyLevel: CommandSafetyLevel;
    baseCommand: string;
    parameters: IPowerShellParameter[];
}

export interface IPowerShellParameter {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'switch' | 'enum';
    required: boolean;
    defaultValue?: any;
    options?: string[];  // For enum type
    description?: string;
}

export class PowerShellCommandBuilder {
    public static buildClusterCommands(
        clusterEndpoint: string,
        hasRepairManager: boolean
    ): IPowerShellCommand[] {
        const commands: IPowerShellCommand[] = [];
        
        // Get Cluster Upgrade
        commands.push({
            name: 'Get Cluster Upgrade',
            docUrl: 'https://learn.microsoft.com/powershell/module/servicefabric/get-servicefabricclusterupgrade',
            safetyLevel: CommandSafetyLevel.Safe,
            baseCommand: 'Get-ServiceFabricClusterUpgrade',
            parameters: [
                {
                    name: 'TimeoutSec',
                    type: 'number',
                    required: false,
                    defaultValue: 60,
                    description: 'Timeout in seconds'
                }
            ]
        });
        
        // Get Cluster Health
        commands.push({
            name: 'Get Cluster Health',
            docUrl: 'https://learn.microsoft.com/powershell/module/servicefabric/get-servicefabricclusterhealth',
            safetyLevel: CommandSafetyLevel.Safe,
            baseCommand: 'Get-ServiceFabricClusterHealth',
            parameters: [
                {
                    name: 'ConsiderWarningAsError',
                    type: 'boolean',
                    required: false,
                    defaultValue: false
                },
                {
                    name: 'MaxPercentUnhealthyNodes',
                    type: 'number',
                    required: false,
                    defaultValue: 0,
                    description: 'Maximum percentage of unhealthy nodes (0-100)'
                },
                {
                    name: 'ApplicationsFilter',
                    type: 'enum',
                    required: false,
                    options: ['Default', 'None', 'Error', 'Warning', 'All']
                },
                {
                    name: 'EventsFilter',
                    type: 'enum',
                    required: false,
                    options: ['Default', 'None', 'Error', 'Warning', 'All']
                },
                {
                    name: 'NodesFilter',
                    type: 'enum',
                    required: false,
                    options: ['Default', 'None', 'Error', 'Warning', 'All']
                }
            ]
        });
        
        // Get Repair Tasks (if enabled)
        if (hasRepairManager) {
            commands.push({
                name: 'Get Repair Task',
                docUrl: 'https://learn.microsoft.com/powershell/module/servicefabric/get-servicefabricrepairtask',
                safetyLevel: CommandSafetyLevel.Safe,
                baseCommand: 'Get-ServiceFabricRepairTask',
                parameters: [
                    {
                        name: 'State',
                        type: 'enum',
                        required: false,
                        options: ['Default', 'Created', 'Claimed', 'Preparing', 'Approved', 
                                 'Executing', 'ReadyToExecute', 'Restoring', 'Active', 'Completed', 'All']
                    },
                    {
                        name: 'TaskId',
                        type: 'string',
                        required: false,
                        description: 'Specific repair task ID'
                    }
                ]
            });
        }
        
        // Send Health Report (useful for testing)
        commands.push({
            name: 'Send Health Report',
            docUrl: 'https://learn.microsoft.com/powershell/module/servicefabric/send-servicefabricclusterhealthreport',
            safetyLevel: CommandSafetyLevel.Unsafe,
            baseCommand: 'Send-ServiceFabricClusterHealthReport',
            parameters: [
                {
                    name: 'SourceId',
                    type: 'string',
                    required: true,
                    description: 'Health report source identifier'
                },
                {
                    name: 'Property',
                    type: 'string',
                    required: true,
                    description: 'Health property name'
                },
                {
                    name: 'HealthState',
                    type: 'enum',
                    required: true,
                    options: ['Ok', 'Warning', 'Error']
                },
                {
                    name: 'Description',
                    type: 'string',
                    required: false,
                    description: 'Health report description'
                },
                {
                    name: 'TimeToLiveInMinutes',
                    type: 'number',
                    required: false,
                    defaultValue: 30
                },
                {
                    name: 'RemoveWhenExpired',
                    type: 'boolean',
                    required: false,
                    defaultValue: true
                }
            ]
        });
        
        return commands;
    }
    
    public static generateCommandString(
        command: IPowerShellCommand,
        parameterValues: Map<string, any>
    ): string {
        let cmdStr = command.baseCommand;
        
        command.parameters.forEach(param => {
            const value = parameterValues.get(param.name);
            
            if (value === undefined || value === null) {
                return; // Skip if no value provided
            }
            
            if (param.type === 'switch') {
                if (value === true) {
                    cmdStr += ` -${param.name}`;
                }
            } else if (param.type === 'boolean') {
                cmdStr += ` -${param.name} $${value}`;
            } else if (param.type === 'string') {
                cmdStr += ` -${param.name} "${value}"`;
            } else {
                cmdStr += ` -${param.name} ${value}`;
            }
        });
        
        return cmdStr;
    }
}
```

#### Phase 2: Commands WebView (NEW FILE: src/views/ClusterCommandsView.ts)
```typescript
export class ClusterCommandsView {
    private panel?: vscode.WebviewPanel;
    private commands: IPowerShellCommand[] = [];
    
    constructor(
        private sfRest: SfRest,
        private clusterEndpoint: string
    ) {}
    
    public async show() {
        // Check if repair manager is enabled
        const manifest = await this.sfRest.getClusterManifest();
        const hasRepairManager = manifest.isRepairManagerEnabled;
        
        this.commands = PowerShellCommandBuilder.buildClusterCommands(
            this.clusterEndpoint,
            hasRepairManager
        );
        
        if (!this.panel) {
            this.panel = vscode.window.createWebviewPanel(
                'sfClusterCommands',
                'Cluster PowerShell Commands',
                vscode.ViewColumn.One,
                { enableScripts: true }
            );
            
            // Handle messages from webview
            this.panel.webview.onDidReceiveMessage(
                message => this.handleMessage(message),
                undefined,
                []
            );
        }
        
        this.panel.webview.html = this.getHtmlContent();
    }
    
    private handleMessage(message: any) {
        switch (message.command) {
            case 'copyCommand':
                vscode.env.clipboard.writeText(message.text);
                vscode.window.showInformationMessage('Command copied to clipboard');
                break;
                
            case 'openDocs':
                vscode.env.openExternal(vscode.Uri.parse(message.url));
                break;
        }
    }
    
    private getHtmlContent(): string {
        const safeCommands = this.commands.filter(c => 
            c.safetyLevel === CommandSafetyLevel.Safe
        );
        const unsafeCommands = this.commands.filter(c => 
            c.safetyLevel === CommandSafetyLevel.Unsafe
        );
        
        return `<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: var(--vscode-font-family);
            padding: 20px;
        }
        
        .command-section {
            margin: 30px 0;
        }
        
        .command-card {
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 15px;
            margin: 10px 0;
        }
        
        .command-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .command-name {
            font-size: 16px;
            font-weight: bold;
        }
        
        .safety-badge {
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: bold;
        }
        
        .safe { background: #088105; color: white; }
        .unsafe { background: #E81123; color: white; }
        
        .command-params {
            margin: 10px 0;
        }
        
        .param-row {
            display: grid;
            grid-template-columns: 150px 1fr 100px;
            gap: 10px;
            margin: 5px 0;
            align-items: center;
        }
        
        .param-label {
            font-weight: bold;
            font-size: 13px;
        }
        
        .param-input, .param-select {
            padding: 4px 8px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 2px;
        }
        
        .required-mark {
            color: #E81123;
            margin-left: 2px;
        }
        
        .command-output {
            margin: 15px 0;
            padding: 10px;
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            white-space: pre-wrap;
            word-break: break-all;
        }
        
        .button-group {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }
        
        button {
            padding: 6px 12px;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 13px;
        }
        
        .btn-primary {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }
        
        .btn-primary:hover {
            background: var(--vscode-button-hoverBackground);
        }
        
        .btn-secondary {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        
        .doc-link {
            color: var(--vscode-textLink-foreground);
            text-decoration: none;
            font-size: 13px;
        }
        
        .doc-link:hover {
            text-decoration: underline;
        }
        
        h2 {
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 8px;
        }
    </style>
</head>
<body>
    <h1>Cluster PowerShell Commands</h1>
    <p>Generate PowerShell commands for cluster management. Fill in parameters and copy to clipboard.</p>
    
    <div class="command-section">
        <h2>📖 Safe Commands (Read-Only)</h2>
        ${safeCommands.map(cmd => this.renderCommandCard(cmd)).join('')}
    </div>
    
    <div class="command-section">
        <h2>⚠️  Unsafe Commands (Modify Cluster)</h2>
        ${unsafeCommands.map(cmd => this.renderCommandCard(cmd)).join('')}
    </div>
    
    <script>
        const vscode = acquireVsCodeApi();
        
        function generateCommand(commandId) {
            const params = {};
            const inputs = document.querySelectorAll(\`#\${commandId} .param-input, #\${commandId} .param-select\`);
            
            inputs.forEach(input => {
                const paramName = input.dataset.param;
                let value = input.value;
                
                if (input.type === 'checkbox') {
                    value = input.checked;
                } else if (input.type === 'number') {
                    value = parseFloat(value) || null;
                }
                
                if (value !== null && value !== '') {
                    params[paramName] = value;
                }
            });
            
            // Build command string
            const baseCmd = document.getElementById(commandId).dataset.baseCommand;
            let cmdStr = baseCmd;
            
            Object.entries(params).forEach(([name, value]) => {
                const inputElem = document.querySelector(\`#\${commandId} [data-param="\${name}"]\`);
                const type = inputElem.dataset.type;
                
                if (type === 'switch' && value === true) {
                    cmdStr += \` -\${name}\`;
                } else if (type === 'boolean') {
                    cmdStr += \` -\${name} $\${value}\`;
                } else if (type === 'string') {
                    cmdStr += \` -\${name} "\${value}"\`;
                } else {
                    cmdStr += \` -\${name} \${value}\`;
                }
            });
            
            // Display in output box
            document.getElementById(\`\${commandId}-output\`).textContent = cmdStr;
        }
        
        function copyCommand(commandId) {
            const output = document.getElementById(\`\${commandId}-output\`).textContent;
            if (output) {
                vscode.postMessage({
                    command: 'copyCommand',
                    text: output
                });
            }
        }
        
        function openDocs(url) {
            vscode.postMessage({
                command: 'openDocs',
                url: url
            });
        }
    </script>
</body>
</html>`;
    }
    
    private renderCommandCard(cmd: IPowerShellCommand): string {
        const commandId = cmd.name.replace(/\s+/g, '-').toLowerCase();
        const safetyClass = cmd.safetyLevel === CommandSafetyLevel.Safe ? 'safe' : 'unsafe';
        
        return `
<div class="command-card" id="${commandId}" data-base-command="${cmd.baseCommand}">
    <div class="command-header">
        <span class="command-name">${cmd.name}</span>
        <span class="safety-badge ${safetyClass}">${cmd.safetyLevel.toUpperCase()}</span>
    </div>
    
    <div>
        <a href="#" class="doc-link" onclick="openDocs('${cmd.docUrl}'); return false;">
            📚 View Documentation
        </a>
    </div>
    
    <div class="command-params">
        ${cmd.parameters.map(param => this.renderParameter(param, commandId)).join('')}
    </div>
    
    <div class="button-group">
        <button class="btn-primary" onclick="generateCommand('${commandId}')">
            🔨 Generate Command
        </button>
        <button class="btn-secondary" onclick="copyCommand('${commandId}')">
            📋 Copy to Clipboard
        </button>
    </div>
    
    <div class="command-output" id="${commandId}-output"></div>
</div>
        `;
    }
    
    private renderParameter(param: IPowerShellParameter, commandId: string): string {
        let inputControl = '';
        
        if (param.type === 'enum' && param.options) {
            inputControl = `
                <select class="param-select" data-param="${param.name}" data-type="${param.type}">
                    <option value="">-- Select --</option>
                    ${param.options.map(opt => `
                        <option value="${opt}" ${param.defaultValue === opt ? 'selected' : ''}>
                            ${opt}
                        </option>
                    `).join('')}
                </select>
            `;
        } else if (param.type === 'boolean' || param.type === 'switch') {
            inputControl = `
                <input type="checkbox" 
                       class="param-input" 
                       data-param="${param.name}" 
                       data-type="${param.type}"
                       ${param.defaultValue ? 'checked' : ''}>
            `;
        } else if (param.type === 'number') {
            inputControl = `
                <input type="number" 
                       class="param-input" 
                       data-param="${param.name}" 
                       data-type="${param.type}"
                       placeholder="${param.defaultValue || ''}"
                       value="${param.defaultValue || ''}">
            `;
        } else {
            inputControl = `
                <input type="text" 
                       class="param-input" 
                       data-param="${param.name}" 
                       data-type="${param.type}"
                       placeholder="${param.defaultValue || ''}"
                       value="${param.defaultValue || ''}">
            `;
        }
        
        return `
<div class="param-row">
    <div class="param-label">
        ${param.name}${param.required ? '<span class="required-mark">*</span>' : ''}
    </div>
    <div>${inputControl}</div>
    <div style="font-size: 12px; color: var(--vscode-descriptionForeground);">
        ${param.description || ''}
    </div>
</div>
        `;
    }
}
```

#### Phase 3: Command Registration
```typescript
context.subscriptions.push(
    vscode.commands.registerCommand(
        'serviceFabric.showClusterCommands',
        async (cluster: any) => {
            const sfRest = cluster?.sfRest || rootSfRest;
            const view = new ClusterCommandsView(sfRest, cluster.clusterHttpEndpoint);
            await view.show();
        }
    )
);
```

### Expansion Ideas
Based on SFX, can add more commands:
- **Node Commands:** Get-ServiceFabricNode, Disable-ServiceFabricNode, Enable-ServiceFabricNode
- **Application Commands:** Get-ServiceFabricApplication, Remove-ServiceFabricApplication
- **Replica Commands:** Restart-ServiceFabricReplica, Remove-ServiceFabricReplica
- **Test Commands:** Test-ServiceFabricClusterConnection, Test-ServiceFabricClusterManifest

---

## 4. Implementation Priority

### Phase 1 (Week 1-2): Details Tab
- ✅ Already have cluster tabs in tree view
- 🔨 Add `getClusterUpgradeProgress()` to sfRest
- 🔨 Create ClusterUpgradeView webview
- 🔨 Register command handler
- ✅ Test with local cluster upgrade

**Why First:** Critical for understanding cluster state during upgrades/downgrades

### Phase 2 (Week 3-4): Cluster Map
- 🔨 Create ClusterTopology model
- 🔨 Create ClusterMapView webview with table layout
- 🔨 Add health color coding
- 🔨 Test with 5 FD × 5 UD Azure cluster

**Why Second:** High value visualization for understanding node distribution

### Phase 3 (Week 5-6): Commands Tab
- 🔨 Create PowerShellCommand model
- 🔨 Create ClusterCommandsView with parameter forms
- 🔨 Add clipboard copy functionality
- 🔨 Add documentation links
- 🔨 Test command generation

**Why Third:** Nice-to-have utility, lower priority than visualization

---

## 5. Testing Strategy

### Local Cluster Testing
```powershell
# Test Details Tab - Trigger upgrade
Connect-ServiceFabricCluster localhost:19080
Copy-ServiceFabricApplicationPackage -ApplicationPackagePath "VotingApp" -ImageStoreConnectionString "fabric:ImageStore"
Register-ServiceFabricApplicationType -ApplicationPathInImageStore "VotingApp"
Start-ServiceFabricApplicationUpgrade -ApplicationName "fabric:/Voting" -ApplicationTypeVersion "2.0.0" -Monitored

# Test Cluster Map - View topology
Get-ServiceFabricNode | Select Name, FaultDomain, UpgradeDomain, HealthState
```

### Azure Cluster Testing
- Deploy to Azure Service Fabric cluster (5 UDs, 5 FDs typical)
- Test cluster upgrade scenario
- Verify map shows all 25 cells correctly

---

## 6. Future Enhancements

### Based on SFX Advanced Features
1. **Node Deactivation Tracking** - Show nodes being deactivated during upgrades
2. **Repair Task Integration** - Display ongoing repair tasks in cluster map
3. **Timeline View** - EventStore-based timeline of cluster events
4. **Safety Check Visualization** - Show pending safety checks during upgrades
5. **Health Check Phase Tracking** - Display current phase (WaitDuration, StableDuration, Retry)

### VS Code Specific
1. **Command Palette Integration** - Quick actions for common operations
2. **Status Bar Widget** - Show cluster upgrade status
3. **Notification on Upgrade Complete** - Toast notification when upgrade finishes
4. **Settings** - Configure auto-refresh intervals

---

## 7. References

### SFX Source Files
- **Cluster Details:** `src/SfxWeb/src/app/views/cluster/details/details.component.ts`
- **Cluster Map:** `src/SfxWeb/src/app/modules/clustermap/map/map.component.ts`
- **Commands:** `src/SfxWeb/src/app/views/cluster/commands/commands.component.ts`
- **Upgrade Model:** `src/SfxWeb/src/app/Models/DataModels/Cluster.ts`
- **Upgrade Progress Module:** `src/SfxWeb/src/app/modules/upgrade-progress/`

### Microsoft Learn Documentation
- [Cluster Upgrade Overview](https://learn.microsoft.com/azure/service-fabric/service-fabric-application-upgrade)
- [Fault Domains and Upgrade Domains](https://learn.microsoft.com/azure/service-fabric/service-fabric-cluster-resource-manager-cluster-description)
- [PowerShell Module Reference](https://learn.microsoft.com/powershell/module/servicefabric/)
- [Cluster Health Monitoring](https://learn.microsoft.com/azure/service-fabric/service-fabric-health-introduction)

---

**Next Steps:**
1. Review this plan
2. Start Phase 1: Implement Details tab with upgrade visualization
3. Test on local cluster with Voting app upgrade
4. Iterate and move to Phase 2 (Cluster Map)
