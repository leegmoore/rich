# PHASE 2 PORTING PROMPT - Rich TypeScript

**Use this prompt at the start of each fresh Claude Code Web session to continue Phase 2 work.**

---

## 🎯 PROJECT OVERVIEW

**What is Rich?**
Rich is a popular Python library (70+ modules, 26K+ LOC) for rendering beautiful text, tables, progress bars, syntax highlighting, and more to the terminal. It's used by thousands of projects.

**What are we doing?**
Porting Rich's **core features** to TypeScript for use in Node.js and browser environments. We're implementing from scratch (no external dependencies for core features).

**Your Role:**
You're a TypeScript developer using Test-Driven Development (TDD) to port Python code. Port tests first, then implement code to pass those tests. Use logs to track progress across stateless sessions.

---

## 📋 PHASE 2 OVERVIEW

**Goal:** Port 4 primitives modules that depend on Phase 1 foundation.

**Modules:**
1. **repr** - Rich repr protocol (~100 LOC, 8 tests, 30 min) - NO DEPENDENCIES
2. **control** - Terminal control codes (~100 LOC, 7 tests, 30 min) - NO DEPENDENCIES
3. **style** - Style system (~800 LOC, 27 tests, 2-3 hours) - DEPENDS ON: color, color_triplet, errors
4. **segment** - Text segments for rendering (~750 LOC, 29 tests, 2-3 hours) - DEPENDS ON: style, cells

**Why these next?** They build on Phase 1 and are needed for Phase 3 (text, console).

**Parallelization:**
- repr + control can be done in parallel (no dependencies)
- style needs Phase 1 modules (already complete)
- segment needs style (do after style)

**Success Criteria:**
- All 4 modules have TypeScript tests
- All tests pass (or documented bugs in KNOWN_BUGS.md)
- All code follows TypeScript strict mode (no `any` types)
- Code is formatted (Prettier) and linted (ESLint)
- `npm run check` passes for all modules
- Progress logged in PORT_LOG files
- Code committed to git

---

## 📋 SESSION STARTUP INSTRUCTIONS

I'm continuing the Rich TypeScript port. This is **Phase 2: Primitives Layer**.

### 1. First, read these logs to understand current status:
- Read `rich-ts/PORT_LOG_MASTER.md` 
- Read `rich-ts/PORT_LOG_REPR.md`
- Read `rich-ts/PORT_LOG_CONTROL.md`
- Read `rich-ts/PORT_LOG_STYLE.md`
- Read `rich-ts/PORT_LOG_SEGMENT.md`
- Read `rich-ts/KNOWN_BUGS.md` (current bugs)

### 2. Development Standards:
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

### 3. Pick your target module(s):
Based on logs, identify which Phase 2 modules are NOT_STARTED or IN_PROGRESS.

**Phase 2 modules:**
- `repr` - Can start immediately, no dependencies
- `control` - Can start immediately, no dependencies
- `style` - Can start immediately (Phase 1 complete)
- `segment` - Wait for style to complete

**Recommended order:** repr + control first (parallel), then style, then segment.

---

## 🎯 YOUR TASK

Port all Phase 2 modules using Test-Driven Development:

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
- If bugs found: Add to KNOWN_BUGS.md (don't fix unless critical)

---

## 📚 PYTHON → TYPESCRIPT CONVERSION GUIDE

*(Same as Phase 1 - see PROMPT_PHASE1.md for full guide)*

### Key Patterns

```typescript
// Python @dataclass
export class Style {
  constructor(
    public readonly color?: Color,
    public readonly bold?: boolean
  ) {}
}

// Python NamedTuple
export type Segment = {
  readonly text: string;
  readonly style?: Style;
  readonly control?: ControlCode;
};

// Python @lru_cache
const cache = new Map<string, Result>();
function memoized(key: string): Result {
  if (cache.has(key)) return cache.get(key)!;
  const result = expensiveOperation(key);
  cache.set(key, result);
  return result;
}
```

---

## 📝 MODULE-SPECIFIC NOTES

### repr
- Simple decorator/protocol system
- May use TypeScript decorators or functional approach
- ~30 minutes

### control  
- ANSI control code generation
- Straightforward enum + methods
- ~30 minutes

### style
- Most complex of Phase 2
- Style parsing and combination logic
- Style attributes as bit flags
- ~2-3 hours

### segment
- Core rendering primitive
- Uses style and cells
- Line operations and splitting
- ~2-3 hours

---

## ✅ SUCCESS CRITERIA

For Phase 2 to be COMPLETE:

- [ ] All 4 modules have TypeScript tests
- [ ] All tests pass (or bugs documented)
- [ ] `npm run check` passes for all modules
- [ ] All module PORT_LOG files updated to status DONE
- [ ] PORT_LOG_MASTER.md shows Phase 2 complete
- [ ] Code follows TypeScript strict mode (no `any` types)

---

## 🚀 RECOMMENDED WORK ORDER

**Option A: Sequential**
1. repr (easy warm-up)
2. control (easy)
3. style (complex, needed for segment)
4. segment (complex, needs style)

**Option B: Parallel (if running multiple sessions)**
- Session 1: repr
- Session 2: control
- Session 3: style (after repr/control)
- Session 4: segment (after style)

**Option C: All in one session (recommended)**
Do all 4 in order A above. Total time: ~6-8 hours.

---

## 🎬 ACTION: START NOW

1. **Read logs** (listed at top)
2. **Review Phase 1 results** (38/39 tests passing)
3. **Start with repr or control** (simplest, no dependencies)
4. Follow the 6-step process above
5. Update logs as you go
6. Move to next module
7. When Phase 2 complete, update master log and STOP

---

## 💾 END OF SESSION

Before ending your session, make sure:
- All module logs updated with progress
- PORT_LOG_MASTER.md updated
- KNOWN_BUGS.md updated if bugs found
- Session notes added with timestamp
- Next steps clearly documented

This allows the next session to pick up seamlessly!

---

**Remember:** Tests first, implementation second. Document bugs, don't fix unless critical. Update logs throughout. You've got this! 🚀

