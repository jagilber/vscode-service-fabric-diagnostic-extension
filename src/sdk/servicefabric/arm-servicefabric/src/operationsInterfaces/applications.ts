import { SimplePollerLike, OperationState } from "@azure/core-lro";
import {
  ApplicationsGetOptionalParams,
  ApplicationsGetResponse,
  ApplicationResource,
  ApplicationsCreateOrUpdateOptionalParams,
  ApplicationsCreateOrUpdateResponse,
  ApplicationResourceUpdate,
  ApplicationsUpdateOptionalParams,
  ApplicationsUpdateResponse,
  ApplicationsDeleteOptionalParams,
  ApplicationsListOptionalParams,
  ApplicationsListResponse
} from "../models";

/** Interface representing a Applications. */
export interface Applications {
  /**
   * Get a Service Fabric application resource created or in the process of being created in the Service
   * Fabric cluster resource.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationName The name of the application resource.
   * @param options The options parameters.
   */
  get(
    resourceGroupName: string,
    clusterName: string,
    applicationName: string,
    options?: ApplicationsGetOptionalParams
  ): Promise<ApplicationsGetResponse>;
  /**
   * Create or update a Service Fabric application resource with the specified name.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationName The name of the application resource.
   * @param parameters The application resource.
   * @param options The options parameters.
   */
  beginCreateOrUpdate(
    resourceGroupName: string,
    clusterName: string,
    applicationName: string,
    parameters: ApplicationResource,
    options?: ApplicationsCreateOrUpdateOptionalParams
  ): Promise<
    SimplePollerLike<
      OperationState<ApplicationsCreateOrUpdateResponse>,
      ApplicationsCreateOrUpdateResponse
    >
  >;
  /**
   * Create or update a Service Fabric application resource with the specified name.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationName The name of the application resource.
   * @param parameters The application resource.
   * @param options The options parameters.
   */
  beginCreateOrUpdateAndWait(
    resourceGroupName: string,
    clusterName: string,
    applicationName: string,
    parameters: ApplicationResource,
    options?: ApplicationsCreateOrUpdateOptionalParams
  ): Promise<ApplicationsCreateOrUpdateResponse>;
  /**
   * Update a Service Fabric application resource with the specified name.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationName The name of the application resource.
   * @param parameters The application resource for patch operations.
   * @param options The options parameters.
   */
  beginUpdate(
    resourceGroupName: string,
    clusterName: string,
    applicationName: string,
    parameters: ApplicationResourceUpdate,
    options?: ApplicationsUpdateOptionalParams
  ): Promise<
    SimplePollerLike<
      OperationState<ApplicationsUpdateResponse>,
      ApplicationsUpdateResponse
    >
  >;
  /**
   * Update a Service Fabric application resource with the specified name.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationName The name of the application resource.
   * @param parameters The application resource for patch operations.
   * @param options The options parameters.
   */
  beginUpdateAndWait(
    resourceGroupName: string,
    clusterName: string,
    applicationName: string,
    parameters: ApplicationResourceUpdate,
    options?: ApplicationsUpdateOptionalParams
  ): Promise<ApplicationsUpdateResponse>;
  /**
   * Delete a Service Fabric application resource with the specified name.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationName The name of the application resource.
   * @param options The options parameters.
   */
  beginDelete(
    resourceGroupName: string,
    clusterName: string,
    applicationName: string,
    options?: ApplicationsDeleteOptionalParams
  ): Promise<SimplePollerLike<OperationState<void>, void>>;
  /**
   * Delete a Service Fabric application resource with the specified name.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationName The name of the application resource.
   * @param options The options parameters.
   */
  beginDeleteAndWait(
    resourceGroupName: string,
    clusterName: string,
    applicationName: string,
    options?: ApplicationsDeleteOptionalParams
  ): Promise<void>;
  /**
   * Gets all application resources created or in the process of being created in the Service Fabric
   * cluster resource.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param options The options parameters.
   */
  list(
    resourceGroupName: string,
    clusterName: string,
    options?: ApplicationsListOptionalParams
  ): Promise<ApplicationsListResponse>;
}