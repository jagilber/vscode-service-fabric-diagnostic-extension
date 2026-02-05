import { PagedAsyncIterableIterator } from "@azure/core-paging";
import { OperationResult, OperationsListOptionalParams } from "../models";

/// <reference lib="esnext.asynciterable" />
/** Interface representing a Operations. */
export interface Operations {
  /**
   * Get the list of available Service Fabric resource provider API operations.
   * @param options The options parameters.
   */
  list(
    options?: OperationsListOptionalParams
  ): PagedAsyncIterableIterator<OperationResult>;
}
