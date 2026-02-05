/**
 * Constants for tree view item types
 * Centralizes magic strings used throughout the extension
 */

export const ItemTypes = {
    // Cluster-level items
    CLUSTER: 'cluster',
    DETAILS: 'details',
    ESSENTIALS: 'essentials',
    CLUSTER_MAP: 'cluster-map',
    MANIFEST: 'manifest',
    HEALTH: 'health',
    EVENTS: 'events',
    REPAIR_TASKS: 'repair-tasks',
    
    // Image Store items
    IMAGE_STORE: 'image-store',
    IMAGE_STORE_FOLDER: 'image-store-folder',
    IMAGE_STORE_FILE: 'image-store-file',
    
    // Node items
    NODE: 'node',
    
    // Application items
    APPLICATION: 'application',
    APPLICATION_TYPE: 'application-type',
    APPLICATION_MANIFEST: 'application-manifest',
    
    // Service items
    SERVICE: 'service',
    SERVICE_MANIFEST: 'service-manifest',
    SERVICE_HEALTH: 'service-health',
    SERVICE_EVENTS: 'service-events',
    
    // Partition items
    PARTITION: 'partition',
    PARTITION_HEALTH: 'partition-health',
    PARTITION_EVENTS: 'partition-events',
    
    // Replica items
    REPLICA: 'replica',
    REPLICA_HEALTH: 'replica-health',
    REPLICA_EVENTS: 'replica-events',
    
    // Deployed application items
    DEPLOYED_APPLICATION: 'deployed-application',
    DEPLOYED_SERVICE_PACKAGE: 'deployed-service-package',
    DEPLOYED_CODE_PACKAGE: 'deployed-code-package',
    DEPLOYED_REPLICA: 'deployed-replica',
} as const;

// Type helper for type safety
export type ItemType = typeof ItemTypes[keyof typeof ItemTypes];

/**
 * Health states
 */
export const HealthStates = {
    OK: 'Ok',
    WARNING: 'Warning',
    ERROR: 'Error',
    UNKNOWN: 'Unknown',
} as const;

export type HealthState = typeof HealthStates[keyof typeof HealthStates];

/**
 * Node statuses
 */
export const NodeStatuses = {
    UP: 'Up',
    DOWN: 'Down',
    ENABLING: 'Enabling',
    DISABLING: 'Disabling',
    DISABLED: 'Disabled',
    UNKNOWN: 'Unknown',
    REMOVED: 'Removed',
} as const;

export type NodeStatus = typeof NodeStatuses[keyof typeof NodeStatuses];

/**
 * Service kinds
 */
export const ServiceKinds = {
    STATEFUL: 'Stateful',
    STATELESS: 'Stateless',
} as const;

export type ServiceKind = typeof ServiceKinds[keyof typeof ServiceKinds];

/**
 * Upgrade states
 */
export const UpgradeStates = {
    ROLLING_FORWARD_IN_PROGRESS: 'RollingForwardInProgress',
    ROLLING_BACK_IN_PROGRESS: 'RollingBackInProgress',
    ROLLING_FORWARD_PENDING: 'RollingForwardPending',
    ROLLING_FORWARD_COMPLETED: 'RollingForwardCompleted',
    ROLLING_BACK_COMPLETED: 'RollingBackCompleted',
    FAILED: 'Failed',
} as const;

export type UpgradeState = typeof UpgradeStates[keyof typeof UpgradeStates];
