import * as vscode from 'vscode';
import { SfRest } from '../sfRest';
import { SfConfiguration } from '../sfConfiguration';

/**
 * Typed context passed down the node hierarchy.
 * Replaces pipe-delimited contextValue strings for parent context.
 * Each node creates a derived context for its children, adding its own identity.
 */
export interface TreeNodeContext {
    /** VS Code extension context */
    readonly extensionContext: vscode.ExtensionContext;

    /** REST client for this cluster */
    readonly sfRest: SfRest;

    /** Cluster configuration (for health maps, manifest, etc.) */
    readonly sfConfig: SfConfiguration;

    /** Cluster HTTP endpoint (e.g. https://localhost:19080) */
    readonly clusterEndpoint: string;

    /** Resource URI for tree items */
    readonly resourceUri: vscode.Uri;

    // Parent chain — typed, no pipe-delimited strings
    readonly parentNodeName?: string;
    readonly parentApplicationId?: string;
    readonly parentServiceId?: string;
    readonly parentPartitionId?: string;
    readonly parentServiceManifestName?: string;
}

/**
 * Create a derived context by merging additional parent info
 */
export function deriveContext(parent: TreeNodeContext, overrides: Partial<TreeNodeContext>): TreeNodeContext {
    return { ...parent, ...overrides };
}
