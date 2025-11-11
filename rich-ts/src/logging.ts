import { Console } from './console.js';
import type { RenderableType } from './console.js';
import { ReprHighlighter, type Highlighter } from './highlighter.js';
import { LogRender, type FormatTimeCallable } from './_log_render.js';
import { Text } from './text.js';

/**
 * Log levels matching common logging libraries
 */
export enum LogLevel {
  NOTSET = 0,
  DEBUG = 10,
  INFO = 20,
  WARNING = 30,
  ERROR = 40,
  CRITICAL = 50,
}

/**
 * Log record interface (similar to Python's LogRecord)
 */
export interface LogRecord {
  levelname: string;
  levelno: number;
  message: string;
  pathname?: string;
  lineno?: number;
  created: number; // timestamp in milliseconds
  exc_info?: [Error, unknown, unknown] | null;
  extra?: Record<string, unknown>;
}

/**
 * Options for RichHandler
 */
export interface RichHandlerOptions {
  level?: LogLevel | string | number;
  console?: Console;
  showTime?: boolean;
  omitRepeatedTimes?: boolean;
  showLevel?: boolean;
  showPath?: boolean;
  enableLinkPath?: boolean;
  highlighter?: Highlighter;
  markup?: boolean;
  richTracebacks?: boolean;
  tracebacksWidth?: number | null;
  tracebacksCodeWidth?: number;
  tracebacksExtraLines?: number;
  tracebacksTheme?: string | null;
  tracebacksWordWrap?: boolean;
  tracebacksShowLocals?: boolean;
  tracebacksSuppress?: Iterable<string | object>;
  tracebacksMaxFrames?: number;
  localsMaxLength?: number;
  localsMaxString?: number;
  logTimeFormat?: string | FormatTimeCallable;
  keywords?: string[] | null;
}

/**
 * A logging handler that renders output with Rich.
 * Compatible with Node.js console methods and can be integrated with logging libraries.
 */
export class RichHandler {
  static readonly KEYWORDS: string[] | null = [
    'GET',
    'POST',
    'HEAD',
    'PUT',
    'DELETE',
    'OPTIONS',
    'TRACE',
    'PATCH',
  ];

  static readonly HIGHLIGHTER_CLASS = ReprHighlighter;

  private readonly console: Console;
  private readonly highlighter: Highlighter;
  private readonly logRender: LogRender;
  private readonly enableLinkPath: boolean;
  private readonly markup: boolean;
  private readonly richTracebacks: boolean;
  private readonly _tracebacksWidth: number | null;
  private readonly _tracebacksCodeWidth: number;
  private readonly _tracebacksExtraLines: number;
  private readonly _tracebacksTheme: string | null;
  private readonly _tracebacksWordWrap: boolean;
  private readonly _tracebacksShowLocals: boolean;
  private readonly _tracebacksSuppress: Iterable<string | object>;
  private readonly _tracebacksMaxFrames: number;
  private readonly _localsMaxLength: number;
  private readonly _localsMaxString: number;
  private readonly keywords: string[] | null;
  private readonly level: number;

  constructor(options: RichHandlerOptions = {}) {
    this.console = options.console ?? new Console();
    this.highlighter = options.highlighter ?? new RichHandler.HIGHLIGHTER_CLASS();
    this.enableLinkPath = options.enableLinkPath ?? true;
    this.markup = options.markup ?? false;
    this.richTracebacks = options.richTracebacks ?? false;
    this._tracebacksWidth = options.tracebacksWidth ?? null;
    this._tracebacksCodeWidth = options.tracebacksCodeWidth ?? 88;
    this._tracebacksExtraLines = options.tracebacksExtraLines ?? 3;
    this._tracebacksTheme = options.tracebacksTheme ?? null;
    this._tracebacksWordWrap = options.tracebacksWordWrap ?? true;
    this._tracebacksShowLocals = options.tracebacksShowLocals ?? false;
    this._tracebacksSuppress = options.tracebacksSuppress ?? [];
    this._tracebacksMaxFrames = options.tracebacksMaxFrames ?? 100;
    this._localsMaxLength = options.localsMaxLength ?? 10;
    this._localsMaxString = options.localsMaxString ?? 80;
    this.keywords = options.keywords ?? RichHandler.KEYWORDS;

    const levelValue = options.level;
    if (typeof levelValue === 'string') {
      this.level = this.levelNameToNumber(levelValue);
    } else if (typeof levelValue === 'number') {
      this.level = levelValue;
    } else {
      this.level = LogLevel.NOTSET;
    }

    this.logRender = new LogRender({
      showTime: options.showTime ?? true,
      showLevel: options.showLevel ?? true,
      showPath: options.showPath ?? true,
      timeFormat: options.logTimeFormat ?? '[%x %X]',
      omitRepeatedTimes: options.omitRepeatedTimes ?? true,
      levelWidth: 8,
    });
  }

  private levelNameToNumber(levelName: string): number {
    const upper = levelName.toUpperCase();
    switch (upper) {
      case 'DEBUG':
        return LogLevel.DEBUG;
      case 'INFO':
        return LogLevel.INFO;
      case 'WARNING':
      case 'WARN':
        return LogLevel.WARNING;
      case 'ERROR':
        return LogLevel.ERROR;
      case 'CRITICAL':
      case 'FATAL':
        return LogLevel.CRITICAL;
      default:
        return LogLevel.NOTSET;
    }
  }

  /**
   * Get the level name from a level number.
   */
  getLevelText(record: LogRecord): Text {
    const levelName = record.levelname;
    const levelText = Text.fromMarkup(`[logging.level.${levelName.toLowerCase()}]${levelName.padEnd(8)}[/]`);
    return levelText;
  }

  /**
   * Emit a log record.
   */
  emit(record: LogRecord): void {
    if (record.levelno < this.level) {
      return;
    }

    let message = record.message;
    let traceback: RenderableType | null = null;

    // Handle tracebacks if enabled
    if (this.richTracebacks && record.exc_info) {
      const [excType, excValue] = record.exc_info;
      if (excType && excValue) {
        // TODO: Implement Traceback rendering when traceback module is ready
        // For now, just use the error message
        message = excValue instanceof Error ? excValue.message : String(excValue);
      }
    }

    const messageRenderable = this.renderMessage(record, message);
    const logRenderable = this.render({
      record,
      traceback,
      messageRenderable,
    });

    try {
      this.console.print(logRenderable);
    } catch (error) {
      // Silently handle errors to prevent crashes
    }
  }

  /**
   * Render message text into Text.
   */
  renderMessage(record: LogRecord, message: string): RenderableType {
    const useMarkup = (record.extra?.markup as boolean) ?? this.markup;
    const messageText = useMarkup ? Text.fromMarkup(message) : new Text(message);

    const highlighter = (record.extra?.highlighter as Highlighter) ?? this.highlighter;
    if (highlighter) {
      highlighter.call(messageText);
    }

    const keywords = this.keywords;
    if (keywords && keywords.length > 0) {
      messageText.highlightWords(keywords, 'logging.keyword');
    }

    return messageText;
  }

  /**
   * Render log for display.
   */
  render({
    record,
    traceback,
    messageRenderable,
  }: {
    record: LogRecord;
    traceback: RenderableType | null;
    messageRenderable: RenderableType;
  }): RenderableType {
    const path = record.pathname ? record.pathname.split('/').pop() ?? record.pathname : '';
    const level = this.getLevelText(record);
    const logTime = new Date(record.created);

    const renderables: RenderableType[] = [messageRenderable];
    if (traceback) {
      renderables.push(traceback);
    }

    return this.logRender.render(this.console, renderables, {
      logTime,
      level,
      path,
      lineNo: record.lineno,
      linkPath: this.enableLinkPath && record.pathname ? record.pathname : undefined,
    });
  }

  /**
   * Handle a log record (wrapper for emit that handles errors).
   */
  handle(record: LogRecord): void {
    try {
      this.emit(record);
    } catch (error) {
      // Silently handle errors
    }
  }
}

/**
 * Create a simple logger that uses RichHandler.
 * This is a convenience function for basic logging.
 */
export function createRichLogger(options: RichHandlerOptions = {}): {
  debug: (message: string, extra?: Record<string, unknown>) => void;
  info: (message: string, extra?: Record<string, unknown>) => void;
  warning: (message: string, extra?: Record<string, unknown>) => void;
  error: (message: string, error?: Error, extra?: Record<string, unknown>) => void;
  critical: (message: string, error?: Error, extra?: Record<string, unknown>) => void;
} {
  const handler = new RichHandler(options);

  const createLogRecord = (
    levelname: string,
    levelno: number,
    message: string,
    error?: Error,
    extra?: Record<string, unknown>
  ): LogRecord => {
    const stack = error?.stack;
    let pathname: string | undefined;
    let lineno: number | undefined;

    // Try to extract file/line from stack trace
    if (stack) {
      const match = stack.match(/at .+ \((.+):(\d+):(\d+)\)/);
      if (match) {
        pathname = match[1];
        lineno = parseInt(match[2] ?? '0', 10);
      }
    }

    return {
      levelname,
      levelno,
      message,
      pathname,
      lineno,
      created: Date.now(),
      exc_info: error ? [error, error, null] : null,
      extra,
    };
  };

  return {
    debug: (message: string, extra?: Record<string, unknown>) => {
      handler.handle(createLogRecord('DEBUG', LogLevel.DEBUG, message, undefined, extra));
    },
    info: (message: string, extra?: Record<string, unknown>) => {
      handler.handle(createLogRecord('INFO', LogLevel.INFO, message, undefined, extra));
    },
    warning: (message: string, extra?: Record<string, unknown>) => {
      handler.handle(createLogRecord('WARNING', LogLevel.WARNING, message, undefined, extra));
    },
    error: (message: string, error?: Error, extra?: Record<string, unknown>) => {
      handler.handle(createLogRecord('ERROR', LogLevel.ERROR, message, error, extra));
    },
    critical: (message: string, error?: Error, extra?: Record<string, unknown>) => {
      handler.handle(createLogRecord('CRITICAL', LogLevel.CRITICAL, message, error, extra));
    },
  };
}

