import { SfConfiguration } from '../sfConfiguration';
import { SfRest } from '../sfRest';

/**
 * Adapter interface for cluster tree view implementations.
 * Both the legacy `serviceFabricClusterView` and the new `SfTreeDataProvider`
 * conform to this interface, allowing the feature flag to switch between them.
 */
export interface IClusterTreeView {
    /** Refresh the tree view (optionally scoped). */
    refresh(): void;

    /** Check if a cluster endpoint is in the tree. */
    hasClusterInTree(endpoint: string): boolean;

    /** Set the active cluster indicator. */
    setActiveCluster(endpoint: string): void;

    /** Remove a cluster from the tree view. */
    removeClusterFromTree(endpoint: string): void;

    /** Restart the auto-refresh timer. */
    restartAutoRefresh(): void;

    /** Update auto-refresh disabled state on a cluster node. */
    setClusterRefreshDisabled(endpoint: string, disabled: boolean): void;

    /** Dispose of resources. */
    dispose(): void;

    /**
     * Add a cluster to the tree.
     * Old provider: call addTreeItem + setSfRest separately.
     * New provider: single addCluster call.
     */
    addClusterToTree(sfConfig: SfConfiguration, sfRest: SfRest): void;

    /**
     * Update a cluster in the tree after connection success/failure.
     * Old provider: call updateTreeItem.
     * New provider: calls refresh (data flows via SfConfiguration).
     */
    updateClusterInTree(endpoint: string, sfConfig: SfConfiguration): void;

    /**
     * Optional: set a refresh callback for auto-refresh.
     * Used by legacy provider. New provider handles this internally.
     */
    setRefreshCallback?(callback: () => Promise<void>): void;
}
