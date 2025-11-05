/**
 * Measurement utilities for calculating render widths.
 * Stores the minimum and maximum widths (in characters) required to render an object.
 */

import { NotRenderableError } from './errors';

// TODO: Import these once console module is ported
// import type { Console, ConsoleOptions, RenderableType } from './console';

/**
 * Stores the minimum and maximum widths (in characters) required to render an object.
 */
export class Measurement {
  /** Minimum number of cells required to render. */
  readonly minimum: number;

  /** Maximum number of cells required to render. */
  readonly maximum: number;

  constructor(minimum: number, maximum: number) {
    this.minimum = minimum;
    this.maximum = maximum;
  }

  /**
   * Get difference between maximum and minimum.
   */
  get span(): number {
    return this.maximum - this.minimum;
  }

  /**
   * Get measurement that ensures that minimum <= maximum and minimum >= 0
   *
   * @returns A normalized measurement.
   */
  normalize(): Measurement {
    const minimum = Math.min(Math.max(0, this.minimum), this.maximum);
    return new Measurement(Math.max(0, minimum), Math.max(0, Math.max(minimum, this.maximum)));
  }

  /**
   * Get a Measurement where the widths are <= width.
   *
   * @param width - Maximum desired width.
   * @returns New Measurement object.
   */
  withMaximum(width: number): Measurement {
    return new Measurement(Math.min(this.minimum, width), Math.min(this.maximum, width));
  }

  /**
   * Get a Measurement where the widths are >= width.
   *
   * @param width - Minimum desired width.
   * @returns New Measurement object.
   */
  withMinimum(width: number): Measurement {
    const normalizedWidth = Math.max(0, width);
    return new Measurement(
      Math.max(this.minimum, normalizedWidth),
      Math.max(this.maximum, normalizedWidth)
    );
  }

  /**
   * Clamp a measurement within the specified range.
   *
   * @param minWidth - Minimum desired width, or undefined for no minimum.
   * @param maxWidth - Maximum desired width, or undefined for no maximum.
   * @returns New Measurement object.
   */
  clamp(minWidth?: number, maxWidth?: number): Measurement {
    if (minWidth !== undefined && maxWidth !== undefined) {
      return this.withMinimum(minWidth).withMaximum(maxWidth);
    } else if (minWidth !== undefined) {
      return this.withMinimum(minWidth);
    } else if (maxWidth !== undefined) {
      return this.withMaximum(maxWidth);
    }
    return this;
  }

  /**
   * Get a measurement for a renderable.
   *
   * @param console - Console instance.
   * @param options - Console options.
   * @param renderable - An object that may be rendered with Rich.
   * @returns Measurement object containing range of character widths required to render the object.
   * @throws {NotRenderableError} If the object is not renderable.
   */
  static get(_console: unknown, _options: unknown, renderable: unknown): Measurement {
    // TODO: Implement once console module is ported
    // For now, throw an error to indicate this needs console
    throw new NotRenderableError(
      `Unable to get render width for ${String(renderable)}; ` +
        'a str, Segment, or object with __rich_console__ method is required'
    );
  }
}

/**
 * Get a measurement that would fit a number of renderables.
 *
 * @param console - Console instance.
 * @param options - Console options.
 * @param renderables - One or more renderable objects.
 * @returns Measurement object containing range of character widths required to contain all given renderables.
 */
export function measureRenderables(
  _console: unknown,
  _options: unknown,
  _renderables: unknown
): Measurement {
  // TODO: Implement once console module is ported
  // For now, return a simple measurement
  return new Measurement(0, 0);
}
