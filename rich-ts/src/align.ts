/**
 * Align - Align renderables horizontally and vertically
 */
import type { Console, ConsoleOptions, RenderableType, RenderResult } from './console.js';
import { Constrain } from './constrain.js';
import { Measurement } from './measure.js';
import { Segment } from './segment.js';
import { StyleType } from './style.js';

export type AlignMethod = 'left' | 'center' | 'right';
export type VerticalAlignMethod = 'top' | 'middle' | 'bottom';

export interface AlignOptions {
  style?: StyleType;
  vertical?: VerticalAlignMethod;
  pad?: boolean;
  width?: number;
  height?: number;
}

/**
 * Align a renderable by adding spaces if necessary.
 */
export class Align {
  renderable: RenderableType;
  align: AlignMethod;
  style?: StyleType;
  vertical?: VerticalAlignMethod;
  pad: boolean;
  width?: number;
  height?: number;

  constructor(renderable: RenderableType, align: AlignMethod = 'left', options: AlignOptions = {}) {
    if (align !== 'left' && align !== 'center' && align !== 'right') {
      throw new Error(
        `invalid value for align, expected "left", "center", or "right" (not ${JSON.stringify(align)})`
      );
    }
    if (
      options.vertical !== undefined &&
      options.vertical !== 'top' &&
      options.vertical !== 'middle' &&
      options.vertical !== 'bottom'
    ) {
      throw new Error(
        `invalid value for vertical, expected "top", "middle", or "bottom" (not ${JSON.stringify(options.vertical)})`
      );
    }

    this.renderable = renderable;
    this.align = align;
    this.style = options.style;
    this.vertical = options.vertical;
    this.pad = options.pad ?? true;
    this.width = options.width;
    this.height = options.height;
  }

  toString(): string {
    return `Align(${JSON.stringify(this.renderable)}, ${JSON.stringify(this.align)})`;
  }

  /**
   * Align a renderable to the left.
   */
  static left(renderable: RenderableType, options: AlignOptions = {}): Align {
    return new Align(renderable, 'left', options);
  }

  /**
   * Align a renderable to the center.
   */
  static center(renderable: RenderableType, options: AlignOptions = {}): Align {
    return new Align(renderable, 'center', options);
  }

  /**
   * Align a renderable to the right.
   */
  static right(renderable: RenderableType, options: AlignOptions = {}): Align {
    return new Align(renderable, 'right', options);
  }

  *__richConsole__(console: Console, options: ConsoleOptions): RenderResult {
    const align = this.align;
    const width = Measurement.get(console, options, this.renderable).maximum;
    const constrainedWidth = this.width === undefined ? width : Math.min(width, this.width);
    const rendered = console.render(new Constrain(this.renderable, constrainedWidth), options.update({ height: undefined }));

    const lines = Array.from(Segment.splitLines(rendered));
    const [renderedWidth, renderedHeight] = Segment.getShape(lines);
    const shapedLines = Segment.setShape(lines, renderedWidth, renderedHeight);
    const newLine = Segment.line();
    const excessSpace = options.maxWidth - renderedWidth;
    const style = this.style !== undefined ? console.getStyle(this.style) : undefined;

    // Capture values from this context
    const shouldPad = this.pad;
    const alignWidth = this.width;

    const generateSegments = function* (): Generator<Segment> {
      if (excessSpace <= 0) {
        // Exact fit
        for (const line of shapedLines) {
          yield* line;
          yield newLine;
        }
      } else if (align === 'left') {
        // Pad on the right
        const pad = excessSpace > 0 && shouldPad ? new Segment(' '.repeat(excessSpace), style) : undefined;
        for (const line of shapedLines) {
          yield* line;
          if (pad) {
            yield pad;
          }
          yield newLine;
        }
      } else if (align === 'center') {
        // Pad left and right
        const left = Math.floor(excessSpace / 2);
        const padLeft = left > 0 ? new Segment(' '.repeat(left), style) : undefined;
        const padRight = shouldPad && excessSpace - left > 0 ? new Segment(' '.repeat(excessSpace - left), style) : undefined;
        for (const line of shapedLines) {
          if (padLeft) {
            yield padLeft;
          }
          yield* line;
          if (padRight) {
            yield padRight;
          }
          yield newLine;
        }
      } else if (align === 'right') {
        // Padding on left
        const pad = new Segment(' '.repeat(excessSpace), style);
        for (const line of shapedLines) {
          yield pad;
          yield* line;
          yield newLine;
        }
      }
    };

    const blankLine = shouldPad
      ? new Segment(`${' '.repeat(alignWidth ?? options.maxWidth)}\n`, style)
      : new Segment('\n');

    const blankLinesGen = function* (count: number): Generator<Segment> {
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          yield blankLine;
        }
      }
    };

    const verticalHeight = this.height ?? options.height;
    let iterSegments: Iterable<Segment>;

    if (this.vertical && verticalHeight !== undefined) {
      if (this.vertical === 'top') {
        const bottomSpace = verticalHeight - renderedHeight;
        iterSegments = (function* () {
          yield* generateSegments();
          yield* blankLinesGen(bottomSpace);
        })();
      } else if (this.vertical === 'middle') {
        const topSpace = Math.floor((verticalHeight - renderedHeight) / 2);
        const bottomSpace = verticalHeight - topSpace - renderedHeight;
        iterSegments = (function* () {
          yield* blankLinesGen(topSpace);
          yield* generateSegments();
          yield* blankLinesGen(bottomSpace);
        })();
      } else {
        // bottom
        const topSpace = verticalHeight - renderedHeight;
        iterSegments = (function* () {
          yield* blankLinesGen(topSpace);
          yield* generateSegments();
        })();
      }
    } else {
      iterSegments = generateSegments();
    }

    if (this.style) {
      const resolvedStyle = console.getStyle(this.style);
      iterSegments = Segment.applyStyle(iterSegments, resolvedStyle);
    }

    yield* iterSegments;
  }

  __richMeasure__(console: Console, options: ConsoleOptions): Measurement {
    return Measurement.get(console, options, this.renderable);
  }
}

/**
 * Vertically aligns a renderable (deprecated - use Align with vertical option).
 */
export class VerticalCenter {
  renderable: RenderableType;
  style?: StyleType;

  constructor(renderable: RenderableType, style?: StyleType) {
    this.renderable = renderable;
    this.style = style;
  }

  toString(): string {
    return `VerticalCenter(${JSON.stringify(this.renderable)})`;
  }

  *__richConsole__(console: Console, options: ConsoleOptions): RenderResult {
    const style = this.style !== undefined ? console.getStyle(this.style) : undefined;
    const lines = console.renderLines(this.renderable, options.update({ height: undefined }), undefined, false);
    const [width, _height] = Segment.getShape(lines);
    const newLine = Segment.line();
    const height = options.height ?? options.maxHeight;
    const topSpace = Math.floor((height - lines.length) / 2);
    const bottomSpace = height - topSpace - lines.length;
    const blankLine = new Segment(' '.repeat(width), style);

    function* blankLinesGen(count: number): Generator<Segment> {
      for (let i = 0; i < count; i++) {
        yield blankLine;
        yield newLine;
      }
    }

    if (topSpace > 0) {
      yield* blankLinesGen(topSpace);
    }
    for (const line of lines) {
      yield* line;
      yield newLine;
    }
    if (bottomSpace > 0) {
      yield* blankLinesGen(bottomSpace);
    }
  }

  __richMeasure__(console: Console, options: ConsoleOptions): Measurement {
    return Measurement.get(console, options, this.renderable);
  }
}
