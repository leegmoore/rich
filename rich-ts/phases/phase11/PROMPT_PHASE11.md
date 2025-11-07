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

**Goal:** Port 3 palette/color system modules IN SEQUENTIAL ORDER (dependencies chain).

**Modules (IN THIS ORDER):**
1. **palette** - Palette class for color quantization (~100 LOC, ~10 tests) - DEPENDS ON: color_triplet ✅
2. **_palettes** - Standard palettes (256-color, Windows) (~309 LOC, data + helpers) - DEPENDS ON: palette
3. **terminal_theme** - Terminal theme with ANSI color definitions (~153 LOC, ~8 tests) - DEPENDS ON: color_triplet ✅, palette

**Total:** ~562 LOC, ~18+ tests

**Why this order?** Dependencies chain: palette is used by _palettes, and both are used by terminal_theme. MUST be sequential!

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

### 3. CRITICAL - Do modules IN ORDER:
**You MUST port in this sequence:**
1. **First:** palette
2. **Second:** _palettes (needs palette)
3. **Third:** terminal_theme (needs palette)

**DO NOT skip ahead!** Dependencies must be satisfied.

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

### Step 5: Commit and Push
- `git add -A`
- `git commit -m "Port [MODULE] module with tests"`
- `git push`

### Step 6: Update Logs
- Update `rich-ts/phases/phase11/PORT_LOG_[MODULE].md` to DONE
- Update `rich-ts/phases/COMPLETE_PORT_PLAN.md` with status
- Add session notes with timestamp

**Then move to NEXT module in sequence!**

---

## 📝 MODULE-SPECIFIC NOTES

### palette (100 LOC) - PORT THIS FIRST
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

- [ ] palette module complete with tests passing
- [ ] _palettes module complete (data verified)
- [ ] terminal_theme module complete with tests passing
- [ ] All 3 done IN SEQUENTIAL ORDER
- [ ] `npm run check` passes
- [ ] All PORT_LOG files updated to DONE
- [ ] COMPLETE_PORT_PLAN.md shows Phase 11 complete

---

## 🚀 RECOMMENDED WORK ORDER

**ONLY ONE OPTION - Sequential:**
1. palette (45 min)
2. _palettes (30 min)
3. terminal_theme (45 min)

**Total: ~2 hours**

**DO NOT parallelize** - dependencies require sequential execution!

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

