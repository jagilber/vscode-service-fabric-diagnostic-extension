# Tree Expansion Design: Expandable System Services

## Current State
System services display as **leaf nodes** (not expandable):
- ClusterManagerService ✓
- FaultAnalysisService ✓  
- NamingService ✓
- DnsService ✓
- EventStoreService ✓

## Requested Feature
Services should be **expandable** to show:
```
Service (clickable + expandable)
  ├─ Partitions (clickable + expandable)
  │   ├─ Partition 00000000-0000-0000-0000-000000000001 
  │   │   ├─ Replicas (clickable)
  │   │   │   ├─ Replica 132429154475414363
  │   │   │   └─ Replica 132429154475414364
  │   │   ├─ Events (clickable)
  │   │   └─ Health (clickable)
  │   └─ Partition 00000000-0000-0000-0000-000000000002
  ├─ Description (clickable)
  ├─ Health (clickable)
  └─ Events (clickable)
```

## Technical Requirements

### 1. Refactor to TreeDataProvider Pattern
**Current:** Static TreeItem hierarchy built upfront
```typescript
// sfConfiguration.ts - current approach
const systemItems = services.map(service => 
    new TreeItem(service.name, undefined, ...)  // undefined = no children
);
```

**Required:** Dynamic TreeDataProvider with lazy loading
```typescript
// Implement vscode.TreeDataProvider<TreeNode>
class ServiceFabricTreeProvider implements vscode.TreeDataProvider<TreeNode> {
    getChildren(element?: TreeNode): TreeNode[] {
        if (!element) {
            // Return root nodes (clusters)
            return this.clusters;
        }
        
        if (element.type === 'service') {
            // Lazy load partitions when service expanded
            return this.getServicePartitions(element.serviceId);
        }
        
        if (element.type === 'partition') {
            // Lazy load replicas when partition expanded
            return this.getPartitionReplicas(element.partitionId);
        }
        
        return [];
    }
    
    getTreeItem(element: TreeNode): vscode.TreeItem {
        const item = new vscode.TreeItem(element.label);
        
        if (element.type === 'service' || element.type === 'partition') {
            item.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        }
        
        return item;
    }
}
```

### 2. Add Partition Query APIs
```typescript
// sfRest.ts - add partition querying
public async getServicePartitions(serviceId: string, applicationId: string): Promise<sfModels.PartitionInfoUnion[]> {
    // GET /Applications/{appId}/$/GetServices/{serviceId}/$/GetPartitions
    return await this.sfApi.getPartitionInfoList(applicationId, serviceId);
}

public async getPartitionReplicas(applicationId: string, serviceId: string, partitionId: string): Promise<sfModels.ReplicaInfo[]> {
    // GET /Applications/{appId}/$/GetServices/{serviceId}/$/GetPartitions/{partitionId}/$/GetReplicas
    return await this.sfApi.getReplicaInfoList(applicationId, serviceId, partitionId);
}
```

### 3. Update TreeNode Model
```typescript
interface TreeNode {
    type: 'cluster' | 'service' | 'partition' | 'replica' | 'health' | 'events';
    label: string;
    id: string;
    serviceId?: string;
    partitionId?: string;
    replicaId?: string;
    applicationId?: string;
    clusterEndpoint?: string;
}
```

### 4. Register TreeDataProvider
```typescript
// extension.ts
const treeProvider = new ServiceFabricTreeProvider(context);
const treeView = vscode.window.createTreeView('serviceFabricClusterView', {
    treeDataProvider: treeProvider
});

// Refresh tree when needed
treeProvider.refresh();
```

## API Endpoints Required

### Partitions
```
GET /Applications/System/$/GetServices/System~ClusterManagerService/$/GetPartitions?api-version=6.0
Response: { Items: [ { PartitionInformation: { Id: "00000000-0000-0000-0000-000000002000" }, ... } ] }
```

### Replicas
```
GET /Applications/System/$/GetServices/System~ClusterManagerService/$/GetPartitions/00000000-0000-0000-0000-000000002000/$/GetReplicas?api-version=6.0
Response: { Items: [ { ReplicaId: "132429154475414363", ReplicaRole: "Primary", ... } ] }
```

### Partition Events
```
GET /EventsStore/Partitions/00000000-0000-0000-0000-000000002000/$/Events?api-version=6.2&StartTimeUtc=...&EndTimeUtc=...
```

## Implementation Steps

1. **Phase 1: Core Refactor** (3-4 hours)
   - Create ServiceFabricTreeProvider class
   - Implement getChildren() and getTreeItem()
   - Register provider in extension.ts
   - Test basic tree rendering

2. **Phase 2: Partition Support** (2-3 hours)
   - Add getServicePartitions() to sfRest.ts
   - Handle partition nodes in getChildren()
   - Add partition click handling
   - Test partition expansion

3. **Phase 3: Replica Support** (2-3 hours)
   - Add getPartitionReplicas() to sfRest.ts  
   - Handle replica nodes in getChildren()
   - Add replica click handling
   - Test replica details

4. **Phase 4: Events/Health** (1-2 hours)
   - Add events/health sub-nodes
   - Test complete tree hierarchy

## Benefits
- ✅ **Lazy loading** - Only query partitions when service expanded
- ✅ **Performance** - Don't fetch all partition/replica data upfront
- ✅ **Standard pattern** - Matches VS Code TreeView best practices
- ✅ **Scalability** - Handles large clusters with many services/partitions
- ✅ **User control** - User decides what to explore

## Testing Checklist
- [ ] Click service → expands to show partitions
- [ ] Click partition → expands to show replicas
- [ ] Click replica → opens JSON details
- [ ] Click events → loads partition/service events
- [ ] System services expandable (ClusterManager, FaultAnalysis, etc.)
- [ ] User application services expandable
- [ ] Health state icons propagate up tree
- [ ] Refresh updates entire tree

## Reference Implementation
See Microsoft Service Fabric Explorer:
- [Tree Service](https://github.com/microsoft/service-fabric-explorer/blob/main/src/app/services/tree.service.ts#L375-L390)
- [Service Model with Partitions](https://github.com/microsoft/service-fabric-explorer/blob/main/src/app/Models/DataModels/Service.ts#L46-L106)
- [Partition Collection](https://github.com/microsoft/service-fabric-explorer/blob/main/src/app/Models/DataModels/collections/Collections.ts)

## Current Workaround
Users can:
1. Click on service → see service details JSON
2. Manually browse to partition IDs in JSON
3. Use Service Fabric Explorer for full partition/replica navigation

**Estimated Implementation Time:** 8-12 hours for complete feature
