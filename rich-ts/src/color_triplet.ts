/**
 * Represents an RGB color triplet with red, green, and blue components.
 */
export class ColorTriplet {
  /**
   * Creates a new ColorTriplet.
   * @param red - Red component (0-255)
   * @param green - Green component (0-255)
   * @param blue - Blue component (0-255)
   */
  constructor(
    public readonly red: number,
    public readonly green: number,
    public readonly blue: number
  ) {
    if (red < 0 || red > 255) {
      throw new Error(`red must be in range 0-255, got ${red}`);
    }
    if (green < 0 || green > 255) {
      throw new Error(`green must be in range 0-255, got ${green}`);
    }
    if (blue < 0 || blue > 255) {
      throw new Error(`blue must be in range 0-255, got ${blue}`);
    }
  }

  /**
   * Get the color triplet in CSS hex format.
   * @returns Hex color string like "#ffffff"
   */
  get hex(): string {
    const redHex = this.red.toString(16).padStart(2, '0');
    const greenHex = this.green.toString(16).padStart(2, '0');
    const blueHex = this.blue.toString(16).padStart(2, '0');
    return `#${redHex}${greenHex}${blueHex}`;
  }

  /**
   * Get the color in RGB format.
   * @returns RGB string like "rgb(255,255,255)"
   */
  get rgb(): string {
    return `rgb(${this.red},${this.green},${this.blue})`;
  }

  /**
   * Convert color components to normalized floats between 0 and 1.
   * @returns Array of three normalized color components [r, g, b]
   */
  get normalized(): [number, number, number] {
    return [this.red / 255.0, this.green / 255.0, this.blue / 255.0];
  }
}
