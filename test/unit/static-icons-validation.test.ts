import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

describe('Static Icons Must Render on Load - Validation', () => {
    const treeviewPath = path.join(__dirname, '../../src/treeview');

    test('ClusterNode should define static items with ThemeColor', () => {
        const clusterNodePath = path.join(treeviewPath, 'nodes', 'ClusterNode.ts');
        const source = fs.readFileSync(clusterNodePath, 'utf8');

        // Enterprise treeview uses StaticItemNode for colored static icons
        assert.ok(source.includes('StaticItemNode'), 'ClusterNode must use StaticItemNode for static icons');
        assert.ok(source.includes('charts.blue'), 'Must include blue chart color for essentials');
    });

    test('IconService should provide getStaticIcon for ThemeColor creation', () => {
        const iconServicePath = path.join(treeviewPath, 'IconService.ts');
        const source = fs.readFileSync(iconServicePath, 'utf8');

        assert.ok(source.includes('getStaticIcon'), 'IconService must expose getStaticIcon');
        assert.ok(source.includes('ThemeIcon'), 'IconService must use ThemeIcon');
        assert.ok(source.includes('ThemeColor'), 'IconService must use ThemeColor');
    });

    test('Image store icon should have ThemeColor', () => {
        const imageStorePath = path.join(treeviewPath, 'nodes', 'ImageStoreNode.ts');
        const source = fs.readFileSync(imageStorePath, 'utf8');

        assert.ok(source.includes('getStaticIcon'), 'Image store must use getStaticIcon for colored icon');
    });
});
