/**
 * STUB: Box drawing characters
 * TODO: Full implementation in Phase 6 with all box styles
 */

export class Box {
  // STUB: Minimal box with ASCII characters
  // TODO Phase 6: Implement all box properties and methods
  top_left = '+';
  top = '-';
  top_divider = '+';
  top_right = '+';
  head_left = '|';
  head_vertical = '|';
  head_right = '|';
  head_row_left = '+';
  head_row_horizontal = '-';
  head_row_cross = '+';
  head_row_right = '+';
  mid_left = '|';
  mid_vertical = '|';
  mid_right = '|';
  row_left = '+';
  row_horizontal = '-';
  row_cross = '+';
  row_right = '+';
  foot_row_left = '+';
  foot_row_horizontal = '-';
  foot_row_cross = '+';
  foot_row_right = '+';
  foot_left = '|';
  foot_vertical = '|';
  foot_right = '|';
  bottom_left = '+';
  bottom = '-';
  bottom_divider = '+';
  bottom_right = '+';
  ascii = true;

  constructor(_box?: string, _options?: { ascii?: boolean }) {
    // STUB: Ignores box string, uses ASCII
    // TODO Phase 6: Parse box string into properties
  }

  /**
   * Get the top of the box.
   */
  getTop(widths: number[]): string {
    // STUB: Simple ASCII top line
    const parts = [this.top_left];
    for (let i = 0; i < widths.length; i++) {
      parts.push(this.top.repeat(widths[i]!));
      if (i < widths.length - 1) {
        parts.push(this.top_divider);
      }
    }
    parts.push(this.top_right);
    return parts.join('');
  }

  /**
   * Get a row of the box.
   */
  getRow(widths: number[], level: 'head' | 'row' | 'foot' = 'row'): string {
    // STUB: Simple ASCII row separator
    const left =
      level === 'head' ? this.head_row_left : level === 'foot' ? this.foot_row_left : this.row_left;
    const horizontal =
      level === 'head'
        ? this.head_row_horizontal
        : level === 'foot'
          ? this.foot_row_horizontal
          : this.row_horizontal;
    const cross =
      level === 'head'
        ? this.head_row_cross
        : level === 'foot'
          ? this.foot_row_cross
          : this.row_cross;
    const right =
      level === 'head'
        ? this.head_row_right
        : level === 'foot'
          ? this.foot_row_right
          : this.row_right;

    const parts = [left];
    for (let i = 0; i < widths.length; i++) {
      parts.push(horizontal.repeat(widths[i]!));
      if (i < widths.length - 1) {
        parts.push(cross);
      }
    }
    parts.push(right);
    return parts.join('');
  }

  /**
   * Get the bottom of the box.
   */
  getBottom(widths: number[]): string {
    // STUB: Simple ASCII bottom line
    const parts = [this.bottom_left];
    for (let i = 0; i < widths.length; i++) {
      parts.push(this.bottom.repeat(widths[i]!));
      if (i < widths.length - 1) {
        parts.push(this.bottom_divider);
      }
    }
    parts.push(this.bottom_right);
    return parts.join('');
  }

  /**
   * Substitute this box for another if it won't render due to platform issues.
   *
   * STUB: Just returns self for now. Phase 6 will handle platform-specific substitutions.
   */
  substitute(_options: unknown, _safe = true): Box {
    // STUB: No substitution logic - just return self
    return this;
  }

  // CamelCase getters for convenience
  get topLeft(): string {
    return this.top_left;
  }
  get topDivider(): string {
    return this.top_divider;
  }
  get topRight(): string {
    return this.top_right;
  }
  get midLeft(): string {
    return this.mid_left;
  }
  get midRight(): string {
    return this.mid_right;
  }
  get bottomLeft(): string {
    return this.bottom_left;
  }
  get bottomDivider(): string {
    return this.bottom_divider;
  }
  get bottomRight(): string {
    return this.bottom_right;
  }
}

// Box constants with proper characters
// TODO Phase 6: Add more box styles (HEAVY, DOUBLE, etc.)

// Create ROUNDED box with Unicode characters
const ROUNDED_BOX = new Box();
ROUNDED_BOX.top_left = '╭';
ROUNDED_BOX.top = '─';
ROUNDED_BOX.top_divider = '┬';
ROUNDED_BOX.top_right = '╮';
ROUNDED_BOX.head_left = '│';
ROUNDED_BOX.head_vertical = '│';
ROUNDED_BOX.head_right = '│';
ROUNDED_BOX.head_row_left = '├';
ROUNDED_BOX.head_row_horizontal = '─';
ROUNDED_BOX.head_row_cross = '┼';
ROUNDED_BOX.head_row_right = '┤';
ROUNDED_BOX.mid_left = '│';
ROUNDED_BOX.mid_vertical = '│';
ROUNDED_BOX.mid_right = '│';
ROUNDED_BOX.row_left = '├';
ROUNDED_BOX.row_horizontal = '─';
ROUNDED_BOX.row_cross = '┼';
ROUNDED_BOX.row_right = '┤';
ROUNDED_BOX.foot_row_left = '├';
ROUNDED_BOX.foot_row_horizontal = '─';
ROUNDED_BOX.foot_row_cross = '┼';
ROUNDED_BOX.foot_row_right = '┤';
ROUNDED_BOX.foot_left = '│';
ROUNDED_BOX.foot_vertical = '│';
ROUNDED_BOX.foot_right = '│';
ROUNDED_BOX.bottom_left = '╰';
ROUNDED_BOX.bottom = '─';
ROUNDED_BOX.bottom_divider = '┴';
ROUNDED_BOX.bottom_right = '╯';
ROUNDED_BOX.ascii = false;

export const ROUNDED = ROUNDED_BOX;

// STUB: Other box styles (TODO Phase 6)
export const HEAVY = new Box();
export const DOUBLE = new Box();
export const SQUARE = new Box();
export const MINIMAL = new Box();
export const SIMPLE = new Box();
export const HORIZONTALS = new Box();
