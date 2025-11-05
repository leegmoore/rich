# Module Port Log: cells

**Status:** NOT_STARTED  
**Dependencies:** None (uses Unicode width tables)  
**Python Source:** `rich/cells.py` (~200 LOC)  
**Python Tests:** `tests/test_cells.py` (8 tests)

---

## Module Overview
Character cell width calculations for terminal display. Handles wide characters (CJK, emoji).

**Purpose:** Calculate how many terminal cells a character/string occupies.

**Key Functions:**
- `cellLen(text)` - total cell width of string
- `getCharacterCellSize(char)` - width of single character (1 or 2)
- `setCellSize(char, size)` - override width
- `chop_cells(text, max_width)` - truncate to fit width

---

## Test Port Progress

**Total Tests:** 8

- [ ] `test_cell_len` - Basic string width
- [ ] `test_cell_len_wide` - Wide character (emoji, CJK)
- [ ] `test_set_cell_size` - Override character width
- [ ] `test_get_character_cell_size` - Single character width
- [ ] `test_chop_cells` - Truncate to max width
- [ ] Other cell-related tests

---

## Implementation Progress

- [ ] TypeScript module structure
- [ ] Unicode width tables (may need to copy from Python)
- [ ] `cellLen()` function
- [ ] `getCharacterCellSize()` function
- [ ] `setCellSize()` function
- [ ] `chopCells()` function
- [ ] Caching/memoization for performance
- [ ] All tests passing

---

## Design Decisions

*No decisions yet - module not started*

---

## Blockers

*None - no dependencies*

**Note:** May need to copy/convert Unicode width data tables from Python.

---

## Next Steps

1. Read Python test file: `tests/test_cells.py`
2. Create `rich-ts/tests/cells.test.ts`
3. Port all tests to TypeScript/Vitest
4. Run tests from rich-ts/: `npm test` (should fail)
5. Read Python implementation: `rich/cells.py`
6. Create `rich-ts/src/cells.ts`
7. Copy/convert Unicode width tables from `rich/_cell_widths.py`
8. Implement functions until tests pass
9. Update this log

---

## Session Notes

*No sessions yet*

