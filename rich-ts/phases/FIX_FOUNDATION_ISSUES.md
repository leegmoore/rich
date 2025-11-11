===== FIX PROMPT: FOUNDATION CRITICAL ISSUES (Phases 1-3) =====

**Task:** Fix 5 critical issues + 4 high priority issues found in foundation review  
**Modules Affected:** text.ts, console.ts, measure.ts, cells.ts  
**Review Source:** `rich-ts/phases/REVIEW_FOUNDATION_OUTPUT.md`

---

## 🎯 YOUR MISSION

Fix critical bugs in the foundation (Phases 1-3) that are blocking production use.

**5 Critical Issues Found:**
1. Text rendering crash (style strings not resolved)
2. Console.print bypasses Text wrapping
3. __rich__ protocol not implemented
4. Measurement rejects valid renderables
5. Unbounded Unicode caches (memory leak)

**Plus 4 High Priority Issues**

All must be fixed before foundation is production-ready.

---

## 📋 SETUP

**Repository:** `/Users/leemoore/code/rich-port/rich/`

**Read the full review:**
```bash
cat rich-ts/phases/REVIEW_FOUNDATION_OUTPUT.md
```

---

## 🔥 CRITICAL ISSUE #1: Text Rendering Crash

**File:** `src/text.ts`  
**Lines:** 958-989  
**Severity:** Critical - Crashes on styled text!

**Problem:**
When `Text` has a base style string (like `'bold red'`) but no spans, `render()` creates a Segment with `style` as a raw string. Later, `Console._renderSegment()` calls `segment.style.render()` which crashes because strings don't have a `render()` method.

**Reproduction:**
```typescript
const console = new Console();
console.print(new Text('hi', 'bold red'));  // TypeError: style.render is not a function
```

**Current Code (src/text.ts:958-989):**
```typescript
render(console: Console, end: string = '\n'): Segment[] {
  // ...
  if (this._spans.length === 0) {
    // BUG: this.style is a string, not Style object!
    return [new Segment(text, this.style as any)];  
  }
  // ...
}
```

**Fix:**
```typescript
render(console: Console, end: string = '\n'): Segment[] {
  const text = this._text + end;
  
  // ALWAYS resolve style string to Style object
  const resolvedStyle = typeof this.style === 'string' 
    ? console.getStyle(this.style) 
    : this.style;
  
  if (this._spans.length === 0) {
    return [new Segment(text, resolvedStyle)];
  }
  
  // Rest of implementation...
  // Also ensure spans resolve their string styles via console.getStyle
}
```

**Verify:** After fix, run:
```bash
npm test text -- --run
# Should still pass, and manual test should work:
# console.print(new Text('hi', 'bold red'));
```

---

## 🔥 CRITICAL ISSUE #2: Console Bypasses Text Wrapping

**File:** `src/console.ts`  
**Lines:** 612-638 (print and _renderToString)  
**Severity:** Critical - No width constraints work!

**Problem:**
`Console.print()` and `_renderToString()` special-case Text by calling `text.render(this, '')` directly, bypassing `Text.__richConsole__()`. This skips wrapping, overflow handling, and `end` property.

**Impact:**
```typescript
const console = new Console({ width: 10 });
console.print('very long line that should wrap');  // Doesn't wrap!
```

**Current Code (src/console.ts ~line 615-620):**
```typescript
} else if (renderable instanceof Text) {
  const segments = renderable.render(this, '');  // BUG: Bypasses wrapping!
  return this._renderSegments(segments);
}
```

**Fix:**
```typescript
// Remove special case for Text - treat like any renderable
if (typeof renderable === 'string') {
  renderable = this.renderStr(renderable);
}

// For ALL renderables (including Text), use protocol:
if (renderable && typeof renderable === 'object' && '__richConsole__' in renderable) {
  const richConsole = (renderable as any).__richConsole__;
  const segments = Array.from(richConsole.call(renderable, this, renderOptions));
  // ... render segments
}
```

**Verify:**
```bash
npm test text -- --run
npm test console  # If console tests exist
# Manual: console.print('long text', {width: 10}) should wrap
```

---

## 🔥 CRITICAL ISSUE #3: __rich__ Protocol Not Implemented

**Files:** `src/console.ts`, `src/json.ts`, and others  
**Lines:** 579-599, 612-638  
**Severity:** Critical - Breaks JSON, Palette, Pretty

**Problem:**
Console doesn't implement `rich_cast` or check for `__rich__` method. Objects like `JSON.fromData({...})` that return themselves via `__rich__` never get their `__richConsole__` called.

**Impact:**
```typescript
import { JSON } from './json';
const json = JSON.fromData({foo: 'bar'});
console.print(json);  // Outputs: [object Object]
```

**Fix - Add to Console class:**
```typescript
/**
 * Rich cast - repeatedly call __rich__ until we get a renderable
 */
private richCast(obj: unknown): unknown {
  let current = obj;
  let depth = 0;
  const maxDepth = 10;  // Prevent infinite loops
  
  while (depth < maxDepth) {
    if (!current || typeof current !== 'object') break;
    if (!('__rich__' in current)) break;
    
    const richMethod = (current as any).__rich__;
    if (typeof richMethod !== 'function') break;
    
    const result = richMethod.call(current);
    if (result === current) break;  // Avoid infinite loops
    
    current = result;
    depth++;
  }
  
  return current;
}
```

**Then in _coerceRenderable and _renderToString:**
```typescript
// BEFORE checking __richConsole__, do rich_cast:
renderable = this.richCast(renderable);

// Then proceed with existing logic
if (typeof renderable === 'string') { ... }
if (renderable instanceof Text) { ... }
// etc.
```

**Verify:**
```bash
npm test json -- --run
# Manual: JSON.fromData({foo: 'bar'}) should render formatted JSON
```

---

## 🔥 CRITICAL ISSUE #4: Measurement Rejects Valid Renderables

**File:** `src/measure.ts`  
**Lines:** 93-151  
**Severity:** Critical - Breaks layout

**Problem:**
`Measurement.get()` only accepts strings, Text, or objects with `__richMeasure__`. Doesn't do `rich_cast` or accept objects with `__richConsole__`.

**Current Code:**
```typescript
static get(console: Console, options: ConsoleOptions, renderable: unknown): Measurement {
  if (typeof renderable === 'string') { ... }
  if (renderable instanceof Text) { ... }
  if (renderable && typeof renderable === 'object' && '__richMeasure__' in renderable) { ... }
  
  throw new NotRenderableError(...);  // BUG: Too restrictive!
}
```

**Fix:**
```typescript
static get(console: Console, options: ConsoleOptions, renderable: unknown): Measurement {
  // First, do rich_cast (use console.richCast from Issue #3)
  const casted = console.richCast(renderable);
  
  if (typeof casted === 'string') {
    // ... handle string
  }
  
  if (casted instanceof Text) {
    // ... handle text
  }
  
  // Check for __richMeasure__
  if (casted && typeof casted === 'object' && '__richMeasure__' in casted) {
    // ... call it
  }
  
  // Check for __richConsole__ (can render, so measure by rendering)
  if (casted && typeof casted === 'object' && '__richConsole__' in casted) {
    // Render to get segments, measure segments
    const segments = Array.from((casted as any).__richConsole__.call(casted, console, options));
    const lines = Array.from(Segment.splitLines(segments));
    const widths = lines.map(line => Segment.getLineLength(line));
    const maxWidth = Math.max(...widths, 0);
    return new Measurement(maxWidth, maxWidth);
  }
  
  // Only then throw NotRenderableError
  throw new NotRenderableError(...);
}
```

**Verify:**
```bash
npm test measure -- --run
# Manual: console.measure(JSON.fromData({...})) should work
```

---

## 🔥 CRITICAL ISSUE #5: Unbounded Unicode Caches

**File:** `src/cells.ts`  
**Lines:** 41-110  
**Severity:** Critical - Memory leak!

**Problem:**
`characterCellSizeCache` and `cachedCellLenCache` are unbounded `Map`s. Python uses `@lru_cache(maxsize=4096)`. Long-running apps leak memory.

**Current Code:**
```typescript
const characterCellSizeCache = new Map<string, number>();
const cachedCellLenCache = new Map<string, number>();

// Just keeps growing forever!
```

**Fix - Implement simple LRU:**
```typescript
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;
  
  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }
  
  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }
  
  set(key: K, value: V): void {
    // Delete if exists (will re-add at end)
    this.cache.delete(key);
    this.cache.set(key, value);
    
    // Evict oldest if over size
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
  
  has(key: K): boolean {
    return this.cache.has(key);
  }
}

// Replace Map with LRUCache:
const characterCellSizeCache = new LRUCache<string, number>(4096);
const cachedCellLenCache = new LRUCache<string, number>(4096);
```

**Verify:**
```bash
npm test cells -- --run
# Should still pass
```

---

## ⚠️ HIGH PRIORITY ISSUE #6: Pretty Fallback Missing

**File:** `src/console.ts`  
**Lines:** 579-599  
**Severity:** High

**Problem:**
Plain objects/arrays print as `[object Object]` instead of formatted output.

**Fix:**
After implementing `richCast` (Issue #3), add Pretty fallback:

```typescript
private _coerceRenderable(renderable: unknown): RenderableType {
  // Do rich_cast first
  renderable = this.richCast(renderable);
  
  // ... existing checks for string, Text, etc.
  
  // NEW: Check if it's a container (object/array) - wrap in Pretty
  if (typeof renderable === 'object' && renderable !== null) {
    // Check if it's a plain object or array
    if (Array.isArray(renderable) || renderable.constructor === Object) {
      // Import Pretty and wrap
      const { Pretty } = await import('./pretty.js');
      return new Pretty(renderable);
    }
  }
  
  // ... rest of logic
}
```

**Note:** May need to make Pretty available first or return renderable as-is until Pretty is ported.

---

## ⚠️ HIGH PRIORITY ISSUE #7: Windows Hyperlink Handling

**File:** `src/console.ts`  
**Lines:** 650-673  
**Severity:** High

**Problem:**
Hyperlink OSC codes emitted without checking `legacy_windows`.

**Fix:**
```typescript
private _renderSegment(segment: Segment): string {
  // ... existing code
  
  // When rendering link:
  if (segment.link) {
    if (this.options.legacyWindows) {
      // Don't emit OSC codes on legacy Windows
      return segment.text;
    }
    // ... emit hyperlink OSC codes
  }
}
```

---

## ⚠️ HIGH PRIORITY ISSUE #8: Color/Markup Cache Unbounded

**Files:** `src/color.ts`, `src/markup.ts`  
**Severity:** High

**Problem:**
Same as cells - unbounded caches.

**Fix:**
Apply same LRUCache solution to:
- Color parsing cache
- Markup parsing cache (if exists)

---

## ⚠️ HIGH PRIORITY ISSUE #9: Segment.setShape Array Reuse

**File:** `src/segment.ts`  
**Lines:** 364-383  
**Severity:** High

**Problem:**
Same `[blank]` array instance reused - mutations affect multiple lines.

**Fix:**
```typescript
// Instead of reusing same array:
const blankSegment = new Segment(' ', paddingStyle);

// Create new array for each line:
const padding = Array(paddingWidth).fill(null).map(() => blankSegment);
```

---

## 📝 WORKFLOW

### Step 1: Fix Issues in Order (6-8 hours)

**Fix each issue:**
1. Read issue description and current code
2. Read Python source for reference
3. Implement fix
4. Test the specific module: `npm test [MODULE] -- --run`
5. Move to next issue

**Recommended Order:**
1. Issue #5 (LRU cache) - Foundation, used by others
2. Issue #1 (Text style resolution) - Blocks rendering
3. Issue #2 (Console wrapping) - Depends on #1
4. Issue #3 (__rich__ protocol) - Major feature
5. Issue #4 (Measurement) - Depends on #3
6. Issues #6-9 (High priority)

### Step 2: Verify ALL THREE Pass (CRITICAL!)

After all fixes:
```bash
cd rich-ts

# Run each individually
npm test -- --run            # Must pass
npm run typecheck            # Must pass (0 errors)
npm run lint                 # Must pass (0 errors, warnings OK)

# Run full check
npm run check                # Must complete successfully
```

**If ANY fail after fixes:**
- Fix that issue
- Re-run ALL THREE again (fixes can break each other!)
- Repeat until all 3 pass together

### Step 3: Manual Integration Testing

Test the fixes manually:
```typescript
// Test Issue #1 fix:
const console = new Console();
console.print(new Text('hello', 'bold red'));  // Should work

// Test Issue #2 fix:
const console2 = new Console({ width: 10 });
console2.print('this is a very long line that should wrap');  // Should wrap

// Test Issue #3 fix:
import { JSON } from './json';
console.print(JSON.fromData({foo: 'bar'}));  // Should show formatted JSON

// Test Issue #4 fix:
const measurement = console.measure(JSON.fromData({x: 1}));  // Should work

// Test Issue #5 fix (memory):
// Run console.print 10,000 times and check memory doesn't grow unbounded
```

### Step 4: Stage Changes (DO NOT COMMIT!)

```bash
git add -A
# DO NOT commit or push
# Leave staged for re-review
```

### Step 5: Update Documentation

Update `rich-ts/phases/REVIEW_FOUNDATION_OUTPUT.md`:
- Add section: "## Fixes Applied"
- List each issue fixed with commit reference
- Note any remaining issues

---

## 📚 PYTHON REFERENCES

**For each fix, reference Python source:**

**Issue #1:** See `rich/text.py` - Text.render() method  
**Issue #2:** See `rich/console.py` - Console.print() and render()  
**Issue #3:** See `rich/console.py` - rich_cast() function  
**Issue #4:** See `rich/measure.py` - Measurement.get()  
**Issue #5:** See `rich/cells.py` - @lru_cache decorators

---

## ⚠️ IMPORTANT NOTES

**Interdependencies:**
- Issue #2 depends on Issue #1 being fixed
- Issue #4 depends on Issue #3 being fixed
- Fix in order!

**Testing:**
- Each fix should keep existing tests passing
- Add manual tests for scenarios that weren't covered
- All 544 tests should still pass after fixes

**Type Safety:**
- Avoid using `as any` - use proper type guards
- If you need to cast, add runtime checks first

**Performance:**
- LRU cache implementation doesn't need to be perfect
- Simple Map with size check is fine
- Optimize later if needed

---

## ✅ SUCCESS CRITERIA

**All must be true:**
- [ ] All 5 critical issues fixed
- [ ] All 4 high priority issues fixed (or documented why not)
- [ ] `npm test -- --run` passes (544+ tests)
- [ ] `npm run typecheck` passes (0 errors)
- [ ] `npm run lint` passes (0 errors, warnings OK)
- [ ] Manual integration tests work
- [ ] Changes staged with `git add -A` (NOT committed)
- [ ] REVIEW_FOUNDATION_OUTPUT.md updated with "Fixes Applied" section

---

## 🎯 EXPECTED OUTCOME

**After fixes:**
- Text with string styles renders correctly
- Console respects width constraints and wraps text
- JSON, Palette, and other __rich__ objects render
- Measurement works for all renderables
- Memory doesn't leak in long-running apps
- Foundation is production-ready!

---

## 🚀 START FIXING

Read each issue carefully, implement the fix, test thoroughly, move to next issue.

After all fixes, verify all 3 quality checks pass together, then stage!

**GO!** 🔧

