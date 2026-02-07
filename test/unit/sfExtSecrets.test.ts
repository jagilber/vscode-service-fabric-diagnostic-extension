/**
 * Unit tests for SfExtSecrets
 */
import * as vscode from 'vscode';
import { SfExtSecrets, sfExtSecretList } from '../../src/sfExtSecrets';

describe('SfExtSecrets', () => {
    let mockContext: vscode.ExtensionContext;
    let secrets: SfExtSecrets;
    let mockSecretStorage: Record<string, jest.Mock>;

    beforeEach(() => {
        mockSecretStorage = {
            get: jest.fn(),
            store: jest.fn(),
            delete: jest.fn()
        };
        mockContext = {
            secrets: mockSecretStorage
        } as any;
        secrets = new SfExtSecrets(mockContext);
    });

    describe('sfExtSecretList enum', () => {
        test('should have sfRestSecret', () => {
            expect(sfExtSecretList.sfRestSecret).toBe('sfRestSecret');
        });

        test('should have sfRestKey', () => {
            expect(sfExtSecretList.sfRestKey).toBe('sfRestKey');
        });

        test('should have sfRestCertificate', () => {
            expect(sfExtSecretList.sfRestCertificate).toBe('sfRestCertificate');
        });
    });

    describe('getSecret', () => {
        test('should return secret value when found', async () => {
            mockSecretStorage.get.mockResolvedValue('my-secret-value');
            const result = await secrets.getSecret(sfExtSecretList.sfRestSecret);
            expect(result).toBe('my-secret-value');
            expect(mockSecretStorage.get).toHaveBeenCalledWith('sfRestSecret');
        });

        test('should return undefined when secret not found', async () => {
            mockSecretStorage.get.mockResolvedValue(undefined);
            const result = await secrets.getSecret(sfExtSecretList.sfRestKey);
            expect(result).toBeUndefined();
        });
    });

    describe('setSecret', () => {
        test('should store secret value', async () => {
            mockSecretStorage.store.mockResolvedValue(undefined);
            await secrets.setSecret(sfExtSecretList.sfRestCertificate, 'cert-data');
            expect(mockSecretStorage.store).toHaveBeenCalledWith('sfRestCertificate', 'cert-data');
        });
    });
});
