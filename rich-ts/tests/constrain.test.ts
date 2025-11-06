/**
 * Tests for constrain module
 * Based on tests/test_constrain.py
 */
import { describe, it, expect } from 'vitest';
import { Console } from '../src/console';
import { Constrain } from '../src/constrain';
import { Text } from '../src/text';

describe('constrain', () => {
  it('test_width_of_none', () => {
    const console = new Console();
    const constrain = new Constrain(new Text('foo'), undefined);
    const measurement = constrain.__richMeasure__(console, console.options.updateWidth(80));
    expect(measurement.minimum).toBe(3);
    expect(measurement.maximum).toBe(3);
  });
});
