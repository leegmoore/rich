import { Renderables } from './containers.js';
import type { Console, ConsoleRenderable, RenderableType } from './console.js';
import { Table } from './table.js';
import { Text, type TextType } from './text.js';

export type FormatTimeCallable = (logTime: Date) => Text;

export interface LogRenderOptions {
  showTime?: boolean;
  showLevel?: boolean;
  showPath?: boolean;
  timeFormat?: string | FormatTimeCallable;
  omitRepeatedTimes?: boolean;
  levelWidth?: number | null;
}

export interface LogRenderRenderOptions {
  logTime?: Date;
  timeFormat?: string | FormatTimeCallable;
  level?: TextType;
  path?: string;
  lineNo?: number;
  linkPath?: string;
}

const padNumber = (value: number, length = 2): string => value.toString().padStart(length, '0');

export class LogRender {
  private readonly showTime: boolean;
  private readonly showLevel: boolean;
  private readonly showPath: boolean;
  private readonly timeFormat: string | FormatTimeCallable;
  private readonly omitRepeatedTimes: boolean;
  private readonly levelWidth: number | null;
  private lastTime: Text | null = null;

  constructor({
    showTime = true,
    showLevel = false,
    showPath = true,
    timeFormat = '[%x %X]',
    omitRepeatedTimes = true,
    levelWidth = 8,
  }: LogRenderOptions = {}) {
    this.showTime = showTime;
    this.showLevel = showLevel;
    this.showPath = showPath;
    this.timeFormat = timeFormat;
    this.omitRepeatedTimes = omitRepeatedTimes;
    this.levelWidth = levelWidth ?? null;
  }

  render(
    console: Console,
    renderables: Iterable<ConsoleRenderable>,
    { logTime, timeFormat, level = '', path, lineNo, linkPath }: LogRenderRenderOptions = {}
  ): Table {
    const output = Table.grid({ padding: [0, 1] });
    output.expand = true;

    if (this.showTime) {
      output.addColumn('', '', { style: 'log.time' });
    }
    if (this.showLevel) {
      output.addColumn('', '', { style: 'log.level', width: this.levelWidth ?? undefined });
    }
    output.addColumn('', '', { ratio: 1, style: 'log.message', overflow: 'fold' });

    const includePath = this.showPath && Boolean(path);
    if (includePath) {
      output.addColumn('', '', { style: 'log.path' });
    }

    const row: RenderableType[] = [];

    if (this.showTime) {
      const effectiveTime = logTime ?? console.getDatetime();
      const format = timeFormat ?? this.timeFormat;
      const timeText = this.formatTime(effectiveTime, format);
      if (this.omitRepeatedTimes && this.lastTime && timeText.equals(this.lastTime)) {
        row.push(new Text(' '.repeat(Math.max(timeText.plain.length, 1))));
      } else {
        row.push(timeText);
        this.lastTime = timeText;
      }
    }

    if (this.showLevel) {
      row.push(level);
    }

    row.push(new Renderables(this.normalizeRenderables(renderables)));

    if (includePath && path) {
      const pathText = new Text();
      const pathStyle = linkPath ? `link file://${linkPath}` : '';
      pathText.append(path, pathStyle);
      if (lineNo !== undefined && lineNo !== null) {
        pathText.append(':');
        const lineStyle = linkPath ? `link file://${linkPath}#${lineNo}` : '';
        pathText.append(String(lineNo), lineStyle);
      }
      row.push(pathText);
    }

    output.addRow(...row);
    return output;
  }

  private normalizeRenderables(renderables: Iterable<ConsoleRenderable>): RenderableType[] {
    const normalized: RenderableType[] = [];
    for (const renderable of renderables) {
      normalized.push(renderable as RenderableType);
    }
    return normalized;
  }

  private formatTime(logTime: Date, formatter: string | FormatTimeCallable): Text {
    if (typeof formatter === 'function') {
      return formatter(logTime);
    }
    return new Text(this.applyStrftime(logTime, formatter));
  }

  private applyStrftime(logTime: Date, format: string): string {
    const hours24 = logTime.getHours();
    const replacements: Record<string, string> = {
      '%Y': logTime.getFullYear().toString(),
      '%m': padNumber(logTime.getMonth() + 1),
      '%d': padNumber(logTime.getDate()),
      '%H': padNumber(hours24),
      '%I': padNumber(((hours24 + 11) % 12) + 1),
      '%M': padNumber(logTime.getMinutes()),
      '%S': padNumber(logTime.getSeconds()),
      '%f': padNumber(logTime.getMilliseconds() * 1000, 6),
      '%p': hours24 >= 12 ? 'PM' : 'AM',
      '%x': logTime.toLocaleDateString(),
      '%X': logTime.toLocaleTimeString(),
      '%%': '%',
      '%z': this.formatTimezoneOffset(logTime),
      '%Z': this.formatTimezoneName(logTime),
    };

    return format.replace(/%[a-zA-Z%]/g, (token) => {
      if (replacements[token] !== undefined) {
        return replacements[token];
      }
      return token;
    });
  }

  private formatTimezoneOffset(date: Date): string {
    const offsetMinutes = -date.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const absMinutes = Math.abs(offsetMinutes);
    const hours = Math.floor(absMinutes / 60);
    const minutes = absMinutes % 60;
    return `${sign}${padNumber(hours)}${padNumber(minutes)}`;
  }

  private formatTimezoneName(date: Date): string {
    const formatter = new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' });
    const parts = formatter.formatToParts(date);
    const zone = parts.find((part) => part.type === 'timeZoneName');
    return zone?.value ?? 'GMT';
  }
}
