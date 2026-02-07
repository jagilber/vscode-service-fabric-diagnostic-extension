/**
 * Unit tests for ResourceCommands
 */
import * as vscode from 'vscode';

// Mock CommandUtils to bypass safeRegisterCommand dedup protection
jest.mock('../../src/utils/CommandUtils', () => ({
    registerCommandWithErrorHandling: jest.fn((context: any, commandId: string, handler: any) => {
        const disposable = require('vscode').commands.registerCommand(commandId, handler);
        context.subscriptions.push(disposable);
    }),
    withProgress: jest.fn((_title: string, operation: any) => operation({ report: jest.fn() })),
    confirmWithTypedText: jest.fn(),
}));

import { registerResourceCommands } from '../../src/commands/ResourceCommands';
import { ItemTypes, ServiceKinds } from '../../src/constants/ItemTypes';
import { confirmWithTypedText } from '../../src/utils/CommandUtils';

describe('ResourceCommands', () => {
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
            restartReplica: jest.fn().mockResolvedValue(undefined),
            deleteReplica: jest.fn().mockResolvedValue(undefined),
            deleteService: jest.fn().mockResolvedValue(undefined),
            deleteApplication: jest.fn().mockResolvedValue(undefined),
            unprovisionApplicationType: jest.fn().mockResolvedValue(undefined),
        };

        mockSfMgr = {
            getCurrentSfConfig: jest.fn().mockReturnValue({
                getSfRest: jest.fn().mockReturnValue(mockSfRest)
            })
        };

        (vscode.commands.executeCommand as jest.Mock).mockResolvedValue(undefined);

        registerResourceCommands(mockContext, mockSfMgr);
    });

    test('should register all 5 resource commands', () => {
        expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(5);
        expect(registeredHandlers['sfClusterExplorer.restartReplica']).toBeDefined();
        expect(registeredHandlers['sfClusterExplorer.deleteReplica']).toBeDefined();
        expect(registeredHandlers['sfClusterExplorer.deleteService']).toBeDefined();
        expect(registeredHandlers['sfClusterExplorer.deleteApplication']).toBeDefined();
        expect(registeredHandlers['sfClusterExplorer.unprovisionApplicationType']).toBeDefined();
    });

    describe('restartReplica', () => {
        const validReplicaItem = {
            itemType: ItemTypes.REPLICA,
            serviceKind: ServiceKinds.STATEFUL,
            nodeName: 'Node0',
            partitionId: 'partition-1',
            itemId: 'replica-1',
            label: 'Replica 1'
        };

        test('should throw for non-replica item', async () => {
            const handler = registeredHandlers['sfClusterExplorer.restartReplica'];
            await expect(handler({ itemType: ItemTypes.SERVICE }))
                .rejects.toThrow('only available for replicas');
        });

        test('should throw for stateless replica', async () => {
            const handler = registeredHandlers['sfClusterExplorer.restartReplica'];
            await expect(handler({ ...validReplicaItem, serviceKind: ServiceKinds.STATELESS }))
                .rejects.toThrow('stateful services');
        });

        test('should throw if missing required fields', async () => {
            const handler = registeredHandlers['sfClusterExplorer.restartReplica'];
            await expect(handler({ itemType: ItemTypes.REPLICA, serviceKind: ServiceKinds.STATEFUL }))
                .rejects.toThrow('Missing required');
        });

        test('should restart replica after confirmation', async () => {
            (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue('Restart');
            const handler = registeredHandlers['sfClusterExplorer.restartReplica'];
            await handler(validReplicaItem);
            expect(mockSfRest.restartReplica).toHaveBeenCalledWith('Node0', 'partition-1', 'replica-1');
        });

        test('should not restart on cancel', async () => {
            (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue(undefined);
            const handler = registeredHandlers['sfClusterExplorer.restartReplica'];
            await handler(validReplicaItem);
            expect(mockSfRest.restartReplica).not.toHaveBeenCalled();
        });
    });

    describe('deleteReplica', () => {
        const validReplicaItem = {
            itemType: ItemTypes.REPLICA,
            serviceKind: ServiceKinds.STATEFUL,
            nodeName: 'Node0',
            partitionId: 'partition-1',
            itemId: 'replica-1',
            label: 'Replica 1'
        };

        test('should throw for non-replica item', async () => {
            const handler = registeredHandlers['sfClusterExplorer.deleteReplica'];
            await expect(handler({ itemType: ItemTypes.APPLICATION }))
                .rejects.toThrow('only available for replicas');
        });

        test('should delete replica after typed confirmation', async () => {
            (confirmWithTypedText as jest.Mock).mockResolvedValue(true);
            const handler = registeredHandlers['sfClusterExplorer.deleteReplica'];
            await handler(validReplicaItem);
            expect(mockSfRest.deleteReplica).toHaveBeenCalledWith('Node0', 'partition-1', 'replica-1');
        });

        test('should not delete when user cancels typed confirmation', async () => {
            (confirmWithTypedText as jest.Mock).mockResolvedValue(false);
            const handler = registeredHandlers['sfClusterExplorer.deleteReplica'];
            await handler(validReplicaItem);
            expect(mockSfRest.deleteReplica).not.toHaveBeenCalled();
        });
    });

    describe('deleteService', () => {
        const validServiceItem = {
            itemType: ItemTypes.SERVICE,
            itemId: 'fabric:/MyApp/MyService',
            label: 'MyService'
        };

        test('should throw for non-service item', async () => {
            const handler = registeredHandlers['sfClusterExplorer.deleteService'];
            await expect(handler({ itemType: ItemTypes.APPLICATION }))
                .rejects.toThrow('only available for services');
        });

        test('should delete service after typed confirmation', async () => {
            (confirmWithTypedText as jest.Mock).mockResolvedValue(true);
            const handler = registeredHandlers['sfClusterExplorer.deleteService'];
            await handler(validServiceItem);
            expect(mockSfRest.deleteService).toHaveBeenCalledWith('fabric:/MyApp/MyService');
        });
    });

    describe('deleteApplication', () => {
        const validAppItem = {
            itemType: ItemTypes.APPLICATION,
            itemId: 'fabric:/MyApp',
            label: 'MyApp'
        };

        test('should throw for non-application item', async () => {
            const handler = registeredHandlers['sfClusterExplorer.deleteApplication'];
            await expect(handler({ itemType: ItemTypes.SERVICE }))
                .rejects.toThrow('only available for applications');
        });

        test('should delete application after typed confirmation', async () => {
            (confirmWithTypedText as jest.Mock).mockResolvedValue(true);
            const handler = registeredHandlers['sfClusterExplorer.deleteApplication'];
            await handler(validAppItem);
            expect(mockSfRest.deleteApplication).toHaveBeenCalledWith('fabric:/MyApp');
        });
    });

    describe('unprovisionApplicationType', () => {
        const validTypeItem = {
            itemType: ItemTypes.APPLICATION_TYPE,
            typeName: 'MyAppType',
            typeVersion: '1.0.0'
        };

        test('should throw for non-application-type item', async () => {
            const handler = registeredHandlers['sfClusterExplorer.unprovisionApplicationType'];
            await expect(handler({ itemType: ItemTypes.APPLICATION }))
                .rejects.toThrow('only available for application types');
        });

        test('should unprovision after typed confirmation', async () => {
            (confirmWithTypedText as jest.Mock).mockResolvedValue(true);
            const handler = registeredHandlers['sfClusterExplorer.unprovisionApplicationType'];
            await handler(validTypeItem);
            expect(mockSfRest.unprovisionApplicationType).toHaveBeenCalledWith('MyAppType', '1.0.0');
        });
    });
});
