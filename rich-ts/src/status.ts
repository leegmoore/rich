import type { Console, ConsoleOptions, RenderResult, RenderableType } from './console.js';
import { Live } from './live.js';
import { Spinner } from './spinner.js';
import type { StyleType } from './style.js';

interface StatusOptions {
  console?: Console;
  spinner?: string;
  spinnerStyle?: StyleType;
  speed?: number;
  refreshPerSecond?: number;
}

interface StatusUpdateOptions {
  status?: RenderableType;
  spinner?: string;
  spinnerStyle?: StyleType;
  speed?: number;
}

export class Status {
  private currentStatus: RenderableType;
  private spinnerStyle: StyleType;
  private speed: number;
  private spinner: Spinner;
  private readonly live: Live;

  constructor(status: RenderableType, options: StatusOptions = {}) {
    this.currentStatus = status;
    this.spinnerStyle = options.spinnerStyle ?? 'status.spinner';
    this.speed = options.speed ?? 1.0;
    const spinnerName = options.spinner ?? 'dots';
    this.spinner = new Spinner(spinnerName, status, {
      style: this.spinnerStyle,
      speed: this.speed,
    });
    this.live = new Live(this.renderable, {
      console: options.console,
      refreshPerSecond: options.refreshPerSecond ?? 12.5,
      transient: true,
    });
  }

  get renderable(): Spinner {
    return this.spinner;
  }

  get console(): Console {
    return this.live.console;
  }

  start(): void {
    this.live.start();
  }

  stop(): void {
    this.live.stop();
  }

  update(options: StatusUpdateOptions = {}): void {
    if (options.status !== undefined) {
      this.currentStatus = options.status;
    }
    if (options.spinnerStyle !== undefined) {
      this.spinnerStyle = options.spinnerStyle;
    }
    if (options.speed !== undefined) {
      this.speed = options.speed;
    }
    if (options.spinner !== undefined) {
      this.spinner = new Spinner(options.spinner, this.currentStatus, {
        style: this.spinnerStyle,
        speed: this.speed,
      });
      this.live.update(this.renderable, { refresh: true });
    } else {
      this.spinner.update({
        text: this.currentStatus,
        style: this.spinnerStyle,
        speed: this.speed,
      });
    }
  }

  *__richConsole__(console: Console, options: ConsoleOptions): RenderResult {
    yield* this.renderable.__richConsole__(console, options);
  }
}
