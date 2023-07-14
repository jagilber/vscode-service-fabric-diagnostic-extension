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

/** Interface representing a MeshSecretValue. */
export interface MeshSecretValue {
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
  ): Promise<MeshSecretValueAddValueResponse>;
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
  ): Promise<MeshSecretValueGetResponse>;
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
  ): Promise<void>;
  /**
   * Gets information about all secret value resources of the specified secret resource. The information
   * includes the names of the secret value resources, but not the actual values.
   * @param secretResourceName The name of the secret resource.
   * @param options The options parameters.
   */
  list(
    secretResourceName: string,
    options?: MeshSecretValueListOptionalParams
  ): Promise<MeshSecretValueListResponse>;
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
  ): Promise<MeshSecretValueShowResponse>;
}
