/**
 * Unit tests for SfConstants
 */
import { SfConstants } from '../../src/sfConstants';

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
});
