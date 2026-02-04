import {
  MeshServiceGetOptionalParams,
  MeshServiceGetResponse,
  MeshServiceListOptionalParams,
  MeshServiceListResponse
} from "../models";

/** Interface representing a MeshService. */
export interface MeshService {
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
  ): Promise<MeshServiceGetResponse>;
  /**
   * Gets the information about all services of an application resource. The information include the
   * description and other properties of the Service.
   * @param applicationResourceName The identity of the application.
   * @param options The options parameters.
   */
  list(
    applicationResourceName: string,
    options?: MeshServiceListOptionalParams
  ): Promise<MeshServiceListResponse>;
}
