# Phase 15 Review – Progress, Pretty, _log_render, Layout, Prompt

## Quality Checks
- `npm test progress pretty _log_render scope layout prompt -- --run`
- `npm run check` (Prettier, `tsc --noEmit`, ESLint – still only the legacy `no-non-null-assertion` warnings in `progress.ts` – plus the full Vitest suite)

## Findings

### Progress (highest priority)
No new defects detected. The regressions reported in the previous review are resolved:
1. **`track()` helper now respects inferred totals.** The top-level `track()` wrapper forwards `undefined` when the caller doesn’t supply `total`, allowing `Progress.track()` to fall back to `getLengthHint()` (`rich-ts/src/progress.ts:1100-1111,1137-1155`). Vitest’s “tracks sequences via helper function” case now passes.
2. **Standalone file helpers no longer start Live when `autoRefresh` is disabled.** `wrapFile`/`openFile` only call `progress.start()` when `autoRefresh !== false`, so the byte-counting tests run without re-entering Live rendering (`rich-ts/src/progress.ts:1188-1206`). When callers do want live output, the behavior is unchanged.

### Resolved Since Prior Review
- `addTask` preserves explicit `total: null` values and only falls back to 100 when the option is truly `undefined` (`rich-ts/src/progress.ts:884-892`).
- Standalone `wrapFile`/`openFile` readers stop the `Live` session when closed and honor the caller’s auto-refresh preference (`rich-ts/src/progress.ts:1188-1206`).
- `Layout.refreshScreen` now re-renders only the named child and uses `console.updateScreenLines` when available (`rich-ts/src/layout.ts:223-240`).
- Password prompts toggle TTY raw mode so keystrokes are no longer echoed before Enter (`rich-ts/src/prompt.ts:35-84,184-197`).
- `Pretty.__richMeasure__` uses the same width budget as the render path, respecting `margin` (`rich-ts/src/pretty.ts:100-155`).
- `Console` exposes `getDatetime`/`get_datetime`, so `_log_render` can honor deterministic datetime hooks (`rich-ts/src/console.ts:250-355`, `_log_render.ts:118-128`).

## Additional Notes
- The Scope module mentioned in the prompt isn’t present in the working tree, so only the five available modules were reviewed.
- Consider fixing the ESLint `no-non-null-assertion` warnings in `progress.ts` (reported by `npm run check`) so the lint run is completely clean.
