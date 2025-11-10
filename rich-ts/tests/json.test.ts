import { describe, expect, it } from 'vitest';
import { JSON } from '../src/json.js';

describe('JSON', () => {
  it('test_print_json_data_with_default', () => {
    const date = new Date('2021-01-01T00:00:00Z');
    const json = JSON.fromData(
      { date },
      {
        default: (value) => {
          if (value instanceof Date) {
            return value.toISOString().slice(0, 10);
          }
          return value;
        },
      }
    );
    expect(String(json.text)).toBe('{\n  "date": "2021-01-01"\n}');
  });
});
