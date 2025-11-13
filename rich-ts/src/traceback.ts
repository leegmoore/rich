import { Columns } from './columns.js';
import { Console, type RenderableType } from './console.js';
import { RegexHighlighter } from './highlighter.js';
import { renderScope } from './scope.js';
import { Syntax } from './syntax.js';
import { Text } from './text.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * A single frame in a stack trace.
 */
export interface Frame {
  filename: string;
  lineno: number;
  colno?: number;
  name: string;
  line?: string;
  locals?: Record<string, unknown>;
}

/**
 * A stack trace containing exception information and frames.
 */
export interface Stack {
  excType: string;
  excValue: string;
  frames: Frame[];
  notes?: string[];
}

/**
 * A trace containing one or more stacks (for chained exceptions).
 */
export interface Trace {
  stacks: Stack[];
}

/**
 * Path highlighter for file paths in tracebacks.
 */
class PathHighlighter extends RegexHighlighter {
  protected highlights = [String.raw`(?<dim>.*/)(?<bold>.+)`];
}

/**
 * Options for Traceback rendering.
 */
export interface TracebackOptions {
  width?: number | null;
  codeWidth?: number | null;
  extraLines?: number;
  theme?: string | null;
  wordWrap?: boolean;
  showLocals?: boolean;
  indentGuides?: boolean;
  localsMaxLength?: number | null;
  localsMaxString?: number | null;
  localsHideDunder?: boolean;
  localsHideSunder?: boolean;
  suppress?: Iterable<string | object>;
  maxFrames?: number;
}

const DEFAULT_LOCALS_MAX_LENGTH = 10;
const DEFAULT_LOCALS_MAX_STRING = 80;

/**
 * Parse a JavaScript stack trace string into Frame objects.
 */
function parseStackTrace(stack: string): Frame[] {
  const frames: Frame[] = [];
  const lines = stack.split('\n');

  for (const line of lines) {
    // Match patterns like:
    //   at functionName (file:///path/to/file.js:10:5)
    //   at /path/to/file.js:10:5
    //   at Object.<anonymous> (/path/to/file.js:10:5)
    const match = line.match(/^\s*at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)|^\s*at\s+(.+?):(\d+):(\d+)|^\s*at\s+(.+?)\s+\((.+?)\)/);
    if (match) {
      let filename: string;
      let lineno: number;
      let colno: number | undefined;
      let name: string;

      if (match[1] && match[2]) {
        // Pattern: at functionName (file:///path/to/file.js:10:5)
        name = match[1].trim();
        filename = match[2];
        lineno = parseInt(match[3] ?? '0', 10);
        colno = parseInt(match[4] ?? '0', 10);
      } else if (match[5] && match[6]) {
        // Pattern: at /path/to/file.js:10:5
        name = '<anonymous>';
        filename = match[5];
        lineno = parseInt(match[6] ?? '0', 10);
        colno = parseInt(match[7] ?? '0', 10);
      } else if (match[8] && match[9]) {
        // Pattern: at functionName (file:///path/to/file.js)
        name = match[8].trim();
        filename = match[9];
        lineno = 0;
        colno = undefined;
      } else {
        continue;
      }

      // Try to read the line from the file
      let lineContent: string | undefined;
      try {
        if (fs.existsSync(filename) && lineno > 0) {
          const fileContent = fs.readFileSync(filename, 'utf-8');
          const fileLines = fileContent.split('\n');
          if (lineno <= fileLines.length) {
            lineContent = fileLines[lineno - 1];
          }
        }
      } catch {
        // Ignore errors reading file
      }

      frames.push({
        filename,
        lineno,
        colno,
        name,
        line: lineContent,
      });
    }
  }

  return frames;
}

/**
 * Extract traceback information from a JavaScript Error.
 */
export function extract(
  error: Error,
  _options: {
    showLocals?: boolean;
    localsMaxLength?: number | null;
    localsMaxString?: number | null;
    localsHideDunder?: boolean;
    localsHideSunder?: boolean;
  } = {}
): Trace {
  const stack = error.stack ?? '';
  const frames = parseStackTrace(stack);

  const stackObj: Stack = {
    excType: error.constructor.name || 'Error',
    excValue: error.message || String(error),
    frames,
    notes: (error as { notes?: string[] }).notes,
  };

  return {
    stacks: [stackObj],
  };
}

/**
 * A Console renderable that renders a traceback.
 */
export class Traceback {
  private readonly trace: Trace;
  private readonly width: number | null;
  private readonly codeWidth: number | null;
  private readonly extraLines: number;
  private readonly theme: string;
  private readonly wordWrap: boolean;
  private readonly showLocals: boolean;
  private readonly indentGuides: boolean;
  private readonly localsMaxLength: number | null;
  private readonly localsMaxString: number | null;
  private readonly localsHideDunder: boolean;
  private readonly localsHideSunder: boolean;
  private readonly suppress: string[];
  private readonly maxFrames: number;

  constructor(trace: Trace, options: TracebackOptions = {}) {
    this.trace = trace;
    this.width = options.width ?? null;
    this.codeWidth = options.codeWidth ?? null;
    this.extraLines = options.extraLines ?? 3;
    this.theme = options.theme ?? 'monokai';
    this.wordWrap = options.wordWrap ?? false;
    this.showLocals = options.showLocals ?? false;
    this.indentGuides = options.indentGuides ?? true;
    this.localsMaxLength = options.localsMaxLength ?? DEFAULT_LOCALS_MAX_LENGTH;
    this.localsMaxString = options.localsMaxString ?? DEFAULT_LOCALS_MAX_STRING;
    this.localsHideDunder = options.localsHideDunder ?? true;
    this.localsHideSunder = options.localsHideSunder ?? false;
    this.maxFrames = options.maxFrames ?? 100;

    // Process suppress list
    this.suppress = [];
    for (const suppressEntity of options.suppress ?? []) {
      if (typeof suppressEntity === 'string') {
        this.suppress.push(path.resolve(suppressEntity));
      } else if (suppressEntity && typeof suppressEntity === 'object' && 'filename' in suppressEntity) {
        const filename = (suppressEntity as { filename?: string }).filename;
        if (filename) {
          this.suppress.push(path.dirname(path.resolve(filename)));
        }
      }
    }
  }

  /**
   * Create a Traceback from an Error.
   */
  static fromException(
    error: Error,
    options: TracebackOptions = {}
  ): Traceback {
    const trace = extract(error, {
      showLocals: options.showLocals,
      localsMaxLength: options.localsMaxLength,
      localsMaxString: options.localsMaxString,
      localsHideDunder: options.localsHideDunder,
      localsHideSunder: options.localsHideSunder,
    });

    return new Traceback(trace, options);
  }

  /**
   * Check if a frame should be suppressed.
   */
  private shouldSuppress(frame: Frame): boolean {
    const framePath = path.resolve(frame.filename);
    for (const suppressPath of this.suppress) {
      if (framePath.startsWith(suppressPath)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Read lines from a file.
   */
  private readLines(filename: string): string[] {
    try {
      if (fs.existsSync(filename)) {
        const content = fs.readFileSync(filename, 'utf-8');
        return content.split('\n');
      }
    } catch {
      // Ignore errors
    }
    return [];
  }

  /**
   * Render the traceback.
   */
  *__richConsole__(console: Console, options: import('./console.js').ConsoleOptions): Generator<import('./segment.js').Segment | Text, void, unknown> {
    const pathHighlighter = new PathHighlighter();

    for (const stack of this.trace.stacks) {
      // Render exception header
      const excTypeText = Text.fromMarkup(`[bold red]${stack.excType}[/]`);
      const excValueText = new Text(`: ${stack.excValue}`);
      yield* console.render(excTypeText.add(excValueText), options);
      yield* console.render(new Text(''), options);

      // Render frames
      let frameCount = 0;
      const framesToShow = this.maxFrames > 0 ? Math.min(stack.frames.length, this.maxFrames) : stack.frames.length;

      for (const frame of stack.frames) {
        if (this.shouldSuppress(frame)) {
          continue;
        }

        if (frameCount >= framesToShow) {
          break;
        }
        frameCount++;

        // Render frame header
        const frameName = frame.name || '<anonymous>';
        const framePath = pathHighlighter.call(frame.filename);
        const frameHeader = Text.fromMarkup(`[dim]  [/][cyan]${frameName}[/] [dim]at[/] `).add(framePath);
        if (frame.lineno > 0) {
          frameHeader.add(Text.fromMarkup(`[dim]:[/][yellow]${frame.lineno}[/]`));
          if (frame.colno) {
            frameHeader.add(Text.fromMarkup(`[dim]:[/][yellow]${frame.colno}[/]`));
          }
        }
        yield* console.render(frameHeader, options);

        // Render code context
        if (frame.lineno > 0 && frame.line) {
          const lines = this.readLines(frame.filename);
          const startLine = Math.max(1, frame.lineno - this.extraLines);
          const endLine = Math.min(lines.length, frame.lineno + this.extraLines);
          const codeLines = lines.slice(startLine - 1, endLine);

          if (codeLines.length > 0) {
            const code = codeLines.join('\n');
            const syntax = new Syntax(code, this.getLanguage(frame.filename), {
              theme: this.theme,
              lineNumbers: true,
              startLine,
              indentGuides: this.indentGuides,
              wordWrap: this.wordWrap,
            });

            // Highlight the error line
            // Note: Syntax highlighting of error range would require more complex logic
            // TODO: Implement error line highlighting when Syntax supports it
            void frame;

            const renderables: RenderableType[] = [syntax];

            // Add locals if enabled
            if (this.showLocals && frame.locals) {
              const scope = renderScope(frame.locals, {
                indentGuides: this.indentGuides,
                maxLength: this.localsMaxLength ?? undefined,
                maxString: this.localsMaxString ?? undefined,
              });
              renderables.push(scope as RenderableType);
            }

            if (renderables.length > 1) {
              yield* console.render(new Columns(renderables, [0, 1]), options);
            } else {
              yield* console.render(syntax, options);
            }
          }
        }

        yield* console.render(new Text(''), options);
      }

      if (stack.frames.length > framesToShow) {
        const remaining = stack.frames.length - framesToShow;
        yield* console.render(Text.fromMarkup(`[dim]  ... ${remaining} more frames[/]`), options);
      }
    }
  }

  /**
   * Get language from filename extension.
   */
  private getLanguage(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const langMap: Record<string, string> = {
      '.js': 'javascript',
      '.ts': 'typescript',
      '.jsx': 'javascript',
      '.tsx': 'typescript',
      '.json': 'json',
      '.py': 'python',
      '.md': 'markdown',
    };
    return langMap[ext] ?? 'text';
  }
}

/**
 * Install a rich traceback handler for uncaught exceptions.
 */
export function install(options: TracebackOptions = {}): void {
  const originalHandlers = process.listeners('uncaughtException');

  process.removeAllListeners('uncaughtException');

  process.once('uncaughtException', (error: Error, origin: NodeJS.UncaughtExceptionOrigin = 'uncaughtException') => {
    const console = new Console({ stderr: true });
    const traceback = Traceback.fromException(error, options);
    console.print(traceback);
    // Call original handlers if any
    for (const handler of originalHandlers) {
      handler(error, origin);
    }
    if (originalHandlers.length === 0) {
      process.exit(1);
    }
  });
}

