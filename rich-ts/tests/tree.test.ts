import { describe, expect, it } from 'vitest';
import { Console } from '../src/console.js';
import { Measurement } from '../src/measure.js';
import { Tree } from '../src/tree.js';

const isWindows = process.platform === 'win32';

const createConsole = (options: ConstructorParameters<typeof Console>[0] = {}) =>
  new Console({
    width: 20,
    height: 20,
    colorSystem: 'none',
    force_terminal: false,
    legacy_windows: false,
    ...options,
  });

describe('Tree', () => {
  it('test_render_single_node', () => {
    const tree = new Tree('foo');
    const console = createConsole();
    console.beginCapture();
    console.print(tree);
    expect(console.endCapture()).toBe('foo\n');
  });

  it('test_render_single_branch', () => {
    const tree = new Tree('foo');
    tree.add('bar');
    const console = createConsole();
    console.beginCapture();
    console.print(tree);
    expect(console.endCapture()).toBe('foo\n└── bar\n');
  });

  it('clears branch guides on wrapped labels', () => {
    const tree = new Tree('root');
    tree.add('foo\nbar');
    const console = createConsole();
    console.beginCapture();
    console.print(tree);
    expect(console.endCapture()).toBe('root\n└── foo\n    bar\n');
  });

  it('test_render_double_branch', () => {
    const tree = new Tree('foo');
    tree.add('bar');
    tree.add('baz');
    const console = createConsole();
    console.beginCapture();
    console.print(tree);
    expect(console.endCapture()).toBe('foo\n├── bar\n└── baz\n');
  });

  it('test_render_ascii', () => {
    const tree = new Tree('foo');
    tree.add('bar');
    tree.add('baz');
    const console = createConsole({ encoding: 'ascii' });
    console.beginCapture();
    console.print(tree);
    expect(console.endCapture()).toBe('foo\n+-- bar\n`-- baz\n');
  });

  const nonWindowsCases = isWindows ? it.skip : it;
  const windowsCases = isWindows ? it : it.skip;

  nonWindowsCases('test_render_tree_non_win32', () => {
    const tree = new Tree('foo');
    tree.add('bar', { style: 'italic' });
    const bazTree = tree.add('baz', { guideStyle: 'bold red', style: 'on blue' });
    bazTree.add('1');
    bazTree.add('2');
    tree.add('egg');

    const console = createConsole({
      force_terminal: true,
      colorSystem: 'standard',
      legacy_windows: false,
    });
    console.beginCapture();
    console.print(tree);
    const expected =
      'foo\n' +
      '├── \u001b[3mbar\u001b[0m\n' +
      '\u001b[44m├── \u001b[0m\u001b[44mbaz\u001b[0m\n' +
      '\u001b[44m│   \u001b[0m\u001b[31;44m┣━━ \u001b[0m\u001b[44m1\u001b[0m\n' +
      '\u001b[44m│   \u001b[0m\u001b[31;44m┗━━ \u001b[0m\u001b[44m2\u001b[0m\n' +
      '└── egg\n';
    expect(console.endCapture()).toBe(expected);
  });

  windowsCases('test_render_tree_win32', () => {
    const tree = new Tree('foo');
    tree.add('bar', { style: 'italic' });
    const bazTree = tree.add('baz', { guideStyle: 'bold red', style: 'on blue' });
    bazTree.add('1');
    bazTree.add('2');
    tree.add('egg');

    const console = createConsole({
      force_terminal: true,
      colorSystem: 'standard',
      legacy_windows: true,
    });
    console.beginCapture();
    console.print(tree);
    const expected =
      'foo\n' +
      '├── \u001b[3mbar\u001b[0m\n' +
      '\u001b[44m├── \u001b[0m\u001b[44mbaz\u001b[0m\n' +
      '\u001b[44m│   \u001b[0m\u001b[31;44m├── \u001b[0m\u001b[44m1\u001b[0m\n' +
      '\u001b[44m│   \u001b[0m\u001b[31;44m└── \u001b[0m\u001b[44m2\u001b[0m\n' +
      '└── egg\n';
    expect(console.endCapture()).toBe(expected);
  });

  nonWindowsCases('test_render_tree_hide_root_non_win32', () => {
    const tree = new Tree('foo', { hideRoot: true });
    tree.add('bar', { style: 'italic' });
    const bazTree = tree.add('baz', { guideStyle: 'bold red', style: 'on blue' });
    bazTree.add('1');
    bazTree.add('2');
    tree.add('egg');

    const console = createConsole({
      force_terminal: true,
      colorSystem: 'standard',
      legacy_windows: false,
    });
    console.beginCapture();
    console.print(tree);
    const expected =
      '\u001b[3mbar\u001b[0m\n' +
      '\u001b[44mbaz\u001b[0m\n' +
      '\u001b[31;44m┣━━ \u001b[0m\u001b[44m1\u001b[0m\n' +
      '\u001b[31;44m┗━━ \u001b[0m\u001b[44m2\u001b[0m\n' +
      'egg\n';
    expect(console.endCapture()).toBe(expected);
  });

  windowsCases('test_render_tree_hide_root_win32', () => {
    const tree = new Tree('foo', { hideRoot: true });
    tree.add('bar', { style: 'italic' });
    const bazTree = tree.add('baz', { guideStyle: 'bold red', style: 'on blue' });
    bazTree.add('1');
    bazTree.add('2');
    tree.add('egg');

    const console = createConsole({
      force_terminal: true,
      colorSystem: 'standard',
      legacy_windows: true,
    });
    console.beginCapture();
    console.print(tree);
    const expected =
      '\u001b[3mbar\u001b[0m\n' +
      '\u001b[44mbaz\u001b[0m\n' +
      '\u001b[31;44m├── \u001b[0m\u001b[44m1\u001b[0m\n' +
      '\u001b[31;44m└── \u001b[0m\u001b[44m2\u001b[0m\n' +
      'egg\n';
    expect(console.endCapture()).toBe(expected);
  });

  it('test_tree_measure', () => {
    const tree = new Tree('foo');
    tree.add('bar');
    tree.add('mushroom risotto');
    const console = createConsole();
    const measurement = Measurement.get(console, console.options, tree);
    expect(measurement.minimum).toBe(12);
    expect(measurement.maximum).toBe(20);
  });
});
