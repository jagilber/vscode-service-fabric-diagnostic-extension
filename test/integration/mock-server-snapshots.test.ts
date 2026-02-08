/**
 * Golden File Snapshot Tests: Mock SF API Server Responses
 * 
 * Serializes the full JSON response from every mock server endpoint for each
 * cluster profile and compares against stored baselines using Jest snapshots.
 * 
 * Any drift in fixture data, route mapping, or response structure causes a
 * test failure with a readable diff. Run `npm run update:snapshots` to accept
 * intentional changes.
 * 
 * These tests do NOT require a live SF cluster.
 */

import * as http from 'http';
import { MockSfApiServer } from '../mocks/MockSfApiServer';
import { AVAILABLE_PROFILES } from '../fixtures/fixtureLoader';

// ── Helper ──────────────────────────────────────────────────────────

async function fetchJson(baseUrl: string, path: string): Promise<any> {
    return new Promise((resolve, reject) => {
        http.get(`${baseUrl}${path}`, (res) => {
            const chunks: Buffer[] = [];
            res.on('data', (chunk: Buffer) => chunks.push(chunk));
            res.on('end', () => {
                const body = Buffer.concat(chunks as any).toString('utf-8');
                try {
                    resolve(JSON.parse(body));
                } catch {
                    resolve(body);
                }
            });
        }).on('error', reject);
    });
}

// ── Snapshot Tests ──────────────────────────────────────────────────

/**
 * Cluster-level endpoints that return the same shape regardless of
 * which apps/services exist. One snapshot per profile.
 */
const CLUSTER_ENDPOINTS = [
    { name: 'Nodes', path: '/Nodes' },
    { name: 'ClusterHealth', path: '/$/GetClusterHealth' },
    { name: 'ClusterVersion', path: '/$/GetClusterVersion' },
    { name: 'ClusterLoad', path: '/$/GetClusterLoad' },
    { name: 'ClusterManifest', path: '/$/GetClusterManifest' },
    { name: 'ApplicationTypes', path: '/ApplicationTypes' },
    { name: 'Applications', path: '/Applications' },
    { name: 'RepairTasks', path: '/$/GetRepairTaskList' },
    { name: 'ImageStore', path: '/ImageStore' },
    { name: 'SystemServices', path: '/Applications/System/$/GetServices' },
];

for (const profileName of AVAILABLE_PROFILES) {
    describe(`Snapshot: ${profileName}`, () => {
        let server: MockSfApiServer;
        let baseUrl: string;

        beforeAll(async () => {
            server = new MockSfApiServer(profileName);
            const info = await server.start();
            baseUrl = info.baseUrl;
        });

        afterAll(async () => {
            await server.stop();
        });

        // ── Cluster-level endpoint snapshots ──

        for (const endpoint of CLUSTER_ENDPOINTS) {
            test(`${endpoint.name}`, async () => {
                const data = await fetchJson(baseUrl, endpoint.path);
                expect(data).toMatchSnapshot();
            });
        }

        // ── Drill-down snapshots: services, partitions, replicas ──

        test('full drill-down', async () => {
            const apps: any[] = await fetchJson(baseUrl, '/Applications');
            const drillDown: Record<string, any> = {};

            for (const app of apps) {
                const appId = app.Id;
                const services: any[] = await fetchJson(baseUrl, `/Applications/${appId}/$/GetServices`);
                drillDown[`services/${appId}`] = services;

                for (const svc of services) {
                    const svcId = svc.Id;
                    const partitions: any[] = await fetchJson(baseUrl, `/Services/${svcId}/$/GetPartitions`);
                    drillDown[`partitions/${svcId}`] = partitions;

                    for (const part of partitions) {
                        const partId = part.PartitionInformation?.Id;
                        if (partId) {
                            const replicas: any[] = await fetchJson(baseUrl, `/Partitions/${partId}/$/GetReplicas`);
                            drillDown[`replicas/${partId}`] = replicas;
                        }
                    }
                }
            }

            expect(drillDown).toMatchSnapshot();
        });

        // ── PII guard: verify no real IPs or thumbprints leak ──

        test('no PII in responses', async () => {
            const endpoints = ['/Nodes', '/$/GetClusterHealth', '/Applications'];
            for (const ep of endpoints) {
                const raw = JSON.stringify(await fetchJson(baseUrl, ep));
                // Real public IPs (not 10.x.x.x or 192.168.x.x)
                const publicIpMatches = raw.match(/\b(?!10\.)(?!192\.168\.)(?!127\.)\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g);
                // Filter out private ranges that start with 172.16-31
                const realPublicIps = (publicIpMatches || []).filter(ip => {
                    const parts = ip.split('.').map(Number);
                    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) { return false; }
                    return true;
                });
                expect(realPublicIps).toEqual([]);

                // Real Azure domain patterns
                expect(raw).not.toMatch(/[a-z0-9-]+\.(centralus|eastus|westus|northeurope)\.cloudapp\.azure\.com/i);
            }
        });
    });
}
