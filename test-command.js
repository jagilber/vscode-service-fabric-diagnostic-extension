// Test if command is registered
const vscode = require('vscode');

async function testCommand() {
    console.log('Testing sfClusterExplorer.sfGetCluster command...');
    
    // Get all commands
    const allCommands = await vscode.commands.getCommands(true);
    const sfCommands = allCommands.filter(c => c.includes('sfCluster') || c.includes('serviceFabric'));
    
    console.log('Service Fabric commands found:', sfCommands);
    
    if (sfCommands.includes('sfClusterExplorer.sfGetCluster')) {
        console.log('✓ Command sfClusterExplorer.sfGetCluster IS registered');
    } else {
        console.log('✗ Command sfClusterExplorer.sfGetCluster NOT registered');
    }
    
    // Try to execute it
    try {
        await vscode.commands.executeCommand('sfClusterExplorer.sfGetCluster');
        console.log('✓ Command executed successfully');
    } catch (error) {
        console.error('✗ Command execution failed:', error.message);
    }
}

module.exports = { testCommand };
