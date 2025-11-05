import { describe, it, expect } from 'vitest';
import {
  Control,
  ControlType,
  stripControlCodes,
  escapeControlCodes,
  Segment,
} from '../src/control';

describe('control', () => {
  it('test_control', () => {
    const control = new Control(ControlType.BELL);
    expect(String(control)).toBe('\x07');
  });

  it('test_strip_control_codes', () => {
    expect(stripControlCodes('')).toBe('');
    expect(stripControlCodes('foo\rbar')).toBe('foobar');
    expect(stripControlCodes('Fear is the mind killer')).toBe('Fear is the mind killer');
  });

  it('test_escape_control_codes', () => {
    expect(escapeControlCodes('')).toBe('');
    expect(escapeControlCodes('foo\rbar')).toBe('foo\\rbar');
    expect(escapeControlCodes('Fear is the mind killer')).toBe('Fear is the mind killer');
  });

  it('test_control_move_to', () => {
    const control = Control.moveTo(5, 10);
    expect(control.segment).toEqual(
      new Segment('\x1b[11;6H', undefined, [[ControlType.CURSOR_MOVE_TO, 5, 10]]),
    );
  });

  it('test_control_move', () => {
    expect(Control.move(0, 0).segment).toEqual(new Segment('', undefined, []));
    const control = Control.move(3, 4);
    expect(control.segment).toEqual(
      new Segment(
        '\x1b[3C\x1b[4B',
        undefined,
        [
          [ControlType.CURSOR_FORWARD, 3],
          [ControlType.CURSOR_DOWN, 4],
        ],
      ),
    );
  });

  it('test_move_to_column', () => {
    expect(Control.moveToColumn(10, 20).segment).toEqual(
      new Segment(
        '\x1b[11G\x1b[20B',
        undefined,
        [
          [ControlType.CURSOR_MOVE_TO_COLUMN, 10],
          [ControlType.CURSOR_DOWN, 20],
        ],
      ),
    );

    expect(Control.moveToColumn(10, -20).segment).toEqual(
      new Segment(
        '\x1b[11G\x1b[20A',
        undefined,
        [
          [ControlType.CURSOR_MOVE_TO_COLUMN, 10],
          [ControlType.CURSOR_UP, 20],
        ],
      ),
    );
  });

  it('test_title', () => {
    const controlSegment = Control.title('hello').segment;
    expect(controlSegment).toEqual(
      new Segment('\x1b]0;hello\x07', undefined, [[ControlType.SET_WINDOW_TITLE, 'hello']]),
    );
  });
});
