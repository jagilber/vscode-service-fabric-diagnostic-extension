import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

describe('Source Code Validation - Icon Rendering Patterns', () => {
    const srcPath = path.join(__dirname, '../../src');
    const configPath = path.join(srcPath, 'sfConfiguration.ts');
    const viewPath = path.join(srcPath, 'serviceFabricClusterView.ts');

    let configSource: string;
    let viewSource: string;

    beforeAll(() => {
        configSource = fs.readFileSync(configPath, 'utf8');
        viewSource = fs.readFileSync(viewPath, 'utf8');
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

    test('RED: serviceFabricClusterView.ts MUST call buildSystemServiceItems', () => {
        // Check backgroundFetchSystemServices (around line 508)
        const backgroundPattern = /systemGroup\.children\s*=\s*this\.buildSystemServiceItems\(/;
        assert.ok(
            backgroundPattern.test(viewSource),
            'backgroundFetchSystemServices MUST assign: systemGroup.children = this.buildSystemServiceItems(...)'
        );

        // Check loadSystemServicesGroup (around line 638)
        const loadPattern = /systemGroupItem\.children\s*=\s*\w+;.*return\s+\w+;/s;
        const hasLoadAssignment = viewSource.includes('systemGroupItem.children = serviceItems') || 
                                  viewSource.includes('systemGroupItem.children = this.buildSystemServiceItems');
        assert.ok(
            hasLoadAssignment,
            'loadSystemServicesGroup MUST assign children and return them, NOT return []'
        );
    });

    test('RED: serviceFabricClusterView.ts MUST have buildSystemServiceItems function', () => {
        const functionPattern = /private\s+buildSystemServiceItems\s*\(/;
        assert.ok(
            functionPattern.test(viewSource),
            'buildSystemServiceItems function MUST exist'
        );

        // Check it builds TreeItems properly
        assert.ok(
            viewSource.includes('sortedServices.map') && viewSource.includes('buildSystemServiceItems'),
            'buildSystemServiceItems MUST map services to TreeItems'
        );
    });

    test('RED: serviceFabricClusterView.ts MUST refresh static icons after background load', () => {
        // Check populateRootGroupsInBackground refreshes static icons
        const refreshPattern = /forEach\(child\s*=>\s*{[\s\S]*?if\s*\(\['essentials'.*?'commands'\]\.includes/;
        assert.ok(
            refreshPattern.test(viewSource),
            'populateRootGroupsInBackground MUST explicitly refresh static icon items'
        );

        assert.ok(
            viewSource.includes("['essentials', 'details', 'metrics', 'cluster-map', 'image-store', 'manifest', 'events', 'commands']"),
            'MUST refresh all 8 static icon items: essentials, details, metrics, cluster-map, image-store, manifest, events, commands'
        );
        
        // Verify refresh events are fired for each item
        assert.ok(
            viewSource.includes("this._onDidChangeTreeData.fire(child)"),
            'MUST fire refresh event for each static icon item'
        );
    });

    test('RED: serviceFabricClusterView.ts MUST call populateSystemServices with "System" not "fabric:~System"', () => {
        // Both backgroundFetchSystemServices and loadSystemServicesGroup should use 'System'
        const correctPattern = /populateSystemServices\s*\(\s*['"]System['"]\s*\)/g;
        const matches = viewSource.match(correctPattern);
        
        assert.ok(
            matches && matches.length === 2,
            `populateSystemServices MUST be called with 'System' exactly 2 times (found ${matches?.length || 0} calls)`
        );

        // Ensure NOT using wrong format
        assert.ok(
            !viewSource.includes("populateSystemServices('fabric:~System')"),
            'MUST NOT use fabric:~System - SDK expects just "System"'
        );
        assert.ok(
            !viewSource.includes('populateSystemServices("fabric:~System")'),
            'MUST NOT use fabric:~System - SDK expects just "System"'
        );
    });
});
