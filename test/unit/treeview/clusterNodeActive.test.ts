/**
 * ClusterNode Active Indicator Tests
 *
 * Verifies:
 * 1. Active cluster uses ClusterDecorationProvider.buildUri() for resourceUri (sf-cluster:// scheme)
 * 2. Active cluster shows "Active" in description
 * 3. Inactive cluster has no description
 * 4. Label is plain hostname string (no TreeItemLabel highlights — decoration handles styling)
 * 5. setActive() toggles the active state
 * 6. TreeItem has correct contextValue, command, and collapsible state
 */

import * as vscode from 'vscode';
import { DataCache } from '../../../src/treeview/DataCache';
import { IconService } from '../../../src/treeview/IconService';
import { ClusterNode } from '../../../src/treeview/nodes/ClusterNode';
import { ClusterDecorationProvider } from '../../../src/treeview/ClusterDecorationProvider';
import { createTestContext, createTestContextWithData } from './helpers';

jest.mock('../../../src/sfUtility', () => ({
    SfUtility: {
        outputLog: jest.fn(),
    },
    debugLevel: { info: 'info', warn: 'warn', debug: 'debug', error: 'error' },
}));

describe('ClusterNode active indicator', () => {
    let iconService: IconService;
    let cache: DataCache;

    beforeEach(() => {
        iconService = new IconService();
        cache = new DataCache();
    });

    describe('getTreeItem() label', () => {
        it('should use plain hostname string as label', () => {
            const ctx = createTestContext();
            const node = new ClusterNode(ctx, iconService, cache);

            const item = node.getTreeItem();

            // Label should be a plain string, not a TreeItemLabel with highlights
            expect(item.label).toBe('test-cluster');
        });

        it('should use plain hostname even when active (no highlights)', () => {
            const ctx = createTestContext();
            const node = new ClusterNode(ctx, iconService, cache);
            node.setActive(true);

            const item = node.getTreeItem();

            // Label is still a plain string — decoration provider handles coloring
            expect(item.label).toBe('test-cluster');
        });
    });

    describe('getTreeItem() description', () => {
        it('should show "Active" when active', () => {
            const ctx = createTestContext();
            const node = new ClusterNode(ctx, iconService, cache);
            node.setActive(true);

            const item = node.getTreeItem();
            expect(item.description).toBe('Active');
        });

        it('should have no description when inactive', () => {
            const ctx = createTestContext();
            const node = new ClusterNode(ctx, iconService, cache);
            node.setActive(false);

            const item = node.getTreeItem();
            expect(item.description).toBeUndefined();
        });

        it('should toggle description on setActive changes', () => {
            const ctx = createTestContext();
            const node = new ClusterNode(ctx, iconService, cache);

            node.setActive(true);
            expect(node.getTreeItem().description).toBe('Active');

            node.setActive(false);
            expect(node.getTreeItem().description).toBeUndefined();

            node.setActive(true);
            expect(node.getTreeItem().description).toBe('Active');
        });
    });

    describe('getTreeItem() resourceUri', () => {
        it('should use sf-cluster:// scheme for decoration', () => {
            const ctx = createTestContext();
            const node = new ClusterNode(ctx, iconService, cache);

            const item = node.getTreeItem();

            expect(item.resourceUri).toBeDefined();
            expect(item.resourceUri!.scheme).toBe('sf-cluster');
        });

        it('should match ClusterDecorationProvider.buildUri()', () => {
            const endpoint = 'https://test-cluster:19080';
            const ctx = createTestContext({ clusterEndpoint: endpoint });
            const node = new ClusterNode(ctx, iconService, cache);

            const item = node.getTreeItem();
            const expectedUri = ClusterDecorationProvider.buildUri(endpoint);

            expect(item.resourceUri!.toString()).toBe(expectedUri.toString());
        });

        it('should differ between clusters', () => {
            const ctx1 = createTestContextWithData({}, { clusterEndpoint: 'https://cluster-a:19080' });
            const ctx2 = createTestContextWithData({}, { clusterEndpoint: 'https://cluster-b:19080' });

            const node1 = new ClusterNode(ctx1, iconService, cache);
            const node2 = new ClusterNode(ctx2, iconService, cache);

            expect(node1.getTreeItem().resourceUri!.toString())
                .not.toBe(node2.getTreeItem().resourceUri!.toString());
        });
    });

    describe('getTreeItem() basics', () => {
        it('should be expanded by default', () => {
            const ctx = createTestContext();
            const node = new ClusterNode(ctx, iconService, cache);

            const item = node.getTreeItem();
            expect(item.collapsibleState).toBe(vscode.TreeItemCollapsibleState.Expanded);
        });

        it('should have contextValue "cluster"', () => {
            const ctx = createTestContext();
            const node = new ClusterNode(ctx, iconService, cache);

            const item = node.getTreeItem();
            expect(item.contextValue).toBe('cluster');
        });

        it('should have showItemDetails command', () => {
            const ctx = createTestContext();
            const node = new ClusterNode(ctx, iconService, cache);

            const item = node.getTreeItem();
            expect(item.command).toBeDefined();
            expect(item.command!.command).toBe('sfClusterExplorer.showItemDetails');
        });

        it('should have cloud icon', () => {
            const ctx = createTestContext();
            const node = new ClusterNode(ctx, iconService, cache);

            const item = node.getTreeItem();
            expect(item.iconPath).toBeDefined();
            expect(item.iconPath).toBeInstanceOf(vscode.ThemeIcon);
            expect((item.iconPath as vscode.ThemeIcon).id).toBe('cloud');
        });

        it('should have health-colored icon when health is available', () => {
            const ctx = createTestContextWithData({}, {
                clusterHealth: { aggregatedHealthState: 'Ok' },
            });
            const node = new ClusterNode(ctx, iconService, cache);

            const item = node.getTreeItem();
            const icon = item.iconPath as vscode.ThemeIcon;
            expect(icon.color).toBeDefined();
            expect(icon.color).toBeInstanceOf(vscode.ThemeColor);
        });
    });
});
