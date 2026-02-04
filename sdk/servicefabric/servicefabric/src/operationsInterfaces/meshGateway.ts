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

/** Interface representing a MeshGateway. */
export interface MeshGateway {
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
  ): Promise<MeshGatewayCreateOrUpdateResponse>;
  /**
   * Gets the information about the Gateway resource with the given name. The information include the
   * description and other properties of the Gateway.
   * @param gatewayResourceName The identity of the gateway.
   * @param options The options parameters.
   */
  get(
    gatewayResourceName: string,
    options?: MeshGatewayGetOptionalParams
  ): Promise<MeshGatewayGetResponse>;
  /**
   * Deletes the Gateway resource identified by the name.
   * @param gatewayResourceName The identity of the gateway.
   * @param options The options parameters.
   */
  delete(
    gatewayResourceName: string,
    options?: MeshGatewayDeleteOptionalParams
  ): Promise<void>;
  /**
   * Gets the information about all gateway resources in a given resource group. The information include
   * the description and other properties of the Gateway.
   * @param options The options parameters.
   */
  list(
    options?: MeshGatewayListOptionalParams
  ): Promise<MeshGatewayListResponse>;
}
