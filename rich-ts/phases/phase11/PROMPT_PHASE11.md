# PHASE 11 PORTING PROMPT - Rich TypeScript

**Use this prompt at the start of each fresh Claude Code Web session to continue Phase 11 work.**

---

## 🎯 PROJECT OVERVIEW

**What is Rich?**
Rich is a popular Python library (70+ modules, 26K+ LOC) for rendering beautiful text, tables, progress bars, syntax highlighting, and more to the terminal. It's used by thousands of projects.

**What are we doing?**
Porting **ALL OF RICH** to TypeScript for use in Node.js and browser environments.

**Your Role:**
TypeScript developer using Test-Driven Development (TDD) to port Python code.

**Progress:**
- Phases 1-7: 19 modules COMPLETE ✅
- Phase 10: 5 modules COMPLETE ✅ (foundation helpers)
- Phase 11: 3 modules TO DO (palette system)
- Remaining: Phases 12-15 (22 modules)

---

## 📋 PHASE 11 OVERVIEW

**Goal:** Port 4 modules - pager (from Phase 10) + 3 palette/color system modules.

**Modules (RECOMMENDED ORDER):**
1. **pager** - Abstract pager base (~34 LOC, ~5 tests) - DEPENDS ON: nothing [CAN DO ANYTIME]
2. **palette** - Palette class for color quantization (~100 LOC, ~10 tests) - DEPENDS ON: color_triplet ✅
3. **_palettes** - Standard palettes (256-color, Windows) (~309 LOC, data + helpers) - DEPENDS ON: palette
4. **terminal_theme** - Terminal theme with ANSI color definitions (~153 LOC, ~8 tests) - DEPENDS ON: color_triplet ✅, palette

**Total:** ~596 LOC, ~23+ tests

**Why this order?** 
- pager is standalone (quick win from Phase 10)
- palette → _palettes → terminal_theme chain must be sequential

**Why this phase?** Phase 12 needs terminal_theme for the CRITICAL ansi module which unblocks 34 tests!

**Success Criteria:**
- All 3 modules ported IN ORDER
- All tests pass
- TypeScript strict mode (no `any` types)
- `npm run check` passes
- Progress logged
- Code committed

---

## 📋 SESSION STARTUP INSTRUCTIONS

I'm continuing the Rich TypeScript port. This is **Phase 11: Palette System**.

### 1. First, read these logs:
- Read `rich-ts/phases/COMPLETE_PORT_PLAN.md` (overall strategy)
- Read `rich-ts/phases/REMAINING_MODULES.md` (what's left)
- Read `rich-ts/phases/phase11/PORT_LOG_PAGER.md`
- Read `rich-ts/phases/phase11/PORT_LOG_PALETTE.md`
- Read `rich-ts/phases/phase11/PORT_LOG_PALETTES.md`
- Read `rich-ts/phases/phase11/PORT_LOG_TERMINAL_THEME.md`
- Read `rich-ts/PROJECT_COMPLETE.md` (Phases 1-7 status)

### 2. Development Standards:
- npm (not pnpm/bun)
- TypeScript strict mode (no `any`)
- Prettier formatting (single quotes, 100 char width)
- ESLint for quality only
- `npm run check` before every commit
- Clear names, JSDoc on public APIs
- Use `??` and `?.` where appropriate

### 3. Module Order:
**Recommended sequence:**
1. **First:** pager (standalone, quick win)
2. **Second:** palette (needed by _palettes and terminal_theme)
3. **Third:** _palettes (needs palette)
4. **Fourth:** terminal_theme (needs palette)

**Note:** pager can be done anytime (standalone), but palette → _palettes → terminal_theme MUST be sequential!

---

## 🎯 YOUR TASK

Port Phase 11 modules IN SEQUENTIAL ORDER using TDD:

**For EACH module (in order!):**

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

### Step 4: Run Quality Checks
- Run: `npm run check` (must pass!)

### Step 5: Stage Changes (DO NOT COMMIT!)
- Stage all changes: `git add -A`
- **DO NOT** commit or push yet
- Leave staged for code review

### Step 6: Update Logs
- Update `rich-ts/phases/phase11/PORT_LOG_[MODULE].md` to DONE
- Update `rich-ts/phases/COMPLETE_PORT_PLAN.md` with status
- Add session notes with timestamp

**Then move to NEXT module in sequence!**

---

## 📝 MODULE-SPECIFIC NOTES

### pager (34 LOC) - QUICK WIN FROM PHASE 10
**Purpose:** Abstract pager base class

**Python Source:** `rich/pager.py`  
**Key Features:**
- Pager abstract base class
- show() method signature
- SystemPager comes later

**TypeScript Notes:**
- Abstract class with abstract show() method
- Very simple
- ~15 minutes

---

### palette (100 LOC) - PORT THIS SECOND
**Purpose:** Palette class for color quantization and matching

**Python Source:** `rich/palette.py`  
**Key Features:**
- Palette class with color list
- Color matching algorithm (find nearest color)
- Used for downgrading colors to terminal palettes
- Match algorithm uses Euclidean distance in RGB space

**TypeScript Notes:**
- Class with array of ColorTriplet
- match() method - find nearest color by distance
- May use caching (@lru_cache in Python → Map in TS)
- ~45 minutes

**Critical Algorithm:**
- Color distance calculation: sqrt((r1-r2)² + (g1-g2)² + (b1-b2)²)
- Find minimum distance across palette
- Must be accurate!

---

### _palettes (309 LOC) - PORT THIS SECOND
**Purpose:** Standard terminal palette definitions

**Python Source:** `rich/_palettes.py`  
**Key Features:**
- 256-color palette definition
- Windows console palette
- Standard terminal colors
- Mostly data, some helper functions

**TypeScript Notes:**
- Export palette constants (arrays of ColorTriplet)
- EIGHT_BIT_PALETTE (256 colors)
- WINDOWS_PALETTE (16 colors)
- Helper functions for palette generation
- ~30 minutes

**Note:** Mostly data porting - verify color values match Python exactly

---

### terminal_theme (153 LOC) - PORT THIS THIRD
**Purpose:** Terminal theme with ANSI color definitions

**Python Source:** `rich/terminal_theme.py`  
**Key Features:**
- TerminalTheme class
- ANSI color definitions (0-255)
- Foreground and background colors
- Default terminal themes
- Used by ansi module for decoding ANSI sequences

**TypeScript Notes:**
- Class with ColorTriplet arrays
- foregroundColors and backgroundColors
- Constructor with palette
- ~45 minutes

**CRITICAL:** This is needed for Phase 12 ansi module!

---

## ⚠️ IMPORTANT NOTES

**Sequential Order:**
- These modules MUST be done in order
- palette is used by _palettes and terminal_theme
- DO NOT start _palettes until palette is complete!
- DO NOT start terminal_theme until palette is complete!

**Testing:**
- Run `npm test -- --run` to avoid watch mode
- palette tests are important (color matching algorithm)
- _palettes is mostly data (spot check)
- terminal_theme tests verify palette integration

**Color Accuracy:**
- Palette colors must match Python exactly
- Color distance calculations must be precise
- ANSI color mappings must be correct

---

## ✅ SUCCESS CRITERIA

For Phase 11 to be COMPLETE:

- [ ] pager module complete with tests passing
- [ ] palette module complete with tests passing
- [ ] _palettes module complete (data verified)
- [ ] terminal_theme module complete with tests passing
- [ ] All 4 modules done
- [ ] `npm run check` passes
- [ ] All PORT_LOG files updated to DONE
- [ ] All changes staged with `git add -A` (NOT committed!)
- [ ] COMPLETE_PORT_PLAN.md shows Phase 11 complete

---

## 🚀 RECOMMENDED WORK ORDER

**Recommended Order:**
1. pager (15 min) - quick win
2. palette (45 min) - needed by others
3. _palettes (30 min) - needs palette
4. terminal_theme (45 min) - needs palette

**Total: ~2.5 hours**

**Partial parallelization:** pager + palette can be done simultaneously, then _palettes, then terminal_theme

---

## 🎬 ACTION: START NOW

1. **Read logs** (listed above)
2. **Verify Phase 10 complete** (5 foundation helpers done)
3. **Start with palette** (FIRST - required by others)
4. Follow 6-step TDD process
5. **Then _palettes** (SECOND)
6. **Then terminal_theme** (THIRD - enables Phase 12 ansi!)
7. Update logs as you go
8. When all 3 complete, mark Phase 11 DONE

---

## 💾 END OF SESSION

Before ending:
- All 3 module logs updated to DONE
- COMPLETE_PORT_PLAN.md shows Phase 11 complete
- Session notes with timestamp
- Confirm Phase 12 is ready (terminal_theme ✅)

---

## 🎯 WHAT'S NEXT

**After Phase 11:** Phase 12 with the **CRITICAL ansi module** that unblocks 34 text tests! 🚀

**Remember:** SEQUENTIAL ORDER! palette → _palettes → terminal_theme. Don't skip ahead!

