# Module Port Log: ansi

**Status:** NOT_STARTED  
**Dependencies:** color ✅, style ✅, text ✅, terminal_theme (Phase 11 - must be complete!)  
**Python Source:** `rich/ansi.py` (~241 LOC)  
**Python Tests:** `tests/test_ansi.py` (~20 tests)

---

## Module Overview
ANSI escape sequence decoder - **CRITICAL MODULE!**

**Purpose:** Decode ANSI escape sequences from terminal output into Rich Text objects with proper styling.

**Key Features:**
- AnsiDecoder class for parsing ANSI sequences
- SGR code parsing (Select Graphic Rendition)
- Color code decoding (16/256/truecolor)
- State machine for sequence parsing
- Text.fromAnsi() implementation support
- **UNBLOCKS 34 SKIPPED TEXT TESTS!**

---

## Test Port Progress

**Total Tests:** ~20

- [ ] test_decode_basic
- [ ] test_decode_color_codes
- [ ] test_decode_sgr_codes
- [ ] test_decode_style_attributes
- [ ] test_decode_reset
- [ ] test_decode_multiple_sequences
- [ ] test_decode_nested_styles
- [ ] test_from_ansi (Text integration)
- [ ] test_ansi_color_16
- [ ] test_ansi_color_256
- [ ] test_ansi_truecolor
- [ ] Other ansi tests

---

## Implementation Progress

- [ ] AnsiDecoder class
- [ ] SGR code parser (escape sequence regex)
- [ ] State machine for tracking current style
- [ ] Color code decoder (16/256/truecolor using terminal_theme)
- [ ] Style attribute mapping (bold, italic, etc.)
- [ ] Text.fromAnsi() integration in text.ts
- [ ] All tests passing
- [ ] **34 text tests now UN-SKIPPED**

---

## Design Decisions

*No decisions yet - module not started*

**Key Algorithms:**
- Parse `\x1b[...m` escape sequences
- SGR codes: 0-9 (reset, bold, dim, italic, etc.)
- Color codes: 30-37 (foreground), 40-47 (background)
- 256-color: `\x1b[38;5;NNN m` (foreground), `\x1b[48;5;NNN m` (background)
- Truecolor: `\x1b[38;2;R;G;B m`, `\x1b[48;2;R;G;B m`

---

## Blockers

**BLOCKS ON:** terminal_theme module (Phase 11 - must complete first!)

**DO NOT START** until Phase 11 is COMPLETE!

---

## Next Steps

1. **VERIFY** Phase 11 complete (terminal_theme.ts exists and works)
2. Read Python source: `rich/ansi.py` (carefully - complex parsing!)
3. Read Python tests: `tests/test_ansi.py`
4. Create `rich-ts/tests/ansi.test.ts`
5. Port all tests to TypeScript/Vitest
6. Run tests: `npm test ansi -- --run` (should fail)
7. Create `rich-ts/src/ansi.ts`
8. Implement AnsiDecoder class:
   - SGR sequence regex
   - State machine for current style
   - Color decoding with terminal_theme
   - Style attribute mapping
9. Update `rich-ts/src/text.ts` - implement fromAnsi() method
10. Continue until all tests pass
11. **RUN:** `npm test text -- --run` - verify 34 tests UN-SKIP!
12. Run `npm run check`
13. Commit and push
14. Update this log to DONE

---

## Session Notes

*No sessions yet*

---

## Notes

**CRITICAL MODULE:** This is one of the most important ports!

**After this module:**
- Text.fromAnsi() works
- 34 text tests should un-skip
- Terminal output can be converted to Rich Text
- Major functionality unlocked

**Complexity:** Medium-high (parsing, state machine, color mapping)

**Expected Time:** 1.5-2 hours

**Verify After:** Run `npm test text -- --run` and confirm skipped tests are now running!

