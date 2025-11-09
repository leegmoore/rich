import { describe, expect, it } from 'vitest';
import { Console } from '../src/console.js';
import { Bar } from '../src/bar.js';

const renderBar = (bar: Bar): string => {
  const console = new Console({ width: 80, force_terminal: true, legacy_windows: false });
  console.beginCapture();
  console.print(bar);
  return console.endCapture();
};

describe('Bar', () => {
  const expected = [
    '\x1b[39;49m     ▐█████████████████████████                   \x1b[0m\n',
    '\x1b[39;49m      ██████████████████████▌                     \x1b[0m\n',
    '\x1b[39;49m                                                  \x1b[0m\n',
  ];

  it('renders repr string', () => {
    const bar = new Bar({ size: 100, begin: 11, end: 62, width: 50 });
    expect(bar.toString()).toBe('Bar(100, 11, 62)');
  });

  it('renders bar output for various begin/end values', () => {
    let bar = new Bar({ size: 100, begin: 11, end: 62, width: 50 });
    expect(renderBar(bar)).toBe(expected[0]);

    bar = new Bar({ size: 100, begin: 12, end: 57, width: 50 });
    expect(renderBar(bar)).toBe(expected[1]);

    bar = new Bar({ size: 100, begin: 60, end: 40, width: 50 });
    expect(renderBar(bar)).toBe(expected[2]);
  });

  it('measures width correctly', () => {
    const console = new Console({ width: 120, force_terminal: true });
    const bar = new Bar({ size: 100, begin: 11, end: 62 });
    const measurement = bar.__richMeasure__(console, console.options);
    expect(measurement.minimum).toBe(4);
    expect(measurement.maximum).toBe(120);
  });

  it('renders without crashing when size is zero', () => {
    const bar = new Bar({ size: 0, begin: 0, end: 0 });
    expect(() => renderBar(bar)).not.toThrow();
  });
});
