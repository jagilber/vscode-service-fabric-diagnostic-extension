/**
 * Integration test: chunked upload to real SF cluster
 *
 * Uses .env config (SF_TEST_CLUSTER, SF_TEST_THUMBPRINT, RUN_INTEGRATION_TESTS)
 * and existing extension functions (SfRest, SfPs) — same pattern as 00-api-version tests.
 *
 * SfRest.connectToCluster()        → connect with cert from Windows store
 * SfRest.uploadToImageStore()      → upload (auto-chunks files > 2MB)
 * SfRest.getImageStoreContent()    → verify upload
 * SfRest.deleteImageStoreContent() → cleanup
 */

import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env before any src imports (vscode mock must come before SfPs/SfRest import)
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Mock vscode module (required by SfPs, SfRest, SfUtility, SfConstants)
jest.mock('vscode', () => ({
    window: {
        createOutputChannel: jest.fn(() => ({
            appendLine: jest.fn(),
            append: jest.fn(),
            error: jest.fn(),
            clear: jest.fn(),
            show: jest.fn(),
            dispose: jest.fn()
        })),
        showInformationMessage: jest.fn(),
        showWarningMessage: jest.fn(),
        showErrorMessage: jest.fn()
    },
    workspace: {
        getConfiguration: jest.fn(() => ({
            get: jest.fn(() => undefined)
        }))
    },
    env: {
        createTelemetryLogger: jest.fn(() => ({
            logUsage: jest.fn(),
            logError: jest.fn(),
            dispose: jest.fn()
        }))
    },
    Uri: {
        parse: jest.fn((str: string) => ({ fsPath: str, toString: () => str })),
        file: jest.fn((str: string) => ({ fsPath: str, toString: () => str }))
    },
    TreeItem: class TreeItem {
        constructor(public label: string, public collapsibleState?: any) {}
    },
    TreeItemCollapsibleState: { None: 0, Collapsed: 1, Expanded: 2 },
    ThemeIcon: class ThemeIcon {
        constructor(public id: string, public color?: any) {}
    },
    ThemeColor: class ThemeColor {
        constructor(public id: string) {}
    },
    version: '1.0.0'
}), { virtual: true });

import { SfRest } from '../../src/sfRest';
import { SfPs } from '../../src/sfPs';

const TEST_CLUSTER = process.env.SF_TEST_CLUSTER;
const TEST_THUMBPRINT = process.env.SF_TEST_THUMBPRINT;
const RUN_TESTS = process.env.RUN_INTEGRATION_TESTS === 'true';

// Test image store path prefix — unique per run to avoid collisions
const TEST_PREFIX = `__chunked_upload_test_${Date.now()}`;

const describeIfConfigured = RUN_TESTS && TEST_CLUSTER && TEST_THUMBPRINT ? describe : describe.skip;

describeIfConfigured('Chunked Upload Integration — Real SF Cluster', () => {
    let sfRest: SfRest;
    let sfPs: SfPs;
    const uploadedPaths: string[] = [];

    beforeAll(async () => {
        console.log(`\n${'='.repeat(60)}`);
        console.log('CHUNKED UPLOAD INTEGRATION TEST');
        console.log(`${'='.repeat(60)}`);
        console.log(`Cluster: ${TEST_CLUSTER}`);
        console.log(`Thumbprint: ${TEST_THUMBPRINT!.substring(0, 8)}...`);
        console.log(`${'='.repeat(60)}\n`);

        const mockContext = {
            extensionPath: __dirname,
            globalStorageUri: { fsPath: path.join(__dirname, 'temp-storage') },
            subscriptions: []
        };

        sfRest = new SfRest(mockContext);
        sfPs = new SfPs();

        await sfPs.init();
        const certPem = await sfPs.getPemCertFromLocalCertStore(TEST_THUMBPRINT!);
        const keyPem = await sfPs.getPemKeyFromLocalCertStore(TEST_THUMBPRINT!);

        if (!certPem || !keyPem) {
            throw new Error(`Certificate not found in Windows cert store: ${TEST_THUMBPRINT}`);
        }

        await sfRest.connectToCluster(TEST_CLUSTER!, {
            thumbprint: TEST_THUMBPRINT,
            certificate: certPem,
            key: keyPem
        });

        console.log('  Connected to cluster\n');
    }, 60000);

    afterAll(async () => {
        // Cleanup uploaded test files using SfRest
        for (const p of uploadedPaths) {
            try {
                await sfRest.deleteImageStoreContent(p);
                console.log(`  Cleaned up: ${p}`);
            } catch (err) {
                console.warn(`  Cleanup failed for ${p}: ${err}`);
            }
        }
        try {
            await sfRest.deleteImageStoreContent(TEST_PREFIX);
            console.log(`  Cleaned up folder: ${TEST_PREFIX}`);
        } catch { /* ignore */ }

        if (sfPs) { sfPs.destroy(); }
    }, 60000);

    // ── Tests ────────────────────────────────────────────────────

    test('cluster is reachable', async () => {
        const health = await sfRest.getClusterHealth();
        console.log(`  Cluster health: ${health.aggregatedHealthState}`);
        expect(health).toBeTruthy();
    }, 30000);

    test('small file upload (< 2MB) — single PUT', async () => {
        const contentPath = `${TEST_PREFIX}/small_test.txt`;
        const content = Buffer.from('Hello from integration test — small file upload');
        uploadedPaths.push(contentPath);

        await sfRest.uploadToImageStore(contentPath, content);

        const storeContent = await sfRest.getImageStoreContent(TEST_PREFIX);
        console.log('  Image store content after small upload:', JSON.stringify(storeContent).substring(0, 200));
        expect(storeContent).toBeTruthy();
    }, 60000);

    test('large file upload (3MB) — chunked via UploadChunk + CommitSession', async () => {
        const contentPath = `${TEST_PREFIX}/chunked_3mb.bin`;
        const size = 3 * 1024 * 1024;
        const content = Buffer.alloc(size);
        for (let i = 0; i < size; i++) { content[i] = i % 256; }
        uploadedPaths.push(contentPath);

        console.log(`  Uploading ${size} bytes (expect chunked upload)...`);
        const start = Date.now();
        await sfRest.uploadToImageStore(contentPath, content);
        const elapsed = Date.now() - start;
        console.log(`  Upload completed in ${elapsed}ms`);

        const storeContent = await sfRest.getImageStoreContent(TEST_PREFIX);
        console.log('  Image store content:', JSON.stringify(storeContent).substring(0, 300));
        expect(storeContent).toBeTruthy();
    }, 120000);

    test('large file upload (10MB) — multiple chunks', async () => {
        const contentPath = `${TEST_PREFIX}/chunked_10mb.bin`;
        const size = 10 * 1024 * 1024;
        const content = Buffer.alloc(size, 0xAB);
        uploadedPaths.push(contentPath);

        console.log(`  Uploading ${size} bytes (expect 3 x 4MB chunks)...`);
        const start = Date.now();
        await sfRest.uploadToImageStore(contentPath, content);
        const elapsed = Date.now() - start;
        console.log(`  Upload completed in ${elapsed}ms`);

        const storeContent = await sfRest.getImageStoreContent(TEST_PREFIX);
        expect(storeContent).toBeTruthy();
    }, 300000);
}, 600000);
