/**
 * CommandRegistry — centralized command lifecycle management.
 * 
 * Single source of truth for ALL command registrations in the extension.
 * Eliminates the category of "declared-but-not-registered" bugs by providing:
 * 
 * 1. A typed COMMAND_MANIFEST that declares every command the extension owns
 * 2. A single `registerAll()` entry point called from `activate()`
 * 3. Post-registration validation via `validateRegistrations()`
 * 4. Double-registration protection delegated to `safeRegisterCommand()`
 * 
 * Design decisions:
 * - Activation-event commands (`sfSetClusterEndpoint`, `sfGetCluster`, `refresh`)
 *   are registered FIRST with late-bound handlers, so they are always available
 *   even if later steps in `activate()` fail.
 * - All registrations go through `registerCommandWithErrorHandling` or
 *   `safeRegisterCommand` — no raw `vscode.commands.registerCommand` calls.
 */

import * as vscode from 'vscode';
import { SfMgr } from '../sfMgr';
import { SfPrompts } from '../sfPrompts';
import { SfUtility, debugLevel } from '../sfUtility';
import { registerClusterCommands } from './ClusterCommands';
import { registerNodeCommands } from './NodeCommands';
import { registerResourceCommands } from './ResourceCommands';
import { registerViewCommands } from './ViewCommands';
import { registerReportCommands } from './ReportCommands';
import { registerProjectCommands } from './ProjectCommands';
import { SfProjectService } from '../services/SfProjectService';
import { SfDeployService } from '../services/SfDeployService';
import { SfManifestValidator } from '../services/SfManifestValidator';
import { SfApplicationsDataProvider } from '../treeview/SfApplicationsDataProvider';

// ---------------------------------------------------------------------------
// Command Manifest
// ---------------------------------------------------------------------------

export interface CommandMeta {
    /** User-friendly name shown in error messages */
    friendlyName: string;
    /** Organisational category for logging / validation */
    category: 'cluster' | 'view' | 'report' | 'node' | 'resource' | 'internal' | 'project';
    /** If true, the command handler needs an active cluster connection */
    requiresCluster: boolean;
    /** If true, this is an activation-event command that must always be registered */
    isActivationEvent?: boolean;
}

/**
 * Every command the extension owns.
 * Adding a command here without a matching registration will be caught by
 * `validateRegistrations()` at startup.
 */
export const COMMAND_MANIFEST: Record<string, CommandMeta> = {
    // ---- Activation-event commands (must ALWAYS register) ----
    'sfClusterExplorer.startExtension':           { friendlyName: 'start extension',     category: 'internal', requiresCluster: false, isActivationEvent: true },
    'sfClusterExplorer.refresh':                  { friendlyName: 'refresh',               category: 'view',     requiresCluster: false, isActivationEvent: true },
    'sfClusterExplorer.sfSetClusterEndpoint':     { friendlyName: 'add cluster endpoint',  category: 'cluster',  requiresCluster: false, isActivationEvent: true },
    'sfClusterExplorer.sfGetCluster':             { friendlyName: 'get cluster',           category: 'cluster',  requiresCluster: false, isActivationEvent: true },

    // ---- Cluster commands ----
    'sfClusterExplorer.sfGetClusters':            { friendlyName: 'get clusters',          category: 'cluster',  requiresCluster: false },
    'sfClusterExplorer.sfDeployDevCluster':       { friendlyName: 'deploy dev cluster',    category: 'cluster',  requiresCluster: false },
    'sfClusterExplorer.sfRemoveClusterEndpoint':  { friendlyName: 'remove endpoint',       category: 'cluster',  requiresCluster: false },
    'sfClusterExplorer.sfSetClusterRestCall':     { friendlyName: 'REST call',             category: 'cluster',  requiresCluster: true },
    'sfClusterExplorer.removeClusterFromTree':    { friendlyName: 'remove from tree',      category: 'cluster',  requiresCluster: false },
    'sfClusterExplorer.setActiveCluster':         { friendlyName: 'set active cluster',    category: 'cluster',  requiresCluster: false },
    'sfClusterExplorer.resetExtensionState':      { friendlyName: 'reset extension state', category: 'cluster',  requiresCluster: false },
    'sfClusterExplorer.openSfx':                    { friendlyName: 'open SFX',              category: 'cluster',  requiresCluster: false },

    // ---- View / UI commands ----
    'serviceFabricClusterView.refreshView':       { friendlyName: 'refresh view',          category: 'view',     requiresCluster: false },
    'serviceFabricClusterView.reveal':            { friendlyName: 'reveal item',           category: 'view',     requiresCluster: false },
    'serviceFabricClusterView.changeTitle':       { friendlyName: 'change title',          category: 'view',     requiresCluster: false },
    'sfClusterExplorer.showManagementView':       { friendlyName: 'management view',       category: 'view',     requiresCluster: false },
    'sfClusterExplorer.deployApplicationFromContext': { friendlyName: 'deploy app',        category: 'view',     requiresCluster: false },
    'sfClusterExplorer.showItemDetails':          { friendlyName: 'show details',          category: 'view',     requiresCluster: true },
    'sfClusterExplorer.retryNode':                { friendlyName: 'retry node',            category: 'internal', requiresCluster: false },

    // ---- Report commands ----
    'sfClusterExplorer.generateEventsReport':     { friendlyName: 'events report',         category: 'report',   requiresCluster: true },
    'sfClusterExplorer.generateHealthReport':     { friendlyName: 'health report',         category: 'report',   requiresCluster: true },
    'sfClusterExplorer.generateMetricsReport':    { friendlyName: 'metrics report',        category: 'report',   requiresCluster: true },
    'sfClusterExplorer.generateCommandsReference':{ friendlyName: 'commands reference',    category: 'report',   requiresCluster: true },
    'sfClusterExplorer.generateEssentialsReport': { friendlyName: 'essentials report',     category: 'report',   requiresCluster: true },
    'sfClusterExplorer.generateRepairTasksReport':{ friendlyName: 'repair tasks report',   category: 'report',   requiresCluster: true },
    'sfClusterExplorer.exportSnapshot':           { friendlyName: 'export snapshot',       category: 'report',   requiresCluster: true },

    // ---- Node commands ----
    'sfClusterExplorer.manageNodeFromContext':     { friendlyName: 'manage node',          category: 'node',     requiresCluster: true },

    // ---- Resource commands ----
    'sfClusterExplorer.restartReplica':            { friendlyName: 'restart replica',      category: 'resource', requiresCluster: true },
    'sfClusterExplorer.deleteReplica':             { friendlyName: 'delete replica',       category: 'resource', requiresCluster: true },
    'sfClusterExplorer.deleteService':             { friendlyName: 'delete service',       category: 'resource', requiresCluster: true },
    'sfClusterExplorer.deleteApplication':         { friendlyName: 'delete application',   category: 'resource', requiresCluster: true },
    'sfClusterExplorer.unprovisionApplicationType':{ friendlyName: 'unprovision app type', category: 'resource', requiresCluster: true },

    // ---- Project commands (SF Applications view) ----
    'sfApplications.refresh':                      { friendlyName: 'refresh projects',     category: 'project',  requiresCluster: false },
    'sfApplications.buildProject':                 { friendlyName: 'build project',        category: 'project',  requiresCluster: false },
    'sfApplications.deployProject':                { friendlyName: 'deploy project',       category: 'project',  requiresCluster: true },
    'sfApplications.removeFromCluster':            { friendlyName: 'remove from cluster',  category: 'project',  requiresCluster: true },
    'sfApplications.upgradeApplication':           { friendlyName: 'upgrade application',  category: 'project',  requiresCluster: true },
    'sfApplications.deployWithProfile':            { friendlyName: 'deploy with profile',  category: 'project',  requiresCluster: true },
    'sfApplications.openProjectInCode':            { friendlyName: 'open project in code', category: 'project',  requiresCluster: false },
    'sfApplications.addExternalProject':           { friendlyName: 'add external project', category: 'project',  requiresCluster: false },
    'sfApplications.removeExternalProject':        { friendlyName: 'remove external project', category: 'project', requiresCluster: false },
    'sfApplications.validateManifest':             { friendlyName: 'validate manifest',    category: 'project',  requiresCluster: false },
};

// ---------------------------------------------------------------------------
// CommandRegistry
// ---------------------------------------------------------------------------

export class CommandRegistry {

    /**
     * Register ALL extension commands in the correct order.
     * Called once from `activate()`.
     */
    public static registerAll(
        context: vscode.ExtensionContext,
        sfMgr: SfMgr,
        sfPrompts: SfPrompts,
        projectService?: SfProjectService,
        deployService?: SfDeployService,
        applicationsProvider?: SfApplicationsDataProvider,
        manifestValidator?: SfManifestValidator,
    ): void {
        SfUtility.outputLog('CommandRegistry: registering all commands...', null, debugLevel.info);

        // 1. Cluster commands (includes activation-event commands sfSetClusterEndpoint, sfGetCluster)
        registerClusterCommands(context, sfMgr, sfPrompts);

        // 2. Node commands
        registerNodeCommands(context, sfMgr);

        // 3. Resource commands (delete, restart, unprovision)
        registerResourceCommands(context, sfMgr);

        // 4. View / UI commands (refresh, reveal, showItemDetails, retryNode, etc.)
        registerViewCommands(context, sfMgr);

        // 5. Report commands (events, health, metrics, essentials, repair, commands ref, snapshot)
        registerReportCommands(context, sfMgr);

        // 6. Project commands (SF Applications view — build, deploy, refresh)
        if (projectService && deployService && applicationsProvider) {
            registerProjectCommands(context, sfMgr, projectService, deployService, applicationsProvider, manifestValidator);
        }

        SfUtility.outputLog('CommandRegistry: all commands registered', null, debugLevel.info);
    }

    /**
     * Validate that every command declared in the COMMAND_MANIFEST
     * was actually registered during activation.
     * Logs warnings for any mismatches — does not throw.
     */
    public static async validateRegistrations(): Promise<void> {
        try {
            const allCommands = await vscode.commands.getCommands(true);
            const allSet = new Set(allCommands);
            let missingCount = 0;

            for (const [commandId, meta] of Object.entries(COMMAND_MANIFEST)) {
                if (!allSet.has(commandId)) {
                    missingCount++;
                    SfUtility.outputLog(
                        `CommandRegistry VALIDATION WARNING: '${commandId}' (${meta.friendlyName}) is in COMMAND_MANIFEST but was NOT registered!`,
                        null,
                        debugLevel.error,
                    );
                }
            }

            if (missingCount === 0) {
                SfUtility.outputLog(
                    `CommandRegistry: validation passed — all ${Object.keys(COMMAND_MANIFEST).length} manifest commands registered`,
                    null,
                    debugLevel.info,
                );
            } else {
                SfUtility.outputLog(
                    `CommandRegistry: validation found ${missingCount} unregistered command(s)`,
                    null,
                    debugLevel.error,
                );
            }
        } catch (err) {
            SfUtility.outputLog('CommandRegistry: validation check failed', err, debugLevel.warn);
        }
    }
}
