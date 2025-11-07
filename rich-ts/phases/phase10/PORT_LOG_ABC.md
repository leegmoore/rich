# Module Port Log: abc

**Status:** COMPLETED  
**Dependencies:** None (standalone)  
**Python Source:** `rich/abc.py` (~33 LOC)  
**Python Tests:** `tests/test_protocol.py` (abc section)

---

## Module Overview
Defines the `RichRenderable` abstract base used as an `isinstance` check for renderable objects.

**Key Features:**
- Abstract base for renderables (duck-typed)
- Recognizes `__rich__` and `__richConsole__`/`__rich_console__`
- Provides helper type guard for runtime checks

---

## Test Port Progress

**Total Tests:** 4

- [x] test_rich_renderable_instanceof
- [x] test_rich_renderable_class_check
- [x] test_rich_renderable_negative
- [x] test_rich_renderable_type_guard

---

## Implementation Progress

- [x] RichRenderable abstract class w/ `Symbol.hasInstance`
- [x] Type guard + helper export (`isRichRenderable`)
- [x] Protocol interfaces for `__rich__` / `__richConsole__`
- [x] Handles snake_case/camelCase attributes
- [x] Tests + `npm run check`

---

## Design Decisions

- Mirrored Python behavior by hooking `Symbol.hasInstance` so callers can write `foo instanceof RichRenderable` analogous to `isinstance`.
- Added `RichRenderable.isRenderable()` + `isRichRenderable()` helper for situations where `instanceof` isn’t ergonomic (e.g., plain objects).
- Support both `__richConsole__` and legacy `__rich_console__` attribute names, plus checking constructor prototypes so classes themselves also match.

---

## Blockers

None.

---

## Session Notes

- 2025-11-07: Added `tests/abc.test.ts`, implemented `src/abc.ts`, updated exports, and ran `npm test abc -- --run` followed by `npm run check`.
