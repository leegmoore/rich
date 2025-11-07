/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Color, ColorParseError, ColorSystem } from './color.js';
import { ColorTriplet } from './color_triplet.js';
import { StyleSyntaxError } from './errors.js';

/**
 * Style type - can be a Style instance or a string definition
 */
export type StyleType = string | Style;

/**
 * Style attribute names
 */
const STYLE_ATTRIBUTES: Record<string, string> = {
  dim: 'dim',
  d: 'dim',
  bold: 'bold',
  b: 'bold',
  italic: 'italic',
  i: 'italic',
  underline: 'underline',
  u: 'underline',
  blink: 'blink',
  blink2: 'blink2',
  reverse: 'reverse',
  r: 'reverse',
  conceal: 'conceal',
  c: 'conceal',
  strike: 'strike',
  s: 'strike',
  underline2: 'underline2',
  uu: 'underline2',
  frame: 'frame',
  encircle: 'encircle',
  overline: 'overline',
  o: 'overline',
};

/**
 * Maps style bit positions to SGR parameters
 */
const STYLE_MAP: Record<number, string> = {
  0: '1', // bold
  1: '2', // dim
  2: '3', // italic
  3: '4', // underline
  4: '5', // blink
  5: '6', // blink2
  6: '7', // reverse
  7: '8', // conceal
  8: '9', // strike
  9: '21', // underline2
  10: '51', // frame
  11: '52', // encircle
  12: '53', // overline
};

/**
 * Default terminal theme (simplified - full theme would come from terminal_theme module)
 */
const DEFAULT_TERMINAL_THEME = {
  foregroundColor: new ColorTriplet(0xd4, 0xd4, 0xd4),
  backgroundColor: new ColorTriplet(0x00, 0x00, 0x00),
};

/**
 * Blend two RGB colors
 */
function blendRgb(color1: ColorTriplet, color2: ColorTriplet, fraction: number): ColorTriplet {
  return new ColorTriplet(
    Math.round(color1.red + (color2.red - color1.red) * fraction),
    Math.round(color1.green + (color2.green - color1.green) * fraction),
    Math.round(color1.blue + (color2.blue - color1.blue) * fraction)
  );
}

/**
 * Generate a random link ID
 */
function generateLinkId(meta?: any): string {
  const random = Math.floor(Math.random() * 1000000);
  const metaHash = meta !== undefined ? hashObject(meta) : 0;
  return `${random}${metaHash}`;
}

/**
 * Simple hash function for objects
 */
function hashObject(obj: any): number {
  const str = JSON.stringify(obj);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

/**
 * Options for creating a Style
 */
export interface StyleOptions {
  color?: string | Color;
  bgcolor?: string | Color;
  bold?: boolean;
  dim?: boolean;
  italic?: boolean;
  underline?: boolean;
  blink?: boolean;
  blink2?: boolean;
  reverse?: boolean;
  conceal?: boolean;
  strike?: boolean;
  underline2?: boolean;
  frame?: boolean;
  encircle?: boolean;
  overline?: boolean;
  link?: string;
  meta?: Record<string, any>;
}

/**
 * A terminal style.
 *
 * A terminal style consists of a color (color), a background color (bgcolor), and a number of
 * attributes, such as bold, italic etc. The attributes have 3 states: they can either be on
 * (true), off (false), or not set (undefined).
 */
export class Style {
  private _color?: Color;
  private _bgcolor?: Color;
  private _attributes: number;
  private _setAttributes: number;
  private _link?: string;
  private _linkId: string;
  private _ansi?: string;
  private _styleDefinition?: string;
  public _hash?: number;
  private _null: boolean;
  private _meta?: Record<string, any>;

  constructor(options: StyleOptions = {}) {
    const {
      color,
      bgcolor,
      bold,
      dim,
      italic,
      underline,
      blink,
      blink2,
      reverse,
      conceal,
      strike,
      underline2,
      frame,
      encircle,
      overline,
      link,
      meta,
    } = options;

    this._color = color ? (typeof color === 'string' ? Color.parse(color) : color) : undefined;
    this._bgcolor = bgcolor
      ? typeof bgcolor === 'string'
        ? Color.parse(bgcolor)
        : bgcolor
      : undefined;

    // Calculate set attributes bitmask
    this._setAttributes =
      (bold !== undefined ? 1 : 0) |
      (dim !== undefined ? 2 : 0) |
      (italic !== undefined ? 4 : 0) |
      (underline !== undefined ? 8 : 0) |
      (blink !== undefined ? 16 : 0) |
      (blink2 !== undefined ? 32 : 0) |
      (reverse !== undefined ? 64 : 0) |
      (conceal !== undefined ? 128 : 0) |
      (strike !== undefined ? 256 : 0) |
      (underline2 !== undefined ? 512 : 0) |
      (frame !== undefined ? 1024 : 0) |
      (encircle !== undefined ? 2048 : 0) |
      (overline !== undefined ? 4096 : 0);

    // Calculate attribute values bitmask
    this._attributes = this._setAttributes
      ? (bold ? 1 : 0) |
        (dim ? 2 : 0) |
        (italic ? 4 : 0) |
        (underline ? 8 : 0) |
        (blink ? 16 : 0) |
        (blink2 ? 32 : 0) |
        (reverse ? 64 : 0) |
        (conceal ? 128 : 0) |
        (strike ? 256 : 0) |
        (underline2 ? 512 : 0) |
        (frame ? 1024 : 0) |
        (encircle ? 2048 : 0) |
        (overline ? 4096 : 0)
      : 0;

    this._link = link;
    this._meta = meta;
    this._linkId = link || meta ? generateLinkId(meta) : '';
    this._null = !(this._setAttributes || color || bgcolor || link || meta);
  }

  /**
   * Create a 'null' style, equivalent to Style(), but more performant.
   */
  static null(): Style {
    return NULL_STYLE;
  }

  /**
   * Create a new style with colors and no attributes.
   */
  static fromColor(color?: Color, bgcolor?: Color): Style {
    const style = Object.create(Style.prototype);
    style._ansi = undefined;
    style._styleDefinition = undefined;
    style._color = color;
    style._bgcolor = bgcolor;
    style._setAttributes = 0;
    style._attributes = 0;
    style._link = undefined;
    style._linkId = '';
    style._meta = undefined;
    style._null = !(color || bgcolor);
    style._hash = undefined;
    return style;
  }

  /**
   * Create a new style with meta data.
   */
  static fromMeta(meta?: Record<string, any>): Style {
    const style = Object.create(Style.prototype);
    style._ansi = undefined;
    style._styleDefinition = undefined;
    style._color = undefined;
    style._bgcolor = undefined;
    style._setAttributes = 0;
    style._attributes = 0;
    style._link = undefined;
    style._meta = meta;
    style._linkId = meta ? generateLinkId(meta) : '';
    style._hash = undefined;
    style._null = !meta;
    return style;
  }

  /**
   * Create a blank style with meta information.
   *
   * @example
   * style = Style.on({click: this.onClick})
   */
  static on(meta?: Record<string, any>, handlers?: Record<string, any>): Style {
    const combinedMeta = { ...(meta || {}) };
    if (handlers) {
      for (const [key, value] of Object.entries(handlers)) {
        combinedMeta[`@${key}`] = value;
      }
    }
    return Style.fromMeta(combinedMeta);
  }

  /**
   * Get/set bold attribute
   */
  get bold(): boolean | undefined {
    if (this._setAttributes & 1) {
      return (this._attributes & 1) !== 0;
    }
    return undefined;
  }

  /**
   * Get/set dim attribute
   */
  get dim(): boolean | undefined {
    if (this._setAttributes & 2) {
      return (this._attributes & 2) !== 0;
    }
    return undefined;
  }

  /**
   * Get/set italic attribute
   */
  get italic(): boolean | undefined {
    if (this._setAttributes & 4) {
      return (this._attributes & 4) !== 0;
    }
    return undefined;
  }

  /**
   * Get/set underline attribute
   */
  get underline(): boolean | undefined {
    if (this._setAttributes & 8) {
      return (this._attributes & 8) !== 0;
    }
    return undefined;
  }

  /**
   * Get/set blink attribute
   */
  get blink(): boolean | undefined {
    if (this._setAttributes & 16) {
      return (this._attributes & 16) !== 0;
    }
    return undefined;
  }

  /**
   * Get/set blink2 attribute
   */
  get blink2(): boolean | undefined {
    if (this._setAttributes & 32) {
      return (this._attributes & 32) !== 0;
    }
    return undefined;
  }

  /**
   * Get/set reverse attribute
   */
  get reverse(): boolean | undefined {
    if (this._setAttributes & 64) {
      return (this._attributes & 64) !== 0;
    }
    return undefined;
  }

  /**
   * Get/set conceal attribute
   */
  get conceal(): boolean | undefined {
    if (this._setAttributes & 128) {
      return (this._attributes & 128) !== 0;
    }
    return undefined;
  }

  /**
   * Get/set strike attribute
   */
  get strike(): boolean | undefined {
    if (this._setAttributes & 256) {
      return (this._attributes & 256) !== 0;
    }
    return undefined;
  }

  /**
   * Get/set underline2 attribute
   */
  get underline2(): boolean | undefined {
    if (this._setAttributes & 512) {
      return (this._attributes & 512) !== 0;
    }
    return undefined;
  }

  /**
   * Get/set frame attribute
   */
  get frame(): boolean | undefined {
    if (this._setAttributes & 1024) {
      return (this._attributes & 1024) !== 0;
    }
    return undefined;
  }

  /**
   * Get/set encircle attribute
   */
  get encircle(): boolean | undefined {
    if (this._setAttributes & 2048) {
      return (this._attributes & 2048) !== 0;
    }
    return undefined;
  }

  /**
   * Get/set overline attribute
   */
  get overline(): boolean | undefined {
    if (this._setAttributes & 4096) {
      return (this._attributes & 4096) !== 0;
    }
    return undefined;
  }

  /**
   * Get link ID, used in ansi code for links
   */
  get linkId(): string {
    return this._linkId;
  }

  /**
   * Get the foreground color or undefined if it is not set
   */
  get color(): Color | undefined {
    return this._color;
  }

  /**
   * Get the background color or undefined if it is not set
   */
  get bgcolor(): Color | undefined {
    return this._bgcolor;
  }

  /**
   * Get link text, if set
   */
  get link(): string | undefined {
    return this._link;
  }

  /**
   * Check if the style specified a transparent background
   */
  get transparentBackground(): boolean {
    return this.bgcolor === undefined || this.bgcolor.isDefault;
  }

  /**
   * Get a Style with background only
   */
  get backgroundStyle(): Style {
    return new Style({ bgcolor: this._bgcolor });
  }

  /**
   * Get meta information (can not be changed after construction)
   */
  get meta(): Record<string, any> {
    return this._meta || {};
  }

  /**
   * Check if this is a null style (has no styling)
   */
  get isNull(): boolean {
    return this._null;
  }

  /**
   * Get a copy of the style with color removed
   */
  get withoutColor(): Style {
    if (this._null) {
      return NULL_STYLE;
    }
    const style = Object.create(Style.prototype);
    style._ansi = undefined;
    style._styleDefinition = undefined;
    style._color = undefined;
    style._bgcolor = undefined;
    style._attributes = this._attributes;
    style._setAttributes = this._setAttributes;
    style._link = this._link;
    style._linkId = this._link ? generateLinkId() : '';
    style._null = false;
    style._meta = undefined;
    style._hash = undefined;
    return style;
  }

  /**
   * Re-generate style definition from attributes
   */
  toString(): string {
    if (this._styleDefinition !== undefined) {
      return this._styleDefinition;
    }

    const attributes: string[] = [];
    const bits = this._setAttributes;

    if (bits & 0b0000000001111) {
      if (bits & 1) attributes.push(this.bold ? 'bold' : 'not bold');
      if (bits & 2) attributes.push(this.dim ? 'dim' : 'not dim');
      if (bits & 4) attributes.push(this.italic ? 'italic' : 'not italic');
      if (bits & 8) attributes.push(this.underline ? 'underline' : 'not underline');
    }

    if (bits & 0b0000111110000) {
      if (bits & 16) attributes.push(this.blink ? 'blink' : 'not blink');
      if (bits & 32) attributes.push(this.blink2 ? 'blink2' : 'not blink2');
      if (bits & 64) attributes.push(this.reverse ? 'reverse' : 'not reverse');
      if (bits & 128) attributes.push(this.conceal ? 'conceal' : 'not conceal');
      if (bits & 256) attributes.push(this.strike ? 'strike' : 'not strike');
    }

    if (bits & 0b1111000000000) {
      if (bits & 512) attributes.push(this.underline2 ? 'underline2' : 'not underline2');
      if (bits & 1024) attributes.push(this.frame ? 'frame' : 'not frame');
      if (bits & 2048) attributes.push(this.encircle ? 'encircle' : 'not encircle');
      if (bits & 4096) attributes.push(this.overline ? 'overline' : 'not overline');
    }

    if (this._color) {
      attributes.push(this._color.name);
    }

    if (this._bgcolor) {
      attributes.push('on');
      attributes.push(this._bgcolor.name);
    }

    if (this._link) {
      attributes.push('link');
      attributes.push(this._link);
    }

    this._styleDefinition = attributes.length > 0 ? attributes.join(' ') : 'none';
    return this._styleDefinition;
  }

  /**
   * A Style is false if it has no attributes, colors, or links
   */
  bool(): boolean {
    return !this._null;
  }

  /**
   * Generate ANSI codes for this style
   */
  _makeAnsiCodes(colorSystem: ColorSystem): string | undefined {
    if (this._ansi !== undefined) {
      return this._ansi;
    }

    const sgr: string[] = [];
    const attributes = this._attributes & this._setAttributes;

    if (attributes) {
      if (attributes & 1) sgr.push(STYLE_MAP[0]!);
      if (attributes & 2) sgr.push(STYLE_MAP[1]!);
      if (attributes & 4) sgr.push(STYLE_MAP[2]!);
      if (attributes & 8) sgr.push(STYLE_MAP[3]!);

      if (attributes & 0b0000111110000) {
        for (let bit = 4; bit < 9; bit++) {
          if (attributes & (1 << bit)) {
            sgr.push(STYLE_MAP[bit]!);
          }
        }
      }

      if (attributes & 0b1111000000000) {
        for (let bit = 9; bit < 13; bit++) {
          if (attributes & (1 << bit)) {
            sgr.push(STYLE_MAP[bit]!);
          }
        }
      }
    }

    if (this._color) {
      sgr.push(...this._color.downgrade(colorSystem).getAnsiCodes());
    }

    if (this._bgcolor) {
      sgr.push(...this._bgcolor.downgrade(colorSystem).getAnsiCodes(false));
    }

    // Keep _ansi undefined for null styles (empty SGR array) to maintain consistency
    this._ansi = sgr.length === 0 ? undefined : sgr.join(';');
    return this._ansi;
  }

  /**
   * Normalize a style definition so that styles with the same effect have the same string
   * representation.
   */
  static normalize(styleDefinition: string): string {
    try {
      return String(Style.parse(styleDefinition));
    } catch (error) {
      return styleDefinition.trim().toLowerCase();
    }
  }

  /**
   * Pick first non-undefined style
   */
  static pickFirst(...values: Array<StyleType | undefined>): StyleType {
    for (const value of values) {
      if (value !== undefined) {
        return value;
      }
    }
    throw new Error('expected at least one non-undefined style');
  }

  /**
   * Parse a style definition.
   *
   * @throws {StyleSyntaxError} If the style definition syntax is invalid
   */
  static parse(styleDefinition: string): Style {
    const trimmed = styleDefinition.trim();
    if (trimmed === 'none' || !trimmed) {
      return Style.null();
    }

    let color: string | undefined;
    let bgcolor: string | undefined;
    const attributes: Record<string, boolean> = {};
    let link: string | undefined;

    const words = trimmed.split(/\s+/);
    let i = 0;

    while (i < words.length) {
      const originalWord = words[i];
      if (!originalWord) break;
      const word = originalWord.toLowerCase();

      if (word === 'on') {
        i++;
        if (i >= words.length || !words[i]) {
          throw new StyleSyntaxError("color expected after 'on'");
        }
        const bgcolorWord = words[i]!;
        try {
          Color.parse(bgcolorWord);
        } catch (error) {
          if (error instanceof ColorParseError) {
            throw new StyleSyntaxError(
              `unable to parse ${bgcolorWord} as background color; ${error.message}`
            );
          }
          throw error;
        }
        bgcolor = bgcolorWord;
      } else if (word === 'not') {
        i++;
        if (i >= words.length || !words[i]) {
          throw new StyleSyntaxError("expected style attribute after 'not', found end of string");
        }
        const notWord = words[i]!;
        const attribute = STYLE_ATTRIBUTES[notWord.toLowerCase()];
        if (!attribute) {
          throw new StyleSyntaxError(`expected style attribute after 'not', found ${notWord}`);
        }
        attributes[attribute] = false;
      } else if (word === 'link') {
        i++;
        if (i >= words.length || !words[i]) {
          throw new StyleSyntaxError("URL expected after 'link'");
        }
        link = words[i]!;
      } else if (word in STYLE_ATTRIBUTES) {
        attributes[STYLE_ATTRIBUTES[word]!] = true;
      } else {
        try {
          Color.parse(word);
        } catch (error) {
          if (error instanceof ColorParseError) {
            throw new StyleSyntaxError(`unable to parse ${word} as color; ${error.message}`);
          }
          throw error;
        }
        color = word;
      }

      i++;
    }

    return new Style({ color, bgcolor, link, ...attributes });
  }

  /**
   * Get a CSS style rule
   */
  getHtmlStyle(theme?: any): string {
    const actualTheme = theme || DEFAULT_TERMINAL_THEME;
    const css: string[] = [];

    let color = this._color;
    let bgcolor = this._bgcolor;

    if (this.reverse) {
      [color, bgcolor] = [bgcolor, color];
    }

    if (this.dim) {
      const foregroundColor = color ? color.getTruecolor() : actualTheme.foregroundColor;
      color = Color.fromTriplet(blendRgb(foregroundColor, actualTheme.backgroundColor, 0.5));
    }

    if (color) {
      const themeColor = color.getTruecolor();
      css.push(`color: ${themeColor.hex}`);
      css.push(`text-decoration-color: ${themeColor.hex}`);
    }

    if (bgcolor) {
      const themeColor = bgcolor.getTruecolor(false);
      css.push(`background-color: ${themeColor.hex}`);
    }

    if (this.bold) css.push('font-weight: bold');
    if (this.italic) css.push('font-style: italic');
    if (this.underline) css.push('text-decoration: underline');
    if (this.strike) css.push('text-decoration: line-through');
    if (this.overline) css.push('text-decoration: overline');

    return css.join('; ');
  }

  /**
   * Combine styles and get result
   */
  static combine(styles: Iterable<Style>): Style {
    const stylesArray = Array.from(styles);
    if (stylesArray.length === 0) {
      return Style.null();
    }
    const first = stylesArray[0]!;
    return stylesArray.slice(1).reduce((acc, style) => acc.add(style), first);
  }

  /**
   * Combine styles from positional arguments into a single style
   */
  static chain(...styles: Style[]): Style {
    if (styles.length === 0) {
      return Style.null();
    }
    const first = styles[0]!;
    return styles.slice(1).reduce((acc, style) => acc.add(style), first);
  }

  /**
   * Get a copy of this style
   */
  copy(): Style {
    if (this._null) {
      return NULL_STYLE;
    }
    const style = Object.create(Style.prototype);
    style._ansi = this._ansi;
    style._styleDefinition = this._styleDefinition;
    style._color = this._color;
    style._bgcolor = this._bgcolor;
    style._attributes = this._attributes;
    style._setAttributes = this._setAttributes;
    style._link = this._link;
    style._linkId = this._link ? generateLinkId() : '';
    style._hash = this._hash;
    style._null = false;
    style._meta = this._meta;
    return style;
  }

  /**
   * Get a copy of this style with link and meta information removed
   */
  clearMetaAndLinks(): Style {
    if (this._null) {
      return NULL_STYLE;
    }
    const style = Object.create(Style.prototype);
    style._ansi = this._ansi;
    style._styleDefinition = this._styleDefinition;
    style._color = this._color;
    style._bgcolor = this._bgcolor;
    style._attributes = this._attributes;
    style._setAttributes = this._setAttributes;
    style._link = undefined;
    style._linkId = '';
    style._hash = undefined;
    style._null = false;
    style._meta = undefined;
    return style;
  }

  /**
   * Get a copy with a different value for link
   */
  updateLink(link?: string): Style {
    const style = Object.create(Style.prototype);
    style._ansi = this._ansi;
    style._styleDefinition = this._styleDefinition;
    style._color = this._color;
    style._bgcolor = this._bgcolor;
    style._attributes = this._attributes;
    style._setAttributes = this._setAttributes;
    style._link = link;
    style._linkId = link ? generateLinkId() : '';
    style._hash = undefined;
    style._null = false;
    style._meta = this._meta;
    return style;
  }

  /**
   * Render the ANSI codes for the style
   */
  render(text: string = '', colorSystem?: ColorSystem, legacyWindows: boolean = false): string {
    if (!text || colorSystem === undefined) {
      return text;
    }
    const attrs = this._ansi || this._makeAnsiCodes(colorSystem);
    let rendered = attrs ? `\x1b[${attrs}m${text}\x1b[0m` : text;
    if (this._link && !legacyWindows) {
      rendered = `\x1b]8;id=${this._linkId};${this._link}\x1b\\${rendered}\x1b]8;;\x1b\\`;
    }
    return rendered;
  }

  /**
   * Write text with style directly to terminal.
   * This method is for testing purposes only.
   */
  test(text?: string): void {
    const testText = text || this.toString();
    process.stdout.write(`${this.render(testText, ColorSystem.TRUECOLOR)}\n`);
  }

  /**
   * Add two styles together
   */
  private _add(style?: Style): Style {
    if (!style || style._null) {
      return this;
    }
    if (this._null) {
      return style;
    }

    const newStyle = Object.create(Style.prototype);
    newStyle._ansi = undefined;
    newStyle._styleDefinition = undefined;
    newStyle._color = style._color || this._color;
    newStyle._bgcolor = style._bgcolor || this._bgcolor;
    newStyle._attributes =
      (this._attributes & ~style._setAttributes) | (style._attributes & style._setAttributes);
    newStyle._setAttributes = this._setAttributes | style._setAttributes;
    newStyle._link = style._link || this._link;
    newStyle._linkId = style._linkId || this._linkId;
    newStyle._null = style._null;

    if (this._meta && style._meta) {
      newStyle._meta = { ...this._meta, ...style._meta };
    } else {
      newStyle._meta = this._meta || style._meta;
    }

    newStyle._hash = undefined;
    return newStyle;
  }

  /**
   * Add two styles together
   */
  add(style?: Style): Style {
    const combinedStyle = this._add(style);
    return combinedStyle.link ? combinedStyle.copy() : combinedStyle;
  }

  /**
   * Compute hash for this style
   */
  hash(): number {
    if (this._hash !== undefined) {
      return this._hash;
    }
    this._hash = hashObject({
      color: this._color,
      bgcolor: this._bgcolor,
      attributes: this._attributes,
      setAttributes: this._setAttributes,
      link: this._link,
      meta: this._meta,
    });
    return this._hash;
  }
}

/**
 * NULL_STYLE constant
 */
export const NULL_STYLE = new Style();

/**
 * A stack of styles
 */
export class StyleStack {
  private _stack: Style[];

  constructor(defaultStyle: Style) {
    this._stack = [defaultStyle];
  }

  toString(): string {
    return `<stylestack ${JSON.stringify(this._stack)}>`;
  }

  /**
   * Get the Style at the top of the stack
   */
  get current(): Style {
    return this._stack[this._stack.length - 1]!;
  }

  /**
   * Push a new style on to the stack
   */
  push(style: Style): void {
    this._stack.push(this._stack[this._stack.length - 1]!.add(style));
  }

  /**
   * Pop last style and discard
   */
  pop(): Style {
    this._stack.pop();
    return this._stack[this._stack.length - 1]!;
  }
}
