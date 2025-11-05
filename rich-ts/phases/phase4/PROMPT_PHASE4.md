# PHASE 4 PORTING PROMPT - Rich TypeScript

**Use this prompt at the start of each fresh Claude Code Web session to continue Phase 4 work.**

---

## 🎯 PROJECT OVERVIEW

**What is Rich?**
Rich is a popular Python library (70+ modules, 26K+ LOC) for rendering beautiful text, tables, progress bars, syntax highlighting, and more to the terminal. It's used by thousands of projects.

**What are we doing?**
Porting Rich's **core features** to TypeScript for use in Node.js and browser environments. We're implementing from scratch (no external dependencies for core features).

**Your Role:**
You're a TypeScript developer using Test-Driven Development (TDD) to port Python code. Port tests first, then implement code to pass those tests. Use logs to track progress across stateless sessions.

---

## 📋 PHASE 4 OVERVIEW

**Goal:** Port 3 simple formatting modules - quick wins!

**Modules:**
1. **padding** - Add padding/margins (~100 LOC, ~11 tests) - DEPENDS ON: console, measure
2. **rule** - Horizontal lines (~130 LOC, ~7 tests) - DEPENDS ON: console, text, style
3. **columns** - Multi-column layouts (~130 LOC, ~6 tests) - DEPENDS ON: console, measure

**Total:** ~360 LOC, ~24 tests

**Why these modules?** They're simple, useful formatting utilities. All dependencies (console, text, measure) are complete from Phase 3. These are quick wins to build momentum before tackling the complex modules in Phase 5 & 6.

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

I'm continuing the Rich TypeScript port. This is **Phase 4: Simple Formatting**.

### 1. First, read these logs to understand current status:
- Read `rich-ts/PORT_LOG_MASTER.md` 
- Read `rich-ts/phases/phase4/PORT_LOG_PADDING.md`
- Read `rich-ts/phases/phase4/PORT_LOG_RULE.md`
- Read `rich-ts/phases/phase4/PORT_LOG_COLUMNS.md`
- Read `rich-ts/KNOWN_BUGS.md` (current bugs)

### 2. Development Standards:
- **Package Manager:** npm (not pnpm/bun)
- **TypeScript:** Strict mode, no `any` types allowed
- **Formatting:** Prettier handles ALL formatting (runs first in `npm run check`)
- **Linting:** ESLint for code quality ONLY (not formatting)
- **Tool Order:** Format → TypeCheck → Lint → Test (via `npm run check`)
- **Pre-commit:** Always run `npm run check` before committing
- **Naming:** Clear, descriptive names (no abbreviations like `pd`, `rl`)
- **Comments:** JSDoc for public APIs, inline comments for complex logic
- **Imports:** Use named imports, group by external/internal
- **Modern JS:** Use nullish coalescing (`??`) and optional chaining (`?.`) where appropriate

### 3. Pick your target module:
Based on logs, identify which Phase 4 modules are NOT_STARTED or IN_PROGRESS.

**Phase 4 modules:**
- `padding` - Can start immediately (console + measure from Phase 3 done)
- `rule` - Can start immediately (console + text + style done)
- `columns` - Can start immediately (console + measure from Phase 3 done)

**All can be done in parallel!** Pick any order.

---

## 🎯 YOUR TASK

Port all Phase 4 modules using Test-Driven Development:

**For EACH module:**

### Step 1: Read Source Materials
- Read the Python source file: `rich/[MODULE].py`
- Read the Python test file: `tests/test_[MODULE].py`
- Understand the module's purpose and API

### Step 2: Port Tests FIRST
- Create `rich-ts/tests/[MODULE].test.ts`
- Convert ALL Python tests to TypeScript/Vitest format
- Use the conversion guide from Phase 1/2/3 prompts
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
- Update the module's PORT_LOG file (in rich-ts/phases/phase4/) with:
  - Status change (IN_PROGRESS → TESTS_COMPLETE → DONE)
  - Test checklist updates
  - Implementation progress
  - Design decisions made
  - Session notes with timestamp
- Update rich-ts/PORT_LOG_MASTER.md with module status
- If bugs found: Add to KNOWN_BUGS.md (don't fix unless critical)

---

## 📝 MODULE-SPECIFIC NOTES

### padding
- Simple utility class
- PaddingDimensions type (int or tuple)
- Unpack utility to normalize dimensions
- Wraps renderables with space
- Quick win!

### rule
- Horizontal lines across console
- Optional title with alignment
- Custom characters supported
- Straightforward implementation
- Another quick win!

### columns
- Multi-column layout
- Simple algorithm: measure, distribute, render
- Auto-sizing logic
- Clean and simple
- Third quick win!

---

## ⚠️ IMPORTANT NOTES

**These are SIMPLE modules:**
- Don't overthink them
- Each should take less than an hour
- All dependencies are ready from Phase 3
- Focus on getting tests passing

**Testing:**
- Run `npm test -- --run` to avoid watch mode hanging
- Run specific module tests: `npm test padding`
- Some tests may need to be skipped initially

**Bug Tracking:**
- If you find bugs, add them to KNOWN_BUGS.md
- Don't fix bugs unless critical
- We'll do a bug pass after Phase 6

---

## ✅ SUCCESS CRITERIA

For Phase 4 to be COMPLETE:

- [ ] All 3 modules have TypeScript tests
- [ ] All tests pass (or bugs documented)
- [ ] `npm run check` passes for all modules
- [ ] All module PORT_LOG files updated to status DONE
- [ ] PORT_LOG_MASTER.md shows Phase 4 complete
- [ ] Code follows TypeScript strict mode (no `any` types)

---

## 🚀 RECOMMENDED WORK ORDER

**Option A: Sequential**
1. padding (simplest)
2. rule (simple)
3. columns (simple)

**Option B: Parallel**
- All three can be done simultaneously
- No interdependencies
- Perfect for parallel agents

**Option C: Pick your favorite**
- They're all simple
- Start with whichever interests you

---

## 🎬 ACTION: START NOW

1. **Read logs** (listed at top)
2. **Review Phase 3 completion** (console, text, measure done)
3. **Pick a module** (padding, rule, or columns)
4. Follow the 6-step process above
5. Update logs as you go
6. Move to next module
7. When all 3 complete, update master log and STOP

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

**Remember:** Tests first, implementation second. These are SIMPLE modules - have fun and build momentum! 🚀

