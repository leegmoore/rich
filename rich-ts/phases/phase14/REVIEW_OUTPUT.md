# Phase 14 Code Review - Advanced Components

**Reviewer:** Codex  
**Date:** November 10, 2025  
**Modules Reviewed:** tree, syntax, markdown, json, live, status

---

## Executive Summary

**Overall Assessment:** REVISIT  
**Grade:** B-

**Quick Stats:**
- Modules complete: 6/6
- Targeted tests: 7 files, 30 tests passed (2 skipped)
- `npm run check`: ✅ prettier, ✅ `tsc --noEmit`, ✅ eslint (legacy warnings only), ✅ full Vitest (45 files)
- Critical issues: 0
- High issues: 3
- Medium issues: 3

**Recommendation:** Hold merge until the blocking items below are resolved.

---

## Test & Quality Results

```
$ cd rich-ts
$ npm test tree syntax markdown json live status -- --run
# 7 spec files, 30 tests passed (2 skipped)

$ npm run check
# prettier ✔ | tsc --noEmit ✔ | eslint ✔ (existing non-null warnings) | vitest ✔ (45 files)
```

Lint still surfaces the long-standing `@typescript-eslint/no-non-null-assertion` warnings in unrelated modules; no new diagnostics were introduced by Phase 14.

---

## Issues Found

1. **Tree guide prefixes never clear for wrapped labels (High)**  
   Multi-line or wrapped node labels keep printing the branch glyph (`└──`, `├──`) on every continuation line because `prefixSegments` is cloned via `levels.slice(...)` and subsequent updates (intended to swap `END` for `SPACE`/`CONTINUE`) only mutate the copy, not the `levels` stack that is reused on the next line. For example, `tree.add('foo\nbar')` currently renders both `foo` and `bar` with `└──`, whereas Rich renders `└── foo` followed by an indented `    bar`. Update the underlying `levels` entry (or rebuild `prefixSegments` after mutating `levels`) so the guide switches to spaces/verticals after the first line. (`rich-ts/src/tree.ts:126`)

2. **Syntax `lineRange` outputs the wrong lines (High)**  
   `getSyntax` already filters by calling `this.highlight(processedCode, this.lineRange)` (line 217), but it then slices the resulting `Text` again using the same `lineRange` (lines 228‑239). That double application means a range such as `[5, 7]` returns only the last line—or nothing at all—because the previously trimmed text is sliced a second time starting at index `start-1`. Drop the second slice (or pass `undefined` into `highlight`) so the range logic runs exactly once. (`rich-ts/src/syntax.ts:217`, `rich-ts/src/syntax.ts:228`)

3. **Syntax `indentGuides` flag is a no-op (Medium)**  
   The option is exposed in `SyntaxOptions`, stored on the instance, and called out in the checklist, but the value is never read after construction. Setting `indentGuides: true` therefore has zero effect, so Rich’s vertical indentation guides are completely missing in the port. Either implement the guide overlay (matching `rich/syntax.py`) or remove the option to avoid silent failures. (`rich-ts/src/syntax.ts:51`, `rich-ts/src/syntax.ts:79`, `rich-ts/src/syntax.ts:97`)

4. **Markdown hyperlinks never become actual links (High)**  
   When `hyperlinks` is `true`, the inline renderer appends literal ` ([markdown.link_url]URL[/])` text (lines 272‑281) but never applies a `Style` with a `link` attribute to the anchor text. In Rich, `hyperlinks=True` emits clickable OSC-8 hyperlinks and the `(URL)` fallback is used only when hyperlinks are disabled. The current implementation both inverts the semantics and drops hyperlink metadata entirely, so supporting terminals never receive hyperlinks. Mirror `rich/markdown.py` by styling the span with `link=href` when enabled and only appending the textual URL when hyperlinks are off. (`rich-ts/src/markdown.ts:272`)

5. **Markdown lists drop nested content and secondary blocks (Medium)**  
   `renderList` grabs only the first child paragraph from each `list_item` and ignores the rest of the subtree. Any nested lists, code blocks, tables, or block quotes that appear inside a list item silently disappear from the rendered output. Rich renders each child node in order, so the TypeScript port should iterate over all children (recursively calling `renderNode`) rather than flattening to a single `Text`. (`rich-ts/src/markdown.ts:183`)

6. **Markdown parser omits Rich’s default extensions (Medium)**  
   Python enables the `strikethrough` and `table` rules on `MarkdownIt`, but the port instantiates the parser with defaults and never enables those features. Pipe tables and `~~strike~~` markup are therefore emitted verbatim instead of being formatted. Configure `MarkdownIt` with the same extensions Rich enables (at minimum `
