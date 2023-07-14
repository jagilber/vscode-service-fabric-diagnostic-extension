import {
  OperationParameter,
  OperationURLParameter,
  OperationQueryParameter
} from "@azure/core-client";
import {
  Cluster as ClusterMapper,
  ClusterUpdateParameters as ClusterUpdateParametersMapper,
  UpgradableVersionsDescription as UpgradableVersionsDescriptionMapper,
  ApplicationTypeResource as ApplicationTypeResourceMapper,
  ApplicationTypeVersionResource as ApplicationTypeVersionResourceMapper,
  ApplicationResource as ApplicationResourceMapper,
  ApplicationResourceUpdate as ApplicationResourceUpdateMapper,
  ServiceResource as ServiceResourceMapper,
  ServiceResourceUpdate as ServiceResourceUpdateMapper
} from "../models/mappers";

export const accept: OperationParameter = {
  parameterPath: "accept",
  mapper: {
    defaultValue: "application/json",
    isConstant: true,
    serializedName: "Accept",
    type: {
      name: "String"
    }
  }
};

export const $host: OperationURLParameter = {
  parameterPath: "$host",
  mapper: {
    serializedName: "$host",
    required: true,
    type: {
      name: "String"
    }
  },
  skipEncoding: true
};

export const resourceGroupName: OperationURLParameter = {
  parameterPath: "resourceGroupName",
  mapper: {
    serializedName: "resourceGroupName",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const clusterName: OperationURLParameter = {
  parameterPath: "clusterName",
  mapper: {
    serializedName: "clusterName",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const apiVersion: OperationQueryParameter = {
  parameterPath: "apiVersion",
  mapper: {
    defaultValue: "2021-06-01",
    isConstant: true,
    serializedName: "api-version",
    type: {
      name: "String"
    }
  }
};

export const subscriptionId: OperationURLParameter = {
  parameterPath: "subscriptionId",
  mapper: {
    serializedName: "subscriptionId",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const contentType: OperationParameter = {
  parameterPath: ["options", "contentType"],
  mapper: {
    defaultValue: "application/json",
    isConstant: true,
    serializedName: "Content-Type",
    type: {
      name: "String"
    }
  }
};

export const parameters: OperationParameter = {
  parameterPath: "parameters",
  mapper: ClusterMapper
};

export const parameters1: OperationParameter = {
  parameterPath: "parameters",
  mapper: ClusterUpdateParametersMapper
};

export const versionsDescription: OperationParameter = {
  parameterPath: ["options", "versionsDescription"],
  mapper: UpgradableVersionsDescriptionMapper
};

export const location: OperationURLParameter = {
  parameterPath: "location",
  mapper: {
    serializedName: "location",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const clusterVersion: OperationURLParameter = {
  parameterPath: "clusterVersion",
  mapper: {
    serializedName: "clusterVersion",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const environment: OperationURLParameter = {
  parameterPath: "environment",
  mapper: {
    serializedName: "environment",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const nextLink: OperationURLParameter = {
  parameterPath: "nextLink",
  mapper: {
    serializedName: "nextLink",
    required: true,
    type: {
      name: "String"
    }
  },
  skipEncoding: true
};

export const applicationTypeName: OperationURLParameter = {
  parameterPath: "applicationTypeName",
  mapper: {
    serializedName: "applicationTypeName",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const parameters2: OperationParameter = {
  parameterPath: "parameters",
  mapper: ApplicationTypeResourceMapper
};

export const version: OperationURLParameter = {
  parameterPath: "version",
  mapper: {
    serializedName: "version",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const parameters3: OperationParameter = {
  parameterPath: "parameters",
  mapper: ApplicationTypeVersionResourceMapper
};

export const applicationName: OperationURLParameter = {
  parameterPath: "applicationName",
  mapper: {
    serializedName: "applicationName",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const parameters4: OperationParameter = {
  parameterPath: "parameters",
  mapper: ApplicationResourceMapper
};

export const parameters5: OperationParameter = {
  parameterPath: "parameters",
  mapper: ApplicationResourceUpdateMapper
};

export const serviceName: OperationURLParameter = {
  parameterPath: "serviceName",
  mapper: {
    serializedName: "serviceName",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const parameters6: OperationParameter = {
  parameterPath: "parameters",
  mapper: ServiceResourceMapper
};

export const parameters7: OperationParameter = {
  parameterPath: "parameters",
  mapper: ServiceResourceUpdateMapper
};
