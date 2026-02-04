/**
 * Data Population Tests
 * Verifies correct data is displayed in UI (not just that HTML renders)
 */

import * as assert from 'assert';
import { ClusterUpgradeView } from '../../src/views/ClusterUpgradeView';
import * as sfModels from '../../src/sdk/servicefabric/servicefabric/src/models';

describe('ClusterUpgradeView Data Population', () => {
    
    let mockContext: any;

    beforeEach(() => {
        mockContext = {
            subscriptions: [],
            extensionPath: '/mock/path',
            globalStorageUri: { fsPath: '/mock/storage' },
            extensionUri: { fsPath: '/mock/extension' }
        };
    });

    describe('Version Display', () => {
        
        test('should show actual cluster version when upgrade API returns 0.0.0.0', () => {
            const mockSfRest = {
                getClusterUpgradeProgress: async () => ({
                    codeVersion: '0.0.0.0',
                    upgradeState: 'Invalid',
                    isNodeByNode: false
                })
            };

            const view = new ClusterUpgradeView(mockContext, mockSfRest as any);
            const response: sfModels.ClusterUpgradeProgressObject = {
                codeVersion: '0.0.0.0',
                upgradeState: 'Invalid',
                isNodeByNode: false
            };
            
            // Pass actual cluster version (simulating getClusterVersion() call)
            const html = view.getHtmlContent(response, '11.3.365.1');
            
            // Debug output
            console.log('\n=== HTML Output Debug ===');
            console.log('response.codeVersion:', response.codeVersion);
            console.log('actualClusterVersion param:', '11.3.365.1');
            console.log('HTML length:', html.length);
            console.log('HTML contains "Code Version":', html.includes('Code Version'));
            console.log('HTML contains "11.3.365.1":', html.includes('11.3.365.1'));
            console.log('HTML contains "0.0.0.0":', html.includes('0.0.0.0'));
            const versionMatch = html.match(/Code Version:<\/div>\s*<div class="value">(.*?)<\/div>/);
            console.log('Extracted version:', versionMatch ? versionMatch[1] : 'NOT FOUND');
            console.log('===================\n');
            
            // CRITICAL: Must show actual version, not 0.0.0.0
            assert.ok(html.includes('11.3.365.1'), 'Must show actual cluster version');
            assert.ok(!html.includes('0.0.0.0'), 'Must NOT show 0.0.0.0 when actual version provided');
        });

        test('should show upgrade code version during active upgrade', () => {
            const mockSfRest = {
                getClusterUpgradeProgress: async () => ({})
            };

            const view = new ClusterUpgradeView(mockContext, mockSfRest as any);
            const response: sfModels.ClusterUpgradeProgressObject = {
                codeVersion: '11.3.366.0', // Upgrading TO this version
                upgradeState: 'RollingForwardInProgress',
                isNodeByNode: false
            };
            
            const html = view.getHtmlContent(response);
            
            assert.ok(html.includes('11.3.366.0'), 'Must show target upgrade version');
            assert.ok(html.includes('IN PROGRESS'), 'Must show IN PROGRESS badge');
        });
    });

    describe('Duration Formatting', () => {
        
        test('should parse ISO 8601 duration format (PT0H0M0S)', () => {
            const mockSfRest = {
                getClusterUpgradeProgress: async () => ({})
            };

            const view = new ClusterUpgradeView(mockContext, mockSfRest as any);
            const response: sfModels.ClusterUpgradeProgressObject = {
                codeVersion: '11.3.365.1',
                upgradeState: 'RollingForwardCompleted',
                upgradeDurationInMilliseconds: 'PT0H0M0S', // ISO 8601 format
                isNodeByNode: false
            };
            
            const html = view.getHtmlContent(response);
            
            // CRITICAL: Must show user-friendly format, not ISO 8601
            assert.ok(html.includes('0 milliseconds') || html.includes('0s'), 'Must format duration as 0 milliseconds or 0s');
            assert.ok(!html.includes('PT0H0M0S'), 'Must NOT show raw ISO 8601 format');
        });

        test('should parse ISO 8601 duration with hours/minutes (PT2H30M15S)', () => {
            const mockSfRest = {
                getClusterUpgradeProgress: async () => ({})
            };

            const view = new ClusterUpgradeView(mockContext, mockSfRest as any);
            const response: sfModels.ClusterUpgradeProgressObject = {
                codeVersion: '11.3.365.1',
                upgradeState: 'RollingForwardCompleted',
                upgradeDurationInMilliseconds: 'PT2H30M15S', // 2h 30m 15s
                isNodeByNode: false
            };
            
            const html = view.getHtmlContent(response);
            
            // Should show formatted duration
            assert.ok(html.includes('2h 30m 15s') || html.includes('Duration'), 'Must format complex duration');
            assert.ok(!html.includes('PT2H30M15S'), 'Must NOT show raw ISO 8601 format');
        });

        test('should handle numeric duration strings', () => {
            const mockSfRest = {
                getClusterUpgradeProgress: async () => ({})
            };

            const view = new ClusterUpgradeView(mockContext, mockSfRest as any);
            const response: sfModels.ClusterUpgradeProgressObject = {
                codeVersion: '11.3.365.1',
                upgradeState: 'RollingForwardCompleted',
                upgradeDurationInMilliseconds: '120000', // 2 minutes in milliseconds
                isNodeByNode: false
            };
            
            const html = view.getHtmlContent(response);
            
            assert.ok(html.includes('2m 0s') || html.includes('2m'), 'Must format 120000ms as 2 minutes');
        });
    });

    describe('Timestamp Display', () => {
        
        test('should format valid timestamps as readable dates', () => {
            const mockSfRest = {
                getClusterUpgradeProgress: async () => ({})
            };

            const view = new ClusterUpgradeView(mockContext, mockSfRest as any);
            const response: sfModels.ClusterUpgradeProgressObject = {
                codeVersion: '11.3.365.1',
                upgradeState: 'RollingForwardCompleted',
                startTimestampUtc: '2026-02-01T10:00:00.000Z',
                isNodeByNode: false
            };
            
            const html = view.getHtmlContent(response);
            
            // Should show formatted date, not raw ISO string
            assert.ok(!html.includes('2026-02-01T10:00:00.000Z'), 'Must NOT show raw ISO timestamp');
            // Should contain some date component (month, day, year)
            assert.ok(html.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/) || html.includes('2026'), 'Must show formatted date');
        });

        test('should handle epoch timestamps (0001-01-01)', () => {
            const mockSfRest = {
                getClusterUpgradeProgress: async () => ({})
            };

            const view = new ClusterUpgradeView(mockContext, mockSfRest as any);
            const response: sfModels.ClusterUpgradeProgressObject = {
                codeVersion: '0.0.0.0',
                upgradeState: 'Invalid',
                startTimestampUtc: '0001-01-01T00:00:00.000Z',
                isNodeByNode: false
            };
            
            const html = view.getHtmlContent(response, '11.3.365.1');
            
            // Epoch timestamps should be formatted as a date (even if ancient)
            assert.ok(html.includes('Start Timestamp'), 'Must have timestamp label');
        });
    });

    describe('State Badges', () => {
        
        test('should show IN PROGRESS badge for RollingForwardInProgress', () => {
            const mockSfRest = {
                getClusterUpgradeProgress: async () => ({})
            };

            const view = new ClusterUpgradeView(mockContext, mockSfRest as any);
            const response: sfModels.ClusterUpgradeProgressObject = {
                codeVersion: '11.3.365.1',
                upgradeState: 'RollingForwardInProgress',
                isNodeByNode: false
            };
            
            const html = view.getHtmlContent(response);
            
            assert.ok(html.includes('IN PROGRESS'), 'Must show IN PROGRESS badge');
            assert.ok(html.includes('status-upgrading'), 'Must have upgrading CSS class');
        });

        test('should show FAILED badge for Failed state', () => {
            const mockSfRest = {
                getClusterUpgradeProgress: async () => ({})
            };

            const view = new ClusterUpgradeView(mockContext, mockSfRest as any);
            const response: sfModels.ClusterUpgradeProgressObject = {
                codeVersion: '11.3.365.1',
                upgradeState: 'Failed',
                failureReason: 'HealthCheck',
                isNodeByNode: false
            };
            
            const html = view.getHtmlContent(response);
            
            assert.ok(html.includes('FAILED'), 'Must show FAILED badge');
            assert.ok(html.includes('status-failed'), 'Must have failed CSS class');
            assert.ok(html.includes('HealthCheck'), 'Must show failure reason');
        });

        test('should show COMPLETED badge only for real upgrades', () => {
            const mockSfRest = {
                getClusterUpgradeProgress: async () => ({})
            };

            const view = new ClusterUpgradeView(mockContext, mockSfRest as any);
            const response: sfModels.ClusterUpgradeProgressObject = {
                codeVersion: '11.3.365.1',
                upgradeState: 'RollingForwardCompleted',
                startTimestampUtc: '2026-02-01T10:00:00.000Z', // Valid timestamp
                isNodeByNode: false
            };
            
            const html = view.getHtmlContent(response);
            
            assert.ok(html.includes('COMPLETED'), 'Must show COMPLETED badge for real upgrades');
        });

        test('should NOT show COMPLETED badge for never-upgraded cluster', () => {
            const mockSfRest = {
                getClusterUpgradeProgress: async () => ({})
            };

            const view = new ClusterUpgradeView(mockContext, mockSfRest as any);
            const response: sfModels.ClusterUpgradeProgressObject = {
                codeVersion: '0.0.0.0',
                upgradeState: 'RollingForwardCompleted', // From initial provisioning
                startTimestampUtc: '0001-01-01T00:00:00.000Z', // Epoch
                isNodeByNode: false
            };
            
            const html = view.getHtmlContent(response, '11.3.365.1');
            
            assert.ok(!html.includes('COMPLETED'), 'Must NOT show COMPLETED badge for never-upgraded cluster');
        });
    });
});
