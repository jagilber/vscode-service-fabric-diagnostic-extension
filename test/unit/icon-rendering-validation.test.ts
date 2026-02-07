/**
 * CRITICAL: Icon Rendering Validation Tests
 * 
 * These tests prevent icon color rendering bugs by validating:
 * 1. ThemeIcon objects are created with ThemeColor at construction time in sfConfiguration.ts
 * 2. TreeItem constructor uses proper type cast for iconPath
 * 3. No mutations after construction
 * 
 * BACKGROUND: Static items with ThemeIcon+ThemeColor lose their colors if refreshed 
 * via _onDidChangeTreeData.fire(item) before VS Code properly processes them.
 * Only refresh static items as part of parent (cluster) refresh.
 */

import * as fs from 'fs';
import * as path from 'path';

describe('CRITICAL: Icon Rendering Protection', () => {
    const configPath = path.join(__dirname, '../../src/sfConfiguration.ts');
    const treeItemPath = path.join(__dirname, '../../src/models/TreeItem.ts');
    
    const configSource = fs.readFileSync(configPath, 'utf8');
    const treeItemSource = fs.readFileSync(treeItemPath, 'utf8');

    describe('Static Icon Definitions Must Use ThemeIcon with ThemeColor', () => {
        it('image store icon must have ThemeIcon with ThemeColor at creation', () => {
            const imageStoreMatch = configSource.match(/new TreeItem\('image store',\s*\{[\s\S]{0,500}?iconPath:\s*(new vscode\.ThemeIcon\([^)]+\)[^,\n]*)/);
            expect(imageStoreMatch).toBeTruthy();
            
            const iconPath = imageStoreMatch![1];
            expect(iconPath).toContain('new vscode.ThemeIcon');
            expect(iconPath).toContain('ThemeColor');
            expect(iconPath).toContain('charts.orange');
        });

        it('manifest icon must have ThemeIcon with ThemeColor at creation', () => {
            const manifestMatch = configSource.match(/new TreeItem\('manifest',[\s\S]{0,500}?iconPath:\s*(new vscode\.ThemeIcon\([^)]+\)[^,\n]*)/);
            expect(manifestMatch).toBeTruthy();
            
            const iconPath = manifestMatch![1];
            expect(iconPath).toContain('new vscode.ThemeIcon');
            expect(iconPath).toContain('ThemeColor');
            expect(iconPath).toContain('charts.orange');
        });

        it('events icon must have ThemeIcon with ThemeColor at creation', () => {
            const eventsMatch = configSource.match(/new TreeItem\('events',[\s\S]{0,500}?iconPath:\s*(new vscode\.ThemeIcon\([^)]+\)[^,\n]*)/);
            expect(eventsMatch).toBeTruthy();
            
            const iconPath = eventsMatch![1];
            expect(iconPath).toContain('new vscode.ThemeIcon');
            expect(iconPath).toContain('ThemeColor');
            expect(iconPath).toContain('charts.purple');
        });

        it('commands icon must have ThemeIcon with ThemeColor at creation', () => {
            const commandsMatch = configSource.match(/new TreeItem\('commands',[\s\S]{0,500}?iconPath:\s*(new vscode\.ThemeIcon\([^)]+\)[^,\n]*)/);
            expect(commandsMatch).toBeTruthy();
            
            const iconPath = commandsMatch![1];
            expect(iconPath).toContain('new vscode.ThemeIcon');
            expect(iconPath).toContain('ThemeColor');
            expect(iconPath).toContain('charts.yellow');
        });
    });

    describe('TreeItem Constructor Type Safety', () => {
        it('CRITICAL: iconPath assignment must use "as any" cast for backward compatibility', () => {
            const constructorMatch = treeItemSource.match(/constructor\(label: string[\s\S]*?this\.iconPath\s*=\s*([^;]+);/);
            expect(constructorMatch).toBeTruthy();
            
            const assignment = constructorMatch![1];
            expect(assignment).toContain('options.iconPath as any');
        });

        it('TreeItemOptions interface must accept ThemeIcon type', () => {
            const interfaceMatch = treeItemSource.match(/export interface TreeItemOptions \{[\s\S]*?iconPath\?:\s*([^;]+);/);
            expect(interfaceMatch).toBeTruthy();
            
            const iconPathType = interfaceMatch![1];
            expect(iconPathType).toMatch(/ThemeIcon|string|Uri/);
        });
    });

    describe('No Mutations After Construction', () => {
        it('Static icon TreeItems must NOT have iconPath modified after creation in sfConfiguration', () => {
            const staticItems = ['image-store', 'manifest', 'events', 'commands', 'essentials', 'details', 'metrics'];
            
            for (const itemType of staticItems) {
                const mutationPattern = new RegExp(`find.*itemType.*===.*['"]${itemType}['"][\\s\\S]{0,200}\\.iconPath\\s*=`, 'g');
                const hasMutation = mutationPattern.test(configSource);
                
                expect(hasMutation).toBe(false);
            }
        });
    });
});
