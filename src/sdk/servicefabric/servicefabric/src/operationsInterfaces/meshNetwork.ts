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

/** Interface representing a MeshNetwork. */
export interface MeshNetwork {
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
  ): Promise<MeshNetworkCreateOrUpdateResponse>;
  /**
   * Gets the information about the Network resource with the given name. The information include the
   * description and other properties of the Network.
   * @param networkResourceName The identity of the network.
   * @param options The options parameters.
   */
  get(
    networkResourceName: string,
    options?: MeshNetworkGetOptionalParams
  ): Promise<MeshNetworkGetResponse>;
  /**
   * Deletes the Network resource identified by the name.
   * @param networkResourceName The identity of the network.
   * @param options The options parameters.
   */
  delete(
    networkResourceName: string,
    options?: MeshNetworkDeleteOptionalParams
  ): Promise<void>;
  /**
   * Gets the information about all network resources in a given resource group. The information include
   * the description and other properties of the Network.
   * @param options The options parameters.
   */
  list(
    options?: MeshNetworkListOptionalParams
  ): Promise<MeshNetworkListResponse>;
}
