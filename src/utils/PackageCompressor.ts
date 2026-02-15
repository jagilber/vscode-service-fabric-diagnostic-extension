/**
 * Compresses a Service Fabric application package for faster upload.
 * 
 * Mirrors the behavior of `Copy-ServiceFabricApplicationPackage -CompressPackage`:
 * For each service package (VotingWebPkg, VotingDataPkg, etc.), zips the Code/,
 * Config/, and Data/ subdirectories into Code.zip, Config.zip, Data.zip.
 * ApplicationManifest.xml and ServiceManifest.xml files are NOT compressed.
 * 
 * Uses Node.js built-in zlib (no external zip library needed).
 */

import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import * as os from 'os';
import * as crypto from 'crypto';
import { SfUtility, debugLevel } from '../sfUtility';

/** Directories that SF compresses inside each service package */
const COMPRESSIBLE_DIRS = ['Code', 'Config', 'Data'];

/**
 * Compress an SF application package into a temp directory.
 * Returns the path to the compressed temp directory.
 * Caller is responsible for cleaning up via `cleanupCompressedPackage()`.
 */
export async function compressApplicationPackage(
    packagePath: string,
    progress?: (message: string) => void,
): Promise<{ compressedPath: string; originalFileCount: number; compressedFileCount: number; savedBytes: number }> {
    const startMs = Date.now();
    const tempDir = path.join(os.tmpdir(), `sf-compressed-${crypto.randomBytes(4).toString('hex')}`);
    fs.mkdirSync(tempDir, { recursive: true });

    let originalFileCount = 0;
    let compressedFileCount = 0;
    let originalBytes = 0;
    let compressedBytes = 0;

    const entries = fs.readdirSync(packagePath, { withFileTypes: true });

    for (const entry of entries) {
        const srcFull = path.join(packagePath, entry.name);
        const dstFull = path.join(tempDir, entry.name);

        if (entry.isFile()) {
            // Top-level files (ApplicationManifest.xml) — copy as-is
            fs.copyFileSync(srcFull, dstFull);
            const stat = fs.statSync(srcFull);
            originalFileCount++;
            compressedFileCount++;
            originalBytes += stat.size;
            compressedBytes += stat.size;
        } else if (entry.isDirectory()) {
            // Service package directory (e.g., VotingWebPkg)
            fs.mkdirSync(dstFull, { recursive: true });
            const svcEntries = fs.readdirSync(srcFull, { withFileTypes: true });

            for (const svcEntry of svcEntries) {
                const svcSrcFull = path.join(srcFull, svcEntry.name);
                const svcDstFull = path.join(dstFull, svcEntry.name);

                if (svcEntry.isFile()) {
                    // ServiceManifest.xml — copy as-is
                    fs.copyFileSync(svcSrcFull, svcDstFull);
                    const stat = fs.statSync(svcSrcFull);
                    originalFileCount++;
                    compressedFileCount++;
                    originalBytes += stat.size;
                    compressedBytes += stat.size;
                } else if (svcEntry.isDirectory() && COMPRESSIBLE_DIRS.includes(svcEntry.name)) {
                    // Code/, Config/, or Data/ — zip it
                    progress?.(`Compressing ${entry.name}/${svcEntry.name}...`);
                    SfUtility.outputLog(`PackageCompressor: zipping ${entry.name}/${svcEntry.name}`, null, debugLevel.info);

                    const dirFiles = collectFilesRecursive(svcSrcFull);
                    originalFileCount += dirFiles.length;
                    originalBytes += dirFiles.reduce((sum, f) => sum + f.size, 0);

                    const zipPath = path.join(dstFull, `${svcEntry.name}.zip`);
                    await createZipFromDirectory(svcSrcFull, zipPath);

                    const zipStat = fs.statSync(zipPath);
                    compressedFileCount++;
                    compressedBytes += zipStat.size;

                    SfUtility.outputLog(
                        `PackageCompressor: ${entry.name}/${svcEntry.name}: ${dirFiles.length} files -> ${svcEntry.name}.zip (${Math.round(zipStat.size / 1024)}KB)`,
                        null, debugLevel.info,
                    );
                } else {
                    // Unknown subdirectory — copy recursively
                    copyDirectoryRecursive(svcSrcFull, svcDstFull);
                    const dirFiles = collectFilesRecursive(svcSrcFull);
                    originalFileCount += dirFiles.length;
                    compressedFileCount += dirFiles.length;
                    const dirBytes = dirFiles.reduce((sum, f) => sum + f.size, 0);
                    originalBytes += dirBytes;
                    compressedBytes += dirBytes;
                }
            }
        }
    }

    const durationMs = Date.now() - startMs;
    const savedBytes = originalBytes - compressedBytes;
    SfUtility.outputLog(
        `PackageCompressor: complete in ${durationMs}ms. ${originalFileCount} files -> ${compressedFileCount} files. ` +
        `${Math.round(originalBytes / 1024 / 1024)}MB -> ${Math.round(compressedBytes / 1024 / 1024)}MB ` +
        `(saved ${Math.round(savedBytes / 1024 / 1024)}MB, ${originalBytes > 0 ? Math.round((savedBytes / originalBytes) * 100) : 0}%)`,
        null, debugLevel.info,
    );

    return { compressedPath: tempDir, originalFileCount, compressedFileCount, savedBytes };
}

/**
 * Check if a package is already compressed (has .zip files instead of Code/Config/Data dirs).
 */
export function isPackageCompressed(packagePath: string): boolean {
    const entries = fs.readdirSync(packagePath, { withFileTypes: true });
    for (const entry of entries) {
        if (!entry.isDirectory()) { continue; }
        const svcDir = path.join(packagePath, entry.name);
        const svcEntries = fs.readdirSync(svcDir);
        // If there's a Code.zip or Config.zip or Data.zip, it's already compressed
        if (svcEntries.some(e => COMPRESSIBLE_DIRS.some(d => e === `${d}.zip`))) {
            return true;
        }
    }
    return false;
}

/**
 * Clean up a compressed temp package directory.
 */
export function cleanupCompressedPackage(compressedPath: string): void {
    try {
        fs.rmSync(compressedPath, { recursive: true, force: true });
        SfUtility.outputLog(`PackageCompressor: cleaned up ${compressedPath}`, null, debugLevel.info);
    } catch (err) {
        SfUtility.outputLog(`PackageCompressor: failed to clean up ${compressedPath}`, err, debugLevel.warn);
    }
}

// ── Internal helpers ─────────────────────────────────────────────────

function collectFilesRecursive(dir: string): { path: string; relativePath: string; size: number }[] {
    const results: { path: string; relativePath: string; size: number }[] = [];
    const walk = (current: string, relBase: string) => {
        const entries = fs.readdirSync(current, { withFileTypes: true });
        for (const entry of entries) {
            const full = path.join(current, entry.name);
            const rel = relBase ? `${relBase}/${entry.name}` : entry.name;
            if (entry.isDirectory()) {
                walk(full, rel);
            } else {
                const stat = fs.statSync(full);
                results.push({ path: full, relativePath: rel, size: stat.size });
            }
        }
    };
    walk(dir, '');
    return results;
}

function copyDirectoryRecursive(src: string, dst: string): void {
    fs.mkdirSync(dst, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcFull = path.join(src, entry.name);
        const dstFull = path.join(dst, entry.name);
        if (entry.isDirectory()) {
            copyDirectoryRecursive(srcFull, dstFull);
        } else {
            fs.copyFileSync(srcFull, dstFull);
        }
    }
}

/**
 * Create a zip file from a directory using Node.js built-in zlib.
 * 
 * Writes a valid ZIP archive (PKZIP APPNOTE 6.3.3 compatible) with DEFLATE compression.
 * Each file gets a Local File Header + compressed data, followed by the Central Directory
 * and End-of-Central-Directory record. Paths use forward slashes per ZIP spec.
 */
async function createZipFromDirectory(sourceDir: string, zipPath: string): Promise<void> {
    const files = collectFilesRecursive(sourceDir);
    const fd = fs.openSync(zipPath, 'w');
    let offset = 0;

    interface CentralDirEntry {
        relativePath: string;
        crc32: number;
        compressedSize: number;
        uncompressedSize: number;
        localHeaderOffset: number;
    }

    const centralEntries: CentralDirEntry[] = [];

    for (const file of files) {
        const fileData = fs.readFileSync(file.path);
        const crc = crc32(fileData);
        const compressed = zlib.deflateRawSync(fileData as unknown as Uint8Array, { level: 6 });

        // Use forward slashes in zip paths
        const zipEntryName = file.relativePath.replace(/\\/g, '/');
        const nameBuffer = Buffer.from(zipEntryName, 'utf8');

        // Local File Header (30 bytes + filename)
        const localHeader = Buffer.alloc(30);
        localHeader.writeUInt32LE(0x04034b50, 0);   // Local file header signature
        localHeader.writeUInt16LE(20, 4);            // Version needed to extract (2.0)
        localHeader.writeUInt16LE(0, 6);             // General purpose bit flag
        localHeader.writeUInt16LE(8, 8);             // Compression method: DEFLATE
        localHeader.writeUInt16LE(0, 10);            // Last mod time
        localHeader.writeUInt16LE(0, 12);            // Last mod date
        localHeader.writeUInt32LE(crc, 14);          // CRC-32
        localHeader.writeUInt32LE(compressed.length, 18);  // Compressed size
        localHeader.writeUInt32LE(fileData.length, 22);    // Uncompressed size
        localHeader.writeUInt16LE(nameBuffer.length, 26);  // Filename length
        localHeader.writeUInt16LE(0, 28);            // Extra field length

        const localHeaderOffset = offset;
        fs.writeSync(fd, localHeader as unknown as Uint8Array);
        offset += localHeader.length;
        fs.writeSync(fd, nameBuffer as unknown as Uint8Array);
        offset += nameBuffer.length;
        fs.writeSync(fd, compressed as unknown as Uint8Array);
        offset += compressed.length;

        centralEntries.push({
            relativePath: zipEntryName,
            crc32: crc,
            compressedSize: compressed.length,
            uncompressedSize: fileData.length,
            localHeaderOffset,
        });
    }

    // Central Directory
    const centralDirOffset = offset;
    for (const entry of centralEntries) {
        const nameBuffer = Buffer.from(entry.relativePath, 'utf8');
        const cdHeader = Buffer.alloc(46);
        cdHeader.writeUInt32LE(0x02014b50, 0);   // Central directory header signature
        cdHeader.writeUInt16LE(20, 4);            // Version made by
        cdHeader.writeUInt16LE(20, 6);            // Version needed to extract
        cdHeader.writeUInt16LE(0, 8);             // Flags
        cdHeader.writeUInt16LE(8, 10);            // Compression: DEFLATE
        cdHeader.writeUInt16LE(0, 12);            // Last mod time
        cdHeader.writeUInt16LE(0, 14);            // Last mod date
        cdHeader.writeUInt32LE(entry.crc32, 16);
        cdHeader.writeUInt32LE(entry.compressedSize, 20);
        cdHeader.writeUInt32LE(entry.uncompressedSize, 24);
        cdHeader.writeUInt16LE(nameBuffer.length, 28);
        cdHeader.writeUInt16LE(0, 30);            // Extra field length
        cdHeader.writeUInt16LE(0, 32);            // File comment length
        cdHeader.writeUInt16LE(0, 34);            // Disk number start
        cdHeader.writeUInt16LE(0, 36);            // Internal file attributes
        cdHeader.writeUInt32LE(0, 38);            // External file attributes
        cdHeader.writeUInt32LE(entry.localHeaderOffset, 42);

        fs.writeSync(fd, cdHeader as unknown as Uint8Array);
        offset += cdHeader.length;
        fs.writeSync(fd, nameBuffer as unknown as Uint8Array);
        offset += nameBuffer.length;
    }

    const centralDirSize = offset - centralDirOffset;

    // End of Central Directory Record
    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0);            // EOCD signature
    eocd.writeUInt16LE(0, 4);                     // Disk number
    eocd.writeUInt16LE(0, 6);                     // Disk with central dir
    eocd.writeUInt16LE(centralEntries.length, 8); // Entries on this disk
    eocd.writeUInt16LE(centralEntries.length, 10); // Total entries
    eocd.writeUInt32LE(centralDirSize, 12);       // Central dir size
    eocd.writeUInt32LE(centralDirOffset, 16);     // Central dir offset
    eocd.writeUInt16LE(0, 20);                    // Comment length

    fs.writeSync(fd, eocd as unknown as Uint8Array);
    fs.closeSync(fd);
}

/**
 * Compute CRC-32 (ISO 3309) for a buffer.
 * Uses a pre-computed lookup table for speed.
 */
const crc32Table = (() => {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) {
            c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        }
        table[i] = c;
    }
    return table;
})();

function crc32(buf: Buffer): number {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
        crc = crc32Table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}
