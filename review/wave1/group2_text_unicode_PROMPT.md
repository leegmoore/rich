===== CODE REVIEW PROMPT: TEXT & UNICODE PROCESSING =====

**Review Group:** 2 - Text Processing & Unicode  
**Wave:** 1 (can run in parallel with Groups 3 and 7)  
**Output File:** `review/wave1/group2_text_unicode_OUTPUT.md`

---

## 🎯 YOUR MISSION

You are a senior TypeScript engineer reviewing ported Python code for correctness, type safety, and quality.

**Your Task:** Review 4 modules related to text processing and Unicode handling (~2,300 LOC)

**Focus Areas:**
- Unicode character width calculations
- Text wrapping algorithms
- Span management (style ranges)
- Edge cases: emoji, surrogate pairs, zero-width characters
- Performance: caching, binary search optimization

---

## 📋 SETUP INSTRUCTIONS

### 1. Repository Context
- **Repo root:** `/Users/leemoore/code/rich-port/rich/`
- **Python source:** `rich/` directory
- **TypeScript port:** `rich-ts/src/` directory
- **Tests:** `rich-ts/tests/` directory

### 2. Read Context Files
- Read `review/PROJECT_OVERVIEW.md` (5 min)
- Read `review/REVIEW_CHECKLIST.md` (5 min)

### 3. Run Tests for Your Modules
```bash
cd rich-ts
npm test cells
npm test text
```

Verify all tests pass before starting review.

---

## 📦 MODULES TO REVIEW

### Module 1: cells.ts (234 LOC)
**Python Source:** `rich/cells.py`  
**Tests:** `tests/cells.test.ts` (8 tests)  
**Purpose:** Calculate cell widths for Unicode characters

**Key Functions:**
- `cellLen(text)` - Calculate total cell width
- `setCellSize(text, total)` - Adjust text to fit cell count
- `getCharacterCellSize(char)` - Get width of single character (1 or 2)
- `chopCells(text, width)` - Split text into lines of given width

**Review Focus:**
1. **Unicode Accuracy:**
   - Verify CELL_WIDTHS table usage
   - Check East Asian character handling (should be width 2)
   - Verify emoji handling (should be width 2)
   - Zero-width character handling

2. **Binary Search in setCellSize:**
   - Algorithm correctness
   - Edge case: text shorter than target
   - Edge case: first character > target width
   - Edge case: double-width character at boundary
   - Infinite loop protection (line 165-194)

3. **Performance:**
   - Caching (cachedCellLen)
   - isSingleCellWidths optimization
   - Binary search vs linear search

4. **Edge Cases:**
   - Empty strings
   - Single character strings
   - Mixed single/double width
   - Emoji with modifiers

**Critical Areas:**
- Lines 137-194: `setCellSize()` binary search
- Lines 203-225: `chopCells()` word wrapping
- Lines 51-64: `cellLen()` caching logic

---

### Module 2: cell_widths.ts (454 LOC)
**Python Source:** `rich/cell_widths.py`  
**Tests:** Indirectly tested via cells.test.ts  
**Purpose:** Unicode width lookup table

**Review Focus:**
1. **Data Validation:**
   - Table format: `[number, number, number][]`
   - Binary search requirements (sorted order)
   - Coverage of Unicode ranges

2. **Correctness:**
   - Spot check: Some known characters
   - Verify ranges don't overlap
   - Check boundaries

**Note:** This is mostly data. Quick validation is sufficient.

**Critical Areas:**
- Data integrity (sorted, non-overlapping ranges)

---

### Module 3: text.ts (1,616 LOC) 🔥 LARGEST MODULE
**Python Source:** `rich/text.py`  
**Tests:** `tests/text.test.ts` (87 tests, 34 skipped)  
**Purpose:** Rich text with styles, wrapping, alignment, operations

**Key Classes/Functions:**
- `Span` class - Style span (start, end, style)
- `Text` class - Main text object with styled spans
- Text operations: append, split, join, truncate, pad, extend
- Text rendering: wrap, justify, align, overflow handling
- `fromMarkup()` - Parse markup to Text

**Review Focus:**
1. **Span Management:**
   - Span overlap handling
   - Span splitting on operations
   - Style merging and inheritance
   - Lines 100-200: Span utilities

2. **Text Operations:**
   - `append()` - Span offset calculation
   - `split()` - Span splitting at boundaries
   - `join()` - Span concatenation
   - `truncate()`, `pad()` - Width adjustments
   - Lines 400-800: Operations

3. **Wrapping & Justification:**
   - `wrap()` - Word wrapping algorithm
   - `justify()` - Text justification
   - `align()` - Horizontal alignment
   - Overflow handling (fold, crop, ellipsis)
   - Lines 800-1200: Layout logic

4. **Rendering Protocol:**
   - `__richConsole__()` - Render to segments
   - `render()` - Convert to Segment array
   - ANSI code generation
   - Lines 1400-1616: Rendering

**Critical Areas:**
- Lines 800-1000: Wrapping algorithm
- Lines 1100-1300: Overflow handling
- Lines 400-600: Span operations
- Lines 1400-1600: Rendering logic

**Known Complexity:**
- This is the LARGEST module
- Many interdependent methods
- Complex span tracking
- Performance-sensitive

---

### Module 4: _wrap.ts (82 LOC)
**Python Source:** `rich/_wrap.py`  
**Tests:** Indirectly tested via text.test.ts  
**Purpose:** Word wrapping utilities

**Key Functions:**
- `words(text)` - Extract words with positions
- `divide(text, width)` - Split text at width boundaries

**Review Focus:**
1. **Word Extraction:**
   - Whitespace handling
   - Position tracking
   - Unicode boundary awareness

2. **Division Logic:**
   - Width calculation accuracy
   - Boundary conditions
   - Empty string handling

**Critical Areas:**
- Lines 10-40: Word extraction logic
- Lines 50-82: Division algorithm

---

## 🎯 REVIEW EXECUTION

### Step 1: Read Python Source (30 min)
For each module, read the Python source to understand intent:
```bash
# From repo root:
cat rich/cells.py
cat rich/cell_widths.py
cat rich/text.py
cat rich/_wrap.py
```

### Step 2: Read TypeScript Implementation (60 min)
For each module, read the TypeScript carefully:
```bash
# From repo root:
cat rich-ts/src/cells.ts
cat rich-ts/src/cell_widths.ts
cat rich-ts/src/text.ts
cat rich-ts/src/_wrap.ts
```

### Step 3: Run Tests (10 min)
```bash
cd rich-ts
npm test cells -- --run
npm test text -- --run
```

### Step 4: Check Types & Lint (10 min)
```bash
cd rich-ts
npm run typecheck
npm run lint | grep -E "cells|text|_wrap"
```

### Step 5: Document Findings (60 min)
Write comprehensive review in `review/wave1/group2_text_unicode_OUTPUT.md`

**Total Time:** 2.5-3 hours

---

## 📝 OUTPUT FORMAT

Write your findings to: **`review/wave1/group2_text_unicode_OUTPUT.md`**

Use this structure:

```markdown
# Code Review: Text & Unicode Processing

**Reviewer:** [Your agent ID]
**Date:** [Date]
**Modules:** cells.ts, cell_widths.ts, text.ts, _wrap.ts
**Total LOC:** ~2,300

---

## Executive Summary

**Overall Grade:** [A-F]
**Issues Found:** [count] (Critical: X, High: Y, Medium: Z, Low: W)
**Recommendation:** [Approve / Approve with changes / Major revisions needed]

**Key Findings:**
- [3-5 bullet points of most important findings]

---

## Issues Found

[Use format from REVIEW_CHECKLIST.md for each issue]

### Critical Issues
[List all critical issues with full details]

### High Priority Issues
[List all high priority issues]

### Medium Priority Issues
[List all medium priority issues]

### Low Priority Issues
[List all low priority issues]

---

## Positive Findings

[List excellent patterns, clever solutions, well-implemented features]

---

## Module-by-Module Details

### cells.ts (Grade: [A-F])
[Detailed findings]

### cell_widths.ts (Grade: [A-F])
[Detailed findings]

### text.ts (Grade: [A-F])
[Detailed findings]

### _wrap.ts (Grade: [A-F])
[Detailed findings]

---

## Recommendations

### Immediate Actions
[Must-fix items]

### Suggested Improvements
[Nice-to-have improvements]

### Future Considerations
[Long-term suggestions]

---

## Test Coverage Assessment

[Comment on test quality and coverage]

---

## Performance Notes

[Any performance concerns or optimizations]
```

---

## ⚠️ IMPORTANT NOTES

1. **Be Thorough:** This is the Unicode/text foundation - errors here affect everything
2. **Check Algorithm Correctness:** Compare to Python source carefully
3. **Test Edge Cases:** Unicode is full of surprises
4. **Note Performance:** Text rendering is hot path
5. **text.ts is Huge:** This is 1,616 LOC - take your time

---

## 🚀 READY TO START?

1. Read context files (PROJECT_OVERVIEW.md, REVIEW_CHECKLIST.md)
2. Read Python source for all 4 modules
3. Review TypeScript implementations
4. Run tests
5. Document findings in OUTPUT file
6. Grade each module and provide overall assessment

**GO!** 🔍

