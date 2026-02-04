import {
  MeshServiceReplicaGetOptionalParams,
  MeshServiceReplicaGetResponse,
  MeshServiceReplicaListOptionalParams,
  MeshServiceReplicaListResponse
} from "../models";

/** Interface representing a MeshServiceReplica. */
export interface MeshServiceReplica {
  /**
   * Gets the information about the service replica with the given name. The information include the
   * description and other properties of the service replica.
   * @param applicationResourceName The identity of the application.
   * @param serviceResourceName The identity of the service.
   * @param replicaName Service Fabric replica name.
   * @param options The options parameters.
   */
  get(
    applicationResourceName: string,
    serviceResourceName: string,
    replicaName: string,
    options?: MeshServiceReplicaGetOptionalParams
  ): Promise<MeshServiceReplicaGetResponse>;
  /**
   * Gets the information about all replicas of a service. The information include the description and
   * other properties of the service replica.
   * @param applicationResourceName The identity of the application.
   * @param serviceResourceName The identity of the service.
   * @param options The options parameters.
   */
  list(
    applicationResourceName: string,
    serviceResourceName: string,
    options?: MeshServiceReplicaListOptionalParams
  ): Promise<MeshServiceReplicaListResponse>;
}
