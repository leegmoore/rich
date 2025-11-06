/**
 * STUB: Replace :emoji: codes with characters
 * TODO: Full implementation in Phase 6
 */
import { EMOJI } from './_emoji_codes.js';

export function _emoji_replace(text: string, _defaultVariant?: string): string {
  // STUB: Basic regex replacement
  // TODO Phase 6: Implement full variant support
  return text.replace(/:([a-zA-Z0-9_+-]+):/g, (_match, name: string) => {
    return EMOJI[name] ?? `:${name}:`;
  });
}
