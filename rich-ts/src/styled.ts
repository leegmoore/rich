import type { Console, ConsoleOptions, RenderResult, RenderableType } from './console.js';
import { Measurement } from './measure.js';
import { Segment } from './segment.js';
import { StyleType } from './style.js';

/**
 * Wrapper that applies a style to any renderable.
 */
export class Styled {
  readonly renderable: RenderableType;
  readonly style: StyleType;

  constructor(renderable: RenderableType, style: StyleType) {
    this.renderable = renderable;
    this.style = style;
  }

  *__richConsole__(console: Console, options: ConsoleOptions): RenderResult {
    const resolvedStyle = console.getStyle(this.style);
    const renderedSegments = console.render(this.renderable, options);
    for (const segment of Segment.applyStyle(renderedSegments, resolvedStyle)) {
      yield segment;
    }
  }

  __richMeasure__(console: Console, options: ConsoleOptions): Measurement {
    return Measurement.get(console, options, this.renderable);
  }
}

export default Styled;
