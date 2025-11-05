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

/** Justify methods for text alignment */
export type JustifyMethod = 'default' | 'left' | 'center' | 'right' | 'full';

/** Overflow methods for text wrapping */
export type OverflowMethod = 'fold' | 'crop' | 'ellipsis' | 'ignore';

/**
 * Console options for rendering.
 */
export class ConsoleOptions {
  readonly maxWidth: number;
  readonly minWidth: number;
  readonly isTerminal: boolean;
  readonly encoding: string;
  readonly maxHeight: number;
  readonly legacy_windows: boolean;
  readonly markup: boolean;
  readonly highlight: boolean;

  constructor(options: {
    maxWidth?: number;
    minWidth?: number;
    isTerminal?: boolean;
    encoding?: string;
    maxHeight?: number;
    legacy_windows?: boolean;
    markup?: boolean;
    highlight?: boolean;
  } = {}) {
    this.maxWidth = options.maxWidth ?? 80;
    this.minWidth = options.minWidth ?? 1;
    this.isTerminal = options.isTerminal ?? false;
    this.encoding = options.encoding ?? 'utf-8';
    this.maxHeight = options.maxHeight ?? 25;
    this.legacy_windows = options.legacy_windows ?? false;
    this.markup = options.markup ?? true;
    this.highlight = options.highlight ?? true;
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
      legacy_windows: this.legacy_windows,
      markup: this.markup,
      highlight: this.highlight,
    });
  }

  /**
   * Create a copy of options with updated dimensions.
   */
  update(options: {
    maxWidth?: number;
    minWidth?: number;
    maxHeight?: number;
  } = {}): ConsoleOptions {
    return new ConsoleOptions({
      maxWidth: options.maxWidth ?? this.maxWidth,
      minWidth: options.minWidth ?? this.minWidth,
      isTerminal: this.isTerminal,
      encoding: this.encoding,
      maxHeight: options.maxHeight ?? this.maxHeight,
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

  constructor(options: {
    width?: number;
    height?: number;
    force_terminal?: boolean;
    force_jupyter?: boolean;
    force_interactive?: boolean;
    color_system?: 'auto' | 'standard' | '256' | 'truecolor' | 'windows' | null;
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
  } = {}) {
    this.width = options.width ?? 80;
    this.height = options.height ?? 25;
    this.legacy_windows = options.legacy_windows ?? false;
    this.isTerminal = options.force_terminal ?? false;
    this.colorSystem = options.color_system ?? 'truecolor';

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
  render(
    renderable: unknown,
    _options?: ConsoleOptions
  ): Segment[] {
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
  print(...objects: unknown[]): void {
    // TODO: Implement full print functionality
    // For now, this is a stub
    console.log(...objects.map(obj => {
      if (obj instanceof Text) {
        return obj.plain;
      }
      return String(obj);
    }));
  }

  /**
   * Get the dimensions of the console.
   */
  get size(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  // TODO: Implement remaining Console methods:
  // - log()
  // - rule()
  // - status()
  // - capture()
  // - export_html()
  // - export_svg()
  // - export_text()
  // - save_html()
  // - save_svg()
  // - save_text()
  // - measure()
  // - render_lines()
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
