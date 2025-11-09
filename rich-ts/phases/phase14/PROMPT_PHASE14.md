===== PHASE 14: ADVANCED COMPONENTS =====

**ROLE:** TypeScript developer porting Rich Python library to TypeScript

**PHASE:** 14 - Advanced Components (6 modules, ~2,691 LOC)  
**DEPENDENCY:** Phase 13 complete  
**STATUS:** Ready to port

**MODULES (4 parallel, then live, then status):**
1. **tree** (257 LOC) - Tree component [PARALLEL]
2. **syntax** (985 LOC) - Syntax highlighting [PARALLEL - LARGE!]
3. **markdown** (779 LOC) - Markdown renderer [PARALLEL - LARGE!]
4. **json** (139 LOC) - JSON pretty printer [PARALLEL]
5. **live** (400 LOC) - Live display [DO 5th - needs screen, file_proxy, live_render]
6. **status** (131 LOC) - Status component [DO 6th - needs live, spinner]

**EXECUTION:** 4 parallel → live → status

**WORKFLOW:** TDD → npm run check → git add -A (STAGE ONLY - no commit!)

**NOTE:** syntax and markdown may need npm packages (lexer, markdown-it)

---

# PHASE 14 PORTING PROMPT - Rich TypeScript

**Use this prompt at the start of each fresh Claude Code Web session to continue Phase 14 work.**

---

## 🎯 PROJECT OVERVIEW

**What is Rich?**
Rich is a popular Python library (70+ modules, 26K+ LOC) for rendering beautiful text, tables, progress bars, syntax highlighting, and more to the terminal.

**What are we doing?**
Porting **ALL OF RICH** to TypeScript.

**Progress:**
- Phases 1-7: 19 modules ✅
- Phase 10: 5 modules ✅ (foundation helpers)
- Phase 11: 3 modules ✅ (palette system)
- Phase 12: 6 modules ✅ (ansi + helpers)
- Phase 13: 5 modules ✅ (progress bar components)
- Phase 14: 6 modules TO DO (**ADVANCED COMPONENTS!**)
- Remaining: Phase 15 (5 modules including main progress!)

---

## 📋 PHASE 14 OVERVIEW

**Goal:** Port 6 advanced component modules - syntax highlighting, markdown, json, tree, live displays!

**Modules:**
1. **tree** - Tree component (~257 LOC, ~20 tests) - DEPENDS ON: console ✅, segment ✅, styled ✅ [PARALLEL]
2. **syntax** - Syntax highlighting (~985 LOC, ~60 tests) - DEPENDS ON: console ✅, text ✅, highlighter ✅, containers ✅ [PARALLEL]
3. **markdown** - Markdown renderer (~779 LOC, ~30 tests) - DEPENDS ON: console ✅, text ✅, table ✅, containers ✅ [PARALLEL]
4. **json** - JSON pretty printer (~139 LOC, ~3 tests) - DEPENDS ON: text ✅, highlighter ✅, console ✅ [PARALLEL]
5. **live** - Live display system (~400 LOC, ~25 tests) - DEPENDS ON: console ✅, control ✅, screen ✅, file_proxy ✅, live_render ✅ [DO 5th]
6. **status** - Status component (~131 LOC, ~8 tests) - DEPENDS ON: console ✅, live, spinner ✅ [DO 6th - after live]

**Total:** ~2,691 LOC, ~146 tests

**Parallelization Strategy:**
- Modules 1-4 (tree, syntax, markdown, json) can run in PARALLEL
- Module 5 (live) must wait for modules 1-4 (uses screen, file_proxy, live_render)
- Module 6 (status) must wait for module 5 (uses live)

**Why this phase?** These are major Rich features - syntax highlighting, markdown rendering, tree visualization, live updating displays!

**Success Criteria:**
- All 6 modules ported
- All tests pass
- TypeScript strict mode
- `npm run check` passes
- Progress logged
- Code committed

---

## 📋 SESSION STARTUP INSTRUCTIONS

I'm continuing the Rich TypeScript port. This is **Phase 14: Advanced Components**.

### 1. First, read these logs:
- Read `rich-ts/phases/COMPLETE_PORT_PLAN.md`
- Read `rich-ts/phases/phase14/PORT_LOG_TREE.md`
- Read `rich-ts/phases/phase14/PORT_LOG_SYNTAX.md`
- Read `rich-ts/phases/phase14/PORT_LOG_MARKDOWN.md`
- Read `rich-ts/phases/phase14/PORT_LOG_JSON.md`
- Read `rich-ts/phases/phase14/PORT_LOG_LIVE.md`
- Read `rich-ts/phases/phase14/PORT_LOG_STATUS.md`

### 2. Verify Phase 13 Complete:
- [ ] progress_bar.ts exists
- [ ] bar.ts exists and tests pass
- [ ] live_render.ts exists and tests pass
- [ ] _spinners.ts exists (data file)
- [ ] spinner.ts exists and tests pass

### 3. Development Standards:
- npm (not pnpm/bun)
- TypeScript strict mode (no `any`)
- Prettier formatting
- ESLint for quality
- `npm run check` before commit
- Clear names, JSDoc
- Use `??` and `?.`

---

## 🎯 YOUR TASK

Port Phase 14 modules using Test-Driven Development:

**MODULE ORDER:**
- **First 4:** tree, syntax, markdown, json (can be done in any order)
- **5th:** live (needs screen, file_proxy, live_render from earlier phases)
- **6th:** status (needs live from this phase)

**RECOMMENDED SEQUENCE (for single agent):**
1. json (139 LOC - quick win warm-up)
2. tree (257 LOC)
3. markdown (779 LOC - large, needs markdown-it)
4. syntax (985 LOC - largest, may need lexer)
5. live (400 LOC - after 1-4)
6. status (131 LOC - after live)

**For EACH module in order:**

### Step 1: Read Source Materials
- Read Python source: `rich/[MODULE].py`
- Read Python tests: `tests/test_[MODULE].py`
- Understand purpose and API

### Step 2: Port Tests FIRST
- Create `rich-ts/tests/[MODULE].test.ts`
- Convert ALL Python tests to TypeScript/Vitest
- Import the (not yet existing) module
- Run tests: `npm test [MODULE] -- --run` (should FAIL)

### Step 3: Implement Module
- Create `rich-ts/src/[MODULE].ts`
- Implement piece by piece
- Run tests frequently: `npm test [MODULE] -- --run`
- Continue until ALL tests pass

### Step 4: Run Quality Checks (ALL THREE MUST PASS!)

**Run checks individually first:**
```bash
cd rich-ts
npm test [MODULE] -- --run    # Must pass
npm run typecheck              # Must pass (0 errors)
npm run lint                   # Must pass (0 errors, warnings OK)
```

**If ANY fail, fix and re-run ALL THREE** (fixing one can break another)

**Then run full check:**
```bash
npm run check  # Must complete with 0 errors
```

**CRITICAL:** Do not proceed to Step 5 until:
- ✅ Tests pass
- ✅ TypeScript compiles (0 errors)
- ✅ ESLint shows 0 errors (warnings for non-null assertions OK)

If you fix a test and it breaks TypeScript, fix TypeScript and re-run tests!
If you fix lint and it breaks tests, fix tests and re-run lint!

**All 3 must pass together in sequence before staging!**

### Step 5: Stage Changes (DO NOT COMMIT!)
- Stage all changes: `git add -A`
- **DO NOT** commit or push yet
- Leave staged for code review

### Step 6: Update Logs
- Update `rich-ts/phases/phase14/PORT_LOG_[MODULE].md` to DONE
- Update `rich-ts/phases/COMPLETE_PORT_PLAN.md` with status
- Add session notes with timestamp

---

## 📝 MODULE-SPECIFIC NOTES

### tree (257 LOC) - PARALLEL GROUP 1
**Purpose:** Tree component for hierarchical displays

**Python Source:** `rich/tree.py`  
**Tests:** `tests/test_tree.py` (~20 tests)  
**Key Features:**
- Tree class for hierarchical rendering
- Add nodes with children
- Box characters for tree lines
- Style support for branches
- Guide lines (│ ├ └)

**TypeScript Notes:**
- Tree node structure
- Recursive rendering
- Uses styled component
- ~1 hour

---

### syntax (985 LOC) - PARALLEL GROUP 1 ⚠️ LARGE!
**Purpose:** Syntax highlighting engine

**Python Source:** `rich/syntax.py`  
**Tests:** `tests/test_syntax.py` (~60 tests)  
**Key Features:**
- Syntax class for code syntax highlighting
- Lexer integration (pygments in Python)
- Line numbers, theme support
- Many language support
- **NOTE:** May need external lexer library or basic implementation

**TypeScript Notes:**
- **COMPLEX MODULE** - largest in Phase 14
- May need npm package for lexing (check Python implementation)
- Or implement basic lexer for common languages
- ~3-4 hours

**IMPORTANT:** Check if Python uses pygments - if so, may need to adapt approach or use TS alternative

---

### markdown (779 LOC) - PARALLEL GROUP 1 ⚠️ LARGE!
**Purpose:** Markdown renderer

**Python Source:** `rich/markdown.py`  
**Tests:** `tests/test_markdown.py` (~30 tests)  
**Key Features:**
- Markdown class for rendering markdown to Rich output
- Uses markdown-it-py in Python for parsing
- Renders to Tables, Text, and other Rich components
- Headings, lists, code blocks, links, etc.

**TypeScript Notes:**
- **COMPLEX MODULE**
- Needs markdown parser (markdown-it available in npm!)
- May need `npm install markdown-it @types/markdown-it`
- Rendering markdown AST to Rich components
- ~2-3 hours

**DEPENDENCY NOTE:** May need to allow `markdown-it` npm package for parsing

---

### json (139 LOC) - PARALLEL GROUP 1
**Purpose:** JSON pretty printer

**Python Source:** `rich/json.py`  
**Tests:** `tests/test_json.py` (~3 tests)  
**Key Features:**
- JSON class for pretty-printing JSON
- Uses JSONHighlighter for syntax coloring
- Indentation control
- Simple wrapper around JSON.parse + highlighting

**TypeScript Notes:**
- Use JSON.parse() (built-in)
- Apply JSONHighlighter
- Render to Text
- ~30 minutes

---

### live (400 LOC) - DO 5TH (after group 1)
**Purpose:** Live display system for updating content in place

**Python Source:** `rich/live.py`  
**Tests:** `tests/test_live.py` (~25 tests)  
**Key Features:**
- Live class for context-managed live displays
- Auto-refresh functionality
- Console redirection
- Uses Screen for buffering
- Uses LiveRender for positioning
- Threading for auto-refresh

**TypeScript Notes:**
- Context manager → class with start()/stop()
- Threading → setInterval() for auto-refresh
- Screen buffer management
- ~1.5-2 hours

---

### status (131 LOC) - DO 6TH (after live)
**Purpose:** Status indicator with spinner

**Python Source:** `rich/status.py`  
**Tests:** `tests/test_status.py` (~8 tests)  
**Key Features:**
- Status class combining spinner + status text
- Uses Live for display
- Context manager for status display
- Simple wrapper around Live + Spinner

**TypeScript Notes:**
- Wraps Live and Spinner
- Simple implementation
- ~30 minutes

---

## ⚠️ IMPORTANT NOTES

**Large Modules:**
- **syntax** (985 LOC) and **markdown** (779 LOC) are LARGE
- Budget 2-4 hours each
- May need external npm packages (check Python dependencies)

**External Dependencies:**
- **syntax:** Python uses pygments - may need npm lexer library
- **markdown:** Python uses markdown-it-py - npm has markdown-it ✅
- Document any npm packages added!

**Sequential Constraint:**
- tree, syntax, markdown, json: ALL PARALLEL
- live: After group 1 (needs screen, file_proxy, live_render from Phase 12-13)
- status: After live

**Parallelization:**
- 4 agents for group 1 (tree, syntax, markdown, json)
- 1 agent for live
- 1 agent for status
- OR 1-2 agents sequentially

---

## ✅ SUCCESS CRITERIA

For Phase 14 to be COMPLETE:

- [ ] All 6 modules ported
- [ ] All tests pass
- [ ] `npm run check` passes
- [ ] All PORT_LOG files updated to DONE
- [ ] COMPLETE_PORT_PLAN.md shows Phase 14 complete
- [ ] Any npm packages documented

---

## 🚀 RECOMMENDED WORK ORDER

**Option A: Parallel (4-6 Agents)**
- Agents A-D: tree, syntax, markdown, json (parallel, 2-4 hours)
- Agent E: live (after A-D, 2 hours)
- Agent F: status (after E, 30 min)

**Actual time: ~4-5 hours with coordination**

**Option B: Sequential (1-2 Agents)**
1. json (30 min) - warm up
2. tree (1 hour)
3. markdown (2-3 hours) - needs markdown-it
4. syntax (3-4 hours) - needs lexer
5. live (2 hours)
6. status (30 min)

**Total: ~9-11 hours**

---

## 🎬 ACTION: START NOW

1. **Read logs** (all 6 module logs)
2. **Verify Phase 13 complete** (progress bar components ✅)
3. **Start with group 1** (tree/syntax/markdown/json parallel)
4. **Then live** (after group 1)
5. **Finally status** (after live)
6. Update logs as you go
7. When all 6 complete, mark Phase 14 DONE

---

## 💾 END OF SESSION

Before ending:
- All module logs updated to DONE
- COMPLETE_PORT_PLAN.md shows Phase 14 status
- Document any npm packages added
- Session notes with timestamp
- Confirm Phase 15 is ready (last phase!)

---

## 🎯 WHAT'S NEXT

**After Phase 14:** Phase 15 - The FINAL phase with the main **progress** module! 🎉

**Remember:** syntax and markdown are LARGE - take your time! External dependencies may be needed (markdown-it for markdown, lexer for syntax).

