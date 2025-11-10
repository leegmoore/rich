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
import { ColorSystem } from './color.js';
import { Control } from './control.js';
import type { Live } from './live.js';

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
  private liveStack: Live[] = [];
  private renderHooks: RenderHook[] = [];
  private altScreenEnabled = false;
  readonly isJupyter: boolean;
  readonly isInteractive: boolean;
  readonly isDumbTerminal: boolean;

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
    this.width = options.width ?? 80;
    this.height = options.height ?? 25;
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
    } = {}
  ): Text {
    const markup = options.markup ?? this.options.markup;
    const emoji = options.emoji ?? true;

    if (markup) {
      // Use Text.fromMarkup() which handles the markup rendering
      // Set end='' to avoid adding newlines when rendering multiple args
      const result = Text.fromMarkup(text, { style: options.style, emoji });
      result.end = '';
      return result;
    }
    const result = new Text(text, options.style);
    result.end = '';
    return result;
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

    // Handle strings - convert to Text which will use __richConsole__
    if (typeof renderable === 'string') {
      const text = this.renderStr(renderable);
      renderable = text;
    }

    if (renderable instanceof Control) {
      return [renderable.segment];
    }

    // Handle objects with __richConsole__ protocol (including Text)
    if (hasRichConsole(renderable)) {
      const iterableResult = renderable.__richConsole__(this, renderOptions);
      const rawSegments: Array<Segment | Text | string> = Array.from(
        iterableResult as Iterable<Segment | Text | string>
      );
      const normalizedSegments: Segment[] = [];
      for (const item of rawSegments) {
        if (item instanceof Segment) {
          normalizedSegments.push(item);
        } else if (item instanceof Text) {
          normalizedSegments.push(...item.render(this, ''));
        } else if (typeof item === 'string') {
          normalizedSegments.push(new Segment(item));
        }
      }
      return normalizedSegments;
    }

    // TODO: Handle other renderable types
    // - Segment
    // - Style
    // - Control codes
    // - Pretty objects
    // - etc.

    throw new Error(`Cannot render object of type ${typeof renderable}`);
  }

  /**
   * Print to the console.
   * TODO: Full implementation with all print options.
   */
  print(...args: unknown[]): void {
    if (args.length === 0) {
      this._printRenderables([this.renderStr('\n')]);
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
        normalized.push(this.renderStr(' '));
      }
    });
    this._printRenderables(normalized, options);
  }

  private _printRenderables(renderables: ConsoleRenderable[], options?: { height?: number }): void {
    const processed = this.applyRenderHooks(renderables);
    const outputs = processed.map((renderable) => this._renderToString(renderable, options));
    let finalOutput = outputs.join('');
    if (!finalOutput.endsWith('\n')) {
      finalOutput += '\n';
    }
    if (this.capturingOutput) {
      this.captureBuffer.push(finalOutput);
    } else {
      process.stdout.write(finalOutput);
    }
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

  private _coerceRenderable(value: unknown): ConsoleRenderable {
    if (value instanceof Control) {
      return value;
    }
    if (typeof value === 'string') {
      return this.renderStr(value);
    }
    if (value instanceof Text) {
      return value;
    }
    if (hasRichConsole(value)) {
      return value as RenderableType;
    }
    if (typeof value === 'number' || typeof value === 'bigint' || typeof value === 'boolean') {
      return this.renderStr(String(value));
    }
    if (value === null || value === undefined) {
      return this.renderStr('');
    }
    return this.renderStr(String(value));
  }

  private _renderToString(renderable: ConsoleRenderable, options?: { height?: number }): string {
    // Update console options if height is provided
    const renderOptions =
      options?.height !== undefined
        ? this.options.update({ height: options.height })
        : this.options;

    if (renderable instanceof Control) {
      return renderable.segment.text;
    }

    if (typeof renderable === 'string') {
      return renderable;
    }

    if (renderable instanceof Text) {
      const segments = renderable.render(this, '');
      return this._renderSegments(segments);
    }

    if (hasRichConsole(renderable)) {
      // Handle objects with __richConsole__ protocol (like Padding, Rule, etc.)
      const items = Array.from(renderable.__richConsole__(this, renderOptions));
      // Items can be Segments, Text instances, or other renderables (like Table from Columns)
      return items
        .map((item) => {
          if (item instanceof Text) {
            // Render Text to segments WITHOUT the Text's end property
            // The end will be added by print() itself
            const segments = item.render(this, '');
            return this._renderSegments(segments);
          } else if (item instanceof Segment) {
            return this._renderSegment(item);
          } else if (item && typeof item === 'object' && '__richConsole__' in item) {
            // Recursively render objects with __richConsole__ (e.g., Table from Columns)
            return this._renderToString(item, options);
          } else {
            return String(item);
          }
        })
        .join('');
    }

    return String(renderable);
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
    return segment.style.render(segment.text, colorSystemEnum);
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
    let segments: Segment[];

    // Handle string renderables - convert to Text first
    if (typeof renderable === 'string') {
      renderable = this.renderStr(renderable);
    }

    if (renderable instanceof Control) {
      return [[renderable.segment]];
    }

    // Handle Text and objects with __richConsole__ protocol
    // Text has __richConsole__ which wraps text to width
    if (hasRichConsole(renderable)) {
      const iterableResult = renderable.__richConsole__(this, renderOptions);
      const rawSegments: Array<Segment | Text | string> = Array.from(
        iterableResult as Iterable<Segment | Text | string>
      );
      const expanded: Segment[] = [];
      for (const item of rawSegments) {
        if (item instanceof Segment) {
          expanded.push(item);
        } else if (item instanceof Text) {
          expanded.push(...item.render(this, ''));
        } else if (typeof item === 'string') {
          expanded.push(new Segment(item));
        }
      }
      segments = expanded;
    } else {
      throw new Error(`Cannot render object of type ${typeof renderable}`);
    }

    // Apply style if provided (but only if it's not a null style)
    // Null styles are only used for padding segments, not content
    const shouldApplyStyle = style && !style.isNull;
    if (shouldApplyStyle) {
      segments = Array.from(Segment.applyStyle(segments, style));
    }

    // Split into lines and crop to width
    // Pass style even if null - it's used for padding segments in adjustLineLength
    const paddingStyle = style ?? undefined;
    const lines = Array.from(
      Segment.splitAndCropLines(segments, renderOptions.maxWidth, paddingStyle, pad, false)
    );

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

  // TODO: Implement remaining Console methods:
  // - log()
  // - status()
  // - export_html()
  // - export_svg()
  // - export_text()
  // - save_html()
  // - save_svg()
  // - save_text()
  // - push_theme()
  // - pop_theme()
  // - use_theme()
  // - clear()
  // - show_cursor()
  // - set_alt_screen()
  // - input()
  // - bell()
  // - pager()
  // - out()
  // - control()
  // etc.
}
