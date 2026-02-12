/**
 * Test: upload ALL files via chunked upload sessions (even small ones)
 * Theory: CommitUploadSession writes to Image Store service,
 * while single PUT may only write to HTTP Gateway staging area
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
    console.log('=== ALL-CHUNKED UPLOAD + PROVISION TEST ===');
    console.log(`Cluster: ${CLUSTER}`);
    console.log(`Package: ${PKG_DIR}\n`);

    const cert = execSync(`pwsh -NoProfile -ExecutionPolicy Bypass -File "${getScriptPath()}" -Thumbprint "${THUMBPRINT}" -Type cert`, { encoding: 'utf-8' }).trim();
    const key = execSync(`pwsh -NoProfile -ExecutionPolicy Bypass -File "${getScriptPath()}" -Thumbprint "${THUMBPRINT}" -Type key`, { encoding: 'utf-8' }).trim();
    const agent = new https.Agent({ cert, key, rejectUnauthorized: false, keepAlive: true });

    // 0. Clean up
    console.log('[0] Cleaning up...');
    await makeRequest(agent, 'DELETE', '/ImageStore/VotingType?api-version=6.0&timeout=60');

    // 1. Upload ALL files using chunked upload sessions
    console.log('\n[1] Uploading ALL files via chunked sessions...');
    const files = collectFiles(PKG_DIR, PKG_DIR);
    
    for (const f of files) {
        const imageStorePath = `VotingType/${f.relativePath}`;
        const encodedPath = imageStorePath.split('/').map(s => encodeURIComponent(s)).join('/');
        const sessionId = crypto.randomUUID();
        
        // Upload as a single chunk in a session
        const content = fs.readFileSync(f.fullPath);
        const chunkResult = await makeRequest(
            agent, 'PUT',
            `/ImageStore/${encodedPath}/$/UploadChunk?session-id=${sessionId}&api-version=6.0`,
            content,
            { 'Content-Range': `bytes 0-${content.length - 1}/${content.length}` },
        );
        
        if (chunkResult.status >= 300) {
            console.log(`    ❌ ${imageStorePath} chunk failed: ${chunkResult.status} ${chunkResult.body}`);
            process.exit(1);
        }
        
        // Commit the session
        const commitResult = await makeRequest(
            agent, 'POST',
            `/ImageStore/$/CommitUploadSession?session-id=${sessionId}&api-version=6.0`,
        );
        console.log(`    ${imageStorePath} (${f.size}b) → chunk:${chunkResult.status} commit:${commitResult.status}`);
        if (commitResult.status >= 300) {
            console.log(`    ❌ Commit failed: ${commitResult.body}`);
            process.exit(1);
        }
    }

    // 2. Verify
    console.log('\n[2] Verifying...');
    const verify = await makeRequest(agent, 'GET', '/ImageStore/VotingType?api-version=6.0');
    console.log(`    GET /ImageStore/VotingType → ${verify.status}`);
    if (verify.status === 200) {
        const p = JSON.parse(verify.body);
        console.log(`    Files: ${p.StoreFiles?.length || 0}, Folders: ${p.StoreFolders?.length || 0}`);
        for (const ff of (p.StoreFiles || [])) console.log(`      ${ff.StoreRelativePath} (${ff.FileSize}b)`);
        for (const dd of (p.StoreFolders || [])) console.log(`      ${dd.StoreRelativePath}/ (${dd.FileCount} files)`);
    }

    // 3. Wait for replication
    console.log('\n[3] Waiting 5s...');
    await new Promise(r => setTimeout(r, 5000));

    // 4. Provision
    console.log('\n[4] Provisioning...');
    const provBody = JSON.stringify({ Kind: 'ImageStorePath', Async: true, ApplicationTypeBuildPath: 'VotingType' });
    console.log(`    Body: ${provBody}`);
    const prov = await makeRequest(agent, 'POST', '/ApplicationTypes/$/Provision?api-version=6.2&timeout=120', provBody);
    console.log(`    Result: ${prov.status}`);
    if (prov.body) console.log(`    Response: ${prov.body}`);

    // 5. Poll if accepted
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
                    if (t.Status === 'Available') { console.log('\n✅ PROVISION SUCCESS!'); agent.destroy(); return; }
                    if (t.Status === 'Failed') { console.log(`\n❌ PROVISION FAILED: ${t.StatusDetails}`); agent.destroy(); return; }
                }
            } catch {}
        }
    } else {
        console.log('\n⚠️ Provision not accepted, trying Async=false...');
        const provBody2 = JSON.stringify({ Kind: 'ImageStorePath', Async: false, ApplicationTypeBuildPath: 'VotingType' });
        const prov2 = await makeRequest(agent, 'POST', '/ApplicationTypes/$/Provision?api-version=6.2&timeout=120', provBody2);
        console.log(`    ${prov2.status} ${prov2.body}`);
    }

    agent.destroy();
}

main().catch(e => { console.error(`FAILED: ${e.message}`); process.exit(1); });
