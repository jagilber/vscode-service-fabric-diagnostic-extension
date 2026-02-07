/**
 * TreeItem and TreeItemOptions — extracted from the legacy serviceFabricClusterView.ts.
 * Used by sfConfiguration.ts for building tree items consumed by the legacy view path.
 * This file exists as a transitional module; once all legacy tree-building code is
 * removed from sfConfiguration.ts, this file can be deleted.
 */
import * as vscode from 'vscode';

/** Options for creating a TreeItem */
export interface TreeItemOptions {
    children?: TreeItem[];
    resourceUri?: vscode.Uri;
    status?: string;
    iconPath?: string | vscode.Uri | { light: vscode.Uri; dark: vscode.Uri; } | vscode.ThemeIcon;
    contextValue?: string; // For VS Code context menu matching
    itemType?: string;
    itemId?: string;
    clusterEndpoint?: string;
    applicationId?: string;
    serviceId?: string;
    partitionId?: string;
    replicaId?: string;
    healthState?: string;
    // Image store properties
    path?: string; // Path in image store
    size?: number; // File size in bytes
    version?: string; // File version
    modifiedDate?: string; // Last modified date
    fileCount?: number; // Number of files in folder
}

export class TreeItem extends vscode.TreeItem {
    children?: TreeItem[] = [];
    // Note: iconPath is inherited from vscode.TreeItem - don't re-declare it here
    // Note: contextValue is inherited from vscode.TreeItem for context menu matching
    
    // Metadata for API calls
    public itemType?: string; // 'node', 'application', 'service', 'partition', 'replica', 'manifest', etc.
    public itemId?: string; // Node name, application ID, service ID, partition ID, replica ID
    public clusterEndpoint?: string;
    public applicationId?: string; // For services: parent application ID
    public serviceId?: string; // For partitions/replicas: parent service ID
    public partitionId?: string; // For replicas: parent partition ID
    public replicaId?: string; // For replica sub-items: parent replica ID
    public healthState?: string; // Health state for items
    public nodeName?: string; // For replicas: node where replica is running
    public typeName?: string; // For applications and application types: application type name
    public typeVersion?: string; // For applications and application types: application type version
    public serviceKind?: string; // For replicas: 'Stateful' or 'Stateless'
    // Image store properties
    public path?: string; // Path in image store
    public size?: number; // File size in bytes
    public version?: string; // File version
    public modifiedDate?: string; // Last modified date
    public fileCount?: number; // Number of files in folder

    constructor(label: string, options: TreeItemOptions = {}) {
        // Determine collapsible state based on item type and children
        let collapsibleState = vscode.TreeItemCollapsibleState.None;
        if (options.children !== undefined && options.children.length > 0) {
            // Has children: collapsed by default (match SFX behavior)
            collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        } else if (options.children === undefined && 
                   (options.itemType === 'node' || options.itemType === 'deployed-application' || 
                    options.itemType === 'deployed-service-package' || options.itemType === 'service' || 
                    options.itemType === 'partition' || options.itemType === 'replica' ||
                    options.itemType === 'image-store' || options.itemType === 'image-store-folder' ||
                    options.itemType === 'metrics' || options.itemType === 'commands' ||
                    options.itemType?.endsWith('-group'))) {
            // Lazy-loaded items and group nodes: collapsed for expansion
            collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        } else if (options.children !== undefined && options.children.length === 0) {
            // Empty children array: none (leaf node)
            collapsibleState = vscode.TreeItemCollapsibleState.None;
        }
        
        super(label, collapsibleState);
        this.resourceUri = options.resourceUri;
        this.tooltip = options.status ?? label;
        this.iconPath = options.iconPath as any;
        this.contextValue = options.contextValue; // For context menu matching
        this.itemType = options.itemType;
        this.itemId = options.itemId;
        this.clusterEndpoint = options.clusterEndpoint;
        this.applicationId = options.applicationId;
        this.serviceId = options.serviceId;
        this.partitionId = options.partitionId;
        this.replicaId = options.replicaId;
        this.healthState = options.healthState;
        
        // Image store properties
        this.path = options.path;
        this.size = options.size;
        this.version = options.version;
        this.modifiedDate = options.modifiedDate;
        this.fileCount = options.fileCount;
        
        // Add click command for all items with data, EXCEPT group nodes (which are only expandable)
        // Group nodes end with '-group' and should not be clickable
        if (options.itemType && options.itemId && !options.itemType.endsWith('-group')) {
            this.command = {
                command: 'sfClusterExplorer.showItemDetails',
                title: 'Show Details',
                arguments: [this]
            };
        }
        
        this.children = options.children;
    }
}
