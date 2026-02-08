import * as vscode from 'vscode';

/**
 * FileDecorationProvider that highlights the active cluster root node
 * with a yellow label color in the tree view.
 * 
 * Only decorates URIs with the 'sf-cluster' scheme, so it won't
 * affect file explorer or other tree views.
 */
export class ClusterDecorationProvider implements vscode.FileDecorationProvider {
    private readonly _onDidChangeFileDecorations = new vscode.EventEmitter<vscode.Uri | vscode.Uri[] | undefined>();
    readonly onDidChangeFileDecorations = this._onDidChangeFileDecorations.event;

    private activeEndpoint: string | undefined;

    /**
     * Build a sf-cluster:// URI for a given cluster endpoint.
     * This URI is set as `resourceUri` on ClusterNode tree items
     * so the decoration provider can target them.
     */
    static buildUri(endpoint: string): vscode.Uri {
        return vscode.Uri.parse(`sf-cluster://${encodeURIComponent(endpoint)}`);
    }

    /**
     * Update which cluster is active. Fires decoration change events
     * for both the old and new active endpoints so VS Code re-queries them.
     */
    setActive(endpoint: string | undefined): void {
        const previousEndpoint = this.activeEndpoint;
        this.activeEndpoint = endpoint;

        const changed: vscode.Uri[] = [];
        if (previousEndpoint) {
            changed.push(ClusterDecorationProvider.buildUri(previousEndpoint));
        }
        if (endpoint && endpoint !== previousEndpoint) {
            changed.push(ClusterDecorationProvider.buildUri(endpoint));
        }
        if (changed.length > 0) {
            this._onDidChangeFileDecorations.fire(changed);
        }
    }

    provideFileDecoration(uri: vscode.Uri): vscode.FileDecoration | undefined {
        if (uri.scheme !== 'sf-cluster') {
            return undefined;
        }

        const endpoint = decodeURIComponent(uri.authority);
        if (endpoint === this.activeEndpoint) {
            return {
                color: new vscode.ThemeColor('charts.yellow'),
                tooltip: 'Active cluster',
            };
        }

        return undefined;
    }

    dispose(): void {
        this._onDidChangeFileDecorations.dispose();
    }
}
