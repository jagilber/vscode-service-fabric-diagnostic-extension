/**
 * IconService Unit Tests
 * 
 * Tests the icon/color mapping logic that underpins all tree view icons.
 * These catch regressions in health state → color resolution.
 */

import * as vscode from 'vscode';
import { IconService } from '../../../src/treeview/IconService';

describe('IconService', () => {
    let service: IconService;

    beforeEach(() => {
        service = new IconService();
    });

    describe('getHealthIcon()', () => {
        it.each([
            ['Ok', 'testing.iconPassed'],
            ['ok', 'testing.iconPassed'],
            ['Ready', 'testing.iconPassed'],
            ['Active', 'testing.iconPassed'],
            ['Warning', 'testing.iconQueued'],
            ['warning', 'testing.iconQueued'],
            ['Upgrading', 'testing.iconQueued'],
            ['Error', 'testing.iconFailed'],
            ['error', 'testing.iconFailed'],
            ['Failed', 'testing.iconFailed'],
            ['Down', 'testing.iconFailed'],
        ])('should map healthState "%s" to color "%s"', (healthState, expectedColor) => {
            const icon = service.getHealthIcon(healthState, 'test-icon');
            expect(icon).toBeInstanceOf(vscode.ThemeIcon);
            expect(icon.id).toBe('test-icon');
            expect(icon.color).toBeInstanceOf(vscode.ThemeColor);
            expect((icon.color as vscode.ThemeColor).id).toBe(expectedColor);
        });

        it('should return plain icon for undefined healthState', () => {
            const icon = service.getHealthIcon(undefined, 'test-icon');
            expect(icon).toBeInstanceOf(vscode.ThemeIcon);
            expect(icon.id).toBe('test-icon');
            expect(icon.color).toBeUndefined();
        });

        it('should return plain icon for unknown healthState', () => {
            const icon = service.getHealthIcon('SomethingWeird', 'test-icon');
            expect(icon).toBeInstanceOf(vscode.ThemeIcon);
            expect(icon.color).toBeUndefined();
        });
    });

    describe('getStaticIcon()', () => {
        it('should return ThemeIcon with ThemeColor', () => {
            const icon = service.getStaticIcon('database', 'charts.blue');
            expect(icon).toBeInstanceOf(vscode.ThemeIcon);
            expect(icon.id).toBe('database');
            expect(icon.color).toBeInstanceOf(vscode.ThemeColor);
            expect((icon.color as vscode.ThemeColor).id).toBe('charts.blue');
        });
    });

    describe('getPlainIcon()', () => {
        it('should return ThemeIcon without color', () => {
            const icon = service.getPlainIcon('folder');
            expect(icon).toBeInstanceOf(vscode.ThemeIcon);
            expect(icon.id).toBe('folder');
            expect(icon.color).toBeUndefined();
        });
    });

    describe('worstHealthState()', () => {
        it('should return Error as worst', () => {
            expect(IconService.worstHealthState(['Ok', 'Warning', 'Error'])).toBe('Error');
        });

        it('should return Warning over Ok', () => {
            expect(IconService.worstHealthState(['Ok', 'Warning'])).toBe('Warning');
        });

        it('should return Ok when all Ok', () => {
            expect(IconService.worstHealthState(['Ok', 'Ok'])).toBe('Ok');
        });

        it('should skip undefined entries', () => {
            expect(IconService.worstHealthState([undefined, 'Ok', undefined])).toBe('Ok');
        });

        it('should return undefined for empty array', () => {
            expect(IconService.worstHealthState([])).toBeUndefined();
        });

        it('should return undefined for all-undefined array', () => {
            expect(IconService.worstHealthState([undefined, undefined])).toBeUndefined();
        });
    });
});
