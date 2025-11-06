/**
 * Replace :emoji: codes with characters
 * Based on rich/_emoji_replace.py
 */
import { EMOJI } from './_emoji_codes.js';

const EMOJI_REGEX = /(:(\S*?)(?:(?:-)(emoji|text))?:)/g;

/**
 * Replace emoji code in text.
 *
 * @param text - Text with emoji codes like :smiley:
 * @param defaultVariant - Default variant (emoji or text)
 * @returns Text with emoji codes replaced with Unicode characters
 */
export function _emoji_replace(text: string, defaultVariant?: 'emoji' | 'text'): string {
  const variants: Record<string, string> = {
    text: '\uFE0E',
    emoji: '\uFE0F',
  };
  const defaultVariantCode = defaultVariant ? (variants[defaultVariant] ?? '') : '';

  return text.replace(
    EMOJI_REGEX,
    (emojiCode, _, emojiName: string, variant: string | undefined) => {
      try {
        const emoji = EMOJI[emojiName.toLowerCase()];
        if (!emoji) {
          return emojiCode;
        }
        const variantCode = variant
          ? (variants[variant] ?? defaultVariantCode)
          : defaultVariantCode;
        return emoji + variantCode;
      } catch {
        return emojiCode;
      }
    }
  );
}
