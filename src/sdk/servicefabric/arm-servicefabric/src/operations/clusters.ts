import { Clusters } from "../operationsInterfaces";
import * as coreClient from "@azure/core-client";
import * as Mappers from "../models/mappers";
import * as Parameters from "../models/parameters";
import { ServiceFabricManagementClient } from "../serviceFabricManagementClient";
import {
  SimplePollerLike,
  OperationState,
  createHttpPoller
} from "@azure/core-lro";
import { createLroSpec } from "../lroImpl";
import {
  ClustersGetOptionalParams,
  ClustersGetResponse,
  Cluster,
  ClustersCreateOrUpdateOptionalParams,
  ClustersCreateOrUpdateResponse,
  ClusterUpdateParameters,
  ClustersUpdateOptionalParams,
  ClustersUpdateResponse,
  ClustersDeleteOptionalParams,
  ClustersListByResourceGroupOptionalParams,
  ClustersListByResourceGroupResponse,
  ClustersListOptionalParams,
  ClustersListResponse,
  ClustersListUpgradableVersionsOptionalParams,
  ClustersListUpgradableVersionsResponse
} from "../models";

/** Class containing Clusters operations. */
export class ClustersImpl implements Clusters {
  private readonly client: ServiceFabricManagementClient;

  /**
   * Initialize a new instance of the class Clusters class.
   * @param client Reference to the service client
   */
  constructor(client: ServiceFabricManagementClient) {
    this.client = client;
  }

  /**
   * Get a Service Fabric cluster resource created or in the process of being created in the specified
   * resource group.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param options The options parameters.
   */
  get(
    resourceGroupName: string,
    clusterName: string,
    options?: ClustersGetOptionalParams
  ): Promise<ClustersGetResponse> {
    return this.client.sendOperationRequest(
      { resourceGroupName, clusterName, options },
      getOperationSpec
    );
  }

  /**
   * Create or update a Service Fabric cluster resource with the specified name.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param parameters The cluster resource.
   * @param options The options parameters.
   */
  async beginCreateOrUpdate(
    resourceGroupName: string,
    clusterName: string,
    parameters: Cluster,
    options?: ClustersCreateOrUpdateOptionalParams
  ): Promise<
    SimplePollerLike<
      OperationState<ClustersCreateOrUpdateResponse>,
      ClustersCreateOrUpdateResponse
    >
  > {
    const directSendOperation = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec
    ): Promise<ClustersCreateOrUpdateResponse> => {
      return this.client.sendOperationRequest(args, spec);
    };
    const sendOperationFn = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec
    ) => {
      let currentRawResponse:
        | coreClient.FullOperationResponse
        | undefined = undefined;
      const providedCallback = args.options?.onResponse;
      const callback: coreClient.RawResponseCallback = (
        rawResponse: coreClient.FullOperationResponse,
        flatResponse: unknown
      ) => {
        currentRawResponse = rawResponse;
        providedCallback?.(rawResponse, flatResponse);
      };
      const updatedArgs = {
        ...args,
        options: {
          ...args.options,
          onResponse: callback
        }
      };
      const flatResponse = await directSendOperation(updatedArgs, spec);
      return {
        flatResponse,
        rawResponse: {
          statusCode: currentRawResponse!.status,
          body: currentRawResponse!.parsedBody,
          headers: currentRawResponse!.headers.toJSON()
        }
      };
    };

    const lro = createLroSpec({
      sendOperationFn,
      args: { resourceGroupName, clusterName, parameters, options },
      spec: createOrUpdateOperationSpec
    });
    const poller = await createHttpPoller<
      ClustersCreateOrUpdateResponse,
      OperationState<ClustersCreateOrUpdateResponse>
    >(lro, {
      restoreFrom: options?.resumeFrom,
      intervalInMs: options?.updateIntervalInMs
    });
    await poller.poll();
    return poller;
  }

  /**
   * Create or update a Service Fabric cluster resource with the specified name.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param parameters The cluster resource.
   * @param options The options parameters.
   */
  async beginCreateOrUpdateAndWait(
    resourceGroupName: string,
    clusterName: string,
    parameters: Cluster,
    options?: ClustersCreateOrUpdateOptionalParams
  ): Promise<ClustersCreateOrUpdateResponse> {
    const poller = await this.beginCreateOrUpdate(
      resourceGroupName,
      clusterName,
      parameters,
      options
    );
    return poller.pollUntilDone();
  }

  /**
   * Update the configuration of a Service Fabric cluster resource with the specified name.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param parameters The parameters which contains the property value and property name which used to
   *                   update the cluster configuration.
   * @param options The options parameters.
   */
  async beginUpdate(
    resourceGroupName: string,
    clusterName: string,
    parameters: ClusterUpdateParameters,
    options?: ClustersUpdateOptionalParams
  ): Promise<
    SimplePollerLike<
      OperationState<ClustersUpdateResponse>,
      ClustersUpdateResponse
    >
  > {
    const directSendOperation = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec
    ): Promise<ClustersUpdateResponse> => {
      return this.client.sendOperationRequest(args, spec);
    };
    const sendOperationFn = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec
    ) => {
      let currentRawResponse:
        | coreClient.FullOperationResponse
        | undefined = undefined;
      const providedCallback = args.options?.onResponse;
      const callback: coreClient.RawResponseCallback = (
        rawResponse: coreClient.FullOperationResponse,
        flatResponse: unknown
      ) => {
        currentRawResponse = rawResponse;
        providedCallback?.(rawResponse, flatResponse);
      };
      const updatedArgs = {
        ...args,
        options: {
          ...args.options,
          onResponse: callback
        }
      };
      const flatResponse = await directSendOperation(updatedArgs, spec);
      return {
        flatResponse,
        rawResponse: {
          statusCode: currentRawResponse!.status,
          body: currentRawResponse!.parsedBody,
          headers: currentRawResponse!.headers.toJSON()
        }
      };
    };

    const lro = createLroSpec({
      sendOperationFn,
      args: { resourceGroupName, clusterName, parameters, options },
      spec: updateOperationSpec
    });
    const poller = await createHttpPoller<
      ClustersUpdateResponse,
      OperationState<ClustersUpdateResponse>
    >(lro, {
      restoreFrom: options?.resumeFrom,
      intervalInMs: options?.updateIntervalInMs
    });
    await poller.poll();
    return poller;
  }

  /**
   * Update the configuration of a Service Fabric cluster resource with the specified name.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param parameters The parameters which contains the property value and property name which used to
   *                   update the cluster configuration.
   * @param options The options parameters.
   */
  async beginUpdateAndWait(
    resourceGroupName: string,
    clusterName: string,
    parameters: ClusterUpdateParameters,
    options?: ClustersUpdateOptionalParams
  ): Promise<ClustersUpdateResponse> {
    const poller = await this.beginUpdate(
      resourceGroupName,
      clusterName,
      parameters,
      options
    );
    return poller.pollUntilDone();
  }

  /**
   * Delete a Service Fabric cluster resource with the specified name.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param options The options parameters.
   */
  delete(
    resourceGroupName: string,
    clusterName: string,
    options?: ClustersDeleteOptionalParams
  ): Promise<void> {
    return this.client.sendOperationRequest(
      { resourceGroupName, clusterName, options },
      deleteOperationSpec
    );
  }

  /**
   * Gets all Service Fabric cluster resources created or in the process of being created in the resource
   * group.
   * @param resourceGroupName The name of the resource group.
   * @param options The options parameters.
   */
  listByResourceGroup(
    resourceGroupName: string,
    options?: ClustersListByResourceGroupOptionalParams
  ): Promise<ClustersListByResourceGroupResponse> {
    return this.client.sendOperationRequest(
      { resourceGroupName, options },
      listByResourceGroupOperationSpec
    );
  }

  /**
   * Gets all Service Fabric cluster resources created or in the process of being created in the
   * subscription.
   * @param options The options parameters.
   */
  list(options?: ClustersListOptionalParams): Promise<ClustersListResponse> {
    return this.client.sendOperationRequest({ options }, listOperationSpec);
  }

  /**
   * If a target is not provided, it will get the minimum and maximum versions available from the current
   * cluster version. If a target is given, it will provide the required path to get from the current
   * cluster version to the target version.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param options The options parameters.
   */
  listUpgradableVersions(
    resourceGroupName: string,
    clusterName: string,
    options?: ClustersListUpgradableVersionsOptionalParams
  ): Promise<ClustersListUpgradableVersionsResponse> {
    return this.client.sendOperationRequest(
      { resourceGroupName, clusterName, options },
      listUpgradableVersionsOperationSpec
    );
  }
}
// Operation Specifications
const serializer = coreClient.createSerializer(Mappers, /* isXml */ false);

const getOperationSpec: coreClient.OperationSpec = {
  path:
    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ServiceFabric/clusters/{clusterName}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.Cluster
    },
    default: {
      bodyMapper: Mappers.ErrorModel
    }
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.resourceGroupName,
    Parameters.clusterName,
    Parameters.subscriptionId
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const createOrUpdateOperationSpec: coreClient.OperationSpec = {
  path:
    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ServiceFabric/clusters/{clusterName}",
  httpMethod: "PUT",
  responses: {
    200: {
      bodyMapper: Mappers.Cluster
    },
    201: {
      bodyMapper: Mappers.Cluster
    },
    202: {
      bodyMapper: Mappers.Cluster
    },
    204: {
      bodyMapper: Mappers.Cluster
    },
    default: {
      bodyMapper: Mappers.ErrorModel
    }
  },
  requestBody: Parameters.parameters,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.resourceGroupName,
    Parameters.clusterName,
    Parameters.subscriptionId
  ],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const updateOperationSpec: coreClient.OperationSpec = {
  path:
    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ServiceFabric/clusters/{clusterName}",
  httpMethod: "PATCH",
  responses: {
    200: {
      bodyMapper: Mappers.Cluster
    },
    201: {
      bodyMapper: Mappers.Cluster
    },
    202: {
      bodyMapper: Mappers.Cluster
    },
    204: {
      bodyMapper: Mappers.Cluster
    },
    default: {
      bodyMapper: Mappers.ErrorModel
    }
  },
  requestBody: Parameters.parameters1,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.resourceGroupName,
    Parameters.clusterName,
    Parameters.subscriptionId
  ],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const deleteOperationSpec: coreClient.OperationSpec = {
  path:
    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ServiceFabric/clusters/{clusterName}",
  httpMethod: "DELETE",
  responses: {
    200: {},
    204: {},
    default: {
      bodyMapper: Mappers.ErrorModel
    }
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.resourceGroupName,
    Parameters.clusterName,
    Parameters.subscriptionId
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const listByResourceGroupOperationSpec: coreClient.OperationSpec = {
  path:
    "/subscriptions/{subscriptionId}/resourcegroups/{resourceGroupName}/providers/Microsoft.ServiceFabric/clusters",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ClusterListResult
    },
    default: {
      bodyMapper: Mappers.ErrorModel
    }
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.resourceGroupName,
    Parameters.subscriptionId
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const listOperationSpec: coreClient.OperationSpec = {
  path:
    "/subscriptions/{subscriptionId}/providers/Microsoft.ServiceFabric/clusters",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ClusterListResult
    },
    default: {
      bodyMapper: Mappers.ErrorModel
    }
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.$host, Parameters.subscriptionId],
  headerParameters: [Parameters.accept],
  serializer
};
const listUpgradableVersionsOperationSpec: coreClient.OperationSpec = {
  path:
    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ServiceFabric/clusters/{clusterName}/listUpgradableVersions",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.UpgradableVersionPathResult
    },
    default: {
      bodyMapper: Mappers.ErrorModel
    }
  },
  requestBody: Parameters.versionsDescription,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.resourceGroupName,
    Parameters.clusterName,
    Parameters.subscriptionId
  ],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
