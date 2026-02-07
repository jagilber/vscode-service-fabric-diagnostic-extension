import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

describe('Source Code Validation', () => {
    const srcPath = path.join(__dirname, '../../src');

    test('TreeItem model should exist as standalone module', () => {
        const treeItemPath = path.join(srcPath, 'models', 'TreeItem.ts');
        assert.ok(
            fs.existsSync(treeItemPath),
            'TreeItem class should exist at src/models/TreeItem.ts'
        );
        
        const treeItemSource = fs.readFileSync(treeItemPath, 'utf8');
        assert.ok(
            treeItemSource.includes('export class TreeItem extends vscode.TreeItem'),
            'TreeItem must extend vscode.TreeItem'
        );
        assert.ok(
            treeItemSource.includes('export interface TreeItemOptions'),
            'TreeItemOptions interface must be exported'
        );
    });

    test('Legacy serviceFabricClusterView.ts should not exist', () => {
        const legacyPath = path.join(srcPath, 'serviceFabricClusterView.ts');
        assert.ok(
            !fs.existsSync(legacyPath),
            'Legacy serviceFabricClusterView.ts should be deleted'
        );
    });

    test('sfConfiguration.ts should not contain legacy tree-building methods', () => {
        const configPath = path.join(srcPath, 'sfConfiguration.ts');
        const configSource = fs.readFileSync(configPath, 'utf8');

        // These methods were removed as dead code in Phase 2
        assert.ok(!configSource.includes('createClusterViewTreeItem'), 'createClusterViewTreeItem should be removed');
        assert.ok(!configSource.includes('addClusterTreeItems'), 'addClusterTreeItems should be removed');
        assert.ok(!configSource.includes('addApplicationTreeItems'), 'addApplicationTreeItems should be removed');
        assert.ok(!configSource.includes('addServiceTreeItems'), 'addServiceTreeItems should be removed');
        assert.ok(!configSource.includes('addSystemTreeItems'), 'addSystemTreeItems should be removed');
        assert.ok(!configSource.includes('getIcon('), 'getIcon should be removed');
        assert.ok(!configSource.includes('compareHealthStates'), 'compareHealthStates should be removed');
        assert.ok(!configSource.includes('clusterViewTreeItemType'), 'clusterViewTreeItemType should be removed');
    });

    test('Enterprise treeview ClusterNode should exist', () => {
        const clusterNodePath = path.join(srcPath, 'treeview', 'nodes', 'ClusterNode.ts');
        assert.ok(
            fs.existsSync(clusterNodePath),
            'ClusterNode.ts should exist in enterprise treeview'
        );
    });

    test('Enterprise treeview IconService should exist', () => {
        const iconServicePath = path.join(srcPath, 'treeview', 'IconService.ts');
        assert.ok(
            fs.existsSync(iconServicePath),
            'IconService.ts should exist for icon management'
        );
    });
});
