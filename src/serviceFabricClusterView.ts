import * as vscode from 'vscode';
import { SFConfiguration } from './sfConfiguration';
import { SFUtility, debugLevel } from './sfUtility';
//import * as SfApi from './sdk/servicefabric/servicefabric/src/serviceFabricClientAPIs';
import * as sfModels from './sdk/servicefabric/servicefabric/src/models';


export class serviceFabricClusterView implements vscode.TreeDataProvider<TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined> = new vscode.EventEmitter<TreeItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined> = this._onDidChangeTreeData.event;

    private view: vscode.TreeView<TreeItem>;
    private tree: Array<TreeItem> = [];

    constructor(context: vscode.ExtensionContext) {
        this.view = vscode.window.createTreeView('serviceFabricClusterView', { treeDataProvider: this, showCollapseAll: true });
        //context.subscriptions.push(this.view);
        vscode.commands.registerCommand('serviceFabricClusterView.reveal', async () => {
            const key = await vscode.window.showInputBox({ placeHolder: 'Type the label of the item to reveal' });
            if (key) {
                await this.view.reveal(this.getTreeItem(new TreeItem(key)), { focus: true, select: false, expand: true });
                //await this.view.reveal({ key }, { focus: true, select: false, expand: true });
            }
        });
        vscode.commands.registerCommand('serviceFabricClusterView.changeTitle', async () => {
            const title = await vscode.window.showInputBox({ prompt: 'Type the new title for the Test View', placeHolder: this.view.title });
            if (title) {
                this.view.title = title;
            }
        });
    }

    public addTreeItem(treeItem: TreeItem): void {
        const existingItem = this.findTreeItem(treeItem); //todo test
        if (existingItem) {
            SFUtility.outputLog(`serviceFabricClusterView:addTreeItem:treeItem:${treeItem.label} exists. removing`, null, debugLevel.warn);
            this.removeTreeItem(treeItem);
        }

        SFUtility.outputLog(`serviceFabricClusterView:addTreeItem:treeItem:${treeItem.label}`);
        this.tree.push(treeItem);
        //this.refresh(treeItem);
        this.refresh();
    }

    private removeTreeItem(treeItem: TreeItem) {
        if (this.findTreeItem(treeItem)) {
            SFUtility.outputLog(`serviceFabricClusterView:addTreeItem:treeItem:${treeItem.label} exists. removing`);
            //todo test
            this.tree.splice(this.tree.findIndex((item: TreeItem) => item.label === treeItem.label), 1);
        }
        else {
            SFUtility.outputLog(`serviceFabricClusterView:addTreeItem:treeItem:${treeItem.label} does not exist`, null, debugLevel.warn);
        }
    }

    private findTreeItem(treeItem: TreeItem): TreeItem | undefined | null {
        const results = this.tree.find((item: TreeItem) => item.label === treeItem.label);
        SFUtility.outputLog(`serviceFabricClusterView:findTreeItem:treeItem:${treeItem.label} results:${results}`);
        return results;
    }

    public getChildren(element?: TreeItem): vscode.ProviderResult<TreeItem[]> {
        if (element === undefined) {
            return this.tree;
        }
        return element.children;
    }

    public getTreeItem(element: TreeItem): TreeItem { //| Thenable<TreeItem> {
        return element;
    }

    public refresh(treeItem?: TreeItem): void {
        if (treeItem) {
            //todo may not work
            this._onDidChangeTreeData.fire(treeItem);
        } else {
            this._onDidChangeTreeData.fire(undefined);
        }
    }
}

export class TreeItem extends vscode.TreeItem {
    children: TreeItem[] = [];
    sfConfig?: SFConfiguration;

    constructor(label: string, children?: sfModels.NodeInfo[] | TreeItem[], sfConfig?: SFConfiguration) {
        super(label, children === undefined ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Expanded);
        this.sfConfig = sfConfig;
        
        if (children && <sfModels.NodeInfo[]>children !== undefined) {
            if (label.toLocaleLowerCase() === 'nodes') {
                for (const child of children) {
                    this.children.push(new TreeItem((<sfModels.NodeInfo>child).name ?? 'undefined', undefined, sfConfig));
                }
            }
            else{
                this.children = [new TreeItem('nodes', children, sfConfig)];
            }
        }
        else if (children && <TreeItem[]>children !== undefined) {
            this.children = (children as TreeItem[]) ?? [];
        }
    }
}
