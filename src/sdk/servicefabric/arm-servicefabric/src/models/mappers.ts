import * as coreClient from "@azure/core-client";

export const ClusterVersionDetails: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ClusterVersionDetails",
    modelProperties: {
      codeVersion: {
        serializedName: "codeVersion",
        type: {
          name: "String"
        }
      },
      supportExpiryUtc: {
        serializedName: "supportExpiryUtc",
        type: {
          name: "String"
        }
      },
      environment: {
        serializedName: "environment",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const AzureActiveDirectory: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "AzureActiveDirectory",
    modelProperties: {
      tenantId: {
        serializedName: "tenantId",
        type: {
          name: "String"
        }
      },
      clusterApplication: {
        serializedName: "clusterApplication",
        type: {
          name: "String"
        }
      },
      clientApplication: {
        serializedName: "clientApplication",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const CertificateDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "CertificateDescription",
    modelProperties: {
      thumbprint: {
        serializedName: "thumbprint",
        required: true,
        type: {
          name: "String"
        }
      },
      thumbprintSecondary: {
        serializedName: "thumbprintSecondary",
        type: {
          name: "String"
        }
      },
      x509StoreName: {
        serializedName: "x509StoreName",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ServerCertificateCommonNames: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServerCertificateCommonNames",
    modelProperties: {
      commonNames: {
        serializedName: "commonNames",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ServerCertificateCommonName"
            }
          }
        }
      },
      x509StoreName: {
        serializedName: "x509StoreName",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ServerCertificateCommonName: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServerCertificateCommonName",
    modelProperties: {
      certificateCommonName: {
        serializedName: "certificateCommonName",
        required: true,
        type: {
          name: "String"
        }
      },
      certificateIssuerThumbprint: {
        serializedName: "certificateIssuerThumbprint",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ClientCertificateCommonName: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ClientCertificateCommonName",
    modelProperties: {
      isAdmin: {
        serializedName: "isAdmin",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      certificateCommonName: {
        serializedName: "certificateCommonName",
        required: true,
        type: {
          name: "String"
        }
      },
      certificateIssuerThumbprint: {
        serializedName: "certificateIssuerThumbprint",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ClientCertificateThumbprint: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ClientCertificateThumbprint",
    modelProperties: {
      isAdmin: {
        serializedName: "isAdmin",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      certificateThumbprint: {
        serializedName: "certificateThumbprint",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const DiagnosticsStorageAccountConfig: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "DiagnosticsStorageAccountConfig",
    modelProperties: {
      storageAccountName: {
        serializedName: "storageAccountName",
        required: true,
        type: {
          name: "String"
        }
      },
      protectedAccountKeyName: {
        serializedName: "protectedAccountKeyName",
        required: true,
        type: {
          name: "String"
        }
      },
      protectedAccountKeyName2: {
        serializedName: "protectedAccountKeyName2",
        type: {
          name: "String"
        }
      },
      blobEndpoint: {
        serializedName: "blobEndpoint",
        required: true,
        type: {
          name: "String"
        }
      },
      queueEndpoint: {
        serializedName: "queueEndpoint",
        required: true,
        type: {
          name: "String"
        }
      },
      tableEndpoint: {
        serializedName: "tableEndpoint",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const SettingsSectionDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "SettingsSectionDescription",
    modelProperties: {
      name: {
        serializedName: "name",
        required: true,
        type: {
          name: "String"
        }
      },
      parameters: {
        serializedName: "parameters",
        required: true,
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "SettingsParameterDescription"
            }
          }
        }
      }
    }
  }
};

export const SettingsParameterDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "SettingsParameterDescription",
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

export const NodeTypeDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "NodeTypeDescription",
    modelProperties: {
      name: {
        serializedName: "name",
        required: true,
        type: {
          name: "String"
        }
      },
      placementProperties: {
        serializedName: "placementProperties",
        type: {
          name: "Dictionary",
          value: { type: { name: "String" } }
        }
      },
      capacities: {
        serializedName: "capacities",
        type: {
          name: "Dictionary",
          value: { type: { name: "String" } }
        }
      },
      clientConnectionEndpointPort: {
        serializedName: "clientConnectionEndpointPort",
        required: true,
        type: {
          name: "Number"
        }
      },
      httpGatewayEndpointPort: {
        serializedName: "httpGatewayEndpointPort",
        required: true,
        type: {
          name: "Number"
        }
      },
      durabilityLevel: {
        serializedName: "durabilityLevel",
        type: {
          name: "String"
        }
      },
      applicationPorts: {
        serializedName: "applicationPorts",
        type: {
          name: "Composite",
          className: "EndpointRangeDescription"
        }
      },
      ephemeralPorts: {
        serializedName: "ephemeralPorts",
        type: {
          name: "Composite",
          className: "EndpointRangeDescription"
        }
      },
      isPrimary: {
        serializedName: "isPrimary",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      vmInstanceCount: {
        constraints: {
          InclusiveMaximum: 2147483647,
          InclusiveMinimum: 0
        },
        serializedName: "vmInstanceCount",
        required: true,
        type: {
          name: "Number"
        }
      },
      reverseProxyEndpointPort: {
        serializedName: "reverseProxyEndpointPort",
        type: {
          name: "Number"
        }
      },
      isStateless: {
        serializedName: "isStateless",
        type: {
          name: "Boolean"
        }
      },
      multipleAvailabilityZones: {
        serializedName: "multipleAvailabilityZones",
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const EndpointRangeDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "EndpointRangeDescription",
    modelProperties: {
      startPort: {
        serializedName: "startPort",
        required: true,
        type: {
          name: "Number"
        }
      },
      endPort: {
        serializedName: "endPort",
        required: true,
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ClusterUpgradePolicy: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ClusterUpgradePolicy",
    modelProperties: {
      forceRestart: {
        serializedName: "forceRestart",
        type: {
          name: "Boolean"
        }
      },
      upgradeReplicaSetCheckTimeout: {
        serializedName: "upgradeReplicaSetCheckTimeout",
        required: true,
        type: {
          name: "String"
        }
      },
      healthCheckWaitDuration: {
        serializedName: "healthCheckWaitDuration",
        required: true,
        type: {
          name: "String"
        }
      },
      healthCheckStableDuration: {
        serializedName: "healthCheckStableDuration",
        required: true,
        type: {
          name: "String"
        }
      },
      healthCheckRetryTimeout: {
        serializedName: "healthCheckRetryTimeout",
        required: true,
        type: {
          name: "String"
        }
      },
      upgradeTimeout: {
        serializedName: "upgradeTimeout",
        required: true,
        type: {
          name: "String"
        }
      },
      upgradeDomainTimeout: {
        serializedName: "upgradeDomainTimeout",
        required: true,
        type: {
          name: "String"
        }
      },
      healthPolicy: {
        serializedName: "healthPolicy",
        type: {
          name: "Composite",
          className: "ClusterHealthPolicy"
        }
      },
      deltaHealthPolicy: {
        serializedName: "deltaHealthPolicy",
        type: {
          name: "Composite",
          className: "ClusterUpgradeDeltaHealthPolicy"
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
      maxPercentUnhealthyNodes: {
        defaultValue: 0,
        constraints: {
          InclusiveMaximum: 100,
          InclusiveMinimum: 0
        },
        serializedName: "maxPercentUnhealthyNodes",
        type: {
          name: "Number"
        }
      },
      maxPercentUnhealthyApplications: {
        defaultValue: 0,
        constraints: {
          InclusiveMaximum: 100,
          InclusiveMinimum: 0
        },
        serializedName: "maxPercentUnhealthyApplications",
        type: {
          name: "Number"
        }
      },
      applicationHealthPolicies: {
        serializedName: "applicationHealthPolicies",
        type: {
          name: "Dictionary",
          value: {
            type: { name: "Composite", className: "ApplicationHealthPolicy" }
          }
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
      defaultServiceTypeHealthPolicy: {
        serializedName: "defaultServiceTypeHealthPolicy",
        type: {
          name: "Composite",
          className: "ServiceTypeHealthPolicy"
        }
      },
      serviceTypeHealthPolicies: {
        serializedName: "serviceTypeHealthPolicies",
        type: {
          name: "Dictionary",
          value: {
            type: { name: "Composite", className: "ServiceTypeHealthPolicy" }
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
      maxPercentUnhealthyServices: {
        defaultValue: 0,
        constraints: {
          InclusiveMaximum: 100,
          InclusiveMinimum: 0
        },
        serializedName: "maxPercentUnhealthyServices",
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ClusterUpgradeDeltaHealthPolicy: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ClusterUpgradeDeltaHealthPolicy",
    modelProperties: {
      maxPercentDeltaUnhealthyNodes: {
        constraints: {
          InclusiveMaximum: 100,
          InclusiveMinimum: 0
        },
        serializedName: "maxPercentDeltaUnhealthyNodes",
        required: true,
        type: {
          name: "Number"
        }
      },
      maxPercentUpgradeDomainDeltaUnhealthyNodes: {
        constraints: {
          InclusiveMaximum: 100,
          InclusiveMinimum: 0
        },
        serializedName: "maxPercentUpgradeDomainDeltaUnhealthyNodes",
        required: true,
        type: {
          name: "Number"
        }
      },
      maxPercentDeltaUnhealthyApplications: {
        constraints: {
          InclusiveMaximum: 100,
          InclusiveMinimum: 0
        },
        serializedName: "maxPercentDeltaUnhealthyApplications",
        required: true,
        type: {
          name: "Number"
        }
      },
      applicationDeltaHealthPolicies: {
        serializedName: "applicationDeltaHealthPolicies",
        type: {
          name: "Dictionary",
          value: {
            type: {
              name: "Composite",
              className: "ApplicationDeltaHealthPolicy"
            }
          }
        }
      }
    }
  }
};

export const ApplicationDeltaHealthPolicy: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationDeltaHealthPolicy",
    modelProperties: {
      defaultServiceTypeDeltaHealthPolicy: {
        serializedName: "defaultServiceTypeDeltaHealthPolicy",
        type: {
          name: "Composite",
          className: "ServiceTypeDeltaHealthPolicy"
        }
      },
      serviceTypeDeltaHealthPolicies: {
        serializedName: "serviceTypeDeltaHealthPolicies",
        type: {
          name: "Dictionary",
          value: {
            type: {
              name: "Composite",
              className: "ServiceTypeDeltaHealthPolicy"
            }
          }
        }
      }
    }
  }
};

export const ServiceTypeDeltaHealthPolicy: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceTypeDeltaHealthPolicy",
    modelProperties: {
      maxPercentDeltaUnhealthyServices: {
        defaultValue: 0,
        constraints: {
          InclusiveMaximum: 100,
          InclusiveMinimum: 0
        },
        serializedName: "maxPercentDeltaUnhealthyServices",
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ApplicationTypeVersionsCleanupPolicy: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationTypeVersionsCleanupPolicy",
    modelProperties: {
      maxUnusedVersionsToKeep: {
        constraints: {
          InclusiveMinimum: 0
        },
        serializedName: "maxUnusedVersionsToKeep",
        required: true,
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const Notification: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "Notification",
    modelProperties: {
      isEnabled: {
        serializedName: "isEnabled",
        required: true,
        type: {
          name: "Boolean"
        }
      },
      notificationCategory: {
        serializedName: "notificationCategory",
        required: true,
        type: {
          name: "String"
        }
      },
      notificationLevel: {
        serializedName: "notificationLevel",
        required: true,
        type: {
          name: "String"
        }
      },
      notificationTargets: {
        serializedName: "notificationTargets",
        required: true,
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "NotificationTarget"
            }
          }
        }
      }
    }
  }
};

export const NotificationTarget: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "NotificationTarget",
    modelProperties: {
      notificationChannel: {
        serializedName: "notificationChannel",
        required: true,
        type: {
          name: "String"
        }
      },
      receivers: {
        serializedName: "receivers",
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

export const Resource: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "Resource",
    modelProperties: {
      id: {
        serializedName: "id",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      name: {
        serializedName: "name",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      type: {
        serializedName: "type",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      location: {
        serializedName: "location",
        required: true,
        type: {
          name: "String"
        }
      },
      tags: {
        serializedName: "tags",
        type: {
          name: "Dictionary",
          value: { type: { name: "String" } }
        }
      },
      etag: {
        serializedName: "etag",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      systemData: {
        serializedName: "systemData",
        type: {
          name: "Composite",
          className: "SystemData"
        }
      }
    }
  }
};

export const SystemData: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "SystemData",
    modelProperties: {
      createdBy: {
        serializedName: "createdBy",
        type: {
          name: "String"
        }
      },
      createdByType: {
        serializedName: "createdByType",
        type: {
          name: "String"
        }
      },
      createdAt: {
        serializedName: "createdAt",
        type: {
          name: "DateTime"
        }
      },
      lastModifiedBy: {
        serializedName: "lastModifiedBy",
        type: {
          name: "String"
        }
      },
      lastModifiedByType: {
        serializedName: "lastModifiedByType",
        type: {
          name: "String"
        }
      },
      lastModifiedAt: {
        serializedName: "lastModifiedAt",
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const ErrorModel: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ErrorModel",
    modelProperties: {
      error: {
        serializedName: "error",
        type: {
          name: "Composite",
          className: "ErrorModelError"
        }
      }
    }
  }
};

export const ErrorModelError: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ErrorModelError",
    modelProperties: {
      code: {
        serializedName: "code",
        type: {
          name: "String"
        }
      },
      message: {
        serializedName: "message",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ClusterUpdateParameters: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ClusterUpdateParameters",
    modelProperties: {
      tags: {
        serializedName: "tags",
        type: {
          name: "Dictionary",
          value: { type: { name: "String" } }
        }
      },
      addOnFeatures: {
        serializedName: "properties.addOnFeatures",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "String"
            }
          }
        }
      },
      certificate: {
        serializedName: "properties.certificate",
        type: {
          name: "Composite",
          className: "CertificateDescription"
        }
      },
      certificateCommonNames: {
        serializedName: "properties.certificateCommonNames",
        type: {
          name: "Composite",
          className: "ServerCertificateCommonNames"
        }
      },
      clientCertificateCommonNames: {
        serializedName: "properties.clientCertificateCommonNames",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ClientCertificateCommonName"
            }
          }
        }
      },
      clientCertificateThumbprints: {
        serializedName: "properties.clientCertificateThumbprints",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ClientCertificateThumbprint"
            }
          }
        }
      },
      clusterCodeVersion: {
        serializedName: "properties.clusterCodeVersion",
        type: {
          name: "String"
        }
      },
      eventStoreServiceEnabled: {
        serializedName: "properties.eventStoreServiceEnabled",
        type: {
          name: "Boolean"
        }
      },
      fabricSettings: {
        serializedName: "properties.fabricSettings",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "SettingsSectionDescription"
            }
          }
        }
      },
      nodeTypes: {
        serializedName: "properties.nodeTypes",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "NodeTypeDescription"
            }
          }
        }
      },
      reliabilityLevel: {
        serializedName: "properties.reliabilityLevel",
        type: {
          name: "String"
        }
      },
      reverseProxyCertificate: {
        serializedName: "properties.reverseProxyCertificate",
        type: {
          name: "Composite",
          className: "CertificateDescription"
        }
      },
      upgradeDescription: {
        serializedName: "properties.upgradeDescription",
        type: {
          name: "Composite",
          className: "ClusterUpgradePolicy"
        }
      },
      applicationTypeVersionsCleanupPolicy: {
        serializedName: "properties.applicationTypeVersionsCleanupPolicy",
        type: {
          name: "Composite",
          className: "ApplicationTypeVersionsCleanupPolicy"
        }
      },
      upgradeMode: {
        defaultValue: "Automatic",
        serializedName: "properties.upgradeMode",
        type: {
          name: "String"
        }
      },
      sfZonalUpgradeMode: {
        serializedName: "properties.sfZonalUpgradeMode",
        type: {
          name: "String"
        }
      },
      vmssZonalUpgradeMode: {
        serializedName: "properties.vmssZonalUpgradeMode",
        type: {
          name: "String"
        }
      },
      infrastructureServiceManager: {
        serializedName: "properties.infrastructureServiceManager",
        type: {
          name: "Boolean"
        }
      },
      upgradeWave: {
        serializedName: "properties.upgradeWave",
        type: {
          name: "String"
        }
      },
      upgradePauseStartTimestampUtc: {
        serializedName: "properties.upgradePauseStartTimestampUtc",
        type: {
          name: "DateTime"
        }
      },
      upgradePauseEndTimestampUtc: {
        serializedName: "properties.upgradePauseEndTimestampUtc",
        type: {
          name: "DateTime"
        }
      },
      waveUpgradePaused: {
        serializedName: "properties.waveUpgradePaused",
        type: {
          name: "Boolean"
        }
      },
      notifications: {
        serializedName: "properties.notifications",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "Notification"
            }
          }
        }
      }
    }
  }
};

export const ClusterListResult: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ClusterListResult",
    modelProperties: {
      value: {
        serializedName: "value",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "Cluster"
            }
          }
        }
      },
      nextLink: {
        serializedName: "nextLink",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ClusterCodeVersionsListResult: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ClusterCodeVersionsListResult",
    modelProperties: {
      value: {
        serializedName: "value",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ClusterCodeVersionsResult"
            }
          }
        }
      },
      nextLink: {
        serializedName: "nextLink",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ClusterCodeVersionsResult: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ClusterCodeVersionsResult",
    modelProperties: {
      id: {
        serializedName: "id",
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
      type: {
        serializedName: "type",
        type: {
          name: "String"
        }
      },
      codeVersion: {
        serializedName: "properties.codeVersion",
        type: {
          name: "String"
        }
      },
      supportExpiryUtc: {
        serializedName: "properties.supportExpiryUtc",
        type: {
          name: "String"
        }
      },
      environment: {
        serializedName: "properties.environment",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const UpgradableVersionsDescription: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "UpgradableVersionsDescription",
    modelProperties: {
      targetVersion: {
        serializedName: "targetVersion",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const UpgradableVersionPathResult: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "UpgradableVersionPathResult",
    modelProperties: {
      supportedPath: {
        serializedName: "supportedPath",
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

export const OperationListResult: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "OperationListResult",
    modelProperties: {
      value: {
        serializedName: "value",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "OperationResult"
            }
          }
        }
      },
      nextLink: {
        serializedName: "nextLink",
        readOnly: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const OperationResult: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "OperationResult",
    modelProperties: {
      name: {
        serializedName: "name",
        type: {
          name: "String"
        }
      },
      isDataAction: {
        serializedName: "isDataAction",
        type: {
          name: "Boolean"
        }
      },
      display: {
        serializedName: "display",
        type: {
          name: "Composite",
          className: "AvailableOperationDisplay"
        }
      },
      origin: {
        serializedName: "origin",
        type: {
          name: "String"
        }
      },
      nextLink: {
        serializedName: "nextLink",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const AvailableOperationDisplay: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "AvailableOperationDisplay",
    modelProperties: {
      provider: {
        serializedName: "provider",
        type: {
          name: "String"
        }
      },
      resource: {
        serializedName: "resource",
        type: {
          name: "String"
        }
      },
      operation: {
        serializedName: "operation",
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

export const ProxyResource: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ProxyResource",
    modelProperties: {
      id: {
        serializedName: "id",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      name: {
        serializedName: "name",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      type: {
        serializedName: "type",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      location: {
        serializedName: "location",
        type: {
          name: "String"
        }
      },
      tags: {
        serializedName: "tags",
        type: {
          name: "Dictionary",
          value: { type: { name: "String" } }
        }
      },
      etag: {
        serializedName: "etag",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      systemData: {
        serializedName: "systemData",
        type: {
          name: "Composite",
          className: "SystemData"
        }
      }
    }
  }
};

export const ApplicationTypeResourceList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationTypeResourceList",
    modelProperties: {
      value: {
        serializedName: "value",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ApplicationTypeResource"
            }
          }
        }
      },
      nextLink: {
        serializedName: "nextLink",
        readOnly: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ApplicationTypeVersionResourceList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationTypeVersionResourceList",
    modelProperties: {
      value: {
        serializedName: "value",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ApplicationTypeVersionResource"
            }
          }
        }
      },
      nextLink: {
        serializedName: "nextLink",
        readOnly: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ManagedIdentity: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ManagedIdentity",
    modelProperties: {
      principalId: {
        serializedName: "principalId",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      tenantId: {
        serializedName: "tenantId",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      type: {
        serializedName: "type",
        type: {
          name: "Enum",
          allowedValues: [
            "SystemAssigned",
            "UserAssigned",
            "SystemAssigned, UserAssigned",
            "None"
          ]
        }
      },
      userAssignedIdentities: {
        serializedName: "userAssignedIdentities",
        type: {
          name: "Dictionary",
          value: {
            type: { name: "Composite", className: "UserAssignedIdentity" }
          }
        }
      }
    }
  }
};

export const UserAssignedIdentity: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "UserAssignedIdentity",
    modelProperties: {
      principalId: {
        serializedName: "principalId",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      clientId: {
        serializedName: "clientId",
        readOnly: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ApplicationResourceUpdateProperties: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationResourceUpdateProperties",
    modelProperties: {
      typeVersion: {
        serializedName: "typeVersion",
        type: {
          name: "String"
        }
      },
      parameters: {
        serializedName: "parameters",
        type: {
          name: "Dictionary",
          value: { type: { name: "String" } }
        }
      },
      upgradePolicy: {
        serializedName: "upgradePolicy",
        type: {
          name: "Composite",
          className: "ApplicationUpgradePolicy"
        }
      },
      minimumNodes: {
        constraints: {
          InclusiveMinimum: 0
        },
        serializedName: "minimumNodes",
        type: {
          name: "Number"
        }
      },
      maximumNodes: {
        defaultValue: 0,
        constraints: {
          InclusiveMinimum: 0
        },
        serializedName: "maximumNodes",
        type: {
          name: "Number"
        }
      },
      removeApplicationCapacity: {
        serializedName: "removeApplicationCapacity",
        type: {
          name: "Boolean"
        }
      },
      metrics: {
        serializedName: "metrics",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ApplicationMetricDescription"
            }
          }
        }
      },
      managedIdentities: {
        serializedName: "managedIdentities",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ApplicationUserAssignedIdentity"
            }
          }
        }
      }
    }
  }
};

export const ApplicationUpgradePolicy: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationUpgradePolicy",
    modelProperties: {
      upgradeReplicaSetCheckTimeout: {
        serializedName: "upgradeReplicaSetCheckTimeout",
        type: {
          name: "String"
        }
      },
      forceRestart: {
        defaultValue: false,
        serializedName: "forceRestart",
        type: {
          name: "Boolean"
        }
      },
      rollingUpgradeMonitoringPolicy: {
        serializedName: "rollingUpgradeMonitoringPolicy",
        type: {
          name: "Composite",
          className: "ArmRollingUpgradeMonitoringPolicy"
        }
      },
      applicationHealthPolicy: {
        serializedName: "applicationHealthPolicy",
        type: {
          name: "Composite",
          className: "ArmApplicationHealthPolicy"
        }
      },
      upgradeMode: {
        defaultValue: "Monitored",
        serializedName: "upgradeMode",
        type: {
          name: "String"
        }
      },
      recreateApplication: {
        serializedName: "recreateApplication",
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const ArmRollingUpgradeMonitoringPolicy: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ArmRollingUpgradeMonitoringPolicy",
    modelProperties: {
      failureAction: {
        serializedName: "failureAction",
        type: {
          name: "String"
        }
      },
      healthCheckWaitDuration: {
        defaultValue: "0",
        serializedName: "healthCheckWaitDuration",
        type: {
          name: "String"
        }
      },
      healthCheckStableDuration: {
        defaultValue: "PT0H2M0S",
        serializedName: "healthCheckStableDuration",
        type: {
          name: "String"
        }
      },
      healthCheckRetryTimeout: {
        defaultValue: "PT0H10M0S",
        serializedName: "healthCheckRetryTimeout",
        type: {
          name: "String"
        }
      },
      upgradeTimeout: {
        defaultValue: "P10675199DT02H48M05.4775807S",
        serializedName: "upgradeTimeout",
        type: {
          name: "String"
        }
      },
      upgradeDomainTimeout: {
        defaultValue: "P10675199DT02H48M05.4775807S",
        serializedName: "upgradeDomainTimeout",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ArmApplicationHealthPolicy: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ArmApplicationHealthPolicy",
    modelProperties: {
      considerWarningAsError: {
        defaultValue: false,
        serializedName: "considerWarningAsError",
        type: {
          name: "Boolean"
        }
      },
      maxPercentUnhealthyDeployedApplications: {
        defaultValue: 0,
        serializedName: "maxPercentUnhealthyDeployedApplications",
        type: {
          name: "Number"
        }
      },
      defaultServiceTypeHealthPolicy: {
        serializedName: "defaultServiceTypeHealthPolicy",
        type: {
          name: "Composite",
          className: "ArmServiceTypeHealthPolicy"
        }
      },
      serviceTypeHealthPolicyMap: {
        serializedName: "serviceTypeHealthPolicyMap",
        type: {
          name: "Dictionary",
          value: {
            type: { name: "Composite", className: "ArmServiceTypeHealthPolicy" }
          }
        }
      }
    }
  }
};

export const ArmServiceTypeHealthPolicy: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ArmServiceTypeHealthPolicy",
    modelProperties: {
      maxPercentUnhealthyServices: {
        defaultValue: 0,
        constraints: {
          InclusiveMaximum: 100,
          InclusiveMinimum: 0
        },
        serializedName: "maxPercentUnhealthyServices",
        type: {
          name: "Number"
        }
      },
      maxPercentUnhealthyPartitionsPerService: {
        defaultValue: 0,
        constraints: {
          InclusiveMaximum: 100,
          InclusiveMinimum: 0
        },
        serializedName: "maxPercentUnhealthyPartitionsPerService",
        type: {
          name: "Number"
        }
      },
      maxPercentUnhealthyReplicasPerPartition: {
        defaultValue: 0,
        constraints: {
          InclusiveMaximum: 100,
          InclusiveMinimum: 0
        },
        serializedName: "maxPercentUnhealthyReplicasPerPartition",
        type: {
          name: "Number"
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
        serializedName: "name",
        type: {
          name: "String"
        }
      },
      maximumCapacity: {
        serializedName: "maximumCapacity",
        type: {
          name: "Number"
        }
      },
      reservationCapacity: {
        serializedName: "reservationCapacity",
        type: {
          name: "Number"
        }
      },
      totalApplicationCapacity: {
        serializedName: "totalApplicationCapacity",
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ApplicationUserAssignedIdentity: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationUserAssignedIdentity",
    modelProperties: {
      name: {
        serializedName: "name",
        required: true,
        type: {
          name: "String"
        }
      },
      principalId: {
        serializedName: "principalId",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ApplicationResourceList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationResourceList",
    modelProperties: {
      value: {
        serializedName: "value",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ApplicationResource"
            }
          }
        }
      },
      nextLink: {
        serializedName: "nextLink",
        readOnly: true,
        type: {
          name: "String"
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
      serializedName: "partitionScheme",
      clientName: "partitionScheme"
    },
    modelProperties: {
      partitionScheme: {
        serializedName: "partitionScheme",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ServiceResourcePropertiesBase: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceResourcePropertiesBase",
    modelProperties: {
      placementConstraints: {
        serializedName: "placementConstraints",
        type: {
          name: "String"
        }
      },
      correlationScheme: {
        serializedName: "correlationScheme",
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
        serializedName: "serviceLoadMetrics",
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
        serializedName: "servicePlacementPolicies",
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
        serializedName: "defaultMoveCost",
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
        serializedName: "scheme",
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
        serializedName: "name",
        required: true,
        type: {
          name: "String"
        }
      },
      weight: {
        serializedName: "weight",
        type: {
          name: "String"
        }
      },
      primaryDefaultLoad: {
        serializedName: "primaryDefaultLoad",
        type: {
          name: "Number"
        }
      },
      secondaryDefaultLoad: {
        serializedName: "secondaryDefaultLoad",
        type: {
          name: "Number"
        }
      },
      defaultLoad: {
        serializedName: "defaultLoad",
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const ServicePlacementPolicyDescription: coreClient.CompositeMapper = {
  serializedName: "ServicePlacementPolicyDescription",
  type: {
    name: "Composite",
    className: "ServicePlacementPolicyDescription",
    uberParent: "ServicePlacementPolicyDescription",
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

export const ServiceResourceList: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceResourceList",
    modelProperties: {
      value: {
        serializedName: "value",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ServiceResource"
            }
          }
        }
      },
      nextLink: {
        serializedName: "nextLink",
        readOnly: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const Cluster: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "Cluster",
    modelProperties: {
      ...Resource.type.modelProperties,
      addOnFeatures: {
        serializedName: "properties.addOnFeatures",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "String"
            }
          }
        }
      },
      availableClusterVersions: {
        serializedName: "properties.availableClusterVersions",
        readOnly: true,
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ClusterVersionDetails"
            }
          }
        }
      },
      azureActiveDirectory: {
        serializedName: "properties.azureActiveDirectory",
        type: {
          name: "Composite",
          className: "AzureActiveDirectory"
        }
      },
      certificate: {
        serializedName: "properties.certificate",
        type: {
          name: "Composite",
          className: "CertificateDescription"
        }
      },
      certificateCommonNames: {
        serializedName: "properties.certificateCommonNames",
        type: {
          name: "Composite",
          className: "ServerCertificateCommonNames"
        }
      },
      clientCertificateCommonNames: {
        serializedName: "properties.clientCertificateCommonNames",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ClientCertificateCommonName"
            }
          }
        }
      },
      clientCertificateThumbprints: {
        serializedName: "properties.clientCertificateThumbprints",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ClientCertificateThumbprint"
            }
          }
        }
      },
      clusterCodeVersion: {
        serializedName: "properties.clusterCodeVersion",
        type: {
          name: "String"
        }
      },
      clusterEndpoint: {
        serializedName: "properties.clusterEndpoint",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      clusterId: {
        serializedName: "properties.clusterId",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      clusterState: {
        serializedName: "properties.clusterState",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      diagnosticsStorageAccountConfig: {
        serializedName: "properties.diagnosticsStorageAccountConfig",
        type: {
          name: "Composite",
          className: "DiagnosticsStorageAccountConfig"
        }
      },
      eventStoreServiceEnabled: {
        serializedName: "properties.eventStoreServiceEnabled",
        type: {
          name: "Boolean"
        }
      },
      fabricSettings: {
        serializedName: "properties.fabricSettings",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "SettingsSectionDescription"
            }
          }
        }
      },
      managementEndpoint: {
        serializedName: "properties.managementEndpoint",
        type: {
          name: "String"
        }
      },
      nodeTypes: {
        serializedName: "properties.nodeTypes",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "NodeTypeDescription"
            }
          }
        }
      },
      provisioningState: {
        serializedName: "properties.provisioningState",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      reliabilityLevel: {
        serializedName: "properties.reliabilityLevel",
        type: {
          name: "String"
        }
      },
      reverseProxyCertificate: {
        serializedName: "properties.reverseProxyCertificate",
        type: {
          name: "Composite",
          className: "CertificateDescription"
        }
      },
      reverseProxyCertificateCommonNames: {
        serializedName: "properties.reverseProxyCertificateCommonNames",
        type: {
          name: "Composite",
          className: "ServerCertificateCommonNames"
        }
      },
      upgradeDescription: {
        serializedName: "properties.upgradeDescription",
        type: {
          name: "Composite",
          className: "ClusterUpgradePolicy"
        }
      },
      upgradeMode: {
        defaultValue: "Automatic",
        serializedName: "properties.upgradeMode",
        type: {
          name: "String"
        }
      },
      applicationTypeVersionsCleanupPolicy: {
        serializedName: "properties.applicationTypeVersionsCleanupPolicy",
        type: {
          name: "Composite",
          className: "ApplicationTypeVersionsCleanupPolicy"
        }
      },
      vmImage: {
        serializedName: "properties.vmImage",
        type: {
          name: "String"
        }
      },
      sfZonalUpgradeMode: {
        serializedName: "properties.sfZonalUpgradeMode",
        type: {
          name: "String"
        }
      },
      vmssZonalUpgradeMode: {
        serializedName: "properties.vmssZonalUpgradeMode",
        type: {
          name: "String"
        }
      },
      infrastructureServiceManager: {
        serializedName: "properties.infrastructureServiceManager",
        type: {
          name: "Boolean"
        }
      },
      upgradeWave: {
        serializedName: "properties.upgradeWave",
        type: {
          name: "String"
        }
      },
      upgradePauseStartTimestampUtc: {
        serializedName: "properties.upgradePauseStartTimestampUtc",
        type: {
          name: "DateTime"
        }
      },
      upgradePauseEndTimestampUtc: {
        serializedName: "properties.upgradePauseEndTimestampUtc",
        type: {
          name: "DateTime"
        }
      },
      waveUpgradePaused: {
        serializedName: "properties.waveUpgradePaused",
        type: {
          name: "Boolean"
        }
      },
      notifications: {
        serializedName: "properties.notifications",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "Notification"
            }
          }
        }
      }
    }
  }
};

export const ApplicationTypeResource: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationTypeResource",
    modelProperties: {
      ...ProxyResource.type.modelProperties,
      provisioningState: {
        serializedName: "properties.provisioningState",
        readOnly: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ApplicationTypeVersionResource: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationTypeVersionResource",
    modelProperties: {
      ...ProxyResource.type.modelProperties,
      provisioningState: {
        serializedName: "properties.provisioningState",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      appPackageUrl: {
        serializedName: "properties.appPackageUrl",
        type: {
          name: "String"
        }
      },
      defaultParameterList: {
        serializedName: "properties.defaultParameterList",
        readOnly: true,
        type: {
          name: "Dictionary",
          value: { type: { name: "String" } }
        }
      }
    }
  }
};

export const ApplicationResource: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationResource",
    modelProperties: {
      ...ProxyResource.type.modelProperties,
      identity: {
        serializedName: "identity",
        type: {
          name: "Composite",
          className: "ManagedIdentity"
        }
      },
      typeVersion: {
        serializedName: "properties.typeVersion",
        type: {
          name: "String"
        }
      },
      parameters: {
        serializedName: "properties.parameters",
        type: {
          name: "Dictionary",
          value: { type: { name: "String" } }
        }
      },
      upgradePolicy: {
        serializedName: "properties.upgradePolicy",
        type: {
          name: "Composite",
          className: "ApplicationUpgradePolicy"
        }
      },
      minimumNodes: {
        constraints: {
          InclusiveMinimum: 0
        },
        serializedName: "properties.minimumNodes",
        type: {
          name: "Number"
        }
      },
      maximumNodes: {
        defaultValue: 0,
        constraints: {
          InclusiveMinimum: 0
        },
        serializedName: "properties.maximumNodes",
        type: {
          name: "Number"
        }
      },
      removeApplicationCapacity: {
        serializedName: "properties.removeApplicationCapacity",
        type: {
          name: "Boolean"
        }
      },
      metrics: {
        serializedName: "properties.metrics",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ApplicationMetricDescription"
            }
          }
        }
      },
      managedIdentities: {
        serializedName: "properties.managedIdentities",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ApplicationUserAssignedIdentity"
            }
          }
        }
      },
      provisioningState: {
        serializedName: "properties.provisioningState",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      typeName: {
        serializedName: "properties.typeName",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ApplicationResourceUpdate: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationResourceUpdate",
    modelProperties: {
      ...ProxyResource.type.modelProperties,
      typeVersion: {
        serializedName: "properties.typeVersion",
        type: {
          name: "String"
        }
      },
      parameters: {
        serializedName: "properties.parameters",
        type: {
          name: "Dictionary",
          value: { type: { name: "String" } }
        }
      },
      upgradePolicy: {
        serializedName: "properties.upgradePolicy",
        type: {
          name: "Composite",
          className: "ApplicationUpgradePolicy"
        }
      },
      minimumNodes: {
        constraints: {
          InclusiveMinimum: 0
        },
        serializedName: "properties.minimumNodes",
        type: {
          name: "Number"
        }
      },
      maximumNodes: {
        defaultValue: 0,
        constraints: {
          InclusiveMinimum: 0
        },
        serializedName: "properties.maximumNodes",
        type: {
          name: "Number"
        }
      },
      removeApplicationCapacity: {
        serializedName: "properties.removeApplicationCapacity",
        type: {
          name: "Boolean"
        }
      },
      metrics: {
        serializedName: "properties.metrics",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ApplicationMetricDescription"
            }
          }
        }
      },
      managedIdentities: {
        serializedName: "properties.managedIdentities",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "ApplicationUserAssignedIdentity"
            }
          }
        }
      }
    }
  }
};

export const ServiceResource: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceResource",
    modelProperties: {
      ...ProxyResource.type.modelProperties,
      placementConstraints: {
        serializedName: "properties.placementConstraints",
        type: {
          name: "String"
        }
      },
      correlationScheme: {
        serializedName: "properties.correlationScheme",
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
        serializedName: "properties.serviceLoadMetrics",
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
        serializedName: "properties.servicePlacementPolicies",
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
        serializedName: "properties.defaultMoveCost",
        type: {
          name: "String"
        }
      },
      provisioningState: {
        serializedName: "properties.provisioningState",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      serviceKind: {
        serializedName: "properties.serviceKind",
        type: {
          name: "String"
        }
      },
      serviceTypeName: {
        serializedName: "properties.serviceTypeName",
        type: {
          name: "String"
        }
      },
      partitionDescription: {
        serializedName: "properties.partitionDescription",
        type: {
          name: "Composite",
          className: "PartitionSchemeDescription"
        }
      },
      servicePackageActivationMode: {
        serializedName: "properties.servicePackageActivationMode",
        type: {
          name: "String"
        }
      },
      serviceDnsName: {
        serializedName: "properties.serviceDnsName",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ServiceResourceUpdate: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ServiceResourceUpdate",
    modelProperties: {
      ...ProxyResource.type.modelProperties,
      placementConstraints: {
        serializedName: "properties.placementConstraints",
        type: {
          name: "String"
        }
      },
      correlationScheme: {
        serializedName: "properties.correlationScheme",
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
        serializedName: "properties.serviceLoadMetrics",
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
        serializedName: "properties.servicePlacementPolicies",
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
        serializedName: "properties.defaultMoveCost",
        type: {
          name: "String"
        }
      },
      serviceKind: {
        serializedName: "properties.serviceKind",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ApplicationResourceProperties: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "ApplicationResourceProperties",
    modelProperties: {
      ...ApplicationResourceUpdateProperties.type.modelProperties,
      provisioningState: {
        serializedName: "provisioningState",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      typeName: {
        serializedName: "typeName",
        type: {
          name: "String"
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
        serializedName: "count",
        required: true,
        type: {
          name: "Number"
        }
      },
      names: {
        serializedName: "names",
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
        serializedName: "count",
        required: true,
        type: {
          name: "Number"
        }
      },
      lowKey: {
        serializedName: "lowKey",
        required: true,
        type: {
          name: "String"
        }
      },
      highKey: {
        serializedName: "highKey",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ServiceResourceProperties: coreClient.CompositeMapper = {
  serializedName: "ServiceResourceProperties",
  type: {
    name: "Composite",
    className: "ServiceResourceProperties",
    uberParent: "ServiceResourcePropertiesBase",
    polymorphicDiscriminator: {
      serializedName: "serviceKind",
      clientName: "serviceKind"
    },
    modelProperties: {
      ...ServiceResourcePropertiesBase.type.modelProperties,
      provisioningState: {
        serializedName: "provisioningState",
        readOnly: true,
        type: {
          name: "String"
        }
      },
      serviceKind: {
        serializedName: "serviceKind",
        required: true,
        type: {
          name: "String"
        }
      },
      serviceTypeName: {
        serializedName: "serviceTypeName",
        type: {
          name: "String"
        }
      },
      partitionDescription: {
        serializedName: "partitionDescription",
        type: {
          name: "Composite",
          className: "PartitionSchemeDescription"
        }
      },
      servicePackageActivationMode: {
        serializedName: "servicePackageActivationMode",
        type: {
          name: "String"
        }
      },
      serviceDnsName: {
        serializedName: "serviceDnsName",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const ServiceResourceUpdateProperties: coreClient.CompositeMapper = {
  serializedName: "ServiceResourceUpdateProperties",
  type: {
    name: "Composite",
    className: "ServiceResourceUpdateProperties",
    uberParent: "ServiceResourcePropertiesBase",
    polymorphicDiscriminator: {
      serializedName: "serviceKind",
      clientName: "serviceKind"
    },
    modelProperties: {
      ...ServiceResourcePropertiesBase.type.modelProperties,
      serviceKind: {
        serializedName: "serviceKind",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};

export const StatefulServiceProperties: coreClient.CompositeMapper = {
  serializedName: "Stateful",
  type: {
    name: "Composite",
    className: "StatefulServiceProperties",
    uberParent: "ServiceResourceProperties",
    polymorphicDiscriminator:
      ServiceResourceProperties.type.polymorphicDiscriminator,
    modelProperties: {
      ...ServiceResourceProperties.type.modelProperties,
      hasPersistedState: {
        serializedName: "hasPersistedState",
        type: {
          name: "Boolean"
        }
      },
      targetReplicaSetSize: {
        constraints: {
          InclusiveMinimum: 1
        },
        serializedName: "targetReplicaSetSize",
        type: {
          name: "Number"
        }
      },
      minReplicaSetSize: {
        constraints: {
          InclusiveMinimum: 1
        },
        serializedName: "minReplicaSetSize",
        type: {
          name: "Number"
        }
      },
      replicaRestartWaitDuration: {
        serializedName: "replicaRestartWaitDuration",
        type: {
          name: "DateTime"
        }
      },
      quorumLossWaitDuration: {
        serializedName: "quorumLossWaitDuration",
        type: {
          name: "DateTime"
        }
      },
      standByReplicaKeepDuration: {
        serializedName: "standByReplicaKeepDuration",
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const StatelessServiceProperties: coreClient.CompositeMapper = {
  serializedName: "Stateless",
  type: {
    name: "Composite",
    className: "StatelessServiceProperties",
    uberParent: "ServiceResourceProperties",
    polymorphicDiscriminator:
      ServiceResourceProperties.type.polymorphicDiscriminator,
    modelProperties: {
      ...ServiceResourceProperties.type.modelProperties,
      instanceCount: {
        constraints: {
          InclusiveMinimum: -1
        },
        serializedName: "instanceCount",
        type: {
          name: "Number"
        }
      },
      instanceCloseDelayDuration: {
        serializedName: "instanceCloseDelayDuration",
        type: {
          name: "String"
        }
      }
    }
  }
};

export const StatefulServiceUpdateProperties: coreClient.CompositeMapper = {
  serializedName: "Stateful",
  type: {
    name: "Composite",
    className: "StatefulServiceUpdateProperties",
    uberParent: "ServiceResourceUpdateProperties",
    polymorphicDiscriminator:
      ServiceResourceUpdateProperties.type.polymorphicDiscriminator,
    modelProperties: {
      ...ServiceResourceUpdateProperties.type.modelProperties,
      targetReplicaSetSize: {
        constraints: {
          InclusiveMinimum: 1
        },
        serializedName: "targetReplicaSetSize",
        type: {
          name: "Number"
        }
      },
      minReplicaSetSize: {
        constraints: {
          InclusiveMinimum: 1
        },
        serializedName: "minReplicaSetSize",
        type: {
          name: "Number"
        }
      },
      replicaRestartWaitDuration: {
        serializedName: "replicaRestartWaitDuration",
        type: {
          name: "DateTime"
        }
      },
      quorumLossWaitDuration: {
        serializedName: "quorumLossWaitDuration",
        type: {
          name: "DateTime"
        }
      },
      standByReplicaKeepDuration: {
        serializedName: "standByReplicaKeepDuration",
        type: {
          name: "DateTime"
        }
      }
    }
  }
};

export const StatelessServiceUpdateProperties: coreClient.CompositeMapper = {
  serializedName: "Stateless",
  type: {
    name: "Composite",
    className: "StatelessServiceUpdateProperties",
    uberParent: "ServiceResourceUpdateProperties",
    polymorphicDiscriminator:
      ServiceResourceUpdateProperties.type.polymorphicDiscriminator,
    modelProperties: {
      ...ServiceResourceUpdateProperties.type.modelProperties,
      instanceCount: {
        constraints: {
          InclusiveMinimum: -1
        },
        serializedName: "instanceCount",
        type: {
          name: "Number"
        }
      },
      instanceCloseDelayDuration: {
        serializedName: "instanceCloseDelayDuration",
        type: {
          name: "String"
        }
      }
    }
  }
};

export let discriminators = {
  PartitionSchemeDescription: PartitionSchemeDescription,
  "ServicePlacementPolicyDescription.ServicePlacementPolicyDescription": ServicePlacementPolicyDescription,
  "PartitionSchemeDescription.Named": NamedPartitionSchemeDescription,
  "PartitionSchemeDescription.Singleton": SingletonPartitionSchemeDescription,
  "PartitionSchemeDescription.UniformInt64Range": UniformInt64RangePartitionSchemeDescription,
  "ServiceResourcePropertiesBase.ServiceResourceProperties": ServiceResourceProperties,
  "ServiceResourcePropertiesBase.ServiceResourceUpdateProperties": ServiceResourceUpdateProperties,
  "ServiceResourceProperties.Stateful": StatefulServiceProperties,
  "ServiceResourceProperties.Stateless": StatelessServiceProperties,
  "ServiceResourceUpdateProperties.Stateful": StatefulServiceUpdateProperties,
  "ServiceResourceUpdateProperties.Stateless": StatelessServiceUpdateProperties
};
