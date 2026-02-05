# P0 Instructions for Service Fabric VSCode Extension

This directory contains **Priority 0 (P0) instructions** for AI agents working with this repository.

## What are P0 Instructions?

P0 instructions are **local, workspace-specific guidance** that:
- Remain in this repository (not shared to MCP Index Server)
- Provide context about this specific codebase
- Help agents understand architecture, patterns, and conventions  
- Are automatically discovered by MCP-aware AI agents

## Files in this Directory

### `sf-vscode-extension-architecture.json`
Core architecture overview including:
- Module responsibilities (sfMgr, sfConfiguration, sfRest, etc.)
- Azure SDK integration patterns
- Logging conventions
- Component hierarchy

### `sf-cluster-management-patterns.json`
Cluster connectivity and authentication patterns:
- Endpoint management
- Certificate authentication
- Local development cluster setup
- Configuration class usage
- Best practices for cluster operations

### `sf-api-response-patterns.json`
Service Fabric SDK API response patterns:
- Paged response handling (PagedNodeInfoList, etc.)
- Continuation token usage
- Health response patterns
- Error handling best practices
- Verified working API commands

### `sf-api-operations-catalog.json`
Complete Service Fabric API operations catalog:
- Non-destructive operations (read-only, safe)
- Destructive operations (state-modifying, dangerous)
- Risk level classifications (Low/Medium/High/Critical)
- Usage guidelines and safety notes
- 150+ API methods categorized

### `development-environment.json`
Development setup and workflow:
- Prerequisites and dependencies
- Build commands (compile, watch, lint)
- Project structure
- Debugging instructions
- Common issues and solutions

## For AI Agents

When working with this codebase:
1. Read these instructions to understand the architecture
2. Follow the patterns and conventions described
3. Use the recommended approaches for common tasks
4. Respect the logging conventions (SfUtility.outputLog)

## Updating Instructions

When making significant architectural changes:
1. Update the relevant instruction files
2. Keep instructions concise and actionable
3. Follow the JSON schema from MCP Index Server
4. Don't promote these to the global catalog (keep as P0)
