import { describe, expect, it } from 'vitest';

import { AnsiDecoder } from '../src/ansi.js';
import { Console } from '../src/console.js';
import { Style } from '../src/style.js';
import { Text } from '../src/text.js';

describe('AnsiDecoder', () => {
  it('decodes styled console output into Text lines', () => {
    const console = new Console({
      force_terminal: true,
      legacy_windows: false,
      colorSystem: 'truecolor',
    });
    console.beginCapture();
    console.print('Hello');
    console.print('[b]foo[/b]');
    console.print('[link http://example.org]bar');
    console.print('[#ff0000 on color(200)]red');
    console.print('[color(200) on #ff0000]red');
    const terminalCodes = console.endCapture();

    const decoder = new AnsiDecoder();
    const lines = Array.from(decoder.decode(terminalCodes));

    expect(lines.map((line) => line.plain)).toEqual(['Hello', 'foo', 'bar', 'red', 'red']);

    expect(lines[0]?.spans).toEqual([]);

    const boldSpan = lines[1]?.spans[0];
    expect(boldSpan?.start).toBe(0);
    expect(boldSpan?.end).toBe(3);
    expect(boldSpan?.style).toBeInstanceOf(Style);
    expect((boldSpan?.style as Style).bold).toBe(true);

    const linkSpan = lines[2]?.spans[0];
    expect(linkSpan?.style).toBeInstanceOf(Style);
    expect((linkSpan?.style as Style).link).toBe('http://example.org');

    const fgSpan = lines[3]?.spans[0];
    expect(fgSpan?.style).toBeInstanceOf(Style);
    expect((fgSpan?.style as Style).color?.name).toBe('#ff0000');
    expect((fgSpan?.style as Style).bgcolor?.name).toBe('color(200)');

    const bgSpan = lines[4]?.spans[0];
    expect(bgSpan?.style).toBeInstanceOf(Style);
    expect((bgSpan?.style as Style).color?.name).toBe('color(200)');
    expect((bgSpan?.style as Style).bgcolor?.name).toBe('#ff0000');
  });

  it('decodes extended ANSI color sequences', () => {
    const ansi = '\x1b[38;5;200mindexed\x1b[0m\n\x1b[48;2;12;34;56mblock\x1b[0m';
    const decoder = new AnsiDecoder();
    const [indexed, block] = Array.from(decoder.decode(ansi));

    expect(indexed.plain).toBe('indexed');
    const indexedSpan = indexed.spans[0];
    expect(indexedSpan?.style).toBeInstanceOf(Style);
    expect((indexedSpan?.style as Style).color?.name).toBe('color(200)');

    expect(block.plain).toBe('block');
    const blockSpan = block.spans[0];
    expect(blockSpan?.style).toBeInstanceOf(Style);
    expect((blockSpan?.style as Style).bgcolor?.name).toBe('#0c2238');
  });

  it('round-trips a complex ANSI sample through Text.fromAnsi', () => {
    const ansiText =
      "\x1b[01m\x1b[KC:\\Users\\stefa\\AppData\\Local\\Temp\\tmp3ydingba:\x1b[m\x1b[K In function '\x1b[01m\x1b[Kmain\x1b[m\x1b[K':\n\x1b[01m\x1b[KC:\\Users\\stefa\\AppData\\Local\\Temp\\tmp3ydingba:3:5:\x1b[m\x1b[K \x1b[01;35m\x1b[Kwarning: \x1b[m\x1b[Kunused variable '\x1b[01m\x1b[Ka\x1b[m\x1b[K' [\x1b[01;35m\x1b[K-Wunused-variable\x1b[m\x1b[K]\n    3 | int \x1b[01;35m\x1b[Ka\x1b[m\x1b[K=1;\n      |     \x1b[01;35m\x1b[K^\x1b[m\x1b[K\n";
    const text = Text.fromAnsi(ansiText);

    const console = new Console({
      force_terminal: true,
      legacy_windows: false,
      colorSystem: 'truecolor',
    });
    console.beginCapture();
    console.print(text);
    const result = console.endCapture();

    const expected =
      "\x1b[1mC:\\Users\\stefa\\AppData\\Local\\Temp\\tmp3ydingba:\x1b[0m In function '\x1b[1mmain\x1b[0m':\n\x1b[1mC:\\Users\\stefa\\AppData\\Local\\Temp\\tmp3ydingba:3:5:\x1b[0m \x1b[1;35mwarning: \x1b[0munused variable '\x1b[1ma\x1b[0m' \n[\x1b[1;35m-Wunused-variable\x1b[0m]\n    3 | int \x1b[1;35ma\x1b[0m=1;\n      |     \x1b[1;35m^\x1b[0m\n";
    expect(result).toBe(expected);
  });

  it.each<readonly [string, string]>([
    [
      '\x1b[31mFound 4 errors in 2 files (checked 18 source files)\x1b(B\x1b[m\n',
      'Found 4 errors in 2 files (checked 18 source files)',
    ],
    ['Hallo', 'Hallo'],
    ['\x1b(BHallo', 'Hallo'],
    ['\x1b(JHallo', 'Hallo'],
    ['\x1b(BHal\x1b(Jlo', 'Hallo'],
  ])('decodes issue 2688 cases %s', (ansiBytes, expectedText) => {
    const text = Text.fromAnsi(ansiBytes);
    expect(String(text)).toBe(expectedText);
  });

  it('strips private escape sequences', () => {
    const console = new Console({ force_terminal: true });
    for (const code of '0123456789:;<=>?') {
      const ansi = `\x1b${code}x`;
      const text = Text.fromAnsi(ansi);
      console.beginCapture();
      console.print(text);
      expect(console.endCapture()).toBe('x\n');
    }
  });
});
