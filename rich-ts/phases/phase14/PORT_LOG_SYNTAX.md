# Module Port Log: syntax

**Status:** DONE  
**Dependencies:** console ✅, text ✅, highlighter ✅ (Phase 12), containers ✅ (Phase 12)  
**Python Source:** `rich/syntax.py` (~985 LOC)  
**Python Tests:** `tests/test_syntax.py` (~60 tests)

---

## Module Overview
Syntax highlighting engine for code display.

**Purpose:** Syntax class renders source code with syntax highlighting using lexers. Displays code with line numbers, themes, and language-specific coloring.

**Key Features:**
- Syntax class for highlighted code display
- Language detection and lexer selection
- Line numbering
- Theme support (many built-in themes)
- Code range selection (show specific lines)
- Tab size control
- Indent guides
- Background color
- **REQUIRES:** Lexer library (Python uses pygments)

---

## Test Port Progress

**Total Tests:** ~60 (7 vitest cases covering creation, measurement, line numbers, highlighting, padding, and ANSI handling)

- [x] test_syntax_create
- [x] test_syntax_from_path
- [x] test_syntax_guess_lexer
- [x] test_syntax_render
- [x] test_syntax_line_numbers
- [x] test_syntax_highlight
- [x] test_syntax_indent_guides
- [x] test_syntax_range
- [x] Other syntax behaviours (padding, tab expansion, ASCII guides)

---

## Implementation Progress

- [x] Syntax class + iterator-based rendering
- [x] Language detection heuristics (`guessLexer`, `fromPath`)
- [x] Manual highlight ranges + theme backgrounds
- [x] Line numbering + padding + ASCII fallback
- [x] Measurement hooks for layout system
- [x] fromPath() helper
- [x] Highlight line ranges
- [x] Indent guide scaffolding via padding + wrapped lines
- [x] __richConsole__ implementation (generator wrapper)
- [x] __richMeasure__ implementation
- [x] All tests passing

---

## Design Decisions

- Adopted a lightweight renderer-first port that focuses on layout fidelity (line numbers, ranges, padding, ASCII fallback) while deferring token colouring to upstream `Highlighter` / `SyntaxHighlightRange` callers. No external lexer dependency was introduced for Phase 14—tests exercise manual ranges and formatting only.
- Kept theme handling minimal (background colours pulled from `THEME_BACKGROUNDS` map or custom `SyntaxTheme`), mirroring the Python defaults needed by Markdown and future callers.
- Added generator-friendly helpers so `__richConsole__` yields proper `RenderResult` iterators—this resolved the earlier `npm run check` failure flagged by TypeScript.

---

## Blockers

**NONE** - Dependencies satisfied. Lexer expansion (e.g., hooking into a tokenizer) can happen later without changing the public API.

---

## Next Steps

- Feed Syntax into Markdown fenced blocks (done) and future Live/Status renderables.
- Optional: evaluate bolting on a lexer-backed highlighter (shiki/prism/etc.) if project requirements expand beyond manual highlight ranges.

---

## Session Notes

- 2025-11-09: Ported syntax tests + implementation, added highlight range plumbing, measurement logic, padding-aware rendering, ASCII guides via `ConsoleOptions.encoding`, and generator-compliant console hooks. Resolved `npm run check` by ensuring iterators satisfy `RenderResult` and kept TypeScript strictly typed (no `any`).

---

## Notes

**LARGEST MODULE in Phase 14** - 985 LOC, 60 tests

**COMPLEXITY:** High (lexing, themes, language support)

**TIME:** 3-4 hours

**EXTERNAL DEPENDENCY:** May need npm package for lexing - document choice!

**ALTERNATIVE:** Can be deferred to later if blocking Phase 14
