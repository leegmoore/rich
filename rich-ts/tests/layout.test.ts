import { describe, expect, it } from 'vitest';
import { Console } from '../src/console.js';
import { Layout, NoSplitter } from '../src/layout.js';
import { Panel } from '../src/panel.js';

// eslint-disable-next-line no-control-regex
const STRIP_ANSI = /\x1b\[[0-9;]*m/g;
const stripAnsi = (value: string): string => value.replace(STRIP_ANSI, '');

const createConsole = (overrides: Record<string, unknown> = {}): Console =>
  new Console({
    width: 60,
    height: 10,
    colorSystem: null,
    force_terminal: true,
    legacy_windows: false,
    ...overrides,
  });

describe('Layout basics', () => {
  it('throws for unknown splitters', () => {
    const layout = new Layout();
    expect(() => layout.split(new Layout(), new Layout(), 'nope')).toThrow(NoSplitter);
  });

  it('adds splits dynamically', () => {
    const layout = new Layout();
    layout.split(new Layout(), new Layout());
    expect(layout.children.length).toBe(2);
    layout.addSplit(new Layout(null, { name: 'foo' }));
    expect(layout.children.length).toBe(3);
    expect(layout.children.at(-1)?.name).toBe('foo');
  });

  it('unsplits layouts', () => {
    const layout = new Layout();
    layout.split(new Layout(), new Layout());
    expect(layout.children.length).toBe(2);
    layout.unsplit();
    expect(layout.children.length).toBe(0);
  });
});

describe('Layout rendering', () => {
  it('renders nested layouts', () => {
    const layout = new Layout(null, { name: 'root' });
    layout.splitColumn(new Layout(null, { name: 'top' }), new Layout(null, { name: 'bottom' }));
    const top = layout.get('top');
    expect(top).toBeDefined();
    top?.update(new Panel('foo'));
    const bottom = layout.get('bottom');
    expect(bottom).toBeDefined();
    bottom?.splitRow(new Layout(null, { name: 'left' }), new Layout(null, { name: 'right' }));
    bottom?.get('left')?.update('foobar');

    const console = createConsole();
    console.beginCapture();
    console.print(layout);
    const rawResult = console.endCapture();
    const result = stripAnsi(rawResult);
    const expected =
      '╭──────────────────────────────────────────────────────────╮\n' +
      '│ foo                                                      │\n' +
      '│                                                          │\n' +
      '│                                                          │\n' +
      '╰──────────────────────────────────────────────────────────╯\n' +
      "foobar                        ╭───── 'right' (30 x 5) ─────╮\n" +
      '                              │                            │\n' +
      "                              │    Layout(name='right')    │\n" +
      '                              │                            │\n' +
      '                              ╰────────────────────────────╯\n';
    expect(result).toBe(expected);
  });

  it('prints layout tree', () => {
    const layout = new Layout(null, { name: 'root' });
    layout.split(new Layout('foo', { size: 2 }), new Layout('bar', { name: 'bar' }));
    layout.get('bar')?.splitRow(new Layout(), new Layout());
    const console = createConsole();
    console.beginCapture();
    console.print(layout.tree);
    const result = console.endCapture();
    const expected =
      "⬍ Layout(name='root')\n" +
      '├── ⬍ Layout(size=2)\n' +
      "└── ⬌ Layout(name='bar')\n" +
      '    ├── ⬍ Layout()\n' +
      '    └── ⬍ Layout()\n';
    expect(result).toBe(expected);
  });

  it.skip('refreshScreen integrates with console screen API');
});
