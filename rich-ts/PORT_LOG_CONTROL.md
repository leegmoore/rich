# Module Port Log: control

**Status:** ✅ DONE
**Dependencies:** segment (already complete)
**Python Source:** `rich/control.py` (~210 LOC)
**Python Tests:** `tests/test_control.py` (7 tests)
**TypeScript:** `src/control.ts` (~220 LOC)
**Tests:** `tests/control.test.ts` (7/7 passing)

---

## Module Overview
Terminal control codes (ANSI escape sequences).

**Purpose:** Generate ANSI control sequences for cursor movement, screen clearing, etc.

---

## Test Port Progress

**Total Tests:** 7

- [x] test_control - Basic control code generation
- [x] test_strip_control_codes - Strip control codes from text
- [x] test_escape_control_codes - Escape control codes in text
- [x] test_control_move_to - Absolute cursor positioning
- [x] test_control_move - Relative cursor movement
- [x] test_move_to_column - Column-based positioning
- [x] test_title - Set window title

---

## Implementation Progress

- [x] Control class
- [x] CONTROL_CODES_FORMAT mapping
- [x] Static factory methods (bell, home, move, moveTo, etc.)
- [x] stripControlCodes utility
- [x] escapeControlCodes utility
- [x] All tests passing (7/7)

---

## Design Decisions

1. **Type-safe format functions**: Used union type for format functions instead of `any`, supporting both number parameters and string parameters.

2. **Reused ControlType from segment**: ControlType enum and ControlCode type are already defined in segment module, which this module depends on.

3. **Utility functions**: stripControlCodes and escapeControlCodes use regex-based replacement instead of Python's translate() method.

---

## Blockers

None

---

## Session Notes

### 2025-11-05 - Module Complete
- Ported all 7 tests from Python
- Implemented Control class with all factory methods
- Implemented ANSI escape sequence generation
- All tests passing (7/7)
- No known issues

