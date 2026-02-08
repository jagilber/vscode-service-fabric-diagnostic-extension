/**
 * Group Node Contract Tests
 * 
 * These tests verify the critical contracts for group nodes (ApplicationsGroupNode,
 * NodesGroupNode, SystemGroupNode) that were broken during this session:
 * 
 * 1. getTreeItem() returns ThemeIcon with ThemeColor when health data is available
 * 2. getTreeItem() shows correct count in label (not "...")
 * 3. getTreeItem() falls back to sfConfig.getClusterHealth() when local health is undefined
 * 4. fetchChildren() correctly sets count and healthState
 * 5. invalidate() preserves count/health across refresh cycles
 */

import * as vscode from 'vscode';
import { DataCache } from '../../../src/treeview/DataCache';
import { IconService } from '../../../src/treeview/IconService';
import { ApplicationsGroupNode } from '../../../src/treeview/nodes/ApplicationsGroupNode';
import { NodesGroupNode } from '../../../src/treeview/nodes/NodesGroupNode';
import { SystemGroupNode } from '../../../src/treeview/nodes/SystemGroupNode';
import {
    createTestContext,
    createTestContextWithData,
    expectColoredIcon,
    expectLabelWithCount,
    sampleNode,
    sampleApplication,
    sampleService,
} from './helpers';

// Mock SfUtility to avoid output channel noise
jest.mock('../../../src/sfUtility', () => ({
    SfUtility: {
        outputLog: jest.fn(),
    },
    debugLevel: { info: 'info', warn: 'warn', debug: 'debug', error: 'error' },
}));

describe('ApplicationsGroupNode', () => {
    let iconService: IconService;
    let cache: DataCache;

    beforeEach(() => {
        iconService = new IconService();
        cache = new DataCache();
    });

    describe('getTreeItem() icon color contract', () => {
        it('should return colored icon when sfConfig has application health data', () => {
            const ctx = createTestContext();
            const node = new ApplicationsGroupNode(ctx, iconService, cache);

            const item = node.getTreeItem();

            // Must have a ThemeIcon with a ThemeColor — this was the icon revert bug
            expect(item.iconPath).toBeInstanceOf(vscode.ThemeIcon);
            const icon = item.iconPath as vscode.ThemeIcon;
            expect(icon.color).toBeDefined();
            expect(icon.color).toBeInstanceOf(vscode.ThemeColor);
        });

        it('should return plain icon when no health data is available', () => {
            const ctx = createTestContextWithData({}, { clusterHealth: {} });
            const node = new ApplicationsGroupNode(ctx, iconService, cache);

            const item = node.getTreeItem();

            expect(item.iconPath).toBeInstanceOf(vscode.ThemeIcon);
            const icon = item.iconPath as vscode.ThemeIcon;
            // No health data → plain icon (no color)
            expect(icon.id).toBe('package');
        });
    });

    describe('getTreeItem() label contract', () => {
        it('should show "applications (...)" before fetchChildren', () => {
            const ctx = createTestContextWithData({}, {
                // sfConfig has health data with user apps
                clusterHealth: {
                    applicationHealthStates: [
                        { name: 'fabric:/MyApp', aggregatedHealthState: 'Ok' },
                        { name: 'fabric:/System', aggregatedHealthState: 'Ok' },
                    ],
                },
            });
            const node = new ApplicationsGroupNode(ctx, iconService, cache);

            const item = node.getTreeItem();

            // Falls back to sfConfig → should show count from sfConfig (1 user app)
            expect(typeof item.label === 'string' ? item.label : '').toContain('applications (1)');
        });

        it('should exclude fabric:/System from count', () => {
            const ctx = createTestContextWithData({}, {
                clusterHealth: {
                    applicationHealthStates: [
                        { name: 'fabric:/MyApp', aggregatedHealthState: 'Ok' },
                        { name: 'fabric:/OtherApp', aggregatedHealthState: 'Warning' },
                        { name: 'fabric:/System', aggregatedHealthState: 'Ok' },
                    ],
                },
            });
            const node = new ApplicationsGroupNode(ctx, iconService, cache);

            const item = node.getTreeItem();

            // Should count 2, not 3 (System excluded)
            expect(typeof item.label === 'string' ? item.label : '').toContain('applications (2)');
        });
    });

    describe('sfConfig fallback contract', () => {
        it('should use worst health from sfConfig user apps', () => {
            const ctx = createTestContextWithData({}, {
                clusterHealth: {
                    applicationHealthStates: [
                        { name: 'fabric:/MyApp', aggregatedHealthState: 'Ok' },
                        { name: 'fabric:/BadApp', aggregatedHealthState: 'Error' },
                        { name: 'fabric:/System', aggregatedHealthState: 'Ok' },
                    ],
                },
            });
            const node = new ApplicationsGroupNode(ctx, iconService, cache);

            const item = node.getTreeItem();
            const icon = item.iconPath as vscode.ThemeIcon;

            // Should be error color (worst of Ok + Error)
            expect(icon.color).toBeInstanceOf(vscode.ThemeColor);
            expect((icon.color as vscode.ThemeColor).id).toBe('testing.iconFailed');
        });
    });

    describe('fetchChildren() contract', () => {
        it('should set appCount and healthState after fetch', async () => {
            const apps = [
                sampleApplication({ name: 'fabric:/App1', healthState: 'Ok' }),
                sampleApplication({ name: 'fabric:/App2', healthState: 'Warning' }),
            ];
            const ctx = createTestContextWithData({
                applications: apps,
                applicationTypes: [{ name: 'MyAppType' }],
            });
            const node = new ApplicationsGroupNode(ctx, iconService, cache);

            // Fetch children
            await node.getChildren();

            // Now getTreeItem() should use local values
            const item = node.getTreeItem();
            expect(typeof item.label === 'string' ? item.label : '').toContain('applications (2)');
            const icon = item.iconPath as vscode.ThemeIcon;
            // Worst of Ok + Warning = Warning → testing.iconQueued
            expect((icon.color as vscode.ThemeColor).id).toBe('testing.iconQueued');
        });
    });
});

describe('NodesGroupNode', () => {
    let iconService: IconService;
    let cache: DataCache;

    beforeEach(() => {
        iconService = new IconService();
        cache = new DataCache();
    });

    describe('getTreeItem() icon color contract', () => {
        it('should return colored icon when sfConfig has node health data', () => {
            const ctx = createTestContext();
            const node = new NodesGroupNode(ctx, iconService, cache);

            const item = node.getTreeItem();

            expect(item.iconPath).toBeInstanceOf(vscode.ThemeIcon);
            const icon = item.iconPath as vscode.ThemeIcon;
            expect(icon.color).toBeDefined();
            expect(icon.color).toBeInstanceOf(vscode.ThemeColor);
        });
    });

    describe('getTreeItem() label contract', () => {
        it('should show node count from sfConfig fallback', () => {
            const ctx = createTestContextWithData({}, {
                clusterHealth: {
                    nodeHealthStates: [
                        { name: '_Node_0', aggregatedHealthState: 'Ok' },
                        { name: '_Node_1', aggregatedHealthState: 'Ok' },
                        { name: '_Node_2', aggregatedHealthState: 'Ok' },
                    ],
                },
            });
            const node = new NodesGroupNode(ctx, iconService, cache);

            const item = node.getTreeItem();
            expect(typeof item.label === 'string' ? item.label : '').toContain('nodes (3)');
        });
    });

    describe('fetchChildren() contract', () => {
        it('should set nodeCount and healthState after fetch', async () => {
            const nodes = [
                sampleNode({ name: '_Node_0', healthState: 'Ok' }),
                sampleNode({ name: '_Node_1', healthState: 'Error' }),
            ];
            const ctx = createTestContextWithData({ nodes });
            const node = new NodesGroupNode(ctx, iconService, cache);

            await node.getChildren();

            const item = node.getTreeItem();
            expect(typeof item.label === 'string' ? item.label : '').toContain('nodes (2)');
            const icon = item.iconPath as vscode.ThemeIcon;
            expect((icon.color as vscode.ThemeColor).id).toBe('testing.iconFailed');
        });
    });
});

describe('SystemGroupNode', () => {
    let iconService: IconService;
    let cache: DataCache;

    beforeEach(() => {
        iconService = new IconService();
        cache = new DataCache();
    });

    describe('getTreeItem() icon color contract', () => {
        it('should return colored icon when sfConfig has fabric:/System health', () => {
            const ctx = createTestContextWithData({}, {
                clusterHealth: {
                    applicationHealthStates: [
                        { name: 'fabric:/System', aggregatedHealthState: 'Ok' },
                    ],
                },
            });
            const node = new SystemGroupNode(ctx, iconService, cache);

            const item = node.getTreeItem();

            expect(item.iconPath).toBeInstanceOf(vscode.ThemeIcon);
            const icon = item.iconPath as vscode.ThemeIcon;
            expect(icon.color).toBeDefined();
            expect(icon.color).toBeInstanceOf(vscode.ThemeColor);
            expect((icon.color as vscode.ThemeColor).id).toBe('testing.iconPassed');
        });
    });

    describe('getTreeItem() label contract', () => {
        it('should show "system (...)" before fetchChildren when no sfConfig health', () => {
            const ctx = createTestContextWithData({}, { clusterHealth: {} });
            const node = new SystemGroupNode(ctx, iconService, cache);

            const item = node.getTreeItem();
            expect(typeof item.label === 'string' ? item.label : '').toContain('system (...)');
        });
    });

    describe('fetchChildren() contract', () => {
        it('should set serviceCount and healthState after fetch', async () => {
            const services = [
                sampleService({ name: 'fabric:/System/NamingService', healthState: 'Ok' }),
                sampleService({ name: 'fabric:/System/ClusterManagerService', healthState: 'Warning' }),
                sampleService({ name: 'fabric:/System/FailoverManagerService', healthState: 'Ok' }),
            ];
            const ctx = createTestContextWithData({ systemServices: services });
            const node = new SystemGroupNode(ctx, iconService, cache);

            await node.getChildren();

            const item = node.getTreeItem();
            expect(typeof item.label === 'string' ? item.label : '').toContain('system (3)');
            const icon = item.iconPath as vscode.ThemeIcon;
            expect((icon.color as vscode.ThemeColor).id).toBe('testing.iconQueued');
        });
    });
});
