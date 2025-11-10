# Module Port Log: live

**Status:** DONE  
**Dependencies:** console ✅, control ✅, screen ✅ (Phase 12), file_proxy ✅ (Phase 12), live_render ✅ (Phase 13)  
**Python Source:** `rich/live.py` (~400 LOC)  
**Python Tests:** `tests/test_live.py` (~25 tests)

---

## Module Overview
Live display system for updating content in place.

**Purpose:** Live class enables live-updating displays where content is rendered in place and updated without scrolling. Used for progress bars, status indicators, and dynamic displays.

**Key Features:**
- Live class with context manager pattern
- Auto-refresh with configurable interval
- Console output redirection during live mode
- Screen buffer for tracking displayed content
- Uses LiveRender for positioning updates
- Transient mode (clears on exit)
- Vertical overflow handling
- Threading/timers for auto-refresh

---

## Test Port Progress

**Total Tests:** ~25 (ported key cases: lifecycle, growing display variants, LiveRender helpers)

- [x] test_live_state
- [x] test_growing_display
- [x] test_growing_display_transient
- [x] test_live_render_helpers (cursor positioning)
- [x] test_live_final_refresh
- [x] Other behavioural smoke tests

---

## Implementation Progress

- [x] Live class + RenderHook implementation
- [x] start()/stop() lifecycle mirroring Python semantics
- [x] update() with optional immediate refresh
- [x] refresh() integrates LiveRender + cursor restoration
- [x] Auto-refresh timers via `setInterval`
- [x] stdout/stderr redirection through `FileProxy` + patched writes
- [x] Screen/alt-screen integration (Console alt-screen toggles)
- [x] Transient mode cleanup using `restoreCursor`
- [x] Vertical overflow passthrough to `LiveRender`
- [x] Console hook plumbing (`setLive`, render hooks, cursor visibility)
- [x] Tests + `npm run check`

---

## Design Decisions

- Implemented missing console infrastructure (live stack, render hooks, control helpers, cursor visibility, alt-screen toggles) to faithfully mirror Python's hook-based rendering. Hooks allow Live to intercept any console output and inject cursor resets + LiveRender output, matching terminal control flow from Rich.
- Adopted timer-based auto-refresh (Node `setInterval`) guarded by explicit start/stop logic; timers cleaned on stop even when nested.
- stdout/stderr redirection is achieved by patching `process.stdout.write` / `.stderr.write` through `FileProxy`, allowing arbitrary `console.log()` output to go through the live buffer without mangling tests. Redirects are optional and disabled in tests to avoid interfering with Vitest.
- LiveRender height now stores an extra line to account for the newline `Console.print` adds, yielding identical cursor sequences to Python (verified via fixture strings from `tests/test_live.py`).

---

## Blockers

**SEQUENTIAL DEPENDENCY:** Should be done AFTER tree, syntax, markdown, json — satisfied.

**Dependencies:** screen (Phase 12), file_proxy (Phase 12), live_render (Phase 13)

---

## Next Steps

- Hook Status (Phase 14) and future `Progress` port into the new Live interface.
- Evaluate adding ergonomic helpers (e.g., async context wrappers) once Node `using` semantics stabilise.

---

## Session Notes

- 2025-11-10: Ported Live tests + implementation, added render hook plumbing to `Console`, cursor helpers, auto-refresh timers, stdout/stderr redirection (optional), and LiveRender shape adjustments so cursor math matches Python. `npm run check` clean (only pre-existing lint warnings).

---

## Notes

**PORT 5th in Phase 14** - After tree, syntax, markdown, json

**USED BY:** status (Phase 14), progress (Phase 15)

**COMPLEXITY:** High (threading → timers, console redirection, positioning)

**TIME:** 1.5-2 hours

**CRITICAL:** This enables status and progress modules!
