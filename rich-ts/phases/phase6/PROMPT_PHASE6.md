# PHASE 6 PORTING PROMPT - Rich TypeScript

**Use this prompt at the start of each fresh Claude Code Web session to continue Phase 6 work.**

---

## 🎯 PROJECT OVERVIEW

**What is Rich?**
Rich is a popular Python library (70+ modules, 26K+ LOC) for rendering beautiful text, tables, progress bars, syntax highlighting, and more to the terminal. It's used by thousands of projects.

**What are we doing?**
Porting Rich's **core features** to TypeScript for use in Node.js and browser environments. We're implementing from scratch (no external dependencies for core features).

**Your Role:**
You're a TypeScript developer using Test-Driven Development (TDD) to port Python code. Port tests first, then implement code to pass those tests. Use logs to track progress across stateless sessions.

---

## 📋 PHASE 6 OVERVIEW

**Goal:** Replace Phase 5 stubs with real implementations, then port 2 major modules.

**Part 1 - Replace Stubs (~947 LOC, ~208 tests):**
1. **theme + default_styles + themes** (~313 LOC, ~53 tests) - Fix Phase 4 rule colors
2. **constrain** (~37 LOC, ~13 tests) - Unblock Phase 5 align tests
3. **box** (~474 LOC, ~105 tests) - Unblock Phase 5 panel tests
4. **emoji + _emoji_replace + _emoji_codes** (~123 LOC + data, ~37 tests) - Unblock Phase 5 markup tests

**Part 2 - Port New Modules (~2381 LOC, ~110 tests):**
5. **table** (~824 LOC, ~65 tests) - Tables and grids
6. **progress** (~1557 LOC, ~45 tests) - Progress bars

**Total:** ~3328 LOC, ~318 tests

**Why replace stubs first?** Phase 5 left tests failing due to stubs. Replacing stubs first ensures all Phase 4 & 5 work is validated before adding new complexity.

**Success Criteria:**
- All 4 stub groups replaced with full implementations
- All previously failing tests now pass
- Table module fully ported
- Progress module fully ported
- All code follows TypeScript strict mode (no `any` types)
- `npm run check` passes
- Progress logged in PORT_LOG files
- Code committed to git
- PHASE6_SUMMARY.md documents results

---

## 📋 SESSION STARTUP INSTRUCTIONS

I'm continuing the Rich TypeScript port. This is **Phase 6: Replace Stubs + Components Layer 2**.

### 1. First, read these logs to understand current status:
- Read `rich-ts/PORT_LOG_MASTER.md` 
- Read `rich-ts/PHASE5_SUMMARY.md` (stub-related failures)
- Read `rich-ts/phases/phase6/PORT_LOG_STUBS.md` (what to replace)
- Read `rich-ts/phases/phase6/PORT_LOG_TABLE.md`
- Read `rich-ts/phases/phase6/PORT_LOG_PROGRESS.md`
- Read `rich-ts/KNOWN_BUGS.md`

### 2. Development Standards:
- **Package Manager:** npm (not pnpm/bun)
- **TypeScript:** Strict mode, no `any` types allowed
- **Formatting:** Prettier handles ALL formatting (runs first in `npm run check`)
- **Linting:** ESLint for code quality ONLY (not formatting)
- **Tool Order:** Format → TypeCheck → Lint → Test (via `npm run check`)
- **Pre-commit:** Always run `npm run check` before committing
- **Naming:** Clear, descriptive names (no abbreviations)
- **Comments:** JSDoc for public APIs, inline comments for complex logic
- **Imports:** Use named imports, group by external/internal
- **Modern JS:** Use nullish coalescing (`??`) and optional chaining (`?.`) where appropriate

---

## 🎯 PHASE 6 WORKFLOW

### PART 0: FIX PHASE 5 ISSUES (Do this FIRST!)

Phase 5 was merged with TypeScript compilation errors and test regressions. Fix these before proceeding.

#### Fix TypeScript Compilation Errors (13 errors)

**1. Add Style.isNull() public method**
```typescript
// In src/style.ts, add public method:
public isNull(): boolean {
  return this._null;
}
```
**Impact:** Fixes console.ts:524, panel.ts:248, panel.ts:288

**2. Fix console.ts type guards (lines 364-365)**
```typescript
// Before (broken):
!('__richConsole__' in args[args.length - 1]!) &&
'height' in args[args.length - 1]!

// After (fixed):
typeof args[args.length - 1] === 'object' &&
args[args.length - 1] !== null &&
!('__richConsole__' in args[args.length - 1]) &&
'height' in args[args.length - 1]
```

**3. Fix markup.ts issues**
- Line 42: Remove unused `match` variable
- Lines 93,96,99,100: Add null checks for `tagText`

**4. Add missing properties to ConsoleOptions**
```typescript
// In src/console.ts ConsoleOptions interface:
safeBox?: boolean;
```

**5. Fix panel.ts type issues**
```typescript
// Add Padding to RenderableType union (wherever defined):
type RenderableType = string | Text | Padding | ...;
```

#### Fix Test Regressions (2 failures)

**6. Fix Text.assemble() - Broken for tuples**
- **Tests failing:** text.test.ts > test_assemble, test_assemble_meta
- **Issue:** `Text.assemble(['foo', ['bar', 'bold']])` returns 'foo' instead of 'foobar'
- **Debug:** Check Text.assemble() implementation - tuples not being processed

#### Verify Fixes
```bash
cd rich-ts
npm run check  # Must pass: format, typecheck, lint, tests
```

After all fixes, commit:
```bash
git add -A
git commit -m "Fix Phase 5 compilation errors and test regressions"
git push
```

---

### PART 1: REPLACE ALL STUBS

#### 1. Replace theme + default_styles + themes

**Read source materials:**
- `rich/theme.py` (115 LOC)
- `rich/default_styles.py` (193 LOC)
- `rich/themes.py` (5 LOC)
- `tests/test_theme.py` (53 tests)

**Port tests:**
1. Create `rich-ts/tests/theme.test.ts`
2. Port all tests from `tests/test_theme.py`
3. Handle configparser tests (may need npm `ini` package or skip file loading tests)
4. Run tests: `npm test theme` (should fail)

**Replace stubs:**
1. Replace `src/default_styles.ts` with full 60+ style definitions from Python
2. Replace `src/theme.ts` with full Theme class
   - Implement `Theme.from_file()` (optional - may skip if too complex)
   - Implement `Theme.read()` (optional)
   - Implement ThemeStack class
3. Replace `src/themes.ts` with DEFAULT export
4. Update `src/console.ts`:
   - Add `theme` property
   - Implement `getStyle(name: string): Style` method
   - Use theme in rule rendering

**Verify:**
- Run `npm test theme` - all tests should pass
- Run `npm test rule` - `test_rule` should now pass (green colors!)
- Document in commit message

**Commit:**
```bash
git add -A
git commit -m "Replace theme stubs with full implementation - fixes rule colors"
git push
```

---

#### 2. Replace constrain

**Read source materials:**
- `rich/constrain.py` (37 LOC)
- `tests/test_constrain.py` (13 tests)

**Port tests:**
1. Create `rich-ts/tests/constrain.test.ts`
2. Port all tests from `tests/test_constrain.py`
3. Run tests: `npm test constrain` (should fail)

**Replace stub:**
1. Replace `src/constrain.ts` with full implementation
2. Implement `update_width()` logic in ConsoleOptions
3. Implement proper width constraining in `__rich_console__`
4. Implement proper measurement in `__rich_measure__`

**Verify:**
- Run `npm test constrain` - all tests should pass
- Run `npm test align` - previously failing tests should now pass
- Document which align tests were fixed

**Commit:**
```bash
git add -A
git commit -m "Replace constrain stub - fixes align module"
git push
```

---

#### 3. Replace box

**Read source materials:**
- `rich/box.py` (474 LOC)
- `tests/test_box.py` (105 tests)

**Port tests:**
1. Create `rich-ts/tests/box.test.ts`
2. Port all tests from `tests/test_box.py`
3. Run tests: `npm test box` (should fail)

**Replace stub:**
1. Replace `src/box.ts` with full Box class
2. Implement box parsing from multi-line string
3. Implement all box style constants:
   - ASCII, ASCII2, ASCII_DOUBLE_HEAD
   - SQUARE, SQUARE_DOUBLE_HEAD
   - MINIMAL, MINIMAL_HEAVY_HEAD, MINIMAL_DOUBLE_HEAD
   - SIMPLE, SIMPLE_HEAD, SIMPLE_HEAVY
   - HORIZONTALS
   - ROUNDED
   - HEAVY, HEAVY_EDGE, HEAVY_HEAD
   - DOUBLE, DOUBLE_EDGE
4. Implement `substitute()` method for legacy Windows
5. Implement `get_plain_headed_box()` helper

**Verify:**
- Run `npm test box` - all tests should pass
- Run `npm test panel` - previously failing tests should now pass
- Document which panel tests were fixed

**Commit:**
```bash
git add -A
git commit -m "Replace box stub with all box styles - fixes panel module"
git push
```

---

#### 4. Replace emoji + _emoji_replace + _emoji_codes

**Read source materials:**
- `rich/emoji.py` (91 LOC)
- `rich/_emoji_replace.py` (32 LOC)
- `rich/_emoji_codes.py` (140k LOC - just data)
- `tests/test_emoji.py` (37 tests)

**Port tests:**
1. Create `rich-ts/tests/emoji.test.ts`
2. Port all tests from `tests/test_emoji.py`
3. Run tests: `npm test emoji` (should fail)

**Replace stubs:**
1. Replace `src/_emoji_codes.ts`:
   - Copy the entire EMOJI dictionary from Python
   - It's just data, no logic
2. Replace `src/_emoji_replace.ts`:
   - Implement full regex replacement
   - Implement emoji/text variant support
3. Replace `src/emoji.ts`:
   - Implement full Emoji class
   - Implement variant suffixes (\uFE0E, \uFE0F)
   - Implement `Emoji.replace()` static method
   - Implement proper style lookup via console.get_style()

**Verify:**
- Run `npm test emoji` - all tests should pass
- Run `npm test markup` - previously failing tests should now pass
- Document which markup tests were fixed

**Commit:**
```bash
git add -A
git commit -m "Replace emoji stubs with full implementation - fixes markup module"
git push
```

---

#### 5. Verify all stubs replaced

**Run full test suite:**
```bash
cd rich-ts
npm test -- --run
```

**Document results:**
- How many tests were failing before stub replacement?
- How many tests are passing now?
- Are there any remaining failures? (shouldn't be any stub-related)

**Create intermediate summary:**
Create `rich-ts/STUB_REPLACEMENT_SUMMARY.md`:
```markdown
# Stub Replacement Summary

## Before Stub Replacement
- Tests passing: X/Y
- Stub-related failures: Z

## After Stub Replacement
- Tests passing: X/Y
- All stub-related failures: FIXED
- Remaining failures: [list any non-stub issues]

## Stubs Replaced
1. theme + default_styles + themes ✅
2. constrain ✅
3. box ✅
4. emoji + _emoji_replace + _emoji_codes ✅

## Tests Fixed
[List all tests that were failing due to stubs and are now passing]

## Next: Port table and progress modules
```

---

### PART 2: PORT NEW MODULES

After all stubs are replaced and verified, proceed with porting table and progress.

#### 6. Port table module

**Read source materials:**
- `rich/table.py` (~824 LOC)
- `tests/test_table.py` (~65 tests)

**Port tests:**
1. Create `rich-ts/tests/table.test.ts`
2. Port all tests from `tests/test_table.py`
3. Run tests: `npm test table` (should fail)

**Implement module:**
1. Create `rich-ts/src/table.ts`
2. Implement Table class
3. Implement Column class
4. Implement row handling
5. Implement rendering with box integration
6. Implement grid mode
7. Implement styles, padding, alignment
8. Continue until all tests pass

**Verify:**
- Run `npm test table` - all tests should pass
- Run `npm run check` - should pass

**Commit:**
```bash
git add -A
git commit -m "Port table module with tests (65/65 passing)"
git push
```

**Update logs:**
- Update `rich-ts/phases/phase6/PORT_LOG_TABLE.md`

---

#### 7. Port progress module

**Read source materials:**
- `rich/progress.py` (~1557 LOC)
- `tests/test_progress.py` (~45 tests)

**Port tests:**
1. Create `rich-ts/tests/progress.test.ts`
2. Port all tests from `tests/test_progress.py`
3. Run tests: `npm test progress` (should fail)

**Implement module:**
1. Create `rich-ts/src/progress.ts`
2. Implement Progress class
3. Implement Task type/class
4. Implement TaskID type
5. Implement progress columns:
   - BarColumn
   - TextColumn
   - ProgressColumn
   - TimeRemainingColumn
   - etc.
6. Implement live rendering integration
7. Implement update/advance logic
8. Continue until all tests pass

**Verify:**
- Run `npm test progress` - all tests should pass
- Run `npm run check` - should pass

**Commit:**
```bash
git add -A
git commit -m "Port progress module with tests (45/45 passing)"
git push
```

**Update logs:**
- Update `rich-ts/phases/phase6/PORT_LOG_PROGRESS.md`

---

### PART 3: CREATE PHASE SUMMARY

Create `rich-ts/PHASE6_SUMMARY.md`:

```markdown
# Phase 6 Summary - Replace Stubs + Components Layer 2

**Status:** Complete
**Date:** [DATE]

## Part 1: Stub Replacement Results

### Stubs Replaced (4 groups, ~947 LOC, ~208 tests)
1. ✅ theme + default_styles + themes (313 LOC, 53 tests)
2. ✅ constrain (37 LOC, 13 tests)
3. ✅ box (474 LOC, 105 tests)
4. ✅ emoji + _emoji_replace + _emoji_codes (123 LOC + data, 37 tests)

### Test Results After Stub Replacement
- **Before:** X/Y tests passing, Z stub-related failures
- **After:** X/Y tests passing, 0 stub-related failures
- **Fixed:** All Phase 4 & 5 stub failures resolved

### Specific Fixes
- **Phase 4:** tests/rule.test.ts > test_rule now PASSES (green colors)
- **Phase 5 align:** X tests now PASSING
- **Phase 5 panel:** Y tests now PASSING
- **Phase 5 markup:** Z tests now PASSING

## Part 2: New Modules Ported

### ✅ table (824 LOC, 65/65 tests passing)
- Full implementation of Table class
- Column and Row management
- Box integration
- Grid mode
- **Files:** src/table.ts, tests/table.test.ts
- **Commit:** [hash]

### ✅ progress (1557 LOC, 45/45 tests passing)
- Full implementation of Progress class
- Task management
- Progress columns (Bar, Text, Time, etc.)
- Live rendering
- **Files:** src/progress.ts, tests/progress.test.ts
- **Commit:** [hash]

## Overall Results

- **Total modules:** 18/19 complete (95%)
- **Total tests:** X/Y passing
- **Lines of code:** ~X TypeScript LOC ported
- **Remaining:** 1 module (columns - Phase 7)

## Next Steps - Phase 7

1. Port columns module (final module!)
   - Now unblocked (has table, align, constrain)
2. Final testing pass
3. Project complete! 🎉

## Files Changed

[List all files added/modified]

## Total Stats

- **Lines Added:** ~3328 LOC
- **Tests Added:** 318 tests
- **Stubs Removed:** 8 stub files replaced
```

---

## ⚠️ IMPORTANT NOTES

**This is a BIG phase:**
- 4 stub replacements (~4 hours)
- 2 large modules (~6 hours)
- Total: ~10 hours of work

**Consider breaking into sessions:**
- Session 1: Replace stubs (theme, constrain, box, emoji)
- Session 2: Port table
- Session 3: Port progress
- Session 4: Final testing and summary

**Test frequently:**
- After each stub replacement, verify related tests pass
- Before starting new modules, ensure all previous work is solid

---

## 💾 END OF SESSION

Before ending your session, make sure:
- All module logs updated with progress
- PHASE6_SUMMARY.md created with complete results
- PORT_LOG_MASTER.md updated
- Session notes added with timestamp
- Next steps clearly documented

This allows Phase 7 to pick up seamlessly!

---

**Remember:** Stubs first, then new modules. This is the final major phase before the last module (columns) in Phase 7! 🚀

