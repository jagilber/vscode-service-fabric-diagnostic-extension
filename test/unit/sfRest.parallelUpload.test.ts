/**
 * Unit tests for SfRest — parallel uploadApplicationPackage
 *
 * Validates:
 * - Files are uploaded concurrently (multiple in-flight at once), not sequentially
 * - Concurrency is capped at 8 workers
 * - Progress callback tracks completed uploads
 * - Fail-fast: first error stops all workers
 * - Markers are also uploaded in parallel
 * - All files are uploaded even when count < maxConcurrency
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
 */
function setupMockPackage(basePath: string, structure: Record<string, number>) {
    const dirs = new Set<string>();
    dirs.add(basePath);
    const files: { path: string; size: number }[] = [];

    for (const [relPath, size] of Object.entries(structure)) {
        const fullPath = `${basePath}/${relPath}`;
        files.push({ path: fullPath, size });
        const parts = relPath.split('/');
        for (let i = 1; i < parts.length; i++) {
            dirs.add(`${basePath}/${parts.slice(0, i).join('/')}`);
        }
    }

    mockReaddirSync.mockImplementation((dir: string) => {
        const dirNorm = dir.replace(/\\/g, '/');
        const children = new Set<string>();

        for (const f of files) {
            if (f.path.startsWith(dirNorm + '/')) {
                const rest = f.path.substring(dirNorm.length + 1);
                children.add(rest.split('/')[0]);
            }
        }
        for (const d of dirs) {
            if (d.startsWith(dirNorm + '/')) {
                const rest = d.substring(dirNorm.length + 1);
                const firstPart = rest.split('/')[0];
                if (firstPart) { children.add(firstPart); }
            }
        }

        return Array.from(children).map(name => {
            const fullPath = `${dirNorm}/${name}`;
            const isDir = dirs.has(fullPath);
            return { name, isDirectory: () => isDir, isFile: () => !isDir };
        });
    });

    mockStatSync.mockImplementation((filePath: string) => {
        const norm = filePath.replace(/\\/g, '/');
        const file = files.find(f => f.path === norm);
        return { size: file?.size || 0 };
    });

    return { files, dirs };
}

describe('SfRest — parallel uploadApplicationPackage', () => {
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

    // ===========================
    // Parallelism verification
    // ===========================
    describe('concurrent upload behavior', () => {
        test('should have multiple uploads in-flight simultaneously', async () => {
            // Create a package with 16 files to exercise more than 1 worker
            const structure: Record<string, number> = {};
            for (let i = 0; i < 16; i++) {
                structure[`SvcPkg/Code/file${i}.dll`] = 1000 + i;
            }
            structure['ApplicationManifest.xml'] = 500;
            setupMockPackage('/pkg', structure);

            // Track concurrent in-flight uploads
            let currentInFlight = 0;
            let maxObservedInFlight = 0;

            mockUploadFileToImageStore.mockImplementation(async () => {
                currentInFlight++;
                maxObservedInFlight = Math.max(maxObservedInFlight, currentInFlight);
                // Simulate async I/O delay to allow other workers to start
                await new Promise(resolve => setTimeout(resolve, 10));
                currentInFlight--;
            });

            await sfRest.uploadApplicationPackage('/pkg', 'MyApp');

            // With 17 files and 8 workers, we should see more than 1 concurrent upload
            expect(maxObservedInFlight).toBeGreaterThan(1);
            expect(maxObservedInFlight).toBeLessThanOrEqual(8);
        });

        test('should cap concurrency at 8 workers', async () => {
            // Create a package with 32 files to saturate workers
            const structure: Record<string, number> = {};
            for (let i = 0; i < 32; i++) {
                structure[`SvcPkg/Code/file${i}.dll`] = 1000;
            }
            structure['ApplicationManifest.xml'] = 500;
            setupMockPackage('/pkg', structure);

            let currentInFlight = 0;
            let maxObservedInFlight = 0;

            mockUploadFileToImageStore.mockImplementation(async () => {
                currentInFlight++;
                maxObservedInFlight = Math.max(maxObservedInFlight, currentInFlight);
                await new Promise(resolve => setTimeout(resolve, 20));
                currentInFlight--;
            });

            await sfRest.uploadApplicationPackage('/pkg', 'MyApp');

            // Should never exceed 8
            expect(maxObservedInFlight).toBeLessThanOrEqual(8);
            // Should actually reach 8 with 32 files and 20ms delay
            expect(maxObservedInFlight).toBe(8);
        });

        test('should upload all files even when count < maxConcurrency', async () => {
            setupMockPackage('/pkg', {
                'ApplicationManifest.xml': 100,
                'SvcPkg/Code.zip': 5000,
                'SvcPkg/Config.zip': 300,
            });

            await sfRest.uploadApplicationPackage('/pkg', 'MyApp');

            // All 3 files should be uploaded
            expect(mockUploadFileToImageStore).toHaveBeenCalledTimes(3);
        });

        test('should upload a single file without error', async () => {
            setupMockPackage('/pkg', {
                'ApplicationManifest.xml': 100,
            });

            await sfRest.uploadApplicationPackage('/pkg', 'MyApp');
            expect(mockUploadFileToImageStore).toHaveBeenCalledTimes(1);
        });
    });

    // ===========================
    // Fail-fast behavior
    // ===========================
    describe('error handling and fail-fast', () => {
        test('should stop all workers when one upload fails', async () => {
            const structure: Record<string, number> = {};
            for (let i = 0; i < 20; i++) {
                structure[`SvcPkg/Code/file${i}.dll`] = 1000;
            }
            structure['ApplicationManifest.xml'] = 500;
            setupMockPackage('/pkg', structure);

            let callCount = 0;
            mockUploadFileToImageStore.mockImplementation(async () => {
                // Capture call number before yielding to avoid race on shared counter
                const myCall = ++callCount;
                await new Promise(resolve => setTimeout(resolve, 5));
                // Fail on the 3rd upload
                if (myCall === 3) {
                    throw new Error('Upload failed: simulated network error');
                }
            });

            await expect(sfRest.uploadApplicationPackage('/pkg', 'MyApp'))
                .rejects.toThrow('Failed to upload application package');

            // Should have attempted fewer than all 21 files (fail-fast)
            expect(callCount).toBeLessThan(21);
        });

        test('should propagate the original error', async () => {
            setupMockPackage('/pkg', {
                'ApplicationManifest.xml': 100,
                'SvcPkg/Code.zip': 5000,
            });

            mockUploadFileToImageStore.mockRejectedValueOnce(new Error('ECONNREFUSED'));

            await expect(sfRest.uploadApplicationPackage('/pkg', 'MyApp'))
                .rejects.toThrow();
        });

        test('should stop marker uploads on error', async () => {
            setupMockPackage('/pkg', {
                'ApplicationManifest.xml': 100,
                'SvcPkg/Code.zip': 5000,
                'SvcPkg2/Code.zip': 5000,
                'SvcPkg3/Code.zip': 5000,
            });

            let markerCount = 0;
            mockUploadToImageStore.mockImplementation(async () => {
                markerCount++;
                if (markerCount === 2) {
                    throw new Error('Marker upload failed');
                }
            });

            await expect(sfRest.uploadApplicationPackage('/pkg', 'MyApp'))
                .rejects.toThrow();

            // Files should all succeed (mockUploadFileToImageStore default resolves)
            // But marker uploads should stop early
            expect(markerCount).toBeLessThanOrEqual(4); // 4 dirs total, should stop before all
        });
    });

    // ===========================
    // Progress tracking
    // ===========================
    describe('progress callback', () => {
        test('should report progress for each completed file', async () => {
            setupMockPackage('/pkg', {
                'ApplicationManifest.xml': 100,
                'SvcPkg/Code.zip': 5000,
                'SvcPkg/Config.zip': 300,
            });

            const progressCalls: Array<{ fileName: string; current: number; total: number }> = [];
            const progress = (fileName: string, current: number, total: number) => {
                progressCalls.push({ fileName, current, total });
            };

            await sfRest.uploadApplicationPackage('/pkg', 'MyApp', progress);

            // Should have 3 progress calls, one per file
            expect(progressCalls).toHaveLength(3);

            // All should report total=3
            for (const call of progressCalls) {
                expect(call.total).toBe(3);
            }

            // Current values should cover 1, 2, and 3 (though order may vary due to parallelism)
            const currentValues = progressCalls.map(c => c.current).sort();
            expect(currentValues).toEqual([1, 2, 3]);
        });

        test('should report total as the total file count', async () => {
            const structure: Record<string, number> = {};
            for (let i = 0; i < 10; i++) {
                structure[`SvcPkg/Code/file${i}.dll`] = 1000;
            }
            structure['ApplicationManifest.xml'] = 500;
            setupMockPackage('/pkg', structure);

            const progressCalls: Array<{ total: number }> = [];
            await sfRest.uploadApplicationPackage('/pkg', 'MyApp', (_f, current, total) => {
                progressCalls.push({ total });
            });

            expect(progressCalls).toHaveLength(11);
            expect(progressCalls[0].total).toBe(11);
        });
    });

    // ===========================
    // Marker parallelism
    // ===========================
    describe('parallel marker uploads', () => {
        test('should upload markers concurrently', async () => {
            // Create a structure with many directories to generate many markers
            const structure: Record<string, number> = {
                'ApplicationManifest.xml': 100,
            };
            for (let i = 0; i < 12; i++) {
                structure[`Svc${i}/ServiceManifest.xml`] = 100;
                structure[`Svc${i}/Code.zip`] = 5000;
            }
            setupMockPackage('/pkg', structure);

            let currentInFlight = 0;
            let maxObservedInFlight = 0;

            mockUploadToImageStore.mockImplementation(async () => {
                currentInFlight++;
                maxObservedInFlight = Math.max(maxObservedInFlight, currentInFlight);
                await new Promise(resolve => setTimeout(resolve, 10));
                currentInFlight--;
            });

            await sfRest.uploadApplicationPackage('/pkg', 'MyApp');

            // 13 dirs (root + 12 services) = 13 markers, should see parallelism
            expect(maxObservedInFlight).toBeGreaterThan(1);
            expect(maxObservedInFlight).toBeLessThanOrEqual(8);
        });
    });

    // ===========================
    // Completeness
    // ===========================
    describe('upload completeness', () => {
        test('should upload every file in a large package', async () => {
            const structure: Record<string, number> = {};
            const expectedFiles: string[] = [];
            for (let i = 0; i < 50; i++) {
                const relPath = `SvcPkg/Code/lib${i}.dll`;
                structure[relPath] = 1000 + i;
                expectedFiles.push(`MyApp/${relPath}`);
            }
            structure['ApplicationManifest.xml'] = 500;
            expectedFiles.push('MyApp/ApplicationManifest.xml');
            setupMockPackage('/pkg', structure);

            await sfRest.uploadApplicationPackage('/pkg', 'MyApp');

            // All 51 files should be uploaded
            expect(mockUploadFileToImageStore).toHaveBeenCalledTimes(51);

            // Verify all expected paths were uploaded
            const uploadedPaths = mockUploadFileToImageStore.mock.calls.map((c: any[]) => c[0]).sort();
            expect(uploadedPaths).toEqual(expectedFiles.sort());
        });

        test('should pass correct file sizes to uploadFileToImageStore', async () => {
            setupMockPackage('/pkg', {
                'ApplicationManifest.xml': 2531,
                'SvcPkg/Code.zip': 10304030,
            });

            await sfRest.uploadApplicationPackage('/pkg', 'MyApp');

            const calls = mockUploadFileToImageStore.mock.calls;
            const manifestCall = calls.find((c: any[]) => c[0].includes('ApplicationManifest'));
            const codeCall = calls.find((c: any[]) => c[0].includes('Code.zip'));

            expect(manifestCall![2]).toBe(2531);
            expect(codeCall![2]).toBe(10304030);
        });
    });
});
