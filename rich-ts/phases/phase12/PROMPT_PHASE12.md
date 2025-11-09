===== PHASE 12: ANSI + HELPERS - MOSTLY PARALLEL =====

**ROLE:** TypeScript developer porting Rich Python library to TypeScript

**PHASE:** 12 - ANSI + Core Helpers (6 modules, ~793 LOC)  
**DEPENDENCY:** Phase 11 complete (terminal_theme needed for ansi)  
**STATUS:** Ready to port

**CRITICAL:** ansi module UNBLOCKS 34 SKIPPED TESTS!

**MODULES (SPECIFIC ORDER):**
1. **ansi** (241 LOC) - ANSI decoder [DO FIRST - needs terminal_theme, blocks file_proxy]
2. **containers** (167 LOC) - Lines/Renderables [PARALLEL after ansi]
3. **highlighter** (232 LOC) - Text highlighting [PARALLEL after ansi]
4. **styled** (42 LOC) - Style wrapper [PARALLEL after ansi]
5. **screen** (54 LOC) - Screen buffer [PARALLEL after ansi]
6. **file_proxy** (57 LOC) - File stream proxy [DO LAST - needs ansi]

**EXECUTION:** ansi first → 4 modules parallel → file_proxy last

**WORKFLOW:** TDD → npm run check → git add -A (STAGE ONLY - no commit!)

**CRITICAL:** After ansi, run `npm test text` - should see 34 fewer skipped tests!

---

# PHASE 12 PORTING PROMPT - Rich TypeScript

**Use this prompt at the start of each fresh Claude Code Web session to continue Phase 12 work.**

---

## 🎯 PROJECT OVERVIEW

**What is Rich?**
Rich is a popular Python library (70+ modules, 26K+ LOC) for rendering beautiful text, tables, progress bars, syntax highlighting, and more to the terminal.

**What are we doing?**
Porting **ALL OF RICH** to TypeScript.

**Progress:**
- Phases 1-7: 19 modules ✅
- Phase 10: 5 modules ✅
- Phase 11: 3 modules ✅ (palette system)
- Phase 12: 6 modules TO DO (**INCLUDING CRITICAL ANSI!**)
- Remaining: Phases 13-15 (19 modules)

---

## 📋 PHASE 12 OVERVIEW

**Goal:** Port 6 modules including the CRITICAL ansi module that unblocks 34 skipped tests!

**Modules (SPECIFIC ORDER):**
1. **ansi** - ANSI sequence decoder (~241 LOC, ~20 tests) - DEPENDS ON: color ✅, style ✅, text ✅, terminal_theme ✅
2. **containers** - Lines/Renderables helpers (~167 LOC, ~8 tests) - DEPENDS ON: measure ✅ [CAN PARALLEL with 3-5]
3. **highlighter** - Text highlighting base (~232 LOC, ~15 tests) - DEPENDS ON: text ✅ [CAN PARALLEL with 2,4,5]
4. **styled** - Styled wrapper (~42 LOC, ~5 tests) - DEPENDS ON: segment ✅, style ✅ [CAN PARALLEL with 2,3,5]
5. **screen** - Screen buffer (~54 LOC, ~5 tests) - DEPENDS ON: segment ✅, _loop ✅ [CAN PARALLEL with 2,3,4]
6. **file_proxy** - File stream proxy (~57 LOC, ~5 tests) - DEPENDS ON: ansi, text ✅ [DO LAST]

**Total:** ~793 LOC, ~58 tests

**Critical Order:**
1. ansi FIRST (blocks file_proxy, unblocks 34 text tests!)
2. containers, highlighter, styled, screen (all parallel)
3. file_proxy LAST (needs ansi)

**Why this phase?** The ansi module is CRITICAL - it enables Text.fromAnsi() and unblocks 34 text tests that were skipped!

**Success Criteria:**
- All 6 modules ported
- **ansi module enables 34 previously skipped text tests**
- All new tests pass
- `npm run check` passes
- Progress logged
- Code committed

---

## 📋 SESSION STARTUP INSTRUCTIONS

I'm continuing the Rich TypeScript port. This is **Phase 12: ANSI + Helpers**.

### 1. First, read these logs:
- Read `rich-ts/phases/COMPLETE_PORT_PLAN.md`
- Read `rich-ts/phases/phase12/PORT_LOG_ANSI.md` ⚠️ **READ THIS FIRST**
- Read `rich-ts/phases/phase12/PORT_LOG_CONTAINERS.md`
- Read `rich-ts/phases/phase12/PORT_LOG_HIGHLIGHTER.md`
- Read `rich-ts/phases/phase12/PORT_LOG_STYLED.md`
- Read `rich-ts/phases/phase12/PORT_LOG_SCREEN.md`
- Read `rich-ts/phases/phase12/PORT_LOG_FILE_PROXY.md`

### 2. Verify Phase 11 Complete:
- [ ] palette.ts exists and tests pass
- [ ] _palettes.ts exists
- [ ] terminal_theme.ts exists and tests pass

### 3. Development Standards:
(Same as always: npm, strict TypeScript, Prettier, ESLint, clear names, JSDoc, `npm run check` before commit)

---

## 🎯 YOUR TASK

### CRITICAL: Do ansi Module FIRST!

**Step 1: Port ansi module**
This is THE most important module in Phase 12:
1. Read `rich/ansi.py` carefully (241 LOC)
2. Read `tests/test_ansi.py` (~20 tests)
3. Create `rich-ts/tests/ansi.test.ts` - port ALL tests
4. Create `rich-ts/src/ansi.ts` - implement AnsiDecoder class
5. Test: `npm test ansi -- --run`
6. **VERIFY:** Run `npm test text -- --run` - should see 34 FEWER skipped tests!
7. Commit and push

**Step 2: Port parallel modules (containers, highlighter, styled, screen)**
These 4 can be done simultaneously by different agents:
- All depend only on Phase 1-7 modules (already complete)
- No dependencies on each other
- Standard TDD workflow

**Step 3: Port file_proxy**
After ansi is complete:
- Depends on ansi module
- Standard TDD workflow

---

## 📝 MODULE-SPECIFIC NOTES

### ansi (241 LOC) - **DO THIS FIRST! CRITICAL!**
**Purpose:** Decode ANSI escape sequences into Rich Text objects

**Python Source:** `rich/ansi.py`  
**Key Features:**
- AnsiDecoder class
- Decode ANSI SGR codes to Style objects
- Convert ANSI text to Rich Text with proper styles
- Text.fromAnsi() implementation support
- Used for processing terminal output

**TypeScript Notes:**
- Parse ANSI escape sequences: `\x1b[...m`
- SGR code mapping to Style attributes
- Color code handling (0-255 using terminal_theme)
- State machine for parsing sequences
- ~1.5-2 hours

**CRITICAL:**
- This unblocks `Text.fromAnsi()` in text.ts
- Should enable 34 currently skipped text tests!
- After porting, verify with: `npm test text -- --run`

---

### containers (167 LOC)
**Purpose:** Lines and Renderables container helpers

**Python Source:** `rich/containers.py`  
**Key Features:**
- Lines class - list of renderables for vertical stacking
- Renderables class - list of renderables for grouping
- Measurement protocol
- Simple container abstractions

**TypeScript Notes:**
- Classes that wrap renderable arrays
- Implement __richConsole__ and __richMeasure__
- ~45 minutes

---

### highlighter (232 LOC)
**Purpose:** Base class for text highlighting

**Python Source:** `rich/highlighter.py`  
**Key Features:**
- Highlighter abstract class
- highlight() method
- ReprHighlighter, NullHighlighter, RegexHighlighter
- Used by json, pretty, syntax modules

**TypeScript Notes:**
- Abstract class with highlight() method
- Subclasses for different highlighting strategies
- Uses Text and Span for applying highlights
- ~1 hour

---

### styled (42 LOC)
**Purpose:** Simple wrapper that applies a style to any renderable

**Python Source:** `rich/styled.py`  
**Key Features:**
- Styled class wraps renderable with a style
- Implements rendering and measurement protocols
- Simple style application wrapper

**TypeScript Notes:**
- Class with renderable and style properties
- __richConsole__ applies style to rendered segments
- ~20 minutes

---

### screen (54 LOC)
**Purpose:** Screen buffer representation

**Python Source:** `rich/screen.py`  
**Key Features:**
- Screen class for buffering rendered output
- Line-based storage
- Used by Live display system

**TypeScript Notes:**
- Class with line array storage
- Helper methods for screen manipulation
- ~25 minutes

---

### file_proxy (57 LOC) - **DO THIS LAST**
**Purpose:** File stream proxy that processes ANSI codes

**Python Source:** `rich/file_proxy.py`  
**Key Features:**
- FileProxy class wraps IO streams
- Decodes ANSI sequences using AnsiDecoder
- Converts terminal output to Rich Text
- Used by progress bars

**TypeScript Notes:**
- Depends on ansi module (must be done after ansi!)
- Wraps Node.js streams
- ~30 minutes

---

## ⚠️ IMPORTANT NOTES

**Sequential Requirements:**
1. **ansi MUST be done first** (blocks file_proxy)
2. containers, highlighter, styled, screen can be parallel
3. file_proxy MUST be done last (needs ansi)

**After ansi Module:**
- Immediately run: `npm test text -- --run`
- Should see 34 FEWER skipped tests
- Text.fromAnsi() should now work!
- This is a HUGE milestone!

**Parallelization:**
- ansi: 1 agent (do first)
- containers, highlighter, styled, screen: 4 agents (parallel)
- file_proxy: 1 agent (do last)

---

## ✅ SUCCESS CRITERIA

For Phase 12 to be COMPLETE:

- [ ] **ansi module complete** (most critical!)
- [ ] **34 text tests now passing** (were skipped)
- [ ] containers module complete
- [ ] highlighter module complete
- [ ] styled module complete
- [ ] screen module complete
- [ ] file_proxy module complete
- [ ] All tests pass
- [ ] `npm run check` passes
- [ ] All PORT_LOG files updated to DONE
- [ ] COMPLETE_PORT_PLAN.md shows Phase 12 complete

---

## 🚀 RECOMMENDED WORK ORDER

**Option A: Solo Agent (Sequential)**
1. ansi (2 hours) **FIRST!**
2. containers (45 min)
3. highlighter (1 hour)
4. styled (20 min)
5. screen (25 min)
6. file_proxy (30 min) **LAST!**

**Total: ~5 hours**

**Option B: Parallel (5-6 Agents)**
- Agent A: ansi (2 hours) **FIRST!**
- **WAIT for ansi complete**
- Agents B-E: containers, highlighter, styled, screen (parallel, 1 hour)
- Agent F: file_proxy (30 min) **LAST!**

**Actual time: ~3.5 hours with coordination**

---

## 🎬 ACTION: START NOW

1. **Read logs** (especially ansi log!)
2. **Verify Phase 11 complete** (palette, _palettes, terminal_theme ✅)
3. **START WITH ansi** (most critical!)
4. After ansi: verify text tests (34 should un-skip)
5. Then do containers/highlighter/styled/screen (parallel)
6. Finally file_proxy
7. Update logs as you go
8. When all 6 complete, mark Phase 12 DONE

---

## 💾 END OF SESSION

Before ending:
- All module logs updated
- COMPLETE_PORT_PLAN.md shows Phase 12 status
- **Verify:** 34 text tests now passing (not skipped)
- Session notes with timestamp
- Confirm Phase 13 is ready

---

## 🎯 WHAT'S NEXT

**After Phase 12:** Phase 13 - Progress Bar Components! Finally getting to the progress bars from original scope! 🚀

**Remember:** ansi FIRST, then parallelize, file_proxy LAST! This phase unlocks major functionality!

