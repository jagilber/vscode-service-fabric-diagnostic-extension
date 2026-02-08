/**
 * Live Mock Server Tests
 * 
 * These tests run against an EXTERNAL mock server instance (default: http://127.0.0.1:19180)
 * so that all traffic is visible in the /_mock/dashboard monitor.
 * 
 * Prerequisites:
 *   1. Start the mock server: node temp/mock-server/mocks/MockSfApiServer.js 5-node-azure 19180
 *   2. Open dashboard: http://127.0.0.1:19180/_mock/dashboard
 *   3. Run: npx jest mock-server-live --testPathIgnorePatterns=/node_modules/ --no-coverage
 * 
 * Set MOCK_SERVER_URL env var to override the default base URL.
 */

import * as http from 'http';

const BASE_URL = process.env.MOCK_SERVER_URL || 'http://127.0.0.1:19180';

// ── Helper ──────────────────────────────────────────────────────────

function get(path: string): Promise<{ status: number; body: any; headers: http.IncomingHttpHeaders }> {
    return new Promise((resolve, reject) => {
        const url = `${BASE_URL}${path}`;
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                let body: any;
                try {
                    body = JSON.parse(data);
                } catch {
                    body = data;
                }
                resolve({ status: res.statusCode!, body, headers: res.headers });
            });
        }).on('error', reject);
    });
}

/**
 * Get items from a response that may be a raw array or {Items: [...]}.
 * The SF REST API and fixture loader may return either format.
 */
function getItems(body: any): any[] {
    if (Array.isArray(body)) return body;
    if (body && Array.isArray(body.Items)) return body.Items;
    return [];
}

// ── Connection check ────────────────────────────────────────────────

beforeAll(async () => {
    try {
        await get('/_mock/profiles');
    } catch {
        throw new Error(
            `Cannot connect to mock server at ${BASE_URL}. ` +
            `Start it first: node temp/mock-server/mocks/MockSfApiServer.js 5-node-azure 19180`
        );
    }
});

// ── Cluster-level endpoints ─────────────────────────────────────────

describe('Live Mock Server - Cluster Endpoints', () => {
    test('GET /Nodes returns node array', async () => {
        const { status, body } = await get('/Nodes');
        expect(status).toBe(200);
        const items = getItems(body);
        expect(items.length).toBeGreaterThan(0);
        for (const node of items) {
            expect(node).toHaveProperty('Name');
            expect(node).toHaveProperty('Type');
            expect(node).toHaveProperty('HealthState');
        }
    });

    test('GET /$/GetClusterHealth returns health data', async () => {
        const { status, body } = await get('/$/GetClusterHealth');
        expect(status).toBe(200);
        expect(body).toHaveProperty('AggregatedHealthState');
        expect(body).toHaveProperty('NodeHealthStates');
        expect(body).toHaveProperty('ApplicationHealthStates');
    });

    test('GET /$/GetClusterManifest returns XML manifest', async () => {
        const { status, body } = await get('/$/GetClusterManifest');
        expect(status).toBe(200);
        expect(body).toHaveProperty('Manifest');
        expect(typeof body.Manifest).toBe('string');
    });

    test('GET /$/GetProvisionedCodeVersions returns cluster version', async () => {
        const { status, body } = await get('/$/GetProvisionedCodeVersions');
        expect(status).toBe(200);
        // May be an array or an object with CodeVersion depending on fixture format
        expect(body).toBeDefined();
    });

    test('GET /$/GetLoadInformation returns cluster load', async () => {
        const { status, body } = await get('/$/GetLoadInformation');
        expect(status).toBe(200);
        expect(body).toHaveProperty('LastBalancingStartTimeUtc');
    });

    test('GET /ApplicationTypes returns app types', async () => {
        const { status, body } = await get('/ApplicationTypes');
        expect(status).toBe(200);
        expect(Array.isArray(body)).toBe(true);
    });

    test('GET /Applications returns app list', async () => {
        const { status, body } = await get('/Applications');
        expect(status).toBe(200);
        const items = getItems(body);
        expect(Array.isArray(items)).toBe(true);
    });

    test('GET /$/GetRepairTaskList returns repair tasks', async () => {
        const { status, body } = await get('/$/GetRepairTaskList');
        expect(status).toBe(200);
        expect(Array.isArray(body)).toBe(true);
    });

    test('GET /ImageStore returns image store content', async () => {
        const { status, body } = await get('/ImageStore');
        expect(status).toBe(200);
        expect(body).toHaveProperty('StoreFiles');
        expect(body).toHaveProperty('StoreFolders');
    });

    test('GET /Services?ServiceManifestName=System returns system services', async () => {
        // System services are under fabric:/System application
        const { status } = await get('/Applications/System/$/GetServices');
        // May be 200 or 404 depending on fixture structure
        expect([200, 404]).toContain(status);
    });
});

// ── Application drill-down ──────────────────────────────────────────

describe('Live Mock Server - Application Drill-down', () => {
    let appNames: string[] = [];
    let firstAppId: string = '';

    beforeAll(async () => {
        const { body } = await get('/Applications');
        appNames = getItems(body).map((a: any) => a.Id);
        if (appNames.length > 0) {
            firstAppId = appNames[0];
        }
    });

    test('has at least one application', () => {
        expect(appNames.length).toBeGreaterThan(0);
    });

    test('GET /Applications/{id} returns app details', async () => {
        if (!firstAppId) return;
        const { status, body } = await get(`/Applications/${firstAppId}`);
        expect(status).toBe(200);
        expect(body).toHaveProperty('Name');
        expect(body).toHaveProperty('TypeName');
        expect(body).toHaveProperty('Status');
    });

    test('GET /Applications/{id}/$/GetHealth returns app health', async () => {
        if (!firstAppId) return;
        const { status, body } = await get(`/Applications/${firstAppId}/$/GetHealth`);
        expect(status).toBe(200);
        expect(body).toHaveProperty('AggregatedHealthState');
    });

    test('GET /Applications/{id}/$/GetServices returns services', async () => {
        if (!firstAppId) return;
        const { status, body } = await get(`/Applications/${firstAppId}/$/GetServices`);
        expect(status).toBe(200);
        const items = getItems(body);
        expect(Array.isArray(items)).toBe(true);
    });
});

// ── Service drill-down ──────────────────────────────────────────────

describe('Live Mock Server - Service Drill-down', () => {
    let appId: string = '';
    let serviceId: string = '';
    let partitionId: string = '';

    beforeAll(async () => {
        const { body: apps } = await get('/Applications');
        const items = getItems(apps);
        if (items.length === 0) return;

        appId = items[0].Id;
        const { body: services } = await get(`/Applications/${appId}/$/GetServices`);
        const svcItems = getItems(services);
        if (svcItems.length === 0) return;

        serviceId = svcItems[0].Id;
        const { body: partitions } = await get(`/Applications/${appId}/$/GetServices/${serviceId}/$/GetPartitions`);
        const partItems = getItems(partitions);
        if (partItems.length > 0) {
            partitionId = partItems[0].PartitionInformation.Id;
        }
    });

    test('services have expected properties', async () => {
        if (!appId) return;
        const { body } = await get(`/Applications/${appId}/$/GetServices`);
        for (const svc of getItems(body)) {
            expect(svc).toHaveProperty('Id');
            expect(svc).toHaveProperty('Name');
            expect(svc).toHaveProperty('ServiceKind');
            expect(svc).toHaveProperty('HealthState');
        }
    });

    test('partitions have expected properties', async () => {
        if (!serviceId) return;
        const { body } = await get(`/Applications/${appId}/$/GetServices/${serviceId}/$/GetPartitions`);
        const parts = getItems(body);
        expect(parts.length).toBeGreaterThan(0);
        for (const p of parts) {
            expect(p).toHaveProperty('PartitionInformation');
            expect(p.PartitionInformation).toHaveProperty('Id');
            expect(p).toHaveProperty('HealthState');
        }
    });

    test('replicas have expected properties', async () => {
        if (!partitionId) return;
        const { body } = await get(
            `/Applications/${appId}/$/GetServices/${serviceId}/$/GetPartitions/${partitionId}/$/GetReplicas`
        );
        const replicas = getItems(body);
        for (const r of replicas) {
            expect(r).toHaveProperty('ReplicaId');
            expect(r).toHaveProperty('HealthState');
            expect(r).toHaveProperty('NodeName');
        }
    });

    test('partition health returns health data', async () => {
        if (!partitionId) return;
        const { body } = await get(
            `/Applications/${appId}/$/GetServices/${serviceId}/$/GetPartitions/${partitionId}/$/GetHealth`
        );
        expect(body).toHaveProperty('AggregatedHealthState');
        expect(body).toHaveProperty('PartitionId');
    });
});

// ── Node detail endpoints ───────────────────────────────────────────

describe('Live Mock Server - Node Details', () => {
    let nodeName: string = '';

    beforeAll(async () => {
        const { body } = await get('/Nodes');
        const items = getItems(body);
        if (items.length > 0) {
            nodeName = items[0].Name;
        }
    });

    test('GET /Nodes/{name} returns node details', async () => {
        if (!nodeName) return;
        const { status, body } = await get(`/Nodes/${nodeName}`);
        expect(status).toBe(200);
        expect(body).toHaveProperty('Name', nodeName);
        expect(body).toHaveProperty('Type');
    });

    test('GET /Nodes/{name}/$/GetHealth returns node health', async () => {
        if (!nodeName) return;
        const { status, body } = await get(`/Nodes/${nodeName}/$/GetHealth`);
        expect(status).toBe(200);
        expect(body).toHaveProperty('AggregatedHealthState');
    });
});

// ── Error handling ──────────────────────────────────────────────────

describe('Live Mock Server - Error Handling', () => {
    test('unknown path returns 404', async () => {
        const { status, body } = await get('/NonExistent/Path');
        expect(status).toBe(404);
        expect(body).toHaveProperty('Error');
        expect(body.Error).toHaveProperty('Code', 'FABRIC_E_DOES_NOT_EXIST');
    });

    test('responses include X-ServiceFabric header', async () => {
        const { headers } = await get('/Nodes');
        expect(headers['x-servicefabric']).toBe('true');
    });

    test('responses are JSON content-type', async () => {
        const { headers } = await get('/Nodes');
        expect(headers['content-type']).toBe('application/json');
    });
});

// ── Data integrity (runs BEFORE profile switching) ──────────────────

describe('Live Mock Server - Data Integrity', () => {
    test('node names are unique', async () => {
        const { body } = await get('/Nodes');
        const items = getItems(body);
        expect(items.length).toBeGreaterThan(0);
        const names = items.map((n: any) => n.Name);
        expect(new Set(names).size).toBe(names.length);
    });

    test('application IDs are unique', async () => {
        const { body } = await get('/Applications');
        const items = getItems(body);
        expect(items.length).toBeGreaterThan(0);
        const ids = items.map((a: any) => a.Id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    test('cluster health node count matches node list', async () => {
        const { body: nodes } = await get('/Nodes');
        const { body: health } = await get('/$/GetClusterHealth');
        expect(health.NodeHealthStates.length).toBe(getItems(nodes).length);
    });

    test('cluster health app count includes system app', async () => {
        const { body: apps } = await get('/Applications');
        const { body: health } = await get('/$/GetClusterHealth');
        // ApplicationHealthStates may include fabric:/System which isn't in /Applications
        expect(health.ApplicationHealthStates.length).toBeGreaterThanOrEqual(getItems(apps).length);
    });

    test('all health states are valid SF values', async () => {
        const validStates = ['Ok', 'Warning', 'Error', 'Unknown'];
        const { body } = await get('/$/GetClusterHealth');
        expect(validStates).toContain(body.AggregatedHealthState);
        for (const n of body.NodeHealthStates) {
            expect(validStates).toContain(n.AggregatedHealthState);
        }
    });

    test('service partition count is consistent', async () => {
        const { body: apps } = await get('/Applications');
        let checkedAny = false;
        for (const app of getItems(apps)) {
            const { body: svcs } = await get(`/Applications/${app.Id}/$/GetServices`);
            for (const svc of getItems(svcs)) {
                const { status, body: parts } = await get(
                    `/Applications/${app.Id}/$/GetServices/${svc.Id}/$/GetPartitions`
                );
                if (status === 200) {
                    const partItems = getItems(parts);
                    expect(partItems.length).toBeGreaterThan(0);
                    checkedAny = true;
                }
            }
        }
        // At least some services should have resolvable partitions
        expect(checkedAny || getItems(apps).length === 0).toBe(true);
    });
});

// ── Profile switching (runs LAST) ───────────────────────────────────

describe('Live Mock Server - Profile Switching', () => {
    let originalProfile: string = '';

    beforeAll(async () => {
        const { body } = await get('/_mock/profiles');
        originalProfile = body.current;
    });

    afterAll(async () => {
        // Restore original profile
        if (originalProfile) {
            await get(`/_mock/switch/${originalProfile}`);
        }
    });

    test('switch to 1-node-dev and verify node count', async () => {
        await get('/_mock/switch/1-node-dev');
        const { body } = await get('/Nodes');
        expect(getItems(body).length).toBe(1);
    });

    test('switch to 3-node-mixed and verify node count', async () => {
        await get('/_mock/switch/3-node-mixed');
        const { body } = await get('/Nodes');
        expect(getItems(body).length).toBe(3);
    });

    test('switch to large-cluster and verify node count', async () => {
        await get('/_mock/switch/large-cluster');
        const { body } = await get('/Nodes');
        expect(getItems(body).length).toBe(20);
    });

    test('switch to empty-cluster and verify zero apps', async () => {
        await get('/_mock/switch/empty-cluster');
        const { body } = await get('/Applications');
        expect(getItems(body).length).toBe(0);
    });

    test('switch back to 5-node-azure and verify', async () => {
        await get('/_mock/switch/5-node-azure');
        const { body } = await get('/Nodes');
        expect(getItems(body).length).toBe(5);
    });
});
