import { CELL_WIDTHS } from './cell_widths';

// Ranges of unicode ordinals that produce a 1-cell wide character
// This is non-exhaustive, but covers most common Western characters
const SINGLE_CELL_UNICODE_RANGES: [number, number][] = [
  [0x20, 0x7e], // Latin (excluding non-printable)
  [0xa0, 0xac],
  [0xae, 0x002ff],
  [0x00370, 0x00482], // Greek / Cyrillic
  [0x02500, 0x025fc], // Box drawing, box elements, geometric shapes
  [0x02800, 0x028ff], // Braille
];

// A set of characters that are a single cell wide
const SINGLE_CELLS = new Set<string>();
for (const [start, end] of SINGLE_CELL_UNICODE_RANGES) {
  for (let codepoint = start; codepoint <= end; codepoint++) {
    SINGLE_CELLS.add(String.fromCodePoint(codepoint));
  }
}

/**
 * Check if all characters in text are single-cell width.
 * @param text - Text to check
 * @returns True if all characters are single-cell width
 */
export function isSingleCellWidths(text: string): boolean {
  for (const character of text) {
    if (!SINGLE_CELLS.has(character)) {
      return false;
    }
  }
  return true;
}

/**
 * Get the cell size of a character.
 * @param character - A single character
 * @returns Number of cells (0, 1 or 2) occupied by that character
 */
const characterCellSizeCache = new Map<string, number>();

export function getCharacterCellSize(character: string): number {
  // Check cache first
  if (characterCellSizeCache.has(character)) {
    return characterCellSizeCache.get(character)!;
  }

  const codepoint = character.codePointAt(0);
  if (codepoint === undefined) {
    return 1;
  }

  const table = CELL_WIDTHS;
  let lowerBound = 0;
  let upperBound = table.length - 1;
  let index = Math.floor((lowerBound + upperBound) / 2);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const entry = table[index];
    if (!entry) break;
    const [start, end, width] = entry;
    if (codepoint < start) {
      upperBound = index - 1;
    } else if (codepoint > end) {
      lowerBound = index + 1;
    } else {
      const result = width === -1 ? 0 : width;
      characterCellSizeCache.set(character, result);
      return result;
    }
    if (upperBound < lowerBound) {
      break;
    }
    index = Math.floor((lowerBound + upperBound) / 2);
  }

  characterCellSizeCache.set(character, 1);
  return 1;
}

/**
 * Get the number of cells required to display text (with caching).
 * This method always caches, which may use up a lot of memory. It is recommended to use
 * cellLen over this method.
 * @param text - Text to display
 * @returns Number of cells required to display text
 */
const cachedCellLenCache = new Map<string, number>();

function cachedCellLen(text: string): number {
  // Check cache first
  if (cachedCellLenCache.has(text)) {
    return cachedCellLenCache.get(text)!;
  }

  if (isSingleCellWidths(text)) {
    cachedCellLenCache.set(text, text.length);
    return text.length;
  }

  let total = 0;
  for (const character of text) {
    total += getCharacterCellSize(character);
  }

  cachedCellLenCache.set(text, total);
  return total;
}

/**
 * Get the number of cells required to display text.
 * @param text - Text to display
 * @returns Number of cells required to display text
 */
export function cellLen(text: string): number {
  if (text.length < 512) {
    return cachedCellLen(text);
  }
  if (isSingleCellWidths(text)) {
    return text.length;
  }
  let total = 0;
  for (const character of text) {
    total += getCharacterCellSize(character);
  }
  return total;
}

/**
 * Set the length of a string to fit within given number of cells.
 * @param text - Text to display
 * @param total - Total number of cells
 * @returns Text adjusted to fit within total cells
 */
export function setCellSize(text: string, total: number): string {
  if (isSingleCellWidths(text)) {
    const size = text.length;
    if (size < total) {
      return text + ' '.repeat(total - size);
    }
    return text.slice(0, total);
  }

  if (total <= 0) {
    return '';
  }

  const cellSize = cellLen(text);
  if (cellSize === total) {
    return text;
  }
  if (cellSize < total) {
    return text + ' '.repeat(total - cellSize);
  }

  // Convert to array of characters to handle multi-byte characters properly
  const chars = Array.from(text);
  let start = 0;
  let end = chars.length;

  // Binary search until we find the right size
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const pos = Math.floor((start + end) / 2);
    const before = chars.slice(0, pos + 1).join('');
    const beforeLen = cellLen(before);
    const lastChar = chars[pos];
    if (lastChar && beforeLen === total + 1 && getCharacterCellSize(lastChar) === 2) {
      return chars.slice(0, pos).join('') + ' ';
    }
    if (beforeLen === total) {
      return before;
    }
    if (beforeLen > total) {
      end = pos;
    } else {
      start = pos;
    }
  }
}

/**
 * Split text into lines such that each line fits within the available (cell) width.
 * @param text - The text to fold such that it fits in the given width
 * @param width - The width available (number of cells)
 * @returns A list of strings such that each string in the list has cell width
 *          less than or equal to the available width
 */
export function chopCells(text: string, width: number): string[] {
  const lines: string[][] = [[]];
  let totalWidth = 0;

  for (const character of text) {
    const cellWidth = getCharacterCellSize(character);
    const charDoesntFit = totalWidth + cellWidth > width;

    if (charDoesntFit) {
      lines.push([character]);
      totalWidth = cellWidth;
    } else {
      const lastLine = lines[lines.length - 1];
      if (lastLine) {
        lastLine.push(character);
      }
      totalWidth += cellWidth;
    }
  }

  return lines.map((line) => line.join(''));
}
