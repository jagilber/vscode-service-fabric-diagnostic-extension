/**
 * Type-safe interfaces for tree view items
 * Replaces loose 'any' types with proper type definitions
 */

import { ItemType, HealthState, NodeStatus, ServiceKind } from '../constants/ItemTypes';

/**
 * Base interface for all tree items
 */
export interface BaseTreeItem {
    label: string;
    itemType: ItemType;
    itemId: string;
    tooltip?: string;
    description?: string;
    clusterEndpoint?: string;
    healthState?: HealthState;
    contextValue?: string;
}

/**
 * Cluster-level tree items
 */
export interface ClusterTreeItem extends BaseTreeItem {
    itemType: 'cluster';
}

export interface ClusterDetailsTreeItem extends BaseTreeItem {
    itemType: 'details';
}

export interface ClusterEssentialsTreeItem extends BaseTreeItem {
    itemType: 'essentials';
}

export interface ClusterMapTreeItem extends BaseTreeItem {
    itemType: 'cluster-map';
}

export interface ManifestTreeItem extends BaseTreeItem {
    itemType: 'manifest';
}

export interface HealthTreeItem extends BaseTreeItem {
    itemType: 'health';
}

export interface EventsTreeItem extends BaseTreeItem {
    itemType: 'events';
}

export interface RepairTasksTreeItem extends BaseTreeItem {
    itemType: 'repair-tasks';
}

/**
 * Image Store tree items
 */
export interface ImageStoreTreeItem extends BaseTreeItem {
    itemType: 'image-store';
    connectionString?: string;
    isNative?: boolean;
}

export interface ImageStoreFolderTreeItem extends BaseTreeItem {
    itemType: 'image-store-folder';
    path: string;
    fileCount?: number;
    isReserved?: boolean;
}

export interface ImageStoreFileTreeItem extends BaseTreeItem {
    itemType: 'image-store-file';
    path: string;
    size?: number;
    version?: string;
    modifiedDate?: string;
    isReserved?: boolean;
}

/**
 * Node tree items
 */
export interface NodeTreeItem extends BaseTreeItem {
    itemType: 'node';
    nodeName?: string;
    nodeStatus?: NodeStatus;
    ipAddress?: string;
    faultDomain?: string;
    upgradeDomain?: string;
}

/**
 * Application tree items
 */
export interface ApplicationTreeItem extends BaseTreeItem {
    itemType: 'application';
    applicationId: string;
    typeName?: string;
    typeVersion?: string;
}

export interface ApplicationTypeTreeItem extends BaseTreeItem {
    itemType: 'application-type';
    typeName: string;
    typeVersion: string;
}

export interface ApplicationManifestTreeItem extends BaseTreeItem {
    itemType: 'application-manifest';
    applicationId: string;
}

/**
 * Service tree items
 */
export interface ServiceTreeItem extends BaseTreeItem {
    itemType: 'service';
    serviceId: string;
    applicationId: string;
    serviceName?: string;
    serviceKind?: ServiceKind;
}

export interface ServiceManifestTreeItem extends BaseTreeItem {
    itemType: 'service-manifest';
    serviceId: string;
    applicationId: string;
}

export interface ServiceHealthTreeItem extends BaseTreeItem {
    itemType: 'service-health';
    serviceId: string;
    applicationId: string;
}

export interface ServiceEventsTreeItem extends BaseTreeItem {
    itemType: 'service-events';
    serviceId: string;
}

/**
 * Partition tree items
 */
export interface PartitionTreeItem extends BaseTreeItem {
    itemType: 'partition';
    partitionId: string;
    serviceId: string;
    applicationId: string;
}

export interface PartitionHealthTreeItem extends BaseTreeItem {
    itemType: 'partition-health';
    partitionId: string;
    serviceId: string;
    applicationId: string;
}

export interface PartitionEventsTreeItem extends BaseTreeItem {
    itemType: 'partition-events';
    partitionId: string;
}

/**
 * Replica tree items
 */
export interface ReplicaTreeItem extends BaseTreeItem {
    itemType: 'replica';
    replicaId: string;
    partitionId: string;
    serviceId?: string;
    applicationId?: string;
    nodeName?: string;
    serviceKind?: ServiceKind;
}

export interface ReplicaHealthTreeItem extends BaseTreeItem {
    itemType: 'replica-health';
    replicaId: string;
    partitionId: string;
    serviceId: string;
    applicationId: string;
}

export interface ReplicaEventsTreeItem extends BaseTreeItem {
    itemType: 'replica-events';
    replicaId: string;
    partitionId: string;
}

/**
 * Deployed application tree items
 */
export interface DeployedApplicationTreeItem extends BaseTreeItem {
    itemType: 'deployed-application';
    applicationId: string;
}

export interface DeployedServicePackageTreeItem extends BaseTreeItem {
    itemType: 'deployed-service-package';
    applicationId: string;
}

export interface DeployedCodePackageTreeItem extends BaseTreeItem {
    itemType: 'deployed-code-package';
}

export interface DeployedReplicaTreeItem extends BaseTreeItem {
    itemType: 'deployed-replica';
    partitionId?: string;
    replicaId?: string;
}

/**
 * Union type of all tree items
 */
export type AnyTreeItem = 
    | ClusterTreeItem
    | ClusterDetailsTreeItem
    | ClusterEssentialsTreeItem
    | ClusterMapTreeItem
    | ManifestTreeItem
    | HealthTreeItem
    | EventsTreeItem
    | RepairTasksTreeItem
    | ImageStoreTreeItem
    | ImageStoreFolderTreeItem
    | ImageStoreFileTreeItem
    | NodeTreeItem
    | ApplicationTreeItem
    | ApplicationTypeTreeItem
    | ApplicationManifestTreeItem
    | ServiceTreeItem
    | ServiceManifestTreeItem
    | ServiceHealthTreeItem
    | ServiceEventsTreeItem
    | PartitionTreeItem
    | PartitionHealthTreeItem
    | PartitionEventsTreeItem
    | ReplicaTreeItem
    | ReplicaHealthTreeItem
    | ReplicaEventsTreeItem
    | DeployedApplicationTreeItem
    | DeployedServicePackageTreeItem
    | DeployedCodePackageTreeItem
    | DeployedReplicaTreeItem;

/**
 * Type guard to check if item is a specific type
 */
export function isItemType<T extends AnyTreeItem>(
    item: any,
    itemType: ItemType
): item is T {
    return item && typeof item === 'object' && item.itemType === itemType;
}

/**
 * Type guards for common checks
 */
export function isNodeTreeItem(item: any): item is NodeTreeItem {
    return isItemType<NodeTreeItem>(item, 'node');
}

export function isServiceTreeItem(item: any): item is ServiceTreeItem {
    return isItemType<ServiceTreeItem>(item, 'service');
}

export function isReplicaTreeItem(item: any): item is ReplicaTreeItem {
    return isItemType<ReplicaTreeItem>(item, 'replica');
}

export function isApplicationTreeItem(item: any): item is ApplicationTreeItem {
    return isItemType<ApplicationTreeItem>(item, 'application');
}

export function isEventsTreeItem(item: any): item is EventsTreeItem {
    return isItemType<EventsTreeItem>(item, 'events');
}
