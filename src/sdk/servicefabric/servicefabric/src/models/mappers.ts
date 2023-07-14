import * as coreClient from "@azure/core-client";

export const ClusterManifest: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ClusterManifest",
    modelProperties: {
      manifest: {
        serializedName: "Manifest",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const FabricError: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "FabricError",
    modelProperties: {
      error: {
        serializedName: "Error",
        type: {
          name: "Composite",
          className: "FabricErrorError"
        }
      }
    }
  }
};

export const FabricErrorError: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "FabricErrorError",
    modelProperties: {
      code: {
        serializedName: "Code",
        required: true,
        type: {
          name: "String"
        }
      },
      message: {
        serializedName: "Message",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const NodeId: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "NodeId",
    modelProperties: {
      id: {
        serializedName: "Id",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const EntityHealthState: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "EntityHealthState",
    modelProperties: {
      aggregatedHealthState: {
        serializedName: "AggregatedHealthState",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const EntityHealth: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "EntityHealth",
    modelProperties: {
      aggregatedHealthState: {
        serializedName: "AggregatedHealthState",
        type: {
          name: "String"
        }
      },
      healthEvents: {
        serializedName: "HealthEvents",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HealthEvent"
            }
          }
        }
      },
      unhealthyEvaluations: {
        serializedName: "UnhealthyEvaluations",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HealthEvaluationWrapper"
            }
          }
        }
      },
      healthStatistics: {
        serializedName: "HealthStatistics",
        type: {
          name: "Composite",
          className: "HealthStatistics"
        }
      }
    }
  }
};

export const HealthInformation: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "HealthInformation",
    modelProperties: {
      sourceId: {
        serializedName: "SourceId",
        required: true,
        type: {
          name: "String"
        }
      },
      property: {
        serializedName: "Property",
        required: true,
        type: {
          name: "String"
        }
      },
      healthState: {
        serializedName: "HealthState",
        required: true,
        type: {
          name: "String"
        }
      },
      timeToLiveInMilliSeconds: {
        serializedName: "TimeToLiveInMilliSeconds",
        type: {
          name: "TimeSpan"
        }
      },
      description: {
        serializedName: "Description",
        type: {
          name: "String"
        }
      },
      sequenceNumber: {
        serializedName: "SequenceNumber",
        type: {
          name: "String"
        }
      },
      removeWhenExpired: {
        serializedName: "RemoveWhenExpired",
        type: {
          name: "Boolean"
        }
      },
      healthReportId: {
        serializedName: "HealthReportId",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const HealthEvaluationWrapper: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "HealthEvaluationWrapper",
    modelProperties: {
      healthEvaluation: {
        serializedName: "HealthEvaluation",
        type: {
          name: "Composite",
          className: "HealthEvaluation"
        }
      }
    }
  }
};

export const HealthEvaluation: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "HealthEvaluation",
    uberParent: "HealthEvaluation",
    polymorphicDiscriminator: {
      serializedName: "Kind",
      clientName: "kind"
    },
    modelProperties: {
      kind: {
        serializedName: "Kind",
        required: true,
        type: {
          name: "String"
        }
      },
      aggregatedHealthState: {
        serializedName: "AggregatedHealthState",
        type: {
          name: "String"
        }
      },
      description: {
        serializedName: "Description",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const HealthStatistics: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "HealthStatistics",
    modelProperties: {
      healthStateCountList: {
        serializedName: "HealthStateCountList",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "EntityKindHealthStateCount"
            }
          }
        }
      }
    }
  }
};

export const EntityKindHealthStateCount: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "EntityKindHealthStateCount",
    modelProperties: {
      entityKind: {
        serializedName: "EntityKind",
        type: {
          name: "String"
        }
      },
      healthStateCount: {
        serializedName: "HealthStateCount",
        type: {
          name: "Composite",
          className: "HealthStateCount"
        }
      }
    }
  }
};

export const HealthStateCount: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "HealthStateCount",
    modelProperties: {
      okCount: {
        constraints: {
          InclusiveMinimum: 0
        },
        serializedName: "OkCount",
        type: {
          name: "Number"
        }
      },
      warningCount: {
        constraints: {
          InclusiveMinimum: 0
        },
        serializedName: "WarningCount",
        type: {
          name: "Number"
        }
      },
      errorCount: {
        constraints: {
          InclusiveMinimum: 0
        },
        serializedName: "ErrorCount",
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ClusterHealthPolicies: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ClusterHealthPolicies",
    modelProperties: {
      applicationHealthPolicyMap: {
        serializedName: "ApplicationHealthPolicyMap",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ApplicationHealthPolicyMapItem"
            }
          }
        }
      },
      clusterHealthPolicy: {
        serializedName: "ClusterHealthPolicy",
        type: {
          name: "Composite",
          className: "ClusterHealthPolicy"
        }
      }
    }
  }
};

export const ApplicationHealthPolicyMapItem: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationHealthPolicyMapItem",
    modelProperties: {
      key: {
        serializedName: "Key",
        required: true,
        type: {
          name: "String"
        }
      },
      value: {
        serializedName: "Value",
        type: {
          name: "Composite",
          className: "ApplicationHealthPolicy"
        }
      }
    }
  }
};

export const ApplicationHealthPolicy: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationHealthPolicy",
    modelProperties: {
      considerWarningAsError: {
        defaultValue: false,
        serializedName: "ConsiderWarningAsError",
        type: {
          name: "Boolean"
        }
      },
      maxPercentUnhealthyDeployedApplications: {
        defaultValue: 0,
        serializedName: "MaxPercentUnhealthyDeployedApplications",
        type: {
          name: "Number"
        }
      },
      defaultServiceTypeHealthPolicy: {
        serializedName: "DefaultServiceTypeHealthPolicy",
        type: {
          name: "Composite",
          className: "ServiceTypeHealthPolicy"
        }
      },
      serviceTypeHealthPolicyMap: {
        serializedName: "ServiceTypeHealthPolicyMap",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ServiceTypeHealthPolicyMapItem"
            }
          }
        }
      }
    }
  }
};

export const ServiceTypeHealthPolicy: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceTypeHealthPolicy",
    modelProperties: {
      maxPercentUnhealthyPartitionsPerService: {
        defaultValue: 0,
        serializedName: "MaxPercentUnhealthyPartitionsPerService",
        type: {
          name: "Number"
        }
      },
      maxPercentUnhealthyReplicasPerPartition: {
        defaultValue: 0,
        serializedName: "MaxPercentUnhealthyReplicasPerPartition",
        type: {
          name: "Number"
        }
      },
      maxPercentUnhealthyServices: {
        defaultValue: 0,
        serializedName: "MaxPercentUnhealthyServices",
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ServiceTypeHealthPolicyMapItem: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceTypeHealthPolicyMapItem",
    modelProperties: {
      key: {
        serializedName: "Key",
        required: true,
        type: {
          name: "String"
        }
      },
      value: {
        serializedName: "Value",
        type: {
          name: "Composite",
          className: "ServiceTypeHealthPolicy"
        }
      }
    }
  }
};

export const ClusterHealthPolicy: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ClusterHealthPolicy",
    modelProperties: {
      considerWarningAsError: {
        defaultValue: false,
        serializedName: "ConsiderWarningAsError",
        type: {
          name: "Boolean"
        }
      },
      maxPercentUnhealthyNodes: {
        defaultValue: 0,
        serializedName: "MaxPercentUnhealthyNodes",
        type: {
          name: "Number"
        }
      },
      maxPercentUnhealthyApplications: {
        defaultValue: 0,
        serializedName: "MaxPercentUnhealthyApplications",
        type: {
          name: "Number"
        }
      },
      applicationTypeHealthPolicyMap: {
        serializedName: "ApplicationTypeHealthPolicyMap",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ApplicationTypeHealthPolicyMapItem"
            }
          }
        }
      },
      nodeTypeHealthPolicyMap: {
        serializedName: "NodeTypeHealthPolicyMap",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "NodeTypeHealthPolicyMapItem"
            }
          }
        }
      }
    }
  }
};

export const ApplicationTypeHealthPolicyMapItem: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationTypeHealthPolicyMapItem",
    modelProperties: {
      key: {
        serializedName: "Key",
        required: true,
        type: {
          name: "String"
        }
      },
      value: {
        serializedName: "Value",
        required: true,
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const NodeTypeHealthPolicyMapItem: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "NodeTypeHealthPolicyMapItem",
    modelProperties: {
      key: {
        serializedName: "Key",
        required: true,
        type: {
          name: "String"
        }
      },
      value: {
        serializedName: "Value",
        required: true,
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ClusterHealthChunk: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ClusterHealthChunk",
    modelProperties: {
      healthState: {
        serializedName: "HealthState",
        type: {
          name: "String"
        }
      },
      nodeHealthStateChunks: {
        serializedName: "NodeHealthStateChunks",
        type: {
          name: "Composite",
          className: "NodeHealthStateChunkList"
        }
      },
      applicationHealthStateChunks: {
        serializedName: "ApplicationHealthStateChunks",
        type: {
          name: "Composite",
          className: "ApplicationHealthStateChunkList"
        }
      }
    }
  }
};

export const EntityHealthStateChunk: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "EntityHealthStateChunk",
    modelProperties: {
      healthState: {
        serializedName: "HealthState",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const EntityHealthStateChunkList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "EntityHealthStateChunkList",
    modelProperties: {
      totalCount: {
        serializedName: "TotalCount",
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ServiceHealthStateChunkList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceHealthStateChunkList",
    modelProperties: {
      items: {
        serializedName: "Items",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ServiceHealthStateChunk"
            }
          }
        }
      }
    }
  }
};

export const PartitionHealthStateChunkList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PartitionHealthStateChunkList",
    modelProperties: {
      items: {
        serializedName: "Items",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "PartitionHealthStateChunk"
            }
          }
        }
      }
    }
  }
};

export const ReplicaHealthStateChunkList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ReplicaHealthStateChunkList",
    modelProperties: {
      items: {
        serializedName: "Items",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ReplicaHealthStateChunk"
            }
          }
        }
      }
    }
  }
};

export const DeployedApplicationHealthStateChunkList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "DeployedApplicationHealthStateChunkList",
    modelProperties: {
      items: {
        serializedName: "Items",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "DeployedApplicationHealthStateChunk"
            }
          }
        }
      }
    }
  }
};

export const DeployedServicePackageHealthStateChunkList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "DeployedServicePackageHealthStateChunkList",
    modelProperties: {
      items: {
        serializedName: "Items",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "DeployedServicePackageHealthStateChunk"
            }
          }
        }
      }
    }
  }
};

export const ClusterHealthChunkQueryDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ClusterHealthChunkQueryDescription",
    modelProperties: {
      nodeFilters: {
        serializedName: "NodeFilters",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "NodeHealthStateFilter"
            }
          }
        }
      },
      applicationFilters: {
        serializedName: "ApplicationFilters",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ApplicationHealthStateFilter"
            }
          }
        }
      },
      clusterHealthPolicy: {
        serializedName: "ClusterHealthPolicy",
        type: {
          name: "Composite",
          className: "ClusterHealthPolicy"
        }
      },
      applicationHealthPolicies: {
        serializedName: "ApplicationHealthPolicies",
        type: {
          name: "Composite",
          className: "ApplicationHealthPolicies"
        }
      }
    }
  }
};

export const NodeHealthStateFilter: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "NodeHealthStateFilter",
    modelProperties: {
      nodeNameFilter: {
        serializedName: "NodeNameFilter",
        type: {
          name: "String"
        }
      },
      healthStateFilter: {
        defaultValue: 0,
        serializedName: "HealthStateFilter",
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ApplicationHealthStateFilter: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationHealthStateFilter",
    modelProperties: {
      applicationNameFilter: {
        serializedName: "ApplicationNameFilter",
        type: {
          name: "String"
        }
      },
      applicationTypeNameFilter: {
        serializedName: "ApplicationTypeNameFilter",
        type: {
          name: "String"
        }
      },
      healthStateFilter: {
        defaultValue: 0,
        serializedName: "HealthStateFilter",
        type: {
          name: "Number"
        }
      },
      serviceFilters: {
        serializedName: "ServiceFilters",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ServiceHealthStateFilter"
            }
          }
        }
      },
      deployedApplicationFilters: {
        serializedName: "DeployedApplicationFilters",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "DeployedApplicationHealthStateFilter"
            }
          }
        }
      }
    }
  }
};

export const ServiceHealthStateFilter: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceHealthStateFilter",
    modelProperties: {
      serviceNameFilter: {
        serializedName: "ServiceNameFilter",
        type: {
          name: "String"
        }
      },
      healthStateFilter: {
        defaultValue: 0,
        serializedName: "HealthStateFilter",
        type: {
          name: "Number"
        }
      },
      partitionFilters: {
        serializedName: "PartitionFilters",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "PartitionHealthStateFilter"
            }
          }
        }
      }
    }
  }
};

export const PartitionHealthStateFilter: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PartitionHealthStateFilter",
    modelProperties: {
      partitionIdFilter: {
        serializedName: "PartitionIdFilter",
        type: {
          name: "Uuid"
        }
      },
      healthStateFilter: {
        defaultValue: 0,
        serializedName: "HealthStateFilter",
        type: {
          name: "Number"
        }
      },
      replicaFilters: {
        serializedName: "ReplicaFilters",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ReplicaHealthStateFilter"
            }
          }
        }
      }
    }
  }
};

export const ReplicaHealthStateFilter: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ReplicaHealthStateFilter",
    modelProperties: {
      replicaOrInstanceIdFilter: {
        serializedName: "ReplicaOrInstanceIdFilter",
        type: {
          name: "String"
        }
      },
      healthStateFilter: {
        defaultValue: 0,
        serializedName: "HealthStateFilter",
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const DeployedApplicationHealthStateFilter: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "DeployedApplicationHealthStateFilter",
    modelProperties: {
      nodeNameFilter: {
        serializedName: "NodeNameFilter",
        type: {
          name: "String"
        }
      },
      healthStateFilter: {
        defaultValue: 0,
        serializedName: "HealthStateFilter",
        type: {
          name: "Number"
        }
      },
      deployedServicePackageFilters: {
        serializedName: "DeployedServicePackageFilters",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "DeployedServicePackageHealthStateFilter"
            }
          }
        }
      }
    }
  }
};

export const DeployedServicePackageHealthStateFilter: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "DeployedServicePackageHealthStateFilter",
    modelProperties: {
      serviceManifestNameFilter: {
        serializedName: "ServiceManifestNameFilter",
        type: {
          name: "String"
        }
      },
      servicePackageActivationIdFilter: {
        serializedName: "ServicePackageActivationIdFilter",
        type: {
          name: "String"
        }
      },
      healthStateFilter: {
        defaultValue: 0,
        serializedName: "HealthStateFilter",
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ApplicationHealthPolicies: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationHealthPolicies",
    modelProperties: {
      applicationHealthPolicyMap: {
        serializedName: "ApplicationHealthPolicyMap",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ApplicationHealthPolicyMapItem"
            }
          }
        }
      }
    }
  }
};

export const FabricCodeVersionInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "FabricCodeVersionInfo",
    modelProperties: {
      codeVersion: {
        serializedName: "CodeVersion",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const FabricConfigVersionInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "FabricConfigVersionInfo",
    modelProperties: {
      configVersion: {
        serializedName: "ConfigVersion",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ClusterUpgradeProgressObject: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ClusterUpgradeProgressObject",
    modelProperties: {
      codeVersion: {
        serializedName: "CodeVersion",
        type: {
          name: "String"
        }
      },
      configVersion: {
        serializedName: "ConfigVersion",
        type: {
          name: "String"
        }
      },
      upgradeDomains: {
        serializedName: "UpgradeDomains",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "UpgradeDomainInfo"
            }
          }
        }
      },
      upgradeUnits: {
        serializedName: "UpgradeUnits",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "UpgradeUnitInfo"
            }
          }
        }
      },
      upgradeState: {
        serializedName: "UpgradeState",
        type: {
          name: "String"
        }
      },
      nextUpgradeDomain: {
        serializedName: "NextUpgradeDomain",
        type: {
          name: "String"
        }
      },
      rollingUpgradeMode: {
        defaultValue: "UnmonitoredAuto",
        serializedName: "RollingUpgradeMode",
        type: {
          name: "String"
        }
      },
      upgradeDescription: {
        serializedName: "UpgradeDescription",
        type: {
          name: "Composite",
          className: "ClusterUpgradeDescriptionObject"
        }
      },
      upgradeDurationInMilliseconds: {
        serializedName: "UpgradeDurationInMilliseconds",
        type: {
          name: "String"
        }
      },
      upgradeDomainDurationInMilliseconds: {
        serializedName: "UpgradeDomainDurationInMilliseconds",
        type: {
          name: "String"
        }
      },
      unhealthyEvaluations: {
        serializedName: "UnhealthyEvaluations",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HealthEvaluationWrapper"
            }
          }
        }
      },
      currentUpgradeDomainProgress: {
        serializedName: "CurrentUpgradeDomainProgress",
        type: {
          name: "Composite",
          className: "CurrentUpgradeDomainProgressInfo"
        }
      },
      currentUpgradeUnitsProgress: {
        serializedName: "CurrentUpgradeUnitsProgress",
        type: {
          name: "Composite",
          className: "CurrentUpgradeUnitsProgressInfo"
        }
      },
      startTimestampUtc: {
        serializedName: "StartTimestampUtc",
        type: {
          name: "String"
        }
      },
      failureTimestampUtc: {
        serializedName: "FailureTimestampUtc",
        type: {
          name: "String"
        }
      },
      failureReason: {
        serializedName: "FailureReason",
        type: {
          name: "String"
        }
      },
      upgradeDomainProgressAtFailure: {
        serializedName: "UpgradeDomainProgressAtFailure",
        type: {
          name: "Composite",
          className: "FailedUpgradeDomainProgressObject"
        }
      },
      isNodeByNode: {
        defaultValue: false,
        serializedName: "IsNodeByNode",
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const UpgradeDomainInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "UpgradeDomainInfo",
    modelProperties: {
      name: {
        serializedName: "Name",
        type: {
          name: "String"
        }
      },
      state: {
        serializedName: "State",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const UpgradeUnitInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "UpgradeUnitInfo",
    modelProperties: {
      name: {
        serializedName: "Name",
        type: {
          name: "String"
        }
      },
      state: {
        serializedName: "State",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ClusterUpgradeDescriptionObject: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ClusterUpgradeDescriptionObject",
    modelProperties: {
      configVersion: {
        serializedName: "ConfigVersion",
        type: {
          name: "String"
        }
      },
      codeVersion: {
        serializedName: "CodeVersion",
        type: {
          name: "String"
        }
      },
      upgradeKind: {
        defaultValue: "Rolling",
        serializedName: "UpgradeKind",
        type: {
          name: "String"
        }
      },
      rollingUpgradeMode: {
        defaultValue: "UnmonitoredAuto",
        serializedName: "RollingUpgradeMode",
        type: {
          name: "String"
        }
      },
      upgradeReplicaSetCheckTimeoutInSeconds: {
        defaultValue: 42949672925,
        serializedName: "UpgradeReplicaSetCheckTimeoutInSeconds",
        type: {
          name: "Number"
        }
      },
      forceRestart: {
        defaultValue: false,
        serializedName: "ForceRestart",
        type: {
          name: "Boolean"
        }
      },
      sortOrder: {
        defaultValue: "Default",
        serializedName: "SortOrder",
        type: {
          name: "String"
        }
      },
      enableDeltaHealthEvaluation: {
        serializedName: "EnableDeltaHealthEvaluation",
        type: {
          name: "Boolean"
        }
      },
      monitoringPolicy: {
        serializedName: "MonitoringPolicy",
        type: {
          name: "Composite",
          className: "MonitoringPolicyDescription"
        }
      },
      clusterHealthPolicy: {
        serializedName: "ClusterHealthPolicy",
        type: {
          name: "Composite",
          className: "ClusterHealthPolicy"
        }
      },
      clusterUpgradeHealthPolicy: {
        serializedName: "ClusterUpgradeHealthPolicy",
        type: {
          name: "Composite",
          className: "ClusterUpgradeHealthPolicyObject"
        }
      },
      applicationHealthPolicyMap: {
        serializedName: "ApplicationHealthPolicyMap",
        type: {
          name: "Composite",
          className: "ApplicationHealthPolicyMapObject"
        }
      }
    }
  }
};

export const MonitoringPolicyDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "MonitoringPolicyDescription",
    modelProperties: {
      failureAction: {
        serializedName: "FailureAction",
        type: {
          name: "String"
        }
      },
      healthCheckWaitDurationInMilliseconds: {
        defaultValue: "0",
        serializedName: "HealthCheckWaitDurationInMilliseconds",
        type: {
          name: "String"
        }
      },
      healthCheckStableDurationInMilliseconds: {
        defaultValue: "PT0H2M0S",
        serializedName: "HealthCheckStableDurationInMilliseconds",
        type: {
          name: "String"
        }
      },
      healthCheckRetryTimeoutInMilliseconds: {
        defaultValue: "PT0H10M0S",
        serializedName: "HealthCheckRetryTimeoutInMilliseconds",
        type: {
          name: "String"
        }
      },
      upgradeTimeoutInMilliseconds: {
        defaultValue: "P10675199DT02H48M05.4775807S",
        serializedName: "UpgradeTimeoutInMilliseconds",
        type: {
          name: "String"
        }
      },
      upgradeDomainTimeoutInMilliseconds: {
        defaultValue: "P10675199DT02H48M05.4775807S",
        serializedName: "UpgradeDomainTimeoutInMilliseconds",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ClusterUpgradeHealthPolicyObject: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ClusterUpgradeHealthPolicyObject",
    modelProperties: {
      maxPercentDeltaUnhealthyNodes: {
        constraints: {
          InclusiveMaximum: 100,
          InclusiveMinimum: 0
        },
        serializedName: "MaxPercentDeltaUnhealthyNodes",
        type: {
          name: "Number"
        }
      },
      maxPercentUpgradeDomainDeltaUnhealthyNodes: {
        constraints: {
          InclusiveMaximum: 100,
          InclusiveMinimum: 0
        },
        serializedName: "MaxPercentUpgradeDomainDeltaUnhealthyNodes",
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ApplicationHealthPolicyMapObject: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationHealthPolicyMapObject",
    modelProperties: {
      applicationHealthPolicyMap: {
        serializedName: "ApplicationHealthPolicyMap",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ApplicationHealthPolicyMapItem"
            }
          }
        }
      }
    }
  }
};

export const CurrentUpgradeDomainProgressInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "CurrentUpgradeDomainProgressInfo",
    modelProperties: {
      domainName: {
        serializedName: "DomainName",
        type: {
          name: "String"
        }
      },
      nodeUpgradeProgressList: {
        serializedName: "NodeUpgradeProgressList",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "NodeUpgradeProgressInfo"
            }
          }
        }
      }
    }
  }
};

export const NodeUpgradeProgressInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "NodeUpgradeProgressInfo",
    modelProperties: {
      nodeName: {
        serializedName: "NodeName",
        type: {
          name: "String"
        }
      },
      upgradePhase: {
        serializedName: "UpgradePhase",
        type: {
          name: "String"
        }
      },
      pendingSafetyChecks: {
        serializedName: "PendingSafetyChecks",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "SafetyCheckWrapper"
            }
          }
        }
      },
      upgradeDuration: {
        serializedName: "UpgradeDuration",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const SafetyCheckWrapper: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "SafetyCheckWrapper",
    modelProperties: {
      safetyCheck: {
        serializedName: "SafetyCheck",
        type: {
          name: "Composite",
          className: "SafetyCheck"
        }
      }
    }
  }
};

export const SafetyCheck: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "SafetyCheck",
    uberParent: "SafetyCheck",
    polymorphicDiscriminator: {
      serializedName: "Kind",
      clientName: "kind"
    },
    modelProperties: {
      kind: {
        serializedName: "Kind",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const CurrentUpgradeUnitsProgressInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "CurrentUpgradeUnitsProgressInfo",
    modelProperties: {
      domainName: {
        serializedName: "DomainName",
        type: {
          name: "String"
        }
      },
      nodeUpgradeProgressList: {
        serializedName: "NodeUpgradeProgressList",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "NodeUpgradeProgressInfo"
            }
          }
        }
      }
    }
  }
};

export const FailedUpgradeDomainProgressObject: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "FailedUpgradeDomainProgressObject",
    modelProperties: {
      domainName: {
        serializedName: "DomainName",
        type: {
          name: "String"
        }
      },
      nodeUpgradeProgressList: {
        serializedName: "NodeUpgradeProgressList",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "NodeUpgradeProgressInfo"
            }
          }
        }
      }
    }
  }
};

export const ClusterConfiguration: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ClusterConfiguration",
    modelProperties: {
      clusterConfiguration: {
        serializedName: "ClusterConfiguration",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ClusterConfigurationUpgradeStatusInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ClusterConfigurationUpgradeStatusInfo",
    modelProperties: {
      upgradeState: {
        serializedName: "UpgradeState",
        type: {
          name: "String"
        }
      },
      progressStatus: {
        serializedName: "ProgressStatus",
        type: {
          name: "Number"
        }
      },
      configVersion: {
        serializedName: "ConfigVersion",
        type: {
          name: "String"
        }
      },
      details: {
        serializedName: "Details",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const UpgradeOrchestrationServiceState: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "UpgradeOrchestrationServiceState",
    modelProperties: {
      serviceState: {
        serializedName: "ServiceState",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const UpgradeOrchestrationServiceStateSummary: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "UpgradeOrchestrationServiceStateSummary",
    modelProperties: {
      currentCodeVersion: {
        serializedName: "CurrentCodeVersion",
        type: {
          name: "String"
        }
      },
      currentManifestVersion: {
        serializedName: "CurrentManifestVersion",
        type: {
          name: "String"
        }
      },
      targetCodeVersion: {
        serializedName: "TargetCodeVersion",
        type: {
          name: "String"
        }
      },
      targetManifestVersion: {
        serializedName: "TargetManifestVersion",
        type: {
          name: "String"
        }
      },
      pendingUpgradeType: {
        serializedName: "PendingUpgradeType",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ProvisionFabricDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ProvisionFabricDescription",
    modelProperties: {
      codeFilePath: {
        serializedName: "CodeFilePath",
        type: {
          name: "String"
        }
      },
      clusterManifestFilePath: {
        serializedName: "ClusterManifestFilePath",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const UnprovisionFabricDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "UnprovisionFabricDescription",
    modelProperties: {
      codeVersion: {
        serializedName: "CodeVersion",
        type: {
          name: "String"
        }
      },
      configVersion: {
        serializedName: "ConfigVersion",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ResumeClusterUpgradeDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ResumeClusterUpgradeDescription",
    modelProperties: {
      upgradeDomain: {
        serializedName: "UpgradeDomain",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const StartClusterUpgradeDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "StartClusterUpgradeDescription",
    modelProperties: {
      codeVersion: {
        serializedName: "CodeVersion",
        type: {
          name: "String"
        }
      },
      configVersion: {
        serializedName: "ConfigVersion",
        type: {
          name: "String"
        }
      },
      upgradeKind: {
        defaultValue: "Rolling",
        serializedName: "UpgradeKind",
        type: {
          name: "String"
        }
      },
      rollingUpgradeMode: {
        defaultValue: "UnmonitoredAuto",
        serializedName: "RollingUpgradeMode",
        type: {
          name: "String"
        }
      },
      upgradeReplicaSetCheckTimeoutInSeconds: {
        defaultValue: 42949672925,
        serializedName: "UpgradeReplicaSetCheckTimeoutInSeconds",
        type: {
          name: "Number"
        }
      },
      forceRestart: {
        defaultValue: false,
        serializedName: "ForceRestart",
        type: {
          name: "Boolean"
        }
      },
      sortOrder: {
        defaultValue: "Default",
        serializedName: "SortOrder",
        type: {
          name: "String"
        }
      },
      monitoringPolicy: {
        serializedName: "MonitoringPolicy",
        type: {
          name: "Composite",
          className: "MonitoringPolicyDescription"
        }
      },
      clusterHealthPolicy: {
        serializedName: "ClusterHealthPolicy",
        type: {
          name: "Composite",
          className: "ClusterHealthPolicy"
        }
      },
      enableDeltaHealthEvaluation: {
        serializedName: "EnableDeltaHealthEvaluation",
        type: {
          name: "Boolean"
        }
      },
      clusterUpgradeHealthPolicy: {
        serializedName: "ClusterUpgradeHealthPolicy",
        type: {
          name: "Composite",
          className: "ClusterUpgradeHealthPolicyObject"
        }
      },
      applicationHealthPolicyMap: {
        serializedName: "ApplicationHealthPolicyMap",
        type: {
          name: "Composite",
          className: "ApplicationHealthPolicies"
        }
      },
      instanceCloseDelayDurationInSeconds: {
        defaultValue: 4294967295,
        serializedName: "InstanceCloseDelayDurationInSeconds",
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ClusterConfigurationUpgradeDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ClusterConfigurationUpgradeDescription",
    modelProperties: {
      clusterConfig: {
        serializedName: "ClusterConfig",
        required: true,
        type: {
          name: "String"
        }
      },
      healthCheckRetryTimeout: {
        defaultValue: "PT0H0M0S",
        serializedName: "HealthCheckRetryTimeout",
        type: {
          name: "TimeSpan"
        }
      },
      healthCheckWaitDurationInSeconds: {
        defaultValue: "PT0H0M0S",
        serializedName: "HealthCheckWaitDurationInSeconds",
        type: {
          name: "TimeSpan"
        }
      },
      healthCheckStableDurationInSeconds: {
        defaultValue: "PT0H0M0S",
        serializedName: "HealthCheckStableDurationInSeconds",
        type: {
          name: "TimeSpan"
        }
      },
      upgradeDomainTimeoutInSeconds: {
        defaultValue: "PT0H0M0S",
        serializedName: "UpgradeDomainTimeoutInSeconds",
        type: {
          name: "TimeSpan"
        }
      },
      upgradeTimeoutInSeconds: {
        defaultValue: "PT0H0M0S",
        serializedName: "UpgradeTimeoutInSeconds",
        type: {
          name: "TimeSpan"
        }
      },
      maxPercentUnhealthyApplications: {
        defaultValue: 0,
        serializedName: "MaxPercentUnhealthyApplications",
        type: {
          name: "Number"
        }
      },
      maxPercentUnhealthyNodes: {
        defaultValue: 0,
        serializedName: "MaxPercentUnhealthyNodes",
        type: {
          name: "Number"
        }
      },
      maxPercentDeltaUnhealthyNodes: {
        defaultValue: 0,
        serializedName: "MaxPercentDeltaUnhealthyNodes",
        type: {
          name: "Number"
        }
      },
      maxPercentUpgradeDomainDeltaUnhealthyNodes: {
        defaultValue: 0,
        serializedName: "MaxPercentUpgradeDomainDeltaUnhealthyNodes",
        type: {
          name: "Number"
        }
      },
      applicationHealthPolicies: {
        serializedName: "ApplicationHealthPolicies",
        type: {
          name: "Composite",
          className: "ApplicationHealthPolicies"
        }
      }
    }
  }
};

export const UpdateClusterUpgradeDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "UpdateClusterUpgradeDescription",
    modelProperties: {
      upgradeKind: {
        defaultValue: "Rolling",
        serializedName: "UpgradeKind",
        type: {
          name: "String"
        }
      },
      updateDescription: {
        serializedName: "UpdateDescription",
        type: {
          name: "Composite",
          className: "RollingUpgradeUpdateDescription"
        }
      },
      clusterHealthPolicy: {
        serializedName: "ClusterHealthPolicy",
        type: {
          name: "Composite",
          className: "ClusterHealthPolicy"
        }
      },
      enableDeltaHealthEvaluation: {
        serializedName: "EnableDeltaHealthEvaluation",
        type: {
          name: "Boolean"
        }
      },
      clusterUpgradeHealthPolicy: {
        serializedName: "ClusterUpgradeHealthPolicy",
        type: {
          name: "Composite",
          className: "ClusterUpgradeHealthPolicyObject"
        }
      },
      applicationHealthPolicyMap: {
        serializedName: "ApplicationHealthPolicyMap",
        type: {
          name: "Composite",
          className: "ApplicationHealthPolicies"
        }
      }
    }
  }
};

export const RollingUpgradeUpdateDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "RollingUpgradeUpdateDescription",
    modelProperties: {
      rollingUpgradeMode: {
        defaultValue: "UnmonitoredAuto",
        serializedName: "RollingUpgradeMode",
        required: true,
        type: {
          name: "String"
        }
      },
      forceRestart: {
        defaultValue: false,
        serializedName: "ForceRestart",
        type: {
          name: "Boolean"
        }
      },
      replicaSetCheckTimeoutInMilliseconds: {
        defaultValue: 42949672925,
        serializedName: "ReplicaSetCheckTimeoutInMilliseconds",
        type: {
          name: "Number"
        }
      },
      failureAction: {
        serializedName: "FailureAction",
        type: {
          name: "String"
        }
      },
      healthCheckWaitDurationInMilliseconds: {
        defaultValue: "0",
        serializedName: "HealthCheckWaitDurationInMilliseconds",
        type: {
          name: "String"
        }
      },
      healthCheckStableDurationInMilliseconds: {
        defaultValue: "PT0H2M0S",
        serializedName: "HealthCheckStableDurationInMilliseconds",
        type: {
          name: "String"
        }
      },
      healthCheckRetryTimeoutInMilliseconds: {
        defaultValue: "PT0H10M0S",
        serializedName: "HealthCheckRetryTimeoutInMilliseconds",
        type: {
          name: "String"
        }
      },
      upgradeTimeoutInMilliseconds: {
        defaultValue: "P10675199DT02H48M05.4775807S",
        serializedName: "UpgradeTimeoutInMilliseconds",
        type: {
          name: "String"
        }
      },
      upgradeDomainTimeoutInMilliseconds: {
        defaultValue: "P10675199DT02H48M05.4775807S",
        serializedName: "UpgradeDomainTimeoutInMilliseconds",
        type: {
          name: "String"
        }
      },
      instanceCloseDelayDurationInSeconds: {
        defaultValue: 4294967295,
        serializedName: "InstanceCloseDelayDurationInSeconds",
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const AadMetadataObject: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "AadMetadataObject",
    modelProperties: {
      type: {
        serializedName: "type",
        type: {
          name: "String"
        }
      },
      metadata: {
        serializedName: "metadata",
        type: {
          name: "Composite",
          className: "AadMetadata"
        }
      }
    }
  }
};

export const AadMetadata: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "AadMetadata",
    modelProperties: {
      authority: {
        serializedName: "authority",
        type: {
          name: "String"
        }
      },
      client: {
        serializedName: "client",
        type: {
          name: "String"
        }
      },
      cluster: {
        serializedName: "cluster",
        type: {
          name: "String"
        }
      },
      login: {
        serializedName: "login",
        type: {
          name: "String"
        }
      },
      redirect: {
        serializedName: "redirect",
        type: {
          name: "String"
        }
      },
      tenant: {
        serializedName: "tenant",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ClusterVersion: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ClusterVersion",
    modelProperties: {
      version: {
        serializedName: "Version",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ClusterLoadInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ClusterLoadInfo",
    modelProperties: {
      lastBalancingStartTimeUtc: {
        serializedName: "LastBalancingStartTimeUtc",
        type: {
          name: "DateTime"
        }
      },
      lastBalancingEndTimeUtc: {
        serializedName: "LastBalancingEndTimeUtc",
        type: {
          name: "DateTime"
        }
      },
      loadMetricInformation: {
        serializedName: "LoadMetricInformation",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "LoadMetricInformation"
            }
          }
        }
      }
    }
  }
};

export const LoadMetricInformation: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "LoadMetricInformation",
    modelProperties: {
      name: {
        serializedName: "Name",
        type: {
          name: "String"
        }
      },
      isBalancedBefore: {
        serializedName: "IsBalancedBefore",
        type: {
          name: "Boolean"
        }
      },
      isBalancedAfter: {
        serializedName: "IsBalancedAfter",
        type: {
          name: "Boolean"
        }
      },
      deviationBefore: {
        serializedName: "DeviationBefore",
        type: {
          name: "String"
        }
      },
      deviationAfter: {
        serializedName: "DeviationAfter",
        type: {
          name: "String"
        }
      },
      balancingThreshold: {
        serializedName: "BalancingThreshold",
        type: {
          name: "String"
        }
      },
      action: {
        serializedName: "Action",
        type: {
          name: "String"
        }
      },
      activityThreshold: {
        serializedName: "ActivityThreshold",
        type: {
          name: "String"
        }
      },
      clusterCapacity: {
        serializedName: "ClusterCapacity",
        type: {
          name: "String"
        }
      },
      clusterLoad: {
        serializedName: "ClusterLoad",
        type: {
          name: "String"
        }
      },
      currentClusterLoad: {
        serializedName: "CurrentClusterLoad",
        type: {
          name: "String"
        }
      },
      clusterRemainingCapacity: {
        serializedName: "ClusterRemainingCapacity",
        type: {
          name: "String"
        }
      },
      clusterCapacityRemaining: {
        serializedName: "ClusterCapacityRemaining",
        type: {
          name: "String"
        }
      },
      isClusterCapacityViolation: {
        serializedName: "IsClusterCapacityViolation",
        type: {
          name: "Boolean"
        }
      },
      nodeBufferPercentage: {
        serializedName: "NodeBufferPercentage",
        type: {
          name: "String"
        }
      },
      clusterBufferedCapacity: {
        serializedName: "ClusterBufferedCapacity",
        type: {
          name: "String"
        }
      },
      bufferedClusterCapacityRemaining: {
        serializedName: "BufferedClusterCapacityRemaining",
        type: {
          name: "String"
        }
      },
      clusterRemainingBufferedCapacity: {
        serializedName: "ClusterRemainingBufferedCapacity",
        type: {
          name: "String"
        }
      },
      minNodeLoadValue: {
        serializedName: "MinNodeLoadValue",
        type: {
          name: "String"
        }
      },
      minimumNodeLoad: {
        serializedName: "MinimumNodeLoad",
        type: {
          name: "String"
        }
      },
      minNodeLoadNodeId: {
        serializedName: "MinNodeLoadNodeId",
        type: {
          name: "Composite",
          className: "NodeId"
        }
      },
      maxNodeLoadValue: {
        serializedName: "MaxNodeLoadValue",
        type: {
          name: "String"
        }
      },
      maximumNodeLoad: {
        serializedName: "MaximumNodeLoad",
        type: {
          name: "String"
        }
      },
      maxNodeLoadNodeId: {
        serializedName: "MaxNodeLoadNodeId",
        type: {
          name: "Composite",
          className: "NodeId"
        }
      },
      plannedLoadRemoval: {
        serializedName: "PlannedLoadRemoval",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ValidateClusterUpgradeResult: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ValidateClusterUpgradeResult",
    modelProperties: {
      serviceHostUpgradeImpact: {
        serializedName: "ServiceHostUpgradeImpact",
        type: {
          name: "String"
        }
      },
      validationDetails: {
        serializedName: "ValidationDetails",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const PagedNodeInfoList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PagedNodeInfoList",
    modelProperties: {
      continuationToken: {
        serializedName: "ContinuationToken",
        type: {
          name: "String"
        }
      },
      items: {
        serializedName: "Items",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "NodeInfo"
            }
          }
        }
      }
    }
  }
};

export const NodeInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "NodeInfo",
    modelProperties: {
      name: {
        serializedName: "Name",
        type: {
          name: "String"
        }
      },
      ipAddressOrFqdn: {
        serializedName: "IpAddressOrFQDN",
        type: {
          name: "String"
        }
      },
      type: {
        serializedName: "Type",
        type: {
          name: "String"
        }
      },
      codeVersion: {
        serializedName: "CodeVersion",
        type: {
          name: "String"
        }
      },
      configVersion: {
        serializedName: "ConfigVersion",
        type: {
          name: "String"
        }
      },
      nodeStatus: {
        serializedName: "NodeStatus",
        type: {
          name: "String"
        }
      },
      nodeUpTimeInSeconds: {
        serializedName: "NodeUpTimeInSeconds",
        type: {
          name: "String"
        }
      },
      healthState: {
        serializedName: "HealthState",
        type: {
          name: "String"
        }
      },
      isSeedNode: {
        serializedName: "IsSeedNode",
        type: {
          name: "Boolean"
        }
      },
      upgradeDomain: {
        serializedName: "UpgradeDomain",
        type: {
          name: "String"
        }
      },
      faultDomain: {
        serializedName: "FaultDomain",
        type: {
          name: "String"
        }
      },
      id: {
        serializedName: "Id",
        type: {
          name: "Composite",
          className: "NodeId"
        }
      },
      instanceId: {
        serializedName: "InstanceId",
        type: {
          name: "String"
        }
      },
      nodeDeactivationInfo: {
        serializedName: "NodeDeactivationInfo",
        type: {
          name: "Composite",
          className: "NodeDeactivationInfo"
        }
      },
      isStopped: {
        serializedName: "IsStopped",
        type: {
          name: "Boolean"
        }
      },
      nodeDownTimeInSeconds: {
        serializedName: "NodeDownTimeInSeconds",
        type: {
          name: "String"
        }
      },
      nodeUpAt: {
        serializedName: "NodeUpAt",
        type: {
          name: "DateTime"
        }
      },
      nodeDownAt: {
        serializedName: "NodeDownAt",
        type: {
          name: "DateTime"
        }
      },
      nodeTags: {
        serializedName: "NodeTags",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "String"
            }
          }
        }
      },
      isNodeByNodeUpgradeInProgress: {
        serializedName: "IsNodeByNodeUpgradeInProgress",
        type: {
          name: "Boolean"
        }
      },
      infrastructurePlacementID: {
        serializedName: "InfrastructurePlacementID",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const NodeDeactivationInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "NodeDeactivationInfo",
    modelProperties: {
      nodeDeactivationIntent: {
        serializedName: "NodeDeactivationIntent",
        type: {
          name: "String"
        }
      },
      nodeDeactivationStatus: {
        serializedName: "NodeDeactivationStatus",
        type: {
          name: "String"
        }
      },
      nodeDeactivationTask: {
        serializedName: "NodeDeactivationTask",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "NodeDeactivationTask"
            }
          }
        }
      },
      pendingSafetyChecks: {
        serializedName: "PendingSafetyChecks",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "SafetyCheckWrapper"
            }
          }
        }
      }
    }
  }
};

export const NodeDeactivationTask: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "NodeDeactivationTask",
    modelProperties: {
      nodeDeactivationTaskId: {
        serializedName: "NodeDeactivationTaskId",
        type: {
          name: "Composite",
          className: "NodeDeactivationTaskId"
        }
      },
      nodeDeactivationIntent: {
        serializedName: "NodeDeactivationIntent",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const NodeDeactivationTaskId: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "NodeDeactivationTaskId",
    modelProperties: {
      id: {
        serializedName: "Id",
        type: {
          name: "String"
        }
      },
      nodeDeactivationTaskType: {
        serializedName: "NodeDeactivationTaskType",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const NodeLoadInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "NodeLoadInfo",
    modelProperties: {
      nodeName: {
        serializedName: "NodeName",
        type: {
          name: "String"
        }
      },
      nodeLoadMetricInformation: {
        serializedName: "NodeLoadMetricInformation",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "NodeLoadMetricInformation"
            }
          }
        }
      }
    }
  }
};

export const NodeLoadMetricInformation: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "NodeLoadMetricInformation",
    modelProperties: {
      name: {
        serializedName: "Name",
        type: {
          name: "String"
        }
      },
      nodeCapacity: {
        serializedName: "NodeCapacity",
        type: {
          name: "String"
        }
      },
      nodeLoad: {
        serializedName: "NodeLoad",
        type: {
          name: "String"
        }
      },
      nodeRemainingCapacity: {
        serializedName: "NodeRemainingCapacity",
        type: {
          name: "String"
        }
      },
      isCapacityViolation: {
        serializedName: "IsCapacityViolation",
        type: {
          name: "Boolean"
        }
      },
      nodeBufferedCapacity: {
        serializedName: "NodeBufferedCapacity",
        type: {
          name: "String"
        }
      },
      nodeRemainingBufferedCapacity: {
        serializedName: "NodeRemainingBufferedCapacity",
        type: {
          name: "String"
        }
      },
      currentNodeLoad: {
        serializedName: "CurrentNodeLoad",
        type: {
          name: "String"
        }
      },
      nodeCapacityRemaining: {
        serializedName: "NodeCapacityRemaining",
        type: {
          name: "String"
        }
      },
      bufferedNodeCapacityRemaining: {
        serializedName: "BufferedNodeCapacityRemaining",
        type: {
          name: "String"
        }
      },
      plannedNodeLoadRemoval: {
        serializedName: "PlannedNodeLoadRemoval",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const DeactivationIntentDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "DeactivationIntentDescription",
    modelProperties: {
      deactivationIntent: {
        serializedName: "DeactivationIntent",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const RestartNodeDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "RestartNodeDescription",
    modelProperties: {
      nodeInstanceId: {
        defaultValue: "0",
        serializedName: "NodeInstanceId",
        required: true,
        type: {
          name: "String"
        }
      },
      createFabricDump: {
        defaultValue: "False",
        serializedName: "CreateFabricDump",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ConfigParameterOverride: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ConfigParameterOverride",
    modelProperties: {
      sectionName: {
        serializedName: "SectionName",
        required: true,
        type: {
          name: "String"
        }
      },
      parameterName: {
        serializedName: "ParameterName",
        required: true,
        type: {
          name: "String"
        }
      },
      parameterValue: {
        serializedName: "ParameterValue",
        required: true,
        type: {
          name: "String"
        }
      },
      timeout: {
        serializedName: "Timeout",
        type: {
          name: "TimeSpan"
        }
      },
      persistAcrossUpgrade: {
        serializedName: "PersistAcrossUpgrade",
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const PagedApplicationTypeInfoList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PagedApplicationTypeInfoList",
    modelProperties: {
      continuationToken: {
        serializedName: "ContinuationToken",
        type: {
          name: "String"
        }
      },
      items: {
        serializedName: "Items",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ApplicationTypeInfo"
            }
          }
        }
      }
    }
  }
};

export const ApplicationTypeInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationTypeInfo",
    modelProperties: {
      name: {
        serializedName: "Name",
        type: {
          name: "String"
        }
      },
      version: {
        serializedName: "Version",
        type: {
          name: "String"
        }
      },
      defaultParameterList: {
        serializedName: "DefaultParameterList",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ApplicationParameter"
            }
          }
        }
      },
      status: {
        serializedName: "Status",
        type: {
          name: "String"
        }
      },
      statusDetails: {
        serializedName: "StatusDetails",
        type: {
          name: "String"
        }
      },
      applicationTypeDefinitionKind: {
        serializedName: "ApplicationTypeDefinitionKind",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ApplicationParameter: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationParameter",
    modelProperties: {
      key: {
        serializedName: "Key",
        required: true,
        type: {
          name: "String"
        }
      },
      value: {
        serializedName: "Value",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ProvisionApplicationTypeDescriptionBase: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ProvisionApplicationTypeDescriptionBase",
    uberParent: "ProvisionApplicationTypeDescriptionBase",
    polymorphicDiscriminator: {
      serializedName: "Kind",
      clientName: "kind"
    },
    modelProperties: {
      kind: {
        serializedName: "Kind",
        required: true,
        type: {
          name: "String"
        }
      },
      async: {
        serializedName: "Async",
        required: true,
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const UnprovisionApplicationTypeDescriptionInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "UnprovisionApplicationTypeDescriptionInfo",
    modelProperties: {
      applicationTypeVersion: {
        serializedName: "ApplicationTypeVersion",
        required: true,
        type: {
          name: "String"
        }
      },
      async: {
        serializedName: "Async",
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const ServiceTypeInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceTypeInfo",
    modelProperties: {
      serviceTypeDescription: {
        serializedName: "ServiceTypeDescription",
        type: {
          name: "Composite",
          className: "ServiceTypeDescription"
        }
      },
      serviceManifestName: {
        serializedName: "ServiceManifestName",
        type: {
          name: "String"
        }
      },
      serviceManifestVersion: {
        serializedName: "ServiceManifestVersion",
        type: {
          name: "String"
        }
      },
      isServiceGroup: {
        serializedName: "IsServiceGroup",
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const ServiceTypeDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceTypeDescription",
    uberParent: "ServiceTypeDescription",
    polymorphicDiscriminator: {
      serializedName: "Kind",
      clientName: "kind"
    },
    modelProperties: {
      kind: {
        serializedName: "Kind",
        required: true,
        type: {
          name: "String"
        }
      },
      isStateful: {
        serializedName: "IsStateful",
        type: {
          name: "Boolean"
        }
      },
      serviceTypeName: {
        serializedName: "ServiceTypeName",
        type: {
          name: "String"
        }
      },
      placementConstraints: {
        serializedName: "PlacementConstraints",
        type: {
          name: "String"
        }
      },
      loadMetrics: {
        serializedName: "LoadMetrics",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ServiceLoadMetricDescription"
            }
          }
        }
      },
      servicePlacementPolicies: {
        serializedName: "ServicePlacementPolicies",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ServicePlacementPolicyDescription"
            }
          }
        }
      },
      extensions: {
        serializedName: "Extensions",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ServiceTypeExtensionDescription"
            }
          }
        }
      }
    }
  }
};

export const ServiceLoadMetricDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceLoadMetricDescription",
    modelProperties: {
      name: {
        serializedName: "Name",
        required: true,
        type: {
          name: "String"
        }
      },
      weight: {
        serializedName: "Weight",
        type: {
          name: "String"
        }
      },
      primaryDefaultLoad: {
        serializedName: "PrimaryDefaultLoad",
        type: {
          name: "Number"
        }
      },
      secondaryDefaultLoad: {
        serializedName: "SecondaryDefaultLoad",
        type: {
          name: "Number"
        }
      },
      auxiliaryDefaultLoad: {
        serializedName: "AuxiliaryDefaultLoad",
        type: {
          name: "Number"
        }
      },
      defaultLoad: {
        serializedName: "DefaultLoad",
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ServicePlacementPolicyDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServicePlacementPolicyDescription",
    uberParent: "ServicePlacementPolicyDescription",
    polymorphicDiscriminator: {
      serializedName: "Type",
      clientName: "type"
    },
    modelProperties: {
      type: {
        serializedName: "Type",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ServiceTypeExtensionDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceTypeExtensionDescription",
    modelProperties: {
      key: {
        serializedName: "Key",
        type: {
          name: "String"
        }
      },
      value: {
        serializedName: "Value",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ServiceTypeManifest: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceTypeManifest",
    modelProperties: {
      manifest: {
        serializedName: "Manifest",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const DeployedServiceTypeInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "DeployedServiceTypeInfo",
    modelProperties: {
      serviceTypeName: {
        serializedName: "ServiceTypeName",
        type: {
          name: "String"
        }
      },
      serviceManifestName: {
        serializedName: "ServiceManifestName",
        type: {
          name: "String"
        }
      },
      codePackageName: {
        serializedName: "CodePackageName",
        type: {
          name: "String"
        }
      },
      status: {
        serializedName: "Status",
        type: {
          name: "String"
        }
      },
      servicePackageActivationId: {
        serializedName: "ServicePackageActivationId",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ApplicationDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationDescription",
    modelProperties: {
      name: {
        serializedName: "Name",
        required: true,
        type: {
          name: "String"
        }
      },
      typeName: {
        serializedName: "TypeName",
        required: true,
        type: {
          name: "String"
        }
      },
      typeVersion: {
        serializedName: "TypeVersion",
        required: true,
        type: {
          name: "String"
        }
      },
      parameterList: {
        serializedName: "ParameterList",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ApplicationParameter"
            }
          }
        }
      },
      applicationCapacity: {
        serializedName: "ApplicationCapacity",
        type: {
          name: "Composite",
          className: "ApplicationCapacityDescription"
        }
      },
      managedApplicationIdentity: {
        serializedName: "ManagedApplicationIdentity",
        type: {
          name: "Composite",
          className: "ManagedApplicationIdentityDescription"
        }
      }
    }
  }
};

export const ApplicationCapacityDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationCapacityDescription",
    modelProperties: {
      minimumNodes: {
        constraints: {
          InclusiveMinimum: 0
        },
        serializedName: "MinimumNodes",
        type: {
          name: "Number"
        }
      },
      maximumNodes: {
        defaultValue: 0,
        constraints: {
          InclusiveMinimum: 0
        },
        serializedName: "MaximumNodes",
        type: {
          name: "Number"
        }
      },
      applicationMetrics: {
        serializedName: "ApplicationMetrics",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ApplicationMetricDescription"
            }
          }
        }
      }
    }
  }
};

export const ApplicationMetricDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationMetricDescription",
    modelProperties: {
      name: {
        serializedName: "Name",
        type: {
          name: "String"
        }
      },
      maximumCapacity: {
        serializedName: "MaximumCapacity",
        type: {
          name: "Number"
        }
      },
      reservationCapacity: {
        serializedName: "ReservationCapacity",
        type: {
          name: "Number"
        }
      },
      totalApplicationCapacity: {
        serializedName: "TotalApplicationCapacity",
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ManagedApplicationIdentityDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ManagedApplicationIdentityDescription",
    modelProperties: {
      tokenServiceEndpoint: {
        serializedName: "TokenServiceEndpoint",
        type: {
          name: "String"
        }
      },
      managedIdentities: {
        serializedName: "ManagedIdentities",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ManagedApplicationIdentity"
            }
          }
        }
      }
    }
  }
};

export const ManagedApplicationIdentity: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ManagedApplicationIdentity",
    modelProperties: {
      name: {
        serializedName: "Name",
        required: true,
        type: {
          name: "String"
        }
      },
      principalId: {
        serializedName: "PrincipalId",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ApplicationLoadInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationLoadInfo",
    modelProperties: {
      id: {
        serializedName: "Id",
        type: {
          name: "String"
        }
      },
      minimumNodes: {
        serializedName: "MinimumNodes",
        type: {
          name: "Number"
        }
      },
      maximumNodes: {
        serializedName: "MaximumNodes",
        type: {
          name: "Number"
        }
      },
      nodeCount: {
        serializedName: "NodeCount",
        type: {
          name: "Number"
        }
      },
      applicationLoadMetricInformation: {
        serializedName: "ApplicationLoadMetricInformation",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ApplicationLoadMetricInformation"
            }
          }
        }
      }
    }
  }
};

export const ApplicationLoadMetricInformation: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationLoadMetricInformation",
    modelProperties: {
      name: {
        serializedName: "Name",
        type: {
          name: "String"
        }
      },
      reservationCapacity: {
        serializedName: "ReservationCapacity",
        type: {
          name: "Number"
        }
      },
      applicationCapacity: {
        serializedName: "ApplicationCapacity",
        type: {
          name: "Number"
        }
      },
      applicationLoad: {
        serializedName: "ApplicationLoad",
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const PagedApplicationInfoList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PagedApplicationInfoList",
    modelProperties: {
      continuationToken: {
        serializedName: "ContinuationToken",
        type: {
          name: "String"
        }
      },
      items: {
        serializedName: "Items",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ApplicationInfo"
            }
          }
        }
      }
    }
  }
};

export const ApplicationInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationInfo",
    modelProperties: {
      id: {
        serializedName: "Id",
        type: {
          name: "String"
        }
      },
      name: {
        serializedName: "Name",
        type: {
          name: "String"
        }
      },
      typeName: {
        serializedName: "TypeName",
        type: {
          name: "String"
        }
      },
      typeVersion: {
        serializedName: "TypeVersion",
        type: {
          name: "String"
        }
      },
      status: {
        serializedName: "Status",
        type: {
          name: "String"
        }
      },
      parameters: {
        serializedName: "Parameters",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ApplicationParameter"
            }
          }
        }
      },
      healthState: {
        serializedName: "HealthState",
        type: {
          name: "String"
        }
      },
      applicationDefinitionKind: {
        serializedName: "ApplicationDefinitionKind",
        type: {
          name: "String"
        }
      },
      managedApplicationIdentity: {
        serializedName: "ManagedApplicationIdentity",
        type: {
          name: "Composite",
          className: "ManagedApplicationIdentityDescription"
        }
      }
    }
  }
};

export const ApplicationUpgradeDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationUpgradeDescription",
    modelProperties: {
      name: {
        serializedName: "Name",
        required: true,
        type: {
          name: "String"
        }
      },
      targetApplicationTypeVersion: {
        serializedName: "TargetApplicationTypeVersion",
        required: true,
        type: {
          name: "String"
        }
      },
      parameters: {
        serializedName: "Parameters",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ApplicationParameter"
            }
          }
        }
      },
      upgradeKind: {
        defaultValue: "Rolling",
        serializedName: "UpgradeKind",
        required: true,
        type: {
          name: "String"
        }
      },
      rollingUpgradeMode: {
        defaultValue: "UnmonitoredAuto",
        serializedName: "RollingUpgradeMode",
        type: {
          name: "String"
        }
      },
      upgradeReplicaSetCheckTimeoutInSeconds: {
        defaultValue: 42949672925,
        serializedName: "UpgradeReplicaSetCheckTimeoutInSeconds",
        type: {
          name: "Number"
        }
      },
      forceRestart: {
        defaultValue: false,
        serializedName: "ForceRestart",
        type: {
          name: "Boolean"
        }
      },
      sortOrder: {
        defaultValue: "Default",
        serializedName: "SortOrder",
        type: {
          name: "String"
        }
      },
      monitoringPolicy: {
        serializedName: "MonitoringPolicy",
        type: {
          name: "Composite",
          className: "MonitoringPolicyDescription"
        }
      },
      applicationHealthPolicy: {
        serializedName: "ApplicationHealthPolicy",
        type: {
          name: "Composite",
          className: "ApplicationHealthPolicy"
        }
      },
      instanceCloseDelayDurationInSeconds: {
        defaultValue: 4294967295,
        serializedName: "InstanceCloseDelayDurationInSeconds",
        type: {
          name: "Number"
        }
      },
      managedApplicationIdentity: {
        serializedName: "ManagedApplicationIdentity",
        type: {
          name: "Composite",
          className: "ManagedApplicationIdentityDescription"
        }
      }
    }
  }
};

export const ApplicationUpgradeProgressInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationUpgradeProgressInfo",
    modelProperties: {
      name: {
        serializedName: "Name",
        type: {
          name: "String"
        }
      },
      typeName: {
        serializedName: "TypeName",
        type: {
          name: "String"
        }
      },
      targetApplicationTypeVersion: {
        serializedName: "TargetApplicationTypeVersion",
        type: {
          name: "String"
        }
      },
      upgradeDomains: {
        serializedName: "UpgradeDomains",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "UpgradeDomainInfo"
            }
          }
        }
      },
      upgradeUnits: {
        serializedName: "UpgradeUnits",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "UpgradeUnitInfo"
            }
          }
        }
      },
      upgradeState: {
        serializedName: "UpgradeState",
        type: {
          name: "String"
        }
      },
      nextUpgradeDomain: {
        serializedName: "NextUpgradeDomain",
        type: {
          name: "String"
        }
      },
      rollingUpgradeMode: {
        defaultValue: "UnmonitoredAuto",
        serializedName: "RollingUpgradeMode",
        type: {
          name: "String"
        }
      },
      upgradeDescription: {
        serializedName: "UpgradeDescription",
        type: {
          name: "Composite",
          className: "ApplicationUpgradeDescription"
        }
      },
      upgradeDurationInMilliseconds: {
        serializedName: "UpgradeDurationInMilliseconds",
        type: {
          name: "String"
        }
      },
      upgradeDomainDurationInMilliseconds: {
        serializedName: "UpgradeDomainDurationInMilliseconds",
        type: {
          name: "String"
        }
      },
      unhealthyEvaluations: {
        serializedName: "UnhealthyEvaluations",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HealthEvaluationWrapper"
            }
          }
        }
      },
      currentUpgradeDomainProgress: {
        serializedName: "CurrentUpgradeDomainProgress",
        type: {
          name: "Composite",
          className: "CurrentUpgradeDomainProgressInfo"
        }
      },
      currentUpgradeUnitsProgress: {
        serializedName: "CurrentUpgradeUnitsProgress",
        type: {
          name: "Composite",
          className: "CurrentUpgradeUnitsProgressInfo"
        }
      },
      startTimestampUtc: {
        serializedName: "StartTimestampUtc",
        type: {
          name: "String"
        }
      },
      failureTimestampUtc: {
        serializedName: "FailureTimestampUtc",
        type: {
          name: "String"
        }
      },
      failureReason: {
        serializedName: "FailureReason",
        type: {
          name: "String"
        }
      },
      upgradeDomainProgressAtFailure: {
        serializedName: "UpgradeDomainProgressAtFailure",
        type: {
          name: "Composite",
          className: "FailureUpgradeDomainProgressInfo"
        }
      },
      upgradeStatusDetails: {
        serializedName: "UpgradeStatusDetails",
        type: {
          name: "String"
        }
      },
      isNodeByNode: {
        defaultValue: false,
        serializedName: "IsNodeByNode",
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const FailureUpgradeDomainProgressInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "FailureUpgradeDomainProgressInfo",
    modelProperties: {
      domainName: {
        serializedName: "DomainName",
        type: {
          name: "String"
        }
      },
      nodeUpgradeProgressList: {
        serializedName: "NodeUpgradeProgressList",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "NodeUpgradeProgressInfo"
            }
          }
        }
      }
    }
  }
};

export const ApplicationUpgradeUpdateDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationUpgradeUpdateDescription",
    modelProperties: {
      name: {
        serializedName: "Name",
        required: true,
        type: {
          name: "String"
        }
      },
      upgradeKind: {
        defaultValue: "Rolling",
        serializedName: "UpgradeKind",
        required: true,
        type: {
          name: "String"
        }
      },
      applicationHealthPolicy: {
        serializedName: "ApplicationHealthPolicy",
        type: {
          name: "Composite",
          className: "ApplicationHealthPolicy"
        }
      },
      updateDescription: {
        serializedName: "UpdateDescription",
        type: {
          name: "Composite",
          className: "RollingUpgradeUpdateDescription"
        }
      }
    }
  }
};

export const ApplicationUpdateDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationUpdateDescription",
    modelProperties: {
      flags: {
        serializedName: "Flags",
        type: {
          name: "String"
        }
      },
      removeApplicationCapacity: {
        defaultValue: false,
        serializedName: "RemoveApplicationCapacity",
        type: {
          name: "Boolean"
        }
      },
      minimumNodes: {
        constraints: {
          InclusiveMinimum: 0
        },
        serializedName: "MinimumNodes",
        type: {
          name: "Number"
        }
      },
      maximumNodes: {
        defaultValue: 0,
        constraints: {
          InclusiveMinimum: 0
        },
        serializedName: "MaximumNodes",
        type: {
          name: "Number"
        }
      },
      applicationMetrics: {
        serializedName: "ApplicationMetrics",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ApplicationMetricDescription"
            }
          }
        }
      }
    }
  }
};

export const ResumeApplicationUpgradeDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ResumeApplicationUpgradeDescription",
    modelProperties: {
      upgradeDomainName: {
        serializedName: "UpgradeDomainName",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const PagedDeployedApplicationInfoList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PagedDeployedApplicationInfoList",
    modelProperties: {
      continuationToken: {
        serializedName: "ContinuationToken",
        type: {
          name: "String"
        }
      },
      items: {
        serializedName: "Items",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "DeployedApplicationInfo"
            }
          }
        }
      }
    }
  }
};

export const DeployedApplicationInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "DeployedApplicationInfo",
    modelProperties: {
      id: {
        serializedName: "Id",
        type: {
          name: "String"
        }
      },
      name: {
        serializedName: "Name",
        type: {
          name: "String"
        }
      },
      typeName: {
        serializedName: "TypeName",
        type: {
          name: "String"
        }
      },
      typeVersion: {
        serializedName: "TypeVersion",
        type: {
          name: "String"
        }
      },
      status: {
        serializedName: "Status",
        type: {
          name: "String"
        }
      },
      workDirectory: {
        serializedName: "WorkDirectory",
        type: {
          name: "String"
        }
      },
      logDirectory: {
        serializedName: "LogDirectory",
        type: {
          name: "String"
        }
      },
      tempDirectory: {
        serializedName: "TempDirectory",
        type: {
          name: "String"
        }
      },
      healthState: {
        serializedName: "HealthState",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ApplicationTypeManifest: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationTypeManifest",
    modelProperties: {
      manifest: {
        serializedName: "Manifest",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const PagedServiceInfoList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PagedServiceInfoList",
    modelProperties: {
      continuationToken: {
        serializedName: "ContinuationToken",
        type: {
          name: "String"
        }
      },
      items: {
        serializedName: "Items",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ServiceInfo"
            }
          }
        }
      }
    }
  }
};

export const ServiceInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceInfo",
    uberParent: "ServiceInfo",
    polymorphicDiscriminator: {
      serializedName: "ServiceKind",
      clientName: "serviceKind"
    },
    modelProperties: {
      id: {
        serializedName: "Id",
        type: {
          name: "String"
        }
      },
      serviceKind: {
        serializedName: "ServiceKind",
        required: true,
        type: {
          name: "String"
        }
      },
      name: {
        serializedName: "Name",
        type: {
          name: "String"
        }
      },
      typeName: {
        serializedName: "TypeName",
        type: {
          name: "String"
        }
      },
      manifestVersion: {
        serializedName: "ManifestVersion",
        type: {
          name: "String"
        }
      },
      healthState: {
        serializedName: "HealthState",
        type: {
          name: "String"
        }
      },
      serviceStatus: {
        serializedName: "ServiceStatus",
        type: {
          name: "String"
        }
      },
      isServiceGroup: {
        serializedName: "IsServiceGroup",
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const ApplicationNameInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationNameInfo",
    modelProperties: {
      id: {
        serializedName: "Id",
        type: {
          name: "String"
        }
      },
      name: {
        serializedName: "Name",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ServiceDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceDescription",
    uberParent: "ServiceDescription",
    polymorphicDiscriminator: {
      serializedName: "ServiceKind",
      clientName: "serviceKind"
    },
    modelProperties: {
      serviceKind: {
        serializedName: "ServiceKind",
        required: true,
        type: {
          name: "String"
        }
      },
      applicationName: {
        serializedName: "ApplicationName",
        type: {
          name: "String"
        }
      },
      serviceName: {
        serializedName: "ServiceName",
        required: true,
        type: {
          name: "String"
        }
      },
      serviceTypeName: {
        serializedName: "ServiceTypeName",
        required: true,
        type: {
          name: "String"
        }
      },
      initializationData: {
        serializedName: "InitializationData",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Number"
            }
          }
        }
      },
      partitionDescription: {
        serializedName: "PartitionDescription",
        type: {
          name: "Composite",
          className: "PartitionSchemeDescription"
        }
      },
      placementConstraints: {
        serializedName: "PlacementConstraints",
        type: {
          name: "String"
        }
      },
      correlationScheme: {
        serializedName: "CorrelationScheme",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ServiceCorrelationDescription"
            }
          }
        }
      },
      serviceLoadMetrics: {
        serializedName: "ServiceLoadMetrics",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ServiceLoadMetricDescription"
            }
          }
        }
      },
      servicePlacementPolicies: {
        serializedName: "ServicePlacementPolicies",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ServicePlacementPolicyDescription"
            }
          }
        }
      },
      defaultMoveCost: {
        serializedName: "DefaultMoveCost",
        type: {
          name: "String"
        }
      },
      isDefaultMoveCostSpecified: {
        serializedName: "IsDefaultMoveCostSpecified",
        type: {
          name: "Boolean"
        }
      },
      servicePackageActivationMode: {
        serializedName: "ServicePackageActivationMode",
        type: {
          name: "String"
        }
      },
      serviceDnsName: {
        serializedName: "ServiceDnsName",
        type: {
          name: "String"
        }
      },
      scalingPolicies: {
        serializedName: "ScalingPolicies",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ScalingPolicyDescription"
            }
          }
        }
      },
      tagsRequiredToPlace: {
        serializedName: "TagsRequiredToPlace",
        type: {
          name: "Composite",
          className: "NodeTagsDescription"
        }
      },
      tagsRequiredToRun: {
        serializedName: "TagsRequiredToRun",
        type: {
          name: "Composite",
          className: "NodeTagsDescription"
        }
      }
    }
  }
};

export const PartitionSchemeDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PartitionSchemeDescription",
    uberParent: "PartitionSchemeDescription",
    polymorphicDiscriminator: {
      serializedName: "PartitionScheme",
      clientName: "partitionScheme"
    },
    modelProperties: {
      partitionScheme: {
        serializedName: "PartitionScheme",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ServiceCorrelationDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceCorrelationDescription",
    modelProperties: {
      scheme: {
        serializedName: "Scheme",
        required: true,
        type: {
          name: "String"
        }
      },
      serviceName: {
        serializedName: "ServiceName",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ScalingPolicyDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ScalingPolicyDescription",
    modelProperties: {
      scalingTrigger: {
        serializedName: "ScalingTrigger",
        type: {
          name: "Composite",
          className: "ScalingTriggerDescription"
        }
      },
      scalingMechanism: {
        serializedName: "ScalingMechanism",
        type: {
          name: "Composite",
          className: "ScalingMechanismDescription"
        }
      }
    }
  }
};

export const ScalingTriggerDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ScalingTriggerDescription",
    uberParent: "ScalingTriggerDescription",
    polymorphicDiscriminator: {
      serializedName: "Kind",
      clientName: "kind"
    },
    modelProperties: {
      kind: {
        serializedName: "Kind",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ScalingMechanismDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ScalingMechanismDescription",
    uberParent: "ScalingMechanismDescription",
    polymorphicDiscriminator: {
      serializedName: "Kind",
      clientName: "kind"
    },
    modelProperties: {
      kind: {
        serializedName: "Kind",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const NodeTagsDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "NodeTagsDescription",
    modelProperties: {
      count: {
        serializedName: "Count",
        required: true,
        type: {
          name: "Number"
        }
      },
      tags: {
        serializedName: "Tags",
        required: true,
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "String"
            }
          }
        }
      }
    }
  }
};

export const ServiceFromTemplateDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceFromTemplateDescription",
    modelProperties: {
      applicationName: {
        serializedName: "ApplicationName",
        required: true,
        type: {
          name: "String"
        }
      },
      serviceName: {
        serializedName: "ServiceName",
        required: true,
        type: {
          name: "String"
        }
      },
      serviceTypeName: {
        serializedName: "ServiceTypeName",
        required: true,
        type: {
          name: "String"
        }
      },
      initializationData: {
        serializedName: "InitializationData",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Number"
            }
          }
        }
      },
      servicePackageActivationMode: {
        serializedName: "ServicePackageActivationMode",
        type: {
          name: "String"
        }
      },
      serviceDnsName: {
        serializedName: "ServiceDnsName",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ServiceUpdateDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceUpdateDescription",
    uberParent: "ServiceUpdateDescription",
    polymorphicDiscriminator: {
      serializedName: "ServiceKind",
      clientName: "serviceKind"
    },
    modelProperties: {
      serviceKind: {
        serializedName: "ServiceKind",
        required: true,
        type: {
          name: "String"
        }
      },
      flags: {
        serializedName: "Flags",
        type: {
          name: "String"
        }
      },
      placementConstraints: {
        serializedName: "PlacementConstraints",
        type: {
          name: "String"
        }
      },
      correlationScheme: {
        serializedName: "CorrelationScheme",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ServiceCorrelationDescription"
            }
          }
        }
      },
      loadMetrics: {
        serializedName: "LoadMetrics",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ServiceLoadMetricDescription"
            }
          }
        }
      },
      servicePlacementPolicies: {
        serializedName: "ServicePlacementPolicies",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ServicePlacementPolicyDescription"
            }
          }
        }
      },
      defaultMoveCost: {
        serializedName: "DefaultMoveCost",
        type: {
          name: "String"
        }
      },
      scalingPolicies: {
        serializedName: "ScalingPolicies",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ScalingPolicyDescription"
            }
          }
        }
      },
      serviceDnsName: {
        serializedName: "ServiceDnsName",
        type: {
          name: "String"
        }
      },
      tagsForPlacement: {
        serializedName: "TagsForPlacement",
        type: {
          name: "Composite",
          className: "NodeTagsDescription"
        }
      },
      tagsForRunning: {
        serializedName: "TagsForRunning",
        type: {
          name: "Composite",
          className: "NodeTagsDescription"
        }
      }
    }
  }
};

export const ResolvedServicePartition: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ResolvedServicePartition",
    modelProperties: {
      name: {
        serializedName: "Name",
        required: true,
        type: {
          name: "String"
        }
      },
      partitionInformation: {
        serializedName: "PartitionInformation",
        type: {
          name: "Composite",
          className: "PartitionInformation"
        }
      },
      endpoints: {
        serializedName: "Endpoints",
        required: true,
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ResolvedServiceEndpoint"
            }
          }
        }
      },
      version: {
        serializedName: "Version",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const PartitionInformation: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PartitionInformation",
    uberParent: "PartitionInformation",
    polymorphicDiscriminator: {
      serializedName: "ServicePartitionKind",
      clientName: "servicePartitionKind"
    },
    modelProperties: {
      servicePartitionKind: {
        serializedName: "ServicePartitionKind",
        required: true,
        type: {
          name: "String"
        }
      },
      id: {
        serializedName: "Id",
        type: {
          name: "Uuid"
        }
      }
    }
  }
};

export const ResolvedServiceEndpoint: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ResolvedServiceEndpoint",
    modelProperties: {
      kind: {
        serializedName: "Kind",
        type: {
          name: "String"
        }
      },
      address: {
        serializedName: "Address",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const UnplacedReplicaInformation: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "UnplacedReplicaInformation",
    modelProperties: {
      serviceName: {
        serializedName: "ServiceName",
        type: {
          name: "String"
        }
      },
      partitionId: {
        serializedName: "PartitionId",
        type: {
          name: "Uuid"
        }
      },
      unplacedReplicaDetails: {
        serializedName: "UnplacedReplicaDetails",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "String"
            }
          }
        }
      }
    }
  }
};

export const LoadedPartitionInformationResultList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "LoadedPartitionInformationResultList",
    modelProperties: {
      continuationToken: {
        serializedName: "ContinuationToken",
        type: {
          name: "String"
        }
      },
      items: {
        serializedName: "Items",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "LoadedPartitionInformationResult"
            }
          }
        }
      }
    }
  }
};

export const LoadedPartitionInformationResult: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "LoadedPartitionInformationResult",
    modelProperties: {
      serviceName: {
        serializedName: "ServiceName",
        required: true,
        type: {
          name: "String"
        }
      },
      partitionId: {
        serializedName: "PartitionId",
        required: true,
        type: {
          name: "Uuid"
        }
      },
      metricName: {
        serializedName: "MetricName",
        required: true,
        type: {
          name: "String"
        }
      },
      load: {
        serializedName: "Load",
        required: true,
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const PagedServicePartitionInfoList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PagedServicePartitionInfoList",
    modelProperties: {
      continuationToken: {
        serializedName: "ContinuationToken",
        type: {
          name: "String"
        }
      },
      items: {
        serializedName: "Items",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ServicePartitionInfo"
            }
          }
        }
      }
    }
  }
};

export const ServicePartitionInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServicePartitionInfo",
    uberParent: "ServicePartitionInfo",
    polymorphicDiscriminator: {
      serializedName: "ServiceKind",
      clientName: "serviceKind"
    },
    modelProperties: {
      serviceKind: {
        serializedName: "ServiceKind",
        required: true,
        type: {
          name: "String"
        }
      },
      healthState: {
        serializedName: "HealthState",
        type: {
          name: "String"
        }
      },
      partitionStatus: {
        serializedName: "PartitionStatus",
        type: {
          name: "String"
        }
      },
      partitionInformation: {
        serializedName: "PartitionInformation",
        type: {
          name: "Composite",
          className: "PartitionInformation"
        }
      }
    }
  }
};

export const ServiceNameInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceNameInfo",
    modelProperties: {
      id: {
        serializedName: "Id",
        type: {
          name: "String"
        }
      },
      name: {
        serializedName: "Name",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const PartitionLoadInformation: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PartitionLoadInformation",
    modelProperties: {
      partitionId: {
        serializedName: "PartitionId",
        type: {
          name: "Uuid"
        }
      },
      primaryLoadMetricReports: {
        serializedName: "PrimaryLoadMetricReports",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "LoadMetricReport"
            }
          }
        }
      },
      secondaryLoadMetricReports: {
        serializedName: "SecondaryLoadMetricReports",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "LoadMetricReport"
            }
          }
        }
      },
      auxiliaryLoadMetricReports: {
        serializedName: "AuxiliaryLoadMetricReports",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "LoadMetricReport"
            }
          }
        }
      }
    }
  }
};

export const LoadMetricReport: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "LoadMetricReport",
    modelProperties: {
      lastReportedUtc: {
        serializedName: "LastReportedUtc",
        type: {
          name: "DateTime"
        }
      },
      name: {
        serializedName: "Name",
        type: {
          name: "String"
        }
      },
      value: {
        serializedName: "Value",
        type: {
          name: "String"
        }
      },
      currentValue: {
        serializedName: "CurrentValue",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const PartitionMetricLoadDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PartitionMetricLoadDescription",
    modelProperties: {
      partitionId: {
        serializedName: "PartitionId",
        type: {
          name: "Uuid"
        }
      },
      primaryReplicaLoadEntries: {
        serializedName: "PrimaryReplicaLoadEntries",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "MetricLoadDescription"
            }
          }
        }
      },
      secondaryReplicasOrInstancesLoadEntries: {
        serializedName: "SecondaryReplicasOrInstancesLoadEntries",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "MetricLoadDescription"
            }
          }
        }
      },
      secondaryReplicaOrInstanceLoadEntriesPerNode: {
        serializedName: "SecondaryReplicaOrInstanceLoadEntriesPerNode",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ReplicaMetricLoadDescription"
            }
          }
        }
      },
      auxiliaryReplicasLoadEntries: {
        serializedName: "AuxiliaryReplicasLoadEntries",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "MetricLoadDescription"
            }
          }
        }
      },
      auxiliaryReplicaLoadEntriesPerNode: {
        serializedName: "AuxiliaryReplicaLoadEntriesPerNode",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ReplicaMetricLoadDescription"
            }
          }
        }
      }
    }
  }
};

export const MetricLoadDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "MetricLoadDescription",
    modelProperties: {
      metricName: {
        serializedName: "MetricName",
        type: {
          name: "String"
        }
      },
      currentLoad: {
        serializedName: "CurrentLoad",
        type: {
          name: "Number"
        }
      },
      predictedLoad: {
        serializedName: "PredictedLoad",
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ReplicaMetricLoadDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ReplicaMetricLoadDescription",
    modelProperties: {
      nodeName: {
        serializedName: "NodeName",
        type: {
          name: "String"
        }
      },
      replicaOrInstanceLoadEntries: {
        serializedName: "ReplicaOrInstanceLoadEntries",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "MetricLoadDescription"
            }
          }
        }
      }
    }
  }
};

export const PagedUpdatePartitionLoadResultList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PagedUpdatePartitionLoadResultList",
    modelProperties: {
      continuationToken: {
        serializedName: "ContinuationToken",
        type: {
          name: "String"
        }
      },
      items: {
        serializedName: "Items",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "UpdatePartitionLoadResult"
            }
          }
        }
      }
    }
  }
};

export const UpdatePartitionLoadResult: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "UpdatePartitionLoadResult",
    modelProperties: {
      partitionId: {
        serializedName: "PartitionId",
        type: {
          name: "Uuid"
        }
      },
      partitionErrorCode: {
        serializedName: "PartitionErrorCode",
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const RepairTask: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "RepairTask",
    modelProperties: {
      taskId: {
        serializedName: "TaskId",
        required: true,
        type: {
          name: "String"
        }
      },
      version: {
        serializedName: "Version",
        type: {
          name: "String"
        }
      },
      description: {
        serializedName: "Description",
        type: {
          name: "String"
        }
      },
      state: {
        serializedName: "State",
        required: true,
        type: {
          name: "String"
        }
      },
      flags: {
        serializedName: "Flags",
        type: {
          name: "Number"
        }
      },
      action: {
        serializedName: "Action",
        required: true,
        type: {
          name: "String"
        }
      },
      target: {
        serializedName: "Target",
        type: {
          name: "Composite",
          className: "RepairTargetDescriptionBase"
        }
      },
      executor: {
        serializedName: "Executor",
        type: {
          name: "String"
        }
      },
      executorData: {
        serializedName: "ExecutorData",
        type: {
          name: "String"
        }
      },
      impact: {
        serializedName: "Impact",
        type: {
          name: "Composite",
          className: "RepairImpactDescriptionBase"
        }
      },
      resultStatus: {
        serializedName: "ResultStatus",
        type: {
          name: "String"
        }
      },
      resultCode: {
        serializedName: "ResultCode",
        type: {
          name: "Number"
        }
      },
      resultDetails: {
        serializedName: "ResultDetails",
        type: {
          name: "String"
        }
      },
      history: {
        serializedName: "History",
        type: {
          name: "Composite",
          className: "RepairTaskHistory"
        }
      },
      preparingHealthCheckState: {
        serializedName: "PreparingHealthCheckState",
        type: {
          name: "String"
        }
      },
      restoringHealthCheckState: {
        serializedName: "RestoringHealthCheckState",
        type: {
          name: "String"
        }
      },
      performPreparingHealthCheck: {
        serializedName: "PerformPreparingHealthCheck",
        type: {
          name: "Boolean"
        }
      },
      performRestoringHealthCheck: {
        serializedName: "PerformRestoringHealthCheck",
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const RepairTargetDescriptionBase: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "RepairTargetDescriptionBase",
    uberParent: "RepairTargetDescriptionBase",
    polymorphicDiscriminator: {
      serializedName: "Kind",
      clientName: "kind"
    },
    modelProperties: {
      kind: {
        serializedName: "Kind",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const RepairImpactDescriptionBase: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "RepairImpactDescriptionBase",
    uberParent: "RepairImpactDescriptionBase",
    polymorphicDiscriminator: {
      serializedName: "Kind",
      clientName: "kind"
    },
    modelProperties: {
      kind: {
        serializedName: "Kind",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const RepairTaskHistory: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "RepairTaskHistory",
    modelProperties: {
      createdUtcTimestamp: {
        serializedName: "CreatedUtcTimestamp",
        type: {
          name: "DateTime"
        }
      },
      claimedUtcTimestamp: {
        serializedName: "ClaimedUtcTimestamp",
        type: {
          name: "DateTime"
        }
      },
      preparingUtcTimestamp: {
        serializedName: "PreparingUtcTimestamp",
        type: {
          name: "DateTime"
        }
      },
      approvedUtcTimestamp: {
        serializedName: "ApprovedUtcTimestamp",
        type: {
          name: "DateTime"
        }
      },
      executingUtcTimestamp: {
        serializedName: "ExecutingUtcTimestamp",
        type: {
          name: "DateTime"
        }
      },
      restoringUtcTimestamp: {
        serializedName: "RestoringUtcTimestamp",
        type: {
          name: "DateTime"
        }
      },
      completedUtcTimestamp: {
        serializedName: "CompletedUtcTimestamp",
        type: {
          name: "DateTime"
        }
      },
      preparingHealthCheckStartUtcTimestamp: {
        serializedName: "PreparingHealthCheckStartUtcTimestamp",
        type: {
          name: "DateTime"
        }
      },
      preparingHealthCheckEndUtcTimestamp: {
        serializedName: "PreparingHealthCheckEndUtcTimestamp",
        type: {
          name: "DateTime"
        }
      },
      restoringHealthCheckStartUtcTimestamp: {
        serializedName: "RestoringHealthCheckStartUtcTimestamp",
        type: {
          name: "DateTime"
        }
      },
      restoringHealthCheckEndUtcTimestamp: {
        serializedName: "RestoringHealthCheckEndUtcTimestamp",
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const RepairTaskUpdateInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "RepairTaskUpdateInfo",
    modelProperties: {
      version: {
        serializedName: "Version",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const RepairTaskCancelDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "RepairTaskCancelDescription",
    modelProperties: {
      taskId: {
        serializedName: "TaskId",
        required: true,
        type: {
          name: "String"
        }
      },
      version: {
        serializedName: "Version",
        type: {
          name: "String"
        }
      },
      requestAbort: {
        serializedName: "RequestAbort",
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const RepairTaskDeleteDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "RepairTaskDeleteDescription",
    modelProperties: {
      taskId: {
        serializedName: "TaskId",
        required: true,
        type: {
          name: "String"
        }
      },
      version: {
        serializedName: "Version",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const RepairTaskApproveDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "RepairTaskApproveDescription",
    modelProperties: {
      taskId: {
        serializedName: "TaskId",
        required: true,
        type: {
          name: "String"
        }
      },
      version: {
        serializedName: "Version",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const RepairTaskUpdateHealthPolicyDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "RepairTaskUpdateHealthPolicyDescription",
    modelProperties: {
      taskId: {
        serializedName: "TaskId",
        required: true,
        type: {
          name: "String"
        }
      },
      version: {
        serializedName: "Version",
        type: {
          name: "String"
        }
      },
      performPreparingHealthCheck: {
        serializedName: "PerformPreparingHealthCheck",
        type: {
          name: "Boolean"
        }
      },
      performRestoringHealthCheck: {
        serializedName: "PerformRestoringHealthCheck",
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const PagedReplicaInfoList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PagedReplicaInfoList",
    modelProperties: {
      continuationToken: {
        serializedName: "ContinuationToken",
        type: {
          name: "String"
        }
      },
      items: {
        serializedName: "Items",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ReplicaInfo"
            }
          }
        }
      }
    }
  }
};

export const ReplicaInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ReplicaInfo",
    uberParent: "ReplicaInfo",
    polymorphicDiscriminator: {
      serializedName: "ServiceKind",
      clientName: "serviceKind"
    },
    modelProperties: {
      serviceKind: {
        serializedName: "ServiceKind",
        required: true,
        type: {
          name: "String"
        }
      },
      replicaStatus: {
        serializedName: "ReplicaStatus",
        type: {
          name: "String"
        }
      },
      healthState: {
        serializedName: "HealthState",
        type: {
          name: "String"
        }
      },
      nodeName: {
        serializedName: "NodeName",
        type: {
          name: "String"
        }
      },
      address: {
        serializedName: "Address",
        type: {
          name: "String"
        }
      },
      lastInBuildDurationInSeconds: {
        serializedName: "LastInBuildDurationInSeconds",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const DeployedServiceReplicaInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "DeployedServiceReplicaInfo",
    uberParent: "DeployedServiceReplicaInfo",
    polymorphicDiscriminator: {
      serializedName: "ServiceKind",
      clientName: "serviceKind"
    },
    modelProperties: {
      serviceKind: {
        serializedName: "ServiceKind",
        required: true,
        type: {
          name: "String"
        }
      },
      serviceName: {
        serializedName: "ServiceName",
        type: {
          name: "String"
        }
      },
      serviceTypeName: {
        serializedName: "ServiceTypeName",
        type: {
          name: "String"
        }
      },
      serviceManifestName: {
        serializedName: "ServiceManifestName",
        type: {
          name: "String"
        }
      },
      codePackageName: {
        serializedName: "CodePackageName",
        type: {
          name: "String"
        }
      },
      partitionId: {
        serializedName: "PartitionId",
        type: {
          name: "Uuid"
        }
      },
      replicaStatus: {
        serializedName: "ReplicaStatus",
        type: {
          name: "String"
        }
      },
      address: {
        serializedName: "Address",
        type: {
          name: "String"
        }
      },
      servicePackageActivationId: {
        serializedName: "ServicePackageActivationId",
        type: {
          name: "String"
        }
      },
      hostProcessId: {
        serializedName: "HostProcessId",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const DeployedServiceReplicaDetailInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "DeployedServiceReplicaDetailInfo",
    uberParent: "DeployedServiceReplicaDetailInfo",
    polymorphicDiscriminator: {
      serializedName: "ServiceKind",
      clientName: "serviceKind"
    },
    modelProperties: {
      serviceKind: {
        serializedName: "ServiceKind",
        required: true,
        type: {
          name: "String"
        }
      },
      serviceName: {
        serializedName: "ServiceName",
        type: {
          name: "String"
        }
      },
      partitionId: {
        serializedName: "PartitionId",
        type: {
          name: "Uuid"
        }
      },
      currentServiceOperation: {
        serializedName: "CurrentServiceOperation",
        type: {
          name: "String"
        }
      },
      currentServiceOperationStartTimeUtc: {
        serializedName: "CurrentServiceOperationStartTimeUtc",
        type: {
          name: "DateTime"
        }
      },
      reportedLoad: {
        serializedName: "ReportedLoad",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "LoadMetricReportInfo"
            }
          }
        }
      }
    }
  }
};

export const LoadMetricReportInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "LoadMetricReportInfo",
    modelProperties: {
      name: {
        serializedName: "Name",
        type: {
          name: "String"
        }
      },
      value: {
        serializedName: "Value",
        type: {
          name: "Number"
        }
      },
      currentValue: {
        serializedName: "CurrentValue",
        type: {
          name: "String"
        }
      },
      lastReportedUtc: {
        serializedName: "LastReportedUtc",
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const DeployedServicePackageInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "DeployedServicePackageInfo",
    modelProperties: {
      name: {
        serializedName: "Name",
        type: {
          name: "String"
        }
      },
      version: {
        serializedName: "Version",
        type: {
          name: "String"
        }
      },
      status: {
        serializedName: "Status",
        type: {
          name: "String"
        }
      },
      servicePackageActivationId: {
        serializedName: "ServicePackageActivationId",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const DeployServicePackageToNodeDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "DeployServicePackageToNodeDescription",
    modelProperties: {
      serviceManifestName: {
        serializedName: "ServiceManifestName",
        required: true,
        type: {
          name: "String"
        }
      },
      applicationTypeName: {
        serializedName: "ApplicationTypeName",
        required: true,
        type: {
          name: "String"
        }
      },
      applicationTypeVersion: {
        serializedName: "ApplicationTypeVersion",
        required: true,
        type: {
          name: "String"
        }
      },
      nodeName: {
        serializedName: "NodeName",
        required: true,
        type: {
          name: "String"
        }
      },
      packageSharingPolicy: {
        serializedName: "PackageSharingPolicy",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "PackageSharingPolicyInfo"
            }
          }
        }
      }
    }
  }
};

export const PackageSharingPolicyInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PackageSharingPolicyInfo",
    modelProperties: {
      sharedPackageName: {
        serializedName: "SharedPackageName",
        type: {
          name: "String"
        }
      },
      packageSharingScope: {
        serializedName: "PackageSharingScope",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const DeployedCodePackageInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "DeployedCodePackageInfo",
    modelProperties: {
      name: {
        serializedName: "Name",
        type: {
          name: "String"
        }
      },
      version: {
        serializedName: "Version",
        type: {
          name: "String"
        }
      },
      serviceManifestName: {
        serializedName: "ServiceManifestName",
        type: {
          name: "String"
        }
      },
      servicePackageActivationId: {
        serializedName: "ServicePackageActivationId",
        type: {
          name: "String"
        }
      },
      hostType: {
        serializedName: "HostType",
        type: {
          name: "String"
        }
      },
      hostIsolationMode: {
        serializedName: "HostIsolationMode",
        type: {
          name: "String"
        }
      },
      status: {
        serializedName: "Status",
        type: {
          name: "String"
        }
      },
      runFrequencyInterval: {
        serializedName: "RunFrequencyInterval",
        type: {
          name: "String"
        }
      },
      setupEntryPoint: {
        serializedName: "SetupEntryPoint",
        type: {
          name: "Composite",
          className: "CodePackageEntryPoint"
        }
      },
      mainEntryPoint: {
        serializedName: "MainEntryPoint",
        type: {
          name: "Composite",
          className: "CodePackageEntryPoint"
        }
      }
    }
  }
};

export const CodePackageEntryPoint: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "CodePackageEntryPoint",
    modelProperties: {
      entryPointLocation: {
        serializedName: "EntryPointLocation",
        type: {
          name: "String"
        }
      },
      processId: {
        serializedName: "ProcessId",
        type: {
          name: "String"
        }
      },
      runAsUserName: {
        serializedName: "RunAsUserName",
        type: {
          name: "String"
        }
      },
      codePackageEntryPointStatistics: {
        serializedName: "CodePackageEntryPointStatistics",
        type: {
          name: "Composite",
          className: "CodePackageEntryPointStatistics"
        }
      },
      status: {
        serializedName: "Status",
        type: {
          name: "String"
        }
      },
      nextActivationTime: {
        serializedName: "NextActivationTime",
        type: {
          name: "DateTime"
        }
      },
      instanceId: {
        serializedName: "InstanceId",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const CodePackageEntryPointStatistics: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "CodePackageEntryPointStatistics",
    modelProperties: {
      lastExitCode: {
        serializedName: "LastExitCode",
        type: {
          name: "String"
        }
      },
      lastActivationTime: {
        serializedName: "LastActivationTime",
        type: {
          name: "DateTime"
        }
      },
      lastExitTime: {
        serializedName: "LastExitTime",
        type: {
          name: "DateTime"
        }
      },
      lastSuccessfulActivationTime: {
        serializedName: "LastSuccessfulActivationTime",
        type: {
          name: "DateTime"
        }
      },
      lastSuccessfulExitTime: {
        serializedName: "LastSuccessfulExitTime",
        type: {
          name: "DateTime"
        }
      },
      activationCount: {
        serializedName: "ActivationCount",
        type: {
          name: "String"
        }
      },
      activationFailureCount: {
        serializedName: "ActivationFailureCount",
        type: {
          name: "String"
        }
      },
      continuousActivationFailureCount: {
        serializedName: "ContinuousActivationFailureCount",
        type: {
          name: "String"
        }
      },
      exitCount: {
        serializedName: "ExitCount",
        type: {
          name: "String"
        }
      },
      exitFailureCount: {
        serializedName: "ExitFailureCount",
        type: {
          name: "String"
        }
      },
      continuousExitFailureCount: {
        serializedName: "ContinuousExitFailureCount",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const RestartDeployedCodePackageDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "RestartDeployedCodePackageDescription",
    modelProperties: {
      serviceManifestName: {
        serializedName: "ServiceManifestName",
        required: true,
        type: {
          name: "String"
        }
      },
      servicePackageActivationId: {
        serializedName: "ServicePackageActivationId",
        type: {
          name: "String"
        }
      },
      codePackageName: {
        serializedName: "CodePackageName",
        required: true,
        type: {
          name: "String"
        }
      },
      codePackageInstanceId: {
        serializedName: "CodePackageInstanceId",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ContainerLogs: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ContainerLogs",
    modelProperties: {
      content: {
        serializedName: "Content",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ContainerApiRequestBody: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ContainerApiRequestBody",
    modelProperties: {
      httpVerb: {
        serializedName: "HttpVerb",
        type: {
          name: "String"
        }
      },
      uriPath: {
        serializedName: "UriPath",
        required: true,
        type: {
          name: "String"
        }
      },
      contentType: {
        serializedName: "Content-Type",
        type: {
          name: "String"
        }
      },
      body: {
        serializedName: "Body",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ContainerApiResponse: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ContainerApiResponse",
    modelProperties: {
      containerApiResult: {
        serializedName: "ContainerApiResult",
        type: {
          name: "Composite",
          className: "ContainerApiResult"
        }
      }
    }
  }
};

export const ContainerApiResult: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ContainerApiResult",
    modelProperties: {
      status: {
        serializedName: "Status",
        required: true,
        type: {
          name: "Number"
        }
      },
      contentType: {
        serializedName: "Content-Type",
        type: {
          name: "String"
        }
      },
      contentEncoding: {
        serializedName: "Content-Encoding",
        type: {
          name: "String"
        }
      },
      body: {
        serializedName: "Body",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const CreateComposeDeploymentDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "CreateComposeDeploymentDescription",
    modelProperties: {
      deploymentName: {
        serializedName: "DeploymentName",
        required: true,
        type: {
          name: "String"
        }
      },
      composeFileContent: {
        serializedName: "ComposeFileContent",
        required: true,
        type: {
          name: "String"
        }
      },
      registryCredential: {
        serializedName: "RegistryCredential",
        type: {
          name: "Composite",
          className: "RegistryCredential"
        }
      }
    }
  }
};

export const RegistryCredential: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "RegistryCredential",
    modelProperties: {
      registryUserName: {
        serializedName: "RegistryUserName",
        type: {
          name: "String"
        }
      },
      registryPassword: {
        serializedName: "RegistryPassword",
        type: {
          name: "String"
        }
      },
      passwordEncrypted: {
        serializedName: "PasswordEncrypted",
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const ComposeDeploymentStatusInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ComposeDeploymentStatusInfo",
    modelProperties: {
      name: {
        serializedName: "Name",
        type: {
          name: "String"
        }
      },
      applicationName: {
        serializedName: "ApplicationName",
        type: {
          name: "String"
        }
      },
      status: {
        serializedName: "Status",
        type: {
          name: "String"
        }
      },
      statusDetails: {
        serializedName: "StatusDetails",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const PagedComposeDeploymentStatusInfoList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PagedComposeDeploymentStatusInfoList",
    modelProperties: {
      continuationToken: {
        serializedName: "ContinuationToken",
        type: {
          name: "String"
        }
      },
      items: {
        serializedName: "Items",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ComposeDeploymentStatusInfo"
            }
          }
        }
      }
    }
  }
};

export const ComposeDeploymentUpgradeProgressInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ComposeDeploymentUpgradeProgressInfo",
    modelProperties: {
      deploymentName: {
        serializedName: "DeploymentName",
        type: {
          name: "String"
        }
      },
      applicationName: {
        serializedName: "ApplicationName",
        type: {
          name: "String"
        }
      },
      upgradeState: {
        serializedName: "UpgradeState",
        type: {
          name: "String"
        }
      },
      upgradeStatusDetails: {
        serializedName: "UpgradeStatusDetails",
        type: {
          name: "String"
        }
      },
      upgradeKind: {
        defaultValue: "Rolling",
        serializedName: "UpgradeKind",
        type: {
          name: "String"
        }
      },
      rollingUpgradeMode: {
        defaultValue: "UnmonitoredAuto",
        serializedName: "RollingUpgradeMode",
        type: {
          name: "String"
        }
      },
      forceRestart: {
        defaultValue: false,
        serializedName: "ForceRestart",
        type: {
          name: "Boolean"
        }
      },
      upgradeReplicaSetCheckTimeoutInSeconds: {
        defaultValue: 42949672925,
        serializedName: "UpgradeReplicaSetCheckTimeoutInSeconds",
        type: {
          name: "Number"
        }
      },
      monitoringPolicy: {
        serializedName: "MonitoringPolicy",
        type: {
          name: "Composite",
          className: "MonitoringPolicyDescription"
        }
      },
      applicationHealthPolicy: {
        serializedName: "ApplicationHealthPolicy",
        type: {
          name: "Composite",
          className: "ApplicationHealthPolicy"
        }
      },
      targetApplicationTypeVersion: {
        serializedName: "TargetApplicationTypeVersion",
        type: {
          name: "String"
        }
      },
      upgradeDuration: {
        defaultValue: "PT0H2M0S",
        serializedName: "UpgradeDuration",
        type: {
          name: "String"
        }
      },
      currentUpgradeDomainDuration: {
        defaultValue: "PT0H2M0S",
        serializedName: "CurrentUpgradeDomainDuration",
        type: {
          name: "String"
        }
      },
      applicationUnhealthyEvaluations: {
        serializedName: "ApplicationUnhealthyEvaluations",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HealthEvaluationWrapper"
            }
          }
        }
      },
      currentUpgradeDomainProgress: {
        serializedName: "CurrentUpgradeDomainProgress",
        type: {
          name: "Composite",
          className: "CurrentUpgradeDomainProgressInfo"
        }
      },
      startTimestampUtc: {
        serializedName: "StartTimestampUtc",
        type: {
          name: "String"
        }
      },
      failureTimestampUtc: {
        serializedName: "FailureTimestampUtc",
        type: {
          name: "String"
        }
      },
      failureReason: {
        serializedName: "FailureReason",
        type: {
          name: "String"
        }
      },
      upgradeDomainProgressAtFailure: {
        serializedName: "UpgradeDomainProgressAtFailure",
        type: {
          name: "Composite",
          className: "FailureUpgradeDomainProgressInfo"
        }
      },
      applicationUpgradeStatusDetails: {
        serializedName: "ApplicationUpgradeStatusDetails",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ComposeDeploymentUpgradeDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ComposeDeploymentUpgradeDescription",
    modelProperties: {
      deploymentName: {
        serializedName: "DeploymentName",
        required: true,
        type: {
          name: "String"
        }
      },
      composeFileContent: {
        serializedName: "ComposeFileContent",
        required: true,
        type: {
          name: "String"
        }
      },
      registryCredential: {
        serializedName: "RegistryCredential",
        type: {
          name: "Composite",
          className: "RegistryCredential"
        }
      },
      upgradeKind: {
        defaultValue: "Rolling",
        serializedName: "UpgradeKind",
        required: true,
        type: {
          name: "String"
        }
      },
      rollingUpgradeMode: {
        defaultValue: "UnmonitoredAuto",
        serializedName: "RollingUpgradeMode",
        type: {
          name: "String"
        }
      },
      upgradeReplicaSetCheckTimeoutInSeconds: {
        defaultValue: 42949672925,
        serializedName: "UpgradeReplicaSetCheckTimeoutInSeconds",
        type: {
          name: "Number"
        }
      },
      forceRestart: {
        defaultValue: false,
        serializedName: "ForceRestart",
        type: {
          name: "Boolean"
        }
      },
      monitoringPolicy: {
        serializedName: "MonitoringPolicy",
        type: {
          name: "Composite",
          className: "MonitoringPolicyDescription"
        }
      },
      applicationHealthPolicy: {
        serializedName: "ApplicationHealthPolicy",
        type: {
          name: "Composite",
          className: "ApplicationHealthPolicy"
        }
      }
    }
  }
};

export const Chaos: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "Chaos",
    modelProperties: {
      chaosParameters: {
        serializedName: "ChaosParameters",
        type: {
          name: "Composite",
          className: "ChaosParameters"
        }
      },
      status: {
        serializedName: "Status",
        type: {
          name: "String"
        }
      },
      scheduleStatus: {
        serializedName: "ScheduleStatus",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ChaosParameters: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ChaosParameters",
    modelProperties: {
      timeToRunInSeconds: {
        defaultValue: "4294967295",
        serializedName: "TimeToRunInSeconds",
        type: {
          name: "String"
        }
      },
      maxClusterStabilizationTimeoutInSeconds: {
        defaultValue: 60,
        constraints: {
          InclusiveMaximum: 4294967295,
          InclusiveMinimum: 0
        },
        serializedName: "MaxClusterStabilizationTimeoutInSeconds",
        type: {
          name: "Number"
        }
      },
      maxConcurrentFaults: {
        defaultValue: 1,
        constraints: {
          InclusiveMaximum: 4294967295,
          InclusiveMinimum: 0
        },
        serializedName: "MaxConcurrentFaults",
        type: {
          name: "Number"
        }
      },
      enableMoveReplicaFaults: {
        defaultValue: true,
        serializedName: "EnableMoveReplicaFaults",
        type: {
          name: "Boolean"
        }
      },
      waitTimeBetweenFaultsInSeconds: {
        defaultValue: 20,
        constraints: {
          InclusiveMaximum: 4294967295,
          InclusiveMinimum: 0
        },
        serializedName: "WaitTimeBetweenFaultsInSeconds",
        type: {
          name: "Number"
        }
      },
      waitTimeBetweenIterationsInSeconds: {
        defaultValue: 30,
        constraints: {
          InclusiveMaximum: 4294967295,
          InclusiveMinimum: 0
        },
        serializedName: "WaitTimeBetweenIterationsInSeconds",
        type: {
          name: "Number"
        }
      },
      clusterHealthPolicy: {
        serializedName: "ClusterHealthPolicy",
        type: {
          name: "Composite",
          className: "ClusterHealthPolicy"
        }
      },
      context: {
        serializedName: "Context",
        type: {
          name: "Composite",
          className: "ChaosContext"
        }
      },
      chaosTargetFilter: {
        serializedName: "ChaosTargetFilter",
        type: {
          name: "Composite",
          className: "ChaosTargetFilter"
        }
      }
    }
  }
};

export const ChaosContext: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ChaosContext",
    modelProperties: {
      map: {
        serializedName: "Map",
        type: {
          name: "Dictionary",
          value: { type: { name: "String" } }
        }
      }
    }
  }
};

export const ChaosTargetFilter: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ChaosTargetFilter",
    modelProperties: {
      nodeTypeInclusionList: {
        serializedName: "NodeTypeInclusionList",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "String"
            }
          }
        }
      },
      applicationInclusionList: {
        serializedName: "ApplicationInclusionList",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "String"
            }
          }
        }
      }
    }
  }
};

export const ChaosEventsSegment: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ChaosEventsSegment",
    modelProperties: {
      continuationToken: {
        serializedName: "ContinuationToken",
        type: {
          name: "String"
        }
      },
      history: {
        serializedName: "History",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ChaosEventWrapper"
            }
          }
        }
      }
    }
  }
};

export const ChaosEventWrapper: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ChaosEventWrapper",
    modelProperties: {
      chaosEvent: {
        serializedName: "ChaosEvent",
        type: {
          name: "Composite",
          className: "ChaosEvent"
        }
      }
    }
  }
};

export const ChaosEvent: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ChaosEvent",
    uberParent: "ChaosEvent",
    polymorphicDiscriminator: {
      serializedName: "Kind",
      clientName: "kind"
    },
    modelProperties: {
      kind: {
        serializedName: "Kind",
        required: true,
        type: {
          name: "String"
        }
      },
      timeStampUtc: {
        serializedName: "TimeStampUtc",
        required: true,
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const ChaosScheduleDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ChaosScheduleDescription",
    modelProperties: {
      version: {
        constraints: {
          InclusiveMinimum: 0
        },
        serializedName: "Version",
        type: {
          name: "Number"
        }
      },
      schedule: {
        serializedName: "Schedule",
        type: {
          name: "Composite",
          className: "ChaosSchedule"
        }
      }
    }
  }
};

export const ChaosSchedule: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ChaosSchedule",
    modelProperties: {
      startDate: {
        defaultValue: "1601-01-01T00:00:00Z",
        serializedName: "StartDate",
        type: {
          name: "DateTime"
        }
      },
      expiryDate: {
        defaultValue: "9999-12-31T23:59:59.999Z",
        serializedName: "ExpiryDate",
        type: {
          name: "DateTime"
        }
      },
      chaosParametersDictionary: {
        serializedName: "ChaosParametersDictionary",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ChaosParametersDictionaryItem"
            }
          }
        }
      },
      jobs: {
        serializedName: "Jobs",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ChaosScheduleJob"
            }
          }
        }
      }
    }
  }
};

export const ChaosParametersDictionaryItem: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ChaosParametersDictionaryItem",
    modelProperties: {
      key: {
        serializedName: "Key",
        required: true,
        type: {
          name: "String"
        }
      },
      value: {
        serializedName: "Value",
        type: {
          name: "Composite",
          className: "ChaosParameters"
        }
      }
    }
  }
};

export const ChaosScheduleJob: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ChaosScheduleJob",
    modelProperties: {
      chaosParameters: {
        serializedName: "ChaosParameters",
        type: {
          name: "String"
        }
      },
      days: {
        serializedName: "Days",
        type: {
          name: "Composite",
          className: "ChaosScheduleJobActiveDaysOfWeek"
        }
      },
      times: {
        serializedName: "Times",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "TimeRange"
            }
          }
        }
      }
    }
  }
};

export const ChaosScheduleJobActiveDaysOfWeek: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ChaosScheduleJobActiveDaysOfWeek",
    modelProperties: {
      sunday: {
        defaultValue: false,
        serializedName: "Sunday",
        type: {
          name: "Boolean"
        }
      },
      monday: {
        defaultValue: false,
        serializedName: "Monday",
        type: {
          name: "Boolean"
        }
      },
      tuesday: {
        defaultValue: false,
        serializedName: "Tuesday",
        type: {
          name: "Boolean"
        }
      },
      wednesday: {
        defaultValue: false,
        serializedName: "Wednesday",
        type: {
          name: "Boolean"
        }
      },
      thursday: {
        defaultValue: false,
        serializedName: "Thursday",
        type: {
          name: "Boolean"
        }
      },
      friday: {
        defaultValue: false,
        serializedName: "Friday",
        type: {
          name: "Boolean"
        }
      },
      saturday: {
        defaultValue: false,
        serializedName: "Saturday",
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const TimeRange: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "TimeRange",
    modelProperties: {
      startTime: {
        serializedName: "StartTime",
        type: {
          name: "Composite",
          className: "TimeOfDay"
        }
      },
      endTime: {
        serializedName: "EndTime",
        type: {
          name: "Composite",
          className: "TimeOfDay"
        }
      }
    }
  }
};

export const TimeOfDay: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "TimeOfDay",
    modelProperties: {
      hour: {
        constraints: {
          InclusiveMaximum: 23,
          InclusiveMinimum: 0
        },
        serializedName: "Hour",
        type: {
          name: "Number"
        }
      },
      minute: {
        constraints: {
          InclusiveMaximum: 59,
          InclusiveMinimum: 0
        },
        serializedName: "Minute",
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ImageStoreContent: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ImageStoreContent",
    modelProperties: {
      storeFiles: {
        serializedName: "StoreFiles",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "FileInfo"
            }
          }
        }
      },
      storeFolders: {
        serializedName: "StoreFolders",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "FolderInfo"
            }
          }
        }
      }
    }
  }
};

export const FileInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "FileInfo",
    modelProperties: {
      fileSize: {
        serializedName: "FileSize",
        type: {
          name: "String"
        }
      },
      fileVersion: {
        serializedName: "FileVersion",
        type: {
          name: "Composite",
          className: "FileVersion"
        }
      },
      modifiedDate: {
        serializedName: "ModifiedDate",
        type: {
          name: "DateTime"
        }
      },
      storeRelativePath: {
        serializedName: "StoreRelativePath",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const FileVersion: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "FileVersion",
    modelProperties: {
      versionNumber: {
        serializedName: "VersionNumber",
        type: {
          name: "String"
        }
      },
      epochDataLossNumber: {
        serializedName: "EpochDataLossNumber",
        type: {
          name: "String"
        }
      },
      epochConfigurationNumber: {
        serializedName: "EpochConfigurationNumber",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const FolderInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "FolderInfo",
    modelProperties: {
      storeRelativePath: {
        serializedName: "StoreRelativePath",
        type: {
          name: "String"
        }
      },
      fileCount: {
        serializedName: "FileCount",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ImageStoreCopyDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ImageStoreCopyDescription",
    modelProperties: {
      remoteSource: {
        serializedName: "RemoteSource",
        required: true,
        type: {
          name: "String"
        }
      },
      remoteDestination: {
        serializedName: "RemoteDestination",
        required: true,
        type: {
          name: "String"
        }
      },
      skipFiles: {
        serializedName: "SkipFiles",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "String"
            }
          }
        }
      },
      checkMarkFile: {
        serializedName: "CheckMarkFile",
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const UploadSession: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "UploadSession",
    modelProperties: {
      uploadSessions: {
        serializedName: "UploadSessions",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "UploadSessionInfo"
            }
          }
        }
      }
    }
  }
};

export const UploadSessionInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "UploadSessionInfo",
    modelProperties: {
      storeRelativePath: {
        serializedName: "StoreRelativePath",
        type: {
          name: "String"
        }
      },
      sessionId: {
        serializedName: "SessionId",
        type: {
          name: "Uuid"
        }
      },
      modifiedDate: {
        serializedName: "ModifiedDate",
        type: {
          name: "DateTime"
        }
      },
      fileSize: {
        serializedName: "FileSize",
        type: {
          name: "String"
        }
      },
      expectedRanges: {
        serializedName: "ExpectedRanges",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "UploadChunkRange"
            }
          }
        }
      }
    }
  }
};

export const UploadChunkRange: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "UploadChunkRange",
    modelProperties: {
      startPosition: {
        serializedName: "StartPosition",
        type: {
          name: "String"
        }
      },
      endPosition: {
        serializedName: "EndPosition",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const FolderSizeInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "FolderSizeInfo",
    modelProperties: {
      storeRelativePath: {
        serializedName: "StoreRelativePath",
        type: {
          name: "String"
        }
      },
      folderSize: {
        serializedName: "FolderSize",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ImageStoreInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ImageStoreInfo",
    modelProperties: {
      diskInfo: {
        serializedName: "DiskInfo",
        type: {
          name: "Composite",
          className: "DiskInfo"
        }
      },
      usedByMetadata: {
        serializedName: "UsedByMetadata",
        type: {
          name: "Composite",
          className: "UsageInfo"
        }
      },
      usedByStaging: {
        serializedName: "UsedByStaging",
        type: {
          name: "Composite",
          className: "UsageInfo"
        }
      },
      usedByCopy: {
        serializedName: "UsedByCopy",
        type: {
          name: "Composite",
          className: "UsageInfo"
        }
      },
      usedByRegister: {
        serializedName: "UsedByRegister",
        type: {
          name: "Composite",
          className: "UsageInfo"
        }
      }
    }
  }
};

export const DiskInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "DiskInfo",
    modelProperties: {
      capacity: {
        serializedName: "Capacity",
        type: {
          name: "String"
        }
      },
      availableSpace: {
        serializedName: "AvailableSpace",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const UsageInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "UsageInfo",
    modelProperties: {
      usedSpace: {
        serializedName: "UsedSpace",
        type: {
          name: "String"
        }
      },
      fileCount: {
        serializedName: "FileCount",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const PartitionDataLossProgress: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PartitionDataLossProgress",
    modelProperties: {
      state: {
        serializedName: "State",
        type: {
          name: "String"
        }
      },
      invokeDataLossResult: {
        serializedName: "InvokeDataLossResult",
        type: {
          name: "Composite",
          className: "InvokeDataLossResult"
        }
      }
    }
  }
};

export const InvokeDataLossResult: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "InvokeDataLossResult",
    modelProperties: {
      errorCode: {
        serializedName: "ErrorCode",
        type: {
          name: "Number"
        }
      },
      selectedPartition: {
        serializedName: "SelectedPartition",
        type: {
          name: "Composite",
          className: "SelectedPartition"
        }
      }
    }
  }
};

export const SelectedPartition: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "SelectedPartition",
    modelProperties: {
      serviceName: {
        serializedName: "ServiceName",
        type: {
          name: "String"
        }
      },
      partitionId: {
        serializedName: "PartitionId",
        type: {
          name: "Uuid"
        }
      }
    }
  }
};

export const PartitionQuorumLossProgress: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PartitionQuorumLossProgress",
    modelProperties: {
      state: {
        serializedName: "State",
        type: {
          name: "String"
        }
      },
      invokeQuorumLossResult: {
        serializedName: "InvokeQuorumLossResult",
        type: {
          name: "Composite",
          className: "InvokeQuorumLossResult"
        }
      }
    }
  }
};

export const InvokeQuorumLossResult: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "InvokeQuorumLossResult",
    modelProperties: {
      errorCode: {
        serializedName: "ErrorCode",
        type: {
          name: "Number"
        }
      },
      selectedPartition: {
        serializedName: "SelectedPartition",
        type: {
          name: "Composite",
          className: "SelectedPartition"
        }
      }
    }
  }
};

export const PartitionRestartProgress: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PartitionRestartProgress",
    modelProperties: {
      state: {
        serializedName: "State",
        type: {
          name: "String"
        }
      },
      restartPartitionResult: {
        serializedName: "RestartPartitionResult",
        type: {
          name: "Composite",
          className: "RestartPartitionResult"
        }
      }
    }
  }
};

export const RestartPartitionResult: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "RestartPartitionResult",
    modelProperties: {
      errorCode: {
        serializedName: "ErrorCode",
        type: {
          name: "Number"
        }
      },
      selectedPartition: {
        serializedName: "SelectedPartition",
        type: {
          name: "Composite",
          className: "SelectedPartition"
        }
      }
    }
  }
};

export const NodeTransitionProgress: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "NodeTransitionProgress",
    modelProperties: {
      state: {
        serializedName: "State",
        type: {
          name: "String"
        }
      },
      nodeTransitionResult: {
        serializedName: "NodeTransitionResult",
        type: {
          name: "Composite",
          className: "NodeTransitionResult"
        }
      }
    }
  }
};

export const NodeTransitionResult: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "NodeTransitionResult",
    modelProperties: {
      errorCode: {
        serializedName: "ErrorCode",
        type: {
          name: "Number"
        }
      },
      nodeResult: {
        serializedName: "NodeResult",
        type: {
          name: "Composite",
          className: "NodeResult"
        }
      }
    }
  }
};

export const NodeResult: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "NodeResult",
    modelProperties: {
      nodeName: {
        serializedName: "NodeName",
        type: {
          name: "String"
        }
      },
      nodeInstanceId: {
        serializedName: "NodeInstanceId",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const OperationStatus: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "OperationStatus",
    modelProperties: {
      operationId: {
        serializedName: "OperationId",
        type: {
          name: "Uuid"
        }
      },
      state: {
        serializedName: "State",
        type: {
          name: "String"
        }
      },
      type: {
        serializedName: "Type",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const BackupPolicyDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "BackupPolicyDescription",
    modelProperties: {
      name: {
        serializedName: "Name",
        required: true,
        type: {
          name: "String"
        }
      },
      autoRestoreOnDataLoss: {
        serializedName: "AutoRestoreOnDataLoss",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      maxIncrementalBackups: {
        constraints: {
          InclusiveMaximum: 255,
          InclusiveMinimum: 0
        },
        serializedName: "MaxIncrementalBackups",
        required: true,
        type: {
          name: "Number"
        }
      },
      schedule: {
        serializedName: "Schedule",
        type: {
          name: "Composite",
          className: "BackupScheduleDescription"
        }
      },
      storage: {
        serializedName: "Storage",
        type: {
          name: "Composite",
          className: "BackupStorageDescription"
        }
      },
      retentionPolicy: {
        serializedName: "RetentionPolicy",
        type: {
          name: "Composite",
          className: "RetentionPolicyDescription"
        }
      }
    }
  }
};

export const BackupScheduleDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "BackupScheduleDescription",
    uberParent: "BackupScheduleDescription",
    polymorphicDiscriminator: {
      serializedName: "ScheduleKind",
      clientName: "scheduleKind"
    },
    modelProperties: {
      scheduleKind: {
        serializedName: "ScheduleKind",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const BackupStorageDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "BackupStorageDescription",
    uberParent: "BackupStorageDescription",
    polymorphicDiscriminator: {
      serializedName: "StorageKind",
      clientName: "storageKind"
    },
    modelProperties: {
      storageKind: {
        serializedName: "StorageKind",
        required: true,
        type: {
          name: "String"
        }
      },
      friendlyName: {
        serializedName: "FriendlyName",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const RetentionPolicyDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "RetentionPolicyDescription",
    uberParent: "RetentionPolicyDescription",
    polymorphicDiscriminator: {
      serializedName: "RetentionPolicyType",
      clientName: "retentionPolicyType"
    },
    modelProperties: {
      retentionPolicyType: {
        serializedName: "RetentionPolicyType",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const PagedBackupPolicyDescriptionList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PagedBackupPolicyDescriptionList",
    modelProperties: {
      continuationToken: {
        serializedName: "ContinuationToken",
        type: {
          name: "String"
        }
      },
      items: {
        serializedName: "Items",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "BackupPolicyDescription"
            }
          }
        }
      }
    }
  }
};

export const PagedBackupEntityList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PagedBackupEntityList",
    modelProperties: {
      continuationToken: {
        serializedName: "ContinuationToken",
        type: {
          name: "String"
        }
      },
      items: {
        serializedName: "Items",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "BackupEntity"
            }
          }
        }
      }
    }
  }
};

export const BackupEntity: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "BackupEntity",
    uberParent: "BackupEntity",
    polymorphicDiscriminator: {
      serializedName: "EntityKind",
      clientName: "entityKind"
    },
    modelProperties: {
      entityKind: {
        serializedName: "EntityKind",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const EnableBackupDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "EnableBackupDescription",
    modelProperties: {
      backupPolicyName: {
        serializedName: "BackupPolicyName",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const DisableBackupDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "DisableBackupDescription",
    modelProperties: {
      cleanBackup: {
        serializedName: "CleanBackup",
        required: true,
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const PagedBackupConfigurationInfoList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PagedBackupConfigurationInfoList",
    modelProperties: {
      continuationToken: {
        serializedName: "ContinuationToken",
        type: {
          name: "String"
        }
      },
      items: {
        serializedName: "Items",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "BackupConfigurationInfo"
            }
          }
        }
      }
    }
  }
};

export const BackupConfigurationInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "BackupConfigurationInfo",
    uberParent: "BackupConfigurationInfo",
    polymorphicDiscriminator: {
      serializedName: "Kind",
      clientName: "kind"
    },
    modelProperties: {
      kind: {
        serializedName: "Kind",
        required: true,
        type: {
          name: "String"
        }
      },
      policyName: {
        serializedName: "PolicyName",
        type: {
          name: "String"
        }
      },
      policyInheritedFrom: {
        serializedName: "PolicyInheritedFrom",
        type: {
          name: "String"
        }
      },
      suspensionInfo: {
        serializedName: "SuspensionInfo",
        type: {
          name: "Composite",
          className: "BackupSuspensionInfo"
        }
      }
    }
  }
};

export const BackupSuspensionInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "BackupSuspensionInfo",
    modelProperties: {
      isSuspended: {
        serializedName: "IsSuspended",
        type: {
          name: "Boolean"
        }
      },
      suspensionInheritedFrom: {
        serializedName: "SuspensionInheritedFrom",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const PagedBackupInfoList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PagedBackupInfoList",
    modelProperties: {
      continuationToken: {
        serializedName: "ContinuationToken",
        type: {
          name: "String"
        }
      },
      items: {
        serializedName: "Items",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "BackupInfo"
            }
          }
        }
      }
    }
  }
};

export const BackupInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "BackupInfo",
    modelProperties: {
      backupId: {
        serializedName: "BackupId",
        type: {
          name: "Uuid"
        }
      },
      backupChainId: {
        serializedName: "BackupChainId",
        type: {
          name: "Uuid"
        }
      },
      applicationName: {
        serializedName: "ApplicationName",
        type: {
          name: "String"
        }
      },
      serviceName: {
        serializedName: "ServiceName",
        type: {
          name: "String"
        }
      },
      partitionInformation: {
        serializedName: "PartitionInformation",
        type: {
          name: "Composite",
          className: "PartitionInformation"
        }
      },
      backupLocation: {
        serializedName: "BackupLocation",
        type: {
          name: "String"
        }
      },
      backupType: {
        serializedName: "BackupType",
        type: {
          name: "String"
        }
      },
      epochOfLastBackupRecord: {
        serializedName: "EpochOfLastBackupRecord",
        type: {
          name: "Composite",
          className: "Epoch"
        }
      },
      lsnOfLastBackupRecord: {
        serializedName: "LsnOfLastBackupRecord",
        type: {
          name: "String"
        }
      },
      creationTimeUtc: {
        serializedName: "CreationTimeUtc",
        type: {
          name: "DateTime"
        }
      },
      serviceManifestVersion: {
        serializedName: "ServiceManifestVersion",
        type: {
          name: "String"
        }
      },
      failureError: {
        serializedName: "FailureError",
        type: {
          name: "Composite",
          className: "FabricErrorError"
        }
      }
    }
  }
};

export const Epoch: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "Epoch",
    modelProperties: {
      configurationVersion: {
        serializedName: "ConfigurationVersion",
        type: {
          name: "String"
        }
      },
      dataLossVersion: {
        serializedName: "DataLossVersion",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const BackupPartitionDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "BackupPartitionDescription",
    modelProperties: {
      backupStorage: {
        serializedName: "BackupStorage",
        type: {
          name: "Composite",
          className: "BackupStorageDescription"
        }
      }
    }
  }
};

export const BackupProgressInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "BackupProgressInfo",
    modelProperties: {
      backupState: {
        serializedName: "BackupState",
        type: {
          name: "String"
        }
      },
      timeStampUtc: {
        serializedName: "TimeStampUtc",
        type: {
          name: "DateTime"
        }
      },
      backupId: {
        serializedName: "BackupId",
        type: {
          name: "Uuid"
        }
      },
      backupLocation: {
        serializedName: "BackupLocation",
        type: {
          name: "String"
        }
      },
      epochOfLastBackupRecord: {
        serializedName: "EpochOfLastBackupRecord",
        type: {
          name: "Composite",
          className: "Epoch"
        }
      },
      lsnOfLastBackupRecord: {
        serializedName: "LsnOfLastBackupRecord",
        type: {
          name: "String"
        }
      },
      failureError: {
        serializedName: "FailureError",
        type: {
          name: "Composite",
          className: "FabricErrorError"
        }
      }
    }
  }
};

export const RestorePartitionDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "RestorePartitionDescription",
    modelProperties: {
      backupId: {
        serializedName: "BackupId",
        required: true,
        type: {
          name: "Uuid"
        }
      },
      backupLocation: {
        serializedName: "BackupLocation",
        required: true,
        type: {
          name: "String"
        }
      },
      backupStorage: {
        serializedName: "BackupStorage",
        type: {
          name: "Composite",
          className: "BackupStorageDescription"
        }
      }
    }
  }
};

export const RestoreProgressInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "RestoreProgressInfo",
    modelProperties: {
      restoreState: {
        serializedName: "RestoreState",
        type: {
          name: "String"
        }
      },
      timeStampUtc: {
        serializedName: "TimeStampUtc",
        type: {
          name: "DateTime"
        }
      },
      restoredEpoch: {
        serializedName: "RestoredEpoch",
        type: {
          name: "Composite",
          className: "Epoch"
        }
      },
      restoredLsn: {
        serializedName: "RestoredLsn",
        type: {
          name: "String"
        }
      },
      failureError: {
        serializedName: "FailureError",
        type: {
          name: "Composite",
          className: "FabricErrorError"
        }
      }
    }
  }
};

export const GetBackupByStorageQueryDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "GetBackupByStorageQueryDescription",
    modelProperties: {
      startDateTimeFilter: {
        serializedName: "StartDateTimeFilter",
        type: {
          name: "DateTime"
        }
      },
      endDateTimeFilter: {
        serializedName: "EndDateTimeFilter",
        type: {
          name: "DateTime"
        }
      },
      latest: {
        defaultValue: false,
        serializedName: "Latest",
        type: {
          name: "Boolean"
        }
      },
      storage: {
        serializedName: "Storage",
        type: {
          name: "Composite",
          className: "BackupStorageDescription"
        }
      },
      backupEntity: {
        serializedName: "BackupEntity",
        type: {
          name: "Composite",
          className: "BackupEntity"
        }
      }
    }
  }
};

export const NameDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "NameDescription",
    modelProperties: {
      name: {
        serializedName: "Name",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const PagedSubNameInfoList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PagedSubNameInfoList",
    modelProperties: {
      continuationToken: {
        serializedName: "ContinuationToken",
        type: {
          name: "String"
        }
      },
      isConsistent: {
        serializedName: "IsConsistent",
        type: {
          name: "Boolean"
        }
      },
      subNames: {
        serializedName: "SubNames",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "String"
            }
          }
        }
      }
    }
  }
};

export const PagedPropertyInfoList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PagedPropertyInfoList",
    modelProperties: {
      continuationToken: {
        serializedName: "ContinuationToken",
        type: {
          name: "String"
        }
      },
      isConsistent: {
        serializedName: "IsConsistent",
        type: {
          name: "Boolean"
        }
      },
      properties: {
        serializedName: "Properties",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "PropertyInfo"
            }
          }
        }
      }
    }
  }
};

export const PropertyInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PropertyInfo",
    modelProperties: {
      name: {
        serializedName: "Name",
        required: true,
        type: {
          name: "String"
        }
      },
      value: {
        serializedName: "Value",
        type: {
          name: "Composite",
          className: "PropertyValue"
        }
      },
      metadata: {
        serializedName: "Metadata",
        type: {
          name: "Composite",
          className: "PropertyMetadata"
        }
      }
    }
  }
};

export const PropertyValue: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PropertyValue",
    uberParent: "PropertyValue",
    polymorphicDiscriminator: {
      serializedName: "Kind",
      clientName: "kind"
    },
    modelProperties: {
      kind: {
        serializedName: "Kind",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const PropertyMetadata: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PropertyMetadata",
    modelProperties: {
      typeId: {
        serializedName: "TypeId",
        type: {
          name: "String"
        }
      },
      customTypeId: {
        serializedName: "CustomTypeId",
        type: {
          name: "String"
        }
      },
      parent: {
        serializedName: "Parent",
        type: {
          name: "String"
        }
      },
      sizeInBytes: {
        serializedName: "SizeInBytes",
        type: {
          name: "Number"
        }
      },
      lastModifiedUtcTimestamp: {
        serializedName: "LastModifiedUtcTimestamp",
        type: {
          name: "DateTime"
        }
      },
      sequenceNumber: {
        serializedName: "SequenceNumber",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const PropertyDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PropertyDescription",
    modelProperties: {
      propertyName: {
        serializedName: "PropertyName",
        required: true,
        type: {
          name: "String"
        }
      },
      customTypeId: {
        serializedName: "CustomTypeId",
        type: {
          name: "String"
        }
      },
      value: {
        serializedName: "Value",
        type: {
          name: "Composite",
          className: "PropertyValue"
        }
      }
    }
  }
};

export const PropertyBatchDescriptionList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PropertyBatchDescriptionList",
    modelProperties: {
      operations: {
        serializedName: "Operations",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "PropertyBatchOperation"
            }
          }
        }
      }
    }
  }
};

export const PropertyBatchOperation: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PropertyBatchOperation",
    uberParent: "PropertyBatchOperation",
    polymorphicDiscriminator: {
      serializedName: "Kind",
      clientName: "kind"
    },
    modelProperties: {
      kind: {
        serializedName: "Kind",
        required: true,
        type: {
          name: "String"
        }
      },
      propertyName: {
        serializedName: "PropertyName",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const PropertyBatchInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PropertyBatchInfo",
    uberParent: "PropertyBatchInfo",
    polymorphicDiscriminator: {
      serializedName: "Kind",
      clientName: "kind"
    },
    modelProperties: {
      kind: {
        serializedName: "Kind",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const FabricEvent: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "FabricEvent",
    uberParent: "FabricEvent",
    polymorphicDiscriminator: {
      serializedName: "Kind",
      clientName: "kind"
    },
    modelProperties: {
      kind: {
        serializedName: "Kind",
        required: true,
        type: {
          name: "String"
        }
      },
      eventInstanceId: {
        serializedName: "EventInstanceId",
        required: true,
        type: {
          name: "Uuid"
        }
      },
      category: {
        serializedName: "Category",
        type: {
          name: "String"
        }
      },
      timeStamp: {
        serializedName: "TimeStamp",
        required: true,
        type: {
          name: "DateTime"
        }
      },
      hasCorrelatedEvents: {
        serializedName: "HasCorrelatedEvents",
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const SecretResourceDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "SecretResourceDescription",
    modelProperties: {
      properties: {
        serializedName: "properties",
        type: {
          name: "Composite",
          className: "SecretResourceProperties"
        }
      },
      name: {
        serializedName: "name",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const SecretResourcePropertiesBase: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "SecretResourcePropertiesBase",
    uberParent: "SecretResourcePropertiesBase",
    polymorphicDiscriminator: {
      serializedName: "kind",
      clientName: "kind"
    },
    modelProperties: {
      kind: {
        serializedName: "kind",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const PagedSecretResourceDescriptionList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PagedSecretResourceDescriptionList",
    modelProperties: {
      continuationToken: {
        serializedName: "ContinuationToken",
        type: {
          name: "String"
        }
      },
      items: {
        serializedName: "Items",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "SecretResourceDescription"
            }
          }
        }
      }
    }
  }
};

export const SecretValueResourceDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "SecretValueResourceDescription",
    modelProperties: {
      name: {
        serializedName: "name",
        required: true,
        type: {
          name: "String"
        }
      },
      value: {
        serializedName: "properties.value",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const SecretValueProperties: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "SecretValueProperties",
    modelProperties: {
      value: {
        serializedName: "value",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const PagedSecretValueResourceDescriptionList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PagedSecretValueResourceDescriptionList",
    modelProperties: {
      continuationToken: {
        serializedName: "ContinuationToken",
        type: {
          name: "String"
        }
      },
      items: {
        serializedName: "Items",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "SecretValueResourceDescription"
            }
          }
        }
      }
    }
  }
};

export const SecretValue: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "SecretValue",
    modelProperties: {
      value: {
        serializedName: "value",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const VolumeResourceDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "VolumeResourceDescription",
    modelProperties: {
      name: {
        serializedName: "name",
        required: true,
        type: {
          name: "String"
        }
      },
      description: {
        serializedName: "properties.description",
        type: {
          name: "String"
        }
      },
      status: {
        serializedName: "properties.status",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      statusDetails: {
        serializedName: "properties.statusDetails",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      provider: {
        serializedName: "properties.provider",
        required: true,
        type: {
          name: "String"
        }
      },
      azureFileParameters: {
        serializedName: "properties.azureFileParameters",
        type: {
          name: "Composite",
          className: "VolumeProviderParametersAzureFile"
        }
      }
    }
  }
};

export const VolumeProviderParametersAzureFile: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "VolumeProviderParametersAzureFile",
    modelProperties: {
      accountName: {
        serializedName: "accountName",
        required: true,
        type: {
          name: "String"
        }
      },
      accountKey: {
        serializedName: "accountKey",
        type: {
          name: "String"
        }
      },
      shareName: {
        serializedName: "shareName",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const PagedVolumeResourceDescriptionList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PagedVolumeResourceDescriptionList",
    modelProperties: {
      continuationToken: {
        serializedName: "ContinuationToken",
        type: {
          name: "String"
        }
      },
      items: {
        serializedName: "Items",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "VolumeResourceDescription"
            }
          }
        }
      }
    }
  }
};

export const NetworkResourceDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "NetworkResourceDescription",
    modelProperties: {
      name: {
        serializedName: "name",
        required: true,
        type: {
          name: "String"
        }
      },
      properties: {
        serializedName: "properties",
        type: {
          name: "Composite",
          className: "NetworkResourceProperties"
        }
      }
    }
  }
};

export const NetworkResourcePropertiesBase: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "NetworkResourcePropertiesBase",
    uberParent: "NetworkResourcePropertiesBase",
    polymorphicDiscriminator: {
      serializedName: "kind",
      clientName: "kind"
    },
    modelProperties: {
      kind: {
        serializedName: "kind",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const PagedNetworkResourceDescriptionList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PagedNetworkResourceDescriptionList",
    modelProperties: {
      continuationToken: {
        serializedName: "ContinuationToken",
        type: {
          name: "String"
        }
      },
      items: {
        serializedName: "Items",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "NetworkResourceDescription"
            }
          }
        }
      }
    }
  }
};

export const ApplicationResourceDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationResourceDescription",
    modelProperties: {
      name: {
        serializedName: "name",
        required: true,
        type: {
          name: "String"
        }
      },
      identity: {
        serializedName: "identity",
        type: {
          name: "Composite",
          className: "IdentityDescription"
        }
      },
      description: {
        serializedName: "properties.description",
        type: {
          name: "String"
        }
      },
      services: {
        serializedName: "properties.services",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ServiceResourceDescription"
            }
          }
        }
      },
      diagnostics: {
        serializedName: "properties.diagnostics",
        type: {
          name: "Composite",
          className: "DiagnosticsDescription"
        }
      },
      debugParams: {
        serializedName: "properties.debugParams",
        type: {
          name: "String"
        }
      },
      serviceNames: {
        serializedName: "properties.serviceNames",
        readOnly: true,
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "String"
            }
          }
        }
      },
      status: {
        serializedName: "properties.status",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      statusDetails: {
        serializedName: "properties.statusDetails",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      healthState: {
        serializedName: "properties.healthState",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      unhealthyEvaluation: {
        serializedName: "properties.unhealthyEvaluation",
        readOnly: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ServiceResourceDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceResourceDescription",
    modelProperties: {
      name: {
        serializedName: "name",
        required: true,
        type: {
          name: "String"
        }
      },
      osType: {
        serializedName: "properties.osType",
        required: true,
        type: {
          name: "String"
        }
      },
      codePackages: {
        serializedName: "properties.codePackages",
        required: true,
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ContainerCodePackageProperties"
            }
          }
        }
      },
      networkRefs: {
        serializedName: "properties.networkRefs",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "NetworkRef"
            }
          }
        }
      },
      diagnostics: {
        serializedName: "properties.diagnostics",
        type: {
          name: "Composite",
          className: "DiagnosticsRef"
        }
      },
      description: {
        serializedName: "properties.description",
        type: {
          name: "String"
        }
      },
      replicaCount: {
        serializedName: "properties.replicaCount",
        type: {
          name: "Number"
        }
      },
      executionPolicy: {
        serializedName: "properties.executionPolicy",
        type: {
          name: "Composite",
          className: "ExecutionPolicy"
        }
      },
      autoScalingPolicies: {
        serializedName: "properties.autoScalingPolicies",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "AutoScalingPolicy"
            }
          }
        }
      },
      status: {
        serializedName: "properties.status",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      statusDetails: {
        serializedName: "properties.statusDetails",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      healthState: {
        serializedName: "properties.healthState",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      unhealthyEvaluation: {
        serializedName: "properties.unhealthyEvaluation",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      identityRefs: {
        serializedName: "properties.identityRefs",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ServiceIdentity"
            }
          }
        }
      },
      dnsName: {
        serializedName: "properties.dnsName",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ServiceReplicaProperties: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceReplicaProperties",
    modelProperties: {
      osType: {
        serializedName: "osType",
        required: true,
        type: {
          name: "String"
        }
      },
      codePackages: {
        serializedName: "codePackages",
        required: true,
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ContainerCodePackageProperties"
            }
          }
        }
      },
      networkRefs: {
        serializedName: "networkRefs",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "NetworkRef"
            }
          }
        }
      },
      diagnostics: {
        serializedName: "diagnostics",
        type: {
          name: "Composite",
          className: "DiagnosticsRef"
        }
      }
    }
  }
};

export const ContainerCodePackageProperties: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ContainerCodePackageProperties",
    modelProperties: {
      name: {
        serializedName: "name",
        required: true,
        type: {
          name: "String"
        }
      },
      image: {
        serializedName: "image",
        required: true,
        type: {
          name: "String"
        }
      },
      imageRegistryCredential: {
        serializedName: "imageRegistryCredential",
        type: {
          name: "Composite",
          className: "ImageRegistryCredential"
        }
      },
      entryPoint: {
        serializedName: "entryPoint",
        type: {
          name: "String"
        }
      },
      commands: {
        serializedName: "commands",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "String"
            }
          }
        }
      },
      environmentVariables: {
        serializedName: "environmentVariables",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "EnvironmentVariable"
            }
          }
        }
      },
      settings: {
        serializedName: "settings",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "Setting"
            }
          }
        }
      },
      labels: {
        serializedName: "labels",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ContainerLabel"
            }
          }
        }
      },
      endpoints: {
        serializedName: "endpoints",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "EndpointProperties"
            }
          }
        }
      },
      resources: {
        serializedName: "resources",
        type: {
          name: "Composite",
          className: "ResourceRequirements"
        }
      },
      volumeRefs: {
        serializedName: "volumeRefs",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "VolumeReference"
            }
          }
        }
      },
      volumes: {
        serializedName: "volumes",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ApplicationScopedVolume"
            }
          }
        }
      },
      diagnostics: {
        serializedName: "diagnostics",
        type: {
          name: "Composite",
          className: "DiagnosticsRef"
        }
      },
      reliableCollectionsRefs: {
        serializedName: "reliableCollectionsRefs",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ReliableCollectionsRef"
            }
          }
        }
      },
      instanceView: {
        serializedName: "instanceView",
        type: {
          name: "Composite",
          className: "ContainerInstanceView"
        }
      },
      livenessProbe: {
        serializedName: "livenessProbe",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "Probe"
            }
          }
        }
      },
      readinessProbe: {
        serializedName: "readinessProbe",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "Probe"
            }
          }
        }
      }
    }
  }
};

export const ImageRegistryCredential: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ImageRegistryCredential",
    modelProperties: {
      server: {
        serializedName: "server",
        required: true,
        type: {
          name: "String"
        }
      },
      username: {
        serializedName: "username",
        required: true,
        type: {
          name: "String"
        }
      },
      passwordType: {
        defaultValue: "ClearText",
        serializedName: "passwordType",
        type: {
          name: "String"
        }
      },
      password: {
        serializedName: "password",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const EnvironmentVariable: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "EnvironmentVariable",
    modelProperties: {
      type: {
        defaultValue: "ClearText",
        serializedName: "type",
        type: {
          name: "String"
        }
      },
      name: {
        serializedName: "name",
        type: {
          name: "String"
        }
      },
      value: {
        serializedName: "value",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const Setting: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "Setting",
    modelProperties: {
      type: {
        defaultValue: "ClearText",
        serializedName: "type",
        type: {
          name: "String"
        }
      },
      name: {
        serializedName: "name",
        type: {
          name: "String"
        }
      },
      value: {
        serializedName: "value",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ContainerLabel: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ContainerLabel",
    modelProperties: {
      name: {
        serializedName: "name",
        required: true,
        type: {
          name: "String"
        }
      },
      value: {
        serializedName: "value",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const EndpointProperties: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "EndpointProperties",
    modelProperties: {
      name: {
        serializedName: "name",
        required: true,
        type: {
          name: "String"
        }
      },
      port: {
        serializedName: "port",
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ResourceRequirements: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ResourceRequirements",
    modelProperties: {
      requests: {
        serializedName: "requests",
        type: {
          name: "Composite",
          className: "ResourceRequests"
        }
      },
      limits: {
        serializedName: "limits",
        type: {
          name: "Composite",
          className: "ResourceLimits"
        }
      }
    }
  }
};

export const ResourceRequests: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ResourceRequests",
    modelProperties: {
      memoryInGB: {
        serializedName: "memoryInGB",
        required: true,
        type: {
          name: "Number"
        }
      },
      cpu: {
        serializedName: "cpu",
        required: true,
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ResourceLimits: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ResourceLimits",
    modelProperties: {
      memoryInGB: {
        serializedName: "memoryInGB",
        type: {
          name: "Number"
        }
      },
      cpu: {
        serializedName: "cpu",
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const VolumeReference: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "VolumeReference",
    modelProperties: {
      name: {
        serializedName: "name",
        required: true,
        type: {
          name: "String"
        }
      },
      readOnly: {
        serializedName: "readOnly",
        type: {
          name: "Boolean"
        }
      },
      destinationPath: {
        serializedName: "destinationPath",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ApplicationScopedVolumeCreationParameters: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationScopedVolumeCreationParameters",
    uberParent: "ApplicationScopedVolumeCreationParameters",
    polymorphicDiscriminator: {
      serializedName: "kind",
      clientName: "kind"
    },
    modelProperties: {
      kind: {
        serializedName: "kind",
        required: true,
        type: {
          name: "String"
        }
      },
      description: {
        serializedName: "description",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const DiagnosticsRef: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "DiagnosticsRef",
    modelProperties: {
      enabled: {
        serializedName: "enabled",
        type: {
          name: "Boolean"
        }
      },
      sinkRefs: {
        serializedName: "sinkRefs",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "String"
            }
          }
        }
      }
    }
  }
};

export const ReliableCollectionsRef: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ReliableCollectionsRef",
    modelProperties: {
      name: {
        serializedName: "name",
        required: true,
        type: {
          name: "String"
        }
      },
      doNotPersistState: {
        serializedName: "doNotPersistState",
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const ContainerInstanceView: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ContainerInstanceView",
    modelProperties: {
      restartCount: {
        serializedName: "restartCount",
        type: {
          name: "Number"
        }
      },
      currentState: {
        serializedName: "currentState",
        type: {
          name: "Composite",
          className: "ContainerState"
        }
      },
      previousState: {
        serializedName: "previousState",
        type: {
          name: "Composite",
          className: "ContainerState"
        }
      },
      events: {
        serializedName: "events",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ContainerEvent"
            }
          }
        }
      }
    }
  }
};

export const ContainerState: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ContainerState",
    modelProperties: {
      state: {
        serializedName: "state",
        type: {
          name: "String"
        }
      },
      startTime: {
        serializedName: "startTime",
        type: {
          name: "DateTime"
        }
      },
      exitCode: {
        serializedName: "exitCode",
        type: {
          name: "String"
        }
      },
      finishTime: {
        serializedName: "finishTime",
        type: {
          name: "DateTime"
        }
      },
      detailStatus: {
        serializedName: "detailStatus",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ContainerEvent: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ContainerEvent",
    modelProperties: {
      name: {
        serializedName: "name",
        type: {
          name: "String"
        }
      },
      count: {
        serializedName: "count",
        type: {
          name: "Number"
        }
      },
      firstTimestamp: {
        serializedName: "firstTimestamp",
        type: {
          name: "String"
        }
      },
      lastTimestamp: {
        serializedName: "lastTimestamp",
        type: {
          name: "String"
        }
      },
      message: {
        serializedName: "message",
        type: {
          name: "String"
        }
      },
      type: {
        serializedName: "type",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const Probe: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "Probe",
    modelProperties: {
      initialDelaySeconds: {
        defaultValue: 0,
        serializedName: "initialDelaySeconds",
        type: {
          name: "Number"
        }
      },
      periodSeconds: {
        defaultValue: 10,
        serializedName: "periodSeconds",
        type: {
          name: "Number"
        }
      },
      timeoutSeconds: {
        defaultValue: 1,
        serializedName: "timeoutSeconds",
        type: {
          name: "Number"
        }
      },
      successThreshold: {
        defaultValue: 1,
        serializedName: "successThreshold",
        type: {
          name: "Number"
        }
      },
      failureThreshold: {
        defaultValue: 3,
        serializedName: "failureThreshold",
        type: {
          name: "Number"
        }
      },
      exec: {
        serializedName: "exec",
        type: {
          name: "Composite",
          className: "ProbeExec"
        }
      },
      httpGet: {
        serializedName: "httpGet",
        type: {
          name: "Composite",
          className: "ProbeHttpGet"
        }
      },
      tcpSocket: {
        serializedName: "tcpSocket",
        type: {
          name: "Composite",
          className: "ProbeTcpSocket"
        }
      }
    }
  }
};

export const ProbeExec: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ProbeExec",
    modelProperties: {
      command: {
        serializedName: "command",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ProbeHttpGet: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ProbeHttpGet",
    modelProperties: {
      port: {
        serializedName: "port",
        required: true,
        type: {
          name: "Number"
        }
      },
      path: {
        serializedName: "path",
        type: {
          name: "String"
        }
      },
      host: {
        serializedName: "host",
        type: {
          name: "String"
        }
      },
      httpHeaders: {
        serializedName: "httpHeaders",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ProbeHttpGetHeaders"
            }
          }
        }
      },
      scheme: {
        serializedName: "scheme",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ProbeHttpGetHeaders: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ProbeHttpGetHeaders",
    modelProperties: {
      name: {
        serializedName: "name",
        required: true,
        type: {
          name: "String"
        }
      },
      value: {
        serializedName: "value",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ProbeTcpSocket: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ProbeTcpSocket",
    modelProperties: {
      port: {
        serializedName: "port",
        required: true,
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const NetworkRef: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "NetworkRef",
    modelProperties: {
      name: {
        serializedName: "name",
        type: {
          name: "String"
        }
      },
      endpointRefs: {
        serializedName: "endpointRefs",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "EndpointRef"
            }
          }
        }
      }
    }
  }
};

export const EndpointRef: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "EndpointRef",
    modelProperties: {
      name: {
        serializedName: "name",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ServiceProperties: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceProperties",
    modelProperties: {
      description: {
        serializedName: "description",
        type: {
          name: "String"
        }
      },
      replicaCount: {
        serializedName: "replicaCount",
        type: {
          name: "Number"
        }
      },
      executionPolicy: {
        serializedName: "executionPolicy",
        type: {
          name: "Composite",
          className: "ExecutionPolicy"
        }
      },
      autoScalingPolicies: {
        serializedName: "autoScalingPolicies",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "AutoScalingPolicy"
            }
          }
        }
      },
      status: {
        serializedName: "status",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      statusDetails: {
        serializedName: "statusDetails",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      healthState: {
        serializedName: "healthState",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      unhealthyEvaluation: {
        serializedName: "unhealthyEvaluation",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      identityRefs: {
        serializedName: "identityRefs",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ServiceIdentity"
            }
          }
        }
      },
      dnsName: {
        serializedName: "dnsName",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ExecutionPolicy: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ExecutionPolicy",
    uberParent: "ExecutionPolicy",
    polymorphicDiscriminator: {
      serializedName: "type",
      clientName: "type"
    },
    modelProperties: {
      type: {
        serializedName: "type",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const AutoScalingPolicy: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "AutoScalingPolicy",
    modelProperties: {
      name: {
        serializedName: "name",
        required: true,
        type: {
          name: "String"
        }
      },
      trigger: {
        serializedName: "trigger",
        type: {
          name: "Composite",
          className: "AutoScalingTrigger"
        }
      },
      mechanism: {
        serializedName: "mechanism",
        type: {
          name: "Composite",
          className: "AutoScalingMechanism"
        }
      }
    }
  }
};

export const AutoScalingTrigger: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "AutoScalingTrigger",
    uberParent: "AutoScalingTrigger",
    polymorphicDiscriminator: {
      serializedName: "kind",
      clientName: "kind"
    },
    modelProperties: {
      kind: {
        serializedName: "kind",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const AutoScalingMechanism: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "AutoScalingMechanism",
    uberParent: "AutoScalingMechanism",
    polymorphicDiscriminator: {
      serializedName: "kind",
      clientName: "kind"
    },
    modelProperties: {
      kind: {
        serializedName: "kind",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ServiceIdentity: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceIdentity",
    modelProperties: {
      name: {
        serializedName: "name",
        type: {
          name: "String"
        }
      },
      identityRef: {
        serializedName: "identityRef",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const DiagnosticsDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "DiagnosticsDescription",
    modelProperties: {
      sinks: {
        serializedName: "sinks",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "DiagnosticsSinkProperties"
            }
          }
        }
      },
      enabled: {
        serializedName: "enabled",
        type: {
          name: "Boolean"
        }
      },
      defaultSinkRefs: {
        serializedName: "defaultSinkRefs",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "String"
            }
          }
        }
      }
    }
  }
};

export const DiagnosticsSinkProperties: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "DiagnosticsSinkProperties",
    uberParent: "DiagnosticsSinkProperties",
    polymorphicDiscriminator: {
      serializedName: "kind",
      clientName: "kind"
    },
    modelProperties: {
      kind: {
        serializedName: "kind",
        required: true,
        type: {
          name: "String"
        }
      },
      name: {
        serializedName: "name",
        type: {
          name: "String"
        }
      },
      description: {
        serializedName: "description",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const IdentityDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "IdentityDescription",
    modelProperties: {
      tokenServiceEndpoint: {
        serializedName: "tokenServiceEndpoint",
        type: {
          name: "String"
        }
      },
      type: {
        serializedName: "type",
        required: true,
        type: {
          name: "String"
        }
      },
      tenantId: {
        serializedName: "tenantId",
        type: {
          name: "String"
        }
      },
      principalId: {
        serializedName: "principalId",
        type: {
          name: "String"
        }
      },
      userAssignedIdentities: {
        serializedName: "userAssignedIdentities",
        type: {
          name: "Dictionary",
          value: {
            type: { name: "Composite", className: "IdentityItemDescription" }
          }
        }
      }
    }
  }
};

export const IdentityItemDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "IdentityItemDescription",
    modelProperties: {
      principalId: {
        serializedName: "principalId",
        type: {
          name: "String"
        }
      },
      clientId: {
        serializedName: "clientId",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const PagedApplicationResourceDescriptionList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PagedApplicationResourceDescriptionList",
    modelProperties: {
      continuationToken: {
        serializedName: "ContinuationToken",
        type: {
          name: "String"
        }
      },
      items: {
        serializedName: "Items",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ApplicationResourceDescription"
            }
          }
        }
      }
    }
  }
};

export const ApplicationResourceUpgradeProgressInfo: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationResourceUpgradeProgressInfo",
    modelProperties: {
      name: {
        serializedName: "Name",
        type: {
          name: "String"
        }
      },
      targetApplicationTypeVersion: {
        serializedName: "TargetApplicationTypeVersion",
        type: {
          name: "String"
        }
      },
      startTimestampUtc: {
        serializedName: "StartTimestampUtc",
        type: {
          name: "String"
        }
      },
      upgradeState: {
        serializedName: "UpgradeState",
        type: {
          name: "String"
        }
      },
      percentCompleted: {
        serializedName: "PercentCompleted",
        type: {
          name: "String"
        }
      },
      serviceUpgradeProgress: {
        serializedName: "ServiceUpgradeProgress",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ServiceUpgradeProgress"
            }
          }
        }
      },
      rollingUpgradeMode: {
        defaultValue: "Monitored",
        serializedName: "RollingUpgradeMode",
        type: {
          name: "String"
        }
      },
      upgradeDuration: {
        defaultValue: "PT0H2M0S",
        serializedName: "UpgradeDuration",
        type: {
          name: "String"
        }
      },
      applicationUpgradeStatusDetails: {
        serializedName: "ApplicationUpgradeStatusDetails",
        type: {
          name: "String"
        }
      },
      upgradeReplicaSetCheckTimeoutInSeconds: {
        defaultValue: 42949672925,
        serializedName: "UpgradeReplicaSetCheckTimeoutInSeconds",
        type: {
          name: "Number"
        }
      },
      failureTimestampUtc: {
        serializedName: "FailureTimestampUtc",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ServiceUpgradeProgress: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceUpgradeProgress",
    modelProperties: {
      serviceName: {
        serializedName: "ServiceName",
        type: {
          name: "String"
        }
      },
      completedReplicaCount: {
        serializedName: "CompletedReplicaCount",
        type: {
          name: "String"
        }
      },
      pendingReplicaCount: {
        serializedName: "PendingReplicaCount",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const PagedServiceResourceDescriptionList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PagedServiceResourceDescriptionList",
    modelProperties: {
      continuationToken: {
        serializedName: "ContinuationToken",
        type: {
          name: "String"
        }
      },
      items: {
        serializedName: "Items",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ServiceResourceDescription"
            }
          }
        }
      }
    }
  }
};

export const PagedServiceReplicaDescriptionList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PagedServiceReplicaDescriptionList",
    modelProperties: {
      continuationToken: {
        serializedName: "ContinuationToken",
        type: {
          name: "String"
        }
      },
      items: {
        serializedName: "Items",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ServiceReplicaDescription"
            }
          }
        }
      }
    }
  }
};

export const GatewayResourceDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "GatewayResourceDescription",
    modelProperties: {
      name: {
        serializedName: "name",
        required: true,
        type: {
          name: "String"
        }
      },
      description: {
        serializedName: "properties.description",
        type: {
          name: "String"
        }
      },
      sourceNetwork: {
        serializedName: "properties.sourceNetwork",
        type: {
          name: "Composite",
          className: "NetworkRef"
        }
      },
      destinationNetwork: {
        serializedName: "properties.destinationNetwork",
        type: {
          name: "Composite",
          className: "NetworkRef"
        }
      },
      tcp: {
        serializedName: "properties.tcp",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "TcpConfig"
            }
          }
        }
      },
      http: {
        serializedName: "properties.http",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HttpConfig"
            }
          }
        }
      },
      status: {
        serializedName: "properties.status",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      statusDetails: {
        serializedName: "properties.statusDetails",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      ipAddress: {
        serializedName: "properties.ipAddress",
        readOnly: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const TcpConfig: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "TcpConfig",
    modelProperties: {
      name: {
        serializedName: "name",
        required: true,
        type: {
          name: "String"
        }
      },
      port: {
        serializedName: "port",
        required: true,
        type: {
          name: "Number"
        }
      },
      destination: {
        serializedName: "destination",
        type: {
          name: "Composite",
          className: "GatewayDestination"
        }
      }
    }
  }
};

export const GatewayDestination: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "GatewayDestination",
    modelProperties: {
      applicationName: {
        serializedName: "applicationName",
        required: true,
        type: {
          name: "String"
        }
      },
      serviceName: {
        serializedName: "serviceName",
        required: true,
        type: {
          name: "String"
        }
      },
      endpointName: {
        serializedName: "endpointName",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const HttpConfig: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "HttpConfig",
    modelProperties: {
      name: {
        serializedName: "name",
        required: true,
        type: {
          name: "String"
        }
      },
      port: {
        serializedName: "port",
        required: true,
        type: {
          name: "Number"
        }
      },
      hosts: {
        serializedName: "hosts",
        required: true,
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HttpHostConfig"
            }
          }
        }
      }
    }
  }
};

export const HttpHostConfig: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "HttpHostConfig",
    modelProperties: {
      name: {
        serializedName: "name",
        required: true,
        type: {
          name: "String"
        }
      },
      routes: {
        serializedName: "routes",
        required: true,
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HttpRouteConfig"
            }
          }
        }
      }
    }
  }
};

export const HttpRouteConfig: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "HttpRouteConfig",
    modelProperties: {
      name: {
        serializedName: "name",
        required: true,
        type: {
          name: "String"
        }
      },
      match: {
        serializedName: "match",
        type: {
          name: "Composite",
          className: "HttpRouteMatchRule"
        }
      },
      destination: {
        serializedName: "destination",
        type: {
          name: "Composite",
          className: "GatewayDestination"
        }
      }
    }
  }
};

export const HttpRouteMatchRule: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "HttpRouteMatchRule",
    modelProperties: {
      path: {
        serializedName: "path",
        type: {
          name: "Composite",
          className: "HttpRouteMatchPath"
        }
      },
      headers: {
        serializedName: "headers",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HttpRouteMatchHeader"
            }
          }
        }
      }
    }
  }
};

export const HttpRouteMatchPath: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "HttpRouteMatchPath",
    modelProperties: {
      value: {
        serializedName: "value",
        required: true,
        type: {
          name: "String"
        }
      },
      rewrite: {
        serializedName: "rewrite",
        type: {
          name: "String"
        }
      },
      type: {
        serializedName: "type",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const HttpRouteMatchHeader: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "HttpRouteMatchHeader",
    modelProperties: {
      name: {
        serializedName: "name",
        required: true,
        type: {
          name: "String"
        }
      },
      value: {
        serializedName: "value",
        type: {
          name: "String"
        }
      },
      type: {
        serializedName: "type",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const PagedGatewayResourceDescriptionList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PagedGatewayResourceDescriptionList",
    modelProperties: {
      continuationToken: {
        serializedName: "ContinuationToken",
        type: {
          name: "String"
        }
      },
      items: {
        serializedName: "Items",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "GatewayResourceDescription"
            }
          }
        }
      }
    }
  }
};

export const AnalysisEventMetadata: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "AnalysisEventMetadata",
    modelProperties: {
      delay: {
        serializedName: "Delay",
        type: {
          name: "TimeSpan"
        }
      },
      duration: {
        serializedName: "Duration",
        type: {
          name: "TimeSpan"
        }
      }
    }
  }
};

export const ReconfigurationInformation: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ReconfigurationInformation",
    modelProperties: {
      previousConfigurationRole: {
        serializedName: "PreviousConfigurationRole",
        type: {
          name: "String"
        }
      },
      reconfigurationPhase: {
        serializedName: "ReconfigurationPhase",
        type: {
          name: "String"
        }
      },
      reconfigurationType: {
        serializedName: "ReconfigurationType",
        type: {
          name: "String"
        }
      },
      reconfigurationStartTimeUtc: {
        serializedName: "ReconfigurationStartTimeUtc",
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const LoadedPartitionInformationQueryDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "LoadedPartitionInformationQueryDescription",
    modelProperties: {
      metricName: {
        serializedName: "MetricName",
        type: {
          name: "String"
        }
      },
      serviceName: {
        serializedName: "ServiceName",
        type: {
          name: "String"
        }
      },
      ordering: {
        serializedName: "Ordering",
        type: {
          name: "String"
        }
      },
      maxResults: {
        serializedName: "MaxResults",
        type: {
          name: "Number"
        }
      },
      continuationToken: {
        serializedName: "ContinuationToken",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ApplicationTypeImageStorePath: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationTypeImageStorePath",
    modelProperties: {
      applicationTypeBuildPath: {
        serializedName: "ApplicationTypeBuildPath",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ReplicaLifecycleDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ReplicaLifecycleDescription",
    modelProperties: {
      isSingletonReplicaMoveAllowedDuringUpgrade: {
        serializedName: "IsSingletonReplicaMoveAllowedDuringUpgrade",
        type: {
          name: "Boolean"
        }
      },
      restoreReplicaLocationAfterUpgrade: {
        serializedName: "RestoreReplicaLocationAfterUpgrade",
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const InstanceLifecycleDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "InstanceLifecycleDescription",
    modelProperties: {
      restoreReplicaLocationAfterUpgrade: {
        serializedName: "RestoreReplicaLocationAfterUpgrade",
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const ReplicatorQueueStatus: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ReplicatorQueueStatus",
    modelProperties: {
      queueUtilizationPercentage: {
        serializedName: "QueueUtilizationPercentage",
        type: {
          name: "Number"
        }
      },
      queueMemorySize: {
        serializedName: "QueueMemorySize",
        type: {
          name: "String"
        }
      },
      firstSequenceNumber: {
        serializedName: "FirstSequenceNumber",
        type: {
          name: "String"
        }
      },
      completedSequenceNumber: {
        serializedName: "CompletedSequenceNumber",
        type: {
          name: "String"
        }
      },
      committedSequenceNumber: {
        serializedName: "CommittedSequenceNumber",
        type: {
          name: "String"
        }
      },
      lastSequenceNumber: {
        serializedName: "LastSequenceNumber",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ReplicatorStatus: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ReplicatorStatus",
    uberParent: "ReplicatorStatus",
    polymorphicDiscriminator: {
      serializedName: "Kind",
      clientName: "kind"
    },
    modelProperties: {
      kind: {
        serializedName: "Kind",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const RemoteReplicatorStatus: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "RemoteReplicatorStatus",
    modelProperties: {
      replicaId: {
        serializedName: "ReplicaId",
        type: {
          name: "String"
        }
      },
      lastAcknowledgementProcessedTimeUtc: {
        serializedName: "LastAcknowledgementProcessedTimeUtc",
        type: {
          name: "DateTime"
        }
      },
      lastReceivedReplicationSequenceNumber: {
        serializedName: "LastReceivedReplicationSequenceNumber",
        type: {
          name: "String"
        }
      },
      lastAppliedReplicationSequenceNumber: {
        serializedName: "LastAppliedReplicationSequenceNumber",
        type: {
          name: "String"
        }
      },
      isInBuild: {
        serializedName: "IsInBuild",
        type: {
          name: "Boolean"
        }
      },
      lastReceivedCopySequenceNumber: {
        serializedName: "LastReceivedCopySequenceNumber",
        type: {
          name: "String"
        }
      },
      lastAppliedCopySequenceNumber: {
        serializedName: "LastAppliedCopySequenceNumber",
        type: {
          name: "String"
        }
      },
      remoteReplicatorAcknowledgementStatus: {
        serializedName: "RemoteReplicatorAcknowledgementStatus",
        type: {
          name: "Composite",
          className: "RemoteReplicatorAcknowledgementStatus"
        }
      }
    }
  }
};

export const RemoteReplicatorAcknowledgementStatus: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "RemoteReplicatorAcknowledgementStatus",
    modelProperties: {
      replicationStreamAcknowledgementDetail: {
        serializedName: "ReplicationStreamAcknowledgementDetail",
        type: {
          name: "Composite",
          className: "RemoteReplicatorAcknowledgementDetail"
        }
      },
      copyStreamAcknowledgementDetail: {
        serializedName: "CopyStreamAcknowledgementDetail",
        type: {
          name: "Composite",
          className: "RemoteReplicatorAcknowledgementDetail"
        }
      }
    }
  }
};

export const RemoteReplicatorAcknowledgementDetail: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "RemoteReplicatorAcknowledgementDetail",
    modelProperties: {
      averageReceiveDuration: {
        serializedName: "AverageReceiveDuration",
        type: {
          name: "String"
        }
      },
      averageApplyDuration: {
        serializedName: "AverageApplyDuration",
        type: {
          name: "String"
        }
      },
      notReceivedCount: {
        serializedName: "NotReceivedCount",
        type: {
          name: "String"
        }
      },
      receivedAndNotAppliedCount: {
        serializedName: "ReceivedAndNotAppliedCount",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ReplicaStatusBase: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ReplicaStatusBase",
    uberParent: "ReplicaStatusBase",
    polymorphicDiscriminator: {
      serializedName: "Kind",
      clientName: "kind"
    },
    modelProperties: {
      kind: {
        serializedName: "Kind",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const NodeImpact: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "NodeImpact",
    modelProperties: {
      nodeName: {
        serializedName: "NodeName",
        required: true,
        type: {
          name: "String"
        }
      },
      impactLevel: {
        serializedName: "ImpactLevel",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const AutoScalingMetric: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "AutoScalingMetric",
    uberParent: "AutoScalingMetric",
    polymorphicDiscriminator: {
      serializedName: "kind",
      clientName: "kind"
    },
    modelProperties: {
      kind: {
        serializedName: "kind",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const NodeHealthState: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "NodeHealthState",
    modelProperties: {
      ...EntityHealthState.type.modelProperties,
      name: {
        serializedName: "Name",
        type: {
          name: "String"
        }
      },
      id: {
        serializedName: "Id",
        type: {
          name: "Composite",
          className: "NodeId"
        }
      }
    }
  }
};

export const ApplicationHealthState: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationHealthState",
    modelProperties: {
      ...EntityHealthState.type.modelProperties,
      name: {
        serializedName: "Name",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ServiceHealthState: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceHealthState",
    modelProperties: {
      ...EntityHealthState.type.modelProperties,
      serviceName: {
        serializedName: "ServiceName",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const DeployedApplicationHealthState: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "DeployedApplicationHealthState",
    modelProperties: {
      ...EntityHealthState.type.modelProperties,
      nodeName: {
        serializedName: "NodeName",
        type: {
          name: "String"
        }
      },
      applicationName: {
        serializedName: "ApplicationName",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const DeployedServicePackageHealthState: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "DeployedServicePackageHealthState",
    modelProperties: {
      ...EntityHealthState.type.modelProperties,
      nodeName: {
        serializedName: "NodeName",
        type: {
          name: "String"
        }
      },
      applicationName: {
        serializedName: "ApplicationName",
        type: {
          name: "String"
        }
      },
      serviceManifestName: {
        serializedName: "ServiceManifestName",
        type: {
          name: "String"
        }
      },
      servicePackageActivationId: {
        serializedName: "ServicePackageActivationId",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const PartitionHealthState: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PartitionHealthState",
    modelProperties: {
      ...EntityHealthState.type.modelProperties,
      partitionId: {
        serializedName: "PartitionId",
        type: {
          name: "Uuid"
        }
      }
    }
  }
};

export const ReplicaHealthState: coreClient.CompositeMapper = {
  serializedName: "ReplicaHealthState",
  type: {
    name: "Composite",
    className: "ReplicaHealthState",
    uberParent: "EntityHealthState",
    polymorphicDiscriminator: {
      serializedName: "ServiceKind",
      clientName: "serviceKind"
    },
    modelProperties: {
      ...EntityHealthState.type.modelProperties,
      serviceKind: {
        serializedName: "ServiceKind",
        required: true,
        type: {
          name: "String"
        }
      },
      partitionId: {
        serializedName: "PartitionId",
        type: {
          name: "Uuid"
        }
      }
    }
  }
};

export const ClusterHealth: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ClusterHealth",
    modelProperties: {
      ...EntityHealth.type.modelProperties,
      nodeHealthStates: {
        serializedName: "NodeHealthStates",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "NodeHealthState"
            }
          }
        }
      },
      applicationHealthStates: {
        serializedName: "ApplicationHealthStates",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ApplicationHealthState"
            }
          }
        }
      }
    }
  }
};

export const NodeHealth: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "NodeHealth",
    modelProperties: {
      ...EntityHealth.type.modelProperties,
      name: {
        serializedName: "Name",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ApplicationHealth: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationHealth",
    modelProperties: {
      ...EntityHealth.type.modelProperties,
      name: {
        serializedName: "Name",
        type: {
          name: "String"
        }
      },
      serviceHealthStates: {
        serializedName: "ServiceHealthStates",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ServiceHealthState"
            }
          }
        }
      },
      deployedApplicationHealthStates: {
        serializedName: "DeployedApplicationHealthStates",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "DeployedApplicationHealthState"
            }
          }
        }
      }
    }
  }
};

export const DeployedApplicationHealth: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "DeployedApplicationHealth",
    modelProperties: {
      ...EntityHealth.type.modelProperties,
      name: {
        serializedName: "Name",
        type: {
          name: "String"
        }
      },
      nodeName: {
        serializedName: "NodeName",
        type: {
          name: "String"
        }
      },
      deployedServicePackageHealthStates: {
        serializedName: "DeployedServicePackageHealthStates",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "DeployedServicePackageHealthState"
            }
          }
        }
      }
    }
  }
};

export const ServiceHealth: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceHealth",
    modelProperties: {
      ...EntityHealth.type.modelProperties,
      name: {
        serializedName: "Name",
        type: {
          name: "String"
        }
      },
      partitionHealthStates: {
        serializedName: "PartitionHealthStates",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "PartitionHealthState"
            }
          }
        }
      }
    }
  }
};

export const PartitionHealth: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PartitionHealth",
    modelProperties: {
      ...EntityHealth.type.modelProperties,
      partitionId: {
        serializedName: "PartitionId",
        type: {
          name: "Uuid"
        }
      },
      replicaHealthStates: {
        serializedName: "ReplicaHealthStates",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ReplicaHealthState"
            }
          }
        }
      }
    }
  }
};

export const ReplicaHealth: coreClient.CompositeMapper = {
  serializedName: "ReplicaHealth",
  type: {
    name: "Composite",
    className: "ReplicaHealth",
    uberParent: "EntityHealth",
    polymorphicDiscriminator: {
      serializedName: "ServiceKind",
      clientName: "serviceKind"
    },
    modelProperties: {
      ...EntityHealth.type.modelProperties,
      serviceKind: {
        serializedName: "ServiceKind",
        required: true,
        type: {
          name: "String"
        }
      },
      partitionId: {
        serializedName: "PartitionId",
        type: {
          name: "Uuid"
        }
      }
    }
  }
};

export const DeployedServicePackageHealth: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "DeployedServicePackageHealth",
    modelProperties: {
      ...EntityHealth.type.modelProperties,
      applicationName: {
        serializedName: "ApplicationName",
        type: {
          name: "String"
        }
      },
      serviceManifestName: {
        serializedName: "ServiceManifestName",
        type: {
          name: "String"
        }
      },
      nodeName: {
        serializedName: "NodeName",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const HealthEvent: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "HealthEvent",
    modelProperties: {
      ...HealthInformation.type.modelProperties,
      isExpired: {
        serializedName: "IsExpired",
        type: {
          name: "Boolean"
        }
      },
      sourceUtcTimestamp: {
        serializedName: "SourceUtcTimestamp",
        type: {
          name: "DateTime"
        }
      },
      lastModifiedUtcTimestamp: {
        serializedName: "LastModifiedUtcTimestamp",
        type: {
          name: "DateTime"
        }
      },
      lastOkTransitionAt: {
        serializedName: "LastOkTransitionAt",
        type: {
          name: "DateTime"
        }
      },
      lastWarningTransitionAt: {
        serializedName: "LastWarningTransitionAt",
        type: {
          name: "DateTime"
        }
      },
      lastErrorTransitionAt: {
        serializedName: "LastErrorTransitionAt",
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const ApplicationHealthEvaluation: coreClient.CompositeMapper = {
  serializedName: "Application",
  type: {
    name: "Composite",
    className: "ApplicationHealthEvaluation",
    uberParent: "HealthEvaluation",
    polymorphicDiscriminator: HealthEvaluation.type.polymorphicDiscriminator,
    modelProperties: {
      ...HealthEvaluation.type.modelProperties,
      applicationName: {
        serializedName: "ApplicationName",
        type: {
          name: "String"
        }
      },
      unhealthyEvaluations: {
        serializedName: "UnhealthyEvaluations",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HealthEvaluationWrapper"
            }
          }
        }
      }
    }
  }
};

export const ApplicationsHealthEvaluation: coreClient.CompositeMapper = {
  serializedName: "Applications",
  type: {
    name: "Composite",
    className: "ApplicationsHealthEvaluation",
    uberParent: "HealthEvaluation",
    polymorphicDiscriminator: HealthEvaluation.type.polymorphicDiscriminator,
    modelProperties: {
      ...HealthEvaluation.type.modelProperties,
      maxPercentUnhealthyApplications: {
        serializedName: "MaxPercentUnhealthyApplications",
        type: {
          name: "Number"
        }
      },
      totalCount: {
        serializedName: "TotalCount",
        type: {
          name: "Number"
        }
      },
      unhealthyEvaluations: {
        serializedName: "UnhealthyEvaluations",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HealthEvaluationWrapper"
            }
          }
        }
      }
    }
  }
};

export const ApplicationTypeApplicationsHealthEvaluation: coreClient.CompositeMapper = {
  serializedName: "ApplicationTypeApplications",
  type: {
    name: "Composite",
    className: "ApplicationTypeApplicationsHealthEvaluation",
    uberParent: "HealthEvaluation",
    polymorphicDiscriminator: HealthEvaluation.type.polymorphicDiscriminator,
    modelProperties: {
      ...HealthEvaluation.type.modelProperties,
      applicationTypeName: {
        serializedName: "ApplicationTypeName",
        type: {
          name: "String"
        }
      },
      maxPercentUnhealthyApplications: {
        serializedName: "MaxPercentUnhealthyApplications",
        type: {
          name: "Number"
        }
      },
      totalCount: {
        serializedName: "TotalCount",
        type: {
          name: "Number"
        }
      },
      unhealthyEvaluations: {
        serializedName: "UnhealthyEvaluations",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HealthEvaluationWrapper"
            }
          }
        }
      }
    }
  }
};

export const DeltaNodesCheckHealthEvaluation: coreClient.CompositeMapper = {
  serializedName: "DeltaNodesCheck",
  type: {
    name: "Composite",
    className: "DeltaNodesCheckHealthEvaluation",
    uberParent: "HealthEvaluation",
    polymorphicDiscriminator: HealthEvaluation.type.polymorphicDiscriminator,
    modelProperties: {
      ...HealthEvaluation.type.modelProperties,
      baselineErrorCount: {
        serializedName: "BaselineErrorCount",
        type: {
          name: "Number"
        }
      },
      baselineTotalCount: {
        serializedName: "BaselineTotalCount",
        type: {
          name: "Number"
        }
      },
      maxPercentDeltaUnhealthyNodes: {
        serializedName: "MaxPercentDeltaUnhealthyNodes",
        type: {
          name: "Number"
        }
      },
      totalCount: {
        serializedName: "TotalCount",
        type: {
          name: "Number"
        }
      },
      unhealthyEvaluations: {
        serializedName: "UnhealthyEvaluations",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HealthEvaluationWrapper"
            }
          }
        }
      }
    }
  }
};

export const DeployedApplicationHealthEvaluation: coreClient.CompositeMapper = {
  serializedName: "DeployedApplication",
  type: {
    name: "Composite",
    className: "DeployedApplicationHealthEvaluation",
    uberParent: "HealthEvaluation",
    polymorphicDiscriminator: HealthEvaluation.type.polymorphicDiscriminator,
    modelProperties: {
      ...HealthEvaluation.type.modelProperties,
      nodeName: {
        serializedName: "NodeName",
        type: {
          name: "String"
        }
      },
      applicationName: {
        serializedName: "ApplicationName",
        type: {
          name: "String"
        }
      },
      unhealthyEvaluations: {
        serializedName: "UnhealthyEvaluations",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HealthEvaluationWrapper"
            }
          }
        }
      }
    }
  }
};

export const DeployedApplicationsHealthEvaluation: coreClient.CompositeMapper = {
  serializedName: "DeployedApplications",
  type: {
    name: "Composite",
    className: "DeployedApplicationsHealthEvaluation",
    uberParent: "HealthEvaluation",
    polymorphicDiscriminator: HealthEvaluation.type.polymorphicDiscriminator,
    modelProperties: {
      ...HealthEvaluation.type.modelProperties,
      maxPercentUnhealthyDeployedApplications: {
        serializedName: "MaxPercentUnhealthyDeployedApplications",
        type: {
          name: "Number"
        }
      },
      totalCount: {
        serializedName: "TotalCount",
        type: {
          name: "Number"
        }
      },
      unhealthyEvaluations: {
        serializedName: "UnhealthyEvaluations",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HealthEvaluationWrapper"
            }
          }
        }
      }
    }
  }
};

export const DeployedServicePackageHealthEvaluation: coreClient.CompositeMapper = {
  serializedName: "DeployedServicePackage",
  type: {
    name: "Composite",
    className: "DeployedServicePackageHealthEvaluation",
    uberParent: "HealthEvaluation",
    polymorphicDiscriminator: HealthEvaluation.type.polymorphicDiscriminator,
    modelProperties: {
      ...HealthEvaluation.type.modelProperties,
      nodeName: {
        serializedName: "NodeName",
        type: {
          name: "String"
        }
      },
      applicationName: {
        serializedName: "ApplicationName",
        type: {
          name: "String"
        }
      },
      serviceManifestName: {
        serializedName: "ServiceManifestName",
        type: {
          name: "String"
        }
      },
      unhealthyEvaluations: {
        serializedName: "UnhealthyEvaluations",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HealthEvaluationWrapper"
            }
          }
        }
      }
    }
  }
};

export const DeployedServicePackagesHealthEvaluation: coreClient.CompositeMapper = {
  serializedName: "DeployedServicePackages",
  type: {
    name: "Composite",
    className: "DeployedServicePackagesHealthEvaluation",
    uberParent: "HealthEvaluation",
    polymorphicDiscriminator: HealthEvaluation.type.polymorphicDiscriminator,
    modelProperties: {
      ...HealthEvaluation.type.modelProperties,
      totalCount: {
        serializedName: "TotalCount",
        type: {
          name: "Number"
        }
      },
      unhealthyEvaluations: {
        serializedName: "UnhealthyEvaluations",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HealthEvaluationWrapper"
            }
          }
        }
      }
    }
  }
};

export const EventHealthEvaluation: coreClient.CompositeMapper = {
  serializedName: "Event",
  type: {
    name: "Composite",
    className: "EventHealthEvaluation",
    uberParent: "HealthEvaluation",
    polymorphicDiscriminator: HealthEvaluation.type.polymorphicDiscriminator,
    modelProperties: {
      ...HealthEvaluation.type.modelProperties,
      considerWarningAsError: {
        serializedName: "ConsiderWarningAsError",
        type: {
          name: "Boolean"
        }
      },
      unhealthyEvent: {
        serializedName: "UnhealthyEvent",
        type: {
          name: "Composite",
          className: "HealthEvent"
        }
      }
    }
  }
};

export const NodeHealthEvaluation: coreClient.CompositeMapper = {
  serializedName: "Node",
  type: {
    name: "Composite",
    className: "NodeHealthEvaluation",
    uberParent: "HealthEvaluation",
    polymorphicDiscriminator: HealthEvaluation.type.polymorphicDiscriminator,
    modelProperties: {
      ...HealthEvaluation.type.modelProperties,
      nodeName: {
        serializedName: "NodeName",
        type: {
          name: "String"
        }
      },
      unhealthyEvaluations: {
        serializedName: "UnhealthyEvaluations",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HealthEvaluationWrapper"
            }
          }
        }
      }
    }
  }
};

export const NodesHealthEvaluation: coreClient.CompositeMapper = {
  serializedName: "Nodes",
  type: {
    name: "Composite",
    className: "NodesHealthEvaluation",
    uberParent: "HealthEvaluation",
    polymorphicDiscriminator: HealthEvaluation.type.polymorphicDiscriminator,
    modelProperties: {
      ...HealthEvaluation.type.modelProperties,
      maxPercentUnhealthyNodes: {
        serializedName: "MaxPercentUnhealthyNodes",
        type: {
          name: "Number"
        }
      },
      totalCount: {
        serializedName: "TotalCount",
        type: {
          name: "Number"
        }
      },
      unhealthyEvaluations: {
        serializedName: "UnhealthyEvaluations",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HealthEvaluationWrapper"
            }
          }
        }
      }
    }
  }
};

export const PartitionHealthEvaluation: coreClient.CompositeMapper = {
  serializedName: "Partition",
  type: {
    name: "Composite",
    className: "PartitionHealthEvaluation",
    uberParent: "HealthEvaluation",
    polymorphicDiscriminator: HealthEvaluation.type.polymorphicDiscriminator,
    modelProperties: {
      ...HealthEvaluation.type.modelProperties,
      partitionId: {
        serializedName: "PartitionId",
        type: {
          name: "Uuid"
        }
      },
      unhealthyEvaluations: {
        serializedName: "UnhealthyEvaluations",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HealthEvaluationWrapper"
            }
          }
        }
      }
    }
  }
};

export const PartitionsHealthEvaluation: coreClient.CompositeMapper = {
  serializedName: "Partitions",
  type: {
    name: "Composite",
    className: "PartitionsHealthEvaluation",
    uberParent: "HealthEvaluation",
    polymorphicDiscriminator: HealthEvaluation.type.polymorphicDiscriminator,
    modelProperties: {
      ...HealthEvaluation.type.modelProperties,
      maxPercentUnhealthyPartitionsPerService: {
        serializedName: "MaxPercentUnhealthyPartitionsPerService",
        type: {
          name: "Number"
        }
      },
      totalCount: {
        serializedName: "TotalCount",
        type: {
          name: "Number"
        }
      },
      unhealthyEvaluations: {
        serializedName: "UnhealthyEvaluations",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HealthEvaluationWrapper"
            }
          }
        }
      }
    }
  }
};

export const ReplicaHealthEvaluation: coreClient.CompositeMapper = {
  serializedName: "Replica",
  type: {
    name: "Composite",
    className: "ReplicaHealthEvaluation",
    uberParent: "HealthEvaluation",
    polymorphicDiscriminator: HealthEvaluation.type.polymorphicDiscriminator,
    modelProperties: {
      ...HealthEvaluation.type.modelProperties,
      partitionId: {
        serializedName: "PartitionId",
        type: {
          name: "Uuid"
        }
      },
      replicaOrInstanceId: {
        serializedName: "ReplicaOrInstanceId",
        type: {
          name: "String"
        }
      },
      unhealthyEvaluations: {
        serializedName: "UnhealthyEvaluations",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HealthEvaluationWrapper"
            }
          }
        }
      }
    }
  }
};

export const ReplicasHealthEvaluation: coreClient.CompositeMapper = {
  serializedName: "Replicas",
  type: {
    name: "Composite",
    className: "ReplicasHealthEvaluation",
    uberParent: "HealthEvaluation",
    polymorphicDiscriminator: HealthEvaluation.type.polymorphicDiscriminator,
    modelProperties: {
      ...HealthEvaluation.type.modelProperties,
      maxPercentUnhealthyReplicasPerPartition: {
        serializedName: "MaxPercentUnhealthyReplicasPerPartition",
        type: {
          name: "Number"
        }
      },
      totalCount: {
        serializedName: "TotalCount",
        type: {
          name: "Number"
        }
      },
      unhealthyEvaluations: {
        serializedName: "UnhealthyEvaluations",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HealthEvaluationWrapper"
            }
          }
        }
      }
    }
  }
};

export const ServiceHealthEvaluation: coreClient.CompositeMapper = {
  serializedName: "Service",
  type: {
    name: "Composite",
    className: "ServiceHealthEvaluation",
    uberParent: "HealthEvaluation",
    polymorphicDiscriminator: HealthEvaluation.type.polymorphicDiscriminator,
    modelProperties: {
      ...HealthEvaluation.type.modelProperties,
      serviceName: {
        serializedName: "ServiceName",
        type: {
          name: "String"
        }
      },
      unhealthyEvaluations: {
        serializedName: "UnhealthyEvaluations",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HealthEvaluationWrapper"
            }
          }
        }
      }
    }
  }
};

export const ServicesHealthEvaluation: coreClient.CompositeMapper = {
  serializedName: "Services",
  type: {
    name: "Composite",
    className: "ServicesHealthEvaluation",
    uberParent: "HealthEvaluation",
    polymorphicDiscriminator: HealthEvaluation.type.polymorphicDiscriminator,
    modelProperties: {
      ...HealthEvaluation.type.modelProperties,
      serviceTypeName: {
        serializedName: "ServiceTypeName",
        type: {
          name: "String"
        }
      },
      maxPercentUnhealthyServices: {
        serializedName: "MaxPercentUnhealthyServices",
        type: {
          name: "Number"
        }
      },
      totalCount: {
        serializedName: "TotalCount",
        type: {
          name: "Number"
        }
      },
      unhealthyEvaluations: {
        serializedName: "UnhealthyEvaluations",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HealthEvaluationWrapper"
            }
          }
        }
      }
    }
  }
};

export const SystemApplicationHealthEvaluation: coreClient.CompositeMapper = {
  serializedName: "SystemApplication",
  type: {
    name: "Composite",
    className: "SystemApplicationHealthEvaluation",
    uberParent: "HealthEvaluation",
    polymorphicDiscriminator: HealthEvaluation.type.polymorphicDiscriminator,
    modelProperties: {
      ...HealthEvaluation.type.modelProperties,
      unhealthyEvaluations: {
        serializedName: "UnhealthyEvaluations",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HealthEvaluationWrapper"
            }
          }
        }
      }
    }
  }
};

export const UpgradeDomainDeltaNodesCheckHealthEvaluation: coreClient.CompositeMapper = {
  serializedName: "UpgradeDomainDeltaNodesCheck",
  type: {
    name: "Composite",
    className: "UpgradeDomainDeltaNodesCheckHealthEvaluation",
    uberParent: "HealthEvaluation",
    polymorphicDiscriminator: HealthEvaluation.type.polymorphicDiscriminator,
    modelProperties: {
      ...HealthEvaluation.type.modelProperties,
      upgradeDomainName: {
        serializedName: "UpgradeDomainName",
        type: {
          name: "String"
        }
      },
      baselineErrorCount: {
        serializedName: "BaselineErrorCount",
        type: {
          name: "Number"
        }
      },
      baselineTotalCount: {
        serializedName: "BaselineTotalCount",
        type: {
          name: "Number"
        }
      },
      maxPercentDeltaUnhealthyNodes: {
        serializedName: "MaxPercentDeltaUnhealthyNodes",
        type: {
          name: "Number"
        }
      },
      totalCount: {
        serializedName: "TotalCount",
        type: {
          name: "Number"
        }
      },
      unhealthyEvaluations: {
        serializedName: "UnhealthyEvaluations",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HealthEvaluationWrapper"
            }
          }
        }
      }
    }
  }
};

export const UpgradeDomainDeployedApplicationsHealthEvaluation: coreClient.CompositeMapper = {
  serializedName: "UpgradeDomainDeployedApplications",
  type: {
    name: "Composite",
    className: "UpgradeDomainDeployedApplicationsHealthEvaluation",
    uberParent: "HealthEvaluation",
    polymorphicDiscriminator: HealthEvaluation.type.polymorphicDiscriminator,
    modelProperties: {
      ...HealthEvaluation.type.modelProperties,
      upgradeDomainName: {
        serializedName: "UpgradeDomainName",
        type: {
          name: "String"
        }
      },
      maxPercentUnhealthyDeployedApplications: {
        serializedName: "MaxPercentUnhealthyDeployedApplications",
        type: {
          name: "Number"
        }
      },
      totalCount: {
        serializedName: "TotalCount",
        type: {
          name: "Number"
        }
      },
      unhealthyEvaluations: {
        serializedName: "UnhealthyEvaluations",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HealthEvaluationWrapper"
            }
          }
        }
      }
    }
  }
};

export const UpgradeDomainNodesHealthEvaluation: coreClient.CompositeMapper = {
  serializedName: "UpgradeDomainNodes",
  type: {
    name: "Composite",
    className: "UpgradeDomainNodesHealthEvaluation",
    uberParent: "HealthEvaluation",
    polymorphicDiscriminator: HealthEvaluation.type.polymorphicDiscriminator,
    modelProperties: {
      ...HealthEvaluation.type.modelProperties,
      upgradeDomainName: {
        serializedName: "UpgradeDomainName",
        type: {
          name: "String"
        }
      },
      maxPercentUnhealthyNodes: {
        serializedName: "MaxPercentUnhealthyNodes",
        type: {
          name: "Number"
        }
      },
      totalCount: {
        serializedName: "TotalCount",
        type: {
          name: "Number"
        }
      },
      unhealthyEvaluations: {
        serializedName: "UnhealthyEvaluations",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HealthEvaluationWrapper"
            }
          }
        }
      }
    }
  }
};

export const NodeTypeNodesHealthEvaluation: coreClient.CompositeMapper = {
  serializedName: "NodeTypeNodes",
  type: {
    name: "Composite",
    className: "NodeTypeNodesHealthEvaluation",
    uberParent: "HealthEvaluation",
    polymorphicDiscriminator: HealthEvaluation.type.polymorphicDiscriminator,
    modelProperties: {
      ...HealthEvaluation.type.modelProperties,
      nodeTypeName: {
        serializedName: "NodeTypeName",
        type: {
          name: "String"
        }
      },
      maxPercentUnhealthyNodes: {
        serializedName: "MaxPercentUnhealthyNodes",
        type: {
          name: "Number"
        }
      },
      totalCount: {
        serializedName: "TotalCount",
        type: {
          name: "Number"
        }
      },
      unhealthyEvaluations: {
        serializedName: "UnhealthyEvaluations",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "HealthEvaluationWrapper"
            }
          }
        }
      }
    }
  }
};

export const NodeHealthStateChunk: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "NodeHealthStateChunk",
    modelProperties: {
      ...EntityHealthStateChunk.type.modelProperties,
      nodeName: {
        serializedName: "NodeName",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ReplicaHealthStateChunk: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ReplicaHealthStateChunk",
    modelProperties: {
      ...EntityHealthStateChunk.type.modelProperties,
      replicaOrInstanceId: {
        serializedName: "ReplicaOrInstanceId",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const PartitionHealthStateChunk: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "PartitionHealthStateChunk",
    modelProperties: {
      ...EntityHealthStateChunk.type.modelProperties,
      partitionId: {
        serializedName: "PartitionId",
        type: {
          name: "Uuid"
        }
      },
      replicaHealthStateChunks: {
        serializedName: "ReplicaHealthStateChunks",
        type: {
          name: "Composite",
          className: "ReplicaHealthStateChunkList"
        }
      }
    }
  }
};

export const ServiceHealthStateChunk: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceHealthStateChunk",
    modelProperties: {
      ...EntityHealthStateChunk.type.modelProperties,
      serviceName: {
        serializedName: "ServiceName",
        type: {
          name: "String"
        }
      },
      partitionHealthStateChunks: {
        serializedName: "PartitionHealthStateChunks",
        type: {
          name: "Composite",
          className: "PartitionHealthStateChunkList"
        }
      }
    }
  }
};

export const DeployedServicePackageHealthStateChunk: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "DeployedServicePackageHealthStateChunk",
    modelProperties: {
      ...EntityHealthStateChunk.type.modelProperties,
      serviceManifestName: {
        serializedName: "ServiceManifestName",
        type: {
          name: "String"
        }
      },
      servicePackageActivationId: {
        serializedName: "ServicePackageActivationId",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const DeployedApplicationHealthStateChunk: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "DeployedApplicationHealthStateChunk",
    modelProperties: {
      ...EntityHealthStateChunk.type.modelProperties,
      nodeName: {
        serializedName: "NodeName",
        type: {
          name: "String"
        }
      },
      deployedServicePackageHealthStateChunks: {
        serializedName: "DeployedServicePackageHealthStateChunks",
        type: {
          name: "Composite",
          className: "DeployedServicePackageHealthStateChunkList"
        }
      }
    }
  }
};

export const ApplicationHealthStateChunk: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationHealthStateChunk",
    modelProperties: {
      ...EntityHealthStateChunk.type.modelProperties,
      applicationName: {
        serializedName: "ApplicationName",
        type: {
          name: "String"
        }
      },
      applicationTypeName: {
        serializedName: "ApplicationTypeName",
        type: {
          name: "String"
        }
      },
      serviceHealthStateChunks: {
        serializedName: "ServiceHealthStateChunks",
        type: {
          name: "Composite",
          className: "ServiceHealthStateChunkList"
        }
      },
      deployedApplicationHealthStateChunks: {
        serializedName: "DeployedApplicationHealthStateChunks",
        type: {
          name: "Composite",
          className: "DeployedApplicationHealthStateChunkList"
        }
      }
    }
  }
};

export const NodeHealthStateChunkList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "NodeHealthStateChunkList",
    modelProperties: {
      ...EntityHealthStateChunkList.type.modelProperties,
      items: {
        serializedName: "Items",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "NodeHealthStateChunk"
            }
          }
        }
      }
    }
  }
};

export const ApplicationHealthStateChunkList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationHealthStateChunkList",
    modelProperties: {
      ...EntityHealthStateChunkList.type.modelProperties,
      items: {
        serializedName: "Items",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ApplicationHealthStateChunk"
            }
          }
        }
      }
    }
  }
};

export const PartitionSafetyCheck: coreClient.CompositeMapper = {
  serializedName: "PartitionSafetyCheck",
  type: {
    name: "Composite",
    className: "PartitionSafetyCheck",
    uberParent: "SafetyCheck",
    polymorphicDiscriminator: {
      serializedName: "Kind",
      clientName: "kind"
    },
    modelProperties: {
      ...SafetyCheck.type.modelProperties,
      partitionId: {
        serializedName: "PartitionId",
        type: {
          name: "Uuid"
        }
      }
    }
  }
};

export const SeedNodeSafetyCheck: coreClient.CompositeMapper = {
  serializedName: "EnsureSeedNodeQuorum",
  type: {
    name: "Composite",
    className: "SeedNodeSafetyCheck",
    uberParent: "SafetyCheck",
    polymorphicDiscriminator: SafetyCheck.type.polymorphicDiscriminator,
    modelProperties: {
      ...SafetyCheck.type.modelProperties
    }
  }
};

export const ProvisionApplicationTypeDescription: coreClient.CompositeMapper = {
  serializedName: "ImageStorePath",
  type: {
    name: "Composite",
    className: "ProvisionApplicationTypeDescription",
    uberParent: "ProvisionApplicationTypeDescriptionBase",
    polymorphicDiscriminator:
      ProvisionApplicationTypeDescriptionBase.type.polymorphicDiscriminator,
    modelProperties: {
      ...ProvisionApplicationTypeDescriptionBase.type.modelProperties,
      applicationTypeBuildPath: {
        serializedName: "ApplicationTypeBuildPath",
        required: true,
        type: {
          name: "String"
        }
      },
      applicationPackageCleanupPolicy: {
        serializedName: "ApplicationPackageCleanupPolicy",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ExternalStoreProvisionApplicationTypeDescription: coreClient.CompositeMapper = {
  serializedName: "ExternalStore",
  type: {
    name: "Composite",
    className: "ExternalStoreProvisionApplicationTypeDescription",
    uberParent: "ProvisionApplicationTypeDescriptionBase",
    polymorphicDiscriminator:
      ProvisionApplicationTypeDescriptionBase.type.polymorphicDiscriminator,
    modelProperties: {
      ...ProvisionApplicationTypeDescriptionBase.type.modelProperties,
      applicationPackageDownloadUri: {
        serializedName: "ApplicationPackageDownloadUri",
        required: true,
        type: {
          name: "String"
        }
      },
      applicationTypeName: {
        serializedName: "ApplicationTypeName",
        required: true,
        type: {
          name: "String"
        }
      },
      applicationTypeVersion: {
        serializedName: "ApplicationTypeVersion",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const StatefulServiceTypeDescription: coreClient.CompositeMapper = {
  serializedName: "Stateful",
  type: {
    name: "Composite",
    className: "StatefulServiceTypeDescription",
    uberParent: "ServiceTypeDescription",
    polymorphicDiscriminator:
      ServiceTypeDescription.type.polymorphicDiscriminator,
    modelProperties: {
      ...ServiceTypeDescription.type.modelProperties,
      hasPersistedState: {
        serializedName: "HasPersistedState",
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const StatelessServiceTypeDescription: coreClient.CompositeMapper = {
  serializedName: "Stateless",
  type: {
    name: "Composite",
    className: "StatelessServiceTypeDescription",
    uberParent: "ServiceTypeDescription",
    polymorphicDiscriminator:
      ServiceTypeDescription.type.polymorphicDiscriminator,
    modelProperties: {
      ...ServiceTypeDescription.type.modelProperties,
      useImplicitHost: {
        serializedName: "UseImplicitHost",
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const ServicePlacementInvalidDomainPolicyDescription: coreClient.CompositeMapper = {
  serializedName: "InvalidDomain",
  type: {
    name: "Composite",
    className: "ServicePlacementInvalidDomainPolicyDescription",
    uberParent: "ServicePlacementPolicyDescription",
    polymorphicDiscriminator:
      ServicePlacementPolicyDescription.type.polymorphicDiscriminator,
    modelProperties: {
      ...ServicePlacementPolicyDescription.type.modelProperties,
      domainName: {
        serializedName: "DomainName",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ServicePlacementNonPartiallyPlaceServicePolicyDescription: coreClient.CompositeMapper = {
  serializedName: "NonPartiallyPlaceService",
  type: {
    name: "Composite",
    className: "ServicePlacementNonPartiallyPlaceServicePolicyDescription",
    uberParent: "ServicePlacementPolicyDescription",
    polymorphicDiscriminator:
      ServicePlacementPolicyDescription.type.polymorphicDiscriminator,
    modelProperties: {
      ...ServicePlacementPolicyDescription.type.modelProperties
    }
  }
};

export const ServicePlacementAllowMultipleStatelessInstancesOnNodePolicyDescription: coreClient.CompositeMapper = {
  serializedName: "AllowMultipleStatelessInstancesOnNode",
  type: {
    name: "Composite",
    className:
      "ServicePlacementAllowMultipleStatelessInstancesOnNodePolicyDescription",
    uberParent: "ServicePlacementPolicyDescription",
    polymorphicDiscriminator:
      ServicePlacementPolicyDescription.type.polymorphicDiscriminator,
    modelProperties: {
      ...ServicePlacementPolicyDescription.type.modelProperties,
      domainName: {
        serializedName: "DomainName",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ServicePlacementPreferPrimaryDomainPolicyDescription: coreClient.CompositeMapper = {
  serializedName: "PreferPrimaryDomain",
  type: {
    name: "Composite",
    className: "ServicePlacementPreferPrimaryDomainPolicyDescription",
    uberParent: "ServicePlacementPolicyDescription",
    polymorphicDiscriminator:
      ServicePlacementPolicyDescription.type.polymorphicDiscriminator,
    modelProperties: {
      ...ServicePlacementPolicyDescription.type.modelProperties,
      domainName: {
        serializedName: "DomainName",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ServicePlacementRequiredDomainPolicyDescription: coreClient.CompositeMapper = {
  serializedName: "RequireDomain",
  type: {
    name: "Composite",
    className: "ServicePlacementRequiredDomainPolicyDescription",
    uberParent: "ServicePlacementPolicyDescription",
    polymorphicDiscriminator:
      ServicePlacementPolicyDescription.type.polymorphicDiscriminator,
    modelProperties: {
      ...ServicePlacementPolicyDescription.type.modelProperties,
      domainName: {
        serializedName: "DomainName",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ServicePlacementRequireDomainDistributionPolicyDescription: coreClient.CompositeMapper = {
  serializedName: "RequireDomainDistribution",
  type: {
    name: "Composite",
    className: "ServicePlacementRequireDomainDistributionPolicyDescription",
    uberParent: "ServicePlacementPolicyDescription",
    polymorphicDiscriminator:
      ServicePlacementPolicyDescription.type.polymorphicDiscriminator,
    modelProperties: {
      ...ServicePlacementPolicyDescription.type.modelProperties,
      domainName: {
        serializedName: "DomainName",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const StatefulServiceInfo: coreClient.CompositeMapper = {
  serializedName: "Stateful",
  type: {
    name: "Composite",
    className: "StatefulServiceInfo",
    uberParent: "ServiceInfo",
    polymorphicDiscriminator: ServiceInfo.type.polymorphicDiscriminator,
    modelProperties: {
      ...ServiceInfo.type.modelProperties,
      hasPersistedState: {
        serializedName: "HasPersistedState",
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const StatelessServiceInfo: coreClient.CompositeMapper = {
  serializedName: "Stateless",
  type: {
    name: "Composite",
    className: "StatelessServiceInfo",
    uberParent: "ServiceInfo",
    polymorphicDiscriminator: ServiceInfo.type.polymorphicDiscriminator,
    modelProperties: {
      ...ServiceInfo.type.modelProperties
    }
  }
};

export const StatefulServiceDescription: coreClient.CompositeMapper = {
  serializedName: "Stateful",
  type: {
    name: "Composite",
    className: "StatefulServiceDescription",
    uberParent: "ServiceDescription",
    polymorphicDiscriminator: ServiceDescription.type.polymorphicDiscriminator,
    modelProperties: {
      ...ServiceDescription.type.modelProperties,
      targetReplicaSetSize: {
        constraints: {
          InclusiveMinimum: 1
        },
        serializedName: "TargetReplicaSetSize",
        required: true,
        type: {
          name: "Number"
        }
      },
      minReplicaSetSize: {
        constraints: {
          InclusiveMinimum: 1
        },
        serializedName: "MinReplicaSetSize",
        required: true,
        type: {
          name: "Number"
        }
      },
      hasPersistedState: {
        serializedName: "HasPersistedState",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      flags: {
        serializedName: "Flags",
        type: {
          name: "Number"
        }
      },
      replicaRestartWaitDurationSeconds: {
        constraints: {
          InclusiveMaximum: 4294967295,
          InclusiveMinimum: 0
        },
        serializedName: "ReplicaRestartWaitDurationSeconds",
        type: {
          name: "Number"
        }
      },
      quorumLossWaitDurationSeconds: {
        constraints: {
          InclusiveMaximum: 4294967295,
          InclusiveMinimum: 0
        },
        serializedName: "QuorumLossWaitDurationSeconds",
        type: {
          name: "Number"
        }
      },
      standByReplicaKeepDurationSeconds: {
        constraints: {
          InclusiveMaximum: 4294967295,
          InclusiveMinimum: 0
        },
        serializedName: "StandByReplicaKeepDurationSeconds",
        type: {
          name: "Number"
        }
      },
      servicePlacementTimeLimitSeconds: {
        constraints: {
          InclusiveMaximum: 4294967295,
          InclusiveMinimum: 0
        },
        serializedName: "ServicePlacementTimeLimitSeconds",
        type: {
          name: "Number"
        }
      },
      dropSourceReplicaOnMove: {
        serializedName: "DropSourceReplicaOnMove",
        type: {
          name: "Boolean"
        }
      },
      replicaLifecycleDescription: {
        serializedName: "ReplicaLifecycleDescription",
        type: {
          name: "Composite",
          className: "ReplicaLifecycleDescription"
        }
      },
      auxiliaryReplicaCount: {
        constraints: {
          InclusiveMinimum: 0
        },
        serializedName: "AuxiliaryReplicaCount",
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const StatelessServiceDescription: coreClient.CompositeMapper = {
  serializedName: "Stateless",
  type: {
    name: "Composite",
    className: "StatelessServiceDescription",
    uberParent: "ServiceDescription",
    polymorphicDiscriminator: ServiceDescription.type.polymorphicDiscriminator,
    modelProperties: {
      ...ServiceDescription.type.modelProperties,
      instanceCount: {
        constraints: {
          InclusiveMinimum: -1
        },
        serializedName: "InstanceCount",
        required: true,
        type: {
          name: "Number"
        }
      },
      minInstanceCount: {
        defaultValue: 1,
        constraints: {
          InclusiveMinimum: 1
        },
        serializedName: "MinInstanceCount",
        type: {
          name: "Number"
        }
      },
      minInstancePercentage: {
        defaultValue: 0,
        constraints: {
          InclusiveMaximum: 100,
          InclusiveMinimum: 0
        },
        serializedName: "MinInstancePercentage",
        type: {
          name: "Number"
        }
      },
      flags: {
        serializedName: "Flags",
        type: {
          name: "Number"
        }
      },
      instanceCloseDelayDurationSeconds: {
        constraints: {
          InclusiveMaximum: 4294967295,
          InclusiveMinimum: 0
        },
        serializedName: "InstanceCloseDelayDurationSeconds",
        type: {
          name: "Number"
        }
      },
      instanceLifecycleDescription: {
        serializedName: "InstanceLifecycleDescription",
        type: {
          name: "Composite",
          className: "InstanceLifecycleDescription"
        }
      },
      instanceRestartWaitDurationSeconds: {
        constraints: {
          InclusiveMaximum: 4294967295,
          InclusiveMinimum: 0
        },
        serializedName: "InstanceRestartWaitDurationSeconds",
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const NamedPartitionSchemeDescription: coreClient.CompositeMapper = {
  serializedName: "Named",
  type: {
    name: "Composite",
    className: "NamedPartitionSchemeDescription",
    uberParent: "PartitionSchemeDescription",
    polymorphicDiscriminator:
      PartitionSchemeDescription.type.polymorphicDiscriminator,
    modelProperties: {
      ...PartitionSchemeDescription.type.modelProperties,
      count: {
        serializedName: "Count",
        required: true,
        type: {
          name: "Number"
        }
      },
      names: {
        serializedName: "Names",
        required: true,
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "String"
            }
          }
        }
      }
    }
  }
};

export const SingletonPartitionSchemeDescription: coreClient.CompositeMapper = {
  serializedName: "Singleton",
  type: {
    name: "Composite",
    className: "SingletonPartitionSchemeDescription",
    uberParent: "PartitionSchemeDescription",
    polymorphicDiscriminator:
      PartitionSchemeDescription.type.polymorphicDiscriminator,
    modelProperties: {
      ...PartitionSchemeDescription.type.modelProperties
    }
  }
};

export const UniformInt64RangePartitionSchemeDescription: coreClient.CompositeMapper = {
  serializedName: "UniformInt64Range",
  type: {
    name: "Composite",
    className: "UniformInt64RangePartitionSchemeDescription",
    uberParent: "PartitionSchemeDescription",
    polymorphicDiscriminator:
      PartitionSchemeDescription.type.polymorphicDiscriminator,
    modelProperties: {
      ...PartitionSchemeDescription.type.modelProperties,
      count: {
        serializedName: "Count",
        required: true,
        type: {
          name: "Number"
        }
      },
      lowKey: {
        serializedName: "LowKey",
        required: true,
        type: {
          name: "String"
        }
      },
      highKey: {
        serializedName: "HighKey",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const AveragePartitionLoadScalingTrigger: coreClient.CompositeMapper = {
  serializedName: "AveragePartitionLoad",
  type: {
    name: "Composite",
    className: "AveragePartitionLoadScalingTrigger",
    uberParent: "ScalingTriggerDescription",
    polymorphicDiscriminator:
      ScalingTriggerDescription.type.polymorphicDiscriminator,
    modelProperties: {
      ...ScalingTriggerDescription.type.modelProperties,
      metricName: {
        serializedName: "MetricName",
        required: true,
        type: {
          name: "String"
        }
      },
      lowerLoadThreshold: {
        serializedName: "LowerLoadThreshold",
        required: true,
        type: {
          name: "String"
        }
      },
      upperLoadThreshold: {
        serializedName: "UpperLoadThreshold",
        required: true,
        type: {
          name: "String"
        }
      },
      scaleIntervalInSeconds: {
        constraints: {
          InclusiveMaximum: 4294967295,
          InclusiveMinimum: 0
        },
        serializedName: "ScaleIntervalInSeconds",
        required: true,
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const AverageServiceLoadScalingTrigger: coreClient.CompositeMapper = {
  serializedName: "AverageServiceLoad",
  type: {
    name: "Composite",
    className: "AverageServiceLoadScalingTrigger",
    uberParent: "ScalingTriggerDescription",
    polymorphicDiscriminator:
      ScalingTriggerDescription.type.polymorphicDiscriminator,
    modelProperties: {
      ...ScalingTriggerDescription.type.modelProperties,
      metricName: {
        serializedName: "MetricName",
        required: true,
        type: {
          name: "String"
        }
      },
      lowerLoadThreshold: {
        serializedName: "LowerLoadThreshold",
        required: true,
        type: {
          name: "String"
        }
      },
      upperLoadThreshold: {
        serializedName: "UpperLoadThreshold",
        required: true,
        type: {
          name: "String"
        }
      },
      scaleIntervalInSeconds: {
        constraints: {
          InclusiveMaximum: 4294967295,
          InclusiveMinimum: 0
        },
        serializedName: "ScaleIntervalInSeconds",
        required: true,
        type: {
          name: "Number"
        }
      },
      useOnlyPrimaryLoad: {
        serializedName: "UseOnlyPrimaryLoad",
        required: true,
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const PartitionInstanceCountScaleMechanism: coreClient.CompositeMapper = {
  serializedName: "PartitionInstanceCount",
  type: {
    name: "Composite",
    className: "PartitionInstanceCountScaleMechanism",
    uberParent: "ScalingMechanismDescription",
    polymorphicDiscriminator:
      ScalingMechanismDescription.type.polymorphicDiscriminator,
    modelProperties: {
      ...ScalingMechanismDescription.type.modelProperties,
      minInstanceCount: {
        serializedName: "MinInstanceCount",
        required: true,
        type: {
          name: "Number"
        }
      },
      maxInstanceCount: {
        serializedName: "MaxInstanceCount",
        required: true,
        type: {
          name: "Number"
        }
      },
      scaleIncrement: {
        serializedName: "ScaleIncrement",
        required: true,
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const AddRemoveIncrementalNamedPartitionScalingMechanism: coreClient.CompositeMapper = {
  serializedName: "AddRemoveIncrementalNamedPartition",
  type: {
    name: "Composite",
    className: "AddRemoveIncrementalNamedPartitionScalingMechanism",
    uberParent: "ScalingMechanismDescription",
    polymorphicDiscriminator:
      ScalingMechanismDescription.type.polymorphicDiscriminator,
    modelProperties: {
      ...ScalingMechanismDescription.type.modelProperties,
      minPartitionCount: {
        serializedName: "MinPartitionCount",
        required: true,
        type: {
          name: "Number"
        }
      },
      maxPartitionCount: {
        serializedName: "MaxPartitionCount",
        required: true,
        type: {
          name: "Number"
        }
      },
      scaleIncrement: {
        serializedName: "ScaleIncrement",
        required: true,
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const StatefulServiceUpdateDescription: coreClient.CompositeMapper = {
  serializedName: "Stateful",
  type: {
    name: "Composite",
    className: "StatefulServiceUpdateDescription",
    uberParent: "ServiceUpdateDescription",
    polymorphicDiscriminator:
      ServiceUpdateDescription.type.polymorphicDiscriminator,
    modelProperties: {
      ...ServiceUpdateDescription.type.modelProperties,
      targetReplicaSetSize: {
        constraints: {
          InclusiveMinimum: 1
        },
        serializedName: "TargetReplicaSetSize",
        type: {
          name: "Number"
        }
      },
      minReplicaSetSize: {
        constraints: {
          InclusiveMinimum: 1
        },
        serializedName: "MinReplicaSetSize",
        type: {
          name: "Number"
        }
      },
      replicaRestartWaitDurationSeconds: {
        serializedName: "ReplicaRestartWaitDurationSeconds",
        type: {
          name: "String"
        }
      },
      quorumLossWaitDurationSeconds: {
        serializedName: "QuorumLossWaitDurationSeconds",
        type: {
          name: "String"
        }
      },
      standByReplicaKeepDurationSeconds: {
        serializedName: "StandByReplicaKeepDurationSeconds",
        type: {
          name: "String"
        }
      },
      servicePlacementTimeLimitSeconds: {
        serializedName: "ServicePlacementTimeLimitSeconds",
        type: {
          name: "String"
        }
      },
      dropSourceReplicaOnMove: {
        serializedName: "DropSourceReplicaOnMove",
        type: {
          name: "Boolean"
        }
      },
      replicaLifecycleDescription: {
        serializedName: "ReplicaLifecycleDescription",
        type: {
          name: "Composite",
          className: "ReplicaLifecycleDescription"
        }
      },
      auxiliaryReplicaCount: {
        constraints: {
          InclusiveMinimum: 0
        },
        serializedName: "AuxiliaryReplicaCount",
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const StatelessServiceUpdateDescription: coreClient.CompositeMapper = {
  serializedName: "Stateless",
  type: {
    name: "Composite",
    className: "StatelessServiceUpdateDescription",
    uberParent: "ServiceUpdateDescription",
    polymorphicDiscriminator:
      ServiceUpdateDescription.type.polymorphicDiscriminator,
    modelProperties: {
      ...ServiceUpdateDescription.type.modelProperties,
      instanceCount: {
        constraints: {
          InclusiveMinimum: -1
        },
        serializedName: "InstanceCount",
        type: {
          name: "Number"
        }
      },
      minInstanceCount: {
        defaultValue: 1,
        constraints: {
          InclusiveMinimum: 1
        },
        serializedName: "MinInstanceCount",
        type: {
          name: "Number"
        }
      },
      minInstancePercentage: {
        defaultValue: 0,
        constraints: {
          InclusiveMaximum: 100,
          InclusiveMinimum: 0
        },
        serializedName: "MinInstancePercentage",
        type: {
          name: "Number"
        }
      },
      instanceCloseDelayDurationSeconds: {
        serializedName: "InstanceCloseDelayDurationSeconds",
        type: {
          name: "String"
        }
      },
      instanceLifecycleDescription: {
        serializedName: "InstanceLifecycleDescription",
        type: {
          name: "Composite",
          className: "InstanceLifecycleDescription"
        }
      },
      instanceRestartWaitDurationSeconds: {
        serializedName: "InstanceRestartWaitDurationSeconds",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const Int64RangePartitionInformation: coreClient.CompositeMapper = {
  serializedName: "Int64Range",
  type: {
    name: "Composite",
    className: "Int64RangePartitionInformation",
    uberParent: "PartitionInformation",
    polymorphicDiscriminator:
      PartitionInformation.type.polymorphicDiscriminator,
    modelProperties: {
      ...PartitionInformation.type.modelProperties,
      lowKey: {
        serializedName: "LowKey",
        type: {
          name: "String"
        }
      },
      highKey: {
        serializedName: "HighKey",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const NamedPartitionInformation: coreClient.CompositeMapper = {
  serializedName: "Named",
  type: {
    name: "Composite",
    className: "NamedPartitionInformation",
    uberParent: "PartitionInformation",
    polymorphicDiscriminator:
      PartitionInformation.type.polymorphicDiscriminator,
    modelProperties: {
      ...PartitionInformation.type.modelProperties,
      name: {
        serializedName: "Name",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const SingletonPartitionInformation: coreClient.CompositeMapper = {
  serializedName: "Singleton",
  type: {
    name: "Composite",
    className: "SingletonPartitionInformation",
    uberParent: "PartitionInformation",
    polymorphicDiscriminator:
      PartitionInformation.type.polymorphicDiscriminator,
    modelProperties: {
      ...PartitionInformation.type.modelProperties
    }
  }
};

export const StatefulServicePartitionInfo: coreClient.CompositeMapper = {
  serializedName: "Stateful",
  type: {
    name: "Composite",
    className: "StatefulServicePartitionInfo",
    uberParent: "ServicePartitionInfo",
    polymorphicDiscriminator:
      ServicePartitionInfo.type.polymorphicDiscriminator,
    modelProperties: {
      ...ServicePartitionInfo.type.modelProperties,
      targetReplicaSetSize: {
        serializedName: "TargetReplicaSetSize",
        type: {
          name: "Number"
        }
      },
      minReplicaSetSize: {
        serializedName: "MinReplicaSetSize",
        type: {
          name: "Number"
        }
      },
      auxiliaryReplicaCount: {
        serializedName: "AuxiliaryReplicaCount",
        type: {
          name: "Number"
        }
      },
      lastQuorumLossDuration: {
        serializedName: "LastQuorumLossDuration",
        type: {
          name: "TimeSpan"
        }
      },
      primaryEpoch: {
        serializedName: "PrimaryEpoch",
        type: {
          name: "Composite",
          className: "Epoch"
        }
      }
    }
  }
};

export const StatelessServicePartitionInfo: coreClient.CompositeMapper = {
  serializedName: "Stateless",
  type: {
    name: "Composite",
    className: "StatelessServicePartitionInfo",
    uberParent: "ServicePartitionInfo",
    polymorphicDiscriminator:
      ServicePartitionInfo.type.polymorphicDiscriminator,
    modelProperties: {
      ...ServicePartitionInfo.type.modelProperties,
      instanceCount: {
        serializedName: "InstanceCount",
        type: {
          name: "Number"
        }
      },
      minInstanceCount: {
        defaultValue: 1,
        constraints: {
          InclusiveMinimum: 1
        },
        serializedName: "MinInstanceCount",
        type: {
          name: "Number"
        }
      },
      minInstancePercentage: {
        defaultValue: 0,
        constraints: {
          InclusiveMaximum: 100,
          InclusiveMinimum: 0
        },
        serializedName: "MinInstancePercentage",
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const NodeRepairTargetDescription: coreClient.CompositeMapper = {
  serializedName: "Node",
  type: {
    name: "Composite",
    className: "NodeRepairTargetDescription",
    uberParent: "RepairTargetDescriptionBase",
    polymorphicDiscriminator:
      RepairTargetDescriptionBase.type.polymorphicDiscriminator,
    modelProperties: {
      ...RepairTargetDescriptionBase.type.modelProperties,
      nodeNames: {
        serializedName: "NodeNames",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "String"
            }
          }
        }
      }
    }
  }
};

export const NodeRepairImpactDescription: coreClient.CompositeMapper = {
  serializedName: "Node",
  type: {
    name: "Composite",
    className: "NodeRepairImpactDescription",
    uberParent: "RepairImpactDescriptionBase",
    polymorphicDiscriminator:
      RepairImpactDescriptionBase.type.polymorphicDiscriminator,
    modelProperties: {
      ...RepairImpactDescriptionBase.type.modelProperties,
      nodeImpactList: {
        serializedName: "NodeImpactList",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "NodeImpact"
            }
          }
        }
      }
    }
  }
};

export const StatefulServiceReplicaInfo: coreClient.CompositeMapper = {
  serializedName: "Stateful",
  type: {
    name: "Composite",
    className: "StatefulServiceReplicaInfo",
    uberParent: "ReplicaInfo",
    polymorphicDiscriminator: ReplicaInfo.type.polymorphicDiscriminator,
    modelProperties: {
      ...ReplicaInfo.type.modelProperties,
      replicaRole: {
        serializedName: "ReplicaRole",
        type: {
          name: "String"
        }
      },
      replicaId: {
        serializedName: "ReplicaId",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const StatelessServiceInstanceInfo: coreClient.CompositeMapper = {
  serializedName: "Stateless",
  type: {
    name: "Composite",
    className: "StatelessServiceInstanceInfo",
    uberParent: "ReplicaInfo",
    polymorphicDiscriminator: ReplicaInfo.type.polymorphicDiscriminator,
    modelProperties: {
      ...ReplicaInfo.type.modelProperties,
      instanceId: {
        serializedName: "InstanceId",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const DeployedStatefulServiceReplicaInfo: coreClient.CompositeMapper = {
  serializedName: "Stateful",
  type: {
    name: "Composite",
    className: "DeployedStatefulServiceReplicaInfo",
    uberParent: "DeployedServiceReplicaInfo",
    polymorphicDiscriminator:
      DeployedServiceReplicaInfo.type.polymorphicDiscriminator,
    modelProperties: {
      ...DeployedServiceReplicaInfo.type.modelProperties,
      replicaId: {
        serializedName: "ReplicaId",
        type: {
          name: "String"
        }
      },
      replicaRole: {
        serializedName: "ReplicaRole",
        type: {
          name: "String"
        }
      },
      reconfigurationInformation: {
        serializedName: "ReconfigurationInformation",
        type: {
          name: "Composite",
          className: "ReconfigurationInformation"
        }
      }
    }
  }
};

export const DeployedStatelessServiceInstanceInfo: coreClient.CompositeMapper = {
  serializedName: "Stateless",
  type: {
    name: "Composite",
    className: "DeployedStatelessServiceInstanceInfo",
    uberParent: "DeployedServiceReplicaInfo",
    polymorphicDiscriminator:
      DeployedServiceReplicaInfo.type.polymorphicDiscriminator,
    modelProperties: {
      ...DeployedServiceReplicaInfo.type.modelProperties,
      instanceId: {
        serializedName: "InstanceId",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const DeployedStatefulServiceReplicaDetailInfo: coreClient.CompositeMapper = {
  serializedName: "Stateful",
  type: {
    name: "Composite",
    className: "DeployedStatefulServiceReplicaDetailInfo",
    uberParent: "DeployedServiceReplicaDetailInfo",
    polymorphicDiscriminator:
      DeployedServiceReplicaDetailInfo.type.polymorphicDiscriminator,
    modelProperties: {
      ...DeployedServiceReplicaDetailInfo.type.modelProperties,
      replicaId: {
        serializedName: "ReplicaId",
        type: {
          name: "String"
        }
      },
      currentReplicatorOperation: {
        serializedName: "CurrentReplicatorOperation",
        type: {
          name: "String"
        }
      },
      readStatus: {
        serializedName: "ReadStatus",
        type: {
          name: "String"
        }
      },
      writeStatus: {
        serializedName: "WriteStatus",
        type: {
          name: "String"
        }
      },
      replicatorStatus: {
        serializedName: "ReplicatorStatus",
        type: {
          name: "Composite",
          className: "ReplicatorStatus"
        }
      },
      replicaStatus: {
        serializedName: "ReplicaStatus",
        type: {
          name: "Composite",
          className: "KeyValueStoreReplicaStatus"
        }
      },
      deployedServiceReplicaQueryResult: {
        serializedName: "DeployedServiceReplicaQueryResult",
        type: {
          name: "Composite",
          className: "DeployedStatefulServiceReplicaInfo"
        }
      }
    }
  }
};

export const DeployedStatelessServiceInstanceDetailInfo: coreClient.CompositeMapper = {
  serializedName: "Stateless",
  type: {
    name: "Composite",
    className: "DeployedStatelessServiceInstanceDetailInfo",
    uberParent: "DeployedServiceReplicaDetailInfo",
    polymorphicDiscriminator:
      DeployedServiceReplicaDetailInfo.type.polymorphicDiscriminator,
    modelProperties: {
      ...DeployedServiceReplicaDetailInfo.type.modelProperties,
      instanceId: {
        serializedName: "InstanceId",
        type: {
          name: "String"
        }
      },
      deployedServiceReplicaQueryResult: {
        serializedName: "DeployedServiceReplicaQueryResult",
        type: {
          name: "Composite",
          className: "DeployedStatelessServiceInstanceInfo"
        }
      }
    }
  }
};

export const ExecutingFaultsChaosEvent: coreClient.CompositeMapper = {
  serializedName: "ExecutingFaults",
  type: {
    name: "Composite",
    className: "ExecutingFaultsChaosEvent",
    uberParent: "ChaosEvent",
    polymorphicDiscriminator: ChaosEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ChaosEvent.type.modelProperties,
      faults: {
        serializedName: "Faults",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "String"
            }
          }
        }
      }
    }
  }
};

export const StartedChaosEvent: coreClient.CompositeMapper = {
  serializedName: "Started",
  type: {
    name: "Composite",
    className: "StartedChaosEvent",
    uberParent: "ChaosEvent",
    polymorphicDiscriminator: ChaosEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ChaosEvent.type.modelProperties,
      chaosParameters: {
        serializedName: "ChaosParameters",
        type: {
          name: "Composite",
          className: "ChaosParameters"
        }
      }
    }
  }
};

export const StoppedChaosEvent: coreClient.CompositeMapper = {
  serializedName: "Stopped",
  type: {
    name: "Composite",
    className: "StoppedChaosEvent",
    uberParent: "ChaosEvent",
    polymorphicDiscriminator: ChaosEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ChaosEvent.type.modelProperties,
      reason: {
        serializedName: "Reason",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const TestErrorChaosEvent: coreClient.CompositeMapper = {
  serializedName: "TestError",
  type: {
    name: "Composite",
    className: "TestErrorChaosEvent",
    uberParent: "ChaosEvent",
    polymorphicDiscriminator: ChaosEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ChaosEvent.type.modelProperties,
      reason: {
        serializedName: "Reason",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ValidationFailedChaosEvent: coreClient.CompositeMapper = {
  serializedName: "ValidationFailed",
  type: {
    name: "Composite",
    className: "ValidationFailedChaosEvent",
    uberParent: "ChaosEvent",
    polymorphicDiscriminator: ChaosEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ChaosEvent.type.modelProperties,
      reason: {
        serializedName: "Reason",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const WaitingChaosEvent: coreClient.CompositeMapper = {
  serializedName: "Waiting",
  type: {
    name: "Composite",
    className: "WaitingChaosEvent",
    uberParent: "ChaosEvent",
    polymorphicDiscriminator: ChaosEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ChaosEvent.type.modelProperties,
      reason: {
        serializedName: "Reason",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const FrequencyBasedBackupScheduleDescription: coreClient.CompositeMapper = {
  serializedName: "FrequencyBased",
  type: {
    name: "Composite",
    className: "FrequencyBasedBackupScheduleDescription",
    uberParent: "BackupScheduleDescription",
    polymorphicDiscriminator:
      BackupScheduleDescription.type.polymorphicDiscriminator,
    modelProperties: {
      ...BackupScheduleDescription.type.modelProperties,
      interval: {
        serializedName: "Interval",
        required: true,
        type: {
          name: "TimeSpan"
        }
      }
    }
  }
};

export const TimeBasedBackupScheduleDescription: coreClient.CompositeMapper = {
  serializedName: "TimeBased",
  type: {
    name: "Composite",
    className: "TimeBasedBackupScheduleDescription",
    uberParent: "BackupScheduleDescription",
    polymorphicDiscriminator:
      BackupScheduleDescription.type.polymorphicDiscriminator,
    modelProperties: {
      ...BackupScheduleDescription.type.modelProperties,
      scheduleFrequencyType: {
        serializedName: "ScheduleFrequencyType",
        required: true,
        type: {
          name: "String"
        }
      },
      runDays: {
        serializedName: "RunDays",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "String"
            }
          }
        }
      },
      runTimes: {
        serializedName: "RunTimes",
        required: true,
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "DateTime"
            }
          }
        }
      }
    }
  }
};

export const AzureBlobBackupStorageDescription: coreClient.CompositeMapper = {
  serializedName: "AzureBlobStore",
  type: {
    name: "Composite",
    className: "AzureBlobBackupStorageDescription",
    uberParent: "BackupStorageDescription",
    polymorphicDiscriminator:
      BackupStorageDescription.type.polymorphicDiscriminator,
    modelProperties: {
      ...BackupStorageDescription.type.modelProperties,
      connectionString: {
        serializedName: "ConnectionString",
        required: true,
        type: {
          name: "String"
        }
      },
      containerName: {
        serializedName: "ContainerName",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const FileShareBackupStorageDescription: coreClient.CompositeMapper = {
  serializedName: "FileShare",
  type: {
    name: "Composite",
    className: "FileShareBackupStorageDescription",
    uberParent: "BackupStorageDescription",
    polymorphicDiscriminator:
      BackupStorageDescription.type.polymorphicDiscriminator,
    modelProperties: {
      ...BackupStorageDescription.type.modelProperties,
      path: {
        serializedName: "Path",
        required: true,
        type: {
          name: "String"
        }
      },
      primaryUserName: {
        serializedName: "PrimaryUserName",
        type: {
          name: "String"
        }
      },
      primaryPassword: {
        serializedName: "PrimaryPassword",
        type: {
          name: "String"
        }
      },
      secondaryUserName: {
        serializedName: "SecondaryUserName",
        type: {
          name: "String"
        }
      },
      secondaryPassword: {
        serializedName: "SecondaryPassword",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const DsmsAzureBlobBackupStorageDescription: coreClient.CompositeMapper = {
  serializedName: "DsmsAzureBlobStore",
  type: {
    name: "Composite",
    className: "DsmsAzureBlobBackupStorageDescription",
    uberParent: "BackupStorageDescription",
    polymorphicDiscriminator:
      BackupStorageDescription.type.polymorphicDiscriminator,
    modelProperties: {
      ...BackupStorageDescription.type.modelProperties,
      storageCredentialsSourceLocation: {
        serializedName: "StorageCredentialsSourceLocation",
        required: true,
        type: {
          name: "String"
        }
      },
      containerName: {
        serializedName: "ContainerName",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ManagedIdentityAzureBlobBackupStorageDescription: coreClient.CompositeMapper = {
  serializedName: "ManagedIdentityAzureBlobStore",
  type: {
    name: "Composite",
    className: "ManagedIdentityAzureBlobBackupStorageDescription",
    uberParent: "BackupStorageDescription",
    polymorphicDiscriminator:
      BackupStorageDescription.type.polymorphicDiscriminator,
    modelProperties: {
      ...BackupStorageDescription.type.modelProperties,
      managedIdentityType: {
        serializedName: "ManagedIdentityType",
        required: true,
        type: {
          name: "String"
        }
      },
      blobServiceUri: {
        serializedName: "BlobServiceUri",
        required: true,
        type: {
          name: "String"
        }
      },
      containerName: {
        serializedName: "ContainerName",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const BasicRetentionPolicyDescription: coreClient.CompositeMapper = {
  serializedName: "Basic",
  type: {
    name: "Composite",
    className: "BasicRetentionPolicyDescription",
    uberParent: "RetentionPolicyDescription",
    polymorphicDiscriminator:
      RetentionPolicyDescription.type.polymorphicDiscriminator,
    modelProperties: {
      ...RetentionPolicyDescription.type.modelProperties,
      retentionDuration: {
        serializedName: "RetentionDuration",
        required: true,
        type: {
          name: "TimeSpan"
        }
      },
      minimumNumberOfBackups: {
        constraints: {
          InclusiveMinimum: 0
        },
        serializedName: "MinimumNumberOfBackups",
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ApplicationBackupEntity: coreClient.CompositeMapper = {
  serializedName: "Application",
  type: {
    name: "Composite",
    className: "ApplicationBackupEntity",
    uberParent: "BackupEntity",
    polymorphicDiscriminator: BackupEntity.type.polymorphicDiscriminator,
    modelProperties: {
      ...BackupEntity.type.modelProperties,
      applicationName: {
        serializedName: "ApplicationName",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ServiceBackupEntity: coreClient.CompositeMapper = {
  serializedName: "Service",
  type: {
    name: "Composite",
    className: "ServiceBackupEntity",
    uberParent: "BackupEntity",
    polymorphicDiscriminator: BackupEntity.type.polymorphicDiscriminator,
    modelProperties: {
      ...BackupEntity.type.modelProperties,
      serviceName: {
        serializedName: "ServiceName",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const PartitionBackupEntity: coreClient.CompositeMapper = {
  serializedName: "Partition",
  type: {
    name: "Composite",
    className: "PartitionBackupEntity",
    uberParent: "BackupEntity",
    polymorphicDiscriminator: BackupEntity.type.polymorphicDiscriminator,
    modelProperties: {
      ...BackupEntity.type.modelProperties,
      serviceName: {
        serializedName: "ServiceName",
        type: {
          name: "String"
        }
      },
      partitionId: {
        serializedName: "PartitionId",
        type: {
          name: "Uuid"
        }
      }
    }
  }
};

export const PartitionBackupConfigurationInfo: coreClient.CompositeMapper = {
  serializedName: "Partition",
  type: {
    name: "Composite",
    className: "PartitionBackupConfigurationInfo",
    uberParent: "BackupConfigurationInfo",
    polymorphicDiscriminator:
      BackupConfigurationInfo.type.polymorphicDiscriminator,
    modelProperties: {
      ...BackupConfigurationInfo.type.modelProperties,
      serviceName: {
        serializedName: "ServiceName",
        type: {
          name: "String"
        }
      },
      partitionId: {
        serializedName: "PartitionId",
        type: {
          name: "Uuid"
        }
      }
    }
  }
};

export const ApplicationBackupConfigurationInfo: coreClient.CompositeMapper = {
  serializedName: "Application",
  type: {
    name: "Composite",
    className: "ApplicationBackupConfigurationInfo",
    uberParent: "BackupConfigurationInfo",
    polymorphicDiscriminator:
      BackupConfigurationInfo.type.polymorphicDiscriminator,
    modelProperties: {
      ...BackupConfigurationInfo.type.modelProperties,
      applicationName: {
        serializedName: "ApplicationName",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ServiceBackupConfigurationInfo: coreClient.CompositeMapper = {
  serializedName: "Service",
  type: {
    name: "Composite",
    className: "ServiceBackupConfigurationInfo",
    uberParent: "BackupConfigurationInfo",
    polymorphicDiscriminator:
      BackupConfigurationInfo.type.polymorphicDiscriminator,
    modelProperties: {
      ...BackupConfigurationInfo.type.modelProperties,
      serviceName: {
        serializedName: "ServiceName",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const BinaryPropertyValue: coreClient.CompositeMapper = {
  serializedName: "Binary",
  type: {
    name: "Composite",
    className: "BinaryPropertyValue",
    uberParent: "PropertyValue",
    polymorphicDiscriminator: PropertyValue.type.polymorphicDiscriminator,
    modelProperties: {
      ...PropertyValue.type.modelProperties,
      data: {
        serializedName: "Data",
        required: true,
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Number"
            }
          }
        }
      }
    }
  }
};

export const Int64PropertyValue: coreClient.CompositeMapper = {
  serializedName: "Int64",
  type: {
    name: "Composite",
    className: "Int64PropertyValue",
    uberParent: "PropertyValue",
    polymorphicDiscriminator: PropertyValue.type.polymorphicDiscriminator,
    modelProperties: {
      ...PropertyValue.type.modelProperties,
      data: {
        serializedName: "Data",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const DoublePropertyValue: coreClient.CompositeMapper = {
  serializedName: "Double",
  type: {
    name: "Composite",
    className: "DoublePropertyValue",
    uberParent: "PropertyValue",
    polymorphicDiscriminator: PropertyValue.type.polymorphicDiscriminator,
    modelProperties: {
      ...PropertyValue.type.modelProperties,
      data: {
        serializedName: "Data",
        required: true,
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const StringPropertyValue: coreClient.CompositeMapper = {
  serializedName: "String",
  type: {
    name: "Composite",
    className: "StringPropertyValue",
    uberParent: "PropertyValue",
    polymorphicDiscriminator: PropertyValue.type.polymorphicDiscriminator,
    modelProperties: {
      ...PropertyValue.type.modelProperties,
      data: {
        serializedName: "Data",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const GuidPropertyValue: coreClient.CompositeMapper = {
  serializedName: "Guid",
  type: {
    name: "Composite",
    className: "GuidPropertyValue",
    uberParent: "PropertyValue",
    polymorphicDiscriminator: PropertyValue.type.polymorphicDiscriminator,
    modelProperties: {
      ...PropertyValue.type.modelProperties,
      data: {
        serializedName: "Data",
        required: true,
        type: {
          name: "Uuid"
        }
      }
    }
  }
};

export const CheckExistsPropertyBatchOperation: coreClient.CompositeMapper = {
  serializedName: "CheckExists",
  type: {
    name: "Composite",
    className: "CheckExistsPropertyBatchOperation",
    uberParent: "PropertyBatchOperation",
    polymorphicDiscriminator:
      PropertyBatchOperation.type.polymorphicDiscriminator,
    modelProperties: {
      ...PropertyBatchOperation.type.modelProperties,
      exists: {
        serializedName: "Exists",
        required: true,
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const CheckSequencePropertyBatchOperation: coreClient.CompositeMapper = {
  serializedName: "CheckSequence",
  type: {
    name: "Composite",
    className: "CheckSequencePropertyBatchOperation",
    uberParent: "PropertyBatchOperation",
    polymorphicDiscriminator:
      PropertyBatchOperation.type.polymorphicDiscriminator,
    modelProperties: {
      ...PropertyBatchOperation.type.modelProperties,
      sequenceNumber: {
        serializedName: "SequenceNumber",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const CheckValuePropertyBatchOperation: coreClient.CompositeMapper = {
  serializedName: "CheckValue",
  type: {
    name: "Composite",
    className: "CheckValuePropertyBatchOperation",
    uberParent: "PropertyBatchOperation",
    polymorphicDiscriminator:
      PropertyBatchOperation.type.polymorphicDiscriminator,
    modelProperties: {
      ...PropertyBatchOperation.type.modelProperties,
      value: {
        serializedName: "Value",
        type: {
          name: "Composite",
          className: "PropertyValue"
        }
      }
    }
  }
};

export const DeletePropertyBatchOperation: coreClient.CompositeMapper = {
  serializedName: "Delete",
  type: {
    name: "Composite",
    className: "DeletePropertyBatchOperation",
    uberParent: "PropertyBatchOperation",
    polymorphicDiscriminator:
      PropertyBatchOperation.type.polymorphicDiscriminator,
    modelProperties: {
      ...PropertyBatchOperation.type.modelProperties
    }
  }
};

export const GetPropertyBatchOperation: coreClient.CompositeMapper = {
  serializedName: "Get",
  type: {
    name: "Composite",
    className: "GetPropertyBatchOperation",
    uberParent: "PropertyBatchOperation",
    polymorphicDiscriminator:
      PropertyBatchOperation.type.polymorphicDiscriminator,
    modelProperties: {
      ...PropertyBatchOperation.type.modelProperties,
      includeValue: {
        defaultValue: false,
        serializedName: "IncludeValue",
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const PutPropertyBatchOperation: coreClient.CompositeMapper = {
  serializedName: "Put",
  type: {
    name: "Composite",
    className: "PutPropertyBatchOperation",
    uberParent: "PropertyBatchOperation",
    polymorphicDiscriminator:
      PropertyBatchOperation.type.polymorphicDiscriminator,
    modelProperties: {
      ...PropertyBatchOperation.type.modelProperties,
      value: {
        serializedName: "Value",
        type: {
          name: "Composite",
          className: "PropertyValue"
        }
      },
      customTypeId: {
        serializedName: "CustomTypeId",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const SuccessfulPropertyBatchInfo: coreClient.CompositeMapper = {
  serializedName: "Successful",
  type: {
    name: "Composite",
    className: "SuccessfulPropertyBatchInfo",
    uberParent: "PropertyBatchInfo",
    polymorphicDiscriminator: PropertyBatchInfo.type.polymorphicDiscriminator,
    modelProperties: {
      ...PropertyBatchInfo.type.modelProperties,
      properties: {
        serializedName: "Properties",
        type: {
          name: "Dictionary",
          value: { type: { name: "Composite", className: "PropertyInfo" } }
        }
      }
    }
  }
};

export const FailedPropertyBatchInfo: coreClient.CompositeMapper = {
  serializedName: "Failed",
  type: {
    name: "Composite",
    className: "FailedPropertyBatchInfo",
    uberParent: "PropertyBatchInfo",
    polymorphicDiscriminator: PropertyBatchInfo.type.polymorphicDiscriminator,
    modelProperties: {
      ...PropertyBatchInfo.type.modelProperties,
      errorMessage: {
        serializedName: "ErrorMessage",
        type: {
          name: "String"
        }
      },
      operationIndex: {
        serializedName: "OperationIndex",
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ClusterEvent: coreClient.CompositeMapper = {
  serializedName: "ClusterEvent",
  type: {
    name: "Composite",
    className: "ClusterEvent",
    uberParent: "FabricEvent",
    polymorphicDiscriminator: {
      serializedName: "Kind",
      clientName: "kind"
    },
    modelProperties: {
      ...FabricEvent.type.modelProperties
    }
  }
};

export const ContainerInstanceEvent: coreClient.CompositeMapper = {
  serializedName: "ContainerInstanceEvent",
  type: {
    name: "Composite",
    className: "ContainerInstanceEvent",
    uberParent: "FabricEvent",
    polymorphicDiscriminator: FabricEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...FabricEvent.type.modelProperties
    }
  }
};

export const NodeEvent: coreClient.CompositeMapper = {
  serializedName: "NodeEvent",
  type: {
    name: "Composite",
    className: "NodeEvent",
    uberParent: "FabricEvent",
    polymorphicDiscriminator: {
      serializedName: "Kind",
      clientName: "kind"
    },
    modelProperties: {
      ...FabricEvent.type.modelProperties,
      nodeName: {
        serializedName: "NodeName",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ApplicationEvent: coreClient.CompositeMapper = {
  serializedName: "ApplicationEvent",
  type: {
    name: "Composite",
    className: "ApplicationEvent",
    uberParent: "FabricEvent",
    polymorphicDiscriminator: {
      serializedName: "Kind",
      clientName: "kind"
    },
    modelProperties: {
      ...FabricEvent.type.modelProperties,
      applicationId: {
        serializedName: "ApplicationId",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ServiceEvent: coreClient.CompositeMapper = {
  serializedName: "ServiceEvent",
  type: {
    name: "Composite",
    className: "ServiceEvent",
    uberParent: "FabricEvent",
    polymorphicDiscriminator: {
      serializedName: "Kind",
      clientName: "kind"
    },
    modelProperties: {
      ...FabricEvent.type.modelProperties,
      serviceId: {
        serializedName: "ServiceId",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const PartitionEvent: coreClient.CompositeMapper = {
  serializedName: "PartitionEvent",
  type: {
    name: "Composite",
    className: "PartitionEvent",
    uberParent: "FabricEvent",
    polymorphicDiscriminator: {
      serializedName: "Kind",
      clientName: "kind"
    },
    modelProperties: {
      ...FabricEvent.type.modelProperties,
      partitionId: {
        serializedName: "PartitionId",
        required: true,
        type: {
          name: "Uuid"
        }
      }
    }
  }
};

export const ReplicaEvent: coreClient.CompositeMapper = {
  serializedName: "ReplicaEvent",
  type: {
    name: "Composite",
    className: "ReplicaEvent",
    uberParent: "FabricEvent",
    polymorphicDiscriminator: {
      serializedName: "Kind",
      clientName: "kind"
    },
    modelProperties: {
      ...FabricEvent.type.modelProperties,
      partitionId: {
        serializedName: "PartitionId",
        required: true,
        type: {
          name: "Uuid"
        }
      },
      replicaId: {
        serializedName: "ReplicaId",
        required: true,
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const SecretResourceProperties: coreClient.CompositeMapper = {
  serializedName: "SecretResourceProperties",
  type: {
    name: "Composite",
    className: "SecretResourceProperties",
    uberParent: "SecretResourcePropertiesBase",
    polymorphicDiscriminator: {
      serializedName: "kind",
      clientName: "kind"
    },
    modelProperties: {
      ...SecretResourcePropertiesBase.type.modelProperties,
      description: {
        serializedName: "description",
        type: {
          name: "String"
        }
      },
      status: {
        serializedName: "status",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      statusDetails: {
        serializedName: "statusDetails",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      contentType: {
        serializedName: "contentType",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const SecretValueResourceProperties: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "SecretValueResourceProperties",
    modelProperties: {
      ...SecretValueProperties.type.modelProperties
    }
  }
};

export const NetworkResourceProperties: coreClient.CompositeMapper = {
  serializedName: "NetworkResourceProperties",
  type: {
    name: "Composite",
    className: "NetworkResourceProperties",
    uberParent: "NetworkResourcePropertiesBase",
    polymorphicDiscriminator: {
      serializedName: "kind",
      clientName: "kind"
    },
    modelProperties: {
      ...NetworkResourcePropertiesBase.type.modelProperties,
      description: {
        serializedName: "description",
        type: {
          name: "String"
        }
      },
      status: {
        serializedName: "status",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      statusDetails: {
        serializedName: "statusDetails",
        readOnly: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ServiceResourceProperties: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceResourceProperties",
    modelProperties: {
      ...ServiceReplicaProperties.type.modelProperties,
      ...ServiceProperties.type.modelProperties
    }
  }
};

export const ServiceReplicaDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceReplicaDescription",
    modelProperties: {
      ...ServiceReplicaProperties.type.modelProperties,
      replicaName: {
        serializedName: "replicaName",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ApplicationScopedVolume: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationScopedVolume",
    modelProperties: {
      ...VolumeReference.type.modelProperties,
      creationParameters: {
        serializedName: "creationParameters",
        type: {
          name: "Composite",
          className: "ApplicationScopedVolumeCreationParameters"
        }
      }
    }
  }
};

export const ApplicationScopedVolumeCreationParametersServiceFabricVolumeDisk: coreClient.CompositeMapper = {
  serializedName: "ServiceFabricVolumeDisk",
  type: {
    name: "Composite",
    className:
      "ApplicationScopedVolumeCreationParametersServiceFabricVolumeDisk",
    uberParent: "ApplicationScopedVolumeCreationParameters",
    polymorphicDiscriminator:
      ApplicationScopedVolumeCreationParameters.type.polymorphicDiscriminator,
    modelProperties: {
      ...ApplicationScopedVolumeCreationParameters.type.modelProperties,
      sizeDisk: {
        serializedName: "sizeDisk",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const DefaultExecutionPolicy: coreClient.CompositeMapper = {
  serializedName: "Default",
  type: {
    name: "Composite",
    className: "DefaultExecutionPolicy",
    uberParent: "ExecutionPolicy",
    polymorphicDiscriminator: ExecutionPolicy.type.polymorphicDiscriminator,
    modelProperties: {
      ...ExecutionPolicy.type.modelProperties
    }
  }
};

export const RunToCompletionExecutionPolicy: coreClient.CompositeMapper = {
  serializedName: "RunToCompletion",
  type: {
    name: "Composite",
    className: "RunToCompletionExecutionPolicy",
    uberParent: "ExecutionPolicy",
    polymorphicDiscriminator: ExecutionPolicy.type.polymorphicDiscriminator,
    modelProperties: {
      ...ExecutionPolicy.type.modelProperties,
      restart: {
        serializedName: "restart",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const AverageLoadScalingTrigger: coreClient.CompositeMapper = {
  serializedName: "AverageLoad",
  type: {
    name: "Composite",
    className: "AverageLoadScalingTrigger",
    uberParent: "AutoScalingTrigger",
    polymorphicDiscriminator: AutoScalingTrigger.type.polymorphicDiscriminator,
    modelProperties: {
      ...AutoScalingTrigger.type.modelProperties,
      metric: {
        serializedName: "metric",
        type: {
          name: "Composite",
          className: "AutoScalingMetric"
        }
      },
      lowerLoadThreshold: {
        serializedName: "lowerLoadThreshold",
        required: true,
        type: {
          name: "Number"
        }
      },
      upperLoadThreshold: {
        serializedName: "upperLoadThreshold",
        required: true,
        type: {
          name: "Number"
        }
      },
      scaleIntervalInSeconds: {
        constraints: {
          InclusiveMinimum: 60
        },
        serializedName: "scaleIntervalInSeconds",
        required: true,
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const AddRemoveReplicaScalingMechanism: coreClient.CompositeMapper = {
  serializedName: "AddRemoveReplica",
  type: {
    name: "Composite",
    className: "AddRemoveReplicaScalingMechanism",
    uberParent: "AutoScalingMechanism",
    polymorphicDiscriminator:
      AutoScalingMechanism.type.polymorphicDiscriminator,
    modelProperties: {
      ...AutoScalingMechanism.type.modelProperties,
      minCount: {
        serializedName: "minCount",
        required: true,
        type: {
          name: "Number"
        }
      },
      maxCount: {
        serializedName: "maxCount",
        required: true,
        type: {
          name: "Number"
        }
      },
      scaleIncrement: {
        serializedName: "scaleIncrement",
        required: true,
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const AzureInternalMonitoringPipelineSinkDescription: coreClient.CompositeMapper = {
  serializedName: "AzureInternalMonitoringPipeline",
  type: {
    name: "Composite",
    className: "AzureInternalMonitoringPipelineSinkDescription",
    uberParent: "DiagnosticsSinkProperties",
    polymorphicDiscriminator:
      DiagnosticsSinkProperties.type.polymorphicDiscriminator,
    modelProperties: {
      ...DiagnosticsSinkProperties.type.modelProperties,
      accountName: {
        serializedName: "accountName",
        type: {
          name: "String"
        }
      },
      namespace: {
        serializedName: "namespace",
        type: {
          name: "String"
        }
      },
      maConfigUrl: {
        serializedName: "maConfigUrl",
        type: {
          name: "String"
        }
      },
      fluentdConfigUrl: {
        serializedName: "fluentdConfigUrl",
        type: {
          name: "String"
        }
      },
      autoKeyConfigUrl: {
        serializedName: "autoKeyConfigUrl",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const PrimaryReplicatorStatus: coreClient.CompositeMapper = {
  serializedName: "Primary",
  type: {
    name: "Composite",
    className: "PrimaryReplicatorStatus",
    uberParent: "ReplicatorStatus",
    polymorphicDiscriminator: ReplicatorStatus.type.polymorphicDiscriminator,
    modelProperties: {
      ...ReplicatorStatus.type.modelProperties,
      replicationQueueStatus: {
        serializedName: "ReplicationQueueStatus",
        type: {
          name: "Composite",
          className: "ReplicatorQueueStatus"
        }
      },
      remoteReplicators: {
        serializedName: "RemoteReplicators",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "RemoteReplicatorStatus"
            }
          }
        }
      }
    }
  }
};

export const SecondaryReplicatorStatus: coreClient.CompositeMapper = {
  serializedName: "SecondaryReplicatorStatus",
  type: {
    name: "Composite",
    className: "SecondaryReplicatorStatus",
    uberParent: "ReplicatorStatus",
    polymorphicDiscriminator: {
      serializedName: "Kind",
      clientName: "kind"
    },
    modelProperties: {
      ...ReplicatorStatus.type.modelProperties,
      replicationQueueStatus: {
        serializedName: "ReplicationQueueStatus",
        type: {
          name: "Composite",
          className: "ReplicatorQueueStatus"
        }
      },
      lastReplicationOperationReceivedTimeUtc: {
        serializedName: "LastReplicationOperationReceivedTimeUtc",
        type: {
          name: "DateTime"
        }
      },
      isInBuild: {
        serializedName: "IsInBuild",
        type: {
          name: "Boolean"
        }
      },
      copyQueueStatus: {
        serializedName: "CopyQueueStatus",
        type: {
          name: "Composite",
          className: "ReplicatorQueueStatus"
        }
      },
      lastCopyOperationReceivedTimeUtc: {
        serializedName: "LastCopyOperationReceivedTimeUtc",
        type: {
          name: "DateTime"
        }
      },
      lastAcknowledgementSentTimeUtc: {
        serializedName: "LastAcknowledgementSentTimeUtc",
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const KeyValueStoreReplicaStatus: coreClient.CompositeMapper = {
  serializedName: "KeyValueStore",
  type: {
    name: "Composite",
    className: "KeyValueStoreReplicaStatus",
    uberParent: "ReplicaStatusBase",
    polymorphicDiscriminator: ReplicaStatusBase.type.polymorphicDiscriminator,
    modelProperties: {
      ...ReplicaStatusBase.type.modelProperties,
      databaseRowCountEstimate: {
        serializedName: "DatabaseRowCountEstimate",
        type: {
          name: "String"
        }
      },
      databaseLogicalSizeEstimate: {
        serializedName: "DatabaseLogicalSizeEstimate",
        type: {
          name: "String"
        }
      },
      copyNotificationCurrentKeyFilter: {
        serializedName: "CopyNotificationCurrentKeyFilter",
        type: {
          name: "String"
        }
      },
      copyNotificationCurrentProgress: {
        serializedName: "CopyNotificationCurrentProgress",
        type: {
          name: "String"
        }
      },
      statusDetails: {
        serializedName: "StatusDetails",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const AutoScalingResourceMetric: coreClient.CompositeMapper = {
  serializedName: "Resource",
  type: {
    name: "Composite",
    className: "AutoScalingResourceMetric",
    uberParent: "AutoScalingMetric",
    polymorphicDiscriminator: AutoScalingMetric.type.polymorphicDiscriminator,
    modelProperties: {
      ...AutoScalingMetric.type.modelProperties,
      name: {
        serializedName: "name",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const StatefulServiceReplicaHealthState: coreClient.CompositeMapper = {
  serializedName: "Stateful",
  type: {
    name: "Composite",
    className: "StatefulServiceReplicaHealthState",
    uberParent: "ReplicaHealthState",
    polymorphicDiscriminator: ReplicaHealthState.type.polymorphicDiscriminator,
    modelProperties: {
      ...ReplicaHealthState.type.modelProperties,
      replicaId: {
        serializedName: "ReplicaId",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const StatelessServiceInstanceHealthState: coreClient.CompositeMapper = {
  serializedName: "Stateless",
  type: {
    name: "Composite",
    className: "StatelessServiceInstanceHealthState",
    uberParent: "ReplicaHealthState",
    polymorphicDiscriminator: ReplicaHealthState.type.polymorphicDiscriminator,
    modelProperties: {
      ...ReplicaHealthState.type.modelProperties,
      replicaId: {
        serializedName: "ReplicaId",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const StatefulServiceReplicaHealth: coreClient.CompositeMapper = {
  serializedName: "Stateful",
  type: {
    name: "Composite",
    className: "StatefulServiceReplicaHealth",
    uberParent: "ReplicaHealth",
    polymorphicDiscriminator: ReplicaHealth.type.polymorphicDiscriminator,
    modelProperties: {
      ...ReplicaHealth.type.modelProperties,
      replicaId: {
        serializedName: "ReplicaId",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const StatelessServiceInstanceHealth: coreClient.CompositeMapper = {
  serializedName: "Stateless",
  type: {
    name: "Composite",
    className: "StatelessServiceInstanceHealth",
    uberParent: "ReplicaHealth",
    polymorphicDiscriminator: ReplicaHealth.type.polymorphicDiscriminator,
    modelProperties: {
      ...ReplicaHealth.type.modelProperties,
      instanceId: {
        serializedName: "InstanceId",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const EnsureAvailabilitySafetyCheck: coreClient.CompositeMapper = {
  serializedName: "EnsureAvailability",
  type: {
    name: "Composite",
    className: "EnsureAvailabilitySafetyCheck",
    uberParent: "PartitionSafetyCheck",
    polymorphicDiscriminator:
      PartitionSafetyCheck.type.polymorphicDiscriminator,
    modelProperties: {
      ...PartitionSafetyCheck.type.modelProperties
    }
  }
};

export const EnsurePartitionQuorumSafetyCheck: coreClient.CompositeMapper = {
  serializedName: "EnsurePartitionQuorum",
  type: {
    name: "Composite",
    className: "EnsurePartitionQuorumSafetyCheck",
    uberParent: "PartitionSafetyCheck",
    polymorphicDiscriminator:
      PartitionSafetyCheck.type.polymorphicDiscriminator,
    modelProperties: {
      ...PartitionSafetyCheck.type.modelProperties
    }
  }
};

export const WaitForInbuildReplicaSafetyCheck: coreClient.CompositeMapper = {
  serializedName: "WaitForInbuildReplica",
  type: {
    name: "Composite",
    className: "WaitForInbuildReplicaSafetyCheck",
    uberParent: "PartitionSafetyCheck",
    polymorphicDiscriminator:
      PartitionSafetyCheck.type.polymorphicDiscriminator,
    modelProperties: {
      ...PartitionSafetyCheck.type.modelProperties
    }
  }
};

export const WaitForPrimaryPlacementSafetyCheck: coreClient.CompositeMapper = {
  serializedName: "WaitForPrimaryPlacement",
  type: {
    name: "Composite",
    className: "WaitForPrimaryPlacementSafetyCheck",
    uberParent: "PartitionSafetyCheck",
    polymorphicDiscriminator:
      PartitionSafetyCheck.type.polymorphicDiscriminator,
    modelProperties: {
      ...PartitionSafetyCheck.type.modelProperties
    }
  }
};

export const WaitForPrimarySwapSafetyCheck: coreClient.CompositeMapper = {
  serializedName: "WaitForPrimarySwap",
  type: {
    name: "Composite",
    className: "WaitForPrimarySwapSafetyCheck",
    uberParent: "PartitionSafetyCheck",
    polymorphicDiscriminator:
      PartitionSafetyCheck.type.polymorphicDiscriminator,
    modelProperties: {
      ...PartitionSafetyCheck.type.modelProperties
    }
  }
};

export const WaitForReconfigurationSafetyCheck: coreClient.CompositeMapper = {
  serializedName: "WaitForReconfiguration",
  type: {
    name: "Composite",
    className: "WaitForReconfigurationSafetyCheck",
    uberParent: "PartitionSafetyCheck",
    polymorphicDiscriminator:
      PartitionSafetyCheck.type.polymorphicDiscriminator,
    modelProperties: {
      ...PartitionSafetyCheck.type.modelProperties
    }
  }
};

export const ClusterNewHealthReportEvent: coreClient.CompositeMapper = {
  serializedName: "ClusterNewHealthReport",
  type: {
    name: "Composite",
    className: "ClusterNewHealthReportEvent",
    uberParent: "ClusterEvent",
    polymorphicDiscriminator: ClusterEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ClusterEvent.type.modelProperties,
      sourceId: {
        serializedName: "SourceId",
        required: true,
        type: {
          name: "String"
        }
      },
      property: {
        serializedName: "Property",
        required: true,
        type: {
          name: "String"
        }
      },
      healthState: {
        serializedName: "HealthState",
        required: true,
        type: {
          name: "String"
        }
      },
      timeToLiveMs: {
        serializedName: "TimeToLiveMs",
        required: true,
        type: {
          name: "Number"
        }
      },
      sequenceNumber: {
        serializedName: "SequenceNumber",
        required: true,
        type: {
          name: "Number"
        }
      },
      description: {
        serializedName: "Description",
        required: true,
        type: {
          name: "String"
        }
      },
      removeWhenExpired: {
        serializedName: "RemoveWhenExpired",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      sourceUtcTimestamp: {
        serializedName: "SourceUtcTimestamp",
        required: true,
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const ClusterHealthReportExpiredEvent: coreClient.CompositeMapper = {
  serializedName: "ClusterHealthReportExpired",
  type: {
    name: "Composite",
    className: "ClusterHealthReportExpiredEvent",
    uberParent: "ClusterEvent",
    polymorphicDiscriminator: ClusterEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ClusterEvent.type.modelProperties,
      sourceId: {
        serializedName: "SourceId",
        required: true,
        type: {
          name: "String"
        }
      },
      property: {
        serializedName: "Property",
        required: true,
        type: {
          name: "String"
        }
      },
      healthState: {
        serializedName: "HealthState",
        required: true,
        type: {
          name: "String"
        }
      },
      timeToLiveMs: {
        serializedName: "TimeToLiveMs",
        required: true,
        type: {
          name: "Number"
        }
      },
      sequenceNumber: {
        serializedName: "SequenceNumber",
        required: true,
        type: {
          name: "Number"
        }
      },
      description: {
        serializedName: "Description",
        required: true,
        type: {
          name: "String"
        }
      },
      removeWhenExpired: {
        serializedName: "RemoveWhenExpired",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      sourceUtcTimestamp: {
        serializedName: "SourceUtcTimestamp",
        required: true,
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const ClusterUpgradeCompletedEvent: coreClient.CompositeMapper = {
  serializedName: "ClusterUpgradeCompleted",
  type: {
    name: "Composite",
    className: "ClusterUpgradeCompletedEvent",
    uberParent: "ClusterEvent",
    polymorphicDiscriminator: ClusterEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ClusterEvent.type.modelProperties,
      targetClusterVersion: {
        serializedName: "TargetClusterVersion",
        required: true,
        type: {
          name: "String"
        }
      },
      overallUpgradeElapsedTimeInMs: {
        serializedName: "OverallUpgradeElapsedTimeInMs",
        required: true,
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ClusterUpgradeDomainCompletedEvent: coreClient.CompositeMapper = {
  serializedName: "ClusterUpgradeDomainCompleted",
  type: {
    name: "Composite",
    className: "ClusterUpgradeDomainCompletedEvent",
    uberParent: "ClusterEvent",
    polymorphicDiscriminator: ClusterEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ClusterEvent.type.modelProperties,
      targetClusterVersion: {
        serializedName: "TargetClusterVersion",
        required: true,
        type: {
          name: "String"
        }
      },
      upgradeState: {
        serializedName: "UpgradeState",
        required: true,
        type: {
          name: "String"
        }
      },
      upgradeDomains: {
        serializedName: "UpgradeDomains",
        required: true,
        type: {
          name: "String"
        }
      },
      upgradeDomainElapsedTimeInMs: {
        serializedName: "UpgradeDomainElapsedTimeInMs",
        required: true,
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ClusterUpgradeRollbackCompletedEvent: coreClient.CompositeMapper = {
  serializedName: "ClusterUpgradeRollbackCompleted",
  type: {
    name: "Composite",
    className: "ClusterUpgradeRollbackCompletedEvent",
    uberParent: "ClusterEvent",
    polymorphicDiscriminator: ClusterEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ClusterEvent.type.modelProperties,
      targetClusterVersion: {
        serializedName: "TargetClusterVersion",
        required: true,
        type: {
          name: "String"
        }
      },
      failureReason: {
        serializedName: "FailureReason",
        required: true,
        type: {
          name: "String"
        }
      },
      overallUpgradeElapsedTimeInMs: {
        serializedName: "OverallUpgradeElapsedTimeInMs",
        required: true,
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ClusterUpgradeRollbackStartedEvent: coreClient.CompositeMapper = {
  serializedName: "ClusterUpgradeRollbackStarted",
  type: {
    name: "Composite",
    className: "ClusterUpgradeRollbackStartedEvent",
    uberParent: "ClusterEvent",
    polymorphicDiscriminator: ClusterEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ClusterEvent.type.modelProperties,
      targetClusterVersion: {
        serializedName: "TargetClusterVersion",
        required: true,
        type: {
          name: "String"
        }
      },
      failureReason: {
        serializedName: "FailureReason",
        required: true,
        type: {
          name: "String"
        }
      },
      overallUpgradeElapsedTimeInMs: {
        serializedName: "OverallUpgradeElapsedTimeInMs",
        required: true,
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ClusterUpgradeStartedEvent: coreClient.CompositeMapper = {
  serializedName: "ClusterUpgradeStarted",
  type: {
    name: "Composite",
    className: "ClusterUpgradeStartedEvent",
    uberParent: "ClusterEvent",
    polymorphicDiscriminator: ClusterEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ClusterEvent.type.modelProperties,
      currentClusterVersion: {
        serializedName: "CurrentClusterVersion",
        required: true,
        type: {
          name: "String"
        }
      },
      targetClusterVersion: {
        serializedName: "TargetClusterVersion",
        required: true,
        type: {
          name: "String"
        }
      },
      upgradeType: {
        serializedName: "UpgradeType",
        required: true,
        type: {
          name: "String"
        }
      },
      rollingUpgradeMode: {
        serializedName: "RollingUpgradeMode",
        required: true,
        type: {
          name: "String"
        }
      },
      failureAction: {
        serializedName: "FailureAction",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ChaosStoppedEvent: coreClient.CompositeMapper = {
  serializedName: "ChaosStopped",
  type: {
    name: "Composite",
    className: "ChaosStoppedEvent",
    uberParent: "ClusterEvent",
    polymorphicDiscriminator: ClusterEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ClusterEvent.type.modelProperties,
      reason: {
        serializedName: "Reason",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ChaosStartedEvent: coreClient.CompositeMapper = {
  serializedName: "ChaosStarted",
  type: {
    name: "Composite",
    className: "ChaosStartedEvent",
    uberParent: "ClusterEvent",
    polymorphicDiscriminator: ClusterEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ClusterEvent.type.modelProperties,
      maxConcurrentFaults: {
        serializedName: "MaxConcurrentFaults",
        required: true,
        type: {
          name: "Number"
        }
      },
      timeToRunInSeconds: {
        serializedName: "TimeToRunInSeconds",
        required: true,
        type: {
          name: "Number"
        }
      },
      maxClusterStabilizationTimeoutInSeconds: {
        serializedName: "MaxClusterStabilizationTimeoutInSeconds",
        required: true,
        type: {
          name: "Number"
        }
      },
      waitTimeBetweenIterationsInSeconds: {
        serializedName: "WaitTimeBetweenIterationsInSeconds",
        required: true,
        type: {
          name: "Number"
        }
      },
      waitTimeBetweenFaultsInSeconds: {
        serializedName: "WaitTimeBetweenFaultsInSeconds",
        required: true,
        type: {
          name: "Number"
        }
      },
      moveReplicaFaultEnabled: {
        serializedName: "MoveReplicaFaultEnabled",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      includedNodeTypeList: {
        serializedName: "IncludedNodeTypeList",
        required: true,
        type: {
          name: "String"
        }
      },
      includedApplicationList: {
        serializedName: "IncludedApplicationList",
        required: true,
        type: {
          name: "String"
        }
      },
      clusterHealthPolicy: {
        serializedName: "ClusterHealthPolicy",
        required: true,
        type: {
          name: "String"
        }
      },
      chaosContext: {
        serializedName: "ChaosContext",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const NodeAbortedEvent: coreClient.CompositeMapper = {
  serializedName: "NodeAborted",
  type: {
    name: "Composite",
    className: "NodeAbortedEvent",
    uberParent: "NodeEvent",
    polymorphicDiscriminator: NodeEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...NodeEvent.type.modelProperties,
      nodeInstance: {
        serializedName: "NodeInstance",
        required: true,
        type: {
          name: "Number"
        }
      },
      nodeId: {
        serializedName: "NodeId",
        required: true,
        type: {
          name: "String"
        }
      },
      upgradeDomain: {
        serializedName: "UpgradeDomain",
        required: true,
        type: {
          name: "String"
        }
      },
      faultDomain: {
        serializedName: "FaultDomain",
        required: true,
        type: {
          name: "String"
        }
      },
      ipAddressOrFqdn: {
        serializedName: "IpAddressOrFQDN",
        required: true,
        type: {
          name: "String"
        }
      },
      hostname: {
        serializedName: "Hostname",
        required: true,
        type: {
          name: "String"
        }
      },
      isSeedNode: {
        serializedName: "IsSeedNode",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      nodeVersion: {
        serializedName: "NodeVersion",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const NodeAddedToClusterEvent: coreClient.CompositeMapper = {
  serializedName: "NodeAddedToCluster",
  type: {
    name: "Composite",
    className: "NodeAddedToClusterEvent",
    uberParent: "NodeEvent",
    polymorphicDiscriminator: NodeEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...NodeEvent.type.modelProperties,
      nodeId: {
        serializedName: "NodeId",
        required: true,
        type: {
          name: "String"
        }
      },
      nodeInstance: {
        serializedName: "NodeInstance",
        required: true,
        type: {
          name: "Number"
        }
      },
      nodeType: {
        serializedName: "NodeType",
        required: true,
        type: {
          name: "String"
        }
      },
      fabricVersion: {
        serializedName: "FabricVersion",
        required: true,
        type: {
          name: "String"
        }
      },
      ipAddressOrFqdn: {
        serializedName: "IpAddressOrFQDN",
        required: true,
        type: {
          name: "String"
        }
      },
      nodeCapacities: {
        serializedName: "NodeCapacities",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const NodeClosedEvent: coreClient.CompositeMapper = {
  serializedName: "NodeClosed",
  type: {
    name: "Composite",
    className: "NodeClosedEvent",
    uberParent: "NodeEvent",
    polymorphicDiscriminator: NodeEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...NodeEvent.type.modelProperties,
      nodeId: {
        serializedName: "NodeId",
        required: true,
        type: {
          name: "String"
        }
      },
      nodeInstance: {
        serializedName: "NodeInstance",
        required: true,
        type: {
          name: "Number"
        }
      },
      error: {
        serializedName: "Error",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const NodeDeactivateCompletedEvent: coreClient.CompositeMapper = {
  serializedName: "NodeDeactivateCompleted",
  type: {
    name: "Composite",
    className: "NodeDeactivateCompletedEvent",
    uberParent: "NodeEvent",
    polymorphicDiscriminator: NodeEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...NodeEvent.type.modelProperties,
      nodeInstance: {
        serializedName: "NodeInstance",
        required: true,
        type: {
          name: "Number"
        }
      },
      effectiveDeactivateIntent: {
        serializedName: "EffectiveDeactivateIntent",
        required: true,
        type: {
          name: "String"
        }
      },
      batchIdsWithDeactivateIntent: {
        serializedName: "BatchIdsWithDeactivateIntent",
        required: true,
        type: {
          name: "String"
        }
      },
      startTime: {
        serializedName: "StartTime",
        required: true,
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const NodeDeactivateStartedEvent: coreClient.CompositeMapper = {
  serializedName: "NodeDeactivateStarted",
  type: {
    name: "Composite",
    className: "NodeDeactivateStartedEvent",
    uberParent: "NodeEvent",
    polymorphicDiscriminator: NodeEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...NodeEvent.type.modelProperties,
      nodeInstance: {
        serializedName: "NodeInstance",
        required: true,
        type: {
          name: "Number"
        }
      },
      batchId: {
        serializedName: "BatchId",
        required: true,
        type: {
          name: "String"
        }
      },
      deactivateIntent: {
        serializedName: "DeactivateIntent",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const NodeDownEvent: coreClient.CompositeMapper = {
  serializedName: "NodeDown",
  type: {
    name: "Composite",
    className: "NodeDownEvent",
    uberParent: "NodeEvent",
    polymorphicDiscriminator: NodeEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...NodeEvent.type.modelProperties,
      nodeInstance: {
        serializedName: "NodeInstance",
        required: true,
        type: {
          name: "Number"
        }
      },
      lastNodeUpAt: {
        serializedName: "LastNodeUpAt",
        required: true,
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const NodeNewHealthReportEvent: coreClient.CompositeMapper = {
  serializedName: "NodeNewHealthReport",
  type: {
    name: "Composite",
    className: "NodeNewHealthReportEvent",
    uberParent: "NodeEvent",
    polymorphicDiscriminator: NodeEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...NodeEvent.type.modelProperties,
      nodeInstanceId: {
        serializedName: "NodeInstanceId",
        required: true,
        type: {
          name: "Number"
        }
      },
      sourceId: {
        serializedName: "SourceId",
        required: true,
        type: {
          name: "String"
        }
      },
      property: {
        serializedName: "Property",
        required: true,
        type: {
          name: "String"
        }
      },
      healthState: {
        serializedName: "HealthState",
        required: true,
        type: {
          name: "String"
        }
      },
      timeToLiveMs: {
        serializedName: "TimeToLiveMs",
        required: true,
        type: {
          name: "Number"
        }
      },
      sequenceNumber: {
        serializedName: "SequenceNumber",
        required: true,
        type: {
          name: "Number"
        }
      },
      description: {
        serializedName: "Description",
        required: true,
        type: {
          name: "String"
        }
      },
      removeWhenExpired: {
        serializedName: "RemoveWhenExpired",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      sourceUtcTimestamp: {
        serializedName: "SourceUtcTimestamp",
        required: true,
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const NodeHealthReportExpiredEvent: coreClient.CompositeMapper = {
  serializedName: "NodeHealthReportExpired",
  type: {
    name: "Composite",
    className: "NodeHealthReportExpiredEvent",
    uberParent: "NodeEvent",
    polymorphicDiscriminator: NodeEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...NodeEvent.type.modelProperties,
      nodeInstanceId: {
        serializedName: "NodeInstanceId",
        required: true,
        type: {
          name: "Number"
        }
      },
      sourceId: {
        serializedName: "SourceId",
        required: true,
        type: {
          name: "String"
        }
      },
      property: {
        serializedName: "Property",
        required: true,
        type: {
          name: "String"
        }
      },
      healthState: {
        serializedName: "HealthState",
        required: true,
        type: {
          name: "String"
        }
      },
      timeToLiveMs: {
        serializedName: "TimeToLiveMs",
        required: true,
        type: {
          name: "Number"
        }
      },
      sequenceNumber: {
        serializedName: "SequenceNumber",
        required: true,
        type: {
          name: "Number"
        }
      },
      description: {
        serializedName: "Description",
        required: true,
        type: {
          name: "String"
        }
      },
      removeWhenExpired: {
        serializedName: "RemoveWhenExpired",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      sourceUtcTimestamp: {
        serializedName: "SourceUtcTimestamp",
        required: true,
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const NodeOpenSucceededEvent: coreClient.CompositeMapper = {
  serializedName: "NodeOpenSucceeded",
  type: {
    name: "Composite",
    className: "NodeOpenSucceededEvent",
    uberParent: "NodeEvent",
    polymorphicDiscriminator: NodeEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...NodeEvent.type.modelProperties,
      nodeInstance: {
        serializedName: "NodeInstance",
        required: true,
        type: {
          name: "Number"
        }
      },
      nodeId: {
        serializedName: "NodeId",
        required: true,
        type: {
          name: "String"
        }
      },
      upgradeDomain: {
        serializedName: "UpgradeDomain",
        required: true,
        type: {
          name: "String"
        }
      },
      faultDomain: {
        serializedName: "FaultDomain",
        required: true,
        type: {
          name: "String"
        }
      },
      ipAddressOrFqdn: {
        serializedName: "IpAddressOrFQDN",
        required: true,
        type: {
          name: "String"
        }
      },
      hostname: {
        serializedName: "Hostname",
        required: true,
        type: {
          name: "String"
        }
      },
      isSeedNode: {
        serializedName: "IsSeedNode",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      nodeVersion: {
        serializedName: "NodeVersion",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const NodeOpenFailedEvent: coreClient.CompositeMapper = {
  serializedName: "NodeOpenFailed",
  type: {
    name: "Composite",
    className: "NodeOpenFailedEvent",
    uberParent: "NodeEvent",
    polymorphicDiscriminator: NodeEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...NodeEvent.type.modelProperties,
      nodeInstance: {
        serializedName: "NodeInstance",
        required: true,
        type: {
          name: "Number"
        }
      },
      nodeId: {
        serializedName: "NodeId",
        required: true,
        type: {
          name: "String"
        }
      },
      upgradeDomain: {
        serializedName: "UpgradeDomain",
        required: true,
        type: {
          name: "String"
        }
      },
      faultDomain: {
        serializedName: "FaultDomain",
        required: true,
        type: {
          name: "String"
        }
      },
      ipAddressOrFqdn: {
        serializedName: "IpAddressOrFQDN",
        required: true,
        type: {
          name: "String"
        }
      },
      hostname: {
        serializedName: "Hostname",
        required: true,
        type: {
          name: "String"
        }
      },
      isSeedNode: {
        serializedName: "IsSeedNode",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      nodeVersion: {
        serializedName: "NodeVersion",
        required: true,
        type: {
          name: "String"
        }
      },
      error: {
        serializedName: "Error",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const NodeRemovedFromClusterEvent: coreClient.CompositeMapper = {
  serializedName: "NodeRemovedFromCluster",
  type: {
    name: "Composite",
    className: "NodeRemovedFromClusterEvent",
    uberParent: "NodeEvent",
    polymorphicDiscriminator: NodeEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...NodeEvent.type.modelProperties,
      nodeId: {
        serializedName: "NodeId",
        required: true,
        type: {
          name: "String"
        }
      },
      nodeInstance: {
        serializedName: "NodeInstance",
        required: true,
        type: {
          name: "Number"
        }
      },
      nodeType: {
        serializedName: "NodeType",
        required: true,
        type: {
          name: "String"
        }
      },
      fabricVersion: {
        serializedName: "FabricVersion",
        required: true,
        type: {
          name: "String"
        }
      },
      ipAddressOrFqdn: {
        serializedName: "IpAddressOrFQDN",
        required: true,
        type: {
          name: "String"
        }
      },
      nodeCapacities: {
        serializedName: "NodeCapacities",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const NodeUpEvent: coreClient.CompositeMapper = {
  serializedName: "NodeUp",
  type: {
    name: "Composite",
    className: "NodeUpEvent",
    uberParent: "NodeEvent",
    polymorphicDiscriminator: NodeEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...NodeEvent.type.modelProperties,
      nodeInstance: {
        serializedName: "NodeInstance",
        required: true,
        type: {
          name: "Number"
        }
      },
      lastNodeDownAt: {
        serializedName: "LastNodeDownAt",
        required: true,
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const ChaosNodeRestartScheduledEvent: coreClient.CompositeMapper = {
  serializedName: "ChaosNodeRestartScheduled",
  type: {
    name: "Composite",
    className: "ChaosNodeRestartScheduledEvent",
    uberParent: "NodeEvent",
    polymorphicDiscriminator: NodeEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...NodeEvent.type.modelProperties,
      nodeInstanceId: {
        serializedName: "NodeInstanceId",
        required: true,
        type: {
          name: "Number"
        }
      },
      faultGroupId: {
        serializedName: "FaultGroupId",
        required: true,
        type: {
          name: "Uuid"
        }
      },
      faultId: {
        serializedName: "FaultId",
        required: true,
        type: {
          name: "Uuid"
        }
      }
    }
  }
};

export const ApplicationCreatedEvent: coreClient.CompositeMapper = {
  serializedName: "ApplicationCreated",
  type: {
    name: "Composite",
    className: "ApplicationCreatedEvent",
    uberParent: "ApplicationEvent",
    polymorphicDiscriminator: ApplicationEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ApplicationEvent.type.modelProperties,
      applicationTypeName: {
        serializedName: "ApplicationTypeName",
        required: true,
        type: {
          name: "String"
        }
      },
      applicationTypeVersion: {
        serializedName: "ApplicationTypeVersion",
        required: true,
        type: {
          name: "String"
        }
      },
      applicationDefinitionKind: {
        serializedName: "ApplicationDefinitionKind",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ApplicationDeletedEvent: coreClient.CompositeMapper = {
  serializedName: "ApplicationDeleted",
  type: {
    name: "Composite",
    className: "ApplicationDeletedEvent",
    uberParent: "ApplicationEvent",
    polymorphicDiscriminator: ApplicationEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ApplicationEvent.type.modelProperties,
      applicationTypeName: {
        serializedName: "ApplicationTypeName",
        required: true,
        type: {
          name: "String"
        }
      },
      applicationTypeVersion: {
        serializedName: "ApplicationTypeVersion",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ApplicationNewHealthReportEvent: coreClient.CompositeMapper = {
  serializedName: "ApplicationNewHealthReport",
  type: {
    name: "Composite",
    className: "ApplicationNewHealthReportEvent",
    uberParent: "ApplicationEvent",
    polymorphicDiscriminator: ApplicationEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ApplicationEvent.type.modelProperties,
      applicationInstanceId: {
        serializedName: "ApplicationInstanceId",
        required: true,
        type: {
          name: "Number"
        }
      },
      sourceId: {
        serializedName: "SourceId",
        required: true,
        type: {
          name: "String"
        }
      },
      property: {
        serializedName: "Property",
        required: true,
        type: {
          name: "String"
        }
      },
      healthState: {
        serializedName: "HealthState",
        required: true,
        type: {
          name: "String"
        }
      },
      timeToLiveMs: {
        serializedName: "TimeToLiveMs",
        required: true,
        type: {
          name: "Number"
        }
      },
      sequenceNumber: {
        serializedName: "SequenceNumber",
        required: true,
        type: {
          name: "Number"
        }
      },
      description: {
        serializedName: "Description",
        required: true,
        type: {
          name: "String"
        }
      },
      removeWhenExpired: {
        serializedName: "RemoveWhenExpired",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      sourceUtcTimestamp: {
        serializedName: "SourceUtcTimestamp",
        required: true,
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const ApplicationHealthReportExpiredEvent: coreClient.CompositeMapper = {
  serializedName: "ApplicationHealthReportExpired",
  type: {
    name: "Composite",
    className: "ApplicationHealthReportExpiredEvent",
    uberParent: "ApplicationEvent",
    polymorphicDiscriminator: ApplicationEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ApplicationEvent.type.modelProperties,
      applicationInstanceId: {
        serializedName: "ApplicationInstanceId",
        required: true,
        type: {
          name: "Number"
        }
      },
      sourceId: {
        serializedName: "SourceId",
        required: true,
        type: {
          name: "String"
        }
      },
      property: {
        serializedName: "Property",
        required: true,
        type: {
          name: "String"
        }
      },
      healthState: {
        serializedName: "HealthState",
        required: true,
        type: {
          name: "String"
        }
      },
      timeToLiveMs: {
        serializedName: "TimeToLiveMs",
        required: true,
        type: {
          name: "Number"
        }
      },
      sequenceNumber: {
        serializedName: "SequenceNumber",
        required: true,
        type: {
          name: "Number"
        }
      },
      description: {
        serializedName: "Description",
        required: true,
        type: {
          name: "String"
        }
      },
      removeWhenExpired: {
        serializedName: "RemoveWhenExpired",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      sourceUtcTimestamp: {
        serializedName: "SourceUtcTimestamp",
        required: true,
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const ApplicationUpgradeCompletedEvent: coreClient.CompositeMapper = {
  serializedName: "ApplicationUpgradeCompleted",
  type: {
    name: "Composite",
    className: "ApplicationUpgradeCompletedEvent",
    uberParent: "ApplicationEvent",
    polymorphicDiscriminator: ApplicationEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ApplicationEvent.type.modelProperties,
      applicationTypeName: {
        serializedName: "ApplicationTypeName",
        required: true,
        type: {
          name: "String"
        }
      },
      applicationTypeVersion: {
        serializedName: "ApplicationTypeVersion",
        required: true,
        type: {
          name: "String"
        }
      },
      overallUpgradeElapsedTimeInMs: {
        serializedName: "OverallUpgradeElapsedTimeInMs",
        required: true,
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ApplicationUpgradeDomainCompletedEvent: coreClient.CompositeMapper = {
  serializedName: "ApplicationUpgradeDomainCompleted",
  type: {
    name: "Composite",
    className: "ApplicationUpgradeDomainCompletedEvent",
    uberParent: "ApplicationEvent",
    polymorphicDiscriminator: ApplicationEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ApplicationEvent.type.modelProperties,
      applicationTypeName: {
        serializedName: "ApplicationTypeName",
        required: true,
        type: {
          name: "String"
        }
      },
      currentApplicationTypeVersion: {
        serializedName: "CurrentApplicationTypeVersion",
        required: true,
        type: {
          name: "String"
        }
      },
      applicationTypeVersion: {
        serializedName: "ApplicationTypeVersion",
        required: true,
        type: {
          name: "String"
        }
      },
      upgradeState: {
        serializedName: "UpgradeState",
        required: true,
        type: {
          name: "String"
        }
      },
      upgradeDomains: {
        serializedName: "UpgradeDomains",
        required: true,
        type: {
          name: "String"
        }
      },
      upgradeDomainElapsedTimeInMs: {
        serializedName: "UpgradeDomainElapsedTimeInMs",
        required: true,
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ApplicationUpgradeRollbackCompletedEvent: coreClient.CompositeMapper = {
  serializedName: "ApplicationUpgradeRollbackCompleted",
  type: {
    name: "Composite",
    className: "ApplicationUpgradeRollbackCompletedEvent",
    uberParent: "ApplicationEvent",
    polymorphicDiscriminator: ApplicationEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ApplicationEvent.type.modelProperties,
      applicationTypeName: {
        serializedName: "ApplicationTypeName",
        required: true,
        type: {
          name: "String"
        }
      },
      applicationTypeVersion: {
        serializedName: "ApplicationTypeVersion",
        required: true,
        type: {
          name: "String"
        }
      },
      failureReason: {
        serializedName: "FailureReason",
        required: true,
        type: {
          name: "String"
        }
      },
      overallUpgradeElapsedTimeInMs: {
        serializedName: "OverallUpgradeElapsedTimeInMs",
        required: true,
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ApplicationUpgradeRollbackStartedEvent: coreClient.CompositeMapper = {
  serializedName: "ApplicationUpgradeRollbackStarted",
  type: {
    name: "Composite",
    className: "ApplicationUpgradeRollbackStartedEvent",
    uberParent: "ApplicationEvent",
    polymorphicDiscriminator: ApplicationEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ApplicationEvent.type.modelProperties,
      applicationTypeName: {
        serializedName: "ApplicationTypeName",
        required: true,
        type: {
          name: "String"
        }
      },
      currentApplicationTypeVersion: {
        serializedName: "CurrentApplicationTypeVersion",
        required: true,
        type: {
          name: "String"
        }
      },
      applicationTypeVersion: {
        serializedName: "ApplicationTypeVersion",
        required: true,
        type: {
          name: "String"
        }
      },
      failureReason: {
        serializedName: "FailureReason",
        required: true,
        type: {
          name: "String"
        }
      },
      overallUpgradeElapsedTimeInMs: {
        serializedName: "OverallUpgradeElapsedTimeInMs",
        required: true,
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ApplicationUpgradeStartedEvent: coreClient.CompositeMapper = {
  serializedName: "ApplicationUpgradeStarted",
  type: {
    name: "Composite",
    className: "ApplicationUpgradeStartedEvent",
    uberParent: "ApplicationEvent",
    polymorphicDiscriminator: ApplicationEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ApplicationEvent.type.modelProperties,
      applicationTypeName: {
        serializedName: "ApplicationTypeName",
        required: true,
        type: {
          name: "String"
        }
      },
      currentApplicationTypeVersion: {
        serializedName: "CurrentApplicationTypeVersion",
        required: true,
        type: {
          name: "String"
        }
      },
      applicationTypeVersion: {
        serializedName: "ApplicationTypeVersion",
        required: true,
        type: {
          name: "String"
        }
      },
      upgradeType: {
        serializedName: "UpgradeType",
        required: true,
        type: {
          name: "String"
        }
      },
      rollingUpgradeMode: {
        serializedName: "RollingUpgradeMode",
        required: true,
        type: {
          name: "String"
        }
      },
      failureAction: {
        serializedName: "FailureAction",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const DeployedApplicationNewHealthReportEvent: coreClient.CompositeMapper = {
  serializedName: "DeployedApplicationNewHealthReport",
  type: {
    name: "Composite",
    className: "DeployedApplicationNewHealthReportEvent",
    uberParent: "ApplicationEvent",
    polymorphicDiscriminator: ApplicationEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ApplicationEvent.type.modelProperties,
      applicationInstanceId: {
        serializedName: "ApplicationInstanceId",
        required: true,
        type: {
          name: "Number"
        }
      },
      nodeName: {
        serializedName: "NodeName",
        required: true,
        type: {
          name: "String"
        }
      },
      sourceId: {
        serializedName: "SourceId",
        required: true,
        type: {
          name: "String"
        }
      },
      property: {
        serializedName: "Property",
        required: true,
        type: {
          name: "String"
        }
      },
      healthState: {
        serializedName: "HealthState",
        required: true,
        type: {
          name: "String"
        }
      },
      timeToLiveMs: {
        serializedName: "TimeToLiveMs",
        required: true,
        type: {
          name: "Number"
        }
      },
      sequenceNumber: {
        serializedName: "SequenceNumber",
        required: true,
        type: {
          name: "Number"
        }
      },
      description: {
        serializedName: "Description",
        required: true,
        type: {
          name: "String"
        }
      },
      removeWhenExpired: {
        serializedName: "RemoveWhenExpired",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      sourceUtcTimestamp: {
        serializedName: "SourceUtcTimestamp",
        required: true,
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const DeployedApplicationHealthReportExpiredEvent: coreClient.CompositeMapper = {
  serializedName: "DeployedApplicationHealthReportExpired",
  type: {
    name: "Composite",
    className: "DeployedApplicationHealthReportExpiredEvent",
    uberParent: "ApplicationEvent",
    polymorphicDiscriminator: ApplicationEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ApplicationEvent.type.modelProperties,
      applicationInstanceId: {
        serializedName: "ApplicationInstanceId",
        required: true,
        type: {
          name: "Number"
        }
      },
      nodeName: {
        serializedName: "NodeName",
        required: true,
        type: {
          name: "String"
        }
      },
      sourceId: {
        serializedName: "SourceId",
        required: true,
        type: {
          name: "String"
        }
      },
      property: {
        serializedName: "Property",
        required: true,
        type: {
          name: "String"
        }
      },
      healthState: {
        serializedName: "HealthState",
        required: true,
        type: {
          name: "String"
        }
      },
      timeToLiveMs: {
        serializedName: "TimeToLiveMs",
        required: true,
        type: {
          name: "Number"
        }
      },
      sequenceNumber: {
        serializedName: "SequenceNumber",
        required: true,
        type: {
          name: "Number"
        }
      },
      description: {
        serializedName: "Description",
        required: true,
        type: {
          name: "String"
        }
      },
      removeWhenExpired: {
        serializedName: "RemoveWhenExpired",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      sourceUtcTimestamp: {
        serializedName: "SourceUtcTimestamp",
        required: true,
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const ApplicationProcessExitedEvent: coreClient.CompositeMapper = {
  serializedName: "ApplicationProcessExited",
  type: {
    name: "Composite",
    className: "ApplicationProcessExitedEvent",
    uberParent: "ApplicationEvent",
    polymorphicDiscriminator: ApplicationEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ApplicationEvent.type.modelProperties,
      serviceName: {
        serializedName: "ServiceName",
        required: true,
        type: {
          name: "String"
        }
      },
      servicePackageName: {
        serializedName: "ServicePackageName",
        required: true,
        type: {
          name: "String"
        }
      },
      servicePackageActivationId: {
        serializedName: "ServicePackageActivationId",
        required: true,
        type: {
          name: "String"
        }
      },
      isExclusive: {
        serializedName: "IsExclusive",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      codePackageName: {
        serializedName: "CodePackageName",
        required: true,
        type: {
          name: "String"
        }
      },
      entryPointType: {
        serializedName: "EntryPointType",
        required: true,
        type: {
          name: "String"
        }
      },
      exeName: {
        serializedName: "ExeName",
        required: true,
        type: {
          name: "String"
        }
      },
      processId: {
        serializedName: "ProcessId",
        required: true,
        type: {
          name: "Number"
        }
      },
      hostId: {
        serializedName: "HostId",
        required: true,
        type: {
          name: "String"
        }
      },
      exitCode: {
        serializedName: "ExitCode",
        required: true,
        type: {
          name: "Number"
        }
      },
      unexpectedTermination: {
        serializedName: "UnexpectedTermination",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      startTime: {
        serializedName: "StartTime",
        required: true,
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const ApplicationContainerInstanceExitedEvent: coreClient.CompositeMapper = {
  serializedName: "ApplicationContainerInstanceExited",
  type: {
    name: "Composite",
    className: "ApplicationContainerInstanceExitedEvent",
    uberParent: "ApplicationEvent",
    polymorphicDiscriminator: ApplicationEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ApplicationEvent.type.modelProperties,
      serviceName: {
        serializedName: "ServiceName",
        required: true,
        type: {
          name: "String"
        }
      },
      servicePackageName: {
        serializedName: "ServicePackageName",
        required: true,
        type: {
          name: "String"
        }
      },
      servicePackageActivationId: {
        serializedName: "ServicePackageActivationId",
        required: true,
        type: {
          name: "String"
        }
      },
      isExclusive: {
        serializedName: "IsExclusive",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      codePackageName: {
        serializedName: "CodePackageName",
        required: true,
        type: {
          name: "String"
        }
      },
      entryPointType: {
        serializedName: "EntryPointType",
        required: true,
        type: {
          name: "String"
        }
      },
      imageName: {
        serializedName: "ImageName",
        required: true,
        type: {
          name: "String"
        }
      },
      containerName: {
        serializedName: "ContainerName",
        required: true,
        type: {
          name: "String"
        }
      },
      hostId: {
        serializedName: "HostId",
        required: true,
        type: {
          name: "String"
        }
      },
      exitCode: {
        serializedName: "ExitCode",
        required: true,
        type: {
          name: "Number"
        }
      },
      unexpectedTermination: {
        serializedName: "UnexpectedTermination",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      startTime: {
        serializedName: "StartTime",
        required: true,
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const DeployedServicePackageNewHealthReportEvent: coreClient.CompositeMapper = {
  serializedName: "DeployedServicePackageNewHealthReport",
  type: {
    name: "Composite",
    className: "DeployedServicePackageNewHealthReportEvent",
    uberParent: "ApplicationEvent",
    polymorphicDiscriminator: ApplicationEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ApplicationEvent.type.modelProperties,
      serviceManifestName: {
        serializedName: "ServiceManifestName",
        required: true,
        type: {
          name: "String"
        }
      },
      servicePackageInstanceId: {
        serializedName: "ServicePackageInstanceId",
        required: true,
        type: {
          name: "Number"
        }
      },
      servicePackageActivationId: {
        serializedName: "ServicePackageActivationId",
        required: true,
        type: {
          name: "String"
        }
      },
      nodeName: {
        serializedName: "NodeName",
        required: true,
        type: {
          name: "String"
        }
      },
      sourceId: {
        serializedName: "SourceId",
        required: true,
        type: {
          name: "String"
        }
      },
      property: {
        serializedName: "Property",
        required: true,
        type: {
          name: "String"
        }
      },
      healthState: {
        serializedName: "HealthState",
        required: true,
        type: {
          name: "String"
        }
      },
      timeToLiveMs: {
        serializedName: "TimeToLiveMs",
        required: true,
        type: {
          name: "Number"
        }
      },
      sequenceNumber: {
        serializedName: "SequenceNumber",
        required: true,
        type: {
          name: "Number"
        }
      },
      description: {
        serializedName: "Description",
        required: true,
        type: {
          name: "String"
        }
      },
      removeWhenExpired: {
        serializedName: "RemoveWhenExpired",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      sourceUtcTimestamp: {
        serializedName: "SourceUtcTimestamp",
        required: true,
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const DeployedServicePackageHealthReportExpiredEvent: coreClient.CompositeMapper = {
  serializedName: "DeployedServicePackageHealthReportExpired",
  type: {
    name: "Composite",
    className: "DeployedServicePackageHealthReportExpiredEvent",
    uberParent: "ApplicationEvent",
    polymorphicDiscriminator: ApplicationEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ApplicationEvent.type.modelProperties,
      serviceManifest: {
        serializedName: "ServiceManifest",
        required: true,
        type: {
          name: "String"
        }
      },
      servicePackageInstanceId: {
        serializedName: "ServicePackageInstanceId",
        required: true,
        type: {
          name: "Number"
        }
      },
      servicePackageActivationId: {
        serializedName: "ServicePackageActivationId",
        required: true,
        type: {
          name: "String"
        }
      },
      nodeName: {
        serializedName: "NodeName",
        required: true,
        type: {
          name: "String"
        }
      },
      sourceId: {
        serializedName: "SourceId",
        required: true,
        type: {
          name: "String"
        }
      },
      property: {
        serializedName: "Property",
        required: true,
        type: {
          name: "String"
        }
      },
      healthState: {
        serializedName: "HealthState",
        required: true,
        type: {
          name: "String"
        }
      },
      timeToLiveMs: {
        serializedName: "TimeToLiveMs",
        required: true,
        type: {
          name: "Number"
        }
      },
      sequenceNumber: {
        serializedName: "SequenceNumber",
        required: true,
        type: {
          name: "Number"
        }
      },
      description: {
        serializedName: "Description",
        required: true,
        type: {
          name: "String"
        }
      },
      removeWhenExpired: {
        serializedName: "RemoveWhenExpired",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      sourceUtcTimestamp: {
        serializedName: "SourceUtcTimestamp",
        required: true,
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const ChaosCodePackageRestartScheduledEvent: coreClient.CompositeMapper = {
  serializedName: "ChaosCodePackageRestartScheduled",
  type: {
    name: "Composite",
    className: "ChaosCodePackageRestartScheduledEvent",
    uberParent: "ApplicationEvent",
    polymorphicDiscriminator: ApplicationEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ApplicationEvent.type.modelProperties,
      faultGroupId: {
        serializedName: "FaultGroupId",
        required: true,
        type: {
          name: "Uuid"
        }
      },
      faultId: {
        serializedName: "FaultId",
        required: true,
        type: {
          name: "Uuid"
        }
      },
      nodeName: {
        serializedName: "NodeName",
        required: true,
        type: {
          name: "String"
        }
      },
      serviceManifestName: {
        serializedName: "ServiceManifestName",
        required: true,
        type: {
          name: "String"
        }
      },
      codePackageName: {
        serializedName: "CodePackageName",
        required: true,
        type: {
          name: "String"
        }
      },
      servicePackageActivationId: {
        serializedName: "ServicePackageActivationId",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ServiceCreatedEvent: coreClient.CompositeMapper = {
  serializedName: "ServiceCreated",
  type: {
    name: "Composite",
    className: "ServiceCreatedEvent",
    uberParent: "ServiceEvent",
    polymorphicDiscriminator: ServiceEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ServiceEvent.type.modelProperties,
      serviceTypeName: {
        serializedName: "ServiceTypeName",
        required: true,
        type: {
          name: "String"
        }
      },
      applicationName: {
        serializedName: "ApplicationName",
        required: true,
        type: {
          name: "String"
        }
      },
      applicationTypeName: {
        serializedName: "ApplicationTypeName",
        required: true,
        type: {
          name: "String"
        }
      },
      serviceInstance: {
        serializedName: "ServiceInstance",
        required: true,
        type: {
          name: "Number"
        }
      },
      isStateful: {
        serializedName: "IsStateful",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      partitionCount: {
        serializedName: "PartitionCount",
        required: true,
        type: {
          name: "Number"
        }
      },
      targetReplicaSetSize: {
        serializedName: "TargetReplicaSetSize",
        required: true,
        type: {
          name: "Number"
        }
      },
      minReplicaSetSize: {
        serializedName: "MinReplicaSetSize",
        required: true,
        type: {
          name: "Number"
        }
      },
      servicePackageVersion: {
        serializedName: "ServicePackageVersion",
        required: true,
        type: {
          name: "String"
        }
      },
      partitionId: {
        serializedName: "PartitionId",
        required: true,
        type: {
          name: "Uuid"
        }
      }
    }
  }
};

export const ServiceDeletedEvent: coreClient.CompositeMapper = {
  serializedName: "ServiceDeleted",
  type: {
    name: "Composite",
    className: "ServiceDeletedEvent",
    uberParent: "ServiceEvent",
    polymorphicDiscriminator: ServiceEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ServiceEvent.type.modelProperties,
      serviceTypeName: {
        serializedName: "ServiceTypeName",
        required: true,
        type: {
          name: "String"
        }
      },
      applicationName: {
        serializedName: "ApplicationName",
        required: true,
        type: {
          name: "String"
        }
      },
      applicationTypeName: {
        serializedName: "ApplicationTypeName",
        required: true,
        type: {
          name: "String"
        }
      },
      serviceInstance: {
        serializedName: "ServiceInstance",
        required: true,
        type: {
          name: "Number"
        }
      },
      isStateful: {
        serializedName: "IsStateful",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      partitionCount: {
        serializedName: "PartitionCount",
        required: true,
        type: {
          name: "Number"
        }
      },
      targetReplicaSetSize: {
        serializedName: "TargetReplicaSetSize",
        required: true,
        type: {
          name: "Number"
        }
      },
      minReplicaSetSize: {
        serializedName: "MinReplicaSetSize",
        required: true,
        type: {
          name: "Number"
        }
      },
      servicePackageVersion: {
        serializedName: "ServicePackageVersion",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ServiceNewHealthReportEvent: coreClient.CompositeMapper = {
  serializedName: "ServiceNewHealthReport",
  type: {
    name: "Composite",
    className: "ServiceNewHealthReportEvent",
    uberParent: "ServiceEvent",
    polymorphicDiscriminator: ServiceEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ServiceEvent.type.modelProperties,
      instanceId: {
        serializedName: "InstanceId",
        required: true,
        type: {
          name: "Number"
        }
      },
      sourceId: {
        serializedName: "SourceId",
        required: true,
        type: {
          name: "String"
        }
      },
      property: {
        serializedName: "Property",
        required: true,
        type: {
          name: "String"
        }
      },
      healthState: {
        serializedName: "HealthState",
        required: true,
        type: {
          name: "String"
        }
      },
      timeToLiveMs: {
        serializedName: "TimeToLiveMs",
        required: true,
        type: {
          name: "Number"
        }
      },
      sequenceNumber: {
        serializedName: "SequenceNumber",
        required: true,
        type: {
          name: "Number"
        }
      },
      description: {
        serializedName: "Description",
        required: true,
        type: {
          name: "String"
        }
      },
      removeWhenExpired: {
        serializedName: "RemoveWhenExpired",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      sourceUtcTimestamp: {
        serializedName: "SourceUtcTimestamp",
        required: true,
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const ServiceHealthReportExpiredEvent: coreClient.CompositeMapper = {
  serializedName: "ServiceHealthReportExpired",
  type: {
    name: "Composite",
    className: "ServiceHealthReportExpiredEvent",
    uberParent: "ServiceEvent",
    polymorphicDiscriminator: ServiceEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ServiceEvent.type.modelProperties,
      instanceId: {
        serializedName: "InstanceId",
        required: true,
        type: {
          name: "Number"
        }
      },
      sourceId: {
        serializedName: "SourceId",
        required: true,
        type: {
          name: "String"
        }
      },
      property: {
        serializedName: "Property",
        required: true,
        type: {
          name: "String"
        }
      },
      healthState: {
        serializedName: "HealthState",
        required: true,
        type: {
          name: "String"
        }
      },
      timeToLiveMs: {
        serializedName: "TimeToLiveMs",
        required: true,
        type: {
          name: "Number"
        }
      },
      sequenceNumber: {
        serializedName: "SequenceNumber",
        required: true,
        type: {
          name: "Number"
        }
      },
      description: {
        serializedName: "Description",
        required: true,
        type: {
          name: "String"
        }
      },
      removeWhenExpired: {
        serializedName: "RemoveWhenExpired",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      sourceUtcTimestamp: {
        serializedName: "SourceUtcTimestamp",
        required: true,
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const PartitionAnalysisEvent: coreClient.CompositeMapper = {
  serializedName: "PartitionAnalysisEvent",
  type: {
    name: "Composite",
    className: "PartitionAnalysisEvent",
    uberParent: "PartitionEvent",
    polymorphicDiscriminator: {
      serializedName: "Kind",
      clientName: "kind"
    },
    modelProperties: {
      ...PartitionEvent.type.modelProperties,
      metadata: {
        serializedName: "Metadata",
        type: {
          name: "Composite",
          className: "AnalysisEventMetadata"
        }
      }
    }
  }
};

export const PartitionNewHealthReportEvent: coreClient.CompositeMapper = {
  serializedName: "PartitionNewHealthReport",
  type: {
    name: "Composite",
    className: "PartitionNewHealthReportEvent",
    uberParent: "PartitionEvent",
    polymorphicDiscriminator: PartitionEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...PartitionEvent.type.modelProperties,
      sourceId: {
        serializedName: "SourceId",
        required: true,
        type: {
          name: "String"
        }
      },
      property: {
        serializedName: "Property",
        required: true,
        type: {
          name: "String"
        }
      },
      healthState: {
        serializedName: "HealthState",
        required: true,
        type: {
          name: "String"
        }
      },
      timeToLiveMs: {
        serializedName: "TimeToLiveMs",
        required: true,
        type: {
          name: "Number"
        }
      },
      sequenceNumber: {
        serializedName: "SequenceNumber",
        required: true,
        type: {
          name: "Number"
        }
      },
      description: {
        serializedName: "Description",
        required: true,
        type: {
          name: "String"
        }
      },
      removeWhenExpired: {
        serializedName: "RemoveWhenExpired",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      sourceUtcTimestamp: {
        serializedName: "SourceUtcTimestamp",
        required: true,
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const PartitionHealthReportExpiredEvent: coreClient.CompositeMapper = {
  serializedName: "PartitionHealthReportExpired",
  type: {
    name: "Composite",
    className: "PartitionHealthReportExpiredEvent",
    uberParent: "PartitionEvent",
    polymorphicDiscriminator: PartitionEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...PartitionEvent.type.modelProperties,
      sourceId: {
        serializedName: "SourceId",
        required: true,
        type: {
          name: "String"
        }
      },
      property: {
        serializedName: "Property",
        required: true,
        type: {
          name: "String"
        }
      },
      healthState: {
        serializedName: "HealthState",
        required: true,
        type: {
          name: "String"
        }
      },
      timeToLiveMs: {
        serializedName: "TimeToLiveMs",
        required: true,
        type: {
          name: "Number"
        }
      },
      sequenceNumber: {
        serializedName: "SequenceNumber",
        required: true,
        type: {
          name: "Number"
        }
      },
      description: {
        serializedName: "Description",
        required: true,
        type: {
          name: "String"
        }
      },
      removeWhenExpired: {
        serializedName: "RemoveWhenExpired",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      sourceUtcTimestamp: {
        serializedName: "SourceUtcTimestamp",
        required: true,
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const PartitionReconfiguredEvent: coreClient.CompositeMapper = {
  serializedName: "PartitionReconfigured",
  type: {
    name: "Composite",
    className: "PartitionReconfiguredEvent",
    uberParent: "PartitionEvent",
    polymorphicDiscriminator: PartitionEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...PartitionEvent.type.modelProperties,
      nodeName: {
        serializedName: "NodeName",
        required: true,
        type: {
          name: "String"
        }
      },
      nodeInstanceId: {
        serializedName: "NodeInstanceId",
        required: true,
        type: {
          name: "String"
        }
      },
      serviceType: {
        serializedName: "ServiceType",
        required: true,
        type: {
          name: "String"
        }
      },
      ccEpochDataLossVersion: {
        serializedName: "CcEpochDataLossVersion",
        required: true,
        type: {
          name: "Number"
        }
      },
      ccEpochConfigVersion: {
        serializedName: "CcEpochConfigVersion",
        required: true,
        type: {
          name: "Number"
        }
      },
      reconfigType: {
        serializedName: "ReconfigType",
        required: true,
        type: {
          name: "String"
        }
      },
      result: {
        serializedName: "Result",
        required: true,
        type: {
          name: "String"
        }
      },
      phase0DurationMs: {
        serializedName: "Phase0DurationMs",
        required: true,
        type: {
          name: "Number"
        }
      },
      phase1DurationMs: {
        serializedName: "Phase1DurationMs",
        required: true,
        type: {
          name: "Number"
        }
      },
      phase2DurationMs: {
        serializedName: "Phase2DurationMs",
        required: true,
        type: {
          name: "Number"
        }
      },
      phase3DurationMs: {
        serializedName: "Phase3DurationMs",
        required: true,
        type: {
          name: "Number"
        }
      },
      phase4DurationMs: {
        serializedName: "Phase4DurationMs",
        required: true,
        type: {
          name: "Number"
        }
      },
      totalDurationMs: {
        serializedName: "TotalDurationMs",
        required: true,
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ChaosPartitionSecondaryMoveScheduledEvent: coreClient.CompositeMapper = {
  serializedName: "ChaosPartitionSecondaryMoveScheduled",
  type: {
    name: "Composite",
    className: "ChaosPartitionSecondaryMoveScheduledEvent",
    uberParent: "PartitionEvent",
    polymorphicDiscriminator: PartitionEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...PartitionEvent.type.modelProperties,
      faultGroupId: {
        serializedName: "FaultGroupId",
        required: true,
        type: {
          name: "Uuid"
        }
      },
      faultId: {
        serializedName: "FaultId",
        required: true,
        type: {
          name: "Uuid"
        }
      },
      serviceName: {
        serializedName: "ServiceName",
        required: true,
        type: {
          name: "String"
        }
      },
      sourceNode: {
        serializedName: "SourceNode",
        required: true,
        type: {
          name: "String"
        }
      },
      destinationNode: {
        serializedName: "DestinationNode",
        required: true,
        type: {
          name: "String"
        }
      },
      forcedMove: {
        serializedName: "ForcedMove",
        required: true,
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const ChaosPartitionPrimaryMoveScheduledEvent: coreClient.CompositeMapper = {
  serializedName: "ChaosPartitionPrimaryMoveScheduled",
  type: {
    name: "Composite",
    className: "ChaosPartitionPrimaryMoveScheduledEvent",
    uberParent: "PartitionEvent",
    polymorphicDiscriminator: PartitionEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...PartitionEvent.type.modelProperties,
      faultGroupId: {
        serializedName: "FaultGroupId",
        required: true,
        type: {
          name: "Uuid"
        }
      },
      faultId: {
        serializedName: "FaultId",
        required: true,
        type: {
          name: "Uuid"
        }
      },
      serviceName: {
        serializedName: "ServiceName",
        required: true,
        type: {
          name: "String"
        }
      },
      nodeTo: {
        serializedName: "NodeTo",
        required: true,
        type: {
          name: "String"
        }
      },
      forcedMove: {
        serializedName: "ForcedMove",
        required: true,
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const StatefulReplicaNewHealthReportEvent: coreClient.CompositeMapper = {
  serializedName: "StatefulReplicaNewHealthReport",
  type: {
    name: "Composite",
    className: "StatefulReplicaNewHealthReportEvent",
    uberParent: "ReplicaEvent",
    polymorphicDiscriminator: ReplicaEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ReplicaEvent.type.modelProperties,
      replicaInstanceId: {
        serializedName: "ReplicaInstanceId",
        required: true,
        type: {
          name: "Number"
        }
      },
      sourceId: {
        serializedName: "SourceId",
        required: true,
        type: {
          name: "String"
        }
      },
      property: {
        serializedName: "Property",
        required: true,
        type: {
          name: "String"
        }
      },
      healthState: {
        serializedName: "HealthState",
        required: true,
        type: {
          name: "String"
        }
      },
      timeToLiveMs: {
        serializedName: "TimeToLiveMs",
        required: true,
        type: {
          name: "Number"
        }
      },
      sequenceNumber: {
        serializedName: "SequenceNumber",
        required: true,
        type: {
          name: "Number"
        }
      },
      description: {
        serializedName: "Description",
        required: true,
        type: {
          name: "String"
        }
      },
      removeWhenExpired: {
        serializedName: "RemoveWhenExpired",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      sourceUtcTimestamp: {
        serializedName: "SourceUtcTimestamp",
        required: true,
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const StatefulReplicaHealthReportExpiredEvent: coreClient.CompositeMapper = {
  serializedName: "StatefulReplicaHealthReportExpired",
  type: {
    name: "Composite",
    className: "StatefulReplicaHealthReportExpiredEvent",
    uberParent: "ReplicaEvent",
    polymorphicDiscriminator: ReplicaEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ReplicaEvent.type.modelProperties,
      replicaInstanceId: {
        serializedName: "ReplicaInstanceId",
        required: true,
        type: {
          name: "Number"
        }
      },
      sourceId: {
        serializedName: "SourceId",
        required: true,
        type: {
          name: "String"
        }
      },
      property: {
        serializedName: "Property",
        required: true,
        type: {
          name: "String"
        }
      },
      healthState: {
        serializedName: "HealthState",
        required: true,
        type: {
          name: "String"
        }
      },
      timeToLiveMs: {
        serializedName: "TimeToLiveMs",
        required: true,
        type: {
          name: "Number"
        }
      },
      sequenceNumber: {
        serializedName: "SequenceNumber",
        required: true,
        type: {
          name: "Number"
        }
      },
      description: {
        serializedName: "Description",
        required: true,
        type: {
          name: "String"
        }
      },
      removeWhenExpired: {
        serializedName: "RemoveWhenExpired",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      sourceUtcTimestamp: {
        serializedName: "SourceUtcTimestamp",
        required: true,
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const StatelessReplicaNewHealthReportEvent: coreClient.CompositeMapper = {
  serializedName: "StatelessReplicaNewHealthReport",
  type: {
    name: "Composite",
    className: "StatelessReplicaNewHealthReportEvent",
    uberParent: "ReplicaEvent",
    polymorphicDiscriminator: ReplicaEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ReplicaEvent.type.modelProperties,
      sourceId: {
        serializedName: "SourceId",
        required: true,
        type: {
          name: "String"
        }
      },
      property: {
        serializedName: "Property",
        required: true,
        type: {
          name: "String"
        }
      },
      healthState: {
        serializedName: "HealthState",
        required: true,
        type: {
          name: "String"
        }
      },
      timeToLiveMs: {
        serializedName: "TimeToLiveMs",
        required: true,
        type: {
          name: "Number"
        }
      },
      sequenceNumber: {
        serializedName: "SequenceNumber",
        required: true,
        type: {
          name: "Number"
        }
      },
      description: {
        serializedName: "Description",
        required: true,
        type: {
          name: "String"
        }
      },
      removeWhenExpired: {
        serializedName: "RemoveWhenExpired",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      sourceUtcTimestamp: {
        serializedName: "SourceUtcTimestamp",
        required: true,
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const StatelessReplicaHealthReportExpiredEvent: coreClient.CompositeMapper = {
  serializedName: "StatelessReplicaHealthReportExpired",
  type: {
    name: "Composite",
    className: "StatelessReplicaHealthReportExpiredEvent",
    uberParent: "ReplicaEvent",
    polymorphicDiscriminator: ReplicaEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ReplicaEvent.type.modelProperties,
      sourceId: {
        serializedName: "SourceId",
        required: true,
        type: {
          name: "String"
        }
      },
      property: {
        serializedName: "Property",
        required: true,
        type: {
          name: "String"
        }
      },
      healthState: {
        serializedName: "HealthState",
        required: true,
        type: {
          name: "String"
        }
      },
      timeToLiveMs: {
        serializedName: "TimeToLiveMs",
        required: true,
        type: {
          name: "Number"
        }
      },
      sequenceNumber: {
        serializedName: "SequenceNumber",
        required: true,
        type: {
          name: "Number"
        }
      },
      description: {
        serializedName: "Description",
        required: true,
        type: {
          name: "String"
        }
      },
      removeWhenExpired: {
        serializedName: "RemoveWhenExpired",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      sourceUtcTimestamp: {
        serializedName: "SourceUtcTimestamp",
        required: true,
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const ChaosReplicaRemovalScheduledEvent: coreClient.CompositeMapper = {
  serializedName: "ChaosReplicaRemovalScheduled",
  type: {
    name: "Composite",
    className: "ChaosReplicaRemovalScheduledEvent",
    uberParent: "ReplicaEvent",
    polymorphicDiscriminator: ReplicaEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ReplicaEvent.type.modelProperties,
      faultGroupId: {
        serializedName: "FaultGroupId",
        required: true,
        type: {
          name: "Uuid"
        }
      },
      faultId: {
        serializedName: "FaultId",
        required: true,
        type: {
          name: "Uuid"
        }
      },
      serviceUri: {
        serializedName: "ServiceUri",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ChaosReplicaRestartScheduledEvent: coreClient.CompositeMapper = {
  serializedName: "ChaosReplicaRestartScheduled",
  type: {
    name: "Composite",
    className: "ChaosReplicaRestartScheduledEvent",
    uberParent: "ReplicaEvent",
    polymorphicDiscriminator: ReplicaEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...ReplicaEvent.type.modelProperties,
      faultGroupId: {
        serializedName: "FaultGroupId",
        required: true,
        type: {
          name: "Uuid"
        }
      },
      faultId: {
        serializedName: "FaultId",
        required: true,
        type: {
          name: "Uuid"
        }
      },
      serviceUri: {
        serializedName: "ServiceUri",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const InlinedValueSecretResourceProperties: coreClient.CompositeMapper = {
  serializedName: "inlinedValue",
  type: {
    name: "Composite",
    className: "InlinedValueSecretResourceProperties",
    uberParent: "SecretResourceProperties",
    polymorphicDiscriminator:
      SecretResourceProperties.type.polymorphicDiscriminator,
    modelProperties: {
      ...SecretResourceProperties.type.modelProperties
    }
  }
};

export const LocalNetworkResourceProperties: coreClient.CompositeMapper = {
  serializedName: "Local",
  type: {
    name: "Composite",
    className: "LocalNetworkResourceProperties",
    uberParent: "NetworkResourceProperties",
    polymorphicDiscriminator:
      NetworkResourceProperties.type.polymorphicDiscriminator,
    modelProperties: {
      ...NetworkResourceProperties.type.modelProperties,
      networkAddressPrefix: {
        serializedName: "networkAddressPrefix",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const SecondaryActiveReplicatorStatus: coreClient.CompositeMapper = {
  serializedName: "ActiveSecondary",
  type: {
    name: "Composite",
    className: "SecondaryActiveReplicatorStatus",
    uberParent: "SecondaryReplicatorStatus",
    polymorphicDiscriminator:
      SecondaryReplicatorStatus.type.polymorphicDiscriminator,
    modelProperties: {
      ...SecondaryReplicatorStatus.type.modelProperties
    }
  }
};

export const SecondaryIdleReplicatorStatus: coreClient.CompositeMapper = {
  serializedName: "IdleSecondary",
  type: {
    name: "Composite",
    className: "SecondaryIdleReplicatorStatus",
    uberParent: "SecondaryReplicatorStatus",
    polymorphicDiscriminator:
      SecondaryReplicatorStatus.type.polymorphicDiscriminator,
    modelProperties: {
      ...SecondaryReplicatorStatus.type.modelProperties
    }
  }
};

export const PartitionPrimaryMoveAnalysisEvent: coreClient.CompositeMapper = {
  serializedName: "PartitionPrimaryMoveAnalysis",
  type: {
    name: "Composite",
    className: "PartitionPrimaryMoveAnalysisEvent",
    uberParent: "PartitionAnalysisEvent",
    polymorphicDiscriminator:
      PartitionAnalysisEvent.type.polymorphicDiscriminator,
    modelProperties: {
      ...PartitionAnalysisEvent.type.modelProperties,
      whenMoveCompleted: {
        serializedName: "WhenMoveCompleted",
        required: true,
        type: {
          name: "DateTime"
        }
      },
      previousNode: {
        serializedName: "PreviousNode",
        required: true,
        type: {
          name: "String"
        }
      },
      currentNode: {
        serializedName: "CurrentNode",
        required: true,
        type: {
          name: "String"
        }
      },
      moveReason: {
        serializedName: "MoveReason",
        required: true,
        type: {
          name: "String"
        }
      },
      relevantTraces: {
        serializedName: "RelevantTraces",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export let discriminators = {
  HealthEvaluation: HealthEvaluation,
  SafetyCheck: SafetyCheck,
  ProvisionApplicationTypeDescriptionBase: ProvisionApplicationTypeDescriptionBase,
  ServiceTypeDescription: ServiceTypeDescription,
  ServicePlacementPolicyDescription: ServicePlacementPolicyDescription,
  ServiceInfo: ServiceInfo,
  ServiceDescription: ServiceDescription,
  PartitionSchemeDescription: PartitionSchemeDescription,
  ScalingTriggerDescription: ScalingTriggerDescription,
  ScalingMechanismDescription: ScalingMechanismDescription,
  ServiceUpdateDescription: ServiceUpdateDescription,
  PartitionInformation: PartitionInformation,
  ServicePartitionInfo: ServicePartitionInfo,
  RepairTargetDescriptionBase: RepairTargetDescriptionBase,
  RepairImpactDescriptionBase: RepairImpactDescriptionBase,
  ReplicaInfo: ReplicaInfo,
  DeployedServiceReplicaInfo: DeployedServiceReplicaInfo,
  DeployedServiceReplicaDetailInfo: DeployedServiceReplicaDetailInfo,
  ChaosEvent: ChaosEvent,
  BackupScheduleDescription: BackupScheduleDescription,
  BackupStorageDescription: BackupStorageDescription,
  RetentionPolicyDescription: RetentionPolicyDescription,
  BackupEntity: BackupEntity,
  BackupConfigurationInfo: BackupConfigurationInfo,
  PropertyValue: PropertyValue,
  PropertyBatchOperation: PropertyBatchOperation,
  PropertyBatchInfo: PropertyBatchInfo,
  FabricEvent: FabricEvent,
  SecretResourcePropertiesBase: SecretResourcePropertiesBase,
  NetworkResourcePropertiesBase: NetworkResourcePropertiesBase,
  ApplicationScopedVolumeCreationParameters: ApplicationScopedVolumeCreationParameters,
  ExecutionPolicy: ExecutionPolicy,
  AutoScalingTrigger: AutoScalingTrigger,
  AutoScalingMechanism: AutoScalingMechanism,
  DiagnosticsSinkProperties: DiagnosticsSinkProperties,
  ReplicatorStatus: ReplicatorStatus,
  ReplicaStatusBase: ReplicaStatusBase,
  AutoScalingMetric: AutoScalingMetric,
  "EntityHealthState.ReplicaHealthState": ReplicaHealthState,
  "EntityHealth.ReplicaHealth": ReplicaHealth,
  "HealthEvaluation.Application": ApplicationHealthEvaluation,
  "HealthEvaluation.Applications": ApplicationsHealthEvaluation,
  "HealthEvaluation.ApplicationTypeApplications": ApplicationTypeApplicationsHealthEvaluation,
  "HealthEvaluation.DeltaNodesCheck": DeltaNodesCheckHealthEvaluation,
  "HealthEvaluation.DeployedApplication": DeployedApplicationHealthEvaluation,
  "HealthEvaluation.DeployedApplications": DeployedApplicationsHealthEvaluation,
  "HealthEvaluation.DeployedServicePackage": DeployedServicePackageHealthEvaluation,
  "HealthEvaluation.DeployedServicePackages": DeployedServicePackagesHealthEvaluation,
  "HealthEvaluation.Event": EventHealthEvaluation,
  "HealthEvaluation.Node": NodeHealthEvaluation,
  "HealthEvaluation.Nodes": NodesHealthEvaluation,
  "HealthEvaluation.Partition": PartitionHealthEvaluation,
  "HealthEvaluation.Partitions": PartitionsHealthEvaluation,
  "HealthEvaluation.Replica": ReplicaHealthEvaluation,
  "HealthEvaluation.Replicas": ReplicasHealthEvaluation,
  "HealthEvaluation.Service": ServiceHealthEvaluation,
  "HealthEvaluation.Services": ServicesHealthEvaluation,
  "HealthEvaluation.SystemApplication": SystemApplicationHealthEvaluation,
  "HealthEvaluation.UpgradeDomainDeltaNodesCheck": UpgradeDomainDeltaNodesCheckHealthEvaluation,
  "HealthEvaluation.UpgradeDomainDeployedApplications": UpgradeDomainDeployedApplicationsHealthEvaluation,
  "HealthEvaluation.UpgradeDomainNodes": UpgradeDomainNodesHealthEvaluation,
  "HealthEvaluation.NodeTypeNodes": NodeTypeNodesHealthEvaluation,
  "SafetyCheck.PartitionSafetyCheck": PartitionSafetyCheck,
  "SafetyCheck.EnsureSeedNodeQuorum": SeedNodeSafetyCheck,
  "ProvisionApplicationTypeDescriptionBase.ImageStorePath": ProvisionApplicationTypeDescription,
  "ProvisionApplicationTypeDescriptionBase.ExternalStore": ExternalStoreProvisionApplicationTypeDescription,
  "ServiceTypeDescription.Stateful": StatefulServiceTypeDescription,
  "ServiceTypeDescription.Stateless": StatelessServiceTypeDescription,
  "ServicePlacementPolicyDescription.InvalidDomain": ServicePlacementInvalidDomainPolicyDescription,
  "ServicePlacementPolicyDescription.NonPartiallyPlaceService": ServicePlacementNonPartiallyPlaceServicePolicyDescription,
  "ServicePlacementPolicyDescription.AllowMultipleStatelessInstancesOnNode": ServicePlacementAllowMultipleStatelessInstancesOnNodePolicyDescription,
  "ServicePlacementPolicyDescription.PreferPrimaryDomain": ServicePlacementPreferPrimaryDomainPolicyDescription,
  "ServicePlacementPolicyDescription.RequireDomain": ServicePlacementRequiredDomainPolicyDescription,
  "ServicePlacementPolicyDescription.RequireDomainDistribution": ServicePlacementRequireDomainDistributionPolicyDescription,
  "ServiceInfo.Stateful": StatefulServiceInfo,
  "ServiceInfo.Stateless": StatelessServiceInfo,
  "ServiceDescription.Stateful": StatefulServiceDescription,
  "ServiceDescription.Stateless": StatelessServiceDescription,
  "PartitionSchemeDescription.Named": NamedPartitionSchemeDescription,
  "PartitionSchemeDescription.Singleton": SingletonPartitionSchemeDescription,
  "PartitionSchemeDescription.UniformInt64Range": UniformInt64RangePartitionSchemeDescription,
  "ScalingTriggerDescription.AveragePartitionLoad": AveragePartitionLoadScalingTrigger,
  "ScalingTriggerDescription.AverageServiceLoad": AverageServiceLoadScalingTrigger,
  "ScalingMechanismDescription.PartitionInstanceCount": PartitionInstanceCountScaleMechanism,
  "ScalingMechanismDescription.AddRemoveIncrementalNamedPartition": AddRemoveIncrementalNamedPartitionScalingMechanism,
  "ServiceUpdateDescription.Stateful": StatefulServiceUpdateDescription,
  "ServiceUpdateDescription.Stateless": StatelessServiceUpdateDescription,
  "PartitionInformation.Int64Range": Int64RangePartitionInformation,
  "PartitionInformation.Named": NamedPartitionInformation,
  "PartitionInformation.Singleton": SingletonPartitionInformation,
  "ServicePartitionInfo.Stateful": StatefulServicePartitionInfo,
  "ServicePartitionInfo.Stateless": StatelessServicePartitionInfo,
  "RepairTargetDescriptionBase.Node": NodeRepairTargetDescription,
  "RepairImpactDescriptionBase.Node": NodeRepairImpactDescription,
  "ReplicaInfo.Stateful": StatefulServiceReplicaInfo,
  "ReplicaInfo.Stateless": StatelessServiceInstanceInfo,
  "DeployedServiceReplicaInfo.Stateful": DeployedStatefulServiceReplicaInfo,
  "DeployedServiceReplicaInfo.Stateless": DeployedStatelessServiceInstanceInfo,
  "DeployedServiceReplicaDetailInfo.Stateful": DeployedStatefulServiceReplicaDetailInfo,
  "DeployedServiceReplicaDetailInfo.Stateless": DeployedStatelessServiceInstanceDetailInfo,
  "ChaosEvent.ExecutingFaults": ExecutingFaultsChaosEvent,
  "ChaosEvent.Started": StartedChaosEvent,
  "ChaosEvent.Stopped": StoppedChaosEvent,
  "ChaosEvent.TestError": TestErrorChaosEvent,
  "ChaosEvent.ValidationFailed": ValidationFailedChaosEvent,
  "ChaosEvent.Waiting": WaitingChaosEvent,
  "BackupScheduleDescription.FrequencyBased": FrequencyBasedBackupScheduleDescription,
  "BackupScheduleDescription.TimeBased": TimeBasedBackupScheduleDescription,
  "BackupStorageDescription.AzureBlobStore": AzureBlobBackupStorageDescription,
  "BackupStorageDescription.FileShare": FileShareBackupStorageDescription,
  "BackupStorageDescription.DsmsAzureBlobStore": DsmsAzureBlobBackupStorageDescription,
  "BackupStorageDescription.ManagedIdentityAzureBlobStore": ManagedIdentityAzureBlobBackupStorageDescription,
  "RetentionPolicyDescription.Basic": BasicRetentionPolicyDescription,
  "BackupEntity.Application": ApplicationBackupEntity,
  "BackupEntity.Service": ServiceBackupEntity,
  "BackupEntity.Partition": PartitionBackupEntity,
  "BackupConfigurationInfo.Partition": PartitionBackupConfigurationInfo,
  "BackupConfigurationInfo.Application": ApplicationBackupConfigurationInfo,
  "BackupConfigurationInfo.Service": ServiceBackupConfigurationInfo,
  "PropertyValue.Binary": BinaryPropertyValue,
  "PropertyValue.Int64": Int64PropertyValue,
  "PropertyValue.Double": DoublePropertyValue,
  "PropertyValue.String": StringPropertyValue,
  "PropertyValue.Guid": GuidPropertyValue,
  "PropertyBatchOperation.CheckExists": CheckExistsPropertyBatchOperation,
  "PropertyBatchOperation.CheckSequence": CheckSequencePropertyBatchOperation,
  "PropertyBatchOperation.CheckValue": CheckValuePropertyBatchOperation,
  "PropertyBatchOperation.Delete": DeletePropertyBatchOperation,
  "PropertyBatchOperation.Get": GetPropertyBatchOperation,
  "PropertyBatchOperation.Put": PutPropertyBatchOperation,
  "PropertyBatchInfo.Successful": SuccessfulPropertyBatchInfo,
  "PropertyBatchInfo.Failed": FailedPropertyBatchInfo,
  "FabricEvent.ClusterEvent": ClusterEvent,
  "FabricEvent.ContainerInstanceEvent": ContainerInstanceEvent,
  "FabricEvent.NodeEvent": NodeEvent,
  "FabricEvent.ApplicationEvent": ApplicationEvent,
  "FabricEvent.ServiceEvent": ServiceEvent,
  "FabricEvent.PartitionEvent": PartitionEvent,
  "FabricEvent.ReplicaEvent": ReplicaEvent,
  "SecretResourcePropertiesBase.SecretResourceProperties": SecretResourceProperties,
  "NetworkResourcePropertiesBase.NetworkResourceProperties": NetworkResourceProperties,
  "ApplicationScopedVolumeCreationParameters.ServiceFabricVolumeDisk": ApplicationScopedVolumeCreationParametersServiceFabricVolumeDisk,
  "ExecutionPolicy.Default": DefaultExecutionPolicy,
  "ExecutionPolicy.RunToCompletion": RunToCompletionExecutionPolicy,
  "AutoScalingTrigger.AverageLoad": AverageLoadScalingTrigger,
  "AutoScalingMechanism.AddRemoveReplica": AddRemoveReplicaScalingMechanism,
  "DiagnosticsSinkProperties.AzureInternalMonitoringPipeline": AzureInternalMonitoringPipelineSinkDescription,
  "ReplicatorStatus.Primary": PrimaryReplicatorStatus,
  "ReplicatorStatus.SecondaryReplicatorStatus": SecondaryReplicatorStatus,
  "ReplicaStatusBase.KeyValueStore": KeyValueStoreReplicaStatus,
  "AutoScalingMetric.Resource": AutoScalingResourceMetric,
  "ReplicaHealthState.Stateful": StatefulServiceReplicaHealthState,
  "ReplicaHealthState.Stateless": StatelessServiceInstanceHealthState,
  "ReplicaHealth.Stateful": StatefulServiceReplicaHealth,
  "ReplicaHealth.Stateless": StatelessServiceInstanceHealth,
  "PartitionSafetyCheck.EnsureAvailability": EnsureAvailabilitySafetyCheck,
  "PartitionSafetyCheck.EnsurePartitionQuorum": EnsurePartitionQuorumSafetyCheck,
  "PartitionSafetyCheck.WaitForInbuildReplica": WaitForInbuildReplicaSafetyCheck,
  "PartitionSafetyCheck.WaitForPrimaryPlacement": WaitForPrimaryPlacementSafetyCheck,
  "PartitionSafetyCheck.WaitForPrimarySwap": WaitForPrimarySwapSafetyCheck,
  "PartitionSafetyCheck.WaitForReconfiguration": WaitForReconfigurationSafetyCheck,
  "ClusterEvent.ClusterNewHealthReport": ClusterNewHealthReportEvent,
  "ClusterEvent.ClusterHealthReportExpired": ClusterHealthReportExpiredEvent,
  "ClusterEvent.ClusterUpgradeCompleted": ClusterUpgradeCompletedEvent,
  "ClusterEvent.ClusterUpgradeDomainCompleted": ClusterUpgradeDomainCompletedEvent,
  "ClusterEvent.ClusterUpgradeRollbackCompleted": ClusterUpgradeRollbackCompletedEvent,
  "ClusterEvent.ClusterUpgradeRollbackStarted": ClusterUpgradeRollbackStartedEvent,
  "ClusterEvent.ClusterUpgradeStarted": ClusterUpgradeStartedEvent,
  "ClusterEvent.ChaosStopped": ChaosStoppedEvent,
  "ClusterEvent.ChaosStarted": ChaosStartedEvent,
  "NodeEvent.NodeAborted": NodeAbortedEvent,
  "NodeEvent.NodeAddedToCluster": NodeAddedToClusterEvent,
  "NodeEvent.NodeClosed": NodeClosedEvent,
  "NodeEvent.NodeDeactivateCompleted": NodeDeactivateCompletedEvent,
  "NodeEvent.NodeDeactivateStarted": NodeDeactivateStartedEvent,
  "NodeEvent.NodeDown": NodeDownEvent,
  "NodeEvent.NodeNewHealthReport": NodeNewHealthReportEvent,
  "NodeEvent.NodeHealthReportExpired": NodeHealthReportExpiredEvent,
  "NodeEvent.NodeOpenSucceeded": NodeOpenSucceededEvent,
  "NodeEvent.NodeOpenFailed": NodeOpenFailedEvent,
  "NodeEvent.NodeRemovedFromCluster": NodeRemovedFromClusterEvent,
  "NodeEvent.NodeUp": NodeUpEvent,
  "NodeEvent.ChaosNodeRestartScheduled": ChaosNodeRestartScheduledEvent,
  "ApplicationEvent.ApplicationCreated": ApplicationCreatedEvent,
  "ApplicationEvent.ApplicationDeleted": ApplicationDeletedEvent,
  "ApplicationEvent.ApplicationNewHealthReport": ApplicationNewHealthReportEvent,
  "ApplicationEvent.ApplicationHealthReportExpired": ApplicationHealthReportExpiredEvent,
  "ApplicationEvent.ApplicationUpgradeCompleted": ApplicationUpgradeCompletedEvent,
  "ApplicationEvent.ApplicationUpgradeDomainCompleted": ApplicationUpgradeDomainCompletedEvent,
  "ApplicationEvent.ApplicationUpgradeRollbackCompleted": ApplicationUpgradeRollbackCompletedEvent,
  "ApplicationEvent.ApplicationUpgradeRollbackStarted": ApplicationUpgradeRollbackStartedEvent,
  "ApplicationEvent.ApplicationUpgradeStarted": ApplicationUpgradeStartedEvent,
  "ApplicationEvent.DeployedApplicationNewHealthReport": DeployedApplicationNewHealthReportEvent,
  "ApplicationEvent.DeployedApplicationHealthReportExpired": DeployedApplicationHealthReportExpiredEvent,
  "ApplicationEvent.ApplicationProcessExited": ApplicationProcessExitedEvent,
  "ApplicationEvent.ApplicationContainerInstanceExited": ApplicationContainerInstanceExitedEvent,
  "ApplicationEvent.DeployedServicePackageNewHealthReport": DeployedServicePackageNewHealthReportEvent,
  "ApplicationEvent.DeployedServicePackageHealthReportExpired": DeployedServicePackageHealthReportExpiredEvent,
  "ApplicationEvent.ChaosCodePackageRestartScheduled": ChaosCodePackageRestartScheduledEvent,
  "ServiceEvent.ServiceCreated": ServiceCreatedEvent,
  "ServiceEvent.ServiceDeleted": ServiceDeletedEvent,
  "ServiceEvent.ServiceNewHealthReport": ServiceNewHealthReportEvent,
  "ServiceEvent.ServiceHealthReportExpired": ServiceHealthReportExpiredEvent,
  "PartitionEvent.PartitionAnalysisEvent": PartitionAnalysisEvent,
  "PartitionEvent.PartitionNewHealthReport": PartitionNewHealthReportEvent,
  "PartitionEvent.PartitionHealthReportExpired": PartitionHealthReportExpiredEvent,
  "PartitionEvent.PartitionReconfigured": PartitionReconfiguredEvent,
  "PartitionEvent.ChaosPartitionSecondaryMoveScheduled": ChaosPartitionSecondaryMoveScheduledEvent,
  "PartitionEvent.ChaosPartitionPrimaryMoveScheduled": ChaosPartitionPrimaryMoveScheduledEvent,
  "ReplicaEvent.StatefulReplicaNewHealthReport": StatefulReplicaNewHealthReportEvent,
  "ReplicaEvent.StatefulReplicaHealthReportExpired": StatefulReplicaHealthReportExpiredEvent,
  "ReplicaEvent.StatelessReplicaNewHealthReport": StatelessReplicaNewHealthReportEvent,
  "ReplicaEvent.StatelessReplicaHealthReportExpired": StatelessReplicaHealthReportExpiredEvent,
  "ReplicaEvent.ChaosReplicaRemovalScheduled": ChaosReplicaRemovalScheduledEvent,
  "ReplicaEvent.ChaosReplicaRestartScheduled": ChaosReplicaRestartScheduledEvent,
  "SecretResourceProperties.inlinedValue": InlinedValueSecretResourceProperties,
  "NetworkResourceProperties.Local": LocalNetworkResourceProperties,
  "SecondaryReplicatorStatus.ActiveSecondary": SecondaryActiveReplicatorStatus,
  "SecondaryReplicatorStatus.IdleSecondary": SecondaryIdleReplicatorStatus,
  "PartitionAnalysisEvent.PartitionPrimaryMoveAnalysis": PartitionPrimaryMoveAnalysisEvent
};
