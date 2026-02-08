/**
 * Cluster-related type definitions
 * Extracted from sfConfiguration.ts to break circular dependency with sfRest.ts
 */
import * as sfModels from '../sdk/servicefabric/servicefabric/src/models';

/**
 * Node type grouping — groups nodes by their Service Fabric node type
 */
export type nodeType = {
    name: string;
    nodes: sfModels.NodeInfo[];
};

/**
 * Client certificate information for cluster authentication
 * Used for both thumbprint-based and CN-based certificate identification
 */
export type clusterCertificate = {
    certificate?: string;
    thumbprint?: string;
    commonName?: string;
    key?: string;
};

/**
 * Cluster endpoint connection information
 * Contains the endpoint URL and optional certificate/manifest data
 */
export type clusterEndpointInfo = {
    endpoint: string;
    clusterCertificate?: clusterCertificate;
    manifest?: string;
};
