import {
  OperationParameter,
  OperationURLParameter,
  OperationQueryParameter
} from "@azure/core-client";
import {
  ClusterHealthPolicies as ClusterHealthPoliciesMapper,
  ClusterHealthChunkQueryDescription as ClusterHealthChunkQueryDescriptionMapper,
  HealthInformation as HealthInformationMapper,
  UpgradeOrchestrationServiceState as UpgradeOrchestrationServiceStateMapper,
  ProvisionFabricDescription as ProvisionFabricDescriptionMapper,
  UnprovisionFabricDescription as UnprovisionFabricDescriptionMapper,
  ResumeClusterUpgradeDescription as ResumeClusterUpgradeDescriptionMapper,
  StartClusterUpgradeDescription as StartClusterUpgradeDescriptionMapper,
  ClusterConfigurationUpgradeDescription as ClusterConfigurationUpgradeDescriptionMapper,
  UpdateClusterUpgradeDescription as UpdateClusterUpgradeDescriptionMapper,
  ClusterHealthPolicy as ClusterHealthPolicyMapper,
  DeactivationIntentDescription as DeactivationIntentDescriptionMapper,
  RestartNodeDescription as RestartNodeDescriptionMapper,
  ProvisionApplicationTypeDescriptionBase as ProvisionApplicationTypeDescriptionBaseMapper,
  UnprovisionApplicationTypeDescriptionInfo as UnprovisionApplicationTypeDescriptionInfoMapper,
  ApplicationDescription as ApplicationDescriptionMapper,
  ApplicationHealthPolicy as ApplicationHealthPolicyMapper,
  ApplicationUpgradeDescription as ApplicationUpgradeDescriptionMapper,
  ApplicationUpgradeUpdateDescription as ApplicationUpgradeUpdateDescriptionMapper,
  ApplicationUpdateDescription as ApplicationUpdateDescriptionMapper,
  ResumeApplicationUpgradeDescription as ResumeApplicationUpgradeDescriptionMapper,
  ServiceDescription as ServiceDescriptionMapper,
  ServiceFromTemplateDescription as ServiceFromTemplateDescriptionMapper,
  ServiceUpdateDescription as ServiceUpdateDescriptionMapper,
  RepairTask as RepairTaskMapper,
  RepairTaskCancelDescription as RepairTaskCancelDescriptionMapper,
  RepairTaskDeleteDescription as RepairTaskDeleteDescriptionMapper,
  RepairTaskApproveDescription as RepairTaskApproveDescriptionMapper,
  RepairTaskUpdateHealthPolicyDescription as RepairTaskUpdateHealthPolicyDescriptionMapper,
  DeployServicePackageToNodeDescription as DeployServicePackageToNodeDescriptionMapper,
  RestartDeployedCodePackageDescription as RestartDeployedCodePackageDescriptionMapper,
  ContainerApiRequestBody as ContainerApiRequestBodyMapper,
  CreateComposeDeploymentDescription as CreateComposeDeploymentDescriptionMapper,
  ComposeDeploymentUpgradeDescription as ComposeDeploymentUpgradeDescriptionMapper,
  ChaosParameters as ChaosParametersMapper,
  ChaosScheduleDescription as ChaosScheduleDescriptionMapper,
  ImageStoreCopyDescription as ImageStoreCopyDescriptionMapper,
  BackupPolicyDescription as BackupPolicyDescriptionMapper,
  EnableBackupDescription as EnableBackupDescriptionMapper,
  DisableBackupDescription as DisableBackupDescriptionMapper,
  BackupPartitionDescription as BackupPartitionDescriptionMapper,
  RestorePartitionDescription as RestorePartitionDescriptionMapper,
  GetBackupByStorageQueryDescription as GetBackupByStorageQueryDescriptionMapper,
  NameDescription as NameDescriptionMapper,
  PropertyDescription as PropertyDescriptionMapper,
  PropertyBatchDescriptionList as PropertyBatchDescriptionListMapper,
  SecretResourceDescription as SecretResourceDescriptionMapper,
  SecretValueResourceDescription as SecretValueResourceDescriptionMapper,
  VolumeResourceDescription as VolumeResourceDescriptionMapper,
  NetworkResourceDescription as NetworkResourceDescriptionMapper,
  ApplicationResourceDescription as ApplicationResourceDescriptionMapper,
  GatewayResourceDescription as GatewayResourceDescriptionMapper
} from "../models/mappers";

export const accept: OperationParameter = {
  parameterPath: "accept",
  mapper: {
    defaultValue: "application/json",
    isConstant: true,
    serializedName: "Accept",
    type: {
      name: "String"
    }
  }
};

export const $host: OperationURLParameter = {
  parameterPath: "$host",
  mapper: {
    serializedName: "$host",
    required: true,
    type: {
      name: "String"
    }
  },
  skipEncoding: true
};

export const apiVersion: OperationQueryParameter = {
  parameterPath: "apiVersion",
  mapper: {
    defaultValue: "8.2",
    isConstant: true,
    serializedName: "api-version",
    type: {
      name: "String"
    }
  }
};

export const timeout: OperationQueryParameter = {
  parameterPath: ["options", "timeout"],
  mapper: {
    defaultValue: 60,
    constraints: {
      InclusiveMaximum: 4294967295,
      InclusiveMinimum: 1
    },
    serializedName: "timeout",
    type: {
      name: "Number"
    }
  }
};

export const nodesHealthStateFilter: OperationQueryParameter = {
  parameterPath: ["options", "nodesHealthStateFilter"],
  mapper: {
    defaultValue: 0,
    serializedName: "NodesHealthStateFilter",
    type: {
      name: "Number"
    }
  }
};

export const applicationsHealthStateFilter: OperationQueryParameter = {
  parameterPath: ["options", "applicationsHealthStateFilter"],
  mapper: {
    defaultValue: 0,
    serializedName: "ApplicationsHealthStateFilter",
    type: {
      name: "Number"
    }
  }
};

export const eventsHealthStateFilter: OperationQueryParameter = {
  parameterPath: ["options", "eventsHealthStateFilter"],
  mapper: {
    defaultValue: 0,
    serializedName: "EventsHealthStateFilter",
    type: {
      name: "Number"
    }
  }
};

export const excludeHealthStatistics: OperationQueryParameter = {
  parameterPath: ["options", "excludeHealthStatistics"],
  mapper: {
    defaultValue: false,
    serializedName: "ExcludeHealthStatistics",
    type: {
      name: "Boolean"
    }
  }
};

export const includeSystemApplicationHealthStatistics: OperationQueryParameter = {
  parameterPath: ["options", "includeSystemApplicationHealthStatistics"],
  mapper: {
    defaultValue: false,
    serializedName: "IncludeSystemApplicationHealthStatistics",
    type: {
      name: "Boolean"
    }
  }
};

export const contentType: OperationParameter = {
  parameterPath: ["options", "contentType"],
  mapper: {
    defaultValue: "application/json",
    isConstant: true,
    serializedName: "Content-Type",
    type: {
      name: "String"
    }
  }
};

export const clusterHealthPolicies: OperationParameter = {
  parameterPath: ["options", "clusterHealthPolicies"],
  mapper: ClusterHealthPoliciesMapper
};

export const clusterHealthChunkQueryDescription: OperationParameter = {
  parameterPath: ["options", "clusterHealthChunkQueryDescription"],
  mapper: ClusterHealthChunkQueryDescriptionMapper
};

export const healthInformation: OperationParameter = {
  parameterPath: "healthInformation",
  mapper: HealthInformationMapper
};

export const immediate: OperationQueryParameter = {
  parameterPath: ["options", "immediate"],
  mapper: {
    defaultValue: false,
    serializedName: "Immediate",
    type: {
      name: "Boolean"
    }
  }
};

export const codeVersion: OperationQueryParameter = {
  parameterPath: ["options", "codeVersion"],
  mapper: {
    serializedName: "CodeVersion",
    type: {
      name: "String"
    }
  }
};

export const configVersion: OperationQueryParameter = {
  parameterPath: ["options", "configVersion"],
  mapper: {
    serializedName: "ConfigVersion",
    type: {
      name: "String"
    }
  }
};

export const configurationApiVersion: OperationQueryParameter = {
  parameterPath: "configurationApiVersion",
  mapper: {
    serializedName: "ConfigurationApiVersion",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const upgradeOrchestrationServiceState: OperationParameter = {
  parameterPath: "upgradeOrchestrationServiceState",
  mapper: UpgradeOrchestrationServiceStateMapper
};

export const provisionFabricDescription: OperationParameter = {
  parameterPath: "provisionFabricDescription",
  mapper: ProvisionFabricDescriptionMapper
};

export const unprovisionFabricDescription: OperationParameter = {
  parameterPath: "unprovisionFabricDescription",
  mapper: UnprovisionFabricDescriptionMapper
};

export const resumeClusterUpgradeDescription: OperationParameter = {
  parameterPath: "resumeClusterUpgradeDescription",
  mapper: ResumeClusterUpgradeDescriptionMapper
};

export const startClusterUpgradeDescription: OperationParameter = {
  parameterPath: "startClusterUpgradeDescription",
  mapper: StartClusterUpgradeDescriptionMapper
};

export const clusterConfigurationUpgradeDescription: OperationParameter = {
  parameterPath: "clusterConfigurationUpgradeDescription",
  mapper: ClusterConfigurationUpgradeDescriptionMapper
};

export const updateClusterUpgradeDescription: OperationParameter = {
  parameterPath: "updateClusterUpgradeDescription",
  mapper: UpdateClusterUpgradeDescriptionMapper
};

export const enabled: OperationQueryParameter = {
  parameterPath: "enabled",
  mapper: {
    serializedName: "Enabled",
    required: true,
    type: {
      name: "Boolean"
    }
  }
};

export const continuationToken: OperationQueryParameter = {
  parameterPath: ["options", "continuationToken"],
  mapper: {
    serializedName: "ContinuationToken",
    type: {
      name: "String"
    }
  },
  skipEncoding: true
};

export const nodeStatusFilter: OperationQueryParameter = {
  parameterPath: ["options", "nodeStatusFilter"],
  mapper: {
    defaultValue: "default",
    serializedName: "NodeStatusFilter",
    type: {
      name: "String"
    }
  }
};

export const maxResults: OperationQueryParameter = {
  parameterPath: ["options", "maxResults"],
  mapper: {
    defaultValue: 0,
    constraints: {
      InclusiveMinimum: 0
    },
    serializedName: "MaxResults",
    type: {
      name: "Number"
    }
  }
};

export const nodeName: OperationURLParameter = {
  parameterPath: "nodeName",
  mapper: {
    serializedName: "nodeName",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const clusterHealthPolicy: OperationParameter = {
  parameterPath: ["options", "clusterHealthPolicy"],
  mapper: ClusterHealthPolicyMapper
};

export const deactivationIntentDescription: OperationParameter = {
  parameterPath: "deactivationIntentDescription",
  mapper: DeactivationIntentDescriptionMapper
};

export const restartNodeDescription: OperationParameter = {
  parameterPath: "restartNodeDescription",
  mapper: RestartNodeDescriptionMapper
};

export const configParameterOverrideList: OperationParameter = {
  parameterPath: "configParameterOverrideList",
  mapper: {
    serializedName: "configParameterOverrideList",
    required: true,
    type: {
      name: "Sequence",
      element: {
        type: {
          name: "Composite",
          className: "ConfigParameterOverride"
        }
      }
    }
  }
};

export const force: OperationQueryParameter = {
  parameterPath: ["options", "force"],
  mapper: {
    serializedName: "Force",
    type: {
      name: "Boolean"
    }
  }
};

export const nodeTags: OperationParameter = {
  parameterPath: "nodeTags",
  mapper: {
    serializedName: "nodeTags",
    required: true,
    type: {
      name: "Sequence",
      element: {
        type: {
          name: "String"
        }
      }
    }
  }
};

export const applicationTypeDefinitionKindFilter: OperationQueryParameter = {
  parameterPath: ["options", "applicationTypeDefinitionKindFilter"],
  mapper: {
    defaultValue: 0,
    serializedName: "ApplicationTypeDefinitionKindFilter",
    type: {
      name: "Number"
    }
  }
};

export const excludeApplicationParameters: OperationQueryParameter = {
  parameterPath: ["options", "excludeApplicationParameters"],
  mapper: {
    defaultValue: false,
    serializedName: "ExcludeApplicationParameters",
    type: {
      name: "Boolean"
    }
  }
};

export const applicationTypeName: OperationURLParameter = {
  parameterPath: "applicationTypeName",
  mapper: {
    serializedName: "applicationTypeName",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const applicationTypeVersion: OperationQueryParameter = {
  parameterPath: ["options", "applicationTypeVersion"],
  mapper: {
    serializedName: "ApplicationTypeVersion",
    type: {
      name: "String"
    }
  }
};

export const provisionApplicationTypeDescriptionBaseRequiredBodyParam: OperationParameter = {
  parameterPath: "provisionApplicationTypeDescriptionBaseRequiredBodyParam",
  mapper: ProvisionApplicationTypeDescriptionBaseMapper
};

export const unprovisionApplicationTypeDescriptionInfo: OperationParameter = {
  parameterPath: "unprovisionApplicationTypeDescriptionInfo",
  mapper: UnprovisionApplicationTypeDescriptionInfoMapper
};

export const applicationTypeVersion1: OperationQueryParameter = {
  parameterPath: "applicationTypeVersion",
  mapper: {
    serializedName: "ApplicationTypeVersion",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const serviceTypeName: OperationURLParameter = {
  parameterPath: "serviceTypeName",
  mapper: {
    serializedName: "serviceTypeName",
    required: true,
    type: {
      name: "String"
    }
  },
  skipEncoding: true
};

export const serviceManifestName: OperationQueryParameter = {
  parameterPath: "serviceManifestName",
  mapper: {
    serializedName: "ServiceManifestName",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const applicationId: OperationURLParameter = {
  parameterPath: "applicationId",
  mapper: {
    serializedName: "applicationId",
    required: true,
    type: {
      name: "String"
    }
  },
  skipEncoding: true
};

export const serviceManifestName1: OperationQueryParameter = {
  parameterPath: ["options", "serviceManifestName"],
  mapper: {
    serializedName: "ServiceManifestName",
    type: {
      name: "String"
    }
  }
};

export const applicationDescription: OperationParameter = {
  parameterPath: "applicationDescription",
  mapper: ApplicationDescriptionMapper
};

export const forceRemove: OperationQueryParameter = {
  parameterPath: ["options", "forceRemove"],
  mapper: {
    serializedName: "ForceRemove",
    type: {
      name: "Boolean"
    }
  }
};

export const applicationDefinitionKindFilter: OperationQueryParameter = {
  parameterPath: ["options", "applicationDefinitionKindFilter"],
  mapper: {
    defaultValue: 0,
    serializedName: "ApplicationDefinitionKindFilter",
    type: {
      name: "Number"
    }
  }
};

export const applicationTypeName1: OperationQueryParameter = {
  parameterPath: ["options", "applicationTypeName"],
  mapper: {
    serializedName: "ApplicationTypeName",
    type: {
      name: "String"
    }
  }
};

export const deployedApplicationsHealthStateFilter: OperationQueryParameter = {
  parameterPath: ["options", "deployedApplicationsHealthStateFilter"],
  mapper: {
    defaultValue: 0,
    serializedName: "DeployedApplicationsHealthStateFilter",
    type: {
      name: "Number"
    }
  }
};

export const servicesHealthStateFilter: OperationQueryParameter = {
  parameterPath: ["options", "servicesHealthStateFilter"],
  mapper: {
    defaultValue: 0,
    serializedName: "ServicesHealthStateFilter",
    type: {
      name: "Number"
    }
  }
};

export const applicationHealthPolicy: OperationParameter = {
  parameterPath: ["options", "applicationHealthPolicy"],
  mapper: ApplicationHealthPolicyMapper
};

export const applicationUpgradeDescription: OperationParameter = {
  parameterPath: "applicationUpgradeDescription",
  mapper: ApplicationUpgradeDescriptionMapper
};

export const applicationUpgradeUpdateDescription: OperationParameter = {
  parameterPath: "applicationUpgradeUpdateDescription",
  mapper: ApplicationUpgradeUpdateDescriptionMapper
};

export const applicationUpdateDescription: OperationParameter = {
  parameterPath: "applicationUpdateDescription",
  mapper: ApplicationUpdateDescriptionMapper
};

export const resumeApplicationUpgradeDescription: OperationParameter = {
  parameterPath: "resumeApplicationUpgradeDescription",
  mapper: ResumeApplicationUpgradeDescriptionMapper
};

export const includeHealthState: OperationQueryParameter = {
  parameterPath: ["options", "includeHealthState"],
  mapper: {
    defaultValue: false,
    serializedName: "IncludeHealthState",
    type: {
      name: "Boolean"
    }
  }
};

export const deployedServicePackagesHealthStateFilter: OperationQueryParameter = {
  parameterPath: ["options", "deployedServicePackagesHealthStateFilter"],
  mapper: {
    defaultValue: 0,
    serializedName: "DeployedServicePackagesHealthStateFilter",
    type: {
      name: "Number"
    }
  }
};

export const serviceTypeName1: OperationQueryParameter = {
  parameterPath: ["options", "serviceTypeName"],
  mapper: {
    serializedName: "ServiceTypeName",
    type: {
      name: "String"
    }
  }
};

export const serviceId: OperationURLParameter = {
  parameterPath: "serviceId",
  mapper: {
    serializedName: "serviceId",
    required: true,
    type: {
      name: "String"
    }
  },
  skipEncoding: true
};

export const serviceDescription: OperationParameter = {
  parameterPath: "serviceDescription",
  mapper: ServiceDescriptionMapper
};

export const serviceFromTemplateDescription: OperationParameter = {
  parameterPath: "serviceFromTemplateDescription",
  mapper: ServiceFromTemplateDescriptionMapper
};

export const serviceUpdateDescription: OperationParameter = {
  parameterPath: "serviceUpdateDescription",
  mapper: ServiceUpdateDescriptionMapper
};

export const partitionsHealthStateFilter: OperationQueryParameter = {
  parameterPath: ["options", "partitionsHealthStateFilter"],
  mapper: {
    defaultValue: 0,
    serializedName: "PartitionsHealthStateFilter",
    type: {
      name: "Number"
    }
  }
};

export const partitionKeyType: OperationQueryParameter = {
  parameterPath: ["options", "partitionKeyType"],
  mapper: {
    serializedName: "PartitionKeyType",
    type: {
      name: "Number"
    }
  }
};

export const partitionKeyValue: OperationQueryParameter = {
  parameterPath: ["options", "partitionKeyValue"],
  mapper: {
    serializedName: "PartitionKeyValue",
    type: {
      name: "String"
    }
  },
  skipEncoding: true
};

export const previousRspVersion: OperationQueryParameter = {
  parameterPath: ["options", "previousRspVersion"],
  mapper: {
    serializedName: "PreviousRspVersion",
    type: {
      name: "String"
    }
  },
  skipEncoding: true
};

export const partitionId: OperationQueryParameter = {
  parameterPath: ["options", "partitionId"],
  mapper: {
    serializedName: "PartitionId",
    type: {
      name: "Uuid"
    }
  }
};

export const onlyQueryPrimaries: OperationQueryParameter = {
  parameterPath: ["options", "onlyQueryPrimaries"],
  mapper: {
    defaultValue: false,
    serializedName: "OnlyQueryPrimaries",
    type: {
      name: "Boolean"
    }
  }
};

export const metricName: OperationQueryParameter = {
  parameterPath: "metricName",
  mapper: {
    serializedName: "MetricName",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const serviceName: OperationQueryParameter = {
  parameterPath: ["options", "serviceName"],
  mapper: {
    serializedName: "ServiceName",
    type: {
      name: "String"
    }
  }
};

export const ordering: OperationQueryParameter = {
  parameterPath: ["options", "ordering"],
  mapper: {
    serializedName: "Ordering",
    type: {
      name: "String"
    }
  }
};

export const partitionId1: OperationURLParameter = {
  parameterPath: "partitionId",
  mapper: {
    serializedName: "partitionId",
    required: true,
    type: {
      name: "Uuid"
    }
  },
  skipEncoding: true
};

export const replicasHealthStateFilter: OperationQueryParameter = {
  parameterPath: ["options", "replicasHealthStateFilter"],
  mapper: {
    defaultValue: 0,
    serializedName: "ReplicasHealthStateFilter",
    type: {
      name: "Number"
    }
  }
};

export const nodeName1: OperationQueryParameter = {
  parameterPath: ["options", "nodeName"],
  mapper: {
    serializedName: "NodeName",
    type: {
      name: "String"
    }
  }
};

export const ignoreConstraints: OperationQueryParameter = {
  parameterPath: ["options", "ignoreConstraints"],
  mapper: {
    defaultValue: false,
    serializedName: "IgnoreConstraints",
    type: {
      name: "Boolean"
    }
  }
};

export const currentNodeName: OperationQueryParameter = {
  parameterPath: "currentNodeName",
  mapper: {
    serializedName: "CurrentNodeName",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const newNodeName: OperationQueryParameter = {
  parameterPath: ["options", "newNodeName"],
  mapper: {
    serializedName: "NewNodeName",
    type: {
      name: "String"
    }
  }
};

export const partitionMetricLoadDescriptionList: OperationParameter = {
  parameterPath: "partitionMetricLoadDescriptionList",
  mapper: {
    serializedName: "partitionMetricLoadDescriptionList",
    required: true,
    type: {
      name: "Sequence",
      element: {
        type: {
          name: "Composite",
          className: "PartitionMetricLoadDescription"
        }
      }
    }
  }
};

export const currentNodeName1: OperationQueryParameter = {
  parameterPath: ["options", "currentNodeName"],
  mapper: {
    serializedName: "CurrentNodeName",
    type: {
      name: "String"
    }
  }
};

export const repairTask: OperationParameter = {
  parameterPath: "repairTask",
  mapper: RepairTaskMapper
};

export const repairTaskCancelDescription: OperationParameter = {
  parameterPath: "repairTaskCancelDescription",
  mapper: RepairTaskCancelDescriptionMapper
};

export const repairTaskDeleteDescription: OperationParameter = {
  parameterPath: "repairTaskDeleteDescription",
  mapper: RepairTaskDeleteDescriptionMapper
};

export const taskIdFilter: OperationQueryParameter = {
  parameterPath: ["options", "taskIdFilter"],
  mapper: {
    serializedName: "TaskIdFilter",
    type: {
      name: "String"
    }
  }
};

export const stateFilter: OperationQueryParameter = {
  parameterPath: ["options", "stateFilter"],
  mapper: {
    serializedName: "StateFilter",
    type: {
      name: "Number"
    }
  }
};

export const executorFilter: OperationQueryParameter = {
  parameterPath: ["options", "executorFilter"],
  mapper: {
    serializedName: "ExecutorFilter",
    type: {
      name: "String"
    }
  }
};

export const repairTaskApproveDescription: OperationParameter = {
  parameterPath: "repairTaskApproveDescription",
  mapper: RepairTaskApproveDescriptionMapper
};

export const repairTaskUpdateHealthPolicyDescription: OperationParameter = {
  parameterPath: "repairTaskUpdateHealthPolicyDescription",
  mapper: RepairTaskUpdateHealthPolicyDescriptionMapper
};

export const replicaId: OperationURLParameter = {
  parameterPath: "replicaId",
  mapper: {
    serializedName: "replicaId",
    required: true,
    type: {
      name: "String"
    }
  },
  skipEncoding: true
};

export const serviceKind: OperationQueryParameter = {
  parameterPath: "serviceKind",
  mapper: {
    defaultValue: "Stateful",
    serializedName: "ServiceKind",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const servicePackageName: OperationURLParameter = {
  parameterPath: "servicePackageName",
  mapper: {
    serializedName: "servicePackageName",
    required: true,
    type: {
      name: "String"
    }
  },
  skipEncoding: true
};

export const deployServicePackageToNodeDescription: OperationParameter = {
  parameterPath: "deployServicePackageToNodeDescription",
  mapper: DeployServicePackageToNodeDescriptionMapper
};

export const codePackageName: OperationQueryParameter = {
  parameterPath: ["options", "codePackageName"],
  mapper: {
    serializedName: "CodePackageName",
    type: {
      name: "String"
    }
  }
};

export const restartDeployedCodePackageDescription: OperationParameter = {
  parameterPath: "restartDeployedCodePackageDescription",
  mapper: RestartDeployedCodePackageDescriptionMapper
};

export const codePackageName1: OperationQueryParameter = {
  parameterPath: "codePackageName",
  mapper: {
    serializedName: "CodePackageName",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const tail: OperationQueryParameter = {
  parameterPath: ["options", "tail"],
  mapper: {
    serializedName: "Tail",
    type: {
      name: "String"
    }
  }
};

export const previous: OperationQueryParameter = {
  parameterPath: ["options", "previous"],
  mapper: {
    defaultValue: false,
    serializedName: "Previous",
    type: {
      name: "Boolean"
    }
  }
};

export const containerApiRequestBody: OperationParameter = {
  parameterPath: "containerApiRequestBody",
  mapper: ContainerApiRequestBodyMapper
};

export const codePackageInstanceId: OperationQueryParameter = {
  parameterPath: "codePackageInstanceId",
  mapper: {
    serializedName: "CodePackageInstanceId",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const createComposeDeploymentDescription: OperationParameter = {
  parameterPath: "createComposeDeploymentDescription",
  mapper: CreateComposeDeploymentDescriptionMapper
};

export const deploymentName: OperationURLParameter = {
  parameterPath: "deploymentName",
  mapper: {
    serializedName: "deploymentName",
    required: true,
    type: {
      name: "String"
    }
  },
  skipEncoding: true
};

export const composeDeploymentUpgradeDescription: OperationParameter = {
  parameterPath: "composeDeploymentUpgradeDescription",
  mapper: ComposeDeploymentUpgradeDescriptionMapper
};

export const chaosParameters: OperationParameter = {
  parameterPath: "chaosParameters",
  mapper: ChaosParametersMapper
};

export const startTimeUtc: OperationQueryParameter = {
  parameterPath: ["options", "startTimeUtc"],
  mapper: {
    serializedName: "StartTimeUtc",
    type: {
      name: "String"
    }
  }
};

export const endTimeUtc: OperationQueryParameter = {
  parameterPath: ["options", "endTimeUtc"],
  mapper: {
    serializedName: "EndTimeUtc",
    type: {
      name: "String"
    }
  }
};

export const chaosSchedule: OperationParameter = {
  parameterPath: "chaosSchedule",
  mapper: ChaosScheduleDescriptionMapper
};

export const contentPath: OperationURLParameter = {
  parameterPath: "contentPath",
  mapper: {
    serializedName: "contentPath",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const imageStoreCopyDescription: OperationParameter = {
  parameterPath: "imageStoreCopyDescription",
  mapper: ImageStoreCopyDescriptionMapper
};

export const sessionId: OperationQueryParameter = {
  parameterPath: "sessionId",
  mapper: {
    serializedName: "session-id",
    required: true,
    type: {
      name: "Uuid"
    }
  }
};

export const contentRange: OperationParameter = {
  parameterPath: "contentRange",
  mapper: {
    serializedName: "Content-Range",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const command: OperationQueryParameter = {
  parameterPath: "command",
  mapper: {
    serializedName: "Command",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const serviceId1: OperationQueryParameter = {
  parameterPath: ["options", "serviceId"],
  mapper: {
    serializedName: "ServiceId",
    type: {
      name: "String"
    }
  }
};

export const operationId: OperationQueryParameter = {
  parameterPath: "operationId",
  mapper: {
    serializedName: "OperationId",
    required: true,
    type: {
      name: "Uuid"
    }
  }
};

export const dataLossMode: OperationQueryParameter = {
  parameterPath: "dataLossMode",
  mapper: {
    serializedName: "DataLossMode",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const quorumLossMode: OperationQueryParameter = {
  parameterPath: "quorumLossMode",
  mapper: {
    serializedName: "QuorumLossMode",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const quorumLossDuration: OperationQueryParameter = {
  parameterPath: "quorumLossDuration",
  mapper: {
    serializedName: "QuorumLossDuration",
    required: true,
    type: {
      name: "Number"
    }
  }
};

export const restartPartitionMode: OperationQueryParameter = {
  parameterPath: "restartPartitionMode",
  mapper: {
    serializedName: "RestartPartitionMode",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const nodeTransitionType: OperationQueryParameter = {
  parameterPath: "nodeTransitionType",
  mapper: {
    serializedName: "NodeTransitionType",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const nodeInstanceId: OperationQueryParameter = {
  parameterPath: "nodeInstanceId",
  mapper: {
    serializedName: "NodeInstanceId",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const stopDurationInSeconds: OperationQueryParameter = {
  parameterPath: "stopDurationInSeconds",
  mapper: {
    constraints: {
      InclusiveMinimum: 0
    },
    serializedName: "StopDurationInSeconds",
    required: true,
    type: {
      name: "Number"
    }
  }
};

export const typeFilter: OperationQueryParameter = {
  parameterPath: "typeFilter",
  mapper: {
    defaultValue: 65535,
    serializedName: "TypeFilter",
    required: true,
    type: {
      name: "Number"
    }
  }
};

export const stateFilter1: OperationQueryParameter = {
  parameterPath: "stateFilter",
  mapper: {
    defaultValue: 65535,
    serializedName: "StateFilter",
    required: true,
    type: {
      name: "Number"
    }
  }
};

export const force1: OperationQueryParameter = {
  parameterPath: "force",
  mapper: {
    defaultValue: false,
    serializedName: "Force",
    required: true,
    type: {
      name: "Boolean"
    }
  }
};

export const backupPolicyDescription: OperationParameter = {
  parameterPath: "backupPolicyDescription",
  mapper: BackupPolicyDescriptionMapper
};

export const validateConnection: OperationQueryParameter = {
  parameterPath: ["options", "validateConnection"],
  mapper: {
    defaultValue: false,
    serializedName: "ValidateConnection",
    type: {
      name: "Boolean"
    }
  }
};

export const backupPolicyName: OperationURLParameter = {
  parameterPath: "backupPolicyName",
  mapper: {
    serializedName: "backupPolicyName",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const enableBackupDescription: OperationParameter = {
  parameterPath: "enableBackupDescription",
  mapper: EnableBackupDescriptionMapper
};

export const disableBackupDescription: OperationParameter = {
  parameterPath: ["options", "disableBackupDescription"],
  mapper: DisableBackupDescriptionMapper
};

export const latest: OperationQueryParameter = {
  parameterPath: ["options", "latest"],
  mapper: {
    defaultValue: false,
    serializedName: "Latest",
    type: {
      name: "Boolean"
    }
  }
};

export const startDateTimeFilter: OperationQueryParameter = {
  parameterPath: ["options", "startDateTimeFilter"],
  mapper: {
    serializedName: "StartDateTimeFilter",
    type: {
      name: "DateTime"
    }
  }
};

export const endDateTimeFilter: OperationQueryParameter = {
  parameterPath: ["options", "endDateTimeFilter"],
  mapper: {
    serializedName: "EndDateTimeFilter",
    type: {
      name: "DateTime"
    }
  }
};

export const backupPartitionDescription: OperationParameter = {
  parameterPath: ["options", "backupPartitionDescription"],
  mapper: BackupPartitionDescriptionMapper
};

export const backupTimeout: OperationQueryParameter = {
  parameterPath: ["options", "backupTimeout"],
  mapper: {
    defaultValue: 10,
    serializedName: "BackupTimeout",
    type: {
      name: "Number"
    }
  }
};

export const restorePartitionDescription: OperationParameter = {
  parameterPath: "restorePartitionDescription",
  mapper: RestorePartitionDescriptionMapper
};

export const restoreTimeout: OperationQueryParameter = {
  parameterPath: ["options", "restoreTimeout"],
  mapper: {
    defaultValue: 10,
    serializedName: "RestoreTimeout",
    type: {
      name: "Number"
    }
  }
};

export const getBackupByStorageQueryDescription: OperationParameter = {
  parameterPath: "getBackupByStorageQueryDescription",
  mapper: GetBackupByStorageQueryDescriptionMapper
};

export const nameDescription: OperationParameter = {
  parameterPath: "nameDescription",
  mapper: NameDescriptionMapper
};

export const nameId: OperationURLParameter = {
  parameterPath: "nameId",
  mapper: {
    serializedName: "nameId",
    required: true,
    type: {
      name: "String"
    }
  },
  skipEncoding: true
};

export const recursive: OperationQueryParameter = {
  parameterPath: ["options", "recursive"],
  mapper: {
    defaultValue: false,
    serializedName: "Recursive",
    type: {
      name: "Boolean"
    }
  }
};

export const includeValues: OperationQueryParameter = {
  parameterPath: ["options", "includeValues"],
  mapper: {
    defaultValue: false,
    serializedName: "IncludeValues",
    type: {
      name: "Boolean"
    }
  }
};

export const propertyDescription: OperationParameter = {
  parameterPath: "propertyDescription",
  mapper: PropertyDescriptionMapper
};

export const propertyName: OperationQueryParameter = {
  parameterPath: "propertyName",
  mapper: {
    serializedName: "PropertyName",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const propertyBatchDescriptionList: OperationParameter = {
  parameterPath: "propertyBatchDescriptionList",
  mapper: PropertyBatchDescriptionListMapper
};

export const startTimeUtc1: OperationQueryParameter = {
  parameterPath: "startTimeUtc",
  mapper: {
    serializedName: "StartTimeUtc",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const endTimeUtc1: OperationQueryParameter = {
  parameterPath: "endTimeUtc",
  mapper: {
    serializedName: "EndTimeUtc",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const eventsTypesFilter: OperationQueryParameter = {
  parameterPath: ["options", "eventsTypesFilter"],
  mapper: {
    serializedName: "EventsTypesFilter",
    type: {
      name: "String"
    }
  }
};

export const excludeAnalysisEvents: OperationQueryParameter = {
  parameterPath: ["options", "excludeAnalysisEvents"],
  mapper: {
    serializedName: "ExcludeAnalysisEvents",
    type: {
      name: "Boolean"
    }
  }
};

export const skipCorrelationLookup: OperationQueryParameter = {
  parameterPath: ["options", "skipCorrelationLookup"],
  mapper: {
    serializedName: "SkipCorrelationLookup",
    type: {
      name: "Boolean"
    }
  }
};

export const eventInstanceId: OperationURLParameter = {
  parameterPath: "eventInstanceId",
  mapper: {
    serializedName: "eventInstanceId",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const secretResourceDescription: OperationParameter = {
  parameterPath: "secretResourceDescription",
  mapper: SecretResourceDescriptionMapper
};

export const secretResourceName: OperationURLParameter = {
  parameterPath: "secretResourceName",
  mapper: {
    serializedName: "secretResourceName",
    required: true,
    type: {
      name: "String"
    }
  },
  skipEncoding: true
};

export const secretValueResourceDescription: OperationParameter = {
  parameterPath: "secretValueResourceDescription",
  mapper: SecretValueResourceDescriptionMapper
};

export const secretValueResourceName: OperationURLParameter = {
  parameterPath: "secretValueResourceName",
  mapper: {
    serializedName: "secretValueResourceName",
    required: true,
    type: {
      name: "String"
    }
  },
  skipEncoding: true
};

export const volumeResourceDescription: OperationParameter = {
  parameterPath: "volumeResourceDescription",
  mapper: VolumeResourceDescriptionMapper
};

export const volumeResourceName: OperationURLParameter = {
  parameterPath: "volumeResourceName",
  mapper: {
    serializedName: "volumeResourceName",
    required: true,
    type: {
      name: "String"
    }
  },
  skipEncoding: true
};

export const networkResourceDescription: OperationParameter = {
  parameterPath: "networkResourceDescription",
  mapper: NetworkResourceDescriptionMapper
};

export const networkResourceName: OperationURLParameter = {
  parameterPath: "networkResourceName",
  mapper: {
    serializedName: "networkResourceName",
    required: true,
    type: {
      name: "String"
    }
  },
  skipEncoding: true
};

export const applicationResourceDescription: OperationParameter = {
  parameterPath: "applicationResourceDescription",
  mapper: ApplicationResourceDescriptionMapper
};

export const applicationResourceName: OperationURLParameter = {
  parameterPath: "applicationResourceName",
  mapper: {
    serializedName: "applicationResourceName",
    required: true,
    type: {
      name: "String"
    }
  },
  skipEncoding: true
};

export const serviceResourceName: OperationURLParameter = {
  parameterPath: "serviceResourceName",
  mapper: {
    serializedName: "serviceResourceName",
    required: true,
    type: {
      name: "String"
    }
  },
  skipEncoding: true
};

export const replicaName: OperationURLParameter = {
  parameterPath: "replicaName",
  mapper: {
    serializedName: "replicaName",
    required: true,
    type: {
      name: "String"
    }
  },
  skipEncoding: true
};

export const codePackageName2: OperationURLParameter = {
  parameterPath: "codePackageName",
  mapper: {
    serializedName: "codePackageName",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const gatewayResourceDescription: OperationParameter = {
  parameterPath: "gatewayResourceDescription",
  mapper: GatewayResourceDescriptionMapper
};

export const gatewayResourceName: OperationURLParameter = {
  parameterPath: "gatewayResourceName",
  mapper: {
    serializedName: "gatewayResourceName",
    required: true,
    type: {
      name: "String"
    }
  },
  skipEncoding: true
};
