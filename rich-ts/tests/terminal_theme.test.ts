import { describe, expect, it } from 'vitest';
import { ColorTriplet } from '../src/color_triplet';
import {
  DEFAULT_TERMINAL_THEME,
  MONOKAI,
  SVG_EXPORT_THEME,
  TerminalTheme,
} from '../src/terminal_theme';

describe('TerminalTheme', () => {
  it('combines normal and bright colors to build the ANSI palette', () => {
    expect(DEFAULT_TERMINAL_THEME.background_color).toEqual(new ColorTriplet(255, 255, 255));
    expect(DEFAULT_TERMINAL_THEME.foreground_color).toEqual(new ColorTriplet(0, 0, 0));
    expect(DEFAULT_TERMINAL_THEME.ansi_colors.length).toBe(16);
    expect(DEFAULT_TERMINAL_THEME.ansi_colors.get(0)).toEqual(new ColorTriplet(0, 0, 0));
    expect(DEFAULT_TERMINAL_THEME.ansi_colors.get(15)).toEqual(new ColorTriplet(255, 255, 255));
  });

  it('duplicates normal colors when bright colors are omitted', () => {
    const baseColors: [number, number, number][] = [
      [2, 4, 6],
      [3, 5, 7],
    ];
    const theme = new TerminalTheme([0, 0, 0], [255, 255, 255], baseColors);

    expect(theme.ansi_colors.length).toBe(baseColors.length * 2);
    expect(theme.ansi_colors.get(0)).toEqual(new ColorTriplet(2, 4, 6));
    expect(theme.ansi_colors.get(2)).toEqual(new ColorTriplet(2, 4, 6));
  });

  it('exports named themes with expected highlights', () => {
    expect(MONOKAI.ansi_colors.get(0)).toEqual(new ColorTriplet(26, 26, 26));
    expect(MONOKAI.ansi_colors.get(11)).toEqual(new ColorTriplet(224, 213, 97));
    expect(SVG_EXPORT_THEME.ansi_colors.length).toBe(16);
  });
});
