/**
 * Terminal control codes (ANSI escape sequences).
 *
 * This module provides utilities for generating ANSI control sequences
 * for cursor movement, screen clearing, and other terminal operations.
 */

import { Segment, ControlType, type ControlCode } from './segment.js';

/**
 * Control codes that should be stripped from text
 */
export const STRIP_CONTROL_CODES = [
  7, // Bell
  8, // Backspace
  11, // Vertical tab
  12, // Form feed
  13, // Carriage return
];

/**
 * Mapping of control codes to their escaped equivalents
 */
export const CONTROL_ESCAPE: Record<number, string> = {
  7: '\\a',
  8: '\\b',
  11: '\\v',
  12: '\\f',
  13: '\\r',
};

/**
 * Mapping of control types to their ANSI format functions
 */
const CONTROL_CODES_FORMAT: Record<
  ControlType,
  ((...args: number[]) => string) | ((title: string) => string)
> = {
  [ControlType.BELL]: () => '\x07',
  [ControlType.CARRIAGE_RETURN]: () => '\r',
  [ControlType.HOME]: () => '\x1b[H',
  [ControlType.CLEAR]: () => '\x1b[2J',
  [ControlType.ENABLE_ALT_SCREEN]: () => '\x1b[?1049h',
  [ControlType.DISABLE_ALT_SCREEN]: () => '\x1b[?1049l',
  [ControlType.SHOW_CURSOR]: () => '\x1b[?25h',
  [ControlType.HIDE_CURSOR]: () => '\x1b[?25l',
  [ControlType.CURSOR_UP]: (param: number) => `\x1b[${param}A`,
  [ControlType.CURSOR_DOWN]: (param: number) => `\x1b[${param}B`,
  [ControlType.CURSOR_FORWARD]: (param: number) => `\x1b[${param}C`,
  [ControlType.CURSOR_BACKWARD]: (param: number) => `\x1b[${param}D`,
  [ControlType.CURSOR_MOVE_TO_COLUMN]: (param: number) => `\x1b[${param + 1}G`,
  [ControlType.ERASE_IN_LINE]: (param: number) => `\x1b[${param}K`,
  [ControlType.CURSOR_MOVE_TO]: (x: number, y: number) => `\x1b[${y + 1};${x + 1}H`,
  [ControlType.SET_WINDOW_TITLE]: (title: string) => `\x1b]0;${title}\x07`,
};

/**
 * A renderable that inserts a control code (non printable but may move cursor).
 */
export class Control {
  /**
   * The segment containing the rendered control codes
   */
  public readonly segment: Segment;

  /**
   * Create a Control object from control codes.
   *
   * @param codes - Either a ControlType enum or a ControlCode tuple
   */
  constructor(...codes: Array<ControlType | ControlCode>) {
    const controlCodes: ControlCode[] = codes.map((code) =>
      typeof code === 'number' ? [code] : code
    );

    const renderedCodes = controlCodes
      .map((code) => {
        const [type, ...parameters] = code;
        return CONTROL_CODES_FORMAT[type](...parameters);
      })
      .join('');

    this.segment = new Segment(renderedCodes, undefined, controlCodes);
  }

  /**
   * Ring the 'bell'.
   */
  static bell(): Control {
    return new Control(ControlType.BELL);
  }

  /**
   * Move cursor to 'home' position.
   */
  static home(): Control {
    return new Control(ControlType.HOME);
  }

  /**
   * Move cursor relative to current position.
   *
   * @param x - X offset
   * @param y - Y offset
   * @returns Control object
   */
  static move(x: number = 0, y: number = 0): Control {
    const codes: ControlCode[] = [];

    if (x) {
      codes.push([x > 0 ? ControlType.CURSOR_FORWARD : ControlType.CURSOR_BACKWARD, Math.abs(x)]);
    }
    if (y) {
      codes.push([y > 0 ? ControlType.CURSOR_DOWN : ControlType.CURSOR_UP, Math.abs(y)]);
    }

    return new Control(...codes);
  }

  /**
   * Move to the given column, optionally add offset to row.
   *
   * @param x - Absolute x (column)
   * @param y - Optional y offset (row)
   * @returns Control object
   */
  static moveToColumn(x: number, y: number = 0): Control {
    if (y) {
      return new Control(
        [ControlType.CURSOR_MOVE_TO_COLUMN, x],
        [y > 0 ? ControlType.CURSOR_DOWN : ControlType.CURSOR_UP, Math.abs(y)]
      );
    } else {
      return new Control([ControlType.CURSOR_MOVE_TO_COLUMN, x]);
    }
  }

  /**
   * Move cursor to absolute position.
   *
   * @param x - X offset (column)
   * @param y - Y offset (row)
   * @returns Control object
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
   * @param show - Whether to show the cursor
   */
  static showCursor(show: boolean): Control {
    return new Control(show ? ControlType.SHOW_CURSOR : ControlType.HIDE_CURSOR);
  }

  /**
   * Enable or disable alt screen.
   *
   * @param enable - Whether to enable alt screen
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
   * @param title - The new terminal window title
   */
  static title(title: string): Control {
    return new Control([ControlType.SET_WINDOW_TITLE, title]);
  }

  /**
   * Get the string representation of the control codes.
   */
  toString(): string {
    return this.segment.text;
  }
}

/**
 * Remove control codes from text.
 *
 * @param text - A string possibly containing control codes
 * @returns String with control codes removed
 */
export function stripControlCodes(text: string): string {
  // Create a regex pattern for the control codes we want to strip
  const pattern = new RegExp(
    STRIP_CONTROL_CODES.map((code) => String.fromCharCode(code)).join('|'),
    'g'
  );
  return text.replace(pattern, '');
}

/**
 * Replace control codes with their "escaped" equivalent in the given text.
 * (e.g. "\b" becomes "\\b")
 *
 * @param text - A string possibly containing control codes
 * @returns String with control codes replaced with their escaped version
 */
export function escapeControlCodes(text: string): string {
  let result = text;
  for (const [code, escape] of Object.entries(CONTROL_ESCAPE)) {
    const char = String.fromCharCode(Number(code));
    result = result.replace(new RegExp(char, 'g'), escape);
  }
  return result;
}
