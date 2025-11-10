import {
  Console,
  type ConsoleRenderable,
  type RenderHook,
  type RenderableType,
} from './console.js';
import { Control } from './control.js';
import { FileProxy } from './file_proxy.js';
import { LiveRender, type VerticalOverflow } from './live_render.js';
import { Renderables } from './containers.js';
import { Screen } from './screen.js';

export interface LiveOptions {
  console?: Console;
  screen?: boolean;
  autoRefresh?: boolean;
  refreshPerSecond?: number;
  transient?: boolean;
  redirectStdout?: boolean;
  redirectStderr?: boolean;
  verticalOverflow?: VerticalOverflow;
  getRenderable?: () => RenderableType;
}

type WriteFunction = typeof process.stdout.write;

const DEFAULT_REFRESH_PER_SECOND = 4;

export class Live implements RenderHook {
  private readonly _console: Console;
  private readonly useScreen: boolean;
  private readonly autoRefresh: boolean;
  private readonly redirectStdout: boolean;
  private readonly redirectStderr: boolean;
  private readonly getRenderableFactory?: () => RenderableType;
  private refreshTimer?: NodeJS.Timeout;
  private stdoutWrite?: WriteFunction;
  private stderrWrite?: WriteFunction;
  private stdoutProxy?: FileProxy;
  private stderrProxy?: FileProxy;
  private altScreenActive = false;
  private nested = false;
  private hookInstalled = false;
  private currentOverflow: VerticalOverflow;
  private _renderable?: RenderableType;
  private _started = false;
  private readonly liveRender: LiveRender;
  private readonly refreshPerSecond: number;
  transient: boolean;

  constructor(renderable?: RenderableType, options: LiveOptions = {}) {
    this._console = options.console ?? new Console({ force_terminal: true });
    this.useScreen = options.screen ?? false;
    this.autoRefresh = options.autoRefresh ?? true;
    this.refreshPerSecond = options.refreshPerSecond ?? DEFAULT_REFRESH_PER_SECOND;
    if (this.refreshPerSecond <= 0) {
      throw new Error('refreshPerSecond must be greater than 0');
    }
    this.transient = this.useScreen ? true : (options.transient ?? false);
    this.redirectStdout = options.redirectStdout ?? true;
    this.redirectStderr = options.redirectStderr ?? true;
    this.getRenderableFactory = options.getRenderable;
    this.currentOverflow = options.verticalOverflow ?? 'ellipsis';
    this._renderable = renderable;
    this.liveRender = new LiveRender(this.getRenderable(), '', this.currentOverflow);
  }

  get console(): Console {
    return this._console;
  }

  get isStarted(): boolean {
    return this._started;
  }

  get renderable(): RenderableType {
    const stack = this._console.getLiveStack();
    let renderable: RenderableType;
    if (stack.length > 0 && stack[0] === this) {
      const renderables = stack.map((live) => live.getRenderable());
      renderable = new Renderables(renderables);
    } else {
      renderable = this.getRenderable();
    }
    return this.altScreenActive ? new Screen(renderable) : renderable;
  }

  start(refresh: boolean = false): void {
    if (this._started) {
      return;
    }
    this._started = true;

    const isTop = this._console.setLive(this);
    if (!isTop) {
      this.nested = true;
      return;
    }
    this.nested = false;
    if (this.useScreen) {
      this.altScreenActive = this._console.setAltScreen(true);
    }
    this._console.showCursor(false);
    this.enableRedirectIO();
    this._console.pushRenderHook(this);
    this.hookInstalled = true;

    if (refresh) {
      try {
        this.refresh();
      } catch (error) {
        this.stop();
        throw error;
      }
    }

    if (this.autoRefresh) {
      this.refreshTimer = setInterval(() => this.refresh(), 1000 / this.refreshPerSecond);
    }
  }

  stop(): void {
    if (!this._started) {
      return;
    }
    this._started = false;
    this._console.clearLive();

    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = undefined;
    }

    if (this.nested) {
      if (!this.transient) {
        this._console.print(this.renderable);
      }
      return;
    }

    this.currentOverflow = 'visible';
    try {
      if (!this.altScreenActive && !this._console.is_jupyter) {
        this.refresh();
      }
    } finally {
      this.disableRedirectIO();
      if (this.hookInstalled) {
        this._console.popRenderHook();
        this.hookInstalled = false;
      }
      if (!this.altScreenActive && this._console.is_terminal) {
        this._console.line();
      }
      this._console.showCursor(true);
      if (this.altScreenActive) {
        this._console.setAltScreen(false);
        this.altScreenActive = false;
      }
      if (this.transient && !this.altScreenActive) {
        this._console.control(this.liveRender.restoreCursor());
      }
    }
  }

  update(renderable: RenderableType | string, options: { refresh?: boolean } = {}): void {
    this._renderable = this.normalizeRenderable(renderable);
    if (options.refresh) {
      this.refresh();
    }
  }

  refresh(): void {
    this.liveRender.setRenderable(this.renderable);

    if (this.nested) {
      const stack = this._console.getLiveStack();
      const top = stack[0];
      if (top && top !== this) {
        top.refresh();
      }
      return;
    }

    if (this._console.is_jupyter) {
      this._console.print(this.liveRender);
      return;
    }

    if (this._console.is_terminal && !this._console.is_dumb_terminal) {
      this._console.print(new Control());
    } else if (!this._started && !this.transient) {
      this._console.print(this.liveRender);
    }
  }

  processRenderables(renderables: ConsoleRenderable[]): ConsoleRenderable[] {
    this.liveRender.verticalOverflow = this.currentOverflow;
    if (this._console.is_interactive) {
      const reset = this.altScreenActive ? Control.home() : this.liveRender.positionCursor();
      return [reset, ...renderables, this.liveRender];
    }
    if (!this._started && !this.transient) {
      return [...renderables, this.liveRender];
    }
    return renderables;
  }

  private getRenderable(): RenderableType {
    if (this.getRenderableFactory) {
      return this.getRenderableFactory();
    }
    return this._renderable ?? '';
  }

  private normalizeRenderable(renderable: RenderableType | string): RenderableType {
    if (typeof renderable === 'string') {
      return this._console.renderStr(renderable);
    }
    return renderable;
  }

  private enableRedirectIO(): void {
    if (!this._console.is_terminal && !this._console.is_jupyter) {
      return;
    }
    if (this.redirectStdout && !this.stdoutWrite) {
      this.stdoutProxy = new FileProxy(this._console, process.stdout);
      this.stdoutWrite = process.stdout.write.bind(process.stdout);
      process.stdout.write = ((
        chunk: string | Uint8Array,
        encoding?: BufferEncoding,
        callback?: (err?: Error | null) => void
      ) => {
        const text =
          typeof chunk === 'string'
            ? chunk
            : Buffer.from(chunk).toString(typeof encoding === 'string' ? encoding : 'utf8');
        this.stdoutProxy?.write(text);
        if (callback) {
          callback(null);
        }
        return true;
      }) as WriteFunction;
    }
    if (this.redirectStderr && !this.stderrWrite) {
      this.stderrProxy = new FileProxy(this._console, process.stderr);
      this.stderrWrite = process.stderr.write.bind(process.stderr);
      process.stderr.write = ((
        chunk: string | Uint8Array,
        encoding?: BufferEncoding,
        callback?: (err?: Error | null) => void
      ) => {
        const text =
          typeof chunk === 'string'
            ? chunk
            : Buffer.from(chunk).toString(typeof encoding === 'string' ? encoding : 'utf8');
        this.stderrProxy?.write(text);
        if (callback) {
          callback(null);
        }
        return true;
      }) as WriteFunction;
    }
  }

  private disableRedirectIO(): void {
    if (this.stdoutWrite) {
      process.stdout.write = this.stdoutWrite;
      this.stdoutWrite = undefined;
      this.stdoutProxy = undefined;
    }
    if (this.stderrWrite) {
      process.stderr.write = this.stderrWrite;
      this.stderrWrite = undefined;
      this.stderrProxy = undefined;
    }
  }
}
