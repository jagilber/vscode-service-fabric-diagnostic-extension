/**
 * Snapshot exporter — serialises a tree item and writes it to disk.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { SfUtility, debugLevel } from '../../sfUtility';
import { serializeTreeItem } from './ReportUtils';

export async function exportSnapshot(
    context: vscode.ExtensionContext,
    item: any,
): Promise<void> {
    if (!item) {
        SfUtility.showWarning('No item selected for snapshot export');
        return;
    }
    const itemLabel = item.label || 'unknown';
    const itemType = item.itemType || 'item';
    const clusterEndpoint = item.clusterEndpoint || 'unknown-cluster';

    const snapshot = serializeTreeItem(item);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const safeName = itemLabel.replace(/[^a-zA-Z0-9-_]/g, '_');
    const fileName = `snapshot-${itemType}-${safeName}-${timestamp}.json`;
    const clusterName = clusterEndpoint.replace(/[^a-zA-Z0-9]/g, '_');
    const dirPath = path.join(context.globalStorageUri.fsPath, clusterName, 'snapshots');
    await vscode.workspace.fs.createDirectory(vscode.Uri.file(dirPath));

    const filePath = path.join(dirPath, fileName);
    await vscode.workspace.fs.writeFile(
        vscode.Uri.file(filePath),
        new TextEncoder().encode(JSON.stringify(snapshot, null, 2)),
    );

    SfUtility.outputLog(`Snapshot saved to: ${filePath}`, null, debugLevel.info);
    const choice = await vscode.window.showInformationMessage(`Snapshot saved: ${fileName}`, 'Open', 'Show in Folder');
    if (choice === 'Open') {
        const doc = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(doc, { preview: false });
    } else if (choice === 'Show in Folder') {
        await vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(filePath));
    }
}
