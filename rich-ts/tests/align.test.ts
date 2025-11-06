import { describe, expect, it } from 'vitest';
import { Align, VerticalCenter } from '../src/align.js';
import { Console } from '../src/console.js';
import { Measurement } from '../src/measure.js';

describe('Align', () => {
  it('test_bad_align_legal', () => {
    // Legal
    new Align('foo', 'left');
    new Align('foo', 'center');
    new Align('foo', 'right');

    // Illegal
    expect(() => new Align('foo', null as unknown as 'left')).toThrow('invalid value for align');
    expect(() => new Align('foo', 'middle' as unknown as 'left')).toThrow(
      'invalid value for align'
    );
    expect(() => new Align('foo', '' as unknown as 'left')).toThrow('invalid value for align');
    expect(() => new Align('foo', 'LEFT' as unknown as 'left')).toThrow('invalid value for align');
    expect(() => new Align('foo', 'left', { vertical: 'somewhere' as 'top' })).toThrow(
      'invalid value for vertical'
    );
  });

  it('test_repr', () => {
    expect(new Align('foo', 'left').toString()).toBeTruthy();
    expect(new Align('foo', 'center').toString()).toBeTruthy();
    expect(new Align('foo', 'right').toString()).toBeTruthy();
  });

  it('test_align_left', () => {
    const console = new Console({ width: 10 });
    console.beginCapture();
    console.print(new Align('foo', 'left'));
    const result = console.endCapture();
    expect(result).toBe('foo       \n');
  });

  it('test_align_center', () => {
    const console = new Console({ width: 10 });
    console.beginCapture();
    console.print(new Align('foo', 'center'));
    const result = console.endCapture();
    expect(result).toBe('   foo    \n');
  });

  it('test_align_right', () => {
    const console = new Console({ width: 10 });
    console.beginCapture();
    console.print(new Align('foo', 'right'));
    const result = console.endCapture();
    expect(result).toBe('       foo\n');
  });

  it('test_align_top', () => {
    const console = new Console({ width: 10 });
    console.beginCapture();
    console.print(new Align('foo', 'left', { vertical: 'top' }), { height: 5 });
    const result = console.endCapture();
    const expected = 'foo       \n          \n          \n          \n          \n';
    expect(result).toBe(expected);
  });

  it('test_align_middle', () => {
    const console = new Console({ width: 10 });
    console.beginCapture();
    console.print(new Align('foo', 'left', { vertical: 'middle' }), { height: 5 });
    const result = console.endCapture();
    const expected = '          \n          \nfoo       \n          \n          \n';
    expect(result).toBe(expected);
  });

  it('test_align_bottom', () => {
    const console = new Console({ width: 10 });
    console.beginCapture();
    console.print(new Align('foo', 'left', { vertical: 'bottom' }), { height: 5 });
    const result = console.endCapture();
    const expected = '          \n          \n          \n          \nfoo       \n';
    expect(result).toBe(expected);
  });

  it('test_align_center_middle', () => {
    const console = new Console({ width: 10 });
    console.beginCapture();
    console.print(new Align('foo\nbar', 'center', { vertical: 'middle' }), { height: 5 });
    const result = console.endCapture();
    const expected = '          \n   foo    \n   bar    \n          \n          \n';
    expect(result).toBe(expected);
  });

  it('test_align_fit', () => {
    const console = new Console({ width: 10 });
    console.beginCapture();
    console.print(new Align('foobarbaze', 'center'));
    const result = console.endCapture();
    expect(result).toBe('foobarbaze\n');
  });

  it('test_align_right_style', () => {
    const console = new Console({
      width: 10,
      colorSystem: 'truecolor',
      force_terminal: true,
    });
    console.beginCapture();
    console.print(new Align('foo', 'right', { style: 'on blue' }));
    const result = console.endCapture();
    expect(result).toBe('\x1b[44m       \x1b[0m\x1b[44mfoo\x1b[0m\n');
  });

  it('test_measure', () => {
    const console = new Console({ width: 20 });
    const measurement = Measurement.get(console, console.options, new Align('foo bar', 'left'));
    expect(measurement.minimum).toBe(3);
    expect(measurement.maximum).toBe(7);
  });

  it('test_align_no_pad', () => {
    const console = new Console({ width: 10 });
    console.beginCapture();
    console.print(new Align('foo', 'center', { pad: false }));
    console.print(new Align('foo', 'left', { pad: false }));
    const result = console.endCapture();
    expect(result).toBe('   foo\nfoo\n');
  });

  it('test_align_width', () => {
    const console = new Console({ width: 40 });
    const words =
      'Deep in the human unconscious is a pervasive need for a logical universe that makes sense. But the real universe is always one step beyond logic';
    console.beginCapture();
    console.print(new Align(words, 'center', { width: 30 }));
    const result = console.endCapture();
    const expected =
      '     Deep in the human unconscious      \n' +
      '     is a pervasive need for a          \n' +
      '     logical universe that makes        \n' +
      '     sense. But the real universe       \n' +
      '     is always one step beyond          \n' +
      '     logic                              \n';
    expect(result).toBe(expected);
  });

  it('test_shortcuts', () => {
    expect(Align.left('foo').align).toBe('left');
    expect(Align.left('foo').renderable).toBe('foo');
    expect(Align.right('foo').align).toBe('right');
    expect(Align.right('foo').renderable).toBe('foo');
    expect(Align.center('foo').align).toBe('center');
    expect(Align.center('foo').renderable).toBe('foo');
  });

  it('test_vertical_center', () => {
    const console = new Console({ colorSystem: null, height: 6 });
    console.beginCapture();
    const verticalCenter = new VerticalCenter('foo');
    verticalCenter.toString(); // Test repr
    console.print(verticalCenter);
    const result = console.endCapture();
    const expected = '   \n   \nfoo\n   \n   \n   \n';
    expect(result).toBe(expected);
    const measurement = Measurement.get(console, console.options, verticalCenter);
    expect(measurement).toEqual(new Measurement(3, 3));
  });
});
