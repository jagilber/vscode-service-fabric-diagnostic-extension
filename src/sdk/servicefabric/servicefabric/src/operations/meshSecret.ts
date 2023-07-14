import { MeshSecret } from "../operationsInterfaces";
import * as coreClient from "@azure/core-client";
import * as Mappers from "../models/mappers";
import * as Parameters from "../models/parameters";
import { ServiceFabricClientAPIs } from "../serviceFabricClientAPIs";
import {
  SecretResourceDescription,
  MeshSecretCreateOrUpdateOptionalParams,
  MeshSecretCreateOrUpdateResponse,
  MeshSecretGetOptionalParams,
  MeshSecretGetResponse,
  MeshSecretDeleteOptionalParams,
  MeshSecretListOptionalParams,
  MeshSecretListResponse
} from "../models";

/** Class containing MeshSecret operations. */
export class MeshSecretImpl implements MeshSecret {
  private readonly client: ServiceFabricClientAPIs;

  /**
   * Initialize a new instance of the class MeshSecret class.
   * @param client Reference to the service client
   */
  constructor(client: ServiceFabricClientAPIs) {
    this.client = client;
  }

  /**
   * Creates a Secret resource with the specified name, description and properties. If Secret resource
   * with the same name exists, then it is updated with the specified description and properties. Once
   * created, the kind and contentType of a secret resource cannot be updated.
   * @param secretResourceName The name of the secret resource.
   * @param secretResourceDescription Description for creating a secret resource.
   * @param options The options parameters.
   */
  createOrUpdate(
    secretResourceName: string,
    secretResourceDescription: SecretResourceDescription,
    options?: MeshSecretCreateOrUpdateOptionalParams
  ): Promise<MeshSecretCreateOrUpdateResponse> {
    return this.client.sendOperationRequest(
      { secretResourceName, secretResourceDescription, options },
      createOrUpdateOperationSpec
    );
  }

  /**
   * Gets the information about the Secret resource with the given name. The information include the
   * description and other properties of the Secret.
   * @param secretResourceName The name of the secret resource.
   * @param options The options parameters.
   */
  get(
    secretResourceName: string,
    options?: MeshSecretGetOptionalParams
  ): Promise<MeshSecretGetResponse> {
    return this.client.sendOperationRequest(
      { secretResourceName, options },
      getOperationSpec
    );
  }

  /**
   * Deletes the specified Secret resource and all of its named values.
   * @param secretResourceName The name of the secret resource.
   * @param options The options parameters.
   */
  delete(
    secretResourceName: string,
    options?: MeshSecretDeleteOptionalParams
  ): Promise<void> {
    return this.client.sendOperationRequest(
      { secretResourceName, options },
      deleteOperationSpec
    );
  }

  /**
   * Gets the information about all secret resources in a given resource group. The information include
   * the description and other properties of the Secret.
   * @param options The options parameters.
   */
  list(
    options?: MeshSecretListOptionalParams
  ): Promise<MeshSecretListResponse> {
    return this.client.sendOperationRequest({ options }, listOperationSpec);
  }
}
// Operation Specifications
const serializer = coreClient.createSerializer(Mappers, /* isXml */ false);

const createOrUpdateOperationSpec: coreClient.OperationSpec = {
  path: "/Resources/Secrets/{secretResourceName}",
  httpMethod: "PUT",
  responses: {
    200: {
      bodyMapper: Mappers.SecretResourceDescription
    },
    201: {
      bodyMapper: Mappers.SecretResourceDescription
    },
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.secretResourceDescription,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.$host, Parameters.secretResourceName],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getOperationSpec: coreClient.OperationSpec = {
  path: "/Resources/Secrets/{secretResourceName}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.SecretResourceDescription
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.$host, Parameters.secretResourceName],
  headerParameters: [Parameters.accept],
  serializer
};
const deleteOperationSpec: coreClient.OperationSpec = {
  path: "/Resources/Secrets/{secretResourceName}",
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
  urlParameters: [Parameters.$host, Parameters.secretResourceName],
  headerParameters: [Parameters.accept],
  serializer
};
const listOperationSpec: coreClient.OperationSpec = {
  path: "/Resources/Secrets",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PagedSecretResourceDescriptionList
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
