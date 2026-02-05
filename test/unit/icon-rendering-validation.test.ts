/**
 * CRITICAL: Icon Rendering Validation Tests
 * 
 * These tests prevent icon color rendering bugs by validating:
 * 1. Static icons (image store, manifest) are NOT refreshed individually in background population
 * 2. ThemeIcon objects are created with ThemeColor at construction time
 * 3. No type casts that break ThemeIcon object identity
 * 
 * BACKGROUND: Static items with ThemeIcon+ThemeColor lose their colors if refreshed 
 * via _onDidChangeTreeData.fire(item) before VS Code properly processes them.
 * Only refresh static items as part of parent (cluster) refresh.
 */

import * as fs from 'fs';
import * as path from 'path';

describe('CRITICAL: Icon Rendering Protection', () => {
    const viewPath = path.join(__dirname, '../../src/serviceFabricClusterView.ts');
    const configPath = path.join(__dirname, '../../src/sfConfiguration.ts');
    
    const viewSource = fs.readFileSync(viewPath, 'utf8');
    const configSource = fs.readFileSync(configPath, 'utf8');

    describe('Background Population Must NOT Refresh Static Icons', () => {
        it('CRITICAL: populateRootGroupsInBackground must NOT call fire() on individual static items', () => {
            // Find the populateRootGroupsInBackground method
            const methodMatch = viewSource.match(/private\s+async\s+populateRootGroupsInBackground\([^)]+\)[^{]*\{([\s\S]*?)\n    \}/);
            expect(methodMatch).toBeTruthy();
            
            const methodBody = methodMatch![1];
            
            // CRITICAL: Must NOT have forEach loop that refreshes static items
            const hasIndividualStaticRefresh = methodBody.includes('forEach') && 
                                               methodBody.includes("['essentials', 'details', 'metrics'") &&
                                               methodBody.includes('_onDidChangeTreeData.fire(child)');
            
            expect(hasIndividualStaticRefresh).toBe(false);
            
            // Should only refresh at cluster level
            expect(methodBody).toContain('_onDidChangeTreeData.fire(clusterItem)');
        });

        it('CRITICAL: Must only refresh cluster item, not individual static children', () => {
            const backgroundMethod = viewSource.match(/private\s+async\s+populateRootGroupsInBackground[\s\S]*?Promise\.all\(promises\)\.then\(\(\) => \{([\s\S]*?)\n        \}\);/);
            expect(backgroundMethod).toBeTruthy();
            
            const completionBlock = backgroundMethod![1];
            
            // Count fire() calls - should be exactly 1 (for clusterItem only)
            const fireCallCount = (completionBlock.match(/_onDidChangeTreeData\.fire\(/g) || []).length;
            expect(fireCallCount).toBe(1);
            expect(completionBlock).toContain('fire(clusterItem)');
        });
    });

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
            // Find the cluster-level manifest (not application-level)
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
            // This matches the working version pattern
            const constructorMatch = viewSource.match(/constructor\(label: string[\s\S]*?this\.iconPath\s*=\s*([^;]+);/);
            expect(constructorMatch).toBeTruthy();
            
            const assignment = constructorMatch![1];
            expect(assignment).toContain('options.iconPath as any');
        });

        it('TreeItemOptions interface must accept ThemeIcon type', () => {
            const interfaceMatch = viewSource.match(/export interface TreeItemOptions \{[\s\S]*?iconPath\?:\s*([^;]+);/);
            expect(interfaceMatch).toBeTruthy();
            
            const iconPathType = interfaceMatch![1];
            // Should accept ThemeIcon or standard icon types
            expect(iconPathType).toMatch(/ThemeIcon|string|Uri/);
        });
    });

    describe('No Mutations After Construction', () => {
        it('Static icon TreeItems must NOT have iconPath modified after creation', () => {
            // Search for any code that modifies iconPath on static items
            const staticItems = ['image-store', 'manifest', 'events', 'commands', 'essentials', 'details', 'metrics'];
            
            for (const itemType of staticItems) {
                // Pattern: finding item by itemType, then setting iconPath
                const mutationPattern = new RegExp(`find.*itemType.*===.*['"]${itemType}['"][\\s\\S]{0,200}\\.iconPath\\s*=`, 'g');
                const hasMutation = mutationPattern.test(viewSource);
                
                expect(hasMutation).toBe(false);
            }
        });
    });

    describe('Documentation Requirements', () => {
        it('populateRootGroupsInBackground must document why static items are not refreshed individually', () => {
            const methodMatch = viewSource.match(/\/\*\*[\s\S]*?Populate root groups in background[\s\S]*?\*\//);
            expect(methodMatch).toBeTruthy();
            
            // Should have documentation explaining the refresh behavior
            const docBlock = methodMatch![0];
            expect(docBlock.length).toBeGreaterThan(50); // Has meaningful documentation
        });
    });
});
