/**
 * Clean E2E test: upload → verify → provision → poll
 * VotingType is now unprovisioned, Image Store is clear
 */
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as https from 'https';
import * as url from 'url';
import * as pathModule from 'path';
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config({ path: pathModule.resolve(__dirname, '../../.env') });
if (!process.env.SF_TEST_CLUSTER) {
    dotenv.config({ path: pathModule.resolve(process.cwd(), '.env') });
}

const CLUSTER = process.env.SF_TEST_CLUSTER!;
const THUMBPRINT = process.env.SF_TEST_THUMBPRINT!;
const PKG_DIR = process.env.SF_TEST_PKG_DIR || 'c:\\github\\jagilber\\service-fabric-dotnet-quickstart\\Voting\\pkg\\Debug';
const CHUNK_SIZE = 4 * 1024 * 1024;

function getScriptPath(): string {
    const candidates = [
        pathModule.resolve(__dirname, 'get-cert.ps1'),
        pathModule.resolve(process.cwd(), 'test', 'integration', 'get-cert.ps1'),
    ];
    for (const p of candidates) { try { fs.accessSync(p); return p; } catch {} }
    throw new Error('get-cert.ps1 not found');
}

function makeRequest(
    agent: https.Agent, method: string, reqPath: string,
    body?: Buffer | string, customHeaders?: Record<string, string>,
): Promise<{ status: number; body: string }> {
    const parsed = url.parse(CLUSTER);
    return new Promise((resolve, reject) => {
        const isBinary = Buffer.isBuffer(body);
        const bodyBuf = isBinary ? body : (body ? Buffer.from(body) : undefined);
        const opts: https.RequestOptions = {
            hostname: parsed.hostname,
            port: parseInt(parsed.port || '19080'),
            path: reqPath,
            method,
            agent,
            headers: {
                Accept: 'application/json',
                'Content-Type': isBinary ? 'application/octet-stream' : 'application/json',
                ...customHeaders,
            },
            rejectUnauthorized: false,
        };
        if (bodyBuf) {
            opts.headers!['Content-Length'] = bodyBuf.length;
            if (isBinary) opts.headers!['Expect'] = '100-continue';
        }
        const req = https.request(opts, (res) => {
            const chunks: Buffer[] = [];
            res.on('data', (c: Buffer) => chunks.push(c));
            res.on('end', () => resolve({ status: res.statusCode || 0, body: Buffer.concat(chunks as any).toString('utf-8') }));
        });
        req.on('error', reject);
        req.setTimeout(120000, () => { req.destroy(); reject(new Error('Timeout')); });
        if (bodyBuf) {
            if (isBinary) req.on('continue', () => req.end(bodyBuf));
            else req.end(bodyBuf);
        } else req.end();
    });
}

function collectFiles(dir: string, base: string): { relativePath: string; fullPath: string; size: number }[] {
    const results: { relativePath: string; fullPath: string; size: number }[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = pathModule.join(dir, entry.name);
        if (entry.isDirectory()) results.push(...collectFiles(full, base));
        else results.push({ relativePath: pathModule.relative(base, full).replace(/\\/g, '/'), fullPath: full, size: fs.statSync(full).size });
    }
    return results;
}

async function main() {
    console.log('=== CLEAN E2E PROVISION TEST ===');
    console.log(`Cluster: ${CLUSTER}`);
    console.log(`Package: ${PKG_DIR}\n`);

    const cert = execSync(`pwsh -NoProfile -ExecutionPolicy Bypass -File "${getScriptPath()}" -Thumbprint "${THUMBPRINT}" -Type cert`, { encoding: 'utf-8' }).trim();
    const key = execSync(`pwsh -NoProfile -ExecutionPolicy Bypass -File "${getScriptPath()}" -Thumbprint "${THUMBPRINT}" -Type key`, { encoding: 'utf-8' }).trim();
    const agent = new https.Agent({ cert, key, rejectUnauthorized: false, keepAlive: true, maxSockets: 1 });

    // 0. Verify no provisioned types
    const types = await makeRequest(agent, 'GET', '/ApplicationTypes?api-version=6.0');
    console.log(`[0] Current types: ${JSON.parse(types.body).Items?.length || 0}`);

    // 1. Verify Image Store is clean
    const check = await makeRequest(agent, 'GET', '/ImageStore/VotingType?api-version=6.0');
    console.log(`[1] Image Store VotingType: ${check.status} (should be 404)`);
    if (check.status === 200) {
        console.log('    VotingType exists, deleting...');
        await makeRequest(agent, 'DELETE', '/ImageStore/VotingType?api-version=6.0&timeout=60');
    }

    // 2. Upload all files
    console.log('\n[2] Uploading files...');
    const files = collectFiles(PKG_DIR, PKG_DIR);
    console.log(`    Found ${files.length} files`);
    
    for (const f of files) {
        const imageStorePath = `VotingType/${f.relativePath}`;
        const encodedPath = imageStorePath.split('/').map(s => encodeURIComponent(s)).join('/');
        
        if (f.size > 2 * 1024 * 1024) {
            const sessionId = crypto.randomUUID();
            const totalChunks = Math.ceil(f.size / CHUNK_SIZE);
            const fd = fs.openSync(f.fullPath, 'r');
            for (let i = 0; i < totalChunks; i++) {
                const start = i * CHUNK_SIZE;
                const len = Math.min(CHUNK_SIZE, f.size - start);
                const chunk = Buffer.alloc(len);
                fs.readSync(fd, chunk as any, 0, len, start);
                const result = await makeRequest(agent, 'PUT',
                    `/ImageStore/${encodedPath}/$/UploadChunk?session-id=${sessionId}&api-version=6.0`,
                    chunk, { 'Content-Range': `bytes ${start}-${start + len - 1}/${f.size}` });
                if (result.status >= 300) {
                    console.log(`    CHUNK UPLOAD FAILED: ${result.status} ${result.body}`);
                    process.exit(1);
                }
            }
            fs.closeSync(fd);
            const commit = await makeRequest(agent, 'POST', `/ImageStore/$/CommitUploadSession?session-id=${sessionId}&api-version=6.0`);
            console.log(`    ${imageStorePath} (${f.size}b, ${totalChunks} chunks) → ${commit.status}`);
            if (commit.status >= 300) {
                console.log(`    COMMIT FAILED: ${commit.body}`);
                process.exit(1);
            }
        } else {
            const content = fs.readFileSync(f.fullPath);
            const result = await makeRequest(agent, 'PUT', `/ImageStore/${encodedPath}?api-version=6.0`, content);
            console.log(`    ${imageStorePath} (${f.size}b) → ${result.status}`);
            if (result.status >= 300) {
                console.log(`    UPLOAD FAILED: ${result.body}`);
                process.exit(1);
            }
        }
    }

    // 3. Verify Image Store content
    console.log('\n[3] Verifying Image Store...');
    const verify = await makeRequest(agent, 'GET', '/ImageStore/VotingType?api-version=6.0');
    console.log(`    GET /ImageStore/VotingType → ${verify.status}`);
    if (verify.status === 200) {
        const p = JSON.parse(verify.body);
        console.log(`    Files: ${p.StoreFiles?.length || 0}, Folders: ${p.StoreFolders?.length || 0}`);
        for (const f of (p.StoreFiles || [])) console.log(`      ${f.StoreRelativePath} (${f.FileSize}b)`);
        for (const d of (p.StoreFolders || [])) console.log(`      ${d.StoreRelativePath}/ (${d.FileCount} files)`);
    } else {
        console.log(`    ❌ Image Store content not found: ${verify.body}`);
        process.exit(1);
    }

    // 3.5 Wait a moment for Image Store replication
    console.log('\n[3.5] Waiting 5s for replication...');
    await new Promise(r => setTimeout(r, 5000));

    // 3.6 Re-verify
    const verify2 = await makeRequest(agent, 'GET', '/ImageStore/VotingType?api-version=6.0');
    console.log(`    Re-verify: ${verify2.status}`);

    // 4. Provision
    console.log('\n[4] Provisioning...');
    const provBody = JSON.stringify({ Kind: 'ImageStorePath', Async: true, ApplicationTypeBuildPath: 'VotingType' });
    console.log(`    Body: ${provBody}`);
    const prov = await makeRequest(agent, 'POST', '/ApplicationTypes/$/Provision?api-version=6.2&timeout=120', provBody);
    console.log(`    Result: ${prov.status}`);
    if (prov.body) console.log(`    Response: ${prov.body}`);

    // 4b. Also try synchronous provision if async fails
    if (prov.status === 404) {
        console.log('\n[4b] Async failed. Trying synchronous...');
        const provBody2 = JSON.stringify({ Kind: 'ImageStorePath', Async: false, ApplicationTypeBuildPath: 'VotingType' });
        const prov2 = await makeRequest(agent, 'POST', '/ApplicationTypes/$/Provision?api-version=6.2&timeout=120', provBody2);
        console.log(`    Result: ${prov2.status} ${prov2.body}`);

        // 4c. Try api-version=6.1
        console.log('\n[4c] Trying api-version=6.1...');
        const provBody3 = JSON.stringify({ Kind: 'ImageStorePath', Async: false, ApplicationTypeBuildPath: 'VotingType' });
        const prov3 = await makeRequest(agent, 'POST', '/ApplicationTypes/$/Provision?api-version=6.1&timeout=120', provBody3);
        console.log(`    Result: ${prov3.status} ${prov3.body}`);

        // 4d. Try older api-version=6.0 without Kind (plain string body)
        console.log('\n[4d] Trying legacy api-version=6.0 format...');
        const provBody4 = JSON.stringify({ ApplicationTypeBuildPath: 'VotingType' });
        const prov4 = await makeRequest(agent, 'POST', '/ApplicationTypes/$/Provision?api-version=6.0&timeout=120', provBody4);
        console.log(`    Result: ${prov4.status} ${prov4.body}`);

        // 4e. Re-check Image Store after failed provision
        console.log('\n[4e] Re-checking Image Store after failed provisions...');
        const recheck = await makeRequest(agent, 'GET', '/ImageStore/VotingType?api-version=6.0');
        console.log(`    GET /ImageStore/VotingType → ${recheck.status}`);
        if (recheck.status === 200) {
            const p = JSON.parse(recheck.body);
            console.log(`    Files: ${p.StoreFiles?.length || 0}, Folders: ${p.StoreFolders?.length || 0}`);
        }
    }

    // 5. If provision accepted, poll
    if (prov.status >= 200 && prov.status < 300) {
        console.log('\n[5] Polling...');
        for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 3000));
            const c = await makeRequest(agent, 'GET', '/ApplicationTypes/VotingType?api-version=6.0');
            try {
                const p = JSON.parse(c.body);
                const items = p.Items || [p];
                for (const t of items) {
                    console.log(`    ${t.Name} v${t.Version} - ${t.Status}`);
                    if (t.Status === 'Available') { console.log('\n✅ SUCCESS!'); agent.destroy(); return; }
                    if (t.Status === 'Failed') { console.log(`\n❌ FAILED: ${t.StatusDetails}`); agent.destroy(); return; }
                }
            } catch {}
        }
    }

    agent.destroy();
}

main().catch(e => { console.error(`FAILED: ${e.message}`); process.exit(1); });
