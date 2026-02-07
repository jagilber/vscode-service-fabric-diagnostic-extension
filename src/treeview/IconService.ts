import * as vscode from 'vscode';

/**
 * Centralized icon resolution service.
 * 
 * CRITICAL: Respects the documented VS Code TreeView limitation where
 * ThemeIcon+ThemeColor items lose color if individually refreshed via
 * _onDidChangeTreeData.fire(item) before VS Code processes them.
 * 
 * See docs/ICON_RENDERING_BUG.md for full context.
 */
export class IconService {
    private static readonly healthColorMap: Record<string, string> = {
        'ok': 'testing.iconPassed',
        'ready': 'testing.iconPassed',
        'active': 'testing.iconPassed',
        'available': 'testing.iconPassed',
        'warning': 'testing.iconQueued',
        'upgrading': 'testing.iconQueued',
        'provisioning': 'testing.iconQueued',
        'unprovisioning': 'testing.iconQueued',
        'error': 'testing.iconFailed',
        'failed': 'testing.iconFailed',
        'down': 'testing.iconFailed',
    };

    /**
     * Get a themed icon colored by health state.
     * Returns a NEW ThemeIcon every time (VS Code requires distinct instances).
     */
    getHealthIcon(healthState: string | undefined, iconId: string): vscode.ThemeIcon {
        if (!healthState) {
            return new vscode.ThemeIcon(iconId);
        }
        const colorId = IconService.healthColorMap[healthState.toLowerCase()];
        return colorId
            ? new vscode.ThemeIcon(iconId, new vscode.ThemeColor(colorId))
            : new vscode.ThemeIcon(iconId);
    }

    /**
     * Static icon with a fixed color. 
     * CRITICAL: Items using this must NEVER be individually refreshed via fire(item).
     * Refresh their parent container instead.
     */
    getStaticIcon(iconId: string, colorId: string): vscode.ThemeIcon {
        return new vscode.ThemeIcon(iconId, new vscode.ThemeColor(colorId));
    }

    /**
     * Plain icon with no color tinting.
     */
    getPlainIcon(iconId: string): vscode.ThemeIcon {
        return new vscode.ThemeIcon(iconId);
    }

    /**
     * Calculate the worst (most severe) health state from an array of states.
     */
    static worstHealthState(states: (string | undefined)[]): string | undefined {
        const priority: Record<string, number> = {
            'Error': 3,
            'Warning': 2,
            'Ok': 1,
            'Unknown': 0,
        };

        let worst: string | undefined;
        let worstPriority = -1;

        for (const state of states) {
            if (!state) { continue; }
            const p = priority[state] ?? 0;
            if (p > worstPriority) {
                worst = state;
                worstPriority = p;
            }
        }
        return worst;
    }
}
