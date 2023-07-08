'use strict';

//import { WebSiteManagementClient } from '@azure/arm-appservice';

// import { ResourceManagementClient } from '@azure/arm-resources';
// import { SubscriptionClient } from '@azure/arm-subscriptions';

// import { apiUtils } from '@microsoft/vscode-azext-utils';

//import { commands, ExtensionContext, extensions, QuickPickItem, window } from 'vscode';

//import { AzureAccountExtensionApi, AzureSession } from '../azure-account.api'; // Other extensions need to copy this .d.ts to their repository.
//const apiUtils = require('@microsoft/vscode-azext-utils');
//const accountApi = require('../azure-account.api');
//const vscode = require('vscode');
import * as vscode from 'vscode';
import { SFRest } from './sfRest';
import { DepNodeProvider, Dependency } from './nodeDependencies';
import { JsonOutlineProvider } from './jsonOutline';
import { FtpExplorer } from './ftpExplorer';
import { FileExplorer } from './fileExplorer';
import { serviceFabricClusterViewDragAndDrop } from './serviceFabricClusterViewDragAndDrop';
import { serviceFabricClusterView } from './serviceFabricClusterView';

export async function activate(context: vscode.ExtensionContext) {
    const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
        ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
    

    // Samples of `window.registerTreeDataProvider`
    const nodeDependenciesProvider = new DepNodeProvider(rootPath);
    vscode.window.registerTreeDataProvider('nodeDependencies', nodeDependenciesProvider);
    //    vscode.commands.registerCommand('nodeDependencies.sfcluster', () => sfRest.getClusters());
    vscode.commands.registerCommand('nodeDependencies.refreshEntry', () => nodeDependenciesProvider.refresh());
    vscode.commands.registerCommand('extension.openPackageOnNpm', moduleName => vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`https://www.npmjs.com/package/${moduleName}`)));
    vscode.commands.registerCommand('nodeDependencies.addEntry', () => vscode.window.showInformationMessage(`Successfully called add entry.`));
    vscode.commands.registerCommand('nodeDependencies.editEntry', (node: Dependency) => vscode.window.showInformationMessage(`Successfully called edit entry on ${node.label}.`));
    vscode.commands.registerCommand('nodeDependencies.deleteEntry', (node: Dependency) => vscode.window.showInformationMessage(`Successfully called delete entry on ${node.label}.`));

    const jsonOutlineProvider = new JsonOutlineProvider(context);
    vscode.window.registerTreeDataProvider('jsonOutline', jsonOutlineProvider);
    const sfRest = new SFRest(context);
    registerCommand(context, 'jsonOutline.sfClusterTest', () => sfRest.getClusters());
    vscode.commands.registerCommand('jsonOutline.refresh', () => jsonOutlineProvider.refresh());
    vscode.commands.registerCommand('jsonOutline.refreshNode', offset => jsonOutlineProvider.refresh(offset));
    vscode.commands.registerCommand('jsonOutline.renameNode', args => {
        let offset = undefined;
        if (args.selectedTreeItems && args.selectedTreeItems.length) {
            offset = args.selectedTreeItems[0];
        } else if (typeof args === 'number') {
            offset = args;
        }
        if (offset) {
            jsonOutlineProvider.rename(offset);
        }
    });
    vscode.commands.registerCommand('extension.openJsonSelection', range => jsonOutlineProvider.select(range));

    // Samples of `window.createView`
    new FtpExplorer(context);
    new FileExplorer(context);

    // Test View
    new serviceFabricClusterView(context);

    new serviceFabricClusterViewDragAndDrop(context);
}

function registerCommand(context: vscode.ExtensionContext, command: string, callback: (...args: any[]) => any, thisArg?: any): void {
    context.subscriptions.push(vscode.commands.registerCommand(command, callback, thisArg));
}

// interface SubscriptionItem {
//     label: string;
//     description: string;
//     session: AzureSession;
//     subscription: SubscriptionModels.Subscription;
// }

// function showSubscriptions(api: AzureAccountExtensionApi) {
//     return async () => {
//         if (!(await api.waitForLogin())) {
//             return commands.executeCommand('azure-account.askForLogin');
//         }
//         const subscriptionItems = loadSubscriptionItems(api);
//         const result = await window.showQuickPick(subscriptionItems);
//         if (result) {
//             const resourceGroupItems = loadResourceGroupItems(result);
//             await window.showQuickPick(resourceGroupItems);
//         }
//     };
// }

// async function loadSubscriptionItems(api: AzureAccountExtensionApi) {
//     await api.waitForFilters();
//     const subscriptionItems: SubscriptionItem[] = [];
//     for (const session of api.sessions) {
//         const credentials = session.credentials2;
//         const subscriptionClient = new SubscriptionClient(credentials);
//         const subscriptions = await listAll(subscriptionClient.subscriptions, subscriptionClient.subscriptions.list());
//         subscriptionItems.push(...subscriptions.map(subscription => ({
// // @ts-ignore - no types
//             label: subscription.displayName || '',
//             // @ts-ignore - no types
//             description: subscription.subscriptionId || '',
//             session,
//             subscription
//         })));
//     }
//     subscriptionItems.sort((a, b) => a.label.localeCompare(b.label));
//     return subscriptionItems;
// }

// async function loadResourceGroupItems(subscriptionItem: SubscriptionItem) {
//     const { session, subscription } = subscriptionItem;

//     const resources = new ResourceManagementClient(session.credentials2, subscription.subscriptionId!);
//     const resourceGroups = await listAll(resources.resourceGroups, resources.resourceGroups.list());
//     // @ts-ignore - no types
//     resourceGroups.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
//     return resourceGroups.map(resourceGroup => ({
//         // @ts-ignore - no types
//         label: resourceGroup.name || '',
//         // @ts-ignore - no types
//         description: resourceGroup.location,
//         resourceGroup
//     }));
// }

// export interface PartialList<T> extends Array<T> {
//     nextLink?: string;
// }

// async function listAll<T>(client: { listNext(nextPageLink: string): Promise<PartialList<T>>; }, first: Promise<PartialList<T>>): Promise<T[]> {
//     const all: T[] = [];
//     for (let list = await first; list.length || list.nextLink; list = list.nextLink ? await client.listNext(list.nextLink) : []) {
//         all.push(...list);
//     }
//     return all;
// }

