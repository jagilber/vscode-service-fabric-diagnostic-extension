/**
 * Unit tests for JsonCommentStripper
 * Tests JSONC → strict JSON conversion: single-line comments, block comments,
 * comments inside strings (must be preserved), trailing commas, and detection.
 */

import { hasJsonComments, stripJsonComments } from '../../../src/utils/JsonCommentStripper';

describe('JsonCommentStripper', () => {
    // ── hasJsonComments ────────────────────────────────────────────────

    describe('hasJsonComments', () => {
        it('should return false for plain JSON', () => {
            const json = '{ "key": "value", "num": 42 }';
            expect(hasJsonComments(json)).toBe(false);
        });

        it('should return true for single-line comment', () => {
            const json = '{ "key": "value" // comment\n}';
            expect(hasJsonComments(json)).toBe(true);
        });

        it('should return true for block comment', () => {
            const json = '{ "key": /* comment */ "value" }';
            expect(hasJsonComments(json)).toBe(true);
        });

        it('should return false when // is inside a string', () => {
            const json = '{ "url": "https://example.com" }';
            expect(hasJsonComments(json)).toBe(false);
        });

        it('should return false when /* is inside a string', () => {
            const json = '{ "pattern": "a /* b */ c" }';
            expect(hasJsonComments(json)).toBe(false);
        });

        it('should return true for commented-out JSON value', () => {
            // Pattern from actual Azure template: //"Bronze",
            const json = `{
  "allowedValues": [
    //"Bronze",
    "Silver"
  ]
}`;
            expect(hasJsonComments(json)).toBe(true);
        });

        it('should handle escaped quotes in strings', () => {
            const json = '{ "key": "he said \\"hello\\"" }';
            expect(hasJsonComments(json)).toBe(false);
        });

        it('should detect comment after string with escaped quotes', () => {
            const json = '{ "key": "he said \\"hello\\"" } // comment';
            expect(hasJsonComments(json)).toBe(true);
        });
    });

    // ── stripJsonComments ──────────────────────────────────────────────

    describe('stripJsonComments', () => {
        it('should return plain JSON unchanged', () => {
            const json = '{ "key": "value", "num": 42 }';
            expect(stripJsonComments(json)).toBe(json);
        });

        it('should strip single-line comment at end of line', () => {
            const json = '{ "key": "value" // inline comment\n}';
            const expected = '{ "key": "value" \n}';
            expect(stripJsonComments(json)).toBe(expected);
        });

        it('should strip full-line single-line comment', () => {
            const json = `{
  // This is a comment
  "key": "value"
}`;
            const expected = `{
  
  "key": "value"
}`;
            expect(stripJsonComments(json)).toBe(expected);
        });

        it('should strip block comment', () => {
            const json = '{ "key": /* comment */ "value" }';
            const expected = '{ "key":  "value" }';
            expect(stripJsonComments(json)).toBe(expected);
        });

        it('should strip multi-line block comment preserving newlines', () => {
            const json = `{
  "key": "value",
  /* this
     spans
     multiple lines */
  "other": 1
}`;
            const result = stripJsonComments(json);
            // Newlines inside block comments are preserved
            expect(result).toContain('"key": "value"');
            expect(result).toContain('"other": 1');
            expect(result).not.toContain('spans');
            expect(result).not.toContain('multiple');
        });

        it('should NOT strip // inside strings', () => {
            const json = '{ "url": "https://example.com" }';
            expect(stripJsonComments(json)).toBe(json);
        });

        it('should NOT strip /* inside strings', () => {
            const json = '{ "pattern": "a /* b */ c" }';
            expect(stripJsonComments(json)).toBe(json);
        });

        it('should handle the real-world ARM template comment pattern', () => {
            const json = `{
  "allowedValues": [
    //"Bronze", // automatic os image upgrade not supported for bronze
    "Silver",
    "Gold"
  ]
}`;
            const result = stripJsonComments(json);
            const parsed = JSON.parse(result);
            expect(parsed.allowedValues).toEqual(['Silver', 'Gold']);
        });

        it('should handle multiple single-line comments', () => {
            const json = `{
  // first comment
  "a": 1, // inline
  // second comment
  "b": 2
}`;
            const result = stripJsonComments(json);
            const parsed = JSON.parse(result);
            expect(parsed.a).toBe(1);
            expect(parsed.b).toBe(2);
        });

        it('should remove trailing commas before }', () => {
            const json = '{ "a": 1, "b": 2, }';
            const result = stripJsonComments(json);
            expect(result).toBe('{ "a": 1, "b": 2 }');
        });

        it('should remove trailing commas before ]', () => {
            const json = '{ "arr": [1, 2, 3, ] }';
            const result = stripJsonComments(json);
            expect(result).toBe('{ "arr": [1, 2, 3 ] }');
        });

        it('should handle trailing comma after comment removal', () => {
            // Removing a commented line can leave a trailing comma
            const json = `{
  "allowedValues": [
    "Gold",
    //"Silver",
  ]
}`;
            const result = stripJsonComments(json);
            const parsed = JSON.parse(result);
            expect(parsed.allowedValues).toEqual(['Gold']);
        });

        it('should handle escaped quotes correctly', () => {
            const json = '{ "msg": "she said \\"// not a comment\\"" }';
            const result = stripJsonComments(json);
            const parsed = JSON.parse(result);
            expect(parsed.msg).toBe('she said "// not a comment"');
        });

        it('should handle empty input', () => {
            expect(stripJsonComments('')).toBe('');
        });

        it('should handle comment-only input', () => {
            const json = '// just a comment';
            expect(stripJsonComments(json).trim()).toBe('');
        });

        it('should produce valid JSON from a realistic ARM template snippet', () => {
            const template = `{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "reliabilityLevel": {
      "type": "string",
      //"Bronze", // not supported for auto upgrade
      "defaultValue": "Silver",
      "allowedValues": [
        //"Bronze",
        "Silver",
        "Gold",
        "Platinum"
      ]
    }
  },
  "resources": []
}`;
            const result = stripJsonComments(template);
            const parsed = JSON.parse(result);
            expect(parsed.$schema).toContain('deploymentTemplate.json');
            expect(parsed.parameters.reliabilityLevel.defaultValue).toBe('Silver');
            expect(parsed.parameters.reliabilityLevel.allowedValues).toEqual([
                'Silver', 'Gold', 'Platinum',
            ]);
        });
    });
});
