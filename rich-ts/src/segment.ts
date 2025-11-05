/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable no-constant-condition */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import { Style } from './style';
import {
  cellLen,
  getCharacterCellSize,
  setCellSize,
  isSingleCellWidths,
} from './cells';

/**
 * Non-printable control codes which typically translate to ANSI codes.
 */
export enum ControlType {
  BELL = 1,
  CARRIAGE_RETURN = 2,
  HOME = 3,
  CLEAR = 4,
  SHOW_CURSOR = 5,
  HIDE_CURSOR = 6,
  ENABLE_ALT_SCREEN = 7,
  DISABLE_ALT_SCREEN = 8,
  CURSOR_UP = 9,
  CURSOR_DOWN = 10,
  CURSOR_FORWARD = 11,
  CURSOR_BACKWARD = 12,
  CURSOR_MOVE_TO_COLUMN = 13,
  CURSOR_MOVE_TO = 14,
  ERASE_IN_LINE = 15,
  SET_WINDOW_TITLE = 16,
}

/**
 * Control code types
 */
export type ControlCode =
  | [ControlType]
  | [ControlType, number | string]
  | [ControlType, number, number];

/**
 * A piece of text with associated style. Segments are produced by the Console render process
 * and are ultimately converted into strings to be written to the terminal.
 */
export class Segment {
  constructor(
    public readonly text: string,
    public readonly style?: Style,
    public readonly control?: ReadonlyArray<ControlCode>,
  ) {}

  /**
   * The number of terminal cells required to display this segment's text
   */
  get cellLength(): number {
    return this.control ? 0 : cellLen(this.text);
  }

  /**
   * Check if the segment contains text
   */
  bool(): boolean {
    return Boolean(this.text);
  }

  /**
   * Check if the segment contains control codes
   */
  get isControl(): boolean {
    return this.control !== undefined;
  }

  /**
   * String representation
   */
  toString(): string {
    if (this.control) {
      return `Segment('${this.text}', ${this.style}, ${JSON.stringify(this.control)})`;
    } else if (this.style) {
      return `Segment('${this.text}', ${this.style})`;
    }
    return `Segment('${this.text}')`;
  }

  /**
   * Split segment into two segments at the specified column.
   * If the cut point falls in the middle of a 2-cell wide character then it is replaced
   * by two spaces, to preserve the display width of the parent segment.
   */
  splitCells(cut: number): [Segment, Segment] {
    if (cut < 0) {
      throw new Error('cut must be >= 0');
    }

    if (isSingleCellWidths(this.text)) {
      // Fast path with all 1 cell characters
      if (cut >= this.text.length) {
        return [this, new Segment('', this.style, this.control)];
      }
      return [
        new Segment(this.text.slice(0, cut), this.style, this.control),
        new Segment(this.text.slice(cut), this.style, this.control),
      ];
    }

    return Segment._splitCells(this, cut);
  }

  /**
   * Internal method to split a segment with complex cell widths
   */
  private static _splitCells(segment: Segment, cut: number): [Segment, Segment] {
    const { text, style, control } = segment;
    const cellLength = segment.cellLength;

    if (cut >= cellLength) {
      return [segment, new Segment('', style, control)];
    }

    // Start with an estimate
    let pos = Math.floor((cut / cellLength) * text.length);

    while (true) {
      const before = text.slice(0, pos);
      const cellPos = cellLen(before);
      const outBy = cellPos - cut;

      if (outBy === 0) {
        return [
          new Segment(before, style, control),
          new Segment(text.slice(pos), style, control),
        ];
      }

      if (outBy === -1 && getCharacterCellSize(text[pos]!) === 2) {
        return [
          new Segment(text.slice(0, pos) + ' ', style, control),
          new Segment(' ' + text.slice(pos + 1), style, control),
        ];
      }

      if (outBy === 1 && getCharacterCellSize(text[pos - 1]!) === 2) {
        return [
          new Segment(text.slice(0, pos - 1) + ' ', style, control),
          new Segment(' ' + text.slice(pos), style, control),
        ];
      }

      if (cellPos < cut) {
        pos++;
      } else {
        pos--;
      }
    }
  }

  /**
   * Make a new line segment
   */
  static line(): Segment {
    return new Segment('\n');
  }

  /**
   * Apply style(s) to an iterable of segments.
   * Returns an iterable of segments where the style is replaced by style + segment.style + postStyle
   */
  static applyStyle(
    segments: Iterable<Segment>,
    style?: Style,
    postStyle?: Style,
  ): Iterable<Segment> {
    let resultSegments = segments;

    if (style) {
      const apply = (s?: Style) => (s ? style.add(s) : style);
      const inputSegments = resultSegments;
      resultSegments = (function* () {
        for (const segment of inputSegments) {
          yield new Segment(
            segment.text,
            segment.control ? undefined : apply(segment.style),
            segment.control,
          );
        }
      })();
    }

    if (postStyle) {
      const inputSegments = resultSegments;
      resultSegments = (function* () {
        for (const segment of inputSegments) {
          yield new Segment(
            segment.text,
            segment.control
              ? undefined
              : segment.style
                ? segment.style.add(postStyle)
                : postStyle,
            segment.control,
          );
        }
      })();
    }

    return resultSegments;
  }

  /**
   * Filter segments by isControl attribute
   */
  static filterControl(segments: Iterable<Segment>, isControl: boolean = false): Iterable<Segment> {
    if (isControl) {
      return (function* () {
        for (const segment of segments) {
          if (segment.control) {
            yield segment;
          }
        }
      })();
    } else {
      return (function* () {
        for (const segment of segments) {
          if (!segment.control) {
            yield segment;
          }
        }
      })();
    }
  }

  /**
   * Split a sequence of segments into a list of lines
   */
  static *splitLines(segments: Iterable<Segment>): Iterable<Segment[]> {
    let line: Segment[] = [];

    for (const segment of segments) {
      if (segment.text.includes('\n') && !segment.control) {
        let text = segment.text;
        const { style } = segment;

        while (text) {
          const newlineIndex = text.indexOf('\n');
          if (newlineIndex === -1) {
            if (text) {
              line.push(new Segment(text, style));
            }
            break;
          }

          const beforeNewline = text.slice(0, newlineIndex);
          if (beforeNewline) {
            line.push(new Segment(beforeNewline, style));
          }

          yield line;
          line = [];
          text = text.slice(newlineIndex + 1);
        }
      } else {
        line.push(segment);
      }
    }

    if (line.length > 0) {
      yield line;
    }
  }

  /**
   * Split segments into lines, and crop lines greater than a given length
   */
  static *splitAndCropLines(
    segments: Iterable<Segment>,
    length: number,
    style?: Style,
    pad: boolean = true,
    includeNewLines: boolean = true,
  ): Iterable<Segment[]> {
    let line: Segment[] = [];
    const newLineSegment = new Segment('\n');

    for (const segment of segments) {
      if (segment.text.includes('\n') && !segment.control) {
        let text = segment.text;
        const segmentStyle = segment.style;

        while (text) {
          const newlineIndex = text.indexOf('\n');
          if (newlineIndex === -1) {
            if (text) {
              line.push(new Segment(text, segmentStyle));
            }
            break;
          }

          const beforeNewline = text.slice(0, newlineIndex);
          if (beforeNewline) {
            line.push(new Segment(beforeNewline, segmentStyle));
          }

          const croppedLine = Segment.adjustLineLength(line, length, style, pad);
          if (includeNewLines) {
            croppedLine.push(newLineSegment);
          }
          yield croppedLine;
          line = [];
          text = text.slice(newlineIndex + 1);
        }
      } else {
        line.push(segment);
      }
    }

    if (line.length > 0) {
      yield Segment.adjustLineLength(line, length, style, pad);
    }
  }

  /**
   * Adjust a line to a given width (cropping or padding as required)
   */
  static adjustLineLength(
    line: Segment[],
    length: number,
    style?: Style,
    pad: boolean = true,
  ): Segment[] {
    const lineLength = line.reduce((sum, seg) => sum + seg.cellLength, 0);

    if (lineLength < length) {
      if (pad) {
        return [...line, new Segment(' '.repeat(length - lineLength), style)];
      } else {
        return [...line];
      }
    } else if (lineLength > length) {
      const newLine: Segment[] = [];
      let currentLength = 0;

      for (const segment of line) {
        const segmentLength = segment.cellLength;
        if (currentLength + segmentLength < length || segment.control) {
          newLine.push(segment);
          currentLength += segmentLength;
        } else {
          const text = setCellSize(segment.text, length - currentLength);
          newLine.push(new Segment(text, segment.style));
          break;
        }
      }
      return newLine;
    } else {
      return [...line];
    }
  }

  /**
   * Get the length of list of segments
   */
  static getLineLength(line: Segment[]): number {
    return line.reduce((sum, seg) => (seg.control ? sum : sum + cellLen(seg.text)), 0);
  }

  /**
   * Get the shape (enclosing rectangle) of a list of lines
   */
  static getShape(lines: Segment[][]): [number, number] {
    if (lines.length === 0) {
      return [0, 0];
    }
    const maxWidth = Math.max(...lines.map((line) => Segment.getLineLength(line)));
    return [maxWidth, lines.length];
  }

  /**
   * Set the shape of a list of lines (enclosing rectangle)
   */
  static setShape(
    lines: Segment[][],
    width: number,
    height?: number,
    style?: Style,
    newLines: boolean = false,
  ): Segment[][] {
    const targetHeight = height ?? lines.length;
    const blank = newLines
      ? [new Segment(' '.repeat(width) + '\n', style)]
      : [new Segment(' '.repeat(width), style)];

    const shapedLines = lines.slice(0, targetHeight);
    for (let i = 0; i < shapedLines.length; i++) {
      shapedLines[i] = Segment.adjustLineLength(shapedLines[i]!, width, style);
    }

    while (shapedLines.length < targetHeight) {
      shapedLines.push(blank);
    }

    return shapedLines;
  }

  /**
   * Aligns lines to top (adds extra lines to bottom as required)
   */
  static alignTop(
    lines: Segment[][],
    width: number,
    height: number,
    style: Style,
    newLines: boolean = false,
  ): Segment[][] {
    const extraLines = height - lines.length;
    if (extraLines === 0) {
      return [...lines];
    }
    const truncatedLines = lines.slice(0, height);
    const blank = newLines ? new Segment(' '.repeat(width) + '\n', style) : new Segment(' '.repeat(width), style);
    const blankLines = Array(extraLines).fill([blank]);
    return [...truncatedLines, ...blankLines];
  }

  /**
   * Aligns lines to bottom (adds extra lines above as required)
   */
  static alignBottom(
    lines: Segment[][],
    width: number,
    height: number,
    style: Style,
    newLines: boolean = false,
  ): Segment[][] {
    const extraLines = height - lines.length;
    if (extraLines === 0) {
      return [...lines];
    }
    const truncatedLines = lines.slice(0, height);
    const blank = newLines ? new Segment(' '.repeat(width) + '\n', style) : new Segment(' '.repeat(width), style);
    const blankLines = Array(extraLines).fill([blank]);
    return [...blankLines, ...truncatedLines];
  }

  /**
   * Aligns lines to middle (adds extra lines to above and below as required)
   */
  static alignMiddle(
    lines: Segment[][],
    width: number,
    height: number,
    style: Style,
    newLines: boolean = false,
  ): Segment[][] {
    const extraLines = height - lines.length;
    if (extraLines === 0) {
      return [...lines];
    }
    const truncatedLines = lines.slice(0, height);
    const blank = newLines ? new Segment(' '.repeat(width) + '\n', style) : new Segment(' '.repeat(width), style);
    const topLines = Math.floor(extraLines / 2);
    const bottomLines = extraLines - topLines;
    const topBlankLines = Array(topLines).fill([blank]);
    const bottomBlankLines = Array(bottomLines).fill([blank]);
    return [...topBlankLines, ...truncatedLines, ...bottomBlankLines];
  }

  /**
   * Simplify an iterable of segments by combining contiguous segments with the same style
   */
  static *simplify(segments: Iterable<Segment>): Iterable<Segment> {
    const iter = segments[Symbol.iterator]();
    let result = iter.next();

    if (result.done) {
      return;
    }

    let lastSegment = result.value;

    for (result = iter.next(); !result.done; result = iter.next()) {
      const segment = result.value;
      if (lastSegment.style === segment.style && !segment.control) {
        lastSegment = new Segment(lastSegment.text + segment.text, lastSegment.style);
      } else {
        yield lastSegment;
        lastSegment = segment;
      }
    }

    yield lastSegment;
  }

  /**
   * Remove all links from an iterable of styles
   */
  static *stripLinks(segments: Iterable<Segment>): Iterable<Segment> {
    for (const segment of segments) {
      if (segment.control || segment.style === undefined) {
        yield segment;
      } else {
        yield new Segment(segment.text, segment.style.updateLink(undefined));
      }
    }
  }

  /**
   * Remove all styles from an iterable of segments
   */
  static *stripStyles(segments: Iterable<Segment>): Iterable<Segment> {
    for (const segment of segments) {
      yield new Segment(segment.text, undefined, segment.control);
    }
  }

  /**
   * Remove all color from an iterable of segments
   */
  static *removeColor(segments: Iterable<Segment>): Iterable<Segment> {
    const cache = new Map<Style, Style>();

    for (const segment of segments) {
      if (segment.style) {
        let colorlessStyle = cache.get(segment.style);
        if (!colorlessStyle) {
          colorlessStyle = segment.style.withoutColor;
          cache.set(segment.style, colorlessStyle);
        }
        yield new Segment(segment.text, colorlessStyle, segment.control);
      } else {
        yield new Segment(segment.text, undefined, segment.control);
      }
    }
  }

  /**
   * Divides an iterable of segments into portions
   */
  static *divide(segments: Iterable<Segment>, cuts: Iterable<number>): Iterable<Segment[]> {
    let splitSegments: Segment[] = [];
    const iterCuts = cuts[Symbol.iterator]();

    let cutResult = iterCuts.next();
    if (cutResult.done) {
      return;
    }

    let cut = cutResult.value;

    // Handle leading zero cuts
    while (cut === 0) {
      yield [];
      cutResult = iterCuts.next();
      if (cutResult.done) {
        return;
      }
      cut = cutResult.value;
    }

    let pos = 0;

    for (let segment of segments) {
      while (segment.text) {
        const endPos = segment.control ? pos : pos + cellLen(segment.text);

        if (endPos < cut) {
          splitSegments.push(segment);
          pos = endPos;
          break;
        }

        if (endPos === cut) {
          splitSegments.push(segment);
          yield [...splitSegments];
          splitSegments = [];
          pos = endPos;

          cutResult = iterCuts.next();
          if (cutResult.done) {
            if (splitSegments.length > 0) {
              yield [...splitSegments];
            }
            return;
          }
          cut = cutResult.value;
          break;
        }

        // endPos > cut
        const [before, after] = segment.splitCells(cut - pos);
        splitSegments.push(before);
        yield [...splitSegments];
        splitSegments = [];
        pos = cut;
        segment = after;

        cutResult = iterCuts.next();
        if (cutResult.done) {
          if (splitSegments.length > 0) {
            yield [...splitSegments];
          }
          return;
        }
        cut = cutResult.value;
      }
    }

    yield [...splitSegments];
  }
}

/**
 * A simple renderable to render an iterable of segments. This class may be useful if
 * you want to print segments outside of a __rich_console__ method.
 */
export class Segments {
  public segments: Segment[];
  public newLines: boolean;

  constructor(segments: Iterable<Segment>, newLines: boolean = false) {
    this.segments = Array.from(segments);
    this.newLines = newLines;
  }

  *__richConsole__(_console: any, _options: any): Iterable<Segment> {
    if (this.newLines) {
      const line = Segment.line();
      for (const segment of this.segments) {
        yield segment;
        yield line;
      }
    } else {
      yield* this.segments;
    }
  }
}

/**
 * A simple renderable containing a number of lines of segments.
 */
export class SegmentLines {
  public lines: Segment[][];
  public newLines: boolean;

  constructor(lines: Iterable<Segment[]>, newLines: boolean = false) {
    this.lines = Array.from(lines);
    this.newLines = newLines;
  }

  *__richConsole__(_console: any, _options: any): Iterable<Segment> {
    if (this.newLines) {
      const newLine = Segment.line();
      for (const line of this.lines) {
        yield* line;
        yield newLine;
      }
    } else {
      for (const line of this.lines) {
        yield* line;
      }
    }
  }
}
