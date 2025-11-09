import type { Console, ConsoleOptions, RenderResult, RenderableType } from './console.js';
import { Measurement } from './measure.js';

export class Renderables implements Iterable<RenderableType> {
  private readonly _renderables: RenderableType[];

  constructor(renderables: Iterable<RenderableType> = []) {
    this._renderables = Array.from(renderables);
  }

  *__richConsole__(console: Console, options: ConsoleOptions): RenderResult {
    for (const renderable of this._renderables) {
      yield* console.render(renderable as any, options);
    }
  }

  __richMeasure__(console: Console, options: ConsoleOptions): Measurement {
    if (this._renderables.length === 0) {
      return new Measurement(1, 1);
    }

    const dimensions = this._renderables.map((renderable) =>
      Measurement.get(console, options, renderable)
    );
    const minimum = Math.max(...dimensions.map((dimension) => dimension.minimum));
    const maximum = Math.max(...dimensions.map((dimension) => dimension.maximum));
    return new Measurement(minimum, maximum);
  }

  append(renderable: RenderableType): void {
    this._renderables.push(renderable);
  }

  [Symbol.iterator](): Iterator<RenderableType> {
    return this._renderables[Symbol.iterator]();
  }
}

export { Lines } from './text.js';
