# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in this extension, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please use one of the following methods:

1. **GitHub Security Advisories** (preferred): Use the [Report a vulnerability](https://github.com/jagilber/vscode-service-fabric-diagnostic-extension/security/advisories/new) page.
2. **Email**: Contact the maintainer directly via GitHub profile.

### What to include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Acknowledgement**: Within 48 hours
- **Initial assessment**: Within 1 week
- **Fix/mitigation**: Depends on severity; critical issues are prioritized

### Sensitive Data Handling

This extension handles cluster connection information including:
- **Stored in VS Code settings** (plaintext, user-local): Cluster endpoints, certificate thumbprints
- **Stored in VS Code SecretStorage** (encrypted, OS credential store): Certificate PEM data, private keys, passwords

See [SECURITY.md](../SECURITY.md) in the repo root for environment variable configuration guidance.
