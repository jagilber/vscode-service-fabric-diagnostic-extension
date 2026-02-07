/**
 * Unit tests for SfExtSettings
 */
import * as vscode from 'vscode';
import { SfExtSettings, sfExtSettingsList } from '../../src/sfExtSettings';

describe('SfExtSettings', () => {
    let mockSettings: any;

    beforeEach(() => {
        mockSettings = {
            get: jest.fn(),
            update: jest.fn().mockResolvedValue(undefined),
            has: jest.fn(),
        };
        (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue(mockSettings);
    });

    describe('getSetting', () => {
        test('should retrieve setting from workspace config', () => {
            mockSettings.get.mockReturnValue('http://localhost:19080');
            const result = SfExtSettings.getSetting(sfExtSettingsList.cluster);
            expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith('sfClusterExplorer');
            expect(mockSettings.get).toHaveBeenCalledWith('clusters.cluster');
            expect(result).toBe('http://localhost:19080');
        });

        test('should return undefined for missing setting', () => {
            mockSettings.get.mockReturnValue(undefined);
            expect(SfExtSettings.getSetting(sfExtSettingsList.autorefresh)).toBeUndefined();
        });

        test('should retrieve boolean settings', () => {
            mockSettings.get.mockReturnValue(true);
            expect(SfExtSettings.getSetting(sfExtSettingsList.autorefresh)).toBe(true);
        });
    });

    describe('getSettings', () => {
        test('should return full workspace configuration', () => {
            const result = SfExtSettings.getSettings();
            expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith('sfClusterExplorer');
            expect(result).toBe(mockSettings);
        });
    });

    describe('updateSetting', () => {
        test('should update a scalar setting', () => {
            mockSettings.get.mockReturnValue(5000);
            SfExtSettings.updateSetting(sfExtSettingsList.refreshInterval, 10000);
            expect(mockSettings.update).toHaveBeenCalledWith(
                'refreshInterval',
                10000,
                vscode.ConfigurationTarget.Global
            );
        });

        test('should add to array setting if not duplicate', () => {
            // Use a non-clusters setting to test plain array dedup (includes check)
            const existing = ['value1'];
            mockSettings.get.mockReturnValue(existing);
            SfExtSettings.updateSetting(sfExtSettingsList.cluster as any, 'value2');
            expect(mockSettings.update).toHaveBeenCalledWith(
                'clusters.cluster',
                ['value1', 'value2'],
                vscode.ConfigurationTarget.Global
            );
        });

        test('should not add duplicate scalar to array setting', () => {
            const existing = ['http://cluster1:19080'];
            mockSettings.get.mockReturnValue(existing);
            SfExtSettings.updateSetting(sfExtSettingsList.clusters as any, 'http://cluster1:19080');
            // Should return early, not call update
            expect(mockSettings.update).not.toHaveBeenCalled();
        });

        test('should detect duplicate cluster by endpoint property', () => {
            const existing = [{ endpoint: 'http://cluster1:19080', name: 'c1' }];
            mockSettings.get.mockReturnValue(existing);
            SfExtSettings.updateSetting(sfExtSettingsList.clusters, { endpoint: 'http://cluster1:19080', name: 'c1-renamed' });
            // Should return early due to duplicate endpoint
            expect(mockSettings.update).not.toHaveBeenCalled();
        });

        test('should add non-duplicate cluster by endpoint property', () => {
            const existing = [{ endpoint: 'http://cluster1:19080', name: 'c1' }];
            mockSettings.get.mockReturnValue(existing);
            SfExtSettings.updateSetting(sfExtSettingsList.clusters, { endpoint: 'http://cluster2:19080', name: 'c2' });
            expect(mockSettings.update).toHaveBeenCalledWith(
                'clusters',
                expect.arrayContaining([
                    { endpoint: 'http://cluster1:19080', name: 'c1' },
                    { endpoint: 'http://cluster2:19080', name: 'c2' },
                ]),
                vscode.ConfigurationTarget.Global
            );
        });
    });

    describe('removeSetting', () => {
        test('should remove value from array setting', () => {
            const existing = ['http://cluster1:19080', 'http://cluster2:19080'];
            mockSettings.get.mockReturnValue(existing);
            SfExtSettings.removeSetting(sfExtSettingsList.clusters as any, 'http://cluster1:19080');
            expect(mockSettings.update).toHaveBeenCalledWith(
                'clusters',
                ['http://cluster2:19080'],
                vscode.ConfigurationTarget.Global
            );
        });

        test('should handle removing value not in array', () => {
            const existing = ['http://cluster1:19080'];
            mockSettings.get.mockReturnValue(existing);
            SfExtSettings.removeSetting(sfExtSettingsList.clusters as any, 'http://notfound:19080');
            // Should still call update with original array
            expect(mockSettings.update).toHaveBeenCalled();
        });

        test('should remove non-array setting', () => {
            mockSettings.get.mockReturnValue('scalar-value');
            SfExtSettings.removeSetting(sfExtSettingsList.autorefresh, undefined);
            expect(mockSettings.update).toHaveBeenCalledWith(
                'autorefresh',
                undefined,
                vscode.ConfigurationTarget.Global
            );
        });
    });

    describe('sfExtSettingsList enum', () => {
        test('clusters should be "clusters"', () => {
            expect(sfExtSettingsList.clusters).toBe('clusters');
        });

        test('cluster should be "clusters.cluster"', () => {
            expect(sfExtSettingsList.cluster).toBe('clusters.cluster');
        });

        test('clusterCertificate should be "clusters.cluster.certificate"', () => {
            expect(sfExtSettingsList.clusterCertificate).toBe('clusters.cluster.certificate');
        });
    });
});
