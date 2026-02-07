/**
 * Unit tests for ClusterMapView
 */
import * as vscode from 'vscode';

jest.mock('../../src/sfUtility', () => ({
    SfUtility: {
        outputLog: jest.fn(),
        showError: jest.fn(),
        showInformation: jest.fn(),
    },
    debugLevel: { error: 0, warn: 1, info: 2, debug: 3 },
}));

import { ClusterMapView } from '../../src/views/ClusterMapView';

describe('ClusterMapView', () => {
    let view: ClusterMapView;
    let mockContext: vscode.ExtensionContext;
    let mockSfRest: any;
    const clusterEndpoint = 'http://localhost:19080';

    beforeEach(() => {
        jest.clearAllMocks();
        mockContext = new (vscode as any).ExtensionContext();
        mockSfRest = {
            getNodes: jest.fn().mockResolvedValue([
                { name: 'Node0', faultDomain: 'fd:/0', upgradeDomain: '0', healthState: 'Ok', nodeStatus: 'Up', ipAddressOrFqdn: '10.0.0.4' },
                { name: 'Node1', faultDomain: 'fd:/1', upgradeDomain: '1', healthState: 'Ok', nodeStatus: 'Up', ipAddressOrFqdn: '10.0.0.5' },
            ]),
            getClusterManifest: jest.fn().mockResolvedValue({ manifest: '<ClusterManifest></ClusterManifest>' }),
        };
        view = new ClusterMapView(mockContext, mockSfRest, clusterEndpoint);
    });

    test('should construct successfully', () => {
        expect(view).toBeDefined();
    });

    describe('show', () => {
        test('should create webview panel with cluster data', async () => {
            await view.show();
            expect(vscode.window.createWebviewPanel).toHaveBeenCalled();
            expect(mockSfRest.getNodes).toHaveBeenCalled();
            expect(mockSfRest.getClusterManifest).toHaveBeenCalled();
        });

        test('should handle errors gracefully', async () => {
            mockSfRest.getNodes.mockRejectedValue(new Error('connection refused'));
            await view.show();
            const { SfUtility } = require('../../src/sfUtility');
            expect(SfUtility.showError).toHaveBeenCalled();
        });

        test('should handle empty nodes', async () => {
            mockSfRest.getNodes.mockResolvedValue([]);
            await view.show();
            expect(vscode.window.createWebviewPanel).toHaveBeenCalled();
        });

        test('should handle nodes with missing fields', async () => {
            mockSfRest.getNodes.mockResolvedValue([
                { name: 'Node0' },
                { name: null },
            ]);
            await view.show();
            expect(vscode.window.createWebviewPanel).toHaveBeenCalled();
        });
    });
});
