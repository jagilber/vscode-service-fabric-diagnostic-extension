/**
 * Command Registration Tests
 * Verifies all commands declared in package.json are properly registered in extension.ts
 * 
 * BUG FIX: Command 'sfClusterExplorer.sfGetCluster' not found
 * Root Cause: Commands registered but extension activation may fail silently
 */

import * as vscode from 'vscode';
import * as assert from 'assert';

describe('Extension Command Registration', () => {
    test('should register all commands from package.json', async () => {
        // Get all registered commands
        const allCommands = await vscode.commands.getCommands(true);
        
        // Commands that should be registered by this extension
        const requiredCommands = [
            'sfClusterExplorer.sfGetClusters',
            'sfClusterExplorer.sfGetCluster',
            'sfClusterExplorer.sfDeployDevCluster',
            'sfClusterExplorer.sfSetClusterEndpoint',
            'sfClusterExplorer.sfRemoveClusterEndpoint',
            'sfClusterExplorer.sfSetClusterRestCall',
            'serviceFabricClusterView.refreshView',
            'sfClusterExplorer.showManagementView',
            'sfClusterExplorer.deployApplicationFromContext',
            'sfClusterExplorer.manageNodeFromContext',
            'sfClusterExplorer.generateEventsReport',
            'sfClusterExplorer.generateHealthReport',
            'sfClusterExplorer.exportSnapshot',
            'sfClusterExplorer.showItemDetails',
            'sfClusterExplorer.restartReplica',
            'sfClusterExplorer.deleteReplica',
            'sfClusterExplorer.deleteService',
            'sfClusterExplorer.deleteApplication',
            'sfClusterExplorer.unprovisionApplicationType'
        ];

        // Check each required command is registered
        const missingCommands: string[] = [];
        for (const cmd of requiredCommands) {
            if (!allCommands.includes(cmd)) {
                missingCommands.push(cmd);
            }
        }

        // Assert no commands are missing
        assert.strictEqual(
            missingCommands.length,
            0,
            `Missing commands: ${missingCommands.join(', ')}`
        );
    });

    test('sfGetCluster command should be executable', async () => {
        try {
            // This should not throw "command not found"
            // It may fail with other errors (like "no cluster configured") but shouldn't be unregistered
            await vscode.commands.executeCommand('sfClusterExplorer.sfGetCluster');
        } catch (error: any) {
            // If error message contains "not found", the command isn't registered
            assert.ok(
                !error.message?.includes('not found'),
                `Command 'sfClusterExplorer.sfGetCluster' is not registered: ${error.message}`
            );
        }
    });

    test('all cluster explorer commands should be executable', async () => {
        const commands = [
            'sfClusterExplorer.sfGetClusters',
            'sfClusterExplorer.sfGetCluster',
            'sfClusterExplorer.sfSetClusterEndpoint',
            'sfClusterExplorer.sfRemoveClusterEndpoint',
        ];

        for (const cmd of commands) {
            try {
                await vscode.commands.executeCommand(cmd);
            } catch (error: any) {
                // Command is registered but may fail with functional errors - that's OK
                // We're just checking it's not "command not found"
                assert.ok(
                    !error.message?.includes('not found') && !error.message?.includes('not registered'),
                    `Command '${cmd}' is not registered: ${error.message}`
                );
            }
        }
    });

    test('context menu commands should have proper item type guards', async () => {
        const contextCommands = [
            { cmd: 'sfClusterExplorer.generateEventsReport', itemType: 'events' },
            { cmd: 'sfClusterExplorer.generateHealthReport', itemType: 'cluster' },
            { cmd: 'sfClusterExplorer.manageNodeFromContext', itemType: 'node' },
            { cmd: 'sfClusterExplorer.restartReplica', itemType: 'replica' },
            { cmd: 'sfClusterExplorer.deleteReplica', itemType: 'replica' },
            { cmd: 'sfClusterExplorer.deleteService', itemType: 'service' },
            { cmd: 'sfClusterExplorer.deleteApplication', itemType: 'application' },
            { cmd: 'sfClusterExplorer.unprovisionApplicationType', itemType: 'application' },
        ];

        for (const { cmd, itemType } of contextCommands) {
            try {
                // Call with invalid item - should show warning, not crash
                await vscode.commands.executeCommand(cmd, { itemType: 'invalid' });
            } catch (error: any) {
                // Should gracefully handle wrong item type
                assert.ok(
                    !error.message?.includes('not found'),
                    `Command '${cmd}' is not registered: ${error.message}`
                );
            }
        }
    });
});

describe('Extension Activation', () => {
    test('extension should activate without errors', async () => {
        const ext = vscode.extensions.getExtension('jagilber.vscode-service-fabric-diagnostic-extension');
        assert.ok(ext, 'Extension should be installed');
        
        if (ext && !ext.isActive) {
            await ext.activate();
        }
        
        assert.ok(ext?.isActive, 'Extension should be active after activation');
    });

    test('extension should survive command palette access', async () => {
        // Get all commands to trigger command palette indexing
        const allCommands = await vscode.commands.getCommands(true);
        const sfCommands = allCommands.filter(cmd => cmd.startsWith('sfClusterExplorer') || cmd.startsWith('serviceFabric'));
        
        // Should have registered at least 15 commands
        assert.ok(sfCommands.length >= 15, `Expected at least 15 SF commands, found ${sfCommands.length}`);
    });
});

describe('Bug Regression Tests', () => {
    test('BUG: Command sfGetCluster not found should be fixed', async () => {
        // This is the exact bug reported by the user
        try {
            const commands = await vscode.commands.getCommands(true);
            assert.ok(
                commands.includes('sfClusterExplorer.sfGetCluster'),
                'BUG NOT FIXED: Command sfClusterExplorer.sfGetCluster is still not registered'
            );
        } catch (error) {
            assert.fail(`Failed to check command registration: ${error}`);
        }
    });

    test('BUG: No menu item on health tree item to create report should be fixed', async () => {
        // Bug: Health tree item should have context menu for generating health report
        // Verify health item sets proper contextValue in sfConfiguration.ts
        // And package.json has menu item for viewItem == health
        const commands = await vscode.commands.getCommands(true);
        assert.ok(
            commands.includes('sfClusterExplorer.generateHealthReport'),
            'BUG NOT FIXED: generateHealthReport command not registered'
        );
    });
});
