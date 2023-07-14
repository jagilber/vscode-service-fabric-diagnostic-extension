import {
  MeshCodePackageGetContainerLogsOptionalParams,
  MeshCodePackageGetContainerLogsResponse
} from "../models";

/** Interface representing a MeshCodePackage. */
export interface MeshCodePackage {
  /**
   * Gets the logs for the container of the specified code package of the service replica.
   * @param applicationResourceName The identity of the application.
   * @param serviceResourceName The identity of the service.
   * @param replicaName Service Fabric replica name.
   * @param codePackageName The name of code package of the service.
   * @param options The options parameters.
   */
  getContainerLogs(
    applicationResourceName: string,
    serviceResourceName: string,
    replicaName: string,
    codePackageName: string,
    options?: MeshCodePackageGetContainerLogsOptionalParams
  ): Promise<MeshCodePackageGetContainerLogsResponse>;
}
