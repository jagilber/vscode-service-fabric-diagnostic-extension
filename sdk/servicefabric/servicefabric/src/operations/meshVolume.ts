import { MeshVolume } from "../operationsInterfaces";
import * as coreClient from "@azure/core-client";
import * as Mappers from "../models/mappers";
import * as Parameters from "../models/parameters";
import { ServiceFabricClientAPIs } from "../serviceFabricClientAPIs";
import {
  VolumeResourceDescription,
  MeshVolumeCreateOrUpdateOptionalParams,
  MeshVolumeCreateOrUpdateResponse,
  MeshVolumeGetOptionalParams,
  MeshVolumeGetResponse,
  MeshVolumeDeleteOptionalParams,
  MeshVolumeListOptionalParams,
  MeshVolumeListResponse
} from "../models";

/** Class containing MeshVolume operations. */
export class MeshVolumeImpl implements MeshVolume {
  private readonly client: ServiceFabricClientAPIs;

  /**
   * Initialize a new instance of the class MeshVolume class.
   * @param client Reference to the service client
   */
  constructor(client: ServiceFabricClientAPIs) {
    this.client = client;
  }

  /**
   * Creates a Volume resource with the specified name, description and properties. If Volume resource
   * with the same name exists, then it is updated with the specified description and properties.
   * @param volumeResourceName The identity of the volume.
   * @param volumeResourceDescription Description for creating a Volume resource.
   * @param options The options parameters.
   */
  createOrUpdate(
    volumeResourceName: string,
    volumeResourceDescription: VolumeResourceDescription,
    options?: MeshVolumeCreateOrUpdateOptionalParams
  ): Promise<MeshVolumeCreateOrUpdateResponse> {
    return this.client.sendOperationRequest(
      { volumeResourceName, volumeResourceDescription, options },
      createOrUpdateOperationSpec
    );
  }

  /**
   * Gets the information about the Volume resource with the given name. The information include the
   * description and other properties of the Volume.
   * @param volumeResourceName The identity of the volume.
   * @param options The options parameters.
   */
  get(
    volumeResourceName: string,
    options?: MeshVolumeGetOptionalParams
  ): Promise<MeshVolumeGetResponse> {
    return this.client.sendOperationRequest(
      { volumeResourceName, options },
      getOperationSpec
    );
  }

  /**
   * Deletes the Volume resource identified by the name.
   * @param volumeResourceName The identity of the volume.
   * @param options The options parameters.
   */
  delete(
    volumeResourceName: string,
    options?: MeshVolumeDeleteOptionalParams
  ): Promise<void> {
    return this.client.sendOperationRequest(
      { volumeResourceName, options },
      deleteOperationSpec
    );
  }

  /**
   * Gets the information about all volume resources in a given resource group. The information include
   * the description and other properties of the Volume.
   * @param options The options parameters.
   */
  list(
    options?: MeshVolumeListOptionalParams
  ): Promise<MeshVolumeListResponse> {
    return this.client.sendOperationRequest({ options }, listOperationSpec);
  }
}
// Operation Specifications
const serializer = coreClient.createSerializer(Mappers, /* isXml */ false);

const createOrUpdateOperationSpec: coreClient.OperationSpec = {
  path: "/Resources/Volumes/{volumeResourceName}",
  httpMethod: "PUT",
  responses: {
    200: {
      bodyMapper: Mappers.VolumeResourceDescription
    },
    201: {
      bodyMapper: Mappers.VolumeResourceDescription
    },
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.volumeResourceDescription,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.$host, Parameters.volumeResourceName],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getOperationSpec: coreClient.OperationSpec = {
  path: "/Resources/Volumes/{volumeResourceName}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.VolumeResourceDescription
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.$host, Parameters.volumeResourceName],
  headerParameters: [Parameters.accept],
  serializer
};
const deleteOperationSpec: coreClient.OperationSpec = {
  path: "/Resources/Volumes/{volumeResourceName}",
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
  urlParameters: [Parameters.$host, Parameters.volumeResourceName],
  headerParameters: [Parameters.accept],
  serializer
};
const listOperationSpec: coreClient.OperationSpec = {
  path: "/Resources/Volumes",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PagedVolumeResourceDescriptionList
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
