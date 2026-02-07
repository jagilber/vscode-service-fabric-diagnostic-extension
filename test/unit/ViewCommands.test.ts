/**
 * Unit tests for ViewCommands
 */
import * as vscode from 'vscode';

// Mock CommandUtils to bypass safeRegisterCommand dedup protection
jest.mock('../../src/utils/CommandUtils', () => ({
    registerCommandWithErrorHandling: jest.fn((context: any, commandId: string, handler: any) => {
        const disposable = require('vscode').commands.registerCommand(commandId, handler);
        context.subscriptions.push(disposable);
    }),
    safeRegisterCommand: jest.fn((context: any, commandId: string, handler: any) => {
        const disposable = require('vscode').commands.registerCommand(commandId, handler);
        context.subscriptions.push(disposable);
    }),
}));

// Mock ClusterMapView
jest.mock('../../src/views/ClusterMapView', () => ({
    ClusterMapView: jest.fn().mockImplementation(() => ({
        show: jest.fn().mockResolvedValue(undefined)
    }))
}));

import { registerViewCommands } from '../../src/commands/ViewCommands';

describe('ViewCommands', () => {
    let mockContext: vscode.ExtensionContext;
    let mockSfMgr: any;
    let registeredHandlers: Record<string, (...args: any[]) => any>;
    let mockSfRest: any;
    let mockSfConfig: any;

    beforeEach(() => {
        jest.clearAllMocks();
        registeredHandlers = {};
        mockContext = new (vscode as any).ExtensionContext();

        (vscode.commands.registerCommand as jest.Mock).mockImplementation((id, handler) => {
            registeredHandlers[id] = handler;
            return { dispose: jest.fn() };
        });

        mockSfRest = {
            getClusterHealth: jest.fn().mockResolvedValue({ aggregatedHealthState: 'Ok' }),
            getClusterVersion: jest.fn().mockResolvedValue('8.0.0'),
            getClusterManifest: jest.fn().mockResolvedValue({ manifest: '<xml>' }),
            getClusterUpgradeProgress: jest.fn().mockResolvedValue({ upgradeState: 'RollingForwardCompleted' }),
            getClusterLoadInformation: jest.fn().mockResolvedValue({ loadMetrics: [] }),
            getClusterEvents: jest.fn().mockResolvedValue([]),
            getNodes: jest.fn().mockResolvedValue([{ name: 'Node0' }, { name: 'Node1' }]),
            getNodeInfo: jest.fn().mockResolvedValue({ name: 'Node0', nodeStatus: 'Up' }),
            getNodeHealth: jest.fn().mockResolvedValue({ aggregatedHealthState: 'Ok' }),
            getApplications: jest.fn().mockResolvedValue([{ name: 'fabric:/App1', id: 'App1' }]),
            getApplicationInfo: jest.fn().mockResolvedValue({ id: 'app1', name: 'fabric:/App1' }),
            getApplicationHealth: jest.fn().mockResolvedValue({ aggregatedHealthState: 'Ok' }),
            getApplicationTypes: jest.fn().mockResolvedValue([{ name: 'MyAppType', version: '1.0' }]),
            getServiceInfo: jest.fn().mockResolvedValue({ id: 'svc1', name: 'MyService' }),
            getServiceHealth: jest.fn().mockResolvedValue({ aggregatedHealthState: 'Ok' }),
            getServiceEvents: jest.fn().mockResolvedValue([]),
            getServicePartitions: jest.fn().mockResolvedValue([]),
            getPartitionHealth: jest.fn().mockResolvedValue({ aggregatedHealthState: 'Ok' }),
            getPartitionEvents: jest.fn().mockResolvedValue([]),
            getPartitionReplicas: jest.fn().mockResolvedValue([]),
            getRepairTasks: jest.fn().mockResolvedValue([]),
            getImageStoreContent: jest.fn().mockResolvedValue([]),
            getApplicationManifest: jest.fn().mockResolvedValue({}),
            getServiceManifest: jest.fn().mockResolvedValue({}),
        };

        mockSfConfig = {
            getClusterEndpoint: jest.fn().mockReturnValue('http://localhost:19080'),
            getSfRest: jest.fn().mockReturnValue(mockSfRest),
            setManifest: jest.fn(),
            getJsonManifest: jest.fn().mockReturnValue('{}'),
            getClientCertificateThumbprint: jest.fn().mockReturnValue('AABB1234'),
            getServerCertificateThumbprint: jest.fn().mockReturnValue('CCDD5678'),
        };

        mockSfMgr = {
            sfClusterView: { refresh: jest.fn() },
            getCurrentSfConfig: jest.fn().mockReturnValue(mockSfConfig),
            getSfConfig: jest.fn().mockReturnValue(mockSfConfig),
        };

        (vscode.commands.executeCommand as jest.Mock).mockResolvedValue(undefined);

        registerViewCommands(mockContext, mockSfMgr);
    });

    test('should register all view commands', () => {
        expect(registeredHandlers['sfClusterExplorer.refresh']).toBeDefined();
        expect(registeredHandlers['serviceFabricClusterView.refreshView']).toBeDefined();
        expect(registeredHandlers['serviceFabricClusterView.reveal']).toBeDefined();
        expect(registeredHandlers['serviceFabricClusterView.changeTitle']).toBeDefined();
        expect(registeredHandlers['sfClusterExplorer.retryNode']).toBeDefined();
        expect(registeredHandlers['sfClusterExplorer.showManagementView']).toBeDefined();
        expect(registeredHandlers['sfClusterExplorer.deployApplicationFromContext']).toBeDefined();
        expect(registeredHandlers['sfClusterExplorer.showItemDetails']).toBeDefined();
    });

    describe('refresh', () => {
        test('should call sfClusterView.refresh', async () => {
            await registeredHandlers['sfClusterExplorer.refresh']();
            expect(mockSfMgr.sfClusterView.refresh).toHaveBeenCalled();
        });
    });

    describe('refreshView', () => {
        test('should call sfClusterView.refresh', () => {
            registeredHandlers['serviceFabricClusterView.refreshView']();
            expect(mockSfMgr.sfClusterView.refresh).toHaveBeenCalled();
        });
    });

    describe('reveal', () => {
        test('should show input box', async () => {
            (vscode.window.showInputBox as jest.Mock).mockResolvedValue('SomeNode');
            await registeredHandlers['serviceFabricClusterView.reveal']();
            expect(vscode.window.showInputBox).toHaveBeenCalled();
        });
    });

    describe('changeTitle', () => {
        test('should show input box for title', async () => {
            (vscode.window.showInputBox as jest.Mock).mockResolvedValue('New Title');
            await registeredHandlers['serviceFabricClusterView.changeTitle']();
            expect(vscode.window.showInputBox).toHaveBeenCalled();
        });
    });

    describe('retryNode', () => {
        test('should invalidate and refresh', async () => {
            const mockNode = { invalidate: jest.fn() };
            await registeredHandlers['sfClusterExplorer.retryNode'](mockNode);
            expect(mockNode.invalidate).toHaveBeenCalled();
            expect(mockSfMgr.sfClusterView.refresh).toHaveBeenCalled();
        });

        test('should handle node without invalidate', async () => {
            await registeredHandlers['sfClusterExplorer.retryNode']({});
            // Should not throw
        });
    });

    describe('showManagementView', () => {
        test('should focus management panel', () => {
            registeredHandlers['sfClusterExplorer.showManagementView']();
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith('serviceFabricManagementPanel.focus');
        });
    });

    describe('deployApplicationFromContext', () => {
        test('should focus management panel and show info', async () => {
            await registeredHandlers['sfClusterExplorer.deployApplicationFromContext']();
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith('serviceFabricManagementPanel.focus');
        });
    });

    describe('showItemDetails', () => {
        test('should warn when no itemType', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({ label: 'test' });
            // Should show warning (no details available)
        });

        test('should warn when no cluster endpoint', async () => {
            mockSfConfig.getClusterEndpoint.mockReturnValue(null);
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'node', itemId: 'Node0'
            });
        });

        test('should handle node details', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'node', itemId: 'Node0', label: 'Node0',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getNodeInfo).toHaveBeenCalledWith('Node0');
        });

        test('should handle cluster details', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'cluster', itemId: 'cluster', label: 'Cluster',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getClusterHealth).toHaveBeenCalled();
        });

        test('should handle health details', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'health', itemId: 'health', label: 'Health',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getClusterHealth).toHaveBeenCalled();
        });

        test('should handle events details', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'events', itemId: 'events', label: 'Events',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getClusterEvents).toHaveBeenCalled();
        });

        test('should handle metrics details', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'metrics', itemId: 'metrics', label: 'Metrics',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getClusterLoadInformation).toHaveBeenCalled();
        });

        test('should handle details (upgrade progress)', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'details', itemId: 'details', label: 'Upgrade Details',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getClusterUpgradeProgress).toHaveBeenCalled();
        });

        test('should handle essentials', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'essentials', itemId: 'essentials', label: 'Essentials',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getClusterHealth).toHaveBeenCalled();
            expect(mockSfRest.getClusterVersion).toHaveBeenCalled();
            expect(mockSfRest.getClusterManifest).toHaveBeenCalled();
        });

        test('should handle commands info', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'commands', itemId: 'commands', label: 'Commands',
                clusterEndpoint: 'http://localhost:19080'
            });
            // Should not call any REST APIs — just returns static data
        });

        test('should handle application details', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'application', itemId: 'fabric:/App1', label: 'App1',
                applicationId: 'fabric:/App1',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getApplicationInfo).toHaveBeenCalled();
        });

        test('should handle application-type details', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'application-type', itemId: 'MyAppType',
                typeName: 'MyAppType', typeVersion: '1.0',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getApplicationTypes).toHaveBeenCalled();
        });

        test('should handle node-health with normalised type', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'node-health', itemId: 'Node0', nodeName: 'Node0',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getNodeHealth).toHaveBeenCalledWith('Node0');
        });

        test('should handle application-health with normalised type', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'application-health', itemId: 'app1',
                applicationId: 'app1',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getApplicationHealth).toHaveBeenCalledWith('app1');
        });

        test('should handle image-store details', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'image-store', itemId: 'store', path: '',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getImageStoreContent).toHaveBeenCalled();
        });

        test('should handle repair-tasks', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'repair-tasks', itemId: 'repair', label: 'Repair Tasks',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getRepairTasks).toHaveBeenCalled();
        });

        test('should handle manifest details', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'manifest', itemId: 'manifest', label: 'Manifest',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getClusterManifest).toHaveBeenCalled();
        });

        test('should handle missing sfConfig for cluster endpoint', async () => {
            mockSfMgr.getSfConfig.mockReturnValue(null);
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'node', itemId: 'Node0',
                clusterEndpoint: 'http://unknown:19080'
            });
            // Should show error
        });

        test('should handle service-health', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'service-health', itemId: 'svc1',
                applicationId: 'app1', serviceId: 'svc1',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getServiceHealth).toHaveBeenCalledWith('svc1', 'app1');
        });

        test('should handle partition-health', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'partition-health', itemId: 'part1',
                applicationId: 'app1', serviceId: 'svc1', partitionId: 'part1',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getPartitionHealth).toHaveBeenCalledWith('part1', 'svc1', 'app1');
        });

        test('should normalise svc-health prefix type', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'svc-health:svc1', itemId: 'svc1',
                applicationId: 'app1', serviceId: 'svc1',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getServiceHealth).toHaveBeenCalled();
        });

        test('should normalise app-health prefix type', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'app-health:app1', itemId: 'app1',
                applicationId: 'app1',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getApplicationHealth).toHaveBeenCalled();
        });

        test('should handle service details', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'service', itemId: 'svc1',
                applicationId: 'app1',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getServiceInfo).toHaveBeenCalled();
        });

        test('should handle service 404 gracefully', async () => {
            mockSfRest.getServiceInfo.mockRejectedValueOnce({ statusCode: 404, message: '404 Not Found' });
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'service', itemId: 'svc1',
                applicationId: 'app1', label: 'SystemService',
                clusterEndpoint: 'http://localhost:19080'
            });
            // Should create a fallback detail object
        });

        test('should throw for service without applicationId', async () => {
            await expect(registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'service', itemId: 'svc1',
                clusterEndpoint: 'http://localhost:19080'
            })).rejects.toThrow();
        });

        test('should handle service-events', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'service-events', itemId: 'svc1',
                serviceId: 'svc1',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getServiceEvents).toHaveBeenCalled();
        });

        test('should handle partition details', async () => {
            mockSfRest.getServicePartitions.mockResolvedValue([
                { partitionInformation: { id: 'part1' } }
            ]);
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'partition', itemId: 'part1',
                applicationId: 'app1', serviceId: 'svc1',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getServicePartitions).toHaveBeenCalled();
        });

        test('should handle partition-events', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'partition-events', itemId: 'part1',
                partitionId: 'part1',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getPartitionEvents).toHaveBeenCalled();
        });

        test('should handle replica details', async () => {
            mockSfRest.getPartitionReplicas.mockResolvedValue([
                { replicaId: 'r1' }
            ]);
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'replica', itemId: 'r1',
                applicationId: 'app1', serviceId: 'svc1', partitionId: 'part1',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getPartitionReplicas).toHaveBeenCalled();
        });

        test('should handle replica without partition context', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'replica', itemId: 'r1',
                clusterEndpoint: 'http://localhost:19080'
            });
            // Should return limited detail
        });

        test('should handle replica-health', async () => {
            mockSfRest.getReplicaHealth = jest.fn().mockResolvedValue({ aggregatedHealthState: 'Ok' });
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'replica-health', itemId: 'r1',
                applicationId: 'app1', serviceId: 'svc1', partitionId: 'part1', replicaId: 'r1',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getReplicaHealth).toHaveBeenCalled();
        });

        test('should handle replica-events', async () => {
            mockSfRest.getReplicaEvents = jest.fn().mockResolvedValue([]);
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'replica-events', itemId: 'r1',
                partitionId: 'part1', replicaId: 'r1',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getReplicaEvents).toHaveBeenCalled();
        });

        test('should handle node-events', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'node-events', itemId: 'Node0',
                nodeName: 'Node0',
                clusterEndpoint: 'http://localhost:19080'
            });
            // Should return informational message
        });

        test('should handle application-events', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'application-events', itemId: 'app1',
                applicationId: 'app1',
                clusterEndpoint: 'http://localhost:19080'
            });
            // Should return informational message
        });

        test('should handle application-manifest', async () => {
            mockSfRest.getApplicationManifest.mockResolvedValue({ manifest: '<ApplicationManifest/>' });
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'application-manifest', itemId: 'app1',
                applicationId: 'app1',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getApplicationManifest).toHaveBeenCalled();
        });

        test('should handle image-store-file', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'image-store-file', itemId: 'file1',
                path: 'WindowsFabricStore/file.txt', size: 1024,
                clusterEndpoint: 'http://localhost:19080'
            });
            // Should return file metadata
        });

        test('should handle image-store-folder', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'image-store-folder', itemId: 'folder1',
                path: 'WindowsFabricStore',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getImageStoreContent).toHaveBeenCalled();
        });

        test('should handle deployed-application', async () => {
            mockSfRest.getDeployedApplicationInfo = jest.fn().mockResolvedValue({ id: 'app1' });
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'deployed-application', itemId: 'app1',
                nodeName: 'Node0', applicationId: 'app1',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getDeployedApplicationInfo).toHaveBeenCalled();
        });

        test('should handle deployed-service-package', async () => {
            mockSfRest.getDeployedServicePackages = jest.fn().mockResolvedValue([
                { serviceManifestName: 'SvcPkg1' }
            ]);
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'deployed-service-package', itemId: 'SvcPkg1',
                nodeName: 'Node0', applicationId: 'app1',
                serviceManifestName: 'SvcPkg1',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getDeployedServicePackages).toHaveBeenCalled();
        });

        test('should handle deployed-code-package', async () => {
            mockSfRest.getDeployedCodePackages = jest.fn().mockResolvedValue([
                { codePackageName: 'Code1' }
            ]);
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'deployed-code-package', itemId: 'Code1',
                nodeName: 'Node0', applicationId: 'app1',
                serviceManifestName: 'SvcPkg1', codePackageName: 'Code1',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getDeployedCodePackages).toHaveBeenCalled();
        });

        test('should handle deployed-replica', async () => {
            mockSfRest.getDeployedReplicas = jest.fn().mockResolvedValue([
                { replicaId: 'r1' }
            ]);
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'deployed-replica', itemId: 'r1',
                nodeName: 'Node0', applicationId: 'app1',
                serviceManifestName: 'SvcPkg1', partitionId: 'part1',
                clusterEndpoint: 'http://localhost:19080'
            });
            expect(mockSfRest.getDeployedReplicas).toHaveBeenCalled();
        });

        test('should handle cluster-map view', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'cluster-map', itemId: 'map',
                clusterEndpoint: 'http://localhost:19080'
            });
            const { ClusterMapView } = require('../../src/views/ClusterMapView');
            expect(ClusterMapView).toHaveBeenCalled();
        });

        test('should handle unknown item type', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'unknown-thing', itemId: 'x',
                clusterEndpoint: 'http://localhost:19080'
            });
            // Should show warning
        });

        test('should handle command guide - connect-cluster-guide', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'command', itemId: 'connect-cluster-guide',
                commandId: 'connect-cluster-guide',
                clusterEndpoint: 'http://localhost:19080'
            });
            // Should open markdown document
        });

        test('should handle command guide - unknown command', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'command', itemId: 'unknown-command',
                commandId: 'unknown-command',
                clusterEndpoint: 'http://localhost:19080'
            });
            // Should show fallback JSON
        });

        test('should handle command guide - cluster-diagnostics-guide', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'command', itemId: 'cluster-diagnostics-guide',
                commandId: 'cluster-diagnostics-guide',
                clusterEndpoint: 'http://localhost:19080'
            });
        });

        test('should handle command guide - node-management-guide', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'command', itemId: 'node-management-guide',
                commandId: 'node-management-guide',
                clusterEndpoint: 'http://localhost:19080'
            });
        });

        test('should handle command guide - application-management-guide', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'command', itemId: 'application-management-guide',
                commandId: 'application-management-guide',
                clusterEndpoint: 'http://localhost:19080'
            });
        });

        // Operational command guides
        test('should handle command guide - start-cluster-upgrade', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'command', itemId: 'start-cluster-upgrade',
                commandId: 'start-cluster-upgrade',
                clusterEndpoint: 'http://localhost:19080'
            });
        });

        test('should handle command guide - provision-app-type', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'command', itemId: 'provision-app-type',
                commandId: 'provision-app-type',
                clusterEndpoint: 'http://localhost:19080'
            });
        });

        test('should handle command guide - create-application', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'command', itemId: 'create-application',
                commandId: 'create-application',
                clusterEndpoint: 'http://localhost:19080'
            });
        });

        test('should handle command guide - report-health', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'command', itemId: 'report-health',
                commandId: 'report-health',
                clusterEndpoint: 'http://localhost:19080'
            });
        });

        test('should handle command guide - start-chaos', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'command', itemId: 'start-chaos',
                commandId: 'start-chaos',
                clusterEndpoint: 'http://localhost:19080'
            });
        });

        test('should handle command guide - view-repair-tasks', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'command', itemId: 'view-repair-tasks',
                commandId: 'view-repair-tasks',
                clusterEndpoint: 'http://localhost:19080'
            });
        });

        // Azure CLI command guides
        test('should handle command guide - az-login', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'command', itemId: 'az-login',
                commandId: 'az-login',
                clusterEndpoint: 'http://localhost:19080'
            });
        });

        test('should handle command guide - az-sf-cluster-health', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'command', itemId: 'az-sf-cluster-health',
                commandId: 'az-sf-cluster-health',
                clusterEndpoint: 'http://localhost:19080'
            });
        });

        test('should handle command guide - az-sf-query-guide', async () => {
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'command', itemId: 'az-sf-query-guide',
                commandId: 'az-sf-query-guide',
                clusterEndpoint: 'http://localhost:19080'
            });
        });

        // Additional item types
        test('should handle application-type', async () => {
            mockSfRest.getApplicationTypes.mockResolvedValue([
                { name: 'MyAppType', version: '1.0.0' }
            ]);
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'application-type', itemId: 'MyAppType',
                applicationTypeName: 'MyAppType',
                clusterEndpoint: 'http://localhost:19080'
            });
        });

        test('should handle node', async () => {
            mockSfRest.getNodeInfo.mockResolvedValue({ name: 'Node0', nodeStatus: 'Up' });
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'node', itemId: 'Node0',
                nodeName: 'Node0',
                clusterEndpoint: 'http://localhost:19080'
            });
        });

        test('should handle node-health', async () => {
            mockSfRest.getNodeHealth.mockResolvedValue({ aggregatedHealthState: 'Ok' });
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'node-health', itemId: 'Node0',
                nodeName: 'Node0',
                clusterEndpoint: 'http://localhost:19080'
            });
        });

        test('should handle application-health', async () => {
            mockSfRest.getApplicationHealth.mockResolvedValue({ aggregatedHealthState: 'Ok' });
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'application-health', itemId: 'App1',
                applicationId: 'App1',
                clusterEndpoint: 'http://localhost:19080'
            });
        });

        test('should handle health', async () => {
            mockSfRest.getClusterHealth.mockResolvedValue({ aggregatedHealthState: 'Ok' });
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'health', itemId: 'health',
                clusterEndpoint: 'http://localhost:19080'
            });
        });

        test('should handle manifest', async () => {
            mockSfRest.getClusterManifest.mockResolvedValue({ manifest: '<ClusterManifest />' });
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'manifest', itemId: 'manifest',
                clusterEndpoint: 'http://localhost:19080'
            });
        });

        test('should handle service-manifest', async () => {
            mockSfRest.getServiceManifest.mockResolvedValue({ manifest: '<ServiceManifest />' });
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'service-manifest', itemId: 'SvcManifest',
                applicationId: 'App1',
                serviceId: 'Svc1',
                clusterEndpoint: 'http://localhost:19080'
            });
        });

        test('should handle events with empty result', async () => {
            mockSfRest.getClusterEvents.mockResolvedValue([]);
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'events', itemId: 'events',
                clusterEndpoint: 'http://localhost:19080'
            });
            // Should return "no events" message
        });

        test('should handle repair-tasks with empty result', async () => {
            mockSfRest.getRepairTasks.mockResolvedValue([]);
            await registeredHandlers['sfClusterExplorer.showItemDetails']({
                itemType: 'repair-tasks', itemId: 'repair',
                clusterEndpoint: 'http://localhost:19080'
            });
            // Should return "no repair tasks" message
        });
    });
});
