import { readFileSync, statSync } from 'node:fs';
import { Console, type RenderableType, type JustifyMethod } from './console.js';
import { Text, type TextType } from './text.js';
import { ProgressBar } from './progress_bar.js';
import { Spinner } from './spinner.js';
import { Live } from './live.js';
import { Renderables } from './containers.js';
import { Table, type Column, createColumn, copyColumn } from './table.js';
import type { StyleType } from './style.js';
import { decimal, pickUnitAndSuffix } from './filesize.js';
import type { Highlighter } from './highlighter.js';

export type TaskID = number;

type GetTime = () => number;

type ColumnLike = string | ProgressColumn;

const PLACEHOLDER_RE = /\{task\.(?<field>[a-zA-Z_]+)(?::(?<format>[^}]+))?\}/g;

type ReadChunk = Buffer | string;

interface ProgressReadable {
  read(size?: number): ReadChunk | null;
  close?: () => void;
  readonly mode?: string;
  readonly name?: string;
  readonly closed?: boolean;
  readonly encoding?: BufferEncoding;
}

class MemoryFileHandle implements ProgressReadable {
  private offset = 0;
  closed = false;
  readonly mode: string;
  readonly name?: string;
  readonly encoding?: BufferEncoding;

  constructor(
    private readonly buffer: Buffer,
    options: { name?: string; mode?: string; encoding?: BufferEncoding } = {}
  ) {
    this.name = options.name;
    this.mode = options.mode ?? (options.encoding ? 'rt' : 'rb');
    this.encoding = options.encoding;
  }

  read(size?: number): ReadChunk | null {
    if (this.offset >= this.buffer.length) {
      return null;
    }
    const end =
      size !== undefined ? Math.min(this.offset + size, this.buffer.length) : this.buffer.length;
    const chunk = this.buffer.subarray(this.offset, end);
    this.offset = end;
    if (this.encoding) {
      return chunk.toString(this.encoding);
    }
    return chunk;
  }

  close(): void {
    this.closed = true;
  }
}

class ProgressFileReader implements ProgressReadable {
  closed = false;
  private readonly chunkEncoding: BufferEncoding;

  constructor(
    private readonly handle: ProgressReadable,
    private readonly progress: Progress,
    private readonly taskId: TaskID,
    encoding: BufferEncoding = 'utf8',
    private readonly closeHandle: boolean = false
  ) {
    this.chunkEncoding = encoding;
  }

  read(size?: number): ReadChunk | null {
    const chunk = this.handle.read(size);
    if (chunk !== null) {
      const byteLength =
        typeof chunk === 'string' ? Buffer.byteLength(chunk, this.chunkEncoding) : chunk.length;
      this.progress.advance(this.taskId, byteLength);
    }
    return chunk;
  }

  close(): void {
    if (this.closed) {
      return;
    }
    this.closed = true;
    if (this.closeHandle && this.handle.close) {
      this.handle.close();
    }
  }

  get mode(): string {
    return this.handle.mode ?? (this.chunkEncoding ? 'rt' : 'rb');
  }

  get name(): string | undefined {
    return this.handle.name;
  }

  get encoding(): BufferEncoding {
    return this.chunkEncoding;
  }
}

interface WrapFileOptions {
  total?: number | null;
  description?: string;
  taskId?: TaskID;
  closeHandle?: boolean;
  encoding?: BufferEncoding;
}

interface StandaloneWrapFileOptions extends WrapFileOptions, ProgressOptions {}

function createReadableHandle(
  source: string | Buffer | ProgressReadable,
  options: { encoding?: BufferEncoding; mode?: string } = {}
): ProgressReadable {
  if (typeof source === 'string') {
    const buffer = readFileSync(source);
    return new MemoryFileHandle(buffer, {
      name: source,
      encoding: options.encoding,
      mode: options.mode,
    });
  }
  if (Buffer.isBuffer(source)) {
    return new MemoryFileHandle(source, { encoding: options.encoding, mode: options.mode });
  }
  return source;
}

function getSourceLength(source: string | Buffer | ProgressReadable): number | null {
  if (typeof source === 'string') {
    return statSync(source).size;
  }
  if (Buffer.isBuffer(source)) {
    return source.length;
  }
  return null;
}

function padValue(value: string, align: string | undefined, width: number): string {
  if (width <= value.length) {
    return value;
  }
  const padding = ' '.repeat(width - value.length);
  if (align === '<') {
    return `${value}${padding}`;
  }
  if (align === '^') {
    const left = Math.floor(padding.length / 2);
    const right = padding.length - left;
    return `${' '.repeat(left)}${value}${' '.repeat(right)}`;
  }
  return `${padding}${value}`;
}

function formatPlaceholder(value: unknown, rawFormat?: string): string {
  if (!rawFormat) {
    return value === undefined || value === null ? '' : String(value);
  }

  const match = rawFormat.match(/([<>^])?(\d+)?(?:\.(\d+))?([df%s])?/);
  if (!match) {
    return value === undefined || value === null ? '' : String(value);
  }
  const [, align, widthRaw, precisionRaw, typeChar] = match;
  const width = widthRaw ? Number(widthRaw) : 0;
  const precision = precisionRaw ? Number(precisionRaw) : undefined;
  let result: string;
  if (typeChar === 'd') {
    const num = Number(value ?? 0);
    result = Math.trunc(num).toString();
  } else if (typeChar === 'f') {
    const num = Number(value ?? 0);
    result = precision !== undefined ? num.toFixed(precision) : num.toString();
  } else {
    result = value === undefined || value === null ? '' : String(value);
  }
  if (width > 0) {
    result = padValue(result, align, width);
  }
  return result;
}

function formatTemplate(template: string, task: Task): string {
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
  return template.replace(
    PLACEHOLDER_RE,
    (_match, field, format, _offset, _input, groups: Record<string, string> | undefined) => {
      const resolvedField = groups?.field ?? field;
      const resolvedFormat = groups?.format ?? format;
      const value = getTaskAttribute(task, resolvedField);
      return formatPlaceholder(value, resolvedFormat);
    }
  );
  /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
}

function formatDuration(seconds: number, compact: boolean = false): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;
  if (compact && hours === 0) {
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
function getTaskAttribute(task: Task, attribute: string): unknown {
  const taskRecord = task as unknown as Record<string, unknown>;
  if (attribute in taskRecord) {
    return taskRecord[attribute];
  }
  if (attribute in task.fields) {
    return task.fields[attribute];
  }
  return undefined;
}
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

export abstract class ProgressColumn {
  protected tableColumn: Column;
  maxRefresh?: number;
  private cache = new Map<TaskID, { timestamp: number; renderable: RenderableType }>();

  protected constructor(tableColumn?: Column) {
    this.tableColumn = tableColumn ?? createColumn(0, { noWrap: true });
  }

  getTableColumn(): Column {
    return copyColumn(this.tableColumn);
  }

  protected abstract render(task: Task): RenderableType;

  format(task: Task): RenderableType {
    if (this.maxRefresh === undefined || task.completed === task.total || task.completed === 0) {
      return this.render(task);
    }
    const now = task.getTime();
    const cached = this.cache.get(task.id);
    if (cached && this.maxRefresh !== undefined && now - cached.timestamp < this.maxRefresh) {
      return cached.renderable;
    }
    const renderable = this.render(task);
    this.cache.set(task.id, { timestamp: now, renderable });
    return renderable;
  }
}

export class RenderableColumn extends ProgressColumn {
  private renderable: RenderableType;

  constructor(renderable: RenderableType = '', options: { tableColumn?: Column } = {}) {
    super(options.tableColumn);
    this.renderable = renderable;
  }

  override render(_task: Task): RenderableType {
    return this.renderable;
  }
}

export interface SpinnerColumnOptions {
  style?: StyleType;
  spinnerName?: string;
  speed?: number;
  finishedText?: TextType;
  tableColumn?: Column;
}

export class SpinnerColumn extends ProgressColumn {
  private spinner: Spinner;
  private finishedText: Text;

  constructor(options: SpinnerColumnOptions = {}) {
    super(options.tableColumn);
    this.spinner = new Spinner(options.spinnerName ?? 'dots', undefined, {
      style: options.style ?? 'progress.spinner',
      speed: options.speed ?? 1,
    });
    this.finishedText =
      typeof options.finishedText === 'string'
        ? Text.fromMarkup(options.finishedText)
        : (options.finishedText ?? new Text(' '));
  }

  setSpinner(
    spinnerName: string,
    options: { spinnerStyle?: StyleType; speed?: number } = {}
  ): void {
    this.spinner = new Spinner(spinnerName, undefined, {
      style: options.spinnerStyle ?? 'progress.spinner',
      speed: options.speed ?? 1,
    });
  }

  updateSpinner(options: { text?: RenderableType; style?: StyleType; speed?: number } = {}): void {
    this.spinner.update(options);
  }

  override render(task: Task): RenderableType {
    if (task.finished) {
      return this.finishedText;
    }
    return this.spinner.render(task.getTime());
  }
}

export interface TextColumnOptions {
  style?: StyleType;
  justify?: JustifyMethod;
  markup?: boolean;
  highlighter?: Highlighter;
  tableColumn?: Column;
}

export class TextColumn extends ProgressColumn {
  protected readonly textFormat: string;
  private readonly style: StyleType;
  private readonly justify: JustifyMethod;
  private readonly markup: boolean;
  private readonly highlighter?: Highlighter;

  constructor(textFormat: string, options: TextColumnOptions = {}) {
    super(options.tableColumn ?? createColumn(0, { noWrap: true }));
    this.textFormat = textFormat;
    this.style = options.style ?? 'none';
    this.justify = options.justify ?? 'left';
    this.markup = options.markup ?? true;
    this.highlighter = options.highlighter;
  }

  protected renderText(task: Task, template: string): Text {
    const formatted = formatTemplate(template, task);
    const text = this.markup
      ? Text.fromMarkup(formatted, { style: this.style, justify: this.justify })
      : new Text(formatted, this.style, { justify: this.justify });
    if (this.highlighter) {
      this.highlighter.highlight(text);
    }
    return text;
  }

  override render(task: Task): Text {
    return this.renderText(task, this.textFormat);
  }
}

export interface BarColumnOptions {
  barWidth?: number | null;
  style?: StyleType;
  completeStyle?: StyleType;
  finishedStyle?: StyleType;
  pulseStyle?: StyleType;
  tableColumn?: Column;
}

export class BarColumn extends ProgressColumn {
  private readonly style: StyleType;
  private readonly completeStyle: StyleType;
  private readonly finishedStyle: StyleType;
  private readonly pulseStyle: StyleType;
  private readonly _barWidth: number | null;

  constructor(options: BarColumnOptions = {}) {
    super(options.tableColumn);
    this._barWidth = options.barWidth ?? 40;
    this.style = options.style ?? 'bar.back';
    this.completeStyle = options.completeStyle ?? 'bar.complete';
    this.finishedStyle = options.finishedStyle ?? 'bar.finished';
    this.pulseStyle = options.pulseStyle ?? 'bar.pulse';
  }

  get barWidth(): number | null {
    return this._barWidth;
  }

  override render(task: Task): ProgressBar {
    return new ProgressBar({
      total: task.total,
      completed: task.completed,
      width: this._barWidth ?? undefined,
      pulse: task.total === null,
      animationTime: task.getTime(),
      style: this.style,
      completeStyle: this.completeStyle,
      finishedStyle: this.finishedStyle,
      pulseStyle: this.pulseStyle,
    });
  }
}

export class TimeElapsedColumn extends ProgressColumn {
  override render(task: Task): Text {
    const elapsed = task.finished ? task.finishedTime : task.elapsed;
    if (elapsed === null || elapsed === undefined) {
      return new Text('-:--:--', 'progress.elapsed');
    }
    return new Text(formatDuration(elapsed), 'progress.elapsed');
  }
}

export interface TimeRemainingColumnOptions {
  compact?: boolean;
  elapsedWhenFinished?: boolean;
  tableColumn?: Column;
}

export class TimeRemainingColumn extends ProgressColumn {
  private readonly compact: boolean;
  private readonly elapsedWhenFinished: boolean;

  constructor(options: TimeRemainingColumnOptions = {}) {
    super(options.tableColumn);
    this.compact = options.compact ?? false;
    this.elapsedWhenFinished = options.elapsedWhenFinished ?? false;
    this.maxRefresh = 0.5;
  }

  override render(task: Task): Text {
    const style =
      task.finished && this.elapsedWhenFinished ? 'progress.elapsed' : 'progress.remaining';
    if (task.total === null) {
      return new Text('', style);
    }
    if (task.finished && this.elapsedWhenFinished) {
      const delta = task.finishedTime ?? 0;
      return new Text(formatDuration(delta), style);
    }
    const remaining = task.timeRemaining;
    if (remaining === null) {
      return new Text(this.compact ? '--:--' : '-:--:--', style);
    }
    if (this.compact && remaining < 3600) {
      return new Text(formatDuration(remaining, true), style);
    }
    return new Text(formatDuration(remaining), style);
  }
}

export class DownloadColumn extends ProgressColumn {
  private readonly binaryUnits: boolean;

  constructor(options: { binaryUnits?: boolean; tableColumn?: Column } = {}) {
    super(options.tableColumn);
    this.binaryUnits = options.binaryUnits ?? false;
  }

  override render(task: Task): Text {
    const suffixes = this.binaryUnits
      ? ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
      : ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const totalReference = task.total ?? task.completed;
    const [unit, suffix] = pickUnitAndSuffix(
      Math.max(1, Number(totalReference)),
      suffixes,
      this.binaryUnits ? 1024 : 1000
    );
    const precision = unit === 1 ? 0 : 1;
    const completed = (task.completed ?? 0) / unit;
    const completedStr = completed.toFixed(precision);
    const totalStr = task.total === null ? '?' : (task.total / unit).toFixed(precision);
    return new Text(`${completedStr}/${totalStr} ${suffix}`, 'progress.download');
  }
}

export class FileSizeColumn extends ProgressColumn {
  override render(task: Task): Text {
    const size = decimal(Math.max(0, Math.floor(task.completed)));
    return new Text(size, 'progress.filesize');
  }
}

export class TotalFileSizeColumn extends ProgressColumn {
  override render(task: Task): Text {
    if (task.total === null) {
      return new Text('', 'progress.filesize.total');
    }
    const size = decimal(Math.max(0, Math.floor(task.total)));
    return new Text(size, 'progress.filesize.total');
  }
}

export interface MofNCompleteColumnOptions {
  separator?: string;
  tableColumn?: Column;
}

export class MofNCompleteColumn extends ProgressColumn {
  private readonly separator: string;

  constructor(options: MofNCompleteColumnOptions = {}) {
    super(options.tableColumn);
    this.separator = options.separator ?? '/';
  }

  override render(task: Task): Text {
    const completed = Math.floor(task.completed);
    const total = task.total === null ? '?' : Math.floor(task.total);
    const totalWidth = typeof total === 'number' ? String(total).length : 1;
    const formattedCompleted =
      typeof total === 'number'
        ? completed.toString().padStart(totalWidth, ' ')
        : String(completed);
    return new Text(`${formattedCompleted}${this.separator}${total}`, 'progress.download');
  }
}

export class TransferSpeedColumn extends ProgressColumn {
  override render(task: Task): Text {
    const speed = task.finishedSpeed ?? task.speed;
    if (speed === null) {
      return new Text('?', 'progress.data.speed');
    }
    const size = decimal(Math.max(0, speed));
    return new Text(`${size}/s`, 'progress.data.speed');
  }
}

export interface TaskProgressColumnOptions extends TextColumnOptions {
  showSpeed?: boolean;
  textFormat?: string;
  noPercentageText?: string;
}

export class TaskProgressColumn extends TextColumn {
  private readonly textFormatNoPercentage: string;
  private readonly showSpeed: boolean;

  constructor(options: TaskProgressColumnOptions = {}) {
    const columnOptions: TextColumnOptions = {
      ...options,
      style: options.style ?? 'progress.percentage',
    };
    super(options.textFormat ?? '[progress.percentage]{task.percentage:>3.0f}%', columnOptions);
    this.textFormatNoPercentage = options.noPercentageText ?? '';
    this.showSpeed = options.showSpeed ?? false;
  }

  static renderSpeed(speed: number | null): Text {
    if (speed === null || speed === undefined) {
      return new Text('', 'progress.percentage');
    }
    const [unit, suffix] = pickUnitAndSuffix(
      Math.max(1, Math.floor(speed)),
      ['', '×10³', '×10⁶', '×10⁹', '×10¹²'],
      1000
    );
    const value = speed / unit;
    return new Text(`${value.toFixed(1)}${suffix} it/s`, 'progress.percentage');
  }

  override render(task: Task): Text {
    if (task.total === null && this.showSpeed) {
      return TaskProgressColumn.renderSpeed(task.finishedSpeed ?? task.speed);
    }
    const template = task.total === null ? this.textFormatNoPercentage : this.textFormat;
    if (!template) {
      return new Text('', 'progress.percentage');
    }
    return this.renderText(task, template);
  }
}

interface ProgressSample {
  timestamp: number;
  completed: number;
}

interface TaskOptions {
  getTime: GetTime;
  visible?: boolean;
  fields?: Record<string, unknown>;
}

export class Task {
  readonly id: TaskID;
  description: string;
  total: number | null;
  completed: number;
  visible: boolean;
  fields: Record<string, unknown>;
  finishedTime: number | null = null;
  finishedSpeed: number | null = null;
  startTime: number | null = null;
  stopTime: number | null = null;
  private readonly getTimeFn: GetTime;
  private readonly progressSamples: ProgressSample[] = [];

  constructor(
    id: TaskID,
    description: string,
    total: number | null,
    completed: number,
    options: TaskOptions
  ) {
    this.id = id;
    this.description = description;
    this.total = total ?? null;
    this.completed = completed;
    this.visible = options.visible ?? true;
    this.fields = { ...(options.fields ?? {}) };
    this.getTimeFn = options.getTime;
  }

  getTime(): number {
    return this.getTimeFn();
  }

  get started(): boolean {
    return this.startTime !== null;
  }

  get finished(): boolean {
    return this.finishedTime !== null;
  }

  get remaining(): number | null {
    if (this.total === null) {
      return null;
    }
    return this.total - this.completed;
  }

  get elapsed(): number | null {
    if (this.startTime === null) {
      return null;
    }
    if (this.stopTime !== null) {
      return this.stopTime - this.startTime;
    }
    return this.getTime() - this.startTime;
  }

  get percentage(): number {
    if (this.total === null || this.total === 0) {
      return 0;
    }
    const ratio = (this.completed / this.total) * 100;
    return Math.max(0, Math.min(100, ratio));
  }

  get speed(): number | null {
    if (this.progressSamples.length < 2) {
      return null;
    }
    const firstSample = this.progressSamples[0]!;
    const last = this.progressSamples[this.progressSamples.length - 1]!;
    const totalTime = last.timestamp - firstSample.timestamp;
    if (totalTime <= 0) {
      return null;
    }
    const completed = this.progressSamples
      .slice(1)
      .reduce((acc, sample) => acc + sample.completed, 0);
    return completed / totalTime;
  }

  get timeRemaining(): number | null {
    if (this.finished) {
      return 0;
    }
    const speed = this.speed;
    const remaining = this.remaining;
    if (!speed || remaining === null || speed === 0) {
      return null;
    }
    return Math.ceil(remaining / speed);
  }

  addSample(sample: ProgressSample, maxSamples: number): void {
    this.progressSamples.push(sample);
    if (this.progressSamples.length > maxSamples) {
      this.progressSamples.shift();
    }
  }

  trimSamples(earliestTimestamp: number): void {
    while (
      this.progressSamples.length > 0 &&
      this.progressSamples[0]!.timestamp < earliestTimestamp
    ) {
      this.progressSamples.shift();
    }
  }

  resetSamples(): void {
    this.progressSamples.length = 0;
    this.finishedTime = null;
    this.finishedSpeed = null;
  }
}

export interface AddTaskOptions {
  start?: boolean;
  total?: number | null;
  completed?: number;
  visible?: boolean;
  fields?: Record<string, unknown>;
}

export interface ResetTaskOptions {
  start?: boolean;
  total?: number | null;
  completed?: number;
  visible?: boolean;
  description?: string;
  fields?: Record<string, unknown>;
}

export interface ProgressOptions {
  console?: Console;
  autoRefresh?: boolean;
  refreshPerSecond?: number;
  speedEstimatePeriod?: number;
  transient?: boolean;
  redirectStdout?: boolean;
  redirectStderr?: boolean;
  getTime?: GetTime;
  disable?: boolean;
  expand?: boolean;
}

export interface TrackOptions {
  total?: number | null;
  completed?: number;
  taskId?: TaskID;
  description?: string;
  updatePeriod?: number;
}

export interface TrackFunctionOptions extends ProgressOptions {
  total?: number | null;
  completed?: number;
  updatePeriod?: number;
}

function getLengthHint(iterable: Iterable<unknown>): number | null {
  if (Array.isArray(iterable) || typeof iterable === 'string') {
    return iterable.length;
  }
  if (iterable instanceof Set || iterable instanceof Map) {
    return iterable.size;
  }
  return null;
}

export class TrackThread {
  completed = 0;
  private interval?: NodeJS.Timeout;
  private lastSynced = 0;

  constructor(
    private readonly progress: Progress,
    private readonly taskId: TaskID,
    private readonly updatePeriod: number
  ) {}

  start(): void {
    if (this.interval) {
      return;
    }
    const periodMs = Math.max(0.05, this.updatePeriod) * 1000;
    this.interval = setInterval(() => this.flush(), periodMs);
  }

  private flush(): void {
    const delta = this.completed - this.lastSynced;
    if (delta !== 0) {
      this.progress.advance(this.taskId, delta);
      this.lastSynced = this.completed;
    }
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
    this.flush();
    this.progress.update(this.taskId, { completed: this.completed, refresh: true });
  }

  async run<T>(fn: () => Promise<T> | T): Promise<T> {
    this.start();
    try {
      return await fn();
    } finally {
      this.stop();
    }
  }
}

export class Progress {
  readonly columns: ColumnLike[];
  readonly console: Console;
  readonly live: Live;
  readonly print: (...args: unknown[]) => void;
  readonly log: (...args: unknown[]) => void;
  private readonly speedEstimatePeriod: number;
  private readonly disable: boolean;
  private readonly expand: boolean;
  private readonly autoRefresh: boolean;
  private readonly getTimeFn: GetTime;
  private readonly tasksMap = new Map<TaskID, Task>();
  private taskIndex: TaskID = 0;

  constructor(...columnsOrOptions: Array<ColumnLike | ProgressOptions>) {
    let options: ProgressOptions = {};
    const resolvedColumns: ColumnLike[] = [];
    for (const entry of columnsOrOptions) {
      if (typeof entry === 'string' || entry instanceof ProgressColumn) {
        resolvedColumns.push(entry);
      } else if (typeof entry === 'object') {
        options = entry;
      }
    }
    this.columns = resolvedColumns.length > 0 ? resolvedColumns : Progress.getDefaultColumns();
    this.console = options.console ?? new Console({ force_terminal: true });
    this.speedEstimatePeriod = options.speedEstimatePeriod ?? 30;
    this.disable = options.disable ?? false;
    this.expand = options.expand ?? false;
    this.autoRefresh = options.autoRefresh ?? true;
    this.getTimeFn = options.getTime ?? (() => this.console.getTime());
    this.live = new Live(undefined, {
      console: this.console,
      autoRefresh: this.autoRefresh,
      refreshPerSecond: options.refreshPerSecond ?? 10,
      transient: options.transient ?? false,
      redirectStdout: options.redirectStdout ?? true,
      redirectStderr: options.redirectStderr ?? true,
      getRenderable: () => this.getRenderable(),
    });
    this.print = (...args: unknown[]) => {
      this.console.print(...args);
    };
    this.log = (...args: unknown[]) => {
      if (typeof this.console.log === 'function') {
        this.console.log(...args);
      } else {
        this.console.print(...args);
      }
    };
  }

  static getDefaultColumns(): ColumnLike[] {
    return [
      new TextColumn('[progress.description]{task.description}'),
      new BarColumn(),
      new TaskProgressColumn(),
      new TimeRemainingColumn(),
    ];
  }

  get tasks(): Task[] {
    return Array.from(this.tasksMap.values());
  }

  get taskIds(): TaskID[] {
    return Array.from(this.tasksMap.keys());
  }

  get finished(): boolean {
    if (this.tasksMap.size === 0) {
      return true;
    }
    return Array.from(this.tasksMap.values()).every((task) => task.finished);
  }

  addTask(description: string, options: AddTaskOptions = {}): TaskID {
    const id = this.taskIndex;
    this.taskIndex += 1;
    const total = options.total === undefined ? 100 : options.total;
    const task = new Task(id, description, total, options.completed ?? 0, {
      getTime: this.getTimeFn,
      visible: options.visible,
      fields: options.fields,
    });
    if (options.start !== false) {
      task.startTime = this.getTimeFn();
    }
    this.tasksMap.set(id, task);
    return id;
  }

  removeTask(taskId: TaskID): void {
    this.tasksMap.delete(taskId);
  }

  wrapFile(
    source: string | Buffer | ProgressReadable,
    options: WrapFileOptions = {}
  ): ProgressFileReader {
    const handle = createReadableHandle(source, { encoding: options.encoding });
    const inferredTotal = options.total !== undefined ? options.total : getSourceLength(source);
    let taskId: TaskID;
    if (options.taskId !== undefined) {
      taskId = options.taskId;
      if (inferredTotal !== null) {
        this.update(taskId, { total: inferredTotal });
      }
    } else {
      const description = options.description ?? 'Reading...';
      taskId = this.addTask(description, { total: inferredTotal ?? null });
    }
    return new ProgressFileReader(
      handle,
      this,
      taskId,
      options.encoding ?? handle.encoding ?? 'utf8',
      options.closeHandle ?? false
    );
  }

  open(path: string, options: WrapFileOptions = {}): ProgressFileReader {
    return this.wrapFile(path, { ...options, closeHandle: true });
  }

  reset(taskId: TaskID, options: ResetTaskOptions = {}): void {
    const task = this.tasksMap.get(taskId);
    if (!task) {
      return;
    }
    const now = this.getTimeFn();
    task.resetSamples();
    task.startTime = options.start === false ? null : now;
    task.stopTime = null;
    if (options.total !== undefined) {
      task.total = options.total;
    }
    task.completed = options.completed ?? 0;
    if (options.visible !== undefined) {
      task.visible = options.visible;
    }
    if (options.fields) {
      task.fields = { ...options.fields };
    }
    if (options.description !== undefined) {
      task.description = options.description;
    }
    task.finishedTime = null;
    task.finishedSpeed = null;
    this.refresh();
  }

  startTask(taskId: TaskID): void {
    const task = this.tasksMap.get(taskId);
    if (!task) {
      return;
    }
    if (!task.startTime) {
      task.startTime = this.getTimeFn();
    }
  }

  stopTask(taskId: TaskID): void {
    const task = this.tasksMap.get(taskId);
    if (!task) {
      return;
    }
    const now = this.getTimeFn();
    if (!task.startTime) {
      task.startTime = now;
    }
    task.stopTime = now;
  }

  advance(taskId: TaskID, advance: number = 1): void {
    const task = this.tasksMap.get(taskId);
    if (!task) {
      return;
    }
    const start = task.completed;
    task.completed += advance;
    this.recordSample(task, task.completed - start);
    if (task.total !== null && task.completed >= task.total && !task.finished) {
      task.finishedTime = task.elapsed ?? 0;
      task.finishedSpeed = task.speed;
    }
  }

  update(
    taskId: TaskID,
    updates: {
      total?: number | null;
      completed?: number;
      advance?: number;
      description?: string;
      visible?: boolean;
      refresh?: boolean;
      fields?: Record<string, unknown>;
    }
  ): void {
    const task = this.tasksMap.get(taskId);
    if (!task) {
      // Silently ignore updates to non-existent tasks
      return;
    }
    const startCompleted = task.completed;
    if (updates.total !== undefined) {
      task.total = updates.total;
      task.resetSamples();
    }
    if (updates.advance !== undefined) {
      task.completed = Math.max(0, task.completed + updates.advance);
    }
    if (updates.completed !== undefined) {
      task.completed = Math.max(0, updates.completed);
    }
    // Ensure completed doesn't exceed total if total is set
    if (task.total !== null && task.completed > task.total) {
      task.completed = task.total;
    }
    if (updates.description !== undefined) {
      task.description = updates.description;
    }
    if (updates.visible !== undefined) {
      task.visible = updates.visible;
    }
    if (updates.fields) {
      task.fields = { ...task.fields, ...updates.fields };
    }
    const delta = task.completed - startCompleted;
    if (delta > 0) {
      this.recordSample(task, delta);
    }
    if (task.total !== null && task.completed >= task.total && !task.finished) {
      task.finishedTime = task.elapsed ?? 0;
      task.finishedSpeed = task.speed;
    }
    if (updates.refresh) {
      this.refresh();
    }
  }

  private recordSample(task: Task, delta: number): void {
    const now = this.getTimeFn();
    task.addSample({ timestamp: now, completed: delta }, 1000);
    task.trimSamples(now - this.speedEstimatePeriod);
    task.finishedSpeed = task.speed ?? task.finishedSpeed;
  }

  start(): void {
    if (this.disable || !this.live) {
      return;
    }
    try {
      this.live.start(true);
    } catch (error) {
      // Silently handle start errors to prevent crashes
    }
  }

  stop(): void {
    if (!this.disable && this.live) {
      try {
        this.live.stop();
      } catch (error) {
        // Silently handle stop errors to prevent crashes
      }
    }
  }

  refresh(): void {
    if (!this.disable && this.live && this.live.isStarted) {
      try {
        this.live.refresh();
      } catch (error) {
        // Silently handle refresh errors to prevent crashes
        // This can happen if console is closed or in invalid state
      }
    }
  }

  getRenderable(): RenderableType {
    return new Renderables(this.getRenderables());
  }

  getRenderables(): RenderableType[] {
    return [this.makeTasksTable(this.tasks)];
  }

  makeTasksTable(tasks: Iterable<Task>): Table {
    const tableColumns = this.columns.map((column, index) => {
      if (typeof column === 'string') {
        return createColumn(index, { noWrap: true });
      }
      return column.getTableColumn();
    });
    const table = Table.grid(...tableColumns, { padding: [0, 1], expand: this.expand });
    for (const task of tasks) {
      if (!task.visible) {
        continue;
      }
      const row = this.columns.map((column) => {
        if (typeof column === 'string') {
          return column;
        }
        return column.format(task);
      });
      table.addRow(...row);
    }
    return table;
  }

  track<T>(sequence: Iterable<T>, options: TrackOptions = {}): Iterable<T> {
    const total = options.total !== undefined ? options.total : getLengthHint(sequence);
    const description = options.description ?? 'Working...';
    let taskId: TaskID;
    if (options.taskId !== undefined) {
      taskId = options.taskId;
      this.update(taskId, { total: total ?? null, completed: options.completed ?? 0 });
    } else {
      taskId = this.addTask(description, {
        total: total ?? null,
        completed: options.completed ?? 0,
      });
    }
    const updatePeriod = options.updatePeriod ?? 0.1;
    function* iterate(progressInstance: Progress): Generator<T> {
      if (progressInstance.autoRefresh) {
        const thread = new TrackThread(progressInstance, taskId, updatePeriod);
        thread.start();
        try {
          for (const value of sequence) {
            thread.completed += 1;
            yield value;
          }
        } finally {
          thread.stop();
        }
      } else {
        for (const value of sequence) {
          yield value;
          progressInstance.advance(taskId, 1);
          progressInstance.refresh();
        }
      }
    }
    return iterate(this);
  }
}

export function* track<T>(
  sequence: Iterable<T>,
  description: string = 'Working...',
  options: TrackFunctionOptions = {}
): Generator<T> {
  const { total, completed, updatePeriod, ...rest } = options;
  const progressOptions: ProgressOptions = rest;
  const progress = new Progress(progressOptions);
  progress.start();
  try {
    yield* progress.track(sequence, {
      description,
      total: total === undefined ? undefined : total,
      completed,
      updatePeriod,
    });
  } finally {
    progress.stop();
  }
}

class StandaloneProgressReader implements ProgressReadable {
  constructor(
    private readonly reader: ProgressFileReader,
    private readonly progress: Progress
  ) {}

  get mode(): string {
    return this.reader.mode;
  }

  get name(): string | undefined {
    return this.reader.name;
  }

  get closed(): boolean {
    return this.reader.closed;
  }

  read(size?: number): ReadChunk | null {
    return this.reader.read(size);
  }

  close(): void {
    this.reader.close();
    if (this.progress.live.isStarted) {
      this.progress.stop();
    }
  }
}

export function wrapFile(
  source: string | Buffer | ProgressReadable,
  options: StandaloneWrapFileOptions = {}
): ProgressReadable {
  const { description = 'Reading...', ...progressOptions } = options;
  const progress = new Progress(progressOptions);
  if (progressOptions.autoRefresh !== false) {
    progress.start();
  }
  const reader = progress.wrapFile(source, {
    ...options,
    description,
    closeHandle: options.closeHandle ?? true,
  });
  return new StandaloneProgressReader(reader, progress);
}

export function openFile(path: string, options: StandaloneWrapFileOptions = {}): ProgressReadable {
  return wrapFile(path, { ...options, closeHandle: true });
}
