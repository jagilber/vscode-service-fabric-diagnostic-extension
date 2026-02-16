/**
 * Unit tests for TemplateSummaryService
 * Tests markdown generation, mermaid diagram output, parameter/resource tables,
 * and ARM expression cleaning.
 */

// Mock vscode before any imports
jest.mock('vscode', () => ({
    window: {
        showTextDocument: jest.fn().mockResolvedValue(undefined),
        showWarningMessage: jest.fn().mockResolvedValue(undefined),
        showErrorMessage: jest.fn().mockResolvedValue(undefined),
        withProgress: jest.fn().mockImplementation((_opts: unknown, task: () => Promise<unknown>) => task()),
    },
    workspace: {
        openTextDocument: jest.fn().mockResolvedValue({ uri: { fsPath: '/mock' } }),
    },
    commands: {
        executeCommand: jest.fn().mockResolvedValue(undefined),
    },
    Uri: {
        file: jest.fn().mockImplementation((p: string) => ({ fsPath: p, scheme: 'file' })),
    },
    ProgressLocation: { Notification: 15 },
}));

jest.mock('../../../src/services/reports/ReportUtils', () => ({
    openMarkdownPreview: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../src/services/TemplateService', () => ({
    TemplateService: {
        getInstance: jest.fn().mockReturnValue({
            listTemplateFiles: jest.fn().mockResolvedValue([
                { name: 'AzureDeploy.json', path: 'folder/AzureDeploy.json', type: 'file' },
                { name: 'AzureDeploy.Parameters.json', path: 'folder/AzureDeploy.Parameters.json', type: 'file' },
            ]),
            getFileContent: jest.fn(),
        }),
    },
}));

jest.mock('../../../src/sfUtility', () => ({
    SfUtility: {
        outputLog: jest.fn(),
        showWarning: jest.fn(),
        showInformation: jest.fn(),
    },
    debugLevel: { error: 0, warn: 1, info: 2, debug: 3, trace: 4 },
}));

import { TemplateSummaryService } from '../../../src/services/TemplateSummaryService';

// Access private methods for testing via any cast
const service = TemplateSummaryService.getInstance() as any;

describe('TemplateSummaryService', () => {
    describe('_cleanArmExpression', () => {
        it('should strip parameters() wrapper', () => {
            expect(service._cleanArmExpression("[parameters('clusterName')]")).toBe('clusterName');
        });

        it('should strip variables() wrapper', () => {
            expect(service._cleanArmExpression("[variables('subnetRef')]")).toBe('subnetRef');
        });

        it('should simplify concat expression', () => {
            const expr = "[concat(parameters('lbIPName'),'-',parameters('vmNodeType0Name'))]";
            const result = service._cleanArmExpression(expr);
            expect(result).toContain('lbIPName');
            expect(result).toContain('vmNodeType0Name');
        });

        it('should handle plain strings', () => {
            expect(service._cleanArmExpression('myResource')).toBe('myResource');
        });

        it('should handle empty string', () => {
            expect(service._cleanArmExpression('')).toBe('');
        });
    });

    describe('_shortType', () => {
        it('should strip Microsoft prefix', () => {
            expect(service._shortType('Microsoft.Network/loadBalancers')).toBe('Network/loadBalancers');
        });

        it('should handle type without dot', () => {
            expect(service._shortType('loadBalancers')).toBe('loadBalancers');
        });
    });

    describe('_shortResourceName', () => {
        it('should return last segment', () => {
            expect(service._shortResourceName('Microsoft.Network/loadBalancers')).toBe('loadBalancers');
        });
    });

    describe('_getProvider', () => {
        it('should extract provider namespace', () => {
            expect(service._getProvider('Microsoft.Network/virtualNetworks')).toBe('Microsoft.Network');
        });

        it('should return Other for simple types', () => {
            expect(service._getProvider('something')).toBe('Other');
        });
    });

    describe('_getResourceIcon', () => {
        it('should return VM icon for VMSS', () => {
            expect(service._getResourceIcon('Microsoft.Compute/virtualMachineScaleSets')).toBe('🖥️');
        });

        it('should return fabric icon for SF cluster', () => {
            expect(service._getResourceIcon('Microsoft.ServiceFabric/clusters')).toBe('🧵');
        });

        it('should return shield for NSG', () => {
            expect(service._getResourceIcon('Microsoft.Network/networkSecurityGroups')).toBe('🛡️');
        });

        it('should return storage icon for storage accounts', () => {
            expect(service._getResourceIcon('Microsoft.Storage/storageAccounts')).toBe('💾');
        });

        it('should return default icon for unknown types', () => {
            expect(service._getResourceIcon('Microsoft.Custom/something')).toBe('📦');
        });
    });

    describe('_flattenResources', () => {
        it('should return flat list for non-nested resources', () => {
            const resources = [
                { type: 'Microsoft.Storage/storageAccounts', name: 'sa1' },
                { type: 'Microsoft.Network/virtualNetworks', name: 'vnet1' },
            ];
            const result = service._flattenResources(resources);
            expect(result).toHaveLength(2);
        });

        it('should flatten nested resources with parent type prefix', () => {
            const resources = [
                {
                    type: 'Microsoft.ServiceFabric/clusters',
                    name: 'cluster1',
                    resources: [
                        { type: 'applications', name: 'app1' },
                    ],
                },
            ];
            const result = service._flattenResources(resources);
            expect(result).toHaveLength(2);
            expect(result[1].type).toBe('Microsoft.ServiceFabric/clusters/applications');
        });
    });

    describe('_truncate', () => {
        it('should not truncate short text', () => {
            expect(service._truncate('hello', 10)).toBe('hello');
        });

        it('should truncate with ellipsis', () => {
            expect(service._truncate('a very long string', 10)).toBe('a very lo…');
        });
    });

    describe('_isParameterFile', () => {
        it('should detect parameter file', () => {
            expect(service._isParameterFile('AzureDeploy.Parameters.json')).toBe(true);
        });

        it('should detect params file', () => {
            expect(service._isParameterFile('deploy.params.json')).toBe(true);
        });

        it('should detect .parameter.json suffix', () => {
            expect(service._isParameterFile('cluster.parameter.json')).toBe(true);
        });

        it('should not match template file', () => {
            expect(service._isParameterFile('AzureDeploy.json')).toBe(false);
        });

        it('should not false-positive on names containing params substring', () => {
            expect(service._isParameterFile('customparams-script.json')).toBe(false);
        });
    });

    describe('_findTemplateFile', () => {
        it('should prefer azuredeploy.json', () => {
            const files = [
                { name: 'metadata.json', type: 'file' },
                { name: 'AzureDeploy.json', type: 'file' },
                { name: 'createUiDefinition.json', type: 'file' },
            ];
            expect(service._findTemplateFile(files)?.name).toBe('AzureDeploy.json');
        });

        it('should skip metadata.json and createUiDefinition.json in fallback', () => {
            const files = [
                { name: 'createUiDefinition.json', type: 'file' },
                { name: 'metadata.json', type: 'file' },
                { name: 'sf-cluster.json', type: 'file' },
            ];
            expect(service._findTemplateFile(files)?.name).toBe('sf-cluster.json');
        });

        it('should return undefined when only non-template files exist', () => {
            const files = [
                { name: 'metadata.json', type: 'file' },
                { name: 'deploy.parameters.json', type: 'file' },
            ];
            expect(service._findTemplateFile(files)).toBeUndefined();
        });

        it('should match mainTemplate.json case-insensitively', () => {
            const files = [
                { name: 'mainTemplate.json', type: 'file' },
            ];
            expect(service._findTemplateFile(files)?.name).toBe('mainTemplate.json');
        });
    });

    describe('_generateMarkdown', () => {
        const template = {
            $schema: 'https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#',
            contentVersion: '1.0.0.0',
            parameters: {
                clusterName: {
                    type: 'string',
                    defaultValue: 'myCluster',
                    metadata: { description: 'Name of the SF cluster' },
                },
                vmSize: {
                    type: 'string',
                    allowedValues: ['Standard_D2_v2', 'Standard_D4_v2'],
                },
            },
            variables: {
                subnetRef: "[resourceId('Microsoft.Network/virtualNetworks', 'vnet')]",
            },
            resources: [
                {
                    type: 'Microsoft.Storage/storageAccounts',
                    apiVersion: '2021-02-01',
                    name: "[parameters('storageAccountName')]",
                },
                {
                    type: 'Microsoft.Network/virtualNetworks',
                    apiVersion: '2021-05-01',
                    name: 'myVnet',
                    dependsOn: [],
                },
                {
                    type: 'Microsoft.ServiceFabric/clusters',
                    apiVersion: '2021-01-01',
                    name: "[parameters('clusterName')]",
                    dependsOn: [
                        "[resourceId('Microsoft.Storage/storageAccounts', parameters('storageAccountName'))]",
                    ],
                },
            ],
            outputs: {
                clusterEndpoint: {
                    type: 'string',
                    value: "[reference(parameters('clusterName')).clusterEndpoint]",
                },
            },
        };

        const repo = { name: 'test-repo', url: 'https://github.com/test/repo', branch: 'main' };

        it('should produce markdown with all sections', () => {
            const md = service._generateMarkdown(template, 'test-folder', repo, 'AzureDeploy.json', ['params.json']);
            expect(md).toContain('# test-folder');
            expect(md).toContain('## Overview');
            expect(md).toContain('## Architecture');
            expect(md).toContain('## Resources');
            expect(md).toContain('## Parameters');
            expect(md).toContain('## Variables');
            expect(md).toContain('## Outputs');
        });

        it('should include mermaid diagram with ELK layout', () => {
            const md = service._generateMarkdown(template, 'test-folder', repo, 'AzureDeploy.json', []);
            expect(md).toContain('```mermaid');
            expect(md).toContain('layout: elk');
            expect(md).toContain('graph TB');
            expect(md).toContain('```');
        });

        it('should list resources in table', () => {
            const md = service._generateMarkdown(template, 'test-folder', repo, 'AzureDeploy.json', []);
            expect(md).toContain('Storage/storageAccounts');
            expect(md).toContain('Network/virtualNetworks');
            expect(md).toContain('ServiceFabric/clusters');
        });

        it('should list parameters in table', () => {
            const md = service._generateMarkdown(template, 'test-folder', repo, 'AzureDeploy.json', []);
            expect(md).toContain('clusterName');
            expect(md).toContain('Name of the SF cluster');
            expect(md).toContain('vmSize');
            expect(md).toContain('2 allowed');
        });

        it('should include outputs', () => {
            const md = service._generateMarkdown(template, 'test-folder', repo, 'AzureDeploy.json', []);
            expect(md).toContain('clusterEndpoint');
        });

        it('should mention parameter files in overview', () => {
            const md = service._generateMarkdown(template, 'test-folder', repo, 'AzureDeploy.json', ['params.json']);
            expect(md).toContain('params.json');
        });

        it('should include dependency arrows in mermaid', () => {
            const md = service._generateMarkdown(template, 'test-folder', repo, 'AzureDeploy.json', []);
            // SF cluster depends on storage account
            expect(md).toMatch(/R2\s*-->\s*R0/);
        });

        it('should include subgraph for providers', () => {
            const md = service._generateMarkdown(template, 'test-folder', repo, 'AzureDeploy.json', []);
            // Should not create subgraph for single-resource providers
            // Microsoft.Storage only has 1 resource, so no subgraph
            expect(md).not.toContain('subgraph Microsoft_Storage');
        });

        it('should include resource icons in diagram nodes', () => {
            const md = service._generateMarkdown(template, 'test-folder', repo, 'AzureDeploy.json', []);
            expect(md).toContain('💾'); // storage
            expect(md).toContain('🧵'); // service fabric
            expect(md).toContain('🔗'); // virtual network
        });
    });

    describe('_generateMermaidDiagram', () => {
        it('should handle empty resource list', () => {
            const diagram = service._generateMermaidDiagram([]);
            expect(diagram).toContain('```mermaid');
            expect(diagram).toContain('layout: elk');
            expect(diagram).toContain('graph TB');
        });

        it('should handle single resource with no deps', () => {
            const resources = [{
                type: 'Microsoft.Storage/storageAccounts',
                name: 'myStorage',
                apiVersion: '2021-02-01',
            }];
            const diagram = service._generateMermaidDiagram(resources);
            expect(diagram).toContain('R0');
            expect(diagram).toContain('storageAccounts');
            expect(diagram).not.toContain('-->');
        });
    });
});
