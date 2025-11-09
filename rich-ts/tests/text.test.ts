import { describe, it, expect } from 'vitest';
import { Span, Text } from '../src/text';
import { Style } from '../src/style';
import { Console } from '../src/console';
import { Measurement } from '../src/measure';

describe('Span', () => {
  it('test_span', () => {
    const span = new Span(1, 10, 'foo');
    span.toString();
    expect(span.valueOf()).toBeTruthy();
    expect(new Span(10, 10, 'foo').valueOf()).toBeFalsy();
  });

  it('test_span_split', () => {
    expect(new Span(5, 10, 'foo').split(2)).toEqual([new Span(5, 10, 'foo'), undefined]);
    expect(new Span(5, 10, 'foo').split(15)).toEqual([new Span(5, 10, 'foo'), undefined]);
    expect(new Span(0, 10, 'foo').split(5)).toEqual([
      new Span(0, 5, 'foo'),
      new Span(5, 10, 'foo'),
    ]);
  });

  it('test_span_move', () => {
    expect(new Span(5, 10, 'foo').move(2)).toEqual(new Span(7, 12, 'foo'));
  });

  it('test_span_right_crop', () => {
    expect(new Span(5, 10, 'foo').rightCrop(15)).toEqual(new Span(5, 10, 'foo'));
    expect(new Span(5, 10, 'foo').rightCrop(7)).toEqual(new Span(5, 7, 'foo'));
  });
});

describe('Text', () => {
  it('test_len', () => {
    expect(new Text('foo').length).toBe(3);
  });

  it('test_cell_len', () => {
    expect(new Text('foo').cellLen).toBe(3);
    expect(new Text('😀').cellLen).toBe(2);
  });

  it('test_bool', () => {
    expect(new Text('foo').valueOf()).toBeTruthy();
    expect(new Text('').valueOf()).toBeFalsy();
  });

  it('test_str', () => {
    expect(String(new Text('foo'))).toBe('foo');
  });

  it('test_repr', () => {
    expect(typeof new Text('foo').toRepr()).toBe('string');
  });

  it('test_add', () => {
    const text = new Text('foo').add(new Text('bar'));
    expect(String(text)).toBe('foobar');
    // Test that add throws for non-string/Text arguments
    const textWithBadAdd = new Text('foo') as { add: (arg: unknown) => Text };
    expect(() => textWithBadAdd.add(1)).toThrow(TypeError);
  });

  it('test_eq', () => {
    expect(new Text('foo').equals(new Text('foo'))).toBe(true);
    expect(new Text('foo').equals(new Text('bar'))).toBe(false);
    // Test equals with non-Text argument
    const textWithBadEquals = new Text('foo') as { equals: (arg: unknown) => boolean };
    expect(textWithBadEquals.equals(1)).toBe(false);
  });

  it('test_contain', () => {
    const text = new Text('foobar');
    expect(text.contains('foo')).toBe(true);
    expect(text.contains('foo ')).toBe(false);
    expect(text.contains(new Text('bar'))).toBe(true);
    // Test contains with non-string/Text argument
    const textWithBadContains = text as { contains: (arg: unknown) => boolean };
    expect(textWithBadContains.contains(null)).toBe(false);
  });

  it('test_plain_property', () => {
    const text = new Text('foo');
    text.append('bar');
    text.append('baz');
    expect(text.plain).toBe('foobarbaz');
  });

  it('test_plain_property_setter', () => {
    const text = new Text('foo');
    text.plain = 'bar';
    expect(String(text)).toBe('bar');

    const text2 = new Text();
    text2.append('Hello, World', 'bold');
    text2.plain = 'Hello';
    expect(String(text2)).toBe('Hello');
    expect(text2.spans).toEqual([new Span(0, 5, 'bold')]);
  });

  // TODO: Requires markup module - defer until markup ported
  it('test_from_markup', () => {
    const text = Text.fromMarkup('Hello, [bold]World![/bold]');
    expect(String(text)).toBe('Hello, World!');
    expect(text.spans).toEqual([new Span(7, 13, 'bold')]);
  });

  it('test_from_ansi', () => {
    const text = Text.fromAnsi('Hello, \x1b[1mWorld!\x1b[0m');
    expect(String(text)).toBe('Hello, World!');
    expect(text.spans).toEqual([new Span(7, 13, new Style({ bold: true }))]);
  });

  it('test_copy', () => {
    const text = new Text();
    text.append('Hello', 'bold');
    text.append(' ');
    text.append('World', 'italic');
    const testCopy = text.copy();
    expect(text.equals(testCopy)).toBe(true);
    expect(text === testCopy).toBe(false);
  });

  it('test_rstrip', () => {
    const text = new Text('Hello, World!    ');
    text.rstrip();
    expect(String(text)).toBe('Hello, World!');
  });

  it('test_rstrip_end', () => {
    const text = new Text('Hello, World!    ');
    text.rstripEnd(14);
    expect(String(text)).toBe('Hello, World! ');
  });

  it('test_stylize', () => {
    const text = new Text('Hello, World!');
    text.stylize('bold', 7, 11);
    expect(text.spans).toEqual([new Span(7, 11, 'bold')]);
    text.stylize('bold', 20, 25);
    expect(text.spans).toEqual([new Span(7, 11, 'bold')]);
  });

  it('test_stylize_before', () => {
    const text = new Text('Hello, World!');
    text.stylize('bold', 0, 5);
    text.stylizeBefore('italic', 2, 7);
    expect(text.spans).toEqual([new Span(2, 7, 'italic'), new Span(0, 5, 'bold')]);
  });

  it('test_stylize_negative_index', () => {
    const text = new Text('Hello, World!');
    text.stylize('bold', -6, -1);
    expect(text.spans).toEqual([new Span(7, 12, 'bold')]);
  });

  it('test_highlight_regex', () => {
    // As a string
    let text = new Text('peek-a-boo');

    let count = text.highlightRegex(/NEVER_MATCH/, 'red');
    expect(count).toBe(0);
    expect(text.spans.length).toBe(0);

    // text: peek-a-boo
    // indx: 0123456789
    count = text.highlightRegex(/[a|e|o]+/g, 'red');
    expect(count).toBe(3);
    expect([...text.spans].sort((a, b) => a.start - b.start)).toEqual([
      new Span(1, 3, 'red'),
      new Span(5, 6, 'red'),
      new Span(8, 10, 'red'),
    ]);

    text = new Text('Ada Lovelace, Alan Turing');

    count = text.highlightRegex(
      /(?<yellow>[A-Za-z]+)[ ]+(?<red>[A-Za-z]+)(?<NEVER_MATCH>NEVER_MATCH)*/g
    );

    // The number of matched name should be 2
    expect(count).toBe(2);
    expect([...text.spans].sort((a, b) => a.start - b.start)).toEqual([
      new Span(0, 3, 'yellow'), // Ada
      new Span(4, 12, 'red'), // Lovelace
      new Span(14, 18, 'yellow'), // Alan
      new Span(19, 25, 'red'), // Turing
    ]);

    // As a regular expression object
    text = new Text('peek-a-boo');

    count = text.highlightRegex(/NEVER_MATCH/g, 'red');
    expect(count).toBe(0);
    expect(text.spans.length).toBe(0);

    // text: peek-a-boo
    // indx: 0123456789
    count = text.highlightRegex(/[a|e|o]+/g, 'red');
    expect(count).toBe(3);
    expect([...text.spans].sort((a, b) => a.start - b.start)).toEqual([
      new Span(1, 3, 'red'),
      new Span(5, 6, 'red'),
      new Span(8, 10, 'red'),
    ]);

    text = new Text('Ada Lovelace, Alan Turing');

    count = text.highlightRegex(
      /(?<yellow>[A-Za-z]+)[ ]+(?<red>[A-Za-z]+)(?<NEVER_MATCH>NEVER_MATCH)*/g
    );

    // The number of matched name should be 2
    expect(count).toBe(2);
    expect([...text.spans].sort((a, b) => a.start - b.start)).toEqual([
      new Span(0, 3, 'yellow'), // Ada
      new Span(4, 12, 'red'), // Lovelace
      new Span(14, 18, 'yellow'), // Alan
      new Span(19, 25, 'red'), // Turing
    ]);
  });

  it('test_highlight_regex_callable', () => {
    const text = new Text('Vulnerability CVE-2018-6543 detected');
    const reCve = /CVE-\d{4}-\d+/g;
    const compiledReCve = /CVE-\d{4}-\d+/g;

    const getStyle = (text: string): Style => {
      return Style.parse(
        `bold yellow link https://cve.mitre.org/cgi-bin/cvekey.cgi?keyword=${text}`
      );
    };

    // string
    let count = text.highlightRegex(reCve, getStyle);
    expect(count).toBe(1);
    expect(text.spans.length).toBe(1);
    expect(text.spans[0]!.start).toBe(14);
    expect(text.spans[0]!.end).toBe(27);
    expect((text.spans[0]!.style as Style).link).toBe(
      'https://cve.mitre.org/cgi-bin/cvekey.cgi?keyword=CVE-2018-6543'
    );

    // Clear the tracked _spans for the regular expression object's use
    text.spans = [];

    // regular expression object
    count = text.highlightRegex(compiledReCve, getStyle);
    expect(count).toBe(1);
    expect(text.spans.length).toBe(1);
    expect(text.spans[0]!.start).toBe(14);
    expect(text.spans[0]!.end).toBe(27);
    expect((text.spans[0]!.style as Style).link).toBe(
      'https://cve.mitre.org/cgi-bin/cvekey.cgi?keyword=CVE-2018-6543'
    );
  });

  it('test_highlight_words', () => {
    let text = new Text('Do NOT! touch anything!');
    const words = ['NOT', '!'];
    let count = text.highlightWords(words, 'red');
    expect(count).toBe(3);
    expect([...text.spans].sort((a, b) => a.start - b.start)).toEqual([
      new Span(3, 6, 'red'), // NOT
      new Span(6, 7, 'red'), // !
      new Span(22, 23, 'red'), // !
    ]);

    // regex escape test
    text = new Text('[o|u]aeiou');
    const words2 = ['[a|e|i]', '[o|u]'];
    count = text.highlightWords(words2, 'red');
    expect(count).toBe(1);
    expect(text.spans).toEqual([new Span(0, 5, 'red')]);

    // case sensitive
    text = new Text('AB Ab aB ab');
    const words3 = ['AB'];

    count = text.highlightWords(words3, 'red');
    expect(count).toBe(1);
    expect(text.spans).toEqual([new Span(0, 2, 'red')]);

    text = new Text('AB Ab aB ab');
    count = text.highlightWords(words3, 'red', { caseSensitive: false });
    expect(count).toBe(4);
  });

  it('test_set_length', () => {
    let text = new Text('Hello');
    text.setLength(5);
    expect(text.equals(new Text('Hello'))).toBe(true);

    text = new Text('Hello');
    text.setLength(10);
    expect(text.equals(new Text('Hello     '))).toBe(true);

    text = new Text('Hello World');
    text.stylize('bold', 0, 5);
    text.stylize('italic', 7, 9);

    text.setLength(3);
    const expected = new Text();
    expected.append('Hel', 'bold');
    expect(text.equals(expected)).toBe(true);
  });

  it('test_console_width', () => {
    const console = new Console();
    const text = new Text('Hello World!\nfoobarbaz');
    expect(text.__richMeasure__(console, console.options)).toEqual(new Measurement(9, 12));
    expect(new Text(' '.repeat(4)).__richMeasure__(console, console.options)).toEqual(
      new Measurement(4, 4)
    );
    expect(new Text(' \n  \n   ').__richMeasure__(console, console.options)).toEqual(
      new Measurement(3, 3)
    );
  });

  it('test_join', () => {
    const text = new Text('bar').join([new Text('foo', 'red'), new Text('baz', 'blue')]);
    expect(String(text)).toBe('foobarbaz');
    expect(text.spans).toEqual([new Span(0, 3, 'red'), new Span(6, 9, 'blue')]);
  });

  it('test_trim_spans', () => {
    const text = new Text('Hello');
    text.spans = [new Span(0, 3, 'red'), new Span(3, 6, 'green'), new Span(6, 9, 'blue')];
    text['_trimSpans']();
    expect(text.spans).toEqual([new Span(0, 3, 'red'), new Span(3, 5, 'green')]);
  });

  it('test_pad_left', () => {
    const text = new Text('foo');
    text.padLeft(3, 'X');
    expect(String(text)).toBe('XXXfoo');
  });

  it('test_pad_right', () => {
    const text = new Text('foo');
    text.padRight(3, 'X');
    expect(String(text)).toBe('fooXXX');
  });

  it('test_append', () => {
    const text = new Text('foo');
    text.append('bar');
    expect(String(text)).toBe('foobar');
    text.append(new Text('baz', 'bold'));
    expect(String(text)).toBe('foobarbaz');
    expect(text.spans).toEqual([new Span(6, 9, 'bold')]);

    expect(() => text.append(new Text('foo'), 'bar')).toThrow(Error);
    // Test append with invalid argument
    const textWithBadAppend = text as { append: (arg: unknown) => void };
    expect(() => textWithBadAppend.append(1)).toThrow(TypeError);
  });

  it('test_append_text', () => {
    const text = new Text('foo');
    text.appendText(new Text('bar', 'bold'));
    expect(String(text)).toBe('foobar');
    expect(text.spans).toEqual([new Span(3, 6, 'bold')]);
  });

  // TODO: Requires Console - defer until console ported
  it('test_end', () => {
    // const console = new Console({ width: 20, file: new StringIO() });
    // const text = new Group(Text.fromMarkup('foo', { end: ' ' }), Text.fromMarkup('bar'));
    // console.print(text);
    // expect(console.file.getvalue()).toBe('foo bar\n');
  });

  it('test_split', () => {
    const text = new Text();
    text.append('foo', 'red');
    text.append('\n');
    text.append('bar', 'green');
    text.append('\n');

    const line1 = new Text();
    line1.append('foo', 'red');
    const line2 = new Text();
    line2.append('bar', 'green');
    const split = text.split('\n');
    expect(split.length).toBe(2);
    expect(split.getItem(0).equals(line1)).toBe(true);
    expect(split.getItem(1).equals(line2)).toBe(true);

    expect(Array.from(new Text('foo').split('\n'))).toEqual([new Text('foo')]);
  });

  // TODO: Requires markup module - defer until markup ported
  it('test_split_spans', () => {
    // const text = Text.fromMarkup('[red]Hello\n[b]World');
    // const lines = text.split('\n');
    // expect(lines[0]!.plain).toBe('Hello');
    // expect(lines[1]!.plain).toBe('World');
    // expect(lines[0]!.spans).toEqual([new Span(0, 5, 'red')]);
    // expect(lines[1]!.spans).toEqual([
    //   new Span(0, 5, 'red'),
    //   new Span(0, 5, 'bold'),
    // ]);
  });

  it('test_divide', () => {
    let lines = new Text('foo').divide([]);
    expect(lines.length).toBe(1);
    expect(lines.getItem(0).equals(new Text('foo'))).toBe(true);

    let text = new Text();
    text.append('foo', 'bold');
    lines = text.divide([1, 2]);
    expect(lines.length).toBe(3);
    expect(String(lines.getItem(0))).toBe('f');
    expect(String(lines.getItem(1))).toBe('o');
    expect(String(lines.getItem(2))).toBe('o');
    expect(lines.getItem(0).spans).toEqual([new Span(0, 1, 'bold')]);
    expect(lines.getItem(1).spans).toEqual([new Span(0, 1, 'bold')]);
    expect(lines.getItem(2).spans).toEqual([new Span(0, 1, 'bold')]);

    text = new Text();
    text.append('foo', 'red');
    text.append('bar', 'green');
    text.append('baz', 'blue');
    lines = text.divide([8]);
    expect(lines.length).toBe(2);
    expect(String(lines.getItem(0))).toBe('foobarba');
    expect(String(lines.getItem(1))).toBe('z');
    expect(lines.getItem(0).spans).toEqual([
      new Span(0, 3, 'red'),
      new Span(3, 6, 'green'),
      new Span(6, 8, 'blue'),
    ]);
    expect(lines.getItem(1).spans).toEqual([new Span(0, 1, 'blue')]);

    lines = text.divide([1]);
    expect(lines.length).toBe(2);
    expect(String(lines.getItem(0))).toBe('f');
    expect(String(lines.getItem(1))).toBe('oobarbaz');
    expect(lines.getItem(0).spans).toEqual([new Span(0, 1, 'red')]);
    expect(lines.getItem(1).spans).toEqual([
      new Span(0, 2, 'red'),
      new Span(2, 5, 'green'),
      new Span(5, 8, 'blue'),
    ]);
  });

  it('test_right_crop', () => {
    const text = new Text();
    text.append('foobar', 'red');
    text.rightCrop(3);
    expect(String(text)).toBe('foo');
    expect(text.spans).toEqual([new Span(0, 3, 'red')]);
  });

  // TODO: Requires Console - defer until console ported
  it('test_wrap_3', () => {
    // const text = new Text('foo bar baz');
    // const lines = text.wrap(new Console(), 3);
    // console.log(lines);
    // expect(lines.length).toBe(3);
    // expect(lines[0]).toEqual(new Text('foo'));
    // expect(lines[1]).toEqual(new Text('bar'));
    // expect(lines[2]).toEqual(new Text('baz'));
  });

  // TODO: Requires Console - defer until console ported
  it('test_wrap_4', () => {
    // const text = new Text('foo bar baz', '', { justify: 'left' });
    // const lines = text.wrap(new Console(), 4);
    // expect(lines.length).toBe(3);
    // expect(lines[0]).toEqual(new Text('foo '));
    // expect(lines[1]).toEqual(new Text('bar '));
    // expect(lines[2]).toEqual(new Text('baz '));
  });

  // TODO: Requires Console - defer until console ported
  it('test_wrap_wrapped_word_length_greater_than_available_width', () => {
    // const text = new Text('1234 12345678');
    // const lines = text.wrap(new Console(), 7);
    // expect(lines._lines).toEqual([
    //   new Text('1234 '),
    //   new Text('1234567'),
    //   new Text('8'),
    // ]);
  });

  // TODO: Requires Console - defer until console ported
  it('test_wrap_cjk', () => {
    // const text = new Text('わさび');
    // const lines = text.wrap(new Console(), 4);
    // expect(lines._lines).toEqual([new Text('わさ'), new Text('び')]);
  });

  // TODO: Requires Console - defer until console ported
  it('test_wrap_cjk_width_mid_character', () => {
    // const text = new Text('わさび');
    // const lines = text.wrap(new Console(), 3);
    // expect(lines._lines).toEqual([new Text('わ'), new Text('さ'), new Text('び')]);
  });

  // TODO: Requires Console - defer until console ported
  it('test_wrap_cjk_mixed', () => {
    // const text = new Text('123ありがとうございました');
    // const console = new Console({ width: 20 });
    // const wrappedLines = text.wrap(console, { width: 8 });
    // const capture = console.capture();
    // console.print(wrappedLines);
    // expect(capture.get()).toBe('123あり\nがとうご\nざいまし\nた\n');
  });

  // TODO: Requires Console - defer until console ported
  it('test_wrap_long', () => {
    // const text = new Text('abracadabra', '', { justify: 'left' });
    // const lines = text.wrap(new Console(), 4);
    // expect(lines.length).toBe(3);
    // expect(lines[0]).toEqual(new Text('abra'));
    // expect(lines[1]).toEqual(new Text('cada'));
    // expect(lines[2]).toEqual(new Text('bra '));
  });

  // TODO: Requires Console - defer until console ported
  it('test_wrap_overflow', () => {
    // const text = new Text('Some more words');
    // const lines = text.wrap(new Console(), 4, { overflow: 'ellipsis' });
    // expect(lines.length).toBe(3);
    // expect(lines[0]).toEqual(new Text('Some'));
    // expect(lines[1]).toEqual(new Text('more'));
    // expect(lines[2]).toEqual(new Text('wor…'));
  });

  // TODO: Requires Console - defer until console ported
  it('test_wrap_overflow_long', () => {
    // const text = new Text('bigword'.repeat(10));
    // const lines = text.wrap(new Console(), 4, { overflow: 'ellipsis' });
    // expect(lines.length).toBe(1);
    // expect(lines[0]).toEqual(new Text('big…'));
  });

  // TODO: Requires Console - defer until console ported
  it('test_wrap_long_words', () => {
    // const text = new Text('XX 12345678912');
    // const lines = text.wrap(new Console(), 4);
    // expect(lines._lines).toEqual([
    //   new Text('XX '),
    //   new Text('1234'),
    //   new Text('5678'),
    //   new Text('912'),
    // ]);
  });

  // TODO: Requires Console - defer until console ported
  it('test_wrap_long_words_2', () => {
    // const text = new Text('Hello, World...123');
    // const lines = text.wrap(new Console(), 10);
    // expect(lines._lines).toEqual([
    //   new Text('Hello, '),
    //   new Text('World...12'),
    //   new Text('3'),
    // ]);
  });

  // TODO: Requires Console - defer until console ported
  it('test_wrap_long_words_followed_by_other_words', () => {
    // const text = new Text('123 12345678 123 123');
    // const lines = text.wrap(new Console(), 6);
    // expect(lines._lines).toEqual([
    //   new Text('123 '),
    //   new Text('123456'),
    //   new Text('78 123'),
    //   new Text('123'),
    // ]);
  });

  // TODO: Requires Console - defer until console ported
  it('test_wrap_long_word_preceeded_by_word_of_full_line_length', () => {
    // const text = new Text('123456 12345678 123 123');
    // const lines = text.wrap(new Console(), 6);
    // expect(lines._lines).toEqual([
    //   new Text('123456'),
    //   new Text('123456'),
    //   new Text('78 123'),
    //   new Text('123'),
    // ]);
  });

  // TODO: Requires Console - defer until console ported
  it('test_wrap_multiple_consecutive_spaces', () => {
    // const text = new Text('123456    12345678 123 123');
    // const lines = text.wrap(new Console(), 6);
    // expect(lines._lines).toEqual([
    //   new Text('123456'),
    //   new Text('123456'),
    //   new Text('78 123'),
    //   new Text('123'),
    // ]);
  });

  // TODO: Requires Console - defer until console ported
  it('test_wrap_long_words_justify_left', () => {
    // const text = new Text('X 123456789', '', { justify: 'left' });
    // const lines = text.wrap(new Console(), 4);
    // expect(lines.length).toBe(4);
    // expect(lines[0]).toEqual(new Text('X   '));
    // expect(lines[1]).toEqual(new Text('1234'));
    // expect(lines[2]).toEqual(new Text('5678'));
    // expect(lines[3]).toEqual(new Text('9   '));
  });

  // TODO: Requires Console - defer until console ported
  it('test_wrap_leading_and_trailing_whitespace', () => {
    // const text = new Text('   123  456 789   ');
    // const lines = text.wrap(new Console(), 4);
    // expect(lines._lines).toEqual([
    //   new Text('   1'),
    //   new Text('23  '),
    //   new Text('456 '),
    //   new Text('789 '),
    // ]);
  });

  // TODO: Requires Console - defer until console ported
  it('test_no_wrap_no_crop', () => {
    // const text = new Text('Hello World!'.repeat(3));
    // const console = new Console({ width: 20, file: new StringIO() });
    // console.print(text, { noWrap: true });
    // console.print(text, { noWrap: true, crop: false, overflow: 'ignore' });
    // expect(console.file.getvalue()).toBe(
    //   'Hello World!Hello Wo\nHello World!Hello World!Hello World!\n'
    // );
  });

  it('test_fit', () => {
    const text = new Text('Hello\nWorld');
    const lines = text.fit(3);
    expect(String(lines.getItem(0))).toBe('Hel');
    expect(String(lines.getItem(1))).toBe('Wor');
  });

  // TODO: Requires Console - defer until console ported
  it('test_wrap_tabs', () => {
    // const text = new Text('foo\tbar', '', { justify: 'left' });
    // const lines = text.wrap(new Console(), 4);
    // expect(lines.length).toBe(2);
    // expect(String(lines[0])).toBe('foo ');
    // expect(String(lines[1])).toBe('bar ');
  });

  // TODO: Requires Console - defer until console ported
  it('test_render', () => {
    // const console = new Console({ width: 15, record: true });
    // const text = Text.fromMarkup(
    //   '[u][b]Where[/b] there is a [i]Will[/i], there is a Way.[/u]'
    // );
    // console.print(text);
    // const output = console.exportText({ styles: true });
    // const expected =
    //   '\x1b[1;4mWhere\x1b[0m\x1b[4m there is \x1b[0m\n\x1b[4ma \x1b[0m\x1b[3;4mWill\x1b[0m\x1b[4m, there \x1b[0m\n\x1b[4mis a Way.\x1b[0m\n';
    // expect(output).toBe(expected);
  });

  // TODO: Requires Console - defer until console ported
  it('test_render_simple', () => {
    // const console = new Console({ width: 80 });
    // console.beginCapture();
    // console.print(new Text('foo'));
    // const result = console.endCapture();
    // expect(result).toBe('foo\n');
  });

  // TODO: Requires Console - defer until console ported
  it('test_print', () => {
    // Test cases from parametrize decorator
    // const testCases = [
    //   { printText: ['.'], result: '.\n' },
    //   { printText: ['.', '.'], result: '. .\n' },
    //   { printText: ['Hello', 'World', '!'], result: 'Hello World !\n' },
    // ];
    // for (const { printText, result } of testCases) {
    //   const console = new Console({ record: true });
    //   console.print(...printText);
    //   expect(console.exportText({ styles: false })).toBe(result);
    // }
  });

  // TODO: Requires Console - defer until console ported
  it('test_print_sep_end', () => {
    // Test cases from parametrize decorator
    // const testCases = [
    //   { printText: ['.'], result: '.X' },
    //   { printText: ['.', '.'], result: '..X' },
    //   { printText: ['Hello', 'World', '!'], result: 'HelloWorld!X' },
    // ];
    // for (const { printText, result } of testCases) {
    //   const console = new Console({ record: true, file: new StringIO() });
    //   console.print(...printText, { sep: '', end: 'X' });
    //   expect(console.file.getvalue()).toBe(result);
    // }
  });

  it('test_tabs_to_spaces', () => {
    let text = new Text('\tHello\tWorld', '', { tabSize: 8 });
    text.expandTabs();
    expect(text.plain).toBe('        Hello   World');

    text = new Text('\tHello\tWorld', '', { tabSize: 4 });
    text.expandTabs();
    expect(text.plain).toBe('    Hello   World');

    text = new Text('.\t..\t...\t....\t', '', { tabSize: 4 });
    text.expandTabs();
    expect(text.plain).toBe('.   ..  ... ....    ');

    text = new Text('No Tabs');
    text.expandTabs();
    expect(text.plain).toBe('No Tabs');

    text = new Text('No Tabs', 'bold');
    text.expandTabs();
    expect(text.plain).toBe('No Tabs');
    expect(text.style).toBe('bold');
  });

  // TODO: Requires markup module - defer until markup ported
  it('test_tabs_to_spaces_spans', () => {
    // Test cases from parametrize decorator
    // const testCases = [
    //   { markup: '', tabSize: 4, expectedText: '', expectedSpans: [] },
    //   { markup: '\t', tabSize: 4, expectedText: '    ', expectedSpans: [] },
    //   { markup: '\tbar', tabSize: 4, expectedText: '    bar', expectedSpans: [] },
    //   { markup: 'foo\tbar', tabSize: 4, expectedText: 'foo bar', expectedSpans: [] },
    //   {
    //     markup: 'foo\nbar\nbaz',
    //     tabSize: 4,
    //     expectedText: 'foo\nbar\nbaz',
    //     expectedSpans: [],
    //   },
    //   {
    //     markup: '[bold]foo\tbar',
    //     tabSize: 4,
    //     expectedText: 'foo bar',
    //     expectedSpans: [new Span(0, 4, 'bold'), new Span(4, 7, 'bold')],
    //   },
    //   // ... more test cases
    // ];
    // for (const { markup, tabSize, expectedText, expectedSpans } of testCases) {
    //   const text = Text.fromMarkup(markup);
    //   text.expandTabs(tabSize);
    //   expect(text.plain).toBe(expectedText);
    //   expect(text.spans).toEqual(expectedSpans);
    // }
  });

  // TODO: Requires Console - defer until console ported
  it('test_markup_switch', () => {
    // const console = new Console({ file: new StringIO(), markup: false });
    // console.print('[bold]foo[/bold]');
    // expect(console.file.getvalue()).toBe('[bold]foo[/bold]\n');
  });

  // TODO: Requires Console - defer until console ported
  it('test_emoji', () => {
    // const console = new Console({ file: new StringIO() });
    // console.print(':+1:');
    // expect(console.file.getvalue()).toBe('👍\n');
  });

  // TODO: Requires Console - defer until console ported
  it('test_emoji_switch', () => {
    // const console = new Console({ file: new StringIO(), emoji: false });
    // console.print(':+1:');
    // expect(console.file.getvalue()).toBe(':+1:\n');
  });

  it('test_assemble', () => {
    const text = Text.assemble('foo', ['bar', 'bold']);
    expect(String(text)).toBe('foobar');
    expect(text.spans).toEqual([new Span(3, 6, 'bold')]);
  });

  it('test_assemble_meta', () => {
    const text = Text.assemble('foo', ['bar', 'bold'], { meta: { foo: 'bar' } });
    expect(String(text)).toBe('foobar');

    const spans = text.spans;

    // Check spans structure (can't compare Style directly due to random _linkId)
    expect(spans.length).toBe(2);
    expect(spans[0]).toEqual(new Span(3, 6, 'bold'));
    expect(spans[1]?.start).toBe(0);
    expect(spans[1]?.end).toBe(6);
    expect((spans[1]?.style as Style).meta).toEqual({ foo: 'bar' });

    // TODO: Requires Console - defer until console ported
    // const console = new Console();
    // expect(text.getStyleAtOffset(console, 0).meta).toEqual({ foo: 'bar' });
  });

  it('test_styled', () => {
    const text = Text.styled('foo', 'bold red');
    expect(text.style).toBe('');
    expect(String(text)).toBe('foo');
    expect(text.spans).toEqual([new Span(0, 3, 'bold red')]);
  });

  it('test_strip_control_codes', () => {
    const text = new Text('foo\rbar');
    expect(String(text)).toBe('foobar');
    text.append('\x08');
    expect(String(text)).toBe('foobar');
  });

  // TODO: Requires Console - defer until console ported
  it('test_get_style_at_offset', () => {
    // const console = new Console();
    // const text = Text.fromMarkup('Hello [b]World[/b]');
    // expect(text.getStyleAtOffset(console, 0)).toEqual(new Style());
    // expect(text.getStyleAtOffset(console, 6)).toEqual(new Style({ bold: true }));
  });

  it('test_truncate_ellipsis', () => {
    const testCases = [
      { input: 'Hello', count: 10, expected: 'Hello' },
      { input: 'Hello', count: 5, expected: 'Hello' },
      { input: 'Hello', count: 4, expected: 'Hel…' },
      { input: 'Hello', count: 3, expected: 'He…' },
      { input: 'Hello', count: 2, expected: 'H…' },
      { input: 'Hello', count: 1, expected: '…' },
    ];

    for (const { input, count, expected } of testCases) {
      const text = new Text(input);
      text.truncate(count, { overflow: 'ellipsis' });
      expect(text.plain).toBe(expected);
    }
  });

  it('test_truncate_ellipsis_pad', () => {
    const testCases = [
      { input: 'Hello', count: 5, expected: 'Hello' },
      { input: 'Hello', count: 10, expected: 'Hello     ' },
      { input: 'Hello', count: 3, expected: 'He…' },
    ];

    for (const { input, count, expected } of testCases) {
      const text = new Text(input);
      text.truncate(count, { overflow: 'ellipsis', pad: true });
      expect(text.plain).toBe(expected);
    }
  });

  it('test_pad', () => {
    const text = new Text('foo');
    text.pad(2);
    expect(text.plain).toBe('  foo  ');
  });

  it('test_align_left', () => {
    const text = new Text('foo');
    text.align('left', 10);
    expect(text.plain).toBe('foo       ');
  });

  it('test_align_right', () => {
    const text = new Text('foo');
    text.align('right', 10);
    expect(text.plain).toBe('       foo');
  });

  it('test_align_center', () => {
    const text = new Text('foo');
    text.align('center', 10);
    expect(text.plain).toBe('   foo    ');
  });

  it('test_detect_indentation', () => {
    let text = new Text(`foo
    bar
    `);
    expect(text.detectIndentation()).toBe(4);

    text = new Text(`foo
    bar
      baz
    `);
    expect(text.detectIndentation()).toBe(2);

    expect(new Text('').detectIndentation()).toBe(1);
    expect(new Text(' ').detectIndentation()).toBe(1);
  });

  it('test_indentation_guides', () => {
    const text = new Text(`for a in range(10):
    print(a)

foo = [
    1,
    {
        2
    }
]

`);
    const result = text.withIndentGuides();
    const expected =
      'for a in range(10):\n│   print(a)\n\nfoo = [\n│   1,\n│   {\n│   │   2\n│   }\n]\n\n';
    expect(result.plain).toBe(expected);
  });

  // TODO: Requires markup module - defer until markup ported
  it('test_slice', () => {
    // const text = Text.fromMarkup('[red]foo [bold]bar[/red] baz[/bold]');
    // expect(text.getItem(0)).toEqual(new Text('f', '', { spans: [new Span(0, 1, 'red')] }));
    // expect(text.getItem(4)).toEqual(
    //   new Text('b', '', { spans: [new Span(0, 1, 'red'), new Span(0, 1, 'bold')] })
    // );
    // expect(text.getItem({ start: 0, stop: 3 })).toEqual(
    //   new Text('foo', '', { spans: [new Span(0, 3, 'red')] })
    // );
    // expect(text.getItem({ start: 0, stop: 4 })).toEqual(
    //   new Text('foo ', '', { spans: [new Span(0, 4, 'red')] })
    // );
    // expect(text.getItem({ start: 0, stop: 5 })).toEqual(
    //   new Text('foo b', '', { spans: [new Span(0, 5, 'red'), new Span(4, 5, 'bold')] })
    // );
    // expect(text.getItem({ start: 4 })).toEqual(
    //   new Text('bar baz', '', { spans: [new Span(0, 3, 'red'), new Span(0, 7, 'bold')] })
    // );
    // expect(() => text.getItem({ start: 0, stop: -1, step: -1 })).toThrow(TypeError);
  });

  // TODO: Requires Console - defer until console ported
  it('test_wrap_invalid_style', () => {
    // const console = new Console({ width: 100, colorSystem: 'truecolor' });
    // const a =
    //   '[#######.................] xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx [#######.................]';
    // console.print(a, { justify: 'full' });
  });

  it('test_apply_meta', () => {
    const text = new Text('foobar');
    text.applyMeta({ foo: 'bar' }, 1, 3);

    // TODO: Requires Console - defer until console ported
    // const console = new Console();
    // expect(text.getStyleAtOffset(console, 0).meta).toEqual({});
    // expect(text.getStyleAtOffset(console, 1).meta).toEqual({ foo: 'bar' });
    // expect(text.getStyleAtOffset(console, 2).meta).toEqual({ foo: 'bar' });
    // expect(text.getStyleAtOffset(console, 3).meta).toEqual({});
  });

  it('test_on', () => {
    // TODO: Requires Console - defer until console ported
    // const console = new Console();
    const text = new Text('foo');
    text.on({ foo: 'bar' }, { click: 'CLICK' });
    const expected = { foo: 'bar', '@click': 'CLICK' };

    // Check that the style has the meta data
    const lastSpan = text.spans[text.spans.length - 1];
    expect(lastSpan).toBeDefined();
    expect((lastSpan!.style as Style).meta).toEqual(expected);

    // expect(text.getStyleAtOffset(console, 0).meta).toEqual(expected);
    // expect(text.getStyleAtOffset(console, 1).meta).toEqual(expected);
    // expect(text.getStyleAtOffset(console, 2).meta).toEqual(expected);
  });

  it('test_markup_property', () => {
    expect(new Text('').markup).toBe('');
    expect(new Text('foo').markup).toBe('foo');
    expect(new Text('foo', 'bold').markup).toBe('[bold]foo[/bold]');

    // TODO: Requires markup module - defer until markup ported
    // expect(Text.fromMarkup('foo [red]bar[/red]').markup).toBe('foo [red]bar[/red]');
    // expect(
    //   Text.fromMarkup('foo [red]bar[/red]', '', { style: 'bold' }).markup
    // ).toBe('[bold]foo [red]bar[/red][/bold]');
    // expect(
    //   Text.fromMarkup('[bold]foo [italic]bar[/bold] baz[/italic]').markup
    // ).toBe('[bold]foo [italic]bar[/bold] baz[/italic]');

    expect(new Text('[bold]foo').markup).toBe('\\[bold]foo');
  });

  it('test_extend_style', () => {
    // TODO: Requires markup module - defer until markup ported
    // const text = Text.fromMarkup('[red]foo[/red] [bold]bar');
    const text = new Text();
    text.append('foo', 'red');
    text.append(' ');
    text.append('bar', 'bold');

    text.extendStyle(0);

    expect(text.plain).toBe('foo bar');
    expect(text.spans).toEqual([new Span(0, 3, 'red'), new Span(4, 7, 'bold')]);

    text.extendStyle(-1);
    expect(text.plain).toBe('foo bar');
    expect(text.spans).toEqual([new Span(0, 3, 'red'), new Span(4, 7, 'bold')]);

    text.extendStyle(2);
    expect(text.plain).toBe('foo bar  ');
    expect(text.spans).toEqual([new Span(0, 3, 'red'), new Span(4, 9, 'bold')]);
  });

  // TODO: Requires Console - defer until console ported
  it('test_append_tokens', () => {
    // const console = new Console();
    // const t = new Text().appendTokens([
    //   ['long text that will be wrapped with a control code \r\n', 'red'],
    // ]);
    // const capture = console.capture();
    // console.print(t, { width: 40 });
    // const output = capture.get();
    // expect(output).toBe(
    //   'long text that will be wrapped with a \ncontrol code \n\n'
    // );
  });

  it('test_append_loop_regression', () => {
    const a = new Text('one', 'blue');
    a.append(a);
    expect(a.plain).toBe('oneone');

    const b = new Text('two', 'blue');
    b.appendText(b);
    expect(b.plain).toBe('twotwo');
  });
});
