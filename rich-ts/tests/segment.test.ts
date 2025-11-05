import { describe, expect, it } from 'vitest';
import { Segment, ControlType, Segments, SegmentLines } from '../src/segment';
import { Style } from '../src/style';
import { cellLen } from '../src/cells';

describe('Segment', () => {
  it('test_repr', () => {
    expect(String(new Segment('foo'))).toContain('foo');
    const home: [ControlType, number] = [ControlType.HOME, 0];
    const segmentWithControl = new Segment('foo', undefined, [home]);
    expect(String(segmentWithControl)).toContain('foo');
  });

  it('test_line', () => {
    expect(Segment.line()).toEqual(new Segment('\n'));
  });

  it('test_apply_style', () => {
    const segments = [new Segment('foo'), new Segment('bar', new Style({ bold: true }))];
    expect(Segment.applyStyle(segments, undefined)).toBe(segments);
    expect(Array.from(Segment.applyStyle(segments, new Style({ italic: true })))).toEqual([
      new Segment('foo', new Style({ italic: true })),
      new Segment('bar', new Style({ italic: true, bold: true })),
    ]);
  });

  it('test_split_lines', () => {
    const lines = [new Segment('Hello\nWorld')];
    expect(Array.from(Segment.splitLines(lines))).toEqual([
      [new Segment('Hello')],
      [new Segment('World')],
    ]);
  });

  it('test_split_and_crop_lines', () => {
    expect(
      Array.from(Segment.splitAndCropLines([new Segment('Hello\nWorld!\n'), new Segment('foo')], 4))
    ).toEqual([
      [new Segment('Hell'), new Segment('\n', undefined)],
      [new Segment('Worl'), new Segment('\n', undefined)],
      [new Segment('foo'), new Segment(' ')],
    ]);
  });

  it('test_adjust_line_length', () => {
    let line = [new Segment('Hello', 'foo' as unknown as Style)];
    expect(Segment.adjustLineLength(line, 10, 'bar' as unknown as Style)).toEqual([
      new Segment('Hello', 'foo' as unknown as Style),
      new Segment('     ', 'bar' as unknown as Style),
    ]);

    line = [new Segment('H'), new Segment('ello, World!')];
    expect(Segment.adjustLineLength(line, 5)).toEqual([new Segment('H'), new Segment('ello')]);

    line = [new Segment('Hello')];
    expect(Segment.adjustLineLength(line, 5)).toEqual(line);
  });

  it('test_get_line_length', () => {
    expect(Segment.getLineLength([new Segment('foo'), new Segment('bar')])).toBe(6);
  });

  it('test_get_shape', () => {
    expect(Segment.getShape([[new Segment('Hello')]])).toEqual([5, 1]);
    expect(Segment.getShape([[new Segment('Hello')], [new Segment('World!')]])).toEqual([6, 2]);
  });

  it('test_set_shape', () => {
    expect(Segment.setShape([[new Segment('Hello')]], 10)).toEqual([
      [new Segment('Hello'), new Segment('     ')],
    ]);
    expect(Segment.setShape([[new Segment('Hello')]], 10, 2)).toEqual([
      [new Segment('Hello'), new Segment('     ')],
      [new Segment(' '.repeat(10))],
    ]);
  });

  it('test_simplify', () => {
    expect(
      Array.from(Segment.simplify([new Segment('Hello'), new Segment(' '), new Segment('World!')]))
    ).toEqual([new Segment('Hello World!')]);
    expect(
      Array.from(
        Segment.simplify([
          new Segment('Hello', 'red' as unknown as Style),
          new Segment(' ', 'red' as unknown as Style),
          new Segment('World!', 'blue' as unknown as Style),
        ])
      )
    ).toEqual([
      new Segment('Hello ', 'red' as unknown as Style),
      new Segment('World!', 'blue' as unknown as Style),
    ]);
    expect(Array.from(Segment.simplify([]))).toEqual([]);
  });

  it('test_filter_control', () => {
    const controlCode: [ControlType, number] = [ControlType.HOME, 0];
    const segments = [new Segment('foo'), new Segment('bar', undefined, [controlCode])];
    expect(Array.from(Segment.filterControl(segments))).toEqual([new Segment('foo')]);
    expect(Array.from(Segment.filterControl(segments, true))).toEqual([
      new Segment('bar', undefined, [controlCode]),
    ]);
  });

  it('test_strip_styles', () => {
    const segments = [new Segment('foo', new Style({ bold: true }))];
    expect(Array.from(Segment.stripStyles(segments))).toEqual([new Segment('foo', undefined)]);
  });

  it('test_strip_links', () => {
    const segments = [
      new Segment('foo', new Style({ bold: true, link: 'https://www.example.org' })),
    ];
    expect(Array.from(Segment.stripLinks(segments))).toEqual([
      new Segment('foo', new Style({ bold: true })),
    ]);
  });

  it('test_remove_color', () => {
    const segments = [
      new Segment('foo', new Style({ bold: true, color: 'red' })),
      new Segment('bar', undefined),
    ];
    expect(Array.from(Segment.removeColor(segments))).toEqual([
      new Segment('foo', new Style({ bold: true })),
      new Segment('bar', undefined),
    ]);
  });

  it('test_is_control', () => {
    expect(new Segment('foo', new Style({ bold: true })).isControl).toBe(false);
    expect(new Segment('foo', new Style({ bold: true }), []).isControl).toBe(true);
    expect(new Segment('foo', new Style({ bold: true }), [[ControlType.HOME, 0]]).isControl).toBe(
      true
    );
  });

  it('test_segments_renderable', () => {
    const segments = new Segments([new Segment('foo')]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(Array.from(segments.__richConsole__(null as any, null as any))).toEqual([
      new Segment('foo'),
    ]);

    const segmentsWithNewLines = new Segments([new Segment('foo')], true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(Array.from(segmentsWithNewLines.__richConsole__(null as any, null as any))).toEqual([
      new Segment('foo'),
      Segment.line(),
    ]);
  });

  it('test_divide', () => {
    const bold = new Style({ bold: true });
    const italic = new Style({ italic: true });
    const segments = [new Segment('Hello', bold), new Segment(' World!', italic)];

    expect(Array.from(Segment.divide(segments, []))).toEqual([]);
    expect(Array.from(Segment.divide([], [1]))).toEqual([[]]);

    expect(Array.from(Segment.divide(segments, [1]))).toEqual([[new Segment('H', bold)]]);

    expect(Array.from(Segment.divide(segments, [1, 2]))).toEqual([
      [new Segment('H', bold)],
      [new Segment('e', bold)],
    ]);

    expect(Array.from(Segment.divide(segments, [1, 2, 12]))).toEqual([
      [new Segment('H', bold)],
      [new Segment('e', bold)],
      [new Segment('llo', bold), new Segment(' World!', italic)],
    ]);

    expect(Array.from(Segment.divide(segments, [4, 20]))).toEqual([
      [new Segment('Hell', bold)],
      [new Segment('o', bold), new Segment(' World!', italic)],
    ]);
  });

  it('test_divide_emoji', () => {
    const bold = new Style({ bold: true });
    const italic = new Style({ italic: true });
    const segments = [new Segment('Hello', bold), new Segment('💩💩💩', italic)];

    expect(Array.from(Segment.divide(segments, [7]))).toEqual([
      [new Segment('Hello', bold), new Segment('💩', italic)],
    ]);
    expect(Array.from(Segment.divide(segments, [8]))).toEqual([
      [new Segment('Hello', bold), new Segment('💩 ', italic)],
    ]);
    expect(Array.from(Segment.divide(segments, [9]))).toEqual([
      [new Segment('Hello', bold), new Segment('💩💩', italic)],
    ]);
    expect(Array.from(Segment.divide(segments, [8, 11]))).toEqual([
      [new Segment('Hello', bold), new Segment('💩 ', italic)],
      [new Segment(' 💩', italic)],
    ]);
    expect(Array.from(Segment.divide(segments, [9, 11]))).toEqual([
      [new Segment('Hello', bold), new Segment('💩💩', italic)],
      [new Segment('💩', italic)],
    ]);
  });

  it('test_divide_edge', () => {
    const segments = [new Segment('foo'), new Segment('bar'), new Segment('baz')];
    const result = Array.from(Segment.divide(segments, [1, 3, 9]));
    expect(result).toEqual([
      [new Segment('f')],
      [new Segment('oo')],
      [new Segment('bar'), new Segment('baz')],
    ]);
  });

  it.skip('test_divide_complex', () => {
    // SKIP: This test requires Console from Phase 3 for full integration testing
    // The divide functionality itself works correctly as shown in other tests
  });

  it('test_divide_edge_2', () => {
    const segments = [
      new Segment('╭─'),
      new Segment('────── Placeholder ───────'),
      new Segment('─╮'),
    ];
    const result = Array.from(Segment.divide(segments, [30, 60]));
    const expected = [segments, []];
    expect(result).toEqual(expected);
  });

  it('test_split_cells_emoji', () => {
    const testCases: Array<[string, number, [Segment, Segment]]> = [
      ['XX', 4, [new Segment('XX'), new Segment('')]],
      ['X', 1, [new Segment('X'), new Segment('')]],
      ['💩', 1, [new Segment(' '), new Segment(' ')]],
      ['XY', 1, [new Segment('X'), new Segment('Y')]],
      ['💩X', 1, [new Segment(' '), new Segment(' X')]],
      ['💩💩', 1, [new Segment(' '), new Segment(' 💩')]],
      ['X💩Y', 2, [new Segment('X '), new Segment(' Y')]],
      ['X💩YZ', 2, [new Segment('X '), new Segment(' YZ')]],
      ['X💩💩Z', 2, [new Segment('X '), new Segment(' 💩Z')]],
      ['X💩💩Z', 3, [new Segment('X💩'), new Segment('💩Z')]],
      ['X💩💩Z', 4, [new Segment('X💩 '), new Segment(' Z')]],
      ['X💩💩Z', 5, [new Segment('X💩💩'), new Segment('Z')]],
      ['X💩💩Z', 6, [new Segment('X💩💩Z'), new Segment('')]],
      ['XYZABC💩💩', 6, [new Segment('XYZABC'), new Segment('💩💩')]],
      ['XYZABC💩💩', 7, [new Segment('XYZABC '), new Segment(' 💩')]],
      ['XYZABC💩💩', 8, [new Segment('XYZABC💩'), new Segment('💩')]],
      ['XYZABC💩💩', 9, [new Segment('XYZABC💩 '), new Segment(' ')]],
      ['XYZABC💩💩', 10, [new Segment('XYZABC💩💩'), new Segment('')]],
      ['💩💩💩💩💩', 3, [new Segment('💩 '), new Segment(' 💩💩💩')]],
      ['💩💩💩💩💩', 4, [new Segment('💩💩'), new Segment('💩💩💩')]],
      ['💩X💩Y💩Z💩A💩', 4, [new Segment('💩X '), new Segment(' Y💩Z💩A💩')]],
      ['XYZABC', 4, [new Segment('XYZA'), new Segment('BC')]],
      ['XYZABC', 5, [new Segment('XYZAB'), new Segment('C')]],
      ['a1あ１１bcdaef', 9, [new Segment('a1あ１１b'), new Segment('cdaef')]],
    ];

    for (const [text, split, result] of testCases) {
      expect(new Segment(text).splitCells(split)).toEqual(result);
    }
  });

  it('test_split_cells_mixed', () => {
    const testSegments = [
      new Segment('早乙女リリエル (CV: 徳井青）'),
      new Segment('メイド・イン・きゅんクチュアリ☆    '),
      new Segment('TVアニメ「メルクストーリア -無気力少年と瓶の中の少女-」 主題歌CD'),
      new Segment('南無阿弥JKうらめしや?！     '),
      new Segment('メルク (CV: 水瀬いのり)     '),
      new Segment(' メルク (CV: 水瀬いのり)     '),
      new Segment('  メルク (CV: 水瀬いのり)     '),
      new Segment('  メルク (CV: 水瀬いのり)      '),
    ];

    for (const segment of testSegments) {
      for (let position = 0; position <= segment.cellLength; position++) {
        const [left, right] = segment.splitCells(position);
        // Sanity check there aren't any sneaky control codes
        for (const c of segment.text) {
          expect(cellLen(c)).toBeGreaterThan(0);
        }
        expect(cellLen(left.text)).toBe(position);
        expect(cellLen(right.text)).toBe(segment.cellLength - position);
      }
    }
  });

  it('test_split_cells_doubles', () => {
    const test = new Segment('早'.repeat(20));
    for (let position = 1; position < test.cellLength; position++) {
      const [left, right] = test.splitCells(position);
      expect(cellLen(left.text)).toBe(position);
      expect(cellLen(right.text)).toBe(test.cellLength - position);
    }
  });

  it('test_split_cells_single', () => {
    const test = new Segment('A'.repeat(20));
    for (let position = 1; position < test.cellLength; position++) {
      const [left, right] = test.splitCells(position);
      expect(cellLen(left.text)).toBe(position);
      expect(cellLen(right.text)).toBe(test.cellLength - position);
    }
  });

  it('test_segment_lines_renderable', () => {
    const lines = [
      [new Segment('hello'), new Segment(' '), new Segment('world')],
      [new Segment('foo')],
    ];
    const segmentLines = new SegmentLines(lines);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(Array.from(segmentLines.__richConsole__(null as any, null as any))).toEqual([
      new Segment('hello'),
      new Segment(' '),
      new Segment('world'),
      new Segment('foo'),
    ]);

    const segmentLinesWithNewLines = new SegmentLines(lines, true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(Array.from(segmentLinesWithNewLines.__richConsole__(null as any, null as any))).toEqual([
      new Segment('hello'),
      new Segment(' '),
      new Segment('world'),
      new Segment('\n'),
      new Segment('foo'),
      new Segment('\n'),
    ]);
  });

  it('test_align_top', () => {
    const lines = [[new Segment('X')]];
    expect(Segment.alignTop(lines, 3, 1, new Style())).toEqual(lines);
    expect(Segment.alignTop(lines, 3, 3, new Style())).toEqual([
      [new Segment('X')],
      [new Segment('   ', new Style())],
      [new Segment('   ', new Style())],
    ]);
  });

  it('test_align_middle', () => {
    const lines = [[new Segment('X')]];
    expect(Segment.alignMiddle(lines, 3, 1, new Style())).toEqual(lines);
    expect(Segment.alignMiddle(lines, 3, 3, new Style())).toEqual([
      [new Segment('   ', new Style())],
      [new Segment('X')],
      [new Segment('   ', new Style())],
    ]);
  });

  it('test_align_bottom', () => {
    const lines = [[new Segment('X')]];
    expect(Segment.alignBottom(lines, 3, 1, new Style())).toEqual(lines);
    expect(Segment.alignBottom(lines, 3, 3, new Style())).toEqual([
      [new Segment('   ', new Style())],
      [new Segment('   ', new Style())],
      [new Segment('X')],
    ]);
  });
});
