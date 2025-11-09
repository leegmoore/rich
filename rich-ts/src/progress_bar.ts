import type { Console, ConsoleOptions, RenderResult } from './console.js';
import { Measurement } from './measure.js';
import { Segment } from './segment.js';
import { Style, type StyleType } from './style.js';
import { Color } from './color.js';
import { ColorTriplet } from './color_triplet.js';
import { blendRgb } from './color.js';

const PULSE_SIZE = 20;
const BAR_GLYPH = '━';
const HALF_BAR_RIGHT = '╸';
const HALF_BAR_LEFT = '╺';
const ASCII_BAR_GLYPH = '-';

const COLOR_SYSTEMS = new Set(['standard', 'eight_bit', 'truecolor']);

export interface ProgressBarOptions {
  total?: number | null;
  completed?: number;
  width?: number;
  pulse?: boolean;
  style?: StyleType;
  completeStyle?: StyleType;
  finishedStyle?: StyleType;
  pulseStyle?: StyleType;
  animationTime?: number;
}

export class ProgressBar {
  total: number | null;
  completed: number;
  width?: number;
  pulse: boolean;
  style: StyleType;
  completeStyle: StyleType;
  finishedStyle: StyleType;
  pulseStyle: StyleType;
  animationTime?: number;

  constructor({
    total = 100,
    completed = 0,
    width,
    pulse = false,
    style = 'bar.back',
    completeStyle = 'bar.complete',
    finishedStyle = 'bar.finished',
    pulseStyle = 'bar.pulse',
    animationTime,
  }: ProgressBarOptions = {}) {
    this.total = total ?? null;
    this.completed = completed;
    this.width = width;
    this.pulse = pulse;
    this.style = style;
    this.completeStyle = completeStyle;
    this.finishedStyle = finishedStyle;
    this.pulseStyle = pulseStyle;
    this.animationTime = animationTime;
  }

  toString(): string {
    return `<ProgressBar ${this.completed} of ${this.total}>`;
  }

  get percentageCompleted(): number | null {
    if (this.total === null) {
      return null;
    }
    if (this.total === 0) {
      return 100;
    }
    const percent = (this.completed / this.total) * 100;
    return Math.max(0, Math.min(100, percent));
  }

  update(completed: number, total?: number | null): void {
    this.completed = completed;
    if (total !== undefined) {
      this.total = total;
    }
  }

  protected _getPulseSegments(
    foreStyle: Style,
    backStyle: Style,
    colorSystem: string | null,
    noColor: boolean,
    ascii: boolean
  ): Segment[] {
    const glyph = ascii ? ASCII_BAR_GLYPH : BAR_GLYPH;
    if (!colorSystem || !COLOR_SYSTEMS.has(colorSystem) || noColor) {
      const head = Array.from({ length: PULSE_SIZE / 2 }, () => new Segment(glyph, foreStyle));
      const tailGlyph = noColor ? ' ' : glyph;
      const tail = Array.from(
        { length: PULSE_SIZE - PULSE_SIZE / 2 },
        () => new Segment(tailGlyph, backStyle)
      );
      return head.concat(tail);
    }

    const fallbackFore = foreStyle.color?.getTruecolor() ?? new ColorTriplet(255, 0, 255);
    const fallbackBack = backStyle.color?.getTruecolor() ?? new ColorTriplet(0, 0, 0);
    const segments: Segment[] = [];
    for (let index = 0; index < PULSE_SIZE; index++) {
      const position = index / PULSE_SIZE;
      const fade = 0.5 + Math.cos(position * Math.PI * 2) / 2;
      const blended = blendRgb(fallbackFore, fallbackBack, fade);
      segments.push(new Segment(glyph, new Style({ color: Color.fromTriplet(blended) })));
    }
    return segments;
  }

  protected *_renderPulse(console: Console, width: number, ascii: boolean): Iterable<Segment> {
    const foreStyle = console.getStyle(this.pulseStyle, Style.parse('white'));
    const backStyle = console.getStyle(this.style, Style.parse('black'));
    const segments = this._getPulseSegments(
      foreStyle,
      backStyle,
      console.colorSystem,
      console.noColor,
      ascii
    );
    const segmentCount = segments.length;
    if (segmentCount === 0 || width <= 0) {
      return;
    }
    const repeats = Math.floor(width / segmentCount) + 2;
    const tiled: Segment[] = [];
    for (let i = 0; i < repeats; i++) {
      tiled.push(...segments);
    }
    const currentTime = this.animationTime ?? console.getTime();
    const rawOffset = Math.floor(-currentTime * 15) % segmentCount;
    const offset = rawOffset < 0 ? rawOffset + segmentCount : rawOffset;
    const slice = tiled.slice(offset, offset + width);
    for (const segment of slice) {
      yield segment;
    }
  }

  *__richConsole__(console: Console, options: ConsoleOptions): RenderResult {
    const maxWidth = options.maxWidth;
    const width = Math.min(this.width ?? maxWidth, maxWidth);
    const ascii = options.legacy_windows || options.asciiOnly;
    const shouldPulse = this.pulse || this.total === null;

    if (shouldPulse) {
      yield* this._renderPulse(console, width, ascii);
      return;
    }

    const total = this.total ?? 100;
    const clampedCompleted = Math.min(total, Math.max(0, this.completed));
    const glyph = ascii ? ASCII_BAR_GLYPH : BAR_GLYPH;
    const halfRight = ascii ? ' ' : HALF_BAR_RIGHT;
    const halfLeft = ascii ? ' ' : HALF_BAR_LEFT;

    const completeHalves = total ? Math.floor((width * 2 * clampedCompleted) / total) : width * 2;
    const barCount = Math.floor(completeHalves / 2);
    const halfBarCount = completeHalves % 2;

    const backgroundStyle = console.getStyle(this.style);
    const finished = this.total !== null && this.completed >= this.total;
    const completeStyle = console.getStyle(finished ? this.finishedStyle : this.completeStyle);

    if (barCount > 0) {
      yield new Segment(glyph.repeat(barCount), completeStyle);
    }
    if (halfBarCount) {
      yield new Segment(halfRight.repeat(halfBarCount), completeStyle);
    }

    let remaining = width - barCount - halfBarCount;
    if (remaining > 0) {
      const canStyle =
        !console.noColor && console.colorSystem !== null && console.colorSystem !== 'none';
      const remainderStyle = canStyle ? backgroundStyle : undefined;

      if (!halfBarCount && barCount > 0) {
        yield new Segment(halfLeft, remainderStyle);
        remaining -= 1;
      }

      if (remaining > 0) {
        yield new Segment(glyph.repeat(remaining), remainderStyle);
      }
    }
  }

  __richMeasure__(_console: Console, options: ConsoleOptions): Measurement {
    if (this.width !== undefined) {
      return new Measurement(this.width, this.width);
    }
    return new Measurement(4, options.maxWidth);
  }
}
