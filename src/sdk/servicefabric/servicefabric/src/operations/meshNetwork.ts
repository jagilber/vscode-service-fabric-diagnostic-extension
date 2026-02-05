import { MeshNetwork } from "../operationsInterfaces";
import * as coreClient from "@azure/core-client";
import * as Mappers from "../models/mappers";
import * as Parameters from "../models/parameters";
import { ServiceFabricClientAPIs } from "../serviceFabricClientAPIs";
import {
  NetworkResourceDescription,
  MeshNetworkCreateOrUpdateOptionalParams,
  MeshNetworkCreateOrUpdateResponse,
  MeshNetworkGetOptionalParams,
  MeshNetworkGetResponse,
  MeshNetworkDeleteOptionalParams,
  MeshNetworkListOptionalParams,
  MeshNetworkListResponse
} from "../models";

/** Class containing MeshNetwork operations. */
export class MeshNetworkImpl implements MeshNetwork {
  private readonly client: ServiceFabricClientAPIs;

  /**
   * Initialize a new instance of the class MeshNetwork class.
   * @param client Reference to the service client
   */
  constructor(client: ServiceFabricClientAPIs) {
    this.client = client;
  }

  /**
   * Creates a Network resource with the specified name, description and properties. If Network resource
   * with the same name exists, then it is updated with the specified description and properties. Network
   * resource provides connectivity between application services.
   * @param networkResourceName The identity of the network.
   * @param networkResourceDescription Description for creating a Network resource.
   * @param options The options parameters.
   */
  createOrUpdate(
    networkResourceName: string,
    networkResourceDescription: NetworkResourceDescription,
    options?: MeshNetworkCreateOrUpdateOptionalParams
  ): Promise<MeshNetworkCreateOrUpdateResponse> {
    return this.client.sendOperationRequest(
      { networkResourceName, networkResourceDescription, options },
      createOrUpdateOperationSpec
    );
  }

  /**
   * Gets the information about the Network resource with the given name. The information include the
   * description and other properties of the Network.
   * @param networkResourceName The identity of the network.
   * @param options The options parameters.
   */
  get(
    networkResourceName: string,
    options?: MeshNetworkGetOptionalParams
  ): Promise<MeshNetworkGetResponse> {
    return this.client.sendOperationRequest(
      { networkResourceName, options },
      getOperationSpec
    );
  }

  /**
   * Deletes the Network resource identified by the name.
   * @param networkResourceName The identity of the network.
   * @param options The options parameters.
   */
  delete(
    networkResourceName: string,
    options?: MeshNetworkDeleteOptionalParams
  ): Promise<void> {
    return this.client.sendOperationRequest(
      { networkResourceName, options },
      deleteOperationSpec
    );
  }

  /**
   * Gets the information about all network resources in a given resource group. The information include
   * the description and other properties of the Network.
   * @param options The options parameters.
   */
  list(
    options?: MeshNetworkListOptionalParams
  ): Promise<MeshNetworkListResponse> {
    return this.client.sendOperationRequest({ options }, listOperationSpec);
  }
}
// Operation Specifications
const serializer = coreClient.createSerializer(Mappers, /* isXml */ false);

const createOrUpdateOperationSpec: coreClient.OperationSpec = {
  path: "/Resources/Networks/{networkResourceName}",
  httpMethod: "PUT",
  responses: {
    200: {
      bodyMapper: Mappers.NetworkResourceDescription
    },
    201: {
      bodyMapper: Mappers.NetworkResourceDescription
    },
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.networkResourceDescription,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.$host, Parameters.networkResourceName],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getOperationSpec: coreClient.OperationSpec = {
  path: "/Resources/Networks/{networkResourceName}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.NetworkResourceDescription
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.$host, Parameters.networkResourceName],
  headerParameters: [Parameters.accept],
  serializer
};
const deleteOperationSpec: coreClient.OperationSpec = {
  path: "/Resources/Networks/{networkResourceName}",
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
  urlParameters: [Parameters.$host, Parameters.networkResourceName],
  headerParameters: [Parameters.accept],
  serializer
};
const listOperationSpec: coreClient.OperationSpec = {
  path: "/Resources/Networks",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PagedNetworkResourceDescriptionList
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
