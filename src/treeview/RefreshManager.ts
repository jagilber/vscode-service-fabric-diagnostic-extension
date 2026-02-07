import * as vscode from 'vscode';
import { ITreeNode } from './ITreeNode';
import { sfExtSettingsList, SfExtSettings } from '../sfExtSettings';
import { SfUtility, debugLevel } from '../sfUtility';

/**
 * Manages debounced tree refresh and auto-refresh timer.
 * 
 * CRITICAL: Enforces the VS Code icon rendering constraint —
 * StaticItemNodes are never individually refreshed via fire().
 * See docs/ICON_RENDERING_BUG.md.
 */
export class RefreshManager {
    private debounceTimer: NodeJS.Timeout | undefined;
    private autoRefreshTimer: NodeJS.Timeout | undefined;
    private invalidateCallback: (() => void) | undefined;

    constructor(
        private readonly emitter: vscode.EventEmitter<ITreeNode | undefined | void>,
        private readonly debounceMs: number = 100,
    ) {}

    /**
     * Debounced refresh. Batches multiple calls within debounceMs window.
     * 
     * @param node Specific node to refresh, or undefined for full tree.
     *             StaticItemNodes are automatically promoted to parent/full refresh.
     */
    refresh(node?: ITreeNode): void {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = setTimeout(() => {
            // CRITICAL: Check if this is a static item — promote to full refresh
            if (node && isStaticItem(node.itemType)) {
                SfUtility.outputLog(
                    `RefreshManager: promoting static item '${node.itemType}' to full refresh (icon bug prevention)`,
                    null, debugLevel.debug,
                );
                this.emitter.fire(undefined);
            } else {
                this.emitter.fire(node as any);
            }
            this.debounceTimer = undefined;
        }, this.debounceMs);
    }

    /**
     * Start auto-refresh cycle based on extension settings.
     */
    startAutoRefresh(invalidateCallback: () => void): void {
        if (this.autoRefreshTimer) { return; }
        this.invalidateCallback = invalidateCallback;

        const enabled = SfExtSettings.getSetting(sfExtSettingsList.autorefresh) as boolean;
        if (!enabled) {
            SfUtility.outputLog('RefreshManager: auto-refresh disabled in settings', null, debugLevel.info);
            return;
        }

        const intervalMs = (SfExtSettings.getSetting(sfExtSettingsList.refreshInterval) as number) || 30000;
        SfUtility.outputLog(`RefreshManager: starting auto-refresh (${intervalMs}ms)`, null, debugLevel.info);

        this.autoRefreshTimer = setInterval(() => {
            SfUtility.outputLog('RefreshManager: auto-refresh tick', null, debugLevel.debug);
            try {
                this.invalidateCallback?.();
                this.emitter.fire(undefined);
            } catch (err) {
                SfUtility.outputLog('RefreshManager: auto-refresh error', err, debugLevel.error);
            }
        }, intervalMs);
    }

    /**
     * Stop auto-refresh timer.
     */
    stopAutoRefresh(): void {
        if (this.autoRefreshTimer) {
            clearInterval(this.autoRefreshTimer);
            this.autoRefreshTimer = undefined;
            SfUtility.outputLog('RefreshManager: auto-refresh stopped', null, debugLevel.info);
        }
    }

    /**
     * Restart auto-refresh (e.g. when settings change).
     */
    restartAutoRefresh(invalidateCallback: () => void): void {
        this.stopAutoRefresh();
        this.startAutoRefresh(invalidateCallback);
    }

    dispose(): void {
        if (this.debounceTimer) { clearTimeout(this.debounceTimer); }
        this.stopAutoRefresh();
    }
}

/** 
 * Item types that must NEVER be individually refreshed (VS Code icon bug).
 * Refresh their parent instead.
 */
const STATIC_ITEM_TYPES = new Set([
    'essentials', 'details', 'metrics', 'manifest', 
    'events', 'commands', 'image-store', 'health', 'repair-tasks', 'cluster-map',
]);

function isStaticItem(itemType: string): boolean {
    return STATIC_ITEM_TYPES.has(itemType);
}
