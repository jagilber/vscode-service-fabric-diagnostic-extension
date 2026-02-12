/**
 * SfManifestValidator — validates Service Fabric XML manifests against the
 * official ServiceFabricServiceModel.xsd schema using xmllint-wasm (pure WASM).
 *
 * Provides VS Code Diagnostics integration so errors appear in the Problems panel.
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { SfUtility, debugLevel } from '../sfUtility';

// Well-known XSD locations (checked in order)
const XSD_SEARCH_PATHS = [
    'C:\\Program Files\\Microsoft SDKs\\Service Fabric\\schemas\\ServiceFabricServiceModel.xsd',
    'C:\\Program Files (x86)\\Microsoft SDKs\\Service Fabric\\schemas\\ServiceFabricServiceModel.xsd',
];

export class SfManifestValidator implements vscode.Disposable {
    private readonly diagnosticCollection: vscode.DiagnosticCollection;
    private xsdContent: string | undefined;
    private xsdLoadError: string | undefined;

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('sfManifest');
    }

    dispose(): void {
        this.diagnosticCollection.dispose();
    }

    /**
     * Lazily load the XSD schema content from disk.
     * Caches after first successful read.
     */
    private async loadXsd(): Promise<string> {
        if (this.xsdContent) { return this.xsdContent; }
        if (this.xsdLoadError) { throw new Error(this.xsdLoadError); }

        for (const xsdPath of XSD_SEARCH_PATHS) {
            try {
                if (fs.existsSync(xsdPath)) {
                    this.xsdContent = fs.readFileSync(xsdPath, 'utf-8');
                    SfUtility.outputLog(`SfManifestValidator: loaded XSD from ${xsdPath}`, null, debugLevel.info);
                    return this.xsdContent;
                }
            } catch (err) {
                SfUtility.outputLog(`SfManifestValidator: failed to read XSD from ${xsdPath}`, err, debugLevel.warn);
            }
        }

        // Allow user to browse for the XSD
        this.xsdLoadError = 'Service Fabric XSD schema not found. Install the Service Fabric SDK or browse for the schema file.';
        throw new Error(this.xsdLoadError);
    }

    /**
     * Validate a manifest XML file against the SF XSD schema.
     * Pushes diagnostics to the Problems panel.
     *
     * @returns true if valid, false if errors were found
     */
    async validateFile(filePath: string): Promise<boolean> {
        const uri = vscode.Uri.file(filePath);

        // Read the XML
        let xmlContent: string;
        try {
            xmlContent = fs.readFileSync(filePath, 'utf-8');
        } catch (err) {
            const msg = `Cannot read file: ${err instanceof Error ? err.message : String(err)}`;
            this.diagnosticCollection.set(uri, [
                new vscode.Diagnostic(new vscode.Range(0, 0, 0, 0), msg, vscode.DiagnosticSeverity.Error),
            ]);
            return false;
        }

        // Load XSD
        let xsd: string;
        try {
            xsd = await this.loadXsd();
        } catch (err) {
            // Offer to browse for XSD
            const browse = await vscode.window.showErrorMessage(
                'Service Fabric XSD schema not found. Install the SF SDK or locate the schema file.',
                'Browse for XSD',
            );
            if (browse === 'Browse for XSD') {
                const picked = await vscode.window.showOpenDialog({
                    canSelectFiles: true,
                    canSelectFolders: false,
                    filters: { 'XSD Schema': ['xsd'] },
                    title: 'Select ServiceFabricServiceModel.xsd',
                });
                if (picked && picked.length > 0) {
                    this.xsdContent = fs.readFileSync(picked[0].fsPath, 'utf-8');
                    this.xsdLoadError = undefined;
                    xsd = this.xsdContent;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }

        // Validate with xmllint-wasm
        try {
            const { validateXML } = await import('xmllint-wasm');
            const result = await validateXML({
                xml: { fileName: path.basename(filePath), contents: xmlContent },
                schema: { fileName: 'ServiceFabricServiceModel.xsd', contents: xsd },
            });

            if (result.valid) {
                this.diagnosticCollection.set(uri, []);
                return true;
            }

            // Map errors to VS Code diagnostics
            const diagnostics: vscode.Diagnostic[] = result.errors.map(err => {
                const line = err.loc?.lineNumber ? err.loc.lineNumber - 1 : 0; // 0-based
                const range = new vscode.Range(line, 0, line, Number.MAX_SAFE_INTEGER);
                return new vscode.Diagnostic(range, err.message, vscode.DiagnosticSeverity.Error);
            });

            this.diagnosticCollection.set(uri, diagnostics);
            return false;
        } catch (err) {
            const msg = `Validation engine error: ${err instanceof Error ? err.message : String(err)}`;
            SfUtility.outputLog(`SfManifestValidator: ${msg}`, err, debugLevel.error);
            this.diagnosticCollection.set(uri, [
                new vscode.Diagnostic(new vscode.Range(0, 0, 0, 0), msg, vscode.DiagnosticSeverity.Error),
            ]);
            return false;
        }
    }

    /**
     * Validate all manifests in a project (ApplicationManifest.xml + all ServiceManifest.xml files).
     *
     * @returns number of files with errors
     */
    async validateProject(manifestPath: string, serviceManifestPaths: string[]): Promise<number> {
        let errorCount = 0;

        const valid = await this.validateFile(manifestPath);
        if (!valid) { errorCount++; }

        for (const svcPath of serviceManifestPaths) {
            if (fs.existsSync(svcPath)) {
                const svcValid = await this.validateFile(svcPath);
                if (!svcValid) { errorCount++; }
            }
        }

        return errorCount;
    }

    /** Clear all diagnostics produced by this validator. */
    clearDiagnostics(): void {
        this.diagnosticCollection.clear();
    }
}
