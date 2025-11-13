/**
 * Console - The main API for Rich terminal output.
 *
 * This is a MINIMAL implementation focused on supporting text rendering.
 * Many advanced features are stubbed with TODOs for future implementation.
 */

import { Measurement } from './measure.js';
import { Segment } from './segment.js';
import { Style } from './style.js';
import { Text } from './text.js';
import { Rule } from './rule.js';
import { Theme } from './theme.js';
import { DEFAULT } from './themes.js';
import { ColorSystem, blendRgb } from './color.js';
import { Control } from './control.js';
import { Pretty } from './pretty.js';
import type { Live } from './live.js';
import { CONSOLE_HTML_FORMAT, CONSOLE_SVG_FORMAT } from './_export_format.js';
import { DEFAULT_TERMINAL_THEME, SVG_EXPORT_THEME } from './terminal_theme.js';
import { cellLen } from './cells.js';

/** Justify methods for text alignment */
export type JustifyMethod = 'default' | 'left' | 'center' | 'right' | 'full';

/** Overflow methods for text wrapping */
export type OverflowMethod = 'fold' | 'crop' | 'ellipsis' | 'ignore';

/** Type for objects that can be rendered to the console */
/** Type for render results (generators of Segments or Text instances) */
export type RenderResult = Generator<Segment | Text, void, unknown>;

type RichConsoleIterable = Iterable<Segment | Text | string>;

interface RichConsoleRenderable {
  __richConsole__: (console: Console, options: ConsoleOptions) => RichConsoleIterable;
}

function hasRichConsole(value: unknown): value is RichConsoleRenderable {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as { __richConsole__?: unknown };
  return typeof candidate.__richConsole__ === 'function';
}

const RICH_CAST_MAX_DEPTH = 10;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value) as object | null;
  return prototype === Object.prototype || prototype === null;
}

export type RenderableType =
  | string
  | Text
  | { __richConsole__: (console: Console, options: ConsoleOptions) => RenderResult };

export type ConsoleRenderable = RenderableType | Control;

export interface RenderHook {
  processRenderables(renderables: ConsoleRenderable[]): ConsoleRenderable[];
}

/**
 * Size of the terminal.
 */
export class ConsoleDimensions {
  /** The width of the console in 'cells'. */
  readonly width: number;
  /** The height of the console in lines. */
  readonly height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}

/**
 * Console options for rendering.
 */
export class ConsoleOptions {
  readonly maxWidth: number;
  readonly minWidth: number;
  readonly isTerminal: boolean;
  readonly encoding: string;
  readonly maxHeight: number;
  readonly height?: number;
  readonly legacy_windows: boolean;
  readonly markup: boolean;
  readonly highlight: boolean;
  readonly theme: Theme;
  readonly safeBox?: boolean;

  constructor(
    options: {
      maxWidth?: number;
      minWidth?: number;
      isTerminal?: boolean;
      encoding?: string;
      maxHeight?: number;
      height?: number;
      legacy_windows?: boolean;
      markup?: boolean;
      highlight?: boolean;
      theme?: Theme;
      safeBox?: boolean;
    } = {}
  ) {
    this.maxWidth = options.maxWidth ?? 80;
    this.minWidth = options.minWidth ?? 1;
    this.isTerminal = options.isTerminal ?? false;
    this.encoding = options.encoding ?? 'utf-8';
    this.maxHeight = options.maxHeight ?? 25;
    this.height = options.height;
    this.legacy_windows = options.legacy_windows ?? false;
    this.markup = options.markup ?? true;
    this.highlight = options.highlight ?? true;
    this.theme = options.theme ?? DEFAULT;
    this.safeBox = options.safeBox;
  }

  /**
   * Check if renderables should use ASCII only.
   */
  get asciiOnly(): boolean {
    return !this.encoding.startsWith('utf');
  }

  /**
   * Check if we're on legacy Windows.
   */
  get legacyWindows(): boolean {
    return this.legacy_windows;
  }

  /**
   * Create a copy of options with updated width.
   */
  updateWidth(width: number): ConsoleOptions {
    return new ConsoleOptions({
      maxWidth: width,
      minWidth: this.minWidth,
      isTerminal: this.isTerminal,
      encoding: this.encoding,
      maxHeight: this.maxHeight,
      height: this.height,
      legacy_windows: this.legacy_windows,
      markup: this.markup,
      highlight: this.highlight,
      theme: this.theme,
    });
  }

  /**
   * Update the height, and return a copy.
   */
  updateHeight(height: number): ConsoleOptions {
    return new ConsoleOptions({
      maxWidth: this.maxWidth,
      minWidth: this.minWidth,
      isTerminal: this.isTerminal,
      encoding: this.encoding,
      maxHeight: height,
      height: height,
      legacy_windows: this.legacy_windows,
      markup: this.markup,
      highlight: this.highlight,
      theme: this.theme,
    });
  }

  /**
   * Create a copy of options with updated dimensions.
   */
  update(
    options: {
      maxWidth?: number;
      minWidth?: number;
      maxHeight?: number;
      height?: number;
      width?: number;
      highlight?: boolean;
    } = {}
  ): ConsoleOptions {
    return new ConsoleOptions({
      maxWidth: options.width ?? options.maxWidth ?? this.maxWidth,
      minWidth: options.minWidth ?? this.minWidth,
      isTerminal: this.isTerminal,
      encoding: this.encoding,
      maxHeight: options.maxHeight ?? this.maxHeight,
      height: options.height ?? this.height,
      legacy_windows: this.legacy_windows,
      markup: this.markup,
      highlight: options.highlight ?? this.highlight,
      theme: this.theme,
    });
  }

  /**
   * Update the width and height, and return a copy.
   */
  updateDimensions(width: number, height: number): ConsoleOptions {
    return new ConsoleOptions({
      maxWidth: width,
      minWidth: this.minWidth,
      isTerminal: this.isTerminal,
      encoding: this.encoding,
      maxHeight: height,
      height: height,
      legacy_windows: this.legacy_windows,
      markup: this.markup,
      highlight: this.highlight,
      theme: this.theme,
    });
  }
}

/**
 * A high-level console interface.
 *
 * This is a MINIMAL implementation. Many features from the Python version
 * are not yet implemented (marked with TODO comments).
 */
export class Console {
  readonly width: number;
  readonly height: number;
  readonly options: ConsoleOptions;
  readonly legacy_windows: boolean;
  readonly isTerminal: boolean;
  readonly colorSystem: string | null;
  readonly theme: Theme;
  readonly noColor: boolean;
  readonly no_color: boolean;
  private captureBuffer: string[];
  private capturingOutput: boolean;
  private getTimeFn: () => number;
  private getDatetimeFn: () => Date;
  private liveStack: Live[] = [];
  private renderHooks: RenderHook[] = [];
  private altScreenEnabled = false;
  readonly isJupyter: boolean;
  readonly isInteractive: boolean;
  readonly isDumbTerminal: boolean;
  private readonly logTimeEnabled: boolean;
  private readonly logTimeFormat?: string;
  readonly record: boolean;
  private _recordBuffer: Segment[] = [];

  // TODO: Add full set of Console properties when needed:
  // - file: TextIO
  // - highlighter: HighlighterType
  // - tab_size: number
  // - record: boolean
  // - markup: boolean
  // - emoji: boolean
  // - soft_wrap: boolean
  // etc.

  constructor(
    options: {
      width?: number;
      height?: number;
      force_terminal?: boolean;
      force_jupyter?: boolean;
      force_interactive?: boolean;
      color_system?: 'auto' | 'standard' | '256' | 'truecolor' | 'windows' | null;
      colorSystem?: 'auto' | 'standard' | '256' | 'truecolor' | 'windows' | 'none' | null;
      legacy_windows?: boolean;
      file?: unknown; // TODO: proper IO type
      theme?: Theme;
      stderr?: boolean;
      markup?: boolean;
      highlight?: boolean;
      log_time?: boolean;
      log_path?: boolean;
      log_time_format?: string;
      highlighter?: unknown; // TODO: Highlighter type
      emoji?: boolean;
      emoji_variant?: 'emoji' | 'text';
      record?: boolean;
      soft_wrap?: boolean;
      tab_size?: number;
      safe_box?: boolean;
      get_datetime?: () => Date;
      get_time?: () => number;
      noColor?: boolean;
      no_color?: boolean;
      encoding?: string;
    } = {}
  ) {
    // Prefer explicit options; otherwise detect from TTY when available
    const ttyColumns = typeof process !== 'undefined' && process.stdout && (process.stdout as any).columns ? (process.stdout as any).columns as number : undefined;
    const ttyRows = typeof process !== 'undefined' && process.stdout && (process.stdout as any).rows ? (process.stdout as any).rows as number : undefined;
    this.width = options.width ?? ttyColumns ?? 80;
    this.height = options.height ?? ttyRows ?? 25;
    this.legacy_windows = options.legacy_windows ?? false;
    this.isTerminal = Console._detectTerminal(options.force_terminal, options.file);
    // Handle colorSystem explicitly to allow null values
    if ('colorSystem' in options) {
      this.colorSystem = options.colorSystem !== undefined ? options.colorSystem : 'truecolor';
    } else if ('color_system' in options) {
      this.colorSystem = options.color_system !== undefined ? options.color_system : 'truecolor';
    } else {
      this.colorSystem = 'truecolor';
    }
    this.theme = options.theme ?? DEFAULT;
    const noColorOption = options.noColor ?? options.no_color ?? false;
    this.noColor = noColorOption;
    this.no_color = noColorOption;
    this.captureBuffer = [];
    this.capturingOutput = false;
    this.isJupyter = options.force_jupyter ?? false;
    this.isInteractive = options.force_interactive ?? this.isTerminal;
    this.isDumbTerminal = !this.isTerminal;
    this.logTimeEnabled = options.log_time ?? false;
    this.logTimeFormat = options.log_time_format;
    this.record = options.record ?? false;
    this._recordBuffer = [];

    this.options = new ConsoleOptions({
      maxWidth: this.width,
      minWidth: 1,
      isTerminal: this.isTerminal,
      encoding: options.encoding ?? 'utf-8',
      maxHeight: this.height,
      legacy_windows: this.legacy_windows,
      markup: options.markup ?? true,
      highlight: options.highlight ?? true,
      theme: this.theme,
    });

    const perf = typeof globalThis !== 'undefined' ? globalThis.performance : undefined;
    const defaultGetTime =
      perf && typeof perf.now === 'function' ? () => perf.now() / 1000 : () => Date.now() / 1000;
    this.getTimeFn = options.get_time ?? defaultGetTime;
    this.getDatetimeFn = options.get_datetime ?? (() => new Date());
  }

  /**
   * Get the current monotonic time in seconds.
   */
  getTime(): number {
    return this.getTimeFn();
  }

  /**
   * Python-compatible alias for getTime().
   */
  get_time(): number {
    return this.getTime();
  }

  /**
   * Get the current datetime object.
   */
  getDatetime(): Date {
    return this.getDatetimeFn();
  }

  /**
   * Python-compatible alias for getDatetime().
   */
  get_datetime(): Date {
    return this.getDatetime();
  }

  /**
   * Render a string with optional markup to a Text instance.
   * TODO: Implement full markup rendering when markup module is ported.
   */
  renderStr(
    text: string,
    options: {
      style?: string | Style;
      justify?: JustifyMethod;
      overflow?: OverflowMethod;
      emoji?: boolean;
      markup?: boolean;
      highlight?: boolean;
      highlighter?: unknown;
      end?: string;
    } = {}
  ): Text {
    const markup = options.markup ?? this.options.markup;
    const emoji = options.emoji ?? true;

    if (markup) {
      return Text.fromMarkup(text, {
        style: options.style,
        emoji,
        justify: options.justify,
        overflow: options.overflow,
        end: options.end,
      });
    }

    return new Text(text, options.style ?? '', {
      justify: options.justify,
      overflow: options.overflow,
      end: options.end,
    });
  }

  /**
   * Get a Style instance for a style definition.
   * Looks up style names in the theme or parses style strings.
   */
  getStyle(styleDefinition: string | Style, defaultStyle?: Style): Style {
    if (typeof styleDefinition === 'string') {
      // Check if it's a theme style name
      if (this.theme.styles[styleDefinition]) {
        return this.theme.styles[styleDefinition];
      }
      // Otherwise parse as style definition
      try {
        return Style.parse(styleDefinition);
      } catch {
        return defaultStyle ?? Style.null();
      }
    }
    return styleDefinition;
  }

  /**
   * Render any renderable object to segments.
   * TODO: Full implementation with all renderable types.
   */
  render(renderable: unknown, options?: ConsoleOptions): Segment[] {
    const renderOptions = options ?? this.options;
    let normalized = this.richCast(renderable);

    if (typeof normalized === 'string') {
      normalized = this.renderStr(normalized);
    }

    if (normalized instanceof Segment) {
      return [normalized];
    }

    if (normalized instanceof Control) {
      return [normalized.segment];
    }

    if (normalized === null || normalized === undefined) {
      return [];
    }

    if (hasRichConsole(normalized)) {
      const segments: Segment[] = [];
      const iterableResult = normalized.__richConsole__(this, renderOptions) as Iterable<
        Segment | RenderableType | string | undefined
      >;
      for (const item of iterableResult) {
        if (item instanceof Segment) {
          segments.push(item);
        } else if (item !== undefined && item !== null) {
          segments.push(...this.render(item, renderOptions));
        }
      }
      return segments;
    }

    throw new Error(`Cannot render object of type ${typeof normalized}`);
  }

  /**
   * Print to the console.
   * TODO: Full implementation with all print options.
   */
  print(...args: unknown[]): void {
    if (args.length === 0) {
      this._printRenderables([this.renderStr('\n', { end: '' })]);
      return;
    }

    let options: { height?: number } | undefined;
    let rawRenderables: unknown[] = args;
    const lastArg = args[args.length - 1];
    if (this.isHeightOptionsCandidate(lastArg)) {
      options = lastArg as { height?: number };
      rawRenderables = args.slice(0, -1);
    }

    if (rawRenderables.length === 0) {
      rawRenderables = [''];
    }

    const normalized: ConsoleRenderable[] = [];
    rawRenderables.forEach((value, index) => {
      normalized.push(this._coerceRenderable(value));
      if (index < rawRenderables.length - 1) {
        normalized.push(this.renderStr(' ', { end: '' }));
      }
    });
    this._printRenderables(normalized, options);
  }

  write(...args: unknown[]): void {
    if (args.length === 0) {
      return;
    }
    const normalized: ConsoleRenderable[] = [];
    args.forEach((value, index) => {
      normalized.push(this._coerceRenderable(value));
      if (index < args.length - 1) {
        normalized.push(this.renderStr(' ', { end: '' }));
      }
    });
    this._printRenderables(normalized, { appendNewline: false });
  }

  private _printRenderables(
    renderables: ConsoleRenderable[],
    options?: { height?: number; appendNewline?: boolean }
  ): void {
    const processed = this.applyRenderHooks(renderables);
    
    // Record segments if recording is enabled
    if (this.record) {
      const renderOptions =
        options?.height !== undefined
          ? this.options.update({ height: options.height })
          : this.options;
      for (const renderable of processed) {
        const segments = this.render(renderable, renderOptions);
        this._recordBuffer.push(...segments);
      }
    }
    
    const outputs = processed.map((renderable) => this._renderToString(renderable, options));
    let finalOutput = outputs.join('');
    const shouldAppendNewline = options?.appendNewline ?? true;
    if (shouldAppendNewline && !finalOutput.endsWith('\n')) {
      finalOutput += '\n';
    }
    this.writeRaw(finalOutput);
  }

  updateScreenLines(lines: Segment[][], x: number, y: number): void {
    if (!this.isTerminal) {
      const fallback = lines.map((line) => this._renderSegments(line)).join('\n');
      if (fallback) {
        this.writeRaw(fallback);
      }
      return;
    }
    const moveCursor = (row: number, col: number): string => `\x1b[${row + 1};${col + 1}H`;
    let output = '';
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      if (!line) {
        continue;
      }
      output += `${moveCursor(y + index, x)}${this._renderSegments(line)}`;
    }
    this.writeRaw(output);
  }

  private writeRaw(text: string): void {
    if (!text) {
      return;
    }
    if (this.capturingOutput) {
      this.captureBuffer.push(text);
    } else {
      process.stdout.write(text);
    }
  }

  log(...args: unknown[]): void {
    const entries = [...args];
    const prefix = this.getLogPrefix();
    if (prefix) {
      entries.unshift(prefix);
    }
    this.print(...entries);
  }

  private getLogPrefix(): Text | null {
    if (this.logTimeFormat) {
      return this.renderStr(this.logTimeFormat, { end: '' });
    }
    if (this.logTimeEnabled) {
      const timestamp = new Date().toISOString();
      return this.renderStr(`[${timestamp}]`, { end: '' });
    }
    return null;
  }

  private applyRenderHooks(renderables: ConsoleRenderable[]): ConsoleRenderable[] {
    if (this.renderHooks.length === 0) {
      return renderables;
    }
    return this.renderHooks.reduce(
      (current, hook) => hook.processRenderables(current),
      renderables
    );
  }

  private isHeightOptionsCandidate(value: unknown): value is { height?: number } {
    if (typeof value !== 'object' || value === null) {
      return false;
    }
    if (hasRichConsole(value)) {
      return false;
    }
    return 'height' in (value as Record<string, unknown>);
  }

  richCast<T = unknown>(value: T): T {
    let current: unknown = value;
    let depth = 0;
    const seen = new Set<object>();

    while (
      depth < RICH_CAST_MAX_DEPTH &&
      current !== null &&
      typeof current === 'object' &&
      '__rich__' in (current as Record<string, unknown>)
    ) {
      const candidate = (current as { __rich__?: () => unknown }).__rich__;
      if (typeof candidate !== 'function') {
        break;
      }
      const currentObject: object = current;
      if (seen.has(currentObject)) {
        break;
      }
      seen.add(currentObject);
      const result = candidate.call(current);
      if (result === current) {
        break;
      }
      current = result;
      depth += 1;
    }

    return current as T;
  }

  private _coerceRenderable(value: unknown): ConsoleRenderable {
    const castValue = this.richCast(value);

    if (castValue instanceof Control) {
      return castValue;
    }
    if (typeof castValue === 'string') {
      return this.renderStr(castValue, { end: '' });
    }
    if (castValue instanceof Text) {
      return castValue;
    }
    if (hasRichConsole(castValue)) {
      return castValue as RenderableType;
    }
    if (
      typeof castValue === 'number' ||
      typeof castValue === 'bigint' ||
      typeof castValue === 'boolean'
    ) {
      return this.renderStr(String(castValue), { end: '' });
    }
    if (castValue === null || castValue === undefined) {
      return this.renderStr('', { end: '' });
    }
    if (Array.isArray(castValue) || isPlainObject(castValue)) {
      return new Pretty(castValue);
    }
    return this.renderStr(String(castValue), { end: '' });
  }

  private _renderToString(renderable: ConsoleRenderable, options?: { height?: number }): string {
    // Update console options if height is provided
    const renderOptions =
      options?.height !== undefined
        ? this.options.update({ height: options.height })
        : this.options;

    let normalized = this.richCast(renderable);

    if (normalized instanceof Control) {
      return normalized.segment.text;
    }

    if (typeof normalized === 'string') {
      normalized = this.renderStr(normalized, { end: '' });
    }

    if (normalized instanceof Segment) {
      return this._renderSegment(normalized);
    }

    if (hasRichConsole(normalized)) {
      const segments = this.render(normalized, renderOptions);
      return this._renderSegments(segments);
    }

    return String(normalized);
  }

  /**
   * Render a segment to a string with ANSI codes if terminal supports it.
   */
  private _renderSegment(segment: Segment): string {
    // Don't render ANSI codes if not a terminal or colorSystem is null/none
    if (
      !this.isTerminal ||
      this.colorSystem === null ||
      this.colorSystem === 'none' ||
      !segment.style
    ) {
      return segment.text;
    }
    // Convert string colorSystem to enum
    const colorSystemEnum =
      this.colorSystem === 'truecolor'
        ? ColorSystem.TRUECOLOR
        : this.colorSystem === '256'
          ? ColorSystem.EIGHT_BIT
          : this.colorSystem === 'standard'
            ? ColorSystem.STANDARD
            : this.colorSystem === 'windows'
              ? ColorSystem.WINDOWS
              : ColorSystem.TRUECOLOR;
    // Render with ANSI codes
    return segment.style.render(segment.text, colorSystemEnum, this.options.legacyWindows);
  }

  /**
   * Render an array of segments to a string.
   */
  private _renderSegments(segments: Segment[]): string {
    return segments.map((seg) => this._renderSegment(seg)).join('');
  }

  /**
   * Detect whether Rich should emit ANSI codes.
   * Mirrors Python Rich behaviour by combining explicit overrides,
   * environment hints and stream capabilities.
   */
  private static _detectTerminal(forceTerminal?: boolean, file?: unknown): boolean {
    if (forceTerminal !== undefined) {
      return forceTerminal;
    }

    const env = typeof process === 'undefined' ? undefined : process.env;
    const ttyCompatible = env?.TTY_COMPATIBLE;
    if (ttyCompatible === '0') {
      return false;
    }
    if (ttyCompatible === '1') {
      return true;
    }

    const forceColor = env?.FORCE_COLOR;
    if (forceColor !== undefined) {
      if (forceColor === '' || forceColor === '0') {
        return false;
      }
      return true;
    }

    const fileIsTTY = Console._getIsTTY(file);
    if (fileIsTTY !== undefined) {
      return fileIsTTY;
    }

    const stdoutIsTTY =
      typeof process !== 'undefined' && typeof process.stdout?.isTTY === 'boolean'
        ? process.stdout.isTTY
        : undefined;
    if (stdoutIsTTY !== undefined) {
      return stdoutIsTTY;
    }

    const stderrIsTTY =
      typeof process !== 'undefined' && typeof process.stderr?.isTTY === 'boolean'
        ? process.stderr.isTTY
        : undefined;
    if (stderrIsTTY !== undefined) {
      return stderrIsTTY;
    }

    return false;
  }

  /**
   * Attempt to read an isTTY flag from a provided file-like object.
   */
  private static _getIsTTY(file?: unknown): boolean | undefined {
    if (!file || typeof file !== 'object') {
      return undefined;
    }

    if ('isTTY' in file) {
      const candidate = (file as { isTTY?: boolean }).isTTY;
      if (typeof candidate === 'boolean') {
        return candidate;
      }
    }

    return undefined;
  }

  /**
   * Get the dimensions of the console.
   */
  get size(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  /**
   * Render objects into a list of lines.
   *
   * @param renderable - Any object renderable in the console.
   * @param options - Console options, or undefined to use this.options.
   * @param style - Optional style to apply to renderables.
   * @param pad - Pad lines shorter than render width.
   * @returns A list of lines, where a line is a list of Segment objects.
   */
  renderLines(
    renderable: RenderableType,
    options?: ConsoleOptions,
    style?: Style,
    pad: boolean = true
  ): Segment[][] {
    const renderOptions = options ?? this.options;
    const normalized = this.richCast(renderable);

    if (normalized instanceof Control) {
      return [[normalized.segment]];
    }

    let segments = this.render(normalized, renderOptions);

    const shouldApplyStyle = style && !style.isNull;
    if (shouldApplyStyle) {
      segments = Array.from(Segment.applyStyle(segments, style));
    }

    const paddingStyle = style ?? undefined;
    const lines = Array.from(
      Segment.splitAndCropLines(segments, renderOptions.maxWidth, paddingStyle, pad, false)
    );

    if (renderOptions.height !== undefined) {
      const targetHeight = Math.max(renderOptions.height, 0);
      const extraLines = targetHeight - lines.length;
      if (extraLines > 0) {
        const blankStyle = style && !style.isNull ? style : undefined;
        for (let index = 0; index < extraLines; index += 1) {
          lines.push([new Segment(' '.repeat(renderOptions.maxWidth), blankStyle)]);
        }
      }
    }

    return lines;
  }

  /**
   * Begin capturing console output.
   */
  beginCapture(): void {
    this.captureBuffer = [];
    this.capturingOutput = true;
  }

  /**
   * End capture mode and return captured string.
   *
   * @returns Console output.
   */
  endCapture(): string {
    this.capturingOutput = false;
    const result = this.captureBuffer.join('');
    this.captureBuffer = [];
    return result;
  }

  /**
   * Draw a horizontal rule with optional title.
   *
   * @param title - Text to display in the rule. Defaults to "".
   * @param options - Additional options for the rule.
   */
  rule(
    title?: string | Text,
    options?: { characters?: string; style?: string | Style; align?: 'left' | 'center' | 'right' }
  ): void {
    const rule = new Rule(title ?? '', options);
    this.print(rule);
  }

  /**
   * Measure a renderable.
   *
   * @param renderable - An object that may be rendered with Rich.
   * @param options - Console options, or undefined to use default options.
   * @returns Measurement object containing range of character widths required to render the object.
   */
  measure(renderable: RenderableType, options?: ConsoleOptions): Measurement {
    const measureOptions = options ?? this.options;
    return Measurement.get(this, measureOptions, renderable);
  }

  setLive(live: Live): boolean {
    this.liveStack.push(live);
    return this.liveStack.length === 1;
  }

  clearLive(): void {
    this.liveStack.pop();
  }

  getLiveStack(): readonly Live[] {
    return this.liveStack;
  }

  isTopLive(live: Live): boolean {
    return this.liveStack.length > 0 && this.liveStack[0] === live;
  }

  pushRenderHook(hook: RenderHook): void {
    this.renderHooks.push(hook);
  }

  popRenderHook(): void {
    this.renderHooks.pop();
  }

  control(control: Control): void {
    const text = control.segment.text;
    if (this.capturingOutput) {
      this.captureBuffer.push(text);
    } else {
      process.stdout.write(text);
    }
  }

  showCursor(show: boolean): void {
    if (!this.isTerminal) {
      return;
    }
    this.control(Control.showCursor(show));
  }

  setAltScreen(enable: boolean): boolean {
    if (!this.isTerminal) {
      this.altScreenEnabled = false;
      return false;
    }
    if (this.altScreenEnabled === enable) {
      return this.altScreenEnabled;
    }
    this.altScreenEnabled = enable;
    this.control(Control.altScreen(enable));
    return this.altScreenEnabled;
  }

  line(count: number = 1): void {
    if (count <= 0) {
      return;
    }
    const text = '\n'.repeat(count);
    if (this.capturingOutput) {
      this.captureBuffer.push(text);
    } else {
      process.stdout.write(text);
    }
  }

  get is_terminal(): boolean {
    return this.isTerminal;
  }

  get is_dumb_terminal(): boolean {
    return this.isDumbTerminal;
  }

  get is_interactive(): boolean {
    return this.isInteractive;
  }

  get is_jupyter(): boolean {
    return this.isJupyter;
  }

  /**
   * Export console contents as plain text.
   * @param clear - Clear record buffer after exporting. Defaults to true.
   * @param styles - If true, ANSI escape codes will be included. Defaults to false.
   * @returns String containing console contents.
   */
  exportText(clear: boolean = true, styles: boolean = false): string {
    if (!this.record) {
      throw new Error('To export console contents set record=true in the constructor');
    }

    let text: string;
    if (styles) {
      const colorSystemEnum =
        this.colorSystem === 'truecolor'
          ? ColorSystem.TRUECOLOR
          : this.colorSystem === '256'
            ? ColorSystem.EIGHT_BIT
            : this.colorSystem === 'standard'
              ? ColorSystem.STANDARD
              : this.colorSystem === 'windows'
                ? ColorSystem.WINDOWS
                : ColorSystem.TRUECOLOR;
      text = Array.from(Segment.filterControl(this._recordBuffer, false))
        .map((segment) => (segment.style ? segment.style.render(segment.text, colorSystemEnum, this.legacy_windows) : segment.text))
        .join('');
    } else {
      text = Array.from(Segment.filterControl(this._recordBuffer, false))
        .map((segment) => segment.text)
        .join('');
    }

    if (clear) {
      this._recordBuffer = [];
    }

    return text;
  }

  /**
   * Export console contents as HTML.
   * @param options - Export options
   * @returns String containing console contents as HTML.
   */
  exportHtml(options: {
    theme?: import('./terminal_theme.js').TerminalTheme;
    clear?: boolean;
    codeFormat?: string;
    inlineStyles?: boolean;
  } = {}): string {
    if (!this.record) {
      throw new Error('To export console contents set record=true in the constructor');
    }

    const theme = options.theme || DEFAULT_TERMINAL_THEME;
    const clear = options.clear !== undefined ? options.clear : true;
    const codeFormat = options.codeFormat || CONSOLE_HTML_FORMAT;
    const inlineStyles = options.inlineStyles || false;

    const fragments: string[] = [];
    let stylesheet = '';

    const simplifiedSegments = Array.from(Segment.simplify(Segment.filterControl(this._recordBuffer, false)));

    if (inlineStyles) {
      for (const segment of simplifiedSegments) {
        let text = Console.escapeHtml(segment.text);
        if (segment.style) {
          const rule = segment.style.getHtmlStyle(theme);
          if (segment.style.link) {
            text = `<a href="${Console.escapeHtml(segment.style.link)}">${text}</a>`;
          }
          text = rule ? `<span style="${rule}">${text}</span>` : text;
        }
        fragments.push(text);
      }
    } else {
      const styles: Map<string, number> = new Map();
      for (const segment of simplifiedSegments) {
        let text = Console.escapeHtml(segment.text);
        if (segment.style) {
          const rule = segment.style.getHtmlStyle(theme);
          const styleNumber = styles.get(rule) ?? styles.size + 1;
          if (!styles.has(rule)) {
            styles.set(rule, styleNumber);
          }
          if (segment.style.link) {
            text = `<a class="r${styleNumber}" href="${Console.escapeHtml(segment.style.link)}">${text}</a>`;
          } else {
            text = `<span class="r${styleNumber}">${text}</span>`;
          }
        }
        fragments.push(text);
      }
      const stylesheetRules: string[] = [];
      for (const [styleRule, styleNumber] of styles.entries()) {
        if (styleRule) {
          stylesheetRules.push(`.r${styleNumber} {${styleRule}}`);
        }
      }
      stylesheet = stylesheetRules.join('\n');
    }

    const renderedCode = codeFormat
      .replace(/{code}/g, fragments.join(''))
      .replace(/{stylesheet}/g, stylesheet)
      .replace(/{foreground}/g, theme.foreground_color.hex)
      .replace(/{background}/g, theme.background_color.hex);

    if (clear) {
      this._recordBuffer = [];
    }

    return renderedCode;
  }

  /**
   * Export console contents as SVG.
   * @param options - Export options
   * @returns String containing console contents as SVG.
   */
  exportSvg(options: {
    title?: string;
    theme?: import('./terminal_theme.js').TerminalTheme;
    clear?: boolean;
    codeFormat?: string;
    fontAspectRatio?: number;
    uniqueId?: string;
  } = {}): string {
    if (!this.record) {
      throw new Error('To export console contents set record=true in the constructor');
    }

    const title = options.title || 'Rich';
    const theme = options.theme || SVG_EXPORT_THEME;
    const clear = options.clear !== undefined ? options.clear : true;
    const codeFormat = options.codeFormat || CONSOLE_SVG_FORMAT;
    const fontAspectRatio = options.fontAspectRatio || 0.61;
    const uniqueId = options.uniqueId || `rich-${Math.random().toString(36).substring(2, 11)}`;

    const charHeight = 20;
    const charWidth = charHeight * fontAspectRatio;
    const lineHeight = charHeight * 1.22;

    const marginTop = 1;
    const marginRight = 1;
    const marginBottom = 1;
    const marginLeft = 1;

    const simplifiedSegments = Array.from(Segment.simplify(Segment.filterControl(this._recordBuffer, false)));
    const lines = Array.from(Segment.splitLines(simplifiedSegments));

    const terminalWidth = this.width;
    const terminalHeight = lines.length;

    const width = terminalWidth * charWidth + marginLeft + marginRight;
    const height = terminalHeight * lineHeight + marginTop + marginBottom;

    const terminalX = marginLeft;
    const terminalY = marginTop;

    const styleCache = new Map<Style, string>();

    function getSvgStyle(style: Style): string {
      if (styleCache.has(style)) {
        return styleCache.get(style)!;
      }
      const cssRules: string[] = [];
      let color = style.color && !style.color.isDefault ? style.color.getTruecolor(theme, true) : theme.foreground_color;
      let bgcolor = style.bgcolor && !style.bgcolor.isDefault ? style.bgcolor.getTruecolor(theme, false) : theme.background_color;

      if (style.reverse) {
        [color, bgcolor] = [bgcolor, color];
      }
      if (style.dim) {
        color = blendRgb(color, bgcolor, 0.4);
      }
      cssRules.push(`fill: ${color.hex}`);
      if (style.bold) {
        cssRules.push('font-weight: bold');
      }
      if (style.italic) {
        cssRules.push('font-style: italic');
      }
      if (style.underline) {
        cssRules.push('text-decoration: underline');
      }
      if (style.strike) {
        cssRules.push('text-decoration: line-through');
      }

      const css = cssRules.join(';');
      styleCache.set(style, css);
      return css;
    }

    const backgrounds: string[] = [];
    const matrix: string[] = [];
    let y = 0;

    for (const line of lines) {
      let x = 0;
      for (const segment of line) {
        const text = segment.text;
        if (segment.style && segment.style.bgcolor && !segment.style.bgcolor.isDefault) {
          const bgColor = segment.style.bgcolor.getTruecolor(theme, false);
          const width = cellLen(text) * charWidth;
          backgrounds.push(
            `<rect x="${terminalX + x * charWidth}" y="${terminalY + y * lineHeight}" width="${width}" height="${charHeight}" fill="${bgColor.hex}" />`
          );
        }
        if (text) {
          const svgStyle = segment.style ? getSvgStyle(segment.style) : `fill: ${theme.foreground_color.hex}`;
          const escapedText = Console.escapeSvg(text);
          matrix.push(
            `<text x="${terminalX + x * charWidth}" y="${terminalY + y * lineHeight + charHeight}" style="${svgStyle}">${escapedText}</text>`
          );
        }
        x += cellLen(text);
      }
      y += 1;
    }

    const svg = codeFormat
      .replace(/{unique_id}/g, uniqueId)
      .replace(/{width}/g, String(width))
      .replace(/{height}/g, String(height))
      .replace(/{char_height}/g, String(charHeight))
      .replace(/{line_height}/g, String(lineHeight))
      .replace(/{terminal_width}/g, String(terminalWidth))
      .replace(/{terminal_height}/g, String(terminalHeight))
      .replace(/{terminal_x}/g, String(terminalX))
      .replace(/{terminal_y}/g, String(terminalY))
      .replace(/{styles}/g, '')
      .replace(/{lines}/g, '')
      .replace(/{chrome}/g, `<text x="${marginLeft}" y="${marginTop - 5}" class="${uniqueId}-title">${Console.escapeSvg(title)}</text>`)
      .replace(/{backgrounds}/g, backgrounds.join('\n'))
      .replace(/{matrix}/g, matrix.join('\n'));

    if (clear) {
      this._recordBuffer = [];
    }

    return svg;
  }
  /**
   * Escape HTML special characters.
   */
  static escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Escape SVG special characters.
   */
  static escapeSvg(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // - show_cursor()
  // - set_alt_screen()
  // - input()
  // - bell()
  // - pager()
  // - out()
  // - control()
  // etc.
}
