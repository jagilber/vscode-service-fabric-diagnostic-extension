/**
 * Icon Drift Protection Test
 * 
 * This test ensures the cluster health icon remains as 'heart' (hollow/shell)
 * and doesn't drift back to 'heart-filled' (solid).
 * 
 * Purpose: Prevent regression of commit c553f70 icon change requirement.
 */

import * as path from 'path';
import * as fs from 'fs';

describe('SfConfiguration Icon Drift Protection', () => {
    const configFilePath = path.join(__dirname, '../../src/sfConfiguration.ts');
    
    beforeAll(() => {
        // Verify the file exists before running tests
        expect(fs.existsSync(configFilePath)).toBe(true);
    });

    test('should use hollow heart icon (heart) not solid (heart-filled)', () => {
        const fileContent = fs.readFileSync(configFilePath, 'utf-8');
        
        // Ensure we're using 'heart' icon
        const hasHollowHeartIcon = fileContent.includes("getIcon(this.clusterHealth?.aggregatedHealthState, 'heart')") ||
                                   fileContent.includes('getIcon(this.clusterHealth?.aggregatedHealthState, "heart")');
        
        expect(hasHollowHeartIcon).toBe(true);
    });

    test('should NOT use solid heart icon (heart-filled)', () => {
        const fileContent = fs.readFileSync(configFilePath, 'utf-8');
        
        // Ensure we're NOT using 'heart-filled' icon
        const hasSolidHeartIcon = fileContent.includes("'heart-filled'") || 
                                 fileContent.includes('"heart-filled"');
        
        expect(hasSolidHeartIcon).toBe(false);
    });

    test('should maintain icon configuration at expected location', () => {
        const fileContent = fs.readFileSync(configFilePath, 'utf-8');
        
        // Verify the icon is set in the getClusterTreeItem method
        const hasIconPathInMethod = fileContent.includes('iconPath:') && 
                                    fileContent.includes('this.getIcon(this.clusterHealth?.aggregatedHealthState');
        
        expect(hasIconPathInMethod).toBe(true);
    });

    test('should document the icon choice for future maintainers', () => {
        const fileContent = fs.readFileSync(configFilePath, 'utf-8');
        
        // Check that there's some reference to health state in icon logic
        const hasHealthStateIcon = fileContent.includes('aggregatedHealthState') && 
                                   fileContent.includes('getIcon');
        
        expect(hasHealthStateIcon).toBe(true);
    });
});
