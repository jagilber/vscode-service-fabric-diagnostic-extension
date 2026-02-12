/**
 * Quick provision test - VotingType was just unprovisioned
 * Image Store content should still be present from previous upload
 */
import * as https from 'https';
import * as url from 'url';
import * as pathModule from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config({ path: pathModule.resolve(__dirname, '../../.env') });
if (!process.env.SF_TEST_CLUSTER) {
    dotenv.config({ path: pathModule.resolve(process.cwd(), '.env') });
}

const CLUSTER = process.env.SF_TEST_CLUSTER!;
const THUMBPRINT = process.env.SF_TEST_THUMBPRINT!;

function getScriptPath(): string {
    const candidates = [
        pathModule.resolve(__dirname, 'get-cert.ps1'),
        pathModule.resolve(process.cwd(), 'test', 'integration', 'get-cert.ps1'),
    ];
    for (const p of candidates) { try { fs.accessSync(p); return p; } catch {} }
    throw new Error('get-cert.ps1 not found');
}

function makeRequest(agent: https.Agent, method: string, path: string, body?: string): Promise<{ status: number; body: string }> {
    const parsed = url.parse(CLUSTER);
    return new Promise((resolve, reject) => {
        const opts: https.RequestOptions = {
            hostname: parsed.hostname,
            port: parseInt(parsed.port || '19080'),
            path,
            method,
            agent,
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            rejectUnauthorized: false,
        };
        if (body) opts.headers!['Content-Length'] = Buffer.byteLength(body);
        
        const req = https.request(opts, (res) => {
            const chunks: Buffer[] = [];
            res.on('data', (c: Buffer) => chunks.push(c));
            res.on('end', () => resolve({ status: res.statusCode || 0, body: Buffer.concat(chunks as any).toString('utf-8') }));
        });
        req.on('error', reject);
        req.setTimeout(120000);
        if (body) req.end(body);
        else req.end();
    });
}

async function main() {
    const cert = execSync(`pwsh -NoProfile -ExecutionPolicy Bypass -File "${getScriptPath()}" -Thumbprint "${THUMBPRINT}" -Type cert`, { encoding: 'utf-8' }).trim();
    const key = execSync(`pwsh -NoProfile -ExecutionPolicy Bypass -File "${getScriptPath()}" -Thumbprint "${THUMBPRINT}" -Type key`, { encoding: 'utf-8' }).trim();
    const agent = new https.Agent({ cert, key, rejectUnauthorized: false });

    console.log('=== 1. Verify Image Store content still present ===');
    const content = await makeRequest(agent, 'GET', '/ImageStore/VotingType?api-version=6.0');
    console.log(`GET /ImageStore/VotingType → ${content.status}`);
    if (content.status === 200) {
        const parsed = JSON.parse(content.body);
        console.log(`  Files: ${parsed.StoreFiles?.length || 0}, Folders: ${parsed.StoreFolders?.length || 0}`);
        for (const f of (parsed.StoreFiles || [])) console.log(`    ${f.StoreRelativePath} (${f.FileSize})`);
        for (const d of (parsed.StoreFolders || [])) console.log(`    ${d.StoreRelativePath}/ (${d.FileCount} files)`);
    }

    console.log('\n=== 2. Verify no provisioned types ===');
    const types = await makeRequest(agent, 'GET', '/ApplicationTypes?api-version=6.0');
    console.log(`App types: ${types.body.substring(0, 200)}`);

    console.log('\n=== 3. Provision with Kind FIRST in JSON ===');
    // IMPORTANT: Kind must be the first property in JSON
    const provBody = JSON.stringify({ Kind: 'ImageStorePath', Async: true, ApplicationTypeBuildPath: 'VotingType' });
    console.log(`Body: ${provBody}`);
    const prov = await makeRequest(agent, 'POST', '/ApplicationTypes/$/Provision?api-version=6.2&timeout=120', provBody);
    console.log(`Provision: ${prov.status}`);
    console.log(`Response: ${prov.body}`);

    if (prov.status >= 200 && prov.status < 300) {
        console.log('\n=== 4. Poll for provision completion ===');
        for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 3000));
            const check = await makeRequest(agent, 'GET', '/ApplicationTypes/VotingType?api-version=6.0');
            try {
                const parsed = JSON.parse(check.body);
                const items = parsed?.Items || [parsed];
                for (const t of items) {
                    console.log(`  ${t.Name} v${t.Version} - ${t.Status}`);
                    if (t.Status === 'Available') {
                        console.log('\n✅ PROVISION SUCCESSFUL!');
                        agent.destroy();
                        return;
                    }
                    if (t.Status === 'Failed') {
                        console.log(`\n❌ PROVISION FAILED: ${t.StatusDetails}`);
                        agent.destroy();
                        return;
                    }
                }
            } catch {}
        }
    }

    // Try Async=false as fallback
    if (prov.status >= 300) {
        console.log('\n=== 3b. Try Provision with Async=false ===');
        const provBody2 = JSON.stringify({ Kind: 'ImageStorePath', Async: false, ApplicationTypeBuildPath: 'VotingType' });
        console.log(`Body: ${provBody2}`);
        const prov2 = await makeRequest(agent, 'POST', '/ApplicationTypes/$/Provision?api-version=6.2&timeout=120', provBody2);
        console.log(`Provision: ${prov2.status}`);
        console.log(`Response: ${prov2.body}`);
    }

    agent.destroy();
}

main().catch(e => { console.error(`FAILED: ${e.message}`); process.exit(1); });
