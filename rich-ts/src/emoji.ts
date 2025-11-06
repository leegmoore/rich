/**
 * STUB: Emoji renderable
 * TODO: Full implementation in Phase 6
 */
import type { Console, ConsoleOptions, RenderResult } from './console.js';
import { Segment } from './segment.js';
import { Style, StyleType } from './style.js';
import { EMOJI } from './_emoji_codes.js';
import { _emoji_replace } from './_emoji_replace.js';

export type EmojiVariant = 'emoji' | 'text';

export class NoEmoji extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NoEmoji';
  }
}

export class Emoji {
  name: string;
  style: StyleType;
  variant?: EmojiVariant;
  private _char: string;

  constructor(name: string, style: StyleType = 'none', variant?: EmojiVariant) {
    this.name = name;
    this.style = style;
    this.variant = variant;

    const emoji = EMOJI[name];
    if (!emoji) {
      throw new NoEmoji(`No emoji called '${name}'`);
    }
    this._char = emoji;
    // STUB: Variant support not implemented
    // TODO Phase 6: Add variant suffix (\uFE0E or \uFE0F)
  }

  static replace(text: string): string {
    return _emoji_replace(text);
  }

  toString(): string {
    return this._char;
  }

  *__richConsole__(_console: Console, _options: ConsoleOptions): RenderResult {
    // STUB: Basic rendering without style lookup
    // TODO Phase 6: Use console.getStyle() for style resolution
    const style = typeof this.style === 'string' ? Style.parse(this.style) : this.style;
    yield new Segment(this._char, style);
  }
}
