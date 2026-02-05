# Integration Tests

Integration tests that require a real Service Fabric cluster.

## Prerequisites

1. **Local Development Cluster**: Install Service Fabric SDK and start local cluster
   ```powershell
   & "$ENV:ProgramFiles\Microsoft SDKs\Service Fabric\ClusterSetup\DevClusterSetup.ps1"
   ```

2. **Environment Variables**: Set cluster endpoint
   ```bash
   export SF_TEST_CLUSTER=http://localhost:19080
   export SF_TEST_SECURE_CLUSTER=https://your-cluster.westus.cloudapp.azure.com:19080
   export SF_TEST_THUMBPRINT=your-certificate-thumbprint
   ```

## Running Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Run with real cluster
SF_TEST_CLUSTER=http://localhost:19080 npm run test:integration

# Run specific integration test
npm run test:integration -- --testNamePattern="should connect to cluster"
```

## Test Structure

- `cluster.integration.test.ts` - Cluster connection and health tests
- `nodes.integration.test.ts` - Node operations (activate, deactivate, restart)
- `applications.integration.test.ts` - Application deployment and management
- `services.integration.test.ts` - Service operations

## Important Notes

⚠️ **WARNING**: Integration tests may modify your cluster state. Use a development cluster only!

- Node restart tests will temporarily take nodes offline
- Application tests may deploy/remove test applications
- Service tests may create/delete services

## Skipping Integration Tests

Integration tests are automatically skipped if:
- No SF_TEST_CLUSTER environment variable is set
- Cluster is not reachable
- Running in CI without cluster access

Use `test.skip()` or `test.only()` to control which tests run.
