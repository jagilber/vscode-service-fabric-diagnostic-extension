/**
 * End-to-end test: upload real VotingType package → verify → provision
 * Diagnoses FABRIC_E_DIRECTORY_NOT_FOUND
 */
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as https from 'https';
import * as tls from 'tls';
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
    for (const p of candidates) {
        try { fs.accessSync(p); return p; } catch {}
    }
    throw new Error(`get-cert.ps1 not found`);
}

function getPemCert(): string {
    return execSync(`pwsh -NoProfile -ExecutionPolicy Bypass -File "${getScriptPath()}" -Thumbprint "${THUMBPRINT}" -Type cert`, { encoding: 'utf-8' }).trim();
}
function getPemKey(): string {
    return execSync(`pwsh -NoProfile -ExecutionPolicy Bypass -File "${getScriptPath()}" -Thumbprint "${THUMBPRINT}" -Type key`, { encoding: 'utf-8' }).trim();
}

function makeRequest(
    agent: https.Agent,
    method: string,
    reqPath: string,
    body?: Buffer | string,
    customHeaders?: Record<string, string>,
): Promise<{ status: number; body: string }> {
    const parsed = url.parse(CLUSTER);
    return new Promise((resolve, reject) => {
        const isBinary = Buffer.isBuffer(body);
        const bodyBuf = isBinary ? body : (body ? Buffer.from(body) : undefined);
        
        const options: https.RequestOptions = {
            hostname: parsed.hostname,
            port: parseInt(parsed.port || '19080'),
            path: reqPath,
            method,
            agent,
            headers: {
                'Accept': 'application/json',
                'Content-Type': isBinary ? 'application/octet-stream' : 'application/json',
                ...customHeaders,
            },
            rejectUnauthorized: false,
        };

        if (bodyBuf) {
            options.headers!['Content-Length'] = bodyBuf.length;
            if (isBinary) {
                options.headers!['Expect'] = '100-continue';
            }
        }

        const req = https.request(options, (res) => {
            const chunks: Buffer[] = [];
            res.on('data', (c: Buffer) => chunks.push(c));
            res.on('end', () => resolve({ status: res.statusCode || 0, body: Buffer.concat(chunks as any).toString('utf-8') }));
        });

        req.on('error', (err) => reject(err));
        req.setTimeout(120000, () => { req.destroy(); reject(new Error('Timeout')); });

        if (bodyBuf) {
            if (isBinary) {
                req.on('continue', () => req.end(bodyBuf));
            } else {
                req.end(bodyBuf);
            }
        } else {
            req.end();
        }
    });
}

function collectFiles(dir: string, base: string): { relativePath: string; fullPath: string; size: number }[] {
    const results: { relativePath: string; fullPath: string; size: number }[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = pathModule.join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...collectFiles(full, base));
        } else {
            const stat = fs.statSync(full);
            results.push({ relativePath: pathModule.relative(base, full).replace(/\\/g, '/'), fullPath: full, size: stat.size });
        }
    }
    return results;
}

async function main() {
    console.log('='.repeat(60));
    console.log('PROVISION E2E TEST');
    console.log(`Cluster: ${CLUSTER}`);
    console.log(`Package: ${PKG_DIR}`);
    console.log('='.repeat(60));

    const cert = getPemCert();
    const key = getPemKey();
    const agent = new https.Agent({ cert, key, rejectUnauthorized: false, keepAlive: false, maxSockets: Infinity });

    // 1. Check connectivity
    console.log('\n[1] Connectivity...');
    const ver = await makeRequest(agent, 'GET', '/$/GetClusterVersion?api-version=6.0');
    console.log(`  ${ver.status}: ${ver.body}`);

    // 2. Check what's already provisioned
    console.log('\n[2] Existing types...');
    const types = await makeRequest(agent, 'GET', '/ApplicationTypes?api-version=6.0');
    console.log(`  ${types.status}: ${types.body.substring(0, 300)}`);

    // 3. Delete old VotingType from Image Store (if any)
    console.log('\n[3] Cleaning old VotingType from Image Store...');
    const del = await makeRequest(agent, 'DELETE', '/ImageStore/VotingType?api-version=6.0&timeout=60');
    console.log(`  Delete: ${del.status}`);

    // 4. Upload all files
    console.log('\n[4] Uploading package...');
    const files = collectFiles(PKG_DIR, PKG_DIR);
    console.log(`  Found ${files.length} files in ${PKG_DIR}`);
    
    for (const f of files) {
        const imageStorePath = `VotingType/${f.relativePath}`;
        const encodedPath = imageStorePath.split('/').map(s => encodeURIComponent(s)).join('/');
        
        if (f.size > 2 * 1024 * 1024) {
            // Chunked upload
            const sessionId = crypto.randomUUID();
            const totalChunks = Math.ceil(f.size / CHUNK_SIZE);
            console.log(`  ${imageStorePath} (${f.size} bytes) → chunked, ${totalChunks} chunks, session=${sessionId}`);
            
            const fd = fs.openSync(f.fullPath, 'r');
            for (let i = 0; i < totalChunks; i++) {
                const start = i * CHUNK_SIZE;
                const expectedBytes = Math.min(CHUNK_SIZE, f.size - start);
                const chunk = Buffer.alloc(expectedBytes);
                fs.readSync(fd, chunk as any, 0, expectedBytes, start);
                const end = start + expectedBytes;
                
                const chunkResult = await makeRequest(
                    agent, 'PUT',
                    `/ImageStore/${encodedPath}/$/UploadChunk?session-id=${sessionId}&api-version=6.0`,
                    chunk,
                    { 'Content-Range': `bytes ${start}-${end - 1}/${f.size}` },
                );
                console.log(`    chunk ${i+1}/${totalChunks}: ${chunkResult.status}`);
                if (chunkResult.status >= 300) {
                    console.log(`    ERROR: ${chunkResult.body}`);
                    process.exit(1);
                }
            }
            fs.closeSync(fd);
            
            const commit = await makeRequest(agent, 'POST', `/ImageStore/$/CommitUploadSession?session-id=${sessionId}&api-version=6.0`);
            console.log(`    commit: ${commit.status}`);
            if (commit.status >= 300) {
                console.log(`    ERROR: ${commit.body}`);
                process.exit(1);
            }
        } else {
            // Single PUT
            const content = fs.readFileSync(f.fullPath);
            const result = await makeRequest(agent, 'PUT', `/ImageStore/${encodedPath}?api-version=6.0`, content);
            console.log(`  ${imageStorePath} (${f.size} bytes) → ${result.status}`);
            if (result.status >= 300) {
                console.log(`    ERROR: ${result.body}`);
                process.exit(1);
            }
        }
    }

    // 5. Verify Image Store content
    console.log('\n[5] Verifying Image Store content...');
    const content = await makeRequest(agent, 'GET', '/ImageStore/VotingType?api-version=6.0');
    console.log(`  GET /ImageStore/VotingType → ${content.status}`);
    if (content.status === 200) {
        try {
            const parsed = JSON.parse(content.body);
            console.log(`  StoreFiles: ${parsed?.StoreFiles?.length || 0}`);
            for (const f of (parsed?.StoreFiles || [])) {
                console.log(`    - ${f?.StoreRelativePath} (${f?.FileSize} bytes)`);
            }
            console.log(`  StoreFolders: ${parsed?.StoreFolders?.length || 0}`);
            for (const d of (parsed?.StoreFolders || [])) {
                console.log(`    - ${d?.StoreRelativePath} (${d?.FileCount} files)`);
            }
        } catch (e) {
            console.log(`  Body: ${content.body.substring(0, 500)}`);
        }
    } else {
        console.log(`  ERROR: ${content.body}`);
    }

    // 6. Provision
    console.log('\n[6] Provisioning VotingType...');
    const provBody = JSON.stringify({ Kind: 'ImageStorePath', Async: true, ApplicationTypeBuildPath: 'VotingType' });
    const prov = await makeRequest(agent, 'POST', '/ApplicationTypes/$/Provision?api-version=6.2&timeout=120', provBody);
    console.log(`  Provision: ${prov.status}`);
    if (prov.status >= 300) {
        console.log(`  ERROR: ${prov.body}`);
    } else {
        console.log('  ✅ Provision accepted!');
    }

    // 7. If provision was accepted (202), poll for completion
    if (prov.status >= 200 && prov.status < 300) {
        console.log('\n[7] Polling for provision completion...');
        for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 3000));
            const check = await makeRequest(agent, 'GET', '/ApplicationTypes/VotingType?api-version=6.0');
            if (check.status === 200) {
                try {
                    const parsed = JSON.parse(check.body);
                    const items = parsed?.Items || parsed || [];
                    const arr = Array.isArray(items) ? items : [items];
                    for (const t of arr) {
                        console.log(`    ${t.Name} v${t.Version} - ${t.Status}`);
                        if (t.Status === 'Available') {
                            console.log('  ✅ Provision complete!');
                            agent.destroy();
                            return;
                        }
                    }
                } catch {}
            }
        }
        console.log('  ⚠️ Timed out waiting for provision');
    }

    agent.destroy();
}

main().catch((err) => {
    console.error(`\n❌ FAILED: ${err.message}`);
    process.exit(1);
});
