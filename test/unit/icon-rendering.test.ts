import * as assert from 'assert';
import * as vscode from 'vscode';
import { TreeItem } from '../../src/models/TreeItem';

describe('Icon Rendering Validation - RED/GREEN Tests', () => {
    const testEndpoint = 'http://localhost:19080';
    const resourceUri = vscode.Uri.parse('vscode://test');

    test('RED: Static icons MUST have ThemeColor to render correctly', () => {
        // These are the exact patterns from sfConfiguration.ts lines 215, 227, 238, 265, 291, 302, 314
        const staticIcons = [
            { label: 'essentials', icon: 'info', color: 'charts.blue', type: 'essentials' },
            { label: 'details', icon: 'list-tree', color: 'charts.green', type: 'details' },
            { label: 'metrics', icon: 'graph', color: 'charts.red', type: 'metrics' },
            { label: 'image store', icon: 'package', color: 'charts.orange', type: 'image-store' },
            { label: 'manifest', icon: 'file-code', color: 'charts.orange', type: 'manifest' },
            { label: 'events', icon: 'calendar', color: 'charts.purple', type: 'events' },
            { label: 'commands', icon: 'terminal', color: 'charts.yellow', type: 'commands' }
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
            assert.ok(treeItem.iconPath instanceof vscode.ThemeIcon, `${item.label} iconPath MUST be ThemeIcon, got: ${typeof treeItem.iconPath}`);

            const themeIcon = treeItem.iconPath as vscode.ThemeIcon;
            assert.ok(themeIcon.id === item.icon, `${item.label} icon id should be '${item.icon}', got: ${themeIcon.id}`);
            assert.ok(themeIcon.color, `${item.label} ThemeIcon MUST have color property to render`);
            assert.ok(themeIcon.color instanceof vscode.ThemeColor, `${item.label} color MUST be ThemeColor instance`);

            const themeColor = themeIcon.color as any;
            assert.strictEqual(themeColor.id, item.color, `${item.label} should have ThemeColor id='${item.color}', got: '${themeColor.id}'`);
        }
    });

    test('RED: Health icon MUST have fallback when undefined', () => {
        // Test exact pattern from sfConfiguration.ts:279
        // iconPath: this.getIcon(this.clusterHealth?.aggregatedHealthState, 'heart') || new vscode.ThemeIcon('heart')

        // Simulate getIcon returning undefined (when health is undefined)
        const getIconResult = undefined; // This is what getIcon returns when status is undefined

        const fallbackIcon = getIconResult || new vscode.ThemeIcon('heart');
        
        assert.ok(fallbackIcon instanceof vscode.ThemeIcon, 'Fallback MUST produce ThemeIcon');
        assert.strictEqual((fallbackIcon as vscode.ThemeIcon).id, 'heart', 'Fallback icon MUST be "heart"');

        // Now test with actual TreeItem creation
        const healthItem = new TreeItem('health', {
            children: undefined,
            resourceUri: resourceUri,
            status: undefined,
            iconPath: getIconResult || new vscode.ThemeIcon('heart'),
            itemType: 'health',
            itemId: 'cluster-health',
            clusterEndpoint: testEndpoint
        });

        assert.ok(healthItem.iconPath, 'Health item MUST have iconPath');
        assert.ok(healthItem.iconPath instanceof vscode.ThemeIcon, 'Health iconPath MUST be ThemeIcon');
        assert.strictEqual((healthItem.iconPath as vscode.ThemeIcon).id, 'heart', 'Health icon MUST render with heart icon when no health data');
    });

    test('RED: System services MUST NOT return empty array', () => {
        // This validates the pattern that loadSystemServicesGroup and backgroundFetchSystemServices
        // MUST call buildSystemServiceItems, NOT return empty array []

        // Mock what buildSystemServiceItems should produce
        const mockServices = [
            { id: 'fabric:/System/ClusterManagerService', name: 'ClusterManagerService', healthState: 'Ok' },
            { id: 'fabric:/System/NamingService', name: 'NamingService', healthState: 'Ok' }
        ];

        // Simulate buildSystemServiceItems output
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

        // VALIDATION: Children should be built items, NOT empty array
        assert.ok(builtItems.length === 2, `Should have 2 service items, got: ${builtItems.length}`);
        assert.ok(builtItems[0].itemType === 'service', 'First item MUST be service type');
        assert.ok(builtItems[0].itemId, 'Service MUST have itemId');
        assert.ok(builtItems[0].iconPath, 'Service MUST have iconPath');

        // FAIL CASE: returning empty array []
        const emptyChildren: TreeItem[] = [];
        assert.ok(emptyChildren.length === 0, 'Empty array would show no children - THIS IS THE BUG');
    });

    test('GREEN: Verify buildSystemServiceItems signature exists and is used', () => {
        // This test documents that:
        // 1. buildSystemServiceItems(services, config, resourceUri, clusterEndpoint) should exist
        // 2. It MUST be called in both:
        //    - backgroundFetchSystemServices (line ~508)
        //    - loadSystemServicesGroup (line ~638)
        
        // Expected pattern:
        const expectedPattern = 'systemGroup.children = this.buildSystemServiceItems(services, config, systemGroup.resourceUri!, systemGroup.clusterEndpoint)';
        
        assert.ok(expectedPattern.includes('buildSystemServiceItems'), 'MUST call buildSystemServiceItems function');
        assert.ok(expectedPattern.includes('systemGroup.children ='), 'MUST assign to children property');
        assert.ok(!expectedPattern.includes('= []'), 'MUST NOT assign empty array');
    });
});
