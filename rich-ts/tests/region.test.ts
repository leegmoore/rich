import { describe, it, expect } from 'vitest';
import { Region } from '../src/region.js';

describe('region', () => {
  it('test_region_create', () => {
    const region = new Region(2, 3, 8, 5);
    expect(region.x).toBe(2);
    expect(region.y).toBe(3);
    expect(region.width).toBe(8);
    expect(region.height).toBe(5);
    expect(region.area).toBe(40);
    expect(region.right).toBe(10);
    expect(region.bottom).toBe(8);
  });

  it('test_region_contains', () => {
    const region = new Region(0, 0, 5, 3);
    expect(region.containsPoint(0, 0)).toBe(true);
    expect(region.containsPoint(4, 2)).toBe(true);
    expect(region.containsPoint(5, 2)).toBe(false);
    expect(region.containsPoint(2, 3)).toBe(false);
  });

  it('test_region_intersection', () => {
    const region = new Region(0, 0, 5, 5);
    const other = new Region(2, 2, 5, 5);
    const overlap = region.intersection(other);
    expect(overlap).toBeDefined();
    expect(overlap?.x).toBe(2);
    expect(overlap?.y).toBe(2);
    expect(overlap?.width).toBe(3);
    expect(overlap?.height).toBe(3);

    const disjoint = new Region(10, 10, 2, 2);
    expect(region.intersection(disjoint)).toBeUndefined();
  });

  it('test_region_translate', () => {
    const region = new Region(1, 1, 4, 4);
    const shifted = region.translate(3, -1);
    expect(shifted.x).toBe(4);
    expect(shifted.y).toBe(0);
    expect(shifted.width).toBe(4);
    expect(shifted.height).toBe(4);
  });

  it('test_region_rejects_negative_size', () => {
    expect(() => new Region(0, 0, -1, 1)).toThrow(/width/);
    expect(() => new Region(0, 0, 1, -5)).toThrow(/height/);
  });
});
