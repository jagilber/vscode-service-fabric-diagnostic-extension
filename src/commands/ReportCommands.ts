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
 *   - generateEssentialsReport
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
    generateEssentialsReport,
    generateRepairTasksReport,
    exportSnapshot,
} from '../services/reports';

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
        'sfClusterExplorer.generateEssentialsReport',
        async (item: any) => generateEssentialsReport(context, sfMgr, item),
        'generate essentials report',
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
}
