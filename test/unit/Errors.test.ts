/**
 * Unit tests for custom Error classes
 */
import {
    ServiceFabricError,
    ClusterConnectionError,
    CertificateError,
    NetworkError,
    HttpError,
    PaginationError,
    AzureApiError,
    ConfigurationError,
    SdkInstallationError
} from '../../src/models/Errors';

describe('Error Models', () => {
    describe('ServiceFabricError', () => {
        test('should set message and name', () => {
            const error = new ServiceFabricError('test error');
            expect(error.message).toBe('test error');
            expect(error.name).toBe('ServiceFabricError');
            expect(error).toBeInstanceOf(Error);
        });

        test('should support context', () => {
            const ctx = { endpoint: 'http://localhost:19080' };
            const error = new ServiceFabricError('test', ctx);
            expect(error.context).toBe(ctx);
        });

        test('should have stack trace', () => {
            const error = new ServiceFabricError('test');
            expect(error.stack).toBeDefined();
        });
    });

    describe('ClusterConnectionError', () => {
        test('should extend ServiceFabricError', () => {
            const error = new ClusterConnectionError('connection failed');
            expect(error).toBeInstanceOf(ServiceFabricError);
            expect(error.name).toBe('ClusterConnectionError');
        });

        test('should pass context', () => {
            const error = new ClusterConnectionError('fail', { endpoint: 'http://test' });
            expect(error.context?.endpoint).toBe('http://test');
        });
    });

    describe('CertificateError', () => {
        test('should extend ServiceFabricError', () => {
            const error = new CertificateError('cert invalid');
            expect(error).toBeInstanceOf(ServiceFabricError);
            expect(error.name).toBe('CertificateError');
        });
    });

    describe('NetworkError', () => {
        test('should extend ServiceFabricError', () => {
            const error = new NetworkError('network timeout');
            expect(error).toBeInstanceOf(ServiceFabricError);
            expect(error.name).toBe('NetworkError');
        });
    });

    describe('HttpError', () => {
        test('should extend NetworkError', () => {
            const error = new HttpError('not found', { status: 404, url: '/api/test' });
            expect(error).toBeInstanceOf(NetworkError);
            expect(error).toBeInstanceOf(ServiceFabricError);
            expect(error.name).toBe('HttpError');
        });

        test('should expose statusCode and url', () => {
            const error = new HttpError('unauthorized', { status: 401, url: '/api/health' });
            expect(error.statusCode).toBe(401);
            expect(error.url).toBe('/api/health');
        });
    });

    describe('PaginationError', () => {
        test('should extend ServiceFabricError', () => {
            const error = new PaginationError('page 3 failed', { page: 3 });
            expect(error).toBeInstanceOf(ServiceFabricError);
            expect(error.name).toBe('PaginationError');
            expect(error.context?.page).toBe(3);
        });
    });

    describe('AzureApiError', () => {
        test('should extend ServiceFabricError', () => {
            const error = new AzureApiError('azure API failure');
            expect(error).toBeInstanceOf(ServiceFabricError);
            expect(error.name).toBe('AzureApiError');
        });
    });

    describe('ConfigurationError', () => {
        test('should extend ServiceFabricError', () => {
            const error = new ConfigurationError('invalid config');
            expect(error).toBeInstanceOf(ServiceFabricError);
            expect(error.name).toBe('ConfigurationError');
        });
    });

    describe('SdkInstallationError', () => {
        test('should extend ServiceFabricError', () => {
            const error = new SdkInstallationError('SDK install failed');
            expect(error).toBeInstanceOf(ServiceFabricError);
            expect(error.name).toBe('SdkInstallationError');
        });
    });
});
