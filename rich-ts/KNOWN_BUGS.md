# Known Bugs and Issues

**Status:** Tracking bugs for future fix pass  
**Last Updated:** 2025-11-05

---

## Active Bugs

### 🐛 Bug #1: Color downgrade quantization error
**Module:** `color`  
**File:** `src/color.ts`  
**Test:** `tests/color.test.ts > test_downgrade`  
**Severity:** Low (1 test failing out of 39)

**Description:**  
When downgrading a truecolor RGB value to 8-bit color space, the quantization algorithm selects the wrong nearest color.

**Expected:**
```typescript
Color.parse('#ff0000').downgrade(ColorSystem.EIGHT_BIT)
// Should return: Color { number: 196, ... }
```

**Actual:**
```typescript
// Returns: Color { number: 9, ... }
```

**Impact:**  
Colors may not display correctly when terminal only supports 256-color mode.

**Notes:**  
The algorithm needs to properly convert RGB(255,0,0) to the nearest 256-color palette index. Python implementation returns 196, TypeScript returns 9.

**Priority:** Medium (affects color accuracy but not functionality)

---

### 🐛 Bug #2: Segment emoji split UTF-16 handling
**Module:** `segment`
**File:** `src/segment.ts`
**Test:** `tests/segment.test.ts > test_split_cells_emoji`
**Severity:** Low (2 test cases failing out of 95)

**Description:**
When splitting a segment that cuts through a double-width emoji character, the replacement spaces contain UTF-16 replacement characters (�) instead of proper spaces.

**Expected:**
```typescript
new Segment('💩').splitCells(1)
// Should return: [Segment(' '), Segment(' ')]
```

**Actual:**
```typescript
// Returns: [Segment('�'), Segment('�')]
```

**Impact:**
Emoji characters may display incorrectly when split at cell boundaries.

**Notes:**
This is related to UTF-16 surrogate pair handling in JavaScript/TypeScript. The slice operation may be breaking surrogate pairs. The Python implementation uses different string handling.

**Priority:** Low (edge case with emoji splitting)

---

## Fixed Bugs

*None yet*

---

## Bug Triage Guidelines

**Severity Levels:**
- **Critical:** Crashes, data loss, security issues
- **High:** Major functionality broken, many tests failing
- **Medium:** Incorrect behavior, minor functionality issues
- **Low:** Edge cases, cosmetic issues

**When to do bug pass:**
- 5+ bugs accumulated
- Critical/High severity bug found
- End of major phase (e.g., after Phase 4)
- Before release

