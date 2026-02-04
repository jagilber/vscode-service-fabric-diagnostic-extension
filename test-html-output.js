// Quick test to see what HTML is generated
const mockContext = {
    subscriptions: [],
    extensionPath: '/mock',
    globalStorageUri: { fsPath: '/mock/storage' },
    extensionUri: { fsPath: '/mock/extension' }
};

const mockSfRest = {
    getClusterUpgradeProgress: async () => ({})
};

// Simplified getHtmlContent logic to test
function getHtmlContent(progress, actualClusterVersion) {
    const displayVersion = actualClusterVersion || progress.codeVersion || 'N/A';
    console.log('progress.codeVersion:', progress.codeVersion);
    console.log('actualClusterVersion:', actualClusterVersion);
    console.log('displayVersion:', displayVersion);
    
    return `<div>Code Version: ${displayVersion}</div>`;
}

const response = {
    codeVersion: '0.0.0.0',
    upgradeState: 'Invalid',
    isNodeByNode: false
};

const html = getHtmlContent(response, '11.3.365.1');
console.log('\nGenerated HTML:');
console.log(html);
console.log('\nHTML includes 11.3.365.1?', html.includes('11.3.365.1'));
console.log('HTML includes 0.0.0.0?', html.includes('0.0.0.0'));
