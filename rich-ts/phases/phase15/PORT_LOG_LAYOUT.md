# Module Port Log: layout

**Status:** NOT_STARTED  
**Dependencies:** console ✅, region ✅ (Phase 10), segment ✅, abc ✅ (Phase 10)  
**Python Source:** `rich/layout.py` (~442 LOC)  
**Python Tests:** `tests/test_layout.py` (~15 tests)

---

## Module Overview
Layout engine for complex screen layouts.

**Purpose:** Layout class enables splitting the screen into regions that can be updated independently. Think tmux-style panes with programmable splits.

**Key Features:**
- Layout class for hierarchical screen division
- Split horizontally or vertically
- Proportional sizing with ratios
- Named regions for direct access
- Update regions independently
- Recursive split tree structure
- Minimum size constraints
- Render to specific regions
- Uses Region for bounds tracking

---

## Test Port Progress

**Total Tests:** ~15

- [ ] test_layout_create
- [ ] test_layout_split
- [ ] test_layout_split_row
- [ ] test_layout_split_column
- [ ] test_layout_ratios
- [ ] test_layout_update
- [ ] test_layout_named_regions
- [ ] test_layout_render
- [ ] test_layout_measure
- [ ] test_layout_minimum_size
- [ ] test_layout_nested_splits
- [ ] Other layout tests

---

## Implementation Progress

- [ ] Layout class
- [ ] Split tree structure (nodes can be splits or content)
- [ ] split() method (horizontal/vertical with ratios)
- [ ] update() method to change region content
- [ ] Named region access
- [ ] Recursive rendering
- [ ] Size calculation with ratios
- [ ] Minimum size enforcement
- [ ] __richConsole__ implementation
- [ ] __richMeasure__ implementation
- [ ] All tests passing

---

## Design Decisions

*No decisions yet - module not started*

**Key Design:**
- Tree structure: each node is either a split or a renderable
- Splits have children with ratio weights
- Size calculation propagates through tree
- Region bounds calculated recursively
- Named regions stored in map for quick access

**Considerations:**
- Split direction: horizontal (rows) vs vertical (columns)
- Ratio handling (distribute available space)
- What happens when content exceeds region size?
- Minimum size handling (skip or compress?)

---

## Blockers

**NONE** - All dependencies complete from Phases 1-12

Can be done in PARALLEL with all other Phase 15 modules

---

## Next Steps

1. **VERIFY** Phase 14 complete
2. Read Python source: `rich/layout.py` (442 LOC)
3. Read Python tests: `tests/test_layout.py`
4. Create `rich-ts/tests/layout.test.ts`
5. Port all tests to TypeScript/Vitest
6. Run tests: `npm test layout -- --run` (should fail)
7. Create `rich-ts/src/layout.ts`
8. Implement Layout class
9. Implement split tree structure
10. Implement split() method
11. Implement size calculation with ratios
12. Implement region rendering
13. Implement named region access
14. Continue until all tests pass
15. Run `npm run check`
16. Commit and push
17. Update this log to DONE

---

## Session Notes

*No sessions yet*

---

## Notes

**COMPLEXITY:** Medium-high (recursive tree, size calculations)

**TIME:** 1.5-2 hours

**VISUAL:** Layout rendering is important - test with examples!

