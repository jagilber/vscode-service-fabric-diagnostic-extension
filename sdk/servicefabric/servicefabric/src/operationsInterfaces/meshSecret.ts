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

/** Interface representing a MeshSecret. */
export interface MeshSecret {
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
  ): Promise<MeshSecretCreateOrUpdateResponse>;
  /**
   * Gets the information about the Secret resource with the given name. The information include the
   * description and other properties of the Secret.
   * @param secretResourceName The name of the secret resource.
   * @param options The options parameters.
   */
  get(
    secretResourceName: string,
    options?: MeshSecretGetOptionalParams
  ): Promise<MeshSecretGetResponse>;
  /**
   * Deletes the specified Secret resource and all of its named values.
   * @param secretResourceName The name of the secret resource.
   * @param options The options parameters.
   */
  delete(
    secretResourceName: string,
    options?: MeshSecretDeleteOptionalParams
  ): Promise<void>;
  /**
   * Gets the information about all secret resources in a given resource group. The information include
   * the description and other properties of the Secret.
   * @param options The options parameters.
   */
  list(options?: MeshSecretListOptionalParams): Promise<MeshSecretListResponse>;
}
