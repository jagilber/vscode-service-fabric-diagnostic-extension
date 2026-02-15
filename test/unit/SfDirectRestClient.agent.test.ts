/**
 * Tests for SfDirectRestClient HTTPS agent configuration.
 *
 * Validates:
 * - keepAlive is true (enables TCP+TLS connection reuse)
 * - maxSockets = 8 (enables up to 8 concurrent connections)
 * - maxFreeSockets = 8 (keeps idle connections available for reuse)
 */

import * as https from 'https';
import { SfDirectRestClient } from '../../src/services/SfDirectRestClient';

describe('SfDirectRestClient — HTTPS agent configuration', () => {
    let client: SfDirectRestClient;
    let agent: https.Agent;

    beforeAll(() => {
        client = new SfDirectRestClient({
            endpoint: 'https://test-cluster:19080',
            certificate: 'test-cert',
            key: Buffer.from('test-key'),
        });
        // Access private httpsAgent via bracket notation
        agent = (client as any).httpsAgent;
    });

    test('should create an HTTPS agent', () => {
        expect(agent).toBeInstanceOf(https.Agent);
    });

    test('should set keepAlive: true', () => {
        expect((agent as any).keepAlive).toBe(true);
    });

    test('should set maxSockets: 8', () => {
        expect(agent.maxSockets).toBe(8);
    });

    test('should set maxFreeSockets: 8', () => {
        expect(agent.maxFreeSockets).toBe(8);
    });
});
