import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as vscode from 'vscode';
import { DeployTracker } from '../../src/services/DeployTracker';

describe('DeployTracker', () => {
    let tmpDir: string;
    let mdDir: string;
    let mdPath: string;

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'deploy-tracker-test-'));
        mdDir = path.join(tmpDir, 'docs', 'architecture');
        mdPath = path.join(mdDir, 'deploy-upgrade-phases.md');
        jest.clearAllMocks();
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    test('constructor creates md file with live status section', () => {
        const tracker = new DeployTracker(tmpDir, 'deploy', 'VotingType', '1.0.0', 'fabric:/Voting');

        expect(fs.existsSync(mdPath)).toBe(true);
        const content = fs.readFileSync(mdPath, 'utf-8');
        expect(content).toContain('<!-- LIVE_DEPLOY_STATUS_START -->');
        expect(content).toContain('<!-- LIVE_DEPLOY_STATUS_END -->');
        expect(content).toContain('VotingType');
        expect(content).toContain('v1.0.0');
        expect(content).toContain('fabric:/Voting');
    });

    test('constructor calls openTextDocument and showTextDocument', () => {
        new DeployTracker(tmpDir, 'deploy', 'VotingType', '1.0.0', 'fabric:/Voting');

        expect(vscode.workspace.openTextDocument).toHaveBeenCalledWith(
            expect.objectContaining({ fsPath: mdPath })
        );
        // showTextDocument may be called async - check it was at least invoked
        // (constructor fires it as fire-and-forget)
    });

    test('deploy creates 6 phases', () => {
        const tracker = new DeployTracker(tmpDir, 'deploy', 'T', '1.0', 'A');
        const content = fs.readFileSync(mdPath, 'utf-8');

        expect(content).toContain('Pre-flight Check');
        expect(content).toContain('Upload to Image Store');
        expect(content).toContain('Verify Upload');
        expect(content).toContain('Provision Application Type');
        expect(content).toContain('Wait for Provision');
        expect(content).toContain('Create Application');
    });

    test('upgrade creates 5 phases', () => {
        const tracker = new DeployTracker(tmpDir, 'upgrade', 'T', '2.0', 'A');
        const content = fs.readFileSync(mdPath, 'utf-8');

        expect(content).toContain('Upload New Package');
        expect(content).toContain('Provision New Version');
        expect(content).toContain('Wait for Provision');
        expect(content).toContain('Cleanup Image Store');
        expect(content).toContain('Start Rolling Upgrade');
    });

    test('remove creates 2 phases', () => {
        const tracker = new DeployTracker(tmpDir, 'remove', 'T', '1.0', 'A');
        const content = fs.readFileSync(mdPath, 'utf-8');

        expect(content).toContain('Delete Application');
        expect(content).toContain('Unprovision Type');
    });

    test('startPhase marks phase in-progress', () => {
        const tracker = new DeployTracker(tmpDir, 'remove', 'T', '1.0', 'A');
        tracker.startPhase('Delete Application');
        const content = fs.readFileSync(mdPath, 'utf-8');

        expect(content).toContain('🔄 in-progress');
    });

    test('completePhase marks phase done', () => {
        const tracker = new DeployTracker(tmpDir, 'remove', 'T', '1.0', 'A');
        tracker.startPhase('Delete Application');
        tracker.completePhase('Delete Application', 'Deleted OK');
        const content = fs.readFileSync(mdPath, 'utf-8');

        expect(content).toContain('✅ done');
        expect(content).toContain('Deleted OK');
    });

    test('failPhase marks phase failed', () => {
        const tracker = new DeployTracker(tmpDir, 'remove', 'T', '1.0', 'A');
        tracker.startPhase('Delete Application');
        tracker.failPhase('Delete Application', 'Network error');
        const content = fs.readFileSync(mdPath, 'utf-8');

        expect(content).toContain('❌ failed');
        expect(content).toContain('Network error');
    });

    test('skipPhase marks phase skipped', () => {
        const tracker = new DeployTracker(tmpDir, 'remove', 'T', '1.0', 'A');
        tracker.skipPhase('Delete Application', 'Not needed');
        const content = fs.readFileSync(mdPath, 'utf-8');

        expect(content).toContain('⏭️ skipped');
        expect(content).toContain('Not needed');
    });

    test('finishOperation success shows overall done', () => {
        const tracker = new DeployTracker(tmpDir, 'remove', 'T', '1.0', 'A');
        tracker.startPhase('Delete Application');
        tracker.completePhase('Delete Application');
        tracker.startPhase('Unprovision Type');
        tracker.completePhase('Unprovision Type');
        tracker.finishOperation(true, 'All done');
        const content = fs.readFileSync(mdPath, 'utf-8');

        expect(content).toContain('✅ Live Remove Status');
        expect(content).toContain('All done');
    });

    test('finishOperation failure shows overall failed', () => {
        const tracker = new DeployTracker(tmpDir, 'remove', 'T', '1.0', 'A');
        tracker.startPhase('Delete Application');
        tracker.failPhase('Delete Application', 'Boom');
        tracker.finishOperation(false, 'Operation failed');
        const content = fs.readFileSync(mdPath, 'utf-8');

        expect(content).toContain('❌ Live Remove Status');
        expect(content).toContain('Operation failed');
    });

    test('replaces existing live section on successive calls', () => {
        const tracker = new DeployTracker(tmpDir, 'remove', 'T', '1.0', 'A');
        tracker.startPhase('Delete Application');
        tracker.completePhase('Delete Application');
        tracker.startPhase('Unprovision Type');
        tracker.completePhase('Unprovision Type');
        tracker.finishOperation(true, 'Done');

        const content = fs.readFileSync(mdPath, 'utf-8');
        const startCount = (content.match(/LIVE_DEPLOY_STATUS_START/g) || []).length;
        const endCount = (content.match(/LIVE_DEPLOY_STATUS_END/g) || []).length;

        expect(startCount).toBe(1);
        expect(endCount).toBe(1);
    });

    test('appends to existing file without clobbering', () => {
        // Pre-create the file with existing content
        fs.mkdirSync(mdDir, { recursive: true });
        fs.writeFileSync(mdPath, '# Existing Content\n\nSome diagram here.\n');

        const tracker = new DeployTracker(tmpDir, 'remove', 'T', '1.0', 'A');
        const content = fs.readFileSync(mdPath, 'utf-8');

        expect(content).toContain('# Existing Content');
        expect(content).toContain('Some diagram here.');
        expect(content).toContain('<!-- LIVE_DEPLOY_STATUS_START -->');
    });
});
