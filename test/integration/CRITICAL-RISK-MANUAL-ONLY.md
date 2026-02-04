# CRITICAL-RISK Operations - MANUAL ONLY

⚠️ **DANGER: These operations should NEVER be run in automated tests** ⚠️

These operations can cause:
- Permanent data loss
- Cluster availability issues  
- Service disruptions
- Irreversible state changes

## 🔴 NEVER AUTO-RUN (Requires Explicit Permission)

### Cluster-Level DANGEROUS Operations

#### `removeNodeState(nodeName)`
**Risk**: 🔴 CRITICAL - PERMANENT DATA LOSS
- Permanently removes node from cluster metadata
- Cannot be undone
- Can cause data loss if node has local state
- Only use when node is permanently decommissioned

**Manual Test Only:**
```typescript
// ❌ NEVER in automated tests
// ✅ Only with explicit user confirmation
await sfApi.removeNodeState(nodeName);
```

---

#### `startClusterUpgrade(upgradeDescription)`
**Risk**: 🔴 CRITICAL - SERVICE DISRUPTION
- Upgrades entire cluster to new version
- Can cause cluster-wide downtime
- Requires careful planning and rollback strategy
- Can fail and leave cluster in unstable state
- Takes hours to complete

**Manual Test Only:**
```typescript
// ❌ NEVER in automated tests  
// ✅ Only during planned maintenance window
await sfApi.startClusterUpgrade({
    codeVersion: '9.0.0.0',
    configVersion: '1.0',
    monitoringPolicy: { ... }
});
```

---

#### `unprovisionFabricCluster(codeVersion, configVersion)`
**Risk**: 🔴 CRITICAL - CLUSTER FAILURE
- Removes Service Fabric runtime from cluster
- Can break cluster if active version is removed
- Only safe after successful upgrade to new version

---

#### `rollbackClusterUpgrade()`
**Risk**: 🟠 HIGH - SERVICE DISRUPTION
- Rolls back active cluster upgrade
- Can cause additional downtime
- Only use if upgrade is failing

---

### Fault Injection Operations (TEST CLUSTERS ONLY)

#### `startDataLoss(serviceId, partitionId, operationId, mode)`
**Risk**: 🔴 CRITICAL - INTENTIONAL DATA LOSS
- **Deliberately causes data loss**
- Removes replica data to test recovery
- Can make services unavailable
- Only for testing disaster recovery

**Manual Test Only:**
```typescript
// ❌ NEVER on production or test cluster with real data
// ✅ Only on disposable test cluster
await sfApi.startDataLoss(serviceId, partitionId, operationId, 'FullDataLoss');
```

---

#### `startQuorumLoss(serviceId, partitionId, operationId, duration)`
**Risk**: 🔴 CRITICAL - SERVICE UNAVAILABILITY
- **Deliberately causes quorum loss**
- Makes partition unavailable
- Service cannot process requests
- Only for testing failover

---

#### `startPartitionRestart(serviceId, partitionId, operationId)`
**Risk**: 🟠 HIGH - SERVICE DISRUPTION
- Restarts all replicas in partition
- Causes temporary unavailability
- Tests partition recovery logic

---

#### `startNodeTransition(nodeName, operationId, type)`
**Risk**: 🟠 HIGH - NODE UNAVAILABILITY
- Stops or starts a node
- Can affect services running on node
- Tests node failure scenarios

**Types:**
- `Stop` - Forcefully stops node process
- `Start` - Starts stopped node
- `Restart` - Stops then starts node

---

### Chaos Testing Operations (TEST CLUSTERS ONLY)

#### `startChaos(chaosParameters)`
**Risk**: 🔴 CRITICAL - INTENTIONAL INSTABILITY
- **Deliberately injects random faults**
- Causes random node failures, restarts, data loss
- Can last for hours
- Makes cluster unstable by design
- Only for chaos engineering on test clusters

**Manual Test Only:**
```typescript
// ❌ NEVER on any cluster with real workloads
// ✅ Only on dedicated chaos test cluster
await sfApi.startChaos({
    timeToRunInSeconds: 3600,
    maxClusterStabilizationTimeoutInSeconds: 180,
    maxConcurrentFaults: 3,
    enableMoveReplicaFaults: true
});
```

**Stop Chaos:**
```typescript
// Emergency stop if chaos gets out of control
await sfApi.stopChaos();
```

---

### Destructive Node Operations

#### `restartNode(nodeName, instanceId)`
**Risk**: 🟠 HIGH - NODE RESTART
- Restarts node process
- Causes downtime for services on node
- Can be used for testing but use with caution

**Use deactivateNode() with Pause intent instead for safe testing**

---

### Replica/Partition Operations

#### `removeReplica(nodeName, partitionId, replicaId)`
**Risk**: 🟠 HIGH - REPLICA DELETION
- Permanently removes replica
- Can cause data loss if replica has unique data
- Service Fabric usually rebuilds automatically
- Only use if replica is stuck/corrupt

---

#### `restartReplica(nodeName, partitionId, replicaId)`
**Risk**: 🟡 MEDIUM - REPLICA RESTART
- Restarts single replica
- Temporary unavailability for that replica
- Less risky than removing

---

#### `recoverAllPartitions()`
**Risk**: 🔴 CRITICAL - CLUSTER-WIDE OPERATION
- Triggers recovery for ALL partitions
- Can cause cluster-wide performance issues
- Only use if instructed by Microsoft support

---

### Backup/Restore Operations

#### `restorePartition(partitionId, restoreDescription)`
**Risk**: 🔴 CRITICAL - DATA REPLACEMENT
- **Replaces current partition data with backup**
- Can cause data loss if wrong backup used
- Cannot be undone
- Service becomes unavailable during restore
- Only for disaster recovery

**Manual Test Only:**
```typescript
// ❌ NEVER in automated tests
// ✅ Only for actual disaster recovery
await sfApi.restorePartition(partitionId, {
    backupLocation: {
        storageKind: 'FileShare',
        path: '\\\\backup-server\\backups\\...'
    },
    backupId: 'guid-of-backup'
});
```

---

## Safe Alternatives for Testing

Instead of dangerous operations, use these safe alternatives:

### ✅ Instead of `removeNodeState()`:
- Use `deactivateNode()` with `Pause` intent
- Node stays in cluster, can be reactivated

### ✅ Instead of `startClusterUpgrade()`:
- Query `getClusterUpgradeProgress()`
- Test upgrade monitoring logic without upgrading

### ✅ Instead of fault injection:
- Use health reporting to simulate issues
- `deactivateNode()` with `Pause` to simulate node unavailability
- Test monitoring and alerting logic

### ✅ Instead of `restartNode()`:
- Use `deactivateNode()` with `Pause` intent
- Then `activateNode()` - no actual restart needed

### ✅ Instead of `removeReplica()`:
- Query replica health and status
- Test replica failure detection logic

---

## Manual Execution Checklist

If you MUST run these operations manually:

1. ✅ Verify you're on correct cluster
2. ✅ Have tested on dev cluster first
3. ✅ Have backup of all data
4. ✅ Have rollback plan documented
5. ✅ Notify team of planned operation
6. ✅ Schedule during maintenance window
7. ✅ Monitor cluster health continuously
8. ✅ Have Microsoft support contact ready
9. ✅ Document all steps taken
10. ✅ Verify success before declaring complete

---

## Emergency Recovery

If dangerous operation causes issues:

1. **Check cluster health**: `getClusterHealth()`
2. **Check node status**: `getNodeInfoList()`
3. **Check application health**: `getApplicationHealth()`
4. **Stop chaos if running**: `stopChaos()`
5. **Contact Microsoft support** with:
   - Cluster ID
   - Operation performed
   - Error messages
   - Current cluster state

---

## Environment Variable Protection

To prevent accidental execution:

```bash
# .env file
RUN_INTEGRATION_TESTS=true
RUN_HIGH_RISK_TESTS=false      # Must be explicitly true
RUN_CRITICAL_RISK_TESTS=false  # Should ALWAYS be false
```

Tests should check:
```typescript
const RUN_CRITICAL = process.env.RUN_CRITICAL_RISK_TESTS === 'true';
if (!RUN_CRITICAL) {
    test.skip('Critical-risk operations disabled');
    return;
}
```

---

## Summary

| Operation | Risk | Auto-Test | Manual Only |
|-----------|------|-----------|-------------|
| `removeNodeState()` | 🔴 CRITICAL | ❌ | ✅ |
| `startClusterUpgrade()` | 🔴 CRITICAL | ❌ | ✅ |
| `startDataLoss()` | 🔴 CRITICAL | ❌ | ✅ |
| `startQuorumLoss()` | 🔴 CRITICAL | ❌ | ✅ |
| `startChaos()` | 🔴 CRITICAL | ❌ | ✅ |
| `restorePartition()` | 🔴 CRITICAL | ❌ | ✅ |
| `recoverAllPartitions()` | 🔴 CRITICAL | ❌ | ✅ |
| `unprovisionFabricCluster()` | 🔴 CRITICAL | ❌ | ✅ |
| `removeReplica()` | 🟠 HIGH | ❌ | ✅ |
| `restartNode()` | 🟠 HIGH | ❌ | ✅ (use deactivate instead) |

**When in doubt, DON'T RUN IT.**

Contact Microsoft Service Fabric support if you need to perform these operations.
