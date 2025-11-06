/**
 * Measurement utilities for calculating render widths.
 * Stores the minimum and maximum widths (in characters) required to render an object.
 */

import { NotRenderableError } from './errors';
import type { Console, ConsoleOptions } from './console';
import { Text } from './text';

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
  static get(console: Console, options: ConsoleOptions, renderable: unknown): Measurement {
    const maxWidth = options.maxWidth;
    if (maxWidth < 1) {
      return new Measurement(0, 0);
    }

    // Handle string renderables
    if (typeof renderable === 'string') {
      const textRenderable = console.renderStr(renderable, {
        markup: options.markup,
        highlight: false,
      });
      return Measurement.get(console, options, textRenderable);
    }

    // Handle Text instances
    if (renderable instanceof Text) {
      // Check if the renderable has __richMeasure__ method
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const richMeasure = (renderable as any).__richMeasure__;
      if (typeof richMeasure === 'function') {
        /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
        const renderWidth = richMeasure
          .call(renderable, console, options)
          .normalize()
          .withMaximum(maxWidth);
        if (renderWidth.maximum < 1) {
          return new Measurement(0, 0);
        }
        return renderWidth.normalize();
        /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
      }
      // Default: return full width for Text without __richMeasure__
      return new Measurement(0, maxWidth);
    }

    // Handle objects with __richMeasure__ method
    if (renderable && typeof renderable === 'object' && '__richMeasure__' in renderable) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const richMeasure = (renderable as any).__richMeasure__;
      if (typeof richMeasure === 'function') {
        /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
        const renderWidth = richMeasure
          .call(renderable, console, options)
          .normalize()
          .withMaximum(maxWidth);
        if (renderWidth.maximum < 1) {
          return new Measurement(0, 0);
        }
        return renderWidth.normalize();
        /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
      }
    }

    // Not a renderable type
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
  console: Console,
  options: ConsoleOptions,
  renderables: unknown
): Measurement {
  // Handle empty or non-iterable renderables
  if (!renderables) {
    return new Measurement(0, 0);
  }

  // Handle single string
  if (typeof renderables === 'string') {
    return Measurement.get(console, options, renderables);
  }

  // Handle array of renderables
  if (Array.isArray(renderables)) {
    if (renderables.length === 0) {
      return new Measurement(0, 0);
    }

    const measurements = renderables.map((renderable) =>
      Measurement.get(console, options, renderable)
    );

    const minimum = Math.max(...measurements.map((m) => m.minimum));
    const maximum = Math.max(...measurements.map((m) => m.maximum));

    return new Measurement(minimum, maximum);
  }

  // Fallback for other types
  return new Measurement(0, 0);
}
