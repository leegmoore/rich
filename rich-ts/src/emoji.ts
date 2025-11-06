/**
 * Emoji - A single emoji character
 * Based on rich/emoji.py
 */
import type { Console, ConsoleOptions, RenderResult } from './console.js';
import { Segment } from './segment.js';
import { StyleType } from './style.js';
import { EMOJI } from './_emoji_codes.js';
import { _emoji_replace } from './_emoji_replace.js';

export type EmojiVariant = 'emoji' | 'text';

/**
 * Exception raised when an emoji doesn't exist.
 */
export class NoEmoji extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NoEmoji';
  }
}

/**
 * A single emoji character.
 */
export class Emoji {
  static VARIANTS: Record<string, string> = {
    text: '\uFE0E',
    emoji: '\uFE0F',
  };

  name: string;
  style: StyleType;
  variant?: EmojiVariant;
  private _char: string;

  /**
   * Create an Emoji.
   *
   * @param name - Name of emoji.
   * @param style - Optional style. Defaults to 'none'.
   * @param variant - Optional variant (emoji or text).
   * @throws {NoEmoji} If the emoji doesn't exist.
   */
  constructor(name: string, style: StyleType = 'none', variant?: EmojiVariant) {
    this.name = name;
    this.style = style;
    this.variant = variant;

    const emoji = EMOJI[name];
    if (!emoji) {
      throw new NoEmoji(`No emoji called '${name}'`);
    }
    this._char = emoji;

    // Add variant suffix if specified
    if (variant) {
      this._char += Emoji.VARIANTS[variant] ?? '';
    }
  }

  /**
   * Replace emoji markup with corresponding unicode characters.
   *
   * @param text - A string with emojis codes, e.g. "Hello :smiley:!"
   * @returns A string with emoji codes replaces with actual emoji.
   */
  static replace(text: string): string {
    return _emoji_replace(text);
  }

  toString(): string {
    return this._char;
  }

  *__richConsole__(console: Console, _options: ConsoleOptions): RenderResult {
    yield new Segment(this._char, console.getStyle(this.style));
  }
}
