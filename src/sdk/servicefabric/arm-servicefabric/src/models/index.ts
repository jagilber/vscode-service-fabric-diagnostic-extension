import * as coreClient from "@azure/core-client";

export type PartitionSchemeDescriptionUnion =
  | PartitionSchemeDescription
  | NamedPartitionSchemeDescription
  | SingletonPartitionSchemeDescription
  | UniformInt64RangePartitionSchemeDescription;
export type ServiceResourcePropertiesUnion =
  | ServiceResourceProperties
  | StatefulServiceProperties
  | StatelessServiceProperties;
export type ServiceResourceUpdatePropertiesUnion =
  | ServiceResourceUpdateProperties
  | StatefulServiceUpdateProperties
  | StatelessServiceUpdateProperties;

/** The detail of the Service Fabric runtime version result */
export interface ClusterVersionDetails {
  /** The Service Fabric runtime version of the cluster. */
  codeVersion?: string;
  /** The date of expiry of support of the version. */
  supportExpiryUtc?: string;
  /** Indicates if this version is for Windows or Linux operating system. */
  environment?: ClusterEnvironment;
}

/** The settings to enable AAD authentication on the cluster. */
export interface AzureActiveDirectory {
  /** Azure active directory tenant id. */
  tenantId?: string;
  /** Azure active directory cluster application id. */
  clusterApplication?: string;
  /** Azure active directory client application id. */
  clientApplication?: string;
}

/** Describes the certificate details. */
export interface CertificateDescription {
  /** Thumbprint of the primary certificate. */
  thumbprint: string;
  /** Thumbprint of the secondary certificate. */
  thumbprintSecondary?: string;
  /** The local certificate store location. */
  x509StoreName?: StoreName;
}

/** Describes a list of server certificates referenced by common name that are used to secure the cluster. */
export interface ServerCertificateCommonNames {
  /** The list of server certificates referenced by common name that are used to secure the cluster. */
  commonNames?: ServerCertificateCommonName[];
  /** The local certificate store location. */
  x509StoreName?: StoreName;
}

/** Describes the server certificate details using common name. */
export interface ServerCertificateCommonName {
  /** The common name of the server certificate. */
  certificateCommonName: string;
  /** The issuer thumbprint of the server certificate. */
  certificateIssuerThumbprint: string;
}

/** Describes the client certificate details using common name. */
export interface ClientCertificateCommonName {
  /** Indicates if the client certificate has admin access to the cluster. Non admin clients can perform only read only operations on the cluster. */
  isAdmin: boolean;
  /** The common name of the client certificate. */
  certificateCommonName: string;
  /** The issuer thumbprint of the client certificate. */
  certificateIssuerThumbprint: string;
}

/** Describes the client certificate details using thumbprint. */
export interface ClientCertificateThumbprint {
  /** Indicates if the client certificate has admin access to the cluster. Non admin clients can perform only read only operations on the cluster. */
  isAdmin: boolean;
  /** The thumbprint of the client certificate. */
  certificateThumbprint: string;
}

/** The storage account information for storing Service Fabric diagnostic logs. */
export interface DiagnosticsStorageAccountConfig {
  /** The Azure storage account name. */
  storageAccountName: string;
  /** The protected diagnostics storage key name. */
  protectedAccountKeyName: string;
  /** The secondary protected diagnostics storage key name. If one of the storage account keys is rotated the cluster will fallback to using the other. */
  protectedAccountKeyName2?: string;
  /** The blob endpoint of the azure storage account. */
  blobEndpoint: string;
  /** The queue endpoint of the azure storage account. */
  queueEndpoint: string;
  /** The table endpoint of the azure storage account. */
  tableEndpoint: string;
}

/** Describes a section in the fabric settings of the cluster. */
export interface SettingsSectionDescription {
  /** The section name of the fabric settings. */
  name: string;
  /** The collection of parameters in the section. */
  parameters: SettingsParameterDescription[];
}

/** Describes a parameter in fabric settings of the cluster. */
export interface SettingsParameterDescription {
  /** The parameter name of fabric setting. */
  name: string;
  /** The parameter value of fabric setting. */
  value: string;
}

/** Describes a node type in the cluster, each node type represents sub set of nodes in the cluster. */
export interface NodeTypeDescription {
  /** The name of the node type. */
  name: string;
  /** The placement tags applied to nodes in the node type, which can be used to indicate where certain services (workload) should run. */
  placementProperties?: { [propertyName: string]: string };
  /** The capacity tags applied to the nodes in the node type, the cluster resource manager uses these tags to understand how much resource a node has. */
  capacities?: { [propertyName: string]: string };
  /** The TCP cluster management endpoint port. */
  clientConnectionEndpointPort: number;
  /** The HTTP cluster management endpoint port. */
  httpGatewayEndpointPort: number;
  /**
   * The durability level of the node type. Learn about [DurabilityLevel](https://docs.microsoft.com/azure/service-fabric/service-fabric-cluster-capacity).
   *
   *   - Bronze - No privileges. This is the default.
   *   - Silver - The infrastructure jobs can be paused for a duration of 10 minutes per UD.
   *   - Gold - The infrastructure jobs can be paused for a duration of 2 hours per UD. Gold durability can be enabled only on full node VM skus like D15_V2, G5 etc.
   *
   */
  durabilityLevel?: DurabilityLevel;
  /** The range of ports from which cluster assigned port to Service Fabric applications. */
  applicationPorts?: EndpointRangeDescription;
  /** The range of ephemeral ports that nodes in this node type should be configured with. */
  ephemeralPorts?: EndpointRangeDescription;
  /** The node type on which system services will run. Only one node type should be marked as primary. Primary node type cannot be deleted or changed for existing clusters. */
  isPrimary: boolean;
  /** VMInstanceCount should be 1 to n, where n indicates the number of VM instances corresponding to this nodeType. VMInstanceCount = 0 can be done only in these scenarios: NodeType is a secondary nodeType. Durability = Bronze or Durability >= Bronze and InfrastructureServiceManager = true. If VMInstanceCount = 0, implies the VMs for this nodeType will not be used for the initial cluster size computation. */
  vmInstanceCount: number;
  /** The endpoint used by reverse proxy. */
  reverseProxyEndpointPort?: number;
  /** Indicates if the node type can only host Stateless workloads. */
  isStateless?: boolean;
  /** Indicates if the node type is enabled to support multiple zones. */
  multipleAvailabilityZones?: boolean;
}

/** Port range details */
export interface EndpointRangeDescription {
  /** Starting port of a range of ports */
  startPort: number;
  /** End port of a range of ports */
  endPort: number;
}

/** Describes the policy used when upgrading the cluster. */
export interface ClusterUpgradePolicy {
  /** If true, then processes are forcefully restarted during upgrade even when the code version has not changed (the upgrade only changes configuration or data). */
  forceRestart?: boolean;
  /** The maximum amount of time to block processing of an upgrade domain and prevent loss of availability when there are unexpected issues. When this timeout expires, processing of the upgrade domain will proceed regardless of availability loss issues. The timeout is reset at the start of each upgrade domain. The timeout can be in either hh:mm:ss or in d.hh:mm:ss.ms format. */
  upgradeReplicaSetCheckTimeout: string;
  /** The length of time to wait after completing an upgrade domain before performing health checks. The duration can be in either hh:mm:ss or in d.hh:mm:ss.ms format. */
  healthCheckWaitDuration: string;
  /** The amount of time that the application or cluster must remain healthy before the upgrade proceeds to the next upgrade domain. The duration can be in either hh:mm:ss or in d.hh:mm:ss.ms format. */
  healthCheckStableDuration: string;
  /** The amount of time to retry health evaluation when the application or cluster is unhealthy before the upgrade rolls back. The timeout can be in either hh:mm:ss or in d.hh:mm:ss.ms format. */
  healthCheckRetryTimeout: string;
  /** The amount of time the overall upgrade has to complete before the upgrade rolls back. The timeout can be in either hh:mm:ss or in d.hh:mm:ss.ms format. */
  upgradeTimeout: string;
  /** The amount of time each upgrade domain has to complete before the upgrade rolls back. The timeout can be in either hh:mm:ss or in d.hh:mm:ss.ms format. */
  upgradeDomainTimeout: string;
  /** The cluster health policy used when upgrading the cluster. */
  healthPolicy: ClusterHealthPolicy;
  /** The cluster delta health policy used when upgrading the cluster. */
  deltaHealthPolicy?: ClusterUpgradeDeltaHealthPolicy;
}

/**
 * Defines a health policy used to evaluate the health of the cluster or of a cluster node.
 *
 */
export interface ClusterHealthPolicy {
  /**
   * The maximum allowed percentage of unhealthy nodes before reporting an error. For example, to allow 10% of nodes to be unhealthy, this value would be 10.
   *
   * The percentage represents the maximum tolerated percentage of nodes that can be unhealthy before the cluster is considered in error.
   * If the percentage is respected but there is at least one unhealthy node, the health is evaluated as Warning.
   * The percentage is calculated by dividing the number of unhealthy nodes over the total number of nodes in the cluster.
   * The computation rounds up to tolerate one failure on small numbers of nodes. Default percentage is zero.
   *
   * In large clusters, some nodes will always be down or out for repairs, so this percentage should be configured to tolerate that.
   *
   */
  maxPercentUnhealthyNodes?: number;
  /**
   * The maximum allowed percentage of unhealthy applications before reporting an error. For example, to allow 10% of applications to be unhealthy, this value would be 10.
   *
   * The percentage represents the maximum tolerated percentage of applications that can be unhealthy before the cluster is considered in error.
   * If the percentage is respected but there is at least one unhealthy application, the health is evaluated as Warning.
   * This is calculated by dividing the number of unhealthy applications over the total number of application instances in the cluster, excluding applications of application types that are included in the ApplicationTypeHealthPolicyMap.
   * The computation rounds up to tolerate one failure on small numbers of applications. Default percentage is zero.
   *
   */
  maxPercentUnhealthyApplications?: number;
  /** Defines the application health policy map used to evaluate the health of an application or one of its children entities. */
  applicationHealthPolicies?: {
    [propertyName: string]: ApplicationHealthPolicy;
  };
}

/**
 * Defines a health policy used to evaluate the health of an application or one of its children entities.
 *
 */
export interface ApplicationHealthPolicy {
  /** The health policy used by default to evaluate the health of a service type. */
  defaultServiceTypeHealthPolicy?: ServiceTypeHealthPolicy;
  /** The map with service type health policy per service type name. The map is empty by default. */
  serviceTypeHealthPolicies?: {
    [propertyName: string]: ServiceTypeHealthPolicy;
  };
}

/**
 * Represents the health policy used to evaluate the health of services belonging to a service type.
 *
 */
export interface ServiceTypeHealthPolicy {
  /**
   * The maximum percentage of services allowed to be unhealthy before your application is considered in error.
   *
   */
  maxPercentUnhealthyServices?: number;
}

/** Describes the delta health policies for the cluster upgrade. */
export interface ClusterUpgradeDeltaHealthPolicy {
  /**
   * The maximum allowed percentage of nodes health degradation allowed during cluster upgrades.
   * The delta is measured between the state of the nodes at the beginning of upgrade and the state of the nodes at the time of the health evaluation.
   * The check is performed after every upgrade domain upgrade completion to make sure the global state of the cluster is within tolerated limits.
   *
   */
  maxPercentDeltaUnhealthyNodes: number;
  /**
   * The maximum allowed percentage of upgrade domain nodes health degradation allowed during cluster upgrades.
   * The delta is measured between the state of the upgrade domain nodes at the beginning of upgrade and the state of the upgrade domain nodes at the time of the health evaluation.
   * The check is performed after every upgrade domain upgrade completion for all completed upgrade domains to make sure the state of the upgrade domains is within tolerated limits.
   *
   */
  maxPercentUpgradeDomainDeltaUnhealthyNodes: number;
  /**
   * The maximum allowed percentage of applications health degradation allowed during cluster upgrades.
   * The delta is measured between the state of the applications at the beginning of upgrade and the state of the applications at the time of the health evaluation.
   * The check is performed after every upgrade domain upgrade completion to make sure the global state of the cluster is within tolerated limits. System services are not included in this.
   *
   */
  maxPercentDeltaUnhealthyApplications: number;
  /** Defines the application delta health policy map used to evaluate the health of an application or one of its child entities when upgrading the cluster. */
  applicationDeltaHealthPolicies?: {
    [propertyName: string]: ApplicationDeltaHealthPolicy;
  };
}

/**
 * Defines a delta health policy used to evaluate the health of an application or one of its child entities when upgrading the cluster.
 *
 */
export interface ApplicationDeltaHealthPolicy {
  /** The delta health policy used by default to evaluate the health of a service type when upgrading the cluster. */
  defaultServiceTypeDeltaHealthPolicy?: ServiceTypeDeltaHealthPolicy;
  /** The map with service type delta health policy per service type name. The map is empty by default. */
  serviceTypeDeltaHealthPolicies?: {
    [propertyName: string]: ServiceTypeDeltaHealthPolicy;
  };
}

/**
 * Represents the delta health policy used to evaluate the health of services belonging to a service type when upgrading the cluster.
 *
 */
export interface ServiceTypeDeltaHealthPolicy {
  /**
   * The maximum allowed percentage of services health degradation allowed during cluster upgrades.
   * The delta is measured between the state of the services at the beginning of upgrade and the state of the services at the time of the health evaluation.
   * The check is performed after every upgrade domain upgrade completion to make sure the global state of the cluster is within tolerated limits.
   *
   */
  maxPercentDeltaUnhealthyServices?: number;
}

export interface ApplicationTypeVersionsCleanupPolicy {
  /** Number of unused versions per application type to keep. */
  maxUnusedVersionsToKeep: number;
}

/** Describes the notification channel for cluster events. */
export interface Notification {
  /** Indicates if the notification is enabled. */
  isEnabled: boolean;
  /** The category of notification. */
  notificationCategory: NotificationCategory;
  /** The level of notification. */
  notificationLevel: NotificationLevel;
  /** List of targets that subscribe to the notification. */
  notificationTargets: NotificationTarget[];
}

/** Describes the notification target properties. */
export interface NotificationTarget {
  /** The notification channel indicates the type of receivers subscribed to the notification, either user or subscription. */
  notificationChannel: NotificationChannel;
  /** List of targets that subscribe to the notification. */
  receivers: string[];
}

/** The resource model definition. */
export interface Resource {
  /**
   * Azure resource identifier.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly id?: string;
  /**
   * Azure resource name.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly name?: string;
  /**
   * Azure resource type.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly type?: string;
  /** Azure resource location. */
  location: string;
  /** Azure resource tags. */
  tags?: { [propertyName: string]: string };
  /**
   * Azure resource etag.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly etag?: string;
  /**
   * Metadata pertaining to creation and last modification of the resource.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly systemData?: SystemData;
}

/** Metadata pertaining to creation and last modification of the resource. */
export interface SystemData {
  /** The identity that created the resource. */
  createdBy?: string;
  /** The type of identity that created the resource. */
  createdByType?: string;
  /** The timestamp of resource creation (UTC). */
  createdAt?: Date;
  /** The identity that last modified the resource. */
  lastModifiedBy?: string;
  /** The type of identity that last modified the resource. */
  lastModifiedByType?: string;
  /** The timestamp of resource last modification (UTC). */
  lastModifiedAt?: Date;
}

/** The structure of the error. */
export interface ErrorModel {
  /** The error details. */
  error?: ErrorModelError;
}

/** The error details. */
export interface ErrorModelError {
  /** The error code. */
  code?: string;
  /** The error message. */
  message?: string;
}

/** Cluster update request */
export interface ClusterUpdateParameters {
  /** Cluster update parameters */
  tags?: { [propertyName: string]: string };
  /** The list of add-on features to enable in the cluster. */
  addOnFeatures?: AddOnFeatures[];
  /** The certificate to use for securing the cluster. The certificate provided will be used for  node to node security within the cluster, SSL certificate for cluster management endpoint and default  admin client. */
  certificate?: CertificateDescription;
  /** Describes a list of server certificates referenced by common name that are used to secure the cluster. */
  certificateCommonNames?: ServerCertificateCommonNames;
  /** The list of client certificates referenced by common name that are allowed to manage the cluster. This will overwrite the existing list. */
  clientCertificateCommonNames?: ClientCertificateCommonName[];
  /** The list of client certificates referenced by thumbprint that are allowed to manage the cluster. This will overwrite the existing list. */
  clientCertificateThumbprints?: ClientCertificateThumbprint[];
  /** The Service Fabric runtime version of the cluster. This property can only by set the user when **upgradeMode** is set to 'Manual'. To get list of available Service Fabric versions for new clusters use [ClusterVersion API](https://learn.microsoft.com/rest/api/servicefabric/cluster-versions/list). To get the list of available version for existing clusters use **availableClusterVersions**. */
  clusterCodeVersion?: string;
  /** Indicates if the event store service is enabled. */
  eventStoreServiceEnabled?: boolean;
  /** The list of custom fabric settings to configure the cluster. This will overwrite the existing list. */
  fabricSettings?: SettingsSectionDescription[];
  /** The list of node types in the cluster. This will overwrite the existing list. */
  nodeTypes?: NodeTypeDescription[];
  /**
   * The reliability level sets the replica set size of system services. Learn about [ReliabilityLevel](https://docs.microsoft.com/azure/service-fabric/service-fabric-cluster-capacity).
   *
   *   - None - Run the System services with a target replica set count of 1. This should only be used for test clusters.
   *   - Bronze - Run the System services with a target replica set count of 3. This should only be used for test clusters.
   *   - Silver - Run the System services with a target replica set count of 5.
   *   - Gold - Run the System services with a target replica set count of 7.
   *   - Platinum - Run the System services with a target replica set count of 9.
   *
   */
  reliabilityLevel?: ReliabilityLevel;
  /** The server certificate used by reverse proxy. */
  reverseProxyCertificate?: CertificateDescription;
  /** The policy to use when upgrading the cluster. */
  upgradeDescription?: ClusterUpgradePolicy;
  /** The policy used to clean up unused versions. */
  applicationTypeVersionsCleanupPolicy?: ApplicationTypeVersionsCleanupPolicy;
  /** The upgrade mode of the cluster when new Service Fabric runtime version is available. */
  upgradeMode?: UpgradeMode;
  /** This property controls the logical grouping of VMs in upgrade domains (UDs). This property can't be modified if a node type with multiple Availability Zones is already present in the cluster. */
  sfZonalUpgradeMode?: SfZonalUpgradeMode;
  /** This property defines the upgrade mode for the virtual machine scale set, it is mandatory if a node type with multiple Availability Zones is added. */
  vmssZonalUpgradeMode?: VmssZonalUpgradeMode;
  /** Indicates if infrastructure service manager is enabled. */
  infrastructureServiceManager?: boolean;
  /** Indicates when new cluster runtime version upgrades will be applied after they are released. By default is Wave0. Only applies when **upgradeMode** is set to 'Automatic'. */
  upgradeWave?: ClusterUpgradeCadence;
  /** The start timestamp to pause runtime version upgrades on the cluster (UTC). */
  upgradePauseStartTimestampUtc?: Date;
  /** The end timestamp of pause runtime version upgrades on the cluster (UTC). */
  upgradePauseEndTimestampUtc?: Date;
  /** Boolean to pause automatic runtime version upgrades to the cluster. */
  waveUpgradePaused?: boolean;
  /** Indicates a list of notification channels for cluster events. */
  notifications?: Notification[];
}

/** Cluster list results */
export interface ClusterListResult {
  value?: Cluster[];
  /** The URL to use for getting the next set of results. */
  nextLink?: string;
}

/** The list results of the Service Fabric runtime versions. */
export interface ClusterCodeVersionsListResult {
  value?: ClusterCodeVersionsResult[];
  /** The URL to use for getting the next set of results. */
  nextLink?: string;
}

/** The result of the Service Fabric runtime versions */
export interface ClusterCodeVersionsResult {
  /** The identification of the result */
  id?: string;
  /** The name of the result */
  name?: string;
  /** The result resource type */
  type?: string;
  /** The Service Fabric runtime version of the cluster. */
  codeVersion?: string;
  /** The date of expiry of support of the version. */
  supportExpiryUtc?: string;
  /** Indicates if this version is for Windows or Linux operating system. */
  environment?: ClusterEnvironment;
}

export interface UpgradableVersionsDescription {
  /** The target code version. */
  targetVersion: string;
}

/** The list of intermediate cluster code versions for an upgrade or downgrade. Or minimum and maximum upgradable version if no target was given */
export interface UpgradableVersionPathResult {
  supportedPath?: string[];
}

/** Describes the result of the request to list Service Fabric resource provider operations. */
export interface OperationListResult {
  /** List of operations supported by the Service Fabric resource provider. */
  value?: OperationResult[];
  /**
   * URL to get the next set of operation list results if there are any.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly nextLink?: string;
}

/** Available operation list result */
export interface OperationResult {
  /** The name of the operation. */
  name?: string;
  /** Indicates whether the operation is a data action */
  isDataAction?: boolean;
  /** The object that represents the operation. */
  display?: AvailableOperationDisplay;
  /** Origin result */
  origin?: string;
  /** The URL to use for getting the next set of results. */
  nextLink?: string;
}

/** Operation supported by the Service Fabric resource provider */
export interface AvailableOperationDisplay {
  /** The name of the provider. */
  provider?: string;
  /** The resource on which the operation is performed */
  resource?: string;
  /** The operation that can be performed. */
  operation?: string;
  /** Operation description */
  description?: string;
}

/** The resource model definition for proxy-only resource. */
export interface ProxyResource {
  /**
   * Azure resource identifier.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly id?: string;
  /**
   * Azure resource name.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly name?: string;
  /**
   * Azure resource type.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly type?: string;
  /** It will be deprecated in New API, resource location depends on the parent resource. */
  location?: string;
  /** Azure resource tags. */
  tags?: { [propertyName: string]: string };
  /**
   * Azure resource etag.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly etag?: string;
  /**
   * Metadata pertaining to creation and last modification of the resource.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly systemData?: SystemData;
}

/** The list of application type names. */
export interface ApplicationTypeResourceList {
  value?: ApplicationTypeResource[];
  /**
   * URL to get the next set of application type list results if there are any.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly nextLink?: string;
}

/** The list of application type version resources for the specified application type name resource. */
export interface ApplicationTypeVersionResourceList {
  value?: ApplicationTypeVersionResource[];
  /**
   * URL to get the next set of application type version list results if there are any.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly nextLink?: string;
}

/** Describes the managed identities for an Azure resource. */
export interface ManagedIdentity {
  /**
   * The principal id of the managed identity. This property will only be provided for a system assigned identity.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly principalId?: string;
  /**
   * The tenant id of the managed identity. This property will only be provided for a system assigned identity.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly tenantId?: string;
  /** The type of managed identity for the resource. */
  type?: ManagedIdentityType;
  /**
   * The list of user identities associated with the resource. The user identity dictionary key references will be ARM resource ids in the form:
   * '/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ManagedIdentity/userAssignedIdentities/{identityName}'.
   *
   */
  userAssignedIdentities?: { [propertyName: string]: UserAssignedIdentity };
}

export interface UserAssignedIdentity {
  /**
   * The principal id of user assigned identity.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly principalId?: string;
  /**
   * The client id of user assigned identity.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly clientId?: string;
}

/** The application resource properties for patch operations. */
export interface ApplicationResourceUpdateProperties {
  /** The version of the application type as defined in the application manifest. */
  typeVersion?: string;
  /** List of application parameters with overridden values from their default values specified in the application manifest. */
  parameters?: { [propertyName: string]: string };
  /** Describes the policy for a monitored application upgrade. */
  upgradePolicy?: ApplicationUpgradePolicy;
  /** The minimum number of nodes where Service Fabric will reserve capacity for this application. Note that this does not mean that the services of this application will be placed on all of those nodes. If this property is set to zero, no capacity will be reserved. The value of this property cannot be more than the value of the MaximumNodes property. */
  minimumNodes?: number;
  /** The maximum number of nodes where Service Fabric will reserve capacity for this application. Note that this does not mean that the services of this application will be placed on all of those nodes. By default, the value of this property is zero and it means that the services can be placed on any node. */
  maximumNodes?: number;
  /** Remove the current application capacity settings. */
  removeApplicationCapacity?: boolean;
  /** List of application capacity metric description. */
  metrics?: ApplicationMetricDescription[];
  /** List of user assigned identities for the application, each mapped to a friendly name. */
  managedIdentities?: ApplicationUserAssignedIdentity[];
}

/** Describes the policy for a monitored application upgrade. */
export interface ApplicationUpgradePolicy {
  /** The maximum amount of time to block processing of an upgrade domain and prevent loss of availability when there are unexpected issues. When this timeout expires, processing of the upgrade domain will proceed regardless of availability loss issues. The timeout is reset at the start of each upgrade domain. Valid values are between 0 and 42949672925 inclusive. (unsigned 32-bit integer). */
  upgradeReplicaSetCheckTimeout?: string;
  /** If true, then processes are forcefully restarted during upgrade even when the code version has not changed (the upgrade only changes configuration or data). */
  forceRestart?: boolean;
  /** The policy used for monitoring the application upgrade */
  rollingUpgradeMonitoringPolicy?: ArmRollingUpgradeMonitoringPolicy;
  /**
   * Defines a health policy used to evaluate the health of an application or one of its children entities.
   *
   */
  applicationHealthPolicy?: ArmApplicationHealthPolicy;
  /** The mode used to monitor health during a rolling upgrade. The values are UnmonitoredAuto, UnmonitoredManual, and Monitored. */
  upgradeMode?: RollingUpgradeMode;
  /** Determines whether the application should be recreated on update. If value=true, the rest of the upgrade policy parameters are not allowed and it will result in availability loss. */
  recreateApplication?: boolean;
}

/** The policy used for monitoring the application upgrade */
export interface ArmRollingUpgradeMonitoringPolicy {
  /** The activation Mode of the service package */
  failureAction?: ArmUpgradeFailureAction;
  /** The amount of time to wait after completing an upgrade domain before applying health policies. It is first interpreted as a string representing an ISO 8601 duration. If that fails, then it is interpreted as a number representing the total number of milliseconds. */
  healthCheckWaitDuration?: string;
  /** The amount of time that the application or cluster must remain healthy before the upgrade proceeds to the next upgrade domain. It is first interpreted as a string representing an ISO 8601 duration. If that fails, then it is interpreted as a number representing the total number of milliseconds. */
  healthCheckStableDuration?: string;
  /** The amount of time to retry health evaluation when the application or cluster is unhealthy before FailureAction is executed. It is first interpreted as a string representing an ISO 8601 duration. If that fails, then it is interpreted as a number representing the total number of milliseconds. */
  healthCheckRetryTimeout?: string;
  /** The amount of time the overall upgrade has to complete before FailureAction is executed. It is first interpreted as a string representing an ISO 8601 duration. If that fails, then it is interpreted as a number representing the total number of milliseconds. */
  upgradeTimeout?: string;
  /** The amount of time each upgrade domain has to complete before FailureAction is executed. It is first interpreted as a string representing an ISO 8601 duration. If that fails, then it is interpreted as a number representing the total number of milliseconds. */
  upgradeDomainTimeout?: string;
}

/**
 * Defines a health policy used to evaluate the health of an application or one of its children entities.
 *
 */
export interface ArmApplicationHealthPolicy {
  /** Indicates whether warnings are treated with the same severity as errors. */
  considerWarningAsError?: boolean;
  /**
   * The maximum allowed percentage of unhealthy deployed applications. Allowed values are Byte values from zero to 100.
   * The percentage represents the maximum tolerated percentage of deployed applications that can be unhealthy before the application is considered in error.
   * This is calculated by dividing the number of unhealthy deployed applications over the number of nodes where the application is currently deployed on in the cluster.
   * The computation rounds up to tolerate one failure on small numbers of nodes. Default percentage is zero.
   *
   */
  maxPercentUnhealthyDeployedApplications?: number;
  /** The health policy used by default to evaluate the health of a service type. */
  defaultServiceTypeHealthPolicy?: ArmServiceTypeHealthPolicy;
  /** The map with service type health policy per service type name. The map is empty by default. */
  serviceTypeHealthPolicyMap?: {
    [propertyName: string]: ArmServiceTypeHealthPolicy;
  };
}

/**
 * Represents the health policy used to evaluate the health of services belonging to a service type.
 *
 */
export interface ArmServiceTypeHealthPolicy {
  /**
   * The maximum percentage of services allowed to be unhealthy before your application is considered in error.
   *
   */
  maxPercentUnhealthyServices?: number;
  /**
   * The maximum percentage of partitions per service allowed to be unhealthy before your application is considered in error.
   *
   */
  maxPercentUnhealthyPartitionsPerService?: number;
  /**
   * The maximum percentage of replicas per partition allowed to be unhealthy before your application is considered in error.
   *
   */
  maxPercentUnhealthyReplicasPerPartition?: number;
}

/**
 * Describes capacity information for a custom resource balancing metric. This can be used to limit the total consumption of this metric by the services of this application.
 *
 */
export interface ApplicationMetricDescription {
  /** The name of the metric. */
  name?: string;
  /**
   * The maximum node capacity for Service Fabric application.
   * This is the maximum Load for an instance of this application on a single node. Even if the capacity of node is greater than this value, Service Fabric will limit the total load of services within the application on each node to this value.
   * If set to zero, capacity for this metric is unlimited on each node.
   * When creating a new application with application capacity defined, the product of MaximumNodes and this value must always be smaller than or equal to TotalApplicationCapacity.
   * When updating existing application with application capacity, the product of MaximumNodes and this value must always be smaller than or equal to TotalApplicationCapacity.
   *
   */
  maximumCapacity?: number;
  /**
   * The node reservation capacity for Service Fabric application.
   * This is the amount of load which is reserved on nodes which have instances of this application.
   * If MinimumNodes is specified, then the product of these values will be the capacity reserved in the cluster for the application.
   * If set to zero, no capacity is reserved for this metric.
   * When setting application capacity or when updating application capacity; this value must be smaller than or equal to MaximumCapacity for each metric.
   *
   */
  reservationCapacity?: number;
  /**
   * The total metric capacity for Service Fabric application.
   * This is the total metric capacity for this application in the cluster. Service Fabric will try to limit the sum of loads of services within the application to this value.
   * When creating a new application with application capacity defined, the product of MaximumNodes and MaximumCapacity must always be smaller than or equal to this value.
   *
   */
  totalApplicationCapacity?: number;
}

export interface ApplicationUserAssignedIdentity {
  /** The friendly name of user assigned identity. */
  name: string;
  /** The principal id of user assigned identity. */
  principalId: string;
}

/** The list of application resources. */
export interface ApplicationResourceList {
  value?: ApplicationResource[];
  /**
   * URL to get the next set of application list results if there are any.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly nextLink?: string;
}

/** Describes how the service is partitioned. */
export interface PartitionSchemeDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  partitionScheme: "Named" | "Singleton" | "UniformInt64Range";
}

/** The common service resource properties. */
export interface ServiceResourcePropertiesBase {
  /** The placement constraints as a string. Placement constraints are boolean expressions on node properties and allow for restricting a service to particular nodes based on the service requirements. For example, to place a service on nodes where NodeType is blue specify the following: "NodeColor == blue)". */
  placementConstraints?: string;
  /** A list that describes the correlation of the service with other services. */
  correlationScheme?: ServiceCorrelationDescription[];
  /** The service load metrics is given as an array of ServiceLoadMetricDescription objects. */
  serviceLoadMetrics?: ServiceLoadMetricDescription[];
  /** A list that describes the correlation of the service with other services. */
  servicePlacementPolicies?: ServicePlacementPolicyDescription[];
  /** Specifies the move cost for the service. */
  defaultMoveCost?: MoveCost;
}

/** Creates a particular correlation between services. */
export interface ServiceCorrelationDescription {
  /** The ServiceCorrelationScheme which describes the relationship between this service and the service specified via ServiceName. */
  scheme: ServiceCorrelationScheme;
  /** The name of the service that the correlation relationship is established with. */
  serviceName: string;
}

/** Specifies a metric to load balance a service during runtime. */
export interface ServiceLoadMetricDescription {
  /** The name of the metric. If the service chooses to report load during runtime, the load metric name should match the name that is specified in Name exactly. Note that metric names are case sensitive. */
  name: string;
  /** The service load metric relative weight, compared to other metrics configured for this service, as a number. */
  weight?: ServiceLoadMetricWeight;
  /** Used only for Stateful services. The default amount of load, as a number, that this service creates for this metric when it is a Primary replica. */
  primaryDefaultLoad?: number;
  /** Used only for Stateful services. The default amount of load, as a number, that this service creates for this metric when it is a Secondary replica. */
  secondaryDefaultLoad?: number;
  /** Used only for Stateless services. The default amount of load, as a number, that this service creates for this metric. */
  defaultLoad?: number;
}

/** Describes the policy to be used for placement of a Service Fabric service. */
export interface ServicePlacementPolicyDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  type: "ServicePlacementPolicyDescription";
}

/** The list of service resources. */
export interface ServiceResourceList {
  value?: ServiceResource[];
  /**
   * URL to get the next set of service list results if there are any.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly nextLink?: string;
}

/**
 * The cluster resource
 *
 */
export interface Cluster extends Resource {
  /** The list of add-on features to enable in the cluster. */
  addOnFeatures?: AddOnFeatures[];
  /**
   * The Service Fabric runtime versions available for this cluster.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly availableClusterVersions?: ClusterVersionDetails[];
  /** The AAD authentication settings of the cluster. */
  azureActiveDirectory?: AzureActiveDirectory;
  /** The certificate to use for securing the cluster. The certificate provided will be used for node to node security within the cluster, SSL certificate for cluster management endpoint and default admin client. */
  certificate?: CertificateDescription;
  /** Describes a list of server certificates referenced by common name that are used to secure the cluster. */
  certificateCommonNames?: ServerCertificateCommonNames;
  /** The list of client certificates referenced by common name that are allowed to manage the cluster. */
  clientCertificateCommonNames?: ClientCertificateCommonName[];
  /** The list of client certificates referenced by thumbprint that are allowed to manage the cluster. */
  clientCertificateThumbprints?: ClientCertificateThumbprint[];
  /** The Service Fabric runtime version of the cluster. This property can only by set the user when **upgradeMode** is set to 'Manual'. To get list of available Service Fabric versions for new clusters use [ClusterVersion API](https://learn.microsoft.com/rest/api/servicefabric/cluster-versions/list). To get the list of available version for existing clusters use **availableClusterVersions**. */
  clusterCodeVersion?: string;
  /**
   * The Azure Resource Provider endpoint. A system service in the cluster connects to this  endpoint.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly clusterEndpoint?: string;
  /**
   * A service generated unique identifier for the cluster resource.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly clusterId?: string;
  /**
   * The current state of the cluster.
   *
   *   - WaitingForNodes - Indicates that the cluster resource is created and the resource provider is waiting for Service Fabric VM extension to boot up and report to it.
   *   - Deploying - Indicates that the Service Fabric runtime is being installed on the VMs. Cluster resource will be in this state until the cluster boots up and system services are up.
   *   - BaselineUpgrade - Indicates that the cluster is upgrading to establishes the cluster version. This upgrade is automatically initiated when the cluster boots up for the first time.
   *   - UpdatingUserConfiguration - Indicates that the cluster is being upgraded with the user provided configuration.
   *   - UpdatingUserCertificate - Indicates that the cluster is being upgraded with the user provided certificate.
   *   - UpdatingInfrastructure - Indicates that the cluster is being upgraded with the latest Service Fabric runtime version. This happens only when the **upgradeMode** is set to 'Automatic'.
   *   - EnforcingClusterVersion - Indicates that cluster is on a different version than expected and the cluster is being upgraded to the expected version.
   *   - UpgradeServiceUnreachable - Indicates that the system service in the cluster is no longer polling the Resource Provider. Clusters in this state cannot be managed by the Resource Provider.
   *   - AutoScale - Indicates that the ReliabilityLevel of the cluster is being adjusted.
   *   - Ready - Indicates that the cluster is in a stable state.
   *
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly clusterState?: ClusterState;
  /** The storage account information for storing Service Fabric diagnostic logs. */
  diagnosticsStorageAccountConfig?: DiagnosticsStorageAccountConfig;
  /** Indicates if the event store service is enabled. */
  eventStoreServiceEnabled?: boolean;
  /** The list of custom fabric settings to configure the cluster. */
  fabricSettings?: SettingsSectionDescription[];
  /** The http management endpoint of the cluster. */
  managementEndpoint?: string;
  /** The list of node types in the cluster. */
  nodeTypes?: NodeTypeDescription[];
  /**
   * The provisioning state of the cluster resource.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly provisioningState?: ProvisioningState;
  /**
   * The reliability level sets the replica set size of system services. Learn about [ReliabilityLevel](https://docs.microsoft.com/azure/service-fabric/service-fabric-cluster-capacity).
   *
   *   - None - Run the System services with a target replica set count of 1. This should only be used for test clusters.
   *   - Bronze - Run the System services with a target replica set count of 3. This should only be used for test clusters.
   *   - Silver - Run the System services with a target replica set count of 5.
   *   - Gold - Run the System services with a target replica set count of 7.
   *   - Platinum - Run the System services with a target replica set count of 9.
   *
   */
  reliabilityLevel?: ReliabilityLevel;
  /** The server certificate used by reverse proxy. */
  reverseProxyCertificate?: CertificateDescription;
  /** Describes a list of server certificates referenced by common name that are used to secure the cluster. */
  reverseProxyCertificateCommonNames?: ServerCertificateCommonNames;
  /** The policy to use when upgrading the cluster. */
  upgradeDescription?: ClusterUpgradePolicy;
  /** The upgrade mode of the cluster when new Service Fabric runtime version is available. */
  upgradeMode?: UpgradeMode;
  /** The policy used to clean up unused versions. */
  applicationTypeVersionsCleanupPolicy?: ApplicationTypeVersionsCleanupPolicy;
  /** The VM image VMSS has been configured with. Generic names such as Windows or Linux can be used. */
  vmImage?: string;
  /** This property controls the logical grouping of VMs in upgrade domains (UDs). This property can't be modified if a node type with multiple Availability Zones is already present in the cluster. */
  sfZonalUpgradeMode?: SfZonalUpgradeMode;
  /** This property defines the upgrade mode for the virtual machine scale set, it is mandatory if a node type with multiple Availability Zones is added. */
  vmssZonalUpgradeMode?: VmssZonalUpgradeMode;
  /** Indicates if infrastructure service manager is enabled. */
  infrastructureServiceManager?: boolean;
  /** Indicates when new cluster runtime version upgrades will be applied after they are released. By default is Wave0. Only applies when **upgradeMode** is set to 'Automatic'. */
  upgradeWave?: ClusterUpgradeCadence;
  /** Indicates the start date and time to pause automatic runtime version upgrades on the cluster for an specific period of time on the cluster (UTC). */
  upgradePauseStartTimestampUtc?: Date;
  /** Indicates the end date and time to pause automatic runtime version upgrades on the cluster for an specific period of time on the cluster (UTC). */
  upgradePauseEndTimestampUtc?: Date;
  /** Boolean to pause automatic runtime version upgrades to the cluster. */
  waveUpgradePaused?: boolean;
  /** Indicates a list of notification channels for cluster events. */
  notifications?: Notification[];
}

/** The application type name resource */
export interface ApplicationTypeResource extends ProxyResource {
  /**
   * The current deployment or provisioning state, which only appears in the response.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly provisioningState?: string;
}

/** An application type version resource for the specified application type name resource. */
export interface ApplicationTypeVersionResource extends ProxyResource {
  /**
   * The current deployment or provisioning state, which only appears in the response
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly provisioningState?: string;
  /** The URL to the application package */
  appPackageUrl?: string;
  /**
   * List of application type parameters that can be overridden when creating or updating the application.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly defaultParameterList?: { [propertyName: string]: string };
}

/** The application resource. */
export interface ApplicationResource extends ProxyResource {
  /** Describes the managed identities for an Azure resource. */
  identity?: ManagedIdentity;
  /** The version of the application type as defined in the application manifest. */
  typeVersion?: string;
  /** List of application parameters with overridden values from their default values specified in the application manifest. */
  parameters?: { [propertyName: string]: string };
  /** Describes the policy for a monitored application upgrade. */
  upgradePolicy?: ApplicationUpgradePolicy;
  /** The minimum number of nodes where Service Fabric will reserve capacity for this application. Note that this does not mean that the services of this application will be placed on all of those nodes. If this property is set to zero, no capacity will be reserved. The value of this property cannot be more than the value of the MaximumNodes property. */
  minimumNodes?: number;
  /** The maximum number of nodes where Service Fabric will reserve capacity for this application. Note that this does not mean that the services of this application will be placed on all of those nodes. By default, the value of this property is zero and it means that the services can be placed on any node. */
  maximumNodes?: number;
  /** Remove the current application capacity settings. */
  removeApplicationCapacity?: boolean;
  /** List of application capacity metric description. */
  metrics?: ApplicationMetricDescription[];
  /** List of user assigned identities for the application, each mapped to a friendly name. */
  managedIdentities?: ApplicationUserAssignedIdentity[];
  /**
   * The current deployment or provisioning state, which only appears in the response
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly provisioningState?: string;
  /** The application type name as defined in the application manifest. */
  typeName?: string;
}

/** The application resource for patch operations. */
export interface ApplicationResourceUpdate extends ProxyResource {
  /** The version of the application type as defined in the application manifest. */
  typeVersion?: string;
  /** List of application parameters with overridden values from their default values specified in the application manifest. */
  parameters?: { [propertyName: string]: string };
  /** Describes the policy for a monitored application upgrade. */
  upgradePolicy?: ApplicationUpgradePolicy;
  /** The minimum number of nodes where Service Fabric will reserve capacity for this application. Note that this does not mean that the services of this application will be placed on all of those nodes. If this property is set to zero, no capacity will be reserved. The value of this property cannot be more than the value of the MaximumNodes property. */
  minimumNodes?: number;
  /** The maximum number of nodes where Service Fabric will reserve capacity for this application. Note that this does not mean that the services of this application will be placed on all of those nodes. By default, the value of this property is zero and it means that the services can be placed on any node. */
  maximumNodes?: number;
  /** Remove the current application capacity settings. */
  removeApplicationCapacity?: boolean;
  /** List of application capacity metric description. */
  metrics?: ApplicationMetricDescription[];
  /** List of user assigned identities for the application, each mapped to a friendly name. */
  managedIdentities?: ApplicationUserAssignedIdentity[];
}

/** The service resource. */
export interface ServiceResource extends ProxyResource {
  /** The placement constraints as a string. Placement constraints are boolean expressions on node properties and allow for restricting a service to particular nodes based on the service requirements. For example, to place a service on nodes where NodeType is blue specify the following: "NodeColor == blue)". */
  placementConstraints?: string;
  /** A list that describes the correlation of the service with other services. */
  correlationScheme?: ServiceCorrelationDescription[];
  /** The service load metrics is given as an array of ServiceLoadMetricDescription objects. */
  serviceLoadMetrics?: ServiceLoadMetricDescription[];
  /** A list that describes the correlation of the service with other services. */
  servicePlacementPolicies?: ServicePlacementPolicyDescription[];
  /** Specifies the move cost for the service. */
  defaultMoveCost?: MoveCost;
  /**
   * The current deployment or provisioning state, which only appears in the response
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly provisioningState?: string;
  /** The kind of service (Stateless or Stateful). */
  serviceKind?: ServiceKind;
  /** The name of the service type */
  serviceTypeName?: string;
  /** Describes how the service is partitioned. */
  partitionDescription?: PartitionSchemeDescriptionUnion;
  /** The activation Mode of the service package */
  servicePackageActivationMode?: ArmServicePackageActivationMode;
  /** Dns name used for the service. If this is specified, then the service can be accessed via its DNS name instead of service name. */
  serviceDnsName?: string;
}

/** The service resource for patch operations. */
export interface ServiceResourceUpdate extends ProxyResource {
  /** The placement constraints as a string. Placement constraints are boolean expressions on node properties and allow for restricting a service to particular nodes based on the service requirements. For example, to place a service on nodes where NodeType is blue specify the following: "NodeColor == blue)". */
  placementConstraints?: string;
  /** A list that describes the correlation of the service with other services. */
  correlationScheme?: ServiceCorrelationDescription[];
  /** The service load metrics is given as an array of ServiceLoadMetricDescription objects. */
  serviceLoadMetrics?: ServiceLoadMetricDescription[];
  /** A list that describes the correlation of the service with other services. */
  servicePlacementPolicies?: ServicePlacementPolicyDescription[];
  /** Specifies the move cost for the service. */
  defaultMoveCost?: MoveCost;
  /** The kind of service (Stateless or Stateful). */
  serviceKind?: ServiceKind;
}

/** The application resource properties. */
export interface ApplicationResourceProperties
  extends ApplicationResourceUpdateProperties {
  /**
   * The current deployment or provisioning state, which only appears in the response
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly provisioningState?: string;
  /** The application type name as defined in the application manifest. */
  typeName?: string;
}

/** Describes the named partition scheme of the service. */
export interface NamedPartitionSchemeDescription
  extends PartitionSchemeDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  partitionScheme: "Named";
  /** The number of partitions. */
  count: number;
  /** Array of size specified by the ‘count’ parameter, for the names of the partitions. */
  names: string[];
}

/** SingletonPartitionSchemeDescription */
export interface SingletonPartitionSchemeDescription
  extends PartitionSchemeDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  partitionScheme: "Singleton";
}

/** Describes a partitioning scheme where an integer range is allocated evenly across a number of partitions. */
export interface UniformInt64RangePartitionSchemeDescription
  extends PartitionSchemeDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  partitionScheme: "UniformInt64Range";
  /** The number of partitions. */
  count: number;
  /**
   * String indicating the lower bound of the partition key range that
   * should be split between the partition ‘count’
   *
   */
  lowKey: string;
  /**
   * String indicating the upper bound of the partition key range that
   * should be split between the partition ‘count’
   *
   */
  highKey: string;
}

/** The service resource properties. */
export interface ServiceResourceProperties
  extends ServiceResourcePropertiesBase {
  /**
   * The current deployment or provisioning state, which only appears in the response
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly provisioningState?: string;
  /** The kind of service (Stateless or Stateful). */
  serviceKind: ServiceKind;
  /** The name of the service type */
  serviceTypeName?: string;
  /** Describes how the service is partitioned. */
  partitionDescription?: PartitionSchemeDescriptionUnion;
  /** The activation Mode of the service package */
  servicePackageActivationMode?: ArmServicePackageActivationMode;
  /** Dns name used for the service. If this is specified, then the service can be accessed via its DNS name instead of service name. */
  serviceDnsName?: string;
}

/** The service resource properties for patch operations. */
export interface ServiceResourceUpdateProperties
  extends ServiceResourcePropertiesBase {
  /** The kind of service (Stateless or Stateful). */
  serviceKind: ServiceKind;
}

/** The properties of a stateful service resource. */
export interface StatefulServiceProperties extends ServiceResourceProperties {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  serviceKind: "Stateful";
  /** A flag indicating whether this is a persistent service which stores states on the local disk. If it is then the value of this property is true, if not it is false. */
  hasPersistedState?: boolean;
  /** The target replica set size as a number. */
  targetReplicaSetSize?: number;
  /** The minimum replica set size as a number. */
  minReplicaSetSize?: number;
  /** The duration between when a replica goes down and when a new replica is created, represented in ISO 8601 format (hh:mm:ss.s). */
  replicaRestartWaitDuration?: Date;
  /** The maximum duration for which a partition is allowed to be in a state of quorum loss, represented in ISO 8601 format (hh:mm:ss.s). */
  quorumLossWaitDuration?: Date;
  /** The definition on how long StandBy replicas should be maintained before being removed, represented in ISO 8601 format (hh:mm:ss.s). */
  standByReplicaKeepDuration?: Date;
}

/** The properties of a stateless service resource. */
export interface StatelessServiceProperties extends ServiceResourceProperties {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  serviceKind: "Stateless";
  /** The instance count. */
  instanceCount?: number;
  /** Delay duration for RequestDrain feature to ensures that the endpoint advertised by the stateless instance is removed before the delay starts prior to closing the instance. This delay enables existing requests to drain gracefully before the instance actually goes down (https://docs.microsoft.com/en-us/azure/service-fabric/service-fabric-application-upgrade-advanced#avoid-connection-drops-during-stateless-service-planned-downtime-preview). It is represented in ISO 8601 format (hh:mm:ss.s). */
  instanceCloseDelayDuration?: string;
}

/** The properties of a stateful service resource for patch operations. */
export interface StatefulServiceUpdateProperties
  extends ServiceResourceUpdateProperties {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  serviceKind: "Stateful";
  /** The target replica set size as a number. */
  targetReplicaSetSize?: number;
  /** The minimum replica set size as a number. */
  minReplicaSetSize?: number;
  /** The duration between when a replica goes down and when a new replica is created, represented in ISO 8601 format (hh:mm:ss.s). */
  replicaRestartWaitDuration?: Date;
  /** The maximum duration for which a partition is allowed to be in a state of quorum loss, represented in ISO 8601 format (hh:mm:ss.s). */
  quorumLossWaitDuration?: Date;
  /** The definition on how long StandBy replicas should be maintained before being removed, represented in ISO 8601 format (hh:mm:ss.s). */
  standByReplicaKeepDuration?: Date;
}

/** The properties of a stateless service resource for patch operations. */
export interface StatelessServiceUpdateProperties
  extends ServiceResourceUpdateProperties {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  serviceKind: "Stateless";
  /** The instance count. */
  instanceCount?: number;
  /** Delay duration for RequestDrain feature to ensures that the endpoint advertised by the stateless instance is removed before the delay starts prior to closing the instance. This delay enables existing requests to drain gracefully before the instance actually goes down (https://docs.microsoft.com/en-us/azure/service-fabric/service-fabric-application-upgrade-advanced#avoid-connection-drops-during-stateless-service-planned-downtime-preview). It is first interpreted as a string representing an ISO 8601 duration. It is represented in ISO 8601 format (hh:mm:ss.s). */
  instanceCloseDelayDuration?: string;
}

/** Known values of {@link AddOnFeatures} that the service accepts. */
export enum KnownAddOnFeatures {
  /** RepairManager */
  RepairManager = "RepairManager",
  /** DnsService */
  DnsService = "DnsService",
  /** BackupRestoreService */
  BackupRestoreService = "BackupRestoreService",
  /** ResourceMonitorService */
  ResourceMonitorService = "ResourceMonitorService"
}

/**
 * Defines values for AddOnFeatures. \
 * {@link KnownAddOnFeatures} can be used interchangeably with AddOnFeatures,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **RepairManager** \
 * **DnsService** \
 * **BackupRestoreService** \
 * **ResourceMonitorService**
 */
export type AddOnFeatures = string;

/** Known values of {@link ClusterEnvironment} that the service accepts. */
export enum KnownClusterEnvironment {
  /** Windows */
  Windows = "Windows",
  /** Linux */
  Linux = "Linux"
}

/**
 * Defines values for ClusterEnvironment. \
 * {@link KnownClusterEnvironment} can be used interchangeably with ClusterEnvironment,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Windows** \
 * **Linux**
 */
export type ClusterEnvironment = string;

/** Known values of {@link StoreName} that the service accepts. */
export enum KnownStoreName {
  /** AddressBook */
  AddressBook = "AddressBook",
  /** AuthRoot */
  AuthRoot = "AuthRoot",
  /** CertificateAuthority */
  CertificateAuthority = "CertificateAuthority",
  /** Disallowed */
  Disallowed = "Disallowed",
  /** My */
  My = "My",
  /** Root */
  Root = "Root",
  /** TrustedPeople */
  TrustedPeople = "TrustedPeople",
  /** TrustedPublisher */
  TrustedPublisher = "TrustedPublisher"
}

/**
 * Defines values for StoreName. \
 * {@link KnownStoreName} can be used interchangeably with StoreName,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **AddressBook** \
 * **AuthRoot** \
 * **CertificateAuthority** \
 * **Disallowed** \
 * **My** \
 * **Root** \
 * **TrustedPeople** \
 * **TrustedPublisher**
 */
export type StoreName = string;

/** Known values of {@link ClusterState} that the service accepts. */
export enum KnownClusterState {
  /** WaitingForNodes */
  WaitingForNodes = "WaitingForNodes",
  /** Deploying */
  Deploying = "Deploying",
  /** BaselineUpgrade */
  BaselineUpgrade = "BaselineUpgrade",
  /** UpdatingUserConfiguration */
  UpdatingUserConfiguration = "UpdatingUserConfiguration",
  /** UpdatingUserCertificate */
  UpdatingUserCertificate = "UpdatingUserCertificate",
  /** UpdatingInfrastructure */
  UpdatingInfrastructure = "UpdatingInfrastructure",
  /** EnforcingClusterVersion */
  EnforcingClusterVersion = "EnforcingClusterVersion",
  /** UpgradeServiceUnreachable */
  UpgradeServiceUnreachable = "UpgradeServiceUnreachable",
  /** AutoScale */
  AutoScale = "AutoScale",
  /** Ready */
  Ready = "Ready"
}

/**
 * Defines values for ClusterState. \
 * {@link KnownClusterState} can be used interchangeably with ClusterState,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **WaitingForNodes** \
 * **Deploying** \
 * **BaselineUpgrade** \
 * **UpdatingUserConfiguration** \
 * **UpdatingUserCertificate** \
 * **UpdatingInfrastructure** \
 * **EnforcingClusterVersion** \
 * **UpgradeServiceUnreachable** \
 * **AutoScale** \
 * **Ready**
 */
export type ClusterState = string;

/** Known values of {@link DurabilityLevel} that the service accepts. */
export enum KnownDurabilityLevel {
  /** Bronze */
  Bronze = "Bronze",
  /** Silver */
  Silver = "Silver",
  /** Gold */
  Gold = "Gold"
}

/**
 * Defines values for DurabilityLevel. \
 * {@link KnownDurabilityLevel} can be used interchangeably with DurabilityLevel,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Bronze** \
 * **Silver** \
 * **Gold**
 */
export type DurabilityLevel = string;

/** Known values of {@link ProvisioningState} that the service accepts. */
export enum KnownProvisioningState {
  /** Updating */
  Updating = "Updating",
  /** Succeeded */
  Succeeded = "Succeeded",
  /** Failed */
  Failed = "Failed",
  /** Canceled */
  Canceled = "Canceled"
}

/**
 * Defines values for ProvisioningState. \
 * {@link KnownProvisioningState} can be used interchangeably with ProvisioningState,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Updating** \
 * **Succeeded** \
 * **Failed** \
 * **Canceled**
 */
export type ProvisioningState = string;

/** Known values of {@link ReliabilityLevel} that the service accepts. */
export enum KnownReliabilityLevel {
  /** None */
  None = "None",
  /** Bronze */
  Bronze = "Bronze",
  /** Silver */
  Silver = "Silver",
  /** Gold */
  Gold = "Gold",
  /** Platinum */
  Platinum = "Platinum"
}

/**
 * Defines values for ReliabilityLevel. \
 * {@link KnownReliabilityLevel} can be used interchangeably with ReliabilityLevel,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **None** \
 * **Bronze** \
 * **Silver** \
 * **Gold** \
 * **Platinum**
 */
export type ReliabilityLevel = string;

/** Known values of {@link UpgradeMode} that the service accepts. */
export enum KnownUpgradeMode {
  /** The cluster will be automatically upgraded to the latest Service Fabric runtime version, **upgradeWave** will determine when the upgrade starts after the new version becomes available. */
  Automatic = "Automatic",
  /** The cluster will not be automatically upgraded to the latest Service Fabric runtime version. The cluster is upgraded by setting the **clusterCodeVersion** property in the cluster resource. */
  Manual = "Manual"
}

/**
 * Defines values for UpgradeMode. \
 * {@link KnownUpgradeMode} can be used interchangeably with UpgradeMode,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Automatic**: The cluster will be automatically upgraded to the latest Service Fabric runtime version, **upgradeWave** will determine when the upgrade starts after the new version becomes available. \
 * **Manual**: The cluster will not be automatically upgraded to the latest Service Fabric runtime version. The cluster is upgraded by setting the **clusterCodeVersion** property in the cluster resource.
 */
export type UpgradeMode = string;

/** Known values of {@link SfZonalUpgradeMode} that the service accepts. */
export enum KnownSfZonalUpgradeMode {
  /** VMs under the node type are grouped into UDs and ignore the zone info in five UDs. This setting causes UDs across all zones to be upgraded at the same time. This deployment mode is faster for upgrades, we don't recommend it because it goes against the SDP guidelines, which state that the updates should be applied to one zone at a time. */
  Parallel = "Parallel",
  /** If this value is omitted or set to Hierarchical, VMs are grouped to reflect the zonal distribution in up to 15 UDs. Each of the three zones has five UDs. This ensures that the zones are updated one at a time, moving to next zone only after completing five UDs within the first zone. This update process is safer for the cluster and the user application. */
  Hierarchical = "Hierarchical"
}

/**
 * Defines values for SfZonalUpgradeMode. \
 * {@link KnownSfZonalUpgradeMode} can be used interchangeably with SfZonalUpgradeMode,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Parallel**: VMs under the node type are grouped into UDs and ignore the zone info in five UDs. This setting causes UDs across all zones to be upgraded at the same time. This deployment mode is faster for upgrades, we don't recommend it because it goes against the SDP guidelines, which state that the updates should be applied to one zone at a time. \
 * **Hierarchical**: If this value is omitted or set to Hierarchical, VMs are grouped to reflect the zonal distribution in up to 15 UDs. Each of the three zones has five UDs. This ensures that the zones are updated one at a time, moving to next zone only after completing five UDs within the first zone. This update process is safer for the cluster and the user application.
 */
export type SfZonalUpgradeMode = string;

/** Known values of {@link VmssZonalUpgradeMode} that the service accepts. */
export enum KnownVmssZonalUpgradeMode {
  /** Updates will happen in all Availability Zones at once for the virtual machine scale sets. */
  Parallel = "Parallel",
  /** VMs are grouped to reflect the zonal distribution in up to 15 UDs. Each of the three zones has five UDs. This ensures that the zones are updated one at a time, moving to next zone only after completing five UDs within the first zone. */
  Hierarchical = "Hierarchical"
}

/**
 * Defines values for VmssZonalUpgradeMode. \
 * {@link KnownVmssZonalUpgradeMode} can be used interchangeably with VmssZonalUpgradeMode,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Parallel**: Updates will happen in all Availability Zones at once for the virtual machine scale sets. \
 * **Hierarchical**: VMs are grouped to reflect the zonal distribution in up to 15 UDs. Each of the three zones has five UDs. This ensures that the zones are updated one at a time, moving to next zone only after completing five UDs within the first zone.
 */
export type VmssZonalUpgradeMode = string;

/** Known values of {@link ClusterUpgradeCadence} that the service accepts. */
export enum KnownClusterUpgradeCadence {
  /** Cluster upgrade starts immediately after a new version is rolled out. Recommended for Test\/Dev clusters. */
  Wave0 = "Wave0",
  /** Cluster upgrade starts 7 days after a new version is rolled out. Recommended for Pre-prod clusters. */
  Wave1 = "Wave1",
  /** Cluster upgrade starts 14 days after a new version is rolled out. Recommended for Production clusters. */
  Wave2 = "Wave2"
}

/**
 * Defines values for ClusterUpgradeCadence. \
 * {@link KnownClusterUpgradeCadence} can be used interchangeably with ClusterUpgradeCadence,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Wave0**: Cluster upgrade starts immediately after a new version is rolled out. Recommended for Test\/Dev clusters. \
 * **Wave1**: Cluster upgrade starts 7 days after a new version is rolled out. Recommended for Pre-prod clusters. \
 * **Wave2**: Cluster upgrade starts 14 days after a new version is rolled out. Recommended for Production clusters.
 */
export type ClusterUpgradeCadence = string;

/** Known values of {@link NotificationCategory} that the service accepts. */
export enum KnownNotificationCategory {
  /** Notification will be regarding wave progress. */
  WaveProgress = "WaveProgress"
}

/**
 * Defines values for NotificationCategory. \
 * {@link KnownNotificationCategory} can be used interchangeably with NotificationCategory,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **WaveProgress**: Notification will be regarding wave progress.
 */
export type NotificationCategory = string;

/** Known values of {@link NotificationLevel} that the service accepts. */
export enum KnownNotificationLevel {
  /** Receive only critical notifications. */
  Critical = "Critical",
  /** Receive all notifications. */
  All = "All"
}

/**
 * Defines values for NotificationLevel. \
 * {@link KnownNotificationLevel} can be used interchangeably with NotificationLevel,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Critical**: Receive only critical notifications. \
 * **All**: Receive all notifications.
 */
export type NotificationLevel = string;

/** Known values of {@link NotificationChannel} that the service accepts. */
export enum KnownNotificationChannel {
  /** For email user receivers. In this case, the parameter receivers should be a list of email addresses that will receive the notifications. */
  EmailUser = "EmailUser",
  /** For subscription receivers. In this case, the parameter receivers should be a list of roles of the subscription for the cluster (eg. Owner, AccountAdmin, etc) that will receive the notifications. */
  EmailSubscription = "EmailSubscription"
}

/**
 * Defines values for NotificationChannel. \
 * {@link KnownNotificationChannel} can be used interchangeably with NotificationChannel,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **EmailUser**: For email user receivers. In this case, the parameter receivers should be a list of email addresses that will receive the notifications. \
 * **EmailSubscription**: For subscription receivers. In this case, the parameter receivers should be a list of roles of the subscription for the cluster (eg. Owner, AccountAdmin, etc) that will receive the notifications.
 */
export type NotificationChannel = string;

/** Known values of {@link ClusterVersionsEnvironment} that the service accepts. */
export enum KnownClusterVersionsEnvironment {
  /** Windows */
  Windows = "Windows",
  /** Linux */
  Linux = "Linux"
}

/**
 * Defines values for ClusterVersionsEnvironment. \
 * {@link KnownClusterVersionsEnvironment} can be used interchangeably with ClusterVersionsEnvironment,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Windows** \
 * **Linux**
 */
export type ClusterVersionsEnvironment = string;

/** Known values of {@link ArmUpgradeFailureAction} that the service accepts. */
export enum KnownArmUpgradeFailureAction {
  /** Indicates that a rollback of the upgrade will be performed by Service Fabric if the upgrade fails. */
  Rollback = "Rollback",
  /** Indicates that a manual repair will need to be performed by the administrator if the upgrade fails. Service Fabric will not proceed to the next upgrade domain automatically. */
  Manual = "Manual"
}

/**
 * Defines values for ArmUpgradeFailureAction. \
 * {@link KnownArmUpgradeFailureAction} can be used interchangeably with ArmUpgradeFailureAction,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Rollback**: Indicates that a rollback of the upgrade will be performed by Service Fabric if the upgrade fails. \
 * **Manual**: Indicates that a manual repair will need to be performed by the administrator if the upgrade fails. Service Fabric will not proceed to the next upgrade domain automatically.
 */
export type ArmUpgradeFailureAction = string;

/** Known values of {@link RollingUpgradeMode} that the service accepts. */
export enum KnownRollingUpgradeMode {
  /** Indicates the upgrade mode is invalid. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** The upgrade will proceed automatically without performing any health monitoring. The value is 1 */
  UnmonitoredAuto = "UnmonitoredAuto",
  /** The upgrade will stop after completing each upgrade domain, giving the opportunity to manually monitor health before proceeding. The value is 2 */
  UnmonitoredManual = "UnmonitoredManual",
  /** The upgrade will stop after completing each upgrade domain and automatically monitor health before proceeding. The value is 3 */
  Monitored = "Monitored"
}

/**
 * Defines values for RollingUpgradeMode. \
 * {@link KnownRollingUpgradeMode} can be used interchangeably with RollingUpgradeMode,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the upgrade mode is invalid. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **UnmonitoredAuto**: The upgrade will proceed automatically without performing any health monitoring. The value is 1 \
 * **UnmonitoredManual**: The upgrade will stop after completing each upgrade domain, giving the opportunity to manually monitor health before proceeding. The value is 2 \
 * **Monitored**: The upgrade will stop after completing each upgrade domain and automatically monitor health before proceeding. The value is 3
 */
export type RollingUpgradeMode = string;

/** Known values of {@link ServiceKind} that the service accepts. */
export enum KnownServiceKind {
  /** Indicates the service kind is invalid. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** Does not use Service Fabric to make its state highly available or reliable. The value is 1. */
  Stateless = "Stateless",
  /** Uses Service Fabric to make its state or part of its state highly available and reliable. The value is 2. */
  Stateful = "Stateful"
}

/**
 * Defines values for ServiceKind. \
 * {@link KnownServiceKind} can be used interchangeably with ServiceKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the service kind is invalid. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **Stateless**: Does not use Service Fabric to make its state highly available or reliable. The value is 1. \
 * **Stateful**: Uses Service Fabric to make its state or part of its state highly available and reliable. The value is 2.
 */
export type ServiceKind = string;

/** Known values of {@link PartitionScheme} that the service accepts. */
export enum KnownPartitionScheme {
  /** Indicates the partition kind is invalid. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** Indicates that the partition is based on string names, and is a SingletonPartitionSchemeDescription object, The value is 1. */
  Singleton = "Singleton",
  /** Indicates that the partition is based on Int64 key ranges, and is a UniformInt64RangePartitionSchemeDescription object. The value is 2. */
  UniformInt64Range = "UniformInt64Range",
  /** Indicates that the partition is based on string names, and is a NamedPartitionSchemeDescription object. The value is 3 */
  Named = "Named"
}

/**
 * Defines values for PartitionScheme. \
 * {@link KnownPartitionScheme} can be used interchangeably with PartitionScheme,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the partition kind is invalid. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **Singleton**: Indicates that the partition is based on string names, and is a SingletonPartitionSchemeDescription object, The value is 1. \
 * **UniformInt64Range**: Indicates that the partition is based on Int64 key ranges, and is a UniformInt64RangePartitionSchemeDescription object. The value is 2. \
 * **Named**: Indicates that the partition is based on string names, and is a NamedPartitionSchemeDescription object. The value is 3
 */
export type PartitionScheme = string;

/** Known values of {@link ArmServicePackageActivationMode} that the service accepts. */
export enum KnownArmServicePackageActivationMode {
  /** Indicates the application package activation mode will use shared process. */
  SharedProcess = "SharedProcess",
  /** Indicates the application package activation mode will use exclusive process. */
  ExclusiveProcess = "ExclusiveProcess"
}

/**
 * Defines values for ArmServicePackageActivationMode. \
 * {@link KnownArmServicePackageActivationMode} can be used interchangeably with ArmServicePackageActivationMode,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **SharedProcess**: Indicates the application package activation mode will use shared process. \
 * **ExclusiveProcess**: Indicates the application package activation mode will use exclusive process.
 */
export type ArmServicePackageActivationMode = string;

/** Known values of {@link ServiceCorrelationScheme} that the service accepts. */
export enum KnownServiceCorrelationScheme {
  /** An invalid correlation scheme. Cannot be used. The value is zero. */
  Invalid = "Invalid",
  /** Indicates that this service has an affinity relationship with another service. Provided for backwards compatibility, consider preferring the Aligned or NonAlignedAffinity options. The value is 1. */
  Affinity = "Affinity",
  /** Aligned affinity ensures that the primaries of the partitions of the affinitized services are collocated on the same nodes. This is the default and is the same as selecting the Affinity scheme. The value is 2. */
  AlignedAffinity = "AlignedAffinity",
  /** Non-Aligned affinity guarantees that all replicas of each service will be placed on the same nodes. Unlike Aligned Affinity, this does not guarantee that replicas of particular role will be collocated. The value is 3. */
  NonAlignedAffinity = "NonAlignedAffinity"
}

/**
 * Defines values for ServiceCorrelationScheme. \
 * {@link KnownServiceCorrelationScheme} can be used interchangeably with ServiceCorrelationScheme,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: An invalid correlation scheme. Cannot be used. The value is zero. \
 * **Affinity**: Indicates that this service has an affinity relationship with another service. Provided for backwards compatibility, consider preferring the Aligned or NonAlignedAffinity options. The value is 1. \
 * **AlignedAffinity**: Aligned affinity ensures that the primaries of the partitions of the affinitized services are collocated on the same nodes. This is the default and is the same as selecting the Affinity scheme. The value is 2. \
 * **NonAlignedAffinity**: Non-Aligned affinity guarantees that all replicas of each service will be placed on the same nodes. Unlike Aligned Affinity, this does not guarantee that replicas of particular role will be collocated. The value is 3.
 */
export type ServiceCorrelationScheme = string;

/** Known values of {@link ServiceLoadMetricWeight} that the service accepts. */
export enum KnownServiceLoadMetricWeight {
  /** Disables resource balancing for this metric. This value is zero. */
  Zero = "Zero",
  /** Specifies the metric weight of the service load as Low. The value is 1. */
  Low = "Low",
  /** Specifies the metric weight of the service load as Medium. The value is 2. */
  Medium = "Medium",
  /** Specifies the metric weight of the service load as High. The value is 3. */
  High = "High"
}

/**
 * Defines values for ServiceLoadMetricWeight. \
 * {@link KnownServiceLoadMetricWeight} can be used interchangeably with ServiceLoadMetricWeight,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Zero**: Disables resource balancing for this metric. This value is zero. \
 * **Low**: Specifies the metric weight of the service load as Low. The value is 1. \
 * **Medium**: Specifies the metric weight of the service load as Medium. The value is 2. \
 * **High**: Specifies the metric weight of the service load as High. The value is 3.
 */
export type ServiceLoadMetricWeight = string;

/** Known values of {@link ServicePlacementPolicyType} that the service accepts. */
export enum KnownServicePlacementPolicyType {
  /** Indicates the type of the placement policy is invalid. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** Indicates that the ServicePlacementPolicyDescription is of type ServicePlacementInvalidDomainPolicyDescription, which indicates that a particular fault or upgrade domain cannot be used for placement of this service. The value is 1. */
  InvalidDomain = "InvalidDomain",
  /** Indicates that the ServicePlacementPolicyDescription is of type ServicePlacementRequireDomainDistributionPolicyDescription indicating that the replicas of the service must be placed in a specific domain. The value is 2. */
  RequiredDomain = "RequiredDomain",
  /** Indicates that the ServicePlacementPolicyDescription is of type ServicePlacementPreferPrimaryDomainPolicyDescription, which indicates that if possible the Primary replica for the partitions of the service should be located in a particular domain as an optimization. The value is 3. */
  PreferredPrimaryDomain = "PreferredPrimaryDomain",
  /** Indicates that the ServicePlacementPolicyDescription is of type ServicePlacementRequireDomainDistributionPolicyDescription, indicating that the system will disallow placement of any two replicas from the same partition in the same domain at any time. The value is 4. */
  RequiredDomainDistribution = "RequiredDomainDistribution",
  /** Indicates that the ServicePlacementPolicyDescription is of type ServicePlacementNonPartiallyPlaceServicePolicyDescription, which indicates that if possible all replicas of a particular partition of the service should be placed atomically. The value is 5. */
  NonPartiallyPlaceService = "NonPartiallyPlaceService"
}

/**
 * Defines values for ServicePlacementPolicyType. \
 * {@link KnownServicePlacementPolicyType} can be used interchangeably with ServicePlacementPolicyType,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the type of the placement policy is invalid. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **InvalidDomain**: Indicates that the ServicePlacementPolicyDescription is of type ServicePlacementInvalidDomainPolicyDescription, which indicates that a particular fault or upgrade domain cannot be used for placement of this service. The value is 1. \
 * **RequiredDomain**: Indicates that the ServicePlacementPolicyDescription is of type ServicePlacementRequireDomainDistributionPolicyDescription indicating that the replicas of the service must be placed in a specific domain. The value is 2. \
 * **PreferredPrimaryDomain**: Indicates that the ServicePlacementPolicyDescription is of type ServicePlacementPreferPrimaryDomainPolicyDescription, which indicates that if possible the Primary replica for the partitions of the service should be located in a particular domain as an optimization. The value is 3. \
 * **RequiredDomainDistribution**: Indicates that the ServicePlacementPolicyDescription is of type ServicePlacementRequireDomainDistributionPolicyDescription, indicating that the system will disallow placement of any two replicas from the same partition in the same domain at any time. The value is 4. \
 * **NonPartiallyPlaceService**: Indicates that the ServicePlacementPolicyDescription is of type ServicePlacementNonPartiallyPlaceServicePolicyDescription, which indicates that if possible all replicas of a particular partition of the service should be placed atomically. The value is 5.
 */
export type ServicePlacementPolicyType = string;

/** Known values of {@link MoveCost} that the service accepts. */
export enum KnownMoveCost {
  /** Zero move cost. This value is zero. */
  Zero = "Zero",
  /** Specifies the move cost of the service as Low. The value is 1. */
  Low = "Low",
  /** Specifies the move cost of the service as Medium. The value is 2. */
  Medium = "Medium",
  /** Specifies the move cost of the service as High. The value is 3. */
  High = "High"
}

/**
 * Defines values for MoveCost. \
 * {@link KnownMoveCost} can be used interchangeably with MoveCost,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Zero**: Zero move cost. This value is zero. \
 * **Low**: Specifies the move cost of the service as Low. The value is 1. \
 * **Medium**: Specifies the move cost of the service as Medium. The value is 2. \
 * **High**: Specifies the move cost of the service as High. The value is 3.
 */
export type MoveCost = string;
/** Defines values for ManagedIdentityType. */
export type ManagedIdentityType =
  | "SystemAssigned"
  | "UserAssigned"
  | "SystemAssigned, UserAssigned"
  | "None";

/** Optional parameters. */
export interface ClustersGetOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the get operation. */
export type ClustersGetResponse = Cluster;

/** Optional parameters. */
export interface ClustersCreateOrUpdateOptionalParams
  extends coreClient.OperationOptions {
  /** Delay to wait until next poll, in milliseconds. */
  updateIntervalInMs?: number;
  /** A serialized poller which can be used to resume an existing paused Long-Running-Operation. */
  resumeFrom?: string;
}

/** Contains response data for the createOrUpdate operation. */
export type ClustersCreateOrUpdateResponse = Cluster;

/** Optional parameters. */
export interface ClustersUpdateOptionalParams
  extends coreClient.OperationOptions {
  /** Delay to wait until next poll, in milliseconds. */
  updateIntervalInMs?: number;
  /** A serialized poller which can be used to resume an existing paused Long-Running-Operation. */
  resumeFrom?: string;
}

/** Contains response data for the update operation. */
export type ClustersUpdateResponse = Cluster;

/** Optional parameters. */
export interface ClustersDeleteOptionalParams
  extends coreClient.OperationOptions {}

/** Optional parameters. */
export interface ClustersListByResourceGroupOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the listByResourceGroup operation. */
export type ClustersListByResourceGroupResponse = ClusterListResult;

/** Optional parameters. */
export interface ClustersListOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the list operation. */
export type ClustersListResponse = ClusterListResult;

/** Optional parameters. */
export interface ClustersListUpgradableVersionsOptionalParams
  extends coreClient.OperationOptions {
  /** The upgrade path description with target version. */
  versionsDescription?: UpgradableVersionsDescription;
}

/** Contains response data for the listUpgradableVersions operation. */
export type ClustersListUpgradableVersionsResponse = UpgradableVersionPathResult;

/** Optional parameters. */
export interface ClusterVersionsGetOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the get operation. */
export type ClusterVersionsGetResponse = ClusterCodeVersionsListResult;

/** Optional parameters. */
export interface ClusterVersionsGetByEnvironmentOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the getByEnvironment operation. */
export type ClusterVersionsGetByEnvironmentResponse = ClusterCodeVersionsListResult;

/** Optional parameters. */
export interface ClusterVersionsListOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the list operation. */
export type ClusterVersionsListResponse = ClusterCodeVersionsListResult;

/** Optional parameters. */
export interface ClusterVersionsListByEnvironmentOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the listByEnvironment operation. */
export type ClusterVersionsListByEnvironmentResponse = ClusterCodeVersionsListResult;

/** Optional parameters. */
export interface OperationsListOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the list operation. */
export type OperationsListResponse = OperationListResult;

/** Optional parameters. */
export interface OperationsListNextOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the listNext operation. */
export type OperationsListNextResponse = OperationListResult;

/** Optional parameters. */
export interface ApplicationTypesGetOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the get operation. */
export type ApplicationTypesGetResponse = ApplicationTypeResource;

/** Optional parameters. */
export interface ApplicationTypesCreateOrUpdateOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the createOrUpdate operation. */
export type ApplicationTypesCreateOrUpdateResponse = ApplicationTypeResource;

/** Optional parameters. */
export interface ApplicationTypesDeleteOptionalParams
  extends coreClient.OperationOptions {
  /** Delay to wait until next poll, in milliseconds. */
  updateIntervalInMs?: number;
  /** A serialized poller which can be used to resume an existing paused Long-Running-Operation. */
  resumeFrom?: string;
}

/** Optional parameters. */
export interface ApplicationTypesListOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the list operation. */
export type ApplicationTypesListResponse = ApplicationTypeResourceList;

/** Optional parameters. */
export interface ApplicationTypeVersionsGetOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the get operation. */
export type ApplicationTypeVersionsGetResponse = ApplicationTypeVersionResource;

/** Optional parameters. */
export interface ApplicationTypeVersionsCreateOrUpdateOptionalParams
  extends coreClient.OperationOptions {
  /** Delay to wait until next poll, in milliseconds. */
  updateIntervalInMs?: number;
  /** A serialized poller which can be used to resume an existing paused Long-Running-Operation. */
  resumeFrom?: string;
}

/** Contains response data for the createOrUpdate operation. */
export type ApplicationTypeVersionsCreateOrUpdateResponse = ApplicationTypeVersionResource;

/** Optional parameters. */
export interface ApplicationTypeVersionsDeleteOptionalParams
  extends coreClient.OperationOptions {
  /** Delay to wait until next poll, in milliseconds. */
  updateIntervalInMs?: number;
  /** A serialized poller which can be used to resume an existing paused Long-Running-Operation. */
  resumeFrom?: string;
}

/** Optional parameters. */
export interface ApplicationTypeVersionsListOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the list operation. */
export type ApplicationTypeVersionsListResponse = ApplicationTypeVersionResourceList;

/** Optional parameters. */
export interface ApplicationsGetOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the get operation. */
export type ApplicationsGetResponse = ApplicationResource;

/** Optional parameters. */
export interface ApplicationsCreateOrUpdateOptionalParams
  extends coreClient.OperationOptions {
  /** Delay to wait until next poll, in milliseconds. */
  updateIntervalInMs?: number;
  /** A serialized poller which can be used to resume an existing paused Long-Running-Operation. */
  resumeFrom?: string;
}

/** Contains response data for the createOrUpdate operation. */
export type ApplicationsCreateOrUpdateResponse = ApplicationResource;

/** Optional parameters. */
export interface ApplicationsUpdateOptionalParams
  extends coreClient.OperationOptions {
  /** Delay to wait until next poll, in milliseconds. */
  updateIntervalInMs?: number;
  /** A serialized poller which can be used to resume an existing paused Long-Running-Operation. */
  resumeFrom?: string;
}

/** Contains response data for the update operation. */
export type ApplicationsUpdateResponse = ApplicationResource;

/** Optional parameters. */
export interface ApplicationsDeleteOptionalParams
  extends coreClient.OperationOptions {
  /** Delay to wait until next poll, in milliseconds. */
  updateIntervalInMs?: number;
  /** A serialized poller which can be used to resume an existing paused Long-Running-Operation. */
  resumeFrom?: string;
}

/** Optional parameters. */
export interface ApplicationsListOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the list operation. */
export type ApplicationsListResponse = ApplicationResourceList;

/** Optional parameters. */
export interface ServicesGetOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the get operation. */
export type ServicesGetResponse = ServiceResource;

/** Optional parameters. */
export interface ServicesCreateOrUpdateOptionalParams
  extends coreClient.OperationOptions {
  /** Delay to wait until next poll, in milliseconds. */
  updateIntervalInMs?: number;
  /** A serialized poller which can be used to resume an existing paused Long-Running-Operation. */
  resumeFrom?: string;
}

/** Contains response data for the createOrUpdate operation. */
export type ServicesCreateOrUpdateResponse = ServiceResource;

/** Optional parameters. */
export interface ServicesUpdateOptionalParams
  extends coreClient.OperationOptions {
  /** Delay to wait until next poll, in milliseconds. */
  updateIntervalInMs?: number;
  /** A serialized poller which can be used to resume an existing paused Long-Running-Operation. */
  resumeFrom?: string;
}

/** Contains response data for the update operation. */
export type ServicesUpdateResponse = ServiceResource;

/** Optional parameters. */
export interface ServicesDeleteOptionalParams
  extends coreClient.OperationOptions {
  /** Delay to wait until next poll, in milliseconds. */
  updateIntervalInMs?: number;
  /** A serialized poller which can be used to resume an existing paused Long-Running-Operation. */
  resumeFrom?: string;
}

/** Optional parameters. */
export interface ServicesListOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the list operation. */
export type ServicesListResponse = ServiceResourceList;

/** Optional parameters. */
export interface ServiceFabricManagementClientOptionalParams
  extends coreClient.ServiceClientOptions {
  /** server parameter */
  $host?: string;
  /** Api Version */
  apiVersion?: string;
  /** Overrides client endpoint. */
  endpoint?: string;
}
