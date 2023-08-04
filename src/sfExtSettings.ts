import * as vscode from 'vscode';
import { debugLevel, SfUtility } from './sfUtility';

export const  enum sfExtSettingsList {
    clusters = 'clusters',
    cluster = 'clusters.cluster',
    clusterCertificate = 'clusters.cluster.certificate'
}

export class SfExtSettings {
    private static configurationSection = "sfClusterExplorer"; //servicefabric
    private static configurationSettings: vscode.WorkspaceConfiguration;

    public static getSetting(setting: sfExtSettingsList) {
        const settings = vscode.workspace.getConfiguration(this.configurationSection);
        const value = settings.get(setting);
        SfUtility.outputLog('sfExtSettings:getSetting returning:setting:' + setting + ' value:' + value, settings);
        return value;
    }

    public static getSettings(): vscode.WorkspaceConfiguration {
        const settings = vscode.workspace.getConfiguration(this.configurationSection);
        SfUtility.outputLog('sfExtSettings:getSettings:settings:', settings);
        return settings;
    }

    public static removeSetting(setting: sfExtSettingsList, value?: any) {
        const settings = vscode.workspace.getConfiguration(this.configurationSection);
        SfUtility.outputLog('sfExtSettings:removeSetting:setting:' + setting + ' value:' + value);
        const currentSetting = SfExtSettings.getSetting(setting);
        if (Array.isArray(currentSetting)) {
            if (currentSetting.includes(value)) {
                SfUtility.outputLog('sfExtSettings:removeSetting:setting is array:' + setting);
                currentSetting.splice(currentSetting.indexOf(value), 1);
            }
            else {
                SfUtility.outputLog('sfExtSettings:removeSetting:setting not array:' + setting);
                const settingValue = (SfExtSettings.getSetting(setting) as string[])?.filter((item: any) => item === value);
            }
            value = currentSetting;
        }

        SfUtility.outputLog('sfExtSettings:removeSetting:setting:' + setting, settings);
        return settings.update(setting, value, vscode.ConfigurationTarget.Global);
    }

    public static updateSetting(setting: sfExtSettingsList, value: any) {
        const settings = vscode.workspace.getConfiguration(this.configurationSection);
        SfUtility.outputLog('sfExtSettings:updateSetting:setting:' + setting + ' value:' + value);
        const currentSetting = SfExtSettings.getSetting(setting);
        if (Array.isArray(currentSetting)) {
            if (value) {
                // child setting/array
                if (!currentSetting.includes(value)) {
                    SfUtility.outputLog('sfExtSettings:updateSetting:adding array:' + setting + ' value:' + value);
                    currentSetting.push(value);
                }
                else {
                    SfUtility.outputLog('sfExtSettings:updateSetting:array already exists:' + setting + ' value:' + value);
                    return;
                }
            }
            value = currentSetting;
        }

        SfUtility.outputLog('sfExtSettings:updateSetting:setting:' + setting + ' value:' + value, settings);
        return settings.update(setting, value, vscode.ConfigurationTarget.Global);
    }
}