/**
 * Unit tests for SF Application tree node classes.
 */
import * as vscode from 'vscode';
import { SfProjectNode, ServicesGroupNode, ParametersGroupNode, ProfilesGroupNode } from '../../../src/treeview/nodes/SfProjectNode';
import { ServiceRefNode } from '../../../src/treeview/nodes/ServiceRefNode';
import { ManifestNode } from '../../../src/treeview/nodes/ManifestNode';
import { ParameterFileNode } from '../../../src/treeview/nodes/ParameterFileNode';
import { ProfileNode } from '../../../src/treeview/nodes/ProfileNode';
import { SfProjectInfo, ServiceReference, ParameterFileInfo, PublishProfileInfo } from '../../../src/types/ProjectTypes';

jest.mock('vscode');

describe('SF Application Tree Nodes', () => {
    const mockProject: SfProjectInfo = {
        sfprojPath: 'C:\\Projects\\MyApp\\MyApp.sfproj',
        projectDir: 'C:\\Projects\\MyApp',
        appTypeName: 'MyAppType',
        appTypeVersion: '1.2.3',
        manifestPath: 'C:\\Projects\\MyApp\\ApplicationManifest.xml',
        services: [
            {
                serviceManifestName: 'WebPkg',
                serviceManifestVersion: '1.0.0',
                serviceTypeName: 'WebServiceType',
                serviceKind: 'Stateless',
                defaultServiceName: 'WebService',
                serviceProjectPath: 'C:\\Projects\\WebService',
                serviceManifestPath: 'C:\\Projects\\WebService\\PackageRoot\\ServiceManifest.xml',
            },
            {
                serviceManifestName: 'DataPkg',
                serviceManifestVersion: '2.0.0',
                serviceTypeName: 'DataServiceType',
                serviceKind: 'Stateful',
                defaultServiceName: 'DataService',
            },
        ],
        parameters: [
            { name: 'InstanceCount', defaultValue: '-1' },
            { name: 'Port', defaultValue: '8080' },
        ],
        profiles: [
            {
                name: 'Cloud',
                path: 'C:\\Projects\\MyApp\\PublishProfiles\\Cloud.xml',
                connectionEndpoint: 'mycluster.azure.com:19000',
                upgradeSettings: { mode: 'Monitored', enabled: true, failureAction: 'Rollback' },
            },
            {
                name: 'Local',
                path: 'C:\\Projects\\MyApp\\PublishProfiles\\Local.xml',
                connectionEndpoint: 'localhost:19000',
            },
        ],
        parameterFiles: [
            {
                name: 'Cloud',
                path: 'C:\\Projects\\MyApp\\ApplicationParameters\\Cloud.xml',
                applicationName: 'fabric:/MyApp',
                parameters: [
                    { name: 'InstanceCount', value: '3' },
                    { name: 'Port', value: '9090' },
                ],
            },
        ],
    };

    describe('SfProjectNode', () => {
        test('should set label to app type name', () => {
            const node = new SfProjectNode(mockProject);
            expect(node.label).toBe('MyAppType');
        });

        test('should set description to version', () => {
            const node = new SfProjectNode(mockProject);
            expect(node.description).toBe('v1.2.3');
        });

        test('should have sfProject contextValue', () => {
            const node = new SfProjectNode(mockProject);
            expect(node.contextValue).toBe('sfProject');
        });

        test('should have unique id based on sfproj path', () => {
            const node = new SfProjectNode(mockProject);
            expect(node.id).toBe('sfProject:C:\\Projects\\MyApp\\MyApp.sfproj');
        });

        test('should be expanded by default', () => {
            const node = new SfProjectNode(mockProject);
            expect(node.collapsibleState).toBe(vscode.TreeItemCollapsibleState.Expanded);
        });

        test('should return children: manifest + services + params + profiles groups', () => {
            const node = new SfProjectNode(mockProject);
            const children = node.getChildren();
            
            // manifest (1) + services group (1) + parameters group (1) + profiles group (1) = 4
            expect(children).toHaveLength(4);
            expect(children[0]).toBeInstanceOf(ManifestNode);
            expect(children[1]).toBeInstanceOf(ServicesGroupNode);
            expect(children[2]).toBeInstanceOf(ParametersGroupNode);
            expect(children[3]).toBeInstanceOf(ProfilesGroupNode);
        });

        test('should omit groups when empty', () => {
            const emptyProject: SfProjectInfo = {
                ...mockProject,
                services: [],
                parameterFiles: [],
                profiles: [],
            };
            const node = new SfProjectNode(emptyProject);
            const children = node.getChildren();
            
            // Only manifest
            expect(children).toHaveLength(1);
            expect(children[0]).toBeInstanceOf(ManifestNode);
        });

        test('should show (external) in description for external projects', () => {
            const extProject: SfProjectInfo = { ...mockProject, isExternal: true };
            const node = new SfProjectNode(extProject);
            expect(node.description).toBe('v1.2.3 (external)');
        });

        test('should have sfProjectExternal contextValue for external projects', () => {
            const extProject: SfProjectInfo = { ...mockProject, isExternal: true };
            const node = new SfProjectNode(extProject);
            expect(node.contextValue).toBe('sfProjectExternal');
        });

        test('should use orange icon for external projects', () => {
            const extProject: SfProjectInfo = { ...mockProject, isExternal: true };
            const node = new SfProjectNode(extProject);
            expect((node.iconPath as any).color?.id).toBe('charts.orange');
        });

        test('should use blue icon for workspace projects', () => {
            const node = new SfProjectNode(mockProject);
            expect((node.iconPath as any).color?.id).toBe('charts.blue');
        });
    });

    describe('ServicesGroupNode', () => {
        test('should show service count in label', () => {
            const node = new ServicesGroupNode(mockProject);
            expect(node.label).toBe('Services (2)');
        });

        test('should return ServiceRefNode children', () => {
            const node = new ServicesGroupNode(mockProject);
            const children = node.getChildren();
            expect(children).toHaveLength(2);
            expect(children[0]).toBeInstanceOf(ServiceRefNode);
        });
    });

    describe('ParametersGroupNode', () => {
        test('should show parameter file count in label', () => {
            const node = new ParametersGroupNode(mockProject);
            expect(node.label).toBe('Parameters (1)');
        });

        test('should return ParameterFileNode children', () => {
            const node = new ParametersGroupNode(mockProject);
            const children = node.getChildren();
            expect(children).toHaveLength(1);
            expect(children[0]).toBeInstanceOf(ParameterFileNode);
        });
    });

    describe('ProfilesGroupNode', () => {
        test('should show profile count in label', () => {
            const node = new ProfilesGroupNode(mockProject);
            expect(node.label).toBe('Publish Profiles (2)');
        });

        test('should return ProfileNode children', () => {
            const node = new ProfilesGroupNode(mockProject);
            const children = node.getChildren();
            expect(children).toHaveLength(2);
            expect(children[0]).toBeInstanceOf(ProfileNode);
        });
    });

    describe('ServiceRefNode', () => {
        const statelessSvc: ServiceReference = mockProject.services[0];
        const statefulSvc: ServiceReference = mockProject.services[1];

        test('should use defaultServiceName as label when available', () => {
            const node = new ServiceRefNode(statelessSvc, mockProject.sfprojPath);
            expect(node.label).toBe('WebService');
        });

        test('should fall back to serviceManifestName', () => {
            const svc: ServiceReference = { serviceManifestName: 'Pkg', serviceManifestVersion: '1.0' };
            const node = new ServiceRefNode(svc, mockProject.sfprojPath);
            expect(node.label).toBe('Pkg');
        });

        test('should show service kind and type in description', () => {
            const node = new ServiceRefNode(statelessSvc, mockProject.sfprojPath);
            expect(node.description).toContain('Stateless');
            expect(node.description).toContain('WebServiceType');
        });

        test('should be collapsible when serviceManifestPath exists', () => {
            const node = new ServiceRefNode(statelessSvc, mockProject.sfprojPath);
            expect(node.collapsibleState).toBe(vscode.TreeItemCollapsibleState.Collapsed);
        });

        test('should not be collapsible when no serviceManifestPath', () => {
            const node = new ServiceRefNode(statefulSvc, mockProject.sfprojPath);
            expect(node.collapsibleState).toBe(vscode.TreeItemCollapsibleState.None);
        });

        test('should have serviceRef contextValue', () => {
            const node = new ServiceRefNode(statelessSvc, mockProject.sfprojPath);
            expect(node.contextValue).toBe('serviceRef');
        });

        test('should return ManifestNode child when serviceManifestPath exists', () => {
            const node = new ServiceRefNode(statelessSvc, mockProject.sfprojPath);
            const children = node.getChildren();
            expect(children).toHaveLength(1);
            expect(children[0]).toBeInstanceOf(ManifestNode);
        });

        test('should return empty children when no serviceManifestPath', () => {
            const node = new ServiceRefNode(statefulSvc, mockProject.sfprojPath);
            const children = node.getChildren();
            expect(children).toHaveLength(0);
        });
    });

    describe('ManifestNode', () => {
        test('should set label to provided name', () => {
            const node = new ManifestNode('/path/to/ApplicationManifest.xml', 'ApplicationManifest.xml');
            expect(node.label).toBe('ApplicationManifest.xml');
        });

        test('should have command to open file', () => {
            const node = new ManifestNode('/path/to/manifest.xml', 'manifest.xml');
            expect(node.command).toBeDefined();
            expect(node.command!.command).toBe('vscode.open');
        });

        test('should not be collapsible', () => {
            const node = new ManifestNode('/path/to/manifest.xml', 'manifest.xml');
            expect(node.collapsibleState).toBe(vscode.TreeItemCollapsibleState.None);
        });

        test('should have manifest contextValue', () => {
            const node = new ManifestNode('/path/to/manifest.xml', 'manifest.xml');
            expect(node.contextValue).toBe('manifest');
        });
    });

    describe('ParameterFileNode', () => {
        const paramFile: ParameterFileInfo = mockProject.parameterFiles[0];

        test('should set label to file name', () => {
            const node = new ParameterFileNode(paramFile);
            expect(node.label).toBe('Cloud');
        });

        test('should show parameter count in description', () => {
            const node = new ParameterFileNode(paramFile);
            expect(node.description).toBe('2 param(s)');
        });

        test('should have command to open file', () => {
            const node = new ParameterFileNode(paramFile);
            expect(node.command).toBeDefined();
            expect(node.command!.command).toBe('vscode.open');
        });

        test('should have parameterFile contextValue', () => {
            const node = new ParameterFileNode(paramFile);
            expect(node.contextValue).toBe('parameterFile');
        });
    });

    describe('ProfileNode', () => {
        const profile: PublishProfileInfo = mockProject.profiles[0];

        test('should set label to profile name', () => {
            const node = new ProfileNode(profile);
            expect(node.label).toBe('Cloud');
        });

        test('should show endpoint in description', () => {
            const node = new ProfileNode(profile);
            expect(node.description).toBe('mycluster.azure.com:19000');
        });

        test('should show "no endpoint" when endpoint missing', () => {
            const noEndpoint: PublishProfileInfo = { name: 'Test', path: '/test.xml' };
            const node = new ProfileNode(noEndpoint);
            expect(node.description).toBe('no endpoint');
        });

        test('should have command to open file', () => {
            const node = new ProfileNode(profile);
            expect(node.command).toBeDefined();
            expect(node.command!.command).toBe('vscode.open');
        });

        test('should have publishProfile contextValue', () => {
            const node = new ProfileNode(profile);
            expect(node.contextValue).toBe('publishProfile');
        });
    });
});
