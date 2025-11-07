===== CODE REVIEW PROMPT: UTILITIES & HELPERS =====

**Review Group:** 7 - Utilities & Helpers  
**Wave:** 1 (can run in parallel with Groups 2 and 3)  
**Output File:** `review/wave1/group7_utilities_OUTPUT.md`

---

## 🎯 YOUR MISSION

You are a senior TypeScript engineer reviewing utility modules and helper functions.

**Your Task:** Review 7 small utility modules (~500 LOC total)

**Focus Areas:**
- Algorithm correctness (ratio math, loop logic)
- Type safety and validation
- Error handling
- Edge case coverage

**Note:** These are mostly simple, standalone utilities - quick wins!

---

## 📋 SETUP INSTRUCTIONS

### 1. Repository Context
- **Repo root:** `/Users/leemoore/code/rich-port/rich/`
- **Python source:** `rich/` directory
- **TypeScript port:** `rich-ts/src/` directory

### 2. Read Context Files
- Read `review/PROJECT_OVERVIEW.md`
- Read `review/REVIEW_CHECKLIST.md`

### 3. Run Tests
```bash
cd rich-ts
npm test errors
npm test repr
# Others tested indirectly
```

---

## 📦 MODULES TO REVIEW

### Module 1: _loop.ts (77 LOC)
**Python Source:** `rich/_loop.py`  
**Purpose:** Iterator utilities for first/last detection

**Functions:**
- `loopFirst(values)` - Yield [isFirst, value] tuples
- `loopLast(values)` - Yield [isLast, value] tuples

**Review Focus:**
- Generator correctness
- Edge cases: empty iterables, single item
- Type safety with generics

---

### Module 2: _pick.ts (24 LOC)
**Python Source:** `rich/_pick.py`  
**Purpose:** Pick first defined boolean value

**Functions:**
- `pickBool(...values)` - Return first non-undefined boolean

**Review Focus:**
- Logic correctness
- undefined vs false handling
- Default return value

---

### Module 3: _ratio.ts (94 LOC)
**Python Source:** `rich/_ratio.py`  
**Purpose:** Distribute widths using ratios and minimums

**Functions:**
- `ratioDistribute(total, ratios, minimums)` - Distribute total across ratios
- `ratioReduce(total, ratios, maximums, values)` - Reduce to fit constraints

**Review Focus:**
- Math correctness (ratio calculations)
- Rounding behavior
- Edge cases: zero total, negative values, empty arrays
- Minimum/maximum constraint handling

**Critical:** This is used by Table for column widths - must be accurate!

---

### Module 4: repr.ts (312 LOC)
**Python Source:** `rich/repr.py`  
**Tests:** `tests/repr.test.ts` (8 tests)  
**Purpose:** Rich repr protocol for object representation

**Functions:**
- `install()` - Patch Object.prototype (monkey patching)
- `richRepr()` - Call __richRepr__ if available
- `traverseGetItem()` - Get nested attributes
- `resolveClass()` - Get constructor name

**Review Focus:**
- Prototype patching safety
- Type safety with dynamic attribute access
- Error handling for missing attributes
- Edge cases: null, primitives, circular refs

---

### Module 5: protocol.ts (19 LOC)
**Python Source:** Not direct - protocol helper  
**Purpose:** Type checking for renderables

**Functions:**
- `isRenderable(obj)` - Check if object can be rendered

**Review Focus:**
- Type guard correctness
- Protocol detection logic
- Edge cases: null, primitives, partial implementations

---

### Module 6: errors.ts (98 LOC)
**Python Source:** `rich/errors.py`  
**Tests:** `tests/errors.test.ts` (12 tests)  
**Purpose:** Custom exception classes

**Classes:**
- `ConsoleError` - Console-related errors
- `StyleError` - Style parsing errors
- `StyleSyntaxError` - Style syntax errors
- `MissingStyle` - Style not found
- `MarkupError` - Markup syntax errors
- `NotRenderableError` - Object cannot be rendered
- `LiveError` - Live display errors

**Review Focus:**
- Proper Error inheritance
- Message quality
- Constructor parameters
- Test coverage

---

### Module 7: themes.ts (8 LOC)
**Python Source:** `rich/themes.py`  
**Purpose:** Export DEFAULT theme

**Review Focus:**
- Correct theme export
- Proper imports
- Nothing fancy - just validation

---

## 🎯 REVIEW EXECUTION

### Timeline
1. Read Python sources (20 min)
2. Review all 7 modules (60 min)
3. Run tests (10 min)
4. Document findings (40 min)

**Total: 2 hours**

---

## 📝 OUTPUT

Write comprehensive review to: **`review/wave1/group7_utilities_OUTPUT.md`**

Use the standard format template.

---

## ⚠️ IMPORTANT NOTES

1. **_ratio.ts is Critical:** Used by Table for column widths - math must be perfect
2. **repr.ts Monkey Patching:** Verify this is safe and doesn't leak
3. **Simple but Important:** These utilities are used everywhere
4. **Quick Review:** These are straightforward - don't overthink

---

## 🚀 START REVIEW!

These are quick wins - validate correctness and move on! 🔍

