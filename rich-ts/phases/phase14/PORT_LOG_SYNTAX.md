# Module Port Log: syntax

**Status:** NOT_STARTED  
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

**Total Tests:** ~60

- [ ] test_syntax_create
- [ ] test_syntax_from_path
- [ ] test_syntax_guess_lexer
- [ ] test_syntax_render
- [ ] test_syntax_line_numbers
- [ ] test_syntax_highlight
- [ ] test_syntax_themes
- [ ] test_syntax_indent_guides
- [ ] test_syntax_range
- [ ] test_syntax_languages (many languages)
- [ ] Many more syntax tests

---

## Implementation Progress

- [ ] Syntax class
- [ ] Language detection
- [ ] Lexer integration (needs npm package or basic implementation)
- [ ] Line numbering
- [ ] Theme application
- [ ] fromPath() static method
- [ ] Highlight line ranges
- [ ] Indent guide rendering
- [ ] __richConsole__ implementation
- [ ] __richMeasure__ implementation
- [ ] All tests passing

---

## Design Decisions

*No decisions yet - module not started*

**CRITICAL DECISION:** Lexer library

**Option A:** Use npm package (e.g., `shiki`, `prism`, `highlight.js`)
- Pros: Full language support, maintained
- Cons: External dependency

**Option B:** Basic lexer implementation
- Pros: No external dependency
- Cons: Limited language support, more work

**Option C:** Stub for now, implement later
- Pros: Unblocks other work
- Cons: Incomplete feature

**Recommendation:** Check if Python pygments is required or optional. If optional, start with basic implementation for common languages (Python, JS, TS, JSON).

---

## Blockers

**NONE** - All dependencies complete

**DECISION NEEDED:** Lexer approach

Can be done in PARALLEL with tree, markdown, json

---

## Next Steps

1. **VERIFY** Phase 13 complete
2. Read Python source: `rich/syntax.py` (LARGE - 985 LOC!)
3. **CHECK:** How does Python handle lexing? (pygments library)
4. **DECIDE:** Lexer strategy (npm package vs basic impl vs stub)
5. Read Python tests: `tests/test_syntax.py` (60 tests)
6. Create `rich-ts/tests/syntax.test.ts`
7. Port tests to TypeScript/Vitest
8. Run tests: `npm test syntax -- --run` (should fail)
9. Create `rich-ts/src/syntax.ts`
10. Implement Syntax class
11. Implement/integrate lexer
12. Implement line numbers, themes, highlighting
13. Continue until tests pass
14. Run `npm run check`
15. Commit and push
16. Update this log to DONE

---

## Session Notes

*No sessions yet*

---

## Notes

**LARGEST MODULE in Phase 14** - 985 LOC, 60 tests

**COMPLEXITY:** High (lexing, themes, language support)

**TIME:** 3-4 hours

**EXTERNAL DEPENDENCY:** May need npm package for lexing - document choice!

**ALTERNATIVE:** Can be deferred to later if blocking Phase 14

