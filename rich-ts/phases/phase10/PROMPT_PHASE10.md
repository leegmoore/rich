# PHASE 10 PORTING PROMPT - Rich TypeScript

**Use this prompt at the start of each fresh Claude Code Web session to continue Phase 10 work.**

---

## 🎯 PROJECT OVERVIEW

**What is Rich?**
Rich is a popular Python library (70+ modules, 26K+ LOC) for rendering beautiful text, tables, progress bars, syntax highlighting, and more to the terminal. It's used by thousands of projects.

**What are we doing?**
Porting **ALL OF RICH** to TypeScript for use in Node.js and browser environments. We're implementing from scratch (no external dependencies for core features).

**Your Role:**
You're a TypeScript developer using Test-Driven Development (TDD) to port Python code. Port tests first, then implement code to pass those tests. Use logs to track progress across stateless sessions.

**Project Stats:**
- Python Source: ~26,274 LOC across 78 modules
- Python Tests: ~10,719 LOC (668 test functions)
- Target: 63 modules (excluding 15 Python-specific modules)
- Phases 1-7: 19 modules COMPLETE ✅
- Phases 10-15: 30 modules REMAINING

---

## 📋 PHASE 10 OVERVIEW

**Goal:** Port 5 standalone foundation helper modules that have NO dependencies.

**Modules:**
1. **_timer** - Performance timer utility (~19 LOC, ~5 tests)
2. **region** - Region math (x, y, width, height) (~10 LOC, ~5 tests)
3. **filesize** - File size formatting (~88 LOC, ~10 tests)
4. **abc** - Abstract base class helper (~33 LOC, ~3 tests)
5. **pager** - Abstract pager base class (~34 LOC, ~5 tests)

**Total:** ~184 LOC, ~28 tests

**Why these first?** They're all standalone - NO dependencies on each other or on anything else. Perfect for parallel execution. Quick wins to establish foundation for remaining phases.

**Success Criteria:**
- All 5 modules have TypeScript tests
- All tests pass
- All code follows TypeScript strict mode (no `any` types)
- Code is formatted (Prettier) and linted (ESLint)
- `npm run check` passes for all modules
- Progress logged in PORT_LOG files
- All changes staged with `git add -A` (NOT committed)

---

## 📋 SESSION STARTUP INSTRUCTIONS

I'm continuing the Rich TypeScript port. This is **Phase 10: Foundation Helpers**.

### 1. First, read these logs to understand current status:
- Read `rich-ts/phases/REMAINING_MODULES.md` (what's left to port)
- Read `rich-ts/phases/COMPLETE_PORT_PLAN.md` (overall strategy)
- Read `rich-ts/phases/phase10/PORT_LOG_TIMER.md`
- Read `rich-ts/phases/phase10/PORT_LOG_REGION.md`
- Read `rich-ts/phases/phase10/PORT_LOG_FILESIZE.md`
- Read `rich-ts/phases/phase10/PORT_LOG_ABC.md`
- Read `rich-ts/phases/phase10/PORT_LOG_PAGER.md`
- Read `rich-ts/PROJECT_COMPLETE.md` (status of Phases 1-7)

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

### 3. Pick your target module(s):
Based on logs, identify which Phase 10 modules are NOT_STARTED or IN_PROGRESS.

**Phase 10 modules (ALL are standalone - no dependencies!):**
- `_timer` - Simplest (19 LOC, 5 tests)
- `region` - Trivial (10 LOC, 5 tests)
- `filesize` - Simple (88 LOC, 10 tests)
- `abc` - Trivial (33 LOC, 3 tests)
- `pager` - Simple (34 LOC, 5 tests)

**For parallel work:** All 5 can be done simultaneously by different agents!

---

## 🎯 YOUR TASK

Port Phase 10 modules using Test-Driven Development:

**For EACH module:**

### Step 1: Read Source Materials
- Read the Python source file: `rich/[MODULE].py`
- Read the Python test file: `tests/test_[MODULE].py` (if exists)
- Understand the module's purpose and API

### Step 2: Port Tests FIRST
- Create `rich-ts/tests/[MODULE].test.ts`
- Convert ALL Python tests to TypeScript/Vitest format
- Use the conversion guide below
- Import the (not yet existing) module
- Run tests from rich-ts/: `npm test [MODULE] -- --run` - they should FAIL with import errors

### Step 3: Implement Module
- Create `rich-ts/src/[MODULE].ts`
- Implement the module piece by piece
- Run tests frequently from rich-ts/: `npm test [MODULE] -- --run`
- Continue until ALL tests pass

### Step 4: Run Quality Checks
- Run all checks: `npm run check` (format + typecheck + lint + test - must pass!)
- This runs Prettier (formatting), TypeScript (type checking), ESLint (code quality), and Vitest (tests)

### Step 5: Stage Changes (DO NOT COMMIT!)
- Stage all changes: `git add -A`
- **DO NOT** commit or push yet
- Leave staged for review

### Step 6: Update Logs
- Update the module's PORT_LOG file (in `rich-ts/phases/phase10/`) with:
  - Status change (NOT_STARTED → IN_PROGRESS → TESTS_COMPLETE → DONE)
  - Test checklist updates
  - Implementation progress
  - Design decisions made
  - Session notes with timestamp
- Update `rich-ts/phases/COMPLETE_PORT_PLAN.md` with module status
- If bugs found: Add to `rich-ts/KNOWN_BUGS.md` (create if doesn't exist)

---

## 📚 PYTHON → TYPESCRIPT CONVERSION GUIDE

### Test Framework Conversion

```python
# PYTHON (pytest)
import pytest
from rich._timer import Timer

def test_timer():
    timer = Timer()
    timer.start()
    timer.stop()
    assert timer.elapsed > 0
    
def test_raises():
    with pytest.raises(ValueError):
        something_invalid()
```

```typescript
// TYPESCRIPT (Vitest)
import { describe, it, expect } from 'vitest';
import { Timer } from '../src/_timer.js';

describe('_timer', () => {
  it('test_timer', () => {
    const timer = new Timer();
    timer.start();
    timer.stop();
    expect(timer.elapsed).toBeGreaterThan(0);
  });
  
  it('test_raises', () => {
    expect(() => somethingInvalid()).toThrow(ValueError);
  });
});
```

### Common Patterns

```python
# Python NamedTuple
from typing import NamedTuple

class Region(NamedTuple):
    x: int
    y: int
    width: int
    height: int
```

```typescript
// TypeScript interface or type
export interface Region {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

// Or as a class if methods needed
export class Region {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly width: number,
    public readonly height: number
  ) {}
  
  get area(): number {
    return this.width * this.height;
  }
}
```

```python
# Python context manager
from contextlib import contextmanager

@contextmanager
def timer():
    start = time()
    yield
    print(f"Elapsed: {time() - start}")
```

```typescript
// TypeScript class with try/finally pattern
export class Timer {
  private startTime?: number;
  private endTime?: number;
  
  start(): void {
    this.startTime = Date.now();
  }
  
  stop(): number {
    this.endTime = Date.now();
    return this.elapsed;
  }
  
  get elapsed(): number {
    if (!this.startTime) return 0;
    const end = this.endTime ?? Date.now();
    return (end - this.startTime) / 1000; // seconds
  }
}
```

### Assertion Conversions

| Python | TypeScript (Vitest) |
|--------|---------------------|
| `assert x == y` | `expect(x).toBe(y)` |
| `assert x != y` | `expect(x).not.toBe(y)` |
| `assert x > y` | `expect(x).toBeGreaterThan(y)` |
| `assert x >= y` | `expect(x).toBeGreaterThanOrEqual(y)` |
| `assert x in list` | `expect(list).toContain(x)` |
| `assert len(x) == 5` | `expect(x).toHaveLength(5)` |
| `assert x is True` | `expect(x).toBe(true)` |
| `assert x is None` | `expect(x).toBeUndefined()` |
| `pytest.raises(Error)` | `expect(() => ...).toThrow(Error)` |

---

## 📝 MODULE-SPECIFIC NOTES

### _timer (19 LOC)
**Purpose:** Performance timing utility for measuring operation duration

**Python Source:** `rich/_timer.py`  
**Key Features:**
- Context manager for timing blocks
- Start/stop methods
- Elapsed time calculation

**TypeScript Notes:**
- Use `Date.now()` for millisecond precision
- Or `performance.now()` for higher precision
- Convert Python context manager to class with start/stop
- ~15 minutes

### region (10 LOC)
**Purpose:** Region math - represents rectangular area (x, y, width, height)

**Python Source:** `rich/region.py`  
**Key Features:**
- NamedTuple with x, y, width, height
- Simple data container
- No methods, just data

**TypeScript Notes:**
- Use interface or readonly type
- Or class if you add area/contains methods
- Very simple
- ~10 minutes

### filesize (88 LOC)
**Purpose:** Format file sizes in human-readable format (bytes, KB, MB, etc.)

**Python Source:** `rich/filesize.py`  
**Key Features:**
- Format bytes to human readable (1024 → "1.0 KB")
- Decimal vs binary units (KB vs KiB)
- Precision control

**TypeScript Notes:**
- Math.log for unit calculation
- Number formatting with toFixed()
- Unit arrays for lookup
- ~30 minutes

### abc (33 LOC)
**Purpose:** Abstract base class helper

**Python Source:** `rich/abc.py`  
**Key Features:**
- RichRenderable abstract base
- Protocol definition

**TypeScript Notes:**
- Use abstract class or interface
- Define __richConsole__ signature
- Very simple
- ~15 minutes

### pager (34 LOC)
**Purpose:** Abstract pager base class

**Python Source:** `rich/pager.py`  
**Key Features:**
- Pager abstract class
- show() method signature

**TypeScript Notes:**
- Abstract class with abstract methods
- SystemPager and other implementations come later
- Just the base class
- ~15 minutes

---

## ⚠️ IMPORTANT NOTES

**These are ALL Simple:**
- Smallest modules in the entire port
- No complex algorithms
- No dependencies
- Perfect for quick wins
- Don't overthink them!

**Testing:**
- Run `npm test -- --run` to avoid watch mode hanging
- Run specific module tests: `npm test _timer -- --run`
- All tests should pass easily

**Parallel Execution:**
- ALL 5 modules are completely independent
- Can be done by 5 different agents simultaneously
- Or 1 agent can do all 5 in sequence (~2 hours)

---

## ✅ SUCCESS CRITERIA

For Phase 10 to be COMPLETE:

- [ ] All 5 modules have TypeScript tests
- [ ] All tests pass
- [ ] `npm run check` passes for all modules
- [ ] All module PORT_LOG files updated to status DONE
- [ ] `phases/COMPLETE_PORT_PLAN.md` shows Phase 10 complete
- [ ] Code follows TypeScript strict mode (no `any` types)

---

## 🚀 RECOMMENDED WORK ORDER

**Option A: By Size (Solo Agent)**
1. region (10 LOC - 10 min)
2. _timer (19 LOC - 15 min)
3. abc (33 LOC - 15 min)
4. pager (34 LOC - 15 min)
5. filesize (88 LOC - 30 min)

**Total: ~85 minutes**

**Option B: All in Parallel (5 Agents)**
- Agent A: _timer
- Agent B: region
- Agent C: filesize
- Agent D: abc
- Agent E: pager

**Actual time: ~30 minutes (longest module)**

**Option C: Random Order**
- They're all independent
- Pick any order you want!

---

## 🎬 ACTION: START NOW

1. **Read logs** (listed at top)
2. **Check Phase 1-7 status** (should be 19 modules complete)
3. **Pick a module** (or claim multiple for parallel work)
4. Follow the 6-step TDD process above
5. Update logs as you go
6. Move to next module
7. When all 5 complete, update master plan and mark Phase 10 DONE

---

## 💾 END OF SESSION

Before ending your session, make sure:
- All module logs updated with progress
- COMPLETE_PORT_PLAN.md shows Phase 10 status
- Session notes added with timestamp
- Next steps clearly documented (Phase 11 next)

This allows Phase 11 to pick up seamlessly!

---

**Remember:** Tests first, implementation second. These are TINY modules - build momentum! After Phase 10, we move to palette system (Phase 11), then ANSI (Phase 12) which unblocks 34 tests! 🚀

