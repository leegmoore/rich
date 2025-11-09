import { SPINNERS } from './_spinners.js';
import type { Console, ConsoleOptions, RenderResult, RenderableType } from './console.js';
import { Measurement } from './measure.js';
import { Table } from './table.js';
import { Text } from './text.js';
import type { StyleType } from './style.js';

interface SpinnerUpdateOptions {
  text?: RenderableType;
  style?: StyleType;
  speed?: number;
}

interface SpinnerOptions {
  style?: StyleType;
  speed?: number;
}

export class Spinner {
  readonly name: string;
  readonly frames: string[];
  readonly interval: number;
  text: RenderableType | Text;
  style?: StyleType;
  speed: number;
  private startTime?: number;
  private frameNoOffset = 0;
  private pendingSpeed?: number;

  constructor(name: string, text: RenderableType = '', options: SpinnerOptions = {}) {
    const spinner = SPINNERS[name];
    if (!spinner) {
      throw new Error(`no spinner called '${name}'`);
    }
    this.name = name;
    this.frames = [...spinner.frames];
    this.interval = spinner.interval;
    this.text = typeof text === 'string' ? Text.fromMarkup(text) : text;
    this.style = options.style;
    this.speed = options.speed ?? 1.0;
  }

  *__richConsole__(console: Console, options: ConsoleOptions): RenderResult {
    const renderable = this.render(console.getTime());
    for (const segment of console.render(renderable, options)) {
      yield segment;
    }
  }

  __richMeasure__(console: Console, options: ConsoleOptions): Measurement {
    const snapshot = {
      startTime: this.startTime,
      frameNoOffset: this.frameNoOffset,
      pendingSpeed: this.pendingSpeed,
      speed: this.speed,
    };
    try {
      const renderable = this.render(console.getTime());
      return Measurement.get(console, options, renderable);
    } finally {
      this.startTime = snapshot.startTime;
      this.frameNoOffset = snapshot.frameNoOffset;
      this.pendingSpeed = snapshot.pendingSpeed;
      this.speed = snapshot.speed;
    }
  }

  render(time: number): RenderableType {
    if (this.startTime === undefined) {
      this.startTime = time;
    }

    const elapsed = time - this.startTime;
    const frameDuration = this.interval / 1000;
    const frameNumber = Math.floor((elapsed * this.speed) / frameDuration + this.frameNoOffset);
    const frameIndex =
      ((frameNumber % this.frames.length) + this.frames.length) % this.frames.length;
    const frameText = new Text(this.frames[frameIndex], this.style ?? '');
    frameText.end = '';

    if (this.pendingSpeed !== undefined) {
      this.frameNoOffset = frameNumber;
      this.startTime = time;
      this.speed = this.pendingSpeed;
      this.pendingSpeed = undefined;
    }

    const textRenderable = this.text;
    const hasText =
      typeof textRenderable === 'string'
        ? textRenderable.length > 0
        : textRenderable instanceof Text
          ? textRenderable.plain.length > 0
          : Boolean(textRenderable);

    if (!hasText) {
      return frameText;
    }

    if (typeof textRenderable === 'string' || textRenderable instanceof Text) {
      const renderedText =
        typeof textRenderable === 'string'
          ? Text.fromMarkup(textRenderable)
          : textRenderable.copy
            ? textRenderable.copy()
            : textRenderable;
      renderedText.end = renderedText.end ?? '';
      return Text.assemble(frameText, ' ', renderedText, { end: '' });
    }

    const table = Table.grid({ padding: 1 });
    table.addRow(frameText, textRenderable);
    return table;
  }

  update(options: SpinnerUpdateOptions = {}): void {
    if (options.text !== undefined) {
      this.text = typeof options.text === 'string' ? Text.fromMarkup(options.text) : options.text;
    }
    if (options.style !== undefined) {
      this.style = options.style;
    }
    if (options.speed !== undefined) {
      this.pendingSpeed = options.speed;
    }
  }
}
