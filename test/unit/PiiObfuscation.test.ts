/**
 * Unit tests for PiiObfuscation utility
 */
import { PiiObfuscation } from '../../src/utils/PiiObfuscation';

describe('PiiObfuscation', () => {
    describe('thumbprint', () => {
        test('should return [none] for undefined', () => {
            expect(PiiObfuscation.thumbprint(undefined)).toBe('[none]');
        });

        test('should return [none] for empty string', () => {
            expect(PiiObfuscation.thumbprint('')).toBe('[none]');
        });

        test('should show first 4 only for short thumbprint', () => {
            expect(PiiObfuscation.thumbprint('1234567890AB')).toBe('1234...');
        });

        test('should show first 4 and last 4 for full thumbprint', () => {
            expect(PiiObfuscation.thumbprint('F839ED06867320059C907BDF1A2F5057610F21BE'))
                .toBe('F839...21BE');
        });

        test('should handle 13-char thumbprint (just over threshold)', () => {
            const result = PiiObfuscation.thumbprint('1234567890ABC');
            expect(result).toBe('1234...0ABC');
        });
    });

    describe('endpoint', () => {
        test('should return [none] for undefined', () => {
            expect(PiiObfuscation.endpoint(undefined)).toBe('[none]');
        });

        test('should mask multi-part domain', () => {
            const result = PiiObfuscation.endpoint('https://cluster.region.cloudapp.azure.com:19080');
            expect(result).toContain('https://');
            expect(result).toContain('azure.com');
            expect(result).toContain('***');
            expect(result).toContain(':19080');
        });

        test('should handle localhost', () => {
            const result = PiiObfuscation.endpoint('http://localhost:19080');
            expect(result).toContain('http://');
        });

        test('should handle simple domain', () => {
            const result = PiiObfuscation.endpoint('https://mycluster.com:19080');
            expect(result).toContain('https://');
            expect(result).toContain(':19080');
        });

        test('should handle URL without port', () => {
            const result = PiiObfuscation.endpoint('https://cluster.eastus.azure.com');
            expect(result).toContain('https://');
            // Should not contain a port number (colon after domain)
            expect(result).toMatch(/https:\/\/[^:]+$/);
        });

        test('should handle invalid URL by masking middle', () => {
            const result = PiiObfuscation.endpoint('not-a-url://something:very:long:and:complex');
            expect(result).toContain('...');
        });

        test('should handle very short non-URL', () => {
            const result = PiiObfuscation.endpoint('short');
            expect(result).toBe('***');
        });

        test('should handle empty string', () => {
            expect(PiiObfuscation.endpoint('')).toBe('[none]');
        });
    });

    describe('certificate', () => {
        test('should return [none] for undefined', () => {
            expect(PiiObfuscation.certificate(undefined)).toBe('[none]');
        });

        test('should identify PEM certificate', () => {
            const result = PiiObfuscation.certificate('-----BEGIN CERTIFICATE-----\nMIIB...');
            expect(result).toContain('PEM Certificate');
            expect(result).toContain('chars');
        });

        test('should identify Base64 certificate', () => {
            const result = PiiObfuscation.certificate('MIIBxjCCAW...');
            expect(result).toContain('Base64 Certificate');
        });

        test('should identify generic string', () => {
            const result = PiiObfuscation.certificate('some-cert-string');
            expect(result).toContain('String Certificate');
        });

        test('should handle Buffer', () => {
            const result = PiiObfuscation.certificate(Buffer.from('test'));
            expect(result).toContain('Buffer Certificate');
        });
    });

    describe('commonName', () => {
        test('should return [none] for undefined', () => {
            expect(PiiObfuscation.commonName(undefined)).toBe('[none]');
        });

        test('should not obfuscate short names', () => {
            expect(PiiObfuscation.commonName('short')).toBe('short');
        });

        test('should obfuscate long domain names', () => {
            const result = PiiObfuscation.commonName('cluster.region.cloudapp.azure.com');
            expect(result).toContain('cluster');
            expect(result).toContain('***');
            expect(result).toContain('chars');
        });

        test('should handle name at boundary (12 chars)', () => {
            expect(PiiObfuscation.commonName('12345678901a')).toBe('12345678901a');
        });

        test('should handle name just over boundary (13 chars)', () => {
            const result = PiiObfuscation.commonName('1234567890abc');
            expect(result).toContain('***');
        });
    });

    describe('connectionString', () => {
        test('should return [none] for undefined', () => {
            expect(PiiObfuscation.connectionString(undefined)).toBe('[none]');
        });

        test('should mask values after equals', () => {
            const result = PiiObfuscation.connectionString('AccountName=myAccount;AccountKey=secretKey123');
            expect(result).toBe('AccountName=***;AccountKey=***');
        });

        test('should handle single pair', () => {
            const result = PiiObfuscation.connectionString('Key=Value');
            expect(result).toBe('Key=***');
        });
    });

    describe('apiKey', () => {
        test('should return [none] for undefined', () => {
            expect(PiiObfuscation.apiKey(undefined)).toBe('[none]');
        });

        test('should mask short key', () => {
            const result = PiiObfuscation.apiKey('sk-123456');
            expect(result).toBe('sk-1...***');
        });

        test('should show first 8 of long key', () => {
            const result = PiiObfuscation.apiKey('sk-1234567890abcdef');
            expect(result).toBe('sk-12345...***');
        });
    });

    describe('nodeName', () => {
        test('should return [none] for undefined', () => {
            expect(PiiObfuscation.nodeName(undefined)).toBe('[none]');
        });

        test('should mask instance number', () => {
            expect(PiiObfuscation.nodeName('_Node_0')).toBe('_Node_X');
        });

        test('should mask multi-digit instance', () => {
            expect(PiiObfuscation.nodeName('_nt0vm_123')).toBe('_nt0vm_X');
        });

        test('should handle name without trailing digits', () => {
            expect(PiiObfuscation.nodeName('nodeName')).toBe('nodeName');
        });
    });

    describe('applicationName', () => {
        test('should return [none] for undefined', () => {
            expect(PiiObfuscation.applicationName(undefined)).toBe('[none]');
        });

        test('should mask multi-part app name', () => {
            const result = PiiObfuscation.applicationName('fabric:/MyApp_Production_v2');
            expect(result).toBe('fabric:/MyApp_***');
        });

        test('should keep single-word app name', () => {
            expect(PiiObfuscation.applicationName('fabric:/SimpleApp')).toBe('fabric:/SimpleApp');
        });

        test('should return non-fabric name as-is', () => {
            expect(PiiObfuscation.applicationName('MyApp')).toBe('MyApp');
        });
    });

    describe('generic', () => {
        test('should return [none] for undefined', () => {
            expect(PiiObfuscation.generic(undefined)).toBe('[none]');
        });

        test('should return *** for short values', () => {
            expect(PiiObfuscation.generic('short')).toBe('***');
        });

        test('should show first and last for long values', () => {
            const result = PiiObfuscation.generic('1234567890abcdefgh');
            expect(result).toBe('1234...efgh');
        });

        test('should respect custom showLength', () => {
            const result = PiiObfuscation.generic('1234567890abcdefghij', 2);
            expect(result).toBe('12...ij');
        });
    });
});
