import * as coreClient from "@azure/core-client";
import {
  PipelineRequest,
  PipelineResponse,
  SendRequest
} from "@azure/core-rest-pipeline";
import {
  MeshSecretImpl,
  MeshSecretValueImpl,
  MeshVolumeImpl,
  MeshNetworkImpl,
  MeshApplicationImpl,
  MeshServiceImpl,
  MeshCodePackageImpl,
  MeshServiceReplicaImpl,
  MeshGatewayImpl
} from "./operations";
import {
  MeshSecret,
  MeshSecretValue,
  MeshVolume,
  MeshNetwork,
  MeshApplication,
  MeshService,
  MeshCodePackage,
  MeshServiceReplica,
  MeshGateway
} from "./operationsInterfaces";
import * as Parameters from "./models/parameters";
import * as Mappers from "./models/mappers";
import {
  HostOptions,
  ServiceFabricClientAPIsOptionalParams,
  GetClusterManifestOptionalParams,
  GetClusterManifestResponse,
  GetClusterHealthOptionalParams,
  GetClusterHealthResponse,
  GetClusterHealthUsingPolicyOptionalParams,
  GetClusterHealthUsingPolicyResponse,
  GetClusterHealthChunkOptionalParams,
  GetClusterHealthChunkResponse,
  GetClusterHealthChunkUsingPolicyAndAdvancedFiltersOptionalParams,
  GetClusterHealthChunkUsingPolicyAndAdvancedFiltersResponse,
  HealthInformation,
  ReportClusterHealthOptionalParams,
  GetProvisionedFabricCodeVersionInfoListOptionalParams,
  GetProvisionedFabricCodeVersionInfoListResponse,
  GetProvisionedFabricConfigVersionInfoListOptionalParams,
  GetProvisionedFabricConfigVersionInfoListResponse,
  GetClusterUpgradeProgressOptionalParams,
  GetClusterUpgradeProgressResponse,
  GetClusterConfigurationOptionalParams,
  GetClusterConfigurationResponse,
  GetClusterConfigurationUpgradeStatusOptionalParams,
  GetClusterConfigurationUpgradeStatusResponse,
  GetUpgradeOrchestrationServiceStateOptionalParams,
  GetUpgradeOrchestrationServiceStateResponse,
  UpgradeOrchestrationServiceState,
  SetUpgradeOrchestrationServiceStateOptionalParams,
  SetUpgradeOrchestrationServiceStateResponse,
  ProvisionFabricDescription,
  ProvisionClusterOptionalParams,
  UnprovisionFabricDescription,
  UnprovisionClusterOptionalParams,
  RollbackClusterUpgradeOptionalParams,
  ResumeClusterUpgradeDescription,
  ResumeClusterUpgradeOptionalParams,
  StartClusterUpgradeDescription,
  StartClusterUpgradeOptionalParams,
  ClusterConfigurationUpgradeDescription,
  StartClusterConfigurationUpgradeOptionalParams,
  UpdateClusterUpgradeDescription,
  UpdateClusterUpgradeOptionalParams,
  GetAadMetadataOptionalParams,
  GetAadMetadataResponse,
  GetClusterVersionOptionalParams,
  GetClusterVersionResponse,
  GetClusterLoadOptionalParams,
  GetClusterLoadResponse,
  ToggleVerboseServicePlacementHealthReportingOptionalParams,
  ValidateClusterUpgradeOptionalParams,
  ValidateClusterUpgradeResponse,
  GetNodeInfoListOptionalParams,
  GetNodeInfoListResponse,
  GetNodeInfoOptionalParams,
  GetNodeInfoResponse,
  GetNodeHealthOptionalParams,
  GetNodeHealthResponse,
  GetNodeHealthUsingPolicyOptionalParams,
  GetNodeHealthUsingPolicyResponse,
  ReportNodeHealthOptionalParams,
  GetNodeLoadInfoOptionalParams,
  GetNodeLoadInfoResponse,
  DeactivationIntentDescription,
  DisableNodeOptionalParams,
  EnableNodeOptionalParams,
  RemoveNodeStateOptionalParams,
  RestartNodeDescription,
  RestartNodeOptionalParams,
  RemoveConfigurationOverridesOptionalParams,
  GetConfigurationOverridesOptionalParams,
  GetConfigurationOverridesResponse,
  ConfigParameterOverride,
  AddConfigurationParameterOverridesOptionalParams,
  RemoveNodeTagsOptionalParams,
  AddNodeTagsOptionalParams,
  GetApplicationTypeInfoListOptionalParams,
  GetApplicationTypeInfoListResponse,
  GetApplicationTypeInfoListByNameOptionalParams,
  GetApplicationTypeInfoListByNameResponse,
  ProvisionApplicationTypeDescriptionBaseUnion,
  ProvisionApplicationTypeOptionalParams,
  UnprovisionApplicationTypeDescriptionInfo,
  UnprovisionApplicationTypeOptionalParams,
  GetServiceTypeInfoListOptionalParams,
  GetServiceTypeInfoListResponse,
  GetServiceTypeInfoByNameOptionalParams,
  GetServiceTypeInfoByNameResponse,
  GetServiceManifestOptionalParams,
  GetServiceManifestResponse,
  GetDeployedServiceTypeInfoListOptionalParams,
  GetDeployedServiceTypeInfoListResponse,
  GetDeployedServiceTypeInfoByNameOptionalParams,
  GetDeployedServiceTypeInfoByNameResponse,
  ApplicationDescription,
  CreateApplicationOptionalParams,
  DeleteApplicationOptionalParams,
  GetApplicationLoadInfoOptionalParams,
  GetApplicationLoadInfoResponse,
  GetApplicationInfoListOptionalParams,
  GetApplicationInfoListResponse,
  GetApplicationInfoOptionalParams,
  GetApplicationInfoResponse,
  GetApplicationHealthOptionalParams,
  GetApplicationHealthResponse,
  GetApplicationHealthUsingPolicyOptionalParams,
  GetApplicationHealthUsingPolicyResponse,
  ReportApplicationHealthOptionalParams,
  ApplicationUpgradeDescription,
  StartApplicationUpgradeOptionalParams,
  GetApplicationUpgradeOptionalParams,
  GetApplicationUpgradeResponse,
  ApplicationUpgradeUpdateDescription,
  UpdateApplicationUpgradeOptionalParams,
  ApplicationUpdateDescription,
  UpdateApplicationOptionalParams,
  ResumeApplicationUpgradeDescription,
  ResumeApplicationUpgradeOptionalParams,
  RollbackApplicationUpgradeOptionalParams,
  GetDeployedApplicationInfoListOptionalParams,
  GetDeployedApplicationInfoListResponse,
  GetDeployedApplicationInfoOptionalParams,
  GetDeployedApplicationInfoResponse,
  GetDeployedApplicationHealthOptionalParams,
  GetDeployedApplicationHealthResponse,
  GetDeployedApplicationHealthUsingPolicyOptionalParams,
  GetDeployedApplicationHealthUsingPolicyResponse,
  ReportDeployedApplicationHealthOptionalParams,
  GetApplicationManifestOptionalParams,
  GetApplicationManifestResponse,
  GetServiceInfoListOptionalParams,
  GetServiceInfoListResponse,
  GetServiceInfoOptionalParams,
  GetServiceInfoResponse,
  GetApplicationNameInfoOptionalParams,
  GetApplicationNameInfoResponse,
  ServiceDescriptionUnion,
  CreateServiceOptionalParams,
  ServiceFromTemplateDescription,
  CreateServiceFromTemplateOptionalParams,
  DeleteServiceOptionalParams,
  ServiceUpdateDescriptionUnion,
  UpdateServiceOptionalParams,
  GetServiceDescriptionOptionalParams,
  GetServiceDescriptionResponse,
  GetServiceHealthOptionalParams,
  GetServiceHealthResponse,
  GetServiceHealthUsingPolicyOptionalParams,
  GetServiceHealthUsingPolicyResponse,
  ReportServiceHealthOptionalParams,
  ResolveServiceOptionalParams,
  ResolveServiceResponse,
  GetUnplacedReplicaInformationOptionalParams,
  GetUnplacedReplicaInformationResponse,
  GetLoadedPartitionInfoListOptionalParams,
  GetLoadedPartitionInfoListResponse,
  GetPartitionInfoListOptionalParams,
  GetPartitionInfoListResponse,
  GetPartitionInfoOptionalParams,
  GetPartitionInfoResponse,
  GetServiceNameInfoOptionalParams,
  GetServiceNameInfoResponse,
  GetPartitionHealthOptionalParams,
  GetPartitionHealthResponse,
  GetPartitionHealthUsingPolicyOptionalParams,
  GetPartitionHealthUsingPolicyResponse,
  ReportPartitionHealthOptionalParams,
  GetPartitionLoadInformationOptionalParams,
  GetPartitionLoadInformationResponse,
  ResetPartitionLoadOptionalParams,
  RecoverPartitionOptionalParams,
  RecoverServicePartitionsOptionalParams,
  RecoverSystemPartitionsOptionalParams,
  RecoverAllPartitionsOptionalParams,
  MovePrimaryReplicaOptionalParams,
  MoveSecondaryReplicaOptionalParams,
  PartitionMetricLoadDescription,
  UpdatePartitionLoadOptionalParams,
  UpdatePartitionLoadResponse,
  MoveInstanceOptionalParams,
  MoveAuxiliaryReplicaOptionalParams,
  RepairTask,
  CreateRepairTaskOptionalParams,
  CreateRepairTaskResponse,
  RepairTaskCancelDescription,
  CancelRepairTaskOptionalParams,
  CancelRepairTaskResponse,
  RepairTaskDeleteDescription,
  DeleteRepairTaskOptionalParams,
  GetRepairTaskListOptionalParams,
  GetRepairTaskListResponse,
  RepairTaskApproveDescription,
  ForceApproveRepairTaskOptionalParams,
  ForceApproveRepairTaskResponse,
  RepairTaskUpdateHealthPolicyDescription,
  UpdateRepairTaskHealthPolicyOptionalParams,
  UpdateRepairTaskHealthPolicyResponse,
  UpdateRepairExecutionStateOptionalParams,
  UpdateRepairExecutionStateResponse,
  GetReplicaInfoListOptionalParams,
  GetReplicaInfoListResponse,
  GetReplicaInfoOptionalParams,
  GetReplicaInfoResponse,
  GetReplicaHealthOptionalParams,
  GetReplicaHealthResponse,
  GetReplicaHealthUsingPolicyOptionalParams,
  GetReplicaHealthUsingPolicyResponse,
  ReplicaHealthReportServiceKind,
  ReportReplicaHealthOptionalParams,
  GetDeployedServiceReplicaInfoListOptionalParams,
  GetDeployedServiceReplicaInfoListResponse,
  GetDeployedServiceReplicaDetailInfoOptionalParams,
  GetDeployedServiceReplicaDetailInfoResponse,
  GetDeployedServiceReplicaDetailInfoByPartitionIdOptionalParams,
  GetDeployedServiceReplicaDetailInfoByPartitionIdResponse,
  RestartReplicaOptionalParams,
  RemoveReplicaOptionalParams,
  GetDeployedServicePackageInfoListOptionalParams,
  GetDeployedServicePackageInfoListResponse,
  GetDeployedServicePackageInfoListByNameOptionalParams,
  GetDeployedServicePackageInfoListByNameResponse,
  GetDeployedServicePackageHealthOptionalParams,
  GetDeployedServicePackageHealthResponse,
  GetDeployedServicePackageHealthUsingPolicyOptionalParams,
  GetDeployedServicePackageHealthUsingPolicyResponse,
  ReportDeployedServicePackageHealthOptionalParams,
  DeployServicePackageToNodeDescription,
  DeployServicePackageToNodeOptionalParams,
  GetDeployedCodePackageInfoListOptionalParams,
  GetDeployedCodePackageInfoListResponse,
  RestartDeployedCodePackageDescription,
  RestartDeployedCodePackageOptionalParams,
  GetContainerLogsDeployedOnNodeOptionalParams,
  GetContainerLogsDeployedOnNodeResponse,
  ContainerApiRequestBody,
  InvokeContainerApiOptionalParams,
  InvokeContainerApiResponse,
  CreateComposeDeploymentDescription,
  CreateComposeDeploymentOptionalParams,
  GetComposeDeploymentStatusOptionalParams,
  GetComposeDeploymentStatusResponse,
  GetComposeDeploymentStatusListOptionalParams,
  GetComposeDeploymentStatusListResponse,
  GetComposeDeploymentUpgradeProgressOptionalParams,
  GetComposeDeploymentUpgradeProgressResponse,
  RemoveComposeDeploymentOptionalParams,
  ComposeDeploymentUpgradeDescription,
  StartComposeDeploymentUpgradeOptionalParams,
  StartRollbackComposeDeploymentUpgradeOptionalParams,
  GetChaosOptionalParams,
  GetChaosResponse,
  ChaosParameters,
  StartChaosOptionalParams,
  StopChaosOptionalParams,
  GetChaosEventsOptionalParams,
  GetChaosEventsResponse,
  GetChaosScheduleOptionalParams,
  GetChaosScheduleResponse,
  ChaosScheduleDescription,
  PostChaosScheduleOptionalParams,
  UploadFileOptionalParams,
  GetImageStoreContentOptionalParams,
  GetImageStoreContentResponse,
  DeleteImageStoreContentOptionalParams,
  GetImageStoreRootContentOptionalParams,
  GetImageStoreRootContentResponse,
  ImageStoreCopyDescription,
  CopyImageStoreContentOptionalParams,
  DeleteImageStoreUploadSessionOptionalParams,
  CommitImageStoreUploadSessionOptionalParams,
  GetImageStoreUploadSessionByIdOptionalParams,
  GetImageStoreUploadSessionByIdResponse,
  GetImageStoreUploadSessionByPathOptionalParams,
  GetImageStoreUploadSessionByPathResponse,
  UploadFileChunkOptionalParams,
  GetImageStoreRootFolderSizeOptionalParams,
  GetImageStoreRootFolderSizeResponse,
  GetImageStoreFolderSizeOptionalParams,
  GetImageStoreFolderSizeResponse,
  GetImageStoreInfoOptionalParams,
  GetImageStoreInfoResponse,
  InvokeInfrastructureCommandOptionalParams,
  InvokeInfrastructureCommandResponse,
  InvokeInfrastructureQueryOptionalParams,
  InvokeInfrastructureQueryResponse,
  DataLossMode,
  StartDataLossOptionalParams,
  GetDataLossProgressOptionalParams,
  GetDataLossProgressResponse,
  QuorumLossMode,
  StartQuorumLossOptionalParams,
  GetQuorumLossProgressOptionalParams,
  GetQuorumLossProgressResponse,
  RestartPartitionMode,
  StartPartitionRestartOptionalParams,
  GetPartitionRestartProgressOptionalParams,
  GetPartitionRestartProgressResponse,
  NodeTransitionType,
  StartNodeTransitionOptionalParams,
  GetNodeTransitionProgressOptionalParams,
  GetNodeTransitionProgressResponse,
  GetFaultOperationListOptionalParams,
  GetFaultOperationListResponse,
  CancelOperationOptionalParams,
  BackupPolicyDescription,
  CreateBackupPolicyOptionalParams,
  DeleteBackupPolicyOptionalParams,
  GetBackupPolicyListOptionalParams,
  GetBackupPolicyListResponse,
  GetBackupPolicyByNameOptionalParams,
  GetBackupPolicyByNameResponse,
  GetAllEntitiesBackedUpByPolicyOptionalParams,
  GetAllEntitiesBackedUpByPolicyResponse,
  UpdateBackupPolicyOptionalParams,
  EnableBackupDescription,
  EnableApplicationBackupOptionalParams,
  DisableApplicationBackupOptionalParams,
  GetApplicationBackupConfigurationInfoOptionalParams,
  GetApplicationBackupConfigurationInfoResponse,
  GetApplicationBackupListOptionalParams,
  GetApplicationBackupListResponse,
  SuspendApplicationBackupOptionalParams,
  ResumeApplicationBackupOptionalParams,
  EnableServiceBackupOptionalParams,
  DisableServiceBackupOptionalParams,
  GetServiceBackupConfigurationInfoOptionalParams,
  GetServiceBackupConfigurationInfoResponse,
  GetServiceBackupListOptionalParams,
  GetServiceBackupListResponse,
  SuspendServiceBackupOptionalParams,
  ResumeServiceBackupOptionalParams,
  EnablePartitionBackupOptionalParams,
  DisablePartitionBackupOptionalParams,
  GetPartitionBackupConfigurationInfoOptionalParams,
  GetPartitionBackupConfigurationInfoResponse,
  GetPartitionBackupListOptionalParams,
  GetPartitionBackupListResponse,
  SuspendPartitionBackupOptionalParams,
  ResumePartitionBackupOptionalParams,
  BackupPartitionOptionalParams,
  GetPartitionBackupProgressOptionalParams,
  GetPartitionBackupProgressResponse,
  RestorePartitionDescription,
  RestorePartitionOptionalParams,
  GetPartitionRestoreProgressOptionalParams,
  GetPartitionRestoreProgressResponse,
  GetBackupByStorageQueryDescription,
  GetBackupsFromBackupLocationOptionalParams,
  GetBackupsFromBackupLocationResponse,
  NameDescription,
  CreateNameOptionalParams,
  GetNameExistsInfoOptionalParams,
  DeleteNameOptionalParams,
  GetSubNameInfoListOptionalParams,
  GetSubNameInfoListResponse,
  GetPropertyInfoListOptionalParams,
  GetPropertyInfoListResponse,
  PropertyDescription,
  PutPropertyOptionalParams,
  GetPropertyInfoOptionalParams,
  GetPropertyInfoResponse,
  DeletePropertyOptionalParams,
  PropertyBatchDescriptionList,
  SubmitPropertyBatchOptionalParams,
  SubmitPropertyBatchResponse,
  GetClusterEventListOptionalParams,
  GetClusterEventListResponse,
  GetContainersEventListOptionalParams,
  GetContainersEventListResponse,
  GetNodeEventListOptionalParams,
  GetNodeEventListResponse,
  GetNodesEventListOptionalParams,
  GetNodesEventListResponse,
  GetApplicationEventListOptionalParams,
  GetApplicationEventListResponse,
  GetApplicationsEventListOptionalParams,
  GetApplicationsEventListResponse,
  GetServiceEventListOptionalParams,
  GetServiceEventListResponse,
  GetServicesEventListOptionalParams,
  GetServicesEventListResponse,
  GetPartitionEventListOptionalParams,
  GetPartitionEventListResponse,
  GetPartitionsEventListOptionalParams,
  GetPartitionsEventListResponse,
  GetPartitionReplicaEventListOptionalParams,
  GetPartitionReplicaEventListResponse,
  GetPartitionReplicasEventListOptionalParams,
  GetPartitionReplicasEventListResponse,
  GetCorrelatedEventListOptionalParams,
  GetCorrelatedEventListResponse
} from "./models";

export class ServiceFabricClientAPIs extends coreClient.ServiceClient {
  $host: HostOptions;
  apiVersion: string;

  /**
   * Initializes a new instance of the ServiceFabricClientAPIs class.
   * @param options The parameter options
   */
  constructor(options?: ServiceFabricClientAPIsOptionalParams) {
    // Initializing default values for options
    if (!options) {
      options = {};
    }
    const defaults: ServiceFabricClientAPIsOptionalParams = {
      requestContentType: "application/json; charset=utf-8"
    };

    const packageDetails = `azsdk-js-servicefabric/1.0.0-beta.1`;
    const userAgentPrefix =
      options.userAgentOptions && options.userAgentOptions.userAgentPrefix
        ? `${options.userAgentOptions.userAgentPrefix} ${packageDetails}`
        : `${packageDetails}`;

    const optionsWithDefaults = {
      ...defaults,
      ...options,
      userAgentOptions: {
        userAgentPrefix
      },
      endpoint: options.endpoint ?? options.baseUri ?? "http://localhost:19080/"
    };
    super(optionsWithDefaults);

    // Assigning values to Constant parameters
    this.$host = options.$host || "http://localhost:19080/";
    this.apiVersion = options.apiVersion || "8.2";
    this.meshSecret = new MeshSecretImpl(this);
    this.meshSecretValue = new MeshSecretValueImpl(this);
    this.meshVolume = new MeshVolumeImpl(this);
    this.meshNetwork = new MeshNetworkImpl(this);
    this.meshApplication = new MeshApplicationImpl(this);
    this.meshService = new MeshServiceImpl(this);
    this.meshCodePackage = new MeshCodePackageImpl(this);
    this.meshServiceReplica = new MeshServiceReplicaImpl(this);
    this.meshGateway = new MeshGatewayImpl(this);
    this.addCustomApiVersionPolicy(options.apiVersion);
  }

  /** A function that adds a policy that sets the api-version (or equivalent) to reflect the library version. */
  private addCustomApiVersionPolicy(apiVersion?: string) {
    if (!apiVersion) {
      return;
    }
    const apiVersionPolicy = {
      name: "CustomApiVersionPolicy",
      async sendRequest(
        request: PipelineRequest,
        next: SendRequest
      ): Promise<PipelineResponse> {
        const param = request.url.split("?");
        if (param.length > 1) {
          const newParams = param[1].split("&").map((item) => {
            if (item.indexOf("api-version") > -1) {
              return "api-version=" + apiVersion;
            } else {
              return item;
            }
          });
          request.url = param[0] + "?" + newParams.join("&");
        }
        return next(request);
      }
    };
    this.pipeline.addPolicy(apiVersionPolicy);
  }

  /**
   * Get the Service Fabric cluster manifest. The cluster manifest contains properties of the cluster
   * that include different node types on the cluster,
   * security configurations, fault, and upgrade domain topologies, etc.
   *
   * These properties are specified as part of the ClusterConfig.JSON file while deploying a stand-alone
   * cluster. However, most of the information in the cluster manifest
   * is generated internally by service fabric during cluster deployment in other deployment scenarios
   * (e.g. when using Azure portal).
   *
   * The contents of the cluster manifest are for informational purposes only and users are not expected
   * to take a dependency on the format of the file contents or its interpretation.
   * @param options The options parameters.
   */
  getClusterManifest(
    options?: GetClusterManifestOptionalParams
  ): Promise<GetClusterManifestResponse> {
    return this.sendOperationRequest(
      { options },
      getClusterManifestOperationSpec
    );
  }

  /**
   * Use EventsHealthStateFilter to filter the collection of health events reported on the cluster based
   * on the health state.
   * Similarly, use NodesHealthStateFilter and ApplicationsHealthStateFilter to filter the collection of
   * nodes and applications returned based on their aggregated health state.
   * @param options The options parameters.
   */
  getClusterHealth(
    options?: GetClusterHealthOptionalParams
  ): Promise<GetClusterHealthResponse> {
    return this.sendOperationRequest(
      { options },
      getClusterHealthOperationSpec
    );
  }

  /**
   * Use EventsHealthStateFilter to filter the collection of health events reported on the cluster based
   * on the health state.
   * Similarly, use NodesHealthStateFilter and ApplicationsHealthStateFilter to filter the collection of
   * nodes and applications returned based on their aggregated health state.
   * Use ClusterHealthPolicies to override the health policies used to evaluate the health.
   * @param options The options parameters.
   */
  getClusterHealthUsingPolicy(
    options?: GetClusterHealthUsingPolicyOptionalParams
  ): Promise<GetClusterHealthUsingPolicyResponse> {
    return this.sendOperationRequest(
      { options },
      getClusterHealthUsingPolicyOperationSpec
    );
  }

  /**
   * Gets the health of a Service Fabric cluster using health chunks. Includes the aggregated health
   * state of the cluster, but none of the cluster entities.
   * To expand the cluster health and get the health state of all or some of the entities, use the POST
   * URI and specify the cluster health chunk query description.
   * @param options The options parameters.
   */
  getClusterHealthChunk(
    options?: GetClusterHealthChunkOptionalParams
  ): Promise<GetClusterHealthChunkResponse> {
    return this.sendOperationRequest(
      { options },
      getClusterHealthChunkOperationSpec
    );
  }

  /**
   * Gets the health of a Service Fabric cluster using health chunks. The health evaluation is done based
   * on the input cluster health chunk query description.
   * The query description allows users to specify health policies for evaluating the cluster and its
   * children.
   * Users can specify very flexible filters to select which cluster entities to return. The selection
   * can be done based on the entities health state and based on the hierarchy.
   * The query can return multi-level children of the entities based on the specified filters. For
   * example, it can return one application with a specified name, and for this application, return
   * only services that are in Error or Warning, and all partitions and replicas for one of these
   * services.
   * @param options The options parameters.
   */
  getClusterHealthChunkUsingPolicyAndAdvancedFilters(
    options?: GetClusterHealthChunkUsingPolicyAndAdvancedFiltersOptionalParams
  ): Promise<GetClusterHealthChunkUsingPolicyAndAdvancedFiltersResponse> {
    return this.sendOperationRequest(
      { options },
      getClusterHealthChunkUsingPolicyAndAdvancedFiltersOperationSpec
    );
  }

  /**
   * Sends a health report on a Service Fabric cluster. The report must contain the information about the
   * source of the health report and property on which it is reported.
   * The report is sent to a Service Fabric gateway node, which forwards to the health store.
   * The report may be accepted by the gateway, but rejected by the health store after extra validation.
   * For example, the health store may reject the report because of an invalid parameter, like a stale
   * sequence number.
   * To see whether the report was applied in the health store, run GetClusterHealth and check that the
   * report appears in the HealthEvents section.
   * @param healthInformation Describes the health information for the health report. This information
   *                          needs to be present in all of the health reports sent to the health manager.
   * @param options The options parameters.
   */
  reportClusterHealth(
    healthInformation: HealthInformation,
    options?: ReportClusterHealthOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { healthInformation, options },
      reportClusterHealthOperationSpec
    );
  }

  /**
   * Gets a list of information about fabric code versions that are provisioned in the cluster. The
   * parameter CodeVersion can be used to optionally filter the output to only that particular version.
   * @param options The options parameters.
   */
  getProvisionedFabricCodeVersionInfoList(
    options?: GetProvisionedFabricCodeVersionInfoListOptionalParams
  ): Promise<GetProvisionedFabricCodeVersionInfoListResponse> {
    return this.sendOperationRequest(
      { options },
      getProvisionedFabricCodeVersionInfoListOperationSpec
    );
  }

  /**
   * Gets a list of information about fabric config versions that are provisioned in the cluster. The
   * parameter ConfigVersion can be used to optionally filter the output to only that particular version.
   * @param options The options parameters.
   */
  getProvisionedFabricConfigVersionInfoList(
    options?: GetProvisionedFabricConfigVersionInfoListOptionalParams
  ): Promise<GetProvisionedFabricConfigVersionInfoListResponse> {
    return this.sendOperationRequest(
      { options },
      getProvisionedFabricConfigVersionInfoListOperationSpec
    );
  }

  /**
   * Gets the current progress of the ongoing cluster upgrade. If no upgrade is currently in progress,
   * get the last state of the previous cluster upgrade.
   * @param options The options parameters.
   */
  getClusterUpgradeProgress(
    options?: GetClusterUpgradeProgressOptionalParams
  ): Promise<GetClusterUpgradeProgressResponse> {
    return this.sendOperationRequest(
      { options },
      getClusterUpgradeProgressOperationSpec
    );
  }

  /**
   * The cluster configuration contains properties of the cluster that include different node types on
   * the cluster,
   * security configurations, fault, and upgrade domain topologies, etc.
   * @param configurationApiVersion The API version of the Standalone cluster json configuration.
   * @param options The options parameters.
   */
  getClusterConfiguration(
    configurationApiVersion: string,
    options?: GetClusterConfigurationOptionalParams
  ): Promise<GetClusterConfigurationResponse> {
    return this.sendOperationRequest(
      { configurationApiVersion, options },
      getClusterConfigurationOperationSpec
    );
  }

  /**
   * Get the cluster configuration upgrade status details of a Service Fabric standalone cluster.
   * @param options The options parameters.
   */
  getClusterConfigurationUpgradeStatus(
    options?: GetClusterConfigurationUpgradeStatusOptionalParams
  ): Promise<GetClusterConfigurationUpgradeStatusResponse> {
    return this.sendOperationRequest(
      { options },
      getClusterConfigurationUpgradeStatusOperationSpec
    );
  }

  /**
   * Get the service state of Service Fabric Upgrade Orchestration Service. This API is internally used
   * for support purposes.
   * @param options The options parameters.
   */
  getUpgradeOrchestrationServiceState(
    options?: GetUpgradeOrchestrationServiceStateOptionalParams
  ): Promise<GetUpgradeOrchestrationServiceStateResponse> {
    return this.sendOperationRequest(
      { options },
      getUpgradeOrchestrationServiceStateOperationSpec
    );
  }

  /**
   * Update the service state of Service Fabric Upgrade Orchestration Service. This API is internally
   * used for support purposes.
   * @param upgradeOrchestrationServiceState Service state of Service Fabric Upgrade Orchestration
   *                                         Service.
   * @param options The options parameters.
   */
  setUpgradeOrchestrationServiceState(
    upgradeOrchestrationServiceState: UpgradeOrchestrationServiceState,
    options?: SetUpgradeOrchestrationServiceStateOptionalParams
  ): Promise<SetUpgradeOrchestrationServiceStateResponse> {
    return this.sendOperationRequest(
      { upgradeOrchestrationServiceState, options },
      setUpgradeOrchestrationServiceStateOperationSpec
    );
  }

  /**
   * Validate and provision the code or configuration packages of a Service Fabric cluster.
   * @param provisionFabricDescription Describes the parameters for provisioning a cluster.
   * @param options The options parameters.
   */
  provisionCluster(
    provisionFabricDescription: ProvisionFabricDescription,
    options?: ProvisionClusterOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { provisionFabricDescription, options },
      provisionClusterOperationSpec
    );
  }

  /**
   * It is supported to unprovision code and configuration separately.
   * @param unprovisionFabricDescription Describes the parameters for unprovisioning a cluster.
   * @param options The options parameters.
   */
  unprovisionCluster(
    unprovisionFabricDescription: UnprovisionFabricDescription,
    options?: UnprovisionClusterOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { unprovisionFabricDescription, options },
      unprovisionClusterOperationSpec
    );
  }

  /**
   * Roll back the code or configuration upgrade of a Service Fabric cluster.
   * @param options The options parameters.
   */
  rollbackClusterUpgrade(
    options?: RollbackClusterUpgradeOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { options },
      rollbackClusterUpgradeOperationSpec
    );
  }

  /**
   * Make the cluster code or configuration upgrade move on to the next upgrade domain if appropriate.
   * @param resumeClusterUpgradeDescription Describes the parameters for resuming a cluster upgrade.
   * @param options The options parameters.
   */
  resumeClusterUpgrade(
    resumeClusterUpgradeDescription: ResumeClusterUpgradeDescription,
    options?: ResumeClusterUpgradeOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { resumeClusterUpgradeDescription, options },
      resumeClusterUpgradeOperationSpec
    );
  }

  /**
   * Validate the supplied upgrade parameters and start upgrading the code or configuration version of a
   * Service Fabric cluster if the parameters are valid.
   * @param startClusterUpgradeDescription Describes the parameters for starting a cluster upgrade.
   * @param options The options parameters.
   */
  startClusterUpgrade(
    startClusterUpgradeDescription: StartClusterUpgradeDescription,
    options?: StartClusterUpgradeOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { startClusterUpgradeDescription, options },
      startClusterUpgradeOperationSpec
    );
  }

  /**
   * Validate the supplied configuration upgrade parameters and start upgrading the cluster configuration
   * if the parameters are valid.
   * @param clusterConfigurationUpgradeDescription Parameters for a standalone cluster configuration
   *                                               upgrade.
   * @param options The options parameters.
   */
  startClusterConfigurationUpgrade(
    clusterConfigurationUpgradeDescription: ClusterConfigurationUpgradeDescription,
    options?: StartClusterConfigurationUpgradeOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { clusterConfigurationUpgradeDescription, options },
      startClusterConfigurationUpgradeOperationSpec
    );
  }

  /**
   * Update the upgrade parameters used during a Service Fabric cluster upgrade.
   * @param updateClusterUpgradeDescription Parameters for updating a cluster upgrade.
   * @param options The options parameters.
   */
  updateClusterUpgrade(
    updateClusterUpgradeDescription: UpdateClusterUpgradeDescription,
    options?: UpdateClusterUpgradeOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { updateClusterUpgradeDescription, options },
      updateClusterUpgradeOperationSpec
    );
  }

  /**
   * Gets the Azure Active Directory metadata used for secured connection to cluster.
   * This API is not supposed to be called separately. It provides information needed to set up an Azure
   * Active Directory secured connection with a Service Fabric cluster.
   * @param options The options parameters.
   */
  getAadMetadata(
    options?: GetAadMetadataOptionalParams
  ): Promise<GetAadMetadataResponse> {
    return this.sendOperationRequest({ options }, getAadMetadataOperationSpec);
  }

  /**
   * If a cluster upgrade is happening, then this API will return the lowest (older) version of the
   * current and target cluster runtime versions.
   * @param options The options parameters.
   */
  getClusterVersion(
    options?: GetClusterVersionOptionalParams
  ): Promise<GetClusterVersionResponse> {
    return this.sendOperationRequest(
      { options },
      getClusterVersionOperationSpec
    );
  }

  /**
   * Retrieves the load information of a Service Fabric cluster for all the metrics that have load or
   * capacity defined.
   * @param options The options parameters.
   */
  getClusterLoad(
    options?: GetClusterLoadOptionalParams
  ): Promise<GetClusterLoadResponse> {
    return this.sendOperationRequest({ options }, getClusterLoadOperationSpec);
  }

  /**
   * If verbosity is set to true, then detailed health reports will be generated when replicas cannot be
   * placed or dropped.
   * If verbosity is set to false, then no health reports will be generated when replicas cannot be
   * placed or dropped.
   * @param enabled The verbosity of service placement health reporting.
   * @param options The options parameters.
   */
  toggleVerboseServicePlacementHealthReporting(
    enabled: boolean,
    options?: ToggleVerboseServicePlacementHealthReportingOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { enabled, options },
      toggleVerboseServicePlacementHealthReportingOperationSpec
    );
  }

  /**
   * Validate the supplied upgrade parameters and assess the expected impact of a code or configuration
   * version upgrade of a Service Fabric cluster. The upgrade will not be initiated.
   * @param startClusterUpgradeDescription Describes the parameters for starting a cluster upgrade.
   * @param options The options parameters.
   */
  validateClusterUpgrade(
    startClusterUpgradeDescription: StartClusterUpgradeDescription,
    options?: ValidateClusterUpgradeOptionalParams
  ): Promise<ValidateClusterUpgradeResponse> {
    return this.sendOperationRequest(
      { startClusterUpgradeDescription, options },
      validateClusterUpgradeOperationSpec
    );
  }

  /**
   * The response includes the name, status, ID, health, uptime, and other details about the nodes.
   * @param options The options parameters.
   */
  getNodeInfoList(
    options?: GetNodeInfoListOptionalParams
  ): Promise<GetNodeInfoListResponse> {
    return this.sendOperationRequest({ options }, getNodeInfoListOperationSpec);
  }

  /**
   * The response includes the name, status, ID, health, uptime, and other details about the node.
   * @param nodeName The name of the node.
   * @param options The options parameters.
   */
  getNodeInfo(
    nodeName: string,
    options?: GetNodeInfoOptionalParams
  ): Promise<GetNodeInfoResponse> {
    return this.sendOperationRequest(
      { nodeName, options },
      getNodeInfoOperationSpec
    );
  }

  /**
   * Gets the health of a Service Fabric node. Use EventsHealthStateFilter to filter the collection of
   * health events reported on the node based on the health state. If the node that you specify by name
   * does not exist in the health store, this returns an error.
   * @param nodeName The name of the node.
   * @param options The options parameters.
   */
  getNodeHealth(
    nodeName: string,
    options?: GetNodeHealthOptionalParams
  ): Promise<GetNodeHealthResponse> {
    return this.sendOperationRequest(
      { nodeName, options },
      getNodeHealthOperationSpec
    );
  }

  /**
   * Gets the health of a Service Fabric node. Use EventsHealthStateFilter to filter the collection of
   * health events reported on the node based on the health state. Use ClusterHealthPolicy in the POST
   * body to override the health policies used to evaluate the health. If the node that you specify by
   * name does not exist in the health store, this returns an error.
   * @param nodeName The name of the node.
   * @param options The options parameters.
   */
  getNodeHealthUsingPolicy(
    nodeName: string,
    options?: GetNodeHealthUsingPolicyOptionalParams
  ): Promise<GetNodeHealthUsingPolicyResponse> {
    return this.sendOperationRequest(
      { nodeName, options },
      getNodeHealthUsingPolicyOperationSpec
    );
  }

  /**
   * Reports health state of the specified Service Fabric node. The report must contain the information
   * about the source of the health report and property on which it is reported.
   * The report is sent to a Service Fabric gateway node, which forwards to the health store.
   * The report may be accepted by the gateway, but rejected by the health store after extra validation.
   * For example, the health store may reject the report because of an invalid parameter, like a stale
   * sequence number.
   * To see whether the report was applied in the health store, run GetNodeHealth and check that the
   * report appears in the HealthEvents section.
   * @param nodeName The name of the node.
   * @param healthInformation Describes the health information for the health report. This information
   *                          needs to be present in all of the health reports sent to the health manager.
   * @param options The options parameters.
   */
  reportNodeHealth(
    nodeName: string,
    healthInformation: HealthInformation,
    options?: ReportNodeHealthOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { nodeName, healthInformation, options },
      reportNodeHealthOperationSpec
    );
  }

  /**
   * Retrieves the load information of a Service Fabric node for all the metrics that have load or
   * capacity defined.
   * @param nodeName The name of the node.
   * @param options The options parameters.
   */
  getNodeLoadInfo(
    nodeName: string,
    options?: GetNodeLoadInfoOptionalParams
  ): Promise<GetNodeLoadInfoResponse> {
    return this.sendOperationRequest(
      { nodeName, options },
      getNodeLoadInfoOperationSpec
    );
  }

  /**
   * Deactivate a Service Fabric cluster node with the specified deactivation intent. Once the
   * deactivation is in progress, the deactivation intent can be increased, but not decreased (for
   * example, a node that is deactivated with the Pause intent can be deactivated further with Restart,
   * but not the other way around. Nodes may be reactivated using the Activate a node operation any time
   * after they are deactivated. If the deactivation is not complete, this will cancel the deactivation.
   * A node that goes down and comes back up while deactivated will still need to be reactivated before
   * services will be placed on that node.
   * @param nodeName The name of the node.
   * @param deactivationIntentDescription Describes the intent or reason for deactivating the node.
   * @param options The options parameters.
   */
  disableNode(
    nodeName: string,
    deactivationIntentDescription: DeactivationIntentDescription,
    options?: DisableNodeOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { nodeName, deactivationIntentDescription, options },
      disableNodeOperationSpec
    );
  }

  /**
   * Activates a Service Fabric cluster node that is currently deactivated. Once activated, the node will
   * again become a viable target for placing new replicas, and any deactivated replicas remaining on the
   * node will be reactivated.
   * @param nodeName The name of the node.
   * @param options The options parameters.
   */
  enableNode(
    nodeName: string,
    options?: EnableNodeOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { nodeName, options },
      enableNodeOperationSpec
    );
  }

  /**
   * This implies that it is not possible to recover the persisted state of that node. This generally
   * happens if a hard disk has been wiped clean, or if a hard disk crashes. The node has to be down for
   * this operation to be successful. This operation lets Service Fabric know that the replicas on that
   * node no longer exist, and that Service Fabric should stop waiting for those replicas to come back
   * up. Do not run this cmdlet if the state on the node has not been removed and the node can come back
   * up with its state intact. Starting from Service Fabric 6.5, in order to use this API for seed nodes,
   * please change the seed nodes to regular (non-seed) nodes and then invoke this API to remove the node
   * state. If the cluster is running on Azure, after the seed node goes down, Service Fabric will try to
   * change it to a non-seed node automatically. To make this happen, make sure the number of non-seed
   * nodes in the primary node type is no less than the number of Down seed nodes. If necessary, add more
   * nodes to the primary node type to achieve this. For standalone cluster, if the Down seed node is not
   * expected to come back up with its state intact, please remove the node from the cluster, see
   * https://docs.microsoft.com/azure/service-fabric/service-fabric-cluster-windows-server-add-remove-nodes
   * @param nodeName The name of the node.
   * @param options The options parameters.
   */
  removeNodeState(
    nodeName: string,
    options?: RemoveNodeStateOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { nodeName, options },
      removeNodeStateOperationSpec
    );
  }

  /**
   * Restarts a Service Fabric cluster node that is already started.
   * @param nodeName The name of the node.
   * @param restartNodeDescription The instance of the node to be restarted and a flag indicating the
   *                               need to take dump of the fabric process.
   * @param options The options parameters.
   */
  restartNode(
    nodeName: string,
    restartNodeDescription: RestartNodeDescription,
    options?: RestartNodeOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { nodeName, restartNodeDescription, options },
      restartNodeOperationSpec
    );
  }

  /**
   * This api allows removing all existing configuration overrides on specified node.
   * @param nodeName The name of the node.
   * @param options The options parameters.
   */
  removeConfigurationOverrides(
    nodeName: string,
    options?: RemoveConfigurationOverridesOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { nodeName, options },
      removeConfigurationOverridesOperationSpec
    );
  }

  /**
   * This api allows getting all existing configuration overrides on the specified node.
   * @param nodeName The name of the node.
   * @param options The options parameters.
   */
  getConfigurationOverrides(
    nodeName: string,
    options?: GetConfigurationOverridesOptionalParams
  ): Promise<GetConfigurationOverridesResponse> {
    return this.sendOperationRequest(
      { nodeName, options },
      getConfigurationOverridesOperationSpec
    );
  }

  /**
   * This api allows adding all existing configuration overrides on the specified node.
   * @param nodeName The name of the node.
   * @param configParameterOverrideList Description for adding list of configuration overrides.
   * @param options The options parameters.
   */
  addConfigurationParameterOverrides(
    nodeName: string,
    configParameterOverrideList: ConfigParameterOverride[],
    options?: AddConfigurationParameterOverridesOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { nodeName, configParameterOverrideList, options },
      addConfigurationParameterOverridesOperationSpec
    );
  }

  /**
   * This api allows removing set of tags from the specified node.
   * @param nodeName The name of the node.
   * @param nodeTags Description for adding list of node tags.
   * @param options The options parameters.
   */
  removeNodeTags(
    nodeName: string,
    nodeTags: string[],
    options?: RemoveNodeTagsOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { nodeName, nodeTags, options },
      removeNodeTagsOperationSpec
    );
  }

  /**
   * This api allows adding tags to the specified node.
   * @param nodeName The name of the node.
   * @param nodeTags Description for adding list of node tags.
   * @param options The options parameters.
   */
  addNodeTags(
    nodeName: string,
    nodeTags: string[],
    options?: AddNodeTagsOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { nodeName, nodeTags, options },
      addNodeTagsOperationSpec
    );
  }

  /**
   * Returns the information about the application types that are provisioned or in the process of being
   * provisioned in the Service Fabric cluster. Each version of an application type is returned as one
   * application type. The response includes the name, version, status, and other details about the
   * application type. This is a paged query, meaning that if not all of the application types fit in a
   * page, one page of results is returned as well as a continuation token, which can be used to get the
   * next page. For example, if there are 10 application types but a page only fits the first three
   * application types, or if max results is set to 3, then three is returned. To access the rest of the
   * results, retrieve subsequent pages by using the returned continuation token in the next query. An
   * empty continuation token is returned if there are no subsequent pages.
   * @param options The options parameters.
   */
  getApplicationTypeInfoList(
    options?: GetApplicationTypeInfoListOptionalParams
  ): Promise<GetApplicationTypeInfoListResponse> {
    return this.sendOperationRequest(
      { options },
      getApplicationTypeInfoListOperationSpec
    );
  }

  /**
   * Returns the information about the application types that are provisioned or in the process of being
   * provisioned in the Service Fabric cluster. These results are of application types whose name match
   * exactly the one specified as the parameter, and which comply with the given query parameters. All
   * versions of the application type matching the application type name are returned, with each version
   * returned as one application type. The response includes the name, version, status, and other details
   * about the application type. This is a paged query, meaning that if not all of the application types
   * fit in a page, one page of results is returned as well as a continuation token, which can be used to
   * get the next page. For example, if there are 10 application types but a page only fits the first
   * three application types, or if max results is set to 3, then three is returned. To access the rest
   * of the results, retrieve subsequent pages by using the returned continuation token in the next
   * query. An empty continuation token is returned if there are no subsequent pages.
   * @param applicationTypeName The name of the application type.
   * @param options The options parameters.
   */
  getApplicationTypeInfoListByName(
    applicationTypeName: string,
    options?: GetApplicationTypeInfoListByNameOptionalParams
  ): Promise<GetApplicationTypeInfoListByNameResponse> {
    return this.sendOperationRequest(
      { applicationTypeName, options },
      getApplicationTypeInfoListByNameOperationSpec
    );
  }

  /**
   * Provisions a Service Fabric application type with the cluster. The provision is required before any
   * new applications can be instantiated.
   * The provision operation can be performed either on the application package specified by the
   * relativePathInImageStore, or by using the URI of the external '.sfpkg'.
   * @param provisionApplicationTypeDescriptionBaseRequiredBodyParam The base type of provision
   *                                                                 application type description which supports either image store-based provision or external
   *                                                                 store-based provision.
   * @param options The options parameters.
   */
  provisionApplicationType(
    provisionApplicationTypeDescriptionBaseRequiredBodyParam: ProvisionApplicationTypeDescriptionBaseUnion,
    options?: ProvisionApplicationTypeOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { provisionApplicationTypeDescriptionBaseRequiredBodyParam, options },
      provisionApplicationTypeOperationSpec
    );
  }

  /**
   * This operation can only be performed if all application instances of the application type have been
   * deleted. Once the application type is unregistered, no new application instances can be created for
   * this particular application type.
   * @param applicationTypeName The name of the application type.
   * @param unprovisionApplicationTypeDescriptionInfo The relative path for the application package in
   *                                                  the image store specified during the prior copy operation.
   * @param options The options parameters.
   */
  unprovisionApplicationType(
    applicationTypeName: string,
    unprovisionApplicationTypeDescriptionInfo: UnprovisionApplicationTypeDescriptionInfo,
    options?: UnprovisionApplicationTypeOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      {
        applicationTypeName,
        unprovisionApplicationTypeDescriptionInfo,
        options
      },
      unprovisionApplicationTypeOperationSpec
    );
  }

  /**
   * Gets the list containing the information about service types that are supported by a provisioned
   * application type in a Service Fabric cluster. The provided application type must exist. Otherwise, a
   * 404 status is returned.
   * @param applicationTypeName The name of the application type.
   * @param applicationTypeVersion The version of the application type.
   * @param options The options parameters.
   */
  getServiceTypeInfoList(
    applicationTypeName: string,
    applicationTypeVersion: string,
    options?: GetServiceTypeInfoListOptionalParams
  ): Promise<GetServiceTypeInfoListResponse> {
    return this.sendOperationRequest(
      { applicationTypeName, applicationTypeVersion, options },
      getServiceTypeInfoListOperationSpec
    );
  }

  /**
   * Gets the information about a specific service type that is supported by a provisioned application
   * type in a Service Fabric cluster. The provided application type must exist. Otherwise, a 404 status
   * is returned. A 204 response is returned if the specified service type is not found in the cluster.
   * @param applicationTypeName The name of the application type.
   * @param applicationTypeVersion The version of the application type.
   * @param serviceTypeName Specifies the name of a Service Fabric service type.
   * @param options The options parameters.
   */
  getServiceTypeInfoByName(
    applicationTypeName: string,
    applicationTypeVersion: string,
    serviceTypeName: string,
    options?: GetServiceTypeInfoByNameOptionalParams
  ): Promise<GetServiceTypeInfoByNameResponse> {
    return this.sendOperationRequest(
      { applicationTypeName, applicationTypeVersion, serviceTypeName, options },
      getServiceTypeInfoByNameOperationSpec
    );
  }

  /**
   * Gets the manifest describing a service type. The response contains the service manifest XML as a
   * string.
   * @param applicationTypeName The name of the application type.
   * @param applicationTypeVersion The version of the application type.
   * @param serviceManifestName The name of a service manifest registered as part of an application type
   *                            in a Service Fabric cluster.
   * @param options The options parameters.
   */
  getServiceManifest(
    applicationTypeName: string,
    applicationTypeVersion: string,
    serviceManifestName: string,
    options?: GetServiceManifestOptionalParams
  ): Promise<GetServiceManifestResponse> {
    return this.sendOperationRequest(
      {
        applicationTypeName,
        applicationTypeVersion,
        serviceManifestName,
        options
      },
      getServiceManifestOperationSpec
    );
  }

  /**
   * Gets the list containing the information about service types from the applications deployed on a
   * node in a Service Fabric cluster. The response includes the name of the service type, its
   * registration status, the code package that registered it and activation ID of the service package.
   * @param nodeName The name of the node.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param options The options parameters.
   */
  getDeployedServiceTypeInfoList(
    nodeName: string,
    applicationId: string,
    options?: GetDeployedServiceTypeInfoListOptionalParams
  ): Promise<GetDeployedServiceTypeInfoListResponse> {
    return this.sendOperationRequest(
      { nodeName, applicationId, options },
      getDeployedServiceTypeInfoListOperationSpec
    );
  }

  /**
   * Gets the list containing the information about a specific service type from the applications
   * deployed on a node in a Service Fabric cluster. The response includes the name of the service type,
   * its registration status, the code package that registered it and activation ID of the service
   * package. Each entry represents one activation of a service type, differentiated by the activation
   * ID.
   * @param nodeName The name of the node.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param serviceTypeName Specifies the name of a Service Fabric service type.
   * @param options The options parameters.
   */
  getDeployedServiceTypeInfoByName(
    nodeName: string,
    applicationId: string,
    serviceTypeName: string,
    options?: GetDeployedServiceTypeInfoByNameOptionalParams
  ): Promise<GetDeployedServiceTypeInfoByNameResponse> {
    return this.sendOperationRequest(
      { nodeName, applicationId, serviceTypeName, options },
      getDeployedServiceTypeInfoByNameOperationSpec
    );
  }

  /**
   * Creates a Service Fabric application using the specified description.
   * @param applicationDescription Description for creating an application.
   * @param options The options parameters.
   */
  createApplication(
    applicationDescription: ApplicationDescription,
    options?: CreateApplicationOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { applicationDescription, options },
      createApplicationOperationSpec
    );
  }

  /**
   * An application must be created before it can be deleted. Deleting an application will delete all
   * services that are part of that application. By default, Service Fabric will try to close service
   * replicas in a graceful manner and then delete the service. However, if a service is having issues
   * closing the replica gracefully, the delete operation may take a long time or get stuck. Use the
   * optional ForceRemove flag to skip the graceful close sequence and forcefully delete the application
   * and all of its services.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param options The options parameters.
   */
  deleteApplication(
    applicationId: string,
    options?: DeleteApplicationOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { applicationId, options },
      deleteApplicationOperationSpec
    );
  }

  /**
   * Returns the load information about the application that was created or in the process of being
   * created in the Service Fabric cluster and whose name matches the one specified as the parameter. The
   * response includes the name, minimum nodes, maximum nodes, the number of nodes the application is
   * occupying currently, and application load metric information about the application.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param options The options parameters.
   */
  getApplicationLoadInfo(
    applicationId: string,
    options?: GetApplicationLoadInfoOptionalParams
  ): Promise<GetApplicationLoadInfoResponse> {
    return this.sendOperationRequest(
      { applicationId, options },
      getApplicationLoadInfoOperationSpec
    );
  }

  /**
   * Gets the information about the applications that were created or in the process of being created in
   * the Service Fabric cluster and match the specified filters. The response includes the name, type,
   * status, parameters, and other details about the application. If the applications do not fit in a
   * page, one page of results is returned as well as a continuation token, which can be used to get the
   * next page. Filters ApplicationTypeName and ApplicationDefinitionKindFilter cannot be specified at
   * the same time.
   * @param options The options parameters.
   */
  getApplicationInfoList(
    options?: GetApplicationInfoListOptionalParams
  ): Promise<GetApplicationInfoListResponse> {
    return this.sendOperationRequest(
      { options },
      getApplicationInfoListOperationSpec
    );
  }

  /**
   * Returns the information about the application that was created or in the process of being created in
   * the Service Fabric cluster and whose name matches the one specified as the parameter. The response
   * includes the name, type, status, parameters, and other details about the application.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param options The options parameters.
   */
  getApplicationInfo(
    applicationId: string,
    options?: GetApplicationInfoOptionalParams
  ): Promise<GetApplicationInfoResponse> {
    return this.sendOperationRequest(
      { applicationId, options },
      getApplicationInfoOperationSpec
    );
  }

  /**
   * Returns the heath state of the service fabric application. The response reports either Ok, Error or
   * Warning health state. If the entity is not found in the health store, it will return Error.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param options The options parameters.
   */
  getApplicationHealth(
    applicationId: string,
    options?: GetApplicationHealthOptionalParams
  ): Promise<GetApplicationHealthResponse> {
    return this.sendOperationRequest(
      { applicationId, options },
      getApplicationHealthOperationSpec
    );
  }

  /**
   * Gets the health of a Service Fabric application. Use EventsHealthStateFilter to filter the
   * collection of health events reported on the node based on the health state. Use
   * ClusterHealthPolicies to override the health policies used to evaluate the health.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param options The options parameters.
   */
  getApplicationHealthUsingPolicy(
    applicationId: string,
    options?: GetApplicationHealthUsingPolicyOptionalParams
  ): Promise<GetApplicationHealthUsingPolicyResponse> {
    return this.sendOperationRequest(
      { applicationId, options },
      getApplicationHealthUsingPolicyOperationSpec
    );
  }

  /**
   * Reports health state of the specified Service Fabric application. The report must contain the
   * information about the source of the health report and property on which it is reported.
   * The report is sent to a Service Fabric gateway Application, which forwards to the health store.
   * The report may be accepted by the gateway, but rejected by the health store after extra validation.
   * For example, the health store may reject the report because of an invalid parameter, like a stale
   * sequence number.
   * To see whether the report was applied in the health store, get application health and check that the
   * report appears in the HealthEvents section.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param healthInformation Describes the health information for the health report. This information
   *                          needs to be present in all of the health reports sent to the health manager.
   * @param options The options parameters.
   */
  reportApplicationHealth(
    applicationId: string,
    healthInformation: HealthInformation,
    options?: ReportApplicationHealthOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { applicationId, healthInformation, options },
      reportApplicationHealthOperationSpec
    );
  }

  /**
   * Validates the supplied application upgrade parameters and starts upgrading the application if the
   * parameters are valid.
   * Note,
   * [ApplicationParameter](https://docs.microsoft.com/dotnet/api/system.fabric.description.applicationdescription.applicationparameters)s
   * are not preserved across an application upgrade.
   * In order to preserve current application parameters, the user should get the parameters using
   * [GetApplicationInfo](./GetApplicationInfo.md) operation first and pass them into the upgrade API
   * call as shown in the example.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param applicationUpgradeDescription Parameters for an application upgrade.
   * @param options The options parameters.
   */
  startApplicationUpgrade(
    applicationId: string,
    applicationUpgradeDescription: ApplicationUpgradeDescription,
    options?: StartApplicationUpgradeOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { applicationId, applicationUpgradeDescription, options },
      startApplicationUpgradeOperationSpec
    );
  }

  /**
   * Returns information about the state of the latest application upgrade along with details to aid
   * debugging application health issues.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param options The options parameters.
   */
  getApplicationUpgrade(
    applicationId: string,
    options?: GetApplicationUpgradeOptionalParams
  ): Promise<GetApplicationUpgradeResponse> {
    return this.sendOperationRequest(
      { applicationId, options },
      getApplicationUpgradeOperationSpec
    );
  }

  /**
   * Updates the parameters of an ongoing application upgrade from the ones specified at the time of
   * starting the application upgrade. This may be required to mitigate stuck application upgrades due to
   * incorrect parameters or issues in the application to make progress.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param applicationUpgradeUpdateDescription Parameters for updating an existing application upgrade.
   * @param options The options parameters.
   */
  updateApplicationUpgrade(
    applicationId: string,
    applicationUpgradeUpdateDescription: ApplicationUpgradeUpdateDescription,
    options?: UpdateApplicationUpgradeOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { applicationId, applicationUpgradeUpdateDescription, options },
      updateApplicationUpgradeOperationSpec
    );
  }

  /**
   * Updates a Service Fabric application instance. The set of properties that can be updated are a
   * subset of the properties that were specified at the time of creating the application.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param applicationUpdateDescription Parameters for updating an existing application instance.
   * @param options The options parameters.
   */
  updateApplication(
    applicationId: string,
    applicationUpdateDescription: ApplicationUpdateDescription,
    options?: UpdateApplicationOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { applicationId, applicationUpdateDescription, options },
      updateApplicationOperationSpec
    );
  }

  /**
   * Resumes an unmonitored manual Service Fabric application upgrade. Service Fabric upgrades one
   * upgrade domain at a time. For unmonitored manual upgrades, after Service Fabric finishes an upgrade
   * domain, it waits for you to call this API before proceeding to the next upgrade domain.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param resumeApplicationUpgradeDescription Describes the parameters for resuming an application
   *                                            upgrade.
   * @param options The options parameters.
   */
  resumeApplicationUpgrade(
    applicationId: string,
    resumeApplicationUpgradeDescription: ResumeApplicationUpgradeDescription,
    options?: ResumeApplicationUpgradeOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { applicationId, resumeApplicationUpgradeDescription, options },
      resumeApplicationUpgradeOperationSpec
    );
  }

  /**
   * Starts rolling back the current application upgrade to the previous version. This API can only be
   * used to roll back the current in-progress upgrade that is rolling forward to new version. If the
   * application is not currently being upgraded use StartApplicationUpgrade API to upgrade it to desired
   * version, including rolling back to a previous version.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param options The options parameters.
   */
  rollbackApplicationUpgrade(
    applicationId: string,
    options?: RollbackApplicationUpgradeOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { applicationId, options },
      rollbackApplicationUpgradeOperationSpec
    );
  }

  /**
   * Gets the list of applications deployed on a Service Fabric node. The results do not include
   * information about deployed system applications unless explicitly queried for by ID. Results
   * encompass deployed applications in active, activating, and downloading states. This query requires
   * that the node name corresponds to a node on the cluster. The query fails if the provided node name
   * does not point to any active Service Fabric nodes on the cluster.
   * @param nodeName The name of the node.
   * @param options The options parameters.
   */
  getDeployedApplicationInfoList(
    nodeName: string,
    options?: GetDeployedApplicationInfoListOptionalParams
  ): Promise<GetDeployedApplicationInfoListResponse> {
    return this.sendOperationRequest(
      { nodeName, options },
      getDeployedApplicationInfoListOperationSpec
    );
  }

  /**
   * This query returns system application information if the application ID provided is for system
   * application. Results encompass deployed applications in active, activating, and downloading states.
   * This query requires that the node name corresponds to a node on the cluster. The query fails if the
   * provided node name does not point to any active Service Fabric nodes on the cluster.
   * @param nodeName The name of the node.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param options The options parameters.
   */
  getDeployedApplicationInfo(
    nodeName: string,
    applicationId: string,
    options?: GetDeployedApplicationInfoOptionalParams
  ): Promise<GetDeployedApplicationInfoResponse> {
    return this.sendOperationRequest(
      { nodeName, applicationId, options },
      getDeployedApplicationInfoOperationSpec
    );
  }

  /**
   * Gets the information about health of an application deployed on a Service Fabric node. Use
   * EventsHealthStateFilter to optionally filter for the collection of HealthEvent objects reported on
   * the deployed application based on health state. Use DeployedServicePackagesHealthStateFilter to
   * optionally filter for DeployedServicePackageHealth children based on health state.
   * @param nodeName The name of the node.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param options The options parameters.
   */
  getDeployedApplicationHealth(
    nodeName: string,
    applicationId: string,
    options?: GetDeployedApplicationHealthOptionalParams
  ): Promise<GetDeployedApplicationHealthResponse> {
    return this.sendOperationRequest(
      { nodeName, applicationId, options },
      getDeployedApplicationHealthOperationSpec
    );
  }

  /**
   * Gets the information about health of an application deployed on a Service Fabric node using the
   * specified policy. Use EventsHealthStateFilter to optionally filter for the collection of HealthEvent
   * objects reported on the deployed application based on health state. Use
   * DeployedServicePackagesHealthStateFilter to optionally filter for DeployedServicePackageHealth
   * children based on health state. Use ApplicationHealthPolicy to optionally override the health
   * policies used to evaluate the health. This API only uses 'ConsiderWarningAsError' field of the
   * ApplicationHealthPolicy. The rest of the fields are ignored while evaluating the health of the
   * deployed application.
   * @param nodeName The name of the node.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param options The options parameters.
   */
  getDeployedApplicationHealthUsingPolicy(
    nodeName: string,
    applicationId: string,
    options?: GetDeployedApplicationHealthUsingPolicyOptionalParams
  ): Promise<GetDeployedApplicationHealthUsingPolicyResponse> {
    return this.sendOperationRequest(
      { nodeName, applicationId, options },
      getDeployedApplicationHealthUsingPolicyOperationSpec
    );
  }

  /**
   * Reports health state of the application deployed on a Service Fabric node. The report must contain
   * the information about the source of the health report and property on which it is reported.
   * The report is sent to a Service Fabric gateway Service, which forwards to the health store.
   * The report may be accepted by the gateway, but rejected by the health store after extra validation.
   * For example, the health store may reject the report because of an invalid parameter, like a stale
   * sequence number.
   * To see whether the report was applied in the health store, get deployed application health and check
   * that the report appears in the HealthEvents section.
   * @param nodeName The name of the node.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param healthInformation Describes the health information for the health report. This information
   *                          needs to be present in all of the health reports sent to the health manager.
   * @param options The options parameters.
   */
  reportDeployedApplicationHealth(
    nodeName: string,
    applicationId: string,
    healthInformation: HealthInformation,
    options?: ReportDeployedApplicationHealthOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { nodeName, applicationId, healthInformation, options },
      reportDeployedApplicationHealthOperationSpec
    );
  }

  /**
   * The response contains the application manifest XML as a string.
   * @param applicationTypeName The name of the application type.
   * @param applicationTypeVersion The version of the application type.
   * @param options The options parameters.
   */
  getApplicationManifest(
    applicationTypeName: string,
    applicationTypeVersion: string,
    options?: GetApplicationManifestOptionalParams
  ): Promise<GetApplicationManifestResponse> {
    return this.sendOperationRequest(
      { applicationTypeName, applicationTypeVersion, options },
      getApplicationManifestOperationSpec
    );
  }

  /**
   * Returns the information about all services belonging to the application specified by the application
   * ID.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param options The options parameters.
   */
  getServiceInfoList(
    applicationId: string,
    options?: GetServiceInfoListOptionalParams
  ): Promise<GetServiceInfoListResponse> {
    return this.sendOperationRequest(
      { applicationId, options },
      getServiceInfoListOperationSpec
    );
  }

  /**
   * Returns the information about the specified service belonging to the specified Service Fabric
   * application.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param serviceId The identity of the service. This ID is typically the full name of the service
   *                  without the 'fabric:' URI scheme.
   *                  Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                  For example, if the service name is "fabric:/myapp/app1/svc1", the service identity would be
   *                  "myapp~app1~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   * @param options The options parameters.
   */
  getServiceInfo(
    applicationId: string,
    serviceId: string,
    options?: GetServiceInfoOptionalParams
  ): Promise<GetServiceInfoResponse> {
    return this.sendOperationRequest(
      { applicationId, serviceId, options },
      getServiceInfoOperationSpec
    );
  }

  /**
   * Gets the name of the application for the specified service. A 404 FABRIC_E_SERVICE_DOES_NOT_EXIST
   * error is returned if a service with the provided service ID does not exist.
   * @param serviceId The identity of the service. This ID is typically the full name of the service
   *                  without the 'fabric:' URI scheme.
   *                  Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                  For example, if the service name is "fabric:/myapp/app1/svc1", the service identity would be
   *                  "myapp~app1~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   * @param options The options parameters.
   */
  getApplicationNameInfo(
    serviceId: string,
    options?: GetApplicationNameInfoOptionalParams
  ): Promise<GetApplicationNameInfoResponse> {
    return this.sendOperationRequest(
      { serviceId, options },
      getApplicationNameInfoOperationSpec
    );
  }

  /**
   * This api allows creating a new Service Fabric stateless or stateful service under a specified
   * Service Fabric application. The description for creating the service includes partitioning
   * information and optional properties for placement and load balancing. Some of the properties can
   * later be modified using `UpdateService` API.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param serviceDescription The information necessary to create a service.
   * @param options The options parameters.
   */
  createService(
    applicationId: string,
    serviceDescription: ServiceDescriptionUnion,
    options?: CreateServiceOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { applicationId, serviceDescription, options },
      createServiceOperationSpec
    );
  }

  /**
   * Creates a Service Fabric service from the service template defined in the application manifest. A
   * service template contains the properties that will be same for the service instance of the same
   * type. The API allows overriding the properties that are usually different for different services of
   * the same service type.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param serviceFromTemplateDescription Describes the service that needs to be created from the
   *                                       template defined in the application manifest.
   * @param options The options parameters.
   */
  createServiceFromTemplate(
    applicationId: string,
    serviceFromTemplateDescription: ServiceFromTemplateDescription,
    options?: CreateServiceFromTemplateOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { applicationId, serviceFromTemplateDescription, options },
      createServiceFromTemplateOperationSpec
    );
  }

  /**
   * A service must be created before it can be deleted. By default, Service Fabric will try to close
   * service replicas in a graceful manner and then delete the service. However, if the service is having
   * issues closing the replica gracefully, the delete operation may take a long time or get stuck. Use
   * the optional ForceRemove flag to skip the graceful close sequence and forcefully delete the service.
   * @param serviceId The identity of the service. This ID is typically the full name of the service
   *                  without the 'fabric:' URI scheme.
   *                  Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                  For example, if the service name is "fabric:/myapp/app1/svc1", the service identity would be
   *                  "myapp~app1~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   * @param options The options parameters.
   */
  deleteService(
    serviceId: string,
    options?: DeleteServiceOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { serviceId, options },
      deleteServiceOperationSpec
    );
  }

  /**
   * This API allows updating properties of a running Service Fabric service. The set of properties that
   * can be updated are a subset of the properties that were specified at the time of creating the
   * service. The current set of properties can be obtained using `GetServiceDescription` API. Note that
   * updating the properties of a running service is different than upgrading your application using
   * `StartApplicationUpgrade` API. The upgrade is a long running background operation that involves
   * moving the application from one version to another, one upgrade domain at a time, whereas update
   * applies the new properties immediately to the service.
   * @param serviceId The identity of the service. This ID is typically the full name of the service
   *                  without the 'fabric:' URI scheme.
   *                  Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                  For example, if the service name is "fabric:/myapp/app1/svc1", the service identity would be
   *                  "myapp~app1~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   * @param serviceUpdateDescription The information necessary to update a service.
   * @param options The options parameters.
   */
  updateService(
    serviceId: string,
    serviceUpdateDescription: ServiceUpdateDescriptionUnion,
    options?: UpdateServiceOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { serviceId, serviceUpdateDescription, options },
      updateServiceOperationSpec
    );
  }

  /**
   * Gets the description of an existing Service Fabric service. A service must be created before its
   * description can be obtained.
   * @param serviceId The identity of the service. This ID is typically the full name of the service
   *                  without the 'fabric:' URI scheme.
   *                  Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                  For example, if the service name is "fabric:/myapp/app1/svc1", the service identity would be
   *                  "myapp~app1~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   * @param options The options parameters.
   */
  getServiceDescription(
    serviceId: string,
    options?: GetServiceDescriptionOptionalParams
  ): Promise<GetServiceDescriptionResponse> {
    return this.sendOperationRequest(
      { serviceId, options },
      getServiceDescriptionOperationSpec
    );
  }

  /**
   * Gets the health information of the specified service.
   * Use EventsHealthStateFilter to filter the collection of health events reported on the service based
   * on the health state.
   * Use PartitionsHealthStateFilter to filter the collection of partitions returned.
   * If you specify a service that does not exist in the health store, this request returns an error.
   * @param serviceId The identity of the service. This ID is typically the full name of the service
   *                  without the 'fabric:' URI scheme.
   *                  Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                  For example, if the service name is "fabric:/myapp/app1/svc1", the service identity would be
   *                  "myapp~app1~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   * @param options The options parameters.
   */
  getServiceHealth(
    serviceId: string,
    options?: GetServiceHealthOptionalParams
  ): Promise<GetServiceHealthResponse> {
    return this.sendOperationRequest(
      { serviceId, options },
      getServiceHealthOperationSpec
    );
  }

  /**
   * Gets the health information of the specified service.
   * If the application health policy is specified, the health evaluation uses it to get the aggregated
   * health state.
   * If the policy is not specified, the health evaluation uses the application health policy defined in
   * the application manifest, or the default health policy, if no policy is defined in the manifest.
   * Use EventsHealthStateFilter to filter the collection of health events reported on the service based
   * on the health state.
   * Use PartitionsHealthStateFilter to filter the collection of partitions returned.
   * If you specify a service that does not exist in the health store, this request returns an error.
   * @param serviceId The identity of the service. This ID is typically the full name of the service
   *                  without the 'fabric:' URI scheme.
   *                  Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                  For example, if the service name is "fabric:/myapp/app1/svc1", the service identity would be
   *                  "myapp~app1~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   * @param options The options parameters.
   */
  getServiceHealthUsingPolicy(
    serviceId: string,
    options?: GetServiceHealthUsingPolicyOptionalParams
  ): Promise<GetServiceHealthUsingPolicyResponse> {
    return this.sendOperationRequest(
      { serviceId, options },
      getServiceHealthUsingPolicyOperationSpec
    );
  }

  /**
   * Reports health state of the specified Service Fabric service. The report must contain the
   * information about the source of the health report and property on which it is reported.
   * The report is sent to a Service Fabric gateway Service, which forwards to the health store.
   * The report may be accepted by the gateway, but rejected by the health store after extra validation.
   * For example, the health store may reject the report because of an invalid parameter, like a stale
   * sequence number.
   * To see whether the report was applied in the health store, run GetServiceHealth and check that the
   * report appears in the HealthEvents section.
   * @param serviceId The identity of the service. This ID is typically the full name of the service
   *                  without the 'fabric:' URI scheme.
   *                  Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                  For example, if the service name is "fabric:/myapp/app1/svc1", the service identity would be
   *                  "myapp~app1~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   * @param healthInformation Describes the health information for the health report. This information
   *                          needs to be present in all of the health reports sent to the health manager.
   * @param options The options parameters.
   */
  reportServiceHealth(
    serviceId: string,
    healthInformation: HealthInformation,
    options?: ReportServiceHealthOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { serviceId, healthInformation, options },
      reportServiceHealthOperationSpec
    );
  }

  /**
   * Resolve a Service Fabric service partition to get the endpoints of the service replicas.
   * @param serviceId The identity of the service. This ID is typically the full name of the service
   *                  without the 'fabric:' URI scheme.
   *                  Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                  For example, if the service name is "fabric:/myapp/app1/svc1", the service identity would be
   *                  "myapp~app1~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   * @param options The options parameters.
   */
  resolveService(
    serviceId: string,
    options?: ResolveServiceOptionalParams
  ): Promise<ResolveServiceResponse> {
    return this.sendOperationRequest(
      { serviceId, options },
      resolveServiceOperationSpec
    );
  }

  /**
   * Returns the information about the unplaced replicas of the service.
   * If PartitionId is specified, then result will contain information only about unplaced replicas for
   * that partition.
   * If PartitionId is not specified, then result will contain information about unplaced replicas for
   * all partitions of that service.
   * If OnlyQueryPrimaries is set to true, then result will contain information only about primary
   * replicas, and will ignore unplaced secondary replicas.
   * @param serviceId The identity of the service. This ID is typically the full name of the service
   *                  without the 'fabric:' URI scheme.
   *                  Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                  For example, if the service name is "fabric:/myapp/app1/svc1", the service identity would be
   *                  "myapp~app1~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   * @param options The options parameters.
   */
  getUnplacedReplicaInformation(
    serviceId: string,
    options?: GetUnplacedReplicaInformationOptionalParams
  ): Promise<GetUnplacedReplicaInformationResponse> {
    return this.sendOperationRequest(
      { serviceId, options },
      getUnplacedReplicaInformationOperationSpec
    );
  }

  /**
   * Retrieves partitions which are most/least loaded according to specified metric.
   * @param metricName Name of the metric based on which to get ordered list of partitions.
   * @param options The options parameters.
   */
  getLoadedPartitionInfoList(
    metricName: string,
    options?: GetLoadedPartitionInfoListOptionalParams
  ): Promise<GetLoadedPartitionInfoListResponse> {
    return this.sendOperationRequest(
      { metricName, options },
      getLoadedPartitionInfoListOperationSpec
    );
  }

  /**
   * The response includes the partition ID, partitioning scheme information, keys supported by the
   * partition, status, health, and other details about the partition.
   * @param serviceId The identity of the service. This ID is typically the full name of the service
   *                  without the 'fabric:' URI scheme.
   *                  Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                  For example, if the service name is "fabric:/myapp/app1/svc1", the service identity would be
   *                  "myapp~app1~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   * @param options The options parameters.
   */
  getPartitionInfoList(
    serviceId: string,
    options?: GetPartitionInfoListOptionalParams
  ): Promise<GetPartitionInfoListResponse> {
    return this.sendOperationRequest(
      { serviceId, options },
      getPartitionInfoListOperationSpec
    );
  }

  /**
   * Gets the information about the specified partition. The response includes the partition ID,
   * partitioning scheme information, keys supported by the partition, status, health, and other details
   * about the partition.
   * @param partitionId The identity of the partition.
   * @param options The options parameters.
   */
  getPartitionInfo(
    partitionId: string,
    options?: GetPartitionInfoOptionalParams
  ): Promise<GetPartitionInfoResponse> {
    return this.sendOperationRequest(
      { partitionId, options },
      getPartitionInfoOperationSpec
    );
  }

  /**
   * Gets name of the service for the specified partition. A 404 error is returned if the partition ID
   * does not exist in the cluster.
   * @param partitionId The identity of the partition.
   * @param options The options parameters.
   */
  getServiceNameInfo(
    partitionId: string,
    options?: GetServiceNameInfoOptionalParams
  ): Promise<GetServiceNameInfoResponse> {
    return this.sendOperationRequest(
      { partitionId, options },
      getServiceNameInfoOperationSpec
    );
  }

  /**
   * Use EventsHealthStateFilter to filter the collection of health events reported on the service based
   * on the health state.
   * Use ReplicasHealthStateFilter to filter the collection of ReplicaHealthState objects on the
   * partition.
   * If you specify a partition that does not exist in the health store, this request returns an error.
   * @param partitionId The identity of the partition.
   * @param options The options parameters.
   */
  getPartitionHealth(
    partitionId: string,
    options?: GetPartitionHealthOptionalParams
  ): Promise<GetPartitionHealthResponse> {
    return this.sendOperationRequest(
      { partitionId, options },
      getPartitionHealthOperationSpec
    );
  }

  /**
   * Gets the health information of the specified partition.
   * If the application health policy is specified, the health evaluation uses it to get the aggregated
   * health state.
   * If the policy is not specified, the health evaluation uses the application health policy defined in
   * the application manifest, or the default health policy, if no policy is defined in the manifest.
   * Use EventsHealthStateFilter to filter the collection of health events reported on the partition
   * based on the health state.
   * Use ReplicasHealthStateFilter to filter the collection of ReplicaHealthState objects on the
   * partition. Use ApplicationHealthPolicy in the POST body to override the health policies used to
   * evaluate the health.
   * If you specify a partition that does not exist in the health store, this request returns an error.
   * @param partitionId The identity of the partition.
   * @param options The options parameters.
   */
  getPartitionHealthUsingPolicy(
    partitionId: string,
    options?: GetPartitionHealthUsingPolicyOptionalParams
  ): Promise<GetPartitionHealthUsingPolicyResponse> {
    return this.sendOperationRequest(
      { partitionId, options },
      getPartitionHealthUsingPolicyOperationSpec
    );
  }

  /**
   * Reports health state of the specified Service Fabric partition. The report must contain the
   * information about the source of the health report and property on which it is reported.
   * The report is sent to a Service Fabric gateway Partition, which forwards to the health store.
   * The report may be accepted by the gateway, but rejected by the health store after extra validation.
   * For example, the health store may reject the report because of an invalid parameter, like a stale
   * sequence number.
   * To see whether the report was applied in the health store, run GetPartitionHealth and check that the
   * report appears in the HealthEvents section.
   * @param partitionId The identity of the partition.
   * @param healthInformation Describes the health information for the health report. This information
   *                          needs to be present in all of the health reports sent to the health manager.
   * @param options The options parameters.
   */
  reportPartitionHealth(
    partitionId: string,
    healthInformation: HealthInformation,
    options?: ReportPartitionHealthOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { partitionId, healthInformation, options },
      reportPartitionHealthOperationSpec
    );
  }

  /**
   * Returns information about the load of a specified partition.
   * The response includes a list of load reports for a Service Fabric partition.
   * Each report includes the load metric name, value, and last reported time in UTC.
   * @param partitionId The identity of the partition.
   * @param options The options parameters.
   */
  getPartitionLoadInformation(
    partitionId: string,
    options?: GetPartitionLoadInformationOptionalParams
  ): Promise<GetPartitionLoadInformationResponse> {
    return this.sendOperationRequest(
      { partitionId, options },
      getPartitionLoadInformationOperationSpec
    );
  }

  /**
   * Resets the current load of a Service Fabric partition to the default load for the service.
   * @param partitionId The identity of the partition.
   * @param options The options parameters.
   */
  resetPartitionLoad(
    partitionId: string,
    options?: ResetPartitionLoadOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { partitionId, options },
      resetPartitionLoadOperationSpec
    );
  }

  /**
   * This operation should only be performed if it is known that the replicas that are down cannot be
   * recovered. Incorrect use of this API can cause potential data loss.
   * @param partitionId The identity of the partition.
   * @param options The options parameters.
   */
  recoverPartition(
    partitionId: string,
    options?: RecoverPartitionOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { partitionId, options },
      recoverPartitionOperationSpec
    );
  }

  /**
   * Indicates to the Service Fabric cluster that it should attempt to recover the specified service that
   * is currently stuck in quorum loss. This operation should only be performed if it is known that the
   * replicas that are down cannot be recovered. Incorrect use of this API can cause potential data loss.
   * @param serviceId The identity of the service. This ID is typically the full name of the service
   *                  without the 'fabric:' URI scheme.
   *                  Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                  For example, if the service name is "fabric:/myapp/app1/svc1", the service identity would be
   *                  "myapp~app1~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   * @param options The options parameters.
   */
  recoverServicePartitions(
    serviceId: string,
    options?: RecoverServicePartitionsOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { serviceId, options },
      recoverServicePartitionsOperationSpec
    );
  }

  /**
   * Indicates to the Service Fabric cluster that it should attempt to recover the system services that
   * are currently stuck in quorum loss. This operation should only be performed if it is known that the
   * replicas that are down cannot be recovered. Incorrect use of this API can cause potential data loss.
   * @param options The options parameters.
   */
  recoverSystemPartitions(
    options?: RecoverSystemPartitionsOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { options },
      recoverSystemPartitionsOperationSpec
    );
  }

  /**
   * This operation should only be performed if it is known that the replicas that are down cannot be
   * recovered. Incorrect use of this API can cause potential data loss.
   * @param options The options parameters.
   */
  recoverAllPartitions(
    options?: RecoverAllPartitionsOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { options },
      recoverAllPartitionsOperationSpec
    );
  }

  /**
   * This command moves the primary replica of a partition of a stateful service, respecting all
   * constraints.
   * If NodeName parameter is specified, primary will be moved to the specified node (if constraints
   * allow it).
   * If NodeName parameter is not specified, primary replica will be moved to a random node in the
   * cluster.
   * If IgnoreConstraints parameter is specified and set to true, then primary will be moved regardless
   * of the constraints.
   * @param partitionId The identity of the partition.
   * @param options The options parameters.
   */
  movePrimaryReplica(
    partitionId: string,
    options?: MovePrimaryReplicaOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { partitionId, options },
      movePrimaryReplicaOperationSpec
    );
  }

  /**
   * This command moves the secondary replica of a partition of a stateful service, respecting all
   * constraints.
   * CurrentNodeName parameter must be specified to identify the replica that is moved.
   * Source node name must be specified, but new node name can be omitted, and in that case replica is
   * moved to a random node.
   * If IgnoreConstraints parameter is specified and set to true, then secondary will be moved regardless
   * of the constraints.
   * @param partitionId The identity of the partition.
   * @param currentNodeName The name of the source node for secondary replica move.
   * @param options The options parameters.
   */
  moveSecondaryReplica(
    partitionId: string,
    currentNodeName: string,
    options?: MoveSecondaryReplicaOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { partitionId, currentNodeName, options },
      moveSecondaryReplicaOperationSpec
    );
  }

  /**
   * Updates the load value and predicted load value for all the partitions provided for specified
   * metrics.
   * @param partitionMetricLoadDescriptionList Description of updating load for list of partitions.
   * @param options The options parameters.
   */
  updatePartitionLoad(
    partitionMetricLoadDescriptionList: PartitionMetricLoadDescription[],
    options?: UpdatePartitionLoadOptionalParams
  ): Promise<UpdatePartitionLoadResponse> {
    return this.sendOperationRequest(
      { partitionMetricLoadDescriptionList, options },
      updatePartitionLoadOperationSpec
    );
  }

  /**
   * This command moves the instance of a partition of a stateless service, respecting all constraints.
   * Partition id and service name must be specified to be able to move the instance.
   * CurrentNodeName when specified identifies the instance that is moved. If not specified, random
   * instance will be moved
   * New node name can be omitted, and in that case instance is moved to a random node.
   * If IgnoreConstraints parameter is specified and set to true, then instance will be moved regardless
   * of the constraints.
   * @param serviceId The identity of the service. This ID is typically the full name of the service
   *                  without the 'fabric:' URI scheme.
   *                  Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                  For example, if the service name is "fabric:/myapp/app1/svc1", the service identity would be
   *                  "myapp~app1~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   * @param partitionId The identity of the partition.
   * @param options The options parameters.
   */
  moveInstance(
    serviceId: string,
    partitionId: string,
    options?: MoveInstanceOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { serviceId, partitionId, options },
      moveInstanceOperationSpec
    );
  }

  /**
   * This command moves the auxiliary replica of a partition of a stateful service, respecting all
   * constraints.
   * CurrentNodeName can be omitted, and in that case a random auxiliary replica is chosen.
   * NewNodeName can be omitted, and in that case the auxiliary replica is moved to a random node.
   * If IgnoreConstraints parameter is specified and set to true, then auxiliary will be moved regardless
   * of the constraints.
   * @param serviceId The identity of the service. This ID is typically the full name of the service
   *                  without the 'fabric:' URI scheme.
   *                  Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                  For example, if the service name is "fabric:/myapp/app1/svc1", the service identity would be
   *                  "myapp~app1~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   * @param partitionId The identity of the partition.
   * @param options The options parameters.
   */
  moveAuxiliaryReplica(
    serviceId: string,
    partitionId: string,
    options?: MoveAuxiliaryReplicaOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { serviceId, partitionId, options },
      moveAuxiliaryReplicaOperationSpec
    );
  }

  /**
   * For clusters that have the Repair Manager Service configured,
   * this API provides a way to create repair tasks that run automatically or manually.
   * For repair tasks that run automatically, an appropriate repair executor
   * must be running for each repair action to run automatically.
   * These are currently only available in specially-configured Azure Cloud Services.
   *
   * To create a manual repair task, provide the set of impacted node names and the
   * expected impact. When the state of the created repair task changes to approved,
   * you can safely perform repair actions on those nodes.
   *
   * This API supports the Service Fabric platform; it is not meant to be used directly from your code.
   * @param repairTask Describes the repair task to be created or updated.
   * @param options The options parameters.
   */
  createRepairTask(
    repairTask: RepairTask,
    options?: CreateRepairTaskOptionalParams
  ): Promise<CreateRepairTaskResponse> {
    return this.sendOperationRequest(
      { repairTask, options },
      createRepairTaskOperationSpec
    );
  }

  /**
   * This API supports the Service Fabric platform; it is not meant to be used directly from your code.
   * @param repairTaskCancelDescription Describes the repair task to be cancelled.
   * @param options The options parameters.
   */
  cancelRepairTask(
    repairTaskCancelDescription: RepairTaskCancelDescription,
    options?: CancelRepairTaskOptionalParams
  ): Promise<CancelRepairTaskResponse> {
    return this.sendOperationRequest(
      { repairTaskCancelDescription, options },
      cancelRepairTaskOperationSpec
    );
  }

  /**
   * This API supports the Service Fabric platform; it is not meant to be used directly from your code.
   * @param repairTaskDeleteDescription Describes the repair task to be deleted.
   * @param options The options parameters.
   */
  deleteRepairTask(
    repairTaskDeleteDescription: RepairTaskDeleteDescription,
    options?: DeleteRepairTaskOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { repairTaskDeleteDescription, options },
      deleteRepairTaskOperationSpec
    );
  }

  /**
   * This API supports the Service Fabric platform; it is not meant to be used directly from your code.
   * @param options The options parameters.
   */
  getRepairTaskList(
    options?: GetRepairTaskListOptionalParams
  ): Promise<GetRepairTaskListResponse> {
    return this.sendOperationRequest(
      { options },
      getRepairTaskListOperationSpec
    );
  }

  /**
   * This API supports the Service Fabric platform; it is not meant to be used directly from your code.
   * @param repairTaskApproveDescription Describes the repair task to be approved.
   * @param options The options parameters.
   */
  forceApproveRepairTask(
    repairTaskApproveDescription: RepairTaskApproveDescription,
    options?: ForceApproveRepairTaskOptionalParams
  ): Promise<ForceApproveRepairTaskResponse> {
    return this.sendOperationRequest(
      { repairTaskApproveDescription, options },
      forceApproveRepairTaskOperationSpec
    );
  }

  /**
   * This API supports the Service Fabric platform; it is not meant to be used directly from your code.
   * @param repairTaskUpdateHealthPolicyDescription Describes the repair task healthy policy to be
   *                                                updated.
   * @param options The options parameters.
   */
  updateRepairTaskHealthPolicy(
    repairTaskUpdateHealthPolicyDescription: RepairTaskUpdateHealthPolicyDescription,
    options?: UpdateRepairTaskHealthPolicyOptionalParams
  ): Promise<UpdateRepairTaskHealthPolicyResponse> {
    return this.sendOperationRequest(
      { repairTaskUpdateHealthPolicyDescription, options },
      updateRepairTaskHealthPolicyOperationSpec
    );
  }

  /**
   * This API supports the Service Fabric platform; it is not meant to be used directly from your code.
   * @param repairTask Describes the repair task to be created or updated.
   * @param options The options parameters.
   */
  updateRepairExecutionState(
    repairTask: RepairTask,
    options?: UpdateRepairExecutionStateOptionalParams
  ): Promise<UpdateRepairExecutionStateResponse> {
    return this.sendOperationRequest(
      { repairTask, options },
      updateRepairExecutionStateOperationSpec
    );
  }

  /**
   * The GetReplicas endpoint returns information about the replicas of the specified partition. The
   * response includes the ID, role, status, health, node name, uptime, and other details about the
   * replica.
   * @param partitionId The identity of the partition.
   * @param options The options parameters.
   */
  getReplicaInfoList(
    partitionId: string,
    options?: GetReplicaInfoListOptionalParams
  ): Promise<GetReplicaInfoListResponse> {
    return this.sendOperationRequest(
      { partitionId, options },
      getReplicaInfoListOperationSpec
    );
  }

  /**
   * The response includes the ID, role, status, health, node name, uptime, and other details about the
   * replica.
   * @param partitionId The identity of the partition.
   * @param replicaId The identifier of the replica.
   * @param options The options parameters.
   */
  getReplicaInfo(
    partitionId: string,
    replicaId: string,
    options?: GetReplicaInfoOptionalParams
  ): Promise<GetReplicaInfoResponse> {
    return this.sendOperationRequest(
      { partitionId, replicaId, options },
      getReplicaInfoOperationSpec
    );
  }

  /**
   * Gets the health of a Service Fabric replica.
   * Use EventsHealthStateFilter to filter the collection of health events reported on the replica based
   * on the health state.
   * @param partitionId The identity of the partition.
   * @param replicaId The identifier of the replica.
   * @param options The options parameters.
   */
  getReplicaHealth(
    partitionId: string,
    replicaId: string,
    options?: GetReplicaHealthOptionalParams
  ): Promise<GetReplicaHealthResponse> {
    return this.sendOperationRequest(
      { partitionId, replicaId, options },
      getReplicaHealthOperationSpec
    );
  }

  /**
   * Gets the health of a Service Fabric stateful service replica or stateless service instance.
   * Use EventsHealthStateFilter to filter the collection of health events reported on the cluster based
   * on the health state.
   * Use ApplicationHealthPolicy to optionally override the health policies used to evaluate the health.
   * This API only uses 'ConsiderWarningAsError' field of the ApplicationHealthPolicy. The rest of the
   * fields are ignored while evaluating the health of the replica.
   * @param partitionId The identity of the partition.
   * @param replicaId The identifier of the replica.
   * @param options The options parameters.
   */
  getReplicaHealthUsingPolicy(
    partitionId: string,
    replicaId: string,
    options?: GetReplicaHealthUsingPolicyOptionalParams
  ): Promise<GetReplicaHealthUsingPolicyResponse> {
    return this.sendOperationRequest(
      { partitionId, replicaId, options },
      getReplicaHealthUsingPolicyOperationSpec
    );
  }

  /**
   * Reports health state of the specified Service Fabric replica. The report must contain the
   * information about the source of the health report and property on which it is reported.
   * The report is sent to a Service Fabric gateway Replica, which forwards to the health store.
   * The report may be accepted by the gateway, but rejected by the health store after extra validation.
   * For example, the health store may reject the report because of an invalid parameter, like a stale
   * sequence number.
   * To see whether the report was applied in the health store, run GetReplicaHealth and check that the
   * report appears in the HealthEvents section.
   * @param partitionId The identity of the partition.
   * @param replicaId The identifier of the replica.
   * @param serviceKind The kind of service replica (Stateless or Stateful) for which the health is being
   *                    reported. Following are the possible values.
   * @param healthInformation Describes the health information for the health report. This information
   *                          needs to be present in all of the health reports sent to the health manager.
   * @param options The options parameters.
   */
  reportReplicaHealth(
    partitionId: string,
    replicaId: string,
    serviceKind: ReplicaHealthReportServiceKind,
    healthInformation: HealthInformation,
    options?: ReportReplicaHealthOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { partitionId, replicaId, serviceKind, healthInformation, options },
      reportReplicaHealthOperationSpec
    );
  }

  /**
   * Gets the list containing the information about replicas deployed on a Service Fabric node. The
   * information include partition ID, replica ID, status of the replica, name of the service, name of
   * the service type, and other information. Use PartitionId or ServiceManifestName query parameters to
   * return information about the deployed replicas matching the specified values for those parameters.
   * @param nodeName The name of the node.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param options The options parameters.
   */
  getDeployedServiceReplicaInfoList(
    nodeName: string,
    applicationId: string,
    options?: GetDeployedServiceReplicaInfoListOptionalParams
  ): Promise<GetDeployedServiceReplicaInfoListResponse> {
    return this.sendOperationRequest(
      { nodeName, applicationId, options },
      getDeployedServiceReplicaInfoListOperationSpec
    );
  }

  /**
   * Gets the details of the replica deployed on a Service Fabric node. The information includes service
   * kind, service name, current service operation, current service operation start date time, partition
   * ID, replica/instance ID, reported load, and other information.
   * @param nodeName The name of the node.
   * @param partitionId The identity of the partition.
   * @param replicaId The identifier of the replica.
   * @param options The options parameters.
   */
  getDeployedServiceReplicaDetailInfo(
    nodeName: string,
    partitionId: string,
    replicaId: string,
    options?: GetDeployedServiceReplicaDetailInfoOptionalParams
  ): Promise<GetDeployedServiceReplicaDetailInfoResponse> {
    return this.sendOperationRequest(
      { nodeName, partitionId, replicaId, options },
      getDeployedServiceReplicaDetailInfoOperationSpec
    );
  }

  /**
   * Gets the details of the replica deployed on a Service Fabric node. The information includes service
   * kind, service name, current service operation, current service operation start date time, partition
   * ID, replica/instance ID, reported load, and other information.
   * @param nodeName The name of the node.
   * @param partitionId The identity of the partition.
   * @param options The options parameters.
   */
  getDeployedServiceReplicaDetailInfoByPartitionId(
    nodeName: string,
    partitionId: string,
    options?: GetDeployedServiceReplicaDetailInfoByPartitionIdOptionalParams
  ): Promise<GetDeployedServiceReplicaDetailInfoByPartitionIdResponse> {
    return this.sendOperationRequest(
      { nodeName, partitionId, options },
      getDeployedServiceReplicaDetailInfoByPartitionIdOperationSpec
    );
  }

  /**
   * Restarts a service replica of a persisted service running on a node. Warning - There are no safety
   * checks performed when this API is used. Incorrect use of this API can lead to availability loss for
   * stateful services.
   * @param nodeName The name of the node.
   * @param partitionId The identity of the partition.
   * @param replicaId The identifier of the replica.
   * @param options The options parameters.
   */
  restartReplica(
    nodeName: string,
    partitionId: string,
    replicaId: string,
    options?: RestartReplicaOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { nodeName, partitionId, replicaId, options },
      restartReplicaOperationSpec
    );
  }

  /**
   * This API simulates a Service Fabric replica failure by removing a replica from a Service Fabric
   * cluster. The removal closes the replica, transitions the replica to the role None, and then removes
   * all of the state information of the replica from the cluster. This API tests the replica state
   * removal path, and simulates the report fault permanent path through client APIs. Warning - There are
   * no safety checks performed when this API is used. Incorrect use of this API can lead to data loss
   * for stateful services. In addition, the forceRemove flag impacts all other replicas hosted in the
   * same process.
   * @param nodeName The name of the node.
   * @param partitionId The identity of the partition.
   * @param replicaId The identifier of the replica.
   * @param options The options parameters.
   */
  removeReplica(
    nodeName: string,
    partitionId: string,
    replicaId: string,
    options?: RemoveReplicaOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { nodeName, partitionId, replicaId, options },
      removeReplicaOperationSpec
    );
  }

  /**
   * Returns the information about the service packages deployed on a Service Fabric node for the given
   * application.
   * @param nodeName The name of the node.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param options The options parameters.
   */
  getDeployedServicePackageInfoList(
    nodeName: string,
    applicationId: string,
    options?: GetDeployedServicePackageInfoListOptionalParams
  ): Promise<GetDeployedServicePackageInfoListResponse> {
    return this.sendOperationRequest(
      { nodeName, applicationId, options },
      getDeployedServicePackageInfoListOperationSpec
    );
  }

  /**
   * Returns the information about the service packages deployed on a Service Fabric node for the given
   * application. These results are of service packages whose name match exactly the service package name
   * specified as the parameter.
   * @param nodeName The name of the node.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param servicePackageName The name of the service package.
   * @param options The options parameters.
   */
  getDeployedServicePackageInfoListByName(
    nodeName: string,
    applicationId: string,
    servicePackageName: string,
    options?: GetDeployedServicePackageInfoListByNameOptionalParams
  ): Promise<GetDeployedServicePackageInfoListByNameResponse> {
    return this.sendOperationRequest(
      { nodeName, applicationId, servicePackageName, options },
      getDeployedServicePackageInfoListByNameOperationSpec
    );
  }

  /**
   * Gets the information about health of a service package for a specific application deployed on a
   * Service Fabric node. Use EventsHealthStateFilter to optionally filter for the collection of
   * HealthEvent objects reported on the deployed service package based on health state.
   * @param nodeName The name of the node.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param servicePackageName The name of the service package.
   * @param options The options parameters.
   */
  getDeployedServicePackageHealth(
    nodeName: string,
    applicationId: string,
    servicePackageName: string,
    options?: GetDeployedServicePackageHealthOptionalParams
  ): Promise<GetDeployedServicePackageHealthResponse> {
    return this.sendOperationRequest(
      { nodeName, applicationId, servicePackageName, options },
      getDeployedServicePackageHealthOperationSpec
    );
  }

  /**
   * Gets the information about health of a service package for a specific application deployed on a
   * Service Fabric node. using the specified policy. Use EventsHealthStateFilter to optionally filter
   * for the collection of HealthEvent objects reported on the deployed service package based on health
   * state. Use ApplicationHealthPolicy to optionally override the health policies used to evaluate the
   * health. This API only uses 'ConsiderWarningAsError' field of the ApplicationHealthPolicy. The rest
   * of the fields are ignored while evaluating the health of the deployed service package.
   * @param nodeName The name of the node.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param servicePackageName The name of the service package.
   * @param options The options parameters.
   */
  getDeployedServicePackageHealthUsingPolicy(
    nodeName: string,
    applicationId: string,
    servicePackageName: string,
    options?: GetDeployedServicePackageHealthUsingPolicyOptionalParams
  ): Promise<GetDeployedServicePackageHealthUsingPolicyResponse> {
    return this.sendOperationRequest(
      { nodeName, applicationId, servicePackageName, options },
      getDeployedServicePackageHealthUsingPolicyOperationSpec
    );
  }

  /**
   * Reports health state of the service package of the application deployed on a Service Fabric node.
   * The report must contain the information about the source of the health report and property on which
   * it is reported.
   * The report is sent to a Service Fabric gateway Service, which forwards to the health store.
   * The report may be accepted by the gateway, but rejected by the health store after extra validation.
   * For example, the health store may reject the report because of an invalid parameter, like a stale
   * sequence number.
   * To see whether the report was applied in the health store, get deployed service package health and
   * check that the report appears in the HealthEvents section.
   * @param nodeName The name of the node.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param servicePackageName The name of the service package.
   * @param healthInformation Describes the health information for the health report. This information
   *                          needs to be present in all of the health reports sent to the health manager.
   * @param options The options parameters.
   */
  reportDeployedServicePackageHealth(
    nodeName: string,
    applicationId: string,
    servicePackageName: string,
    healthInformation: HealthInformation,
    options?: ReportDeployedServicePackageHealthOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      {
        nodeName,
        applicationId,
        servicePackageName,
        healthInformation,
        options
      },
      reportDeployedServicePackageHealthOperationSpec
    );
  }

  /**
   * This API provides a way to download code packages including the container images on a specific node
   * outside of the normal application deployment and upgrade path. This is useful for the large code
   * packages and container images to be present on the node before the actual application deployment and
   * upgrade, thus significantly reducing the total time required for the deployment or upgrade.
   * @param nodeName The name of the node.
   * @param deployServicePackageToNodeDescription Describes information for deploying a service package
   *                                              to a Service Fabric node.
   * @param options The options parameters.
   */
  deployServicePackageToNode(
    nodeName: string,
    deployServicePackageToNodeDescription: DeployServicePackageToNodeDescription,
    options?: DeployServicePackageToNodeOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { nodeName, deployServicePackageToNodeDescription, options },
      deployServicePackageToNodeOperationSpec
    );
  }

  /**
   * Gets the list of code packages deployed on a Service Fabric node for the given application.
   * @param nodeName The name of the node.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param options The options parameters.
   */
  getDeployedCodePackageInfoList(
    nodeName: string,
    applicationId: string,
    options?: GetDeployedCodePackageInfoListOptionalParams
  ): Promise<GetDeployedCodePackageInfoListResponse> {
    return this.sendOperationRequest(
      { nodeName, applicationId, options },
      getDeployedCodePackageInfoListOperationSpec
    );
  }

  /**
   * Restarts a code package deployed on a Service Fabric node in a cluster. This aborts the code package
   * process, which will restart all the user service replicas hosted in that process.
   * @param nodeName The name of the node.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param restartDeployedCodePackageDescription Describes the deployed code package on Service Fabric
   *                                              node to restart.
   * @param options The options parameters.
   */
  restartDeployedCodePackage(
    nodeName: string,
    applicationId: string,
    restartDeployedCodePackageDescription: RestartDeployedCodePackageDescription,
    options?: RestartDeployedCodePackageOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      {
        nodeName,
        applicationId,
        restartDeployedCodePackageDescription,
        options
      },
      restartDeployedCodePackageOperationSpec
    );
  }

  /**
   * Gets the container logs for container deployed on a Service Fabric node for the given code package.
   * @param nodeName The name of the node.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param serviceManifestName The name of a service manifest registered as part of an application type
   *                            in a Service Fabric cluster.
   * @param codePackageName The name of code package specified in service manifest registered as part of
   *                        an application type in a Service Fabric cluster.
   * @param options The options parameters.
   */
  getContainerLogsDeployedOnNode(
    nodeName: string,
    applicationId: string,
    serviceManifestName: string,
    codePackageName: string,
    options?: GetContainerLogsDeployedOnNodeOptionalParams
  ): Promise<GetContainerLogsDeployedOnNodeResponse> {
    return this.sendOperationRequest(
      {
        nodeName,
        applicationId,
        serviceManifestName,
        codePackageName,
        options
      },
      getContainerLogsDeployedOnNodeOperationSpec
    );
  }

  /**
   * Invoke container API on a container deployed on a Service Fabric node for the given code package.
   * @param nodeName The name of the node.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param serviceManifestName The name of a service manifest registered as part of an application type
   *                            in a Service Fabric cluster.
   * @param codePackageName The name of code package specified in service manifest registered as part of
   *                        an application type in a Service Fabric cluster.
   * @param codePackageInstanceId ID that uniquely identifies a code package instance deployed on a
   *                              service fabric node.
   * @param containerApiRequestBody Parameters for making container API call
   * @param options The options parameters.
   */
  invokeContainerApi(
    nodeName: string,
    applicationId: string,
    serviceManifestName: string,
    codePackageName: string,
    codePackageInstanceId: string,
    containerApiRequestBody: ContainerApiRequestBody,
    options?: InvokeContainerApiOptionalParams
  ): Promise<InvokeContainerApiResponse> {
    return this.sendOperationRequest(
      {
        nodeName,
        applicationId,
        serviceManifestName,
        codePackageName,
        codePackageInstanceId,
        containerApiRequestBody,
        options
      },
      invokeContainerApiOperationSpec
    );
  }

  /**
   * Compose is a file format that describes multi-container applications. This API allows deploying
   * container based applications defined in compose format in a Service Fabric cluster. Once the
   * deployment is created, its status can be tracked via the `GetComposeDeploymentStatus` API.
   * @param createComposeDeploymentDescription Describes the compose deployment that needs to be created.
   * @param options The options parameters.
   */
  createComposeDeployment(
    createComposeDeploymentDescription: CreateComposeDeploymentDescription,
    options?: CreateComposeDeploymentOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { createComposeDeploymentDescription, options },
      createComposeDeploymentOperationSpec
    );
  }

  /**
   * Returns the status of the compose deployment that was created or in the process of being created in
   * the Service Fabric cluster and whose name matches the one specified as the parameter. The response
   * includes the name, status, and other details about the deployment.
   * @param deploymentName The identity of the deployment.
   * @param options The options parameters.
   */
  getComposeDeploymentStatus(
    deploymentName: string,
    options?: GetComposeDeploymentStatusOptionalParams
  ): Promise<GetComposeDeploymentStatusResponse> {
    return this.sendOperationRequest(
      { deploymentName, options },
      getComposeDeploymentStatusOperationSpec
    );
  }

  /**
   * Gets the status about the compose deployments that were created or in the process of being created
   * in the Service Fabric cluster. The response includes the name, status, and other details about the
   * compose deployments. If the list of deployments do not fit in a page, one page of results is
   * returned as well as a continuation token, which can be used to get the next page.
   * @param options The options parameters.
   */
  getComposeDeploymentStatusList(
    options?: GetComposeDeploymentStatusListOptionalParams
  ): Promise<GetComposeDeploymentStatusListResponse> {
    return this.sendOperationRequest(
      { options },
      getComposeDeploymentStatusListOperationSpec
    );
  }

  /**
   * Returns the information about the state of the compose deployment upgrade along with details to aid
   * debugging application health issues.
   * @param deploymentName The identity of the deployment.
   * @param options The options parameters.
   */
  getComposeDeploymentUpgradeProgress(
    deploymentName: string,
    options?: GetComposeDeploymentUpgradeProgressOptionalParams
  ): Promise<GetComposeDeploymentUpgradeProgressResponse> {
    return this.sendOperationRequest(
      { deploymentName, options },
      getComposeDeploymentUpgradeProgressOperationSpec
    );
  }

  /**
   * Deletes an existing Service Fabric compose deployment.
   * @param deploymentName The identity of the deployment.
   * @param options The options parameters.
   */
  removeComposeDeployment(
    deploymentName: string,
    options?: RemoveComposeDeploymentOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { deploymentName, options },
      removeComposeDeploymentOperationSpec
    );
  }

  /**
   * Validates the supplied upgrade parameters and starts upgrading the deployment if the parameters are
   * valid.
   * @param deploymentName The identity of the deployment.
   * @param composeDeploymentUpgradeDescription Parameters for upgrading compose deployment.
   * @param options The options parameters.
   */
  startComposeDeploymentUpgrade(
    deploymentName: string,
    composeDeploymentUpgradeDescription: ComposeDeploymentUpgradeDescription,
    options?: StartComposeDeploymentUpgradeOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { deploymentName, composeDeploymentUpgradeDescription, options },
      startComposeDeploymentUpgradeOperationSpec
    );
  }

  /**
   * Rollback a service fabric compose deployment upgrade.
   * @param deploymentName The identity of the deployment.
   * @param options The options parameters.
   */
  startRollbackComposeDeploymentUpgrade(
    deploymentName: string,
    options?: StartRollbackComposeDeploymentUpgradeOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { deploymentName, options },
      startRollbackComposeDeploymentUpgradeOperationSpec
    );
  }

  /**
   * Get the status of Chaos indicating whether or not Chaos is running, the Chaos parameters used for
   * running Chaos and the status of the Chaos Schedule.
   * @param options The options parameters.
   */
  getChaos(options?: GetChaosOptionalParams): Promise<GetChaosResponse> {
    return this.sendOperationRequest({ options }, getChaosOperationSpec);
  }

  /**
   * If Chaos is not already running in the cluster, it starts Chaos with the passed in Chaos parameters.
   * If Chaos is already running when this call is made, the call fails with the error code
   * FABRIC_E_CHAOS_ALREADY_RUNNING.
   * Refer to the article [Induce controlled Chaos in Service Fabric
   * clusters](https://docs.microsoft.com/azure/service-fabric/service-fabric-controlled-chaos) for more
   * details.
   * @param chaosParameters Describes all the parameters to configure a Chaos run.
   * @param options The options parameters.
   */
  startChaos(
    chaosParameters: ChaosParameters,
    options?: StartChaosOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { chaosParameters, options },
      startChaosOperationSpec
    );
  }

  /**
   * Stops Chaos from executing new faults. In-flight faults will continue to execute until they are
   * complete. The current Chaos Schedule is put into a stopped state.
   * Once a schedule is stopped, it will stay in the stopped state and not be used to Chaos Schedule new
   * runs of Chaos. A new Chaos Schedule must be set in order to resume scheduling.
   * @param options The options parameters.
   */
  stopChaos(options?: StopChaosOptionalParams): Promise<void> {
    return this.sendOperationRequest({ options }, stopChaosOperationSpec);
  }

  /**
   * To get the next segment of the Chaos events, you can specify the ContinuationToken. To get the start
   * of a new segment of Chaos events, you can specify the time range
   * through StartTimeUtc and EndTimeUtc. You cannot specify both the ContinuationToken and the time
   * range in the same call.
   * When there are more than 100 Chaos events, the Chaos events are returned in multiple segments where
   * a segment contains no more than 100 Chaos events and to get the next segment you make a call to this
   * API with the continuation token.
   * @param options The options parameters.
   */
  getChaosEvents(
    options?: GetChaosEventsOptionalParams
  ): Promise<GetChaosEventsResponse> {
    return this.sendOperationRequest({ options }, getChaosEventsOperationSpec);
  }

  /**
   * Gets the version of the Chaos Schedule in use and the Chaos Schedule that defines when and how to
   * run Chaos.
   * @param options The options parameters.
   */
  getChaosSchedule(
    options?: GetChaosScheduleOptionalParams
  ): Promise<GetChaosScheduleResponse> {
    return this.sendOperationRequest(
      { options },
      getChaosScheduleOperationSpec
    );
  }

  /**
   * Chaos will automatically schedule runs based on the Chaos Schedule.
   * The Chaos Schedule will be updated if the provided version matches the version on the server.
   * When updating the Chaos Schedule, the version on the server is incremented by 1.
   * The version on the server will wrap back to 0 after reaching a large number.
   * If Chaos is running when this call is made, the call will fail.
   * @param chaosSchedule Describes the schedule used by Chaos.
   * @param options The options parameters.
   */
  postChaosSchedule(
    chaosSchedule: ChaosScheduleDescription,
    options?: PostChaosScheduleOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { chaosSchedule, options },
      postChaosScheduleOperationSpec
    );
  }

  /**
   * Uploads contents of the file to the image store. Use this API if the file is small enough to upload
   * again if the connection fails. The file's data needs to be added to the request body. The contents
   * will be uploaded to the specified path. Image store service uses a mark file to indicate the
   * availability of the folder. The mark file is an empty file named "_.dir". The mark file is generated
   * by the image store service when all files in a folder are uploaded. When using File-by-File approach
   * to upload application package in REST, the image store service isn't aware of the file hierarchy of
   * the application package; you need to create a mark file per folder and upload it last, to let the
   * image store service know that the folder is complete.
   * @param contentPath Relative path to file or folder in the image store from its root.
   * @param options The options parameters.
   */
  uploadFile(
    contentPath: string,
    options?: UploadFileOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { contentPath, options },
      uploadFileOperationSpec
    );
  }

  /**
   * Returns the information about the image store content at the specified contentPath. The contentPath
   * is relative to the root of the image store.
   * @param contentPath Relative path to file or folder in the image store from its root.
   * @param options The options parameters.
   */
  getImageStoreContent(
    contentPath: string,
    options?: GetImageStoreContentOptionalParams
  ): Promise<GetImageStoreContentResponse> {
    return this.sendOperationRequest(
      { contentPath, options },
      getImageStoreContentOperationSpec
    );
  }

  /**
   * Deletes existing image store content being found within the given image store relative path. This
   * command can be used to delete uploaded application packages once they are provisioned.
   * @param contentPath Relative path to file or folder in the image store from its root.
   * @param options The options parameters.
   */
  deleteImageStoreContent(
    contentPath: string,
    options?: DeleteImageStoreContentOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { contentPath, options },
      deleteImageStoreContentOperationSpec
    );
  }

  /**
   * Returns the information about the image store content at the root of the image store.
   * @param options The options parameters.
   */
  getImageStoreRootContent(
    options?: GetImageStoreRootContentOptionalParams
  ): Promise<GetImageStoreRootContentResponse> {
    return this.sendOperationRequest(
      { options },
      getImageStoreRootContentOperationSpec
    );
  }

  /**
   * Copies the image store content from the source image store relative path to the destination image
   * store relative path.
   * @param imageStoreCopyDescription Describes the copy description for the image store.
   * @param options The options parameters.
   */
  copyImageStoreContent(
    imageStoreCopyDescription: ImageStoreCopyDescription,
    options?: CopyImageStoreContentOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { imageStoreCopyDescription, options },
      copyImageStoreContentOperationSpec
    );
  }

  /**
   * The DELETE request will cause the existing upload session to expire and remove any previously
   * uploaded file chunks.
   * @param sessionId A GUID generated by the user for a file uploading. It identifies an image store
   *                  upload session which keeps track of all file chunks until it is committed.
   * @param options The options parameters.
   */
  deleteImageStoreUploadSession(
    sessionId: string,
    options?: DeleteImageStoreUploadSessionOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { sessionId, options },
      deleteImageStoreUploadSessionOperationSpec
    );
  }

  /**
   * When all file chunks have been uploaded, the upload session needs to be committed explicitly to
   * complete the upload. Image store preserves the upload session until the expiration time, which is 30
   * minutes after the last chunk received.
   * @param sessionId A GUID generated by the user for a file uploading. It identifies an image store
   *                  upload session which keeps track of all file chunks until it is committed.
   * @param options The options parameters.
   */
  commitImageStoreUploadSession(
    sessionId: string,
    options?: CommitImageStoreUploadSessionOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { sessionId, options },
      commitImageStoreUploadSessionOperationSpec
    );
  }

  /**
   * Gets the image store upload session identified by the given ID. User can query the upload session at
   * any time during uploading.
   * @param sessionId A GUID generated by the user for a file uploading. It identifies an image store
   *                  upload session which keeps track of all file chunks until it is committed.
   * @param options The options parameters.
   */
  getImageStoreUploadSessionById(
    sessionId: string,
    options?: GetImageStoreUploadSessionByIdOptionalParams
  ): Promise<GetImageStoreUploadSessionByIdResponse> {
    return this.sendOperationRequest(
      { sessionId, options },
      getImageStoreUploadSessionByIdOperationSpec
    );
  }

  /**
   * Gets the image store upload session associated with the given image store relative path. User can
   * query the upload session at any time during uploading.
   * @param contentPath Relative path to file or folder in the image store from its root.
   * @param options The options parameters.
   */
  getImageStoreUploadSessionByPath(
    contentPath: string,
    options?: GetImageStoreUploadSessionByPathOptionalParams
  ): Promise<GetImageStoreUploadSessionByPathResponse> {
    return this.sendOperationRequest(
      { contentPath, options },
      getImageStoreUploadSessionByPathOperationSpec
    );
  }

  /**
   * Uploads a file chunk to the image store with the specified upload session ID and image store
   * relative path. This API allows user to resume the file upload operation. user doesn't have to
   * restart the file upload from scratch whenever there is a network interruption. Use this option if
   * the file size is large.
   *
   * To perform a resumable file upload, user need to break the file into multiple chunks and upload
   * these chunks to the image store one-by-one. Chunks don't have to be uploaded in order. If the file
   * represented by the image store relative path already exists, it will be overwritten when the upload
   * session commits.
   * @param contentPath Relative path to file or folder in the image store from its root.
   * @param sessionId A GUID generated by the user for a file uploading. It identifies an image store
   *                  upload session which keeps track of all file chunks until it is committed.
   * @param contentRange When uploading file chunks to the image store, the Content-Range header field
   *                     need to be configured and sent with a request. The format should looks like "bytes
   *                     {First-Byte-Position}-{Last-Byte-Position}/{File-Length}". For example, Content-Range:bytes
   *                     300-5000/20000 indicates that user is sending bytes 300 through 5,000 and the total file length is
   *                     20,000 bytes.
   * @param options The options parameters.
   */
  uploadFileChunk(
    contentPath: string,
    sessionId: string,
    contentRange: string,
    options?: UploadFileChunkOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { contentPath, sessionId, contentRange, options },
      uploadFileChunkOperationSpec
    );
  }

  /**
   * Returns the total size of files at the root and children folders in image store.
   * @param options The options parameters.
   */
  getImageStoreRootFolderSize(
    options?: GetImageStoreRootFolderSizeOptionalParams
  ): Promise<GetImageStoreRootFolderSizeResponse> {
    return this.sendOperationRequest(
      { options },
      getImageStoreRootFolderSizeOperationSpec
    );
  }

  /**
   * Gets the total size of file under a image store folder, specified by contentPath. The contentPath is
   * relative to the root of the image store.
   * @param contentPath Relative path to file or folder in the image store from its root.
   * @param options The options parameters.
   */
  getImageStoreFolderSize(
    contentPath: string,
    options?: GetImageStoreFolderSizeOptionalParams
  ): Promise<GetImageStoreFolderSizeResponse> {
    return this.sendOperationRequest(
      { contentPath, options },
      getImageStoreFolderSizeOperationSpec
    );
  }

  /**
   * Returns information about the primary ImageStore replica, such as disk capacity and available disk
   * space at the node it is on, and several categories of the ImageStore's file system usage.
   * @param options The options parameters.
   */
  getImageStoreInfo(
    options?: GetImageStoreInfoOptionalParams
  ): Promise<GetImageStoreInfoResponse> {
    return this.sendOperationRequest(
      { options },
      getImageStoreInfoOperationSpec
    );
  }

  /**
   * For clusters that have one or more instances of the Infrastructure Service configured,
   * this API provides a way to send infrastructure-specific commands to a particular
   * instance of the Infrastructure Service.
   *
   * Available commands and their corresponding response formats vary depending upon
   * the infrastructure on which the cluster is running.
   *
   * This API supports the Service Fabric platform; it is not meant to be used directly from your code.
   * @param command The text of the command to be invoked. The content of the command is
   *                infrastructure-specific.
   * @param options The options parameters.
   */
  invokeInfrastructureCommand(
    command: string,
    options?: InvokeInfrastructureCommandOptionalParams
  ): Promise<InvokeInfrastructureCommandResponse> {
    return this.sendOperationRequest(
      { command, options },
      invokeInfrastructureCommandOperationSpec
    );
  }

  /**
   * For clusters that have one or more instances of the Infrastructure Service configured,
   * this API provides a way to send infrastructure-specific queries to a particular
   * instance of the Infrastructure Service.
   *
   * Available commands and their corresponding response formats vary depending upon
   * the infrastructure on which the cluster is running.
   *
   * This API supports the Service Fabric platform; it is not meant to be used directly from your code.
   * @param command The text of the command to be invoked. The content of the command is
   *                infrastructure-specific.
   * @param options The options parameters.
   */
  invokeInfrastructureQuery(
    command: string,
    options?: InvokeInfrastructureQueryOptionalParams
  ): Promise<InvokeInfrastructureQueryResponse> {
    return this.sendOperationRequest(
      { command, options },
      invokeInfrastructureQueryOperationSpec
    );
  }

  /**
   * This API will induce data loss for the specified partition. It will trigger a call to the OnDataLoss
   * API of the partition.
   * Actual data loss will depend on the specified DataLossMode.
   *
   * - PartialDataLoss - Only a quorum of replicas are removed and OnDataLoss is triggered for the
   * partition but actual data loss depends on the presence of in-flight replication.
   * - FullDataLoss - All replicas are removed hence all data is lost and OnDataLoss is triggered.
   *
   * This API should only be called with a stateful service as the target.
   *
   * Calling this API with a system service as the target is not advised.
   *
   * Note:  Once this API has been called, it cannot be reversed. Calling CancelOperation will only stop
   * execution and clean up internal system state.
   * It will not restore data if the command has progressed far enough to cause data loss.
   *
   * Call the GetDataLossProgress API with the same OperationId to return information on the operation
   * started with this API.
   * @param serviceId The identity of the service. This ID is typically the full name of the service
   *                  without the 'fabric:' URI scheme.
   *                  Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                  For example, if the service name is "fabric:/myapp/app1/svc1", the service identity would be
   *                  "myapp~app1~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   * @param partitionId The identity of the partition.
   * @param operationId A GUID that identifies a call of this API.  This is passed into the corresponding
   *                    GetProgress API
   * @param dataLossMode This enum is passed to the StartDataLoss API to indicate what type of data loss
   *                     to induce.
   * @param options The options parameters.
   */
  startDataLoss(
    serviceId: string,
    partitionId: string,
    operationId: string,
    dataLossMode: DataLossMode,
    options?: StartDataLossOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { serviceId, partitionId, operationId, dataLossMode, options },
      startDataLossOperationSpec
    );
  }

  /**
   * Gets the progress of a data loss operation started with StartDataLoss, using the OperationId.
   * @param serviceId The identity of the service. This ID is typically the full name of the service
   *                  without the 'fabric:' URI scheme.
   *                  Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                  For example, if the service name is "fabric:/myapp/app1/svc1", the service identity would be
   *                  "myapp~app1~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   * @param partitionId The identity of the partition.
   * @param operationId A GUID that identifies a call of this API.  This is passed into the corresponding
   *                    GetProgress API
   * @param options The options parameters.
   */
  getDataLossProgress(
    serviceId: string,
    partitionId: string,
    operationId: string,
    options?: GetDataLossProgressOptionalParams
  ): Promise<GetDataLossProgressResponse> {
    return this.sendOperationRequest(
      { serviceId, partitionId, operationId, options },
      getDataLossProgressOperationSpec
    );
  }

  /**
   * This API is useful for a temporary quorum loss situation on your service.
   *
   * Call the GetQuorumLossProgress API with the same OperationId to return information on the operation
   * started with this API.
   *
   * This can only be called on stateful persisted (HasPersistedState==true) services.  Do not use this
   * API on stateless services or stateful in-memory only services.
   * @param serviceId The identity of the service. This ID is typically the full name of the service
   *                  without the 'fabric:' URI scheme.
   *                  Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                  For example, if the service name is "fabric:/myapp/app1/svc1", the service identity would be
   *                  "myapp~app1~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   * @param partitionId The identity of the partition.
   * @param operationId A GUID that identifies a call of this API.  This is passed into the corresponding
   *                    GetProgress API
   * @param quorumLossMode This enum is passed to the StartQuorumLoss API to indicate what type of quorum
   *                       loss to induce.
   * @param quorumLossDuration The amount of time for which the partition will be kept in quorum loss.
   *                           This must be specified in seconds.
   * @param options The options parameters.
   */
  startQuorumLoss(
    serviceId: string,
    partitionId: string,
    operationId: string,
    quorumLossMode: QuorumLossMode,
    quorumLossDuration: number,
    options?: StartQuorumLossOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      {
        serviceId,
        partitionId,
        operationId,
        quorumLossMode,
        quorumLossDuration,
        options
      },
      startQuorumLossOperationSpec
    );
  }

  /**
   * Gets the progress of a quorum loss operation started with StartQuorumLoss, using the provided
   * OperationId.
   * @param serviceId The identity of the service. This ID is typically the full name of the service
   *                  without the 'fabric:' URI scheme.
   *                  Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                  For example, if the service name is "fabric:/myapp/app1/svc1", the service identity would be
   *                  "myapp~app1~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   * @param partitionId The identity of the partition.
   * @param operationId A GUID that identifies a call of this API.  This is passed into the corresponding
   *                    GetProgress API
   * @param options The options parameters.
   */
  getQuorumLossProgress(
    serviceId: string,
    partitionId: string,
    operationId: string,
    options?: GetQuorumLossProgressOptionalParams
  ): Promise<GetQuorumLossProgressResponse> {
    return this.sendOperationRequest(
      { serviceId, partitionId, operationId, options },
      getQuorumLossProgressOperationSpec
    );
  }

  /**
   * This API is useful for testing failover.
   *
   * If used to target a stateless service partition, RestartPartitionMode must be
   * AllReplicasOrInstances.
   *
   * Call the GetPartitionRestartProgress API using the same OperationId to get the progress.
   * @param serviceId The identity of the service. This ID is typically the full name of the service
   *                  without the 'fabric:' URI scheme.
   *                  Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                  For example, if the service name is "fabric:/myapp/app1/svc1", the service identity would be
   *                  "myapp~app1~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   * @param partitionId The identity of the partition.
   * @param operationId A GUID that identifies a call of this API.  This is passed into the corresponding
   *                    GetProgress API
   * @param restartPartitionMode Describe which partitions to restart.
   * @param options The options parameters.
   */
  startPartitionRestart(
    serviceId: string,
    partitionId: string,
    operationId: string,
    restartPartitionMode: RestartPartitionMode,
    options?: StartPartitionRestartOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { serviceId, partitionId, operationId, restartPartitionMode, options },
      startPartitionRestartOperationSpec
    );
  }

  /**
   * Gets the progress of a PartitionRestart started with StartPartitionRestart using the provided
   * OperationId.
   * @param serviceId The identity of the service. This ID is typically the full name of the service
   *                  without the 'fabric:' URI scheme.
   *                  Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                  For example, if the service name is "fabric:/myapp/app1/svc1", the service identity would be
   *                  "myapp~app1~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   * @param partitionId The identity of the partition.
   * @param operationId A GUID that identifies a call of this API.  This is passed into the corresponding
   *                    GetProgress API
   * @param options The options parameters.
   */
  getPartitionRestartProgress(
    serviceId: string,
    partitionId: string,
    operationId: string,
    options?: GetPartitionRestartProgressOptionalParams
  ): Promise<GetPartitionRestartProgressResponse> {
    return this.sendOperationRequest(
      { serviceId, partitionId, operationId, options },
      getPartitionRestartProgressOperationSpec
    );
  }

  /**
   * Starts or stops a cluster node.  A cluster node is a process, not the OS instance itself.  To start
   * a node, pass in "Start" for the NodeTransitionType parameter.
   * To stop a node, pass in "Stop" for the NodeTransitionType parameter.  This API starts the operation
   * - when the API returns the node may not have finished transitioning yet.
   * Call GetNodeTransitionProgress with the same OperationId to get the progress of the operation.
   * @param nodeName The name of the node.
   * @param operationId A GUID that identifies a call of this API.  This is passed into the corresponding
   *                    GetProgress API
   * @param nodeTransitionType Indicates the type of transition to perform.  NodeTransitionType.Start
   *                           will start a stopped node.  NodeTransitionType.Stop will stop a node that is up.
   * @param nodeInstanceId The node instance ID of the target node.  This can be determined through
   *                       GetNodeInfo API.
   * @param stopDurationInSeconds The duration, in seconds, to keep the node stopped.  The minimum value
   *                              is 600, the maximum is 14400.  After this time expires, the node will automatically come back up.
   * @param options The options parameters.
   */
  startNodeTransition(
    nodeName: string,
    operationId: string,
    nodeTransitionType: NodeTransitionType,
    nodeInstanceId: string,
    stopDurationInSeconds: number,
    options?: StartNodeTransitionOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      {
        nodeName,
        operationId,
        nodeTransitionType,
        nodeInstanceId,
        stopDurationInSeconds,
        options
      },
      startNodeTransitionOperationSpec
    );
  }

  /**
   * Gets the progress of an operation started with StartNodeTransition using the provided OperationId.
   * @param nodeName The name of the node.
   * @param operationId A GUID that identifies a call of this API.  This is passed into the corresponding
   *                    GetProgress API
   * @param options The options parameters.
   */
  getNodeTransitionProgress(
    nodeName: string,
    operationId: string,
    options?: GetNodeTransitionProgressOptionalParams
  ): Promise<GetNodeTransitionProgressResponse> {
    return this.sendOperationRequest(
      { nodeName, operationId, options },
      getNodeTransitionProgressOperationSpec
    );
  }

  /**
   * Gets the list of user-induced fault operations filtered by provided input.
   * @param typeFilter Used to filter on OperationType for user-induced operations.
   *
   * - 65535 - select all
   *                   - 1 - select PartitionDataLoss.
   *                   - 2 - select PartitionQuorumLoss.
   *                   - 4 - select PartitionRestart.
   *                   - 8 - select NodeTransition.
   * @param stateFilter Used to filter on OperationState's for user-induced operations.
   *
   * - 65535 - select All
   *                    - 1 - select Running
   *                    - 2 - select RollingBack
   *                    - 8 - select Completed
   *                    - 16 - select Faulted
   *                    - 32 - select Cancelled
   *                    - 64 - select ForceCancelled
   * @param options The options parameters.
   */
  getFaultOperationList(
    typeFilter: number,
    stateFilter: number,
    options?: GetFaultOperationListOptionalParams
  ): Promise<GetFaultOperationListResponse> {
    return this.sendOperationRequest(
      { typeFilter, stateFilter, options },
      getFaultOperationListOperationSpec
    );
  }

  /**
   * The following APIs start fault operations that may be cancelled by using CancelOperation:
   * StartDataLoss, StartQuorumLoss, StartPartitionRestart, StartNodeTransition.
   *
   * If force is false, then the specified user-induced operation will be gracefully stopped and cleaned
   * up.  If force is true, the command will be aborted, and some internal state
   * may be left behind.  Specifying force as true should be used with care.  Calling this API with force
   * set to true is not allowed until this API has already
   * been called on the same test command with force set to false first, or unless the test command
   * already has an OperationState of OperationState.RollingBack.
   * Clarification: OperationState.RollingBack means that the system will be/is cleaning up internal
   * system state caused by executing the command.  It will not restore data if the
   * test command was to cause data loss.  For example, if you call StartDataLoss then call this API, the
   * system will only clean up internal state from running the command.
   * It will not restore the target partition's data, if the command progressed far enough to cause data
   * loss.
   *
   * Important note:  if this API is invoked with force==true, internal state may be left behind.
   * @param operationId A GUID that identifies a call of this API.  This is passed into the corresponding
   *                    GetProgress API
   * @param force Indicates whether to gracefully roll back and clean up internal system state modified
   *              by executing the user-induced operation.
   * @param options The options parameters.
   */
  cancelOperation(
    operationId: string,
    force: boolean,
    options?: CancelOperationOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { operationId, force, options },
      cancelOperationOperationSpec
    );
  }

  /**
   * Creates a backup policy which can be associated later with a Service Fabric application, service or
   * a partition for periodic backup.
   * @param backupPolicyDescription Describes the backup policy.
   * @param options The options parameters.
   */
  createBackupPolicy(
    backupPolicyDescription: BackupPolicyDescription,
    options?: CreateBackupPolicyOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { backupPolicyDescription, options },
      createBackupPolicyOperationSpec
    );
  }

  /**
   * Deletes an existing backup policy. A backup policy must be created before it can be deleted. A
   * currently active backup policy, associated with any Service Fabric application, service or
   * partition, cannot be deleted without first deleting the mapping.
   * @param backupPolicyName The name of the backup policy.
   * @param options The options parameters.
   */
  deleteBackupPolicy(
    backupPolicyName: string,
    options?: DeleteBackupPolicyOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { backupPolicyName, options },
      deleteBackupPolicyOperationSpec
    );
  }

  /**
   * Get a list of all the backup policies configured.
   * @param options The options parameters.
   */
  getBackupPolicyList(
    options?: GetBackupPolicyListOptionalParams
  ): Promise<GetBackupPolicyListResponse> {
    return this.sendOperationRequest(
      { options },
      getBackupPolicyListOperationSpec
    );
  }

  /**
   * Gets a particular backup policy identified by {backupPolicyName}
   * @param backupPolicyName The name of the backup policy.
   * @param options The options parameters.
   */
  getBackupPolicyByName(
    backupPolicyName: string,
    options?: GetBackupPolicyByNameOptionalParams
  ): Promise<GetBackupPolicyByNameResponse> {
    return this.sendOperationRequest(
      { backupPolicyName, options },
      getBackupPolicyByNameOperationSpec
    );
  }

  /**
   * Returns a list of Service Fabric application, service or partition which are associated with this
   * backup policy.
   * @param backupPolicyName The name of the backup policy.
   * @param options The options parameters.
   */
  getAllEntitiesBackedUpByPolicy(
    backupPolicyName: string,
    options?: GetAllEntitiesBackedUpByPolicyOptionalParams
  ): Promise<GetAllEntitiesBackedUpByPolicyResponse> {
    return this.sendOperationRequest(
      { backupPolicyName, options },
      getAllEntitiesBackedUpByPolicyOperationSpec
    );
  }

  /**
   * Updates the backup policy identified by {backupPolicyName}
   * @param backupPolicyName The name of the backup policy.
   * @param backupPolicyDescription Describes the backup policy.
   * @param options The options parameters.
   */
  updateBackupPolicy(
    backupPolicyName: string,
    backupPolicyDescription: BackupPolicyDescription,
    options?: UpdateBackupPolicyOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { backupPolicyName, backupPolicyDescription, options },
      updateBackupPolicyOperationSpec
    );
  }

  /**
   * Enables periodic backup of stateful partitions which are part of this Service Fabric application.
   * Each partition is backed up individually as per the specified backup policy description.
   * Note only C# based Reliable Actor and Reliable Stateful services are currently supported for
   * periodic backup.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param enableBackupDescription Specifies the parameters for enabling backup.
   * @param options The options parameters.
   */
  enableApplicationBackup(
    applicationId: string,
    enableBackupDescription: EnableBackupDescription,
    options?: EnableApplicationBackupOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { applicationId, enableBackupDescription, options },
      enableApplicationBackupOperationSpec
    );
  }

  /**
   * Disables periodic backup of Service Fabric application which was previously enabled.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param options The options parameters.
   */
  disableApplicationBackup(
    applicationId: string,
    options?: DisableApplicationBackupOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { applicationId, options },
      disableApplicationBackupOperationSpec
    );
  }

  /**
   * Gets the Service Fabric backup configuration information for the application and the services and
   * partitions under this application.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param options The options parameters.
   */
  getApplicationBackupConfigurationInfo(
    applicationId: string,
    options?: GetApplicationBackupConfigurationInfoOptionalParams
  ): Promise<GetApplicationBackupConfigurationInfoResponse> {
    return this.sendOperationRequest(
      { applicationId, options },
      getApplicationBackupConfigurationInfoOperationSpec
    );
  }

  /**
   * Returns a list of backups available for every partition in this Service Fabric application. The
   * server enumerates all the backups available at the backup location configured in the backup policy.
   * It also allows filtering of the result based on start and end datetime or just fetching the latest
   * available backup for every partition.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param options The options parameters.
   */
  getApplicationBackupList(
    applicationId: string,
    options?: GetApplicationBackupListOptionalParams
  ): Promise<GetApplicationBackupListResponse> {
    return this.sendOperationRequest(
      { applicationId, options },
      getApplicationBackupListOperationSpec
    );
  }

  /**
   * The application which is configured to take periodic backups, is suspended for taking further
   * backups till it is resumed again. This operation applies to the entire application's hierarchy. It
   * means all the services and partitions under this application are now suspended for backup.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param options The options parameters.
   */
  suspendApplicationBackup(
    applicationId: string,
    options?: SuspendApplicationBackupOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { applicationId, options },
      suspendApplicationBackupOperationSpec
    );
  }

  /**
   * The previously suspended Service Fabric application resumes taking periodic backup as per the backup
   * policy currently configured for the same.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param options The options parameters.
   */
  resumeApplicationBackup(
    applicationId: string,
    options?: ResumeApplicationBackupOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { applicationId, options },
      resumeApplicationBackupOperationSpec
    );
  }

  /**
   * Enables periodic backup of stateful partitions which are part of this Service Fabric service. Each
   * partition is backed up individually as per the specified backup policy description. In case the
   * application, which the service is part of, is already enabled for backup then this operation would
   * override the policy being used to take the periodic backup for this service and its partitions
   * (unless explicitly overridden at the partition level).
   * Note only C# based Reliable Actor and Reliable Stateful services are currently supported for
   * periodic backup.
   * @param serviceId The identity of the service. This ID is typically the full name of the service
   *                  without the 'fabric:' URI scheme.
   *                  Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                  For example, if the service name is "fabric:/myapp/app1/svc1", the service identity would be
   *                  "myapp~app1~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   * @param enableBackupDescription Specifies the parameters for enabling backup.
   * @param options The options parameters.
   */
  enableServiceBackup(
    serviceId: string,
    enableBackupDescription: EnableBackupDescription,
    options?: EnableServiceBackupOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { serviceId, enableBackupDescription, options },
      enableServiceBackupOperationSpec
    );
  }

  /**
   * Disables periodic backup of Service Fabric service which was previously enabled. Backup must be
   * explicitly enabled before it can be disabled.
   * In case the backup is enabled for the Service Fabric application, which this service is part of,
   * this service would continue to be periodically backed up as per the policy mapped at the application
   * level.
   * @param serviceId The identity of the service. This ID is typically the full name of the service
   *                  without the 'fabric:' URI scheme.
   *                  Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                  For example, if the service name is "fabric:/myapp/app1/svc1", the service identity would be
   *                  "myapp~app1~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   * @param options The options parameters.
   */
  disableServiceBackup(
    serviceId: string,
    options?: DisableServiceBackupOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { serviceId, options },
      disableServiceBackupOperationSpec
    );
  }

  /**
   * Gets the Service Fabric backup configuration information for the service and the partitions under
   * this service.
   * @param serviceId The identity of the service. This ID is typically the full name of the service
   *                  without the 'fabric:' URI scheme.
   *                  Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                  For example, if the service name is "fabric:/myapp/app1/svc1", the service identity would be
   *                  "myapp~app1~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   * @param options The options parameters.
   */
  getServiceBackupConfigurationInfo(
    serviceId: string,
    options?: GetServiceBackupConfigurationInfoOptionalParams
  ): Promise<GetServiceBackupConfigurationInfoResponse> {
    return this.sendOperationRequest(
      { serviceId, options },
      getServiceBackupConfigurationInfoOperationSpec
    );
  }

  /**
   * Returns a list of backups available for every partition in this Service Fabric service. The server
   * enumerates all the backups available in the backup store configured in the backup policy. It also
   * allows filtering of the result based on start and end datetime or just fetching the latest available
   * backup for every partition.
   * @param serviceId The identity of the service. This ID is typically the full name of the service
   *                  without the 'fabric:' URI scheme.
   *                  Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                  For example, if the service name is "fabric:/myapp/app1/svc1", the service identity would be
   *                  "myapp~app1~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   * @param options The options parameters.
   */
  getServiceBackupList(
    serviceId: string,
    options?: GetServiceBackupListOptionalParams
  ): Promise<GetServiceBackupListResponse> {
    return this.sendOperationRequest(
      { serviceId, options },
      getServiceBackupListOperationSpec
    );
  }

  /**
   * The service which is configured to take periodic backups, is suspended for taking further backups
   * till it is resumed again. This operation applies to the entire service's hierarchy. It means all the
   * partitions under this service are now suspended for backup.
   * @param serviceId The identity of the service. This ID is typically the full name of the service
   *                  without the 'fabric:' URI scheme.
   *                  Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                  For example, if the service name is "fabric:/myapp/app1/svc1", the service identity would be
   *                  "myapp~app1~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   * @param options The options parameters.
   */
  suspendServiceBackup(
    serviceId: string,
    options?: SuspendServiceBackupOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { serviceId, options },
      suspendServiceBackupOperationSpec
    );
  }

  /**
   * The previously suspended Service Fabric service resumes taking periodic backup as per the backup
   * policy currently configured for the same.
   * @param serviceId The identity of the service. This ID is typically the full name of the service
   *                  without the 'fabric:' URI scheme.
   *                  Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                  For example, if the service name is "fabric:/myapp/app1/svc1", the service identity would be
   *                  "myapp~app1~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   * @param options The options parameters.
   */
  resumeServiceBackup(
    serviceId: string,
    options?: ResumeServiceBackupOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { serviceId, options },
      resumeServiceBackupOperationSpec
    );
  }

  /**
   * Enables periodic backup of stateful persisted partition. Each partition is backed up as per the
   * specified backup policy description. In case the application or service, which is partition is part
   * of, is already enabled for backup then this operation would override the policy being used to take
   * the periodic backup of this partition.
   * Note only C# based Reliable Actor and Reliable Stateful services are currently supported for
   * periodic backup.
   * @param partitionId The identity of the partition.
   * @param enableBackupDescription Specifies the parameters for enabling backup.
   * @param options The options parameters.
   */
  enablePartitionBackup(
    partitionId: string,
    enableBackupDescription: EnableBackupDescription,
    options?: EnablePartitionBackupOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { partitionId, enableBackupDescription, options },
      enablePartitionBackupOperationSpec
    );
  }

  /**
   * Disables periodic backup of partition which was previously enabled. Backup must be explicitly
   * enabled before it can be disabled.
   * In case the backup is enabled for the Service Fabric application or service, which this partition is
   * part of, this partition would continue to be periodically backed up as per the policy mapped at the
   * higher level entity.
   * @param partitionId The identity of the partition.
   * @param options The options parameters.
   */
  disablePartitionBackup(
    partitionId: string,
    options?: DisablePartitionBackupOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { partitionId, options },
      disablePartitionBackupOperationSpec
    );
  }

  /**
   * Gets the Service Fabric Backup configuration information for the specified partition.
   * @param partitionId The identity of the partition.
   * @param options The options parameters.
   */
  getPartitionBackupConfigurationInfo(
    partitionId: string,
    options?: GetPartitionBackupConfigurationInfoOptionalParams
  ): Promise<GetPartitionBackupConfigurationInfoResponse> {
    return this.sendOperationRequest(
      { partitionId, options },
      getPartitionBackupConfigurationInfoOperationSpec
    );
  }

  /**
   * Returns a list of backups available for the specified partition. The server enumerates all the
   * backups available in the backup store configured in the backup policy. It also allows filtering of
   * the result based on start and end datetime or just fetching the latest available backup for the
   * partition.
   * @param partitionId The identity of the partition.
   * @param options The options parameters.
   */
  getPartitionBackupList(
    partitionId: string,
    options?: GetPartitionBackupListOptionalParams
  ): Promise<GetPartitionBackupListResponse> {
    return this.sendOperationRequest(
      { partitionId, options },
      getPartitionBackupListOperationSpec
    );
  }

  /**
   * The partition which is configured to take periodic backups, is suspended for taking further backups
   * till it is resumed again.
   * @param partitionId The identity of the partition.
   * @param options The options parameters.
   */
  suspendPartitionBackup(
    partitionId: string,
    options?: SuspendPartitionBackupOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { partitionId, options },
      suspendPartitionBackupOperationSpec
    );
  }

  /**
   * The previously suspended partition resumes taking periodic backup as per the backup policy currently
   * configured for the same.
   * @param partitionId The identity of the partition.
   * @param options The options parameters.
   */
  resumePartitionBackup(
    partitionId: string,
    options?: ResumePartitionBackupOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { partitionId, options },
      resumePartitionBackupOperationSpec
    );
  }

  /**
   * Creates a backup of the stateful persisted partition's state. In case the partition is already being
   * periodically backed up, then by default the new backup is created at the same backup storage. One
   * can also override the same by specifying the backup storage details as part of the request body.
   * Once the backup is initiated, its progress can be tracked using the GetBackupProgress operation.
   * In case, the operation times out, specify a greater backup timeout value in the query parameter.
   * @param partitionId The identity of the partition.
   * @param options The options parameters.
   */
  backupPartition(
    partitionId: string,
    options?: BackupPartitionOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { partitionId, options },
      backupPartitionOperationSpec
    );
  }

  /**
   * Returns information about the state of the latest backup along with details or failure reason in
   * case of completion.
   * @param partitionId The identity of the partition.
   * @param options The options parameters.
   */
  getPartitionBackupProgress(
    partitionId: string,
    options?: GetPartitionBackupProgressOptionalParams
  ): Promise<GetPartitionBackupProgressResponse> {
    return this.sendOperationRequest(
      { partitionId, options },
      getPartitionBackupProgressOperationSpec
    );
  }

  /**
   * Restores the state of a of the stateful persisted partition using the specified backup point. In
   * case the partition is already being periodically backed up, then by default the backup point is
   * looked for in the storage specified in backup policy. One can also override the same by specifying
   * the backup storage details as part of the restore partition description in body. Once the restore is
   * initiated, its progress can be tracked using the GetRestoreProgress operation.
   * In case, the operation times out, specify a greater restore timeout value in the query parameter.
   * @param partitionId The identity of the partition.
   * @param restorePartitionDescription Describes the parameters to restore the partition.
   * @param options The options parameters.
   */
  restorePartition(
    partitionId: string,
    restorePartitionDescription: RestorePartitionDescription,
    options?: RestorePartitionOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { partitionId, restorePartitionDescription, options },
      restorePartitionOperationSpec
    );
  }

  /**
   * Returns information about the state of the latest restore operation along with details or failure
   * reason in case of completion.
   * @param partitionId The identity of the partition.
   * @param options The options parameters.
   */
  getPartitionRestoreProgress(
    partitionId: string,
    options?: GetPartitionRestoreProgressOptionalParams
  ): Promise<GetPartitionRestoreProgressResponse> {
    return this.sendOperationRequest(
      { partitionId, options },
      getPartitionRestoreProgressOperationSpec
    );
  }

  /**
   * Gets the list of backups available for the specified backed up entity (Application, Service or
   * Partition) at the specified backup location (FileShare or Azure Blob Storage).
   * @param getBackupByStorageQueryDescription Describes the filters and backup storage details to be
   *                                           used for enumerating backups.
   * @param options The options parameters.
   */
  getBackupsFromBackupLocation(
    getBackupByStorageQueryDescription: GetBackupByStorageQueryDescription,
    options?: GetBackupsFromBackupLocationOptionalParams
  ): Promise<GetBackupsFromBackupLocationResponse> {
    return this.sendOperationRequest(
      { getBackupByStorageQueryDescription, options },
      getBackupsFromBackupLocationOperationSpec
    );
  }

  /**
   * Creates the specified Service Fabric name.
   * @param nameDescription Describes the Service Fabric name to be created.
   * @param options The options parameters.
   */
  createName(
    nameDescription: NameDescription,
    options?: CreateNameOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { nameDescription, options },
      createNameOperationSpec
    );
  }

  /**
   * Returns whether the specified Service Fabric name exists.
   * @param nameId The Service Fabric name, without the 'fabric:' URI scheme.
   * @param options The options parameters.
   */
  getNameExistsInfo(
    nameId: string,
    options?: GetNameExistsInfoOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { nameId, options },
      getNameExistsInfoOperationSpec
    );
  }

  /**
   * Deletes the specified Service Fabric name. A name must be created before it can be deleted. Deleting
   * a name with child properties will fail.
   * @param nameId The Service Fabric name, without the 'fabric:' URI scheme.
   * @param options The options parameters.
   */
  deleteName(
    nameId: string,
    options?: DeleteNameOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { nameId, options },
      deleteNameOperationSpec
    );
  }

  /**
   * Enumerates all the Service Fabric names under a given name. If the subnames do not fit in a page,
   * one page of results is returned as well as a continuation token, which can be used to get the next
   * page. Querying a name that doesn't exist will fail.
   * @param nameId The Service Fabric name, without the 'fabric:' URI scheme.
   * @param options The options parameters.
   */
  getSubNameInfoList(
    nameId: string,
    options?: GetSubNameInfoListOptionalParams
  ): Promise<GetSubNameInfoListResponse> {
    return this.sendOperationRequest(
      { nameId, options },
      getSubNameInfoListOperationSpec
    );
  }

  /**
   * A Service Fabric name can have one or more named properties that store custom information. This
   * operation gets the information about these properties in a paged list. The information includes
   * name, value, and metadata about each of the properties.
   * @param nameId The Service Fabric name, without the 'fabric:' URI scheme.
   * @param options The options parameters.
   */
  getPropertyInfoList(
    nameId: string,
    options?: GetPropertyInfoListOptionalParams
  ): Promise<GetPropertyInfoListResponse> {
    return this.sendOperationRequest(
      { nameId, options },
      getPropertyInfoListOperationSpec
    );
  }

  /**
   * Creates or updates the specified Service Fabric property under a given name.
   * @param nameId The Service Fabric name, without the 'fabric:' URI scheme.
   * @param propertyDescription Describes the Service Fabric property to be created.
   * @param options The options parameters.
   */
  putProperty(
    nameId: string,
    propertyDescription: PropertyDescription,
    options?: PutPropertyOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { nameId, propertyDescription, options },
      putPropertyOperationSpec
    );
  }

  /**
   * Gets the specified Service Fabric property under a given name. This will always return both value
   * and metadata.
   * @param nameId The Service Fabric name, without the 'fabric:' URI scheme.
   * @param propertyName Specifies the name of the property to get.
   * @param options The options parameters.
   */
  getPropertyInfo(
    nameId: string,
    propertyName: string,
    options?: GetPropertyInfoOptionalParams
  ): Promise<GetPropertyInfoResponse> {
    return this.sendOperationRequest(
      { nameId, propertyName, options },
      getPropertyInfoOperationSpec
    );
  }

  /**
   * Deletes the specified Service Fabric property under a given name. A property must be created before
   * it can be deleted.
   * @param nameId The Service Fabric name, without the 'fabric:' URI scheme.
   * @param propertyName Specifies the name of the property to get.
   * @param options The options parameters.
   */
  deleteProperty(
    nameId: string,
    propertyName: string,
    options?: DeletePropertyOptionalParams
  ): Promise<void> {
    return this.sendOperationRequest(
      { nameId, propertyName, options },
      deletePropertyOperationSpec
    );
  }

  /**
   * Submits a batch of property operations. Either all or none of the operations will be committed.
   * @param nameId The Service Fabric name, without the 'fabric:' URI scheme.
   * @param propertyBatchDescriptionList Describes the property batch operations to be submitted.
   * @param options The options parameters.
   */
  submitPropertyBatch(
    nameId: string,
    propertyBatchDescriptionList: PropertyBatchDescriptionList,
    options?: SubmitPropertyBatchOptionalParams
  ): Promise<SubmitPropertyBatchResponse> {
    return this.sendOperationRequest(
      { nameId, propertyBatchDescriptionList, options },
      submitPropertyBatchOperationSpec
    );
  }

  /**
   * The response is list of ClusterEvent objects.
   * @param startTimeUtc The start time of a lookup query in ISO UTC yyyy-MM-ddTHH:mm:ssZ.
   * @param endTimeUtc The end time of a lookup query in ISO UTC yyyy-MM-ddTHH:mm:ssZ.
   * @param options The options parameters.
   */
  getClusterEventList(
    startTimeUtc: string,
    endTimeUtc: string,
    options?: GetClusterEventListOptionalParams
  ): Promise<GetClusterEventListResponse> {
    return this.sendOperationRequest(
      { startTimeUtc, endTimeUtc, options },
      getClusterEventListOperationSpec
    );
  }

  /**
   * The response is list of ContainerInstanceEvent objects.
   * @param startTimeUtc The start time of a lookup query in ISO UTC yyyy-MM-ddTHH:mm:ssZ.
   * @param endTimeUtc The end time of a lookup query in ISO UTC yyyy-MM-ddTHH:mm:ssZ.
   * @param options The options parameters.
   */
  getContainersEventList(
    startTimeUtc: string,
    endTimeUtc: string,
    options?: GetContainersEventListOptionalParams
  ): Promise<GetContainersEventListResponse> {
    return this.sendOperationRequest(
      { startTimeUtc, endTimeUtc, options },
      getContainersEventListOperationSpec
    );
  }

  /**
   * The response is list of NodeEvent objects.
   * @param nodeName The name of the node.
   * @param startTimeUtc The start time of a lookup query in ISO UTC yyyy-MM-ddTHH:mm:ssZ.
   * @param endTimeUtc The end time of a lookup query in ISO UTC yyyy-MM-ddTHH:mm:ssZ.
   * @param options The options parameters.
   */
  getNodeEventList(
    nodeName: string,
    startTimeUtc: string,
    endTimeUtc: string,
    options?: GetNodeEventListOptionalParams
  ): Promise<GetNodeEventListResponse> {
    return this.sendOperationRequest(
      { nodeName, startTimeUtc, endTimeUtc, options },
      getNodeEventListOperationSpec
    );
  }

  /**
   * The response is list of NodeEvent objects.
   * @param startTimeUtc The start time of a lookup query in ISO UTC yyyy-MM-ddTHH:mm:ssZ.
   * @param endTimeUtc The end time of a lookup query in ISO UTC yyyy-MM-ddTHH:mm:ssZ.
   * @param options The options parameters.
   */
  getNodesEventList(
    startTimeUtc: string,
    endTimeUtc: string,
    options?: GetNodesEventListOptionalParams
  ): Promise<GetNodesEventListResponse> {
    return this.sendOperationRequest(
      { startTimeUtc, endTimeUtc, options },
      getNodesEventListOperationSpec
    );
  }

  /**
   * The response is list of ApplicationEvent objects.
   * @param applicationId The identity of the application. This is typically the full name of the
   *                      application without the 'fabric:' URI scheme.
   *                      Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                      For example, if the application name is "fabric:/myapp/app1", the application identity would be
   *                      "myapp~app1" in 6.0+ and "myapp/app1" in previous versions.
   * @param startTimeUtc The start time of a lookup query in ISO UTC yyyy-MM-ddTHH:mm:ssZ.
   * @param endTimeUtc The end time of a lookup query in ISO UTC yyyy-MM-ddTHH:mm:ssZ.
   * @param options The options parameters.
   */
  getApplicationEventList(
    applicationId: string,
    startTimeUtc: string,
    endTimeUtc: string,
    options?: GetApplicationEventListOptionalParams
  ): Promise<GetApplicationEventListResponse> {
    return this.sendOperationRequest(
      { applicationId, startTimeUtc, endTimeUtc, options },
      getApplicationEventListOperationSpec
    );
  }

  /**
   * The response is list of ApplicationEvent objects.
   * @param startTimeUtc The start time of a lookup query in ISO UTC yyyy-MM-ddTHH:mm:ssZ.
   * @param endTimeUtc The end time of a lookup query in ISO UTC yyyy-MM-ddTHH:mm:ssZ.
   * @param options The options parameters.
   */
  getApplicationsEventList(
    startTimeUtc: string,
    endTimeUtc: string,
    options?: GetApplicationsEventListOptionalParams
  ): Promise<GetApplicationsEventListResponse> {
    return this.sendOperationRequest(
      { startTimeUtc, endTimeUtc, options },
      getApplicationsEventListOperationSpec
    );
  }

  /**
   * The response is list of ServiceEvent objects.
   * @param serviceId The identity of the service. This ID is typically the full name of the service
   *                  without the 'fabric:' URI scheme.
   *                  Starting from version 6.0, hierarchical names are delimited with the "~" character.
   *                  For example, if the service name is "fabric:/myapp/app1/svc1", the service identity would be
   *                  "myapp~app1~svc1" in 6.0+ and "myapp/app1/svc1" in previous versions.
   * @param startTimeUtc The start time of a lookup query in ISO UTC yyyy-MM-ddTHH:mm:ssZ.
   * @param endTimeUtc The end time of a lookup query in ISO UTC yyyy-MM-ddTHH:mm:ssZ.
   * @param options The options parameters.
   */
  getServiceEventList(
    serviceId: string,
    startTimeUtc: string,
    endTimeUtc: string,
    options?: GetServiceEventListOptionalParams
  ): Promise<GetServiceEventListResponse> {
    return this.sendOperationRequest(
      { serviceId, startTimeUtc, endTimeUtc, options },
      getServiceEventListOperationSpec
    );
  }

  /**
   * The response is list of ServiceEvent objects.
   * @param startTimeUtc The start time of a lookup query in ISO UTC yyyy-MM-ddTHH:mm:ssZ.
   * @param endTimeUtc The end time of a lookup query in ISO UTC yyyy-MM-ddTHH:mm:ssZ.
   * @param options The options parameters.
   */
  getServicesEventList(
    startTimeUtc: string,
    endTimeUtc: string,
    options?: GetServicesEventListOptionalParams
  ): Promise<GetServicesEventListResponse> {
    return this.sendOperationRequest(
      { startTimeUtc, endTimeUtc, options },
      getServicesEventListOperationSpec
    );
  }

  /**
   * The response is list of PartitionEvent objects.
   * @param partitionId The identity of the partition.
   * @param startTimeUtc The start time of a lookup query in ISO UTC yyyy-MM-ddTHH:mm:ssZ.
   * @param endTimeUtc The end time of a lookup query in ISO UTC yyyy-MM-ddTHH:mm:ssZ.
   * @param options The options parameters.
   */
  getPartitionEventList(
    partitionId: string,
    startTimeUtc: string,
    endTimeUtc: string,
    options?: GetPartitionEventListOptionalParams
  ): Promise<GetPartitionEventListResponse> {
    return this.sendOperationRequest(
      { partitionId, startTimeUtc, endTimeUtc, options },
      getPartitionEventListOperationSpec
    );
  }

  /**
   * The response is list of PartitionEvent objects.
   * @param startTimeUtc The start time of a lookup query in ISO UTC yyyy-MM-ddTHH:mm:ssZ.
   * @param endTimeUtc The end time of a lookup query in ISO UTC yyyy-MM-ddTHH:mm:ssZ.
   * @param options The options parameters.
   */
  getPartitionsEventList(
    startTimeUtc: string,
    endTimeUtc: string,
    options?: GetPartitionsEventListOptionalParams
  ): Promise<GetPartitionsEventListResponse> {
    return this.sendOperationRequest(
      { startTimeUtc, endTimeUtc, options },
      getPartitionsEventListOperationSpec
    );
  }

  /**
   * The response is list of ReplicaEvent objects.
   * @param partitionId The identity of the partition.
   * @param replicaId The identifier of the replica.
   * @param startTimeUtc The start time of a lookup query in ISO UTC yyyy-MM-ddTHH:mm:ssZ.
   * @param endTimeUtc The end time of a lookup query in ISO UTC yyyy-MM-ddTHH:mm:ssZ.
   * @param options The options parameters.
   */
  getPartitionReplicaEventList(
    partitionId: string,
    replicaId: string,
    startTimeUtc: string,
    endTimeUtc: string,
    options?: GetPartitionReplicaEventListOptionalParams
  ): Promise<GetPartitionReplicaEventListResponse> {
    return this.sendOperationRequest(
      { partitionId, replicaId, startTimeUtc, endTimeUtc, options },
      getPartitionReplicaEventListOperationSpec
    );
  }

  /**
   * The response is list of ReplicaEvent objects.
   * @param partitionId The identity of the partition.
   * @param startTimeUtc The start time of a lookup query in ISO UTC yyyy-MM-ddTHH:mm:ssZ.
   * @param endTimeUtc The end time of a lookup query in ISO UTC yyyy-MM-ddTHH:mm:ssZ.
   * @param options The options parameters.
   */
  getPartitionReplicasEventList(
    partitionId: string,
    startTimeUtc: string,
    endTimeUtc: string,
    options?: GetPartitionReplicasEventListOptionalParams
  ): Promise<GetPartitionReplicasEventListResponse> {
    return this.sendOperationRequest(
      { partitionId, startTimeUtc, endTimeUtc, options },
      getPartitionReplicasEventListOperationSpec
    );
  }

  /**
   * The response is list of FabricEvents.
   * @param eventInstanceId The EventInstanceId.
   * @param options The options parameters.
   */
  getCorrelatedEventList(
    eventInstanceId: string,
    options?: GetCorrelatedEventListOptionalParams
  ): Promise<GetCorrelatedEventListResponse> {
    return this.sendOperationRequest(
      { eventInstanceId, options },
      getCorrelatedEventListOperationSpec
    );
  }

  meshSecret: MeshSecret;
  meshSecretValue: MeshSecretValue;
  meshVolume: MeshVolume;
  meshNetwork: MeshNetwork;
  meshApplication: MeshApplication;
  meshService: MeshService;
  meshCodePackage: MeshCodePackage;
  meshServiceReplica: MeshServiceReplica;
  meshGateway: MeshGateway;
}
// Operation Specifications
const serializer = coreClient.createSerializer(Mappers, /* isXml */ false);

const getClusterManifestOperationSpec: coreClient.OperationSpec = {
  path: "/$/GetClusterManifest",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ClusterManifest
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const getClusterHealthOperationSpec: coreClient.OperationSpec = {
  path: "/$/GetClusterHealth",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ClusterHealth
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.nodesHealthStateFilter,
    Parameters.applicationsHealthStateFilter,
    Parameters.eventsHealthStateFilter,
    Parameters.excludeHealthStatistics,
    Parameters.includeSystemApplicationHealthStatistics
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const getClusterHealthUsingPolicyOperationSpec: coreClient.OperationSpec = {
  path: "/$/GetClusterHealth",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.ClusterHealth
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.clusterHealthPolicies,
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.nodesHealthStateFilter,
    Parameters.applicationsHealthStateFilter,
    Parameters.eventsHealthStateFilter,
    Parameters.excludeHealthStatistics,
    Parameters.includeSystemApplicationHealthStatistics
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getClusterHealthChunkOperationSpec: coreClient.OperationSpec = {
  path: "/$/GetClusterHealthChunk",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ClusterHealthChunk
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const getClusterHealthChunkUsingPolicyAndAdvancedFiltersOperationSpec: coreClient.OperationSpec = {
  path: "/$/GetClusterHealthChunk",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.ClusterHealthChunk
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.clusterHealthChunkQueryDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const reportClusterHealthOperationSpec: coreClient.OperationSpec = {
  path: "/$/ReportClusterHealth",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.healthInformation,
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.immediate
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getProvisionedFabricCodeVersionInfoListOperationSpec: coreClient.OperationSpec = {
  path: "/$/GetProvisionedCodeVersions",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: {
        type: {
          name: "Sequence",
          element: {
            type: { name: "Composite", className: "FabricCodeVersionInfo" }
          }
        }
      }
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.codeVersion
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const getProvisionedFabricConfigVersionInfoListOperationSpec: coreClient.OperationSpec = {
  path: "/$/GetProvisionedConfigVersions",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: {
        type: {
          name: "Sequence",
          element: {
            type: { name: "Composite", className: "FabricConfigVersionInfo" }
          }
        }
      }
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.configVersion
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const getClusterUpgradeProgressOperationSpec: coreClient.OperationSpec = {
  path: "/$/GetUpgradeProgress",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ClusterUpgradeProgressObject
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const getClusterConfigurationOperationSpec: coreClient.OperationSpec = {
  path: "/$/GetClusterConfiguration",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ClusterConfiguration
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.configurationApiVersion
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const getClusterConfigurationUpgradeStatusOperationSpec: coreClient.OperationSpec = {
  path: "/$/GetClusterConfigurationUpgradeStatus",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ClusterConfigurationUpgradeStatusInfo
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const getUpgradeOrchestrationServiceStateOperationSpec: coreClient.OperationSpec = {
  path: "/$/GetUpgradeOrchestrationServiceState",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.UpgradeOrchestrationServiceState
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const setUpgradeOrchestrationServiceStateOperationSpec: coreClient.OperationSpec = {
  path: "/$/SetUpgradeOrchestrationServiceState",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.UpgradeOrchestrationServiceStateSummary
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.upgradeOrchestrationServiceState,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const provisionClusterOperationSpec: coreClient.OperationSpec = {
  path: "/$/Provision",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.provisionFabricDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const unprovisionClusterOperationSpec: coreClient.OperationSpec = {
  path: "/$/Unprovision",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.unprovisionFabricDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const rollbackClusterUpgradeOperationSpec: coreClient.OperationSpec = {
  path: "/$/RollbackUpgrade",
  httpMethod: "POST",
  responses: {
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const resumeClusterUpgradeOperationSpec: coreClient.OperationSpec = {
  path: "/$/MoveToNextUpgradeDomain",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.resumeClusterUpgradeDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const startClusterUpgradeOperationSpec: coreClient.OperationSpec = {
  path: "/$/Upgrade",
  httpMethod: "POST",
  responses: {
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.startClusterUpgradeDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const startClusterConfigurationUpgradeOperationSpec: coreClient.OperationSpec = {
  path: "/$/StartClusterConfigurationUpgrade",
  httpMethod: "POST",
  responses: {
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.clusterConfigurationUpgradeDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const updateClusterUpgradeOperationSpec: coreClient.OperationSpec = {
  path: "/$/UpdateUpgrade",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.updateClusterUpgradeDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getAadMetadataOperationSpec: coreClient.OperationSpec = {
  path: "/$/GetAadMetadata",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.AadMetadataObject
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const getClusterVersionOperationSpec: coreClient.OperationSpec = {
  path: "/$/GetClusterVersion",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ClusterVersion
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const getClusterLoadOperationSpec: coreClient.OperationSpec = {
  path: "/$/GetLoadInformation",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ClusterLoadInfo
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const toggleVerboseServicePlacementHealthReportingOperationSpec: coreClient.OperationSpec = {
  path: "/$/ToggleVerboseServicePlacementHealthReporting",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.enabled
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const validateClusterUpgradeOperationSpec: coreClient.OperationSpec = {
  path: "/$/ValidateUpgrade",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.ValidateClusterUpgradeResult
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.startClusterUpgradeDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getNodeInfoListOperationSpec: coreClient.OperationSpec = {
  path: "/Nodes",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PagedNodeInfoList
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.continuationToken,
    Parameters.nodeStatusFilter,
    Parameters.maxResults
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const getNodeInfoOperationSpec: coreClient.OperationSpec = {
  path: "/Nodes/{nodeName}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.NodeInfo
    },
    204: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.nodeName],
  headerParameters: [Parameters.accept],
  serializer
};
const getNodeHealthOperationSpec: coreClient.OperationSpec = {
  path: "/Nodes/{nodeName}/$/GetHealth",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.NodeHealth
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.eventsHealthStateFilter
  ],
  urlParameters: [Parameters.$host, Parameters.nodeName],
  headerParameters: [Parameters.accept],
  serializer
};
const getNodeHealthUsingPolicyOperationSpec: coreClient.OperationSpec = {
  path: "/Nodes/{nodeName}/$/GetHealth",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.NodeHealth
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.clusterHealthPolicy,
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.eventsHealthStateFilter
  ],
  urlParameters: [Parameters.$host, Parameters.nodeName],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const reportNodeHealthOperationSpec: coreClient.OperationSpec = {
  path: "/Nodes/{nodeName}/$/ReportHealth",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.healthInformation,
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.immediate
  ],
  urlParameters: [Parameters.$host, Parameters.nodeName],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getNodeLoadInfoOperationSpec: coreClient.OperationSpec = {
  path: "/Nodes/{nodeName}/$/GetLoadInformation",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.NodeLoadInfo
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.nodeName],
  headerParameters: [Parameters.accept],
  serializer
};
const disableNodeOperationSpec: coreClient.OperationSpec = {
  path: "/Nodes/{nodeName}/$/Deactivate",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.deactivationIntentDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.nodeName],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const enableNodeOperationSpec: coreClient.OperationSpec = {
  path: "/Nodes/{nodeName}/$/Activate",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.nodeName],
  headerParameters: [Parameters.accept],
  serializer
};
const removeNodeStateOperationSpec: coreClient.OperationSpec = {
  path: "/Nodes/{nodeName}/$/RemoveNodeState",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.nodeName],
  headerParameters: [Parameters.accept],
  serializer
};
const restartNodeOperationSpec: coreClient.OperationSpec = {
  path: "/Nodes/{nodeName}/$/Restart",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.restartNodeDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.nodeName],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const removeConfigurationOverridesOperationSpec: coreClient.OperationSpec = {
  path: "/Nodes/{nodeName}/$/RemoveConfigurationOverrides",
  httpMethod: "DELETE",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.nodeName],
  headerParameters: [Parameters.accept],
  serializer
};
const getConfigurationOverridesOperationSpec: coreClient.OperationSpec = {
  path: "/Nodes/{nodeName}/$/GetConfigurationOverrides",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: {
        type: {
          name: "Sequence",
          element: {
            type: { name: "Composite", className: "ConfigParameterOverride" }
          }
        }
      }
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.nodeName],
  headerParameters: [Parameters.accept],
  serializer
};
const addConfigurationParameterOverridesOperationSpec: coreClient.OperationSpec = {
  path: "/Nodes/{nodeName}/$/AddConfigurationParameterOverrides",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.configParameterOverrideList,
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.force
  ],
  urlParameters: [Parameters.$host, Parameters.nodeName],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const removeNodeTagsOperationSpec: coreClient.OperationSpec = {
  path: "/Nodes/{nodeName}/$/RemoveNodeTags",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.nodeTags,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.$host, Parameters.nodeName],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const addNodeTagsOperationSpec: coreClient.OperationSpec = {
  path: "/Nodes/{nodeName}/$/AddNodeTags",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.nodeTags,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.$host, Parameters.nodeName],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getApplicationTypeInfoListOperationSpec: coreClient.OperationSpec = {
  path: "/ApplicationTypes",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PagedApplicationTypeInfoList
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.continuationToken,
    Parameters.maxResults,
    Parameters.applicationTypeDefinitionKindFilter,
    Parameters.excludeApplicationParameters
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const getApplicationTypeInfoListByNameOperationSpec: coreClient.OperationSpec = {
  path: "/ApplicationTypes/{applicationTypeName}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PagedApplicationTypeInfoList
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.continuationToken,
    Parameters.maxResults,
    Parameters.excludeApplicationParameters,
    Parameters.applicationTypeVersion
  ],
  urlParameters: [Parameters.$host, Parameters.applicationTypeName],
  headerParameters: [Parameters.accept],
  serializer
};
const provisionApplicationTypeOperationSpec: coreClient.OperationSpec = {
  path: "/ApplicationTypes/$/Provision",
  httpMethod: "POST",
  responses: {
    200: {},
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody:
    Parameters.provisionApplicationTypeDescriptionBaseRequiredBodyParam,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const unprovisionApplicationTypeOperationSpec: coreClient.OperationSpec = {
  path: "/ApplicationTypes/{applicationTypeName}/$/Unprovision",
  httpMethod: "POST",
  responses: {
    200: {},
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.unprovisionApplicationTypeDescriptionInfo,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.applicationTypeName],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getServiceTypeInfoListOperationSpec: coreClient.OperationSpec = {
  path: "/ApplicationTypes/{applicationTypeName}/$/GetServiceTypes",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: {
        type: {
          name: "Sequence",
          element: { type: { name: "Composite", className: "ServiceTypeInfo" } }
        }
      }
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.applicationTypeVersion1
  ],
  urlParameters: [Parameters.$host, Parameters.applicationTypeName],
  headerParameters: [Parameters.accept],
  serializer
};
const getServiceTypeInfoByNameOperationSpec: coreClient.OperationSpec = {
  path:
    "/ApplicationTypes/{applicationTypeName}/$/GetServiceTypes/{serviceTypeName}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ServiceTypeInfo
    },
    204: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.applicationTypeVersion1
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.applicationTypeName,
    Parameters.serviceTypeName
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const getServiceManifestOperationSpec: coreClient.OperationSpec = {
  path: "/ApplicationTypes/{applicationTypeName}/$/GetServiceManifest",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ServiceTypeManifest
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.applicationTypeVersion1,
    Parameters.serviceManifestName
  ],
  urlParameters: [Parameters.$host, Parameters.applicationTypeName],
  headerParameters: [Parameters.accept],
  serializer
};
const getDeployedServiceTypeInfoListOperationSpec: coreClient.OperationSpec = {
  path: "/Nodes/{nodeName}/$/GetApplications/{applicationId}/$/GetServiceTypes",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: {
        type: {
          name: "Sequence",
          element: {
            type: { name: "Composite", className: "DeployedServiceTypeInfo" }
          }
        }
      }
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.serviceManifestName1
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.nodeName,
    Parameters.applicationId
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const getDeployedServiceTypeInfoByNameOperationSpec: coreClient.OperationSpec = {
  path:
    "/Nodes/{nodeName}/$/GetApplications/{applicationId}/$/GetServiceTypes/{serviceTypeName}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: {
        type: {
          name: "Sequence",
          element: {
            type: { name: "Composite", className: "DeployedServiceTypeInfo" }
          }
        }
      }
    },
    204: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.serviceManifestName1
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.nodeName,
    Parameters.serviceTypeName,
    Parameters.applicationId
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const createApplicationOperationSpec: coreClient.OperationSpec = {
  path: "/Applications/$/Create",
  httpMethod: "POST",
  responses: {
    201: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.applicationDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const deleteApplicationOperationSpec: coreClient.OperationSpec = {
  path: "/Applications/{applicationId}/$/Delete",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.forceRemove
  ],
  urlParameters: [Parameters.$host, Parameters.applicationId],
  headerParameters: [Parameters.accept],
  serializer
};
const getApplicationLoadInfoOperationSpec: coreClient.OperationSpec = {
  path: "/Applications/{applicationId}/$/GetLoadInformation",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ApplicationLoadInfo
    },
    204: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.applicationId],
  headerParameters: [Parameters.accept],
  serializer
};
const getApplicationInfoListOperationSpec: coreClient.OperationSpec = {
  path: "/Applications",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PagedApplicationInfoList
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.continuationToken,
    Parameters.maxResults,
    Parameters.excludeApplicationParameters,
    Parameters.applicationDefinitionKindFilter,
    Parameters.applicationTypeName1
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const getApplicationInfoOperationSpec: coreClient.OperationSpec = {
  path: "/Applications/{applicationId}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ApplicationInfo
    },
    204: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.excludeApplicationParameters
  ],
  urlParameters: [Parameters.$host, Parameters.applicationId],
  headerParameters: [Parameters.accept],
  serializer
};
const getApplicationHealthOperationSpec: coreClient.OperationSpec = {
  path: "/Applications/{applicationId}/$/GetHealth",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ApplicationHealth
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.eventsHealthStateFilter,
    Parameters.excludeHealthStatistics,
    Parameters.deployedApplicationsHealthStateFilter,
    Parameters.servicesHealthStateFilter
  ],
  urlParameters: [Parameters.$host, Parameters.applicationId],
  headerParameters: [Parameters.accept],
  serializer
};
const getApplicationHealthUsingPolicyOperationSpec: coreClient.OperationSpec = {
  path: "/Applications/{applicationId}/$/GetHealth",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.ApplicationHealth
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.applicationHealthPolicy,
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.eventsHealthStateFilter,
    Parameters.excludeHealthStatistics,
    Parameters.deployedApplicationsHealthStateFilter,
    Parameters.servicesHealthStateFilter
  ],
  urlParameters: [Parameters.$host, Parameters.applicationId],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const reportApplicationHealthOperationSpec: coreClient.OperationSpec = {
  path: "/Applications/{applicationId}/$/ReportHealth",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.healthInformation,
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.immediate
  ],
  urlParameters: [Parameters.$host, Parameters.applicationId],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const startApplicationUpgradeOperationSpec: coreClient.OperationSpec = {
  path: "/Applications/{applicationId}/$/Upgrade",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.applicationUpgradeDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.applicationId],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getApplicationUpgradeOperationSpec: coreClient.OperationSpec = {
  path: "/Applications/{applicationId}/$/GetUpgradeProgress",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ApplicationUpgradeProgressInfo
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.applicationId],
  headerParameters: [Parameters.accept],
  serializer
};
const updateApplicationUpgradeOperationSpec: coreClient.OperationSpec = {
  path: "/Applications/{applicationId}/$/UpdateUpgrade",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.applicationUpgradeUpdateDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.applicationId],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const updateApplicationOperationSpec: coreClient.OperationSpec = {
  path: "/Applications/{applicationId}/$/Update",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.applicationUpdateDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.applicationId],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const resumeApplicationUpgradeOperationSpec: coreClient.OperationSpec = {
  path: "/Applications/{applicationId}/$/MoveToNextUpgradeDomain",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.resumeApplicationUpgradeDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.applicationId],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const rollbackApplicationUpgradeOperationSpec: coreClient.OperationSpec = {
  path: "/Applications/{applicationId}/$/RollbackUpgrade",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.applicationId],
  headerParameters: [Parameters.accept],
  serializer
};
const getDeployedApplicationInfoListOperationSpec: coreClient.OperationSpec = {
  path: "/Nodes/{nodeName}/$/GetApplications",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PagedDeployedApplicationInfoList
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.continuationToken,
    Parameters.maxResults,
    Parameters.includeHealthState
  ],
  urlParameters: [Parameters.$host, Parameters.nodeName],
  headerParameters: [Parameters.accept],
  serializer
};
const getDeployedApplicationInfoOperationSpec: coreClient.OperationSpec = {
  path: "/Nodes/{nodeName}/$/GetApplications/{applicationId}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.DeployedApplicationInfo
    },
    204: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.includeHealthState
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.nodeName,
    Parameters.applicationId
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const getDeployedApplicationHealthOperationSpec: coreClient.OperationSpec = {
  path: "/Nodes/{nodeName}/$/GetApplications/{applicationId}/$/GetHealth",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.DeployedApplicationHealth
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.eventsHealthStateFilter,
    Parameters.excludeHealthStatistics,
    Parameters.deployedServicePackagesHealthStateFilter
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.nodeName,
    Parameters.applicationId
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const getDeployedApplicationHealthUsingPolicyOperationSpec: coreClient.OperationSpec = {
  path: "/Nodes/{nodeName}/$/GetApplications/{applicationId}/$/GetHealth",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.DeployedApplicationHealth
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.applicationHealthPolicy,
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.eventsHealthStateFilter,
    Parameters.excludeHealthStatistics,
    Parameters.deployedServicePackagesHealthStateFilter
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.nodeName,
    Parameters.applicationId
  ],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const reportDeployedApplicationHealthOperationSpec: coreClient.OperationSpec = {
  path: "/Nodes/{nodeName}/$/GetApplications/{applicationId}/$/ReportHealth",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.healthInformation,
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.immediate
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.nodeName,
    Parameters.applicationId
  ],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getApplicationManifestOperationSpec: coreClient.OperationSpec = {
  path: "/ApplicationTypes/{applicationTypeName}/$/GetApplicationManifest",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ApplicationTypeManifest
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.applicationTypeVersion1
  ],
  urlParameters: [Parameters.$host, Parameters.applicationTypeName],
  headerParameters: [Parameters.accept],
  serializer
};
const getServiceInfoListOperationSpec: coreClient.OperationSpec = {
  path: "/Applications/{applicationId}/$/GetServices",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PagedServiceInfoList
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.continuationToken,
    Parameters.serviceTypeName1
  ],
  urlParameters: [Parameters.$host, Parameters.applicationId],
  headerParameters: [Parameters.accept],
  serializer
};
const getServiceInfoOperationSpec: coreClient.OperationSpec = {
  path: "/Applications/{applicationId}/$/GetServices/{serviceId}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ServiceInfo
    },
    204: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [
    Parameters.$host,
    Parameters.applicationId,
    Parameters.serviceId
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const getApplicationNameInfoOperationSpec: coreClient.OperationSpec = {
  path: "/Services/{serviceId}/$/GetApplicationName",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ApplicationNameInfo
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.serviceId],
  headerParameters: [Parameters.accept],
  serializer
};
const createServiceOperationSpec: coreClient.OperationSpec = {
  path: "/Applications/{applicationId}/$/GetServices/$/Create",
  httpMethod: "POST",
  responses: {
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.serviceDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.applicationId],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const createServiceFromTemplateOperationSpec: coreClient.OperationSpec = {
  path: "/Applications/{applicationId}/$/GetServices/$/CreateFromTemplate",
  httpMethod: "POST",
  responses: {
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.serviceFromTemplateDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.applicationId],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const deleteServiceOperationSpec: coreClient.OperationSpec = {
  path: "/Services/{serviceId}/$/Delete",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.forceRemove
  ],
  urlParameters: [Parameters.$host, Parameters.serviceId],
  headerParameters: [Parameters.accept],
  serializer
};
const updateServiceOperationSpec: coreClient.OperationSpec = {
  path: "/Services/{serviceId}/$/Update",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.serviceUpdateDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.serviceId],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getServiceDescriptionOperationSpec: coreClient.OperationSpec = {
  path: "/Services/{serviceId}/$/GetDescription",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ServiceDescription
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.serviceId],
  headerParameters: [Parameters.accept],
  serializer
};
const getServiceHealthOperationSpec: coreClient.OperationSpec = {
  path: "/Services/{serviceId}/$/GetHealth",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ServiceHealth
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.eventsHealthStateFilter,
    Parameters.excludeHealthStatistics,
    Parameters.partitionsHealthStateFilter
  ],
  urlParameters: [Parameters.$host, Parameters.serviceId],
  headerParameters: [Parameters.accept],
  serializer
};
const getServiceHealthUsingPolicyOperationSpec: coreClient.OperationSpec = {
  path: "/Services/{serviceId}/$/GetHealth",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.ServiceHealth
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.applicationHealthPolicy,
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.eventsHealthStateFilter,
    Parameters.excludeHealthStatistics,
    Parameters.partitionsHealthStateFilter
  ],
  urlParameters: [Parameters.$host, Parameters.serviceId],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const reportServiceHealthOperationSpec: coreClient.OperationSpec = {
  path: "/Services/{serviceId}/$/ReportHealth",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.healthInformation,
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.immediate
  ],
  urlParameters: [Parameters.$host, Parameters.serviceId],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const resolveServiceOperationSpec: coreClient.OperationSpec = {
  path: "/Services/{serviceId}/$/ResolvePartition",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ResolvedServicePartition
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.partitionKeyType,
    Parameters.partitionKeyValue,
    Parameters.previousRspVersion
  ],
  urlParameters: [Parameters.$host, Parameters.serviceId],
  headerParameters: [Parameters.accept],
  serializer
};
const getUnplacedReplicaInformationOperationSpec: coreClient.OperationSpec = {
  path: "/Services/{serviceId}/$/GetUnplacedReplicaInformation",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.UnplacedReplicaInformation
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.partitionId,
    Parameters.onlyQueryPrimaries
  ],
  urlParameters: [Parameters.$host, Parameters.serviceId],
  headerParameters: [Parameters.accept],
  serializer
};
const getLoadedPartitionInfoListOperationSpec: coreClient.OperationSpec = {
  path: "/$/GetLoadedPartitionInfoList",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.LoadedPartitionInformationResultList
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.continuationToken,
    Parameters.maxResults,
    Parameters.metricName,
    Parameters.serviceName,
    Parameters.ordering
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const getPartitionInfoListOperationSpec: coreClient.OperationSpec = {
  path: "/Services/{serviceId}/$/GetPartitions",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PagedServicePartitionInfoList
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.continuationToken
  ],
  urlParameters: [Parameters.$host, Parameters.serviceId],
  headerParameters: [Parameters.accept],
  serializer
};
const getPartitionInfoOperationSpec: coreClient.OperationSpec = {
  path: "/Partitions/{partitionId}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ServicePartitionInfo
    },
    204: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.partitionId1],
  headerParameters: [Parameters.accept],
  serializer
};
const getServiceNameInfoOperationSpec: coreClient.OperationSpec = {
  path: "/Partitions/{partitionId}/$/GetServiceName",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ServiceNameInfo
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.partitionId1],
  headerParameters: [Parameters.accept],
  serializer
};
const getPartitionHealthOperationSpec: coreClient.OperationSpec = {
  path: "/Partitions/{partitionId}/$/GetHealth",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PartitionHealth
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.eventsHealthStateFilter,
    Parameters.excludeHealthStatistics,
    Parameters.replicasHealthStateFilter
  ],
  urlParameters: [Parameters.$host, Parameters.partitionId1],
  headerParameters: [Parameters.accept],
  serializer
};
const getPartitionHealthUsingPolicyOperationSpec: coreClient.OperationSpec = {
  path: "/Partitions/{partitionId}/$/GetHealth",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.PartitionHealth
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.applicationHealthPolicy,
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.eventsHealthStateFilter,
    Parameters.excludeHealthStatistics,
    Parameters.replicasHealthStateFilter
  ],
  urlParameters: [Parameters.$host, Parameters.partitionId1],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const reportPartitionHealthOperationSpec: coreClient.OperationSpec = {
  path: "/Partitions/{partitionId}/$/ReportHealth",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.healthInformation,
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.immediate
  ],
  urlParameters: [Parameters.$host, Parameters.partitionId1],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getPartitionLoadInformationOperationSpec: coreClient.OperationSpec = {
  path: "/Partitions/{partitionId}/$/GetLoadInformation",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PartitionLoadInformation
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.partitionId1],
  headerParameters: [Parameters.accept],
  serializer
};
const resetPartitionLoadOperationSpec: coreClient.OperationSpec = {
  path: "/Partitions/{partitionId}/$/ResetLoad",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.partitionId1],
  headerParameters: [Parameters.accept],
  serializer
};
const recoverPartitionOperationSpec: coreClient.OperationSpec = {
  path: "/Partitions/{partitionId}/$/Recover",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.partitionId1],
  headerParameters: [Parameters.accept],
  serializer
};
const recoverServicePartitionsOperationSpec: coreClient.OperationSpec = {
  path: "/Services/$/{serviceId}/$/GetPartitions/$/Recover",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.serviceId],
  headerParameters: [Parameters.accept],
  serializer
};
const recoverSystemPartitionsOperationSpec: coreClient.OperationSpec = {
  path: "/$/RecoverSystemPartitions",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const recoverAllPartitionsOperationSpec: coreClient.OperationSpec = {
  path: "/$/RecoverAllPartitions",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const movePrimaryReplicaOperationSpec: coreClient.OperationSpec = {
  path: "/Partitions/{partitionId}/$/MovePrimaryReplica",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.nodeName1,
    Parameters.ignoreConstraints
  ],
  urlParameters: [Parameters.$host, Parameters.partitionId1],
  headerParameters: [Parameters.accept],
  serializer
};
const moveSecondaryReplicaOperationSpec: coreClient.OperationSpec = {
  path: "/Partitions/{partitionId}/$/MoveSecondaryReplica",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.ignoreConstraints,
    Parameters.currentNodeName,
    Parameters.newNodeName
  ],
  urlParameters: [Parameters.$host, Parameters.partitionId1],
  headerParameters: [Parameters.accept],
  serializer
};
const updatePartitionLoadOperationSpec: coreClient.OperationSpec = {
  path: "/$/UpdatePartitionLoad",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.PagedUpdatePartitionLoadResultList
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.partitionMetricLoadDescriptionList,
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.continuationToken,
    Parameters.maxResults
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const moveInstanceOperationSpec: coreClient.OperationSpec = {
  path: "/Services/{serviceId}/$/GetPartitions/{partitionId}/$/MoveInstance",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.ignoreConstraints,
    Parameters.newNodeName,
    Parameters.currentNodeName1
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.serviceId,
    Parameters.partitionId1
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const moveAuxiliaryReplicaOperationSpec: coreClient.OperationSpec = {
  path:
    "/Services/{serviceId}/$/GetPartitions/{partitionId}/$/MoveAuxiliaryReplica",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.ignoreConstraints,
    Parameters.newNodeName,
    Parameters.currentNodeName1
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.serviceId,
    Parameters.partitionId1
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const createRepairTaskOperationSpec: coreClient.OperationSpec = {
  path: "/$/CreateRepairTask",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.RepairTaskUpdateInfo
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.repairTask,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const cancelRepairTaskOperationSpec: coreClient.OperationSpec = {
  path: "/$/CancelRepairTask",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.RepairTaskUpdateInfo
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.repairTaskCancelDescription,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const deleteRepairTaskOperationSpec: coreClient.OperationSpec = {
  path: "/$/DeleteRepairTask",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.repairTaskDeleteDescription,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getRepairTaskListOperationSpec: coreClient.OperationSpec = {
  path: "/$/GetRepairTaskList",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: {
        type: {
          name: "Sequence",
          element: { type: { name: "Composite", className: "RepairTask" } }
        }
      }
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.taskIdFilter,
    Parameters.stateFilter,
    Parameters.executorFilter
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const forceApproveRepairTaskOperationSpec: coreClient.OperationSpec = {
  path: "/$/ForceApproveRepairTask",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.RepairTaskUpdateInfo
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.repairTaskApproveDescription,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const updateRepairTaskHealthPolicyOperationSpec: coreClient.OperationSpec = {
  path: "/$/UpdateRepairTaskHealthPolicy",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.RepairTaskUpdateInfo
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.repairTaskUpdateHealthPolicyDescription,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const updateRepairExecutionStateOperationSpec: coreClient.OperationSpec = {
  path: "/$/UpdateRepairExecutionState",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.RepairTaskUpdateInfo
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.repairTask,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getReplicaInfoListOperationSpec: coreClient.OperationSpec = {
  path: "/Partitions/{partitionId}/$/GetReplicas",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PagedReplicaInfoList
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.continuationToken
  ],
  urlParameters: [Parameters.$host, Parameters.partitionId1],
  headerParameters: [Parameters.accept],
  serializer
};
const getReplicaInfoOperationSpec: coreClient.OperationSpec = {
  path: "/Partitions/{partitionId}/$/GetReplicas/{replicaId}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ReplicaInfo
    },
    204: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [
    Parameters.$host,
    Parameters.partitionId1,
    Parameters.replicaId
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const getReplicaHealthOperationSpec: coreClient.OperationSpec = {
  path: "/Partitions/{partitionId}/$/GetReplicas/{replicaId}/$/GetHealth",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ReplicaHealth
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.eventsHealthStateFilter
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.partitionId1,
    Parameters.replicaId
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const getReplicaHealthUsingPolicyOperationSpec: coreClient.OperationSpec = {
  path: "/Partitions/{partitionId}/$/GetReplicas/{replicaId}/$/GetHealth",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.ReplicaHealth
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.applicationHealthPolicy,
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.eventsHealthStateFilter
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.partitionId1,
    Parameters.replicaId
  ],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const reportReplicaHealthOperationSpec: coreClient.OperationSpec = {
  path: "/Partitions/{partitionId}/$/GetReplicas/{replicaId}/$/ReportHealth",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.healthInformation,
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.immediate,
    Parameters.serviceKind
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.partitionId1,
    Parameters.replicaId
  ],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getDeployedServiceReplicaInfoListOperationSpec: coreClient.OperationSpec = {
  path: "/Nodes/{nodeName}/$/GetApplications/{applicationId}/$/GetReplicas",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: {
        type: {
          name: "Sequence",
          element: {
            type: { name: "Composite", className: "DeployedServiceReplicaInfo" }
          }
        }
      }
    },
    204: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.serviceManifestName1,
    Parameters.partitionId
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.nodeName,
    Parameters.applicationId
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const getDeployedServiceReplicaDetailInfoOperationSpec: coreClient.OperationSpec = {
  path:
    "/Nodes/{nodeName}/$/GetPartitions/{partitionId}/$/GetReplicas/{replicaId}/$/GetDetail",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.DeployedServiceReplicaDetailInfo
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [
    Parameters.$host,
    Parameters.nodeName,
    Parameters.partitionId1,
    Parameters.replicaId
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const getDeployedServiceReplicaDetailInfoByPartitionIdOperationSpec: coreClient.OperationSpec = {
  path: "/Nodes/{nodeName}/$/GetPartitions/{partitionId}/$/GetReplicas",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.DeployedServiceReplicaDetailInfo
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [
    Parameters.$host,
    Parameters.nodeName,
    Parameters.partitionId1
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const restartReplicaOperationSpec: coreClient.OperationSpec = {
  path:
    "/Nodes/{nodeName}/$/GetPartitions/{partitionId}/$/GetReplicas/{replicaId}/$/Restart",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [
    Parameters.$host,
    Parameters.nodeName,
    Parameters.partitionId1,
    Parameters.replicaId
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const removeReplicaOperationSpec: coreClient.OperationSpec = {
  path:
    "/Nodes/{nodeName}/$/GetPartitions/{partitionId}/$/GetReplicas/{replicaId}/$/Delete",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.forceRemove
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.nodeName,
    Parameters.partitionId1,
    Parameters.replicaId
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const getDeployedServicePackageInfoListOperationSpec: coreClient.OperationSpec = {
  path:
    "/Nodes/{nodeName}/$/GetApplications/{applicationId}/$/GetServicePackages",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: {
        type: {
          name: "Sequence",
          element: {
            type: { name: "Composite", className: "DeployedServicePackageInfo" }
          }
        }
      }
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [
    Parameters.$host,
    Parameters.nodeName,
    Parameters.applicationId
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const getDeployedServicePackageInfoListByNameOperationSpec: coreClient.OperationSpec = {
  path:
    "/Nodes/{nodeName}/$/GetApplications/{applicationId}/$/GetServicePackages/{servicePackageName}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: {
        type: {
          name: "Sequence",
          element: {
            type: { name: "Composite", className: "DeployedServicePackageInfo" }
          }
        }
      }
    },
    204: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [
    Parameters.$host,
    Parameters.nodeName,
    Parameters.applicationId,
    Parameters.servicePackageName
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const getDeployedServicePackageHealthOperationSpec: coreClient.OperationSpec = {
  path:
    "/Nodes/{nodeName}/$/GetApplications/{applicationId}/$/GetServicePackages/{servicePackageName}/$/GetHealth",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.DeployedServicePackageHealth
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.eventsHealthStateFilter
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.nodeName,
    Parameters.applicationId,
    Parameters.servicePackageName
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const getDeployedServicePackageHealthUsingPolicyOperationSpec: coreClient.OperationSpec = {
  path:
    "/Nodes/{nodeName}/$/GetApplications/{applicationId}/$/GetServicePackages/{servicePackageName}/$/GetHealth",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.DeployedServicePackageHealth
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.applicationHealthPolicy,
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.eventsHealthStateFilter
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.nodeName,
    Parameters.applicationId,
    Parameters.servicePackageName
  ],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const reportDeployedServicePackageHealthOperationSpec: coreClient.OperationSpec = {
  path:
    "/Nodes/{nodeName}/$/GetApplications/{applicationId}/$/GetServicePackages/{servicePackageName}/$/ReportHealth",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.healthInformation,
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.immediate
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.nodeName,
    Parameters.applicationId,
    Parameters.servicePackageName
  ],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const deployServicePackageToNodeOperationSpec: coreClient.OperationSpec = {
  path: "/Nodes/{nodeName}/$/DeployServicePackage",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.deployServicePackageToNodeDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.nodeName],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getDeployedCodePackageInfoListOperationSpec: coreClient.OperationSpec = {
  path: "/Nodes/{nodeName}/$/GetApplications/{applicationId}/$/GetCodePackages",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: {
        type: {
          name: "Sequence",
          element: {
            type: { name: "Composite", className: "DeployedCodePackageInfo" }
          }
        }
      }
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.serviceManifestName1,
    Parameters.codePackageName
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.nodeName,
    Parameters.applicationId
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const restartDeployedCodePackageOperationSpec: coreClient.OperationSpec = {
  path:
    "/Nodes/{nodeName}/$/GetApplications/{applicationId}/$/GetCodePackages/$/Restart",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.restartDeployedCodePackageDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [
    Parameters.$host,
    Parameters.nodeName,
    Parameters.applicationId
  ],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getContainerLogsDeployedOnNodeOperationSpec: coreClient.OperationSpec = {
  path:
    "/Nodes/{nodeName}/$/GetApplications/{applicationId}/$/GetCodePackages/$/ContainerLogs",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ContainerLogs
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.serviceManifestName,
    Parameters.codePackageName1,
    Parameters.tail,
    Parameters.previous
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.nodeName,
    Parameters.applicationId
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const invokeContainerApiOperationSpec: coreClient.OperationSpec = {
  path:
    "/Nodes/{nodeName}/$/GetApplications/{applicationId}/$/GetCodePackages/$/ContainerApi",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.ContainerApiResponse
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.containerApiRequestBody,
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.serviceManifestName,
    Parameters.codePackageName1,
    Parameters.codePackageInstanceId
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.nodeName,
    Parameters.applicationId
  ],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const createComposeDeploymentOperationSpec: coreClient.OperationSpec = {
  path: "/ComposeDeployments/$/Create",
  httpMethod: "PUT",
  responses: {
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.createComposeDeploymentDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getComposeDeploymentStatusOperationSpec: coreClient.OperationSpec = {
  path: "/ComposeDeployments/{deploymentName}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ComposeDeploymentStatusInfo
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.deploymentName],
  headerParameters: [Parameters.accept],
  serializer
};
const getComposeDeploymentStatusListOperationSpec: coreClient.OperationSpec = {
  path: "/ComposeDeployments",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PagedComposeDeploymentStatusInfoList
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.continuationToken,
    Parameters.maxResults
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const getComposeDeploymentUpgradeProgressOperationSpec: coreClient.OperationSpec = {
  path: "/ComposeDeployments/{deploymentName}/$/GetUpgradeProgress",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ComposeDeploymentUpgradeProgressInfo
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.deploymentName],
  headerParameters: [Parameters.accept],
  serializer
};
const removeComposeDeploymentOperationSpec: coreClient.OperationSpec = {
  path: "/ComposeDeployments/{deploymentName}/$/Delete",
  httpMethod: "POST",
  responses: {
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.deploymentName],
  headerParameters: [Parameters.accept],
  serializer
};
const startComposeDeploymentUpgradeOperationSpec: coreClient.OperationSpec = {
  path: "/ComposeDeployments/{deploymentName}/$/Upgrade",
  httpMethod: "POST",
  responses: {
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.composeDeploymentUpgradeDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.deploymentName],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const startRollbackComposeDeploymentUpgradeOperationSpec: coreClient.OperationSpec = {
  path: "/ComposeDeployments/{deploymentName}/$/RollbackUpgrade",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.deploymentName],
  headerParameters: [Parameters.accept],
  serializer
};
const getChaosOperationSpec: coreClient.OperationSpec = {
  path: "/Tools/Chaos",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.Chaos
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const startChaosOperationSpec: coreClient.OperationSpec = {
  path: "/Tools/Chaos/$/Start",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.chaosParameters,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const stopChaosOperationSpec: coreClient.OperationSpec = {
  path: "/Tools/Chaos/$/Stop",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const getChaosEventsOperationSpec: coreClient.OperationSpec = {
  path: "/Tools/Chaos/Events",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ChaosEventsSegment
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.continuationToken,
    Parameters.maxResults,
    Parameters.startTimeUtc,
    Parameters.endTimeUtc
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const getChaosScheduleOperationSpec: coreClient.OperationSpec = {
  path: "/Tools/Chaos/Schedule",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ChaosScheduleDescription
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const postChaosScheduleOperationSpec: coreClient.OperationSpec = {
  path: "/Tools/Chaos/Schedule",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.chaosSchedule,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const uploadFileOperationSpec: coreClient.OperationSpec = {
  path: "/ImageStore/{contentPath}",
  httpMethod: "PUT",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.contentPath],
  headerParameters: [Parameters.accept],
  serializer
};
const getImageStoreContentOperationSpec: coreClient.OperationSpec = {
  path: "/ImageStore/{contentPath}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ImageStoreContent
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.contentPath],
  headerParameters: [Parameters.accept],
  serializer
};
const deleteImageStoreContentOperationSpec: coreClient.OperationSpec = {
  path: "/ImageStore/{contentPath}",
  httpMethod: "DELETE",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.contentPath],
  headerParameters: [Parameters.accept],
  serializer
};
const getImageStoreRootContentOperationSpec: coreClient.OperationSpec = {
  path: "/ImageStore",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ImageStoreContent
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const copyImageStoreContentOperationSpec: coreClient.OperationSpec = {
  path: "/ImageStore/$/Copy",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.imageStoreCopyDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const deleteImageStoreUploadSessionOperationSpec: coreClient.OperationSpec = {
  path: "/ImageStore/$/DeleteUploadSession",
  httpMethod: "DELETE",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.sessionId
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const commitImageStoreUploadSessionOperationSpec: coreClient.OperationSpec = {
  path: "/ImageStore/$/CommitUploadSession",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.sessionId
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const getImageStoreUploadSessionByIdOperationSpec: coreClient.OperationSpec = {
  path: "/ImageStore/$/GetUploadSession",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.UploadSession
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.sessionId
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const getImageStoreUploadSessionByPathOperationSpec: coreClient.OperationSpec = {
  path: "/ImageStore/{contentPath}/$/GetUploadSession",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.UploadSession
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.contentPath],
  headerParameters: [Parameters.accept],
  serializer
};
const uploadFileChunkOperationSpec: coreClient.OperationSpec = {
  path: "/ImageStore/{contentPath}/$/UploadChunk",
  httpMethod: "PUT",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.sessionId
  ],
  urlParameters: [Parameters.$host, Parameters.contentPath],
  headerParameters: [Parameters.accept, Parameters.contentRange],
  serializer
};
const getImageStoreRootFolderSizeOperationSpec: coreClient.OperationSpec = {
  path: "/ImageStore/$/FolderSize",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.FolderSizeInfo
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const getImageStoreFolderSizeOperationSpec: coreClient.OperationSpec = {
  path: "/ImageStore/{contentPath}/$/FolderSize",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.FolderSizeInfo
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.contentPath],
  headerParameters: [Parameters.accept],
  serializer
};
const getImageStoreInfoOperationSpec: coreClient.OperationSpec = {
  path: "/ImageStore/$/Info",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ImageStoreInfo
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const invokeInfrastructureCommandOperationSpec: coreClient.OperationSpec = {
  path: "/$/InvokeInfrastructureCommand",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: { type: { name: "String" } }
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.command,
    Parameters.serviceId1
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const invokeInfrastructureQueryOperationSpec: coreClient.OperationSpec = {
  path: "/$/InvokeInfrastructureQuery",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: { type: { name: "String" } }
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.command,
    Parameters.serviceId1
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const startDataLossOperationSpec: coreClient.OperationSpec = {
  path:
    "/Faults/Services/{serviceId}/$/GetPartitions/{partitionId}/$/StartDataLoss",
  httpMethod: "POST",
  responses: {
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.operationId,
    Parameters.dataLossMode
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.serviceId,
    Parameters.partitionId1
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const getDataLossProgressOperationSpec: coreClient.OperationSpec = {
  path:
    "/Faults/Services/{serviceId}/$/GetPartitions/{partitionId}/$/GetDataLossProgress",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PartitionDataLossProgress
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.operationId
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.serviceId,
    Parameters.partitionId1
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const startQuorumLossOperationSpec: coreClient.OperationSpec = {
  path:
    "/Faults/Services/{serviceId}/$/GetPartitions/{partitionId}/$/StartQuorumLoss",
  httpMethod: "POST",
  responses: {
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.operationId,
    Parameters.quorumLossMode,
    Parameters.quorumLossDuration
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.serviceId,
    Parameters.partitionId1
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const getQuorumLossProgressOperationSpec: coreClient.OperationSpec = {
  path:
    "/Faults/Services/{serviceId}/$/GetPartitions/{partitionId}/$/GetQuorumLossProgress",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PartitionQuorumLossProgress
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.operationId
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.serviceId,
    Parameters.partitionId1
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const startPartitionRestartOperationSpec: coreClient.OperationSpec = {
  path:
    "/Faults/Services/{serviceId}/$/GetPartitions/{partitionId}/$/StartRestart",
  httpMethod: "POST",
  responses: {
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.operationId,
    Parameters.restartPartitionMode
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.serviceId,
    Parameters.partitionId1
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const getPartitionRestartProgressOperationSpec: coreClient.OperationSpec = {
  path:
    "/Faults/Services/{serviceId}/$/GetPartitions/{partitionId}/$/GetRestartProgress",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PartitionRestartProgress
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.operationId
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.serviceId,
    Parameters.partitionId1
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const startNodeTransitionOperationSpec: coreClient.OperationSpec = {
  path: "/Faults/Nodes/{nodeName}/$/StartTransition/",
  httpMethod: "POST",
  responses: {
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.operationId,
    Parameters.nodeTransitionType,
    Parameters.nodeInstanceId,
    Parameters.stopDurationInSeconds
  ],
  urlParameters: [Parameters.$host, Parameters.nodeName],
  headerParameters: [Parameters.accept],
  serializer
};
const getNodeTransitionProgressOperationSpec: coreClient.OperationSpec = {
  path: "/Faults/Nodes/{nodeName}/$/GetTransitionProgress",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.NodeTransitionProgress
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.operationId
  ],
  urlParameters: [Parameters.$host, Parameters.nodeName],
  headerParameters: [Parameters.accept],
  serializer
};
const getFaultOperationListOperationSpec: coreClient.OperationSpec = {
  path: "/Faults/",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: {
        type: {
          name: "Sequence",
          element: { type: { name: "Composite", className: "OperationStatus" } }
        }
      }
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.typeFilter,
    Parameters.stateFilter1
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const cancelOperationOperationSpec: coreClient.OperationSpec = {
  path: "/Faults/$/Cancel",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.operationId,
    Parameters.force1
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const createBackupPolicyOperationSpec: coreClient.OperationSpec = {
  path: "/BackupRestore/BackupPolicies/$/Create",
  httpMethod: "POST",
  responses: {
    201: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.backupPolicyDescription,
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.validateConnection
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const deleteBackupPolicyOperationSpec: coreClient.OperationSpec = {
  path: "/BackupRestore/BackupPolicies/{backupPolicyName}/$/Delete",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.backupPolicyName],
  headerParameters: [Parameters.accept],
  serializer
};
const getBackupPolicyListOperationSpec: coreClient.OperationSpec = {
  path: "/BackupRestore/BackupPolicies",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PagedBackupPolicyDescriptionList
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.continuationToken,
    Parameters.maxResults
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const getBackupPolicyByNameOperationSpec: coreClient.OperationSpec = {
  path: "/BackupRestore/BackupPolicies/{backupPolicyName}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.BackupPolicyDescription
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.backupPolicyName],
  headerParameters: [Parameters.accept],
  serializer
};
const getAllEntitiesBackedUpByPolicyOperationSpec: coreClient.OperationSpec = {
  path:
    "/BackupRestore/BackupPolicies/{backupPolicyName}/$/GetBackupEnabledEntities",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PagedBackupEntityList
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.continuationToken,
    Parameters.maxResults
  ],
  urlParameters: [Parameters.$host, Parameters.backupPolicyName],
  headerParameters: [Parameters.accept],
  serializer
};
const updateBackupPolicyOperationSpec: coreClient.OperationSpec = {
  path: "/BackupRestore/BackupPolicies/{backupPolicyName}/$/Update",
  httpMethod: "POST",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.backupPolicyDescription,
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.validateConnection
  ],
  urlParameters: [Parameters.$host, Parameters.backupPolicyName],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const enableApplicationBackupOperationSpec: coreClient.OperationSpec = {
  path: "/Applications/{applicationId}/$/EnableBackup",
  httpMethod: "POST",
  responses: {
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.enableBackupDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.applicationId],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const disableApplicationBackupOperationSpec: coreClient.OperationSpec = {
  path: "/Applications/{applicationId}/$/DisableBackup",
  httpMethod: "POST",
  responses: {
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.disableBackupDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.applicationId],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getApplicationBackupConfigurationInfoOperationSpec: coreClient.OperationSpec = {
  path: "/Applications/{applicationId}/$/GetBackupConfigurationInfo",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PagedBackupConfigurationInfoList
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.continuationToken,
    Parameters.maxResults
  ],
  urlParameters: [Parameters.$host, Parameters.applicationId],
  headerParameters: [Parameters.accept],
  serializer
};
const getApplicationBackupListOperationSpec: coreClient.OperationSpec = {
  path: "/Applications/{applicationId}/$/GetBackups",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PagedBackupInfoList
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.continuationToken,
    Parameters.maxResults,
    Parameters.latest,
    Parameters.startDateTimeFilter,
    Parameters.endDateTimeFilter
  ],
  urlParameters: [Parameters.$host, Parameters.applicationId],
  headerParameters: [Parameters.accept],
  serializer
};
const suspendApplicationBackupOperationSpec: coreClient.OperationSpec = {
  path: "/Applications/{applicationId}/$/SuspendBackup",
  httpMethod: "POST",
  responses: {
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.applicationId],
  headerParameters: [Parameters.accept],
  serializer
};
const resumeApplicationBackupOperationSpec: coreClient.OperationSpec = {
  path: "/Applications/{applicationId}/$/ResumeBackup",
  httpMethod: "POST",
  responses: {
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.applicationId],
  headerParameters: [Parameters.accept],
  serializer
};
const enableServiceBackupOperationSpec: coreClient.OperationSpec = {
  path: "/Services/{serviceId}/$/EnableBackup",
  httpMethod: "POST",
  responses: {
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.enableBackupDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.serviceId],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const disableServiceBackupOperationSpec: coreClient.OperationSpec = {
  path: "/Services/{serviceId}/$/DisableBackup",
  httpMethod: "POST",
  responses: {
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.disableBackupDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.serviceId],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getServiceBackupConfigurationInfoOperationSpec: coreClient.OperationSpec = {
  path: "/Services/{serviceId}/$/GetBackupConfigurationInfo",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PagedBackupConfigurationInfoList
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.continuationToken,
    Parameters.maxResults
  ],
  urlParameters: [Parameters.$host, Parameters.serviceId],
  headerParameters: [Parameters.accept],
  serializer
};
const getServiceBackupListOperationSpec: coreClient.OperationSpec = {
  path: "/Services/{serviceId}/$/GetBackups",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PagedBackupInfoList
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.continuationToken,
    Parameters.maxResults,
    Parameters.latest,
    Parameters.startDateTimeFilter,
    Parameters.endDateTimeFilter
  ],
  urlParameters: [Parameters.$host, Parameters.serviceId],
  headerParameters: [Parameters.accept],
  serializer
};
const suspendServiceBackupOperationSpec: coreClient.OperationSpec = {
  path: "/Services/{serviceId}/$/SuspendBackup",
  httpMethod: "POST",
  responses: {
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.serviceId],
  headerParameters: [Parameters.accept],
  serializer
};
const resumeServiceBackupOperationSpec: coreClient.OperationSpec = {
  path: "/Services/{serviceId}/$/ResumeBackup",
  httpMethod: "POST",
  responses: {
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.serviceId],
  headerParameters: [Parameters.accept],
  serializer
};
const enablePartitionBackupOperationSpec: coreClient.OperationSpec = {
  path: "/Partitions/{partitionId}/$/EnableBackup",
  httpMethod: "POST",
  responses: {
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.enableBackupDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.partitionId1],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const disablePartitionBackupOperationSpec: coreClient.OperationSpec = {
  path: "/Partitions/{partitionId}/$/DisableBackup",
  httpMethod: "POST",
  responses: {
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.disableBackupDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.partitionId1],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getPartitionBackupConfigurationInfoOperationSpec: coreClient.OperationSpec = {
  path: "/Partitions/{partitionId}/$/GetBackupConfigurationInfo",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PartitionBackupConfigurationInfo
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.partitionId1],
  headerParameters: [Parameters.accept],
  serializer
};
const getPartitionBackupListOperationSpec: coreClient.OperationSpec = {
  path: "/Partitions/{partitionId}/$/GetBackups",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PagedBackupInfoList
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.latest,
    Parameters.startDateTimeFilter,
    Parameters.endDateTimeFilter
  ],
  urlParameters: [Parameters.$host, Parameters.partitionId1],
  headerParameters: [Parameters.accept],
  serializer
};
const suspendPartitionBackupOperationSpec: coreClient.OperationSpec = {
  path: "/Partitions/{partitionId}/$/SuspendBackup",
  httpMethod: "POST",
  responses: {
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.partitionId1],
  headerParameters: [Parameters.accept],
  serializer
};
const resumePartitionBackupOperationSpec: coreClient.OperationSpec = {
  path: "/Partitions/{partitionId}/$/ResumeBackup",
  httpMethod: "POST",
  responses: {
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.partitionId1],
  headerParameters: [Parameters.accept],
  serializer
};
const backupPartitionOperationSpec: coreClient.OperationSpec = {
  path: "/Partitions/{partitionId}/$/Backup",
  httpMethod: "POST",
  responses: {
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.backupPartitionDescription,
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.backupTimeout
  ],
  urlParameters: [Parameters.$host, Parameters.partitionId1],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getPartitionBackupProgressOperationSpec: coreClient.OperationSpec = {
  path: "/Partitions/{partitionId}/$/GetBackupProgress",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.BackupProgressInfo
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.partitionId1],
  headerParameters: [Parameters.accept],
  serializer
};
const restorePartitionOperationSpec: coreClient.OperationSpec = {
  path: "/Partitions/{partitionId}/$/Restore",
  httpMethod: "POST",
  responses: {
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.restorePartitionDescription,
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.restoreTimeout
  ],
  urlParameters: [Parameters.$host, Parameters.partitionId1],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getPartitionRestoreProgressOperationSpec: coreClient.OperationSpec = {
  path: "/Partitions/{partitionId}/$/GetRestoreProgress",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.RestoreProgressInfo
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.partitionId1],
  headerParameters: [Parameters.accept],
  serializer
};
const getBackupsFromBackupLocationOperationSpec: coreClient.OperationSpec = {
  path: "/BackupRestore/$/GetBackups",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.PagedBackupInfoList
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.getBackupByStorageQueryDescription,
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.continuationToken,
    Parameters.maxResults
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const createNameOperationSpec: coreClient.OperationSpec = {
  path: "/Names/$/Create",
  httpMethod: "POST",
  responses: {
    201: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.nameDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getNameExistsInfoOperationSpec: coreClient.OperationSpec = {
  path: "/Names/{nameId}",
  httpMethod: "GET",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.nameId],
  headerParameters: [Parameters.accept],
  serializer
};
const deleteNameOperationSpec: coreClient.OperationSpec = {
  path: "/Names/{nameId}",
  httpMethod: "DELETE",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.nameId],
  headerParameters: [Parameters.accept],
  serializer
};
const getSubNameInfoListOperationSpec: coreClient.OperationSpec = {
  path: "/Names/{nameId}/$/GetSubNames",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PagedSubNameInfoList
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.continuationToken,
    Parameters.recursive
  ],
  urlParameters: [Parameters.$host, Parameters.nameId],
  headerParameters: [Parameters.accept],
  serializer
};
const getPropertyInfoListOperationSpec: coreClient.OperationSpec = {
  path: "/Names/{nameId}/$/GetProperties",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PagedPropertyInfoList
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.continuationToken,
    Parameters.includeValues
  ],
  urlParameters: [Parameters.$host, Parameters.nameId],
  headerParameters: [Parameters.accept],
  serializer
};
const putPropertyOperationSpec: coreClient.OperationSpec = {
  path: "/Names/{nameId}/$/GetProperty",
  httpMethod: "PUT",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.propertyDescription,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.nameId],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getPropertyInfoOperationSpec: coreClient.OperationSpec = {
  path: "/Names/{nameId}/$/GetProperty",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PropertyInfo
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.propertyName
  ],
  urlParameters: [Parameters.$host, Parameters.nameId],
  headerParameters: [Parameters.accept],
  serializer
};
const deletePropertyOperationSpec: coreClient.OperationSpec = {
  path: "/Names/{nameId}/$/GetProperty",
  httpMethod: "DELETE",
  responses: {
    200: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.propertyName
  ],
  urlParameters: [Parameters.$host, Parameters.nameId],
  headerParameters: [Parameters.accept],
  serializer
};
const submitPropertyBatchOperationSpec: coreClient.OperationSpec = {
  path: "/Names/{nameId}/$/GetProperties/$/SubmitBatch",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.SuccessfulPropertyBatchInfo
    },
    409: {
      bodyMapper: Mappers.FailedPropertyBatchInfo
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.propertyBatchDescriptionList,
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.nameId],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getClusterEventListOperationSpec: coreClient.OperationSpec = {
  path: "/EventsStore/Cluster/Events",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: {
        type: {
          name: "Sequence",
          element: { type: { name: "Composite", className: "ClusterEvent" } }
        }
      }
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.startTimeUtc1,
    Parameters.endTimeUtc1,
    Parameters.eventsTypesFilter,
    Parameters.excludeAnalysisEvents,
    Parameters.skipCorrelationLookup
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const getContainersEventListOperationSpec: coreClient.OperationSpec = {
  path: "/EventsStore/Containers/Events",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: {
        type: {
          name: "Sequence",
          element: {
            type: { name: "Composite", className: "ContainerInstanceEvent" }
          }
        }
      }
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.startTimeUtc1,
    Parameters.endTimeUtc1,
    Parameters.eventsTypesFilter,
    Parameters.excludeAnalysisEvents,
    Parameters.skipCorrelationLookup
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const getNodeEventListOperationSpec: coreClient.OperationSpec = {
  path: "/EventsStore/Nodes/{nodeName}/$/Events",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: {
        type: {
          name: "Sequence",
          element: { type: { name: "Composite", className: "NodeEvent" } }
        }
      }
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.startTimeUtc1,
    Parameters.endTimeUtc1,
    Parameters.eventsTypesFilter,
    Parameters.excludeAnalysisEvents,
    Parameters.skipCorrelationLookup
  ],
  urlParameters: [Parameters.$host, Parameters.nodeName],
  headerParameters: [Parameters.accept],
  serializer
};
const getNodesEventListOperationSpec: coreClient.OperationSpec = {
  path: "/EventsStore/Nodes/Events",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: {
        type: {
          name: "Sequence",
          element: { type: { name: "Composite", className: "NodeEvent" } }
        }
      }
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.startTimeUtc1,
    Parameters.endTimeUtc1,
    Parameters.eventsTypesFilter,
    Parameters.excludeAnalysisEvents,
    Parameters.skipCorrelationLookup
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const getApplicationEventListOperationSpec: coreClient.OperationSpec = {
  path: "/EventsStore/Applications/{applicationId}/$/Events",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: {
        type: {
          name: "Sequence",
          element: {
            type: { name: "Composite", className: "ApplicationEvent" }
          }
        }
      }
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.startTimeUtc1,
    Parameters.endTimeUtc1,
    Parameters.eventsTypesFilter,
    Parameters.excludeAnalysisEvents,
    Parameters.skipCorrelationLookup
  ],
  urlParameters: [Parameters.$host, Parameters.applicationId],
  headerParameters: [Parameters.accept],
  serializer
};
const getApplicationsEventListOperationSpec: coreClient.OperationSpec = {
  path: "/EventsStore/Applications/Events",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: {
        type: {
          name: "Sequence",
          element: {
            type: { name: "Composite", className: "ApplicationEvent" }
          }
        }
      }
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.startTimeUtc1,
    Parameters.endTimeUtc1,
    Parameters.eventsTypesFilter,
    Parameters.excludeAnalysisEvents,
    Parameters.skipCorrelationLookup
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const getServiceEventListOperationSpec: coreClient.OperationSpec = {
  path: "/EventsStore/Services/{serviceId}/$/Events",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: {
        type: {
          name: "Sequence",
          element: { type: { name: "Composite", className: "ServiceEvent" } }
        }
      }
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.startTimeUtc1,
    Parameters.endTimeUtc1,
    Parameters.eventsTypesFilter,
    Parameters.excludeAnalysisEvents,
    Parameters.skipCorrelationLookup
  ],
  urlParameters: [Parameters.$host, Parameters.serviceId],
  headerParameters: [Parameters.accept],
  serializer
};
const getServicesEventListOperationSpec: coreClient.OperationSpec = {
  path: "/EventsStore/Services/Events",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: {
        type: {
          name: "Sequence",
          element: { type: { name: "Composite", className: "ServiceEvent" } }
        }
      }
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.startTimeUtc1,
    Parameters.endTimeUtc1,
    Parameters.eventsTypesFilter,
    Parameters.excludeAnalysisEvents,
    Parameters.skipCorrelationLookup
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const getPartitionEventListOperationSpec: coreClient.OperationSpec = {
  path: "/EventsStore/Partitions/{partitionId}/$/Events",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: {
        type: {
          name: "Sequence",
          element: { type: { name: "Composite", className: "PartitionEvent" } }
        }
      }
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.startTimeUtc1,
    Parameters.endTimeUtc1,
    Parameters.eventsTypesFilter,
    Parameters.excludeAnalysisEvents,
    Parameters.skipCorrelationLookup
  ],
  urlParameters: [Parameters.$host, Parameters.partitionId1],
  headerParameters: [Parameters.accept],
  serializer
};
const getPartitionsEventListOperationSpec: coreClient.OperationSpec = {
  path: "/EventsStore/Partitions/Events",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: {
        type: {
          name: "Sequence",
          element: { type: { name: "Composite", className: "PartitionEvent" } }
        }
      }
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.startTimeUtc1,
    Parameters.endTimeUtc1,
    Parameters.eventsTypesFilter,
    Parameters.excludeAnalysisEvents,
    Parameters.skipCorrelationLookup
  ],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const getPartitionReplicaEventListOperationSpec: coreClient.OperationSpec = {
  path: "/EventsStore/Partitions/{partitionId}/$/Replicas/{replicaId}/$/Events",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: {
        type: {
          name: "Sequence",
          element: { type: { name: "Composite", className: "ReplicaEvent" } }
        }
      }
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.startTimeUtc1,
    Parameters.endTimeUtc1,
    Parameters.eventsTypesFilter,
    Parameters.excludeAnalysisEvents,
    Parameters.skipCorrelationLookup
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.partitionId1,
    Parameters.replicaId
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const getPartitionReplicasEventListOperationSpec: coreClient.OperationSpec = {
  path: "/EventsStore/Partitions/{partitionId}/$/Replicas/Events",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: {
        type: {
          name: "Sequence",
          element: { type: { name: "Composite", className: "ReplicaEvent" } }
        }
      }
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.timeout,
    Parameters.startTimeUtc1,
    Parameters.endTimeUtc1,
    Parameters.eventsTypesFilter,
    Parameters.excludeAnalysisEvents,
    Parameters.skipCorrelationLookup
  ],
  urlParameters: [Parameters.$host, Parameters.partitionId1],
  headerParameters: [Parameters.accept],
  serializer
};
const getCorrelatedEventListOperationSpec: coreClient.OperationSpec = {
  path: "/EventsStore/CorrelatedEvents/{eventInstanceId}/$/Events",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: {
        type: {
          name: "Sequence",
          element: { type: { name: "Composite", className: "FabricEvent" } }
        }
      }
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.timeout],
  urlParameters: [Parameters.$host, Parameters.eventInstanceId],
  headerParameters: [Parameters.accept],
  serializer
};
