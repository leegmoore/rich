import { describe, expect, it } from 'vitest';

import { Console } from '../src/console.js';
import { Measurement } from '../src/measure.js';
import { Styled } from '../src/styled.js';

describe('Styled', () => {
  it('applies style to wrapped renderables', () => {
    const styled = new Styled('foo', 'on red');
    const console = new Console({ force_terminal: true, colorSystem: 'truecolor' });

    expect(Measurement.get(console, console.options, styled)).toEqual(new Measurement(3, 3));

    console.beginCapture();
    console.print(styled);
    const result = console.endCapture();

    expect(result).toBe('\x1b[41mfoo\x1b[0m\n');
  });
});
