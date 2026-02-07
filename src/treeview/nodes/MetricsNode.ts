import * as vscode from 'vscode';
import { BaseTreeNode } from '../BaseTreeNode';
import { ITreeNode } from '../ITreeNode';
import { TreeNodeContext } from '../TreeNodeContext';
import { IconService } from '../IconService';
import { DataCache } from '../DataCache';

/**
 * Cluster metrics node. Lazy-loads cluster load metrics on expand.
 * Children are individual metric leaf nodes.
 */
export class MetricsNode extends BaseTreeNode {
    readonly id: string;
    readonly contextValue = undefined;
    readonly itemType = 'metrics-group';

    constructor(ctx: TreeNodeContext, iconService: IconService, cache: DataCache) {
        super(ctx, iconService, cache);
        this.id = `metrics-group:${ctx.clusterEndpoint}`;
    }

    getTreeItem(): vscode.TreeItem {
        const item = new vscode.TreeItem('cluster metrics', vscode.TreeItemCollapsibleState.Collapsed);
        item.id = this.id;
        item.iconPath = this.iconService.getStaticIcon('graph', 'charts.red');
        item.resourceUri = this.ctx.resourceUri;
        return item;
    }

    protected async fetchChildren(): Promise<ITreeNode[]> {
        const cacheKey = `cluster-load:${this.ctx.clusterEndpoint}`;
        let loadInfo = this.cache.get<any>(cacheKey);

        if (!loadInfo) {
            loadInfo = await this.ctx.sfRest.getClusterLoadInformation();
            this.cache.set(cacheKey, loadInfo);
        }

        const children: ITreeNode[] = [];

        // Show summary metrics
        if (loadInfo.lastBalancingStartTimeUtc) {
            children.push(new MetricLeafNode(
                this.ctx,
                this.iconService,
                'Last Balancing',
                new Date(loadInfo.lastBalancingStartTimeUtc).toLocaleString(),
                'clock',
            ));
        }

        if (loadInfo.lastBalancingEndTimeUtc) {
            children.push(new MetricLeafNode(
                this.ctx,
                this.iconService,
                'Balancing Duration',
                `${new Date(loadInfo.lastBalancingEndTimeUtc).getTime() - new Date(loadInfo.lastBalancingStartTimeUtc || 0).getTime()}ms`,
                'watch',
            ));
        }

        // Individual load metric items
        if (loadInfo.loadMetricInformation && loadInfo.loadMetricInformation.length > 0) {
            const sorted = [...loadInfo.loadMetricInformation].sort(
                (a: any, b: any) => (a.name || '').localeCompare(b.name || ''),
            );

            for (const metric of sorted) {
                children.push(new MetricLeafNode(
                    this.ctx,
                    this.iconService,
                    metric.name || 'Unknown',
                    this.formatMetricValue(metric),
                    'dashboard',
                    this.buildMetricTooltip(metric),
                ));
            }
        }

        if (children.length === 0) {
            children.push(new MetricLeafNode(
                this.ctx,
                this.iconService,
                'No metrics available',
                '',
                'info',
            ));
        }

        return children;
    }

    private formatMetricValue(metric: any): string {
        const parts: string[] = [];
        if (metric.clusterLoad !== undefined) {
            parts.push(`Load: ${metric.clusterLoad}`);
        }
        if (metric.clusterCapacity !== undefined && metric.clusterCapacity > 0) {
            parts.push(`Cap: ${metric.clusterCapacity}`);
        }
        if (metric.clusterRemainingCapacity !== undefined) {
            parts.push(`Rem: ${metric.clusterRemainingCapacity}`);
        }
        return parts.join(' | ');
    }

    private buildMetricTooltip(metric: any): string {
        const lines: string[] = [
            `Metric: ${metric.name || 'Unknown'}`,
        ];
        if (metric.clusterLoad !== undefined) { lines.push(`Cluster Load: ${metric.clusterLoad}`); }
        if (metric.clusterCapacity !== undefined) { lines.push(`Cluster Capacity: ${metric.clusterCapacity}`); }
        if (metric.clusterRemainingCapacity !== undefined) { lines.push(`Remaining Capacity: ${metric.clusterRemainingCapacity}`); }
        if (metric.isClusterCapacityViolation !== undefined) { lines.push(`Capacity Violation: ${metric.isClusterCapacityViolation}`); }
        if (metric.nodeBufferPercentage !== undefined) { lines.push(`Node Buffer: ${metric.nodeBufferPercentage}%`); }
        if (metric.clusterBufferedCapacity !== undefined) { lines.push(`Buffered Capacity: ${metric.clusterBufferedCapacity}`); }
        if (metric.clusterRemainingBufferedCapacity !== undefined) { lines.push(`Remaining Buffered: ${metric.clusterRemainingBufferedCapacity}`); }
        if (metric.minimumNodeLoad !== undefined) { lines.push(`Min Node Load: ${metric.minimumNodeLoad}`); }
        if (metric.maximumNodeLoad !== undefined) { lines.push(`Max Node Load: ${metric.maximumNodeLoad}`); }
        if (metric.deviationBefore !== undefined) { lines.push(`Deviation Before: ${metric.deviationBefore.toFixed(4)}`); }
        if (metric.deviationAfter !== undefined) { lines.push(`Deviation After: ${metric.deviationAfter.toFixed(4)}`); }
        return lines.join('\n');
    }
}

/**
 * Individual metric leaf node.
 */
class MetricLeafNode implements ITreeNode {
    readonly id: string;
    readonly contextValue = undefined;
    readonly itemType = 'metric';
    readonly isLoaded = true;

    constructor(
        private readonly ctx: TreeNodeContext,
        private readonly iconService: IconService,
        private readonly label: string,
        private readonly value: string,
        private readonly iconId: string,
        private readonly tooltipText?: string,
    ) {
        this.id = `metric:${ctx.clusterEndpoint}:${label}`;
    }

    getTreeItem(): vscode.TreeItem {
        const item = new vscode.TreeItem(this.label, vscode.TreeItemCollapsibleState.None);
        item.id = this.id;
        item.description = this.value;
        item.iconPath = this.iconService.getPlainIcon(this.iconId);
        item.tooltip = this.tooltipText || `${this.label}: ${this.value}`;
        return item;
    }

    async getChildren(): Promise<undefined> { return undefined; }
    invalidate(): void {}
    dispose(): void {}
}
