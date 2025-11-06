# Module Port Log: Stub Replacements

**Status:** NOT_STARTED  
**Priority:** MUST DO FIRST (replaces Phase 5 stubs)

---

## Stubs to Replace

### 1. ✅ theme + default_styles + themes
**Purpose:** Fix Phase 4 rule color test  
**Files:** `src/theme.ts`, `src/default_styles.ts`, `src/themes.ts`  
**Python Source:** `rich/theme.py` (115 LOC), `rich/default_styles.py` (193 LOC), `rich/themes.py` (5 LOC)  
**Python Tests:** `tests/test_theme.py` (~53 tests)  
**Total:** ~313 LOC, ~53 tests

**What to do:**
1. Port `tests/test_theme.py` to `tests/theme.test.ts`
2. Replace stub `src/default_styles.ts` with full 60+ style definitions
3. Replace stub `src/theme.ts` with full Theme class (with config file loading)
4. Replace stub `src/themes.ts` with DEFAULT export
5. Update `src/console.ts` to use theme.getStyle() properly
6. Verify Phase 4 rule test now passes

**Expected result:** `tests/rule.test.ts > test_rule` should now PASS (green colors)

---

### 2. ✅ constrain
**Purpose:** Unblock Phase 5 align tests  
**File:** `src/constrain.ts`  
**Python Source:** `rich/constrain.py` (~37 LOC)  
**Python Tests:** `tests/test_constrain.py` (~13 tests)  
**Total:** ~37 LOC, ~13 tests

**What to do:**
1. Port `tests/test_constrain.py` to `tests/constrain.test.ts`
2. Replace stub `src/constrain.ts` with full implementation
3. Implement proper width constraining with `update_width`
4. Verify Phase 5 align tests now pass

**Expected result:** All failing align tests should now PASS

---

### 3. ✅ box
**Purpose:** Unblock Phase 5 panel tests  
**File:** `src/box.ts`  
**Python Source:** `rich/box.py` (~474 LOC)  
**Python Tests:** `tests/test_box.py` (~105 tests)  
**Total:** ~474 LOC, ~105 tests

**What to do:**
1. Port `tests/test_box.py` to `tests/box.test.ts`
2. Replace stub `src/box.ts` with full Box class
3. Implement all box styles (ROUNDED, HEAVY, DOUBLE, ASCII, etc.)
4. Implement box parsing from string
5. Implement safe_box substitution
6. Verify Phase 5 panel tests now pass

**Expected result:** All failing panel tests should now PASS

---

### 4. ✅ emoji + _emoji_replace + _emoji_codes
**Purpose:** Unblock Phase 5 markup tests  
**Files:** `src/emoji.ts`, `src/_emoji_replace.ts`, `src/_emoji_codes.ts`  
**Python Source:** `rich/emoji.py` (91 LOC), `rich/_emoji_replace.py` (32 LOC), `rich/_emoji_codes.py` (140k LOC data)  
**Python Tests:** `tests/test_emoji.py` (~37 tests)  
**Total:** ~123 LOC + data file, ~37 tests

**What to do:**
1. Port `tests/test_emoji.py` to `tests/emoji.test.ts`
2. Replace stub `src/_emoji_codes.ts` with full emoji dictionary (copy from Python)
3. Replace stub `src/_emoji_replace.ts` with full regex replacement + variant support
4. Replace stub `src/emoji.ts` with full Emoji class + variant support
5. Verify Phase 5 markup tests now pass

**Expected result:** All failing markup tests should now PASS

---

## Total Stub Replacement Work

- **4 stub groups** to replace
- **~947 LOC** (excluding emoji data file)
- **~208 tests**
- **Estimated effort:** 3-4 hours

---

## Success Criteria

After stub replacement:
- [ ] All Phase 4 tests passing (rule colors fixed)
- [ ] All Phase 5 tests passing (align, markup, panel working)
- [ ] Total test count: ~290/~290 tests passing
- [ ] 0 stub-related failures
- [ ] Ready for table and progress modules

