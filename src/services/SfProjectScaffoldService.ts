/**
 * SfProjectScaffoldService — generates new Service Fabric application projects
 * matching the structure Visual Studio 2019/2022 produces.
 *
 * Supports Stateless and Stateful service templates.
 */

import * as fs from 'fs';
import * as path from 'path';
import { SfUtility, debugLevel } from '../sfUtility';

export type SfTemplateType = 'stateless' | 'stateful';

export interface ScaffoldOptions {
    templateType: SfTemplateType;
    appName: string;
    serviceName: string;
    targetDir: string;
    appTypeVersion?: string;
}

export interface ScaffoldResult {
    projectDir: string;
    sfprojPath: string;
    manifestPath: string;
    serviceManifestPath: string;
    allFiles: string[];
}

export class SfProjectScaffoldService {
    private static _instance: SfProjectScaffoldService | undefined;

    static getInstance(): SfProjectScaffoldService {
        if (!SfProjectScaffoldService._instance) {
            SfProjectScaffoldService._instance = new SfProjectScaffoldService();
        }
        return SfProjectScaffoldService._instance;
    }

    // ── Public API ─────────────────────────────────────────────────────

    async scaffoldProject(options: ScaffoldOptions): Promise<ScaffoldResult> {
        const { appName, serviceName, targetDir } = options;
        const version = options.appTypeVersion || '1.0.0';

        const appDir = path.join(targetDir, appName);
        if (fs.existsSync(appDir)) {
            throw new Error(`Directory already exists: ${appDir}`);
        }

        SfUtility.outputLog(`SfProjectScaffoldService: scaffolding ${options.templateType} project "${appName}" with service "${serviceName}"`, null, debugLevel.info);

        const allFiles: string[] = [];
        const write = (filePath: string, content: string) => {
            const dir = path.dirname(filePath);
            fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(filePath, content, 'utf-8');
            allFiles.push(filePath);
        };

        // .sfproj
        const sfprojPath = path.join(appDir, `${appName}.sfproj`);
        write(sfprojPath, this._sfproj(appName, serviceName));

        // ApplicationPackageRoot/ApplicationManifest.xml
        const manifestPath = path.join(appDir, 'ApplicationPackageRoot', 'ApplicationManifest.xml');
        write(manifestPath, this._appManifest(appName, serviceName, version, options.templateType));

        // ApplicationParameters
        for (const env of ['Cloud', 'Local.1Node', 'Local.5Node']) {
            write(
                path.join(appDir, 'ApplicationParameters', `${env}.xml`),
                this._appParameters(appName, serviceName, env, options.templateType),
            );
        }

        // PublishProfiles
        for (const env of ['Cloud', 'Local.1Node', 'Local.5Node']) {
            write(
                path.join(appDir, 'PublishProfiles', `${env}.xml`),
                this._publishProfile(env),
            );
        }

        // Service project
        const svcDir = path.join(appDir, serviceName);

        // ServiceManifest.xml
        const serviceManifestPath = path.join(svcDir, 'PackageRoot', 'ServiceManifest.xml');
        write(serviceManifestPath, this._serviceManifest(serviceName, version, options.templateType));

        // Config/Settings.xml
        write(
            path.join(svcDir, 'PackageRoot', 'Config', 'Settings.xml'),
            this._settingsXml(),
        );

        // .csproj
        write(
            path.join(svcDir, `${serviceName}.csproj`),
            this._csproj(serviceName, options.templateType),
        );

        // Program.cs
        write(
            path.join(svcDir, 'Program.cs'),
            this._programCs(serviceName, options.templateType),
        );

        // Service class
        write(
            path.join(svcDir, `${serviceName}.cs`),
            this._serviceCs(serviceName, options.templateType),
        );

        SfUtility.outputLog(`SfProjectScaffoldService: created ${allFiles.length} files in ${appDir}`, null, debugLevel.info);

        return { projectDir: appDir, sfprojPath, manifestPath, serviceManifestPath, allFiles };
    }

    // ── Validation ─────────────────────────────────────────────────────

    static validateName(name: string): string | undefined {
        if (!name) { return 'Name is required'; }
        if (name.length > 50) { return 'Name must be 50 characters or fewer'; }
        if (!/^[A-Za-z]/.test(name)) { return 'Name must start with a letter'; }
        if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(name)) { return 'Name must contain only letters, digits, and underscores'; }
        return undefined;
    }

    // ── XML templates ──────────────────────────────────────────────────

    private _sfproj(appName: string, serviceName: string): string {
        const guid = this._newGuid();
        return `<?xml version="1.0" encoding="utf-8"?>
<Project ToolsVersion="14.0" DefaultTargets="Build" xmlns="http://schemas.microsoft.com/developer/msbuild/2003">
  <PropertyGroup Label="Globals">
    <ProjectGuid>${guid}</ProjectGuid>
    <ProjectVersion>2.0</ProjectVersion>
    <MinToolsVersion>1.5</MinToolsVersion>
  </PropertyGroup>
  <ItemGroup Label="ProjectConfigurations">
    <ProjectConfiguration Include="Debug|x64">
      <Configuration>Debug</Configuration>
      <Platform>x64</Platform>
    </ProjectConfiguration>
    <ProjectConfiguration Include="Release|x64">
      <Configuration>Release</Configuration>
      <Platform>x64</Platform>
    </ProjectConfiguration>
  </ItemGroup>
  <ItemGroup>
    <None Include="ApplicationPackageRoot\\ApplicationManifest.xml" />
    <None Include="ApplicationParameters\\Cloud.xml" />
    <None Include="ApplicationParameters\\Local.1Node.xml" />
    <None Include="ApplicationParameters\\Local.5Node.xml" />
    <None Include="PublishProfiles\\Cloud.xml" />
    <None Include="PublishProfiles\\Local.1Node.xml" />
    <None Include="PublishProfiles\\Local.5Node.xml" />
  </ItemGroup>
  <ItemGroup>
    <ProjectReference Include="..\\${serviceName}\\${serviceName}.csproj" />
  </ItemGroup>
  <Import Project="$(MSBuildToolsPath)\\Microsoft.Common.targets" />
</Project>
`;
    }

    private _appManifest(appName: string, serviceName: string, version: string, templateType: SfTemplateType): string {
        const appTypeName = `${appName}Type`;
        const svcPkgName = `${serviceName}Pkg`;
        const svcTypeName = `${serviceName}Type`;

        const params = templateType === 'stateful'
            ? `    <Parameter Name="${serviceName}_MinReplicaSetSize" DefaultValue="3" />
    <Parameter Name="${serviceName}_PartitionCount" DefaultValue="1" />
    <Parameter Name="${serviceName}_TargetReplicaSetSize" DefaultValue="3" />`
            : `    <Parameter Name="${serviceName}_InstanceCount" DefaultValue="-1" />`;

        const defaultService = templateType === 'stateful'
            ? `    <Service Name="${serviceName}">
      <StatefulService ServiceTypeName="${svcTypeName}" TargetReplicaSetSize="[${serviceName}_TargetReplicaSetSize]" MinReplicaSetSize="[${serviceName}_MinReplicaSetSize]">
        <UniformInt64Partition PartitionCount="[${serviceName}_PartitionCount]" LowKey="0" HighKey="25" />
      </StatefulService>
    </Service>`
            : `    <Service Name="${serviceName}" ServicePackageActivationMode="ExclusiveProcess">
      <StatelessService ServiceTypeName="${svcTypeName}" InstanceCount="[${serviceName}_InstanceCount]">
        <SingletonPartition />
      </StatelessService>
    </Service>`;

        return `<?xml version="1.0" encoding="utf-8"?>
<ApplicationManifest xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                     ApplicationTypeName="${appTypeName}"
                     ApplicationTypeVersion="${version}"
                     xmlns="http://schemas.microsoft.com/2011/01/fabric">
  <Parameters>
${params}
  </Parameters>
  <ServiceManifestImport>
    <ServiceManifestRef ServiceManifestName="${svcPkgName}" ServiceManifestVersion="${version}" />
    <ConfigOverrides />
  </ServiceManifestImport>
  <DefaultServices>
${defaultService}
  </DefaultServices>
</ApplicationManifest>
`;
    }

    private _appParameters(appName: string, serviceName: string, env: string, templateType: SfTemplateType): string {
        let params: string;
        if (templateType === 'stateful') {
            const replicaCount = env === 'Cloud' ? '3' : '1';
            params = `    <Parameter Name="${serviceName}_PartitionCount" Value="1" />
    <Parameter Name="${serviceName}_MinReplicaSetSize" Value="${replicaCount}" />
    <Parameter Name="${serviceName}_TargetReplicaSetSize" Value="${replicaCount}" />`;
        } else {
            const instanceCount = env === 'Cloud' ? '-1' : '1';
            params = `    <Parameter Name="${serviceName}_InstanceCount" Value="${instanceCount}" />`;
        }

        return `<?xml version="1.0" encoding="utf-8"?>
<Application xmlns:xsd="http://www.w3.org/2001/XMLSchema"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             Name="fabric:/${appName}"
             xmlns="http://schemas.microsoft.com/2011/01/fabric">
  <Parameters>
${params}
  </Parameters>
</Application>
`;
    }

    private _publishProfile(env: string): string {
        const paramFile = `..\\ApplicationParameters\\${env}.xml`;
        return `<?xml version="1.0" encoding="utf-8"?>
<PublishProfile xmlns="http://schemas.microsoft.com/2015/05/fabrictools">
  <ClusterConnectionParameters />
  <ApplicationParameterFile Path="${paramFile}" />
</PublishProfile>
`;
    }

    private _serviceManifest(serviceName: string, version: string, templateType: SfTemplateType): string {
        const pkgName = `${serviceName}Pkg`;
        const typeName = `${serviceName}Type`;
        const serviceTypeTag = templateType === 'stateful'
            ? `<StatefulServiceType ServiceTypeName="${typeName}" HasPersistedState="true" />`
            : `<StatelessServiceType ServiceTypeName="${typeName}" />`;

        const endpoint = templateType === 'stateless'
            ? `
  <Resources>
    <Endpoints>
      <Endpoint Protocol="http" Name="ServiceEndpoint" Type="Input" Port="8080" />
    </Endpoints>
  </Resources>`
            : '';

        return `<?xml version="1.0" encoding="utf-8"?>
<ServiceManifest Name="${pkgName}"
                 Version="${version}"
                 xmlns="http://schemas.microsoft.com/2011/01/fabric"
                 xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <ServiceTypes>
    ${serviceTypeTag}
  </ServiceTypes>
  <CodePackage Name="Code" Version="${version}">
    <EntryPoint>
      <ExeHost>
        <Program>${serviceName}.exe</Program>
        <WorkingFolder>CodePackage</WorkingFolder>
      </ExeHost>
    </EntryPoint>
  </CodePackage>
  <ConfigPackage Name="Config" Version="${version}" />${endpoint}
</ServiceManifest>
`;
    }

    private _settingsXml(): string {
        return `<?xml version="1.0" encoding="utf-8" ?>
<Settings xmlns:xsd="http://www.w3.org/2001/XMLSchema"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xmlns="http://schemas.microsoft.com/2011/01/fabric">
</Settings>
`;
    }

    private _csproj(serviceName: string, templateType: SfTemplateType): string {
        const sfNuget = templateType === 'stateful'
            ? 'Microsoft.ServiceFabric.Services'
            : 'Microsoft.ServiceFabric.Services';

        return `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net6.0</TargetFramework>
    <OutputType>Exe</OutputType>
    <AssemblyName>${serviceName}</AssemblyName>
    <RootNamespace>${serviceName}</RootNamespace>
    <IsServiceFabricServiceProject>true</IsServiceFabricServiceProject>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.ServiceFabric" Version="10.*" />
    <PackageReference Include="${sfNuget}" Version="7.*" />
  </ItemGroup>
  <ItemGroup>
    <None Update="PackageRoot/**/*">
      <CopyToOutputDirectory>Always</CopyToOutputDirectory>
    </None>
  </ItemGroup>
</Project>
`;
    }

    private _programCs(serviceName: string, templateType: SfTemplateType): string {
        const serviceType = templateType === 'stateful'
            ? `StatefulServiceType`
            : `StatelessServiceType`;
        const registerCall = templateType === 'stateful'
            ? `ServiceRuntime.RegisterServiceAsync("${serviceName}Type",
                    context => new ${serviceName}(context)).GetAwaiter().GetResult();`
            : `ServiceRuntime.RegisterServiceAsync("${serviceName}Type",
                    context => new ${serviceName}(context)).GetAwaiter().GetResult();`;

        return `using System;
using System.Diagnostics;
using System.Threading;
using Microsoft.ServiceFabric.Services.Runtime;

namespace ${serviceName}
{
    internal static class Program
    {
        private static void Main()
        {
            try
            {
                ${registerCall}

                ServiceEventSource.Log?.ServiceTypeRegistered(
                    Process.GetCurrentProcess().Id,
                    typeof(${serviceName}).Name);

                Thread.Sleep(Timeout.Infinite);
            }
            catch (Exception e)
            {
                ServiceEventSource.Log?.ServiceHostInitializationFailed(e.ToString());
                throw;
            }
        }
    }

    /// <summary>
    /// Placeholder EventSource — replace with full ETW provider for production.
    /// </summary>
    internal sealed class ServiceEventSource
    {
        internal static ServiceEventSource? Log { get; } = new ServiceEventSource();
        internal void ServiceTypeRegistered(int processId, string serviceType) { }
        internal void ServiceHostInitializationFailed(string message) { }
    }
}
`;
    }

    private _serviceCs(serviceName: string, templateType: SfTemplateType): string {
        if (templateType === 'stateful') {
            return `using System.Collections.Generic;
using System.Fabric;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.ServiceFabric.Data.Collections;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;

namespace ${serviceName}
{
    /// <summary>
    /// A stateful service with reliable state managed by Service Fabric.
    /// </summary>
    internal sealed class ${serviceName} : StatefulService
    {
        public ${serviceName}(StatefulServiceContext context)
            : base(context)
        { }

        protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
        {
            return new ServiceReplicaListener[0];
        }

        protected override async Task RunAsync(CancellationToken cancellationToken)
        {
            var myDictionary = await StateManager.GetOrAddAsync<IReliableDictionary<string, long>>("myDictionary");

            while (true)
            {
                cancellationToken.ThrowIfCancellationRequested();

                using (var tx = StateManager.CreateTransaction())
                {
                    var result = await myDictionary.TryGetValueAsync(tx, "Counter");
                    ServiceEventSource.Log?.ServiceTypeRegistered(
                        0, $"Current Counter Value: {(result.HasValue ? result.Value : 0)}");

                    await myDictionary.AddOrUpdateAsync(tx, "Counter", 0, (key, value) => ++value);
                    await tx.CommitAsync();
                }

                await Task.Delay(TimeSpan.FromSeconds(1), cancellationToken);
            }
        }
    }
}
`;
        }

        return `using System.Collections.Generic;
using System.Fabric;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;

namespace ${serviceName}
{
    /// <summary>
    /// A stateless service instance running on Service Fabric.
    /// </summary>
    internal sealed class ${serviceName} : StatelessService
    {
        public ${serviceName}(StatelessServiceContext context)
            : base(context)
        { }

        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            return new ServiceInstanceListener[0];
        }

        protected override async Task RunAsync(CancellationToken cancellationToken)
        {
            long iterations = 0;

            while (true)
            {
                cancellationToken.ThrowIfCancellationRequested();
                ServiceEventSource.Log?.ServiceTypeRegistered(0, $"Working-{++iterations}");
                await Task.Delay(TimeSpan.FromSeconds(1), cancellationToken);
            }
        }
    }
}
`;
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private _newGuid(): string {
        const hex = () => Math.floor(Math.random() * 0x10000).toString(16).padStart(4, '0');
        return `${hex()}${hex()}-${hex()}-${hex()}-${hex()}-${hex()}${hex()}${hex()}`;
    }
}
