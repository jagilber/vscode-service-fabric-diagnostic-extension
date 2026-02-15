/**
 * Integration test: verifies parallel uploads against the real SF cluster.
 *
 * Run with: npx ts-node test/integration/test-parallel-upload.ts
 *
 * Creates 16 test files and uploads them in parallel using the same
 * keepAlive + maxSockets=8 agent configuration as SfDirectRestClient.
 * Measures concurrency by tracking overlapping request timings.
 */

import * as crypto from 'crypto';
import * as https from 'https';
import * as tls from 'tls';
import * as url from 'url';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
if (!process.env.SF_TEST_CLUSTER) {
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

const CLUSTER = process.env.SF_TEST_CLUSTER!;
const THUMBPRINT = process.env.SF_TEST_THUMBPRINT!;
const FILE_COUNT = 16;
const FILE_SIZE = 64 * 1024; // 64KB each — small enough for single PUT
const MAX_CONCURRENCY = 8;

if (!CLUSTER || !THUMBPRINT) {
    console.error('Missing SF_TEST_CLUSTER or SF_TEST_THUMBPRINT in .env');
    process.exit(1);
}

// ── Cert extraction ─────────────────────────────────────────────

function getScriptPath(): string {
    const candidates = [
        path.resolve(__dirname, 'get-cert.ps1'),
        path.resolve(process.cwd(), 'test', 'integration', 'get-cert.ps1'),
    ];
    for (const p of candidates) {
        try { require('fs').accessSync(p); return p; } catch {}
    }
    throw new Error(`get-cert.ps1 not found.`);
}

function getPemCert(): string {
    return execSync(`pwsh -NoProfile -ExecutionPolicy Bypass -File "${getScriptPath()}" -Thumbprint "${THUMBPRINT}" -Type cert`, { encoding: 'utf-8' }).trim();
}

function getPemKey(): string {
    return execSync(`pwsh -NoProfile -ExecutionPolicy Bypass -File "${getScriptPath()}" -Thumbprint "${THUMBPRINT}" -Type key`, { encoding: 'utf-8' }).trim();
}

// ── Upload helper ───────────────────────────────────────────────

interface UploadTiming {
    file: string;
    startMs: number;
    endMs: number;
    status: number;
}

function uploadFile(
    agent: https.Agent,
    imageStorePath: string,
    body: Buffer,
): Promise<UploadTiming> {
    const parsed = url.parse(CLUSTER);
    const startMs = Date.now();
    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: parsed.hostname,
            port: parseInt(parsed.port || '19080'),
            path: `/ImageStore/${imageStorePath}?api-version=6.0`,
            method: 'PUT',
            agent,
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Length': body.length,
                'Expect': '100-continue',
                'Accept': 'application/json',
            },
            rejectUnauthorized: false,
        }, (res) => {
            const chunks: Buffer[] = [];
            res.on('data', (c: Buffer) => chunks.push(c));
            res.on('end', () => {
                resolve({
                    file: imageStorePath,
                    startMs,
                    endMs: Date.now(),
                    status: res.statusCode || 0,
                });
            });
        });

        req.on('error', reject);
        req.setTimeout(30000, () => { req.destroy(); reject(new Error('timeout')); });
        req.on('continue', () => req.end(body));
    });
}

// ── Main ────────────────────────────────────────────────────────

async function main() {
    console.log('='.repeat(60));
    console.log('PARALLEL UPLOAD INTEGRATION TEST');
    console.log(`Cluster: ${CLUSTER}`);
    console.log(`Files: ${FILE_COUNT} x ${FILE_SIZE / 1024}KB = ${(FILE_COUNT * FILE_SIZE / 1024 / 1024).toFixed(1)}MB`);
    console.log(`Max concurrency: ${MAX_CONCURRENCY}`);
    console.log('='.repeat(60));

    // Get certs
    console.log('\n[1] Extracting certificate...');
    const cert = getPemCert();
    const key = getPemKey();

    // Create agent with SAME config as SfDirectRestClient (post-fix)
    const agent = new https.Agent({
        cert,
        key,
        rejectUnauthorized: false,
        keepAlive: true,
        maxSockets: MAX_CONCURRENCY,
        maxFreeSockets: MAX_CONCURRENCY,
    });

    // Verify connectivity
    console.log('\n[2] Checking cluster connectivity...');
    const parsed = url.parse(CLUSTER);
    await new Promise<void>((resolve, reject) => {
        const req = https.request({
            hostname: parsed.hostname,
            port: parseInt(parsed.port || '19080'),
            path: '/$/GetClusterVersion?api-version=6.0',
            method: 'GET',
            agent,
            headers: { 'Accept': 'application/json' },
            rejectUnauthorized: false,
        }, (res) => {
            let body = '';
            res.on('data', (c) => body += c);
            res.on('end', () => {
                console.log(`  Status: ${res.statusCode}, Version: ${body}`);
                if (res.statusCode === 200) { resolve(); } else { reject(new Error(`Cluster returned ${res.statusCode}`)); }
            });
        });
        req.on('error', reject);
        req.end();
    });

    // Prepare test files
    const testBasePath = `__test_parallel_${Date.now()}`;
    const files: { path: string; body: Buffer }[] = [];
    for (let i = 0; i < FILE_COUNT; i++) {
        const body = Buffer.alloc(FILE_SIZE);
        body.fill(crypto.randomBytes(32).toString('hex'), 0, FILE_SIZE);
        files.push({ path: `${testBasePath}/file_${i.toString().padStart(3, '0')}.bin`, body });
    }

    // ── SEQUENTIAL baseline ──
    console.log(`\n[3] SEQUENTIAL upload (${FILE_COUNT} files, one at a time)...`);
    const seqTimings: UploadTiming[] = [];
    const seqStart = Date.now();
    for (const f of files) {
        const t = await uploadFile(agent, f.path.replace(testBasePath, testBasePath + '_seq'), f.body);
        seqTimings.push(t);
    }
    const seqTotal = Date.now() - seqStart;
    console.log(`  Sequential total: ${seqTotal}ms (avg ${(seqTotal / FILE_COUNT).toFixed(0)}ms/file)`);

    // ── PARALLEL upload ──
    console.log(`\n[4] PARALLEL upload (${FILE_COUNT} files, ${MAX_CONCURRENCY} workers)...`);
    const parTimings: UploadTiming[] = [];
    const parStart = Date.now();

    // Worker-pool pattern (matches sfRest.ts)
    const queue = files.map(f => ({ ...f, path: f.path.replace(testBasePath, testBasePath + '_par') }));
    let cursor = 0;
    const runWorker = async () => {
        while (cursor < queue.length) {
            const idx = cursor++;
            const t = await uploadFile(agent, queue[idx].path, queue[idx].body);
            parTimings.push(t);
        }
    };
    const workers: Promise<void>[] = [];
    for (let w = 0; w < Math.min(MAX_CONCURRENCY, queue.length); w++) {
        workers.push(runWorker());
    }
    await Promise.all(workers);
    const parTotal = Date.now() - parStart;
    console.log(`  Parallel total: ${parTotal}ms (avg ${(parTotal / FILE_COUNT).toFixed(0)}ms/file)`);

    // ── Analysis ──
    console.log('\n[5] Timing analysis...');

    // Count overlapping uploads (concurrent in-flight)
    const parEvents: { time: number; delta: number }[] = [];
    for (const t of parTimings) {
        parEvents.push({ time: t.startMs, delta: +1 });
        parEvents.push({ time: t.endMs, delta: -1 });
    }
    parEvents.sort((a, b) => a.time - b.time || a.delta - b.delta);
    let maxConcurrent = 0;
    let current = 0;
    for (const e of parEvents) {
        current += e.delta;
        maxConcurrent = Math.max(maxConcurrent, current);
    }

    const speedup = seqTotal / parTotal;
    console.log(`  Sequential: ${seqTotal}ms`);
    console.log(`  Parallel:   ${parTotal}ms`);
    console.log(`  Speedup:    ${speedup.toFixed(2)}x`);
    console.log(`  Max concurrent uploads observed: ${maxConcurrent}`);

    // Status check
    const failedPar = parTimings.filter(t => t.status < 200 || t.status >= 300);
    const failedSeq = seqTimings.filter(t => t.status < 200 || t.status >= 300);
    if (failedPar.length > 0) {
        console.log(`\n  WARNING: ${failedPar.length} parallel uploads failed:`);
        for (const f of failedPar) { console.log(`    ${f.file} -> ${f.status}`); }
    }
    if (failedSeq.length > 0) {
        console.log(`\n  WARNING: ${failedSeq.length} sequential uploads failed:`);
        for (const f of failedSeq) { console.log(`    ${f.file} -> ${f.status}`); }
    }

    // ── Cleanup ──
    console.log('\n[6] Cleanup...');
    for (const suffix of ['_seq', '_par']) {
        try {
            await new Promise<void>((resolve, reject) => {
                const delReq = https.request({
                    hostname: parsed.hostname,
                    port: parseInt(parsed.port || '19080'),
                    path: `/ImageStore/${testBasePath}${suffix}?api-version=6.0`,
                    method: 'DELETE',
                    agent,
                    headers: { 'Accept': 'application/json' },
                    rejectUnauthorized: false,
                }, (res) => {
                    res.resume();
                    res.on('end', () => {
                        console.log(`  DELETE ${testBasePath}${suffix} -> ${res.statusCode}`);
                        resolve();
                    });
                });
                delReq.on('error', reject);
                delReq.end();
            });
        } catch {}
    }

    agent.destroy();

    // ── Verdict ──
    console.log('\n' + '='.repeat(60));
    if (maxConcurrent > 1 && speedup > 1.5 && failedPar.length === 0) {
        console.log('PASS: Parallel uploads are working correctly');
        console.log(`  ${maxConcurrent} concurrent connections, ${speedup.toFixed(1)}x speedup`);
    } else if (maxConcurrent <= 1) {
        console.log('FAIL: Uploads are still sequential (max concurrent = 1)');
        process.exit(1);
    } else if (speedup <= 1.5) {
        console.log(`WARN: Speedup is only ${speedup.toFixed(1)}x — may indicate connection reuse issue`);
    } else {
        console.log(`WARN: ${failedPar.length} uploads failed — check cluster health`);
    }
    console.log('='.repeat(60));
}

main().catch((err) => {
    console.error(`\nFAILED: ${err.message}`);
    process.exit(1);
});
