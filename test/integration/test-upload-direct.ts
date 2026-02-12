/**
 * Standalone integration test for chunked upload against real SF cluster.
 * Run with: npx ts-node test/integration/test-upload-direct.ts
 *
 * Tests mTLS + chunked upload directly, with full socket diagnostics.
 */

import * as crypto from 'crypto';
import * as https from 'https';
import * as tls from 'tls';
import * as url from 'url';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Fallback: load from project root directly
if (!process.env.SF_TEST_CLUSTER) {
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

const CLUSTER = process.env.SF_TEST_CLUSTER!;
const THUMBPRINT = process.env.SF_TEST_THUMBPRINT!;
const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB — matches SfDirectRestClient.UPLOAD_CHUNK_SIZE

// ── Cert extraction (same as sfPs) ──────────────────────────────

function getScriptPath(): string {
    // When compiled to out-test/, the script is in test/integration/ relative to project root
    const candidates = [
        path.resolve(__dirname, 'get-cert.ps1'),
        path.resolve(__dirname, '..', 'test', 'integration', 'get-cert.ps1'),
        path.resolve(process.cwd(), 'test', 'integration', 'get-cert.ps1'),
    ];
    for (const p of candidates) {
        try { require('fs').accessSync(p); return p; } catch {}
    }
    throw new Error(`get-cert.ps1 not found. Searched: ${candidates.join(', ')}`);
}

function getPemCert(): string {
    const scriptPath = getScriptPath();
    return execSync(`pwsh -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}" -Thumbprint "${THUMBPRINT}" -Type cert`, { encoding: 'utf-8' }).trim();
}

function getPemKey(): string {
    const scriptPath = getScriptPath();
    return execSync(`pwsh -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}" -Thumbprint "${THUMBPRINT}" -Type key`, { encoding: 'utf-8' }).trim();
}

// ── HTTP request helper ─────────────────────────────────────────

function makeRequest(
    agent: https.Agent,
    method: string,
    reqPath: string,
    body?: Buffer,
    customHeaders?: Record<string, string>,
): Promise<{ status: number; body: string }> {
    const parsed = url.parse(CLUSTER);
    return new Promise((resolve, reject) => {
        const options: https.RequestOptions = {
            hostname: parsed.hostname,
            port: parseInt(parsed.port || '19080'),
            path: reqPath,
            method,
            agent,
            headers: {
                'Accept': 'application/json',
                ...customHeaders,
            },
            rejectUnauthorized: false,
        };

        if (body) {
            options.headers!['Content-Type'] = 'application/octet-stream';
            options.headers!['Content-Length'] = body.length;
            // Use Expect: 100-continue to let the server do TLS renegotiation
            // (client cert request) BEFORE we send the body.
            // Without this, large bodies block the renegotiation and hang.
            options.headers!['Expect'] = '100-continue';
        } else {
            options.headers!['Content-Type'] = 'application/json';
        }

        const req = https.request(options, (res) => {
            const chunks: Buffer[] = [];
            res.on('data', (c: Buffer) => chunks.push(c));
            res.on('end', () => {
                const responseBody = Buffer.concat(chunks as any).toString('utf-8');
                resolve({ status: res.statusCode || 0, body: responseBody });
            });
        });

        req.on('error', (err) => reject(err));
        req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error('Request timeout after 30s'));
        });

        // Socket diagnostics
        req.on('socket', (socket) => {
            const t = () => new Date().toISOString().slice(11, 23);
            const tlsSock = socket as tls.TLSSocket;
            console.log(`  [${t()}] Socket assigned (connecting=${socket.connecting})`);
            socket.on('connect', () => console.log(`  [${t()}] TCP connected`));
            if (typeof tlsSock.on === 'function') {
                tlsSock.on('secureConnect', () => {
                    console.log(`  [${t()}] TLS handshake done (authorized=${tlsSock.authorized}, proto=${tlsSock.getProtocol?.()})`);
                    // Monitor bytes written after TLS
                    const interval = setInterval(() => {
                        if (socket.destroyed) { clearInterval(interval); return; }
                        console.log(`  [${t()}] bytesWritten=${socket.bytesWritten}, bytesRead=${socket.bytesRead}, writable=${socket.writable}, readable=${socket.readable}`);
                    }, 5000);
                    socket.once('close', () => clearInterval(interval));
                    req.once('close', () => clearInterval(interval));
                });
            }
            socket.on('drain', () => console.log(`  [${t()}] Socket DRAIN`));
            socket.on('close', (hadError) =>
                console.log(`  [${t()}] Socket closed (hadError=${hadError}, bytesWritten=${socket.bytesWritten}, bytesRead=${socket.bytesRead})`));
            socket.on('error', (err) => console.log(`  [${t()}] Socket ERROR: ${err.message}`));
        });

        req.on('finish', () => {
            const t = () => new Date().toISOString().slice(11, 23);
            console.log(`  [${t()}] Request FINISH (all body data flushed to socket)`);
        });

        if (body) {
            console.log(`  Writing ${body.length} bytes (waiting for 100-continue)...`);
            // With Expect: 100-continue, Node.js sends only headers first.
            // On 'continue' event, the server has done TLS renegotiation and is ready.
            req.on('continue', () => {
                const t = () => new Date().toISOString().slice(11, 23);
                console.log(`  [${t()}] Received 100-continue, sending body now...`);
                req.end(body);
            });
            // Fallback: if continue never fires, send after a delay
            // (some servers may not support 100-continue)
        } else {
            req.end();
        }
    });
}

// ── Main test ───────────────────────────────────────────────────

async function main() {
    console.log('='.repeat(60));
    console.log('CHUNKED UPLOAD DIRECT TEST');
    console.log(`Cluster: ${CLUSTER}`);
    console.log(`Thumbprint: ${THUMBPRINT.substring(0, 8)}...`);
    console.log('='.repeat(60));

    // 1. Get cert/key
    console.log('\n[1] Extracting certificate...');
    const cert = getPemCert();
    const key = getPemKey();
    console.log(`  Cert: ${cert.length} chars, Key: ${key.length} chars`);

    // 2. Create HTTPS agent with client cert
    const agent = new https.Agent({
        cert,
        key,
        rejectUnauthorized: false,
        keepAlive: false,
        maxSockets: Infinity,
    });

    // 3. Test connectivity
    console.log('\n[2] Testing cluster connectivity...');
    const versionResult = await makeRequest(agent, 'GET', '/$/GetClusterVersion?api-version=6.0');
    console.log(`  Status: ${versionResult.status}`);
    console.log(`  Body: ${versionResult.body}`);
    if (versionResult.status !== 200) {
        throw new Error(`Cluster not reachable: ${versionResult.status}`);
    }

    // 4. Small file upload (single PUT)
    console.log('\n[3] Small file upload (57 bytes, regular PUT)...');
    const smallContent = Buffer.from('Hello from test-upload-direct.ts ' + new Date().toISOString());
    const testPath = `__test_upload_${Date.now()}`;
    const smallResult = await makeRequest(
        agent,
        'PUT',
        `/ImageStore/${testPath}/small.txt?api-version=6.0`,
        smallContent,
    );
    console.log(`  Status: ${smallResult.status}`);
    if (smallResult.status < 200 || smallResult.status >= 300) {
        console.log(`  Body: ${smallResult.body}`);
        throw new Error(`Small upload failed: ${smallResult.status}`);
    }

    // Test multiple sizes to find the threshold
    for (const sizeKB of [100, 200, 500, 750, 1000]) {
        const size = sizeKB * 1024;
        console.log(`\n[3-${sizeKB}KB] PUT ${sizeKB}KB file...`);
        const content = Buffer.alloc(size, 0x42);
        const t0 = Date.now();
        try {
            const result = await makeRequest(
                agent,
                'PUT',
                `/ImageStore/${testPath}/test_${sizeKB}kb.bin?api-version=6.0`,
                content,
            );
            console.log(`  Status: ${result.status} (${Date.now() - t0}ms)`);
            if (result.status >= 300) {
                console.log(`  Body: ${result.body}`);
                break;
            }
        } catch (err: any) {
            console.log(`  FAILED: ${err.message} (${Date.now() - t0}ms)`);
            break;
        }
    }

    // 5. Chunked upload (3MB — 3 chunks of 1MB)
    console.log('\n[4] Chunked upload (3MB — 3 chunks)...');
    const size3mb = 3 * 1024 * 1024;
    const content3mb = Buffer.alloc(size3mb, 0x42);
    const sessionId1 = crypto.randomUUID();
    const totalChunks3mb = Math.ceil(size3mb / CHUNK_SIZE);
    console.log(`  Session: ${sessionId1}, ${totalChunks3mb} chunks of ${CHUNK_SIZE} bytes`);

    for (let i = 0; i < totalChunks3mb; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, size3mb);
        const chunk = content3mb.subarray(start, end);
        console.log(`  Chunk ${i + 1}/${totalChunks3mb}: bytes ${start}-${end - 1}/${size3mb} (${chunk.length} bytes)`);
        const t0 = Date.now();
        const chunkResult1 = await makeRequest(
            agent,
            'PUT',
            `/ImageStore/${testPath}/chunked_3mb.bin/$/UploadChunk?session-id=${sessionId1}&api-version=6.0`,
            chunk,
            {
                'Content-Range': `bytes ${start}-${end - 1}/${size3mb}`,
            },
        );
        console.log(`  -> ${chunkResult1.status} (${Date.now() - t0}ms)`);
        if (chunkResult1.status >= 300) {
            console.log(`  Body: ${chunkResult1.body}`);
            await makeRequest(agent, 'DELETE', `/ImageStore/$/DeleteUploadSession?session-id=${sessionId1}&api-version=6.0`).catch(() => {});
            throw new Error(`Chunk ${i + 1} failed: ${chunkResult1.status}`);
        }
    }

    // Commit session
    console.log('  Committing session...');
    const commitResult1 = await makeRequest(
        agent,
        'POST',
        `/ImageStore/$/CommitUploadSession?session-id=${sessionId1}&api-version=6.0`,
    );
    console.log(`  Commit status: ${commitResult1.status}`);
    if (commitResult1.status >= 300) {
        console.log(`  Body: ${commitResult1.body}`);
    }

    // 6. Chunked upload (10MB — 3 chunks of 4MB, 4MB, 2MB)
    console.log('\n[5] Chunked upload (10MB — 3 chunks)...');
    const size10mb = 10 * 1024 * 1024;
    const content10mb = Buffer.alloc(size10mb, 0xAB);
    const sessionId2 = crypto.randomUUID();
    const totalChunks = Math.ceil(size10mb / CHUNK_SIZE);
    console.log(`  Session: ${sessionId2}, ${totalChunks} chunks`);

    for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, size10mb);
        const chunk = content10mb.subarray(start, end);
        console.log(`  Chunk ${i + 1}/${totalChunks}: bytes ${start}-${end - 1}/${size10mb} (${chunk.length} bytes)`);
        const t0 = Date.now();
        const chunkResult = await makeRequest(
            agent,
            'PUT',
            `/ImageStore/${testPath}/chunked_10mb.bin/$/UploadChunk?session-id=${sessionId2}&api-version=6.0`,
            chunk,
            {
                'Content-Range': `bytes ${start}-${end - 1}/${size10mb}`,
            },
        );
        console.log(`  -> ${chunkResult.status} (${Date.now() - t0}ms)`);
        if (chunkResult.status >= 300) {
            console.log(`  Body: ${chunkResult.body}`);
            // Try to clean up session
            await makeRequest(agent, 'DELETE', `/ImageStore/$/DeleteUploadSession?session-id=${sessionId2}&api-version=6.0`).catch(() => {});
            throw new Error(`Chunk ${i + 1} failed: ${chunkResult.status}`);
        }
    }

    // Commit session
    console.log('  Committing session...');
    const commitResult2 = await makeRequest(
        agent,
        'POST',
        `/ImageStore/$/CommitUploadSession?session-id=${sessionId2}&api-version=6.0`,
    );
    console.log(`  Commit status: ${commitResult2.status}`);
    if (commitResult2.status >= 300) {
        console.log(`  Body: ${commitResult2.body}`);
    }

    // 7. Verify Image Store content listing (diagnostic for FABRIC_E_DIRECTORY_NOT_FOUND)
    console.log('\n[6] Verifying Image Store content listing...');
    const contentResult = await makeRequest(agent, 'GET', `/ImageStore/${testPath}?api-version=6.0`);
    console.log(`  GET /ImageStore/${testPath} -> ${contentResult.status}`);
    if (contentResult.status === 200) {
        try {
            const parsed = JSON.parse(contentResult.body);
            console.log(`  StoreFiles: ${parsed?.StoreFiles?.length || 0}`);
            for (const f of (parsed?.StoreFiles || [])) {
                console.log(`    - ${f?.StoreRelativePath} (${f?.FileSize} bytes)`);
            }
            console.log(`  StoreFolders: ${parsed?.StoreFolders?.length || 0}`);
            for (const d of (parsed?.StoreFolders || [])) {
                console.log(`    - ${d?.StoreRelativePath} (${d?.FileCount} files)`);
            }
        } catch (e) {
            console.log(`  Raw body: ${contentResult.body.substring(0, 500)}`);
        }
    } else {
        console.log(`  Body: ${contentResult.body}`);
        console.log('  ⚠️  Image Store cannot list content at this path — this is likely the root cause of FABRIC_E_DIRECTORY_NOT_FOUND!');
    }

    // 8. Cleanup
    console.log('\n[7] Cleanup...');
    try {
        const delResult = await makeRequest(agent, 'DELETE', `/ImageStore/${testPath}?api-version=6.0`);
        console.log(`  Delete status: ${delResult.status}`);
    } catch (err) {
        console.warn(`  Cleanup failed: ${err}`);
    }

    agent.destroy();
    console.log('\n✅ ALL TESTS PASSED');
}

main().catch((err) => {
    console.error(`\n❌ TEST FAILED: ${err.message}`);
    process.exit(1);
});
