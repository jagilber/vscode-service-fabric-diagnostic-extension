import { SfTreeDataProvider } from './SfTreeDataProvider';
import { IClusterTreeView } from './IClusterTreeView';
import { SfConfiguration } from '../sfConfiguration';
import { SfRest } from '../sfRest';

/**
 * Adapter that wraps the new SfTreeDataProvider to conform to
 * the IClusterTreeView interface used by SfMgr.
 * 
 * This allows SfMgr to remain unchanged — it calls the same methods
 * regardless of whether the old or new tree view is active.
 */
export class SfTreeDataProviderAdapter implements IClusterTreeView {
    constructor(private readonly provider: SfTreeDataProvider) {}

    refresh(): void {
        this.provider.refresh();
    }

    hasClusterInTree(endpoint: string): boolean {
        return this.provider.hasCluster(endpoint);
    }

    setActiveCluster(endpoint: string): void {
        this.provider.setActiveCluster(endpoint);
    }

    removeClusterFromTree(endpoint: string): void {
        this.provider.removeCluster(endpoint);
    }

    restartAutoRefresh(): void {
        this.provider.restartAutoRefresh();
    }

    dispose(): void {
        this.provider.dispose();
    }

    addClusterToTree(sfConfig: SfConfiguration, sfRest: SfRest): void {
        this.provider.addCluster(sfConfig, sfRest);
    }

    updateClusterInTree(endpoint: string, _sfConfig: SfConfiguration): void {
        // NOTE: Do NOT call this.provider.refresh() here.
        // populateClusterInBackground() fetches health FIRST, then calls refresh().
        // Calling refresh() prematurely would render clusters without health data (plain icons).

        // Eagerly populate group node data in background (nodes, apps, system)
        // so labels update from "(…)" to "(N)" without waiting for user to expand.
        this.provider.populateClusterInBackground(endpoint).catch(err => {
            // Non-fatal: tree will still work, user can expand nodes manually
            console.warn('Background population failed:', err);
        });
    }

    setRefreshCallback?(_callback: () => Promise<void>): void {
        // New provider handles auto-refresh internally via RefreshManager.
        // No external callback needed.
    }
}
