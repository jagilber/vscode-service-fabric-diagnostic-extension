/**
 * Refresh/Invalidation Regression Tests
 * 
 * These tests verify the critical contracts around invalidation behavior:
 * 
 * 1. ClusterNode.invalidate() preserves children (doesn't destroy/recreate)
 * 2. Group nodes preserve count/health across invalidation
 * 3. After invalidation, getTreeItem() uses sfConfig fallback for health
 * 4. BaseTreeNode.invalidate() clears load state for re-fetch
 */

import * as vscode from 'vscode';
import { DataCache } from '../../../src/treeview/DataCache';
import { IconService } from '../../../src/treeview/IconService';
import { ClusterNode } from '../../../src/treeview/nodes/cluster/ClusterNode';
import { ApplicationsGroupNode } from '../../../src/treeview/nodes/cluster/ApplicationsGroupNode';
import { NodesGroupNode } from '../../../src/treeview/nodes/cluster/NodesGroupNode';
import { PartitionsGroupNode } from '../../../src/treeview/nodes/cluster/PartitionsGroupNode';
import { ReplicasGroupNode } from '../../../src/treeview/nodes/cluster/ReplicasGroupNode';
import {
    createTestContext,
    createTestContextWithData,
    sampleNode,
    sampleApplication,
    samplePartition,
    sampleReplica,
} from './helpers';

jest.mock('../../../src/sfUtility', () => ({
    SfUtility: {
        outputLog: jest.fn(),
    },
    debugLevel: { info: 'info', warn: 'warn', debug: 'debug', error: 'error' },
}));

describe('ClusterNode invalidation', () => {
    let iconService: IconService;
    let cache: DataCache;

    beforeEach(() => {
        iconService = new IconService();
        cache = new DataCache();
    });

    it('should preserve children array on invalidate (not destroy/recreate)', async () => {
        const ctx = createTestContextWithData({
            nodes: [sampleNode()],
            applications: [sampleApplication()],
            applicationTypes: [{ name: 'MyAppType' }],
            systemServices: [],
            clusterLoad: {},
        });
        const node = new ClusterNode(ctx, iconService, cache);

        // First fetch: creates children
        const children1 = await node.getChildren();
        expect(children1).toBeDefined();
        expect(children1!.length).toBeGreaterThan(0);

        // Remember the children references
        const firstChildren = [...children1!];

        // Invalidate
        node.invalidate();

        // Children should still be the SAME instances (preserved, not destroyed)
        const children2 = await node.getChildren();
        expect(children2).toBeDefined();
        expect(children2!.length).toBe(firstChildren.length);

        // Each child should be the exact same object reference
        for (let i = 0; i < firstChildren.length; i++) {
            expect(children2![i]).toBe(firstChildren[i]);
        }
    });

    it('should recursively invalidate children on invalidate', async () => {
        const ctx = createTestContextWithData({
            nodes: [sampleNode()],
            applications: [],
            applicationTypes: [],
            systemServices: [],
            clusterLoad: {},
        });
        const node = new ClusterNode(ctx, iconService, cache);

        // Fetch children to load them
        const children = await node.getChildren();
        expect(children).toBeDefined();

        // Find the NodesGroupNode child
        const nodesGroup = children!.find(c => c.itemType === 'nodes-group');
        expect(nodesGroup).toBeDefined();

        // Load the nodes group children
        await nodesGroup!.getChildren();
        expect(nodesGroup!.isLoaded).toBe(true);

        // Now invalidate the cluster node
        node.invalidate();

        // The nodes group should be invalidated (isLoaded = false) but still exist
        expect(nodesGroup!.isLoaded).toBe(false);
    });
});

describe('Group node count/health preservation on invalidate', () => {
    let iconService: IconService;
    let cache: DataCache;

    beforeEach(() => {
        iconService = new IconService();
        cache = new DataCache();
    });

    it('PartitionsGroupNode should preserve count across invalidation', async () => {
        const partitions = [
            samplePartition({ id: 'p1', healthState: 'Ok' }),
            samplePartition({ id: 'p2', healthState: 'Warning' }),
        ];
        const ctx = createTestContextWithData({ partitions });
        const node = new PartitionsGroupNode(ctx, iconService, cache, 'MyService', 'MyApp');

        // Fetch to populate counts
        await node.getChildren();
        let item = node.getTreeItem();
        expect(typeof item.label === 'string' ? item.label : '').toContain('partitions (2)');

        // Invalidate
        node.invalidate();

        // Count should be preserved (NOT reset to "...")
        item = node.getTreeItem();
        expect(typeof item.label === 'string' ? item.label : '').toContain('partitions (2)');
        expect(typeof item.label === 'string' ? item.label : '').not.toContain('(...)');
    });

    it('ReplicasGroupNode should preserve count across invalidation', async () => {
        const replicas = [
            sampleReplica({ replicaId: 'r1', healthState: 'Ok' }),
            sampleReplica({ replicaId: 'r2', healthState: 'Ok' }),
            sampleReplica({ replicaId: 'r3', healthState: 'Error' }),
        ];
        const ctx = createTestContextWithData({ replicas });
        const node = new ReplicasGroupNode(ctx, iconService, cache, 'partition-id', 'MyService', 'MyApp');

        await node.getChildren();
        let item = node.getTreeItem();
        expect(typeof item.label === 'string' ? item.label : '').toContain('replicas (3)');

        node.invalidate();

        item = node.getTreeItem();
        expect(typeof item.label === 'string' ? item.label : '').toContain('replicas (3)');
        expect(typeof item.label === 'string' ? item.label : '').not.toContain('(...)');
    });

    it('PartitionsGroupNode should preserve health icon across invalidation', async () => {
        const partitions = [
            samplePartition({ id: 'p1', healthState: 'Error' }),
        ];
        const ctx = createTestContextWithData({ partitions });
        const node = new PartitionsGroupNode(ctx, iconService, cache, 'MyService', 'MyApp');

        await node.getChildren();
        let item = node.getTreeItem();
        let icon = item.iconPath as vscode.ThemeIcon;
        expect(icon.color).toBeDefined();
        expect((icon.color as vscode.ThemeColor).id).toBe('testing.iconFailed');

        node.invalidate();

        item = node.getTreeItem();
        icon = item.iconPath as vscode.ThemeIcon;
        // Health should be preserved after invalidation
        expect(icon.color).toBeDefined();
        expect((icon.color as vscode.ThemeColor).id).toBe('testing.iconFailed');
    });
});

describe('ApplicationsGroupNode sfConfig fallback after invalidation', () => {
    let iconService: IconService;
    let cache: DataCache;

    beforeEach(() => {
        iconService = new IconService();
        cache = new DataCache();
    });

    it('should use sfConfig health when local health is undefined after base invalidation', () => {
        const ctx = createTestContextWithData({}, {
            clusterHealth: {
                applicationHealthStates: [
                    { name: 'fabric:/MyApp', aggregatedHealthState: 'Warning' },
                    { name: 'fabric:/System', aggregatedHealthState: 'Ok' },
                ],
                nodeHealthStates: [],
            },
        });
        const node = new ApplicationsGroupNode(ctx, iconService, cache);

        // Before any fetch — local health is undefined, should fall back to sfConfig
        const item = node.getTreeItem();
        const icon = item.iconPath as vscode.ThemeIcon;

        expect(icon.color).toBeDefined();
        expect((icon.color as vscode.ThemeColor).id).toBe('testing.iconQueued');
        expect(typeof item.label === 'string' ? item.label : '').toContain('applications (1)');
    });
});
