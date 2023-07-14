import { ApplicationTypeVersions } from "../operationsInterfaces";
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
  ApplicationTypeVersionsGetOptionalParams,
  ApplicationTypeVersionsGetResponse,
  ApplicationTypeVersionResource,
  ApplicationTypeVersionsCreateOrUpdateOptionalParams,
  ApplicationTypeVersionsCreateOrUpdateResponse,
  ApplicationTypeVersionsDeleteOptionalParams,
  ApplicationTypeVersionsListOptionalParams,
  ApplicationTypeVersionsListResponse
} from "../models";

/** Class containing ApplicationTypeVersions operations. */
export class ApplicationTypeVersionsImpl implements ApplicationTypeVersions {
  private readonly client: ServiceFabricManagementClient;

  /**
   * Initialize a new instance of the class ApplicationTypeVersions class.
   * @param client Reference to the service client
   */
  constructor(client: ServiceFabricManagementClient) {
    this.client = client;
  }

  /**
   * Get a Service Fabric application type version resource created or in the process of being created in
   * the Service Fabric application type name resource.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationTypeName The name of the application type name resource.
   * @param version The application type version.
   * @param options The options parameters.
   */
  get(
    resourceGroupName: string,
    clusterName: string,
    applicationTypeName: string,
    version: string,
    options?: ApplicationTypeVersionsGetOptionalParams
  ): Promise<ApplicationTypeVersionsGetResponse> {
    return this.client.sendOperationRequest(
      { resourceGroupName, clusterName, applicationTypeName, version, options },
      getOperationSpec
    );
  }

  /**
   * Create or update a Service Fabric application type version resource with the specified name.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationTypeName The name of the application type name resource.
   * @param version The application type version.
   * @param parameters The application type version resource.
   * @param options The options parameters.
   */
  async beginCreateOrUpdate(
    resourceGroupName: string,
    clusterName: string,
    applicationTypeName: string,
    version: string,
    parameters: ApplicationTypeVersionResource,
    options?: ApplicationTypeVersionsCreateOrUpdateOptionalParams
  ): Promise<
    SimplePollerLike<
      OperationState<ApplicationTypeVersionsCreateOrUpdateResponse>,
      ApplicationTypeVersionsCreateOrUpdateResponse
    >
  > {
    const directSendOperation = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec
    ): Promise<ApplicationTypeVersionsCreateOrUpdateResponse> => {
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
      args: {
        resourceGroupName,
        clusterName,
        applicationTypeName,
        version,
        parameters,
        options
      },
      spec: createOrUpdateOperationSpec
    });
    const poller = await createHttpPoller<
      ApplicationTypeVersionsCreateOrUpdateResponse,
      OperationState<ApplicationTypeVersionsCreateOrUpdateResponse>
    >(lro, {
      restoreFrom: options?.resumeFrom,
      intervalInMs: options?.updateIntervalInMs
    });
    await poller.poll();
    return poller;
  }

  /**
   * Create or update a Service Fabric application type version resource with the specified name.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationTypeName The name of the application type name resource.
   * @param version The application type version.
   * @param parameters The application type version resource.
   * @param options The options parameters.
   */
  async beginCreateOrUpdateAndWait(
    resourceGroupName: string,
    clusterName: string,
    applicationTypeName: string,
    version: string,
    parameters: ApplicationTypeVersionResource,
    options?: ApplicationTypeVersionsCreateOrUpdateOptionalParams
  ): Promise<ApplicationTypeVersionsCreateOrUpdateResponse> {
    const poller = await this.beginCreateOrUpdate(
      resourceGroupName,
      clusterName,
      applicationTypeName,
      version,
      parameters,
      options
    );
    return poller.pollUntilDone();
  }

  /**
   * Delete a Service Fabric application type version resource with the specified name.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationTypeName The name of the application type name resource.
   * @param version The application type version.
   * @param options The options parameters.
   */
  async beginDelete(
    resourceGroupName: string,
    clusterName: string,
    applicationTypeName: string,
    version: string,
    options?: ApplicationTypeVersionsDeleteOptionalParams
  ): Promise<SimplePollerLike<OperationState<void>, void>> {
    const directSendOperation = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec
    ): Promise<void> => {
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
      args: {
        resourceGroupName,
        clusterName,
        applicationTypeName,
        version,
        options
      },
      spec: deleteOperationSpec
    });
    const poller = await createHttpPoller<void, OperationState<void>>(lro, {
      restoreFrom: options?.resumeFrom,
      intervalInMs: options?.updateIntervalInMs
    });
    await poller.poll();
    return poller;
  }

  /**
   * Delete a Service Fabric application type version resource with the specified name.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationTypeName The name of the application type name resource.
   * @param version The application type version.
   * @param options The options parameters.
   */
  async beginDeleteAndWait(
    resourceGroupName: string,
    clusterName: string,
    applicationTypeName: string,
    version: string,
    options?: ApplicationTypeVersionsDeleteOptionalParams
  ): Promise<void> {
    const poller = await this.beginDelete(
      resourceGroupName,
      clusterName,
      applicationTypeName,
      version,
      options
    );
    return poller.pollUntilDone();
  }

  /**
   * Gets all application type version resources created or in the process of being created in the
   * Service Fabric application type name resource.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationTypeName The name of the application type name resource.
   * @param options The options parameters.
   */
  list(
    resourceGroupName: string,
    clusterName: string,
    applicationTypeName: string,
    options?: ApplicationTypeVersionsListOptionalParams
  ): Promise<ApplicationTypeVersionsListResponse> {
    return this.client.sendOperationRequest(
      { resourceGroupName, clusterName, applicationTypeName, options },
      listOperationSpec
    );
  }
}
// Operation Specifications
const serializer = coreClient.createSerializer(Mappers, /* isXml */ false);

const getOperationSpec: coreClient.OperationSpec = {
  path:
    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ServiceFabric/clusters/{clusterName}/applicationTypes/{applicationTypeName}/versions/{version}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ApplicationTypeVersionResource
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
    Parameters.subscriptionId,
    Parameters.applicationTypeName,
    Parameters.version
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const createOrUpdateOperationSpec: coreClient.OperationSpec = {
  path:
    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ServiceFabric/clusters/{clusterName}/applicationTypes/{applicationTypeName}/versions/{version}",
  httpMethod: "PUT",
  responses: {
    200: {
      bodyMapper: Mappers.ApplicationTypeVersionResource
    },
    201: {
      bodyMapper: Mappers.ApplicationTypeVersionResource
    },
    202: {
      bodyMapper: Mappers.ApplicationTypeVersionResource
    },
    204: {
      bodyMapper: Mappers.ApplicationTypeVersionResource
    },
    default: {
      bodyMapper: Mappers.ErrorModel
    }
  },
  requestBody: Parameters.parameters3,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.resourceGroupName,
    Parameters.clusterName,
    Parameters.subscriptionId,
    Parameters.applicationTypeName,
    Parameters.version
  ],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const deleteOperationSpec: coreClient.OperationSpec = {
  path:
    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ServiceFabric/clusters/{clusterName}/applicationTypes/{applicationTypeName}/versions/{version}",
  httpMethod: "DELETE",
  responses: {
    200: {},
    201: {},
    202: {},
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
    Parameters.subscriptionId,
    Parameters.applicationTypeName,
    Parameters.version
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const listOperationSpec: coreClient.OperationSpec = {
  path:
    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ServiceFabric/clusters/{clusterName}/applicationTypes/{applicationTypeName}/versions",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ApplicationTypeVersionResourceList
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
    Parameters.subscriptionId,
    Parameters.applicationTypeName
  ],
  headerParameters: [Parameters.accept],
  serializer
};
