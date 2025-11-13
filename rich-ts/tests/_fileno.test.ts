import { describe, expect, it } from 'vitest';
import { getFileno } from '../src/_fileno.js';
import { createWriteStream } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { unlinkSync } from 'fs';

describe('_fileno', () => {
  describe('getFileno', () => {
    it('returns undefined for objects without fd', () => {
      const obj = {};
      expect(getFileno(obj)).toBeUndefined();
    });

    it('returns undefined for null', () => {
      expect(getFileno(null)).toBeUndefined();
    });

    it('returns undefined for undefined', () => {
      expect(getFileno(undefined)).toBeUndefined();
    });

    it('returns fd if present in object', () => {
      const obj = { fd: 5 };
      expect(getFileno(obj)).toBe(5);
    });

    it('returns undefined for non-number fd', () => {
      const obj = { fd: 'not-a-number' };
      expect(getFileno(obj)).toBeUndefined();
    });

    it('handles Node.js streams without fd gracefully', () => {
      const stream = createWriteStream(join(tmpdir(), `test-${Date.now()}.txt`));
      try {
        const fd = getFileno(stream);
        // May or may not have fd depending on Node.js version
        expect(fd === undefined || typeof fd === 'number').toBe(true);
      } finally {
        stream.close();
        try {
          unlinkSync(stream.path as string);
        } catch {
          // Ignore cleanup errors
        }
      }
    });
  });
});

