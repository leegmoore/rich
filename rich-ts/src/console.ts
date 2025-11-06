/**
 * Console - The main API for Rich terminal output.
 *
 * This is a MINIMAL implementation focused on supporting text rendering.
 * Many advanced features are stubbed with TODOs for future implementation.
 */

import { Measurement } from './measure.js';
import { Segment } from './segment';
import { Style } from './style';
import { Text } from './text';
import { Rule } from './rule.js';
import { Theme } from './theme.js';
import { DEFAULT } from './themes.js';
import { ColorSystem } from './color.js';

/** Justify methods for text alignment */
export type JustifyMethod = 'default' | 'left' | 'center' | 'right' | 'full';

/** Overflow methods for text wrapping */
export type OverflowMethod = 'fold' | 'crop' | 'ellipsis' | 'ignore';

/** Type for objects that can be rendered to the console */
/** Type for render results (generators of Segments or Text instances) */
export type RenderResult = Generator<Segment | Text, void, unknown>;

export type RenderableType =
  | string
  | Text
  | { __richConsole__: (console: Console, options: ConsoleOptions) => RenderResult };

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
  private captureBuffer: string[];
  private capturingOutput: boolean;

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
    } = {}
  ) {
    this.width = options.width ?? 80;
    this.height = options.height ?? 25;
    this.legacy_windows = options.legacy_windows ?? false;
    this.isTerminal = options.force_terminal ?? false;
    // Handle colorSystem explicitly to allow null values
    if ('colorSystem' in options) {
      this.colorSystem = options.colorSystem !== undefined ? options.colorSystem : 'truecolor';
    } else if ('color_system' in options) {
      this.colorSystem = options.color_system !== undefined ? options.color_system : 'truecolor';
    } else {
      this.colorSystem = 'truecolor';
    }
    this.theme = options.theme ?? DEFAULT;
    this.captureBuffer = [];
    this.capturingOutput = false;

    this.options = new ConsoleOptions({
      maxWidth: this.width,
      minWidth: 1,
      isTerminal: this.isTerminal,
      encoding: 'utf-8',
      maxHeight: this.height,
      legacy_windows: this.legacy_windows,
      markup: options.markup ?? true,
      highlight: options.highlight ?? true,
      theme: this.theme,
    });
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

    // Handle objects with __richConsole__ protocol (including Text)
    if (renderable && typeof renderable === 'object' && '__richConsole__' in renderable) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const richConsole = (renderable as any).__richConsole__;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
      const segments = Array.from(richConsole.call(renderable, this, renderOptions));
      return segments as Segment[];
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
    // Handle multiple arguments - join with spaces
    if (args.length === 0) {
      this._printSingle('\n');
      return;
    }

    // If last arg is an options object with height, extract it
    let options: { height?: number } | undefined;
    let renderables = args;

    const lastArg = args[args.length - 1];
    if (
      args.length > 1 &&
      typeof lastArg === 'object' &&
      lastArg !== null &&
      !('__richConsole__' in (lastArg as Record<string, unknown>)) &&
      'height' in (lastArg as Record<string, unknown>)
    ) {
      options = args[args.length - 1] as { height?: number };
      renderables = args.slice(0, -1);
    }

    if (renderables.length === 1) {
      this._printSingle(renderables[0], options);
    } else {
      // Multiple args - render each and join with spaces
      const outputs: string[] = [];
      for (const renderable of renderables) {
        const output = this._renderToString(renderable, options);
        outputs.push(output);
      }
      const finalOutput = outputs.join(' ') + '\n';

      if (this.capturingOutput) {
        this.captureBuffer.push(finalOutput);
      } else {
        process.stdout.write(finalOutput);
      }
    }
  }

  private _printSingle(renderable: unknown, options?: { height?: number }): void {
    let output = this._renderToString(renderable, options);
    // Only add newline if output doesn't already end with one
    if (!output.endsWith('\n')) {
      output += '\n';
    }
    if (this.capturingOutput) {
      this.captureBuffer.push(output);
    } else {
      process.stdout.write(output);
    }
  }

  private _renderToString(renderable: unknown, options?: { height?: number }): string {
    // Update console options if height is provided
    const renderOptions =
      options?.height !== undefined
        ? this.options.update({ height: options.height })
        : this.options;

    if (typeof renderable === 'string') {
      // Convert string to Text via renderStr() to handle markup processing
      const text = this.renderStr(renderable);
      renderable = text;
    }

    if (renderable && typeof renderable === 'object' && '__richConsole__' in renderable) {
      // Handle objects with __richConsole__ protocol (like Padding, Rule, etc.)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const richConsole = (renderable as any).__richConsole__;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
      const items = Array.from(richConsole.call(renderable, this, renderOptions));
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
    } else if (renderable instanceof Text) {
      const segments = renderable.render(this, '');
      return this._renderSegments(segments);
    } else {
      return String(renderable);
    }
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

    // Handle Text and objects with __richConsole__ protocol
    // Text has __richConsole__ which wraps text to width
    if (renderable && typeof renderable === 'object' && '__richConsole__' in renderable) {
      // Handle objects with __richConsole__ protocol (including Text)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const richConsole = (renderable as any).__richConsole__;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
      segments = Array.from(richConsole.call(renderable, this, renderOptions));
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
