/**
 * CRITICAL: Icon Rendering Validation Tests
 * 
 * These tests prevent icon color rendering bugs by validating:
 * 1. Enterprise treeview uses IconService with ThemeColor for static icons
 * 2. TreeItem constructor uses proper type cast for iconPath
 * 3. No mutations after construction in treeview nodes
 * 
 * BACKGROUND: Static items with ThemeIcon+ThemeColor lose their colors if refreshed 
 * via _onDidChangeTreeData.fire(item) before VS Code properly processes them.
 * Only refresh static items as part of parent (cluster) refresh.
 */

import * as fs from 'fs';
import * as path from 'path';

describe('CRITICAL: Icon Rendering Protection', () => {
    const treeItemPath = path.join(__dirname, '../../src/models/TreeItem.ts');
    const treeviewPath = path.join(__dirname, '../../src/treeview');
    const iconServicePath = path.join(treeviewPath, 'IconService.ts');
    const clusterNodePath = path.join(treeviewPath, 'nodes', 'ClusterNode.ts');

    const treeItemSource = fs.readFileSync(treeItemPath, 'utf8');

    describe('Enterprise Treeview Static Icon Definitions', () => {
        it('ClusterNode should use StaticItemNode with color', () => {
            const source = fs.readFileSync(clusterNodePath, 'utf8');
            expect(source).toContain('StaticItemNode');
            
            // Should define essentials, details, metrics with colors
            expect(source).toContain('charts.blue');
        });

        it('IconService should provide getStaticIcon with ThemeColor', () => {
            const source = fs.readFileSync(iconServicePath, 'utf8');
            expect(source).toContain('getStaticIcon');
            expect(source).toContain('ThemeIcon');
            expect(source).toContain('ThemeColor');
        });

        it('Image store node should use IconService for colored icon', () => {
            const imageStorePath = path.join(treeviewPath, 'nodes', 'ImageStoreNode.ts');
            const source = fs.readFileSync(imageStorePath, 'utf8');
            expect(source).toContain('getStaticIcon');
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
        it('Static icon TreeItems must NOT have iconPath modified after creation in treeview nodes', () => {
            const staticItems = ['image-store', 'manifest', 'events', 'commands', 'essentials', 'details', 'metrics'];
            const nodesDir = path.join(treeviewPath, 'nodes');
            
            if (fs.existsSync(nodesDir)) {
                const nodeFiles = fs.readdirSync(nodesDir).filter(f => f.endsWith('.ts'));
                for (const file of nodeFiles) {
                    const source = fs.readFileSync(path.join(nodesDir, file), 'utf8');
                    for (const itemType of staticItems) {
                        const mutationPattern = new RegExp(`find.*itemType.*===.*['"]${itemType}['"][\\s\\S]{0,200}\\.iconPath\\s*=`, 'g');
                        const hasMutation = mutationPattern.test(source);
                        expect(hasMutation).toBe(false);
                    }
                }
            }
        });
    });
});
