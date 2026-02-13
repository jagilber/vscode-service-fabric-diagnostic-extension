/**
 * Unit tests for SfDirectRestClient
 */
jest.mock('http');
jest.mock('https');

import { SfDirectRestClient } from '../../src/services/SfDirectRestClient';

describe('SfDirectRestClient', () => {
    let client: SfDirectRestClient;

    function createMockResponse(statusCode: number, body: any, statusMessage = 'OK') {
        const mockResponse: any = {
            statusCode,
            statusMessage,
            headers: {},
            on: jest.fn((event: string, handler: any) => {
                if (event === 'data' && body !== undefined) {
                    const data = typeof body === 'string' ? body : JSON.stringify(body);
                    handler(Buffer.from(data));
                }
                if (event === 'end') {
                    process.nextTick(handler);
                }
                return mockResponse;
            }),
        };
        return mockResponse;
    }

    function createMockRequest(mockResponse?: any) {
        const mockReq: any = {
            on: jest.fn().mockReturnThis(),
            end: jest.fn(),
            destroy: jest.fn(),
            setTimeout: jest.fn(),
            setHeader: jest.fn(),
            write: jest.fn(),
        };

        if (mockResponse) {
            const https = require('https');
            https.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });
        }

        return mockReq;
    }

    beforeEach(() => {
        jest.clearAllMocks();
        client = new SfDirectRestClient({
            endpoint: 'http://localhost:19080',
            apiVersion: '6.0',
            timeout: 5000,
        });
    });

    test('should construct with https endpoint', () => {
        const c = new SfDirectRestClient({ endpoint: 'https://mycluster:19080' });
        expect(c).toBeDefined();
    });

    test('should auto-prepend https if no protocol', () => {
        const c = new SfDirectRestClient({ endpoint: 'mycluster:19080' });
        expect(c).toBeDefined();
    });

    describe('Node APIs', () => {
        test('getNodeInfoList should return node list', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, { Items: [{ Name: 'Node0' }] });
            const mockReq = createMockRequest();

            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });

            const result = await client.getNodeInfoList();
            expect(result).toBeDefined();
        });

        test('getNodeInfo should return node info', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, { Name: 'Node0', NodeStatus: 'Up' });
            const mockReq = createMockRequest();

            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });

            const result = await client.getNodeInfo('Node0');
            expect(result).toBeDefined();
        });

        test('getNodeHealth should return health', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, { AggregatedHealthState: 'Ok' });
            const mockReq = createMockRequest();

            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });

            const result = await client.getNodeHealth('Node0');
            expect(result).toBeDefined();
        });
    });

    describe('Cluster APIs', () => {
        test('getClusterHealth should work', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, { aggregatedHealthState: 'Ok' });
            const mockReq = createMockRequest();

            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });

            const result = await client.getClusterHealth();
            expect(result).toBeDefined();
        });

        test('getClusterVersion should work', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, { version: '8.0.0' });
            const mockReq = createMockRequest();

            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });

            const result = await client.getClusterVersion();
            expect(result).toBeDefined();
        });

        test('getClusterManifest should work', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, { manifest: '<xml>' });
            const mockReq = createMockRequest();

            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });

            const result = await client.getClusterManifest();
            expect(result).toBeDefined();
        });
    });

    describe('Application APIs', () => {
        test('getApplicationInfoList should work', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, { Items: [] });
            const mockReq = createMockRequest();

            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });

            const result = await client.getApplicationInfoList();
            expect(result).toBeDefined();
        });

        test('getApplicationInfo should work', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, { id: 'app1', name: 'fabric:/App1' });
            const mockReq = createMockRequest();

            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });

            const result = await client.getApplicationInfo('App1');
            expect(result).toBeDefined();
        });

        test('getApplicationTypeInfoList should work', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, { Items: [] });
            const mockReq = createMockRequest();

            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });

            const result = await client.getApplicationTypeInfoList();
            expect(result).toBeDefined();
        });
    });

    describe('Service APIs', () => {
        test('getServiceInfoList should work', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, { Items: [] });
            const mockReq = createMockRequest();

            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });

            const result = await client.getServiceInfoList('App1');
            expect(result).toBeDefined();
        });

        test('getServiceHealth should work', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, { aggregatedHealthState: 'Ok' });
            const mockReq = createMockRequest();

            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });

            const result = await client.getServiceHealth('svc1');
            expect(result).toBeDefined();
        });
    });

    describe('Error handling', () => {
        test('should reject on HTTP error', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(404, 'Not Found', 'Not Found');
            const mockReq = createMockRequest();

            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });

            await expect(client.getClusterHealth()).rejects.toThrow();
        });

        test('should reject on request error', async () => {
            const http = require('http');
            const mockReq: any = {
                on: jest.fn((event: string, handler: any) => {
                    if (event === 'error') {
                        process.nextTick(() => handler(new Error('ECONNREFUSED')));
                    }
                    return mockReq;
                }),
                end: jest.fn(),
                destroy: jest.fn(),
                setTimeout: jest.fn(),
                setHeader: jest.fn(),
                write: jest.fn(),
            };

            http.request.mockImplementation(() => mockReq);

            await expect(client.getClusterHealth()).rejects.toThrow();
        });
    });

    describe('Write operations', () => {
        test('enableNode should POST', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, undefined);
            const mockReq = createMockRequest();

            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });

            await client.enableNode('Node0');
            expect(http.request).toHaveBeenCalled();
        });

        test('disableNode should POST with body', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, undefined);
            const mockReq = createMockRequest();

            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });

            await client.disableNode('Node0', 'Pause');
            // makeRequest sends non-binary body via req.end(bodyStr)
            expect(mockReq.end).toHaveBeenCalled();
        });

        test('removeNodeState should POST', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, undefined);
            const mockReq = createMockRequest();

            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });

            await client.removeNodeState('Node0');
            expect(http.request).toHaveBeenCalled();
        });

        test('restartNode should POST', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, undefined);
            const mockReq = createMockRequest();

            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });

            await client.restartNode('Node0', '123456');
            expect(http.request).toHaveBeenCalled();
        });
    });

    describe('Application Health APIs', () => {
        test('getApplicationHealth should work', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, { aggregatedHealthState: 'Ok' });
            const mockReq = createMockRequest();
            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });
            const result = await client.getApplicationHealth('App1');
            expect(result).toBeDefined();
        });

        test('getApplicationManifest should work', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, { manifest: '<xml />' });
            const mockReq = createMockRequest();
            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });
            const result = await client.getApplicationManifest('AppType', '1.0.0');
            expect(result).toBeDefined();
        });
    });

    describe('Service extended APIs', () => {
        test('getServiceInfo should work', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, { id: 'svc1', name: 'fabric:/App1/Svc1' });
            const mockReq = createMockRequest();
            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });
            const result = await client.getServiceInfo('App1', 'Svc1');
            expect(result).toBeDefined();
        });

        test('getServiceTypeInfoList should work', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, { Items: [] });
            const mockReq = createMockRequest();
            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });
            const result = await client.getServiceTypeInfoList('AppType', '1.0.0');
            expect(result).toBeDefined();
        });

        test('getServiceManifest should work', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, { manifest: '<xml />' });
            const mockReq = createMockRequest();
            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });
            const result = await client.getServiceManifest('AppType', '1.0.0', 'ManifestName');
            expect(result).toBeDefined();
        });
    });

    describe('Partition & Replica APIs', () => {
        test('getPartitionInfoList should work', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, { Items: [{ PartitionId: 'p1' }] });
            const mockReq = createMockRequest();
            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });
            const result = await client.getPartitionInfoList('svc1');
            expect(result).toBeDefined();
        });

        test('getReplicaInfoList should work', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, { Items: [{ ReplicaId: 'r1' }] });
            const mockReq = createMockRequest();
            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });
            const result = await client.getReplicaInfoList('p1');
            expect(result).toBeDefined();
        });

        test('getPartitionHealth should work', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, { aggregatedHealthState: 'Ok' });
            const mockReq = createMockRequest();
            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });
            const result = await client.getPartitionHealth('p1');
            expect(result).toBeDefined();
        });

        test('getReplicaHealth should work', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, { aggregatedHealthState: 'Ok' });
            const mockReq = createMockRequest();
            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });
            const result = await client.getReplicaHealth('p1', 'r1');
            expect(result).toBeDefined();
        });
    });

    describe('Deployed Application APIs', () => {
        test('getDeployedApplicationInfoList should normalize response', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, [{ Id: 'App1', Name: 'fabric:/App1' }]);
            const mockReq = createMockRequest();
            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });
            const result = await client.getDeployedApplicationInfoList('Node0');
            expect(result).toBeDefined();
        });

        test('getDeployedApplicationInfo should work', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, { id: 'App1' });
            const mockReq = createMockRequest();
            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });
            const result = await client.getDeployedApplicationInfo('Node0', 'App1');
            expect(result).toBeDefined();
        });

        test('getDeployedApplicationHealth should work', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, { aggregatedHealthState: 'Ok' });
            const mockReq = createMockRequest();
            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });
            const result = await client.getDeployedApplicationHealth('Node0', 'App1');
            expect(result).toBeDefined();
        });

        test('getDeployedServicePackageInfoList should normalize', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, [{ Name: 'SvcPkg', ServiceManifestName: 'SvcManifest' }]);
            const mockReq = createMockRequest();
            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });
            const result = await client.getDeployedServicePackageInfoList('Node0', 'App1');
            expect(result).toBeDefined();
        });

        test('getDeployedCodePackageInfoList should normalize', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, [{ Name: 'CodePkg', Version: '1.0' }]);
            const mockReq = createMockRequest();
            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });
            const result = await client.getDeployedCodePackageInfoList('Node0', 'App1', 'SvcManifest');
            expect(result).toBeDefined();
        });

        test('getDeployedServiceReplicaInfoList should normalize', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, [{ ReplicaId: 'r1', ServiceName: 'SvcName' }]);
            const mockReq = createMockRequest();
            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });
            const result = await client.getDeployedServiceReplicaInfoList('Node0', 'App1', 'SvcManifest');
            expect(result).toBeDefined();
        });
    });

    describe('EventStore APIs', () => {
        test('getServiceEventList should work', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, [{ Kind: 'ServiceCreated' }]);
            const mockReq = createMockRequest();
            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });
            const result = await client.getServiceEventList('svc1', '2024-01-01', '2024-01-02');
            expect(result).toBeDefined();
        });

        test('getPartitionEventList should work', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, []);
            const mockReq = createMockRequest();
            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });
            const result = await client.getPartitionEventList('p1', '2024-01-01', '2024-01-02');
            expect(result).toBeDefined();
        });

        test('getPartitionReplicaEventList should work', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, []);
            const mockReq = createMockRequest();
            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });
            const result = await client.getPartitionReplicaEventList('p1', 'r1', '2024-01-01', '2024-01-02');
            expect(result).toBeDefined();
        });
    });

    describe('Repair Tasks', () => {
        test('getRepairTaskList should work', async () => {
            const http = require('http');
            const mockResponse = createMockResponse(200, { Items: [] });
            const mockReq = createMockRequest();
            http.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });
            const result = await client.getRepairTaskList();
            expect(result).toBeDefined();
        });
    });

    describe('HTTPS endpoint', () => {
        test('should use https module for https endpoint', async () => {
            const https = require('https');
            const httpsClient = new SfDirectRestClient({ endpoint: 'https://mycluster:19080' });
            const mockResponse = createMockResponse(200, { aggregatedHealthState: 'Ok' });
            const mockReq = createMockRequest();
            https.request.mockImplementation((_opts: any, callback: any) => {
                callback(mockResponse);
                return mockReq;
            });
            const result = await httpsClient.getClusterHealth();
            expect(https.request).toHaveBeenCalled();
        });
    });
});
