/**
 * Text wrapping utilities.
 */

import { loopLast } from './_loop.js';
import { cellLen, chopCells } from './cells.js';

const RE_WORD = /\s*\S+\s*/g;

/**
 * Yields each word from the text as a tuple containing [start_index, end_index, word].
 * A "word" in this context may include the actual word and any whitespace to the right.
 *
 * @param text - The text to process
 * @yields Tuples of [start, end, word]
 */
export function* words(text: string): Generator<[number, number, string]> {
  let match: RegExpExecArray | null;
  while ((match = RE_WORD.exec(text)) !== null) {
    yield [match.index, match.index + match[0].length, match[0]];
  }
}

/**
 * Given a string of text, and a width (measured in cells), return a list
 * of cell offsets which the string should be split at in order for it to fit
 * within the given width.
 *
 * @param text - The text to examine.
 * @param width - The available cell width.
 * @param fold - If True, words longer than `width` will be folded onto a new line.
 * @returns A list of indices to break the line at.
 */
export function divideLine(text: string, width: number, fold = true): number[] {
  const breakPositions: number[] = [];
  let cellOffset = 0;

  for (const [start, , word] of words(text)) {
    const wordLength = cellLen(word.trimEnd());
    const remainingSpace = width - cellOffset;
    const wordFitsRemainingSpace = remainingSpace >= wordLength;

    if (wordFitsRemainingSpace) {
      // Simplest case - the word fits within the remaining width for this line.
      cellOffset += cellLen(word);
    } else {
      // Not enough space remaining for this word on the current line.
      if (wordLength > width) {
        // The word doesn't fit on any line, so we can't simply
        // place it on the next line...
        if (fold) {
          // Fold the word across multiple lines.
          const foldedWord = chopCells(word, width);
          let currentStart = start;
          for (const [last, line] of loopLast(foldedWord)) {
            if (currentStart) {
              breakPositions.push(currentStart);
            }
            if (last) {
              cellOffset = cellLen(line);
            } else {
              currentStart += line.length;
            }
          }
        } else {
          // Folding isn't allowed, so crop the word.
          if (start) {
            breakPositions.push(start);
          }
          cellOffset = cellLen(word);
        }
      } else if (cellOffset && start) {
        // The word doesn't fit within the remaining space on the current
        // line, but it *can* fit on to the next (empty) line.
        breakPositions.push(start);
        cellOffset = cellLen(word);
      }
    }
  }

  return breakPositions;
}
