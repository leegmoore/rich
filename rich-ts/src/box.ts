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
    const left = level === 'head' ? this.head_row_left :
                 level === 'foot' ? this.foot_row_left : this.row_left;
    const horizontal = level === 'head' ? this.head_row_horizontal :
                       level === 'foot' ? this.foot_row_horizontal : this.row_horizontal;
    const cross = level === 'head' ? this.head_row_cross :
                  level === 'foot' ? this.foot_row_cross : this.row_cross;
    const right = level === 'head' ? this.head_row_right :
                  level === 'foot' ? this.foot_row_right : this.row_right;

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
}

// STUB: Minimal box constants
// TODO Phase 6: Add all box styles (HEAVY, DOUBLE, etc.) with Unicode characters
export const ROUNDED = new Box();
export const HEAVY = new Box();
export const DOUBLE = new Box();
export const SQUARE = new Box();
export const MINIMAL = new Box();
export const SIMPLE = new Box();
export const HORIZONTALS = new Box();
