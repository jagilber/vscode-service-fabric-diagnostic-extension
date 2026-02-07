/**
 * Unit tests for SfUtility
 */
import * as vscode from 'vscode';
import * as fs from 'fs';
import { SfUtility, debugLevel } from '../../src/sfUtility';

jest.mock('fs');

describe('SfUtility', () => {
    const mockFs = jest.mocked(fs);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createFile', () => {
        test('should create file if it does not exist', () => {
            mockFs.existsSync.mockReturnValue(false);
            mockFs.writeFileSync.mockImplementation();
            SfUtility.createFile('/test/path.json', '{"key":"value"}');
            expect(mockFs.writeFileSync).toHaveBeenCalledWith('/test/path.json', '{"key":"value"}');
        });

        test('should not create file if it already exists', () => {
            mockFs.existsSync.mockReturnValue(true);
            SfUtility.createFile('/test/existing.json', 'data');
            expect(mockFs.writeFileSync).not.toHaveBeenCalled();
        });
    });

    describe('createFolder', () => {
        test('should create folder if it does not exist', () => {
            mockFs.existsSync.mockReturnValue(false);
            mockFs.mkdirSync.mockImplementation();
            const result = SfUtility.createFolder('/test/folder');
            expect(mockFs.mkdirSync).toHaveBeenCalledWith('/test/folder', { recursive: true });
            expect(result).toBe('/test/folder');
        });

        test('should not create folder if it already exists', () => {
            mockFs.existsSync.mockReturnValue(true);
            const result = SfUtility.createFolder('/test/existing');
            expect(mockFs.mkdirSync).not.toHaveBeenCalled();
            expect(result).toBe('/test/existing');
        });
    });

    describe('fileExists', () => {
        test('should return true when file exists', () => {
            mockFs.existsSync.mockReturnValue(true);
            expect(SfUtility.fileExists('/test/file.txt')).toBe(true);
        });

        test('should return false when file does not exist', () => {
            mockFs.existsSync.mockReturnValue(false);
            expect(SfUtility.fileExists('/test/missing.txt')).toBe(false);
        });
    });

    describe('removeFile', () => {
        test('should remove file if it exists', () => {
            mockFs.existsSync.mockReturnValue(true);
            mockFs.rmSync.mockImplementation();
            SfUtility.removeFile('/test/file.txt');
            expect(mockFs.rmSync).toHaveBeenCalledWith('/test/file.txt');
        });

        test('should not remove file if it does not exist', () => {
            mockFs.existsSync.mockReturnValue(false);
            SfUtility.removeFile('/test/missing.txt');
            expect(mockFs.rmSync).not.toHaveBeenCalled();
        });
    });

    describe('removeFolder', () => {
        test('should remove folder if it exists', () => {
            mockFs.existsSync.mockReturnValue(true);
            mockFs.rmdirSync.mockImplementation();
            SfUtility.removeFolder('/test/folder');
            expect(mockFs.rmdirSync).toHaveBeenCalledWith('/test/folder', { recursive: true });
        });

        test('should not remove folder if it does not exist', () => {
            mockFs.existsSync.mockReturnValue(false);
            SfUtility.removeFolder('/test/missing');
            expect(mockFs.rmdirSync).not.toHaveBeenCalled();
        });
    });

    describe('activateOutputChannel', () => {
        test('should show the output channel', () => {
            SfUtility.activateOutputChannel();
            // The channel mock from setup.ts has show() as jest.fn()
            // Just verify it doesn't throw
        });
    });

    describe('outputLog', () => {
        test('should handle message with object', () => {
            expect(() => SfUtility.outputLog('test message', { key: 'value' })).not.toThrow();
        });

        test('should handle message with null object', () => {
            expect(() => SfUtility.outputLog('test message', null)).not.toThrow();
        });

        test('should handle message with string object', () => {
            expect(() => SfUtility.outputLog('test', 'extra detail')).not.toThrow();
        });

        test('should handle debug level', () => {
            expect(() => SfUtility.outputLog('debug msg', null, debugLevel.debug)).not.toThrow();
        });

        test('should handle trace level', () => {
            expect(() => SfUtility.outputLog('trace msg', null, debugLevel.trace)).not.toThrow();
        });

        test('should handle error level', () => {
            expect(() => SfUtility.outputLog('error msg', null, debugLevel.error)).not.toThrow();
        });

        test('should handle warn level', () => {
            expect(() => SfUtility.outputLog('warn msg', null, debugLevel.warn)).not.toThrow();
        });

        test('should handle info level (default)', () => {
            expect(() => SfUtility.outputLog('info msg', null, debugLevel.info)).not.toThrow();
        });

        test('should handle circular reference in object gracefully', () => {
            const circular: any = {};
            circular.self = circular;
            // Should not throw — the try/catch around JSON.stringify handles this
            expect(() => SfUtility.outputLog('circular', circular)).not.toThrow();
        });

        test('should handle undefined messageObject', () => {
            expect(() => SfUtility.outputLog('message only')).not.toThrow();
        });

        test('should handle array messageObject', () => {
            expect(() => SfUtility.outputLog('test', ['a', 'b', 'c'])).not.toThrow();
        });
    });

    describe('showError', () => {
        test('should call vscode.window.showErrorMessage', () => {
            SfUtility.showError('Test error');
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                JSON.stringify('Test error', null, 4)
            );
        });
    });

    describe('showInformation', () => {
        test('should call vscode.window.showInformationMessage', () => {
            SfUtility.showInformation('Test info');
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                JSON.stringify('Test info', null, 4)
            );
        });
    });

    describe('showWarning', () => {
        test('should call vscode.window.showWarningMessage', () => {
            SfUtility.showWarning('Test warning');
            expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
                JSON.stringify('Test warning', null, 4)
            );
        });
    });

    describe('debugLevel enum', () => {
        test('should have correct numeric values', () => {
            expect(debugLevel.error).toBe(0);
            expect(debugLevel.warn).toBe(1);
            expect(debugLevel.info).toBe(2);
            expect(debugLevel.debug).toBe(3);
            expect(debugLevel.trace).toBe(4);
        });
    });
});
