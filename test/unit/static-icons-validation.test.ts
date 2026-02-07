import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

describe('Static Icons Must Render on Load - Validation', () => {
    const srcPath = path.join(__dirname, '../../src');
    const configPath = path.join(srcPath, 'sfConfiguration.ts');
    let configSource: string;

    beforeAll(() => {
        configSource = fs.readFileSync(configPath, 'utf8');
    });

    test('RED: Image store icon should have consistent pattern with health', () => {
        // Image store should have ThemeColor from creation like other static icons
        const hasThemeColor = configSource.includes("iconPath: new vscode.ThemeIcon('package', new vscode.ThemeColor('charts.orange'))");
        
        assert.ok(hasThemeColor, 'Image store icon MUST have ThemeColor charts.orange at creation');
        
        // Must also be in explicit refresh list
        const hasExplicitRefresh = configSource.includes("'image-store'");
        assert.ok(hasExplicitRefresh, 'Image store must be in refresh list');
    });

    test('RED: Manifest icon should have consistent pattern with health', () => {
        // Manifest should have ThemeColor from creation like other static icons
        const hasThemeColor = configSource.includes("iconPath: new vscode.ThemeIcon('file-code', new vscode.ThemeColor('charts.orange'))");
        
        assert.ok(hasThemeColor, 'Manifest icon MUST have ThemeColor charts.orange at creation');
        
        // Must also be in explicit refresh list
        const hasExplicitRefresh = configSource.includes("'manifest'");
        assert.ok(hasExplicitRefresh, 'Manifest must be in refresh list');
    });

    test('GREEN: Health icon has proper dynamic pattern with fallback', () => {
        // Health should use: this.getIcon(...) || new vscode.ThemeIcon('heart')
        const healthPattern = /iconPath:\s*this\.getIcon\([^,]+,\s*'heart'\)\s*\|\|\s*new vscode\.ThemeIcon\('heart'\)/;
        assert.ok(healthPattern.test(configSource), 'Health icon MUST have dynamic pattern with fallback');
    });
});
