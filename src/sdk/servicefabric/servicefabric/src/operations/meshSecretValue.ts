import { MeshSecretValue } from "../operationsInterfaces";
import * as coreClient from "@azure/core-client";
import * as Mappers from "../models/mappers";
import * as Parameters from "../models/parameters";
import { ServiceFabricClientAPIs } from "../serviceFabricClientAPIs";
import {
  SecretValueResourceDescription,
  MeshSecretValueAddValueOptionalParams,
  MeshSecretValueAddValueResponse,
  MeshSecretValueGetOptionalParams,
  MeshSecretValueGetResponse,
  MeshSecretValueDeleteOptionalParams,
  MeshSecretValueListOptionalParams,
  MeshSecretValueListResponse,
  MeshSecretValueShowOptionalParams,
  MeshSecretValueShowResponse
} from "../models";

/** Class containing MeshSecretValue operations. */
export class MeshSecretValueImpl implements MeshSecretValue {
  private readonly client: ServiceFabricClientAPIs;

  /**
   * Initialize a new instance of the class MeshSecretValue class.
   * @param client Reference to the service client
   */
  constructor(client: ServiceFabricClientAPIs) {
    this.client = client;
  }

  /**
   * Creates a new value of the specified secret resource. The name of the value is typically the version
   * identifier. Once created the value cannot be changed.
   * @param secretResourceName The name of the secret resource.
   * @param secretValueResourceName The name of the secret resource value which is typically the version
   *                                identifier for the value.
   * @param secretValueResourceDescription Description for creating a value of a secret resource.
   * @param options The options parameters.
   */
  addValue(
    secretResourceName: string,
    secretValueResourceName: string,
    secretValueResourceDescription: SecretValueResourceDescription,
    options?: MeshSecretValueAddValueOptionalParams
  ): Promise<MeshSecretValueAddValueResponse> {
    return this.client.sendOperationRequest(
      {
        secretResourceName,
        secretValueResourceName,
        secretValueResourceDescription,
        options
      },
      addValueOperationSpec
    );
  }

  /**
   * Get the information about the specified named secret value resources. The information does not
   * include the actual value of the secret.
   * @param secretResourceName The name of the secret resource.
   * @param secretValueResourceName The name of the secret resource value which is typically the version
   *                                identifier for the value.
   * @param options The options parameters.
   */
  get(
    secretResourceName: string,
    secretValueResourceName: string,
    options?: MeshSecretValueGetOptionalParams
  ): Promise<MeshSecretValueGetResponse> {
    return this.client.sendOperationRequest(
      { secretResourceName, secretValueResourceName, options },
      getOperationSpec
    );
  }

  /**
   * Deletes the secret value resource identified by the name. The name of the resource is typically the
   * version associated with that value. Deletion will fail if the specified value is in use.
   * @param secretResourceName The name of the secret resource.
   * @param secretValueResourceName The name of the secret resource value which is typically the version
   *                                identifier for the value.
   * @param options The options parameters.
   */
  delete(
    secretResourceName: string,
    secretValueResourceName: string,
    options?: MeshSecretValueDeleteOptionalParams
  ): Promise<void> {
    return this.client.sendOperationRequest(
      { secretResourceName, secretValueResourceName, options },
      deleteOperationSpec
    );
  }

  /**
   * Gets information about all secret value resources of the specified secret resource. The information
   * includes the names of the secret value resources, but not the actual values.
   * @param secretResourceName The name of the secret resource.
   * @param options The options parameters.
   */
  list(
    secretResourceName: string,
    options?: MeshSecretValueListOptionalParams
  ): Promise<MeshSecretValueListResponse> {
    return this.client.sendOperationRequest(
      { secretResourceName, options },
      listOperationSpec
    );
  }

  /**
   * Lists the decrypted value of the specified named value of the secret resource. This is a privileged
   * operation.
   * @param secretResourceName The name of the secret resource.
   * @param secretValueResourceName The name of the secret resource value which is typically the version
   *                                identifier for the value.
   * @param options The options parameters.
   */
  show(
    secretResourceName: string,
    secretValueResourceName: string,
    options?: MeshSecretValueShowOptionalParams
  ): Promise<MeshSecretValueShowResponse> {
    return this.client.sendOperationRequest(
      { secretResourceName, secretValueResourceName, options },
      showOperationSpec
    );
  }
}
// Operation Specifications
const serializer = coreClient.createSerializer(Mappers, /* isXml */ false);

const addValueOperationSpec: coreClient.OperationSpec = {
  path:
    "/Resources/Secrets/{secretResourceName}/values/{secretValueResourceName}",
  httpMethod: "PUT",
  responses: {
    200: {
      bodyMapper: Mappers.SecretValueResourceDescription
    },
    201: {
      bodyMapper: Mappers.SecretValueResourceDescription
    },
    202: {},
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  requestBody: Parameters.secretValueResourceDescription,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.secretResourceName,
    Parameters.secretValueResourceName
  ],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const getOperationSpec: coreClient.OperationSpec = {
  path:
    "/Resources/Secrets/{secretResourceName}/values/{secretValueResourceName}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.SecretValueResourceDescription
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.secretResourceName,
    Parameters.secretValueResourceName
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const deleteOperationSpec: coreClient.OperationSpec = {
  path:
    "/Resources/Secrets/{secretResourceName}/values/{secretValueResourceName}",
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
  urlParameters: [
    Parameters.$host,
    Parameters.secretResourceName,
    Parameters.secretValueResourceName
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const listOperationSpec: coreClient.OperationSpec = {
  path: "/Resources/Secrets/{secretResourceName}/values",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.PagedSecretValueResourceDescriptionList
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
const showOperationSpec: coreClient.OperationSpec = {
  path:
    "/Resources/Secrets/{secretResourceName}/values/{secretValueResourceName}/list_value",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.SecretValue
    },
    default: {
      bodyMapper: Mappers.FabricError
    }
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.secretResourceName,
    Parameters.secretValueResourceName
  ],
  headerParameters: [Parameters.accept],
  serializer
};
