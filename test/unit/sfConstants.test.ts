/**
 * Unit tests for SfConstants
 */
import { SfConstants } from '../../src/sfConstants';
import * as vscode from 'vscode';

describe('SfConstants', () => {
    test('SF_SDK_DIR should point to ClusterSetup', () => {
        expect(SfConstants.SF_SDK_DIR).toBe('C:\\Program Files\\Microsoft SDKs\\Service Fabric\\ClusterSetup');
    });

    test('SF_DEV_CLUSTER_SETUP should reference DevClusterSetup.ps1', () => {
        expect(SfConstants.SF_DEV_CLUSTER_SETUP).toContain('DevClusterSetup.ps1');
        expect(SfConstants.SF_DEV_CLUSTER_SETUP).toContain(SfConstants.SF_SDK_DIR);
    });

    test('SF_SDK_DOWNLOAD_URL should be a valid learn.microsoft.com URL', () => {
        expect(SfConstants.SF_SDK_DOWNLOAD_URL).toMatch(/^https:\/\/learn\.microsoft\.com/);
    });

    test('SF_SDK_URI_REGEX should match SDK MSI URLs', () => {
        const regex = new RegExp(SfConstants.SF_SDK_URI_REGEX);
        const testUrl = 'https://download.microsoft.com/download/b/8/a/b8a2fb98/MicrosoftServiceFabricSDK.6.1.1833.msi';
        expect(regex.test(testUrl)).toBe(true);
    });

    test('SF_SDK_URI_REGEX should not match runtime URLs', () => {
        const regex = new RegExp(SfConstants.SF_SDK_URI_REGEX);
        const testUrl = 'https://download.microsoft.com/download/b/8/a/MicrosoftServiceFabric.9.1.1833.9590.exe';
        expect(regex.test(testUrl)).toBe(false);
    });

    test('SF_RUNTIME_URI_REGEX should match runtime EXE URLs', () => {
        const regex = new RegExp(SfConstants.SF_RUNTIME_URI_REGEX);
        const testUrl = 'https://download.microsoft.com/download/b/8/a/MicrosoftServiceFabric.9.1.1833.9590.exe';
        expect(regex.test(testUrl)).toBe(true);
    });

    test('SF_HTTP_GATEWAY_PORT should be 19080', () => {
        expect(SfConstants.SF_HTTP_GATEWAY_PORT).toBe(19080);
    });

    test('SF_HTTP_GATEWAY_ENDPOINT should use localhost and correct port', () => {
        expect(SfConstants.SF_HTTP_GATEWAY_ENDPOINT).toBe('http://localhost:19080');
        expect(SfConstants.SF_HTTP_GATEWAY_ENDPOINT).toContain(String(SfConstants.SF_HTTP_GATEWAY_PORT));
    });

    test('SF_DEFAULT_TIMEOUT_SEC should be 1200', () => {
        expect(SfConstants.SF_DEFAULT_TIMEOUT_SEC).toBe(1200);
    });

    describe('getTimeoutMs', () => {
        const originalEnv = process.env;

        beforeEach(() => {
            process.env = { ...originalEnv };
            delete process.env.SF_TIMEOUT_SEC;
        });

        afterEach(() => {
            process.env = originalEnv;
        });

        test('should return default 1200000ms when no env var or setting', () => {
            expect(SfConstants.getTimeoutMs()).toBe(1200000);
        });

        test('should use SF_TIMEOUT_SEC env var when set', () => {
            process.env.SF_TIMEOUT_SEC = '300';
            expect(SfConstants.getTimeoutMs()).toBe(300000);
        });

        test('should ignore invalid SF_TIMEOUT_SEC env var', () => {
            process.env.SF_TIMEOUT_SEC = 'abc';
            expect(SfConstants.getTimeoutMs()).toBe(1200000);
        });

        test('should ignore zero SF_TIMEOUT_SEC env var', () => {
            process.env.SF_TIMEOUT_SEC = '0';
            expect(SfConstants.getTimeoutMs()).toBe(1200000);
        });

        test('should use VS Code setting when env var not set', () => {
            const mockGet = jest.fn().mockReturnValue(600);
            (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({ get: mockGet });
            expect(SfConstants.getTimeoutMs()).toBe(600000);
            expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith('sfClusterExplorer');
            expect(mockGet).toHaveBeenCalledWith('timeoutSeconds');
        });

        test('env var should take priority over VS Code setting', () => {
            process.env.SF_TIMEOUT_SEC = '120';
            const mockGet = jest.fn().mockReturnValue(600);
            (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({ get: mockGet });
            expect(SfConstants.getTimeoutMs()).toBe(120000);
        });
    });
});
