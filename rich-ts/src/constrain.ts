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
    // STUB: Minimal implementation - just yields the renderable
    // TODO Phase 6: Implement width constraining with update_width
    if (this.width === undefined) {
      const segments = console.render(this.renderable, options);
      yield* segments;
      return;
    }
    throw new Error('STUB: Constrain width limiting not implemented - Phase 6');
  }

  __richMeasure__(console: Console, options: ConsoleOptions): Measurement {
    // STUB: Minimal measurement
    // TODO Phase 6: Implement proper width constraint measurement
    if (this.width !== undefined) {
      throw new Error('STUB: Constrain measurement not implemented - Phase 6');
    }
    return Measurement.get(console, options, this.renderable);
  }
}
