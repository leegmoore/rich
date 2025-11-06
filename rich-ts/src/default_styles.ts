/**
 * STUB: Default style definitions
 * TODO: Full implementation in Phase 6 with all 60+ style names
 * This stub provides minimal styles to unblock rule color tests
 */
import { Style } from './style.js';

export const DEFAULT_STYLES: Record<string, Style> = {
  none: Style.null(),
  'rule.line': Style.parse('bright_green'),
  'rule.text': Style.null(),
};
