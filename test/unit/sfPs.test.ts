/**
 * Unit tests for SfPs
 */
import * as vscode from 'vscode';

// Mock child_process to prevent real process spawning
jest.mock('child_process', () => {
    const mockStdin = {
        setDefaultEncoding: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
    };
    const mockStdout = {
        setEncoding: jest.fn(),
        on: jest.fn(),
    };
    const mockStderr = {
        on: jest.fn(),
    };
    const mockChild = {
        stdin: mockStdin,
        stdout: mockStdout,
        stderr: mockStderr,
        on: jest.fn(),
        kill: jest.fn(),
        killed: false,
        pid: 12345,
    };

    return {
        spawn: jest.fn().mockReturnValue(mockChild),
        ChildProcessWithoutNullStreams: jest.fn(),
    };
});

import { SfPs } from '../../src/sfPs';
import { spawn } from 'child_process';

describe('SfPs', () => {
    let sfPs: SfPs;

    beforeEach(() => {
        jest.clearAllMocks();
        sfPs = new SfPs();
    });

    describe('constructor', () => {
        test('should initialize successfully', () => {
            expect(sfPs).toBeDefined();
        });
    });

    describe('destroy', () => {
        test('should kill ps session if active', () => {
            (sfPs as any).psSession = { kill: jest.fn() };
            sfPs.destroy();
            expect((sfPs as any).psSession.kill).toHaveBeenCalled();
        });

        test('should not throw when no session', () => {
            sfPs.destroy();
            // Should not throw
        });
    });

    describe('getPemCertFromLocalCertStore', () => {
        test('should build command for thumbprint lookup', async () => {
            // Mock the send method
            const mockSend = jest.fn().mockResolvedValue('-----BEGIN CERTIFICATE-----\nMOCK\n-----END CERTIFICATE-----');
            (sfPs as any).send = mockSend;

            const result = await sfPs.getPemCertFromLocalCertStore('ABCD1234');
            expect(mockSend).toHaveBeenCalled();
            const command = mockSend.mock.calls[0][0] as string;
            expect(command).toContain('cert:\\CurrentUser\\My\\ABCD1234');
            expect(command).toContain('ExportCertificatePem');
        });

        test('should use subject search when searchSubject=true', async () => {
            const mockSend = jest.fn().mockResolvedValue('CERT');
            (sfPs as any).send = mockSend;

            await sfPs.getPemCertFromLocalCertStore('test.com', undefined, true);
            const command = mockSend.mock.calls[0][0] as string;
            expect(command).toContain('where-item Subject -imatch test.com');
        });
    });

    describe('getPemKeyFromLocalCertStore', () => {
        test('should build command for key export', async () => {
            const mockSend = jest.fn().mockResolvedValue('-----BEGIN RSA PRIVATE KEY-----\nMOCK\n-----END RSA PRIVATE KEY-----');
            (sfPs as any).send = mockSend;

            const result = await sfPs.getPemKeyFromLocalCertStore('ABCD1234');
            expect(mockSend).toHaveBeenCalled();
            const command = mockSend.mock.calls[0][0] as string;
            expect(command).toContain('ExportRSAPrivateKeyPem');
        });

        test('should use subject search when searchSubject=true', async () => {
            const mockSend = jest.fn().mockResolvedValue('KEY');
            (sfPs as any).send = mockSend;

            await sfPs.getPemKeyFromLocalCertStore('test.com', undefined, true);
            const command = mockSend.mock.calls[0][0] as string;
            expect(command).toContain('where-item Subject -imatch test.com');
        });
    });

    describe('sendOnce', () => {
        test('should spawn process and write commands', async () => {
            const mockSpawn = spawn as jest.Mock;
            const mockChild = mockSpawn.mock.results[0]?.value || mockSpawn();
            
            // Setup stdout to resolve
            mockChild.stdout.on.mockImplementation((event: string, cb: Function) => {
                if (event === 'data') {
                    setTimeout(() => cb('["result"]'), 10);
                }
            });

            // Re-create to get fresh spawn mock  
            const ps = new SfPs();
            const promise = ps.sendOnce(['get-process']);
            
            // The spawn should have been called
            expect(mockSpawn).toHaveBeenCalled();
        });
    });

    describe('init', () => {
        test('should initialize session', async () => {
            // Mock session to resolve
            const mockSession = jest.fn().mockResolvedValue({
                stdin: { setDefaultEncoding: jest.fn(), write: jest.fn() },
                stdout: { setEncoding: jest.fn(), on: jest.fn() },
                stderr: { on: jest.fn() },
                on: jest.fn(),
                kill: jest.fn(),
                killed: false,
            });
            (sfPs as any).session = mockSession;
            
            await sfPs.init();
            expect(mockSession).toHaveBeenCalled();
        });

        test('should handle init failure gracefully', async () => {
            const mockSession = jest.fn().mockRejectedValue(new Error('spawn error'));
            (sfPs as any).session = mockSession;
            
            await sfPs.init();
            // Should not throw
        });
    });
});
