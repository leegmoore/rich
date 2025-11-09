import { ColorTriplet } from './color_triplet.js';

/**
 * Convert RGB color to HLS (Hue, Lightness, Saturation).
 * RGB values should be in range 0-1 (normalized).
 * Returns [hue (0-360), lightness (0-1), saturation (0-1)]
 */
function rgbToHls(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const s = max === min ? 0 : l <= 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);

  if (max !== min) {
    if (max === r) {
      h = (g - b) / (max - min) + (g < b ? 6 : 0);
    } else if (max === g) {
      h = (b - r) / (max - min) + 2;
    } else {
      h = (r - g) / (max - min) + 4;
    }
    h /= 6;
  }

  return [h * 360, l, s];
}

/**
 * One of the 4 color systems supported by terminals.
 */
export enum ColorSystem {
  STANDARD = 1,
  EIGHT_BIT = 2,
  TRUECOLOR = 3,
  WINDOWS = 4,
}

/**
 * Type of color stored in Color class.
 */
export enum ColorType {
  DEFAULT = 0,
  STANDARD = 1,
  EIGHT_BIT = 2,
  TRUECOLOR = 3,
  WINDOWS = 4,
}

/**
 * A palette of available colors.
 */
class Palette {
  constructor(private readonly colors: [number, number, number][]) {}

  get(index: number): ColorTriplet {
    const color = this.colors[index] ?? [0, 0, 0];
    return new ColorTriplet(color[0], color[1], color[2]);
  }

  /**
   * Find a color from a palette that most closely matches a given color.
   */
  private matchCache = new Map<string, number>();

  match(color: [number, number, number]): number {
    const key = color.join(',');
    if (this.matchCache.has(key)) {
      return this.matchCache.get(key)!;
    }

    const [red1, green1, blue1] = color;

    const getColorDistance = (index: number): number => {
      const color2 = this.colors[index] ?? [0, 0, 0];
      const [red2, green2, blue2] = color2;
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

    this.matchCache.set(key, minIndex);
    return minIndex;
  }
}

// Windows palette (16 colors)
const WINDOWS_PALETTE = new Palette([
  [12, 12, 12],
  [197, 15, 31],
  [19, 161, 14],
  [193, 156, 0],
  [0, 55, 218],
  [136, 23, 152],
  [58, 150, 221],
  [204, 204, 204],
  [118, 118, 118],
  [231, 72, 86],
  [22, 198, 12],
  [249, 241, 165],
  [59, 120, 255],
  [180, 0, 158],
  [97, 214, 214],
  [242, 242, 242],
]);

// Standard ANSI palette (16 colors)
// Used for downgrade matching - from Python Rich STANDARD_PALETTE
const STANDARD_PALETTE = new Palette([
  [0, 0, 0],
  [170, 0, 0],
  [0, 170, 0],
  [170, 85, 0],
  [0, 0, 170],
  [170, 0, 170],
  [0, 170, 170],
  [170, 170, 170],
  [85, 85, 85],
  [255, 85, 85],
  [85, 255, 85],
  [255, 255, 85],
  [85, 85, 255],
  [255, 85, 255],
  [85, 255, 255],
  [255, 255, 255],
]);

// Default terminal theme ANSI colors (16 colors)
// Used for getTruecolor() - from Python Rich DEFAULT_TERMINAL_THEME
const DEFAULT_TERMINAL_THEME_ANSI_COLORS = new Palette([
  [0, 0, 0],
  [128, 0, 0],
  [0, 128, 0],
  [128, 128, 0],
  [0, 0, 128],
  [128, 0, 128],
  [0, 128, 128],
  [192, 192, 192],
  [128, 128, 128],
  [255, 0, 0],
  [0, 255, 0],
  [255, 255, 0],
  [0, 0, 255],
  [255, 0, 255],
  [0, 255, 255],
  [255, 255, 255],
]);

// The 256 color palette
const EIGHT_BIT_PALETTE = new Palette([
  [0, 0, 0],
  [128, 0, 0],
  [0, 128, 0],
  [128, 128, 0],
  [0, 0, 128],
  [128, 0, 128],
  [0, 128, 128],
  [192, 192, 192],
  [128, 128, 128],
  [255, 0, 0],
  [0, 255, 0],
  [255, 255, 0],
  [0, 0, 255],
  [255, 0, 255],
  [0, 255, 255],
  [255, 255, 255],
  [0, 0, 0],
  [0, 0, 95],
  [0, 0, 135],
  [0, 0, 175],
  [0, 0, 215],
  [0, 0, 255],
  [0, 95, 0],
  [0, 95, 95],
  [0, 95, 135],
  [0, 95, 175],
  [0, 95, 215],
  [0, 95, 255],
  [0, 135, 0],
  [0, 135, 95],
  [0, 135, 135],
  [0, 135, 175],
  [0, 135, 215],
  [0, 135, 255],
  [0, 175, 0],
  [0, 175, 95],
  [0, 175, 135],
  [0, 175, 175],
  [0, 175, 215],
  [0, 175, 255],
  [0, 215, 0],
  [0, 215, 95],
  [0, 215, 135],
  [0, 215, 175],
  [0, 215, 215],
  [0, 215, 255],
  [0, 255, 0],
  [0, 255, 95],
  [0, 255, 135],
  [0, 255, 175],
  [0, 255, 215],
  [0, 255, 255],
  [95, 0, 0],
  [95, 0, 95],
  [95, 0, 135],
  [95, 0, 175],
  [95, 0, 215],
  [95, 0, 255],
  [95, 95, 0],
  [95, 95, 95],
  [95, 95, 135],
  [95, 95, 175],
  [95, 95, 215],
  [95, 95, 255],
  [95, 135, 0],
  [95, 135, 95],
  [95, 135, 135],
  [95, 135, 175],
  [95, 135, 215],
  [95, 135, 255],
  [95, 175, 0],
  [95, 175, 95],
  [95, 175, 135],
  [95, 175, 175],
  [95, 175, 215],
  [95, 175, 255],
  [95, 215, 0],
  [95, 215, 95],
  [95, 215, 135],
  [95, 215, 175],
  [95, 215, 215],
  [95, 215, 255],
  [95, 255, 0],
  [95, 255, 95],
  [95, 255, 135],
  [95, 255, 175],
  [95, 255, 215],
  [95, 255, 255],
  [135, 0, 0],
  [135, 0, 95],
  [135, 0, 135],
  [135, 0, 175],
  [135, 0, 215],
  [135, 0, 255],
  [135, 95, 0],
  [135, 95, 95],
  [135, 95, 135],
  [135, 95, 175],
  [135, 95, 215],
  [135, 95, 255],
  [135, 135, 0],
  [135, 135, 95],
  [135, 135, 135],
  [135, 135, 175],
  [135, 135, 215],
  [135, 135, 255],
  [135, 175, 0],
  [135, 175, 95],
  [135, 175, 135],
  [135, 175, 175],
  [135, 175, 215],
  [135, 175, 255],
  [135, 215, 0],
  [135, 215, 95],
  [135, 215, 135],
  [135, 215, 175],
  [135, 215, 215],
  [135, 215, 255],
  [135, 255, 0],
  [135, 255, 95],
  [135, 255, 135],
  [135, 255, 175],
  [135, 255, 215],
  [135, 255, 255],
  [175, 0, 0],
  [175, 0, 95],
  [175, 0, 135],
  [175, 0, 175],
  [175, 0, 215],
  [175, 0, 255],
  [175, 95, 0],
  [175, 95, 95],
  [175, 95, 135],
  [175, 95, 175],
  [175, 95, 215],
  [175, 95, 255],
  [175, 135, 0],
  [175, 135, 95],
  [175, 135, 135],
  [175, 135, 175],
  [175, 135, 215],
  [175, 135, 255],
  [175, 175, 0],
  [175, 175, 95],
  [175, 175, 135],
  [175, 175, 175],
  [175, 175, 215],
  [175, 175, 255],
  [175, 215, 0],
  [175, 215, 95],
  [175, 215, 135],
  [175, 215, 175],
  [175, 215, 215],
  [175, 215, 255],
  [175, 255, 0],
  [175, 255, 95],
  [175, 255, 135],
  [175, 255, 175],
  [175, 255, 215],
  [175, 255, 255],
  [215, 0, 0],
  [215, 0, 95],
  [215, 0, 135],
  [215, 0, 175],
  [215, 0, 215],
  [215, 0, 255],
  [215, 95, 0],
  [215, 95, 95],
  [215, 95, 135],
  [215, 95, 175],
  [215, 95, 215],
  [215, 95, 255],
  [215, 135, 0],
  [215, 135, 95],
  [215, 135, 135],
  [215, 135, 175],
  [215, 135, 215],
  [215, 135, 255],
  [215, 175, 0],
  [215, 175, 95],
  [215, 175, 135],
  [215, 175, 175],
  [215, 175, 215],
  [215, 175, 255],
  [215, 215, 0],
  [215, 215, 95],
  [215, 215, 135],
  [215, 215, 175],
  [215, 215, 215],
  [215, 215, 255],
  [215, 255, 0],
  [215, 255, 95],
  [215, 255, 135],
  [215, 255, 175],
  [215, 255, 215],
  [215, 255, 255],
  [255, 0, 0],
  [255, 0, 95],
  [255, 0, 135],
  [255, 0, 175],
  [255, 0, 215],
  [255, 0, 255],
  [255, 95, 0],
  [255, 95, 95],
  [255, 95, 135],
  [255, 95, 175],
  [255, 95, 215],
  [255, 95, 255],
  [255, 135, 0],
  [255, 135, 95],
  [255, 135, 135],
  [255, 135, 175],
  [255, 135, 215],
  [255, 135, 255],
  [255, 175, 0],
  [255, 175, 95],
  [255, 175, 135],
  [255, 175, 175],
  [255, 175, 215],
  [255, 175, 255],
  [255, 215, 0],
  [255, 215, 95],
  [255, 215, 135],
  [255, 215, 175],
  [255, 215, 215],
  [255, 215, 255],
  [255, 255, 0],
  [255, 255, 95],
  [255, 255, 135],
  [255, 255, 175],
  [255, 255, 215],
  [255, 255, 255],
  [8, 8, 8],
  [18, 18, 18],
  [28, 28, 28],
  [38, 38, 38],
  [48, 48, 48],
  [58, 58, 58],
  [68, 68, 68],
  [78, 78, 78],
  [88, 88, 88],
  [98, 98, 98],
  [108, 108, 108],
  [118, 118, 118],
  [128, 128, 128],
  [138, 138, 138],
  [148, 148, 148],
  [158, 158, 158],
  [168, 168, 168],
  [178, 178, 178],
  [188, 188, 188],
  [198, 198, 198],
  [208, 208, 208],
  [218, 218, 218],
  [228, 228, 228],
  [238, 238, 238],
]);

// ANSI color names mapped to their color numbers
const ANSI_COLOR_NAMES: Record<string, number> = {
  black: 0,
  red: 1,
  green: 2,
  yellow: 3,
  blue: 4,
  magenta: 5,
  cyan: 6,
  white: 7,
  bright_black: 8,
  bright_red: 9,
  bright_green: 10,
  bright_yellow: 11,
  bright_blue: 12,
  bright_magenta: 13,
  bright_cyan: 14,
  bright_white: 15,
  grey0: 16,
  gray0: 16,
  navy_blue: 17,
  dark_blue: 18,
  blue3: 20,
  blue1: 21,
  dark_green: 22,
  deep_sky_blue4: 25,
  dodger_blue3: 26,
  dodger_blue2: 27,
  green4: 28,
  spring_green4: 29,
  turquoise4: 30,
  deep_sky_blue3: 32,
  dodger_blue1: 33,
  green3: 40,
  spring_green3: 41,
  dark_cyan: 36,
  light_sea_green: 37,
  deep_sky_blue2: 38,
  deep_sky_blue1: 39,
  spring_green2: 47,
  cyan3: 43,
  dark_turquoise: 44,
  turquoise2: 45,
  green1: 46,
  spring_green1: 48,
  medium_spring_green: 49,
  cyan2: 50,
  cyan1: 51,
  dark_red: 88,
  deep_pink4: 125,
  purple4: 55,
  purple3: 56,
  blue_violet: 57,
  orange4: 94,
  grey37: 59,
  gray37: 59,
  medium_purple4: 60,
  slate_blue3: 62,
  royal_blue1: 63,
  chartreuse4: 64,
  dark_sea_green4: 71,
  pale_turquoise4: 66,
  steel_blue: 67,
  steel_blue3: 68,
  cornflower_blue: 69,
  chartreuse3: 76,
  cadet_blue: 73,
  sky_blue3: 74,
  steel_blue1: 81,
  pale_green3: 114,
  sea_green3: 78,
  aquamarine3: 79,
  medium_turquoise: 80,
  chartreuse2: 112,
  sea_green2: 83,
  sea_green1: 85,
  aquamarine1: 122,
  dark_slate_gray2: 87,
  dark_magenta: 91,
  dark_violet: 128,
  purple: 129,
  light_pink4: 95,
  plum4: 96,
  medium_purple3: 98,
  slate_blue1: 99,
  yellow4: 106,
  wheat4: 101,
  grey53: 102,
  gray53: 102,
  light_slate_grey: 103,
  light_slate_gray: 103,
  medium_purple: 104,
  light_slate_blue: 105,
  dark_olive_green3: 149,
  dark_sea_green: 108,
  light_sky_blue3: 110,
  sky_blue2: 111,
  dark_sea_green3: 150,
  dark_slate_gray3: 116,
  sky_blue1: 117,
  chartreuse1: 118,
  light_green: 120,
  pale_green1: 156,
  dark_slate_gray1: 123,
  red3: 160,
  medium_violet_red: 126,
  magenta3: 164,
  dark_orange3: 166,
  indian_red: 167,
  hot_pink3: 168,
  medium_orchid3: 133,
  medium_orchid: 134,
  medium_purple2: 140,
  dark_goldenrod: 136,
  light_salmon3: 173,
  rosy_brown: 138,
  grey63: 139,
  gray63: 139,
  medium_purple1: 141,
  gold3: 178,
  dark_khaki: 143,
  navajo_white3: 144,
  grey69: 145,
  gray69: 145,
  light_steel_blue3: 146,
  light_steel_blue: 147,
  yellow3: 184,
  dark_sea_green2: 157,
  light_cyan3: 152,
  light_sky_blue1: 153,
  green_yellow: 154,
  dark_olive_green2: 155,
  dark_sea_green1: 193,
  pale_turquoise1: 159,
  deep_pink3: 162,
  magenta2: 200,
  hot_pink2: 169,
  orchid: 170,
  medium_orchid1: 207,
  orange3: 172,
  light_pink3: 174,
  pink3: 175,
  plum3: 176,
  violet: 177,
  light_goldenrod3: 179,
  tan: 180,
  misty_rose3: 181,
  thistle3: 182,
  plum2: 183,
  khaki3: 185,
  light_goldenrod2: 222,
  light_yellow3: 187,
  grey84: 188,
  gray84: 188,
  light_steel_blue1: 189,
  yellow2: 190,
  dark_olive_green1: 192,
  honeydew2: 194,
  light_cyan1: 195,
  red1: 196,
  deep_pink2: 197,
  deep_pink1: 199,
  magenta1: 201,
  orange_red1: 202,
  indian_red1: 204,
  hot_pink: 206,
  dark_orange: 208,
  salmon1: 209,
  light_coral: 210,
  pale_violet_red1: 211,
  orchid2: 212,
  orchid1: 213,
  orange1: 214,
  sandy_brown: 215,
  light_salmon1: 216,
  light_pink1: 217,
  pink1: 218,
  plum1: 219,
  gold1: 220,
  navajo_white1: 223,
  misty_rose1: 224,
  thistle1: 225,
  yellow1: 226,
  light_goldenrod1: 227,
  khaki1: 228,
  wheat1: 229,
  cornsilk1: 230,
  grey100: 231,
  gray100: 231,
  grey3: 232,
  gray3: 232,
  grey7: 233,
  gray7: 233,
  grey11: 234,
  gray11: 234,
  grey15: 235,
  gray15: 235,
  grey19: 236,
  gray19: 236,
  grey23: 237,
  gray23: 237,
  grey27: 238,
  gray27: 238,
  grey30: 239,
  gray30: 239,
  grey35: 240,
  gray35: 240,
  grey39: 241,
  gray39: 241,
  grey42: 242,
  gray42: 242,
  grey46: 243,
  gray46: 243,
  grey50: 244,
  gray50: 244,
  grey54: 245,
  gray54: 245,
  grey58: 246,
  gray58: 246,
  grey62: 247,
  gray62: 247,
  grey66: 248,
  gray66: 248,
  grey70: 249,
  gray70: 249,
  grey74: 250,
  gray74: 250,
  grey78: 251,
  gray78: 251,
  grey82: 252,
  gray82: 252,
  grey85: 253,
  gray85: 253,
  grey89: 254,
  gray89: 254,
  grey93: 255,
  gray93: 255,
};

/**
 * The color could not be parsed.
 */
export class ColorParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ColorParseError';
    Object.setPrototypeOf(this, ColorParseError.prototype);
  }
}

// Regex for parsing color formats
const RE_COLOR = /^#([0-9a-f]{6})$|^color\(([0-9]{1,3})\)$|^rgb\(([\d\s,]+)\)$/i;

/**
 * Parse a 6-character hex string to RGB triplet.
 */
export function parseRgbHex(hexColor: string): ColorTriplet {
  const red = parseInt(hexColor.slice(0, 2), 16);
  const green = parseInt(hexColor.slice(2, 4), 16);
  const blue = parseInt(hexColor.slice(4, 6), 16);
  return new ColorTriplet(red, green, blue);
}

/**
 * Blend two RGB colors with linear interpolation.
 */
export function blendRgb(
  color1: ColorTriplet,
  color2: ColorTriplet,
  crossFade: number = 0.5
): ColorTriplet {
  const red = Math.floor(color1.red + (color2.red - color1.red) * crossFade);
  const green = Math.floor(color1.green + (color2.green - color1.green) * crossFade);
  const blue = Math.floor(color1.blue + (color2.blue - color1.blue) * crossFade);
  return new ColorTriplet(red, green, blue);
}

/**
 * Get string representation of ColorType enum value.
 */
function colorTypeToString(type: ColorType): string {
  return `ColorType.${ColorType[type]}`;
}

/**
 * Terminal color definition.
 */
export class Color {
  constructor(
    public readonly name: string,
    public readonly type: ColorType,
    public readonly number?: number,
    public readonly triplet?: ColorTriplet
  ) {}

  /**
   * Get the color system for this color.
   */
  get system(): ColorSystem {
    if (this.type === ColorType.DEFAULT || this.type === ColorType.STANDARD) {
      return ColorSystem.STANDARD;
    }
    if (this.type === ColorType.EIGHT_BIT) {
      return ColorSystem.EIGHT_BIT;
    }
    if (this.type === ColorType.WINDOWS) {
      return ColorSystem.WINDOWS;
    }
    return ColorSystem.TRUECOLOR;
  }

  /**
   * Check if color is system defined.
   */
  get isSystemDefined(): boolean {
    return this.type === ColorType.DEFAULT || this.type === ColorType.STANDARD;
  }

  /**
   * Check if color is the default terminal color.
   */
  get isDefault(): boolean {
    return this.type === ColorType.DEFAULT;
  }

  /**
   * Get string representation.
   */
  toString(): string {
    const numberPart = this.number !== undefined ? `, number=${this.number}` : '';
    return `Color('${this.name}', ${colorTypeToString(this.type)}${numberPart})`;
  }

  /**
   * Get RGB triplet for this color.
   */
  getTruecolor(foreground: boolean = true): ColorTriplet {
    if (this.triplet) {
      return this.triplet;
    }
    if (this.type === ColorType.DEFAULT) {
      return foreground ? new ColorTriplet(0, 0, 0) : new ColorTriplet(255, 255, 255);
    }
    if (this.type === ColorType.WINDOWS) {
      return WINDOWS_PALETTE.get(this.number!);
    }
    if (this.type === ColorType.STANDARD) {
      return DEFAULT_TERMINAL_THEME_ANSI_COLORS.get(this.number!);
    }
    if (this.type === ColorType.EIGHT_BIT) {
      return EIGHT_BIT_PALETTE.get(this.number!);
    }
    return new ColorTriplet(0, 0, 0);
  }

  /**
   * Get ANSI escape codes for this color.
   */
  getAnsiCodes(foreground: boolean = true): string[] {
    if (this.type === ColorType.DEFAULT) {
      return [foreground ? '39' : '49'];
    }
    if (this.type === ColorType.STANDARD || this.type === ColorType.WINDOWS) {
      const number = this.number ?? 0;
      if (number < 8) {
        return [String(foreground ? 30 + number : 40 + number)];
      }
      return [String(foreground ? 82 + number : 92 + number)];
    }
    if (this.type === ColorType.EIGHT_BIT) {
      return [foreground ? '38' : '48', '5', String(this.number ?? 0)];
    }
    // TRUECOLOR
    const triplet = this.triplet ?? new ColorTriplet(0, 0, 0);
    return [
      foreground ? '38' : '48',
      '2',
      String(triplet.red),
      String(triplet.green),
      String(triplet.blue),
    ];
  }

  /**
   * Downgrade a color to a simpler color system.
   */
  downgrade(system: ColorSystem): Color {
    if (this.type === ColorType.DEFAULT) {
      return this;
    }

    // Already at target system or simpler
    if (this.type === ColorType.STANDARD || this.type === ColorType.WINDOWS) {
      if (system === ColorSystem.WINDOWS && this.type === ColorType.STANDARD) {
        return new Color(this.name, ColorType.WINDOWS, this.number, this.triplet);
      }
      if (system === ColorSystem.STANDARD && this.type === ColorType.WINDOWS) {
        return new Color(this.name, ColorType.STANDARD, this.number, this.triplet);
      }
      return this;
    }

    if (this.type === ColorType.EIGHT_BIT) {
      if (system === ColorSystem.EIGHT_BIT || system === ColorSystem.TRUECOLOR) {
        return this;
      }
      // Downgrade EIGHT_BIT to STANDARD/WINDOWS
      const targetPalette = system === ColorSystem.WINDOWS ? WINDOWS_PALETTE : STANDARD_PALETTE;
      const triplet = EIGHT_BIT_PALETTE.get(this.number ?? 0);
      const number = targetPalette.match([triplet.red, triplet.green, triplet.blue]);
      const targetType = system === ColorSystem.WINDOWS ? ColorType.WINDOWS : ColorType.STANDARD;
      return new Color(this.name, targetType, number, undefined);
    }

    // TRUECOLOR downgrade
    const triplet = this.triplet ?? new ColorTriplet(0, 0, 0);

    if (system === ColorSystem.EIGHT_BIT) {
      // Use Python's algorithm: convert to HLS and check saturation for grayscale
      const [red, green, blue] = [triplet.red, triplet.green, triplet.blue];
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_h, l, s] = rgbToHls(red / 255, green / 255, blue / 255);

      // If saturation is under 15%, treat as grayscale
      if (s < 0.15) {
        const gray = Math.round(l * 25);
        let colorNumber: number;
        if (gray === 0) {
          colorNumber = 16;
        } else if (gray === 25) {
          colorNumber = 231;
        } else {
          colorNumber = 231 + gray;
        }
        return new Color(this.name, ColorType.EIGHT_BIT, colorNumber, undefined);
      }

      // Use 6x6x6 color cube (colors 16-231)
      // Python algorithm: map RGB (0-255) to 6 levels (0-5)
      const sixRed = red < 95 ? red / 95 : 1 + (red - 95) / 40;
      const sixGreen = green < 95 ? green / 95 : 1 + (green - 95) / 40;
      const sixBlue = blue < 95 ? blue / 95 : 1 + (blue - 95) / 40;

      const colorNumber =
        16 + 36 * Math.round(sixRed) + 6 * Math.round(sixGreen) + Math.round(sixBlue);
      return new Color(this.name, ColorType.EIGHT_BIT, colorNumber, undefined);
    }

    if (system === ColorSystem.STANDARD) {
      const number = STANDARD_PALETTE.match([triplet.red, triplet.green, triplet.blue]);
      return new Color(this.name, ColorType.STANDARD, number, undefined);
    }

    if (system === ColorSystem.WINDOWS) {
      const number = WINDOWS_PALETTE.match([triplet.red, triplet.green, triplet.blue]);
      return new Color(this.name, ColorType.WINDOWS, number, undefined);
    }

    return this;
  }

  /**
   * Parse a color from a string.
   */
  private static parseCache = new Map<string, Color>();

  static parse(colorString: string): Color {
    // Check cache
    if (this.parseCache.has(colorString)) {
      return this.parseCache.get(colorString)!;
    }

    const original = colorString;
    colorString = colorString.toLowerCase().trim();

    // Check for "default"
    if (colorString === 'default') {
      const color = new Color('default', ColorType.DEFAULT, undefined, undefined);
      this.parseCache.set(original, color);
      return color;
    }

    // Check named colors
    if (colorString in ANSI_COLOR_NAMES) {
      const number = ANSI_COLOR_NAMES[colorString]!;
      const colorType = number < 16 ? ColorType.STANDARD : ColorType.EIGHT_BIT;
      const color = new Color(colorString, colorType, number, undefined);
      this.parseCache.set(original, color);
      return color;
    }

    // Try regex parsing
    const match = colorString.match(RE_COLOR);
    if (match) {
      // Hex color
      if (match[1]) {
        const triplet = parseRgbHex(match[1]);
        const color = new Color(original, ColorType.TRUECOLOR, undefined, triplet);
        this.parseCache.set(original, color);
        return color;
      }

      // color(N) format
      if (match[2]) {
        const number = parseInt(match[2], 10);
        if (number < 0 || number > 255) {
          throw new ColorParseError(`Color number must be in range 0-255, got ${number}`);
        }
        const colorType = number < 16 ? ColorType.STANDARD : ColorType.EIGHT_BIT;
        const color = new Color(original, colorType, number, undefined);
        this.parseCache.set(original, color);
        return color;
      }

      // rgb(R,G,B) format
      if (match[3]) {
        const components = match[3]
          .split(',')
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !isNaN(n));
        if (components.length !== 3) {
          throw new ColorParseError(`RGB format must have exactly 3 components: ${original}`);
        }
        const red = components[0]!;
        const green = components[1]!;
        const blue = components[2]!;
        if (red < 0 || red > 255 || green < 0 || green > 255 || blue < 0 || blue > 255) {
          throw new ColorParseError(`RGB components must be in range 0-255: ${original}`);
        }
        const triplet = new ColorTriplet(red, green, blue);
        const color = new Color(original, ColorType.TRUECOLOR, undefined, triplet);
        this.parseCache.set(original, color);
        return color;
      }
    }

    throw new ColorParseError(`Unable to parse color: ${original}`);
  }

  /**
   * Create a Color from an ANSI color number.
   */
  static fromAnsi(number: number): Color {
    const colorType = number < 16 ? ColorType.STANDARD : ColorType.EIGHT_BIT;
    return new Color(`color(${number})`, colorType, number);
  }

  /**
   * Create a Color from RGB values.
   */
  static fromRgb(red: number, green: number, blue: number): Color {
    const triplet = new ColorTriplet(red, green, blue);
    return new Color(triplet.hex, ColorType.TRUECOLOR, undefined, triplet);
  }

  /**
   * Create a Color from a ColorTriplet.
   */
  static fromTriplet(triplet: ColorTriplet): Color {
    return new Color(triplet.hex, ColorType.TRUECOLOR, undefined, triplet);
  }

  /**
   * Create the default terminal color.
   */
  static default(): Color {
    return new Color('default', ColorType.DEFAULT, undefined, undefined);
  }
}
