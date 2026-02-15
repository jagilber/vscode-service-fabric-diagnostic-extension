/**
 * Tests for PackageCompressor utility.
 * 
 * Uses real filesystem (temp dirs) to validate zip creation, compression,
 * and the full compressApplicationPackage workflow.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as zlib from 'zlib';
import {
    compressApplicationPackage,
    isPackageCompressed,
    cleanupCompressedPackage,
} from '../../../src/utils/PackageCompressor';

/** Create a unique temp directory for each test */
function makeTempDir(prefix: string): string {
    return fs.mkdtempSync(path.join(os.tmpdir(), `sf-test-${prefix}-`));
}

/**
 * Build a realistic SF application package directory structure:
 * 
 *   AppPkg/
 *     ApplicationManifest.xml
 *     SvcPkg/
 *       ServiceManifest.xml
 *       Code/
 *         file1.dll
 *         file2.dll
 *       Config/
 *         Settings.xml
 */
function buildMockPackage(root: string, opts?: {
    servicePackages?: string[];
    codeFiles?: number;
    fileSize?: number;
}): void {
    const svcPkgs = opts?.servicePackages ?? ['WebSvcPkg'];
    const numCodeFiles = opts?.codeFiles ?? 3;
    const fileSize = opts?.fileSize ?? 1024;

    // ApplicationManifest.xml
    fs.writeFileSync(
        path.join(root, 'ApplicationManifest.xml'),
        '<ApplicationManifest xmlns="http://schemas.microsoft.com/2011/01/fabric" ApplicationTypeName="TestApp" ApplicationTypeVersion="1.0.0"/>'
    );

    for (const svc of svcPkgs) {
        const svcDir = path.join(root, svc);
        fs.mkdirSync(svcDir, { recursive: true });

        // ServiceManifest.xml
        fs.writeFileSync(
            path.join(svcDir, 'ServiceManifest.xml'),
            `<ServiceManifest xmlns="http://schemas.microsoft.com/2011/01/fabric" Name="${svc}" Version="1.0.0"/>`
        );

        // Code/ directory with files
        const codeDir = path.join(svcDir, 'Code');
        fs.mkdirSync(codeDir, { recursive: true });
        for (let i = 1; i <= numCodeFiles; i++) {
            fs.writeFileSync(path.join(codeDir, `file${i}.dll`), Buffer.alloc(fileSize, i));
        }

        // Config/ directory
        const configDir = path.join(svcDir, 'Config');
        fs.mkdirSync(configDir, { recursive: true });
        fs.writeFileSync(path.join(configDir, 'Settings.xml'), '<Settings/>');
    }
}

/** Read a ZIP and return parsed local file headers */
function parseZipEntries(zipPath: string): { name: string; compressedSize: number; uncompressedSize: number }[] {
    const buf = fs.readFileSync(zipPath);
    const entries: { name: string; compressedSize: number; uncompressedSize: number }[] = [];
    let offset = 0;

    while (offset < buf.length) {
        const sig = buf.readUInt32LE(offset);
        if (sig !== 0x04034b50) { break; } // Not a local file header

        const compressedSize = buf.readUInt32LE(offset + 18);
        const uncompressedSize = buf.readUInt32LE(offset + 22);
        const nameLen = buf.readUInt16LE(offset + 26);
        const extraLen = buf.readUInt16LE(offset + 28);
        const name = buf.slice(offset + 30, offset + 30 + nameLen).toString('utf8');

        entries.push({ name, compressedSize, uncompressedSize });
        offset += 30 + nameLen + extraLen + compressedSize;
    }

    return entries;
}

/** Decompress a single file from a zip by entry name */
function extractFileFromZip(zipPath: string, entryName: string): Buffer | null {
    const buf = fs.readFileSync(zipPath);
    let offset = 0;

    while (offset < buf.length) {
        const sig = buf.readUInt32LE(offset);
        if (sig !== 0x04034b50) { break; }

        const method = buf.readUInt16LE(offset + 8);
        const compressedSize = buf.readUInt32LE(offset + 18);
        const nameLen = buf.readUInt16LE(offset + 26);
        const extraLen = buf.readUInt16LE(offset + 28);
        const name = buf.slice(offset + 30, offset + 30 + nameLen).toString('utf8');
        const dataStart = offset + 30 + nameLen + extraLen;

        if (name === entryName) {
            const compressedData = buf.slice(dataStart, dataStart + compressedSize);
            if (method === 8) { // DEFLATE
                return zlib.inflateRawSync(compressedData);
            }
            return compressedData; // STORE
        }

        offset = dataStart + compressedSize;
    }

    return null;
}

describe('PackageCompressor', () => {
    let tempDirs: string[] = [];

    afterEach(() => {
        // Clean up all temp dirs created during the test
        for (const dir of tempDirs) {
            try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* ignore */ }
        }
        tempDirs = [];
    });

    function trackTempDir(prefix: string): string {
        const dir = makeTempDir(prefix);
        tempDirs.push(dir);
        return dir;
    }

    describe('compressApplicationPackage', () => {
        it('compresses Code and Config dirs into zip files', async () => {
            const pkgDir = trackTempDir('compress-basic');
            buildMockPackage(pkgDir);

            const result = await compressApplicationPackage(pkgDir);
            tempDirs.push(result.compressedPath);

            // Verify result structure
            expect(result.compressedPath).toBeTruthy();
            expect(result.originalFileCount).toBeGreaterThan(result.compressedFileCount);
            expect(result.savedBytes).toBeGreaterThanOrEqual(0);

            // ApplicationManifest.xml should be copied as-is
            const manifestPath = path.join(result.compressedPath, 'ApplicationManifest.xml');
            expect(fs.existsSync(manifestPath)).toBe(true);

            // ServiceManifest.xml should be copied as-is
            const svcManifest = path.join(result.compressedPath, 'WebSvcPkg', 'ServiceManifest.xml');
            expect(fs.existsSync(svcManifest)).toBe(true);

            // Code/ and Config/ dirs should be replaced by .zip files
            const svcDir = path.join(result.compressedPath, 'WebSvcPkg');
            expect(fs.existsSync(path.join(svcDir, 'Code.zip'))).toBe(true);
            expect(fs.existsSync(path.join(svcDir, 'Config.zip'))).toBe(true);

            // Original Code/ and Config/ dirs should NOT exist in compressed output
            expect(fs.existsSync(path.join(svcDir, 'Code'))).toBe(false);
            expect(fs.existsSync(path.join(svcDir, 'Config'))).toBe(false);
        });

        it('produces valid zip files that can be decompressed', async () => {
            const pkgDir = trackTempDir('compress-valid');
            buildMockPackage(pkgDir, { codeFiles: 5, fileSize: 2048 });

            const result = await compressApplicationPackage(pkgDir);
            tempDirs.push(result.compressedPath);

            const codeZipPath = path.join(result.compressedPath, 'WebSvcPkg', 'Code.zip');
            const entries = parseZipEntries(codeZipPath);

            // Should have 5 files in Code.zip
            expect(entries).toHaveLength(5);
            expect(entries.map(e => e.name).sort()).toEqual([
                'file1.dll', 'file2.dll', 'file3.dll', 'file4.dll', 'file5.dll',
            ]);

            // Each file should decompress to the original content
            for (let i = 1; i <= 5; i++) {
                const decompressed = extractFileFromZip(codeZipPath, `file${i}.dll`);
                expect(decompressed).not.toBeNull();
                expect(decompressed!.length).toBe(2048);
                // Original was filled with byte value = i
                expect(decompressed![0]).toBe(i);
                expect(decompressed![2047]).toBe(i);
            }
        });

        it('handles multiple service packages', async () => {
            const pkgDir = trackTempDir('compress-multi');
            buildMockPackage(pkgDir, { servicePackages: ['WebPkg', 'DataPkg', 'GatewayPkg'] });

            const result = await compressApplicationPackage(pkgDir);
            tempDirs.push(result.compressedPath);

            for (const svc of ['WebPkg', 'DataPkg', 'GatewayPkg']) {
                expect(fs.existsSync(path.join(result.compressedPath, svc, 'Code.zip'))).toBe(true);
                expect(fs.existsSync(path.join(result.compressedPath, svc, 'Config.zip'))).toBe(true);
                expect(fs.existsSync(path.join(result.compressedPath, svc, 'ServiceManifest.xml'))).toBe(true);
            }

            // ApplicationManifest.xml
            expect(fs.existsSync(path.join(result.compressedPath, 'ApplicationManifest.xml'))).toBe(true);
        });

        it('reports progress callbacks', async () => {
            const pkgDir = trackTempDir('compress-progress');
            buildMockPackage(pkgDir);

            const messages: string[] = [];
            const result = await compressApplicationPackage(pkgDir, (msg) => messages.push(msg));
            tempDirs.push(result.compressedPath);

            expect(messages.length).toBeGreaterThan(0);
            expect(messages.some(m => m.includes('Compressing'))).toBe(true);
        });

        it('preserves files in nested Code subdirectories', async () => {
            const pkgDir = trackTempDir('compress-nested');
            buildMockPackage(pkgDir);

            // Add a nested subdirectory inside Code/
            const nestedDir = path.join(pkgDir, 'WebSvcPkg', 'Code', 'subdir');
            fs.mkdirSync(nestedDir, { recursive: true });
            fs.writeFileSync(path.join(nestedDir, 'nested.dll'), Buffer.alloc(512, 0xAB));

            const result = await compressApplicationPackage(pkgDir);
            tempDirs.push(result.compressedPath);

            const codeZipPath = path.join(result.compressedPath, 'WebSvcPkg', 'Code.zip');
            const entries = parseZipEntries(codeZipPath);

            // Should contain the nested file with forward-slash path
            const nestedEntry = entries.find(e => e.name === 'subdir/nested.dll');
            expect(nestedEntry).toBeDefined();
            expect(nestedEntry!.uncompressedSize).toBe(512);

            // Verify nested file decompresses correctly
            const decompressed = extractFileFromZip(codeZipPath, 'subdir/nested.dll');
            expect(decompressed).not.toBeNull();
            expect(decompressed![0]).toBe(0xAB);
        });

        it('handles empty compressible directories', async () => {
            const pkgDir = trackTempDir('compress-empty');
            fs.writeFileSync(
                path.join(pkgDir, 'ApplicationManifest.xml'),
                '<ApplicationManifest/>'
            );

            const svcDir = path.join(pkgDir, 'EmptySvc');
            fs.mkdirSync(svcDir, { recursive: true });
            fs.writeFileSync(path.join(svcDir, 'ServiceManifest.xml'), '<ServiceManifest/>');

            // Create empty Code/ directory
            fs.mkdirSync(path.join(svcDir, 'Code'), { recursive: true });

            const result = await compressApplicationPackage(pkgDir);
            tempDirs.push(result.compressedPath);

            // Should create a valid (empty) zip even for empty dirs
            const codeZipPath = path.join(result.compressedPath, 'EmptySvc', 'Code.zip');
            expect(fs.existsSync(codeZipPath)).toBe(true);

            const entries = parseZipEntries(codeZipPath);
            expect(entries).toHaveLength(0);
        });

        it('copies non-compressible subdirectories as-is', async () => {
            const pkgDir = trackTempDir('compress-other');
            buildMockPackage(pkgDir);

            // Add a non-standard directory (not Code/Config/Data)
            const customDir = path.join(pkgDir, 'WebSvcPkg', 'Extensions');
            fs.mkdirSync(customDir, { recursive: true });
            fs.writeFileSync(path.join(customDir, 'plugin.dll'), Buffer.alloc(256, 0x42));

            const result = await compressApplicationPackage(pkgDir);
            tempDirs.push(result.compressedPath);

            // The Extensions dir should be copied (not zipped)
            const copiedFile = path.join(result.compressedPath, 'WebSvcPkg', 'Extensions', 'plugin.dll');
            expect(fs.existsSync(copiedFile)).toBe(true);
            const content = fs.readFileSync(copiedFile);
            expect(content.length).toBe(256);
            expect(content[0]).toBe(0x42);
        });

        it('reduces file count significantly', async () => {
            const pkgDir = trackTempDir('compress-count');
            buildMockPackage(pkgDir, {
                servicePackages: ['WebPkg', 'DataPkg'],
                codeFiles: 10,
            });

            const result = await compressApplicationPackage(pkgDir);
            tempDirs.push(result.compressedPath);

            // Original: 1 manifest + 2*(1 manifest + 10 code + 1 config) = 25 files
            expect(result.originalFileCount).toBe(25);
            // Compressed: 1 manifest + 2*(1 manifest + Code.zip + Config.zip) = 7 files
            expect(result.compressedFileCount).toBe(7);
        });
    });

    describe('isPackageCompressed', () => {
        it('returns false for uncompressed package', () => {
            const pkgDir = trackTempDir('iscomp-no');
            buildMockPackage(pkgDir);

            expect(isPackageCompressed(pkgDir)).toBe(false);
        });

        it('returns true for compressed package', async () => {
            const pkgDir = trackTempDir('iscomp-yes');
            buildMockPackage(pkgDir);

            const result = await compressApplicationPackage(pkgDir);
            tempDirs.push(result.compressedPath);

            expect(isPackageCompressed(result.compressedPath)).toBe(true);
        });

        it('returns false for package with no service packages', () => {
            const pkgDir = trackTempDir('iscomp-empty');
            fs.writeFileSync(path.join(pkgDir, 'ApplicationManifest.xml'), '<AM/>');

            expect(isPackageCompressed(pkgDir)).toBe(false);
        });
    });

    describe('cleanupCompressedPackage', () => {
        it('removes the compressed directory', async () => {
            const pkgDir = trackTempDir('cleanup-rm');
            buildMockPackage(pkgDir);

            const result = await compressApplicationPackage(pkgDir);
            expect(fs.existsSync(result.compressedPath)).toBe(true);

            cleanupCompressedPackage(result.compressedPath);
            expect(fs.existsSync(result.compressedPath)).toBe(false);
        });

        it('does not throw for non-existent path', () => {
            expect(() => {
                cleanupCompressedPackage(path.join(os.tmpdir(), 'sf-nonexistent-' + Date.now()));
            }).not.toThrow();
        });
    });

    describe('zip format validity', () => {
        it('contains valid EOCD signature', async () => {
            const pkgDir = trackTempDir('zip-eocd');
            buildMockPackage(pkgDir);

            const result = await compressApplicationPackage(pkgDir);
            tempDirs.push(result.compressedPath);

            const zipBuf = fs.readFileSync(
                path.join(result.compressedPath, 'WebSvcPkg', 'Code.zip')
            );

            // EOCD signature should be at the end of the file
            const eocdSig = 0x06054b50;
            // Search backwards for EOCD
            let foundEocd = false;
            for (let i = zipBuf.length - 22; i >= 0; i--) {
                if (zipBuf.readUInt32LE(i) === eocdSig) {
                    foundEocd = true;
                    break;
                }
            }
            expect(foundEocd).toBe(true);
        });

        it('has matching central directory entry count', async () => {
            const pkgDir = trackTempDir('zip-cd');
            buildMockPackage(pkgDir, { codeFiles: 4 });

            const result = await compressApplicationPackage(pkgDir);
            tempDirs.push(result.compressedPath);

            const zipBuf = fs.readFileSync(
                path.join(result.compressedPath, 'WebSvcPkg', 'Code.zip')
            );

            // Find EOCD and read entry count
            for (let i = zipBuf.length - 22; i >= 0; i--) {
                if (zipBuf.readUInt32LE(i) === 0x06054b50) {
                    const totalEntries = zipBuf.readUInt16LE(i + 10);
                    expect(totalEntries).toBe(4);
                    break;
                }
            }
        });

        it('uses forward slashes in zip entry paths', async () => {
            const pkgDir = trackTempDir('zip-slashes');
            buildMockPackage(pkgDir);

            // Add nested dirs to ensure slash conversion
            const nested = path.join(pkgDir, 'WebSvcPkg', 'Code', 'a', 'b');
            fs.mkdirSync(nested, { recursive: true });
            fs.writeFileSync(path.join(nested, 'deep.txt'), 'deep');

            const result = await compressApplicationPackage(pkgDir);
            tempDirs.push(result.compressedPath);

            const entries = parseZipEntries(
                path.join(result.compressedPath, 'WebSvcPkg', 'Code.zip')
            );

            const deepEntry = entries.find(e => e.name.includes('deep.txt'));
            expect(deepEntry).toBeDefined();
            expect(deepEntry!.name).toBe('a/b/deep.txt');
            expect(deepEntry!.name).not.toContain('\\');
        });
    });
});
