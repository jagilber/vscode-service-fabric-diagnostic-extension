import { SimplePollerLike, OperationState } from "@azure/core-lro";
import {
  ApplicationTypeVersionsGetOptionalParams,
  ApplicationTypeVersionsGetResponse,
  ApplicationTypeVersionResource,
  ApplicationTypeVersionsCreateOrUpdateOptionalParams,
  ApplicationTypeVersionsCreateOrUpdateResponse,
  ApplicationTypeVersionsDeleteOptionalParams,
  ApplicationTypeVersionsListOptionalParams,
  ApplicationTypeVersionsListResponse
} from "../models";

/** Interface representing a ApplicationTypeVersions. */
export interface ApplicationTypeVersions {
  /**
   * Get a Service Fabric application type version resource created or in the process of being created in
   * the Service Fabric application type name resource.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationTypeName The name of the application type name resource.
   * @param version The application type version.
   * @param options The options parameters.
   */
  get(
    resourceGroupName: string,
    clusterName: string,
    applicationTypeName: string,
    version: string,
    options?: ApplicationTypeVersionsGetOptionalParams
  ): Promise<ApplicationTypeVersionsGetResponse>;
  /**
   * Create or update a Service Fabric application type version resource with the specified name.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationTypeName The name of the application type name resource.
   * @param version The application type version.
   * @param parameters The application type version resource.
   * @param options The options parameters.
   */
  beginCreateOrUpdate(
    resourceGroupName: string,
    clusterName: string,
    applicationTypeName: string,
    version: string,
    parameters: ApplicationTypeVersionResource,
    options?: ApplicationTypeVersionsCreateOrUpdateOptionalParams
  ): Promise<
    SimplePollerLike<
      OperationState<ApplicationTypeVersionsCreateOrUpdateResponse>,
      ApplicationTypeVersionsCreateOrUpdateResponse
    >
  >;
  /**
   * Create or update a Service Fabric application type version resource with the specified name.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationTypeName The name of the application type name resource.
   * @param version The application type version.
   * @param parameters The application type version resource.
   * @param options The options parameters.
   */
  beginCreateOrUpdateAndWait(
    resourceGroupName: string,
    clusterName: string,
    applicationTypeName: string,
    version: string,
    parameters: ApplicationTypeVersionResource,
    options?: ApplicationTypeVersionsCreateOrUpdateOptionalParams
  ): Promise<ApplicationTypeVersionsCreateOrUpdateResponse>;
  /**
   * Delete a Service Fabric application type version resource with the specified name.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationTypeName The name of the application type name resource.
   * @param version The application type version.
   * @param options The options parameters.
   */
  beginDelete(
    resourceGroupName: string,
    clusterName: string,
    applicationTypeName: string,
    version: string,
    options?: ApplicationTypeVersionsDeleteOptionalParams
  ): Promise<SimplePollerLike<OperationState<void>, void>>;
  /**
   * Delete a Service Fabric application type version resource with the specified name.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationTypeName The name of the application type name resource.
   * @param version The application type version.
   * @param options The options parameters.
   */
  beginDeleteAndWait(
    resourceGroupName: string,
    clusterName: string,
    applicationTypeName: string,
    version: string,
    options?: ApplicationTypeVersionsDeleteOptionalParams
  ): Promise<void>;
  /**
   * Gets all application type version resources created or in the process of being created in the
   * Service Fabric application type name resource.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationTypeName The name of the application type name resource.
   * @param options The options parameters.
   */
  list(
    resourceGroupName: string,
    clusterName: string,
    applicationTypeName: string,
    options?: ApplicationTypeVersionsListOptionalParams
  ): Promise<ApplicationTypeVersionsListResponse>;
}
