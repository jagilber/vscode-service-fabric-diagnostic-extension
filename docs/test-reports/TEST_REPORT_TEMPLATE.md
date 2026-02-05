# Test Execution Report Template

**Cluster:** `https://mycluster.eastus.cloudapp.azure.com:19080`  
**Certificate:** `1234567890ABCDEF1234567890ABCDEF12345678`  
**Date:** YYYY-MM-DD HH:MM:SS  
**Duration:** X.XX seconds

---

## Connection Test

✅ **Status:** Connected  
✅ **Certificate:** Validated  
✅ **Health:** OK

### Certificate Details

```
Subject: CN=mycluster.eastus.cloudapp.azure.com
Issuer: CN=ClusterCA
Thumbprint: 1234567890ABCDEF1234567890ABCDEF12345678
Valid From: YYYY-MM-DD
Valid To: YYYY-MM-DD
```

---

## API Tests

| Endpoint | Status | Duration |
|----------|--------|----------|
| GET $/GetClusterHealth | ✅ 200 OK | 250ms |
| GET $/GetNodes | ✅ 200 OK | 180ms |
| GET $/GetApplications | ✅ 200 OK | 320ms |

---

## Node Lifecycle Tests

### Test: Restart Node

```powershell
$node = '_Node_0'
Restart-ServiceFabricNode -NodeName $node
```

**Result:** ✅ Success  
**Duration:** 15.3 seconds

### Test: Disable Node

```powershell
Disable-ServiceFabricNode -NodeName '_Node_1' -Intent Restart
```

**Result:** ✅ Success  
**Duration:** 8.7 seconds

---

## Summary

- **Total Tests:** 15
- **Passed:** 15
- **Failed:** 0
- **Duration:** 125.4 seconds

✅ **All tests passed**
