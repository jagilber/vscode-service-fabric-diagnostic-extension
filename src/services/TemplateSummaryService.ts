/**
 * TemplateSummaryService — parses an ARM template JSON and generates a
 * markdown document with:
 *   • Overview (schema, content version, resource count)
 *   • Mermaid architecture diagram showing resource relationships
 *   • Parameter table
 *   • Resource table with dependencies
 *   • Variables list
 *   • Outputs table
 */

import * as vscode from 'vscode';
import { TemplateService, TemplateRepo, GitHubEntry } from './TemplateService';
import { SfUtility, debugLevel } from '../sfUtility';
import { hasJsonComments, stripJsonComments } from '../utils/JsonCommentStripper';
import { openMarkdownPreview } from './reports/ReportUtils';

/** Parsed ARM template shape (subset we care about). */
interface ArmTemplate {
    $schema?: string;
    contentVersion?: string;
    parameters?: Record<string, ArmParameter>;
    variables?: Record<string, unknown>;
    resources?: ArmResource[];
    outputs?: Record<string, ArmOutput>;
}

interface ArmParameter {
    type: string;
    defaultValue?: unknown;
    allowedValues?: unknown[];
    metadata?: { description?: string };
    minValue?: number;
    maxValue?: number;
    minLength?: number;
    maxLength?: number;
}

interface ArmResource {
    type: string;
    apiVersion?: string;
    name: string;
    location?: string;
    dependsOn?: string[];
    properties?: Record<string, unknown>;
    resources?: ArmResource[];   // nested / child resources
}

interface ArmOutput {
    type: string;
    value: unknown;
}

export class TemplateSummaryService {
    private static _instance: TemplateSummaryService | undefined;

    static getInstance(): TemplateSummaryService {
        if (!TemplateSummaryService._instance) {
            TemplateSummaryService._instance = new TemplateSummaryService();
        }
        return TemplateSummaryService._instance;
    }

    /**
     * Generate and display a markdown summary for a template folder.
     */
    async showSummary(repo: TemplateRepo, folderEntry: GitHubEntry): Promise<void> {
        const service = TemplateService.getInstance();

        // Find the main template file
        const entries = await vscode.window.withProgress(
            { location: vscode.ProgressLocation.Notification, title: `Loading template from ${folderEntry.name}...` },
            () => service.listTemplateFiles(repo, folderEntry.path),
        );

        const jsonFiles = entries.filter(e => e.type === 'file' && e.name.toLowerCase().endsWith('.json'));
        const templateFile = this._findTemplateFile(jsonFiles);

        if (!templateFile) {
            vscode.window.showWarningMessage(`No ARM template file found in ${folderEntry.name}.`);
            return;
        }

        // Download and parse
        let content: string;
        try {
            content = await vscode.window.withProgress(
                { location: vscode.ProgressLocation.Notification, title: `Downloading ${templateFile.name}...` },
                () => service.getFileContent(repo, templateFile.path),
            );
        } catch (err) {
            vscode.window.showErrorMessage(`Failed to download ${templateFile.name}: ${err instanceof Error ? err.message : err}`);
            return;
        }

        // Strip JSONC comments if present
        if (hasJsonComments(content)) {
            content = stripJsonComments(content);
        }

        let template: ArmTemplate;
        try {
            template = JSON.parse(content);
        } catch (err) {
            vscode.window.showErrorMessage(`Failed to parse ${templateFile.name}: ${err}`);
            return;
        }

        // Validate this is actually an ARM template
        if (!template.$schema || !template.$schema.toLowerCase().includes('deploymenttemplate')) {
            vscode.window.showWarningMessage(
                `${templateFile.name} does not appear to be an ARM deployment template (missing or unrecognized $schema).`,
            );
            return;
        }

        // Also look for parameter files to mention
        const paramFiles = jsonFiles
            .filter(f => this._isParameterFile(f.name))
            .map(f => f.name);

        // Generate markdown
        const markdown = this._generateMarkdown(template, folderEntry.name, repo, templateFile.name, paramFiles);

        // Open in markdown preview
        await openMarkdownPreview(markdown);

        SfUtility.outputLog(
            `TemplateSummaryService: generated summary for ${folderEntry.name}`,
            null,
            debugLevel.info,
        );
    }

    // ── Markdown generation ────────────────────────────────────────────

    private _generateMarkdown(
        template: ArmTemplate,
        folderName: string,
        repo: TemplateRepo,
        templateFileName: string,
        paramFiles: string[],
    ): string {
        const lines: string[] = [];
        const resources = this._flattenResources(template.resources || []);
        const params = template.parameters || {};
        const variables = template.variables || {};
        const outputs = template.outputs || {};

        // ── Title
        lines.push(`# ${folderName}`);
        lines.push('');
        lines.push(`ARM Template summary generated from \`${templateFileName}\` in **${repo.name}** (${repo.branch || 'default'}).`);
        lines.push('');

        // ── Overview
        lines.push('## Overview');
        lines.push('');
        lines.push(`| | |`);
        lines.push(`|---|---|`);
        lines.push(`| **Template** | \`${templateFileName}\` |`);
        if (template.contentVersion) {
            lines.push(`| **Content Version** | ${template.contentVersion} |`);
        }
        lines.push(`| **Resources** | ${resources.length} |`);
        lines.push(`| **Parameters** | ${Object.keys(params).length} |`);
        lines.push(`| **Variables** | ${Object.keys(variables).length} |`);
        lines.push(`| **Outputs** | ${Object.keys(outputs).length} |`);
        if (paramFiles.length > 0) {
            lines.push(`| **Parameter Files** | ${paramFiles.map(f => `\`${f}\``).join(', ')} |`);
        }
        lines.push('');

        // ── Architecture Diagram
        lines.push('## Architecture');
        lines.push('');
        lines.push(this._generateMermaidDiagram(resources));
        lines.push('');

        // ── Resources table
        lines.push('## Resources');
        lines.push('');
        lines.push('| # | Type | Name | API Version | Dependencies |');
        lines.push('|---|------|------|-------------|--------------|');
        resources.forEach((r, i) => {
            const shortType = this._shortType(r.type);
            const name = this._cleanArmExpression(r.name);
            const deps = (r.dependsOn || []).map(d => this._cleanArmExpression(d));
            const depsStr = deps.length > 0 ? deps.join(', ') : '—';
            lines.push(`| ${i + 1} | \`${shortType}\` | ${name} | ${r.apiVersion || '—'} | ${depsStr} |`);
        });
        lines.push('');

        // ── Parameters table
        if (Object.keys(params).length > 0) {
            lines.push('## Parameters');
            lines.push('');
            lines.push('| Name | Type | Default | Description |');
            lines.push('|------|------|---------|-------------|');
            for (const [name, param] of Object.entries(params)) {
                const def = param.defaultValue !== undefined ? `\`${this._truncate(String(param.defaultValue), 40)}\`` : '—';
                const desc = param.metadata?.description || '—';
                const typeStr = param.allowedValues
                    ? `${param.type} (${param.allowedValues.length} allowed)`
                    : param.type;
                lines.push(`| ${name} | ${typeStr} | ${def} | ${this._truncate(desc, 60)} |`);
            }
            lines.push('');
        }

        // ── Variables
        if (Object.keys(variables).length > 0) {
            lines.push('## Variables');
            lines.push('');
            for (const [name, value] of Object.entries(variables)) {
                const preview = typeof value === 'string'
                    ? `\`${this._truncate(value, 80)}\``
                    : `\`${this._truncate(JSON.stringify(value), 80)}\``;
                lines.push(`- **${name}** — ${preview}`);
            }
            lines.push('');
        }

        // ── Outputs
        if (Object.keys(outputs).length > 0) {
            lines.push('## Outputs');
            lines.push('');
            lines.push('| Name | Type | Value |');
            lines.push('|------|------|-------|');
            for (const [name, output] of Object.entries(outputs)) {
                const val = typeof output.value === 'string'
                    ? this._truncate(output.value, 60)
                    : this._truncate(JSON.stringify(output.value), 60);
                lines.push(`| ${name} | ${output.type} | \`${val}\` |`);
            }
            lines.push('');
        }

        return lines.join('\n');
    }

    // ── Mermaid diagram ────────────────────────────────────────────────

    private _generateMermaidDiagram(resources: ArmResource[]): string {
        const lines: string[] = [];
        lines.push('```mermaid');
        lines.push('---');
        lines.push('config:');
        lines.push('  layout: elk');
        lines.push('---');
        lines.push('graph TB');
        lines.push('');

        // Group resources by provider for subgraph boxes
        const groups = new Map<string, { resource: ArmResource; nodeId: string }[]>();
        const nodeIds = new Map<string, string>(); // resource type+name → nodeId

        resources.forEach((r, i) => {
            const nodeId = `R${i}`;
            const provider = this._getProvider(r.type);
            const shortType = this._shortResourceName(r.type);
            const name = this._cleanArmExpression(r.name);

            nodeIds.set(this._resourceKey(r), nodeId);

            if (!groups.has(provider)) {
                groups.set(provider, []);
            }
            groups.get(provider)!.push({ resource: r, nodeId });

            // Node definition with icon
            const icon = this._getResourceIcon(r.type);
            lines.push(`    ${nodeId}["${icon} ${shortType}<br/>${this._escapeMermaid(name)}"]`);
        });

        lines.push('');

        // Subgraphs by provider
        for (const [provider, items] of groups) {
            if (items.length > 1) {
                const safeProvider = provider.replace(/[^a-zA-Z0-9]/g, '_');
                lines.push(`    subgraph ${safeProvider}["${provider}"]`);
                for (const item of items) {
                    lines.push(`        ${item.nodeId}`);
                }
                lines.push('    end');
                lines.push('');
            }
        }

        // Dependency edges
        for (const r of resources) {
            if (!r.dependsOn || r.dependsOn.length === 0) { continue; }
            const fromId = nodeIds.get(this._resourceKey(r));
            if (!fromId) { continue; }

            for (const dep of r.dependsOn) {
                const toId = this._findDependencyNodeId(dep, resources, nodeIds);
                if (toId && toId !== fromId) {
                    lines.push(`    ${fromId} --> ${toId}`);
                }
            }
        }

        lines.push('');

        // Style
        lines.push('    classDef compute fill:#4a90d9,stroke:#2c5282,color:#fff');
        lines.push('    classDef network fill:#48bb78,stroke:#276749,color:#fff');
        lines.push('    classDef storage fill:#ed8936,stroke:#c05621,color:#fff');
        lines.push('    classDef fabric fill:#9f7aea,stroke:#6b46c1,color:#fff');
        lines.push('    classDef other fill:#a0aec0,stroke:#4a5568,color:#fff');

        // Apply styles
        for (const [, items] of groups) {
            for (const item of items) {
                const cls = this._getResourceClass(item.resource.type);
                lines.push(`    class ${item.nodeId} ${cls}`);
            }
        }

        lines.push('```');
        return lines.join('\n');
    }

    // ── Helpers ────────────────────────────────────────────────────────

    /** Flatten nested resources into a single list. */
    private _flattenResources(resources: ArmResource[], parentType?: string): ArmResource[] {
        const result: ArmResource[] = [];
        for (const r of resources) {
            const fullType = parentType ? `${parentType}/${r.type}` : r.type;
            result.push({ ...r, type: fullType });
            if (r.resources && r.resources.length > 0) {
                result.push(...this._flattenResources(r.resources, fullType));
            }
        }
        return result;
    }

    /** Create a stable key for a resource. */
    private _resourceKey(r: ArmResource): string {
        return `${r.type}::${r.name}`;
    }

    /** Find the node ID for a dependsOn reference. */
    private _findDependencyNodeId(
        dep: string,
        resources: ArmResource[],
        nodeIds: Map<string, string>,
    ): string | undefined {
        // dependsOn can be a resourceId() expression or a short type/name
        const cleanDep = this._cleanArmExpression(dep).toLowerCase();

        for (const r of resources) {
            const key = this._resourceKey(r);
            const shortType = this._shortType(r.type).toLowerCase();
            const name = this._cleanArmExpression(r.name).toLowerCase();

            if (cleanDep.includes(shortType) || cleanDep.includes(name)) {
                return nodeIds.get(key);
            }
        }
        return undefined;
    }

    /** Extract provider namespace (e.g., "Microsoft.Network"). */
    private _getProvider(type: string): string {
        const parts = type.split('/');
        return parts.length >= 2 ? parts[0] : 'Other';
    }

    /** Short resource type (e.g., "loadBalancers"). */
    private _shortResourceName(type: string): string {
        const parts = type.split('/');
        return parts[parts.length - 1];
    }

    /** Type without namespace (e.g., "Network/loadBalancers"). */
    private _shortType(type: string): string {
        const parts = type.split('.');
        return parts.length >= 2 ? parts.slice(1).join('.') : type;
    }

    /** Remove ARM expression wrappers like [parameters('x')]. */
    private _cleanArmExpression(expr: string): string {
        if (!expr) { return ''; }
        let s = expr;
        // Remove outer brackets
        if (s.startsWith('[') && s.endsWith(']')) {
            s = s.slice(1, -1);
        }
        // Simplify common patterns
        s = s.replace(/parameters\('([^']+)'\)/g, '$1');
        s = s.replace(/variables\('([^']+)'\)/g, '$1');
        s = s.replace(/concat\(/g, '');
        s = s.replace(/\)/g, '');
        s = s.replace(/'/g, '');
        s = s.replace(/,\s*/g, '-');
        return s.trim();
    }

    /** Escape special mermaid chars. */
    private _escapeMermaid(text: string): string {
        return text.replace(/"/g, "'").replace(/[<>{}]/g, '');
    }

    /** Truncate text to maxLen with ellipsis. */
    private _truncate(text: string, maxLen: number): string {
        if (text.length <= maxLen) { return text; }
        return text.slice(0, maxLen - 1) + '…';
    }

    /** Get an emoji icon for the resource type. */
    private _getResourceIcon(type: string): string {
        const lower = type.toLowerCase();
        if (lower.includes('virtualmachinescaleset')) { return '🖥️'; }
        if (lower.includes('virtualmachine')) { return '🖥️'; }
        if (lower.includes('loadbalancer')) { return '⚖️'; }
        if (lower.includes('publicipaddress')) { return '🌐'; }
        if (lower.includes('virtualnetwork')) { return '🔗'; }
        if (lower.includes('networksecuritygroup')) { return '🛡️'; }
        if (lower.includes('networkinterface')) { return '🔌'; }
        if (lower.includes('storageaccount')) { return '💾'; }
        if (lower.includes('keyvault')) { return '🔑'; }
        if (lower.includes('servicefabric')) { return '🧵'; }
        if (lower.includes('cluster')) { return '🧵'; }
        if (lower.includes('dnszone')) { return '📡'; }
        if (lower.includes('sqlserver') || lower.includes('sqldatabase')) { return '🗃️'; }
        if (lower.includes('appservice') || lower.includes('webapp')) { return '🌍'; }
        return '📦';
    }

    /** CSS class for resource styling in mermaid. */
    private _getResourceClass(type: string): string {
        const lower = type.toLowerCase();
        if (lower.includes('compute') || lower.includes('virtualmachine')) { return 'compute'; }
        if (lower.includes('network') || lower.includes('loadbalancer') || lower.includes('publicip')) { return 'network'; }
        if (lower.includes('storage')) { return 'storage'; }
        if (lower.includes('servicefabric')) { return 'fabric'; }
        return 'other';
    }

    /** Known non-template JSON files to skip in the fallback. */
    private static readonly _nonTemplateFiles = new Set([
        'metadata.json', 'createuidefinition.json', 'package.json',
        'tsconfig.json', 'tslint.json', '.eslintrc.json', 'appsettings.json',
    ]);

    /** Find the main ARM template file. */
    private _findTemplateFile(jsonFiles: GitHubEntry[]): GitHubEntry | undefined {
        const lower = (e: GitHubEntry) => e.name.toLowerCase();
        const priority = ['azuredeploy.json', 'template.json', 'maintemplate.json', 'deploy.json', 'main.json'];
        for (const name of priority) {
            const found = jsonFiles.find(f => lower(f) === name);
            if (found) { return found; }
        }
        // Fallback: first JSON file that isn't a parameter file or known non-template
        return jsonFiles.find(f =>
            !this._isParameterFile(f.name) &&
            !TemplateSummaryService._nonTemplateFiles.has(f.name.toLowerCase()),
        );
    }

    /** Check if a file name looks like a parameter file. */
    private _isParameterFile(name: string): boolean {
        const lower = name.toLowerCase();
        return /\.parameters?\.json$/i.test(lower) || /\.params\.json$/i.test(lower);
    }
}
