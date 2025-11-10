===== PHASE 15: FINAL COMPLEX SYSTEMS - THE LAST PHASE! =====

**ROLE:** TypeScript developer porting Rich Python library to TypeScript

**PHASE:** 15 - Final Complex Systems (6 modules, ~3,753 LOC) **FINAL PHASE!** 🎉  
**DEPENDENCY:** Phase 14 complete  
**STATUS:** Ready to port

**MODULES (ALL can run in PARALLEL!):**
1. **progress** (1,715 LOC) - Progress system [CRITICAL! ORIGINAL GOAL! HUGE!]
2. **pretty** (1,016 LOC) - Pretty printer [LARGE!]
3. **_log_render** (94 LOC) - Log rendering helper
4. **scope** (86 LOC) - Scope inspector
5. **layout** (442 LOC) - Layout engine
6. **prompt** (400 LOC) - Prompt system

**EXECUTION:** All 5 independent - maximize parallelization!

**WORKFLOW:** TDD → npm run check → git add -A (STAGE ONLY - no commit!)

**CRITICAL:** progress module is THE GOAL from Day 1! Take time to get it right!

**AFTER PHASE 15:** RICH TYPESCRIPT PORT COMPLETE - ALL 63 MODULES! 🎊

---

# PHASE 15 PORTING PROMPT - Rich TypeScript (FINAL PHASE!)

**Use this prompt at the start of each fresh Claude Code Web session to complete the Rich TypeScript port.**

---

## 🎯 PROJECT OVERVIEW

**What is Rich?**
Rich is a popular Python library (70+ modules, 26K+ LOC) for rendering beautiful text, tables, progress bars, syntax highlighting, and more to the terminal. It's used by thousands of projects worldwide.

**What are we doing?**
Porting **ALL OF RICH** to TypeScript - the complete library!

**Progress:**
- Phases 1-7: 19 modules ✅ (foundation, primitives, core, components)
- Phase 10: 5 modules ✅ (foundation helpers)
- Phase 11: 3 modules ✅ (palette system)
- Phase 12: 6 modules ✅ (ansi + helpers, 34 tests unblocked!)
- Phase 13: 5 modules ✅ (progress bar components)
- Phase 14: 6 modules ✅ (advanced components: syntax, markdown, tree, live, etc.)
- **Phase 15: 5 modules TO DO - THE FINAL PHASE!** 🎉

---

## 📋 PHASE 15 OVERVIEW

**Goal:** Port the final 5 complex system modules - including the main PROGRESS module from the original scope!

**Modules (ALL can run in PARALLEL!):**
1. **progress** - Complete progress bar system (~1,715 LOC, ~100 tests) - **CRITICAL - ORIGINAL SCOPE!**
2. **pretty** - Object pretty printer (~1,016 LOC, ~100 tests) - **LARGE!**
3. **scope** - Scope inspector (~86 LOC, tested via pretty)
4. **layout** - Layout engine (~442 LOC, ~15 tests)
5. **prompt** - Prompt system (~400 LOC, ~20 tests)

**Total:** ~3,659 LOC, ~235+ tests

**Why these last?** These are complete, complex systems that depend on everything built in previous phases. Progress is the most complex module in the entire port!

**ALL DEPENDENCIES MET** from Phases 1-14! All 5 modules can be ported simultaneously.

**Success Criteria:**
- All 5 modules ported
- **progress module works** - THE ORIGINAL GOAL!
- All tests pass
- TypeScript strict mode
- `npm run check` passes
- **RICH TYPESCRIPT PORT 100% COMPLETE!** 🎊

---

## 📋 SESSION STARTUP INSTRUCTIONS

I'm completing the Rich TypeScript port. This is **Phase 15: Final Complex Systems - THE LAST PHASE!** 🎉

### 1. First, read these logs:
- Read `rich-ts/phases/COMPLETE_PORT_PLAN.md`
- Read `rich-ts/phases/phase15/PORT_LOG_PROGRESS.md` ⚠️ **CRITICAL - READ FIRST**
- Read `rich-ts/phases/phase15/PORT_LOG_PRETTY.md`
- Read `rich-ts/phases/phase15/PORT_LOG_SCOPE.md`
- Read `rich-ts/phases/phase15/PORT_LOG_LAYOUT.md`
- Read `rich-ts/phases/phase15/PORT_LOG_PROMPT.md`

### 2. Verify Phase 14 Complete:
- [ ] tree.ts exists and tests pass
- [ ] syntax.ts exists and tests pass
- [ ] markdown.ts exists and tests pass
- [ ] json.ts exists and tests pass
- [ ] live.ts exists and tests pass
- [ ] status.ts exists and tests pass

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

Port the FINAL 5 modules using Test-Driven Development:

**ALL 5 modules can be done in PARALLEL** - all dependencies met!

**For EACH module:**

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
- Update `rich-ts/phases/phase15/PORT_LOG_[MODULE].md` to DONE
- Update `rich-ts/phases/COMPLETE_PORT_PLAN.md` with status
- Add session notes with timestamp
- **If last module:** Mark COMPLETE PORT PLAN as 100% DONE!

---

## 📝 MODULE-SPECIFIC NOTES

### progress (1,715 LOC) - **CRITICAL! THE BIG ONE!** 🎯
**Purpose:** Complete progress bar system with task tracking and live updates

**Python Source:** `rich/progress.py` (1,715 LOC - LARGEST MODULE IN ENTIRE PORT!)  
**Tests:** `tests/test_progress.py` (~100 tests)  
**Key Features:**
- Progress class managing multiple progress bars
- Task tracking (TaskID, Task dataclass)
- Multiple column types (BarColumn, TextColumn, TimeColumn, etc.)
- Live updating display
- Progress tracking (update, advance, reset)
- start/stop lifecycle
- Transient mode
- Uses: Live, ProgressBar, Bar, Spinner, Control
- **THIS WAS IN THE ORIGINAL SCOPE!**

**TypeScript Notes:**
- **MOST COMPLEX MODULE** in the entire port
- Task management system
- Column architecture (different display columns)
- Live refresh integration
- Threading → setInterval
- ~4-6 hours

**CRITICAL:** This completes the original scope! Take time to get it right!

---

### pretty (1,016 LOC) - **LARGE!**
**Purpose:** Pretty printer for Python/JavaScript objects

**Python Source:** `rich/pretty.py`  
**Tests:** `tests/test_pretty.py` (~100 tests)  
**Key Features:**
- Pretty class for object pretty-printing
- Handles all JS types (objects, arrays, primitives, etc.)
- Recursive traversal with depth limits
- Uses ReprHighlighter for coloring
- Expandable/collapsible display
- Max length/depth controls

**TypeScript Notes:**
- Adapt Python object repr to JS object printing
- Handle prototypes, getters, symbols
- Circular reference detection
- ~3-4 hours

---

### scope (86 LOC)
**Purpose:** Scope inspector for showing variable scopes

**Python Source:** `rich/scope.py`  
**Tests:** Tested via pretty module  
**Key Features:**
- Scope rendering helper
- Shows local/global variables
- Uses Pretty for formatting
- Simple wrapper

**TypeScript Notes:**
- Adapt to JavaScript scoping
- May be less useful in JS than Python
- ~30 minutes

---

### layout (442 LOC)
**Purpose:** Layout engine for complex layouts

**Python Source:** `rich/layout.py`  
**Tests:** `tests/test_layout.py` (~15 tests)  
**Key Features:**
- Layout class for splitting screen into regions
- Split horizontally/vertically
- Proportional sizing
- Named regions
- Update regions independently
- Uses Region for bounds

**TypeScript Notes:**
- Recursive layout tree
- Size calculations with ratios
- Region updates
- ~1.5-2 hours

---

### prompt (400 LOC)
**Purpose:** Interactive prompt system

**Python Source:** `rich/prompt.py`  
**Tests:** `tests/test_prompt.py` (~20 tests)  
**Key Features:**
- Prompt class for user input
- Type validation (int, float, bool, choices)
- Default values
- Password masking
- Choice selection
- Uses Console for styled prompts

**TypeScript Notes:**
- Adapt to Node.js readline or similar
- Input validation
- Type coercion
- ~1.5 hours

---

## ⚠️ IMPORTANT NOTES

**Massive Modules:**
- **progress** (1,715 LOC) is the LARGEST module in the entire port!
- **pretty** (1,016 LOC) is also very large
- Budget significant time for these two

**Progress Module:**
- This was IN THE ORIGINAL SCOPE
- Most complex system in Rich
- Take time to get it right!
- Test thoroughly with examples

**External Dependencies:**
- May need readline or prompt library for prompt module
- Document any npm packages added

**Parallelization:**
- All 5 can technically run in parallel
- But progress and pretty are huge - give them dedicated agents
- Recommended: 3-5 agents

---

## ✅ SUCCESS CRITERIA

For Phase 15 to be COMPLETE:

- [ ] **progress module complete and working!** 🎯
- [ ] All 5 modules ported
- [ ] All tests pass
- [ ] `npm run check` passes
- [ ] All PORT_LOG files updated to DONE
- [ ] COMPLETE_PORT_PLAN.md shows 100% DONE
- [ ] **RICH TYPESCRIPT PORT COMPLETE!** 🎊

---

## 🚀 RECOMMENDED WORK ORDER

**Option A: Full Parallel (5 Agents)**
- Agent A: **progress** (4-6 hours) - dedicated agent!
- Agent B: **pretty** (3-4 hours) - dedicated agent!
- Agent C: layout (1.5-2 hours)
- Agent D: prompt (1.5 hours)
- Agent E: scope (30 min)

**Actual time: ~6 hours (longest module: progress)**

**Option B: Sequential (1-2 Agents)**
1. scope (30 min) - warm up
2. prompt (1.5 hours)
3. layout (2 hours)
4. pretty (3-4 hours)
5. **progress** (4-6 hours) - save best for last!

**Total: ~11-14 hours**

**Option C: Recommended (2-3 Agents)**
- Agent A: **progress** (4-6 hours) - start immediately!
- Agent B: pretty (3-4 hours) - parallel with A
- Agent C: layout, prompt, scope (4 hours sequential) - after A or B

**Actual time: ~6-8 hours with coordination**

---

## 🎬 ACTION: START NOW

1. **Read logs** (especially progress log!)
2. **Verify Phase 14 complete** (all advanced components ✅)
3. **Assign modules** (if using parallel agents)
4. **Start with progress!** (Most critical!)
5. Follow 6-step TDD process
6. Update logs as you go
7. When all 5 complete - **CELEBRATE!** 🎉
8. Mark COMPLETE_PORT_PLAN.md as 100% DONE
9. Update PROJECT_COMPLETE.md with final stats

---

## 💾 END OF SESSION

Before ending your FINAL session:
- All module logs updated to DONE
- COMPLETE_PORT_PLAN.md shows 100% COMPLETE
- PROJECT_COMPLETE.md updated with final statistics
- Create PHASE15_SUMMARY.md documenting completion
- Session notes celebrating completion! 🎊

---

## 🎉 FINAL PHASE!

**After Phase 15:**
- **63 modules ported** (100%)
- **ALL of Rich TypeScript complete!**
- Progress bars working (original scope!) ✅
- Every feature available ✅

**This is it - the culmination of all phases!**

**Remember:** progress module is HUGE (1,715 LOC) - take your time, test thoroughly, make it work right! This completes the original goal! 🚀🎯🎊

