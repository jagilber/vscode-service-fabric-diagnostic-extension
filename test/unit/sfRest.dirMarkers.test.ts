/**
 * Unit tests for SfRest — uploadApplicationPackage _.dir marker file logic
 *
 * Validates that after uploading all application package files to the Image Store,
 * 0-byte _.dir marker files are created for each directory level. These markers
 * are required by the Service Fabric Image Store Service (fabric:ImageStore) to
 * recognize uploaded paths as directories during the provision process.
 *
 * Without _.dir markers, POST /ApplicationTypes/$/Provision fails with
 * FABRIC_E_DIRECTORY_NOT_FOUND even though the files are visible via GET /ImageStore.
 */

import * as vscode from 'vscode';
import { SfRest } from '../../src/sfRest';
import { createMockSfApi } from '../mocks/MockSfRestClient';

// Mock SDK
jest.mock('../../src/sdk/servicefabric/servicefabric/src/serviceFabricClientAPIs', () => ({
    ServiceFabricClientAPIs: jest.fn().mockImplementation(() => ({})),
}));

const mockUploadToImageStore = jest.fn().mockResolvedValue(undefined);
const mockUploadFileToImageStore = jest.fn().mockResolvedValue(undefined);

jest.mock('../../src/services/SfDirectRestClient', () => ({
    SfDirectRestClient: jest.fn().mockImplementation(() => ({
        uploadToImageStore: mockUploadToImageStore,
        uploadFileToImageStore: mockUploadFileToImageStore,
        getClusterVersion: jest.fn().mockResolvedValue({ version: '8.0.0' }),
    })),
}));

// Mock fs module for file scanning
const mockReaddirSync = jest.fn();
const mockStatSync = jest.fn();
const mockReadFileSync = jest.fn();
jest.mock('fs', () => ({
    readdirSync: (...args: any[]) => mockReaddirSync(...args),
    statSync: (...args: any[]) => mockStatSync(...args),
    readFileSync: (...args: any[]) => mockReadFileSync(...args),
    promises: {
        mkdir: jest.fn().mockResolvedValue(undefined),
        writeFile: jest.fn().mockResolvedValue(undefined),
        copyFile: jest.fn().mockResolvedValue(undefined),
        rm: jest.fn().mockResolvedValue(undefined),
    },
}));

// Mock path module to use posix-style paths for test consistency
jest.mock('path', () => {
    const actual = jest.requireActual('path');
    return {
        ...actual,
        join: (...args: string[]) => args.join('/').replace(/\\/g, '/'),
        relative: (from: string, to: string) => {
            // Simple relative path for tests
            const fromNorm = from.replace(/\\/g, '/').replace(/\/$/, '');
            const toNorm = to.replace(/\\/g, '/');
            if (toNorm.startsWith(fromNorm + '/')) {
                return toNorm.substring(fromNorm.length + 1);
            }
            return toNorm;
        },
        dirname: actual.dirname,
    };
});

/**
 * Helper: Set up mock filesystem structure for a typical SF application package.
 * Returns a function that readdirSync and statSync will use to simulate the directory tree.
 */
function setupMockPackage(basePath: string, structure: Record<string, number>) {
    // Build directory tree from flat file list
    const dirs = new Set<string>();
    dirs.add(basePath);
    const files: { path: string; size: number }[] = [];
    
    for (const [relPath, size] of Object.entries(structure)) {
        const fullPath = `${basePath}/${relPath}`;
        files.push({ path: fullPath, size });
        // Add parent directories
        const parts = relPath.split('/');
        for (let i = 1; i < parts.length; i++) {
            dirs.add(`${basePath}/${parts.slice(0, i).join('/')}`);
        }
    }
    
    mockReaddirSync.mockImplementation((dir: string) => {
        const dirNorm = dir.replace(/\\/g, '/');
        const children = new Set<string>();
        
        // Find immediate children of this directory
        for (const f of files) {
            if (f.path.startsWith(dirNorm + '/')) {
                const rest = f.path.substring(dirNorm.length + 1);
                const firstPart = rest.split('/')[0];
                children.add(firstPart);
            }
        }
        for (const d of dirs) {
            if (d.startsWith(dirNorm + '/')) {
                const rest = d.substring(dirNorm.length + 1);
                const firstPart = rest.split('/')[0];
                if (firstPart && !children.has(firstPart)) {
                    children.add(firstPart);
                }
            }
        }
        
        return Array.from(children).map(name => {
            const fullPath = `${dirNorm}/${name}`;
            const isDir = dirs.has(fullPath);
            return {
                name,
                isDirectory: () => isDir,
                isFile: () => !isDir,
            };
        });
    });
    
    mockStatSync.mockImplementation((filePath: string) => {
        const norm = filePath.replace(/\\/g, '/');
        const file = files.find(f => f.path === norm);
        return { size: file?.size || 0 };
    });
    
    return { files, dirs };
}

describe('SfRest — _.dir marker files in uploadApplicationPackage', () => {
    let sfRest: SfRest;

    beforeEach(() => {
        jest.clearAllMocks();
        const mockContext = new (vscode as any).ExtensionContext();
        sfRest = new SfRest(mockContext);
        (sfRest as any).sfApi = createMockSfApi();
        (sfRest as any).useDirectRest = true;
        (sfRest as any).directClient = {
            uploadToImageStore: mockUploadToImageStore,
            uploadFileToImageStore: mockUploadFileToImageStore,
            getClusterVersion: jest.fn().mockResolvedValue({ version: '8.0.0' }),
        };
        // Default to fabric:ImageStore (service-based)
        (sfRest as any).imageStoreConnectionString = 'fabric:ImageStore';
    });

    test('should upload _.dir markers for root and each subdirectory', async () => {
        setupMockPackage('/pkg', {
            'ApplicationManifest.xml': 2531,
            'SvcPkg/ServiceManifest.xml': 1123,
            'SvcPkg/Code.zip': 10000,
            'SvcPkg/Config.zip': 368,
        });

        await sfRest.uploadApplicationPackage('/pkg', 'MyApp');

        // Verify _.dir markers were uploaded as 0-byte buffers
        const markerCalls = mockUploadToImageStore.mock.calls.filter(
            (call: any[]) => call[0].endsWith('/_.dir')
        );

        // Should have 2 markers: MyApp/_.dir and MyApp/SvcPkg/_.dir
        expect(markerCalls).toHaveLength(2);

        const markerPaths = markerCalls.map((call: any[]) => call[0]).sort();
        expect(markerPaths).toEqual(['MyApp/SvcPkg/_.dir', 'MyApp/_.dir']);

        // Each marker should be a 0-byte Buffer
        for (const call of markerCalls) {
            expect(Buffer.isBuffer(call[1])).toBe(true);
            expect(call[1].length).toBe(0);
        }
    });

    test('should upload markers for deeply nested directories', async () => {
        setupMockPackage('/pkg', {
            'ApplicationManifest.xml': 100,
            'PkgA/ServiceManifest.xml': 100,
            'PkgA/Code.zip': 5000,
            'PkgB/ServiceManifest.xml': 100,
            'PkgB/Code.zip': 5000,
        });

        await sfRest.uploadApplicationPackage('/pkg', 'VotingType');

        const markerPaths = mockUploadToImageStore.mock.calls
            .filter((call: any[]) => call[0].endsWith('/_.dir'))
            .map((call: any[]) => call[0])
            .sort();

        // Root + 2 service packages = 3 markers
        expect(markerPaths).toEqual([
            'VotingType/PkgA/_.dir',
            'VotingType/PkgB/_.dir',
            'VotingType/_.dir',
        ]);
    });

    test('should NOT upload _.dir markers for file-based image store', async () => {
        (sfRest as any).imageStoreConnectionString = 'file:C:\\SfDevCluster\\Data\\ImageStore';

        setupMockPackage('/pkg', {
            'ApplicationManifest.xml': 100,
            'SvcPkg/Code.zip': 5000,
        });

        await sfRest.uploadApplicationPackage('/pkg', 'MyApp');

        const markerCalls = mockUploadToImageStore.mock.calls.filter(
            (call: any[]) => call[0].endsWith('/_.dir')
        );

        // No markers for file-based image store
        expect(markerCalls).toHaveLength(0);
    });

    test('should handle package with no subdirectories (only root)', async () => {
        setupMockPackage('/pkg', {
            'ApplicationManifest.xml': 100,
        });

        await sfRest.uploadApplicationPackage('/pkg', 'SimpleApp');

        const markerPaths = mockUploadToImageStore.mock.calls
            .filter((call: any[]) => call[0].endsWith('/_.dir'))
            .map((call: any[]) => call[0]);

        // Only root marker
        expect(markerPaths).toEqual(['SimpleApp/_.dir']);
    });

    test('should not create duplicate markers for shared directory levels', async () => {
        setupMockPackage('/pkg', {
            'ApplicationManifest.xml': 100,
            'PkgA/ServiceManifest.xml': 100,
            'PkgA/Code.zip': 5000,
            'PkgA/Config.zip': 368,
        });

        await sfRest.uploadApplicationPackage('/pkg', 'MyApp');

        const markerPaths = mockUploadToImageStore.mock.calls
            .filter((call: any[]) => call[0].endsWith('/_.dir'))
            .map((call: any[]) => call[0]);

        // Should deduplicate: MyApp/_.dir and MyApp/PkgA/_.dir (no duplicates)
        expect(markerPaths).toHaveLength(2);
        expect(new Set(markerPaths).size).toBe(2);
    });

    test('should upload markers AFTER all files are uploaded', async () => {
        setupMockPackage('/pkg', {
            'ApplicationManifest.xml': 100,
            'SvcPkg/Code.zip': 5000,
        });

        const callOrder: string[] = [];
        mockUploadFileToImageStore.mockImplementation((path: string) => {
            callOrder.push(`file:${path}`);
            return Promise.resolve();
        });
        mockUploadToImageStore.mockImplementation((path: string) => {
            callOrder.push(`upload:${path}`);
            return Promise.resolve();
        });

        await sfRest.uploadApplicationPackage('/pkg', 'MyApp');

        // Find indices of last file upload and first marker upload
        const lastFileIdx = callOrder.reduce((max, item, idx) =>
            item.startsWith('file:') ? idx : max, -1);
        const firstMarkerIdx = callOrder.findIndex(item =>
            item.includes('_.dir'));

        expect(lastFileIdx).toBeGreaterThanOrEqual(0);
        expect(firstMarkerIdx).toBeGreaterThan(lastFileIdx);
    });

    test('should match the structure created by native Copy-ServiceFabricApplicationPackage', async () => {
        // Simulates the exact VotingType package structure that was tested
        setupMockPackage('/pkg/Debug', {
            'ApplicationManifest.xml': 2531,
            'VotingDataPkg/ServiceManifest.xml': 1123,
            'VotingDataPkg/Code.zip': 10304030,
            'VotingDataPkg/Config.zip': 368,
            'VotingWebPkg/ServiceManifest.xml': 1662,
            'VotingWebPkg/Code.zip': 12495347,
            'VotingWebPkg/Config.zip': 368,
        });

        await sfRest.uploadApplicationPackage('/pkg/Debug', 'VotingType');

        const markerPaths = mockUploadToImageStore.mock.calls
            .filter((call: any[]) => call[0].endsWith('/_.dir'))
            .map((call: any[]) => call[0])
            .sort();

        // Should match exactly what the native SF PowerShell creates:
        // VotingType/_.dir, VotingType/VotingDataPkg/_.dir, VotingType/VotingWebPkg/_.dir
        expect(markerPaths).toEqual([
            'VotingType/VotingDataPkg/_.dir',
            'VotingType/VotingWebPkg/_.dir',
            'VotingType/_.dir',
        ]);
    });
});
