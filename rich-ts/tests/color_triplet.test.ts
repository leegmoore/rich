import { describe, it, expect } from 'vitest';
import { ColorTriplet } from '../src/color_triplet';

describe('ColorTriplet', () => {
  it('test_hex', () => {
    expect(new ColorTriplet(255, 255, 255).hex).toBe('#ffffff');
    expect(new ColorTriplet(0, 255, 0).hex).toBe('#00ff00');
  });

  it('test_rgb', () => {
    expect(new ColorTriplet(255, 255, 255).rgb).toBe('rgb(255,255,255)');
    expect(new ColorTriplet(0, 255, 0).rgb).toBe('rgb(0,255,0)');
  });

  it('test_normalized', () => {
    expect(new ColorTriplet(255, 255, 255).normalized).toEqual([1.0, 1.0, 1.0]);
    expect(new ColorTriplet(0, 255, 0).normalized).toEqual([0.0, 1.0, 0.0]);
  });
});
