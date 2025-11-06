import { describe, expect, it } from 'vitest';
import { Console } from '../src/console.js';
import { MarkupError } from '../src/errors.js';
import { RE_TAGS, Tag, _parse, escape, render } from '../src/markup.js';
import { Span, Text } from '../src/text.js';

describe('markup', () => {
  it('test_re_no_match', () => {
    expect('[True]'.match(RE_TAGS)).toBeNull();
    expect('[False]'.match(RE_TAGS)).toBeNull();
    expect('[None]'.match(RE_TAGS)).toBeNull();
    expect('[1]'.match(RE_TAGS)).toBeNull();
    expect('[2]'.match(RE_TAGS)).toBeNull();
    expect('[]'.match(RE_TAGS)).toBeNull();
  });

  it('test_re_match', () => {
    expect('[true]'.match(RE_TAGS)).toBeTruthy();
    expect('[false]'.match(RE_TAGS)).toBeTruthy();
    expect('[none]'.match(RE_TAGS)).toBeTruthy();
    expect('[color(1)]'.match(RE_TAGS)).toBeTruthy();
    expect('[#ff00ff]'.match(RE_TAGS)).toBeTruthy();
    expect('[/]'.match(RE_TAGS)).toBeTruthy();
    expect('[@]'.match(RE_TAGS)).toBeTruthy();
    expect('[@foo]'.match(RE_TAGS)).toBeTruthy();
    expect('[@foo=bar]'.match(RE_TAGS)).toBeTruthy();
  });

  it('test_escape', () => {
    // Potential tags
    expect(escape('foo[bar]')).toBe(String.raw`foo\[bar]`);
    expect(escape(String.raw`foo\[bar]`)).toBe(String.raw`foo\\\[bar]`);

    // Not tags (escape not required)
    expect(escape('[5]')).toBe('[5]');
    expect(escape('\\[5]')).toBe('\\[5]');

    // Test @ escape
    expect(escape('[@foo]')).toBe('\\[@foo]');
    expect(escape('[@]')).toBe('\\[@]');

    // https://github.com/Textualize/rich/issues/2187
    expect(escape('[nil, [nil]]')).toBe(String.raw`[nil, \[nil]]`);
  });

  it('test_escape_backslash_end', () => {
    // https://github.com/Textualize/rich/issues/2987
    const value = 'C:\\';
    expect(escape(value)).toBe('C:\\\\');

    const escapedTags = `[red]${escape(value)}[/red]`;
    expect(escapedTags).toBe('[red]C:\\\\[/red]');
    const escapedText = Text.fromMarkup(escapedTags);
    expect(escapedText.plain).toBe('C:\\');
    expect(escapedText.spans).toEqual([new Span(0, 3, 'red')]);
  });

  it('test_render_escape', () => {
    const console = new Console({ width: 80, colorSystem: null });
    console.beginCapture();
    console.print(escape(String.raw`[red]`), escape(String.raw`\[red]`), escape(String.raw`\\[red]`), escape(String.raw`\\\[red]`));
    const result = console.endCapture();
    const expected = String.raw`[red] \[red] \\[red] \\\[red]` + '\n';
    expect(result).toBe(expected);
  });

  it('test_parse', () => {
    const result = Array.from(_parse(String.raw`[foo]hello[/foo][bar]world[/]\[escaped]`));
    const expected = [
      [0, null, new Tag('foo', null)],
      [10, 'hello', null],
      [10, null, new Tag('/foo', null)],
      [16, null, new Tag('bar', null)],
      [26, 'world', null],
      [26, null, new Tag('/', null)],
      [29, '[escaped]', null],
    ];
    expect(result).toEqual(expected);
  });

  it('test_parse_link', () => {
    const result = Array.from(_parse('[link=foo]bar[/link]'));
    const expected = [
      [0, null, new Tag('link', 'foo')],
      [13, 'bar', null],
      [13, null, new Tag('/link', null)],
    ];
    expect(result).toEqual(expected);
  });

  it('test_render', () => {
    const result = render('[bold]FOO[/bold]');
    expect(result.toString()).toBe('FOO');
    expect(result.spans).toEqual([new Span(0, 3, 'bold')]);
  });

  it('test_render_not_tags', () => {
    const result = render('[[1], [1,2,3,4], ["hello"], [None], [False], [True]] []');
    expect(result.toString()).toBe('[[1], [1,2,3,4], ["hello"], [None], [False], [True]] []');
    expect(result.spans).toEqual([]);
  });

  it('test_render_link', () => {
    const result = render('[link=foo]FOO[/link]');
    expect(result.toString()).toBe('FOO');
    expect(result.spans).toEqual([new Span(0, 3, 'link foo')]);
  });

  it('test_render_combine', () => {
    const result = render('[green]X[blue]Y[/blue]Z[/green]');
    expect(result.toString()).toBe('XYZ');
    expect(result.spans).toEqual([
      new Span(0, 3, 'green'),
      new Span(1, 2, 'blue'),
    ]);
  });

  it('test_render_overlap', () => {
    const result = render('[green]X[bold]Y[/green]Z[/bold]');
    expect(result.toString()).toBe('XYZ');
    expect(result.spans).toEqual([
      new Span(0, 2, 'green'),
      new Span(1, 3, 'bold'),
    ]);
  });

  it('test_adjoint', () => {
    const result = render('[red][blue]B[/blue]R[/red]');
    expect(result.spans).toEqual([new Span(0, 2, 'red'), new Span(0, 1, 'blue')]);
  });

  it('test_render_close', () => {
    const result = render('[bold]X[/]Y');
    expect(result.toString()).toBe('XY');
    expect(result.spans).toEqual([new Span(0, 1, 'bold')]);
  });

  it('test_render_close_ambiguous', () => {
    const result = render('[green]X[bold]Y[/]Z[/]');
    expect(result.toString()).toBe('XYZ');
    expect(result.spans).toEqual([new Span(0, 3, 'green'), new Span(1, 2, 'bold')]);
  });

  it('test_markup_error', () => {
    expect(() => render('foo[/]')).toThrow(MarkupError);
    expect(() => render('foo[/bar]')).toThrow(MarkupError);
    expect(() => render('[foo]hello[/bar]')).toThrow(MarkupError);
  });

  it('test_markup_escape', () => {
    const result = render('[dim white][url=[/]').toString();
    expect(result).toBe('[url=');
  });

  it('test_escape_escape', () => {
    // Escaped escapes (i.e. double backslash) should be treated as literal
    let result = render(String.raw`\\[bold]FOO`);
    expect(result.toString()).toBe(String.raw`\FOO`);

    // Single backslash makes the tag literal
    result = render(String.raw`\[bold]FOO`);
    expect(result.toString()).toBe('[bold]FOO');

    // Double backslash produces a backslash
    result = render(String.raw`\\[bold]some text[/]`);
    expect(result.toString()).toBe(String.raw`\some text`);

    // Triple backslash parsed as literal backslash plus escaped tag
    result = render(String.raw`\\\[bold]some text\[/]`);
    expect(result.toString()).toBe(String.raw`\[bold]some text[/]`);

    // Backslash escaping only happens when preceding a tag
    result = render(String.raw`\\`);
    expect(result.toString()).toBe(String.raw`\\`);

    result = render(String.raw`\\\\`);
    expect(result.toString()).toBe(String.raw`\\\\`);
  });

  it('test_events', () => {
    const result = render("[@click]Hello[/@click] [@click='view.toggle', 'left']World[/]");
    expect(result.toString()).toBe('Hello World');
  });

  it('test_events_broken', () => {
    expect(() => render('[@click=sdfwer(sfs)]foo[/]')).toThrow(MarkupError);
    expect(() => render("[@click='view.toggle]foo[/]")).toThrow(MarkupError);
  });

  it('test_render_meta', () => {
    const console = new Console();
    let text = render('foo[@click=close]bar[/]baz');
    expect(text.getStyleAtOffset(console, 3).meta).toEqual({ '@click': ['close', []] });

    text = render('foo[@click=close()]bar[/]baz');
    expect(text.getStyleAtOffset(console, 3).meta).toEqual({ '@click': ['close', []] });

    text = render("foo[@click=close('dialog')]bar[/]baz");
    expect(text.getStyleAtOffset(console, 3).meta).toEqual({
      '@click': ['close', ['dialog']],
    });

    text = render("foo[@click=close('dialog', 3)]bar[/]baz");
    expect(text.getStyleAtOffset(console, 3).meta).toEqual({
      '@click': ['close', ['dialog', 3]],
    });

    text = render('foo[@click=(1, 2, 3)]bar[/]baz');
    expect(text.getStyleAtOffset(console, 3).meta).toEqual({ '@click': [1, 2, 3] });
  });
});
