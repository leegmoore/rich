import { describe, expect, it } from 'vitest';
import { Console } from '../src/console.js';
import { Pretty, pretty_repr, pprint, install, Node } from '../src/pretty.js';

const createConsole = (overrides: Record<string, unknown> = {}): Console =>
  new Console({
    colorSystem: null,
    width: 80,
    force_terminal: true,
    legacy_windows: false,
    ...overrides,
  });

describe('pretty_repr basics', () => {
  it('renders nested objects with indentation', () => {
    const data = { foo: [1, 2, { bar: 'baz' }] };
    const output = pretty_repr(data, { expandAll: true, indentSize: 2 });
    expect(output).toContain("'foo': [");
    expect(output).toContain("'bar': 'baz'");
  });

  it('honors maximum depth', () => {
    const data = { level1: { level2: { level3: 10 } } };
    const output = pretty_repr(data, { maxDepth: 2 });
    expect(output).toBe("{'level1': {'level2': {...}}}");
  });

  it('truncates strings when maxString is provided', () => {
    const data = ['HelloWorld'];
    const output = pretty_repr(data, { maxString: 5 });
    expect(output).toBe("['Hello'+5]");
  });

  it('summarizes long arrays when maxLength is provided', () => {
    const data = [1, 2, 3, 4, 5];
    const output = pretty_repr(data, { maxLength: 2 });
    expect(output).toBe('[1, 2, ... +3]');
  });

  it('detects circular references', () => {
    const data: unknown[] = [1];
    data.push(data);
    const output = pretty_repr(data, { maxDepth: 4 });
    expect(output).toBe('[1, [...]]');
  });
});

describe('Pretty renderable', () => {
  it('applies indent guides when requested', () => {
    const console = createConsole({ width: 20 });
    console.beginCapture();
    console.print(new Pretty([1, 2], { expandAll: true, indentGuides: true, indentSize: 2 }));
    const result = console.endCapture();
    expect(result).toContain('│');
  });

  it('respects insert line option', () => {
    const console = createConsole();
    console.beginCapture();
    console.print(new Pretty([1, 2], { expandAll: true, insertLine: true }));
    const result = console.endCapture();
    expect(result.startsWith('\n')).toBe(true);
  });
});

describe('pprint helpers', () => {
  it('writes pretty repr via pprint', () => {
    const console = createConsole();
    console.beginCapture();
    pprint({ foo: 1 }, { console });
    const output = console.endCapture();
    expect(output).toBe("{'foo': 1}\n");
  });

  it('returns a display hook via install', () => {
    const console = createConsole();
    console.beginCapture();
    const hook = install(console);
    hook(['a', 'b']);
    const output = console.endCapture();
    expect(output).toBe("['a', 'b']\n");
  });
});

describe('Node utility', () => {
  it('stringifies with provided key', () => {
    const node = new Node('alpha');
    expect(pretty_repr(node)).toBe('alpha: ');
  });
});
