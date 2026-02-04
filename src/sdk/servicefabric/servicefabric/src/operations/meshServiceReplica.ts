import { MeshServiceReplica } from "../operationsInterfaces";
import * as coreClient from "@azure/core-client";
import * as Mappers from "../models/mappers";
import * as Parameters from "../models/parameters";
import { ServiceFabricClientAPIs } from "../serviceFabricClientAPIs";
import {
  MeshServiceReplicaGetOptionalParams,
  MeshServiceReplicaGetResponse,
  MeshServiceReplicaListOptionalParams,
  MeshServiceReplicaListResponse
} from "../models";

/** Class containing MeshServiceReplica operations. */
export class MeshServiceReplicaImpl implements MeshServiceReplica {
  private readonly client: ServiceFabricClientAPIs;

  /**
   * Initialize a new instance of the class MeshServiceReplica class.
   * @param client Reference to the service client
   */
  constructor(client: ServiceFabricClientAPIs) {
    this.client = client;
  }

  /**
   * Gets the information about the service replica with the given name. The information include the
   * description and other properties of the service replica.
   * @param applicationResourceName The identity of the application.
   * @param serviceResourceName The identity of the service.
   * @param replicaName Service Fabric replica name.
   * @param options The options parameters.
   */
  get(
    applicationResourceName: string,
    serviceResourceName: string,
    replicaName: string,
    options?: MeshServiceReplicaGetOptionalParams
  ): Promise<MeshServiceReplicaGetResponse> {
    return this.client.sendOperationRequest(
      { applicationResourceName, serviceResourceName, replicaName, options },
      getOperationSpec
    );
  }

  /**
   * Gets the information about all replicas of a service. The information include the description and
   * other properties of the service replica.
   * @param applicationResourceName The identity of the application.
   * @param serviceResourceName The identity of the service.
   * @param options The options parameters.
   */
  list(
    applicationResourceName: string,
    serviceResourceName: string,
    options?: MeshServiceReplicaListOptionalParams
  ): Promise<MeshServiceReplicaListResponse> {
    return this.client.sendOperationRequest(
      { applicationResourceName, serviceResourceName, options },
      listOperationSpec
    );
  }
}
// Operation Specifications
const serializer = coreClient.createSerializer(Mappers, /* isXml */ false);

const getOperationSpec: coreClient.OperationSpec = {
  path:
    "/Resources/Applications/{applicationResourceName}/Services/{serviceResourceName}/Replicas/{replicaName}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ServiceReplicaDescription
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.applicationResourceName,
    Parameters.serviceResourceName,
    Parameters.replicaName
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const listOperationSpec: coreClient.OperationSpec = {
  path:
    "/Resources/Applications/{applicationResourceName}/Services/{serviceResourceName}/Replicas",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PagedServiceReplicaDescriptionList
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
