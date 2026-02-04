# Security Configuration

## Environment Variables

Sensitive data is stored in `.env` file which is **NEVER committed to git**.

### Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your secure cluster details:
   ```bash
   SF_TEST_CLUSTER=https://your-cluster.cloudapp.azure.com:19080
   SF_TEST_THUMBPRINT=YOUR_CERTIFICATE_THUMBPRINT
   RUN_INTEGRATION_TESTS=true
   ```

3. Verify `.env` is in `.gitignore`:
   ```bash
   grep .env .gitignore
   ```

### Certificate Setup

For secure clusters, the certificate must be installed:

**Windows:**
```powershell
# Certificate should be in: Cert:\CurrentUser\My\
# Verify with:
Get-ChildItem Cert:\CurrentUser\My\ | Where-Object { $_.Thumbprint -eq 'YOUR_THUMBPRINT' }
```

**Linux/Mac:**
```bash
# Certificate should be in PEM format
# Path: ~/.servicefabric/cert.pem and ~/.servicefabric/key.pem
```

### Running Integration Tests

```bash
# Run full suite against secure cluster
npm run test:integration:full
```

### Security Best Practices

✅ **DO:**
- Store credentials in `.env` file
- Add `.env` to `.gitignore`
- Use `.env.example` as template (without real credentials)
- Rotate certificates regularly
- Use non-production clusters for testing

❌ **DON'T:**
- Commit `.env` file
- Share certificates in code
- Use production clusters for destructive tests
- Store private keys in code or config files
- Push credentials to public repositories

### PII Protection

The following are considered PII/sensitive:
- Certificate thumbprints
- Cluster endpoints (if containing customer names)
- IP addresses
- Connection strings
- Authentication tokens

All sensitive data must be:
1. Stored in `.env` (gitignored)
2. Loaded at runtime via dotenv
3. Never hardcoded in source files
4. Never logged to console/files

### .env File Structure

```bash
# Secure cluster for integration tests
SF_TEST_CLUSTER=https://[cluster-fqdn]:19080
SF_TEST_THUMBPRINT=[certificate-thumbprint]

# Local cluster for quick tests
SF_LOCAL_CLUSTER=http://localhost:19080

# Control flags
RUN_INTEGRATION_TESTS=true  # Set to false to skip
```

### Verification

Before committing, verify no secrets leaked:
```bash
# Search for potential leaks
git grep -i "thumbprint"
git grep -i "cloudapp.azure.com"
git grep -i "\.cer"
```

All matches should only be in:
- `.env` (gitignored)
- `.env.example` (template only)
- `SECURITY.md` (documentation)

If secrets are found in committed files:
1. Immediately remove from git history
2. Rotate certificates/credentials
3. Update `.gitignore`
