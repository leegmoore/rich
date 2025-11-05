# PHASE 2 PORTING PROMPT - Rich TypeScript

**Status:** NOT STARTED (waiting for Phase 1 merge)

---

## 📋 PREREQUISITES

**Phase 1 must be complete and merged to master:**
- color_triplet ✅
- errors ✅
- cells ✅
- color ✅

Check `phases/phase1/STATUS.md` for current status.

---

## 🎯 PHASE 2 OVERVIEW

**Goal:** Port 4 primitives modules that build on Phase 1.

**Modules:**
1. **repr** - Rich repr protocol (~100 LOC, 8 tests, 30 min) - NO DEPENDENCIES
2. **control** - Terminal control codes (~100 LOC, 7 tests, 30 min) - NO DEPENDENCIES  
3. **style** - Style system (~800 LOC, 27 tests, 2-3 hours) - DEPENDS ON: color, color_triplet, errors
4. **segment** - Text segments (~750 LOC, 29 tests, 2-3 hours) - DEPENDS ON: style, cells

**Estimated Time:** 6-8 hours total

---

## 📋 SESSION STARTUP

Copy the prompt from: `phases/phase2/QUICK_START_PHASE2.txt`

Or use this shortened version:

```
I'm porting Rich Phase 2 (Primitives Layer) to TypeScript.

Read status and instructions:
- phases/phase1/STATUS.md (verify Phase 1 complete)
- phases/phase2/PROMPT_PHASE2.md (this file)
- phases/phase2/PORT_LOG_*.md (module logs)
- PORT_LOG_MASTER.md (overall status)

Port modules: repr, control, style, segment
Order: repr + control (parallel) → style → segment

Follow TDD: tests first, implement, check, commit, log
```

---

## 🎯 YOUR TASK

Same TDD process as Phase 1:

1. Port tests to `tests/[MODULE].test.ts`
2. Implement in `src/[MODULE].ts`  
3. Run `npm run check`
4. Commit & push
5. Update `phases/phase2/PORT_LOG_[MODULE].md`
6. Update `PORT_LOG_MASTER.md`

See `phases/phase1/PROMPT_PHASE1.md` for detailed instructions.

---

## 📝 MODULE LOGS

Module-specific logs are in this folder:
- `PORT_LOG_REPR.md`
- `PORT_LOG_CONTROL.md`
- `PORT_LOG_STYLE.md`
- `PORT_LOG_SEGMENT.md`

