import { describe, it, expect } from 'vitest';
import { cellLen, setCellSize, chopCells, isSingleCellWidths } from '../src/cells';

describe('cells', () => {
  it('test_cell_len_long_string', () => {
    // Long strings don't use cached cell length implementation
    expect(cellLen('abc'.repeat(200))).toBe(3 * 200);
    // Boundary case
    expect(cellLen('a'.repeat(512))).toBe(512);
  });

  it('test_cell_len_short_string', () => {
    // Short strings use cached cell length implementation
    expect(cellLen('abc'.repeat(100))).toBe(3 * 100);
    // Boundary case
    expect(cellLen('a'.repeat(511))).toBe(511);
  });

  it('test_set_cell_size', () => {
    expect(setCellSize('foo', 0)).toBe('');
    expect(setCellSize('f', 0)).toBe('');
    expect(setCellSize('', 0)).toBe('');
    expect(setCellSize('😽😽', 0)).toBe('');
    expect(setCellSize('foo', 2)).toBe('fo');
    expect(setCellSize('foo', 3)).toBe('foo');
    expect(setCellSize('foo', 4)).toBe('foo ');
    expect(setCellSize('😽😽', 4)).toBe('😽😽');
    expect(setCellSize('😽😽', 3)).toBe('😽 ');
    expect(setCellSize('😽😽', 2)).toBe('😽');
    expect(setCellSize('😽😽', 1)).toBe(' ');
    expect(setCellSize('😽😽', 5)).toBe('😽😽 ');
  });

  it('test_set_cell_size_infinite', () => {
    for (let size = 0; size < 38; size++) {
      expect(cellLen(setCellSize('เป็นเกมที่ต้องมีความอดทนมากที่สุดตั้งเเต่เคยเล่นมา', size))).toBe(
        size
      );
    }
  });

  it('test_chop_cells', () => {
    // Simple example of splitting cells into lines of width 3
    const text = 'abcdefghijk';
    expect(chopCells(text, 3)).toEqual(['abc', 'def', 'ghi', 'jk']);
  });

  it('test_chop_cells_double_width_boundary', () => {
    // The available width lies within a double-width character
    const text = 'ありがとう';
    expect(chopCells(text, 3)).toEqual(['あ', 'り', 'が', 'と', 'う']);
  });

  it('test_chop_cells_mixed_width', () => {
    // Mixed single and double-width characters
    const text = 'あ1り234が5と6う78';
    expect(chopCells(text, 3)).toEqual(['あ1', 'り2', '34', 'が5', 'と6', 'う7', '8']);
  });

  it('test_is_single_cell_widths', () => {
    // Check isSingleCellWidths reports correctly
    const printableChars =
      ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';

    for (const character of printableChars) {
      expect(isSingleCellWidths(character)).toBe(true);
    }

    const box = '┌─┬┐│ ││├─┼┤│ ││├─┼┤├─┼┤│ ││└─┴┘';
    for (const character of box) {
      expect(isSingleCellWidths(character)).toBe(true);
    }

    for (const character of '💩😽') {
      expect(isSingleCellWidths(character)).toBe(false);
    }

    for (const character of 'わさび') {
      expect(isSingleCellWidths(character)).toBe(false);
    }
  });
});
