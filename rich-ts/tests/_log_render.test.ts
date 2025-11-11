import { describe, expect, it } from 'vitest';
import { LogRender } from '../src/_log_render.js';
import { Renderables } from '../src/containers.js';
import { Console } from '../src/console.js';
import { Text } from '../src/text.js';

const createConsole = (): Console =>
  new Console({
    width: 80,
    height: 20,
    legacy_windows: false,
    force_terminal: false,
  });

describe('LogRender', () => {
  it('renders time, level, message, and path columns', () => {
    const logRender = new LogRender({ showTime: true, showLevel: true, showPath: true });
    const console = createConsole();
    const logTime = new Date('2025-01-02T03:04:05Z');

    const table = logRender.render(console, ['hello world'], {
      logTime,
      timeFormat: '[%Y]',
      level: 'INFO',
      path: '/tmp/example.py',
      lineNo: 42,
      linkPath: '/tmp/example.py',
    });

    expect(table.columns).toHaveLength(4);

    const timeCell = table.columns[0]!._cells[0] as Text;
    expect(timeCell.plain).toBe('[2025]');

    const levelCell = table.columns[1]!._cells[0];
    expect(levelCell).toBe('INFO');

    const messageCell = table.columns[2]!._cells[0];
    expect(messageCell).toBeInstanceOf(Renderables);

    const pathCell = table.columns[3]!._cells[0] as Text;
    expect(pathCell.plain).toBe('/tmp/example.py:42');
    expect(pathCell.spans[0]?.style).toBe('link file:///tmp/example.py');
    expect(pathCell.spans[1]?.style).toBe('link file:///tmp/example.py#42');
  });

  it('omits repeated timestamps when configured', () => {
    const logRender = new LogRender({ showLevel: false, omitRepeatedTimes: true });
    const console = createConsole();
    const logTime = new Date('2025-05-06T07:08:09');

    const first = logRender.render(console, ['first'], { logTime, timeFormat: '[%H]' });
    const second = logRender.render(console, ['second'], { logTime, timeFormat: '[%H]' });

    const firstTime = first.columns[0]!._cells[0] as Text;
    const secondTime = second.columns[0]!._cells[0] as Text;

    expect(firstTime.plain).toBe(`[${logTime.getHours().toString().padStart(2, '0')}]`);
    expect(secondTime.plain.trim().length).toBe(0);
  });

  it('allows callable time formatters', () => {
    const formatter = (value: Date): Text => new Text(`(${value.getUTCFullYear()})`);
    const logRender = new LogRender({ timeFormat: formatter });
    const console = createConsole();

    const table = logRender.render(console, ['message'], {
      logTime: new Date('2024-09-10T00:00:00Z'),
    });
    const timeCell = table.columns[0]!._cells[0] as Text;
    expect(timeCell.plain).toBe('(2024)');
  });

  it('honors console getDatetime hook', () => {
    const fixedDate = new Date('2030-12-01T05:06:07Z');
    const console = new Console({
      width: 80,
      height: 20,
      force_terminal: false,
      get_datetime: () => fixedDate,
    });
    const logRender = new LogRender();
    const table = logRender.render(console, ['hooked']);
    const timeCell = table.columns[0]!._cells[0] as Text;
    expect(timeCell.plain).toContain('2030');
  });
});
