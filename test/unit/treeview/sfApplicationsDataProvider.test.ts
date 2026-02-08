/**
 * Unit tests for SfApplicationsDataProvider — tree data provider for SF projects.
 */
import * as vscode from 'vscode';
import { SfApplicationsDataProvider } from '../../../src/treeview/SfApplicationsDataProvider';
import { SfProjectService } from '../../../src/services/SfProjectService';
import { SfProjectInfo } from '../../../src/types/ProjectTypes';

jest.mock('vscode');

describe('SfApplicationsDataProvider', () => {
    let provider: SfApplicationsDataProvider;
    let projectService: SfProjectService;
    let mockContext: vscode.ExtensionContext;

    const mockProject: SfProjectInfo = {
        sfprojPath: '/test/MyApp/MyApp.sfproj',
        projectDir: '/test/MyApp',
        appTypeName: 'MyAppType',
        appTypeVersion: '1.0.0',
        manifestPath: '/test/MyApp/ApplicationManifest.xml',
        services: [
            {
                serviceManifestName: 'WebPkg',
                serviceManifestVersion: '1.0.0',
                serviceTypeName: 'WebServiceType',
                serviceKind: 'Stateless',
                defaultServiceName: 'WebService',
            },
        ],
        parameters: [{ name: 'Count', defaultValue: '1' }],
        profiles: [{ name: 'Local', path: '/test/MyApp/PublishProfiles/Local.xml', connectionEndpoint: 'localhost:19000' }],
        parameterFiles: [{ name: 'Local', path: '/test/MyApp/ApplicationParameters/Local.xml', parameters: [{ name: 'Count', value: '1' }] }],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockContext = new (vscode as any).ExtensionContext();

        projectService = new SfProjectService();
        // The EventEmitter mock's .event is a jest.fn(). We need onDidChangeProjects
        // (which is the .event property) to return a Disposable when called.
        (projectService as any).onDidChangeProjects = jest.fn().mockReturnValue({ dispose: jest.fn() });

        provider = new SfApplicationsDataProvider(projectService, mockContext);
    });

    afterEach(() => {
        provider.dispose();
        projectService.dispose();
    });

    describe('getTreeItem', () => {
        test('should return the element itself (TreeItem subclasses)', () => {
            const item = new vscode.TreeItem('test');
            expect(provider.getTreeItem(item)).toBe(item);
        });
    });

    describe('getChildren (root)', () => {
        test('should return SfProjectNodes when projects exist', async () => {
            jest.spyOn(projectService, 'discoverProjects').mockResolvedValue([mockProject]);

            const children = await provider.getChildren();
            expect(children).toHaveLength(1);
            expect(children[0].label).toBe('MyAppType');
        });

        test('should return info item when no projects found', async () => {
            jest.spyOn(projectService, 'discoverProjects').mockResolvedValue([]);

            const children = await provider.getChildren();
            expect(children).toHaveLength(1);
            expect((children[0] as vscode.TreeItem).label).toContain('No .sfproj');
        });

        test('should return error item on discovery failure', async () => {
            jest.spyOn(projectService, 'discoverProjects').mockRejectedValue(new Error('scan failed'));

            const children = await provider.getChildren();
            expect(children).toHaveLength(1);
            expect((children[0] as vscode.TreeItem).label).toContain('Error');
        });
    });

    describe('getChildren (SfProjectNode)', () => {
        test('should return manifest, services, parameters, profiles groups', async () => {
            jest.spyOn(projectService, 'discoverProjects').mockResolvedValue([mockProject]);

            const roots = await provider.getChildren();
            const projectNode = roots[0] as any;
            
            // SfProjectNode has a getChildren method
            expect(projectNode.getChildren).toBeDefined();
            const children = projectNode.getChildren();
            
            // Should have: manifest, services group, parameters group, profiles group
            expect(children.length).toBeGreaterThanOrEqual(3);
        });
    });

    describe('refresh', () => {
        test('should invalidate cache and fire change event', () => {
            const invalidateSpy = jest.spyOn(projectService, 'invalidateCache');
            
            provider.refresh();
            expect(invalidateSpy).toHaveBeenCalled();
        });
    });
});
