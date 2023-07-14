import { MeshCodePackage } from "../operationsInterfaces";
import * as coreClient from "@azure/core-client";
import * as Mappers from "../models/mappers";
import * as Parameters from "../models/parameters";
import { ServiceFabricClientAPIs } from "../serviceFabricClientAPIs";
import {
  MeshCodePackageGetContainerLogsOptionalParams,
  MeshCodePackageGetContainerLogsResponse
} from "../models";

/** Class containing MeshCodePackage operations. */
export class MeshCodePackageImpl implements MeshCodePackage {
  private readonly client: ServiceFabricClientAPIs;

  /**
   * Initialize a new instance of the class MeshCodePackage class.
   * @param client Reference to the service client
   */
  constructor(client: ServiceFabricClientAPIs) {
    this.client = client;
  }

  /**
   * Gets the logs for the container of the specified code package of the service replica.
   * @param applicationResourceName The identity of the application.
   * @param serviceResourceName The identity of the service.
   * @param replicaName Service Fabric replica name.
   * @param codePackageName The name of code package of the service.
   * @param options The options parameters.
   */
  getContainerLogs(
    applicationResourceName: string,
    serviceResourceName: string,
    replicaName: string,
    codePackageName: string,
    options?: MeshCodePackageGetContainerLogsOptionalParams
  ): Promise<MeshCodePackageGetContainerLogsResponse> {
    return this.client.sendOperationRequest(
      {
        applicationResourceName,
        serviceResourceName,
        replicaName,
        codePackageName,
        options
      },
      getContainerLogsOperationSpec
    );
  }
}
// Operation Specifications
const serializer = coreClient.createSerializer(Mappers, /* isXml */ false);

const getContainerLogsOperationSpec: coreClient.OperationSpec = {
  path:
    "/Resources/Applications/{applicationResourceName}/Services/{serviceResourceName}/Replicas/{replicaName}/CodePackages/{codePackageName}/Logs",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ContainerLogs
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion, Parameters.tail],
  urlParameters: [
    Parameters.$host,
    Parameters.applicationResourceName,
    Parameters.serviceResourceName,
    Parameters.replicaName,
    Parameters.codePackageName2
  ],
  headerParameters: [Parameters.accept],
  serializer
};
