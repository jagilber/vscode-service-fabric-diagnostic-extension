import { SimplePollerLike, OperationState } from "@azure/core-lro";
import {
  ServicesGetOptionalParams,
  ServicesGetResponse,
  ServiceResource,
  ServicesCreateOrUpdateOptionalParams,
  ServicesCreateOrUpdateResponse,
  ServiceResourceUpdate,
  ServicesUpdateOptionalParams,
  ServicesUpdateResponse,
  ServicesDeleteOptionalParams,
  ServicesListOptionalParams,
  ServicesListResponse
} from "../models";

/** Interface representing a Services. */
export interface Services {
  /**
   * Get a Service Fabric service resource created or in the process of being created in the Service
   * Fabric application resource.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationName The name of the application resource.
   * @param serviceName The name of the service resource in the format of
   *                    {applicationName}~{serviceName}.
   * @param options The options parameters.
   */
  get(
    resourceGroupName: string,
    clusterName: string,
    applicationName: string,
    serviceName: string,
    options?: ServicesGetOptionalParams
  ): Promise<ServicesGetResponse>;
  /**
   * Create or update a Service Fabric service resource with the specified name.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationName The name of the application resource.
   * @param serviceName The name of the service resource in the format of
   *                    {applicationName}~{serviceName}.
   * @param parameters The service resource.
   * @param options The options parameters.
   */
  beginCreateOrUpdate(
    resourceGroupName: string,
    clusterName: string,
    applicationName: string,
    serviceName: string,
    parameters: ServiceResource,
    options?: ServicesCreateOrUpdateOptionalParams
  ): Promise<
    SimplePollerLike<
      OperationState<ServicesCreateOrUpdateResponse>,
      ServicesCreateOrUpdateResponse
    >
  >;
  /**
   * Create or update a Service Fabric service resource with the specified name.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationName The name of the application resource.
   * @param serviceName The name of the service resource in the format of
   *                    {applicationName}~{serviceName}.
   * @param parameters The service resource.
   * @param options The options parameters.
   */
  beginCreateOrUpdateAndWait(
    resourceGroupName: string,
    clusterName: string,
    applicationName: string,
    serviceName: string,
    parameters: ServiceResource,
    options?: ServicesCreateOrUpdateOptionalParams
  ): Promise<ServicesCreateOrUpdateResponse>;
  /**
   * Update a Service Fabric service resource with the specified name.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationName The name of the application resource.
   * @param serviceName The name of the service resource in the format of
   *                    {applicationName}~{serviceName}.
   * @param parameters The service resource for patch operations.
   * @param options The options parameters.
   */
  beginUpdate(
    resourceGroupName: string,
    clusterName: string,
    applicationName: string,
    serviceName: string,
    parameters: ServiceResourceUpdate,
    options?: ServicesUpdateOptionalParams
  ): Promise<
    SimplePollerLike<
      OperationState<ServicesUpdateResponse>,
      ServicesUpdateResponse
    >
  >;
  /**
   * Update a Service Fabric service resource with the specified name.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationName The name of the application resource.
   * @param serviceName The name of the service resource in the format of
   *                    {applicationName}~{serviceName}.
   * @param parameters The service resource for patch operations.
   * @param options The options parameters.
   */
  beginUpdateAndWait(
    resourceGroupName: string,
    clusterName: string,
    applicationName: string,
    serviceName: string,
    parameters: ServiceResourceUpdate,
    options?: ServicesUpdateOptionalParams
  ): Promise<ServicesUpdateResponse>;
  /**
   * Delete a Service Fabric service resource with the specified name.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationName The name of the application resource.
   * @param serviceName The name of the service resource in the format of
   *                    {applicationName}~{serviceName}.
   * @param options The options parameters.
   */
  beginDelete(
    resourceGroupName: string,
    clusterName: string,
    applicationName: string,
    serviceName: string,
    options?: ServicesDeleteOptionalParams
  ): Promise<SimplePollerLike<OperationState<void>, void>>;
  /**
   * Delete a Service Fabric service resource with the specified name.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationName The name of the application resource.
   * @param serviceName The name of the service resource in the format of
   *                    {applicationName}~{serviceName}.
   * @param options The options parameters.
   */
  beginDeleteAndWait(
    resourceGroupName: string,
    clusterName: string,
    applicationName: string,
    serviceName: string,
    options?: ServicesDeleteOptionalParams
  ): Promise<void>;
  /**
   * Gets all service resources created or in the process of being created in the Service Fabric
   * application resource.
   * @param resourceGroupName The name of the resource group.
   * @param clusterName The name of the cluster resource.
   * @param applicationName The name of the application resource.
   * @param options The options parameters.
   */
  list(
    resourceGroupName: string,
    clusterName: string,
    applicationName: string,
    options?: ServicesListOptionalParams
  ): Promise<ServicesListResponse>;
}
