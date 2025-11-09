import type { Console, ConsoleOptions, RenderResult, RenderableType } from './console.js';
import { Renderables } from './containers.js';
import { Segment } from './segment.js';
import type { StyleType } from './style.js';
import { loopLast } from './_loop.js';

export interface ScreenOptions {
  style?: StyleType;
  applicationMode?: boolean;
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

function isScreenOptions(value: unknown): value is ScreenOptions {
  if (!isPlainObject(value)) {
    return false;
  }
  const keys = Object.keys(value);
  if (keys.length === 0) {
    return false;
  }
  return keys.every((key) => key === 'style' || key === 'applicationMode');
}

export class Screen {
  private readonly renderable: Renderables;
  private readonly style?: StyleType;
  private readonly applicationMode: boolean;

  constructor(...renderables: RenderableType[]);
  constructor(options: ScreenOptions, ...renderables: RenderableType[]);
  constructor(...args: Array<RenderableType | ScreenOptions>) {
    let options: ScreenOptions = {};
    let renderables = args as RenderableType[];

    if (args.length > 0 && isScreenOptions(args[0])) {
      options = args[0];
      renderables = args.slice(1) as RenderableType[];
    }

    if (renderables.length === 0) {
      renderables = [''];
    }

    this.renderable = new Renderables(renderables);
    this.style = options.style;
    this.applicationMode = options.applicationMode ?? false;
  }

  *__richConsole__(console: Console, options: ConsoleOptions): RenderResult {
    const width = options.maxWidth ?? console.width;
    const height = options.height ?? options.maxHeight ?? console.height;
    const resolvedStyle = this.style ? console.getStyle(this.style) : undefined;
    const renderOptions = options.update({ width, height });
    const lines = console.renderLines(this.renderable, renderOptions, resolvedStyle, true);
    const shapedLines = Segment.setShape(lines, width, height, resolvedStyle);
    const newline = this.applicationMode ? new Segment('\n\r') : Segment.line();

    for (const [isLast, line] of loopLast(shapedLines)) {
      for (const segment of line) {
        yield segment;
      }
      if (!isLast) {
        yield newline;
      }
    }
  }
}

export default Screen;
