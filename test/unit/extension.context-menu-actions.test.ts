/**
 * Context Menu Actions Tests
 * Verifies new replica, service, application, and application type context menu actions
 * are properly defined in package.json.
 */

import * as path from 'path';
import * as fs from 'fs';

describe('Context Menu Actions - Package.json Configuration', () => {
    let packageJson: any;

    beforeAll(() => {
        packageJson = JSON.parse(
            fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8')
        );
    });

    test('should declare all new context menu commands in package.json', () => {
        const newCommands = [
            'sfClusterExplorer.restartReplica',
            'sfClusterExplorer.deleteReplica',
            'sfClusterExplorer.deleteService',
            'sfClusterExplorer.deleteApplication',
            'sfClusterExplorer.unprovisionApplicationType'
        ];

        const declaredCommands = packageJson.contributes.commands.map((c: any) => c.command);
        const missingCommands: string[] = [];

        for (const cmd of newCommands) {
            if (!declaredCommands.includes(cmd)) {
                missingCommands.push(cmd);
            }
        }

        expect(missingCommands).toEqual([]);
    });

    test('menu items should have correct viewItem context', () => {
        const menuConfigs = [
            { command: 'sfClusterExplorer.restartReplica', viewItem: 'replica' },
            { command: 'sfClusterExplorer.deleteReplica', viewItem: 'replica' },
            { command: 'sfClusterExplorer.deleteService', viewItem: 'service' },
            { command: 'sfClusterExplorer.deleteApplication', viewItem: 'application' },
            { command: 'sfClusterExplorer.unprovisionApplicationType', viewItem: 'application' }
        ];

        const declaredCommands = packageJson.contributes.commands.map((c: any) => c.command);
        const menuItems = packageJson.contributes.menus['view/item/context'];

        for (const { command, viewItem } of menuConfigs) {
            // Command should be declared
            expect(declaredCommands).toContain(command);

            // Command definition should exist with a title
            const commandDef = packageJson.contributes.commands.find((c: any) => c.command === command);
            expect(commandDef).toBeDefined();
            expect(commandDef.title).toBeDefined();

            // Menu item should exist with correct when clause
            const menuItem = menuItems.find((m: any) => m.command === command);
            expect(menuItem).toBeDefined();
            if (menuItem) {
                expect(menuItem.when).toContain(`viewItem == ${viewItem}`);
            }
        }
    });

    test('context menu commands should belong to sfClusterExplorer view', () => {
        const menuItems = packageJson.contributes.menus['view/item/context'];

        // All SF commands should have a when clause
        const sfMenuItems = menuItems.filter(
            (m: any) => m.command && m.command.startsWith('sfClusterExplorer.')
        );

        for (const item of sfMenuItems) {
            expect(item.when).toBeDefined();
        }
    });
});
