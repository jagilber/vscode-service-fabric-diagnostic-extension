import * as coreClient from "@azure/core-client";

export type HealthEvaluationUnion =
  | HealthEvaluation
  | ApplicationHealthEvaluation
  | ApplicationsHealthEvaluation
  | ApplicationTypeApplicationsHealthEvaluation
  | DeltaNodesCheckHealthEvaluation
  | DeployedApplicationHealthEvaluation
  | DeployedApplicationsHealthEvaluation
  | DeployedServicePackageHealthEvaluation
  | DeployedServicePackagesHealthEvaluation
  | EventHealthEvaluation
  | NodeHealthEvaluation
  | NodesHealthEvaluation
  | PartitionHealthEvaluation
  | PartitionsHealthEvaluation
  | ReplicaHealthEvaluation
  | ReplicasHealthEvaluation
  | ServiceHealthEvaluation
  | ServicesHealthEvaluation
  | SystemApplicationHealthEvaluation
  | UpgradeDomainDeltaNodesCheckHealthEvaluation
  | UpgradeDomainDeployedApplicationsHealthEvaluation
  | UpgradeDomainNodesHealthEvaluation
  | NodeTypeNodesHealthEvaluation;
export type SafetyCheckUnion =
  | SafetyCheck
  | PartitionSafetyCheckUnion
  | SeedNodeSafetyCheck;
export type ProvisionApplicationTypeDescriptionBaseUnion =
  | ProvisionApplicationTypeDescriptionBase
  | ProvisionApplicationTypeDescription
  | ExternalStoreProvisionApplicationTypeDescription;
export type ServiceTypeDescriptionUnion =
  | ServiceTypeDescription
  | StatefulServiceTypeDescription
  | StatelessServiceTypeDescription;
export type ServicePlacementPolicyDescriptionUnion =
  | ServicePlacementPolicyDescription
  | ServicePlacementInvalidDomainPolicyDescription
  | ServicePlacementNonPartiallyPlaceServicePolicyDescription
  | ServicePlacementAllowMultipleStatelessInstancesOnNodePolicyDescription
  | ServicePlacementPreferPrimaryDomainPolicyDescription
  | ServicePlacementRequiredDomainPolicyDescription
  | ServicePlacementRequireDomainDistributionPolicyDescription;
export type ServiceInfoUnion =
  | ServiceInfo
  | StatefulServiceInfo
  | StatelessServiceInfo;
export type ServiceDescriptionUnion =
  | ServiceDescription
  | StatefulServiceDescription
  | StatelessServiceDescription;
export type PartitionSchemeDescriptionUnion =
  | PartitionSchemeDescription
  | NamedPartitionSchemeDescription
  | SingletonPartitionSchemeDescription
  | UniformInt64RangePartitionSchemeDescription;
export type ScalingTriggerDescriptionUnion =
  | ScalingTriggerDescription
  | AveragePartitionLoadScalingTrigger
  | AverageServiceLoadScalingTrigger;
export type ScalingMechanismDescriptionUnion =
  | ScalingMechanismDescription
  | PartitionInstanceCountScaleMechanism
  | AddRemoveIncrementalNamedPartitionScalingMechanism;
export type ServiceUpdateDescriptionUnion =
  | ServiceUpdateDescription
  | StatefulServiceUpdateDescription
  | StatelessServiceUpdateDescription;
export type PartitionInformationUnion =
  | PartitionInformation
  | Int64RangePartitionInformation
  | NamedPartitionInformation
  | SingletonPartitionInformation;
export type ServicePartitionInfoUnion =
  | ServicePartitionInfo
  | StatefulServicePartitionInfo
  | StatelessServicePartitionInfo;
export type RepairTargetDescriptionBaseUnion =
  | RepairTargetDescriptionBase
  | NodeRepairTargetDescription;
export type RepairImpactDescriptionBaseUnion =
  | RepairImpactDescriptionBase
  | NodeRepairImpactDescription;
export type ReplicaInfoUnion =
  | ReplicaInfo
  | StatefulServiceReplicaInfo
  | StatelessServiceInstanceInfo;
export type DeployedServiceReplicaInfoUnion =
  | DeployedServiceReplicaInfo
  | DeployedStatefulServiceReplicaInfo
  | DeployedStatelessServiceInstanceInfo;
export type DeployedServiceReplicaDetailInfoUnion =
  | DeployedServiceReplicaDetailInfo
  | DeployedStatefulServiceReplicaDetailInfo
  | DeployedStatelessServiceInstanceDetailInfo;
export type ChaosEventUnion =
  | ChaosEvent
  | ExecutingFaultsChaosEvent
  | StartedChaosEvent
  | StoppedChaosEvent
  | TestErrorChaosEvent
  | ValidationFailedChaosEvent
  | WaitingChaosEvent;
export type BackupScheduleDescriptionUnion =
  | BackupScheduleDescription
  | FrequencyBasedBackupScheduleDescription
  | TimeBasedBackupScheduleDescription;
export type BackupStorageDescriptionUnion =
  | BackupStorageDescription
  | AzureBlobBackupStorageDescription
  | FileShareBackupStorageDescription
  | DsmsAzureBlobBackupStorageDescription
  | ManagedIdentityAzureBlobBackupStorageDescription;
export type RetentionPolicyDescriptionUnion =
  | RetentionPolicyDescription
  | BasicRetentionPolicyDescription;
export type BackupEntityUnion =
  | BackupEntity
  | ApplicationBackupEntity
  | ServiceBackupEntity
  | PartitionBackupEntity;
export type BackupConfigurationInfoUnion =
  | BackupConfigurationInfo
  | PartitionBackupConfigurationInfo
  | ApplicationBackupConfigurationInfo
  | ServiceBackupConfigurationInfo;
export type PropertyValueUnion =
  | PropertyValue
  | BinaryPropertyValue
  | Int64PropertyValue
  | DoublePropertyValue
  | StringPropertyValue
  | GuidPropertyValue;
export type PropertyBatchOperationUnion =
  | PropertyBatchOperation
  | CheckExistsPropertyBatchOperation
  | CheckSequencePropertyBatchOperation
  | CheckValuePropertyBatchOperation
  | DeletePropertyBatchOperation
  | GetPropertyBatchOperation
  | PutPropertyBatchOperation;
export type PropertyBatchInfoUnion =
  | PropertyBatchInfo
  | SuccessfulPropertyBatchInfo
  | FailedPropertyBatchInfo;
export type FabricEventUnion =
  | FabricEvent
  | ClusterEventUnion
  | ContainerInstanceEvent
  | NodeEventUnion
  | ApplicationEventUnion
  | ServiceEventUnion
  | PartitionEventUnion
  | ReplicaEventUnion;
export type SecretResourcePropertiesBaseUnion =
  | SecretResourcePropertiesBase
  | SecretResourcePropertiesUnion;
export type NetworkResourcePropertiesBaseUnion =
  | NetworkResourcePropertiesBase
  | NetworkResourcePropertiesUnion;
export type ApplicationScopedVolumeCreationParametersUnion =
  | ApplicationScopedVolumeCreationParameters
  | ApplicationScopedVolumeCreationParametersServiceFabricVolumeDisk;
export type ExecutionPolicyUnion =
  | ExecutionPolicy
  | DefaultExecutionPolicy
  | RunToCompletionExecutionPolicy;
export type AutoScalingTriggerUnion =
  | AutoScalingTrigger
  | AverageLoadScalingTrigger;
export type AutoScalingMechanismUnion =
  | AutoScalingMechanism
  | AddRemoveReplicaScalingMechanism;
export type DiagnosticsSinkPropertiesUnion =
  | DiagnosticsSinkProperties
  | AzureInternalMonitoringPipelineSinkDescription;
export type ReplicatorStatusUnion =
  | ReplicatorStatus
  | PrimaryReplicatorStatus
  | SecondaryReplicatorStatusUnion;
export type ReplicaStatusBaseUnion =
  | ReplicaStatusBase
  | KeyValueStoreReplicaStatus;
export type AutoScalingMetricUnion =
  | AutoScalingMetric
  | AutoScalingResourceMetric;
export type ReplicaHealthStateUnion =
  | ReplicaHealthState
  | StatefulServiceReplicaHealthState
  | StatelessServiceInstanceHealthState;
export type ReplicaHealthUnion =
  | ReplicaHealth
  | StatefulServiceReplicaHealth
  | StatelessServiceInstanceHealth;
export type PartitionSafetyCheckUnion =
  | PartitionSafetyCheck
  | EnsureAvailabilitySafetyCheck
  | EnsurePartitionQuorumSafetyCheck
  | WaitForInbuildReplicaSafetyCheck
  | WaitForPrimaryPlacementSafetyCheck
  | WaitForPrimarySwapSafetyCheck
  | WaitForReconfigurationSafetyCheck;
export type ClusterEventUnion =
  | ClusterEvent
  | ClusterNewHealthReportEvent
  | ClusterHealthReportExpiredEvent
  | ClusterUpgradeCompletedEvent
  | ClusterUpgradeDomainCompletedEvent
  | ClusterUpgradeRollbackCompletedEvent
  | ClusterUpgradeRollbackStartedEvent
  | ClusterUpgradeStartedEvent
  | ChaosStoppedEvent
  | ChaosStartedEvent;
export type NodeEventUnion =
  | NodeEvent
  | NodeAbortedEvent
  | NodeAddedToClusterEvent
  | NodeClosedEvent
  | NodeDeactivateCompletedEvent
  | NodeDeactivateStartedEvent
  | NodeDownEvent
  | NodeNewHealthReportEvent
  | NodeHealthReportExpiredEvent
  | NodeOpenSucceededEvent
  | NodeOpenFailedEvent
  | NodeRemovedFromClusterEvent
  | NodeUpEvent
  | ChaosNodeRestartScheduledEvent;
export type ApplicationEventUnion =
  | ApplicationEvent
  | ApplicationCreatedEvent
  | ApplicationDeletedEvent
  | ApplicationNewHealthReportEvent
  | ApplicationHealthReportExpiredEvent
  | ApplicationUpgradeCompletedEvent
  | ApplicationUpgradeDomainCompletedEvent
  | ApplicationUpgradeRollbackCompletedEvent
  | ApplicationUpgradeRollbackStartedEvent
  | ApplicationUpgradeStartedEvent
  | DeployedApplicationNewHealthReportEvent
  | DeployedApplicationHealthReportExpiredEvent
  | ApplicationProcessExitedEvent
  | ApplicationContainerInstanceExitedEvent
  | DeployedServicePackageNewHealthReportEvent
  | DeployedServicePackageHealthReportExpiredEvent
  | ChaosCodePackageRestartScheduledEvent;
export type ServiceEventUnion =
  | ServiceEvent
  | ServiceCreatedEvent
  | ServiceDeletedEvent
  | ServiceNewHealthReportEvent
  | ServiceHealthReportExpiredEvent;
export type PartitionEventUnion =
  | PartitionEvent
  | PartitionAnalysisEventUnion
  | PartitionNewHealthReportEvent
  | PartitionHealthReportExpiredEvent
  | PartitionReconfiguredEvent
  | ChaosPartitionSecondaryMoveScheduledEvent
  | ChaosPartitionPrimaryMoveScheduledEvent;
export type ReplicaEventUnion =
  | ReplicaEvent
  | StatefulReplicaNewHealthReportEvent
  | StatefulReplicaHealthReportExpiredEvent
  | StatelessReplicaNewHealthReportEvent
  | StatelessReplicaHealthReportExpiredEvent
  | ChaosReplicaRemovalScheduledEvent
  | ChaosReplicaRestartScheduledEvent;
export type SecretResourcePropertiesUnion =
  | SecretResourceProperties
  | InlinedValueSecretResourceProperties;
export type NetworkResourcePropertiesUnion =
  | NetworkResourceProperties
  | LocalNetworkResourceProperties;
export type SecondaryReplicatorStatusUnion =
  | SecondaryReplicatorStatus
  | SecondaryActiveReplicatorStatus
  | SecondaryIdleReplicatorStatus;
export type PartitionAnalysisEventUnion =
  | PartitionAnalysisEvent
  | PartitionPrimaryMoveAnalysisEvent;

/** Information about the cluster manifest. */
export interface ClusterManifest {
  /** The contents of the cluster manifest file. */
  manifest?: string;
}

/** The REST API operations for Service Fabric return standard HTTP status codes. This type defines the additional information returned from the Service Fabric API operations that are not successful. */
export interface FabricError {
  /** Error object containing error code and error message. */
  error: FabricErrorError;
}

/** Error object containing error code and error message. */
export interface FabricErrorError {
  /**
   * Defines the fabric error codes that be returned as part of the error object in response to Service Fabric API operations that are not successful. Following are the error code values that can be returned for a specific HTTP status code.
   *
   *   - Possible values of the error code for HTTP status code 400 (Bad Request)
   *     - "FABRIC_E_INVALID_PARTITION_KEY"
   *     - "FABRIC_E_IMAGEBUILDER_VALIDATION_ERROR"
   *     - "FABRIC_E_INVALID_ADDRESS"
   *     - "FABRIC_E_APPLICATION_NOT_UPGRADING"
   *     - "FABRIC_E_APPLICATION_UPGRADE_VALIDATION_ERROR"
   *     - "FABRIC_E_FABRIC_NOT_UPGRADING"
   *     - "FABRIC_E_FABRIC_UPGRADE_VALIDATION_ERROR"
   *     - "FABRIC_E_INVALID_CONFIGURATION"
   *     - "FABRIC_E_INVALID_NAME_URI"
   *     - "FABRIC_E_PATH_TOO_LONG"
   *     - "FABRIC_E_KEY_TOO_LARGE"
   *     - "FABRIC_E_SERVICE_AFFINITY_CHAIN_NOT_SUPPORTED"
   *     - "FABRIC_E_INVALID_ATOMIC_GROUP"
   *     - "FABRIC_E_VALUE_EMPTY"
   *     - "FABRIC_E_BACKUP_IS_ENABLED"
   *     - "FABRIC_E_RESTORE_SOURCE_TARGET_PARTITION_MISMATCH"
   *     - "FABRIC_E_INVALID_FOR_STATELESS_SERVICES"
   *     - "FABRIC_E_INVALID_SERVICE_SCALING_POLICY"
   *     - "E_INVALIDARG"
   *
   *   - Possible values of the error code for HTTP status code 404 (Not Found)
   *     - "FABRIC_E_NODE_NOT_FOUND"
   *     - "FABRIC_E_APPLICATION_TYPE_NOT_FOUND"
   *     - "FABRIC_E_APPLICATION_NOT_FOUND"
   *     - "FABRIC_E_SERVICE_TYPE_NOT_FOUND"
   *     - "FABRIC_E_SERVICE_DOES_NOT_EXIST"
   *     - "FABRIC_E_SERVICE_TYPE_TEMPLATE_NOT_FOUND"
   *     - "FABRIC_E_CONFIGURATION_SECTION_NOT_FOUND"
   *     - "FABRIC_E_PARTITION_NOT_FOUND"
   *     - "FABRIC_E_REPLICA_DOES_NOT_EXIST"
   *     - "FABRIC_E_SERVICE_GROUP_DOES_NOT_EXIST"
   *     - "FABRIC_E_CONFIGURATION_PARAMETER_NOT_FOUND"
   *     - "FABRIC_E_DIRECTORY_NOT_FOUND"
   *     - "FABRIC_E_FABRIC_VERSION_NOT_FOUND"
   *     - "FABRIC_E_FILE_NOT_FOUND"
   *     - "FABRIC_E_NAME_DOES_NOT_EXIST"
   *     - "FABRIC_E_PROPERTY_DOES_NOT_EXIST"
   *     - "FABRIC_E_ENUMERATION_COMPLETED"
   *     - "FABRIC_E_SERVICE_MANIFEST_NOT_FOUND"
   *     - "FABRIC_E_KEY_NOT_FOUND"
   *     - "FABRIC_E_HEALTH_ENTITY_NOT_FOUND"
   *     - "FABRIC_E_BACKUP_NOT_ENABLED"
   *     - "FABRIC_E_BACKUP_POLICY_NOT_EXISTING"
   *     - "FABRIC_E_FAULT_ANALYSIS_SERVICE_NOT_EXISTING"
   *     - "FABRIC_E_IMAGEBUILDER_RESERVED_DIRECTORY_ERROR"
   *
   *   - Possible values of the error code for HTTP status code 409 (Conflict)
   *     - "FABRIC_E_APPLICATION_TYPE_ALREADY_EXISTS"
   *     - "FABRIC_E_APPLICATION_ALREADY_EXISTS"
   *     - "FABRIC_E_APPLICATION_ALREADY_IN_TARGET_VERSION"
   *     - "FABRIC_E_APPLICATION_TYPE_PROVISION_IN_PROGRESS"
   *     - "FABRIC_E_APPLICATION_UPGRADE_IN_PROGRESS"
   *     - "FABRIC_E_SERVICE_ALREADY_EXISTS"
   *     - "FABRIC_E_SERVICE_GROUP_ALREADY_EXISTS"
   *     - "FABRIC_E_APPLICATION_TYPE_IN_USE"
   *     - "FABRIC_E_FABRIC_ALREADY_IN_TARGET_VERSION"
   *     - "FABRIC_E_FABRIC_VERSION_ALREADY_EXISTS"
   *     - "FABRIC_E_FABRIC_VERSION_IN_USE"
   *     - "FABRIC_E_FABRIC_UPGRADE_IN_PROGRESS"
   *     - "FABRIC_E_NAME_ALREADY_EXISTS"
   *     - "FABRIC_E_NAME_NOT_EMPTY"
   *     - "FABRIC_E_PROPERTY_CHECK_FAILED"
   *     - "FABRIC_E_SERVICE_METADATA_MISMATCH"
   *     - "FABRIC_E_SERVICE_TYPE_MISMATCH"
   *     - "FABRIC_E_HEALTH_STALE_REPORT"
   *     - "FABRIC_E_SEQUENCE_NUMBER_CHECK_FAILED"
   *     - "FABRIC_E_NODE_HAS_NOT_STOPPED_YET"
   *     - "FABRIC_E_INSTANCE_ID_MISMATCH"
   *     - "FABRIC_E_BACKUP_IN_PROGRESS"
   *     - "FABRIC_E_RESTORE_IN_PROGRESS"
   *     - "FABRIC_E_BACKUP_POLICY_ALREADY_EXISTING"
   *
   *   - Possible values of the error code for HTTP status code 413 (Request Entity Too Large)
   *     - "FABRIC_E_VALUE_TOO_LARGE"
   *
   *   - Possible values of the error code for HTTP status code 500 (Internal Server Error)
   *     - "FABRIC_E_NODE_IS_UP"
   *     - "E_FAIL"
   *     - "FABRIC_E_SINGLE_INSTANCE_APPLICATION_ALREADY_EXISTS"
   *     - "FABRIC_E_SINGLE_INSTANCE_APPLICATION_NOT_FOUND"
   *     - "FABRIC_E_VOLUME_ALREADY_EXISTS"
   *     - "FABRIC_E_VOLUME_NOT_FOUND"
   *     - "SerializationError"
   *
   *   - Possible values of the error code for HTTP status code 503 (Service Unavailable)
   *     - "FABRIC_E_NO_WRITE_QUORUM"
   *     - "FABRIC_E_NOT_PRIMARY"
   *     - "FABRIC_E_NOT_READY"
   *     - "FABRIC_E_RECONFIGURATION_PENDING"
   *     - "FABRIC_E_SERVICE_OFFLINE"
   *     - "E_ABORT"
   *     - "FABRIC_E_VALUE_TOO_LARGE"
   *
   *   - Possible values of the error code for HTTP status code 504 (Gateway Timeout)
   *     - "FABRIC_E_COMMUNICATION_ERROR"
   *     - "FABRIC_E_OPERATION_NOT_COMPLETE"
   *     - "FABRIC_E_TIMEOUT"
   */
  code: FabricErrorCodes;
  /** Error message. */
  message?: string;
}

/** An internal ID used by Service Fabric to uniquely identify a node. Node Id is deterministically generated from node name. */
export interface NodeId {
  /** Value of the node Id. This is a 128 bit integer. */
  id?: string;
}

/** A base type for the health state of various entities in the cluster. It contains the aggregated health state. */
export interface EntityHealthState {
  /** The health state of a Service Fabric entity such as Cluster, Node, Application, Service, Partition, Replica etc. */
  aggregatedHealthState?: HealthState;
}

/** Health information common to all entities in the cluster. It contains the aggregated health state, health events and unhealthy evaluation. */
export interface EntityHealth {
  /**
   * The HealthState representing the aggregated health state of the entity computed by Health Manager.
   * The health evaluation of the entity reflects all events reported on the entity and its children (if any).
   * The aggregation is done by applying the desired health policy.
   */
  aggregatedHealthState?: HealthState;
  /** The list of health events reported on the entity. */
  healthEvents?: HealthEvent[];
  /** The unhealthy evaluations that show why the current aggregated health state was returned by Health Manager. */
  unhealthyEvaluations?: HealthEvaluationWrapper[];
  /** Shows the health statistics for all children types of the queried entity. */
  healthStatistics?: HealthStatistics;
}

/** Represents common health report information. It is included in all health reports sent to health store and in all health events returned by health queries. */
export interface HealthInformation {
  /** The source name that identifies the client/watchdog/system component that generated the health information. */
  sourceId: string;
  /**
   * The property of the health information. An entity can have health reports for different properties.
   * The property is a string and not a fixed enumeration to allow the reporter flexibility to categorize the state condition that triggers the report.
   * For example, a reporter with SourceId "LocalWatchdog" can monitor the state of the available disk on a node,
   * so it can report "AvailableDisk" property on that node.
   * The same reporter can monitor the node connectivity, so it can report a property "Connectivity" on the same node.
   * In the health store, these reports are treated as separate health events for the specified node.
   *
   * Together with the SourceId, the property uniquely identifies the health information.
   */
  property: string;
  /** The health state of a Service Fabric entity such as Cluster, Node, Application, Service, Partition, Replica etc. */
  healthState: HealthState;
  /**
   * The duration for which this health report is valid. This field uses ISO8601 format for specifying the duration.
   * When clients report periodically, they should send reports with higher frequency than time to live.
   * If clients report on transition, they can set the time to live to infinite.
   * When time to live expires, the health event that contains the health information
   * is either removed from health store, if RemoveWhenExpired is true, or evaluated at error, if RemoveWhenExpired false.
   *
   * If not specified, time to live defaults to infinite value.
   */
  timeToLiveInMilliSeconds?: string;
  /**
   * The description of the health information. It represents free text used to add human readable information about the report.
   * The maximum string length for the description is 4096 characters.
   * If the provided string is longer, it will be automatically truncated.
   * When truncated, the last characters of the description contain a marker "[Truncated]", and total string size is 4096 characters.
   * The presence of the marker indicates to users that truncation occurred.
   * Note that when truncated, the description has less than 4096 characters from the original string.
   */
  description?: string;
  /**
   * The sequence number for this health report as a numeric string.
   * The report sequence number is used by the health store to detect stale reports.
   * If not specified, a sequence number is auto-generated by the health client when a report is added.
   */
  sequenceNumber?: string;
  /**
   * Value that indicates whether the report is removed from health store when it expires.
   * If set to true, the report is removed from the health store after it expires.
   * If set to false, the report is treated as an error when expired. The value of this property is false by default.
   * When clients report periodically, they should set RemoveWhenExpired false (default).
   * This way, if the reporter has issues (e.g. deadlock) and can't report, the entity is evaluated at error when the health report expires.
   * This flags the entity as being in Error health state.
   */
  removeWhenExpired?: boolean;
  /**
   * A health report ID which identifies the health report and can be used to find more detailed information about a specific health event at
   * aka.ms/sfhealthid
   */
  healthReportId?: string;
}

/** Wrapper object for health evaluation. */
export interface HealthEvaluationWrapper {
  /** Represents a health evaluation which describes the data and the algorithm used by health manager to evaluate the health of an entity. */
  healthEvaluation?: HealthEvaluationUnion;
}

/** Represents a health evaluation which describes the data and the algorithm used by health manager to evaluate the health of an entity. */
export interface HealthEvaluation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind:
    | "Application"
    | "Applications"
    | "ApplicationTypeApplications"
    | "DeltaNodesCheck"
    | "DeployedApplication"
    | "DeployedApplications"
    | "DeployedServicePackage"
    | "DeployedServicePackages"
    | "Event"
    | "Node"
    | "Nodes"
    | "Partition"
    | "Partitions"
    | "Replica"
    | "Replicas"
    | "Service"
    | "Services"
    | "SystemApplication"
    | "UpgradeDomainDeltaNodesCheck"
    | "UpgradeDomainDeployedApplications"
    | "UpgradeDomainNodes"
    | "NodeTypeNodes";
  /** The health state of a Service Fabric entity such as Cluster, Node, Application, Service, Partition, Replica etc. */
  aggregatedHealthState?: HealthState;
  /** Description of the health evaluation, which represents a summary of the evaluation process. */
  description?: string;
}

/**
 * The health statistics of an entity, returned as part of the health query result when the query description is configured to include statistics.
 * The statistics include health state counts for all children types of the current entity.
 * For example, for cluster, the health statistics include health state counts for nodes, applications, services, partitions, replicas, deployed applications and deployed service packages.
 * For partition, the health statistics include health counts for replicas.
 */
export interface HealthStatistics {
  /** List of health state counts per entity kind, which keeps track of how many children of the queried entity are in Ok, Warning and Error state. */
  healthStateCountList?: EntityKindHealthStateCount[];
}

/** Represents health state count for entities of the specified entity kind. */
export interface EntityKindHealthStateCount {
  /** The entity kind for which health states are evaluated. */
  entityKind?: EntityKind;
  /** The health state count for the entities of the specified kind. */
  healthStateCount?: HealthStateCount;
}

/** Represents information about how many health entities are in Ok, Warning and Error health state. */
export interface HealthStateCount {
  /** The number of health entities with aggregated health state Ok. */
  okCount?: number;
  /** The number of health entities with aggregated health state Warning. */
  warningCount?: number;
  /** The number of health entities with aggregated health state Error. */
  errorCount?: number;
}

/** Health policies to evaluate cluster health. */
export interface ClusterHealthPolicies {
  /**
   * Defines a map that contains specific application health policies for different applications.
   * Each entry specifies as key the application name and as value an ApplicationHealthPolicy used to evaluate the application health.
   * If an application is not specified in the map, the application health evaluation uses the ApplicationHealthPolicy found in its application manifest or the default application health policy (if no health policy is defined in the manifest).
   * The map is empty by default.
   */
  applicationHealthPolicyMap?: ApplicationHealthPolicyMapItem[];
  /** Defines a health policy used to evaluate the health of the cluster or of a cluster node. */
  clusterHealthPolicy?: ClusterHealthPolicy;
}

/** Defines an item in ApplicationHealthPolicyMap. */
export interface ApplicationHealthPolicyMapItem {
  /** The key of the application health policy map item. This is the name of the application. */
  key: string;
  /** The value of the application health policy map item. This is the ApplicationHealthPolicy for this application. */
  value: ApplicationHealthPolicy;
}

/** Defines a health policy used to evaluate the health of an application or one of its children entities. */
export interface ApplicationHealthPolicy {
  /** Indicates whether warnings are treated with the same severity as errors. */
  considerWarningAsError?: boolean;
  /**
   * The maximum allowed percentage of unhealthy deployed applications. Allowed values are Byte values from zero to 100.
   * The percentage represents the maximum tolerated percentage of deployed applications that can be unhealthy before the application is considered in error.
   * This is calculated by dividing the number of unhealthy deployed applications over the number of nodes where the application is currently deployed on in the cluster.
   * The computation rounds up to tolerate one failure on small numbers of nodes. Default percentage is zero.
   */
  maxPercentUnhealthyDeployedApplications?: number;
  /** The health policy used by default to evaluate the health of a service type. */
  defaultServiceTypeHealthPolicy?: ServiceTypeHealthPolicy;
  /** The map with service type health policy per service type name. The map is empty by default. */
  serviceTypeHealthPolicyMap?: ServiceTypeHealthPolicyMapItem[];
}

/** Represents the health policy used to evaluate the health of services belonging to a service type. */
export interface ServiceTypeHealthPolicy {
  /**
   * The maximum allowed percentage of unhealthy partitions per service. Allowed values are Byte values from zero to 100
   *
   * The percentage represents the maximum tolerated percentage of partitions that can be unhealthy before the service is considered in error.
   * If the percentage is respected but there is at least one unhealthy partition, the health is evaluated as Warning.
   * The percentage is calculated by dividing the number of unhealthy partitions over the total number of partitions in the service.
   * The computation rounds up to tolerate one failure on small numbers of partitions. Default percentage is zero.
   */
  maxPercentUnhealthyPartitionsPerService?: number;
  /**
   * The maximum allowed percentage of unhealthy replicas per partition. Allowed values are Byte values from zero to 100.
   *
   * The percentage represents the maximum tolerated percentage of replicas that can be unhealthy before the partition is considered in error.
   * If the percentage is respected but there is at least one unhealthy replica, the health is evaluated as Warning.
   * The percentage is calculated by dividing the number of unhealthy replicas over the total number of replicas in the partition.
   * The computation rounds up to tolerate one failure on small numbers of replicas. Default percentage is zero.
   */
  maxPercentUnhealthyReplicasPerPartition?: number;
  /**
   * The maximum allowed percentage of unhealthy services. Allowed values are Byte values from zero to 100.
   *
   * The percentage represents the maximum tolerated percentage of services that can be unhealthy before the application is considered in error.
   * If the percentage is respected but there is at least one unhealthy service, the health is evaluated as Warning.
   * This is calculated by dividing the number of unhealthy services of the specific service type over the total number of services of the specific service type.
   * The computation rounds up to tolerate one failure on small numbers of services. Default percentage is zero.
   */
  maxPercentUnhealthyServices?: number;
}

/** Defines an item in ServiceTypeHealthPolicyMap. */
export interface ServiceTypeHealthPolicyMapItem {
  /** The key of the service type health policy map item. This is the name of the service type. */
  key: string;
  /** The value of the service type health policy map item. This is the ServiceTypeHealthPolicy for this service type. */
  value: ServiceTypeHealthPolicy;
}

/** Defines a health policy used to evaluate the health of the cluster or of a cluster node. */
export interface ClusterHealthPolicy {
  /** Indicates whether warnings are treated with the same severity as errors. */
  considerWarningAsError?: boolean;
  /**
   * The maximum allowed percentage of unhealthy nodes before reporting an error. For example, to allow 10% of nodes to be unhealthy, this value would be 10.
   *
   * The percentage represents the maximum tolerated percentage of nodes that can be unhealthy before the cluster is considered in error.
   * If the percentage is respected but there is at least one unhealthy node, the health is evaluated as Warning.
   * The percentage is calculated by dividing the number of unhealthy nodes over the total number of nodes in the cluster.
   * The computation rounds up to tolerate one failure on small numbers of nodes. Default percentage is zero.
   *
   * In large clusters, some nodes will always be down or out for repairs, so this percentage should be configured to tolerate that.
   */
  maxPercentUnhealthyNodes?: number;
  /**
   * The maximum allowed percentage of unhealthy applications before reporting an error. For example, to allow 10% of applications to be unhealthy, this value would be 10.
   *
   * The percentage represents the maximum tolerated percentage of applications that can be unhealthy before the cluster is considered in error.
   * If the percentage is respected but there is at least one unhealthy application, the health is evaluated as Warning.
   * This is calculated by dividing the number of unhealthy applications over the total number of application instances in the cluster, excluding applications of application types that are included in the ApplicationTypeHealthPolicyMap.
   * The computation rounds up to tolerate one failure on small numbers of applications. Default percentage is zero.
   */
  maxPercentUnhealthyApplications?: number;
  /**
   * Defines a map with max percentage unhealthy applications for specific application types.
   * Each entry specifies as key the application type name and as value an integer that represents the MaxPercentUnhealthyApplications percentage used to evaluate the applications of the specified application type.
   *
   * The application type health policy map can be used during cluster health evaluation to describe special application types.
   * The application types included in the map are evaluated against the percentage specified in the map, and not with the global MaxPercentUnhealthyApplications defined in the cluster health policy.
   * The applications of application types specified in the map are not counted against the global pool of applications.
   * For example, if some applications of a type are critical, the cluster administrator can add an entry to the map for that application type
   * and assign it a value of 0% (that is, do not tolerate any failures).
   * All other applications can be evaluated with MaxPercentUnhealthyApplications set to 20% to tolerate some failures out of the thousands of application instances.
   * The application type health policy map is used only if the cluster manifest enables application type health evaluation using the configuration entry for HealthManager/EnableApplicationTypeHealthEvaluation.
   */
  applicationTypeHealthPolicyMap?: ApplicationTypeHealthPolicyMapItem[];
  /**
   * Defines a map with max percentage unhealthy nodes for specific node types.
   * Each entry specifies as key the node type name and as value an integer that represents the MaxPercentUnhealthyNodes percentage used to evaluate the nodes of the specified node type.
   *
   * The node type health policy map can be used during cluster health evaluation to describe special node types.
   * They are evaluated against the percentages associated with their node type name in the map.
   * Setting this has no impact on the global pool of nodes used for MaxPercentUnhealthyNodes.
   * The node type health policy map is used only if the cluster manifest enables node type health evaluation using the configuration entry for HealthManager/EnableNodeTypeHealthEvaluation.
   *
   * For example, given a cluster with many nodes of different types, with important work hosted on node type "SpecialNodeType" that should not tolerate any nodes down.
   * You can specify global MaxPercentUnhealthyNodes to 20% to tolerate some failures for all nodes, but for the node type "SpecialNodeType", set the MaxPercentUnhealthyNodes to 0 by
   * setting the value in the key value pair in NodeTypeHealthPolicyMapItem. The key is the node type name.
   * This way, as long as no nodes of type "SpecialNodeType" are in Error state,
   * even if some of the many nodes in the global pool are in Error state, but below the global unhealthy percentage, the cluster would be evaluated to Warning.
   * A Warning health state does not impact cluster upgrade or other monitoring triggered by Error health state.
   * But even one node of type SpecialNodeType in Error would make cluster unhealthy (in Error rather than Warning/Ok), which triggers rollback or pauses the cluster upgrade, depending on the upgrade configuration.
   *
   * Conversely, setting the global MaxPercentUnhealthyNodes to 0, and setting SpecialNodeType's max percent unhealthy nodes to 100,
   * with one node of type SpecialNodeType in Error state would still put the cluster in an Error state, since the global restriction is more strict in this case.
   */
  nodeTypeHealthPolicyMap?: NodeTypeHealthPolicyMapItem[];
}

/** Defines an item in ApplicationTypeHealthPolicyMap. */
export interface ApplicationTypeHealthPolicyMapItem {
  /** The key of the application type health policy map item. This is the name of the application type. */
  key: string;
  /**
   * The value of the application type health policy map item.
   * The max percent unhealthy applications allowed for the application type. Must be between zero and 100.
   */
  value: number;
}

/** Defines an item in NodeTypeHealthPolicyMap. */
export interface NodeTypeHealthPolicyMapItem {
  /** The key of the node type health policy map item. This is the name of the node type. */
  key: string;
  /**
   * The value of the node type health policy map item.
   * If the percentage is respected but there is at least one unhealthy node in the node type, the health is evaluated as Warning.
   * The percentage is calculated by dividing the number of unhealthy nodes over the total number of nodes in the node type.
   * The computation rounds up to tolerate one failure on small numbers of nodes.
   * The max percent unhealthy nodes allowed for the node type. Must be between zero and 100.
   */
  value: number;
}

/**
 * Represents the health chunk of the cluster.
 * Contains the cluster aggregated health state, and the cluster entities that respect the input filter.
 */
export interface ClusterHealthChunk {
  /**
   * The HealthState representing the aggregated health state of the cluster computed by Health Manager.
   * The health evaluation of the entity reflects all events reported on the entity and its children (if any).
   * The aggregation is done by applying the desired cluster health policy and the application health policies.
   */
  healthState?: HealthState;
  /** The list of node health state chunks in the cluster that respect the filters in the cluster health chunk query description. */
  nodeHealthStateChunks?: NodeHealthStateChunkList;
  /** The list of application health state chunks in the cluster that respect the filters in the cluster health chunk query description. */
  applicationHealthStateChunks?: ApplicationHealthStateChunkList;
}

/** A base type for the health state chunk of various entities in the cluster. It contains the aggregated health state. */
export interface EntityHealthStateChunk {
  /** The health state of a Service Fabric entity such as Cluster, Node, Application, Service, Partition, Replica etc. */
  healthState?: HealthState;
}

/** A base type for the list of health state chunks found in the cluster. It contains the total number of health states that match the input filters. */
export interface EntityHealthStateChunkList {
  /** Total number of entity health state objects that match the specified filters from the cluster health chunk query description. */
  totalCount?: number;
}

/** The list of service health state chunks that respect the input filters in the chunk query. Returned by get cluster health state chunks query. */
export interface ServiceHealthStateChunkList {
  /** The list of service health state chunks that respect the input filters in the chunk query. */
  items?: ServiceHealthStateChunk[];
}

/**
 * The list of partition health state chunks that respect the input filters in the chunk query description.
 * Returned by get cluster health state chunks query as part of the parent application hierarchy.
 */
export interface PartitionHealthStateChunkList {
  /** The list of partition health state chunks that respect the input filters in the chunk query. */
  items?: PartitionHealthStateChunk[];
}

/** The list of replica health state chunks that respect the input filters in the chunk query. Returned by get cluster health state chunks query. */
export interface ReplicaHealthStateChunkList {
  /** The list of replica health state chunks that respect the input filters in the chunk query. */
  items?: ReplicaHealthStateChunk[];
}

/** The list of deployed application health state chunks that respect the input filters in the chunk query. Returned by get cluster health state chunks query. */
export interface DeployedApplicationHealthStateChunkList {
  /** The list of deployed application health state chunks that respect the input filters in the chunk query. */
  items?: DeployedApplicationHealthStateChunk[];
}

/** The list of deployed service package health state chunks that respect the input filters in the chunk query. Returned by get cluster health state chunks query. */
export interface DeployedServicePackageHealthStateChunkList {
  /** The list of deployed service package health state chunks that respect the input filters in the chunk query. */
  items?: DeployedServicePackageHealthStateChunk[];
}

/** The cluster health chunk query description, which can specify the health policies to evaluate cluster health and very expressive filters to select which cluster entities to include in response. */
export interface ClusterHealthChunkQueryDescription {
  /**
   * Defines a list of filters that specify which nodes to be included in the returned cluster health chunk.
   * If no filters are specified, no nodes are returned. All the nodes are used to evaluate the cluster's aggregated health state, regardless of the input filters.
   * The cluster health chunk query may specify multiple node filters.
   * For example, it can specify a filter to return all nodes with health state Error and another filter to always include a node identified by its NodeName.
   */
  nodeFilters?: NodeHealthStateFilter[];
  /**
   * Defines a list of filters that specify which applications to be included in the returned cluster health chunk.
   * If no filters are specified, no applications are returned. All the applications are used to evaluate the cluster's aggregated health state, regardless of the input filters.
   * The cluster health chunk query may specify multiple application filters.
   * For example, it can specify a filter to return all applications with health state Error and another filter to always include applications of a specified application type.
   */
  applicationFilters?: ApplicationHealthStateFilter[];
  /** Defines a health policy used to evaluate the health of the cluster or of a cluster node. */
  clusterHealthPolicy?: ClusterHealthPolicy;
  /** Defines the application health policy map used to evaluate the health of an application or one of its children entities. */
  applicationHealthPolicies?: ApplicationHealthPolicies;
}

/**
 * Defines matching criteria to determine whether a node should be included in the returned cluster health chunk.
 * One filter can match zero, one or multiple nodes, depending on its properties.
 * Can be specified in the cluster health chunk query description.
 */
export interface NodeHealthStateFilter {
  /**
   * Name of the node that matches the filter. The filter is applied only to the specified node, if it exists.
   * If the node doesn't exist, no node is returned in the cluster health chunk based on this filter.
   * If the node exists, it is included in the cluster health chunk if the health state matches the other filter properties.
   * If not specified, all nodes that match the parent filters (if any) are taken into consideration and matched against the other filter members, like health state filter.
   */
  nodeNameFilter?: string;
  /**
   * The filter for the health state of the nodes. It allows selecting nodes if they match the desired health states.
   * The possible values are integer value of one of the following health states. Only nodes that match the filter are returned. All nodes are used to evaluate the cluster aggregated health state.
   * If not specified, default value is None, unless the node name is specified. If the filter has default value and node name is specified, the matching node is returned.
   * The state values are flag-based enumeration, so the value could be a combination of these values obtained using bitwise 'OR' operator.
   * For example, if the provided value is 6, it matches nodes with HealthState value of OK (2) and Warning (4).
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  healthStateFilter?: number;
}

/**
 * Defines matching criteria to determine whether a application should be included in the cluster health chunk.
 * One filter can match zero, one or multiple applications, depending on its properties.
 */
export interface ApplicationHealthStateFilter {
  /**
   * The name of the application that matches the filter, as a fabric uri. The filter is applied only to the specified application, if it exists.
   * If the application doesn't exist, no application is returned in the cluster health chunk based on this filter.
   * If the application exists, it is included in the cluster health chunk if it respects the other filter properties.
   * If not specified, all applications are matched against the other filter members, like health state filter.
   */
  applicationNameFilter?: string;
  /**
   * The name of the application type that matches the filter.
   * If specified, the filter is applied only to applications of the selected application type, if any exists.
   * If no applications of the specified application type exists, no application is returned in the cluster health chunk based on this filter.
   * Each application of the specified application type is included in the cluster health chunk if it respects the other filter properties.
   * If not specified, all applications are matched against the other filter members, like health state filter.
   */
  applicationTypeNameFilter?: string;
  /**
   * The filter for the health state of the applications. It allows selecting applications if they match the desired health states.
   * The possible values are integer value of one of the following health states. Only applications that match the filter are returned. All applications are used to evaluate the cluster aggregated health state.
   * If not specified, default value is None, unless the application name or the application type name are specified. If the filter has default value and application name is specified, the matching application is returned.
   * The state values are flag-based enumeration, so the value could be a combination of these values obtained using bitwise 'OR' operator.
   * For example, if the provided value is 6, it matches applications with HealthState value of OK (2) and Warning (4).
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  healthStateFilter?: number;
  /**
   * Defines a list of filters that specify which services to be included in the returned cluster health chunk as children of the application. The services are returned only if the parent application matches a filter.
   * If the list is empty, no services are returned. All the services are used to evaluate the parent application aggregated health state, regardless of the input filters.
   * The application filter may specify multiple service filters.
   * For example, it can specify a filter to return all services with health state Error and another filter to always include a service identified by its service name.
   */
  serviceFilters?: ServiceHealthStateFilter[];
  /**
   * Defines a list of filters that specify which deployed applications to be included in the returned cluster health chunk as children of the application. The deployed applications are returned only if the parent application matches a filter.
   * If the list is empty, no deployed applications are returned. All the deployed applications are used to evaluate the parent application aggregated health state, regardless of the input filters.
   * The application filter may specify multiple deployed application filters.
   * For example, it can specify a filter to return all deployed applications with health state Error and another filter to always include a deployed application on a specified node.
   */
  deployedApplicationFilters?: DeployedApplicationHealthStateFilter[];
}

/**
 * Defines matching criteria to determine whether a service should be included as a child of an application in the cluster health chunk.
 * The services are only returned if the parent application matches a filter specified in the cluster health chunk query description.
 * One filter can match zero, one or multiple services, depending on its properties.
 */
export interface ServiceHealthStateFilter {
  /**
   * The name of the service that matches the filter. The filter is applied only to the specified service, if it exists.
   * If the service doesn't exist, no service is returned in the cluster health chunk based on this filter.
   * If the service exists, it is included as the application's child if the health state matches the other filter properties.
   * If not specified, all services that match the parent filters (if any) are taken into consideration and matched against the other filter members, like health state filter.
   */
  serviceNameFilter?: string;
  /**
   * The filter for the health state of the services. It allows selecting services if they match the desired health states.
   * The possible values are integer value of one of the following health states. Only services that match the filter are returned. All services are used to evaluate the cluster aggregated health state.
   * If not specified, default value is None, unless the service name is specified. If the filter has default value and service name is specified, the matching service is returned.
   * The state values are flag-based enumeration, so the value could be a combination of these values obtained using bitwise 'OR' operator.
   * For example, if the provided value is 6, it matches services with HealthState value of OK (2) and Warning (4).
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  healthStateFilter?: number;
  /**
   * Defines a list of filters that specify which partitions to be included in the returned cluster health chunk as children of the service. The partitions are returned only if the parent service matches a filter.
   * If the list is empty, no partitions are returned. All the partitions are used to evaluate the parent service aggregated health state, regardless of the input filters.
   * The service filter may specify multiple partition filters.
   * For example, it can specify a filter to return all partitions with health state Error and another filter to always include a partition identified by its partition ID.
   */
  partitionFilters?: PartitionHealthStateFilter[];
}

/**
 * Defines matching criteria to determine whether a partition should be included as a child of a service in the cluster health chunk.
 * The partitions are only returned if the parent entities match a filter specified in the cluster health chunk query description. The parent service and application must be included in the cluster health chunk.
 * One filter can match zero, one or multiple partitions, depending on its properties.
 */
export interface PartitionHealthStateFilter {
  /**
   * ID of the partition that matches the filter. The filter is applied only to the specified partition, if it exists.
   * If the partition doesn't exist, no partition is returned in the cluster health chunk based on this filter.
   * If the partition exists, it is included in the cluster health chunk if it respects the other filter properties.
   * If not specified, all partitions that match the parent filters (if any) are taken into consideration and matched against the other filter members, like health state filter.
   */
  partitionIdFilter?: string;
  /**
   * The filter for the health state of the partitions. It allows selecting partitions if they match the desired health states.
   * The possible values are integer value of one of the following health states. Only partitions that match the filter are returned. All partitions are used to evaluate the cluster aggregated health state.
   * If not specified, default value is None, unless the partition ID is specified. If the filter has default value and partition ID is specified, the matching partition is returned.
   * The state values are flag-based enumeration, so the value could be a combination of these values obtained using bitwise 'OR' operator.
   * For example, if the provided value is 6, it matches partitions with HealthState value of OK (2) and Warning (4).
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  healthStateFilter?: number;
  /**
   * Defines a list of filters that specify which replicas to be included in the returned cluster health chunk as children of the parent partition. The replicas are returned only if the parent partition matches a filter.
   * If the list is empty, no replicas are returned. All the replicas are used to evaluate the parent partition aggregated health state, regardless of the input filters.
   * The partition filter may specify multiple replica filters.
   * For example, it can specify a filter to return all replicas with health state Error and another filter to always include a replica identified by its replica id.
   */
  replicaFilters?: ReplicaHealthStateFilter[];
}

/**
 * Defines matching criteria to determine whether a replica should be included as a child of a partition in the cluster health chunk.
 * The replicas are only returned if the parent entities match a filter specified in the cluster health chunk query description. The parent partition, service and application must be included in the cluster health chunk.
 * One filter can match zero, one or multiple replicas, depending on its properties.
 */
export interface ReplicaHealthStateFilter {
  /**
   * Id of the stateful service replica or stateless service instance that matches the filter. The filter is applied only to the specified replica, if it exists.
   * If the replica doesn't exist, no replica is returned in the cluster health chunk based on this filter.
   * If the replica exists, it is included in the cluster health chunk if it respects the other filter properties.
   * If not specified, all replicas that match the parent filters (if any) are taken into consideration and matched against the other filter members, like health state filter.
   */
  replicaOrInstanceIdFilter?: string;
  /**
   * The filter for the health state of the replicas. It allows selecting replicas if they match the desired health states.
   * The possible values are integer value of one of the following health states. Only replicas that match the filter are returned. All replicas are used to evaluate the parent partition aggregated health state.
   * If not specified, default value is None, unless the replica ID is specified. If the filter has default value and replica ID is specified, the matching replica is returned.
   * The state values are flag-based enumeration, so the value could be a combination of these values obtained using bitwise 'OR' operator.
   * For example, if the provided value is 6, it matches replicas with HealthState value of OK (2) and Warning (4).
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  healthStateFilter?: number;
}

/**
 * Defines matching criteria to determine whether a deployed application should be included as a child of an application in the cluster health chunk.
 * The deployed applications are only returned if the parent application matches a filter specified in the cluster health chunk query description.
 * One filter can match zero, one or multiple deployed applications, depending on its properties.
 */
export interface DeployedApplicationHealthStateFilter {
  /**
   * The name of the node where the application is deployed in order to match the filter.
   * If specified, the filter is applied only to the application deployed on the specified node.
   * If the application is not deployed on the node with the specified name, no deployed application is returned in the cluster health chunk based on this filter.
   * Otherwise, the deployed application is included in the cluster health chunk if it respects the other filter properties.
   * If not specified, all deployed applications that match the parent filters (if any) are taken into consideration and matched against the other filter members, like health state filter.
   */
  nodeNameFilter?: string;
  /**
   * The filter for the health state of the deployed applications. It allows selecting deployed applications if they match the desired health states.
   * The possible values are integer value of one of the following health states. Only deployed applications that match the filter are returned. All deployed applications are used to evaluate the cluster aggregated health state.
   * If not specified, default value is None, unless the node name is specified. If the filter has default value and node name is specified, the matching deployed application is returned.
   * The state values are flag-based enumeration, so the value could be a combination of these values obtained using bitwise 'OR' operator.
   * For example, if the provided value is 6, it matches deployed applications with HealthState value of OK (2) and Warning (4).
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  healthStateFilter?: number;
  /**
   * Defines a list of filters that specify which deployed service packages to be included in the returned cluster health chunk as children of the parent deployed application. The deployed service packages are returned only if the parent deployed application matches a filter.
   * If the list is empty, no deployed service packages are returned. All the deployed service packages are used to evaluate the parent deployed application aggregated health state, regardless of the input filters.
   * The deployed application filter may specify multiple deployed service package filters.
   * For example, it can specify a filter to return all deployed service packages with health state Error and another filter to always include a deployed service package on a node.
   */
  deployedServicePackageFilters?: DeployedServicePackageHealthStateFilter[];
}

/**
 * Defines matching criteria to determine whether a deployed service package should be included as a child of a deployed application in the cluster health chunk.
 * The deployed service packages are only returned if the parent entities match a filter specified in the cluster health chunk query description. The parent deployed application and its parent application must be included in the cluster health chunk.
 * One filter can match zero, one or multiple deployed service packages, depending on its properties.
 */
export interface DeployedServicePackageHealthStateFilter {
  /**
   * The name of the service manifest which identifies the deployed service packages that matches the filter.
   * If specified, the filter is applied only to the specified deployed service packages, if any.
   * If no deployed service packages with specified manifest name exist, nothing is returned in the cluster health chunk based on this filter.
   * If any deployed service package exists, they are included in the cluster health chunk if it respects the other filter properties.
   * If not specified, all deployed service packages that match the parent filters (if any) are taken into consideration and matched against the other filter members, like health state filter.
   */
  serviceManifestNameFilter?: string;
  /**
   * The activation ID of a deployed service package that matches the filter.
   * If not specified, the filter applies to all deployed service packages that match the other parameters.
   * If specified, the filter matches only the deployed service package with the specified activation ID.
   */
  servicePackageActivationIdFilter?: string;
  /**
   * The filter for the health state of the deployed service packages. It allows selecting deployed service packages if they match the desired health states.
   * The possible values are integer value of one of the following health states. Only deployed service packages that match the filter are returned. All deployed service packages are used to evaluate the parent deployed application aggregated health state.
   * If not specified, default value is None, unless the deployed service package ID is specified. If the filter has default value and deployed service package ID is specified, the matching deployed service package is returned.
   * The state values are flag-based enumeration, so the value could be a combination of these values obtained using bitwise 'OR' operator.
   * For example, if the provided value is 6, it matches deployed service packages with HealthState value of OK (2) and Warning (4).
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  healthStateFilter?: number;
}

/** Defines the application health policy map used to evaluate the health of an application or one of its children entities. */
export interface ApplicationHealthPolicies {
  /** The wrapper that contains the map with application health policies used to evaluate specific applications in the cluster. */
  applicationHealthPolicyMap?: ApplicationHealthPolicyMapItem[];
}

/** Information about a Service Fabric code version. */
export interface FabricCodeVersionInfo {
  /** The product version of Service Fabric. */
  codeVersion?: string;
}

/** Information about a Service Fabric config version. */
export interface FabricConfigVersionInfo {
  /** The config version of Service Fabric. */
  configVersion?: string;
}

/** Information about a cluster upgrade. */
export interface ClusterUpgradeProgressObject {
  /** The ServiceFabric code version of the cluster. */
  codeVersion?: string;
  /** The cluster configuration version (specified in the cluster manifest). */
  configVersion?: string;
  /** List of upgrade domains and their statuses. Not applicable to node-by-node upgrades. */
  upgradeDomains?: UpgradeDomainInfo[];
  /** List of upgrade units and their statuses. */
  upgradeUnits?: UpgradeUnitInfo[];
  /** The state of the upgrade domain. */
  upgradeState?: UpgradeState;
  /** The name of the next upgrade domain to be processed. Not applicable to node-by-node upgrades. */
  nextUpgradeDomain?: string;
  /** The mode used to monitor health during a rolling upgrade. The values are UnmonitoredAuto, UnmonitoredManual, Monitored, and UnmonitoredDeferred. */
  rollingUpgradeMode?: UpgradeMode;
  /** Represents a ServiceFabric cluster upgrade */
  upgradeDescription?: ClusterUpgradeDescriptionObject;
  /** The estimated elapsed time spent processing the current overall upgrade. */
  upgradeDurationInMilliseconds?: string;
  /** The estimated elapsed time spent processing the current upgrade domain. Not applicable to node-by-node upgrades. */
  upgradeDomainDurationInMilliseconds?: string;
  /** List of health evaluations that resulted in the current aggregated health state. */
  unhealthyEvaluations?: HealthEvaluationWrapper[];
  /** Information about the current in-progress upgrade domain. Not applicable to node-by-node upgrades. */
  currentUpgradeDomainProgress?: CurrentUpgradeDomainProgressInfo;
  /** Information about the current in-progress upgrade units. */
  currentUpgradeUnitsProgress?: CurrentUpgradeUnitsProgressInfo;
  /** The start time of the upgrade in UTC. */
  startTimestampUtc?: string;
  /** The failure time of the upgrade in UTC. */
  failureTimestampUtc?: string;
  /** The cause of an upgrade failure that resulted in FailureAction being executed. */
  failureReason?: FailureReason;
  /** The detailed upgrade progress for nodes in the current upgrade domain at the point of failure. Not applicable to node-by-node upgrades. */
  upgradeDomainProgressAtFailure?: FailedUpgradeDomainProgressObject;
  /** Indicates whether this upgrade is node-by-node. */
  isNodeByNode?: boolean;
}

/** Information about an upgrade domain. */
export interface UpgradeDomainInfo {
  /** The name of the upgrade domain */
  name?: string;
  /** The state of the upgrade domain. */
  state?: UpgradeDomainState;
}

/** Information about an upgrade unit. */
export interface UpgradeUnitInfo {
  /** The name of the upgrade unit */
  name?: string;
  /** The state of the upgrade unit. */
  state?: UpgradeUnitState;
}

/** Represents a ServiceFabric cluster upgrade */
export interface ClusterUpgradeDescriptionObject {
  /** The cluster configuration version (specified in the cluster manifest). */
  configVersion?: string;
  /** The ServiceFabric code version of the cluster. */
  codeVersion?: string;
  /** The kind of upgrade out of the following possible values. */
  upgradeKind?: UpgradeKind;
  /** The mode used to monitor health during a rolling upgrade. The values are UnmonitoredAuto, UnmonitoredManual, Monitored, and UnmonitoredDeferred. */
  rollingUpgradeMode?: UpgradeMode;
  /** The maximum amount of time to block processing of an upgrade domain and prevent loss of availability when there are unexpected issues. When this timeout expires, processing of the upgrade domain will proceed regardless of availability loss issues. The timeout is reset at the start of each upgrade domain. Valid values are between 0 and 42949672925 inclusive. (unsigned 32-bit integer). */
  upgradeReplicaSetCheckTimeoutInSeconds?: number;
  /** If true, then processes are forcefully restarted during upgrade even when the code version has not changed (the upgrade only changes configuration or data). */
  forceRestart?: boolean;
  /** Defines the order in which an upgrade proceeds through the cluster. */
  sortOrder?: UpgradeSortOrder;
  /** When true, enables delta health evaluation rather than absolute health evaluation after completion of each upgrade domain. */
  enableDeltaHealthEvaluation?: boolean;
  /** Describes the parameters for monitoring an upgrade in Monitored mode. */
  monitoringPolicy?: MonitoringPolicyDescription;
  /** Defines a health policy used to evaluate the health of the cluster or of a cluster node. */
  clusterHealthPolicy?: ClusterHealthPolicy;
  /** Defines a health policy used to evaluate the health of the cluster during a cluster upgrade. */
  clusterUpgradeHealthPolicy?: ClusterUpgradeHealthPolicyObject;
  /** Represents the map of application health policies for a ServiceFabric cluster upgrade */
  applicationHealthPolicyMap?: ApplicationHealthPolicyMapObject;
}

/** Describes the parameters for monitoring an upgrade in Monitored mode. */
export interface MonitoringPolicyDescription {
  /**
   * The compensating action to perform when a Monitored upgrade encounters monitoring policy or health policy violations.
   * Invalid indicates the failure action is invalid. Rollback specifies that the upgrade will start rolling back automatically.
   * Manual indicates that the upgrade will switch to UnmonitoredManual upgrade mode.
   */
  failureAction?: FailureAction;
  /** The amount of time to wait after completing an upgrade domain before applying health policies. It is first interpreted as a string representing an ISO 8601 duration. If that fails, then it is interpreted as a number representing the total number of milliseconds. */
  healthCheckWaitDurationInMilliseconds?: string;
  /** The amount of time that the application or cluster must remain healthy before the upgrade proceeds to the next upgrade domain. It is first interpreted as a string representing an ISO 8601 duration. If that fails, then it is interpreted as a number representing the total number of milliseconds. */
  healthCheckStableDurationInMilliseconds?: string;
  /** The amount of time to retry health evaluation when the application or cluster is unhealthy before FailureAction is executed. It is first interpreted as a string representing an ISO 8601 duration. If that fails, then it is interpreted as a number representing the total number of milliseconds. */
  healthCheckRetryTimeoutInMilliseconds?: string;
  /** The amount of time the overall upgrade has to complete before FailureAction is executed. It is first interpreted as a string representing an ISO 8601 duration. If that fails, then it is interpreted as a number representing the total number of milliseconds. */
  upgradeTimeoutInMilliseconds?: string;
  /** The amount of time each upgrade domain has to complete before FailureAction is executed. It is first interpreted as a string representing an ISO 8601 duration. If that fails, then it is interpreted as a number representing the total number of milliseconds. */
  upgradeDomainTimeoutInMilliseconds?: string;
}

/** Defines a health policy used to evaluate the health of the cluster during a cluster upgrade. */
export interface ClusterUpgradeHealthPolicyObject {
  /** The maximum allowed percentage of nodes health degradation allowed during cluster upgrades. The delta is measured between the state of the nodes at the beginning of upgrade and the state of the nodes at the time of the health evaluation. The check is performed after every upgrade domain upgrade completion to make sure the global state of the cluster is within tolerated limits. The default value is 10%. */
  maxPercentDeltaUnhealthyNodes?: number;
  /** The maximum allowed percentage of upgrade domain nodes health degradation allowed during cluster upgrades. The delta is measured between the state of the upgrade domain nodes at the beginning of upgrade and the state of the upgrade domain nodes at the time of the health evaluation. The check is performed after every upgrade domain upgrade completion for all completed upgrade domains to make sure the state of the upgrade domains is within tolerated limits. The default value is 15%. */
  maxPercentUpgradeDomainDeltaUnhealthyNodes?: number;
}

/** Represents the map of application health policies for a ServiceFabric cluster upgrade */
export interface ApplicationHealthPolicyMapObject {
  /**
   * Defines a map that contains specific application health policies for different applications.
   * Each entry specifies as key the application name and as value an ApplicationHealthPolicy used to evaluate the application health.
   * If an application is not specified in the map, the application health evaluation uses the ApplicationHealthPolicy found in its application manifest or the default application health policy (if no health policy is defined in the manifest).
   * The map is empty by default.
   */
  applicationHealthPolicyMap?: ApplicationHealthPolicyMapItem[];
}

/** Information about the current in-progress upgrade domain. Not applicable to node-by-node upgrades. */
export interface CurrentUpgradeDomainProgressInfo {
  /** The name of the upgrade domain */
  domainName?: string;
  /** List of upgrading nodes and their statuses */
  nodeUpgradeProgressList?: NodeUpgradeProgressInfo[];
}

/** Information about the upgrading node and its status */
export interface NodeUpgradeProgressInfo {
  /** The name of a Service Fabric node. */
  nodeName?: string;
  /** The state of the upgrading node. */
  upgradePhase?: NodeUpgradePhase;
  /** List of pending safety checks */
  pendingSafetyChecks?: SafetyCheckWrapper[];
  /** The estimated time spent processing the node since it was deactivated during a node-by-node upgrade. */
  upgradeDuration?: string;
}

/** A wrapper for the safety check object. Safety checks are performed by service fabric before continuing with the operations. These checks ensure the availability of the service and the reliability of the state. */
export interface SafetyCheckWrapper {
  /** Represents a safety check performed by service fabric before continuing with the operations. These checks ensure the availability of the service and the reliability of the state. */
  safetyCheck?: SafetyCheckUnion;
}

/** Represents a safety check performed by service fabric before continuing with the operations. These checks ensure the availability of the service and the reliability of the state. */
export interface SafetyCheck {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind:
    | "PartitionSafetyCheck"
    | "EnsureAvailability"
    | "EnsurePartitionQuorum"
    | "EnsureSeedNodeQuorum"
    | "WaitForInbuildReplica"
    | "WaitForPrimaryPlacement"
    | "WaitForPrimarySwap"
    | "WaitForReconfiguration";
}

/** Information about the current in-progress upgrade units. */
export interface CurrentUpgradeUnitsProgressInfo {
  /** The name of the upgrade domain. Not applicable to node-by-node upgrades. */
  domainName?: string;
  /** List of upgrading nodes and their statuses */
  nodeUpgradeProgressList?: NodeUpgradeProgressInfo[];
}

/** The detailed upgrade progress for nodes in the current upgrade domain at the point of failure. Not applicable to node-by-node upgrades. */
export interface FailedUpgradeDomainProgressObject {
  /** The name of the upgrade domain */
  domainName?: string;
  /** List of upgrading nodes and their statuses */
  nodeUpgradeProgressList?: NodeUpgradeProgressInfo[];
}

/** Information about the standalone cluster configuration. */
export interface ClusterConfiguration {
  /** The contents of the cluster configuration file. */
  clusterConfiguration?: string;
}

/** Information about a standalone cluster configuration upgrade status. */
export interface ClusterConfigurationUpgradeStatusInfo {
  /** The state of the upgrade domain. */
  upgradeState?: UpgradeState;
  /** The cluster manifest version. */
  progressStatus?: number;
  /** The cluster configuration version. */
  configVersion?: string;
  /** The cluster upgrade status details. */
  details?: string;
}

/** Service state of Service Fabric Upgrade Orchestration Service. */
export interface UpgradeOrchestrationServiceState {
  /** The state of Service Fabric Upgrade Orchestration Service. */
  serviceState?: string;
}

/** Service state summary of Service Fabric Upgrade Orchestration Service. */
export interface UpgradeOrchestrationServiceStateSummary {
  /** The current code version of the cluster. */
  currentCodeVersion?: string;
  /** The current manifest version of the cluster. */
  currentManifestVersion?: string;
  /** The target code version of  the cluster. */
  targetCodeVersion?: string;
  /** The target manifest version of the cluster. */
  targetManifestVersion?: string;
  /** The type of the pending upgrade of the cluster. */
  pendingUpgradeType?: string;
}

/** Describes the parameters for provisioning a cluster. */
export interface ProvisionFabricDescription {
  /** The cluster code package file path. */
  codeFilePath?: string;
  /** The cluster manifest file path. */
  clusterManifestFilePath?: string;
}

/** Describes the parameters for unprovisioning a cluster. */
export interface UnprovisionFabricDescription {
  /** The cluster code package version. */
  codeVersion?: string;
  /** The cluster manifest version. */
  configVersion?: string;
}

/** Describes the parameters for resuming a cluster upgrade. */
export interface ResumeClusterUpgradeDescription {
  /** The next upgrade domain for this cluster upgrade. */
  upgradeDomain: string;
}

/** Describes the parameters for starting a cluster upgrade. */
export interface StartClusterUpgradeDescription {
  /** The cluster code version. */
  codeVersion?: string;
  /** The cluster configuration version. */
  configVersion?: string;
  /** The kind of upgrade out of the following possible values. */
  upgradeKind?: UpgradeKind;
  /** The mode used to monitor health during a rolling upgrade. The values are UnmonitoredAuto, UnmonitoredManual, Monitored, and UnmonitoredDeferred. */
  rollingUpgradeMode?: UpgradeMode;
  /** The maximum amount of time to block processing of an upgrade domain and prevent loss of availability when there are unexpected issues. When this timeout expires, processing of the upgrade domain will proceed regardless of availability loss issues. The timeout is reset at the start of each upgrade domain. Valid values are between 0 and 42949672925 inclusive. (unsigned 32-bit integer). */
  upgradeReplicaSetCheckTimeoutInSeconds?: number;
  /** If true, then processes are forcefully restarted during upgrade even when the code version has not changed (the upgrade only changes configuration or data). */
  forceRestart?: boolean;
  /** Defines the order in which an upgrade proceeds through the cluster. */
  sortOrder?: UpgradeSortOrder;
  /** Describes the parameters for monitoring an upgrade in Monitored mode. */
  monitoringPolicy?: MonitoringPolicyDescription;
  /** Defines a health policy used to evaluate the health of the cluster or of a cluster node. */
  clusterHealthPolicy?: ClusterHealthPolicy;
  /** When true, enables delta health evaluation rather than absolute health evaluation after completion of each upgrade domain. */
  enableDeltaHealthEvaluation?: boolean;
  /** Defines a health policy used to evaluate the health of the cluster during a cluster upgrade. */
  clusterUpgradeHealthPolicy?: ClusterUpgradeHealthPolicyObject;
  /** Defines the application health policy map used to evaluate the health of an application or one of its children entities. */
  applicationHealthPolicyMap?: ApplicationHealthPolicies;
  /**
   * Duration in seconds, to wait before a stateless instance is closed, to allow the active requests to drain gracefully. This would be effective when the instance is closing during the application/cluster
   * upgrade, only for those instances which have a non-zero delay duration configured in the service description. See InstanceCloseDelayDurationSeconds property in $ref: "#/definitions/StatelessServiceDescription.yaml" for details.
   * Note, the default value of InstanceCloseDelayDurationInSeconds is 4294967295, which indicates that the behavior will entirely depend on the delay configured in the stateless service description.
   */
  instanceCloseDelayDurationInSeconds?: number;
}

/** Describes the parameters for a standalone cluster configuration upgrade. */
export interface ClusterConfigurationUpgradeDescription {
  /** The cluster configuration as a JSON string. For example, [this file](https://github.com/Azure-Samples/service-fabric-dotnet-standalone-cluster-configuration/blob/master/Samples/ClusterConfig.Unsecure.DevCluster.json) contains JSON describing the [nodes and other properties of the cluster](https://docs.microsoft.com/azure/service-fabric/service-fabric-cluster-manifest). */
  clusterConfig: string;
  /** The length of time between attempts to perform health checks if the application or cluster is not healthy. */
  healthCheckRetryTimeout?: string;
  /** The length of time to wait after completing an upgrade domain before starting the health checks process. */
  healthCheckWaitDurationInSeconds?: string;
  /** The length of time that the application or cluster must remain healthy before the upgrade proceeds to the next upgrade domain. */
  healthCheckStableDurationInSeconds?: string;
  /** The timeout for the upgrade domain. */
  upgradeDomainTimeoutInSeconds?: string;
  /** The upgrade timeout. */
  upgradeTimeoutInSeconds?: string;
  /** The maximum allowed percentage of unhealthy applications during the upgrade. Allowed values are integer values from zero to 100. */
  maxPercentUnhealthyApplications?: number;
  /** The maximum allowed percentage of unhealthy nodes during the upgrade. Allowed values are integer values from zero to 100. */
  maxPercentUnhealthyNodes?: number;
  /** The maximum allowed percentage of delta health degradation during the upgrade. Allowed values are integer values from zero to 100. */
  maxPercentDeltaUnhealthyNodes?: number;
  /** The maximum allowed percentage of upgrade domain delta health degradation during the upgrade. Allowed values are integer values from zero to 100. */
  maxPercentUpgradeDomainDeltaUnhealthyNodes?: number;
  /** Defines the application health policy map used to evaluate the health of an application or one of its children entities. */
  applicationHealthPolicies?: ApplicationHealthPolicies;
}

/** Parameters for updating a cluster upgrade. */
export interface UpdateClusterUpgradeDescription {
  /** The type of upgrade out of the following possible values. */
  upgradeKind?: UpgradeType;
  /** Describes the parameters for updating a rolling upgrade of application or cluster. */
  updateDescription?: RollingUpgradeUpdateDescription;
  /** Defines a health policy used to evaluate the health of the cluster or of a cluster node. */
  clusterHealthPolicy?: ClusterHealthPolicy;
  /** When true, enables delta health evaluation rather than absolute health evaluation after completion of each upgrade domain. */
  enableDeltaHealthEvaluation?: boolean;
  /** Defines a health policy used to evaluate the health of the cluster during a cluster upgrade. */
  clusterUpgradeHealthPolicy?: ClusterUpgradeHealthPolicyObject;
  /** Defines the application health policy map used to evaluate the health of an application or one of its children entities. */
  applicationHealthPolicyMap?: ApplicationHealthPolicies;
}

/** Describes the parameters for updating a rolling upgrade of application or cluster. */
export interface RollingUpgradeUpdateDescription {
  /** The mode used to monitor health during a rolling upgrade. The values are UnmonitoredAuto, UnmonitoredManual, Monitored, and UnmonitoredDeferred. */
  rollingUpgradeMode: UpgradeMode;
  /** If true, then processes are forcefully restarted during upgrade even when the code version has not changed (the upgrade only changes configuration or data). */
  forceRestart?: boolean;
  /** The maximum amount of time to block processing of an upgrade domain and prevent loss of availability when there are unexpected issues. When this timeout expires, processing of the upgrade domain will proceed regardless of availability loss issues. The timeout is reset at the start of each upgrade domain. Valid values are between 0 and 42949672925 inclusive. (unsigned 32-bit integer). */
  replicaSetCheckTimeoutInMilliseconds?: number;
  /**
   * The compensating action to perform when a Monitored upgrade encounters monitoring policy or health policy violations.
   * Invalid indicates the failure action is invalid. Rollback specifies that the upgrade will start rolling back automatically.
   * Manual indicates that the upgrade will switch to UnmonitoredManual upgrade mode.
   */
  failureAction?: FailureAction;
  /** The amount of time to wait after completing an upgrade domain before applying health policies. It is first interpreted as a string representing an ISO 8601 duration. If that fails, then it is interpreted as a number representing the total number of milliseconds. */
  healthCheckWaitDurationInMilliseconds?: string;
  /** The amount of time that the application or cluster must remain healthy before the upgrade proceeds to the next upgrade domain. It is first interpreted as a string representing an ISO 8601 duration. If that fails, then it is interpreted as a number representing the total number of milliseconds. */
  healthCheckStableDurationInMilliseconds?: string;
  /** The amount of time to retry health evaluation when the application or cluster is unhealthy before FailureAction is executed. It is first interpreted as a string representing an ISO 8601 duration. If that fails, then it is interpreted as a number representing the total number of milliseconds. */
  healthCheckRetryTimeoutInMilliseconds?: string;
  /** The amount of time the overall upgrade has to complete before FailureAction is executed. It is first interpreted as a string representing an ISO 8601 duration. If that fails, then it is interpreted as a number representing the total number of milliseconds. */
  upgradeTimeoutInMilliseconds?: string;
  /** The amount of time each upgrade domain has to complete before FailureAction is executed. It is first interpreted as a string representing an ISO 8601 duration. If that fails, then it is interpreted as a number representing the total number of milliseconds. */
  upgradeDomainTimeoutInMilliseconds?: string;
  /**
   * Duration in seconds, to wait before a stateless instance is closed, to allow the active requests to drain gracefully. This would be effective when the instance is closing during the application/cluster
   * upgrade, only for those instances which have a non-zero delay duration configured in the service description. See InstanceCloseDelayDurationSeconds property in $ref: "#/definitions/StatelessServiceDescription.yaml" for details.
   * Note, the default value of InstanceCloseDelayDurationInSeconds is 4294967295, which indicates that the behavior will entirely depend on the delay configured in the stateless service description.
   */
  instanceCloseDelayDurationInSeconds?: number;
}

/** Azure Active Directory metadata object used for secured connection to cluster. */
export interface AadMetadataObject {
  /** The client authentication method. */
  type?: string;
  /** Azure Active Directory metadata used for secured connection to cluster. */
  metadata?: AadMetadata;
}

/** Azure Active Directory metadata used for secured connection to cluster. */
export interface AadMetadata {
  /** The AAD authority url. */
  authority?: string;
  /** The AAD client application Id. */
  client?: string;
  /** The AAD cluster application Id. */
  cluster?: string;
  /** The AAD login url. */
  login?: string;
  /** The client application redirect address. */
  redirect?: string;
  /** The AAD tenant Id. */
  tenant?: string;
}

/** The cluster version. */
export interface ClusterVersion {
  /** The Service Fabric cluster runtime version. */
  version?: string;
}

/** Information about load in a Service Fabric cluster. It holds a summary of all metrics and their load in a cluster. */
export interface ClusterLoadInfo {
  /** The starting time of last resource balancing run. */
  lastBalancingStartTimeUtc?: Date;
  /** The end time of last resource balancing run. */
  lastBalancingEndTimeUtc?: Date;
  /** List that contains metrics and their load information in this cluster. */
  loadMetricInformation?: LoadMetricInformation[];
}

/** Represents data structure that contains load information for a certain metric in a cluster. */
export interface LoadMetricInformation {
  /** Name of the metric for which this load information is provided. */
  name?: string;
  /** Value that indicates whether the metrics is balanced or not before resource balancer run */
  isBalancedBefore?: boolean;
  /** Value that indicates whether the metrics is balanced or not after resource balancer run. */
  isBalancedAfter?: boolean;
  /** The standard average deviation of the metrics before resource balancer run. */
  deviationBefore?: string;
  /** The standard average deviation of the metrics after resource balancer run. */
  deviationAfter?: string;
  /** The balancing threshold for a certain metric. */
  balancingThreshold?: string;
  /** The current action being taken with regard to this metric */
  action?: string;
  /** The Activity Threshold specified for this metric in the system Cluster Manifest. */
  activityThreshold?: string;
  /** The total cluster capacity for a given metric */
  clusterCapacity?: string;
  /** The total cluster load. In future releases of Service Fabric this parameter will be deprecated in favor of CurrentClusterLoad. */
  clusterLoad?: string;
  /** The total cluster load. */
  currentClusterLoad?: string;
  /** The remaining capacity for the metric in the cluster. In future releases of Service Fabric this parameter will be deprecated in favor of ClusterCapacityRemaining. */
  clusterRemainingCapacity?: string;
  /** The remaining capacity for the metric in the cluster. */
  clusterCapacityRemaining?: string;
  /** Indicates that the metric is currently over capacity in the cluster. */
  isClusterCapacityViolation?: boolean;
  /** The reserved percentage of total node capacity for this metric. */
  nodeBufferPercentage?: string;
  /** Remaining capacity in the cluster excluding the reserved space. In future releases of Service Fabric this parameter will be deprecated in favor of BufferedClusterCapacityRemaining. */
  clusterBufferedCapacity?: string;
  /** Remaining capacity in the cluster excluding the reserved space. */
  bufferedClusterCapacityRemaining?: string;
  /** The remaining percentage of cluster total capacity for this metric. */
  clusterRemainingBufferedCapacity?: string;
  /** The minimum load on any node for this metric. In future releases of Service Fabric this parameter will be deprecated in favor of MinimumNodeLoad. */
  minNodeLoadValue?: string;
  /** The minimum load on any node for this metric. */
  minimumNodeLoad?: string;
  /** The node id of the node with the minimum load for this metric. */
  minNodeLoadNodeId?: NodeId;
  /** The maximum load on any node for this metric. In future releases of Service Fabric this parameter will be deprecated in favor of MaximumNodeLoad. */
  maxNodeLoadValue?: string;
  /** The maximum load on any node for this metric. */
  maximumNodeLoad?: string;
  /** The node id of the node with the maximum load for this metric. */
  maxNodeLoadNodeId?: NodeId;
  /**
   * This value represents the load of the replicas that are planned to be removed in the future within the cluster.
   * This kind of load is reported for replicas that are currently being moving to other nodes and for replicas that are currently being dropped but still use the load on the source node.
   */
  plannedLoadRemoval?: string;
}

/** Specifies result of validating a cluster upgrade. */
export interface ValidateClusterUpgradeResult {
  /** The expected impact of the upgrade. */
  serviceHostUpgradeImpact?: ServiceHostUpgradeImpact;
  /** A string containing additional details for the Fabric upgrade validation result. */
  validationDetails?: string;
}

/** The list of nodes in the cluster. The list is paged when all of the results cannot fit in a single message. The next set of results can be obtained by executing the same query with the continuation token provided in this list. */
export interface PagedNodeInfoList {
  /** The continuation token parameter is used to obtain next set of results. The continuation token is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token is not included in the response. */
  continuationToken?: string;
  /** List of node information. */
  items?: NodeInfo[];
}

/** Information about a node in Service Fabric cluster. */
export interface NodeInfo {
  /** The name of a Service Fabric node. */
  name?: string;
  /** The IP address or fully qualified domain name of the node. */
  ipAddressOrFqdn?: string;
  /** The type of the node. */
  type?: string;
  /** The version of Service Fabric binaries that the node is running. */
  codeVersion?: string;
  /** The version of Service Fabric cluster manifest that the node is using. */
  configVersion?: string;
  /** The status of the node. */
  nodeStatus?: NodeStatus;
  /** Time in seconds since the node has been in NodeStatus Up. Value zero indicates that the node is not Up. */
  nodeUpTimeInSeconds?: string;
  /** The health state of a Service Fabric entity such as Cluster, Node, Application, Service, Partition, Replica etc. */
  healthState?: HealthState;
  /** Indicates if the node is a seed node or not. Returns true if the node is a seed node, otherwise false. A quorum of seed nodes are required for proper operation of Service Fabric cluster. */
  isSeedNode?: boolean;
  /** The upgrade domain of the node. */
  upgradeDomain?: string;
  /** The fault domain of the node. */
  faultDomain?: string;
  /** An internal ID used by Service Fabric to uniquely identify a node. Node Id is deterministically generated from node name. */
  id?: NodeId;
  /** The ID representing the node instance. While the ID of the node is deterministically generated from the node name and remains same across restarts, the InstanceId changes every time node restarts. */
  instanceId?: string;
  /** Information about the node deactivation. This information is valid for a node that is undergoing deactivation or has already been deactivated. */
  nodeDeactivationInfo?: NodeDeactivationInfo;
  /** Indicates if the node is stopped by calling stop node API or not. Returns true if the node is stopped, otherwise false. */
  isStopped?: boolean;
  /** Time in seconds since the node has been in NodeStatus Down. Value zero indicates node is not NodeStatus Down. */
  nodeDownTimeInSeconds?: string;
  /** Date time in UTC when the node came up. If the node has never been up then this value will be zero date time. */
  nodeUpAt?: Date;
  /** Date time in UTC when the node went down. If node has never been down then this value will be zero date time. */
  nodeDownAt?: Date;
  /** List that contains tags, which will be applied to the nodes. */
  nodeTags?: string[];
  /** Indicates if a node-by-node upgrade is currently being performed on this node. */
  isNodeByNodeUpgradeInProgress?: boolean;
  /** PlacementID used by the InfrastructureService. */
  infrastructurePlacementID?: string;
}

/** Information about the node deactivation. This information is valid for a node that is undergoing deactivation or has already been deactivated. */
export interface NodeDeactivationInfo {
  /** The intent or the reason for deactivating the node. Following are the possible values for it. */
  nodeDeactivationIntent?: NodeDeactivationIntent;
  /** The status of node deactivation operation. Following are the possible values. */
  nodeDeactivationStatus?: NodeDeactivationStatus;
  /** List of tasks representing the deactivation operation on the node. */
  nodeDeactivationTask?: NodeDeactivationTask[];
  /** List of pending safety checks */
  pendingSafetyChecks?: SafetyCheckWrapper[];
}

/** The task representing the deactivation operation on the node. */
export interface NodeDeactivationTask {
  /** Identity of the task related to deactivation operation on the node. */
  nodeDeactivationTaskId?: NodeDeactivationTaskId;
  /** The intent or the reason for deactivating the node. Following are the possible values for it. */
  nodeDeactivationIntent?: NodeDeactivationIntent;
}

/** Identity of the task related to deactivation operation on the node. */
export interface NodeDeactivationTaskId {
  /** Value of the task id. */
  id?: string;
  /** The type of the task that performed the node deactivation. Following are the possible values. */
  nodeDeactivationTaskType?: NodeDeactivationTaskType;
}

/** Information about load on a Service Fabric node. It holds a summary of all metrics and their load on a node. */
export interface NodeLoadInfo {
  /** Name of the node for which the load information is provided by this object. */
  nodeName?: string;
  /** List that contains metrics and their load information on this node. */
  nodeLoadMetricInformation?: NodeLoadMetricInformation[];
}

/** Represents data structure that contains load information for a certain metric on a node. */
export interface NodeLoadMetricInformation {
  /** Name of the metric for which this load information is provided. */
  name?: string;
  /** Total capacity on the node for this metric. */
  nodeCapacity?: string;
  /** Current load on the node for this metric. In future releases of Service Fabric this parameter will be deprecated in favor of CurrentNodeLoad. */
  nodeLoad?: string;
  /** The remaining capacity on the node for this metric. In future releases of Service Fabric this parameter will be deprecated in favor of NodeCapacityRemaining. */
  nodeRemainingCapacity?: string;
  /** Indicates if there is a capacity violation for this metric on the node. */
  isCapacityViolation?: boolean;
  /** The value that indicates the reserved capacity for this metric on the node. */
  nodeBufferedCapacity?: string;
  /** The remaining reserved capacity for this metric on the node. In future releases of Service Fabric this parameter will be deprecated in favor of BufferedNodeCapacityRemaining. */
  nodeRemainingBufferedCapacity?: string;
  /** Current load on the node for this metric. */
  currentNodeLoad?: string;
  /** The remaining capacity on the node for the metric. */
  nodeCapacityRemaining?: string;
  /** The remaining capacity which is not reserved by NodeBufferPercentage for this metric on the node. */
  bufferedNodeCapacityRemaining?: string;
  /**
   * This value represents the load of the replicas that are planned to be removed in the future.
   * This kind of load is reported for replicas that are currently being moving to other nodes and for replicas that are currently being dropped but still use the load on the source node.
   */
  plannedNodeLoadRemoval?: string;
}

/** Describes the intent or reason for deactivating the node. */
export interface DeactivationIntentDescription {
  /** Describes the intent or reason for deactivating the node. The possible values are following. */
  deactivationIntent?: DeactivationIntent;
}

/** Describes the parameters to restart a Service Fabric node. */
export interface RestartNodeDescription {
  /** The instance ID of the target node. If instance ID is specified the node is restarted only if it matches with the current instance of the node. A default value of "0" would match any instance ID. The instance ID can be obtained using get node query. */
  nodeInstanceId: string;
  /** Specify True to create a dump of the fabric node process. This is case-sensitive. */
  createFabricDump?: CreateFabricDump;
}

/** Information about a configuration parameter override. */
export interface ConfigParameterOverride {
  /** Name of the section for the parameter override. */
  sectionName: string;
  /** Name of the parameter that has been overridden. */
  parameterName: string;
  /** Value of the overridden parameter. */
  parameterValue: string;
  /** The duration until config override is considered as valid. */
  timeout?: string;
  /** A value that indicates whether config override will be removed on upgrade or will still be considered as valid. */
  persistAcrossUpgrade?: boolean;
}

/** The list of application types that are provisioned or being provisioned in the cluster. The list is paged when all of the results cannot fit in a single message. The next set of results can be obtained by executing the same query with the continuation token provided in this list. */
export interface PagedApplicationTypeInfoList {
  /** The continuation token parameter is used to obtain next set of results. The continuation token is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token is not included in the response. */
  continuationToken?: string;
  /** List of application type information. */
  items?: ApplicationTypeInfo[];
}

/** Information about an application type. */
export interface ApplicationTypeInfo {
  /** The application type name as defined in the application manifest. */
  name?: string;
  /** The version of the application type as defined in the application manifest. */
  version?: string;
  /** List of application type parameters that can be overridden when creating or updating the application. */
  defaultParameterList?: ApplicationParameter[];
  /** The status of the application type. */
  status?: ApplicationTypeStatus;
  /** Additional detailed information about the status of the application type. */
  statusDetails?: string;
  /** The mechanism used to define a Service Fabric application type. */
  applicationTypeDefinitionKind?: ApplicationTypeDefinitionKind;
}

/** Describes an application parameter override to be applied when creating or upgrading an application. */
export interface ApplicationParameter {
  /** The name of the parameter. */
  key: string;
  /** The value of the parameter. */
  value: string;
}

/** Represents the type of registration or provision requested, and if the operation needs to be asynchronous or not. Supported types of provision operations are from either image store or external store. */
export interface ProvisionApplicationTypeDescriptionBase {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ImageStorePath" | "ExternalStore";
  /** Indicates whether or not provisioning should occur asynchronously. When set to true, the provision operation returns when the request is accepted by the system, and the provision operation continues without any timeout limit. The default value is false. For large application packages, we recommend setting the value to true. */
  async: boolean;
}

/** Describes the operation to unregister or unprovision an application type and its version that was registered with the Service Fabric. */
export interface UnprovisionApplicationTypeDescriptionInfo {
  /** The version of the application type as defined in the application manifest. */
  applicationTypeVersion: string;
  /** The flag indicating whether or not unprovision should occur asynchronously. When set to true, the unprovision operation returns when the request is accepted by the system, and the unprovision operation continues without any timeout limit. The default value is false. However, we recommend setting it to true for large application packages that were provisioned. */
  async?: boolean;
}

/** Information about a service type that is defined in a service manifest of a provisioned application type. */
export interface ServiceTypeInfo {
  /** Describes a service type defined in the service manifest of a provisioned application type. The properties the ones defined in the service manifest. */
  serviceTypeDescription?: ServiceTypeDescriptionUnion;
  /** The name of the service manifest in which this service type is defined. */
  serviceManifestName?: string;
  /** The version of the service manifest in which this service type is defined. */
  serviceManifestVersion?: string;
  /** Indicates whether the service is a service group. If it is, the property value is true otherwise false. */
  isServiceGroup?: boolean;
}

/** Describes a service type defined in the service manifest of a provisioned application type. The properties the ones defined in the service manifest. */
export interface ServiceTypeDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Stateful" | "Stateless";
  /** Indicates whether the service type is a stateful service type or a stateless service type. This property is true if the service type is a stateful service type, false otherwise. */
  isStateful?: boolean;
  /** Name of the service type as specified in the service manifest. */
  serviceTypeName?: string;
  /** The placement constraint to be used when instantiating this service in a Service Fabric cluster. */
  placementConstraints?: string;
  /** The service load metrics is given as an array of ServiceLoadMetricDescription objects. */
  loadMetrics?: ServiceLoadMetricDescription[];
  /** List of service placement policy descriptions. */
  servicePlacementPolicies?: ServicePlacementPolicyDescriptionUnion[];
  /** List of service type extensions. */
  extensions?: ServiceTypeExtensionDescription[];
}

/** Specifies a metric to load balance a service during runtime. */
export interface ServiceLoadMetricDescription {
  /** The name of the metric. If the service chooses to report load during runtime, the load metric name should match the name that is specified in Name exactly. Note that metric names are case-sensitive. */
  name: string;
  /** The service load metric relative weight, compared to other metrics configured for this service, as a number. */
  weight?: ServiceLoadMetricWeight;
  /** Used only for Stateful services. The default amount of load, as a number, that this service creates for this metric when it is a Primary replica. */
  primaryDefaultLoad?: number;
  /** Used only for Stateful services. The default amount of load, as a number, that this service creates for this metric when it is a Secondary replica. */
  secondaryDefaultLoad?: number;
  /** Used only for Stateful services. The default amount of load, as a number, that this service creates for this metric when it is an Auxiliary replica. */
  auxiliaryDefaultLoad?: number;
  /** Used only for Stateless services. The default amount of load, as a number, that this service creates for this metric. */
  defaultLoad?: number;
}

/** Describes the policy to be used for placement of a Service Fabric service. */
export interface ServicePlacementPolicyDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  type:
    | "InvalidDomain"
    | "NonPartiallyPlaceService"
    | "AllowMultipleStatelessInstancesOnNode"
    | "PreferPrimaryDomain"
    | "RequireDomain"
    | "RequireDomainDistribution";
}

/** Describes extension of a service type defined in the service manifest. */
export interface ServiceTypeExtensionDescription {
  /** The name of the extension. */
  key?: string;
  /** The extension value. */
  value?: string;
}

/** Contains the manifest describing a service type registered as part of an application in a Service Fabric cluster. */
export interface ServiceTypeManifest {
  /** The XML manifest as a string. */
  manifest?: string;
}

/** Information about service type deployed on a node, information such as the status of the service type registration on a node. */
export interface DeployedServiceTypeInfo {
  /** Name of the service type as specified in the service manifest. */
  serviceTypeName?: string;
  /** The name of the service manifest in which this service type is defined. */
  serviceManifestName?: string;
  /** The name of the code package that registered the service type. */
  codePackageName?: string;
  /** The status of the service type registration on the node. */
  status?: ServiceTypeRegistrationStatus;
  /**
   * The ActivationId of a deployed service package. If ServicePackageActivationMode specified at the time of creating the service
   * is 'SharedProcess' (or if it is not specified, in which case it defaults to 'SharedProcess'), then value of ServicePackageActivationId
   * is always an empty string.
   */
  servicePackageActivationId?: string;
}

/** Describes a Service Fabric application. */
export interface ApplicationDescription {
  /** The name of the application, including the 'fabric:' URI scheme. */
  name: string;
  /** The application type name as defined in the application manifest. */
  typeName: string;
  /** The version of the application type as defined in the application manifest. */
  typeVersion: string;
  /** List of application parameters with overridden values from their default values specified in the application manifest. */
  parameterList?: ApplicationParameter[];
  /**
   * Describes capacity information for services of this application. This description can be used for describing the following.
   * - Reserving the capacity for the services on the nodes
   * - Limiting the total number of nodes that services of this application can run on
   * - Limiting the custom capacity metrics to limit the total consumption of this metric by the services of this application
   */
  applicationCapacity?: ApplicationCapacityDescription;
  /** Managed application identity description. */
  managedApplicationIdentity?: ManagedApplicationIdentityDescription;
}

/**
 * Describes capacity information for services of this application. This description can be used for describing the following.
 * - Reserving the capacity for the services on the nodes
 * - Limiting the total number of nodes that services of this application can run on
 * - Limiting the custom capacity metrics to limit the total consumption of this metric by the services of this application
 */
export interface ApplicationCapacityDescription {
  /** The minimum number of nodes where Service Fabric will reserve capacity for this application. Note that this does not mean that the services of this application will be placed on all of those nodes. If this property is set to zero, no capacity will be reserved. The value of this property cannot be more than the value of the MaximumNodes property. */
  minimumNodes?: number;
  /** The maximum number of nodes where Service Fabric will reserve capacity for this application. Note that this does not mean that the services of this application will be placed on all of those nodes. By default, the value of this property is zero and it means that the services can be placed on any node. */
  maximumNodes?: number;
  /** List of application capacity metric description. */
  applicationMetrics?: ApplicationMetricDescription[];
}

/** Describes capacity information for a custom resource balancing metric. This can be used to limit the total consumption of this metric by the services of this application. */
export interface ApplicationMetricDescription {
  /** The name of the metric. */
  name?: string;
  /**
   * The maximum node capacity for Service Fabric application.
   * This is the maximum Load for an instance of this application on a single node. Even if the capacity of node is greater than this value, Service Fabric will limit the total load of services within the application on each node to this value.
   * If set to zero, capacity for this metric is unlimited on each node.
   * When creating a new application with application capacity defined, the product of MaximumNodes and this value must always be smaller than or equal to TotalApplicationCapacity.
   * When updating existing application with application capacity, the product of MaximumNodes and this value must always be smaller than or equal to TotalApplicationCapacity.
   */
  maximumCapacity?: number;
  /**
   * The node reservation capacity for Service Fabric application.
   * This is the amount of load which is reserved on nodes which have instances of this application.
   * If MinimumNodes is specified, then the product of these values will be the capacity reserved in the cluster for the application.
   * If set to zero, no capacity is reserved for this metric.
   * When setting application capacity or when updating application capacity; this value must be smaller than or equal to MaximumCapacity for each metric.
   */
  reservationCapacity?: number;
  /**
   * The total metric capacity for Service Fabric application.
   * This is the total metric capacity for this application in the cluster. Service Fabric will try to limit the sum of loads of services within the application to this value.
   * When creating a new application with application capacity defined, the product of MaximumNodes and MaximumCapacity must always be smaller than or equal to this value.
   */
  totalApplicationCapacity?: number;
}

/** Managed application identity description. */
export interface ManagedApplicationIdentityDescription {
  /** Token service endpoint. */
  tokenServiceEndpoint?: string;
  /** A list of managed application identity objects. */
  managedIdentities?: ManagedApplicationIdentity[];
}

/** Describes a managed application identity. */
export interface ManagedApplicationIdentity {
  /** The name of the identity. */
  name: string;
  /** The identity's PrincipalId. */
  principalId?: string;
}

/** Load Information about a Service Fabric application. */
export interface ApplicationLoadInfo {
  /**
   * The identity of the application. This is an encoded representation of the application name. This is used in the REST APIs to identify the application resource.
   * Starting in version 6.0, hierarchical names are delimited with the "\~" character. For example, if the application name is "fabric:/myapp/app1",
   * the application identity would be "myapp\~app1" in 6.0+ and "myapp/app1" in previous versions.
   */
  id?: string;
  /**
   * The minimum number of nodes for this application.
   * It is the number of nodes where Service Fabric will reserve Capacity in the cluster which equals to ReservedLoad * MinimumNodes for this Application instance.
   * For applications that do not have application capacity defined this value will be zero.
   */
  minimumNodes?: number;
  /**
   * The maximum number of nodes where this application can be instantiated.
   * It is the number of nodes this application is allowed to span.
   * For applications that do not have application capacity defined this value will be zero.
   */
  maximumNodes?: number;
  /**
   * The number of nodes on which this application is instantiated.
   * For applications that do not have application capacity defined this value will be zero.
   */
  nodeCount?: number;
  /** List of application load metric information. */
  applicationLoadMetricInformation?: ApplicationLoadMetricInformation[];
}

/** Describes load information for a custom resource balancing metric. This can be used to limit the total consumption of this metric by the services of this application. */
export interface ApplicationLoadMetricInformation {
  /** The name of the metric. */
  name?: string;
  /**
   * This is the capacity reserved in the cluster for the application.
   * It's the product of NodeReservationCapacity and MinimumNodes.
   * If set to zero, no capacity is reserved for this metric.
   * When setting application capacity or when updating application capacity this value must be smaller than or equal to MaximumCapacity for each metric.
   */
  reservationCapacity?: number;
  /** Total capacity for this metric in this application instance. */
  applicationCapacity?: number;
  /** Current load for this metric in this application instance. */
  applicationLoad?: number;
}

/** The list of applications in the cluster. The list is paged when all of the results cannot fit in a single message. The next set of results can be obtained by executing the same query with the continuation token provided in this list. */
export interface PagedApplicationInfoList {
  /** The continuation token parameter is used to obtain next set of results. The continuation token is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token is not included in the response. */
  continuationToken?: string;
  /** List of application information. */
  items?: ApplicationInfo[];
}

/** Information about a Service Fabric application. */
export interface ApplicationInfo {
  /**
   * The identity of the application. This is an encoded representation of the application name. This is used in the REST APIs to identify the application resource.
   * Starting in version 6.0, hierarchical names are delimited with the "\~" character. For example, if the application name is "fabric:/myapp/app1",
   * the application identity would be "myapp\~app1" in 6.0+ and "myapp/app1" in previous versions.
   */
  id?: string;
  /** The name of the application, including the 'fabric:' URI scheme. */
  name?: string;
  /** The application type name as defined in the application manifest. */
  typeName?: string;
  /** The version of the application type as defined in the application manifest. */
  typeVersion?: string;
  /** The status of the application. */
  status?: ApplicationStatus;
  /** List of application parameters with overridden values from their default values specified in the application manifest. */
  parameters?: ApplicationParameter[];
  /** The health state of a Service Fabric entity such as Cluster, Node, Application, Service, Partition, Replica etc. */
  healthState?: HealthState;
  /** The mechanism used to define a Service Fabric application. */
  applicationDefinitionKind?: ApplicationDefinitionKind;
  /** Managed application identity description. */
  managedApplicationIdentity?: ManagedApplicationIdentityDescription;
}

/** Describes the parameters for an application upgrade. Note that upgrade description replaces the existing application description. This means that if the parameters are not specified, the existing parameters on the applications will be overwritten with the empty parameters list. This would result in the application using the default value of the parameters from the application manifest. If you do not want to change any existing parameter values, please get the application parameters first using the GetApplicationInfo query and then supply those values as Parameters in this ApplicationUpgradeDescription. */
export interface ApplicationUpgradeDescription {
  /** The name of the target application, including the 'fabric:' URI scheme. */
  name: string;
  /** The target application type version (found in the application manifest) for the application upgrade. */
  targetApplicationTypeVersion: string;
  /** List of application parameters with overridden values from their default values specified in the application manifest. */
  parameters?: ApplicationParameter[];
  /** The kind of upgrade out of the following possible values. */
  upgradeKind: UpgradeKind;
  /** The mode used to monitor health during a rolling upgrade. The values are UnmonitoredAuto, UnmonitoredManual, Monitored, and UnmonitoredDeferred. */
  rollingUpgradeMode?: UpgradeMode;
  /** The maximum amount of time to block processing of an upgrade domain and prevent loss of availability when there are unexpected issues. When this timeout expires, processing of the upgrade domain will proceed regardless of availability loss issues. The timeout is reset at the start of each upgrade domain. Valid values are between 0 and 42949672925 inclusive. (unsigned 32-bit integer). */
  upgradeReplicaSetCheckTimeoutInSeconds?: number;
  /** If true, then processes are forcefully restarted during upgrade even when the code version has not changed (the upgrade only changes configuration or data). */
  forceRestart?: boolean;
  /** Defines the order in which an upgrade proceeds through the cluster. */
  sortOrder?: UpgradeSortOrder;
  /** Describes the parameters for monitoring an upgrade in Monitored mode. */
  monitoringPolicy?: MonitoringPolicyDescription;
  /** Defines a health policy used to evaluate the health of an application or one of its children entities. */
  applicationHealthPolicy?: ApplicationHealthPolicy;
  /**
   * Duration in seconds, to wait before a stateless instance is closed, to allow the active requests to drain gracefully. This would be effective when the instance is closing during the application/cluster
   * upgrade, only for those instances which have a non-zero delay duration configured in the service description. See InstanceCloseDelayDurationSeconds property in $ref: "#/definitions/StatelessServiceDescription.yaml" for details.
   * Note, the default value of InstanceCloseDelayDurationInSeconds is 4294967295, which indicates that the behavior will entirely depend on the delay configured in the stateless service description.
   */
  instanceCloseDelayDurationInSeconds?: number;
  /** Managed application identity description. */
  managedApplicationIdentity?: ManagedApplicationIdentityDescription;
}

/** Describes the parameters for an application upgrade. */
export interface ApplicationUpgradeProgressInfo {
  /** The name of the target application, including the 'fabric:' URI scheme. */
  name?: string;
  /** The application type name as defined in the application manifest. */
  typeName?: string;
  /** The target application type version (found in the application manifest) for the application upgrade. */
  targetApplicationTypeVersion?: string;
  /** List of upgrade domains and their statuses. Not applicable to node-by-node upgrades. */
  upgradeDomains?: UpgradeDomainInfo[];
  /** List of upgrade units and their statuses. */
  upgradeUnits?: UpgradeUnitInfo[];
  /** The state of the upgrade domain. */
  upgradeState?: UpgradeState;
  /** The name of the next upgrade domain to be processed. Not applicable to node-by-node upgrades. */
  nextUpgradeDomain?: string;
  /** The mode used to monitor health during a rolling upgrade. The values are UnmonitoredAuto, UnmonitoredManual, Monitored, and UnmonitoredDeferred. */
  rollingUpgradeMode?: UpgradeMode;
  /** Describes the parameters for an application upgrade. Note that upgrade description replaces the existing application description. This means that if the parameters are not specified, the existing parameters on the applications will be overwritten with the empty parameters list. This would result in the application using the default value of the parameters from the application manifest. If you do not want to change any existing parameter values, please get the application parameters first using the GetApplicationInfo query and then supply those values as Parameters in this ApplicationUpgradeDescription. */
  upgradeDescription?: ApplicationUpgradeDescription;
  /** The estimated total amount of time spent processing the overall upgrade. */
  upgradeDurationInMilliseconds?: string;
  /** The estimated total amount of time spent processing the current upgrade domain. */
  upgradeDomainDurationInMilliseconds?: string;
  /** List of health evaluations that resulted in the current aggregated health state. */
  unhealthyEvaluations?: HealthEvaluationWrapper[];
  /** Information about the current in-progress upgrade domain. Not applicable to node-by-node upgrades. */
  currentUpgradeDomainProgress?: CurrentUpgradeDomainProgressInfo;
  /** Information about the current in-progress upgrade units. */
  currentUpgradeUnitsProgress?: CurrentUpgradeUnitsProgressInfo;
  /** The estimated UTC datetime when the upgrade started. */
  startTimestampUtc?: string;
  /** The estimated UTC datetime when the upgrade failed and FailureAction was executed. */
  failureTimestampUtc?: string;
  /** The cause of an upgrade failure that resulted in FailureAction being executed. */
  failureReason?: FailureReason;
  /** Information about the upgrade domain progress at the time of upgrade failure. */
  upgradeDomainProgressAtFailure?: FailureUpgradeDomainProgressInfo;
  /** Additional detailed information about the status of the pending upgrade. */
  upgradeStatusDetails?: string;
  /** Indicates whether this upgrade is node-by-node. */
  isNodeByNode?: boolean;
}

/** Information about the upgrade domain progress at the time of upgrade failure. */
export interface FailureUpgradeDomainProgressInfo {
  /** The name of the upgrade domain */
  domainName?: string;
  /** List of upgrading nodes and their statuses */
  nodeUpgradeProgressList?: NodeUpgradeProgressInfo[];
}

/** Describes the parameters for updating an ongoing application upgrade. */
export interface ApplicationUpgradeUpdateDescription {
  /** The name of the application, including the 'fabric:' URI scheme. */
  name: string;
  /** The kind of upgrade out of the following possible values. */
  upgradeKind: UpgradeKind;
  /** Defines a health policy used to evaluate the health of an application or one of its children entities. */
  applicationHealthPolicy?: ApplicationHealthPolicy;
  /** Describes the parameters for updating a rolling upgrade of application or cluster. */
  updateDescription?: RollingUpgradeUpdateDescription;
}

/** Describes the parameters for updating an application instance. */
export interface ApplicationUpdateDescription {
  /**
   * Flags indicating whether other properties are set. Each of the associated properties corresponds to a flag, specified below, which, if set, indicate that the property is specified.
   * If flags are not specified for a certain property, the property will not be updated even if the new value is provided.
   * This property can be a combination of those flags obtained using bitwise 'OR' operator. Exception is RemoveApplicationCapacity which cannot be specified along with other parameters.
   * For example, if the provided value is 3 then the flags for MinimumNodes (1) and MaximumNodes (2) are set.
   *
   * - None - Does not indicate any other properties are set. The value is 0.
   * - MinimumNodes - Indicates whether the MinimumNodes property is set. The value is 1.
   * - MaximumNodes - Indicates whether the MinimumNodes property is set. The value is  2.
   * - ApplicationMetrics - Indicates whether the ApplicationMetrics property is set. The value is 4.
   */
  flags?: string;
  /**
   * Used to clear all parameters related to Application Capacity for this application. |
   * It is not possible to specify this parameter together with other Application Capacity parameters.
   */
  removeApplicationCapacity?: boolean;
  /** The minimum number of nodes where Service Fabric will reserve capacity for this application. Note that this does not mean that the services of this application will be placed on all of those nodes. If this property is set to zero, no capacity will be reserved. The value of this property cannot be more than the value of the MaximumNodes property. */
  minimumNodes?: number;
  /** The maximum number of nodes where Service Fabric will reserve capacity for this application. Note that this does not mean that the services of this application will be placed on all of those nodes. By default, the value of this property is zero and it means that the services can be placed on any node. */
  maximumNodes?: number;
  /** List of application capacity metric description. */
  applicationMetrics?: ApplicationMetricDescription[];
}

/** Describes the parameters for resuming an unmonitored manual Service Fabric application upgrade */
export interface ResumeApplicationUpgradeDescription {
  /** The name of the upgrade domain in which to resume the upgrade. */
  upgradeDomainName: string;
}

/**
 * The list of deployed applications in activating, downloading, or active states on a node.
 * The list is paged when all of the results cannot fit in a single message.
 * The next set of results can be obtained by executing the same query with the continuation token provided in this list.
 */
export interface PagedDeployedApplicationInfoList {
  /** The continuation token parameter is used to obtain next set of results. The continuation token is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token is not included in the response. */
  continuationToken?: string;
  /** List of deployed application information. */
  items?: DeployedApplicationInfo[];
}

/** Information about application deployed on the node. */
export interface DeployedApplicationInfo {
  /**
   * The identity of the application. This is an encoded representation of the application name. This is used in the REST APIs to identify the application resource.
   * Starting in version 6.0, hierarchical names are delimited with the "\~" character. For example, if the application name is "fabric:/myapp/app1",
   * the application identity would be "myapp\~app1" in 6.0+ and "myapp/app1" in previous versions.
   */
  id?: string;
  /** The name of the application, including the 'fabric:' URI scheme. */
  name?: string;
  /** The application type name as defined in the application manifest. */
  typeName?: string;
  /** The version of the application type as defined in the application manifest. */
  typeVersion?: string;
  /** The status of the application deployed on the node. Following are the possible values. */
  status?: DeployedApplicationStatus;
  /** The work directory of the application on the node. The work directory can be used to store application data. */
  workDirectory?: string;
  /** The log directory of the application on the node. The log directory can be used to store application logs. */
  logDirectory?: string;
  /** The temp directory of the application on the node. The code packages belonging to the application are forked with this directory set as their temporary directory. */
  tempDirectory?: string;
  /** The health state of a Service Fabric entity such as Cluster, Node, Application, Service, Partition, Replica etc. */
  healthState?: HealthState;
}

/** Contains the manifest describing an application type registered in a Service Fabric cluster. */
export interface ApplicationTypeManifest {
  /** The XML manifest as a string. */
  manifest?: string;
}

/** The list of services in the cluster for an application. The list is paged when all of the results cannot fit in a single message. The next set of results can be obtained by executing the same query with the continuation token provided in this list. */
export interface PagedServiceInfoList {
  /** The continuation token parameter is used to obtain next set of results. The continuation token is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token is not included in the response. */
  continuationToken?: string;
  /** List of service information. */
  items?: ServiceInfoUnion[];
}

/** Information about a Service Fabric service. */
export interface ServiceInfo {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  serviceKind: "Stateful" | "Stateless";
  /**
   * The identity of the service. This ID is an encoded representation of the service name. This is used in the REST APIs to identify the service resource.
   * Starting in version 6.0, hierarchical names are delimited with the "\~" character. For example, if the service name is "fabric:/myapp/app1/svc1",
   * the service identity would be "myapp~app1\~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   */
  id?: string;
  /** The full name of the service with 'fabric:' URI scheme. */
  name?: string;
  /** Name of the service type as specified in the service manifest. */
  typeName?: string;
  /** The version of the service manifest. */
  manifestVersion?: string;
  /** The health state of a Service Fabric entity such as Cluster, Node, Application, Service, Partition, Replica etc. */
  healthState?: HealthState;
  /** The status of the application. */
  serviceStatus?: ServiceStatus;
  /** Whether the service is in a service group. */
  isServiceGroup?: boolean;
}

/** Information about the application name. */
export interface ApplicationNameInfo {
  /**
   * The identity of the application. This is an encoded representation of the application name. This is used in the REST APIs to identify the application resource.
   * Starting in version 6.0, hierarchical names are delimited with the "\~" character. For example, if the application name is "fabric:/myapp/app1",
   * the application identity would be "myapp\~app1" in 6.0+ and "myapp/app1" in previous versions.
   */
  id?: string;
  /** The name of the application, including the 'fabric:' URI scheme. */
  name?: string;
}

/** A ServiceDescription contains all of the information necessary to create a service. */
export interface ServiceDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  serviceKind: "Stateful" | "Stateless";
  /** The name of the application, including the 'fabric:' URI scheme. */
  applicationName?: string;
  /** The full name of the service with 'fabric:' URI scheme. */
  serviceName: string;
  /** Name of the service type as specified in the service manifest. */
  serviceTypeName: string;
  /** The initialization data as an array of bytes. Initialization data is passed to service instances or replicas when they are created. */
  initializationData?: number[];
  /** The partition description as an object. */
  partitionDescription: PartitionSchemeDescriptionUnion;
  /** The placement constraints as a string. Placement constraints are boolean expressions on node properties and allow for restricting a service to particular nodes based on the service requirements. For example, to place a service on nodes where NodeType is blue specify the following: "NodeColor == blue)". */
  placementConstraints?: string;
  /** The correlation scheme. */
  correlationScheme?: ServiceCorrelationDescription[];
  /** The service load metrics. */
  serviceLoadMetrics?: ServiceLoadMetricDescription[];
  /** The service placement policies. */
  servicePlacementPolicies?: ServicePlacementPolicyDescriptionUnion[];
  /** The move cost for the service. */
  defaultMoveCost?: MoveCost;
  /** Indicates if the DefaultMoveCost property is specified. */
  isDefaultMoveCostSpecified?: boolean;
  /** The activation mode of service package to be used for a service. */
  servicePackageActivationMode?: ServicePackageActivationMode;
  /** The DNS name of the service. It requires the DNS system service to be enabled in Service Fabric cluster. */
  serviceDnsName?: string;
  /** Scaling policies for this service. */
  scalingPolicies?: ScalingPolicyDescription[];
  /** Tags for placement of this service. */
  tagsRequiredToPlace?: NodeTagsDescription;
  /** Tags for running of this service. */
  tagsRequiredToRun?: NodeTagsDescription;
}

/** Describes how the service is partitioned. */
export interface PartitionSchemeDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  partitionScheme: "Named" | "Singleton" | "UniformInt64Range";
}

/** Creates a particular correlation between services. */
export interface ServiceCorrelationDescription {
  /** The ServiceCorrelationScheme which describes the relationship between this service and the service specified via ServiceName. */
  scheme: ServiceCorrelationScheme;
  /** The name of the service that the correlation relationship is established with. */
  serviceName: string;
}

/** Describes how the scaling should be performed */
export interface ScalingPolicyDescription {
  /** Specifies the trigger associated with this scaling policy */
  scalingTrigger: ScalingTriggerDescriptionUnion;
  /** Specifies the mechanism associated with this scaling policy */
  scalingMechanism: ScalingMechanismDescriptionUnion;
}

/** Describes the trigger for performing a scaling operation. */
export interface ScalingTriggerDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "AveragePartitionLoad" | "AverageServiceLoad";
}

/** Describes the mechanism for performing a scaling operation. */
export interface ScalingMechanismDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "PartitionInstanceCount" | "AddRemoveIncrementalNamedPartition";
}

/** Describes the tags required for placement or running of the service. */
export interface NodeTagsDescription {
  /** The number of tags. */
  count: number;
  /** Array of size specified by the ‘Count’ parameter, for the placement tags of the service. */
  tags: string[];
}

/** Defines description for creating a Service Fabric service from a template defined in the application manifest. */
export interface ServiceFromTemplateDescription {
  /** The name of the application, including the 'fabric:' URI scheme. */
  applicationName: string;
  /** The full name of the service with 'fabric:' URI scheme. */
  serviceName: string;
  /** Name of the service type as specified in the service manifest. */
  serviceTypeName: string;
  /** The initialization data for the newly created service instance. */
  initializationData?: number[];
  /** The activation mode of service package to be used for a service. */
  servicePackageActivationMode?: ServicePackageActivationMode;
  /** The DNS name of the service. It requires the DNS system service to be enabled in Service Fabric cluster. */
  serviceDnsName?: string;
}

/** A ServiceUpdateDescription contains all of the information necessary to update a service. */
export interface ServiceUpdateDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  serviceKind: "Stateful" | "Stateless";
  /**
   * Flags indicating whether other properties are set. Each of the associated properties corresponds to a flag, specified below, which, if set, indicate that the property is specified.
   * This property can be a combination of those flags obtained using bitwise 'OR' operator.
   * For example, if the provided value is 6 then the flags for ReplicaRestartWaitDuration (2) and QuorumLossWaitDuration (4) are set.
   *
   * - None - Does not indicate any other properties are set. The value is zero.
   * - TargetReplicaSetSize/InstanceCount - Indicates whether the TargetReplicaSetSize property (for Stateful services) or the InstanceCount property (for Stateless services) is set. The value is 1.
   * - ReplicaRestartWaitDuration - Indicates the ReplicaRestartWaitDuration property is set. The value is  2.
   * - QuorumLossWaitDuration - Indicates the QuorumLossWaitDuration property is set. The value is 4.
   * - StandByReplicaKeepDuration - Indicates the StandByReplicaKeepDuration property is set. The value is 8.
   * - MinReplicaSetSize - Indicates the MinReplicaSetSize property is set. The value is 16.
   * - PlacementConstraints - Indicates the PlacementConstraints property is set. The value is 32.
   * - PlacementPolicyList - Indicates the ServicePlacementPolicies property is set. The value is 64.
   * - Correlation - Indicates the CorrelationScheme property is set. The value is 128.
   * - Metrics - Indicates the ServiceLoadMetrics property is set. The value is 256.
   * - DefaultMoveCost - Indicates the DefaultMoveCost property is set. The value is 512.
   * - ScalingPolicy - Indicates the ScalingPolicies property is set. The value is 1024.
   * - ServicePlacementTimeLimit - Indicates the ServicePlacementTimeLimit property is set. The value is 2048.
   * - MinInstanceCount - Indicates the MinInstanceCount property is set. The value is 4096.
   * - MinInstancePercentage - Indicates the MinInstancePercentage property is set. The value is 8192.
   * - InstanceCloseDelayDuration - Indicates the InstanceCloseDelayDuration property is set. The value is 16384.
   * - InstanceRestartWaitDuration - Indicates the InstanceCloseDelayDuration property is set. The value is 32768.
   * - DropSourceReplicaOnMove - Indicates the DropSourceReplicaOnMove property is set. The value is 65536.
   * - ServiceDnsName - Indicates the ServiceDnsName property is set. The value is 131072.
   * - TagsForPlacement - Indicates the TagsForPlacement property is set. The value is 1048576.
   * - TagsForRunning - Indicates the TagsForRunning property is set. The value is 2097152.
   */
  flags?: string;
  /** The placement constraints as a string. Placement constraints are boolean expressions on node properties and allow for restricting a service to particular nodes based on the service requirements. For example, to place a service on nodes where NodeType is blue specify the following: "NodeColor == blue)". */
  placementConstraints?: string;
  /** The correlation scheme. */
  correlationScheme?: ServiceCorrelationDescription[];
  /** The service load metrics. */
  loadMetrics?: ServiceLoadMetricDescription[];
  /** The service placement policies. */
  servicePlacementPolicies?: ServicePlacementPolicyDescriptionUnion[];
  /** The move cost for the service. */
  defaultMoveCost?: MoveCost;
  /** Scaling policies for this service. */
  scalingPolicies?: ScalingPolicyDescription[];
  /** The DNS name of the service. */
  serviceDnsName?: string;
  /** Tags for placement of this service. */
  tagsForPlacement?: NodeTagsDescription;
  /** Tags for running of this service. */
  tagsForRunning?: NodeTagsDescription;
}

/** Information about a service partition and its associated endpoints. */
export interface ResolvedServicePartition {
  /** The full name of the service with 'fabric:' URI scheme. */
  name: string;
  /** A representation of the resolved partition. */
  partitionInformation: PartitionInformationUnion;
  /** List of resolved service endpoints of a service partition. */
  endpoints: ResolvedServiceEndpoint[];
  /** The version of this resolved service partition result. This version should be passed in the next time the ResolveService call is made via the PreviousRspVersion query parameter. */
  version: string;
}

/** Information about the partition identity, partitioning scheme and keys supported by it. */
export interface PartitionInformation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  servicePartitionKind: "Int64Range" | "Named" | "Singleton";
  /** An internal ID used by Service Fabric to uniquely identify a partition. This is a randomly generated GUID when the service was created. The partition ID is unique and does not change for the lifetime of the service. If the same service was deleted and recreated the IDs of its partitions would be different. */
  id?: string;
}

/** Endpoint of a resolved service partition. */
export interface ResolvedServiceEndpoint {
  /** The role of the replica where the endpoint is reported. */
  kind?: ServiceEndpointRole;
  /** The address of the endpoint. If the endpoint has multiple listeners the address is a JSON object with one property per listener with the value as the address of that listener. */
  address?: string;
}

/** Contains information for an unplaced replica. */
export interface UnplacedReplicaInformation {
  /** The name of the service. */
  serviceName?: string;
  /** The ID of the partition. */
  partitionId?: string;
  /** List of reasons due to which a replica cannot be placed. */
  unplacedReplicaDetails?: string[];
}

/** Represents data structure that contains top/least loaded partitions for a certain metric. */
export interface LoadedPartitionInformationResultList {
  /** The continuation token parameter is used to obtain next set of results. The continuation token is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token is not included in the response. */
  continuationToken?: string;
  /** List of application information. */
  items?: LoadedPartitionInformationResult[];
}

/** Represents partition information. */
export interface LoadedPartitionInformationResult {
  /** Name of the service this partition belongs to. */
  serviceName: string;
  /** Id of the partition. */
  partitionId: string;
  /** Name of the metric for which this information is provided. */
  metricName: string;
  /** Load for metric. */
  load: number;
}

/** The list of partition in the cluster for a service. The list is paged when all of the results cannot fit in a single message. The next set of results can be obtained by executing the same query with the continuation token provided in this list. */
export interface PagedServicePartitionInfoList {
  /** The continuation token parameter is used to obtain next set of results. The continuation token is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token is not included in the response. */
  continuationToken?: string;
  /** List of service partition information. */
  items?: ServicePartitionInfoUnion[];
}

/** Information about a partition of a Service Fabric service. */
export interface ServicePartitionInfo {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  serviceKind: "Stateful" | "Stateless";
  /** The health state of a Service Fabric entity such as Cluster, Node, Application, Service, Partition, Replica etc. */
  healthState?: HealthState;
  /** The status of the service fabric service partition. */
  partitionStatus?: ServicePartitionStatus;
  /** Information about the partition identity, partitioning scheme and keys supported by it. */
  partitionInformation?: PartitionInformationUnion;
}

/** Information about the service name. */
export interface ServiceNameInfo {
  /**
   * The identity of the service. This ID is an encoded representation of the service name. This is used in the REST APIs to identify the service resource.
   * Starting in version 6.0, hierarchical names are delimited with the "\~" character. For example, if the service name is "fabric:/myapp/app1/svc1",
   * the service identity would be "myapp~app1\~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   */
  id?: string;
  /** The full name of the service with 'fabric:' URI scheme. */
  name?: string;
}

/**
 * Represents load information for a partition, which contains the primary, secondary and auxiliary reported load metrics.
 * In case there is no load reported, PartitionLoadInformation will contain the default load for the service of the partition.
 * For default loads, LoadMetricReport's LastReportedUtc is set to 0.
 */
export interface PartitionLoadInformation {
  /** Id of the partition. */
  partitionId?: string;
  /** Array of load reports from the primary replica for this partition. */
  primaryLoadMetricReports?: LoadMetricReport[];
  /**
   * Array of aggregated load reports from all secondary replicas for this partition.
   * Array only contains the latest reported load for each metric.
   */
  secondaryLoadMetricReports?: LoadMetricReport[];
  /**
   * Array of aggregated load reports from all auxiliary replicas for this partition.
   * Array only contains the latest reported load for each metric.
   */
  auxiliaryLoadMetricReports?: LoadMetricReport[];
}

/** Represents the load metric report which contains the time metric was reported, its name and value. */
export interface LoadMetricReport {
  /** Gets the UTC time when the load was reported. */
  lastReportedUtc?: Date;
  /** The name of the load metric. */
  name?: string;
  /** The value of the load metric. In future releases of Service Fabric this parameter will be deprecated in favor of CurrentValue. */
  value?: string;
  /** The value of the load metric. */
  currentValue?: string;
}

/** Represents load information for a partition, which contains the metrics load information about primary, all secondary replicas/instances or a specific secondary replica/instance on a specific node , all auxiliary replicas or a specific auxiliary replica on a specific node. */
export interface PartitionMetricLoadDescription {
  /** Id of the partition. */
  partitionId?: string;
  /** Partition's load information for primary replica, in case partition is from a stateful service. */
  primaryReplicaLoadEntries?: MetricLoadDescription[];
  /** Partition's load information for all secondary replicas or instances. */
  secondaryReplicasOrInstancesLoadEntries?: MetricLoadDescription[];
  /** Partition's load information for a specific secondary replica or instance located on a specific node. */
  secondaryReplicaOrInstanceLoadEntriesPerNode?: ReplicaMetricLoadDescription[];
  /** Partition's load information for all auxiliary replicas. */
  auxiliaryReplicasLoadEntries?: MetricLoadDescription[];
  /** Partition's load information for a specific auxiliary replica located on a specific node. */
  auxiliaryReplicaLoadEntriesPerNode?: ReplicaMetricLoadDescription[];
}

/** Specifies metric load information. */
export interface MetricLoadDescription {
  /** The name of the reported metric. */
  metricName?: string;
  /** The current value of the metric load. */
  currentLoad?: number;
  /** The predicted value of the metric load. Predicted metric load values is currently a preview feature. It allows predicted load values to be reported and used at the Service Fabric side, but that feature is currently not enabled. */
  predictedLoad?: number;
}

/** Specifies metric loads of a partition's specific secondary replica or instance. */
export interface ReplicaMetricLoadDescription {
  /** Node name of a specific secondary replica or instance. */
  nodeName?: string;
  /** Loads of a different metrics for a partition's secondary replica or instance. */
  replicaOrInstanceLoadEntries?: MetricLoadDescription[];
}

/** The list of results of the call UpdatePartitionLoad. The list is paged when all of the results cannot fit in a single message. The next set of results can be obtained by executing the same query with the continuation token provided in this list. */
export interface PagedUpdatePartitionLoadResultList {
  /** The continuation token parameter is used to obtain next set of results. The continuation token is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token is not included in the response. */
  continuationToken?: string;
  /** List of partition load update information. */
  items?: UpdatePartitionLoadResult[];
}

/** Specifies result of updating load for specified partitions. The output will be ordered based on the partition ID. */
export interface UpdatePartitionLoadResult {
  /** Id of the partition. */
  partitionId?: string;
  /** If OperationState is Completed - this is 0.  If OperationState is Faulted - this is an error code indicating the reason. */
  partitionErrorCode?: number;
}

/**
 * Represents a repair task, which includes information about what kind of repair was requested, what its progress is, and what its final result was.
 *
 * This type supports the Service Fabric platform; it is not meant to be used directly from your code.
 */
export interface RepairTask {
  /** The ID of the repair task. */
  taskId: string;
  /**
   * The version of the repair task.
   * When creating a new repair task, the version must be set to zero.  When updating a repair task,
   * the version is used for optimistic concurrency checks.  If the version is
   * set to zero, the update will not check for write conflicts.  If the version is set to a non-zero value, then the
   * update will only succeed if the actual current version of the repair task matches this value.
   */
  version?: string;
  /**
   * A description of the purpose of the repair task, or other informational details.
   * May be set when the repair task is created, and is immutable once set.
   */
  description?: string;
  /** The workflow state of the repair task. Valid initial states are Created, Claimed, and Preparing. */
  state: State;
  /**
   * A bitwise-OR of the following values, which gives additional details about the status of the repair task.
   * - 1 - Cancellation of the repair has been requested
   * - 2 - Abort of the repair has been requested
   * - 4 - Approval of the repair was forced via client request
   */
  flags?: number;
  /** The requested repair action. Must be specified when the repair task is created, and is immutable once set. */
  action: string;
  /**
   * The target object determines what actions the system will take to prepare for the impact of the repair, prior to approving execution of the repair.
   * May be set when the repair task is created, and is immutable once set.
   */
  target?: RepairTargetDescriptionBaseUnion;
  /** The name of the repair executor. Must be specified in Claimed and later states, and is immutable once set. */
  executor?: string;
  /** A data string that the repair executor can use to store its internal state. */
  executorData?: string;
  /**
   * The impact object determines what actions the system will take to prepare for the impact of the repair, prior to approving execution of the repair.
   * Impact must be specified by the repair executor when transitioning to the Preparing state, and is immutable once set.
   */
  impact?: RepairImpactDescriptionBaseUnion;
  /** A value describing the overall result of the repair task execution. Must be specified in the Restoring and later states, and is immutable once set. */
  resultStatus?: ResultStatus;
  /**
   * A numeric value providing additional details about the result of the repair task execution.
   * May be specified in the Restoring and later states, and is immutable once set.
   */
  resultCode?: number;
  /**
   * A string providing additional details about the result of the repair task execution.
   * May be specified in the Restoring and later states, and is immutable once set.
   */
  resultDetails?: string;
  /**
   * An object that contains timestamps of the repair task's state transitions.
   * These timestamps are updated by the system, and cannot be directly modified.
   */
  history?: RepairTaskHistory;
  /** The workflow state of the health check when the repair task is in the Preparing state. */
  preparingHealthCheckState?: RepairTaskHealthCheckState;
  /** The workflow state of the health check when the repair task is in the Restoring state. */
  restoringHealthCheckState?: RepairTaskHealthCheckState;
  /** A value to determine if health checks will be performed when the repair task enters the Preparing state. */
  performPreparingHealthCheck?: boolean;
  /** A value to determine if health checks will be performed when the repair task enters the Restoring state. */
  performRestoringHealthCheck?: boolean;
}

/**
 * Describes the entities targeted by a repair action.
 *
 * This type supports the Service Fabric platform; it is not meant to be used directly from your code.
 */
export interface RepairTargetDescriptionBase {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Node";
}

/**
 * Describes the expected impact of executing a repair task.
 *
 * This type supports the Service Fabric platform; it is not meant to be used directly from your code.
 */
export interface RepairImpactDescriptionBase {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Node";
}

/**
 * A record of the times when the repair task entered each state.
 *
 * This type supports the Service Fabric platform; it is not meant to be used directly from your code.
 */
export interface RepairTaskHistory {
  /** The time when the repair task entered the Created state. */
  createdUtcTimestamp?: Date;
  /** The time when the repair task entered the Claimed state. */
  claimedUtcTimestamp?: Date;
  /** The time when the repair task entered the Preparing state. */
  preparingUtcTimestamp?: Date;
  /** The time when the repair task entered the Approved state */
  approvedUtcTimestamp?: Date;
  /** The time when the repair task entered the Executing state */
  executingUtcTimestamp?: Date;
  /** The time when the repair task entered the Restoring state */
  restoringUtcTimestamp?: Date;
  /** The time when the repair task entered the Completed state */
  completedUtcTimestamp?: Date;
  /** The time when the repair task started the health check in the Preparing state. */
  preparingHealthCheckStartUtcTimestamp?: Date;
  /** The time when the repair task completed the health check in the Preparing state. */
  preparingHealthCheckEndUtcTimestamp?: Date;
  /** The time when the repair task started the health check in the Restoring state. */
  restoringHealthCheckStartUtcTimestamp?: Date;
  /** The time when the repair task completed the health check in the Restoring state. */
  restoringHealthCheckEndUtcTimestamp?: Date;
}

/**
 * Describes the result of an operation that created or updated a repair task.
 *
 * This type supports the Service Fabric platform; it is not meant to be used directly from your code.
 */
export interface RepairTaskUpdateInfo {
  /** The new version of the repair task. */
  version: string;
}

/**
 * Describes a request to cancel a repair task.
 *
 * This type supports the Service Fabric platform; it is not meant to be used directly from your code.
 */
export interface RepairTaskCancelDescription {
  /** The ID of the repair task. */
  taskId: string;
  /** The current version number of the repair task. If non-zero, then the request will only succeed if this value matches the actual current version of the repair task. If zero, then no version check is performed. */
  version?: string;
  /** _True_ if the repair should be stopped as soon as possible even if it has already started executing. _False_ if the repair should be cancelled only if execution has not yet started. */
  requestAbort?: boolean;
}

/**
 * Describes a request to delete a completed repair task.
 *
 * This type supports the Service Fabric platform; it is not meant to be used directly from your code.
 */
export interface RepairTaskDeleteDescription {
  /** The ID of the completed repair task to be deleted. */
  taskId: string;
  /** The current version number of the repair task. If non-zero, then the request will only succeed if this value matches the actual current version of the repair task. If zero, then no version check is performed. */
  version?: string;
}

/**
 * Describes a request for forced approval of a repair task.
 *
 * This type supports the Service Fabric platform; it is not meant to be used directly from your code.
 */
export interface RepairTaskApproveDescription {
  /** The ID of the repair task. */
  taskId: string;
  /** The current version number of the repair task. If non-zero, then the request will only succeed if this value matches the actual current version of the repair task. If zero, then no version check is performed. */
  version?: string;
}

/**
 * Describes a request to update the health policy of a repair task.
 *
 * This type supports the Service Fabric platform; it is not meant to be used directly from your code.
 */
export interface RepairTaskUpdateHealthPolicyDescription {
  /** The ID of the repair task to be updated. */
  taskId: string;
  /** The current version number of the repair task. If non-zero, then the request will only succeed if this value matches the actual current value of the repair task. If zero, then no version check is performed. */
  version?: string;
  /** A boolean indicating if health check is to be performed in the Preparing stage of the repair task. If not specified the existing value should not be altered. Otherwise, specify the desired new value. */
  performPreparingHealthCheck?: boolean;
  /** A boolean indicating if health check is to be performed in the Restoring stage of the repair task. If not specified the existing value should not be altered. Otherwise, specify the desired new value. */
  performRestoringHealthCheck?: boolean;
}

/** The list of replicas in the cluster for a given partition. The list is paged when all of the results cannot fit in a single message. The next set of results can be obtained by executing the same query with the continuation token provided in this list. */
export interface PagedReplicaInfoList {
  /** The continuation token parameter is used to obtain next set of results. The continuation token is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token is not included in the response. */
  continuationToken?: string;
  /** List of replica information. */
  items?: ReplicaInfoUnion[];
}

/** Information about the identity, status, health, node name, uptime, and other details about the replica. */
export interface ReplicaInfo {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  serviceKind: "Stateful" | "Stateless";
  /** The status of a replica of a service. */
  replicaStatus?: ReplicaStatus;
  /** The health state of a Service Fabric entity such as Cluster, Node, Application, Service, Partition, Replica etc. */
  healthState?: HealthState;
  /** The name of a Service Fabric node. */
  nodeName?: string;
  /** The address the replica is listening on. */
  address?: string;
  /** The last in build duration of the replica in seconds. */
  lastInBuildDurationInSeconds?: string;
}

/** Information about a Service Fabric service replica deployed on a node. */
export interface DeployedServiceReplicaInfo {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  serviceKind: "Stateful" | "Stateless";
  /** The full name of the service with 'fabric:' URI scheme. */
  serviceName?: string;
  /** Name of the service type as specified in the service manifest. */
  serviceTypeName?: string;
  /** The name of the service manifest in which this service type is defined. */
  serviceManifestName?: string;
  /** The name of the code package that hosts this replica. */
  codePackageName?: string;
  /** An internal ID used by Service Fabric to uniquely identify a partition. This is a randomly generated GUID when the service was created. The partition ID is unique and does not change for the lifetime of the service. If the same service was deleted and recreated the IDs of its partitions would be different. */
  partitionId?: string;
  /** The status of a replica of a service. */
  replicaStatus?: ReplicaStatus;
  /** The last address returned by the replica in Open or ChangeRole. */
  address?: string;
  /**
   * The ActivationId of a deployed service package. If ServicePackageActivationMode specified at the time of creating the service
   * is 'SharedProcess' (or if it is not specified, in which case it defaults to 'SharedProcess'), then value of ServicePackageActivationId
   * is always an empty string.
   */
  servicePackageActivationId?: string;
  /** Host process ID of the process that is hosting the replica. This will be zero if the replica is down. In hyper-v containers this host process ID will be from different kernel. */
  hostProcessId?: string;
}

/** Information about a Service Fabric service replica deployed on a node. */
export interface DeployedServiceReplicaDetailInfo {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  serviceKind: "Stateful" | "Stateless";
  /** Full hierarchical name of the service in URI format starting with `fabric:`. */
  serviceName?: string;
  /** An internal ID used by Service Fabric to uniquely identify a partition. This is a randomly generated GUID when the service was created. The partition ID is unique and does not change for the lifetime of the service. If the same service was deleted and recreated the IDs of its partitions would be different. */
  partitionId?: string;
  /** Specifies the current active life-cycle operation on a stateful service replica or stateless service instance. */
  currentServiceOperation?: ServiceOperationName;
  /** The start time of the current service operation in UTC format. */
  currentServiceOperationStartTimeUtc?: Date;
  /** List of load reported by replica. */
  reportedLoad?: LoadMetricReportInfo[];
}

/** Information about load reported by replica. */
export interface LoadMetricReportInfo {
  /** The name of the metric. */
  name?: string;
  /** The value of the load for the metric. In future releases of Service Fabric this parameter will be deprecated in favor of CurrentValue. */
  value?: number;
  /** The double value of the load for the metric. */
  currentValue?: string;
  /** The UTC time when the load is reported. */
  lastReportedUtc?: Date;
}

/** Information about service package deployed on a Service Fabric node. */
export interface DeployedServicePackageInfo {
  /** The name of the service package as specified in the service manifest. */
  name?: string;
  /** The version of the service package specified in service manifest. */
  version?: string;
  /** Specifies the status of a deployed application or service package on a Service Fabric node. */
  status?: DeploymentStatus;
  /**
   * The ActivationId of a deployed service package. If ServicePackageActivationMode specified at the time of creating the service
   * is 'SharedProcess' (or if it is not specified, in which case it defaults to 'SharedProcess'), then value of ServicePackageActivationId
   * is always an empty string.
   */
  servicePackageActivationId?: string;
}

/** Defines description for downloading packages associated with a service manifest to image cache on a Service Fabric node. */
export interface DeployServicePackageToNodeDescription {
  /** The name of service manifest whose packages need to be downloaded. */
  serviceManifestName: string;
  /** The application type name as defined in the application manifest. */
  applicationTypeName: string;
  /** The version of the application type as defined in the application manifest. */
  applicationTypeVersion: string;
  /** The name of a Service Fabric node. */
  nodeName: string;
  /** List of package sharing policy information. */
  packageSharingPolicy?: PackageSharingPolicyInfo[];
}

/** Represents a policy for the package sharing. */
export interface PackageSharingPolicyInfo {
  /** The name of code, configuration or data package that should be shared. */
  sharedPackageName?: string;
  /** Represents the scope for PackageSharingPolicy. This is specified during DeployServicePackageToNode operation. */
  packageSharingScope?: PackageSharingPolicyScope;
}

/** Information about code package deployed on a Service Fabric node. */
export interface DeployedCodePackageInfo {
  /** The name of the code package. */
  name?: string;
  /** The version of the code package specified in service manifest. */
  version?: string;
  /** The name of service manifest that specified this code package. */
  serviceManifestName?: string;
  /**
   * The ActivationId of a deployed service package. If ServicePackageActivationMode specified at the time of creating the service
   * is 'SharedProcess' (or if it is not specified, in which case it defaults to 'SharedProcess'), then value of ServicePackageActivationId
   * is always an empty string.
   */
  servicePackageActivationId?: string;
  /** Specifies the type of host for main entry point of a code package as specified in service manifest. */
  hostType?: HostType;
  /** Specifies the isolation mode of main entry point of a code package when it's host type is ContainerHost. This is specified as part of container host policies in application manifest while importing service manifest. */
  hostIsolationMode?: HostIsolationMode;
  /** Specifies the status of a deployed application or service package on a Service Fabric node. */
  status?: DeploymentStatus;
  /** The interval at which code package is run. This is used for periodic code package. */
  runFrequencyInterval?: string;
  /** Information about setup or main entry point of a code package deployed on a Service Fabric node. */
  setupEntryPoint?: CodePackageEntryPoint;
  /** Information about setup or main entry point of a code package deployed on a Service Fabric node. */
  mainEntryPoint?: CodePackageEntryPoint;
}

/** Information about setup or main entry point of a code package deployed on a Service Fabric node. */
export interface CodePackageEntryPoint {
  /** The location of entry point executable on the node. */
  entryPointLocation?: string;
  /** The process ID of the entry point. */
  processId?: string;
  /** The user name under which entry point executable is run on the node. */
  runAsUserName?: string;
  /** Statistics about setup or main entry point  of a code package deployed on a Service Fabric node. */
  codePackageEntryPointStatistics?: CodePackageEntryPointStatistics;
  /** Specifies the status of the code package entry point deployed on a Service Fabric node. */
  status?: EntryPointStatus;
  /** The time (in UTC) when the entry point executable will be run next. */
  nextActivationTime?: Date;
  /** The instance ID for current running entry point. For a code package setup entry point (if specified) runs first and after it finishes main entry point is started. Each time entry point executable is run, its instance id will change. */
  instanceId?: string;
}

/** Statistics about setup or main entry point  of a code package deployed on a Service Fabric node. */
export interface CodePackageEntryPointStatistics {
  /** The last exit code of the entry point. */
  lastExitCode?: string;
  /** The last time (in UTC) when Service Fabric attempted to run the entry point. */
  lastActivationTime?: Date;
  /** The last time (in UTC) when the entry point finished running. */
  lastExitTime?: Date;
  /** The last time (in UTC) when the entry point ran successfully. */
  lastSuccessfulActivationTime?: Date;
  /** The last time (in UTC) when the entry point finished running gracefully. */
  lastSuccessfulExitTime?: Date;
  /** Number of times the entry point has run. */
  activationCount?: string;
  /** Number of times the entry point failed to run. */
  activationFailureCount?: string;
  /** Number of times the entry point continuously failed to run. */
  continuousActivationFailureCount?: string;
  /** Number of times the entry point finished running. */
  exitCount?: string;
  /** Number of times the entry point failed to exit gracefully. */
  exitFailureCount?: string;
  /** Number of times the entry point continuously failed to exit gracefully. */
  continuousExitFailureCount?: string;
}

/** Defines description for restarting a deployed code package on Service Fabric node. */
export interface RestartDeployedCodePackageDescription {
  /** The name of service manifest that specified this code package. */
  serviceManifestName: string;
  /**
   * The ActivationId of a deployed service package. If ServicePackageActivationMode specified at the time of creating the service
   * is 'SharedProcess' (or if it is not specified, in which case it defaults to 'SharedProcess'), then value of ServicePackageActivationId
   * is always an empty string.
   */
  servicePackageActivationId?: string;
  /** The name of the code package defined in the service manifest. */
  codePackageName: string;
  /**
   * The instance ID for currently running entry point. For a code package setup entry point (if specified) runs first and after it finishes main entry point is started.
   * Each time entry point executable is run, its instance ID will change. If 0 is passed in as the code package instance ID, the API will restart the code package with whatever instance ID it is currently running.
   * If an instance ID other than 0 is passed in, the API will restart the code package only if the current Instance ID matches the passed in instance ID.
   * Note, passing in the exact instance ID (not 0) in the API is safer, because if ensures at most one restart of the code package.
   */
  codePackageInstanceId: string;
}

/** Container logs. */
export interface ContainerLogs {
  /** Container logs. */
  content?: string;
}

/** parameters for making container API call. */
export interface ContainerApiRequestBody {
  /** HTTP verb of container REST API, defaults to "GET" */
  httpVerb?: string;
  /** URI path of container REST API */
  uriPath: string;
  /** Content type of container REST API request, defaults to "application/json" */
  contentType?: string;
  /** HTTP request body of container REST API */
  body?: string;
}

/** Response body that wraps container API result. */
export interface ContainerApiResponse {
  /** Container API result. */
  containerApiResult: ContainerApiResult;
}

/** Container API result. */
export interface ContainerApiResult {
  /** HTTP status code returned by the target container API */
  status: number;
  /** HTTP content type */
  contentType?: string;
  /** HTTP content encoding */
  contentEncoding?: string;
  /** container API result body */
  body?: string;
}

/** Defines description for creating a Service Fabric compose deployment. */
export interface CreateComposeDeploymentDescription {
  /** The name of the deployment. */
  deploymentName: string;
  /** The content of the compose file that describes the deployment to create. */
  composeFileContent: string;
  /** Credential information to connect to container registry. */
  registryCredential?: RegistryCredential;
}

/** Credential information to connect to container registry. */
export interface RegistryCredential {
  /** The user name to connect to container registry. */
  registryUserName?: string;
  /** The password for supplied username to connect to container registry. */
  registryPassword?: string;
  /** Indicates that supplied container registry password is encrypted. */
  passwordEncrypted?: boolean;
}

/** Information about a Service Fabric compose deployment. */
export interface ComposeDeploymentStatusInfo {
  /** The name of the deployment. */
  name?: string;
  /** The name of the application, including the 'fabric:' URI scheme. */
  applicationName?: string;
  /** The status of the compose deployment. */
  status?: ComposeDeploymentStatus;
  /** The status details of compose deployment including failure message. */
  statusDetails?: string;
}

/** The list of compose deployments in the cluster. The list is paged when all of the results cannot fit in a single message. The next set of results can be obtained by executing the same query with the continuation token provided in this list. */
export interface PagedComposeDeploymentStatusInfoList {
  /** The continuation token parameter is used to obtain next set of results. The continuation token is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token is not included in the response. */
  continuationToken?: string;
  /** List of compose deployment status information. */
  items?: ComposeDeploymentStatusInfo[];
}

/** Describes the parameters for a compose deployment upgrade. */
export interface ComposeDeploymentUpgradeProgressInfo {
  /** The name of the target deployment. */
  deploymentName?: string;
  /** The name of the target application, including the 'fabric:' URI scheme. */
  applicationName?: string;
  /** The state of the compose deployment upgrade. */
  upgradeState?: ComposeDeploymentUpgradeState;
  /** Additional detailed information about the status of the pending upgrade. */
  upgradeStatusDetails?: string;
  /** The kind of upgrade out of the following possible values. */
  upgradeKind?: UpgradeKind;
  /** The mode used to monitor health during a rolling upgrade. The values are UnmonitoredAuto, UnmonitoredManual, Monitored, and UnmonitoredDeferred. */
  rollingUpgradeMode?: UpgradeMode;
  /** If true, then processes are forcefully restarted during upgrade even when the code version has not changed (the upgrade only changes configuration or data). */
  forceRestart?: boolean;
  /** The maximum amount of time to block processing of an upgrade domain and prevent loss of availability when there are unexpected issues. When this timeout expires, processing of the upgrade domain will proceed regardless of availability loss issues. The timeout is reset at the start of each upgrade domain. Valid values are between 0 and 42949672925 inclusive. (unsigned 32-bit integer). */
  upgradeReplicaSetCheckTimeoutInSeconds?: number;
  /** Describes the parameters for monitoring an upgrade in Monitored mode. */
  monitoringPolicy?: MonitoringPolicyDescription;
  /** Defines a health policy used to evaluate the health of an application or one of its children entities. */
  applicationHealthPolicy?: ApplicationHealthPolicy;
  /** The target application type version (found in the application manifest) for the application upgrade. */
  targetApplicationTypeVersion?: string;
  /** The estimated amount of time that the overall upgrade elapsed. It is first interpreted as a string representing an ISO 8601 duration. If that fails, then it is interpreted as a number representing the total number of milliseconds. */
  upgradeDuration?: string;
  /** The estimated amount of time spent processing current Upgrade Domain. It is first interpreted as a string representing an ISO 8601 duration. If that fails, then it is interpreted as a number representing the total number of milliseconds. */
  currentUpgradeDomainDuration?: string;
  /** List of health evaluations that resulted in the current aggregated health state. */
  applicationUnhealthyEvaluations?: HealthEvaluationWrapper[];
  /** Information about the current in-progress upgrade domain. Not applicable to node-by-node upgrades. */
  currentUpgradeDomainProgress?: CurrentUpgradeDomainProgressInfo;
  /** The estimated UTC datetime when the upgrade started. */
  startTimestampUtc?: string;
  /** The estimated UTC datetime when the upgrade failed and FailureAction was executed. */
  failureTimestampUtc?: string;
  /** The cause of an upgrade failure that resulted in FailureAction being executed. */
  failureReason?: FailureReason;
  /** Information about the upgrade domain progress at the time of upgrade failure. */
  upgradeDomainProgressAtFailure?: FailureUpgradeDomainProgressInfo;
  /** Additional details of application upgrade including failure message. */
  applicationUpgradeStatusDetails?: string;
}

/** Describes the parameters for a compose deployment upgrade. */
export interface ComposeDeploymentUpgradeDescription {
  /** The name of the deployment. */
  deploymentName: string;
  /** The content of the compose file that describes the deployment to create. */
  composeFileContent: string;
  /** Credential information to connect to container registry. */
  registryCredential?: RegistryCredential;
  /** The kind of upgrade out of the following possible values. */
  upgradeKind: UpgradeKind;
  /** The mode used to monitor health during a rolling upgrade. The values are UnmonitoredAuto, UnmonitoredManual, Monitored, and UnmonitoredDeferred. */
  rollingUpgradeMode?: UpgradeMode;
  /** The maximum amount of time to block processing of an upgrade domain and prevent loss of availability when there are unexpected issues. When this timeout expires, processing of the upgrade domain will proceed regardless of availability loss issues. The timeout is reset at the start of each upgrade domain. Valid values are between 0 and 42949672925 inclusive. (unsigned 32-bit integer). */
  upgradeReplicaSetCheckTimeoutInSeconds?: number;
  /** If true, then processes are forcefully restarted during upgrade even when the code version has not changed (the upgrade only changes configuration or data). */
  forceRestart?: boolean;
  /** Describes the parameters for monitoring an upgrade in Monitored mode. */
  monitoringPolicy?: MonitoringPolicyDescription;
  /** Defines a health policy used to evaluate the health of an application or one of its children entities. */
  applicationHealthPolicy?: ApplicationHealthPolicy;
}

/** Contains a description of Chaos. */
export interface Chaos {
  /** If Chaos is running, these are the parameters Chaos is running with. */
  chaosParameters?: ChaosParameters;
  /** Current status of the Chaos run. */
  status?: ChaosStatus;
  /** Current status of the schedule. */
  scheduleStatus?: ChaosScheduleStatus;
}

/** Defines all the parameters to configure a Chaos run. */
export interface ChaosParameters {
  /** Total time (in seconds) for which Chaos will run before automatically stopping. The maximum allowed value is 4,294,967,295 (System.UInt32.MaxValue). */
  timeToRunInSeconds?: string;
  /**
   * The maximum amount of time to wait for all cluster entities to become stable and healthy. Chaos executes in iterations and at the start of each iteration it validates the health of cluster entities.
   * During validation if a cluster entity is not stable and healthy within MaxClusterStabilizationTimeoutInSeconds, Chaos generates a validation failed event.
   */
  maxClusterStabilizationTimeoutInSeconds?: number;
  /**
   * MaxConcurrentFaults is the maximum number of concurrent faults induced per iteration.
   * Chaos executes in iterations and two consecutive iterations are separated by a validation phase.
   * The higher the concurrency, the more aggressive the injection of faults, leading to inducing more complex series of states to uncover bugs.
   * The recommendation is to start with a value of 2 or 3 and to exercise caution while moving up.
   */
  maxConcurrentFaults?: number;
  /** Enables or disables the move primary and move secondary faults. */
  enableMoveReplicaFaults?: boolean;
  /**
   * Wait time (in seconds) between consecutive faults within a single iteration.
   * The larger the value, the lower the overlapping between faults and the simpler the sequence of state transitions that the cluster goes through.
   * The recommendation is to start with a value between 1 and 5 and exercise caution while moving up.
   */
  waitTimeBetweenFaultsInSeconds?: number;
  /**
   * Time-separation (in seconds) between two consecutive iterations of Chaos.
   * The larger the value, the lower the fault injection rate.
   */
  waitTimeBetweenIterationsInSeconds?: number;
  /** Passed-in cluster health policy is used to validate health of the cluster in between Chaos iterations. If the cluster health is in error or if an unexpected exception happens during fault execution--to provide the cluster with some time to recuperate--Chaos will wait for 30 minutes before the next health-check. */
  clusterHealthPolicy?: ClusterHealthPolicy;
  /**
   * Describes a map, which is a collection of (string, string) type key-value pairs. The map can be used to record information about
   * the Chaos run. There cannot be more than 100 such pairs and each string (key or value) can be at most 4095 characters long.
   * This map is set by the starter of the Chaos run to optionally store the context about the specific run.
   */
  context?: ChaosContext;
  /**
   * List of cluster entities to target for Chaos faults.
   * This filter can be used to target Chaos faults only to certain node types or only to certain application instances. If ChaosTargetFilter is not used, Chaos faults all cluster entities.
   * If ChaosTargetFilter is used, Chaos faults only the entities that meet the ChaosTargetFilter specification.
   */
  chaosTargetFilter?: ChaosTargetFilter;
}

/**
 * Describes a map, which is a collection of (string, string) type key-value pairs. The map can be used to record information about
 * the Chaos run. There cannot be more than 100 such pairs and each string (key or value) can be at most 4095 characters long.
 * This map is set by the starter of the Chaos run to optionally store the context about the specific run.
 */
export interface ChaosContext {
  /** Describes a map that contains a collection of ChaosContextMapItem's. */
  map?: { [propertyName: string]: string };
}

/**
 * Defines all filters for targeted Chaos faults, for example, faulting only certain node types or faulting only certain applications.
 * If ChaosTargetFilter is not used, Chaos faults all cluster entities. If ChaosTargetFilter is used, Chaos faults only the entities that meet the ChaosTargetFilter
 * specification. NodeTypeInclusionList and ApplicationInclusionList allow a union semantics only. It is not possible to specify an intersection
 * of NodeTypeInclusionList and ApplicationInclusionList. For example, it is not possible to specify "fault this application only when it is on that node type."
 * Once an entity is included in either NodeTypeInclusionList or ApplicationInclusionList, that entity cannot be excluded using ChaosTargetFilter. Even if
 * applicationX does not appear in ApplicationInclusionList, in some Chaos iteration applicationX can be faulted because it happens to be on a node of nodeTypeY that is included
 * in NodeTypeInclusionList. If both NodeTypeInclusionList and ApplicationInclusionList are null or empty, an ArgumentException is thrown.
 */
export interface ChaosTargetFilter {
  /**
   * A list of node types to include in Chaos faults.
   * All types of faults (restart node, restart code package, remove replica, restart replica, move primary, and move secondary) are enabled for the nodes of these node types.
   * If a node type (say NodeTypeX) does not appear in the NodeTypeInclusionList, then node level faults (like NodeRestart) will never be enabled for the nodes of
   * NodeTypeX, but code package and replica faults can still be enabled for NodeTypeX if an application in the ApplicationInclusionList.
   * happens to reside on a node of NodeTypeX.
   * At most 100 node type names can be included in this list, to increase this number, a config upgrade is required for MaxNumberOfNodeTypesInChaosEntityFilter configuration.
   */
  nodeTypeInclusionList?: string[];
  /**
   * A list of application URIs to include in Chaos faults.
   * All replicas belonging to services of these applications are amenable to replica faults (restart replica, remove replica, move primary, and move secondary) by Chaos.
   * Chaos may restart a code package only if the code package hosts replicas of these applications only.
   * If an application does not appear in this list, it can still be faulted in some Chaos iteration if the application ends up on a node of a node type that is included in NodeTypeInclusionList.
   * However, if applicationX is tied to nodeTypeY through placement constraints and applicationX is absent from ApplicationInclusionList and nodeTypeY is absent from NodeTypeInclusionList, then applicationX will never be faulted.
   * At most 1000 application names can be included in this list, to increase this number, a config upgrade is required for MaxNumberOfApplicationsInChaosEntityFilter configuration.
   */
  applicationInclusionList?: string[];
}

/** Contains the list of Chaos events and the continuation token to get the next segment. */
export interface ChaosEventsSegment {
  /** The continuation token parameter is used to obtain next set of results. The continuation token is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token is not included in the response. */
  continuationToken?: string;
  /** List of Chaos events that meet the user-supplied criteria. */
  history?: ChaosEventWrapper[];
}

/** Wrapper object for Chaos event. */
export interface ChaosEventWrapper {
  /** Represents an event generated during a Chaos run. */
  chaosEvent?: ChaosEventUnion;
}

/** Represents an event generated during a Chaos run. */
export interface ChaosEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind:
    | "ExecutingFaults"
    | "Started"
    | "Stopped"
    | "TestError"
    | "ValidationFailed"
    | "Waiting";
  /** The UTC timestamp when this Chaos event was generated. */
  timeStampUtc: Date;
}

/** Defines the Chaos Schedule used by Chaos and the version of the Chaos Schedule. The version value wraps back to 0 after surpassing 2,147,483,647. */
export interface ChaosScheduleDescription {
  /** The version number of the Schedule. */
  version?: number;
  /** Defines the schedule used by Chaos. */
  schedule?: ChaosSchedule;
}

/** Defines the schedule used by Chaos. */
export interface ChaosSchedule {
  /** The date and time Chaos will start using this schedule. */
  startDate?: Date;
  /** The date and time Chaos will continue to use this schedule until. */
  expiryDate?: Date;
  /** A mapping of string names to Chaos Parameters to be referenced by Chaos Schedule Jobs. */
  chaosParametersDictionary?: ChaosParametersDictionaryItem[];
  /** A list of all Chaos Schedule Jobs that will be automated by the schedule. */
  jobs?: ChaosScheduleJob[];
}

/** Defines an item in ChaosParametersDictionary of the Chaos Schedule. */
export interface ChaosParametersDictionaryItem {
  /** The key identifying the Chaos Parameter in the dictionary. This key is referenced by Chaos Schedule Jobs. */
  key: string;
  /** Defines all the parameters to configure a Chaos run. */
  value: ChaosParameters;
}

/** Defines a repetition rule and parameters of Chaos to be used with the Chaos Schedule. */
export interface ChaosScheduleJob {
  /** A reference to which Chaos Parameters of the Chaos Schedule to use. */
  chaosParameters?: string;
  /** Defines the days of the week that a Chaos Schedule Job will run for. */
  days?: ChaosScheduleJobActiveDaysOfWeek;
  /** A list of Time Ranges that specify when during active days that this job will run. The times are interpreted as UTC. */
  times?: TimeRange[];
}

/** Defines the days of the week that a Chaos Schedule Job will run for. */
export interface ChaosScheduleJobActiveDaysOfWeek {
  /** Indicates if the Chaos Schedule Job will run on Sunday */
  sunday?: boolean;
  /** Indicates if the Chaos Schedule Job will run on Monday */
  monday?: boolean;
  /** Indicates if the Chaos Schedule Job will run on Tuesday */
  tuesday?: boolean;
  /** Indicates if the Chaos Schedule Job will run on Wednesday */
  wednesday?: boolean;
  /** Indicates if the Chaos Schedule Job will run on Thursday */
  thursday?: boolean;
  /** Indicates if the Chaos Schedule Job will run on Friday */
  friday?: boolean;
  /** Indicates if the Chaos Schedule Job will run on Saturday */
  saturday?: boolean;
}

/** Defines a time range in a 24 hour day specified by a start and end time. */
export interface TimeRange {
  /** Defines an hour and minute of the day specified in 24 hour time. */
  startTime?: TimeOfDay;
  /** Defines an hour and minute of the day specified in 24 hour time. */
  endTime?: TimeOfDay;
}

/** Defines an hour and minute of the day specified in 24 hour time. */
export interface TimeOfDay {
  /** Represents the hour of the day. Value must be between 0 and 23 inclusive. */
  hour?: number;
  /** Represents the minute of the hour. Value must be between 0 to 59 inclusive. */
  minute?: number;
}

/** Information about the image store content. */
export interface ImageStoreContent {
  /** The list of image store file info objects represents files found under the given image store relative path. */
  storeFiles?: FileInfo[];
  /** The list of image store folder info objects represents subfolders found under the given image store relative path. */
  storeFolders?: FolderInfo[];
}

/** Information about a image store file. */
export interface FileInfo {
  /** The size of file in bytes. */
  fileSize?: string;
  /** Information about the version of image store file. */
  fileVersion?: FileVersion;
  /** The date and time when the image store file was last modified. */
  modifiedDate?: Date;
  /** The file path relative to the image store root path. */
  storeRelativePath?: string;
}

/** Information about the version of image store file. */
export interface FileVersion {
  /** The current image store version number for the file is used in image store for checking whether it need to be updated. */
  versionNumber?: string;
  /** The epoch data loss number of image store replica when this file entry was updated or created. */
  epochDataLossNumber?: string;
  /** The epoch configuration version number of the image store replica when this file entry was created or updated. */
  epochConfigurationNumber?: string;
}

/** Information about a image store folder. It includes how many files this folder contains and its image store relative path. */
export interface FolderInfo {
  /** The remote location within image store. This path is relative to the image store root. */
  storeRelativePath?: string;
  /** The number of files from within the image store folder. */
  fileCount?: string;
}

/** Information about how to copy image store content from one image store relative path to another image store relative path. */
export interface ImageStoreCopyDescription {
  /** The relative path of source image store content to be copied from. */
  remoteSource: string;
  /** The relative path of destination image store content to be copied to. */
  remoteDestination: string;
  /** The list of the file names to be skipped for copying. */
  skipFiles?: string[];
  /** Indicates whether to check mark file during copying. The property is true if checking mark file is required, false otherwise. The mark file is used to check whether the folder is well constructed. If the property is true and mark file does not exist, the copy is skipped. */
  checkMarkFile?: boolean;
}

/** Information about a image store upload session */
export interface UploadSession {
  /** When querying upload session by upload session ID, the result contains only one upload session. When querying upload session by image store relative path, the result might contain multiple upload sessions. */
  uploadSessions?: UploadSessionInfo[];
}

/** Information about an image store upload session. A session is associated with a relative path in the image store. */
export interface UploadSessionInfo {
  /** The remote location within image store. This path is relative to the image store root. */
  storeRelativePath?: string;
  /** A unique ID of the upload session. A session ID can be reused only if the session was committed or removed. */
  sessionId?: string;
  /** The date and time when the upload session was last modified. */
  modifiedDate?: Date;
  /** The size in bytes of the uploading file. */
  fileSize?: string;
  /** List of chunk ranges that image store has not received yet. */
  expectedRanges?: UploadChunkRange[];
}

/** Information about which portion of the file to upload. */
export interface UploadChunkRange {
  /** The start position of the portion of the file. It's represented by the number of bytes. */
  startPosition?: string;
  /** The end position of the portion of the file. It's represented by the number of bytes. */
  endPosition?: string;
}

/** Information of a image store folder size */
export interface FolderSizeInfo {
  /** The remote location within image store. This path is relative to the image store root. */
  storeRelativePath?: string;
  /** The size of folder in bytes. */
  folderSize?: string;
}

/** Information about the ImageStore's resource usage */
export interface ImageStoreInfo {
  /** disk capacity and available disk space on the node where the ImageStore primary is placed. */
  diskInfo?: DiskInfo;
  /** the ImageStore's file system usage for metadata. */
  usedByMetadata?: UsageInfo;
  /** The ImageStore's file system usage for staging files that are being uploaded. */
  usedByStaging?: UsageInfo;
  /** the ImageStore's file system usage for copied application and cluster packages. [Removing application and cluster packages](https://docs.microsoft.com/rest/api/servicefabric/sfclient-api-deleteimagestorecontent) will free up this space. */
  usedByCopy?: UsageInfo;
  /** the ImageStore's file system usage for registered and cluster packages. [Unregistering application](https://docs.microsoft.com/rest/api/servicefabric/sfclient-api-unprovisionapplicationtype) and [cluster packages](https://docs.microsoft.com/rest/api/servicefabric/sfclient-api-unprovisionapplicationtype) will free up this space. */
  usedByRegister?: UsageInfo;
}

/** Information about the disk */
export interface DiskInfo {
  /** the disk size in bytes */
  capacity?: string;
  /** the available disk space in bytes */
  availableSpace?: string;
}

/** Information about how much space and how many files in the file system the ImageStore is using in this category */
export interface UsageInfo {
  /** the size of all files in this category */
  usedSpace?: string;
  /** the number of all files in this category */
  fileCount?: string;
}

/** Information about a partition data loss user-induced operation. */
export interface PartitionDataLossProgress {
  /** The state of the operation. */
  state?: OperationState;
  /** Represents information about an operation in a terminal state (Completed or Faulted). */
  invokeDataLossResult?: InvokeDataLossResult;
}

/** Represents information about an operation in a terminal state (Completed or Faulted). */
export interface InvokeDataLossResult {
  /** If OperationState is Completed, this is 0.  If OperationState is Faulted, this is an error code indicating the reason. */
  errorCode?: number;
  /** This class returns information about the partition that the user-induced operation acted upon. */
  selectedPartition?: SelectedPartition;
}

/** This class returns information about the partition that the user-induced operation acted upon. */
export interface SelectedPartition {
  /** The name of the service the partition belongs to. */
  serviceName?: string;
  /** An internal ID used by Service Fabric to uniquely identify a partition. This is a randomly generated GUID when the service was created. The partition ID is unique and does not change for the lifetime of the service. If the same service was deleted and recreated the IDs of its partitions would be different. */
  partitionId?: string;
}

/** Information about a partition quorum loss user-induced operation. */
export interface PartitionQuorumLossProgress {
  /** The state of the operation. */
  state?: OperationState;
  /** Represents information about an operation in a terminal state (Completed or Faulted). */
  invokeQuorumLossResult?: InvokeQuorumLossResult;
}

/** Represents information about an operation in a terminal state (Completed or Faulted). */
export interface InvokeQuorumLossResult {
  /** If OperationState is Completed, this is 0.  If OperationState is Faulted, this is an error code indicating the reason. */
  errorCode?: number;
  /** This class returns information about the partition that the user-induced operation acted upon. */
  selectedPartition?: SelectedPartition;
}

/** Information about a partition restart user-induced operation. */
export interface PartitionRestartProgress {
  /** The state of the operation. */
  state?: OperationState;
  /** Represents information about an operation in a terminal state (Completed or Faulted). */
  restartPartitionResult?: RestartPartitionResult;
}

/** Represents information about an operation in a terminal state (Completed or Faulted). */
export interface RestartPartitionResult {
  /** If OperationState is Completed, this is 0.  If OperationState is Faulted, this is an error code indicating the reason. */
  errorCode?: number;
  /** This class returns information about the partition that the user-induced operation acted upon. */
  selectedPartition?: SelectedPartition;
}

/**
 * Information about an NodeTransition operation.  This class contains an OperationState and a NodeTransitionResult.  The NodeTransitionResult is not valid until OperationState
 * is Completed or Faulted.
 */
export interface NodeTransitionProgress {
  /** The state of the operation. */
  state?: OperationState;
  /** Represents information about an operation in a terminal state (Completed or Faulted). */
  nodeTransitionResult?: NodeTransitionResult;
}

/** Represents information about an operation in a terminal state (Completed or Faulted). */
export interface NodeTransitionResult {
  /** If OperationState is Completed, this is 0.  If OperationState is Faulted, this is an error code indicating the reason. */
  errorCode?: number;
  /** Contains information about a node that was targeted by a user-induced operation. */
  nodeResult?: NodeResult;
}

/** Contains information about a node that was targeted by a user-induced operation. */
export interface NodeResult {
  /** The name of a Service Fabric node. */
  nodeName?: string;
  /** The node instance id. */
  nodeInstanceId?: string;
}

/** Contains the OperationId, OperationState, and OperationType for user-induced operations. */
export interface OperationStatus {
  /** A GUID that identifies a call to this API.  This is also passed into the corresponding GetProgress API. */
  operationId?: string;
  /** The state of the operation. */
  state?: OperationState;
  /** The type of the operation. */
  type?: OperationType;
}

/** Describes a backup policy for configuring periodic backup. */
export interface BackupPolicyDescription {
  /** The unique name identifying this backup policy. */
  name: string;
  /** Specifies whether to trigger restore automatically using the latest available backup in case the partition experiences a data loss event. */
  autoRestoreOnDataLoss: boolean;
  /**
   * Defines the maximum number of incremental backups to be taken between two full backups. This is just the upper limit. A full backup may be taken before specified number of incremental backups are completed in one of the following conditions
   * - The replica has never taken a full backup since it has become primary,
   * - Some of the log records since the last backup has been truncated, or
   * - Replica passed the MaxAccumulatedBackupLogSizeInMB limit.
   */
  maxIncrementalBackups: number;
  /** Describes the backup schedule parameters. */
  schedule: BackupScheduleDescriptionUnion;
  /** Describes the details of backup storage where to store the periodic backups. */
  storage: BackupStorageDescriptionUnion;
  /** Describes the policy to retain backups in storage. */
  retentionPolicy?: RetentionPolicyDescriptionUnion;
}

/** Describes the backup schedule parameters. */
export interface BackupScheduleDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  scheduleKind: "FrequencyBased" | "TimeBased";
}

/** Describes the parameters for the backup storage. */
export interface BackupStorageDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  storageKind:
    | "AzureBlobStore"
    | "FileShare"
    | "DsmsAzureBlobStore"
    | "ManagedIdentityAzureBlobStore";
  /** Friendly name for this backup storage. */
  friendlyName?: string;
}

/** Describes the retention policy configured. */
export interface RetentionPolicyDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  retentionPolicyType: "Basic";
}

/** The list of backup policies configured in the cluster. The list is paged when all of the results cannot fit in a single message. The next set of results can be obtained by executing the same query with the continuation token provided in this list. */
export interface PagedBackupPolicyDescriptionList {
  /** The continuation token parameter is used to obtain next set of results. The continuation token is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token is not included in the response. */
  continuationToken?: string;
  /** The list of backup policies information. */
  items?: BackupPolicyDescription[];
}

/** The list of backup entities that are being periodically backed. The list is paged when all of the results cannot fit in a single message. The next set of results can be obtained by executing the same query with the continuation token provided in this list. */
export interface PagedBackupEntityList {
  /** The continuation token parameter is used to obtain next set of results. The continuation token is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token is not included in the response. */
  continuationToken?: string;
  /** List of backup entity information. */
  items?: BackupEntityUnion[];
}

/** Describes the Service Fabric entity that is configured for backup. */
export interface BackupEntity {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  entityKind: "Application" | "Service" | "Partition";
}

/** Specifies the parameters needed to enable periodic backup. */
export interface EnableBackupDescription {
  /** Name of the backup policy to be used for enabling periodic backups. */
  backupPolicyName: string;
}

/** It describes the body parameters while disabling backup of a backup entity(Application/Service/Partition). */
export interface DisableBackupDescription {
  /** Boolean flag to delete backups. It can be set to true for deleting all the backups which were created for the backup entity that is getting disabled for backup. */
  cleanBackup: boolean;
}

/** The list of backup configuration information. The list is paged when all of the results cannot fit in a single message. The next set of results can be obtained by executing the same query with the continuation token provided in this list. */
export interface PagedBackupConfigurationInfoList {
  /** The continuation token parameter is used to obtain next set of results. The continuation token is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token is not included in the response. */
  continuationToken?: string;
  /** List of backup configuration information. */
  items?: BackupConfigurationInfoUnion[];
}

/** Describes the backup configuration information. */
export interface BackupConfigurationInfo {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Partition" | "Application" | "Service";
  /** The name of the backup policy which is applicable to this Service Fabric application or service or partition. */
  policyName?: string;
  /** Specifies the scope at which the backup policy is applied. */
  policyInheritedFrom?: BackupPolicyScope;
  /** Describes the backup suspension details. */
  suspensionInfo?: BackupSuspensionInfo;
}

/** Describes the backup suspension details. */
export interface BackupSuspensionInfo {
  /** Indicates whether periodic backup is suspended at this level or not. */
  isSuspended?: boolean;
  /** Specifies the scope at which the backup suspension was applied. */
  suspensionInheritedFrom?: BackupSuspensionScope;
}

/** The list of backups. The list is paged when all of the results cannot fit in a single message. The next set of results can be obtained by executing the same query with the continuation token provided in this list. */
export interface PagedBackupInfoList {
  /** The continuation token parameter is used to obtain next set of results. The continuation token is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token is not included in the response. */
  continuationToken?: string;
  /** List of backup information. */
  items?: BackupInfo[];
}

/** Represents a backup point which can be used to trigger a restore. */
export interface BackupInfo {
  /** Unique backup ID . */
  backupId?: string;
  /** Unique backup chain ID. All backups part of the same chain has the same backup chain id. A backup chain is comprised of 1 full backup and multiple incremental backups. */
  backupChainId?: string;
  /** Name of the Service Fabric application this partition backup belongs to. */
  applicationName?: string;
  /** Name of the Service Fabric service this partition backup belongs to. */
  serviceName?: string;
  /** Information about the partition to which this backup belongs to */
  partitionInformation?: PartitionInformationUnion;
  /** Location of the backup, relative to the backup store. */
  backupLocation?: string;
  /** Describes the type of backup, whether its full or incremental. */
  backupType?: BackupType;
  /** Epoch of the last record in this backup. */
  epochOfLastBackupRecord?: Epoch;
  /** LSN of the last record in this backup. */
  lsnOfLastBackupRecord?: string;
  /** The date time when this backup was taken. */
  creationTimeUtc?: Date;
  /** Manifest Version of the service this partition backup belongs to. */
  serviceManifestVersion?: string;
  /** Denotes the failure encountered in getting backup point information. */
  failureError?: FabricErrorError;
}

/** An Epoch is a configuration number for the partition as a whole. When the configuration of the replica set changes, for example when the Primary replica changes, the operations that are replicated from the new Primary replica are said to be a new Epoch from the ones which were sent by the old Primary replica. */
export interface Epoch {
  /** The current configuration number of this Epoch. The configuration number is an increasing value that is updated whenever the configuration of this replica set changes. */
  configurationVersion?: string;
  /** The current data loss number of this Epoch. The data loss number property is an increasing value which is updated whenever data loss is suspected, as when loss of a quorum of replicas in the replica set that includes the Primary replica. */
  dataLossVersion?: string;
}

/** Describes the parameters for triggering partition's backup. */
export interface BackupPartitionDescription {
  /** Specifies the details of the backup storage where to save the backup. */
  backupStorage?: BackupStorageDescriptionUnion;
}

/** Describes the progress of a partition's backup. */
export interface BackupProgressInfo {
  /** Represents the current state of the partition backup operation. */
  backupState?: BackupState;
  /** TimeStamp in UTC when operation succeeded or failed. */
  timeStampUtc?: Date;
  /** Unique ID of the newly created backup. */
  backupId?: string;
  /** Location, relative to the backup store, of the newly created backup. */
  backupLocation?: string;
  /** Specifies the epoch of the last record included in backup. */
  epochOfLastBackupRecord?: Epoch;
  /** The LSN of last record included in backup. */
  lsnOfLastBackupRecord?: string;
  /** Denotes the failure encountered in performing backup operation. */
  failureError?: FabricErrorError;
}

/** Specifies the parameters needed to trigger a restore of a specific partition. */
export interface RestorePartitionDescription {
  /** Unique backup ID. */
  backupId: string;
  /** Location of the backup relative to the backup storage specified/ configured. */
  backupLocation: string;
  /** Location of the backup from where the partition will be restored. */
  backupStorage?: BackupStorageDescriptionUnion;
}

/** Describes the progress of a restore operation on a partition. */
export interface RestoreProgressInfo {
  /** Represents the current state of the partition restore operation. */
  restoreState?: RestoreState;
  /** Timestamp when operation succeeded or failed. */
  timeStampUtc?: Date;
  /** Describes the epoch at which the partition is restored. */
  restoredEpoch?: Epoch;
  /** Restored LSN. */
  restoredLsn?: string;
  /** Denotes the failure encountered in performing restore operation. */
  failureError?: FabricErrorError;
}

/** Describes additional filters to be applied, while listing backups, and backup storage details from where to fetch the backups. */
export interface GetBackupByStorageQueryDescription {
  /** Specifies the start date time in ISO8601 from which to enumerate backups. If not specified, backups are enumerated from the beginning. */
  startDateTimeFilter?: Date;
  /** Specifies the end date time in ISO8601 till which to enumerate backups. If not specified, backups are enumerated till the end. */
  endDateTimeFilter?: Date;
  /** If specified as true, gets the most recent backup (within the specified time range) for every partition under the specified backup entity. */
  latest?: boolean;
  /** Describes the parameters for the backup storage from where to enumerate backups. This is optional and by default backups are enumerated from the backup storage where this backup entity is currently being backed up (as specified in backup policy). This parameter is useful to be able to enumerate backups from another cluster where you may intend to restore. */
  storage: BackupStorageDescriptionUnion;
  /** Indicates the entity for which to enumerate backups. */
  backupEntity: BackupEntityUnion;
}

/** Describes a Service Fabric name. */
export interface NameDescription {
  /** The Service Fabric name, including the 'fabric:' URI scheme. */
  name: string;
}

/** A paged list of Service Fabric names. The list is paged when all of the results cannot fit in a single message. The next set of results can be obtained by executing the same query with the continuation token provided in this list. */
export interface PagedSubNameInfoList {
  /** The continuation token parameter is used to obtain next set of results. The continuation token is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token is not included in the response. */
  continuationToken?: string;
  /** Indicates whether any name under the given name has been modified during the enumeration. If there was a modification, this property value is false. */
  isConsistent?: boolean;
  /** List of the child names. */
  subNames?: string[];
}

/** The paged list of Service Fabric properties under a given name. The list is paged when all of the results cannot fit in a single message. The next set of results can be obtained by executing the same query with the continuation token provided in this list. */
export interface PagedPropertyInfoList {
  /** The continuation token parameter is used to obtain next set of results. The continuation token is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token is not included in the response. */
  continuationToken?: string;
  /** Indicates whether any property under the given name has been modified during the enumeration. If there was a modification, this property value is false. */
  isConsistent?: boolean;
  /** List of property information. */
  properties?: PropertyInfo[];
}

/** Information about a Service Fabric property. */
export interface PropertyInfo {
  /** The name of the Service Fabric property. */
  name: string;
  /** Describes a Service Fabric property value. */
  value?: PropertyValueUnion;
  /** The metadata associated with a property, including the property's name. */
  metadata: PropertyMetadata;
}

/** Describes a Service Fabric property value. */
export interface PropertyValue {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Binary" | "Int64" | "Double" | "String" | "Guid";
}

/** The metadata associated with a property, including the property's name. */
export interface PropertyMetadata {
  /** The kind of property, determined by the type of data. Following are the possible values. */
  typeId?: PropertyValueKind;
  /** The property's custom type ID. */
  customTypeId?: string;
  /** The name of the parent Service Fabric Name for the property. It could be thought of as the name-space/table under which the property exists. */
  parent?: string;
  /** The length of the serialized property value. */
  sizeInBytes?: number;
  /** Represents when the Property was last modified. Only write operations will cause this field to be updated. */
  lastModifiedUtcTimestamp?: Date;
  /** The version of the property. Every time a property is modified, its sequence number is increased. */
  sequenceNumber?: string;
}

/** Description of a Service Fabric property. */
export interface PropertyDescription {
  /** The name of the Service Fabric property. */
  propertyName: string;
  /** The property's custom type ID. Using this property, the user is able to tag the type of the value of the property. */
  customTypeId?: string;
  /** Describes a Service Fabric property value. */
  value: PropertyValueUnion;
}

/** Describes a list of property batch operations to be executed. Either all or none of the operations will be committed. */
export interface PropertyBatchDescriptionList {
  /** A list of the property batch operations to be executed. */
  operations?: PropertyBatchOperationUnion[];
}

/** Represents the base type for property operations that can be put into a batch and submitted. */
export interface PropertyBatchOperation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind:
    | "CheckExists"
    | "CheckSequence"
    | "CheckValue"
    | "Delete"
    | "Get"
    | "Put";
  /** The name of the Service Fabric property. */
  propertyName: string;
}

/** Information about the results of a property batch. */
export interface PropertyBatchInfo {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Successful" | "Failed";
}

/** Represents the base for all Fabric Events. */
export interface FabricEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind:
    | "ClusterEvent"
    | "ContainerInstanceEvent"
    | "NodeEvent"
    | "ApplicationEvent"
    | "ServiceEvent"
    | "PartitionEvent"
    | "ReplicaEvent"
    | "PartitionAnalysisEvent"
    | "ApplicationCreated"
    | "ApplicationDeleted"
    | "ApplicationNewHealthReport"
    | "ApplicationHealthReportExpired"
    | "ApplicationUpgradeCompleted"
    | "ApplicationUpgradeDomainCompleted"
    | "ApplicationUpgradeRollbackCompleted"
    | "ApplicationUpgradeRollbackStarted"
    | "ApplicationUpgradeStarted"
    | "DeployedApplicationNewHealthReport"
    | "DeployedApplicationHealthReportExpired"
    | "ApplicationProcessExited"
    | "ApplicationContainerInstanceExited"
    | "NodeAborted"
    | "NodeAddedToCluster"
    | "NodeClosed"
    | "NodeDeactivateCompleted"
    | "NodeDeactivateStarted"
    | "NodeDown"
    | "NodeNewHealthReport"
    | "NodeHealthReportExpired"
    | "NodeOpenSucceeded"
    | "NodeOpenFailed"
    | "NodeRemovedFromCluster"
    | "NodeUp"
    | "PartitionNewHealthReport"
    | "PartitionHealthReportExpired"
    | "PartitionReconfigured"
    | "PartitionPrimaryMoveAnalysis"
    | "ServiceCreated"
    | "ServiceDeleted"
    | "ServiceNewHealthReport"
    | "ServiceHealthReportExpired"
    | "DeployedServicePackageNewHealthReport"
    | "DeployedServicePackageHealthReportExpired"
    | "StatefulReplicaNewHealthReport"
    | "StatefulReplicaHealthReportExpired"
    | "StatelessReplicaNewHealthReport"
    | "StatelessReplicaHealthReportExpired"
    | "ClusterNewHealthReport"
    | "ClusterHealthReportExpired"
    | "ClusterUpgradeCompleted"
    | "ClusterUpgradeDomainCompleted"
    | "ClusterUpgradeRollbackCompleted"
    | "ClusterUpgradeRollbackStarted"
    | "ClusterUpgradeStarted"
    | "ChaosStopped"
    | "ChaosStarted"
    | "ChaosCodePackageRestartScheduled"
    | "ChaosReplicaRemovalScheduled"
    | "ChaosPartitionSecondaryMoveScheduled"
    | "ChaosPartitionPrimaryMoveScheduled"
    | "ChaosReplicaRestartScheduled"
    | "ChaosNodeRestartScheduled";
  /** The identifier for the FabricEvent instance. */
  eventInstanceId: string;
  /** The category of event. */
  category?: string;
  /** The time event was logged. */
  timeStamp: Date;
  /** Shows there is existing related events available. */
  hasCorrelatedEvents?: boolean;
}

/** This type describes a secret resource. */
export interface SecretResourceDescription {
  /** Describes the properties of a secret resource. */
  properties: SecretResourcePropertiesUnion;
  /** Name of the Secret resource. */
  name: string;
}

/** This type describes the properties of a secret resource, including its kind. */
export interface SecretResourcePropertiesBase {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "SecretResourceProperties" | "inlinedValue";
}

/** The list of secret resources. The list is paged when all of the results cannot fit in a single message. The next set of results can be obtained by executing the same query with the continuation token provided in this list. */
export interface PagedSecretResourceDescriptionList {
  /** The continuation token parameter is used to obtain next set of results. The continuation token is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token is not included in the response. */
  continuationToken?: string;
  /** One page of the list. */
  items?: SecretResourceDescription[];
}

/** This type describes a value of a secret resource. The name of this resource is the version identifier corresponding to this secret value. */
export interface SecretValueResourceDescription {
  /** Version identifier of the secret value. */
  name: string;
  /** The actual value of the secret. */
  value?: string;
}

/** This type describes properties of secret value resource. */
export interface SecretValueProperties {
  /** The actual value of the secret. */
  value?: string;
}

/** The list of values of a secret resource, paged if the number of results exceeds the limits of a single message. The next set of results can be obtained by executing the same query with the continuation token provided in the previous page. */
export interface PagedSecretValueResourceDescriptionList {
  /** The continuation token parameter is used to obtain next set of results. The continuation token is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token is not included in the response. */
  continuationToken?: string;
  /** One page of the list. */
  items?: SecretValueResourceDescription[];
}

/** This type represents the unencrypted value of the secret. */
export interface SecretValue {
  /** The actual value of the secret. */
  value?: string;
}

/** This type describes a volume resource. */
export interface VolumeResourceDescription {
  /** Name of the Volume resource. */
  name: string;
  /** User readable description of the volume. */
  description?: string;
  /**
   * Status of the volume.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly status?: ResourceStatus;
  /**
   * Gives additional information about the current status of the volume.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly statusDetails?: string;
  /** Provider of the volume. */
  provider: VolumeProvider;
  /** This type describes a volume provided by an Azure Files file share. */
  azureFileParameters?: VolumeProviderParametersAzureFile;
}

/** This type describes a volume provided by an Azure Files file share. */
export interface VolumeProviderParametersAzureFile {
  /** Name of the Azure storage account for the File Share. */
  accountName: string;
  /** Access key of the Azure storage account for the File Share. */
  accountKey?: string;
  /** Name of the Azure Files file share that provides storage for the volume. */
  shareName: string;
}

/** The list of volume resources. The list is paged when all of the results cannot fit in a single message. The next set of results can be obtained by executing the same query with the continuation token provided in this list. */
export interface PagedVolumeResourceDescriptionList {
  /** The continuation token parameter is used to obtain next set of results. The continuation token is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token is not included in the response. */
  continuationToken?: string;
  /** One page of the list. */
  items?: VolumeResourceDescription[];
}

/** This type describes a network resource. */
export interface NetworkResourceDescription {
  /** Name of the Network resource. */
  name: string;
  /** Describes properties of a network resource. */
  properties: NetworkResourcePropertiesUnion;
}

/** This type describes the properties of a network resource, including its kind. */
export interface NetworkResourcePropertiesBase {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "NetworkResourceProperties" | "Local";
}

/** The list of network resources. The list is paged when all of the results cannot fit in a single message. The next set of results can be obtained by executing the same query with the continuation token provided in this list. */
export interface PagedNetworkResourceDescriptionList {
  /** The continuation token parameter is used to obtain next set of results. The continuation token is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token is not included in the response. */
  continuationToken?: string;
  /** One page of the list. */
  items?: NetworkResourceDescription[];
}

/** This type describes a application resource. */
export interface ApplicationResourceDescription {
  /** Name of the Application resource. */
  name: string;
  /** Describes the identity of the application. */
  identity?: IdentityDescription;
  /** User readable description of the application. */
  description?: string;
  /** Describes the services in the application. This property is used to create or modify services of the application. On get only the name of the service is returned. The service description can be obtained by querying for the service resource. */
  services?: ServiceResourceDescription[];
  /** Describes the diagnostics definition and usage for an application resource. */
  diagnostics?: DiagnosticsDescription;
  /** Internal - used by Visual Studio to setup the debugging session on the local development environment. */
  debugParams?: string;
  /**
   * Names of the services in the application.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly serviceNames?: string[];
  /**
   * Status of the application.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly status?: ResourceStatus;
  /**
   * Gives additional information about the current status of the application.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly statusDetails?: string;
  /**
   * Describes the health state of an application resource.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly healthState?: HealthState;
  /**
   * When the application's health state is not 'Ok', this additional details from service fabric Health Manager for the user to know why the application is marked unhealthy.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly unhealthyEvaluation?: string;
}

/** This type describes a service resource. */
export interface ServiceResourceDescription {
  /** Name of the Service resource. */
  name: string;
  /** The operation system required by the code in service. */
  osType: OperatingSystemType;
  /** Describes the set of code packages that forms the service. A code package describes the container and the properties for running it. All the code packages are started together on the same host and share the same context (network, process etc.). */
  codePackages: ContainerCodePackageProperties[];
  /** The names of the private networks that this service needs to be part of. */
  networkRefs?: NetworkRef[];
  /** Reference to sinks in DiagnosticsDescription. */
  diagnostics?: DiagnosticsRef;
  /** User readable description of the service. */
  description?: string;
  /** The number of replicas of the service to create. Defaults to 1 if not specified. */
  replicaCount?: number;
  /** The execution policy of the service */
  executionPolicy?: ExecutionPolicyUnion;
  /** Auto scaling policies */
  autoScalingPolicies?: AutoScalingPolicy[];
  /**
   * Status of the service.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly status?: ResourceStatus;
  /**
   * Gives additional information about the current status of the service.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly statusDetails?: string;
  /**
   * Describes the health state of an application resource.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly healthState?: HealthState;
  /**
   * When the service's health state is not 'Ok', this additional details from service fabric Health Manager for the user to know why the service is marked unhealthy.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly unhealthyEvaluation?: string;
  /** The service identity list. */
  identityRefs?: ServiceIdentity[];
  /** Dns name of the service. */
  dnsName?: string;
}

/** Describes the properties of a service replica. */
export interface ServiceReplicaProperties {
  /** The operation system required by the code in service. */
  osType: OperatingSystemType;
  /** Describes the set of code packages that forms the service. A code package describes the container and the properties for running it. All the code packages are started together on the same host and share the same context (network, process etc.). */
  codePackages: ContainerCodePackageProperties[];
  /** The names of the private networks that this service needs to be part of. */
  networkRefs?: NetworkRef[];
  /** Reference to sinks in DiagnosticsDescription. */
  diagnostics?: DiagnosticsRef;
}

/** Describes a container and its runtime properties. */
export interface ContainerCodePackageProperties {
  /** The name of the code package. */
  name: string;
  /** The Container image to use. */
  image: string;
  /** Image registry credential. */
  imageRegistryCredential?: ImageRegistryCredential;
  /** Override for the default entry point in the container. */
  entryPoint?: string;
  /** Command array to execute within the container in exec form. */
  commands?: string[];
  /** The environment variables to set in this container */
  environmentVariables?: EnvironmentVariable[];
  /** The settings to set in this container. The setting file path can be fetched from environment variable "Fabric_SettingPath". The path for Windows container is "C:\\secrets". The path for Linux container is "/var/secrets". */
  settings?: Setting[];
  /** The labels to set in this container. */
  labels?: ContainerLabel[];
  /** The endpoints exposed by this container. */
  endpoints?: EndpointProperties[];
  /** The resources required by this container. */
  resources: ResourceRequirements;
  /** Volumes to be attached to the container. The lifetime of these volumes is independent of the application's lifetime. */
  volumeRefs?: VolumeReference[];
  /** Volumes to be attached to the container. The lifetime of these volumes is scoped to the application's lifetime. */
  volumes?: ApplicationScopedVolume[];
  /** Reference to sinks in DiagnosticsDescription. */
  diagnostics?: DiagnosticsRef;
  /** A list of ReliableCollection resources used by this particular code package. Please refer to ReliableCollectionsRef for more details. */
  reliableCollectionsRefs?: ReliableCollectionsRef[];
  /**
   * Runtime information of a container instance.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly instanceView?: ContainerInstanceView;
  /** An array of liveness probes for a code package. It determines when to restart a code package. */
  livenessProbe?: Probe[];
  /** An array of readiness probes for a code package. It determines when to unpublish an endpoint. */
  readinessProbe?: Probe[];
}

/** Image registry credential. */
export interface ImageRegistryCredential {
  /** Docker image registry server, without protocol such as `http` and `https`. */
  server: string;
  /** The username for the private registry. */
  username: string;
  /** The type of the image registry password being given in password */
  passwordType?: ImageRegistryPasswordType;
  /** The password for the private registry. The password is required for create or update operations, however it is not returned in the get or list operations. Will be processed based on the type provided. */
  password?: string;
}

/** Describes an environment variable for the container. */
export interface EnvironmentVariable {
  /** The type of the environment variable being given in value */
  type?: EnvironmentVariableType;
  /** The name of the environment variable. */
  name?: string;
  /** The value of the environment variable, will be processed based on the type provided. */
  value?: string;
}

/** Describes a setting for the container. The setting file path can be fetched from environment variable "Fabric_SettingPath". The path for Windows container is "C:\\secrets". The path for Linux container is "/var/secrets". */
export interface Setting {
  /** The type of the setting being given in value */
  type?: SettingType;
  /** The name of the setting. */
  name?: string;
  /** The value of the setting, will be processed based on the type provided. */
  value?: string;
}

/** Describes a container label. */
export interface ContainerLabel {
  /** The name of the container label. */
  name: string;
  /** The value of the container label. */
  value: string;
}

/** Describes a container endpoint. */
export interface EndpointProperties {
  /** The name of the endpoint. */
  name: string;
  /** Port used by the container. */
  port?: number;
}

/** This type describes the resource requirements for a container or a service. */
export interface ResourceRequirements {
  /** Describes the requested resources for a given container. */
  requests: ResourceRequests;
  /** Describes the maximum limits on the resources for a given container. */
  limits?: ResourceLimits;
}

/** This type describes the requested resources for a given container. It describes the least amount of resources required for the container. A container can consume more than requested resources up to the specified limits before being restarted. Currently, the requested resources are treated as limits. */
export interface ResourceRequests {
  /** The memory request in GB for this container. */
  memoryInGB: number;
  /** Requested number of CPU cores. At present, only full cores are supported. */
  cpu: number;
}

/** This type describes the resource limits for a given container. It describes the most amount of resources a container is allowed to use before being restarted. */
export interface ResourceLimits {
  /** The memory limit in GB. */
  memoryInGB?: number;
  /** CPU limits in cores. At present, only full cores are supported. */
  cpu?: number;
}

/** Describes a reference to a volume resource. */
export interface VolumeReference {
  /** Name of the volume being referenced. */
  name: string;
  /** The flag indicating whether the volume is read only. Default is 'false'. */
  readOnly?: boolean;
  /** The path within the container at which the volume should be mounted. Only valid path characters are allowed. */
  destinationPath: string;
}

/** Describes parameters for creating application-scoped volumes. */
export interface ApplicationScopedVolumeCreationParameters {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ServiceFabricVolumeDisk";
  /** User readable description of the volume. */
  description?: string;
}

/** Reference to sinks in DiagnosticsDescription. */
export interface DiagnosticsRef {
  /** Status of whether or not sinks are enabled. */
  enabled?: boolean;
  /** List of sinks to be used if enabled. References the list of sinks in DiagnosticsDescription. */
  sinkRefs?: string[];
}

/** Specifying this parameter adds support for reliable collections */
export interface ReliableCollectionsRef {
  /** Name of ReliableCollection resource. Right now it's not used and you can use any string. */
  name: string;
  /** False (the default) if ReliableCollections state is persisted to disk as usual. True if you do not want to persist state, in which case replication is still enabled and you can use ReliableCollections as distributed cache. */
  doNotPersistState?: boolean;
}

/** Runtime information of a container instance. */
export interface ContainerInstanceView {
  /** The number of times the container has been restarted. */
  restartCount?: number;
  /** Current container instance state. */
  currentState?: ContainerState;
  /** Previous container instance state. */
  previousState?: ContainerState;
  /** The events of this container instance. */
  events?: ContainerEvent[];
}

/** The container state. */
export interface ContainerState {
  /** The state of this container */
  state?: string;
  /** Date/time when the container state started. */
  startTime?: Date;
  /** The container exit code. */
  exitCode?: string;
  /** Date/time when the container state finished. */
  finishTime?: Date;
  /** Human-readable status of this state. */
  detailStatus?: string;
}

/** A container event. */
export interface ContainerEvent {
  /** The name of the container event. */
  name?: string;
  /** The count of the event. */
  count?: number;
  /** Date/time of the first event. */
  firstTimestamp?: string;
  /** Date/time of the last event. */
  lastTimestamp?: string;
  /** The event message */
  message?: string;
  /** The event type. */
  type?: string;
}

/** Probes have a number of fields that you can use to control their behavior. */
export interface Probe {
  /** The initial delay in seconds to start executing probe once codepackage has started. */
  initialDelaySeconds?: number;
  /** Periodic seconds to execute probe. */
  periodSeconds?: number;
  /** Period after which probe is considered as failed if it hasn't completed successfully. */
  timeoutSeconds?: number;
  /** The count of successful probe executions after which probe is considered success. */
  successThreshold?: number;
  /** The count of failures after which probe is considered failed. */
  failureThreshold?: number;
  /** Exec command to run inside the container. */
  exec?: ProbeExec;
  /** Http probe for the container. */
  httpGet?: ProbeHttpGet;
  /** Tcp port to probe inside the container. */
  tcpSocket?: ProbeTcpSocket;
}

/** Exec command to run inside the container. */
export interface ProbeExec {
  /** Comma separated command to run inside the container for example "sh, -c, echo hello world". */
  command: string;
}

/** Http probe for the container. */
export interface ProbeHttpGet {
  /** Port to access for probe. */
  port: number;
  /** Path to access on the HTTP request. */
  path?: string;
  /** Host IP to connect to. */
  host?: string;
  /** Headers to set in the request. */
  httpHeaders?: ProbeHttpGetHeaders[];
  /** Scheme for the http probe. Can be Http or Https. */
  scheme?: Scheme;
}

/** Http headers. */
export interface ProbeHttpGetHeaders {
  /** The name of the header. */
  name: string;
  /** The value of the header. */
  value: string;
}

/** Tcp port to probe inside the container. */
export interface ProbeTcpSocket {
  /** Port to access for probe. */
  port: number;
}

/** Describes a network reference in a service. */
export interface NetworkRef {
  /** Name of the network */
  name?: string;
  /** A list of endpoints that are exposed on this network. */
  endpointRefs?: EndpointRef[];
}

/** Describes a reference to a service endpoint. */
export interface EndpointRef {
  /** Name of the endpoint. */
  name?: string;
}

/** Describes properties of a service resource. */
export interface ServiceProperties {
  /** User readable description of the service. */
  description?: string;
  /** The number of replicas of the service to create. Defaults to 1 if not specified. */
  replicaCount?: number;
  /** The execution policy of the service */
  executionPolicy?: ExecutionPolicyUnion;
  /** Auto scaling policies */
  autoScalingPolicies?: AutoScalingPolicy[];
  /**
   * Status of the service.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly status?: ResourceStatus;
  /**
   * Gives additional information about the current status of the service.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly statusDetails?: string;
  /**
   * Describes the health state of an application resource.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly healthState?: HealthState;
  /**
   * When the service's health state is not 'Ok', this additional details from service fabric Health Manager for the user to know why the service is marked unhealthy.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly unhealthyEvaluation?: string;
  /** The service identity list. */
  identityRefs?: ServiceIdentity[];
  /** Dns name of the service. */
  dnsName?: string;
}

/** The execution policy of the service */
export interface ExecutionPolicy {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  type: "Default" | "RunToCompletion";
}

/** Describes the auto scaling policy */
export interface AutoScalingPolicy {
  /** The name of the auto scaling policy. */
  name: string;
  /** Determines when auto scaling operation will be invoked. */
  trigger: AutoScalingTriggerUnion;
  /** The mechanism that is used to scale when auto scaling operation is invoked. */
  mechanism: AutoScalingMechanismUnion;
}

/** Describes the trigger for performing auto scaling operation. */
export interface AutoScalingTrigger {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "AverageLoad";
}

/** Describes the mechanism for performing auto scaling operation. Derived classes will describe the actual mechanism. */
export interface AutoScalingMechanism {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "AddRemoveReplica";
}

/** Map service identity friendly name to an application identity. */
export interface ServiceIdentity {
  /** The identity friendly name. */
  name?: string;
  /** The application identity name. */
  identityRef?: string;
}

/** Describes the diagnostics options available */
export interface DiagnosticsDescription {
  /** List of supported sinks that can be referenced. */
  sinks?: DiagnosticsSinkPropertiesUnion[];
  /** Status of whether or not sinks are enabled. */
  enabled?: boolean;
  /** The sinks to be used if diagnostics is enabled. Sink choices can be overridden at the service and code package level. */
  defaultSinkRefs?: string[];
}

/** Properties of a DiagnosticsSink. */
export interface DiagnosticsSinkProperties {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "AzureInternalMonitoringPipeline";
  /** Name of the sink. This value is referenced by DiagnosticsReferenceDescription */
  name?: string;
  /** A description of the sink. */
  description?: string;
}

/** Information describing the identities associated with this application. */
export interface IdentityDescription {
  /** the endpoint for the token service managing this identity */
  tokenServiceEndpoint?: string;
  /** the types of identities associated with this resource; currently restricted to 'SystemAssigned and UserAssigned' */
  type: string;
  /** the identifier of the tenant containing the application's identity. */
  tenantId?: string;
  /** the object identifier of the Service Principal of the identity associated with this resource. */
  principalId?: string;
  /** represents user assigned identities map. */
  userAssignedIdentities?: { [propertyName: string]: IdentityItemDescription };
}

/** Describes a single user-assigned identity associated with the application. */
export interface IdentityItemDescription {
  /** the object identifier of the Service Principal which this identity represents. */
  principalId?: string;
  /** the client identifier of the Service Principal which this identity represents. */
  clientId?: string;
}

/** The list of application resources. The list is paged when all of the results cannot fit in a single message. The next set of results can be obtained by executing the same query with the continuation token provided in this list. */
export interface PagedApplicationResourceDescriptionList {
  /** The continuation token parameter is used to obtain next set of results. The continuation token is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token is not included in the response. */
  continuationToken?: string;
  /** One page of the list. */
  items?: ApplicationResourceDescription[];
}

/** This type describes an application resource upgrade. */
export interface ApplicationResourceUpgradeProgressInfo {
  /** Name of the Application resource. */
  name?: string;
  /** The target application version for the application upgrade. */
  targetApplicationTypeVersion?: string;
  /** The estimated UTC datetime when the upgrade started. */
  startTimestampUtc?: string;
  /** The state of the application resource upgrade. */
  upgradeState?: ApplicationResourceUpgradeState;
  /** The estimated percent of replicas are completed in the upgrade. */
  percentCompleted?: string;
  /** List of service upgrade progresses. */
  serviceUpgradeProgress?: ServiceUpgradeProgress[];
  /** The mode used to monitor health during a rolling upgrade. The values are UnmonitoredAuto, UnmonitoredManual, and Monitored. */
  rollingUpgradeMode?: RollingUpgradeMode;
  /** The estimated amount of time that the overall upgrade elapsed. It is first interpreted as a string representing an ISO 8601 duration. If that fails, then it is interpreted as a number representing the total number of milliseconds. */
  upgradeDuration?: string;
  /** Additional detailed information about the status of the pending upgrade. */
  applicationUpgradeStatusDetails?: string;
  /** The maximum amount of time to block processing of an upgrade domain and prevent loss of availability when there are unexpected issues. When this timeout expires, processing of the upgrade domain will proceed regardless of availability loss issues. The timeout is reset at the start of each upgrade domain. Valid values are between 0 and 42949672925 inclusive. (unsigned 32-bit integer). */
  upgradeReplicaSetCheckTimeoutInSeconds?: number;
  /** The estimated UTC datetime when the upgrade failed and FailureAction was executed. */
  failureTimestampUtc?: string;
}

/** Information about how many replicas are completed or pending for a specific service during upgrade. */
export interface ServiceUpgradeProgress {
  /** Name of the Service resource. */
  serviceName?: string;
  /** The number of replicas that completes the upgrade in the service. */
  completedReplicaCount?: string;
  /** The number of replicas that are waiting to be upgraded in the service. */
  pendingReplicaCount?: string;
}

/** The list of service resources. The list is paged when all of the results cannot fit in a single message. The next set of results can be obtained by executing the same query with the continuation token provided in this list. */
export interface PagedServiceResourceDescriptionList {
  /** The continuation token parameter is used to obtain next set of results. The continuation token is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token is not included in the response. */
  continuationToken?: string;
  /** One page of the list. */
  items?: ServiceResourceDescription[];
}

/** The list of service resource replicas in the cluster. The list is paged when all of the results cannot fit in a single message. The next set of results can be obtained by executing the same query with the continuation token provided in this list. */
export interface PagedServiceReplicaDescriptionList {
  /** The continuation token parameter is used to obtain next set of results. The continuation token is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token is not included in the response. */
  continuationToken?: string;
  /** List of service resource replica description. */
  items?: ServiceReplicaDescription[];
}

/** This type describes a gateway resource. */
export interface GatewayResourceDescription {
  /** Name of the Gateway resource. */
  name: string;
  /** User readable description of the gateway. */
  description?: string;
  /** Network the gateway should listen on for requests. */
  sourceNetwork: NetworkRef;
  /** Network that the Application is using. */
  destinationNetwork: NetworkRef;
  /** Configuration for tcp connectivity for this gateway. */
  tcp?: TcpConfig[];
  /** Configuration for http connectivity for this gateway. */
  http?: HttpConfig[];
  /**
   * Status of the resource.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly status?: ResourceStatus;
  /**
   * Gives additional information about the current status of the gateway.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly statusDetails?: string;
  /**
   * IP address of the gateway. This is populated in the response and is ignored for incoming requests.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly ipAddress?: string;
}

/** Describes the tcp configuration for external connectivity for this network. */
export interface TcpConfig {
  /** tcp gateway config name. */
  name: string;
  /** Specifies the port at which the service endpoint below needs to be exposed. */
  port: number;
  /** Describes destination endpoint for routing traffic. */
  destination: GatewayDestination;
}

/** Describes destination endpoint for routing traffic. */
export interface GatewayDestination {
  /** Name of the service fabric Mesh application. */
  applicationName: string;
  /** service that contains the endpoint. */
  serviceName: string;
  /** name of the endpoint in the service. */
  endpointName: string;
}

/** Describes the http configuration for external connectivity for this network. */
export interface HttpConfig {
  /** http gateway config name. */
  name: string;
  /** Specifies the port at which the service endpoint below needs to be exposed. */
  port: number;
  /** description for routing. */
  hosts: HttpHostConfig[];
}

/** Describes the hostname properties for http routing. */
export interface HttpHostConfig {
  /** http hostname config name. */
  name: string;
  /** Route information to use for routing. Routes are processed in the order they are specified. Specify routes that are more specific before routes that can handle general cases. */
  routes: HttpRouteConfig[];
}

/** Describes the hostname properties for http routing. */
export interface HttpRouteConfig {
  /** http route name. */
  name: string;
  /** Describes a rule for http route matching. */
  match: HttpRouteMatchRule;
  /** Describes destination endpoint for routing traffic. */
  destination: GatewayDestination;
}

/** Describes a rule for http route matching. */
export interface HttpRouteMatchRule {
  /** Path to match for routing. */
  path: HttpRouteMatchPath;
  /** headers and their values to match in request. */
  headers?: HttpRouteMatchHeader[];
}

/** Path to match for routing. */
export interface HttpRouteMatchPath {
  /** Uri path to match for request. */
  value: string;
  /** replacement string for matched part of the Uri. */
  rewrite?: string;
  /** how to match value in the Uri */
  type: PathMatchType;
}

/** Describes header information for http route matching. */
export interface HttpRouteMatchHeader {
  /** Name of header to match in request. */
  name: string;
  /** Value of header to match in request. */
  value?: string;
  /** how to match header value */
  type?: HeaderMatchType;
}

/** The list of gateway resources. The list is paged when all of the results cannot fit in a single message. The next set of results can be obtained by executing the same query with the continuation token provided in this list. */
export interface PagedGatewayResourceDescriptionList {
  /** The continuation token parameter is used to obtain next set of results. The continuation token is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token is not included in the response. */
  continuationToken?: string;
  /** One page of the list. */
  items?: GatewayResourceDescription[];
}

/** Metadata about an Analysis Event. */
export interface AnalysisEventMetadata {
  /** The analysis delay. */
  delay?: string;
  /** The duration of analysis. */
  duration?: string;
}

/** Information about current reconfiguration like phase, type, previous configuration role of replica and reconfiguration start date time. */
export interface ReconfigurationInformation {
  /** Replica role before reconfiguration started. */
  previousConfigurationRole?: ReplicaRole;
  /** Current phase of ongoing reconfiguration. If no reconfiguration is taking place then this value will be "None". */
  reconfigurationPhase?: ReconfigurationPhase;
  /** Type of current ongoing reconfiguration. If no reconfiguration is taking place then this value will be "None". */
  reconfigurationType?: ReconfigurationType;
  /** Start time (in UTC) of the ongoing reconfiguration. If no reconfiguration is taking place then this value will be zero date-time. */
  reconfigurationStartTimeUtc?: Date;
}

/** Represents data structure that contains query information. */
export interface LoadedPartitionInformationQueryDescription {
  /** Name of the metric for which this information is provided. */
  metricName?: string;
  /** Name of the service this partition belongs to. */
  serviceName?: string;
  /** Ordering of partitions' load. */
  ordering?: Ordering;
  /** The maximum number of results to be returned as part of the paged queries. This parameter defines the upper bound on the number of results returned. The results returned can be less than the specified maximum results if they do not fit in the message as per the max message size restrictions defined in the configuration. If this parameter is zero or not specified, the paged query includes as many results as possible that fit in the return message. */
  maxResults?: number;
  /** The continuation token parameter is used to obtain next set of results. The continuation token is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token is not included in the response. */
  continuationToken?: string;
}

/** Path description for the application package in the image store specified during the prior copy operation. */
export interface ApplicationTypeImageStorePath {
  /** The relative image store path to the application package. */
  applicationTypeBuildPath: string;
}

/** Describes how the replica will behave */
export interface ReplicaLifecycleDescription {
  /** If set to true, replicas with a target replica set size of 1 will be permitted to move during upgrade. */
  isSingletonReplicaMoveAllowedDuringUpgrade?: boolean;
  /** If set to true, move/swap replica to original location after upgrade. */
  restoreReplicaLocationAfterUpgrade?: boolean;
}

/** Describes how the instance will behave */
export interface InstanceLifecycleDescription {
  /** If set to true, move/swap replica to original location after upgrade. */
  restoreReplicaLocationAfterUpgrade?: boolean;
}

/**
 * Provides various statistics of the queue used in the service fabric replicator.
 * Contains information about the service fabric replicator like the replication/copy queue utilization, last acknowledgement received timestamp, etc.
 * Depending on the role of the replicator, the properties in this type imply different meanings.
 */
export interface ReplicatorQueueStatus {
  /** Represents the utilization of the queue. A value of 0 indicates that the queue is empty and a value of 100 indicates the queue is full. */
  queueUtilizationPercentage?: number;
  /** Represents the virtual memory consumed by the queue in bytes. */
  queueMemorySize?: string;
  /**
   * On a primary replicator, this is semantically the sequence number of the operation for which all the secondary replicas have sent an acknowledgement.
   * On a secondary replicator, this is the smallest sequence number of the operation that is present in the queue.
   */
  firstSequenceNumber?: string;
  /**
   * On a primary replicator, this is semantically the highest sequence number of the operation for which all the secondary replicas have sent an acknowledgement.
   * On a secondary replicator, this is semantically the highest sequence number that has been applied to the persistent state.
   */
  completedSequenceNumber?: string;
  /**
   * On a primary replicator, this is semantically the highest sequence number of the operation for which a write quorum of the secondary replicas have sent an acknowledgement.
   * On a secondary replicator, this is semantically the highest sequence number of the in-order operation received from the primary.
   */
  committedSequenceNumber?: string;
  /** Represents the latest sequence number of the operation that is available in the queue. */
  lastSequenceNumber?: string;
}

/**
 * Represents a base class for primary or secondary replicator status.
 * Contains information about the service fabric replicator like the replication/copy queue utilization, last acknowledgement received timestamp, etc.
 */
export interface ReplicatorStatus {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind:
    | "Primary"
    | "SecondaryReplicatorStatus"
    | "ActiveSecondary"
    | "IdleSecondary";
}

/** Represents the state of the secondary replicator from the primary replicator’s point of view. */
export interface RemoteReplicatorStatus {
  /** Represents the replica ID of the remote secondary replicator. */
  replicaId?: string;
  /**
   * The last timestamp (in UTC) when an acknowledgement from the secondary replicator was processed on the primary.
   * UTC 0 represents an invalid value, indicating that no acknowledgement messages were ever processed.
   */
  lastAcknowledgementProcessedTimeUtc?: Date;
  /** The highest replication operation sequence number that the secondary has received from the primary. */
  lastReceivedReplicationSequenceNumber?: string;
  /** The highest replication operation sequence number that the secondary has applied to its state. */
  lastAppliedReplicationSequenceNumber?: string;
  /** A value that indicates whether the secondary replica is in the process of being built. */
  isInBuild?: boolean;
  /**
   * The highest copy operation sequence number that the secondary has received from the primary.
   * A value of -1 implies that the secondary has received all copy operations.
   */
  lastReceivedCopySequenceNumber?: string;
  /**
   * The highest copy operation sequence number that the secondary has applied to its state.
   * A value of -1 implies that the secondary has applied all copy operations and the copy process is complete.
   */
  lastAppliedCopySequenceNumber?: string;
  /** Represents the acknowledgment status for the remote secondary replicator. */
  remoteReplicatorAcknowledgementStatus?: RemoteReplicatorAcknowledgementStatus;
}

/** Provides details about the remote replicators from the primary replicator's point of view. */
export interface RemoteReplicatorAcknowledgementStatus {
  /** Details about the acknowledgements for operations that are part of the replication stream data. */
  replicationStreamAcknowledgementDetail?: RemoteReplicatorAcknowledgementDetail;
  /** Details about the acknowledgements for operations that are part of the copy stream data. */
  copyStreamAcknowledgementDetail?: RemoteReplicatorAcknowledgementDetail;
}

/** Provides various statistics of the acknowledgements that are being received from the remote replicator. */
export interface RemoteReplicatorAcknowledgementDetail {
  /** Represents the average duration it takes for the remote replicator to receive an operation. */
  averageReceiveDuration?: string;
  /** Represents the average duration it takes for the remote replicator to apply an operation. This usually entails writing the operation to disk. */
  averageApplyDuration?: string;
  /** Represents the number of operations not yet received by a remote replicator. */
  notReceivedCount?: string;
  /** Represents the number of operations received and not yet applied by a remote replicator. */
  receivedAndNotAppliedCount?: string;
}

/** Information about the replica. */
export interface ReplicaStatusBase {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "KeyValueStore";
}

/**
 * Describes the expected impact of a repair to a particular node.
 *
 * This type supports the Service Fabric platform; it is not meant to be used directly from your code.
 */
export interface NodeImpact {
  /** The name of the impacted node. */
  nodeName: string;
  /** The level of impact expected. */
  impactLevel?: ImpactLevel;
}

/** Describes the metric that is used for triggering auto scaling operation. Derived classes will describe resources or metrics. */
export interface AutoScalingMetric {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Resource";
}

/** Represents the health state of a node, which contains the node identifier and its aggregated health state. */
export interface NodeHealthState extends EntityHealthState {
  /** The name of a Service Fabric node. */
  name?: string;
  /** An internal ID used by Service Fabric to uniquely identify a node. Node Id is deterministically generated from node name. */
  id?: NodeId;
}

/** Represents the health state of an application, which contains the application identifier and the aggregated health state. */
export interface ApplicationHealthState extends EntityHealthState {
  /** The name of the application, including the 'fabric:' URI scheme. */
  name?: string;
}

/** Represents the health state of a service, which contains the service identifier and its aggregated health state. */
export interface ServiceHealthState extends EntityHealthState {
  /** Name of the service whose health state is represented by this object. */
  serviceName?: string;
}

/** Represents the health state of a deployed application, which contains the entity identifier and the aggregated health state. */
export interface DeployedApplicationHealthState extends EntityHealthState {
  /** Name of the node on which the service package is deployed. */
  nodeName?: string;
  /** The name of the application, including the 'fabric:' URI scheme. */
  applicationName?: string;
}

/** Represents the health state of a deployed service package, containing the entity identifier and the aggregated health state. */
export interface DeployedServicePackageHealthState extends EntityHealthState {
  /** Name of the node on which the service package is deployed. */
  nodeName?: string;
  /** The name of the application, including the 'fabric:' URI scheme. */
  applicationName?: string;
  /** Name of the manifest describing the service package. */
  serviceManifestName?: string;
  /**
   * The ActivationId of a deployed service package. If ServicePackageActivationMode specified at the time of creating the service
   * is 'SharedProcess' (or if it is not specified, in which case it defaults to 'SharedProcess'), then value of ServicePackageActivationId
   * is always an empty string.
   */
  servicePackageActivationId?: string;
}

/** Represents the health state of a partition, which contains the partition identifier and its aggregated health state. */
export interface PartitionHealthState extends EntityHealthState {
  /** Id of the partition whose health state is described by this object. */
  partitionId?: string;
}

/** Represents a base class for stateful service replica or stateless service instance health state. */
export interface ReplicaHealthState extends EntityHealthState {
  /** The kind of service (Stateless or Stateful). */
  serviceKind: ServiceKind;
  /** The ID of the partition to which this replica belongs. */
  partitionId?: string;
}

/**
 * Represents the health of the cluster.
 * Contains the cluster aggregated health state, the cluster application and node health states as well as the health events and the unhealthy evaluations.
 */
export interface ClusterHealth extends EntityHealth {
  /** Cluster node health states as found in the health store. */
  nodeHealthStates?: NodeHealthState[];
  /** Cluster application health states as found in the health store. */
  applicationHealthStates?: ApplicationHealthState[];
}

/** Information about the health of a Service Fabric node. */
export interface NodeHealth extends EntityHealth {
  /** Name of the node whose health information is described by this object. */
  name?: string;
}

/** Represents the health of the application. Contains the application aggregated health state and the service and deployed application health states. */
export interface ApplicationHealth extends EntityHealth {
  /** The name of the application, including the 'fabric:' URI scheme. */
  name?: string;
  /** Service health states as found in the health store. */
  serviceHealthStates?: ServiceHealthState[];
  /** Deployed application health states as found in the health store. */
  deployedApplicationHealthStates?: DeployedApplicationHealthState[];
}

/** Information about the health of an application deployed on a Service Fabric node. */
export interface DeployedApplicationHealth extends EntityHealth {
  /** Name of the application deployed on the node whose health information is described by this object. */
  name?: string;
  /** Name of the node where this application is deployed. */
  nodeName?: string;
  /** Deployed service package health states for the current deployed application as found in the health store. */
  deployedServicePackageHealthStates?: DeployedServicePackageHealthState[];
}

/** Information about the health of a Service Fabric service. */
export interface ServiceHealth extends EntityHealth {
  /** The name of the service whose health information is described by this object. */
  name?: string;
  /** The list of partition health states associated with the service. */
  partitionHealthStates?: PartitionHealthState[];
}

/** Information about the health of a Service Fabric partition. */
export interface PartitionHealth extends EntityHealth {
  /** ID of the partition whose health information is described by this object. */
  partitionId?: string;
  /** The list of replica health states associated with the partition. */
  replicaHealthStates?: ReplicaHealthStateUnion[];
}

/**
 * Represents a base class for stateful service replica or stateless service instance health.
 * Contains the replica aggregated health state, the health events and the unhealthy evaluations.
 */
export interface ReplicaHealth extends EntityHealth {
  /** The kind of service (Stateless or Stateful). */
  serviceKind: ServiceKind;
  /** Id of the partition to which this replica belongs. */
  partitionId?: string;
}

/** Information about the health of a service package for a specific application deployed on a Service Fabric node. */
export interface DeployedServicePackageHealth extends EntityHealth {
  /** The name of the application, including the 'fabric:' URI scheme. */
  applicationName?: string;
  /** Name of the service manifest. */
  serviceManifestName?: string;
  /** Name of the node where this service package is deployed. */
  nodeName?: string;
}

/** Represents health information reported on a health entity, such as cluster, application or node, with additional metadata added by the Health Manager. */
export interface HealthEvent extends HealthInformation {
  /** Returns true if the health event is expired, otherwise false. */
  isExpired?: boolean;
  /** The date and time when the health report was sent by the source. */
  sourceUtcTimestamp?: Date;
  /** The date and time when the health report was last modified by the health store. */
  lastModifiedUtcTimestamp?: Date;
  /**
   * If the current health state is 'Ok', this property returns the time at which the health report was first reported with 'Ok'.
   * For periodic reporting, many reports with the same state may have been generated.
   * This property returns the date and time when the first 'Ok' health report was received.
   *
   * If the current health state is 'Error' or 'Warning', returns the date and time at which the health state was last in 'Ok', before transitioning to a different state.
   *
   * If the health state was never 'Ok', the value will be zero date-time.
   */
  lastOkTransitionAt?: Date;
  /**
   * If the current health state is 'Warning', this property returns the time at which the health report was first reported with 'Warning'. For periodic reporting, many reports with the same state may have been generated however, this property returns only the date and time at the first 'Warning' health report was received.
   *
   * If the current health state is 'Ok' or 'Error', returns the date and time at which the health state was last in 'Warning', before transitioning to a different state.
   *
   * If the health state was never 'Warning', the value will be zero date-time.
   */
  lastWarningTransitionAt?: Date;
  /**
   * If the current health state is 'Error', this property returns the time at which the health report was first reported with 'Error'. For periodic reporting, many reports with the same state may have been generated however, this property returns only the date and time at the first 'Error' health report was received.
   *
   * If the current health state is 'Ok' or 'Warning', returns the date and time at which the health state was last in 'Error', before transitioning to a different state.
   *
   * If the health state was never 'Error', the value will be zero date-time.
   */
  lastErrorTransitionAt?: Date;
}

/** Represents health evaluation for an application, containing information about the data and the algorithm used by the health store to evaluate health. */
export interface ApplicationHealthEvaluation extends HealthEvaluation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Application";
  /** The name of the application, including the 'fabric:' URI scheme. */
  applicationName?: string;
  /** List of unhealthy evaluations that led to the current aggregated health state of the application. The types of the unhealthy evaluations can be DeployedApplicationsHealthEvaluation, ServicesHealthEvaluation or EventHealthEvaluation. */
  unhealthyEvaluations?: HealthEvaluationWrapper[];
}

/** Represents health evaluation for applications, containing health evaluations for each unhealthy application that impacted current aggregated health state. */
export interface ApplicationsHealthEvaluation extends HealthEvaluation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Applications";
  /** Maximum allowed percentage of unhealthy applications from the ClusterHealthPolicy. */
  maxPercentUnhealthyApplications?: number;
  /** Total number of applications from the health store. */
  totalCount?: number;
  /** List of unhealthy evaluations that led to the aggregated health state. Includes all the unhealthy ApplicationHealthEvaluation that impacted the aggregated health. */
  unhealthyEvaluations?: HealthEvaluationWrapper[];
}

/** Represents health evaluation for applications of a particular application type. The application type applications evaluation can be returned when cluster health evaluation returns unhealthy aggregated health state, either Error or Warning. It contains health evaluations for each unhealthy application of the included application type that impacted current aggregated health state. */
export interface ApplicationTypeApplicationsHealthEvaluation
  extends HealthEvaluation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ApplicationTypeApplications";
  /** The application type name as defined in the application manifest. */
  applicationTypeName?: string;
  /** Maximum allowed percentage of unhealthy applications for the application type, specified as an entry in ApplicationTypeHealthPolicyMap. */
  maxPercentUnhealthyApplications?: number;
  /** Total number of applications of the application type found in the health store. */
  totalCount?: number;
  /** List of unhealthy evaluations that led to the aggregated health state. Includes all the unhealthy ApplicationHealthEvaluation of this application type that impacted the aggregated health. */
  unhealthyEvaluations?: HealthEvaluationWrapper[];
}

/**
 * Represents health evaluation for delta nodes, containing health evaluations for each unhealthy node that impacted current aggregated health state.
 * Can be returned during cluster upgrade when the aggregated health state of the cluster is Warning or Error.
 */
export interface DeltaNodesCheckHealthEvaluation extends HealthEvaluation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "DeltaNodesCheck";
  /** Number of nodes with aggregated heath state Error in the health store at the beginning of the cluster upgrade. */
  baselineErrorCount?: number;
  /** Total number of nodes in the health store at the beginning of the cluster upgrade. */
  baselineTotalCount?: number;
  /** Maximum allowed percentage of delta unhealthy nodes from the ClusterUpgradeHealthPolicy. */
  maxPercentDeltaUnhealthyNodes?: number;
  /** Total number of nodes in the health store. */
  totalCount?: number;
  /**
   * List of unhealthy evaluations that led to the aggregated health state.
   * Includes all the unhealthy NodeHealthEvaluation that impacted the aggregated health.
   */
  unhealthyEvaluations?: HealthEvaluationWrapper[];
}

/** Represents health evaluation for a deployed application, containing information about the data and the algorithm used by the health store to evaluate health. */
export interface DeployedApplicationHealthEvaluation extends HealthEvaluation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "DeployedApplication";
  /** Name of the node where the application is deployed to. */
  nodeName?: string;
  /** The name of the application, including the 'fabric:' URI scheme. */
  applicationName?: string;
  /**
   * List of  unhealthy evaluations that led to the current aggregated health state of the deployed application.
   * The types of the unhealthy evaluations can be DeployedServicePackagesHealthEvaluation or EventHealthEvaluation.
   */
  unhealthyEvaluations?: HealthEvaluationWrapper[];
}

/**
 * Represents health evaluation for deployed applications, containing health evaluations for each unhealthy deployed application that impacted current aggregated health state.
 * Can be returned when evaluating application health and the aggregated health state is either Error or Warning.
 */
export interface DeployedApplicationsHealthEvaluation extends HealthEvaluation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "DeployedApplications";
  /** Maximum allowed percentage of unhealthy deployed applications from the ApplicationHealthPolicy. */
  maxPercentUnhealthyDeployedApplications?: number;
  /** Total number of deployed applications of the application in the health store. */
  totalCount?: number;
  /** List of unhealthy evaluations that led to the aggregated health state. Includes all the unhealthy DeployedApplicationHealthEvaluation that impacted the aggregated health. */
  unhealthyEvaluations?: HealthEvaluationWrapper[];
}

/** Represents health evaluation for a deployed service package, containing information about the data and the algorithm used by health store to evaluate health. The evaluation is returned only when the aggregated health state is either Error or Warning. */
export interface DeployedServicePackageHealthEvaluation
  extends HealthEvaluation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "DeployedServicePackage";
  /** The name of a Service Fabric node. */
  nodeName?: string;
  /** The name of the application, including the 'fabric:' URI scheme. */
  applicationName?: string;
  /** The name of the service manifest. */
  serviceManifestName?: string;
  /** List of unhealthy evaluations that led to the current aggregated health state. The type of the unhealthy evaluations can be EventHealthEvaluation. */
  unhealthyEvaluations?: HealthEvaluationWrapper[];
}

/** Represents health evaluation for deployed service packages, containing health evaluations for each unhealthy deployed service package that impacted current aggregated health state. Can be returned when evaluating deployed application health and the aggregated health state is either Error or Warning. */
export interface DeployedServicePackagesHealthEvaluation
  extends HealthEvaluation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "DeployedServicePackages";
  /** Total number of deployed service packages of the deployed application in the health store. */
  totalCount?: number;
  /** List of unhealthy evaluations that led to the aggregated health state. Includes all the unhealthy DeployedServicePackageHealthEvaluation that impacted the aggregated health. */
  unhealthyEvaluations?: HealthEvaluationWrapper[];
}

/**
 * Represents health evaluation of a HealthEvent that was reported on the entity.
 * The health evaluation is returned when evaluating health of an entity results in Error or Warning.
 */
export interface EventHealthEvaluation extends HealthEvaluation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Event";
  /** Indicates whether warnings are treated with the same severity as errors. The field is specified in the health policy used to evaluate the entity. */
  considerWarningAsError?: boolean;
  /** Represents health information reported on a health entity, such as cluster, application or node, with additional metadata added by the Health Manager. */
  unhealthyEvent?: HealthEvent;
}

/** Represents health evaluation for a node, containing information about the data and the algorithm used by health store to evaluate health. The evaluation is returned only when the aggregated health state is either Error or Warning. */
export interface NodeHealthEvaluation extends HealthEvaluation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Node";
  /** The name of a Service Fabric node. */
  nodeName?: string;
  /** List of unhealthy evaluations that led to the current aggregated health state of the node. The types of the unhealthy evaluations can be EventHealthEvaluation. */
  unhealthyEvaluations?: HealthEvaluationWrapper[];
}

/** Represents health evaluation for nodes, containing health evaluations for each unhealthy node that impacted current aggregated health state. Can be returned when evaluating cluster health and the aggregated health state is either Error or Warning. */
export interface NodesHealthEvaluation extends HealthEvaluation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Nodes";
  /** Maximum allowed percentage of unhealthy nodes from the ClusterHealthPolicy. */
  maxPercentUnhealthyNodes?: number;
  /** Total number of nodes found in the health store. */
  totalCount?: number;
  /** List of unhealthy evaluations that led to the aggregated health state. Includes all the unhealthy NodeHealthEvaluation that impacted the aggregated health. */
  unhealthyEvaluations?: HealthEvaluationWrapper[];
}

/** Represents health evaluation for a partition, containing information about the data and the algorithm used by health store to evaluate health. The evaluation is returned only when the aggregated health state is either Error or Warning. */
export interface PartitionHealthEvaluation extends HealthEvaluation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Partition";
  /** Id of the partition whose health evaluation is described by this object. */
  partitionId?: string;
  /** List of unhealthy evaluations that led to the current aggregated health state of the partition. The types of the unhealthy evaluations can be ReplicasHealthEvaluation or EventHealthEvaluation. */
  unhealthyEvaluations?: HealthEvaluationWrapper[];
}

/** Represents health evaluation for the partitions of a service, containing health evaluations for each unhealthy partition that impacts current aggregated health state. Can be returned when evaluating service health and the aggregated health state is either Error or Warning. */
export interface PartitionsHealthEvaluation extends HealthEvaluation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Partitions";
  /** Maximum allowed percentage of unhealthy partitions per service from the ServiceTypeHealthPolicy. */
  maxPercentUnhealthyPartitionsPerService?: number;
  /** Total number of partitions of the service from the health store. */
  totalCount?: number;
  /** List of unhealthy evaluations that led to the aggregated health state. Includes all the unhealthy PartitionHealthEvaluation that impacted the aggregated health. */
  unhealthyEvaluations?: HealthEvaluationWrapper[];
}

/** Represents health evaluation for a replica, containing information about the data and the algorithm used by health store to evaluate health. The evaluation is returned only when the aggregated health state is either Error or Warning. */
export interface ReplicaHealthEvaluation extends HealthEvaluation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Replica";
  /** Id of the partition to which the replica belongs. */
  partitionId?: string;
  /** Id of a stateful service replica or a stateless service instance. This ID is used in the queries that apply to both stateful and stateless services. It is used by Service Fabric to uniquely identify a replica of a partition of a stateful service or an instance of a stateless service partition. It is unique within a partition and does not change for the lifetime of the replica or the instance. If a stateful replica gets dropped and another replica gets created on the same node for the same partition, it will get a different value for the ID. If a stateless instance is failed over on the same or different node it will get a different value for the ID. */
  replicaOrInstanceId?: string;
  /** List of unhealthy evaluations that led to the current aggregated health state of the replica. The types of the unhealthy evaluations can be EventHealthEvaluation. */
  unhealthyEvaluations?: HealthEvaluationWrapper[];
}

/** Represents health evaluation for replicas, containing health evaluations for each unhealthy replica that impacted current aggregated health state. Can be returned when evaluating partition health and the aggregated health state is either Error or Warning. */
export interface ReplicasHealthEvaluation extends HealthEvaluation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Replicas";
  /** Maximum allowed percentage of unhealthy replicas per partition from the ApplicationHealthPolicy. */
  maxPercentUnhealthyReplicasPerPartition?: number;
  /** Total number of replicas in the partition from the health store. */
  totalCount?: number;
  /** List of unhealthy evaluations that led to the aggregated health state. Includes all the unhealthy ReplicaHealthEvaluation that impacted the aggregated health. */
  unhealthyEvaluations?: HealthEvaluationWrapper[];
}

/** Represents health evaluation for a service, containing information about the data and the algorithm used by health store to evaluate health. The evaluation is returned only when the aggregated health state is either Error or Warning. */
export interface ServiceHealthEvaluation extends HealthEvaluation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Service";
  /** Name of the service whose health evaluation is described by this object. */
  serviceName?: string;
  /** List of unhealthy evaluations that led to the current aggregated health state of the service. The types of the unhealthy evaluations can be PartitionsHealthEvaluation or EventHealthEvaluation. */
  unhealthyEvaluations?: HealthEvaluationWrapper[];
}

/** Represents health evaluation for services of a certain service type belonging to an application, containing health evaluations for each unhealthy service that impacted current aggregated health state. Can be returned when evaluating application health and the aggregated health state is either Error or Warning. */
export interface ServicesHealthEvaluation extends HealthEvaluation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Services";
  /** Name of the service type of the services. */
  serviceTypeName?: string;
  /** Maximum allowed percentage of unhealthy services from the ServiceTypeHealthPolicy. */
  maxPercentUnhealthyServices?: number;
  /** Total number of services of the current service type in the application from the health store. */
  totalCount?: number;
  /** List of unhealthy evaluations that led to the aggregated health state. Includes all the unhealthy ServiceHealthEvaluation that impacted the aggregated health. */
  unhealthyEvaluations?: HealthEvaluationWrapper[];
}

/** Represents health evaluation for the fabric:/System application, containing information about the data and the algorithm used by health store to evaluate health. The evaluation is returned only when the aggregated health state of the cluster is either Error or Warning. */
export interface SystemApplicationHealthEvaluation extends HealthEvaluation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "SystemApplication";
  /** List of unhealthy evaluations that led to the current aggregated health state of the system application. The types of the unhealthy evaluations can be DeployedApplicationsHealthEvaluation, ServicesHealthEvaluation or EventHealthEvaluation. */
  unhealthyEvaluations?: HealthEvaluationWrapper[];
}

/**
 * Represents health evaluation for delta unhealthy cluster nodes in an upgrade domain, containing health evaluations for each unhealthy node that impacted current aggregated health state.
 * Can be returned during cluster upgrade when cluster aggregated health state is Warning or Error.
 */
export interface UpgradeDomainDeltaNodesCheckHealthEvaluation
  extends HealthEvaluation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "UpgradeDomainDeltaNodesCheck";
  /** Name of the upgrade domain where nodes health is currently evaluated. */
  upgradeDomainName?: string;
  /** Number of upgrade domain nodes with aggregated heath state Error in the health store at the beginning of the cluster upgrade. */
  baselineErrorCount?: number;
  /** Total number of upgrade domain nodes in the health store at the beginning of the cluster upgrade. */
  baselineTotalCount?: number;
  /** Maximum allowed percentage of upgrade domain delta unhealthy nodes from the ClusterUpgradeHealthPolicy. */
  maxPercentDeltaUnhealthyNodes?: number;
  /** Total number of upgrade domain nodes in the health store. */
  totalCount?: number;
  /** List of unhealthy evaluations that led to the aggregated health state. Includes all the unhealthy NodeHealthEvaluation that impacted the aggregated health. */
  unhealthyEvaluations?: HealthEvaluationWrapper[];
}

/** Represents health evaluation for deployed applications in an upgrade domain, containing health evaluations for each unhealthy deployed application that impacted current aggregated health state. Can be returned when evaluating cluster health during cluster upgrade and the aggregated health state is either Error or Warning. */
export interface UpgradeDomainDeployedApplicationsHealthEvaluation
  extends HealthEvaluation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "UpgradeDomainDeployedApplications";
  /** Name of the upgrade domain where deployed applications health is currently evaluated. */
  upgradeDomainName?: string;
  /** Maximum allowed percentage of unhealthy deployed applications from the ClusterHealthPolicy. */
  maxPercentUnhealthyDeployedApplications?: number;
  /** Total number of deployed applications in the current upgrade domain. */
  totalCount?: number;
  /** List of unhealthy evaluations that led to the aggregated health state. Includes all the unhealthy DeployedApplicationHealthEvaluation that impacted the aggregated health. */
  unhealthyEvaluations?: HealthEvaluationWrapper[];
}

/** Represents health evaluation for cluster nodes in an upgrade domain, containing health evaluations for each unhealthy node that impacted current aggregated health state. Can be returned when evaluating cluster health during cluster upgrade and the aggregated health state is either Error or Warning. */
export interface UpgradeDomainNodesHealthEvaluation extends HealthEvaluation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "UpgradeDomainNodes";
  /** Name of the upgrade domain where nodes health is currently evaluated. */
  upgradeDomainName?: string;
  /** Maximum allowed percentage of unhealthy nodes from the ClusterHealthPolicy. */
  maxPercentUnhealthyNodes?: number;
  /** Total number of nodes in the current upgrade domain. */
  totalCount?: number;
  /** List of unhealthy evaluations that led to the aggregated health state. Includes all the unhealthy NodeHealthEvaluation that impacted the aggregated health. */
  unhealthyEvaluations?: HealthEvaluationWrapper[];
}

/** Represents health evaluation for nodes of a particular node type. The node type nodes evaluation can be returned when cluster health evaluation returns unhealthy aggregated health state, either Error or Warning. It contains health evaluations for each unhealthy node of the included node type that impacted current aggregated health state. */
export interface NodeTypeNodesHealthEvaluation extends HealthEvaluation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "NodeTypeNodes";
  /** The node type name as defined in the cluster manifest. */
  nodeTypeName?: string;
  /** Maximum allowed percentage of unhealthy nodes for the node type, specified as an entry in NodeTypeHealthPolicyMap. */
  maxPercentUnhealthyNodes?: number;
  /** Total number of nodes of the node type found in the health store. */
  totalCount?: number;
  /** List of unhealthy evaluations that led to the aggregated health state. Includes all the unhealthy NodeHealthEvaluation of this node type that impacted the aggregated health. */
  unhealthyEvaluations?: HealthEvaluationWrapper[];
}

/** Represents the health state chunk of a node, which contains the node name and its aggregated health state. */
export interface NodeHealthStateChunk extends EntityHealthStateChunk {
  /** The name of a Service Fabric node. */
  nodeName?: string;
}

/**
 * Represents the health state chunk of a stateful service replica or a stateless service instance.
 * The replica health state contains the replica ID and its aggregated health state.
 */
export interface ReplicaHealthStateChunk extends EntityHealthStateChunk {
  /** Id of a stateful service replica or a stateless service instance. This ID is used in the queries that apply to both stateful and stateless services. It is used by Service Fabric to uniquely identify a replica of a partition of a stateful service or an instance of a stateless service partition. It is unique within a partition and does not change for the lifetime of the replica or the instance. If a stateful replica gets dropped and another replica gets created on the same node for the same partition, it will get a different value for the ID. If a stateless instance is failed over on the same or different node it will get a different value for the ID. */
  replicaOrInstanceId?: string;
}

/** Represents the health state chunk of a partition, which contains the partition ID, its aggregated health state and any replicas that respect the filters in the cluster health chunk query description. */
export interface PartitionHealthStateChunk extends EntityHealthStateChunk {
  /** The Id of the partition. */
  partitionId?: string;
  /** The list of replica health state chunks belonging to the partition that respect the filters in the cluster health chunk query description. */
  replicaHealthStateChunks?: ReplicaHealthStateChunkList;
}

/** Represents the health state chunk of a service, which contains the service name, its aggregated health state and any partitions that respect the filters in the cluster health chunk query description. */
export interface ServiceHealthStateChunk extends EntityHealthStateChunk {
  /** The name of the service whose health state chunk is provided in this object. */
  serviceName?: string;
  /** The list of partition health state chunks belonging to the service that respect the filters in the cluster health chunk query description. */
  partitionHealthStateChunks?: PartitionHealthStateChunkList;
}

/** Represents the health state chunk of a deployed service package, which contains the service manifest name and the service package aggregated health state. */
export interface DeployedServicePackageHealthStateChunk
  extends EntityHealthStateChunk {
  /** The name of the service manifest. */
  serviceManifestName?: string;
  /**
   * The ActivationId of a deployed service package. If ServicePackageActivationMode specified at the time of creating the service
   * is 'SharedProcess' (or if it is not specified, in which case it defaults to 'SharedProcess'), then value of ServicePackageActivationId
   * is always an empty string.
   */
  servicePackageActivationId?: string;
}

/** Represents the health state chunk of a deployed application, which contains the node where the application is deployed, the aggregated health state and any deployed service packages that respect the chunk query description filters. */
export interface DeployedApplicationHealthStateChunk
  extends EntityHealthStateChunk {
  /** The name of node where the application is deployed. */
  nodeName?: string;
  /** The list of deployed service package health state chunks belonging to the deployed application that respect the filters in the cluster health chunk query description. */
  deployedServicePackageHealthStateChunks?: DeployedServicePackageHealthStateChunkList;
}

/**
 * Represents the health state chunk of a application.
 * The application health state chunk contains the application name, its aggregated health state and any children services and deployed applications that respect the filters in cluster health chunk query description.
 */
export interface ApplicationHealthStateChunk extends EntityHealthStateChunk {
  /** The name of the application, including the 'fabric:' URI scheme. */
  applicationName?: string;
  /** The application type name as defined in the application manifest. */
  applicationTypeName?: string;
  /** The list of service health state chunks in the cluster that respect the filters in the cluster health chunk query description. */
  serviceHealthStateChunks?: ServiceHealthStateChunkList;
  /** The list of deployed application health state chunks in the cluster that respect the filters in the cluster health chunk query description. */
  deployedApplicationHealthStateChunks?: DeployedApplicationHealthStateChunkList;
}

/** The list of node health state chunks in the cluster that respect the input filters in the chunk query. Returned by get cluster health state chunks query. */
export interface NodeHealthStateChunkList extends EntityHealthStateChunkList {
  /** The list of node health state chunks that respect the input filters in the chunk query. */
  items?: NodeHealthStateChunk[];
}

/** The list of application health state chunks in the cluster that respect the input filters in the chunk query. Returned by get cluster health state chunks query. */
export interface ApplicationHealthStateChunkList
  extends EntityHealthStateChunkList {
  /** The list of application health state chunks that respect the input filters in the chunk query. */
  items?: ApplicationHealthStateChunk[];
}

/** Represents a safety check for the service partition being performed by service fabric before continuing with operations. */
export interface PartitionSafetyCheck extends SafetyCheck {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind:
    | "PartitionSafetyCheck"
    | "EnsureAvailability"
    | "EnsurePartitionQuorum"
    | "WaitForInbuildReplica"
    | "WaitForPrimaryPlacement"
    | "WaitForPrimarySwap"
    | "WaitForReconfiguration";
  /** Id of the partition which is undergoing the safety check. */
  partitionId?: string;
}

/** Represents a safety check for the seed nodes being performed by service fabric before continuing with node level operations. */
export interface SeedNodeSafetyCheck extends SafetyCheck {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "EnsureSeedNodeQuorum";
}

/** Describes the operation to register or provision an application type using an application package uploaded to the Service Fabric image store. */
export interface ProvisionApplicationTypeDescription
  extends ProvisionApplicationTypeDescriptionBase {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ImageStorePath";
  /** The relative path for the application package in the image store specified during the prior upload operation. */
  applicationTypeBuildPath: string;
  /** The kind of action that needs to be taken for cleaning up the application package after successful provision. */
  applicationPackageCleanupPolicy?: ApplicationPackageCleanupPolicy;
}

/** Describes the operation to register or provision an application type using an application package from an external store instead of a package uploaded to the Service Fabric image store. */
export interface ExternalStoreProvisionApplicationTypeDescription
  extends ProvisionApplicationTypeDescriptionBase {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ExternalStore";
  /** The path to the '.sfpkg' application package from where the application package can be downloaded using HTTP or HTTPS protocols. The application package can be stored in an external store that provides GET operation to download the file. Supported protocols are HTTP and HTTPS, and the path must allow READ access. */
  applicationPackageDownloadUri: string;
  /** The application type name represents the name of the application type found in the application manifest. */
  applicationTypeName: string;
  /** The application type version represents the version of the application type found in the application manifest. */
  applicationTypeVersion: string;
}

/** Describes a stateful service type defined in the service manifest of a provisioned application type. */
export interface StatefulServiceTypeDescription extends ServiceTypeDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Stateful";
  /** A flag indicating whether this is a persistent service which stores states on the local disk. If it is then the value of this property is true, if not it is false. */
  hasPersistedState?: boolean;
}

/** Describes a stateless service type defined in the service manifest of a provisioned application type. */
export interface StatelessServiceTypeDescription
  extends ServiceTypeDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Stateless";
  /** A flag indicating if this type is not implemented and hosted by a user service process, but is implicitly hosted by a system created process. This value is true for services using the guest executable services, false otherwise. */
  useImplicitHost?: boolean;
}

/** Describes the policy to be used for placement of a Service Fabric service where a particular fault or upgrade domain should not be used for placement of the instances or replicas of that service. */
export interface ServicePlacementInvalidDomainPolicyDescription
  extends ServicePlacementPolicyDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  type: "InvalidDomain";
  /** The name of the domain that should not be used for placement. */
  domainName?: string;
}

/** Describes the policy to be used for placement of a Service Fabric service where all replicas must be able to be placed in order for any replicas to be created. */
export interface ServicePlacementNonPartiallyPlaceServicePolicyDescription
  extends ServicePlacementPolicyDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  type: "NonPartiallyPlaceService";
}

/** Describes the policy to be used for placement of a Service Fabric service allowing multiple stateless instances of a partition of the service to be placed on a node. */
export interface ServicePlacementAllowMultipleStatelessInstancesOnNodePolicyDescription
  extends ServicePlacementPolicyDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  type: "AllowMultipleStatelessInstancesOnNode";
  /** Holdover from other policy descriptions, not used for this policy, values are ignored by runtime. Keeping it for any backwards-compatibility with clients. */
  domainName?: string;
}

/**
 * Describes the policy to be used for placement of a Service Fabric service where the service's Primary replicas should optimally be placed in a particular domain.
 *
 * This placement policy is usually used with fault domains in scenarios where the Service Fabric cluster is geographically distributed in order to indicate that a service's primary replica should be located in a particular fault domain, which in geo-distributed scenarios usually aligns with regional or datacenter boundaries. Note that since this is an optimization it is possible that the Primary replica may not end up located in this domain due to failures, capacity limits, or other constraints.
 */
export interface ServicePlacementPreferPrimaryDomainPolicyDescription
  extends ServicePlacementPolicyDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  type: "PreferPrimaryDomain";
  /** The name of the domain that should used for placement as per this policy. */
  domainName?: string;
}

/** Describes the policy to be used for placement of a Service Fabric service where the instances or replicas of that service must be placed in a particular domain */
export interface ServicePlacementRequiredDomainPolicyDescription
  extends ServicePlacementPolicyDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  type: "RequireDomain";
  /** The name of the domain that should used for placement as per this policy. */
  domainName?: string;
}

/**
 * Describes the policy to be used for placement of a Service Fabric service where two replicas from the same partition should never be placed in the same fault or upgrade domain.
 *
 * While this is not common it can expose the service to an increased risk of concurrent failures due to unplanned outages or other cases of subsequent/concurrent failures. As an example, consider a case where replicas are deployed across different data center, with one replica per location. In the event that one of the datacenters goes offline, normally the replica that was placed in that datacenter will be packed into one of the remaining datacenters. If this is not desirable then this policy should be set.
 */
export interface ServicePlacementRequireDomainDistributionPolicyDescription
  extends ServicePlacementPolicyDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  type: "RequireDomainDistribution";
  /** The name of the domain that should used for placement as per this policy. */
  domainName?: string;
}

/** Information about a stateful Service Fabric service. */
export interface StatefulServiceInfo extends ServiceInfo {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  serviceKind: "Stateful";
  /** Whether the service has persisted state. */
  hasPersistedState?: boolean;
}

/** Information about a stateless Service Fabric service. */
export interface StatelessServiceInfo extends ServiceInfo {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  serviceKind: "Stateless";
}

/** Describes a stateful service. */
export interface StatefulServiceDescription extends ServiceDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  serviceKind: "Stateful";
  /** The target replica set size as a number. */
  targetReplicaSetSize: number;
  /** The minimum replica set size as a number. */
  minReplicaSetSize: number;
  /** A flag indicating whether this is a persistent service which stores states on the local disk. If it is then the value of this property is true, if not it is false. */
  hasPersistedState: boolean;
  /**
   * Flags indicating whether other properties are set. Each of the associated properties corresponds to a flag, specified below, which, if set, indicate that the property is specified.
   * This property can be a combination of those flags obtained using bitwise 'OR' operator.
   * For example, if the provided value is 6 then the flags for QuorumLossWaitDuration (2) and StandByReplicaKeepDuration(4) are set.
   *
   * - None - Does not indicate any other properties are set. The value is zero.
   * - ReplicaRestartWaitDuration - Indicates the ReplicaRestartWaitDuration property is set. The value is 1.
   * - QuorumLossWaitDuration - Indicates the QuorumLossWaitDuration property is set. The value is 2.
   * - StandByReplicaKeepDuration - Indicates the StandByReplicaKeepDuration property is set. The value is 4.
   * - ServicePlacementTimeLimit - Indicates the ServicePlacementTimeLimit property is set. The value is 8.
   * - DropSourceReplicaOnMove - Indicates the DropSourceReplicaOnMove property is set. The value is 16.
   */
  flags?: number;
  /** The duration, in seconds, between when a replica goes down and when a new replica is created. */
  replicaRestartWaitDurationSeconds?: number;
  /** The maximum duration, in seconds, for which a partition is allowed to be in a state of quorum loss. */
  quorumLossWaitDurationSeconds?: number;
  /** The definition on how long StandBy replicas should be maintained before being removed. */
  standByReplicaKeepDurationSeconds?: number;
  /** The duration for which replicas can stay InBuild before reporting that build is stuck. */
  servicePlacementTimeLimitSeconds?: number;
  /** Indicates whether to drop source Secondary replica even if the target replica has not finished build. If desired behavior is to drop it as soon as possible the value of this property is true, if not it is false. */
  dropSourceReplicaOnMove?: boolean;
  /** Defines how replicas of this service will behave during their lifecycle. */
  replicaLifecycleDescription?: ReplicaLifecycleDescription;
  /** The auxiliary replica count as a number. To use Auxiliary replicas, the following must be true: AuxiliaryReplicaCount < (TargetReplicaSetSize+1)/2 and TargetReplicaSetSize >=3. */
  auxiliaryReplicaCount?: number;
}

/** Describes a stateless service. */
export interface StatelessServiceDescription extends ServiceDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  serviceKind: "Stateless";
  /** The instance count. */
  instanceCount: number;
  /**
   * MinInstanceCount is the minimum number of instances that must be up to meet the EnsureAvailability safety check during operations like upgrade or deactivate node.
   * The actual number that is used is max( MinInstanceCount, ceil( MinInstancePercentage/100.0 * InstanceCount) ).
   * Note, if InstanceCount is set to -1, during MinInstanceCount computation -1 is first converted into the number of nodes on which the instances are allowed to be placed according to the placement constraints on the service.
   */
  minInstanceCount?: number;
  /**
   * MinInstancePercentage is the minimum percentage of InstanceCount that must be up to meet the EnsureAvailability safety check during operations like upgrade or deactivate node.
   * The actual number that is used is max( MinInstanceCount, ceil( MinInstancePercentage/100.0 * InstanceCount) ).
   * Note, if InstanceCount is set to -1, during MinInstancePercentage computation, -1 is first converted into the number of nodes on which the instances are allowed to be placed according to the placement constraints on the service.
   */
  minInstancePercentage?: number;
  /**
   * Flags indicating whether other properties are set. Each of the associated properties corresponds to a flag, specified below, which, if set, indicate that the property is specified.
   * This property can be a combination of those flags obtained using bitwise 'OR' operator.
   * For example, if the provided value is 1 then the flags for InstanceCloseDelayDuration is set.
   *
   * - None - Does not indicate any other properties are set. The value is zero.
   * - InstanceCloseDelayDuration - Indicates the InstanceCloseDelayDuration property is set. The value is 1.
   * - InstanceRestartWaitDuration - Indicates the InstanceRestartWaitDurationSeconds property is set. The value is 2.
   */
  flags?: number;
  /**
   * Duration in seconds, to wait before a stateless instance is closed, to allow the active requests to drain gracefully. This would be effective when the instance is closing during the application/cluster upgrade and disabling node.
   * The endpoint exposed on this instance is removed prior to starting the delay, which prevents new connections to this instance.
   * In addition, clients that have subscribed to service endpoint change events(https://docs.microsoft.com/dotnet/api/system.fabric.fabricclient.servicemanagementclient.registerservicenotificationfilterasync), can do
   * the following upon receiving the endpoint removal notification:
   *     - Stop sending new requests to this instance.
   *     - Close existing connections after in-flight requests have completed.
   *     - Connect to a different instance of the service partition for future requests.
   * Note, the default value of InstanceCloseDelayDuration is 0, which indicates that there won't be any delay or removal of the endpoint prior to closing the instance.
   */
  instanceCloseDelayDurationSeconds?: number;
  /** Defines how instances of this service will behave during their lifecycle. */
  instanceLifecycleDescription?: InstanceLifecycleDescription;
  /**
   * When a stateless instance goes down, this timer starts. When it expires Service Fabric will create a new instance on any node in the cluster.
   * This configuration is to reduce unnecessary creation of a new instance in situations where the instance going down is likely to recover in a short time. For example, during an upgrade.
   * The default value is 0, which indicates that when stateless instance goes down, Service Fabric will immediately start building its replacement.
   */
  instanceRestartWaitDurationSeconds?: number;
}

/** Describes the named partition scheme of the service. */
export interface NamedPartitionSchemeDescription
  extends PartitionSchemeDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  partitionScheme: "Named";
  /** The number of partitions. */
  count: number;
  /** Array of size specified by the ‘Count’ parameter, for the names of the partitions. */
  names: string[];
}

/** Describes the partition scheme of a singleton-partitioned, or non-partitioned service. */
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
   * should be split between the partitions.
   */
  lowKey: string;
  /**
   * String indicating the upper bound of the partition key range that
   * should be split between the partitions.
   */
  highKey: string;
}

/** Represents a scaling trigger related to an average load of a metric/resource of a partition. */
export interface AveragePartitionLoadScalingTrigger
  extends ScalingTriggerDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "AveragePartitionLoad";
  /** The name of the metric for which usage should be tracked. */
  metricName: string;
  /** The lower limit of the load below which a scale in operation should be performed. */
  lowerLoadThreshold: string;
  /** The upper limit of the load beyond which a scale out operation should be performed. */
  upperLoadThreshold: string;
  /** The period in seconds on which a decision is made whether to scale or not. */
  scaleIntervalInSeconds: number;
}

/** Represents a scaling policy related to an average load of a metric/resource of a service. */
export interface AverageServiceLoadScalingTrigger
  extends ScalingTriggerDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "AverageServiceLoad";
  /** The name of the metric for which usage should be tracked. */
  metricName: string;
  /** The lower limit of the load below which a scale in operation should be performed. */
  lowerLoadThreshold: string;
  /** The upper limit of the load beyond which a scale out operation should be performed. */
  upperLoadThreshold: string;
  /** The period in seconds on which a decision is made whether to scale or not. */
  scaleIntervalInSeconds: number;
  /**
   * Flag determines whether only the load of primary replica should be considered for scaling.
   * If set to true, then trigger will only consider the load of primary replicas of stateful service.
   * If set to false, trigger will consider load of all replicas.
   * This parameter cannot be set to true for stateless service.
   */
  useOnlyPrimaryLoad: boolean;
}

/** Represents a scaling mechanism for adding or removing instances of stateless service partition. */
export interface PartitionInstanceCountScaleMechanism
  extends ScalingMechanismDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "PartitionInstanceCount";
  /** Minimum number of instances of the partition. */
  minInstanceCount: number;
  /** Maximum number of instances of the partition. */
  maxInstanceCount: number;
  /** The number of instances to add or remove during a scaling operation. */
  scaleIncrement: number;
}

/** Represents a scaling mechanism for adding or removing named partitions of a stateless service. Partition names are in the format '0','1''N-1' */
export interface AddRemoveIncrementalNamedPartitionScalingMechanism
  extends ScalingMechanismDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "AddRemoveIncrementalNamedPartition";
  /** Minimum number of named partitions of the service. */
  minPartitionCount: number;
  /** Maximum number of named partitions of the service. */
  maxPartitionCount: number;
  /** The number of instances to add or remove during a scaling operation. */
  scaleIncrement: number;
}

/** Describes an update for a stateful service. */
export interface StatefulServiceUpdateDescription
  extends ServiceUpdateDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  serviceKind: "Stateful";
  /** The target replica set size as a number. */
  targetReplicaSetSize?: number;
  /** The minimum replica set size as a number. */
  minReplicaSetSize?: number;
  /** The duration, in seconds, between when a replica goes down and when a new replica is created. */
  replicaRestartWaitDurationSeconds?: string;
  /** The maximum duration, in seconds, for which a partition is allowed to be in a state of quorum loss. */
  quorumLossWaitDurationSeconds?: string;
  /** The definition on how long StandBy replicas should be maintained before being removed. */
  standByReplicaKeepDurationSeconds?: string;
  /** The duration for which replicas can stay InBuild before reporting that build is stuck. */
  servicePlacementTimeLimitSeconds?: string;
  /** Indicates whether to drop source Secondary replica even if the target replica has not finished build. If desired behavior is to drop it as soon as possible the value of this property is true, if not it is false. */
  dropSourceReplicaOnMove?: boolean;
  /** Defines how replicas of this service will behave during their lifecycle. */
  replicaLifecycleDescription?: ReplicaLifecycleDescription;
  /** The auxiliary replica count as a number. To use Auxiliary replicas, the following must be true: AuxiliaryReplicaCount < (TargetReplicaSetSize+1)/2 and TargetReplicaSetSize >=3. */
  auxiliaryReplicaCount?: number;
}

/** Describes an update for a stateless service. */
export interface StatelessServiceUpdateDescription
  extends ServiceUpdateDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  serviceKind: "Stateless";
  /** The instance count. */
  instanceCount?: number;
  /**
   * MinInstanceCount is the minimum number of instances that must be up to meet the EnsureAvailability safety check during operations like upgrade or deactivate node.
   * The actual number that is used is max( MinInstanceCount, ceil( MinInstancePercentage/100.0 * InstanceCount) ).
   * Note, if InstanceCount is set to -1, during MinInstanceCount computation -1 is first converted into the number of nodes on which the instances are allowed to be placed according to the placement constraints on the service.
   */
  minInstanceCount?: number;
  /**
   * MinInstancePercentage is the minimum percentage of InstanceCount that must be up to meet the EnsureAvailability safety check during operations like upgrade or deactivate node.
   * The actual number that is used is max( MinInstanceCount, ceil( MinInstancePercentage/100.0 * InstanceCount) ).
   * Note, if InstanceCount is set to -1, during MinInstancePercentage computation, -1 is first converted into the number of nodes on which the instances are allowed to be placed according to the placement constraints on the service.
   */
  minInstancePercentage?: number;
  /**
   * Duration in seconds, to wait before a stateless instance is closed, to allow the active requests to drain gracefully. This would be effective when the instance is closing during the application/cluster upgrade and disabling node.
   * The endpoint exposed on this instance is removed prior to starting the delay, which prevents new connections to this instance.
   * In addition, clients that have subscribed to service endpoint change events(https://docs.microsoft.com/dotnet/api/system.fabric.fabricclient.servicemanagementclient.registerservicenotificationfilterasync), can do
   * the following upon receiving the endpoint removal notification:
   *     - Stop sending new requests to this instance.
   *     - Close existing connections after in-flight requests have completed.
   *     - Connect to a different instance of the service partition for future requests.
   */
  instanceCloseDelayDurationSeconds?: string;
  /** Defines how instances of this service will behave during their lifecycle. */
  instanceLifecycleDescription?: InstanceLifecycleDescription;
  /**
   * When a stateless instance goes down, this timer starts. When it expires Service Fabric will create a new instance on any node in the cluster.
   * This configuration is to reduce unnecessary creation of a new instance in situations where the instance going down is likely to recover in a short time. For example, during an upgrade.
   * The default value is 0, which indicates that when stateless instance goes down, Service Fabric will immediately start building its replacement.
   */
  instanceRestartWaitDurationSeconds?: string;
}

/** Describes the partition information for the integer range that is based on partition schemes. */
export interface Int64RangePartitionInformation extends PartitionInformation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  servicePartitionKind: "Int64Range";
  /** Specifies the minimum key value handled by this partition. */
  lowKey?: string;
  /** Specifies the maximum key value handled by this partition. */
  highKey?: string;
}

/** Describes the partition information for the name as a string that is based on partition schemes. */
export interface NamedPartitionInformation extends PartitionInformation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  servicePartitionKind: "Named";
  /** Name of the partition. */
  name?: string;
}

/** Information about a partition that is singleton. The services with singleton partitioning scheme are effectively non-partitioned. They only have one partition. */
export interface SingletonPartitionInformation extends PartitionInformation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  servicePartitionKind: "Singleton";
}

/** Information about a partition of a stateful Service Fabric service.. */
export interface StatefulServicePartitionInfo extends ServicePartitionInfo {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  serviceKind: "Stateful";
  /** The target replica set size as a number. */
  targetReplicaSetSize?: number;
  /** The minimum replica set size as a number. */
  minReplicaSetSize?: number;
  /** The auxiliary replica count as a number. To use Auxiliary replicas the following must be true, AuxiliaryReplicaCount < (TargetReplicaSetSize+1)/2 and TargetReplicaSetSize >=3. */
  auxiliaryReplicaCount?: number;
  /** The duration for which this partition was in quorum loss. If the partition is currently in quorum loss, it returns the duration since it has been in that state. This field is using ISO8601 format for specifying the duration. */
  lastQuorumLossDuration?: string;
  /** An Epoch is a configuration number for the partition as a whole. When the configuration of the replica set changes, for example when the Primary replica changes, the operations that are replicated from the new Primary replica are said to be a new Epoch from the ones which were sent by the old Primary replica. */
  primaryEpoch?: Epoch;
}

/** Information about a partition of a stateless Service Fabric service. */
export interface StatelessServicePartitionInfo extends ServicePartitionInfo {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  serviceKind: "Stateless";
  /** Number of instances of this partition. */
  instanceCount?: number;
  /**
   * MinInstanceCount is the minimum number of instances that must be up to meet the EnsureAvailability safety check during operations like upgrade or deactivate node.
   * The actual number that is used is max( MinInstanceCount, ceil( MinInstancePercentage/100.0 * InstanceCount) ).
   * Note, if InstanceCount is set to -1, during MinInstanceCount computation -1 is first converted into the number of nodes on which the instances are allowed to be placed according to the placement constraints on the service.
   */
  minInstanceCount?: number;
  /**
   * MinInstancePercentage is the minimum percentage of InstanceCount that must be up to meet the EnsureAvailability safety check during operations like upgrade or deactivate node.
   * The actual number that is used is max( MinInstanceCount, ceil( MinInstancePercentage/100.0 * InstanceCount) ).
   * Note, if InstanceCount is set to -1, during MinInstancePercentage computation, -1 is first converted into the number of nodes on which the instances are allowed to be placed according to the placement constraints on the service.
   */
  minInstancePercentage?: number;
}

/**
 * Describes the list of nodes targeted by a repair action.
 *
 * This type supports the Service Fabric platform; it is not meant to be used directly from your code.
 */
export interface NodeRepairTargetDescription
  extends RepairTargetDescriptionBase {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Node";
  /** The list of nodes targeted by a repair action. */
  nodeNames?: string[];
}

/**
 * Describes the expected impact of a repair on a set of nodes.
 *
 * This type supports the Service Fabric platform; it is not meant to be used directly from your code.
 */
export interface NodeRepairImpactDescription
  extends RepairImpactDescriptionBase {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Node";
  /** The list of nodes impacted by a repair action and their respective expected impact. */
  nodeImpactList?: NodeImpact[];
}

/** Represents a stateful service replica. This includes information about the identity, role, status, health, node name, uptime, and other details about the replica. */
export interface StatefulServiceReplicaInfo extends ReplicaInfo {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  serviceKind: "Stateful";
  /** The role of a replica of a stateful service. */
  replicaRole?: ReplicaRole;
  /** Id of a stateful service replica. ReplicaId is used by Service Fabric to uniquely identify a replica of a partition. It is unique within a partition and does not change for the lifetime of the replica. If a replica gets dropped and another replica gets created on the same node for the same partition, it will get a different value for the id. Sometimes the id of a stateless service instance is also referred as a replica id. */
  replicaId?: string;
}

/** Represents a stateless service instance. This includes information about the identity, status, health, node name, uptime, and other details about the instance. */
export interface StatelessServiceInstanceInfo extends ReplicaInfo {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  serviceKind: "Stateless";
  /** Id of a stateless service instance. InstanceId is used by Service Fabric to uniquely identify an instance of a partition of a stateless service. It is unique within a partition and does not change for the lifetime of the instance. If the instance has failed over on the same or different node, it will get a different value for the InstanceId. */
  instanceId?: string;
}

/** Information about a stateful service replica deployed on a node. */
export interface DeployedStatefulServiceReplicaInfo
  extends DeployedServiceReplicaInfo {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  serviceKind: "Stateful";
  /** Id of a stateful service replica. ReplicaId is used by Service Fabric to uniquely identify a replica of a partition. It is unique within a partition and does not change for the lifetime of the replica. If a replica gets dropped and another replica gets created on the same node for the same partition, it will get a different value for the id. Sometimes the id of a stateless service instance is also referred as a replica id. */
  replicaId?: string;
  /** The role of a replica of a stateful service. */
  replicaRole?: ReplicaRole;
  /** Information about current reconfiguration like phase, type, previous configuration role of replica and reconfiguration start date time. */
  reconfigurationInformation?: ReconfigurationInformation;
}

/** Information about a stateless service instance deployed on a node. */
export interface DeployedStatelessServiceInstanceInfo
  extends DeployedServiceReplicaInfo {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  serviceKind: "Stateless";
  /** Id of a stateless service instance. InstanceId is used by Service Fabric to uniquely identify an instance of a partition of a stateless service. It is unique within a partition and does not change for the lifetime of the instance. If the instance has failed over on the same or different node, it will get a different value for the InstanceId. */
  instanceId?: string;
}

/** Information about a stateful replica running in a code package. Note DeployedServiceReplicaQueryResult will contain duplicate data like ServiceKind, ServiceName, PartitionId and replicaId. */
export interface DeployedStatefulServiceReplicaDetailInfo
  extends DeployedServiceReplicaDetailInfo {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  serviceKind: "Stateful";
  /** Id of a stateful service replica. ReplicaId is used by Service Fabric to uniquely identify a replica of a partition. It is unique within a partition and does not change for the lifetime of the replica. If a replica gets dropped and another replica gets created on the same node for the same partition, it will get a different value for the id. Sometimes the id of a stateless service instance is also referred as a replica id. */
  replicaId?: string;
  /** Specifies the operation currently being executed by the Replicator. */
  currentReplicatorOperation?: ReplicatorOperationName;
  /** Specifies the access status of the partition. */
  readStatus?: PartitionAccessStatus;
  /** Specifies the access status of the partition. */
  writeStatus?: PartitionAccessStatus;
  /**
   * Represents a base class for primary or secondary replicator status.
   * Contains information about the service fabric replicator like the replication/copy queue utilization, last acknowledgement received timestamp, etc.
   */
  replicatorStatus?: ReplicatorStatusUnion;
  /** Key value store related information for the replica. */
  replicaStatus?: KeyValueStoreReplicaStatus;
  /** Information about a stateful service replica deployed on a node. */
  deployedServiceReplicaQueryResult?: DeployedStatefulServiceReplicaInfo;
}

/** Information about a stateless instance running in a code package. Note that DeployedServiceReplicaQueryResult will contain duplicate data like ServiceKind, ServiceName, PartitionId and InstanceId. */
export interface DeployedStatelessServiceInstanceDetailInfo
  extends DeployedServiceReplicaDetailInfo {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  serviceKind: "Stateless";
  /** Id of a stateless service instance. InstanceId is used by Service Fabric to uniquely identify an instance of a partition of a stateless service. It is unique within a partition and does not change for the lifetime of the instance. If the instance has failed over on the same or different node, it will get a different value for the InstanceId. */
  instanceId?: string;
  /** Information about a stateless service instance deployed on a node. */
  deployedServiceReplicaQueryResult?: DeployedStatelessServiceInstanceInfo;
}

/** Describes a Chaos event that gets generated when Chaos has decided on the faults for an iteration. This Chaos event contains the details of the faults as a list of strings. */
export interface ExecutingFaultsChaosEvent extends ChaosEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ExecutingFaults";
  /** List of string description of the faults that Chaos decided to execute in an iteration. */
  faults?: string[];
}

/** Describes a Chaos event that gets generated when Chaos is started. */
export interface StartedChaosEvent extends ChaosEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Started";
  /** Defines all the parameters to configure a Chaos run. */
  chaosParameters?: ChaosParameters;
}

/** Describes a Chaos event that gets generated when Chaos stops because either the user issued a stop or the time to run was up. */
export interface StoppedChaosEvent extends ChaosEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Stopped";
  /** Describes why Chaos stopped. Chaos can stop because of StopChaos API call or the timeToRun provided in ChaosParameters is over. */
  reason?: string;
}

/**
 * Describes a Chaos event that gets generated when an unexpected event occurs in the Chaos engine.
 * For example, due to the cluster snapshot being inconsistent, while faulting an entity, Chaos found that the entity was already faulted -- which would be an unexpected event.
 */
export interface TestErrorChaosEvent extends ChaosEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "TestError";
  /** Describes why TestErrorChaosEvent was generated. For example, Chaos tries to fault a partition but finds that the partition is no longer fault tolerant, then a TestErrorEvent gets generated with the reason stating that the partition is not fault tolerant. */
  reason?: string;
}

/** Chaos event corresponding to a failure during validation. */
export interface ValidationFailedChaosEvent extends ChaosEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ValidationFailed";
  /** Describes why the ValidationFailedChaosEvent was generated. This may happen because more than MaxPercentUnhealthyNodes are unhealthy for more than MaxClusterStabilizationTimeout. This reason will be in the Reason property of the ValidationFailedChaosEvent as a string. */
  reason?: string;
}

/** Describes a Chaos event that gets generated when Chaos is waiting for the cluster to become ready for faulting, for example, Chaos may be waiting for the on-going upgrade to finish. */
export interface WaitingChaosEvent extends ChaosEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Waiting";
  /** Describes why the WaitingChaosEvent was generated, for example, due to a cluster upgrade. */
  reason?: string;
}

/** Describes the frequency based backup schedule. */
export interface FrequencyBasedBackupScheduleDescription
  extends BackupScheduleDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  scheduleKind: "FrequencyBased";
  /** Defines the interval with which backups are periodically taken. It should be specified in ISO8601 format. Timespan in seconds is not supported and will be ignored while creating the policy. */
  interval: string;
}

/** Describes the time based backup schedule. */
export interface TimeBasedBackupScheduleDescription
  extends BackupScheduleDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  scheduleKind: "TimeBased";
  /** Describes the frequency with which to run the time based backup schedule. */
  scheduleFrequencyType: BackupScheduleFrequencyType;
  /** List of days of a week when to trigger the periodic backup. This is valid only when the backup schedule frequency type is weekly. */
  runDays?: DayOfWeek[];
  /** Represents the list of exact time during the day in ISO8601 format. Like '19:00:00' will represent '7PM' during the day. Date specified along with time will be ignored. */
  runTimes: Date[];
}

/** Describes the parameters for Azure blob store used for storing and enumerating backups. */
export interface AzureBlobBackupStorageDescription
  extends BackupStorageDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  storageKind: "AzureBlobStore";
  /** The connection string to connect to the Azure blob store. */
  connectionString: string;
  /** The name of the container in the blob store to store and enumerate backups from. */
  containerName: string;
}

/** Describes the parameters for file share storage used for storing or enumerating backups. */
export interface FileShareBackupStorageDescription
  extends BackupStorageDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  storageKind: "FileShare";
  /** UNC path of the file share where to store or enumerate backups from. */
  path: string;
  /** Primary user name to access the file share. */
  primaryUserName?: string;
  /** Primary password to access the share location. */
  primaryPassword?: string;
  /** Secondary user name to access the file share. */
  secondaryUserName?: string;
  /** Secondary password to access the share location */
  secondaryPassword?: string;
}

/** Describes the parameters for Dsms Azure blob store used for storing and enumerating backups. */
export interface DsmsAzureBlobBackupStorageDescription
  extends BackupStorageDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  storageKind: "DsmsAzureBlobStore";
  /** The source location of the storage credentials to connect to the Dsms Azure blob store. */
  storageCredentialsSourceLocation: string;
  /** The name of the container in the blob store to store and enumerate backups from. */
  containerName: string;
}

/** Describes the parameters for Azure blob store (connected using managed identity) used for storing and enumerating backups. */
export interface ManagedIdentityAzureBlobBackupStorageDescription
  extends BackupStorageDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  storageKind: "ManagedIdentityAzureBlobStore";
  /** The type of managed identity to be used to connect to Azure Blob Store via Managed Identity. */
  managedIdentityType: ManagedIdentityType;
  /** The Blob Service Uri to connect to the Azure blob store.. */
  blobServiceUri: string;
  /** The name of the container in the blob store to store and enumerate backups from. */
  containerName: string;
}

/** Describes basic retention policy. */
export interface BasicRetentionPolicyDescription
  extends RetentionPolicyDescription {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  retentionPolicyType: "Basic";
  /** It is the minimum duration for which a backup created, will remain stored in the storage and might get deleted after that span of time. It should be specified in ISO8601 format. */
  retentionDuration: string;
  /** It is the minimum number of backups to be retained at any point of time. If specified with a non zero value, backups will not be deleted even if the backups have gone past retention duration and have number of backups less than or equal to it. */
  minimumNumberOfBackups?: number;
}

/** Identifies the Service Fabric application which is being backed up. */
export interface ApplicationBackupEntity extends BackupEntity {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  entityKind: "Application";
  /** The name of the application, including the 'fabric:' URI scheme. */
  applicationName?: string;
}

/** Identifies the Service Fabric stateful service which is being backed up. */
export interface ServiceBackupEntity extends BackupEntity {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  entityKind: "Service";
  /** The full name of the service with 'fabric:' URI scheme. */
  serviceName?: string;
}

/** Identifies the Service Fabric stateful partition which is being backed up. */
export interface PartitionBackupEntity extends BackupEntity {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  entityKind: "Partition";
  /** The full name of the service with 'fabric:' URI scheme. */
  serviceName?: string;
  /** The partition ID identifying the partition. */
  partitionId?: string;
}

/** Backup configuration information, for a specific partition, specifying what backup policy is being applied and suspend description, if any. */
export interface PartitionBackupConfigurationInfo
  extends BackupConfigurationInfo {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Partition";
  /** The full name of the service with 'fabric:' URI scheme. */
  serviceName?: string;
  /** The partition ID identifying the partition. */
  partitionId?: string;
}

/** Backup configuration information for a specific Service Fabric application specifying what backup policy is being applied and suspend description, if any. */
export interface ApplicationBackupConfigurationInfo
  extends BackupConfigurationInfo {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Application";
  /** The name of the application, including the 'fabric:' URI scheme. */
  applicationName?: string;
}

/** Backup configuration information for a specific Service Fabric service specifying what backup policy is being applied and suspend description, if any. */
export interface ServiceBackupConfigurationInfo
  extends BackupConfigurationInfo {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Service";
  /** The full name of the service with 'fabric:' URI scheme. */
  serviceName?: string;
}

/** Describes a Service Fabric property value of type Binary. */
export interface BinaryPropertyValue extends PropertyValue {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Binary";
  /** Array of bytes to be sent as an integer array. Each element of array is a number between 0 and 255. */
  data: number[];
}

/** Describes a Service Fabric property value of type Int64. */
export interface Int64PropertyValue extends PropertyValue {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Int64";
  /** The data of the property value. */
  data: string;
}

/** Describes a Service Fabric property value of type Double. */
export interface DoublePropertyValue extends PropertyValue {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Double";
  /** The data of the property value. */
  data: number;
}

/** Describes a Service Fabric property value of type String. */
export interface StringPropertyValue extends PropertyValue {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "String";
  /** The data of the property value. */
  data: string;
}

/** Describes a Service Fabric property value of type Guid. */
export interface GuidPropertyValue extends PropertyValue {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Guid";
  /** The data of the property value. */
  data: string;
}

/**
 * Represents a PropertyBatchOperation that compares the Boolean existence of a property with the Exists argument.
 * The PropertyBatchOperation operation fails if the property's existence is not equal to the Exists argument.
 * The CheckExistsPropertyBatchOperation is generally used as a precondition for the write operations in the batch.
 * Note that if one PropertyBatchOperation in a PropertyBatch fails,
 * the entire batch fails and cannot be committed in a transactional manner.
 */
export interface CheckExistsPropertyBatchOperation
  extends PropertyBatchOperation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "CheckExists";
  /** Whether or not the property should exist for the operation to pass. */
  exists: boolean;
}

/**
 * Compares the Sequence Number of a property with the SequenceNumber argument.
 * A property's sequence number can be thought of as that property's version.
 * Every time the property is modified, its sequence number is increased.
 * The sequence number can be found in a property's metadata.
 * The comparison fails if the sequence numbers are not equal.
 * CheckSequencePropertyBatchOperation is generally used as a precondition for the write operations in the batch.
 * Note that if one PropertyBatchOperation in a PropertyBatch fails,
 * the entire batch fails and cannot be committed in a transactional manner.
 */
export interface CheckSequencePropertyBatchOperation
  extends PropertyBatchOperation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "CheckSequence";
  /** The expected sequence number. */
  sequenceNumber: string;
}

/**
 * Represents a PropertyBatchOperation that compares the value of the property with the expected value.
 * The CheckValuePropertyBatchOperation is generally used as a precondition for the write operations in the batch.
 * Note that if one PropertyBatchOperation in a PropertyBatch fails,
 * the entire batch fails and cannot be committed in a transactional manner.
 */
export interface CheckValuePropertyBatchOperation
  extends PropertyBatchOperation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "CheckValue";
  /** The expected property value. */
  value: PropertyValueUnion;
}

/**
 * Represents a PropertyBatchOperation that deletes a specified property if it exists.
 * Note that if one PropertyBatchOperation in a PropertyBatch fails,
 * the entire batch fails and cannot be committed in a transactional manner.
 */
export interface DeletePropertyBatchOperation extends PropertyBatchOperation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Delete";
}

/**
 * Represents a PropertyBatchOperation that gets the specified property if it exists.
 * Note that if one PropertyBatchOperation in a PropertyBatch fails,
 * the entire batch fails and cannot be committed in a transactional manner.
 */
export interface GetPropertyBatchOperation extends PropertyBatchOperation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Get";
  /**
   * Whether or not to return the property value with the metadata.
   * True if values should be returned with the metadata; False to return only property metadata.
   */
  includeValue?: boolean;
}

/**
 * Puts the specified property under the specified name.
 * Note that if one PropertyBatchOperation in a PropertyBatch fails,
 * the entire batch fails and cannot be committed in a transactional manner.
 */
export interface PutPropertyBatchOperation extends PropertyBatchOperation {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Put";
  /** Describes a Service Fabric property value. */
  value: PropertyValueUnion;
  /** The property's custom type ID. Using this property, the user is able to tag the type of the value of the property. */
  customTypeId?: string;
}

/** Derived from PropertyBatchInfo. Represents the property batch succeeding. Contains the results of any "Get" operations in the batch. */
export interface SuccessfulPropertyBatchInfo extends PropertyBatchInfo {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Successful";
  /** A map containing the properties that were requested through any "Get" property batch operations. The key represents the index of the "Get" operation in the original request, in string form. The value is the property. If a property is not found, it will not be in the map. */
  properties?: { [propertyName: string]: PropertyInfo };
}

/** Derived from PropertyBatchInfo. Represents the property batch failing. Contains information about the specific batch failure. */
export interface FailedPropertyBatchInfo extends PropertyBatchInfo {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Failed";
  /** The error message of the failed operation. Describes the exception thrown due to the first unsuccessful operation in the property batch. */
  errorMessage?: string;
  /** The index of the unsuccessful operation in the property batch. */
  operationIndex?: number;
}

/** Represents the base for all Cluster Events. */
export interface ClusterEvent extends FabricEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind:
    | "ClusterEvent"
    | "ClusterNewHealthReport"
    | "ClusterHealthReportExpired"
    | "ClusterUpgradeCompleted"
    | "ClusterUpgradeDomainCompleted"
    | "ClusterUpgradeRollbackCompleted"
    | "ClusterUpgradeRollbackStarted"
    | "ClusterUpgradeStarted"
    | "ChaosStopped"
    | "ChaosStarted";
}

/** Represents the base for all Container Events. */
export interface ContainerInstanceEvent extends FabricEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ContainerInstanceEvent";
}

/** Represents the base for all Node Events. */
export interface NodeEvent extends FabricEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind:
    | "NodeEvent"
    | "NodeAborted"
    | "NodeAddedToCluster"
    | "NodeClosed"
    | "NodeDeactivateCompleted"
    | "NodeDeactivateStarted"
    | "NodeDown"
    | "NodeNewHealthReport"
    | "NodeHealthReportExpired"
    | "NodeOpenSucceeded"
    | "NodeOpenFailed"
    | "NodeRemovedFromCluster"
    | "NodeUp"
    | "ChaosNodeRestartScheduled";
  /** The name of a Service Fabric node. */
  nodeName: string;
}

/** Represents the base for all Application Events. */
export interface ApplicationEvent extends FabricEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind:
    | "ApplicationEvent"
    | "ApplicationCreated"
    | "ApplicationDeleted"
    | "ApplicationNewHealthReport"
    | "ApplicationHealthReportExpired"
    | "ApplicationUpgradeCompleted"
    | "ApplicationUpgradeDomainCompleted"
    | "ApplicationUpgradeRollbackCompleted"
    | "ApplicationUpgradeRollbackStarted"
    | "ApplicationUpgradeStarted"
    | "DeployedApplicationNewHealthReport"
    | "DeployedApplicationHealthReportExpired"
    | "ApplicationProcessExited"
    | "ApplicationContainerInstanceExited"
    | "DeployedServicePackageNewHealthReport"
    | "DeployedServicePackageHealthReportExpired"
    | "ChaosCodePackageRestartScheduled";
  /**
   * The identity of the application. This is an encoded representation of the application name. This is used in the REST APIs to identify the application resource.
   * Starting in version 6.0, hierarchical names are delimited with the "\~" character. For example, if the application name is "fabric:/myapp/app1",
   * the application identity would be "myapp\~app1" in 6.0+ and "myapp/app1" in previous versions.
   */
  applicationId: string;
}

/** Represents the base for all Service Events. */
export interface ServiceEvent extends FabricEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind:
    | "ServiceEvent"
    | "ServiceCreated"
    | "ServiceDeleted"
    | "ServiceNewHealthReport"
    | "ServiceHealthReportExpired";
  /**
   * The identity of the service. This ID is an encoded representation of the service name. This is used in the REST APIs to identify the service resource.
   * Starting in version 6.0, hierarchical names are delimited with the "\~" character. For example, if the service name is "fabric:/myapp/app1/svc1",
   * the service identity would be "myapp~app1\~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   */
  serviceId: string;
}

/** Represents the base for all Partition Events. */
export interface PartitionEvent extends FabricEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind:
    | "PartitionEvent"
    | "PartitionAnalysisEvent"
    | "PartitionNewHealthReport"
    | "PartitionHealthReportExpired"
    | "PartitionReconfigured"
    | "PartitionPrimaryMoveAnalysis"
    | "ChaosPartitionSecondaryMoveScheduled"
    | "ChaosPartitionPrimaryMoveScheduled";
  /** An internal ID used by Service Fabric to uniquely identify a partition. This is a randomly generated GUID when the service was created. The partition ID is unique and does not change for the lifetime of the service. If the same service was deleted and recreated the IDs of its partitions would be different. */
  partitionId: string;
}

/** Represents the base for all Replica Events. */
export interface ReplicaEvent extends FabricEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind:
    | "ReplicaEvent"
    | "StatefulReplicaNewHealthReport"
    | "StatefulReplicaHealthReportExpired"
    | "StatelessReplicaNewHealthReport"
    | "StatelessReplicaHealthReportExpired"
    | "ChaosReplicaRemovalScheduled"
    | "ChaosReplicaRestartScheduled";
  /** An internal ID used by Service Fabric to uniquely identify a partition. This is a randomly generated GUID when the service was created. The partition ID is unique and does not change for the lifetime of the service. If the same service was deleted and recreated the IDs of its partitions would be different. */
  partitionId: string;
  /** Id of a stateful service replica. ReplicaId is used by Service Fabric to uniquely identify a replica of a partition. It is unique within a partition and does not change for the lifetime of the replica. If a replica gets dropped and another replica gets created on the same node for the same partition, it will get a different value for the id. Sometimes the id of a stateless service instance is also referred as a replica id. */
  replicaId: number;
}

/** Describes the properties of a secret resource. */
export interface SecretResourceProperties extends SecretResourcePropertiesBase {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "SecretResourceProperties" | "inlinedValue";
  /** User readable description of the secret. */
  description?: string;
  /**
   * Status of the resource.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly status?: ResourceStatus;
  /**
   * Gives additional information about the current status of the secret.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly statusDetails?: string;
  /** The type of the content stored in the secret value. The value of this property is opaque to Service Fabric. Once set, the value of this property cannot be changed. */
  contentType?: string;
}

/** This type describes properties of a secret value resource. */
export interface SecretValueResourceProperties extends SecretValueProperties {}

/** Describes properties of a network resource. */
export interface NetworkResourceProperties
  extends NetworkResourcePropertiesBase {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "NetworkResourceProperties" | "Local";
  /** User readable description of the network. */
  description?: string;
  /**
   * Status of the network.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly status?: ResourceStatus;
  /**
   * Gives additional information about the current status of the network.
   * NOTE: This property will not be serialized. It can only be populated by the server.
   */
  readonly statusDetails?: string;
}

/** This type describes properties of a service resource. */
export interface ServiceResourceProperties
  extends ServiceReplicaProperties,
    ServiceProperties {}

/** Describes a replica of a service resource. */
export interface ServiceReplicaDescription extends ServiceReplicaProperties {
  /** Name of the replica. */
  replicaName: string;
}

/** Describes a volume whose lifetime is scoped to the application's lifetime. */
export interface ApplicationScopedVolume extends VolumeReference {
  /** Describes parameters for creating application-scoped volumes. */
  creationParameters: ApplicationScopedVolumeCreationParametersUnion;
}

/** Describes parameters for creating application-scoped volumes provided by Service Fabric Volume Disks */
export interface ApplicationScopedVolumeCreationParametersServiceFabricVolumeDisk
  extends ApplicationScopedVolumeCreationParameters {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ServiceFabricVolumeDisk";
  /** Volume size */
  sizeDisk: SizeTypes;
}

/** The default execution policy. Always restart the service if an exit occurs. */
export interface DefaultExecutionPolicy extends ExecutionPolicy {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  type: "Default";
}

/** The run to completion execution policy, the service will perform its desired operation and complete successfully. If the service encounters failure, it will restarted based on restart policy specified. If the service completes its operation successfully, it will not be restarted again. */
export interface RunToCompletionExecutionPolicy extends ExecutionPolicy {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  type: "RunToCompletion";
  /** Enumerates the restart policy for RunToCompletionExecutionPolicy */
  restart: RestartPolicy;
}

/** Describes the average load trigger used for auto scaling. */
export interface AverageLoadScalingTrigger extends AutoScalingTrigger {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "AverageLoad";
  /** Description of the metric that is used for scaling. */
  metric: AutoScalingMetricUnion;
  /** Lower load threshold (if average load is below this threshold, service will scale down). */
  lowerLoadThreshold: number;
  /** Upper load threshold (if average load is above this threshold, service will scale up). */
  upperLoadThreshold: number;
  /** Scale interval that indicates how often will this trigger be checked. */
  scaleIntervalInSeconds: number;
}

/** Describes the horizontal auto scaling mechanism that adds or removes replicas (containers or container groups). */
export interface AddRemoveReplicaScalingMechanism extends AutoScalingMechanism {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "AddRemoveReplica";
  /** Minimum number of containers (scale down won't be performed below this number). */
  minCount: number;
  /** Maximum number of containers (scale up won't be performed above this number). */
  maxCount: number;
  /** Each time auto scaling is performed, this number of containers will be added or removed. */
  scaleIncrement: number;
}

/** Diagnostics settings for Geneva. */
export interface AzureInternalMonitoringPipelineSinkDescription
  extends DiagnosticsSinkProperties {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "AzureInternalMonitoringPipeline";
  /** Azure Internal monitoring pipeline account. */
  accountName?: string;
  /** Azure Internal monitoring pipeline account namespace. */
  namespace?: string;
  /** Azure Internal monitoring agent configuration. */
  maConfigUrl?: string;
  /** Azure Internal monitoring agent fluentd configuration. */
  fluentdConfigUrl?: string;
  /** Azure Internal monitoring pipeline autokey associated with the certificate. */
  autoKeyConfigUrl?: string;
}

/** Provides statistics about the Service Fabric Replicator, when it is functioning in a Primary role. */
export interface PrimaryReplicatorStatus extends ReplicatorStatus {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Primary";
  /** Details about the replication queue on the primary replicator. */
  replicationQueueStatus?: ReplicatorQueueStatus;
  /** The status of all the active and idle secondary replicators that the primary is aware of. */
  remoteReplicators?: RemoteReplicatorStatus[];
}

/** Provides statistics about the Service Fabric Replicator, when it is functioning in a ActiveSecondary role. */
export interface SecondaryReplicatorStatus extends ReplicatorStatus {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "SecondaryReplicatorStatus" | "ActiveSecondary" | "IdleSecondary";
  /** Details about the replication queue on the secondary replicator. */
  replicationQueueStatus?: ReplicatorQueueStatus;
  /**
   * The last time-stamp (UTC) at which a replication operation was received from the primary.
   * UTC 0 represents an invalid value, indicating that a replication operation message was never received.
   */
  lastReplicationOperationReceivedTimeUtc?: Date;
  /** Value that indicates whether the replica is currently being built. */
  isInBuild?: boolean;
  /** Details about the copy queue on the secondary replicator. */
  copyQueueStatus?: ReplicatorQueueStatus;
  /**
   * The last time-stamp (UTC) at which a copy operation was received from the primary.
   * UTC 0 represents an invalid value, indicating that a copy operation message was never received.
   */
  lastCopyOperationReceivedTimeUtc?: Date;
  /**
   * The last time-stamp (UTC) at which an acknowledgment was sent to the primary replicator.
   * UTC 0 represents an invalid value, indicating that an acknowledgment message was never sent.
   */
  lastAcknowledgementSentTimeUtc?: Date;
}

/** Key value store related information for the replica. */
export interface KeyValueStoreReplicaStatus extends ReplicaStatusBase {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "KeyValueStore";
  /** Value indicating the estimated number of rows in the underlying database. */
  databaseRowCountEstimate?: string;
  /** Value indicating the estimated size of the underlying database. */
  databaseLogicalSizeEstimate?: string;
  /** Value indicating the latest key-prefix filter applied to enumeration during the callback. Null if there is no pending callback. */
  copyNotificationCurrentKeyFilter?: string;
  /** Value indicating the latest number of keys enumerated during the callback. 0 if there is no pending callback. */
  copyNotificationCurrentProgress?: string;
  /** Value indicating the current status details of the replica. */
  statusDetails?: string;
}

/** Describes the resource that is used for triggering auto scaling. */
export interface AutoScalingResourceMetric extends AutoScalingMetric {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Resource";
  /** Name of the resource. */
  name: AutoScalingResourceMetricName;
}

/** Represents the health state of the stateful service replica, which contains the replica ID and the aggregated health state. */
export interface StatefulServiceReplicaHealthState extends ReplicaHealthState {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  serviceKind: "Stateful";
  /** Id of a stateful service replica. ReplicaId is used by Service Fabric to uniquely identify a replica of a partition. It is unique within a partition and does not change for the lifetime of the replica. If a replica gets dropped and another replica gets created on the same node for the same partition, it will get a different value for the id. Sometimes the id of a stateless service instance is also referred as a replica id. */
  replicaId?: string;
}

/** Represents the health state of the stateless service instance, which contains the instance ID and the aggregated health state. */
export interface StatelessServiceInstanceHealthState
  extends ReplicaHealthState {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  serviceKind: "Stateless";
  /** Id of the stateless service instance on the wire this field is called ReplicaId. */
  replicaId?: string;
}

/**
 * Represents the health of the stateful service replica.
 * Contains the replica aggregated health state, the health events and the unhealthy evaluations.
 */
export interface StatefulServiceReplicaHealth extends ReplicaHealth {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  serviceKind: "Stateful";
  /** Id of a stateful service replica. ReplicaId is used by Service Fabric to uniquely identify a replica of a partition. It is unique within a partition and does not change for the lifetime of the replica. If a replica gets dropped and another replica gets created on the same node for the same partition, it will get a different value for the id. Sometimes the id of a stateless service instance is also referred as a replica id. */
  replicaId?: string;
}

/**
 * Represents the health of the stateless service instance.
 * Contains the instance aggregated health state, the health events and the unhealthy evaluations.
 */
export interface StatelessServiceInstanceHealth extends ReplicaHealth {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  serviceKind: "Stateless";
  /** Id of a stateless service instance. InstanceId is used by Service Fabric to uniquely identify an instance of a partition of a stateless service. It is unique within a partition and does not change for the lifetime of the instance. If the instance has failed over on the same or different node, it will get a different value for the InstanceId. */
  instanceId?: string;
}

/** Safety check that waits to ensure the availability of the partition. It waits until there are replicas available such that bringing down this replica will not cause availability loss for the partition. */
export interface EnsureAvailabilitySafetyCheck extends PartitionSafetyCheck {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "EnsureAvailability";
}

/** Safety check that ensures that a quorum of replicas are not lost for a partition. */
export interface EnsurePartitionQuorumSafetyCheck extends PartitionSafetyCheck {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "EnsurePartitionQuorum";
}

/** Safety check that waits for the replica build operation to finish. This indicates that there is a replica that is going through the copy or is providing data for building another replica. Bring the node down will abort this copy operation which are typically expensive involving data movements. */
export interface WaitForInbuildReplicaSafetyCheck extends PartitionSafetyCheck {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "WaitForInbuildReplica";
}

/** Safety check that waits for the primary replica that was moved out of the node due to upgrade to be placed back again on that node. */
export interface WaitForPrimaryPlacementSafetyCheck
  extends PartitionSafetyCheck {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "WaitForPrimaryPlacement";
}

/** Safety check that waits for the primary replica to be moved out of the node before starting an upgrade to ensure the availability of the primary replica for the partition. */
export interface WaitForPrimarySwapSafetyCheck extends PartitionSafetyCheck {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "WaitForPrimarySwap";
}

/** Safety check that waits for the current reconfiguration of the partition to be completed before starting an upgrade. */
export interface WaitForReconfigurationSafetyCheck
  extends PartitionSafetyCheck {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "WaitForReconfiguration";
}

/** Cluster Health Report Created event. */
export interface ClusterNewHealthReportEvent extends ClusterEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ClusterNewHealthReport";
  /** Id of report source. */
  sourceId: string;
  /** Describes the property. */
  property: string;
  /** Describes the property health state. */
  healthState: string;
  /** Time to live in milli-seconds. */
  timeToLiveMs: number;
  /** Sequence number of report. */
  sequenceNumber: number;
  /** Description of report. */
  description: string;
  /** Indicates the removal when it expires. */
  removeWhenExpired: boolean;
  /** Source time. */
  sourceUtcTimestamp: Date;
}

/** Cluster Health Report Expired event. */
export interface ClusterHealthReportExpiredEvent extends ClusterEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ClusterHealthReportExpired";
  /** Id of report source. */
  sourceId: string;
  /** Describes the property. */
  property: string;
  /** Describes the property health state. */
  healthState: string;
  /** Time to live in milli-seconds. */
  timeToLiveMs: number;
  /** Sequence number of report. */
  sequenceNumber: number;
  /** Description of report. */
  description: string;
  /** Indicates the removal when it expires. */
  removeWhenExpired: boolean;
  /** Source time. */
  sourceUtcTimestamp: Date;
}

/** Cluster Upgrade Completed event. */
export interface ClusterUpgradeCompletedEvent extends ClusterEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ClusterUpgradeCompleted";
  /** Target Cluster version. */
  targetClusterVersion: string;
  /** Overall duration of upgrade in milli-seconds. */
  overallUpgradeElapsedTimeInMs: number;
}

/** Cluster Upgrade Domain Completed event. */
export interface ClusterUpgradeDomainCompletedEvent extends ClusterEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ClusterUpgradeDomainCompleted";
  /** Target Cluster version. */
  targetClusterVersion: string;
  /** State of upgrade. */
  upgradeState: string;
  /** Upgrade domains. */
  upgradeDomains: string;
  /** Duration of domain upgrade in milli-seconds. */
  upgradeDomainElapsedTimeInMs: number;
}

/** Cluster Upgrade Rollback Completed event. */
export interface ClusterUpgradeRollbackCompletedEvent extends ClusterEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ClusterUpgradeRollbackCompleted";
  /** Target Cluster version. */
  targetClusterVersion: string;
  /** Describes failure. */
  failureReason: string;
  /** Overall duration of upgrade in milli-seconds. */
  overallUpgradeElapsedTimeInMs: number;
}

/** Cluster Upgrade Rollback Started event. */
export interface ClusterUpgradeRollbackStartedEvent extends ClusterEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ClusterUpgradeRollbackStarted";
  /** Target Cluster version. */
  targetClusterVersion: string;
  /** Describes failure. */
  failureReason: string;
  /** Overall duration of upgrade in milli-seconds. */
  overallUpgradeElapsedTimeInMs: number;
}

/** Cluster Upgrade Started event. */
export interface ClusterUpgradeStartedEvent extends ClusterEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ClusterUpgradeStarted";
  /** Current Cluster version. */
  currentClusterVersion: string;
  /** Target Cluster version. */
  targetClusterVersion: string;
  /** Type of upgrade. */
  upgradeType: string;
  /** Mode of upgrade. */
  rollingUpgradeMode: string;
  /** Action if failed. */
  failureAction: string;
}

/** Chaos Stopped event. */
export interface ChaosStoppedEvent extends ClusterEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ChaosStopped";
  /** Describes reason. */
  reason: string;
}

/** Chaos Started event. */
export interface ChaosStartedEvent extends ClusterEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ChaosStarted";
  /** Maximum number of concurrent faults. */
  maxConcurrentFaults: number;
  /** Time to run in seconds. */
  timeToRunInSeconds: number;
  /** Maximum timeout for cluster stabilization in seconds. */
  maxClusterStabilizationTimeoutInSeconds: number;
  /** Wait time between iterations in seconds. */
  waitTimeBetweenIterationsInSeconds: number;
  /** Wait time between faults in seconds. */
  waitTimeBetweenFaultsInSeconds: number;
  /** Indicates MoveReplica fault is enabled. */
  moveReplicaFaultEnabled: boolean;
  /** List of included Node types. */
  includedNodeTypeList: string;
  /** List of included Applications. */
  includedApplicationList: string;
  /** Health policy. */
  clusterHealthPolicy: string;
  /** Chaos Context. */
  chaosContext: string;
}

/** Node Aborted event. */
export interface NodeAbortedEvent extends NodeEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "NodeAborted";
  /** Id of Node instance. */
  nodeInstance: number;
  /** Id of Node. */
  nodeId: string;
  /** Upgrade domain of Node. */
  upgradeDomain: string;
  /** Fault domain of Node. */
  faultDomain: string;
  /** IP address or FQDN. */
  ipAddressOrFqdn: string;
  /** Name of Host. */
  hostname: string;
  /** Indicates if it is seed node. */
  isSeedNode: boolean;
  /** Version of Node. */
  nodeVersion: string;
}

/** Node Added event. */
export interface NodeAddedToClusterEvent extends NodeEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "NodeAddedToCluster";
  /** Id of Node. */
  nodeId: string;
  /** Id of Node instance. */
  nodeInstance: number;
  /** Type of Node. */
  nodeType: string;
  /** Fabric version. */
  fabricVersion: string;
  /** IP address or FQDN. */
  ipAddressOrFqdn: string;
  /** Capacities. */
  nodeCapacities: string;
}

/** Node Closed event. */
export interface NodeClosedEvent extends NodeEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "NodeClosed";
  /** Id of Node. */
  nodeId: string;
  /** Id of Node instance. */
  nodeInstance: number;
  /** Describes error. */
  error: string;
}

/** Node Deactivate Completed event. */
export interface NodeDeactivateCompletedEvent extends NodeEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "NodeDeactivateCompleted";
  /** Id of Node instance. */
  nodeInstance: number;
  /** Describes deactivate intent. */
  effectiveDeactivateIntent: string;
  /** Batch Ids. */
  batchIdsWithDeactivateIntent: string;
  /** Start time. */
  startTime: Date;
}

/** Node Deactivate Started event. */
export interface NodeDeactivateStartedEvent extends NodeEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "NodeDeactivateStarted";
  /** Id of Node instance. */
  nodeInstance: number;
  /** Batch Id. */
  batchId: string;
  /** Describes deactivate intent. */
  deactivateIntent: string;
}

/** Node Down event. */
export interface NodeDownEvent extends NodeEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "NodeDown";
  /** Id of Node instance. */
  nodeInstance: number;
  /** Time when Node was last up. */
  lastNodeUpAt: Date;
}

/** Node Health Report Created event. */
export interface NodeNewHealthReportEvent extends NodeEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "NodeNewHealthReport";
  /** Id of Node instance. */
  nodeInstanceId: number;
  /** Id of report source. */
  sourceId: string;
  /** Describes the property. */
  property: string;
  /** Describes the property health state. */
  healthState: string;
  /** Time to live in milli-seconds. */
  timeToLiveMs: number;
  /** Sequence number of report. */
  sequenceNumber: number;
  /** Description of report. */
  description: string;
  /** Indicates the removal when it expires. */
  removeWhenExpired: boolean;
  /** Source time. */
  sourceUtcTimestamp: Date;
}

/** Node Health Report Expired event. */
export interface NodeHealthReportExpiredEvent extends NodeEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "NodeHealthReportExpired";
  /** Id of Node instance. */
  nodeInstanceId: number;
  /** Id of report source. */
  sourceId: string;
  /** Describes the property. */
  property: string;
  /** Describes the property health state. */
  healthState: string;
  /** Time to live in milli-seconds. */
  timeToLiveMs: number;
  /** Sequence number of report. */
  sequenceNumber: number;
  /** Description of report. */
  description: string;
  /** Indicates the removal when it expires. */
  removeWhenExpired: boolean;
  /** Source time. */
  sourceUtcTimestamp: Date;
}

/** Node Opened Succeeded event. */
export interface NodeOpenSucceededEvent extends NodeEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "NodeOpenSucceeded";
  /** Id of Node instance. */
  nodeInstance: number;
  /** Id of Node. */
  nodeId: string;
  /** Upgrade domain of Node. */
  upgradeDomain: string;
  /** Fault domain of Node. */
  faultDomain: string;
  /** IP address or FQDN. */
  ipAddressOrFqdn: string;
  /** Name of Host. */
  hostname: string;
  /** Indicates if it is seed node. */
  isSeedNode: boolean;
  /** Version of Node. */
  nodeVersion: string;
}

/** Node Open Failed event. */
export interface NodeOpenFailedEvent extends NodeEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "NodeOpenFailed";
  /** Id of Node instance. */
  nodeInstance: number;
  /** Id of Node. */
  nodeId: string;
  /** Upgrade domain of Node. */
  upgradeDomain: string;
  /** Fault domain of Node. */
  faultDomain: string;
  /** IP address or FQDN. */
  ipAddressOrFqdn: string;
  /** Name of Host. */
  hostname: string;
  /** Indicates if it is seed node. */
  isSeedNode: boolean;
  /** Version of Node. */
  nodeVersion: string;
  /** Describes the error. */
  error: string;
}

/** Node Removed event. */
export interface NodeRemovedFromClusterEvent extends NodeEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "NodeRemovedFromCluster";
  /** Id of Node. */
  nodeId: string;
  /** Id of Node instance. */
  nodeInstance: number;
  /** Type of Node. */
  nodeType: string;
  /** Fabric version. */
  fabricVersion: string;
  /** IP address or FQDN. */
  ipAddressOrFqdn: string;
  /** Capacities. */
  nodeCapacities: string;
}

/** Node Up event. */
export interface NodeUpEvent extends NodeEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "NodeUp";
  /** Id of Node instance. */
  nodeInstance: number;
  /** Time when Node was last down. */
  lastNodeDownAt: Date;
}

/** Chaos Restart Node Fault Scheduled event. */
export interface ChaosNodeRestartScheduledEvent extends NodeEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ChaosNodeRestartScheduled";
  /** Id of Node instance. */
  nodeInstanceId: number;
  /** Id of fault group. */
  faultGroupId: string;
  /** Id of fault. */
  faultId: string;
}

/** Application Created event. */
export interface ApplicationCreatedEvent extends ApplicationEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ApplicationCreated";
  /** Application type name. */
  applicationTypeName: string;
  /** Application type version. */
  applicationTypeVersion: string;
  /** Application definition kind. */
  applicationDefinitionKind: string;
}

/** Application Deleted event. */
export interface ApplicationDeletedEvent extends ApplicationEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ApplicationDeleted";
  /** Application type name. */
  applicationTypeName: string;
  /** Application type version. */
  applicationTypeVersion: string;
}

/** Application Health Report Created event. */
export interface ApplicationNewHealthReportEvent extends ApplicationEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ApplicationNewHealthReport";
  /** Id of Application instance. */
  applicationInstanceId: number;
  /** Id of report source. */
  sourceId: string;
  /** Describes the property. */
  property: string;
  /** Describes the property health state. */
  healthState: string;
  /** Time to live in milli-seconds. */
  timeToLiveMs: number;
  /** Sequence number of report. */
  sequenceNumber: number;
  /** Description of report. */
  description: string;
  /** Indicates the removal when it expires. */
  removeWhenExpired: boolean;
  /** Source time. */
  sourceUtcTimestamp: Date;
}

/** Application Health Report Expired event. */
export interface ApplicationHealthReportExpiredEvent extends ApplicationEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ApplicationHealthReportExpired";
  /** Id of Application instance. */
  applicationInstanceId: number;
  /** Id of report source. */
  sourceId: string;
  /** Describes the property. */
  property: string;
  /** Describes the property health state. */
  healthState: string;
  /** Time to live in milli-seconds. */
  timeToLiveMs: number;
  /** Sequence number of report. */
  sequenceNumber: number;
  /** Description of report. */
  description: string;
  /** Indicates the removal when it expires. */
  removeWhenExpired: boolean;
  /** Source time. */
  sourceUtcTimestamp: Date;
}

/** Application Upgrade Completed event. */
export interface ApplicationUpgradeCompletedEvent extends ApplicationEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ApplicationUpgradeCompleted";
  /** Application type name. */
  applicationTypeName: string;
  /** Application type version. */
  applicationTypeVersion: string;
  /** Overall upgrade time in milli-seconds. */
  overallUpgradeElapsedTimeInMs: number;
}

/** Application Upgrade Domain Completed event. */
export interface ApplicationUpgradeDomainCompletedEvent
  extends ApplicationEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ApplicationUpgradeDomainCompleted";
  /** Application type name. */
  applicationTypeName: string;
  /** Current Application type version. */
  currentApplicationTypeVersion: string;
  /** Target Application type version. */
  applicationTypeVersion: string;
  /** State of upgrade. */
  upgradeState: string;
  /** Upgrade domains. */
  upgradeDomains: string;
  /** Upgrade time of domain in milli-seconds. */
  upgradeDomainElapsedTimeInMs: number;
}

/** Application Upgrade Rollback Completed event. */
export interface ApplicationUpgradeRollbackCompletedEvent
  extends ApplicationEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ApplicationUpgradeRollbackCompleted";
  /** Application type name. */
  applicationTypeName: string;
  /** Application type version. */
  applicationTypeVersion: string;
  /** Describes reason of failure. */
  failureReason: string;
  /** Overall upgrade time in milli-seconds. */
  overallUpgradeElapsedTimeInMs: number;
}

/** Application Upgrade Rollback Started event. */
export interface ApplicationUpgradeRollbackStartedEvent
  extends ApplicationEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ApplicationUpgradeRollbackStarted";
  /** Application type name. */
  applicationTypeName: string;
  /** Current Application type version. */
  currentApplicationTypeVersion: string;
  /** Target Application type version. */
  applicationTypeVersion: string;
  /** Describes reason of failure. */
  failureReason: string;
  /** Overall upgrade time in milli-seconds. */
  overallUpgradeElapsedTimeInMs: number;
}

/** Application Upgrade Started event. */
export interface ApplicationUpgradeStartedEvent extends ApplicationEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ApplicationUpgradeStarted";
  /** Application type name. */
  applicationTypeName: string;
  /** Current Application type version. */
  currentApplicationTypeVersion: string;
  /** Target Application type version. */
  applicationTypeVersion: string;
  /** Type of upgrade. */
  upgradeType: string;
  /** Mode of upgrade. */
  rollingUpgradeMode: string;
  /** Action if failed. */
  failureAction: string;
}

/** Deployed Application Health Report Created event. */
export interface DeployedApplicationNewHealthReportEvent
  extends ApplicationEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "DeployedApplicationNewHealthReport";
  /** Id of Application instance. */
  applicationInstanceId: number;
  /** The name of a Service Fabric node. */
  nodeName: string;
  /** Id of report source. */
  sourceId: string;
  /** Describes the property. */
  property: string;
  /** Describes the property health state. */
  healthState: string;
  /** Time to live in milli-seconds. */
  timeToLiveMs: number;
  /** Sequence number of report. */
  sequenceNumber: number;
  /** Description of report. */
  description: string;
  /** Indicates the removal when it expires. */
  removeWhenExpired: boolean;
  /** Source time. */
  sourceUtcTimestamp: Date;
}

/** Deployed Application Health Report Expired event. */
export interface DeployedApplicationHealthReportExpiredEvent
  extends ApplicationEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "DeployedApplicationHealthReportExpired";
  /** Id of Application instance. */
  applicationInstanceId: number;
  /** The name of a Service Fabric node. */
  nodeName: string;
  /** Id of report source. */
  sourceId: string;
  /** Describes the property. */
  property: string;
  /** Describes the property health state. */
  healthState: string;
  /** Time to live in milli-seconds. */
  timeToLiveMs: number;
  /** Sequence number of report. */
  sequenceNumber: number;
  /** Description of report. */
  description: string;
  /** Indicates the removal when it expires. */
  removeWhenExpired: boolean;
  /** Source time. */
  sourceUtcTimestamp: Date;
}

/** Process Exited event. */
export interface ApplicationProcessExitedEvent extends ApplicationEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ApplicationProcessExited";
  /** Name of Service. */
  serviceName: string;
  /** Name of Service package. */
  servicePackageName: string;
  /** Activation Id of Service package. */
  servicePackageActivationId: string;
  /** Indicates IsExclusive flag. */
  isExclusive: boolean;
  /** Name of Code package. */
  codePackageName: string;
  /** Type of EntryPoint. */
  entryPointType: string;
  /** Name of executable. */
  exeName: string;
  /** Process Id. */
  processId: number;
  /** Host Id. */
  hostId: string;
  /** Exit code of process. */
  exitCode: number;
  /** Indicates if termination is unexpected. */
  unexpectedTermination: boolean;
  /** Start time of process. */
  startTime: Date;
}

/** Container Exited event. */
export interface ApplicationContainerInstanceExitedEvent
  extends ApplicationEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ApplicationContainerInstanceExited";
  /** Name of Service. */
  serviceName: string;
  /** Name of Service package. */
  servicePackageName: string;
  /** Activation Id of Service package. */
  servicePackageActivationId: string;
  /** Indicates IsExclusive flag. */
  isExclusive: boolean;
  /** Name of Code package. */
  codePackageName: string;
  /** Type of EntryPoint. */
  entryPointType: string;
  /** Name of Container image. */
  imageName: string;
  /** Name of Container. */
  containerName: string;
  /** Host Id. */
  hostId: string;
  /** Exit code of process. */
  exitCode: number;
  /** Indicates if termination is unexpected. */
  unexpectedTermination: boolean;
  /** Start time of process. */
  startTime: Date;
}

/** Deployed Service Health Report Created event. */
export interface DeployedServicePackageNewHealthReportEvent
  extends ApplicationEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "DeployedServicePackageNewHealthReport";
  /** Service manifest name. */
  serviceManifestName: string;
  /** Id of Service package instance. */
  servicePackageInstanceId: number;
  /** Id of Service package activation. */
  servicePackageActivationId: string;
  /** The name of a Service Fabric node. */
  nodeName: string;
  /** Id of report source. */
  sourceId: string;
  /** Describes the property. */
  property: string;
  /** Describes the property health state. */
  healthState: string;
  /** Time to live in milli-seconds. */
  timeToLiveMs: number;
  /** Sequence number of report. */
  sequenceNumber: number;
  /** Description of report. */
  description: string;
  /** Indicates the removal when it expires. */
  removeWhenExpired: boolean;
  /** Source time. */
  sourceUtcTimestamp: Date;
}

/** Deployed Service Health Report Expired event. */
export interface DeployedServicePackageHealthReportExpiredEvent
  extends ApplicationEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "DeployedServicePackageHealthReportExpired";
  /** Service manifest name. */
  serviceManifest: string;
  /** Id of Service package instance. */
  servicePackageInstanceId: number;
  /** Id of Service package activation. */
  servicePackageActivationId: string;
  /** The name of a Service Fabric node. */
  nodeName: string;
  /** Id of report source. */
  sourceId: string;
  /** Describes the property. */
  property: string;
  /** Describes the property health state. */
  healthState: string;
  /** Time to live in milli-seconds. */
  timeToLiveMs: number;
  /** Sequence number of report. */
  sequenceNumber: number;
  /** Description of report. */
  description: string;
  /** Indicates the removal when it expires. */
  removeWhenExpired: boolean;
  /** Source time. */
  sourceUtcTimestamp: Date;
}

/** Chaos Restart Code Package Fault Scheduled event. */
export interface ChaosCodePackageRestartScheduledEvent
  extends ApplicationEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ChaosCodePackageRestartScheduled";
  /** Id of fault group. */
  faultGroupId: string;
  /** Id of fault. */
  faultId: string;
  /** The name of a Service Fabric node. */
  nodeName: string;
  /** Service manifest name. */
  serviceManifestName: string;
  /** Code package name. */
  codePackageName: string;
  /** Id of Service package activation. */
  servicePackageActivationId: string;
}

/** Service Created event. */
export interface ServiceCreatedEvent extends ServiceEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ServiceCreated";
  /** Service type name. */
  serviceTypeName: string;
  /** Application name. */
  applicationName: string;
  /** Application type name. */
  applicationTypeName: string;
  /** Id of Service instance. */
  serviceInstance: number;
  /** Indicates if Service is stateful. */
  isStateful: boolean;
  /** Number of partitions. */
  partitionCount: number;
  /** Size of target replicas set. */
  targetReplicaSetSize: number;
  /** Minimum size of replicas set. */
  minReplicaSetSize: number;
  /** Version of Service package. */
  servicePackageVersion: string;
  /** An internal ID used by Service Fabric to uniquely identify a partition. This is a randomly generated GUID when the service was created. The partition ID is unique and does not change for the lifetime of the service. If the same service was deleted and recreated the IDs of its partitions would be different. */
  partitionId: string;
}

/** Service Deleted event. */
export interface ServiceDeletedEvent extends ServiceEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ServiceDeleted";
  /** Service type name. */
  serviceTypeName: string;
  /** Application name. */
  applicationName: string;
  /** Application type name. */
  applicationTypeName: string;
  /** Id of Service instance. */
  serviceInstance: number;
  /** Indicates if Service is stateful. */
  isStateful: boolean;
  /** Number of partitions. */
  partitionCount: number;
  /** Size of target replicas set. */
  targetReplicaSetSize: number;
  /** Minimum size of replicas set. */
  minReplicaSetSize: number;
  /** Version of Service package. */
  servicePackageVersion: string;
}

/** Service Health Report Created event. */
export interface ServiceNewHealthReportEvent extends ServiceEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ServiceNewHealthReport";
  /** Id of Service instance. */
  instanceId: number;
  /** Id of report source. */
  sourceId: string;
  /** Describes the property. */
  property: string;
  /** Describes the property health state. */
  healthState: string;
  /** Time to live in milli-seconds. */
  timeToLiveMs: number;
  /** Sequence number of report. */
  sequenceNumber: number;
  /** Description of report. */
  description: string;
  /** Indicates the removal when it expires. */
  removeWhenExpired: boolean;
  /** Source time. */
  sourceUtcTimestamp: Date;
}

/** Service Health Report Expired event. */
export interface ServiceHealthReportExpiredEvent extends ServiceEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ServiceHealthReportExpired";
  /** Id of Service instance. */
  instanceId: number;
  /** Id of report source. */
  sourceId: string;
  /** Describes the property. */
  property: string;
  /** Describes the property health state. */
  healthState: string;
  /** Time to live in milli-seconds. */
  timeToLiveMs: number;
  /** Sequence number of report. */
  sequenceNumber: number;
  /** Description of report. */
  description: string;
  /** Indicates the removal when it expires. */
  removeWhenExpired: boolean;
  /** Source time. */
  sourceUtcTimestamp: Date;
}

/** Represents the base for all Partition Analysis Events. */
export interface PartitionAnalysisEvent extends PartitionEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "PartitionAnalysisEvent" | "PartitionPrimaryMoveAnalysis";
  /** Metadata about an Analysis Event. */
  metadata: AnalysisEventMetadata;
}

/** Partition Health Report Created event. */
export interface PartitionNewHealthReportEvent extends PartitionEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "PartitionNewHealthReport";
  /** Id of report source. */
  sourceId: string;
  /** Describes the property. */
  property: string;
  /** Describes the property health state. */
  healthState: string;
  /** Time to live in milli-seconds. */
  timeToLiveMs: number;
  /** Sequence number of report. */
  sequenceNumber: number;
  /** Description of report. */
  description: string;
  /** Indicates the removal when it expires. */
  removeWhenExpired: boolean;
  /** Source time. */
  sourceUtcTimestamp: Date;
}

/** Partition Health Report Expired event. */
export interface PartitionHealthReportExpiredEvent extends PartitionEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "PartitionHealthReportExpired";
  /** Id of report source. */
  sourceId: string;
  /** Describes the property. */
  property: string;
  /** Describes the property health state. */
  healthState: string;
  /** Time to live in milli-seconds. */
  timeToLiveMs: number;
  /** Sequence number of report. */
  sequenceNumber: number;
  /** Description of report. */
  description: string;
  /** Indicates the removal when it expires. */
  removeWhenExpired: boolean;
  /** Source time. */
  sourceUtcTimestamp: Date;
}

/** Partition Reconfiguration event. */
export interface PartitionReconfiguredEvent extends PartitionEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "PartitionReconfigured";
  /** The name of a Service Fabric node. */
  nodeName: string;
  /** Id of Node instance. */
  nodeInstanceId: string;
  /** Type of Service. */
  serviceType: string;
  /** CcEpochDataLoss version. */
  ccEpochDataLossVersion: number;
  /** CcEpochConfig version. */
  ccEpochConfigVersion: number;
  /** Type of reconfiguration. */
  reconfigType: string;
  /** Describes reconfiguration result. */
  result: string;
  /** Duration of Phase0 in milli-seconds. */
  phase0DurationMs: number;
  /** Duration of Phase1 in milli-seconds. */
  phase1DurationMs: number;
  /** Duration of Phase2 in milli-seconds. */
  phase2DurationMs: number;
  /** Duration of Phase3 in milli-seconds. */
  phase3DurationMs: number;
  /** Duration of Phase4 in milli-seconds. */
  phase4DurationMs: number;
  /** Total duration in milli-seconds. */
  totalDurationMs: number;
}

/** Chaos Move Secondary Fault Scheduled event. */
export interface ChaosPartitionSecondaryMoveScheduledEvent
  extends PartitionEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ChaosPartitionSecondaryMoveScheduled";
  /** Id of fault group. */
  faultGroupId: string;
  /** Id of fault. */
  faultId: string;
  /** Service name. */
  serviceName: string;
  /** The name of a Service Fabric node. */
  sourceNode: string;
  /** The name of a Service Fabric node. */
  destinationNode: string;
  /** Indicates a forced move. */
  forcedMove: boolean;
}

/** Chaos Move Primary Fault Scheduled event. */
export interface ChaosPartitionPrimaryMoveScheduledEvent
  extends PartitionEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ChaosPartitionPrimaryMoveScheduled";
  /** Id of fault group. */
  faultGroupId: string;
  /** Id of fault. */
  faultId: string;
  /** Service name. */
  serviceName: string;
  /** The name of a Service Fabric node. */
  nodeTo: string;
  /** Indicates a forced move. */
  forcedMove: boolean;
}

/** Stateful Replica Health Report Created event. */
export interface StatefulReplicaNewHealthReportEvent extends ReplicaEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "StatefulReplicaNewHealthReport";
  /** Id of Replica instance. */
  replicaInstanceId: number;
  /** Id of report source. */
  sourceId: string;
  /** Describes the property. */
  property: string;
  /** Describes the property health state. */
  healthState: string;
  /** Time to live in milli-seconds. */
  timeToLiveMs: number;
  /** Sequence number of report. */
  sequenceNumber: number;
  /** Description of report. */
  description: string;
  /** Indicates the removal when it expires. */
  removeWhenExpired: boolean;
  /** Source time. */
  sourceUtcTimestamp: Date;
}

/** Stateful Replica Health Report Expired event. */
export interface StatefulReplicaHealthReportExpiredEvent extends ReplicaEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "StatefulReplicaHealthReportExpired";
  /** Id of Replica instance. */
  replicaInstanceId: number;
  /** Id of report source. */
  sourceId: string;
  /** Describes the property. */
  property: string;
  /** Describes the property health state. */
  healthState: string;
  /** Time to live in milli-seconds. */
  timeToLiveMs: number;
  /** Sequence number of report. */
  sequenceNumber: number;
  /** Description of report. */
  description: string;
  /** Indicates the removal when it expires. */
  removeWhenExpired: boolean;
  /** Source time. */
  sourceUtcTimestamp: Date;
}

/** Stateless Replica Health Report Created event. */
export interface StatelessReplicaNewHealthReportEvent extends ReplicaEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "StatelessReplicaNewHealthReport";
  /** Id of report source. */
  sourceId: string;
  /** Describes the property. */
  property: string;
  /** Describes the property health state. */
  healthState: string;
  /** Time to live in milli-seconds. */
  timeToLiveMs: number;
  /** Sequence number of report. */
  sequenceNumber: number;
  /** Description of report. */
  description: string;
  /** Indicates the removal when it expires. */
  removeWhenExpired: boolean;
  /** Source time. */
  sourceUtcTimestamp: Date;
}

/** Stateless Replica Health Report Expired event. */
export interface StatelessReplicaHealthReportExpiredEvent extends ReplicaEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "StatelessReplicaHealthReportExpired";
  /** Id of report source. */
  sourceId: string;
  /** Describes the property. */
  property: string;
  /** Describes the property health state. */
  healthState: string;
  /** Time to live in milli-seconds. */
  timeToLiveMs: number;
  /** Sequence number of report. */
  sequenceNumber: number;
  /** Description of report. */
  description: string;
  /** Indicates the removal when it expires. */
  removeWhenExpired: boolean;
  /** Source time. */
  sourceUtcTimestamp: Date;
}

/** Chaos Remove Replica Fault Scheduled event. */
export interface ChaosReplicaRemovalScheduledEvent extends ReplicaEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ChaosReplicaRemovalScheduled";
  /** Id of fault group. */
  faultGroupId: string;
  /** Id of fault. */
  faultId: string;
  /** Service name. */
  serviceUri: string;
}

/** Chaos Restart Replica Fault Scheduled event. */
export interface ChaosReplicaRestartScheduledEvent extends ReplicaEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ChaosReplicaRestartScheduled";
  /** Id of fault group. */
  faultGroupId: string;
  /** Id of fault. */
  faultId: string;
  /** Service name. */
  serviceUri: string;
}

/** Describes the properties of a secret resource whose value is provided explicitly as plaintext. The secret resource may have multiple values, each being uniquely versioned. The secret value of each version is stored encrypted, and delivered as plaintext into the context of applications referencing it. */
export interface InlinedValueSecretResourceProperties
  extends SecretResourceProperties {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "inlinedValue";
}

/** Information about a Service Fabric container network local to a single Service Fabric cluster. */
export interface LocalNetworkResourceProperties
  extends NetworkResourceProperties {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "Local";
  /** Address space for the local container network. */
  networkAddressPrefix?: string;
}

/** Status of the secondary replicator when it is in active mode and is part of the replica set. */
export interface SecondaryActiveReplicatorStatus
  extends SecondaryReplicatorStatus {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "ActiveSecondary";
}

/** Status of the secondary replicator when it is in idle mode and is being built by the primary. */
export interface SecondaryIdleReplicatorStatus
  extends SecondaryReplicatorStatus {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "IdleSecondary";
}

/** Partition Primary Move Analysis event. */
export interface PartitionPrimaryMoveAnalysisEvent
  extends PartitionAnalysisEvent {
  /** Polymorphic discriminator, which specifies the different types this object can be */
  kind: "PartitionPrimaryMoveAnalysis";
  /** Time when the move was completed. */
  whenMoveCompleted: Date;
  /** The name of a Service Fabric node. */
  previousNode: string;
  /** The name of a Service Fabric node. */
  currentNode: string;
  /** Move reason. */
  moveReason: string;
  /** Relevant traces. */
  relevantTraces: string;
}

/** Known values of {@link HostOptions} that the service accepts. */
export enum KnownHostOptions {
  /** host: http:\//localhost:19080\/ */
  HttpLocalhost19080 = "http://localhost:19080/",
  /** host: https:\//localhost:19080\/ */
  HttpsLocalhost19080 = "https://localhost:19080/"
}

/**
 * Defines values for HostOptions. \
 * {@link KnownHostOptions} can be used interchangeably with HostOptions,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **http:\//localhost:19080\/**: host: http:\/\/localhost:19080\/ \
 * **https:\//localhost:19080\/**: host: https:\/\/localhost:19080\/
 */
export type HostOptions = string;

/** Known values of {@link FabricErrorCodes} that the service accepts. */
export enum KnownFabricErrorCodes {
  /** FabricEInvalidPartitionKEY */
  FabricEInvalidPartitionKEY = "FABRIC_E_INVALID_PARTITION_KEY",
  /** FabricEImagebuilderValidationError */
  FabricEImagebuilderValidationError = "FABRIC_E_IMAGEBUILDER_VALIDATION_ERROR",
  /** FabricEInvalidAddress */
  FabricEInvalidAddress = "FABRIC_E_INVALID_ADDRESS",
  /** FabricEApplicationNOTUpgrading */
  FabricEApplicationNOTUpgrading = "FABRIC_E_APPLICATION_NOT_UPGRADING",
  /** FabricEApplicationUpgradeValidationError */
  FabricEApplicationUpgradeValidationError = "FABRIC_E_APPLICATION_UPGRADE_VALIDATION_ERROR",
  /** FabricEFabricNOTUpgrading */
  FabricEFabricNOTUpgrading = "FABRIC_E_FABRIC_NOT_UPGRADING",
  /** FabricEFabricUpgradeValidationError */
  FabricEFabricUpgradeValidationError = "FABRIC_E_FABRIC_UPGRADE_VALIDATION_ERROR",
  /** FabricEInvalidConfiguration */
  FabricEInvalidConfiguration = "FABRIC_E_INVALID_CONFIGURATION",
  /** FabricEInvalidNameURI */
  FabricEInvalidNameURI = "FABRIC_E_INVALID_NAME_URI",
  /** FabricEPathTOOLong */
  FabricEPathTOOLong = "FABRIC_E_PATH_TOO_LONG",
  /** FabricEKEYTOOLarge */
  FabricEKEYTOOLarge = "FABRIC_E_KEY_TOO_LARGE",
  /** FabricEServiceAffinityChainNOTSupported */
  FabricEServiceAffinityChainNOTSupported = "FABRIC_E_SERVICE_AFFINITY_CHAIN_NOT_SUPPORTED",
  /** FabricEInvalidAtomicGroup */
  FabricEInvalidAtomicGroup = "FABRIC_E_INVALID_ATOMIC_GROUP",
  /** FabricEValueEmpty */
  FabricEValueEmpty = "FABRIC_E_VALUE_EMPTY",
  /** FabricENodeNOTFound */
  FabricENodeNOTFound = "FABRIC_E_NODE_NOT_FOUND",
  /** FabricEApplicationTypeNOTFound */
  FabricEApplicationTypeNOTFound = "FABRIC_E_APPLICATION_TYPE_NOT_FOUND",
  /** FabricEApplicationNOTFound */
  FabricEApplicationNOTFound = "FABRIC_E_APPLICATION_NOT_FOUND",
  /** FabricEServiceTypeNOTFound */
  FabricEServiceTypeNOTFound = "FABRIC_E_SERVICE_TYPE_NOT_FOUND",
  /** FabricEServiceDoesNOTExist */
  FabricEServiceDoesNOTExist = "FABRIC_E_SERVICE_DOES_NOT_EXIST",
  /** FabricEServiceTypeTemplateNOTFound */
  FabricEServiceTypeTemplateNOTFound = "FABRIC_E_SERVICE_TYPE_TEMPLATE_NOT_FOUND",
  /** FabricEConfigurationSectionNOTFound */
  FabricEConfigurationSectionNOTFound = "FABRIC_E_CONFIGURATION_SECTION_NOT_FOUND",
  /** FabricEPartitionNOTFound */
  FabricEPartitionNOTFound = "FABRIC_E_PARTITION_NOT_FOUND",
  /** FabricEReplicaDoesNOTExist */
  FabricEReplicaDoesNOTExist = "FABRIC_E_REPLICA_DOES_NOT_EXIST",
  /** FabricEServiceGroupDoesNOTExist */
  FabricEServiceGroupDoesNOTExist = "FABRIC_E_SERVICE_GROUP_DOES_NOT_EXIST",
  /** FabricEConfigurationParameterNOTFound */
  FabricEConfigurationParameterNOTFound = "FABRIC_E_CONFIGURATION_PARAMETER_NOT_FOUND",
  /** FabricEDirectoryNOTFound */
  FabricEDirectoryNOTFound = "FABRIC_E_DIRECTORY_NOT_FOUND",
  /** FabricEFabricVersionNOTFound */
  FabricEFabricVersionNOTFound = "FABRIC_E_FABRIC_VERSION_NOT_FOUND",
  /** FabricEFileNOTFound */
  FabricEFileNOTFound = "FABRIC_E_FILE_NOT_FOUND",
  /** FabricENameDoesNOTExist */
  FabricENameDoesNOTExist = "FABRIC_E_NAME_DOES_NOT_EXIST",
  /** FabricEPropertyDoesNOTExist */
  FabricEPropertyDoesNOTExist = "FABRIC_E_PROPERTY_DOES_NOT_EXIST",
  /** FabricEEnumerationCompleted */
  FabricEEnumerationCompleted = "FABRIC_E_ENUMERATION_COMPLETED",
  /** FabricEServiceManifestNOTFound */
  FabricEServiceManifestNOTFound = "FABRIC_E_SERVICE_MANIFEST_NOT_FOUND",
  /** FabricEKEYNOTFound */
  FabricEKEYNOTFound = "FABRIC_E_KEY_NOT_FOUND",
  /** FabricEHealthEntityNOTFound */
  FabricEHealthEntityNOTFound = "FABRIC_E_HEALTH_ENTITY_NOT_FOUND",
  /** FabricEApplicationTypeAlreadyExists */
  FabricEApplicationTypeAlreadyExists = "FABRIC_E_APPLICATION_TYPE_ALREADY_EXISTS",
  /** FabricEApplicationAlreadyExists */
  FabricEApplicationAlreadyExists = "FABRIC_E_APPLICATION_ALREADY_EXISTS",
  /** FabricEApplicationAlreadyINTargetVersion */
  FabricEApplicationAlreadyINTargetVersion = "FABRIC_E_APPLICATION_ALREADY_IN_TARGET_VERSION",
  /** FabricEApplicationTypeProvisionINProgress */
  FabricEApplicationTypeProvisionINProgress = "FABRIC_E_APPLICATION_TYPE_PROVISION_IN_PROGRESS",
  /** FabricEApplicationUpgradeINProgress */
  FabricEApplicationUpgradeINProgress = "FABRIC_E_APPLICATION_UPGRADE_IN_PROGRESS",
  /** FabricEServiceAlreadyExists */
  FabricEServiceAlreadyExists = "FABRIC_E_SERVICE_ALREADY_EXISTS",
  /** FabricEServiceGroupAlreadyExists */
  FabricEServiceGroupAlreadyExists = "FABRIC_E_SERVICE_GROUP_ALREADY_EXISTS",
  /** FabricEApplicationTypeINUSE */
  FabricEApplicationTypeINUSE = "FABRIC_E_APPLICATION_TYPE_IN_USE",
  /** FabricEFabricAlreadyINTargetVersion */
  FabricEFabricAlreadyINTargetVersion = "FABRIC_E_FABRIC_ALREADY_IN_TARGET_VERSION",
  /** FabricEFabricVersionAlreadyExists */
  FabricEFabricVersionAlreadyExists = "FABRIC_E_FABRIC_VERSION_ALREADY_EXISTS",
  /** FabricEFabricVersionINUSE */
  FabricEFabricVersionINUSE = "FABRIC_E_FABRIC_VERSION_IN_USE",
  /** FabricEFabricUpgradeINProgress */
  FabricEFabricUpgradeINProgress = "FABRIC_E_FABRIC_UPGRADE_IN_PROGRESS",
  /** FabricENameAlreadyExists */
  FabricENameAlreadyExists = "FABRIC_E_NAME_ALREADY_EXISTS",
  /** FabricENameNOTEmpty */
  FabricENameNOTEmpty = "FABRIC_E_NAME_NOT_EMPTY",
  /** FabricEPropertyCheckFailed */
  FabricEPropertyCheckFailed = "FABRIC_E_PROPERTY_CHECK_FAILED",
  /** FabricEServiceMetadataMismatch */
  FabricEServiceMetadataMismatch = "FABRIC_E_SERVICE_METADATA_MISMATCH",
  /** FabricEServiceTypeMismatch */
  FabricEServiceTypeMismatch = "FABRIC_E_SERVICE_TYPE_MISMATCH",
  /** FabricEHealthStaleReport */
  FabricEHealthStaleReport = "FABRIC_E_HEALTH_STALE_REPORT",
  /** FabricESequenceNumberCheckFailed */
  FabricESequenceNumberCheckFailed = "FABRIC_E_SEQUENCE_NUMBER_CHECK_FAILED",
  /** FabricENodeHASNOTStoppedYET */
  FabricENodeHASNOTStoppedYET = "FABRIC_E_NODE_HAS_NOT_STOPPED_YET",
  /** FabricEInstanceIDMismatch */
  FabricEInstanceIDMismatch = "FABRIC_E_INSTANCE_ID_MISMATCH",
  /** FabricEValueTOOLarge */
  FabricEValueTOOLarge = "FABRIC_E_VALUE_TOO_LARGE",
  /** FabricENOWriteQuorum */
  FabricENOWriteQuorum = "FABRIC_E_NO_WRITE_QUORUM",
  /** FabricENOTPrimary */
  FabricENOTPrimary = "FABRIC_E_NOT_PRIMARY",
  /** FabricENOTReady */
  FabricENOTReady = "FABRIC_E_NOT_READY",
  /** FabricEReconfigurationPending */
  FabricEReconfigurationPending = "FABRIC_E_RECONFIGURATION_PENDING",
  /** FabricEServiceOffline */
  FabricEServiceOffline = "FABRIC_E_SERVICE_OFFLINE",
  /** EAbort */
  EAbort = "E_ABORT",
  /** FabricECommunicationError */
  FabricECommunicationError = "FABRIC_E_COMMUNICATION_ERROR",
  /** FabricEOperationNOTComplete */
  FabricEOperationNOTComplete = "FABRIC_E_OPERATION_NOT_COMPLETE",
  /** FabricETimeout */
  FabricETimeout = "FABRIC_E_TIMEOUT",
  /** FabricENodeISUP */
  FabricENodeISUP = "FABRIC_E_NODE_IS_UP",
  /** EFail */
  EFail = "E_FAIL",
  /** FabricEBackupISEnabled */
  FabricEBackupISEnabled = "FABRIC_E_BACKUP_IS_ENABLED",
  /** FabricERestoreSourceTargetPartitionMismatch */
  FabricERestoreSourceTargetPartitionMismatch = "FABRIC_E_RESTORE_SOURCE_TARGET_PARTITION_MISMATCH",
  /** FabricEInvalidFORStatelessServices */
  FabricEInvalidFORStatelessServices = "FABRIC_E_INVALID_FOR_STATELESS_SERVICES",
  /** FabricEBackupNOTEnabled */
  FabricEBackupNOTEnabled = "FABRIC_E_BACKUP_NOT_ENABLED",
  /** FabricEBackupPolicyNOTExisting */
  FabricEBackupPolicyNOTExisting = "FABRIC_E_BACKUP_POLICY_NOT_EXISTING",
  /** FabricEFaultAnalysisServiceNOTExisting */
  FabricEFaultAnalysisServiceNOTExisting = "FABRIC_E_FAULT_ANALYSIS_SERVICE_NOT_EXISTING",
  /** FabricEBackupINProgress */
  FabricEBackupINProgress = "FABRIC_E_BACKUP_IN_PROGRESS",
  /** FabricERestoreINProgress */
  FabricERestoreINProgress = "FABRIC_E_RESTORE_IN_PROGRESS",
  /** FabricEBackupPolicyAlreadyExisting */
  FabricEBackupPolicyAlreadyExisting = "FABRIC_E_BACKUP_POLICY_ALREADY_EXISTING",
  /** FabricEInvalidServiceScalingPolicy */
  FabricEInvalidServiceScalingPolicy = "FABRIC_E_INVALID_SERVICE_SCALING_POLICY",
  /** EInvalidarg */
  EInvalidarg = "E_INVALIDARG",
  /** FabricESingleInstanceApplicationAlreadyExists */
  FabricESingleInstanceApplicationAlreadyExists = "FABRIC_E_SINGLE_INSTANCE_APPLICATION_ALREADY_EXISTS",
  /** FabricESingleInstanceApplicationNOTFound */
  FabricESingleInstanceApplicationNOTFound = "FABRIC_E_SINGLE_INSTANCE_APPLICATION_NOT_FOUND",
  /** FabricEVolumeAlreadyExists */
  FabricEVolumeAlreadyExists = "FABRIC_E_VOLUME_ALREADY_EXISTS",
  /** FabricEVolumeNOTFound */
  FabricEVolumeNOTFound = "FABRIC_E_VOLUME_NOT_FOUND",
  /** SerializationError */
  SerializationError = "SerializationError",
  /** FabricEImagebuilderReservedDirectoryError */
  FabricEImagebuilderReservedDirectoryError = "FABRIC_E_IMAGEBUILDER_RESERVED_DIRECTORY_ERROR"
}

/**
 * Defines values for FabricErrorCodes. \
 * {@link KnownFabricErrorCodes} can be used interchangeably with FabricErrorCodes,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **FABRIC_E_INVALID_PARTITION_KEY** \
 * **FABRIC_E_IMAGEBUILDER_VALIDATION_ERROR** \
 * **FABRIC_E_INVALID_ADDRESS** \
 * **FABRIC_E_APPLICATION_NOT_UPGRADING** \
 * **FABRIC_E_APPLICATION_UPGRADE_VALIDATION_ERROR** \
 * **FABRIC_E_FABRIC_NOT_UPGRADING** \
 * **FABRIC_E_FABRIC_UPGRADE_VALIDATION_ERROR** \
 * **FABRIC_E_INVALID_CONFIGURATION** \
 * **FABRIC_E_INVALID_NAME_URI** \
 * **FABRIC_E_PATH_TOO_LONG** \
 * **FABRIC_E_KEY_TOO_LARGE** \
 * **FABRIC_E_SERVICE_AFFINITY_CHAIN_NOT_SUPPORTED** \
 * **FABRIC_E_INVALID_ATOMIC_GROUP** \
 * **FABRIC_E_VALUE_EMPTY** \
 * **FABRIC_E_NODE_NOT_FOUND** \
 * **FABRIC_E_APPLICATION_TYPE_NOT_FOUND** \
 * **FABRIC_E_APPLICATION_NOT_FOUND** \
 * **FABRIC_E_SERVICE_TYPE_NOT_FOUND** \
 * **FABRIC_E_SERVICE_DOES_NOT_EXIST** \
 * **FABRIC_E_SERVICE_TYPE_TEMPLATE_NOT_FOUND** \
 * **FABRIC_E_CONFIGURATION_SECTION_NOT_FOUND** \
 * **FABRIC_E_PARTITION_NOT_FOUND** \
 * **FABRIC_E_REPLICA_DOES_NOT_EXIST** \
 * **FABRIC_E_SERVICE_GROUP_DOES_NOT_EXIST** \
 * **FABRIC_E_CONFIGURATION_PARAMETER_NOT_FOUND** \
 * **FABRIC_E_DIRECTORY_NOT_FOUND** \
 * **FABRIC_E_FABRIC_VERSION_NOT_FOUND** \
 * **FABRIC_E_FILE_NOT_FOUND** \
 * **FABRIC_E_NAME_DOES_NOT_EXIST** \
 * **FABRIC_E_PROPERTY_DOES_NOT_EXIST** \
 * **FABRIC_E_ENUMERATION_COMPLETED** \
 * **FABRIC_E_SERVICE_MANIFEST_NOT_FOUND** \
 * **FABRIC_E_KEY_NOT_FOUND** \
 * **FABRIC_E_HEALTH_ENTITY_NOT_FOUND** \
 * **FABRIC_E_APPLICATION_TYPE_ALREADY_EXISTS** \
 * **FABRIC_E_APPLICATION_ALREADY_EXISTS** \
 * **FABRIC_E_APPLICATION_ALREADY_IN_TARGET_VERSION** \
 * **FABRIC_E_APPLICATION_TYPE_PROVISION_IN_PROGRESS** \
 * **FABRIC_E_APPLICATION_UPGRADE_IN_PROGRESS** \
 * **FABRIC_E_SERVICE_ALREADY_EXISTS** \
 * **FABRIC_E_SERVICE_GROUP_ALREADY_EXISTS** \
 * **FABRIC_E_APPLICATION_TYPE_IN_USE** \
 * **FABRIC_E_FABRIC_ALREADY_IN_TARGET_VERSION** \
 * **FABRIC_E_FABRIC_VERSION_ALREADY_EXISTS** \
 * **FABRIC_E_FABRIC_VERSION_IN_USE** \
 * **FABRIC_E_FABRIC_UPGRADE_IN_PROGRESS** \
 * **FABRIC_E_NAME_ALREADY_EXISTS** \
 * **FABRIC_E_NAME_NOT_EMPTY** \
 * **FABRIC_E_PROPERTY_CHECK_FAILED** \
 * **FABRIC_E_SERVICE_METADATA_MISMATCH** \
 * **FABRIC_E_SERVICE_TYPE_MISMATCH** \
 * **FABRIC_E_HEALTH_STALE_REPORT** \
 * **FABRIC_E_SEQUENCE_NUMBER_CHECK_FAILED** \
 * **FABRIC_E_NODE_HAS_NOT_STOPPED_YET** \
 * **FABRIC_E_INSTANCE_ID_MISMATCH** \
 * **FABRIC_E_VALUE_TOO_LARGE** \
 * **FABRIC_E_NO_WRITE_QUORUM** \
 * **FABRIC_E_NOT_PRIMARY** \
 * **FABRIC_E_NOT_READY** \
 * **FABRIC_E_RECONFIGURATION_PENDING** \
 * **FABRIC_E_SERVICE_OFFLINE** \
 * **E_ABORT** \
 * **FABRIC_E_COMMUNICATION_ERROR** \
 * **FABRIC_E_OPERATION_NOT_COMPLETE** \
 * **FABRIC_E_TIMEOUT** \
 * **FABRIC_E_NODE_IS_UP** \
 * **E_FAIL** \
 * **FABRIC_E_BACKUP_IS_ENABLED** \
 * **FABRIC_E_RESTORE_SOURCE_TARGET_PARTITION_MISMATCH** \
 * **FABRIC_E_INVALID_FOR_STATELESS_SERVICES** \
 * **FABRIC_E_BACKUP_NOT_ENABLED** \
 * **FABRIC_E_BACKUP_POLICY_NOT_EXISTING** \
 * **FABRIC_E_FAULT_ANALYSIS_SERVICE_NOT_EXISTING** \
 * **FABRIC_E_BACKUP_IN_PROGRESS** \
 * **FABRIC_E_RESTORE_IN_PROGRESS** \
 * **FABRIC_E_BACKUP_POLICY_ALREADY_EXISTING** \
 * **FABRIC_E_INVALID_SERVICE_SCALING_POLICY** \
 * **E_INVALIDARG** \
 * **FABRIC_E_SINGLE_INSTANCE_APPLICATION_ALREADY_EXISTS** \
 * **FABRIC_E_SINGLE_INSTANCE_APPLICATION_NOT_FOUND** \
 * **FABRIC_E_VOLUME_ALREADY_EXISTS** \
 * **FABRIC_E_VOLUME_NOT_FOUND** \
 * **SerializationError** \
 * **FABRIC_E_IMAGEBUILDER_RESERVED_DIRECTORY_ERROR**
 */
export type FabricErrorCodes = string;

/** Known values of {@link HealthState} that the service accepts. */
export enum KnownHealthState {
  /** Indicates an invalid health state. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** Indicates the health state is okay. The value is 1. */
  Ok = "Ok",
  /** Indicates the health state is at a warning level. The value is 2. */
  Warning = "Warning",
  /** Indicates the health state is at an error level. Error health state should be investigated, as they can impact the correct functionality of the cluster. The value is 3. */
  Error = "Error",
  /** Indicates an unknown health status. The value is 65535. */
  Unknown = "Unknown"
}

/**
 * Defines values for HealthState. \
 * {@link KnownHealthState} can be used interchangeably with HealthState,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates an invalid health state. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **Ok**: Indicates the health state is okay. The value is 1. \
 * **Warning**: Indicates the health state is at a warning level. The value is 2. \
 * **Error**: Indicates the health state is at an error level. Error health state should be investigated, as they can impact the correct functionality of the cluster. The value is 3. \
 * **Unknown**: Indicates an unknown health status. The value is 65535.
 */
export type HealthState = string;

/** Known values of {@link HealthEvaluationKind} that the service accepts. */
export enum KnownHealthEvaluationKind {
  /** Indicates that the health evaluation is invalid. The value is zero. */
  Invalid = "Invalid",
  /** Indicates that the health evaluation is for a health event. The value is 1. */
  Event = "Event",
  /** Indicates that the health evaluation is for the replicas of a partition. The value is 2. */
  Replicas = "Replicas",
  /** Indicates that the health evaluation is for the partitions of a service. The value is 3. */
  Partitions = "Partitions",
  /** Indicates that the health evaluation is for the deployed service packages of a deployed application. The value is 4. */
  DeployedServicePackages = "DeployedServicePackages",
  /** Indicates that the health evaluation is for the deployed applications of an application. The value is 5. */
  DeployedApplications = "DeployedApplications",
  /** Indicates that the health evaluation is for services of an application. The value is 6. */
  Services = "Services",
  /** Indicates that the health evaluation is for the cluster nodes. The value is 7. */
  Nodes = "Nodes",
  /** Indicates that the health evaluation is for the cluster applications. The value is 8. */
  Applications = "Applications",
  /** Indicates that the health evaluation is for the system application. The value is 9. */
  SystemApplication = "SystemApplication",
  /** Indicates that the health evaluation is for the deployed applications of an application in an upgrade domain. The value is 10. */
  UpgradeDomainDeployedApplications = "UpgradeDomainDeployedApplications",
  /** Indicates that the health evaluation is for the cluster nodes in an upgrade domain. The value is 11. */
  UpgradeDomainNodes = "UpgradeDomainNodes",
  /** Indicates that the health evaluation is for a replica. The value is 13. */
  Replica = "Replica",
  /** Indicates that the health evaluation is for a partition. The value is 14. */
  Partition = "Partition",
  /** Indicates that the health evaluation is for a deployed service package. The value is 16. */
  DeployedServicePackage = "DeployedServicePackage",
  /** Indicates that the health evaluation is for a deployed application. The value is 17. */
  DeployedApplication = "DeployedApplication",
  /** Indicates that the health evaluation is for a service. The value is 15. */
  Service = "Service",
  /** Indicates that the health evaluation is for a node. The value is 12. */
  Node = "Node",
  /** Indicates that the health evaluation is for an application. The value is 18. */
  Application = "Application",
  /** Indicates that the health evaluation is for the delta of unhealthy cluster nodes. The value is 19. */
  DeltaNodesCheck = "DeltaNodesCheck",
  /** Indicates that the health evaluation is for the delta of unhealthy upgrade domain cluster nodes. The value is 20. */
  UpgradeDomainDeltaNodesCheck = "UpgradeDomainDeltaNodesCheck",
  /** – Indicates that the health evaluation is for applications of an application type. The value is 21. */
  ApplicationTypeApplications = "ApplicationTypeApplications",
  /** – Indicates that the health evaluation is for nodes of a node type. The value is 22. */
  NodeTypeNodes = "NodeTypeNodes"
}

/**
 * Defines values for HealthEvaluationKind. \
 * {@link KnownHealthEvaluationKind} can be used interchangeably with HealthEvaluationKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates that the health evaluation is invalid. The value is zero. \
 * **Event**: Indicates that the health evaluation is for a health event. The value is 1. \
 * **Replicas**: Indicates that the health evaluation is for the replicas of a partition. The value is 2. \
 * **Partitions**: Indicates that the health evaluation is for the partitions of a service. The value is 3. \
 * **DeployedServicePackages**: Indicates that the health evaluation is for the deployed service packages of a deployed application. The value is 4. \
 * **DeployedApplications**: Indicates that the health evaluation is for the deployed applications of an application. The value is 5. \
 * **Services**: Indicates that the health evaluation is for services of an application. The value is 6. \
 * **Nodes**: Indicates that the health evaluation is for the cluster nodes. The value is 7. \
 * **Applications**: Indicates that the health evaluation is for the cluster applications. The value is 8. \
 * **SystemApplication**: Indicates that the health evaluation is for the system application. The value is 9. \
 * **UpgradeDomainDeployedApplications**: Indicates that the health evaluation is for the deployed applications of an application in an upgrade domain. The value is 10. \
 * **UpgradeDomainNodes**: Indicates that the health evaluation is for the cluster nodes in an upgrade domain. The value is 11. \
 * **Replica**: Indicates that the health evaluation is for a replica. The value is 13. \
 * **Partition**: Indicates that the health evaluation is for a partition. The value is 14. \
 * **DeployedServicePackage**: Indicates that the health evaluation is for a deployed service package. The value is 16. \
 * **DeployedApplication**: Indicates that the health evaluation is for a deployed application. The value is 17. \
 * **Service**: Indicates that the health evaluation is for a service. The value is 15. \
 * **Node**: Indicates that the health evaluation is for a node. The value is 12. \
 * **Application**: Indicates that the health evaluation is for an application. The value is 18. \
 * **DeltaNodesCheck**: Indicates that the health evaluation is for the delta of unhealthy cluster nodes. The value is 19. \
 * **UpgradeDomainDeltaNodesCheck**: Indicates that the health evaluation is for the delta of unhealthy upgrade domain cluster nodes. The value is 20. \
 * **ApplicationTypeApplications**: – Indicates that the health evaluation is for applications of an application type. The value is 21. \
 * **NodeTypeNodes**: – Indicates that the health evaluation is for nodes of a node type. The value is 22.
 */
export type HealthEvaluationKind = string;

/** Known values of {@link EntityKind} that the service accepts. */
export enum KnownEntityKind {
  /** Indicates an invalid entity kind. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** Indicates the entity is a Service Fabric node. The value is 1. */
  Node = "Node",
  /** Indicates the entity is a Service Fabric partition. The value is 2. */
  Partition = "Partition",
  /** Indicates the entity is a Service Fabric service. The value is 3. */
  Service = "Service",
  /** Indicates the entity is a Service Fabric application. The value is 4. */
  Application = "Application",
  /** Indicates the entity is a Service Fabric replica. The value is 5. */
  Replica = "Replica",
  /** Indicates the entity is a Service Fabric deployed application. The value is 6. */
  DeployedApplication = "DeployedApplication",
  /** Indicates the entity is a Service Fabric deployed service package. The value is 7. */
  DeployedServicePackage = "DeployedServicePackage",
  /** Indicates the entity is a Service Fabric cluster. The value is 8. */
  Cluster = "Cluster"
}

/**
 * Defines values for EntityKind. \
 * {@link KnownEntityKind} can be used interchangeably with EntityKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates an invalid entity kind. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **Node**: Indicates the entity is a Service Fabric node. The value is 1. \
 * **Partition**: Indicates the entity is a Service Fabric partition. The value is 2. \
 * **Service**: Indicates the entity is a Service Fabric service. The value is 3. \
 * **Application**: Indicates the entity is a Service Fabric application. The value is 4. \
 * **Replica**: Indicates the entity is a Service Fabric replica. The value is 5. \
 * **DeployedApplication**: Indicates the entity is a Service Fabric deployed application. The value is 6. \
 * **DeployedServicePackage**: Indicates the entity is a Service Fabric deployed service package. The value is 7. \
 * **Cluster**: Indicates the entity is a Service Fabric cluster. The value is 8.
 */
export type EntityKind = string;

/** Known values of {@link UpgradeDomainState} that the service accepts. */
export enum KnownUpgradeDomainState {
  /** Indicates the upgrade domain state is invalid. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** The upgrade domain has not started upgrading yet. The value is 1 */
  Pending = "Pending",
  /** The upgrade domain is being upgraded but not complete yet. The value is 2 */
  InProgress = "InProgress",
  /** The upgrade domain has completed upgrade. The value is 3 */
  Completed = "Completed"
}

/**
 * Defines values for UpgradeDomainState. \
 * {@link KnownUpgradeDomainState} can be used interchangeably with UpgradeDomainState,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the upgrade domain state is invalid. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **Pending**: The upgrade domain has not started upgrading yet. The value is 1 \
 * **InProgress**: The upgrade domain is being upgraded but not complete yet. The value is 2 \
 * **Completed**: The upgrade domain has completed upgrade. The value is 3
 */
export type UpgradeDomainState = string;

/** Known values of {@link UpgradeUnitState} that the service accepts. */
export enum KnownUpgradeUnitState {
  /** Indicates the upgrade unit state is invalid. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** The upgrade unit has not started upgrading yet. The value is 1 */
  Pending = "Pending",
  /** The upgrade unit is being upgraded but not complete yet. The value is 2 */
  InProgress = "InProgress",
  /** The upgrade unit has completed upgrade. The value is 3 */
  Completed = "Completed",
  /** The upgrade unit has failed to upgrade. The value is 4 */
  Failed = "Failed"
}

/**
 * Defines values for UpgradeUnitState. \
 * {@link KnownUpgradeUnitState} can be used interchangeably with UpgradeUnitState,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the upgrade unit state is invalid. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **Pending**: The upgrade unit has not started upgrading yet. The value is 1 \
 * **InProgress**: The upgrade unit is being upgraded but not complete yet. The value is 2 \
 * **Completed**: The upgrade unit has completed upgrade. The value is 3 \
 * **Failed**: The upgrade unit has failed to upgrade. The value is 4
 */
export type UpgradeUnitState = string;

/** Known values of {@link UpgradeState} that the service accepts. */
export enum KnownUpgradeState {
  /** Indicates the upgrade state is invalid. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** The upgrade is rolling back to the previous version but is not complete yet. The value is 1 */
  RollingBackInProgress = "RollingBackInProgress",
  /** The upgrade has finished rolling back. The value is 2 */
  RollingBackCompleted = "RollingBackCompleted",
  /** The current upgrade domain has finished upgrading. The overall upgrade is waiting for an explicit move next request in UnmonitoredManual mode or performing health checks in Monitored mode. The value is 3 */
  RollingForwardPending = "RollingForwardPending",
  /** The upgrade is rolling forward to the target version but is not complete yet. The value is 4 */
  RollingForwardInProgress = "RollingForwardInProgress",
  /** The upgrade has finished rolling forward. The value is 5 */
  RollingForwardCompleted = "RollingForwardCompleted",
  /** The upgrade has failed and is unable to execute FailureAction. The value is 6 */
  Failed = "Failed"
}

/**
 * Defines values for UpgradeState. \
 * {@link KnownUpgradeState} can be used interchangeably with UpgradeState,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the upgrade state is invalid. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **RollingBackInProgress**: The upgrade is rolling back to the previous version but is not complete yet. The value is 1 \
 * **RollingBackCompleted**: The upgrade has finished rolling back. The value is 2 \
 * **RollingForwardPending**: The current upgrade domain has finished upgrading. The overall upgrade is waiting for an explicit move next request in UnmonitoredManual mode or performing health checks in Monitored mode. The value is 3 \
 * **RollingForwardInProgress**: The upgrade is rolling forward to the target version but is not complete yet. The value is 4 \
 * **RollingForwardCompleted**: The upgrade has finished rolling forward. The value is 5 \
 * **Failed**: The upgrade has failed and is unable to execute FailureAction. The value is 6
 */
export type UpgradeState = string;

/** Known values of {@link UpgradeMode} that the service accepts. */
export enum KnownUpgradeMode {
  /** Indicates the upgrade mode is invalid. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** The upgrade will proceed automatically without performing any health monitoring. The value is 1 */
  UnmonitoredAuto = "UnmonitoredAuto",
  /** The upgrade will stop after completing each upgrade domain, giving the opportunity to manually monitor health before proceeding. The value is 2 */
  UnmonitoredManual = "UnmonitoredManual",
  /** The upgrade will stop after completing each upgrade domain and automatically monitor health before proceeding. The value is 3 */
  Monitored = "Monitored",
  /** Perform a node-by-node upgrade. No action is performed when upgrade starts; upgrade is applied on each node when it is deactivated with intent restart or higher. The value is 4 */
  UnmonitoredDeferred = "UnmonitoredDeferred"
}

/**
 * Defines values for UpgradeMode. \
 * {@link KnownUpgradeMode} can be used interchangeably with UpgradeMode,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the upgrade mode is invalid. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **UnmonitoredAuto**: The upgrade will proceed automatically without performing any health monitoring. The value is 1 \
 * **UnmonitoredManual**: The upgrade will stop after completing each upgrade domain, giving the opportunity to manually monitor health before proceeding. The value is 2 \
 * **Monitored**: The upgrade will stop after completing each upgrade domain and automatically monitor health before proceeding. The value is 3 \
 * **UnmonitoredDeferred**: Perform a node-by-node upgrade. No action is performed when upgrade starts; upgrade is applied on each node when it is deactivated with intent restart or higher. The value is 4
 */
export type UpgradeMode = string;

/** Known values of {@link UpgradeKind} that the service accepts. */
export enum KnownUpgradeKind {
  /** Indicates the upgrade kind is invalid. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** The upgrade progresses one upgrade domain at a time. The value is 1 */
  Rolling = "Rolling"
}

/**
 * Defines values for UpgradeKind. \
 * {@link KnownUpgradeKind} can be used interchangeably with UpgradeKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the upgrade kind is invalid. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **Rolling**: The upgrade progresses one upgrade domain at a time. The value is 1
 */
export type UpgradeKind = string;

/** Known values of {@link UpgradeSortOrder} that the service accepts. */
export enum KnownUpgradeSortOrder {
  /** Indicates that this sort order is not valid. All Service Fabric enumerations have the invalid type. The value is 0. */
  Invalid = "Invalid",
  /** Indicates that the default sort order (as specified in cluster manifest) will be used. The value is 1. */
  Default = "Default",
  /** Indicates that forward numeric sort order (UD names sorted as numbers) will be used. The value is 2. */
  Numeric = "Numeric",
  /** Indicates that forward lexicographical sort order (UD names sorted as strings) will be used. The value is 3. */
  Lexicographical = "Lexicographical",
  /** Indicates that reverse numeric sort order (UD names sorted as numbers) will be used. The value is 4. */
  ReverseNumeric = "ReverseNumeric",
  /** Indicates that reverse lexicographical sort order (UD names sorted as strings) will be used. The value is 5. */
  ReverseLexicographical = "ReverseLexicographical"
}

/**
 * Defines values for UpgradeSortOrder. \
 * {@link KnownUpgradeSortOrder} can be used interchangeably with UpgradeSortOrder,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates that this sort order is not valid. All Service Fabric enumerations have the invalid type. The value is 0. \
 * **Default**: Indicates that the default sort order (as specified in cluster manifest) will be used. The value is 1. \
 * **Numeric**: Indicates that forward numeric sort order (UD names sorted as numbers) will be used. The value is 2. \
 * **Lexicographical**: Indicates that forward lexicographical sort order (UD names sorted as strings) will be used. The value is 3. \
 * **ReverseNumeric**: Indicates that reverse numeric sort order (UD names sorted as numbers) will be used. The value is 4. \
 * **ReverseLexicographical**: Indicates that reverse lexicographical sort order (UD names sorted as strings) will be used. The value is 5.
 */
export type UpgradeSortOrder = string;

/** Known values of {@link FailureAction} that the service accepts. */
export enum KnownFailureAction {
  /** Indicates the failure action is invalid. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** The upgrade will start rolling back automatically. The value is 1 */
  Rollback = "Rollback",
  /** The upgrade will switch to UnmonitoredManual upgrade mode. The value is 2 */
  Manual = "Manual"
}

/**
 * Defines values for FailureAction. \
 * {@link KnownFailureAction} can be used interchangeably with FailureAction,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the failure action is invalid. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **Rollback**: The upgrade will start rolling back automatically. The value is 1 \
 * **Manual**: The upgrade will switch to UnmonitoredManual upgrade mode. The value is 2
 */
export type FailureAction = string;

/** Known values of {@link NodeUpgradePhase} that the service accepts. */
export enum KnownNodeUpgradePhase {
  /** Indicates the upgrade state is invalid. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** The upgrade has not started yet due to pending safety checks. The value is 1 */
  PreUpgradeSafetyCheck = "PreUpgradeSafetyCheck",
  /** The upgrade is in progress. The value is 2 */
  Upgrading = "Upgrading",
  /** The upgrade has completed and post upgrade safety checks are being performed. The value is 3 */
  PostUpgradeSafetyCheck = "PostUpgradeSafetyCheck"
}

/**
 * Defines values for NodeUpgradePhase. \
 * {@link KnownNodeUpgradePhase} can be used interchangeably with NodeUpgradePhase,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the upgrade state is invalid. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **PreUpgradeSafetyCheck**: The upgrade has not started yet due to pending safety checks. The value is 1 \
 * **Upgrading**: The upgrade is in progress. The value is 2 \
 * **PostUpgradeSafetyCheck**: The upgrade has completed and post upgrade safety checks are being performed. The value is 3
 */
export type NodeUpgradePhase = string;

/** Known values of {@link SafetyCheckKind} that the service accepts. */
export enum KnownSafetyCheckKind {
  /** Indicates that the upgrade safety check kind is invalid. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** Indicates that if we bring down the node then this will result in global seed node quorum loss. The value is 1. */
  EnsureSeedNodeQuorum = "EnsureSeedNodeQuorum",
  /** Indicates that there is some partition for which if we bring down the replica on the node, it will result in quorum loss for that partition. The value is 2. */
  EnsurePartitionQuorum = "EnsurePartitionQuorum",
  /** Indicates that there is some replica on the node that was moved out of this node due to upgrade. Service Fabric is now waiting for the primary to be moved back to this node. The value is 3. */
  WaitForPrimaryPlacement = "WaitForPrimaryPlacement",
  /** Indicates that Service Fabric is waiting for a primary replica to be moved out of the node before starting upgrade on that node. The value is 4. */
  WaitForPrimarySwap = "WaitForPrimarySwap",
  /** Indicates that there is some replica on the node that is involved in a reconfiguration. Service Fabric is waiting for the reconfiguration to be complete before staring upgrade on that node. The value is 5. */
  WaitForReconfiguration = "WaitForReconfiguration",
  /** Indicates that there is either a replica on the node that is going through copy, or there is a primary replica on the node that is copying data to some other replica. In both cases, bringing down the replica on the node due to upgrade will abort the copy. The value is 6. */
  WaitForInbuildReplica = "WaitForInbuildReplica",
  /** Indicates that there is either a stateless service partition on the node having exactly one instance, or there is a primary replica on the node for which the partition is quorum loss. In both cases, bringing down the replicas due to upgrade will result in loss of availability. The value is 7. */
  EnsureAvailability = "EnsureAvailability"
}

/**
 * Defines values for SafetyCheckKind. \
 * {@link KnownSafetyCheckKind} can be used interchangeably with SafetyCheckKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates that the upgrade safety check kind is invalid. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **EnsureSeedNodeQuorum**: Indicates that if we bring down the node then this will result in global seed node quorum loss. The value is 1. \
 * **EnsurePartitionQuorum**: Indicates that there is some partition for which if we bring down the replica on the node, it will result in quorum loss for that partition. The value is 2. \
 * **WaitForPrimaryPlacement**: Indicates that there is some replica on the node that was moved out of this node due to upgrade. Service Fabric is now waiting for the primary to be moved back to this node. The value is 3. \
 * **WaitForPrimarySwap**: Indicates that Service Fabric is waiting for a primary replica to be moved out of the node before starting upgrade on that node. The value is 4. \
 * **WaitForReconfiguration**: Indicates that there is some replica on the node that is involved in a reconfiguration. Service Fabric is waiting for the reconfiguration to be complete before staring upgrade on that node. The value is 5. \
 * **WaitForInbuildReplica**: Indicates that there is either a replica on the node that is going through copy, or there is a primary replica on the node that is copying data to some other replica. In both cases, bringing down the replica on the node due to upgrade will abort the copy. The value is 6. \
 * **EnsureAvailability**: Indicates that there is either a stateless service partition on the node having exactly one instance, or there is a primary replica on the node for which the partition is quorum loss. In both cases, bringing down the replicas due to upgrade will result in loss of availability. The value is 7.
 */
export type SafetyCheckKind = string;

/** Known values of {@link FailureReason} that the service accepts. */
export enum KnownFailureReason {
  /** Indicates the reason is invalid or unknown. All Service Fabric enumerations have the invalid type. The value is zero. */
  None = "None",
  /** There was an external request to roll back the upgrade. The value is 1 */
  Interrupted = "Interrupted",
  /** The upgrade failed due to health policy violations. The value is 2 */
  HealthCheck = "HealthCheck",
  /** An upgrade domain took longer than the allowed upgrade domain timeout to process. The value is 3 */
  UpgradeDomainTimeout = "UpgradeDomainTimeout",
  /** The overall upgrade took longer than the allowed upgrade timeout to process. The value is 4 */
  OverallUpgradeTimeout = "OverallUpgradeTimeout"
}

/**
 * Defines values for FailureReason. \
 * {@link KnownFailureReason} can be used interchangeably with FailureReason,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **None**: Indicates the reason is invalid or unknown. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **Interrupted**: There was an external request to roll back the upgrade. The value is 1 \
 * **HealthCheck**: The upgrade failed due to health policy violations. The value is 2 \
 * **UpgradeDomainTimeout**: An upgrade domain took longer than the allowed upgrade domain timeout to process. The value is 3 \
 * **OverallUpgradeTimeout**: The overall upgrade took longer than the allowed upgrade timeout to process. The value is 4
 */
export type FailureReason = string;

/** Known values of {@link UpgradeType} that the service accepts. */
export enum KnownUpgradeType {
  /** Indicates the upgrade kind is invalid. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** The upgrade progresses one upgrade domain at a time. The value is 1. */
  Rolling = "Rolling",
  /** The upgrade gets restarted by force. The value is 2. */
  RollingForceRestart = "Rolling_ForceRestart"
}

/**
 * Defines values for UpgradeType. \
 * {@link KnownUpgradeType} can be used interchangeably with UpgradeType,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the upgrade kind is invalid. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **Rolling**: The upgrade progresses one upgrade domain at a time. The value is 1. \
 * **Rolling_ForceRestart**: The upgrade gets restarted by force. The value is 2.
 */
export type UpgradeType = string;

/** Known values of {@link ServiceHostUpgradeImpact} that the service accepts. */
export enum KnownServiceHostUpgradeImpact {
  /** Indicates the upgrade impact is invalid. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** The upgrade is not expected to cause service host restarts. The value is 1. */
  None = "None",
  /** The upgrade is expected to cause a service host restart. The value is 2. */
  ServiceHostRestart = "ServiceHostRestart",
  /** The upgrade will cause an unexpected service host restart. This indicates a bug in the Service Fabric runtime and proceeding with an upgrade with this impact may lead to skipped safety checks. Running the upgrade with the ForceRestart flag will force proper safety checks. The value is 3. */
  UnexpectedServiceHostRestart = "UnexpectedServiceHostRestart"
}

/**
 * Defines values for ServiceHostUpgradeImpact. \
 * {@link KnownServiceHostUpgradeImpact} can be used interchangeably with ServiceHostUpgradeImpact,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the upgrade impact is invalid. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **None**: The upgrade is not expected to cause service host restarts. The value is 1. \
 * **ServiceHostRestart**: The upgrade is expected to cause a service host restart. The value is 2. \
 * **UnexpectedServiceHostRestart**: The upgrade will cause an unexpected service host restart. This indicates a bug in the Service Fabric runtime and proceeding with an upgrade with this impact may lead to skipped safety checks. Running the upgrade with the ForceRestart flag will force proper safety checks. The value is 3.
 */
export type ServiceHostUpgradeImpact = string;

/** Known values of {@link NodeStatusFilter} that the service accepts. */
export enum KnownNodeStatusFilter {
  /** This filter value will match all of the nodes excepts the ones with status as Unknown or Removed. */
  Default = "default",
  /** This filter value will match all of the nodes. */
  All = "all",
  /** This filter value will match nodes that are Up. */
  Up = "up",
  /** This filter value will match nodes that are Down. */
  Down = "down",
  /** This filter value will match nodes that are in the process of being enabled with status as Enabling. */
  Enabling = "enabling",
  /** This filter value will match nodes that are in the process of being disabled with status as Disabling. */
  Disabling = "disabling",
  /** This filter value will match nodes that are Disabled. */
  Disabled = "disabled",
  /** This filter value will match nodes whose status is Unknown. A node would be in Unknown state if Service Fabric does not have authoritative information about that node. This can happen if the system learns about a node at runtime. */
  Unknown = "unknown",
  /** This filter value will match nodes whose status is Removed. These are the nodes that are removed from the cluster using the RemoveNodeState API. */
  Removed = "removed"
}

/**
 * Defines values for NodeStatusFilter. \
 * {@link KnownNodeStatusFilter} can be used interchangeably with NodeStatusFilter,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **default**: This filter value will match all of the nodes excepts the ones with status as Unknown or Removed. \
 * **all**: This filter value will match all of the nodes. \
 * **up**: This filter value will match nodes that are Up. \
 * **down**: This filter value will match nodes that are Down. \
 * **enabling**: This filter value will match nodes that are in the process of being enabled with status as Enabling. \
 * **disabling**: This filter value will match nodes that are in the process of being disabled with status as Disabling. \
 * **disabled**: This filter value will match nodes that are Disabled. \
 * **unknown**: This filter value will match nodes whose status is Unknown. A node would be in Unknown state if Service Fabric does not have authoritative information about that node. This can happen if the system learns about a node at runtime. \
 * **removed**: This filter value will match nodes whose status is Removed. These are the nodes that are removed from the cluster using the RemoveNodeState API.
 */
export type NodeStatusFilter = string;

/** Known values of {@link NodeStatus} that the service accepts. */
export enum KnownNodeStatus {
  /** Indicates the node status is invalid. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** Indicates the node is up. The value is 1. */
  Up = "Up",
  /** Indicates the node is down. The value is 2. */
  Down = "Down",
  /** Indicates the node is in process of being enabled. The value is 3. */
  Enabling = "Enabling",
  /** Indicates the node is in the process of being disabled. The value is 4. */
  Disabling = "Disabling",
  /** Indicates the node is disabled. The value is 5. */
  Disabled = "Disabled",
  /** Indicates the node is unknown. A node would be in Unknown state if Service Fabric does not have authoritative information about that node. This can happen if the system learns about a node at runtime.The value is 6. */
  Unknown = "Unknown",
  /** Indicates the node is removed. A node would be in Removed state if NodeStateRemoved API has been called for this node. In other words, Service Fabric has been informed that the persisted state on the node has been permanently lost. The value is 7. */
  Removed = "Removed"
}

/**
 * Defines values for NodeStatus. \
 * {@link KnownNodeStatus} can be used interchangeably with NodeStatus,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the node status is invalid. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **Up**: Indicates the node is up. The value is 1. \
 * **Down**: Indicates the node is down. The value is 2. \
 * **Enabling**: Indicates the node is in process of being enabled. The value is 3. \
 * **Disabling**: Indicates the node is in the process of being disabled. The value is 4. \
 * **Disabled**: Indicates the node is disabled. The value is 5. \
 * **Unknown**: Indicates the node is unknown. A node would be in Unknown state if Service Fabric does not have authoritative information about that node. This can happen if the system learns about a node at runtime.The value is 6. \
 * **Removed**: Indicates the node is removed. A node would be in Removed state if NodeStateRemoved API has been called for this node. In other words, Service Fabric has been informed that the persisted state on the node has been permanently lost. The value is 7.
 */
export type NodeStatus = string;

/** Known values of {@link NodeDeactivationIntent} that the service accepts. */
export enum KnownNodeDeactivationIntent {
  /** Indicates the node deactivation intent is invalid. All Service Fabric enumerations have the invalid type. The value is zero. This value is not used. */
  Invalid = "Invalid",
  /** Indicates that the node should be paused. The value is 1. */
  Pause = "Pause",
  /** Indicates that the intent is for the node to be restarted after a short period of time. Service Fabric does not restart the node, this action is done outside of Service Fabric. The value is 2. */
  Restart = "Restart",
  /** Indicates that the intent is to reimage the node. Service Fabric does not reimage the node, this action is done outside of Service Fabric. The value is 3. */
  RemoveData = "RemoveData",
  /** Indicates that the node is being decommissioned and is not expected to return. Service Fabric does not decommission the node, this action is done outside of Service Fabric. The value is 4. */
  RemoveNode = "RemoveNode"
}

/**
 * Defines values for NodeDeactivationIntent. \
 * {@link KnownNodeDeactivationIntent} can be used interchangeably with NodeDeactivationIntent,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the node deactivation intent is invalid. All Service Fabric enumerations have the invalid type. The value is zero. This value is not used. \
 * **Pause**: Indicates that the node should be paused. The value is 1. \
 * **Restart**: Indicates that the intent is for the node to be restarted after a short period of time. Service Fabric does not restart the node, this action is done outside of Service Fabric. The value is 2. \
 * **RemoveData**: Indicates that the intent is to reimage the node. Service Fabric does not reimage the node, this action is done outside of Service Fabric. The value is 3. \
 * **RemoveNode**: Indicates that the node is being decommissioned and is not expected to return. Service Fabric does not decommission the node, this action is done outside of Service Fabric. The value is 4.
 */
export type NodeDeactivationIntent = string;

/** Known values of {@link NodeDeactivationStatus} that the service accepts. */
export enum KnownNodeDeactivationStatus {
  /** No status is associated with the task. The value is zero. */
  None = "None",
  /** When a node is deactivated Service Fabric performs checks to ensure that the operation is safe to proceed to ensure availability of the service and reliability of the state. This value indicates that one or more safety checks are in progress. The value is 1. */
  SafetyCheckInProgress = "SafetyCheckInProgress",
  /** When a node is deactivated Service Fabric performs checks to ensure that the operation is safe to proceed to ensure availability of the service and reliability of the state. This value indicates that all safety checks have been completed. The value is 2. */
  SafetyCheckComplete = "SafetyCheckComplete",
  /** The task is completed. The value is 3. */
  Completed = "Completed"
}

/**
 * Defines values for NodeDeactivationStatus. \
 * {@link KnownNodeDeactivationStatus} can be used interchangeably with NodeDeactivationStatus,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **None**: No status is associated with the task. The value is zero. \
 * **SafetyCheckInProgress**: When a node is deactivated Service Fabric performs checks to ensure that the operation is safe to proceed to ensure availability of the service and reliability of the state. This value indicates that one or more safety checks are in progress. The value is 1. \
 * **SafetyCheckComplete**: When a node is deactivated Service Fabric performs checks to ensure that the operation is safe to proceed to ensure availability of the service and reliability of the state. This value indicates that all safety checks have been completed. The value is 2. \
 * **Completed**: The task is completed. The value is 3.
 */
export type NodeDeactivationStatus = string;

/** Known values of {@link NodeDeactivationTaskType} that the service accepts. */
export enum KnownNodeDeactivationTaskType {
  /** Indicates the node deactivation task type is invalid. All Service Fabric enumerations have the invalid type. The value is zero. This value is not used. */
  Invalid = "Invalid",
  /** Specifies the task created by Infrastructure hosting the nodes. The value is 1. */
  Infrastructure = "Infrastructure",
  /** Specifies the task that was created by the Repair Manager service. The value is 2. */
  Repair = "Repair",
  /** Specifies that the task was created by using the public API. The value is 3. */
  Client = "Client"
}

/**
 * Defines values for NodeDeactivationTaskType. \
 * {@link KnownNodeDeactivationTaskType} can be used interchangeably with NodeDeactivationTaskType,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the node deactivation task type is invalid. All Service Fabric enumerations have the invalid type. The value is zero. This value is not used. \
 * **Infrastructure**: Specifies the task created by Infrastructure hosting the nodes. The value is 1. \
 * **Repair**: Specifies the task that was created by the Repair Manager service. The value is 2. \
 * **Client**: Specifies that the task was created by using the public API. The value is 3.
 */
export type NodeDeactivationTaskType = string;

/** Known values of {@link DeactivationIntent} that the service accepts. */
export enum KnownDeactivationIntent {
  /** Indicates that the node should be paused. The value is 1. */
  Pause = "Pause",
  /** Indicates that the intent is for the node to be restarted after a short period of time. The value is 2. */
  Restart = "Restart",
  /** Indicates the intent is for the node to remove data. The value is 3. */
  RemoveData = "RemoveData"
}

/**
 * Defines values for DeactivationIntent. \
 * {@link KnownDeactivationIntent} can be used interchangeably with DeactivationIntent,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Pause**: Indicates that the node should be paused. The value is 1. \
 * **Restart**: Indicates that the intent is for the node to be restarted after a short period of time. The value is 2. \
 * **RemoveData**: Indicates the intent is for the node to remove data. The value is 3.
 */
export type DeactivationIntent = string;

/** Known values of {@link CreateFabricDump} that the service accepts. */
export enum KnownCreateFabricDump {
  /** False */
  False = "False",
  /** True */
  True = "True"
}

/**
 * Defines values for CreateFabricDump. \
 * {@link KnownCreateFabricDump} can be used interchangeably with CreateFabricDump,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **False** \
 * **True**
 */
export type CreateFabricDump = string;

/** Known values of {@link ApplicationTypeStatus} that the service accepts. */
export enum KnownApplicationTypeStatus {
  /** Indicates the application type status is invalid. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** Indicates that the application type is being provisioned in the cluster. The value is 1. */
  Provisioning = "Provisioning",
  /** Indicates that the application type is fully provisioned and is available for use. An application of this type and version can be created. The value is 2. */
  Available = "Available",
  /** Indicates that the application type is in process of being unprovisioned from the cluster. The value is 3. */
  Unprovisioning = "Unprovisioning",
  /** Indicates that the application type provisioning failed and it is unavailable for use. The failure details can be obtained from the application type information query. The failed application type information remains in the cluster until it is unprovisioned or reprovisioned successfully. The value is 4. */
  Failed = "Failed"
}

/**
 * Defines values for ApplicationTypeStatus. \
 * {@link KnownApplicationTypeStatus} can be used interchangeably with ApplicationTypeStatus,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the application type status is invalid. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **Provisioning**: Indicates that the application type is being provisioned in the cluster. The value is 1. \
 * **Available**: Indicates that the application type is fully provisioned and is available for use. An application of this type and version can be created. The value is 2. \
 * **Unprovisioning**: Indicates that the application type is in process of being unprovisioned from the cluster. The value is 3. \
 * **Failed**: Indicates that the application type provisioning failed and it is unavailable for use. The failure details can be obtained from the application type information query. The failed application type information remains in the cluster until it is unprovisioned or reprovisioned successfully. The value is 4.
 */
export type ApplicationTypeStatus = string;

/** Known values of {@link ApplicationTypeDefinitionKind} that the service accepts. */
export enum KnownApplicationTypeDefinitionKind {
  /** Indicates the application type definition kind is invalid. All Service Fabric enumerations have the invalid type. The value is 0. */
  Invalid = "Invalid",
  /** Indicates the application type is defined and created by a Service Fabric application package provided by the user. The value is 1. */
  ServiceFabricApplicationPackage = "ServiceFabricApplicationPackage",
  /** Indicates the application type is defined and created implicitly as part of a compose deployment. The value is 2. */
  Compose = "Compose"
}

/**
 * Defines values for ApplicationTypeDefinitionKind. \
 * {@link KnownApplicationTypeDefinitionKind} can be used interchangeably with ApplicationTypeDefinitionKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the application type definition kind is invalid. All Service Fabric enumerations have the invalid type. The value is 0. \
 * **ServiceFabricApplicationPackage**: Indicates the application type is defined and created by a Service Fabric application package provided by the user. The value is 1. \
 * **Compose**: Indicates the application type is defined and created implicitly as part of a compose deployment. The value is 2.
 */
export type ApplicationTypeDefinitionKind = string;

/** Known values of {@link ProvisionApplicationTypeKind} that the service accepts. */
export enum KnownProvisionApplicationTypeKind {
  /** Indicates that the provision kind is invalid. This value is default and should not be used. The value is zero. */
  Invalid = "Invalid",
  /** Indicates that the provision is for a package that was previously uploaded to the image store. The value is 1. */
  ImageStorePath = "ImageStorePath",
  /** Indicates that the provision is for an application package that was previously uploaded to an external store. The application package ends with the extension *.sfpkg. The value is 2. */
  ExternalStore = "ExternalStore"
}

/**
 * Defines values for ProvisionApplicationTypeKind. \
 * {@link KnownProvisionApplicationTypeKind} can be used interchangeably with ProvisionApplicationTypeKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates that the provision kind is invalid. This value is default and should not be used. The value is zero. \
 * **ImageStorePath**: Indicates that the provision is for a package that was previously uploaded to the image store. The value is 1. \
 * **ExternalStore**: Indicates that the provision is for an application package that was previously uploaded to an external store. The application package ends with the extension *.sfpkg. The value is 2.
 */
export type ProvisionApplicationTypeKind = string;

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
  RequireDomain = "RequireDomain",
  /** Indicates that the ServicePlacementPolicyDescription is of type ServicePlacementPreferPrimaryDomainPolicyDescription, which indicates that if possible the Primary replica for the partitions of the service should be located in a particular domain as an optimization. The value is 3. */
  PreferPrimaryDomain = "PreferPrimaryDomain",
  /** Indicates that the ServicePlacementPolicyDescription is of type ServicePlacementRequireDomainDistributionPolicyDescription, indicating that the system will disallow placement of any two replicas from the same partition in the same domain at any time. The value is 4. */
  RequireDomainDistribution = "RequireDomainDistribution",
  /** Indicates that the ServicePlacementPolicyDescription is of type ServicePlacementNonPartiallyPlaceServicePolicyDescription, which indicates that if possible all replicas of a particular partition of the service should be placed atomically. The value is 5. */
  NonPartiallyPlaceService = "NonPartiallyPlaceService",
  /** Indicates that the ServicePlacementPolicyDescription is of type ServicePlacementAllowMultipleStatelessInstancesOnNodePolicyDescription, which indicates that multiple stateless instances of a particular partition of the service can be placed on a node. The value is 6. */
  AllowMultipleStatelessInstancesOnNode = "AllowMultipleStatelessInstancesOnNode"
}

/**
 * Defines values for ServicePlacementPolicyType. \
 * {@link KnownServicePlacementPolicyType} can be used interchangeably with ServicePlacementPolicyType,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the type of the placement policy is invalid. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **InvalidDomain**: Indicates that the ServicePlacementPolicyDescription is of type ServicePlacementInvalidDomainPolicyDescription, which indicates that a particular fault or upgrade domain cannot be used for placement of this service. The value is 1. \
 * **RequireDomain**: Indicates that the ServicePlacementPolicyDescription is of type ServicePlacementRequireDomainDistributionPolicyDescription indicating that the replicas of the service must be placed in a specific domain. The value is 2. \
 * **PreferPrimaryDomain**: Indicates that the ServicePlacementPolicyDescription is of type ServicePlacementPreferPrimaryDomainPolicyDescription, which indicates that if possible the Primary replica for the partitions of the service should be located in a particular domain as an optimization. The value is 3. \
 * **RequireDomainDistribution**: Indicates that the ServicePlacementPolicyDescription is of type ServicePlacementRequireDomainDistributionPolicyDescription, indicating that the system will disallow placement of any two replicas from the same partition in the same domain at any time. The value is 4. \
 * **NonPartiallyPlaceService**: Indicates that the ServicePlacementPolicyDescription is of type ServicePlacementNonPartiallyPlaceServicePolicyDescription, which indicates that if possible all replicas of a particular partition of the service should be placed atomically. The value is 5. \
 * **AllowMultipleStatelessInstancesOnNode**: Indicates that the ServicePlacementPolicyDescription is of type ServicePlacementAllowMultipleStatelessInstancesOnNodePolicyDescription, which indicates that multiple stateless instances of a particular partition of the service can be placed on a node. The value is 6.
 */
export type ServicePlacementPolicyType = string;

/** Known values of {@link ServiceTypeRegistrationStatus} that the service accepts. */
export enum KnownServiceTypeRegistrationStatus {
  /** Indicates the registration status is invalid. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** Indicates that the service type is disabled on this node. A type gets disabled when there are too many failures of the code package hosting the service type. If the service type is disabled, new replicas of that service type will not be placed on the node until it is enabled again. The service type is enabled again after the process hosting it comes up and re-registers the type or a preconfigured time interval has passed. The value is 1. */
  Disabled = "Disabled",
  /** Indicates that the service type is enabled on this node. Replicas of this service type can be placed on this node when the code package registers the service type. The value is 2. */
  Enabled = "Enabled",
  /** Indicates that the service type is enabled and registered on the node by a code package. Replicas of this service type can now be placed on this node. The value is 3. */
  Registered = "Registered"
}

/**
 * Defines values for ServiceTypeRegistrationStatus. \
 * {@link KnownServiceTypeRegistrationStatus} can be used interchangeably with ServiceTypeRegistrationStatus,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the registration status is invalid. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **Disabled**: Indicates that the service type is disabled on this node. A type gets disabled when there are too many failures of the code package hosting the service type. If the service type is disabled, new replicas of that service type will not be placed on the node until it is enabled again. The service type is enabled again after the process hosting it comes up and re-registers the type or a preconfigured time interval has passed. The value is 1. \
 * **Enabled**: Indicates that the service type is enabled on this node. Replicas of this service type can be placed on this node when the code package registers the service type. The value is 2. \
 * **Registered**: Indicates that the service type is enabled and registered on the node by a code package. Replicas of this service type can now be placed on this node. The value is 3.
 */
export type ServiceTypeRegistrationStatus = string;

/** Known values of {@link ApplicationStatus} that the service accepts. */
export enum KnownApplicationStatus {
  /** Indicates the application status is invalid. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** Indicates the application status is ready. The value is 1. */
  Ready = "Ready",
  /** Indicates the application status is upgrading. The value is 2. */
  Upgrading = "Upgrading",
  /** Indicates the application status is creating. The value is 3. */
  Creating = "Creating",
  /** Indicates the application status is deleting. The value is 4. */
  Deleting = "Deleting",
  /** Indicates the creation or deletion of application was terminated due to persistent failures. Another create\/delete request can be accepted to resume a failed application. The value is 5. */
  Failed = "Failed"
}

/**
 * Defines values for ApplicationStatus. \
 * {@link KnownApplicationStatus} can be used interchangeably with ApplicationStatus,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the application status is invalid. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **Ready**: Indicates the application status is ready. The value is 1. \
 * **Upgrading**: Indicates the application status is upgrading. The value is 2. \
 * **Creating**: Indicates the application status is creating. The value is 3. \
 * **Deleting**: Indicates the application status is deleting. The value is 4. \
 * **Failed**: Indicates the creation or deletion of application was terminated due to persistent failures. Another create\/delete request can be accepted to resume a failed application. The value is 5.
 */
export type ApplicationStatus = string;

/** Known values of {@link ApplicationDefinitionKind} that the service accepts. */
export enum KnownApplicationDefinitionKind {
  /** Indicates the application definition kind is invalid. All Service Fabric enumerations have the invalid type. The value is 65535. */
  Invalid = "Invalid",
  /** Indicates the application is defined by a Service Fabric application description. The value is 0. */
  ServiceFabricApplicationDescription = "ServiceFabricApplicationDescription",
  /** Indicates the application is defined by compose file(s). The value is 1. */
  Compose = "Compose"
}

/**
 * Defines values for ApplicationDefinitionKind. \
 * {@link KnownApplicationDefinitionKind} can be used interchangeably with ApplicationDefinitionKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the application definition kind is invalid. All Service Fabric enumerations have the invalid type. The value is 65535. \
 * **ServiceFabricApplicationDescription**: Indicates the application is defined by a Service Fabric application description. The value is 0. \
 * **Compose**: Indicates the application is defined by compose file(s). The value is 1.
 */
export type ApplicationDefinitionKind = string;

/** Known values of {@link DeployedApplicationStatus} that the service accepts. */
export enum KnownDeployedApplicationStatus {
  /** Indicates that deployment status is not valid. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** Indicates that the package is downloading from the ImageStore. The value is 1. */
  Downloading = "Downloading",
  /** Indicates that the package is activating. The value is 2. */
  Activating = "Activating",
  /** Indicates that the package is active. The value is 3. */
  Active = "Active",
  /** Indicates that the package is upgrading. The value is 4. */
  Upgrading = "Upgrading",
  /** Indicates that the package is deactivating. The value is 5. */
  Deactivating = "Deactivating"
}

/**
 * Defines values for DeployedApplicationStatus. \
 * {@link KnownDeployedApplicationStatus} can be used interchangeably with DeployedApplicationStatus,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates that deployment status is not valid. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **Downloading**: Indicates that the package is downloading from the ImageStore. The value is 1. \
 * **Activating**: Indicates that the package is activating. The value is 2. \
 * **Active**: Indicates that the package is active. The value is 3. \
 * **Upgrading**: Indicates that the package is upgrading. The value is 4. \
 * **Deactivating**: Indicates that the package is deactivating. The value is 5.
 */
export type DeployedApplicationStatus = string;

/** Known values of {@link ServiceStatus} that the service accepts. */
export enum KnownServiceStatus {
  /** Indicates the service status is unknown. The value is zero. */
  Unknown = "Unknown",
  /** Indicates the service status is active. The value is 1. */
  Active = "Active",
  /** Indicates the service is upgrading. The value is 2. */
  Upgrading = "Upgrading",
  /** Indicates the service is being deleted. The value is 3. */
  Deleting = "Deleting",
  /** Indicates the service is being created. The value is 4. */
  Creating = "Creating",
  /** Indicates creation or deletion was terminated due to persistent failures. Another create\/delete request can be accepted. The value is 5. */
  Failed = "Failed"
}

/**
 * Defines values for ServiceStatus. \
 * {@link KnownServiceStatus} can be used interchangeably with ServiceStatus,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Unknown**: Indicates the service status is unknown. The value is zero. \
 * **Active**: Indicates the service status is active. The value is 1. \
 * **Upgrading**: Indicates the service is upgrading. The value is 2. \
 * **Deleting**: Indicates the service is being deleted. The value is 3. \
 * **Creating**: Indicates the service is being created. The value is 4. \
 * **Failed**: Indicates creation or deletion was terminated due to persistent failures. Another create\/delete request can be accepted. The value is 5.
 */
export type ServiceStatus = string;

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

/** Known values of {@link MoveCost} that the service accepts. */
export enum KnownMoveCost {
  /** Zero move cost. This value is zero. */
  Zero = "Zero",
  /** Specifies the move cost of the service as Low. The value is 1. */
  Low = "Low",
  /** Specifies the move cost of the service as Medium. The value is 2. */
  Medium = "Medium",
  /** Specifies the move cost of the service as High. The value is 3. */
  High = "High",
  /** Specifies the move cost of the service as VeryHigh. The value is 4. */
  VeryHigh = "VeryHigh"
}

/**
 * Defines values for MoveCost. \
 * {@link KnownMoveCost} can be used interchangeably with MoveCost,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Zero**: Zero move cost. This value is zero. \
 * **Low**: Specifies the move cost of the service as Low. The value is 1. \
 * **Medium**: Specifies the move cost of the service as Medium. The value is 2. \
 * **High**: Specifies the move cost of the service as High. The value is 3. \
 * **VeryHigh**: Specifies the move cost of the service as VeryHigh. The value is 4.
 */
export type MoveCost = string;

/** Known values of {@link ServicePackageActivationMode} that the service accepts. */
export enum KnownServicePackageActivationMode {
  /** This is the default activation mode. With this activation mode, replicas or instances from different partition(s) of service, on a given node, will share same activation of service package on a node. The value is zero. */
  SharedProcess = "SharedProcess",
  /** With this activation mode, each replica or instance of service, on a given node, will have its own dedicated activation of service package on a node. The value is 1. */
  ExclusiveProcess = "ExclusiveProcess"
}

/**
 * Defines values for ServicePackageActivationMode. \
 * {@link KnownServicePackageActivationMode} can be used interchangeably with ServicePackageActivationMode,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **SharedProcess**: This is the default activation mode. With this activation mode, replicas or instances from different partition(s) of service, on a given node, will share same activation of service package on a node. The value is zero. \
 * **ExclusiveProcess**: With this activation mode, each replica or instance of service, on a given node, will have its own dedicated activation of service package on a node. The value is 1.
 */
export type ServicePackageActivationMode = string;

/** Known values of {@link ScalingTriggerKind} that the service accepts. */
export enum KnownScalingTriggerKind {
  /** Indicates the scaling trigger is invalid. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** Indicates a trigger where scaling decisions are made based on average load of a partition. The value is 1. */
  AveragePartitionLoad = "AveragePartitionLoad",
  /** Indicates a trigger where scaling decisions are made based on average load of a service. The value is 2. */
  AverageServiceLoad = "AverageServiceLoad"
}

/**
 * Defines values for ScalingTriggerKind. \
 * {@link KnownScalingTriggerKind} can be used interchangeably with ScalingTriggerKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the scaling trigger is invalid. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **AveragePartitionLoad**: Indicates a trigger where scaling decisions are made based on average load of a partition. The value is 1. \
 * **AverageServiceLoad**: Indicates a trigger where scaling decisions are made based on average load of a service. The value is 2.
 */
export type ScalingTriggerKind = string;

/** Known values of {@link ScalingMechanismKind} that the service accepts. */
export enum KnownScalingMechanismKind {
  /** Indicates the scaling mechanism is invalid. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** Indicates a mechanism for scaling where new instances are added or removed from a partition. The value is 1. */
  PartitionInstanceCount = "PartitionInstanceCount",
  /** Indicates a mechanism for scaling where new named partitions are added or removed from a service. The value is 2. */
  AddRemoveIncrementalNamedPartition = "AddRemoveIncrementalNamedPartition"
}

/**
 * Defines values for ScalingMechanismKind. \
 * {@link KnownScalingMechanismKind} can be used interchangeably with ScalingMechanismKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the scaling mechanism is invalid. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **PartitionInstanceCount**: Indicates a mechanism for scaling where new instances are added or removed from a partition. The value is 1. \
 * **AddRemoveIncrementalNamedPartition**: Indicates a mechanism for scaling where new named partitions are added or removed from a service. The value is 2.
 */
export type ScalingMechanismKind = string;

/** Known values of {@link ServicePartitionKind} that the service accepts. */
export enum KnownServicePartitionKind {
  /** Indicates the partition kind is invalid. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** Indicates that there is only one partition, and SingletonPartitionSchemeDescription was specified while creating the service. The value is 1. */
  Singleton = "Singleton",
  /** Indicates that the partition is based on Int64 key ranges, and UniformInt64RangePartitionSchemeDescription was specified while creating the service. The value is 2. */
  Int64Range = "Int64Range",
  /** Indicates that the partition is based on string names, and NamedPartitionInformation  was specified while creating the service. The value is 3. */
  Named = "Named"
}

/**
 * Defines values for ServicePartitionKind. \
 * {@link KnownServicePartitionKind} can be used interchangeably with ServicePartitionKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the partition kind is invalid. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **Singleton**: Indicates that there is only one partition, and SingletonPartitionSchemeDescription was specified while creating the service. The value is 1. \
 * **Int64Range**: Indicates that the partition is based on Int64 key ranges, and UniformInt64RangePartitionSchemeDescription was specified while creating the service. The value is 2. \
 * **Named**: Indicates that the partition is based on string names, and NamedPartitionInformation  was specified while creating the service. The value is 3.
 */
export type ServicePartitionKind = string;

/** Known values of {@link ServiceEndpointRole} that the service accepts. */
export enum KnownServiceEndpointRole {
  /** Indicates the service endpoint role is invalid. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** Indicates that the service endpoint is of a stateless service. The value is 1. */
  Stateless = "Stateless",
  /** Indicates that the service endpoint is of a primary replica of a stateful service. The value is 2. */
  StatefulPrimary = "StatefulPrimary",
  /** Indicates that the service endpoint is of a secondary replica of a stateful service. The value is 3. */
  StatefulSecondary = "StatefulSecondary"
}

/**
 * Defines values for ServiceEndpointRole. \
 * {@link KnownServiceEndpointRole} can be used interchangeably with ServiceEndpointRole,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the service endpoint role is invalid. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **Stateless**: Indicates that the service endpoint is of a stateless service. The value is 1. \
 * **StatefulPrimary**: Indicates that the service endpoint is of a primary replica of a stateful service. The value is 2. \
 * **StatefulSecondary**: Indicates that the service endpoint is of a secondary replica of a stateful service. The value is 3.
 */
export type ServiceEndpointRole = string;

/** Known values of {@link Ordering} that the service accepts. */
export enum KnownOrdering {
  /** Descending sort order. */
  Desc = "Desc",
  /** Ascending sort order. */
  Asc = "Asc"
}

/**
 * Defines values for Ordering. \
 * {@link KnownOrdering} can be used interchangeably with Ordering,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Desc**: Descending sort order. \
 * **Asc**: Ascending sort order.
 */
export type Ordering = string;

/** Known values of {@link ServicePartitionStatus} that the service accepts. */
export enum KnownServicePartitionStatus {
  /** Indicates the partition status is invalid. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** Indicates that the partition is ready. This means that for a stateless service partition there is at least one instance that is up and for a stateful service partition the number of ready replicas is greater than or equal to the MinReplicaSetSize. The value is 1. */
  Ready = "Ready",
  /** Indicates that the partition is not ready. This status is returned when none of the other states apply. The value is 2. */
  NotReady = "NotReady",
  /** Indicates that the partition is in quorum loss. This means that number of replicas that are up and participating in a replica set is less than MinReplicaSetSize for this partition. The value is 3. */
  InQuorumLoss = "InQuorumLoss",
  /** Indicates that the partition is undergoing reconfiguration of its replica sets. This can happen due to failover, upgrade, load balancing or addition or removal of replicas from the replica set. The value is 4. */
  Reconfiguring = "Reconfiguring",
  /** Indicates that the partition is being deleted. The value is 5. */
  Deleting = "Deleting"
}

/**
 * Defines values for ServicePartitionStatus. \
 * {@link KnownServicePartitionStatus} can be used interchangeably with ServicePartitionStatus,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the partition status is invalid. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **Ready**: Indicates that the partition is ready. This means that for a stateless service partition there is at least one instance that is up and for a stateful service partition the number of ready replicas is greater than or equal to the MinReplicaSetSize. The value is 1. \
 * **NotReady**: Indicates that the partition is not ready. This status is returned when none of the other states apply. The value is 2. \
 * **InQuorumLoss**: Indicates that the partition is in quorum loss. This means that number of replicas that are up and participating in a replica set is less than MinReplicaSetSize for this partition. The value is 3. \
 * **Reconfiguring**: Indicates that the partition is undergoing reconfiguration of its replica sets. This can happen due to failover, upgrade, load balancing or addition or removal of replicas from the replica set. The value is 4. \
 * **Deleting**: Indicates that the partition is being deleted. The value is 5.
 */
export type ServicePartitionStatus = string;

/** Known values of {@link State} that the service accepts. */
export enum KnownState {
  /** Indicates that the repair task state is invalid. All Service Fabric enumerations have the invalid value. */
  Invalid = "Invalid",
  /** Indicates that the repair task has been created. */
  Created = "Created",
  /** Indicates that the repair task has been claimed by a repair executor. */
  Claimed = "Claimed",
  /** Indicates that the Repair Manager is preparing the system to handle the impact of the repair task, usually by taking resources offline gracefully. */
  Preparing = "Preparing",
  /** Indicates that the repair task has been approved by the Repair Manager and is safe to execute. */
  Approved = "Approved",
  /** Indicates that execution of the repair task is in progress. */
  Executing = "Executing",
  /** Indicates that the Repair Manager is restoring the system to its pre-repair state, usually by bringing resources back online. */
  Restoring = "Restoring",
  /** Indicates that the repair task has completed, and no further state changes will occur. */
  Completed = "Completed"
}

/**
 * Defines values for State. \
 * {@link KnownState} can be used interchangeably with State,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates that the repair task state is invalid. All Service Fabric enumerations have the invalid value. \
 * **Created**: Indicates that the repair task has been created. \
 * **Claimed**: Indicates that the repair task has been claimed by a repair executor. \
 * **Preparing**: Indicates that the Repair Manager is preparing the system to handle the impact of the repair task, usually by taking resources offline gracefully. \
 * **Approved**: Indicates that the repair task has been approved by the Repair Manager and is safe to execute. \
 * **Executing**: Indicates that execution of the repair task is in progress. \
 * **Restoring**: Indicates that the Repair Manager is restoring the system to its pre-repair state, usually by bringing resources back online. \
 * **Completed**: Indicates that the repair task has completed, and no further state changes will occur.
 */
export type State = string;

/** Known values of {@link RepairTargetKind} that the service accepts. */
export enum KnownRepairTargetKind {
  /** The repair target is not valid or is of an unknown type. */
  Invalid = "Invalid",
  /** The repair target is a set of Service Fabric nodes. */
  Node = "Node"
}

/**
 * Defines values for RepairTargetKind. \
 * {@link KnownRepairTargetKind} can be used interchangeably with RepairTargetKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: The repair target is not valid or is of an unknown type. \
 * **Node**: The repair target is a set of Service Fabric nodes.
 */
export type RepairTargetKind = string;

/** Known values of {@link RepairImpactKind} that the service accepts. */
export enum KnownRepairImpactKind {
  /** The repair impact is not valid or is of an unknown type. */
  Invalid = "Invalid",
  /** The repair impact affects a set of Service Fabric nodes. */
  Node = "Node"
}

/**
 * Defines values for RepairImpactKind. \
 * {@link KnownRepairImpactKind} can be used interchangeably with RepairImpactKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: The repair impact is not valid or is of an unknown type. \
 * **Node**: The repair impact affects a set of Service Fabric nodes.
 */
export type RepairImpactKind = string;

/** Known values of {@link ResultStatus} that the service accepts. */
export enum KnownResultStatus {
  /** Indicates that the repair task result is invalid. All Service Fabric enumerations have the invalid value. */
  Invalid = "Invalid",
  /** Indicates that the repair task completed execution successfully. */
  Succeeded = "Succeeded",
  /** Indicates that the repair task was cancelled prior to execution. */
  Cancelled = "Cancelled",
  /** Indicates that execution of the repair task was interrupted by a cancellation request after some work had already been performed. */
  Interrupted = "Interrupted",
  /** Indicates that there was a failure during execution of the repair task. Some work may have been performed. */
  Failed = "Failed",
  /** Indicates that the repair task result is not yet available, because the repair task has not finished executing. */
  Pending = "Pending"
}

/**
 * Defines values for ResultStatus. \
 * {@link KnownResultStatus} can be used interchangeably with ResultStatus,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates that the repair task result is invalid. All Service Fabric enumerations have the invalid value. \
 * **Succeeded**: Indicates that the repair task completed execution successfully. \
 * **Cancelled**: Indicates that the repair task was cancelled prior to execution. \
 * **Interrupted**: Indicates that execution of the repair task was interrupted by a cancellation request after some work had already been performed. \
 * **Failed**: Indicates that there was a failure during execution of the repair task. Some work may have been performed. \
 * **Pending**: Indicates that the repair task result is not yet available, because the repair task has not finished executing.
 */
export type ResultStatus = string;

/** Known values of {@link RepairTaskHealthCheckState} that the service accepts. */
export enum KnownRepairTaskHealthCheckState {
  /** Indicates that the health check has not started. */
  NotStarted = "NotStarted",
  /** Indicates that the health check is in progress. */
  InProgress = "InProgress",
  /** Indicates that the health check succeeded. */
  Succeeded = "Succeeded",
  /** Indicates that the health check was skipped. */
  Skipped = "Skipped",
  /** Indicates that the health check timed out. */
  TimedOut = "TimedOut"
}

/**
 * Defines values for RepairTaskHealthCheckState. \
 * {@link KnownRepairTaskHealthCheckState} can be used interchangeably with RepairTaskHealthCheckState,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **NotStarted**: Indicates that the health check has not started. \
 * **InProgress**: Indicates that the health check is in progress. \
 * **Succeeded**: Indicates that the health check succeeded. \
 * **Skipped**: Indicates that the health check was skipped. \
 * **TimedOut**: Indicates that the health check timed out.
 */
export type RepairTaskHealthCheckState = string;

/** Known values of {@link ReplicaStatus} that the service accepts. */
export enum KnownReplicaStatus {
  /** Indicates the replica status is invalid. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** The replica is being built. This means that a primary replica is seeding this replica. The value is 1. */
  InBuild = "InBuild",
  /** The replica is in standby. The value is 2. */
  Standby = "Standby",
  /** The replica is ready. The value is 3. */
  Ready = "Ready",
  /** The replica is down. The value is 4. */
  Down = "Down",
  /** Replica is dropped. This means that the replica has been removed from the replica set. If it is persisted, its state has been deleted. The value is 5. */
  Dropped = "Dropped"
}

/**
 * Defines values for ReplicaStatus. \
 * {@link KnownReplicaStatus} can be used interchangeably with ReplicaStatus,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the replica status is invalid. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **InBuild**: The replica is being built. This means that a primary replica is seeding this replica. The value is 1. \
 * **Standby**: The replica is in standby. The value is 2. \
 * **Ready**: The replica is ready. The value is 3. \
 * **Down**: The replica is down. The value is 4. \
 * **Dropped**: Replica is dropped. This means that the replica has been removed from the replica set. If it is persisted, its state has been deleted. The value is 5.
 */
export type ReplicaStatus = string;

/** Known values of {@link ReplicaHealthReportServiceKind} that the service accepts. */
export enum KnownReplicaHealthReportServiceKind {
  /** Does not use Service Fabric to make its state highly available or reliable. The value is 1 */
  Stateless = "Stateless",
  /** Uses Service Fabric to make its state or part of its state highly available and reliable. The value is 2. */
  Stateful = "Stateful"
}

/**
 * Defines values for ReplicaHealthReportServiceKind. \
 * {@link KnownReplicaHealthReportServiceKind} can be used interchangeably with ReplicaHealthReportServiceKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Stateless**: Does not use Service Fabric to make its state highly available or reliable. The value is 1 \
 * **Stateful**: Uses Service Fabric to make its state or part of its state highly available and reliable. The value is 2.
 */
export type ReplicaHealthReportServiceKind = string;

/** Known values of {@link ServiceOperationName} that the service accepts. */
export enum KnownServiceOperationName {
  /** Reserved for future use. */
  Unknown = "Unknown",
  /** The service replica or instance is not going through any life-cycle changes. */
  None = "None",
  /** The service replica or instance is being opened. */
  Open = "Open",
  /** The service replica is changing roles. */
  ChangeRole = "ChangeRole",
  /** The service replica or instance is being closed. */
  Close = "Close",
  /** The service replica or instance is being aborted. */
  Abort = "Abort"
}

/**
 * Defines values for ServiceOperationName. \
 * {@link KnownServiceOperationName} can be used interchangeably with ServiceOperationName,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Unknown**: Reserved for future use. \
 * **None**: The service replica or instance is not going through any life-cycle changes. \
 * **Open**: The service replica or instance is being opened. \
 * **ChangeRole**: The service replica is changing roles. \
 * **Close**: The service replica or instance is being closed. \
 * **Abort**: The service replica or instance is being aborted.
 */
export type ServiceOperationName = string;

/** Known values of {@link DeploymentStatus} that the service accepts. */
export enum KnownDeploymentStatus {
  /** Indicates status of the application or service package is not known or invalid. The value is 0. */
  Invalid = "Invalid",
  /** Indicates the application or service package is being downloaded to the node from the ImageStore. The value is 1. */
  Downloading = "Downloading",
  /** Indicates the application or service package is being activated. The value is 2. */
  Activating = "Activating",
  /** Indicates the application or service package is active the node. The value is 3. */
  Active = "Active",
  /** Indicates the application or service package is being upgraded. The value is 4. */
  Upgrading = "Upgrading",
  /** Indicates the application or service package is being deactivated. The value is 5. */
  Deactivating = "Deactivating",
  /** Indicates the application or service package has ran to completion successfully. The value is 6. */
  RanToCompletion = "RanToCompletion",
  /** Indicates the application or service package has failed to run to completion. The value is 7. */
  Failed = "Failed"
}

/**
 * Defines values for DeploymentStatus. \
 * {@link KnownDeploymentStatus} can be used interchangeably with DeploymentStatus,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates status of the application or service package is not known or invalid. The value is 0. \
 * **Downloading**: Indicates the application or service package is being downloaded to the node from the ImageStore. The value is 1. \
 * **Activating**: Indicates the application or service package is being activated. The value is 2. \
 * **Active**: Indicates the application or service package is active the node. The value is 3. \
 * **Upgrading**: Indicates the application or service package is being upgraded. The value is 4. \
 * **Deactivating**: Indicates the application or service package is being deactivated. The value is 5. \
 * **RanToCompletion**: Indicates the application or service package has ran to completion successfully. The value is 6. \
 * **Failed**: Indicates the application or service package has failed to run to completion. The value is 7.
 */
export type DeploymentStatus = string;

/** Known values of {@link PackageSharingPolicyScope} that the service accepts. */
export enum KnownPackageSharingPolicyScope {
  /** No package sharing policy scope. The value is 0. */
  None = "None",
  /** Share all code, config and data packages from corresponding service manifest. The value is 1. */
  All = "All",
  /** Share all code packages from corresponding service manifest. The value is 2. */
  Code = "Code",
  /** Share all config packages from corresponding service manifest. The value is 3. */
  Config = "Config",
  /** Share all data packages from corresponding service manifest. The value is 4. */
  Data = "Data"
}

/**
 * Defines values for PackageSharingPolicyScope. \
 * {@link KnownPackageSharingPolicyScope} can be used interchangeably with PackageSharingPolicyScope,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **None**: No package sharing policy scope. The value is 0. \
 * **All**: Share all code, config and data packages from corresponding service manifest. The value is 1. \
 * **Code**: Share all code packages from corresponding service manifest. The value is 2. \
 * **Config**: Share all config packages from corresponding service manifest. The value is 3. \
 * **Data**: Share all data packages from corresponding service manifest. The value is 4.
 */
export type PackageSharingPolicyScope = string;

/** Known values of {@link HostType} that the service accepts. */
export enum KnownHostType {
  /** Indicates the type of host is not known or invalid. The value is 0. */
  Invalid = "Invalid",
  /** Indicates the host is an executable. The value is 1. */
  ExeHost = "ExeHost",
  /** Indicates the host is a container. The value is 2. */
  ContainerHost = "ContainerHost"
}

/**
 * Defines values for HostType. \
 * {@link KnownHostType} can be used interchangeably with HostType,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the type of host is not known or invalid. The value is 0. \
 * **ExeHost**: Indicates the host is an executable. The value is 1. \
 * **ContainerHost**: Indicates the host is a container. The value is 2.
 */
export type HostType = string;

/** Known values of {@link HostIsolationMode} that the service accepts. */
export enum KnownHostIsolationMode {
  /** Indicates the isolation mode is not applicable for given HostType. The value is 0. */
  None = "None",
  /** This is the default isolation mode for a ContainerHost. The value is 1. */
  Process = "Process",
  /** Indicates the ContainerHost is a Hyper-V container. This applies to only Windows containers. The value is 2. */
  HyperV = "HyperV"
}

/**
 * Defines values for HostIsolationMode. \
 * {@link KnownHostIsolationMode} can be used interchangeably with HostIsolationMode,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **None**: Indicates the isolation mode is not applicable for given HostType. The value is 0. \
 * **Process**: This is the default isolation mode for a ContainerHost. The value is 1. \
 * **HyperV**: Indicates the ContainerHost is a Hyper-V container. This applies to only Windows containers. The value is 2.
 */
export type HostIsolationMode = string;

/** Known values of {@link EntryPointStatus} that the service accepts. */
export enum KnownEntryPointStatus {
  /** Indicates status of entry point is not known or invalid. The value is 0. */
  Invalid = "Invalid",
  /** Indicates the entry point is scheduled to be started. The value is 1. */
  Pending = "Pending",
  /** Indicates the entry point is being started. The value is 2. */
  Starting = "Starting",
  /** Indicates the entry point was started successfully and is running. The value is 3. */
  Started = "Started",
  /** Indicates the entry point is being stopped. The value is 4. */
  Stopping = "Stopping",
  /** Indicates the entry point is not running. The value is 5. */
  Stopped = "Stopped"
}

/**
 * Defines values for EntryPointStatus. \
 * {@link KnownEntryPointStatus} can be used interchangeably with EntryPointStatus,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates status of entry point is not known or invalid. The value is 0. \
 * **Pending**: Indicates the entry point is scheduled to be started. The value is 1. \
 * **Starting**: Indicates the entry point is being started. The value is 2. \
 * **Started**: Indicates the entry point was started successfully and is running. The value is 3. \
 * **Stopping**: Indicates the entry point is being stopped. The value is 4. \
 * **Stopped**: Indicates the entry point is not running. The value is 5.
 */
export type EntryPointStatus = string;

/** Known values of {@link ComposeDeploymentStatus} that the service accepts. */
export enum KnownComposeDeploymentStatus {
  /** Indicates that the compose deployment status is invalid. The value is zero. */
  Invalid = "Invalid",
  /** Indicates that the compose deployment is being provisioned in background. The value is 1. */
  Provisioning = "Provisioning",
  /** Indicates that the compose deployment is being created in background. The value is 2. */
  Creating = "Creating",
  /** Indicates that the compose deployment has been successfully created or upgraded. The value is 3. */
  Ready = "Ready",
  /** Indicates that the compose deployment is being unprovisioned in background. The value is 4. */
  Unprovisioning = "Unprovisioning",
  /** Indicates that the compose deployment is being deleted in background. The value is 5. */
  Deleting = "Deleting",
  /** Indicates that the compose deployment was terminated due to persistent failures. The value is 6. */
  Failed = "Failed",
  /** Indicates that the compose deployment is being upgraded in the background. The value is 7. */
  Upgrading = "Upgrading"
}

/**
 * Defines values for ComposeDeploymentStatus. \
 * {@link KnownComposeDeploymentStatus} can be used interchangeably with ComposeDeploymentStatus,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates that the compose deployment status is invalid. The value is zero. \
 * **Provisioning**: Indicates that the compose deployment is being provisioned in background. The value is 1. \
 * **Creating**: Indicates that the compose deployment is being created in background. The value is 2. \
 * **Ready**: Indicates that the compose deployment has been successfully created or upgraded. The value is 3. \
 * **Unprovisioning**: Indicates that the compose deployment is being unprovisioned in background. The value is 4. \
 * **Deleting**: Indicates that the compose deployment is being deleted in background. The value is 5. \
 * **Failed**: Indicates that the compose deployment was terminated due to persistent failures. The value is 6. \
 * **Upgrading**: Indicates that the compose deployment is being upgraded in the background. The value is 7.
 */
export type ComposeDeploymentStatus = string;

/** Known values of {@link ComposeDeploymentUpgradeState} that the service accepts. */
export enum KnownComposeDeploymentUpgradeState {
  /** Indicates the upgrade state is invalid. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** The upgrade is in the progress of provisioning target application type version. The value is 1. */
  ProvisioningTarget = "ProvisioningTarget",
  /** The upgrade is rolling forward to the target version but is not complete yet. The value is 2. */
  RollingForwardInProgress = "RollingForwardInProgress",
  /** The current upgrade domain has finished upgrading. The overall upgrade is waiting for an explicit move next request in UnmonitoredManual mode or performing health checks in Monitored mode. The value is 3 */
  RollingForwardPending = "RollingForwardPending",
  /** The upgrade is in the progress of unprovisioning current application type version and rolling forward to the target version is completed. The value is 4. */
  UnprovisioningCurrent = "UnprovisioningCurrent",
  /** The upgrade has finished rolling forward. The value is 5. */
  RollingForwardCompleted = "RollingForwardCompleted",
  /** The upgrade is rolling back to the previous version but is not complete yet. The value is 6. */
  RollingBackInProgress = "RollingBackInProgress",
  /** The upgrade is in the progress of unprovisioning target application type version and rolling back to the current version is completed. The value is 7. */
  UnprovisioningTarget = "UnprovisioningTarget",
  /** The upgrade has finished rolling back. The value is 8. */
  RollingBackCompleted = "RollingBackCompleted",
  /** The upgrade has failed and is unable to execute FailureAction. The value is 9. */
  Failed = "Failed"
}

/**
 * Defines values for ComposeDeploymentUpgradeState. \
 * {@link KnownComposeDeploymentUpgradeState} can be used interchangeably with ComposeDeploymentUpgradeState,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the upgrade state is invalid. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **ProvisioningTarget**: The upgrade is in the progress of provisioning target application type version. The value is 1. \
 * **RollingForwardInProgress**: The upgrade is rolling forward to the target version but is not complete yet. The value is 2. \
 * **RollingForwardPending**: The current upgrade domain has finished upgrading. The overall upgrade is waiting for an explicit move next request in UnmonitoredManual mode or performing health checks in Monitored mode. The value is 3 \
 * **UnprovisioningCurrent**: The upgrade is in the progress of unprovisioning current application type version and rolling forward to the target version is completed. The value is 4. \
 * **RollingForwardCompleted**: The upgrade has finished rolling forward. The value is 5. \
 * **RollingBackInProgress**: The upgrade is rolling back to the previous version but is not complete yet. The value is 6. \
 * **UnprovisioningTarget**: The upgrade is in the progress of unprovisioning target application type version and rolling back to the current version is completed. The value is 7. \
 * **RollingBackCompleted**: The upgrade has finished rolling back. The value is 8. \
 * **Failed**: The upgrade has failed and is unable to execute FailureAction. The value is 9.
 */
export type ComposeDeploymentUpgradeState = string;

/** Known values of {@link ChaosStatus} that the service accepts. */
export enum KnownChaosStatus {
  /** Indicates an invalid Chaos status. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** Indicates that Chaos is not stopped. The value is one. */
  Running = "Running",
  /** Indicates that Chaos is not scheduling further faults. The value is two. */
  Stopped = "Stopped"
}

/**
 * Defines values for ChaosStatus. \
 * {@link KnownChaosStatus} can be used interchangeably with ChaosStatus,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates an invalid Chaos status. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **Running**: Indicates that Chaos is not stopped. The value is one. \
 * **Stopped**: Indicates that Chaos is not scheduling further faults. The value is two.
 */
export type ChaosStatus = string;

/** Known values of {@link ChaosScheduleStatus} that the service accepts. */
export enum KnownChaosScheduleStatus {
  /** Indicates an invalid Chaos Schedule status. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** Indicates that the schedule is stopped and not being used to schedule runs of chaos. The value is one. */
  Stopped = "Stopped",
  /** Indicates that the schedule is active and is being used to schedule runs of Chaos. The value is two. */
  Active = "Active",
  /** Indicates that the schedule is expired and will no longer be used to schedule runs of Chaos. The value is three. */
  Expired = "Expired",
  /** Indicates that the schedule is pending and is not yet being used to schedule runs of Chaos but will be used when the start time is passed. The value is four. */
  Pending = "Pending"
}

/**
 * Defines values for ChaosScheduleStatus. \
 * {@link KnownChaosScheduleStatus} can be used interchangeably with ChaosScheduleStatus,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates an invalid Chaos Schedule status. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **Stopped**: Indicates that the schedule is stopped and not being used to schedule runs of chaos. The value is one. \
 * **Active**: Indicates that the schedule is active and is being used to schedule runs of Chaos. The value is two. \
 * **Expired**: Indicates that the schedule is expired and will no longer be used to schedule runs of Chaos. The value is three. \
 * **Pending**: Indicates that the schedule is pending and is not yet being used to schedule runs of Chaos but will be used when the start time is passed. The value is four.
 */
export type ChaosScheduleStatus = string;

/** Known values of {@link ChaosEventKind} that the service accepts. */
export enum KnownChaosEventKind {
  /** Indicates an invalid Chaos event kind. All Service Fabric enumerations have the invalid type. */
  Invalid = "Invalid",
  /** Indicates a Chaos event that gets generated when Chaos is started. */
  Started = "Started",
  /** Indicates a Chaos event that gets generated when Chaos has decided on the faults for an iteration. This Chaos event contains the details of the faults as a list of strings. */
  ExecutingFaults = "ExecutingFaults",
  /** Indicates a Chaos event that gets generated when Chaos is waiting for the cluster to become ready for faulting, for example, Chaos may be waiting for the on-going upgrade to finish. */
  Waiting = "Waiting",
  /** Indicates a Chaos event that gets generated when the cluster entities do not become stable and healthy within ChaosParameters.MaxClusterStabilizationTimeoutInSeconds. */
  ValidationFailed = "ValidationFailed",
  /** Indicates a Chaos event that gets generated when an unexpected event has occurred in the Chaos engine, for example, due to the cluster snapshot being inconsistent, while faulting a faultable entity Chaos found that the entity was already faulted. */
  TestError = "TestError",
  /** Indicates a Chaos event that gets generated when Chaos stops because either the user issued a stop or the time to run was up. */
  Stopped = "Stopped"
}

/**
 * Defines values for ChaosEventKind. \
 * {@link KnownChaosEventKind} can be used interchangeably with ChaosEventKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates an invalid Chaos event kind. All Service Fabric enumerations have the invalid type. \
 * **Started**: Indicates a Chaos event that gets generated when Chaos is started. \
 * **ExecutingFaults**: Indicates a Chaos event that gets generated when Chaos has decided on the faults for an iteration. This Chaos event contains the details of the faults as a list of strings. \
 * **Waiting**: Indicates a Chaos event that gets generated when Chaos is waiting for the cluster to become ready for faulting, for example, Chaos may be waiting for the on-going upgrade to finish. \
 * **ValidationFailed**: Indicates a Chaos event that gets generated when the cluster entities do not become stable and healthy within ChaosParameters.MaxClusterStabilizationTimeoutInSeconds. \
 * **TestError**: Indicates a Chaos event that gets generated when an unexpected event has occurred in the Chaos engine, for example, due to the cluster snapshot being inconsistent, while faulting a faultable entity Chaos found that the entity was already faulted. \
 * **Stopped**: Indicates a Chaos event that gets generated when Chaos stops because either the user issued a stop or the time to run was up.
 */
export type ChaosEventKind = string;

/** Known values of {@link DataLossMode} that the service accepts. */
export enum KnownDataLossMode {
  /** Reserved.  Do not pass into API. */
  Invalid = "Invalid",
  /** PartialDataLoss option will cause a quorum of replicas to go down, triggering an OnDataLoss event in the system for the given partition. */
  PartialDataLoss = "PartialDataLoss",
  /** FullDataLoss option will drop all the replicas which means that all the data will be lost. */
  FullDataLoss = "FullDataLoss"
}

/**
 * Defines values for DataLossMode. \
 * {@link KnownDataLossMode} can be used interchangeably with DataLossMode,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Reserved.  Do not pass into API. \
 * **PartialDataLoss**: PartialDataLoss option will cause a quorum of replicas to go down, triggering an OnDataLoss event in the system for the given partition. \
 * **FullDataLoss**: FullDataLoss option will drop all the replicas which means that all the data will be lost.
 */
export type DataLossMode = string;

/** Known values of {@link OperationState} that the service accepts. */
export enum KnownOperationState {
  /** The operation state is invalid. */
  Invalid = "Invalid",
  /** The operation is in progress. */
  Running = "Running",
  /** The operation is rolling back internal system state because it encountered a fatal error or was cancelled by the user.  "RollingBack"     does not refer to user state.  For example, if CancelOperation is called on a command of type PartitionDataLoss, state of "RollingBack" does not mean service data is being restored (assuming the command has progressed far enough to cause data loss). It means the system is rolling back\/cleaning up internal system state associated with the command. */
  RollingBack = "RollingBack",
  /** The operation has completed successfully and is no longer running. */
  Completed = "Completed",
  /** The operation has failed and is no longer running. */
  Faulted = "Faulted",
  /** The operation was cancelled by the user using CancelOperation, and is no longer running. */
  Cancelled = "Cancelled",
  /** The operation was cancelled by the user using CancelOperation, with the force parameter set to true.  It is no longer running.  Refer to CancelOperation for more details. */
  ForceCancelled = "ForceCancelled"
}

/**
 * Defines values for OperationState. \
 * {@link KnownOperationState} can be used interchangeably with OperationState,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: The operation state is invalid. \
 * **Running**: The operation is in progress. \
 * **RollingBack**: The operation is rolling back internal system state because it encountered a fatal error or was cancelled by the user.  "RollingBack"     does not refer to user state.  For example, if CancelOperation is called on a command of type PartitionDataLoss, state of "RollingBack" does not mean service data is being restored (assuming the command has progressed far enough to cause data loss). It means the system is rolling back\/cleaning up internal system state associated with the command. \
 * **Completed**: The operation has completed successfully and is no longer running. \
 * **Faulted**: The operation has failed and is no longer running. \
 * **Cancelled**: The operation was cancelled by the user using CancelOperation, and is no longer running. \
 * **ForceCancelled**: The operation was cancelled by the user using CancelOperation, with the force parameter set to true.  It is no longer running.  Refer to CancelOperation for more details.
 */
export type OperationState = string;

/** Known values of {@link QuorumLossMode} that the service accepts. */
export enum KnownQuorumLossMode {
  /** Reserved.  Do not pass into API. */
  Invalid = "Invalid",
  /** Partial Quorum loss mode : Minimum number of replicas for a partition will be down that will cause a quorum loss. */
  QuorumReplicas = "QuorumReplicas",
  /** AllReplicas */
  AllReplicas = "AllReplicas"
}

/**
 * Defines values for QuorumLossMode. \
 * {@link KnownQuorumLossMode} can be used interchangeably with QuorumLossMode,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Reserved.  Do not pass into API. \
 * **QuorumReplicas**: Partial Quorum loss mode : Minimum number of replicas for a partition will be down that will cause a quorum loss. \
 * **AllReplicas**
 */
export type QuorumLossMode = string;

/** Known values of {@link RestartPartitionMode} that the service accepts. */
export enum KnownRestartPartitionMode {
  /** Reserved.  Do not pass into API. */
  Invalid = "Invalid",
  /** All replicas or instances in the partition are restarted at once. */
  AllReplicasOrInstances = "AllReplicasOrInstances",
  /** Only the secondary replicas are restarted. */
  OnlyActiveSecondaries = "OnlyActiveSecondaries"
}

/**
 * Defines values for RestartPartitionMode. \
 * {@link KnownRestartPartitionMode} can be used interchangeably with RestartPartitionMode,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Reserved.  Do not pass into API. \
 * **AllReplicasOrInstances**: All replicas or instances in the partition are restarted at once. \
 * **OnlyActiveSecondaries**: Only the secondary replicas are restarted.
 */
export type RestartPartitionMode = string;

/** Known values of {@link NodeTransitionType} that the service accepts. */
export enum KnownNodeTransitionType {
  /** Reserved.  Do not pass into API. */
  Invalid = "Invalid",
  /** Transition a stopped node to up. */
  Start = "Start",
  /** Transition an up node to stopped. */
  Stop = "Stop"
}

/**
 * Defines values for NodeTransitionType. \
 * {@link KnownNodeTransitionType} can be used interchangeably with NodeTransitionType,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Reserved.  Do not pass into API. \
 * **Start**: Transition a stopped node to up. \
 * **Stop**: Transition an up node to stopped.
 */
export type NodeTransitionType = string;

/** Known values of {@link OperationType} that the service accepts. */
export enum KnownOperationType {
  /** The operation state is invalid. */
  Invalid = "Invalid",
  /** An operation started using the StartDataLoss API. */
  PartitionDataLoss = "PartitionDataLoss",
  /** An operation started using the StartQuorumLoss API. */
  PartitionQuorumLoss = "PartitionQuorumLoss",
  /** An operation started using the StartPartitionRestart API. */
  PartitionRestart = "PartitionRestart",
  /** An operation started using the StartNodeTransition API. */
  NodeTransition = "NodeTransition"
}

/**
 * Defines values for OperationType. \
 * {@link KnownOperationType} can be used interchangeably with OperationType,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: The operation state is invalid. \
 * **PartitionDataLoss**: An operation started using the StartDataLoss API. \
 * **PartitionQuorumLoss**: An operation started using the StartQuorumLoss API. \
 * **PartitionRestart**: An operation started using the StartPartitionRestart API. \
 * **NodeTransition**: An operation started using the StartNodeTransition API.
 */
export type OperationType = string;

/** Known values of {@link BackupScheduleKind} that the service accepts. */
export enum KnownBackupScheduleKind {
  /** Indicates an invalid backup schedule kind. All Service Fabric enumerations have the invalid type. */
  Invalid = "Invalid",
  /** Indicates a time-based backup schedule. */
  TimeBased = "TimeBased",
  /** Indicates a frequency-based backup schedule. */
  FrequencyBased = "FrequencyBased"
}

/**
 * Defines values for BackupScheduleKind. \
 * {@link KnownBackupScheduleKind} can be used interchangeably with BackupScheduleKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates an invalid backup schedule kind. All Service Fabric enumerations have the invalid type. \
 * **TimeBased**: Indicates a time-based backup schedule. \
 * **FrequencyBased**: Indicates a frequency-based backup schedule.
 */
export type BackupScheduleKind = string;

/** Known values of {@link BackupStorageKind} that the service accepts. */
export enum KnownBackupStorageKind {
  /** Indicates an invalid backup storage kind. All Service Fabric enumerations have the invalid type. */
  Invalid = "Invalid",
  /** Indicates file\/ SMB share to be used as backup storage. */
  FileShare = "FileShare",
  /** Indicates Azure blob store to be used as backup storage. */
  AzureBlobStore = "AzureBlobStore",
  /** Indicates Dsms Azure blob store to be used as backup storage. */
  DsmsAzureBlobStore = "DsmsAzureBlobStore",
  /** Indicates Azure blob store to be used as backup storage using managed identity. */
  ManagedIdentityAzureBlobStore = "ManagedIdentityAzureBlobStore"
}

/**
 * Defines values for BackupStorageKind. \
 * {@link KnownBackupStorageKind} can be used interchangeably with BackupStorageKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates an invalid backup storage kind. All Service Fabric enumerations have the invalid type. \
 * **FileShare**: Indicates file\/ SMB share to be used as backup storage. \
 * **AzureBlobStore**: Indicates Azure blob store to be used as backup storage. \
 * **DsmsAzureBlobStore**: Indicates Dsms Azure blob store to be used as backup storage. \
 * **ManagedIdentityAzureBlobStore**: Indicates Azure blob store to be used as backup storage using managed identity.
 */
export type BackupStorageKind = string;

/** Known values of {@link RetentionPolicyType} that the service accepts. */
export enum KnownRetentionPolicyType {
  /** Indicates a basic retention policy type. */
  Basic = "Basic",
  /** Indicates an invalid retention policy type. */
  Invalid = "Invalid"
}

/**
 * Defines values for RetentionPolicyType. \
 * {@link KnownRetentionPolicyType} can be used interchangeably with RetentionPolicyType,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Basic**: Indicates a basic retention policy type. \
 * **Invalid**: Indicates an invalid retention policy type.
 */
export type RetentionPolicyType = string;

/** Known values of {@link BackupEntityKind} that the service accepts. */
export enum KnownBackupEntityKind {
  /** Indicates an invalid entity kind. All Service Fabric enumerations have the invalid type. */
  Invalid = "Invalid",
  /** Indicates the entity is a Service Fabric partition. */
  Partition = "Partition",
  /** Indicates the entity is a Service Fabric service. */
  Service = "Service",
  /** Indicates the entity is a Service Fabric application. */
  Application = "Application"
}

/**
 * Defines values for BackupEntityKind. \
 * {@link KnownBackupEntityKind} can be used interchangeably with BackupEntityKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates an invalid entity kind. All Service Fabric enumerations have the invalid type. \
 * **Partition**: Indicates the entity is a Service Fabric partition. \
 * **Service**: Indicates the entity is a Service Fabric service. \
 * **Application**: Indicates the entity is a Service Fabric application.
 */
export type BackupEntityKind = string;

/** Known values of {@link BackupPolicyScope} that the service accepts. */
export enum KnownBackupPolicyScope {
  /** Indicates an invalid backup policy scope type. All Service Fabric enumerations have the invalid type. */
  Invalid = "Invalid",
  /** Indicates the backup policy is applied at partition level. Hence overriding any policy which may have applied at partition's service or application level. */
  Partition = "Partition",
  /** Indicates the backup policy is applied at service level. All partitions of the service inherit this policy unless explicitly overridden at partition level. */
  Service = "Service",
  /** Indicates the backup policy is applied at application level. All services and partitions of the application inherit this policy unless explicitly overridden at service or partition level. */
  Application = "Application"
}

/**
 * Defines values for BackupPolicyScope. \
 * {@link KnownBackupPolicyScope} can be used interchangeably with BackupPolicyScope,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates an invalid backup policy scope type. All Service Fabric enumerations have the invalid type. \
 * **Partition**: Indicates the backup policy is applied at partition level. Hence overriding any policy which may have applied at partition's service or application level. \
 * **Service**: Indicates the backup policy is applied at service level. All partitions of the service inherit this policy unless explicitly overridden at partition level. \
 * **Application**: Indicates the backup policy is applied at application level. All services and partitions of the application inherit this policy unless explicitly overridden at service or partition level.
 */
export type BackupPolicyScope = string;

/** Known values of {@link BackupSuspensionScope} that the service accepts. */
export enum KnownBackupSuspensionScope {
  /** Indicates an invalid backup suspension scope type also indicating entity is not suspended. All Service Fabric enumerations have the invalid type. */
  Invalid = "Invalid",
  /** Indicates the backup suspension is applied at partition level. */
  Partition = "Partition",
  /** Indicates the backup suspension is applied at service level. All partitions of the service are hence suspended for backup. */
  Service = "Service",
  /** Indicates the backup suspension is applied at application level. All services and partitions of the application are hence suspended for backup. */
  Application = "Application"
}

/**
 * Defines values for BackupSuspensionScope. \
 * {@link KnownBackupSuspensionScope} can be used interchangeably with BackupSuspensionScope,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates an invalid backup suspension scope type also indicating entity is not suspended. All Service Fabric enumerations have the invalid type. \
 * **Partition**: Indicates the backup suspension is applied at partition level. \
 * **Service**: Indicates the backup suspension is applied at service level. All partitions of the service are hence suspended for backup. \
 * **Application**: Indicates the backup suspension is applied at application level. All services and partitions of the application are hence suspended for backup.
 */
export type BackupSuspensionScope = string;

/** Known values of {@link BackupType} that the service accepts. */
export enum KnownBackupType {
  /** Indicates an invalid backup type. All Service Fabric enumerations have the invalid type. */
  Invalid = "Invalid",
  /** Indicates a full backup. */
  Full = "Full",
  /** Indicates an incremental backup. A backup chain is comprised of a full backup followed by 0 or more incremental backups. */
  Incremental = "Incremental"
}

/**
 * Defines values for BackupType. \
 * {@link KnownBackupType} can be used interchangeably with BackupType,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates an invalid backup type. All Service Fabric enumerations have the invalid type. \
 * **Full**: Indicates a full backup. \
 * **Incremental**: Indicates an incremental backup. A backup chain is comprised of a full backup followed by 0 or more incremental backups.
 */
export type BackupType = string;

/** Known values of {@link BackupState} that the service accepts. */
export enum KnownBackupState {
  /** Indicates an invalid backup state. All Service Fabric enumerations have the invalid type. */
  Invalid = "Invalid",
  /** Operation has been validated and accepted. Backup is yet to be triggered. */
  Accepted = "Accepted",
  /** Backup operation has been triggered and is under process. */
  BackupInProgress = "BackupInProgress",
  /** Operation completed with success. */
  Success = "Success",
  /** Operation completed with failure. */
  Failure = "Failure",
  /** Operation timed out. */
  Timeout = "Timeout"
}

/**
 * Defines values for BackupState. \
 * {@link KnownBackupState} can be used interchangeably with BackupState,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates an invalid backup state. All Service Fabric enumerations have the invalid type. \
 * **Accepted**: Operation has been validated and accepted. Backup is yet to be triggered. \
 * **BackupInProgress**: Backup operation has been triggered and is under process. \
 * **Success**: Operation completed with success. \
 * **Failure**: Operation completed with failure. \
 * **Timeout**: Operation timed out.
 */
export type BackupState = string;

/** Known values of {@link RestoreState} that the service accepts. */
export enum KnownRestoreState {
  /** Indicates an invalid restore state. All Service Fabric enumerations have the invalid type. */
  Invalid = "Invalid",
  /** Operation has been validated and accepted. Restore is yet to be triggered. */
  Accepted = "Accepted",
  /** Restore operation has been triggered and is under process. */
  RestoreInProgress = "RestoreInProgress",
  /** Operation completed with success. */
  Success = "Success",
  /** Operation completed with failure. */
  Failure = "Failure",
  /** Operation timed out. */
  Timeout = "Timeout"
}

/**
 * Defines values for RestoreState. \
 * {@link KnownRestoreState} can be used interchangeably with RestoreState,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates an invalid restore state. All Service Fabric enumerations have the invalid type. \
 * **Accepted**: Operation has been validated and accepted. Restore is yet to be triggered. \
 * **RestoreInProgress**: Restore operation has been triggered and is under process. \
 * **Success**: Operation completed with success. \
 * **Failure**: Operation completed with failure. \
 * **Timeout**: Operation timed out.
 */
export type RestoreState = string;

/** Known values of {@link PropertyValueKind} that the service accepts. */
export enum KnownPropertyValueKind {
  /** Indicates the property is invalid. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** The data inside the property is a binary blob. The value is 1. */
  Binary = "Binary",
  /** The data inside the property is an int64. The value is 2. */
  Int64 = "Int64",
  /** The data inside the property is a double. The value is 3. */
  Double = "Double",
  /** The data inside the property is a string. The value is 4. */
  String = "String",
  /** The data inside the property is a guid. The value is 5. */
  Guid = "Guid"
}

/**
 * Defines values for PropertyValueKind. \
 * {@link KnownPropertyValueKind} can be used interchangeably with PropertyValueKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the property is invalid. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **Binary**: The data inside the property is a binary blob. The value is 1. \
 * **Int64**: The data inside the property is an int64. The value is 2. \
 * **Double**: The data inside the property is a double. The value is 3. \
 * **String**: The data inside the property is a string. The value is 4. \
 * **Guid**: The data inside the property is a guid. The value is 5.
 */
export type PropertyValueKind = string;

/** Known values of {@link PropertyBatchOperationKind} that the service accepts. */
export enum KnownPropertyBatchOperationKind {
  /** Indicates the property operation is invalid. All Service Fabric enumerations have the invalid type. The value is zero. */
  Invalid = "Invalid",
  /** The operation will create or edit a property. The value is 1. */
  Put = "Put",
  /** The operation will get a property. The value is 2. */
  Get = "Get",
  /** The operation will check that a property exists or doesn't exists, depending on the provided value. The value is 3. */
  CheckExists = "CheckExists",
  /** The operation will ensure that the sequence number is equal to the provided value. The value is 4. */
  CheckSequence = "CheckSequence",
  /** The operation will delete a property. The value is 5. */
  Delete = "Delete",
  /** The operation will ensure that the value of a property is equal to the provided value. The value is 7. */
  CheckValue = "CheckValue"
}

/**
 * Defines values for PropertyBatchOperationKind. \
 * {@link KnownPropertyBatchOperationKind} can be used interchangeably with PropertyBatchOperationKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the property operation is invalid. All Service Fabric enumerations have the invalid type. The value is zero. \
 * **Put**: The operation will create or edit a property. The value is 1. \
 * **Get**: The operation will get a property. The value is 2. \
 * **CheckExists**: The operation will check that a property exists or doesn't exists, depending on the provided value. The value is 3. \
 * **CheckSequence**: The operation will ensure that the sequence number is equal to the provided value. The value is 4. \
 * **Delete**: The operation will delete a property. The value is 5. \
 * **CheckValue**: The operation will ensure that the value of a property is equal to the provided value. The value is 7.
 */
export type PropertyBatchOperationKind = string;

/** Known values of {@link PropertyBatchInfoKind} that the service accepts. */
export enum KnownPropertyBatchInfoKind {
  /** Indicates the property batch info is invalid. All Service Fabric enumerations have the invalid type. */
  Invalid = "Invalid",
  /** The property batch succeeded. */
  Successful = "Successful",
  /** The property batch failed. */
  Failed = "Failed"
}

/**
 * Defines values for PropertyBatchInfoKind. \
 * {@link KnownPropertyBatchInfoKind} can be used interchangeably with PropertyBatchInfoKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the property batch info is invalid. All Service Fabric enumerations have the invalid type. \
 * **Successful**: The property batch succeeded. \
 * **Failed**: The property batch failed.
 */
export type PropertyBatchInfoKind = string;

/** Known values of {@link FabricEventKind} that the service accepts. */
export enum KnownFabricEventKind {
  /** ClusterEvent */
  ClusterEvent = "ClusterEvent",
  /** ContainerInstanceEvent */
  ContainerInstanceEvent = "ContainerInstanceEvent",
  /** NodeEvent */
  NodeEvent = "NodeEvent",
  /** ApplicationEvent */
  ApplicationEvent = "ApplicationEvent",
  /** ServiceEvent */
  ServiceEvent = "ServiceEvent",
  /** PartitionEvent */
  PartitionEvent = "PartitionEvent",
  /** ReplicaEvent */
  ReplicaEvent = "ReplicaEvent",
  /** PartitionAnalysisEvent */
  PartitionAnalysisEvent = "PartitionAnalysisEvent",
  /** ApplicationCreated */
  ApplicationCreated = "ApplicationCreated",
  /** ApplicationDeleted */
  ApplicationDeleted = "ApplicationDeleted",
  /** ApplicationNewHealthReport */
  ApplicationNewHealthReport = "ApplicationNewHealthReport",
  /** ApplicationHealthReportExpired */
  ApplicationHealthReportExpired = "ApplicationHealthReportExpired",
  /** ApplicationUpgradeCompleted */
  ApplicationUpgradeCompleted = "ApplicationUpgradeCompleted",
  /** ApplicationUpgradeDomainCompleted */
  ApplicationUpgradeDomainCompleted = "ApplicationUpgradeDomainCompleted",
  /** ApplicationUpgradeRollbackCompleted */
  ApplicationUpgradeRollbackCompleted = "ApplicationUpgradeRollbackCompleted",
  /** ApplicationUpgradeRollbackStarted */
  ApplicationUpgradeRollbackStarted = "ApplicationUpgradeRollbackStarted",
  /** ApplicationUpgradeStarted */
  ApplicationUpgradeStarted = "ApplicationUpgradeStarted",
  /** DeployedApplicationNewHealthReport */
  DeployedApplicationNewHealthReport = "DeployedApplicationNewHealthReport",
  /** DeployedApplicationHealthReportExpired */
  DeployedApplicationHealthReportExpired = "DeployedApplicationHealthReportExpired",
  /** ApplicationProcessExited */
  ApplicationProcessExited = "ApplicationProcessExited",
  /** ApplicationContainerInstanceExited */
  ApplicationContainerInstanceExited = "ApplicationContainerInstanceExited",
  /** NodeAborted */
  NodeAborted = "NodeAborted",
  /** NodeAddedToCluster */
  NodeAddedToCluster = "NodeAddedToCluster",
  /** NodeClosed */
  NodeClosed = "NodeClosed",
  /** NodeDeactivateCompleted */
  NodeDeactivateCompleted = "NodeDeactivateCompleted",
  /** NodeDeactivateStarted */
  NodeDeactivateStarted = "NodeDeactivateStarted",
  /** NodeDown */
  NodeDown = "NodeDown",
  /** NodeNewHealthReport */
  NodeNewHealthReport = "NodeNewHealthReport",
  /** NodeHealthReportExpired */
  NodeHealthReportExpired = "NodeHealthReportExpired",
  /** NodeOpenSucceeded */
  NodeOpenSucceeded = "NodeOpenSucceeded",
  /** NodeOpenFailed */
  NodeOpenFailed = "NodeOpenFailed",
  /** NodeRemovedFromCluster */
  NodeRemovedFromCluster = "NodeRemovedFromCluster",
  /** NodeUp */
  NodeUp = "NodeUp",
  /** PartitionNewHealthReport */
  PartitionNewHealthReport = "PartitionNewHealthReport",
  /** PartitionHealthReportExpired */
  PartitionHealthReportExpired = "PartitionHealthReportExpired",
  /** PartitionReconfigured */
  PartitionReconfigured = "PartitionReconfigured",
  /** PartitionPrimaryMoveAnalysis */
  PartitionPrimaryMoveAnalysis = "PartitionPrimaryMoveAnalysis",
  /** ServiceCreated */
  ServiceCreated = "ServiceCreated",
  /** ServiceDeleted */
  ServiceDeleted = "ServiceDeleted",
  /** ServiceNewHealthReport */
  ServiceNewHealthReport = "ServiceNewHealthReport",
  /** ServiceHealthReportExpired */
  ServiceHealthReportExpired = "ServiceHealthReportExpired",
  /** DeployedServicePackageNewHealthReport */
  DeployedServicePackageNewHealthReport = "DeployedServicePackageNewHealthReport",
  /** DeployedServicePackageHealthReportExpired */
  DeployedServicePackageHealthReportExpired = "DeployedServicePackageHealthReportExpired",
  /** StatefulReplicaNewHealthReport */
  StatefulReplicaNewHealthReport = "StatefulReplicaNewHealthReport",
  /** StatefulReplicaHealthReportExpired */
  StatefulReplicaHealthReportExpired = "StatefulReplicaHealthReportExpired",
  /** StatelessReplicaNewHealthReport */
  StatelessReplicaNewHealthReport = "StatelessReplicaNewHealthReport",
  /** StatelessReplicaHealthReportExpired */
  StatelessReplicaHealthReportExpired = "StatelessReplicaHealthReportExpired",
  /** ClusterNewHealthReport */
  ClusterNewHealthReport = "ClusterNewHealthReport",
  /** ClusterHealthReportExpired */
  ClusterHealthReportExpired = "ClusterHealthReportExpired",
  /** ClusterUpgradeCompleted */
  ClusterUpgradeCompleted = "ClusterUpgradeCompleted",
  /** ClusterUpgradeDomainCompleted */
  ClusterUpgradeDomainCompleted = "ClusterUpgradeDomainCompleted",
  /** ClusterUpgradeRollbackCompleted */
  ClusterUpgradeRollbackCompleted = "ClusterUpgradeRollbackCompleted",
  /** ClusterUpgradeRollbackStarted */
  ClusterUpgradeRollbackStarted = "ClusterUpgradeRollbackStarted",
  /** ClusterUpgradeStarted */
  ClusterUpgradeStarted = "ClusterUpgradeStarted",
  /** ChaosStopped */
  ChaosStopped = "ChaosStopped",
  /** ChaosStarted */
  ChaosStarted = "ChaosStarted",
  /** ChaosCodePackageRestartScheduled */
  ChaosCodePackageRestartScheduled = "ChaosCodePackageRestartScheduled",
  /** ChaosReplicaRemovalScheduled */
  ChaosReplicaRemovalScheduled = "ChaosReplicaRemovalScheduled",
  /** ChaosPartitionSecondaryMoveScheduled */
  ChaosPartitionSecondaryMoveScheduled = "ChaosPartitionSecondaryMoveScheduled",
  /** ChaosPartitionPrimaryMoveScheduled */
  ChaosPartitionPrimaryMoveScheduled = "ChaosPartitionPrimaryMoveScheduled",
  /** ChaosReplicaRestartScheduled */
  ChaosReplicaRestartScheduled = "ChaosReplicaRestartScheduled",
  /** ChaosNodeRestartScheduled */
  ChaosNodeRestartScheduled = "ChaosNodeRestartScheduled"
}

/**
 * Defines values for FabricEventKind. \
 * {@link KnownFabricEventKind} can be used interchangeably with FabricEventKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **ClusterEvent** \
 * **ContainerInstanceEvent** \
 * **NodeEvent** \
 * **ApplicationEvent** \
 * **ServiceEvent** \
 * **PartitionEvent** \
 * **ReplicaEvent** \
 * **PartitionAnalysisEvent** \
 * **ApplicationCreated** \
 * **ApplicationDeleted** \
 * **ApplicationNewHealthReport** \
 * **ApplicationHealthReportExpired** \
 * **ApplicationUpgradeCompleted** \
 * **ApplicationUpgradeDomainCompleted** \
 * **ApplicationUpgradeRollbackCompleted** \
 * **ApplicationUpgradeRollbackStarted** \
 * **ApplicationUpgradeStarted** \
 * **DeployedApplicationNewHealthReport** \
 * **DeployedApplicationHealthReportExpired** \
 * **ApplicationProcessExited** \
 * **ApplicationContainerInstanceExited** \
 * **NodeAborted** \
 * **NodeAddedToCluster** \
 * **NodeClosed** \
 * **NodeDeactivateCompleted** \
 * **NodeDeactivateStarted** \
 * **NodeDown** \
 * **NodeNewHealthReport** \
 * **NodeHealthReportExpired** \
 * **NodeOpenSucceeded** \
 * **NodeOpenFailed** \
 * **NodeRemovedFromCluster** \
 * **NodeUp** \
 * **PartitionNewHealthReport** \
 * **PartitionHealthReportExpired** \
 * **PartitionReconfigured** \
 * **PartitionPrimaryMoveAnalysis** \
 * **ServiceCreated** \
 * **ServiceDeleted** \
 * **ServiceNewHealthReport** \
 * **ServiceHealthReportExpired** \
 * **DeployedServicePackageNewHealthReport** \
 * **DeployedServicePackageHealthReportExpired** \
 * **StatefulReplicaNewHealthReport** \
 * **StatefulReplicaHealthReportExpired** \
 * **StatelessReplicaNewHealthReport** \
 * **StatelessReplicaHealthReportExpired** \
 * **ClusterNewHealthReport** \
 * **ClusterHealthReportExpired** \
 * **ClusterUpgradeCompleted** \
 * **ClusterUpgradeDomainCompleted** \
 * **ClusterUpgradeRollbackCompleted** \
 * **ClusterUpgradeRollbackStarted** \
 * **ClusterUpgradeStarted** \
 * **ChaosStopped** \
 * **ChaosStarted** \
 * **ChaosCodePackageRestartScheduled** \
 * **ChaosReplicaRemovalScheduled** \
 * **ChaosPartitionSecondaryMoveScheduled** \
 * **ChaosPartitionPrimaryMoveScheduled** \
 * **ChaosReplicaRestartScheduled** \
 * **ChaosNodeRestartScheduled**
 */
export type FabricEventKind = string;

/** Known values of {@link ResourceStatus} that the service accepts. */
export enum KnownResourceStatus {
  /** Indicates the resource status is unknown. The value is zero. */
  Unknown = "Unknown",
  /** Indicates the resource is ready. The value is 1. */
  Ready = "Ready",
  /** Indicates the resource is upgrading. The value is 2. */
  Upgrading = "Upgrading",
  /** Indicates the resource is being created. The value is 3. */
  Creating = "Creating",
  /** Indicates the resource is being deleted. The value is 4. */
  Deleting = "Deleting",
  /** Indicates the resource is not functional due to persistent failures. See statusDetails property for more details. The value is 5. */
  Failed = "Failed"
}

/**
 * Defines values for ResourceStatus. \
 * {@link KnownResourceStatus} can be used interchangeably with ResourceStatus,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Unknown**: Indicates the resource status is unknown. The value is zero. \
 * **Ready**: Indicates the resource is ready. The value is 1. \
 * **Upgrading**: Indicates the resource is upgrading. The value is 2. \
 * **Creating**: Indicates the resource is being created. The value is 3. \
 * **Deleting**: Indicates the resource is being deleted. The value is 4. \
 * **Failed**: Indicates the resource is not functional due to persistent failures. See statusDetails property for more details. The value is 5.
 */
export type ResourceStatus = string;

/** Known values of {@link SecretKind} that the service accepts. */
export enum KnownSecretKind {
  /** A simple secret resource whose plaintext value is provided by the user. */
  InlinedValue = "inlinedValue",
  /** A secret resource that references a specific version of a secret stored in Azure Key Vault; the expected value is a versioned KeyVault URI corresponding to the version of the secret being referenced. */
  KeyVaultVersionedReference = "keyVaultVersionedReference"
}

/**
 * Defines values for SecretKind. \
 * {@link KnownSecretKind} can be used interchangeably with SecretKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **inlinedValue**: A simple secret resource whose plaintext value is provided by the user. \
 * **keyVaultVersionedReference**: A secret resource that references a specific version of a secret stored in Azure Key Vault; the expected value is a versioned KeyVault URI corresponding to the version of the secret being referenced.
 */
export type SecretKind = string;

/** Known values of {@link VolumeProvider} that the service accepts. */
export enum KnownVolumeProvider {
  /** Provides volumes that are backed by Azure Files. */
  SFAzureFile = "SFAzureFile"
}

/**
 * Defines values for VolumeProvider. \
 * {@link KnownVolumeProvider} can be used interchangeably with VolumeProvider,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **SFAzureFile**: Provides volumes that are backed by Azure Files.
 */
export type VolumeProvider = string;

/** Known values of {@link NetworkKind} that the service accepts. */
export enum KnownNetworkKind {
  /** Indicates a container network local to a single Service Fabric cluster. The value is 1. */
  Local = "Local"
}

/**
 * Defines values for NetworkKind. \
 * {@link KnownNetworkKind} can be used interchangeably with NetworkKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Local**: Indicates a container network local to a single Service Fabric cluster. The value is 1.
 */
export type NetworkKind = string;

/** Known values of {@link OperatingSystemType} that the service accepts. */
export enum KnownOperatingSystemType {
  /** The required operating system is Linux. */
  Linux = "Linux",
  /** The required operating system is Windows. */
  Windows = "Windows"
}

/**
 * Defines values for OperatingSystemType. \
 * {@link KnownOperatingSystemType} can be used interchangeably with OperatingSystemType,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Linux**: The required operating system is Linux. \
 * **Windows**: The required operating system is Windows.
 */
export type OperatingSystemType = string;

/** Known values of {@link ImageRegistryPasswordType} that the service accepts. */
export enum KnownImageRegistryPasswordType {
  /** The image registry password in clear text, will not be processed in any way and used directly */
  ClearText = "ClearText",
  /** The URI to a KeyVault secret version, will be resolved using the application's managed identity (this type is only valid if the app was assigned a managed identity) before getting used */
  KeyVaultReference = "KeyVaultReference",
  /** The reference to a SecretValue resource, will be resolved before getting used */
  SecretValueReference = "SecretValueReference"
}

/**
 * Defines values for ImageRegistryPasswordType. \
 * {@link KnownImageRegistryPasswordType} can be used interchangeably with ImageRegistryPasswordType,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **ClearText**: The image registry password in clear text, will not be processed in any way and used directly \
 * **KeyVaultReference**: The URI to a KeyVault secret version, will be resolved using the application's managed identity (this type is only valid if the app was assigned a managed identity) before getting used \
 * **SecretValueReference**: The reference to a SecretValue resource, will be resolved before getting used
 */
export type ImageRegistryPasswordType = string;

/** Known values of {@link EnvironmentVariableType} that the service accepts. */
export enum KnownEnvironmentVariableType {
  /** The environment variable in clear text, will not be processed in any way and passed in as is */
  ClearText = "ClearText",
  /** The URI to a KeyVault secret version, will be resolved using the application's managed identity (this type is only valid if the app was assigned a managed identity) before getting passed in */
  KeyVaultReference = "KeyVaultReference",
  /** The reference to a SecretValue resource, will be resolved before getting passed in */
  SecretValueReference = "SecretValueReference"
}

/**
 * Defines values for EnvironmentVariableType. \
 * {@link KnownEnvironmentVariableType} can be used interchangeably with EnvironmentVariableType,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **ClearText**: The environment variable in clear text, will not be processed in any way and passed in as is \
 * **KeyVaultReference**: The URI to a KeyVault secret version, will be resolved using the application's managed identity (this type is only valid if the app was assigned a managed identity) before getting passed in \
 * **SecretValueReference**: The reference to a SecretValue resource, will be resolved before getting passed in
 */
export type EnvironmentVariableType = string;

/** Known values of {@link SettingType} that the service accepts. */
export enum KnownSettingType {
  /** The setting in clear text, will not be processed in any way and passed in as is */
  ClearText = "ClearText",
  /** The URI to a KeyVault secret version, will be resolved using the application's managed identity (this type is only valid if the app was assigned a managed identity) before getting passed in */
  KeyVaultReference = "KeyVaultReference",
  /** The reference to a SecretValue resource, will be resolved before getting passed in */
  SecretValueReference = "SecretValueReference"
}

/**
 * Defines values for SettingType. \
 * {@link KnownSettingType} can be used interchangeably with SettingType,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **ClearText**: The setting in clear text, will not be processed in any way and passed in as is \
 * **KeyVaultReference**: The URI to a KeyVault secret version, will be resolved using the application's managed identity (this type is only valid if the app was assigned a managed identity) before getting passed in \
 * **SecretValueReference**: The reference to a SecretValue resource, will be resolved before getting passed in
 */
export type SettingType = string;

/** Known values of {@link ApplicationScopedVolumeKind} that the service accepts. */
export enum KnownApplicationScopedVolumeKind {
  /** Provides Service Fabric High Availability Volume Disk */
  ServiceFabricVolumeDisk = "ServiceFabricVolumeDisk"
}

/**
 * Defines values for ApplicationScopedVolumeKind. \
 * {@link KnownApplicationScopedVolumeKind} can be used interchangeably with ApplicationScopedVolumeKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **ServiceFabricVolumeDisk**: Provides Service Fabric High Availability Volume Disk
 */
export type ApplicationScopedVolumeKind = string;

/** Known values of {@link Scheme} that the service accepts. */
export enum KnownScheme {
  /** Indicates that the probe is http. */
  Http = "http",
  /** Indicates that the probe is https. No cert validation. */
  Https = "https"
}

/**
 * Defines values for Scheme. \
 * {@link KnownScheme} can be used interchangeably with Scheme,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **http**: Indicates that the probe is http. \
 * **https**: Indicates that the probe is https. No cert validation.
 */
export type Scheme = string;

/** Known values of {@link ExecutionPolicyType} that the service accepts. */
export enum KnownExecutionPolicyType {
  /** Indicates the default execution policy, always restart the service if an exit occurs. */
  Default = "Default",
  /** Indicates that the service will perform its desired operation and complete successfully. If the service encounters failure, it will restarted based on restart policy specified. If the service completes its operation successfully, it will not be restarted again. */
  RunToCompletion = "RunToCompletion"
}

/**
 * Defines values for ExecutionPolicyType. \
 * {@link KnownExecutionPolicyType} can be used interchangeably with ExecutionPolicyType,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Default**: Indicates the default execution policy, always restart the service if an exit occurs. \
 * **RunToCompletion**: Indicates that the service will perform its desired operation and complete successfully. If the service encounters failure, it will restarted based on restart policy specified. If the service completes its operation successfully, it will not be restarted again.
 */
export type ExecutionPolicyType = string;

/** Known values of {@link AutoScalingTriggerKind} that the service accepts. */
export enum KnownAutoScalingTriggerKind {
  /** Indicates that scaling should be performed based on average load of all replicas in the service. */
  AverageLoad = "AverageLoad"
}

/**
 * Defines values for AutoScalingTriggerKind. \
 * {@link KnownAutoScalingTriggerKind} can be used interchangeably with AutoScalingTriggerKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **AverageLoad**: Indicates that scaling should be performed based on average load of all replicas in the service.
 */
export type AutoScalingTriggerKind = string;

/** Known values of {@link AutoScalingMechanismKind} that the service accepts. */
export enum KnownAutoScalingMechanismKind {
  /** Indicates that scaling should be performed by adding or removing replicas. */
  AddRemoveReplica = "AddRemoveReplica"
}

/**
 * Defines values for AutoScalingMechanismKind. \
 * {@link KnownAutoScalingMechanismKind} can be used interchangeably with AutoScalingMechanismKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **AddRemoveReplica**: Indicates that scaling should be performed by adding or removing replicas.
 */
export type AutoScalingMechanismKind = string;

/** Known values of {@link DiagnosticsSinkKind} that the service accepts. */
export enum KnownDiagnosticsSinkKind {
  /** Indicates an invalid sink kind. All Service Fabric enumerations have the invalid type. */
  Invalid = "Invalid",
  /** Diagnostics settings for Geneva. */
  AzureInternalMonitoringPipeline = "AzureInternalMonitoringPipeline"
}

/**
 * Defines values for DiagnosticsSinkKind. \
 * {@link KnownDiagnosticsSinkKind} can be used interchangeably with DiagnosticsSinkKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates an invalid sink kind. All Service Fabric enumerations have the invalid type. \
 * **AzureInternalMonitoringPipeline**: Diagnostics settings for Geneva.
 */
export type DiagnosticsSinkKind = string;

/** Known values of {@link ApplicationResourceUpgradeState} that the service accepts. */
export enum KnownApplicationResourceUpgradeState {
  /** Indicates the upgrade state is invalid. All Service Fabric enumerations have the invalid type. The value is 0. */
  Invalid = "Invalid",
  /** The upgrade is in the progress of provisioning target application type version. The value is 1. */
  ProvisioningTarget = "ProvisioningTarget",
  /** The upgrade is rolling forward to the target version but is not complete yet. The value is 2. */
  RollingForward = "RollingForward",
  /** The upgrade is in the progress of unprovisioning current application type version and rolling forward to the target version is completed. The value is 3. */
  UnprovisioningCurrent = "UnprovisioningCurrent",
  /** The upgrade has finished rolling forward. The value is 4. */
  CompletedRollforward = "CompletedRollforward",
  /** The upgrade is rolling back to the previous version but is not complete yet. The value is 5. */
  RollingBack = "RollingBack",
  /** The upgrade is in the progress of unprovisioning target application type version and rolling back to the current version is completed. The value is 6. */
  UnprovisioningTarget = "UnprovisioningTarget",
  /** The upgrade has finished rolling back. The value is 7. */
  CompletedRollback = "CompletedRollback",
  /** The upgrade has failed and is unable to execute FailureAction. The value is 8. */
  Failed = "Failed"
}

/**
 * Defines values for ApplicationResourceUpgradeState. \
 * {@link KnownApplicationResourceUpgradeState} can be used interchangeably with ApplicationResourceUpgradeState,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates the upgrade state is invalid. All Service Fabric enumerations have the invalid type. The value is 0. \
 * **ProvisioningTarget**: The upgrade is in the progress of provisioning target application type version. The value is 1. \
 * **RollingForward**: The upgrade is rolling forward to the target version but is not complete yet. The value is 2. \
 * **UnprovisioningCurrent**: The upgrade is in the progress of unprovisioning current application type version and rolling forward to the target version is completed. The value is 3. \
 * **CompletedRollforward**: The upgrade has finished rolling forward. The value is 4. \
 * **RollingBack**: The upgrade is rolling back to the previous version but is not complete yet. The value is 5. \
 * **UnprovisioningTarget**: The upgrade is in the progress of unprovisioning target application type version and rolling back to the current version is completed. The value is 6. \
 * **CompletedRollback**: The upgrade has finished rolling back. The value is 7. \
 * **Failed**: The upgrade has failed and is unable to execute FailureAction. The value is 8.
 */
export type ApplicationResourceUpgradeState = string;

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

/** Known values of {@link PathMatchType} that the service accepts. */
export enum KnownPathMatchType {
  /** Prefix */
  Prefix = "prefix"
}

/**
 * Defines values for PathMatchType. \
 * {@link KnownPathMatchType} can be used interchangeably with PathMatchType,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **prefix**
 */
export type PathMatchType = string;

/** Known values of {@link HeaderMatchType} that the service accepts. */
export enum KnownHeaderMatchType {
  /** Exact */
  Exact = "exact"
}

/**
 * Defines values for HeaderMatchType. \
 * {@link KnownHeaderMatchType} can be used interchangeably with HeaderMatchType,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **exact**
 */
export type HeaderMatchType = string;

/** Known values of {@link ReplicaRole} that the service accepts. */
export enum KnownReplicaRole {
  /** Indicates the initial role that a replica is created in. The value is zero. */
  Unknown = "Unknown",
  /** Specifies that the replica has no responsibility in regard to the replica set. The value is 1 */
  None = "None",
  /** Refers to the replica in the set on which all read and write operations are complete in order to enforce strong consistency semantics. Read operations are handled directly by the Primary replica, while write operations must be acknowledged by a quorum of the replicas in the replica set. There can only be one Primary replica in a replica set at a time. The value is 2. */
  Primary = "Primary",
  /** Refers to a replica in the set that receives a state transfer from the Primary replica to prepare for becoming an active Secondary replica. There can be multiple Idle Secondary replicas in a replica set at a time. Idle Secondary replicas do not count as a part of a write quorum. The value is 3. */
  IdleSecondary = "IdleSecondary",
  /** Refers to a replica in the set that receives state updates from the Primary replica, applies them, and sends acknowledgements back. Secondary replicas must participate in the write quorum for a replica set. There can be multiple active Secondary replicas in a replica set at a time. The number of active Secondary replicas is configurable that the reliability subsystem should maintain. The value is 4. */
  ActiveSecondary = "ActiveSecondary",
  /** Refers to a replica in the set that receives a state transfer from the Primary replica to prepare for becoming an ActiveAuxiliary replica. There can be multiple IdleAuxiliary replicas in a replica set at a time. IdleAuxiliary replicas do not count as a part of a write quorum. The value is 5. */
  IdleAuxiliary = "IdleAuxiliary",
  /** Refers to a replica in the set that receives state updates from the Primary replica, applies them, and sends acknowledgements back. ActiveAuxiliary replicas must participate in the write quorum for a replica set. There can be multiple active ActiveAuxiliary replicas in a replica set at a time. The number of active ActiveAuxiliary replicas is configurable that the reliability subsystem should maintain. The value is 6. */
  ActiveAuxiliary = "ActiveAuxiliary",
  /** Refers to the replica in the set that is used to rebuild a new Secondary replica to relinquish primary status to. It cannot field read or write requests. The value is 7. */
  PrimaryAuxiliary = "PrimaryAuxiliary"
}

/**
 * Defines values for ReplicaRole. \
 * {@link KnownReplicaRole} can be used interchangeably with ReplicaRole,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Unknown**: Indicates the initial role that a replica is created in. The value is zero. \
 * **None**: Specifies that the replica has no responsibility in regard to the replica set. The value is 1 \
 * **Primary**: Refers to the replica in the set on which all read and write operations are complete in order to enforce strong consistency semantics. Read operations are handled directly by the Primary replica, while write operations must be acknowledged by a quorum of the replicas in the replica set. There can only be one Primary replica in a replica set at a time. The value is 2. \
 * **IdleSecondary**: Refers to a replica in the set that receives a state transfer from the Primary replica to prepare for becoming an active Secondary replica. There can be multiple Idle Secondary replicas in a replica set at a time. Idle Secondary replicas do not count as a part of a write quorum. The value is 3. \
 * **ActiveSecondary**: Refers to a replica in the set that receives state updates from the Primary replica, applies them, and sends acknowledgements back. Secondary replicas must participate in the write quorum for a replica set. There can be multiple active Secondary replicas in a replica set at a time. The number of active Secondary replicas is configurable that the reliability subsystem should maintain. The value is 4. \
 * **IdleAuxiliary**: Refers to a replica in the set that receives a state transfer from the Primary replica to prepare for becoming an ActiveAuxiliary replica. There can be multiple IdleAuxiliary replicas in a replica set at a time. IdleAuxiliary replicas do not count as a part of a write quorum. The value is 5. \
 * **ActiveAuxiliary**: Refers to a replica in the set that receives state updates from the Primary replica, applies them, and sends acknowledgements back. ActiveAuxiliary replicas must participate in the write quorum for a replica set. There can be multiple active ActiveAuxiliary replicas in a replica set at a time. The number of active ActiveAuxiliary replicas is configurable that the reliability subsystem should maintain. The value is 6. \
 * **PrimaryAuxiliary**: Refers to the replica in the set that is used to rebuild a new Secondary replica to relinquish primary status to. It cannot field read or write requests. The value is 7.
 */
export type ReplicaRole = string;

/** Known values of {@link ReconfigurationPhase} that the service accepts. */
export enum KnownReconfigurationPhase {
  /** Indicates the invalid reconfiguration phase. */
  Unknown = "Unknown",
  /** Specifies that there is no reconfiguration in progress. */
  None = "None",
  /** Refers to the phase where the reconfiguration is transferring data from the previous primary to the new primary. */
  Phase0 = "Phase0",
  /** Refers to the phase where the reconfiguration is querying the replica set for the progress. */
  Phase1 = "Phase1",
  /** Refers to the phase where the reconfiguration is ensuring that data from the current primary is present in a majority of the replica set. */
  Phase2 = "Phase2",
  /** This phase is for internal use only. */
  Phase3 = "Phase3",
  /** This phase is for internal use only. */
  Phase4 = "Phase4",
  /** This phase is for internal use only. */
  AbortPhaseZero = "AbortPhaseZero"
}

/**
 * Defines values for ReconfigurationPhase. \
 * {@link KnownReconfigurationPhase} can be used interchangeably with ReconfigurationPhase,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Unknown**: Indicates the invalid reconfiguration phase. \
 * **None**: Specifies that there is no reconfiguration in progress. \
 * **Phase0**: Refers to the phase where the reconfiguration is transferring data from the previous primary to the new primary. \
 * **Phase1**: Refers to the phase where the reconfiguration is querying the replica set for the progress. \
 * **Phase2**: Refers to the phase where the reconfiguration is ensuring that data from the current primary is present in a majority of the replica set. \
 * **Phase3**: This phase is for internal use only. \
 * **Phase4**: This phase is for internal use only. \
 * **AbortPhaseZero**: This phase is for internal use only.
 */
export type ReconfigurationPhase = string;

/** Known values of {@link ReconfigurationType} that the service accepts. */
export enum KnownReconfigurationType {
  /** Indicates the invalid reconfiguration type. */
  Unknown = "Unknown",
  /** Specifies that the primary replica is being swapped with a different replica. */
  SwapPrimary = "SwapPrimary",
  /** Reconfiguration triggered in response to a primary going down. This could be due to many reasons such as primary replica crashing etc. */
  Failover = "Failover",
  /** Reconfigurations where the primary replica is not changing. */
  Other = "Other"
}

/**
 * Defines values for ReconfigurationType. \
 * {@link KnownReconfigurationType} can be used interchangeably with ReconfigurationType,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Unknown**: Indicates the invalid reconfiguration type. \
 * **SwapPrimary**: Specifies that the primary replica is being swapped with a different replica. \
 * **Failover**: Reconfiguration triggered in response to a primary going down. This could be due to many reasons such as primary replica crashing etc. \
 * **Other**: Reconfigurations where the primary replica is not changing.
 */
export type ReconfigurationType = string;

/** Known values of {@link ApplicationPackageCleanupPolicy} that the service accepts. */
export enum KnownApplicationPackageCleanupPolicy {
  /** Indicates that the application package cleanup policy is invalid. This value is default. The value is zero. */
  Invalid = "Invalid",
  /** Indicates that the cleanup policy of application packages is based on the cluster setting "CleanupApplicationPackageOnProvisionSuccess." The value is 1. */
  Default = "Default",
  /** Indicates that the service fabric runtime determines when to do the application package cleanup. By default, cleanup is done on successful provision. The value is 2. */
  Automatic = "Automatic",
  /** Indicates that the user has to explicitly clean up the application package. The value is 3. */
  Manual = "Manual"
}

/**
 * Defines values for ApplicationPackageCleanupPolicy. \
 * {@link KnownApplicationPackageCleanupPolicy} can be used interchangeably with ApplicationPackageCleanupPolicy,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates that the application package cleanup policy is invalid. This value is default. The value is zero. \
 * **Default**: Indicates that the cleanup policy of application packages is based on the cluster setting "CleanupApplicationPackageOnProvisionSuccess." The value is 1. \
 * **Automatic**: Indicates that the service fabric runtime determines when to do the application package cleanup. By default, cleanup is done on successful provision. The value is 2. \
 * **Manual**: Indicates that the user has to explicitly clean up the application package. The value is 3.
 */
export type ApplicationPackageCleanupPolicy = string;

/** Known values of {@link ReplicatorOperationName} that the service accepts. */
export enum KnownReplicatorOperationName {
  /** Default value if the replicator is not yet ready. */
  Invalid = "Invalid",
  /** Replicator is not running any operation from Service Fabric perspective. */
  None = "None",
  /** Replicator is opening. */
  Open = "Open",
  /** Replicator is in the process of changing its role. */
  ChangeRole = "ChangeRole",
  /** Due to a change in the replica set, replicator is being updated with its Epoch. */
  UpdateEpoch = "UpdateEpoch",
  /** Replicator is closing. */
  Close = "Close",
  /** Replicator is being aborted. */
  Abort = "Abort",
  /** Replicator is handling the data loss condition, where the user service may potentially be recovering state from an external source. */
  OnDataLoss = "OnDataLoss",
  /** Replicator is waiting for a quorum of replicas to be caught up to the latest state. */
  WaitForCatchup = "WaitForCatchup",
  /** Replicator is in the process of building one or more replicas. */
  Build = "Build"
}

/**
 * Defines values for ReplicatorOperationName. \
 * {@link KnownReplicatorOperationName} can be used interchangeably with ReplicatorOperationName,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Default value if the replicator is not yet ready. \
 * **None**: Replicator is not running any operation from Service Fabric perspective. \
 * **Open**: Replicator is opening. \
 * **ChangeRole**: Replicator is in the process of changing its role. \
 * **UpdateEpoch**: Due to a change in the replica set, replicator is being updated with its Epoch. \
 * **Close**: Replicator is closing. \
 * **Abort**: Replicator is being aborted. \
 * **OnDataLoss**: Replicator is handling the data loss condition, where the user service may potentially be recovering state from an external source. \
 * **WaitForCatchup**: Replicator is waiting for a quorum of replicas to be caught up to the latest state. \
 * **Build**: Replicator is in the process of building one or more replicas.
 */
export type ReplicatorOperationName = string;

/** Known values of {@link PartitionAccessStatus} that the service accepts. */
export enum KnownPartitionAccessStatus {
  /** Indicates that the read or write operation access status is not valid. This value is not returned to the caller. */
  Invalid = "Invalid",
  /** Indicates that the read or write operation access is granted and the operation is allowed. */
  Granted = "Granted",
  /** Indicates that the client should try again later, because a reconfiguration is in progress. */
  ReconfigurationPending = "ReconfigurationPending",
  /** Indicates that this client request was received by a replica that is not a Primary replica. */
  NotPrimary = "NotPrimary",
  /** Indicates that no write quorum is available and, therefore, no write operation can be accepted. */
  NoWriteQuorum = "NoWriteQuorum"
}

/**
 * Defines values for PartitionAccessStatus. \
 * {@link KnownPartitionAccessStatus} can be used interchangeably with PartitionAccessStatus,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates that the read or write operation access status is not valid. This value is not returned to the caller. \
 * **Granted**: Indicates that the read or write operation access is granted and the operation is allowed. \
 * **ReconfigurationPending**: Indicates that the client should try again later, because a reconfiguration is in progress. \
 * **NotPrimary**: Indicates that this client request was received by a replica that is not a Primary replica. \
 * **NoWriteQuorum**: Indicates that no write quorum is available and, therefore, no write operation can be accepted.
 */
export type PartitionAccessStatus = string;

/** Known values of {@link ReplicaKind} that the service accepts. */
export enum KnownReplicaKind {
  /** Represents an invalid replica kind. The value is zero. */
  Invalid = "Invalid",
  /** Represents a key value store replica. The value is 1 */
  KeyValueStore = "KeyValueStore"
}

/**
 * Defines values for ReplicaKind. \
 * {@link KnownReplicaKind} can be used interchangeably with ReplicaKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Represents an invalid replica kind. The value is zero. \
 * **KeyValueStore**: Represents a key value store replica. The value is 1
 */
export type ReplicaKind = string;

/** Known values of {@link ManagedIdentityType} that the service accepts. */
export enum KnownManagedIdentityType {
  /** Indicates an invalid managed identity type. All Service Fabric enumerations have the invalid type. */
  Invalid = "Invalid",
  /** Indicates VMSS managed identity should be used to connect to Azure blob store. */
  Vmss = "VMSS",
  /** Indicates cluster managed identity should be used to connect to Azure blob store. */
  Cluster = "Cluster"
}

/**
 * Defines values for ManagedIdentityType. \
 * {@link KnownManagedIdentityType} can be used interchangeably with ManagedIdentityType,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates an invalid managed identity type. All Service Fabric enumerations have the invalid type. \
 * **VMSS**: Indicates VMSS managed identity should be used to connect to Azure blob store. \
 * **Cluster**: Indicates cluster managed identity should be used to connect to Azure blob store.
 */
export type ManagedIdentityType = string;

/** Known values of {@link BackupScheduleFrequencyType} that the service accepts. */
export enum KnownBackupScheduleFrequencyType {
  /** Indicates an invalid backup schedule frequency type. All Service Fabric enumerations have the invalid type. */
  Invalid = "Invalid",
  /** Indicates that the time based backup schedule is repeated at a daily frequency. */
  Daily = "Daily",
  /** Indicates that the time based backup schedule is repeated at a weekly frequency. */
  Weekly = "Weekly"
}

/**
 * Defines values for BackupScheduleFrequencyType. \
 * {@link KnownBackupScheduleFrequencyType} can be used interchangeably with BackupScheduleFrequencyType,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates an invalid backup schedule frequency type. All Service Fabric enumerations have the invalid type. \
 * **Daily**: Indicates that the time based backup schedule is repeated at a daily frequency. \
 * **Weekly**: Indicates that the time based backup schedule is repeated at a weekly frequency.
 */
export type BackupScheduleFrequencyType = string;

/** Known values of {@link DayOfWeek} that the service accepts. */
export enum KnownDayOfWeek {
  /** Indicates the Day referred is Sunday. */
  Sunday = "Sunday",
  /** Indicates the Day referred is Monday. */
  Monday = "Monday",
  /** Indicates the Day referred is Tuesday. */
  Tuesday = "Tuesday",
  /** Indicates the Day referred is Wednesday. */
  Wednesday = "Wednesday",
  /** Indicates the Day referred is Thursday. */
  Thursday = "Thursday",
  /** Indicates the Day referred is Friday. */
  Friday = "Friday",
  /** Indicates the Day referred is Saturday. */
  Saturday = "Saturday"
}

/**
 * Defines values for DayOfWeek. \
 * {@link KnownDayOfWeek} can be used interchangeably with DayOfWeek,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Sunday**: Indicates the Day referred is Sunday. \
 * **Monday**: Indicates the Day referred is Monday. \
 * **Tuesday**: Indicates the Day referred is Tuesday. \
 * **Wednesday**: Indicates the Day referred is Wednesday. \
 * **Thursday**: Indicates the Day referred is Thursday. \
 * **Friday**: Indicates the Day referred is Friday. \
 * **Saturday**: Indicates the Day referred is Saturday.
 */
export type DayOfWeek = string;

/** Known values of {@link ImpactLevel} that the service accepts. */
export enum KnownImpactLevel {
  /** Invalid */
  Invalid = "Invalid",
  /** None */
  None = "None",
  /** Restart */
  Restart = "Restart",
  /** RemoveData */
  RemoveData = "RemoveData",
  /** RemoveNode */
  RemoveNode = "RemoveNode"
}

/**
 * Defines values for ImpactLevel. \
 * {@link KnownImpactLevel} can be used interchangeably with ImpactLevel,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid** \
 * **None** \
 * **Restart** \
 * **RemoveData** \
 * **RemoveNode**
 */
export type ImpactLevel = string;

/** Known values of {@link SizeTypes} that the service accepts. */
export enum KnownSizeTypes {
  /** Small */
  Small = "Small",
  /** Medium */
  Medium = "Medium",
  /** Large */
  Large = "Large"
}

/**
 * Defines values for SizeTypes. \
 * {@link KnownSizeTypes} can be used interchangeably with SizeTypes,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Small** \
 * **Medium** \
 * **Large**
 */
export type SizeTypes = string;

/** Known values of {@link AutoScalingMetricKind} that the service accepts. */
export enum KnownAutoScalingMetricKind {
  /** Indicates that the metric is one of resources, like cpu or memory. */
  Resource = "Resource"
}

/**
 * Defines values for AutoScalingMetricKind. \
 * {@link KnownAutoScalingMetricKind} can be used interchangeably with AutoScalingMetricKind,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Resource**: Indicates that the metric is one of resources, like cpu or memory.
 */
export type AutoScalingMetricKind = string;

/** Known values of {@link AutoScalingResourceMetricName} that the service accepts. */
export enum KnownAutoScalingResourceMetricName {
  /** Indicates that the resource is CPU cores. */
  Cpu = "cpu",
  /** Indicates that the resource is memory in GB. */
  MemoryInGB = "memoryInGB"
}

/**
 * Defines values for AutoScalingResourceMetricName. \
 * {@link KnownAutoScalingResourceMetricName} can be used interchangeably with AutoScalingResourceMetricName,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **cpu**: Indicates that the resource is CPU cores. \
 * **memoryInGB**: Indicates that the resource is memory in GB.
 */
export type AutoScalingResourceMetricName = string;

/** Known values of {@link RestartPolicy} that the service accepts. */
export enum KnownRestartPolicy {
  /** Service will be restarted when it encounters a failure. */
  OnFailure = "OnFailure",
  /** Service will never be restarted. If the service encounters a failure, it will move to Failed state. */
  Never = "Never"
}

/**
 * Defines values for RestartPolicy. \
 * {@link KnownRestartPolicy} can be used interchangeably with RestartPolicy,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **OnFailure**: Service will be restarted when it encounters a failure. \
 * **Never**: Service will never be restarted. If the service encounters a failure, it will move to Failed state.
 */
export type RestartPolicy = string;

/** Known values of {@link FabricReplicaStatus} that the service accepts. */
export enum KnownFabricReplicaStatus {
  /** Indicates that the read or write operation access status is not valid. This value is not returned to the caller. */
  Invalid = "Invalid",
  /** Indicates that the replica is down. */
  Down = "Down",
  /** Indicates that the replica is up. */
  Up = "Up"
}

/**
 * Defines values for FabricReplicaStatus. \
 * {@link KnownFabricReplicaStatus} can be used interchangeably with FabricReplicaStatus,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Invalid**: Indicates that the read or write operation access status is not valid. This value is not returned to the caller. \
 * **Down**: Indicates that the replica is down. \
 * **Up**: Indicates that the replica is up.
 */
export type FabricReplicaStatus = string;

/** Optional parameters. */
export interface GetClusterManifestOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getClusterManifest operation. */
export type GetClusterManifestResponse = ClusterManifest;

/** Optional parameters. */
export interface GetClusterHealthOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /**
   * Allows filtering of the node health state objects returned in the result of cluster health query
   * based on their health state. The possible values for this parameter include integer value of one of the
   * following health states. Only nodes that match the filter are returned. All nodes are used to evaluate the aggregated health state.
   * If not specified, all entries are returned.
   * The state values are flag-based enumeration, so the value could be a combination of these values obtained using bitwise 'OR' operator.
   * For example, if the provided value is 6 then health state of nodes with HealthState value of OK (2) and Warning (4) are returned.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  nodesHealthStateFilter?: number;
  /**
   * Allows filtering of the application health state objects returned in the result of cluster health
   * query based on their health state.
   * The possible values for this parameter include integer value obtained from members or bitwise operations
   * on members of HealthStateFilter enumeration. Only applications that match the filter are returned.
   * All applications are used to evaluate the aggregated health state. If not specified, all entries are returned.
   * The state values are flag-based enumeration, so the value could be a combination of these values obtained using bitwise 'OR' operator.
   * For example, if the provided value is 6 then health state of applications with HealthState value of OK (2) and Warning (4) are returned.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  applicationsHealthStateFilter?: number;
  /**
   * Allows filtering the collection of HealthEvent objects returned based on health state.
   * The possible values for this parameter include integer value of one of the following health states.
   * Only events that match the filter are returned. All events are used to evaluate the aggregated health state.
   * If not specified, all entries are returned. The state values are flag-based enumeration, so the value could be a combination of these values, obtained using the bitwise 'OR' operator. For example, If the provided value is 6 then all of the events with HealthState value of OK (2) and Warning (4) are returned.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  eventsHealthStateFilter?: number;
  /**
   * Indicates whether the health statistics should be returned as part of the query result. False by default.
   * The statistics show the number of children entities in health state Ok, Warning, and Error.
   */
  excludeHealthStatistics?: boolean;
  /**
   * Indicates whether the health statistics should include the fabric:/System application health statistics. False by default.
   * If IncludeSystemApplicationHealthStatistics is set to true, the health statistics include the entities that belong to the fabric:/System application.
   * Otherwise, the query result includes health statistics only for user applications.
   * The health statistics must be included in the query result for this parameter to be applied.
   */
  includeSystemApplicationHealthStatistics?: boolean;
}

/** Contains response data for the getClusterHealth operation. */
export type GetClusterHealthResponse = ClusterHealth;

/** Optional parameters. */
export interface GetClusterHealthUsingPolicyOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /**
   * Allows filtering of the node health state objects returned in the result of cluster health query
   * based on their health state. The possible values for this parameter include integer value of one of the
   * following health states. Only nodes that match the filter are returned. All nodes are used to evaluate the aggregated health state.
   * If not specified, all entries are returned.
   * The state values are flag-based enumeration, so the value could be a combination of these values obtained using bitwise 'OR' operator.
   * For example, if the provided value is 6 then health state of nodes with HealthState value of OK (2) and Warning (4) are returned.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  nodesHealthStateFilter?: number;
  /**
   * Allows filtering of the application health state objects returned in the result of cluster health
   * query based on their health state.
   * The possible values for this parameter include integer value obtained from members or bitwise operations
   * on members of HealthStateFilter enumeration. Only applications that match the filter are returned.
   * All applications are used to evaluate the aggregated health state. If not specified, all entries are returned.
   * The state values are flag-based enumeration, so the value could be a combination of these values obtained using bitwise 'OR' operator.
   * For example, if the provided value is 6 then health state of applications with HealthState value of OK (2) and Warning (4) are returned.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  applicationsHealthStateFilter?: number;
  /**
   * Allows filtering the collection of HealthEvent objects returned based on health state.
   * The possible values for this parameter include integer value of one of the following health states.
   * Only events that match the filter are returned. All events are used to evaluate the aggregated health state.
   * If not specified, all entries are returned. The state values are flag-based enumeration, so the value could be a combination of these values, obtained using the bitwise 'OR' operator. For example, If the provided value is 6 then all of the events with HealthState value of OK (2) and Warning (4) are returned.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  eventsHealthStateFilter?: number;
  /**
   * Indicates whether the health statistics should be returned as part of the query result. False by default.
   * The statistics show the number of children entities in health state Ok, Warning, and Error.
   */
  excludeHealthStatistics?: boolean;
  /**
   * Indicates whether the health statistics should include the fabric:/System application health statistics. False by default.
   * If IncludeSystemApplicationHealthStatistics is set to true, the health statistics include the entities that belong to the fabric:/System application.
   * Otherwise, the query result includes health statistics only for user applications.
   * The health statistics must be included in the query result for this parameter to be applied.
   */
  includeSystemApplicationHealthStatistics?: boolean;
  /**
   * Describes the health policies used to evaluate the cluster health.
   * If not present, the health evaluation uses the cluster health policy defined in the cluster manifest or the default cluster health policy.
   * By default, each application is evaluated using its specific application health policy, defined in the application manifest, or the default health policy, if no policy is defined in manifest.
   * If the application health policy map is specified, and it has an entry for an application, the specified application health policy
   * is used to evaluate the application health.
   */
  clusterHealthPolicies?: ClusterHealthPolicies;
}

/** Contains response data for the getClusterHealthUsingPolicy operation. */
export type GetClusterHealthUsingPolicyResponse = ClusterHealth;

/** Optional parameters. */
export interface GetClusterHealthChunkOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getClusterHealthChunk operation. */
export type GetClusterHealthChunkResponse = ClusterHealthChunk;

/** Optional parameters. */
export interface GetClusterHealthChunkUsingPolicyAndAdvancedFiltersOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /**
   * Describes the cluster and application health policies used to evaluate the cluster health and the filters to select which cluster entities to be returned.
   * If the cluster health policy is present, it is used to evaluate the cluster events and the cluster nodes. If not present, the health evaluation uses the cluster health policy defined in the cluster manifest or the default cluster health policy.
   * By default, each application is evaluated using its specific application health policy, defined in the application manifest, or the default health policy, if no policy is defined in manifest.
   * If the application health policy map is specified, and it has an entry for an application, the specified application health policy
   * is used to evaluate the application health.
   * Users can specify very flexible filters to select which cluster entities to include in response. The selection can be done based on the entities health state and based on the hierarchy.
   * The query can return multi-level children of the entities based on the specified filters. For example, it can return one application with a specified name, and for this application, return
   * only services that are in Error or Warning, and all partitions and replicas for one of these services.
   */
  clusterHealthChunkQueryDescription?: ClusterHealthChunkQueryDescription;
}

/** Contains response data for the getClusterHealthChunkUsingPolicyAndAdvancedFilters operation. */
export type GetClusterHealthChunkUsingPolicyAndAdvancedFiltersResponse = ClusterHealthChunk;

/** Optional parameters. */
export interface ReportClusterHealthOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /**
   * A flag that indicates whether the report should be sent immediately.
   * A health report is sent to a Service Fabric gateway Application, which forwards to the health store.
   * If Immediate is set to true, the report is sent immediately from HTTP Gateway to the health store, regardless of the fabric client settings that the HTTP Gateway Application is using.
   * This is useful for critical reports that should be sent as soon as possible.
   * Depending on timing and other conditions, sending the report may still fail, for example if the HTTP Gateway is closed or the message doesn't reach the Gateway.
   * If Immediate is set to false, the report is sent based on the health client settings from the HTTP Gateway. Therefore, it will be batched according to the HealthReportSendInterval configuration.
   * This is the recommended setting because it allows the health client to optimize health reporting messages to health store as well as health report processing.
   * By default, reports are not sent immediately.
   */
  immediate?: boolean;
}

/** Optional parameters. */
export interface GetProvisionedFabricCodeVersionInfoListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The product version of Service Fabric. */
  codeVersion?: string;
}

/** Contains response data for the getProvisionedFabricCodeVersionInfoList operation. */
export type GetProvisionedFabricCodeVersionInfoListResponse = FabricCodeVersionInfo[];

/** Optional parameters. */
export interface GetProvisionedFabricConfigVersionInfoListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The config version of Service Fabric. */
  configVersion?: string;
}

/** Contains response data for the getProvisionedFabricConfigVersionInfoList operation. */
export type GetProvisionedFabricConfigVersionInfoListResponse = FabricConfigVersionInfo[];

/** Optional parameters. */
export interface GetClusterUpgradeProgressOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getClusterUpgradeProgress operation. */
export type GetClusterUpgradeProgressResponse = ClusterUpgradeProgressObject;

/** Optional parameters. */
export interface GetClusterConfigurationOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getClusterConfiguration operation. */
export type GetClusterConfigurationResponse = ClusterConfiguration;

/** Optional parameters. */
export interface GetClusterConfigurationUpgradeStatusOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getClusterConfigurationUpgradeStatus operation. */
export type GetClusterConfigurationUpgradeStatusResponse = ClusterConfigurationUpgradeStatusInfo;

/** Optional parameters. */
export interface GetUpgradeOrchestrationServiceStateOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getUpgradeOrchestrationServiceState operation. */
export type GetUpgradeOrchestrationServiceStateResponse = UpgradeOrchestrationServiceState;

/** Optional parameters. */
export interface SetUpgradeOrchestrationServiceStateOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the setUpgradeOrchestrationServiceState operation. */
export type SetUpgradeOrchestrationServiceStateResponse = UpgradeOrchestrationServiceStateSummary;

/** Optional parameters. */
export interface ProvisionClusterOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface UnprovisionClusterOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface RollbackClusterUpgradeOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface ResumeClusterUpgradeOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface StartClusterUpgradeOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface StartClusterConfigurationUpgradeOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface UpdateClusterUpgradeOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface GetAadMetadataOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getAadMetadata operation. */
export type GetAadMetadataResponse = AadMetadataObject;

/** Optional parameters. */
export interface GetClusterVersionOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getClusterVersion operation. */
export type GetClusterVersionResponse = ClusterVersion;

/** Optional parameters. */
export interface GetClusterLoadOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getClusterLoad operation. */
export type GetClusterLoadResponse = ClusterLoadInfo;

/** Optional parameters. */
export interface ToggleVerboseServicePlacementHealthReportingOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface ValidateClusterUpgradeOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the validateClusterUpgrade operation. */
export type ValidateClusterUpgradeResponse = ValidateClusterUpgradeResult;

/** Optional parameters. */
export interface GetNodeInfoListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The continuation token parameter is used to obtain next set of results. A continuation token with a non-empty value is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token does not contain a value. The value of this parameter should not be URL encoded. */
  continuationToken?: string;
  /** Allows filtering the nodes based on the NodeStatus. Only the nodes that are matching the specified filter value will be returned. The filter value can be one of the following. */
  nodeStatusFilter?: NodeStatusFilter;
  /** The maximum number of results to be returned as part of the paged queries. This parameter defines the upper bound on the number of results returned. The results returned can be less than the specified maximum results if they do not fit in the message as per the max message size restrictions defined in the configuration. If this parameter is zero or not specified, the paged query includes as many results as possible that fit in the return message. */
  maxResults?: number;
}

/** Contains response data for the getNodeInfoList operation. */
export type GetNodeInfoListResponse = PagedNodeInfoList;

/** Optional parameters. */
export interface GetNodeInfoOptionalParams extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getNodeInfo operation. */
export type GetNodeInfoResponse = NodeInfo;

/** Optional parameters. */
export interface GetNodeHealthOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /**
   * Allows filtering the collection of HealthEvent objects returned based on health state.
   * The possible values for this parameter include integer value of one of the following health states.
   * Only events that match the filter are returned. All events are used to evaluate the aggregated health state.
   * If not specified, all entries are returned. The state values are flag-based enumeration, so the value could be a combination of these values, obtained using the bitwise 'OR' operator. For example, If the provided value is 6 then all of the events with HealthState value of OK (2) and Warning (4) are returned.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  eventsHealthStateFilter?: number;
}

/** Contains response data for the getNodeHealth operation. */
export type GetNodeHealthResponse = NodeHealth;

/** Optional parameters. */
export interface GetNodeHealthUsingPolicyOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /**
   * Allows filtering the collection of HealthEvent objects returned based on health state.
   * The possible values for this parameter include integer value of one of the following health states.
   * Only events that match the filter are returned. All events are used to evaluate the aggregated health state.
   * If not specified, all entries are returned. The state values are flag-based enumeration, so the value could be a combination of these values, obtained using the bitwise 'OR' operator. For example, If the provided value is 6 then all of the events with HealthState value of OK (2) and Warning (4) are returned.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  eventsHealthStateFilter?: number;
  /** Describes the health policies used to evaluate the health of a cluster or node. If not present, the health evaluation uses the health policy from cluster manifest or the default health policy. */
  clusterHealthPolicy?: ClusterHealthPolicy;
}

/** Contains response data for the getNodeHealthUsingPolicy operation. */
export type GetNodeHealthUsingPolicyResponse = NodeHealth;

/** Optional parameters. */
export interface ReportNodeHealthOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /**
   * A flag that indicates whether the report should be sent immediately.
   * A health report is sent to a Service Fabric gateway Application, which forwards to the health store.
   * If Immediate is set to true, the report is sent immediately from HTTP Gateway to the health store, regardless of the fabric client settings that the HTTP Gateway Application is using.
   * This is useful for critical reports that should be sent as soon as possible.
   * Depending on timing and other conditions, sending the report may still fail, for example if the HTTP Gateway is closed or the message doesn't reach the Gateway.
   * If Immediate is set to false, the report is sent based on the health client settings from the HTTP Gateway. Therefore, it will be batched according to the HealthReportSendInterval configuration.
   * This is the recommended setting because it allows the health client to optimize health reporting messages to health store as well as health report processing.
   * By default, reports are not sent immediately.
   */
  immediate?: boolean;
}

/** Optional parameters. */
export interface GetNodeLoadInfoOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getNodeLoadInfo operation. */
export type GetNodeLoadInfoResponse = NodeLoadInfo;

/** Optional parameters. */
export interface DisableNodeOptionalParams extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface EnableNodeOptionalParams extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface RemoveNodeStateOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface RestartNodeOptionalParams extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface RemoveConfigurationOverridesOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface GetConfigurationOverridesOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getConfigurationOverrides operation. */
export type GetConfigurationOverridesResponse = ConfigParameterOverride[];

/** Optional parameters. */
export interface AddConfigurationParameterOverridesOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** Force adding configuration overrides on specified nodes. */
  force?: boolean;
}

/** Optional parameters. */
export interface RemoveNodeTagsOptionalParams
  extends coreClient.OperationOptions {}

/** Optional parameters. */
export interface AddNodeTagsOptionalParams
  extends coreClient.OperationOptions {}

/** Optional parameters. */
export interface GetApplicationTypeInfoListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The continuation token parameter is used to obtain next set of results. A continuation token with a non-empty value is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token does not contain a value. The value of this parameter should not be URL encoded. */
  continuationToken?: string;
  /** The maximum number of results to be returned as part of the paged queries. This parameter defines the upper bound on the number of results returned. The results returned can be less than the specified maximum results if they do not fit in the message as per the max message size restrictions defined in the configuration. If this parameter is zero or not specified, the paged query includes as many results as possible that fit in the return message. */
  maxResults?: number;
  /**
   * Used to filter on ApplicationTypeDefinitionKind which is the mechanism used to define a Service Fabric application type.
   * - Default - Default value, which performs the same function as selecting "All". The value is 0.
   * - All - Filter that matches input with any ApplicationTypeDefinitionKind value. The value is 65535.
   * - ServiceFabricApplicationPackage - Filter that matches input with ApplicationTypeDefinitionKind value ServiceFabricApplicationPackage. The value is 1.
   * - Compose - Filter that matches input with ApplicationTypeDefinitionKind value Compose. The value is 2.
   */
  applicationTypeDefinitionKindFilter?: number;
  /** The flag that specifies whether application parameters will be excluded from the result. */
  excludeApplicationParameters?: boolean;
}

/** Contains response data for the getApplicationTypeInfoList operation. */
export type GetApplicationTypeInfoListResponse = PagedApplicationTypeInfoList;

/** Optional parameters. */
export interface GetApplicationTypeInfoListByNameOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The continuation token parameter is used to obtain next set of results. A continuation token with a non-empty value is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token does not contain a value. The value of this parameter should not be URL encoded. */
  continuationToken?: string;
  /** The maximum number of results to be returned as part of the paged queries. This parameter defines the upper bound on the number of results returned. The results returned can be less than the specified maximum results if they do not fit in the message as per the max message size restrictions defined in the configuration. If this parameter is zero or not specified, the paged query includes as many results as possible that fit in the return message. */
  maxResults?: number;
  /** The flag that specifies whether application parameters will be excluded from the result. */
  excludeApplicationParameters?: boolean;
  /** The version of the application type. */
  applicationTypeVersion?: string;
}

/** Contains response data for the getApplicationTypeInfoListByName operation. */
export type GetApplicationTypeInfoListByNameResponse = PagedApplicationTypeInfoList;

/** Optional parameters. */
export interface ProvisionApplicationTypeOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface UnprovisionApplicationTypeOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface GetServiceTypeInfoListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getServiceTypeInfoList operation. */
export type GetServiceTypeInfoListResponse = ServiceTypeInfo[];

/** Optional parameters. */
export interface GetServiceTypeInfoByNameOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getServiceTypeInfoByName operation. */
export type GetServiceTypeInfoByNameResponse = ServiceTypeInfo;

/** Optional parameters. */
export interface GetServiceManifestOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getServiceManifest operation. */
export type GetServiceManifestResponse = ServiceTypeManifest;

/** Optional parameters. */
export interface GetDeployedServiceTypeInfoListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The name of the service manifest to filter the list of deployed service type information. If specified, the response will only contain the information about service types that are defined in this service manifest. */
  serviceManifestName?: string;
}

/** Contains response data for the getDeployedServiceTypeInfoList operation. */
export type GetDeployedServiceTypeInfoListResponse = DeployedServiceTypeInfo[];

/** Optional parameters. */
export interface GetDeployedServiceTypeInfoByNameOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The name of the service manifest to filter the list of deployed service type information. If specified, the response will only contain the information about service types that are defined in this service manifest. */
  serviceManifestName?: string;
}

/** Contains response data for the getDeployedServiceTypeInfoByName operation. */
export type GetDeployedServiceTypeInfoByNameResponse = DeployedServiceTypeInfo[];

/** Optional parameters. */
export interface CreateApplicationOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface DeleteApplicationOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** Remove a Service Fabric application or service forcefully without going through the graceful shutdown sequence. This parameter can be used to forcefully delete an application or service for which delete is timing out due to issues in the service code that prevents graceful close of replicas. */
  forceRemove?: boolean;
}

/** Optional parameters. */
export interface GetApplicationLoadInfoOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getApplicationLoadInfo operation. */
export type GetApplicationLoadInfoResponse = ApplicationLoadInfo;

/** Optional parameters. */
export interface GetApplicationInfoListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The continuation token parameter is used to obtain next set of results. A continuation token with a non-empty value is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token does not contain a value. The value of this parameter should not be URL encoded. */
  continuationToken?: string;
  /** The maximum number of results to be returned as part of the paged queries. This parameter defines the upper bound on the number of results returned. The results returned can be less than the specified maximum results if they do not fit in the message as per the max message size restrictions defined in the configuration. If this parameter is zero or not specified, the paged query includes as many results as possible that fit in the return message. */
  maxResults?: number;
  /** The flag that specifies whether application parameters will be excluded from the result. */
  excludeApplicationParameters?: boolean;
  /**
   * Used to filter on ApplicationDefinitionKind, which is the mechanism used to define a Service Fabric application.
   * - Default - Default value, which performs the same function as selecting "All". The value is 0.
   * - All - Filter that matches input with any ApplicationDefinitionKind value. The value is 65535.
   * - ServiceFabricApplicationDescription - Filter that matches input with ApplicationDefinitionKind value ServiceFabricApplicationDescription. The value is 1.
   * - Compose - Filter that matches input with ApplicationDefinitionKind value Compose. The value is 2.
   */
  applicationDefinitionKindFilter?: number;
  /** The application type name used to filter the applications to query for. This value should not contain the application type version. */
  applicationTypeName?: string;
}

/** Contains response data for the getApplicationInfoList operation. */
export type GetApplicationInfoListResponse = PagedApplicationInfoList;

/** Optional parameters. */
export interface GetApplicationInfoOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The flag that specifies whether application parameters will be excluded from the result. */
  excludeApplicationParameters?: boolean;
}

/** Contains response data for the getApplicationInfo operation. */
export type GetApplicationInfoResponse = ApplicationInfo;

/** Optional parameters. */
export interface GetApplicationHealthOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /**
   * Allows filtering the collection of HealthEvent objects returned based on health state.
   * The possible values for this parameter include integer value of one of the following health states.
   * Only events that match the filter are returned. All events are used to evaluate the aggregated health state.
   * If not specified, all entries are returned. The state values are flag-based enumeration, so the value could be a combination of these values, obtained using the bitwise 'OR' operator. For example, If the provided value is 6 then all of the events with HealthState value of OK (2) and Warning (4) are returned.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  eventsHealthStateFilter?: number;
  /**
   * Indicates whether the health statistics should be returned as part of the query result. False by default.
   * The statistics show the number of children entities in health state Ok, Warning, and Error.
   */
  excludeHealthStatistics?: boolean;
  /**
   * Allows filtering of the deployed applications health state objects returned in the result of application health query based on their health state.
   * The possible values for this parameter include integer value of one of the following health states. Only deployed applications that match the filter will be returned.
   * All deployed applications are used to evaluate the aggregated health state. If not specified, all entries are returned.
   * The state values are flag-based enumeration, so the value could be a combination of these values, obtained using bitwise 'OR' operator.
   * For example, if the provided value is 6 then health state of deployed applications with HealthState value of OK (2) and Warning (4) are returned.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  deployedApplicationsHealthStateFilter?: number;
  /**
   * Allows filtering of the services health state objects returned in the result of services health query based on their health state.
   * The possible values for this parameter include integer value of one of the following health states.
   * Only services that match the filter are returned. All services are used to evaluate the aggregated health state.
   * If not specified, all entries are returned. The state values are flag-based enumeration, so the value could be a combination of these values,
   * obtained using bitwise 'OR' operator. For example, if the provided value is 6 then health state of services with HealthState value of OK (2) and Warning (4) will be returned.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  servicesHealthStateFilter?: number;
}

/** Contains response data for the getApplicationHealth operation. */
export type GetApplicationHealthResponse = ApplicationHealth;

/** Optional parameters. */
export interface GetApplicationHealthUsingPolicyOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /**
   * Allows filtering the collection of HealthEvent objects returned based on health state.
   * The possible values for this parameter include integer value of one of the following health states.
   * Only events that match the filter are returned. All events are used to evaluate the aggregated health state.
   * If not specified, all entries are returned. The state values are flag-based enumeration, so the value could be a combination of these values, obtained using the bitwise 'OR' operator. For example, If the provided value is 6 then all of the events with HealthState value of OK (2) and Warning (4) are returned.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  eventsHealthStateFilter?: number;
  /**
   * Indicates whether the health statistics should be returned as part of the query result. False by default.
   * The statistics show the number of children entities in health state Ok, Warning, and Error.
   */
  excludeHealthStatistics?: boolean;
  /**
   * Allows filtering of the deployed applications health state objects returned in the result of application health query based on their health state.
   * The possible values for this parameter include integer value of one of the following health states. Only deployed applications that match the filter will be returned.
   * All deployed applications are used to evaluate the aggregated health state. If not specified, all entries are returned.
   * The state values are flag-based enumeration, so the value could be a combination of these values, obtained using bitwise 'OR' operator.
   * For example, if the provided value is 6 then health state of deployed applications with HealthState value of OK (2) and Warning (4) are returned.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  deployedApplicationsHealthStateFilter?: number;
  /**
   * Allows filtering of the services health state objects returned in the result of services health query based on their health state.
   * The possible values for this parameter include integer value of one of the following health states.
   * Only services that match the filter are returned. All services are used to evaluate the aggregated health state.
   * If not specified, all entries are returned. The state values are flag-based enumeration, so the value could be a combination of these values,
   * obtained using bitwise 'OR' operator. For example, if the provided value is 6 then health state of services with HealthState value of OK (2) and Warning (4) will be returned.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  servicesHealthStateFilter?: number;
  /**
   * Describes the health policies used to evaluate the health of an application or one of its children.
   * If not present, the health evaluation uses the health policy from application manifest or the default health policy.
   */
  applicationHealthPolicy?: ApplicationHealthPolicy;
}

/** Contains response data for the getApplicationHealthUsingPolicy operation. */
export type GetApplicationHealthUsingPolicyResponse = ApplicationHealth;

/** Optional parameters. */
export interface ReportApplicationHealthOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /**
   * A flag that indicates whether the report should be sent immediately.
   * A health report is sent to a Service Fabric gateway Application, which forwards to the health store.
   * If Immediate is set to true, the report is sent immediately from HTTP Gateway to the health store, regardless of the fabric client settings that the HTTP Gateway Application is using.
   * This is useful for critical reports that should be sent as soon as possible.
   * Depending on timing and other conditions, sending the report may still fail, for example if the HTTP Gateway is closed or the message doesn't reach the Gateway.
   * If Immediate is set to false, the report is sent based on the health client settings from the HTTP Gateway. Therefore, it will be batched according to the HealthReportSendInterval configuration.
   * This is the recommended setting because it allows the health client to optimize health reporting messages to health store as well as health report processing.
   * By default, reports are not sent immediately.
   */
  immediate?: boolean;
}

/** Optional parameters. */
export interface StartApplicationUpgradeOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface GetApplicationUpgradeOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getApplicationUpgrade operation. */
export type GetApplicationUpgradeResponse = ApplicationUpgradeProgressInfo;

/** Optional parameters. */
export interface UpdateApplicationUpgradeOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface UpdateApplicationOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface ResumeApplicationUpgradeOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface RollbackApplicationUpgradeOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface GetDeployedApplicationInfoListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The continuation token parameter is used to obtain next set of results. A continuation token with a non-empty value is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token does not contain a value. The value of this parameter should not be URL encoded. */
  continuationToken?: string;
  /** The maximum number of results to be returned as part of the paged queries. This parameter defines the upper bound on the number of results returned. The results returned can be less than the specified maximum results if they do not fit in the message as per the max message size restrictions defined in the configuration. If this parameter is zero or not specified, the paged query includes as many results as possible that fit in the return message. */
  maxResults?: number;
  /**
   * Include the health state of an entity.
   * If this parameter is false or not specified, then the health state returned is "Unknown".
   * When set to true, the query goes in parallel to the node and the health system service before the results are merged.
   * As a result, the query is more expensive and may take a longer time.
   */
  includeHealthState?: boolean;
}

/** Contains response data for the getDeployedApplicationInfoList operation. */
export type GetDeployedApplicationInfoListResponse = PagedDeployedApplicationInfoList;

/** Optional parameters. */
export interface GetDeployedApplicationInfoOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /**
   * Include the health state of an entity.
   * If this parameter is false or not specified, then the health state returned is "Unknown".
   * When set to true, the query goes in parallel to the node and the health system service before the results are merged.
   * As a result, the query is more expensive and may take a longer time.
   */
  includeHealthState?: boolean;
}

/** Contains response data for the getDeployedApplicationInfo operation. */
export type GetDeployedApplicationInfoResponse = DeployedApplicationInfo;

/** Optional parameters. */
export interface GetDeployedApplicationHealthOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /**
   * Allows filtering the collection of HealthEvent objects returned based on health state.
   * The possible values for this parameter include integer value of one of the following health states.
   * Only events that match the filter are returned. All events are used to evaluate the aggregated health state.
   * If not specified, all entries are returned. The state values are flag-based enumeration, so the value could be a combination of these values, obtained using the bitwise 'OR' operator. For example, If the provided value is 6 then all of the events with HealthState value of OK (2) and Warning (4) are returned.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  eventsHealthStateFilter?: number;
  /**
   * Indicates whether the health statistics should be returned as part of the query result. False by default.
   * The statistics show the number of children entities in health state Ok, Warning, and Error.
   */
  excludeHealthStatistics?: boolean;
  /**
   * Allows filtering of the deployed service package health state objects returned in the result of deployed application health query based on their health state.
   * The possible values for this parameter include integer value of one of the following health states.
   * Only deployed service packages that match the filter are returned. All deployed service packages are used to evaluate the aggregated health state of the deployed application.
   * If not specified, all entries are returned.
   * The state values are flag-based enumeration, so the value can be a combination of these values, obtained using the bitwise 'OR' operator.
   * For example, if the provided value is 6 then health state of service packages with HealthState value of OK (2) and Warning (4) are returned.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  deployedServicePackagesHealthStateFilter?: number;
}

/** Contains response data for the getDeployedApplicationHealth operation. */
export type GetDeployedApplicationHealthResponse = DeployedApplicationHealth;

/** Optional parameters. */
export interface GetDeployedApplicationHealthUsingPolicyOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /**
   * Allows filtering the collection of HealthEvent objects returned based on health state.
   * The possible values for this parameter include integer value of one of the following health states.
   * Only events that match the filter are returned. All events are used to evaluate the aggregated health state.
   * If not specified, all entries are returned. The state values are flag-based enumeration, so the value could be a combination of these values, obtained using the bitwise 'OR' operator. For example, If the provided value is 6 then all of the events with HealthState value of OK (2) and Warning (4) are returned.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  eventsHealthStateFilter?: number;
  /**
   * Indicates whether the health statistics should be returned as part of the query result. False by default.
   * The statistics show the number of children entities in health state Ok, Warning, and Error.
   */
  excludeHealthStatistics?: boolean;
  /**
   * Describes the health policies used to evaluate the health of an application or one of its children.
   * If not present, the health evaluation uses the health policy from application manifest or the default health policy.
   */
  applicationHealthPolicy?: ApplicationHealthPolicy;
  /**
   * Allows filtering of the deployed service package health state objects returned in the result of deployed application health query based on their health state.
   * The possible values for this parameter include integer value of one of the following health states.
   * Only deployed service packages that match the filter are returned. All deployed service packages are used to evaluate the aggregated health state of the deployed application.
   * If not specified, all entries are returned.
   * The state values are flag-based enumeration, so the value can be a combination of these values, obtained using the bitwise 'OR' operator.
   * For example, if the provided value is 6 then health state of service packages with HealthState value of OK (2) and Warning (4) are returned.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  deployedServicePackagesHealthStateFilter?: number;
}

/** Contains response data for the getDeployedApplicationHealthUsingPolicy operation. */
export type GetDeployedApplicationHealthUsingPolicyResponse = DeployedApplicationHealth;

/** Optional parameters. */
export interface ReportDeployedApplicationHealthOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /**
   * A flag that indicates whether the report should be sent immediately.
   * A health report is sent to a Service Fabric gateway Application, which forwards to the health store.
   * If Immediate is set to true, the report is sent immediately from HTTP Gateway to the health store, regardless of the fabric client settings that the HTTP Gateway Application is using.
   * This is useful for critical reports that should be sent as soon as possible.
   * Depending on timing and other conditions, sending the report may still fail, for example if the HTTP Gateway is closed or the message doesn't reach the Gateway.
   * If Immediate is set to false, the report is sent based on the health client settings from the HTTP Gateway. Therefore, it will be batched according to the HealthReportSendInterval configuration.
   * This is the recommended setting because it allows the health client to optimize health reporting messages to health store as well as health report processing.
   * By default, reports are not sent immediately.
   */
  immediate?: boolean;
}

/** Optional parameters. */
export interface GetApplicationManifestOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getApplicationManifest operation. */
export type GetApplicationManifestResponse = ApplicationTypeManifest;

/** Optional parameters. */
export interface GetServiceInfoListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The continuation token parameter is used to obtain next set of results. A continuation token with a non-empty value is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token does not contain a value. The value of this parameter should not be URL encoded. */
  continuationToken?: string;
  /** The service type name used to filter the services to query for. */
  serviceTypeName?: string;
}

/** Contains response data for the getServiceInfoList operation. */
export type GetServiceInfoListResponse = PagedServiceInfoList;

/** Optional parameters. */
export interface GetServiceInfoOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getServiceInfo operation. */
export type GetServiceInfoResponse = ServiceInfoUnion;

/** Optional parameters. */
export interface GetApplicationNameInfoOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getApplicationNameInfo operation. */
export type GetApplicationNameInfoResponse = ApplicationNameInfo;

/** Optional parameters. */
export interface CreateServiceOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface CreateServiceFromTemplateOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface DeleteServiceOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** Remove a Service Fabric application or service forcefully without going through the graceful shutdown sequence. This parameter can be used to forcefully delete an application or service for which delete is timing out due to issues in the service code that prevents graceful close of replicas. */
  forceRemove?: boolean;
}

/** Optional parameters. */
export interface UpdateServiceOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface GetServiceDescriptionOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getServiceDescription operation. */
export type GetServiceDescriptionResponse = ServiceDescriptionUnion;

/** Optional parameters. */
export interface GetServiceHealthOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /**
   * Allows filtering the collection of HealthEvent objects returned based on health state.
   * The possible values for this parameter include integer value of one of the following health states.
   * Only events that match the filter are returned. All events are used to evaluate the aggregated health state.
   * If not specified, all entries are returned. The state values are flag-based enumeration, so the value could be a combination of these values, obtained using the bitwise 'OR' operator. For example, If the provided value is 6 then all of the events with HealthState value of OK (2) and Warning (4) are returned.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  eventsHealthStateFilter?: number;
  /**
   * Indicates whether the health statistics should be returned as part of the query result. False by default.
   * The statistics show the number of children entities in health state Ok, Warning, and Error.
   */
  excludeHealthStatistics?: boolean;
  /**
   * Allows filtering of the partitions health state objects returned in the result of service health query based on their health state.
   * The possible values for this parameter include integer value of one of the following health states.
   * Only partitions that match the filter are returned. All partitions are used to evaluate the aggregated health state.
   * If not specified, all entries are returned. The state values are flag-based enumeration, so the value could be a combination of these value
   * obtained using bitwise 'OR' operator. For example, if the provided value is 6 then health state of partitions with HealthState value of OK (2) and Warning (4) will be returned.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  partitionsHealthStateFilter?: number;
}

/** Contains response data for the getServiceHealth operation. */
export type GetServiceHealthResponse = ServiceHealth;

/** Optional parameters. */
export interface GetServiceHealthUsingPolicyOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /**
   * Allows filtering the collection of HealthEvent objects returned based on health state.
   * The possible values for this parameter include integer value of one of the following health states.
   * Only events that match the filter are returned. All events are used to evaluate the aggregated health state.
   * If not specified, all entries are returned. The state values are flag-based enumeration, so the value could be a combination of these values, obtained using the bitwise 'OR' operator. For example, If the provided value is 6 then all of the events with HealthState value of OK (2) and Warning (4) are returned.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  eventsHealthStateFilter?: number;
  /**
   * Indicates whether the health statistics should be returned as part of the query result. False by default.
   * The statistics show the number of children entities in health state Ok, Warning, and Error.
   */
  excludeHealthStatistics?: boolean;
  /**
   * Describes the health policies used to evaluate the health of an application or one of its children.
   * If not present, the health evaluation uses the health policy from application manifest or the default health policy.
   */
  applicationHealthPolicy?: ApplicationHealthPolicy;
  /**
   * Allows filtering of the partitions health state objects returned in the result of service health query based on their health state.
   * The possible values for this parameter include integer value of one of the following health states.
   * Only partitions that match the filter are returned. All partitions are used to evaluate the aggregated health state.
   * If not specified, all entries are returned. The state values are flag-based enumeration, so the value could be a combination of these value
   * obtained using bitwise 'OR' operator. For example, if the provided value is 6 then health state of partitions with HealthState value of OK (2) and Warning (4) will be returned.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  partitionsHealthStateFilter?: number;
}

/** Contains response data for the getServiceHealthUsingPolicy operation. */
export type GetServiceHealthUsingPolicyResponse = ServiceHealth;

/** Optional parameters. */
export interface ReportServiceHealthOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /**
   * A flag that indicates whether the report should be sent immediately.
   * A health report is sent to a Service Fabric gateway Application, which forwards to the health store.
   * If Immediate is set to true, the report is sent immediately from HTTP Gateway to the health store, regardless of the fabric client settings that the HTTP Gateway Application is using.
   * This is useful for critical reports that should be sent as soon as possible.
   * Depending on timing and other conditions, sending the report may still fail, for example if the HTTP Gateway is closed or the message doesn't reach the Gateway.
   * If Immediate is set to false, the report is sent based on the health client settings from the HTTP Gateway. Therefore, it will be batched according to the HealthReportSendInterval configuration.
   * This is the recommended setting because it allows the health client to optimize health reporting messages to health store as well as health report processing.
   * By default, reports are not sent immediately.
   */
  immediate?: boolean;
}

/** Optional parameters. */
export interface ResolveServiceOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /**
   * Key type for the partition. This parameter is required if the partition scheme for the service is Int64Range or Named. The possible values are following.
   * - None (1) - Indicates that the PartitionKeyValue parameter is not specified. This is valid for the partitions with partitioning scheme as Singleton. This is the default value. The value is 1.
   * - Int64Range (2) - Indicates that the PartitionKeyValue parameter is an int64 partition key. This is valid for the partitions with partitioning scheme as Int64Range. The value is 2.
   * - Named (3) - Indicates that the PartitionKeyValue parameter is a name of the partition. This is valid for the partitions with partitioning scheme as Named. The value is 3.
   */
  partitionKeyType?: number;
  /**
   * Partition key. This is required if the partition scheme for the service is Int64Range or Named.
   * This is not the partition ID, but rather, either the integer key value, or the name of the partition ID.
   * For example, if your service is using ranged partitions from 0 to 10, then they PartitionKeyValue would be an
   * integer in that range. Query service description to see the range or name.
   */
  partitionKeyValue?: string;
  /** The value in the Version field of the response that was received previously. This is required if the user knows that the result that was gotten previously is stale. */
  previousRspVersion?: string;
}

/** Contains response data for the resolveService operation. */
export type ResolveServiceResponse = ResolvedServicePartition;

/** Optional parameters. */
export interface GetUnplacedReplicaInformationOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The identity of the partition. */
  partitionId?: string;
  /** Indicates that unplaced replica information will be queries only for primary replicas. */
  onlyQueryPrimaries?: boolean;
}

/** Contains response data for the getUnplacedReplicaInformation operation. */
export type GetUnplacedReplicaInformationResponse = UnplacedReplicaInformation;

/** Optional parameters. */
export interface GetLoadedPartitionInfoListOptionalParams
  extends coreClient.OperationOptions {
  /** The continuation token parameter is used to obtain next set of results. A continuation token with a non-empty value is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token does not contain a value. The value of this parameter should not be URL encoded. */
  continuationToken?: string;
  /** The maximum number of results to be returned as part of the paged queries. This parameter defines the upper bound on the number of results returned. The results returned can be less than the specified maximum results if they do not fit in the message as per the max message size restrictions defined in the configuration. If this parameter is zero or not specified, the paged query includes as many results as possible that fit in the return message. */
  maxResults?: number;
  /** The name of a service. */
  serviceName?: string;
  /** Ordering of partitions' load. */
  ordering?: Ordering;
}

/** Contains response data for the getLoadedPartitionInfoList operation. */
export type GetLoadedPartitionInfoListResponse = LoadedPartitionInformationResultList;

/** Optional parameters. */
export interface GetPartitionInfoListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The continuation token parameter is used to obtain next set of results. A continuation token with a non-empty value is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token does not contain a value. The value of this parameter should not be URL encoded. */
  continuationToken?: string;
}

/** Contains response data for the getPartitionInfoList operation. */
export type GetPartitionInfoListResponse = PagedServicePartitionInfoList;

/** Optional parameters. */
export interface GetPartitionInfoOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getPartitionInfo operation. */
export type GetPartitionInfoResponse = ServicePartitionInfoUnion;

/** Optional parameters. */
export interface GetServiceNameInfoOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getServiceNameInfo operation. */
export type GetServiceNameInfoResponse = ServiceNameInfo;

/** Optional parameters. */
export interface GetPartitionHealthOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /**
   * Allows filtering the collection of HealthEvent objects returned based on health state.
   * The possible values for this parameter include integer value of one of the following health states.
   * Only events that match the filter are returned. All events are used to evaluate the aggregated health state.
   * If not specified, all entries are returned. The state values are flag-based enumeration, so the value could be a combination of these values, obtained using the bitwise 'OR' operator. For example, If the provided value is 6 then all of the events with HealthState value of OK (2) and Warning (4) are returned.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  eventsHealthStateFilter?: number;
  /**
   * Indicates whether the health statistics should be returned as part of the query result. False by default.
   * The statistics show the number of children entities in health state Ok, Warning, and Error.
   */
  excludeHealthStatistics?: boolean;
  /**
   * Allows filtering the collection of ReplicaHealthState objects on the partition. The value can be obtained from members or bitwise operations on members of HealthStateFilter. Only replicas that match the filter will be returned. All replicas will be used to evaluate the aggregated health state. If not specified, all entries will be returned.The state values are flag-based enumeration, so the value could be a combination of these values obtained using bitwise 'OR' operator. For example, If the provided value is 6 then all of the events with HealthState value of OK (2) and Warning (4) will be returned. The possible values for this parameter include integer value of one of the following health states.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  replicasHealthStateFilter?: number;
}

/** Contains response data for the getPartitionHealth operation. */
export type GetPartitionHealthResponse = PartitionHealth;

/** Optional parameters. */
export interface GetPartitionHealthUsingPolicyOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /**
   * Allows filtering the collection of HealthEvent objects returned based on health state.
   * The possible values for this parameter include integer value of one of the following health states.
   * Only events that match the filter are returned. All events are used to evaluate the aggregated health state.
   * If not specified, all entries are returned. The state values are flag-based enumeration, so the value could be a combination of these values, obtained using the bitwise 'OR' operator. For example, If the provided value is 6 then all of the events with HealthState value of OK (2) and Warning (4) are returned.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  eventsHealthStateFilter?: number;
  /**
   * Indicates whether the health statistics should be returned as part of the query result. False by default.
   * The statistics show the number of children entities in health state Ok, Warning, and Error.
   */
  excludeHealthStatistics?: boolean;
  /**
   * Describes the health policies used to evaluate the health of an application or one of its children.
   * If not present, the health evaluation uses the health policy from application manifest or the default health policy.
   */
  applicationHealthPolicy?: ApplicationHealthPolicy;
  /**
   * Allows filtering the collection of ReplicaHealthState objects on the partition. The value can be obtained from members or bitwise operations on members of HealthStateFilter. Only replicas that match the filter will be returned. All replicas will be used to evaluate the aggregated health state. If not specified, all entries will be returned.The state values are flag-based enumeration, so the value could be a combination of these values obtained using bitwise 'OR' operator. For example, If the provided value is 6 then all of the events with HealthState value of OK (2) and Warning (4) will be returned. The possible values for this parameter include integer value of one of the following health states.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  replicasHealthStateFilter?: number;
}

/** Contains response data for the getPartitionHealthUsingPolicy operation. */
export type GetPartitionHealthUsingPolicyResponse = PartitionHealth;

/** Optional parameters. */
export interface ReportPartitionHealthOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /**
   * A flag that indicates whether the report should be sent immediately.
   * A health report is sent to a Service Fabric gateway Application, which forwards to the health store.
   * If Immediate is set to true, the report is sent immediately from HTTP Gateway to the health store, regardless of the fabric client settings that the HTTP Gateway Application is using.
   * This is useful for critical reports that should be sent as soon as possible.
   * Depending on timing and other conditions, sending the report may still fail, for example if the HTTP Gateway is closed or the message doesn't reach the Gateway.
   * If Immediate is set to false, the report is sent based on the health client settings from the HTTP Gateway. Therefore, it will be batched according to the HealthReportSendInterval configuration.
   * This is the recommended setting because it allows the health client to optimize health reporting messages to health store as well as health report processing.
   * By default, reports are not sent immediately.
   */
  immediate?: boolean;
}

/** Optional parameters. */
export interface GetPartitionLoadInformationOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getPartitionLoadInformation operation. */
export type GetPartitionLoadInformationResponse = PartitionLoadInformation;

/** Optional parameters. */
export interface ResetPartitionLoadOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface RecoverPartitionOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface RecoverServicePartitionsOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface RecoverSystemPartitionsOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface RecoverAllPartitionsOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface MovePrimaryReplicaOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The name of the node. */
  nodeName?: string;
  /** Ignore constraints when moving a replica or instance. If this parameter is not specified, all constraints are honored. */
  ignoreConstraints?: boolean;
}

/** Optional parameters. */
export interface MoveSecondaryReplicaOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** Ignore constraints when moving a replica or instance. If this parameter is not specified, all constraints are honored. */
  ignoreConstraints?: boolean;
  /** The name of the target node for secondary replica or instance move. If not specified, replica or instance is moved to a random node. */
  newNodeName?: string;
}

/** Optional parameters. */
export interface UpdatePartitionLoadOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The continuation token parameter is used to obtain next set of results. A continuation token with a non-empty value is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token does not contain a value. The value of this parameter should not be URL encoded. */
  continuationToken?: string;
  /** The maximum number of results to be returned as part of the paged queries. This parameter defines the upper bound on the number of results returned. The results returned can be less than the specified maximum results if they do not fit in the message as per the max message size restrictions defined in the configuration. If this parameter is zero or not specified, the paged query includes as many results as possible that fit in the return message. */
  maxResults?: number;
}

/** Contains response data for the updatePartitionLoad operation. */
export type UpdatePartitionLoadResponse = PagedUpdatePartitionLoadResultList;

/** Optional parameters. */
export interface MoveInstanceOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** Ignore constraints when moving a replica or instance. If this parameter is not specified, all constraints are honored. */
  ignoreConstraints?: boolean;
  /** The name of the target node for secondary replica or instance move. If not specified, replica or instance is moved to a random node. */
  newNodeName?: string;
  /** The name of the source node for instance move. If not specified, instance is moved from a random node. */
  currentNodeName?: string;
}

/** Optional parameters. */
export interface MoveAuxiliaryReplicaOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** Ignore constraints when moving a replica or instance. If this parameter is not specified, all constraints are honored. */
  ignoreConstraints?: boolean;
  /** The name of the target node for secondary replica or instance move. If not specified, replica or instance is moved to a random node. */
  newNodeName?: string;
  /** The name of the source node for instance move. If not specified, instance is moved from a random node. */
  currentNodeName?: string;
}

/** Optional parameters. */
export interface CreateRepairTaskOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the createRepairTask operation. */
export type CreateRepairTaskResponse = RepairTaskUpdateInfo;

/** Optional parameters. */
export interface CancelRepairTaskOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the cancelRepairTask operation. */
export type CancelRepairTaskResponse = RepairTaskUpdateInfo;

/** Optional parameters. */
export interface DeleteRepairTaskOptionalParams
  extends coreClient.OperationOptions {}

/** Optional parameters. */
export interface GetRepairTaskListOptionalParams
  extends coreClient.OperationOptions {
  /** The repair task ID prefix to be matched. */
  taskIdFilter?: string;
  /**
   * A bitwise-OR of the following values, specifying which task states should be included in the result list.
   *
   * - 1 - Created
   * - 2 - Claimed
   * - 4 - Preparing
   * - 8 - Approved
   * - 16 - Executing
   * - 32 - Restoring
   * - 64 - Completed
   */
  stateFilter?: number;
  /** The name of the repair executor whose claimed tasks should be included in the list. */
  executorFilter?: string;
}

/** Contains response data for the getRepairTaskList operation. */
export type GetRepairTaskListResponse = RepairTask[];

/** Optional parameters. */
export interface ForceApproveRepairTaskOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the forceApproveRepairTask operation. */
export type ForceApproveRepairTaskResponse = RepairTaskUpdateInfo;

/** Optional parameters. */
export interface UpdateRepairTaskHealthPolicyOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the updateRepairTaskHealthPolicy operation. */
export type UpdateRepairTaskHealthPolicyResponse = RepairTaskUpdateInfo;

/** Optional parameters. */
export interface UpdateRepairExecutionStateOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the updateRepairExecutionState operation. */
export type UpdateRepairExecutionStateResponse = RepairTaskUpdateInfo;

/** Optional parameters. */
export interface GetReplicaInfoListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The continuation token parameter is used to obtain next set of results. A continuation token with a non-empty value is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token does not contain a value. The value of this parameter should not be URL encoded. */
  continuationToken?: string;
}

/** Contains response data for the getReplicaInfoList operation. */
export type GetReplicaInfoListResponse = PagedReplicaInfoList;

/** Optional parameters. */
export interface GetReplicaInfoOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getReplicaInfo operation. */
export type GetReplicaInfoResponse = ReplicaInfoUnion;

/** Optional parameters. */
export interface GetReplicaHealthOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /**
   * Allows filtering the collection of HealthEvent objects returned based on health state.
   * The possible values for this parameter include integer value of one of the following health states.
   * Only events that match the filter are returned. All events are used to evaluate the aggregated health state.
   * If not specified, all entries are returned. The state values are flag-based enumeration, so the value could be a combination of these values, obtained using the bitwise 'OR' operator. For example, If the provided value is 6 then all of the events with HealthState value of OK (2) and Warning (4) are returned.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  eventsHealthStateFilter?: number;
}

/** Contains response data for the getReplicaHealth operation. */
export type GetReplicaHealthResponse = ReplicaHealthUnion;

/** Optional parameters. */
export interface GetReplicaHealthUsingPolicyOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /**
   * Allows filtering the collection of HealthEvent objects returned based on health state.
   * The possible values for this parameter include integer value of one of the following health states.
   * Only events that match the filter are returned. All events are used to evaluate the aggregated health state.
   * If not specified, all entries are returned. The state values are flag-based enumeration, so the value could be a combination of these values, obtained using the bitwise 'OR' operator. For example, If the provided value is 6 then all of the events with HealthState value of OK (2) and Warning (4) are returned.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  eventsHealthStateFilter?: number;
  /**
   * Describes the health policies used to evaluate the health of an application or one of its children.
   * If not present, the health evaluation uses the health policy from application manifest or the default health policy.
   */
  applicationHealthPolicy?: ApplicationHealthPolicy;
}

/** Contains response data for the getReplicaHealthUsingPolicy operation. */
export type GetReplicaHealthUsingPolicyResponse = ReplicaHealthUnion;

/** Optional parameters. */
export interface ReportReplicaHealthOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /**
   * A flag that indicates whether the report should be sent immediately.
   * A health report is sent to a Service Fabric gateway Application, which forwards to the health store.
   * If Immediate is set to true, the report is sent immediately from HTTP Gateway to the health store, regardless of the fabric client settings that the HTTP Gateway Application is using.
   * This is useful for critical reports that should be sent as soon as possible.
   * Depending on timing and other conditions, sending the report may still fail, for example if the HTTP Gateway is closed or the message doesn't reach the Gateway.
   * If Immediate is set to false, the report is sent based on the health client settings from the HTTP Gateway. Therefore, it will be batched according to the HealthReportSendInterval configuration.
   * This is the recommended setting because it allows the health client to optimize health reporting messages to health store as well as health report processing.
   * By default, reports are not sent immediately.
   */
  immediate?: boolean;
}

/** Optional parameters. */
export interface GetDeployedServiceReplicaInfoListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The name of a service manifest registered as part of an application type in a Service Fabric cluster. */
  serviceManifestName?: string;
  /** The identity of the partition. */
  partitionId?: string;
}

/** Contains response data for the getDeployedServiceReplicaInfoList operation. */
export type GetDeployedServiceReplicaInfoListResponse = DeployedServiceReplicaInfoUnion[];

/** Optional parameters. */
export interface GetDeployedServiceReplicaDetailInfoOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getDeployedServiceReplicaDetailInfo operation. */
export type GetDeployedServiceReplicaDetailInfoResponse = DeployedServiceReplicaDetailInfoUnion;

/** Optional parameters. */
export interface GetDeployedServiceReplicaDetailInfoByPartitionIdOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getDeployedServiceReplicaDetailInfoByPartitionId operation. */
export type GetDeployedServiceReplicaDetailInfoByPartitionIdResponse = DeployedServiceReplicaDetailInfoUnion;

/** Optional parameters. */
export interface RestartReplicaOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface RemoveReplicaOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** Remove a Service Fabric application or service forcefully without going through the graceful shutdown sequence. This parameter can be used to forcefully delete an application or service for which delete is timing out due to issues in the service code that prevents graceful close of replicas. */
  forceRemove?: boolean;
}

/** Optional parameters. */
export interface GetDeployedServicePackageInfoListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getDeployedServicePackageInfoList operation. */
export type GetDeployedServicePackageInfoListResponse = DeployedServicePackageInfo[];

/** Optional parameters. */
export interface GetDeployedServicePackageInfoListByNameOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getDeployedServicePackageInfoListByName operation. */
export type GetDeployedServicePackageInfoListByNameResponse = DeployedServicePackageInfo[];

/** Optional parameters. */
export interface GetDeployedServicePackageHealthOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /**
   * Allows filtering the collection of HealthEvent objects returned based on health state.
   * The possible values for this parameter include integer value of one of the following health states.
   * Only events that match the filter are returned. All events are used to evaluate the aggregated health state.
   * If not specified, all entries are returned. The state values are flag-based enumeration, so the value could be a combination of these values, obtained using the bitwise 'OR' operator. For example, If the provided value is 6 then all of the events with HealthState value of OK (2) and Warning (4) are returned.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  eventsHealthStateFilter?: number;
}

/** Contains response data for the getDeployedServicePackageHealth operation. */
export type GetDeployedServicePackageHealthResponse = DeployedServicePackageHealth;

/** Optional parameters. */
export interface GetDeployedServicePackageHealthUsingPolicyOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /**
   * Allows filtering the collection of HealthEvent objects returned based on health state.
   * The possible values for this parameter include integer value of one of the following health states.
   * Only events that match the filter are returned. All events are used to evaluate the aggregated health state.
   * If not specified, all entries are returned. The state values are flag-based enumeration, so the value could be a combination of these values, obtained using the bitwise 'OR' operator. For example, If the provided value is 6 then all of the events with HealthState value of OK (2) and Warning (4) are returned.
   *
   * - Default - Default value. Matches any HealthState. The value is zero.
   * - None - Filter that doesn't match any HealthState value. Used in order to return no results on a given collection of states. The value is 1.
   * - Ok - Filter that matches input with HealthState value Ok. The value is 2.
   * - Warning - Filter that matches input with HealthState value Warning. The value is 4.
   * - Error - Filter that matches input with HealthState value Error. The value is 8.
   * - All - Filter that matches input with any HealthState value. The value is 65535.
   */
  eventsHealthStateFilter?: number;
  /**
   * Describes the health policies used to evaluate the health of an application or one of its children.
   * If not present, the health evaluation uses the health policy from application manifest or the default health policy.
   */
  applicationHealthPolicy?: ApplicationHealthPolicy;
}

/** Contains response data for the getDeployedServicePackageHealthUsingPolicy operation. */
export type GetDeployedServicePackageHealthUsingPolicyResponse = DeployedServicePackageHealth;

/** Optional parameters. */
export interface ReportDeployedServicePackageHealthOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /**
   * A flag that indicates whether the report should be sent immediately.
   * A health report is sent to a Service Fabric gateway Application, which forwards to the health store.
   * If Immediate is set to true, the report is sent immediately from HTTP Gateway to the health store, regardless of the fabric client settings that the HTTP Gateway Application is using.
   * This is useful for critical reports that should be sent as soon as possible.
   * Depending on timing and other conditions, sending the report may still fail, for example if the HTTP Gateway is closed or the message doesn't reach the Gateway.
   * If Immediate is set to false, the report is sent based on the health client settings from the HTTP Gateway. Therefore, it will be batched according to the HealthReportSendInterval configuration.
   * This is the recommended setting because it allows the health client to optimize health reporting messages to health store as well as health report processing.
   * By default, reports are not sent immediately.
   */
  immediate?: boolean;
}

/** Optional parameters. */
export interface DeployServicePackageToNodeOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface GetDeployedCodePackageInfoListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The name of a service manifest registered as part of an application type in a Service Fabric cluster. */
  serviceManifestName?: string;
  /** The name of code package specified in service manifest registered as part of an application type in a Service Fabric cluster. */
  codePackageName?: string;
}

/** Contains response data for the getDeployedCodePackageInfoList operation. */
export type GetDeployedCodePackageInfoListResponse = DeployedCodePackageInfo[];

/** Optional parameters. */
export interface RestartDeployedCodePackageOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface GetContainerLogsDeployedOnNodeOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** Number of lines to show from the end of the logs. Default is 100. 'all' to show the complete logs. */
  tail?: string;
  /** Specifies whether to get container logs from exited/dead containers of the code package instance. */
  previous?: boolean;
}

/** Contains response data for the getContainerLogsDeployedOnNode operation. */
export type GetContainerLogsDeployedOnNodeResponse = ContainerLogs;

/** Optional parameters. */
export interface InvokeContainerApiOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the invokeContainerApi operation. */
export type InvokeContainerApiResponse = ContainerApiResponse;

/** Optional parameters. */
export interface CreateComposeDeploymentOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface GetComposeDeploymentStatusOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getComposeDeploymentStatus operation. */
export type GetComposeDeploymentStatusResponse = ComposeDeploymentStatusInfo;

/** Optional parameters. */
export interface GetComposeDeploymentStatusListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The continuation token parameter is used to obtain next set of results. A continuation token with a non-empty value is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token does not contain a value. The value of this parameter should not be URL encoded. */
  continuationToken?: string;
  /** The maximum number of results to be returned as part of the paged queries. This parameter defines the upper bound on the number of results returned. The results returned can be less than the specified maximum results if they do not fit in the message as per the max message size restrictions defined in the configuration. If this parameter is zero or not specified, the paged query includes as many results as possible that fit in the return message. */
  maxResults?: number;
}

/** Contains response data for the getComposeDeploymentStatusList operation. */
export type GetComposeDeploymentStatusListResponse = PagedComposeDeploymentStatusInfoList;

/** Optional parameters. */
export interface GetComposeDeploymentUpgradeProgressOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getComposeDeploymentUpgradeProgress operation. */
export type GetComposeDeploymentUpgradeProgressResponse = ComposeDeploymentUpgradeProgressInfo;

/** Optional parameters. */
export interface RemoveComposeDeploymentOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface StartComposeDeploymentUpgradeOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface StartRollbackComposeDeploymentUpgradeOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface GetChaosOptionalParams extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getChaos operation. */
export type GetChaosResponse = Chaos;

/** Optional parameters. */
export interface StartChaosOptionalParams extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface StopChaosOptionalParams extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface GetChaosEventsOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The continuation token parameter is used to obtain next set of results. A continuation token with a non-empty value is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token does not contain a value. The value of this parameter should not be URL encoded. */
  continuationToken?: string;
  /** The maximum number of results to be returned as part of the paged queries. This parameter defines the upper bound on the number of results returned. The results returned can be less than the specified maximum results if they do not fit in the message as per the max message size restrictions defined in the configuration. If this parameter is zero or not specified, the paged query includes as many results as possible that fit in the return message. */
  maxResults?: number;
  /** The Windows file time representing the start time of the time range for which a Chaos report is to be generated. Consult [DateTime.ToFileTimeUtc Method](https://msdn.microsoft.com/library/system.datetime.tofiletimeutc(v=vs.110).aspx) for details. */
  startTimeUtc?: string;
  /** The Windows file time representing the end time of the time range for which a Chaos report is to be generated. Consult [DateTime.ToFileTimeUtc Method](https://msdn.microsoft.com/library/system.datetime.tofiletimeutc(v=vs.110).aspx) for details. */
  endTimeUtc?: string;
}

/** Contains response data for the getChaosEvents operation. */
export type GetChaosEventsResponse = ChaosEventsSegment;

/** Optional parameters. */
export interface GetChaosScheduleOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getChaosSchedule operation. */
export type GetChaosScheduleResponse = ChaosScheduleDescription;

/** Optional parameters. */
export interface PostChaosScheduleOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface UploadFileOptionalParams extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface GetImageStoreContentOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getImageStoreContent operation. */
export type GetImageStoreContentResponse = ImageStoreContent;

/** Optional parameters. */
export interface DeleteImageStoreContentOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface GetImageStoreRootContentOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getImageStoreRootContent operation. */
export type GetImageStoreRootContentResponse = ImageStoreContent;

/** Optional parameters. */
export interface CopyImageStoreContentOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface DeleteImageStoreUploadSessionOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface CommitImageStoreUploadSessionOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface GetImageStoreUploadSessionByIdOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getImageStoreUploadSessionById operation. */
export type GetImageStoreUploadSessionByIdResponse = UploadSession;

/** Optional parameters. */
export interface GetImageStoreUploadSessionByPathOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getImageStoreUploadSessionByPath operation. */
export type GetImageStoreUploadSessionByPathResponse = UploadSession;

/** Optional parameters. */
export interface UploadFileChunkOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface GetImageStoreRootFolderSizeOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getImageStoreRootFolderSize operation. */
export type GetImageStoreRootFolderSizeResponse = FolderSizeInfo;

/** Optional parameters. */
export interface GetImageStoreFolderSizeOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getImageStoreFolderSize operation. */
export type GetImageStoreFolderSizeResponse = FolderSizeInfo;

/** Optional parameters. */
export interface GetImageStoreInfoOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getImageStoreInfo operation. */
export type GetImageStoreInfoResponse = ImageStoreInfo;

/** Optional parameters. */
export interface InvokeInfrastructureCommandOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The identity of the infrastructure service. This is the full name of the infrastructure service without the 'fabric:' URI scheme. This parameter required only for the cluster that has more than one instance of infrastructure service running. */
  serviceId?: string;
}

/** Contains response data for the invokeInfrastructureCommand operation. */
export type InvokeInfrastructureCommandResponse = {
  /** The parsed response body. */
  body: string;
};

/** Optional parameters. */
export interface InvokeInfrastructureQueryOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The identity of the infrastructure service. This is the full name of the infrastructure service without the 'fabric:' URI scheme. This parameter required only for the cluster that has more than one instance of infrastructure service running. */
  serviceId?: string;
}

/** Contains response data for the invokeInfrastructureQuery operation. */
export type InvokeInfrastructureQueryResponse = {
  /** The parsed response body. */
  body: string;
};

/** Optional parameters. */
export interface StartDataLossOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface GetDataLossProgressOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getDataLossProgress operation. */
export type GetDataLossProgressResponse = PartitionDataLossProgress;

/** Optional parameters. */
export interface StartQuorumLossOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface GetQuorumLossProgressOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getQuorumLossProgress operation. */
export type GetQuorumLossProgressResponse = PartitionQuorumLossProgress;

/** Optional parameters. */
export interface StartPartitionRestartOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface GetPartitionRestartProgressOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getPartitionRestartProgress operation. */
export type GetPartitionRestartProgressResponse = PartitionRestartProgress;

/** Optional parameters. */
export interface StartNodeTransitionOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface GetNodeTransitionProgressOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getNodeTransitionProgress operation. */
export type GetNodeTransitionProgressResponse = NodeTransitionProgress;

/** Optional parameters. */
export interface GetFaultOperationListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getFaultOperationList operation. */
export type GetFaultOperationListResponse = OperationStatus[];

/** Optional parameters. */
export interface CancelOperationOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface CreateBackupPolicyOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** Specifies whether to validate the storage connection and credentials before creating or updating the backup policies. */
  validateConnection?: boolean;
}

/** Optional parameters. */
export interface DeleteBackupPolicyOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface GetBackupPolicyListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The continuation token parameter is used to obtain next set of results. A continuation token with a non-empty value is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token does not contain a value. The value of this parameter should not be URL encoded. */
  continuationToken?: string;
  /** The maximum number of results to be returned as part of the paged queries. This parameter defines the upper bound on the number of results returned. The results returned can be less than the specified maximum results if they do not fit in the message as per the max message size restrictions defined in the configuration. If this parameter is zero or not specified, the paged query includes as many results as possible that fit in the return message. */
  maxResults?: number;
}

/** Contains response data for the getBackupPolicyList operation. */
export type GetBackupPolicyListResponse = PagedBackupPolicyDescriptionList;

/** Optional parameters. */
export interface GetBackupPolicyByNameOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getBackupPolicyByName operation. */
export type GetBackupPolicyByNameResponse = BackupPolicyDescription;

/** Optional parameters. */
export interface GetAllEntitiesBackedUpByPolicyOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The continuation token parameter is used to obtain next set of results. A continuation token with a non-empty value is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token does not contain a value. The value of this parameter should not be URL encoded. */
  continuationToken?: string;
  /** The maximum number of results to be returned as part of the paged queries. This parameter defines the upper bound on the number of results returned. The results returned can be less than the specified maximum results if they do not fit in the message as per the max message size restrictions defined in the configuration. If this parameter is zero or not specified, the paged query includes as many results as possible that fit in the return message. */
  maxResults?: number;
}

/** Contains response data for the getAllEntitiesBackedUpByPolicy operation. */
export type GetAllEntitiesBackedUpByPolicyResponse = PagedBackupEntityList;

/** Optional parameters. */
export interface UpdateBackupPolicyOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** Specifies whether to validate the storage connection and credentials before creating or updating the backup policies. */
  validateConnection?: boolean;
}

/** Optional parameters. */
export interface EnableApplicationBackupOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface DisableApplicationBackupOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** Specifies the parameters to disable backup for any backup entity. */
  disableBackupDescription?: DisableBackupDescription;
}

/** Optional parameters. */
export interface GetApplicationBackupConfigurationInfoOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The continuation token parameter is used to obtain next set of results. A continuation token with a non-empty value is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token does not contain a value. The value of this parameter should not be URL encoded. */
  continuationToken?: string;
  /** The maximum number of results to be returned as part of the paged queries. This parameter defines the upper bound on the number of results returned. The results returned can be less than the specified maximum results if they do not fit in the message as per the max message size restrictions defined in the configuration. If this parameter is zero or not specified, the paged query includes as many results as possible that fit in the return message. */
  maxResults?: number;
}

/** Contains response data for the getApplicationBackupConfigurationInfo operation. */
export type GetApplicationBackupConfigurationInfoResponse = PagedBackupConfigurationInfoList;

/** Optional parameters. */
export interface GetApplicationBackupListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The continuation token parameter is used to obtain next set of results. A continuation token with a non-empty value is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token does not contain a value. The value of this parameter should not be URL encoded. */
  continuationToken?: string;
  /** The maximum number of results to be returned as part of the paged queries. This parameter defines the upper bound on the number of results returned. The results returned can be less than the specified maximum results if they do not fit in the message as per the max message size restrictions defined in the configuration. If this parameter is zero or not specified, the paged query includes as many results as possible that fit in the return message. */
  maxResults?: number;
  /** Specifies whether to get only the most recent backup available for a partition for the specified time range. */
  latest?: boolean;
  /** Specify the start date time from which to enumerate backups, in datetime format. The date time must be specified in ISO8601 format. This is an optional parameter. If not specified, all backups from the beginning are enumerated. */
  startDateTimeFilter?: Date;
  /** Specify the end date time till which to enumerate backups, in datetime format. The date time must be specified in ISO8601 format. This is an optional parameter. If not specified, enumeration is done till the most recent backup. */
  endDateTimeFilter?: Date;
}

/** Contains response data for the getApplicationBackupList operation. */
export type GetApplicationBackupListResponse = PagedBackupInfoList;

/** Optional parameters. */
export interface SuspendApplicationBackupOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface ResumeApplicationBackupOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface EnableServiceBackupOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface DisableServiceBackupOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** Specifies the parameters to disable backup for any backup entity. */
  disableBackupDescription?: DisableBackupDescription;
}

/** Optional parameters. */
export interface GetServiceBackupConfigurationInfoOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The continuation token parameter is used to obtain next set of results. A continuation token with a non-empty value is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token does not contain a value. The value of this parameter should not be URL encoded. */
  continuationToken?: string;
  /** The maximum number of results to be returned as part of the paged queries. This parameter defines the upper bound on the number of results returned. The results returned can be less than the specified maximum results if they do not fit in the message as per the max message size restrictions defined in the configuration. If this parameter is zero or not specified, the paged query includes as many results as possible that fit in the return message. */
  maxResults?: number;
}

/** Contains response data for the getServiceBackupConfigurationInfo operation. */
export type GetServiceBackupConfigurationInfoResponse = PagedBackupConfigurationInfoList;

/** Optional parameters. */
export interface GetServiceBackupListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The continuation token parameter is used to obtain next set of results. A continuation token with a non-empty value is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token does not contain a value. The value of this parameter should not be URL encoded. */
  continuationToken?: string;
  /** The maximum number of results to be returned as part of the paged queries. This parameter defines the upper bound on the number of results returned. The results returned can be less than the specified maximum results if they do not fit in the message as per the max message size restrictions defined in the configuration. If this parameter is zero or not specified, the paged query includes as many results as possible that fit in the return message. */
  maxResults?: number;
  /** Specifies whether to get only the most recent backup available for a partition for the specified time range. */
  latest?: boolean;
  /** Specify the start date time from which to enumerate backups, in datetime format. The date time must be specified in ISO8601 format. This is an optional parameter. If not specified, all backups from the beginning are enumerated. */
  startDateTimeFilter?: Date;
  /** Specify the end date time till which to enumerate backups, in datetime format. The date time must be specified in ISO8601 format. This is an optional parameter. If not specified, enumeration is done till the most recent backup. */
  endDateTimeFilter?: Date;
}

/** Contains response data for the getServiceBackupList operation. */
export type GetServiceBackupListResponse = PagedBackupInfoList;

/** Optional parameters. */
export interface SuspendServiceBackupOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface ResumeServiceBackupOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface EnablePartitionBackupOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface DisablePartitionBackupOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** Specifies the parameters to disable backup for any backup entity. */
  disableBackupDescription?: DisableBackupDescription;
}

/** Optional parameters. */
export interface GetPartitionBackupConfigurationInfoOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getPartitionBackupConfigurationInfo operation. */
export type GetPartitionBackupConfigurationInfoResponse = PartitionBackupConfigurationInfo;

/** Optional parameters. */
export interface GetPartitionBackupListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** Specifies whether to get only the most recent backup available for a partition for the specified time range. */
  latest?: boolean;
  /** Specify the start date time from which to enumerate backups, in datetime format. The date time must be specified in ISO8601 format. This is an optional parameter. If not specified, all backups from the beginning are enumerated. */
  startDateTimeFilter?: Date;
  /** Specify the end date time till which to enumerate backups, in datetime format. The date time must be specified in ISO8601 format. This is an optional parameter. If not specified, enumeration is done till the most recent backup. */
  endDateTimeFilter?: Date;
}

/** Contains response data for the getPartitionBackupList operation. */
export type GetPartitionBackupListResponse = PagedBackupInfoList;

/** Optional parameters. */
export interface SuspendPartitionBackupOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface ResumePartitionBackupOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface BackupPartitionOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** Describes the parameters to backup the partition now. If not present, backup operation uses default parameters from the backup policy current associated with this partition. */
  backupPartitionDescription?: BackupPartitionDescription;
  /** Specifies the maximum amount of time, in minutes, to wait for the backup operation to complete. Post that, the operation completes with timeout error. However, in certain corner cases it could be that though the operation returns back timeout, the backup actually goes through. In case of timeout error, its recommended to invoke this operation again with a greater timeout value. The default value for the same is 10 minutes. */
  backupTimeout?: number;
}

/** Optional parameters. */
export interface GetPartitionBackupProgressOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getPartitionBackupProgress operation. */
export type GetPartitionBackupProgressResponse = BackupProgressInfo;

/** Optional parameters. */
export interface RestorePartitionOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** Specifies the maximum amount of time to wait, in minutes, for the restore operation to complete. Post that, the operation returns back with timeout error. However, in certain corner cases it could be that the restore operation goes through even though it completes with timeout. In case of timeout error, its recommended to invoke this operation again with a greater timeout value. the default value for the same is 10 minutes. */
  restoreTimeout?: number;
}

/** Optional parameters. */
export interface GetPartitionRestoreProgressOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getPartitionRestoreProgress operation. */
export type GetPartitionRestoreProgressResponse = RestoreProgressInfo;

/** Optional parameters. */
export interface GetBackupsFromBackupLocationOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The continuation token parameter is used to obtain next set of results. A continuation token with a non-empty value is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token does not contain a value. The value of this parameter should not be URL encoded. */
  continuationToken?: string;
  /** The maximum number of results to be returned as part of the paged queries. This parameter defines the upper bound on the number of results returned. The results returned can be less than the specified maximum results if they do not fit in the message as per the max message size restrictions defined in the configuration. If this parameter is zero or not specified, the paged query includes as many results as possible that fit in the return message. */
  maxResults?: number;
}

/** Contains response data for the getBackupsFromBackupLocation operation. */
export type GetBackupsFromBackupLocationResponse = PagedBackupInfoList;

/** Optional parameters. */
export interface CreateNameOptionalParams extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface GetNameExistsInfoOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface DeleteNameOptionalParams extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface GetSubNameInfoListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The continuation token parameter is used to obtain next set of results. A continuation token with a non-empty value is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token does not contain a value. The value of this parameter should not be URL encoded. */
  continuationToken?: string;
  /** Allows specifying that the search performed should be recursive. */
  recursive?: boolean;
}

/** Contains response data for the getSubNameInfoList operation. */
export type GetSubNameInfoListResponse = PagedSubNameInfoList;

/** Optional parameters. */
export interface GetPropertyInfoListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** The continuation token parameter is used to obtain next set of results. A continuation token with a non-empty value is included in the response of the API when the results from the system do not fit in a single response. When this value is passed to the next API call, the API returns next set of results. If there are no further results, then the continuation token does not contain a value. The value of this parameter should not be URL encoded. */
  continuationToken?: string;
  /** Allows specifying whether to include the values of the properties returned. True if values should be returned with the metadata; False to return only property metadata. */
  includeValues?: boolean;
}

/** Contains response data for the getPropertyInfoList operation. */
export type GetPropertyInfoListResponse = PagedPropertyInfoList;

/** Optional parameters. */
export interface PutPropertyOptionalParams extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface GetPropertyInfoOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getPropertyInfo operation. */
export type GetPropertyInfoResponse = PropertyInfo;

/** Optional parameters. */
export interface DeletePropertyOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Optional parameters. */
export interface SubmitPropertyBatchOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the submitPropertyBatch operation. */
export type SubmitPropertyBatchResponse = SuccessfulPropertyBatchInfo;

/** Optional parameters. */
export interface GetClusterEventListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** This is a comma separated string specifying the types of FabricEvents that should only be included in the response. */
  eventsTypesFilter?: string;
  /** This param disables the retrieval of AnalysisEvents if true is passed. */
  excludeAnalysisEvents?: boolean;
  /** This param disables the search of CorrelatedEvents information if true is passed. otherwise the CorrelationEvents get processed and HasCorrelatedEvents field in every FabricEvent gets populated. */
  skipCorrelationLookup?: boolean;
}

/** Contains response data for the getClusterEventList operation. */
export type GetClusterEventListResponse = ClusterEventUnion[];

/** Optional parameters. */
export interface GetContainersEventListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** This is a comma separated string specifying the types of FabricEvents that should only be included in the response. */
  eventsTypesFilter?: string;
  /** This param disables the retrieval of AnalysisEvents if true is passed. */
  excludeAnalysisEvents?: boolean;
  /** This param disables the search of CorrelatedEvents information if true is passed. otherwise the CorrelationEvents get processed and HasCorrelatedEvents field in every FabricEvent gets populated. */
  skipCorrelationLookup?: boolean;
}

/** Contains response data for the getContainersEventList operation. */
export type GetContainersEventListResponse = ContainerInstanceEvent[];

/** Optional parameters. */
export interface GetNodeEventListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** This is a comma separated string specifying the types of FabricEvents that should only be included in the response. */
  eventsTypesFilter?: string;
  /** This param disables the retrieval of AnalysisEvents if true is passed. */
  excludeAnalysisEvents?: boolean;
  /** This param disables the search of CorrelatedEvents information if true is passed. otherwise the CorrelationEvents get processed and HasCorrelatedEvents field in every FabricEvent gets populated. */
  skipCorrelationLookup?: boolean;
}

/** Contains response data for the getNodeEventList operation. */
export type GetNodeEventListResponse = NodeEventUnion[];

/** Optional parameters. */
export interface GetNodesEventListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** This is a comma separated string specifying the types of FabricEvents that should only be included in the response. */
  eventsTypesFilter?: string;
  /** This param disables the retrieval of AnalysisEvents if true is passed. */
  excludeAnalysisEvents?: boolean;
  /** This param disables the search of CorrelatedEvents information if true is passed. otherwise the CorrelationEvents get processed and HasCorrelatedEvents field in every FabricEvent gets populated. */
  skipCorrelationLookup?: boolean;
}

/** Contains response data for the getNodesEventList operation. */
export type GetNodesEventListResponse = NodeEventUnion[];

/** Optional parameters. */
export interface GetApplicationEventListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** This is a comma separated string specifying the types of FabricEvents that should only be included in the response. */
  eventsTypesFilter?: string;
  /** This param disables the retrieval of AnalysisEvents if true is passed. */
  excludeAnalysisEvents?: boolean;
  /** This param disables the search of CorrelatedEvents information if true is passed. otherwise the CorrelationEvents get processed and HasCorrelatedEvents field in every FabricEvent gets populated. */
  skipCorrelationLookup?: boolean;
}

/** Contains response data for the getApplicationEventList operation. */
export type GetApplicationEventListResponse = ApplicationEventUnion[];

/** Optional parameters. */
export interface GetApplicationsEventListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** This is a comma separated string specifying the types of FabricEvents that should only be included in the response. */
  eventsTypesFilter?: string;
  /** This param disables the retrieval of AnalysisEvents if true is passed. */
  excludeAnalysisEvents?: boolean;
  /** This param disables the search of CorrelatedEvents information if true is passed. otherwise the CorrelationEvents get processed and HasCorrelatedEvents field in every FabricEvent gets populated. */
  skipCorrelationLookup?: boolean;
}

/** Contains response data for the getApplicationsEventList operation. */
export type GetApplicationsEventListResponse = ApplicationEventUnion[];

/** Optional parameters. */
export interface GetServiceEventListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** This is a comma separated string specifying the types of FabricEvents that should only be included in the response. */
  eventsTypesFilter?: string;
  /** This param disables the retrieval of AnalysisEvents if true is passed. */
  excludeAnalysisEvents?: boolean;
  /** This param disables the search of CorrelatedEvents information if true is passed. otherwise the CorrelationEvents get processed and HasCorrelatedEvents field in every FabricEvent gets populated. */
  skipCorrelationLookup?: boolean;
}

/** Contains response data for the getServiceEventList operation. */
export type GetServiceEventListResponse = ServiceEventUnion[];

/** Optional parameters. */
export interface GetServicesEventListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** This is a comma separated string specifying the types of FabricEvents that should only be included in the response. */
  eventsTypesFilter?: string;
  /** This param disables the retrieval of AnalysisEvents if true is passed. */
  excludeAnalysisEvents?: boolean;
  /** This param disables the search of CorrelatedEvents information if true is passed. otherwise the CorrelationEvents get processed and HasCorrelatedEvents field in every FabricEvent gets populated. */
  skipCorrelationLookup?: boolean;
}

/** Contains response data for the getServicesEventList operation. */
export type GetServicesEventListResponse = ServiceEventUnion[];

/** Optional parameters. */
export interface GetPartitionEventListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** This is a comma separated string specifying the types of FabricEvents that should only be included in the response. */
  eventsTypesFilter?: string;
  /** This param disables the retrieval of AnalysisEvents if true is passed. */
  excludeAnalysisEvents?: boolean;
  /** This param disables the search of CorrelatedEvents information if true is passed. otherwise the CorrelationEvents get processed and HasCorrelatedEvents field in every FabricEvent gets populated. */
  skipCorrelationLookup?: boolean;
}

/** Contains response data for the getPartitionEventList operation. */
export type GetPartitionEventListResponse = PartitionEventUnion[];

/** Optional parameters. */
export interface GetPartitionsEventListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** This is a comma separated string specifying the types of FabricEvents that should only be included in the response. */
  eventsTypesFilter?: string;
  /** This param disables the retrieval of AnalysisEvents if true is passed. */
  excludeAnalysisEvents?: boolean;
  /** This param disables the search of CorrelatedEvents information if true is passed. otherwise the CorrelationEvents get processed and HasCorrelatedEvents field in every FabricEvent gets populated. */
  skipCorrelationLookup?: boolean;
}

/** Contains response data for the getPartitionsEventList operation. */
export type GetPartitionsEventListResponse = PartitionEventUnion[];

/** Optional parameters. */
export interface GetPartitionReplicaEventListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** This is a comma separated string specifying the types of FabricEvents that should only be included in the response. */
  eventsTypesFilter?: string;
  /** This param disables the retrieval of AnalysisEvents if true is passed. */
  excludeAnalysisEvents?: boolean;
  /** This param disables the search of CorrelatedEvents information if true is passed. otherwise the CorrelationEvents get processed and HasCorrelatedEvents field in every FabricEvent gets populated. */
  skipCorrelationLookup?: boolean;
}

/** Contains response data for the getPartitionReplicaEventList operation. */
export type GetPartitionReplicaEventListResponse = ReplicaEventUnion[];

/** Optional parameters. */
export interface GetPartitionReplicasEventListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
  /** This is a comma separated string specifying the types of FabricEvents that should only be included in the response. */
  eventsTypesFilter?: string;
  /** This param disables the retrieval of AnalysisEvents if true is passed. */
  excludeAnalysisEvents?: boolean;
  /** This param disables the search of CorrelatedEvents information if true is passed. otherwise the CorrelationEvents get processed and HasCorrelatedEvents field in every FabricEvent gets populated. */
  skipCorrelationLookup?: boolean;
}

/** Contains response data for the getPartitionReplicasEventList operation. */
export type GetPartitionReplicasEventListResponse = ReplicaEventUnion[];

/** Optional parameters. */
export interface GetCorrelatedEventListOptionalParams
  extends coreClient.OperationOptions {
  /** The server timeout for performing the operation in seconds. This timeout specifies the time duration that the client is willing to wait for the requested operation to complete. The default value for this parameter is 60 seconds. */
  timeout?: number;
}

/** Contains response data for the getCorrelatedEventList operation. */
export type GetCorrelatedEventListResponse = FabricEventUnion[];

/** Optional parameters. */
export interface MeshSecretCreateOrUpdateOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the createOrUpdate operation. */
export type MeshSecretCreateOrUpdateResponse = SecretResourceDescription;

/** Optional parameters. */
export interface MeshSecretGetOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the get operation. */
export type MeshSecretGetResponse = SecretResourceDescription;

/** Optional parameters. */
export interface MeshSecretDeleteOptionalParams
  extends coreClient.OperationOptions {}

/** Optional parameters. */
export interface MeshSecretListOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the list operation. */
export type MeshSecretListResponse = PagedSecretResourceDescriptionList;

/** Optional parameters. */
export interface MeshSecretValueAddValueOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the addValue operation. */
export type MeshSecretValueAddValueResponse = SecretValueResourceDescription;

/** Optional parameters. */
export interface MeshSecretValueGetOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the get operation. */
export type MeshSecretValueGetResponse = SecretValueResourceDescription;

/** Optional parameters. */
export interface MeshSecretValueDeleteOptionalParams
  extends coreClient.OperationOptions {}

/** Optional parameters. */
export interface MeshSecretValueListOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the list operation. */
export type MeshSecretValueListResponse = PagedSecretValueResourceDescriptionList;

/** Optional parameters. */
export interface MeshSecretValueShowOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the show operation. */
export type MeshSecretValueShowResponse = SecretValue;

/** Optional parameters. */
export interface MeshVolumeCreateOrUpdateOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the createOrUpdate operation. */
export type MeshVolumeCreateOrUpdateResponse = VolumeResourceDescription;

/** Optional parameters. */
export interface MeshVolumeGetOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the get operation. */
export type MeshVolumeGetResponse = VolumeResourceDescription;

/** Optional parameters. */
export interface MeshVolumeDeleteOptionalParams
  extends coreClient.OperationOptions {}

/** Optional parameters. */
export interface MeshVolumeListOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the list operation. */
export type MeshVolumeListResponse = PagedVolumeResourceDescriptionList;

/** Optional parameters. */
export interface MeshNetworkCreateOrUpdateOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the createOrUpdate operation. */
export type MeshNetworkCreateOrUpdateResponse = NetworkResourceDescription;

/** Optional parameters. */
export interface MeshNetworkGetOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the get operation. */
export type MeshNetworkGetResponse = NetworkResourceDescription;

/** Optional parameters. */
export interface MeshNetworkDeleteOptionalParams
  extends coreClient.OperationOptions {}

/** Optional parameters. */
export interface MeshNetworkListOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the list operation. */
export type MeshNetworkListResponse = PagedNetworkResourceDescriptionList;

/** Optional parameters. */
export interface MeshApplicationCreateOrUpdateOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the createOrUpdate operation. */
export type MeshApplicationCreateOrUpdateResponse = ApplicationResourceDescription;

/** Optional parameters. */
export interface MeshApplicationGetOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the get operation. */
export type MeshApplicationGetResponse = ApplicationResourceDescription;

/** Optional parameters. */
export interface MeshApplicationDeleteOptionalParams
  extends coreClient.OperationOptions {}

/** Optional parameters. */
export interface MeshApplicationListOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the list operation. */
export type MeshApplicationListResponse = PagedApplicationResourceDescriptionList;

/** Optional parameters. */
export interface MeshApplicationGetUpgradeProgressOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the getUpgradeProgress operation. */
export type MeshApplicationGetUpgradeProgressResponse = ApplicationResourceUpgradeProgressInfo;

/** Optional parameters. */
export interface MeshServiceGetOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the get operation. */
export type MeshServiceGetResponse = ServiceResourceDescription;

/** Optional parameters. */
export interface MeshServiceListOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the list operation. */
export type MeshServiceListResponse = PagedServiceResourceDescriptionList;

/** Optional parameters. */
export interface MeshCodePackageGetContainerLogsOptionalParams
  extends coreClient.OperationOptions {
  /** Number of lines to show from the end of the logs. Default is 100. 'all' to show the complete logs. */
  tail?: string;
}

/** Contains response data for the getContainerLogs operation. */
export type MeshCodePackageGetContainerLogsResponse = ContainerLogs;

/** Optional parameters. */
export interface MeshServiceReplicaGetOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the get operation. */
export type MeshServiceReplicaGetResponse = ServiceReplicaDescription;

/** Optional parameters. */
export interface MeshServiceReplicaListOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the list operation. */
export type MeshServiceReplicaListResponse = PagedServiceReplicaDescriptionList;

/** Optional parameters. */
export interface MeshGatewayCreateOrUpdateOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the createOrUpdate operation. */
export type MeshGatewayCreateOrUpdateResponse = GatewayResourceDescription;

/** Optional parameters. */
export interface MeshGatewayGetOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the get operation. */
export type MeshGatewayGetResponse = GatewayResourceDescription;

/** Optional parameters. */
export interface MeshGatewayDeleteOptionalParams
  extends coreClient.OperationOptions {}

/** Optional parameters. */
export interface MeshGatewayListOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the list operation. */
export type MeshGatewayListResponse = PagedGatewayResourceDescriptionList;

/** Optional parameters. */
export interface ServiceFabricClientAPIsOptionalParams
  extends coreClient.ServiceClientOptions {
  /** server parameter */
  $host?: HostOptions;
  /** Api Version */
  apiVersion?: string;
  /** Overrides client endpoint. */
  endpoint?: string;
}
