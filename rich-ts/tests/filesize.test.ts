import { describe, it, expect } from 'vitest';
import { decimal, pickUnitAndSuffix } from '../src/filesize.js';

describe('filesize', () => {
  it('test_decimal_units', () => {
    expect(decimal(0)).toBe('0 bytes');
    expect(decimal(1)).toBe('1 byte');
    expect(decimal(2)).toBe('2 bytes');
    expect(decimal(1000)).toBe('1.0 kB');
    expect(decimal(1.5 * 1000 * 1000)).toBe('1.5 MB');
  });

  it('test_precision_and_separator', () => {
    expect(decimal(0, { precision: 2 })).toBe('0 bytes');
    expect(decimal(1111, { precision: 0 })).toBe('1 kB');
    expect(decimal(1111, { precision: 1 })).toBe('1.1 kB');
    expect(decimal(1111, { precision: 2 })).toBe('1.11 kB');
    expect(decimal(1111, { separator: '' })).toBe('1.1kB');
  });

  it('test_pick_unit_and_suffix', () => {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    expect(pickUnitAndSuffix(50, units, 1024)).toEqual([1, 'bytes']);
    expect(pickUnitAndSuffix(2048, units, 1024)).toEqual([1024, 'KB']);
  });
});
