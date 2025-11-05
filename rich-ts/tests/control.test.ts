import { describe, expect, test } from 'vitest';
import { Control, escapeControlCodes, stripControlCodes } from '../src/control.js';
import { ControlType, Segment } from '../src/segment.js';

describe('control', () => {
  test('test_control', () => {
    const control = new Control(ControlType.BELL);
    expect(control.toString()).toBe('\x07');
  });

  test('test_strip_control_codes', () => {
    expect(stripControlCodes('')).toBe('');
    expect(stripControlCodes('foo\rbar')).toBe('foobar');
    expect(stripControlCodes('Fear is the mind killer')).toBe('Fear is the mind killer');
  });

  test('test_escape_control_codes', () => {
    expect(escapeControlCodes('')).toBe('');
    expect(escapeControlCodes('foo\rbar')).toBe('foo\\rbar');
    expect(escapeControlCodes('Fear is the mind killer')).toBe('Fear is the mind killer');
  });

  test('test_control_move_to', () => {
    const control = Control.moveTo(5, 10);
    console.log(control.segment);
    expect(control.segment).toEqual(
      new Segment('\x1b[11;6H', undefined, [[ControlType.CURSOR_MOVE_TO, 5, 10]])
    );
  });

  test('test_control_move', () => {
    expect(Control.move(0, 0).segment).toEqual(new Segment('', undefined, []));
    const control = Control.move(3, 4);
    console.log(control.segment);
    expect(control.segment).toEqual(
      new Segment('\x1b[3C\x1b[4B', undefined, [
        [ControlType.CURSOR_FORWARD, 3],
        [ControlType.CURSOR_DOWN, 4],
      ])
    );
  });

  test('test_move_to_column', () => {
    console.log(Control.moveToColumn(10, 20).segment);
    expect(Control.moveToColumn(10, 20).segment).toEqual(
      new Segment('\x1b[11G\x1b[20B', undefined, [
        [ControlType.CURSOR_MOVE_TO_COLUMN, 10],
        [ControlType.CURSOR_DOWN, 20],
      ])
    );

    expect(Control.moveToColumn(10, -20).segment).toEqual(
      new Segment('\x1b[11G\x1b[20A', undefined, [
        [ControlType.CURSOR_MOVE_TO_COLUMN, 10],
        [ControlType.CURSOR_UP, 20],
      ])
    );
  });

  test('test_title', () => {
    const controlSegment = Control.title('hello').segment;
    expect(controlSegment).toEqual(
      new Segment('\x1b]0;hello\x07', undefined, [[ControlType.SET_WINDOW_TITLE, 'hello']])
    );
  });
});
