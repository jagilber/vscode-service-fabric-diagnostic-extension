/**
 * Report generation command handlers — thin registrar.
 *
 * Each report generator has been extracted into its own module under
 * `../services/reports/`.  This file simply wires up the VS Code
 * commands to those generators.
 *
 * Commands:
 *   - generateEventsReport
 *   - generateHealthReport
 *   - generateMetricsReport
 *   - generateCommandsReference
 *   - generateRepairTasksReport
 *   - exportSnapshot
 */

import * as vscode from 'vscode';
import { SfMgr } from '../sfMgr';
import { registerCommandWithErrorHandling } from '../utils/CommandUtils';
import {
    generateEventsReport,
    generateHealthReport,
    generateMetricsReport,
    generateCommandsReference,
    generateRepairTasksReport,
    exportSnapshot,
} from '../services/reports';
import { openMarkdownPreview } from '../services/reports/ReportUtils';

// ===========================================================================
// Public registration entry point
// ===========================================================================

export function registerReportCommands(
    context: vscode.ExtensionContext,
    sfMgr: SfMgr,
): void {
    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.generateEventsReport',
        async (item: any) => generateEventsReport(context, sfMgr, item),
        'generate events report',
    );

    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.generateHealthReport',
        async (item: any) => generateHealthReport(context, sfMgr, item),
        'generate health report',
    );

    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.generateMetricsReport',
        async (item: any) => generateMetricsReport(context, sfMgr, item),
        'generate metrics report',
    );

    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.generateCommandsReference',
        async (item: any) => generateCommandsReference(context, sfMgr, item),
        'generate commands reference',
    );

    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.generateRepairTasksReport',
        async (item: any) => generateRepairTasksReport(context, sfMgr, item),
        'generate repair tasks report',
    );

    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.exportSnapshot',
        async (item: any) => exportSnapshot(context, item),
        'export snapshot',
    );

    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.viewManifestXml',
        async (item: any) => {
            const { xml } = await fetchManifestXml(sfMgr, item);
            const doc = await vscode.workspace.openTextDocument({ content: xml, language: 'xml' });
            await vscode.window.showTextDocument(doc, { preview: false });
        },
        'view manifest XML',
    );

    registerCommandWithErrorHandling(
        context,
        'sfClusterExplorer.viewManifestReport',
        async (item: any) => {
            const { xml, title } = await fetchManifestXml(sfMgr, item);
            const endpoint = item?.clusterEndpoint || '';
            const lines: string[] = [
                `# ${title}`,
                ``,
                `**Cluster:** ${endpoint}`,
                `**Generated:** ${new Date().toISOString()}`,
                ``,
                '## Raw Manifest',
                '',
                '```xml',
                xml,
                '```',
            ];
            await openMarkdownPreview(lines.join('\n'));
        },
        'view manifest report',
    );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolve the right manifest XML based on the tree item's contextValue. */
async function fetchManifestXml(
    sfMgr: SfMgr,
    item: any,
): Promise<{ xml: string; title: string }> {
    const endpoint = item?.clusterEndpoint;
    if (!endpoint) { throw new Error('No cluster endpoint'); }
    const sfConfig = sfMgr.getSfConfig(endpoint);
    if (!sfConfig) { throw new Error(`No configuration for ${endpoint}`); }
    const sfRest = sfConfig.getSfRest();

    // Determine manifest type from the item's contextValue or itemType
    const ctx = item?.contextValue || item?.itemType || '';

    if (ctx.startsWith('app-manifest') || ctx === 'app-manifest') {
        const appId = item?.applicationId;
        if (!appId) { throw new Error('No application ID available'); }
        const resp = await sfRest.getApplicationManifest(appId);
        const xml = resp?.manifest || JSON.stringify(resp, null, 2);
        return { xml, title: 'Application Manifest Report' };
    }

    if (ctx.startsWith('service-manifest') || ctx.startsWith('svc-manifest')) {
        const appId = item?.applicationId;
        const svcId = item?.serviceId;
        if (!appId || !svcId) { throw new Error('No application/service ID available'); }
        const resp = await sfRest.getServiceManifest(svcId, appId);
        const xml = resp?.manifest || JSON.stringify(resp, null, 2);
        return { xml, title: 'Service Manifest Report' };
    }

    // Default: cluster manifest
    const resp = await sfRest.getClusterManifest();
    const xml = (resp as any).manifest || JSON.stringify(resp, null, 2);
    return { xml, title: 'Cluster Manifest Report' };
}
