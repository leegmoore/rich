/**
 * Clock provider returning current time in milliseconds.
 */
export type Clock = () => number;

/**
 * Options for configuring a {@link Timer} instance.
 */
export interface TimerOptions {
  /** Custom clock source, defaults to `performance.now()` or `Date.now()`. */
  clock?: Clock;
  /** When true the timer starts immediately. */
  autoStart?: boolean;
}

/**
 * Options for timer helpers that report elapsed time.
 */
export interface TimerReporterOptions extends TimerOptions {
  /** Callback invoked with the formatted elapsed time. Defaults to `console.log`. */
  reporter?: (message: string) => void;
  /** Custom formatter for the elapsed message. */
  formatter?: (subject: string, elapsedMs: number) => string;
}

/**
 * Handle returned by {@link timer}. Call {@link TimerHandle.stop | stop} when the work completes.
 */
export interface TimerHandle {
  /** Stop the timer (idempotent) and return the elapsed milliseconds. */
  stop(): number;
  /** Current elapsed milliseconds without stopping the timer. */
  readonly elapsedMilliseconds: number;
  /** Current elapsed seconds without stopping the timer. */
  readonly elapsedSeconds: number;
}

const getDefaultClock = (): number => {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
};

const defaultFormatter = (subject: string, elapsedMs: number): string =>
  `${subject} elapsed ${elapsedMs.toFixed(1)}ms`;

const defaultReporter = (message: string): void => {
  // eslint-disable-next-line no-console
  console.log(message);
};

/**
 * Simple utility for measuring elapsed time.
 */
export class Timer {
  private readonly clock: Clock;
  private startedAt?: number;
  private stoppedAt?: number;

  constructor(options: TimerOptions = {}) {
    this.clock = options.clock ?? getDefaultClock;
    if (options.autoStart) {
      this.start();
    }
  }

  /** Start the timer, resetting any previous measurement. */
  start(): this {
    this.startedAt = this.clock();
    this.stoppedAt = undefined;
    return this;
  }

  /** Stop the timer and return elapsed seconds. */
  stop(): number {
    if (this.startedAt === undefined) {
      throw new Error('Timer has not been started');
    }
    this.stoppedAt = this.clock();
    return this.elapsedSeconds;
  }

  /** Reset the timer to an idle state. */
  reset(): void {
    this.startedAt = undefined;
    this.stoppedAt = undefined;
  }

  /** Indicates whether the timer is currently running. */
  get isRunning(): boolean {
    return this.startedAt !== undefined && this.stoppedAt === undefined;
  }

  /** Elapsed seconds (continues to update while running). */
  get elapsedSeconds(): number {
    if (this.startedAt === undefined) {
      return 0;
    }
    const end = this.stoppedAt ?? this.clock();
    return (end - this.startedAt) / 1000;
  }

  /** Elapsed milliseconds (continues to update while running). */
  get elapsedMilliseconds(): number {
    return this.elapsedSeconds * 1000;
  }
}

/**
 * Create a timer handle that mimics Rich's Python context manager.
 * Call {@link TimerHandle.stop | stop} when the measured work completes.
 *
 * @param subject - Label printed in the elapsed message.
 * @param options - Reporter/clock overrides.
 * @returns Timer handle that logs elapsed time when stopped.
 */
export function timer(subject = 'time', options: TimerReporterOptions = {}): TimerHandle {
  const reporter = options.reporter ?? defaultReporter;
  const formatter = options.formatter ?? defaultFormatter;
  const timerInstance = new Timer({ clock: options.clock, autoStart: true });
  let reported = false;

  const announce = (): void => {
    if (reported) {
      return;
    }
    reported = true;
    timerInstance.stop();
    reporter(formatter(subject, timerInstance.elapsedMilliseconds));
  };

  return {
    stop(): number {
      announce();
      return timerInstance.elapsedMilliseconds;
    },
    get elapsedMilliseconds(): number {
      return timerInstance.elapsedMilliseconds;
    },
    get elapsedSeconds(): number {
      return timerInstance.elapsedSeconds;
    },
  };
}

function isPromiseLike<T>(value: unknown): value is PromiseLike<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'then' in (value as Record<string, unknown>) &&
    typeof (value as PromiseLike<T>).then === 'function'
  );
}

/**
 * Convenience helper for timing either synchronous or asynchronous work.
 *
 * @param subject - Label for the work being measured.
 * @param fn - Function that performs the work.
 * @param options - Reporter/clock overrides.
 * @returns The value returned by {@link fn}.
 */
export function time<T>(subject: string, fn: () => T, options?: TimerReporterOptions): T;
export function time<T>(
  subject: string,
  fn: () => Promise<T>,
  options?: TimerReporterOptions
): Promise<T>;
export function time<T>(
  subject: string,
  fn: () => T | Promise<T>,
  options?: TimerReporterOptions
): T | Promise<T> {
  const handle = timer(subject, options);
  try {
    const result = fn();
    if (isPromiseLike<T>(result)) {
      return Promise.resolve(result).then(
        (value) => {
          handle.stop();
          return value;
        },
        (error) => {
          handle.stop();
          throw error;
        }
      );
    }
    handle.stop();
    return result;
  } catch (error) {
    handle.stop();
    throw error;
  }
}
