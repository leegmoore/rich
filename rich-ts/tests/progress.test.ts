/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, no-control-regex */
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it, vi } from 'vitest';
import { Console, type RenderableType } from '../src/console.js';
import { Text } from '../src/text.js';
import { NullHighlighter } from '../src/highlighter.js';
import {
  Progress,
  BarColumn,
  TextColumn,
  TimeElapsedColumn,
  TimeRemainingColumn,
  RenderableColumn,
  SpinnerColumn,
  TaskProgressColumn,
  DownloadColumn,
  FileSizeColumn,
  TotalFileSizeColumn,
  TransferSpeedColumn,
  MofNCompleteColumn,
  Task,
  TaskID,
  TrackThread,
  track,
  wrapFile as wrapFileHelper,
  openFile,
} from '../src/progress.js';
import { ProgressBar } from '../src/progress_bar.js';

class MockClock {
  time: number;
  auto: boolean;

  constructor(time = 0, auto = true) {
    this.time = time;
    this.auto = auto;
  }

  call(): number {
    const current = this.time;
    if (this.auto) {
      this.time += 1;
    }
    return current;
  }

  tick(amount = 1): void {
    this.time += amount;
  }
}

class MockBinaryFile {
  closed = false;
  readonly mode = 'rb';
  private offset = 0;
  constructor(
    private readonly data: Buffer,
    public readonly name: string
  ) {}

  read(size?: number): Buffer | null {
    if (this.offset >= this.data.length) {
      return null;
    }
    const end =
      size !== undefined ? Math.min(this.offset + size, this.data.length) : this.data.length;
    const chunk = this.data.subarray(this.offset, end);
    this.offset = end;
    return Buffer.from(chunk);
  }

  close(): void {
    this.closed = true;
  }
}

const createConsole = (overrides: Record<string, unknown> = {}): Console =>
  new Console({
    width: 80,
    force_terminal: true,
    legacy_windows: false,
    colorSystem: 'truecolor',
    ...overrides,
  });

const getPlain = (value: unknown): string => {
  if (value instanceof Text) {
    return value.plain;
  }
  if (typeof value === 'string') {
    return value;
  }
  const console = createConsole();
  const segments = console.render(value as RenderableType, console.options);
  const text = segments.map((segment) => segment.text).join('');
  return text.replace(/\n+$/, '');
};

const STRIP_ANSI = /\x1b\[[0-9;]*[A-Za-z]/g;
const stripAnsi = (value: string): string => value.replace(STRIP_ANSI, '');

const makeProgress = () => {
  let currentTime = 0;
  const fakeTime = () => {
    const value = currentTime;
    currentTime += 1;
    return value;
  };
  const console = createConsole();
  const progress = new Progress({ console, autoRefresh: false, getTime: fakeTime });
  const task1 = progress.addTask('foo');
  const task2 = progress.addTask('bar', { total: 30 });
  progress.advance(task2, 16);
  const task3 = progress.addTask('baz', { visible: false });
  const task4 = progress.addTask('egg');
  progress.removeTask(task4);
  const task5 = progress.addTask('foo2', { completed: 50, start: false });
  progress.stopTask(task5);
  progress.startTask(task5);
  progress.update(task5, { total: 200, advance: 50, completed: 200, visible: true, refresh: true });
  progress.stopTask(task5);
  return { progress, console, task1, task2, task3, task5 };
};

const renderProgress = (): string => {
  const { progress, console } = makeProgress();
  console.beginCapture();
  progress.start();
  progress.stop();
  return console.endCapture();
};

const createTempFile = (contents: string, encoding: BufferEncoding = 'utf8') => {
  const dir = mkdtempSync(path.join(tmpdir(), 'progress-'));
  const filePath = path.join(dir, 'file.txt');
  writeFileSync(filePath, contents, { encoding });
  return { dir, filePath };
};

const cleanupTempDir = (dir: string): void => {
  rmSync(dir, { recursive: true, force: true });
};

const TRACK_EXPECTED =
  '\x1b[?25l\ntest \x1b[38;2;249;38;114m━━━━━━━━━━━━━\x1b[0m\x1b[38;5;237m╺\x1b[0m\x1b[38;5;237m━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m \x1b[35m 33%\x1b[0m \x1b[36m-:--:--\x1b[0m\n' +
  '\r\x1b[2K\x1b[1A\x1b[2Ktest \x1b[38;2;249;38;114m━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\x1b[38;2;249;38;114m╸\x1b[0m\x1b[38;5;237m━━━━━━━━━━━━━\x1b[0m \x1b[35m 67%\x1b[0m \x1b[36m0:00:03\x1b[0m\n' +
  '\r\x1b[2K\x1b[1A\x1b[2Ktest \x1b[38;2;114;156;31m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m \x1b[35m100%\x1b[0m \x1b[36m0:00:00\x1b[0m\n' +
  '\r\x1b[2K\x1b[1A\x1b[2Ktest \x1b[38;2;114;156;31m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m \x1b[35m100%\x1b[0m \x1b[36m0:00:00\x1b[0m\n\n' +
  '\x1b[?25h';

const PROGRESS_TRACK_EXPECTED = TRACK_EXPECTED;

const MAX_REFRESH_EXPECTED =
  '\x1b[?25l\ntick 0\n' +
  '\r\x1b[2K\x1b[1A\x1b[2Ktick 1\n' +
  '\r\x1b[2K\x1b[1A\x1b[2Ktick 2\n' +
  '\r\x1b[2K\x1b[1A\x1b[2Ktick 3\n' +
  '\r\x1b[2K\x1b[1A\x1b[2Ktick 4\n' +
  '\r\x1b[2K\x1b[1A\x1b[2Ktick 5\n' +
  '\r\x1b[2K\x1b[1A\x1b[2Ktick 5\n\n' +
  '\x1b[?25h';

describe('Progress columns', () => {
  it('creates bar columns with configured width', () => {
    const column = new BarColumn({ barWidth: 100 });
    expect(column.barWidth).toBe(100);
    const task = new Task(1 as TaskID, 'test', 100, 20, { getTime: () => 1.0 });
    const bar = column.render(task);
    expect(bar).toBeInstanceOf(ProgressBar);
    expect(bar.completed).toBe(20);
    expect(bar.total).toBe(100);
  });

  it('renders text column with markup and without markup', () => {
    const withMarkup = new TextColumn('[b]foo', {
      highlighter: new NullHighlighter(),
    });
    const task = new Task(1 as TaskID, 'test', 100, 20, { getTime: () => 1.0 });
    expect(getPlain(withMarkup.render(task))).toBe('foo');

    const withoutMarkup = new TextColumn('[b]bar', { markup: false });
    expect(getPlain(withoutMarkup.render(task))).toBe('[b]bar');
  });

  it('renders elapsed time column defaults', () => {
    const column = new TimeElapsedColumn();
    const task = new Task(1 as TaskID, 'test', 100, 20, { getTime: () => 1.0 });
    expect(getPlain(column.render(task))).toBe('-:--:--');
  });

  it('renders time remaining column with defaults and finished tasks', () => {
    const column = new TimeRemainingColumn();
    const task = new Task(1 as TaskID, 'test', 100, 20, { getTime: () => 1.0 });
    expect(getPlain(column.render(task))).toBe('-:--:--');

    class FakeTask extends Task {
      override get timeRemaining(): number | null {
        return 60;
      }
    }
    const fakeTask = new FakeTask(2 as TaskID, 'test', 100, 20, { getTime: () => 1.0 });
    expect(getPlain(column.render(fakeTask))).toBe('0:01:00');

    const elapsedColumn = new TimeRemainingColumn({ elapsedWhenFinished: true });
    const customTask = new Task(3 as TaskID, 'done', 100, 100, { getTime: () => 1.0 });
    customTask.finishedTime = 71;
    expect(getPlain(elapsedColumn.render(customTask))).toBe('0:01:11');
  });

  it('renders compact time remaining column variations', () => {
    class CompactTask extends Task {
      constructor(
        id: TaskID,
        private readonly remainingValue: number | null
      ) {
        super(id, 'compact', 100, 0, { getTime: () => 0 });
      }

      override get timeRemaining(): number | null {
        return this.remainingValue;
      }
    }

    const column = new TimeRemainingColumn({ compact: true });
    expect(getPlain(column.render(new CompactTask(1 as TaskID, null)))).toBe('--:--');
    expect(getPlain(column.render(new CompactTask(2 as TaskID, 0)))).toBe('00:00');
    expect(getPlain(column.render(new CompactTask(3 as TaskID, 59)))).toBe('00:59');
    expect(getPlain(column.render(new CompactTask(4 as TaskID, 71)))).toBe('01:11');
    expect(getPlain(column.render(new CompactTask(5 as TaskID, 4210)))).toBe('1:10:10');
  });

  it('renders renderable column content verbatim', () => {
    const column = new RenderableColumn('foo');
    const task = new Task(1 as TaskID, 'test', 100, 20, { getTime: () => 1.0 });
    expect(column.render(task)).toBe('foo');
  });

  it('renders spinner column and allows configuration', () => {
    let time = 1.0;
    const getTime = () => time;
    const column = new SpinnerColumn();
    column.setSpinner('dots2');
    const task = new Task(1 as TaskID, 'test', 100, 20, { getTime });
    expect(getPlain(column.render(task))).toBe('⣾');
    time += 1;
    column.updateSpinner({ speed: 0.5 });
    expect(getPlain(column.render(task))).toBe('⡿');
  });

  it('renders download column with decimal and binary units', () => {
    const decimalColumn = new DownloadColumn();
    const decimalTask = new Task(1 as TaskID, 'test', 1000, 500, { getTime: () => 1.0 });
    expect(getPlain(decimalColumn.render(decimalTask))).toBe('0.5/1.0 kB');

    const binaryColumn = new DownloadColumn({ binaryUnits: true });
    const binaryTask = new Task(2 as TaskID, 'test', 1024, 512, { getTime: () => 1.0 });
    expect(getPlain(binaryColumn.render(binaryTask))).toBe('0.5/1.0 KiB');
  });

  it('renders transfer speed column with live and finished speeds', () => {
    const speedTask = new Task(1 as TaskID, 'download', 1000, 0, { getTime: () => 0 });
    speedTask.addSample({ timestamp: 0, completed: 0 }, 10);
    speedTask.addSample({ timestamp: 2, completed: 512 }, 10);
    const column = new TransferSpeedColumn();
    expect(getPlain(column.render(speedTask))).toBe('256 bytes/s');

    speedTask.finishedSpeed = 10000;
    expect(getPlain(column.render(speedTask))).toBe('10.0 kB/s');

    const idleTask = new Task(2 as TaskID, 'idle', 100, 0, { getTime: () => 0 });
    expect(getPlain(column.render(idleTask))).toBe('?');
  });
});

describe('Progress task management', () => {
  it('resets tasks with new metadata', () => {
    const progress = new Progress();
    const taskId = progress.addTask('foo');
    progress.advance(taskId, 10);
    const task = progress.tasks[0];
    expect(task).toBeDefined();
    if (!task) {
      throw new Error('task not created');
    }
    expect(task.completed).toBe(10);
    progress.reset(taskId, {
      total: 200,
      completed: 20,
      visible: false,
      description: 'bar',
      fields: { example: 'egg' },
    });
    expect(task.total).toBe(200);
    expect(task.completed).toBe(20);
    expect(task.visible).toBe(false);
    expect(task.description).toBe('bar');
    expect(task.fields).toEqual({ example: 'egg' });
    expect(task.speed).toBeNull();
  });

  it('updates progress via track thread helper', async () => {
    const progress = new Progress({ autoRefresh: false });
    const taskId = progress.addTask('foo');
    const trackThread = new TrackThread(progress, taskId, 0.05);
    trackThread.completed = 0;
    await trackThread.run(async () => {
      trackThread.completed = 1;
      await new Promise((resolve) => setTimeout(resolve, 150));
      const firstTask = progress.tasks[0];
      expect(firstTask).toBeDefined();
      if (!firstTask) {
        throw new Error('task missing');
      }
      expect(firstTask.completed).toBeGreaterThanOrEqual(1);
      trackThread.completed += 1;
    });
    const finalTask = progress.tasks[0];
    expect(finalTask).toBeDefined();
    if (!finalTask) {
      throw new Error('task missing');
    }
    expect(finalTask.completed).toBeGreaterThanOrEqual(2);
  });
});

describe('Tracking iterables', () => {
  it('tracks sequences via helper function', () => {
    const console = createConsole();
    console.beginCapture();
    const seq = ['foo', 'bar', 'baz'];
    const expected = [...seq];
    const clock = new MockClock(0, true);
    for (const value of track(seq, 'test', {
      console,
      autoRefresh: false,
      getTime: () => clock.call(),
    })) {
      expect(value).toBe(expected.shift());
    }
    const result = console.endCapture();
    expect(result).toBe(TRACK_EXPECTED);
  });

  it('tracks sequences via progress instance', () => {
    const console = createConsole();
    console.beginCapture();
    const seq = ['foo', 'bar', 'baz'];
    const expected = [...seq];
    const clock = new MockClock(0, true);
    const progress = new Progress({ console, autoRefresh: false, getTime: () => clock.call() });
    progress.start();
    try {
      for (const value of progress.track(seq, { description: 'test' })) {
        expect(value).toBe(expected.shift());
      }
    } finally {
      progress.stop();
    }
    const result = console.endCapture();
    expect(result).toBe(PROGRESS_TRACK_EXPECTED);
  });
});

describe('Progress live integration', () => {
  it('applies max_refresh limits to text columns', () => {
    let currentTime = 0;
    const getTime = () => currentTime++;
    const console = new Console({
      colorSystem: null,
      width: 80,
      legacy_windows: false,
      force_terminal: true,
    });
    const column = new TextColumn('{task.description}');
    column.maxRefresh = 3;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const progress = new Progress(column, {
      console,
      autoRefresh: false,
      getTime,
    });
    console.beginCapture();
    progress.start();
    try {
      const taskId = progress.addTask('start');
      for (let tick = 0; tick < 6; tick += 1) {
        progress.update(taskId, { description: `tick ${tick}` });
        progress.refresh();
      }
    } finally {
      progress.stop();
    }
    const result = console.endCapture();
    expect(result).toBe(MAX_REFRESH_EXPECTED);
  });

  it('starts live rendering when enabled', () => {
    const progress = new Progress({ autoRefresh: false, disable: false });
    const live = progress.live as unknown as { start: () => void; stop: () => void };
    let started = false;
    const originalStart = live.start;
    const originalStop = live.stop;
    live.start = () => {
      started = true;
    };
    live.stop = () => {
      started = false;
    };
    progress.start();
    expect(started).toBe(true);
    progress.stop();
    expect(started).toBe(false);
    live.start = originalStart;
    live.stop = originalStop;
  });

  it('does not start live rendering when disabled', () => {
    const progress = new Progress({ autoRefresh: false, disable: true });
    const live = progress.live as unknown as { start: () => void };
    let started = false;
    const originalStart = live.start;
    live.start = () => {
      started = true;
    };
    progress.start();
    expect(started).toBe(false);
    progress.stop();
    live.start = originalStart;
  });

  it('emits no output when disabled', () => {
    const console = createConsole();
    console.beginCapture();
    const progress = new Progress({ console, disable: true, autoRefresh: false });
    progress.start();
    try {
      const seq = ['foo', 'bar', 'baz'];
      for (const value of progress.track(seq, { description: 'test' })) {
        expect(seq.includes(value)).toBe(true);
      }
    } finally {
      progress.stop();
    }
    const result = console.endCapture();
    expect(result).toBe('');
  });
});

describe('Progress console proxies', () => {
  it('routes print and log through the console', () => {
    const console = createConsole({ log_time_format: '[TIME]' });
    const progress = new Progress({ console, autoRefresh: false });
    const printSpy = vi.spyOn(console, 'print');
    const logSpy = vi.spyOn(console, 'log');
    console.beginCapture();
    progress.print('hello');
    progress.log('world');
    console.endCapture();
    expect(printSpy).toHaveBeenCalledWith('hello');
    expect(logSpy).toHaveBeenCalledWith('world');
    printSpy.mockRestore();
    logSpy.mockRestore();
  });
});

describe('Task basics', () => {
  it('creates tasks with default state', () => {
    const task = new Task(1 as TaskID, 'foo', 100, 0, { getTime: () => 1 });
    expect(task.elapsed).toBeNull();
    expect(task.finished).toBe(false);
    expect(task.percentage).toBe(0);
    expect(task.speed).toBeNull();
    expect(task.timeRemaining).toBeNull();
  });

  it('tracks elapsed time and stop state', () => {
    let currentTime = 1;
    const getTime = () => currentTime;
    const task = new Task(1 as TaskID, 'foo', 100, 0, { getTime });
    task.startTime = getTime();
    expect(task.started).toBe(true);
    expect(task.elapsed).toBe(0);
    currentTime += 1;
    expect(task.elapsed).toBe(1);
    currentTime += 1;
    task.stopTime = getTime();
    currentTime += 1;
    expect(task.elapsed).toBe(2);
  });

  it('clamps percentage when total is zero', () => {
    const task = new Task(1 as TaskID, 'foo', 0, 0, { getTime: () => 1 });
    expect(task.percentage).toBe(0);
  });
});

describe('TaskProgressColumn', () => {
  it('formats render speed labels', () => {
    expect(TaskProgressColumn.renderSpeed(null).plain).toBe('');
    expect(TaskProgressColumn.renderSpeed(5).plain).toBe('5.0 it/s');
    expect(TaskProgressColumn.renderSpeed(5000).plain).toBe('5.0×10³ it/s');
    expect(TaskProgressColumn.renderSpeed(8888888).plain).toBe('8.9×10⁶ it/s');
  });
});

describe('Task metrics and fields', () => {
  it('tracks speed and ETA from progress samples', () => {
    const task = new Task(1 as TaskID, 'metrics', 100, 60, {
      getTime: () => 0,
    });
    task.startTime = 0;
    task.addSample({ timestamp: 0, completed: 0 }, 1000);
    task.addSample({ timestamp: 5, completed: 30 }, 1000);
    task.addSample({ timestamp: 10, completed: 20 }, 1000);
    expect(task.speed).toBeCloseTo(5);
    expect(task.timeRemaining).toBe(8);
    task.addSample({ timestamp: 12, completed: 40 }, 1000);
    expect(task.speed).toBeCloseTo(7.5);
    expect(task.timeRemaining).toBe(6);
  });

  it('merges custom task fields via updates', () => {
    const progress = new Progress({ autoRefresh: false });
    const taskId = progress.addTask('with fields', {
      fields: { alpha: 1 },
    });
    progress.update(taskId, { fields: { beta: 2 } });
    const task = progress.tasks.find((entry) => entry.id === taskId);
    expect(task?.fields).toEqual({ alpha: 1, beta: 2 });
  });

  it('reports finished once all tasks complete', () => {
    const progress = new Progress({ autoRefresh: false });
    const first = progress.addTask('first', { total: 10 });
    const second = progress.addTask('second', { total: 5 });
    progress.advance(first, 10);
    expect(progress.finished).toBe(false);
    progress.advance(second, 5);
    expect(progress.finished).toBe(true);
  });
});

describe('Progress basics', () => {
  it('reports finished when no tasks exist', () => {
    const progress = new Progress();
    expect(progress.finished).toBe(true);
    expect(progress.tasks).toEqual([]);
    expect(progress.taskIds).toEqual([]);
  });

  it('collects task ids and finished flag from helper', () => {
    const { progress } = makeProgress();
    const ids = progress.taskIds;
    expect(ids.length).toBeGreaterThan(0);
    expect(progress.finished).toBe(false);
  });

  it('uses expected default columns', () => {
    const progress = new Progress();
    const types = progress.columns.map((column) => column.constructor);
    expect(types).toEqual([TextColumn, BarColumn, TaskProgressColumn, TimeRemainingColumn]);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const custom = new Progress(
      new SpinnerColumn(),
      ...Progress.getDefaultColumns(),
      'Elapsed:',
      new TimeElapsedColumn()
    );
    const customTypes = custom.columns.map((column) => column.constructor);
    expect(customTypes).toEqual([
      SpinnerColumn,
      TextColumn,
      BarColumn,
      TaskProgressColumn,
      TimeRemainingColumn,
      String,
      TimeElapsedColumn,
    ]);
  });

  it('records exact task ids from helper setup', () => {
    const { progress } = makeProgress();
    expect(progress.taskIds).toEqual([0, 1, 2, 4]);
  });

  it('detects unfinished progress state from helper', () => {
    const { progress } = makeProgress();
    expect(progress.finished).toBe(false);
  });
});

describe('Progress rendering', () => {
  it('expands bar columns across available width when unspecified', () => {
    const console = createConsole({ width: 10 });
    console.beginCapture();
    const progress = new Progress(new BarColumn({ barWidth: null }), {
      console,
      autoRefresh: false,
      getTime: () => 1,
    });
    progress.addTask('foo');
    progress.start();
    progress.stop();
    const output = console.endCapture();
    expect(output).toContain('━━━━━━━━━━');
  });

  it('renders pulsing bar when task total is unknown', () => {
    const console = createConsole({ width: 10 });
    console.beginCapture();
    const progress = new Progress(new BarColumn({ barWidth: null }), {
      console,
      autoRefresh: false,
      getTime: () => 1,
    });
    progress.addTask('foo', { total: null });
    progress.start();
    progress.stop();
    const output = console.endCapture();
    expect(output).toMatch(/\x1b\[38;[0-9;]+m/);
    expect((output.match(/━/g) ?? []).length).toBeGreaterThan(5);
  });

  it('renders multi-row progress tables', () => {
    const output = renderProgress();
    expect(output).toContain('foo');
    expect(output).toContain('bar');
    expect(output).toContain('foo2');
  });

  it('renders configured column sets with additional metrics', () => {
    const console = createConsole({
      width: 80,
      log_time_format: '[TIME]',
      log_path: false,
    });
    console.beginCapture();
    const clock = new MockClock(0, false);
    const progress = new Progress(
      'test',
      new TextColumn('{task.description}'),
      new BarColumn({ barWidth: 10 }),
      new TimeRemainingColumn(),
      new TimeElapsedColumn(),
      new FileSizeColumn(),
      new TotalFileSizeColumn(),
      new DownloadColumn(),
      new TransferSpeedColumn(),
      new MofNCompleteColumn(),
      new MofNCompleteColumn({ separator: ' of ' }),
      {
        console,
        autoRefresh: false,
        getTime: () => clock.call(),
        transient: true,
      }
    );
    const task1 = progress.addTask('foo', { total: 10 });
    const task2 = progress.addTask('bar', { total: 7 });
    for (let n = 0; n < 4; n += 1) {
      progress.advance(task1, 3);
      progress.advance(task2, 4);
    }
    console.print('foo');
    console.print('hello');
    console.print('world');
    progress.start();
    progress.refresh();
    progress.stop();
    const output = console.endCapture();
    const plainOutput = stripAnsi(output);
    expect(plainOutput).toContain('test foo');
    expect(plainOutput).toContain('12/10');
    expect(plainOutput).toContain('12 of 10');
    expect(plainOutput).toContain('bytes');
    expect(plainOutput).toContain('hello');
    expect(plainOutput).toContain('world');
  });
});

describe('Progress file helpers', () => {
  it('wraps an existing handle without closing the original file', () => {
    const buffer = Buffer.from('Hello, World!', 'utf8');
    const file = new MockBinaryFile(buffer, 'mock.bin');
    const progress = new Progress({ autoRefresh: false });
    const reader = progress.wrapFile(file, {
      total: buffer.length,
      description: 'Reading',
      closeHandle: false,
    });
    expect(reader.mode).toBe('rb');
    expect(reader.name).toBe('mock.bin');
    const chunk = reader.read();
    expect(chunk).toBeInstanceOf(Buffer);
    expect(Buffer.from(chunk as Buffer).toString('utf8')).toBe('Hello, World!');
    reader.close();
    expect(file.closed).toBe(false);
    file.close();
  });

  it('wrapFile helper reads binary buffers', () => {
    const buffer = Buffer.from('Hello, World!', 'utf8');
    const reader = wrapFileHelper(buffer, { autoRefresh: false, description: 'Reading buffer' });
    const chunk = reader.read();
    expect(chunk).toBeInstanceOf(Buffer);
    expect(Buffer.from(chunk as Buffer).toString('utf8')).toBe('Hello, World!');
    expect(reader.mode).toBe('rb');
    reader.close();
  });

  it('openFile reads disk files in binary mode', () => {
    const { dir, filePath } = createTempFile('Hello, World!');
    const reader = openFile(filePath, { autoRefresh: false });
    try {
      const chunk = reader.read();
      expect(chunk).toBeInstanceOf(Buffer);
      expect(Buffer.from(chunk as Buffer).toString('utf8')).toBe('Hello, World!');
      expect(reader.mode).toBe('rb');
      expect(reader.name).toBe(filePath);
    } finally {
      reader.close();
      cleanupTempDir(dir);
    }
  });

  it('openFile supports text mode with encoding', () => {
    const { dir, filePath } = createTempFile('Hello, World!');
    const reader = openFile(filePath, { autoRefresh: false, encoding: 'utf8' });
    try {
      const chunk = reader.read();
      expect(chunk).toBe('Hello, World!');
      expect(reader.mode).toBe('rt');
    } finally {
      reader.close();
      cleanupTempDir(dir);
    }
  });

  it('reuses existing tasks when wrapping files with known totals', () => {
    const buffer = Buffer.from('Hello again!', 'utf8');
    const progress = new Progress({ autoRefresh: false });
    const taskId = progress.addTask('Reading', { total: 0 });
    const reader = progress.wrapFile(buffer, { taskId });
    try {
      const task = progress.tasks.find((entry) => entry.id === taskId);
      expect(task?.total).toBe(buffer.length);
      reader.read();
      expect(task?.completed).toBe(buffer.length);
    } finally {
      reader.close();
    }
  });
});
