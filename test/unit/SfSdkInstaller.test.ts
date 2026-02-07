/**
 * Unit tests for SfSdkInstaller
 */
import * as vscode from 'vscode';

jest.mock('../../src/sfPs', () => ({
    SfPs: jest.fn().mockImplementation(() => ({
        send: jest.fn().mockResolvedValue('{"result":"ok"}'),
    })),
}));

jest.mock('../../src/utils/SfHttpClient', () => ({
    SfHttpClient: jest.fn().mockImplementation(() => ({
        get: jest.fn().mockResolvedValue(''),
        download: jest.fn().mockResolvedValue(undefined),
    })),
}));

jest.mock('../../src/sfUtility', () => ({
    SfUtility: {
        outputLog: jest.fn(),
        showInformation: jest.fn(),
        showWarning: jest.fn(),
        showError: jest.fn(),
        createFolder: jest.fn(),
        fileExists: jest.fn().mockReturnValue(false),
    },
    debugLevel: { error: 0, warn: 1, info: 2, debug: 3 },
}));

import { SfSdkInstaller } from '../../src/services/SfSdkInstaller';

describe('SfSdkInstaller', () => {
    let installer: SfSdkInstaller;
    let mockContext: vscode.ExtensionContext;

    beforeEach(() => {
        jest.clearAllMocks();
        mockContext = new (vscode as any).ExtensionContext();
        installer = new SfSdkInstaller(mockContext);
    });

    test('should construct successfully', () => {
        expect(installer).toBeDefined();
    });

    describe('deployDevCluster', () => {
        test('should throw when SDK directory does not exist and download fails', async () => {
            const { SfUtility } = require('../../src/sfUtility');
            SfUtility.fileExists.mockReturnValue(false);
            
            // The httpClient.get mock returns '' which won't match SDK regex
            await expect(installer.deployDevCluster()).rejects.toThrow();
        });

        test('should attempt deploy when SDK directory exists', async () => {
            const { SfUtility } = require('../../src/sfUtility');
            SfUtility.fileExists.mockReturnValue(true);
            
            await installer.deployDevCluster();
            expect(SfUtility.showInformation).toHaveBeenCalled();
        });
    });

    describe('downloadAndInstallSdk', () => {
        test('should throw when download page returns no matching URLs', async () => {
            await expect(installer.downloadAndInstallSdk()).rejects.toThrow();
        });
    });

    describe('downloadAndExecute', () => {
        test('should download and execute when file does not exist', async () => {
            const { SfUtility } = require('../../src/sfUtility');
            // First call: file doesnt exist. Second call: file exists after download.
            SfUtility.fileExists
                .mockReturnValueOnce(false)
                .mockReturnValueOnce(true);

            const result = await installer.downloadAndExecute(
                'https://example.com/file.exe',
                '/mock/storage/file.exe',
                'file.exe',
                ['/quiet']
            );
            expect(result).toBeDefined();
        });

        test('should execute without download when file already exists', async () => {
            const { SfUtility } = require('../../src/sfUtility');
            SfUtility.fileExists.mockReturnValue(true);

            const result = await installer.downloadAndExecute(
                'https://example.com/file.exe',
                '/mock/storage/file.exe'
            );
            expect(result).toBeDefined();
        });
    });
});
