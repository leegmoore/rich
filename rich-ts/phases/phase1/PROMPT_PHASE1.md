# PHASE 1 PORTING PROMPT - Rich TypeScript

**Use this prompt at the start of each fresh Claude Code Web session to continue Phase 1 work.**

---

## 🎯 PROJECT OVERVIEW

**What is Rich?**
Rich is a popular Python library (70+ modules, 26K+ LOC) for rendering beautiful text, tables, progress bars, syntax highlighting, and more to the terminal. It's used by thousands of projects.

**What are we doing?**
Porting Rich's **core features** to TypeScript for use in Node.js and browser environments. We're implementing from scratch (no external dependencies for core features).

**Your Role:**
You're a TypeScript developer using Test-Driven Development (TDD) to port Python code. Port tests first, then implement code to pass those tests. Use logs to track progress across stateless sessions.

**Project Stats:**
- Python Source: ~26,274 LOC
- Python Tests: ~10,719 LOC (668 test functions)
- Target: Core features only (~19 modules)
- Phases: 4 phases based on dependency layers

---

## 📋 PHASE 1 OVERVIEW

**Goal:** Port 4 foundation modules that have NO internal dependencies.

**Modules:**
1. **color_triplet** - RGB color representation (~30 LOC, 3 tests, 15 min)
2. **errors** - Exception classes (~50 LOC, minimal tests, 10 min)
3. **cells** - Unicode character width calculations (~200 LOC, 8 tests, 45 min)
4. **color** - Color parsing & manipulation (~500 LOC, 17 tests, 60 min)

**Why these first?** They're foundational - other modules depend on them. They can be ported in parallel (no dependencies on each other except color→color_triplet).

**Success Criteria:**
- All 4 modules have TypeScript tests
- All tests pass
- All code follows TypeScript strict mode (no `any` types)
- Code is formatted (Prettier) and linted (ESLint)
- `npm run check` passes for all modules
- Progress logged in PORT_LOG files
- Code committed to git

---

## 📋 SESSION STARTUP INSTRUCTIONS

I'm continuing the Rich TypeScript port. This is **Phase 1: Foundation Layer**.

### 1. First, read these logs to understand current status:
- Read `rich-ts/PORT_LOG_MASTER.md` 
- Read `rich-ts/PORT_LOG_COLOR_TRIPLET.md`
- Read `rich-ts/PORT_LOG_ERRORS.md`
- Read `rich-ts/PORT_LOG_CELLS.md`
- Read `rich-ts/PORT_LOG_COLOR.md`

### 2. If first time running Phase 1:
- Clone the repo: `git clone https://github.com/leegmoore/rich.git`
- Navigate to project: `cd rich`
- Install dependencies: `cd rich-ts && npm install`

### 3. Development Standards:
- **Package Manager:** npm (not pnpm/bun)
- **TypeScript:** Strict mode, no `any` types allowed
- **Formatting:** Prettier handles ALL formatting (runs first in `npm run check`)
- **Linting:** ESLint for code quality ONLY (not formatting)
- **Tool Order:** Format → TypeCheck → Lint → Test (via `npm run check`)
- **Pre-commit:** Always run `npm run check` before committing
- **Naming:** Clear, descriptive names (no abbreviations like `clr`, `txt`)
- **Comments:** JSDoc for public APIs, inline comments for complex logic
- **Imports:** Use named imports, group by external/internal
- **Modern JS:** Use nullish coalescing (`??`) and optional chaining (`?.`) where appropriate

### 4. Pick your target module(s):
Based on logs, identify which Phase 1 modules are NOT_STARTED or IN_PROGRESS.

**Phase 1 modules (no dependencies, can be done in parallel):**
- `color_triplet` - Simplest, start here (~30 LOC, 3 tests)
- `errors` - Trivial (~50 LOC, minimal tests)
- `cells` - Medium complexity (~200 LOC, 8 tests, Unicode tables)
- `color` - Most complex (~500 LOC, 17 tests, depends on color_triplet)

**For parallel work:** Do all 4 modules in one session (start with color_triplet and errors first, then cells, then color).

---

## 🎯 YOUR TASK

Port all Phase 1 modules using Test-Driven Development:

**For EACH module:**

### Step 1: Read Source Materials
- Read the Python source file: `rich/[MODULE].py`
- Read the Python test file: `tests/test_[MODULE].py`
- Understand the module's purpose and API

### Step 2: Port Tests FIRST
- Create `rich-ts/tests/[MODULE].test.ts`
- Convert ALL Python tests to TypeScript/Vitest format
- Use the conversion guide below
- Import the (not yet existing) module
- Run tests from rich-ts/: `npm test [MODULE]` - they should FAIL with import errors

### Step 3: Implement Module
- Create `rich-ts/src/[MODULE].ts`
- Implement the module piece by piece
- Run tests frequently from rich-ts/: `npm test [MODULE]`
- Continue until ALL tests pass

### Step 4: Run Quality Checks
- Run all checks: `npm run check` (format + typecheck + lint + test - must pass!)
- This runs Prettier (formatting), TypeScript (type checking), ESLint (code quality), and Vitest (tests)

### Step 5: Commit and Push
- Stage all changes: `git add -A`
- Commit with message: `git commit -m "Port [MODULE] module with tests"`
- Push to remote: `git push`

### Step 6: Update Logs
- Update the module's PORT_LOG file (in rich-ts/) with:
  - Status change (IN_PROGRESS → TESTS_COMPLETE → DONE)
  - Test checklist updates
  - Implementation progress
  - Design decisions made
  - Session notes with timestamp
- Update rich-ts/PORT_LOG_MASTER.md with module status

---

## 📚 PYTHON → TYPESCRIPT CONVERSION GUIDE

### Test Framework Conversion

```python
# PYTHON (pytest)
import pytest
from rich.color import Color

def test_something():
    color = Color.parse("red")
    assert color.name == "red"
    assert color.number == 1
    
def test_raises():
    with pytest.raises(ValueError):
        Color.parse("invalid")
```

```typescript
// TYPESCRIPT (Vitest)
import { describe, it, expect } from 'vitest';
import { Color } from '../src/color';

describe('Color', () => {
  it('test_something', () => {
    const color = Color.parse('red');
    expect(color.name).toBe('red');
    expect(color.number).toBe(1);
  });
  
  it('test_raises', () => {
    expect(() => Color.parse('invalid')).toThrow(ValueError);
  });
});
```

### Common Patterns

```python
# Python dataclass
from dataclasses import dataclass

@dataclass
class ColorTriplet:
    red: int
    green: int
    blue: int
    
    @property
    def hex(self) -> str:
        return f"#{self.red:02x}{self.green:02x}{self.blue:02x}"
```

```typescript
// TypeScript class
export class ColorTriplet {
  constructor(
    public readonly red: number,
    public readonly green: number,
    public readonly blue: number
  ) {
    if (red < 0 || red > 255) throw new Error('red must be 0-255');
    if (green < 0 || green > 255) throw new Error('green must be 0-255');
    if (blue < 0 || blue > 255) throw new Error('blue must be 0-255');
  }
  
  get hex(): string {
    return `#${this.red.toString(16).padStart(2, '0')}${this.green.toString(16).padStart(2, '0')}${this.blue.toString(16).padStart(2, '0')}`;
  }
}
```

```python
# Python NamedTuple
from typing import NamedTuple

class Point(NamedTuple):
    x: int
    y: int
```

```typescript
// TypeScript readonly object type
export type Point = {
  readonly x: number;
  readonly y: number;
};
```

```python
# Python @lru_cache
from functools import lru_cache

@lru_cache(maxsize=128)
def expensive_function(x: int) -> int:
    return x * x
```

```typescript
// TypeScript manual memoization
const cache = new Map<number, number>();

function expensiveFunction(x: number): number {
  if (cache.has(x)) return cache.get(x)!;
  const result = x * x;
  cache.set(x, result);
  return result;
}
```

```python
# Python Optional/Union types
from typing import Optional, Union

def foo(x: Optional[str]) -> Union[int, str]:
    pass
```

```typescript
// TypeScript union types
function foo(x: string | undefined): number | string {
  // ...
}
```

### Assertion Conversions

| Python | TypeScript (Vitest) |
|--------|---------------------|
| `assert x == y` | `expect(x).toBe(y)` |
| `assert x != y` | `expect(x).not.toBe(y)` |
| `assert x is True` | `expect(x).toBe(true)` |
| `assert x is None` | `expect(x).toBeUndefined()` |
| `assert "foo" in x` | `expect(x).toContain('foo')` |
| `assert isinstance(x, Color)` | `expect(x).toBeInstanceOf(Color)` |
| `pytest.raises(Error)` | `expect(() => ...).toThrow(Error)` |

---

## 📝 MODULE-SPECIFIC NOTES

### color_triplet
- Very simple, just RGB data class
- No dependencies
- Should take ~15 minutes

### errors  
- Just error class definitions
- Extend Error properly in TypeScript
- Should take ~10 minutes

### cells
- **Important:** Unicode width tables needed
- Copy tables from Python `_cell_widths.py`
- May need `String.fromCodePoint()` for Unicode handling
- Caching important for performance
- Should take ~45 minutes

### color
- **Dependency:** Needs color_triplet complete first
- Named colors: copy X11 color table from Python
- Hex parsing: use regex or manual parsing
- RGB parsing: regex like `/rgb\((\d+),\s*(\d+),\s*(\d+)\)/`
- Most complex of Phase 1
- Should take ~1 hour

---

## ✅ SUCCESS CRITERIA

For Phase 1 to be COMPLETE:

- [ ] All 4 modules have tests ported
- [ ] All 4 modules have implementations
- [ ] `npm test` passes with 0 failures
- [ ] All module PORT_LOG files updated to status DONE
- [ ] PORT_LOG_MASTER.md shows Phase 1 complete
- [ ] No TypeScript errors: `npm run typecheck` passes
- [ ] Code follows TypeScript strict mode (no `any` types)

---

## 🚀 RECOMMENDED WORK ORDER

**Option A: Sequential (if doing solo)**
1. color_triplet (easy warm-up)
2. errors (trivial)
3. cells (Unicode tables)
4. color (uses color_triplet)

**Option B: Parallel (if running multiple sessions)**
- Session 1: color_triplet + errors (independent)
- Session 2: cells (independent)
- Session 3: color (waits for color_triplet from Session 1)

**Option C: All in one session (recommended)**
Do all 4 in order A above in a single session. Total time: ~2-3 hours.

---

## 🎬 ACTION: START NOW

1. **Read logs** (listed at top)
2. **Claim module(s)** in PORT_LOG_MASTER.md if doing parallel work
3. **Start with color_triplet** (simplest)
4. Follow the 4-step process above
5. Update logs as you go
6. Move to next module
7. When Phase 1 complete, update master log and STOP

---

## 💾 END OF SESSION

Before ending your session, make sure:
- All module logs updated with progress
- PORT_LOG_MASTER.md updated
- Session notes added with timestamp
- Next steps clearly documented

This allows the next session to pick up seamlessly!

---

**Remember:** Tests first, implementation second. Update logs throughout. You've got this! 🚀

