/**
 * Unit tests for SfManifestValidator
 */

import * as fs from 'fs';
import * as path from 'path';
import { SfManifestValidator } from '../../src/services/SfManifestValidator';

// Mock xmllint-wasm
const mockValidateXML = jest.fn();
jest.mock('xmllint-wasm', () => ({
    validateXML: (...args: any[]) => mockValidateXML(...args),
}));

// Mock SfUtility
jest.mock('../../src/sfUtility', () => ({
    SfUtility: {
        outputLog: jest.fn(),
        init: jest.fn(),
    },
    debugLevel: {
        info: 0,
        warn: 1,
        error: 2,
    },
}));

const VALID_APP_MANIFEST = `<?xml version="1.0" encoding="utf-8"?>
<ApplicationManifest xmlns:xsd="http://www.w3.org/2001/XMLSchema"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    ApplicationTypeName="VotingType"
    ApplicationTypeVersion="1.0.0"
    xmlns="http://schemas.microsoft.com/2011/01/fabric">
</ApplicationManifest>`;

const INVALID_XML = `<?xml version="1.0"?>
<ApplicationManifest>
  <BadElement />
</ApplicationManifest>`;

describe('SfManifestValidator', () => {
    let validator: SfManifestValidator;
    let tempDir: string;
    let mockDiagCollection: any;

    beforeEach(() => {
        // Reset the mock diagnostic collection tracking
        const vscode = require('vscode');
        mockDiagCollection = {
            set: jest.fn(),
            clear: jest.fn(),
            dispose: jest.fn(),
            delete: jest.fn(),
            get: jest.fn(),
            has: jest.fn(),
            forEach: jest.fn(),
        };
        vscode.languages.createDiagnosticCollection.mockReturnValue(mockDiagCollection);

        validator = new SfManifestValidator();
        tempDir = path.join(__dirname, '..', 'fixtures', 'validator-test');
        fs.mkdirSync(tempDir, { recursive: true });
        mockValidateXML.mockReset();
    });

    afterEach(() => {
        validator.dispose();
    });

    describe('constructor', () => {
        test('should create diagnostic collection', () => {
            const vscode = require('vscode');
            expect(vscode.languages.createDiagnosticCollection).toHaveBeenCalledWith('sfManifest');
        });
    });

    describe('validateFile', () => {
        test('should return true for valid XML', async () => {
            const tempFile = path.join(tempDir, 'valid-manifest.xml');
            fs.writeFileSync(tempFile, VALID_APP_MANIFEST);

            // Inject XSD content directly via internal property
            (validator as any).xsdContent = '<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"></xs:schema>';

            mockValidateXML.mockResolvedValue({
                valid: true,
                errors: [],
                rawOutput: '',
                normalized: '',
            });

            const result = await validator.validateFile(tempFile);
            expect(result).toBe(true);
            expect(mockValidateXML).toHaveBeenCalled();
            expect(mockDiagCollection.set).toHaveBeenCalled();

            fs.unlinkSync(tempFile);
        });

        test('should return false for invalid XML and set diagnostics', async () => {
            const tempFile = path.join(tempDir, 'invalid-manifest.xml');
            fs.writeFileSync(tempFile, INVALID_XML);

            (validator as any).xsdContent = '<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"></xs:schema>';

            mockValidateXML.mockResolvedValue({
                valid: false,
                errors: [
                    {
                        rawMessage: 'invalid-manifest.xml:3: element BadElement: not expected',
                        message: 'element BadElement: not expected',
                        loc: { fileName: 'invalid-manifest.xml', lineNumber: 3 },
                    },
                ],
                rawOutput: '',
                normalized: '',
            });

            const result = await validator.validateFile(tempFile);
            expect(result).toBe(false);
            expect(mockDiagCollection.set).toHaveBeenCalled();

            // Verify diagnostics contain the error
            const setCall = mockDiagCollection.set.mock.calls[0];
            const diagnostics = setCall[1];
            expect(diagnostics).toHaveLength(1);
            expect(diagnostics[0].message).toBe('element BadElement: not expected');

            fs.unlinkSync(tempFile);
        });

        test('should return false when file does not exist', async () => {
            const result = await validator.validateFile(path.join(tempDir, 'nonexistent.xml'));
            expect(result).toBe(false);
            expect(mockDiagCollection.set).toHaveBeenCalled();
        });

        test('should handle xmllint-wasm errors gracefully', async () => {
            const tempFile = path.join(tempDir, 'error-manifest.xml');
            fs.writeFileSync(tempFile, VALID_APP_MANIFEST);

            (validator as any).xsdContent = '<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"></xs:schema>';

            mockValidateXML.mockRejectedValue(new Error('WASM engine failure'));

            const result = await validator.validateFile(tempFile);
            expect(result).toBe(false);
            expect(mockDiagCollection.set).toHaveBeenCalled();

            fs.unlinkSync(tempFile);
        });
    });

    describe('validateProject', () => {
        test('should validate application manifest and all service manifests', async () => {
            const appManifest = path.join(tempDir, 'ApplicationManifest.xml');
            const svcManifest = path.join(tempDir, 'ServiceManifest.xml');
            fs.writeFileSync(appManifest, VALID_APP_MANIFEST);
            fs.writeFileSync(svcManifest, VALID_APP_MANIFEST);

            (validator as any).xsdContent = '<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"></xs:schema>';

            mockValidateXML.mockResolvedValue({
                valid: true,
                errors: [],
                rawOutput: '',
                normalized: '',
            });

            const errorCount = await validator.validateProject(appManifest, [svcManifest]);
            expect(errorCount).toBe(0);
            expect(mockValidateXML).toHaveBeenCalledTimes(2);

            fs.unlinkSync(appManifest);
            fs.unlinkSync(svcManifest);
        });

        test('should count files with errors', async () => {
            const appManifest = path.join(tempDir, 'AppManifest2.xml');
            const svcManifest = path.join(tempDir, 'SvcManifest2.xml');
            fs.writeFileSync(appManifest, VALID_APP_MANIFEST);
            fs.writeFileSync(svcManifest, INVALID_XML);

            (validator as any).xsdContent = '<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"></xs:schema>';

            mockValidateXML
                .mockResolvedValueOnce({ valid: true, errors: [], rawOutput: '', normalized: '' })
                .mockResolvedValueOnce({
                    valid: false,
                    errors: [{ rawMessage: 'err', message: 'bad element', loc: { fileName: 'SvcManifest2.xml', lineNumber: 3 } }],
                    rawOutput: '',
                    normalized: '',
                });

            const errorCount = await validator.validateProject(appManifest, [svcManifest]);
            expect(errorCount).toBe(1);

            fs.unlinkSync(appManifest);
            fs.unlinkSync(svcManifest);
        });

        test('should skip non-existent service manifest paths', async () => {
            const appManifest = path.join(tempDir, 'AppManifest3.xml');
            fs.writeFileSync(appManifest, VALID_APP_MANIFEST);

            (validator as any).xsdContent = '<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"></xs:schema>';

            mockValidateXML.mockResolvedValue({ valid: true, errors: [], rawOutput: '', normalized: '' });

            const errorCount = await validator.validateProject(appManifest, ['/nonexistent/ServiceManifest.xml']);
            expect(errorCount).toBe(0);
            // Only app manifest validated, nonexistent service manifest skipped
            expect(mockValidateXML).toHaveBeenCalledTimes(1);

            fs.unlinkSync(appManifest);
        });
    });

    describe('clearDiagnostics', () => {
        test('should clear the diagnostic collection', () => {
            validator.clearDiagnostics();
            expect(mockDiagCollection.clear).toHaveBeenCalled();
        });
    });

    describe('dispose', () => {
        test('should dispose the diagnostic collection', () => {
            validator.dispose();
            expect(mockDiagCollection.dispose).toHaveBeenCalled();
        });
    });

    afterAll(() => {
        try {
            if (fs.existsSync(tempDir)) {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
        } catch { /* ignore */ }
    });
});
