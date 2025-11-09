import type { Console, ConsoleOptions, RenderResult } from './console.js';
import { Measurement } from './measure.js';
import { Segment } from './segment.js';
import { Style, type StyleType } from './style.js';

const BEGIN_BLOCK_ELEMENTS = ['█', '█', '█', '▐', '▐', '▐', '▕', '▕'];
const END_BLOCK_ELEMENTS = [' ', '▏', '▎', '▍', '▌', '▋', '▊', '▉'];
const FULL_BLOCK = '█';

export interface BarOptions {
  width?: number;
  color?: StyleType;
  bgcolor?: StyleType;
}

interface BarInit {
  size: number;
  begin: number;
  end: number;
  width?: number;
  color?: string;
  bgcolor?: string;
}

export class Bar {
  readonly size: number;
  readonly begin: number;
  readonly end: number;
  readonly width?: number;
  readonly style: Style;

  constructor({ size, begin, end, width, color = 'default', bgcolor = 'default' }: BarInit) {
    this.size = size;
    this.begin = Math.max(0, begin);
    this.end = Math.min(end, size);
    this.width = width;
    this.style = new Style({ color, bgcolor });
  }

  toString(): string {
    return `Bar(${this.size}, ${this.begin}, ${this.end})`;
  }

  *__richConsole__(_console: Console, options: ConsoleOptions): RenderResult {
    const availableWidth = options.maxWidth;
    const width = Math.min(this.width ?? availableWidth, availableWidth);

    if (this.begin >= this.end || width <= 0 || this.size <= 0) {
      yield new Segment(' '.repeat(width), this.style);
      yield Segment.line();
      return;
    }

    const prefixCompleteEights = Math.floor((width * 8 * this.begin) / this.size);
    const prefixBarCount = Math.floor(prefixCompleteEights / 8);
    const prefixEightsCount = prefixCompleteEights % 8;

    const bodyCompleteEights = Math.floor((width * 8 * this.end) / this.size);
    const bodyBarCount = Math.floor(bodyCompleteEights / 8);
    const bodyEightsCount = bodyCompleteEights % 8;

    let prefix = ' '.repeat(prefixBarCount);
    if (prefixEightsCount) {
      prefix += BEGIN_BLOCK_ELEMENTS[prefixEightsCount];
    }

    let body = FULL_BLOCK.repeat(bodyBarCount);
    if (bodyEightsCount) {
      body += END_BLOCK_ELEMENTS[bodyEightsCount];
    }

    const suffix = ' '.repeat(Math.max(0, width - body.length));
    const line = prefix + body.slice(prefix.length) + suffix;

    yield new Segment(line.slice(0, width), this.style);
    yield Segment.line();
  }

  __richMeasure__(_console: Console, options: ConsoleOptions): Measurement {
    if (this.width !== undefined) {
      return new Measurement(this.width, this.width);
    }
    return new Measurement(4, options.maxWidth);
  }
}
