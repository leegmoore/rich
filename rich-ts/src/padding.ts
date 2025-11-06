import type { Console, ConsoleOptions, RenderableType, RenderResult } from './console.js';
import { Measurement } from './measure.js';
import { Segment } from './segment.js';
import { Style } from './style.js';

/**
 * Padding dimensions - can be a single number or tuple of 1, 2, or 4 numbers (CSS-style).
 */
export type PaddingDimensions =
  | number
  | [number]
  | [number, number]
  | [number, number, number, number];

/**
 * Options for creating a Padding instance.
 */
export interface PaddingOptions {
  style?: string | Style;
  expand?: boolean;
}

/**
 * Draw space around content.
 *
 * @example
 * ```typescript
 * console.print(new Padding("Hello, World", [2, 4], { style: "on blue" }));
 * ```
 */
export class Padding {
  public readonly renderable: RenderableType;
  public readonly top: number;
  public readonly right: number;
  public readonly bottom: number;
  public readonly left: number;
  public readonly style: string | Style;
  public readonly expand: boolean;

  /**
   * Create a new Padding instance.
   *
   * @param renderable - String or other renderable.
   * @param pad - Padding for top, right, bottom, and left borders. May be specified with 1, 2, or 4 integers (CSS style).
   * @param options - Additional options.
   * @param options.style - Style for padding characters. Defaults to "none".
   * @param options.expand - Expand padding to fit available width. Defaults to true.
   */
  constructor(
    renderable: RenderableType,
    pad: PaddingDimensions = [0, 0, 0, 0],
    options: PaddingOptions = {}
  ) {
    this.renderable = renderable;
    const [top, right, bottom, left] = Padding.unpack(pad);
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.left = left;
    this.style = options.style ?? 'none';
    this.expand = options.expand ?? true;
  }

  /**
   * Make padding instance to render an indent.
   *
   * @param renderable - String or other renderable.
   * @param level - Number of characters to indent.
   * @returns A Padding instance.
   */
  static indent(renderable: RenderableType, level: number): Padding {
    return new Padding(renderable, [0, 0, 0, level], { expand: false });
  }

  /**
   * Unpack padding specified in CSS style.
   *
   * @param pad - Padding dimensions.
   * @returns Tuple of [top, right, bottom, left].
   */
  static unpack(pad: PaddingDimensions): [number, number, number, number] {
    if (typeof pad === 'number') {
      return [pad, pad, pad, pad];
    }
    if (pad.length === 1) {
      const [p] = pad;
      return [p, p, p, p];
    }
    if (pad.length === 2) {
      const [padTop, padRight] = pad;
      return [padTop, padRight, padTop, padRight];
    }
    if (pad.length === 4) {
      const [top, right, bottom, left] = pad;
      return [top, right, bottom, left];
    }
    // TypeScript can't infer that this is an array with invalid length
    throw new Error(`1, 2 or 4 integers required for padding; ${(pad as number[]).length} given`);
  }

  /**
   * String representation of the Padding instance.
   */
  toString(): string {
    return `Padding(${JSON.stringify(this.renderable)}, (${this.top},${this.right},${this.bottom},${this.left}))`;
  }

  /**
   * Rich console rendering protocol.
   */
  *__richConsole__(console: Console, options: ConsoleOptions): RenderResult {
    const style = this.style === 'none' ? Style.null() : console.getStyle(this.style);
    const width = this.expand
      ? options.maxWidth
      : Math.min(
          Measurement.get(console, options, this.renderable).maximum + this.left + this.right,
          options.maxWidth
        );

    let renderOptions = options.updateWidth(width - this.left - this.right);
    if (renderOptions.height !== undefined) {
      renderOptions = renderOptions.updateHeight(renderOptions.height - this.top - this.bottom);
    }

    // Pass style to renderLines so padding segments get Style objects
    // (adjustLineLength will create padding segments with this style)
    const lines = console.renderLines(this.renderable, renderOptions, style, true);

    const left = this.left ? new Segment(' '.repeat(this.left), style) : undefined;
    const right = this.right
      ? [new Segment(' '.repeat(this.right), style), Segment.line()]
      : [Segment.line()];

    let blankLine: Segment[] | undefined;
    if (this.top) {
      blankLine = [new Segment(' '.repeat(width) + '\n', style)];
      for (let i = 0; i < this.top; i++) {
        yield* blankLine;
      }
    }

    if (left) {
      for (const line of lines) {
        yield left;
        yield* line;
        yield* right;
      }
    } else {
      for (const line of lines) {
        yield* line;
        yield* right;
      }
    }

    if (this.bottom) {
      blankLine = blankLine ?? [new Segment(' '.repeat(width) + '\n', style)];
      for (let i = 0; i < this.bottom; i++) {
        yield* blankLine;
      }
    }
  }

  /**
   * Rich measure protocol.
   */
  __richMeasure__(console: Console, options: ConsoleOptions): Measurement {
    const maxWidth = options.maxWidth;
    const extraWidth = this.left + this.right;
    if (maxWidth - extraWidth < 1) {
      return new Measurement(maxWidth, maxWidth);
    }
    const { minimum: measureMin, maximum: measureMax } = Measurement.get(
      console,
      options,
      this.renderable
    );
    let measurement = new Measurement(measureMin + extraWidth, measureMax + extraWidth);
    measurement = measurement.withMaximum(maxWidth);
    return measurement;
  }
}
