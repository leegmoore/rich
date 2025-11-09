import { describe, expect, it } from 'vitest';
import { Palette } from '../src/palette';
import { Table } from '../src/table';

describe('Palette', () => {
  const colors: [number, number, number][] = [
    [0, 0, 0],
    [10, 10, 10],
    [255, 255, 255],
  ];

  it('matches exact colors', () => {
    const palette = new Palette(colors);
    expect(palette.match([10, 10, 10])).toBe(1);
  });

  it('matches the closest available color', () => {
    const palette = new Palette(colors);
    expect(palette.match([250, 250, 250])).toBe(2);
  });

  it('provides a Table representation with one row per color', () => {
    const palette = new Palette(colors);
    const table = palette.__rich__();
    expect(table).toBeInstanceOf(Table);
    expect(table.rowCount).toBe(colors.length);
  });

  it('limits the match cache to 1024 entries', () => {
    const palette = new Palette([
      [0, 0, 0],
      [255, 255, 255],
    ]);

    for (let i = 0; i < 1100; i++) {
      const red = i & 0xff;
      const green = (i >> 2) & 0xff;
      const blue = (i >> 4) & 0xff;
      palette.match([red, green, blue]);
    }

    const cacheSize = (palette as unknown as { matchCache: Map<string, number> }).matchCache.size;
    expect(cacheSize).toBeLessThanOrEqual(1024);
  });
});
