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
        // New provider doesn't need explicit tree item updates —
        // the node re-reads from SfConfiguration on next refresh.
        this.provider.refresh();
    }

    setRefreshCallback?(_callback: () => Promise<void>): void {
        // New provider handles auto-refresh internally via RefreshManager.
        // No external callback needed.
    }
}
