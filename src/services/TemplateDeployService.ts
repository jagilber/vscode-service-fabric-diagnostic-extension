/**
 * TemplateDeployService — downloads ARM template + parameter files from GitHub,
 * opens them for review/edit, and deploys via PowerShell when the user closes them.
 *
 * Deployment uses New-AzResourceGroupDeployment (Az module).
 * Inspired by azure-az-deploy-template.ps1 from jagilber/powershellScripts.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import * as cp from 'child_process';
import { TemplateService, TemplateRepo, GitHubEntry } from './TemplateService';
import { SfUtility, debugLevel } from '../sfUtility';
import { hasJsonComments, stripJsonComments } from '../utils/JsonCommentStripper';

export class TemplateDeployService {
    private static _instance: TemplateDeployService | undefined;

    static getInstance(): TemplateDeployService {
        if (!TemplateDeployService._instance) {
            TemplateDeployService._instance = new TemplateDeployService();
        }
        return TemplateDeployService._instance;
    }

    /**
     * Main entry point.  Finds template + parameter files in a template folder,
     * downloads them to a temp directory, opens them in the editor, and when
     * ALL opened files are closed prompts the user to deploy.
     */
    async deployFromFolder(repo: TemplateRepo, folderEntry: GitHubEntry): Promise<void> {
        const service = TemplateService.getInstance();

        // 1. List files in the template folder
        const entries = await vscode.window.withProgress(
            { location: vscode.ProgressLocation.Notification, title: `Loading template files from ${folderEntry.name}...` },
            () => service.listTemplateFiles(repo, folderEntry.path),
        );

        const jsonFiles = entries.filter(e => e.type === 'file' && e.name.toLowerCase().endsWith('.json'));
        if (jsonFiles.length === 0) {
            vscode.window.showWarningMessage(`No JSON files found in ${folderEntry.name}`);
            return;
        }

        // 2. Identify template file and parameter file(s)
        const templateFile = this._findTemplateFile(jsonFiles);
        const parameterFiles = this._findParameterFiles(jsonFiles);

        if (!templateFile) {
            vscode.window.showWarningMessage(`No ARM template file found in ${folderEntry.name}. Expected a file like template.json, azuredeploy.json, or mainTemplate.json.`);
            return;
        }

        // 3. Download all relevant files to a temp folder
        const tempDir = this._createTempDir(folderEntry.name);
        const filesToOpen: { entry: GitHubEntry; localPath: string }[] = [];

        await vscode.window.withProgress(
            { location: vscode.ProgressLocation.Notification, title: 'Downloading template files...' },
            async (progress) => {
                // Download template file
                const allFiles = [templateFile, ...parameterFiles];
                for (let i = 0; i < allFiles.length; i++) {
                    const entry = allFiles[i];
                    progress.report({ message: entry.name, increment: (100 / allFiles.length) });
                    const content = await service.getFileContent(repo, entry.path);
                    const localPath = path.join(tempDir, entry.name);
                    fs.writeFileSync(localPath, content, 'utf-8');
                    filesToOpen.push({ entry, localPath });
                }
            },
        );

        // 4. Open parameter file(s) first, then the template file
        const openedDocs: vscode.TextDocument[] = [];

        // Open parameter files first (side by side if multiple)
        for (const pf of filesToOpen.filter(f => f.entry !== templateFile)) {
            const doc = await vscode.workspace.openTextDocument(pf.localPath);
            await vscode.window.showTextDocument(doc, { preview: false });
            openedDocs.push(doc);
        }

        // Open the template file last so it's in focus
        const templateLocal = filesToOpen.find(f => f.entry === templateFile)!;
        const templateDoc = await vscode.workspace.openTextDocument(templateLocal.localPath);
        await vscode.window.showTextDocument(templateDoc, { preview: false });
        openedDocs.push(templateDoc);

        SfUtility.showInformation(
            `Opened ${filesToOpen.length} file(s) from "${folderEntry.name}". Review and edit, then close all tabs to deploy.`,
        );

        // 5. Watch for ALL files to be closed, then prompt to deploy
        this._watchForClose(openedDocs, templateLocal.localPath,
            filesToOpen.filter(f => f.entry !== templateFile).map(f => f.localPath),
            tempDir, folderEntry.name);
    }

    /**
     * Open the Azure portal "Deploy to Azure" blade for a template folder.
     * Finds the main template JSON, builds the raw GitHub URL, and opens the
     * portal URL: https://portal.azure.com/#create/Microsoft.Template/uri/{encoded}
     *
     * The URL is always copied to the clipboard as a fallback so the user
     * can paste it manually if vscode.env.openExternal mangles the fragment.
     *
     * "Build in Editor" is offered as an alternative — it opens the template
     * JSON in VS Code and guides the user through the portal's manual paste flow.
     */
    async deployFromAzurePortal(repo: TemplateRepo, folderEntry: GitHubEntry): Promise<void> {
        const service = TemplateService.getInstance();

        const entries = await vscode.window.withProgress(
            { location: vscode.ProgressLocation.Notification, title: `Finding template in ${folderEntry.name}...` },
            () => service.listTemplateFiles(repo, folderEntry.path),
        );

        const jsonFiles = entries.filter(e => e.type === 'file' && e.name.toLowerCase().endsWith('.json'));
        const templateFile = this._findTemplateFile(jsonFiles);

        if (!templateFile) {
            vscode.window.showWarningMessage(`No ARM template file found in ${folderEntry.name}.`);
            return;
        }

        const rawUrl = service.getRawUrl(repo, templateFile.path);
        const encodedRawUrl = encodeURIComponent(rawUrl);
        const portalUrl = `https://portal.azure.com/#create/Microsoft.Template/uri/${encodedRawUrl}`;

        SfUtility.outputLog(`TemplateDeployService: raw template URL: ${rawUrl}`, null, debugLevel.info);
        SfUtility.outputLog(`TemplateDeployService: portal deploy URL: ${portalUrl}`, null, debugLevel.info);

        const action = await vscode.window.showInformationMessage(
            `Deploy "${folderEntry.name}" to Azure via portal?`,
            'Open in Browser', 'Build in Editor', 'Copy URL',
        );

        switch (action) {
            case 'Open in Browser': {
                // Always copy URL to clipboard as fallback
                await vscode.env.clipboard.writeText(portalUrl);

                // IMPORTANT: We cannot use vscode.env.openExternal() here because
                // VS Code's Uri model decodes percent-encoded characters in the
                // fragment (%3A → :, %2F → /) and the portal fragment requires
                // the template URL to remain percent-encoded inside the fragment.
                // Instead, launch the browser directly via the OS shell command.
                SfUtility.outputLog(
                    `TemplateDeployService: opening portal URL via shell: ${portalUrl}`,
                    null,
                    debugLevel.info,
                );

                await this._openUrlInBrowser(portalUrl);
                vscode.window.showInformationMessage(
                    'Portal URL also copied to clipboard. If the template does not load, paste the URL directly in your browser.',
                );
                break;
            }
            case 'Build in Editor': {
                const rawContent = await vscode.window.withProgress(
                    { location: vscode.ProgressLocation.Notification, title: `Downloading ${templateFile.name}...` },
                    () => service.getFileContent(repo, templateFile.path),
                );
                await this._openCleanTemplateAndPortal(rawContent, templateFile, folderEntry.name);
                break;
            }
            case 'Copy URL': {
                await vscode.env.clipboard.writeText(portalUrl);
                vscode.window.showInformationMessage('Portal URL copied to clipboard.');
                break;
            }
        }
    }

    // ── Clean template editor flow ─────────────────────────────────────

    /**
     * Strip JSONC comments, validate the result, open the clean JSON in a
     * VS Code editor tab, copy it to clipboard, and open the portal's
     * custom deployment blade.  The user can then:
     *   1. Click "Build your own template in the editor"
     *   2. Select all → Paste → Save
     * The clean JSON is conveniently available in both clipboard and an
     * open editor tab.
     */
    private async _openCleanTemplateAndPortal(
        rawContent: string,
        templateFile: GitHubEntry,
        folderName: string,
    ): Promise<void> {
        // 1. Strip comments
        let cleanContent = rawContent;
        if (hasJsonComments(rawContent)) {
            SfUtility.outputLog(
                `TemplateDeployService: stripping JSONC comments from ${templateFile.name}`,
                null,
                debugLevel.info,
            );
            cleanContent = stripJsonComments(rawContent);
        }

        // 2. Validate the result is parseable JSON
        try {
            JSON.parse(cleanContent);
        } catch (err) {
            SfUtility.outputLog(
                `TemplateDeployService: stripped JSON failed to parse: ${err}`,
                null,
                debugLevel.error,
            );
            vscode.window.showErrorMessage(
                `Could not produce valid JSON after stripping comments from ${templateFile.name}. ` +
                `The template may have additional syntax issues beyond comments.`,
            );
            return;
        }

        // 3. Pretty-print the JSON for the editor
        const prettyJson = JSON.stringify(JSON.parse(cleanContent), null, 2);

        // 4. Open clean template in an untitled VS Code editor tab
        const doc = await vscode.workspace.openTextDocument({
            content: prettyJson,
            language: 'json',
        });
        await vscode.window.showTextDocument(doc, { preview: false });

        // 5. Copy to clipboard
        await vscode.env.clipboard.writeText(prettyJson);

        // 6. Open the portal
        const editorUri = vscode.Uri.parse('https://portal.azure.com/#create/Microsoft.Template');
        await vscode.env.openExternal(editorUri);

        // 7. Show step-by-step instructions
        const instructionAction = await vscode.window.showInformationMessage(
            `Clean template opened in editor and copied to clipboard.\n` +
            `In the Azure portal:\n` +
            `  1. Click "Build your own template in the editor"\n` +
            `  2. Select all (Ctrl+A) → Paste (Ctrl+V)\n` +
            `  3. Click "Save"`,
            'Copy Again',
        );
        if (instructionAction === 'Copy Again') {
            await vscode.env.clipboard.writeText(prettyJson);
            vscode.window.showInformationMessage('Template copied to clipboard again.');
        }
    }

    // ── Browser launch (bypassing VS Code Uri model) ──────────────────

    /**
     * Open a URL in the default browser using the OS shell command.
     * This bypasses vscode.env.openExternal() which decodes percent-encoded
     * characters in the URI fragment, breaking Azure portal template URLs.
     */
    private _openUrlInBrowser(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            let cmd: string;
            if (process.platform === 'win32') {
                cmd = `start "" "${url}"`;
            } else if (process.platform === 'darwin') {
                cmd = `open "${url}"`;
            } else {
                cmd = `xdg-open "${url}"`;
            }

            cp.exec(cmd, (err) => {
                if (err) {
                    SfUtility.outputLog(
                        `TemplateDeployService: failed to open browser: ${err.message}`,
                        null,
                        debugLevel.error,
                    );
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    // ── File identification ────────────────────────────────────────────

    /** Find the main ARM template file (non-parameter JSON). */
    private _findTemplateFile(jsonFiles: GitHubEntry[]): GitHubEntry | undefined {
        const lower = (e: GitHubEntry) => e.name.toLowerCase();

        // Priority order: azuredeploy.json > template.json > mainTemplate.json > deploy.json
        const priority = ['azuredeploy.json', 'template.json', 'maintemplate.json', 'deploy.json'];
        for (const name of priority) {
            const found = jsonFiles.find(f => lower(f) === name);
            if (found) { return found; }
        }

        // Fallback: first JSON file that is NOT a parameter file
        return jsonFiles.find(f => !this._isParameterFile(f.name));
    }

    /** Find all parameter files. */
    private _findParameterFiles(jsonFiles: GitHubEntry[]): GitHubEntry[] {
        return jsonFiles.filter(f => this._isParameterFile(f.name));
    }

    /** Check if a file name looks like an ARM parameter file. */
    private _isParameterFile(name: string): boolean {
        const lower = name.toLowerCase();
        return lower.includes('parameter') || lower.includes('params');
    }

    // ── Temp directory ─────────────────────────────────────────────────

    private _createTempDir(folderName: string): string {
        const base = path.join(os.tmpdir(), 'sf-templates');
        if (!fs.existsSync(base)) { fs.mkdirSync(base, { recursive: true }); }
        const dir = path.join(base, `${folderName}-${Date.now()}`);
        fs.mkdirSync(dir, { recursive: true });
        return dir;
    }

    // ── Close watcher & deploy prompt ──────────────────────────────────

    private _watchForClose(
        docs: vscode.TextDocument[],
        templatePath: string,
        parameterPaths: string[],
        tempDir: string,
        templateName: string,
    ): void {
        const openUris = new Set(docs.map(d => d.uri.toString()));

        const disposable = vscode.workspace.onDidCloseTextDocument((closed) => {
            openUris.delete(closed.uri.toString());

            if (openUris.size === 0) {
                disposable.dispose();
                // All template files have been closed — prompt to deploy
                this._promptDeploy(templatePath, parameterPaths, tempDir, templateName);
            }
        });
    }

    private async _promptDeploy(
        templatePath: string,
        parameterPaths: string[],
        _tempDir: string,
        templateName: string,
    ): Promise<void> {
        const answer = await vscode.window.showInformationMessage(
            `Deploy "${templateName}" to Azure?`,
            { modal: true },
            'Deploy', 'Cancel',
        );

        if (answer !== 'Deploy') {
            SfUtility.outputLog('TemplateDeployService: user cancelled deployment', null, debugLevel.info);
            return;
        }

        // Gather deployment parameters from user
        const resourceGroup = await vscode.window.showInputBox({
            title: 'Resource Group',
            prompt: 'Enter the Azure resource group name (will be created if it does not exist)',
            placeHolder: 'my-sf-cluster-rg',
            ignoreFocusOut: true,
        });
        if (!resourceGroup) { return; }

        const location = await vscode.window.showInputBox({
            title: 'Azure Location',
            prompt: 'Enter the Azure region for the resource group',
            placeHolder: 'eastus',
            value: 'eastus',
            ignoreFocusOut: true,
        });
        if (!location) { return; }

        const deploymentName = await vscode.window.showInputBox({
            title: 'Deployment Name',
            prompt: 'Enter a name for this deployment (optional)',
            placeHolder: `${resourceGroup}-deploy`,
            value: `${resourceGroup}-${new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)}`,
            ignoreFocusOut: true,
        });
        if (deploymentName === undefined) { return; } // user pressed Escape

        const testOnly = await vscode.window.showQuickPick(
            [
                { label: 'Deploy', description: 'Validate and deploy the template', picked: true },
                { label: 'Test Only', description: 'Validate the template without deploying (What-If)' },
            ],
            { title: 'Deployment Mode', placeHolder: 'Choose deployment mode', ignoreFocusOut: true },
        );
        if (!testOnly) { return; }

        // Build and run the PowerShell command
        const paramFileArg = parameterPaths.length > 0
            ? `-TemplateParameterFile '${parameterPaths[0].replace(/'/g, "''")}'`
            : '';

        const whatIfFlag = testOnly.label === 'Test Only' ? '-WhatIf' : '';

        // PowerShell script that:
        //  1. Ensures Az module is available
        //  2. Ensures the user is logged in
        //  3. Creates the resource group if needed
        //  4. Validates the template
        //  5. Deploys (or does What-If)
        const psScript = `
# --- Service Fabric ARM Template Deployment ---
$ErrorActionPreference = 'Stop'

# Ensure Az modules
if (-not (Get-Module -ListAvailable -Name Az.Accounts)) {
    Write-Host 'Installing Az.Accounts module...' -ForegroundColor Yellow
    Install-Module Az.Accounts -Force -AllowClobber -Scope CurrentUser
}
if (-not (Get-Module -ListAvailable -Name Az.Resources)) {
    Write-Host 'Installing Az.Resources module...' -ForegroundColor Yellow
    Install-Module Az.Resources -Force -AllowClobber -Scope CurrentUser
}
Import-Module Az.Accounts -ErrorAction SilentlyContinue
Import-Module Az.Resources -ErrorAction SilentlyContinue

# Ensure logged in
$context = Get-AzContext -ErrorAction SilentlyContinue
if (-not $context) {
    Write-Host 'Not logged in to Azure. Running Connect-AzAccount...' -ForegroundColor Yellow
    Connect-AzAccount
}

$resourceGroup = '${resourceGroup.replace(/'/g, "''")}'
$location = '${(location || 'eastus').replace(/'/g, "''")}'
$deploymentName = '${(deploymentName || resourceGroup).replace(/'/g, "''")}'
$templateFile = '${templatePath.replace(/'/g, "''")}'
${parameterPaths.length > 0 ? `$templateParameterFile = '${parameterPaths[0].replace(/'/g, "''")}'` : '$templateParameterFile = $null'}

# Create resource group if needed
if (-not (Get-AzResourceGroup -Name $resourceGroup -ErrorAction SilentlyContinue)) {
    Write-Host "Creating resource group '$resourceGroup' in '$location'..." -ForegroundColor Cyan
    New-AzResourceGroup -Name $resourceGroup -Location $location
}

# Validate
Write-Host 'Validating template...' -ForegroundColor Cyan
$validateParams = @{
    ResourceGroupName = $resourceGroup
    TemplateFile      = $templateFile
    Mode              = 'Incremental'
}
if ($templateParameterFile) { $validateParams['TemplateParameterFile'] = $templateParameterFile }

$validation = Test-AzResourceGroupDeployment @validateParams
if ($validation) {
    Write-Error "Template validation failed: $($validation.Code) - $($validation.Message)"
    return
}
Write-Host 'Template validation succeeded.' -ForegroundColor Green

# Deploy
Write-Host "Starting deployment '$deploymentName'..." -ForegroundColor Cyan
$deployParams = @{
    Name                  = $deploymentName
    ResourceGroupName     = $resourceGroup
    TemplateFile          = $templateFile
    Mode                  = 'Incremental'
    DeploymentDebugLogLevel = 'All'
    Verbose               = $true
    ${whatIfFlag ? 'WhatIf = $true' : ''}
}
if ($templateParameterFile) { $deployParams['TemplateParameterFile'] = $templateParameterFile }

New-AzResourceGroupDeployment @deployParams

Write-Host "Deployment '${testOnly.label === 'Test Only' ? 'validation' : 'complete'}' for '$deploymentName'." -ForegroundColor Green
`;

        SfUtility.outputLog(`TemplateDeployService: launching deployment terminal for ${templateName}`, null, debugLevel.info);

        const terminal = vscode.window.createTerminal({
            name: `SF Deploy: ${templateName}`,
        });
        terminal.show();
        terminal.sendText(psScript);
    }
}
