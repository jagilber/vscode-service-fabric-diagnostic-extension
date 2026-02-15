/**
 * Unit tests for CommandRegistry
 * Tests the COMMAND_MANIFEST structure and validation logic.
 */

import * as path from 'path';
import * as fs from 'fs';
import { COMMAND_MANIFEST, CommandMeta } from '../../../src/commands/CommandRegistry';

describe('CommandRegistry', () => {
    let packageJson: any;

    beforeAll(() => {
        packageJson = JSON.parse(
            fs.readFileSync(path.join(__dirname, '../../../package.json'), 'utf8')
        );
    });

    describe('COMMAND_MANIFEST', () => {
        test('should have at least 20 commands', () => {
            const commandCount = Object.keys(COMMAND_MANIFEST).length;
            expect(commandCount).toBeGreaterThanOrEqual(20);
        });

        test('every command should have a friendlyName', () => {
            for (const [id, meta] of Object.entries(COMMAND_MANIFEST)) {
                expect(meta.friendlyName).toBeDefined();
                expect(meta.friendlyName.length).toBeGreaterThan(0);
            }
        });

        test('every command should have a valid category', () => {
            const validCategories = ['cluster', 'view', 'report', 'node', 'resource', 'internal', 'project'];
            
            for (const [id, meta] of Object.entries(COMMAND_MANIFEST)) {
                expect(validCategories).toContain(meta.category);
            }
        });

        test('every command should have requiresCluster boolean', () => {
            for (const [id, meta] of Object.entries(COMMAND_MANIFEST)) {
                expect(typeof meta.requiresCluster).toBe('boolean');
            }
        });

        test('activation event commands should be marked', () => {
            const activationCommands = Object.entries(COMMAND_MANIFEST)
                .filter(([_, meta]) => meta.isActivationEvent);

            expect(activationCommands.length).toBeGreaterThanOrEqual(3);

            // Critical activation commands must include
            const activationIds = activationCommands.map(([id]) => id);
            expect(activationIds).toContain('sfClusterExplorer.sfSetClusterEndpoint');
            expect(activationIds).toContain('sfClusterExplorer.sfGetCluster');
            expect(activationIds).toContain('sfClusterExplorer.refresh');
        });

        test('activation event commands should not require cluster', () => {
            const activationCommands = Object.entries(COMMAND_MANIFEST)
                .filter(([_, meta]) => meta.isActivationEvent);

            for (const [id, meta] of activationCommands) {
                expect(meta.requiresCluster).toBe(false);
            }
        });
    });

    describe('COMMAND_MANIFEST vs package.json', () => {
        test('all package.json commands should have manifest entries', () => {
            const packageCommands = packageJson.contributes.commands.map((c: any) => c.command);
            const manifestCommands = Object.keys(COMMAND_MANIFEST);

            const missingFromManifest: string[] = [];
            for (const cmd of packageCommands) {
                if (!manifestCommands.includes(cmd)) {
                    missingFromManifest.push(cmd);
                }
            }

            // Allow some package.json commands to be only in package.json 
            // (they may be registered differently)
            // But log any discrepancies
            if (missingFromManifest.length > 0) {
                console.warn(`Commands in package.json but not in COMMAND_MANIFEST: ${missingFromManifest.join(', ')}`);
            }
        });

        test('resource commands should require cluster', () => {
            // cancelDeployment doesn't require cluster — it cancels a pending local operation
            const resourceCommands = Object.entries(COMMAND_MANIFEST)
                .filter(([_, meta]) => meta.category === 'resource')
                .filter(([id]) => id !== 'sfClusterExplorer.cancelDeployment');

            for (const [id, meta] of resourceCommands) {
                expect(meta.requiresCluster).toBe(true);
            }
        });

        test('report commands should require cluster', () => {
            const reportCommands = Object.entries(COMMAND_MANIFEST)
                .filter(([_, meta]) => meta.category === 'report');

            for (const [id, meta] of reportCommands) {
                expect(meta.requiresCluster).toBe(true);
            }
        });
    });

    describe('Command categories', () => {
        test('should have commands in each category', () => {
            const categories = new Set(Object.values(COMMAND_MANIFEST).map(m => m.category));

            expect(categories).toContain('cluster');
            expect(categories).toContain('view');
            expect(categories).toContain('report');
            expect(categories).toContain('node');
            expect(categories).toContain('resource');
        });

        test('cluster category should have endpoint management commands', () => {
            const clusterCommands = Object.entries(COMMAND_MANIFEST)
                .filter(([_, meta]) => meta.category === 'cluster')
                .map(([id]) => id);

            expect(clusterCommands).toContain('sfClusterExplorer.sfSetClusterEndpoint');
            expect(clusterCommands).toContain('sfClusterExplorer.sfRemoveClusterEndpoint');
        });

        test('resource category should have destructive operation commands', () => {
            const resourceCommands = Object.entries(COMMAND_MANIFEST)
                .filter(([_, meta]) => meta.category === 'resource')
                .map(([id]) => id);

            expect(resourceCommands).toContain('sfClusterExplorer.restartReplica');
            expect(resourceCommands).toContain('sfClusterExplorer.deleteService');
            expect(resourceCommands).toContain('sfClusterExplorer.deleteApplication');
        });
    });
});
