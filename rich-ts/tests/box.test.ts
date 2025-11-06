/**
 * Tests for box module
 * Based on tests/test_box.py
 */
import { describe, it, expect } from 'vitest';
import { ConsoleOptions } from '../src/console';
import {
  ASCII,
  DOUBLE,
  ROUNDED,
  HEAVY,
  SQUARE,
  MINIMAL_HEAVY_HEAD,
  MINIMAL,
  SIMPLE_HEAVY,
  SIMPLE,
  HEAVY_EDGE,
  HEAVY_HEAD,
} from '../src/box';

describe('box', () => {
  it('test_str', () => {
    expect(ASCII.toString()).toBe('+--+\n| ||\n|-+|\n| ||\n|-+|\n|-+|\n| ||\n+--+\n');
  });

  it('test_get_top', () => {
    const top = HEAVY.getTop([1, 2]);
    expect(top).toBe('┏━┳━━┓');
  });

  it('test_get_row', () => {
    const headRow = DOUBLE.getRow([3, 2, 1], 'head');
    expect(headRow).toBe('╠═══╬══╬═╣');

    const row = ASCII.getRow([1, 2, 3], 'row');
    expect(row).toBe('|-+--+---|');

    const footRow = ROUNDED.getRow([2, 1, 3], 'foot');
    expect(footRow).toBe('├──┼─┼───┤');

    expect(() => ROUNDED.getRow([1, 2, 3], 'FOO' as 'row')).toThrow(Error);
  });

  it('test_get_bottom', () => {
    const bottom = HEAVY.getBottom([1, 2, 3]);
    expect(bottom).toBe('┗━┻━━┻━━━┛');
  });

  it('test_box_substitute_for_same_box', () => {
    const options = new ConsoleOptions({
      legacy_windows: false,
      minWidth: 1,
      maxWidth: 100,
      isTerminal: true,
      encoding: 'utf-8',
      maxHeight: 25,
    });

    expect(ROUNDED.substitute(options)).toBe(ROUNDED);
    expect(MINIMAL_HEAVY_HEAD.substitute(options)).toBe(MINIMAL_HEAVY_HEAD);
    expect(SIMPLE_HEAVY.substitute(options)).toBe(SIMPLE_HEAVY);
    expect(HEAVY.substitute(options)).toBe(HEAVY);
    expect(HEAVY_EDGE.substitute(options)).toBe(HEAVY_EDGE);
    expect(HEAVY_HEAD.substitute(options)).toBe(HEAVY_HEAD);
  });

  it('test_box_substitute_for_different_box_legacy_windows', () => {
    const options = new ConsoleOptions({
      legacy_windows: true,
      minWidth: 1,
      maxWidth: 100,
      isTerminal: true,
      encoding: 'utf-8',
      maxHeight: 25,
    });

    expect(ROUNDED.substitute(options)).toBe(SQUARE);
    expect(MINIMAL_HEAVY_HEAD.substitute(options)).toBe(MINIMAL);
    expect(SIMPLE_HEAVY.substitute(options)).toBe(SIMPLE);
    expect(HEAVY.substitute(options)).toBe(SQUARE);
    expect(HEAVY_EDGE.substitute(options)).toBe(SQUARE);
    expect(HEAVY_HEAD.substitute(options)).toBe(SQUARE);
  });

  it('test_box_substitute_for_different_box_ascii_encoding', () => {
    const options = new ConsoleOptions({
      legacy_windows: true,
      minWidth: 1,
      maxWidth: 100,
      isTerminal: true,
      encoding: 'ascii',
      maxHeight: 25,
    });

    expect(ROUNDED.substitute(options)).toBe(ASCII);
    expect(MINIMAL_HEAVY_HEAD.substitute(options)).toBe(ASCII);
    expect(SIMPLE_HEAVY.substitute(options)).toBe(ASCII);
    expect(HEAVY.substitute(options)).toBe(ASCII);
    expect(HEAVY_EDGE.substitute(options)).toBe(ASCII);
    expect(HEAVY_HEAD.substitute(options)).toBe(ASCII);
  });
});
