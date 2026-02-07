import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

describe('Source Code Validation - Icon Rendering Patterns', () => {
    const srcPath = path.join(__dirname, '../../src');
    const configPath = path.join(srcPath, 'sfConfiguration.ts');

    let configSource: string;

    beforeAll(() => {
        configSource = fs.readFileSync(configPath, 'utf8');
    });

    test('RED: sfConfiguration.ts MUST have ThemeColor for all static icons', () => {
        // All static icons must have ThemeColor from creation
        
        // Image store
        assert.ok(
            configSource.includes("iconPath: new vscode.ThemeIcon('package', new vscode.ThemeColor('charts.orange'))"),
            'image store MUST have ThemeColor charts.orange'
        );

        // Manifest
        assert.ok(
            configSource.includes("iconPath: new vscode.ThemeIcon('file-code', new vscode.ThemeColor('charts.orange'))"),
            'manifest MUST have ThemeColor charts.orange'
        );

        // Essentials
        assert.ok(
            configSource.includes("iconPath: new vscode.ThemeIcon('info', new vscode.ThemeColor('charts.blue'))"),
            'essentials MUST have ThemeColor charts.blue'
        );

        // Details
        assert.ok(
            configSource.includes("iconPath: new vscode.ThemeIcon('list-tree', new vscode.ThemeColor('charts.green'))"),
            'details MUST have ThemeColor charts.green'
        );

        // Metrics
        assert.ok(
            configSource.includes("iconPath: new vscode.ThemeIcon('graph', new vscode.ThemeColor('charts.red'))"),
            'metrics MUST have ThemeColor charts.red'
        );

        // Events
        assert.ok(
            configSource.includes("iconPath: new vscode.ThemeIcon('calendar', new vscode.ThemeColor('charts.purple'))"),
            'events MUST have ThemeColor charts.purple'
        );

        // Commands
        assert.ok(
            configSource.includes("iconPath: new vscode.ThemeIcon('terminal', new vscode.ThemeColor('charts.yellow'))"),
            'commands MUST have ThemeColor charts.yellow'
        );
    });

    test('RED: sfConfiguration.ts health icon MUST have fallback', () => {
        // Line 279-280: health node creation
        const healthPattern = /iconPath:\s*this\.getIcon\([^,]+,\s*'heart'\)\s*\|\|\s*new vscode\.ThemeIcon\('heart'\)/;
        assert.ok(
            healthPattern.test(configSource),
            'Health icon MUST have fallback: getIcon(..., \'heart\') || new vscode.ThemeIcon(\'heart\')'
        );
    });

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
});
