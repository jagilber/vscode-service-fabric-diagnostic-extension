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
    private invalidateCallback: (() => void | Promise<void>) | undefined;
    private pendingFullRefresh = false;

    constructor(
        private readonly emitter: vscode.EventEmitter<ITreeNode | undefined | void>,
        private readonly debounceMs: number = 100,
    ) {}

    /**
     * Debounced refresh. Batches multiple calls within debounceMs window.
     * 
     * CRITICAL: A full tree refresh (node=undefined) is never downgraded to an
     * individual node refresh. If _doFetch calls requestRefresh(node) while a
     * full refresh is pending, the individual request is absorbed.
     * This prevents VS Code's ThemeColor bug (fire(node) drops icon color).
     */
    refresh(node?: ITreeNode): void {
        // If a full refresh is already pending, absorb individual requests
        if (node && this.pendingFullRefresh) {
            return;
        }

        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        if (!node) {
            this.pendingFullRefresh = true;
        }

        this.debounceTimer = setTimeout(() => {
            const target = this.pendingFullRefresh ? 'undefined (full tree)' : `node:${(node as any)?.id || 'unknown'}`;
            SfUtility.outputLog(`[TREE] RefreshManager.fire: ${target}`, null, debugLevel.info);
            this.emitter.fire(this.pendingFullRefresh ? undefined : node as any);
            this.debounceTimer = undefined;
            this.pendingFullRefresh = false;
        }, this.debounceMs);
    }

    /**
     * Start auto-refresh cycle based on extension settings.
     */
    startAutoRefresh(invalidateCallback: () => void | Promise<void>): void {
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
            // Await the callback (which fetches fresh data) before firing re-render
            // so the tree never renders with stale/empty data.
            const maybePromise = this.invalidateCallback?.();
            if (maybePromise && typeof (maybePromise as Promise<void>).then === 'function') {
                (maybePromise as Promise<void>).then(() => {
                    SfUtility.outputLog('RefreshManager: emitter.fire(undefined) after async callback (health-only or invalidate)', null, debugLevel.info);
                    this.emitter.fire(undefined);
                }).catch(err => {
                    SfUtility.outputLog('RefreshManager: auto-refresh callback error', err, debugLevel.error);
                    // Still re-render so error nodes appear
                    this.emitter.fire(undefined);
                });
            } else {
                SfUtility.outputLog('RefreshManager: emitter.fire(undefined) sync path', null, debugLevel.info);
                this.emitter.fire(undefined);
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
    restartAutoRefresh(invalidateCallback: () => void | Promise<void>): void {
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
