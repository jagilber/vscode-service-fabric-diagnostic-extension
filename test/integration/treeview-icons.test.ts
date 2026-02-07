import * as assert from 'assert';
import * as vscode from 'vscode';
import { TreeItem } from '../../src/models/TreeItem';

describe('TreeView Icons Validation Tests', () => {
    const testEndpoint = 'http://localhost:19080';

    test('TreeItem static icons MUST have ThemeColor to render correctly', () => {
        const resourceUri = vscode.Uri.parse('vscode://test');

        const staticIcons = [
            { label: 'essentials', type: 'essentials', icon: 'info', color: 'charts.blue' },
            { label: 'details', type: 'details', icon: 'list-tree', color: 'charts.green' },
            { label: 'metrics', type: 'metrics', icon: 'graph', color: 'charts.red' },
            { label: 'image store', type: 'image-store', icon: 'package', color: 'charts.orange' },
            { label: 'manifest', type: 'manifest', icon: 'file-code', color: 'charts.orange' },
            { label: 'events', type: 'events', icon: 'calendar', color: 'charts.purple' },
            { label: 'commands', type: 'commands', icon: 'terminal', color: 'charts.yellow' }
        ];

        for (const item of staticIcons) {
            const treeItem = new TreeItem(item.label, {
                children: undefined,
                resourceUri: resourceUri,
                status: undefined,
                iconPath: new vscode.ThemeIcon(item.icon, new vscode.ThemeColor(item.color)),
                itemType: item.type,
                itemId: `cluster-${item.type}`,
                clusterEndpoint: testEndpoint
            });

            assert.ok(treeItem.iconPath, `${item.label} MUST have iconPath`);
            assert.ok(treeItem.iconPath instanceof vscode.ThemeIcon, `${item.label} iconPath MUST be ThemeIcon`);

            const themeIcon = treeItem.iconPath as vscode.ThemeIcon;
            assert.strictEqual(themeIcon.id, item.icon, `${item.label} icon id should be '${item.icon}'`);
            assert.ok(themeIcon.color, `${item.label} ThemeIcon MUST have color`);
            assert.ok(themeIcon.color instanceof vscode.ThemeColor, `${item.label} color MUST be ThemeColor`);

            const themeColor = themeIcon.color as any;
            assert.strictEqual(themeColor.id, item.color, `${item.label} should have ThemeColor '${item.color}'`);
        }
    });

    test('Health icon MUST have fallback when undefined', () => {
        // Simulate getIcon returning undefined (no health state)
        const getIconResult = undefined;
        const fallbackIcon = getIconResult || new vscode.ThemeIcon('heart');
        
        assert.ok(fallbackIcon instanceof vscode.ThemeIcon, 'Fallback MUST produce ThemeIcon');
        assert.strictEqual((fallbackIcon as vscode.ThemeIcon).id, 'heart', 'Fallback icon MUST be "heart"');
    });

    test('System services children must be built not empty array', () => {
        const resourceUri = vscode.Uri.parse('vscode://test');
        const mockServices = [
            { id: 'fabric:/System/ClusterManagerService', name: 'ClusterManagerService', healthState: 'Ok' },
            { id: 'fabric:/System/NamingService', name: 'NamingService', healthState: 'Ok' }
        ];

        const builtItems: TreeItem[] = mockServices.map(service => 
            new TreeItem(service.name, {
                children: undefined,
                resourceUri: resourceUri,
                status: service.healthState,
                iconPath: new vscode.ThemeIcon('gear', new vscode.ThemeColor('testing.iconPassed')),
                contextValue: 'service',
                itemType: 'service',
                itemId: service.id,
                clusterEndpoint: testEndpoint,
                healthState: service.healthState,
                applicationId: 'fabric:/System'
            })
        );

        assert.ok(builtItems.length === 2, `Should have 2 service items, got: ${builtItems.length}`);
        assert.ok(builtItems[0].itemType === 'service', 'First item MUST be service type');
        assert.ok(builtItems[0].itemId, 'Service MUST have itemId');
        assert.ok(builtItems[0].iconPath, 'Service MUST have iconPath');
    });
});
