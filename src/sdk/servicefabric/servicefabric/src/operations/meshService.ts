import { MeshService } from "../operationsInterfaces";
import * as coreClient from "@azure/core-client";
import * as Mappers from "../models/mappers";
import * as Parameters from "../models/parameters";
import { ServiceFabricClientAPIs } from "../serviceFabricClientAPIs";
import {
  MeshServiceGetOptionalParams,
  MeshServiceGetResponse,
  MeshServiceListOptionalParams,
  MeshServiceListResponse
} from "../models";

/** Class containing MeshService operations. */
export class MeshServiceImpl implements MeshService {
  private readonly client: ServiceFabricClientAPIs;

  /**
   * Initialize a new instance of the class MeshService class.
   * @param client Reference to the service client
   */
  constructor(client: ServiceFabricClientAPIs) {
    this.client = client;
  }

  /**
   * Gets the information about the Service resource with the given name. The information include the
   * description and other properties of the Service.
   * @param applicationResourceName The identity of the application.
   * @param serviceResourceName The identity of the service.
   * @param options The options parameters.
   */
  get(
    applicationResourceName: string,
    serviceResourceName: string,
    options?: MeshServiceGetOptionalParams
  ): Promise<MeshServiceGetResponse> {
    return this.client.sendOperationRequest(
      { applicationResourceName, serviceResourceName, options },
      getOperationSpec
    );
  }

  /**
   * Gets the information about all services of an application resource. The information include the
   * description and other properties of the Service.
   * @param applicationResourceName The identity of the application.
   * @param options The options parameters.
   */
  list(
    applicationResourceName: string,
    options?: MeshServiceListOptionalParams
  ): Promise<MeshServiceListResponse> {
    return this.client.sendOperationRequest(
      { applicationResourceName, options },
      listOperationSpec
    );
  }
}
// Operation Specifications
const serializer = coreClient.createSerializer(Mappers, /* isXml */ false);

const getOperationSpec: coreClient.OperationSpec = {
  path:
    "/Resources/Applications/{applicationResourceName}/Services/{serviceResourceName}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ServiceResourceDescription
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.applicationResourceName,
    Parameters.serviceResourceName
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const listOperationSpec: coreClient.OperationSpec = {
  path: "/Resources/Applications/{applicationResourceName}/Services",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PagedServiceResourceDescriptionList
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
