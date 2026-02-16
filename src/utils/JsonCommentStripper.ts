/**
 * JsonCommentStripper — strips JavaScript-style comments from JSONC text,
 * producing valid strict JSON.
 *
 * Handles:
 *  - Single-line comments: // …
 *  - Block comments: /* … *​/
 *  - Preserves strings containing // or /* literally
 *  - Handles escaped quotes inside strings
 *
 * ARM template files from some repositories contain // comments that are
 * accepted by PowerShell's lenient ConvertFrom-Json (JSONC), but rejected
 * by the Azure portal's strict JSON parser.  This utility normalises the
 * content before sending it to the portal.
 */

/**
 * Returns `true` if the text contains `//` or `/*` outside of JSON strings.
 * Useful as a cheap pre-check before calling `stripJsonComments()`.
 */
export function hasJsonComments(text: string): boolean {
    let inString = false;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];

        if (inString) {
            if (ch === '\\') {
                i++; // skip escaped character
            } else if (ch === '"') {
                inString = false;
            }
            continue;
        }

        if (ch === '"') {
            inString = true;
            continue;
        }

        if (ch === '/' && i + 1 < text.length) {
            const next = text[i + 1];
            if (next === '/' || next === '*') {
                return true;
            }
        }
    }
    return false;
}

/**
 * Strip all JavaScript-style comments (`//` and `/* … *​/`) from JSONC text.
 *
 * Block comments are replaced with equivalent whitespace to preserve
 * line/column positions (useful for debugging).  Single-line comments
 * are removed up to (but not including) the newline.
 *
 * The function also handles trailing commas before `]` or `}` which are
 * common in hand-edited JSONC but invalid in strict JSON.
 */
export function stripJsonComments(text: string): string {
    const result: string[] = [];
    let i = 0;
    let inString = false;

    while (i < text.length) {
        const ch = text[i];

        // ── Inside a JSON string ──────────────────────────────────
        if (inString) {
            result.push(ch);
            if (ch === '\\') {
                // Push escaped char too
                if (i + 1 < text.length) {
                    result.push(text[i + 1]);
                    i += 2;
                } else {
                    i++;
                }
            } else if (ch === '"') {
                inString = false;
                i++;
            } else {
                i++;
            }
            continue;
        }

        // ── Start of a JSON string ────────────────────────────────
        if (ch === '"') {
            inString = true;
            result.push(ch);
            i++;
            continue;
        }

        // ── Single-line comment: // ───────────────────────────────
        if (ch === '/' && i + 1 < text.length && text[i + 1] === '/') {
            // Skip to end of line (but keep the newline itself)
            i += 2;
            while (i < text.length && text[i] !== '\n' && text[i] !== '\r') {
                i++;
            }
            continue;
        }

        // ── Block comment: /* ... */ ──────────────────────────────
        if (ch === '/' && i + 1 < text.length && text[i + 1] === '*') {
            i += 2;
            while (i < text.length) {
                if (text[i] === '*' && i + 1 < text.length && text[i + 1] === '/') {
                    i += 2;
                    break;
                }
                // Preserve newlines so line numbers stay the same
                if (text[i] === '\n' || text[i] === '\r') {
                    result.push(text[i]);
                }
                i++;
            }
            continue;
        }

        // ── Normal character ──────────────────────────────────────
        result.push(ch);
        i++;
    }

    // Clean up trailing commas before ] or } (common in JSONC)
    let cleaned = result.join('');
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

    return cleaned;
}
