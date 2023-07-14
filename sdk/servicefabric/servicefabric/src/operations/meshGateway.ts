import { MeshGateway } from "../operationsInterfaces";
import * as coreClient from "@azure/core-client";
import * as Mappers from "../models/mappers";
import * as Parameters from "../models/parameters";
import { ServiceFabricClientAPIs } from "../serviceFabricClientAPIs";
import {
  GatewayResourceDescription,
  MeshGatewayCreateOrUpdateOptionalParams,
  MeshGatewayCreateOrUpdateResponse,
  MeshGatewayGetOptionalParams,
  MeshGatewayGetResponse,
  MeshGatewayDeleteOptionalParams,
  MeshGatewayListOptionalParams,
  MeshGatewayListResponse
} from "../models";

/** Class containing MeshGateway operations. */
export class MeshGatewayImpl implements MeshGateway {
  private readonly client: ServiceFabricClientAPIs;

  /**
   * Initialize a new instance of the class MeshGateway class.
   * @param client Reference to the service client
   */
  constructor(client: ServiceFabricClientAPIs) {
    this.client = client;
  }

  /**
   * Creates a Gateway resource with the specified name, description and properties. If Gateway resource
   * with the same name exists, then it is updated with the specified description and properties. Use
   * Gateway resource to provide public connectivity to application services.
   * @param gatewayResourceName The identity of the gateway.
   * @param gatewayResourceDescription Description for creating a Gateway resource.
   * @param options The options parameters.
   */
  createOrUpdate(
    gatewayResourceName: string,
    gatewayResourceDescription: GatewayResourceDescription,
    options?: MeshGatewayCreateOrUpdateOptionalParams
  ): Promise<MeshGatewayCreateOrUpdateResponse> {
    return this.client.sendOperationRequest(
      { gatewayResourceName, gatewayResourceDescription, options },
      createOrUpdateOperationSpec
    );
  }

  /**
   * Gets the information about the Gateway resource with the given name. The information include the
   * description and other properties of the Gateway.
   * @param gatewayResourceName The identity of the gateway.
   * @param options The options parameters.
   */
  get(
    gatewayResourceName: string,
    options?: MeshGatewayGetOptionalParams
  ): Promise<MeshGatewayGetResponse> {
    return this.client.sendOperationRequest(
      { gatewayResourceName, options },
      getOperationSpec
    );
  }

  /**
   * Deletes the Gateway resource identified by the name.
   * @param gatewayResourceName The identity of the gateway.
   * @param options The options parameters.
   */
  delete(
    gatewayResourceName: string,
    options?: MeshGatewayDeleteOptionalParams
  ): Promise<void> {
    return this.client.sendOperationRequest(
      { gatewayResourceName, options },
      deleteOperationSpec
    );
  }

  /**
   * Gets the information about all gateway resources in a given resource group. The information include
   * the description and other properties of the Gateway.
   * @param options The options parameters.
   */
  list(
    options?: MeshGatewayListOptionalParams
  ): Promise<MeshGatewayListResponse> {
    return this.client.sendOperationRequest({ options }, listOperationSpec);
  }
}
// Operation Specifications
const serializer = coreClient.createSerializer(Mappers, /* isXml */ false);

const createOrUpdateOperationSpec: coreClient.OperationSpec = {
  path: "/Resources/Gateways/{gatewayResourceName}",
  httpMethod: "PUT",
  responses: {
    200: {
      bodyMapper: Mappers.GatewayResourceDescription
    },
    201: {
      bodyMapper: Mappers.GatewayResourceDescription
    },
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.gatewayResourceDescription,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.$host, Parameters.gatewayResourceName],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getOperationSpec: coreClient.OperationSpec = {
  path: "/Resources/Gateways/{gatewayResourceName}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.GatewayResourceDescription
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.$host, Parameters.gatewayResourceName],
  headerParameters: [Parameters.accept],
  serializer
};
const deleteOperationSpec: coreClient.OperationSpec = {
  path: "/Resources/Gateways/{gatewayResourceName}",
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
  urlParameters: [Parameters.$host, Parameters.gatewayResourceName],
  headerParameters: [Parameters.accept],
  serializer
};
const listOperationSpec: coreClient.OperationSpec = {
  path: "/Resources/Gateways",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PagedGatewayResourceDescriptionList
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
