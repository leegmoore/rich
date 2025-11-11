import { describe, expect, it } from 'vitest';
import { NULL_FILE, NullFile } from '../src/_null_file.js';

describe('_null_file', () => {
  describe('NullFile', () => {
    it('discards writes', () => {
      const nullFile = new NullFile();
      expect(() => nullFile.write('test')).not.toThrow();
      expect(() => nullFile.write('more data')).not.toThrow();
    });

    it('flush() is a no-op', () => {
      const nullFile = new NullFile();
      expect(() => nullFile.flush()).not.toThrow();
    });

    it('close() is a no-op', () => {
      const nullFile = new NullFile();
      expect(() => nullFile.close()).not.toThrow();
    });
  });

  describe('NULL_FILE', () => {
    it('is an instance of NullFile', () => {
      expect(NULL_FILE).toBeInstanceOf(NullFile);
    });

    it('discards writes', () => {
      expect(() => NULL_FILE.write('test')).not.toThrow();
    });

    it('flush() is a no-op', () => {
      expect(() => NULL_FILE.flush()).not.toThrow();
    });

    it('close() is a no-op', () => {
      expect(() => NULL_FILE.close()).not.toThrow();
    });
  });
});

