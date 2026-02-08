/**
 * ImageStore and Metrics Node Contract Tests
 * 
 * These tests verify:
 * 
 * 1. ImageStoreNode does NOT block on isNativeImageStoreAvailable() — works on Azure clusters
 * 2. ImageStoreNode handles REST errors gracefully with ImageStoreUnavailableNode
 * 3. MetricsNode is expandable (Collapsed, not None) — was StaticItemNode before fix
 * 4. MetricsNode children have colored icons and click commands
 * 5. ClusterNode.fetchChildren() uses MetricsNode, not StaticItemNode, for metrics
 */

import * as vscode from 'vscode';
import { DataCache } from '../../../src/treeview/DataCache';
import { IconService } from '../../../src/treeview/IconService';
import { ImageStoreNode } from '../../../src/treeview/nodes/ImageStoreNode';
import { MetricsNode } from '../../../src/treeview/nodes/MetricsNode';
import { ClusterNode } from '../../../src/treeview/nodes/ClusterNode';
import {
    createTestContextWithData,
} from './helpers';

jest.mock('../../../src/sfUtility', () => ({
    SfUtility: {
        outputLog: jest.fn(),
    },
    debugLevel: { info: 'info', warn: 'warn', debug: 'debug', error: 'error' },
}));

describe('ImageStoreNode', () => {
    let iconService: IconService;
    let cache: DataCache;

    beforeEach(() => {
        iconService = new IconService();
        cache = new DataCache();
    });

    describe('Azure cluster support (no native image store gate)', () => {
        it('should fetch children even when isNativeImageStoreAvailable returns false', async () => {
            const ctx = createTestContextWithData(
                {
                    imageStoreContent: {
                        storeFolders: [{ storeRelativePath: 'Store' }],
                        storeFiles: [],
                    },
                },
                { isNativeImageStoreAvailable: false },
            );
            const node = new ImageStoreNode(ctx, iconService, cache);

            const children = await node.getChildren();

            // Should NOT be blocked — should return the folder
            expect(children).toBeDefined();
            expect(children!.length).toBe(1);
        });

        it('should fetch children when isNativeImageStoreAvailable returns true', async () => {
            const ctx = createTestContextWithData(
                {
                    imageStoreContent: {
                        storeFolders: [{ storeRelativePath: 'Store' }, { storeRelativePath: 'WindowsFabricStore' }],
                        storeFiles: [{ storeRelativePath: 'data.xml', fileSize: 1024 }],
                    },
                },
                { isNativeImageStoreAvailable: true },
            );
            const node = new ImageStoreNode(ctx, iconService, cache);

            const children = await node.getChildren();

            // Should show 2 folders + 1 file
            expect(children).toBeDefined();
            expect(children!.length).toBe(3);
        });
    });

    describe('error handling', () => {
        it('should return error placeholder when REST call fails', async () => {
            const ctx = createTestContextWithData({});
            // Override getImageStoreContent to throw
            (ctx.sfRest.getImageStoreContent as jest.Mock).mockRejectedValue(
                new Error('403 Forbidden'),
            );
            const node = new ImageStoreNode(ctx, iconService, cache);

            const children = await node.getChildren();

            expect(children).toBeDefined();
            expect(children!.length).toBe(1);
            expect(children![0].itemType).toBe('image-store-unavailable');
        });
    });

    describe('getTreeItem() contract', () => {
        it('should be expandable (Collapsed)', () => {
            const ctx = createTestContextWithData({});
            const node = new ImageStoreNode(ctx, iconService, cache);

            const item = node.getTreeItem();

            expect(item.collapsibleState).toBe(vscode.TreeItemCollapsibleState.Collapsed);
        });

        it('should have colored database icon for root', () => {
            const ctx = createTestContextWithData({});
            const node = new ImageStoreNode(ctx, iconService, cache);

            const item = node.getTreeItem();
            const icon = item.iconPath as vscode.ThemeIcon;

            expect(icon.id).toBe('database');
            expect(icon.color).toBeInstanceOf(vscode.ThemeColor);
            expect((icon.color as vscode.ThemeColor).id).toBe('charts.blue');
        });
    });
});

describe('MetricsNode', () => {
    let iconService: IconService;
    let cache: DataCache;

    beforeEach(() => {
        iconService = new IconService();
        cache = new DataCache();
    });

    describe('getTreeItem() contract', () => {
        it('should be expandable (Collapsed, not None)', () => {
            const ctx = createTestContextWithData({});
            const node = new MetricsNode(ctx, iconService, cache);

            const item = node.getTreeItem();

            // CRITICAL: Was StaticItemNode (None) before fix — must be Collapsed
            expect(item.collapsibleState).toBe(vscode.TreeItemCollapsibleState.Collapsed);
        });

        it('should have colored graph icon', () => {
            const ctx = createTestContextWithData({});
            const node = new MetricsNode(ctx, iconService, cache);

            const item = node.getTreeItem();
            const icon = item.iconPath as vscode.ThemeIcon;

            expect(icon.id).toBe('graph');
            expect(icon.color).toBeInstanceOf(vscode.ThemeColor);
        });
    });

    describe('fetchChildren() contract', () => {
        it('should create metric leaf nodes with colored icons', async () => {
            const ctx = createTestContextWithData({
                clusterLoad: {
                    lastBalancingStartTimeUtc: '2024-01-01T00:00:00Z',
                    lastBalancingEndTimeUtc: '2024-01-01T00:00:05Z',
                    loadMetricInformation: [
                        { name: 'Count', clusterLoad: 10, clusterCapacity: 100, isClusterCapacityViolation: false },
                        { name: 'CpuUsage', clusterLoad: 95, clusterCapacity: 100, isClusterCapacityViolation: true },
                    ],
                },
            });
            const node = new MetricsNode(ctx, iconService, cache);

            const children = await node.getChildren();

            expect(children).toBeDefined();
            // 2 timing metrics + 2 load metrics = 4
            expect(children!.length).toBe(4);

            // Check each metric leaf has a colored icon and click command
            for (const child of children!) {
                const item = child.getTreeItem();
                const icon = item.iconPath as vscode.ThemeIcon;
                expect(icon.color).toBeDefined();
                expect(icon.color).toBeInstanceOf(vscode.ThemeColor);
                expect(item.command).toBeDefined();
            }
        });

        it('should use red color for capacity violation metrics', async () => {
            const ctx = createTestContextWithData({
                clusterLoad: {
                    loadMetricInformation: [
                        { name: 'CpuUsage', clusterLoad: 95, isClusterCapacityViolation: true },
                    ],
                },
            });
            const node = new MetricsNode(ctx, iconService, cache);

            const children = await node.getChildren();
            expect(children!.length).toBe(1);

            const item = children![0].getTreeItem();
            const icon = item.iconPath as vscode.ThemeIcon;
            expect((icon.color as vscode.ThemeColor).id).toBe('charts.red');
        });

        it('should use green color for non-violation metrics', async () => {
            const ctx = createTestContextWithData({
                clusterLoad: {
                    loadMetricInformation: [
                        { name: 'Count', clusterLoad: 10, isClusterCapacityViolation: false },
                    ],
                },
            });
            const node = new MetricsNode(ctx, iconService, cache);

            const children = await node.getChildren();
            expect(children!.length).toBe(1);

            const item = children![0].getTreeItem();
            const icon = item.iconPath as vscode.ThemeIcon;
            expect((icon.color as vscode.ThemeColor).id).toBe('charts.green');
        });

        it('should show placeholder when no metrics available', async () => {
            const ctx = createTestContextWithData({
                clusterLoad: { loadMetricInformation: [] },
            });
            const node = new MetricsNode(ctx, iconService, cache);

            const children = await node.getChildren();
            expect(children!.length).toBe(1);
            const item = children![0].getTreeItem();
            expect(typeof item.label === 'string' ? item.label : '').toContain('No metrics');
        });
    });
});

describe('ClusterNode uses MetricsNode (not StaticItemNode)', () => {
    let iconService: IconService;
    let cache: DataCache;

    beforeEach(() => {
        iconService = new IconService();
        cache = new DataCache();
    });

    it('should include MetricsNode in children', async () => {
        const ctx = createTestContextWithData({
            nodes: [],
            applications: [],
            applicationTypes: [],
            systemServices: [],
            clusterLoad: {},
        });
        const node = new ClusterNode(ctx, iconService, cache);

        const children = await node.getChildren();
        expect(children).toBeDefined();

        const metricsChild = children!.find(c => c.itemType === 'metrics-group');
        expect(metricsChild).toBeDefined();

        // Verify it's actually a MetricsNode (expandable)
        const item = metricsChild!.getTreeItem();
        expect(item.collapsibleState).toBe(vscode.TreeItemCollapsibleState.Collapsed);
    });
});
