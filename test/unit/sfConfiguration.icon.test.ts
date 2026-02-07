/**
 * Icon Drift Protection Test
 * 
 * Validates that the enterprise treeview's icon infrastructure uses
 * proper ThemeColor for static icons and IconService for dynamic icons.
 * 
 * Purpose: Prevent regression of icon rendering patterns.
 */

import * as path from 'path';
import * as fs from 'fs';

describe('Enterprise Treeview Icon Drift Protection', () => {
    const treeviewPath = path.join(__dirname, '../../src/treeview');

    test('IconService should exist and provide health-state icon mapping', () => {
        const iconServicePath = path.join(treeviewPath, 'IconService.ts');
        expect(fs.existsSync(iconServicePath)).toBe(true);
        
        const source = fs.readFileSync(iconServicePath, 'utf-8');
        expect(source).toContain('getStaticIcon');
        expect(source).toContain('ThemeIcon');
    });

    test('ClusterNode should use StaticItemNode for colored icons', () => {
        const clusterNodePath = path.join(treeviewPath, 'nodes', 'ClusterNode.ts');
        expect(fs.existsSync(clusterNodePath)).toBe(true);

        const source = fs.readFileSync(clusterNodePath, 'utf-8');
        expect(source).toContain('StaticItemNode');
        expect(source).toContain('charts.blue');
    });

    test('should NOT have heart-filled icon in treeview source', () => {
        const clusterNodePath = path.join(treeviewPath, 'nodes', 'ClusterNode.ts');
        const source = fs.readFileSync(clusterNodePath, 'utf-8');
        expect(source).not.toContain("'heart-filled'");
        expect(source).not.toContain('"heart-filled"');
    });
});
