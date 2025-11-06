/**
 * STUB: Constrain - limit renderable width
 * TODO: Full implementation in Phase 6
 */
import type { Console, ConsoleOptions, RenderableType, RenderResult } from './console.js';
import { Measurement } from './measure.js';

export class Constrain {
  renderable: RenderableType;
  width: number | undefined;

  constructor(renderable: RenderableType, width?: number) {
    this.renderable = renderable;
    this.width = width;
  }

  *__richConsole__(console: Console, options: ConsoleOptions): RenderResult {
    // STUB: Functional but minimal implementation
    // TODO Phase 6: Add more sophisticated width handling if needed
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
    // STUB: Functional but minimal implementation
    // TODO Phase 6: Add more sophisticated measurement if needed
    if (this.width !== undefined) {
      options = options.updateWidth(this.width);
    }
    return Measurement.get(console, options, this.renderable);
  }
}
