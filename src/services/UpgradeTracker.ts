/**
 * UpgradeTracker — writes a live cluster/application upgrade domain walk
 * into docs/architecture/upgrade-ud-progress.md using Mermaid diagrams
 * with color-coded UD nodes, health check pipeline, and per-node progress.
 *
 * The tracker polls the cluster REST API on an interval and updates the
 * MD until the upgrade finishes or is disposed.
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { SfUtility, debugLevel } from '../sfUtility';
import { openMarkdownFilePreview } from './reports/ReportUtils';
import { SfRest } from '../sfRest';
import * as sfModels from '../sdk/servicefabric/servicefabric/src/models';

const UPGRADE_STATE_ICON: Record<string, string> = {
    'RollingForwardInProgress': '🔄',
    'RollingBackInProgress': '⏪',
    'RollingForwardPending': '⏳',
    'RollingForwardCompleted': '✅',
    'RollingBackCompleted': '↩️',
    'Failed': '❌',
};

const LIVE_SECTION_START = '<!-- LIVE_UPGRADE_STATUS_START -->';
const LIVE_SECTION_END = '<!-- LIVE_UPGRADE_STATUS_END -->';

export class UpgradeTracker implements vscode.Disposable {
    private mdPath: string;
    private pollTimer: ReturnType<typeof setInterval> | undefined;
    private disposed = false;

    constructor(
        workspaceRoot: string,
        private readonly sfRest: SfRest,
        private readonly clusterEndpoint: string,
    ) {
        this.mdPath = path.join(os.tmpdir(), 'sf-upgrade-ud-progress.md');
        SfUtility.outputLog(`UpgradeTracker: created for ${clusterEndpoint}`, null, debugLevel.info);
    }

    /**
     * Fetch upgrade progress once, write the MD, open in editor,
     * and start polling every `intervalMs` until upgrade completes.
     */
    async start(intervalMs: number = 10_000): Promise<void> {
        await this.poll();
        this.openInEditor();

        this.pollTimer = setInterval(async () => {
            if (this.disposed) { return; }
            const done = await this.poll();
            if (done) { this.stopPolling(); }
        }, intervalMs);
    }

    /** Single refresh — useful when caller already has fresh data */
    async refresh(progress?: sfModels.ClusterUpgradeProgressObject): Promise<void> {
        const data = progress ?? await this.sfRest.getClusterUpgradeProgress();
        this.flush(data);
    }

    dispose(): void {
        this.disposed = true;
        this.stopPolling();
    }

    // ── Private ────────────────────────────────────────────────────────

    private stopPolling(): void {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = undefined;
        }
    }

    /** Returns true when the upgrade is finished (no more polling needed) */
    private async poll(): Promise<boolean> {
        try {
            const progress = await this.sfRest.getClusterUpgradeProgress();
            this.flush(progress);
            const state = progress.upgradeState || '';
            return state === 'RollingForwardCompleted' ||
                   state === 'RollingBackCompleted' ||
                   state === 'Failed';
        } catch (err) {
            SfUtility.outputLog('UpgradeTracker.poll: failed to fetch upgrade progress', err, debugLevel.warn);
            return false;
        }
    }

    private async openInEditor(): Promise<void> {
        try {
            await openMarkdownFilePreview(this.mdPath);
        } catch (err) {
            SfUtility.outputLog('UpgradeTracker.openInEditor: failed to open markdown', err, debugLevel.warn);
        }
    }

    /** Parse ISO 8601 duration (PT1H2M3.5S) or numeric millisecond string */
    private parseDuration(raw?: string): number {
        if (!raw) { return 0; }
        if (raw.startsWith('PT') || raw.startsWith('P')) {
            let ms = 0;
            const d = raw.match(/(\d+)D/);
            const h = raw.match(/(\d+)H/);
            const m = raw.match(/(\d+)M/);
            const s = raw.match(/([\d.]+)S/);
            if (d) { ms += parseInt(d[1]) * 86400000; }
            if (h) { ms += parseInt(h[1]) * 3600000; }
            if (m) { ms += parseInt(m[1]) * 60000; }
            if (s) { ms += Math.round(parseFloat(s[1]) * 1000); }
            return ms;
        }
        return parseInt(raw) || 0;
    }

    private formatDuration(ms: number): string {
        if (ms <= 0) { return '—'; }
        if (ms < 1000) { return `${ms}ms`; }
        const totalSec = Math.floor(ms / 1000);
        const s = totalSec % 60;
        const m = Math.floor(totalSec / 60) % 60;
        const h = Math.floor(totalSec / 3600);
        if (h > 0) { return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; }
        if (m > 0) { return `${m}:${String(s).padStart(2, '0')} minutes`; }
        return `${s} seconds`;
    }

    /** Format duration for compact display in diagrams */
    private formatDurationShort(ms: number): string {
        if (ms <= 0) { return '—'; }
        if (ms < 1000) { return `${ms}ms`; }
        const totalSec = Math.floor(ms / 1000);
        const s = totalSec % 60;
        const m = Math.floor(totalSec / 60) % 60;
        const h = Math.floor(totalSec / 3600);
        if (h > 0) { return `${h}h ${m}m`; }
        if (m > 0) { return `${m}m ${s}s`; }
        return `${s}s`;
    }

    private formatTimestamp(ts?: string): string {
        if (!ts || ts.startsWith('0001-01-01')) { return '—'; }
        try { return new Date(ts).toLocaleString(); } catch { return ts; }
    }

    // ── Mermaid Builders ───────────────────────────────────────────────

    /** Build Mermaid flowchart for UD walk progress with color-coded nodes */
    private buildUdMermaid(uds: sfModels.UpgradeDomainInfo[], currentUD: string): string {
        if (uds.length === 0) { return ''; }

        const lines: string[] = [
            '```mermaid',
            'flowchart LR',
        ];

        // Define nodes
        for (const ud of uds) {
            const name = ud.name || '?';
            const state = ud.state || 'Pending';
            const nodeId = `UD${name.replace(/[^a-zA-Z0-9]/g, '')}`;
            const isCurrent = name === currentUD && state !== 'Completed';
            const stateLabel = isCurrent ? `⟳ ${state}` : state;
            const cssClass = state === 'Completed' ? 'completed'
                : state === 'InProgress' ? 'inprogress'
                : state === 'Invalid' ? 'failed'
                : 'pending';
            lines.push(`    ${nodeId}["\`UD:${name}\n${stateLabel}\`"]:::${cssClass}`);
        }

        // Chain nodes
        const ids = uds.map(ud => `UD${(ud.name || '?').replace(/[^a-zA-Z0-9]/g, '')}`);
        lines.push(`    ${ids.join(' --> ')}`);

        // Style classes — SFX-like colors
        lines.push('    classDef completed fill:#2d7d2d,stroke:#1a5c1a,color:#fff,stroke-width:2px');
        lines.push('    classDef inprogress fill:#c68a00,stroke:#a07000,color:#fff,stroke-width:3px');
        lines.push('    classDef pending fill:#555,stroke:#444,color:#ccc,stroke-width:1px');
        lines.push('    classDef failed fill:#c0392b,stroke:#962d22,color:#fff,stroke-width:2px');
        lines.push('```');

        return lines.join('\n');
    }

    /** Build Mermaid flowchart for health check pipeline */
    private buildHealthCheckMermaid(
        mon: sfModels.MonitoringPolicyDescription,
        udDurationMs: number,
    ): string {
        const waitMs = this.parseDuration(mon.healthCheckWaitDurationInMilliseconds);
        const stableMs = this.parseDuration(mon.healthCheckStableDurationInMilliseconds);
        const retryMs = this.parseDuration(mon.healthCheckRetryTimeoutInMilliseconds);

        // Determine which phase we're in based on UD duration
        let waitClass = 'pending';
        let stableClass = 'pending';
        let passClass = 'pending';

        if (udDurationMs > 0) {
            if (udDurationMs >= waitMs + stableMs) {
                waitClass = 'done';
                stableClass = 'done';
                passClass = 'done';
            } else if (udDurationMs >= waitMs) {
                waitClass = 'done';
                stableClass = 'active';
            } else {
                waitClass = 'active';
            }
        }

        const waitDur = this.formatDurationShort(waitMs);
        const stableDur = this.formatDurationShort(stableMs);
        const retryLabel = retryMs > 0 ? `\n(retry ${this.formatDurationShort(retryMs)})` : '';

        const lines: string[] = [
            '```mermaid',
            'flowchart LR',
            `    W["\`Wait Duration\n${waitDur}\`"]:::${waitClass}`,
            `    S["\`Stable Duration Check\n${stableDur}\`"]:::${stableClass}`,
            `    P["\`Health Check\nPass${retryLabel}\`"]:::${passClass}`,
            '    W --> S --> P',
            '    classDef done fill:#2d7d2d,stroke:#1a5c1a,color:#fff,stroke-width:2px',
            '    classDef active fill:#c68a00,stroke:#a07000,color:#fff,stroke-width:3px',
            '    classDef pending fill:#555,stroke:#444,color:#ccc,stroke-width:1px',
            '```',
        ];
        return lines.join('\n');
    }

    /** Build Mermaid flowchart for per-node upgrade progress in current UD */
    private buildNodeProgressMermaid(
        nodes: sfModels.NodeUpgradeProgressInfo[],
    ): string {
        if (nodes.length === 0) { return ''; }

        const lines: string[] = [
            '```mermaid',
            'flowchart TB',
        ];

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const name = (node.nodeName || `node${i}`).replace(/[^a-zA-Z0-9_]/g, '_');
            const phase = node.upgradePhase || 'Unknown';
            const dur = node.upgradeDuration ? ` ${this.formatDurationShort(this.parseDuration(node.upgradeDuration))}` : '';
            const cssClass = phase === 'PostUpgradeSafetyCheck' || phase === 'Upgrading' ? 'inprogress'
                : phase === 'PreUpgradeSafetyCheck' ? 'precheck'
                : 'done';
            lines.push(`    N${i}["\`${node.nodeName || `node${i}`}\n${phase}${dur}\`"]:::${cssClass}`);
        }

        lines.push('    classDef done fill:#2d7d2d,stroke:#1a5c1a,color:#fff,stroke-width:2px');
        lines.push('    classDef inprogress fill:#c68a00,stroke:#a07000,color:#fff,stroke-width:3px');
        lines.push('    classDef precheck fill:#2980b9,stroke:#1f6da0,color:#fff,stroke-width:2px');
        lines.push('```');

        return lines.join('\n');
    }

    // ── Main Builder ───────────────────────────────────────────────────

    private buildLiveSection(progress: sfModels.ClusterUpgradeProgressObject): string {
        const state = progress.upgradeState || 'Unknown';
        const stateIcon = UPGRADE_STATE_ICON[state] || '❓';
        const version = progress.codeVersion || 'N/A';
        const configVersion = progress.configVersion || 'N/A';
        const mode = progress.rollingUpgradeMode || 'N/A';
        const durationMs = this.parseDuration(progress.upgradeDurationInMilliseconds);
        const udDurationMs = this.parseDuration(progress.upgradeDomainDurationInMilliseconds);
        const startTime = this.formatTimestamp(progress.startTimestampUtc);

        const uds = progress.upgradeDomains || [];
        const completedCount = uds.filter(u => u.state === 'Completed').length;
        const totalCount = uds.length;
        const currentUD = progress.nextUpgradeDomain
            || progress.currentUpgradeDomainProgress?.domainName || '—';

        const mon = progress.upgradeDescription?.monitoringPolicy;

        // Timeout calculations
        const upgradeTimeoutMs = this.parseDuration(mon?.upgradeTimeoutInMilliseconds);
        const udTimeoutMs = this.parseDuration(mon?.upgradeDomainTimeoutInMilliseconds);
        const upgradeTimeLeft = upgradeTimeoutMs > 0 ? upgradeTimeoutMs - durationMs : 0;
        const udTimeLeft = udTimeoutMs > 0 ? udTimeoutMs - udDurationMs : 0;

        const lines: string[] = [
            '',
            LIVE_SECTION_START,
            '',
            `## ${stateIcon} Cluster Upgrade — UD Walk Progress`,
            '',
            '### Overview',
            '',
            '| Property | Value |',
            '|----------|-------|',
            `| Cluster | \`${this.clusterEndpoint}\` |`,
            `| Code Version | ${version} |`,
            `| Config Version | ${configVersion} |`,
            `| Upgrade State | ${stateIcon} ${state} |`,
            `| Upgrade Mode | ${mode} |`,
            `| Started | ${startTime} |`,
            `| Upgrade Duration | ${this.formatDuration(durationMs)} |`,
        ];

        if (upgradeTimeLeft > 0) {
            lines.push(`| Time Left Until Timeout | ${this.formatDuration(upgradeTimeLeft)} |`);
        }

        lines.push(`| Last Polled | ${new Date().toLocaleString()} |`);

        // UD Progress Mermaid diagram
        lines.push(
            '',
            `### Upgrade Domain Progress (${completedCount}/${totalCount} completed)`,
            '',
        );

        if (totalCount > 0) {
            lines.push(this.buildUdMermaid(uds, currentUD));
        }

        // Current Domain section
        if (currentUD !== '—' && state !== 'RollingForwardCompleted' && state !== 'RollingBackCompleted') {
            lines.push(
                '',
                `### Current Domain: ${currentUD}`,
                '',
                '| Property | Value |',
                '|----------|-------|',
                `| UD Duration | ${this.formatDuration(udDurationMs)} |`,
            );
            if (udTimeLeft > 0) {
                lines.push(`| Time Left Until Timeout | ${this.formatDuration(udTimeLeft)} |`);
            }

            // Per-node progress
            const nodeList = progress.currentUpgradeDomainProgress?.nodeUpgradeProgressList;
            if (nodeList && nodeList.length > 0) {
                lines.push(
                    '',
                    '#### Node Upgrade Progress',
                    '',
                    this.buildNodeProgressMermaid(nodeList),
                    '',
                    '| Node | Phase | Duration |',
                    '|------|-------|----------|',
                );
                for (const node of nodeList) {
                    const dur = node.upgradeDuration
                        ? this.formatDurationShort(this.parseDuration(node.upgradeDuration))
                        : '—';
                    lines.push(`| ${node.nodeName || '?'} | ${node.upgradePhase || '?'} | ${dur} |`);
                }
            }
        }

        // Health Check Pipeline (Monitored mode only)
        if (mon && (mode === 'Monitored' || mode === 'UnmonitoredManual')) {
            lines.push(
                '',
                '### Health Check Progress',
                '',
                this.buildHealthCheckMermaid(mon, udDurationMs),
                '',
                '### Monitoring And Health Policies',
                '',
                '| Policy | Value |',
                '|--------|-------|',
                `| Health Check Wait Duration | ${this.formatDurationShort(this.parseDuration(mon.healthCheckWaitDurationInMilliseconds))} |`,
                `| Health Check Stable Duration | ${this.formatDurationShort(this.parseDuration(mon.healthCheckStableDurationInMilliseconds))} |`,
                `| Health Check Retry Timeout | ${this.formatDurationShort(this.parseDuration(mon.healthCheckRetryTimeoutInMilliseconds))} |`,
                `| Upgrade Timeout | ${this.formatDurationShort(this.parseDuration(mon.upgradeTimeoutInMilliseconds))} |`,
                `| Upgrade Domain Timeout | ${this.formatDurationShort(this.parseDuration(mon.upgradeDomainTimeoutInMilliseconds))} |`,
            );
        }

        // Failure info
        if (progress.failureReason && progress.failureReason !== 'None') {
            lines.push(
                '',
                '### ❌ Failure Details',
                '',
                `**Reason:** ${progress.failureReason}  `,
                `**Failure Time:** ${this.formatTimestamp(progress.failureTimestampUtc)}`,
            );

            const failedDomain = progress.upgradeDomainProgressAtFailure;
            if (failedDomain) {
                lines.push(
                    '',
                    `**Failed Domain:** ${failedDomain.domainName || '?'}  `,
                );
                if (failedDomain.nodeUpgradeProgressList?.length) {
                    lines.push(
                        '',
                        '| Node | Phase |',
                        '|------|-------|',
                    );
                    for (const n of failedDomain.nodeUpgradeProgressList) {
                        lines.push(`| ${n.nodeName || '?'} | ${n.upgradePhase || '?'} |`);
                    }
                }
            }
        }

        lines.push('', LIVE_SECTION_END, '');
        return lines.join('\n');
    }

    private flush(progress: sfModels.ClusterUpgradeProgressObject): void {
        try {
            const dir = path.dirname(this.mdPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            let content: string;
            if (fs.existsSync(this.mdPath)) {
                content = fs.readFileSync(this.mdPath, 'utf-8');
            } else {
                content = '# Service Fabric Cluster Upgrade — UD Walk Progress\n';
            }

            const liveSection = this.buildLiveSection(progress);

            const startIdx = content.indexOf(LIVE_SECTION_START);
            const endIdx = content.indexOf(LIVE_SECTION_END);

            if (startIdx !== -1 && endIdx !== -1) {
                content = content.substring(0, startIdx) + liveSection.trimStart() + content.substring(endIdx + LIVE_SECTION_END.length);
            } else {
                content = content.trimEnd() + '\n' + liveSection;
            }

            fs.writeFileSync(this.mdPath, content, 'utf-8');
        } catch (err) {
            SfUtility.outputLog('UpgradeTracker.flush: failed to write markdown', err, debugLevel.warn);
        }
    }
}
