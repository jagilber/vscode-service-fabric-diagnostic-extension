import { MeshApplication } from "../operationsInterfaces";
import * as coreClient from "@azure/core-client";
import * as Mappers from "../models/mappers";
import * as Parameters from "../models/parameters";
import { ServiceFabricClientAPIs } from "../serviceFabricClientAPIs";
import {
  ApplicationResourceDescription,
  MeshApplicationCreateOrUpdateOptionalParams,
  MeshApplicationCreateOrUpdateResponse,
  MeshApplicationGetOptionalParams,
  MeshApplicationGetResponse,
  MeshApplicationDeleteOptionalParams,
  MeshApplicationListOptionalParams,
  MeshApplicationListResponse,
  MeshApplicationGetUpgradeProgressOptionalParams,
  MeshApplicationGetUpgradeProgressResponse
} from "../models";

/** Class containing MeshApplication operations. */
export class MeshApplicationImpl implements MeshApplication {
  private readonly client: ServiceFabricClientAPIs;

  /**
   * Initialize a new instance of the class MeshApplication class.
   * @param client Reference to the service client
   */
  constructor(client: ServiceFabricClientAPIs) {
    this.client = client;
  }

  /**
   * Creates a Application resource with the specified name, description and properties. If Application
   * resource with the same name exists, then it is updated with the specified description and
   * properties.
   * @param applicationResourceName The identity of the application.
   * @param applicationResourceDescription Description for creating a Application resource.
   * @param options The options parameters.
   */
  createOrUpdate(
    applicationResourceName: string,
    applicationResourceDescription: ApplicationResourceDescription,
    options?: MeshApplicationCreateOrUpdateOptionalParams
  ): Promise<MeshApplicationCreateOrUpdateResponse> {
    return this.client.sendOperationRequest(
      { applicationResourceName, applicationResourceDescription, options },
      createOrUpdateOperationSpec
    );
  }

  /**
   * Gets the information about the Application resource with the given name. The information include the
   * description and other properties of the Application.
   * @param applicationResourceName The identity of the application.
   * @param options The options parameters.
   */
  get(
    applicationResourceName: string,
    options?: MeshApplicationGetOptionalParams
  ): Promise<MeshApplicationGetResponse> {
    return this.client.sendOperationRequest(
      { applicationResourceName, options },
      getOperationSpec
    );
  }

  /**
   * Deletes the Application resource identified by the name.
   * @param applicationResourceName The identity of the application.
   * @param options The options parameters.
   */
  delete(
    applicationResourceName: string,
    options?: MeshApplicationDeleteOptionalParams
  ): Promise<void> {
    return this.client.sendOperationRequest(
      { applicationResourceName, options },
      deleteOperationSpec
    );
  }

  /**
   * Gets the information about all application resources in a given resource group. The information
   * include the description and other properties of the Application.
   * @param options The options parameters.
   */
  list(
    options?: MeshApplicationListOptionalParams
  ): Promise<MeshApplicationListResponse> {
    return this.client.sendOperationRequest({ options }, listOperationSpec);
  }

  /**
   * Gets the upgrade progress information about the Application resource with the given name. The
   * information include percentage of completion and other upgrade state information of the Application
   * resource.
   * @param applicationResourceName The identity of the application.
   * @param options The options parameters.
   */
  getUpgradeProgress(
    applicationResourceName: string,
    options?: MeshApplicationGetUpgradeProgressOptionalParams
  ): Promise<MeshApplicationGetUpgradeProgressResponse> {
    return this.client.sendOperationRequest(
      { applicationResourceName, options },
      getUpgradeProgressOperationSpec
    );
  }
}
// Operation Specifications
const serializer = coreClient.createSerializer(Mappers, /* isXml */ false);

const createOrUpdateOperationSpec: coreClient.OperationSpec = {
  path: "/Resources/Applications/{applicationResourceName}",
  httpMethod: "PUT",
  responses: {
    200: {
      bodyMapper: Mappers.ApplicationResourceDescription
    },
    201: {
      bodyMapper: Mappers.ApplicationResourceDescription
    },
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.applicationResourceDescription,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.$host, Parameters.applicationResourceName],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getOperationSpec: coreClient.OperationSpec = {
  path: "/Resources/Applications/{applicationResourceName}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ApplicationResourceDescription
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.$host, Parameters.applicationResourceName],
  headerParameters: [Parameters.accept],
  serializer
};
const deleteOperationSpec: coreClient.OperationSpec = {
  path: "/Resources/Applications/{applicationResourceName}",
  httpMethod: "DELETE",
  responses: {
    200: {},
    202: {},
    204: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.$host, Parameters.applicationResourceName],
  headerParameters: [Parameters.accept],
  serializer
};
const listOperationSpec: coreClient.OperationSpec = {
  path: "/Resources/Applications",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PagedApplicationResourceDescriptionList
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.accept],
  serializer
};
const getUpgradeProgressOperationSpec: coreClient.OperationSpec = {
  path:
    "/Resources/Applications/{applicationResourceName}/$/GetUpgradeProgress",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ApplicationResourceUpgradeProgressInfo
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.$host, Parameters.applicationResourceName],
  headerParameters: [Parameters.accept],
  serializer
};
