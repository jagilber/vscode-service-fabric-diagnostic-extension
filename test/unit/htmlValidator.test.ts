/**
 * HTML Validation Tests
 * Critical: Ensures all WebView HTML is structurally valid
 * Prevents blank webviews from malformed HTML
 */

import * as assert from 'assert';
import { ClusterUpgradeView } from '../../src/views/ClusterUpgradeView';
import * as sfModels from '../../src/sdk/servicefabric/servicefabric/src/models';

describe('HTML Validation', () => {
    
    let mockContext: any;
    let mockSfRest: any;

    beforeEach(() => {
        mockContext = {
            subscriptions: [],
            extensionPath: '/mock/path',
            globalStorageUri: { fsPath: '/mock/storage' },
            extensionUri: { fsPath: '/mock/extension' }
        };

        mockSfRest = {
            getClusterUpgradeProgress: async () => ({
                codeVersion: '11.3.365.1',
                upgradeState: 'RollingForwardCompleted',
                startTimestampUtc: '2026-02-01T10:00:00.000Z',
                isNodeByNode: false
            })
        };
    });

    describe('ClusterUpgradeView HTML Structure', () => {
        
        test('must have complete HTML document structure', () => {
            const view = new ClusterUpgradeView(mockContext, mockSfRest);
            const response: sfModels.ClusterUpgradeProgressObject = {
                codeVersion: '11.3.365.1',
                upgradeState: 'RollingForwardCompleted',
                startTimestampUtc: '2026-02-01T10:00:00.000Z',
                isNodeByNode: false
            };
            
            const html = view.getHtmlContent(response, '11.3.365.1');
            
            // CRITICAL: Check for complete HTML structure
            const requiredTags = [
                { tag: '<!DOCTYPE html>', name: 'DOCTYPE declaration' },
                { tag: '<html>', name: 'opening html tag' },
                { tag: '</html>', name: 'closing html tag' },
                { tag: '<head>', name: 'opening head tag' },
                { tag: '</head>', name: 'closing head tag' },
                { tag: '<body>', name: 'opening body tag' },
                { tag: '</body>', name: 'closing body tag' },
                { tag: '<style>', name: 'opening style tag' },
                { tag: '</style>', name: 'closing style tag' }
            ];

            for (const { tag, name } of requiredTags) {
                assert.ok(
                    html.includes(tag),
                    `HTML must have ${name}. Missing: ${tag}`
                );
            }
        });

        test('must not contain unresolved template literals', () => {
            const view = new ClusterUpgradeView(mockContext, mockSfRest);
            const response: sfModels.ClusterUpgradeProgressObject = {
                codeVersion: '0.0.0.0',
                upgradeState: 'Invalid',
                isNodeByNode: false
            };
            
            const html = view.getHtmlContent(response);
            
            // CRITICAL: Template literals must be resolved
            assert.ok(
                !html.includes('${'),
                'HTML must not contain unresolved template literals like ${'
            );
            
            // Check for template expressions that leaked outside template literals (more specific)
            // This catches patterns like "} isCompleted ?" which indicate broken template syntax
            const brokenTemplatePattern = /}\s*(is[A-Z]|progress\.|const |let |var )/;
            assert.ok(
                !html.match(brokenTemplatePattern),
                'HTML must not have JavaScript expressions outside template literals'
            );
        });

        test('must have balanced div tags', () => {
            const view = new ClusterUpgradeView(mockContext, mockSfRest);
            const response: sfModels.ClusterUpgradeProgressObject = {
                codeVersion: '11.3.365.1',
                configVersion: 'v2',
                upgradeState: 'RollingForwardCompleted',
                upgradeDomains: [
                    { name: 'UD0', state: 'Completed' },
                    { name: 'UD1', state: 'Completed' }
                ],
                isNodeByNode: false
            };
            
            const html = view.getHtmlContent(response);
            
            const openDivs = (html.match(/<div/g) || []).length;
            const closeDivs = (html.match(/<\/div>/g) || []).length;
            
            assert.strictEqual(
                openDivs,
                closeDivs,
                `Unbalanced div tags: ${openDivs} open, ${closeDivs} close`
            );
        });

        test('must have balanced style tags', () => {
            const view = new ClusterUpgradeView(mockContext, mockSfRest);
            const response: sfModels.ClusterUpgradeProgressObject = {
                codeVersion: '11.3.365.1',
                upgradeState: 'RollingForwardCompleted',
                isNodeByNode: false
            };
            
            const html = view.getHtmlContent(response);
            
            const openStyles = (html.match(/<style>/g) || []).length;
            const closeStyles = (html.match(/<\/style>/g) || []).length;
            
            assert.strictEqual(
                openStyles,
                closeStyles,
                `Unbalanced style tags: ${openStyles} open, ${closeStyles} close`
            );
        });

        test('must not have style tag inside body', () => {
            const view = new ClusterUpgradeView(mockContext, mockSfRest);
            const response: sfModels.ClusterUpgradeProgressObject = {
                codeVersion: '11.3.365.1',
                upgradeState: 'RollingForwardCompleted',
                isNodeByNode: false
            };
            
            const html = view.getHtmlContent(response);
            
            // Extract body content
            const bodyMatch = html.match(/<body>([\s\S]*)<\/body>/);
            if (bodyMatch) {
                const bodyContent = bodyMatch[1];
                assert.ok(
                    !bodyContent.includes('<style>'),
                    'Style tags must be in <head>, not in <body>'
                );
                assert.ok(
                    !bodyContent.includes('</head>'),
                    'Head closing tag must come before body opening tag'
                );
            }
        });

        test('must contain expected CSS classes', () => {
            const view = new ClusterUpgradeView(mockContext, mockSfRest);
            const response: sfModels.ClusterUpgradeProgressObject = {
                codeVersion: '11.3.365.1',
                upgradeState: 'RollingForwardCompleted',
                upgradeDomains: [{ name: 'UD0', state: 'Completed' }],
                isNodeByNode: false
            };
            
            const html = view.getHtmlContent(response);
            
            const requiredClasses = [
                'info-grid',
                'label',
                'value',
                'status-badge',
                'ud-tile',
                'completed'
            ];

            for (const className of requiredClasses) {
                assert.ok(
                    html.includes(className),
                    `HTML must define CSS class: ${className}`
                );
            }
        });

        test('should validate HTML for all upgrade states', () => {
            const view = new ClusterUpgradeView(mockContext, mockSfRest);
            const states = [
                'RollingForwardCompleted',
                'RollingForwardInProgress',
                'RollingBackInProgress',
                'Failed',
                'Invalid'
            ];

            for (const state of states) {
                const response: sfModels.ClusterUpgradeProgressObject = {
                    codeVersion: state === 'Invalid' ? '0.0.0.0' : '11.3.365.1',
                    upgradeState: state as any,
                    startTimestampUtc: state === 'Invalid' ? '0001-01-01T00:00:00.000Z' : '2026-02-01T10:00:00.000Z',
                    isNodeByNode: false
                };
                
                const actualVersion = state === 'Invalid' ? '11.3.365.1' : undefined;
                const html = view.getHtmlContent(response, actualVersion);
                
                // Basic validation for each state
                assert.ok(html.includes('<!DOCTYPE html>'), `${state}: Missing DOCTYPE`);
                assert.ok(html.includes('</html>'), `${state}: Missing closing html tag`);
                assert.ok(!html.includes('${'), `${state}: Contains unresolved template literal`);
                
                // Verify actual version is shown even when upgrade API returns 0.0.0.0
                assert.ok(html.includes('11.3.365.1'), `${state}: Should show actual cluster version 11.3.365.1`);
            }
        });
    });

    describe('HTML Tag Validation Utility', () => {
        
        test('should detect missing closing tags', () => {
            const brokenHtml = '<html><head><style>body{}</style></head><body><div>Test</body></html>';
            
            const openDivs = (brokenHtml.match(/<div/g) || []).length;
            const closeDivs = (brokenHtml.match(/<\/div>/g) || []).length;
            
            assert.notStrictEqual(openDivs, closeDivs, 'Should detect unbalanced divs');
        });

        test('should detect unresolved template literals', () => {
            const brokenHtml = '<div>${someVariable}</div>';
            
            assert.ok(brokenHtml.includes('${'), 'Should detect unresolved template literal');
        });
    });
});
