===== FIX PROMPT: COMPONENTS CRITICAL ISSUES (Phases 4-7) =====

**Task:** Fix 1 critical + 2 high priority issues found in components review  
**Modules Affected:** columns.ts, console.ts, table.ts  
**Review Source:** `rich-ts/phases/REVIEW_COMPONENTS_OUTPUT.md`

---

## 🎯 YOUR MISSION

Fix critical bugs in components (Phases 4-7) affecting layout and rendering.

**Issues Found:**
1. **CRITICAL:** Columns width can hang/OOM the process
2. **HIGH:** Titles/captions lose separating newline
3. **HIGH:** Text overflow ignored in tables/grids

All must be fixed before components are production-ready.

---

## 📋 SETUP

**Repository:** `/Users/leemoore/code/rich-port/rich/`

**Read the full review:**
```bash
cat rich-ts/phases/REVIEW_COMPONENTS_OUTPUT.md
```

---

## 🔥 CRITICAL ISSUE #1: Columns Width Hangs Process

**File:** `src/columns.ts`  
**Lines:** 159-184  
**Severity:** Critical - Process hangs/OOM!

**Problem:**
When `width` parameter exceeds console width, `columnCount` calculation becomes 0 or negative. Subsequent modulo/division operations and generator loops never terminate, causing OOM crash.

**Reproduction:**
```typescript
const console = new Console({ width: 50 });
const columns = new Columns(['a', 'b', 'c'], { width: 100 });
console.print(columns);  // Hangs! columnCount = 0
```

**Current Code (src/columns.ts ~line 159-184):**
```typescript
const columnCount = Math.floor(maxWidth / (this.width + widthPadding));
// BUG: Can be 0 or negative!

// Later:
for (const [index, renderable] of enumerate(renderables)) {
  const column = index % columnCount;  // Division by zero!
  // ...
}
```

**Fix:**
```typescript
// Calculate column count
let columnCount = Math.floor(maxWidth / (this.width + widthPadding));

// GUARD: Ensure at least 1 column
if (columnCount < 1) {
  columnCount = 1;
  // Or: throw new Error(`Columns width ${this.width} exceeds console width ${maxWidth}`);
}

// Rest of code proceeds safely
```

**Verify:**
```bash
npm test columns -- --run
# Manual test with wide width:
# new Columns([...], {width: 100}) on narrow console should work
```

---

## ⚠️ HIGH PRIORITY ISSUE #2: Titles/Captions Lose Newline

**Files:** `src/console.ts`, `src/table.ts`, `src/columns.ts`  
**Lines:** console.ts:366-389, table.ts:555-590, columns.ts:155-214  
**Severity:** High - Visual bug

**Problem:**
`Console.renderStr()` sets `result.end = ''` for all strings, removing newlines. Table/Column titles and captions rely on that newline to separate from body content.

**Reproduction:**
```typescript
const table = new Table('A');
table.title = 'Title';
console.print(table);
// Prints: "  Title┏━━━━━┓"  (no newline)
// Should: "  Title\n┏━━━━━┓"
```

**Current Code (src/console.ts ~line 366-389):**
```typescript
renderStr(text: string): Text {
  const result = Text.fromMarkup(text);
  result.end = '';  // BUG: Removes all newlines!
  return result;
}
```

**Fix Option A - Preserve newlines:**
```typescript
renderStr(text: string): Text {
  const result = Text.fromMarkup(text);
  // Don't force end to '' - let Text keep its newline
  return result;
}
```

**Fix Option B - Add newline after annotations:**
In table.ts and columns.ts, after rendering title/caption:
```typescript
// After title rendering:
if (this.title) {
  yield* this.renderAnnotation(this.title, ...);
  yield Segment.line();  // Explicit newline
}
```

**Recommendation:** Option A (simpler, fixes root cause)

**Verify:**
```bash
npm test table columns -- --run  # If these exist
# Manual: Table with title should have newline separation
```

---

## ⚠️ HIGH PRIORITY ISSUE #3: Text Overflow Ignored in Tables

**File:** `src/console.ts`  
**Lines:** 809-845 (renderLines method)  
**Severity:** High - Layout broken

**Problem:**
`renderLines()` special-cases Text by calling `text.render()` directly, bypassing `text.__richConsole__()`. This skips width enforcement, wrapping, overflow (ellipsis), and justification.

**Impact:**
```typescript
// Table with narrow column
table.columns[0].width = 3;
table.addRow('three');  // Should show "th…"
// Actually shows: "thr" on one line, "ee" on next (wrapped wrong)
```

**Current Code (src/console.ts ~line 809-845):**
```typescript
renderLines(...) {
  // ...
  if (renderable instanceof Text) {
    segments = renderable.render(this, '');  // BUG: Bypasses wrapping!
  } else if (...) {
    // ...
  }
}
```

**Fix:**
```typescript
renderLines(renderable: RenderableType, options?: ConsoleOptions, ...) {
  const renderOptions = options ?? this.options;
  
  // Convert string to Text
  if (typeof renderable === 'string') {
    renderable = this.renderStr(renderable);
  }
  
  // For ALL renderables (including Text), use __richConsole__ protocol
  if (renderable && typeof renderable === 'object' && '__richConsole__' in renderable) {
    const richConsole = (renderable as any).__richConsole__;
    segments = Array.from(richConsole.call(renderable, this, renderOptions));
  } else {
    throw new Error(`Cannot render object of type ${typeof renderable}`);
  }
  
  // Rest of method unchanged (apply style, split lines, etc.)
}
```

**This ensures:**
- Text wrapping happens (respects options.maxWidth)
- Overflow mode enforced (ellipsis, fold, crop)
- Justification works
- No_wrap honored

**Verify:**
```bash
npm test text -- --run
npm test table -- --run  # If exists
# Manual: Text in narrow table cell should show ellipsis
```

---

## 📝 WORKFLOW

### Step 1: Fix Issues in Order (3-4 hours)

**Recommended Order:**
1. **Issue #1** (Columns hang) - Prevents crashes, quick fix
2. **Issue #3** (Text overflow) - Core rendering fix
3. **Issue #2** (Newline) - Visual fix, depends on #3 working

**For each issue:**
1. Read issue description
2. Locate code in file
3. Read Python reference (rich/columns.py, rich/console.py, rich/table.py)
4. Implement fix
5. Test: `npm test [MODULE] -- --run`
6. Manual test reproduction case
7. Move to next issue

### Step 2: Verify ALL THREE Pass

After all fixes:
```bash
cd rich-ts

# Run each individually
npm test -- --run            # Must pass (544+ tests)
npm run typecheck            # Must pass (0 errors)
npm run lint                 # Must pass (0 errors, warnings OK)

# Run full check
npm run check                # Must complete successfully
```

**If ANY fail:**
- Fix the failure
- Re-run ALL THREE
- Repeat until all 3 pass together

### Step 3: Manual Integration Testing

Test the fixes work together:

```typescript
import { Console, Table, Columns } from './src/index.js';

// Test Issue #1 fix (Columns width)
const console = new Console({ width: 50 });
const cols = new Columns(['a', 'b', 'c'], { width: 100 });
console.print(cols);  // Should NOT hang

// Test Issue #2 fix (Newlines)
const table = new Table('Col');
table.title = 'Title';
table.caption = 'Caption';
table.addRow('data');
console.print(table);
// Should show:
// Title
// ┏━━━━━┓
// ...
// Caption

// Test Issue #3 fix (Overflow)
const table2 = new Table();
const col = table2.addColumn('A', { width: 5, overflow: 'ellipsis' });
table2.addRow('very long text');
console.print(table2);  // Should show "ver…" not "very \nlong"
```

### Step 4: Stage Changes (DO NOT COMMIT!)

```bash
git add -A
# DO NOT commit or push
# Leave staged for re-review
```

### Step 5: Update Review Document

Update `rich-ts/phases/REVIEW_COMPONENTS_OUTPUT.md`:

Add at end:
```markdown
---

## Fixes Applied (Date: [DATE])

### Critical Issue #1: Columns Width Hang
**Status:** ✅ FIXED
**Changes:** src/columns.ts (lines 159-184)
**Fix:** Added `columnCount = Math.max(1, columnCount)` guard
**Verification:** Manual test with wide width no longer hangs

### High Priority Issue #2: Titles/Captions Newline
**Status:** ✅ FIXED
**Changes:** src/console.ts (lines 366-389)
**Fix:** [describe what you did]
**Verification:** Table titles now separate correctly

### High Priority Issue #3: Text Overflow in Tables
**Status:** ✅ FIXED
**Changes:** src/console.ts (lines 809-845)
**Fix:** [describe what you did]
**Verification:** Ellipsis overflow now works in narrow cells

---

## Re-Test Results

[Paste npm test -- --run output showing still 544+ passing]

[Paste npm run check showing success]

---

## Ready for Re-Review

All critical and high priority issues addressed. Components layer ready for approval.
```

---

## 📚 PYTHON REFERENCES

**For each fix, reference Python:**

**Issue #1:** See `rich/columns.py` - How Python handles width constraints  
**Issue #2:** See `rich/console.py` - How renderStr handles newlines  
**Issue #3:** See `rich/console.py` - How renderLines delegates to __rich_console__

---

## ⚠️ IMPORTANT NOTES

**Testing:**
- All 544 existing tests must still pass
- Issues found through manual testing - add tests if possible
- Verify fixes don't break other components

**Integration:**
- These fixes are in Console - affects ALL components
- Test table, columns, panel after fixes
- Ensure no regressions

**Type Safety:**
- Maintain TypeScript strict mode
- No new `any` types without justification

---

## ✅ SUCCESS CRITERIA

**All must be true:**
- [ ] Issue #1 fixed (Columns width doesn't hang)
- [ ] Issue #2 fixed (Titles/captions have newlines)
- [ ] Issue #3 fixed (Text overflow works in tables)
- [ ] `npm test -- --run` passes (544+ tests)
- [ ] `npm run typecheck` passes (0 errors)
- [ ] `npm run lint` passes (0 errors, warnings OK)
- [ ] Manual integration tests work
- [ ] Changes staged with `git add -A` (NOT committed)
- [ ] REVIEW_COMPONENTS_OUTPUT.md updated with fixes

---

## 🎯 EXPECTED OUTCOME

**After fixes:**
- Columns with wide width parameter doesn't crash
- Table/Column titles and captions separate visually from content
- Narrow table cells show ellipsis instead of wrapping
- All layout components work correctly
- Components layer production-ready!

---

## 🚀 START FIXING

Fix in order:
1. Columns hang (quick guard)
2. Text overflow (core fix)
3. Newline separation (visual fix)

Test after each, verify all 3 together, stage!

**GO!** 🔧

