import { serviceFabricClusterView } from '../serviceFabricClusterView';
import { IClusterTreeView } from './IClusterTreeView';
import { SfConfiguration } from '../sfConfiguration';
import { SfRest } from '../sfRest';

/**
 * Adapter that wraps the legacy serviceFabricClusterView to conform to
 * the IClusterTreeView interface used by SfMgr.
 * 
 * This bridges the old API (addTreeItem/setSfRest/updateTreeItem)
 * to the unified IClusterTreeView interface.
 */
export class LegacyTreeViewAdapter implements IClusterTreeView {
    constructor(private readonly view: serviceFabricClusterView) {}

    /** Expose the underlying legacy view for any direct access still needed. */
    get legacyView(): serviceFabricClusterView {
        return this.view;
    }

    refresh(): void {
        this.view.refresh();
    }

    hasClusterInTree(endpoint: string): boolean {
        return this.view.hasClusterInTree(endpoint);
    }

    setActiveCluster(endpoint: string): void {
        this.view.setActiveCluster(endpoint);
    }

    removeClusterFromTree(endpoint: string): void {
        this.view.removeClusterFromTree(endpoint);
    }

    restartAutoRefresh(): void {
        this.view.restartAutoRefresh();
    }

    dispose(): void {
        this.view.dispose();
    }

    addClusterToTree(sfConfig: SfConfiguration, sfRest: SfRest): void {
        const treeItem = sfConfig.createClusterViewTreeItem();
        this.view.addTreeItem(treeItem, sfConfig);
        this.view.setSfRest(sfRest);
    }

    updateClusterInTree(endpoint: string, sfConfig: SfConfiguration): void {
        const treeItem = sfConfig.createClusterViewTreeItem();
        this.view.updateTreeItem(endpoint, treeItem);
    }

    setRefreshCallback(callback: () => Promise<void>): void {
        this.view.setRefreshCallback(callback);
    }
}
