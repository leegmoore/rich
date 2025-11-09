import { describe, expect, it } from 'vitest';
import { ColorTriplet } from '../src/color_triplet';
import { EIGHT_BIT_PALETTE, STANDARD_PALETTE, WINDOWS_PALETTE } from '../src/_palettes';

describe('_palettes module', () => {
  it('provides the windows palette with 16 colors', () => {
    expect(WINDOWS_PALETTE.length).toBe(16);
    expect(WINDOWS_PALETTE.get(0)).toEqual(new ColorTriplet(12, 12, 12));
    expect(WINDOWS_PALETTE.get(15)).toEqual(new ColorTriplet(242, 242, 242));
  });

  it('provides the standard ANSI palette', () => {
    expect(STANDARD_PALETTE.length).toBe(16);
    expect(STANDARD_PALETTE.get(0)).toEqual(new ColorTriplet(0, 0, 0));
    expect(STANDARD_PALETTE.get(15)).toEqual(new ColorTriplet(255, 255, 255));
  });

  it('provides the 256-color palette', () => {
    expect(EIGHT_BIT_PALETTE.length).toBe(256);
    expect(EIGHT_BIT_PALETTE.get(16)).toEqual(new ColorTriplet(0, 0, 0));
    expect(EIGHT_BIT_PALETTE.get(255)).toEqual(new ColorTriplet(238, 238, 238));
    expect(EIGHT_BIT_PALETTE.match([238, 238, 238])).toBe(255);
  });
});
