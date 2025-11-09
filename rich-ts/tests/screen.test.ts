import { describe, expect, it } from 'vitest';

import { Console } from '../src/console.js';
import { Screen } from '../src/screen.js';
import { Text } from '../src/text.js';

describe('Screen', () => {
  it('fills console dimensions and crops extra lines', () => {
    const console = new Console({ colorSystem: null, width: 20, height: 5, legacy_windows: false });
    console.beginCapture();
    console.print(new Screen('foo\nbar\nbaz\nfoo\nbar\nbaz\\foo'));
    const result = console.endCapture();
    const expected =
      'foo                 \n' +
      'bar                 \n' +
      'baz                 \n' +
      'foo                 \n' +
      'bar                 \n';
    expect(result).toBe(expected);
  });

  it('accepts renderable instances directly', () => {
    const console = new Console({ colorSystem: null, width: 5, height: 1, legacy_windows: false });
    console.beginCapture();
    const text = new Text('foo', '', { end: '' });
    console.print(new Screen(text));
    const result = console.endCapture();
    expect(result.startsWith('foo')).toBe(true);
  });

  it('respects render-time width and height overrides', () => {
    const console = new Console({
      colorSystem: null,
      width: 40,
      height: 10,
      legacy_windows: false,
    });
    const screen = new Screen('abcdefghij', 'klmnopqrst', 'uvwxyz');
    const customOptions = console.options.update({ width: 5, height: 2 });
    const segments = Array.from(screen.__richConsole__(console, customOptions));
    const output = segments.map((segment) => segment.text).join('');
    expect(output).toBe('abcde\nfghij');
  });
});
