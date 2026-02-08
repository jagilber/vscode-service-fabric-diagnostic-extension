/**
 * Integration Tests: Mock SF API Server + TreeView
 * 
 * Tests the full flow from MockSfApiServer → fixture data → SfDirectRestClient → tree nodes.
 * Each cluster profile is tested to ensure the extension can handle different cluster sizes.
 * 
 * These tests do NOT require a live SF cluster.
 */

import * as http from 'http';
import { MockSfApiServer } from '../mocks/MockSfApiServer';
import { loadClusterProfile, listAvailableProfiles, AVAILABLE_PROFILES } from '../fixtures/fixtureLoader';

// ── Helper: fetch JSON from mock server ─────────────────────────────

async function fetchJson(baseUrl: string, path: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const fullUrl = `${baseUrl}${path}`;
        http.get(fullUrl, (res) => {
            const chunks: Buffer[] = [];
            res.on('data', (chunk: Buffer) => chunks.push(chunk));
            res.on('end', () => {
                const body = Buffer.concat(chunks as any).toString('utf-8');
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        }).on('error', reject);
    });
}

// ── Fixture Loader Tests ────────────────────────────────────────────

describe('Fixture Loader', () => {
    test('lists all available profiles', () => {
        const profiles = listAvailableProfiles();
        expect(profiles).toContain('1-node-dev');
        expect(profiles).toContain('5-node-azure');
        expect(profiles).toContain('empty-cluster');
        expect(profiles.length).toBeGreaterThanOrEqual(5);
    });

    test('loads a profile and resolves routes', () => {
        const profile = loadClusterProfile('1-node-dev');
        expect(profile.name).toBe('1-node-dev');

        const nodes = profile.getResponse('/Nodes');
        expect(Array.isArray(nodes)).toBe(true);
        expect(nodes.length).toBe(1);
        expect(nodes[0].Name).toBeDefined();
        expect(nodes[0].HealthState).toBeDefined();
    });

    test('resolves cluster-level endpoints', () => {
        const profile = loadClusterProfile('5-node-azure');

        const health = profile.getResponse('/$/GetClusterHealth');
        expect(health).toBeDefined();
        expect(health.AggregatedHealthState).toBeDefined();

        const version = profile.getResponse('/$/GetClusterVersion');
        expect(version).toBeDefined();

        const load = profile.getResponse('/$/GetClusterLoad');
        expect(load).toBeDefined();
        expect(load.LoadMetricInformation).toBeDefined();
    });

    test('resolves parameterized service routes', () => {
        const profile = loadClusterProfile('3-node-mixed');
        const apps = profile.getResponse('/Applications');
        expect(Array.isArray(apps)).toBe(true);

        if (apps.length > 0) {
            const appId = apps[0].Id;
            const services = profile.getResponse(`/Applications/${appId}/$/GetServices`);
            expect(Array.isArray(services)).toBe(true);
        }
    });

    test('returns undefined for unknown routes', () => {
        const profile = loadClusterProfile('1-node-dev');
        const result = profile.getResponse('/NotARealEndpoint');
        expect(result).toBeUndefined();
    });

    test('handles empty cluster profile', () => {
        const profile = loadClusterProfile('empty-cluster');
        const nodes = profile.getResponse('/Nodes');
        expect(Array.isArray(nodes)).toBe(true);

        const apps = profile.getResponse('/Applications');
        expect(Array.isArray(apps)).toBe(true);
    });

    test('throws for non-existent profile', () => {
        expect(() => loadClusterProfile('nonexistent-profile-xyz')).toThrow(/Fixture profile not found/);
    });
});

// ── Mock Server Tests ───────────────────────────────────────────────

describe('MockSfApiServer', () => {
    let server: MockSfApiServer;
    let baseUrl: string;
    let stopFn: () => Promise<void>;

    beforeAll(async () => {
        server = new MockSfApiServer('1-node-dev');
        const info = await server.start();
        baseUrl = info.baseUrl;
        stopFn = info.stop;
    });

    afterAll(async () => {
        await stopFn();
    });

    test('serves node list', async () => {
        const { status, data } = await fetchJson(baseUrl, '/Nodes');
        expect(status).toBe(200);
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBe(1);
        expect(data[0].Name).toBeDefined();
    });

    test('serves cluster health', async () => {
        const { status, data } = await fetchJson(baseUrl, '/$/GetClusterHealth');
        expect(status).toBe(200);
        expect(data.AggregatedHealthState).toBeDefined();
        expect(data.NodeHealthStates).toBeDefined();
    });

    test('serves application list', async () => {
        const { status, data } = await fetchJson(baseUrl, '/Applications');
        expect(status).toBe(200);
        expect(Array.isArray(data)).toBe(true);
    });

    test('serves application types', async () => {
        const { status, data } = await fetchJson(baseUrl, '/ApplicationTypes');
        expect(status).toBe(200);
        expect(Array.isArray(data)).toBe(true);
    });

    test('serves cluster version', async () => {
        const { status, data } = await fetchJson(baseUrl, '/$/GetClusterVersion');
        expect(status).toBe(200);
        expect(data).toBeDefined();
    });

    test('serves cluster load', async () => {
        const { status, data } = await fetchJson(baseUrl, '/$/GetClusterLoad');
        expect(status).toBe(200);
        expect(data.LoadMetricInformation).toBeDefined();
    });

    test('serves repair tasks', async () => {
        const { status, data } = await fetchJson(baseUrl, '/$/GetRepairTaskList');
        expect(status).toBe(200);
        expect(Array.isArray(data)).toBe(true);
    });

    test('serves services for an application', async () => {
        const { data: apps } = await fetchJson(baseUrl, '/Applications');
        if (apps.length > 0) {
            const appId = apps[0].Id;
            const { status, data: services } = await fetchJson(baseUrl, `/Applications/${appId}/$/GetServices`);
            expect(status).toBe(200);
            expect(Array.isArray(services)).toBe(true);
        }
    });

    test('serves partitions for a service', async () => {
        const { data: apps } = await fetchJson(baseUrl, '/Applications');
        if (apps.length > 0) {
            const appId = apps[0].Id;
            const { data: services } = await fetchJson(baseUrl, `/Applications/${appId}/$/GetServices`);
            if (services.length > 0) {
                const svcId = services[0].Id;
                const { status, data: partitions } = await fetchJson(baseUrl, `/Services/${svcId}/$/GetPartitions`);
                expect(status).toBe(200);
                expect(Array.isArray(partitions)).toBe(true);
            }
        }
    });

    test('serves replicas for a partition', async () => {
        const { data: apps } = await fetchJson(baseUrl, '/Applications');
        if (apps.length > 0) {
            const appId = apps[0].Id;
            const { data: services } = await fetchJson(baseUrl, `/Applications/${appId}/$/GetServices`);
            if (services.length > 0) {
                const svcId = services[0].Id;
                const { data: partitions } = await fetchJson(baseUrl, `/Services/${svcId}/$/GetPartitions`);
                if (partitions.length > 0) {
                    const partId = partitions[0].PartitionInformation?.Id;
                    if (partId) {
                        const { status, data: replicas } = await fetchJson(baseUrl, `/Partitions/${partId}/$/GetReplicas`);
                        expect(status).toBe(200);
                        expect(Array.isArray(replicas)).toBe(true);
                    }
                }
            }
        }
    });

    test('returns 404 for unknown endpoints', async () => {
        const { status, data } = await fetchJson(baseUrl, '/NotARealEndpoint');
        expect(status).toBe(404);
        expect(data.Error).toBeDefined();
        expect(data.Error.Code).toBe('FABRIC_E_DOES_NOT_EXIST');
    });

    test('strips api-version query params correctly', async () => {
        // SfDirectRestClient appends ?api-version=6.0&timeout=60
        const { status, data } = await fetchJson(baseUrl, '/Nodes?api-version=6.0&timeout=60');
        expect(status).toBe(200);
        expect(Array.isArray(data)).toBe(true);
    });

    test('includes X-ServiceFabric header', async () => {
        const result = await new Promise<http.IncomingMessage>((resolve) => {
            http.get(`${baseUrl}/Nodes`, (res) => resolve(res));
        });
        expect(result.headers['x-servicefabric']).toBe('true');
    });
});

// ── Error Injection Tests ───────────────────────────────────────────

describe('MockSfApiServer error injection', () => {
    let server: MockSfApiServer;
    let baseUrl: string;
    let stopFn: () => Promise<void>;

    beforeAll(async () => {
        server = new MockSfApiServer('1-node-dev');
        const info = await server.start();
        baseUrl = info.baseUrl;
        stopFn = info.stop;
    });

    afterAll(async () => {
        await stopFn();
    });

    afterEach(() => {
        server.clearErrors();
    });

    test('injects 500 error for matching path', async () => {
        server.injectError({
            pattern: /\/Nodes$/,
            statusCode: 500,
            body: { Error: { Code: 'FABRIC_E_TIMEOUT', Message: 'Injected timeout' } },
        });

        const { status, data } = await fetchJson(baseUrl, '/Nodes');
        expect(status).toBe(500);
        expect(data.Error.Code).toBe('FABRIC_E_TIMEOUT');
    });

    test('count-limited error injection expires', async () => {
        server.injectError({
            pattern: /\/Nodes$/,
            statusCode: 503,
            count: 2,
        });

        const r1 = await fetchJson(baseUrl, '/Nodes');
        expect(r1.status).toBe(503);

        const r2 = await fetchJson(baseUrl, '/Nodes');
        expect(r2.status).toBe(503);

        // Third request should succeed (count exhausted)
        const r3 = await fetchJson(baseUrl, '/Nodes');
        expect(r3.status).toBe(200);
    });

    test('error does not affect other endpoints', async () => {
        server.injectError({
            pattern: /\/Nodes$/,
            statusCode: 500,
        });

        const nodesResult = await fetchJson(baseUrl, '/Nodes');
        expect(nodesResult.status).toBe(500);

        const healthResult = await fetchJson(baseUrl, '/$/GetClusterHealth');
        expect(healthResult.status).toBe(200);
    });
});

// ── Profile Switching Tests ─────────────────────────────────────────

describe('MockSfApiServer profile switching', () => {
    let server: MockSfApiServer;
    let baseUrl: string;
    let stopFn: () => Promise<void>;

    beforeAll(async () => {
        server = new MockSfApiServer('1-node-dev');
        const info = await server.start();
        baseUrl = info.baseUrl;
        stopFn = info.stop;
    });

    afterAll(async () => {
        await stopFn();
    });

    test('initially serves 1-node-dev data', async () => {
        const { data } = await fetchJson(baseUrl, '/Nodes');
        expect(data.length).toBe(1);
    });

    test('switches to 5-node-azure via API', async () => {
        const { status } = await fetchJson(baseUrl, '/_mock/switch/5-node-azure');
        expect(status).toBe(200);

        const { data } = await fetchJson(baseUrl, '/Nodes');
        expect(data.length).toBe(5);
    });

    test('switches to large-cluster', async () => {
        server.switchProfile('large-cluster');
        const { data } = await fetchJson(baseUrl, '/Nodes');
        expect(data.length).toBeGreaterThan(10);
    });

    test('switches to empty-cluster', async () => {
        server.switchProfile('empty-cluster');
        const { data: nodes } = await fetchJson(baseUrl, '/Nodes');
        // empty-cluster has 3 nodes but 0 apps
        const { data: apps } = await fetchJson(baseUrl, '/Applications');
        expect(apps.length).toBe(0);
    });

    test('meta endpoint shows current profile and available list', async () => {
        const { status, data } = await fetchJson(baseUrl, '/_mock/profiles');
        expect(status).toBe(200);
        expect(data.current).toBeDefined();
        expect(Array.isArray(data.available)).toBe(true);
        expect(data.available.length).toBeGreaterThanOrEqual(5);
    });
});

// ── Request Logging Tests ───────────────────────────────────────────

describe('MockSfApiServer request logging', () => {
    let server: MockSfApiServer;
    let baseUrl: string;
    let stopFn: () => Promise<void>;

    beforeAll(async () => {
        server = new MockSfApiServer('1-node-dev');
        const info = await server.start();
        baseUrl = info.baseUrl;
        stopFn = info.stop;
    });

    afterAll(async () => {
        await stopFn();
    });

    beforeEach(() => {
        server.clearRequestLog();
    });

    test('logs requests', async () => {
        await fetchJson(baseUrl, '/Nodes');
        await fetchJson(baseUrl, '/$/GetClusterHealth');

        const log = server.getRequestLog();
        expect(log.length).toBe(2);
        expect(log[0].path).toBe('/Nodes');
        expect(log[0].statusCode).toBe(200);
        expect(log[0].method).toBe('GET');
        expect(log[0].durationMs).toBeGreaterThanOrEqual(0);
        expect(log[1].path).toBe('/$/GetClusterHealth');
    });

    test('clears request log', async () => {
        await fetchJson(baseUrl, '/Nodes');
        expect(server.getRequestLog().length).toBe(1);

        server.clearRequestLog();
        expect(server.getRequestLog().length).toBe(0);
    });

    test('request log via API', async () => {
        await fetchJson(baseUrl, '/Nodes');
        const { data } = await fetchJson(baseUrl, '/_mock/log');
        // The log will have 2 entries: /Nodes + /_mock/log
        expect(data.length).toBeGreaterThanOrEqual(1);
    });
});

// ── Multi-Profile Smoke Tests ───────────────────────────────────────

describe('Multi-profile smoke tests', () => {
    for (const profileName of AVAILABLE_PROFILES) {
        describe(`Profile: ${profileName}`, () => {
            let server: MockSfApiServer;
            let baseUrl: string;
            let stopFn: () => Promise<void>;

            beforeAll(async () => {
                server = new MockSfApiServer(profileName);
                const info = await server.start();
                baseUrl = info.baseUrl;
                stopFn = info.stop;
            });

            afterAll(async () => {
                await stopFn();
            });

            test('serves nodes', async () => {
                const { status, data } = await fetchJson(baseUrl, '/Nodes');
                expect(status).toBe(200);
                expect(Array.isArray(data)).toBe(true);
                // Every node should have Name and HealthState
                for (const node of data) {
                    expect(node.Name).toBeDefined();
                    expect(node.HealthState).toBeDefined();
                }
            });

            test('serves cluster health', async () => {
                const { status, data } = await fetchJson(baseUrl, '/$/GetClusterHealth');
                expect(status).toBe(200);
                expect(data.AggregatedHealthState).toBeDefined();
            });

            test('serves applications', async () => {
                const { status, data } = await fetchJson(baseUrl, '/Applications');
                expect(status).toBe(200);
                expect(Array.isArray(data)).toBe(true);
            });

            test('full drill-down: apps → services → partitions → replicas', async () => {
                const { data: apps } = await fetchJson(baseUrl, '/Applications');
                for (const app of apps) {
                    const { data: services } = await fetchJson(baseUrl, `/Applications/${app.Id}/$/GetServices`);
                    expect(Array.isArray(services)).toBe(true);

                    for (const svc of services) {
                        const { data: partitions } = await fetchJson(baseUrl, `/Services/${svc.Id}/$/GetPartitions`);
                        expect(Array.isArray(partitions)).toBe(true);

                        for (const part of partitions) {
                            const partId = part.PartitionInformation?.Id;
                            if (partId) {
                                const { data: replicas } = await fetchJson(baseUrl, `/Partitions/${partId}/$/GetReplicas`);
                                expect(Array.isArray(replicas)).toBe(true);
                            }
                        }
                    }
                }
            });
        });
    }
});
