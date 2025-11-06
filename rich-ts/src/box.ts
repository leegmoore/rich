/**
 * Box - Defines characters to render boxes
 * Based on rich/box.py
 */
import type { ConsoleOptions } from './console.js';
import { loopLast } from './_loop.js';

/**
 * Defines characters to render boxes.
 *
 * ┌─┬┐ top
 * │ ││ head
 * ├─┼┤ head_row
 * │ ││ mid
 * ├─┼┤ row
 * ├─┼┤ foot_row
 * │ ││ foot
 * └─┴┘ bottom
 */
export class Box {
  private _box: string;
  ascii: boolean;

  // top
  topLeft: string;
  top: string;
  topDivider: string;
  topRight: string;

  // head
  headLeft: string;
  headVertical: string;
  headRight: string;

  // head_row
  headRowLeft: string;
  headRowHorizontal: string;
  headRowCross: string;
  headRowRight: string;

  // mid
  midLeft: string;
  midVertical: string;
  midRight: string;

  // row
  rowLeft: string;
  rowHorizontal: string;
  rowCross: string;
  rowRight: string;

  // foot_row
  footRowLeft: string;
  footRowHorizontal: string;
  footRowCross: string;
  footRowRight: string;

  // foot
  footLeft: string;
  footVertical: string;
  footRight: string;

  // bottom
  bottomLeft: string;
  bottom: string;
  bottomDivider: string;
  bottomRight: string;

  /**
   * Create a Box.
   *
   * @param box - Characters making up box (8 lines, 4 chars per line).
   * @param ascii - True if this box uses ascii characters only.
   */
  constructor(box: string, ascii: boolean = false) {
    this._box = box;
    this.ascii = ascii;

    const lines = box.split('\n').filter((line) => line.length > 0);
    if (lines.length !== 8) {
      throw new Error(`Box string must have 8 lines, got ${lines.length}`);
    }

    const [line1, line2, line3, line4, line5, line6, line7, line8] = lines;

    // top
    [this.topLeft, this.top, this.topDivider, this.topRight] = Array.from(line1!) as [
      string,
      string,
      string,
      string,
    ];

    // head
    [this.headLeft, , this.headVertical, this.headRight] = Array.from(line2!) as [
      string,
      string,
      string,
      string,
    ];

    // head_row
    [this.headRowLeft, this.headRowHorizontal, this.headRowCross, this.headRowRight] = Array.from(
      line3!
    ) as [string, string, string, string];

    // mid
    [this.midLeft, , this.midVertical, this.midRight] = Array.from(line4!) as [
      string,
      string,
      string,
      string,
    ];

    // row
    [this.rowLeft, this.rowHorizontal, this.rowCross, this.rowRight] = Array.from(line5!) as [
      string,
      string,
      string,
      string,
    ];

    // foot_row
    [this.footRowLeft, this.footRowHorizontal, this.footRowCross, this.footRowRight] = Array.from(
      line6!
    ) as [string, string, string, string];

    // foot
    [this.footLeft, , this.footVertical, this.footRight] = Array.from(line7!) as [
      string,
      string,
      string,
      string,
    ];

    // bottom
    [this.bottomLeft, this.bottom, this.bottomDivider, this.bottomRight] = Array.from(line8!) as [
      string,
      string,
      string,
      string,
    ];
  }

  toString(): string {
    return this._box;
  }

  /**
   * Substitute this box for another if it won't render due to platform issues.
   *
   * @param options - Console options used in rendering.
   * @param safe - Substitute this for another Box if there are known problems displaying on the platform.
   * @returns A different Box or the same Box.
   */
  substitute(options: ConsoleOptions, safe: boolean = true): Box {
    let box: Box = this;
    if (options.legacyWindows && safe) {
      box = LEGACY_WINDOWS_SUBSTITUTIONS.get(box) ?? box;
    }
    if (options.asciiOnly && !box.ascii) {
      box = ASCII;
    }
    return box;
  }

  /**
   * If this box uses special characters for the borders of the header,
   * return the equivalent box that does not.
   *
   * @returns The most similar Box that doesn't use header-specific box characters.
   */
  getPlainHeadedBox(): Box {
    return PLAIN_HEADED_SUBSTITUTIONS.get(this) ?? this;
  }

  /**
   * Get the top of a simple box.
   *
   * @param widths - Widths of columns.
   * @returns A string of box characters.
   */
  getTop(widths: Iterable<number>): string {
    const parts: string[] = [];
    parts.push(this.topLeft);
    for (const [last, width] of loopLast(widths)) {
      parts.push(this.top.repeat(width));
      if (!last) {
        parts.push(this.topDivider);
      }
    }
    parts.push(this.topRight);
    return parts.join('');
  }

  /**
   * Get a row separator of a box.
   *
   * @param widths - Widths of columns.
   * @param level - Type of row ('head', 'row', 'foot', 'mid').
   * @param edge - Include left and right edges.
   * @returns A string of box characters.
   */
  getRow(
    widths: Iterable<number>,
    level: 'head' | 'row' | 'foot' | 'mid' = 'row',
    edge: boolean = true
  ): string {
    let left: string;
    let horizontal: string;
    let cross: string;
    let right: string;

    if (level === 'head') {
      left = this.headRowLeft;
      horizontal = this.headRowHorizontal;
      cross = this.headRowCross;
      right = this.headRowRight;
    } else if (level === 'row') {
      left = this.rowLeft;
      horizontal = this.rowHorizontal;
      cross = this.rowCross;
      right = this.rowRight;
    } else if (level === 'mid') {
      left = this.midLeft;
      horizontal = ' ';
      cross = this.midVertical;
      right = this.midRight;
    } else if (level === 'foot') {
      left = this.footRowLeft;
      horizontal = this.footRowHorizontal;
      cross = this.footRowCross;
      right = this.footRowRight;
    } else {
      throw new Error("level must be 'head', 'row', 'foot', or 'mid'");
    }

    const parts: string[] = [];
    if (edge) {
      parts.push(left);
    }
    for (const [last, width] of loopLast(widths)) {
      parts.push(horizontal.repeat(width));
      if (!last) {
        parts.push(cross);
      }
    }
    if (edge) {
      parts.push(right);
    }
    return parts.join('');
  }

  /**
   * Get the bottom of a simple box.
   *
   * @param widths - Widths of columns.
   * @returns A string of box characters.
   */
  getBottom(widths: Iterable<number>): string {
    const parts: string[] = [];
    parts.push(this.bottomLeft);
    for (const [last, width] of loopLast(widths)) {
      parts.push(this.bottom.repeat(width));
      if (!last) {
        parts.push(this.bottomDivider);
      }
    }
    parts.push(this.bottomRight);
    return parts.join('');
  }
}

// Box styles
export const ASCII = new Box('+--+\n| ||\n|-+|\n| ||\n|-+|\n|-+|\n| ||\n+--+\n', true);

export const ASCII2 = new Box('+-++\n| ||\n+-++\n| ||\n+-++\n+-++\n| ||\n+-++\n', true);

export const ASCII_DOUBLE_HEAD = new Box('+-++\n| ||\n+=++\n| ||\n+-++\n+-++\n| ||\n+-++\n', true);

export const SQUARE = new Box('┌─┬┐\n│ ││\n├─┼┤\n│ ││\n├─┼┤\n├─┼┤\n│ ││\n└─┴┘\n');

export const SQUARE_DOUBLE_HEAD = new Box('┌─┬┐\n│ ││\n╞═╪╡\n│ ││\n├─┼┤\n├─┼┤\n│ ││\n└─┴┘\n');

export const MINIMAL = new Box('  ╷ \n  │ \n╶─┼╴\n  │ \n╶─┼╴\n╶─┼╴\n  │ \n  ╵ \n');

export const MINIMAL_HEAVY_HEAD = new Box('  ╷ \n  │ \n╺━┿╸\n  │ \n╶─┼╴\n╶─┼╴\n  │ \n  ╵ \n');

export const MINIMAL_DOUBLE_HEAD = new Box('  ╷ \n  │ \n ═╪ \n  │ \n ─┼ \n ─┼ \n  │ \n  ╵ \n');

export const SIMPLE = new Box('    \n    \n ── \n    \n    \n ── \n    \n    \n');

export const SIMPLE_HEAD = new Box('    \n    \n ── \n    \n    \n    \n    \n    \n');

export const SIMPLE_HEAVY = new Box('    \n    \n ━━ \n    \n    \n ━━ \n    \n    \n');

export const HORIZONTALS = new Box(' ── \n    \n ── \n    \n ── \n ── \n    \n ── \n');

export const ROUNDED = new Box('╭─┬╮\n│ ││\n├─┼┤\n│ ││\n├─┼┤\n├─┼┤\n│ ││\n╰─┴╯\n');

export const HEAVY = new Box('┏━┳┓\n┃ ┃┃\n┣━╋┫\n┃ ┃┃\n┣━╋┫\n┣━╋┫\n┃ ┃┃\n┗━┻┛\n');

export const HEAVY_EDGE = new Box('┏━┯┓\n┃ │┃\n┠─┼┨\n┃ │┃\n┠─┼┨\n┠─┼┨\n┃ │┃\n┗━┷┛\n');

export const HEAVY_HEAD = new Box('┏━┳┓\n┃ ┃┃\n┡━╇┩\n│ ││\n├─┼┤\n├─┼┤\n│ ││\n└─┴┘\n');

export const DOUBLE = new Box('╔═╦╗\n║ ║║\n╠═╬╣\n║ ║║\n╠═╬╣\n╠═╬╣\n║ ║║\n╚═╩╝\n');

export const DOUBLE_EDGE = new Box('╔═╤╗\n║ │║\n╟─┼╢\n║ │║\n╟─┼╢\n╟─┼╢\n║ │║\n╚═╧╝\n');

export const MARKDOWN = new Box('    \n| ||\n|-||\n| ||\n|-||\n|-||\n| ||\n    \n', true);

// Map Boxes that don't render with raster fonts on to equivalent that do
const LEGACY_WINDOWS_SUBSTITUTIONS = new Map<Box, Box>([
  [ROUNDED, SQUARE],
  [MINIMAL_HEAVY_HEAD, MINIMAL],
  [SIMPLE_HEAVY, SIMPLE],
  [HEAVY, SQUARE],
  [HEAVY_EDGE, SQUARE],
  [HEAVY_HEAD, SQUARE],
]);

// Map headed boxes to their headerless equivalents
const PLAIN_HEADED_SUBSTITUTIONS = new Map<Box, Box>([
  [HEAVY_HEAD, SQUARE],
  [SQUARE_DOUBLE_HEAD, SQUARE],
  [MINIMAL_DOUBLE_HEAD, MINIMAL],
  [MINIMAL_HEAVY_HEAD, MINIMAL],
  [ASCII_DOUBLE_HEAD, ASCII2],
]);
