/**
 * Command Registration Tests
 * Verifies all commands declared in package.json are properly defined
 * and that source files for command handling exist.
 * 
 * BUG FIX: Command 'sfClusterExplorer.sfGetCluster' not found
 * Root Cause: Commands registered but extension activation may fail silently
 */

import * as path from 'path';
import * as fs from 'fs';

describe('Extension Command Registration', () => {
    let packageJson: any;

    beforeAll(() => {
        packageJson = JSON.parse(
            fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8')
        );
    });

    test('package.json should declare all required commands', () => {
        // Only check commands declared in package.json contributes.commands
        // Some commands (refreshView, showItemDetails) are registered programmatically only
        const requiredCommands = [
            'sfClusterExplorer.sfGetClusters',
            'sfClusterExplorer.sfGetCluster',
            'sfClusterExplorer.sfDeployDevCluster',
            'sfClusterExplorer.sfSetClusterEndpoint',
            'sfClusterExplorer.sfRemoveClusterEndpoint',
            'sfClusterExplorer.sfSetClusterRestCall',
            'sfClusterExplorer.showManagementView',
            'sfClusterExplorer.deployApplicationFromContext',
            'sfClusterExplorer.manageNodeFromContext',
            'sfClusterExplorer.generateEventsReport',
            'sfClusterExplorer.generateHealthReport',
            'sfClusterExplorer.exportSnapshot',
            'sfClusterExplorer.restartReplica',
            'sfClusterExplorer.deleteReplica',
            'sfClusterExplorer.deleteService',
            'sfClusterExplorer.deleteApplication',
            'sfClusterExplorer.unprovisionApplicationType'
        ];

        const declaredCommands = packageJson.contributes.commands.map((c: any) => c.command);
        const missingCommands: string[] = [];

        for (const cmd of requiredCommands) {
            if (!declaredCommands.includes(cmd)) {
                missingCommands.push(cmd);
            }
        }

        expect(missingCommands).toEqual([]);
    });

    test('all package.json commands should have titles', () => {
        const commands = packageJson.contributes.commands;
        
        for (const cmd of commands) {
            expect(cmd.title).toBeDefined();
            expect(cmd.title.length).toBeGreaterThan(0);
        }
    });

    test('package.json commands should have valid categories', () => {
        const commands = packageJson.contributes.commands;
        
        for (const cmd of commands) {
            if (cmd.category) {
                expect(typeof cmd.category).toBe('string');
                expect(cmd.category.length).toBeGreaterThan(0);
            }
        }
    });

    test('context menu commands should have proper viewItem guards in package.json', () => {
        const contextCommands = [
            { cmd: 'sfClusterExplorer.generateEventsReport', viewItem: 'events' },
            { cmd: 'sfClusterExplorer.generateHealthReport', viewItem: 'health' },
            { cmd: 'sfClusterExplorer.manageNodeFromContext', viewItem: 'node' },
            { cmd: 'sfClusterExplorer.restartReplica', viewItem: 'replica' },
            { cmd: 'sfClusterExplorer.deleteReplica', viewItem: 'replica' },
            { cmd: 'sfClusterExplorer.deleteService', viewItem: 'service' },
            { cmd: 'sfClusterExplorer.deleteApplication', viewItem: 'application' },
            { cmd: 'sfClusterExplorer.unprovisionApplicationType', viewItem: 'application' },
        ];

        const menuItems = packageJson.contributes?.menus?.['view/item/context'] || [];

        for (const { cmd, viewItem } of contextCommands) {
            const menuItem = menuItems.find((m: any) => m.command === cmd);
            expect(menuItem).toBeDefined();
            if (menuItem) {
                expect(menuItem.when).toContain(`viewItem == ${viewItem}`);
            }
        }
    });
});

describe('Extension Source Code', () => {
    test('CommandRegistry.ts should exist', () => {
        const filePath = path.join(__dirname, '../../src/commands/CommandRegistry.ts');
        expect(fs.existsSync(filePath)).toBe(true);
    });

    test('ViewCommands.ts should exist', () => {
        const filePath = path.join(__dirname, '../../src/commands/ViewCommands.ts');
        expect(fs.existsSync(filePath)).toBe(true);
    });

    test('extension.ts should import CommandRegistry', () => {
        const extensionSource = fs.readFileSync(
            path.join(__dirname, '../../src/extension.ts'), 'utf8'
        );
        expect(extensionSource).toContain('CommandRegistry');
    });
});

describe('Bug Regression Tests', () => {
    let packageJson: any;

    beforeAll(() => {
        packageJson = JSON.parse(
            fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8')
        );
    });

    test('BUG: Command sfGetCluster not found should be fixed - package.json declares it', () => {
        const declaredCommands = packageJson.contributes.commands.map((c: any) => c.command);
        expect(declaredCommands).toContain('sfClusterExplorer.sfGetCluster');
    });

    test('BUG: No menu item on health tree item to create report should be fixed', () => {
        const declaredCommands = packageJson.contributes.commands.map((c: any) => c.command);
        expect(declaredCommands).toContain('sfClusterExplorer.generateHealthReport');

        const menuItems = packageJson.contributes?.menus?.['view/item/context'] || [];
        const healthMenu = menuItems.find((m: any) => m.command === 'sfClusterExplorer.generateHealthReport');
        expect(healthMenu).toBeDefined();
    });
});
