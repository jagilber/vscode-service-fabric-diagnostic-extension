/**
 * DeployTracker — writes live deploy/upgrade/remove progress into
 * docs/architecture/deploy-upgrade-phases.md so the markdown file
 * reflects the current phase in real time.
 *
 * The tracker appends/replaces a "## Live Deploy Status" section at the
 * bottom of the file. Each phase row shows ⬜ pending, 🔄 in-progress,
 * ✅ done, or ❌ failed with timestamps and durations.
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { SfUtility, debugLevel } from '../sfUtility';
import { openMarkdownFilePreview } from './reports/ReportUtils';

export type PhaseStatus = 'pending' | 'in-progress' | 'done' | 'failed' | 'skipped';

interface PhaseEntry {
    name: string;
    status: PhaseStatus;
    detail?: string;
    startedAt?: number;
    finishedAt?: number;
}

export type OperationType = 'deploy' | 'upgrade' | 'remove';

const STATUS_ICON: Record<PhaseStatus, string> = {
    'pending': '⬜',
    'in-progress': '🔄',
    'done': '✅',
    'failed': '❌',
    'skipped': '⏭️',
};

const LIVE_SECTION_START = '<!-- LIVE_DEPLOY_STATUS_START -->';
const LIVE_SECTION_END = '<!-- LIVE_DEPLOY_STATUS_END -->';

export class DeployTracker {
    private phases: PhaseEntry[] = [];
    private mdPath: string;
    private operationType: OperationType;
    private appName: string;
    private typeName: string;
    private typeVersion: string;
    private operationStartedAt: number;

    constructor(
        workspaceRoot: string,
        operationType: OperationType,
        typeName: string,
        typeVersion: string,
        appName: string,
    ) {
        this.mdPath = path.join(os.tmpdir(), 'sf-deploy-upgrade-phases.md');
        this.operationType = operationType;
        this.typeName = typeName;
        this.typeVersion = typeVersion;
        this.appName = appName;
        this.operationStartedAt = Date.now();
        SfUtility.outputLog(`DeployTracker: created for ${operationType} ${typeName} v${typeVersion} → ${appName}`, null, debugLevel.info);
        SfUtility.outputLog(`DeployTracker: mdPath=${this.mdPath} workspaceRoot=${workspaceRoot}`, null, debugLevel.info);
        this.initPhases();
        this.flush();
        this.openInEditor();
    }

    /** Open the markdown file in VS Code preview beside the active editor */
    private async openInEditor(): Promise<void> {
        try {
            await openMarkdownFilePreview(this.mdPath);
        } catch (err) {
            SfUtility.outputLog('DeployTracker.openInEditor: failed to open markdown file', err, debugLevel.warn);
        }
    }

    private initPhases(): void {
        switch (this.operationType) {
            case 'deploy':
                this.phases = [
                    { name: 'Pre-flight Check', status: 'pending' },
                    { name: 'Upload to Image Store', status: 'pending' },
                    { name: 'Verify Upload', status: 'pending' },
                    { name: 'Provision Application Type', status: 'pending' },
                    { name: 'Wait for Provision', status: 'pending' },
                    { name: 'Create Application', status: 'pending' },
                ];
                break;
            case 'upgrade':
                this.phases = [
                    { name: 'Upload New Package', status: 'pending' },
                    { name: 'Provision New Version', status: 'pending' },
                    { name: 'Wait for Provision', status: 'pending' },
                    { name: 'Cleanup Image Store', status: 'pending' },
                    { name: 'Start Rolling Upgrade', status: 'pending' },
                ];
                break;
            case 'remove':
                this.phases = [
                    { name: 'Delete Application', status: 'pending' },
                    { name: 'Unprovision Type', status: 'pending' },
                ];
                break;
        }
    }

    /** Mark a phase as in-progress */
    startPhase(name: string, detail?: string): void {
        const phase = this.findPhase(name);
        if (!phase) { return; }
        phase.status = 'in-progress';
        phase.startedAt = Date.now();
        phase.detail = detail;
        this.flush();
    }

    /** Mark a phase as done */
    completePhase(name: string, detail?: string): void {
        const phase = this.findPhase(name);
        if (!phase) { return; }
        phase.status = 'done';
        phase.finishedAt = Date.now();
        if (detail) { phase.detail = detail; }
        this.flush();
    }

    /** Mark a phase as failed */
    failPhase(name: string, detail?: string): void {
        const phase = this.findPhase(name);
        if (!phase) { return; }
        phase.status = 'failed';
        phase.finishedAt = Date.now();
        if (detail) { phase.detail = detail; }
        this.flush();
    }

    /** Mark a phase as skipped */
    skipPhase(name: string, detail?: string): void {
        const phase = this.findPhase(name);
        if (!phase) { return; }
        phase.status = 'skipped';
        phase.finishedAt = Date.now();
        if (detail) { phase.detail = detail; }
        this.flush();
    }

    /** Update detail on the current in-progress phase (e.g., upload file 3/10) */
    updateDetail(name: string, detail: string): void {
        const phase = this.findPhase(name);
        if (!phase) { return; }
        phase.detail = detail;
        this.flush();
    }

    /** Mark entire operation complete or failed */
    finishOperation(success: boolean, message?: string): void {
        // Mark any remaining pending phases based on outcome
        for (const p of this.phases) {
            if (p.status === 'in-progress') {
                p.status = success ? 'done' : 'failed';
                p.finishedAt = Date.now();
            }
        }
        this.flush(success, message);
    }

    // ── Private ────────────────────────────────────────────────────────

    private findPhase(name: string): PhaseEntry | undefined {
        return this.phases.find(p => p.name === name);
    }

    private formatDuration(ms: number): string {
        if (ms < 1000) { return `${ms}ms`; }
        if (ms < 60000) { return `${(ms / 1000).toFixed(1)}s`; }
        return `${(ms / 60000).toFixed(1)}m`;
    }

    private formatTime(ts: number): string {
        const d = new Date(ts);
        return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    private buildLiveSection(operationDone?: boolean, doneMessage?: string): string {
        const opLabel = this.operationType.charAt(0).toUpperCase() + this.operationType.slice(1);
        const totalElapsed = this.formatDuration(Date.now() - this.operationStartedAt);
        const allDone = this.phases.every(p => p.status === 'done' || p.status === 'skipped');
        const anyFailed = this.phases.some(p => p.status === 'failed');

        let overallIcon = '🔄';
        if (operationDone === true || allDone) { overallIcon = '✅'; }
        if (operationDone === false || anyFailed) { overallIcon = '❌'; }

        const lines: string[] = [
            '',
            LIVE_SECTION_START,
            '',
            `## ${overallIcon} Live ${opLabel} Status`,
            '',
            `**${this.typeName}** v${this.typeVersion} → \`${this.appName}\`  `,
            `Started: ${this.formatTime(this.operationStartedAt)} | Elapsed: ${totalElapsed}`,
            '',
            '| Phase | Status | Duration | Detail |',
            '|-------|--------|----------|--------|',
        ];

        for (const p of this.phases) {
            const icon = STATUS_ICON[p.status];
            let duration = '';
            if (p.startedAt && p.finishedAt) {
                duration = this.formatDuration(p.finishedAt - p.startedAt);
            } else if (p.startedAt && p.status === 'in-progress') {
                duration = this.formatDuration(Date.now() - p.startedAt) + '...';
            }
            const detail = p.detail || '';
            lines.push(`| ${p.name} | ${icon} ${p.status} | ${duration} | ${detail} |`);
        }

        if (doneMessage) {
            lines.push('', `> ${doneMessage}`);
        }

        lines.push('', LIVE_SECTION_END, '');
        return lines.join('\n');
    }

    /** Write the live section into the markdown file */
    private flush(operationDone?: boolean, doneMessage?: string): void {
        try {
            // Ensure docs directory exists
            const dir = path.dirname(this.mdPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            let content: string;
            if (fs.existsSync(this.mdPath)) {
                content = fs.readFileSync(this.mdPath, 'utf-8');
            } else {
                content = '# Service Fabric Application Deploy & Upgrade Phases\n';
            }

            const liveSection = this.buildLiveSection(operationDone, doneMessage);

            // Replace existing live section or append
            const startIdx = content.indexOf(LIVE_SECTION_START);
            const endIdx = content.indexOf(LIVE_SECTION_END);

            if (startIdx !== -1 && endIdx !== -1) {
                content = content.substring(0, startIdx).trimEnd() + '\n\n' + liveSection.trim() + '\n';
            } else {
                // Strip trailing whitespace and append
                content = content.trimEnd() + '\n\n' + liveSection.trim() + '\n';
            }

            fs.writeFileSync(this.mdPath, content, 'utf-8');
        } catch (err) {
            SfUtility.outputLog('DeployTracker.flush: failed to write markdown', err, debugLevel.warn);
        }
    }
}
