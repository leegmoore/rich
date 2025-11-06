/**
 * Console - The main API for Rich terminal output.
 *
 * This is a MINIMAL implementation focused on supporting text rendering.
 * Many advanced features are stubbed with TODOs for future implementation.
 */

// TODO: import { Measurement } from './measure';
import { Segment } from './segment';
import { Style } from './style';
import { Text } from './text';
import { Rule } from './rule.js';

/** Justify methods for text alignment */
export type JustifyMethod = 'default' | 'left' | 'center' | 'right' | 'full';

/** Overflow methods for text wrapping */
export type OverflowMethod = 'fold' | 'crop' | 'ellipsis' | 'ignore';

/** Type for objects that can be rendered to the console */
export type RenderableType =
  | string
  | Text
  | { __richConsole__: (console: Console, options: ConsoleOptions) => Generator<Segment> };

/** Type for render results (generators of Segments or Text instances) */
export type RenderResult = Generator<Segment | Text, void, unknown>;

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
  }

  /**
   * Check if renderables should use ASCII only.
   */
  get asciiOnly(): boolean {
    return !this.encoding.startsWith('utf');
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
    } = {}
  ): ConsoleOptions {
    return new ConsoleOptions({
      maxWidth: options.maxWidth ?? this.maxWidth,
      minWidth: options.minWidth ?? this.minWidth,
      isTerminal: this.isTerminal,
      encoding: this.encoding,
      maxHeight: options.maxHeight ?? this.maxHeight,
      height: options.height ?? this.height,
      legacy_windows: this.legacy_windows,
      markup: this.markup,
      highlight: this.highlight,
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
  private captureBuffer: string[];
  private capturingOutput: boolean;

  // TODO: Add full set of Console properties when needed:
  // - file: TextIO
  // - theme: Theme
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
      theme?: unknown; // TODO: Theme type
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
    this.colorSystem = options.colorSystem ?? options.color_system ?? 'truecolor';
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
    // For now, just create a Text instance without markup processing
    // TODO: Implement full markup rendering
    if (options.markup) {
      // TODO: Use markup.render() when available
      return new Text(text, options.style);
    }
    return new Text(text, options.style);
  }

  /**
   * Get a Style instance for a style definition.
   * TODO: Implement full style resolution with themes.
   */
  getStyle(styleDefinition: string | Style, defaultStyle?: Style): Style {
    if (typeof styleDefinition === 'string') {
      // TODO: Parse style string and apply theme
      // For now, just return a null style
      return defaultStyle ?? Style.null();
    }
    return styleDefinition;
  }

  /**
   * Render any renderable object to segments.
   * TODO: Full implementation with all renderable types.
   */
  render(renderable: unknown, _options?: ConsoleOptions): Segment[] {
    // TODO: Use options for rendering configuration

    // Handle Text instances
    if (renderable instanceof Text) {
      return renderable.render(this, '');
    }

    // Handle strings
    if (typeof renderable === 'string') {
      const text = this.renderStr(renderable);
      return text.render(this, '');
    }

    // TODO: Handle other renderable types
    // - Segment
    // - Style
    // - Control codes
    // - Pretty objects
    // - Tables
    // - Panels
    // - etc.

    throw new Error(`Cannot render object of type ${typeof renderable}`);
  }

  /**
   * Print to the console.
   * TODO: Full implementation with all print options.
   */
  print(renderable: unknown): void {
    // TODO: Implement full print functionality with all options
    // For now, support basic string and renderable output
    let output: string;

    if (typeof renderable === 'string') {
      output = renderable + '\n';
    } else if (renderable && typeof renderable === 'object' && '__richConsole__' in renderable) {
      // Handle objects with __richConsole__ protocol (like Padding, Rule, etc.)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const richConsole = (renderable as any).__richConsole__;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
      const items = Array.from(richConsole.call(renderable, this, this.options));
      // Items can be Segments or Text instances
      output = items
        .map((item) => {
          if (item instanceof Text) {
            // Render Text to segments and get their text, using the Text's end property
            const segments = item.render(this, item.end);
            return segments.map((seg) => seg.text).join('');
          } else if (item instanceof Segment) {
            return item.text;
          } else {
            return String(item);
          }
        })
        .join('');
    } else if (renderable instanceof Text) {
      output = renderable.plain + '\n';
    } else {
      output = String(renderable) + '\n';
    }

    if (this.capturingOutput) {
      this.captureBuffer.push(output);
    } else {
      process.stdout.write(output);
    }
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

    // Handle string renderables
    if (typeof renderable === 'string') {
      const text = this.renderStr(renderable);
      segments = text.render(this, '');
    } else if (renderable instanceof Text) {
      segments = renderable.render(this, '');
    } else if (renderable && typeof renderable === 'object' && '__richConsole__' in renderable) {
      // Handle objects with __richConsole__ protocol
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const richConsole = (renderable as any).__richConsole__;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
      segments = Array.from(richConsole.call(renderable, this, renderOptions));
    } else {
      throw new Error(`Cannot render object of type ${typeof renderable}`);
    }

    // Apply style if provided
    if (style) {
      segments = Array.from(Segment.applyStyle(segments, style));
    }

    // Split into lines and crop to width
    const lines = Array.from(
      Segment.splitAndCropLines(segments, renderOptions.maxWidth, style, pad, false)
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

  // TODO: Implement remaining Console methods:
  // - log()
  // - status()
  // - export_html()
  // - export_svg()
  // - export_text()
  // - save_html()
  // - save_svg()
  // - save_text()
  // - measure()
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
