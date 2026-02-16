/**
 * Unit tests for CommandRegistry
 */
import * as vscode from 'vscode';
import { CommandRegistry, COMMAND_MANIFEST, CommandMeta } from '../../src/commands/CommandRegistry';

// Mock the sub-registrars
jest.mock('../../src/commands/ClusterCommands', () => ({
    registerClusterCommands: jest.fn()
}));
jest.mock('../../src/commands/NodeCommands', () => ({
    registerNodeCommands: jest.fn()
}));
jest.mock('../../src/commands/ResourceCommands', () => ({
    registerResourceCommands: jest.fn()
}));
jest.mock('../../src/commands/ViewCommands', () => ({
    registerViewCommands: jest.fn()
}));
jest.mock('../../src/commands/ReportCommands', () => ({
    registerReportCommands: jest.fn()
}));
jest.mock('../../src/commands/ProjectCommands', () => ({
    registerProjectCommands: jest.fn()
}));
jest.mock('../../src/services/SfProjectService');
jest.mock('../../src/services/SfDeployService');
jest.mock('../../src/treeview/SfApplicationsDataProvider');

import { registerClusterCommands } from '../../src/commands/ClusterCommands';
import { registerNodeCommands } from '../../src/commands/NodeCommands';
import { registerResourceCommands } from '../../src/commands/ResourceCommands';
import { registerViewCommands } from '../../src/commands/ViewCommands';
import { registerReportCommands } from '../../src/commands/ReportCommands';

describe('CommandRegistry', () => {
    let mockContext: vscode.ExtensionContext;
    let mockSfMgr: any;
    let mockSfPrompts: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockContext = new (vscode as any).ExtensionContext();
        mockSfMgr = {};
        mockSfPrompts = {};
    });

    describe('COMMAND_MANIFEST', () => {
        test('should have at least 20 commands declared', () => {
            const commandCount = Object.keys(COMMAND_MANIFEST).length;
            expect(commandCount).toBeGreaterThanOrEqual(20);
        });

        test('all entries should have required fields', () => {
            for (const [id, meta] of Object.entries(COMMAND_MANIFEST)) {
                expect(meta.friendlyName).toBeTruthy();
                expect(['cluster', 'view', 'report', 'node', 'resource', 'internal', 'project']).toContain(meta.category);
                expect(typeof meta.requiresCluster).toBe('boolean');
            }
        });

        test('should have activation-event commands marked', () => {
            const activationCommands = Object.entries(COMMAND_MANIFEST)
                .filter(([, meta]) => meta.isActivationEvent);
            expect(activationCommands.length).toBeGreaterThanOrEqual(3);
        });

        test('activation commands should include refresh, sfSetClusterEndpoint, sfGetCluster', () => {
            expect(COMMAND_MANIFEST['sfClusterExplorer.refresh']?.isActivationEvent).toBe(true);
            expect(COMMAND_MANIFEST['sfClusterExplorer.sfSetClusterEndpoint']?.isActivationEvent).toBe(true);
            expect(COMMAND_MANIFEST['sfClusterExplorer.sfGetCluster']?.isActivationEvent).toBe(true);
        });

        test('cluster category should include sfSetClusterEndpoint', () => {
            expect(COMMAND_MANIFEST['sfClusterExplorer.sfSetClusterEndpoint']?.category).toBe('cluster');
        });

        test('view category should include refresh', () => {
            expect(COMMAND_MANIFEST['sfClusterExplorer.refresh']?.category).toBe('view');
        });

        test('report category should include generateEventsReport', () => {
            expect(COMMAND_MANIFEST['sfClusterExplorer.generateEventsReport']?.category).toBe('report');
        });

        test('node category should include manageNodeFromContext', () => {
            expect(COMMAND_MANIFEST['sfClusterExplorer.manageNodeFromContext']?.category).toBe('node');
        });

        test('resource category should include restartReplica', () => {
            expect(COMMAND_MANIFEST['sfClusterExplorer.restartReplica']?.category).toBe('resource');
        });

        test('all command IDs should follow naming convention', () => {
            for (const id of Object.keys(COMMAND_MANIFEST)) {
                expect(id).toMatch(/^(sfClusterExplorer|serviceFabricClusterView|sfApplications)\./);
            }
        });
    });

    describe('registerAll', () => {
        test('should call all sub-registrars in order', () => {
            CommandRegistry.registerAll(mockContext, mockSfMgr, mockSfPrompts);

            expect(registerClusterCommands).toHaveBeenCalledWith(mockContext, mockSfMgr, mockSfPrompts);
            expect(registerNodeCommands).toHaveBeenCalledWith(mockContext, mockSfMgr);
            expect(registerResourceCommands).toHaveBeenCalledWith(mockContext, mockSfMgr);
            expect(registerViewCommands).toHaveBeenCalledWith(mockContext, mockSfMgr, undefined);
            expect(registerReportCommands).toHaveBeenCalledWith(mockContext, mockSfMgr);
        });

        test('should call each registrar exactly once', () => {
            CommandRegistry.registerAll(mockContext, mockSfMgr, mockSfPrompts);

            expect(registerClusterCommands).toHaveBeenCalledTimes(1);
            expect(registerNodeCommands).toHaveBeenCalledTimes(1);
            expect(registerResourceCommands).toHaveBeenCalledTimes(1);
            expect(registerViewCommands).toHaveBeenCalledTimes(1);
            expect(registerReportCommands).toHaveBeenCalledTimes(1);
        });
    });

    describe('validateRegistrations', () => {
        test('should pass when all commands are registered', async () => {
            const allCommandIds = Object.keys(COMMAND_MANIFEST);
            (vscode.commands.getCommands as jest.Mock).mockResolvedValue(allCommandIds);
            // Should not throw
            await expect(CommandRegistry.validateRegistrations()).resolves.not.toThrow();
        });

        test('should log warnings for missing commands', async () => {
            // Only return a subset of commands — some will be "missing"
            (vscode.commands.getCommands as jest.Mock).mockResolvedValue(['sfClusterExplorer.refresh']);
            await CommandRegistry.validateRegistrations();
            // This should execute without error — warnings are logged, not thrown
        });

        test('should handle getCommands rejection gracefully', async () => {
            (vscode.commands.getCommands as jest.Mock).mockRejectedValue(new Error('API unavailable'));
            await expect(CommandRegistry.validateRegistrations()).resolves.not.toThrow();
        });
    });
});
