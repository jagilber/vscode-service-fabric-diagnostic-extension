import * as vscode from 'vscode';
import { SfRest } from '../sfRest';
import { SfUtility, debugLevel } from '../sfUtility';
import * as sfModels from '../sdk/servicefabric/servicefabric/src/models';

/**
 * Cluster Map View - Visual FD×UD topology matrix
 * Shows node distribution across Fault Domains and Upgrade Domains
 */
export class ClusterMapView {
    private readonly context: vscode.ExtensionContext;
    private readonly sfRest: SfRest;
    private readonly clusterEndpoint: string;

    constructor(context: vscode.ExtensionContext, sfRest: SfRest, clusterEndpoint: string) {
        this.context = context;
        this.sfRest = sfRest;
        this.clusterEndpoint = clusterEndpoint;
    }

    public async show(): Promise<void> {
        try {
            SfUtility.outputLog('ClusterMapView:show:start', null, debugLevel.info);

            // Create new panel each time (don't cache to avoid stale data)
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
            const panel = vscode.window.createWebviewPanel(
                'sfClusterMap',
                `Cluster Map - ${this.clusterEndpoint} - ${timestamp}`,
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

            // Fetch data from the correct cluster
            const [nodes, manifest] = await Promise.all([
                this.sfRest.getNodes(),
                this.sfRest.getClusterManifest()
            ]);

            // Parse manifest for FD/UD information
            const topology = this.parseClusterTopology(nodes, manifest);

            // Generate and set HTML
            const html = this.getHtmlContent(topology);
            panel.webview.html = html;

            SfUtility.outputLog('ClusterMapView:show:complete', null, debugLevel.info);
        } catch (error) {
            SfUtility.outputLog('Failed to show cluster map', error, debugLevel.error);
            SfUtility.showError(`Failed to show cluster map: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private parseClusterTopology(nodes: sfModels.NodeInfo[], manifest: any): ClusterTopology {
        const topology: ClusterTopology = {
            faultDomains: new Set<string>(),
            upgradeDomains: new Set<string>(),
            nodeMap: new Map<string, NodePlacement>()
        };

        // Extract FD and UD from each node
        for (const node of nodes) {
            if (!node.name) continue;

            const fd = node.faultDomain || 'fd:/unknown';
            const ud = node.upgradeDomain || 'unknown';
            
            topology.faultDomains.add(fd);
            topology.upgradeDomains.add(ud);

            const key = `${fd}|${ud}`;
            if (!topology.nodeMap.has(key)) {
                topology.nodeMap.set(key, {
                    faultDomain: fd,
                    upgradeDomain: ud,
                    nodes: []
                });
            }

            topology.nodeMap.get(key)!.nodes.push({
                name: node.name,
                healthState: node.healthState || 'Unknown',
                nodeStatus: node.nodeStatus || 'Unknown',
                ipAddress: node.ipAddressOrFqdn
            });
        }

        return topology;
    }

    private getHtmlContent(topology: ClusterTopology): string {
        const faultDomains = Array.from(topology.faultDomains).sort();
        const upgradeDomains = Array.from(topology.upgradeDomains).sort();

        // Build FD header row
        const fdHeaders = faultDomains.map(fd => {
            const fdLabel = fd.replace('fd:/', '');
            const nodes = Array.from(topology.nodeMap.values())
                .filter(p => p.faultDomain === fd);
            
            const healthCounts = this.calculateHealthCounts(nodes);
            
            return `
                <th class="fd-header">
                    <div class="fd-label">${fdLabel}</div>
                    <div class="health-indicators">
                        <span class="health-ok" title="OK">✓ ${healthCounts.ok}</span>
                        <span class="health-warning" title="Warning">⚠ ${healthCounts.warning}</span>
                        <span class="health-error" title="Error">✗ ${healthCounts.error}</span>
                    </div>
                </th>
            `;
        }).join('');

        // Build UD rows
        const udRows = upgradeDomains.map(ud => {
            const healthCounts = this.calculateHealthCountsForUD(topology, ud);
            
            const cells = faultDomains.map(fd => {
                const key = `${fd}|${ud}`;
                const placement = topology.nodeMap.get(key);
                
                if (!placement || placement.nodes.length === 0) {
                    return '<td class="empty-cell"></td>';
                }

                const nodeList = placement.nodes.map(node => {
                    const healthClass = this.getHealthClass(node.healthState);
                    const statusIcon = node.nodeStatus === 'Up' ? '✓' : '✗';
                    
                    return `
                        <div class="node-item ${healthClass}">
                            <span class="node-status">${statusIcon}</span>
                            <span class="node-name" title="${node.ipAddress}">${node.name}</span>
                        </div>
                    `;
                }).join('');

                return `
                    <td class="node-cell">
                        ${nodeList}
                    </td>
                `;
            }).join('');

            return `
                <tr>
                    <th class="ud-header">
                        <div class="ud-label">UD ${ud}</div>
                        <div class="health-ring">
                            <div class="health-indicators">
                                <span class="health-ok" title="OK">✓ ${healthCounts.ok}</span>
                                <span class="health-warning" title="Warning">⚠ ${healthCounts.warning}</span>
                                <span class="health-error" title="Error">✗ ${healthCounts.error}</span>
                            </div>
                        </div>
                    </th>
                    ${cells}
                </tr>
            `;
        }).join('');

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cluster Map</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
            padding: 20px;
            margin: 0;
        }
        h2 {
            margin-top: 0;
            color: var(--vscode-foreground);
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 10px;
        }
        .cluster-map {
            margin-top: 20px;
            overflow-x: auto;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            background: var(--vscode-editor-background);
        }
        th, td {
            border: 1px solid var(--vscode-panel-border);
            padding: 12px;
            text-align: center;
            vertical-align: middle;
        }
        .fd-header {
            background: var(--vscode-editor-inactiveSelectionBackground);
            font-weight: bold;
            min-width: 150px;
        }
        .ud-header {
            background: var(--vscode-editor-inactiveSelectionBackground);
            font-weight: bold;
            min-width: 100px;
        }
        .fd-label, .ud-label {
            font-size: 14px;
            margin-bottom: 5px;
        }
        .health-indicators {
            display: flex;
            justify-content: center;
            gap: 10px;
            font-size: 12px;
        }
        .health-ring {
            margin-top: 8px;
        }
        .health-ok {
            color: var(--vscode-testing-iconPassed);
        }
        .health-warning {
            color: var(--vscode-editorWarning-foreground);
        }
        .health-error {
            color: var(--vscode-errorForeground);
        }
        .node-cell {
            background: var(--vscode-editor-background);
            padding: 8px;
        }
        .empty-cell {
            background: var(--vscode-editor-inactiveSelectionBackground);
            opacity: 0.3;
        }
        .node-item {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 10px;
            margin: 4px 0;
            border-radius: 4px;
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            font-size: 12px;
        }
        .node-item.health-ok {
            border-left: 3px solid var(--vscode-testing-iconPassed);
        }
        .node-item.health-warning {
            border-left: 3px solid var(--vscode-editorWarning-foreground);
        }
        .node-item.health-error {
            border-left: 3px solid var(--vscode-errorForeground);
        }
        .node-status {
            font-weight: bold;
            min-width: 12px;
        }
        .node-name {
            flex: 1;
            text-align: left;
            font-family: var(--vscode-editor-font-family);
        }
        .legend {
            margin-top: 20px;
            padding: 15px;
            background: var(--vscode-editor-inactiveSelectionBackground);
            border-radius: 4px;
            font-size: 12px;
        }
        .legend-title {
            font-weight: bold;
            margin-bottom: 8px;
        }
        .legend-item {
            margin: 4px 0;
        }
    </style>
</head>
<body>
    <h2>Cluster Topology Map</h2>
    <div class="cluster-map">
        <table>
            <thead>
                <tr>
                    <th class="corner-cell">FD → / UD ↓</th>
                    ${fdHeaders}
                </tr>
            </thead>
            <tbody>
                ${udRows}
            </tbody>
        </table>
    </div>
    <div class="legend">
        <div class="legend-title">Legend</div>
        <div class="legend-item"><strong>FD</strong> - Fault Domain: Physical isolation boundary (rack, datacenter)</div>
        <div class="legend-item"><strong>UD</strong> - Upgrade Domain: Logical grouping for rolling upgrades</div>
        <div class="legend-item"><span class="health-ok">✓</span> - Node Up and Healthy</div>
        <div class="legend-item"><span class="health-warning">⚠</span> - Node Warning</div>
        <div class="legend-item"><span class="health-error">✗</span> - Node Down or Error</div>
    </div>
</body>
</html>`;
    }

    private calculateHealthCounts(placements: NodePlacement[]): HealthCounts {
        const counts: HealthCounts = { ok: 0, warning: 0, error: 0 };
        
        for (const placement of placements) {
            for (const node of placement.nodes) {
                const health = node.healthState?.toLowerCase();
                if (health === 'ok') counts.ok++;
                else if (health === 'warning') counts.warning++;
                else counts.error++;
            }
        }
        
        return counts;
    }

    private calculateHealthCountsForUD(topology: ClusterTopology, ud: string): HealthCounts {
        const counts: HealthCounts = { ok: 0, warning: 0, error: 0 };
        
        for (const placement of topology.nodeMap.values()) {
            if (placement.upgradeDomain === ud) {
                for (const node of placement.nodes) {
                    const health = node.healthState?.toLowerCase();
                    if (health === 'ok') counts.ok++;
                    else if (health === 'warning') counts.warning++;
                    else counts.error++;
                }
            }
        }
        
        return counts;
    }

    private getHealthClass(healthState?: string): string {
        const health = healthState?.toLowerCase();
        if (health === 'ok') return 'health-ok';
        if (health === 'warning') return 'health-warning';
        return 'health-error';
    }
}

interface ClusterTopology {
    faultDomains: Set<string>;
    upgradeDomains: Set<string>;
    nodeMap: Map<string, NodePlacement>;
}

interface NodePlacement {
    faultDomain: string;
    upgradeDomain: string;
    nodes: NodeInfo[];
}

interface NodeInfo {
    name: string;
    healthState: string;
    nodeStatus: string;
    ipAddress?: string;
}

interface HealthCounts {
    ok: number;
    warning: number;
    error: number;
}
