/**
 * Partition/Replica Node Contract Tests
 * 
 * These tests verify the fixed behavior for partition and replica nodes:
 * 
 * 1. PartitionNode.getTreeItem() command passes bare partitionId as itemId
 * 2. ReplicaNode.getTreeItem() command passes bare replicaId as itemId
 * 3. ReplicaNode.fetchChildren() creates StaticItemNode with parentReplicaId in derived context
 * 4. StaticItemNode passes replicaId from context in command arguments
 */

import * as vscode from 'vscode';
import { DataCache } from '../../../src/treeview/DataCache';
import { IconService } from '../../../src/treeview/IconService';
import { PartitionNode } from '../../../src/treeview/nodes/cluster/PartitionNode';
import { ReplicaNode } from '../../../src/treeview/nodes/cluster/ReplicaNode';
import { PartitionsGroupNode } from '../../../src/treeview/nodes/cluster/PartitionsGroupNode';
import { ReplicasGroupNode } from '../../../src/treeview/nodes/cluster/ReplicasGroupNode';
import {
    createTestContextWithData,
    expectCommandItemId,
    samplePartition,
    sampleReplica,
} from './helpers';

jest.mock('../../../src/sfUtility', () => ({
    SfUtility: {
        outputLog: jest.fn(),
    },
    debugLevel: { info: 'info', warn: 'warn', debug: 'debug', error: 'error' },
}));

describe('PartitionNode', () => {
    let iconService: IconService;
    let cache: DataCache;

    beforeEach(() => {
        iconService = new IconService();
        cache = new DataCache();
    });

    describe('command itemId contract', () => {
        it('should pass bare partitionId as itemId in command arguments', () => {
            const partitionId = 'aaaa-bbbb-cccc-dddd';
            const partition = samplePartition({ id: partitionId });
            const ctx = createTestContextWithData({});
            const node = new PartitionNode(ctx, iconService, cache, partition, 'MyService', 'MyApp');

            const item = node.getTreeItem();

            // The itemId must be the bare GUID, not the composite id
            expectCommandItemId(item, partitionId);
        });

        it('should NOT include cluster endpoint in itemId', () => {
            const partitionId = 'eeee-ffff-0000-1111';
            const partition = samplePartition({ id: partitionId });
            const ctx = createTestContextWithData({});
            const node = new PartitionNode(ctx, iconService, cache, partition, 'MyService', 'MyApp');

            const item = node.getTreeItem();
            const args = item.command!.arguments![0];

            // itemId must NOT contain the composite id format "partition:https://..."
            expect(args.itemId).not.toContain(':');
            expect(args.itemId).not.toContain('partition:');
            expect(args.itemId).toBe(partitionId);
        });
    });

    describe('icon color contract', () => {
        it('should show colored icon based on health state', () => {
            const partition = samplePartition({ healthState: 'Error' });
            const ctx = createTestContextWithData({});
            const node = new PartitionNode(ctx, iconService, cache, partition, 'MyService', 'MyApp');

            const item = node.getTreeItem();
            const icon = item.iconPath as vscode.ThemeIcon;
            expect(icon.color).toBeInstanceOf(vscode.ThemeColor);
            expect((icon.color as vscode.ThemeColor).id).toBe('testing.iconFailed');
        });
    });
});

describe('ReplicaNode', () => {
    let iconService: IconService;
    let cache: DataCache;

    beforeEach(() => {
        iconService = new IconService();
        cache = new DataCache();
    });

    describe('command itemId contract', () => {
        it('should pass bare replicaId as itemId in command arguments', () => {
            const replicaId = '134150376632578978';
            const replica = sampleReplica({ replicaId });
            const ctx = createTestContextWithData({});
            const node = new ReplicaNode(ctx, iconService, cache, replica, 'partition-1', 'MyService', 'MyApp');

            const item = node.getTreeItem();

            expectCommandItemId(item, replicaId);
        });

        it('should NOT include composite id format in itemId', () => {
            const replicaId = '999888777666';
            const replica = sampleReplica({ replicaId });
            const ctx = createTestContextWithData({});
            const node = new ReplicaNode(ctx, iconService, cache, replica, 'partition-1', 'MyService', 'MyApp');

            const item = node.getTreeItem();
            const args = item.command!.arguments![0];

            expect(args.itemId).toBe(replicaId);
            expect(args.itemId).not.toContain('replica:');
        });
    });

    describe('fetchChildren() context contract', () => {
        it('should create children with parentReplicaId in context', async () => {
            const replicaId = '134150376632578978';
            const replica = sampleReplica({ replicaId });
            const ctx = createTestContextWithData({});
            const node = new ReplicaNode(ctx, iconService, cache, replica, 'partition-1', 'MyService', 'MyApp');

            const children = await node.getChildren();
            expect(children).toBeDefined();
            expect(children!.length).toBeGreaterThan(0);

            // Check that children's commands pass the replicaId
            for (const child of children!) {
                const childItem = child.getTreeItem();
                if (childItem.command) {
                    const args = childItem.command.arguments?.[0];
                    expect(args.replicaId).toBe(replicaId);
                }
            }
        });
    });

    describe('icon color contract', () => {
        it('should show colored icon based on health state', () => {
            const replica = sampleReplica({ healthState: 'Warning' });
            const ctx = createTestContextWithData({});
            const node = new ReplicaNode(ctx, iconService, cache, replica, 'partition-1', 'MyService', 'MyApp');

            const item = node.getTreeItem();
            const icon = item.iconPath as vscode.ThemeIcon;
            expect(icon.color).toBeInstanceOf(vscode.ThemeColor);
            expect((icon.color as vscode.ThemeColor).id).toBe('testing.iconQueued');
        });
    });

    describe('label contract', () => {
        it('should include role in label for stateful replicas', () => {
            const replica = sampleReplica({ replicaRole: 'Primary' });
            const ctx = createTestContextWithData({});
            const node = new ReplicaNode(ctx, iconService, cache, replica, 'partition-1', 'MyService', 'MyApp');

            const item = node.getTreeItem();
            expect(typeof item.label === 'string' ? item.label : '').toContain('Primary');
        });
    });
});

describe('PartitionsGroupNode fetchChildren', () => {
    let iconService: IconService;
    let cache: DataCache;

    beforeEach(() => {
        iconService = new IconService();
        cache = new DataCache();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should call requestRefresh after fetchChildren completes', async () => {
        const partitions = [samplePartition()];
        const requestRefresh = jest.fn();
        const ctx = createTestContextWithData({ partitions }, {}, { requestRefresh });
        const node = new PartitionsGroupNode(ctx, iconService, cache, 'MyService', 'MyApp');

        await node.getChildren();

        // requestRefresh is called via setTimeout(0)
        jest.runAllTimers();

        expect(requestRefresh).toHaveBeenCalledWith(node);
    });
});

describe('ReplicasGroupNode fetchChildren', () => {
    let iconService: IconService;
    let cache: DataCache;

    beforeEach(() => {
        iconService = new IconService();
        cache = new DataCache();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should call requestRefresh after fetchChildren completes', async () => {
        const replicas = [sampleReplica()];
        const requestRefresh = jest.fn();
        const ctx = createTestContextWithData({ replicas }, {}, { requestRefresh });
        const node = new ReplicasGroupNode(ctx, iconService, cache, 'part-1', 'MyService', 'MyApp');

        await node.getChildren();

        jest.runAllTimers();

        expect(requestRefresh).toHaveBeenCalledWith(node);
    });
});
