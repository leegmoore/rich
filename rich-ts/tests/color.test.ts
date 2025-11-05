import { describe, it, expect } from 'vitest';
import {
  Color,
  ColorParseError,
  ColorSystem,
  ColorType,
  blendRgb,
  parseRgbHex,
} from '../src/color';
import { ColorTriplet } from '../src/color_triplet';

describe('Color', () => {
  it('test_str', () => {
    expect(Color.parse('red').toString()).toBe("Color('red', ColorType.STANDARD, number=1)");
  });

  it('test_repr', () => {
    expect(Color.parse('red').toString()).toBe("Color('red', ColorType.STANDARD, number=1)");
  });

  it('test_color_system_repr', () => {
    // Note: In TS enum values don't have toString() like Python repr
    // We just test the enum value itself
    expect(ColorSystem.EIGHT_BIT).toBe(2);
  });

  it('test_system', () => {
    expect(Color.parse('default').system).toBe(ColorSystem.STANDARD);
    expect(Color.parse('red').system).toBe(ColorSystem.STANDARD);
    expect(Color.parse('#ff0000').system).toBe(ColorSystem.TRUECOLOR);
  });

  it('test_windows', () => {
    expect(new Color('red', ColorType.WINDOWS, 1).getAnsiCodes()).toEqual(['31']);
  });

  it('test_truecolor', () => {
    expect(Color.parse('#ff0000').getTruecolor()).toEqual(new ColorTriplet(255, 0, 0));
    expect(Color.parse('red').getTruecolor()).toEqual(new ColorTriplet(128, 0, 0));
    expect(Color.parse('color(1)').getTruecolor()).toEqual(new ColorTriplet(128, 0, 0));
    expect(Color.parse('color(17)').getTruecolor()).toEqual(new ColorTriplet(0, 0, 95));
    expect(Color.parse('default').getTruecolor()).toEqual(new ColorTriplet(0, 0, 0));
    expect(Color.parse('default').getTruecolor(false)).toEqual(new ColorTriplet(255, 255, 255));
    expect(new Color('red', ColorType.WINDOWS, 1).getTruecolor()).toEqual(
      new ColorTriplet(197, 15, 31)
    );
  });

  it('test_parse_success', () => {
    expect(Color.parse('default')).toEqual(
      new Color('default', ColorType.DEFAULT, undefined, undefined)
    );
    expect(Color.parse('red')).toEqual(new Color('red', ColorType.STANDARD, 1, undefined));
    expect(Color.parse('bright_red')).toEqual(
      new Color('bright_red', ColorType.STANDARD, 9, undefined)
    );
    expect(Color.parse('yellow4')).toEqual(
      new Color('yellow4', ColorType.EIGHT_BIT, 106, undefined)
    );
    expect(Color.parse('color(100)')).toEqual(
      new Color('color(100)', ColorType.EIGHT_BIT, 100, undefined)
    );
    expect(Color.parse('#112233')).toEqual(
      new Color('#112233', ColorType.TRUECOLOR, undefined, new ColorTriplet(0x11, 0x22, 0x33))
    );
    expect(Color.parse('rgb(90,100,110)')).toEqual(
      new Color('rgb(90,100,110)', ColorType.TRUECOLOR, undefined, new ColorTriplet(90, 100, 110))
    );
  });

  it('test_from_triplet', () => {
    expect(Color.fromTriplet(new ColorTriplet(0x10, 0x20, 0x30))).toEqual(
      new Color('#102030', ColorType.TRUECOLOR, undefined, new ColorTriplet(0x10, 0x20, 0x30))
    );
  });

  it('test_from_rgb', () => {
    expect(Color.fromRgb(0x10, 0x20, 0x30)).toEqual(
      new Color('#102030', ColorType.TRUECOLOR, undefined, new ColorTriplet(0x10, 0x20, 0x30))
    );
  });

  it('test_from_ansi', () => {
    expect(Color.fromAnsi(1)).toEqual(new Color('color(1)', ColorType.STANDARD, 1));
  });

  it('test_default', () => {
    expect(Color.default()).toEqual(new Color('default', ColorType.DEFAULT, undefined, undefined));
  });

  it('test_parse_error', () => {
    expect(() => Color.parse('256')).toThrow(ColorParseError);
    expect(() => Color.parse('color(256)')).toThrow(ColorParseError);
    expect(() => Color.parse('rgb(999,0,0)')).toThrow(ColorParseError);
    expect(() => Color.parse('rgb(0,0)')).toThrow(ColorParseError);
    expect(() => Color.parse('rgb(0,0,0,0)')).toThrow(ColorParseError);
    expect(() => Color.parse('nosuchcolor')).toThrow(ColorParseError);
    expect(() => Color.parse('#xxyyzz')).toThrow(ColorParseError);
  });

  it('test_get_ansi_codes', () => {
    expect(Color.parse('default').getAnsiCodes()).toEqual(['39']);
    expect(Color.parse('default').getAnsiCodes(false)).toEqual(['49']);
    expect(Color.parse('red').getAnsiCodes()).toEqual(['31']);
    expect(Color.parse('red').getAnsiCodes(false)).toEqual(['41']);
    expect(Color.parse('color(1)').getAnsiCodes()).toEqual(['31']);
    expect(Color.parse('color(1)').getAnsiCodes(false)).toEqual(['41']);
    expect(Color.parse('#ff0000').getAnsiCodes()).toEqual(['38', '2', '255', '0', '0']);
    expect(Color.parse('#ff0000').getAnsiCodes(false)).toEqual(['48', '2', '255', '0', '0']);
  });

  it('test_downgrade', () => {
    expect(Color.parse('color(9)').downgrade(ColorSystem.STANDARD)).toEqual(
      new Color('color(9)', ColorType.STANDARD, 9, undefined)
    );

    expect(Color.parse('#000000').downgrade(ColorSystem.EIGHT_BIT)).toEqual(
      new Color('#000000', ColorType.EIGHT_BIT, 16, undefined)
    );

    expect(Color.parse('#ffffff').downgrade(ColorSystem.EIGHT_BIT)).toEqual(
      new Color('#ffffff', ColorType.EIGHT_BIT, 231, undefined)
    );

    expect(Color.parse('#404142').downgrade(ColorSystem.EIGHT_BIT)).toEqual(
      new Color('#404142', ColorType.EIGHT_BIT, 237, undefined)
    );

    expect(Color.parse('#ff0000').downgrade(ColorSystem.EIGHT_BIT)).toEqual(
      new Color('#ff0000', ColorType.EIGHT_BIT, 196, undefined)
    );

    expect(Color.parse('#ff0000').downgrade(ColorSystem.STANDARD)).toEqual(
      new Color('#ff0000', ColorType.STANDARD, 1, undefined)
    );

    expect(Color.parse('color(9)').downgrade(ColorSystem.STANDARD)).toEqual(
      new Color('color(9)', ColorType.STANDARD, 9, undefined)
    );

    expect(Color.parse('color(20)').downgrade(ColorSystem.STANDARD)).toEqual(
      new Color('color(20)', ColorType.STANDARD, 4, undefined)
    );

    expect(Color.parse('red').downgrade(ColorSystem.WINDOWS)).toEqual(
      new Color('red', ColorType.WINDOWS, 1, undefined)
    );

    expect(Color.parse('bright_red').downgrade(ColorSystem.WINDOWS)).toEqual(
      new Color('bright_red', ColorType.WINDOWS, 9, undefined)
    );

    expect(Color.parse('#ff0000').downgrade(ColorSystem.WINDOWS)).toEqual(
      new Color('#ff0000', ColorType.WINDOWS, 1, undefined)
    );

    expect(Color.parse('color(255)').downgrade(ColorSystem.WINDOWS)).toEqual(
      new Color('color(255)', ColorType.WINDOWS, 15, undefined)
    );

    expect(Color.parse('#00ff00').downgrade(ColorSystem.STANDARD)).toEqual(
      new Color('#00ff00', ColorType.STANDARD, 2, undefined)
    );
  });

  it('test_parse_rgb_hex', () => {
    expect(parseRgbHex('aabbcc')).toEqual(new ColorTriplet(0xaa, 0xbb, 0xcc));
  });

  it('test_blend_rgb', () => {
    expect(blendRgb(new ColorTriplet(10, 20, 30), new ColorTriplet(30, 40, 50))).toEqual(
      new ColorTriplet(20, 30, 40)
    );
  });
});
