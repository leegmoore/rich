/**
 * Terminal control codes for cursor movement, screen clearing, etc.
 *
 * This module provides ANSI escape sequences for controlling terminal behavior.
 */

/**
 * Control code types (ANSI escape sequence types).
 */
export enum ControlType {
  BELL = 1,
  CARRIAGE_RETURN = 2,
  HOME = 3,
  CLEAR = 4,
  ENABLE_ALT_SCREEN = 5,
  DISABLE_ALT_SCREEN = 6,
  SHOW_CURSOR = 7,
  HIDE_CURSOR = 8,
  CURSOR_UP = 9,
  CURSOR_DOWN = 10,
  CURSOR_FORWARD = 11,
  CURSOR_BACKWARD = 12,
  CURSOR_MOVE_TO_COLUMN = 13,
  ERASE_IN_LINE = 14,
  CURSOR_MOVE_TO = 15,
  SET_WINDOW_TITLE = 16,
}

/**
 * Control code with optional parameters.
 * Format: [ControlType, ...parameters]
 */
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type ControlCode = [ControlType] | [ControlType, ...Array<number | string>];

/**
 * A segment of text with optional style and control codes.
 * Simplified version for control module (full version in segment.ts).
 */
export class Segment {
  constructor(
    public readonly text: string,
    public readonly style: unknown,
    public readonly control: ReadonlyArray<ControlCode>,
  ) {}

  equals(other: Segment): boolean {
    return (
      this.text === other.text &&
      this.style === other.style &&
      JSON.stringify(this.control) === JSON.stringify(other.control)
    );
  }
}

/**
 * Control codes that should be stripped from text.
 */
const STRIP_CONTROL_CODES = [
  7, // Bell
  8, // Backspace
  11, // Vertical tab
  12, // Form feed
  13, // Carriage return
];

/**
 * Translation table for stripping control codes.
 */
const CONTROL_STRIP_TRANSLATE: Record<number, string> = {};
for (const code of STRIP_CONTROL_CODES) {
  CONTROL_STRIP_TRANSLATE[code] = '';
}

/**
 * Control code escape sequences.
 */
const CONTROL_ESCAPE: Record<number, string> = {
  7: '\\a',
  8: '\\b',
  11: '\\v',
  12: '\\f',
  13: '\\r',
};

/**
 * Maps control types to functions that generate ANSI escape sequences.
 */
type ControlCodeFormatter = (...params: unknown[]) => string;

const CONTROL_CODES_FORMAT: Record<ControlType, ControlCodeFormatter> = {
  [ControlType.BELL]: () => '\x07',
  [ControlType.CARRIAGE_RETURN]: () => '\r',
  [ControlType.HOME]: () => '\x1b[H',
  [ControlType.CLEAR]: () => '\x1b[2J',
  [ControlType.ENABLE_ALT_SCREEN]: () => '\x1b[?1049h',
  [ControlType.DISABLE_ALT_SCREEN]: () => '\x1b[?1049l',
  [ControlType.SHOW_CURSOR]: () => '\x1b[?25h',
  [ControlType.HIDE_CURSOR]: () => '\x1b[?25l',
  [ControlType.CURSOR_UP]: (param: unknown) => `\x1b[${String(param)}A`,
  [ControlType.CURSOR_DOWN]: (param: unknown) => `\x1b[${String(param)}B`,
  [ControlType.CURSOR_FORWARD]: (param: unknown) => `\x1b[${String(param)}C`,
  [ControlType.CURSOR_BACKWARD]: (param: unknown) => `\x1b[${String(param)}D`,
  [ControlType.CURSOR_MOVE_TO_COLUMN]: (param: unknown) => `\x1b[${(param as number) + 1}G`,
  [ControlType.ERASE_IN_LINE]: (param: unknown) => `\x1b[${String(param)}K`,
  [ControlType.CURSOR_MOVE_TO]: (x: unknown, y: unknown) =>
    `\x1b[${(y as number) + 1};${(x as number) + 1}H`,
  [ControlType.SET_WINDOW_TITLE]: (title: unknown) => `\x1b]0;${String(title)}\x07`,
};

/**
 * A renderable that inserts a control code (non-printable but may move cursor).
 */
export class Control {
  public readonly segment: Segment;

  constructor(...codes: Array<ControlType | ControlCode>) {
    // Normalize codes to ControlCode format
    const controlCodes: ControlCode[] = codes.map((code) =>
      typeof code === 'number' ? [code] : code,
    );

    // Generate ANSI escape sequences
    const renderedCodes = controlCodes
      .map((code) => {
        const [type, ...parameters] = code;
        const formatter = CONTROL_CODES_FORMAT[type];
        return formatter(...parameters);
      })
      .join('');

    this.segment = new Segment(renderedCodes, undefined, controlCodes);
  }

  /**
   * Ring the terminal bell.
   */
  static bell(): Control {
    return new Control(ControlType.BELL);
  }

  /**
   * Move cursor to home position (0, 0).
   */
  static home(): Control {
    return new Control(ControlType.HOME);
  }

  /**
   * Move cursor relative to current position.
   *
   * @param x - X offset (positive = right, negative = left)
   * @param y - Y offset (positive = down, negative = up)
   */
  static move(x: number = 0, y: number = 0): Control {
    const codes: ControlCode[] = [];

    if (x !== 0) {
      codes.push([x > 0 ? ControlType.CURSOR_FORWARD : ControlType.CURSOR_BACKWARD, Math.abs(x)]);
    }
    if (y !== 0) {
      codes.push([y > 0 ? ControlType.CURSOR_DOWN : ControlType.CURSOR_UP, Math.abs(y)]);
    }

    return new Control(...codes);
  }

  /**
   * Move to the given column, optionally add offset to row.
   *
   * @param x - Absolute column position (0-indexed)
   * @param y - Optional row offset (default 0)
   */
  static moveToColumn(x: number, y: number = 0): Control {
    if (y === 0) {
      return new Control([ControlType.CURSOR_MOVE_TO_COLUMN, x]);
    } else {
      return new Control(
        [ControlType.CURSOR_MOVE_TO_COLUMN, x],
        [y > 0 ? ControlType.CURSOR_DOWN : ControlType.CURSOR_UP, Math.abs(y)],
      );
    }
  }

  /**
   * Move cursor to absolute position.
   *
   * @param x - Column position (0-indexed)
   * @param y - Row position (0-indexed)
   */
  static moveTo(x: number, y: number): Control {
    return new Control([ControlType.CURSOR_MOVE_TO, x, y]);
  }

  /**
   * Clear the screen.
   */
  static clear(): Control {
    return new Control(ControlType.CLEAR);
  }

  /**
   * Show or hide the cursor.
   *
   * @param show - True to show cursor, false to hide
   */
  static showCursor(show: boolean): Control {
    return new Control(show ? ControlType.SHOW_CURSOR : ControlType.HIDE_CURSOR);
  }

  /**
   * Enable or disable alternate screen buffer.
   *
   * @param enable - True to enable alt screen, false to disable
   */
  static altScreen(enable: boolean): Control {
    if (enable) {
      return new Control(ControlType.ENABLE_ALT_SCREEN, ControlType.HOME);
    } else {
      return new Control(ControlType.DISABLE_ALT_SCREEN);
    }
  }

  /**
   * Set the terminal window title.
   *
   * @param title - The new window title
   */
  static title(title: string): Control {
    return new Control([ControlType.SET_WINDOW_TITLE, title]);
  }

  /**
   * Convert to string (returns the ANSI escape sequence).
   */
  toString(): string {
    return this.segment.text;
  }
}

/**
 * Remove control codes from text.
 *
 * @param text - String possibly containing control codes
 * @returns String with control codes removed
 */
export function stripControlCodes(text: string): string {
  let result = text;
  for (const [code, replacement] of Object.entries(CONTROL_STRIP_TRANSLATE)) {
    result = result.replace(new RegExp(String.fromCharCode(Number(code)), 'g'), replacement);
  }
  return result;
}

/**
 * Replace control codes with their escaped equivalent.
 * (e.g. "\b" becomes "\\b")
 *
 * @param text - String possibly containing control codes
 * @returns String with control codes escaped
 */
export function escapeControlCodes(text: string): string {
  let result = text;
  for (const [code, escaped] of Object.entries(CONTROL_ESCAPE)) {
    result = result.replace(new RegExp(String.fromCharCode(Number(code)), 'g'), escaped);
  }
  return result;
}
