import { describe, it, expect } from 'vitest';
import { Measurement } from '../src/measure';

describe('Measurement', () => {
  it('test_span', () => {
    const measurement = new Measurement(10, 100);
    expect(measurement.span).toBe(90);
  });

  it('test_clamp', () => {
    const measurement = new Measurement(20, 100);
    expect(measurement.clamp(10, 50)).toEqual(new Measurement(20, 50));
    expect(measurement.clamp(30, 50)).toEqual(new Measurement(30, 50));
    expect(measurement.clamp(undefined, 50)).toEqual(new Measurement(20, 50));
    expect(measurement.clamp(30, undefined)).toEqual(new Measurement(30, 100));
    expect(measurement.clamp(undefined, undefined)).toEqual(new Measurement(20, 100));
  });

  // TODO: These tests require Console to be implemented first
  // Uncomment after console module is ported

  // it('test_no_renderable', () => {
  //   const console = new Console();
  //   const text = new Text();
  //   expect(() => {
  //     Measurement.get(console, console.options, null);
  //   }).toThrow(NotRenderableError);
  // });

  // it('test_measure_renderables', () => {
  //   const console = new Console();
  //   expect(measureRenderables(console, console.options, '')).toEqual(new Measurement(0, 0));
  //   expect(
  //     measureRenderables(console, console.options.updateWidth(0), 'hello')
  //   ).toEqual(new Measurement(0, 0));
  // });
});
