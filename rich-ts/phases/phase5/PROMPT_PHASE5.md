# PHASE 5 PORTING PROMPT - Rich TypeScript

**Use this prompt at the start of each fresh Claude Code Web session to continue Phase 5 work.**

---

## 🎯 PROJECT OVERVIEW

**What is Rich?**
Rich is a popular Python library (70+ modules, 26K+ LOC) for rendering beautiful text, tables, progress bars, syntax highlighting, and more to the terminal. It's used by thousands of projects.

**What are we doing?**
Porting Rich's **core features** to TypeScript for use in Node.js and browser environments. We're implementing from scratch (no external dependencies for core features).

**Your Role:**
You're a TypeScript developer using Test-Driven Development (TDD) to port Python code. Port tests first, then implement code to pass those tests. Use logs to track progress across stateless sessions.

---

## 📋 PHASE 5 OVERVIEW

**Goal:** Port 3 component modules using STUB dependencies, then replace stubs in Phase 6.

**Modules:**
1. **align** - Horizontal/vertical alignment (~267 LOC, ~20 tests) - DEPENDS ON: console ✅, measure ✅, **constrain (STUB)**
2. **markup** - Parse markup syntax (~252 LOC, ~35 tests) - DEPENDS ON: text ✅, style ✅, **emoji (STUB)**
3. **panel** - Bordered panels (~318 LOC, ~25 tests) - DEPENDS ON: console ✅, padding ✅, **box (STUB)**, align (same phase)

**Total:** ~837 LOC, ~80 tests

**Why stubs?** These modules need dependencies that themselves have dependencies. Stubbing lets us make progress without rabbit holes.

**Success Criteria:**
- All 3 modules have TypeScript tests
- All 3 modules have TypeScript implementations
- Tests that CAN pass do pass
- Tests that fail due to stubs are DOCUMENTED (not skipped!)
- All code follows TypeScript strict mode (no `any` types)
- `npm run check` passes
- Progress logged in PORT_LOG files
- Code committed to git
- PHASE5_SUMMARY.md documents all stub-related failures

---

## 📋 SESSION STARTUP INSTRUCTIONS

I'm continuing the Rich TypeScript port. This is **Phase 5: Components Layer 1 (with stubs)**.

### 1. First, read these logs to understand current status:
- Read `rich-ts/PORT_LOG_MASTER.md` 
- Read `rich-ts/phases/phase5/PORT_LOG_ALIGN.md`
- Read `rich-ts/phases/phase5/PORT_LOG_MARKUP.md`
- Read `rich-ts/phases/phase5/PORT_LOG_PANEL.md`
- Read `rich-ts/KNOWN_BUGS.md` (current bugs from Phase 4)
- Read `rich-ts/PHASE4_SUMMARY.md` (Phase 4 results)

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

## 🎯 PHASE 5 WORKFLOW

### STEP 1: FIX BUGS + CREATE STUBS (Do this FIRST!)

#### 1a. Fix old bugs
Fix `src/cells.ts` - `setCellSize` function (~line 146-194)
- **Bug:** When `total=1` and first char is double-width emoji, returns `''` instead of `' '`
- **Test:** `tests/cells.test.ts > test_set_cell_size`
- **Fix:** Add special case before binary search for when total < first character width

#### 1b. Create stub: theme + default_styles (for Phase 4 rule colors)

Create `rich-ts/src/default_styles.ts`:
```typescript
/**
 * STUB: Default style definitions
 * TODO: Full implementation in Phase 6 with all 60+ style names
 * This stub provides minimal styles to unblock rule color tests
 */
import { Style } from './style.js';

export const DEFAULT_STYLES: Record<string, Style> = {
  'none': Style.null(),
  'rule.line': Style.parse('bright_green'),
  'rule.text': Style.null(),
};
```

Create `rich-ts/src/theme.ts`:
```typescript
/**
 * STUB: Theme class for style lookups
 * TODO: Full implementation in Phase 6 with config file loading
 */
import { Style, StyleType } from './style.js';
import { DEFAULT_STYLES } from './default_styles.js';

export class Theme {
  styles: Record<string, Style>;

  constructor(styles?: Record<string, StyleType>, inherit: boolean = true) {
    this.styles = inherit ? { ...DEFAULT_STYLES } : {};
    if (styles) {
      for (const [name, style] of Object.entries(styles)) {
        this.styles[name] = typeof style === 'string' ? Style.parse(style) : style;
      }
    }
  }
}
```

Create `rich-ts/src/themes.ts`:
```typescript
/**
 * STUB: Default theme export
 * TODO: Full implementation in Phase 6
 */
import { Theme } from './theme.js';

export const DEFAULT = new Theme();
```

Update `rich-ts/src/console.ts` to add theme support:
- Add `theme?: Theme` to ConsoleOptions
- Add `getStyle(name: string): Style` method that looks up in theme
- Use theme in renderLines for rule colors

#### 1c. Create stub: constrain (for align)

Create `rich-ts/src/constrain.ts`:
```typescript
/**
 * STUB: Constrain - limit renderable width
 * TODO: Full implementation in Phase 6
 */
import type { Console, ConsoleOptions, RenderableType, RenderResult } from './console.js';
import { Measurement } from './measure.js';

export class Constrain {
  renderable: RenderableType;
  width: number | undefined;

  constructor(renderable: RenderableType, width?: number) {
    this.renderable = renderable;
    this.width = width;
  }

  __rich_console__(console: Console, options: ConsoleOptions): RenderResult {
    // STUB: Minimal implementation - just yields the renderable
    // TODO Phase 6: Implement width constraining with update_width
    if (this.width === undefined) {
      return console.render(this.renderable, options);
    }
    throw new Error('STUB: Constrain width limiting not implemented - Phase 6');
  }

  __rich_measure__(console: Console, options: ConsoleOptions): Measurement {
    // STUB: Minimal measurement
    // TODO Phase 6: Implement proper width constraint measurement
    if (this.width !== undefined) {
      throw new Error('STUB: Constrain measurement not implemented - Phase 6');
    }
    return Measurement.get(console, options, this.renderable);
  }
}
```

#### 1d. Create stub: box (for panel)

Create `rich-ts/src/box.ts`:
```typescript
/**
 * STUB: Box drawing characters
 * TODO: Full implementation in Phase 6 with all box styles
 */

export class Box {
  // STUB: Minimal box with ASCII characters
  // TODO Phase 6: Implement all box properties and methods
  top_left = '+';
  top = '-';
  top_divider = '+';
  top_right = '+';
  head_left = '|';
  head_vertical = '|';
  head_right = '|';
  head_row_left = '+';
  head_row_horizontal = '-';
  head_row_cross = '+';
  head_row_right = '+';
  mid_left = '|';
  mid_vertical = '|';
  mid_right = '|';
  row_left = '+';
  row_horizontal = '-';
  row_cross = '+';
  row_right = '+';
  foot_row_left = '+';
  foot_row_horizontal = '-';
  foot_row_cross = '+';
  foot_row_right = '+';
  foot_left = '|';
  foot_vertical = '|';
  foot_right = '|';
  bottom_left = '+';
  bottom = '-';
  bottom_divider = '+';
  bottom_right = '+';
  ascii = true;

  constructor(box: string, options?: { ascii?: boolean }) {
    // STUB: Ignores box string, uses ASCII
    // TODO Phase 6: Parse box string into properties
    console.warn('STUB: Box construction not fully implemented - using ASCII fallback');
  }
}

// STUB: Minimal box constants
// TODO Phase 6: Add all box styles (HEAVY, DOUBLE, ROUNDED, etc.)
export const ROUNDED = new Box('', { ascii: true });
export const HEAVY = new Box('', { ascii: true });
export const DOUBLE = new Box('', { ascii: true });
```

#### 1e. Create stub: emoji (for markup)

Create `rich-ts/src/_emoji_codes.ts`:
```typescript
/**
 * STUB: Emoji name to character mappings
 * TODO: Full implementation in Phase 6 with 4000+ emoji
 */

export const EMOJI: Record<string, string> = {
  // STUB: Minimal emoji for testing
  // TODO Phase 6: Port full emoji dictionary from Python
  'smiley': '😀',
  'heart': '❤️',
  'thumbs_up': '👍',
};
```

Create `rich-ts/src/_emoji_replace.ts`:
```typescript
/**
 * STUB: Replace :emoji: codes with characters
 * TODO: Full implementation in Phase 6
 */
import { EMOJI } from './_emoji_codes.js';

export function _emoji_replace(text: string, defaultVariant?: string): string {
  // STUB: Basic regex replacement
  // TODO Phase 6: Implement full variant support
  return text.replace(/:(\w+):/g, (match, name) => {
    return EMOJI[name] ?? match;
  });
}
```

Create `rich-ts/src/emoji.ts`:
```typescript
/**
 * STUB: Emoji renderable
 * TODO: Full implementation in Phase 6
 */
import type { Console, ConsoleOptions, RenderResult } from './console.js';
import { Segment } from './segment.js';
import { Style, StyleType } from './style.js';
import { EMOJI } from './_emoji_codes.js';
import { _emoji_replace } from './_emoji_replace.js';

export type EmojiVariant = 'emoji' | 'text';

export class NoEmoji extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NoEmoji';
  }
}

export class Emoji {
  name: string;
  style: StyleType;
  variant?: EmojiVariant;
  private _char: string;

  constructor(name: string, style: StyleType = 'none', variant?: EmojiVariant) {
    this.name = name;
    this.style = style;
    this.variant = variant;
    
    const emoji = EMOJI[name];
    if (!emoji) {
      throw new NoEmoji(`No emoji called '${name}'`);
    }
    this._char = emoji;
    // STUB: Variant support not implemented
    // TODO Phase 6: Add variant suffix (\uFE0E or \uFE0F)
  }

  static replace(text: string): string {
    return _emoji_replace(text);
  }

  toString(): string {
    return this._char;
  }

  __rich_console__(console: Console, options: ConsoleOptions): RenderResult {
    // STUB: Basic rendering without style lookup
    // TODO Phase 6: Use console.get_style() for style resolution
    const style = typeof this.style === 'string' ? Style.parse(this.style) : this.style;
    return [new Segment(this._char, style)];
  }
}
```

---

### STEP 2: PORT MODULES (Standard TDD)

**For EACH module (align, markup, panel):**

1. **Read Source Materials**
   - Read Python source: `rich/[MODULE].py`
   - Read Python tests: `tests/test_[MODULE].py`

2. **Port Tests FIRST**
   - Create `rich-ts/tests/[MODULE].test.ts`
   - Convert ALL Python tests to TypeScript/Vitest
   - Import the (not yet existing) module
   - Run tests: `npm test [MODULE]` - should FAIL

3. **Implement Module**
   - Create `rich-ts/src/[MODULE].ts`
   - Implement piece by piece
   - Run tests frequently: `npm test [MODULE]`
   - Some tests WILL FAIL due to stubs - that's expected!

4. **Run Quality Checks**
   - Run all checks: `npm run check`

5. **Commit and Push**
   - Stage: `git add -A`
   - Commit: `git commit -m "Port [MODULE] module with tests"`
   - Push: `git push`

6. **Update Logs**
   - Update `rich-ts/phases/phase5/PORT_LOG_[MODULE].md`
   - Mark tests as passing or failing
   - Note which failures are due to stubs

---

### STEP 3: DOCUMENT STUB FAILURES

At the END of the session, create `rich-ts/PHASE5_SUMMARY.md`:

```markdown
# Phase 5 Summary - Components Layer 1

**Status:** Complete (3/3 modules ported)
**Date:** [DATE]

## Completed Modules

### ✅ align (X/20 tests passing)
- Full implementation of Align class
- **File:** src/align.ts, tests/align.test.ts
- **Commit:** [hash]

### ✅ markup (X/35 tests passing)
- Full implementation of markup parsing
- **File:** src/markup.ts, tests/markup.test.ts
- **Commit:** [hash]

### ✅ panel (X/25 tests passing)
- Full implementation of Panel class
- **File:** src/panel.ts, tests/panel.test.ts
- **Commit:** [hash]

## Test Results

- **Total:** X/80 tests passing (Y%)
- **Passing:** X tests
- **Failing:** Y tests (all due to stubs - EXPECTED)

## Failing Tests Due to Stubs

### From Phase 4 (Fixed or Still Failing):
1. **tests/cells.test.ts > test_set_cell_size**
   - Status: FIXED / STILL FAILING
   - [details]

2. **tests/rule.test.ts > test_rule**
   - Status: FIXED / STILL FAILING
   - Stub: theme/default_styles
   - [details]

### From Phase 5 align module:
1. **tests/align.test.ts > test_align_with_constrain** (EXPECTED FAILURE)
   - Reason: Constrain stub throws error
   - Error: "STUB: Constrain width limiting not implemented - Phase 6"
   - Fix: Port real constrain.ts in Phase 6

[List ALL failing tests with details]

### From Phase 5 markup module:
[List ALL failing tests]

### From Phase 5 panel module:
[List ALL failing tests]

## Stubs Created

1. **src/theme.ts** - Theme class (minimal)
2. **src/default_styles.ts** - Style definitions (minimal)
3. **src/themes.ts** - Default theme export
4. **src/constrain.ts** - Width constraining (stub)
5. **src/box.ts** - Box drawing characters (stub)
6. **src/emoji.ts** - Emoji renderables (stub)
7. **src/_emoji_replace.ts** - Emoji replacement (stub)
8. **src/_emoji_codes.ts** - Emoji dictionary (stub)

## Next Steps - Phase 6

1. Replace constrain stub with full implementation
2. Replace box stub with full implementation (all box styles)
3. Replace emoji stubs with full implementation (4000+ emoji)
4. Replace theme stubs with full implementation (60+ styles)
5. Re-run all Phase 5 tests - should see failures drop to 0
6. Port table and progress modules

## Files Changed

[List all files]

## Total Stats

- **Lines Added:** ~X LOC
- **Tests Added:** 80 tests
- **Stubs Created:** 8 files
```

---

## ⚠️ CRITICAL RULES FOR STUB FAILURES

**When tests fail due to stubs:**

1. ✅ **DO NOT** use `test.skip()` or `test.todo()`
2. ✅ **DO NOT** modify the test to work around the stub
3. ✅ **DO NOT** try to "fix" the stub to make tests pass
4. ✅ **DO** leave the test FAILING
5. ✅ **DO** document the failure in PHASE5_SUMMARY.md
6. ✅ **DO** explain which stub is causing the failure
7. ✅ **DO** note what needs to be implemented in Phase 6

**Example of good failure documentation:**

```
tests/panel.test.ts > test_panel_rounded_box (EXPECTED FAILURE)
- Reason: Box stub uses ASCII characters instead of Unicode box drawing
- Current output: +----+
- Expected output: ╭────╮
- Stub: src/box.ts - ROUNDED constant
- Fix: Phase 6 - implement full box parsing and ROUNDED style
```

---

## 💾 END OF SESSION

Before ending your session, make sure:
- All module logs updated with progress
- PHASE5_SUMMARY.md created with ALL failing tests documented
- PORT_LOG_MASTER.md updated
- Session notes added with timestamp
- Next steps clearly documented

This allows Phase 6 to pick up seamlessly!

---

**Remember:** Stubs are temporary. Tests first, implementation second. Document every failure. Phase 6 will fix the stubs! 🚀

