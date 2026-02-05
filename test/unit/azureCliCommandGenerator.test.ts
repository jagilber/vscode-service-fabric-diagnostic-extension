/**
 * Azure CLI Command Generator Tests
 * Validates generated Azure CLI commands for syntax, security, and documentation
 */

import { AzureCliCommandGenerator } from '../../src/services/AzureCliCommandGenerator';

describe('AzureCliCommandGenerator', () => {
    const testClusterEndpoint = 'https://mycluster.eastus.cloudapp.azure.com:19080';
    const testClusterEndpointHttp = 'http://localhost:19080';

    describe('Setup and Connection Commands', () => {
        test('should generate setup guide with proper structure', () => {
            const markdown = AzureCliCommandGenerator.generateSetupGuide(testClusterEndpoint);
            
            expect(markdown).toContain('# 🔷 Azure CLI for Service Fabric');
            expect(markdown).toContain('az extension add --name sf');
            expect(markdown).toContain('az sf cluster select');
            expect(markdown).toContain('Prerequisites');
            expect(markdown).toContain('Installation Options');
        });

        test('should include all authentication methods', () => {
            const markdown = AzureCliCommandGenerator.generateSetupGuide(testClusterEndpoint);
            
            expect(markdown).toContain('Azure Active Directory (AAD)');
            expect(markdown).toContain('Certificate-Based Authentication');
            expect(markdown).toContain('Unsecured Cluster');
            expect(markdown).toContain('az login');
        });

        test('should extract cluster endpoint correctly from https', () => {
            const markdown = AzureCliCommandGenerator.generateSetupGuide(testClusterEndpoint);
            
            // Header shows full endpoint, but commands use stripped version
            expect(markdown).toContain('mycluster.eastus.cloudapp.azure.com');
            expect(markdown).toMatch(/az sf cluster select --endpoint mycluster/);
        });

        test('should extract cluster endpoint correctly from http', () => {
            const markdown = AzureCliCommandGenerator.generateSetupGuide(testClusterEndpointHttp);
            
            // Header shows full endpoint, but commands use stripped version
            expect(markdown).toContain('localhost:19080');
            expect(markdown).toMatch(/az sf cluster select --endpoint localhost/);
        });

        test('should include cross-platform installation instructions', () => {
            const markdown = AzureCliCommandGenerator.generateSetupGuide(testClusterEndpoint);
            
            // Windows
            expect(markdown).toContain('winget install');
            expect(markdown).toMatch(/Windows|PowerShell/);
            
            // Linux
            expect(markdown).toContain('curl -sL');
            expect(markdown).toMatch(/Ubuntu|Debian|RHEL|CentOS/);
            
            // macOS
            expect(markdown).toContain('brew');
        });

        test('should include extension installation command', () => {
            const markdown = AzureCliCommandGenerator.generateSetupGuide(testClusterEndpoint);
            
            expect(markdown).toContain('az extension add --name sf');
            expect(markdown).toContain('az sf --help');
        });

        test('should include verification commands', () => {
            const markdown = AzureCliCommandGenerator.generateSetupGuide(testClusterEndpoint);
            
            expect(markdown).toContain('az --version');
            expect(markdown).toContain('az extension list');
        });
    });

    describe('Cluster Management Commands', () => {
        test('should generate cluster health command', () => {
            const markdown = AzureCliCommandGenerator.generateClusterHealthCommand(testClusterEndpoint);
            
            expect(markdown).toContain('# 🏥 Get Cluster Health');
            expect(markdown).toContain('az sf cluster health');
            expect(markdown).toContain('--query');
            expect(markdown).toContain('aggregatedHealthState');
        });

        test('should include health filtering options', () => {
            const markdown = AzureCliCommandGenerator.generateClusterHealthCommand(testClusterEndpoint);
            
            expect(markdown).toContain('--include-health-state-filters');
            expect(markdown).toContain('Error,Warning');
            expect(markdown).toContain('-o table');
        });

        test('should generate cluster manifest command', () => {
            const markdown = AzureCliCommandGenerator.generateClusterManifestCommand(testClusterEndpoint);
            
            expect(markdown).toContain('# 📄 Show Cluster Manifest');
            expect(markdown).toContain('az sf cluster manifest');
            expect(markdown).toContain('cluster-manifest.xml');
        });

        test('should include manifest saving examples', () => {
            const markdown = AzureCliCommandGenerator.generateClusterManifestCommand(testClusterEndpoint);
            
            expect(markdown).toContain('> cluster-manifest.xml');
            expect(markdown).toContain('Out-File');
        });

        test('should generate node list command', () => {
            const markdown = AzureCliCommandGenerator.generateNodeListCommand(testClusterEndpoint);
            
            expect(markdown).toContain('# 🖥️ List Cluster Nodes');
            expect(markdown).toContain('az sf node list');
            expect(markdown).toContain('-o table');
            expect(markdown).toContain('--query');
        });

        test('should include node filtering examples', () => {
            const markdown = AzureCliCommandGenerator.generateNodeListCommand(testClusterEndpoint);
            
            expect(markdown).toContain('[?healthState');
            expect(markdown).toContain('[?type==');
            expect(markdown).toContain('az sf node info');
            expect(markdown).toContain('az sf node health');
        });
    });

    describe('Application Management Commands', () => {
        test('should generate application list command', () => {
            const markdown = AzureCliCommandGenerator.generateApplicationListCommand(testClusterEndpoint);
            
            expect(markdown).toContain('# 📦 List Applications');
            expect(markdown).toContain('az sf application list');
            expect(markdown).toContain('fabric:/MyApp');
        });

        test('should include application filtering', () => {
            const markdown = AzureCliCommandGenerator.generateApplicationListCommand(testClusterEndpoint);
            
            expect(markdown).toContain('[?typeName==');
            expect(markdown).toContain('[?healthState!=');
            expect(markdown).toContain('az sf application info');
        });

        test('should generate application health command', () => {
            const markdown = AzureCliCommandGenerator.generateApplicationHealthCommand(testClusterEndpoint);
            
            expect(markdown).toContain('# 🏥 Get Application Health');
            expect(markdown).toContain('az sf application health');
            expect(markdown).toContain('--application-id');
        });

        test('should include health state filtering', () => {
            const markdown = AzureCliCommandGenerator.generateApplicationHealthCommand(testClusterEndpoint);
            
            expect(markdown).toContain('aggregatedHealthState');
            expect(markdown).toContain('serviceHealthStates');
        });

        test('should generate application delete command with warnings', () => {
            const markdown = AzureCliCommandGenerator.generateApplicationDeleteCommand(testClusterEndpoint);
            
            expect(markdown).toContain('# 🗑️ Delete Application');
            expect(markdown).toContain('az sf application delete');
            expect(markdown).toContain('⚠️');
            expect(markdown).toContain('--force');
        });

        test('should include complete cleanup workflow', () => {
            const markdown = AzureCliCommandGenerator.generateApplicationDeleteCommand(testClusterEndpoint);
            
            expect(markdown).toContain('az sf application info');
            expect(markdown).toContain('az sf application type version delete');
            expect(markdown).toContain('Verify cleanup');
        });
    });

    describe('Service Management Commands', () => {
        test('should generate service list command', () => {
            const markdown = AzureCliCommandGenerator.generateServiceListCommand(testClusterEndpoint);
            
            expect(markdown).toContain('# 🔧 List Services');
            expect(markdown).toContain('az sf service list');
            expect(markdown).toContain('--application-id');
        });

        test('should include service details commands', () => {
            const markdown = AzureCliCommandGenerator.generateServiceListCommand(testClusterEndpoint);
            
            expect(markdown).toContain('az sf service info');
            expect(markdown).toContain('az sf service health');
            expect(markdown).toContain('az sf partition list');
        });

        test('should include service filtering examples', () => {
            const markdown = AzureCliCommandGenerator.generateServiceListCommand(testClusterEndpoint);
            
            expect(markdown).toContain('[?healthState!=');
            expect(markdown).toContain('[?serviceTypeName==');
        });
    });

    describe('Query and Diagnostics Commands', () => {
        test('should generate query guide with examples', () => {
            const markdown = AzureCliCommandGenerator.generateQueryGuide(testClusterEndpoint);
            
            expect(markdown).toContain('# 🔍 Query & Diagnostics Guide');
            expect(markdown).toContain('JMESPath');
            expect(markdown).toContain('--query');
        });

        test('should include common query patterns', () => {
            const markdown = AzureCliCommandGenerator.generateQueryGuide(testClusterEndpoint);
            
            expect(markdown).toContain('Health Queries');
            expect(markdown).toContain('Resource Queries');
            expect(markdown).toContain('Status Queries');
        });

        test('should demonstrate output format options', () => {
            const markdown = AzureCliCommandGenerator.generateQueryGuide(testClusterEndpoint);
            
            expect(markdown).toContain('-o json');
            expect(markdown).toContain('-o table');
            expect(markdown).toContain('-o tsv');
            expect(markdown).toContain('-o yaml');
        });

        test('should include advanced JMESPath examples', () => {
            const markdown = AzureCliCommandGenerator.generateQueryGuide(testClusterEndpoint);
            
            expect(markdown).toContain('Advanced JMESPath Queries');
            expect(markdown).toContain('[?');
            expect(markdown).toContain('length(@)');
        });

        test('should include jq piping examples', () => {
            const markdown = AzureCliCommandGenerator.generateQueryGuide(testClusterEndpoint);
            
            expect(markdown).toContain('| jq');
        });
    });

    describe('Security Validation', () => {
        test('should not contain real Azure subscription IDs', () => {
            const commands = [
                AzureCliCommandGenerator.generateSetupGuide(testClusterEndpoint),
                AzureCliCommandGenerator.generateClusterHealthCommand(testClusterEndpoint),
                AzureCliCommandGenerator.generateApplicationListCommand(testClusterEndpoint),
                AzureCliCommandGenerator.generateQueryGuide(testClusterEndpoint)
            ];

            commands.forEach(markdown => {
                // Should not have real subscription IDs (except placeholders like YOUR_SUBSCRIPTION_ID)
                const realSubIdPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?!.*YOUR|.*example|.*SUBSCRIPTION)/i;
                expect(markdown).not.toMatch(realSubIdPattern);
            });
        });

        test('should not contain real storage account keys', () => {
            const commands = [
                AzureCliCommandGenerator.generateSetupGuide(testClusterEndpoint),
                AzureCliCommandGenerator.generateClusterHealthCommand(testClusterEndpoint)
            ];

            commands.forEach(markdown => {
                const storageKeyPattern = /AccountKey=[A-Za-z0-9+/]{86}==/;
                expect(markdown).not.toMatch(storageKeyPattern);
            });
        });

        test('should not contain internal/production references', () => {
            const commands = [
                AzureCliCommandGenerator.generateSetupGuide(testClusterEndpoint),
                AzureCliCommandGenerator.generateClusterHealthCommand(testClusterEndpoint),
                AzureCliCommandGenerator.generateApplicationListCommand(testClusterEndpoint)
            ];

            commands.forEach(markdown => {
                expect(markdown).not.toMatch(/\b(prod|production|internal|corp|corporate)\b(?!.*example)/i);
            });
        });

        test('should use consistent example data', () => {
            const markdown = AzureCliCommandGenerator.generateSetupGuide(testClusterEndpoint);
            
            expect(markdown).toContain('mycluster');
            expect(markdown).not.toMatch(/\bsfjagilber\b/i);
            expect(markdown).not.toMatch(/[0-9A-F]{40}(?!.*1234|.*ABCD)/); // No real thumbprints
        });

        test('should not contain real email addresses', () => {
            const commands = [
                AzureCliCommandGenerator.generateSetupGuide(testClusterEndpoint),
                AzureCliCommandGenerator.generateClusterHealthCommand(testClusterEndpoint)
            ];

            commands.forEach(markdown => {
                const emailPattern = /\b[A-Za-z0-9._%+-]+@(?!microsoft\.com|example\.com|contoso\.com)[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
                expect(markdown).not.toMatch(emailPattern);
            });
        });
    });

    describe('Documentation Links', () => {
        test('should include Microsoft Learn references', () => {
            const commands = [
                AzureCliCommandGenerator.generateSetupGuide(testClusterEndpoint),
                AzureCliCommandGenerator.generateClusterHealthCommand(testClusterEndpoint),
                AzureCliCommandGenerator.generateQueryGuide(testClusterEndpoint),
                AzureCliCommandGenerator.generateApplicationListCommand(testClusterEndpoint)
            ];

            commands.forEach(markdown => {
                expect(markdown).toMatch(/learn\.microsoft\.com|aka\.ms/);
            });
        });

        test('should link to Azure CLI documentation', () => {
            const markdown = AzureCliCommandGenerator.generateSetupGuide(testClusterEndpoint);
            
            expect(markdown).toContain('https://learn.microsoft.com/cli/azure');
            expect(markdown).toContain('Service Fabric CLI');
        });

        test('should have proper reference sections', () => {
            const commands = [
                AzureCliCommandGenerator.generateClusterHealthCommand(testClusterEndpoint),
                AzureCliCommandGenerator.generateClusterManifestCommand(testClusterEndpoint),
                AzureCliCommandGenerator.generateNodeListCommand(testClusterEndpoint)
            ];

            commands.forEach(markdown => {
                expect(markdown).toMatch(/📚\s*\*\*Reference:\*\*/);
            });
        });
    });

    describe('Code Block Validation', () => {
        test('should extract bash code blocks', () => {
            const markdown = AzureCliCommandGenerator.generateClusterHealthCommand(testClusterEndpoint);
            const bashBlocks = markdown.match(/```bash\n([\s\S]*?)```/g);
            
            expect(bashBlocks).toBeTruthy();
            expect(bashBlocks!.length).toBeGreaterThan(0);
        });

        test('should have valid Azure CLI command syntax', () => {
            const markdown = AzureCliCommandGenerator.generateNodeListCommand(testClusterEndpoint);
            const bashBlocks = markdown.match(/```bash\n([\s\S]*?)```/g);
            
            expect(bashBlocks).toBeTruthy();
            
            bashBlocks?.forEach(block => {
                const content = block.replace(/```bash\n|```/g, '');
                const lines = content.split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
                
                lines.forEach(line => {
                    const trimmed = line.trim();
                    // Should start with 'az' or be a continuation (pipe, backslash, redirect)
                    expect(trimmed).toMatch(/^(az\s|#|\||\\|>|<|done|do|then|fi|while|for|if)/);
                });
            });
        });

        test('should include PowerShell examples for Windows', () => {
            const markdown = AzureCliCommandGenerator.generateClusterManifestCommand(testClusterEndpoint);
            
            expect(markdown).toMatch(/```powershell/);
            expect(markdown).toContain('Out-File');
        });

        test('should have balanced code block markers', () => {
            const commands = [
                AzureCliCommandGenerator.generateSetupGuide(testClusterEndpoint),
                AzureCliCommandGenerator.generateClusterHealthCommand(testClusterEndpoint),
                AzureCliCommandGenerator.generateQueryGuide(testClusterEndpoint)
            ];

            commands.forEach(markdown => {
                const openBlocks = (markdown.match(/```/g) || []).length;
                expect(openBlocks % 2).toBe(0);
            });
        });
    });

    describe('Cross-Platform Compatibility', () => {
        test('should include Windows-specific guidance', () => {
            const markdown = AzureCliCommandGenerator.generateSetupGuide(testClusterEndpoint);
            
            expect(markdown).toContain('Windows');
            expect(markdown).toContain('winget');
            expect(markdown).toContain('PowerShell');
        });

        test('should include Linux-specific guidance', () => {
            const markdown = AzureCliCommandGenerator.generateSetupGuide(testClusterEndpoint);
            
            expect(markdown).toContain('Linux');
            expect(markdown).toContain('Ubuntu');
            expect(markdown).toContain('curl');
        });

        test('should include macOS-specific guidance', () => {
            const markdown = AzureCliCommandGenerator.generateSetupGuide(testClusterEndpoint);
            
            expect(markdown).toContain('macOS');
            expect(markdown).toContain('Homebrew');
            expect(markdown).toContain('brew');
        });

        test('should handle backslash line continuations', () => {
            const markdown = AzureCliCommandGenerator.generateSetupGuide(testClusterEndpoint);
            
            // Should use backslash for multi-line bash commands in setup examples
            expect(markdown).toMatch(/\\\s*\n/);
        });
    });

    describe('Output Format Options', () => {
        test('should demonstrate json output', () => {
            const markdown = AzureCliCommandGenerator.generateQueryGuide(testClusterEndpoint);
            
            expect(markdown).toContain('-o json');
            expect(markdown).toContain('jq');
        });

        test('should demonstrate table output', () => {
            const markdown = AzureCliCommandGenerator.generateNodeListCommand(testClusterEndpoint);
            
            expect(markdown).toContain('-o table');
        });

        test('should demonstrate tsv output', () => {
            const markdown = AzureCliCommandGenerator.generateQueryGuide(testClusterEndpoint);
            
            expect(markdown).toContain('-o tsv');
        });

        test('should demonstrate yaml output', () => {
            const markdown = AzureCliCommandGenerator.generateQueryGuide(testClusterEndpoint);
            
            expect(markdown).toContain('-o yaml');
        });

        test('should show query filtering examples', () => {
            const markdown = AzureCliCommandGenerator.generateQueryGuide(testClusterEndpoint);
            
            expect(markdown).toContain('--query');
            expect(markdown).toContain('[?');
            expect(markdown).toContain('JMESPath');
        });
    });

    describe('User Experience Elements', () => {
        test('should include emoji headers for visual clarity', () => {
            const markdown = AzureCliCommandGenerator.generateClusterHealthCommand(testClusterEndpoint);
            
            expect(markdown).toMatch(/# 🏥/);
        });

        test('should include warning symbols for destructive operations', () => {
            const markdown = AzureCliCommandGenerator.generateApplicationDeleteCommand(testClusterEndpoint);
            
            expect(markdown).toContain('⚠️');
        });

        test('should include quick tips section', () => {
            const markdown = AzureCliCommandGenerator.generateSetupGuide(testClusterEndpoint);
            
            expect(markdown).toContain('💡 Quick Tips');
        });

        test('should include generated timestamp', () => {
            const markdown = AzureCliCommandGenerator.generateClusterHealthCommand(testClusterEndpoint);
            
            expect(markdown).toMatch(/\*\*Generated:\*\*/);
        });

        test('should include cluster endpoint in header', () => {
            const markdown = AzureCliCommandGenerator.generateClusterHealthCommand(testClusterEndpoint);
            
            expect(markdown).toContain('**Cluster:**');
            expect(markdown).toContain('mycluster.eastus.cloudapp.azure.com');
        });
    });

    describe('Content Completeness', () => {
        test('should have multi-section structure in setup guide', () => {
            const markdown = AzureCliCommandGenerator.generateSetupGuide(testClusterEndpoint);
            
            expect(markdown).toContain('## 📋 Prerequisites');
            expect(markdown).toContain('## 🔐 Authentication Methods');
            expect(markdown).toContain('## ✅ Verify Connection');
            expect(markdown).toContain('## 💡 Quick Tips');
        });

        test('should provide multiple command examples per operation', () => {
            const markdown = AzureCliCommandGenerator.generateClusterHealthCommand(testClusterEndpoint);
            
            const bashBlocks = markdown.match(/```bash/g);
            expect(bashBlocks).toBeTruthy();
            expect(bashBlocks!.length).toBeGreaterThan(1);
        });

        test('should include explanatory text between commands', () => {
            const markdown = AzureCliCommandGenerator.generateApplicationListCommand(testClusterEndpoint);
            
            expect(markdown).toMatch(/##\s+\w+/); // Multiple section headers
            expect(markdown.length).toBeGreaterThan(500); // Substantial content
        });
    });
});
