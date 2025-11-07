===== CODE REVIEW PASS 1: TEXT & UNICODE PROCESSING =====

**Review Group:** 2 - Text Processing & Unicode  
**Wave:** 1 (can run in parallel with Groups 3 and 7)  
**Output File:** `review/wave1/group2_text_unicode_OUTPUT.md`  
**Pass:** 1 of 2 (Foundation Quality)

---

## 🎯 PASS 1 MISSION

You are a senior TypeScript engineer reviewing ported Python code.

**This Pass Focuses On:**
1. ✅ **Correctness** - Does the code do what it's supposed to do?
2. ✅ **Code Quality** - Is it readable, maintainable, well-documented?
3. ✅ **TypeScript Quality** - Are types strong, helpful, safe?
4. ✅ **API Usability** - Is the public API intuitive and well-designed?

**NOT in This Pass:** Performance, edge cases, hardening (that's Pass 2)

**Your Task:** Review 4 modules related to text processing and Unicode (~2,300 LOC)

**Focus Areas:**
- Algorithm correctness vs Python source
- Code clarity and documentation
- Type safety and type design
- Public API design

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

## 🎯 PASS 1 REVIEW DIMENSIONS

### 1. Correctness (Primary Focus)
**Question:** Does this code implement the Python behavior correctly?

**Check:**
- [ ] Algorithm matches Python logic
- [ ] Function signatures match Python API
- [ ] Return values match expected types
- [ ] Control flow handles all branches from Python

**For Each Module:**
- Read Python source side-by-side with TypeScript
- Trace through key functions
- Verify test coverage matches Python tests

**Grade Impact:** 40% of module score

---

### 2. Code Quality (Maintainability)
**Question:** Can another developer understand and modify this code?

**Check:**
- [ ] Variable names are clear (no `txt`, `clr`, `seg` abbreviations)
- [ ] Functions are focused (single responsibility)
- [ ] Complex logic has explanatory comments
- [ ] File structure is logical
- [ ] No dead code or commented-out sections

**Grade Impact:** 25% of module score

---

### 3. TypeScript Quality (Type Safety)
**Question:** Do the types help or hurt? Are they safe?

**Check:**
- [ ] No `any` without explicit eslint-disable and justification
- [ ] Public APIs have strong types
- [ ] Return types are explicit
- [ ] Generics used appropriately
- [ ] Union types handled safely
- [ ] No excessive type assertions (`as`)

**Grade Impact:** 25% of module score

---

### 4. API Usability (Developer Experience)
**Question:** Is this pleasant to use?

**Check:**
- [ ] Public methods have JSDoc with examples
- [ ] Parameters are well-named and typed
- [ ] Error messages are helpful
- [ ] API is intuitive (follows conventions)
- [ ] No surprising behavior

**Grade Impact:** 10% of module score

---

## 📝 PASS 1 OUTPUT FORMAT

Write to: **`review/wave1/group2_text_unicode_OUTPUT.md`**

### Section 1: Executive Summary
```markdown
## PASS 1: Foundation Quality Review

**Overall Grade:** [A-F]
**Recommendation:** [Approve / Minor fixes / Needs work]

**Quick Stats:**
- Correctness: [Grade] - [1-2 sentence assessment]
- Code Quality: [Grade] - [1-2 sentence assessment]
- TypeScript Quality: [Grade] - [1-2 sentence assessment]
- API Usability: [Grade] - [1-2 sentence assessment]

**Top 3 Issues:**
1. [Most important finding]
2. [Second most important]
3. [Third most important]
```

### Section 2: Issues by Severity
```markdown
## Issues Found (Pass 1)

### Critical Issues (Will Break)
[Only include issues that will cause actual failures]

### High Priority (Should Fix)
[Issues that impact usability or correctness in edge cases]

### Medium Priority (Nice to Fix)
[Code quality, clarity, type improvements]

### Low Priority (Polish)
[Naming, comments, minor refactoring]
```

### Section 3: Module Grades
```markdown
## Module-by-Module Assessment

### cells.ts
**Grade:** [A-F]
- Correctness: [comment]
- Code Quality: [comment]
- TypeScript: [comment]
- API: [comment]
- **Key Issues:** [list 1-3]

### text.ts
**Grade:** [A-F]
[Same format]

[etc...]
```

### Section 4: Recommendations
```markdown
## Pass 1 Recommendations

### Must Fix Before Pass 2
[Issues that would affect Pass 2 review]

### Should Consider
[Nice-to-have improvements]

### Strengths to Preserve
[What's working really well]
```

---

## ⏱️ PASS 1 TIMELINE

1. **Read Python source** (30 min) - Understand intent
2. **Review for correctness** (60 min) - Compare implementations
3. **Review code quality** (30 min) - Readability, clarity
4. **Review types & API** (30 min) - Type safety, usability
5. **Run tests** (10 min) - Verify behavior
6. **Document findings** (30 min) - Write output

**Total: 3 hours for Pass 1**

---

## 🚀 READY TO START PASS 1?

**Remember:** This pass is about FOUNDATION QUALITY
- Is the code correct?
- Is it well-written?
- Are types safe?
- Is the API good?

**NOT about:** Performance, edge cases, hardening (that's Pass 2!)

1. Read context files
2. Review each module against the 4 dimensions
3. Document in OUTPUT file
4. **STOP** - Wait for Pass 2 prompt

**GO!** 🔍

