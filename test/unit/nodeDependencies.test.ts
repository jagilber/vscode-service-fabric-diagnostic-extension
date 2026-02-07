/**
 * Unit tests for nodeDependencies (DepNodeProvider)
 */
import * as vscode from 'vscode';
jest.mock('fs');

import { DepNodeProvider, Dependency } from '../../src/nodeDependencies';

describe('DepNodeProvider', () => {
    let provider: DepNodeProvider;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should construct with workspace root', () => {
        provider = new DepNodeProvider('/mock/workspace');
        expect(provider).toBeDefined();
    });

    test('should construct without workspace root', () => {
        provider = new DepNodeProvider(undefined);
        expect(provider).toBeDefined();
    });

    describe('getChildren', () => {
        test('should return empty array when no workspace root', async () => {
            provider = new DepNodeProvider(undefined);
            const children = await provider.getChildren();
            expect(children).toEqual([]);
        });

        test('should return empty when package.json not found', async () => {
            const fs = require('fs');
            // pathExists uses fs.accessSync — throw to simulate missing file
            fs.accessSync.mockImplementation(() => { throw new Error('ENOENT'); });
            provider = new DepNodeProvider('/mock/workspace');
            const children = await provider.getChildren();
            expect(children).toEqual([]);
        });

        test('should parse package.json dependencies', async () => {
            const fs = require('fs');
            // accessSync succeeds (file exists), readFileSync returns valid JSON
            fs.accessSync.mockImplementation(() => undefined);
            fs.readFileSync.mockReturnValue(JSON.stringify({
                dependencies: { 'lodash': '^4.17.0' },
                devDependencies: { 'jest': '^29.0.0' },
            }));
            provider = new DepNodeProvider('/mock/workspace');
            const children = await provider.getChildren();
            expect(children.length).toBe(2);
        });
    });

    describe('getTreeItem', () => {
        test('should return the element as tree item', () => {
            provider = new DepNodeProvider('/mock/workspace');
            const dep = new Dependency('lodash', '4.17.0', vscode.TreeItemCollapsibleState.Collapsed);
            const item = provider.getTreeItem(dep);
            expect(item).toBe(dep);
        });
    });

    describe('refresh', () => {
        test('should not throw', () => {
            provider = new DepNodeProvider('/mock/workspace');
            provider.refresh();
        });
    });
});

describe('Dependency', () => {
    test('should construct with label and version', () => {
        const dep = new Dependency('lodash', '4.17.0', vscode.TreeItemCollapsibleState.None);
        expect(dep.label).toBe('lodash');
        expect(dep.description).toBe('4.17.0');
    });
});
