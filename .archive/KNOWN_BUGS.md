# Known Bugs and Issues

**Status:** Tracking bugs for future fix pass  
**Last Updated:** 2025-11-05

---

## Active Bugs

*None - All bugs fixed!*

---

## Fixed Bugs

### ✅ Bug #1: Color downgrade quantization error (FIXED)
**Module:** `color`
**File:** `src/color.ts`
**Test:** `tests/color.test.ts > test_downgrade`
**Fixed:** 2025-11-05

**Description:**
When downgrading a truecolor RGB value to 8-bit color space, the quantization algorithm selected the wrong nearest color.

**Root Cause:**
TypeScript implementation was using palette matching instead of Python's direct RGB-to-cube calculation algorithm. Additionally, STANDARD_PALETTE had incorrect RGB values and getTruecolor() was using the wrong palette.

**Fix:**
1. Implemented `rgbToHls()` helper function to convert RGB to HLS (Hue, Lightness, Saturation)
2. Updated downgrade algorithm to use Python's exact 6x6x6 color cube formula
3. Corrected STANDARD_PALETTE RGB values to match Python's palette
4. Created separate DEFAULT_TERMINAL_THEME_ANSI_COLORS palette for getTruecolor()

**Result:** All 16 color tests now passing ✅

---

### ✅ Bug #2: Segment emoji split UTF-16 handling (FIXED)
**Module:** `segment`
**File:** `src/segment.ts`
**Test:** `tests/segment.test.ts > test_split_cells_emoji`, `test_divide_emoji`
**Fixed:** 2025-11-05

**Description:**
When splitting a segment that cuts through a double-width emoji character, the replacement spaces contained UTF-16 replacement characters (�) instead of proper spaces.

**Root Cause:**
JavaScript strings use UTF-16 encoding where emoji are stored as surrogate pairs (2 code units). Accessing `text[pos]` for an emoji returns half of the surrogate pair, resulting in the replacement character �.

**Fix:**
Updated `_splitCells()` method to use `Array.from(text)` to convert the string into an array of proper Unicode characters. This ensures emoji (surrogate pairs) are treated as single characters throughout the splitting algorithm.

**Result:** All 29 segment tests now passing (1 skipped) ✅

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

