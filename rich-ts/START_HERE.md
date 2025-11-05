# 🚀 START HERE - Rich TypeScript Port

## Quick Reference

**Repo Root:** `/Users/leemoore/code/rich-port/rich/`  
**TypeScript Project:** `rich-ts/` (subdirectory)  
**Status:** Phase 1 ready to start

---

## For Claude Code Web

### Step 1: Open Workspace
Point Claude Code Web to:
```
/Users/leemoore/code/rich-port/rich/
```

### Step 2: Copy-Paste This Prompt

Open `rich-ts/QUICK_START_PROMPT.txt` and copy its contents into Claude Code Web chat.

Or copy this:

```
I'm continuing the Rich TypeScript port - Phase 1 (Foundation Layer).

WORKSPACE: /Users/leemoore/code/rich-port/rich/
(TypeScript port is in the rich-ts/ subdirectory)

FIRST: Read these logs to understand status (all in rich-ts/):
- Read rich-ts/PORT_LOG_MASTER.md
- Read rich-ts/PORT_LOG_COLOR_TRIPLET.md  
- Read rich-ts/PORT_LOG_ERRORS.md
- Read rich-ts/PORT_LOG_CELLS.md
- Read rich-ts/PORT_LOG_COLOR.md

THEN: Read full instructions in rich-ts/PROMPT_PHASE1.md

TASK: Port all Phase 1 modules (color_triplet, errors, cells, color) using Test-Driven Development:
1. Read Python source: rich/[MODULE].py
2. Read Python tests: tests/test_[MODULE].py
3. Create rich-ts/tests/[MODULE].test.ts - port ALL tests to TypeScript/Vitest
4. Run tests (should fail): cd rich-ts && npm test
5. Create rich-ts/src/[MODULE].ts - implement until tests pass
6. Update rich-ts/PORT_LOG_[MODULE].md and rich-ts/PORT_LOG_MASTER.md

START with color_triplet (simplest), then errors, then cells, then color.

First time? Run: cd rich-ts && npm install

GO!
```

### Step 3: Let It Run

Claude will:
1. ✅ Read all the logs
2. ✅ Read Python source and tests
3. ✅ Port tests to TypeScript
4. ✅ Implement modules
5. ✅ Update logs with progress

---

## File Structure

```
/Users/leemoore/code/rich-port/rich/  (GIT REPO ROOT)
│
├── rich/                    ← Python source (reference material)
│   ├── color.py
│   ├── cells.py
│   └── ...
│
├── tests/                   ← Python tests (to port)
│   ├── test_color.py
│   └── ...
│
└── rich-ts/                 ← TypeScript port (YOUR WORK)
    ├── src/                 ← TypeScript source (create here)
    ├── tests/               ← TypeScript tests (create here)
    ├── package.json
    ├── tsconfig.json
    ├── vitest.config.ts
    ├── PORT_LOG_MASTER.md   ← Main progress tracker
    ├── PORT_LOG_*.md        ← Per-module logs
    ├── PROMPT_PHASE1.md     ← Detailed instructions
    ├── QUICK_START_PROMPT.txt
    └── START_HERE.md        ← You are here!
```

---

## Important Files

| File | Purpose |
|------|---------|
| `QUICK_START_PROMPT.txt` | Copy-paste prompt for Claude |
| `PROMPT_PHASE1.md` | Detailed Phase 1 instructions |
| `PORT_LOG_MASTER.md` | Overall progress tracker |
| `PORT_LOG_[MODULE].md` | Individual module progress |

---

## Phase 1 Goals

Port these 4 foundation modules (no dependencies):

1. ✅ **color_triplet** - RGB color data class (~15 min)
2. ✅ **errors** - Error classes (~10 min)  
3. ✅ **cells** - Unicode width calculations (~45 min)
4. ✅ **color** - Color parsing & manipulation (~60 min)

**Total:** ~2-3 hours in one session

---

## After Phase 1

When Phase 1 is complete:
- All 4 modules will have passing tests
- Logs will show "DONE" status
- Ready to start Phase 2 (style, segment, repr, control)

---

## Questions?

- Read `PROMPT_PHASE1.md` for detailed instructions
- Read `PORT_LOG_MASTER.md` for current status
- Check individual `PORT_LOG_[MODULE].md` files for module-specific info

---

**Ready?** Open Claude Code Web and paste the prompt! 🚀

