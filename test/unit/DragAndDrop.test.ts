/**
 * Unit tests for serviceFabricClusterViewDragAndDrop
 */
import * as vscode from 'vscode';
import { serviceFabricClusterViewDragAndDrop } from '../../src/serviceFabricClusterViewDragAndDrop';

describe('serviceFabricClusterViewDragAndDrop', () => {
    let provider: serviceFabricClusterViewDragAndDrop;
    let mockContext: vscode.ExtensionContext;

    beforeEach(() => {
        jest.clearAllMocks();
        mockContext = new (vscode as any).ExtensionContext();
        provider = new serviceFabricClusterViewDragAndDrop(mockContext);
    });

    test('should construct successfully', () => {
        expect(provider).toBeDefined();
    });

    test('should have tree property', () => {
        expect(provider.tree).toBeDefined();
        expect(provider.tree['a']).toBeDefined();
        expect(provider.tree['b']).toBeDefined();
    });

    test('should have dropMimeTypes', () => {
        expect(provider.dropMimeTypes).toContain('application/vnd.code.tree.serviceFabricClusterViewDragAndDrop');
    });

    test('should have dragMimeTypes', () => {
        expect(provider.dragMimeTypes).toContain('text/uri-list');
    });

    describe('getChildren', () => {
        test('should return root children when no element', () => {
            const children = provider.getChildren(undefined as any);
            expect(children.length).toBeGreaterThan(0);
        });

        test('should return child nodes for element', () => {
            const roots = provider.getChildren(undefined as any);
            const aNode = roots.find((n: any) => n.key === 'a')!;
            const children = provider.getChildren(aNode);
            expect(children.length).toBe(2); // 'aa' and 'ab'
        });

        test('should return empty for leaf node', () => {
            const roots = provider.getChildren(undefined as any);
            const aNode = roots.find((n: any) => n.key === 'a')!;
            const aChildren = provider.getChildren(aNode);
            const abNode = aChildren.find((n: any) => n.key === 'ab')!;
            const children = provider.getChildren(abNode);
            expect(children.length).toBe(0);
        });
    });

    describe('getTreeItem', () => {
        test('should return tree item for node', () => {
            const children = provider.getChildren(undefined as any);
            expect(children.length).toBeGreaterThan(0);
            const item = provider.getTreeItem(children[0]);
            expect(item).toBeDefined();
            expect(item.id).toBeDefined();
        });

        test('should have collapsed state for nodes with children', () => {
            const roots = provider.getChildren(undefined as any);
            const aNode = roots.find((n: any) => n.key === 'a')!;
            const item = provider.getTreeItem(aNode);
            expect(item.collapsibleState).toBe(vscode.TreeItemCollapsibleState.Collapsed);
        });

        test('should have none state for leaf nodes', () => {
            const roots = provider.getChildren(undefined as any);
            const aNode = roots.find((n: any) => n.key === 'a')!;
            const aChildren = provider.getChildren(aNode);
            const abNode = aChildren.find((n: any) => n.key === 'ab')!;
            const item = provider.getTreeItem(abNode);
            expect(item.collapsibleState).toBe(vscode.TreeItemCollapsibleState.None);
        });

        test('should set tooltip as MarkdownString', () => {
            const roots = provider.getChildren(undefined as any);
            const item = provider.getTreeItem(roots[0]);
            expect(item.tooltip).toBeDefined();
        });
    });

    describe('getParent', () => {
        test('should return parent node', () => {
            const roots = provider.getChildren(undefined as any);
            const aNode = roots.find((n: any) => n.key === 'a')!;
            const aChildren = provider.getChildren(aNode);
            const aaNode = aChildren.find((n: any) => n.key === 'aa')!;
            const parent = provider.getParent(aaNode);
            expect(parent).toBeDefined();
            expect(parent.key).toBe('a');
        });

        test('should return undefined for root nodes', () => {
            const roots = provider.getChildren(undefined as any);
            const parent = provider.getParent(roots[0]);
            expect(parent).toBeUndefined();
        });
    });

    describe('handleDrag', () => {
        test('should set data transfer item', async () => {
            const roots = provider.getChildren(undefined as any);
            const dataTransfer = new vscode.DataTransfer();
            const token = { isCancellationRequested: false, onCancellationRequested: jest.fn() };
            await provider.handleDrag(roots, dataTransfer, token as any);
            const item = dataTransfer.get('application/vnd.code.tree.serviceFabricClusterViewDragAndDrop');
            expect(item).toBeDefined();
        });
    });

    describe('handleDrop', () => {
        test('should do nothing when no transfer item', async () => {
            const dataTransfer = new vscode.DataTransfer();
            const token = { isCancellationRequested: false, onCancellationRequested: jest.fn() };
            await provider.handleDrop(undefined, dataTransfer, token as any);
            // Should not throw
        });

        test('should reparent node on valid drop', async () => {
            const roots = provider.getChildren(undefined as any);
            const bNode = roots.find((n: any) => n.key === 'b')!;
            const bChildren = provider.getChildren(bNode);
            const baNode = bChildren.find((n: any) => n.key === 'ba')!;

            const dataTransfer = new vscode.DataTransfer();
            dataTransfer.set(
                'application/vnd.code.tree.serviceFabricClusterViewDragAndDrop',
                new vscode.DataTransferItem([baNode])
            );
            const token = { isCancellationRequested: false, onCancellationRequested: jest.fn() };

            const aNode = roots.find((n: any) => n.key === 'a')!;
            await provider.handleDrop(aNode, dataTransfer, token as any);

            // 'ba' should now be under 'a'
            const aChildrenAfter = provider.getChildren(aNode);
            const baUnderA = aChildrenAfter.find((n: any) => n.key === 'ba');
            expect(baUnderA).toBeDefined();
        });
    });

    describe('_isChild', () => {
        test('should return true for direct child', () => {
            const treeElement = provider._getTreeElement('a');
            const aaNode = { key: 'aa' };
            expect(provider._isChild(treeElement, aaNode)).toBe(true);
        });

        test('should return true for nested child', () => {
            const treeElement = provider._getTreeElement('a');
            const aaaaNode = { key: 'aaaa' };
            expect(provider._isChild(treeElement, aaaaNode)).toBe(true);
        });

        test('should return false for non-child', () => {
            const treeElement = provider._getTreeElement('a');
            const bNode = { key: 'ba' };
            expect(provider._isChild(treeElement, bNode)).toBe(false);
        });

        test('should return false for undefined child', () => {
            const treeElement = provider._getTreeElement('a');
            expect(provider._isChild(treeElement, undefined)).toBe(false);
        });
    });

    describe('_getLocalRoots', () => {
        test('should filter out children of provided nodes', () => {
            const aNode = provider._getNode('a');
            const aaNode = provider._getNode('aa');
            const bNode = provider._getNode('b');
            const roots = provider._getLocalRoots([aNode, aaNode, bNode]);
            // 'aa' is child of 'a', so only 'a' and 'b' should be roots
            expect(roots.length).toBe(2);
            expect(roots.map((r: any) => r.key)).toContain('a');
            expect(roots.map((r: any) => r.key)).toContain('b');
        });
    });

    describe('_getChildren', () => {
        test('should return root keys when no key', () => {
            const children = provider._getChildren(undefined);
            expect(children).toContain('a');
            expect(children).toContain('b');
        });

        test('should return child keys for valid key', () => {
            const children = provider._getChildren('b');
            expect(children).toContain('ba');
            expect(children).toContain('bb');
        });

        test('should return empty for nonexistent key', () => {
            const children = provider._getChildren('nonexistent');
            expect(children).toEqual([]);
        });
    });

    describe('_getTreeElement', () => {
        test('should return whole tree when no element', () => {
            const tree = provider._getTreeElement(undefined);
            expect(tree).toBe(provider.tree);
        });

        test('should return subtree for valid element', () => {
            const element = provider._getTreeElement('b');
            expect(element).toBeDefined();
            expect(Object.keys(element)).toContain('ba');
            expect(Object.keys(element)).toContain('bb');
        });

        test('should return undefined for nonexistent element', () => {
            const element = provider._getTreeElement('xyz');
            expect(element).toBeUndefined();
        });
    });

    describe('dispose', () => {
        test('should not throw', () => {
            provider.dispose();
        });
    });
});
