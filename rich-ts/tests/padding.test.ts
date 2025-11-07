import { describe, expect, it } from 'vitest';
import { Padding } from '../src/padding.js';
import { Console, ConsoleOptions } from '../src/console.js';
import { Style } from '../src/style.js';
import { Segment } from '../src/segment.js';

describe('Padding', () => {
  it('test_repr', () => {
    const padding = new Padding('foo', [1, 2]);
    expect(typeof padding.toString()).toBe('string');
  });

  it('test_indent', () => {
    const indentResult = Padding.indent('test', 4);
    expect(indentResult.top).toBe(0);
    expect(indentResult.right).toBe(0);
    expect(indentResult.bottom).toBe(0);
    expect(indentResult.left).toBe(4);
  });

  it('test_unpack', () => {
    expect(Padding.unpack(3)).toEqual([3, 3, 3, 3]);
    expect(Padding.unpack([3])).toEqual([3, 3, 3, 3]);
    expect(Padding.unpack([3, 4])).toEqual([3, 4, 3, 4]);
    expect(Padding.unpack([3, 4, 5, 6])).toEqual([3, 4, 5, 6]);
    // Test invalid tuple size - needs to bypass type checking
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
    expect(() => Padding.unpack([1, 2, 3] as any)).toThrow('1, 2 or 4 integers required');
  });

  it('test_expand_false', () => {
    const console = new Console({ width: 100, colorSystem: 'none', force_terminal: false });
    console.beginCapture();
    console.print(new Padding('foo', 1, { expand: false }));
    expect(console.endCapture()).toBe('     \n foo \n     \n');
  });

  it('test_rich_console', () => {
    const renderable = 'test renderable';
    const style = new Style({ color: 'red' });
    const options = new ConsoleOptions({
      maxWidth: 20,
      minWidth: 10,
      maxHeight: 25,
      isTerminal: false,
      legacy_windows: false,
      encoding: 'utf-8',
    });

    const expectedOutputs = [
      new Segment(renderable, style),
      new Segment(' '.repeat(20 - renderable.length), style),
      new Segment('\n'),
    ];

    const paddingGenerator = new Padding(renderable, undefined, { style }).__richConsole__(
      new Console(),
      options
    );

    let index = 0;
    for (const output of paddingGenerator) {
      expect(output).toEqual(expectedOutputs[index]);
      index++;
    }
  });
});
