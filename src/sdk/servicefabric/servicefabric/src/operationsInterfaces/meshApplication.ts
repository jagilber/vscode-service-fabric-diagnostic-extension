import {
  ApplicationResourceDescription,
  MeshApplicationCreateOrUpdateOptionalParams,
  MeshApplicationCreateOrUpdateResponse,
  MeshApplicationGetOptionalParams,
  MeshApplicationGetResponse,
  MeshApplicationDeleteOptionalParams,
  MeshApplicationListOptionalParams,
  MeshApplicationListResponse,
  MeshApplicationGetUpgradeProgressOptionalParams,
  MeshApplicationGetUpgradeProgressResponse
} from "../models";

/** Interface representing a MeshApplication. */
export interface MeshApplication {
  /**
   * Creates a Application resource with the specified name, description and properties. If Application
   * resource with the same name exists, then it is updated with the specified description and
   * properties.
   * @param applicationResourceName The identity of the application.
   * @param applicationResourceDescription Description for creating a Application resource.
   * @param options The options parameters.
   */
  createOrUpdate(
    applicationResourceName: string,
    applicationResourceDescription: ApplicationResourceDescription,
    options?: MeshApplicationCreateOrUpdateOptionalParams
  ): Promise<MeshApplicationCreateOrUpdateResponse>;
  /**
   * Gets the information about the Application resource with the given name. The information include the
   * description and other properties of the Application.
   * @param applicationResourceName The identity of the application.
   * @param options The options parameters.
   */
  get(
    applicationResourceName: string,
    options?: MeshApplicationGetOptionalParams
  ): Promise<MeshApplicationGetResponse>;
  /**
   * Deletes the Application resource identified by the name.
   * @param applicationResourceName The identity of the application.
   * @param options The options parameters.
   */
  delete(
    applicationResourceName: string,
    options?: MeshApplicationDeleteOptionalParams
  ): Promise<void>;
  /**
   * Gets the information about all application resources in a given resource group. The information
   * include the description and other properties of the Application.
   * @param options The options parameters.
   */
  list(
    options?: MeshApplicationListOptionalParams
  ): Promise<MeshApplicationListResponse>;
  /**
   * Gets the upgrade progress information about the Application resource with the given name. The
   * information include percentage of completion and other upgrade state information of the Application
   * resource.
   * @param applicationResourceName The identity of the application.
   * @param options The options parameters.
   */
  getUpgradeProgress(
    applicationResourceName: string,
    options?: MeshApplicationGetUpgradeProgressOptionalParams
  ): Promise<MeshApplicationGetUpgradeProgressResponse>;
}
