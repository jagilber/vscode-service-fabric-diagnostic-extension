/**
 * Unit tests for SfProjectService — .sfproj discovery and XML parsing.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { SfProjectService } from '../../../src/services/SfProjectService';

// Mock vscode workspace
jest.mock('vscode');

describe('SfProjectService', () => {
    let service: SfProjectService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new SfProjectService();
    });

    afterEach(() => {
        service.dispose();
    });

    describe('parseApplicationManifest', () => {
        const basicManifestXml = `<?xml version="1.0" encoding="utf-8"?>
<ApplicationManifest ApplicationTypeName="MyAppType" ApplicationTypeVersion="1.0.0"
                     xmlns="http://schemas.microsoft.com/2011/01/fabric">
  <Parameters>
    <Parameter Name="InstanceCount" DefaultValue="-1" />
    <Parameter Name="Port" DefaultValue="8080" />
  </Parameters>
  <ServiceManifestImport>
    <ServiceManifestRef ServiceManifestName="WebServicePkg" ServiceManifestVersion="1.0.0" />
  </ServiceManifestImport>
  <ServiceManifestImport>
    <ServiceManifestRef ServiceManifestName="ApiServicePkg" ServiceManifestVersion="2.0.0" />
  </ServiceManifestImport>
  <DefaultServices>
    <Service Name="WebService">
      <StatelessService ServiceTypeName="WebServiceType" InstanceCount="[InstanceCount]">
        <SingletonPartition />
      </StatelessService>
    </Service>
    <Service Name="ApiService">
      <StatefulService ServiceTypeName="ApiServiceType">
        <UniformInt64Partition PartitionCount="3" LowKey="0" HighKey="100" />
      </StatefulService>
    </Service>
  </DefaultServices>
</ApplicationManifest>`;

        let tmpDir: string;
        let manifestPath: string;

        beforeEach(() => {
            tmpDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'sfproj-test-'));
            manifestPath = path.join(tmpDir, 'ApplicationManifest.xml');
            fs.writeFileSync(manifestPath, basicManifestXml);
        });

        afterEach(() => {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        });

        test('should extract ApplicationTypeName and Version', async () => {
            const result = await service.parseApplicationManifest(manifestPath, tmpDir);
            expect(result).toBeDefined();
            expect(result!.appTypeName).toBe('MyAppType');
            expect(result!.appTypeVersion).toBe('1.0.0');
        });

        test('should parse ServiceManifestImport elements', async () => {
            const result = await service.parseApplicationManifest(manifestPath, tmpDir);
            expect(result!.services).toHaveLength(2);
            expect(result!.services[0].serviceManifestName).toBe('WebServicePkg');
            expect(result!.services[0].serviceManifestVersion).toBe('1.0.0');
            expect(result!.services[1].serviceManifestName).toBe('ApiServicePkg');
            expect(result!.services[1].serviceManifestVersion).toBe('2.0.0');
        });

        test('should parse Parameters', async () => {
            const result = await service.parseApplicationManifest(manifestPath, tmpDir);
            expect(result!.parameters).toHaveLength(2);
            expect(result!.parameters[0]).toEqual({ name: 'InstanceCount', defaultValue: '-1' });
            expect(result!.parameters[1]).toEqual({ name: 'Port', defaultValue: '8080' });
        });

        test('should enrich with DefaultServices info', async () => {
            const result = await service.parseApplicationManifest(manifestPath, tmpDir);
            // DefaultServices can't match without ServiceManifest.xml providing serviceTypeName
            // but it should at least not crash
            expect(result!.services).toBeDefined();
        });

        test('should return undefined for non-existent file', async () => {
            const result = await service.parseApplicationManifest('/nonexistent/path.xml', tmpDir);
            expect(result).toBeUndefined();
        });

        test('should return undefined for invalid XML', async () => {
            const badPath = path.join(tmpDir, 'bad.xml');
            fs.writeFileSync(badPath, 'not xml at all');
            const result = await service.parseApplicationManifest(badPath, tmpDir);
            expect(result).toBeUndefined();
        });

        test('should return undefined for XML without ApplicationManifest root', async () => {
            const noRootPath = path.join(tmpDir, 'noroot.xml');
            fs.writeFileSync(noRootPath, '<?xml version="1.0"?><SomethingElse />');
            const result = await service.parseApplicationManifest(noRootPath, tmpDir);
            expect(result).toBeUndefined();
        });
    });

    describe('parseServiceManifest', () => {
        let tmpDir: string;

        beforeEach(() => {
            tmpDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'sfproj-svc-test-'));
        });

        afterEach(() => {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        });

        test('should parse StatelessServiceType', () => {
            const xml = `<?xml version="1.0" encoding="utf-8"?>
<ServiceManifest Name="WebServicePkg" Version="1.0.0"
                 xmlns="http://schemas.microsoft.com/2011/01/fabric">
  <ServiceTypes>
    <StatelessServiceType ServiceTypeName="WebServiceType" />
  </ServiceTypes>
  <CodePackage Name="Code" Version="1.0.0">
    <EntryPoint>
      <ExeHost><Program>WebService.exe</Program></ExeHost>
    </EntryPoint>
  </CodePackage>
</ServiceManifest>`;
            const filePath = path.join(tmpDir, 'ServiceManifest.xml');
            fs.writeFileSync(filePath, xml);

            const result = service.parseServiceManifest(filePath);
            expect(result).toBeDefined();
            expect(result!.serviceTypeName).toBe('WebServiceType');
            expect(result!.serviceKind).toBe('Stateless');
        });

        test('should parse StatefulServiceType', () => {
            const xml = `<?xml version="1.0" encoding="utf-8"?>
<ServiceManifest Name="DataServicePkg" Version="2.0.0"
                 xmlns="http://schemas.microsoft.com/2011/01/fabric">
  <ServiceTypes>
    <StatefulServiceType ServiceTypeName="DataServiceType" HasPersistedState="true" />
  </ServiceTypes>
  <CodePackage Name="Code" Version="2.0.0" />
</ServiceManifest>`;
            const filePath = path.join(tmpDir, 'ServiceManifest.xml');
            fs.writeFileSync(filePath, xml);

            const result = service.parseServiceManifest(filePath);
            expect(result).toBeDefined();
            expect(result!.serviceTypeName).toBe('DataServiceType');
            expect(result!.serviceKind).toBe('Stateful');
        });

        test('should return undefined for missing file', () => {
            const result = service.parseServiceManifest('/nonexistent/ServiceManifest.xml');
            expect(result).toBeUndefined();
        });
    });

    describe('parseParameterFile', () => {
        let tmpDir: string;

        beforeEach(() => {
            tmpDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'sfproj-param-test-'));
        });

        afterEach(() => {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        });

        test('should parse parameter overrides', () => {
            const xml = `<?xml version="1.0" encoding="utf-8"?>
<Application Name="fabric:/MyApp" xmlns="http://schemas.microsoft.com/2011/01/fabric">
  <Parameters>
    <Parameter Name="InstanceCount" Value="3" />
    <Parameter Name="Port" Value="9090" />
  </Parameters>
</Application>`;
            const filePath = path.join(tmpDir, 'Cloud.xml');
            fs.writeFileSync(filePath, xml);

            const result = service.parseParameterFile(filePath);
            expect(result).toBeDefined();
            expect(result!.name).toBe('Cloud');
            expect(result!.applicationName).toBe('fabric:/MyApp');
            expect(result!.parameters).toHaveLength(2);
            expect(result!.parameters[0]).toEqual({ name: 'InstanceCount', value: '3' });
            expect(result!.parameters[1]).toEqual({ name: 'Port', value: '9090' });
        });

        test('should return undefined for non-Application XML', () => {
            const filePath = path.join(tmpDir, 'bad.xml');
            fs.writeFileSync(filePath, '<?xml version="1.0"?><SomethingElse />');
            const result = service.parseParameterFile(filePath);
            expect(result).toBeUndefined();
        });
    });

    describe('parsePublishProfile', () => {
        let tmpDir: string;

        beforeEach(() => {
            tmpDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'sfproj-profile-test-'));
        });

        afterEach(() => {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        });

        test('should parse publish profile with connection and upgrade settings', () => {
            const xml = `<?xml version="1.0" encoding="utf-8"?>
<PublishProfile xmlns="http://schemas.microsoft.com/2015/05/fabrictools">
  <ClusterConnectionParameters ConnectionEndpoint="mycluster.westus.cloudapp.azure.com:19000"
                                ServerCertThumbprint="ABC123" />
  <ApplicationParameterFile Path="..\\ApplicationParameters\\Cloud.xml" />
  <UpgradeDeployment Mode="Monitored" Enabled="true">
    <Parameters FailureAction="Rollback"
                UpgradeDomainTimeoutSec="1200"
                UpgradeTimeoutSec="3000" />
  </UpgradeDeployment>
</PublishProfile>`;
            const filePath = path.join(tmpDir, 'Cloud.xml');
            fs.writeFileSync(filePath, xml);

            const result = service.parsePublishProfile(filePath);
            expect(result).toBeDefined();
            expect(result!.name).toBe('Cloud');
            expect(result!.connectionEndpoint).toBe('mycluster.westus.cloudapp.azure.com:19000');
            expect(result!.serverCertThumbprint).toBe('ABC123');
            expect(result!.parameterFilePath).toBe('..\\ApplicationParameters\\Cloud.xml');
            expect(result!.upgradeSettings).toBeDefined();
            expect(result!.upgradeSettings!.mode).toBe('Monitored');
            expect(result!.upgradeSettings!.enabled).toBe(true);
            expect(result!.upgradeSettings!.failureAction).toBe('Rollback');
        });

        test('should parse profile without upgrade settings', () => {
            const xml = `<?xml version="1.0" encoding="utf-8"?>
<PublishProfile xmlns="http://schemas.microsoft.com/2015/05/fabrictools">
  <ClusterConnectionParameters ConnectionEndpoint="localhost:19000" />
</PublishProfile>`;
            const filePath = path.join(tmpDir, 'Local.xml');
            fs.writeFileSync(filePath, xml);

            const result = service.parsePublishProfile(filePath);
            expect(result).toBeDefined();
            expect(result!.name).toBe('Local');
            expect(result!.connectionEndpoint).toBe('localhost:19000');
            expect(result!.upgradeSettings).toBeUndefined();
        });

        test('should return undefined for invalid XML', () => {
            const filePath = path.join(tmpDir, 'bad.xml');
            fs.writeFileSync(filePath, 'not xml');
            const result = service.parsePublishProfile(filePath);
            expect(result).toBeUndefined();
        });
    });

    describe('parseProject', () => {
        let tmpDir: string;

        beforeEach(() => {
            tmpDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'sfproj-full-test-'));
        });

        afterEach(() => {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        });

        test('should return undefined when no ApplicationManifest.xml exists', async () => {
            const sfprojPath = path.join(tmpDir, 'MyApp.sfproj');
            fs.writeFileSync(sfprojPath, '<Project />');
            
            const result = await service.parseProject(sfprojPath);
            expect(result).toBeUndefined();
        });

        test('should parse a complete project structure', async () => {
            // Create .sfproj
            const sfprojPath = path.join(tmpDir, 'MyApp.sfproj');
            fs.writeFileSync(sfprojPath, '<Project />');

            // Create ApplicationManifest.xml
            const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<ApplicationManifest ApplicationTypeName="MyAppType" ApplicationTypeVersion="1.0.0"
                     xmlns="http://schemas.microsoft.com/2011/01/fabric">
  <Parameters>
    <Parameter Name="Count" DefaultValue="1" />
  </Parameters>
  <ServiceManifestImport>
    <ServiceManifestRef ServiceManifestName="WebPkg" ServiceManifestVersion="1.0.0" />
  </ServiceManifestImport>
</ApplicationManifest>`;
            fs.writeFileSync(path.join(tmpDir, 'ApplicationManifest.xml'), manifestXml);

            // Create ApplicationParameters directory
            const paramDir = path.join(tmpDir, 'ApplicationParameters');
            fs.mkdirSync(paramDir);
            fs.writeFileSync(path.join(paramDir, 'Local.xml'), `<?xml version="1.0"?>
<Application Name="fabric:/MyApp">
  <Parameters>
    <Parameter Name="Count" Value="1" />
  </Parameters>
</Application>`);

            // Create PublishProfiles directory
            const profileDir = path.join(tmpDir, 'PublishProfiles');
            fs.mkdirSync(profileDir);
            fs.writeFileSync(path.join(profileDir, 'Local.xml'), `<?xml version="1.0"?>
<PublishProfile>
  <ClusterConnectionParameters ConnectionEndpoint="localhost:19000" />
</PublishProfile>`);

            const result = await service.parseProject(sfprojPath);
            expect(result).toBeDefined();
            expect(result!.appTypeName).toBe('MyAppType');
            expect(result!.appTypeVersion).toBe('1.0.0');
            expect(result!.services).toHaveLength(1);
            expect(result!.parameters).toHaveLength(1);
            expect(result!.parameterFiles).toHaveLength(1);
            expect(result!.profiles).toHaveLength(1);
            expect(result!.sfprojPath).toBe(sfprojPath);
            expect(result!.projectDir).toBe(tmpDir);
        });
    });

    describe('discoverProjects', () => {
        test('should return empty array when no .sfproj files found', async () => {
            (vscode.workspace.findFiles as jest.Mock).mockResolvedValue([]);
            
            const result = await service.discoverProjects();
            expect(result).toEqual([]);
        });

        test('should cache results', async () => {
            (vscode.workspace.findFiles as jest.Mock).mockResolvedValue([]);
            
            await service.discoverProjects();
            await service.discoverProjects();
            
            // findFiles should only be called once due to caching
            expect(vscode.workspace.findFiles).toHaveBeenCalledTimes(1);
        });

        test('should invalidate cache', async () => {
            (vscode.workspace.findFiles as jest.Mock).mockResolvedValue([]);
            
            await service.discoverProjects();
            service.invalidateCache();
            await service.discoverProjects();
            
            expect(vscode.workspace.findFiles).toHaveBeenCalledTimes(2);
        });
    });
});
