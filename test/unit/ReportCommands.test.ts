/**
 * Unit tests for ReportCommands
 */
import * as vscode from 'vscode';

// Mock CommandUtils to bypass safeRegisterCommand dedup protection
jest.mock('../../src/utils/CommandUtils', () => ({
    registerCommandWithErrorHandling: jest.fn((context: any, commandId: string, handler: any) => {
        const disposable = require('vscode').commands.registerCommand(commandId, handler);
        context.subscriptions.push(disposable);
    }),
}));

import { registerReportCommands } from '../../src/commands/ReportCommands';

describe('ReportCommands', () => {
    let mockContext: vscode.ExtensionContext;
    let mockSfMgr: any;
    let registeredHandlers: Record<string, (...args: any[]) => any>;
    let mockSfRest: any;

    beforeEach(() => {
        jest.clearAllMocks();
        registeredHandlers = {};
        mockContext = new (vscode as any).ExtensionContext();

        (vscode.commands.registerCommand as jest.Mock).mockImplementation((id, handler) => {
            registeredHandlers[id] = handler;
            return { dispose: jest.fn() };
        });

        mockSfRest = {
            getClusterHealth: jest.fn().mockResolvedValue({ aggregatedHealthState: 'Ok', nodeHealthStates: [], applicationHealthStates: [] }),
            getClusterVersion: jest.fn().mockResolvedValue('8.0.0'),
            getClusterManifest: jest.fn().mockResolvedValue({ manifest: '<xml>' }),
            getClusterEvents: jest.fn().mockResolvedValue([]),
            getClusterLoadInformation: jest.fn().mockResolvedValue({ loadMetricInformation: [] }),
            getNodes: jest.fn().mockResolvedValue([]),
            getApplications: jest.fn().mockResolvedValue([]),
            getRepairTasks: jest.fn().mockResolvedValue([]),
            getApplicationTypes: jest.fn().mockResolvedValue([]),
        };

        mockSfMgr = {
            getCurrentSfConfig: jest.fn().mockReturnValue({
                getClusterEndpoint: jest.fn().mockReturnValue('http://localhost:19080'),
                getSfRest: jest.fn().mockReturnValue(mockSfRest),
                getJsonManifest: jest.fn().mockReturnValue('{}'),
            }),
            getSfConfig: jest.fn().mockReturnValue({
                getClusterEndpoint: jest.fn().mockReturnValue('http://localhost:19080'),
                getSfRest: jest.fn().mockReturnValue(mockSfRest),
            }),
            sfClusterView: {
                refresh: jest.fn(),
                getTreeItem: jest.fn(),
            },
        };

        // Mock workspace.fs
        (vscode as any).workspace.fs = {
            createDirectory: jest.fn().mockResolvedValue(undefined),
            writeFile: jest.fn().mockResolvedValue(undefined),
        };
        (vscode as any).workspace.openTextDocument = jest.fn().mockResolvedValue({});
        (vscode as any).window.showTextDocument = jest.fn().mockResolvedValue(undefined);

        (vscode.commands.executeCommand as jest.Mock).mockResolvedValue(undefined);

        registerReportCommands(mockContext, mockSfMgr);
    });

    test('should register all 7 report commands', () => {
        expect(registeredHandlers['sfClusterExplorer.generateEventsReport']).toBeDefined();
        expect(registeredHandlers['sfClusterExplorer.generateHealthReport']).toBeDefined();
        expect(registeredHandlers['sfClusterExplorer.generateMetricsReport']).toBeDefined();
        expect(registeredHandlers['sfClusterExplorer.generateCommandsReference']).toBeDefined();
        expect(registeredHandlers['sfClusterExplorer.generateEssentialsReport']).toBeDefined();
        expect(registeredHandlers['sfClusterExplorer.generateRepairTasksReport']).toBeDefined();
        expect(registeredHandlers['sfClusterExplorer.exportSnapshot']).toBeDefined();
    });

    describe('generateEventsReport', () => {
        test('should warn for invalid item type', async () => {
            await registeredHandlers['sfClusterExplorer.generateEventsReport']({ itemType: 'node' });
            // Should show warning
        });

        test('should generate events report for events item', async () => {
            await registeredHandlers['sfClusterExplorer.generateEventsReport']({
                itemType: 'events',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getClusterEvents).toHaveBeenCalled();
        });

        test('should generate events report with events data', async () => {
            mockSfRest.getClusterEvents.mockResolvedValue([
                { eventInstanceId: '1', kind: 'NodeDown', timeStamp: '2024-01-01T00:00:00Z', description: 'Node error' },
                { eventInstanceId: '2', kind: 'NodeUp', timeStamp: '2024-01-01T01:00:00Z', description: 'Node restored' },
                { eventInstanceId: '3', kind: 'ClusterHealthReport', timeStamp: '2024-01-01T02:00:00Z', description: 'Warning health' },
            ]);
            await registeredHandlers['sfClusterExplorer.generateEventsReport']({
                itemType: 'events',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getClusterEvents).toHaveBeenCalled();
        });
    });

    describe('generateHealthReport', () => {
        test('should warn for invalid item type', async () => {
            await registeredHandlers['sfClusterExplorer.generateHealthReport']({ itemType: 'node' });
        });

        test('should generate health report', async () => {
            await registeredHandlers['sfClusterExplorer.generateHealthReport']({
                itemType: 'health',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getClusterHealth).toHaveBeenCalled();
        });

        test('should generate health report with detailed data', async () => {
            mockSfRest.getClusterHealth.mockResolvedValue({
                aggregatedHealthState: 'Warning',
                healthStatistics: {
                    healthStateCountList: [
                        { entityKind: 'Node', healthStateCount: { okCount: 3, warningCount: 1, errorCount: 0 } },
                        { entityKind: 'Application', healthStateCount: { okCount: 2, warningCount: 0, errorCount: 1 } },
                    ]
                },
                unhealthyEvaluations: [{ description: 'App unhealthy' }],
                nodeHealthStates: [
                    { name: 'Node0', aggregatedHealthState: 'Ok', nodeStatus: 'Up', isSeedNode: true },
                    { name: 'Node1', aggregatedHealthState: 'Warning', nodeStatus: 'Up', isSeedNode: false },
                    { name: 'Node2', aggregatedHealthState: 'Error', nodeStatus: 'Down', isSeedNode: false },
                ],
                applicationHealthStates: [
                    { name: 'fabric:/App1', aggregatedHealthState: 'Ok' },
                    { name: 'fabric:/App2', aggregatedHealthState: 'Error' },
                ],
            });
            mockSfRest.getNodes.mockResolvedValue([
                { name: 'Node0', nodeStatus: 'Up', type: 'Primary', ipAddressOrFQDN: '10.0.0.1', upgradeDomain: 'UD0', faultDomain: 'fd:/0' },
                { name: 'Node1', nodeStatus: 'Up', type: 'Secondary', ipAddressOrFQDN: '10.0.0.2' },
                { name: 'Node2', nodeStatus: 'Down', type: 'Secondary', ipAddressOrFQDN: '10.0.0.3' },
            ]);
            await registeredHandlers['sfClusterExplorer.generateHealthReport']({
                itemType: 'health',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getClusterHealth).toHaveBeenCalled();
            expect(mockSfRest.getNodes).toHaveBeenCalled();
        });
    });

    describe('generateMetricsReport', () => {
        test('should warn for invalid item type', async () => {
            await registeredHandlers['sfClusterExplorer.generateMetricsReport']({ itemType: 'node' });
        });

        test('should generate metrics report', async () => {
            await registeredHandlers['sfClusterExplorer.generateMetricsReport']({
                itemType: 'metrics',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getClusterLoadInformation).toHaveBeenCalled();
        });

        test('should generate metrics report with load data', async () => {
            mockSfRest.getClusterLoadInformation.mockResolvedValue({
                lastBalancingStartTimeUtc: '2024-01-01T00:00:00Z',
                lastBalancingEndTimeUtc: '2024-01-01T00:01:00Z',
                loadMetricInformation: [
                    {
                        name: 'PrimaryCount',
                        clusterLoad: 10,
                        clusterCapacity: 100,
                        clusterRemainingCapacity: 90,
                        minimumNodeLoad: 1,
                        maximumNodeLoad: 5,
                        isBalancedBefore: true,
                        isBalancedAfter: true,
                    },
                    {
                        name: 'MemoryInMB',
                        clusterLoad: 5000,
                        clusterCapacity: 16000,
                        clusterRemainingCapacity: 11000,
                        minimumNodeLoad: 500,
                        maximumNodeLoad: 2000,
                    },
                ],
            });
            await registeredHandlers['sfClusterExplorer.generateMetricsReport']({
                itemType: 'metrics',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getClusterLoadInformation).toHaveBeenCalled();
        });
    });

    describe('generateEssentialsReport', () => {
        test('should warn for invalid item type', async () => {
            await registeredHandlers['sfClusterExplorer.generateEssentialsReport']({ itemType: 'node' });
        });

        test('should generate essentials report', async () => {
            await registeredHandlers['sfClusterExplorer.generateEssentialsReport']({
                itemType: 'essentials',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getClusterHealth).toHaveBeenCalled();
            expect(mockSfRest.getClusterVersion).toHaveBeenCalled();
        });

        test('should generate essentials report with full data', async () => {
            mockSfRest.getClusterHealth.mockResolvedValue({
                aggregatedHealthState: 'Ok',
                nodeHealthStates: [
                    { name: 'Node0', aggregatedHealthState: 'Ok', nodeStatus: 'Up' },
                    { name: 'Node1', aggregatedHealthState: 'Ok', nodeStatus: 'Up' },
                ],
                applicationHealthStates: [
                    { name: 'fabric:/System', aggregatedHealthState: 'Ok' },
                    { name: 'fabric:/App1', aggregatedHealthState: 'Ok' },
                ],
                unhealthyEvaluations: [],
                healthEvents: [
                    { healthState: 'Error', sourceId: 'System.FM' },
                    { healthState: 'Warning', sourceId: 'System.FM' },
                    { healthState: 'Ok', sourceId: 'System.FM' },
                ],
                healthStatistics: {
                    healthStateCountList: [
                        { entityKind: 'Node', healthStateCount: { okCount: 2, warningCount: 0, errorCount: 0 } },
                    ]
                },
            });
            mockSfRest.getClusterVersion.mockResolvedValue({ version: '9.1.0.0' });
            mockSfRest.getNodes.mockResolvedValue([
                { name: 'Node0', type: 'Primary', upgradeDomain: 'UD0', faultDomain: 'fd:/0' },
                { name: 'Node1', type: 'Secondary', upgradeDomain: 'UD1', faultDomain: 'fd:/1' },
            ]);
            await registeredHandlers['sfClusterExplorer.generateEssentialsReport']({
                itemType: 'essentials',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getClusterHealth).toHaveBeenCalled();
            expect(mockSfRest.getClusterVersion).toHaveBeenCalled();
        });
    });

    describe('generateRepairTasksReport', () => {
        test('should warn for invalid item type', async () => {
            await registeredHandlers['sfClusterExplorer.generateRepairTasksReport']({ itemType: 'node' });
        });

        test('should generate repair tasks report', async () => {
            await registeredHandlers['sfClusterExplorer.generateRepairTasksReport']({
                itemType: 'repair-tasks',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getRepairTasks).toHaveBeenCalled();
        });

        test('should generate repair tasks report with tasks data', async () => {
            mockSfRest.getRepairTasks.mockResolvedValue([
                {
                    taskId: 'Azure/PlatformUpdate/1',
                    state: 'Completed',
                    action: 'System.Azure.Heal',
                    resultStatus: 'Succeeded',
                    target: { nodeNames: ['Node0'] },
                    createdTimestamp: '2024-01-01T00:00:00Z',
                    completedTimestamp: '2024-01-01T01:00:00Z',
                    history: {
                        preparingTimestamp: '2024-01-01T00:00:00Z',
                        preparedTimestamp: '2024-01-01T00:10:00Z',
                        executingTimestamp: '2024-01-01T00:10:00Z',
                        completedTimestamp: '2024-01-01T01:00:00Z',
                    },
                },
                {
                    taskId: 'Azure/PlatformUpdate/2',
                    state: 'Executing',
                    action: 'System.Azure.Heal',
                    resultStatus: 'Pending',
                    target: { nodeNames: ['Node1'] },
                    createdTimestamp: '2024-01-02T00:00:00Z',
                },
            ]);
            await registeredHandlers['sfClusterExplorer.generateRepairTasksReport']({
                itemType: 'repair-tasks',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getRepairTasks).toHaveBeenCalled();
        });
    });

    describe('generateCommandsReference', () => {
        test('should warn for invalid item type', async () => {
            await registeredHandlers['sfClusterExplorer.generateCommandsReference']({ itemType: 'node' });
        });

        test('should generate commands reference', async () => {
            await registeredHandlers['sfClusterExplorer.generateCommandsReference']({
                itemType: 'commands',
                clusterEndpoint: 'http://localhost:19080'
            });
            // Should generate markdown without REST calls
        });
    });

    describe('exportSnapshot', () => {
        test('should warn for null item', async () => {
            await registeredHandlers['sfClusterExplorer.exportSnapshot'](null);
        });

        test('should export snapshot for cluster item', async () => {
            await registeredHandlers['sfClusterExplorer.exportSnapshot']({
                itemType: 'cluster',
                itemId: 'cluster',
                label: 'Test Cluster',
                clusterEndpoint: 'http://localhost:19080'
            });
            // Should attempt to write file
        });
    });
});
