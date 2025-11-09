import { describe, expect, it } from 'vitest';
import { Console } from '../src/console.js';
import { ProgressBar } from '../src/progress_bar.js';
import { Style } from '../src/style.js';
import { Segment } from '../src/segment.js';

const renderProgressBar = (bar: ProgressBar): string => {
  const console = new Console({ width: 60, force_terminal: true, legacy_windows: false });
  console.beginCapture();
  console.print(bar);
  return console.endCapture();
};

class TestableProgressBar extends ProgressBar {
  exposePulseSegments(
    foreStyle: Style,
    backStyle: Style,
    colorSystem: string | null,
    noColor: boolean,
    ascii: boolean
  ): Segment[] {
    return this._getPulseSegments(foreStyle, backStyle, colorSystem, noColor, ascii);
  }
}

describe('ProgressBar', () => {
  const expectedRenders = [
    '\x1b[38;2;249;38;114m━━━━━\x1b[0m\x1b[38;2;249;38;114m╸\x1b[0m\x1b[38;5;237m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m',
    '\x1b[38;2;249;38;114m━━━━━━\x1b[0m\x1b[38;5;237m╺\x1b[0m\x1b[38;5;237m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m',
  ];

  it('computes percentage and repr correctly', () => {
    const bar = new ProgressBar({ completed: 50 });
    expect(bar.toString()).toBe('<ProgressBar 50 of 100>');
    expect(bar.percentageCompleted).toBeCloseTo(50);
  });

  it('updates completed and total values', () => {
    const bar = new ProgressBar();
    expect(bar.completed).toBe(0);
    expect(bar.total).toBe(100);
    bar.update(10, 20);
    expect(bar.completed).toBe(10);
    expect(bar.total).toBe(20);
    expect(bar.percentageCompleted).toBe(50);
    bar.update(100);
    expect(bar.percentageCompleted).toBe(100);
  });

  it('renders progress output', () => {
    const bar = new ProgressBar({ completed: 11, width: 50 });
    expect(renderProgressBar(bar).trimEnd()).toBe(expectedRenders[0]);
    bar.update(12);
    expect(renderProgressBar(bar).trimEnd()).toBe(expectedRenders[1]);
  });

  it('measures width range', () => {
    const console = new Console({ width: 120, force_terminal: true });
    const bar = new ProgressBar();
    const measurement = bar.__richMeasure__(console, console.options);
    expect(measurement.minimum).toBe(4);
    expect(measurement.maximum).toBe(120);
  });

  it('renders zero total without throwing', () => {
    const bar = new ProgressBar({ total: 0 });
    expect(() => renderProgressBar(bar)).not.toThrow();
  });

  it('renders pulse animation', () => {
    const bar = new ProgressBar({ pulse: true, animationTime: 10 });
    const result = renderProgressBar(bar).trimEnd();
    const expected =
      '\x1b[38;2;249;38;114m━\x1b[0m\x1b[38;2;244;38;112m━\x1b[0m\x1b[38;2;230;39;108m━\x1b[0m\x1b[38;2;209;42;102m━\x1b[0m\x1b[38;2;183;44;94m━\x1b[0m\x1b[38;2;153;48;86m━\x1b[0m\x1b[38;2;123;51;77m━\x1b[0m\x1b[38;2;97;53;69m━\x1b[0m\x1b[38;2;76;56;63m━\x1b[0m\x1b[38;2;62;57;59m━\x1b[0m\x1b[38;2;58;58;58m━\x1b[0m\x1b[38;2;62;57;59m━\x1b[0m\x1b[38;2;76;56;63m━\x1b[0m\x1b[38;2;97;53;69m━\x1b[0m\x1b[38;2;123;51;77m━\x1b[0m\x1b[38;2;153;48;86m━\x1b[0m\x1b[38;2;183;44;94m━\x1b[0m\x1b[38;2;209;42;102m━\x1b[0m\x1b[38;2;230;39;108m━\x1b[0m\x1b[38;2;244;38;112m━\x1b[0m\x1b[38;2;249;38;114m━\x1b[0m\x1b[38;2;244;38;112m━\x1b[0m\x1b[38;2;230;39;108m━\x1b[0m\x1b[38;2;209;42;102m━\x1b[0m\x1b[38;2;183;44;94m━\x1b[0m\x1b[38;2;153;48;86m━\x1b[0m\x1b[38;2;123;51;77m━\x1b[0m\x1b[38;2;97;53;69m━\x1b[0m\x1b[38;2;76;56;63m━\x1b[0m\x1b[38;2;62;57;59m━\x1b[0m\x1b[38;2;58;58;58m━\x1b[0m\x1b[38;2;62;57;59m━\x1b[0m\x1b[38;2;76;56;63m━\x1b[0m\x1b[38;2;97;53;69m━\x1b[0m\x1b[38;2;123;51;77m━\x1b[0m\x1b[38;2;153;48;86m━\x1b[0m\x1b[38;2;183;44;94m━\x1b[0m\x1b[38;2;209;42;102m━\x1b[0m\x1b[38;2;230;39;108m━\x1b[0m\x1b[38;2;244;38;112m━\x1b[0m\x1b[38;2;249;38;114m━\x1b[0m\x1b[38;2;244;38;112m━\x1b[0m\x1b[38;2;230;39;108m━\x1b[0m\x1b[38;2;209;42;102m━\x1b[0m\x1b[38;2;183;44;94m━\x1b[0m\x1b[38;2;153;48;86m━\x1b[0m\x1b[38;2;123;51;77m━\x1b[0m\x1b[38;2;97;53;69m━\x1b[0m\x1b[38;2;76;56;63m━\x1b[0m\x1b[38;2;62;57;59m━\x1b[0m\x1b[38;2;58;58;58m━\x1b[0m\x1b[38;2;62;57;59m━\x1b[0m\x1b[38;2;76;56;63m━\x1b[0m\x1b[38;2;97;53;69m━\x1b[0m\x1b[38;2;123;51;77m━\x1b[0m\x1b[38;2;153;48;86m━\x1b[0m\x1b[38;2;183;44;94m━\x1b[0m\x1b[38;2;209;42;102m━\x1b[0m\x1b[38;2;230;39;108m━\x1b[0m\x1b[38;2;244;38;112m━\x1b[0m';
    expect(result).toBe(expected);
  });

  it('generates pulse segments with fallback when color unsupported', () => {
    const bar = new TestableProgressBar();
    const segments = bar.exposePulseSegments(
      Style.parse('red'),
      Style.parse('yellow'),
      'none',
      false,
      false
    );
    const expectedSegments = [
      ...Array.from({ length: 10 }, () => new Segment('━', Style.parse('red'))),
      ...Array.from({ length: 10 }, () => new Segment('━', Style.parse('yellow'))),
    ];
    expect(segments).toEqual(expectedSegments);
  });
});
