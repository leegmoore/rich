/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

/**
 * Text with color and style.
 *
 * This module provides the Text class for styled terminal text,
 * along with the Span class for marking up regions of text.
 */

import { loopLast } from './_loop';
import { pickBool } from './_pick';
import { divideLine } from './_wrap';
// TODO: import { AlignMethod } from './align';
import { cellLen, setCellSize } from './cells';
// TODO: import { Lines } from './containers';
import { stripControlCodes } from './control';
// TODO: import { EmojiVariant } from './emoji';
// TODO: import { JupyterMixin } from './jupyter';
import { Measurement } from './measure';
import { Segment } from './segment';
import { Style, StyleType } from './style';

import type { Console, ConsoleOptions, JustifyMethod, OverflowMethod } from './console';
export type AlignMethod = 'left' | 'center' | 'right';

const DEFAULT_JUSTIFY: JustifyMethod = 'default';
const DEFAULT_OVERFLOW: OverflowMethod = 'fold';

const RE_WHITESPACE = /\s+$/;

/**
 * A plain string or a Text instance.
 */
export type TextType = string | Text;

/**
 * Callable that returns a style for a given string.
 */
export type GetStyleCallable = (text: string) => StyleType | undefined;

/**
 * A marked up region in some text.
 */
export class Span {
  /** Span start index. */
  readonly start: number;

  /** Span end index. */
  readonly end: number;

  /** Style associated with the span. */
  readonly style: string | Style;

  constructor(start: number, end: number, style: string | Style) {
    this.start = start;
    this.end = end;
    this.style = style;
  }

  toString(): string {
    return `Span(${this.start}, ${this.end}, ${JSON.stringify(this.style)})`;
  }

  /**
   * Check if span is valid (end > start).
   */
  valueOf(): boolean {
    return this.end > this.start;
  }

  /**
   * Split a span in to 2 from a given offset.
   *
   * @param offset - The offset to split at.
   * @returns A tuple of [span, optional second span].
   */
  split(offset: number): [Span, Span | undefined] {
    if (offset < this.start) {
      return [this, undefined];
    }
    if (offset >= this.end) {
      return [this, undefined];
    }

    const { start, end, style } = this;
    const span1 = new Span(start, Math.min(end, offset), style);
    const span2 = new Span(span1.end, end, style);
    return [span1, span2];
  }

  /**
   * Move start and end by a given offset.
   *
   * @param offset - Number of characters to add to start and end.
   * @returns A new Span with adjusted position.
   */
  move(offset: number): Span {
    const { start, end, style } = this;
    return new Span(start + offset, end + offset, style);
  }

  /**
   * Crop the span at the given offset.
   *
   * @param offset - A value between start and end.
   * @returns A new (possibly smaller) span.
   */
  rightCrop(offset: number): Span {
    const { start, end, style } = this;
    if (offset >= end) {
      return this;
    }
    return new Span(start, Math.min(offset, end), style);
  }

  /**
   * Extend the span by the given number of cells.
   *
   * @param cells - Additional space to add to end of span.
   * @returns A span.
   */
  extend(cells: number): Span {
    if (cells) {
      const { start, end, style } = this;
      return new Span(start, end + cells, style);
    } else {
      return this;
    }
  }
}

/**
 * A list container for Text instances.
 * TODO: Move to containers.ts module once created.
 */
export class Lines {
  readonly _lines: Text[];

  constructor(lines: Iterable<Text> = []) {
    this._lines = Array.from(lines);
  }

  toString(): string {
    return `Lines(${JSON.stringify(this._lines)})`;
  }

  *[Symbol.iterator](): Iterator<Text> {
    yield* this._lines;
  }

  getItem(index: number): Text;
  getItem(index: [number, number]): Text[];
  getItem(index: number | [number, number]): Text | Text[] {
    if (Array.isArray(index)) {
      const [start, end] = index;
      return this._lines.slice(start, end);
    }
    return this._lines[index]!;
  }

  setItem(index: number, value: Text): Lines {
    this._lines[index] = value;
    return this;
  }

  get length(): number {
    return this._lines.length;
  }

  // TODO: Implement __rich_console__ when console module is ported

  append(line: Text): void {
    this._lines.push(line);
  }

  extend(lines: Iterable<Text>): void {
    this._lines.push(...lines);
  }

  pop(index = -1): Text {
    if (index === -1) {
      return this._lines.pop()!;
    }
    const item = this._lines[index];
    this._lines.splice(index, 1);
    return item!;
  }

  /**
   * Justify and overflow text to a given width.
   * TODO: Requires Console type - implement when console module is ported.
   */
  justify(
    console: any,
    width: number,
    justify: JustifyMethod = 'left',
    overflow: OverflowMethod = 'fold'
  ): void {
    // TODO: Implement when console module is ported
    if (justify === 'left') {
      for (const line of this._lines) {
        line.truncate(width, { overflow, pad: true });
      }
    } else if (justify === 'center') {
      for (const line of this._lines) {
        line.rstrip();
        line.truncate(width, { overflow });
        line.padLeft(Math.floor((width - cellLen(line.plain)) / 2));
        line.padRight(width - cellLen(line.plain));
      }
    } else if (justify === 'right') {
      for (const line of this._lines) {
        line.rstrip();
        line.truncate(width, { overflow });
        line.padLeft(width - cellLen(line.plain));
      }
    } else if (justify === 'full') {
      for (let lineIndex = 0; lineIndex < this._lines.length; lineIndex++) {
        if (lineIndex === this._lines.length - 1) {
          break;
        }
        const line = this._lines[lineIndex]!;
        const words = line.split(' ');
        const wordsSize = words._lines.reduce((sum, word) => sum + cellLen(word.plain), 0);
        const numSpaces = words.length - 1;
        const spaces = new Array(numSpaces).fill(1);
        let index = 0;
        if (spaces.length > 0) {
          while (wordsSize + numSpaces < width) {
            spaces[spaces.length - index - 1]! += 1;
            index = (index + 1) % spaces.length;
          }
        }
        const tokens: Text[] = [];
        for (let i = 0; i < words.length; i++) {
          const word = words._lines[i]!;
          const nextWord = words._lines[i + 1];
          tokens.push(word);
          if (i < spaces.length) {
            const style = word.getStyleAtOffset(console, -1);
            const nextStyle = nextWord ? nextWord.getStyleAtOffset(console, 0) : undefined;
            const spaceStyle = style === nextStyle ? style : line.style;
            const spaceCount = spaces[i];
            if (spaceCount !== undefined) {
              tokens.push(new Text(' '.repeat(spaceCount), spaceStyle));
            }
          }
        }
        this.setItem(lineIndex, new Text('').join(tokens));
      }
    }
  }
}

/**
 * Text with color / style.
 */
export class Text {
  private _text: string[];
  private _spans: Span[];
  private _length: number;

  style: string | Style;
  justify?: JustifyMethod;
  overflow?: OverflowMethod;
  noWrap?: boolean;
  end: string;
  tabSize?: number;

  constructor(
    text = '',
    style: string | Style = '',
    options: {
      justify?: JustifyMethod;
      overflow?: OverflowMethod;
      noWrap?: boolean;
      end?: string;
      tabSize?: number;
      spans?: Span[];
    } = {}
  ) {
    const sanitizedText = stripControlCodes(text);
    this._text = [sanitizedText];
    this.style = style;
    this.justify = options.justify;
    this.overflow = options.overflow;
    this.noWrap = options.noWrap;
    this.end = options.end ?? '\n';
    this.tabSize = options.tabSize;
    this._spans = options.spans || [];
    this._length = sanitizedText.length;
  }

  get length(): number {
    return this._length;
  }

  valueOf(): boolean {
    return Boolean(this._length);
  }

  toString(): string {
    return this.plain;
  }

  toRepr(): string {
    return `<text ${JSON.stringify(this.plain)} ${JSON.stringify(this._spans)} ${JSON.stringify(this.style)}>`;
  }

  /**
   * Add this text to another string or Text.
   */
  add(other: string | Text): Text {
    if (typeof other === 'string' || other instanceof Text) {
      const result = this.copy();
      result.append(other);
      return result;
    }
    throw new TypeError('Can only add string or Text to Text');
  }

  equals(other: Text): boolean {
    if (!(other instanceof Text)) {
      return false;
    }
    return (
      this.plain === other.plain && JSON.stringify(this._spans) === JSON.stringify(other._spans)
    );
  }

  contains(other: string | Text): boolean {
    if (typeof other === 'string') {
      return this.plain.includes(other);
    } else if (other instanceof Text) {
      return this.plain.includes(other.plain);
    }
    return false;
  }

  /**
   * Get a character or slice of the text.
   */
  getItem(slice: number): Text;
  getItem(slice: { start?: number; stop?: number; step?: number }): Text;
  getItem(slice: number | { start?: number; stop?: number; step?: number }): Text {
    const getTextAt = (offset: number): Text => {
      const text = new Text(this.plain[offset] || '', '', { end: '' });
      text._spans = this._spans
        .filter((span) => span.end > offset && offset >= span.start)
        .map((span) => new Span(0, 1, span.style));
      return text;
    };

    if (typeof slice === 'number') {
      return getTextAt(slice);
    } else {
      const plainLength = this.plain.length;
      const start =
        slice.start !== undefined ? (slice.start < 0 ? plainLength + slice.start : slice.start) : 0;
      const stop =
        slice.stop !== undefined
          ? slice.stop < 0
            ? plainLength + slice.stop
            : slice.stop
          : plainLength;
      const step = slice.step ?? 1;

      if (step === 1) {
        const lines = this.divide([start, stop]);
        return lines.getItem(1);
      } else {
        throw new TypeError('slices with step!=1 are not supported');
      }
    }
  }

  /**
   * Get the number of cells required to render this text.
   */
  get cellLen(): number {
    return cellLen(this.plain);
  }

  /**
   * Get console markup to render this Text.
   */
  get markup(): string {
    // TODO: Import escape from markup module when available
    // For now, use a simplified escape that only escapes opening brackets of markup-like patterns
    const escape = (text: string): string => {
      // Only escape [ that looks like it starts a markup tag (followed by a-z, #, /, or @)
      return text.replace(/\[([a-z#\/@])/gi, '\\[$1');
    };

    const output: string[] = [];
    const plain = this.plain;
    const markupSpans: Array<[number, boolean, string | Style]> = [
      [0, false, this.style],
      ...this._spans.map((span): [number, boolean, string | Style] => [
        span.start,
        false,
        span.style,
      ]),
      ...this._spans.map((span): [number, boolean, string | Style] => [span.end, true, span.style]),
      [plain.length, true, this.style],
    ];

    markupSpans.sort((a, b) => {
      if (a[0] !== b[0]) return a[0] - b[0];
      return (a[1] ? 1 : 0) - (b[1] ? 1 : 0);
    });

    let position = 0;
    for (const [offset, closing, style] of markupSpans) {
      if (offset > position) {
        output.push(escape(plain.slice(position, offset)));
        position = offset;
      }
      if (style) {
        const styleStr = String(style);
        output.push(closing ? `[/${styleStr}]` : `[${styleStr}]`);
      }
    }

    return output.join('');
  }

  /**
   * Create Text instance from markup.
   * TODO: Requires markup module.
   */
  static fromMarkup(
    _text: string,
    _options: {
      style?: string | Style;
      emoji?: boolean;
      emojiVariant?: any; // TODO: EmojiVariant type
      justify?: JustifyMethod;
      overflow?: OverflowMethod;
      end?: string;
    } = {}
  ): Text {
    // TODO: Import render from markup module
    throw new Error('fromMarkup requires markup module - not yet ported');
  }

  /**
   * Create a Text object from a string containing ANSI escape codes.
   * TODO: Requires ansi module.
   */
  static fromAnsi(
    _text: string,
    _options: {
      style?: string | Style;
      justify?: JustifyMethod;
      overflow?: OverflowMethod;
      noWrap?: boolean;
      end?: string;
      tabSize?: number;
    } = {}
  ): Text {
    // TODO: Import AnsiDecoder from ansi module
    throw new Error('fromAnsi requires ansi module - not yet ported');
  }

  /**
   * Construct a Text instance with a pre-applied style.
   */
  static styled(
    text: string,
    style: StyleType = '',
    options: {
      justify?: JustifyMethod;
      overflow?: OverflowMethod;
    } = {}
  ): Text {
    const styledText = new Text(text, '', options);
    styledText.stylize(style);
    return styledText;
  }

  /**
   * Construct a text instance by combining a sequence of strings with optional styles.
   */
  static assemble(
    parts: Array<string | Text | [string, StyleType]>,
    options: {
      style?: string | Style;
      justify?: JustifyMethod;
      overflow?: OverflowMethod;
      noWrap?: boolean;
      end?: string;
      tabSize?: number;
      meta?: Record<string, any>;
    } = {}
  ): Text {
    const text = new Text('', options.style || '', {
      justify: options.justify,
      overflow: options.overflow,
      noWrap: options.noWrap,
      end: options.end,
      tabSize: options.tabSize,
    });

    for (const part of parts) {
      if (typeof part === 'string' || part instanceof Text) {
        text.append(part);
      } else {
        text.append(part[0], part[1]);
      }
    }

    if (options.meta) {
      text.applyMeta(options.meta);
    }

    return text;
  }

  /**
   * Get the text as a single string.
   */
  get plain(): string {
    if (this._text.length !== 1) {
      this._text = [this._text.join('')];
    }
    return this._text[0]!;
  }

  /**
   * Set the text to a new value.
   */
  set plain(newText: string) {
    if (newText !== this.plain) {
      const sanitizedText = stripControlCodes(newText);
      this._text = [sanitizedText];
      const oldLength = this._length;
      this._length = sanitizedText.length;
      if (oldLength > this._length) {
        this._trimSpans();
      }
    }
  }

  /**
   * Get a reference to the internal list of spans.
   */
  get spans(): Span[] {
    return this._spans;
  }

  /**
   * Set spans.
   */
  set spans(spans: Span[]) {
    this._spans = [...spans];
  }

  /**
   * Return a new Text instance with copied metadata (but not the string or spans).
   */
  blankCopy(plain = ''): Text {
    return new Text(plain, this.style, {
      justify: this.justify,
      overflow: this.overflow,
      noWrap: this.noWrap,
      end: this.end,
      tabSize: this.tabSize,
    });
  }

  /**
   * Return a copy of this instance.
   */
  copy(): Text {
    const copySelf = new Text(this.plain, this.style, {
      justify: this.justify,
      overflow: this.overflow,
      noWrap: this.noWrap,
      end: this.end,
      tabSize: this.tabSize,
    });
    copySelf._spans = [...this._spans];
    return copySelf;
  }

  /**
   * Apply a style to the text, or a portion of the text.
   */
  stylize(style: string | Style, start = 0, end?: number): void {
    if (!style) {
      return;
    }

    const length = this.length;
    const actualStart = start < 0 ? length + start : start;
    const actualEnd = end === undefined ? length : end < 0 ? length + end : end;

    if (actualStart >= length || actualEnd <= actualStart) {
      // Span not in text or not valid
      return;
    }

    this._spans.push(new Span(actualStart, Math.min(length, actualEnd), style));
  }

  /**
   * Apply a style to the text, or a portion of the text.
   * Styles will be applied before other styles already present.
   */
  stylizeBefore(style: string | Style, start = 0, end?: number): void {
    if (!style) {
      return;
    }

    const length = this.length;
    const actualStart = start < 0 ? length + start : start;
    const actualEnd = end === undefined ? length : end < 0 ? length + end : end;

    if (actualStart >= length || actualEnd <= actualStart) {
      // Span not in text or not valid
      return;
    }

    this._spans.unshift(new Span(actualStart, Math.min(length, actualEnd), style));
  }

  /**
   * Apply metadata to the text, or a portion of the text.
   */
  applyMeta(meta: Record<string, any>, start = 0, end?: number): void {
    const style = Style.fromMeta(meta);
    this.stylize(style, start, end);
  }

  /**
   * Apply event handlers (used by Textual project).
   */
  on(meta?: Record<string, any>, handlers?: Record<string, any>): Text {
    const allMeta = meta ? { ...meta } : {};
    if (handlers) {
      for (const [key, value] of Object.entries(handlers)) {
        allMeta[`@${key}`] = value;
      }
    }
    this.stylize(Style.fromMeta(allMeta));
    return this;
  }

  /**
   * Remove a suffix if it exists.
   */
  removeSuffix(suffix: string): void {
    if (this.plain.endsWith(suffix)) {
      this.rightCrop(suffix.length);
    }
  }

  /**
   * Get the style of a character at give offset.
   * TODO: Requires Console type.
   */
  getStyleAtOffset(_console: any, offset: number): Style {
    // TODO: This requires console.getStyle - implement when console module is ported
    if (offset < 0) {
      offset = this.length + offset;
    }
    const getStyle = (style: string | Style): Style => {
      if (typeof style === 'string') {
        // TODO: Use console.getStyle when available
        return Style.null();
      }
      return style;
    };

    let style = getStyle(this.style);
    for (const [start, end, spanStyle] of this._spans.map(
      (s) => [s.start, s.end, s.style] as const
    )) {
      if (end > offset && offset >= start) {
        style = style.add(getStyle(spanStyle));
      }
    }
    return style;
  }

  /**
   * Extend the Text given number of spaces where the spaces have the same style as the last character.
   */
  extendStyle(spaces: number): void {
    if (spaces <= 0) {
      return;
    }

    const spans = this.spans;
    const newSpaces = ' '.repeat(spaces);

    if (spans.length > 0) {
      const endOffset = this.length;
      this._spans = spans.map((span) => (span.end >= endOffset ? span.extend(spaces) : span));
      this._text.push(newSpaces);
      this._length += spaces;
    } else {
      this.plain += newSpaces;
    }
  }

  /**
   * Highlight text with a regular expression, where group names are translated to styles.
   */
  highlightRegex(
    reHighlight: RegExp | string,
    style?: GetStyleCallable | StyleType,
    options: {
      stylePrefix?: string;
    } = {}
  ): number {
    const stylePrefix = options.stylePrefix || '';
    let count = 0;
    const plain = this.plain;
    const regex = typeof reHighlight === 'string' ? new RegExp(reHighlight, 'g') : reHighlight;

    let match: RegExpExecArray | null;
    while ((match = regex.exec(plain)) !== null) {
      if (style) {
        const start = match.index;
        const end = start + match[0].length;
        const matchStyle = typeof style === 'function' ? style(plain.slice(start, end)) : style;
        if (matchStyle !== undefined && end > start) {
          this._spans.push(new Span(start, end, matchStyle));
        }
      }

      count++;

      // Handle named groups
      if (match.groups) {
        for (const [name, value] of Object.entries(match.groups)) {
          if (value !== undefined) {
            const groupIndex = plain.indexOf(value, match.index);
            if (groupIndex !== -1) {
              const start = groupIndex;
              const end = start + value.length;
              if (end > start) {
                this._spans.push(new Span(start, end, `${stylePrefix}${name}`));
              }
            }
          }
        }
      }
    }

    return count;
  }

  /**
   * Highlight words with a style.
   */
  highlightWords(
    words: Iterable<string>,
    style: string | Style,
    options: {
      caseSensitive?: boolean;
    } = {}
  ): number {
    const caseSensitive = options.caseSensitive ?? true;
    const reWords = Array.from(words)
      .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');

    let count = 0;
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(reWords, flags);

    let match: RegExpExecArray | null;
    while ((match = regex.exec(this.plain)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      this._spans.push(new Span(start, end, style));
      count++;
    }

    return count;
  }

  /**
   * Strip whitespace from end of text.
   */
  rstrip(): void {
    this.plain = this.plain.replace(/\s+$/, '');
  }

  /**
   * Remove whitespace beyond a certain width at the end of the text.
   */
  rstripEnd(size: number): void {
    const textLength = this.length;
    if (textLength > size) {
      const excess = textLength - size;
      const whitespaceMatch = RE_WHITESPACE.exec(this.plain);
      if (whitespaceMatch !== null) {
        const whitespaceCount = whitespaceMatch[0].length;
        this.rightCrop(Math.min(whitespaceCount, excess));
      }
    }
  }

  /**
   * Set new length of the text, clipping or padding is required.
   */
  setLength(newLength: number): void {
    const length = this.length;
    if (length !== newLength) {
      if (length < newLength) {
        this.padRight(newLength - length);
      } else {
        this.rightCrop(length - newLength);
      }
    }
  }

  /**
   * Console render method - wraps text to console width.
   */
  *__richConsole__(console: Console, options: ConsoleOptions): Iterable<Segment> {
    const tabSize = this.tabSize ?? 8;
    const justify = this.justify ?? DEFAULT_JUSTIFY;
    const overflow = this.overflow ?? DEFAULT_OVERFLOW;
    const noWrap = this.noWrap ?? false;

    const lines = this.wrap(
      console,
      options.maxWidth,
      {
        justify,
        overflow,
        tabSize,
        noWrap,
      }
    );

    const allLines = new Text('\n').join(lines);
    yield* allLines.render(console, this.end);
  }

  /**
   * Rich measure method - returns the minimum and maximum widths of the text.
   * Minimum is based on the longest word, maximum is based on the longest line.
   */
  __richMeasure__(_console: Console, _options: ConsoleOptions): Measurement {
    const text = this.plain;
    const lines = text.split('\n');

    // Maximum is the longest line
    const maxTextWidth = lines.length > 0 ? Math.max(...lines.map((line) => cellLen(line))) : 0;

    // Minimum is the longest word (split by whitespace)
    const words = text.split(/\s+/).filter((word) => word.length > 0);
    const minTextWidth =
      words.length > 0 ? Math.max(...words.map((word) => cellLen(word))) : maxTextWidth;

    return new Measurement(minTextWidth, maxTextWidth);
  }

  /**
   * Render the text as Segments.
   * TODO: Requires Console type.
   */
  render(_console: any, end = ''): Segment[] {
    // TODO: This requires console.getStyle - implement fully when console module is ported
    const segments: Segment[] = [];
    const text = this.plain;

    if (this._spans.length === 0) {
      segments.push(new Segment(text));
      if (end) {
        segments.push(new Segment(end));
      }
      return segments;
    }

    // Simple implementation - full implementation requires console.getStyle
    const getStyle = (_style: string | Style): Style => {
      if (typeof _style === 'string') {
        return Style.null();
      }
      return _style;
    };

    const enumeratedSpans = this._spans.map((span, index) => [index + 1, span] as const);
    const styleMap: Record<number, Style> = {};
    for (const [index, span] of enumeratedSpans) {
      styleMap[index] = getStyle(span.style);
    }
    styleMap[0] = getStyle(this.style);

    const spans: Array<[number, boolean, number]> = [
      [0, false, 0],
      ...enumeratedSpans.map(([index, span]): [number, boolean, number] => [
        span.start,
        false,
        index,
      ]),
      ...enumeratedSpans.map(([index, span]): [number, boolean, number] => [span.end, true, index]),
      [text.length, true, 0],
    ];

    spans.sort((a, b) => {
      if (a[0] !== b[0]) return a[0] - b[0];
      return (a[1] ? 1 : 0) - (b[1] ? 1 : 0);
    });

    const stack: number[] = [];
    const styleCache = new Map<string, Style>();

    const getCurrentStyle = (): Style => {
      const styles = stack
        .slice()
        .sort()
        .map((id) => styleMap[id]!);
      const key = JSON.stringify(styles);
      const cached = styleCache.get(key);
      if (cached !== undefined) {
        return cached;
      }
      const currentStyle = Style.combine(styles);
      styleCache.set(key, currentStyle);
      return currentStyle;
    };

    for (let i = 0; i < spans.length - 1; i++) {
      const [offset, leaving, styleId] = spans[i]!;
      const [nextOffset] = spans[i + 1]!;

      if (leaving) {
        const index = stack.indexOf(styleId);
        if (index > -1) {
          stack.splice(index, 1);
        }
      } else {
        stack.push(styleId);
      }

      if (nextOffset > offset) {
        segments.push(new Segment(text.slice(offset, nextOffset), getCurrentStyle()));
      }
    }

    if (end) {
      segments.push(new Segment(end));
    }

    return segments;
  }

  /**
   * Join text together with this instance as the separator.
   */
  join(lines: Iterable<Text>): Text {
    const newText = this.blankCopy();
    const linesArray = Array.from(lines);

    const getIterText = (separator: Text): Generator<Text> => {
      function* iterText(): Generator<Text> {
        if (separator.plain) {
          for (const [last, line] of loopLast(linesArray)) {
            yield line;
            if (!last) {
              yield separator;
            }
          }
        } else {
          yield* linesArray;
        }
      }
      return iterText();
    };

    let offset = 0;
    for (const text of getIterText(this)) {
      newText._text.push(...text._text);
      if (text.style) {
        newText._spans.push(new Span(offset, offset + text.length, text.style));
      }
      newText._spans.push(
        ...text._spans.map((span) => new Span(offset + span.start, offset + span.end, span.style))
      );
      offset += text.length;
    }

    newText._length = offset;
    return newText;
  }

  /**
   * Converts tabs to spaces.
   */
  expandTabs(tabSize?: number): void {
    if (!this.plain.includes('\t')) {
      return;
    }

    const actualTabSize = tabSize ?? this.tabSize ?? 8;
    const newText: Text[] = [];

    for (const line of this.split('\n', { includeSeparator: true })._lines) {
      if (!line.plain.includes('\t')) {
        newText.push(line);
      } else {
        let cellPosition = 0;
        const parts = line.split('\t', { includeSeparator: true });

        for (const part of parts._lines) {
          if (part.plain.endsWith('\t')) {
            part._text[part._text.length - 1] =
              part._text[part._text.length - 1]!.slice(0, -1) + ' ';
            cellPosition += part.cellLen;
            const tabRemainder = cellPosition % actualTabSize;
            if (tabRemainder) {
              const spaces = actualTabSize - tabRemainder;
              part.extendStyle(spaces);
              cellPosition += spaces;
            }
          } else {
            cellPosition += part.cellLen;
          }
          newText.push(part);
        }
      }
    }

    const result = new Text('').join(newText);
    this._text = [result.plain];
    this._length = this.plain.length;
    this._spans = [...result._spans];
  }

  /**
   * Truncate text if it is longer that a given width.
   */
  truncate(
    maxWidth: number,
    options: {
      overflow?: OverflowMethod;
      pad?: boolean;
    } = {}
  ): void {
    const overflow = options.overflow || this.overflow || DEFAULT_OVERFLOW;
    const pad = options.pad ?? false;

    if (overflow !== 'ignore') {
      const length = cellLen(this.plain);
      if (length > maxWidth) {
        if (overflow === 'ellipsis') {
          this.plain = setCellSize(this.plain, maxWidth - 1) + '…';
        } else {
          this.plain = setCellSize(this.plain, maxWidth);
        }
      }
      if (pad && length < maxWidth) {
        const spaces = maxWidth - length;
        this._text = [`${this.plain}${' '.repeat(spaces)}`];
        this._length = this.plain.length;
      }
    }
  }

  /**
   * Remove or modify any spans that are over the end of the text.
   */
  private _trimSpans(): void {
    const maxOffset = this.plain.length;
    this._spans = this._spans
      .filter((span) => span.start < maxOffset)
      .map((span) => {
        if (span.end < maxOffset) {
          return span;
        }
        return new Span(span.start, Math.min(maxOffset, span.end), span.style);
      });
  }

  /**
   * Pad left and right with a given number of characters.
   */
  pad(count: number, character = ' '): void {
    if (character.length !== 1) {
      throw new Error('Character must be a string of length 1');
    }
    if (count) {
      const padCharacters = character.repeat(count);
      this.plain = `${padCharacters}${this.plain}${padCharacters}`;
      this._spans = this._spans.map(
        (span) => new Span(span.start + count, span.end + count, span.style)
      );
    }
  }

  /**
   * Pad the left with a given character.
   */
  padLeft(count: number, character = ' '): void {
    if (character.length !== 1) {
      throw new Error('Character must be a string of length 1');
    }
    if (count) {
      this.plain = `${character.repeat(count)}${this.plain}`;
      this._spans = this._spans.map(
        (span) => new Span(span.start + count, span.end + count, span.style)
      );
    }
  }

  /**
   * Pad the right with a given character.
   */
  padRight(count: number, character = ' '): void {
    if (character.length !== 1) {
      throw new Error('Character must be a string of length 1');
    }
    if (count) {
      this.plain = `${this.plain}${character.repeat(count)}`;
    }
  }

  /**
   * Align text to a given width.
   * TODO: Requires AlignMethod type from align module.
   */
  align(align: AlignMethod, width: number, character = ' '): void {
    this.truncate(width);
    const excessSpace = width - cellLen(this.plain);
    if (excessSpace) {
      if (align === 'left') {
        this.padRight(excessSpace, character);
      } else if (align === 'center') {
        const left = Math.floor(excessSpace / 2);
        this.padLeft(left, character);
        this.padRight(excessSpace - left, character);
      } else {
        this.padLeft(excessSpace, character);
      }
    }
  }

  /**
   * Add text with an optional style.
   */
  append(text: Text | string, style?: string | Style): Text {
    if (typeof text !== 'string' && !(text instanceof Text)) {
      throw new TypeError('Only str or Text can be appended to Text');
    }

    if (text.length > 0 || (typeof text === 'string' && text.length > 0)) {
      if (typeof text === 'string') {
        const sanitizedText = stripControlCodes(text);
        this._text.push(sanitizedText);
        const offset = this.length;
        const textLength = sanitizedText.length;
        if (style) {
          this._spans.push(new Span(offset, offset + textLength, style));
        }
        this._length += textLength;
      } else if (text instanceof Text) {
        if (style !== undefined) {
          throw new Error('style must not be set when appending Text instance');
        }
        const textLength = this._length;
        // Copy text properties to avoid self-reference issues
        const plainText = text.plain;
        const textSpans = [...text._spans];
        const textStyle = text.style;

        if (textStyle) {
          this._spans.push(new Span(textLength, textLength + text.length, textStyle));
        }
        this._text.push(plainText);
        this._spans.push(
          ...textSpans.map(
            (span) => new Span(span.start + textLength, span.end + textLength, span.style)
          )
        );
        this._length += text.length;
      }
    }

    return this;
  }

  /**
   * Append another Text instance. This method is more performant than Text.append.
   */
  appendText(text: Text): Text {
    const textLength = this._length;
    // Copy text properties to avoid self-reference issues
    const plainText = text.plain;
    const textSpans = [...text._spans];
    const textStyle = text.style;
    const textLen = text.length;

    if (textStyle) {
      this._spans.push(new Span(textLength, textLength + textLen, textStyle));
    }
    this._text.push(plainText);
    this._spans.push(
      ...textSpans.map(
        (span) => new Span(span.start + textLength, span.end + textLength, span.style)
      )
    );
    this._length += textLen;
    return this;
  }

  /**
   * Append iterable of str and style.
   */
  appendTokens(tokens: Iterable<[string, StyleType | undefined]>): Text {
    let offset = this.length;
    for (const [content, style] of tokens) {
      const sanitizedContent = stripControlCodes(content);
      this._text.push(sanitizedContent);
      if (style) {
        this._spans.push(new Span(offset, offset + sanitizedContent.length, style));
      }
      offset += sanitizedContent.length;
    }
    this._length = offset;
    return this;
  }

  /**
   * Copy styles from another Text instance.
   */
  copyStyles(text: Text): void {
    this._spans.push(...text._spans);
  }

  /**
   * Split rich text in to lines, preserving styles.
   */
  split(
    separator = '\n',
    options: {
      includeSeparator?: boolean;
      allowBlank?: boolean;
    } = {}
  ): Lines {
    const includeSeparator = options.includeSeparator ?? false;
    const allowBlank = options.allowBlank ?? false;

    if (!separator) {
      throw new Error('separator must not be empty');
    }

    const text = this.plain;
    if (!text.includes(separator)) {
      return new Lines([this.copy()]);
    }

    if (includeSeparator) {
      const regex = new RegExp(separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const offsets: number[] = [];
      let match: RegExpExecArray | null;
      while ((match = regex.exec(text)) !== null) {
        offsets.push(match.index + match[0].length);
      }
      const lines = this.divide(offsets);
      return lines;
    } else {
      // eslint-disable-next-line no-inner-declarations
      function* flattenSpans(): Generator<number> {
        const regex = new RegExp(separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        let match: RegExpExecArray | null;
        while ((match = regex.exec(text)) !== null) {
          yield match.index;
          yield match.index + match[0].length;
        }
      }

      const lines = new Lines(
        Array.from(this.divide(Array.from(flattenSpans()))).filter(
          (line) => line.plain !== separator
        )
      );

      if (!allowBlank && text.endsWith(separator)) {
        lines.pop();
      }

      return lines;
    }
  }

  /**
   * Divide text in to a number of lines at given offsets.
   */
  divide(offsets: Iterable<number>): Lines {
    const offsetsArray = Array.from(offsets);

    if (offsetsArray.length === 0) {
      return new Lines([this.copy()]);
    }

    const text = this.plain;
    const textLength = text.length;
    const divideOffsets = [0, ...offsetsArray, textLength];
    const lineRanges: Array<[number, number]> = [];
    for (let i = 0; i < divideOffsets.length - 1; i++) {
      lineRanges.push([divideOffsets[i]!, divideOffsets[i + 1]!]);
    }

    const style = this.style;
    const justify = this.justify;
    const overflow = this.overflow;

    const newLines = new Lines(
      lineRanges.map(
        ([start, end]) =>
          new Text(text.slice(start, end), style, {
            justify,
            overflow,
          })
      )
    );

    if (this._spans.length === 0) {
      return newLines;
    }

    const lineAppends = newLines._lines.map((line) => line._spans);
    const lineCount = lineRanges.length;

    for (const span of this._spans) {
      const spanStart = span.start;
      const spanEnd = span.end;
      const spanStyle = span.style;

      // Binary search for start line
      let lowerBound = 0;
      let upperBound = lineCount;
      let startLineNo = Math.floor((lowerBound + upperBound) / 2);

      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (lowerBound > upperBound) {
          // Bounds crossed - should not happen with valid data, use lower bound
          startLineNo = Math.max(0, Math.min(lowerBound, lineCount - 1));
          break;
        }
        const [lineStart, lineEnd] = lineRanges[startLineNo]!;
        if (spanStart < lineStart) {
          upperBound = startLineNo - 1;
        } else if (spanStart > lineEnd) {
          lowerBound = startLineNo + 1;
        } else {
          break;
        }
        startLineNo = Math.floor((lowerBound + upperBound) / 2);
      }

      let endLineNo: number;
      if (spanEnd < lineRanges[startLineNo]![1]) {
        endLineNo = startLineNo;
      } else {
        lowerBound = startLineNo;
        upperBound = lineCount;

        endLineNo = Math.floor((lowerBound + upperBound) / 2);
        // eslint-disable-next-line no-constant-condition
        while (true) {
          if (lowerBound > upperBound) {
            // Bounds crossed - should not happen with valid data, use lower bound
            endLineNo = Math.max(0, Math.min(lowerBound, lineCount - 1));
            break;
          }
          const [lineStart, lineEnd] = lineRanges[endLineNo]!;
          if (spanEnd < lineStart) {
            upperBound = endLineNo - 1;
          } else if (spanEnd > lineEnd) {
            lowerBound = endLineNo + 1;
          } else {
            break;
          }
          endLineNo = Math.floor((lowerBound + upperBound) / 2);
        }
      }

      for (let lineNo = startLineNo; lineNo <= endLineNo; lineNo++) {
        const [lineStart, lineEnd] = lineRanges[lineNo]!;
        const newStart = Math.max(0, spanStart - lineStart);
        const newEnd = Math.min(spanEnd - lineStart, lineEnd - lineStart);
        if (newEnd > newStart) {
          lineAppends[lineNo]!.push(new Span(newStart, newEnd, spanStyle));
        }
      }
    }

    return newLines;
  }

  /**
   * Remove a number of characters from the end of the text.
   */
  rightCrop(amount = 1): void {
    const maxOffset = this.plain.length - amount;
    this._spans = this._spans
      .filter((span) => span.start < maxOffset)
      .map((span) => {
        if (span.end < maxOffset) {
          return span;
        }
        return new Span(span.start, Math.min(maxOffset, span.end), span.style);
      });
    this._text = [this.plain.slice(0, -amount)];
    this._length -= amount;
  }

  /**
   * Word wrap the text.
   * TODO: Requires Console type.
   */
  wrap(
    console: any,
    width: number,
    options: {
      justify?: JustifyMethod;
      overflow?: OverflowMethod;
      tabSize?: number;
      noWrap?: boolean;
    } = {}
  ): Lines {
    const wrapJustify = options.justify || this.justify || DEFAULT_JUSTIFY;
    const wrapOverflow = options.overflow || this.overflow || DEFAULT_OVERFLOW;
    const tabSize = options.tabSize ?? 8;

    const noWrap = pickBool(options.noWrap, this.noWrap, false) || options.overflow === 'ignore';

    const lines = new Lines();
    for (const line of this.split('\n', { allowBlank: true })._lines) {
      if (line.plain.includes('\t')) {
        line.expandTabs(tabSize);
      }

      let newLines: Lines;
      if (noWrap) {
        newLines = new Lines([line]);
      } else {
        const offsets = divideLine(line.plain, width, wrapOverflow === 'fold');
        newLines = line.divide(offsets);
      }

      for (const l of newLines._lines) {
        l.rstripEnd(width);
      }

      if (wrapJustify) {
        newLines.justify(console, width, wrapJustify, wrapOverflow);
      }

      for (const l of newLines._lines) {
        l.truncate(width, { overflow: wrapOverflow });
      }

      lines.extend(newLines._lines);
    }

    return lines;
  }

  /**
   * Fit the text in to given width by chopping in to lines.
   */
  fit(width: number): Lines {
    const lines = new Lines();
    for (const line of this.split()._lines) {
      line.setLength(width);
      lines.append(line);
    }
    return lines;
  }

  /**
   * Auto-detect indentation of code.
   */
  detectIndentation(): number {
    const indentations = new Set<number>();
    const regex = /^( +)/gm; // Only match lines that start with at least one space

    // Use matchAll to safely iterate through all matches
    const plainText = this.plain;
    const matches = plainText.matchAll(regex);

    for (const m of matches) {
      const indent = m[1]!.length;
      indentations.add(indent);
    }

    const validIndents = Array.from(indentations).filter((indent) => indent % 2 === 0);

    if (validIndents.length === 0) {
      return 1;
    }

    // Calculate GCD of all indentations
    const gcd = (a: number, b: number): number => {
      return b === 0 ? a : gcd(b, a % b);
    };

    return validIndents.reduce(gcd) || 1;
  }

  /**
   * Adds indent guide lines to text.
   */
  withIndentGuides(
    indentSize?: number,
    options: {
      character?: string;
      style?: StyleType;
    } = {}
  ): Text {
    const character = options.character ?? '│';
    const style = options.style ?? 'dim green';

    const actualIndentSize = indentSize ?? this.detectIndentation();
    const text = this.copy();
    text.expandTabs();

    const indentLine = `${character}${' '.repeat(actualIndentSize - 1)}`;
    const reIndent = /^( *)(.*)$/;
    const newLines: Text[] = [];
    let blankLines = 0;

    for (const line of text.split('\n', { allowBlank: true })._lines) {
      const match = reIndent.exec(line.plain);
      if (!match?.[2]) {
        blankLines++;
        continue;
      }

      const indent = match[1]!;
      const fullIndents = Math.floor(indent.length / actualIndentSize);
      const remainingSpace = indent.length % actualIndentSize;
      const newIndent = indentLine.repeat(fullIndents) + ' '.repeat(remainingSpace);

      line.plain = newIndent + line.plain.slice(newIndent.length);
      line.stylize(style, 0, newIndent.length);

      if (blankLines) {
        for (let i = 0; i < blankLines; i++) {
          newLines.push(new Text(newIndent, style));
        }
        blankLines = 0;
      }

      newLines.push(line);
    }

    if (blankLines) {
      for (let i = 0; i < blankLines; i++) {
        newLines.push(new Text('', style));
      }
    }

    const newText = text.blankCopy('\n').join(newLines);
    return newText;
  }
}
