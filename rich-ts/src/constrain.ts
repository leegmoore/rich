/**
 * Constrain - Limit renderable width
 * Based on rich/constrain.py
 */
import type { Console, ConsoleOptions, RenderableType, RenderResult } from './console.js';
import { Measurement } from './measure.js';

/**
 * Constrain the width of a renderable to a given number of characters.
 */
export class Constrain {
  renderable: RenderableType;
  width: number | undefined;

  /**
   * Create a Constrain instance.
   *
   * @param renderable - A renderable object.
   * @param width - The maximum width (in characters) to render. Defaults to undefined (no constraint).
   */
  constructor(renderable: RenderableType, width?: number) {
    this.renderable = renderable;
    this.width = width;
  }

  *__richConsole__(console: Console, options: ConsoleOptions): RenderResult {
    if (this.width === undefined) {
      const segments = console.render(this.renderable, options);
      yield* segments;
      return;
    }
    // Update options with constrained width
    const childOptions = options.updateWidth(Math.min(this.width, options.maxWidth));
    const segments = console.render(this.renderable, childOptions);
    yield* segments;
  }

  __richMeasure__(console: Console, options: ConsoleOptions): Measurement {
    if (this.width !== undefined) {
      options = options.updateWidth(this.width);
    }
    return Measurement.get(console, options, this.renderable);
  }
}
