# PHASE 13 PORTING PROMPT - Rich TypeScript

**Use this prompt at the start of each fresh Claude Code Web session to continue Phase 13 work.**

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
- Phase 12: 6 modules ✅ (ansi + helpers, 34 tests unblocked!)
- Phase 13: 5 modules TO DO (**PROGRESS BAR COMPONENTS!**)
- Remaining: Phases 14-15 (11 modules)

---

## 📋 PHASE 13 OVERVIEW

**Goal:** Port 5 progress bar component modules - these build the foundation for Phase 15's main progress module!

**Modules (ALL can run in PARALLEL!):**
1. **progress_bar** - Progress bar rendering (~223 LOC, tested via progress tests)
2. **bar** - Bar component (~93 LOC, ~15 tests)
3. **live_render** - Live render helper (~106 LOC, ~10 tests)
4. **_spinners** - Spinner data (~200 LOC, data file)
5. **spinner** - Spinner component (~132 LOC, ~15 tests)

**Total:** ~754 LOC, ~40+ tests

**Why these modules?** These are the building blocks for progress bars! After this phase, we can finally port the main progress module in Phase 15.

**ALL DEPENDENCIES MET** from Phases 1-12! All 5 modules can be ported simultaneously.

**Success Criteria:**
- All 5 modules ported
- All tests pass
- TypeScript strict mode
- `npm run check` passes
- Progress logged
- Code committed

---

## 📋 SESSION STARTUP INSTRUCTIONS

I'm continuing the Rich TypeScript port. This is **Phase 13: Progress Bar Components**.

### 1. First, read these logs:
- Read `rich-ts/phases/COMPLETE_PORT_PLAN.md`
- Read `rich-ts/phases/phase13/PORT_LOG_PROGRESS_BAR.md`
- Read `rich-ts/phases/phase13/PORT_LOG_BAR.md`
- Read `rich-ts/phases/phase13/PORT_LOG_LIVE_RENDER.md`
- Read `rich-ts/phases/phase13/PORT_LOG_SPINNERS.md`
- Read `rich-ts/phases/phase13/PORT_LOG_SPINNER.md`

### 2. Verify Phase 12 Complete:
- [ ] ansi.ts exists and tests pass
- [ ] 34 text tests now passing (were skipped)
- [ ] containers.ts, highlighter.ts, styled.ts, screen.ts exist
- [ ] file_proxy.ts exists

### 3. Development Standards:
- npm (not pnpm/bun)
- TypeScript strict mode (no `any`)
- Prettier formatting (single quotes, 100 char width)
- ESLint for quality only
- `npm run check` before commit
- Clear names, JSDoc on public APIs
- Use `??` and `?.`

---

## 🎯 YOUR TASK

Port Phase 13 modules using Test-Driven Development:

**ALL 5 modules can be done in PARALLEL** - pick any order!

**For EACH module:**

### Step 1: Read Source Materials
- Read Python source: `rich/[MODULE].py`
- Read Python tests: `tests/test_[MODULE].py` (if exists)
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

### Step 4: Run Quality Checks
- Run: `npm run check` (must pass!)

### Step 5: Commit and Push
- `git add -A`
- `git commit -m "Port [MODULE] module with tests"`
- `git push`

### Step 6: Update Logs
- Update `rich-ts/phases/phase13/PORT_LOG_[MODULE].md` to DONE
- Update `rich-ts/phases/COMPLETE_PORT_PLAN.md` with status
- Add session notes with timestamp

---

## 📝 MODULE-SPECIFIC NOTES

### progress_bar (223 LOC)
**Purpose:** ProgressBar class for rendering progress bars

**Python Source:** `rich/progress_bar.py`  
**Key Features:**
- ProgressBar class with completed/total tracking
- Percentage calculation
- Bar rendering with different styles
- Color gradients (complete/finished/pulse)
- Uses Bar component for visual rendering

**TypeScript Notes:**
- Class with completed, total properties
- Render to segments with styled bar characters
- Color blending for gradients
- ~1 hour

**Tests:** Likely tested via progress module tests - may need to create basic tests

---

### bar (93 LOC)
**Purpose:** Bar component for visual bar rendering

**Python Source:** `rich/bar.py`  
**Tests:** `tests/test_bar.py` (~15 tests)  
**Key Features:**
- Bar class renders horizontal bars
- Width control
- Begin/end characters
- Style support
- Pulse animation support

**TypeScript Notes:**
- Simple rendering component
- Character repetition for bar width
- Style application
- ~30 minutes

---

### live_render (106 LOC)
**Purpose:** Live render helper for updating displays

**Python Source:** `rich/live_render.py`  
**Tests:** `tests/test_live_render.py` (~10 tests)  
**Key Features:**
- LiveRender class for managing live-updating displays
- Vertical overflow handling (crop, ellipsis, visible)
- Console integration
- Screen position management

**TypeScript Notes:**
- Class with console and renderable
- Render and position tracking
- Overflow strategies
- ~45 minutes

---

### _spinners (~200 LOC data)
**Purpose:** Spinner animation data registry

**Python Source:** `rich/_spinners.py`  
**Key Features:**
- SPINNERS dictionary with animation frames
- Many spinner styles (dots, line, arc, etc.)
- Text-based animations
- Purely data

**TypeScript Notes:**
- Export SPINNERS: Record<string, {frames: string[], interval: number}>
- Copy data from Python
- Verify spinner animations
- ~20 minutes

**Note:** Mostly data - accuracy over speed

---

### spinner (132 LOC)
**Purpose:** Spinner component for indeterminate progress

**Python Source:** `rich/spinner.py`  
**Tests:** `tests/test_spinner.py` (~15 tests)  
**Key Features:**
- Spinner class with animation frames
- Loads from _spinners registry
- Frame cycling
- Speed control (interval)
- Style support

**TypeScript Notes:**
- Class that uses _spinners data
- Frame selection based on time/count
- Measurement protocol
- ~45 minutes

---

## ⚠️ IMPORTANT NOTES

**ALL Modules are Independent:**
- No dependencies on each other
- All depend only on Phase 1-12 modules (complete)
- Perfect for parallel execution

**Progress Bar Foundation:**
- These modules are used by the main progress module (Phase 15)
- Getting these right is important!

**Spinner Data:**
- _spinners is pure data - validate accuracy
- Many spinner styles to choose from

**Parallelization:**
- Can use 5 agents simultaneously
- Or 1-2 agents sequentially
- Estimated total: 2-3 hours with parallelization

---

## ✅ SUCCESS CRITERIA

For Phase 13 to be COMPLETE:

- [ ] All 5 modules ported
- [ ] All tests pass
- [ ] `npm run check` passes
- [ ] All PORT_LOG files updated to DONE
- [ ] COMPLETE_PORT_PLAN.md shows Phase 13 complete
- [ ] Progress bar components ready for Phase 15!

---

## 🚀 RECOMMENDED WORK ORDER

**Option A: Full Parallel (5 Agents)**
- Agent A: progress_bar (1 hour)
- Agent B: bar (30 min)
- Agent C: live_render (45 min)
- Agent D: _spinners (20 min)
- Agent E: spinner (45 min)

**Actual time: ~1 hour (longest module)**

**Option B: Sequential (1 Agent)**
1. _spinners (20 min) - data first
2. bar (30 min)
3. spinner (45 min) - needs _spinners
4. live_render (45 min)
5. progress_bar (1 hour)

**Total: ~3 hours**

**Option C: Any Order**
- They're all independent
- Pick any order!

---

## 🎬 ACTION: START NOW

1. **Read logs** (listed above)
2. **Verify Phase 12 complete** (ansi ✅, 34 tests unblocked)
3. **Pick module(s)** - all are ready!
4. Follow 6-step TDD process
5. Update logs as you go
6. When all 5 complete, mark Phase 13 DONE

---

## 💾 END OF SESSION

Before ending:
- All module logs updated to DONE
- COMPLETE_PORT_PLAN.md shows Phase 13 status
- Session notes with timestamp
- Confirm Phase 14 is ready (all dependencies met)

---

## 🎯 WHAT'S NEXT

**After Phase 13:** Phase 14 - Advanced Components (syntax highlighting, markdown, json, tree, live displays)!

Then Phase 15 with the main **progress module** - finally completing the original scope! 🎯

**Remember:** All 5 modules are independent - parallelize freely! Build the progress bar foundation!

