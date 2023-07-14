import { SimplePollerLike, OperationState } from "@azure/core-lro";
import {
  ApplicationTypesGetOptionalParams,
  ApplicationTypesGetResponse,
  ApplicationTypeResource,
  ApplicationTypesCreateOrUpdateOptionalParams,
  ApplicationTypesCreateOrUpdateResponse,
  ApplicationTypesDeleteOptionalParams,
  ApplicationTypesListOptionalParams,
  ApplicationTypesListResponse
} from "../models";

/** Interface representing a ApplicationTypes. */
export interface ApplicationTypes {
  /**
   * Get a Service Fabric application type name resource created or in the process of being created in
   * the Service Fabric cluster resource.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationTypeName The name of the application type name resource.
   * @param options The options parameters.
   */
  get(
    resourceGroupName: string,
    clusterName: string,
    applicationTypeName: string,
    options?: ApplicationTypesGetOptionalParams
  ): Promise<ApplicationTypesGetResponse>;
  /**
   * Create or update a Service Fabric application type name resource with the specified name.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationTypeName The name of the application type name resource.
   * @param parameters The application type name resource.
   * @param options The options parameters.
   */
  createOrUpdate(
    resourceGroupName: string,
    clusterName: string,
    applicationTypeName: string,
    parameters: ApplicationTypeResource,
    options?: ApplicationTypesCreateOrUpdateOptionalParams
  ): Promise<ApplicationTypesCreateOrUpdateResponse>;
  /**
   * Delete a Service Fabric application type name resource with the specified name.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationTypeName The name of the application type name resource.
   * @param options The options parameters.
   */
  beginDelete(
    resourceGroupName: string,
    clusterName: string,
    applicationTypeName: string,
    options?: ApplicationTypesDeleteOptionalParams
  ): Promise<SimplePollerLike<OperationState<void>, void>>;
  /**
   * Delete a Service Fabric application type name resource with the specified name.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationTypeName The name of the application type name resource.
   * @param options The options parameters.
   */
  beginDeleteAndWait(
    resourceGroupName: string,
    clusterName: string,
    applicationTypeName: string,
    options?: ApplicationTypesDeleteOptionalParams
  ): Promise<void>;
  /**
   * Gets all application type name resources created or in the process of being created in the Service
   * Fabric cluster resource.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param options The options parameters.
   */
  list(
    resourceGroupName: string,
    clusterName: string,
    options?: ApplicationTypesListOptionalParams
  ): Promise<ApplicationTypesListResponse>;
}
