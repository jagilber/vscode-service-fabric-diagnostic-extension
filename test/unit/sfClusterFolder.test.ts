/**
 * Unit tests for SfClusterFolder
 */
import { SfClusterFolder } from '../../src/sfClusterFolder';
import { SfUtility } from '../../src/sfUtility';

// Mock fs module
jest.mock('fs');

describe('SfClusterFolder', () => {
    let mockContext: any;
    let folder: SfClusterFolder;

    beforeEach(() => {
        mockContext = {
            extensionPath: '/mock/path',
            extensionUri: { fsPath: '/mock/extension' },
            globalStorageUri: { fsPath: '/mock/storage' },
            subscriptions: [],
            globalState: { get: jest.fn(), update: jest.fn(), keys: jest.fn().mockReturnValue([]) },
            workspaceState: { get: jest.fn(), update: jest.fn(), keys: jest.fn().mockReturnValue([]) },
        };

        folder = new SfClusterFolder(mockContext);
    });

    test('should initialize with global storage path', () => {
        expect(folder.globalStorage).toBeDefined();
    });

    test('should create cluster folder structure', () => {
        const createFolderSpy = jest.spyOn(SfUtility, 'createFolder').mockReturnValue('/test');
        const createFileSpy = jest.spyOn(SfUtility, 'createFile').mockImplementation();

        folder.createClusterFolder('testCluster');

        // Should create main cluster folder + 3 subfolders
        expect(createFolderSpy).toHaveBeenCalledTimes(4);
        // Should create 3 default files (manifest, jobs, events)
        expect(createFileSpy).toHaveBeenCalledTimes(3);

        createFolderSpy.mockRestore();
        createFileSpy.mockRestore();
    });

    test('should add application file', () => {
        const createFileSpy = jest.spyOn(SfUtility, 'createFile').mockImplementation();
        folder.applicationFolder = '/mock/apps';

        folder.addApplicationFile('MyApp', 'data');
        expect(createFileSpy).toHaveBeenCalledWith('/mock/apps\\MyApp', 'data');

        createFileSpy.mockRestore();
    });

    test('should add node file', () => {
        const createFileSpy = jest.spyOn(SfUtility, 'createFile').mockImplementation();
        folder.nodeFolder = '/mock/nodes';

        folder.addNodeFile('Node0', 'data');
        expect(createFileSpy).toHaveBeenCalledWith('/mock/nodes\\Node0', 'data');

        createFileSpy.mockRestore();
    });

    test('should add system service file', () => {
        const createFileSpy = jest.spyOn(SfUtility, 'createFile').mockImplementation();
        folder.systemFolder = '/mock/system';

        folder.addSystemServiceFile('NamingService', 'data');
        expect(createFileSpy).toHaveBeenCalledWith('/mock/system\\NamingService', 'data');

        createFileSpy.mockRestore();
    });

    test('should add cluster file', () => {
        const createFileSpy = jest.spyOn(SfUtility, 'createFile').mockImplementation();
        folder.clusterFolder = '/mock/cluster';

        folder.addClusterFile('config.json', '{}');
        expect(createFileSpy).toHaveBeenCalledWith('/mock/cluster\\config.json', '{}');

        createFileSpy.mockRestore();
    });
});
