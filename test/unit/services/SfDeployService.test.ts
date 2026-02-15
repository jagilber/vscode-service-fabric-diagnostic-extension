/**
 * Unit tests for SfDeployService — build and deploy orchestration.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { SfDeployService } from '../../../src/services/SfDeployService';
import { SfProjectInfo } from '../../../src/types/ProjectTypes';

jest.mock('vscode');

describe('SfDeployService', () => {
    let service: SfDeployService;

    const mockProject: SfProjectInfo = {
        sfprojPath: 'C:\\Projects\\MyApp\\MyApp.sfproj',
        projectDir: 'C:\\Projects\\MyApp',
        appTypeName: 'MyAppType',
        appTypeVersion: '1.0.0',
        manifestPath: 'C:\\Projects\\MyApp\\ApplicationManifest.xml',
        services: [],
        parameters: [],
        profiles: [],
        parameterFiles: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        service = new SfDeployService();
    });

    afterEach(() => {
        service.dispose();
    });

    describe('buildProject', () => {
        test('should return BuildResult for msbuild method', async () => {
            const mockTerminal = { show: jest.fn(), sendText: jest.fn() };
            (vscode.window.createTerminal as jest.Mock).mockReturnValue(mockTerminal);

            const result = await service.buildProject(mockProject, 'msbuild');
            expect(result.success).toBe(true);
            expect(result.warnings).toContainEqual(expect.stringContaining('Build launched in terminal'));
            expect(mockTerminal.show).toHaveBeenCalled();
            expect(mockTerminal.sendText).toHaveBeenCalledWith(
                expect.stringContaining('msbuild')
            );
        });

        test('should return BuildResult for dotnet method', async () => {
            const mockTerminal = { show: jest.fn(), sendText: jest.fn() };
            (vscode.window.createTerminal as jest.Mock).mockReturnValue(mockTerminal);

            const result = await service.buildProject(mockProject, 'dotnet');
            expect(result.success).toBe(true);
            expect(mockTerminal.sendText).toHaveBeenCalledWith(
                expect.stringContaining('dotnet build')
            );
        });

        test('should return failure for unsupported method', async () => {
            const result = await service.buildProject(mockProject, 'rest');
            expect(result.success).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        test('should default to msbuild', async () => {
            const mockTerminal = { show: jest.fn(), sendText: jest.fn() };
            (vscode.window.createTerminal as jest.Mock).mockReturnValue(mockTerminal);

            const result = await service.buildProject(mockProject);
            expect(result.success).toBe(true);
            expect(mockTerminal.sendText).toHaveBeenCalledWith(
                expect.stringContaining('msbuild')
            );
        });
    });

    describe('findPackagePath', () => {
        let tmpDir: string;

        beforeEach(() => {
            tmpDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'deploy-test-'));
        });

        afterEach(() => {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        });

        test('should find package at pkg/Debug with ApplicationManifest.xml', () => {
            const project: SfProjectInfo = { ...mockProject, projectDir: tmpDir };
            const pkgDir = path.join(tmpDir, 'pkg', 'Debug');
            fs.mkdirSync(pkgDir, { recursive: true });
            fs.writeFileSync(path.join(pkgDir, 'ApplicationManifest.xml'), '<ApplicationManifest />');

            const result = service.findPackagePath(project);
            expect(result).toBe(pkgDir);
        });

        test('should return undefined when no package directory exists', () => {
            const project: SfProjectInfo = { ...mockProject, projectDir: tmpDir };
            const result = service.findPackagePath(project);
            expect(result).toBeUndefined();
        });

        test('should return undefined when directory exists but no ApplicationManifest.xml', () => {
            const project: SfProjectInfo = { ...mockProject, projectDir: tmpDir };
            const pkgDir = path.join(tmpDir, 'pkg', 'Debug');
            fs.mkdirSync(pkgDir, { recursive: true });
            // No ApplicationManifest.xml

            const result = service.findPackagePath(project);
            expect(result).toBeUndefined();
        });
    });

    describe('deployToCluster', () => {
        test('should throw when package path does not exist', async () => {
            const mockSfRest = {} as any;
            const options = {
                appName: 'fabric:/MyApp',
                typeName: 'MyAppType',
                typeVersion: '1.0.0',
                parameters: {},
                clusterEndpoint: 'https://localhost:19080',
                upgrade: false,
            };

            await expect(
                service.deployToCluster(mockSfRest, options, '/nonexistent/path')
            ).rejects.toThrow('Application package not found');
        });
    });
});
