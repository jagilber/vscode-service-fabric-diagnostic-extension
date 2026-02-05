// Test script to verify extension activation and command registration
const fs = require('fs');
const path = require('path');

console.log('=== Extension Activation Test ===\n');

// 1. Check package.json
const packagePath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

console.log('📦 Package Info:');
console.log('  Name:', packageJson.name);
console.log('  Version:', packageJson.version);
console.log('  Main:', packageJson.main);
console.log('  Activation Events:', packageJson.activationEvents);
console.log('');

// 2. Check compiled output exists
const mainFile = path.join(__dirname, packageJson.main);
if (fs.existsSync(mainFile)) {
    console.log('✅ Compiled main file exists:', mainFile);
} else {
    console.log('❌ Compiled main file NOT found:', mainFile);
    process.exit(1);
}

// 3. Check command declarations
console.log('\n📋 Declared Commands:');
const commands = packageJson.contributes.commands;
console.log(`  Total: ${commands.length} commands`);

const relevantCommands = commands.filter(cmd => 
    cmd.command.includes('sfGetCluster') || 
    cmd.command.includes('sfSetClusterEndpoint') ||
    cmd.command.includes('refresh')
);

relevantCommands.forEach(cmd => {
    console.log(`  - ${cmd.command}`);
    console.log(`    Title: "${cmd.title}"`);
});

// 4. Check view configuration
console.log('\n👁️  View Configuration:');
const views = packageJson.contributes.views.explorer;
views.forEach(view => {
    console.log(`  - ${view.id}`);
    console.log(`    Name: "${view.name}"`);
    console.log(`    When clause: ${view.when || '(always visible)'}`);
});

// 5. Verify extension.js content
console.log('\n🔍 Checking compiled extension.js:');
const extensionJs = fs.readFileSync(mainFile, 'utf8');

const checkPatterns = [
    { name: 'registerClusterCommands', pattern: 'registerClusterCommands' },
    { name: 'sfClusterExplorer.sfGetClusters', pattern: 'sfClusterExplorer.sfGetClusters' },
    { name: 'sfClusterExplorer.sfGetCluster', pattern: 'sfClusterExplorer.sfGetCluster' },
    { name: 'registerCommand call', pattern: /vscode\.commands\.registerCommand|context\.subscriptions\.push/ },
    { name: 'activate function export', pattern: /exports\.activate|export\s+async\s+function\s+activate/ }
];

checkPatterns.forEach(({ name, pattern }) => {
    const found = typeof pattern === 'string' 
        ? extensionJs.includes(pattern)
        : pattern.test(extensionJs);
    
    console.log(`  ${found ? '✅' : '❌'} ${name}`);
});

console.log('\n✅ Test complete - extension structure looks correct');
console.log('\n💡 If commands still fail in VS Code:');
console.log('   1. Check VS Code Output panel -> Extension Host');
console.log('   2. Look for activation errors');
console.log('   3. Try: Developer: Reload Window');
console.log('   4. Check: Help -> Toggle Developer Tools -> Console');
