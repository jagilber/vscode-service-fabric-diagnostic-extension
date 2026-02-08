/**
 * ClusterDecorationProvider Tests
 *
 * Verifies:
 * 1. buildUri() creates sf-cluster:// URIs from cluster endpoints
 * 2. provideFileDecoration() returns yellow color for active cluster
 * 3. provideFileDecoration() returns undefined for inactive clusters
 * 4. provideFileDecoration() ignores non-sf-cluster URIs
 * 5. setActive() fires onDidChangeFileDecorations for old and new endpoints
 * 6. setActive(undefined) clears active state
 */

import * as vscode from 'vscode';
import { ClusterDecorationProvider } from '../../../src/treeview/ClusterDecorationProvider';

describe('ClusterDecorationProvider', () => {
    let provider: ClusterDecorationProvider;

    beforeEach(() => {
        provider = new ClusterDecorationProvider();
    });

    afterEach(() => {
        provider.dispose();
    });

    describe('buildUri()', () => {
        it('should create a URI with sf-cluster scheme', () => {
            const uri = ClusterDecorationProvider.buildUri('https://my-cluster:19080');
            expect(uri.scheme).toBe('sf-cluster');
        });

        it('should encode the endpoint in the authority', () => {
            const endpoint = 'https://my-cluster:19080';
            const uri = ClusterDecorationProvider.buildUri(endpoint);
            expect(decodeURIComponent(uri.authority)).toBe(endpoint);
        });

        it('should produce consistent URIs for the same endpoint', () => {
            const uri1 = ClusterDecorationProvider.buildUri('https://cluster-a:19080');
            const uri2 = ClusterDecorationProvider.buildUri('https://cluster-a:19080');
            expect(uri1.toString()).toBe(uri2.toString());
        });

        it('should produce different URIs for different endpoints', () => {
            const uri1 = ClusterDecorationProvider.buildUri('https://cluster-a:19080');
            const uri2 = ClusterDecorationProvider.buildUri('https://cluster-b:19080');
            expect(uri1.toString()).not.toBe(uri2.toString());
        });
    });

    describe('provideFileDecoration()', () => {
        it('should return undefined when no active cluster is set', () => {
            const uri = ClusterDecorationProvider.buildUri('https://cluster:19080');
            const decoration = provider.provideFileDecoration(uri);
            expect(decoration).toBeUndefined();
        });

        it('should return yellow decoration for the active cluster', () => {
            const endpoint = 'https://cluster:19080';
            provider.setActive(endpoint);

            const uri = ClusterDecorationProvider.buildUri(endpoint);
            const decoration = provider.provideFileDecoration(uri);

            expect(decoration).toBeDefined();
            expect(decoration!.color).toBeInstanceOf(vscode.ThemeColor);
            expect((decoration!.color as vscode.ThemeColor).id).toBe('charts.yellow');
            expect(decoration!.tooltip).toBe('Active cluster');
        });

        it('should return undefined for non-active clusters', () => {
            provider.setActive('https://cluster-a:19080');

            const uri = ClusterDecorationProvider.buildUri('https://cluster-b:19080');
            const decoration = provider.provideFileDecoration(uri);
            expect(decoration).toBeUndefined();
        });

        it('should return undefined for non-sf-cluster scheme URIs', () => {
            provider.setActive('https://cluster:19080');

            const fileUri = vscode.Uri.parse('file:///some/path');
            const decoration = provider.provideFileDecoration(fileUri);
            expect(decoration).toBeUndefined();
        });

        it('should return undefined after active cluster is cleared', () => {
            const endpoint = 'https://cluster:19080';
            provider.setActive(endpoint);
            provider.setActive(undefined);

            const uri = ClusterDecorationProvider.buildUri(endpoint);
            const decoration = provider.provideFileDecoration(uri);
            expect(decoration).toBeUndefined();
        });
    });

    describe('setActive()', () => {
        it('should fire onDidChangeFileDecorations when setting active', () => {
            const fireFn = (provider as any)._onDidChangeFileDecorations.fire;
            fireFn.mockClear();

            provider.setActive('https://cluster:19080');

            expect(fireFn).toHaveBeenCalledTimes(1);
            const fired = fireFn.mock.calls[0][0] as vscode.Uri[];
            expect(fired).toHaveLength(1);
        });

        it('should fire for both old and new endpoints when switching', () => {
            provider.setActive('https://cluster-a:19080');

            const fireFn = (provider as any)._onDidChangeFileDecorations.fire;
            fireFn.mockClear();
            provider.setActive('https://cluster-b:19080');

            expect(fireFn).toHaveBeenCalledTimes(1);
            const fired = fireFn.mock.calls[0][0] as vscode.Uri[];
            // Should fire for both old (cluster-a) and new (cluster-b)
            expect(fired).toHaveLength(2);
        });

        it('should not fire when setting same endpoint again', () => {
            provider.setActive('https://cluster:19080');

            const fireFn = (provider as any)._onDidChangeFileDecorations.fire;
            fireFn.mockClear();
            provider.setActive('https://cluster:19080');

            // Same endpoint — only fires for that one URI (no old+new difference)
            expect(fireFn).toHaveBeenCalledTimes(1);
            const fired = fireFn.mock.calls[0][0] as vscode.Uri[];
            expect(fired).toHaveLength(1);
        });

        it('should fire for old endpoint when clearing active', () => {
            provider.setActive('https://cluster:19080');

            const fireFn = (provider as any)._onDidChangeFileDecorations.fire;
            fireFn.mockClear();
            provider.setActive(undefined);

            expect(fireFn).toHaveBeenCalledTimes(1);
            const fired = fireFn.mock.calls[0][0] as vscode.Uri[];
            expect(fired).toHaveLength(1);
        });

        it('should not fire when clearing with no previous active', () => {
            const fireFn = (provider as any)._onDidChangeFileDecorations.fire;
            fireFn.mockClear();
            provider.setActive(undefined);

            expect(fireFn).not.toHaveBeenCalled();
        });
    });
});
