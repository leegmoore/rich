import { Color } from './color.js';
import { ColorTriplet } from './color_triplet.js';
import { Style } from './style.js';
import { Table } from './table.js';
import { Text } from './text.js';

/**
 * A palette of available colors.
 */
export class Palette {
  private readonly colors: [number, number, number][];
  private static readonly MATCH_CACHE_LIMIT = 1024;
  private readonly matchCache = new Map<string, number>();

  constructor(colors: [number, number, number][]) {
    this.colors = colors.map(([red, green, blue]) => [red, green, blue]);
  }

  /**
   * Get the color at the given index.
   * @param index - Index of the color.
   */
  get(index: number): ColorTriplet {
    const tuple = this.colors[index];
    if (!tuple) {
      throw new RangeError(`Palette index ${index} out of range`);
    }
    const [red, green, blue] = tuple;
    return new ColorTriplet(red, green, blue);
  }

  /**
   * Get the number of colors in the palette.
   */
  get length(): number {
    return this.colors.length;
  }

  /**
   * Render this palette as a table for debugging.
   */
  __rich__(): Table {
    const table = new Table('index', 'RGB', 'Color', {
      title: 'Palette',
      caption: `${this.colors.length} colors`,
      highlight: true,
      captionJustify: 'right',
    });

    for (const [index, [red, green, blue]] of this.colors.entries()) {
      const text = new Text(
        ' '.repeat(16),
        new Style({ bgcolor: Color.fromRgb(red, green, blue) })
      );
      table.addRow(String(index), `(${red}, ${green}, ${blue})`, text);
    }

    return table;
  }

  /**
   * Find the palette index that best matches the provided color.
   */
  match(color: [number, number, number]): number {
    if (this.colors.length === 0) {
      throw new Error('Palette contains no colors');
    }

    const key = color.join(',');
    const cached = this.getFromCache(key);
    if (cached !== undefined) {
      return cached;
    }

    const [red1, green1, blue1] = color;
    const getColorDistance = (index: number): number => {
      const tuple = this.colors[index];
      if (!tuple) {
        throw new RangeError(`Palette index ${index} out of range`);
      }
      const [red2, green2, blue2] = tuple;
      const redMean = Math.floor((red1 + red2) / 2);
      const red = red1 - red2;
      const green = green1 - green2;
      const blue = blue1 - blue2;
      return Math.sqrt(
        (((512 + redMean) * red * red) >> 8) +
          4 * green * green +
          (((767 - redMean) * blue * blue) >> 8)
      );
    };

    let minIndex = 0;
    let minDistance = getColorDistance(0);
    for (let i = 1; i < this.colors.length; i++) {
      const distance = getColorDistance(i);
      if (distance < minDistance) {
        minDistance = distance;
        minIndex = i;
      }
    }

    this.setCacheEntry(key, minIndex);
    return minIndex;
  }

  private getFromCache(key: string): number | undefined {
    const cached = this.matchCache.get(key);
    if (cached !== undefined) {
      this.matchCache.delete(key);
      this.matchCache.set(key, cached);
    }
    return cached;
  }

  private setCacheEntry(key: string, value: number): void {
    if (this.matchCache.has(key)) {
      this.matchCache.delete(key);
    } else if (this.matchCache.size >= Palette.MATCH_CACHE_LIMIT) {
      const iterator = this.matchCache.keys().next();
      if (!iterator.done) {
        this.matchCache.delete(iterator.value);
      }
    }
    this.matchCache.set(key, value);
  }
}
