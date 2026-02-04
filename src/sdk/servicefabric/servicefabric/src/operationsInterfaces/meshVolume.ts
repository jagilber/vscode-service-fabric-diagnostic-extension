import {
  VolumeResourceDescription,
  MeshVolumeCreateOrUpdateOptionalParams,
  MeshVolumeCreateOrUpdateResponse,
  MeshVolumeGetOptionalParams,
  MeshVolumeGetResponse,
  MeshVolumeDeleteOptionalParams,
  MeshVolumeListOptionalParams,
  MeshVolumeListResponse
} from "../models";

/** Interface representing a MeshVolume. */
export interface MeshVolume {
  /**
   * Creates a Volume resource with the specified name, description and properties. If Volume resource
   * with the same name exists, then it is updated with the specified description and properties.
   * @param volumeResourceName The identity of the volume.
   * @param volumeResourceDescription Description for creating a Volume resource.
   * @param options The options parameters.
   */
  createOrUpdate(
    volumeResourceName: string,
    volumeResourceDescription: VolumeResourceDescription,
    options?: MeshVolumeCreateOrUpdateOptionalParams
  ): Promise<MeshVolumeCreateOrUpdateResponse>;
  /**
   * Gets the information about the Volume resource with the given name. The information include the
   * description and other properties of the Volume.
   * @param volumeResourceName The identity of the volume.
   * @param options The options parameters.
   */
  get(
    volumeResourceName: string,
    options?: MeshVolumeGetOptionalParams
  ): Promise<MeshVolumeGetResponse>;
  /**
   * Deletes the Volume resource identified by the name.
   * @param volumeResourceName The identity of the volume.
   * @param options The options parameters.
   */
  delete(
    volumeResourceName: string,
    options?: MeshVolumeDeleteOptionalParams
  ): Promise<void>;
  /**
   * Gets the information about all volume resources in a given resource group. The information include
   * the description and other properties of the Volume.
   * @param options The options parameters.
   */
  list(options?: MeshVolumeListOptionalParams): Promise<MeshVolumeListResponse>;
}
