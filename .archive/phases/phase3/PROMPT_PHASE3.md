# PHASE 3 PORTING PROMPT - Rich TypeScript

**Use this prompt at the start of each fresh Claude Code Web session to continue Phase 3 work.**

---

## 🎯 PROJECT OVERVIEW

**What is Rich?**
Rich is a popular Python library (70+ modules, 26K+ LOC) for rendering beautiful text, tables, progress bars, syntax highlighting, and more to the terminal. It's used by thousands of projects.

**What are we doing?**
Porting Rich's **core features** to TypeScript for use in Node.js and browser environments. We're implementing from scratch (no external dependencies for core features).

**Your Role:**
You're a TypeScript developer using Test-Driven Development (TDD) to port Python code. Port tests first, then implement code to pass those tests. Use logs to track progress across stateless sessions.

---

## 📋 PHASE 3 OVERVIEW

**Goal:** Port 3 core modules that form the heart of Rich rendering.

**Modules:**
1. **measure** - Measurement protocol (~100 LOC, 4 tests, 30 min) - DEPENDS ON: segment
2. **text** - Rich text class (~1500 LOC, 87 tests, 3-4 hours) - DEPENDS ON: style, segment
3. **console** - Core rendering engine (~2600 LOC, 96 tests, 4-6 hours) - DEPENDS ON: text, segment, style

**Total:** ~4200 LOC, 187 tests, estimated 8-12 hours

**Why these next?** These are the CORE of Rich. After these, you can render text, tables, progress bars, etc.

**Success Criteria:**
- All 3 modules have TypeScript tests
- All tests pass (or bugs documented in KNOWN_BUGS.md)
- All code follows TypeScript strict mode (no `any` types)
- Code is formatted (Prettier) and linted (ESLint)
- `npm run check` passes for all modules
- Progress logged in PORT_LOG files
- Code committed to git

---

## 📋 SESSION STARTUP INSTRUCTIONS

I'm continuing the Rich TypeScript port. This is **Phase 3: Core Layer**.

### 1. First, read these logs to understand current status:
- Read `rich-ts/PORT_LOG_MASTER.md` 
- Read `rich-ts/PORT_LOG_MEASURE.md`
- Read `rich-ts/PORT_LOG_TEXT.md`
- Read `rich-ts/PORT_LOG_CONSOLE.md`
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

### 3. Pick your target module:
Based on logs, identify which Phase 3 modules are NOT_STARTED or IN_PROGRESS.

**Phase 3 modules:**
- `measure` - Can start immediately (segment from Phase 2 done)
- `text` - Can start immediately (style + segment from Phase 2 done)
- `console` - Wait for text to complete

**Recommended order:** measure first (quick win), then text (large), then console (largest).

---

## 🎯 YOUR TASK

Port all Phase 3 modules using Test-Driven Development:

**For EACH module:**

### Step 1: Read Source Materials
- Read the Python source file: `rich/[MODULE].py`
- Read the Python test file: `tests/test_[MODULE].py`
- Understand the module's purpose and API

### Step 2: Port Tests FIRST
- Create `rich-ts/tests/[MODULE].test.ts`
- Convert ALL Python tests to TypeScript/Vitest format
- Use the conversion guide from Phase 1/2 prompts
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

## 📝 MODULE-SPECIFIC NOTES

### measure
- Simplest of Phase 3
- Measurement protocol for renderables
- Quick win to start the phase
- ~30 minutes

### text
- LARGE module (~1500 LOC, 87 tests)
- Core text handling with styling
- Many operations: split, join, wrap, justify, etc.
- Consider breaking into multiple sessions
- ~3-4 hours

### console
- LARGEST module (~2600 LOC, 96 tests)
- This is the HEART of Rich
- Rendering engine, color detection, exports
- Consider breaking into multiple sessions
- ~4-6 hours
- Depends on text being complete

---

## ⚠️ IMPORTANT NOTES

**Large Modules:**
- text and console are VERY large
- Don't try to do everything at once
- Break into logical sections
- Commit frequently
- Update logs as you go

**Testing:**
- Run `npm test -- --run` to avoid watch mode hanging
- Run specific module tests: `npm test text`
- Some tests may need to be skipped initially

**Bug Tracking:**
- If you find bugs, add them to KNOWN_BUGS.md
- Don't fix bugs unless critical
- We'll do a bug pass after Phase 4

---

## ✅ SUCCESS CRITERIA

For Phase 3 to be COMPLETE:

- [ ] All 3 modules have TypeScript tests
- [ ] All tests pass (or bugs documented)
- [ ] `npm run check` passes for all modules
- [ ] All module PORT_LOG files updated to status DONE
- [ ] PORT_LOG_MASTER.md shows Phase 3 complete
- [ ] Code follows TypeScript strict mode (no `any` types)

---

## 🚀 RECOMMENDED WORK ORDER

**Option A: Sequential**
1. measure (quick warm-up, 30 min)
2. text (large, 3-4 hours)
3. console (largest, 4-6 hours)

**Option B: Break into sessions**
- Session 1: measure
- Session 2: text (part 1 - basic operations)
- Session 3: text (part 2 - wrapping/justify)
- Session 4: console (part 1 - basic rendering)
- Session 5: console (part 2 - exports/capture)

---

## 🎬 ACTION: START NOW

1. **Read logs** (listed at top)
2. **Review Phase 1 & 2 results** (106/110 tests passing)
3. **Start with measure** (simplest)
4. Follow the 6-step process above
5. Update logs as you go
6. Move to next module
7. When Phase 3 complete, update master log and STOP

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

**Remember:** Tests first, implementation second. Document bugs, don't fix unless critical. Update logs throughout. Phase 3 is BIG - take your time! 🚀

