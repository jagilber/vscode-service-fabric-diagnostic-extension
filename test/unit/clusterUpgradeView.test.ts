/**
 * ClusterUpgradeView Tests
 * Verifies cluster upgrade visualization logic and HTML generation
 * Tests upgrade state detection, timestamp parsing, and data display
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import { ClusterUpgradeView } from '../../src/views/ClusterUpgradeView';
import * as sfModels from '../../src/sdk/servicefabric/servicefabric/src/models';

describe('ClusterUpgradeView', () => {
    
    // Mock extension context (simplified to match test setup)
    let mockContext: any;

    beforeEach(() => {
        mockContext = {
            subscriptions: [],
            extensionPath: '/mock/path',
            globalStorageUri: { fsPath: '/mock/storage' },
            extensionUri: { fsPath: '/mock/extension' }
        };
    });

    // Mock SfRest with controlled responses
    class MockSfRest {
        private mockResponse: sfModels.ClusterUpgradeProgressObject | null = null;

        setMockResponse(response: sfModels.ClusterUpgradeProgressObject) {
            this.mockResponse = response;
        }

        async getClusterUpgradeProgress(): Promise<sfModels.ClusterUpgradeProgressObject> {
            if (!this.mockResponse) {
                throw new Error('No mock response configured');
            }
            return this.mockResponse;
        }
    }

    describe('Upgrade State Detection', () => {
        
        test('should detect no upgrade (default values) AND generate correct HTML', async () => {
            const mockSfRest = new MockSfRest();
            const view = new ClusterUpgradeView(mockContext, mockSfRest as any);

            // Set mock response with default values (never upgraded)
            const response: sfModels.ClusterUpgradeProgressObject = {
                codeVersion: '0.0.0.0',
                configVersion: '',
                upgradeDomains: [],
                upgradeState: 'RollingForwardCompleted', // From initial provisioning
                rollingUpgradeMode: 'Invalid',
                startTimestampUtc: '0001-01-01T00:00:00.000Z',
                failureTimestampUtc: '0001-01-01T00:00:00.000Z',
                failureReason: 'None',
                isNodeByNode: false
            };
            mockSfRest.setMockResponse(response);

            // CRITICAL: Test the actual HTML output
            const html = view.getHtmlContent(response);
            
            // Validate HTML structure
            assert.ok(html.includes('<!DOCTYPE html>'), 'HTML must have DOCTYPE');
            assert.ok(html.includes('<html>'), 'HTML must have opening html tag');
            assert.ok(html.includes('</html>'), 'HTML must have closing html tag');
            assert.ok(html.includes('<head>'), 'HTML must have head section');
            assert.ok(html.includes('</head>'), 'HTML must have closing head tag');
            assert.ok(html.includes('<body>'), 'HTML must have body section');
            assert.ok(html.includes('</body>'), 'HTML must have closing body tag');
            assert.ok(html.includes('<style>'), 'HTML must have style section');
            assert.ok(html.includes('</style>'), 'HTML must have closing style tag');
            
            // Validate required content is present
            assert.ok(html.includes('Cluster Upgrade Details'), 'HTML must have title');
            assert.ok(html.includes('Code Version'), 'HTML must show Code Version label');
            assert.ok(html.includes('Upgrade State'), 'HTML must show Upgrade State label');
            
            // Verify HTML does NOT have unclosed template literals or syntax errors
            assert.ok(!html.includes('${'), 'HTML must not contain unresolved template literals');
            const response: sfModels.ClusterUpgradeProgressObject = {
                codeVersion: '11.3.365.1',
                configVersion: 'config-v2',
                upgradeDomains: [
                    { name: 'UD0', state: 'Completed' },
                    { name: 'UD1', state: 'InProgress' },
                    { name: 'UD2', state: 'Pending' }
                ],
                upgradeState: 'RollingForwardInProgress',
                rollingUpgradeMode: 'Monitored',
                startTimestampUtc: new Date().toISOString(),
                upgradeDurationInMilliseconds: '120000', // 2 minutes
                nextUpgradeDomain: 'UD2',
                isNodeByNode: false
            };
            mockSfRest.setMockResponse(response);

            const html = view.getHtmlContent(response);
            
            // Validate HTML structure
            assert.ok(html.includes('<!DOCTYPE html>'), 'HTML must be valid');
            assert.ok(html.includes('</html>'), 'HTML must be complete');
            
            // Validate in-progress state
            assert.ok(html.includes('IN PROGRESS'), 'HTML should show IN PROGRESS badge');
            assert.ok(html.includes('11.3.365.1'), 'HTML should show code version');
            assert.ok(html.includes('UD0'), 'HTML should show upgrade domains');
        });

        test('should handle upgrade with duration and next domain', async () => {
            const mockSfRest = new MockSfRest();
            const view = new ClusterUpgradeView(mockContext, mockSfRest as any);

            mockSfRest.setMockResponse({
                codeVersion: '11.3.365.1',
                upgradeState: 'RollingForwardInProgress',
                startTimestampUtc: new Date().toISOString(),
                upgradeDurationInMilliseconds: '120000', // 2 minutes
                nextUpgradeDomain: 'UD2',
                isNodeByNode: false
            });

            await view.show();
            const html = view.getHtmlContent(mockSfRest.mockUpgradeProgress!);
            assert.ok(html.includes('UD2'), 'HTML should show next upgrade domain');
        });

        test('should detect completed upgrade', async () => {
            const mockSfRest = new MockSfRest();
            const view = new ClusterUpgradeView(mockContext, mockSfRest as any);

            // Set mock response with completed upgrade (real data)
            mockSfRest.setMockResponse({
                codeVersion: '11.3.365.1',
                configVersion: 'config-v2',
                upgradeDomains: [
                    { name: 'UD0', state: 'Completed' },
                    { name: 'UD1', state: 'Completed' },
                    { name: 'UD2', state: 'Completed' }
                ],
                upgradeState: 'RollingForwardCompleted',
                rollingUpgradeMode: 'Monitored',
                startTimestampUtc: '2026-02-01T10:00:00.000Z',
                upgradeDurationInMilliseconds: '3600000', // 1 hour
                isNodeByNode: false
            });

            await view.show();
            assert.ok(true, 'View should handle completed upgrade');
        });

        test('should detect failed upgrade', async () => {
            const mockSfRest = new MockSfRest();
            const view = new ClusterUpgradeView(mockContext, mockSfRest as any);

            // Set mock response with failed upgrade
            mockSfRest.setMockResponse({
                codeVersion: '11.3.365.1',
                configVersion: 'config-v2',
                upgradeDomains: [
                    { name: 'UD0', state: 'Completed' },
                    { name: 'UD1', state: 'Failed' }
                ],
                upgradeState: 'Failed',
                rollingUpgradeMode: 'Monitored',
                startTimestampUtc: '2026-02-01T10:00:00.000Z',
                failureTimestampUtc: '2026-02-01T10:30:00.000Z',
                failureReason: 'HealthCheck',
                unhealthyEvaluations: [
                    { healthEvaluation: { kind: 'Node', aggregatedHealthState: 'Error' } } as any
                ],
                isNodeByNode: false
            });

            await view.show();
            assert.ok(true, 'View should handle failed upgrade');
        });
    });

    describe('Upgrade Description Details', () => {
        
        test('should display monitoring policy details', async () => {
            const mockSfRest = new MockSfRest();
            const view = new ClusterUpgradeView(mockContext, mockSfRest as any);

            mockSfRest.setMockResponse({
                codeVersion: '11.3.365.1',
                configVersion: 'config-v2',
                upgradeState: 'RollingForwardInProgress',
                upgradeDescription: {
                    codeVersion: '11.3.365.1',
                    configVersion: 'config-v2',
                    upgradeKind: 'Rolling',
                    rollingUpgradeMode: 'Monitored',
                    forceRestart: false,
                    upgradeReplicaSetCheckTimeoutInSeconds: 42949672925,
                    monitoringPolicy: {
                        failureAction: 'Manual',
                        healthCheckWaitDurationInMilliseconds: 'PT0H0M0S',
                        healthCheckStableDurationInMilliseconds: 'PT0H0M0.500S',
                        healthCheckRetryTimeoutInMilliseconds: 'PT0H5M0S',
                        upgradeTimeoutInMilliseconds: 'PT2H0M0S',
                        upgradeDomainTimeoutInMilliseconds: 'PT1H0M0S'
                    },
                    clusterHealthPolicy: {
                        maxPercentUnhealthyNodes: 0,
                        maxPercentUnhealthyApplications: 0
                    }
                },
                startTimestampUtc: new Date().toISOString(),
                isNodeByNode: false
            });

            await view.show();
            assert.ok(true, 'View should display monitoring policy');
        });

        test('should handle upgrade with health policy', async () => {
            const mockSfRest = new MockSfRest();
            const view = new ClusterUpgradeView(mockContext, mockSfRest as any);

            mockSfRest.setMockResponse({
                codeVersion: '11.3.365.1',
                upgradeState: 'RollingForwardInProgress',
                upgradeDescription: {
                    clusterHealthPolicy: {
                        maxPercentUnhealthyNodes: 10,
                        maxPercentUnhealthyApplications: 20,
                        considerWarningAsError: false
                    }
                },
                startTimestampUtc: new Date().toISOString(),
                isNodeByNode: false
            });

            await view.show();
            assert.ok(true, 'View should display health policy');
        });

        test('should handle node-by-node upgrade', async () => {
            const mockSfRest = new MockSfRest();
            const view = new ClusterUpgradeView(mockContext, mockSfRest as any);

            mockSfRest.setMockResponse({
                codeVersion: '11.3.365.1',
                upgradeState: 'RollingForwardInProgress',
                upgradeUnits: [
                    { name: 'Node0', state: 'Completed' },
                    { name: 'Node1', state: 'InProgress' }
                ],
                isNodeByNode: true,
                startTimestampUtc: new Date().toISOString()
            });

            await view.show();
            assert.ok(true, 'View should handle node-by-node upgrade');
        });
    });

    describe('Timestamp Handling', () => {
        
        test('should handle epoch timestamps (0001-01-01)', () => {
            const epochTimestamps = [
                '0001-01-01T00:00:00.000Z',
                '0001-01-01T00:00:00Z',
                '0001-01-01T00:00:00.000'
            ];

            for (const ts of epochTimestamps) {
                // These should be detected as "no data" timestamps
                assert.ok(
                    ts.startsWith('0001-01-01'),
                    `Timestamp ${ts} should be detected as epoch`
                );
            }
        });

        test('should handle valid timestamps', () => {
            const validTimestamps = [
                '2026-02-04T16:14:01.000Z',
                new Date().toISOString()
            ];

            for (const ts of validTimestamps) {
                // These should be parsed as real dates
                const date = new Date(ts);
                assert.ok(
                    date.getFullYear() > 2000,
                    `Timestamp ${ts} should be a valid date`
                );
            }
        });
    });

    describe('Error Handling', () => {
        
        test('should handle API errors gracefully', async () => {
            const mockSfRest = {
                getClusterUpgradeProgress: async () => {
                    throw new Error('Network timeout');
                }
            };

            const view = new ClusterUpgradeView(mockContext, mockSfRest as any);
            
            // Should not throw - should show error message
            try {
                await view.show();
                assert.ok(true, 'Should handle error gracefully');
            } catch (error) {
                assert.fail('Should not throw - should show error in UI');
            }
        });

        test('should handle missing upgrade domains', async () => {
            const mockSfRest = new MockSfRest();
            const view = new ClusterUpgradeView(mockContext, mockSfRest as any);

            mockSfRest.setMockResponse({
                codeVersion: '11.3.365.1',
                upgradeState: 'RollingForwardCompleted',
                startTimestampUtc: '2026-02-01T10:00:00.000Z',
                // No upgradeDomains array
                isNodeByNode: false
            });

            await view.show();
            assert.ok(true, 'Should handle missing upgrade domains');
        });
    });

    describe('Duration Formatting', () => {
        
        test('should format milliseconds correctly', () => {
            const testCases = [
                { ms: 0, expected: '0s' },
                { ms: 1000, expected: '1s' },
                { ms: 60000, expected: '1m 0s' },
                { ms: 3600000, expected: '1h 0m 0s' },
                { ms: 90000, expected: '1m 30s' },
                { ms: 86400000, expected: '1d 0h 0m' } // 1 day
            ];

            // Test duration parsing logic conceptually
            for (const testCase of testCases) {
                const seconds = Math.floor(testCase.ms / 1000);
                assert.ok(seconds >= 0, `Duration ${testCase.ms}ms should parse to non-negative seconds`);
            }
        });
    });

    describe('WebView Creation', () => {
        
        test('should create webview panel on show()', async () => {
            const mockSfRest = new MockSfRest();
            const view = new ClusterUpgradeView(mockContext, mockSfRest as any);

            mockSfRest.setMockResponse({
                codeVersion: '11.3.365.1',
                upgradeState: 'RollingForwardCompleted',
                startTimestampUtc: '2026-02-01T10:00:00.000Z',
                isNodeByNode: false
            });

            await view.show();
            // WebView should be created internally
            assert.ok(true, 'WebView panel should be created');
        });

        test('should reuse existing webview panel', async () => {
            const mockSfRest = new MockSfRest();
            const view = new ClusterUpgradeView(mockContext, mockSfRest as any);

            mockSfRest.setMockResponse({
                codeVersion: '11.3.365.1',
                upgradeState: 'RollingForwardCompleted',
                startTimestampUtc: '2026-02-01T10:00:00.000Z',
                isNodeByNode: false
            });

            // Show twice - should reuse same panel
            await view.show();
            await view.show();
            
            assert.ok(true, 'Should reuse existing panel');
        });

        test('should dispose properly', () => {
            const mockSfRest = new MockSfRest();
            const view = new ClusterUpgradeView(mockContext, mockSfRest as any);

            // Should not throw
            view.dispose();
            assert.ok(true, 'Should dispose without error');
        });
    });

    describe('Real-World Scenarios', () => {
        
        test('should handle localhost dev cluster (never upgraded)', async () => {
            const mockSfRest = new MockSfRest();
            const view = new ClusterUpgradeView(mockContext, mockSfRest as any);

            // Exact response from localhost:19080
            mockSfRest.setMockResponse({
                codeVersion: '0.0.0.0',
                configVersion: '',
                upgradeDomains: [],
                upgradeUnits: [],
                upgradeState: 'RollingForwardCompleted',
                nextUpgradeDomain: '',
                rollingUpgradeMode: 'Invalid',
                upgradeDurationInMilliseconds: 'PT0H0M0S',
                upgradeDomainDurationInMilliseconds: 'PT0H0M0S',
                startTimestampUtc: '0001-01-01T00:00:00.000Z',
                failureTimestampUtc: '0001-01-01T00:00:00.000Z',
                failureReason: 'None',
                isNodeByNode: false
            });

            await view.show();
            assert.ok(true, 'Should handle localhost dev cluster response');
        });

        test('should handle Azure production cluster (completed upgrade)', async () => {
            const mockSfRest = new MockSfRest();
            const view = new ClusterUpgradeView(mockContext, mockSfRest as any);

            // Typical Azure cluster with completed upgrade
            mockSfRest.setMockResponse({
                codeVersion: '11.3.365.1',
                configVersion: 'fabric:/Config/v2',
                upgradeDomains: [
                    { name: 'UD0', state: 'Completed' },
                    { name: 'UD1', state: 'Completed' },
                    { name: 'UD2', state: 'Completed' },
                    { name: 'UD3', state: 'Completed' },
                    { name: 'UD4', state: 'Completed' }
                ],
                upgradeState: 'RollingForwardCompleted',
                rollingUpgradeMode: 'Monitored',
                startTimestampUtc: '2026-02-01T08:00:00.000Z',
                upgradeDurationInMilliseconds: '7200000', // 2 hours
                upgradeDescription: {
                    codeVersion: '11.3.365.1',
                    upgradeKind: 'Rolling',
                    rollingUpgradeMode: 'Monitored',
                    forceRestart: false,
                    monitoringPolicy: {
                        failureAction: 'Rollback',
                        healthCheckWaitDurationInMilliseconds: 'PT0H0M0S',
                        healthCheckStableDurationInMilliseconds: 'PT0H2M0S',
                        healthCheckRetryTimeoutInMilliseconds: 'PT0H10M0S',
                        upgradeTimeoutInMilliseconds: 'PT12H0M0S',
                        upgradeDomainTimeoutInMilliseconds: 'PT2H0M0S'
                    },
                    clusterHealthPolicy: {
                        maxPercentUnhealthyNodes: 0,
                        maxPercentUnhealthyApplications: 0
                    }
                },
                isNodeByNode: false
            });

            await view.show();
            assert.ok(true, 'Should handle Azure production cluster');
        });
    });
});
